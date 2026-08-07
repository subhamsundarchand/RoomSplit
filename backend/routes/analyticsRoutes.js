const express = require("express");

const router = express.Router();

const analytics =
require("../controllers/analyticsController");

router.get("/", analytics.getAnalytics);

module.exports = router;