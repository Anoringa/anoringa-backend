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
	// https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript
	//return !(string && string != "" && string != undefined && string != null)

	return !(typeof string === 'string' || string instanceof String)

}
exports.cleanHTMLTags = function (stringer) {
	// https://stackoverflow.com/questions/5002111/how-to-strip-html-tags-from-string-in-javascript
	var stringCleanedFromTags = stringer.replace(/<\/?[^>]+(>|$)/g, "");
	return stringCleanedFromTags
  }