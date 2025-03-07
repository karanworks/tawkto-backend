const Joi = require("joi");
const response = require("../utils/response");

class UserUpdateValidator {
  validateDetails(req, res, next) {
    try {
      const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        // password: Joi.string().min(6).required(),
      });

      console.log("CHECKING AUTHORIZE USER VALUE ->", req.user);

      const value = schema.validate(req.body);
      return response.joiResponse(value, req, res, next);
    } catch (error) {
      console.log("Error while validating update user value", error);
      throw new Error("Error while validating update user value", error);
    }
  }
}

module.exports = new UserUpdateValidator();
