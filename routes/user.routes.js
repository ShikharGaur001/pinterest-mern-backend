const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  followUser,
  getProfile
} = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post(
  "/",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username must contain only letters and numbers"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 character long"),
  ],
  loginUser
);

router.get("/current", protect, getCurrentUser);
router.put("/follow/:userid", protect, followUser)
router.get("/profile/:username", protect, getProfile)

module.exports = router;
