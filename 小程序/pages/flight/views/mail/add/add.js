var Api = require('../../../../../util/api.js'),
  App = getApp()

Page({
  data: {
    province: [],
    pid: [],
    provinceIndex: -1,
    cityIndex: -1,
    regionIndex: -1,
    city: [],
    cid: [],
    region: [],
    // modal: {
    //     hidden: true,
    //     message: ''
    // },
    mail: {}

  },
  cache: {
    mobile: '',
    street: '',
    name: '',
    addCallbackKey: ''
  },
  onLoad: function (option) {
    this.cache.addCallbackKey = option.addCallbackKey
    if(option.mailInfo) {
      var mailInfo= JSON.parse(option.mailInfo)
      this.setData({
        mail: mailInfo,
        'provinceIndex': mailInfo.provinceIndex,
        'cityIndex': mailInfo.cityIndex,
        'regionIndex': mailInfo.regionIndex
      })
      this.cache.name = this.data.mail.name
      this.cache.mobile = this.data.mail.mobile
      this.cache.street = this.data.mail.street
    }
    this.fetchProvince()
  },
  fetchProvince: function () {
    var self = this

    wx.request({
      url:Api.getMailAdress,
      data: {
        typeid: 1
      },
      method: 'GET',
      success: function (res) {
        self.handleProData(res.data.data)
      }
    })
  },
  fetchCity: function () {
    var self = this
    if(self.data.provinceIndex == -1) {
      return
    }
    wx.request({
      url:Api.getMailAdress,
      data: {
        typeid: 2,
        pid: self.data.pid[self.data.provinceIndex]
      },
      method: 'GET',
      success: function (res) {
        self.handleCityData(res.data.data)
      }
    })
  },
  fetchRegion: function () {
    var self = this

    if(self.data.cityIndex == -1) {
      return
    }
    wx.request({
      url:Api.getMailAdress,
      data: {
        typeid: 3,
        pid: self.data.cid[self.data.cityIndex]
      },
      method: 'GET',
      success: function (res) {
        self.handleRegionData(res.data.data)
      }
    })
  },
  handleProData: function (data) {
    var self = this,
      province = [],
      pid = []
    data.forEach(function(item){
      province.push(item.name)
      pid.push(item.id)
    })

    self.setData({
      'province': province,
      'pid': pid
    })

    self.fetchCity()
  },
  handleCityData: function (data) {
    var self = this,
      city = [],
      cid = []
    data.forEach(function(item){
      city.push(item.name)
      cid.push(item.id)
    })

    self.setData({
      'city': city,
      'cid': cid
    })

    self.fetchRegion()
  },
  handleRegionData: function (data) {
    var self = this,
      region = []
    data.forEach(function(item){
      region.push(item.name)
    })

    self.setData({
      'region': region
    })
  },
  provinceChange: function (e) {
    var index = e.detail.value
    if(index == this.data.provinceIndex) {
      return
    }
    this.setData({
      'provinceIndex': index,
      'cityIndex': 0,
      'regionIndex': 0
    })
    this.fetchCity()
  },
  cityChange: function (e) {
    var index = e.detail.value
    if(index == this.data.cityIndex) {
      return
    }
    this.setData({
      'cityIndex': index,
      'regionIndex': 0
    })
    this.fetchRegion()
  },
  regionChange: function (e) {
    var index = e.detail.value
    if(index == this.data.regionIndex) {
      return
    }
    this.setData({
      'regionIndex': index
    })
  },
  saveMail: function () {

    if(!this.cache.name) {
      // this.setData({
      //   'modal.hidden': false,
      //   'modal.message': '请输入收货人'
      // })
      wx.showModal({
        title: '温馨提示',
        content: '请输入收货人',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }

    if(!this.cache.mobile) {
      // this.setData({
      //   'modal.hidden': false,
      //   'modal.message': '请输入手机号'
      // })
      wx.showModal({
        title: '温馨提示',
        content: '请输入手机号',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }

    if(!/^1[3,4,5,7,8]\d{9}$/i.test(this.cache.mobile)) {
      // this.setData({
      //   'modal.hidden': false,
      //   'modal.message': '手机号码不合法！'
      // })
      wx.showModal({
        title: '温馨提示',
        content: '手机号码不合法！',
        showCancel: false,
        confirmText: '知道了'
      })
      return false
    }

    if(this.data.provinceIndex == -1) {
      // this.setData({
      //   'modal.hidden': false,
      //   'modal.message': '请选择省份'
      // })
      wx.showModal({
        title: '温馨提示',
        content: '请选择省份',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }

    if(this.data.cityIndex == -1) {

      // this.setData({
      //   'modal.hidden': false,
      //   'modal.message': '请选择城市'
      // })
      wx.showModal({
        title: '温馨提示',
        content: '请选择城市',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }

    if(this.data.regionIndex == -1) {
      // this.setData({
      //   'modal.hidden': false,
      //   'modal.message': '请选择区'
      // })
      wx.showModal({
        title: '温馨提示',
        content: '请选择区',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }



    if(!this.cache.street) {
      // this.setData({
      //   'modal.hidden': false,
      //   'modal.message': '请输入详细地址'
      // })
      wx.showModal({
        title: '温馨提示',
        content: '请输入详细地址',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }
    var mail = {
      name: this.cache.name,
      mobile: this.cache.mobile,
      province: this.data.province[this.data.provinceIndex],
      city: this.data.city[this.data.cityIndex],
      region: this.data.region[this.data.regionIndex],
      street: this.cache.street,
      provinceIndex: this.data.provinceIndex,
      cityIndex: this.data.cityIndex,
      regionIndex: this.data.regionIndex
    }
    if(this.cache.addCallbackKey) {
      App.flightGlobalData["addMailAdress"](mail)
      wx.navigateBack()
    }

  },
  // modalConfirm: function () {
  //   this.setData({
  //     'modal.hidden': true,
  //   })
  // },
  getName: function (e) {
    this.cache.name = e.detail.value
  },
  getMobile: function (e) {
    this.cache.mobile = e.detail.value
  },
  getStreet: function (e) {
    this.cache.street = e.detail.value
  }

})
