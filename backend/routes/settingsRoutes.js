const express = require("express");

const router = express.Router();

const settingsController =
require("../controllers/settingsController");

// SAVE SETTINGS
router.post(
    "/",
    settingsController.saveSettings
);

module.exports = router;
// GET SETTINGS
router.get(
    "/:user",
    settingsController.getSettings
);