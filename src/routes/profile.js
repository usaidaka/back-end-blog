const routerProfile = require("express").Router();
const ProfileController = require("../controller/profile");

// middleware
const upload = require("../middleware/multerProfile");
const verifyToken = require("../middleware/verifyToken");

routerProfile.post(
  "/profile/single-uploaded",
  verifyToken,
  upload.single("file"),
  ProfileController.singleUpload
);
routerProfile.patch(
  "/profile/change-password",
  verifyToken,
  ProfileController.changePassword
);
routerProfile.patch(
  "/profile/change-username",
  verifyToken,
  ProfileController.changeUsername
);
routerProfile.patch(
  "/profile/change-phone",
  verifyToken,
  ProfileController.changePhone
);
routerProfile.patch(
  "/profile/change-email",
  verifyToken,
  ProfileController.changeEmail
);

module.exports = routerProfile;
