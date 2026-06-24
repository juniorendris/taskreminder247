const jwt = require("jsonwebtoken");

async function auth(req, res, next) {
  const Header = req.headers.authorization;
  
console.log("Authorization Header:", Header);  
  if (!Header) {
    return res.status(401).json({ success: false, message: "no token" });
  }

  const token = Header.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.Access_Control);
    req.user = {
      user:decoded.user,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware validation failed:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "ACCESS_TOKEN_EXPIRED",
        expired: true,
      });
    }

    res
      .status(401)
      .json({ success: false, message: "Unauthorized token access." });
  }
}

module.exports = auth;
