const Joi = require("joi");
const response = require("../utils/response");

class LoginValidator {
  validateLogin(req, res, next) {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
      });

      const value = schema.validate(req.body);
      return response.joiResponse(value, req, res, next);
    } catch (error) {
      console.log("Error while validating login value", error);
      throw new Error("Error while validating login value", error);
    }
  }
}

module.exports = new LoginValidator();
