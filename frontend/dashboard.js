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

        const expenses =
            await getCachedHistory();

        console.log(
            "Dashboard Expenses:",
            expenses
        );

        renderRecentExpenses(expenses);

        calculateSummary(expenses);

    }

    catch (err) {

        console.error(
            "Dashboard Error:",
            err
        );

        showToast(
            "Unable to load dashboard.",
            "error"
        );

    }

}

/* ==========================================
   RECENT EXPENSES
========================================== */

function renderRecentExpenses(expenses) {

    const list =
        document.getElementById("recentExpenseList");

    if (!expenses || expenses.length === 0) {

        list.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-receipt"></i>

                <p>
                    No expenses added yet.
                </p>

            </div>
        `;

        return;
    }

    // Latest 5 expenses
    const recent =
        [...expenses]
            .sort((a, b) => {

                const dateA =
                    new Date(a.date || a.createdAt);

                const dateB =
                    new Date(b.date || b.createdAt);

                return dateB - dateA;

            })
            .slice(0, 5);

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

    // View All button
    html += `

        <div class="view-all-wrapper">

            <a href="history.html" class="view-all-btn">

                View All Expenses

                <i class="fa-solid fa-arrow-right"></i>

            </a>

        </div>

    `;

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

    let monthlyTotal = 0;

    let monthlyExpenses = 0;

    let monthlyDays = new Set();

    let balance = 0;
    let yourPaidTotal = 0;
let yourReceivedTotal = 0;

    let groceryTotal = 0;

let groceryExpenses = 0;

let groceryDays = new Set();
let groceryPerHeadTotal = 0;

    expenses.forEach(expense => {

        const amount =
            Number(expense.amount) || 0;
            if (expense.paidBy === currentUser) {

    yourPaidTotal += amount;

}


        /* ==========================================
           MONTHLY SPENDING
        ========================================== */

        const expenseDate =
            new Date(
                expense.date || expense.createdAt
            );

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
   GROCERY SPENDING
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
           REAL BALANCE
           ONLY UNPAID AMOUNT
        ========================================== */

        const settlements =
            expense.settlements || [];

        settlements.forEach(settlement => {

            const remaining =
                Number(
                    settlement.remainingAmount || 0
                );

            if (remaining <= 0) {
                return;
            }

            if (
                settlement.from === currentUser
            ) {

                balance -= remaining;

            }

            if (
                settlement.to === currentUser
            ) {

                balance += remaining;

            }

        });

    });


    /* ==========================================
       AVERAGE PER DAY
    ========================================== */

    const days =
        monthlyDays.size || 1;

    const average =
        monthlyTotal / days;
        const groceryDayCount =
    groceryDays.size || 1;

const groceryAverage =
    groceryTotal / groceryDayCount;
    const groceryPerHeadDaily =
    groceryPerHeadTotal / groceryDayCount;
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
       SPENDING CARD
    ========================================== */

    document.getElementById(
        "monthlySpending"
    ).textContent =
        `₹${monthlyTotal.toFixed(2)}`;


    document.getElementById(
        "monthlySpendingMeta"
    ).textContent =
        `${monthlyExpenses} expenses • Avg ₹${average.toFixed(0)}/day`;



    /* ==========================================
       BALANCE CARD
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

        if (balanceStatus) {

            balanceStatus.textContent =
                "🟢 You will receive";

        }

    }

    else if (balance < -0.01) {

        balanceBox.textContent =
            `₹${Math.abs(balance).toFixed(2)}`;

        balanceBox.style.color =
            "#EF4444";

        if (balanceStatus) {

            balanceStatus.textContent =
                "🔴 You need to pay";

        }

    }

    else {

        balanceBox.textContent =
            "₹0.00";

        balanceBox.style.color =
            "#22C55E";

        if (balanceStatus) {

            balanceStatus.textContent =
                "🟢 You're all settled";

        }

    }

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
/* ==========================================
   LOGOUT
========================================== */

function logout() {

    localStorage.removeItem("currentUser");

    sessionStorage.removeItem("history");

    window.location.replace("index.html");

}