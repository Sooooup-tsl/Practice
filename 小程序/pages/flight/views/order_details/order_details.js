/**
 * Created by zff on 2016/10/04.
 */
var uroot = '../../../../util/',
  scroot = '../../scripts/',
  Pages = require(scroot+'pages.js'),
  dataService = require("../../scripts/dataservice.js"),
  api = require(uroot + 'api.js'),
  utils = require(scroot+"utils.js"),
  storage = require(scroot+"storage.js"),
  common = require(uroot + "common.js"),
  app = getApp(),
  commonUtils = require(uroot + 'util.js');

Page({
  data: {
    passengerObj: [],
    orderSerialId: '',
    // modalHidden: true,
    // modal2Hidden: true,
    traceProject: 'WXAPP 国内机票',
    tracePage: 'WA订单详情页',
    isRefundSuccess: false,
    showTraceDialog: false,
    showServiceIntro: false,
    showVipRoom: false
  },

  /**
   * 加载完成
   * @param options
   */
  onLoad: function (options) {

    // this.setData({
    //   hideLoading: false,
    //   loadContent: '订单详情加载中'
    // });
    common.showToast('订单详情加载中');
    var orderSerialId = options.orderSerialId;
    this.searchFlightDetails(orderSerialId);
    this.setData({
      orderSerialId: orderSerialId
    });
    wx.setNavigationBarTitle({
        title: '飞机票订单详情'
    });
  },

  onShow: function () {
    common.page(Pages.orderdetails, '2002');
    //退票页面返回判断是否退票成功
    if (this.data.isRefundSuccess) {
      this.searchFlightDetails(this.data.orderSerialId);
    }
  },
  /*onHide: function() {
   console.log('===onHide===');
   },*/
  //跳转支付页面
  goToPay: function () {
    var that = this,
      orderSerialId = that.data.orderSerialId;

    //统计点击次数
    common.ev(Pages.orderdetails, '2002', "支付订单", "去支付", that.data.traceProject, that.data.tracePage);

    app.flightGlobalData["orderbackKey"] = function () {
      that.searchFlightDetails(orderSerialId);
    };
    utils.showPage(Pages.book3, {
      serialId: orderSerialId,
      orderbackKey: "orderbackKey"
    });
  },
  //显示取消订单弹框
  showCancelOrderDialog: function () {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '确定要取消该订单吗？',
      showCancel: true,
      cancelText: '点错了',
      success: function (res) {
        if (res.confirm) {
          that.cancelOrder();
        }
      }
    })
  },
  //取消订单
  cancelOrder: function () {
    var that = this;

    //统计点击次数
    common.ev(Pages.orderdetails, '2002', "取消订单", "取消订单", that.data.traceProject, that.data.tracePage);

    common.showToast('订单正在取消...');
    var params = {
      data: {
        'OrderId': that.data.order.orderId,
        'sessionkey': wx.getStorageSync(storage.STORAGE_KEY.session_key),
        'openId': wx.getStorageSync(storage.STORAGE_KEY.openId),
        'MemberId': that.data.order.memberId,
        'unionid': wx.getStorageSync(storage.STORAGE_KEY.unionid)
      },
      callback: function (data) {

        //console.log("取消订单： " + JSON.stringify(data));
        // that.setData({
        //   modal2Hidden: true
        // });
        if (data.error) {
          //TODO 显示错误信息
          that.showTip("取消失败");
          return;
        }

        if (data.res.data.State == '200') {
          that.showTip('取消成功');
          that.searchFlightDetails(that.data.orderSerialId);
        } else {
          that.showTip('取消失败');
        }

      }
    };
    //取消订单接口数据
    dataService.requestData(api.canceldetails, params);
  },
  //点错了
  // hiddenCancelOrder: function(){
  //   this.setData({
  //     modal2Hidden: true
  //   });
  // },
  //退票
  goToReturn: function () {
    var that = this;
    //统计点击次数
    common.ev(Pages.orderdetails, '2002', "退票按钮", "退票", that.data.traceProject, that.data.tracePage);
    if (that.data.order.channelTag != "502"){
      that.showTip('小程序暂时不支持对该订单进行相关操作，请进入"微信-钱包-火车票机票"查看。');
      return;
    }

    var params = {
      data: {
        'QueryType': 9,
        "QueryChangeVerify": "RefundVerify",
        'SerialId': that.data.orderSerialId,
        'Session_Key': wx.getStorageSync(storage.STORAGE_KEY.session_key),
        'OpenId': wx.getStorageSync(storage.STORAGE_KEY.openId),
        'Unionid': wx.getStorageSync(storage.STORAGE_KEY.unionid),
        "Plat": 502
      },
      callback: function (data) {

        if (data.error) {
          //TODO 显示错误信息
          that.showTip(data.error);
          return;
        }
        var data = data.res.data.Data;

        if (data.canRefund == 1) {
          app.flightGlobalData["refundCallbackKey"] = function () {
            //that.searchFlightDetails(that.data.orderSerialId);
            that.setData({
              isRefundSuccess: true
            });
          };

          //跳转退票页面
          utils.showPage(Pages.refund_ticket, {
            serialid: that.data.orderSerialId,
            orderId: that.data.order.orderId,
            orgCity: that.data.flight.flyCity,
            arrCity: that.data.flight.goCity,
            refundCallbackKey: "refundCallbackKey"
          });
        }
        if (data.canRefund == 0) {
          that.showTip('退票异常，请联系客服核实');
        }
      }
    };
    //获取退票接口数据
    dataService.requestData(api.flightdetails, params);
  },
  //  改期
  goToChange: function(){
    var that = this;
    that.showTip('小程序暂时不支持对该订单进行相关操作，请进入"微信-钱包-火车票机票"查看。');
  },
  //消息提示
  showTip: function (msg) {
    wx.showModal({
      title: '温馨提示',
      content: msg,
      showCancel: false
    })
  },
  /**
   * 查询订单详情数据
   */
  searchFlightDetails: function (orderSerialId) {
    var that = this;
    var params = {
      data: {
        "SerialId": orderSerialId,
        "RefId": "0",
        "QueryType": "0",//OrderDetailDisplayInfo",
        "Session_Key": wx.getStorageSync(storage.STORAGE_KEY.session_key),
        "Plat": 502,
        "MemberId": "",
        "MailNo": "",
        "OpenId": wx.getStorageSync(storage.STORAGE_KEY.openId),
        'Unionid': wx.getStorageSync(storage.STORAGE_KEY.unionid),
        "CallBack": ""
      },
      callback: function (data) {
        wx.hideToast();

        if (data.error) {
          //TODO 显示错误信息
          that.showTip("查询失败");
          return;
        }

        if(data.res.data.Data){
          var data = data.res.data.Data;
          // var data = { "ErrorCode": 1, "ErrorMsg": "", "Data": { "orderInfo": { "memberId": 269978624, "serialId": "FS593U4B162100353036", "orderId": 230721589, "channelTag": "501", "orderFlagName": "已退票", "airlineType": "1", "orderFlag": "T", "productCode": 1608100004, "orderCreateType": 0, "mailHint": null, "foeShapeType": "0", "unionNO": "", "merchantId": 1427076, "createDate": "2017-6-12 16:06:04", "orderPayDate": "2017-6-12 16:06:20", "orderOverDate": "2017-6-12 16:10:02", "cancelDate": "1900-01-01 00:00:00", "expireDate": "2017-6-12 17:06:04", "responseDate": "2017-06-13 15:20:48", "isClientClear": "1", "ticketType": "1", "receiveCompany": 0, "productPreType": 0, "isDelayTicket": 0, "isReduce": 0, "hasUpgrade": 0, "isTourismCardPay": 0, "isBOrder": 0, "isDOrder": 0, "refundBackAccount": "微信账户", "refundBackDays": 3, "linkMan": "庄前飞", "linkMobile": "138****3827", "linkEMail": "", "tgwyProductDes": "", "tgwyDiscountPer": "", "bonusList": [{ "bonusName": "点评奖金", "bonusNum": "0" }], "accidentInsCount": 0, "delayInsCount": 0, "isDisplayVipLounge": false, "checkInContextDispStatus": 0 }, "statusInfo": { "isCanCancel": 0, "isCanPay": 0, "isCanMail": 0, "isCanDP": 0, "isCanRefund": 0, "isCanChange": 0, "isCanReBooking": 0, "isChildSplit": 0, "isNeedHBPay": 0, "isCanYK": 0, "isCanShowFlightChange": 0, "isCanShowDelayIns": 0, "isSellInsuranceInWXDetails": 0 }, "financeInfo": { "customerShouldPay": "2600.00", "customerTicketPrice": "2550.00", "accountTCCardShouldGet": "2600.00", "orderBuildPrice": "50.00", "orderTaxPrice": "0.00", "reduceMoney": "0.00", "forVIPRoomPrice": "0.00", "tgwyAllPrice": "", "mailPrice": "0.00", "wcReturnPrize": "29.00", "redFee": "0.00", "insureFee": "0.00", "changeUpFee": "0.00", "changgeGaiFee": "0.00", "changeFee": "0.00", "carparkPrice": "0.00", "paymentType": null, "reduceAmount": "0.00", "hotelVoucherAllPrice": "0.00", "pickUpVoucherAllPrice": "0.00", "dChangeFee": "0.00", "serviceFee": "0.00", "balanceAmount": "0.00", "bearPrice": "0.00", "mealTotalPrice": "0.00", "bjhhTotalPrice": "0.00" }, "passengerList": [{ "passengerId": 149906676, "passengerName": "庄前飞", "passengerGuid": "42845dd2-7da8-45ad-ba03-188736c91e4a", "gender": 1, "passengerType": 1, "certType": 0, "certNO": "3****************5", "ticketFlag": "T", "ticketState": "已退票", "eticketNo": "7814959046889", "cabinCode": "F", "cabinName": "头等舱", "birthDay": "1990-01-08", "outPassengerId": "", "pnr": "HQ1RHN", "isETicketUsed": "4", "sysTicketPrice": "1590", "customerTicketPrice": "1590", "buildFarePrice": 50, "taxFarePrice": 0, "redPrice": "0", "stepDelayPrice": null, "customersWithnet": "1640.00", "fPForeProfit": "0.00", "isShowFlightInfo": false, "extendInfo": {} }, { "passengerId": 149906677, "passengerName": "小孩", "passengerGuid": "89289c34-aa7e-475d-9978-3cbc7126fcb7", "gender": 1, "passengerType": 2, "certType": 0, "certNO": "1****************5", "ticketFlag": "T", "ticketState": "已退票", "eticketNo": "7814959046892", "cabinCode": "F", "cabinName": "头等舱", "birthDay": "2014-06-01", "outPassengerId": "", "pnr": "HRTRQV", "isETicketUsed": "4", "sysTicketPrice": "800", "customerTicketPrice": "800", "buildFarePrice": 0, "taxFarePrice": 0, "redPrice": "0", "stepDelayPrice": null, "customersWithnet": "800.00", "fPForeProfit": "0.00", "isShowFlightInfo": false, "extendInfo": {} }, { "passengerId": 149906678, "passengerName": "宝宝", "passengerGuid": "ca911a59-648d-42f3-a7fe-3b8460662a37", "gender": 0, "passengerType": 3, "certType": 9, "certNO": "2******6", "ticketFlag": "T", "ticketState": "已退票", "eticketNo": "7814959046890", "cabinCode": "F", "cabinName": "头等舱", "birthDay": "2017-02-16", "outPassengerId": "", "pnr": "", "isETicketUsed": "4", "sysTicketPrice": "160", "customerTicketPrice": "160", "buildFarePrice": 0, "taxFarePrice": 0, "redPrice": "0", "stepDelayPrice": null, "customersWithnet": "160.00", "fPForeProfit": "0.00", "isShowFlightInfo": false, "extendInfo": {} }], "flightList": [{ "routeNo": "1", "flightNo": "FM9265", "airCompany": "FM", "airCompanyName": "上海航空", "flyOffDate": "2017-7-14 12:40:00", "arrDate": "2017-7-14 13:55:00", "startPortFloor": "T2", "endPortFloor": "", "startPort": "SHA", "endPort": "TXN", "startPortName": "上海虹桥机场", "endPortName": "黄山屯溪机场", "routeType": "0", "friAirLinePort": "上海虹桥—黄山", "isFlightDelay": 0, "airLineDes": "上海-黄山", "isShareFlight": 0, "mainFlightNo": "", "mainFlightAirWay": "" }], "mailInfo": null, "refundInfo": { "refundApplyTime": "2017-06-12 16:27:10", "totalPayAmount": "2600.00", "refundFee": "0.00", "canRefundMoney": "2600.00", "reduceMoney": "0.00", "refundBackDays": "5", "refundBackAccount": "微信账户", "insuranceFee": "0.00" }, "assireveSimpleList": null, "extendInfo": { "trackList": [{ "content": "您的退票已审核通过", "time": "2017-06-12 18:06:33", "title": "退票审核通过" }, { "content": "【庄前飞,小孩,宝宝】已提交退票申请，待审核", "time": "2017-06-12 16:27:10", "title": "提交退票申请" }, { "content": "您的订单已成功出票", "time": "2017-06-12 16:10:02", "title": "出票成功" }, { "content": "您的订单已成功支付", "time": "2017-06-12 16:06:21", "title": "预订成功" }] }, "dynamicInfo": null } }.Data;
          
          if (data.flightList[0]) {
            var flyDate = utils.parseDate(data.flightList[0].flyOffDate),
              arriveDate = utils.parseDate(data.flightList[0].arrDate);
            data.flightList[0].flyOffDay = commonUtils.format(flyDate, 'MM月dd日');
            data.flightList[0].flyOffTime = commonUtils.format(flyDate, 'hh:mm');
            data.flightList[0].arriveTime = commonUtils.format(arriveDate, 'hh:mm');
            data.flightList[0].flyCity = data.flightList[0].airLineDes.split("-")[0],
            data.flightList[0].goCity = data.flightList[0].airLineDes.split("-")[1];
          }
          if (data.orderInfo){
            /*申请中，付款中，变更中 橙色 1*/
            /*预定成功 绿色 2 */
            /*已过期，已取消，已结束，已退票 灰色 3*/
            var orderInfo = data.orderInfo;
            if (orderInfo.orderFlagName == '申请中' || orderInfo.orderFlagName == '付款中' || orderInfo.orderFlagName == '变更中' || orderInfo.orderFlagName == '改期中' || orderInfo.orderFlagName == '待支付') {
              orderInfo.OrderFlagNum = '1';
            } else if (orderInfo.orderFlagName == '预定成功' || orderInfo.orderFlagName == '待出行' || orderInfo.orderFlagName == '已改签') {
              data.orderInfo.OrderFlagNum = '2';
            } else {
              orderInfo.OrderFlagNum = '3';
            }
            if (orderInfo.orderFlagName == '待支付'){
              orderInfo.orderIips = '机票价格实时变动，请尽快完成支付';
            } else if (orderInfo.orderFlagName == '预订成功' || orderInfo.orderFlagName == '待出行') {
              orderInfo.orderIips = '请至少提前两小时到达机场，以免误机';
            } else if (orderInfo.orderFlagName == '已取消') {
              orderInfo.orderIips = '您的订单已取消，期待您的再次使用';
            } else if (orderInfo.orderFlagName == '已结束') {
              orderInfo.orderIips = '您的行程已结束，感谢您的使用';
            } else if (orderInfo.orderFlagName == '已退票') {
              orderInfo.orderIips = '您的订单已退票完成，感谢您的使用';
            } else if (orderInfo.orderFlagName == '变更中') {
              orderInfo.orderIips = '您的订单正在加急处理，请耐心等待';
            }
            orderInfo.tgwyProductDes = orderInfo.tgwyProductDes.replace(/<\/div>/g, "").split("<div>");
          }
          if (data.passengerList) {
            data.refundInfo.passentList = [];
            data.passengerList.forEach(function (item, i) {
              //新增乘客类型名称字段
              switch (item.passengerType) {
                case 1:
                  item.passengerDesc = '成人';
                  break;
                case 2:
                  item.passengerDesc = '儿童';
                  break;
                default:
                  item.passengerDesc = '婴儿';
                  break;
              }
              //新增证件号名称字段
              item.certTypeDesc = that.getCertName(item.certType);
              //改期中 橙色
              if (item.ticketState == '改期中') {
                item.ticketFlagColor = '1';
              }
              //已退票、已改签
              else if (item.ticketState == '已退票' || item.ticketState == '已改签') {
                item.ticketFlagColor = '2';
              }
              //其他状态隐藏（秦路）
              else {
                item.ticketFlagShow = '0';
              }
              if (item.ticketState == "已退票") {
                var refundData = {};
                refundData.name = item.passengerName;
                refundData.state = item.ticketState;
                refundData.desc = item.passengerDesc;
                data.refundInfo.passentList.push(refundData)
              }
            });
            //改期需要用到的
            that.setData({
              passengerObj: data.passengerList
            });
          }
          //  财务基础信息
          if(data.financeInfo){
            data.financeInfo.allBuildAndTax = parseFloat(data.financeInfo.orderBuildPrice) + parseFloat(data.financeInfo.orderTaxPrice);
            for(var aa in data.financeInfo){
              data.financeInfo[aa] = parseFloat(data.financeInfo[aa])
            }
          }
          //  邮寄基础信息
          if (data.mailInfo && data.mailInfo.flightMailInfolist && data.mailInfo.flightMailInfolist[0] && data.mailInfo.flightMailInfolist[0].ExpectedTime) {
            var mailDate = utils.parseDate(data.mailInfo.flightMailInfolist[0].ExpectedTime);
            data.mailInfo.showMailDate = commonUtils.format(mailDate, 'MM月dd日');
          }
          //  辅营概要信息列表
          if (data.assireveSimpleList){
            for (var n = 0, m = data.assireveSimpleList.length; n < m; n++){
              data.assireveSimpleList[n].assirevePrice = parseFloat(data.assireveSimpleList[n].assirevePrice);
            }
          }
          if (data.refundInfo) {
            data.refundInfo.totalPayAmount = parseFloat(data.refundInfo.totalPayAmount)
            data.refundInfo.refundFee = parseFloat(data.refundInfo.refundFee)
            data.refundInfo.canRefundMoney = parseFloat(data.refundInfo.canRefundMoney)
          }
          that.setData({
            order: data.orderInfo,
            flight: data.flightList[0],
            statusInfo: data.statusInfo,
            finance: data.financeInfo,
            mail: data.mailInfo,
            passenger: data.passengerList,
            extend: data.extendInfo,
            assireveSimple: data.assireveSimpleList,
            returnOrder: data.refundInfo || ''
            // btnStatus: data.btnStatus,
            // finance: data.financeModel,
            // mail: data.mailModel,
          });
        }

      }
    };
    //获取详情接口数据
    // dataService.requestData(api.flightdetails, params);
    dataService.requestData(api.flightdetails, params, "POST");
  },
  getCertName: function (type) {
    switch (type) {
      case 0:
        return "身份证";
        break;
      case 1:
        return "护照";
        break;
      case 2:
        return "军官证";
        break;
      case 3:
        return "回乡证";
        break;
      case 4:
        return "港澳通行证";
        break;
      case 5:
        return "台胞证";
        break;
      case 6:
        return "出生证明";
        break;
      case 7:
        return "户口薄";
        break;
      default:
        return "其他";
        break;
    }
  },
  //订单金额明细信息
  showTotalDialogLayer: function () {
    var that = this;
    //统计点击次数
    common.ev(Pages.orderdetails, "订单总额", "订单金额明细", that.data.traceProject, that.data.tracePage);

    this.setData({
      showTotalDialog: true
    });
  },
  hideTotalDialogLayer: function () {
    this.setData({
      showTotalDialog: false
    });
  },
  // 订单跟踪弹框
  showTraceDialogLayer: function () {
    var that = this;
    //统计点击次数
    // common.ev(Pages.orderdetails, "订单总额", "订单金额明细", that.data.traceProject, that.data.tracePage);

    this.setData({
      showTraceDialog: true
    });
  },
  hideTraceDialogLayer: function () {
    this.setData({
      showTraceDialog: false
    });
  },
  // 贵宾厅弹层
  showVipRoomLayer: function (event) {
    var that = this;
    //统计点击次数
    // common.ev(Pages.orderdetails, "订单总额", "订单金额明细", that.data.traceProject, that.data.tracePage);
    var attrInfo = event.currentTarget.dataset.assirevetype;
    if (attrInfo == "AccidentIns" || attrInfo == "DelayIns" || attrInfo == "SyntheticalIns"){
      that.setData({
        showAttr: attrInfo,
        showVipRoom: true
      });
      return;
    }
    common.showToast('正在加载...');
    var params = {
      data: {
        "SerialId": that.data.orderSerialId,
        "RefId": "",
        "QueryType": "OrderDetailAssireveInfo",
        "QueryAssireveType": attrInfo,
        "Plat": 502,
        "MemberId": that.data.order.memberId,
        "MailNo": "",
        "StartPort": that.data.flight.startPort,
        "OpenId": wx.getStorageSync(storage.STORAGE_KEY.openId),
        "Session_Key": wx.getStorageSync(storage.STORAGE_KEY.session_key),
        'Unionid': wx.getStorageSync(storage.STORAGE_KEY.unionid),
        "CallBack": ""
      },
      callback: function(data){

        if (data.ErrorMsg){
          that.showTip(data.ErrorMsg)
          return;
        }
        var attrName = "";
        //  酒店券 接送机券 data返回跟其他不一样
        if (attrInfo == "HotelVouchers" || attrInfo == "TransportVouchers"){
          attrName = "vouchers";
        }else{
          attrName = attrInfo.replace(attrInfo[0], attrInfo[0].toLocaleLowerCase())
        }
        var showAttrData = data.res.data.Data[attrName];
        //  餐食券文案分割
        if (attrInfo == "MealService") {
          showAttrData.useRules = showAttrData.useRules.split('<br>');
          showAttrData.tgqRules = showAttrData.tgqRules.split('<br>');
        }
        //  酒店券 接送机券 说明文案分割
        if (attrInfo == "HotelVouchers" || attrInfo == "TransportVouchers") {
          showAttrData[0].vocherDesc = showAttrData[0].vocherDesc.split("\n");
        }
        //  退改无忧乘客
        if (attrInfo == "RefundSecure") {
          for(var n = 0, m = showAttrData.length; n < m; n++){
            for (var x = 0, y = that.data.passenger.length; x < y; x++){
              if (that.data.passenger[x].passengerId == showAttrData[n].passengerId){
                showAttrData[n].passengerName = that.data.passenger[x].passengerName;
              }
            }
          }
        }
        //  报价护航
        if (attrInfo == "InsuredPriceEscort") {
          showAttrData.baseInfo.orderDetailDes = showAttrData.baseInfo.orderDetailDes.split("\n");
        }
        that.setData({
          showAttr: attrInfo,
          showAttrData: showAttrData,
          showVipRoom: true
        });
        // console.log(JSON.stringify(that.data.showAttrData))
      }
    }

    dataService.requestData(api.flightdetails, params, "POST");

  },
  hideVipRoomLayer: function () {
    this.setData({
      showVipRoom: false
    });
  },
  //改期信息
  showChangeDialogLayer: function (event) {
    if (event.target.dataset.ticketstate == '改期中' || event.target.dataset.ticketstate == '已改签') {
      //统计点击次数
      common.ev(Pages.orderdetails, '2002', "改签详情", "查看改签详情", this.data.traceProject, this.data.tracePage);

      //必须已改期才会弹框呈现改期后信息 F已改期 G改期中
      var index = event.target.dataset.passagerindex,
        passengerObj = this.data.passengerObj[index],
        changeInfo = passengerObj.extendInfo && passengerObj.extendInfo.changeInfo;
        
      if (passengerObj.isShowFlightInfo && changeInfo) {

        var flyDate = utils.parseDate(changeInfo.flyOffDate),
          arriveDate = utils.parseDate(changeInfo.arriveDate);
        // changeInfo.flyOffDay = commonUtils.format(flyDate, 'yyyy-MM-dd 周w');
        changeInfo.flyOffDay = commonUtils.format(flyDate, 'MM月dd日');
        changeInfo.flyOffTime = commonUtils.format(flyDate, 'hh:mm');
        changeInfo.arriveTime = commonUtils.format(arriveDate, 'hh:mm');

        this.setData({
          changeInfo: changeInfo,
          passengerChange: passengerObj,
          showChangeDialog: true
        });
      }
    } else if (event.target.dataset.ticketstate == '已退票'){
      //统计点击次数
      common.ev(Pages.orderdetails, '2002', "退票详情", "查看退票详情", this.data.traceProject, this.data.tracePage);

      this.setData({
        showReturnDialog: true
      });
    }

  },
  hideChangeDialogLayer: function () {
    this.setData({
      showChangeDialog: false,
      showReturnDialog: false
    });
  },
  //退改签说明
  showIntroDialogLayer: function () {
    var that = this;
    //统计点击次数
    common.ev(Pages.orderdetails, '2002', "航班规定详情", "航班规定详情", that.data.traceProject, that.data.tracePage);

    var params = {
      data: {
        "OrderSerialid": that.data.orderSerialId,
        "Plat": 502,
        // "QueryType": "OrderDetailChangeInfo",
        "OpenId": wx.getStorageSync(storage.STORAGE_KEY.openId),
        "HasChild": true,
        "Session_Key": wx.getStorageSync(storage.STORAGE_KEY.session_key),
        'Unionid': wx.getStorageSync(storage.STORAGE_KEY.unionid),
        "CallBack": "",
        "IP": ""
      },
      callback: function (data) {

        if (data.error) {
          //TODO 显示错误信息
          that.showTip("退改签信息获取失败!");
          return;
        }
        if (data.res.data.Data.Data) {
          that.setData({
            showIntroDialog: true,
            tgqData: JSON.parse(data.res.data.Data.Data).pass || ""
          });
        }

      }
    };
    //获取退改签接口数据
    dataService.requestData(api.detailsTGQ, params, "POST");

  },
  hideIntroDialogLayer: function () {
    this.setData({
      showIntroDialog: false
    });
  },
  //邮寄信息
  showMailDialogLayer: function (event) {
    var that = this,
      index = event.target.dataset.mailindex,
      isExitMail = event.target.dataset.isexitmail;

    //统计点击次数
    common.ev(Pages.orderdetails, '2002', "邮寄详情", "邮寄详情", that.data.traceProject, that.data.tracePage);

    var params = {
      data: {
        "SerialId": that.data.orderSerialId,
        "RefId": "",
        "QueryType": "OrderDetailMailInfo",
        "Plat": 502,
        "MemberId": that.data.order.memberId,
        "MailNo": "",
        "OpenId": wx.getStorageSync(storage.STORAGE_KEY.openId),
        "Session_Key": wx.getStorageSync(storage.STORAGE_KEY.session_key),
        'Unionid': wx.getStorageSync(storage.STORAGE_KEY.unionid),
        "CallBack": "",
        "IP": ""
      },
      callback: function (data) {
        
        if (data.error) {
          //TODO 显示错误信息
          that.showTip('邮寄信息获取失败！');
          return;
        }

        if (data.res.data.Data[0]) {
          var data = data.res.data.Data[0];
          that.setData({
            showMailDialog: true,
            mailDetails: data
          });
        }

      }
    };
    //获取邮寄接口数据
    dataService.requestData(api.flightdetails, params, "POST");

  },
  hideMailDialogLayer: function () {
    this.setData({
      showMailDialog: false
    });
  },
  // //退票信息
  // showReturnDialogLayer: function () {
  //   //统计点击次数
  //   common.ev(Pages.orderdetails, '2002', "退票详情", "查看退票详情", this.data.traceProject, this.data.tracePage);

  //   this.setData({
  //     showReturnDialog: true
  //   });
  // },
  hideReturnDialogLayer: function () {
    this.setData({
      showReturnDialog: false
    });
  }


});
