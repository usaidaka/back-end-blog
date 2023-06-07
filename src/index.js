const express = require("express");
const app = express();
const PORT = 8000;
require("dotenv").config();
//middleware
const logRequest = require("./middleware/log");
const verifyToken = require("./middleware/verifyToken");

// router
const ProfileRouter = require("./routes/profile");
const AuthRouter = require("./routes/auth");
const BlogRouter = require("./routes/blog");

app.use(express.json());
app.use(logRequest);
app.use("/photoProfile", express.static("public/images"));
app.use("/photoBlogs", express.static("public/blogs"));

app.use("/api", ProfileRouter);
app.use("/api", AuthRouter);
app.use("/api", BlogRouter);
// test token
app.get("/isToken", verifyToken, (req, res) => {
  try {
    res.json({
      ok: true,
      message: "congrats, your token is valid",
    });
  } catch (error) {
    console.log(error);
    res.json({
      ok: false,
      message: "your token is not valid",
    });
  }
});

app.listen(PORT, () => {
  console.log(`listening on PORT : ${PORT}`);
});
