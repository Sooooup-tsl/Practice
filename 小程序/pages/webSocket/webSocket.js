// pages/webSocket/webSocket.js
var wsApi = 'ws://10.101.66.148:3001';
var openBol = false;
Page({
  data:{
      messages: ['123']
  },
  onLoad:function(){
    var that = this;
    wx.onSocketMessage(function (res) {
        console.log(res.data)
        var msg = [];
        msg.push(res.data);
        that.setData({
            messages: msg
        })
    });
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  openMsg: function () {
      // 页面初始化 options为页面跳转所带来的参数
      wx.connectSocket({
          url: wsApi,
          data: {},
          header: {
              'content-type': 'application/json'
          },
          method: "GET",
          success: function (e) {
              console.log('客户端连接成功！');
          }
      });
      wx.onSocketOpen(function () {
          console.log('webSocket连接打开');
          openBol = true;
      });
  },
  sendMsg: function(e) {
    if (openBol) {
      wx.sendSocketMessage({
        data: "你好，我是小程序",
        success: function(res){
          // success
            
        },
        fail: function(res) {
          // fail
        },
        complete: function(res) {
          // complete
        }
      })
    }
  },
  closeMsg: function() {
      wx.closeSocket()
  }
})