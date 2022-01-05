

var axios = require('axios');
var utility = require("../utility.js");



exports.notifyNewPost = function (app_id,app_token,title,content,url) {
    /*
    if (app_id && app_id != "" && app_id != null) {
        console.log("ERROR - app id not provided")
        return false
    }

    if (app_token && app_token != "" && app_token != null) {
        console.log("ERROR - app token not provided")
        return false
    }
    */
    if (utility.stringIsNotNullOrEmpty(app_id)) {
        console.log("ERROR - app id not provided")
        return false
    }

    if (utility.stringIsNotNullOrEmpty(app_token)) {
        console.log("ERROR - app token not provided")
        return false
    }
    
    //var SERVER_ADDRESS = process.env.SERVER_ADDRESS;


    var data = JSON.stringify({
        "app_id": app_id,
        "included_segments": [
            "Subscribed Users"
        ],
        "data": {
            "foo": "bar"
        },
        "contents": {
            "en": content,
            "es": content
        },
        "headings": {
            "en": title,
            "es": title
        },
        "url": url
    });

    var config = {
        method: 'post',
        url: 'https://onesignal.com/api/v1/notifications',
        headers: {
            'Authorization': 'Bearer '+app_token,
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log("notification successfull");
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });

}