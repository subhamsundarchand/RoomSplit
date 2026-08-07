/* ==========================================
   RoomSplit Analytics
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    checkLogin();

    setupFilters();

    setupCustomButton();

    allExpenses = await getCachedHistory();

    applyFilter("today");

});

/* ==========================================
   GLOBAL CACHE
========================================== */

/* ==========================================
   LOGIN
========================================== */

function checkLogin() {

    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {

        window.location.href = "index.html";

    }

}

/* ==========================================
   GLOBAL
========================================== */

let currentFilter = "today";

let allExpenses = [];

/* ==========================================
   FILTER BUTTONS
========================================== */

function setupFilters() {

    const buttons =
        document.querySelectorAll(".filter-btn");

    buttons.forEach(btn => {

        btn.addEventListener("click", async () => {

            buttons.forEach(item =>
                item.classList.remove("active")
            );

            btn.classList.add("active");

            currentFilter =
                btn.dataset.filter;

            /* -------------------------
               Custom Date
            ------------------------- */

            if (currentFilter === "custom") {

                document
                    .getElementById("customDateBox")
                    .classList
                    .remove("hidden");

                return;

            }

            document
                .getElementById("customDateBox")
                .classList
                .add("hidden");

            applyFilter(currentFilter);

        });

    });

}

/* ==========================================
   CUSTOM REPORT BUTTON
========================================== */

function setupCustomButton() {

    document
        .getElementById("showReportBtn")
        .addEventListener("click", async () => {

            const from =
                document
                    .getElementById("fromDate")
                    .value;

            const to =
                document
                    .getElementById("toDate")
                    .value;

            if (!from || !to) {

                alert("Select From & To Date");

                return;

            }

            applyFilter(
                "custom",
                from,
                to
            );

        });

}

/* ==========================================
   LOAD ANALYTICS
========================================== */

// async function loadAnalytics(
//     type,
//     from = "",
//     to = ""
// ) {

//     try {

//         const result = await getHistory();

// console.log(result);
// console.log("All Expenses:", result.data);
// console.log("First Expense Date:", result.data[0]?.date);

//         if (!result.success) {

//             alert(result.message);

//             return;

//         }

//         let expenses = result.data || [];
//         expenses = filterExpenses(
//     expenses,
//     type,
//     from,
//     to
// );

// allExpenses = expenses;

//         renderAnalytics(allExpenses);

//         updateSummary(allExpenses);

//     }

//     catch (error) {

//         console.error(error);

//         alert("Unable to load analytics.");

//     }

// }

/* ==========================================
   RENDER
========================================== */

function renderAnalytics(expenses) {

    const list = document.getElementById("expenseList");

    list.innerHTML = "";

    if (!expenses.length) {

        list.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-chart-line"></i>
                <p>No Expense Found</p>
            </div>
        `;

        return;

    }

    let html = "";

    for (let i = expenses.length - 1; i >= 0; i--) {
        const expense = expenses[i];


        html += `

        <div class="expense-card">

            <div class="expense-top">

                <div>

                    <div class="expense-title">
                        ${expense.title}
                    </div>

                    <div class="expense-category">
                        ${expense.category}
                    </div>

                </div>

                <div class="expense-price">
                    ₹${Number(expense.amount).toFixed(2)}
                </div>

            </div>

            <div class="expense-bottom">

                <span>
                    👤 Paid by ${expense.paidBy}
                </span>

                <span>
                    📅 ${new Date(expense.date).toLocaleDateString()}
                </span>

            </div>

        </div>

        `;

    }

    list.innerHTML = html;

}

/* ==========================================
   SUMMARY
========================================== */

function updateSummary(expenses) {

    document
        .getElementById("transactionCount")
        .textContent =
        expenses.length;

    let total = 0;

    expenses.forEach(item => {

        total += Number(item.amount);

    });

    document
        .getElementById("totalExpense")
        .textContent =
        "₹" + total.toFixed(2);

}
function filterExpenses(expenses, type, from = "", to = "") {

    const today = new Date();

    return expenses.filter(exp => {

        const d = new Date(exp.date);

        switch (type) {

            case "today":
                return d.toDateString() === today.toDateString();

            case "yesterday":
                const y = new Date(today);
                y.setDate(y.getDate() - 1);
                return d.toDateString() === y.toDateString();

            case "week":
                const week = new Date(today);
                week.setDate(today.getDate() - 7);
                return d >= week;

            case "month":
                return d.getMonth() === today.getMonth() &&
                       d.getFullYear() === today.getFullYear();

            case "lastMonth":
                const lastMonth = new Date(today);

lastMonth.setMonth(today.getMonth() - 1);

return d.getMonth() === lastMonth.getMonth() &&
       d.getFullYear() === lastMonth.getFullYear();

            case "custom":
                return d >= new Date(from) &&
                       d <= new Date(to);

            default:
                return true;
        }

    });

}
function applyFilter(type, from = "", to = "") {

    const filtered = filterExpenses(
        allExpenses,
        type,
        from,
        to
    );

    renderAnalytics(filtered);

    updateSummary(filtered);

}