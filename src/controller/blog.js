const jwt_decode = require("jwt-decode");
const { AllCategory, Blog, User } = require("../../models");

// bagaimana memasukkan user dan category ke dalam blog
const getBlogs = async (req, res) => {
  try {
    const data = await Blog.findAll();
    const category = await AllCategory.findAll({
      where: { id: data.map((attr) => Number(attr.CategoryId)) },
    });
    const user = await User.findAll({
      where: {
        id: data[0].UserId,
      },
      attributes: {
        exclude: ["isVerified", "role", "password", "createdAt", "updatedAt"],
      },
    });

    res.status(200).json({
      ok: true,
      data: data,
      category,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(400),
      json({
        ok: false,
        message: error.message,
      });
  }
};

const getUserBlogs = async (req, res) => {
  try {
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[1];

    const decodeToken = jwt_decode(token);

    const dataUser = await User.findOne({
      where: {
        username: decodeToken.username,
        email: decodeToken.email,
      },
    });

    const data = await Blog.findAll({ where: { UserId: dataUser.id } });

    res.json({
      message: "get user blog",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: error,
    });
  }
};

const createBlog = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[1];

    const decodeToken = jwt_decode(token);

    const dataUser = await User.findOne({
      where: {
        username: decodeToken.username,
        email: decodeToken.email,
      },
    });

    const result = await Blog.create({
      title: data.title,
      content: data.content,
      UserId: dataUser.id,
      CategoryId: data.CategoryId,
      imageURL: data.imageURL,
      country: data.country,
      url: data.url,
      keywords: data.keywords,
    });

    res.status(201).json({
      ok: true,
      message: "create blog successful",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: "create blog failed",
    });
  }
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

const deleteBlog = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    await Blog.destroy({ where: { id: id } });
    res.json({
      ok: true,
      message: `blog by id : ${id} are successfully deleted`,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBlogs,
  createBlog,
  deleteBlog,
  like,
  pagLike,
  pagFav,
  allCategory,
  getUserBlogs,
};
