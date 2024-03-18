const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/auth.middleware");

const {
  toggleCommentLike,
  toggleVideoLike,
  getLikedVideos,
} = require("../controllers/like.controller");

router.use(authenticateUser);

router.route("/toggle-comment-like/:commentId").post(toggleCommentLike);
router.route("/toggle-video-like/:videoId").post(toggleVideoLike);
router.route("/get-liked-videos").get(getLikedVideos);

module.exports = router;
