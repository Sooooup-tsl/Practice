var app = getApp();
var util = require('util.js')
function show(param) {
    var baseUrl = param.basePageUrl || '../../../';
    app.globalData.cityParam = util.extend({

    }, param, {
            callback: 'cityCallback'
        })

    app.globalData.cityCallback = function (data) {
        param.callback && param.callback(data)
    }
    if (param.goBack) {
        app.globalData.cityParam.goBack = 'citygoBack';
        app.globalData.citygoBack = function () {
            param.goBack()
        }
    }
    wx.navigateTo({
        url: baseUrl + 'pages/common/city/city'
    })
}

module.exports = {
    show: show
}
