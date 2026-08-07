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

        console.log(result);

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

    let total = 0;

    let balance = 0;

    expenses.forEach(expense => {

        const amount =
            Number(expense.amount);

        total += amount;

        const members =
            expense.members || [];

        const share =
            amount / members.length;

        if (expense.paidBy === currentUser) {

            balance += amount;

        }

        if (members.includes(currentUser)) {

            balance -= share;

        }

    });

    document.getElementById("totalExpense")
        .textContent =
        `₹${total.toFixed(2)}`;

    const balanceBox =
        document.getElementById("yourBalance");

    balanceBox.textContent =
        `₹${balance.toFixed(2)}`;

    if (balance > 0) {

        balanceBox.style.color = "#22C55E";

    }

    else if (balance < 0) {

        balanceBox.style.color = "#EF4444";

    }

    else {

        balanceBox.style.color = "#ffffff";

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