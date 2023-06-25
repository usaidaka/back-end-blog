const routerAuth = require("express").Router();
// controller
const AuthController = require("../controller/auth");
// middleware
const Validation = require("../validation");
const verifyToken = require("../middleware/verifyToken");

routerAuth.get("/auth", verifyToken, AuthController.getUser);

routerAuth.post(
  "/auth",
  Validation.registerValidation,
  Validation.runValidation,
  AuthController.registerUsers
);

routerAuth.post(
  "/auth/login",
  Validation.loginValidation,
  Validation.runValidation,
  AuthController.login
);

routerAuth.patch("/auth/verify/:tokenId", AuthController.verify);

routerAuth.post(
  "/auth/forgot-password",
  Validation.emailValidation,
  Validation.runValidation,
  AuthController.forgotPassword
);

routerAuth.post(
  "/auth/resend-verify",
  Validation.emailValidation,
  Validation.runValidation,
  AuthController.resendTokenVerify
);

routerAuth.patch(
  "/auth/reset-password/:id/:token",
  // verifyToken,
  // Validation.resetPassword,
  // Validation.runValidation,
  AuthController.resetPassword
);

module.exports = routerAuth;
