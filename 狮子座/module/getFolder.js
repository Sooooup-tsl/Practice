/**
 * Created by hqw41789 on 2017/6/22.
 *
 *   getFolder
 *   获取模板目录 获取所有模板目录或者某个项目组的模板目录
 *   url地址 : /v1/leonid/tpl/tplfolder
 *   请求方式: GET
 *   参数 (红色为必传):
 n   获取非根目录下的子目录和模板
 Ø   folderId  // 要被获取的模板目录的id，ObjectId类型
 Ø   pId  // 分组id
 n   获取根目录
 Ø   folderId  //         值为-1
 *   权限说明: 携带的user Token通过即可调用此接口
 *
 *   getTpl
 *   获取模板 根据多个参数查询，返回JSON数据格式的字符串。支持模糊查询
 *   url地址 : /v1/leonid/tpl/tpldata
 *   请求方式: GET
 *   参数 (红色为必传):
 n   单一查询
 Ø   tplId  // 要被获取的模板的id，ObjectId类型
 Ø   pId  // 分组id
 Ø   pagesize  // 模板的commits的首页信息，默认值20
 n   模糊查询 （tplId=-1）
 Ø   tplName  // 模板名
 Ø   tplType  // 该值必须是[0,3],0表示查询所有模板，默认为0，3表示查询公共模板
 Ø   limitSize  // 一次性可以查询的模板总数，最大值为100，默认值100
 */
const config = require('./../config/config');
const httpServer = require('./../utils/getData');
let userToken = require('./../utils/md5')(config.uerToken);
let getFolder = async () => {
    let ddd = await httpServer.get({
        "userToken": userToken,
        "folderId": config.folderPathId,
        "pId": config.projId
    }, config.leonidUrl + '/v1/leonid/tpl/tplfolder');
    return ddd;
};
let getTpl = async (tplId) => {
    let ddd = await httpServer.get({
        "userToken": userToken,
        "tplId": tplId,
        "pId": config.projId
    }, config.leonidUrl + '/v1/leonid/tpl/tpldata');
    return ddd;
};

module.exports = {
    getFolder: getFolder,
    getTpl: getTpl
}