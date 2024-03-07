const multer = require("multer");

// DiskStorage
// destination = The folder to which the life has been saved
// filename = The name of the file within destination
// path = The full path of the uploaded file

// Memory Storage
// buffer = A Buffer of the entire file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        // we can change the file name , in such a way that is unique
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname)
    }
  })
  
const upload = multer({ storage });

module.exports = upload;