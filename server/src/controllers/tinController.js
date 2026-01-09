import Application from "../models/Application.js";
import Officer from "../models/Officer.js";
import Certificate from "../models/certificate.js";
import { tinApplicationSchema } from "../validators/tinApplicationValidator.js";
import { generateTIN } from "../utils/generateUniqueTin.js";
import { generateTinCertificatePdf } from "../services/certificates/generateTinCertificatePdf.js"


const submitTinApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const assignedOfficerId = req.assignedOfficer;
    const { error, value } = tinApplicationSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      console.error("TIN Validation Error:", errorMessages);
      console.error("Request body:", JSON.stringify(req.body, null, 2));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
      });
    }

    const { formData } = value;

    // Check for existing active TIN application
    const existing = await Application.findOne({
      applicant: userId,
      category: "TIN",
      status: { $in: ["pending_payment", "pending", "approved"] },
    });

    if (existing) {
      console.log("Existing TIN application found:", {
        id: existing._id,
        status: existing.status,
        createdAt: existing.createdAt,
        userId: userId
      });
      return res.status(409).json({
        success: false,
        message: `An active TIN application already exists (Status: ${existing.status}, ID: ${existing._id})`,
      });
    }

    // Create new TIN application
    const newApplication = await Application.create({
      applicant: userId,
      category: "TIN",
      formData,
      requiredIDs: req.uploadedIds || { kebele: false, fayda: false },
      assignedOfficer: assignedOfficerId,
      status: "pending_payment"
    });

    // NOTE: Workload increment is deferred until payment/finalization


    res.status(201).json({
      success: true,
      message: "TIN application submitted successfully",
      applicationId: newApplication._id,
    });
  } catch (err) {
    next(err);
  }
};

const approveTinApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const officerId = req.user.id;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Validate application
    if (application.category !== "TIN") {
      return res.status(400).json({
        success: false,
        message: "Not a TIN application"
      });
    }

    if (application.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Application already processed"
      });
    }

    const officer = await Officer.findById(officerId);
    if (!officer) {
      return res.status(403).json({
        success: false,
        message: "Officer not found"
      });
    }

    // RBAC checks
    if (officer.department !== "approver") {
      return res.status(403).json({
        success: false,
        message: "Officer not authorized to approve"
      });
    }

    if (
      !application.assignedOfficer ||
      application.assignedOfficer.toString() !== officerId
    ) {
      return res.status(403).json({
        success: false,
        message: "Officer not assigned to this application"
      });
    }

    if (
      application.formData?.subcity &&
      officer.subcity.trim().toLowerCase() !== application.formData.subcity.trim().toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "Subcity mismatch"
      });
    }

    // Generate TIN
    const tin = await generateTIN();

    // Update application
    application.status = "approved";
    application.formData.tin = tin;

    // Flag formData as dirty
    application.markModified("formData");

    try {
      await application.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(500).json({
          success: false,
          message: "TIN generation conflict, please retry approval"
        });
      };
    };

    // Create certificate record (PDF comes later)
    const certificate = await Certificate.create({
      user: application.applicant,
      application: application._id,
      category: "TIN",
      fileUrl: "GENERATING...",
      issuedBy: officer._id,
    });

    const createdAt = certificate.createdAt;
    const dateOnly = createdAt.toISOString().split("T")[0];

    console.log(dateOnly);


    const filePath = await generateTinCertificatePdf(certificate._id, application.formData, officer.fullName, dateOnly);

    certificate.fileUrl = filePath;
    await certificate.save();

    return res.status(200).json({
      success: true,
      message: "TIN application has been approved"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  };
}

const rejectTinApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    const applicationId = req.params.id;
    const officerId = req.user.id;

    if ((reason?.trim().length ?? 0) < 5) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason must be at least 5 characters long."
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Validate application
    if (application.category !== "TIN") {
      return res.status(400).json({
        success: false,
        message: "Not a TIN application"
      });
    }

    if (application.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Application already processed"
      });
    }

    const officer = await Officer.findById(officerId);
    if (!officer) {
      return res.status(403).json({
        success: false,
        message: "Officer not found"
      });
    }

    // RBAC checks
    if (officer.department !== "approver") {
      return res.status(403).json({
        success: false,
        message: "Officer not authorized to reject"
      });
    }

    if (
      !application.assignedOfficer ||
      application.assignedOfficer.toString() !== officerId
    ) {
      return res.status(403).json({
        success: false,
        message: "Officer not assigned to this application"
      });
    }

    if (
      application.formData?.subcity &&
      officer.subcity.trim().toLowerCase() !== application.formData.subcity.trim().toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "Subcity mismatch"
      });
    }

    application.status = "rejected";
    application.rejectionReason = reason;
    await application.save();

    await Officer.findOneAndUpdate({ _id: officerId, workLoad: { $gt: 0 } }, { $inc: { workLoad: -1 } });


    return res.status(200).json({
      success: true,
      message: "TIN application has been rejected"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const finalizeTinApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const application = await Application.findOne({ _id: id, applicant: userId });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status !== "pending_payment") {
      return res.status(400).json({ success: false, message: "Application is not in a finalizable state" });
    }

    // Check if payment is successful
    const Payment = (await import("../models/Payment.js")).default;
    const payment = await Payment.findOne({ applicationId: id, status: "success" });

    if (!payment) {
      return res.status(400).json({ success: false, message: "Successful payment not found for this application" });
    }

    // Move to pending
    application.status = "pending";
    await application.save();

    // Now increment workload
    if (application.assignedOfficer) {
      await Officer.findByIdAndUpdate(application.assignedOfficer, {
        $inc: { workLoad: 1 },
      });
    }

    res.status(200).json({
      success: true,
      message: "TIN application finalized successfully",
    });
  } catch (err) {
    next(err);
  }
};

export { submitTinApplication, approveTinApplication, rejectTinApplication, finalizeTinApplication }