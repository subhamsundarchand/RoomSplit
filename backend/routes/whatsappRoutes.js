const express = require("express");

const router = express.Router();

const whatsapp =
require("../controllers/whatsappController");

router.post(

    "/send",

    whatsapp.sendTest

);

module.exports = router;