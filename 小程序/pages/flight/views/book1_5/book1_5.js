var app = getApp(),
  uroot = '../../../../util/',
  scroot = '../../scripts/',
  pages = require(scroot+"pages.js"),
  utils = require(scroot+"utils.js"),
  commonUtils = require(uroot+'util.js'),
  api = require(uroot+"api.js"),
  userInfo = require(uroot+"userInfo.js"),
  storage = require(scroot+"storage.js"),
  common = require(uroot+'common.js');

Page({
  data: {
    showDialog: false,
    cabinType: 1,
    flightData: {},
    cabinTabData: {},
    productInfo: {
      priceDes: undefined,
      tgq: undefined,
      specialMark: ""
    },
    toastHidden: true,
    toastText: '请稍候再试'
  },

  flightInfo: {},
  cabinKey: '',
  ocity: '',
  acity: '',
  tempOrderCreating: false,
  fromBook1: false,
  /**
   * 加载完成
   */
  onLoad: function (options) {
    var that = this;
    this.ocity = options.ocity;
    this.acity = options.acity;
    this.fromBook1 = true;
    wx.getStorage({
      key: storage.STORAGE_KEY.flight_selected,
      success: function (res) {
        that.flightInfo = res.data;

        var flyDate = that.flightInfo.flyOffTime;
        flyDate = utils.parseDate(flyDate);
        flyDate = commonUtils.format(flyDate, 'yyyy.MM.dd ww');
        that.flightInfo.flyDate = flyDate;
        var fRateInt = that.flightInfo.fRate.split('.')[0];
        that.flightInfo.fRateInt = fRateInt;

        var cabins = that.flightInfo.cabins;
        var cabinData = that.handleCabinProduct(cabins);//组装舱位数据
        var cabinSortData = that.sortCabinProduct(cabinData);//按舱位产品类型排序
        var cabinTabData = that.initTabCabin(cabinSortData);//按照舱位的选项卡，组合数据
        that.setData({
          flightData: that.flightInfo,
          cabinTabData: cabinTabData,
          cabinType: cabinTabData.specialTab.length > 0 ? 1 : 2
        });
      }
    });
  },

  onReady: function () {
    wx.setNavigationBarTitle({
      title: this.ocity + '→' + this.acity
    });
  },

  onShow: function () {
    wx.setNavigationBarTitle({
      title: this.ocity + '→' + this.acity
    });
    common.page(pages.book1_5, '2002', this.fromBook1 ? pages.book1 : '');
  },

  onHide: function () {

  },

  /**
   * 组装舱位数据
   * @param cabins
   */
  handleCabinProduct: function (cabins) {
    var that = this;
    var oCabin = {};
    oCabin.specialSale = [];  // 经济舱可卖
    oCabin.businessSale = []; // 头等舱/商务舱 可卖
    oCabin.saleOut = false;
    cabins.forEach(function (cabin, index) {
      cabin.oriIndex = index;
      cabin.showName = cabin.fProductName;
      //含有酒店券的名字处理
      if (cabin.fProductName.indexOf('(') > -1) {
        cabin.showName = cabin.fProductName.substr(0, cabin.fProductName.indexOf('('));
      } else {
        cabin.showName = cabin.fProductName;
      }
      cabin.flightCompanyShort = that.flightInfo.airCompanyCode;//航司简称
      //区分两个不同的选项卡
      if (cabin.BaseRoomType == 1) { //经济舱
        oCabin.specialSale.push(cabin);
      } else {//头等舱和商务舱
        oCabin.businessSale.push(cabin);
      }
    });
    if (oCabin.businessSale.length == 0 && oCabin.specialSale.length == 0) {//舱位已售完
      oCabin.saleOut = true;
    }
    return oCabin;
  },

  /**
   * 新book1.5舱位产品排序
   */
  sortCabinProduct: function (cabinData) {
    //经济舱赋予标识，以便后面排序
    cabinData.specialSale.forEach(function (item) {
      if (item.showName.indexOf("旗舰") > -1) {
        item.sortNum = 1;
      } else if (item.showName == "同程自营") {
        item.sortNum = 2;
      } else if (item.showName == "优质认证商户") {
        item.sortNum = 3;
      } else {
        item.sortNum = 4;
      }
    });

    //经济舱排序
    cabinData.specialSale.sort(function (a, b) {
      return a.sortNum > b.sortNum ? 1 : -1;
    });
    //商务舱头等舱赋予标识，以便后面排序
    cabinData.businessSale.forEach(function (item) {
      if (item.showName.indexOf("旗舰") > -1) {
        item.sortNum = 1;
      } else if (item.showName == "同程自营") {
        item.sortNum = 2;
      } else if (item.showName == "优质认证商户") {
        item.sortNum = 3;
      } else {
        item.sortNum = 4;
      }
    });
    //商务舱头等舱排序
    cabinData.businessSale.sort(function (a, b) {
      return a.sortNum - b.sortNum;
    });
    return cabinData;
  },

  /**
   * book1.5根据舱位选项卡组装数据
   */
  initTabCabin: function (cabinSortData) {
    var cabinTabData = {};
    cabinTabData.specialTab = [];//经济舱Tab
    cabinTabData.businessTab = [];//商务舱/头等舱Tab
    cabinTabData.specialSale = cabinSortData.specialSale;
    cabinTabData.businessSale = cabinSortData.businessSale;
    cabinTabData.saleOut = cabinSortData.saleOut;
    cabinTabData.specialTab = cabinTabData.specialSale;
    cabinTabData.businessTab = cabinTabData.businessSale;
    return cabinTabData;
  },

  /**
   * 修改仓位类型
   * @param e
   */
  changeCabinType: function (e) {
    var type = e.currentTarget.dataset.type;
    this.setData({
      cabinType: type
    });
    common.ev(pages.book1_5, '2002', type == 1 ? '经济舱tab' : '头等舱/商务舱tab', type == 1 ? '经济舱tab' : '头等舱/商务舱tab', 'WXAPP 国内机票', 'WAbook1.5页面');
  },
  /**
   * 显示弹框
   * @param e
   */
  showProductInfo: function (e) {
    var cabinIndex = e.currentTarget.dataset.index;
    var that = this;
    // this.setData({
    //   loading: true
    // });
    common.showToast();
    var info = utils.clone(this.flightInfo);
    var cabinInfo = info.cabins[cabinIndex];
    info.cabins = [cabinInfo];
    wx.request({
      url: api.getwxprogramproductinfo,
      method: 'POST',
      data: { cabinInfo: JSON.stringify(info) },
      success: function (res) {
        var data = res.data;
        if (data.state != 100) return;
        that.processProductInfo(data);
        that.setData({
          showDialog: true
        });
        wx.hideToast();
        common.ev(pages.book1_5, '2002', '退改签规定', '退改签规定', 'WXAPP 国内机票', 'WAbook1.5页面');
      },
      complete: function () {
        wx.hideToast();
      }
    });

  },
  /**
   * 隐藏弹框
   */
  hideDialogLayer: function () {
    this.setData({
      showDialog: false
    })
  },
  /**
   * 创建临时单
   * @param e
   */
  createTempOrder: function (e) {

    var that = this;
    var cabinIndex = e.currentTarget.dataset.index;
    var flightData = this.processSubmitParams(parseInt(cabinIndex, 10));

    var traceData = [flightData.cabins[0].fProductName, e.touches[0].clientX, flightData.cabins[0].BaseRoomType];
    common.ev(pages.book1_5, '2002', '预订产品', traceData.join('^'), 'WXAPP 国内机票', 'WAbook1.5页面');

    common.showToast();
    userInfo.getUnionid(function(){
      if (that.tempOrderCreating) return;

      that.tempOrderCreating = true;

      wx.request({
        url: api.book2detail,
        method: 'POST',
        data: {
          flightdata: JSON.stringify(flightData),
          datakey: that.cabinKey,
          openid: wx.getStorageSync(storage.STORAGE_KEY.openId),
          session_key: wx.getStorageSync(storage.STORAGE_KEY.session_key),
          unionid: wx.getStorageSync(storage.STORAGE_KEY.unionid)
        },
        success: function (res) {
          var data = res.data;
          if (data && data.ErrorCode == 100) {
            // 创建临时单成功
            wx.setStorageSync(storage.STORAGE_KEY.temporder_info, data);
            wx.setStorageSync(storage.STORAGE_KEY.flight_selected, flightData);
            that.showBook2();
          } else {
            that.setData({
              toastHidden: false
            });
          }
        },
        fail: function () {
          that.setData({
            toastHidden: false
          });
        },
        complete: function () {
          that.tempOrderCreating = false;
          wx.hideToast();
        }
      })
    })
  },
  /**
   * 组装提交创建临时单接口口参数
   */
  processSubmitParams: function (cabinIndex) {
    var cabinInfo = utils.clone(this.flightInfo.cabins[cabinIndex]);
    this.cabinKey = this.flightInfo.cabins[cabinIndex].encryptstring;
    // cabinInfo.encryptstring = '';
    var data = utils.clone(this.flightInfo);
    delete data.flyDate;
    delete data.fRateInt;
    delete cabinInfo.oriIndex;
    delete cabinInfo.showName;
    delete cabinInfo.flightCompanyShort;
    delete cabinInfo.sortNum;
    data.cabins = [cabinInfo];
    data.cabinsMD5Key = [];
    return data;
  },
  /**
   * 组装产品说明信息
   * @param data
   */
  processProductInfo: function (data) {
    var tgqRule = JSON.parse(data.tgq);
    var titles = tgqRule.Rule[0];
    var rules = tgqRule.Rule.splice(1);
    var tgqInfo = {
      titles: titles,
      rules: rules
    };
    this.setData({
      productInfo: {
        priceDes: JSON.parse(data.priceDes),
        tgq: tgqInfo,
        specialMark: data.specialMark
      }
    });
  },
  /**
   * 显示book2
   */
  showBook2: function () {
    wx.redirectTo({
      url: pages.book2 + "?wxrefid=" + (app.globalData.wxrefid || 0)
    })
  },
  /**
   * 提示回调
   */
  toastChange: function () {
    this.setData({
      toastHidden: true
    });
  }
});