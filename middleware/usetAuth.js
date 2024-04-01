const jwt = require("jsonwebtoken");
const User = require("../model/user");
const bcrypt = require("bcrypt");
userAuth = async (req, res, next) => {
  const auth = req.headers["authorization"];
  const token = auth && auth.split(" ")[1];
  if (!token) {
    return res.status(401).send({
      status: "failed",
      statusCode: 401,
      message: "A token is required for authentication",
      data: [],
    });
  }
  try {
    let check = jwt.verify(token, process.env.JWT_KEY);
    let user = await User.findOne({ _id: check.userId });
    if (!user) {
      return res.status(401).send({
        status: "failed",
        statusCode: 401,
        message: "user does not exists",
        data: [],
      });
    }
    req.user = check;
    next();
  } catch (err) {
    res.status(401).send({
      status: "failed",
      statusCode: 401,
      message: err.message,
      data: [],
    });
  }
};
module.exports = userAuth;
