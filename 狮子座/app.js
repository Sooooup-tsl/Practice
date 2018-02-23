/**
 * Created by hqw41789 on 2017/6/22.
 * 这是个入口
 */
const config = require('./config/config');
const fs = require('fs');
const path = require('path');

/**
 * 这个方法用来把项目下所有的模板信息先捞出来 毕竟模板id不好搞 待优化
 * 所有的信息存在config/data.json里
 *
 */
let init = () => {
    require('./module/getFolder').getFolder().then(data => {
        if (data.result) {
            require('./module/writeJson').writeFile(data);
        } else {
            console.error(data.msg)
        }
    });
};
/**
 * 新增模板  读取build/html/下面的html
 */
let addTpl = () => {
    /**
     * addTpl 添加模板模块
     * addTpl.addTpl (模板名称)
     */
    require('./module/addTpl').addTpl(config.newTplName).then(data => {
        console.log(data);
    });
};
/**
 * 修改模板 读取build/html/下面的html
 */
let modifyTpl = () => {
    require('./module/modify').modify(config.folderId);
}

/**
 * 把build下面的zip传到狮子座2.0
 * @param data  bucket_name 仓库名  key 文件路径 zipfile zip文件
 * @param url 接口链接
 * 下面两个可以在狮子座里找到
 * @param token 用户token
 * @param assetKey key
 * 压缩包名和文件名需要保持一致
 */
let uploadZip = () => {
    require('./utils/getData').uploadZip({
        bucket_name: 'groundtraffic',
        key: '/IntercityCar/',
        zipfile: fs.createReadStream('./build/js.zip')
    }, '/leonid/v2/static/uploadzip/simple', config['user-token'], config['asset-key']);
}

/**
 * 没用QAQ
 */
let deleteTpl = () => {
    require('./module/remove').deleteTpl(config.folderId);
}
/**
 * 发布没有权限QAQ
 * 这玩意儿api有问题还是要用手动发布（笑）
 */
let publish = () => {
    require('./module/publish').addPublish();
};

init();
// addTpl();
// modifyTpl();
//前面三个是针对狮子座1.0的 上传是针对狮子座2.0
module.exports = {
    init: init,
    addTpl: addTpl,
    modifyTpl: modifyTpl,
    uploadZip: uploadZip
};