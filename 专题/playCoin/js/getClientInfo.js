/*from tccdn minify at 2016-3-9 18:02:19,file：/touch/app/pub/public/getClientInfo.2.0.1.js*/
var TongChengInfo = function (funBack)
{
    var ua = navigator.userAgent, isTc = (/tctravel/i).test(ua);
    //android
    if (window.Android)
    {
        var AndroidHandler = eval('(' + Android.getDataFromAndroid() + ')');
        if (AndroidHandler)
        {
            AndroidHandler.isTc = isTc = true;
            AndroidHandler.client = "android";
            if (!!funBack) { funBack(AndroidHandler); }
        }
    }
    //iphone
    document.addEventListener('TongChengWebViewJavascriptBridgeReady', function (event)
    {
        var bridge = event.bridge, m = 0; isTc = true;
        bridge.init(function (message, responseCallback) { });
        bridge.registerHandler('TongchengJavaScriptHandler', function (data, responseCallback)
        {
            if (m++ == 0)
            {
                data.isTc = isTc;
                data.client = "iphone";
                if (!!funBack) { funBack(data); }
            }
        });
    }, false);
    //WP
    window.TongChengWindowsPhoneFuncBack = function (message)
    {
        try
        {
            message = eval("(" + message + ")");
            if (message) { isTc = true; message.isTc = isTc; }
            if (!!funBack) { funBack(message); }
        } catch (e) { }
    }
    if ((/windows phone 8/i).test(ua)) { try { window.external.notify('TongChengWindowsPhoneFuncBack'); } catch (e) { } }
    //非客户端
    window.setTimeout(function ()
    {
        if (!isTc && !!funBack) { funBack({ isTc: isTc }); }
    }, 1000);
};

////调用
//TongChengInfo(function (data)
//{
//    //isTc:是否是客户端,client客户端类型(android、iphone、WP8),version:版本号,memberId:用户id
//    alert(JSON.stringify(data));
//});


