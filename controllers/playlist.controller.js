require("express-async-errors");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Video = require("../models/video.model");
const Playlist = require("../models/playList.model");
const {
  BadRequestError,
  ApiError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors/index");
const { ApiResponse } = require("../utils/apiResponse");
const { StatusCodes } = require("http-status-codes");

// function to create a new playlist
const createPlayList = async (req, res) => {
  // get name and description
  const { name, description } = req.body;

  if (!name || !description) {
    throw new BadRequestError(
      "Please provide a name and description of the playlist"
    );
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new UnauthenticatedError("Not a valid user");
  }

  // create a playlist
  const playList = await Playlist.create({
    name: name,
    description: description,
    owner: user._id,
  });

  if (!playList) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error while creating a playlist , try again later"
    );
  }

  // return response
  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(playList, "Playlist created successfully"));
};

// function to add video to the playlist

const addVideoToPlaylist = async (req, res) => {
  // get the id`s of playlist and the video
  const { playlistId, videoId } = req.params;

  if (
    !playlistId ||
    !videoId ||
    !mongoose.isValidObjectId(playlistId) ||
    !mongoose.isValidObjectId(videoId)
  ) {
    throw new BadRequestError(
      "Please provide a valid playlist id and the video id"
    );
  }

  // find the video with the id
  const video = await Video.findById(videoId);
  if (!video) {
    throw new NotFoundError("Cannot find video with the given id");
  }

  const userId = req.user?._id.toString();

  if (!video.owner.equals(userId)) {
    throw new UnauthenticatedError(
      "Only the video owner can add it to playlist"
    );
  }

  // find the playlist
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new NotFoundError("Cannot find playList with the given id");
  }

  // only the playlist owner can add the video
  if (!playlist.owner.equals(userId)) {
    throw new UnauthenticatedError("Only the playlist owner can add the video");
  }

  // check if video already exists in the playlist or not
  if (playlist.videos.includes(videoId)) {
    throw new BadRequestError("Video already exists in the playlist");
  }

  // add video to the playlist
  const updatedPlayList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  // return the response
  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(updatedPlayList, "video added to playlist successfully")
    );
};

// function to remove video from a playlist

const removeVideoFromPlaylist = async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (
    !playlistId ||
    !videoId ||
    !mongoose.isValidObjectId(playlistId) ||
    !mongoose.isValidObjectId(videoId)
  ) {
    throw new BadRequestError(
      "Please provide a valid playlist id and a video id"
    );
  }

  // check if the playlist exist
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new NotFoundError("Cannot find playlist with the given id");
  }

  // check if video exist`s or not
  const video = await Video.findById(videoId);

  if (!video) {
    throw new NotFoundError("Cannot find video with the given id");
  }

  const userId = req.user?._id.toString();

  if (!video.owner.equals(userId)) {
    throw new UnauthenticatedError(
      "Only the video owner can remove it to playlist"
    );
  }

  // only the playlist owner can add the video
  if (!playlist.owner.equals(userId)) {
    throw new UnauthenticatedError(
      "Only the playlist owner can remove the video"
    );
  }

  // check if the video is in the playlist or not
  if (!playlist.videos.includes(videoId)) {
    throw new BadRequestError("Video does not exist in the playlist");
  }

  // remove video from the playlist
  const updatedPlayList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  // return response
  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        updatedPlayList,
        "Video removed from play list successfully"
      )
    );
};

// function to get playList`s of a particular user

const getUserPlayLists = async (req, res) => {
  // get username from params
  const { username } = req.params;

  if (!username) {
    throw new BadRequestError("Please provide a username");
  }

  // find user with the given username
  const user = await User.findOne({
    username: username,
  });
  if (!user) {
    throw new BadRequestError("Please provide a valid username");
  }

  // returns a array of playlist models
  const playlists = await Playlist.find({
    owner: user._id,
  });

  if (!playlists) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error while fetching data from db , please try again later"
    );
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        playlists,
        "Playlist`s of the given user fetched successfully"
      )
    );
};

// function to get a playList by Id

const getPlayListById = async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !mongoose.isValidObjectId(playlistId)) {
    throw new BadRequestError("Please provide a valid play list id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new NotFoundError("cannot find playlist with the given id");
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(playlist, "Playlist with given id fetched successfully")
    );
};

// function to delete the play list
const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !mongoose.isValidObjectId(playlistId)) {
    throw new BadRequestError("Please provide a valid playlist id");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new NotFoundError("Cannot find play list with the given id");
  }

  const userId = req.user?._id.toString();

  // only the playlist owner can delete the playlist
  if (!playlist.owner.equals(userId)) {
    throw new UnauthenticatedError(
      "Only the playlist owner can delete the playlist"
    );
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(deletedPlaylist, "Playlist deleted successfully"));
};

// function to update the details of the play list
const updatePlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId || !mongoose.isValidObjectId(playlistId)) {
    throw new BadRequestError("Please provide a valid playlist id");
  }

  if (!name || !description) {
    throw new BadRequestError("Both name and description are required");
  }

  const userId = req.user?._id.toString();
  const playlist = await Playlist.findById(playlistId);

  // only the playlist owner can update the playlist
  if (!playlist.owner.equals(userId)) {
    throw new UnauthenticatedError(
      "Only the playlist owner can update the playlist"
    );
  }

  // update
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    }
  );

  if (!updatePlaylist) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error while updating the playlist"
    );
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        updatedPlaylist,
        "Playlist name and description updated successfully"
      )
    );
};

module.exports = {
  createPlayList,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlayLists,
  getPlayListById,
  deletePlaylist,
  updatePlaylist,
};
