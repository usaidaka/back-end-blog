"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Blog.belongsTo(models.AllCategory, { foreignKey: "CategoryId" });
      Blog.belongsTo(models.User, { foreignKey: "UserId" });
      Blog.hasMany(models.Like, { foreignKey: "BlogId" });
    }
  }
  Blog.init(
    {
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
      CategoryId: DataTypes.STRING,
      imageURL: DataTypes.STRING,
      country: DataTypes.STRING,
      url: DataTypes.STRING,
      keywords: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Blog",
    }
  );
  return Blog;
};
