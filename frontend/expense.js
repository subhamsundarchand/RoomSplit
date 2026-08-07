/* ==========================================
   RoomSplit - Expense
========================================== */

let editMode = false;
let editExpenseId = null;

document.addEventListener("DOMContentLoaded", async () => {

    checkLogin();

    await loadMembers();

    setDefaultPaidBy();

    setupCategory();

    await checkEditMode();

    setupForm();

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
   DEFAULT USER
========================================== */

function setDefaultPaidBy() {

    const currentUser = localStorage.getItem("currentUser");

    document.getElementById("paidBy").value = currentUser;
    

}

/* ==========================================
   CATEGORY
========================================== */

function setupCategory() {

    const category = document.getElementById("expenseCategory");

    const otherBox = document.getElementById("otherCategoryBox");

    category.addEventListener("change", () => {

        if (category.value === "Others") {

            otherBox.classList.remove("hidden");

        }

        else {

            otherBox.classList.add("hidden");

        }

    });

}
/* ==========================================
   LOAD MEMBERS
========================================== */

async function loadMembers() {

    const result = await apiGetMembers();

    if (!result.success) {

        alert("Unable to load members.");

        return;

    }

    const memberList =
        document.getElementById("memberList");

    memberList.innerHTML = "";

    result.data.forEach(member => {

        memberList.innerHTML += `

<label class="member">

    <input
        type="checkbox"
        value="${member.name.toLowerCase()}"
        checked>

    <div class="member-info">

        <span class="member-name">
            ${member.name}
        </span>

        <small class="member-phone">
            📞 +${member.phone}
        </small>

    </div>

</label>

`;

    });

}

/* ==========================================
   FORM
========================================== */
async function checkEditMode() {

    const params = new URLSearchParams(window.location.search);

    if (!params.has("edit")) return;

    editMode = true;

    editExpenseId = localStorage.getItem("editExpenseId");

    if (!editExpenseId) return;

    document.getElementById("pageTitle").textContent = "Edit Expense";

    document.getElementById("saveBtnText").textContent = "Update Expense";

    await loadExpense(editExpenseId);

}
function setupForm() {

    document
        .getElementById("expenseForm")
        .addEventListener("submit", saveExpense);

}
/* ==========================================
   SAVE / UPDATE
========================================== */

async function saveExpense(event) {

    event.preventDefault();
    const saveBtn = document.getElementById("saveBtn");

saveBtn.disabled = true;

saveBtn.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
 Saving...
`;

    const title =
        document
            .getElementById("expenseTitle")
            .value
            .trim();

    const amount =
        Number(
            document
                .getElementById("expenseAmount")
                .value
        );

    let category =
        document
            .getElementById("expenseCategory")
            .value;

    if (category === "Others") {

        category =
            document
                .getElementById("otherCategory")
                .value
                .trim();

    }

    const paidBy =
        document
            .getElementById("paidBy")
            .value;

    const members = [];

    document
        .querySelectorAll("#memberList input:checked")
        .forEach(member => {

            members.push(member.value);

        });

    /* ----------------------------
       VALIDATION
    ---------------------------- */

    if (!title) {

        alert("Enter Expense Title");
        return;

    }

    if (amount <= 0) {

        alert("Enter Valid Amount");
        return;

    }

    if (members.length === 0) {

        alert("Select at least one member");
        return;

    }

    const expense = {

        title,

        amount,

        category,

        paidBy,

        members

    };

    try {

        let result;

        /* ----------------------------
           EDIT MODE
        ---------------------------- */

        if (editMode) {

            result =
                await updateExpense(

                    editExpenseId,

                    expense

                );

        }

        /* ----------------------------
           ADD MODE
        ---------------------------- */

        else {

            result =
                await addExpense(expense);

        }

       if (result.success) {

    sessionStorage.removeItem("dashboard");
    sessionStorage.removeItem("history");
    sessionStorage.removeItem("settlements");

    localStorage.removeItem("editExpenseId");

    window.location.replace("history.html");

    return;

}

      else {

    saveBtn.disabled = false;

    saveBtn.innerHTML = editMode
        ? "Update Expense"
        : "Save Expense";

    alert(result.message);

}

    }

    catch (error) {

    console.error(error);


    alert("Unable to connect to server.");

}
    

}
/* ==========================================
   LOAD EXPENSE
========================================== */

async function loadExpense(id) {

    try {

        const result = await getExpenseById(id);

        if (!result.success) {

            alert("Expense not found.");


            return;

        }

        const expense = result.data;

        document.getElementById("expenseTitle").value =
            expense.title;

        document.getElementById("expenseAmount").value =
            expense.amount;

        document.getElementById("paidBy").value =
            expense.paidBy;

        const categorySelect =
            document.getElementById("expenseCategory");

        const otherBox =
            document.getElementById("otherCategoryBox");

        const otherInput =
            document.getElementById("otherCategory");

        const defaultCategories = [
            "Food",
            "Grocery",
            "Others"
        ];

        if (defaultCategories.includes(expense.category)) {

            categorySelect.value = expense.category;

            otherBox.classList.add("hidden");

            otherInput.value = "";

        } else {

            categorySelect.value = "Others";

            otherBox.classList.remove("hidden");

            otherInput.value = expense.category;

        }

        document
            .querySelectorAll("#memberList input[type='checkbox']")
            .forEach(checkbox => {

                checkbox.checked =
                    expense.members.includes(checkbox.value);

            });

    }

    catch (error) {

        console.error(error);

        alert("Unable to load expense.");

    }

}