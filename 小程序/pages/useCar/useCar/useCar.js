// pages/useCar/useCar/useCar.js
var indexJs = require('../index/index.js');
var app = getApp();
var isInitSelfShow = true;
let location = {
    lat:0,
    lon:0
}
// 年-月-日 时:分时间选择器插件
var datePicker = {
    createTimeList: function (start, end) {
        start = this.setTimeToZero(new Date(start));
        end = this.setTimeToZero(new Date(end));
        var list = [];
        while (start.getTime() <= end.getTime()) {
            list.push(this.dateToString(start));

            start.setDate(start.getDate() + 1)
        }
        return list
    },
    setTimeToZero: function (date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    },
    dateToString: function (date) {
        var str = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate(),
            strArr = str.split('/');
        strArr[1] = this.numRepairZero(strArr[1])
        strArr[2] = this.numRepairZero(strArr[2]);

        return strArr[1] + '月' + strArr[2] + '日'
    },
    numRepairZero: function (num) {
        num = num.toString();
        return num.length == 1 ? '0' + num : num;
    },
    setHour: function (hour) {
        var hourArr = [];
        var hour = hour || 0;
        for (var i = hour; i < 24; i++) {
            hourArr.push(this.numRepairZero(i));
        }
        return hourArr;
    },
    setMinute: function (minute) {
        var minuteArr = [];
        var minute = minute || 0;
        for (var j = minute; j < 60; j++) {
            minuteArr.push(this.numRepairZero(j));
        }
        return minuteArr;
    },
    initSetDateArr: function (obj) {
        var year = datePicker.createTimeList(obj.startDay, obj.endDay);
        var hour = this.setHour(new Date(obj.startDay).getHours());
        var minute = this.setMinute(new Date(obj.startDay).getMinutes());

        var arr = [year, hour, minute];
        return arr;
    }
};

// 初始化调用
var startDay = '2017/08/17 16:15';
var endDay = '2018/01/01 00:00';
var multiArray = datePicker.initSetDateArr({
    'startDay': startDay,
    'endDay': endDay
});

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tcFlag: 12,
        tabList: [{
            tcFlag: 12,
            name: '接机'
        }, {
            tcFlag: 13,
            name: '送机'
        }, {
            tcFlag: 14,
            name: '接站'
        }, {
            tcFlag: 15,
            name: '送站'
        }, {
            tcFlag: 11,
            name: '专快车'
        }],

        hasChoose: '',
        chooseSJTime: '',
        startAddress: {
            place: ''
        },
        multiArray: '',
        multiIndex: [0, 0, 0],
    },
    init: function () {
        this.setData({
            hasChoose: false,
            chooseSJTime: false,
            startAddress: {
                place: '您在哪上车'
            },
            multiArray: multiArray,
            multiIndex: [0, 0, 0]
        })
    },
    // 切换首页tab
    changeTab: function(e) {
        this.setData({
            tcFlag: e.currentTarget.dataset.tcflag
        })
        this.dd();
       location.lat = 1
       location.lon = 1
        // llat = 1;
    },
    dd: function() {
        console.log(this.data.tcFlag);
    },
    // 跳转到地址列表页
    jumpToAddress: function () {
        indexJs.DZ.jumpToAddress();
    },
    // 选择用车时间
    // bindMultiPickerColumnChange: function (e) {
    //     indexJs.Time.bindMultiPickerColumnChange(e);
    // },
    // bindMultiPickerChange: function (e) {
    //     indexJs.Time.bindMultiPickerChange(e);
    // },

    // 选择用车时间
    bindMultiPickerColumnChange: function (e) {

        console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
        var data = {
            multiArray: this.data.multiArray,
            multiIndex: this.data.multiIndex
        };
        data.multiIndex[e.detail.column] = e.detail.value;
        if (e.detail.column == 0) {
            if (data.multiIndex[0] == 0) {
                var hourArr = datePicker.setHour(new Date(startDay).getHours());
                var minuteArr = datePicker.setMinute(new Date(startDay).getMinutes());

                data.multiArray[1] = hourArr;
                data.multiArray[2] = minuteArr;
            } else {
                var hourArr = datePicker.setHour();
                var minuteArr = datePicker.setMinute();
                data.multiArray[1] = hourArr;
                data.multiArray[2] = minuteArr;
            }
        }
        this.setData(data);
    },
    bindMultiPickerChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            multiIndex: e.detail.value,
            chooseSJTime: true
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        Object.defineProperty(this.data,'tcFlag',{
            get(){
            },
            set(val){
                console.log('hhhhh' + val)

            }
        })
        Object.defineProperty(location, 'lon', {
            get() {

            },
            set(val) {
                console.log('aaaa'+val)
            }
        })
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
        console.log(indexJs.DZ)
        if (isInitSelfShow) return;
        var address = app.globalData.index.addressList;
        if (Object.keys(address).length > 0) {
            this.setData({
                startAddress: address,
                hasChoose: true
            });
            // 清队上次通信数据
            app.globalData.index.addressList = null;
        }
        console.log(this.data.startAddress)
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        isInitSelfShow = false;
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