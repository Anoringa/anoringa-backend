var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	username: {type: String, required: true},
	ipaddress: {type: String, required: false},
	password: {type: String, required: true},
	status: {type: Boolean, required: true, default: 1},
	isConfirmed: {type: Boolean, required: false, default: 1},
	confirmOTP: {type: Boolean, required: false, default: null}
}, {timestamps: true});

// Virtual for user's full name
UserSchema
	.virtual("location")
	.get(function () {
		return "IP Address : " + this.ipaddress;
	});

module.exports = mongoose.model("User", UserSchema);