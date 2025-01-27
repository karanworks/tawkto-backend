const jwt = require("jsonwebtoken");

function generateAccessToken(userId) {
  const accessToken = jwt.sign(
    { userId: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  return { accessToken };
}

module.exports = generateAccessToken;
