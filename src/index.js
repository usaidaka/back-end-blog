require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const cors = require("cors");
// const { check, validationResult } = require("express-validator");

//middleware
const logRequest = require("./middleware/log");
const verifyToken = require("./middleware/verifyToken");
const errorMiddleware = require("./middleware/errorHandle");

// router
const ProfileRouter = require("./routes/profile");
const AuthRouter = require("./routes/auth");
const BlogRouter = require("./routes/blog");

// middleware
app.use(cors());
app.use(express.json());
app.use(logRequest);
app.use("/photoProfile", express.static("public/images"));
app.use("/photoBlogs", express.static("public/blogs"));
app.use(express.urlencoded({ extended: false }));

// routes
app.use("/api", ProfileRouter);
app.use("/api", AuthRouter);
app.use("/api", BlogRouter);

// middleware for error
app.use(errorMiddleware.errorRouteNotFound);
app.use(errorMiddleware.errorHandler);

app.listen(PORT, () => {
  console.log(`listening on PORT : ${PORT}`);
});
