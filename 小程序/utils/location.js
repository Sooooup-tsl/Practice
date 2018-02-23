var app = getApp();
var util = require('util.js');
var apiUrl = require('api.js')

var fail = {
    locationFail: true
}
function location(param) {
    var locationData = getCache(param.cache)
    if (locationData) {
        param.callback(locationData)
        return;
    }
    wx.getLocation({
        type: 'wgs84',
        success: function (res) {
            getCity(res.latitude, res.longitude, param)
            // getCity(23.117055306224895, 113.2759952545166,param)
        },
        fail: function (res) {
            fails(res, param)
        }
    })
}
function fails(res, param) {
    if (Object.prototype.toString.call(res) === "[object Object]") {
        param.callback && param.callback(util.extend({}, fail, res))
    }
}
function getCity(latitude, longitude, param) {
    wx.request({
        url: apiUrl.getAddress,
        data: {
            location: latitude + ',' + longitude,
            coord_type: 1
        },
        success: function (res) {
            // console.log(res)
            if (param.callback && res.data && res.data.ZoneReturnFiled) {
                var loca = util.extend({
                    latitude: latitude,
                    longitude: longitude,
                    detail: res.data.result
                }, res.data.ZoneReturnFiled)
                setCache(loca); //设置缓存
                param.callback(loca)
            } else {
                fails(res.data, param)
            }
        },
        fail: function (res) {
            fails(res, param)
        }
    })
}
var cacheName = 'commonLocationCache';
function setCache(data) {
    storageHelper.set(cacheName, {
        times: new Date().getTime(),
        data: data
    })
}
function getCache(times) {
    var rdata = false,
        caches = storageHelper.get(cacheName),
        nowTime = new Date().getTime();
    if ((typeof times === 'number' && times * 1000 + caches.times > nowTime) || times === true) {
        rdata = caches.data;
    }
    return rdata;
}
var storageHelper = {
    set: function (key, data) {
        wx.setStorageSync(key, data)
    },
    get: function (key, data) {
        return wx.getStorageSync(key)
    },
    clear: function (key, data) {
        wx.setStorageSync(key, false)
    }
}
module.exports = {
    location: location
}
