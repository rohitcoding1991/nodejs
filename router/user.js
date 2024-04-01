let express = require("express");
let router = express.Router();
let userAuthController = require("../controller/user");
let {
  userSignupValidation,
  changePasswordValidation,
  loginPasswordValidation,
} = require("../validation/userValidation");
let ValidateMiddleWare = require("../validation/validationMiddleware");
let isAuth = require("../middleware/usetAuth");

router.post(
  "/signUp",
  userSignupValidation(),
  ValidateMiddleWare,
  userAuthController.userSignUp
);
router.post(
  "/login",
  loginPasswordValidation(),
  ValidateMiddleWare,
  userAuthController.login
);
router.put(
  "/changePassword",
  isAuth,
  changePasswordValidation(),
  ValidateMiddleWare,
  userAuthController.changePassword
);
router.delete("/user", isAuth, userAuthController.deleteUser);
router.put("/user", isAuth, userAuthController.editAccount);
router.get("/users", isAuth, userAuthController.getUsers);
router.post("/forgotPassword", userAuthController.forgotPassword);

module.exports = router;
