const axios = require("axios");

var oneSignal = require("./vendors/notify_onesignal");
var utility = require("./utility");


exports.notifyNewPost = function (title, content, url) {
    console.log("lets notify the user about a new post")

    /*
    if (title && title != "" && title != null) {
        console.log("ERROR - notification title not provided")
        return false
    }

    if (content && content != "" && content != null) {
        console.log("ERROR - notification content not provided")
        return false
    }

    if (url && url != "" && url != null) {
        console.log("ERROR - notification url not provided")
        return false
    }
    */
    if (utility.stringIsNotNullOrEmpty(title)) {
        console.log("title : ",title," is : ", typeof title)
        console.log("ERROR - notification title not provided")
        return false
    }

    if (utility.stringIsNotNullOrEmpty(content)) {
        console.log("ERROR - notification content not provided")
        return false
    }

    if (utility.stringIsNotNullOrEmpty(url)) {
        console.log("ERROR - notification url not provided")
        return false
    }

    var ONESIGNAL_APPID = process.env.ONESIGNAL_APPID;
    var ONESIGNAL_SECRET = process.env.ONESIGNAL_SECRET;

    oneSignal.notifyNewPost(ONESIGNAL_APPID, ONESIGNAL_SECRET, title, content, url)
}
exports.notifyNewComment = function () {
    console.log("lets notify the user about a new comment")
}