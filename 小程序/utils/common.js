var EventTracer = require('eventtracer.js')


function isFn(fn) {
    return typeof fn === 'function'
}
var pageNum = 0;
var trace = {
  page: function (pagename, productCode, orgpagename, resourceid, serialid, prepayid, unionid) {
        var app = getApp();
        if (app.globalData.wxrefid == null){
          if (pagename.indexOf('wxrefid=') > 0){
            var reg = new RegExp("(^|&)wxrefid=([^&]*)(&|$)", "i");
            var wxrefid = pagename.split('?')[1].match(reg)[2];
            if (wxrefid && wxrefid != 'undefined') {
              // 针对汽车票线下渠道处理wxrefid
            //   if (pagename.split('?')[0] == 'page/bus/webapp/list/list') {
            //     wxrefid = wxrefid.slice(0, -2);
            //   }
              app.globalData.wxrefid = wxrefid;
            }
          }
        } else if (pagename.indexOf('wxrefid=') < 0){
          var wxrefid = pagename.indexOf('?') < 0 ? '?wxrefid=' : '&wxrefid='
          pagename = pagename + wxrefid + app.globalData.wxrefid;
        } else {
          var reg = new RegExp("(^|&)wxrefid=([^&]*)(&|$)", "i");
          var wxrefid = pagename.split('?')[1].match(reg)[2];
          if (wxrefid && wxrefid == 'undefined'){
            pagename = pagename.replace(wxrefid, app.globalData.wxrefid);
          }
        }
        EventTracer.page({
            pagename: pagename, //页面名称，一个完整的视图的路径
            orgpagename: orgpagename || "", //上一个页面的视图路径
            productcode: productCode, //产品码     "度假"(出境）;
            resourceid: resourceid || 0, //资源ID
            serialid: serialid || '',
            prepayid: prepayid || '',  //支付ID
            unionid: unionid || '',    //用户unionid
        }).submit()
    },
    ev: function (pagename, productCode, label, value, category, action) {
        EventTracer.event({
            pagename: pagename, //页面名称，一个完整的视图的路径
            productcode: productCode, //公共    产品码
            category: category || 'category', //类型
            action: action || 'click', //动作
            label: label, //事件名称，静态值（如推送事件：opt_label：push）
            value: value || label //事件的参数值，动态值（如同一事件包含多个维度的变量，用特殊符号分割，数据清洗时解析）
        }).submit()
    }
}

//Modal封装
function alert(content, title, showCancel, canText, confirmText, success, cancelFn, confirmColor) {
    wx.showModal({
        content: content || '',
        title: title || '温馨提示',
        showCancel: showCancel || false,
        cancelText: canText || '我知道了',
        confirmText: confirmText || '确定',
        confirmColor: confirmColor || '#3CC51F',
        success: function (res) {
            if (res.confirm) {
                isFn(success) && success(res)
            } else {
                isFn(cancelFn) && cancelFn()
            }
        }
    })
}

// loading
function loading(title) {
    wx.showToast({
        title: title || '加载中...',
        icon: 'loading',
        mask: true,
        duration: 10000
    })
}

function showToast(title, icon, duration, success) {
    wx.showToast({
        title: title || '加载中...',
        icon: icon || 'loading',
        duration: duration || 1500,
        mask: true,
        success: success || null
    })
}

//url中参数格式化
function formatOptions(options){
    var urlOptions = '';
    for(var i in options){
        urlOptions += i + "=" + options[i] + "&";
    }
    urlOptions = urlOptions.slice(0,urlOptions.length-1);
    return urlOptions;
}

//批量清除本地缓存
function clearStorage(list) {
    Array.isArray(list) && list.map(function (item) {
        wx.removeStorageSync(item)
    })
}

//倒计时转换
function changeTime(ms) {
    if (!ms) return;
    var time = new Date(ms);

    function c(a, b) {
        var x = Math.floor(ms / a % b);
        if (x < 10) {
            return '0' + x;
        }
        return '' + x;
    }

    var a = (c(3600000, 24) + c(60000, 60) + c(1000, 60)).split("");
    var day = "";
    var day2 = "";
    if (ms > 86400000 && ms < 360000000) {
        day = '' + Math.floor(ms / 86400000) * 24;
        day2 = day.split('');
        var a0 = (+a[0]) + (+day2[0]),
            a1 = (+a[1]) + (+day2[1]);
        if (a1 >= 10) {
            a0 = a0 + Math.floor(a1 / 10);
            a1 = Math.floor(a1 % 10);
        }
        return a0 + "" + a1 + ":" + a[2] + "" + a[3] + ":" + a[4] + "" + a[5]
    } else if (ms >= 360000000) {
         day = Math.floor(ms / 86400000) + "天";
        return day + "" + a[0] + "" + a[1] + ":" + a[2] + "" + a[3] + ":" + a[4] + "" + a[5]               
    } else {
        return day + "" + a[0] + "" + a[1] + ":" + a[2] + "" + a[3] + ":" + a[4] + "" + a[5]
    }
}

module.exports = {
    page: trace.page,
    ev: trace.ev,
    alert: alert,
    showToast: showToast,
    loading: loading,
    clearStorage: clearStorage,
    formatOptions: formatOptions,
    changeTime:changeTime
}