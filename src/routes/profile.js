const routerProfile = require("express").Router();
const ProfileController = require("../controller/profile");

// middleware
const upload = require("../middleware/multerProfile");
const verifyToken = require("../middleware/verifyToken");
const Validation = require("../validation");

routerProfile.post(
  "/profile/single-uploaded",
  verifyToken,
  upload.single("file"),
  ProfileController.singleUpload
);

routerProfile.patch(
  "/profile/change-password",
  verifyToken,
  Validation.changePasswordValidation,
  Validation.runValidation,
  ProfileController.changePassword
);

routerProfile.patch(
  "/profile/change-username",
  verifyToken,
  Validation.changeUsernameValidation,
  Validation.runValidation,
  ProfileController.changeUsername
);

routerProfile.patch(
  "/profile/change-phone",
  verifyToken,
  Validation.changePhoneValidation,
  Validation.runValidation,
  ProfileController.changePhone
);

routerProfile.patch(
  "/profile/change-email",
  verifyToken,
  Validation.changeEmailValidation,
  Validation.runValidation,
  ProfileController.changeEmail
);

module.exports = routerProfile;
