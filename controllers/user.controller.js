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
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath ;

  // check if coverImage is provided or not
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new BadRequestError("avatar image is required");
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
  }); // $or || operator
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

module.exports = { registerUser };
