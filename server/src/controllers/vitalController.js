import Application from "../models/Application.js";
import Officer from "../models/Officer.js";
import { getVitalSchema } from "../validators/vitalApplicationValidator.js";

export const submitVitalApplication = async (req, res, next) => {
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
