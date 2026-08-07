const axios = require("axios");

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function sendWhatsApp(phone, message) {
    try {

        return await axios.post(
            `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: phone,
                type: "text",
                text: {
                    body: message
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (err) {

        // 24-hour window closed
        if (err.response?.data?.error?.code === 131047) {

            console.log("Text failed -> Sending template...");

            return await axios.post(
                `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
                {
                    messaging_product: "whatsapp",
                    to: phone,
                    type: "template",
                    template: {
                        name: "hello_world",
                        language: {
                            code: "en_US"
                        }
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${TOKEN}`,
                        "Content-Type": "application/json"
                    }
                }
            );

        }

        throw err;
    }
}

module.exports = {
    sendWhatsApp
};