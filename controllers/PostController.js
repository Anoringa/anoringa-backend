const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");

const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
const jwt = require("express-jwt");
mongoose.set("useFindAndModify", false);

var axios = require("axios");
var request = require("request");

var jwt_decode = require("jwt-decode");
const PostModel = require("../models/PostModel");

function uploadImageImgur(base64code) {
  console.log("base64code");
  //console.log(base64code);
  /*
  var res = base64code.split(",");
  console.log("res[1]");
  //console.log(res[1]);
  var imagetoupload = ","+res[1]
  */

  var imagetoupload = "," + base64code.substr(base64code.indexOf(",") + 1);

  console.log(imagetoupload);

  var options = {
    method: "POST",
    url: "https://api.imgur.com/3/image",
    headers: {
      Authorization: "Client-ID 174d4c0bf585d3e",
      Cookie: "IMGURSESSION=33830339e512851916f4645cc2f83c45; _nc=1",
    },
    formData: {
      image: imagetoupload,
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    return response.body.data.link;
  });
}

// Comment Schema
function CommentData(data) {
  this.id = data._id;
  this.text = data.text;
  this.user = data.user;
  this.username = data.username;

  this.inResponseTo = data.inResponseTo;
  this.createdAt = data.createdAt;
  this.updatedAt = data.updatedAt;
}

// Post Schema
function PostData(data) {
  this.id = data._id;

  this.title = data.title;
  this.description = data.description;
  this.photo = data.photo;

  this.user = data.user;

  this.comments = [];
  this.createdAt = data.createdAt;
  this.updatedAt = data.updatedAt;
}

/**
 * Book List.
 *
 * @returns {Object}
 */
exports.bookList = [
  auth,
  function (req, res) {
    try {
      Post.find(
        { user: req.user._id },
        "_id title description isbn createdAt"
      ).then((post) => {
        if (post.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            post
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];


exports.postList = [
  (req, res) => {
    try {

      Post.aggregate([
        /**/
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "comments",
            let: { postId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$post", "$$postId"] } } },
              {
                $lookup: {
                  from: "users",
                  let: { addressId: "$user" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$addressId"] } } },
                  ],
                  as: "address",
                },
              },
            ],
            as: "address",
          },
        },
        /*
        { "$lookup": {
          "from": "comments",
          "let": { "partyId": "$_id" },
          "pipeline": [
            { "$match": { "$expr": { "$eq": ["$party_id", "$$partyId"] }}},
            { "$lookup": {
              "from": "addressComment",
              "let": { "addressId": "$_id" },
              "pipeline": [
                { "$match": { "$expr": { "$eq": ["$address_id", "$$addressId"] }}}
              ],
              "as": "address"
            }}
          ],
          "as": "address"
        }},
        { "$unwind": "$address" },*/
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "post",
            as: "comments",
            /*
            pipeline: [
              { $lookup: {
                from: users,                                                         
                let: { _id: mongoose.Types.ObjectId($user) },
                as: address
              }}
            ],*/
            /*
            pipeline: [
              { $match: { $expr: { $eq: [$user, $$_id] }}},
              { $lookup: {
                from: users,                                                         
                let: { _id: $user },
                as: address
              }}
            ],
            */
            /*
            pipeline: [
              { $match: { $user: mongoose.Types.ObjectId($$_id)}},
              { $lookup: {
                from: users,
                let: { _id: $user },
                as: address
              }}
            ],
            */
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            photo: 1,
            createdAt: 1,
            updatedAt: 1,/*
            comments: 1,
            */
            numberOfColors: { $cond: { if: { $isArray: "$comments" }, then: { $size: "$comments" }, else: "NA"} },

            //"comments.post": 0,

            "user.username": 1,
            "user._id": 1,
          },
        },
      
      ]).then((post) => {
        if (post.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            post
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
exports.postListOld = [
  (req, res) => {
    try {
      Post.find(
        {},
        "_id title description photo user createdAt updatedAt"
      ).then((post) => {
        if (post.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            post
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Book Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.bookDetail = [
  auth,
  function (req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.successResponseWithData(res, "Operation success", {});
    }
    try {
      Book.findOne(
        { _id: req.params.id, user: req.user._id },
        "_id title description isbn createdAt"
      ).then((book) => {
        if (book !== null) {
          let bookData = new BookData(book);
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            bookData
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            {}
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Post Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.postDetail2 = [
  //body("id").isLength({ min: 1 }).trim().withMessage("Username must be specified.").isAlphanumeric().withMessage("Username has non-alphanumeric characters."),

  body("id")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Post ID must be specified.")
    .isAlphanumeric()
    .withMessage("Post ID must be a valid identificator.")
    .custom((value) => {
      return PostModel.findOne({ _id: value }).then((post) => {
        if (post) {
          console.log("Post ID already exist");
        } else {
          console.log("Post ID not exist");
        }
      });
    }),

  sanitizeBody("id").escape(),

  (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.successResponseWithData(res, "Operation success", {});
    }
    try {
      Post.findOne(
        { _id: req.params.id },
        "_id title description photo user createdAt updatedAt"
      ).then((post) => {
        if (post !== null) {
          let postData = new PostData(post);

          Comment.find(
            { post: req.params.id },
            "_id user username text inResponseTo createdAt updatedAt"
          ).then((comments) => {
            console.log("comments");
            console.log(comments);
            if (comments !== null) {
              //let commentData = new CommentData(comments);
              postData.comments = comments;
              return apiResponse.successResponseWithData(
                res,
                "Operation success",
                postData
              );
            }
          });
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            {}
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

var pipeline = [
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    },
  },
  {
    $project: {
      _id: 1,
      title: 2,
      description: 1,
      photo: 1,
      createdAt: 1,
      updatedAt: 1,

      "user.username": 3,
      "user._id": 4,
    },
  },
];
/**
 * Post Detail Test
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.postDetail = [
  //body("id").isLength({ min: 1 }).trim().withMessage("Username must be specified.").isAlphanumeric().withMessage("Username has non-alphanumeric characters."),

  body("id")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Post ID must be specified.")
    .isAlphanumeric()
    .withMessage("Post ID must be a valid identificator.")
    .custom((value) => {
      return PostModel.findOne({ _id: value }).then((post) => {
        if (post) {
          console.log("Post ID already exist");
        } else {
          console.log("Post ID not exist");
        }
      });
    }),

  sanitizeBody("id").escape(),

  (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("❌❌❌❌❌ no post xd");
      return apiResponse.ErrorResponse(res, "the Post doesnt exist");
    }
    try {
      Post.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(req.params.id) },
        },
        /**/
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "comments",
            let: { postId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$post", "$$postId"] } } },
              {
                $lookup: {
                  from: "users",
                  let: { addressId: "$user" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$addressId"] } } },
                  ],
                  as: "address",
                },
              },
            ],
            as: "address",
          },
        },
        /*
        { "$lookup": {
          "from": "comments",
          "let": { "partyId": "$_id" },
          "pipeline": [
            { "$match": { "$expr": { "$eq": ["$party_id", "$$partyId"] }}},
            { "$lookup": {
              "from": "addressComment",
              "let": { "addressId": "$_id" },
              "pipeline": [
                { "$match": { "$expr": { "$eq": ["$address_id", "$$addressId"] }}}
              ],
              "as": "address"
            }}
          ],
          "as": "address"
        }},
        { "$unwind": "$address" },*/
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "post",
            as: "comments",
            /*
            pipeline: [
              { $lookup: {
                from: users,                                                         
                let: { _id: mongoose.Types.ObjectId($user) },
                as: address
              }}
            ],*/
            /*
            pipeline: [
              { $match: { $expr: { $eq: [$user, $$_id] }}},
              { $lookup: {
                from: users,                                                         
                let: { _id: $user },
                as: address
              }}
            ],
            */
            /*
            pipeline: [
              { $match: { $user: mongoose.Types.ObjectId($$_id)}},
              { $lookup: {
                from: users,
                let: { _id: $user },
                as: address
              }}
            ],
            */
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            photo: 1,
            music: 1,
            createdAt: 1,
            updatedAt: 1,
            comments: 1,
            //"comments.post": 0,

            "user.username": 1,
            "user._id": 1,
          },
        },
        { $limit: 1 },
      ]).then((post) => {
        if (post.length !== 0) {
          console.log("post");
          console.log(post);
          console.log(typeof post);
          console.log(post[0]);

          /*
          COMENTS
          */
          Comment.aggregate([
            {
              $match: { post: mongoose.Types.ObjectId(req.params.id) },
            },

            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
              },
            },

            {
              $project: {
                _id: 1,
                text: 1,
                post: 1,
                createdAt: 1,
                updatedAt: 1,
                inResponseTo: 1,
                //"comments.post": 0,

                "user.username": 1,
                "user._id": 1,
              },
            },
          ]).then((comentarios) => {
            console.log("comentarios");
            console.log(comentarios);
            post[0].comentarios = comentarios;
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              post[0]
            );
          });
        } else {
          console.log("🎅❌❌❌❌❌ no post");
          return apiResponse.ErrorResponse(res, "the id is wrong");
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }

    /*
        { _id: req.params.id },
        "_id title description photo user createdAt updatedAt"
      ).then((post) => {
        if (post !== null) {
          let postData = new PostData(post);

          Comment.find(
            { post: req.params.id },
            "_id user username text inResponseTo createdAt updatedAt"
          ).then((comments) => {
            console.log("comments");
            console.log(comments);
            if (comments !== null) {
              //let commentData = new CommentData(comments);
              postData.comments = comments;
              return apiResponse.successResponseWithData(
                res,
                "Operation success",
                postData
              );
            }
          });
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            {}
          );
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
        */
  },
];
/**
 * Book store.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      photo
 *
 * @returns {Object}
 */
exports.postStore = [
  auth,
  body("title", "Title must not be empty.")
    .isLength({ min: 1 })
    .trim()
    .custom((value, { req }) => {
      return Post.findOne({ title: value }).then((post) => {
        if (post) {
          console.log("ici");
          return Promise.reject("Post already exist with this title");
        } else {
          console.log("gg");
        }
      });
    }),
  //body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),

  body("description")
    .isLength({ min: 5 })
    .trim()
    .withMessage("Description must not be empty."),
  // Sanitize fields.
  sanitizeBody("description").escape(),
  body("photo", "Photo must not be empty.").isLength({ min: 1 }).trim(),
  /*
	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Book.findOne({isbn : value,user: req.user._id}).then(book => {
			if (book) {
				return Promise.reject("Book already exist with this ISBN no.");
			}
		});
	}),*/
  sanitizeBody("*").escape(),
  (req, res) => {
    try {
      if (
        req.body.description != "" &&
        req.body.photo != "" &&
        req.body.title != ""
      ) {
        console.log("try");

        const secret = process.env.JWT_SECRET;
        /*
          jwt.verify(authorization, secret, function (err, decoded) {
            if (err) {
        console.log("test");
              console.log(err);
            } else {
        console.log("test");
              console.log(decoded);
            }
      });
      */

        /*
  
  
        if (req.headers && req.headers.authorization) {
          var authorization = req.headers.authorization.split(" ")[1],
            decoded;
  
  
          try {
            console.log("secret");
            console.log(secret);
            console.log("authorization");
            console.log(authorization);
  
            //decoded = jwt.verify(authorization, secret);
        //console.log(decoded) // bar
        var decoded = jwt_decode(authorization);
       
          } catch (err) {
            //throw error in json response with status 500.
  
            console.log("unauthorized");
            console.log(err);
            //return res.status(401).send('unauthorized');
            return apiResponse.ErrorResponse(res, err);
          }
          var userId = decoded;
          // Fetch the user by id
          console.log("decoded");
          console.log(userId);
      }
      */

        const errors = validationResult(req);
        var post = new Post({
          title: req.body.title,
          user: req.user,
          description: req.body.description,
          photo: req.body.photo,
          //isbn: req.body.isbn,
        });
        console.log("post");
        console.log(post);

        if (!errors.isEmpty()) {
          console.log("post not saved");
          return apiResponse.validationErrorWithData(
            res,
            "Validation Error.",
            errors.array()
          );
        } else {
          //Save book.
          console.log("Save post");
          post.save(function (err) {
            if (err) {
              return apiResponse.ErrorResponse(res, err);
            }
            let postData = new PostData(post);
            return apiResponse.successResponseWithData(
              res,
              "Post add Success.",
              postData
            );
          });
        }
      } else {
        console.log("post not saved");
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
    } catch (err) {
      console.log("Error post");
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.me = function (req, res) {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(" ")[1],
      decoded;
    try {
      decoded = jwt.verify(authorization, secret.secretToken);
    } catch (e) {
      return res.status(401).send("unauthorized");
    }
    console.log();
    var userId = decoded.id;
    // Fetch the user by id
    User.findOne({ _id: userId }).then(function (user) {
      // Do something with the user
      return res.send(200);
    });
  }
  return res.send(500);
};
/**
 * Book update.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.bookUpdate = [
  auth,
  body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
  body("description", "Description must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("isbn", "ISBN must not be empty")
    .isLength({ min: 1 })
    .trim()
    .custom((value, { req }) => {
      return Book.findOne({
        isbn: value,
        user: req.user._id,
        _id: { $ne: req.params.id },
      }).then((book) => {
        if (book) {
          return Promise.reject("Book already exist with this ISBN no.");
        }
      });
    }),
  sanitizeBody("*").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      var book = new Book({
        title: req.body.title,
        description: req.body.description,
        isbn: req.body.isbn,
        _id: req.params.id,
      });

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid Error.",
            "Invalid ID"
          );
        } else {
          Book.findById(req.params.id, function (err, foundBook) {
            if (foundBook === null) {
              return apiResponse.notFoundResponse(
                res,
                "Book not exists with this id"
              );
            } else {
              //Check authorized user
              if (foundBook.user.toString() !== req.user._id) {
                return apiResponse.unauthorizedResponse(
                  res,
                  "You are not authorized to do this operation."
                );
              } else {
                //update book.
                Book.findByIdAndUpdate(req.params.id, book, {}, function (err) {
                  if (err) {
                    return apiResponse.ErrorResponse(res, err);
                  } else {
                    let bookData = new BookData(book);
                    return apiResponse.successResponseWithData(
                      res,
                      "Book update Success.",
                      bookData
                    );
                  }
                });
              }
            }
          });
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Book Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.bookDelete = [
  auth,
  function (req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.validationErrorWithData(
        res,
        "Invalid Error.",
        "Invalid ID"
      );
    }
    try {
      Book.findById(req.params.id, function (err, foundBook) {
        if (foundBook === null) {
          return apiResponse.notFoundResponse(
            res,
            "Book not exists with this id"
          );
        } else {
          //Check authorized user
          if (foundBook.user.toString() !== req.user._id) {
            return apiResponse.unauthorizedResponse(
              res,
              "You are not authorized to do this operation."
            );
          } else {
            //delete book.
            Book.findByIdAndRemove(req.params.id, function (err) {
              if (err) {
                return apiResponse.ErrorResponse(res, err);
              } else {
                return apiResponse.successResponse(res, "Book delete Success.");
              }
            });
          }
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
