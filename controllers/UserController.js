const UserModel = require("../models/UserModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { constants } = require("../helpers/constants");

var axios = require("axios");
var FormData = require("form-data");
var querystring = require("querystring");
var generator = require('generate-password');

const he = require('he');


function validate(token_received) {
  console.log("validating");
  console.log("token_received");
  console.log(token_received);
  console.log(token_received.substr(token_received.length - 25));

  axios
    .post(
      "https://hcaptcha.com/siteverify",
      querystring.stringify({
        secret: process.env.HCAPTCHA_SECRET,
        response: token_received,
      })
    )
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      try {
        if (response.data.success == true) {
          console.log("user registered correctly");
          return true;
        } else {
          console.log("validation failed");
          console.log("user cant register");
          return false;
        }
      } catch (error) {
        console.log("json error");
        console.log("user cant register");
        return false;
      }
    })
    .catch(function (error) {
      console.log(error);
      console.log("user cant register");
      return false;
    });
  /*
  var bodyFormData = new FormData();
  bodyFormData.append("secret", process.env.HCAPTCHA_SECRET);
  bodyFormData.append("response", token_received);

  console.log("bodyFormData")
  console.log(bodyFormData)


  var config = {
    method: "post",
    url: "https://hcaptcha.com/siteverify",
    data: bodyFormData,
    headers: {'Content-Type': 'multipart/form-data' }
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      try {
        if (response.data.success == true) {
          console.log("user registered correctly");
          return true;
        } else {
          console.log("validation failed");
          console.log("user cant register");
          return false;
        }
      } catch (error) {
        console.log("json error");
        console.log("user cant register");
        return false;
      }
    })
    .catch(function (error) {
      console.log(error);
      console.log("user cant register");
      return false;
    });
  */
}

function generatePassword() {
  /*
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }*/
  //https://www.npmjs.com/package/generate-password
  var retVal = generator.generate({
    length: 10,
    numbers: true
  });
  return retVal;
}

/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.register = [
  // Validate fields.
  body("token")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Token name must be specified."),
  // Sanitize fields.
  sanitizeBody("token").escape(),
  // Process request after validation and sanitization.
  (req, res) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("token");
        console.log(req.body.token);
        console.log("Error");
        console.log(errors);

        // Display sanitized values/errors messages.
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        //console.log((req.body.token).substr((req.body.token).length - 25));
        /*
        var validated = null;
        validated = validate(req.body.token);
        console.log(validated);
        console.log(typeof validated);
    */

        var token_received = req.body.token;
        console.log(token_received);
        console.log(token_received.substr(token_received.length - 25));

        axios
          .post(
            "https://hcaptcha.com/siteverify",
            querystring.stringify({
              secret: process.env.HCAPTCHA_SECRET,
              response: token_received,
            })
          )
          .then(function (response) {
            console.log(JSON.stringify(response.data));
            try {
              if (response.data.success == true) {
                console.log("user registered correctly");
                bcrypt.hash(generatePassword(), 10, function (err, hash) {
                  // generate OTP for confirmation
                  let username_random = utility.randomNumber(4);
                  // Create User object with escaped and trimmed data

                  var ip =
                    req.headers["x-forwarded-for"] ||
                    req.connection.remoteAddress ||
                    req.ip;
                  //esta es una herramienta que nos ayudara mas tarde jijio
                  // *insert meme here*

                  console.log("IP");
                  console.log(ip);
                  //console.log(req.headers['x-forwarded-for']);
                  //console.log(req.connection.remoteAddress);
                  //console.log(req.ip);

                  var user = new UserModel({
                    username: "raul" + username_random,
                    //ipaddress: "127.0.0.1",
                    ipaddress: ip,
                    password: hash,
                    status: true,
                  });
                  console.log("user");
                  console.log(user);

                  user.save(function (err) {
                    if (err) {
                      return apiResponse.ErrorResponse(res, err);
                    }

                    let userData = {
                      _id: user._id,
                      username: user.username,
                      password: user.password,
                    };
                    //Prepare JWT token for authentication
                    const jwtPayload = userData;
                    const jwtData = {
                      expiresIn: process.env.JWT_TIMEOUT_DURATION,
                    };
                    const secret = process.env.JWT_SECRET;
                    //Generated JWT token with Payload and secret.
                    userData.token = jwt.sign(jwtPayload, secret, jwtData);
                    return apiResponse.successResponseWithData(
                      res,
                      "Registration Success.",
                      userData
                    );
                  });
                });
              } else {
                console.log("validation failed");
                console.log("user cant register");
              }
            } catch (error) {
              console.log("json error");
              console.log("user cant register");
            }
          })
          .catch(function (error) {
            console.log(error);
            console.log("user cant register");
          });

        //hash input password
        /*
        bcrypt.hash(generatePassword(), 10, function (err, hash) {
          // generate OTP for confirmation
          let username_random = utility.randomNumber(4);
          // Create User object with escaped and trimmed data

          var ip =
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress ||
            req.ip;

          console.log("IP");
          console.log(ip);
          //console.log(req.headers['x-forwarded-for']);
          //console.log(req.connection.remoteAddress);
          //console.log(req.ip);

          var user = new UserModel({
            username: "raul" + username_random,
            //ipaddress: "127.0.0.1",
            ipaddress: ip,
            password: hash,
            status: true,
          });
          console.log("user");
          console.log(user);

          user.save(function (err) {
            if (err) {
              return apiResponse.ErrorResponse(res, err);
            }

            let userData = {
              _id: user._id,
              username: user.username,
              password: user.password,
            };
            //Prepare JWT token for authentication
            const jwtPayload = userData;
            const jwtData = {
              expiresIn: process.env.JWT_TIMEOUT_DURATION,
            };
            const secret = process.env.JWT_SECRET;
            //Generated JWT token with Payload and secret.
            userData.token = jwt.sign(jwtPayload, secret, jwtData);
            return apiResponse.successResponseWithData(
              res,
              "Registration Success.",
              userData
            );
          });
        });
    */
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * User login.
 *
 * @param {string}      username
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
  body("username")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Username must be specified.")
    .isAlphanumeric()
    .withMessage("Username has non-alphanumeric characters."),

  body("password")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Password must be specified."),
  sanitizeBody("username").escape(),
  sanitizeBody("password").escape(),

  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        UserModel.findOne({ username: req.body.username }).then((user) => {
          if (user) {
            //Compare given password with db's hash.
            //console.log('user');

            //console.log(user);
            //console.log('incoming password');

            //console.log(req.body.password);
            //console.log('saved password');

            //console.log(user.password);

            bcrypt.compare(
              req.body.password,
              user.password,
              function (err, same) {
                //console.log('check password');

                //console.log(err);
                //console.log(same);
                if (same) {
                  //console.log('user.isConfirmed');

                  //console.log(user.isConfirmed);
                  //Check account confirmation.
                  if (user.isConfirmed) {
                    // Check User's account active or not.
                    if (user.status) {
                      let userData = {
                        _id: user._id,
                        username: user.username,
                        password: user.password,
                      };
                      //Prepare JWT token for authentication
                      const jwtPayload = userData;
                      const jwtData = {
                        expiresIn: process.env.JWT_TIMEOUT_DURATION,
                      };
                      const secret = process.env.JWT_SECRET;
                      //Generated JWT token with Payload and secret.
                      userData.token = jwt.sign(jwtPayload, secret, jwtData);
                      return apiResponse.successResponseWithData(
                        res,
                        "Login Success.",
                        userData
                      );
                    } else {
                      return apiResponse.unauthorizedResponse(
                        res,
                        "Account is not active. Please contact admin."
                      );
                    }
                  } else {
                    return apiResponse.unauthorizedResponse(
                      res,
                      "Account is not confirmed. Please confirm your account."
                    );
                  }
                } else {
                  return apiResponse.unauthorizedResponse(
                    res,
                    "Username or Password wrong."
                  );
                }
              }
            );
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Username or Password wrong."
            );
          }
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];



/**
 * User Modify USERNAME.
 *
 * @param {string}      username
 * @param {string}      password
 * @param {string}      data
 *
 * @returns {Object}
 */
exports.modify = [
  body("username")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Username must be specified.")
    .isAlphanumeric('es-ES', {ignore: ' '})
    .withMessage("Username has non-alphanumeric characters."),

  body("password")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Password must be specified."),


  // Validate fields.
  body("data")
    .isLength({ min: 1 })
    .trim()
    .isAlphanumeric('es-ES', {ignore: ' '})
    .withMessage("New Username needs to change name must be specified.")
    .withMessage("has non-alphanumeric characters."),
  // Sanitize fields.
  // Process request after validation and sanitization.


  sanitizeBody("username").escape(),
  sanitizeBody("password").escape(),
  sanitizeBody("data").escape(),

  (req, res) => {
    try {
      const errors = validationResult(req);
      console.log("modify username");
      console.log(errors.isEmpty());
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        console.log("step 1");
        UserModel.findOne({ username: req.body.username })
          .then((user) => {
            console.log("step 2");
            if (user) {
              console.log("User exist with this username");
              console.log(user);
              console.log("password");
              console.log(req.body.password);

              let password_str = he.decode(req.body.password);
              console.log("password2");
              console.log(password_str);




              if (user.password == password_str) {
                console.log("User password OK");
                //return Promise.reject("Post already exist with this title");

                //var userData = user.toObject();
                


                //upsertData.username = req.body.data | user.username


                console.log("user settings");
                console.log(req.body.data);
                if (req.body.data) {
                  user.username = req.body.data // | user.username

                  var userDatax = {
                    _id: user._id,
                    username: req.body.data,
                    password: user.password,
                  };
                  console.log(JSON.stringify(userDatax));


                  user.save(function (err) {
                    console.log("username update");
                    if (err) {
                      return apiResponse.ErrorResponse(res, err);
                    }
                    /*
                    return apiResponse.successResponse(
                      res,
                      "Confirm otp sent."
                    );*/
                    console.log("return new username");
                    return apiResponse.successResponseWithData(
                      res,
                      "Modify Success.",
                      userDatax
                    );
                  });
                }
                else{
                  console.log("no new username inserted");

                  return apiResponse.unauthorizedResponse(
                    res,
                    "New Username wrong."
                  );
                }


                
                /*
                var user = new UserModel({
                  username: data.username,
                });
                
                // Convert the Model instance to a simple object using Model's 'toObject' function
                // to prevent weirdness like infinite looping...
                var userData = user.toObject();
                
                // Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
                delete upsertData._id;
                
                // Do the upsert, which works like this: If no Contact document exists with 
                // _id = contact.id, then create a new doc using upsertData.
                // Otherwise, update the existing doc with upsertData
                Contact.update({_id: contact.id}, upsertData, {upsert: true}, function(err{...});
                */







                //return postData;




              } else {
                console.log("User password wrong");

                return apiResponse.unauthorizedResponse(
                  res,
                  "Username or Password wrong."
                );
              }

            } else {
              console.log("User dont exist");

              return apiResponse.unauthorizedResponse(
                res,
                "Username or Password wrong."
              );

              //var user = User.findOne({ username: data.username });
              //console.log(user);
            }
          })
          .catch((err) => { console.log('audienceService', err); })
        /*
        var userer = db.User.find({ username: data.username });
        console.log(userer);
    
        var poster = db.Post.find({ title: data.title });
        console.log(poster);
        */
      }
    } catch (err) {
      //return apiResponse.ErrorResponse(res, err);
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        "asdasd"
      );
    }
  },
];

/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = [
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("otp").isLength({ min: 1 }).trim().withMessage("OTP must be specified."),
  sanitizeBody("email").escape(),
  sanitizeBody("otp").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        var query = { email: req.body.email };
        UserModel.findOne(query).then((user) => {
          if (user) {
            //Check already confirm or not.
            if (!user.isConfirmed) {
              //Check account confirmation.
              if (user.confirmOTP == req.body.otp) {
                //Update user as confirmed
                UserModel.findOneAndUpdate(query, {
                  isConfirmed: 1,
                  confirmOTP: null,
                }).catch((err) => {
                  return apiResponse.ErrorResponse(res, err);
                });
                return apiResponse.successResponse(
                  res,
                  "Account confirmed success."
                );
              } else {
                return apiResponse.unauthorizedResponse(
                  res,
                  "Otp does not match"
                );
              }
            } else {
              return apiResponse.unauthorizedResponse(
                res,
                "Account already confirmed."
              );
            }
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Specified email not found."
            );
          }
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Resend Confirm otp.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  sanitizeBody("email").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        var query = { email: req.body.email };
        UserModel.findOne(query).then((user) => {
          if (user) {
            //Check already confirm or not.
            if (!user.isConfirmed) {
              // Generate otp
              let otp = utility.randomNumber(4);
              // Html email body
              let html =
                "<p>Please Confirm your Account.</p><p>OTP: " + otp + "</p>";
              // Send confirmation email
              mailer
                .send(
                  constants.confirmEmails.from,
                  req.body.email,
                  "Confirm Account",
                  html
                )
                .then(function () {
                  user.isConfirmed = 0;
                  user.confirmOTP = otp;
                  // Save user.
                  user.save(function (err) {
                    if (err) {
                      return apiResponse.ErrorResponse(res, err);
                    }
                    return apiResponse.successResponse(
                      res,
                      "Confirm otp sent."
                    );
                  });
                });
            } else {
              return apiResponse.unauthorizedResponse(
                res,
                "Account already confirmed."
              );
            }
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Specified email not found."
            );
          }
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
