"use strict";

/**
 * Created by hqw41789 on 2017/4/27.
 * 这大概是个md5加密用的模块
 */
const crypto = require('crypto');
const hash = crypto.createHash('md5');

module.exports = function (string) {
    hash.update(string);
    return hash.digest('hex');
}