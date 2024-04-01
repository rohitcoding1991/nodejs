const nodemailer = require("nodemailer");

function sendMail(email, message) {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
      port: 465,
      host: "smtp.gmail.com",
    });

    let mailOptions = {
      from: "gs7788264@gmail.com",
      to: email,
      subject: message.subject,
      text: message.text,
    };
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          reject({
            status: "failed",
            statusCode: 400,
            message: error.message,
            data: [],
          });
        } else {
          resolve({
            status: "success",
            statusCode: 200,
            message: "mail sent successflly",
            data: [],
          });
        }
      });
    });
  } catch (err) {
    return {
      status: "failed",
      statusCode: 400,
      message: err.message,
      data: [],
    };
  }
}

module.exports = sendMail;
