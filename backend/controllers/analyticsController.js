const db = require("../firebase/firebase");

exports.getAnalytics = async (req, res) => {

    try {

        const snapshot = await db
            .collection("expenses")
            .orderBy("createdAt", "desc")
            .get();

        const expenses = [];

        let totalExpense = 0;

        snapshot.forEach(doc => {

            const expense = {
                id: doc.id,
                ...doc.data()
            };

            totalExpense += Number(expense.amount || 0);

            expenses.push(expense);

        });

        res.json({

            success: true,

            totalExpense,

            totalTransactions: expenses.length,

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