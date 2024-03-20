require("express-async-errors");

const healthCheck = async (req, res) => {
  return res.status(200).json({ message: "Api is working OK" });
};

module.exports = { healthCheck };
