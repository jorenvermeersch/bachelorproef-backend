const Joi = require('joi');

const passwordSchema = Joi.string().min(12).max(128);

module.exports = { passwordSchema };
