const { User } = require("../../models");
const bcrypt = require("bcrypt");
const fs = require("fs");

const changePassword = async (req, res) => {
  try {
    const data = await User.findAll({
      where: {
        username: req.user.username,
        email: req.user.email,
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
    const data = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
    });
    const { currentUsername, newUsername } = req.body;

    if (data.username === currentUsername) {
      await User.update(
        { username: newUsername },
        { where: { username: data.username } }
      );
      res.json({
        ok: true,
        message: "change username successful and please log in again",
      });
    } else {
      res.status(400).json({
        ok: false,
        message: "current username not match",
        data: data.username,
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
    const data = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
    });

    const { currentEmail, newEmail } = req.body;

    if (data.email === currentEmail) {
      await User.update({ email: newEmail }, { where: { email: data.email } });
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
    const data = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
    });
    const { currentPhone, newPhone } = req.body;

    if (data.phone === currentPhone) {
      await User.update({ phone: newPhone }, { where: { phone: data.phone } });
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
    const data = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
      attributes: {
        exclude: ["token", "password"],
      },
    });
    const photoProfile = req.file.filename;
    let previousImage;
    if (data.imgProfile != null) {
      previousImage = data.getDataValue("imgProfile").split("/")[1];
    }

    const dataUser = await data.update(
      { imgProfile: `photoProfile/${photoProfile}` },
      { where: { imgProfile: data.id } }
    );

    if (req.file && previousImage != null) {
      const mainImageProfile = data.getDataValue("imgProfile").split("/")[1];
      if (previousImage && previousImage !== mainImageProfile) {
        fs.unlinkSync(`${__dirname}/../../Public/images/${previousImage}`);
      }
    }
    res.json({
      ok: true,
      message: "single upload",
      data: dataUser,
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
