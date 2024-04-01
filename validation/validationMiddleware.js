const { body, validationResult } = require("express-validator");

const validate = async (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  let message;
  message = errors.array()[0].msg;

  return res.status(422).json({
    status: "failed",
    statusCode: 400,
    message: message,
    data: [],
  });
};

module.exports = validate;
