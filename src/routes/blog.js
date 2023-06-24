const routerBlog = require("express").Router();
const BlogController = require("../controller/blog");

// middleware
const upload = require("../middleware/multerBlog");
const verifyToken = require("../middleware/verifyToken");
const isAccountVerified = require("../middleware/isAccountVerified");
const Validation = require("../validation");

routerBlog.post(
  "/blog",
  verifyToken,
  isAccountVerified,
  upload.single("file"),
  Validation.createBlog,
  Validation.runValidation,
  BlogController.createBlog
);
routerBlog.get("/blog", BlogController.getBlogs);
routerBlog.get("/blog/user", verifyToken, BlogController.getUserBlogs);

routerBlog.post(
  "/blog/like",
  verifyToken,
  isAccountVerified,
  BlogController.like
);
routerBlog.get("/blog/allCategory", BlogController.allCategory);
routerBlog.get(
  "/blog/pag-like",
  verifyToken,
  isAccountVerified,
  BlogController.pagLike
);
routerBlog.get("/blog/pag-fav", BlogController.pagFav);
routerBlog.delete(
  "/blog/remove/:id",
  verifyToken,
  isAccountVerified,
  BlogController.deleteBlog
);
routerBlog.delete(
  "/blog/pag-like/remove",
  verifyToken,
  isAccountVerified,
  BlogController.unLike
);
routerBlog.patch(
  "/blog/edit-blog/:id",
  verifyToken,
  isAccountVerified,
  upload.single("file"),
  Validation.editBlog,
  Validation.runValidation,
  BlogController.editBlog
);

module.exports = routerBlog;
