// pages/list/list.js
/*var helloData = {
  name: 'wechat'
};

Page({
  data:{
    helloData: helloData,
    count: 1
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
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
  changeName: function() {
    this.setData({
      helloData: {
        name: 'MIMA'
      }
    });
  },
  add: function() {
    this.setData({
      count: this.data.count + 1
    })
  }
})*/
var helloData = {
  // 数据绑定
  name: 'WeChat',
  // 列表渲染
  array: [1,2,3,4],
  array2: [{message: 'a'},{message: 'b'}],
  objectArray: [
      {id: 5, unique: 'unique_5'},
      {id: 4, unique: 'unique_4'},
      {id: 3, unique: 'unique_3'},
      {id: 2, unique: 'unique_2'},
      {id: 1, unique: 'unique_1'},
      {id: 0, unique: 'unique_0'},
    ],
    numberArray: [1, 2, 3, 4],
  // 条件渲染
  flag: 'ccc',
  // 模板
  staffA: {firstName: 'tom', secondName: 'soup'},
  staffB: {firstName: 'tom2', secondName: 'soup2'},
  staffC: {firstName: 'tom3', secondName: 'soup3'},
  // 事件
  count: 1
};
Page({
  data:helloData,
  changeName: function() {
    this.setData({
        name: 'MIMA'
    })
  },
  add: function() {
    this.setData({
      count: this.data.count + 1
    });
  },
  onLoad:function(options){
    
  },
  onReady:function(){
    
  },
  onShow:function(){
    
  },
  onHide:function(){
    
  },
  onUnload:function(){
    
  },
  onPullDownRefresh:function(){
    
  },
  onReachBottom:function(){
    
  }
})    