/**
 * Created by hqw41789 on 2017/6/27.
 *  新增模板  读取build/html/下面的html
 * addTpl 添加模板模块
 * addTpl.addTpl (模板名称)
 */

const config = require('./config/config');
require('./module/addTpl').addTpl(config.newTplName, '/html').then(data => {
    console.log(data);
});