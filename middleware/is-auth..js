const jwt = require("jsonwebtoken");
const { clearImage } = require("../controllers/user");
const dotenv = require("dotenv");
dotenv.config();

module.exports = (req, res, next) => {
  const token = req.get("Authorization");
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
  } catch (e) {
    e.stausCode = 500;
  }

  if (!decodedToken) {
    const error = new Error("Not Authenticated");
    error.stausCode = 401;
    clearImage(req.file === undefined || null ? null : req.file.path);
    return next(error);
  }

  req.userId = decodedToken.userId;
  req.userRole = decodedToken.userRole;
  next();
};
