const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { validationResult } = require("express-validator");

const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error({ errors: errors.array() });
  }

  const { fullname, email, password, username } = req.body;

  const isUserAlreadyExists = await userModel.findOne({ email });
  if (isUserAlreadyExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const isUsernameUnavailible = await userModel.findOne({ username });
  if (isUsernameUnavailible) {
    res.status(400);
    throw new Error("Username already exists");
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.SALT) || 10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await userModel.create({
    fullname: {
      firstname: fullname.firstname,
      surname: fullname.surname,
    },
    email,
    password: hashedPassword,
    username,
  });

  const createdUser = await userModel
    .findById(user._id)
    .populate("pins.createdPins")
    .populate("pins.savedPins")
    .populate("boards")
    .populate({ path: "followers", select: "-password" })
    .populate({ path: "following", select: "-password" })
    .select("-password");

  if (user) {
    res.status(201).json({
      user: createdUser,
      token: generateJWTtoken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = await userModel
    .findOne({ email })
    .populate("pins.createdPins")
    .populate("pins.savedPins")
    .populate("boards")
    .populate({ path: "followers", select: "-password" })
    .populate({ path: "following", select: "-password" })
    .select("-password");

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      user,
      token: generateJWTtoken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await userModel
    .findById(req.user.id)
    .populate("pins.createdPins")
    .populate("pins.savedPins")
    .populate({
      path: "boards",
      populate: {
        path: "pins",
      },
    })
    .populate({ path: "followers", select: "-password" })
    .populate({ path: "following", select: "-password" })
    .select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ user });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel
    .findOne({ username: req.params.username })
    .populate("pins.createdPins")
    .populate("pins.savedPins")
    .populate("publicBoards")
    .populate({ path: "followers", select: "-password" })
    .populate({ path: "following", select: "-password" })
    .select("-password");

  if (!user) {
    res.status(400);
    throw new Error("No such user found");
  }

  res.status(200).json({ user });
});

const generateJWTtoken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "5d" });

const followUser = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized to follow a user");
  }

  const targetUser = await userModel.findById(req.params.userid);

  if (!targetUser) {
    res.status(400);
    throw new Error("No user found");
  }

  const fullname =
    `${targetUser.fullname.firstname} ${targetUser.fullname.surname}`.trim();

  const userId = user._id.toString();
  const userIndex = targetUser.followers.findIndex(
    (item) => item.toString() === userId
  );
  const targetUserId = targetUser._id.toString();
  const index = user.following.findIndex(
    (item) => item.toString() === targetUserId
  );

  if (index === -1) {
    user.following.push(targetUser._id);
    await user.save();
    targetUser.followers.push(user._id);
    await targetUser.save();
    res.status(200).json({ message: `You started following ${fullname}` });
  } else {
    user.following.splice(index, 1);
    await user.save();
    targetUser.followers.splice(userIndex, 1);
    await targetUser.save();
    res.status(200).json({ message: `Now you are not following ${fullname}` });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  followUser,
  getProfile,
};
