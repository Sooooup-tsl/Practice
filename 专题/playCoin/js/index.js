(function(){
	var page = {
		clientType: 0,
		init: function(){
			page.getClientType();
			page.countCode();  //统计代码
		},

		//判断客户端是app、微信还是其他浏览器
		//app: 0; 微信：1; 浏览器：2
		getClientType:function(){
			TongChengInfo(function(data) {
				if (data.isTc) {
					page.clientType = 0;
				} else {
					var ua = window.navigator.userAgent.toLowerCase();
					if (ua.indexOf("micromessenger") > -1) {
						page.clientType = 1;
					} else {
						page.clientType = 2;
					}
				}
			});
		},
		//获取链接参数
		GetQueryString: function(paramKey){
		    var url = window.location.href.split('?')[1] || "";
            var params = {};
            var arr = {}, i, j;
            url = url.replace(/#.*$/, '').split("&");

            for (i = 0, j = url.length; i < j; i++) {
                var num = url[i].indexOf("=");
                if (num > 0) {
                    var key = decodeURIComponent(url[i].substring(0, num));
	  				var val = url[i].substr(num + 1) || "";
                    try {
                        val = decodeURIComponent(val);
                    } catch (ex) {
                    }
                    params[key] = val;
                }
            }
            return params[paramKey];
		},
		//统计代码
		countCode: function() {
			var _tcq = _tcq || [],
				_timediff=-1;

			if(typeof _tcopentime != "undefined"){
				_timediff = new Date().getTime()-_tcopentime;
			}
			_tcq.push(['_serialid', '0']); 
			if (page.clientType === 0) {
				_tcq.push(['_vrcode', '10007-2001-0']);
			} else if (page.clientType === 1) {
				_tcq.push(['_vrcode', '10003-2001-0']);
			} else if (page.clientType === 2) {
				_tcq.push(['_vrcode', '10004-2001-0']);
			}      
		    _tcq.push(['_refId', page.GetQueryString('refid')]);    
			_tcq.push(['_userId', getMemberId()]);
			_tcq.push(['_openTime', _timediff]);
			_tcq.push(['_trackPageview', '']);
		}
	};
	page.init();
})();