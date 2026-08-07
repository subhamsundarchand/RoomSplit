const db = require("../firebase/firebase");

// GET ALL
exports.getExpenses = async (req, res) => {

    try {

        const snapshot = await db.collection("expenses").get();

        const expenses = [];

        snapshot.forEach(doc => {

            expenses.push({
                id: doc.id,
                ...doc.data()
            });

        });

        res.json({
            success: true,
            data: expenses
        });

    }

    catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

};

// ADD
exports.addExpense = async (req, res) => {

    try {

        const members = req.body.members || [];

        if (members.length === 0) {

    return res.status(400).json({

        success: false,

        message: "At least one member is required"

    });

}

const amount = Number(req.body.amount);

if (isNaN(amount) || amount <= 0) {

    return res.status(400).json({

        success: false,

        message: "Invalid expense amount"

    });

}

const share = amount / members.length;

const settlements = [];

members.forEach(member => {

    if (member !== req.body.paidBy) {

        settlements.push({

    id:
        Date.now().toString() +
        Math.random().toString(36).substring(2, 8),

    from: member,

    to: req.body.paidBy,

    pendingAmount: Number(share.toFixed(2)),

    paidAmount: 0,

    remainingAmount: Number(share.toFixed(2)),

    payments: [],

    status: "Pending"

});

    }

});

const expense = {

    title: req.body.title,

    amount,

    category: req.body.category,

    paidBy: req.body.paidBy,

    members,

    settlements,

    date: req.body.date || new Date().toISOString(),

    createdAt: new Date()

};


        const ref = await db
            .collection("expenses")
            .add(expense);

        res.json({

            success: true,

            id: ref.id,

            message: "Expense Added Successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

};

// DELETE
exports.deleteExpense = async (req, res) => {

    try {

        const id = req.params.id;

        const doc = await db
            .collection("expenses")
            .doc(id)
            .get();

        if (!doc.exists) {

            return res.status(404).json({

                success: false,

                message: "Expense not found"

            });

        }

        await db
            .collection("expenses")
            .doc(id)
            .delete();

        res.json({

            success: true,

            message: "Expense Deleted Successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

};

// UPDATE
exports.updateExpense = async (req, res) => {

    try {

        const ref = db
            .collection("expenses")
            .doc(req.params.id);

        const doc = await ref.get();

        if (!doc.exists) {

            return res.status(404).json({

                success: false,

                message: "Expense not found"

            });

        }

        const oldExpense = doc.data();
        const members = req.body.members || [];

if (members.length === 0) {

    return res.status(400).json({

        success: false,

        message: "At least one member is required"

    });

}

const amount = Number(req.body.amount);

if (isNaN(amount) || amount <= 0) {

    return res.status(400).json({

        success: false,

        message: "Invalid expense amount"

    });

}


    

        const share = Number((amount / members.length).toFixed(2));

        const oldSettlements = oldExpense.settlements || [];

        const settlements = [];

        members.forEach(member => {

            if (member === req.body.paidBy) return;

            const old = oldSettlements.find(

    s =>

        s.from === member &&

        s.to === req.body.paidBy

);

            const paidAmount = old ? old.paidAmount : 0;

            const payments = old ? old.payments : [];

            const remainingAmount = Math.max(

                0,

                Number((share - paidAmount).toFixed(2))

            );

            let status = "Pending";

            if (paidAmount === 0) {

                status = "Pending";

            }

            else if (remainingAmount === 0) {

                status = "Paid";

            }

            else {

                status = "Partial";

            }

            settlements.push({

                id: old?.id ||

                    Date.now().toString() +

                    Math.random().toString(36).substring(2, 8),

                from: member,

                to: req.body.paidBy,

                pendingAmount: share,

                paidAmount,

                remainingAmount,

                status,

                payments

            });

        });

        await ref.update({

            title: req.body.title,

            amount,

            category: req.body.category,

            paidBy: req.body.paidBy,

            members,

            settlements,

            date: req.body.date || oldExpense.date

        });

        res.json({

            success: true,

            message: "Expense Updated Successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
// GET BY ID
exports.getExpenseById = async (req, res) => {

    try {

        const doc = await db
            .collection("expenses")
            .doc(req.params.id)
            .get();

        if (!doc.exists) {

            return res.json({
                success: false,
                message: "Expense not found"
            });

        }

        res.json({
            success: true,
            data: {
                id: doc.id,
                ...doc.data()
            }
        });

    }

    catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};