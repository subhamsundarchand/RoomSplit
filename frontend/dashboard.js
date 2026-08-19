/* ==========================================
   RoomSplit Dashboard
========================================== */

document.addEventListener("DOMContentLoaded", initDashboard);

/* ==========================================
   INIT
========================================== */

async function initDashboard() {

    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {

        window.location.replace("index.html");
        return;

    }

    document.getElementById("welcomeText").textContent =
        `Hi, ${getName(currentUser)} 👋`;

    document
        .getElementById("logoutBtn")
        .addEventListener("click", logout);

    await loadDashboard();

}

/* ==========================================
   LOAD DASHBOARD
========================================== */

async function loadDashboard() {

    try {

        const result = await getHistory();

        console.log("Dashboard Result:", result);

        const expenses = result.data;

        renderRecentExpenses(expenses);

        calculateSummary(expenses);

    }

    catch (err) {

        console.error(err);

        alert("Unable to load dashboard.");

    }

}

/* ==========================================
   RECENT EXPENSES
========================================== */

function renderRecentExpenses(expenses) {

    const list =
        document.getElementById("recentExpenseList");

    const recent = expenses.slice(-5).reverse();

let html = "";

recent.forEach(expense => {

    html += `

        <div class="expense-item">

            <div>

                <div class="expense-title">
                    ${expense.title}
                </div>

                <small>
                    ${expense.category}
                </small>

            </div>

            <div style="text-align:right">

                <b>
                    ₹${Number(expense.amount).toFixed(2)}
                </b>

                <br>

                <small>
                    ${getName(expense.paidBy)}
                </small>

            </div>

        </div>

        `;

    });

list.innerHTML = html;
}
/* ==========================================
   SUMMARY
========================================== */

function calculateSummary(expenses) {

    const currentUser =
        localStorage.getItem("currentUser");

    const now = new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();


    /* ==========================================
       VARIABLES
    ========================================== */

    let monthlyTotal = 0;

    let monthlyExpenses = 0;

    let monthlyDays = new Set();


    let groceryTotal = 0;

    let groceryExpenses = 0;

    let groceryDays = new Set();

    let groceryPerHeadTotal = 0;


   let yourPaidTotal = 0;

let yourSettlementPaidTotal = 0;

let yourSettlementReceivedTotal = 0;

let balance = 0;
    


    /* ==========================================
       PROCESS EXPENSES
    ========================================== */

    expenses.forEach(expense => {

        const amount =
            Number(expense.amount) || 0;

        const expenseDate =
            new Date(
                expense.date || expense.createdAt
            );


        /* ==========================================
           THIS MONTH - TOTAL ROOM SPENDING
        ========================================== */

        if (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
        ) {

            monthlyTotal += amount;

            monthlyExpenses++;

            monthlyDays.add(
                expenseDate.toISOString().split("T")[0]
            );

        }


        /* ==========================================
           GROCERY
        ========================================== */

        if (
            expense.category &&
            expense.category.toLowerCase() === "grocery" &&
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
        ) {

            groceryTotal += amount;

            groceryExpenses++;

            groceryDays.add(
                expenseDate.toISOString().split("T")[0]
            );


            const members =
                expense.members || [];

            const memberCount =
                members.length;


            if (memberCount > 0) {

                groceryPerHeadTotal +=
                    amount / memberCount;

            }

        }


        /* ==========================================
           YOUR ACTUAL PAID AMOUNT
        ========================================== */

        if (
    expense.paidBy === currentUser &&
    expenseDate.getMonth() === currentMonth &&
    expenseDate.getFullYear() === currentYear
) {

    yourPaidTotal += amount;

}


        /* ==========================================
           SETTLEMENTS
        ========================================== */

        const settlements =
            expense.settlements || [];


        settlements.forEach(settlement => {

    const remaining =
        Number(settlement.remainingAmount || 0);

    /* ==========================================
       ACTUAL CASH / UPI PAYMENTS
    ========================================== */

    const payments =
        Array.isArray(settlement.payments)
            ? settlement.payments
            : [];

    const actualPaid =
        payments.reduce(
            (total, payment) =>
                total + (Number(payment.amount) || 0),
            0
        );


    /* ==========================================
       SETTLEMENT MONEY PAID
    ========================================== */

    if (settlement.from === currentUser) {

        yourSettlementPaidTotal +=
            actualPaid;

    }


    /* ==========================================
       SETTLEMENT MONEY RECEIVED
    ========================================== */

    if (settlement.to === currentUser) {

        yourSettlementReceivedTotal +=
            actualPaid;

    }


    /* ==========================================
       REMAINING BALANCE
    ========================================== */

    if (remaining > 0) {

        if (settlement.from === currentUser) {

            balance -= remaining;

        }

        if (settlement.to === currentUser) {

            balance += remaining;

        }

    }

});

    });


    /* ==========================================
       YOUR CURRENT SPENDING
    ========================================== */
    const yourSpending =
    yourPaidTotal -
    yourSettlementReceivedTotal +
    yourSettlementPaidTotal


    /* ==========================================
       GROCERY AVERAGE
    ========================================== */

    const groceryDayCount =
        groceryDays.size || 1;

    const groceryAverage =
        groceryTotal /
        groceryDayCount;

    const groceryPerHeadDaily =
        groceryPerHeadTotal /
        groceryDayCount;


    /* ==========================================
       MONTHLY AVERAGE
    ========================================== */

    const monthlyDayCount =
        monthlyDays.size || 1;

    const monthlyAverage =
        monthlyTotal /
        monthlyDayCount;


    /* ==========================================
       TOTAL ROOM SPENDING
    ========================================== */

    document.getElementById(
        "monthlySpending"
    ).textContent =
        `₹${monthlyTotal.toFixed(2)}`;


    document.getElementById(
        "monthlySpendingMeta"
    ).textContent =
        `${monthlyExpenses} expenses • Avg ₹${monthlyAverage.toFixed(0)}/day`;


    /* ==========================================
       GROCERY CARD
    ========================================== */

    document.getElementById(
        "grocerySpending"
    ).textContent =
        `₹${groceryTotal.toFixed(2)}`;


    document.getElementById(
    "grocerySpendingMeta"
).innerHTML =
    `${groceryExpenses} grocery expenses • Avg ₹${groceryAverage.toFixed(0)}/day<br>
     <strong>₹${groceryPerHeadDaily.toFixed(2)} per head/day</strong>`;


/* ==========================================
   YOUR SPENDING
========================================== */

const yourSpendingBox =
    document.getElementById(
        "yourSpending"
    );

yourSpendingBox.textContent =
    `₹${Math.max(0, yourSpending).toFixed(2)}`;
    /* ==========================================
       HAVE TO PAY
    ========================================== */

    const balanceBox =
        document.getElementById(
            "yourBalance"
        );

    const balanceStatus =
        document.getElementById(
            "balanceStatus"
        );


    if (balance > 0.01) {

        balanceBox.textContent =
            `₹${balance.toFixed(2)}`;

        balanceBox.style.color =
            "#22C55E";

        balanceStatus.textContent =
            "🟢 You will get";

    }

    else if (balance < -0.01) {

        balanceBox.textContent =
            `₹${Math.abs(balance).toFixed(2)}`;

        balanceBox.style.color =
            "#EF4444";

        balanceStatus.textContent =
            "🔴 You need to pay";

    }

    else {

        balanceBox.textContent =
            "₹0.00";

        balanceBox.style.color =
            "#22C55E";

        balanceStatus.textContent =
            "🟢 You're Settled";

    }

}

/* ==========================================
   LOGOUT
========================================== */

function logout() {

    localStorage.removeItem("currentUser");

    window.location.replace("index.html");

}

/* ==========================================
   USER NAME
========================================== */

function getName(id) {

    switch (id) {

        case "subham":
            return "Subham";

        case "subhankar":
            return "Subhankar";

        case "soumya":
            return "Soumya";

        default:
            return id;

    }

}
