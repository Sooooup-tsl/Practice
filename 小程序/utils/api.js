var root = 'https://wx.17u.cn/',
  online = root + 'appapi/', offline = root + 'appapitest/',
    trainDomain = root + 'qquniontrain/trainapi/', //trainDomain = root + 'wxuniontraintest3/trainapi/', 测试
  imgRoot = 'http://wx.40017.cn/touch/weixin/',
  fconfig = require('../pages/flight/scripts/config.js'),
  fRoots = [
    root + "flight/",
    root + "wxflighttest/",
    root + "wxflighttwotest/",
    root + "wxflighttest2/",
    root + "wxflighttest3/"
  ],
  busRoot = 'https://wx.17u.cn/wxbusapi/',// 'https://wx.17u.cn/wxbusapi/',
  busRoottest = 'https://wx.17u.cn/wxbusapitest/',
  fRoot = fRoots[fconfig.env];
var apppub = 'https://wx.17u.cn/apppub/'
var apppubT = 'https://wx.t.17u.cn/apppub/'
var apppubtest = 'https://wx.17u.cn/apppubtest/'
var weimob = 'https://wx.17u.cn/weimob/'
// var weimob = 'https://wx.17u.cn/weimobtest/'
// var weimob = 'http://10.101.60.8/weimob/'
//apppub = 'https://wx.17u.cn/apppubtest/'
module.exports = {
  root: root,
  busRoot: busRoot,
  busRoottest: busRoottest,
  imgRoot: imgRoot,

  //公共页面接口
  login: online + 'user/login/2',
  unionId: online + 'user/GetUserUnionId',
  getAddress: online + 'Map/GetAddress',
  eventUrl: root + 'wireless/monitor/wx/common/event',
  pageUrl: root + 'wireless/monitor/wx/common/pageview',
  memberId: trainDomain + 'getminiappinfo.html',
  canGetCard: root + 'pubapi/card/membercard.ashx',
  cardListNum: root + 'apppub/card/count',
  GetAppQrCodePath: apppub + 'AppQrCode/GetAppQrCodePath',

  flightPcalender: root + 'pubapi/Calendar/FlightQueryFzlowestPrice.ashx', //国内低价日历接口

  setuserinfo: online + 'agent/setuserinfo',
  //快速绑定
  wxbind: online + 'member/wxbind',
  //火车票12306登录发卡券
  SendCardCoupon: apppub + 'card/SendCardCoupon',
  //领取会员卡页面
  getCardExt: online + 'card/getcardext',
  //卡券列表
  getCardList: apppub + 'card/list',
  gethongbaodesc: root + 'apppub/card/hongbaodesc',

  //解除绑定和找回密码
  bind: online + 'member/bind',
  outbind: online + 'member/outbind',
  sendCode: online + 'member/sendmessge',
  findPassword: online + 'member/findpassWord',
  validmessge: online + 'member/validmessge',

  //活动页面
  getRedBagUrl: root + 'weimob/Store/ReceiveHongBao',

  //一分钱活动接口
  lotteryRedirect: online + 'home/config?key=weimob.lottery.redirect',
  miniconfig: weimob + 'newturntable/miniconfig',
  minilotimes: weimob + 'newturntable/minilotimes',
  miniresiduetimes: weimob + 'newturntable/miniresiduetimes',
  minilottery: weimob + 'newturntable/minilottery',
  miniprizes: weimob + 'newturntable/miniprizes',
  minicontact: weimob + 'newturntable/minicontact',
  minishare: weimob + 'newturntable/minishare',
  miniex: weimob + 'newturntable/miniex',
  wxpay: weimob + 'newturntable/miniwxpay',
    indianalottery: online + 'home/config?key=appapi.lottery.operation',

  // 送流量活动页面
  homegetFlowNum: apppub + 'traffic/GetTrafficBalanceEntrace',
  getFlowSet: apppub + 'traffic/GetTrafficRuleInfo',
  getFlowNum: apppub + 'traffic/GetTrafficBalanceInfo',
  getHistoryList: apppub + 'traffic/GetMyRecords',
  receiveFlow: apppub + 'Traffic/ExtractTraffic',
  addShareInfo: apppub + 'traffic/AddSharerInfo',
  addBeSharedPersonInfo: apppub + 'traffic/AddBeSharedPersonInfo',
  getMyBeSharedPerson: apppub + 'traffic/GetMyBeSharedPerson',
  getOtherBeSharedPerson: apppub + 'traffic/GetOtherBeSharedPerson',


  //mydetail页面
  userDetail: online + 'member/UserDetail',
  avatarImg: imgRoot + 'wxapp/home/myinfo/avatar.png',

  //mytrip页面
  getMyTrip: online + 'MyTrip/GetMyTrip',
  getguid: online + 'mytrip/getguid',
  usershare: online + 'mytrip/usershare',//分享行程
  queryusershare: online + 'mytrip/queryusershare',//查询已分享的行程
  useraddshare: online + 'mytrip/useraddshare',//添加行程
  Userdelshare: online + 'mytrip/Userdelshare',//删除行程

  //myinfo页面
  isbind: online + 'member/isbind',
  userInfoIcon: imgRoot + 'wxapp/home/myinfo/',
  indianaCtrl: online + 'home/config?key=appapi.trainflight.yiyuan',

  //myorder
  orderList: online + 'order/list',
  delOrderList: online + 'order/delete',
  customShow: online + 'home/config?key=Operation.Common',

  //火车票
  getCityListByLetter: root + 'uniontrain/trainapi/GetCityStationList',
  traindetail: trainDomain + 'traindetail.html',
  getins: trainDomain + 'getinsuranceswieless.html',
  createTrainOrder: trainDomain + 'CreateMiniAppOrder',
  consumeresult: trainDomain + 'consumeresult.html',
  trainorderdetail: trainDomain + 'orderdetail.html',
  traincheckpay: trainDomain + 'qqcheckpay.html',
  trainminiappay: trainDomain + 'miniappay.html',
  trainmid: trainDomain + 'getminiappinfo.html',
  checkforseat: trainDomain + 'checkforseat.html',
  getlastaccount: trainDomain + 'GetKyfwAccountForLast.html',
  kyfw: trainDomain + 'kyfw.html',
  trainworktime: trainDomain + 'worktime.html',
  gettrainlinker: trainDomain + 'getlinker.html',
  addkyfwlinker: trainDomain + 'addkyfwmemberlinker.html',
  verifykyfwmobile: trainDomain + 'verifykyfwmobile.html',
  getrequestid: trainDomain + 'getrequestid.html',
  captcha: trainDomain + 'captcha.html',
  getkyfwPWstatus: trainDomain + 'getkyfwpasswordstatus.html',
  ckcaptcha: trainDomain + 'ckcaptcha.html',
  checkuserregister: trainDomain + 'checkuserregister.html',
  ckuname: trainDomain + 'ckuname.html',
  registerUser: trainDomain + 'kyfw/RegisterUser',
  trainsearch: trainDomain + 'search.html',
  traincancelorder: trainDomain + 'cancelOrder.html',
  returnordertraintickets: trainDomain + 'returnordertraintickets.html',
  remindrefundfee: trainDomain + 'remindrefundfee.html',
  getrefundticketsfee: trainDomain + 'getrefundticketsfee.html',
  getticketnitice: trainDomain + 'Common/GetTicketDescribe',
  stopinfo: trainDomain + 'getstopovers.html',

  // 机票
  firstflightlist: fRoot + "json/getwxprogramflightlist.html",
  pcalendar: fRoot + "json/pcalender.html",
  getwxprogramproductinfo: fRoot + "json/getwxprogramproductinfo.html",
  book2detail: fRoot + "json/book2detail.html",
  querylinker: fRoot + "json/querylinker.html",
  savelinker: fRoot + "json/savelinker.html",
  checkiscontainspecial: fRoot + "json/CheckIsContainSpecial.html",
  checkmasterno: fRoot + "json/checkmasterno.html",
  citysearch: root + "pubapi/Search/SearchHandler.ashx",
  cityletter: fRoot + "json/GetCitysByLetter.html",

  flightdetails: fRoot + "json/getwxprogramflightorderdetail.html",
  canceldetails: fRoot + "json/cancelwxprogramorder.html",
  cancelOrder: fRoot + "json/cancelwxprogramorder.html",
  detailsTGQ: fRoot + "json/QueryRefundAndChangeRuleBySerialId.html",

  CheckIsContainSpecial: fRoot + "CheckIsContainSpecial.html",
  deletelinker: fRoot + "json/dltlinker.html",
  submitOrder: fRoot + "json/submitorder.html",
  getwxprogrampayinfo: fRoot + "json/getwxprogrampayinfo.html",
  changePayMethod: fRoot + "json/changeflightorderstatus.html",
  checkPay: fRoot + "json/beforepaycheck.html",
  getwxprogrampaysuccess: fRoot + "json/getwxprogrampaysuccess.html",
  checkRepeat: fRoot + "json/checkwxrepeatpassenger.html",
  getMailAdress: fRoot + "json/getmailaddress.html",

  queryRefundFeeDetail: fRoot + "json/QueryRefundFeeDetail.html",
  submitrefund: fRoot + "json/submitrefund.html",
  buy: fRoot + "json/buy.html",
  name: fRoot + "json/name.html",
  gd: fRoot + "json/gd.html",

  //汽车票
  // busHotCities: root + 'wxbus/BusSerach/GetBusHotCities',
  busDepartureCityFilter: root + 'wxbus/BusSerach/DepartureCityFilter',
  busDepartures: root + 'wxbus/BusSerach/GetSuggestBusDepartures',
  busDestinationCity: root + 'wxbus/BusSerach/DestinationCity',
  busDestinations: root + 'wxbus/BusSerach/GetSuggestBusDestinations',

  //1元夺宝
  indianaRoot: root,
  //indianaRoot: 'http://10.101.62.46/',

  //汽车票java接口wxbusapi/departure/suggestDeparture
  busGetSaleDay: busRoot + 'city/getSaleDay?plateId=9',
  busGetHotDepCity: busRoot + 'departure/getHotDepCity?plateId=9',
  busGetHotDesCity: busRoot + 'destination/getHotDesCity?plateId=9',
  busGetDepByLetter: busRoot + 'departure/getDepByLetter?plateId=9',// root + 'wxbus/BusSerach/DepartureCityFilter',//
  busGetDesByLetter: busRoot + 'destination/getDesByLetter?plateId=9',

  busGetDesByKeyWords: busRoot + 'destination/getDesByKeyWords',
  busGetDepByKeyWords: busRoot + 'departure/suggestDeparture',
  getRunningTime: busRoot + 'destination/getRunTime?plateId=9',
  GetBusVerifyModel: busRoot + 'schedule/verifySchedule?plateId=9',
  getPriceRiseRatio: busRoot + 'config/getSubscribePriceRiseRatio?plateId=9',

  getOrderDetail: busRoot + 'order/getOrderDetail?plateId=9',
  orderCancel: busRoot + 'order/orderCancel?plateId=9',
  getWechatCard: busRoot + 'preferential/queryWechatCard?plateId=9',

  //一元夺宝
  //addIndianaTimes: apppub +'Common/AddIndianaTimes'  //增加一元夺宝的抽奖机会
  addIndianaTimes: apppub + 'Common/AddIndianaTimes',

  //首页弹屏和提示框
  loadEntrance: online + 'home/config?key=tcly.home.switch',
  loadHomeModal: apppub + 'Advert/PopAdvertment',
  loadTipBox: online + 'order/GetHomeTopSpendingInfo',

  //意见反馈
  feedBack: apppub + 'Question/QuestionFeedBack',
  dateSign: apppub + "Sign/GetSignIndex",//签到

  exchangeCoin: apppub + "ExChangeCoin/ExChangeIndex", //兑换零钱
  eccreateOrder: apppub + "ExChangeCoin/ExChangeCoinPay",
  ecorderState: apppub + "ExChangeCoin/GetPayStatusForWX",

  // exchangeCoin: 'https://wx.17u.cn/apppubtest/' + "ExChangeCoin/ExChangeIndex", //兑换零钱
  // eccreateOrder: 'https://wx.17u.cn/apppubtest/' + "ExChangeCoin/ExChangeCoinPay",
  // ecorderState: 'https://wx.17u.cn/apppubtest/' + "ExChangeCoin/GetPayStatusForWX"
}
