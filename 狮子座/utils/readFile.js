/**
 * Created by hqw41789 on 2017/4/28.
 * 读取文件和html 但好像还应该写个压缩zip的？
 */

const fs = require('fs');
const config = require('./../config/config');
let readHTML = (dir) => {
        return new Promise((resolve, reject) => {
                // 异步读取
                fs.readFile('./' + config.htmlPath + '/' + dir, function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            }
        )
    }
;

let readDir = () => {
    return new Promise((resolve, reject) => {
        fs.readdir('./' + config.htmlPath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

};

module.exports = {
    'readDir': readDir,
    'readHTML': readHTML
};