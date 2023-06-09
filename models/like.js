"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      Like.belongsTo(models.User, { foreignKey: "UserId" });
      Like.belongsTo(models.Blog, { foreignKey: "BlogId" });
    }
  }
  Like.init(
    {
      UserId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      BlogId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "Like",
    }
  );
  return Like;
};
