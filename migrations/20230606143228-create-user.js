"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const currentDate = new Date();
    const expiredDate = new Date(currentDate.getTime() + 30 * 60000)
      .toISOString()
      .replace("T", " ")
      .replace(".000Z", "")
      .replace("Z", "")
      .slice(0, -4);
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      role: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      username: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      imgProfile: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      token: {
        type: Sequelize.STRING,
      },
      tokenExpired: {
        allowNull: false,
        type: Sequelize.STRING, // atau Sequelize.TEXT
        defaultValue: Sequelize.literal(`'${expiredDate}'`),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
