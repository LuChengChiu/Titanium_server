const admin = require("../config/firebase-config");
class Middleware {
  async decodeToken(req, res, next) {
    try {
      console.log("MIDDLEWARE check cookies:", req.cookies);
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        const decodeValue = await admin.auth().verifyIdToken(token);
        if (decodeValue) {
          return next();
        }
        return res.status(401).json({ message: "Unauthorize" });
      } else {
        return next();
      }
    } catch (err) {
      console.log("middleware error:", err);
      return res.status(500).json({ message: "Internal Error" });
    }
  }
}

module.exports = new Middleware();
