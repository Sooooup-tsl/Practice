/**
 * Created by kroll on 2016/10/7.
 */
var uroot = '../../../../util/',
  scroot = '../../scripts/',
  storage = require(scroot + 'storage.js'),
  dataservice = require(scroot + 'dataservice.js'),
  api = require(uroot + 'api.js'),
  pages = require(scroot + 'pages.js'),
  utils = require(scroot + 'utils.js'),
  app = getApp(),
  common = require(uroot + 'common.js');

Page({
  data: {
    openId: '',
    sessionKey: '',
    orderId: 0,
    serialid: '',
    flight: [],
    adultNum: [0, 0], //[成人总数,已勾选成人数]
    childNum: [0, 0],
    adultPrice: 0,
    adultRefundFee: 0,
    childPrice: 0,
    childRefundFee: 0,
    orgCity: "",
    arrCity: "",

    showDetail: true,
    showChildTips: false,
    showSuccess: false
  },

  onLoad: function (options) {
    var that = this;
    var openId = wx.getStorageSync(storage.STORAGE_KEY.openId);
    var sessionKey = wx.getStorageSync(storage.STORAGE_KEY.session_key);
    var unionId = wx.getStorageSync(storage.STORAGE_KEY.unionid);

    common.showToast();

    that.setData({
      openId: openId,
      sessionKey: sessionKey,
      unionid: unionId,
      orderId: options.orderId,
      serialid: options.serialid,
      orgCity: options.orgCity,
      arrCity: options.arrCity,
      refundCallbackKey: options.refundCallbackKey
    });
    that.queryRefundFeeDetail();
  },
  /**
   * 提交退票申请
   */
  commitRefund: function () {
    // 相关人员验证  儿童不能单独乘坐
    // 退票申请   ok 切换视图  no 显示弹框
    var that = this;
    if (that.data.adultNum[1] <= 0 && that.data.childNum[1] <= 0) {
      that.showError("请选择退票乘客");
      return;
    }
    wx.showModal({
      title: '温馨提示',
      content: '请您确认本次退票申请，一经确认机票状态无法恢复。',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          that.submitRefund();
        }
      }
    });
  },
  submitRefund: function () {
    var that = this;
    var plist = "";
    var list = that.data.flight;
    for (var i = 0; i < list.length; i++) {
      if (list[i].checked) {
        plist += list[i].PassengerId + ",";
      }
    }
    if (plist) {
      plist = plist.substring(0, plist.length - 1);
    }
    dataservice.requestData(api.submitrefund, {
      data: {
        openid: that.data.openId,
        session_key: that.data.sessionKey,
        orderId: that.data.orderId,
        serialid: that.data.serialid,
        unionid: that.data.unionid,
        plist: plist
      },
      callback: function (data) {
        if (data.res && data.res.data) {
          if (data.res.data.state == "100") {
            that.setData({
              showSuccess: true
            });

            app.flightGlobalData[that.data.refundCallbackKey]();

            wx.setNavigationBarTitle({
              title: '退票成功'
            });
          } else {
            // console.log('response fail ' + data.res.data.error);

            that.showError(data.res.data.info || "退票申请失败");
          }
        } else {
          that.showError("请求失败");
        }
      }
    })
  },

  queryRefundFeeDetail: function () {
    var that = this;
    dataservice.requestData(api.queryRefundFeeDetail, {
      data: {
        serialId: that.data.serialid,
        sessionkey: that.data.sessionKey,
        openId: that.data.openId
      },
      callback: function (res) {
        // that.setData({
        //   hideLoading:true
        // });
        wx.hideToast();
        if (!res.error && res.res && res.res.data) {
          var data = res.res.data;
          if (data.State == 200 && data.Data && data.Data.RefundItems && data.Data.RefundItems.length > 0) {
            that.forEachPassType(data.Data);
          } else {
            that.showError("未获取退票乘机人信息");
          }
        } else {
          that.showError("获取退票信息失败");
        }
      }
    })
  },
  forEachPassType: function (obj) {
    var that = this;
    var list = obj.RefundItems;
    var adultNum = 0, childNum = 0;
    for (var i = 0; i < list.length; i++) {
      list[i].checked = false;
      if (list[i].PassengerType == 1) { //1成人2儿童
        if (that.data.adultPrice == 0) {
          that.setData({
            adultPrice: list[i].CustomTicketPrice,
            adultRefundFee: list[i].CustomerRefundFee
          })
        }
        adultNum++;
      } else {
        if (that.data.childPrice == 0) {
          that.setData({
            childPrice: list[i].CustomTicketPrice,
            childRefundFee: list[i].CustomerRefundFee
          })
        }

        childNum++;
      }
    }
    that.setData({
      adultNum: [adultNum, 0],
      childNum: [childNum, 0],
      flight: list
      // hideLoading:true
    })
    wx.hideToast();
  },
  passgerTap: function (e) {
    var that = this;
    var obj = e.currentTarget.dataset;
    if (obj && obj.index != undefined) {
      var flights = that.data.flight;
      var isCanCheck = false;
      if (flights[obj.index].PassengerType == 1) {
        isCanCheck = that.adultTap(flights[obj.index]);
      } else {
        isCanCheck = that.childTap(flights[obj.index]);
      }
      if (isCanCheck) {
        flights[obj.index].checked = !flights[obj.index].checked;
        that.setData({
          flight: flights,
          showChildTips: false
        })
      } else { //成人已全部勾选，则也要自动勾选儿童
        for (var i = 0; i < flights.length; i++) {
          flights[i].checked = true;
        }
        that.setData({
          flight: flights,
          showChildTips: true
        })
      }
    }
  },
  adultTap: function (obj) {
    var that = this;
    var adult = that.data.adultNum;
    var isCanCheck = false;
    if (obj.checked) {
      isCanCheck = !isCanCheck;
      adult[1] = adult[1] - 1;
      that.setData({
        adultNum: adult
      });
    }
    if (!isCanCheck) {
      if (that.data.childNum[0] == 0) {
        isCanCheck = !isCanCheck;
        adult[1] = adult[1] + 1;
        that.setData({
          adultNum: adult
        });
      } else {
        isCanCheck = that.checkPassger(obj, adult);
      }
    }
    return isCanCheck;
  },
  childTap: function (obj) {
    var that = this;
    var child = that.data.childNum;
    var isCanCheck = false;
    if (!obj.checked) {
      child[1] = child[1] + 1;
      isCanCheck = !isCanCheck;
      that.setData({
        childNum: child
      });
    }
    if (!isCanCheck) {
      isCanCheck = that.checkPassger(obj, child);
    }
    return isCanCheck;
  },
  checkPassger: function (obj, arr) { //目前按照微信逻辑只验证儿童单独乘机的情况
    var that = this;
    if (arr && arr.length == 2) {
      var differ = 0;
      if (obj.PassengerType == 1) {
        differ = arr[0] - arr[1] - 1;
        var child = that.data.childNum[0] - that.data.childNum[1];
        if (differ == 0 && child > 0) {
          that.setData({
            childNum: [that.data.childNum[0], that.data.childNum[0]],
            adultNum: [arr[0], arr[1] + 1]
          });
          return false;
        } else {
          that.setData({
            adultNum: [arr[0], arr[1] + 1]
          });
        }
      } else {
        differ = arr[0] - arr[1] + 1;
        var adult = that.data.adultNum[0] - that.data.adultNum[1];
        if (differ > 0 && adult == 0) {
          return false;
        } else {
          that.setData({
            childNum: [arr[0], arr[1] - 1]
          });
        }
      }
    }
    return true;
  },
  toggleRefundDetail: function () {
    var that = this;
    that.setData({
      showDetail: !that.data.showDetail
    })
  },

  backDetail: function () {
    wx.navigateBack();
  },
  /**
   * 错误提醒
   * @param msg
   */
  showError: function (msg) {
    wx.showModal({
      title: '温馨提示',
      content: msg,
      showCancel: false
    })
  }
});