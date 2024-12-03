// File path : code_tutor2/backend/src/models/User.model.js

import mongoose from "mongoose";
import logger from "../services/backendLogger.js";

// Authentication provider constants
const USER_PROVIDERS = {
  GITHUB: "github", // GitHub OAuth authentication
  LOCAL: "local",   // Local username/password authentication
};

// Define the user schema with validation and indexing
const userSchema = new mongoose.Schema(
  {
    // Username field with uniqueness and length constraints
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [50, "Username cannot exceed 50 characters"],
      index: {
        unique: true,
        name: "idx_username",
        background: true,
        collation: { locale: "en", strength: 2 }, // Case-insensitive index for better search
      },
    },
    // Email field with validation and sparse indexing
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: {
        unique: true,
        sparse: true, // Allows null values while maintaining uniqueness
        name: "idx_email",
        background: true,
      },
      validate: {
        validator: function (v) {
          return (
            v === null ||
            v === undefined ||
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          );
        },
        message: "Invalid email format",
      },
    },
    // GitHub user ID for OAuth authentication
    githubId: {
      type: String,
      trim: true,
      index: {
        unique: true,
        sparse: true,
        name: "idx_github_id",
        background: true,
      },
    },
    // User's display name for UI purposes
    displayName: {
      type: String,
      trim: true,
      maxlength: [100, "Display name cannot exceed 100 characters"],
    },
    // URL to user's avatar image
    avatarUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return v === null || v === undefined || /^https?:\/\/.+/.test(v);
        },
        message: "Invalid avatar URL format",
      },
    },
    // Authentication provider type
    provider: {
      type: String,
      required: [true, "Provider is required"],
      enum: Object.values(USER_PROVIDERS),
      default: USER_PROVIDERS.LOCAL,
    },
    // Last login timestamp with TTL index for inactive user cleanup
    lastLogin: {
      type: Date,
      default: Date.now,
      index: {
        name: "idx_last_login",
        background: true,
        expireAfterSeconds: 365 * 24 * 60 * 60, // Auto-delete users after 1 year of inactivity
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    collection: "users",
    toJSON: {
      transform: (doc, ret) => {
        const { password, __v, ...user } = ret;
        return user; // Exclude sensitive data from JSON output
      },
    },
    toObject: { virtuals: true }, // Enable virtual properties
  }
);

// Virtual property to determine if user is authenticated via GitHub
userSchema.virtual("isGithubUser").get(function () {
  return this.provider === USER_PROVIDERS.GITHUB;
});

// Method to update user's last login time and log the action
userSchema.methods.updateLastLogin = async function () {
  try {
    this.lastLogin = new Date();
    await this.save();
    logger.debug("User", "Updated last login", {
      userId: this._id,
      username: this.username,
    });
  } catch (error) {
    logger.error("User", "Failed to update last login", {
      userId: this._id,
      username: this.username,
      error: error.message,
    });
    throw error;
  }
};

// Static method to find users by their authentication provider
userSchema.statics.findByProvider = function (provider) {
  return this.find({ provider }).select("-__v");
};

// Static method to find a single user by their username
userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username }).select("-__v");
};

// Pre-save middleware for logging user creation and updates
userSchema.pre("save", function (next) {
  if (this.isNew) {
    logger.info("User", "Creating new user", {
      username: this.username,
      provider: this.provider,
    });
  } else if (this.isModified()) {
    const modifiedPaths = this.modifiedPaths().join(", ");
    logger.debug("User", "Updating user", {
      userId: this._id,
      username: this.username,
      modifiedFields: modifiedPaths,
    });
  }
  next();
});

// Error handling middleware for duplicate key violations
userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    next(new Error(`${field} already exists`));
  } else {
    next(error);
  }
});

// Export authentication provider constants
export { USER_PROVIDERS };

// Create and export the User model
const User = mongoose.model("User", userSchema);
export default User;
