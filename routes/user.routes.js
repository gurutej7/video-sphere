const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUserAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} = require("../controllers/user.controller");
const { upload } = require("../middlewares/multer.middleware");
const authenticateUser = require("../middlewares/auth.middleware");
const { route } = require("express/lib/router");

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

// routes that require authentication
router.route("/logout").post(authenticateUser, logoutUser);
router.route("/refresh-token").post(refreshAccessToken); // only token security is used
router.route("/change-password").post(authenticateUser, changePassword);
router.route("/current-user").get(authenticateUser, getCurrentUser);
router
  .route("/update-avatar")
  .patch(authenticateUser, upload.single("avatar"), updateUserAvatar);
router
  .route("/update-cover-image")
  .patch(authenticateUser, upload.single("coverImage"), updateCoverImage);
router
  .route("/channel/:username")
  .get(authenticateUser, getUserChannelProfile);
router.route("/watch-history").get(authenticateUser, getWatchHistory);

module.exports = router;
