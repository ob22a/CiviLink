import Officer from "../models/Officer.js";

// Handle officer assignment for TIN and VITAL
const assignApproverOfficer = async (req, res, next) => {
    try {
        const formData = req.body.formData;
        if (!formData) {
            console.log("Form data is not defined")
            return res.status(400).json({
                success: false,
                message: "There is no attached form data",
            });
        }

        const subcity = formData.subcity;
        console.log("subcity:", subcity)

        if (!subcity) {
            console.log("subcity is not defined in the form data")
            return res.status(400).json({
                success: false,
                message: "The submitted form doesn't have a subcity",
            });
        }

        // Find officer with the lowest workload in the same subcity
        const officer = await Officer.findOne({
            onLeave: false,
            department: "approver",
            subcity: subcity,
            writeNews: false,
        })
            .sort({ workLoad: 1 });

        if (!officer) {
            return res.status(503).json({
                success: false,
                message: "No officers are currently available for this subcity",
            });
        }

        req.assignedOfficer = officer._id;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Assign for conversation 

const assignConversationOfficer = async (req, res, next) => {
    try {
        const subcity = req.body.subcity;
        if (!subcity) {
            return res.status(400).json({
                success: false,
                message: "subcity is required to assign an officer",
            });
        }
        // Find the officer with the lowest workload(determined by number of active conversations) in the same subcity

        const officer = await Officer.findOne({
            onLeave: false,
            department: "customer_support",
            subcity,
        }) .sort({ workLoad: 1 });

        if (!officer) {
            return res.status(503).json({
                success: false,
                message: "No officers are currently available for this subcity",
            });
        }
        req.assignedOfficer = officer._id;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export { assignApproverOfficer, assignConversationOfficer };