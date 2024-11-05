const Joi = require("joi");
const response = require("../utils/response");

class WorkspaceValidtor {
  validateWorkspace(req, res, next) {
    try {
      const schema = Joi.object({
        workspaceName: Joi.string().required(),
        websiteAddress: Joi.string().required(),
      });

      const value = schema.validate(req.body);
      return response.joiResponse(value, req, res, next);
    } catch (error) {
      console.log("Error while validating workspace value", error);
      throw new Error("Error while validating workspace value", error);
    }
  }
}

module.exports = new WorkspaceValidtor();
