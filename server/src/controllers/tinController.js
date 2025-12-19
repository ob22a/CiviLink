import Application from "../models/Application.js";
import Officer from "../models/Officer.js";
import { tinApplicationSchema } from "../validators/tinApplicationValidator.js";

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
