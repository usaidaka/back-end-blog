const { AllCategory } = require("../../models");

const getBlog = (req, res) => {
  res.json({
    ok: true,
    message: "get blog",
  });
};

const createBlog = (req, res) => {
  res.json({
    ok: true,
    message: "create blog",
  });
};

const like = (req, res) => {
  res.json({
    ok: true,
    message: "like",
  });
};
const allCategory = async (req, res) => {
  try {
    const allCategories = await AllCategory.findAll();
    res.json({
      ok: true,
      allCategories,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: error.stack,
    });
  }
};
const pagLike = (req, res) => {
  res.json({
    ok: true,
    message: "pagLike",
  });
};
const pagFav = (req, res) => {
  res.json({
    ok: true,
    message: "pagFav",
  });
};
const deleteBlog = (req, res) => {
  res.json({
    ok: true,
    message: "delete blog",
  });
};

module.exports = {
  getBlog,
  createBlog,
  deleteBlog,
  like,
  pagLike,
  pagFav,
  allCategory,
};
