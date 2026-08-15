/* ==========================================
   RoomSplit API
========================================== */

const API_URL = "https://roomsplit-api-fdm0.onrender.com";

/* ==========================================
   COMMON REQUEST
========================================== */

async function apiRequest(endpoint, method = "GET", body = null) {

    try {

        const options = {

            method,

            headers: {

                "Content-Type": "application/json"

            }

        };

        if (body) {

            options.body = JSON.stringify(body);

        }

        const response = await fetch(
            API_URL + endpoint,
            options
        );

        return await response.json();

    }

    catch (err) {

        console.error(err);

        return {

            success: false,

            message: err.message

        };

    }

}

/* ==========================================
   GET ALL
========================================== */

async function getExpenses() {

    const result =
        await apiRequest("/api/expenses");

    return result.success

        ? result.data

        : [];

}

/* ==========================================
   ADD
========================================== */

async function addExpense(expense) {

    return await apiRequest(

        "/api/expenses",

        "POST",

        expense

    );

}

/* ==========================================
   UPDATE
========================================== */

async function updateExpense(id, expense) {

    return await apiRequest(

        "/api/expenses/" + id,

        "PUT",

        expense

    );

}
/* ==========================================
   DELETE
========================================== */

async function deleteExpense(id) {

    return await apiRequest(

        "/api/expenses/" + id,

        "DELETE"

    );

}

/* ==========================================
   GET BY ID
========================================== */

async function getExpenseById(id) {

    return await apiRequest(

        "/api/expenses/" + id,

        "GET"

    );

}

/* ==========================================
   TOTAL
========================================== */

async function getTotalExpense() {

    const expenses = await getExpenses();

    return expenses.reduce(

        (sum, expense) =>

            sum + Number(expense.amount),

        0

    );

}

/* ==========================================
   GET HISTORY
========================================== */

async function getHistory() {

    const start = performance.now();

    const result = await apiRequest("/api/history");

    console.log(
        "API Time:",
        (performance.now() - start).toFixed(0),
        "ms"
    );

    return result;

}
async function getAnalytics() {

    return await apiRequest("/api/analytics");

}
/* ==========================================
   GLOBAL CACHE
========================================== */

async function getCachedHistory(forceRefresh = false) {

    if (!forceRefresh) {

        const cache = sessionStorage.getItem("history");

        if (cache) {

            return JSON.parse(cache);

        }

    }

    const result = await getHistory();

    if (result.success) {

        sessionStorage.setItem(
            "history",
            JSON.stringify(result.data)
        );

        return result.data;

    }

    return [];

}
/* ==========================================
   SETTINGS
========================================== */

async function apiSaveSettings(settings) {

    const currentUser =
        localStorage.getItem("currentUser");

    return await apiRequest(

        "/api/settings",

        "POST",

        {

            user: currentUser,

            ...settings

        }

    );

}

async function apiGetSettings() {

    const currentUser =
        localStorage.getItem("currentUser");

    return await apiRequest(

        "/api/settings/" + currentUser,

        "GET"

    );

}
/* ==========================================
   SETTLEMENT
========================================== */

async function getSettlement() {

    return await apiRequest(
        "/api/settlement"
    );

}
/* ==========================================
   PAY SETTLEMENT
========================================== */

async function paySettlement(

    expenseId,

    settlementId,

    amount,

    method

) {

    return await apiRequest(

        "/api/settlement/pay",

        "POST",

        {

            expenseId,

            settlementId,

            amount,

            method

        }

    );

}
async function apiGetMembers() {

    return await apiRequest("/api/members");

}
async function sendReminder(phone, message) {

    return await apiRequest(

        "/api/whatsapp/send",

        "POST",

        {
            phone,
            message
        }

    );

}