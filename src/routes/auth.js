const routerAuth = require("express").Router();
const AuthController = require("../controller/auth");
const verifyToken = require("../middleware/verifyToken");

routerAuth.get("/auth", AuthController.getUser);
routerAuth.get("/auth/AllUsers", AuthController.getAllUsers);
routerAuth.post("/auth", AuthController.registerUsers);
routerAuth.delete("/auth/:userId", AuthController.deleteUser);

routerAuth.post("/auth/login", AuthController.login);
routerAuth.patch("/auth/verify", verifyToken, AuthController.verify);

routerAuth.post("/auth/forgot-password", AuthController.forgotPassword);
routerAuth.get("/auth/reset-password/:id/:token", AuthController.resetPassword);

module.exports = routerAuth;
