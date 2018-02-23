var app = getApp(),
    uroot = '../../../../util/',
    scroot = '../../scripts/',
    pages = require(scroot + "pages.js"),
    utils = require(scroot + "utils.js"),
    commonUtils = require(uroot + 'util.js'),
    api = require(uroot + "api.js"),
    calendar = require(uroot + 'calendar.js'),
    storage = require(scroot + "storage.js"),
    common = require(uroot + 'common.js');

Page({
    data: {
        selectedDate: "",
        selectedDateDisplay: "",
        // loading: true,
        flightList: [],
        todayPrice: '--',
        yesterdayPrice: '--',
        tomorrowPrice: '--',
        sortBy: 'price',
        sortType: 'asc',
        sortByPriceText: '价格',
        sortByTimeText: '时间',
        noData: false,
        fromCity: '',
        toCity: '',
        urlOptions: ''
    },
    searchParams: {},
    priceData: {},
    sortOption: {
        by: 'price',
        type: 'asc'
    },
    fromIndex: false,
    onLoad: function(options) {
        // 页面初始化 options为页面跳转所带来的参数
        // 获取参数
        this.searchParams = {
            arrt: options.bcDate,
            ac: options.acCode,
            oc: options.bcCode,
            acity: options.acName,
            ocity: options.bcName,
            ptype: 1,
            isMD5: 1
        };
        this.fromIndex = true;
        this.setData({
            fromCity: options.bcName,
            toCity: options.acName,
            urlOptions: options
        });
        this.setSelectedDate(utils.parseDate(options.bcDate));
        this.getPriceCalendar();
        if (!app.flightGlobalData.flight_requerydate) {
            this.searchFlights();
        }
    },
    //设置分享页面
    onShareAppMessage: function() {
        var urlOptions = common.formatOptions(this.data.urlOptions);
        return {
            title: '我正在用同程旅游预订机票',
            desc: this.data.urlOptions.acName + ' - ' + this.data.urlOptions.bcName + '   ' + this.data.urlOptions.bcDate,
            path: '/page/home/index/index?shareUrl='+encodeURIComponent('/page/flight/views/book1/book1?' + urlOptions)
        }
    },
    onReady: function() {
        // 页面渲染完成
        wx.setNavigationBarTitle({
            title: this.searchParams.ocity + '→' + this.searchParams.acity
        });
    },
    onShow: function() {
        // 页面显示
        common.page(pages.book1, '2002', this.fromIndex ? pages.index : '');
        this.fromIndex = false;
        wx.setNavigationBarTitle({
            title: this.searchParams.ocity + '→' + this.searchParams.acity
        });
        if (app.flightGlobalData.flight_requerydate) {
            this.setSelectedDate(utils.parseDate(app.flightGlobalData.flight_requerydate));
            this.getPriceCalendar();
            delete app.flightGlobalData.flight_requerydate;
            this.searchFlights();
        }
    },
    onHide: function() {
        // 页面隐藏
    },
    onUnload: function() {
        // 页面关闭
    },

    /**
     * 查询航班数据
     */
    searchFlights: function() {
        common.showToast();
        var that = this;
        wx.request({
            url: api.firstflightlist,
            method: 'POST',
            data: utils.clone(this.searchParams),
            success: function(res) {
                var data = res.data;
                if (data.ResponseCode != 0) {
                    that.setData({
                        noData: true
                    });
                    return;
                }
                var flightList = JSON.parse(data.Body).FlightInfoSimpleList;
                if (!flightList) {
                    that.setData({
                        noData: true
                    });
                    return;
                }
                that.sortFlight(flightList);
            },
            fail: function() {
                that.setData({
                    noData: true
                });
            },
            complete: function() {
                var t = setTimeout(function() {
                    clearTimeout(t)
                    wx.hideToast();
                }, 1000)
            }
        });
    },

    /**
     * 跳转到 Book 1.5
     * @param e
     */
    goBook1_5: function(e) {
        var index = e.currentTarget.dataset.index;
        var flight = this.data.flightList[index];

        wx.setStorage({
            key: storage.STORAGE_KEY.flight_selected,
            data: flight
        });

        //埋点
        var touch = e.touches[0];
        var data = [flight.flightNo, touch.clientX, touch.clientY, this.getSortIndex(), flight.lcp, 0, ''];
        common.ev(pages.book1, '2002', '选择航班', data.join('^'), 'WXAPP 国内机票', 'WAbook1页面');

        wx.navigateTo({ url: pages.book1_5 + '?ocity=' + this.searchParams.ocity + '&acity=' + this.searchParams.acity + "&wxrefid=" + (app.globalData.wxrefid || 0) });

    },
    getSortIndex: function() {
        if (this.sortOption.by == 'price') {
            if (this.sortOption.type == 'asc') {
                return 3;
            } else {
                return 4;
            }
        } else {
            if (this.sortOption.type == 'asc') {
                return 1;
            } else {
                return 2;
            }
        }
    },
    navigateBack: function() {
        common.ev(pages.book1, '2002', '重新搜索', '', 'WXAPP 国内机票', 'WAbook1页面');
        wx.navigateBack();
    },
    /**
     * 显示价格日历
     * @param e
     */
    showPriceCalendar: function(e) {
        var that = this;
        var now = new Date();
        var today = commonUtils.format(now, 'yyyy-MM-dd');
        now.setMonth(now.getMonth() + 6);
        var lastDay = commonUtils.format(now, 'yyyy-MM-dd');
        calendar.show({
            startDate: today,
            endDate: lastDay,
            selectDate: that.data.selectedDate,
            basePageUrl: '../../../../',
            dateData: utils.clone(this.priceData),
            soursePath: 'flight',
            startport: that.data.urlOptions.bcCode, //起飞机场三字码
            endport: that.data.urlOptions.acCode, //到达机场三字码
            callback: function(data) {
                that.setSelectedDate(utils.parseDate(data.date));
                that.showPrice();
                that.searchFlights();

                var price = that.priceData[data.date],
                    low = 0;
                if (typeof price == 'object') {
                    price = price.value;
                    low = 1;
                }
                var traceData = [data.date, low, price];
                common.ev(pages.book1, '2002', '价格日历', traceData.join('^'), 'WXAPP 国内机票', 'WAbook1页面');
            }
        });
    },
    /**
     * 获取价格日历数据
     */
    getPriceCalendar: function() {
        var that = this;
        var req = {
            bc: this.searchParams.ac, // 没错,就是反的
            ac: this.searchParams.oc,
            isWxProgram: 1
        };
        wx.request({
            url: api.pcalendar,
            data: req,
            method: 'POST',
            success: function(res) {
                if (res.statusCode != 200) return;
                if (res.data==undefined || (res.data && res.data.state != 100)) return;
                var lowerestPrice = res.data.lowerestPrice;
                res.data.hxList.forEach(function(p) {
                    if (p.price != 0) {
                        if (lowerestPrice == p.price) {
                            that.priceData[p.builddate] = {
                                value: "¥" + data.price,
                                style: 'color: red'
                            };
                        } else {
                            that.priceData[p.builddate] = "¥" + p.price;
                        }
                    }
                });
                that.showPrice();
            }
        });
    },
    /**
     * 前一天
     */
    previousDay: function() {
        var date = utils.parseDate(this.data.selectedDate);
        date.setDate(date.getDate() - 1);
        if (date < utils.initializationDate(new Date())) return;

        var data = [commonUtils.format(date, 'yyyy-MM-dd'), this.data.todayPrice == this.data.yesterdayPrice ? 0 : 1, this.data.yesterdayPrice];
        common.ev(pages.book1, '2002', '选择前一天', data.join('^'), 'WXAPP 国内机票', 'WAbook1页面');

        this.setSelectedDate(date);
        this.showPrice();
        this.searchFlights();
    },
    /**
     * 后一天
     */
    nextDay: function() {
        var date = utils.parseDate(this.data.selectedDate);
        date.setDate(date.getDate() + 1);
        var lastDay = new Date();
        lastDay.setMonth(lastDay.getMonth() + 6);
        if (date > utils.initializationDate(lastDay)) return;

        var data = [commonUtils.format(date, 'yyyy-MM-dd'), this.data.todayPrice == this.data.tomorrowPrice ? 0 : 1, this.data.tomorrowPrice];
        common.ev(pages.book1, '2002', '选择后一天', data.join('^'), 'WXAPP 国内机票', 'WAbook1页面');

        this.setSelectedDate(date);
        this.showPrice();
        this.searchFlights();

    },
    /**
     * 显示三天的最低价
     */
    showPrice: function() {
        var yesterday = utils.parseDate(this.data.selectedDate);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday = commonUtils.format(yesterday, 'yyyy-MM-dd');
        var tomorrow = utils.parseDate(this.data.selectedDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow = commonUtils.format(tomorrow, 'yyyy-MM-dd');
        var todayPrice = this.priceData[this.data.selectedDate];
        todayPrice = typeof todayPrice == 'object' ? todayPrice.value : todayPrice;
        var yesterdayPrice = this.priceData[yesterday];
        yesterdayPrice = typeof yesterdayPrice == 'object' ? yesterdayPrice.value : yesterdayPrice;
        var tomorrowPrice = this.priceData[tomorrow];
        tomorrowPrice = typeof tomorrowPrice == 'object' ? tomorrowPrice.value : tomorrowPrice;
        this.setData({
            todayPrice: todayPrice ? todayPrice : '--',
            yesterdayPrice: yesterdayPrice ? yesterdayPrice : '--',
            tomorrowPrice: tomorrowPrice ? tomorrowPrice : '--'
        });
    },
    /**
     * 航班排序
     * @param data
     * @returns {*}
     */
    sortFlight: function(data) {
        var that = this;
        data.sort(function(f1, f2) {
            if (that.sortOption.by == 'price') {
                return that.sortOption.type == 'asc' ? (f1.lcp - f2.lcp) : (f2.lcp - f1.lcp);
            }
            if (that.sortOption.by == 'time') {
                return that.sortOption.type == 'asc' ?
                    (utils.parseDate(f1.flyOffTime) - utils.parseDate(f2.flyOffTime)) :
                    (utils.parseDate(f2.flyOffTime) - utils.parseDate(f1.flyOffTime));
            }
        });
        this.sortDisplay();
        this.setData({
            flightList: data,
            noData: false
        });
    },
    /**
     * 组装排序显示
     */
    sortDisplay: function() {
        var priceText = '价格';
        var timeText = '时间';
        if (this.sortOption.by == 'price') {
            priceText = this.sortOption.type == 'asc' ? '低-高' : '高-低';
        } else if (this.sortOption.by == 'time') {
            timeText = this.sortOption.type == 'asc' ? '早-晚' : '晚-早';
        }
        this.setData({
            sortBy: this.sortOption.by,
            sortType: this.sortOption.type,
            sortByPriceText: priceText,
            sortByTimeText: timeText
        });
    },
    /**
     * 处理排序事件
     * @param e
     */
    sortEvent: function(e) {
        var sortBy = e.currentTarget.dataset.sortBy;
        if (sortBy == this.sortOption.by) {
            this.sortOption.type = this.sortOption.type == 'asc' ? 'desc' : 'asc';
        } else {
            this.sortOption.by = sortBy;
            this.sortOption.type = 'asc';
        }
        if (sortBy == 'price') {
            common.ev(pages.book1, '2002', '按价格排序', '', 'WXAPP 国内机票', 'WAbook1页面');
        } else {
            common.ev(pages.book1, '2002', '按时间排序', '', 'WXAPP 国内机票', 'WAbook1页面');
        }
        this.sortFlight(this.data.flightList);
    },
    /**
     * 设置当前选择的日期
     * @param date
     */
    setSelectedDate: function(date) {
        this.setData({
            selectedDateDisplay: commonUtils.format(date, 'yyyy-MM-dd ww').substr(5),
            selectedDate: commonUtils.format(date, 'yyyy-MM-dd')
        });
        this.searchParams.arrt = commonUtils.format(date, 'yyyy-MM-dd');
    }
});