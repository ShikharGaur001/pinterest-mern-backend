const asyncHandler = require("express-async-handler");
const userModel = require("../models/user.model");
const pinModel = require("../models/pin.model");
const boardModel = require("../models/board.model");
const { validationResult } = require("express-validator");

const createBoard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(JSON.stringify({ errors: errors.array() }));
  }

  const { title, description, category, tags, collaborators, isSecret } =
    req.body;

  const user = await userModel.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("Not Authorized to create a Pin");
  }

  const board = await boardModel.create({
    title,
    description: description || "",
    createdBy: user._id,
    category: category || "Other",
    tags: tags || [],
    collaborators: collaborators || [],
    isSecret: isSecret || false,
  });

  if (isSecret && isSecret === true) {
    user.boards.push(board._id);
    await user.save();
  } else {
    user.boards.push(board._id);
    user.publicBoards.push(board._id);
    await user.save();
  }

  if (board) {
    res.status(201).json({ board });
  } else {
    res.status(400);
    throw new Error("Invalid board data");
  }
});

const getBoard = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("Not authorized to access boards");
  }

  const board = await boardModel
    .findById(req.params.boardid)
    .populate("pins")
    .populate({ path: "createdBy", select: "-password" })
    .populate({ path: "collaborators", select: "-password" });
  if (!board) {
    res.status(404);
    throw new Error(`No board exists with id ${req.params.boardid}`);
  }

  if (board.isSecret && board.createdBy.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error("Access denied: This board is secret");
  }

  res.status(200).json({ success: true, data: board });
});

const updateBoard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user = await userModel.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("Not authorized to update this board");
  }

  const board = await boardModel.findById(req.params.boardid);
  if (!board) {
    res.status(404);
    throw new Error(`No board exists with id ${req.params.boardid}`);
  }

  if (board.createdBy.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error("You are not the creator of this board");
  }

  // Update fields only if provided
  const updateFields = {
    title: req.body.title || board.title,
    description: req.body.description || board.description,
    category: req.body.category || board.category,
    tags: req.body.tags || board.tags,
    collaborators: req.body.collaborators || board.collaborators,
    isSecret: req.body.isSecret || board.isSecret,
  };

  const updatedBoard = await boardModel.findByIdAndUpdate(
    req.params.boardid,
    updateFields,
    { new: true }
  );

  if (updatedBoard) {
    res.status(200).json({ success: true, data: updatedBoard });
  } else {
    res.status(400);
    throw new Error("Failed to update board");
  }
});

const deleteBoard = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized user");
  }

  const board = await boardModel.findByIdAndDelete(req.params.boardid);

  if (board.createdBy.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error("You are not the creator of this board");
  }

  if (board) {
    res.status(200).json({ message: "Board Deleted successfully" });
  } else {
    res.status(400);
    throw new Error(`No board exists with this id ${req.params.boardid}`);
  }
});

module.exports = { createBoard, getBoard, updateBoard, deleteBoard };
