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

    document.getElementById("balanceSubham").textContent =
        `₹${Math.abs(users.subham || 0).toFixed(2)}`;

    document.getElementById("balanceSubhankar").textContent =
        `₹${Math.abs(users.subhankar || 0).toFixed(2)}`;

    document.getElementById("balanceSoumya").textContent =
        `₹${Math.abs(users.soumya || 0).toFixed(2)}`;

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

        total += Number(item.amount);

        container.innerHTML += `

        <div class="settlement-card">

            <strong>

                ${capitalize(item.from)}

            </strong>

            pays

            <strong>

                ${capitalize(item.to)}

            </strong>

            <h3>

                ₹${Number(item.amount).toFixed(2)}

            </h3>

        </div>

        `;

    });

    document.getElementById("overallExpense").textContent =
        `₹${total.toFixed(2)}`;

    if (settlements.length === 0) {

        container.innerHTML = `

        <div class="settlement-card">

            🎉 Everyone is Settled Up!

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