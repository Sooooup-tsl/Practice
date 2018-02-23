//index.js
//获取应用实例
var app = getApp();
var root = '../../../utils/'
var utils = require(root + 'util.js');
var pubCommon = require(root + 'common.js');
var location = require(root + 'location.js');
Page({
    dataCache: {},
    data: {
        placeholder: '北京/beijing/bj',
        searchTitleTips: '对不起，找不到相关信息',
        letterList: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'],
        icon: 'icon',
        inputFocus: false,
        showLocation: true,
        locationDisable: true,
        locationDisableTxt: '该城市无机场',
        nearLocationName: '邻近机场',
        iconList: { 'bus': 'https://img1.40017.cn/touch/hb/c/wxapp/image/common/bus.png', 'train': 'https://img1.40017.cn/touch/hb/c/wxapp/image/common/train.png', 'hotel': 'https://img1.40017.cn/touch/hb/c/wxapp/image/common/hotel.png', 'flight': 'https://img1.40017.cn/touch/hb/c/wxapp/image/common/flight.png' },
        searchInputValue: '',
        searchInputValueJson:{},
        tabIndex: 0,
        tabItems: false, //tab
        //   cityId:'ID',
        //   cityName:'CityName',
        //   py:'QPY',
        //   jp:'JPY',
        //cityList:{letter:[],letter:[]}
        locationItems: false,
        customItems: false,  //自定义城市
        letterListData: false, //切换字母 存储的单个字母的数据
        letterOnLoading: '',
        requestComplete: false,
        scrollTop: 0,
        isFlight: false,
        selectCity:''
    },
    // scroll:function(e){
    //     this.setData({
    //         scrollTop: e.detail.scrollTop
    //     })
    // },
    searchTimer: false,
    searchCityHandler: function (event) {  //搜索事件
      var value = event.detail.value;
      var valueJson = {}
      for (var i in value){
        valueJson[value[i]] = value[i];
      }
      
      var obj = {
                searchInputValue: value,
                searchInputValueJson: valueJson
            };
        if (value) {
            var that = this;
            this.searchTimer && clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(function () {
                that.getSearchData(value)
            }, 500)

        } else {
          obj.requestComplete = false;
          obj.searchData = false;
        }
        this.setData(obj)
        // console.log(obj)
    },
    searchCityFocus: function (event) {
        this.setData({
            inputFocus: true
        })
    },
    searchCityBlur: function (event) {
        var datas = {
            inputFocus: false
        };
        if (!event.detail.value) {
            datas.searchData = false
        }
        this.setData(datas)
    },
    cancelInput: function (event) {
      var that = this;
      this.setData({
        inputFocus: false,
        searchData: false
      })
      setTimeout(function(){
        that.setData({
          searchInputValue: '',
          searchInputValueJson: {},
          searchData: false
        });
      },100)
    },
    tabClickHandler: function (event) {
        var index = parseInt(event.currentTarget.dataset.index, 10)
        var objs = {
            tabIndex: index,
            selectletter: false,
            letterListData: false,
            letterOnLoading: '',
            tabData: event.currentTarget.dataset,
            customItems: this.customItemsData[index]
        };
        if (this.letterList) {
            objs.letterList = this.letterList[index]
        }
        this.setData(objs)
    },

    letterTapHandler: function (event) { //字母被点击，加载对应城市数据
        var letter = event.target.dataset.letter || event.currentTarget.dataset.letter;
        var letterPos = this.data.letterList;
        for(var i=0; i<=letterPos.length;i++){
            if(letterPos[i] == letter){
                var letterIndex = i;
                break;
            }
        }
        var tapPos = event.target.offsetTop - (Math.floor(letterIndex/6))*54 - 10;
        
        if (event.target.dataset.onloading === true || event.target.dataset.onloading === 'true') {
            return
        }
        this.setData({
            withoutLetterMessage:false,
            selectletter:letter
        });

        this.getCityList(letter,tapPos)
    },
    locationCitySelectHandler: function (event) { //定位城市数据被选中触发
        var dataset = event.currentTarget.dataset;

        if (this.data.locationInfo.reload) {
            var obj = {};
            obj[this.data.cityName] = '定位中';
            this.setData({
                locationInfo: obj
            });

            this.location();
            return
        }
        if (dataset.disable === true || dataset.disable === 'true') {
            return
        }
        if (this.data.locationInfo.exdata) {
            this.citySelectHandler(event)
        }
    },
    citySelectHandler: function (event) { //城市数据被选中触发
        var dataset = event.currentTarget.dataset,
            selecitem = dataset.datas;
            
        if (dataset.disable === true || dataset.disable === 'true' || !selecitem) {
            return;
        }
        selecitem = JSON.parse(selecitem)
        // var value = selecitem.show || selecitem.Show || selecitem.detail
        // 事件统计
        if (selecitem.detail){  //汽车票统计
            pubCommon.ev('page/common/city/city', 2000, '/sbox/ac/click', selecitem.detail +'pgPath:/bus/homepage|*|plat:5|*|', 'search', 13)
        } else if (selecitem.Detail){   //火车票统计
            pubCommon.ev('page/common/city/city', 2000, '/sbox/ac/click', selecitem.Detail + 'pgPath:/train/homepage|*|plat:5|*|', 'search', 13)
        } else if (selecitem.acClickEvent){ //机票统计
            pubCommon.ev('page/common/city/city', 2000, '/sbox/ac/click', selecitem.acClickEvent + 'pgPath:/flight/homepage|*|plat:5|*|', 'search', 13)
        }
        
        
        this.setData({
          selectCity: selecitem.name || selecitem[this.data.cityId] || selecitem[this.data.cityName]
        });
        // console.log(this.data.selectCity)
    
        app.globalData[app.globalData.cityParam.callback](selecitem);
        if (app.globalData.cityParam.goBack) {
            app.globalData[app.globalData.cityParam.goBack]();
        } else {
            wx.navigateBack()
        }


    },
    location: function () {
        var that = this;
        var locationInfo = {};
        locationInfo[that.data.cityName] = '定位中'
        that.setData({
            locationInfo: locationInfo
        });
        location.location(
            {
                cache: 3600,
                callback: function (data) {
                    // debugger
                    var obj = {};
                    if (data.locationFail) {
                        obj.reload = true;
                        obj[that.data.cityName] = '定位失败，点击重新获取';
                    } else {
                        obj.locationSuccess = true;
                        obj[that.data.cityId] = data.Id;
                        obj[that.data.cityName] = data.Name;
                        obj[that.data.py] = data.FullPinYinName;
                        obj[that.data.jp] = data.Short_en_name;
                        obj.pid = data.Pid;
                        
                        if (that.locationSuccess) { //设置定位周边选项
                        
                            that.locationSuccess(obj, data, function (locationDisable, locationDataItems, locationDisableTxt) {
                                if (typeof locationDisable == 'object') {
                                    locationDataItems = locationDisable;
                                    locationDisable = false;
                                }
                                if (locationDataItems){
                                    that.processJsonString(locationDataItems)
                                }
                                if (locationDisableTxt){
                                    that.setData({
                                        locationDisableTxt:'GPS定位'

                                    })
                                }
                                if (locationDataItems && locationDataItems.type == 3){
                                    obj[that.data.cityId] = locationDataItems.code;
                                    obj.exdata = JSON.stringify(obj);
                                    that.setData({
                                        locationInfo: obj
                                    })
                                }else{
                                    obj.exdata = JSON.stringify(obj);
                                    that.setData({
                                        locationInfo: obj
                                    })
                                }
                                that.setData({
                                    locationDisable: locationDisable,
                                    locationItems: locationDataItems
                                })
                            });

                        }else{
                            obj.exdata = JSON.stringify(obj);
                        }
                    };
                    that.setData({
                        locationDisable: (data.locationFail ? true : false),
                        locationInfo: obj
                    })
                    //locationInfo
                }
            }
        )
    },
    onLoad: function () {
        //onload
        var that = this,
            param = app.globalData.cityParam;
        if (!param) { //没有数据的情况下 后退页面
            param = {};
        }

        var datas = utils.extend({
            //cityList:[] 所有城市数据
            cityId: 'ID',
            cityName: 'CityName',
            py: 'QPY',
            jp: 'JPY',
            locationItems: []

        }, param, {}); //处理参数

        this.cityParam = datas;


        if (datas.customItems) { //处理自定义模块数据
            if (Object.prototype.toString.call(datas.customItems[0]) === "[object Array]") {
                for (var i = 0; i < datas.customItems.length; i++) {
                    that.processObjectJsonString(datas.customItems[i])
                }
                this.processCustomData(datas)
            } else {
                that.processObjectJsonString(datas.customItems)
            }
        }
        if (datas.tabItems) { //tab 
            datas.tabData = datas.tabItems[datas.tabIndex || 0]
        }
        if (datas.letterList && typeof datas.letterList[0] === 'object') {
            this.letterList = datas.letterList;
            datas.letterList = datas.letterList[datas.tabIndex || 0]
        }
        if (datas.locationSuccess) { //设置定位成功数据
            that.locationSuccess = datas.locationSuccess
            datas.locationSuccess = null;
        } else {
            datas.locationDisable = false;
        }
        datas.locationInfo = {};
        datas.locationInfo[datas.cityName] = '定位中'; //设置定位信息

        if (datas.cityList) {
            this.matchItem = datas.matchItem || [datas.cityName, datas.py, datas.jp]; //匹配项
            this.processLocalMatchData = datas.processLocalMatchData || false;
            if (datas.tabItems) {
                this.processTabAllCityData(datas)
            } else {
                this.dataCache = datas.cityList; //所有数据添加到缓存中
            }
            this.processData(true)
        }

        this.setData(datas); //绑定数据
        this.data.showLocation && this.location();//dingwei 
    },
    processTabAllCityData: function (datas) {
        var dataCache = {};
        for (var i = 0; i < datas.cityList.length; i++) {
            var itemData = datas.cityList[i]
            for (var item in itemData) {
                dataCache[item + (datas.tabItems[i].id || datas.tabItems[i].name)] = itemData[item]
            }
        }
        this.dataCache = dataCache;
    },
    processCustomData: function (data) { //处理自定义模块数据
        this.customItemsData = data.customItems;
        data.customItems = this.customItemsData[data.tabIndex];
    },
    processObjectJsonString: function (data) {
        for (var i = 0; i < data.length; i++) {
            this.processJsonString(data[i].list)
        }
    },
    processJsonString: function (data) { //给数据添加json值 dataset 不支持绑定对象
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            data[i].exdata = JSON.stringify(item)
            if (data[i].disable || (data[i].HasAirPort !== undefined && !data[i].HasAirPort)) {
                data[i].disable = true;
            }

        }
    },
    showLoading: function (time) {  //loadings
        wx.showToast({ title: '数据加载中...', icon: 'loading', duration: time || 1500 })
    },
    withoutLetterMessage:'暂无相关城市信息',
    getCityList:function (letters,tapPos){ //点击字母动态加载城市数据
        var that = this,
            letter = letters.toLocaleLowerCase(),
            letter_ = letter.toLocaleUpperCase(),
            tabids = this.data.tabData ? (this.data.tabData.id || this.data.tabData.name) : '',
            tabid = '',
            tabname = '',
            letterCacheName = letter + tabids,
            cityParam = that.cityParam,

            robj = utils.extend({ letter: 'cityName' }, cityParam.requestObj),
            allCityList = that.cityParam.cityList || {},
            data = [];
        
        if (this.data.tabData) {
            tabid = this.data.tabData.id;
            tabname = this.data.tabData.name;
        }

        var data_ = that.dataCache[letterCacheName] || that.dataCache[letter_ + tabids]; //缓存

        if(data_ || data_ === false){ //缓存读取数据
            data = data_;
            var obj = {
                letterListData:data,
                letterOnLoading:letter_
            }
            if(data_ === false){
                obj.withoutLetterMessage = that.withoutLetterMessage;
            }else{
                obj.withoutLetterMessage = false;
            }
            that.setData(obj)
            that.setData({
                scrollTop:tapPos
            })
        }else{
          if (cityParam.soursePath == 'bus'){   //汽车票渠道的返回数据处理
          
            robj.data = this.updateRequestData(robj.data, robj.letter, letter);//添加数据
            robj.data = utils.extend({}, robj.data, {
              letter: letter
            })
            robj.success = function (res) { //设置请求成功回调函数
              var resData = res.data.body;
              if (res.data.header.isSuccess && resData.length > 0) { //处理成理想数据
                // var _data = success(resData);
                // resData = _data === undefined ? resData : _data;
                resData.forEach(function (item, index) {
                    resData[index].Name = item.showName;
                });
                var setobj = {};
                if (typeof resData === "string") {
                  that.withoutLetterMessage = setobj.withoutLetterMessage = resData;
                  resData = false;
                } else {
                  that.processJsonString(resData); //JSON 格式
                  that.dataCache[letterCacheName] = data = resData;//更新缓存
                }
                that.dataCache[letterCacheName] = resData;//更新缓存
                setobj.letterListData = resData
                that.setData(setobj)
              }else{
                var setobj = {};
                resData = false;
                that.dataCache[letterCacheName] = resData;//更新缓存
                setobj.letterListData = resData;
                that.withoutLetterMessage = setobj.withoutLetterMessage = res.data.header.errMsg;
                that.setData(setobj)
              }

            }
          }else{
            if (cityParam.soursePath == 'train'){
              robj.data.para = this.updateRequestData(robj.data.para, robj.letter, letter);//添加数据
            }else{
              robj.data = this.updateRequestData(robj.data, robj.letter, letter);//添加数据
            }
            robj.data = utils.extend({}, robj.data, {
              tabid: tabid,
              tabname: tabname
            })
            var success = robj.success;
            robj.success = function (res) { //设置请求成功回调函数
              var resData = res.data;
              if (success) { //处理成理想数据
                var _data = success(resData);
                resData = _data === undefined ? resData : _data;
              }
              var setobj = {};
              if (resData) {
                if (typeof resData === "string") {
                  that.withoutLetterMessage = setobj.withoutLetterMessage = resData;
                  resData = false;
                } else {
                  that.processJsonString(resData); //JSON 格式
                  that.dataCache[letterCacheName] = data = resData;//更新缓存

                }
              }
              that.dataCache[letterCacheName] = resData;//更新缓存
              setobj.letterListData = resData
              that.setData(setobj)
            }
          }
            
            robj.fail = function () { }
            robj.complete = function () { //请求完成更新状态
                wx.hideToast()
                setTimeout(function(){
                  that.setData({
                    scrollTop: tapPos
                  })
                },300)

            }

            that.showLoading(100000);
            that.setData({
                letterOnLoading: letter_ //正在加载状态的城市 再次点击不加载
            })
            try {
                wx.request(robj)
            } catch (e) {
                wx.hideToast()
            }
        }
        that.setData({
            scrollTop:tapPos
        })
    },
    processData: function (cityList) {
        if (cityList) { //如果传了完整数据 做下处理 搜索的时候用
            this.allCityList = [];
            for (var item in this.dataCache) {
                this.allCityList = this.allCityList.concat(this.dataCache[item]);
            }
        }
    },

    searchCache: {},
    getSearchData: function (key) { //搜索框加载城市数据
        var searchList = [],
            that = this;
        if (this.searchCache[key]) { //读取缓存
            that.setData({ //更新动态数据集
                searchData: this.searchCache[key]
            })
        } else if (this.allCityList) { //读取全部数据搜索(设置了本地数据源情况)
            this.matchLocalData(key, this.allCityList)
        } else if (this.cityParam.searchObj) { //异步读取
            var sobj = utils.extend({}, this.cityParam.searchObj); //todo :设置一次，不要每次都设置，搞好优化
            
            if (this.cityParam.soursePath == 'train') {
              this.updateRequestData(sobj.data.para, (sobj.key || 'keyWords'), key);//添加数据
            } else if (this.cityParam.soursePath == 'flight') {
              
              this.updateRequestData(sobj.data.request.body, (sobj.key || 'keyword'), key);//添加数据
            } else {
              this.updateRequestData(sobj.data, (sobj.key || 'cityName'), key);//添加数据
            }
            var tabid = '',
                tabname = '';
            if (this.data.tabData) {
                tabid = this.data.tabData.id;
                tabname = this.data.tabData.name;
            }
            
            sobj.data = utils.extend({},sobj.data,(tabid && {
                tabid:tabid,
                tabname:tabname
            }))
            var success = sobj.success;
            if (this.cityParam.soursePath == 'bus'){
              sobj.success = function (data) {
                var data = data.data, returnData=[];
                if (that.cityParam.isDep && data.body && data.body.busStation) {
                  var bodyList = data.body.busStation.stationList;
                }else{
                  var bodyList = data.body;
                }
                if (data.header.isSuccess && bodyList.length>0){
                  bodyList.forEach(function (item, index) {
                    bodyList[index].Name = item.showName;
                    bodyList[index].ID = "";
                    bodyList[index].QPY = "";
                    bodyList[index].png = "";
                    // bodyList[index].spitCity = (item.matchedName).split('，')[1] ? (item.matchedName).split('，')[1]:''
                  });
                  // var _data = success(data);
                  // data = _data === undefined ? data : _data;
                  returnData = bodyList;
                }
                that.processJsonString(returnData); //JSON 格式化
                that.searchCache[key] = returnData; //缓存搜索数据
 
                that.setData({ searchData: returnData })
                if (returnData.length == 0 && data.body && data.body.show) {
                    // 汽车票搜索为空且格式正确时统计事件
                    pubCommon.ev('page/common/city/city', 2000, '/sbox/ac', data.body.show + 'pgPath:/bus/homepage|*|plat:5|*|', 'search', 13)
                }
              }
            }else{
              sobj.success = function (data) {
                var dataY = data;
                  data = data.data;
                
                if (success) {
                  var _data = success(data);
                  data = _data === undefined ? data : _data;
                }
                that.processJsonString(data); //JSON 格式化
                that.searchCache[key] = data; //缓存搜索数据
                if (that.cityParam.soursePath == 'flight') {
                  that.setData({ isFlight: true })
                }
                that.setData({ searchData: data })
                if (data.length == 0){
                  if (dataY.data.data && dataY.data.data.Show){
                    //   火车票搜索为空统计
                      pubCommon.ev('page/common/city/city', 2000, '/sbox/ac', dataY.data.data.Show + 'pgPath:/train/homepage|*|plat:5|*|', 'search', 13)
                  } else if (dataY.data.response && dataY.data.response.body.acEvent){
                    //   飞机票搜索为空统计
                      pubCommon.ev('page/common/city/city', 2000, '/sbox/ac', dataY.data.response.body.acEvent + 'pgPath:/flight/homepage|*|plat:5|*|', 'search', 13)
                  }
                }
              }
            }
            
            sobj.fail = function () {
                that.setData({ //更新动态数据集
                    searchData: false
                })
            }
            sobj.complete = function () {
                that.setData({
                    requestComplete: true
                })
            }
            that.setData({ //状态设置
                requestComplete: false
            })
            wx.request(sobj)
        }
    },
    updateRequestData: function (data, name, value) { //添加数据

        switch (typeof data) { //添加数据
            case 'string':
                data += (data.length > 0 ? '&' : '') + name + '=' + value;
                break;
            case 'object':
                data[name] = value;
                break;
            default:
                data = name + '=' + value
        }
        return data;
    },
    matchLocalData: function (key, data) { //本地数据源匹配
        var matchItem = this.matchItem,
            matchDatas = [];
        for (var i = 0; i < data.length; i++) {
            var dataItem = data[i];
            for (var j = 0; j < matchItem.length; j++) {
                var matchs = dataItem[matchItem[j]];
                if (matchs.indexOf(key) == 0) {
                    matchDatas.push(dataItem)
                    break;
                }
            }
        }
        if (matchDatas.length) {
            this.processLocalMatchData && this.processLocalMatchData(matchDatas)
            this.setData({ //更新动态数据集
                searchData: matchDatas
            })
        }
    }
});

