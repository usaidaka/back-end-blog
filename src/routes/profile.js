const routerProfile = require("express").Router();
const ProfileController = require("../controller/profile");

const upload = require("../middleware/multerProfile");

routerProfile.post(
  "/profile/single-uploaded",
  upload.single("file"),
  ProfileController.singleUpload
);
routerProfile.patch(
  "/profile/change-password",
  ProfileController.changePassword
);
routerProfile.patch(
  "/profile/change-username",
  ProfileController.changeUsername
);
routerProfile.patch("/profile/change-phone", ProfileController.changePhone);
routerProfile.patch("/profile/change-email", ProfileController.changeEmail);

module.exports = routerProfile;
