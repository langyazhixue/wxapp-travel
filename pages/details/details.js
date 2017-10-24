
const app = getApp();
const protocol = require('../../lib/protocol.js');
const util = require('../../lib/util.js');

/*app入口*/

Page({
    data: {
        "swiperConfig": app.data.swiperConfig,  // 轮播图的配置
        "imgUrlBase":app.data.imgUrlBase,      //基础图片路径
        "banner": null,  //头部轮播
        "title": null,   //题目和价格
        "dataPicker": null,  //时间选择
        "info":null,         //介绍
        "comment":null,      //评论
//      "actInfo": null ,     // 活动情况
        "actData":null,
        "know":null,
        "modalInfo":null,     //弹窗信息
        "start_time":null,    //开始时间
        "end_time":null,     //结束时间
         
        "act":{    //act切换 
            act: true,
            know: false
        },
        img: {   //act切换图片信息
            act:'../../images/20170630002_60x60.png',
            konw: '../../images/20170630005_60x60.png',
        },
        "shop_cart":app.CartLength, //购物车数量参数
        "height":0,              //窗口高度
        "overflow":"scroll",    //控制窗口滚动参数   
        
        "animateStyle": null,                        //控制动画
        
        "hasCover":false,     // 控制遮罩层
    },  
    
     /*处理数据*/
    
    _handleData(data,self,choosedTime) {
        // 获取data
        //处理title 
        //处理图片地址
        console.log('处理');
        //console.log(data);
        let imgUrlBase = self.data.imgUrlBase;
        let goods =  data.goods;
        let getDate = new util.DateClass().getDate;
        //开始时间，结束时间
        
        let start_time = null,
            end_time  = null;
            
        if( typeof  goods["start_time"] !== 'undefined'
            && goods["start_time"] !== null
            && goods["start_time"]!== ''
        ){
            start_time = getDate(Number(goods["start_time"])*1000);
            
        }
        
        if( typeof goods["end_time"] !== 'undefined'
            && goods["end_time"] !== null
            && goods["end_time"]!== ''
        ){
            end_time = getDate(Number(goods["end_time"])*1000);
        }
        
        
        // banner 
        let banner = null;
        if( typeof  goods.slideshow !== 'undefined'
            && goods.slideshow !== null
            && goods.slideshow !== ''
        ){
            banner = JSON.parse(goods.slideshow);
            for( let[i,v] of banner.entries()) {
                banner[i] =  imgUrlBase + banner[i]
            }
        }
        console.log(banner);
        
        
        //title 
        
        let title = {};
        let t = null, price = null, discount = null, p =null,dis = null;
        if( typeof goods.title !== 'undefined'
            && goods.title !== null
            && goods.title !== ''
            
        ){
            t = goods.title;
            if(t.length >20){
                t.slice(0,19)+'...' ;
            }
            title.titleData = t ;
        }
        
        if(typeof goods.price !== 'undefined'
            && goods.price !== null
            && goods.price !== ''
    ){   
            price = goods.price ;
            title.price = price ;
        }
        
        if(typeof goods.discount !== 'undefined'
            && goods.discount !== null
            && goods.discount !== ''
        ){
            let a = [];
            dis = JSON.parse(goods.discount);
             
            for (let [i,v] of dis.entries()){
                a.push(v.discount);
            }
            discount = Math.min(...a);
            title.discount = discount ;
        }
        
        console.log(title);
        
        //dataPicker
        
        let dataPicker = {};
        let start_day = null;
        dataPicker.price = price;
        dataPicker.discount = dis;
        
        if(typeof goods["start_day"] !== 'undefined'
            && goods["start_day"] !== null
            && goods["start_day"] !== ''
        ){
            start_day = goods["start_day"];
        }
        dataPicker["start_day"] = start_day
        console.log(dataPicker);
        
        // info 
        
        let info = null;
        
        if(typeof goods["act_info"] !== 'undefined'
            && goods["act_info"] !== null
            && goods["act_info"] !== ''
        ){
            info = goods["act_info"]
        }
       
        // comment
        
        let  commentOnPage = null;
        if(typeof data.comment !== 'undefined'
            && data.comment !== null
            && data.comment !== ''
            && data.comment.length !== 0
        ){
            commentOnPage = {} ;
            let comment = data.comment ;
            commentOnPage.length = comment.length ;
            commentOnPage["goods_type"] = 1 ;
            commentOnPage["goods_id"] = goods.id;
            commentOnPage.firstList =  comment[0] ;
            
            commentOnPage.firstList["user_name"] = commentOnPage.firstList["user_name"];
            
        }
        
        //  actInfo
        
        let actInfo = null,
            act = [],
            know  = {},
            start_city = '',
            end_city = '',
            godays = '',
            fee_in = '',
            fee_no = '',
            tips = '';
        
        if(typeof goods.route !== 'undefined'
            && goods.route !== null 
            && goods.route !== '' 
            && goods.route.length !==0 
        ){
            //actInfo = {};
            act = goods.route;
            //console.log(actInfo.act);
        }
        
        if(act.length != 0){
            for (let [i,v] of act.entries()){
                let url = JSON.parse(v["url"]) ;
                v["url"] = url;
               // console.log(url);
                let arr = []
                for (let j = 0; j < url.length; j++){
                    if(url[j] !=''){
                        arr.push(imgUrlBase + url[j]);
                    }
                }
                
                v["url"] = arr;
            }
        }
        
        if(typeof goods["start_city"] !== 'undefined'
            && goods["start_city"]!== null
            && goods["start_city"] !== ''
        ){
            start_city = goods["start_city"];
        }
//      
        if(typeof goods["end_city"] !== 'undefined'
            && goods["end_city"] !== null 
            && goods["end_city"] !== '' 
        ){
            end_city = goods["end_city"];
        }
//      
        if(typeof goods.godays !== 'undefined'
            && goods.godays !== null
            && goods.godays !== ''
        ){
            godays = goods.godays;
        }
//      
        if(typeof goods["fee_in"] !== 'undefined'
            && goods["fee_in"] !== null
            && goods["fee_in"] !== ''
        ){
            //console.log('fee_in');
            //console.log(goods.fee_in);
            
            fee_in = goods['fee_in'];
        }
//      
        if(typeof goods["fee_no"] !== 'undefined'
            && goods["fee_no"] !== null
            && goods["fee_no"] !== ''
        ){
            fee_no = goods["fee_no"];
        }
//      
        if(typeof goods.tips !== 'undefined'
            && goods.tips !== null
            && goods.tips !== ''
        ){
            tips = goods.tips;
        }
        
            know.godays = godays;
            know.startcity= start_city;
            know.endcity = end_city;
            know.feein = fee_in;
            know.feeno = fee_no;
            know.tips = tips;
        
        
        
        console.log(know);
        //console.log(actInfo);
        
        
        //modalInfo
        let  modalInfo = {};
        
        modalInfo.price = price;
        
        modalInfo.discount = discount;
        
        modalInfo.num = 1;
        
        modalInfo.title = t;
        modalInfo.hasStartTime = false;
        modalInfo.choosedTime = null
        
        modalInfo.titleAll = goods.title;
        //console.log(goods);
        if(typeof goods["title_img"] !== 'undefined'
            && goods["title_img"] !== null
            && goods["title_img"] !== ''
        ){
            modalInfo["title_img"] = imgUrlBase + goods["title_img"];
            
        }
        
        modalInfo["goods_id"] = goods.id;
        
        console.log(modalInfo);
        
        self.setData({
            "data": {
                "error": 0,
                "data": 1,
            },
            "banner": banner,  //头部轮播
            "title": title,   //题目和价格
            "info": info,         //介绍
            "comment": commentOnPage,      //评论
           //"actInfo": actInfo,// 活动情况
            "actData":act,
            "know":know,
            "modalInfo": modalInfo,  //弹窗
            "start_time": start_time,
            "end_time": end_time,  //结束时间
            "dataPicker": dataPicker  //时间选择所需要的参数
        })
    },
    
    /*getData*/
    
    _getGoodsInfoData(self,id,choosedTime){
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        //showLoading();
        let GoodsInfo = protocol.wxPromisify(wx.request,'GoodsInfo',{"id":id,"type":1});
        GoodsInfo().then((res) =>{
            console.log(res);
            if(res.data.error == 0){
                wx.hideLoading();
//              showToast(function(){
//                  if(res.data.data.length == 0) {
//                      self.setData({
//                          "data": {
//                              "error":0,
//                              "data":null,
//                          }
//                      })
//                      
//                  }else {
//                      self._handleData(res.data.data,self,choosedTime);  //处理数据，再把数据放到data中
//                  }
//              },'加载成功');
                if(res.data.data.length == 0) {
                    self.setData({
                            "data": {
                                "error":0,
                                "data":null,
                            }
                        })
                        
                }else {
                    self._handleData(res.data.data,self,choosedTime);  //处理数据，再把数据放到data中
                }
               
            } else {
                showToast(function(){
                    self.setData({
                        "data": {
                            "error":1,
                            "data":null,
                        }
                    });
                    
                }, '加载失败');
            }
            
        }).catch((value) =>{
            
            showToast(function(){
                self.setData({
                    "data": {
                        "error":1,
                        "data":null,
                    }
                })
            },'加载失败');
        })
    },
    
    /* 生命周期函数--监听页面加载*/

    onLoad: function (options) {
        let getSystemInfo = protocol.wxPromisify(wx.getSystemInfo);
        
        let self = this;
        
        let choosedTime = app.choosedTime;
        
        
        getSystemInfo().then((res) =>{
            let height = res.windowHeight+ 'px';
            console.log(height);
            self.setData({
                "shop_cart":app.CartLength,
                "height": height
            })
            let id = options.id;
            self._getGoodsInfoData(self,id,choosedTime);
            
        }).catch((res) =>{
            
        })
    },
    
    /*onShow*/
    onShow:function(){
        let choosedTime = app.choosedTime ;
        //console.log(choosedTime);
        
        if(choosedTime != null ){
            app.choosedTime = null;
            let modalInfo =  this.data.modalInfo;
            modalInfo.hasStartTime = true;
            modalInfo.choosedDate = choosedTime.choosedDate ;
            modalInfo.choosedPrice = choosedTime.choosedPrice;
            //console.log(modalInfo);
            this.setData({
                "modalInfo": modalInfo
            })
        }
        
    },
    
    
    /*tab 切换*/
   
    actChange: function(e) {
      //console.log(e);
       var target = e.currentTarget.dataset.tab;
       var act = this.data.act;
       if(target == 'act' && !act.act){
           this.setData({
                act:{
                    act: true,
                    know: false,
                },
                img: {
                    act: '../../images/20170630002_60x60.png',
                    konw: '../../images/20170630005_60x60.png',
                },
           })
       } else if (target == 'know' && !act.konw){
           this.setData({
                act:{
                    act: false,
                    know: true,
                },
                img: {
                    act: '../../images/20170630003_60x60.png',
                    konw: '../../images/20170630004_60x60.png',
                },
           })
       }
    },
    
    /*跳转*/
   
    go(e) {
        let u  = e.currentTarget.dataset.link;
        console.log(u);
        wx.navigateTo({
            url: u
        })
    },
    
    /*跳去dataPicker页面*/
    
    g:function(){
        let dataPicker =  this.data.dataPicker;
        app.dataPickerData = dataPicker;
        wx.navigateTo({
            url:'../dataPicker/dataPicker',
            success:function(){
                app.dataPickerData = dataPicker;
            }
        })
    },
     
    /*减少数量*/
    minusCount:function(){
        let modalInfo =  this.data.modalInfo;
        if(modalInfo.num>1){
            modalInfo.num--
        }
        this.setData({
            "modalInfo": modalInfo 
        })
    },
    
    /*增加数量*/
    addCount:function(){
        let modalInfo =  this.data.modalInfo;
        modalInfo.num++
        this.setData({
            "modalInfo": modalInfo 
        })
    },
    
    /*加入购物车按钮*/
   
    /*去支付按钮*/
   
    // 1 加入购物车，2 去支付
    
    GoToCart:function(){
        let animateStyle = 'aniStyle1';
        let modalInfo =  this.data.modalInfo;
        modalInfo.buttonType = 1;
        this.setData({
            "animateStyle": animateStyle,
            "hasCover": true,
            "modalInfo":modalInfo,
        })
    },
    GoToPay: function(){
        let animateStyle = 'aniStyle1';
        let modalInfo =  this.data.modalInfo;
        modalInfo.buttonType = 2;
        this.setData({
            "animateStyle": animateStyle,
            "hasCover": true,
            "modalInfo":modalInfo,
        })
    },
    /*弹窗出现*/
    
    showModal:function(){
        
    },
    
    /*弹窗消失*/
  
    hideModal:function(){
        let animateStyle = 'aniStyle2';
        let modalInfo = this.data.modalInfo;
        modalInfo.buttonType = 0;
        this.setData({
            "animateStyle": animateStyle,
            "hasCover": false,
            "modalInfo":modalInfo
        })
        
    },
    
    
    /*弹窗消失*/
   
    _hideMoadl:function(self){
        let animateStyle = 'aniStyle2';
        let modalInfo = self.data.modalInfo;
        modalInfo.buttonType = 0;
        self.setData({
            "animateStyle": animateStyle,
            "hasCover": false,
            "modalInfo":modalInfo
        })
   },
   
    /*加入购物车或者去支付*/
   
    goTo:function(e){
        let self =  this;
        let buttonType = e.currentTarget.dataset.buttontype;
        let modalInfo  = this.data.modalInfo;
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
       
        if(typeof modalInfo.choosedDate !== 'undefined'
            && modalInfo.choosedDate != null
        ){
            if(buttonType == 1){
                showLoading();
                let  modalInfo  = this.data.modalInfo;
                let openid =  wx.getStorageSync('openid');
                let goods_id = modalInfo["goods_id"];
                let nu = modalInfo.num;
                let price = nu*modalInfo.choosedPrice;
                let type = 1;
                let start_day = (new Date(modalInfo.choosedDate).getTime())/1000;
                let saveCart = protocol.wxPromisify(wx.request,'Cart/save_cart',{"openid":openid,"goods_id":goods_id,"nu":nu,"price":price,"type":type,"start_day":start_day})
                saveCart().then((res) =>{
//                  console.log('save');
                    console.log(res);
                    if(res.data.error == 0){
                        wx.hideLoading();
                        let shop_cart = res.data.cart_num;
                        
                        app.CartLength = shop_cart;
                        app.hasNewCart = true ;
                        
                        showToast(function(){
                            self.setData({
                               shop_cart: shop_cart,
                            })
                            self._hideMoadl(self);
                            
                        },'加入购物车成功');
                    }else{
                        wx.hideLoading();
                        showToast(function(){
                        },'加入购物车失败');
                    }
                }).catch((res) =>{
                        wx.hideLoading();
                        showToast(function(){
                                
                        },'加入购物车失败');
                    
                });
                
            } else if(buttonType == 2){
                //直接去下单
                let  modalInfo  = this.data.modalInfo;
                let openid =  wx.getStorageSync('openid');
                let goods_id = modalInfo["goods_id"];
                let title = modalInfo.titleAll;
                let goods_price = modalInfo.choosedPrice;
                let goods_num = modalInfo.num;
                let order_sum = goods_price*goods_num;
                let depart_time = modalInfo.choosedDate;
                let pay_type = 1;
                let pay_status = 0;
                let type = 1;
                //额外的参数，页面中需要用到的
                let title_img = modalInfo["title_img"];
                let obj = {
                    "openid":openid,
                    "goods_id":goods_id,
                    "title":title,
                    "goods_price":goods_price,
                    "goods_num":goods_num,
                    "order_sum":order_sum,
                    "depart_time":depart_time,
                    "pay_type":pay_type,
                    "pay_status":pay_status,
                    "type":type,
                    "title_img":title_img
                }
                
                /*跳去支付*/
                app.payInfo = [];
                app.payInfo.push(obj);
                wx.navigateTo({
                    url:'../order/order',
                    success:function(){
                        
                    },
                })
            }
            
        } else{
            showToast(function(){
                
            },'请选择时间');
        }
        
    },
    
    /*页面跳转*/
    gos(e){
    let u = e.currentTarget.dataset.link;
    console.log(u);
    //return false;
        wx.switchTab({
          url: u
        })
    },
  
})