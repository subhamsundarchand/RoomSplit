/* ==========================================
   RoomSplit History
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    checkLogin();

    await loadHistory();

    setupSearch();
    document
    .getElementById("closeSettlementModal")
    .addEventListener("click", closeSettlementModal);

    document
        .getElementById("cancelSettlementBtn")
        .addEventListener("click", () => {

            document
                .getElementById("settlementModal")
                .classList
                .add("hidden");

        });

    document
        .getElementById("confirmSettlementBtn")
        .addEventListener("click", confirmSettlement);
        document
    .getElementById("copyUpiBtn")
    .addEventListener("click", () => {

        navigator.clipboard.writeText(
            document.getElementById("upiIdText").textContent
        );

        alert("UPI ID Copied ✅");

    });


        document
    .querySelectorAll(".payment-card")
    .forEach(card => {

        card.addEventListener("click", () => {

            document
                .querySelectorAll(".payment-card")
                .forEach(c => c.classList.remove("active"));

            card.classList.add("active");

            document.getElementById("paymentMethod").value =
                card.dataset.method;

        });

    });
});




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
   LOAD
========================================== */

let allExpenses = [];

async function loadHistory() {

    const expenses = await getCachedHistory(true);

    allExpenses = expenses;

    sessionStorage.setItem(
        "history",
        JSON.stringify(allExpenses)
    );

    await renderHistory(allExpenses);

}

/* ==========================================
   RENDER
========================================== */

async function renderHistory(expenses) {

    const list = document.getElementById("historyList");

    list.innerHTML = "";

    if (!expenses.length) {

        list.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-receipt"></i>
                <p>No Expenses Found</p>
            </div>
        `;

        return;

    }

    for (const expense of expenses.slice().reverse()) {

        const settlements = expense.settlements || [];

        let settlementHTML = "";

        if (!settlements.length) {

            settlementHTML = `
                <small>No Settlement</small>
            `;

        } else {

            settlements.forEach(item => {

                settlementHTML += `

                <div class="settlement-item">

    <div class="settlement-left">

        ${
            item.status === "Paid"
                ? "✅"
                : item.status === "Partial"
                ? "🟠"
                : "🟡"
        }

        ${getName(item.from)}

        → Pay

        ₹${Number(item.remainingAmount).toFixed(2)}

    </div>

    ${
        item.status !== "Paid"
        ? `

<div class="settlement-actions">

    <button
        class="settle-btn"
        onclick="openSettlement(this,'${item.id}')">

        💸 Settle

    </button>

    <button
        class="reminder-btn"
        onclick="openReminder('${expense.id}','${item.id}', this)">

        <i class="fa-brands fa-whatsapp"></i>

        Reminder

    </button>

</div>

`
        : `

<div class="paid-info">

    <div class="paid-badge">

        ✅ Paid via ${item.method || "Cash"}

    </div>

    <small>

        ${item.paidAt
            ? new Date(item.paidAt).toLocaleString()
            : ""}

    </small>

</div>

`
    }

</div>

                `;

            });

        }

        list.innerHTML += `

        <div class="expense-item">

    <div class="expense-header">

        <div class="expense-info">

            <h3>${expense.title}</h3>

            <small>
                ${expense.category} • Paid by ${getName(expense.paidBy)}
            </small>

        </div>

        <div class="expense-top-right">

            <h2>₹${Number(expense.amount).toFixed(2)}</h2>

            <small class="expense-date">
                ${formatExpenseDate(expense.createdAt)}
            </small>

        </div>

    </div>

    <div class="settlement-box">

        <b>Settlement</b>

        ${settlementHTML}

    </div>

    <div class="expense-footer">

        <button onclick="editExpense('${expense.id}')">
            <i class="fa-solid fa-pen"></i>
        </button>

        <button onclick="removeExpense(this,'${expense.id}')">
            <i class="fa-solid fa-trash"></i>
        </button>
         </div>

    </div>

        `;

    }

}

/* ==========================================
   SEARCH
========================================== */

function setupSearch() {

    document
        .getElementById("searchInput")
        .addEventListener("input", async function () {

            const keyword =
                this.value
                    .toLowerCase();

            const filtered =
                allExpenses.filter(expense =>

                    expense.title
                        .toLowerCase()
                        .includes(keyword)

                );

            await renderHistory(filtered);

        });

}

/* ==========================================
   DELETE
========================================== */
async function removeExpense(btn, id) {
console.log("DELETE ID:", id);


    if (!confirm("Are you sure you want to delete this expense?")) {

    return;

}

    const card = btn.closest(".expense-item");

    if (card) {
        card.style.opacity = "0.5";
        card.style.pointerEvents = "none";
    }

    const result = await deleteExpense(id);

    console.log(result);

    if (result.success) {

        sessionStorage.removeItem("dashboard");
        sessionStorage.removeItem("history");
        sessionStorage.removeItem("settlements");

        await loadHistory();

    } else {

        if (card) {
            card.style.opacity = "1";
            card.style.pointerEvents = "auto";
        }

        showToast(result.message, "error");

    }

}

/* ==========================================
   EDIT
========================================== */

async function editExpense(id) {

    localStorage.setItem(

        "editExpenseId",

        id

    );

    window.location.href =
        "add-expense.html?edit=true";

}

/* ==========================================
   USER NAME
========================================== */

function getName(id) {

    switch(id){

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
   DATE FORMAT
========================================== */

function formatExpenseDate(createdAt) {

    if (!createdAt) return "";

    let d;

    if (createdAt.seconds) {

        d = new Date(createdAt.seconds * 1000);

    }

    else if (createdAt._seconds) {

        d = new Date(createdAt._seconds * 1000);

    }

    else if (createdAt.toDate) {

        d = createdAt.toDate();

    }

    else {

        d = new Date(createdAt);

    }

    if (isNaN(d.getTime())) return "";

    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const expenseDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const time = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    if (+expenseDay === +today)
        return `Today • ${time}`;

    if (+expenseDay === +yesterday)
        return `Yesterday • ${time}`;

    if (d.getFullYear() === now.getFullYear()) {

        return `${d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short"
        })} • ${time}`;

    }

    return `${d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    })} • ${time}`;
}
/* ==========================================
   UPI IDS
========================================== */

const UPI_IDS = {

    subham: "7008231710@upi",

    subhankar: "subhankarpadhiary264-2@okhdfcbank",

    soumya: "soumyapanda0789@okicici"

};
/* ==========================================
   SETTLEMENT
========================================== */

let currentSettlementId = null;
let currentSettlementButton = null;

function openSettlement(btn, id) {
    console.log("Clicked Settlement:", id);

    currentSettlementId = id;

    currentSettlementButton = btn;

    const expense = allExpenses.find(exp =>
        exp.settlements?.some(s => s.id === id)
    );

    if (expense) {

        const settlement = expense.settlements.find(s => s.id === id);

        document.getElementById("paymentAmount").textContent =
    `₹${Number(settlement.remainingAmount).toFixed(2)}`;

        document.getElementById("paymentReceiver").textContent =
            getName(expense.paidBy);

    }

    document
        .querySelectorAll(".payment-card")
        .forEach(card => card.classList.remove("active"));

    document
        .querySelector(".payment-card[data-method='Cash']")
        .classList.add("active");

    document.getElementById("paymentMethod").value = "Cash";

    document
        .getElementById("settlementModal")
        .classList
        .remove("hidden");

}


async function confirmSettlement() {

    const confirmBtn =
        document.getElementById("confirmSettlementBtn");

    const method =
        document.getElementById("paymentMethod").value;

    const expense = allExpenses.find(exp =>
        exp.settlements?.some(
            s => s.id === currentSettlementId
        )
    );

    if (!expense) return;

    const settlement =
        expense.settlements.find(
            s => s.id === currentSettlementId
        );

    if (!settlement) return;

    const receiver = expense.paidBy;

    const upiId = UPI_IDS[receiver];

// ==========================
// STEP 1 : OPEN PAYMENT
// ==========================

if (
    method !== "Cash" &&
    confirmBtn.dataset.step !== "pay"
) {

    const amount =
        Number(settlement.remainingAmount).toFixed(2);

    const upiLink =
        `upi://pay` +
        `?pa=${encodeURIComponent(upiId)}` +
        `&pn=${encodeURIComponent(getName(receiver))}` +
        `&am=${encodeURIComponent(amount)}` +
        `&tn=${encodeURIComponent("RoomSplit Settlement")}` +
        `&cu=INR`;

    console.log("Payment Method:", method);
    console.log("UPI ID:", upiId);
    console.log("Amount:", amount);
    console.log("UPI LINK:", upiLink);


    // ==========================
    // MOBILE
    // ==========================

    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {

        /*
         * Google Pay on iOS has an official gpay://
         * intent URI. Android uses generic UPI intent.
         */

        if (
            /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
            method === "Google Pay"
        ) {

            const gpayLink =
                `gpay://upi/pay` +
                `?pa=${encodeURIComponent(upiId)}` +
                `&pn=${encodeURIComponent(getName(receiver))}` +
                `&am=${encodeURIComponent(amount)}` +
                `&tn=${encodeURIComponent("RoomSplit Settlement")}` +
                `&cu=INR`;

            window.location.href = gpayLink;

        }

        else {

            /*
             * Android:
             * Generic UPI intent lets the device use
             * the installed UPI app / chooser.
             */

            const a =
                document.createElement("a");

            a.href = upiLink;

            a.style.display = "none";

            document.body.appendChild(a);

            a.click();

            a.remove();

        }

    }


    // ==========================
    // DESKTOP
    // ==========================

    else {

        document
            .getElementById("qrPayment")
            .classList
            .remove("hidden");

        document
            .getElementById("upiIdText")
            .textContent = upiId;

        const qr =
            document.getElementById("upiQR");

        qr.src =
            "https://quickchart.io/qr?size=300&margin=2&text=" +
            encodeURIComponent(upiLink);

    }


    confirmBtn.innerHTML =
        "Confirm Payment";

    confirmBtn.dataset.step =
        "pay";

    return;

}

    // ==========================
    // STEP 2 : SAVE PAYMENT
    // ==========================

    confirmBtn.disabled = true;

    confirmBtn.innerHTML =
        "⏳ Processing...";

    const result =
        await paySettlement(

            expense.id,

            settlement.id,

            settlement.remainingAmount,

            method

        );

    if (result.success) {

        sessionStorage.removeItem("dashboard");
        sessionStorage.removeItem("history");
        sessionStorage.removeItem("settlements");

        await loadHistory();

        closeSettlementModal();

    }

    else {

        alert(result.message);

    }

    confirmBtn.disabled = false;

    confirmBtn.innerHTML = "Confirm";

    confirmBtn.dataset.step = "";

}
/* ==========================================
   CLOSE SETTLEMENT MODAL
========================================== */

function closeSettlementModal() {

    document
        .getElementById("settlementModal")
        .classList
        .add("hidden");

    document
        .getElementById("qrPayment")
        .classList
        .add("hidden");

    document
        .getElementById("confirmSettlementBtn")
        .innerHTML = "Confirm";

    document
        .getElementById("confirmSettlementBtn")
        .disabled = false;

    currentSettlementId = null;
    currentSettlementButton = null;
    document
    .getElementById("confirmSettlementBtn")
    .dataset.step = "";

document
    .getElementById("qrPayment")
    .classList
    .add("hidden");

}
/* ==========================================
   WHATSAPP REMINDER
========================================== */
async function openReminder(expenseId, settlementId, button) {

    const btn = button;

    try {

        btn.disabled = true;

        btn.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
 Sending...
`;

        const expense =
            allExpenses.find(e => e.id === expenseId);

        if (!expense) {

            showToast("Expense not found", "error");
            return;

        }

        const settlement =
            expense.settlements.find(
                s => s.id === settlementId
            );

        if (!settlement) {

            showToast("Settlement not found", "error");
            return;

        }

        const result = await apiGetMembers();

        if (!result.success) {

            showToast("Unable to load members", "error");
            return;

        }

        const member =
            result.data.find(m =>
                m.name.trim().toLowerCase() ===
                settlement.from.trim().toLowerCase()
            );

        if (!member) {

            showToast("Member not found", "error");
            return;

        }

        const message = `💸 RoomSplit

Hi ${member.name} 👋

You have to pay ₹${Number(settlement.remainingAmount).toFixed(2)} to ${getName(expense.paidBy)}.

📝 Expense: ${expense.title}

Thank you!

— RoomSplit`;

        const send = await sendReminder(
            member.phone,
            message
        );

        if (send.success) {

            showToast(
                "Reminder sent successfully ✅",
                "success"
            );

        } else {

            showToast(
                send.error || "Failed to send reminder ❌",
                "error"
            );

        }

    }

    catch (err) {

        console.error(err);

        showToast(
            "Something went wrong ❌",
            "error"
        );

    }

    finally {

        btn.disabled = false;

        btn.innerHTML = `
<i class="fa-brands fa-whatsapp"></i>
 Reminder
`;

    }

}