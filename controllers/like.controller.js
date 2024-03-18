require("express-async-errors");
const Comment = require("../models/comment.model");
const User = require("../models/user.model");
const Video = require("../models/video.model");
const Like = require("../models/like.model");
const {
  BadRequestError,
  ApiError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors/index");
const { ApiResponse } = require("../utils/apiResponse");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const { use } = require("express/lib/router");

// function to like and unlike a video

const toggleVideoLike = async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new BadRequestError("Please provide a valid video id");
  }

  // check if the video exists
  const video = await Video.findById(videoId);

  if (!video) {
    throw new NotFoundError("Cannot find video with the given id");
  }

  // get the user
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new UnauthenticatedError("Not a valid user");
  }

  // check if like already exists  by the current user
  const alreadyLiked = await Like.findOne({
    video: video._id,
    likedBy: user._id,
  });

  // if liked then remove the like
  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse({}, "Like removed successfully"));
  } else {
    // if not liked then like the video
    const newLike = await Like.create({ video: video._id, likedBy: user._id });

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(newLike, "Liked the video successfully"));
  }
};

// function to like and unlike a comment

const toggleCommentLike = async (req, res) => {
  const { commentId } = req.params;
  if (!commentId || !mongoose.isValidObjectId(commentId)) {
    throw new BadRequestError("Please provide a valid comment Id");
  }

  // get the comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError("Cannot find comment with the given Id");
  }

  // get the user
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new UnauthenticatedError("Not a valid user");
  }

  // check if like already exists  by the current user
  const alreadyLiked = await Like.findOne({
    comment: comment._id,
    likedBy: user._id,
  });

  // if already liked then unlike
  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse({}, "Like removed successfully"));
  } else {
    // like the comment
    const newLike = await Like.create({
      comment: comment._id,
      likedBy: user._id,
    });

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(newLike, "Liked the comment successfully"));
  }
};

// function to get liked videos of the user

const getLikedVideos = async (req, res) => {
  // get the user
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new UnauthenticatedError("Not a valid user");
  }

  // find all likes of videos by the user
  const likes = await Like.find({
    likedBy: user._id,
    video: {
      $exists: true,
    },
  }).populate("video");

  if (!likes) {
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse([], "No liked videos found for the user"));
  }

  // extract only video details from the likes
  const likedVideos = likes.map((like) => like.video);

  // return response
  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        likedVideos,
        "Liked videos of the user fetched successfully"
      )
    );
};

module.exports = {
  toggleCommentLike,
  toggleVideoLike,
  getLikedVideos,
};
