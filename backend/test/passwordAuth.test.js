const assert = require("node:assert/strict");
const { createHash, randomBytes } = require("node:crypto");
const { after, before, test } = require("node:test");
const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");

const authRoutes = require("../routes/authRoutes");
const passwordResetMailer = require("../services/passwordResetMailer");
const Student = require("../models/Student");

const testSecret = randomBytes(32).toString("hex");
const sentResetTokens = [];
let mongoServer;
let resetMailerWasConfigured;
let sendPasswordResetEmail;

const app = express();
app.use(express.json());
app.use("/api/v1/auth", authRoutes);

function createToken(student) {
  return jwt.sign(
    {
      id: student._id.toString(),
      email: student.email,
      role: student.role,
      authVersion: student.authVersion || 0
    },
    testSecret,
    {
      expiresIn: "1h",
      issuer: "student-course-management"
    }
  );
}

async function seedStudent(email, role = "student") {
  return Student.create({
    name: "Test Account",
    email,
    password: await bcrypt.hash("OriginalPassword123", 12),
    department: "Testing",
    course: "Testing",
    role
  });
}

before(async () => {
  process.env.JWT_SECRET = testSecret;
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  resetMailerWasConfigured = passwordResetMailer.isConfigured;
  sendPasswordResetEmail = passwordResetMailer.sendPasswordResetEmail;
  passwordResetMailer.isConfigured = () => true;
  passwordResetMailer.sendPasswordResetEmail = async (email, token) => {
    sentResetTokens.push({ email, token });
  };
});

after(async () => {
  passwordResetMailer.isConfigured = resetMailerWasConfigured;
  passwordResetMailer.sendPasswordResetEmail = sendPasswordResetEmail;
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("forgot password gives the same generic response for known and unknown emails", async () => {
  const student = await seedStudent("known@example.test");
  sentResetTokens.length = 0;

  const knownResponse = await request(app)
    .post("/api/v1/auth/forgot-password")
    .send({ email: student.email });
  const unknownResponse = await request(app)
    .post("/api/v1/auth/forgot-password")
    .send({ email: "unknown@example.test" });

  assert.equal(knownResponse.status, 200);
  assert.deepEqual(knownResponse.body, unknownResponse.body);
  assert.equal(sentResetTokens.length, 1);
});

test("forgot password stores only a hash and assigns an expiry", async () => {
  const student = await seedStudent("hash-check@example.test");
  sentResetTokens.length = 0;

  await request(app)
    .post("/api/v1/auth/forgot-password")
    .send({ email: student.email })
    .expect(200);

  const { token } = sentResetTokens[0];
  assert.equal(token.length, 64);

  const savedStudent = await Student.findById(student._id).select(
    "+passwordResetTokenHash +passwordResetExpires"
  );
  assert.equal(
    savedStudent.passwordResetTokenHash,
    createHash("sha256").update(token).digest("hex")
  );
  assert.notEqual(savedStudent.passwordResetTokenHash, token);
  assert.ok(savedStudent.passwordResetExpires > new Date());
});

test("expired reset tokens cannot change passwords", async () => {
  const student = await seedStudent("expired@example.test");
  sentResetTokens.length = 0;

  await request(app)
    .post("/api/v1/auth/forgot-password")
    .send({ email: student.email })
    .expect(200);

  const { token } = sentResetTokens[0];
  await Student.updateOne(
    { _id: student._id },
    { $set: { passwordResetExpires: new Date(Date.now() - 1000) } }
  );

  await request(app)
    .post("/api/v1/auth/reset-password")
    .send({ token, newPassword: "ReplacementPassword123" })
    .expect(400);

  const savedStudent = await Student.findById(student._id).select("+password");
  assert.equal(
    await bcrypt.compare("OriginalPassword123", savedStudent.password),
    true
  );
});

test("reset tokens are single-use, passwords are hashed, roles are preserved, and old JWTs expire", async () => {
  const student = await seedStudent("admin-reset@example.test", "admin");
  const oldToken = createToken(student);
  sentResetTokens.length = 0;

  await request(app)
    .post("/api/v1/auth/forgot-password")
    .send({ email: student.email })
    .expect(200);

  const { token } = sentResetTokens[0];
  const resetResponse = await request(app)
    .post("/api/v1/auth/reset-password")
    .send({ token, newPassword: "ReplacementPassword123" })
    .expect(200);

  assert.match(resetResponse.body.message, /sign in again/i);
  await request(app)
    .post("/api/v1/auth/reset-password")
    .send({ token, newPassword: "AnotherPassword123" })
    .expect(400);

  const updatedStudent = await Student.findById(student._id).select(
    "+password +passwordResetTokenHash +passwordResetExpires"
  );
  assert.equal(
    await bcrypt.compare("ReplacementPassword123", updatedStudent.password),
    true
  );
  assert.notEqual(updatedStudent.password, "ReplacementPassword123");
  assert.equal(updatedStudent.role, "admin");
  assert.equal(updatedStudent.authVersion, 1);
  assert.equal(updatedStudent.passwordResetTokenHash, undefined);
  assert.equal(updatedStudent.passwordResetExpires, undefined);

  await request(app)
    .post("/api/v1/auth/change-password")
    .set("Authorization", `Bearer ${oldToken}`)
    .send({
      currentPassword: "ReplacementPassword123",
      newPassword: "AnotherPassword123"
    })
    .expect(401);
});

test("password change requires authentication and rejects a wrong current password", async () => {
  const student = await seedStudent("change-password@example.test");
  await Student.collection.updateOne(
    { _id: student._id },
    { $unset: { authVersion: "" } }
  );
  const token = createToken(student);

  await request(app)
    .post("/api/v1/auth/change-password")
    .send({
      currentPassword: "OriginalPassword123",
      newPassword: "ReplacementPassword123"
    })
    .expect(401);

  await request(app)
    .post("/api/v1/auth/change-password")
    .set("Authorization", `Bearer ${token}`)
    .send({
      currentPassword: "WrongCurrentPassword",
      newPassword: "ReplacementPassword123"
    })
    .expect(400);

  let savedStudent = await Student.findById(student._id).select("+password");
  assert.equal(
    await bcrypt.compare("OriginalPassword123", savedStudent.password),
    true
  );

  await request(app)
    .post("/api/v1/auth/change-password")
    .set("Authorization", `Bearer ${token}`)
    .send({
      currentPassword: "OriginalPassword123",
      newPassword: "ReplacementPassword123",
      id: "another-user",
      role: "admin"
    })
    .expect(200);

  savedStudent = await Student.findById(student._id).select("+password");
  assert.equal(savedStudent.role, "student");
  assert.equal(savedStudent.authVersion, 1);
  assert.equal(
    await bcrypt.compare("ReplacementPassword123", savedStudent.password),
    true
  );

  await request(app)
    .post("/api/v1/auth/change-password")
    .set("Authorization", `Bearer ${token}`)
    .send({
      currentPassword: "ReplacementPassword123",
      newPassword: "AnotherPassword123"
    })
    .expect(401);
});

test("forgot-password requests are rate-limited per client IP", async () => {
  app.set("trust proxy", 1);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await request(app)
      .post("/api/v1/auth/forgot-password")
      .set("X-Forwarded-For", "192.0.2.42")
      .send({ email: "unknown-rate-limit@example.test" })
      .expect(200);
  }

  await request(app)
    .post("/api/v1/auth/forgot-password")
    .set("X-Forwarded-For", "192.0.2.42")
    .send({ email: "unknown-rate-limit@example.test" })
    .expect(429);
});
