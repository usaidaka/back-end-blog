"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("AllCategories", [
      {
        name: "Bisnis",
      },
      {
        name: "Ekonomi",
      },
      {
        name: "Teknologi",
      },
      {
        name: "Olahraga",
      },
      {
        name: "Kuliner",
      },
      {
        name: "International",
      },
      {
        name: "Fiksi",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("AllCategories", null, {});
  },
};
