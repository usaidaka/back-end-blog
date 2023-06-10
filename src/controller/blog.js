const jwt_decode = require("jwt-decode");
const models = require("../../models/index");
const { Op } = require("sequelize");
const { AllCategory, Blog, User, Like } = require("../../models");

const getBlogs = async (req, res) => {
  try {
    const { query } = req;
    let data;
    const category = query.category || "";
    const sorting = query.sort || "desc";
    const keywords = query.keywords || "";
    const username = query.username || "";
    if (query) {
      data = await Blog.findAll({
        where: {
          CategoryId: category,
          [Op.or]: [
            { title: { [Op.like]: `%${keywords}%` } },
            { content: { [Op.like]: `%${keywords}%` } },
          ],
        },
        attributes: {
          include: [
            [
              models.sequelize.fn(
                "count",
                models.sequelize.col("likes.UserId")
              ),
              "total_like",
            ],
          ],
        },
        include: [
          { model: AllCategory },
          {
            model: User,
            where: {
              username: { [Op.like]: `%${username}%` },
            },
            attributes: {
              exclude: [
                "createdAt",
                "updatedAt",
                "password",
                "phone",
                "role",
                "isVerified",
              ],
            },
          },
          {
            model: Like,
            attributes: [],
          },
        ],
        group: ["Blog.id"],
        order: [["createdAt", sorting]],
      });
    }

    if (!query.category) {
      data = await Blog.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${keywords}%` } },
            { content: { [Op.like]: `%${keywords}%` } },
          ],
        },
        attributes: {
          include: [
            [
              models.sequelize.fn(
                "count",
                models.sequelize.col("likes.UserId")
              ),
              "total_like",
            ],
          ],
        },
        include: [
          { model: AllCategory },
          {
            model: User,
            where: {
              username: { [Op.like]: `%${username}%` },
            },
            attributes: {
              exclude: [
                "createdAt",
                "updatedAt",
                "password",
                "phone",
                "role",
                "isVerified",
              ],
            },
          },
          {
            model: Like,
            attributes: [],
          },
        ],
        group: ["Blog.id"],
        order: [["createdAt", sorting]],
      });
    }

    res.status(200).json({
      ok: true,
      data: data,
      // category,
      // user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
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
    const imageURL = req.file.filename;

    const result = await Blog.create({
      title: data.title,
      content: data.content,
      UserId: dataUser.id,
      CategoryId: data.CategoryId,
      imageURL: `/photoBlogs/${imageURL}`,
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

const like = async (req, res) => {
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

    const { BlogId } = req.body;
    const UserId = dataUser.id;

    await Like.count({ where: { UserId: UserId, BlogId: BlogId } }).then(
      (count) => {
        if (count < 1) {
          Like.create({
            UserId: dataUser.id,
            BlogId: BlogId,
          });
          res.status(201).json({
            ok: true,
            message: "like blog successful",
            data: `blog with id ${BlogId} is liked`,
            dataUser,
          });
        } else {
          res.status(400).json({
            ok: false,
            message: "post liked, you can't like the post twice",
            count,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: "like blog failed",
    });
  }
};

const pagLike = async (req, res) => {
  try {
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[1];

    const decodeToken = jwt_decode(token);

    const dataUser = await User.findAll({
      where: {
        username: decodeToken.username,
        email: decodeToken.email,
      },
    });

    const data = await Like.findAll({
      include: [
        { model: Blog },
        {
          model: User,
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "password",
              "phone",
              "role",
              "isVerified",
            ],
          },
        },
      ],
      where: {
        UserId: dataUser[0].id,
      },
    });

    res.status(200).json({
      ok: true,
      data: data,
      dataUser: dataUser[0].id,

      // category,
      // user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

const unLike = async (req, res) => {
  try {
    const { id } = req.params;
    await Like.destroy({
      where: {
        BlogId: id,
      },
    });
    res.status(200).json({
      ok: true,
      message: `unlike on Blog Id ${id}`,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

const pagFav = async (req, res) => {
  try {
    const data = await Blog.findAll(
      { limit: 10 },
      {
        attributes: {
          include: [
            [
              models.sequelize.fn(
                "count",
                models.sequelize.col("likes.UserId")
              ),
              "total_like",
            ],
          ],
        },
        include: [
          { model: AllCategory },
          {
            model: User,
            attributes: {
              exclude: [
                "createdAt",
                "updatedAt",
                "password",
                "phone",
                "role",
                "isVerified",
              ],
            },
          },
          {
            model: Like,
            attributes: [],
          },
        ],
        group: ["Blog.id"],
        order: [["total_like", "desc"]],
      }
    );

    res.status(200).json({
      ok: true,
      data: data,
      // category,
      // user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
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
  unLike,
};
