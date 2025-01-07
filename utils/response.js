class Response {
  success(res, statusCode, data) {
    try {
      return res.status(statusCode || 200).json(data);
    } catch (error) {
      console.log("ERROR IN SUCCESS RESPONSE ->", error);

      return res.status(400).json({
        message: "Implementation Error",
      });
    }
  }

  error(res, statusCode, data = {}) {
    try {
      return res.status(statusCode || 400).json(this.handleError(data));
    } catch (error) {
      return res.status(400).json({
        message: "Implementation Error",
      });
    }
  }

  handleError(errorObject) {
    try {
      if (errorObject.message) return errorObject;
      return { status: "failure", message: "Something went wrong", error: {} };
    } catch (error) {
      console.log("ERROR IN HANDLE ERROR FUNCTION IN RESPONSE ->", error);

      return { status: "failure", message: "Something went wrong", error: {} };
    }
  }

  joiResponse(value, req, res, next) {
    try {
      if (value.error) {
        let param = value.error.details[0].context.key;
        let message = value.error.details[0].message;

        if ("label" in value.error.details[0].context) {
          param = value.error.details[0].context.label;
        }

        return this.error(res, 400, { message: `${message}` });
      } else {
        switch (req.method) {
          case "POST":
            req.body = value.value;
            break;
          case "GET":
          case "DELETE":
            break;
        }
        next();
      }
    } catch (error) {
      console.log("Error while sending joi response ->", error);

      throw new Error("Error while sending joi resonse ->", error);
    }
  }
}

module.exports = new Response();
