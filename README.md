

# # MiniBlog Backend API

This repository contains a REST API for the MiniBlog application built using Express.js. The API allows users to create, read, update, and delete blog posts. also, this API allows user to like, unlike, change photo profile, register, login, and many more. 

## Prerequisites

Before getting started, ensure that you have the following installed on your machine:

-   Node.js (version 12 or higher)
-   npm (Node Package Manager)
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
    
    -   `PORT` - The port on which the server will run.
    -   `BASEPATH` - The URI for your PORT backend.
    -  `BASEPATH_FE_REACT` - The URI for your PORT frontend (depend on which frontend framework you used).
    -  `DB_USERNAME` - your MySQL username.
    - `DB_PASSWORD` - your MySQL password.
    - `DB_DATABASE_DEV` - your MySQL schema for development.
    - `DB_DATABASE_TEST` - your MySQL schema for test.
    - `DB_DATABASE_PRD` - your MySQL schema for production.
    - `DB_HOST` - your localhost.
    - `DB_DIALECT` - your database dialect.
    - `MY_EMAIL` - your sender "mailing" for SMTP
    - `MY_PASSWORD` - your google app password for SMTP
 
 ## Usage
 1. run your server `npm start`
 2. server will run on spesific port
 ## API Endpoints

The following API main endpoints are available:

    app.use("/api", ProfileRouter);
    app.use("/api", AuthRouter);
    app.use("/api", BlogRouter);
you can check for more endpoints and more routes in source code above


## Acknowledgements

-   [Express.js](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js.
-   [MySQL](https://www.mysql.com/) - NoSQL database program.
-   [Sequelize](https://sequelize.org/docs/v6/other-topics/migrations/) - ORM (object relational mapping) library.
-   [dotenv](https://www.npmjs.com/package/dotenv) - Zero-dependency module that loads environment variables from a .env file.
-   [nodemon](https://www.npmjs.com/package/nodemon) - Utility that automatically restarts the server upon file changes during development.
-   [bcrypt](https://www.npmjs.com/package/bcrypt) - create hashing password for register user.
-  [express-validator](https://www.express-validator.github.io) - Utility validation form request.
-  [jsonwebtoken](https://www.jwt.io) - providing token for authenticate user and can use for authorization by knowing which user that loged in.
-    [multer](https://www.npmjs.com/package/multer) - reading static file such image profile and image blog.
-   [mysql2](https://www.npmjs.com/package/mysql2) - library for connecting to dialect database.
-    [nodemailer](https://www.npmjs.com/package/nodemailer) - Utility SMPT for any verify requirement and reset password.
