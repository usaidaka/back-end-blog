const models = require("../../models/index");
const { Op } = require("sequelize");
const { AllCategory, Blog, User, Like } = require("../../models");
const sequelize = require("sequelize");
const fs = require("fs");
const db = require("../../models");

const getBlogs = async (req, res) => {
  const pagination = {
    page: Number(req.query.page) || 1,
    perPage: Number(req.query.perPage) || 5,
    search: req.query.search || undefined,
    category: req.query.category || "",
    sort: req.query.sort || "DESC",
    keywords: req.query.keywords || "",
    title: req.query.title || "",
  };
  const limit = pagination.perPage;
  const offset = (pagination.page - 1) * pagination.perPage;

  try {
    const totalData = await Blog.findAll({});
    const totalPage = Math.ceil(totalData.length / limit);
    const where = {};
    if (pagination.search) {
      where.content = {
        [Op.like]: `%${pagination.search}%`,
      };
    }
    if (pagination.category) {
      where.CategoryId = {
        [Op.like]: `%${pagination.category}%`,
      };
    }
    if (pagination.keywords) {
      where.keywords = {
        [Op.like]: `%${pagination.keywords}%`,
      };
    }
    if (pagination.title) {
      where.title = {
        [Op.like]: `%${pagination.title}%`,
      };
    }

    const result = await Blog.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM Likes WHERE Likes.BlogId = Blog.id)`
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
              "verifyToken",
              "verifyTokenCreatedAt",
            ],
          },
        },
        {
          model: Like,
          attributes: [],
        },
      ],
      where,
      limit,
      offset,
      order: [["createdAt", pagination.sort]],
    });

    if (!result) {
      return res.status(400).json({
        ok: false,
        message: "get blog failed",
      });
    }

    res.json({
      message: "success get blog",
      totalPage,
      pagination,
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const getUserBlogs = async (req, res) => {
  try {
    const dataUser = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
    });

    if (!dataUser) {
      return res.status(400).json({
        ok: false,
        message: "user not found",
      });
    }

    const data = await Blog.findAll({
      where: { UserId: dataUser.id },
    });

    if (!data) {
      return res.status(400).json({
        ok: false,
        message: "get blog failed",
      });
    }

    res.json({
      message: "get user blog",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const createBlog = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const data = JSON.parse(req.body.data);

    if (!data) {
      return res.status(400).json({
        ok: false,
        message: "data not found",
      });
    }

    const dataUser = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
    });

    if (!dataUser) {
      return res.status(401).json({
        ok: false,
        message: "user not found",
      });
    }

    const imageURL = req.file.filename;

    if (data.CategoryId < 0 || data.CategoryId > 6) {
      return res.status(400).json({
        ok: false,
        message: "choose category from 1 - 6",
      });
    }

    const result = await Blog.create(
      {
        title: data.title,
        content: data.content,
        UserId: dataUser.id,
        CategoryId: data.CategoryId,
        imageURL: `photoBlogs/${imageURL}`,
        videoURL: data.videoURL,
        country: data.country,
        url: data.url,
        keywords: data.keywords,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({
      ok: true,
      message: "create blog successful",
      data: result,
    });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({
      ok: false,
      message: "fatal error",
    });
  }
};

const allCategory = async (req, res) => {
  try {
    const allCategories = await AllCategory.findAll();

    return res.json({
      ok: true,
      allCategories,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      ok: false,
      message: error.stack,
    });
  }
};

const like = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const dataUser = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
      attributes: {
        exclude: ["token"],
      },
    });

    const { BlogId } = req.body;
    const UserId = dataUser.id;

    const dataBlog = await Blog.findOne({ where: { id: BlogId } });
    if (!dataBlog) {
      return res.status(400).json({
        ok: false,
        message: "blog not found",
      });
    }

    if (!dataUser) {
      return res.status(400).json({
        ok: false,
        message: "User not found",
      });
    }

    if (!BlogId) {
      return res.status(400).json({
        ok: false,
        message: "Blog not found",
      });
    }

    const count = await Like.count({
      where: { UserId: UserId, BlogId: BlogId },
    });

    if (count < 1) {
      await Like.create(
        {
          UserId: dataUser.id,
          BlogId: BlogId,
        },
        { transaction: t }
      );

      await t.commit();
      return res.status(201).json({
        ok: true,
        message: "like blog successful",
        data: `blog with id ${BlogId} is liked`,
        dataUser,
      });
    } else {
      await t.rollback();
      return res.status(400).json({
        ok: false,
        message: "post liked, you can't like the post twice",
        count,
      });
    }
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const pagLike = async (req, res) => {
  try {
    const dataUser = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
    });
    console.log(dataUser);

    const data = await Blog.findAll(
      {
        attributes: {
          include: [
            [
              models.sequelize.fn(
                "COUNT",
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
                "verifyToken",
                "verifyTokenCreatedAt",
              ],
            },
          },
          {
            model: Like,
            where: {
              UserId: dataUser.id,
            },
            attributes: [],
          },
        ],
        group: ["Blog.id"],
        order: [["total_like", "desc"]],
      },
      {
        where: {
          UserId: dataUser.id,
        },
      }
    );

    res.status(200).json({
      ok: true,
      data: data,
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
  const t = await db.sequelize.transaction();
  try {
    const { BlogId } = req.body;

    const user = await User.findOne({
      where: { id: req.user.userId },
    });

    const isLikeExist = await Like.findOne({
      where: {
        UserId: user.id,
      },
    });

    const dataBlog = await Blog.findOne({ where: { id: BlogId } });
    if (!dataBlog) {
      return res.status(400).json({
        ok: false,
        message: "blog not found",
      });
    }

    if (!isLikeExist) {
      return res.status(400).json({
        ok: false,
        message: "you have not liked this blog yet",
      });
    }

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "user not found",
      });
    }

    await Like.destroy(
      {
        where: {
          BlogId: BlogId,
        },
      },
      { transaction: t }
    );

    await t.commit();
    res.status(200).json({
      ok: true,
      message: `unlike on Blog Id ${BlogId}`,
    });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const pagFav = async (req, res) => {
  try {
    const data = await Blog.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM Likes WHERE Likes.BlogId = Blog.id)`
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
              "token",
              "expired-token",
            ],
          },
        },
        {
          model: Like,
          attributes: [],
        },
      ],
      group: ["Blog.id"],
      order: [[sequelize.literal("total_like"), "desc"]],
      limit: 10,
    });

    res.status(200).json({
      ok: true,
      data: data,
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

  try {
    const t = await db.sequelize.transaction();
    const user = await User.findOne({ where: { id: req.user.userId } });
    const dataBlog = await Blog.findOne({ where: { id: id } });
    console.log(user);
    if (!dataBlog) {
      return res.status(400).json({
        ok: false,
        message: "blog not found",
      });
    }
    const deleteBlog = await Blog.destroy(
      {
        where: { id: id, UserId: user.id },
      },
      { transaction: t }
    );
    const deleteLike = await Like.destroy(
      {
        where: { BlogId: id, UserId: user.id },
      },
      { transaction: t }
    );
    if (!deleteBlog && !deleteLike) {
      await t.rollback();
      return res.status(400).json({
        ok: false,
        message: "you cannot delete other user's blog ",
      });
    }
    const realImageURL = dataBlog.getDataValue("imageURL").split("/")[1];
    if (realImageURL) {
      fs.unlinkSync(`${__dirname}/../../Public/blogs/${realImageURL}`);
    }
    await t.commit();
    res.json({
      ok: true,
      message: `blog by id: ${id} has been successfully deleted`,
    });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const editBlog = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { data } = req.body;
  const t = await db.sequelize.transaction();
  try {
    const getBlog = await Blog.findOne({
      where: {
        id,
        UserId: userId,
      },
    });

    if (!getBlog) {
      return res.status(400).json({
        message: "blog not found",
      });
    }

    if (data || req.file) {
      if (data) {
        const newData = JSON.parse(data);
        await Blog.update(
          {
            title: newData.title,
            content: newData.content,
            country: newData.country,
            CategoryId: newData.CategoryId,
            videoURL: newData.videoURL,
            url: newData.url,
            keywords: newData.keywords,
          },
          {
            where: {
              id,
              UserId: userId,
            },
          },
          { transaction: t }
        );
      }

      if (req.file) {
        const newImage = req.file.filename;
        await Blog.update(
          {
            imageURL: `photoBlogs/${newImage}`,
          },
          {
            where: {
              id,
              UserId: userId,
            },
          },
          { transaction: t }
        );

        const realImageURL = getBlog.getDataValue("imageURL").split("/")[1];
        if (realImageURL) {
          fs.unlinkSync(`${__dirname}/../../Public/blogs/${realImageURL}`);
        }
      }
    }

    const getUpdatedBlog = await Blog.findOne({
      where: {
        id,
        UserId: userId,
      },
    });

    await t.commit();

    res.status(201).json({
      ok: true,
      message: "blog updated",
      data: getUpdatedBlog,
    });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({
      message: "fatal error on server",
      error,
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
  editBlog,
};
