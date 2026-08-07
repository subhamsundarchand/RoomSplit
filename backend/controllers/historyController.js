const db = require("../firebase/firebase");

exports.getHistory = async (req, res) => {

    try {

        const snapshot = await db
            .collection("expenses")
            .orderBy("createdAt", "desc")
            .get();

        const history = [];

        snapshot.forEach(doc => {

            history.push({

                id: doc.id,

                ...doc.data()

            });

        });

        res.json({

            success: true,

            data: history

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

};