import Application from "../models/Application.js";
import Officer from "../models/Officer.js";
import { getVitalSchema } from "../validators/vitalApplicationValidator.js";
import Certificate from "../models/certificate.js";
import { generateVitalScheduleCardPdf } from '../services/certificates/generateVitalCertificatePdf.js';
import { scheduleAppointment } from '../services/scheduleAppointment.service.js';

const submitVitalApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const assignedOfficerId = req.assignedOfficer;
    const { type } = req.params;
    const { formData } = req.body;

    const validTypes = ["birth", "marriage"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid vital application type. Must be one of: ${validTypes.join(
          ", "
        )}`,
      });
    }

    const schema = getVitalSchema(type);

    const { error, value } = schema.validate(
      { formData },
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
      });
    }

    const existing = await Application.findOne({
      applicant: userId,
      category: "VITAL",
      type: type,
      status: { $in: ["pending_payment", "pending", "approved"] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `An active ${type} vital application already exists`,
      });
    }

    const newApplication = await Application.create({
      applicant: userId,
      category: "VITAL",
      type: type,
      formData: value.formData,
      requiredIDs: req.uploadedIds || { kebele: false, fayda: false },
      assignedOfficer: assignedOfficerId,
      status: "pending_payment"
    });

    // NOTE: Workload increment is deferred until payment/finalization



    res.status(201).json({
      applicationId: newApplication._id,
      success: true,
      message: `${type} vital application submitted successfully`,
    });
  } catch (err) {
    if (err.message.includes("Invalid vital event type")) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next(err);
  }
};

const approveVitalApplication = async (req, res) => {
  try {
    const { id, type } = req.params;
    const officerId = req.user.id;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
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

    if (application.type.toLowerCase() !== type.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Application type mismatch"
      });
    }

    if (application.category !== "VITAL") {
      return res.status(400).json({
        success: false,
        message: "Not a vital application"
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
    if (
      application.formData?.subcity &&
      officer.subcity.trim().toLowerCase() !== application.formData.subcity.trim().toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "Subcity mismatch"
      });
    }

    if (officer.department !== "approver") {
      return res.status(403).json({
        success: false,
        message: "Officer not authorized to approve"
      });
    }

    // Schedule appointment
    const appointment = await scheduleAppointment(officer._id);

    // Create appointment record record
    const certificate = await Certificate.create({
      user: application.applicant,
      application: application._id,
      category: "VITAL",
      type,
      appointment: {
        date: appointment.date,
        slot: appointment.slot,
        timeRange: appointment.timeRange
      },
      fileUrl: "GENERATING...",
      issuedBy: officer._id,
    });

    // Generate schedule card PDF
    const scheduleCardUrl = await generateVitalScheduleCardPdf(
      certificate,
      appointment,
      application.formData,
      officer.fullName
    );

    certificate.fileUrl = scheduleCardUrl;
    await certificate.save();

    // Update application
    application.status = "approved";
    await application.save();

    res.status(200).json({
      success: true,
      message: "Vital application approved and appointment scheduled",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const rejectVitalApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    const applicationId = req.params.id;
    const applicationType = req.params.type;
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

    const officer = await Officer.findById(officerId);
    if (!officer) {
      return res.status(403).json({
        success: false,
        message: "Officer not found"
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

    if (application.category !== "VITAL") {
      return res.status(400).json({
        success: false,
        message: "Not a vital application"
      });
    }

    if (application.type.toLowerCase() !== applicationType.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Application type mismatch"
      });
    }

    if (application.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Application already processed"
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
      message: "Vital application has been rejected"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const finalizeVitalApplication = async (req, res, next) => {
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
      message: "Application finalized successfully",
    });
  } catch (err) {
    next(err);
  }
};

export { submitVitalApplication, approveVitalApplication, rejectVitalApplication, finalizeVitalApplication }