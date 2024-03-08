const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/user.controller");
const { upload } = require("../middlewares/multer.middleware");

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

module.exports = router;
