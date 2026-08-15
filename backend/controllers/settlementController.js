const db = require("../firebase/firebase");

/* ==========================================
   GET SETTLEMENT
========================================== */

exports.getSettlement = async (req, res) => {

    try {

        const snapshot = await db
            .collection("expenses")
            .get();

        /*
         * net[user] = user ko kitna dena/ lena hai
         *
         * Positive  = user ko paisa milna hai
         * Negative  = user ko paisa dena hai
         */

        const net = {};

        snapshot.forEach(doc => {

            const expense = doc.data();

            const settlements =
                expense.settlements || [];

            settlements.forEach(settlement => {

                /*
                 * Sirf unpaid amount consider karo.
                 *
                 * Paid settlement dobara calculation
                 * mein nahi aayega.
                 */

                const remaining =
                    Number(settlement.remainingAmount || 0);

                if (remaining <= 0) return;

                const from = settlement.from;
                const to = settlement.to;

                if (!net[from]) {
                    net[from] = 0;
                }

                if (!net[to]) {
                    net[to] = 0;
                }

                // from ko paisa dena hai
                net[from] -= remaining;

                // to ko paisa milna hai
                net[to] += remaining;

            });

        });


        /* ==========================================
           BALANCES
        ========================================== */

        const balances = {

            subham: Number(
                (net.subham || 0).toFixed(2)
            ),

            subhankar: Number(
                (net.subhankar || 0).toFixed(2)
            ),

            soumya: Number(
                (net.soumya || 0).toFixed(2)
            )

        };


        /* ==========================================
           CREATE DEBTORS / CREDITORS
        ========================================== */

        const creditors = [];
        const debtors = [];

        Object.keys(net).forEach(user => {

            const amount =
                Number(net[user].toFixed(2));

            if (amount > 0.01) {

                creditors.push({
                    user,
                    amount
                });

            }

            else if (amount < -0.01) {

                debtors.push({
                    user,
                    amount: Math.abs(amount)
                });

            }

        });


        /* ==========================================
           MINIMUM TRANSACTIONS
        ========================================== */

        const settlements = [];

        while (
            creditors.length &&
            debtors.length
        ) {

            const creditor = creditors[0];
            const debtor = debtors[0];

            const pay = Math.min(
                creditor.amount,
                debtor.amount
            );

            settlements.push({

                from: debtor.user,

                to: creditor.user,

                amount: Number(
                    pay.toFixed(2)
                )

            });

            creditor.amount =
                Number(
                    (creditor.amount - pay).toFixed(2)
                );

            debtor.amount =
                Number(
                    (debtor.amount - pay).toFixed(2)
                );


            if (creditor.amount <= 0.01) {

                creditors.shift();

            }

            if (debtor.amount <= 0.01) {

                debtors.shift();

            }

        }


        /* ==========================================
           RESPONSE
        ========================================== */

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