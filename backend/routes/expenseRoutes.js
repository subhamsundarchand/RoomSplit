const validateExpense =
require("../middleware/validateExpense");

const express = require("express");

const router = express.Router();

const expenseController =
require("../controllers/expenseController");

// GET ALL
router.get(
    "/",
    expenseController.getExpenses
);
router.get(
    "/:id",
    expenseController.getExpenseById
);

// ADD
router.post(
    "/",
    validateExpense,
    expenseController.addExpense
);
// UPDATE
router.put(
    "/:id",
    validateExpense,
    expenseController.updateExpense
);

// DELETE
router.delete(
    "/:id",
    expenseController.deleteExpense
);

module.exports = router;
