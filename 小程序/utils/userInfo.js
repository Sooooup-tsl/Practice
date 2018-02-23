var apiUrl = require('api.js')

// var queue = {
//     //集合
//     list: [],
//     //当前执行函数
//     fn: "",
//     //是否执行中
//     execute: false,
//     //进队
//     queue: function(fn, queueType) {
//         fn.queueType = queueType;
//         this.list.push(fn); 
//         this.dequeue();
//     },
//     //出队
//     dequeue: function() {
//         if (this.execute) return;
//         this.execute = true;
//         this.fn = this.list.shift(); 
//         this.fn && this.fn();
//     },
//     //出队成功
//     dequeueSuccess: function(queueType) {
//         if (!(this.fn && this.fn.queueType == queueType)) return;
//         this.execute = false; 
//         this.dequeue();
//     }
// };

function isFn(fn) {
  return typeof fn === 'function'
}

/**
 * 获取openid
 * 
 * @param {function} fn 回调
 */
function getOpenid(fn) {
  var openId = wx.getStorageSync('tongcheng.openid')
  if (openId) {
    isFn(fn) && fn(openId);
    // queue.dequeueSuccess(1);
  } else {
    wx.login({
      success: function (res2) {
        //用code换openid，解密key在服务端
        wx.request({
          url: apiUrl.login,
          data: {
            code: res2.code
          },
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          success: function (res) {
            wx.setStorageSync('tongcheng.openid', res.data.openId)
            wx.setStorageSync('tongcheng.encryopenid', res.data.encryOpenId)
            typeof fn === 'function' && fn(res.data.openId)
          },
          complete: function () {
            // queue.dequeueSuccess(1);
          }
        })
      }
    })
  }
}

/**
 * 获取unionid
 * 
 * @param {function} fn 回调
 */
function getUnionid(fn) {
  var unionid = wx.getStorageSync('tongcheng.unionid')
  if (unionid) {
    isFn(fn) && fn(unionid);
    // queue.dequeueSuccess(2);
  } else {
    wx.login({
      success: function (res2) {
        //用code换openid，解密key在服务端
        wx.request({
          url: apiUrl.login,
          data: {
            code: res2.code
          },
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          success: function (res) {
            // console.log(res)
            var openId = res.data.openId;
            wx.setStorageSync('tongcheng.openid', openId)
            wx.setStorageSync('tongcheng.encryopenid', res.data.encryOpenId)
            if (res.data.unionId) {
              wx.setStorageSync('tongcheng.unionid', res.data.unionId);
              typeof fn === 'function' && fn(res.data.unionId)
            } else {
              getUnionidTwoWay(fn, openId);
            }
          },
          complete: function () {
            // queue.dequeueSuccess(1);
          }
        })
      }
    })
  }
}

//只静默获取unionid
function getUnionidSilent(fn) {
  var unionid = wx.getStorageSync('tongcheng.unionid')
  if (unionid) {
    isFn(fn) && fn(unionid);
  } else {
    wx.login({
      success: function (res2) {
        wx.request({
          url: apiUrl.login,
          data: {
            code: res2.code
          },
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          success: function (res) {
            var openId = res.data.openId;
            wx.setStorageSync('tongcheng.openid', openId)
            wx.setStorageSync('tongcheng.encryopenid', res.data.encryOpenId)
            if (res.data.unionId) {
              wx.setStorageSync('tongcheng.unionid', res.data.unionId);
            }
            isFn(fn) && fn(res.data.unionId || '')
          }
        })
      }
    })
  }
}

// 兼容默认授权失败情况
function getUnionidTwoWay(fn, openId) {
  wx.getUserInfo({
    success: function (res) {
      //openid和密文给后端，后端拿openid取key，解密得unionid
      getApp().globalData.userInfo = res.userInfo;
      wx.request({
        url: apiUrl.unionId,
        data: {
          encryptData: res.encryptedData,
          openId: openId,
          iv: res.iv,
          appIdMap: 2
        },
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        success: function (_res) {
          var hasUnionid = /\w/gi.test(_res.data)
          // 判断是否存在unionid
          if (hasUnionid) {
            wx.setStorageSync('tongcheng.unionid', _res.data)
          }
          typeof fn === 'function' && fn(_res.data)
        },
        complete: function () {
          // queue.dequeueSuccess(2);
        }
      })
    },
    fail: function () {
      if (isFn(fn)) {
        if (wx.openSetting) {
          wx.openSetting({
            success: function (data) {
              for (var i in data.authSetting) {
                var isUserInfo = data.authSetting[i]
              }
              if (isUserInfo) {
                getUnionid(fn);
              }
            }
          })
        } else {
          wx.showModal({
            title: '温馨提示',
            content: '授权失败，请关闭微信重新授权',
            showCancel: false
          })
        }
      }

    }
  })
}
// 获取用户头像名称
function getUserInfo(fn) {
  var that = this;
  wx.getUserInfo({
    success: function (res) {
      getApp().globalData.userInfo = res.userInfo;
      typeof fn === 'function' && fn()
    },
    fail: function () {
      if (getApp().globalData.userInfo == 0) {
        if (wx.openSetting) {
          wx.openSetting({
            success: function (data) {
              for (var i in data.authSetting) {
                var isUserInfo = data.authSetting[i]
              }
              if (isUserInfo) {
                getUserInfo(fn);
              }
            }
          })
        } else {
          wx.showModal({
            title: '温馨提示',
            content: '获取头像失败，请关闭微信重新获取',
            showCancel: false
          })
        }
      }
      getApp().globalData.userInfo = 0;
    }
  })
}

function getMemberid(param, fn) {
  getUnionid(function (unionId) {
    var openId = wx.getStorageSync('tongcheng.openid'),
      memberId = wx.getStorageSync('tongcheng.memberid');

    if (memberId) {
      isFn(fn) && fn(memberId, openId, unionId)
    } else {
      param = JSON.parse(param);
      param.unionId = unionId;
      param = JSON.stringify(param);
      wx.request({
        url: apiUrl.memberId,
        data: {
          para: param
        },
        success: function (res) {
          if (res.data.data) {
            wx.setStorageSync('tongcheng.memberid', res.data.data.MemberId);
            isFn(fn) && fn(res.data.data.MemberId, openId, unionId)
          } else {
            wx.setStorageSync('tongcheng.memberid', "");
            isFn(fn) && fn("", openId, unionId)
          }
        }
      })
    }
  })
}

module.exports = {
  getOpenid: getOpenid,
  getUnionid: getUnionid,
  getMemberid: getMemberid,
  getUserInfo: getUserInfo,
  getUnionidSilent: getUnionidSilent
}

//启用队列 如果有问题再切回来
// module.exports = {
//     getOpenid: function(){
//         queue.queue(getOpenid, 1);
//     },
//     getUnionid: function(){
//         queue.queue(getUnionid, 2);
//     }
// }