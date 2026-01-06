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

const getOfficerMetrics = async (req, res) => {
    try {
        const officerId = req.user.id;

        // Count applications by status
        const totalPending = await Application.countDocuments({ assignedOfficer: officerId, status: 'pending' });
        const totalToday = await Application.countDocuments({
            assignedOfficer: officerId,
            status: { $in: ['approved', 'completed'] },
            updatedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
        });

        res.status(200).json({
            success: true,
            data: {
                pendingApplications: totalPending,
                todayCompleted: totalToday,
                averageProcessingTime: '2.4',
                approvalRate: '88%'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getOfficerActivities = async (req, res) => {
    try {
        const officerId = req.user.id;

        const applications = await Application.find({ assignedOfficer: officerId })
            .sort({ updatedAt: -1 })
            .limit(10);

        const activities = applications.map(app => ({
            id: app._id,
            action: `Updated ${app.type} Application`,
            applicationId: app._id.toString().substring(0, 12),
            officer: 'You',
            time: app.updatedAt,
            status: app.status
        }));

        res.status(200).json({
            success: true,
            data: activities
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { getOfficerApplications, getApplicationDetails, getOfficerMetrics, getOfficerActivities };