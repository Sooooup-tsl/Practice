var uroot = '../../../../util/',
  scroot = '../../scripts/',
  pages = require(scroot + 'pages.js'),
  utils = require(scroot + 'utils.js'),
  commonUtils = require(uroot + 'util.js'),
  api = require(uroot + 'api.js'),
  dataservice = require(scroot + 'dataservice.js'),
  storage = require(scroot + 'storage.js'),
  common = require(uroot + 'common.js');
Page({
  data: {
    serialId: "",
    flight: {},
    flgihtdetail: {},
    passgerlist: [],
    deadTime: 0,
    arrTime: [],
    openid: "",
    sessionkey: "",
    // hidden:false,
    checked: false,
    // modalHidden:true,
    goWhere: 0, //0：不跳转 1：首页 2：订单列表
    // modalContent:"",
    // modalConfirm:"确认"
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    common.showToast();
    var openid = wx.getStorageSync(storage.STORAGE_KEY.openId);
    var sessionkey = wx.getStorageSync(storage.STORAGE_KEY.session_key);
    var unionid = wx.getStorageSync(storage.STORAGE_KEY.unionid);
    this.setData({
      serialId: options.serialId,
      openid: openid,
      unionid: unionid,
      sessionkey: sessionkey,
      orderbackKey: options.orderbackKey || ""
    });
    this.queryPayInfo();
  },
  onShow: function () {
    // 页面显示
    var that = this;
    if (that.data.orderbackKey) {
      common.page(pages.book3, '2002', pages.orderdetails, "", that.data.serialId);
    } else {
      common.page(pages.book3, '2002', pages.book2, "", that.data.serialId);
    }
  },
  queryPayInfo: function () {
    var that = this;
    dataservice.requestData(api.getwxprogrampayinfo, {
      data: {
        OrderSerialId: that.data.serialId,
        OpenId: that.data.openid,
        session_key: that.data.sessionkey,
        unionid: that.data.unionid,
        ProjectNum: 2
      },
      callback:
      function (res) {
        if (!res.error) {
          var data = res.res.data;
          if (data && data.PayOrderPriceDetailList && data.PayOrderPriceDetailList.length > 0 && data.PayOrderPriceDetailList[0].PayOrderPass) {
            var orders = data.PayOrderPriceDetailList;
            for (var i = 0; i < orders.length; i++) {
              //手机号码格式处理
              var phone = orders[i].LinkMobile;
              orders[i].LinkMobile = phone && phone.length == 11 ? phone.substring(0, 3) + " " + phone.substring(3, 7) + " " + phone.substring(7, 11) : phone;
              //起飞日期格式处理
              var flydate = orders[i].FlyOffDate.replace(/-/g, "/");
              flydate = new Date(Date.parse(flydate.replace(/T/g, " ")));
              var arrdate = orders[i].ArrDate.replace(/-/g, "/");
              arrdate = new Date(Date.parse(arrdate.replace(/T/g, " ")));
              orders[i].FlyOffDate = commonUtils.format(flydate, "yyyy年M月d日");
              orders[i].StartTime = commonUtils.format(flydate, "hh:mm");
              orders[i].EndTime = commonUtils.format(arrdate, "hh:mm");
              orders[i].Week = "星期" + "日一二三四五六".split("")[flydate.getDay()];
              //机场名称处理
              orders[i].StartPortName = orders[i].AirLineDes.split("—")[0];
              orders[i].EndPortName = orders[i].AirLineDes.split("—")[1];
            }
            that.setData({
              flight: data,
              flgihtdetail: orders,
              passgerlist: data.PayOrderPriceDetailList[0].PayOrderPass,
              deadTime: data.PayExpireTime
              // hidden:true
            })
            wx.hideToast()
            if (that.data.deadTime > 0) {
              that.countDown(that.data.deadTime * 1000, function (time) {
                that.setData({
                  arrTime: [parseInt(time[2] / 10), time[2] % 10, parseInt(time[3] / 10), time[3] % 10]
                });
              }, function () {
                that.setData({
                  deadTime: 0,
                });
              });
            }

          } else {
            wx.navigateBack({
              delta: 99
            })
          }
        } else {
          wx.navigateBack({
              delta: 99
            })
        }
      }
    });
  },
  wxPay: function () {
    var that = this;
    common.ev(pages.book3, '2002', "微信支付", "微信支付", 'WXAPP 国内机票', "WAbook3页面");
    if (!that.data.checked) {
      that.setData({
        checked: true
      });
      that.checkPay();
    }
  },
  //支付前验证
  checkPay: function () {
    var that = this;
    dataservice.requestData(api.checkPay, {
      data: {
        serialid: that.data.serialId,
        totalpay: that.data.flight.CustomerShouldPay,
        isWxProgram: 1
      },
      callback:
      function (res) {
        that.setData({
          checked: false
        });
        var modal = {
          isHidden: false,
          goWhere: 0,
          modalContent: "抱歉，系统繁忙，请选择其他产品。",
          modalConfirm: "确认"
        }
        if (!res.error) {
          var data = res.res.data;
          if (data) {
            if (data.IsCanPay == "T" && data.ErrorCode == 0) {
              modal.isHidden = !modal.isHidden;
              that.changePayMethod();
              that.wxPayApi();
            } else if (data.ErrorCode == '104') {
              modal.modalContent = "乘客" + data.LostTrustPassengerName + "被国家机关列入失信人名单，暂时无法预订机票，请删除后重新预订";
            } else if (data.ErrorCode == '111') {
              modal.modalContent = "您已购买过相同航班，请前往订单中心查看已有航班";
              modal.modalConfirm = "查看航班信息";
              modal.goWhere = 2;
            } else if (data.PnrRedPacketReturnResult == '1000202') {
              modal.modalContent = "很抱歉占座没有成功，送您20元机票抵用券安抚一下受伤的心，稍后到账，您的信息已保存，请再次尝试下单";
              modal.goWhere = 1;
            } else if (data.PnrRedPacketReturnResult == '1000201') {
              modal.modalContent = "很抱歉占座没有成功，您的信息已保存，请再次尝试下单";
              modal.goWhere = 1;
            } else {
              modal.goWhere = 1;
              if (data.ErrorCode == '1' || data.ErrorCode == '117') {
                modal.modalContent = "抱歉，系统繁忙，请选择其他产品。";
                modal.modalConfirm = "重新查询";
              } else if (data.ErrorCode == '25') {
                modal.modalContent = "抱歉，剩余票量不足，请选择其他航班。";
              } else if (data.ErrorCode == '101') {
                modal.modalContent = "当前产品已售完，请选择其他产品。";
                modal.modalConfirm = "重新查询";
              } else if (data.ErrorCode == '28') {
                modal.modalContent = "您预订的套餐库存不足，请选择其他酒店。";
              } else if (data.ErrorCode == '112') {
                modal.modalContent = "该产品暂不支持儿童购票，请选择其他产品。";
                modal.modalConfirm = "重新查询";
              } else if (data.ErrorCode == '113') {
                modal.modalContent = "该产品只支持单个成人下单，如多人出行，请尝试分开下单。";
                modal.modalConfirm = "重新查询";
              } else if (data.ErrorCode == '114') {
                modal.modalContent = "当前产品余票不足，请选择其他产品。";
                modal.modalConfirm = "重新查询";
              } else if (data.ErrorCode == '115') {
                modal.modalContent = "特殊产品暂不支持该证件类型旅客购买，请选择其他产品。";
                modal.modalConfirm = "重新查询";
              } else if (data.ErrorCode == '116') {
                modal.modalContent = "您已提交过相同订单，如需继续订票请选择其他航班。";
                modal.modalConfirm = "重新查询";
              } else if (data.ErrorCode == '119') {
                modal.modalContent = "当前舱位数不足，请重新提交改签。";
              } else {
                modal.modalContent = "抱歉，系统繁忙，请选择其他产品。";
                modal.modalConfirm = "重新查询";
              }
            }
          }
        }
        if (!modal.isHidden) {
          that.setData({
            goWhere: modal.goWhere //0：不跳转 1：首页 2：订单列表
          });
          wx.showModal({
            title: '温馨提示',
            content: modal.modalContent,
            showCancel: false,
            success: function () {
              if (that.data.goWhere == 1) {
                utils.replacePage(pages.index);
              } else if (that.data.goWhere == 2) {
                //待公共提供订单列表链接
                utils.replacePage(pages.orderlist, { type: 2 });
              }
            }
          });

        }
      }
    })
  },
  //请求更改支付方式
  changePayMethod: function () {
    var that = this;
    dataservice.requestData(api.changePayMethod, {
      data: {
        SerialId: that.data.serialId,
        PfwSerialId: that.data.flight.PfwSerialId,
        ProjectSerialId: that.data.flight.ProjectSerialId,
        Tcbt: 0,
        SendHotel: 0
      },
      callback:
      function (res) {
        //接口无返回，无需处理
      }
    })
  },
  //调起微信支付
  wxPayApi: function () {
    var that = this;
    var payInfo = JSON.parse(that.data.flight.Content);
    var obj = {
      timeStamp: payInfo.TimeStamp,
      nonceStr: payInfo.NonceStr,
      package: payInfo.Package,
      signType: "MD5",
      paySign: payInfo.Sign,
      success: function () {
        utils.replacePage(pages.book4, {
          serialId: that.data.serialId,
          orderbackKey: that.data.orderbackKey
        });
        //存储发送模板消息所需prepayid到页面轨迹
        common.page(pages.book3, '2002', '', "", that.data.serialId, payInfo.Package.split("=")[1], that.data.unionid);
      },
      fail: function () {

      },
      complete: function () {

      }
    };
    wx.requestPayment(obj);
  },
  // modalChange:function(){
  //   var that = this;
  //   that.setData({
  //     modalHidden:true
  //   });
  //   if(that.data.goWhere == 1){
  //     utils.replacePage(pages.index);
  //   }else if(that.data.goWhere == 2){
  //     //待公共提供订单列表链接
  //     utils.replacePage(pages.orderlist,{type:2});
  //   }
  // },
  countDown: function (times, fn, endFn) {
    var that = this;
    if (typeof times === "number") {
      times = that.calculateTime(times);
    } else if (Object.prototype.toString.apply(times) === "[object Date]") {
      var ms = times.getTime() - new Date().getTime()
      times = that.calculateTime(ms);
      setTimeout(function () {
        that.countDown(times, fn, endFn);
      }, ms % 1000);
      return;
    }
    fn(times); // 一开始先执行一次
    var intervalMac = setInterval(function () {
      var timesLen = times.length,
        scales = [24, 60, 60],
        scalesLen = scales.length;
      for (var i = timesLen; i--;) {
        if (times[i] > 0) {
          times[i] = times[i] - 1;
          break;
        }
        // 等于0，非首位的处理
        if (i !== 0) {
          times[i] = scales[scalesLen - (timesLen - i)] - 1;
        } else { // 一直到首位都为0，倒计时结束
          for (var j = 0; j < times.length; j++) {
            times[j] = 0;
          }
          clearInterval(intervalMac);
          return;
        }
      }
      fn(times);
      if (typeof endFn === "function") {
        var isEnd = true;
        for (var i = 0, len = times.length; i < len; i++) {
          if (times[i] !== 0) {
            isEnd = false;
            break;
          }
        }
        if (isEnd) {
          endFn(times);
        }
      }
    }, 1000);
  },
  calculateTime: function (time) {
    if (time < 0) {
      return [0, 0, 0, 0];
    }
    time = Math.floor(time / 1000);
    var times = [],
      scales = [86400, 3600, 60];
    for (var i = 0; i < scales.length; i++) {
      times.push(Math.floor(time / scales[i]));
      time %= scales[i];
    }
    times.push(time);
    return times;
  }
})
