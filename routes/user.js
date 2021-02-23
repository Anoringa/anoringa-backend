var express = require("express");
const UserController = require("../controllers/UserController");
const AuthTokenController = require("../controllers/UserRegisterController");
const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");

var router = express.Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
/*
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    await firstThing();
    await AuthController.registrar();
  })
);
*/
/*
const UserModel = require("../models/UserModel");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { constants } = require("../helpers/constants");

var axios = require("axios");
var FormData = require("form-data");

function validate(token_received) {
  var data = new FormData();
  data.append("secret", "0x653D78Bfd96255a7d25d2e7BA8724901fAF9c818");
  data.append("response", token_received);

  var config = {
    method: "post",
    url: "https://hcaptcha.com/siteverify",
    headers: {},
    data: data,
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
}

router.post(
  "/register",
  // username must be an email

  body("token")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Token name must be specified."),
  // password must be at least 5 chars long
  sanitizeBody("token").escape(),

  asyncHandler(async (req, res) => {

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
        var token_received =
          "P0_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNza2V5IjoiT291ZjBhY1pWZkJ3WVlrMjIrNFBRVlM4dkVYSmVCamJ1bFR4Z2R6Q2g4bUZkL2NDSTdPUG40R2V4YVFwYUxoYWxLR1hTaEFSNUs2OFlPTzZLSGpqSlBRK0Y2aXZPUURxZW5kNEFmaTRBR21NWFBCTVlWRHlBVkUzc2RhakJUTitVQjRRRmkrM0U3OEp2VzJneGJxNWc4d04vL1ExdjFubEhtV3VtV01TdEIrVm1OQzh1aGZuUnlCRkFZYnBoeS81dE56aTFGZndFeDF5a3crZ0JBMHhIMEM3NlZpeitUZ2NrTDRLQ0hVQnd0cnBjYlN1YTBJQVdtVnVpOEVjWTZJcURUeTlMTC9aM0Y2N2dSVXJHSHlwRERHMDRDdWJQSzl5WWlxTUVoR0JwdVJNOFhvOFd3bFlwM3E4MTcxRmZYdlI4V2lLQ1EyQkFzb2RhdE8xaG1mdVY4cHNSSHBTUWJjUUVReXl3alRuQTJNOVJPd1o0U0RJSVNPSXUvazhGUlR1cHF3ZSthVHpwWG1IeEpYQ3VSenNOZEFXa25TdGoxamIyZzhEQlR2WEpad2twb2lmYWRPdzRnNnptRjVWOE5pUDgvblBDMzUzc2ZZZFpzZEs2MGFCTHZPcGJ5a2ZIVmJNb3BabTM1NDFza1dDSlNPU29LRU5hbS9kOUJMSFd5QWZTc3RySHgxVjl5bEFiclIwdjgxNlFnR2NkWWNuVS91NFk4MmFzbGpuV05rdnloYWtPSmNVbEhTWFl3RVRwbEpUOEZsYlhHZlhwdnpFNjAvY2J4eU02NzZ3bk9CQ255SGRiSm1sQkxaRmdaQnFsQTVvMXRYeHVsV1NUbHNSQUY5a1VuMENNNGwwOVNiSnl6b3I2MEgwKzc4WlgvbnI0RDZOYjZvY2ZDQit0ZHhVdzdCZU1kT0REMW9DeW5pemJpL1ZXNVZMazl4Mlhid0FNeHpNbHNjUnBrSnBDVDNjOTd0eXBxQzk5R2ptZ2N4d3F0VVNhMTFsbTlsVm1kQm5PUXIvTzhIS3h6Q09xcG9NQlgvRXp2bHVKNE8xWjFBVjUyTlNzbmxsS1BPQVNZcHNUeG4xVFQ3UmRaK1FXUUkxaXUzRmU4U2U0ODBQMzNlc2Rxb2FIN2p5YTc2TE90by9iZGFYbHN6Q0dhbENwck9weU9SMFZSTWcyM09LaDFUM2VGT3dxR3IyVEoyK1BDTnZKSU92ejB0b3M2YVdCelZqQ3EzRFJPU2kxWHdnMUNGTVVUbCtaR2k0R21nNFBhbDBVcWkwdU44b0RNQzJ4a0FUd0paNkhVb0ZQK01wRmw5TVBaei9BbVBVOWFHbHVrMEJGUnVpbk9HUW82T090eWV5MzdJZTBEc1FZdjFLRW4vdkZySUJoWHZsdjZFZlBVZDQzQkpRendVODhyQWlieVZHNjNwM0Z1YnJQazhLdU1KMWZ6bWtZUHVOeHE4KzdLWU5QWU91bm1mSXJ5RjAzRElseGp6UTIycWcxVy80L0JZVVA2c3ZpdHlmaWExQytrWVhnanltWncyVzVDcjlDMzhJWEtRMElZTFVLSFlTVklyVUpNSnJqbTFHVFgvUXM0eU5ZdSs5WWhTeGkxZTFhcmcyTU5GOGVUUmNUNGd5eDFJc3VMMjI0alRheHBOVWJVNzFrZlNYMkxzcWtnenBJZDZJaW5GSXU3aGEzWEJseVZMVFFHZFE5VCs1R0FIOHUxSDA0Tys3QXVkY1BadDlaaEVLb3JjbUVWSUdNK1ZkTFZ3L0doaGI1cktReWtpTk9JR1JocWNyR2R6TUJxbFhQbnkvTWhxTnRGeUgrRk5vVi82WTFLalVVcGd6T1paUmVQYXROQy9vYjBqdGl4M1NDN2xvSGVkWU9aYVRkRmkvQnRCTUhjS3lmdUxyaVRZblZXY2xhdG1BOE5zYXZYSFhHelN6RVNvOTFVRU82Sm40TDRBalNkS2xaeTgxVk9lU0VnZXVZS05nNXBDUU5GcEVMOU51SGc2bE9XMDU3UDF0aForTVRLMitKL04rVTVHQnBpTXpJZTgzVU5Gajd2eC82UUpyUWVGcUt1MmEwbitKSnNjSGNuTnh4VEdtWElqUTBkVFVyUkhxcWViSUVoK2dNeDBOVVNOY3J3cmtmVGRLM3Y4Y2NlYUlXeGNDRjNZa3VmMUFpRVZVV3ZrVlFEa2JhTjFqWHg2WWFVWEQzSWIzbjdLOFJrM25rMWZMbjVDZDJZYmlpVU9ScXp2Rll2MVY1NWYvMDk1ZFVnZFF1NTJ3OVVMYnhOQ1U2WjBJcVFSdW1jODgrRXFWeXZ6RTNSUHcxT2twQjhETXZnMHF5VDFwaDdRUGxBaldheW1ZYnIrbEsxd3I4TDFGUXhLVVlSRmFKNU5JUEd0ZHJzMkRDczRNWXBYUStXZjkyRGpWN1RnOG5FTE1iU0x5dlhmdFB1ZS9uQUJXOXE1NE1sM2lUeGMvZitQdUo5TGlwZlkyYVpTNytwWGkzR1N5YVg4NW1GeU4xYnRra1F5VEdzL1BPWEc5c1lhcFhjSWc1KzJOMkZqQkpqQVd0V3MwZWNDc3UyWnJnM205eTdzMEw4THQ0TzcxcHJodk5ldHdHM3dFWkp0U1B0enRGVm0zTDRkRXNTcTdQSFk4NW5lREJOLzBQZmErSFR2MnRmTjRIVmVCVGkreUx2UEFvcTNVUy9tUFdWRTVPT1NPdVkzTVo0VWI1ZXRidHFIYXExNENlajlZQVpNN1k2c0JEZEkzRithdG9OL1VKZTc3TktheU5VNkdWUWZ4eUZYZ1pscldHUEVjOHFHbHI0Nk8wN3daTkU1Qk9HejNrTm1GVzQ5VTNLSHJEOGRpdU9HUCs0Sk82bWI0YkhhdHhWQW9hdGd4a1ZTbzlmSHAvaFVTU3BFU1N5RVo4Zmg5b3RJUDE1WUl1aGloLzZhYkc1cWoxOXhSUkkvcGlucHVIUFFyY0xISEplRHR6bFNyckdEbUVLZ1dobFllTm1kZ1ByWEdmbXZ3K0R2S05pU3dRbWNqSFlxNWNmUHJqWmIxYXlISDlXTjRDa1FUcGljZ3R6QjNpNWhPU3VmQ1dOZ3VYSXplQjFLWmtnRFFPVEJJWFI1YlJSQlM4UERaMml6c0x5TVRiS0ZzdzM3V1ZJVlZmUkdGWCsrQW5OUEFwUT09SWYrUThuWlNtNTg2SjNqYSIsImV4cCI6MTYxMjIyNTgyNiwic2hhcmRfaWQiOjYyMTc2Njk3LCJwZCI6MH0.KiSRDKTAOY3TPs-T_G2PaXv07JdJXZV9pBQ1Eu1VjCI";

        var request = require("request");
        var options = {
          method: "POST",
          url: "https://hcaptcha.com/siteverify",
          headers: {},
          formData: {
            secret: "0x653D78Bfd96255a7d25d2e7BA8724901fAF9c818",
            response:
              "P0_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNza2V5IjoiQ2RQODh5eVJldnczcmlwdlcyV1AwRUVyTExveklOL3lQZWhvQUs5aEhsZll4VnNhZldVbjJpQWUrMTJGcnV4RkpPRzRzSS9OLzV5bXdBSnl6RzdyVDBhY3ZWeUtGdGxlTWZvUHJNSzNHQ25ZYzdsRlI3R2NzMUhtRTJUNHdCU0lFY2E3Q3hrQ3Naa1c5Mm5LaHIvVEFOQTJJbFpLMHkwTVdKSC9MUGZvMVQ2QnROVHhlS2dqYzZMaDNzbmNPZjJaY1BmUUZQbkY1Sk9Tem04MDF3T0VxM2ZESm41cTBJY0NOcmgzeXF0eFJER09sUVk0RC96MGdCQmNtUVZhSUhlWTZnazZkRUhMMHduSzY1QUl2MENESGhQVWxJRXBWWnB0d2hpU3RidkUzZEJoSXBxWDhhM1NWMXVFeUdVUGd1QlBWQzgyU2pubi85eDBXSElJckhhRGRNN1ZCNWJ0ejB5Nnl6TlJZQk42MjNoR1VqVHdnTEM1TVdNZnFycDFQdkpvd0ZJbjJRcGlLdjNEL08rV1B4RTRSY0xVZ25jUklKOFJWRjNkVHB4dmd5VCttZHozNGxDS2Z2UjFmOXVYTDNjekNlMVZURnArdmhVYms0ZDBablZyNmpxT0JwOTNQRUZkT3pVcHdpOHhQTXdoZjNiVkhtdWVNY3ZsUERqOFk1MmlOWGZkT29iMkdxa3VxbFUrUHlGdjM4UU5xRkMzTWNxNm1Sb21RSXBCMWtmeXp5UGNNNnJEQURhWXhldVJjbnlPa0h0LytWZ1QzcGVJUENVTkt2TEFBV1RUUGZLUVcrL1pEWDF5akNycmdWcVY5eUtBS1phTnkwR2ZqVWN3c2k0ekNQd2ZNdjFTLzNVSHpJR1VaMERjVXduTEZOcWpISHdQSVV3Q1FMY2ZLelRmVUVwdStkc2pJOWl6NmxoTGVSdzJ6ZDZJVkpGRXNmM0dtZDJ6WFFLelI3dlpZbllwVTdycFhWSnZtN1NuTGFPdzNTdWpqNUNWMFZrT21FQ3lxUmxmR01ucnhIRjAwUU1DTVk5Tm4xK1d1QS9EdlA2c1o2aHp2eG9uN3JjQUtBZUlWU0VhWmtTVzVrbG9IUnc2NmN2NFh6ZGVIZEo1VXU5WXQ3NWtJR3F1SlJMSWRVWDlhOGhlUzBkY0poeDhoRWJZQk9IamI4TEFSSk9JV1VrT1E0TXBEMmQ3Q1E9PVRtamxJaC83RHJMV0hvek0iLCJleHAiOjE2MTIyMjU2OTksInNoYXJkX2lkIjo2MjE3NjY5NywicGQiOjB9.kCV8HtYPDC5wI7oraLmMaxw0B0blfflj1abiCj1bmRw",
          },
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body);
        });

        //hash input password
        bcrypt.hash("req.body.password", 10, function (err, hash) {
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
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  })
);
*/
//router.post("/verify-otp", AuthController.verifyConfirm);
//router.post("/resend-verify-otp", AuthController.resendConfirmOtp);
/*
router.post('/registrase', asyncHandler(async (req, res, next) => {
    const bar = await AuthTokenController.register(req,res,next);
    //res.send(bar)
}))
*/

module.exports = router;
