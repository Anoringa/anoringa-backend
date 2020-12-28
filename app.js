var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");
var apiResponse = require("./helpers/apiResponse");
var cors = require("cors");



// Server configuration
var SERVER_ADDRESS = process.env.SERVER_ADDRESS;
var SERVER_PORT = process.env.SERVER_PORT;

// DB connection
var MONGODB_URL = process.env.MONGODB_URL;
var mongoose = require("mongoose");
mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    //don't show the log when it is test
    if (process.env.NODE_ENV !== "test") {
      console.log("Connected to %s", MONGODB_URL);
      console.log("App is running ... \n");
      console.log("Press CTRL + C to stop the process. \n");
    }
  })
  .catch((err) => {
    console.error("App starting error:", err.message);
    process.exit(1);
  });
var db = mongoose.connection;

var app = express();

//don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//To allow cross-origin requests
app.use(cors());

//Route Prefixes
app.use("/", indexRouter);
app.use("/api/", apiRouter);

// throw 404 if URL not found
app.all("*", function (req, res) {
  return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
  if (err.name == "UnauthorizedError") {
    return apiResponse.unauthorizedResponse(res, err.message);
  }
});

/*
//const cors = require('cors');
const whitelist = ['http://localhost:4200', 'http://127.0.0.1:5500/', 'http://localhost:5500/'];
const corsOptions = {
  credentials: true, // This is important.
  origin: (origin, callback) => {
    if(whitelist.includes(origin))
      return callback(null, true)

      callback(new Error('Not allowed by CORS'));
  }
}

app.use(cors(corsOptions));
*/

//var server = app.listen(SERVER_PORT, SERVER_ADDRESS, function () {
var server = app.listen(process.env.PORT || 3000, function () {
  console.log(
    "App server up and running on %s and port %s",
    server.address().address,
    server.address().port
  );
});
//var server = app.listen(3000,'0.0.0.0',function(){console.log("App server up and running on %s and port %s",server.address().address ,server.address().port);});

const io = require("socket.io").listen(server).set("log level", 0);
/*
const io = require('socket.io')(8888, {
	cors: {
	  origin: '*',
	}
  });
*/

//io.origins('*:*') // for latest version

//var io = require('socket.io')(server);

io.on("connection", function (socket) {
  socket.emit("welcome_event", { info: "world" });

  socket.on("response_evet", function (data) {
    console.log("Data desde el cliente", data);
  });
});

// Controllers

const Post = require("./models/PostModel");
const Comment = require("./models/CommentModel");
const User = require("./models/UserModel");

io.on("connection", function (socket) {
  socket.on("comment", function (data) {
    /*
	  user
	  post
	  content
	  */

    var user = db.User.find({ username: data.username });
    console.log(user);

    var poster = db.Post.find({ title: data.posttitle });
    console.log(poster);

    var commentData = createComment({
      author: user._id,
      post: poster._id,
      text: data.content,
      createdAt: Date.now(),
    });

    console.log("\n>> Comment Created:\n", commentData);

    socket.broadcast.emit("comment", commentData);

    return callback(commentData);
  });
});
io.on("connection", function (socket) {
  socket.on("post", function (data, callback) {
    /*
		  title: String,
		  description: String,
		  by: String,
		  url: String,
	  user
	  post
	  content
	  */

    Post.findOne({ title: data.title }).then((post) => {
      if (post) {
        console.log("Post already exist with this title");
        //return Promise.reject("Post already exist with this title");
      } else {
        console.log("Post Create");

        User.findOne({ username: data.username }).then((user) => {
          if (user) {
            console.log("User exist with this username");
            console.log(user);
            if ((user.password = data.password)) {
				console.log("User password OK");
              //return Promise.reject("Post already exist with this title");
              var postData = new Post({
                title: data.title,
                description: data.description,
                user: user._id,
                photo: "String",
              });

              postData.save();

              console.log("\n>> Post Created:\n", postData);
              socket.broadcast.emit("post", postData);
              return callback(postData);
              //return postData;
            } else {
				console.log("User password wrong");

            }
          } else {
            console.log("User dont exist");

            //var user = User.findOne({ username: data.username });
            //console.log(user);
          }
        });
      }
    });
  });
});

//module.exports = app;


//app.listen(port, () => {console.log(`Example app listening at http://localhost:${port}`)})
