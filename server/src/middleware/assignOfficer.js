import Officer from "../models/Officer.js";

// Handle officer assignment for TIN and VITAL
const assignOfficer = async (req, res, next) => {
    try {
        // Find available officers (not on leave)
        const availableOfficers = await Officer.find({ onLeave: false, department: 'approver'});
        if (availableOfficers.length === 0) {
            return res.status(503).json({
                success: false,
                message: "No officers are currently available to process your application. Please try again later.",
            });
        }

        // Find the officer with the least workload
        let assignedOfficer = availableOfficers.reduce((min, officer) => {
            return officer.workLoad < min.workLoad ? officer : min;
        }, availableOfficers[0]);

        req.assignedOfficer = assignedOfficer._id;
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
        
};

export default assignOfficer;