require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  ApiError,
} = require("../errors");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const uploadOnCloudinary = require("../utils/cloudinary");
const { ApiResponse } = require("../utils/apiResponse");

// options for cookies (these cookies can only be modifiable by the server)
const options = {
  httpOnly: true,
  secure: true,
};

const registerUser = async (req, res) => {
  // get the required fields from the user
  const { fullName, email, username, password } = req.body;

  //validating the data
  const requiredFields = ["username", "email", "fullName", "password"];
  requiredFields.forEach((field) => {
    if (req.body[field] === "") {
      throw new BadRequestError(`${field} is required `);
    }
  });

  // check for avatar and cover Image , multer provides files property access in the req obj
  // access may or may not be available for the property => optional
  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  let coverImageLocalPath;

  if (!avatarLocalPath) {
    throw new BadRequestError("avatar image is required");
  }

  // check if coverImage is provided or not 
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  

  //uploading on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new BadRequestError("avatar image is required");
  }

  //checking if user exists or not
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  }); // $or || operator , find with username or email
  if (existedUser) {
    throw new BadRequestError("User already exists");
  }

  // creating a user in the database
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // send back the response , remove password and refresh token
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check if user is created or not
  if (!createdUser) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Some thing went wrong please try again"
    );
  }

  // return response
  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(createdUser, "User has been created successfully"));
};

const generateAccessAndRefreshToken = async (userId) => {
  // find the user
  const user = await User.findById(userId);
  const accessToken = user.createAccessJWT();
  const refreshToken = user.createRefreshJWT();

  // set refresh token for the user in the db
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false }); // don`t do validations just save

  return { accessToken, refreshToken };
};

const loginUser = async (req, res) => {
  const { email, password, username } = req.body;

  if ((!email && !username) || !password) {
    throw new BadRequestError("Please provide email or username and password");
  }

  //checking if user exists or not
  const user = await User.findOne({
    $or: [{ username }, { email }],
  }); // $or || operator , find with username or email

  if (!user) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  // compare password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid credentials");
  }
  // generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // process the information that we want to send back to the user , we can use the above instance of user also , and remove unwanted fields and send back
  // or make a call to database again
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send back the response
  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        {
          user: loggedInUser,
          accessToken,
          refreshToken, // there can be a case where the frontend wants to use(save in local storage) these tokens
        },
        "User logged in successfully"
      )
    );

  // send back the token (cookie)
};

const logoutUser = async (req, res) => {
  //use auth middleware to access the user

  // remove refresh token from database
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, //removes the field from document
      },
    },
    {
      new: true,
    }
  );

  // clear cookies
  return res
    .status(StatusCodes.OK)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse({}, "Logged out successfully"));
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
