const Joi = require("joi");
const response = require("../utils/response");

class WorkspaceMembersValidator {
  validateWorkspaceMembers(req, res, next) {
    try {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        role: Joi.string().required(),
      }).options({
        allowUnknown: false, // Only allow the fields defined in the schema
      });

      const value = schema.validate(req.body);
      return response.joiResponse(value, req, res, next);
    } catch (error) {
      console.log("Error while validating workspace members value", error);
      throw new Error("Error while validating workspace members value", error);
    }
  }
}

module.exports = new WorkspaceMembersValidator();
