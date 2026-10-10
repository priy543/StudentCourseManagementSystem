const { randomUUID } = require("node:crypto");
const mongoose = require("mongoose");

const courseModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    videoId: { type: String, trim: true },
    videoTitle: { type: String, trim: true },
    videoChannel: { type: String, trim: true },
    youtubeUrl: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  {
    _id: false,
    strict: false,
  }
);

const courseSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: randomUUID,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    courseCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    overview: {
      type: String,
      required: true,
      trim: true,
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    modules: {
      type: [courseModuleSchema],
      default: [],
      set: (modules) =>
        Array.isArray(modules)
          ? modules.map((module) =>
              typeof module === "string"
                ? { title: module }
                : module
            )
          : modules,
    },
  },
  {
    id: false,
    versionKey: false,
  }
);

module.exports = mongoose.model("Course", courseSchema);