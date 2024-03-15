const mongoose = require("mongoose");

const playListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide playlist name"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description for the playlist"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playlist", playListSchema);
