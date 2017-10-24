
const  Promise = require('../../lib/bluebird.min');   ///引入 Promise
const  regeneratorRuntime = require("../../lib/runtime");  // 引入Generator

const app = getApp();
const protocol = require('../../lib/protocol.js');
const util = require('../../lib/util.js');



Page({
    data: {
        "swiperConfig":app.data.swiperConfig,  //轮播图配置信息
        "imgUrlBase" : app.data.imgUrlBase,   //图片基础地址
        "data":null,//数据
        "version":app.data.version,
    },
    
    /*处理数据*/
   
    _handleData(data,self){
        let banner;
        let  items;
        let  push;
        let imgUrlBase = self.data.imgUrlBase;
        
        if(data.banner.length !=0) {
            banner = data.banner;
            for(let [index,item] of banner.entries()){
                item.img = imgUrlBase+ item.img;
            }
        } else{
            banner = null ;
        }
        
        if(data.items.length !=0){
            items = data.items;
            for(let [index,value] of items.entries()){
                value.icon = imgUrlBase+ value.icon;
            } 
        } else{
            items = null ;
        }
        
        if(data.push.length !=0){
            push = data.push;
           
            for(let [index,item] of push.entries()){
                item["title_img"] = imgUrlBase+ item["title_img"];
            }
        } else{
            push = null ;
        }
        
        let _data = {
            "banner": banner,
            "items": items,
            "push": push
        }
        
        self.setData({
            "data": {
                "error":0,
                "data":_data,
                "hasOnload":true
            }
        })
    },
    
    /*获取数据*/
   
    _getHomeData(self,version,openid){
        console.log(openid);
        //return;
        let get = protocol.wxPromisify(wx.request,'HomePage',{"version": version,"openid": openid});
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        //showLoading('加载中...');
        
        get().then((res) =>{
            console.log('获取首页数据');
            console.log(res);
            if(res.data.error == 0) {
                wx.hideLoading();
                wx.stopPullDownRefresh();
//              showToast(function(){
//                  if(res.data.data.length == 0) {
//                      self.setData({
//                          "data": {
//                              "error":0,
//                              "data":null,
//                              "hasOnload":true
//                          }
//                      })
//                      
//                  }else {
//                      self._handleData(res.data.data,self);  //处理数据，再把数据放到data中
//                  }
//              },'加载成功');
                if(res.data.data.length == 0) {
                        self.setData({
                            "data": {
                                "error":0,
                                "data":null,
                                "hasOnload":true
                            }
                        })
                        
                    }else {
                        self._handleData(res.data.data,self);  //处理数据，再把数据放到data中
                }
               
            } else {
                wx.hideLoading();
                wx.stopPullDownRefresh();
                showToast(function(){
                    self.setData({
                        "data": {
                            "error":1,
                            "data":null,
                             "hasOnload":true
                        }
                    });
                    
                }, '加载失败');
            }
            
        }).catch((value) =>{
            wx.hideLoading();
            wx.stopPullDownRefresh();
            //console.log(value);
            showToast(function(){
                self.setData({
                    "data": {
                        "error":1,
                        "data":null,
                         "hasOnload":true
                    }
                })
            },'加载失败');
        })
        
    },
    
    /*获取购物车信息*/
    _getCart:function(openid){
        let Cart = protocol.wxPromisify(wx.request,'Cart',{"openid":openid});
        Cart().then((res) =>{
            if(res.data.error == 0) {
                //console.log(res.data.data);
                //console.log(res.data.data.length);
                app.CartLength = res.data.data.length;
                //console.log(app.CartLength);
            }
        }).catch((res) =>{
            
        })
    },
    
    /*微信授权*/
   
    goTO:function(x,self,version){
        function wxLogin(){
            return new Promise ((resolve,reject) =>{
                
                let  l = protocol.wxPromisify(wx.login);
                
                l({}).then((res) =>{
                    let code = res.code;
                    
                    console.log('coode'+code);
                    
                    wx.setStorageSync("code",code);   //设置code用户缓存
                    resolve({error:0})
                    
                }).catch((res) =>{
                    reject({error:1})
                })
                
            })
        };
        
        /*获取用户信息*/
       
        function getUserInfo(self)  {
            return new Promise ((resolve,reject) =>{
                let wxGetUserInfo = protocol.wxPromisify(wx.getUserInfo);
                wxGetUserInfo({}).then((res) =>{
                    let userWxInfo  = res.userInfo;
                    //console.log('userWxInfo'+userWxInfo);
                    wx.setStorageSync("userWxInfo",userWxInfo);   //设置微信用户缓存
                    resolve({error:0})   
                }).catch((res) =>{
                    // 去设置页面
                    //console.log('去设置');
                    wx.showModal({
                        title: '用户未授权',
                        content: '如需正常使用阅读记录功能，请按确定并在授权管理中选中“用户信息”，然后点按确定。最后再重新进入小程序即可正常使用。',
                        showCancel: false,
                        success:function(res){
                            if (res.confirm) {
                                //console.log('用户点击确定')
                                wx.openSetting({
                                    success:function(res){
                                        resolve({error:0});
                                    },
                                    fail:function(){
                                        reject({error:1})
                                    }
                                })
                            }
                        }
                    })
                })
            })
        };  
        
         /*添加用户*/
        
        function save_user(code,wx_nickname,sex){
           return new Promise((resolve,reject) =>{
               let saveUser = protocol.wxPromisify(wx.request,'User/save_user',{"code":code,"wx_nickname": wx_nickname,"sex":sex});
               saveUser().then((data) => {
                   
                   console.log(data);
                   let openid = data.data.data;
                   wx.setStorageSync("openid",openid);
                   resolve({error:0,data:{"openid":openid}});
                   
               }).catch((res) =>{
                   // 添加用户信息有误
                   reject({error:1})
               })
           })
        }
        
        
        
        function* g(t,self) {
            try{
                if(t == 0 ){
                    let d = yield wxLogin();
                    if(d.error == 0){
                        let userInfo  = yield getUserInfo();  //获取微信信息
                        if(userInfo.error == 0){
                            let code = wx.getStorageSync("code");
                            let userWxInfo,
                                wx_nickname = null,
                                sex = null;
                            let storage = new protocol.storage();
                            if(storage.checkStorage("userWxInfo")){
                                userWxInfo = wx.getStorageSync("userWxInfo");
                                wx_nickname = userWxInfo.nickName;
                                sex = userWxInfo.gender ;
                            }
                            let  saveUser_return =  yield  save_user(code,wx_nickname,sex);  //获取openid
                            if(saveUser_return.error == 0){
                                let openid = saveUser_return.data.openid;
                                //获取订单信息
                                console.log(openid);
                                self._getHomeData(self,version,openid);
                                self._getCart(openid);
                                // 去获取购物车的信息
                                
                            }
                        } 
                    }
                } else{
                    //获取订单信息
                    let openid = wx.getStorageSync('openid');
                    self._getHomeData(self,version,openid)
                    self._getCart(openid);
                }
                
            }catch(e){
                throw new Error(e)
            }
        };
    
        /*状态机运行*/
        
        function run (t){
            let  it = t;
            let go = (result) =>{
                //console.log(result);
                if (result.done){
                   return result.value;
                } else{
                    return result.value.then((value) =>{
                        return go(it.next(value))
                    },(error) =>{
                        return go(it.throw(error)); //在函数体外抛出，但是可以在函数内捕获
                    })
                }
            }
            go(it.next());
        };
        /*运行*/
        let t = g(x,self);
        run(t);
    },
    
    /*首页onLoad 事件*/
   
    onLoad: function() {
        // 在 onLoad 事件中执行完成再修改 hasOnLoad 状态
        let self = this;
        let storage = new protocol.storage();
        let i = storage.checkStorage("openid");
        let version =  this.data.version ;
        this.goTO(i,self,version);
    },
    
    /*绑定去新页面事件*/
    
    go(e) {
        let u  = e.currentTarget.dataset.link;
        //console.log(u);
        wx.navigateTo({
            url: u
        })
    },
    
    /*下拉刷新首页*/
   
    onPullDownRefresh: function(){
        let self = this;
        let storage = new protocol.storage();
        let i = storage.checkStorage("openid");
        if(i == 1){
            let version = this.data.version;
            let openid = wx.getStorageSync('openid');
            this._getHomeData(self,version,openid);
        } else{
            wx.stopPullDownRefresh();
        }
    },
        
})