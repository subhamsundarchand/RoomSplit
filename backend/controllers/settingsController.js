const db = require("../firebase/firebase");

exports.saveSettings = async (req, res) => {

    try {

        const {

            user,

            pushNotification,

            whatsappReminder,

            reminderAfter,

            repeatEvery

        } = req.body;

        await db
            .collection("settings")
            .doc(user)
            .set({

                pushNotification,

                whatsappReminder,

                reminderAfter,

                repeatEvery

            });

        res.json({

            success: true,

            message: "Settings Saved"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
exports.getSettings = async (req, res) => {

    try {

        const doc = await db
            .collection("settings")
            .doc(req.params.user)
            .get();

        if (!doc.exists) {

            return res.json({

                success: true,

                data: {

                    pushNotification: false,

                    whatsappReminder: false,

                    reminderAfter: "3",

                    repeatEvery: "2"

                }

            });

        }

        res.json({

            success: true,

            data: doc.data()

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};