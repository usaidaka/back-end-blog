# # MiniBlog Backend API

This repository contains a REST API for the MiniBlog application built using Express.js. The API allows users to create, read, update, and delete blog posts. also, this API allows user to like, unlike, change photo profile, register, login, and many more.

[![Express Logo](https://i.cloudup.com/zfY6lL7eFa-3000x3000.png)](http://expressjs.com/)

Fast, unopinionated, minimalist web framework for [Node.js](http://nodejs.org).
<p>this API implemented ORM by using Sequelize and mySQL as database,</p> 
<span align="left"><a href="https://sequelize.org"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFDuwpPiasM9ECrEuO5nPzbHUJTiApvE4cLypVdMycI9ap4aukVyG0foCyfiBix4cLVb0&usqp=CAU" width="100" alt="Sequelize logo" /></a>
</span>
<span>
    <a href="https://mysql.com"><img src="https://alphacode.pythonanywhere.com/static/img_cover/kckr.png" width="200" alt="Sequelize logo" /></a>
</span>


  
## Prerequisites

Before getting started, ensure that you have the following installed on your machine:

- Node.js (version 12 or higher)
- npm (Node Package Manager)

## installation

1. clone this repository
2. Navigate to the project's directory
3. Install the dependencies
4. set up your .env by looking at .env.example
5. connet to your db
6. create your own schema (set up `DB_DATABASE_DEV` in .env and run `npx sequelize-cli db:create`)
7. migrate all table to your schema (run `npx sequelize-cli db:migrate`)

## Configuration

1.  Rename the `.env.example` file to `.env`.
2.  Open the `.env` file and provide the required configuration parameters:

    - `PORT` - The port on which the server will run.
    - `BASEPATH` - The URI for your PORT backend.
    - `BASEPATH_FE_REACT` - The URI for your PORT frontend (depend on which frontend framework you used).
    - `DB_USERNAME` - your MySQL username.
    - `DB_PASSWORD` - your MySQL password.
    - `DB_DATABASE_DEV` - your MySQL schema for development.
    - `DB_DATABASE_TEST` - your MySQL schema for test.
    - `DB_DATABASE_PRD` - your MySQL schema for production.
    - `DB_HOST` - your localhost.
    - `DB_DIALECT` - your database dialect.
    - `MY_EMAIL` - your sender "mailing" for SMTP
    - `MY_PASSWORD` - your google app password for SMTP

## Usage

1.  run your server `npm start`
2.  server will run on spesific port

## API Endpoints

The following API main endpoints are available:

    ;app.use("/api", AuthRouter);
    app.use("/api", ProfileRouter)
    app.use("/api", BlogRouter);
### AuthRouter routes
    routerAuth.get("/auth", verifyToken, AuthController.getUser); -> to get your own information
    routerAuth.post("/auth", Validation.registerValidation, Validation.runValidation, AuthController.registerUsers); -> to register account
    routerAuth.post("/auth/login", Validation.loginValidation, Validation.runValidation, AuthController.login); -> to login your registered account
    routerAuth.patch("/auth/verify/:tokenId", AuthController.verify); -> to verify your account so you have an access to create blog, like blog, etc
    routerAuth.post("/auth/forgot-password", Validation.emailValidation, Validation.runValidation, AuthController.forgotPassword ); -> to handle your forgot problem
    routerAuth.post("/auth/resend-verify",  Validation.emailValidation, Validation.runValidation,AuthController.resendTokenVerify ); -> to resend verify token if your token missing or invalid or expired
    routerAuth.patch("/auth/reset-password/:id/:token", AuthController.resetPassword); -> to renew your password if you forgot

### ProfileRouter routes
    routerProfile.post("/profile/single-uploaded",verifyToken,upload.single("file"), Validation.changeImageProfile, ProfileController.singleUpload); -> to upload your photo profile
    routerProfile.patch("/profile/change-password",verifyToken, Validation.changePasswordValidation, Validation.runValidation, ProfileController.changePassword); -> to change your password
    routerProfile.patch("/profile/change-username", verifyToken, Validation.changeUsernameValidation, Validation.runValidation, ProfileController.changeUsername); -> to change your username, you have to login again after change your username
    routerProfile.patch("/profile/change-phone",verifyToken, Validation.changePhoneValidation, Validation.runValidation, ProfileController.changePhone); -> to change your phone number
    routerProfile.patch("/profile/change-email",verifyToken, Validation.changeEmailValidation, Validation.runValidation, ProfileController.changeEmail); -> to change your email, you have to login again and verify your self again.
    routerProfile.delete("/profile/close-account", verifyToken, Validation.deleteUser, Validation.runValidation, ProfileController.closeAccount); -> to close your account
    
### BlogRouter routes
    routerBlog.post("/blog", verifyToken, isAccountVerified, upload.single("file"), Validation.createBlog,Validation.runValidation, BlogController.createBlog); -> to create blog
    routerBlog.get("/blog", BlogController.getBlogs); -> to get all blog
    routerBlog.get("/blog/user", verifyToken, BlogController.getUserBlogs); -> to get yout own blog
    routerBlog.post("/blog/like", verifyToken, isAccountVerified, BlogController.like); -> to like someone's blog
    routerBlog.get("/blog/allCategory", BlogController.allCategory); -> to get provided category list
    routerBlog.get("/blog/pag-like", verifyToken, isAccountVerified, BlogController.pagLike); -> to get blog that you liked
    routerBlog.get("/blog/pag-fav", BlogController.pagFav); -> to get top 10 blog
    routerBlog.delete("/blog/remove/:id", verifyToken, isAccountVerified, BlogController.deleteBlog); -> to delete your blog
    routerBlog.delete("/blog/pag-like/remove", verifyToken, isAccountVerified, BlogController.unLike); -> to unlike blog
    routerBlog.patch("/blog/edit-blog/:id",verifyToken,isAccountVerified,upload.single("file"),Validation.createBlog,Validation.runValidation,
    BlogController.editBlog); -> to edit your blog






    
you can check for more endpoints and more routes in source code above

## Acknowledgements

- [Express.js](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js.
- [MySQL](https://www.mysql.com/) - NoSQL database program.
- [Sequelize](https://sequelize.org/docs/v6/other-topics/migrations/) - ORM (object relational mapping) library.
- [dotenv](https://www.npmjs.com/package/dotenv) - Zero-dependency module that loads environment variables from a .env file.
- [nodemon](https://www.npmjs.com/package/nodemon) - Utility that automatically restarts the server upon file changes during development.
- [bcrypt](https://www.npmjs.com/package/bcrypt) - create hashing password for register user.
- [express-validator](https://www.express-validator.github.io) - Utility validation form request.
- [jsonwebtoken](https://www.jwt.io) - providing token for authenticate user and can use for authorization by knowing which user that loged in.
- [multer](https://www.npmjs.com/package/multer) - reading static file such image profile and image blog.
- [mysql2](https://www.npmjs.com/package/mysql2) - library for connecting to dialect database.
- [nodemailer](https://www.npmjs.com/package/nodemailer) - Utility SMPT for any verify requirement and reset password.
