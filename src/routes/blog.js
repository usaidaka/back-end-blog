const routerBlog = require("express").Router();
const BlogController = require("../controller/blog");

// middleware
const upload = require("../middleware/multerBlog");
const verifyToken = require("..//middleware/verifyToken");

routerBlog.post(
  "/blog",
  verifyToken,
  upload.single("file"),
  BlogController.createBlog
);
routerBlog.get("/blog", BlogController.getBlogs);
routerBlog.get("/blog/user", verifyToken, BlogController.getUserBlogs);

routerBlog.post("/blog/like", verifyToken, BlogController.like);
routerBlog.get("/blog/allCategory", BlogController.allCategory);
routerBlog.get("/blog/pag-like", verifyToken, BlogController.pagLike);
routerBlog.get("/blog/pag-fav", BlogController.pagFav);
routerBlog.delete("/blog/remove/:id", verifyToken, BlogController.deleteBlog);
routerBlog.delete("/blog/pag-like/remove", verifyToken, BlogController.unLike);

module.exports = routerBlog;
