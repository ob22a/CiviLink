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
      status: { $in: ["pending", "approved"] },
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
    });

    // Increment the workload of the assigned officer
    await Officer.findByIdAndUpdate(assignedOfficerId, {
      $inc: { workLoad: 1 },
    });


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
      officer.subcity !== application.formData.subcity
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
      data: {
        application,
        certificate,
        appointment
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false, 
      message: err.message
    });
  }
};

export { submitVitalApplication, approveVitalApplication }