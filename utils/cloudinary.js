// Require the Cloudinary library
const cloudinary = require("cloudinary").v2;
const { log } = require("console");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async function (localFilePath) {
  try {
    if (!localFilePath) {
      return null;
    }

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully
    // console.log("file is uploaded on cloudinary");
    // console.log(response); , we will be using response.url

    fs.unlinkSync(localFilePath); // if path refers to a symbolic link, then the link is removed without affecting the file or directory
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation is failed

    return null;
  }
};

module.exports = uploadOnCloudinary;
