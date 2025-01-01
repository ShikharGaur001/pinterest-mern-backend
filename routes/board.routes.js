const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
} = require("../controllers/board.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post(
  "/",
  [
    body("title")
      .notEmpty()
      .withMessage("A board must has a title")
      .isLength({ max: 100 })
      .withMessage("Title cannot exceed 100 characters")
      .isLength({ min: 1 })
      .withMessage("Title must be at least 1 character long"),
  ],
  protect,
  createBoard
);

router.get("/board/:boardid", protect, getBoard);
router.put("/update/:boardid", protect, updateBoard);
router.delete("/delete/:boardid", protect, deleteBoard);

module.exports = router;
