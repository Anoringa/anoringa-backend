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

module.exports = validate;
