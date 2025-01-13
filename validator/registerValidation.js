const Joi = require("joi")

const validator = (schema) => (payload) => schema.validate(payload, {abortEarly: false})
const userSchema = Joi.object({
    name: Joi.string().min(3).max(30).trim().required(),
    email: Joi.string().lowercase().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().required(),
    passwordConfirm: Joi.ref('password'),

});

exports.validateRegister = validator(userSchema)