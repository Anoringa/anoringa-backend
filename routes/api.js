var express = require("express");
var router = express.Router();

var authRouter = require("./auth");
var bookRouter = require("./book");
var userRouter = require("./user");
var postRouter = require("./post");

var app = express();

//app.use("/auth/", authRouter);
//app.use("/book/", bookRouter);
router.use("/user/", userRouter);
router.use("/post/", postRouter);




module.exports = router;