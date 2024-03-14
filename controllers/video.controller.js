require("express-async-errors");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Video = require("../models/video.model");
const {
  BadRequestError,
  ApiError,
  UnauthenticatedError,
} = require("../errors/index");
const { ApiResponse } = require("../utils/apiResponse");
const uploadOnCloudinary = require("../utils/cloudinary");
const { StatusCodes } = require("http-status-codes");

const publishVideo = async (req, res) => {
  // get title and description
  const { title, description } = req.body;

  if (!title) {
    throw new BadRequestError("Please provide a title");
  }

  // get video and thumbnail
  const videoLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  if (!videoLocalPath) {
    throw new BadRequestError("Please upload a video");
  }

  if (!thumbnailLocalPath) {
    throw new BadRequestError("please upload a thumbnail");
  }

  // upload on cloudinary
  const videoFile = await uploadOnCloudinary(videoLocalPath);
  if (!videoFile) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error while uploading on cloudinary , try again later"
    );
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  // get the user
  const user = await User.findById(req.user?._id);

  // store the data in the database
  const video = await Video.create({
    videoFile: videoFile.secure_url,
    thumbnail: thumbnail.url,
    owner: user._id,
    title: title,
    description: description || "",
    duration: videoFile.duration,
  });

  if (!video) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error while storing data in db , try again later"
    );
  }

  // send back response

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(video, "Video uploaded successfully"));
};

// get all videos of a particular user
// url/get-all-videos/:username
const getAllVideos = async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new BadRequestError("Please provide a user name");
  }

  const user = await User.findOne({ username: username });

  if (!user) {
    throw new BadRequestError("Please provide a user name");
  }

  // returns the array of videos , with given matching field
  const allVideos = await Video.find({
    owner: user._id,
    isPublished: true,
  });

  if (!allVideos) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "something went wrong while fetching data from db , try again later"
    );
  }

  if (allVideos.length == 0) {
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse({}, "No videos available for the given user"));
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        allVideos,
        "Videos of the given user fetched successfully"
      )
    );
};

// function to get video by id

const getVideoById = async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new BadRequestError("Please provide a valid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new BadRequestError("cannot find video with the given id");
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(video, "Video with the given id fetched successfully")
    );
};

// function to delete a user
const deleteVideo = async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new BadRequestError("Please provide a valid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new BadRequestError("Cannot find video with the given  id");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new UnauthenticatedError("not a valid user");
  }

  // only the owner can delete the video
  if (video.owner.equals(user._id.toString())) {
    await Video.findByIdAndDelete(videoId);
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse({}, "video deleted successfully"));
  } else {
    throw new UnauthenticatedError("only the video owner can delete the video");
  }
};

// toggle publish status of a video
const togglePublishStatus = async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new BadRequestError("Please provide a valid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new BadRequestError("Cannot find video with the given  id");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new UnauthenticatedError("not a valid user");
  }

  // only the video owner can update  the publish status of a video
  if (video.owner.equals(user._id.toString())) {
    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          video.isPublished,
          "video publish status toggled successfully"
        )
      );
  } else {
    throw new UnauthenticatedError(
      "only the video owner can modify the video publish status"
    );
  }
};

module.exports = {
  publishVideo,
  getAllVideos,
  togglePublishStatus,
  deleteVideo,
  getVideoById,
};
