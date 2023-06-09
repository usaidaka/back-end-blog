const { User } = require("../../models");

const jwt_decode = require("jwt-decode");
const bcrypt = require("bcrypt");

// bagaimana membuat condition agar password lama (yg berupa hashing) === newPassword (yg di hashing) sementara hashing di newPassword berbeda2
// bcrypt match
const changePassword = async (req, res) => {
  try {
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[1];

    const decodeToken = jwt_decode(token);

    const data = await User.findAll({
      where: {
        username: decodeToken.username,
        email: decodeToken.email,
      },
    });
    const { currentPassword, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        ok: false,
        message: "new password and confirm password have to match",
      });
    }

    const salt = await bcrypt.genSalt();
    const hashNewPassword = await bcrypt.hash(password, salt);

    const match = await bcrypt.compare(currentPassword, data[0].password);
    console.log(match);
    if (!match) {
      return res.status(400).json({
        ok: false,
        message: "new password and existing password not match",
      });
    }

    await User.update(
      { password: hashNewPassword },
      { where: { password: data[0].password } }
    );
    res.json({
      ok: true,
      message: "change password successful. please log in",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: error.stack,
    });
  }
};

const changeUsername = async (req, res) => {
  try {
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[1];

    const decodeToken = jwt_decode(token);

    const data = await User.findAll({
      where: {
        username: decodeToken.username,
        email: decodeToken.email,
      },
    });
    const { currentUsername, newUsername } = req.body;

    if (data[0].username === currentUsername) {
      await User.update(
        { username: newUsername },
        { where: { username: data[0].username } }
      );
      res.json({
        ok: true,
        message: "change username successful and please log in again",
      });
    } else {
      res.status(400).json({
        ok: false,
        message: "current username not match",
        data: data[0].username,
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

const changeEmail = async (req, res) => {
  try {
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[1];

    const decodeToken = jwt_decode(token);

    const data = await User.findAll({
      where: {
        username: decodeToken.username,
        email: decodeToken.email,
      },
    });
    const { currentEmail, newEmail } = req.body;

    if (data[0].email === currentEmail) {
      await User.update(
        { email: newEmail },
        { where: { email: data[0].email } }
      );
      res.json({
        ok: true,
        message: "change email successful and please log in again",
      });
    } else {
      res.status(400).json({
        ok: false,
        message: "current email not match",
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
const changePhone = async (req, res) => {
  try {
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[1];

    const decodeToken = jwt_decode(token);

    const data = await User.findAll({
      where: {
        username: decodeToken.username,
        email: decodeToken.email,
      },
    });
    const { currentPhone, newPhone } = req.body;

    if (data[0].phone === currentPhone) {
      await User.update(
        { phone: newPhone },
        { where: { phone: data[0].phone } }
      );
      res.json({
        ok: true,
        message: "change phone successful",
      });
    } else {
      res.status(400).json({
        ok: false,
        message: "current phone not match",
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

const singleUpload = async (req, res) => {
  try {
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[1];

    const decodeToken = jwt_decode(token);

    const data = await User.findAll({
      where: {
        username: decodeToken.username,
        email: decodeToken.email,
      },
    });

    const photoProfile = req.file.filename;

    await data[0].update(
      { imgProfile: `/photoProfile/${photoProfile}` },
      { where: { imgProfile: null } }
    );
    res.json({
      ok: true,
      message: "single upload",
      data,
      photo: `http://localhost:8000/photoProfile/${photoProfile}`,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  changePassword,
  changeUsername,
  changeEmail,
  changePhone,
  singleUpload,
};
