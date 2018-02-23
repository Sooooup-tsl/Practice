//导入工具包 require('node_modules里对应模块')
var gulp = require('gulp'), //本地安装gulp所用到的地方
    zip = require('gulp-zip'),
    config = require('./config/config');

gulp.task('zip', function () {
    return gulp.src('./' + config.resourcePath)
        .pipe(zip(config.zipName))
        .pipe(gulp.dest('./' + config.rootPath));
});

gulp.task('default', ['zip']); //定义默认任务


