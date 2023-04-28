const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res
      .status(401)
      .json({ staus: "failed", message: "no token provided,access denied" });
  }
  const token = authToken.split(" ")[1];
  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedPayload;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "failed",
      message: "invalid token, access denied",
    });
  }
}

module.exports = verifyToken;
