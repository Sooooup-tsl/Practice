/**
 * Created by kroll on 2016/9/27.
 */
var uroot = '../../../../util/',
  scroot = '../../scripts/',
  Pages = require(scroot + 'pages.js'),
  Util = require(scroot + 'utils.js'),
  commonUtils = require(uroot + 'util.js'),
  Storage = require(scroot + 'storage.js'),
  Api = require(uroot + 'api.js'),
  common = require(uroot + 'common.js'),
  App = getApp(),
  LocalKey = {
    moblie: 'flight_mobile_num',
    mail: 'flight_mail_info',
    invoice: 'flight_invoice_title',
    invoiceComp: 'flight_invoice_comp_title',
    invoicePer: 'flight_invoice_per_title',
    invoiceType: 'flight_invoice_type',
    identifyNo: 'flight_invoice_identify',
    showInvoice: 'flight_show_invoice'
  };

Page({
  data: {
    flightInfo: null, // 航班信息
    insuList: [], // 保险 -- 所有保险都会放到此数组中,用来判断是否有保险数据
    accidentInsu: {}, // 航班意外险
    mailConfig: {}, // 邮寄配置
    mobileNum: '', // 手机号
    passengers: [], // 已选择的乘机人
    totalPrice: 0, // 总价
    adultNum: 0, // 成人数
    childrenNum: 0, // 儿童数,
    babyNum: 0, // 婴儿数
    price: {
      adult: 0,
      children: 0,
      building: 0, // 基建
      fuel: 0, // 燃油
      cFuel: 0 // 儿童燃油
    },
    isNeedMail: false, // 是否需要邮寄
    refundChange: {}, // 退改签
    modal: {
      title: '温馨提示',
      hiddenScroll: true,
      hiddenScrollAgree: true,
      data: []
    },
    show: {
      refundInfo: false, // 退改签详情弹窗是否显示
      flightInfo: false, // 航班详细信息弹窗是否显示
      priceInfo: false // 金额明细是否显示
    },
    passengerActive: [], // 用于乘机人删除交互效果
    // loadingHidden: true,
    mailInfo: null, // 邮寄信息
    invoiceTitle: '', // 发票抬头
    invoiceCompTitle: '',// 公司发票抬头
    invoicePerTitle: '',// 个人发票抬头
    isShowInvoice: false, //是否显示发票填写,默认false
    isCompanyTitle: false, // 是否公司发票抬头，ture:公司，false:个人
    customerIdentifier: "" // 纳税人识别号或信用代码
  },
  cache: {
    loadingHidden: true,
    tmpOrderData: null, // 临时单返回的数据
    openId: '',
    sessionKey: '',
    unionid: '',
    city: {
      goCity: {
        CityName: '上海'
      },
      backCity: {
        CityName: '北京'
      }
    },
    url: '', // 下单返回跳转的url
    linkman: '', // 联系人
    submitPass: [], // 提交给接口的乘机人数据
    isBack: 0, // 用来判断是否是通过返回到book2
    isCheckAgeType: true,
    requerydate: '', // 下单验证重复单返回的重新查询的日期
    priceChangeTxt: '' // 价格变动文案，埋点用
  },
  /**
   * 加载完成
   * @param options
   */
  onLoad: function (options) {
    this.init()
  },
  onShow: function () {
    // 设置标题
    wx.setNavigationBarTitle({
      title: this.cache.city.goCity.CityName + '→' + this.cache.city.backCity.CityName
    })

    // 判断是否从上一个页面返回的，不是返回的就打个标记，后面不继续执行
    if (this.cache.isBack === 0) {
      this.cache.isBack = 1
      common.page(Pages.book2, '2002', Pages.book1_5, this.data.flightInfo.originAirportCode + '|' + this.data.flightInfo.arriveAirportCode)
      return
    }

    // 从乘机人页面返回，从本地存储读取乘机人数据（以防在乘机人列表编辑过已选择的乘机人信息）
    this.data.passengers = wx.getStorageSync(Storage.STORAGE_KEY.selected_passengers)

    this.setData({
      'passengers': this.data.passengers
    })

    this.calcPrice()

    // 统计代码
    common.page(Pages.book2, '2002', Pages.contact_list, this.data.flightInfo.originAirportCode + '|' + this.data.flightInfo.arriveAirportCode)

  },
  onReady: function () {
    wx.setNavigationBarTitle({
      title: this.cache.city.goCity.CityName + '→' + this.cache.city.backCity.CityName
    })
  },
  init: function () {
    this.initDefault()
    this.calcPrice()
  },
  /**
   * 初始化默认数据
   */
  initDefault: function () {

    this.cache.isBack = 0

    // 从本地存储获取book1.5下临时单成功后存储的数据

    this.cache.tmpOrderData = wx.getStorageSync(Storage.STORAGE_KEY.temporder_info)

    // 从本地存储获取book1.5选中的航班舱位信息

    this.setData({
      flightInfo: wx.getStorageSync(Storage.STORAGE_KEY.flight_selected),
      passengers: wx.getStorageSync(Storage.STORAGE_KEY.selected_passengers),
      mailInfo: wx.getStorageSync(LocalKey.mail),
      mobileNum: wx.getStorageSync(LocalKey.moblie),
      invoiceTitle: wx.getStorageSync(LocalKey.invoice),
      //新增的发票抬头缓存信息
      invoiceCompTitle: wx.getStorageSync(LocalKey.invoiceComp),
      invoicePerTitle: wx.getStorageSync(LocalKey.invoicePer),
      isCompanyTitle: wx.getStorageSync(LocalKey.invoiceType),
      customerIdentifier: wx.getStorageSync(LocalKey.identifyNo),
      isShowInvoice: wx.getStorageSync(LocalKey.showInvoice)
    })

    // this.data.flightInfo = wx.getStorageSync(Storage.STORAGE_KEY.flight_selected)

    //本地存储获取乘机人

    // this.data.passengers = wx.getStorageSync(Storage.STORAGE_KEY.selected_passengers)

    this.cache.openId = wx.getStorageSync(Storage.STORAGE_KEY.openId)

    this.cache.sessionKey = wx.getStorageSync(Storage.STORAGE_KEY.session_key)

    this.cache.unionid = wx.getStorageSync(Storage.STORAGE_KEY.unionid)

    // this.data.mailInfo = wx.getStorageSync(LocalKey.mail)

    // this.data.mobileNum = wx.getStorageSync(LocalKey.moblie)

    // this.data.invoiceTitle = wx.getStorageSync(LocalKey.invoice)

    var city = wx.getStorageSync(Storage.STORAGE_KEY.history_city)

    if (city) {
      this.cache.city = JSON.parse(city)
    }

    if (this.cache.tmpOrderData === '' || this.cache.tmpOrderData === 'null' || this.cache.tmpOrderData === 'undefined') {
      return
    }

    if (this.data.flightInfo === '' || this.data.flightInfo === 'null' || this.data.flightInfo === 'undefined') {
      return
    }

    // 航班信息初始化处理
    this.initFlightInfo()
    // 保险信息初始化处理
    this.initInsuData(this.cache.tmpOrderData.InsuranceList)
    // 邮寄信息初始化处理
    this.initMailData(this.cache.tmpOrderData.ProductConfig)
    // 退改签信息初始化处理
    if (this.cache.tmpOrderData.TgqRuleList && this.cache.tmpOrderData.TgqRuleList.length > 0) {
      this.initRefundChange(this.cache.tmpOrderData.TgqRuleList[0])
    }

  },
  initFlightInfo: function () {
    var dateTime = Util.parseDate(this.data.flightInfo.flyOffTime)
    this.setData({
      "flightInfo.flyWeek": commonUtils.format(dateTime, 'ww'),
      "flightInfo.flyDate": commonUtils.format(dateTime, 'MM月dd日'),
      "flightInfo.flyDateDot": commonUtils.format(dateTime, 'yyyy.MM.dd'),
      "flightInfo.fRateInt": parseInt(this.data.flightInfo.fRate),
      "price.adult": parseInt(this.data.flightInfo.cabins[0].clientTicketPrice, 10),
      "price.children": parseInt(this.data.flightInfo.cabins[0].ccp, 10),
      "price.building": parseInt(this.data.flightInfo.pt, 10),
      "price.fuel": parseInt(this.data.flightInfo.ot, 10),
      "price.cFuel": parseInt(this.data.flightInfo.cot, 10)
    })
    // this.data.flightInfo.flyWeek = commonUtils.format(dateTime, 'ww')
    // this.data.flightInfo.flyDate = commonUtils.format(dateTime, 'MM月dd日')
    // this.data.flightInfo.flyDateDot = commonUtils.format(dateTime, 'yyyy.MM.dd')

    // 准点率取整
    // this.data.flightInfo.fRateInt = parseInt(this.data.flightInfo.fRate)

    // 成人票价
    // this.data.price.adult = parseInt(this.data.flightInfo.cabins[0].clientTicketPrice, 10) // 接口给的字符串
    // this.data.price.children = parseInt(this.data.flightInfo.cabins[0].ccp, 10)

    // this.data.price.building = parseInt(this.data.flightInfo.pt, 10) // 接口给的数字，保险起见转了下
    // this.data.price.fuel = parseInt(this.data.flightInfo.ot, 10)
    // this.data.price.cFuel = parseInt(this.data.flightInfo.cot, 10)
  },
  initRefundChange: function (rule) {

    // this.data.refundChange.changeLowestPrice = rule.ChangeLowestPrice
    // this.data.refundChange.refundLowestPrice = rule.RefundLowestPrice
    // this.data.refundChange.titles = rule.Rule[0]
    // this.data.refundChange.remark = rule.Remark
    // this.data.refundChange.row = []

    var refundChange = []
    for (var i = 1, len = rule.Rule.length; i < len; i++) {
      // this.data.refundChange.row.push(rule.Rule[i])
      refundChange.push(rule.Rule[i])
    }

    this.setData({
      "refundChange.changeLowestPrice": rule.ChangeLowestPrice,
      "refundChange.refundLowestPrice": rule.RefundLowestPrice,
      "refundChange.titles": rule.Rule[0],
      "refundChange.remark": rule.Remark,
      "refundChange.row": refundChange
    })
  },
  /**
   * 处理下保险的数据
   */
  initInsuData: function (insuList) {
    if (!Array.isArray(insuList)) {
      return
    }
    for (var i = 0, len = insuList.length; i < len; i++) {
      //航班意外险
      if (insuList[i].insureType == 1 || insuList[i].insureType == 2) {
        //航班意外险会有多条数据只展示价格低的一条，默认价格低的在第一个
        if (this.data.accidentInsu.price) {
          continue
        }
        this.setData({
          "accidentInsu.insClause": insuList[i].insClause,
          "accidentInsu.submitParam": insuList[i].insureCode + '|' + insuList[i].price,
          "accidentInsu.price": insuList[i].price,
          "accidentInsu.name": '航班意外险',
          "accidentInsu.type": insuList[i].insureType,
          "accidentInsu.isBuy": insuList[i].isDefaultSelect,
          "accidentInsu.des": ['', '']
        })
        // this.data.accidentInsu.insClause = insuList[i].insClause // 保险说明
        // this.data.accidentInsu.submitParam = insuList[i].insureCode + '|' + insuList[i].price // 下单用的参数
        // this.data.accidentInsu.price = insuList[i].price // 保险价格
        // this.data.accidentInsu.name = '航班意外险'
        // this.data.accidentInsu.type = insuList[i].insureType
        // this.data.accidentInsu.isBuy = insuList[i].isDefaultSelect // 是否购买
        // this.data.accidentInsu.des = ['', ''] // 第一个购买时的描述，第二个不购买的描述
        if (insuList[i].insDisplayCopy) {
          this.setData({
            "accidentInsu.des": [(insuList[i].insDisplayCopy[0] && insuList[i].insDisplayCopy[0].Content) || '',
              (insuList[i].insDisplayCopy[1] && insuList[i].insDisplayCopy[1].Content) || '']
          })
          // this.data.accidentInsu.des[0] = (insuList[i].insDisplayCopy[0] && insuList[i].insDisplayCopy[0].Content) || ''
          // this.data.accidentInsu.des[1] = (insuList[i].insDisplayCopy[1] && insuList[i].insDisplayCopy[1].Content) || ''
        }
      }
    }

    var tempInsuList = this.data.insuList
    tempInsuList.push(this.data.accidentInsu)
    this.setData({
      insuList: tempInsuList
    })
    // this.data.insuList.push(this.data.accidentInsu)
  },
  initMailData: function (productConfig) {
    if (!productConfig || !productConfig.MailConfigDetailList) {
      return
    }
    this.setData({
      mailConfig: productConfig.MailConfigDetailList[0]
    })
    // this.data.mailConfig = productConfig.MailConfigDetailList[0]

    if (this.data.mailConfig.mailPayType == 2) {
      this.setData({
        "mailConfig.price": this.data.mailConfig.mailSendFee
      })
      // this.data.mailConfig.price = this.data.mailConfig.mailSendFee
    } else {
      this.setData({
        "mailConfig.price": 0
      })
      // this.data.mailConfig.price = 0
    }
    this.setData({
      "mailConfig.mailContent": productConfig.MailContent,
      "mailConfig.isCanMail": productConfig.IsCanMail
    })
    // this.data.mailConfig.mailContent = productConfig.MailContent // 0 行程单 1 服务发票
    // this.data.mailConfig.isCanMail = productConfig.IsCanMail

    var preDate = Util.parseDate(this.data.flightInfo.flyOffTime.split(' ')[0]), // 预计时间为起飞时间加6天
      date = preDate.getDate()
    preDate.setDate(date + 6)

    this.setData({
      "mailConfig.arriveDate": commonUtils.format(preDate, 'MM月dd日')
    })
    // this.data.mailConfig.arriveDate = commonUtils.format(preDate, 'MM月dd日')
  },
  calcPrice: function () {
    var i = 0,
      passengers = this.data.passengers,
      len = passengers.length,
      totalPrice,
      adultNum = 0,
      childrenNum = 0,
      adultPrice = this.data.price.adult, // 成人票价
      childrenPrice = this.data.price.children, // 儿童票价
      buildPrice = this.data.price.building, // 基建费
      fuelPrice = this.data.price.fuel, // 燃油费
      cFulePrice = this.data.price.cFuel, // 儿童燃油费
      accidentPrice = 0, // 航班意外险单价
      mailSendFee = 0



    for (; i < len; i++) {
      if (passengers[i].passengertype === '1') {
        adultNum++
      } else if (passengers[i].passengertype === '2') {
        childrenNum++
      }
    }

    if (this.data.accidentInsu.isBuy) {
      accidentPrice = parseInt(this.data.accidentInsu.price, 10)
    }

    if (this.data.isNeedMail && (adultNum + childrenNum) > 0) {
      mailSendFee = this.data.mailConfig.mailSendFee
    }

    totalPrice = (adultPrice + buildPrice + fuelPrice + accidentPrice) * adultNum + (childrenPrice + cFulePrice + accidentPrice) * childrenNum + mailSendFee

    this.setData({
      'totalPrice': totalPrice,
      'adultNum': adultNum,
      'childrenNum': childrenNum
    })

  },
  /**
   * 保险选择处理回调
   */
  insuSelect: function (e) {
    var insuType = e.target.dataset.type,
      isCheck = e.detail.value
    switch (insuType) {
      case "1":
      case "2":
        var isBuy = isCheck ? 1 : 0
        this.setData({
          'accidentInsu.isBuy': isBuy
        })
        this.calcPrice()
        this.traceEvent('航班意外险', '0^' + isBuy)
    }
  },
  /**
   * 报销凭证选择处理回调
   */
  mailSelect: function () {
    var self = this
    this.setData({
      'isNeedMail': !self.data.isNeedMail
    })
    this.calcPrice()
  },
  showRefundInfo: function () {
    this.setData({
      'show.refundInfo': true
    })
    this.traceEvent('价格及退改签说明', '价格及退改签说明')
  },
  hideDialogLayer: function () {
    this.setData({
      'show.refundInfo': false
    })
  },
  showDelBtn: function (e) {
    var index = e.currentTarget.dataset.index,
      self = this

    this.data.passengerActive[index] = !this.data.passengerActive[index]

    this.data.passengerActive.forEach(function (item, i) {
      if (i != index) {
        self.data.passengerActive[i] = false
      }
    })

    this.setData({
      'passengerActive': self.data.passengerActive
    })
  },
  /**
   * 添加乘机人
   */
  addPassenger: function () {
    var self = this

    App.flightGlobalData["selectPassenger"] = function (pass) {
      self.setData({
        'passengers': pass
      })
      self.calcPrice()
      wx.setStorageSync(Storage.STORAGE_KEY.selected_passengers, self.data.passengers)
      self.cache.isBack = 0

    }

    App.flightGlobalData["deletePassenger"] = function () {
      self.setData({
        'passengers': []
      })
      self.calcPrice()
      wx.setStorageSync(Storage.STORAGE_KEY.selected_passengers, self.data.passengers)
      self.cache.isBack = 0
    };

    this.traceEvent('添加乘机人', '添加乘机人')

    Util.showPage(Pages.contact_list, {
      flyDate: self.data.flightInfo.flyOffTime,
      mid: self.cache.tmpOrderData.Mid,
      maxTicket: self.data.flightInfo.cabins[0].ticketsNum,
      selectedList: self.data.passengers,
      deleteCallbackKey: "deletePassenger",
      selectCallbackKey: "selectPassenger"
    })
  },
  /**
   * 删除乘机人，只是从book2删除，并不是删除乘机人列表中的数据
   */
  delPassenger: function (e) {
    var index = e.currentTarget.dataset.index
    this.data.passengers.splice(index, 1) // 从选择的乘机人中删除
    this.data.passengerActive.splice(index, 1) // 乘机人删除按钮显示状态的数组中也需要删除
    this.setData({
      'passengers': this.data.passengers,
      'passengerActive': this.data.passengerActive
    })

    this.calcPrice()
    wx.setStorageSync(Storage.STORAGE_KEY.selected_passengers, this.data.passengers)

  },
  /**
   * 编辑乘机人
   */
  editPassenger: function (e) {
    var self = this,
      index = e.currentTarget.dataset.index
    App.flightGlobalData["savePassenger"] = function (pass) {
      self.data.passengers[index] = pass
      self.setData({
        'passengers': self.data.passengers
      })
      self.calcPrice()
      wx.setStorageSync(Storage.STORAGE_KEY.selected_passengers, self.data.passengers)
      self.cache.isBack = 0
    }

    Util.showPage(Pages.contact_add, {
      flyDate: self.data.flightInfo.flyOffTime,
      mid: self.cache.tmpOrderData.Mid,
      maxTicket: self.data.flightInfo.cabins[0].ticketsNum,
      passenger: self.data.passengers[index],
      flag: 'book2',
      saveCallbackKey: "savePassenger"
    })
  },
  /**
   * 显示航班信息弹窗
   */
  showFlightInfo: function () {
    this.setData({
      'show.flightInfo': true
    })
    this.traceEvent('航班信息详情', '航班信息详情')
  },
  /**
   * 关闭航班信息弹窗
   */
  closeFlightInfo: function () {
    this.setData({
      'show.flightInfo': false
    })
  },
  modalScrollConfirm: function () {
    this.setData({
      'modal.hiddenScroll': true
    })
  },
  /**
   * 显示金额明细
   */
  showPriceInfo: function () {
    var self = this
    if (this.data.totalPrice === 0) {
      return
    }
    this.setData({
      'show.priceInfo': !self.data.show.priceInfo
    })
  },
  showAccidentInfo: function () {
    var self = this
    this.setData({
      'modal.title': self.data.accidentInsu.name,
      'modal.hiddenScroll': false,
      'modal.message': self.data.accidentInsu.insClause
    })
  },
  /**
   * 展示公共弹窗
   */
  showAgreeInfo: function () {
    var that = this
    wx.request({
      url: Api.gd,
      success: function(res) {
        if(res.data) {
          that.setData({
            'modal.title': '关于民航旅客行李中携带锂电池规定的公告',
            'modal.hiddenScrollAgree': false,
            'modal.data': res.data
          })
        }
      }
    });
  },
  modalScrollAgreeConfirm: function () {
    this.setData({
      'modal.hiddenScrollAgree': true
    })
  },

  getMobileNum: function (e) {
    this.setData({
      'mobileNum': e.detail.value
    })
  },
  /**
   * 显示添加邮寄地址
   */
  showMailAdress: function () {
    var self = this
    App.flightGlobalData["addMailAdress"] = function (mail) {
      self.setData({
        'mailInfo': mail
      })
    }
    Util.showPage(Pages.mail_add, {
      addCallbackKey: 'addMailAdress',
      mailInfo: self.data.mailInfo
    })
  },
  /**
   * 下单前验证
   */
  validate: function () {
    // 验证乘机人个数等
    if (!this.validatePass()) {
      return false
    }
    // 验证手机号
    if (!this.validateMobile()) {
      return false
    }

    // 验证邮寄
    if (this.data.isNeedMail && !this.validateMail()) {
      return false
    }

    // 验证乘机人相关信息
    if (!this.validatePassInfo()) {
      return false
    }

    return true
  },
  validateMobile: function () {
    if (Util.trim(this.data.mobileNum) === '') {
      wx.showModal({
        title: '温馨提示',
        content: '请填写联系手机',
        showCancel: false
      });
      return false
    }
    if (!/^1[3,4,5,7,8]\d{9}$/i.test(this.data.mobileNum)) {
      wx.showModal({
        title: '温馨提示',
        content: '联系手机不合法！',
        showCancel: false
      })
      return false
    }
    return true
  },
  validatePass: function () {

    var peopleNum = this.data.passengers.length, // 乘机人
      adultNum = this.data.adultNum,
      childrenNum = this.data.childrenNum,
      babyNum = this.data.babyNum,
      cabins = this.data.flightInfo.cabins[0],
      isbt = cabins.isbt, // 是否卖儿童、婴儿票
      airCompanyCode = this.data.flightInfo.airCompanyCode,
      ticketsNum = cabins.ticketsNum;
    //乘机人必填
    if (peopleNum === 0) {
      wx.showModal({
        title: '温馨提示',
        content: '请添加乘机人！',
        showCancel: false
      })
      return false
    }

    // 乘机人最多9个
    if (peopleNum > 9) {
      wx.showModal({
        title: '温馨提示',
        content: '一张订单乘机人数不能大于9！',
        showCancel: false
      })
      return false
    }

    if (adultNum === 0) {
      wx.showModal({
        title: '温馨提示',
        content: '儿童不能单独乘机！请再添加成年乘机人',
        showCancel: false
      })
      return false
    }

    // 针对九元航司的特殊处理（一名成人只能携带一名儿童(儿童+婴儿)) --下单时验证
    if (airCompanyCode === 'AQ') {
      if ((childrenNum + babyNum) > adultNum) {
        wx.showModal({
          title: '温馨提示',
          content: '一名成人最多可带一名儿童乘机，请修改乘机人数',
          showCancel: false
        })
        return false
      }
    }
    //	舱位是非Y/F舱，余票验证，只跟成人匹配
    if (cabins.realRoomCode != "Y" && cabins.realRoomCode != "F" && (ticketsNum != 'A' && (adultNum > parseInt(ticketsNum, 10)))) {
      this.showError("该价格目前剩余票量为" + ticketsNum + "张，为更多乘客预订机票，请选择其他产品或分开预订。");
      return false
    }
    // 余票
    if ((cabins.realRoomCode == "Y" || cabins.realRoomCode == "F") && ticketsNum != 'A' && (peopleNum > parseInt(ticketsNum, 10))) {
      wx.showModal({
        title: '温馨提示',
        content: '该航班目前剩余票量为' + ticketsNum + '张,为更多乘客预订机票，请选择其他舱位或者分开预订',
        showCancel: false
      })
      return false
    }

    if (adultNum * 2 < childrenNum) {
      wx.showModal({
        title: '温馨提示',
        content: '一位成人只能陪同两位儿童乘机！请再添加成年乘机人',
        showCancel: false
      })
      return false
    }

    if (babyNum > 0 && isbt == 0) {
      wx.showModal({
        title: '温馨提示',
        content: '抱歉，此产品暂不支持婴儿预订，如有需求请选择其他产品',
        showCancel: false
      })
      return false
    }

    if ((childrenNum > 0 || babyNum > 0) && isbt == 2) {
      wx.showModal({
        title: '温馨提示',
        content: '抱歉，此产品暂不支持儿童、婴儿预订，如有需求请选择其他产品',
        showCancel: false
      })
      return false
    }

    if (childrenNum > 0 && isbt == 3) {
      wx.showModal({
        title: '温馨提示',
        content: '抱歉，此产品暂不支持儿童预订，如有需求请选择其他产品',
        showCancel: false
      })
      return false
    }

    return true

  },
  validatePassInfo: function () {
    var passengers = this.data.passengers,
      len = passengers.length,
      i = 0,
      isTibet = this.checkIsTibet(),
      ageType = {
        'AA': 0, // 18岁及以上
        'A': 0,  // 12 - 18
        'BB': 0, // 5 -12
        'B': 0,  // 2 - 5
        'C': 0   // 未满2周岁 -- 婴儿
      },
      flyOffDate = this.data.flightInfo.flyOffTime.split(' ')[0]

    for (; i < len; i++) {

      //验证证件号
      if (!passengers[i].cardno || /undefined/.test(passengers[i].cardno)) {
        wx.showModal({
          title: '温馨提示',
          content: '请确认所选乘客的证件号码是否为空',
          showCancel: false
        })
        return false;
      }

      // 验证非身份证的出生日期

      if (passengers[i].cardtype != "身份证") {
        if (!this.validateBirth(passengers[i].birthday)) {
          wx.showModal({
            title: '温馨提示',
            content: '请确认所选乘客的出生日期是否正确 例：1990-01-01',
            showCancel: false
          })
          return false;
        }

        // 入藏提示
        if (isTibet) {
          wx.showModal({
            title: '温馨提示',
            content: '预订入藏机票只能使用身份证或者户口簿，请更改证件信息',
            showCancel: false
          })
          return false;
        }
      }

      ageType[Util.isAgeType(passengers[i].cardtype, passengers[i].cardno, passengers[i].birthday, flyOffDate)]++

    }
    if (ageType["AA"] === 0) {
      if (ageType["B"] > 0) {
        wx.showModal({
          title: '温馨提示',
          content: '友情提醒您，儿童乘坐飞机需成人全程陪同',
          showCancel: false
        })
        return false;
      }

      if (this.cache.isCheckAgeType && ageType["BB"] != 0 && ageType["A"] >= ageType["BB"]) {
        // this.setData({
        //   'modal.hiddenAge': false
        // })
        var self = this
        wx.showModal({
          title: '温馨提示',
          content: '为了保证您的正常登机，未成年人带5-12岁儿童乘机，需在起飞前联系航空公司办理无成人陪同儿童服务',
          showCancel: true,
          confirmText: '继续提交',
          success: function (res) {
            if (res.confirm) {
              self.cache.isCheckAgeType = false
              self.submitOrder()
            }
          }
        })
        return false;
      }

      if (ageType["A"] < ageType["BB"]) {
        wx.showModal({
          title: '温馨提示',
          content: '儿童人数超出限制，一名未成年人最多只能带一名儿童',
          showCancel: false
        })
        return false;
      }

    }
    return true;
  },
 validateIdentifier: function (){
      var customerIdentifier = this.data.customerIdentifier,matchStr=/^[A-Za-z0-9]+$/;
      if(this.data.isCompanyTitle){
          if(customerIdentifier==""){
              return true
          }else{
              if(matchStr.test(customerIdentifier)){
                  var lens = customerIdentifier.length;
                  if((lens<15) || (lens>30)){
                      wx.showModal({
                          title: '温馨提示',
                          content: '纳税人识别号长度只限15-30位',
                          showCancel: false
                      })
                      return false
                  }else{
                      return true
                  }

              }else{
                  wx.showModal({
                      title: '温馨提示',
                      content: '纳税人识别号只能包含数字和字母',
                      showCancel: false
                  })
                  return false
              }
          }
      }else{
        return true;
      }

  },
  validateMail: function () {
    if (!this.data.mailInfo) {
      wx.showModal({
        title: '温馨提示',
        content: '若您需要报销凭证，请先填写配送地址',
        showCancel: false
      })
      return false
    }
    if (this.data.mailConfig.mailContent == 1 && !this.data.isShowInvoice){
        wx.showModal({
            title: '温馨提示',
            content: '请选择发票抬头类型',
            showCancel: false
        })
        return false;
    }
    if (this.data.mailConfig.mailContent == 1 && !this.data.invoiceTitle) {
        wx.showModal({
            title: '温馨提示',
            content: '请填写发票抬头',
            showCancel: false
        })
        return false
    }
    //纳税人识别号验证，字母与数字
    if (this.data.mailConfig.mailContent == 1  && !this.validateIdentifier()) {
        return false
    }
    return true
  },
  /**
   * 验证生日格式 （和以前稍不一样，从乘机人列表页拿来的乘机人生日为1989-10-01格式）
   * @param birthday
   * @returns {boolean}
   */
  validateBirth: function (birthday) {
    var isCorrect = true,
      year = birthday.substr(0, 4),
      month = birthday.substr(6, 2),
      day = birthday.substr(8, 2)

    if (!/^\d{4}$/i.test(year)) {
      isCorrect = false;
    } else if (year > new Date().getFullYear() || year <= 1900) {
      isCorrect = false;
    } else if (month > 12 || month < 1) {
      isCorrect = false;
    } else if (day > 31 || day < 1) {
      isCorrect = false;
    }
    return isCorrect;
  },
  checkIsTibet: function () {
    var arriveAirportCode = this.data.flightInfo.arriveAirportCode,
      apcode = ["LXA", "LZY", "BPX", "RKZ", "NGQ"], //拉萨、林芝、昌都、日喀则、阿里
      isToTibet = false

    for (var i = 0; i < apcode.length; i++) {
      if (apcode[i] == arriveAirportCode) {
        isToTibet = true
        break
      }
    }
    return isToTibet
  },
  handleBeforeSubmit: function () {
    var self = this,
      linkman = '',
      airCompanyCode = this.data.flightInfo.airCompanyCode,
      submitPassParam = [],
      passengers = [].concat(this.data.passengers)

    passengers.forEach(function (passenger) {

      //获取选取的第一个乘机人姓名，作为联系人

      if (!linkman && passenger.passengertype == '1') {
        linkman = passenger.name
      }

      if ((airCompanyCode == "9c" || airCompanyCode == "9C") && passenger.name.indexOf('/') > 0) {
        passenger.name = passenger.name.replace('/', ' ')
      }

      submitPassParam.push(passenger.passengertype + ';' + passenger.name + ';' + passenger.cardtype + '/' + passenger.cardno + '/' +
        passenger.birthday + "/" + passenger.sex
      )

    })

    self.cache.linkman = linkman
    self.cache.submitPass = submitPassParam
  },
  /**
   * 验证重复单
   */
  checkRepeat: function () {
    var self = this,
      param = {
        OrderSerialId: self.cache.tmpOrderData.SerialId,
        Plist: self.cache.submitPass,
        InsuranceCodeDesc: self.data.accidentInsu.isBuy ? self.data.accidentInsu.submitParam : '',
        FlightNo: self.data.flightInfo.flightNo,
        StartPort: self.data.flightInfo.originAirportCode,
        EndPort: self.data.flightInfo.arriveAirportCode,
        FlyOffDate: self.data.flightInfo.flyOffTime
      }
    if (!this.cache.loadingHidden) {
      return
    }
    this.cache.loadingHidden = false

    common.showToast('提交中...')
    wx.request({
      url: Api.checkRepeat,
      data: param,
      header: {
        "Content-Type": "application/json"
      },
      method: 'POST',
      success: function (res) {
        self.handleRepeatBackData(res.data);
      },
      fail: function () {

        self.cache.loadingHidden = true
        wx.hideToast();
        wx.showModal({
          title: '温馨提示',
          content: '抱歉，系统繁忙，请选择其他产品。',
          showCancel: false,
          confirmText: '重新查询',
          success: function () {
            wx.navigateBack()
          }
        })
      }
    })
  },
  formalOrder: function () {
    var self = this,
      param = {
        userOpenid: self.cache.openId,
        session_key: self.cache.sessionKey,
        unionid: self.cache.unionid,
        orderserialid: self.cache.tmpOrderData.SerialId,
        linkman: self.cache.linkman,
        linkmobile: self.data.mobileNum,
        insurancecodedesc: self.data.accidentInsu.isBuy ? self.data.accidentInsu.submitParam : '', //航班意外险
        plist: self.cache.submitPass,
        SendProvince: self.data.isNeedMail ? self.data.mailInfo.province : '', //免费联合邮寄传空值（联系人、地址、电话）
        SendCity: self.data.isNeedMail ? self.data.mailInfo.city : '',
        SendCounty: self.data.isNeedMail ? self.data.mailInfo.region : '',
        SendAddress: self.data.isNeedMail ? self.data.mailInfo.street : '',
        SendLinker: self.data.isNeedMail ? self.data.mailInfo.name : '',
        SendTele: self.data.isNeedMail ? self.data.mailInfo.mobile : '',
        IsNeedSend: self.data.isNeedMail ? "1" : "0",
        MailType: self.data.mailConfig.mailSendType, //邮寄类型，联合邮寄传空
        IsNeedReceipt: self.data.mailConfig.mailContent == 1 ? 1 : 0, //是否需要发票
        InvoiceType: self.data.isCompanyTitle ? 1 : 0, //发票类型,0:个人,1:公司 ,2:不区分个人和公司
        ReceiptTitle: self.data.invoiceTitle, //发票抬头
        FlyOffDate: self.data.flightInfo.flyOffTime,
        CustomerIdentifier: self.data.isCompanyTitle ? self.data.customerIdentifier : "" // 纳税人识别号
      }
    // 调下单接口
    wx.request({
      url: Api.submitOrder,
      data: param,
      header: {
        "Content-Type": "application/json"
      },
      method: 'POST',
      success: function (res) {
        self.orderAfterHandle(res.data)

      },
      fail: function () {
        // self.setData({
        //   'modal.hiddenFail': false,
        //   'modal.message': '抱歉，系统繁忙，请选择其他产品。'
        // })
        wx.showModal({
          title: '温馨提示',
          content: '抱歉，系统繁忙，请选择其他产品。',
          showCancel: false,
          confirmText: '重新查询',
          success: function () {
            wx.navigateBack()
          }
        })
      },
      complete: function () {
        // self.setData({
        //   'loadingHidden': true
        // })
        self.cache.loadingHidden = true
        wx.hideToast()
        // 保存手机号，邮寄等信息到本地
        self.storageToLocal()
      }
    })
  },
  /**
   * 下单
   */
  submitOrder: function () {

    if (!this.validate()) {
      return;
    }

    this.handleBeforeSubmit()

    this.checkRepeat()

    this.traceEvent('提交订单', '提交订单')

  },
  orderAfterHandle: function (data) {
    var state = parseInt(data.state, 10),
      self = this
    switch (state) {
      case 100:
        Util.replacePage(Pages.book3, { serialId: self.cache.tmpOrderData.SerialId })
        break

      // 重复单
      case 80:
        self.cache.requerydate = data.querydate
        wx.showModal({
          title: '温馨提示',
          content: data.error,
          showCancel: true,
          cancelText: '重新下单',
          confirmText: '查看订单',
          success: function (res) {
            if (res.confirm) {
              Util.replacePage(Pages.orderlist + '?type=2')
            } else {
              App.flightGlobalData['flight_requerydate'] = self.cache.requerydate
              wx.navigateBack()
            }
          }
        })
        break
      case 300:
        // Util.replacePage(data.aurl) 这个地方应该跳失败页
        wx.showModal({
          title: '温馨提示',
          content: data.error,
          showCancel: false
        })
        break
      case 50:
      case 600:
        // 重新查询 返回book1
        wx.showModal({
          title: '温馨提示',
          content: data.error,
          showCancel: false
        })
        break
      case 700:
        self.cache.url = Pages.book3 + '?serialId=' + self.cache.tmpOrderData.SerialId
        self.cache.priceChangeTxt = data.error
        wx.showModal({
          title: '温馨提示',
          content: data.error,
          showCancel: true,
          cancelText: '重新预订',
          confirmText: '继续支付',
          success: function (res) {
            if (res.confirm) {
              Util.replacePage(self.cache.url)
              self.traceEvent('价格变动-继续预订', self.cache.priceChangeTxt)
            } else {
              self.cancelOrder(self.cache.tmpOrderData.SerialId)
              self.traceEvent('价格变动-重新查询', self.cache.priceChangeTxt)
            }
          }
        })
        break
      case 84:
      case 85:
      case 400:
      case 50022:
        // 跳订单列表
        self.cache.url = Pages.orderlist + '?type=2'
        wx.showModal({
          title: '温馨提示',
          content: data.error,
          showCancel: false,
          confirmText: '查看订单',
          success: function () {
            Util.replacePage(self.cache.url)
          }
        })
        break
      case 1012043:
        wx.showModal({
          title: '温馨提示',
          content: '儿童姓名后无需输入CHD',
          showCancel: false
        })
        break
      default:
        wx.showModal({
          title: '温馨提示',
          content: data.error,
          showCancel: false
        })
    }
  },
  storageToLocal: function () {
    // 本地存储手机号
    wx.setStorageSync(LocalKey.moblie, this.data.mobileNum)

    // 本地存储邮寄信息
    if (this.data.isNeedMail) {
      wx.setStorageSync(LocalKey.mail, this.data.mailInfo)
    }

    // 本地存储发票抬头
    if (this.data.isNeedMail && this.data.mailConfig.mailContent == 1) {
      wx.setStorageSync(LocalKey.invoice, this.data.invoiceTitle)
    }

    // 本地存储公司发票抬头
    if (this.data.isNeedMail && this.data.mailConfig.mailContent == 1) {
        wx.setStorageSync(LocalKey.invoiceComp, this.data.invoiceCompTitle)
    }
    // 本地存储个人发票抬头
    if (this.data.isNeedMail && this.data.mailConfig.mailContent == 1) {
        wx.setStorageSync(LocalKey.invoicePer, this.data.invoicePerTitle)
    }
    // 本地存储发票类型
    if (this.data.isNeedMail && this.data.mailConfig.mailContent == 1) {
        wx.setStorageSync(LocalKey.invoiceType, this.data.isCompanyTitle)
    }
    // 本地存储纳税人识别号
    if (this.data.isNeedMail && this.data.mailConfig.mailContent == 1) {
        wx.setStorageSync(LocalKey.identifyNo, this.data.customerIdentifier)
    }
    // 本地存储显示发票填写部分
    if (this.data.isNeedMail && this.data.mailConfig.mailContent == 1) {
        wx.setStorageSync(LocalKey.showInvoice, this.data.isShowInvoice)
    }

  },
  hidePriceMask: function (e) {
    if (e.target.id == "priceMask") {
      this.setData({
        'show.priceInfo': false
      })
    }

  },
  getInvoice: function (e) {
    var id=e.target.dataset.id,invoiceTitle=e.detail.value;
    if(id=="1"){
      this.setData({
        'invoiceCompTitle': invoiceTitle
      })
    }else{
      this.setData({
        'invoicePerTitle': invoiceTitle
      })
    }
    this.setData({
      'invoiceTitle': invoiceTitle
    })
  },
  // 获取纳税人识别号或代码
  getIdentifier:function(e){
    var customerIdentifier=e.detail.value;
      this.setData({
      'customerIdentifier': customerIdentifier
    })
  },
  /**
   * 取消订单
   * @param {string} 订单流水号
   */
  cancelOrder: function (sid) {
    var self = this

    self.cache.loadingHidden = false
    common.showToast('提交中...');

    wx.request({
      url: Api.cancelOrder,
      data: {
        serialId: sid,
        sessionkey: wx.getStorageSync(storage.STORAGE_KEY.session_key),
        openId: wx.getStorageSync(storage.STORAGE_KEY.openId),
        unionid: wx.getStorageSync(storage.STORAGE_KEY.unionid)
      },
      method: 'GET',
      success: function (res) {
        if (res.data.State == '200') {
          wx.navigateBack()
        } else {
          self.cache.loadingHidden = true
          wx.hideToast()
          self.cache.url = Pages.orderdetails + '?orderSerialId=' + self.cache.tmpOrderData.SerialId
          wx.showModal({
            title: '温馨提示',
            content: '订单取消失败，请手动取消原有订单再次尝试下单',
            showCancel: false,
            confirmText: '知道了',
            success: function () {
              Util.replacePage(self.cache.url)
            }
          })
        }
      },
      fail: function () {
        self.cache.loadingHidden = true
        wx.hideToast()
        self.cache.url = Pages.orderdetails + '?orderSerialId=' + self.cache.tmpOrderData.SerialId
        wx.showModal({
          title: '温馨提示',
          content: '订单取消失败，请手动取消原有订单再次尝试下单',
          showCancel: false,
          confirmText: '知道了',
          success: function () {
            Util.replacePage(self.cache.url)
          }
        })
      }
    })
  },
  /**
   * 处理验证重复单接口返回的状态码做处理
   * @param data {object}
   */
  handleRepeatBackData: function (data) {
    var state = data.state,
      self = this

    switch (state) {
      case '100':
      case '300':
        self.formalOrder()
        break
      case '200':
        self.cache.loadingHidden = true
        wx.hideToast()
        wx.showModal({
          title: '温馨提示',
          content: '您已提交过相同订单，如您需要修改订单信息，请点击“重新下单”，原订单自动取消；点击“支付原订单”，继续支付原有订单',
          showCancel: true,
          confirmText: '去支付',
          cancelText: '重新下单',
          success: function (res) {
            if (res.confirm) {
              self.traceEvent('重复订单提示', '支付原订单')
              Util.replacePage(Pages.book3, {
                serialid: self.cache.tmpOrderData.SerialId
              })
            } else {
              this.cancelOrder(self.cache.tmpOrderData.SerialId)
              this.traceEvent('重复订单提示', '重新下单')
            }
          }
        })
        break
      case '400':
        self.cache.loadingHidden = true
        wx.hideToast()
        self.cache.url = Pages.orderlist + '?type=2'
        wx.showModal({
          title: '温馨提示',
          content: '您已经提交过相同订单，请到订单中心查看或处理',
          showCancel: false,
          confirmText: '查看订单',
          success: function () {
            Util.replacePage(self.cache.url)
          }
        })
        break
      case '500':
        self.cache.loadingHidden = true
        wx.hideToast()
        wx.showModal({
          title: '温馨提示',
          content: '您已提交过相同订单，原订单已过支付时间，如需预订请点击“重新下单”',
          showCancel: false,
          confirmText: '重新下单',
          success: function () {
            wx.navigateBack()
          }
        })
        break
      case '600':
        self.cache.loadingHidden = true
        wx.hideToast()
        wx.showModal({
          title: '温馨提示',
          content: '您已经购买过相同航班，请到订单中心查看已有航班',
          showCancel: false,
          confirmText: '查看航班',
          success: function () {
            Util.replacePage(Pages.orderlist + '?type=2')
          }
        })
        break
    }
  },
  traceEvent: function (label, value) {
    common.ev(Pages.book2, '2002', label, value, 'WXAPP 国内机票', 'WAbook2页面')
  },
  selectInvoiceType:function(e){
    var typeStr=e.target.dataset.type,title="",self=this;
    if(typeStr=="company"){
      self.setData({
         isCompanyTitle: true
      });
      title=self.data.invoiceCompTitle;
    }else{
      self.setData({
         isCompanyTitle: false
      });
      title=self.data.invoicePerTitle;
    }
    this.setData({
        isShowInvoice: true,
        invoiceTitle: title
      })
  }
})
