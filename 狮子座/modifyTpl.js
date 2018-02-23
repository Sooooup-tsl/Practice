/**
 * Created by hqw41789 on 2017/6/27.
 * 修改模板 读取build/html/下面的html
 */
const config = require('./config/config');

require('./module/modify').modify(config.folderId);

