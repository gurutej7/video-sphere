const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} = require("../controllers/user.controller");
const { upload } = require("../middlewares/multer.middleware");
const authenticateUser = require("../middlewares/auth.middleware");

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/refresh-token").post(refreshAccessToken);

// routes that require authentication
router.route("/logout").post(authenticateUser, logoutUser);


module.exports = router;
