//import "./styles.css";
const axios = require("axios");
const { v4: uuidv4 } = require('uuid');



var ImageKit = require("imagekit");
var fs = require('fs');

var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLICKEY,
  privateKey: process.env.IMAGEKIT_PRIVATEKEY,
  urlEndpoint: process.env.IMAGEKIT_ENDPOINT
});






async function imgurUP(base64image) {
  console.log("imgurUP start");
    
    console.log("base64code");
    console.log(this.imagebase64);
    var res = this.imagebase64.split(",");
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

var datasample = {
  value: { type: null, source: null },
  content: null
};


exports.upload = function (photdata){
  // `delay` returns a promise
  if (photdata.value.source === "upload") {
    return new Promise(function (resolve, reject) {

      console.log("if imagekit");
      //console.log("upload imagekit 2");
      // Using Promises 
      console.log("imagebase64");

      //https://docs.imagekit.io/api-reference/upload-file-api/server-side-file-upload
      //https://github.com/imagekit-developer/imagekit-nodejs#file-upload

      //https://stackoverflow.com/questions/14220321/how-do-i-return-the-response-from-an-asynchronous-call
      //https://javascript.info/promise-chaining

      //https://thomas-rubattel.medium.com/strategy-pattern-in-functional-programming-38ddcc2b2d50
      //https://refactoring.guru/es/design-patterns/strategy
      imagekit.upload({
        //folder: "anoringa",
        file: photdata.content, //required
        fileName: uuidv4(), // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',   //required
        tags: ["anoringa", "alpha", "2021"]
      })
        .then(response => {
          console.log("ok");
          console.log(response);

          datasample.content = response.url
          datasample.value = "photo"
          datasample.source = "upload"
          resolve(datasample);

        }).catch(error => {
          console.log("error");
          console.log(error);
          resolve("error");
        });


      /*
      imagekit.upload({
          file : base64Img, //required
          fileName : "my_file_name.jpg",   //required
          tags: ["t-shirt","summer","men"]
      }, function(error, result) {
          if(error){
            console.log(error);
            resolve(error);
          }
          else {
            console.log(result);
            resolve(result);
          };
      });
*/

      /*
      imagekit.upload({
        file : imagebase64, //required
        fileName : "my_file_name",   //required
      }).then(response => {
        console.log(response);
        resolve(response);
      }).catch(error => {
        console.log(error);
        resolve(error);
      });


      var res = imagebase64.split(",");
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
  
      //var self = this;
      axios(config)
      .then((response) => {
        console.log(response.data);
        //console.log(response.status);
        //console.log(response.statusText);
        //console.log(response.headers);
        //console.log(response.config);
        resolve(response.status); // After 3 seconds, resolve the promise with value 42
      });
      */
      /*
      console.log("imgurUP start");
      axios.get('https://api.github.com/users/lukaneco')
      .then((response) => {
        console.log(response.data);
        //console.log(response.status);
        //console.log(response.statusText);
        //console.log(response.headers);
        //console.log(response.config);
        resolve(response.status); // After 3 seconds, resolve the promise with value 42
      });
      */
      console.log("xd3");

    });
  } else if (photdata.value.source === "url") {
    return new Promise(function (resolve, reject) {
      // Only `delay` is able to resolve or reject the promise
      console.log("if url");
      //var url = photdata.content;

      
      datasample.content = photdata.content
      datasample.value = "photo"
      datasample.source = "url"
      resolve(datasample);

      /*
      setTimeout(function () {
        resolve(url); // After 3 seconds, resolve the promise with value 42
      }, 3000);*/

    });
  } else if (photdata.value.source === "imgur") {
    return new Promise(function (resolve, reject) {
      // Only `delay` is able to resolve or reject the promise
      console.log("else if");
      var res = photdata.content.split(",");
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

      //var self = this;
      axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        //console.log(response.data.data.link);
        //console.log();
        //self.setImageUploadedUrl(response.data.data.link);
        //return response.data.data.link;
        resolve(response.data.data.link);
      })
      .catch(function (error) {
        //self.setImageUploadedUrl(false);
        console.log(error);
        resolve("error");
      });
    });
  } else {
    return new Promise(function (resolve, reject) {
      console.log("NO ONE WORKS");
      // Only `delay` is able to resolve or reject the promise

      datasample.content = "http://placekitten.com/300/300"
      datasample.value = "photo"
      datasample.source = "url"
      resolve(datasample);
      /*
      setTimeout(function () {
        resolve("http://placekitten.com/300/300"); // After 3 seconds, resolve the promise with value 42
      }, 3000);
      */
    });
  }
}
