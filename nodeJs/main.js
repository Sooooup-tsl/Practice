
// 阻塞代码
/*var fs = require("fs"); //文件系统读写模块 file system
var data = fs.readFileSync("input.txt");
console.log(data.toString());
console.log("程序执行完成");*/

//非阻塞代码
var fs = require("fs");
fs.readFile("input.txt", function(err,data){
	if(err) return console.log(err.stack);
	console.log(data.toString());
})
console.log("程序执行完成");