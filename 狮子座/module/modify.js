"use strict";
/**
 * Created by hqw41789 on 2017/4/27.
 *  tplContentEnv  // 预发还是生产模板，该参数的值只能是[prev|prod]
 *   url地址 : /v1/leonid/tpl/tpldata/update
 *   请求方式: POST
 *   参数 (红色为必传):
 Ø   folderId  // 模板id，ObjectId类型
 Ø   templateContent  // 生产模板内容
 Ø   commitMsg  // 提交的记录信息，commit message，默认值为fix
 *   权限说明: 携带的user Token通过即可调用此接口

 */
const config = require('./../config/config');
const httpServer = require('./../utils/getData');
let userToken = require('./../utils/md5')(config.uerToken);
const projectInfo = require('./../utils/readFile');
let dirInfo = {};
/**
 * 修改生产的模板
 * @param tplId 模板id
 * @param path 模板路径 （可以不用管 默认是html）
 */
let modifyProd = (tplId) => {
    projectInfo.readDir().then((data) => {
        dirInfo.projectName = data[0];
    }).then(async () => {
        let _data = await projectInfo.readHTML(dirInfo.projectName);
        dirInfo.templateContent = _data.toString();
    }).then(async () => {
        httpServer.post({
            userToken: userToken,
            tplId: tplId,
            templateContent: dirInfo.templateContent,
            tplContentEnv: 'prod',
            pId: config.projId
        }, config.leonidUrl + '/v1/leonid/tpl/tpldata/update').then(data => {
            modifyPrev(tplId);
        });
    });
};
/**
 * 修改预发的模板
 * 文件的话 读取的是build下面的
 * @param tplId 模板id
 * @param path 模板路径 （可以不用管 默认是html）
 */
let modifyPrev = (tplId) => {
    projectInfo.readDir().then((data) => {
        dirInfo.projectName = data[0];
    }).then(async () => {
        let _data = await projectInfo.readHTML(dirInfo.projectName);
        dirInfo.templateContent = _data.toString();
    }).then(() => {
         httpServer.put({
            userToken: userToken,
            tplId: tplId,
            templateContent: dirInfo.templateContent,
            tplContentEnv: 'prod',
            pId: config.projId
        }, config.leonidUrl + '/v1/leonid/tpl/tpldata/update').then(data=>{
            console.log(data);
         });
    });
};

module.exports = {
    modify: modifyProd
}
