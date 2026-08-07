const express = require("express");

const router = express.Router();

const settlement =
require("../controllers/settlementController");

router.get(
    "/",
    settlement.getSettlement
);
router.post(
    "/pay",
    settlement.markSettlementPaid
);
module.exports = router;