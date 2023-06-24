const { check, body, validationResult } = require("express-validator");
const { isURL } = require("validator");

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

const registerValidation = [
  check("username", "username cannot be empty")
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("minimum 3 character"),

  check("email", "email cannot be empty")
    .notEmpty()
    .isEmail()
    .withMessage("must to in valid email"),

  check("phone", "phone cannot be empty")
    .notEmpty()
    .isMobilePhone()
    .withMessage("must to in valid phone number"),

  check("password", "password cannot be empty")
    .notEmpty()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "password have to contains 8 character with lowercase, uppercase, number, dan special character"
    ),
  check("confirmPassword")
    .notEmpty()
    .withMessage("You must type a confirmation password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("The passwords do not match"),
];

const loginValidation = [
  check("user_identification", "username / phone / email cannot be empty")
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("your account not found"),

  check("password", "password cannot be empty")
    .notEmpty()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "password have to contains 8 character with lowercase, uppercase, number, dan special character"
    ),
];

const changePasswordValidation = [
  check("currentPassword", "current password cannot be empty")
    .notEmpty()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "your current password have to contains 8 character with lowercase, uppercase, number, dan special character"
    ),
  check("password", "password cannot be empty")
    .notEmpty()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "password have to contains 8 character with lowercase, uppercase, number, dan special character"
    ),
  check("confirmPassword")
    .notEmpty()
    .withMessage("You must type a confirmation password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("The passwords do not match"),
];

const changeUsernameValidation = [
  check("newUsername", "username cannot be empty")
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("your account not found"),
];

const changeEmailValidation = [
  check("newEmail", "email cannot be empty")
    .notEmpty()
    .isEmail()
    .withMessage("must to in valid email"),
];

const changePhoneValidation = [
  check("newPhone", "phone cannot be empty")
    .notEmpty()
    .isMobilePhone()
    .withMessage("must to in valid phone number"),
];

const deleteUser = [
  check("username", "username cannot be empty")
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("minimum 3 character"),

  check("password", "password cannot be empty")
    .notEmpty()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "password have to contains 8 character with lowercase, uppercase, number, dan special character"
    ),
];

const resetPassword = [
  check("otp", "OTP cannot be empty")
    .notEmpty()
    .withMessage("insert correct OTP"),
  check("newPassword", "password cannot be empty")
    .notEmpty()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "password have to contains 8 character with lowercase, uppercase, number, dan special character"
    ),
  check("confirmPassword")
    .notEmpty()
    .withMessage("You must type a confirmation password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("The passwords do not match"),
];

const createBlog = [
  body("data")
    .notEmpty()
    .withMessage("blog cannot be empty")
    .custom((value) => {
      try {
        const jsonData = JSON.parse(value);
        if (!jsonData.title) {
          throw new Error("Title is required");
        }
        if (!jsonData.content) {
          throw new Error("Content is required");
        }
        if (!jsonData.country) {
          throw new Error("country is required");
        }
        if (!isURL(jsonData.videoURL)) {
          throw new Error("invalid Video URL");
        }
        if (!isURL(jsonData.url)) {
          throw new Error("invalid Reference URL");
        }
        return true;
      } catch (error) {
        throw new Error(`${error}`);
      }
    }),
  body("file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Photo is required");
    }
    return true;
  }),
];

const editBlog = [
  body("data")
    .notEmpty()
    .withMessage("blog cannot be empty")
    .custom((value) => {
      try {
        const jsonData = JSON.parse(value);
        if (!jsonData.title) {
          throw new Error("Title is required");
        }
        if (!jsonData.content) {
          throw new Error("Content is required");
        }
        if (!jsonData.country) {
          throw new Error("country is required");
        }
        if (!isURL(jsonData.videoURL)) {
          throw new Error("invalid Video URL");
        }
        if (!isURL(jsonData.url)) {
          throw new Error("invalid Reference URL");
        }
        return true;
      } catch (error) {
        throw new Error(`${error}`);
      }
    }),
  body("file").optional(),
];

const emailValidation = [
  check("email", "email cannot be empty")
    .isEmail()
    .withMessage("please, insert valid email"),
];

const changeImageProfile = [
  body("file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Photo is required");
    }
    return true;
  }),
];

module.exports = {
  runValidation,
  registerValidation,
  loginValidation,
  changePasswordValidation,
  changeUsernameValidation,
  changeEmailValidation,
  changePhoneValidation,
  deleteUser,
  resetPassword,
  createBlog,
  editBlog,
  emailValidation,
  changeImageProfile,
};
