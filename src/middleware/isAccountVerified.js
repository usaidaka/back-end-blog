const { User } = require("../../models");

const isAccountVerified = async (req, res, next) => {
  try {
    const dataVerified = await User.findOne({
      where: {
        id: req.user.userId,
        username: req.user.username,
        email: req.user.email,
      },
    });
    if (!dataVerified) {
      return res.status(400).json({
        message: "account not found",
      });
    }
    if (!dataVerified.isVerified) {
      return res.status(400).json({
        ok: false,
        message:
          "your account must to verified, please verify your account first",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

module.exports = isAccountVerified;
