const express = require("express");
const router = express.Router();

const { healthCheck } = require("../controllers/healthcheck.controller");

router.route("/").get(healthCheck);

module.exports = router;
