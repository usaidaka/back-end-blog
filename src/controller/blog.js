const models = require("../../models/index");
const { Op } = require("sequelize");
const { AllCategory, Blog, User, Like } = require("../../models");
const sequelize = require("sequelize");

const getBlogs = async (req, res) => {
  const pagination = {
    page: Number(req.query.page) || 1,
    perPage: Number(req.query.perPage) || 5,
    search: req.query.search || undefined,
    category: req.query.category || "",
    sort: req.query.sort || "DESC",
    keywords: req.query.keywords || "",
    title: req.query.title || "",
    username: req.query.username || "",
  };
  const limit = pagination.perPage;
  const offset = (pagination.page - 1) * pagination.perPage;

  try {
    const totalData = await Blog.findAll();
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
      where,
      limit,
      offset,
      order: [["createdAt", pagination.sort]],
    });
    // console.log(
    //   result.map(
    //     (x) =>
    //       (x.imageURL = `${process.env.BASEPATH}${result.map(
    //         (x) => x.imageURL
    //       )}`)
    //   )
    // );

    // const dataResult = JSON.parse(JSON.stringify(result));
    // for (let i = 0; i < dataResult.length; i++) {
    //   const data = dataResult[i];
    //   dataResult[i].total_like = data.Likes.length;
    //   delete dataResult[i].Likes;
    // }

    // const resultLatest = await result.findAll({ limit, offset });

    res.json({
      message: "success get blog",
      totalPage,
      pagination,
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

// const getBlogs = async (req, res) => {
//   try {
//     const { query } = req;
//     console.log(query);
//     // filtering
//     const totalData = await Blog.findAll();
//     let data;
//     const category = query.category || "";
//     const sorting = query.sort || "desc";
//     const keywords = query.keywords || "";
//     const username = query.username || "";

//     // pagination
//     const page = parseInt(query.page) || 1;
//     const limit = parseInt(query.limit) || 8;
//     const offset = (page - 1) * limit;
//     const totalPage = Math.ceil(totalData.length / limit);

//     data = await Blog.findAll({
//       where: {
//         CategoryId: category,
//         [Op.or]: [
//           { title: { [Op.like]: `%${keywords}%` } },
//           { content: { [Op.like]: `%${keywords}%` } },
//         ],
//       },
//       include: [
//         { model: AllCategory },
//         {
//           model: User,
//           where: {
//             username: { [Op.like]: `%${username}%` },
//           },
//           attributes: {
//             exclude: [
//               "createdAt",
//               "updatedAt",
//               "password",
//               "phone",
//               "role",
//               "isVerified",
//               "token",
//               "expired-token",
//             ],
//           },
//         },
//         {
//           model: Like,
//           attributes: [],
//         },
//       ],

//       attributes: {
//         include: [
//           [
//             models.sequelize.fn("count", models.sequelize.col("likes.UserId")),
//             "total_like",
//           ],
//         ],
//       },

//       group: ["Blog.id"],
//       order: [["createdAt", sorting]],
//     });
//     console.log("dari atas");
//       const allBlog = await await Blog.findAll({ limit, offset });
//       // console.log("data", data);
//       if (data && !category) {
//         console.log("data");
//         return res.status(200).json({
//           ok: true,
//           page,
//           limit,
//           totalPage,
//           data: allBlog,

//           // category,
//           // user,
//         });
//       } else if (category) {
//         console.log("query");
//         return res.status(200).json({
//           ok: true,
//           page,
//           limit,
//           totalPage,
//           data: data,
//           // category,
//           // user,
//         });
//       }
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({
//       ok: false,
//       message: error.message,
//     });
//   }
// };
// const getBlogs = async (req, res) => {
//   try {
//     const { query } = req;
//     console.log(query);
//     // filtering
//     const totalData = await Blog.findAll();
//     let data;
//     const category = query.category || "";
//     const sorting = query.sort || "desc";
//     const keywords = query.keywords || "";
//     const username = query.username || "";

//     // pagination
//     const page = parseInt(query.page) || 1;
//     const limit = parseInt(query.limit) || 8;
//     const offset = (page - 1) * limit;
//     const totalPage = Math.ceil(totalData.length / limit);

//     data = await Blog.findAll({
//       where: {
//         CategoryId: category,
//         [Op.or]: [
//           { title: { [Op.like]: `%${keywords}%` } },
//           { content: { [Op.like]: `%${keywords}%` } },
//         ],
//       },
//       include: [
//         { model: AllCategory },
//         {
//           model: User,
//           where: {
//             username: { [Op.like]: `%${username}%` },
//           },
//           attributes: {
//             exclude: [
//               "createdAt",
//               "updatedAt",
//               "password",
//               "phone",
//               "role",
//               "isVerified",
//               "token",
//               "expired-token",
//             ],
//           },
//         },
//         {
//           model: Like,
//           attributes: [],
//         },
//       ],

//       attributes: {
//         include: [
//           [
//             models.sequelize.fn("count", models.sequelize.col("likes.UserId")),
//             "total_like",
//           ],
//         ],
//       },

//       group: ["Blog.id"],
//       order: [["createdAt", sorting]],
//     });
//     console.log("dari atas");
//     const allBlog = await await Blog.findAll({ limit, offset });
//     // console.log("data", data);
//     if (data && !category) {
//       console.log("data");
//       return res.status(200).json({
//         ok: true,
//         page,
//         limit,
//         totalPage,
//         data: allBlog,

//         // category,
//         // user,
//       });
//     } else if (category) {
//       console.log("query");
//       return res.status(200).json({
//         ok: true,
//         page,
//         limit,
//         totalPage,
//         data: data,
//         // category,
//         // user,
//       });
//     }

//     // if (!query) {
//     //   data = await Blog.findAll(
//     //     {
//     //       limit,
//     //       offset,
//     //     },
//     //     {
//     //       where: {
//     //         [Op.or]: [
//     //           { title: { [Op.like]: `%${keywords}%` } },
//     //           { content: { [Op.like]: `%${keywords}%` } },
//     //         ],
//     //       },

//     //       include: [
//     //         { model: AllCategory },
//     //         {
//     //           model: User,
//     //           where: {
//     //             username: { [Op.like]: `%${username}%` },
//     //           },
//     //           attributes: {
//     //             exclude: [
//     //               "createdAt",
//     //               "updatedAt",
//     //               "password",
//     //               "phone",
//     //               "role",
//     //               "isVerified",
//     //               "token",
//     //               "expired-token",
//     //             ],
//     //           },
//     //         },
//     //         {
//     //           model: Like,
//     //           attributes: [],
//     //         },
//     //       ],

//     //       attributes: {
//     //         include: [
//     //           [
//     //             models.sequelize.fn(
//     //               "count",
//     //               models.sequelize.col("likes.UserId")
//     //             ),
//     //             "total_like",
//     //           ],
//     //         ],
//     //       },
//     //       group: ["Blog.id"],
//     //       order: [["createdAt", sorting]],
//     //     }
//     //   );
//     //   console.log("dari bawah");
//     //   return res.status(200).json({
//     //     ok: true,
//     //     page,
//     //     limit,
//     //     totalPage,
//     //     data: data,
//     //     // category,
//     //     // user,
//     //   });
//     // }
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({
//       ok: false,
//       message: error.message,
//     });
//   }
// };

// const getBlogs = async (req, res) => {
//   const pagination = {
//     page: Number(req.query.page) || 1,
//     perPage: Number(req.query.perPage) || 4,
//     search: req.query.search || undefined,
//     sortBy: req.query.sortBy,
//   };
//   try {
//     const where = {};
//     where.title = { [Op.like]: `%${pagination.search}%` };
//     const order = [];
//     for (const sort in pagination.sortBy) {
//       order.push([sort, pagination.sortBy[sort]]);
//     }

//     const blog = await Blog.findAll({
//       where,
//       include: [
//         { model: AllCategory },
//         {
//           model: User,
//           attributes: {
//             exclude: [
//               "createdAt",
//               "updatedAt",
//               "password",
//               "phone",
//               "role",
//               "isVerified",
//               "token",
//               "expired-token",
//             ],
//           },
//         },
//         {
//           model: Like,
//           attributes: [],
//         },
//       ],
//       attributes: {
//         include: [
//           [
//             models.sequelize.fn("count", models.sequelize.col("likes.UserId")),
//             "total_like",
//           ],
//         ],
//       },

//       group: ["Blog.id"],

//       limit: pagination.perPage,
//       offset: (pagination.page - 1) * pagination.perPage,
//       order,
//     });

//     const totalBlog = await Blog.count({ where });
//     res.send({
//       message: "get all blog",
//       pagination: {
//         page: pagination.page,
//         perPage: pagination.perPage,
//         totalData: totalBlog,
//         search: [],
//         order: [],
//       },
//       data: blog,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({
//       ok: false,
//       message: error.message,
//     });
//   }
// };

// const getBlogs = async (req, res) => {
//   try {
//     const { query } = req;
//     // Filtering
//     const category = query.category || "";
//     const sorting = query.sort || "desc";
//     const keywords = query.keywords || "";
//     const username = query.username || "";

//     // Pagination
//     const page = parseInt(query.page) || 1;
//     const limit = parseInt(query.limit) || 8;
//     const offset = (page - 1) * limit;

//     const where = {
//       CategoryId: category,
//       [Op.or]: [
//         { title: { [Op.like]: `%${keywords}%` } },
//         { content: { [Op.like]: `%${keywords}%` } },
//       ],
//     };

//     const include = [
//       { model: AllCategory },
//       {
//         model: User,
//         where: {
//           username: { [Op.like]: `%${username}%` },
//         },
//         attributes: {
//           exclude: [
//             "createdAt",
//             "updatedAt",
//             "password",
//             "phone",
//             "role",
//             "isVerified",
//             "token",
//             "expired-token",
//           ],
//         },
//       },
//       {
//         model: Like,
//         attributes: [],
//       },
//     ];

//     const order = [["createdAt", sorting]];

//     const { count, rows: blogs } = await Blog.findAndCountAll({
//       where,
//       include,
//       attributes: {
//         include: [
//           [
//             models.sequelize.fn("count", models.sequelize.col("likes.UserId")),
//             "total_like",
//           ],
//         ],
//       },
//       group: ["Blog.id"],
//       order,
//       // limit,
//       // offset,
//     });

//     const totalPage = Math.ceil(count / limit);

//     res.status(200).json({
//       ok: true,
//       page,
//       limit,
//       totalPage,
//       data: blogs,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({
//       ok: false,
//       message: error.message,
//     });
//   }
// };

const getUserBlogs = async (req, res) => {
  try {
    const dataUser = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
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
      message: error.message,
    });
  }
};

const createBlog = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);

    const dataUser = await User.findOne({
      where: {
        username: req.user.username,
        email: req.user.email,
      },
    });

    const imageURL = req.file.filename;

    const result = await Blog.create({
      title: data.title,
      content: data.content,
      UserId: dataUser.id,
      CategoryId: data.CategoryId,
      imageURL: `photoBlogs/${imageURL}`,
      country: data.country,
      url: data.url,
      keywords: data.keywords,
    });
    result.imageURL = `${process.env.BASEPATH}/photoBlogs/${imageURL}`;

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
                "token",
                "expired-token",
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
    // console.log("DATA", data);
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

const unLike = async (req, res) => {
  try {
    const { BlogId } = req.body;
    console.log(BlogId);
    const user = await User.findOne({
      where: { id: req.user.userId },
    });

    if (user) {
      await Like.destroy({
        where: {
          BlogId,
        },
      });
      res.status(200).json({
        ok: true,
        message: `unlike on Blog Id ${BlogId}`,
      });
    } else {
      res.status(400).json({
        ok: false,
        message: "token is invalid",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

// const pagFav = async (req, res) => {
//   try {
//     const data = await Blog.findAll({
//       attributes: {
//         include: [
//           [
//             models.sequelize.fn("COUNT", models.sequelize.col("likes.UserId")),
//             "total_like",
//           ],
//         ],
//       },
//       include: [
//         { model: AllCategory },
//         {
//           model: User,
//           attributes: {
//             exclude: [
//               "createdAt",
//               "updatedAt",
//               "password",
//               "phone",
//               "role",
//               "isVerified",
//               "token",
//               "expired-token",
//             ],
//           },
//         },
//         {
//           model: Like,
//           attributes: [],
//         },
//       ],
//       group: ["Blog.id"],
//       order: [["total_like", "desc"]],
//       // limit: 10,
//     });

//     res.status(200).json({
//       ok: true,
//       data: data,
//       // category,
//       // user,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({
//       ok: false,
//       message: error.message,
//     });
//   }
// };

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
