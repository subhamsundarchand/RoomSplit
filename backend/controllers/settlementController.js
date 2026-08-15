const db = require("../firebase/firebase");

/* ==========================================
   GET SETTLEMENT
========================================== */

exports.getSettlement = async (req, res) => {

    try {

        const snapshot = await db
            .collection("expenses")
            .get();

        const balances = {
            subham: 0,
            subhankar: 0,
            soumya: 0
        };

        const settlementMap = {};

        snapshot.forEach(doc => {

            const expense = doc.data();

            const settlements =
                expense.settlements || [];

            settlements.forEach(settlement => {

                const remaining =
                    Number(settlement.remainingAmount || 0);

                if (remaining <= 0) return;

                const from = settlement.from;
                const to = settlement.to;

                /*
                 * Balance calculation
                 */

                if (!balances[from]) {
                    balances[from] = 0;
                }

                if (!balances[to]) {
                    balances[to] = 0;
                }

                balances[from] -= remaining;
                balances[to] += remaining;


                /*
                 * Same person -> same person
                 * settlements ko combine karo
                 */

                const key = `${from}_${to}`;

                if (!settlementMap[key]) {

                    settlementMap[key] = {
                        from,
                        to,
                        amount: 0
                    };

                }

                settlementMap[key].amount += remaining;

            });

        });


        /*
         * Convert map to array
         */

        const settlements =
            Object.values(settlementMap).map(item => ({

                from: item.from,

                to: item.to,

                amount: Number(
                    item.amount.toFixed(2)
                )

            }));


        /*
         * Final balances
         */

        Object.keys(balances).forEach(user => {

            balances[user] =
                Number(
                    balances[user].toFixed(2)
                );

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

        const settlements =
            expense.settlements || [];


        const settlement =
            settlements.find(
                s => s.id === settlementId
            );


        if (!settlement) {

            return res.json({

                success: false,

                message: "Settlement not found"

            });

        }


        const payAmount =
            Number(amount);


        if (
            isNaN(payAmount) ||
            payAmount <= 0
        ) {

            return res.json({

                success: false,

                message: "Invalid amount"

            });

        }


        if (
            payAmount >
            Number(settlement.remainingAmount)
        ) {

            return res.json({

                success: false,

                message:
                    "Amount exceeds remaining balance"

            });

        }


        settlement.payments.push({

            id:
                Date.now().toString(),

            amount: payAmount,

            method,

            paidAt:
                new Date().toISOString()

        });


        settlement.paidAmount =
            Number(
                (
                    Number(settlement.paidAmount || 0) +
                    payAmount
                ).toFixed(2)
            );


        settlement.remainingAmount =
            Number(
                (
                    Number(settlement.pendingAmount) -
                    settlement.paidAmount
                ).toFixed(2)
            );


        if (
            settlement.remainingAmount <= 0
        ) {

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

            message:
                "Payment Saved"

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};