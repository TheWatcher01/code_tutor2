// File path : code_tutor2/backend/src/models/User.model.js

import mongoose from "mongoose";
import logger from "../services/backendLogger.js";

// Available authentication providers
const USER_PROVIDERS = {
  GITHUB: "github",
  LOCAL: "local",
};

const userSchema = new mongoose.Schema(
  {
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
        collation: { locale: "en", strength: 2 }, // Case-insensitive index
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: {
        unique: true,
        sparse: true,
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
    displayName: {
      type: String,
      trim: true,
      maxlength: [100, "Display name cannot exceed 100 characters"],
    },
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
    provider: {
      type: String,
      required: [true, "Provider is required"],
      enum: Object.values(USER_PROVIDERS),
      default: USER_PROVIDERS.LOCAL,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
      index: {
        name: "idx_last_login",
        background: true,
        expireAfterSeconds: 365 * 24 * 60 * 60, // Expire after 1 year of inactivity
      },
    },
  },
  {
    timestamps: true,
    collection: "users",
    toJSON: {
      transform: (doc, ret) => {
        const { password, __v, ...user } = ret;
        return user;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual property to check if user authenticated through GitHub
userSchema.virtual("isGithubUser").get(function () {
  return this.provider === USER_PROVIDERS.GITHUB;
});

// Update user's last login timestamp
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

// Find users by authentication provider
userSchema.statics.findByProvider = function (provider) {
  return this.find({ provider }).select("-__v");
};

// Find a user by their username
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

// Handle duplicate key errors during save operations
userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    next(new Error(`${field} already exists`));
  } else {
    next(error);
  }
});

// Export constants
export { USER_PROVIDERS };

// Create and export model
const User = mongoose.model("User", userSchema);
export default User;
