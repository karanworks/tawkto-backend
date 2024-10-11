const jwt = require("jsonwebtoken");

class Token {
  generateToken(value) {
    return jwt.sign(value, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });
  }
}

module.exports = new Token();
