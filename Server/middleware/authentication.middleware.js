const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY

module.exports = function authenticationMiddleware(req, res, next) {
  (async () => {
    try {
      const token = req.cookies.jwt;

      if (!token) {
        return res.status(401).json({ message: "Authentication required" }); 
      }

      const decoded = await jwt.verify(token, secretKey);
      req.user = decoded.user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  })();
}