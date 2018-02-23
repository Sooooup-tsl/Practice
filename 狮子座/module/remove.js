/**
 *
 *   Created by hqw41789 on 2017/6/22.
 *   deleteTpl
 *   逻辑删除模板 根据传入的模板id，逻辑删除此模板
 *   url地址 : /v1/leonid/tpl/tpldata
 *   请求方式: DELETE
 *   参数 (红色为必传):
 Ø   tplId  //模板的id，ObjectId类型
 *   权限说明: 携带的user Token通过即可调用此接口
 *
 *   recoveryTpl
 *   恢复删除模板 根据传入的模板id，逻辑删除此模板
 *   url地址 : /v1/leonid/tpl/tpldata/recover
 *   请求方式: POST
 *   参数 (红色为必传):
 Ø   tplId  // 模板的id，ObjectId类型
 Ø   pId  // 分组id
 *   权限说明: 携带的user Token通过即可调用此接口
 */
const config = require('./../config/config');
const httpServer = require('./../utils/getData');
let userToken = require('./../utils/md5')(config.uerToken);


let deleteTpl = (tplId) => {
    console.log(tplId)
    httpServer.delete({
        tplId: tplId,
        userToken: userToken,
        pId: config.projId
    }, config.leonidUrl + '/v1/leonid/tpl/tpldata').then(data => {
        console.log(data);
    });
};

let recoveryTpl = (tplId) => {
    httpServer.post({
        tplId: tplId,
        userToken: userToken
    }, config.leonidUrl + '/v1/leonid/tpl/tpldata').then(data => {
        console.log(data);
    });
};
module.exports = {
    deleteTpl: deleteTpl,
    recoveryTpl: recoveryTpl
}