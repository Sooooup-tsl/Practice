var uroot = '../../../../../util/',
  scroot = '../../../scripts/',
  Pages = require(scroot + 'pages.js'),
  Utils = require(scroot + 'utils.js'),
  Api = require(uroot + 'api.js'),
  DataService = require(scroot + 'dataservice.js'),
  storage = require(scroot + 'storage.js'),
  common = require(uroot + 'common.js');

var app = getApp();
Page({
  data: {
    flyDate: '',
    mid: 0,
    maxTicket: 9,

    deleteCallbackKey: '',
    selectCallbackKey: '',
    selectedList: [],

    passengerList: [],
    flightInfo: null

  },
  onLoad: function (options) {
    if (options.flag == 'add' || options.flag == 'edit') {
      this.setData({
        flyDate: options.flyDate,
        maxTicket: options.maxTicket,
        mid: options.mid,

        openId: wx.getStorageSync(storage.STORAGE_KEY.openId),
        session_key: wx.getStorageSync(storage.STORAGE_KEY.session_key),
        unionid: wx.getStorageSync(storage.STORAGE_KEY.unionid),

        deleteCallbackKey: options.deleteCallbackKey,
        selectCallbackKey: options.selectCallbackKey,
        passengerList: JSON.parse(options.passengerList)
      });
    } else {
      this.setData({
        flyDate: options.flyDate,
        maxTicket: options.maxTicket,
        mid: options.mid,
        selectedList: options.selectedList ? JSON.parse(options.selectedList) : [],

        openId: wx.getStorageSync(storage.STORAGE_KEY.openId),
        session_key: wx.getStorageSync(storage.STORAGE_KEY.session_key),
        unionid: wx.getStorageSync(storage.STORAGE_KEY.unionid),

        deleteCallbackKey: options.deleteCallbackKey || "deleteCallback",
        selectCallbackKey: options.selectCallbackKey || "selectCallback"
      });

      if (options.mid == 0) {
        // console.log('========= no mid ============');
        var list = options.selectedList ? JSON.parse(options.selectedList) : [];

        this.setData({
          passengerList: list
        });
      } else {
        // this.setData({
        //   hideLoading:false,
        //   loadContent:'加载中...'
        // });
        common.showToast();
        this.queryLinker();
      }
    }
    this.setData({
      flightInfo: wx.getStorageSync(storage.STORAGE_KEY.flight_selected)
    });
  },

  onShow: function () {
    var opage = Pages.book2;

    if (this.data.flag != 'book2') {
      opage = Pages.contact_add;
    }

    common.page(Pages.contact_list, '2002', opage);
  },
  /**
   *  查询常旅
   */
  queryLinker: function () {
    var that = this;
    DataService.requestData(Api.querylinker, {
      data: {
        mid: this.data.mid,
        openId: this.data.openId,
        session_key: this.data.session_key,
        unionid: this.data.unionid
      },
      callback: function (data) {
        var o = {
          // hideLoading: true
        };
        if (data.res && data.res.data.state == "100") {
          o.passengerList = data.res.data.data || [];

          if (that.data.selectedList.length > 0) {
            var sl = that.data.selectedList;
            var ary = [];
            for (var i = 0; i < sl.length; i++) {
              ary.push(sl[i]["passid"]);
            }

            for (var i = 0; i < o.passengerList.length; i++) {
              if (ary.indexOf(o.passengerList[i].passid) != -1) {
                o.passengerList[i].checked = 1;
              }
            }
          }
        } else {
          // console.log("querylinker error");
        }

        that.setData(o);
        wx.hideToast();
      }
    });
  },

  /**
   * 选择乘机人
   * @param event
   */
  selectContacts: function (event) {
    var list = this.data.passengerList;
    var index = event.currentTarget.dataset.index;
    list[index].checked = list[index].checked ? 0 : 1;

    this.setData({
      passengerList: list
    })
  },
  /**
   * 添加新乘机人
   */
  addPassenger: function () {
    var that = this;
    Utils.replacePage(Pages.contact_add, {
      flyDate: that.data.flyDate,
      mid: that.data.mid,
      flag: "add",

      maxTicket: that.data.maxTicket,
      deleteCallbackKey: that.data.deleteCallbackKey,
      selectCallbackKey: that.data.selectCallbackKey,

      passengerList: that.data.passengerList
    });
  },
  /**
   * 编辑乘机人
   */
  editPassenger: function (event) {
    var that = this;
    var index = event.currentTarget.dataset.index;
    var pass = that.data.passengerList[index];

    Utils.replacePage(Pages.contact_add, {
      flyDate: that.data.flyDate,
      passenger: JSON.stringify(pass),
      mid: that.data.mid,
      flag: "edit",
      index: index,

      maxTicket: that.data.maxTicket,
      deleteCallbackKey: that.data.deleteCallbackKey,
      selectCallbackKey: that.data.selectCallbackKey,

      passengerList: that.data.passengerList
    });
  },

  /**
   * 获取选中的乘机人信息
   */
  getSelectedPassenger: function () {
    var ary = [];
    for (var o = 0; o < this.data.passengerList.length; o++) {
      if (this.data.passengerList[o].checked) {
        ary.push(this.data.passengerList[o]);
      }
    }

    return ary;
  },

  deleteConfirm: function () {
    var that = this;
    var slist = this.getSelectedPassenger();
    if (slist.length == 0) {
      this.showError("请选择需要删除的乘机人");
      return;
    }

    // this.setData({
    //   hideDeleteConfirmLayer: false
    // });
    wx.showModal({
      title: '温馨提示',
      content: '是否确定删除当前选中的乘客信息',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          that.deletePassenger();
        }
      }
    })
  },

  // cancelDelete: function () {
  //   this.setData({
  //     hideDeleteConfirmLayer: true
  //   });
  // },
  /**
   * 删除乘机人
   */
  deletePassenger: function () {
    // this.setData({
    //   hideDeleteConfirmLayer: true
    // });

    if (this.data.mid == 0) {
      var list = [];
      for (var o = 0; o < this.data.passengerList.length; o++) {
        if (!this.data.passengerList[o].checked) {
          list.push(this.data.passengerList[o]);
        }
      }

      this.setData({
        passengerList: list
        // hideDeleteSuccessLayer:false
      });

      common.showToast('删除成功', 'success', 400);

      app.flightGlobalData[this.data.deleteCallbackKey]();
      return
    }

    // this.setData({
    //   hideLoading:false,
    //   loadContent:'正在删除...'
    // });
    common.showToast('正在删除...');

    var ary = [];
    for (var o = 0; o < this.data.passengerList.length; o++) {
      if (this.data.passengerList[o].checked) {
        ary.push(this.data.passengerList[o]);
      }
    }

    if (ary.length > 0) {
      var i = 0;
      var that = this;
      var errorValue = [];
      var deletedValue = [];

      function removePass() {
        if (i == ary.length) {
          if (deletedValue.length > 0) {
            var list = that.data.passengerList;
            for (var j = list.length - 1; j >= 0; j--) {
              if (list[j].checked == 1) {
                if (deletedValue.indexOf(list[j].passid) != -1) {
                  list.splice(j, 1);
                } else {
                  list[j].checked = 0;
                }
              }
            }

            that.setData({
              passengerList: list
              // hideLoading:true,
              // hideDeleteSuccessLayer:false
            });
            wx.hideToast();
            common.showToast('删除成功', 'success', 400);
            app.flightGlobalData[that.data.deleteCallbackKey]();
            return;
          } else {

          }
        }

        DataService.requestData(Api.deletelinker, {
          data: {
            pType: ary[i].passengertype,
            pName: ary[i].name,
            mid: that.data.mid,
            lid: ary[i].passid,
            openid: that.data.openId,
            session_key: that.data.session_key,
            accessToken: that.data.accessToken,
            unionid: that.data.unionid
          },
          callback: function (data) {
            if (!data.error && data.res && data.res.data && data.res.data.state == 100) {
              deletedValue.push(ary[i].passid);
              i++;
              removePass();
            } else {
              errorValue.push(ary[i].passid);
              i++;
              removePass();
            }
          }
        })
      }

      removePass();
    }
  },

  /**
   * 判断选中用户是否有同名同姓 同拼音，同证件号
   */
  checkIsContainSpecial: function (selectedPassenger) {
    var that = this;

    //获取选中用户姓名
    var nameAll = selectedPassenger[0].name;
    for (var i = 1; i < selectedPassenger.length; i++) {
      nameAll += "|" + selectedPassenger[i].name;
    }

    var flightInfo = that.data.flightInfo;

    var temporderInfo = wx.getStorageSync(storage.STORAGE_KEY.temporder_info);

    DataService.requestData(Api.checkiscontainspecial, {
      data: {
        passengerNames: nameAll,
        GoLineDetail: flightInfo.originAirportCode + "|" + flightInfo.arriveAirportCode + "|" + flightInfo.flightNo + "|" + flightInfo.flyOffTime,
        goSerialid: temporderInfo.Serialld,
        openId: that.data.openId,
        session_key: that.data.session_key
      },
      callback: function (data) {
        if (data.res && data.res.data.state == "100") {

          app.flightGlobalData[that.data.selectCallbackKey](selectedPassenger);
          wx.navigateBack();

        } else if (data.res && data.res.data.state == "200") {
          that.showError(data.res.data.error);
        } else {
          that.showError("两位姓名、拼音相同的乘客，不能在同1张订单中，请分2张订单提交。");
        }
      }
    });
  },
  /**
   * 确认选择的乘机人 返回book2
   */
  selectPassenger: function () {
    var selectedPassenger = this.getSelectedPassenger(),
        that = this;
    if (selectedPassenger.length == 0) {
      this.showError("请选择乘客");
      return;
    }

    var validData = {};
    var NewAgeList = { "AA": 0, "A": 0, "BB": 0, "B": 0, "C": 0 };
    for (var i = 0; i < selectedPassenger.length; i++) {
      NewAgeList[Utils.isAgeType(selectedPassenger[i].cardtype, selectedPassenger[i].cardno, selectedPassenger[i].birthday, this.data.flyDate)]++;
      if (validData[selectedPassenger[i].cardno] == selectedPassenger[i].cardtype) {
        // 2. 证件号相同，但姓名不同，不可进行添加
        this.showError("您填写的乘机人证件号码有重复，请重新填写");
        return;
      }

      validData[selectedPassenger[i].cardno] = selectedPassenger[i].cardtype;
    }
    var cabins = that.data.flightInfo.cabins[0];
    if (cabins.realRoomCode != "Y" && cabins.realRoomCode != "F" && NewAgeList["AA"] > this.data.maxTicket){
      this.showError("该价格目前剩余票量为" + this.data.maxTicket + "张，为更多乘客预订机票，请选择其他产品或分开预订。");
    } else if ((cabins.realRoomCode == "Y" || cabins.realRoomCode == "F") && selectedPassenger.length > this.data.maxTicket) {
      // 8. 余票不足时，填写乘机人个数不得大于余票张数
      this.showError("该价格目前剩余票量为" + this.data.maxTicket + "张，为更多乘客预订机票，请选择其他产品或分开预订。")
    } else if (selectedPassenger.length > 9) {
      //5. ok 在选择时候判断了 一次性不可同时添加大于9人，包括儿童
      this.showError("一个订单仅可以添加9位乘机人，需要添加更多请另外下单");
    } else if (NewAgeList["AA"] > 0 && NewAgeList["AA"] * 2 < (NewAgeList["BB"] + NewAgeList["B"])) {
      // 9. 单个成人（满18周岁）只可以携带两名儿童登机，（添加和提交订单都需要验证）
      this.showError("单个成人（满18周岁）只可以携带两名儿童登机");
    } else {
      if (NewAgeList["AA"] == 0) {
        if (NewAgeList["A"] > 0 && NewAgeList["B"] > 0 || NewAgeList["A"] == 0 && NewAgeList["BB"] + NewAgeList["B"] > 0) {
          // 10. 儿童不能单独乘机验证（添加和提交订单都需要校验）
          this.showError("友情提醒您，儿童乘坐飞机需成人全程陪同");
          return;
        } else if (NewAgeList["A"] < NewAgeList["BB"]) {
          this.showError("儿童人数超出限制，一名未成年人最多只能带一名儿童");
          return;
        }
      }

      if (NewAgeList["BB"] + NewAgeList["B"] > 0) {
        var noc = cabins.isbt;
        if (noc == 3) {
          this.showError("抱歉，此产品暂不支持儿童预订，如有需求请选择其他产品");
          return;
        }
        if (noc == 2) {
          this.showError("抱歉，此产品暂不支持儿童、婴儿预订，如有需求请选择其他产品");
          return;
        }
      }

      // 3. 同姓名，不同证件号不可以同时添加
      // 4. 同名同姓同音同字母可以同时显示，但不可同时添加
      this.checkIsContainSpecial(selectedPassenger)
    }
  },

  // cloaseDeleteSuccess:function(){
  //   this.setData({
  //     hideDeleteSuccessLayer:true
  //   });
  // },

  showError: function (msg) {
    wx.showModal({
      title: '温馨提示',
      content: msg,
      showCancel: false
    });
    // this.setData({
    //   modalContent: msg,
    //   hideModal: false
    // });
  }
  // modalChange: function () {
  //   this.setData({
  //     hideModal: true
  //   });
  // },
})
