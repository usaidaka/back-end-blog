const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

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

    await User.create({
      isVerified: isVerified,
      role: !role,
      username: username,
      email: email,
      imgProfile: imgProfile,
      phone: phone,
      password: hashPassword,
    });

    const accessToken = jwt.sign(
      { username, email, phone },
      process.env.ACCESS_TOKEN_SECRET
    );

    const data = await User.findAll({
      where: { email: email, username: username },
      attributes: {
        exclude: ["imgProfile"],
      },
    });

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
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];

  const decodeToken = jwt_decode(token);

  const data = await User.findOne({
    where: {
      username: decodeToken.username,
      email: decodeToken.email,
    },
  });

  if (token) {
    await data.update({ isVerified: true }, { where: { isVerified: false } });
  }

  res.json({
    ok: true,
    message: "verify success",
    data,
  });
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
        message: "email does not exists",
      });
    }
    const secret = process.env.ACCESS_TOKEN_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser.id }, secret, {
      expiresIn: "30m",
    });

    const OTP = Math.random(new Date().getTime() * 543241)
      .toString()
      .substring(2, 6);

    const link = `http://localhost:8000/api/auth/reset-password/${oldUser.id}/${token}`;

    const newOTP = { recipient_email: email, OTP };
    console.log(newOTP);
    sendEmail(newOTP)
      .then((response) =>
        res.status(200).json({ message: response.message, link })
      )
      .catch((error) => res.status(500).send(error.message));
  } catch (error) {
    console.log(error);
  }
};

const resetPassword = async (req, res) => {
  res.json({
    message: "reset password",
  });
};

// helper
function sendEmail({ recipient_email, OTP }) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mail_configs = {
      from: process.env.MY_EMAIL,
      to: recipient_email,
      subject: "RECOVERY YOUR PASSWORD BY USING THIS OTP",
      html: `
<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>FORGOT PASSWORD</title>
</head>
<body>
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Purwadhika</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>.Use the following OTP to complete your Password Recovery Procedure. <span style="color:red">DO NOT LET PEOPLE KNOW YOUR OTP CODE !</span>. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;">Regards,<br />JCWD PURWADHIKA JAKARTA</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Purwadhika</p>
      <p>MSIG TOWER</p>
      <p>JC Web Development</p>
    </div>
  </div>
</div>
  
</body>
</html>`,
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  });
}

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
