const mongoose = require("mongoose");

let user = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExp: {
      type: Date,
    },
    status: {
      type: Number,
      default: 0,
    },
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", user);
