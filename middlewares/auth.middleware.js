const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");

const authenticateUser = async (req, res, next) => {
  // get access of the token ,check for header || cookie
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new UnauthenticatedError("Authentication InValid");
  }
  try {
    // decoded token
    const payload = jwt.verify(token, process.env.ACCESS_JWT_SECRET);

    //  attach the user to the req object
    // req.user = {userId:payload.userId, name :payload.name};

    const user = await User.findById(payload.userId).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new UnauthenticatedError("Authentication Invalid");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

module.exports =  authenticateUser ;
