require("express-async-errors");
const User = require("../models/user.model");
const Video = require("../models/video.model");
const Like = require("../models/like.model");
const Subscription = require("../models/subscription.model");
const { ApiResponse } = require("../utils/apiResponse");
const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError, ApiError } = require("../errors/index");

// function to get videos of a channel

const getChannelVideos = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new UnauthenticatedError("not a valid user");
  }

  const videos = await Video.find({
    owner: user._id,
  });

  if (!videos) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error while fetching videos"
    );
  }

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(videos, "videos fetched successfully"));
};

// function to get the channel stats

const getChannelStats = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new UnauthenticatedError("not a valid user");
  }

  // total video views
  const totalVideoViews = await Video.aggregate([
    {
      $match: {
        owner: user._id, // stage one get videos with the owner as current user
      },
    },
    {
      /*It groups the documents from the previous stage and calculates the total number of views across all videos. Here, _id: null 
        means we're not grouping by any specific field (hence, all documents are grouped together), and $sum: "$views" calculates the sum 
        of the views field for all documents in the group.
        */
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
      },
    },
  ]);

  // total likes
  const totalLikes = await Like.countDocuments({
    likedBy: user._id,
  });

  // total videos
  const totalVideos = await Video.countDocuments({
    owner: user._id,
  });

  // total subs
  const totalSubscribers = await Subscription.countDocuments({
    channel: user._id,
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      {
        totalVideoViews: totalVideoViews[0]?.totalViews || 0,
        totalLikes,
        totalSubscribers,
        totalVideos,
      },
      "Channel stats fetched successfully"
    )
  );
};

module.exports = {
  getChannelStats,
  getChannelVideos,
};
