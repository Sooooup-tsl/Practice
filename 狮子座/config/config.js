/**
 * Created by hqw41789 on 2017/6/22.
 * 配置相关 && 一些公共变量
 *
 */

const config = {
    'resourcePath': 'build/resource/**/*',
    'htmlPath': 'build/html',
    'rootPath': 'build/',
    'zipName': 'resource.zip',
    'leonidUrl': 'http://leonidapi.17usoft.com', //狮子座1的接口地址
    'leonid2Url': 'http://leonidapi.17usoft.com/libraapi2',  //狮子座2的接口地址
    'httpHeader': '{"respContentType": "text/html", "reqContentType": "无", "reqMethod": "get"}', //模板头部信息 最好不要改

    // 下面三个需要根据项目来修改
    'projId': '57ea0a4efe816100010989af', //项目的id 这个就是用车的
    'filepath': '用车前端开发组/topic/', //文件路劲 这个就是用车的
    'folderPathId': '57eb1ebbeb710abdd975db82',

    /**
     * 下面这几个在上传过程中需要修改
     */
    'folderId': '594b8c4ba1a367bed328f8b9',  // 模板id 新增之后的修改 删除操作需要依赖此id 你可以去config/data.json里看到 目前还没有更好的办法 需要修改
    'uerToken': '41789huqiwen18', //狮子座1用到的token 规则为姓名缩写+oa密码 需要进过md5加密 需要修改
    'user-token': 'd96e863784ab481d1d8b8f177679c4ad', //狮子座2用到的token 需要修改 可在狮子座里找到
    'asset-key': '6cc3c95b859bc6aec5552fbceda62f21',//狮子座2用到的key 需要修改 可在狮子座里找到
    'newTplName': 'testByNode', // 新增的模板名称 需要修改
    'bucket_name': 'groundtraffic', //bucket_name 仓库名
    'bucket_key': '/IntercityCar/' // key 文件路径
};
module.exports = config;