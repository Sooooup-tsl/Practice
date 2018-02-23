var uroot = '../../../../util/',
  scroot = '../../scripts/',
  pages = require(scroot + 'pages.js'),
  utils = require(scroot + 'utils.js'),
  api = require(uroot + 'api.js'),
  dataservice = require(scroot + 'dataservice.js'),
  storage = require(scroot + 'storage.js'),
  app = getApp();

Page({
  data: {
    flight: [],
    passgerName: "",
    serialId: ""
  },
  onLoad: function (options) {
    var openid = wx.getStorageSync(storage.STORAGE_KEY.openId);
    var sessionkey = wx.getStorageSync(storage.STORAGE_KEY.session_key);
    var unionid = wx.getStorageSync(storage.STORAGE_KEY.unionid);
    this.setData({
      serialId: options.serialId,
      openid: openid,
      sessionkey: sessionkey,
      unionid: unionid,
      orderbackKey: options.orderbackKey || ""
    });
    this.queryOrderInfo();
  },
  queryOrderInfo: function () {
    var that = this;
    if (that.data.orderbackKey) {
      app.flightGlobalData[that.data.orderbackKey]();
    }
    dataservice.requestData(api.getwxprogrampaysuccess, {
      data: {
        OrderSerialId: that.data.serialId,
        OpenId: that.data.openid,
        session_key: that.data.sessionkey,
        unionid: that.data.unionid
      },
      callback:
      function (res) {
        if (!res.error) {
          var data = res.res.data;
          if (data.Orders && data.Orders.length > 0) {
            var orders = data.Orders;
            var passgerName = "";
            for (var i = 0; i < orders.length; i++) {
              if (orders[i].Flights && orders[i].Flights.length > 0) {
                var flight = orders[i].Flights[0];
                flight.StartCity = flight.AirLineDes.split("-")[0];
                flight.EndCity = flight.AirLineDes.split("-")[1];
                var phone = orders[i].Telepone;
                orders[i].Telepone = phone && phone.length == 11 ? phone.substring(0, 3) + " " + phone.substring(3, 7) + " " + phone.substring(7, 11) : phone;
                if (i == 0 && flight.Passengers && flight.Passengers.length > 0) {
                  var passLen = flight.Passengers.length;
                  for (var j = 0; j < passLen; j++) {
                    passgerName += flight.Passengers[j].PassengerName + "、";
                    if (j >= 2) {
                      var names = passgerName.substring(0, passgerName.length - 1);
                      passgerName = passLen == 3 ? names : names + "等" + passLen + "人";
                      break;
                    }
                    if (j == flight.Passengers.length - 1) {
                      passgerName = passgerName.substring(0, passgerName.length - 1);
                    }
                  }
                }
              }
            }
            that.setData({
              flight: orders,
              passgerName: passgerName
            })
          } else {
            utils.replacePage(pages.index);
          }
        } else {
          utils.replacePage(pages.index);
        }
      }
    });
  },
  toOrderDetail: function () {
    var that = this;
    if (that.data.orderbackKey) {
      wx.navigateBack()
    } else {
      utils.replacePage(pages.orderdetails, {
        orderSerialId: that.data.serialId
      });
    }

  }
})