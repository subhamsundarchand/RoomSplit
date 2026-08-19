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

    const netBalances = {};

    /* ==========================================
       NET SAME-PAIR TRANSACTIONS
    ========================================== */

    settlements.forEach(item => {

        const from = item.from;
        const to = item.to;
        const amount = Number(item.amount) || 0;

        if (!from || !to || amount <= 0) return;

        const pair = [from, to].sort().join("_");

        if (!netBalances[pair]) {

            netBalances[pair] = {
                userA: [from, to].sort()[0],
                userB: [from, to].sort()[1],
                amountAB: 0,
                amountBA: 0
            };

        }

        const pairData =
            netBalances[pair];

        if (
            from === pairData.userA &&
            to === pairData.userB
        ) {

            pairData.amountAB += amount;

        }

        else {

            pairData.amountBA += amount;

        }

    });


    /* ==========================================
       CREATE FINAL NETTED TRANSACTIONS
    ========================================== */

    const finalSettlements = [];

    Object.values(netBalances).forEach(pair => {

        const difference =
            pair.amountAB -
            pair.amountBA;

        if (Math.abs(difference) < 0.01) {

            return;

        }

        if (difference > 0) {

            finalSettlements.push({

                from: pair.userA,

                to: pair.userB,

                amount: difference

            });

        }

        else {

            finalSettlements.push({

                from: pair.userB,

                to: pair.userA,

                amount: Math.abs(difference)

            });

        }

    });


    /* ==========================================
       RENDER
    ========================================== */

    let total = 0;

    finalSettlements.forEach(item => {

        const amount =
            Number(item.amount);

        total += amount;

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


                <div class="settlement-status">

                    <span class="pending-badge">
                        🟡 Pending
                    </span>

                    <button
                        type="button"
                        class="settle-btn"
                        onclick="
                            openSettleModal(
                                '${item.from}',
                                '${item.to}',
                                ${amount}
                            )
                        "
                    >
                        💰 Settle
                    </button>

                </div>

            </div>

        `;

    });


    document.getElementById(
        "overallExpense"
    ).textContent =
        `₹${total.toFixed(2)}`;


    /* ==========================================
       EMPTY
    ========================================== */

    if (finalSettlements.length === 0) {

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
/* ==========================================
   PAYMENT METHOD
========================================== */

let selectedPaymentMethod = "Cash";


function selectPaymentMethod(method) {

    selectedPaymentMethod = method;


    document
        .querySelectorAll(".payment-method")
        .forEach(button => {

            button.classList.remove("active");

        });


    const selectedButton =
        document.querySelector(
            `.payment-method[data-method="${method}"]`
        );


    if (selectedButton) {

        selectedButton.classList.add("active");

    }

}


/* ==========================================
   OPEN MODAL
========================================== */

function openSettleModal(from, to, amount) {

    const modal =
        document.getElementById("settleModal");


    document.getElementById("settleFrom")
        .textContent =
        capitalize(from);


    document.getElementById("settleTo")
        .textContent =
        capitalize(to);


    document.getElementById("settleAmount")
        .textContent =
        `₹${Number(amount).toFixed(2)}`;
        const payInput =
    document.getElementById("settlePayAmount");

payInput.value = "";

payInput.max =
    Number(amount).toFixed(2);

document.getElementById(
    "settleRemaining"
).textContent =
    `Remaining after payment: ₹${Number(amount).toFixed(2)}`;

payInput.oninput = function () {

    const paying =
        Number(this.value) || 0;

    const remaining =
        Math.max(
            0,
            Number(amount) - paying
        );

    document.getElementById(
        "settleRemaining"
    ).textContent =
        `Remaining after payment: ₹${remaining.toFixed(2)}`;

};


    modal.dataset.from = from;

    modal.dataset.to = to;

    modal.dataset.amount = amount;


    selectPaymentMethod("Cash");


    modal.classList.add("show");

}


/* ==========================================
   CLOSE MODAL
========================================== */

function closeSettleModal() {

    const modal =
        document.getElementById("settleModal");


    modal.classList.remove("show");

}


/* ==========================================
   CONFIRM PAYMENT
========================================== */

/* ==========================================
   CONFIRM PAYMENT
========================================== */

async function confirmSettlementPayment() {

    const modal =
        document.getElementById("settleModal");


    const from =
        modal.dataset.from;


    const to =
        modal.dataset.to;


    const pendingAmount =
        Number(modal.dataset.amount);


    const payInput =
        document.getElementById("settlePayAmount");


    const amount =
        Number(payInput.value);


    const method =
        selectedPaymentMethod;


    /* ==========================================
       VALIDATION
    ========================================== */

    if (
        !from ||
        !to ||
        !Number.isFinite(pendingAmount) ||
        pendingAmount <= 0
    ) {

        showToast(
            "Invalid settlement",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showToast(
            "Enter a valid payment amount",
            "error"
        );

        return;

    }


    if (
        amount >
        pendingAmount + 0.01
    ) {

        showToast(
            `You cannot pay more than ₹${pendingAmount.toFixed(2)}`,
            "error"
        );

        return;

    }


    const remaining =
        Math.max(
            0,
            pendingAmount - amount
        );


    /* ==========================================
       CONFIRM
    ========================================== */

    const confirmed =
        confirm(

            `${capitalize(from)} will pay ` +
            `${capitalize(to)} ₹${amount.toFixed(2)}\n\n` +

            `Method: ${method}\n` +

            `Remaining: ₹${remaining.toFixed(2)}\n\n` +

            `Confirm payment?`

        );


    if (!confirmed) return;


    /* ==========================================
       API
    ========================================== */

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

                        method

                    })

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            console.error(
                "Settlement Error:",
                result
            );


            showToast(
                result.message ||
                "Payment failed",
                "error"
            );

            return;

        }


        closeSettleModal();


        showToast(
            `${method} payment of ₹${amount.toFixed(2)} recorded`,
            "success"
        );


        await loadSettlement();

    }


    catch (err) {

        console.error(
            "Settlement Request Error:",
            err
        );


        showToast(
            "Unable to connect to server",
            "error"
        );

    }

}