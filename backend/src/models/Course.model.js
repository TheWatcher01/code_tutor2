// File path : code_tutor2/backend/src/models/Course.model.js

import mongoose from "mongoose";
import logger from "../services/backendLogger.js";

// Define course difficulty levels for better organization and filtering
const COURSE_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate", 
  ADVANCED: "advanced",
};

// Define supported content types that can be included in course modules
const CONTENT_TYPES = {
  TEXT: "text",
  VIDEO: "video",
  EXERCISE: "exercise",
  QUIZ: "quiz",
};

// Schema for individual content items within a course
const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Content title is required"],
      trim: true,
      maxlength: [200, "Content title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Content description is required"], 
      trim: true,
      maxlength: [2000, "Content description cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      required: [true, "Content type is required"],
      enum: Object.values(CONTENT_TYPES),
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Flexible data field to store different content types
      required: [true, "Content data is required"],
    },
    order: {
      type: Number,
      required: [true, "Content order is required"],
      min: [0, "Order must be a non-negative number"],
    },
  },
  { _id: false } // Disable automatic _id generation for subdocuments
);

// Main course schema definition with comprehensive course details
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [3, "Course title must be at least 3 characters long"],
      maxlength: [100, "Course title cannot exceed 100 characters"],
      index: {
        name: "idx_title",
        background: true,
      },
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      minlength: [10, "Course description must be at least 10 characters long"],
      maxlength: [5000, "Course description cannot exceed 5000 characters"],
    },
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Professor is required"],
      index: {
        name: "idx_professor",
        background: true,
      },
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        validate: {
          // Validate that referenced students exist in the database
          validator: async function (studentId) {
            if (this.isNew) return true;
            const User = mongoose.model("User");
            const user = await User.findById(studentId);
            return user != null;
          },
          message: "Student not found",
        },
      },
    ],
    level: {
      type: String,
      enum: Object.values(COURSE_LEVELS),
      required: [true, "Course level is required"],
      index: {
        name: "idx_level",
        background: true,
      },
    },
    topics: [
      {
        type: String,
        required: [true, "Topics are required"],
        trim: true,
        minlength: [2, "Topic must be at least 2 characters long"],
        maxlength: [50, "Topic cannot exceed 50 characters"],
      },
    ],
    content: [contentSchema], // Array of course content items
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      max: [1440, "Duration cannot exceed 24 hours (1440 minutes)"],
      index: {
        name: "idx_duration",
        background: true,
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: {
        name: "idx_published",
        background: true,
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    collection: "courses",
    toJSON: {
      transform: (doc, ret) => {
        const { __v, ...course } = ret;
        return course;
      },
      virtuals: true,
    },
    toObject: { virtuals: true },
  }
);

// Create text search index with weighted fields for better search results
courseSchema.index(
  { title: "text", description: "text", topics: "text" },
  {
    name: "idx_full_text_search",
    weights: {
      title: 3,
      description: 2,
      topics: 1,
    },
    background: true,
  }
);

// Compound indexes for optimizing common queries
courseSchema.index(
  { isPublished: 1, level: 1 },
  {
    name: "idx_published_level",
    background: true,
  }
);

courseSchema.index(
  { professor: 1, isPublished: 1 },
  {
    name: "idx_professor_published",
    background: true,
  }
);

courseSchema.index(
  { students: 1, isPublished: 1 },
  {
    name: "idx_students_published",
    background: true,
  }
);

// Virtual properties for computed values
courseSchema.virtual("studentCount").get(function () {
  return this.students?.length || 0;
});

courseSchema.virtual("status").get(function () {
  return this.isPublished ? "published" : "draft";
});

courseSchema.virtual("contentCount").get(function () {
  return this.content?.length || 0;
});

// Method to safely add a student to the course
courseSchema.methods.addStudent = async function (studentId) {
  try {
    if (!this.students.includes(studentId)) {
      const User = mongoose.model("User");
      const student = await User.findById(studentId);

      if (!student) {
        throw new Error("Student not found");
      }

      this.students.push(studentId);
      await this.save();

      logger.info("Course", "Student added to course", {
        courseId: this._id,
        courseTitle: this.title,
        studentId: studentId,
      });

      return true;
    }
    return false;
  } catch (error) {
    logger.error("Course", "Failed to add student to course", {
      courseId: this._id,
      courseTitle: this.title,
      studentId: studentId,
      error: error.message,
    });
    throw error;
  }
};

// Method to safely remove a student from the course
courseSchema.methods.removeStudent = async function (studentId) {
  try {
    const index = this.students.indexOf(studentId);
    if (index > -1) {
      this.students.splice(index, 1);
      await this.save();

      logger.info("Course", "Student removed from course", {
        courseId: this._id,
        courseTitle: this.title,
        studentId: studentId,
      });

      return true;
    }
    return false;
  } catch (error) {
    logger.error("Course", "Failed to remove student from course", {
      courseId: this._id,
      courseTitle: this.title,
      studentId: studentId,
      error: error.message,
    });
    throw error;
  }
};

// Middleware to log course creation and updates
courseSchema.pre("save", function (next) {
  if (this.isNew) {
    logger.info("Course", "Creating new course", {
      title: this.title,
      professor: this.professor,
      level: this.level,
    });
  } else if (this.isModified()) {
    const modifiedPaths = this.modifiedPaths().join(", ");
    logger.debug("Course", "Updating course", {
      courseId: this._id,
      title: this.title,
      modifiedFields: modifiedPaths,
    });
  }
  next();
});

// Error handling middleware for duplicate course entries
courseSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("Duplicate course entry"));
  } else {
    next(error);
  }
});

// Static method to find all published courses
courseSchema.statics.findPublished = function () {
  return this.find({ isPublished: true })
    .select("-content")
    .populate("professor", "username displayName");
};

// Static method to find courses by professor
courseSchema.statics.findByProfessor = function (professorId) {
  return this.find({ professor: professorId })
    .select("-content")
    .sort("-createdAt");
};

// Static method to find courses by difficulty level
courseSchema.statics.findByLevel = function (level) {
  return this.find({
    level,
    isPublished: true,
  })
    .select("title description level duration")
    .populate("professor", "username displayName");
};

// Static method to find most popular courses based on student count
courseSchema.statics.findPopular = function (limit = 10) {
  return this.aggregate([
    { $match: { isPublished: true } },
    { $addFields: { studentCount: { $size: "$students" } } },
    { $sort: { studentCount: -1 } },
    { $limit: limit },
    {
      $project: {
        title: 1,
        description: 1,
        level: 1,
        studentCount: 1,
        topics: 1,
      },
    },
  ]);
};

// Export constants and model
export const LEVELS = COURSE_LEVELS;
export const TYPES = CONTENT_TYPES;

const Course = mongoose.model("Course", courseSchema);
export default Course;
