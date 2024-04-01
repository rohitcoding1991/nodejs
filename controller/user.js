let User = require("../model/user");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
let sendMail = require("../commonFunction/sendMail");

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}
exports.userSignUp = async (req, res) => {
  let { name, email, password, otp } = req.body;
  try {
    let userExist = await User.findOne({ email: email, status: 0 });
    if (!otp) {
      let OTP = generateOTP();
      let otpExp = new Date();
      let response = await sendMail(email, {
        subject: OTP,
        text: `your otp is ${OTP}`,
      });
      if (response.statusCode == 400) {
        return res.status(400).send(response);
      }
      otpExp.setMinutes(otpExp.getMinutes() + 5);
      OTP = await bcrypt.hash(OTP.toString(), 10);
      password = await bcrypt.hash(password.toString(), 10);
      let user = {
        name,
        email,
        password,
        otp: OTP,
        otpExp,
      };
      if (!userExist) {
        user = new User(user);
        await user.save();
      } else {
        await User.findOneAndUpdate({ email: email, status: 0 }, user);
      }
      return res.status(200).send({
        status: "success",
        statusCode: 200,
        message: "otp send successfully",
        data: [],
      });
    } else {
      let currentTime = new Date();
      if (!userExist || currentTime > userExist.otpExp) {
        return res.status(400).send({
          status: "failed",
          statusCode: 400,
          message: "otp time expire",
          data: [],
        });
      }
      let check = await bcrypt.compare(
        otp.toString(),
        userExist.otp.toString()
      );
      if (!check) {
        return res.status(400).send({
          status: "failed",
          statusCode: 400,
          message: "invalid otp",
          data: [],
        });
      }
      userExist.status = 1;
      userExist.otp = undefined;
      await userExist.save();
      res.status(200).send({
        status: "success",
        statusCode: 200,
        message: "user signUp successfully",
        data: [],
      });
    }
  } catch (err) {
    res.status(400).send({
      status: "failed",
      statusCode: 400,
      message: err.message,
      data: [],
    });
  }
};

exports.login = async (req, res) => {
  let { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).send({
        status: "failed",
        statusCode: 400,
        message: "email and password is required",
        data: [],
      });
    }
    let user = await User.findOne({ email, status: 1 });
    let check = await bcrypt.compare(
      password.toString(),
      user.password.toString()
    );
    if (!check) {
      return res.status(400).send({
        status: "failed",
        statusCode: 400,
        message: "invalid email or password",
        data: [],
      });
    }

    let userData = {
      userId: user._id,
    };
    let token = jwt.sign(userData, process.env.JWT_KEY, { expiresIn: "1h" });
    let Token = await bcrypt.hash(token, 10);

    user.token = Token;
    await user.save();
    res.status(200).send({
      status: "success",
      statusCode: 200,
      message: "login successfully",
      data: token,
    });
  } catch (err) {
    res.status(400).send({
      status: "failed",
      statusCode: 400,
      message: err.message,
      data: [],
    });
  }
};

exports.changePassword = async (req, res) => {
  let { oldPassword, newPassword } = req.body;
  let { userId } = req.user;
  try {
    newPassword = await bcrypt.hash(newPassword, 10);
    let user = await User.findOneAndUpdate(
      { _id: userId },
      { password: newPassword }
    );
    res.status(200).send({
      status: "success",
      statusCode: 200,
      message: "password updated successfully",
      data: [],
    });
  } catch (err) {
    res.status(400).send({
      status: "failed",
      statusCode: 400,
      message: err.message,
      data: [],
    });
  }
};

exports.deleteUser = async (req, res) => {
  let { userId } = req.user;
  try {
    let user = await User.findByIdAndDelete({ _id: userId });
    if (!user) {
      return res.status(400).send({
        status: "failed",
        statusCode: 400,
        message: "data not found",
        data: [],
      });
    }
    res.status(200).send({
      status: "success",
      statusCode: 200,
      message: "data deleted successfully",
      data: [],
    });
  } catch (err) {
    res.status(400).send({
      status: "failed",
      statusCode: 400,
      message: err.message,
      data: [],
    });
  }
};
exports.editAccount = async (req, res) => {
  let { name } = req.body;
  let { userId } = req.user;
  try {
    let user = await User.findByIdAndUpdate({ _id: userId }, { name });
    if (!user) {
      return res.status(400).send({
        status: "failed",
        statusCode: 400,
        message: "data not found to update",
        data: [],
      });
    }
    res.status(200).send({
      status: "success",
      statusCode: 200,
      message: "data update successfully",
      data: [],
    });
  } catch (err) {
    res.status(400).send({
      status: "failed",
      statusCode: 400,
      message: err.message,
      data: [],
    });
  }
};

exports.getUsers = async (req, res) => {
  let { pageNo, limit } = req.query;
  let { userId } = req.user;
  pageNo = pageNo || 1;
  limit = limit || 10;
  try {
    let users = await User.find({status: 1})
      .skip((pageNo - 1) * limit)
      .limit(limit);
    let totalUsers = await User.countDocuments({status: 1});
    res.status(200).send({
      status: "success",
      statusCode: 200,
      message: "data found successfully",
      data: {
        data: users,
        pageNo: pageNo,
        perpageLimit: limit,
        totalUsers: totalUsers,
      },
    });
  } catch (err) {
    res.status(400).send({
      status: "failed",
      statusCode: 400,
      message: err.message,
      data: [],
    });
  }
};

exports.forgotPassword = async (req, res) => {
  let { email } = req.body;
  try {
    let user = await User.findOne({ email: email, status: 1 });
    if (!user) {
      return res.status(400).send({
        status: "failed",
        statusCode: 400,
        message: "email not exist",
        data: [],
      });
    }
    let password = user.email + generateOTP();
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    await sendMail(email, {
      subject: "New Password please reset it after login",
      text: `${password} this is your new password to login`,
    });
    res.status(200).send({
      status: "success",
      statusCode: 200,
      message: "Your new password has been sent in your registered mail",
      data: [],
    });
  } catch (err) {
    res.status(400).send({
      status: "failed",
      statusCode: 400,
      message: err.message,
      data: [],
    });
  }
};
