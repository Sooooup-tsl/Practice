/**
 * Created by hqw41789 on 2017/1/19.
 * http请求时的各种方法
 * 传统 Ajax 已死，Fetch 永生 （笑）
 * 普通http请求用的是request模块
 * post + form-data 用的是fetch和form-data模块
 *
 */
'use strict';

const fetch = require('node-fetch');
const FormData = require('form-data');
const request = require('request');
request.debug = true
const fs = require('fs');
const config = require('./../config/config');

/**
 * get请求
 * @param data 请求数据
 * @param url 请求链接
 * @returns {Promise}
 * @private
 */
function _get(data, url) {
    let _data = '';
    for (let i in data) {
        _data = _data + i + '=' + data[i] + '&'
    }

    var options = {
        url: url + '?' + _data.substring(0, _data.length - 1),
        method: 'GET',
        json: true
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response, data) => {
            if (!error && response.statusCode == 200) {
                resolve(data);
            } else {
                reject(new Error(error + response.statusCode));
            }
        });
    });
};

/**
 * post请求
 * @param data 请求数据
 * @param url 请求链接
 * @returns {Promise}
 * @private
 */
let _post = (data, url) => {
    return new Promise((resolve, reject) => {
        request.post({
            url: url,
            form: data
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                resolve(data);
            } else {
                console.log(error)
                reject(new Error(error + response.statusCode));
            }
        });
    })
};
/**
 * delete请求
 * @param data 请求数据
 * @param url 请求链接
 * @returns {Promise}
 * @private
 */
let _delete = (data, url) => {
    return new Promise((resolve, reject) => {
        request.del({
            url: url,
            form: data
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log(response.request)
                resolve(data);
            } else {
                console.log(error)
                reject(new Error(error + response.statusCode));
            }
        });
    })
};
/**
 * put请求
 * @param data 请求数据
 * @param url 请求链接
 * @returns {Promise}
 * @private
 */
let _put = (data, url) => {
    return new Promise((resolve, reject) => {
        request.put({
            url: url,
            form: data
        }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                resolve(data);
            } else {
                console.log(error)
                reject(new Error(error + response.statusCode));
            }
        });
    })
};

/**
 * * 上传zip文件
 * @param data  bucket_name 仓库名  key 文件路径 zipfile zip文件
 * @param url 接口链接
 * 下面两个可以在狮子座里找到
 * @param token 用户token
 * @param assetKey key
 */

let form_data = (data, url, token, assetKey) => {
    var form = new FormData();

    form.append('bucket_name', data.bucket_name);
    form.append('key', data.key);
    form.append('zipfile', data.zipfile);

    return new Promise((resolve, reject) => {
        fetch(config.leonid2Url + url, {
            method: 'POST', body: form, headers: {
                'user-token': token,
                'asset-key': assetKey,
                'Content-Type': form.getHeaders()['content-type']
            }
        }).then(function (res) {
            resolve(res.json());
        }).catch(error => {
            reject(new Error(error));
        })
    });
};

module.exports = {
    'get': _get,
    'post': _post,
    'put': _put,
    'delete': _delete,
    'uploadZip': form_data
};

