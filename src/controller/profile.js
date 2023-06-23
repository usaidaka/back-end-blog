const { User, Blog, Like, ResetPassword } = require("../../models");
const bcrypt = require("bcrypt");
const fs = require("fs");
const crypto = require("crypto");
const Mailer = require("../controller/mailer");
const db = require("../../models");

const changePassword = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const data = await User.findAll({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
    });

    if (!data) {
      return res.status(401).json({
        ok: false,
        message: "User not found",
      });
    }

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
      { where: { password: data[0].password } },
      { transaction: t }
    );

    await t.commit();
    res.json({
      ok: true,
      message: "change password successful. please log in",
    });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({
      ok: false,
      message: error.stack,
    });
  }
};

const changeUsername = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { newUsername } = req.body;
    const data = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
    });

    if (!data) {
      return res.status(401).json({
        ok: false,
        message: "user not found",
      });
    }

    const isUsernameExist = await User.findOne({
      where: {
        username: newUsername,
      },
    });

    if (isUsernameExist) {
      return res.json({
        ok: true,
        message: "username already exist",
      });
    }

    if (data) {
      await User.update(
        { username: newUsername },
        { where: { username: data.username } },
        { transaction: t }
      );
      return res.json({
        ok: true,
        message: "change username successful and please log in again",
      });
    } else {
      await t.rollback();
      return res.status(400).json({
        ok: false,
        message: "current username not match",
        data: data.username,
      });
    }
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const changeEmail = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { newEmail } = req.body;
    const data = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
    });

    if (!data) {
      return res.status(401).json({
        ok: false,
        message: "account not found",
      });
    }

    const isEmailExist = await User.findOne({
      where: {
        email: newEmail,
      },
    });

    if (isEmailExist) {
      return res.status(400).json({
        message: "email already taken",
      });
    }

    if (data) {
      const accessVerify =
        crypto.randomBytes(16).toString("hex") +
        Math.random() +
        new Date().getTime();
      const time = new Date();
      await User.update(
        {
          email: newEmail,
          isVerified: false,
          verifyToken: accessVerify,
          verifyTokenCreatedAt: time,
        },
        { where: { email: data.email } },
        { transaction: t }
      );

      const link = `${process.env.BASEPATH_FE_REACT}/api/auth/verify/${accessVerify}`;

      const mailing = { recipient_email: newEmail, link };
      Mailer.sendChangeEmailVerify(mailing);

      await t.commit();
      res.json({
        ok: true,
        message: "change email successful and please log in again",
      });
    } else {
      await t.rollback();
      res.status(400).json({
        ok: false,
        message: "current email not match",
      });
    }
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const changePhone = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { newPhone } = req.body;
    const data = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
    });

    if (!data) {
      return res.status(401).json({
        ok: false,
        message: "user not found",
      });
    }

    const isPhoneExist = await User.findOne({ where: { phone: newPhone } });
    if (isPhoneExist) {
      return res.json({
        ok: true,
        message: "phone number already exist",
      });
    }

    if (data) {
      await User.update(
        { phone: newPhone },
        { where: { phone: data.phone } },
        { transaction: t }
      );
      await t.commit();
      return res.json({
        ok: true,
        message: "change phone successful",
      });
    } else {
      await t.rollback();
      return res.status(400).json({
        ok: false,
        message: "current phone not match",
      });
    }
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const singleUpload = async (req, res) => {
  const t = await db.sequelize.transaction();
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

    if (!data) {
      return res.status(401).json({
        ok: false,
        message: "user not found",
      });
    }

    const photoProfile = req.file.filename;
    let previousImage;
    if (data.imgProfile != null) {
      previousImage = data.getDataValue("imgProfile").split("/")[1];
    }

    const dataUser = await data.update(
      { imgProfile: `photoProfile/${photoProfile}` },
      { where: { imgProfile: data.id } },
      { transaction: t }
    );

    if (req.file && previousImage != null) {
      const mainImageProfile = data.getDataValue("imgProfile").split("/")[1];
      if (previousImage && previousImage !== mainImageProfile) {
        fs.unlinkSync(`${__dirname}/../../Public/images/${previousImage}`);
      }
    }
    await t.commit();
    res.json({
      ok: true,
      message: "single upload",
      data: dataUser,
    });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({
      ok: false,
      message: "fatal error",
    });
  }
};

const closeAccount = async (req, res) => {
  const t = await db.sequelize.transaction();

  const userId = req.user.userId;
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        ok: false,
        message: "Wrong password",
      });
    }

    if (username !== user.username) {
      return res.status(400).json({
        ok: false,
        message: "Wrong username",
      });
    }

    const userBlogs = await Blog.findAll({
      where: {
        UserId: userId,
      },
    });

    if (userBlogs.length > 0) {
      for (const blog of userBlogs) {
        const imageURL = blog.getDataValue("imageURL");
        if (imageURL) {
          const imageName = imageURL.split("/")[1];
          fs.unlinkSync(`${__dirname}/../../Public/blogs/${imageName}`);
        }
      }

      const destroyBlog = await Blog.destroy(
        {
          where: {
            UserId: userId,
          },
        },
        { transaction: t }
      );
      if (!destroyBlog) {
        await t.rollback();
        return res.status(400).json({
          ok: false,
          message: "destroy user's blog failed",
        });
      }
    }

    const userLikes = await Like.findAll({
      where: {
        UserId: userId,
      },
    });

    if (userLikes.length > 0) {
      for (const like of userLikes) {
        const imageURL = like.getDataValue("imageURL");
        if (imageURL) {
          const imageName = imageURL.split("/")[1];
          fs.unlinkSync(`${__dirname}/../../Public/blogs/${imageName}`);
        }
      }

      const destroyLike = await Like.destroy(
        {
          where: {
            UserId: userId,
          },
        },
        { transaction: t }
      );

      if (!destroyLike) {
        await t.rollback();
        return res.status(400).json({
          ok: false,
          message: "destroy user's like failed",
        });
      }
    }

    const userResetPassword = await ResetPassword.findAll({
      where: {
        UserId: userId,
      },
    });

    if (userResetPassword.length > 0) {
      await ResetPassword.destroy(
        {
          where: {
            UserId: userId,
          },
        },
        { transaction: t }
      );
    }

    await User.destroy(
      {
        where: {
          id: userId,
        },
      },
      { transaction: t }
    );
    await t.commit();
    res.status(200).json({
      ok: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error(error);
    await t.rollback();
    res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
};

module.exports = {
  changePassword,
  changeUsername,
  changeEmail,
  changePhone,
  singleUpload,
  closeAccount,
};
