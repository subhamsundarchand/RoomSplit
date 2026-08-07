/* ==========================================
   RoomSplit Users
========================================== */

const USERS = [

    {
        id: "subham",
        name: "Subham"
    },

    {
        id: "subhankar",
        name: "Subhankar"
    },

    {
        id: "soumya",
        name: "Soumya"
    }

];

/* ==========================================
   Helpers
========================================== */

function getUserName(id) {

    const user = USERS.find(u => u.id === id);

    return user ? user.name : "";

}

function getUserById(id) {

    return USERS.find(u => u.id === id);

}