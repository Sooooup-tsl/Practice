var fs = require("fs");
var src = "icons";
fs.readdir(src, function(err, files){
	files.forEach(function(filename, index){
		var oldPaths = src + "/" + filename;
		var newPaths = src + "/" + index + "_" + filename.replace("-","_");
		fs.rename(oldPaths, newPaths, function(err){
			if(!err) {
				console.log(filename + "替换成功" + newPaths);
			} 
		})
	})
})
