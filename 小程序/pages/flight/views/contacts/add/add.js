var uroot = '../../../../../util/',
  scroot = '../../../scripts/',
  Utils = require(scroot + 'utils.js'),
  Pages = require(scroot + 'pages.js'),
  DataService = require(scroot + 'dataservice.js'),
  Api = require(uroot + 'api.js'),
  storage = require(scroot + 'storage.js'),
  trace = require(uroot + 'common.js'),
  commonUtils = require(uroot + 'util.js');

var app = getApp();
Page({
  data: {
    idTypes: ["身份证", "护照", "其它"],
    sexAry: ['女', '男'],
    flag: 'list',

    tmpId: 0,
    openId: '',
    passId: 0,
    mid: 0,
    flyDate: '',

    certIndex: 0,
    passName: '',
    certNo: '',
    sexIndex: 1,
    pickBirthday: '1980-01-01',//BUG 不能设置默认值 '1980-01-01',
    birthday: '',
    showOther: false,
    hideDialog: true,
    dialogData: [],
    dialogTitle: '',
    showToast: false,
    toastContent: '',
    saveCallbackKey: '',
    passengerList: []
  },
  isclick: false,
  onLoad: function (options) {
    var def = {
      openId: wx.getStorageSync(storage.STORAGE_KEY.openId),
      session_key: wx.getStorageSync(storage.STORAGE_KEY.session_key),
      unionid: wx.getStorageSync(storage.STORAGE_KEY.unionid),
      mid: options.mid,
      flyDate: options.flyDate,
      flag: options.flag,
      saveCallbackKey: options.saveCallbackKey || '',
      lastDate: commonUtils.format(new Date(), 'yyyy-MM-dd')
    };

    if (options.flag != 'book2') {
      def.maxTicket = options.maxTicket;
      def.deleteCallbackKey = options.deleteCallbackKey;
      def.selectCallbackKey = options.selectCallbackKey;

      def.passengerList = JSON.parse(options.passengerList || "[]");

      def.index = options.index || -1;
    }

    if (options.passenger) {
      var passInfo = JSON.parse(options.passenger);
      passInfo.tmpId && (def.tmpId = passInfo.tmpId);
      def.passId = passInfo.passid;
      def.certIndex = passInfo.cardtype == "身份证" ? 0 : passInfo.cardtype == "护照" ? 1 : 2;
      def.passName = passInfo.name;
      def.sexIndex = passInfo.sex == "1" ? 1 : 0;
      def.birthday = passInfo.birthday;

      def.pickBirthday = def.birthday;

      if (def.certIndex == 0) {
        def.certNo = passInfo.num.idCard;
      } else if (def.certIndex == 1) {
        def.certNo = passInfo.num.passport;
      } else {
        def.certNo = passInfo.num.other;
      }

      if (def.certIndex != 0) {
        def.showOther = true;
      }
    }

    this.setData(def);

    this.getPassengerList();
  },

  onShow: function () {
    var opage = Pages.book2;

    if (this.data.flag != 'book2') {
      opage = Pages.contact_list;
    }

    trace.page(Pages.contact_add, '2002', opage);
  },

  getPassengerList: function () {
    var that = this;
    if (that.data.flag == 'book2') {
      if (that.data.mid != 0) {
        DataService.requestData(Api.querylinker, {
          data: {
            mid: that.data.mid,
            openId: that.data.openId,
            session_key: that.data.session_key,
            unionid: that.data.unionid
          },
          callback: function (data) {
            if (data.res && data.res.data.state == "100") {
              that.setData({
                passengerList: data.res.data.data || []
              });
            }
          }
        });
      } else {
        that.setData({
          passengerList: wx.getStorageSync(storage.STORAGE_KEY.selected_passengers)
        });
      }
    }
  },
  showTips: function () {
    var that = this;
    wx.request({
      url: Api.name,
      success: function(res) {
        if(res.data) {
          that.setData({
            hideDialog: false,
            dialogTitle: '姓名填写说明',
            dialogData: res.data
          });
        }
      }
    })
  },
  hideTips: function () {
    this.setData({
      hideDialog: true
    });
  },
  showInfo: function () {
    var that = this;
    wx.request({
      url: Api.buy,
      success: function(res) {
        if(res.data) {
          that.setData({
            hideDialog: false,
            dialogTitle: '购票须知',
            dialogData: res.data
          });
        }
      }
    })

  },
  /**
   * 更新性别
   * @param event
   */
  bindSexChange: function (event) {
    this.setData({
      sexIndex: event.detail.value
    })
  },
  /**
   * 更新证件类型
   * @param event
   */
  bindCertTypeChange: function (event) {
    var showOther = false;
    if (event.detail.value != 0) {
      showOther = true;
    }

    this.setData({
      showOther: showOther,
      certIndex: event.detail.value
    });
  },

  passengerNameKeyDown: function (event) {
    var passName = Utils.trim(event.detail.value);

    this.setData({
      passName: passName
    });

    return passName;
  },
  /**
   * 更新乘机人
   * @param event
   */
  changePassengerName: function (event) {
    var that = this;
    var passName = Utils.trim(event.detail.value);

    var namestr = Utils.fliterPassengerNameInput(passName);

    if (namestr != "") {
      for (var i = 0; i < namestr.length; i++) {
        passName = passName.replace(namestr.substr(i, 1), "");
      }

      this.showToastLayer('乘机人姓名中含有特殊字符，已自动为您去除');
    }

    that.setData({
      passName: passName
    });

    return passName;
  },

  /**
   * 更新生日
   * @param event
   */
  bindDateChange: function (event) {
    this.setData({
      birthday: event.detail.value,
      pickBirthday: event.detail.value
    });
  },

  showToastLayer: function (msg, callback, delay) {
    //冒泡显示信息
    var that = this;
    that.setData({
      showToast: true,
      toastContent: msg
    });

    setTimeout(function () {
      that.setData({
        showToast: false
      });

      callback && callback();
    }, delay || 2000)
  },
  /**
   * 更新证件号码
   * @param event
   */
  changeIDCardNo: function (event) {
    var certNo = Utils.trim(event.detail.value);
    this.setData({
      certNo: certNo
    });

    return certNo;
  },

  /**
   * 保存乘机人
   * @returns {boolean}
   */
  savePassenger: function () {
    var personInfo = {
      tmpId: this.data.tmpId,
      name: this.data.passName,
      cardtype: this.data.idTypes[this.data.certIndex],
      cardno: this.data.certNo,
      passid: this.data.passId,
      mid: this.data.mid
    };

    if (personInfo.cardtype == "身份证") {
      personInfo.birthday = personInfo.cardno.substr(6, 8);
      personInfo.birthday = personInfo.birthday.substr(0, 4) + "-" + personInfo.birthday.substr(4, 2) + "-" + personInfo.birthday.substr(6, 2);
    } else {
      personInfo.birthday = this.data.birthday;
    }
    var check = this.checkUserInfo(personInfo.name, personInfo.cardtype, personInfo.cardno, personInfo.birthday);
    if (!check.result) {
      this.showError(check.msg);
    } else {
      if (this.data.flag == 'book2') {
        this.checkIsContainSpecial(personInfo);
      } else {
        this.beforeSavePassenger(personInfo);
      }

    }
  },

  /**
   * 验证乘机人信息
   * @param name
   * @param cardtype
   * @param cardno
   * @param birth
   * @returns {*}
   */
  checkUserInfo: function (name, cardtype, cardno, birth) {
    //验证乘机人姓名
    if (name === "") {
      return {
        result: false,
        msg: "请填写乘机人姓名"
      };
    } else if (name.indexOf("测试") > -1) {
      return {
        result: false,
        msg: "乘机人姓名不合法"
      }
    } else if (/[\u4e00-\u9fa5]/.test(name)) { //是否包含中文
      if (name.length < 2) {
        return {
          result: false,
          msg: "乘机人姓名不得小于两个字"
        };
      } else {
        var yw = -1;
        var zw = -1;

        for (var i = 0; i < name.length; i++) {
          if (yw == -1 && /^[a-zA-Z]+$/.test(name[i])) {
            yw = i;
          }

          if (/[\u4e00-\u9fa5]/.test(name[i])) {
            zw = i;
          }
        }

        if (yw != -1 && yw < zw) {
          return {
            result: false,
            msg: '拼音填写后无需再输入汉字，请用拼音代替，如：wang/yanjun'
          };
        }
      }
    } else if (!/^[a-zA-Z]+\/[a-zA-Z]+$/.test(name)) { //是否全英文
      return {
        result: false,
        msg: '请正确填写乘机人姓名！英文姓名中间需要/分割'
      };
    }
    if (cardno == "") {
      return {
        result: false,
        msg: "请输入证件号码"
      };
    } else if (cardtype == "身份证") {
      if (!this.cidInfo(cardno)) {
        return {
          result: false,
          msg: "身份证号码输入有误，请核实后重新输入"
        };
      }
    } else if (cardtype != "身份证") {
      if (!(/^[A-Za-z0-9]*$/.test(cardno))) {
        return {
          result: false,
          msg: "其他证件号码中只能包含数字和字母"
        };
      }
      var d = new Date();
      if (birth == "") {
        return {
          result: false,
          msg: "请输入出生日期"
        };
      }
      var year = birth.substr(0, 4);
      var month = birth.substr(5, 2);
      var day = birth.substr(8, 2);

      if (birth.substr(0, 4) < d.getFullYear() - 90) {//限制当前乘机人年份>=90岁
        return {
          result: false,
          msg: "错误提示：您添加的乘机人大于90岁，请联系航空公司购票。"
        };
      } else if (!this.checkBirth(year, month, day)) {
        return {
          result: false,
          msg: "请输入正确的出生日期 例：1990-01-01" + birth
        }
      }
    }
    if (this.checkPerType(cardtype, cardno, birth) == "3") {
      return {
        result: false,
        msg: "婴儿票需连同成人票一起购买，暂不支持手机预订，如有需求可致电4007-955-222"
      };
    }
    return {
      result: true
    };
  },
  /**
   * 验证身份证格式
   * @param val
   * @returns {boolean}
   */
  cidInfo: function (val) {
    var format = true,
      aCity = {
        11: "北京",
        12: "天津",
        13: "河北",
        14: "山西",
        15: "内蒙古",
        21: "辽宁",
        22: "吉林",
        23: "黑龙江",
        31: "上海",
        32: "江苏",
        33: "浙江",
        34: "安徽",
        35: "福建",
        36: "江西",
        37: "山东",
        41: "河南",
        42: "湖北",
        43: "湖南",
        44: "广东",
        45: "广西",
        46: "海南",
        50: "重庆",
        51: "四川",
        52: "贵州",
        53: "云南",
        54: "西藏",
        61: "陕西",
        62: "甘肃",
        63: "青海",
        64: "宁夏",
        65: "新疆",
        71: "台湾",
        81: "香港",
        82: "澳门",
        91: "国外"
      },
      iSum = 0;
    if (!/^\d{17}(\d|x)$/i.test(val)) {
      format = false;
    }
    var inputVal = val.replace(/x$/i, "a");
    if (aCity[parseInt(inputVal.substr(0, 2))] == null) {
      format = false;
    }
    for (var i = 17; i >= 0; i--) {
      iSum += (Math.pow(2, i) % 11) * parseInt(inputVal.charAt(17 - i), 11)
    }

    if (iSum % 11 != 1) {
      format = false;
    }

    return format;
  },
  /**
   * 验证出生日期格式
   * @param yy
   * @param mm
   * @param dd
   * @returns {boolean}
   */
  checkBirth: function (yy, mm, dd) {
    var t = true;
    yy = Number(yy);
    mm = Number(mm);
    dd = Number(dd);

    if (!/^\d{4}$/i.test(yy)) {
      t = false;
    } else if (yy > new Date().getFullYear() || yy <= 1900) {
      t = false;
    } else if (mm > 12 || mm < 1) {
      t = false;
    } else if (dd > 31 || dd < 1) {
      t = false;
    }
    return t;
  },
  /**
   * 验证乘机人类型
   * @param cardtype
   * @param cardno
   * @param birth
   * @returns {*}
   */
  checkPerType: function (cardtype, cardno, birth) {
    var year, month, day;
    if (cardtype == "身份证") {
      year = cardno.substr(6, 4);
      month = cardno.substr(10, 2);
      day = cardno.substr(12, 2);
    } else {
      if (birth.indexOf('-') == -1) {
        year = birth.substr(0, 4);
        month = birth.substr(4, 2);
        day = birth.substr(6, 2);
      } else {
        year = birth.substr(0, 4);
        month = birth.substr(5, 2);
        day = birth.substr(8, 2);
      }
    }
    var age = Utils.checkAge(year + month + day, this.data.flyDate);
    //1 成人 2 儿童 3 婴儿
    if (age >= 12) {
      return "1";
    } else if (age < 12 && age >= 2) {
      return "2";
    } else {
      return "3";
    }
  },


  /**
   * 判断选中用户是否有同名同姓 同拼音，同证件号
   */
  checkIsContainSpecial: function (personInfo) {
    var that = this;

    var selectedPassengers = wx.getStorageSync(storage.STORAGE_KEY.selected_passengers);
    var nameAll = personInfo.name;
    for (var i = 0; i < selectedPassengers.length; i++) {
      if (that.data.mid == 0) {
        if (personInfo.tmpId == selectedPassengers[i].tmpId) {
          continue;
        }
      } else {
        if (personInfo.passid == selectedPassengers[i].passid) {
          continue;
        }
      }
      nameAll += "|" + selectedPassengers[i].name;
    }

    var flightInfo = wx.getStorageSync(storage.STORAGE_KEY.flight_selected);
    var temporderInfo = wx.getStorageSync(storage.STORAGE_KEY.temporder_info);
    DataService.requestData(Api.checkiscontainspecial, {
      data: {
        passengerNames: nameAll,
        GoLineDetail: flightInfo.originAirportCode + "|" + flightInfo.arriveAirportCode + "|" + flightInfo.flightNo + "|" + flightInfo.flyOffTime,
        goSerialid: temporderInfo.SerialId
      },
      callback: function (data) {
        if (!data.error && data.res && data.res.data.state == "100") {
          that.beforeSavePassenger(personInfo);

        } else if (data.res && data.res.data.state == "200") {
          that.showError(data.res.data.error)
        } else {
          that.showError("两位姓名、拼音相同的乘客，不能在同1张订单中，请分2张订单提交。");
        }
      }
    });
  },
  /**
   * 保存前处理
   * @param personInfo
   * @returns {boolean}
   */
  beforeSavePassenger: function (personInfo) {
    var that = this;

    //添加判断证件号相同  证件类型相同 不能添加
    var allPassengerList = that.data.passengerList;
    for (var i = 0; i < allPassengerList.length; i++) {
      if (personInfo.tmpId) {
        if (personInfo.tmpId == allPassengerList[i].tmpId) {
          continue;
        }
      } else {
        if (personInfo.passid == allPassengerList[i].passid) {
          continue;
        }
      }
      // 证件号验证
      if (personInfo.cardno == allPassengerList[i].cardno && personInfo.cardtype == allPassengerList[i].cardtype) {
        that.showError("您填写的乘机人证件号码有重复，请重新填写");
        return;
      }
    }

    if (personInfo.cardtype == "身份证") {
      DataService.requestData(Api.checkmasterno, {
        data: {
          cardNo: personInfo.cardno
        },
        callback: function (data) {
          if (!data.error && data.res && data.res.data.state == "100") {
            personInfo.num = {
              idCard: personInfo.cardno
            };
            personInfo.sex = personInfo.cardno.substr(16, 1) % 2 == 0 ? "2" : "1";

            personInfo.passengertype = that.checkPerType(personInfo.cardtype, personInfo.cardno, personInfo.birthday);

            that.saveLinker(personInfo);
          } else {
            that.showError("身份证号码输入有误，请核实后重新输入")
          }
        }
      });
    } else {
      if (personInfo.cardtype == "护照") {
        personInfo.num = {
          passport: personInfo.cardno
        };
      } else {
        personInfo.num = {
          other: personInfo.cardno
        };
      }

      if (!personInfo.birthday) {
        that.showError("请输入乘机人出生日期");
        return false;
      }
      personInfo.sex = that.data.sexIndex == 1 ? "1" : "2";
      personInfo.passengertype = that.checkPerType(personInfo.cardtype, personInfo.cardno, personInfo.birthday);

      that.saveLinker(personInfo);
    }
  },

  /**
   * 调用接口保存乘机人
   * @param personInfo
   */
  saveLinker: function (personInfo) {
    var that = this;
    if (that.isclick) return;
    that.isclick = true;
    //新用户没有mid，需要在提交订单的时候保存
    if (that.data.mid == 0) {
      !personInfo.tmpId && (personInfo.tmpId = Math.random().toString().substr(2));
      !personInfo.passid && (personInfo.passid = 0);
      personInfo.checked = 1;

      that.showToastLayer('保存成功', function () {
        that.backPage(personInfo);
      }, 800);
      return;
    }

    //老用户调用接口
    DataService.requestData(Api.savelinker, {
      data: {
        LinkerId: personInfo.passid,
        mid: personInfo.mid,
        openid: that.data.openId,
        LinkerName: personInfo.name,
        LinkerType: personInfo.passengertype,
        Sex: personInfo.sex,
        Birthday: personInfo.birthday,
        CardType: personInfo.cardtype,
        CardNo: personInfo.cardno,
        session_key: that.data.session_key,
        unionid: that.data.unionid
      },
      callback: function (data) {
        if (!data.error && data.res && data.res.data.state == "100") {
          !personInfo.passid && (personInfo.passid = data.res.data.passId);
          personInfo.checked = 1;
          that.showToastLayer('保存成功', function () {
            that.backPage(personInfo);
          }, 800);
        } else {
          that.showError(data.res.data.data);
        }
      }
    });
  },

  /**
   * 返回上一级页面
   * @param personInfo
   */
  backPage: function (personInfo) {
    var that = this;

    var selectList = wx.getStorageSync(storage.STORAGE_KEY.selected_passengers);
    if (that.data.flag == 'edit' && selectList) {
      for (var i = 0; i < selectList.length; i++) {
        if (that.data.mid == 0) {
          if (personInfo.tmpId == selectList[i].tmpId) {
            selectList[i] = personInfo;
          }
        } else {
          if (personInfo.passid == selectList[i].passid) {
            selectList[i] = personInfo;
          }
        }
      }

      wx.setStorageSync(storage.STORAGE_KEY.selected_passengers, selectList);
    }

    if (that.data.flag == 'book2') {
      app.flightGlobalData[that.data.saveCallbackKey](personInfo);
      wx.navigateBack();
    } else {
      var list = that.data.passengerList;
      if (that.data.flag == 'add') {
        list.unshift(personInfo);
      } else if (that.data.flag == 'edit') {
        list[that.data.index] = personInfo;
      }

      Utils.replacePage(Pages.contact_list, {
        flyDate: that.data.flyDate,
        passengerList: list,
        maxTicket: that.data.maxTicket,
        mid: that.data.mid,
        deleteCallbackKey: that.data.deleteCallbackKey,
        selectCallbackKey: that.data.selectCallbackKey,
        flag: that.data.flag
      })
    }
  },

  /**
   * 显示错误弹框
   * @param msg
   */
  showError: function (msg) {
    wx.showModal({
      title: '温馨提示',
      content: msg,
      showCancel: false,
      confirmText: '知道了'
    })
  }
});
