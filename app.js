require("dotenv").config();
// To handle async errors
require("express-async-errors");

const express = require("express");
const app = express();

// connectDB
const connectDB = require("./db/connect");

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
