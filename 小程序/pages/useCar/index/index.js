var app = getApp();

var DZ = {
    multiArray: [['2016年10月10日', '2016年10月11日'], ['10', '11', '12', '13', '14'], ['20', '30']],    
    multiIndex: [0, 0, 0],
    // 跳转到地址列表页
    jumpToAddress: function() {
        wx.navigateTo({
            url: '../addressList/addressList',
        })
    }
}
// 和时间相关
var time = {
    // 选择用车时间
    bindMultiPickerColumnChange: function (e) {
        console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
        var data = {
            multiArray: this.data.multiArray,
            multiIndex: this.data.multiIndex
        };
        data.multiIndex[e.detail.column] = e.detail.value;
        this.setData(data);
    },
    bindMultiPickerChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            multiIndex: e.detail.value
        })
    }
}
module.exports = {
    DZ: DZ,
    Time: time
}