const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

mongoose.set("autoIndex", false);

const Course = require("../models/Course");

const TARGET_DATABASE = "student_course_db";
const SOURCE_FILE = path.resolve(__dirname, "../../../mock-api/db.json");
const COURSE_FIELDS = [
  "id",
  "courseName",
  "courseCode",
  "instructor",
  "duration",
  "level",
  "category",
  "image",
  "status",
  "overview",
  "learningOutcomes",
  "modules",
];
const COURSE_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

class MigrationConflictError extends Error {
  constructor(course, reason) {
    super(`Conflict for course id '${course.id}' and code '${course.courseCode}': ${reason}`);
    this.name = "MigrationConflictError";
  }
}

function normalizeForComparison(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeForComparison);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalizeForComparison(value[key])])
    );
  }

  return value;
}

function hasSameCourseData(sourceCourse, existingCourse) {
  const existingFields = Object.fromEntries(
    Object.entries(existingCourse).filter(
      ([field]) => field !== "_id" && field !== "__v"
    )
  );

  return (
    JSON.stringify(normalizeForComparison(sourceCourse)) ===
    JSON.stringify(normalizeForComparison(existingFields))
  );
}

async function readAndValidateSource() {
  const parsed = JSON.parse(fs.readFileSync(SOURCE_FILE, "utf8"));
  const courses = parsed?.courses;

  if (!Array.isArray(courses) || courses.length !== 4) {
    throw new Error("Expected exactly four source courses in mock-api/db.json.");
  }

  const ids = new Set();
  const courseCodes = new Set();

  for (const [index, course] of courses.entries()) {
    if (!course || typeof course !== "object" || Array.isArray(course)) {
      throw new Error(`Source course at index ${index} must be an object.`);
    }

    const sourceFields = Object.keys(course).sort();
    const expectedFields = [...COURSE_FIELDS].sort();
    if (JSON.stringify(sourceFields) !== JSON.stringify(expectedFields)) {
      throw new Error(
        `Source course at index ${index} has missing or unsupported top-level fields.`
      );
    }

    if (typeof course.id !== "string" || !COURSE_ID_PATTERN.test(course.id)) {
      throw new Error(`Source course at index ${index} has an invalid string id.`);
    }

    if (ids.has(course.id)) {
      throw new Error(`Duplicate source course id '${course.id}'.`);
    }
    ids.add(course.id);

    if (typeof course.courseCode !== "string" || !course.courseCode.trim()) {
      throw new Error(`Source course '${course.id}' has an invalid courseCode.`);
    }

    if (courseCodes.has(course.courseCode)) {
      throw new Error(`Duplicate source courseCode '${course.courseCode}'.`);
    }
    courseCodes.add(course.courseCode);

    const modelCourse = new Course(course);
    await modelCourse.validate();

    if (!hasSameCourseData(course, modelCourse.toObject())) {
      throw new Error(
        `The Course model would alter source fields for course '${course.id}'.`
      );
    }
  }

  return courses;
}

function getConfiguredMongoUri() {
  const envPath = path.resolve(__dirname, "../.env");
  dotenv.config({ path: envPath, quiet: true });

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured in backend/.env or the process environment.");
  }

  let parsedUri;
  try {
    parsedUri = new URL(mongoUri);
  } catch {
    throw new Error("MONGO_URI is not a valid MongoDB URL.");
  }

  const uriDatabase = decodeURIComponent(
    parsedUri.pathname.replace(/^\/+/, "").split("/")[0]
  );
  const queryDatabase = parsedUri.searchParams.get("dbName");

  if (
    uriDatabase !== TARGET_DATABASE ||
    (queryDatabase && queryDatabase !== TARGET_DATABASE)
  ) {
    throw new Error(
      `Refusing to connect: backend/.env must resolve to '${TARGET_DATABASE}'.`
    );
  }

  return mongoUri;
}

async function connectToTargetDatabase() {
  const mongoUri = getConfiguredMongoUri();
  await mongoose.connect(mongoUri, { autoIndex: false });

  const connectedDatabase = mongoose.connection.db.databaseName;
  if (connectedDatabase !== TARGET_DATABASE) {
    await mongoose.disconnect();
    throw new Error(
      `Refusing to write: connected to '${connectedDatabase}', not '${TARGET_DATABASE}'.`
    );
  }

  return connectedDatabase;
}

async function assertUniqueIndexes() {
  const indexes = await Course.collection.indexes();

  for (const field of ["id", "courseCode"]) {
    const hasUniqueIndex = indexes.some(
      (index) =>
        index.unique === true &&
        Object.keys(index.key).length === 1 &&
        index.key[field] === 1
    );

    if (!hasUniqueIndex) {
      throw new Error(
        `Required unique index on '${field}' is missing; no courses were inserted.`
      );
    }
  }
}

async function inspectUniqueIndexes() {
  try {
    const indexes = await Course.collection.indexes();
    const result = {};

    for (const field of ["id", "courseCode"]) {
      result[field] = indexes.some(
        (index) =>
          index.unique === true &&
          Object.keys(index.key).length === 1 &&
          index.key[field] === 1
      )
        ? "present"
        : "missing";
    }

    return result;
  } catch (error) {
    return {
      id: "unverified",
      courseCode: "unverified",
      reason: safeErrorMessage(error),
    };
  }
}

async function inspectCourseForPreflight(course) {
  const matches = await Course.collection
    .find({
      $or: [{ id: course.id }, { courseCode: course.courseCode }],
    })
    .toArray();

  if (matches.length === 0) {
    return {
      id: course.id,
      courseCode: course.courseCode,
      status: "no collision",
    };
  }

  if (
    matches.length === 1 &&
    matches[0].id === course.id &&
    matches[0].courseCode === course.courseCode &&
    hasSameCourseData(course, matches[0])
  ) {
    return {
      id: course.id,
      courseCode: course.courseCode,
      status: "identical existing record",
    };
  }

  return {
    id: course.id,
    courseCode: course.courseCode,
    status: "conflict",
    matchingRecords: matches.length,
  };
}

async function runReadOnlyPreflight(courses) {
  const mongoUri = getConfiguredMongoUri();
  const parsedUri = new URL(mongoUri);
  const uriDatabase = decodeURIComponent(
    parsedUri.pathname.replace(/^\/+/, "").split("/")[0]
  );

  if (uriDatabase !== TARGET_DATABASE) {
    throw new Error(`Preflight refused: URI database must be '${TARGET_DATABASE}'.`);
  }

  await mongoose.connect(mongoUri, { autoIndex: false });

  try {
    const connectedDatabase = mongoose.connection.db.databaseName;
    if (connectedDatabase !== TARGET_DATABASE) {
      throw new Error(
        `Preflight refused: connected database is '${connectedDatabase}', not '${TARGET_DATABASE}'.`
      );
    }

    const uniqueIndexes = await inspectUniqueIndexes();
    const courseComparisons = [];

    for (const course of courses) {
      courseComparisons.push(await inspectCourseForPreflight(course));
    }

    let transactionSupport;
    try {
      const hello = await mongoose.connection.db.admin().command({ hello: 1 });
      transactionSupport = hello.setName || hello.msg === "isdbgrid"
        ? "supported"
        : "not supported";
    } catch (error) {
      transactionSupport = {
        status: "unverified",
        reason: safeErrorMessage(error),
      };
    }

    return {
      mode: "read-only preflight",
      uriDatabase,
      connectedDatabase,
      uniqueIndexes,
      courseComparisons,
      transactionSupport,
      writesPerformed: false,
    };
  } finally {
    await mongoose.disconnect();
  }
}

async function inspectCourseCollision(course, session) {
  const filter = {
    $or: [{ id: course.id }, { courseCode: course.courseCode }],
  };
  const options = session ? { session } : {};
  const matches = await Course.collection.find(filter, options).toArray();

  if (matches.length === 0) {
    return "insert";
  }

  if (
    matches.length === 1 &&
    matches[0].id === course.id &&
    matches[0].courseCode === course.courseCode &&
    hasSameCourseData(course, matches[0])
  ) {
    return "skip";
  }

  throw new MigrationConflictError(
    course,
    "an existing id or courseCode belongs to different course data"
  );
}

async function revalidateSourceCourse(course) {
  const currentCourses = await readAndValidateSource();
  const currentCourse = currentCourses.find(
    (sourceCourse) => sourceCourse.id === course.id
  );

  if (!currentCourse || !hasSameCourseData(course, currentCourse)) {
    throw new Error(
      `Source course '${course.id}' changed during migration; stopping before insertion.`
    );
  }

  return currentCourse;
}

async function buildMigrationPlan(courses, session) {
  const plan = { toInsert: [], skippedIds: [] };

  for (const course of courses) {
    const result = await inspectCourseCollision(course, session);
    if (result === "skip") {
      plan.skippedIds.push(course.id);
    } else {
      plan.toInsert.push(course);
    }
  }

  return plan;
}

async function migrateWithTransaction(courses) {
  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const plan = await buildMigrationPlan(courses, session);
      const insertedIds = [];
      const skippedIds = [...plan.skippedIds];

      for (const course of plan.toInsert) {
        const currentSourceCourse = await revalidateSourceCourse(course);
        const latestCheck = await inspectCourseCollision(
          currentSourceCourse,
          session
        );
        if (latestCheck === "skip") {
          skippedIds.push(course.id);
          continue;
        }

        const document = new Course(currentSourceCourse);
        await document.save({ session });
        insertedIds.push(course.id);
      }

      result = { insertedIds, skippedIds };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

async function rollbackCurrentRun(insertedDocuments) {
  const failures = [];

  for (const inserted of [...insertedDocuments].reverse()) {
    try {
      await Course.collection.deleteOne({
        _id: inserted._id,
        id: inserted.id,
        courseCode: inserted.courseCode,
      });
    } catch (error) {
      failures.push({ id: inserted.id, message: error.message });
    }
  }

  return failures;
}

async function migrateWithoutTransaction(courses) {
  const plan = await buildMigrationPlan(courses);
  const insertedDocuments = [];
  const insertedIds = [];
  const skippedIds = [...plan.skippedIds];
  let pendingInsertId = null;

  try {
    for (const course of plan.toInsert) {
      const currentSourceCourse = await revalidateSourceCourse(course);
      const latestCheck = await inspectCourseCollision(currentSourceCourse);
      if (latestCheck === "skip") {
        skippedIds.push(course.id);
        continue;
      }

      const document = new Course(currentSourceCourse);
      pendingInsertId = course.id;
      await document.save();
      insertedDocuments.push({
        _id: document._id,
        id: document.id,
        courseCode: document.courseCode,
      });
      insertedIds.push(course.id);
      pendingInsertId = null;
    }
  } catch (error) {
    const rollbackFailures = await rollbackCurrentRun(insertedDocuments);
    const failedRollbackIds = rollbackFailures.map((failure) => failure.id);
    const rollbackSummary = [
      rollbackFailures.length
        ? `Rollback was incomplete for IDs: ${failedRollbackIds.join(", ")}. Inspect before retrying.`
        : `Rolled back only acknowledged inserts from this run (${insertedDocuments
            .map((document) => document.id)
            .join(", ") || "none"}); pre-existing records were not targeted.`,
      pendingInsertId
        ? `The outcome for course id '${pendingInsertId}' is unconfirmed and it was not rolled back; inspect it before retrying.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    throw new Error(`${error.message} ${rollbackSummary}`);
  }

  return { insertedIds, skippedIds };
}

async function runMigration(courses) {
  const databaseName = await connectToTargetDatabase();

  try {
    await assertUniqueIndexes();

    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    const transactionSupported = Boolean(hello.setName || hello.msg === "isdbgrid");
    const result = transactionSupported
      ? await migrateWithTransaction(courses)
      : await migrateWithoutTransaction(courses);

    return { databaseName, transactionSupported, ...result };
  } finally {
    await mongoose.disconnect();
  }
}

async function main() {
  const mode = process.argv[2] || "--validate-only";
  if (!["--validate-only", "--preflight", "--apply"].includes(mode)) {
    throw new Error("Use --validate-only, --preflight, or --apply.");
  }

  const courses = await readAndValidateSource();

  if (mode === "--validate-only") {
    console.log(
      `Validated ${courses.length} source courses, IDs, course codes, schema fields, and model-preserved data. No database connection or writes were made.`
    );
    console.log(`Source IDs: ${courses.map((course) => course.id).join(", ")}`);
    return;
  }

  if (mode === "--preflight") {
    const result = await runReadOnlyPreflight(courses);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const result = await runMigration(courses);
  console.log(`Migration target: ${result.databaseName}`);
  console.log(`Transaction support: ${result.transactionSupported}`);
  console.log(`Inserted IDs: ${result.insertedIds.join(", ") || "none"}`);
  console.log(`Skipped identical IDs: ${result.skippedIds.join(", ") || "none"}`);

  if (!result.transactionSupported) {
    console.warn(
      "Transactions are unavailable. On failure, rollback targets only candidate documents created by this run using their generated MongoDB _id plus source id and courseCode; pre-existing records are never targeted."
    );
  }
}

function safeErrorMessage(error) {
  return String(error?.message || error).replace(
    /mongodb(?:\+srv)?:\/\/[^\s'"]+/gi,
    "[redacted MongoDB URI]"
  );
}

main().catch((error) => {
  console.error(`Migration stopped: ${safeErrorMessage(error)}`);
  process.exitCode = 1;
});