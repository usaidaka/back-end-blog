"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Blog, { onDelete: "cascade", hooks: true });
    }
  }
  User.init(
    {
      isVerified: {
        type: DataTypes.BOOLEAN,
        unique: true,
      },
      role: {
        type: DataTypes.BOOLEAN,
        unique: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      imgProfile: {
        type: DataTypes.STRING,
        unique: true,
        get() {
          const rawValue = this.getDataValue("imgProfile");
          if (rawValue) {
            return `${process.env.BASEPATH}/${rawValue}`;
          }
          return null;
        },
      },
      phone: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: DataTypes.STRING,
      verifyToken: DataTypes.STRING,
      verifyTokenCreatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
