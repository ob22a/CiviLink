import Joi from "joi";

const personInfoSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    "any.required": "Full name is required",
    "string.min": "Full name must be at least 2 characters long",
  }),

  dateOfBirth: Joi.string()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required()
    .messages({
      "string.pattern.base": "Date of birth must be in DD/MM/YYYY format",
      "any.required": "Date of birth is required",
    }),

  placeOfBirth: Joi.string().min(2).max(100).required().messages({
    "any.required": "Place of birth is required",
  }),

  nationality: Joi.string().min(2).max(50).required().messages({
    "any.required": "Nationality is required.",
  }),

  address: Joi.string().min(5).max(200).required().messages({
    "any.required": "Address is required.",
  }),

  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be between 10 to 15 digits.",
      "any.required": "Phone number is required.",
    }),

  emailAddress: Joi.string().email().required().messages({
    "string.email": "Email address must be a valid email.",
    "any.required": "Email address is required.",
  }),
});

const witnessSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    "any.required": "Witness full name is required",
  }),

  relationship: Joi.string().min(2).max(50).required().messages({
    "any.required": "Witness relationship to applicant is required",
  }),

  contactNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Witness contact number must be between 10 to 15 digits.",
      "any.required": "Witness contact number is required.",
    }),

  address: Joi.string().min(5).max(200).required().messages({
    "any.required": "Witness address is required.",
  }),
});

const spouseWithWitnessSchema = Joi.object({
  applicantInformation: personInfoSchema.required(),
  witnessInformation: Joi.array()
    .items(witnessSchema)
    .min(1)
    .max(4)
    .required()
    .messages({
      "array.min": "At least one witness is required for {#label}",
      "array.max": "A maximum of four witnesses are allowed for {#label}",
      "any.required": "Witness information is required for {#label}",
    }),
});

const ceremonyDetailsSchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required()
    .messages({
      "string.pattern.base": "Ceremony date must be in DD/MM/YYYY format",
      "any.required": "Ceremony date is required.",
    }),

  time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "Ceremony time must be in HH:MM (24-hour) format",
      "any.required": "Ceremony time is required.",
    }),

  place: Joi.string().min(2).max(100).required().messages({
    "any.required": "Ceremony place is required",
  }),

  officiant: Joi.string().min(2).max(100).required().messages({
    "any.required": "Officiant name is required",
  }),
});

const birthParentSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    "any.required": "First nae=me is required",
  }),

  lastName: Joi.string().min(2).max(50).required().messages({
    "any.required": "Last name is required",
  }),

  date: Joi.string()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required()
    .messages({
      "string.pattern.base": "Date must be in DD/MM/YYYY format",
      "any.required": "Date of birth is required",
    }),

  nationality: Joi.string().min(2).max(50).required().messages({
    "any.required": "Nationality is required",
  }),

  occupation: Joi.string().min(2).max(100).optional().allow(""),
});

const childInfoSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    "any.required": "Child's first name is required",
  }),

  middleName: Joi.string().min(2).max(50).optional().allow(""),

  lastName: Joi.string().min(2).max(50).required().messages({
    "any.required": "Child's last name is required",
  }),

  gender: Joi.string().valid("Male", "Female").required().messages({
    "any.only": "Child's gender must be Male or Female",
    "any.required": "Child's gender is required",
  }),

  date: Joi.string()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required()
    .messages({
      "string.pattern.base": "Birth date must be in MM/DD/YYYY format",
      "any.required": "Birth date is required",
    }),

  time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base": "Time must be in HH:MM format (24-hour)",
    }),

  place: Joi.string().min(2).max(100).required().messages({
    "any.required": "Birth place is required",
  }),
});

const medicalFacilitySchema = Joi.object({
  facilityName: Joi.string().min(2).max(100).required().messages({
    "any.required": "Medical facility name is required",
  }),

  attendingPhysician: Joi.string().min(2).max(100).optional().allow(""),

  address: Joi.string().min(5).max(200).required().messages({
    "any.required": "Medical facility address is required",
  }),
});

export const marriageSchema = Joi.object({
  formData: Joi.object({
    marriage: Joi.object({
      husband: spouseWithWitnessSchema.required().messages({
        "any.required": "Husband information is required",
      }),

      wife: spouseWithWitnessSchema.required().messages({
        "any.required": "Wife information is required",
      }),

      ceremonyDetails: ceremonyDetailsSchema.required().messages({
        "any.required": "Ceremony details are required",
      }),
    })
      .required()
      .messages({
        "any.required": "Marriage application data is required",
      }),
    subcity: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        "any.required": "subcity is required",
        "string.min": "subcity must be at least 2 characters long",
        "string.max": "subcity cannot exceed 100 characters",
      }),
  }).required(),
});

export const birthSchema = Joi.object({
  formData: Joi.object({
    birth: Joi.object({
      child: childInfoSchema.required().messages({
        "any.required": "Child information is required",
      }),
      mother: birthParentSchema.required().messages({
        "any.required": "Mother information is required",
      }),
      father: birthParentSchema.required().messages({
        "any.required": "Father information is required",
      }),
      medicalFacility: medicalFacilitySchema.required().messages({
        "any.required": "Medical facility information is required",
      }),
    })
      .required()
      .messages({
        "any.required": "Birth application data is required",
      }),
    subcity: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        "any.required": "subcity is required",
        "string.min": "subcity must be at least 2 characters long",
        "string.max": "subcity cannot exceed 100 characters",
      }),
  }).required(),
});

export const getVitalSchema = (type) => {
  const schemas = {
    birth: birthSchema,
    marriage: marriageSchema,
  };

  const schema = schemas[type];

  if (!schema) {
    throw new Error(`No schema found for type: ${type}`);
  }

  return schema;
};
