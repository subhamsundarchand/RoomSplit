const db = require("../firebase/firebase");

// GET ALL MEMBERS
exports.getMembers = async (req, res) => {

    try {

        const snapshot = await db
            .collection("members")
            .get();

        const members = [];

        snapshot.forEach(doc => {

            members.push({

                id: doc.id,

                ...doc.data()

            });

        });

        res.json({

            success: true,

            data: members

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ADD MEMBER
exports.addMember = async (req, res) => {

    try {

        const member = {

            name: req.body.name,

            phone: req.body.phone,

            createdAt: new Date()

        };

        const ref = await db
            .collection("members")
            .add(member);

        res.json({

            success: true,

            id: ref.id,

            message: "Member Added Successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// DELETE MEMBER
exports.deleteMember = async (req, res) => {

    try {

        await db
            .collection("members")
            .doc(req.params.id)
            .delete();

        res.json({

            success: true,

            message: "Member Deleted Successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// UPDATE MEMBER
exports.updateMember = async (req, res) => {

    try {

        await db
            .collection("members")
            .doc(req.params.id)
            .update({

                name: req.body.name,

                phone: req.body.phone

            });

        res.json({

            success: true,

            message: "Member Updated Successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};