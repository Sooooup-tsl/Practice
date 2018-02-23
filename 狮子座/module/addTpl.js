/**
 * Created by hqw41789 on 2017/6/22.
 *   addTpl   创建一个新的模板
 *   url地址 : /v1/leonid/tpl/tpldata/create
 *   请求方式: POST
 *   参数 (红色为必传):
 Ø   templateName  // 模板名称(模板名称必须是数字字母或下划线)
 Ø   folderId  // 该模板所在目录的folderId
 Ø   httpHeader  // string，形如{"reqMethod":"GET"}(HttpHeader数据的Key必须是[respContentType|reqContentType|reqMethod])
 Ø   templateContent  // 模板的内容字符串
 Ø   commitMsg  // 提交的记录信息，commit message，默认值为fix
 Ø    tag  // 标签，字符串数组[]string的json序列化后的字符串
 Ø   tplType  // 模板类型:1表示正常模板，2表示片段，3表示公共模块，默认是1（正常模板）
 Ø   tplDesc  // 模板的描述，如果为空，会默认使用templateName
 */
const config = require('./../config/config');
const httpServer = require('./../utils/getData');
const projectInfo = require('./../utils/readFile');
let userToken = require('./../utils/md5')(config.uerToken);
let dirInfo = {};
/**
 * 新建模板 （生产）
 * 文件的话 读取的是build下面的
 * 貌似狮子座的新建只有生产的 待研究
 * @param templateName 模板名称
 * @path path 模板路径 （可以不用管 默认是html）
 */
let addTpl = async (templateName) => {
    let promise = await projectInfo.readDir().then((data) => {
        dirInfo.projectName = data[0];
    }).then(async () => {
        let _data = await projectInfo.readHTML(dirInfo.projectName);
        return _data.toString()
    }).then(async (data) => {
        let promise = await httpServer.post({
            userToken: userToken,
            pId: config.projId,
            tplContentEnv: 'prev',
            templateContent: data,
            templateName: templateName,
            folderId: config.folderId,
            httpHeader: config.httpHeader,
            requestType: '无',
            responseType: 'text/html',
            method: 'get',
            tplDesc: '',
        }, config.leonidUrl + '/v1/leonid/tpl/tpldata/create');
        return promise
    });
    return promise;
};

module.exports = {
    addTpl: addTpl
}