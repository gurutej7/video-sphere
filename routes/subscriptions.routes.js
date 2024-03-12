const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/auth.middleware");

const {
  toggleSubscription,
  isSubOfAChannel,
  getFullProfileOfAChannel,
} = require("../controllers/subscription.controller");

router.use(authenticateUser);

router.route("/toggle-sub/:channelName").post(toggleSubscription);
router.route("/is-sub/:channelName").get(isSubOfAChannel);
router.route("/get-channel-profile/:channelName").get(getFullProfileOfAChannel);

module.exports = router;
