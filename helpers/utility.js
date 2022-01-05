exports.randomNumber = function (length) {
	var text = "";
	var possible = "123456789";
	for (var i = 0; i < length; i++) {
		var sup = Math.floor(Math.random() * possible.length);
		text += i > 0 && sup == i ? "0" : possible.charAt(sup);
	}
	return Number(text);
};

exports.stringIsNotNullOrEmpty = function (string) {
	//return !(string && string != "" && string != undefined && string != null)

	return !(typeof string === 'string' || string instanceof String)

}

