import Application from "../models/Application.js";
import Officer from "../models/Officer.js";
import Certificate from "../models/certificate.js";
import { tinApplicationSchema } from "../validators/tinApplicationValidator.js";
import { generateTIN } from "../utils/generateUniqueTin.js";
import { generateTinCertificatePdf } from "../services/certificates/generateTinCertificatePdf.js"


export const submitTinApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const assignedOfficerId = req.assignedOfficer;
    const { error, value } = tinApplicationSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);

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
      status: { $in: ["pending", "approved"] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An active TIN application already exists",
      });
    }

    // Create new TIN application
    const newApplication = await Application.create({
      applicant: userId,
      category: "TIN",
      formData,
      requiredIDs: req.uploadedIds || { kebele: false, fayda: false },
      assignedOfficer: assignedOfficerId,
    });

    // Increment the workload of the assigned officer
    await Officer.findByIdAndUpdate(assignedOfficerId, {
      $inc: { workLoad: 1 },
    });

    res.status(201).json({
      success: true,
      message: "TIN application submitted successfully",
      applicationId: newApplication._id,
    });
  } catch (err) {
    next(err);
  }
};

const approveTinApplicatin = async (req, res) => {
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
      officer.subcity !== application.formData.subcity
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

export { submitTinApplication, approveTinApplicatin }