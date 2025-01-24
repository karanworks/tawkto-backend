const jwt = require("jsonwebtoken");

const authorizeUser = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1]; // Extract the token after "Bearer"

    if (!token) {
      return res
        .status(403)
        .json({ message: "Access Denied: No token provided" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          // const refreshToken = req.cookies.refresh_token;
          // if (!refreshToken) {
          //   return res.status(403).json({
          //     message: "Refresh token required for re-authentication",
          //   });
          // }

          // console.log("GOT THE REFRESH TOKEN ->", refreshToken);

          // jwt.verify(
          //   refreshToken,
          //   process.env.REFRESH_TOKEN_SECRET,
          //   (refreshErr, refreshUser) => {
          //     if (refreshErr) {
          //       return res
          //         .status(403)
          //         .json({ message: "Invalid or expired refresh token" });
          //     }

          //     const newAccessToken = jwt.sign(
          //       { id: refreshUser.id, username: refreshUser.username }, // Add relevant user data
          //       process.env.ACCESS_TOKEN_SECRET,
          //       { expiresIn: "15m" } // Short expiry for access tokens
          //     );

          //     res.setHeader("Authorization", `Bearer ${newAccessToken}`);
          //     req.user = refreshUser; // Attach user to the request for downstream use
          //     return next(); // Proceed to the next middleware/route
          //   }
          // );
          res.status(401).json({ message: "Unauthorized" });
        } else if (err.name === "JsonWebTokenError") {
          return res.status(401).json({ message: "Invalid token" });
        } else {
          return res.status(401).json({ message: "Authentication error" });
        }
      } else {
        // Valid access token
        req.user = user;
        next(); // Proceed to the next middleware/route
      }
    });
  } catch (error) {
    console.error("Error in authorizeUser middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authorizeUser;
