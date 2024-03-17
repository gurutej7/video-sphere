require("dotenv").config();
// To handle async errors
require("express-async-errors");

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// connectDB
const connectDB = require("./db/connect");

// middlewares
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes
const userRouter = require("./routes/user.routes");
const channelRouter = require("./routes/subscriptions.routes");
const videoRouter = require("./routes/video.routes");
const playlistRouter = require("./routes/playlist.routes");
const commentsRouter = require("./routes/comments.routes");

app.use("/api/v1/users", userRouter);
app.use("/api/v1/channels", channelRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/comments", commentsRouter);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    const connectionInstance = await connectDB(process.env.MONGO_URI);
    console.log(
      `DB connected ... DB Host : ${connectionInstance.connection.host}`
    );
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(`MongoDB Connection Error`, error);
  }
};

start();
