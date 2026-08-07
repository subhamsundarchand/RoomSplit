const service = require("../services/whatsappService");
console.log(service);
const { sendWhatsApp } =
require("../services/whatsappService");

exports.sendTest = async (req, res) => {

    try {

        const {
            phone,
            message
        } = req.body;

        console.log("PHONE RECEIVED:", phone);

        await sendWhatsApp(
            phone,
            message
        );

        res.json({
            success: true,
            message: "WhatsApp Sent"
        });

    }

    catch (err) {

        console.log("STATUS:", err.response?.status);
        console.log("DATA:", err.response?.data);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

};