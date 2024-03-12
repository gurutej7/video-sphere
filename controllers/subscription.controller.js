require("express-async-errors");
const User = require("../models/user.model");
const Subscription = require("../models/subscription.model");
const { ApiResponse } = require("../utils/apiResponse");
const {
  BadRequestError,
  ApiError,
  UnauthenticatedError,
} = require("../errors/index");
const { StatusCodes } = require("http-status-codes");

const toggleSubscription = async (req, res) => {
  const { channelName } = req.params;

  // find channel with the given name
  const channel = await User.findOne({
    username: channelName.trim().toLowerCase(),
  });
  if (!channel) {
    throw new BadRequestError("Please provide a valid channel name");
  }

  // console.log("channel details ",channel);
  // console.log("user details" , req.user);

  // find the current user
  const currentUser = await User.findById(req.user?._id);
  if (!currentUser) {
    throw new BadRequestError("Not a valid user");
  }

  // check if current user is already a subscriber of the channel or not
  const userSub = await Subscription.findOne({
    subscriber: currentUser._id,
    channel: channel._id,
  });

  // console.log("finding one" ,userSub);

  // if user is subscribed - then unsubscribe
  if (userSub) {
    // console.log("deleteing that one");
    const unsubscribe = await Subscription.findOneAndDelete({
      subscriber: currentUser._id,
      channel: channel._id,
    });

    // console.log(unsubscribe);

    if (!unsubscribe) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Some thing went wrong while unsubscribing , try again later"
      );
    }

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(unsubscribe, "User unsubscribed successfully"));
  }
  // else subscribe the channel
  else {
    const subscribe = await Subscription.create({
      subscriber: currentUser._id,
      channel: channel._id,
    });
    if (!subscribe) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Some thing went wrong while subscribing , try again later"
      );
    }

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(subscribe, "user subscribed successfully"));
  }
};

// given a channel id return if the current user is subscribed to that channel or not

const isSubOfAChannel = async (req, res) => {
  // given a , user and a channel id , return if the user is a sub of that channel
  const userId = req.user?._id;
  const { channelName } = req.params;

  // find channel with the given name
  const channel = await User.findOne({
    username: channelName.trim().toLowerCase(),
  });
  if (!channel) {
    throw new BadRequestError("Please provide a valid channel name");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new UnauthenticatedError("Please use valid credentials");
  }

  // check if there is a document , in the subscriptions with subscriber as user and channel as given channel return true
  const isSub = await Subscription.findOne({
    subscriber: user._id,
    channel: channel._id,
  });

  // console.log(isSub);

  if (!isSub) {
    return res.status(StatusCodes.OK).json({
      userId: user._id,
      channelId: channel._id,
      isSub: false,
    });
  } else {
    return res.status(StatusCodes.OK).json({
      userId: user._id,
      channelId: channel._id,
      isSub: true,
    });
  }
};

// controller to return the list and count of subscribers and of a particular channel
// we can use getUserProfile controller from user.controller here, but small change here is we will be sending the details of all the subscribers along with the count

// kind of like a user profile in Instagram
// where we have list of followers(subscribers) and list of following (subscribed to)
// and also if the current user is subscribed or not to that user

const getFullProfileOfAChannel = async (req, res) => {
  const { channelName } = req.params;

  if (!channelName) {
    throw new BadRequestError("please provide a username");
  }

  // array is returned from this method
  const channelProfile = await User.aggregate([
    {
      $match: {
        username: channelName.trim().toLowerCase(), // stage 1 = find the channel
      },
    },
    {
      $lookup: {
        from: "subscriptions", // stage 2 = get all the documents in Subscription collection , which are having this channel Id
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1, // channel name
        username: 1,
        subscribers: 1, // followers of a channel
        subscribersCount: 1, // followers count
        subscribedTo: 1, // following list
        channelsSubscribedToCount: 1, // following count
        isSubscribed: 1, // if the current user , is sub of that channel or not
        avatar: 1, // avatar of that channel
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channelProfile?.length) {
    throw new BadRequestError("Enter a valid channel name");
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(channelProfile[0], "channel details fetched successfully")
    );
};

module.exports = {
  toggleSubscription,
  isSubOfAChannel,
  getFullProfileOfAChannel,
};
