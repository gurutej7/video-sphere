const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/multer.middleware");

const {
  publishVideo,
  deleteVideo,
  getAllVideos,
  getVideoById,
  togglePublishStatus,
} = require("../controllers/video.controller");

router.use(authenticateUser);

router.route("/publish-video").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);

router.route("/get-all-videos/:username").get(getAllVideos);
router.route("/get-video/:videoId").get(getVideoById);
router.route("/delete-video/:videoId").delete(deleteVideo);
router.route("/toggle-publish-status/:videoId").post(togglePublishStatus);

module.exports = router;
