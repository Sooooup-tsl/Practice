/**
 * Created by kroll on 2016/9/27.
 */
var commonUtil = require('../../../util/util.js');

var utils = {
  /**
   * 去除空格
   * @param str
   * @returns {void|XML|string}
   */
  trim: function (str) {
    return str.replace(/\s+/g, "");
  },
  /**
   * 获取日期昵称
   * @param date  日期 "2016-11-11"
   * @returns {string} "今天" | "明天" | "后天" | "周.."
   */
  nearDay: function (date) {
    var nowDate = new Date();

    switch (date) {
      case commonUtil.format(nowDate, 'yyyy-MM-dd'):
        return "今天";
        break;
      case this.formatDate(nowDate, 1):
        return "明天";
        break;
      case this.formatDate(nowDate, 2):
        return "后天";
        break;
      default:
        return "周" + "日一二三四五六".split("")[this.parseDate(date).getDay()];
    }
  },

  /**
   * 格式化日期
   * @param date Date 日期
   * @param t  添加天数
   * @returns {*|string}  yyyy-MM-dd 日期字符串
   */
  formatDate: function (date, t) {
    return commonUtil.format(new Date(date.valueOf() + t * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
  },

  /**
   * 字符串日期获取时间
   * @param date  yyyy-MM-dd 日期字符串
   * @returns {Date} 时间
   */
  parseDate: function (date) {
    return new Date(Date.parse(date.replace(/-/g, "/")));
  },

  /**
   * 格式化时间
   * @param date Date 时间
   * @param format 格式化 "yyyy-MM-dd hh:mm:ss www"
   * @returns {string} 格式化后字符串
   */
  // format: function (date, format) {
  //     var o = {
  //         "M+": date.getMonth() + 1,
  //         "d+": date.getDate(),
  //         "h+": date.getHours(),
  //         "m+": date.getMinutes(),
  //         "s+": date.getSeconds(),
  //         "q+": Math.floor((date.getMonth() + 3) / 3),
  //         "S": date.getMilliseconds()
  //     };
  //
  //     var w = [['日', '一', '二', '三', '四', '五', '六'],
  //         ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  //         ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']];
  //
  //
  //     if (/(y+)/.test(format)) {
  //         format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  //     }
  //
  //     if (/(w+)/.test(format)) {
  //         format = format.replace(RegExp.$1, w[RegExp.$1.length - 1][date.getDay()]);
  //     }
  //
  //     for (var k in o) {
  //         if (new RegExp("(" + k + ")").test(format)) {
  //             format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
  //         }
  //     }
  //     return format;
  // },

  /**
   * 显示新页面
   * @param url  新页面相对路径
   * @param params json参数
   */
  showPage: function (url, params) {
    wx.navigateTo({
      url: this.buildUrl(url, params)
    });
  },

  /**
   * 替换页面
   * @param url 新页面相对路径
   * @param params json参数
   */
  replacePage: function (url, params) {
    wx.redirectTo({
      url: this.buildUrl(url, params)
    });
  },


  /**
   * 构建url
   * @param url 跳转url地址
   * @param params json参数
   * @returns {*} 完整url地址
   */
  buildUrl: function (url, params) {
    if (params) {
      if (url.indexOf('?') == -1) {
        url += "?_=" + Math.random()
      }

      for (var key in params) {
        var value = params[key];
        if (typeof value == 'object') {
          value = JSON.stringify(value);
        }
        url += "&" + key + "=" + value;
      }
    }
    return url;
  },

  /**
   * 初始化日期,去掉时间信息
   * @param date
   * @returns {*}
   */
  initializationDate: function (date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  },

  /**
   * 克隆对象方法
   * @param obj
   * @returns {*}
   */
  clone: function (obj) {
    var o;
    if (typeof obj == "object") {
      if (obj === null) {
        o = null;
      } else {
        if (obj instanceof Array) {
          o = [];
          for (var i = 0, len = obj.length; i < len; i++) {
            o.push(this.clone(obj[i]));
          }
        } else {
          o = {};
          for (var j in obj) {
            o[j] = this.clone(obj[j]);
          }
        }
      }
    } else {
      o = obj;
    }
    return o;
  },
  /**
   * 计算年龄
   * @param date
   * @param flyDate
   * @returns {number}
   */
  checkAge: function (date, flyDate) {
    var yy = date.substr(0, 4),
      mm = date.substr(4, 2),
      dd = date.substr(6, 2),
      main = "valid";

    if (date.indexOf('-1') != -1) {
      yy = date.substr(0, 4);
      mm = date.substr(5, 2);
      dd = date.substr(8, 2);
    }

    if ((mm < 1) || (mm > 12) || (dd < 1) || (dd > 31) || (yy < 1) || (mm == "") || (dd == "") || (yy == "")) main = "Invalid";
    else if (((mm == 4) || (mm == 6) || (mm == 9) || (mm == 11)) && (dd > 30)) main = "Invalid";
    else if (mm == 2) {
      if (dd > 29) {
        main = "Invalid";
      } else if ((dd > 28) && (!this.lyear(yy))) {
        main = "Invalid";
      }
    } else if ((yy > 9999) || (yy < 0)) main = "Invalid";

    if (main == "valid") {
      var days = new Date(Date.parse(flyDate.replace(/-/g, "/")));

      var gdate = days.getDate();
      var gmonth = days.getMonth();
      var gyear = days.getFullYear();
      var age = gyear - yy;
      if ((mm == (gmonth + 1)) && (dd <= parseInt(gdate))) {
        age = age;
      } else {
        if (mm <= (gmonth)) {
          age = age;
        } else {
          age = age - 1;
        }
      }
      if (age == 0) age = age;
      return age;
    }
  },

  /**
   * 乘机人新增成人判断
   * @param cardtype
   * @param cardno
   * @param birth
   * @param flyDate
   * @returns {*}
   */
  isAgeType: function (cardtype, cardno, birth, flyDate) {
    var year = ""
      , month = ""
      , day = "";
    if (cardtype == "身份证") {
      year = cardno.substr(6, 4);
      month = cardno.substr(10, 2);
      day = cardno.substr(12, 2)
    } else {
      if (birth.indexOf('-') != -1) {
        year = birth.substr(0, 4);
        month = birth.substr(5, 2);
        day = birth.substr(8, 2)
      } else {
        year = birth.substr(0, 4);
        month = birth.substr(4, 2);
        day = birth.substr(6, 2);
      }
    }
    var age = this.checkAge(year + month + day, flyDate);

    if (age >= 18) {
      return "AA"; //完全成人
    } else if (age < 18 && age >= 12) {
      return "A"; //成人
    } else if (age < 12 && age >= 5) {
      return "BB"; //儿童1
    } else if (age < 5 && age >= 2) {
      return "B"; //儿童2
    } else {
      return "C"; //婴儿
    }
  },

  checkDiffDays: function (cardtype, cardno, birth, flyDate) {
    var year = "", month = "", day = "", d;
    if (cardtype == "身份证") {
      year = cardno.substr(6, 4);
      month = cardno.substr(10, 2);
      day = cardno.substr(12, 2);
    } else {
      if(birth.indexOf('-') == -1){
        year = birth.substr(0, 4);
        month = birth.substr(4, 2);
        day = birth.substr(6, 2);
      }else{
        year = birth.substr(0, 4);
        month = birth.substr(5, 2);
        day = birth.substr(8, 2);
      }
    }
    d = year + month + day;
    var dtime = year + "/" + month + "/" + day;
    var yy = d.substr(0, 4),
      mm = d.substr(4, 2),
      dd = d.substr(6, 2),
      main = "valid",
      diffDays,
      days;
    if ((mm < 1) || (mm > 12) || (dd < 1) || (dd > 31) || (yy < 1) || (mm == "") || (dd == "") || (yy == "")) {
      main = "Invalid";
    }
    else if (((mm == 4) || (mm == 6) || (mm == 9) || (mm == 11)) && (dd > 30)) {
      main = "Invalid";
    }
    else if (mm == 2) {
      if (dd > 29) {
        main = "Invalid";
      } else if ((dd > 28) && (!this.lyear(yy))) {
        main = "Invalid";
      }
    } else if ((yy > 9999) || (yy < 0)) main = "Invalid";
    else main = main;
    if (main == "valid") {
      days = new Date(Date.parse(flyDate.replace(/-/g, "/")));
      var gyear = days.getFullYear(),
        diffDays = parseInt(Math.abs(days - new Date(Date.parse(dtime + " 00:00:00"))) / 1000 / 60 / 60 / 24);
      return diffDays;
    }
  },
  /**
   * 判断闰年
   * @param yy
   * @returns {boolean}
   */
  lyear: function (yy) {
    if (((yy % 4) == 0) && ((yy % 100) != 0) || ((yy % 400) == 0)) {
      return true;
    } else {
      return false;
    }
  },
  /**
   * 过滤乘机人姓名
   * @param name
   * @returns {string}
   */
  fliterPassengerNameInput: function (name) {
    //验证乘机人姓名里面是否带特殊的字符
    var namestr = "";
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>?~！@#￥……&*（）—|{}【】‘；：”“'。，、？]");
    for (var i = 0; i < name.length; i++) {
      var nstr = name.substr(i, 1);
      if (nstr.match(/^[\u4E00-\u9FA5A-Za-z\/]+$/) == null && nstr.match(/\s/) == null) {
        namestr += nstr;
      }
      if (nstr.match(pattern)) {
        namestr += nstr;
      }
    }
    return namestr;
  },
};

module.exports = utils;