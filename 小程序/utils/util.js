

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var slice = [].slice,class2type = {},toString = class2type.toString;
"Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach(function(name,i) {
  class2type[ "[object " + name + "]" ] = name.toLowerCase()
})

function type(obj) {
  return obj == null ? String(obj) :
    class2type[toString.call(obj)] || "object"
}

function isFunction(value) {
  return type(value) == "function"
}

function isObject(obj) {
  return type(obj) == "object"
}

function isPlainObject(obj) {
  return isObject(obj) && Object.getPrototypeOf(obj) == Object.prototype
}
var isArray = Array.isArray ||
  function (object) {
    return object instanceof Array
  }

//对象合并
function extend(target) {
  var deep, args = slice.call(arguments, 1)
  if (typeof target == 'boolean') {
    deep = target
    target = args.shift()
  }

  args.forEach(function (arg) {
    extended(target, arg, deep)
  })
  return target
}

//
function extended(target, source, deep) {
  for (var key in source){
    if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
      if (isPlainObject(source[key]) && !isPlainObject(target[key]))
        target[key] = {}
        
      if (isArray(source[key]) && !isArray(target[key]))
        target[key] = []
      extend(target[key], source[key], deep)
    } else if (source[key] !== undefined) target[key] = source[key]
  }
}

//判断是否为空字符串
function isNotEmptyString(str) {
  return typeof str === "string" && str !== "";
}

/**
 * 格式化时间
 * @param date Date 时间
 * @param format 格式化 "yyyy-MM-dd hh:mm:ss www"=format
 * @returns {string} 格式化后字符串
 */
function format(date, format) {
  var o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    "S": date.getMilliseconds()
  };

  var w = [
    ['日', '一', '二', '三', '四', '五', '六'],
    ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  ];


  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  if (/(w+)/.test(format)) {
    format = format.replace(RegExp.$1, w[RegExp.$1.length - 1][date.getDay()]);
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
}
function parseDate(date) {
    return new Date(Date.parse(date.replace(/-/g, "/")));
}

function addDay(n, date, formatStr) {
    var d = date || new Date();
    formatStr = formatStr || 'yyyy-MM-dd';
    if (typeof d === 'string' || typeof d === 'number') {
        d = new Date(date);
    }
    var day = 1000 * 60 * 60 * 24 * n;
    var newDay = new Date(d.getTime() + day);
    return {
        date: newDay,
        day: format(newDay,formatStr)
    }

};

module.exports = {
  extend: extend,
  isNotEmptyString: isNotEmptyString,
  format: format,
  parseDate: parseDate,
  addDay: addDay
}