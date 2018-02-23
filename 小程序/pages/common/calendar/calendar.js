//calenadr.js
//获取应用实例
var app = getApp();
var root = '../../../utils/'
var utils = require(root + 'util.js');
var pubCom = require(root + 'common.js');
var apiUrl = require(root + 'api.js');
var prices = {};

Page({
    festivals: {
        "2016-02-07": "除夕",
        "2016-02-08": "春节",
        "2016-02-22": "元宵",
        "2016-04-04": "清明",
        "2016-06-09": "端午",
        "2016-08-09": "七夕",
        "2016-09-15": "中秋",
        "2016-10-09": "重阳",
        // 2017
        "2017-01-27": "除夕",
        "2017-01-28": "春节",
        "2017-02-11": "元宵",
        "2017-04-04": "清明",
        "2017-05-30": "端午",
        "2017-08-28": "七夕",
        "2017-10-04": "中秋",
        "2017-10-28": "重阳",
        // 2018
        "2018-02-15": "除夕",
        "2018-02-16": "春节",
        "2018-03-02": "元宵",
        "2018-04-05": "清明",
        "2018-06-18": "端午",
        "2018-08-17": "七夕",
        "2018-09-24": "中秋",
        "2018-10-17": "重阳",
        // 2019
        "2019-02-04": "除夕",
        "2019-02-05": "春节",
        "2019-02-19": "元宵",
        "2019-04-05": "清明",
        "2019-06-07": "端午",
        "2019-08-07": "七夕",
        "2019-09-13": "中秋",
        "2019-10-07": "重阳",
        // 2020
        "2020-01-24": "除夕",
        "2020-01-25": "春节",
        "2020-02-08": "元宵",
        "2020-04-04": "清明",
        "2020-06-25": "端午",
        "2020-08-25": "七夕",
        "2020-10-01": "中秋",
        "2020-10-25": "重阳"
    },
    holidays: [
        '2017-01-01',
        '2017-01-02',
        '2017-01-27',
        '2017-01-28',
        '2017-01-29',
        '2017-01-30',
        '2017-01-31',
        '2017-02-01',
        '2017-02-02',
        '2017-04-02',
        '2017-04-03',
        '2017-04-04',
        '2017-04-29',
        '2017-04-30',
        '2017-05-01',
        '2017-05-28',
        '2017-05-29',
        '2017-05-30',
        '2017-10-01',
        '2017-10-02',
        '2017-10-03',
        '2017-10-04',
        '2017-10-05',
        '2017-10-06',
        '2017-10-07',
        '2017-10-08'
    ],
    data: {
        dates: [],
        dateGrow: 3,
        ajaxGrow: 3,
        dateExtend: false,
        tipsMessage: false,
        toastHidden: true,
        toastHidden1: true //保持显示的提示
    },
    callback: false,
    validRangeSecondTime: function (time, arr) {
        var pass = true;
        if (!arr) { return pass }
        time = this.ParseString(time).getTime();
        var startTime = arr[0] || false,
            endTime = arr[1] || false
        if (!startTime) {
            return pass
        }
        if (time < startTime.getTime() || (endTime && time > endTime.getTime())) {
            pass = false
        }
        return pass
    },
    updateRangeSecondTxt: function () {
        var arr = this.rangeSecondTime;
        if (arr) {
            var startTime = arr[0] || false,
                endTime = arr[1] || false

            if (typeof startTime === 'string') {
                arr[0] = startTime = this.ParseString(startTime)
                startTime = this.formateTimeYMD(startTime);
            }
            if (typeof endTime === 'string') {
                arr[1] = endTime = this.ParseString(endTime)
                endTime = this.formateTimeYMD(endTime);
            }

            this.updateData({
                lastEndDate2: arr[1].getTime()  //设置第二次选择可选的结束日期
            })

            if (arr[1]) {
                this.rangeSecondText = '请选择' + startTime + '到' + endTime + '之间的日期'
            } else {
                this.rangeSecondText = '请选择' + startTime + '之后的日期'
            }
        }
    },
    tipTimer: false,
    showTips: function (xxx) {
        if (this.tipTimer) {
            clearTimeout(this.tipTimer)
        }
        this.updateData({
            toastHidden: false,
            toastText: xxx
        });
        var that = this;
        this.tipTimer = setTimeout(function () {
            that.updateData({
                toastHidden: true
            });
        }, 1500)
    },
    showLoading: function (times) {  //loadings
        wx.showToast({ title: '数据加载中...', icon: 'loading', duration: times || 2000 })
    },
    clickHandler: function (event) {
        var datasets = event.currentTarget.dataset;
        if (datasets.extra) {
            try {
                datasets.extra = JSON.parse(datasets.extra)
            } catch (e) { }
        }
        if (datasets.disable === true || datasets.disable === 'true') {
            return
        }
        //_currentDate 保存去返程选择的数据
        if (typeof this._currentDate === "object" && this.wxData.range) {
            if (this._currentDate.length === 0) {
                this.updateData({
                    currentDate: false
                })
            }
            var setObj = {},
                currentDate = [], //区间选择active 时间数组
                currentDate_ = {}; //底部文案 

            if (this._currentDate.length === 1) { // 选择返程
                if (this.rangeSecondTime && !this.validRangeSecondTime(datasets.date, this.rangeSecondTime)) { //不符合第二次选择区间提示不可选
                    var errTips = this.rangeSecondText;
                    if (app.globalData.calendarParam.rangeUnPass) { //自定义文案
                        errTips = app.globalData[app.globalData.calendarParam.rangeUnPass](datasets.date) || errTips;
                    }
                    this.showTips(errTips)
                    return;
                }
                // debugger
                if (this.ParseString(this._currentDate[0].date).getTime() > this.ParseString(datasets.date).getTime()) { //小于第一次选择时间 更新为第一次选择时间
                    this._currentDate[0] = datasets
                } else {
                    this._currentDate.push(datasets);
                }

            } else if (this._currentDate.length === 0) { //选择去程
                setObj.toastText1 = this.wxData.rangeTips[0]
                this._currentDate.push(datasets);
                if (app.globalData.calendarParam.rangeFn) {
                    this.rangeSecondTime = (app.globalData[app.globalData.calendarParam.rangeFn](datasets));
                    this.updateRangeSecondTxt()
                }
            }

            if (this._currentDate.length === 1) {
                setObj.selectDate = datasets.date
                setObj.toastText1 = this.wxData.rangeTips[1]
            }
            for (var i = 0; i < this._currentDate.length; i++) { //更新去返程文案
                currentDate_[this._currentDate[i].times] = i;
                currentDate.push(this._currentDate[i].times)
            }

            setObj.currentDate_ = currentDate_;
            if (currentDate.length == 2) {
                setObj.currentDate = currentDate;
            }

            if (this._currentDate.length === 2) {
                if (this.callback) { return } // 延迟关闭页面 防止500msms 内再次点击 触发回调
                var passed = app.globalData[app.globalData.calendarParam.callback](this._currentDate);
                if (passed === false || typeof passed === 'string') {
                    this._currentDate = [this._currentDate[0]];
                    if (typeof passed === 'string') {
                        // this.showModal(passed)
                        pubCom.alert(passed)
                    }
                    return
                }
                setTimeout(function () {
                    if (app.globalData.calendarParam.goBack) {
                        app.globalData[app.globalData.calendarParam.goBack]();
                    } else {
                        wx.navigateBack()
                    }
                }, 500)
                this.callback = true;
            }
            this.updateData(setObj)
            return
        } else {
            this.updateData({
                selectDate: datasets.date,
                currentDate: false
            })
        }

        app.globalData[app.globalData.calendarParam.callback](datasets);
        if (app.globalData.calendarParam.goBack) {
            app.globalData[app.globalData.calendarParam.goBack]();
        } else {
            wx.navigateBack()
        }
    },
    // showModal: function (txt) {
    //     if (!txt) { return }
    //     wx.showModal({
    //         title: '温馨提示',
    //         showCancel: false,
    //         content: txt,

    //     })
    // },
    onLoad: function () {
        //onReady
        prices = {};
        var that = this,
            param = app.globalData.calendarParam;
        if (!param) { //没有数据的情况下 后退页面
            param = {};
        }
        this.wxData = this.data;
        var datas = utils.extend({
            //endDate: this.processUseDate(endDate)[0],
            //rangeText 连选文案
            //range 开启连选
        },
            param, {
                // today: initializationDate(new Date())
            }); //处理参数
        datas.today = datas.today || this.initializationDate(new Date());
        datas.startDate = datas.startDate || this.processUseDate(new Date(this.initializationDate(new Date()).setDate(1)))[0]

        this.buildRecentDay(datas.today)

        if (!datas.endDate) { //设置结束日期
            var endDate = this.ParseString(datas.startDate);
            endDate.setMonth(endDate.getMonth() + this.data.dateGrow); //dateGrow 默认3个月
            datas.endDate = this.processUseDate(endDate)[0]
        }
        if (datas.requestObj) { //设置请求实体
            this.requestObj = datas.requestObj
        }
        this.formateDate(datas); //格式化日期参数
        if (datas.range && datas.rangeTips) {
            datas.toastHidden1 = false;
            datas.toastText1 = datas.rangeTips[0]
        }
        this.updateNormalExtendData(datas.dateData); //设置底部文案
        datas.dateData = null;

        //设置真实的开始，结束时间
        this._startDate = this.ParseString(datas.startDate);
        this._endDate = this.ParseString(datas.endDate);

        //更新开始结束
        datas.startDate = this.processUseDate(this.setDateToOne(this._startDate))[0];
        datas.lastEndDate = this._endDate.getTime();//控制结束可选时间
        datas.endDate = this.processUseDate(this.setDateToEnd(this._endDate))[0];
        this.updateData(datas);
        if (datas.soursePath == 'flight'){
            this.flightPrice(datas, function (){
                that.buildCalendar();
            })
        }else{
            this.buildCalendar();
        }
        
    },
    updateData: function (data) {
        this.wxData = this.wxData || data;
        this.wxData = utils.extend(this.wxData, data)
        this.setData(data);
    },
    buildRecentDay: function (today) { //设置今天明天后天，今天不一定是当前时间的今天
        var today = this.ParseString(this.parseTimes(today)); //设置今天
        var tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1);
        var afterDay = new Date(today)
        afterDay.setDate(afterDay.getDate() + 2);

        this.today = today;
        this.tomorrow = tomorrow;
        this.afterDay = afterDay;

    },
    buildCalendar: function () { //构建日历
    
        if (!this.requestObj) {
            this.buildDateList = this.buildDate;
        } else {
            this.buildDateList = this.buildAjaxDateMonth;
        }
        this.buildDateList()
    },
    extend: function (o1, o2) { //
        o1 = utils.extend({}, o1);
        for (var i in o2) {
            if (Object.prototype.toString.call(o2[i]) === "[object Object]" && o1[i] && Object.prototype.toString.call(o1[i]) === "[object Object]") {
                o1[i] = this.extend(o1[i], o2[i])
            } else {
                o1[i] = o2[i]
            }
        }
        return o1
    },
    buildAjaxDateMonth: function () {
        this.buildDate();
        this.buildDateByAjax();
    },
    pipes: [],
    isLoadData: false,
    buildDateByAjax: function () {
        var robj = this.requestObj,
            that = this,
            nowDates = (that.lastAjaxBuildDate || that.processUseDate(that._startDate)[0]), //字符串
            lastAjaxBuildDate = this.ParseString(nowDates), //日期对象
            nowDates = nowDates.split('-');
        that.showLoading(100000)
        if (that.isLoadData) { //加载等待
            this.pipes.push(1);
            return;
        }
        that.isLoadData = true;
        var dj = {};
        dj[robj.grow || 'grow'] = that.data.ajaxGrow; //默认3个月
        dj[robj.year || 'year'] = nowDates[0];
        dj[robj.month || 'month'] = nowDates[1];
        wx.request({
            url: robj.url,
            data: utils.extend({}, robj.data, dj),
            success: function (res) {
                //res.data
                that.setDateExtend(res.data)
                lastAjaxBuildDate.setMonth(lastAjaxBuildDate.getMonth() + that.data.ajaxGrow)
                that.lastAjaxBuildDate = that.processUseDate(lastAjaxBuildDate)[0]
            },
            complete: function () {
                wx.hideToast()
                that.isLoadData = false;
                if (that.lastAjaxBuildDate && that.ParseString(that.lastAjaxBuildDate).getTime() < that.ParseString(that.data.lastBuildDate).getTime()) {
                    that.buildDateByAjax()
                }
            }
        })
    },
    updateNormalExtendData: function (data) {
        if (!data) { return };
        try {
            for (var key in data) {
                var item = data[key]
                if (typeof item !== 'object') {
                    data[key] = { value: data[key] };
                } else if (item.extra && Object.prototype.toString.call(item.extra) === "[object Object]") {
                    item.extra = JSON.stringify(item.extra)
                }
            }
            var lastData = this.wxData.dateExtend || {};
            lastData = this.extend(data, lastData);

            this.isEmptyObject(lastData) && (lastData = false);
            this.updateData({
                dateExtend: lastData
            })
        } catch (e) {

        }

    },
    isEmptyObject: function (e) {
        var t;
        for (t in e)
            return !1;
        return !0
    },
    setDateExtend: function (data) {
        var processData = this.requestObj.success;
        data = (processData && processData(data)) || data;

        this.updateNormalExtendData(data);

    },
    buildDate: function () { //创建日历面板月份
        var data1 = [].concat(this.wxData.dates),
            lastBuildDate = this.wxData.lastBuildDate && this.ParseString(this.wxData.lastBuildDate),
            data = this.createDateArr(lastBuildDate || false)

        data1 = this.extendArrWithOutSame(data1, data)
        if (!lastBuildDate) {
            lastBuildDate = this.ParseString(this.wxData.startDate)
        }
        lastBuildDate.setMonth(lastBuildDate.getMonth() + this.wxData.dateGrow); //更新lastBuildDate最新日期
        
        var datas = {
            dates: data1,
            lastBuildDate: this.processUseDate(lastBuildDate)[0]
        }
        this.updateData(datas)
    },
    extendArrWithOutSame: function (arr1, arr2) { //更新重复月份
        arr1 = [].concat(arr1);
        arr2 = [].concat(arr2);
        var newdata1 = [];
        for (var i = 0; i < arr2.length; i++) {
            newdata1.push(arr2[i].headDate);
        }
        for (var i = 0; i < arr1.length; i++) {
            var indexs = newdata1.indexOf(arr1[i].headDate)
            if (indexs !== -1) {
                arr1[i] = arr2[indexs]
                arr2[indexs] = null;
            }
        }

        for (var i = 0; i < arr2.length; i++) {
            if (arr2[i]) {
                arr1.push(arr2[i])
            }
        }
        return arr1
    },
    bottomEventHandle: function (event) {
        var lastBuildDate = this.ParseString(this.wxData.lastBuildDate),
            endDate = this.ParseString(this.wxData.endDate);

        if (!lastBuildDate || lastBuildDate.getTime() < endDate.getTime()) {
            this.buildDateList()
        }
    },
    flightPrice: function(flightOpt,fn){
        var today = new Date()
        var startTime = today.toLocaleDateString().replace(/\//g,'-');
        var endTime = new Date(today.setMonth(today.getMonth() + 6)).toLocaleDateString().replace(/\//g, '-');
        wx.request({
            url: apiUrl.flightPcalender,
            data:{
                startport: flightOpt.startport, //起飞机场三字码
                endport: flightOpt.endport, //到达机场三字码
                querybegdate: startTime, //开始日期
                queryenddate: endTime, //结束日期
                flat: 174 //渠道号  174：微信，175：touch    
            },
            success: function(data){
                data = data.data;
                if (!(data && data.fzpriceinfos && data.fzpriceinfos.length)){
                    typeof fn === 'function' && fn()
                    return false;
                }
                // data.fzpriceinfos.forEach(function (n) {
                //     n.price = n.price == '0' ? '' : n.price;
                // });
                data.fzpriceinfos.forEach(function(n) {
                    return prices[n.flydate] = n;
                });
                
                typeof fn === 'function' && fn()
                // this.setPriceList(data.fzpriceinfos);
            }
        })
    },
    createDateArr: function (startDate) { //创建日期数组
        if (startDate) {
            startDate = new Date(startDate);
        }
        startDate = startDate || this.ParseString(this.wxData.startDate);
        var data1 = [],
            buildEndDate = new Date(startDate),
            endDate = this._endDate;
        buildEndDate.setMonth(buildEndDate.getMonth() + this.wxData.dateGrow)
        if (buildEndDate.getTime() < endDate.getTime()) {
            endDate = buildEndDate;
        }
        
        while (startDate < endDate) {
            data1.push(this.createMonthArr(startDate));
            startDate.setMonth(startDate.getMonth() + 1)
        }
        return data1
    },
    createMonthArr: function (times) { //创建单个月份数据
        var monthDate = [],
            startDate_ = new Date(times), //读取开始月份
            topEmpty = startDate_.getDay(),//读取当前月份1号是星期几
            dateList = []; //数据集
        var cycle = this.data.cycle || [0,1,2,3,4,5,6]; //船票项目设置的每周可选周期，没有传每周周期的项目默认每周全选
        while (topEmpty > 0) { //月份开始前的日期置空
            dateList.push('')
            topEmpty--;
        }
        while (startDate_.getMonth() === times.getMonth()) { //当前月份日期循环添加
            var obj = {};
            var todayWeek = startDate_.getDay();  //当前月份每天的星期几（0--6）
            if (dateList.length !== 0 && dateList.length % 7 === 0) { //7天一行
                monthDate.push(dateList);
                dateList = [];
            }
            var startTimes = startDate_.getTime();
            //当前时间小于开始时间 或者大于结束时间 或者不在每周可选日期内 不可选(比如开始2016-09-11，结束2018-11-22，面板上会显示2016-09-01 ~ 2016-11-30日，不在区间内的会灰色不可选)
            
            if (startTimes < this._startDate.getTime() || startTimes > this._endDate.getTime() || cycle.indexOf(todayWeek)<0) {
              obj.disable = true
            }
            //设置数据
            
            obj.txt = obj.day = startDate_.getDate(); //获取当前日期为几号
            var festival = this.getFestival(startDate_);//判断是否是节日
            var dateStrs = this.processUseDate(startDate_);//获取字符串格式日期
            var bottomTxt = this.getRecentDay(startDate_); //今天明天 后tian 
            obj.date = dateStrs[0];
            obj.className = '';
            obj.times = startTimes;
            if(startDate_.getDay() == 6 || startDate_.getDay() == 0){
                obj.isWeekday = true
            }
            if (festival) {
                obj.festival = obj.txt = festival;
            }
            
            // var pricesDate = startDate_.toLocaleDateString().replace(/\//g,'-');
            
            if (prices[obj.date]){
                obj.bottomTxt = prices[obj.date].price == 0 ? '' : '¥'+prices[obj.date].price;
                obj.monthlowestprice = prices[obj.date].monthlowestprice;
            }
            if (bottomTxt) {
                obj.txt = bottomTxt;
                if (bottomTxt === '今天') {
                    obj.className += (obj.disable ? ' day-today-disable ' : ' day-today ');  //今天类名
                }
                if (bottomTxt == '后天' && festival) {
                    obj.txt = festival
                }
            }
            obj.holiday = this.getHolidays(dateStrs[0]); //假期
            if (this.wxData.dateExtend) {
                obj.extendTxt = this.wxData.dateExtend[dateStrs[0]] || false;
                // noExtendDataDisable && dateExtend[day.date] 
                if (this.wxData.noExtendDataDisable && !obj.extendTxt) {
                    obj.disable = true
                }
            }
            //dateExtend
            dateList.push(obj)
            //天数 + 1
            startDate_.setDate(startDate_.getDate() + 1);
        };
        if (dateList.length) { // 循环结束 检查是否还有未添加数据
            for (var i = dateList.length; i < 7; i++) {
                dateList.push('')
            }
            monthDate.push(dateList)
            dateList = null;
        }
        return {
            month: monthDate,
            headDate: times.getFullYear() + '年' + (times.getMonth() + 1) + '月'
        }
    },
    processUseDate: function (date) { //日期对象转换字符串
        if (!date) {
            return
        }
        var year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate()
        return [year + "-" + (month > 9 ? '' : '0') + month + "-" + (day > 9 ? '' : '0') + day, year + "-" + (month > 9 ? '' : '0') + month];
    },
    formateDate: function (data) { //格式化日期
        this.convertProp(data, ["startDate", "endDate"]);
        if (data.currentDate) {
            this._currentDate = [];
            data.currentDate_ = {};
            for (var i = 0; i < data.currentDate.length; i++) {
                if (typeof data.currentDate[i] === 'string') {
                    data.currentDate[i] = this.ParseString(data.currentDate[i]).getTime();
                } else if (data.currentDate[i] instanceof Date) {
                    data.currentDate[i] = this.initializationDate(data.currentDate[i]).getTime()
                }
                data.currentDate_[data.currentDate[i]] = i;
            }
            data.currentDate = data.currentDate.length > 1 ? data.currentDate : false;
        }
        if (data.selectDate) {
            // if(typeof data.selectDate === 'object'){
            //     for (var i = 0, len = data.selectDate; i < len; i++) {
            //         data.selectDate[i] = this.parseTimes(data.selectDate[i])
            //     }
            // }else 
            if (typeof data.selectDate === 'string') {
                data.selectDate = this.processUseDate(this.ParseString(data.selectDate))[0];
            } else if (data.selectDate instanceof Date) {
                data.selectDate = this.processUseDate(data.selectDate)[0];
            } else {
                data.selectDate = false
            }
        } else {
            data.selectDate = false;
        }
    },

    convertProp: function (obj, props) { //格式化日期,data 里面不能设置date属性值
        var prop;
        for (var i = 0, len = props.length; i < len; i++) {
            prop = props[i];
            obj[prop] = this.parseTimes(obj[prop])
        }
    },
    parseTimes: function (dates) {
        if (utils.isNotEmptyString(dates)) {
            dates = this.ParseString(dates) //geshihua
        }
        if (dates instanceof Date) {
            dates = this.processUseDate(dates)[0]
            // initializationDate(obj[prop]);
        } else {
            dates = undefined;
        }
        return dates;
    },
    ParseString: function (e) { //将字符串日期转换成日期对象
        if (!e) {
            return
        }
        var b = /(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?/i,
            a = b.exec(e),
            c = 0,
            d = null;
        if (a && a.length && e) {
            if (a.length > 5 && a[6]) {
                c = Date.parse(e.replace(b, "$2/$3/$1 $4:$5:$6"));
            } else {
                c = Date.parse(e.replace(b, "$2/$3/$1"));
            }
        } else {
            c = Date.parse(e);

        }
        if (!isNaN(c)) {
            d = new Date(c);
        }
        return d;
    },
    initializationDate: function (date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    },
    setDateToOne: function (date) {
        date = new Date(date);
        date.setDate(1);
        return date;
    },
    setDateToEnd: function (date) {
        date = new Date(date);
        date.setDate(1);
        date.setMonth(date.getMonth() + 1);
        return new Date(date.getTime() - 86400000);
    },
    getHolidays: function (date) {
        return this.holidays.indexOf(date) !== -1
    },
    getRecentDay: function (date) {
        if (date.getTime() === this.today.getTime()) {
            return '今天'
        } else if (date.getTime() === this.tomorrow.getTime()) {
            return '明天'
        } else if (date.getTime() === this.afterDay.getTime()) {
            return '后天'
        }
    },
    formateTimeYMD: function (date) {
        return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
    },
    getFestival: function (date) {
        var year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            datestring = this.processUseDate(date)[0],
            dateStr = this.festivals[datestring];
        if (dateStr) {
            return dateStr;
        }
        if (month === 1 && day === 1) {
            dateStr = "元旦";
        } else if (month === 2 && day === 14) {
            dateStr = "情人节";
        } else if (month === 5 && day === 1) {
            dateStr = "五一";
        } else if (month === 6 && day === 1) {
            dateStr = "儿童节";
        } else if (month === 10 && day === 1) {
            dateStr = "国庆";
        } else if (month === 12 && day === 25) {
            dateStr = "圣诞";
        } else {
            dateStr = false
        }
        return dateStr
    }
});
