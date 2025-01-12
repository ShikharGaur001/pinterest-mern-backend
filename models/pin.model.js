const mongoose = require("mongoose");

const pinSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    file: {
      fileid: {
        type: String,
        required: [true, "A pin must have an associated file"],
      },
      fileurl: {
        type: String,
        required: [true, "A pin must have the URL for the associated file"],
      },
      filetype: {
        type: String,
        required: [true, "A file type is required"],
        enum: ["image/jpeg", "image/png", "image/gif", "video/mp4", "audio/mpeg"], // Fix the enum to handle MIME types
        default: "image/jpeg",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    category: {
      type: String,
      enum: ["Art", "Photography", "DIY", "Food", "Fashion", "Travel", "Other"],
      default: "Other",
    },
    tags: {
      type: [String],
      default: [],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const pinModel = mongoose.model("pin", pinSchema);

module.exports = pinModel;
