const Joi = require("joi");
const response = require("../utils/response");

class RegisterValidator {
  validateRegister(req, res, next) {
    try {
      const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.any()
          .valid(Joi.ref("password"))
          .required()
          .messages({
            "any.only": "Passwords do not match",
          }),
      });

      const value = schema.validate(req.body);
      return response.joiResponse(value, req, res, next);
    } catch (error) {
      console.log("Error while validating register value", error);
      throw new Error("Error while validating register value", error);
    }
  }
}

module.exports = new RegisterValidator();
