import Joi from 'joi';

export const citizenMessageSchema = Joi.object({
  subject: Joi.string().max(200).required().messages({
    'string.max': 'Subject cannot exceed 200 characters'
  }),
  message: Joi.string().required().messages({
    'string.required': 'Message is required'
  }),
  subcity: Joi.string().optional().allow(''), // Made optional for guests
  guestName: Joi.string().optional().allow(''),
  guestEmail: Joi.string().email().optional().allow('')
});

export const officerMessageSchema = Joi.object({
  messageContent: Joi.string().required().messages({
    'string.required': 'messageContent is required'
  })
});