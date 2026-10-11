const jwt = require("jsonwebtoken");

exports.maketoken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "1d" });
}
