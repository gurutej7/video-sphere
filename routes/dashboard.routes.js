const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/auth.middleware");

const {
  getChannelStats,
  getChannelVideos,
} = require("../controllers/dashboard.controller");

router.use(authenticateUser);

router.route("/get-channel-stats").get(getChannelStats);
router.route("/get-channel-videos").get(getChannelVideos);

module.exports = router;
