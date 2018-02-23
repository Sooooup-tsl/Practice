var steps = [[
    {
        "distance": 1277,
        "duration": 1021,
        "instructions": "步行1277米",
        "path": "116.94460025367,36.63355502879;116.94460025367,36.63355502879;116.94469906728,36.633236457119;116.94454635534,36.630839886738;116.9444744909,36.627690201059;116.94443855868,36.627552625622;116.94437567729,36.627444013259;116.94434872813,36.627393327437;116.94181550659,36.629724840449;116.94146516744,36.6299710209;116.94062974332,36.630673354884;116.94056686193,36.630246162817;116.9405129636,36.62979000594",
        "traffic_condition": [],
        "start_location": {
            "lng": 116.94528296586,
            "lat": 36.633772235985
        },
        "end_location": {
            "lng": 116.94048601443,
            "lat": 36.62979000594
        },
        "vehicle_info": {
            "type": 5,
            "detail": null
        }
    },
    {
        "distance": 3828,
        "duration": 878,
        "instructions": "前魏华庄站乘9路(火车站方向)经过8站到经十路段兴西路站",
        "path": "116.94048601443,36.62979000594;116.94055787888,36.632671713166;116.94045906527,36.635176827602;116.94089923497,36.641895341563;116.94060279415,36.645609093992;116.94040516694,36.64725959265;116.94048601443,36.647599822587;116.940252455,36.651009277163;116.9400727939,36.651972004283;116.94000991251,36.656937456611;116.94080042136,36.656951932676;116.94708855993,36.65657555409;116.94730415326,36.656691363083;116.94893906928,36.656568316022",
        "traffic_condition": [],
        "start_location": {
            "lng": 116.94048601443,
            "lat": 36.62979000594
        },
        "end_location": {
            "lng": 116.94893906928,
            "lat": 36.65657555409
        },
        "vehicle_info": {
            "type": 3,
            "detail": {
                "name": "9路",
                "type": 0,
                "stop_num": 8,
                "on_station": "前魏华庄站",
                "off_station": "经十路段兴西路站",
                "first_time": "05:30",
                "last_time": "21:00"
            }
        }
    }
]]
//获取步骤集合
var polyline = [];
// 获取地址集合
var addressArr = [];
// pages/map/map.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        markers: [],
        polyline: [],
        controls: [{
            id: 1,
            iconPath: 'location.png',
            position: {
                left: 185,
                top: 333,
                width: 30,
                height: 50
            },
            clickable: true
        }]
    },
    getLocation: function () {
        var _this = this;
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                var latitude = '36.65657555409'
                var longitude = '116.94048601443'
                var speed = res.speed
                var accuracy = res.accuracy;
                _this.setData({
                    latitude: latitude,
                    longitude: longitude,
                    markers: [{
                        iconPath: "dpMarker.png",
                        id: 0,
                        latitude: longitude,
                        longitude: latitude,
                        width: 20,
                        height: 50

                    }]
                })
                // wx.openLocation({
                //     latitude: latitude,
                //     longitude: longitude,
                //     scale: 28
                // })
            }
        });
        // wx.chooseLocation({
        //     type: 'wgs84',
        //     success: function (res) {
        //         console.log(res);
        //     }
        // });
    },
    getPolyline: function() {
        var _this = this;
        steps.map(function (item, index) {
            //item 为路线里面的每一大步
            if (item && item.length > 0) {
                item.map(function (step, index) {
                    //step 为每一大步里面的每一小阶段
                    console.log(step)
                    var path = step.path;//取出该阶段的path，关键点的经纬度集合。
                    if (path) {
                        var arr = path.split(";");//通过上面的json数据，我们可以看到path存储的关键点使用“;”隔开的，这里我们通过这一项把它转换成数组进行操作。
                        arr.map(function (point, index) {
                            //point为每一个坐标点，格式为"116.94048601443,36.62979000594",逗号前面是longitude，逗号后面是latitude;
                            var pointarr = point.split(",");//我们再把每一个点转成数组，以方便我们操作。
                            if (pointarr.length == 2) {
                                //把我们取到的每一个点以微信官方要求的数据结构push到一个polyline数组里面去。
                                polyline.push({
                                    longitude: pointarr[0],
                                    latitude: pointarr[1]
                                });
                            }
                        });
                    }
                    // 地址
                    addressArr.push(step.instructions)
                })
                console.log(addressArr)
                //最后我们将polyline数组setData到微信组件里去。
                _this.setData({
                    "polyline": [{
                        "points": polyline,
                        "color": "#FF0000DD",
                        "width": 5,
                        'dottedLine': true
                    }],
                    'addressArr': addressArr
                });
            }
        });
    },
    getLngLat: function () {
        var _this = this;
        this.mapCtx.getCenterLocation({
            success: function (res) {
                addressArr.push(JSON.stringify({lon:res.longitude, lat:res.latitude}));
                _this.setData({
                    longitude: res.longitude, 
                    latitude: res.latitude, 
                    markers: [
                        {
                            id: 0,
                            iconPath: "dpMarker.png",
                            id: 0,
                            latitude: res.latitude,
                            longitude: res.longitude,
                            width: 20,
                            height: 50
                        }
                    ],
                    addressArr: addressArr
                })
            },
            fail: function(err) {
                console.log(err)
            }
        })
    },
    regionchange(e) {
        if (e.type == 'end') {
            this.getLngLat()
        }
    },
    markertap(e) {
        console.log(e)
    },
    controltap(e) {
        console.log(e)
    },
    getCenterLocation: function () {
        this.mapCtx.getCenterLocation({
            success: function (res) {
                console.log(res)
            }
        })
    },
    moveToLocation: function () {
        this.mapCtx.moveToLocation()
    },
    translateMarker: function () {
        this.mapCtx.translateMarker({
            markerId: 0,
            autoRotate: true,
            duration: 1000,
            destination: {
                latitude: 36.10229,
                longitude: 116.3345211
            },
            animationEnd() {
                console.log('animation end')
            }
        })
    },
    includePoints: function () {
        this.mapCtx.includePoints({
            padding: [10],
            points: [{
                latitude: 23.10229,
                longitude: 113.3345211,
            }, {
                latitude: 23.00229,
                longitude: 113.3345211,
            }]
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getLocation();
        this.getPolyline();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.mapCtx = wx.createMapContext("map");
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