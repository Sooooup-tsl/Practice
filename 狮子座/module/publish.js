/**
 * Created by hqw41789 on 2017/6/26. 这个模块有问题
 * 根据多个参数查询，返回JSON数据格式的字符串。支持模糊查询
 *   url地址 : /v1 /leonid/url/publish
 *   请求方式: GET
 *   参数 – query (红色为必传):
 Ø   urlId  // -1【查询全部，同时支持模糊查询默认拉前20个分组】| ObjectId类型【只支持单一查询】
 n   当urlId为-1时 支持模糊查询
 Ø   tag     // 字符串   比如 a,b 就是查询tag 为a, b 根据描述标签进行正则模糊查询
 Ø   status   //   发布 3 （找发布，并且下线时间比当前时间迟） | 预发布 2（找预发布，并且下线时间比当前时间迟） | 下线 1 | 自动下线4 （找发布与预发布，并且下线时间比当前时间早）| 默认查询全部
 Ø   publishName      //       正则模糊匹配查询 只要含有某一连续字符 就返回
 Ø   templateName  //       正则模糊匹配查询 被发布的模板名称
 Ø   publishUrl   //       正则模糊匹配查询 只要含有某一连续字符 就返回
 Ø   pagenum    // 默认值 1 要显示第几页
 Ø   pagesize     // 默认值20         每页显示的个数 如过要获取全部数据 则pagesize=0
 Ø   datesort     // 默认值 -1         对updateTime正序还是倒序排列
 */
const config = require('./../config/config');
const httpServer = require('./../utils/getData');
let userToken = require('./../utils/md5')(config.uerToken);
/**
 * 修改生产的模板
 * @param tplId 模板id
 * @param path 模板路径 （可以不用管 默认是html）
 */
let querryPublish = () => {
    httpServer.get({
        userToken: userToken,
        urlId: -1
    }, config.leonidUrl + '/v1/leonid/url/publish').then(data => {
        console.log(JSON.parse(data.result));
    });
};

/**
 *  PublishUrl新增
 增加一个发布url
 *   url地址 : /v1 /leonid/url/publish
 *   请求方式: PUT
 *   参数 – body (红色为必传):
 Ø   baseUrl       // 必须要在配置中心定义
 Ø   publishUrl   // 要发布的url
 Ø   publishName      // 发布的名称
 Ø   publishNodeId   // 发布节点的Id
 Ø   templateId   // 模板的id


 Ø   publishStatus     // 默认值 1 发布的状态 （发布3 预发布2 下线1）
 Ø   uniqueChildPath          // 默认值""  启用正则时填写的/r后面的url
 Ø   tag      // 默认值[ ] 要填需转成["a","b"]
 Ø   outServicePath  "// 默认值 http://www.ly.com/404.html"   不再服务期间的跳转地址
 Ø   onlineTime  // 默认值          0       uinx时间戳 秒为单位
 Ø   offlineTime   // 默认值 0       uinx时间戳 秒为单位
 */

let addPublish = () => {
    httpServer.put({
        baseUrl: '/webleonid/ycqdkf/',
        publishUrl: 'zhuanti/' + config.newTplName,
        publishName: config.newTplName,
        publishNodeId: '591d55d1a753370001930733',
        templateId: config.folderId,
        publishStatus: '2',
        userToken: userToken,
    }, config.leonidUrl + '/v1/leonid/url/publish').then(data => {
        console.log(data);
    });
};

module.exports = {
    querryPublish: querryPublish,
    addPublish: addPublish
}