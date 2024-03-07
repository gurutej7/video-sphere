require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a user-name"],
      minlength: 3,
      maxlength: 50,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // This property creates an index on the username field, which improves search performance. It allows efficient lookups based on the username.
    },
    email: {
      type: String,
      required: [true, "please provide a Email"],
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ], // to check whether it matches the regular expression or not , used to check for the valid email
      unique: true,
      minlength: 9,
      maxlength: 50,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
    },
    avatar: {
      type: String, //corresponds to cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // if password is not modified then just return from here
  }
  const salt = await bcrypt.genSalt(10);
  // here this. is pointing to this document
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

userSchema.methods.createAccessJWT = function () {
  return jwt.sign(
    {
      userId: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_JWT_SECRET,
    { expiresIn: process.env.ACCESS_JWT_LIFETIME }
  );
};
userSchema.methods.createRefreshJWT = function () {
  return jwt.sign(
    {
      userId: this._id,
    },
    process.env.REFRESH_JWT_SECRET,
    { expiresIn: process.env.REFRESH_JWT_LIFETIME }
  );
};
userSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);

  return isMatch;
};

module.exports = mongoose.model("User", userSchema);
