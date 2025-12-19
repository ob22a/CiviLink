import Application from "../models/Application.js";

const getOfficerApplications = async (req, res) => {
    try {
        const officerId = req.user.id;
        const applications = await Application.find({ assignedOfficer: officerId });

        res.status(200).json({
            success: true,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getApplicationDetails = async (req, res) => {
    try {
        const officerId = req.user.id;
        const applicationId = req.params.id;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        if (application.assignedOfficer.toString() !== officerId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this application"
            });
        }

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export { getOfficerApplications, getApplicationDetails };