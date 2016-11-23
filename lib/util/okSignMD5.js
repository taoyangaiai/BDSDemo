var crypto 		= require('crypto')


exports.format = function(str){
	var md5sum = crypto.createHash('md5');
	md5sum.update(str);
	var newStr = md5sum.digest('hex').toUpperCase();
	return newStr
}