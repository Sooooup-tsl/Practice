// pages/useCar/addressList/addressList.js
var app = getApp(),
    path = '../../../',
    trainpath = path,
    calendar = require(path + 'utils/calendar.js'),
    city = require(path + 'utils/city.js'),
    apiUrl = require(path + 'utils/api.js'),
    util = require(path + 'utils/util.js'),
    isOpenCity = false,
    hotCitys = [{
        title: '热门城市',
        list: [{
            Name: '苏州',
            ID: '226',
            QPY: 'suzhou',
            png: 'sz'
        }, {
            Name: '上海',
            ID: '22',
            QPY: 'shanghai',
            png: 'sh'
        }, {
            Name: '无锡',
            ID: '26',
            QPY: 'wuxi',
            png: 'wx'
        }, {
            Name: '南京',
            ID: '226',
            QPY: 'suzhou',
            png: 'sz'
        }, {
            Name: '常州',
            ID: '22',
            QPY: 'shanghai',
            png: 'sh'
        }, {
            Name: '北京',
            ID: '26',
            QPY: 'wuxi',
            png: 'wx'
        }]
    }];
var date = new Date();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        localAdr: {
            place: '同程大厦',
            address: '育新路188号'
        },
        nearAdrList: [{
            place: '同程大厦附近',
            address: '育新路188号'
        }, {
            place: '创意产业园',
            address: '育新路188号'
        }],
        fromCity: '苏州'
    },
    init: function() {
        var that = this,
            pName = 'train',
            //初始化城市
            fromcity = wx.getStorageSync(pName + '_fromCity') || '上海',
            toCity = wx.getStorageSync(pName + '_toCity') || '北京',
            //初始化日期
            storeDate = wx.getStorageSync(pName + '_date'),
            date = new Date(),
            today = util.format(date, 'yyyy-MM-dd'),
            //date = d,
            //day = date.getDay(),
            diff = '';


        if (storeDate) {
            if (storeDate < today) {
                diff = '今天';
            } else {
                diff = that.dateDiff(storeDate, today);
                //date = Date.parseString(storeDate);
                date = util.parseDate(storeDate);
            }
        } else {
            diff = '今天';
        }
        this.getLocation();
        this.setData({
            fromCity: fromcity,
            toCity: toCity,
            showDate: util.format(date, 'MM月dd日'),
            dateStr: util.format(date, 'yyyy-MM-dd'),
            diff: diff,
            week: util.format(date, 'ww')
        })
    },
    // 获取定位
    getLocation: function() {
        wx.getLocation({
            type: 'gcj02', //返回可以用于wx.openLocation的经纬度
            success: function (res) {
                var latitude = res.latitude
                var longitude = res.longitude
                console.log(res)
            }
        })
    }, 
    // 点击获取附近地址
    getAddress: function (e) {
        console.log(e.currentTarget.dataset.adr);
        app.globalData.index.addressList = e.currentTarget.dataset.adr;
        wx.navigateBack({
            delta: 1
        })
    },
    // 点击切换城市
    fromCityHandlerTimer: false,
    fromCityHandler: function() {
        if (isOpenCity) {
            return;
        }
        isOpenCity = true;
        var that = this,
            dataTrain = {
                para: {
                    "headtime": Date.parse(new Date()),
                    "memberId": "",
                    "platId": 432,
                    "requestType": 3,
                    "headct": 0,
                    "headus": 3,
                    "headver": "2.14.0.2",
                    'allCity': 0
                }
            };

        this.fromCityHandlerTimer && clearTimeout(this.fromCityHandlerTimer)

        this.fromCityHandlerTimer = setTimeout(function () {
            city.show({
                basePageUrl: trainpath,
                locationSuccess: function (data, locationData, cb) {
                    cb([])
                },
                cityId: 'ID',
                cityName: 'Name',
                py: 'QPY',
                jp: 'png',
                soursePath: 'train',
                matchItem: ['Name', 'QPY', 'png'],
                customItems: hotCitys,
                requestObj: { //接口获取数据
                    url: apiUrl.getCityListByLetter,
                    data: dataTrain,
                    success: function (data) {
                        // if (data.data.TrainStation.StationList) {
                        //   data.data.TrainStation.StationList.sort(function(a, b) {
                        //         return (~~a.ID - ~~b.ID)
                        //     })
                        // }
                        return data.data.TrainStation.StationList
                    }
                },
                searchObj: {
                    url: apiUrl.getCityListByLetter,
                    data: {
                        para: {
                            "headtime": Date.parse(new Date()),
                            "memberId": "",
                            "platId": 432,
                            "requestType": 3,
                            "headct": 0,
                            "headus": 3,
                            "headver": "2.14.0.2",
                            'allCity': 0
                        }
                    },
                    key: 'cityName',
                    success: function (data) {
                        // if (data.data.TrainStation.StationList) {
                        //   data.data.TrainStation.StationList.sort(function(a, b) {
                        //           return (~~a.ID - ~~b.ID)
                        //       })
                        //   }
                        return data.data.TrainStation.StationList
                    }
                },
                callback: function (data) {
                    that.setData({
                        fromCity: data.Name
                    });
                }
            })
            setTimeout(function () { isOpenCity = false; }, 1000)
        }, 500)
    },

    dateAdd: function (num, date) {
        date.setDate(date.getDate() + num);
        return date;
    },
    dateDiff: function (sDate1, sDate2) { //sDate1和sDate2是yyyy-MM-dd格式
        var aDate, oDate1, oDate2, iDays, str;
        aDate = sDate1.split("-");
        oDate1 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
        aDate = sDate2.split("-");
        oDate2 = new Date(aDate[0], aDate[1] - 1, aDate[2]);

        iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);
        if ((oDate1 - oDate2) >= 0) {
            if (iDays === 0) {
                str = '今天';
            } else if (iDays === 1) {
                str = '明天';
            } else if (iDays === 2) {
                str = '后天';
            } else {
                str = '';
            }
        } else {
            str = '';
        }
        return str;
    },
    //日期选择
    calendarHandler: function (event) {
        var that = this,
            d = new Date(),
            //today = d.format('yyyy-MM-dd'),
            today = util.format(d, 'yyyy-MM-dd'),
            endDate = util.format(that.dateAdd(29, d), 'yyyy-MM-dd'),
            dates = today.split('-');

        calendar.show({
            startDate: today,
            endDate: endDate,
            selectDate: that.data.dateStr,
            basePageUrl: trainpath,
            tipsMessage: '今天是' + dates[1] + '月' + dates[2] + '号',
            callback: function (data) {
                //var date = Date.parseString(data.date),
                var date = util.parseDate(data.date),
                    diff = that.dateDiff(data.date, today),
                    //day = date.getDay(),
                    showdate = util.format(date, 'MM月dd日');

                that.setData({
                    dateStr: data.date,
                    showDate: showdate,
                    //week: Date.getWeek(day),
                    week: util.format(date, 'ww'),
                    diff: diff
                })

            }
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.init();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})