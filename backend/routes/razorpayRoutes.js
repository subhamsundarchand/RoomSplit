const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const router = express.Router();
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Razorpay route is working"
    });
});

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

router.post("/create-order", async (req, res) => {

    try {

        const {
            expenseId,
            settlementId,
            amount
        } = req.body;

        if (!expenseId || !settlementId || !amount) {

            return res.status(400).json({
                success: false,
                message: "Missing payment details"
            });

        }

        const payAmount = Number(amount);

        if (
            !Number.isFinite(payAmount) ||
            payAmount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid payment amount"
            });

        }

        // Razorpay expects amount in paise
        const amountInPaise =
            Math.round(payAmount * 100);

        const order =
            await razorpay.orders.create({

                amount: amountInPaise,

                currency: "INR",

                receipt:
                    `rs_${Date.now()}`,

                notes: {

                    expenseId,

                    settlementId

                }

            });

        res.json({

            success: true,

            orderId: order.id,

            amount: order.amount,

            currency: order.currency

        });

    }

    catch (err) {

        console.error(
            "Razorpay Create Order Error:",
            err
        );

        res.status(500).json({

            success: false,

            message:
                err.error?.description ||
                err.message ||
                "Unable to create Razorpay order"

        });

    }

});


// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

router.post("/verify", async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Missing Razorpay payment details"

            });

        }

        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(body)
                .digest("hex");

        const isValid =
            crypto.timingSafeEqual(
                Buffer.from(expectedSignature),
                Buffer.from(razorpay_signature)
            );

        if (!isValid) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment signature"

            });

        }

        res.json({

            success: true,

            verified: true,

            paymentId:
                razorpay_payment_id,

            orderId:
                razorpay_order_id,

            message:
                "Payment verified successfully"

        });

    }

    catch (err) {

        console.error(
            "Razorpay Verification Error:",
            err
        );

        res.status(500).json({

            success: false,

            message:
                "Payment verification failed"

        });

    }

});


module.exports = router;