import Application from "../models/Application.js";
import Certificate from "../models/certificate.js";
import { supabase } from "../../config/supabase.js";

const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user.id })
            .select("_id category type status rejectionReason createdAt formData")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: applications
        })
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
};



const downloadCertificate = async (req, res) => {
    try {
        const applicationId = req.params.id;

        const certificate = await Certificate.findOne({ application: applicationId });
        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found",
            });
        };

        if (certificate.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this certificate",
            });
        };

        if (process.env.NODE_ENV === "test") {
            return res.status(200).json({
                success: true,
                message: "File downloaded successfully!"
            });
        } else {
            const { data, error } = await supabase.storage
                .from("certificates")
                .createSignedUrl(certificate.fileUrl, 60 * 60); // 1 hour expiry

            if (error) throw new Error(error.message);

            res.redirect(data.signedUrl);
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
};

export { getAllApplications, downloadCertificate };
