const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/auth.middleware");

const {
  createPlayList,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlayListById,
  getUserPlayLists,
  updatePlaylist,
  deletePlaylist,
} = require("../controllers/playlist.controller");

router.use(authenticateUser);

router.route("/create-playlist").post(createPlayList);
router.route("/get-playlist/:username").get(getUserPlayLists);
router.route("/add-video/:videoId/:playlistId").patch(addVideoToPlaylist);
router
  .route("/remove-video/:videoId/:playlistId")
  .patch(removeVideoFromPlaylist);

router
  .route("/:playlistId")
  .get(getPlayListById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

module.exports = router;
