const db = require("../firebase/firebase");

exports.getDashboard = async (req, res) => {

    try {

        const snapshot =
            await db.collection("expenses").get();

        const expenses = [];

        let totalExpense = 0;

        snapshot.forEach(doc => {

            const expense = {

                id: doc.id,

                ...doc.data()

            };

            expenses.push(expense);

            totalExpense += Number(
                expense.amount || 0
            );

        });

        expenses.sort((a, b) => {

            return new Date(b.date)
                - new Date(a.date);

        });

        res.json({

            success: true,

            totalExpense,

            totalTransactions:
                expenses.length,

            recentExpenses:
                expenses.slice(0, 5)

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

};