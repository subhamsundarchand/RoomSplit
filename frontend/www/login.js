/* ==========================================
   RoomSplit Login
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const currentUser = localStorage.getItem("currentUser");
    const loginForm = document.getElementById("loginForm");

    // Agar login page hai
    if (loginForm) {

        // Already logged in
        

        loginForm.addEventListener("submit", loginUser);
    }

});

/* ==========================================
   LOGIN
========================================== */

async function loginUser(event) {

    event.preventDefault();

    const user = document.getElementById("userSelect").value;

    if (!user) {
        alert("Please select a user.");
        return;
    }

    localStorage.setItem("currentUser", user.toLowerCase());

    // Preload history before opening dashboard
    await getCachedHistory();

    window.location.replace("dashboard.html");

}

/* ==========================================
   LOGOUT
========================================== */

function logout() {

    localStorage.removeItem("currentUser");

    window.location.replace("index.html");

}

/* ==========================================
   GET CURRENT USER
========================================== */

function getCurrentUser() {

    return localStorage.getItem("currentUser");

}