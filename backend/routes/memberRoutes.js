const express = require("express");

const router = express.Router();

const memberController =
require("../controllers/memberController");

// GET ALL
router.get(
    "/",
    memberController.getMembers
);

// ADD
router.post(
    "/",
    memberController.addMember
);

// UPDATE
router.put(
    "/:id",
    memberController.updateMember
);

// DELETE
router.delete(
    "/:id",
    memberController.deleteMember
);

module.exports = router;