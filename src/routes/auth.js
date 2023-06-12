const routerAuth = require("express").Router();
const AuthController = require("../controller/auth");

routerAuth.get("/auth", AuthController.getUser);
routerAuth.get("/auth/AllUsers", AuthController.getAllUsers);
routerAuth.post("/auth", AuthController.registerUsers);
routerAuth.delete("/auth/:userId", AuthController.deleteUser);

routerAuth.post("/auth/login", AuthController.login);

routerAuth.get("/auth/verify/:tokenId", AuthController.verifyUser);
routerAuth.patch("/auth/verify", AuthController.verify);

routerAuth.post("/auth/forgot-password", AuthController.forgotPassword);
routerAuth.get("/auth/reset-password/:id/:token", AuthController.resetPassword);

module.exports = routerAuth;
