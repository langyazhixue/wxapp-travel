
var protocol = require('lib/protocol.js');

const  Promise = require('lib/bluebird.min');   ///引入 Promise
const  regeneratorRuntime = require("lib/runtime");  // 引入Generator
/*产品信息*/



/*APP入口*/

App({
    data: {
        swiperConfig: { //全局swiper配置参数
            indicatorDots: true,
            autoplay: true,
            interval: 3000,
            duration: 500,
            indicatorColor: "rgba(255,255,255,0.3)",
            indicatorActiveColor: "rgba(255,255,255,1)",
            circular: true
        },
        imgUrlBase:protocol.host+'Application/Uploads/',
        version: '2.0.0',
        
    },
    judge_order_or_no: false,  // 判断在下单页面过来的时候有没有下过订单
    dataList:null,           //从mine到orderDetails所带过去的参数
    comment_goods:null,     // 从mine 到 commentDetails 所带过去的参数
    /*小程序生命开始时要做的事情*/

    onLaunch: function() {
        var that = this;
    },
    CartLength:0,    // 购车车数量
    dataPickerData:null,   //时间选择参数
    choosedTime: null,    //选择的时间
    payInfo :[],      // 下单参数列表从购车车或者从产品详情页过来
    hasNewCart:false, //有新的购物车数据
    hasNewOrder:false //有新的订单数据
    
})