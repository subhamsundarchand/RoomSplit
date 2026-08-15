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

        const result = await getCachedHistory();

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


    /* ==========================================
       DATE
    ========================================== */

    const now = new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();


    /* ==========================================
       CURRENT MONTH
    ========================================== */

    let monthlyTotal = 0;

    let monthlyCount = 0;


    expenses.forEach(expense => {

        const date =
            getExpenseDate(expense.createdAt || expense.date);

        if (!date) return;


        if (
            date.getFullYear() === currentYear &&
            date.getMonth() === currentMonth
        ) {

            monthlyTotal +=
                Number(expense.amount) || 0;

            monthlyCount++;

        }

    });


    /* ==========================================
       AVERAGE PER ELAPSED DAY
    ========================================== */

    const elapsedDays =
        now.getDate();

    const dailyAverage =
        elapsedDays > 0
            ? monthlyTotal / elapsedDays
            : 0;


    /* ==========================================
       LAST MONTH
    ========================================== */

    const lastMonthDate =
        new Date(
            currentYear,
            currentMonth - 1,
            1
        );

    const lastMonthYear =
        lastMonthDate.getFullYear();

    const lastMonth =
        lastMonthDate.getMonth();


    let lastMonthTotal = 0;


    expenses.forEach(expense => {

        const date =
            getExpenseDate(expense.createdAt || expense.date);

        if (!date) return;


        if (
            date.getFullYear() === lastMonthYear &&
            date.getMonth() === lastMonth
        ) {

            lastMonthTotal +=
                Number(expense.amount) || 0;

        }

    });


    /* ==========================================
       MONTHLY COMPARISON
    ========================================== */

    let comparisonText =
        "— No comparison yet";

    let comparisonClass =
        "comparison-neutral";


    if (lastMonthTotal > 0) {

        const percentage =
            (
                (
                    monthlyTotal -
                    lastMonthTotal
                ) /
                lastMonthTotal
            ) * 100;


        const rounded =
            Math.abs(percentage).toFixed(0);


        if (percentage > 0.01) {

            comparisonText =
                `↑ ${rounded}% vs last month`;

            comparisonClass =
                "comparison-up";

        }

        else if (percentage < -0.01) {

            comparisonText =
                `↓ ${rounded}% vs last month`;

            comparisonClass =
                "comparison-down";

        }

        else {

            comparisonText =
                "— Same as last month";

            comparisonClass =
                "comparison-neutral";

        }

    }


    /* ==========================================
       SPENDING CARD
    ========================================== */

    const monthlySpending =
        document.getElementById(
            "monthlySpending"
        );


    const monthlySpendingMeta =
        document.getElementById(
            "monthlySpendingMeta"
        );


    const monthlyComparison =
        document.getElementById(
            "monthlyComparison"
        );


    if (monthlySpending) {

        monthlySpending.textContent =
            `₹${monthlyTotal.toFixed(2)}`;

    }


    if (monthlySpendingMeta) {

        monthlySpendingMeta.textContent =
            `${monthlyCount} ${
                monthlyCount === 1
                    ? "expense"
                    : "expenses"
            } • Avg ₹${dailyAverage.toFixed(0)}/day`;

    }


    if (monthlyComparison) {

        monthlyComparison.textContent =
            comparisonText;

        monthlyComparison.className =
            comparisonClass;

    }


    /* ==========================================
       YOUR BALANCE
    ========================================== */

    let balance = 0;


    expenses.forEach(expense => {

        const amount =
            Number(expense.amount) || 0;

        const members =
            expense.members || [];


        if (!members.length) return;


        const share =
            amount / members.length;


        if (expense.paidBy === currentUser) {

            balance += amount;

        }


        if (members.includes(currentUser)) {

            balance -= share;

        }

    });


    const balanceBox =
        document.getElementById(
            "yourBalance"
        );


    const balanceStatus =
        document.getElementById(
            "balanceStatus"
        );


    if (balanceBox) {

        balanceBox.textContent =
            `₹${Math.abs(balance).toFixed(2)}`;

    }


    if (balanceStatus) {

        if (balance > 0.01) {

            balanceStatus.textContent =
                "🟢 You will receive";

            balanceStatus.className =
                "balance-receive";

        }

        else if (balance < -0.01) {

            balanceStatus.textContent =
                "🔴 You need to pay";

            balanceStatus.className =
                "balance-pay";

        }

        else {

            balanceStatus.textContent =
                "⚪ You're all settled";

            balanceStatus.className =
                "balance-settled";

        }

    }


    /* ==========================================
       BALANCE COLOR
    ========================================== */

    if (balanceBox) {

        if (balance > 0.01) {

            balanceBox.style.color =
                "#22C55E";

        }

        else if (balance < -0.01) {

            balanceBox.style.color =
                "#EF4444";

        }

        else {

            balanceBox.style.color =
                "#ffffff";

        }

    }

}


/* ==========================================
   EXPENSE DATE
========================================== */

function getExpenseDate(value) {

    if (!value) return null;


    let date;


    if (value.seconds) {

        date =
            new Date(
                value.seconds * 1000
            );

    }

    else if (value._seconds) {

        date =
            new Date(
                value._seconds * 1000
            );

    }

    else if (
        typeof value.toDate === "function"
    ) {

        date =
            value.toDate();

    }

    else {

        date =
            new Date(value);

    }


    if (isNaN(date.getTime())) {

        return null;

    }


    return date;

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