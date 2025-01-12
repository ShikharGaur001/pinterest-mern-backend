const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const uploadFile = require("../middlewares/multer.middleware");
const {
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
} = require("../controllers/pin.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post(
  "/",
  protect,
  uploadFile,
  createPin
);

router.get("/home", protect, getPins);
router.get("/saved", protect, getSavedPins);
router.get("/created", protect, getCreatedPins);
router.put("/update/:pinid", protect, updatePin);
router.delete("/delete/:pinid", protect, deletePin);
router.put("/save/:pinid", protect, savePin);

router.post(
  "/:pinid/comment",
  [
    body("text")
      .notEmpty()
      .withMessage("Text is required for a comment")
      .isLength({ max: 300 })
      .withMessage("Comment text cannot exceed 300 characters"),
  ],
  protect,
  createComment
);

router.post(
  "/:pinid/:commentid",
  [
    body("text")
      .notEmpty()
      .withMessage("Text is required for a comment")
      .isLength({ max: 300 })
      .withMessage("Comment text cannot exceed 300 characters"),
  ],
  protect,
  replyComment
);

router.get("/:pinid", protect, getPin);
router.put("/:pinid", protect, likePin);
router.put("/:pinid/:commentid", protect, likeComment);

module.exports = router;
