const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        required: true,
        minlength: [3, "First name must be at least 3 characters long"],
      },
      surname: {
        type: String,
        minlength: [3, "Surname must be at least 3 characters long"],
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username must contain only letters, numbers, and underscores",
      ],
      minlength: [3, "Username must be at least 3 characters long"],
    },
    bio: {
      type: String,
      maxlength: [160, "Bio must be at most 160 characters long"],
      default: " ",
    },
    profileImage: {
      type: String,
      default: "default.jpg",
    },
    pins: {
      createdPins: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "pin",
        },
      ],
      savedPins: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "pin",
        },
      ],
    },
    boards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "board",
      },
    ],
    publicBoards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "board",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
