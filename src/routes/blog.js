const routerBlog = require("express").Router();
const BlogController = require("../controller/blog");

routerBlog.post("/blog", BlogController.createBlog);
routerBlog.get("/blog", BlogController.getBlog);

routerBlog.post("/blog/like", BlogController.like);
routerBlog.get("/blog/allCategory", BlogController.allCategory);
routerBlog.get("/blog/pag-like", BlogController.pagLike);
routerBlog.get("/blog/pag-fav", BlogController.pagFav);
routerBlog.delete("/blog/remove/:id", BlogController.deleteBlog);

module.exports = routerBlog;
