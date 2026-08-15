/* ==========================================
   RoomSplit Settlement
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    checkLogin();

    await loadSettlement();

});

/* ==========================================
   LOGIN
========================================== */

function checkLogin() {

    if (!localStorage.getItem("currentUser")) {

        window.location.href = "index.html";

    }

}

/* ==========================================
   LOAD SETTLEMENT
========================================== */

async function loadSettlement() {

    try {

        const result = await getSettlement();

        if (!result.success) {

            showToast("Unable to load settlement", "error");

            return;

        }

        renderBalances(result.balances);

        renderTransactions(result.settlements);

    }

    catch (err) {

        console.error(err);

        showToast("Server Error", "error");

    }

}

/* ==========================================
   BALANCES
========================================== */

function renderBalances(users) {

    renderUserBalance(
        "balanceSubham",
        users.subham || 0
    );

    renderUserBalance(
        "balanceSubhankar",
        users.subhankar || 0
    );

    renderUserBalance(
        "balanceSoumya",
        users.soumya || 0
    );

}


function renderUserBalance(id, balance) {

    const card =
        document.getElementById(id);

    const amount =
        Math.abs(Number(balance));

    if (balance < -0.01) {

        card.innerHTML = `

            <span class="balance-status to-pay">
                To Pay
            </span>

            <h2>
                ₹${amount.toFixed(2)}
            </h2>

        `;

    }

    else if (balance > 0.01) {

        card.innerHTML = `

            <span class="balance-status to-receive">
                To Receive
            </span>

            <h2>
                ₹${amount.toFixed(2)}
            </h2>

        `;

    }

    else {

        card.innerHTML = `

            <span class="balance-status settled">
                Settled
            </span>

            <h2>
                ₹0.00
            </h2>

        `;

    }

}

/* ==========================================
   TRANSACTIONS
========================================== */

function renderTransactions(settlements) {

    const container =
        document.getElementById("settlementList");

    container.innerHTML = "";

    let total = 0;

    settlements.forEach(item => {

        const amount = Number(item.amount);

        total += amount;

        let settlementDate = "";

        if (item.date) {

            let date;

            if (item.date.seconds) {

                date =
                    new Date(item.date.seconds * 1000);

            }

            else if (item.date._seconds) {

                date =
                    new Date(item.date._seconds * 1000);

            }

            else if (item.date.toDate) {

                date =
                    item.date.toDate();

            }

            else {

                date =
                    new Date(item.date);

            }

            if (!isNaN(date.getTime())) {

                settlementDate =
                    date.toLocaleDateString("en-IN", {

                        day: "2-digit",

                        month: "short",

                        year: "numeric"

                    });

            }

        }

        container.innerHTML += `

        <div class="settlement-card">

            <div class="settlement-person">

                <span class="person-name">
                    ${capitalize(item.from)}
                </span>

                <span class="arrow">
                    →
                </span>

                <span class="person-name receiver">
                    ${capitalize(item.to)}
                </span>

            </div>


            <div class="settlement-details">

                <span class="payment-label">
                    will pay to
                </span>

                <strong class="payment-amount">
                    ₹${amount.toFixed(2)}
                </strong>

            </div>


            <div class="settlement-date">

                📅 ${settlementDate}

            </div>


            <div class="settlement-status">

    <span class="pending-badge">
        🟡 Pending
    </span>

    <button
        class="settle-btn"
        onclick="openSettleModal(
            '${item.from}',
            '${item.to}',
            ${amount}
        )"
    >
        💰 Settle
    </button>

</div>

        </div>

        `;

    });


    document.getElementById("overallExpense").textContent =
        `₹${total.toFixed(2)}`;


    if (settlements.length === 0) {

        container.innerHTML = `

        <div class="settlement-card empty-settlement">

            <div class="empty-icon">
                🎉
            </div>

            <strong>
                Everyone is Settled Up!
            </strong>

            <small>
                No pending payments
            </small>

        </div>

        `;

    }

}

/* ==========================================
   CAPITALIZE
========================================== */

function capitalize(name) {

    return name.charAt(0).toUpperCase()

        + name.slice(1);

}
/* ==========================================
   SETTLE PAYMENT
========================================== */

async function openSettleModal(
    from,
    to,
    amount
) {

    const method =
        prompt(
            `Payment Method for ₹${amount.toFixed(2)}\n\n` +
            `1. Cash\n` +
            `2. UPI\n\n` +
            `Enter Cash or UPI:`
        );


    if (!method) return;


    const cleanMethod =
        method.trim().toLowerCase();


    let paymentMethod;


    if (cleanMethod === "cash") {

        paymentMethod = "Cash";

    }

    else if (cleanMethod === "upi") {

        paymentMethod = "UPI";

    }

    else {

        showToast(
            "Please enter Cash or UPI",
            "error"
        );

        return;

    }


    const confirmed =
        confirm(
            `${capitalize(from)} will pay ` +
            `${capitalize(to)} ₹${amount.toFixed(2)}\n\n` +
            `Method: ${paymentMethod}\n\n` +
            `Confirm payment?`
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `${API_URL}/api/settlement/pay-summary`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        from,

                        to,

                        amount,

                        method:
                            paymentMethod

                    })

                }
            );


        const result =
            await response.json();


        if (!result.success) {

            showToast(
                result.message ||
                "Payment failed",
                "error"
            );

            return;

        }


        showToast(
            "Payment marked successfully",
            "success"
        );


        await loadSettlement();

    }

    catch (err) {

        console.error(err);

        showToast(
            "Server Error",
            "error"
        );

    }

}