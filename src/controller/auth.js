const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// models
const { User } = require("../../models");

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
    console.log("token", token);
    const decodeToken = jwt_decode(token);
    console.log("decode token", decodeToken.username);

    const data = await User.findOne({
      where: {
        username: decodeToken.username,
        email: decodeToken.email,
      },
    });
    const result = {
      ok: true,
      data: data,
    };
    res.json(result);
  } catch (error) {
    console.log(error);
  }
};

const registerUsers = async (req, res) => {
  try {
    const {
      isVerified,
      role,
      username,
      email,
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

    await User.create({
      isVerified: isVerified,
      role: !role,
      username: username,
      email: email,
      phone: phone,
      password: hashPassword,
    });

    const accessToken = jwt.sign(
      { username, email, phone },
      process.env.ACCESS_TOKEN_SECRET
    );

    const data = await User.findOne({ where: { email: email } });

    res.status(201).json({
      ok: true,
      message: "congrats! register successful",
      data,
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: "Bad Request",
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
    const user = await User.findAll({
      where: {
        username: req.body.username,
        email: req.body.email,
      },
    });

    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (!match) {
      return res.status(400).json({
        ok: false,
        message: "wrong password",
      });
    }
    if (req.body.phone !== user[0].phone) {
      return res.status(400).json({
        ok: false,
        message: "wrong phonenumber",
      });
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const data = await User.create({
      isVerified: !req.body.isVerified,
      role: !req.body.role,
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phone,
      password: hashPassword,
    });

    const userId = user[0].id;
    const username = user[0].username;
    const email = user[0].email;

    const accessToken = jwt.sign(
      { userId, username, email },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      ok: true,
      message: "welcome to your blog",
      isAccountExist: data,
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

const verify = (req, res) => {
  res.json({
    ok: true,
    message: "verify success",
  });
};

const forgotPassword = (req, res) => {
  res.json({
    ok: true,
    message: "forgot password",
  });
};

const resetPassword = (req, res) => {
  res.json({
    ok: true,
    message: "reset password",
  });
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
};
