var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var userRouter = require("./user");
var postRouter = require("./post");

var app = express();

//app.use("/auth/", authRouter);
//app.use("/book/", bookRouter);
app.use("/user/", userRouter);
app.use("/post/", postRouter);




module.exports = app;