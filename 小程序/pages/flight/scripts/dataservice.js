/**
 * Created by kroll on 2016/9/27.
 */
/**
 * 最大同时请求数量
 * @type {number}
 */
var maxRequestCount = 5;

/**
 * 请求数量
 * @type {number}
 */
var requestCount = 0;

/**
 *  堆积请求池
 * @type {Array}
 */
var pool = [];

var dataService = {
    requestData: function (url, params) {
        var that = this;

        if (requestCount >= maxRequestCount) {
            pool.push({url: url, params: params});
            return;
        }
        requestCount++;

        wx.request({
            url: url,
            data: params.data,
            header: {
                "Content-Type": "application/json"
            },
            method:params.method || 'GET',
            success: function (res) {
                if (params && params.callback) {
                    params.callback({error: false, res: res});
                }
            },
            fail: function () {
                params && params.callback && params.callback({error: true});
            },
            complete: function () {
                requestCount--;

                var res = pool.shift();
                if (res) {
                    that.requestData(res.url, res.params);
                }
            }
        });
    }
};

module.exports = dataService;