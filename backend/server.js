
require("dotenv").config();


const razorpayRoutes = require("./routes/razorpayRoutes");
const whatsappRoutes =
require("./routes/whatsappRoutes");
const settlementRoutes =
require("./routes/settlementRoutes");
const settingsRoutes =
require("./routes/settingsRoutes");
const analyticsRoutes =
require("./routes/analyticsRoutes");
const historyRoutes =
require("./routes/historyRoutes");
const dashboardRoutes =
require("./routes/dashboardRoutes");

const express = require("express");

const cors = require("cors");



const db = require("./firebase/firebase");



const expenseRoutes =

require("./routes/expenseRoutes");
const memberRoutes =
require("./routes/memberRoutes");



const app = express();



app.use(cors());



app.use(express.json());



app.use(

    "/api/expenses",

    expenseRoutes

);

app.use(
    "/api/members",
    memberRoutes
);
app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/history",
    historyRoutes
);
app.use(
    "/api/analytics",
    analyticsRoutes
);
app.use(
    "/api/settlement",
    settlementRoutes
);
app.use(
    "/api/settings",
    settingsRoutes
);
app.use(
    "/api/whatsapp",
    whatsappRoutes
);
app.use(
    "/api/razorpay",
    razorpayRoutes
);
app.get("/", async (req, res) => {



    try {



        const snapshot =

        await db.collection("expenses").get();



        res.json({

            success: true,

            documents: snapshot.size

        });



    }



    catch(err){



        res.status(500).json({

            success:false,

            error:err.message

        });



    }



});



app.listen(8000, () => {



    console.log("✅ Server running");



});
app.get("/test", async (req, res) => {

    try {

        const ref = await db
            .collection("expenses")
            .add({

                title: "Burger",

                amount: 250,

                category: "Food",

                paidBy: "Subham",

                members: [

                    "Subham",

                    "Soumya",

                    "Subhankar"

                ],

                createdAt: new Date()

            });

        res.json({

            success: true,

            id: ref.id

        });

    }

    catch(err){

        res.json(err);

    }

});