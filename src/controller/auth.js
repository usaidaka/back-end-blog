const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const Mailer = require("./mailer");

// models
const { User, ResetPassword } = require("../../models");

const getAllUsers = async (req, res) => {
  try {
    const data = await User.findAll();

    const result = {
      ok: true,
      data: data,
    };

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      ok: false,
      message: "Not Found",
    });
  }
};

const getUser = async (req, res) => {
  try {
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[1];
    // console.log("token", token);
    const decodeToken = jwt_decode(token);
    // console.log("decode token", decodeToken.username);

    const data = await User.findOne({
      where: {
        username: decodeToken.username,
        email: decodeToken.email,
      },
      attributes: {
        exclude: ["token"],
      },
    });
    const result = {
      ok: true,
      data: data,
    };
    if (data) {
      return res.json(result);
    } else {
      return res.status(500).json({
        message: "something wrong happen on server",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
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

    const accessToken = jwt.sign(
      { username, email, phone },
      process.env.ACCESS_TOKEN_SECRET
    );

    await User.create({
      isVerified: isVerified,
      role: !role,
      username: username,
      email: email,
      imgProfile: imgProfile,
      phone: phone,
      password: hashPassword,
      token: accessToken,
    });

    const data = await User.findOne({
      where: { email: email, username: username },
      attributes: {
        exclude: ["imgProfile", "token"],
      },
    });

    const link = `http://localhost:8000/api/auth/verify/${accessToken}`;

    const mailing = { recipient_email: email, link };
    Mailer.sendEmailRegister(mailing);

    res.status(201).json({
      ok: true,
      message: "congrats! register successful",
      data,
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      message: "something bad happen",
    });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await User.destroy({
      where: {
        id: userId,
      },
      force: true,
    });
    const data = await User.findAll();
    res.json({
      ok: true,
      message: "delete successful",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: "Bad Request",
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

const verify = async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const data = await User.findOne({
      where: {
        username: decodedToken.username,
        email: decodedToken.email,
      },
    });
    // console.log(token);

    if (data.token === tokenId && !data.isVerified) {
      await data.update({ isVerified: true });
    }
    res.json({
      ok: true,
      message: "verify success",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
  next();
};

const verifyUser = async (req, res) => {
  const { tokenId } = req.params;
  try {
    const decodedToken = jwt.verify(tokenId, process.env.ACCESS_TOKEN_SECRET);

    const data = await User.findOne({
      where: {
        username: decodedToken.username,
        email: decodedToken.email,
      },
    });

    if (tokenId === data.token && !data.isVerified) {
      await data.update({ isVerified: true }, { where: { isVerified: false } });
      res.json({
        ok: true,
        message: "verify success",
        data,
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

const forgotPassword = async (req, res, next) => {
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
        message: "email does not exists",
      });
    }
    const secret = process.env.ACCESS_TOKEN_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser.id }, secret, {
      expiresIn: "5m",
    });

    const OTP = Math.random(new Date().getTime() * 543241)
      .toString()
      .substring(2, 8);

    const link = `http://localhost:8000/api/auth/reset-password/${oldUser.id}/${token}`;

    await ResetPassword.create({
      UserId: oldUser.id,
      otp: OTP,
    });

    const newOTP = { recipient_email: email, OTP, link };
    Mailer.sendEmailForgotPassword(newOTP)
      .then((response) =>
        res.status(200).json({
          message: `${response.message}, OTP will be expired on 5 minutes`,
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

const getResetPassword = async (req, res, next) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;
    const { id, token } = req.params;
    // console.log("TOKEN", token);
    // console.log("DATA", data);
    const oldUser = await User.findOne({
      where: {
        id: id,
      },
    });

    const secret = process.env.ACCESS_TOKEN_SECRET + oldUser.password;
    const decodedToken = jwt.verify(token, secret, { expiresIn: "5m" });

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

    if (!otpData) {
      return res.status(404).json({
        ok: false,
        message: "OTP data not found",
      });
    }
    console.log("otpData", otpData.otp);
    if (newPassword !== confirmPassword)
      return res.status(400).json({
        ok: false,
        message: "password and confirm password have to match",
      });
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    console.log(hashPassword);

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
      res.json({
        message: "reset password successfully, please log in",
      });
    } else {
      return res.json({
        message: "reset password failed",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      ok: false,
      message: "input your new password",
    });
  }
  next();
};

const resetPassword = async (req, res, next) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;
    const { id, token } = req.params;
    // console.log("TOKEN", token);
    // console.log("DATA", data);
    const oldUser = await User.findOne({
      where: {
        id: id,
      },
    });

    const secret = process.env.ACCESS_TOKEN_SECRET + oldUser.password;
    const decodedToken = jwt.verify(token, secret, { expiresIn: "5m" });

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

    if (!otpData) {
      return res.status(404).json({
        ok: false,
        message: "OTP data not found",
      });
    }
    console.log("otpData", otpData.otp);
    if (newPassword !== confirmPassword)
      return res.status(400).json({
        ok: false,
        message: "password and confirm password have to match",
      });
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    console.log(hashPassword);

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
      message: "input your new password",
    });
  }
  next();
};

module.exports = {
  getUser,
  registerUsers,
  deleteUser,
  login,
  verify,
  resetPassword,
  forgotPassword,
  getAllUsers,
  verifyUser,
  getResetPassword,
};
