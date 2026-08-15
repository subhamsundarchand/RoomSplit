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
        amount: 0,
        date: expense.createdAt || expense.date || null
    };

}

settlementMap[key].amount += remaining;

// Latest expense date rakho
const currentDate =
    expense.createdAt?.toDate
        ? expense.createdAt.toDate()
        : new Date(
            expense.createdAt ||
            expense.date ||
            0
        );

const existingDate =
    settlementMap[key].date?.toDate
        ? settlementMap[key].date.toDate()
        : new Date(
            settlementMap[key].date || 0
        );

if (currentDate > existingDate) {

    settlementMap[key].date =
        expense.createdAt ||
        expense.date ||
        null;

}

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
        ),

        date: item.date

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
/* ==========================================
   MARK SUMMARY SETTLEMENT PAID
========================================== */

exports.markSummarySettlementPaid = async (req, res) => {

    try {

        const {
            from,
            to,
            amount,
            method
        } = req.body;


        const payAmount = Number(amount);


        if (!from || !to) {

            return res.status(400).json({

                success: false,

                message: "Payer and receiver are required"

            });

        }


        if (
            !Number.isFinite(payAmount) ||
            payAmount <= 0
        ) {

            return res.status(400).json({

                success: false,

                message: "Invalid payment amount"

            });

        }


        const snapshot = await db
            .collection("expenses")
            .get();


        let remainingPayment =
            Number(payAmount.toFixed(2));


        const updates = [];


        for (const doc of snapshot.docs) {

            if (remainingPayment <= 0.01) {
                break;
            }


            const expense = doc.data();

            const settlements =
                Array.isArray(expense.settlements)
                    ? expense.settlements
                    : [];


            let changed = false;


            for (const settlement of settlements) {

                if (remainingPayment <= 0.01) {
                    break;
                }


                if (
                    settlement.from !== from ||
                    settlement.to !== to
                ) {

                    continue;

                }


                const remainingAmount =
                    Number(
                        settlement.remainingAmount || 0
                    );


                if (
                    !Number.isFinite(remainingAmount) ||
                    remainingAmount <= 0.01
                ) {

                    continue;

                }


                const paymentAmount =
                    Number(
                        Math.min(
                            remainingPayment,
                            remainingAmount
                        ).toFixed(2)
                    );


                if (!Array.isArray(settlement.payments)) {

                    settlement.payments = [];

                }


                settlement.payments.push({

                    id:
                        Date.now().toString() +
                        Math.random()
                            .toString(36)
                            .substring(2, 8),

                    amount: paymentAmount,

                    method:
                        method || "Cash",

                    paidAt:
                        new Date().toISOString()

                });


                settlement.paidAmount =
                    Number(
                        (
                            Number(
                                settlement.paidAmount || 0
                            ) +
                            paymentAmount
                        ).toFixed(2)
                    );


                settlement.remainingAmount =
                    Number(
                        Math.max(
                            0,
                            Number(
                                settlement.pendingAmount || 0
                            ) -
                            settlement.paidAmount
                        ).toFixed(2)
                    );


                if (
                    settlement.remainingAmount <= 0.01
                ) {

                    settlement.remainingAmount = 0;

                    settlement.status = "Paid";

                }

                else {

                    settlement.status = "Partial";

                }


                remainingPayment =
                    Number(
                        (
                            remainingPayment -
                            paymentAmount
                        ).toFixed(2)
                    );


                changed = true;

            }


            if (changed) {

                updates.push({

                    ref: doc.ref,

                    settlements

                });

            }

        }


        if (remainingPayment > 0.01) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment exceeds pending settlement",

                remainingAmount:
                    remainingPayment

            });

        }


        for (const update of updates) {

            await update.ref.update({

                settlements:
                    update.settlements

            });

        }


        return res.json({

            success: true,

            message: "Payment Saved",

            from,

            to,

            amount: payAmount,

            method:
                method || "Cash"

        });

    }

    catch (err) {

        console.error(
            "SUMMARY SETTLEMENT ERROR:",
            err
        );


        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};