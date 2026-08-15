const express = require("express");

const router = express.Router();

const settlement =
    require("../controllers/settlementController");


/* ==========================================
   GET SETTLEMENT
========================================== */

router.get(
    "/",
    settlement.getSettlement
);


/* ==========================================
   PAY INDIVIDUAL EXPENSE SETTLEMENT
========================================== */

router.post(
    "/pay",
    settlement.markSettlementPaid
);


/* ==========================================
   PAY SUMMARY SETTLEMENT
========================================== */

router.post(
    "/pay-summary",
    settlement.markSummarySettlementPaid
);


module.exports = router;