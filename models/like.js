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
      Like.belongsTo(models.User, {
        foreignKey: "UserId",
        onDelete: "cascade",
        hooks: true,
      });
      Like.belongsTo(models.Blog, {
        foreignKey: "BlogId",
        onDelete: "cascade",
        hooks: true,
      });
    }
  }
  Like.init(
    {
      UserId: {
        type: DataTypes.INTEGER,
      },
      BlogId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "Like",
    }
  );
  return Like;
};
