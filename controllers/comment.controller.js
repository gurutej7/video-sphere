require("express-async-errors");
const Comment = require("../models/comment.model");
const User = require("../models/user.model");
const Video = require("../models/video.model");
const {
  BadRequestError,
  ApiError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors/index");
const { ApiResponse } = require("../utils/apiResponse");
const { StatusCodes } = require("http-status-codes");

// function to get comments of a video

const getVideoComments = async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new BadRequestError("Please provide a valid video id");
  }

  const pageNumber = parseInt(page);
  const limitOfComments = parseInt(limit);

  // find the video
  const video = await Video.findById(videoId);

  if (!video) {
    throw new NotFoundError("Cannot find the video with the given id");
  }

  // find comments of the video

  const comments = await Comment.aggregatePaginate(
    Comment.aggregate([
      {
        $match: {
          video: video._id, // stage 1 : Filter comments by the specified video._id.
        },
      },
      {
        $lookup: {
          // stage 2 : Join the likes collection to retrieve likes associated with each comment.
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "likes",
        },
      },
      {
        $lookup: {
          // stage 3 : Join the users collection to retrieve the user who posted each comment.
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          // stage 4 : Add new fields to each comment document
          likes: {
            $size: "$likes",
          },
          isLiked: {
            $in: [req.user?._id, "$likes.likedBy"],
          },
          username: {
            $arrayElement: ["$user.username", 0],
          },
        },
      },
      {
        $project: {
          // Project only the specified fields
          username: 1,
          content: 1,
          likes: 1,
          createdAt: 1,
          isLiked: 1,
        },
      },
      {
        $sort: {
          // Sort comments by createdAt in descending order.
          createdAt: -1,
        },
      },
    ]),
    {
      page: pageNumber,
      limit: limitOfComments,
    }
  );

  if (comments.length === 0) {
    return res
      .status(StatusCodes.Ok)
      .json({ msg: "There are no comments for the video" });
  }

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(comments, "Comments fetched successfully"));
};

// function to add comment to a video