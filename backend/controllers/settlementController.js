const db = require("../firebase/firebase");

exports.getSettlement = async (req, res) => {

    try {

        const snapshot = await db
            .collection("expenses")
            .get();

        const balances = {};
        const settlements = [];

        snapshot.forEach(doc => {

            const expense = doc.data();

            const expenseSettlements =
                expense.settlements || [];

            expenseSettlements.forEach(item => {

                const remaining =
                    Number(item.remainingAmount || 0);

                if (remaining <= 0.01) {
                    return;
                }

                const from = item.from;
                const to = item.to;

                // Balance calculation
                if (!balances[from]) {
                    balances[from] = 0;
                }

                if (!balances[to]) {
                    balances[to] = 0;
                }

                balances[from] -= remaining;
                balances[to] += remaining;

                // IMPORTANT:
                // Keep original debtor -> creditor
                settlements.push({

                    from,

                    to,

                    amount: Number(
                        remaining.toFixed(2)
                    )

                });

            });

        });

        res.json({

            success: true,

            balances,

            settlements

        });

    }

    catch (err) {

        console.error(
            "Settlement Error:",
            err
        );

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

};
/* ==========================================
   MARK SETTLEMENT PAID
========================================== */

exports.markSettlementPaid = async (req, res) => {

    try {

        const {

            expenseId,
            settlementId,
            amount,
            method

        } = req.body;

        const ref = db
            .collection("expenses")
            .doc(expenseId);

        const doc = await ref.get();

        if (!doc.exists) {

            return res.status(404).json({

                success: false,

                message: "Expense not found"

            });

        }

        const expense = doc.data();

        const settlements = expense.settlements || [];

        const settlement = settlements.find(

            s => s.id === settlementId

        );

        if (!settlement) {

            return res.json({

                success: false,

                message: "Settlement not found"

            });

        }

        const payAmount = Number(amount);

        if (isNaN(payAmount) || payAmount <= 0) {

            return res.json({

                success: false,

                message: "Invalid amount"

            });

        }

        if (payAmount > settlement.remainingAmount) {

            return res.json({

                success: false,

                message: "Amount exceeds remaining balance"

            });

        }

        settlement.payments.push({

            id:
                Date.now().toString(),

            amount: payAmount,

            method,

            paidAt: new Date().toISOString()

        });

        settlement.paidAmount += payAmount;

        settlement.remainingAmount =
            Number(

                (
                    settlement.pendingAmount -

                    settlement.paidAmount

                ).toFixed(2)

            );

        if (settlement.remainingAmount <= 0) {

            settlement.remainingAmount = 0;

            settlement.status = "Paid";

        }

        else {

            settlement.status = "Partial";

        }

        await ref.update({

            settlements

        });

        res.json({

            success: true,

            settlement,

            message: "Payment Saved"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};