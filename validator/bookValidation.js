const Joi = require("joi")

const validator = (schema) => (payload) => schema.validate(payload, {abortEarly: false})
const blogSchema = Joi.object({
    title: Joi.string().required(),
    title: Joi.string().required(),
    author: Joi.string().required(),
    publicationYear: Joi.date().greater("now").required(),
    isbn: Joi.string().required(),
    genre: Joi.string().required(),
})

exports.validateCreateBook = validator(blogSchema)

