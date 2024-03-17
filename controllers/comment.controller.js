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
const { default: mongoose } = require("mongoose");

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
            $arrayElemAt: ["$user.username", 0],
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

const addComment = async (req, res) => {
  // get the video and user and comment -content

  const { videoId } = req.params;
  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new BadRequestError("Please provide a valid video id");
  }
  const { content } = req.body;
  if (!content) {
    throw new BadRequestError(
      "Cannot post a empty comment , please provide content to comment"
    );
  }
  const user = await User.findOne({
    refreshToken: req.cookies.refreshToken,
  });

  if (!user) {
    throw new UnauthenticatedError("Not a valid user");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new NotFoundError("Cannot find the video with the given id");
  }

  // create a comment document in the database
  const comment = await Comment.create({
    content: content,
    owner: user._id,
    video: video._id,
  });

  if (!comment) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error while creating a comment in db"
    );
  }

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(comment, " comment created successfully"));
};

// function to edit the comment

const editComment = async (req, res) => {
  // get the particular comment
  const { commentId } = req.params;
  if (!commentId || !mongoose.isValidObjectId(commentId)) {
    throw new BadRequestError("Please provide a valid comment Id");
  }

  // get the new content
  const { newContent } = req.body;
  if (!newContent) {
    throw new BadRequestError("Please provide a new content to edit");
  }

  // get the comment and the user
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new NotFoundError("Cannot find the comment with the given id");
  }

  const user = await User.findOne({
    refreshToken: req.cookies.refreshToken,
  });

  if (!user) {
    throw new UnauthenticatedError("Not a valid user");
  }

  // only the owner of the comment can edit it
  if (comment.owner.equals(user._id.toString())) {
    // update the comment
    comment.content = newContent;
    await comment.save({ validationBeforeSave: false });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(comment, "comment updated successfully"));
  } else {
    throw new UnauthenticatedError("Only the owner of the comment can edit it");
  }
};

// function to delete a comment
const deleteComment = async (req, res) => {
  // get the particular comment
  const { commentId } = req.params;
  if (!commentId || !mongoose.isValidObjectId(commentId)) {
    throw new BadRequestError("Please provide a valid comment Id");
  }

  // get the comment and the user
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new NotFoundError("Cannot find the comment with the given id");
  }

  const user = await User.findOne({
    refreshToken: req.cookies.refreshToken,
  });

  if (!user) {
    throw new UnauthenticatedError("Not a valid user");
  }

  // only the owner of the comment can delete it
  if (comment.owner.equals(user._id.toString())) {
    // delete the comment
    await Comment.findByIdAndDelete(commentId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse({}, "comment deleted successfully"));
  } else {
    throw new UnauthenticatedError(
      "Only the owner of the comment can delete it"
    );
  }
};

module.exports = {
  getVideoComments,
  addComment,
  editComment,
  deleteComment,
};
