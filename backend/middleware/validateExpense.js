module.exports = (req, res, next) => {

    const {

        title,

        amount,

        category,

        paidBy,

        members

    } = req.body;

    if (!title || title.trim() === "") {

        return res.status(400).json({

            success: false,

            message: "Title is required"

        });

    }

    if (!amount || Number(amount) <= 0) {

        return res.status(400).json({

            success: false,

            message: "Invalid amount"

        });

    }

    if (!category) {

        return res.status(400).json({

            success: false,

            message: "Category is required"

        });

    }

    if (!paidBy) {

        return res.status(400).json({

            success: false,

            message: "Paid By is required"

        });

    }

    if (!Array.isArray(members) || members.length === 0) {

        return res.status(400).json({

            success: false,

            message: "Select at least one member"

        });

    }

    next();

};
