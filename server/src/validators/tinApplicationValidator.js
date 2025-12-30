import Joi from "joi";

export const tinApplicationSchema = Joi.object({
  formData: Joi.object({
    personal: Joi.object({
      firstName: Joi.string().min(2).max(50).required().messages({
        "string.min": "First name must be at least 2 characters long",
        "string.max": "First name cannot exceed 50 characters",
        "any.required": "First name is required",
      }),
      middleName: Joi.string()

        .min(2)
        .max(50)
        .optional()
        .allow(""),

      lastName: Joi.string().min(2).max(50).required().messages({
        "string.min": "Last name must be at least 2 characters long",
        "string.max": "Last name cannot exceed 50 characters",
        "any.required": "Last name is required",
      }),

      dateOfBirth: Joi.string()
        .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
        .required()
        .messages({
          "string.pattern.base": "Date of birth must be in DD/MM/YYYY format",
          "any.required": "Date of birth is required",
        }),
      gender: Joi.string().valid("Male", "Female").required().messages({
        "any.only": 'Gender must be either "Male" or "Female"',
        "any.required": "Gender is required",
      }),

      bankAccountNumber: Joi.string()
        .pattern(/^\d{10,20}$/)
        .required()
        .messages({
          "string.pattern.base":
            "Bank account number must be between 10 and 20 digits",
          "any.required": "Bank account number is required",
        }),

      FAN: Joi.string().min(8).max(20).required().messages({
        "string.min": "FAN must be at least 8 characters long",
        "string.max": "FAN cannot exceed 20 characters",
        "any.required": "FAN is required",
      }),

      email: Joi.string().email().required().messages({
        "string.email": "Email must be a valid email address",
        "any.required": "Email is required",
      }),
    }).required(),

    employmentDetails: Joi.object({
      occupation: Joi.string().min(2).max(100).required().messages({
        "string.min": "Occupation must be at least 2 characters long",
        "string.max": "Occupation cannot exceed 100 characters",
        "any.required": "Occupation is required",
      }),

      employerName: Joi.string().min(2).max(100).optional().allow(""),

      employerAddress: Joi.string().min(2).max(200).optional().allow(""),
    }).required(),

    addressDetails: Joi.object({
      streetAddress: Joi.string().min(5).max(500).required().messages({
        "any.required": "Street address is required",
      }),

      city: Joi.string().min(2).max(100).required().messages({
        "any.required": "City is required",
      }),

      region: Joi.string().min(2).max(50).required().messages({
        "any.required": "Region is required",
      }),

      postalCode: Joi.number()
        .integer()
        .min(1000)
        .max(99999)
        .optional()
        .messages({
          "number.base": "Postal code must be a number",
          "number.min": "Postal code must be at least 4 digits",
          "number.max": "Postal code cannot exceed 5 digits",
        }),
    }).required(),
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
