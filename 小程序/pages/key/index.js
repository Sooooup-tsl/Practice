// pages/key/index.js

Page({
  data:{
    objectArray:  [
      {id: 5, unique: 'unique_5'},
      {id: 4, unique: 'unique_4'},
      {id: 3, unique: 'unique_3'},
      {id: 2, unique: 'unique_2'},
      {id: 1, unique: 'unique_1'},
      {id: 0, unique: 'unique_0'}
    ],
    numberArray: [1,2,3,4]
  },
  addToFront: function() {
    var length = this.data.objectArray.length;
    var prependArray = [
      {id: length, unique: 'unique_' + length}
    ];
    this.data.objectArray = prependArray.concat(this.data.objectArray);
    this.setData({
      objectArray: this.data.objectArray
    })
  },
  addNumberToFront: function() {
    var length = this.data.numberArray.length;
    this.data.numberArray =[ length + 1 ].concat(this.data.numberArray);
    this.setData({
      numberArray: this.data.numberArray
    })

  },
  addNumberToEnd: function() {
    var length = this.data.numberArray.length;
    this.data.numberArray.push(length + 1);
    this.setData({
      numberArray: this.data.numberArray
    });
    console.log(this.data.numberArray)
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
  }
})