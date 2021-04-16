var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");
var apiResponse = require("./helpers/apiResponse");
var cors = require("cors");

var postPhoto = require("./helpers/postPhotoHelper");


var axios = require("axios");
var FormData = require('form-data');


async function imgurUP(base64image) {
  console.log("imgurUP start");

  console.log("base64code");
  console.log(base64image);
  var res = base64image.split(",");
  console.log(res[1]);

  var data = new FormData();
  data.append("image", res[1]);

  var config = {
    method: "post",
    url: "https://api.imgur.com/3/image",
    headers: {
      Authorization: "Client-ID 3874349859f507b",
    },
    data: data,
  };

  var self = this;
  await axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      console.log(response.data.data.link);
      console.log();
      //self.setImageUploadedUrl(response.data.data.link);
      return response.data.data.link;
    })
    .catch(function (error) {
      //self.setImageUploadedUrl(false);
      console.log(error);
      return false;
    });
}

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

// Configurar cabeceras y cors
// '*',
/*
app.use((req, res, next) => {
  //res.header('Access-Control-Allow-Origin',  'http://test.mydomain.com');
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

*/

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
// , SERVER_ADDRESS || '0.0.0.0'
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
  socket.on("comment", function (data, callback) {
    /*
    username
    password
    post
    text
    inResponseTo
    */

    Post.findOne({ _id: data.postid })
    .then((post) => {
      if (post) {
        console.log("Post exist");
        //return Promise.reject("Post already exist with this title");

        console.log(post);
        User.findOne({ username: data.username })
        .then((user) => {
          if (user) {
            console.log("User exist with this username");
            console.log(user);
            console.log("password");
            console.log(data.password);
            if (user.password == data.password) {
              console.log("User password OK");
              //return Promise.reject("Post already exist with this title");

              console.log("comment settings");
              console.log(user._id);
              console.log(post._id);
              console.log(data.text);

              var commentData = Comment({
                _id: data._id,
                user: user._id,
                username: user.username,
                post: post._id,
                text: data.text,
                inResponseTo: data.inResponseTo,
              });

              commentData.save();
              console.log("\n>> Comment Created:\n", commentData);
              socket.broadcast.emit("comment", commentData);
              return callback(commentData);

              //return postData;
            } else {
              console.log("User password wrong");
            }
          } else {
            console.log("User dont exist");

            //var user = User.findOne({ username: data.username });
            //console.log(user);
          }
        })
        .catch((err) => { console.log('audienceService', err);})
      } else {
        console.log("Post dont exist");
      }
    })
    .catch((err) => { console.log('audienceService', err);})
    /*
    var userer = db.User.find({ username: data.username });
    console.log(userer);

    var poster = db.Post.find({ title: data.title });
    console.log(poster);
    */
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

    Post.findOne({ title: data.title })
    .then((post) => {
      if (post) {
        console.log("Post already exist with this title");
        //return Promise.reject("Post already exist with this title");
      } else {
        console.log("Post Create");
        //console.log(post);
        //User.findOne({ username: data.username }).then((user) => {
        User.findOne({ _id: data._id }).then((user) => {
          if (user) {
            console.log("User exist with this username");
            console.log(user);
            console.log("password");
            console.log(data.password);
            if (user.password == data.password) {
              console.log("User password OK");
              //return Promise.reject("Post already exist with this title");

              console.log("post settings");

              console.log(data.title);
              console.log(data.description);
              console.log(data.photo);
              if (
                data.title != "" && data.title != undefined && data.title != null &&
                data.description != "" && data.description != undefined && data.description != null 
                // && data.photo.content != "" && data.photo.content != undefined && data.photo.content != null
              ) {

                //postPhoto.upload().then()
                console.log("before");
                postPhoto.upload(data.photo)
                  .then(function (v) {
                    // `delay` returns a promise
                    console.log(v + " gg photo"); // Log the value once it is resolved

                    if (v != "error") {
                      var postData = new Post({
                        title: data.title,
                        description: data.description,
                        user: user._id,
                        photo: v,
                      });
  
                      postData.save();
  
                      console.log("\n>> Post Created:\n", postData);
                      socket.broadcast.emit("post", postData);
                      return callback(postData);
                      //return postData;
                      
                    } else {
                      console.log(v + " no casi gg"); // Log the value once it is resolved
                      console.log("some error with the upload");
                      
                    }
                  })
                  .catch(function (v) {
                    // Or do something else if it is rejected
                    console.log(v + " nogg"); // Log the value once it is resolved
                    console.log("some error with the upload");
                    // (it would not happen in this example, since `reject` is not called).
                  });
                console.log("after");



                /*
              if (data.photo.value.type == "photo" || data.photo.value.source == "upload") {
                await imgurUP(data.photo.content).then(function (battery) {
                  console.log("battery");
                  console.log(battery);
                  data.photo.content = battery;
                });
                //data.photo.content = varita;
              }

              if (data.photo.content == "" || data.photo.content == null) {
                data.photo.value.type = "photo"
                data.photo.value.source = "URL"
                data.photo.content = "http://placekitten.com/300/300";
              }
              var postData = new Post({
                title: data.title,
                description: data.description,
                user: user._id,
                photo: data.photo.content,
              });

              postData.save();

              console.log("\n>> Post Created:\n", postData);
              socket.broadcast.emit("post", postData);
              return callback(postData);
              //return postData;
              */
              } else {
                console.log("some data comes with an error");
              }
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
    })
    .catch((err) => { console.log('audienceService', err);})
  });
});

//module.exports = app;

//app.listen(port, () => {console.log(`Example app listening at http://localhost:${port}`)})
