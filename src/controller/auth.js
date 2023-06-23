const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const Mailer = require("./mailer");
const crypto = require("crypto");
const dayjs = require("dayjs");
const db = require("../../models");

// models
const { User, ResetPassword } = require("../../models");

const getUser = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const data = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
      attributes: {
        exclude: ["token"],
      },
      t,
    });
    const result = {
      ok: true,
      data: data,
    };

    if (!data) {
      await t.rollback();
      return res.status(400).json({
        ok: false,
        message: "user not found",
      });
    }

    await t.commit();
    res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({
      message: error.message,
    });
  }
};

const registerUsers = async (req, res) => {
  try {
    const {
      isVerified,
      role,
      username,
      email,
      imgProfile,
      phone,
      password,
      confirmPassword,
    } = req.body;

    if (password !== confirmPassword)
      return res.status(400).json({
        ok: false,
        message: "password and confirm password have to match",
      });
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    const isEmailExist = await User.findOne({ where: { email } });
    const isUsernameExist = await User.findOne({ where: { username } });
    const isPhoneExist = await User.findOne({ where: { phone } });
    if (isEmailExist) {
      return res.status(409).json({
        ok: false,
        message: "Email already used",
      });
    }

    if (isUsernameExist) {
      return res.status(409).json({
        ok: false,
        message: "username already used",
      });
    }

    if (isPhoneExist) {
      return res.status(409).json({
        ok: false,
        message: "phone already used",
      });
    }

    const accessVerify =
      crypto.randomBytes(16).toString("hex") +
      Math.random() +
      new Date().getTime();
    const time = new Date();

    await User.create({
      isVerified: isVerified,
      role: !role,
      username: username,
      email: email,
      imgProfile: imgProfile,
      phone: phone,
      password: hashPassword,
      verifyToken: accessVerify,
      verifyTokenCreatedAt: time,
    });

    const data = await User.findOne({
      where: { email: email, username: username },
    });

    if (!data) {
      return res.status(400).json({
        ok: false,
        message: "register failed",
      });
    }

    const link = `${process.env.BASEPATH_FE_REACT}/api/auth/verify/${accessVerify}`;

    const mailing = { recipient_email: email, link };
    Mailer.sendEmailRegister(mailing);

    res.status(201).json({
      ok: true,
      message: "congrats! register successful",
      data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      ok: false,
      message: "something bad happen",
    });
  }
};

const login = async (req, res) => {
  try {
    const { user_identification, password } = req.body;
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: user_identification },
          { phone: user_identification },
          { username: user_identification },
        ],
      },
      attributes: {
        exclude: ["token"],
      },
    });

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "user unauthorized",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        ok: false,
        message: "wrong password",
      });
    }

    const userId = user.id;
    const username = user.username;
    const email = user.email;

    const accessToken = jwt.sign(
      { userId, username, email },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      ok: true,
      message: "welcome to your blog",
      isAccountExist: user,
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      ok: false,
      message: "Account not found",
    });
  }
};

const verify = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const data = await User.findOne({
      where: {
        verifyToken: tokenId,
      },
    });

    if (!data) {
      return res.status(400).send({
        message: "verification token is invalid",
      });
    }

    if (data.isVerified) {
      return res.status(400).send({
        message: "user already verified",
      });
    }
    const tokenCreatedAt = dayjs(data.verifyTokenCreatedAt);
    const tokenExp = tokenCreatedAt.add(1, "hour");
    const now = dayjs();

    if (now > tokenExp) {
      return res.status(400).send({
        message: "verify token is already expired",
      });
    }

    data.isVerified = true;
    data.verifyToken = null;
    data.verifyTokenCreatedAt = null;
    await data.save();

    res.send({
      message: "verification process is success",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const oldUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!oldUser) {
      return res.status(400).json({
        ok: false,
        message: "user does not exists",
      });
    }
    const secret = process.env.ACCESS_TOKEN_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser.id }, secret, {
      expiresIn: "5m",
    });

    const OTP = Math.random(new Date().getTime() * 543241)
      .toString()
      .substring(2, 8);
    const link = `${process.env.BASEPATH_FE_REACT}/api/auth/reset-password/${oldUser.id}/${token}`;
    const time = new Date();

    await ResetPassword.create({
      UserId: oldUser.id,
      otp: OTP,
      otpCreatedAt: time,
    });

    const newOTP = { recipient_email: email, OTP, link };

    Mailer.sendEmailForgotPassword(newOTP)
      .then((response) =>
        res.status(200).json({
          message: `${response.message}, your link and OTP will be expired on 20 minutes`,
        })
      )
      .catch((error) => res.status(500).send(error.message));
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: "bad request",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;
    const { id, token } = req.params;

    const oldUser = await User.findOne({
      where: {
        id: id,
      },
    });

    const secret = process.env.ACCESS_TOKEN_SECRET + oldUser.password;
    const decodedToken = jwt.verify(token, secret, { expiresIn: "20m" });

    if (!oldUser) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    const otpData = await ResetPassword.findOne({
      where: {
        UserId: decodedToken.id,
      },
      order: [["id", "DESC"]],
      limit: 1,
    });

    const timeOtp = dayjs(otpData.otpCreatedAt);
    const otpExp = timeOtp.add(20, "minute");
    const now = dayjs();

    if (now > otpExp) {
      res.status(400).send({
        message: "token is already expired",
      });
    }

    if (!otpData) {
      return res.status(404).json({
        ok: false,
        message: "OTP data not found",
      });
    }

    if (newPassword !== confirmPassword)
      return res.status(400).json({
        ok: false,
        message: "password and confirm password have to match",
      });
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    if (otp === otpData.otp) {
      await oldUser.update(
        {
          password: hashPassword,
        },
        {
          where: {
            email: decodedToken.email,
            id: decodedToken.id,
            password: oldUser.password,
          },
        }
      );
      otpData.otp = null;
      otpData.otpCreatedAt = null;
      await otpData.save();
      res.json({
        message: "reset password successfully, please log in",
      });
    } else {
      res.json({
        message: "reset password failed",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

const resendTokenVerify = async (req, res) => {
  const { email } = req.body;
  try {
    const userData = await User.findOne({ where: { email } });
    if (!userData) {
      return res.status(400).send({
        message: "account is not found",
      });
    }
    if (userData.isVerified) {
      return res.status(400).send({
        message: "account already verified",
      });
    }

    // generate random verification
    const verifyToken = crypto.randomBytes(16).toString("hex");
    const time = new Date();

    userData.verifyToken = verifyToken;
    userData.verifyTokenCreatedAt = time;
    await userData.save();

    const link = `${process.env.BASEPATH_FE_REACT}/verify/${verifyToken}`;
    const mailing = { recipient_email: email, link };
    Mailer.resendVerifyAccount(mailing);

    res.status(200).json({
      message: "email already sent, please check your email",
    });
  } catch (error) {}
};

module.exports = {
  getUser,
  registerUsers,
  login,
  verify,
  resetPassword,
  forgotPassword,
  resendTokenVerify,
  // verifyUser,
  // getResetPassword,
};
