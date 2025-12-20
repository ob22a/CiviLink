import Officer from "../models/Officer.js";

// Handle officer assignment for TIN and VITAL
const assignOfficer = async (req, res, next) => {
    try {
        const formData = req.body.formData;
        if (!formData) {
            console.log("Form data is not defined")
            return res.status(400).json({
                success: false,
                message: "There is no attached form data",
            });
        }

        const subcity = formData.subCity;
        console.log("Subcity:", subcity)

        if (!subcity) {
            console.log("Subcity is not defined in the form data")
            return res.status(400).json({
                success: false,
                message: "The submitted form doesn't have a subcity",
            });
        }

        // Find officer with the lowest workload in the same subcity
        const officer = await Officer.findOne({
            onLeave: false,
            department: "approver",
            subCity: subcity
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

export default assignOfficer;