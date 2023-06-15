"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AllCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AllCategory.hasOne(models.Blog, { foreignKey: "id" });
    }
  }
  AllCategory.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "AllCategory",
      timestamps: false,
    }
  );
  return AllCategory;
};
