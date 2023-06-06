const routerAuth = require("express").Router();
const AuthController = require("../controller/auth");
const verifyToken = require("../middleware/verifyToken");

routerAuth.get("/auth", AuthController.getUser);
routerAuth.get("/auth/AllUsers", AuthController.getAllUsers);
routerAuth.post("/auth", AuthController.registerUsers);
routerAuth.delete("/auth/:userId", AuthController.deleteUser);

routerAuth.post("/auth/login", AuthController.login);
routerAuth.patch("/auth/verify", verifyToken, AuthController.verify);

routerAuth.put("/auth/forgot-password", AuthController.forgotPassword);
routerAuth.patch("/auth/reset-password", AuthController.resetPassword);

module.exports = routerAuth;
