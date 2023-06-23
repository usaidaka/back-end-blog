"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("AllCategories", [
      {
        name: "Umum",
      },
      {
        name: "Olahraga",
      },
      {
        name: "Ekonomi",
      },
      {
        name: "Politik",
      },
      {
        name: "Bisnis",
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
