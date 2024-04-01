const { body } = require("express-validator");
let User = require("../model/user");
let bcrypt = require("bcrypt");
const userSignupValidation = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("name field is required")
      .isString()
      .withMessage("name must be a string")
      .isLength({ min: 5 })
      .withMessage("name must be at least 5 characters long"),
    body("email")
      .notEmpty()
      .withMessage("email field is required")
      .isEmail()
      .withMessage("email type is not in right format")
      .custom(async (email) => {
        let Email = await User.findOne({ email: email, status: 1 });
        if (Email) {
          throw Error("email already exits");
        }
        return email;
      }),
    body("password").notEmpty().withMessage("password field is required"),
  ];
};
const loginPasswordValidation = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email format is invalid"),
    body("password").notEmpty().withMessage("password is required"),
  ];
};
const changePasswordValidation = () => {
  return [
    body("oldPassword")
      .notEmpty()
      .withMessage("old password is required")
      .custom(async (oldPassword, { req }) => {
        let { userId } = req.user;
        let user = await User.findOne({ _id: userId });
        if (user) {
          let check = await bcrypt.compare(
            oldPassword.toString(),
            user.password.toString()
          );
          if (!check) {
            throw Error("oldpassword dont match with existing password");
          }
          return oldPassword;
        }
      }),
    body("newPassword")
      .notEmpty()
      .withMessage("newPassword is required")
      .custom(async (newPassword, { req }) => {
        let { oldPassword } = req.body;
        if (oldPassword === newPassword) {
          throw Error(
            "new password should be different from existing password"
          );
        }
        return newPassword;
      }),
  ];
};
// const editAccountValidation=()=>{
//     return[
//         body("name").notEmpty().withMessage("name is required"),
//         body("email").notEmpty().withMessage("email is required").isEmail().withMessage("email must be of right format").custom(async(email)=>{
//          let user=await User.findOne({email,status:1})
//         })
//     ]
// }

module.exports = {
  userSignupValidation,
  changePasswordValidation,
  loginPasswordValidation,
};
