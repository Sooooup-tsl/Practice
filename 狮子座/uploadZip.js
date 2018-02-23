/**
 * Created by hqw41789 on 2017/6/27.
 * 把build下面的zip传到狮子座2.0
 * @param data  bucket_name 仓库名  key 文件路径 zipfile zip文件
 * @param url 接口链接
 * 下面两个可以在狮子座里找到
 * @param token 用户token
 * @param assetKey key
 * 压缩包名和文件名需要保持一致
 */

const config = require('./config/config');
const fs = require('fs');

require('./utils/getData').uploadZip({
    bucket_name: config.bucket_name,
    key: config.bucket_key,
    zipfile: fs.createReadStream('./' + config.rootPath + '/' + config.zipName)
}, '/leonid/v2/static/uploadzip/simple', config['user-token'], config['asset-key']).then(data => {
    console.log(data);
}).catch(e => {
    console.error(e);
});
