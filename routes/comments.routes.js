const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/auth.middleware");

const {
  getVideoComments,
  addComment,
  editComment,
  deleteComment,
} = require("../controllers/comment.controller");

router.use(authenticateUser);

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/:commentId").patch(editComment).delete(deleteComment);

module.exports = router;
