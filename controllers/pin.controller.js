const asyncHandler = require("express-async-handler");
const pinModel = require("../models/pin.model");
const { validationResult } = require("express-validator");
const userModel = require("../models/user.model");
const boardModel = require("../models/board.model");
const commentModel = require("../models/comment.model");

const createPin = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(JSON.stringify({ errors: errors.array() }));
  }

  const { title, description, file, category, tags } = req.body;

  const user = await userModel.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("Not Authorized to create a Pin");
  }

  const pin = await pinModel.create({
    title: title || "",
    description: description || "",
    file: {
      filename: file.filename,
      filetype: file.filetype,
    },
    createdBy: user._id,
    category: category || "Other",
    tags: tags || [],
  });

  user.pins.createdPins.push(pin._id);
  await user.save();

  if (pin) {
    res.status(201).json({ pin });
  } else {
    res.status(400);
    throw new Error("Invalid pin data");
  }
});

const getPins = asyncHandler(async (req, res) => {
  const pins = await pinModel.find().populate({
    path: "createdBy",
    select: "-password"
  })
  res.status(200).json({ pins });
});

const getSavedPins = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id).populate("pins.savedPins");
  res.status(200).json(user.pins.savedPins);
});

const getCreatedPins = asyncHandler(async (req, res) => {
  const user = await userModel
    .findById(req.user.id)
    .populate("pins.createdPins");
  res.status(200).json(user.pins.createdPins);
});

const updatePin = asyncHandler(async (req, res) => {
  const { title, description, category, tags } = req.body;

  const pin = await pinModel.findByIdAndUpdate(
    req.params.pinid,
    {
      title: title || "",
      description: description || "",
      category: category || "Other",
      tags: tags || [],
    },
    { new: true }
  );

  if (pin) {
    res.status(200).json({ pin });
  } else {
    res.status(400);
    throw new Error("Invalid pin data");
  }
});

const deletePin = asyncHandler(async (req, res) => {
  const pin = await pinModel.findByIdAndDelete(req.params.pinid);

  if (pin) {
    res.status(200).json({ message: "Deleted pin successfully" });
  } else {
    res.status(400);
    throw new Error(`No pin exists with this id ${req.params.pinid}`);
  }
});

const savePin = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);

  const pin = await pinModel.findById(req.params.pinid);

  if (!user) {
    res.status(401);
    throw new Error("User Unauthorized");
  }

  if (!pin) {
    res.status(400);
    throw new Error(`The pin with id ${req.params.pinid} does not exists`);
  }

  if (user.pins.savedPins.includes(pin._id)) {
    res.status(409);
    throw new Error("You have already saved this pin");
  } else {
    const { boardid } = req.body;

    if (boardid !== undefined) {
      const board = await boardModel.findById(boardid);

      if (board && user.boards.includes(boardid)) {
        board.pins.push(pin._id);
        await board.save();
      } else {
        res.status(400);
        throw new Error(`No board exists with id ${boardid}`);
      }
    }

    user.pins.savedPins.push(pin._id);
    await user.save();
    pin.savedBy.push(user._id);
    await pin.save();

    res.status(200).json({ message: "Pin saved successfully" });
  }
});

const createComment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(JSON.stringify({ errors: errors.array() }));
  }

  const user = await userModel.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized to comment a pin");
  }

  const pin = await pinModel.findById(req.params.pinid);

  if (!pin) {
    res.status(400);
    throw new Error("May be the pin you're looking for has been deleted");
  }

  const { text, image } = req.body;

  const comment = await commentModel.create({
    text,
    createdBy: user._id,
    pin,
    image: image || "",
  });

  if (comment) {
    pin.comments.push(comment._id);
    await pin.save();
    res.status(201).json({ comment });
  } else {
    res.status(400);
    throw new Error("Invalid comment data");
  }
});

const replyComment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(JSON.stringify({ errors: errors.array() }));
  }

  const user = await userModel.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized to comment a pin");
  }

  const pin = await pinModel.findById(req.params.pinid);

  if (!pin) {
    res.status(400);
    throw new Error("May be the pin you're looking for has been deleted");
  }

  const comment = await commentModel.findById(req.params.commentid);

  if (!comment) {
    res.status(400);
    throw new Error("May be the comment you're looking for has been deleted");
  }

  const { text, image } = req.body;

  const reply = await commentModel.create({
    text,
    createdBy: user._id,
    pin,
    image: image || "",
  });

  if (reply) {
    comment.replies.push(reply._id);
    await comment.save();
    res.status(201).json({ reply });
  } else {
    res.status(400);
    throw new Error("Invalid reply data");
  }
});

const getPin = asyncHandler(async (req, res) => {
  const pin = await pinModel
    .findById(req.params.pinid)
    .populate("comments")
    .populate("createdBy", "-password"); // Populate createdBy field without password

  if (!pin) {
    res.status(400);
    throw new Error("May be the pin you are looking for has been deleted");
  }

  res.status(200).json({ pin });
});

const likePin = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized to like a pin");
  }

  const pin = await pinModel.findById(req.params.pinid);

  if (!pin) {
    res.status(400);
    throw new Error("The pin you are looking for may have been deleted");
  }

  const userId = user._id.toString();
  const index = pin.likes.findIndex((item) => item.toString() === userId);

  if (index === -1) {
    // User hasn't liked the pin, add the like
    pin.likes.push(user._id);
    await pin.save();
    res.status(200).json({ message: "You liked this pin" });
  } else {
    // User has already liked the pin, remove the like
    pin.likes.splice(index, 1);
    await pin.save();
    res.status(200).json({ message: "You disliked this pin" });
  }
});

const likeComment = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized to like a comment");
  }

  const comment = await commentModel.findById(req.params.commentid);

  if (!comment) {
    res.status(400);
    throw new Error("The comment you are looking for may have been deleted");
  }

  const userId = user._id.toString();
  const index = comment.likes.findIndex((item) => item.toString() === userId);

  if (index === -1) {
    // User hasn't liked the comment, add the like
    comment.likes.push(user._id);
    await comment.save();
    res.status(200).json({ message: "You liked this comment" });
  } else {
    // User has already liked the comment, remove the like
    comment.likes.splice(index, 1);
    await comment.save();
    res.status(200).json({ message: "You disliked this comment" });
  }
});

module.exports = {
  createPin,
  getPins,
  getSavedPins,
  getCreatedPins,
  updatePin,
  deletePin,
  savePin,
  createComment,
  replyComment,
  getPin,
  likePin,
  likeComment,
};
