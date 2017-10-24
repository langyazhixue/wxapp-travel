const  Promise = require('../../lib/bluebird.min');   ///引入 Promise
const  regeneratorRuntime = require("../../lib/runtime");  // 引入Generator
const  app = getApp();
const  protocol = require('../../lib/protocol.js');
const util = require('../../lib/util.js');

/*mine入口*/

Page({
	data: {
		"hasList":true,  //控制tab切换
		"userWxInfo":null,   //微信头像和昵称
        "userOtherInfo":null,  //用户地址信息
		"hasOnLoad": false    ,  //控制页面是否发生过onLoad 事件
		 
		loading:false, //控制加载中
		loadInfo:'数据加载中。。。',
		
		orderInfoWxml: app.data.orderInfoWxml,
		
		orderInfoWxmlShow:null,  //页面显示的列表
		
		orderInfoPre:null ,       //去支付的列表
		
		judge_onLOad_Time:0,
		
		pullDownRefresh:false,
		imgUrlBase:app.data.imgUrlBase,   //全局图片地址
		
		data:null,  //全局数据
		'hasDownload':false,
		
	},
	
	/*获取缓存信息*/
	
	getLocalStorage: function(self) {
	    let storage = new protocol.storage();
	    if(storage.checkStorage("openid")){
	        if(storage.checkStorage("userWxInfo")) {
                self.setData({
                    "userWxInfo": wx.getStorageSync("userWxInfo"),
                })
            } else{
                self.login(self);  //调用login 获取数据
            }
            if (storage.checkStorage("userOtherInfo")){
                self.setData({
                    "userOtherInfo": wx.getStorageSync("userOtherInfo"),
                });
            }
            self.getUserInfo(self)
	    }
    },
    
    
    /*处理数据*/
   
    _handleData(data,self) {
        // 获取data
        //处理title 
        //处理图片地址
        //处理时间
        
        let imgUrlBase = self.data.imgUrlBase;
        //处理时间
        let getDate = new util.DateClass().getDate;
        
        for(let [i,v] of data.entries()) {
            for(let [j,item] of v.entries()){
//              let name = item.name ;
//              if(name.length >20){
//                  name = name.slice(0,19); 
//              }
//              item.name = name;
                item["title_img"] = imgUrlBase + item["title_img"];
                if(item.type == 2){
                   item["_createtime"]  = item['create_time'];
                   item['create_time'] =  getDate(Number(item['create_time'])*1000);
                   item.template = imgUrlBase+item.template;
                } else if(item.type == 1){
                    item["_createtime"]  = item['create_time'];
                    item["_departtime"]  = item['depart_time'];
                    item['create_time'] =  getDate(Number(item['create_time'])*1000);
                    item['depart_time'] = getDate(Number(item['depart_time'])*1000);
                }
                
            }
        }
        let showOrderList = self.handleOrderList(data);
        //console.log(data);
        
        self.setData({
            "data":{
                "error":0,
                "data":{
                    "orderList" :data,
                    "showOrderList" : showOrderList,
                }
            },
            "hasOnload":true
        })
        
        let data1 = self.data.data ;
        
        console.log(data1.error);
        console.log(data1.data);
    },
    
    _getOrders:function(self,openid, title1 = '加载成功',title2 = '加载失败'){
        /*获取订单信息*/
       
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        //showLoading();
        let  Orders = protocol.wxPromisify(wx.request,'Orders',{"openid":openid});
        
        Orders().then((res) =>{
            console.log(res);
            if(res.data.error == 0) {
                wx.hideLoading();
                 wx.stopPullDownRefresh();
                showToast(function(){
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
                },title1);
               
            } else {
                 wx.stopPullDownRefresh();
                showToast(function(){
                    self.setData({
                        "data": {
                            "error":1,
                            "data":null,
                            "hasOnload":true
                        }
                    });
                    
                },title2);
            }
            
        }).catch((value) =>{
             wx.stopPullDownRefresh();
            showToast(function(){
                self.setData({
                    "data": {
                        "error":1,
                        "data":null,
                    }
                })
            },title2);
        })
        
    },
        
	/*处理订单列表数据*/
	
	handleOrderList(data){
	    let showOrderList = [];
	    for ( let [index,value] of data.entries()) {
	        let item = value[0];
	        let length = value.length;
	        Reflect.set(item,"length",length);
	        
	        showOrderList.push(item);
	        let  sum_all = 0
	        for (let[i,v] of value.entries()){
	            sum_all += parseInt(v.sum);
	        }
	        Reflect.set(item,"sum_all",sum_all);
	    }
	    return showOrderList
	},
	
	/*获取用户信息*/
	
	_getUserInfo(self){
	    let openid = wx.getStorageSync('openid');
        let  User  = protocol.wxPromisify(wx.request,'User',{"openid":openid});
        User().then((res) =>{
            if(res.data.error ==0 
                && res.data.data !== null
                && res.data.data.length !=0
            ){
              let userInfo = res.data.data[0];
              if(typeof userInfo.name != 'undefined'
                && userInfo.name !=''
                &&userInfo.name != null
              ){
                  let userOtherInfo = {};
                  userOtherInfo.name = userInfo.name;
                  userOtherInfo.tel = userInfo.phone;
                  userOtherInfo.address = userInfo["consignee_address"];
                  self.setData({
                      "userOtherInfo": userOtherInfo,
                  })
              }
            } 
        })
	},
	
	/*onload事件*/
	
	onLoad(){
	    if(this.data.hasDownload){
	        return;
	    }
	    app.hasNewOrder = false;
        let self = this;
        this.getLocalStorage(self);  // 获取缓存
        let storage = new protocol.storage();
        if(storage.checkStorage("openid")){
            let openid =  wx.getStorageSync('openid');
            console.log(openid);
            this._getOrders(self,openid);
        }
        this._getUserInfo(self);
	},
	
	
    	
	/*tab 切换*/
	
	tab(e){
	    let index = e.currentTarget.dataset.index;
	    let hasList = this.data.hasList ; 
	    if(index == 1 && !hasList) {
	        this.setData({
	            hasList: true
	        })
	    } else if (index == 2 && hasList) {
	          this.setData({
                hasList: false
            })  
            
            
	    }
	},

    /*保存用户信息*/
    
    

	/*登录按钮*/
	loginAgain:function(){
	    let self = this ;
	    login(self);
	},
	
	login(self){
	    let  wxGetUserInfo = protocol.wxPromisify(wx.getUserInfo);
	    wxGetUserInfo({}).then((res) =>{
	        console.log(res);
            let userWxInfo  = res.userInfo;
            wx.setStorageSync("userWxInfo",userWxInfo);   //设置微信用户缓存
            self.setData({
                "userWxInfo": wx.getStorageSync("userWxInfo"),
            })
            let wx_nickname = userWxInfo.nickName;
            let sex = userWxInfo.gender ;
            let code = wx.getStorageSync("code")
            let save_user = protocol.wxPromisify(wx.request,'save_user',{"code":code,"sex":sex,"wx_nickname":wx_nickname});
            save_user().then((res) =>{
                console.log(res);
                console.log('传递用户昵称成功')
            })
            
        }).catch((res) =>{
            // 去设置页面
            console.log('去设置');
            wx.showModal({
                title: '用户未授权',
                content: '如需正常使用阅读记录功能，请按确定并在授权管理中选中“用户信息”，然后点按确定。最后再重新进入小程序即可正常使用。',
                showCancel: false,
                success:function(res){
                    if (res.confirm) {
                        console.log('用户点击确定')
                        wx.openSetting({
                            success:function(res){
                                wx.getSetting({
                                    success:function(res){
                                        let  authSetting = res.authSetting ;
                                        if(authSetting["scope.userInfo"] == true){
                                            wx.getUserInfo({
                                                success: function (res) {
                                                    let userWxInfo  = res.userInfo;
                                                    wx.setStorageSync("userWxInfo",userWxInfo);   //设置微信用户缓存
                                                    self.setData({
                                                            "userWxInfo": wx.getStorageSync("userWxInfo"),
                                                    })
                                                    
                                                    //保存用户信息
                                                    let wx_nickname = userWxInfo.nickName;
                                                    let sex = userWxInfo.gender ;
                                                    let code = wx.getStorageSync("code");
                                                    let save_user = protocol.wxPromisify(wx.request,'save_user',{"code":code,"sex":sex,"wx_nickname":wx_nickname});
                                                    save_user().then((res) =>{
                                                        console.log(res);
                                                        console.log('传递用户昵称成功')
                                                    })
                                                    
                                                },
                                                fail: function () {
                                                    
                                                }                
                                            })
                                            
                                        }
                                    },
                                    fail: function(){
                                        
                                    }
                                })
                            },
                            fail:function(){
                            }
                        })
                    }
                }
            })
        })
	},
	
	/*编辑用户信息*/
	
	editor:function(){
	    let self = this ;
	    let chooseAddress = protocol.wxPromisify(wx.chooseAddress);
	    chooseAddress({}).then((res) =>{
	       console.log(res);
	       
	       let userName = res.userName;
	       let telNumber = res.telNumber;
	       
	       let countyName =  res.countyName;
	       let provinceName = res.provinceName;
	       let cityName = res.cityName;
	       
	       let detailInfo =  res.detailInfo;
	       let userOtherInfo = {};
	       
	       userOtherInfo.name = userName;
	       
	       userOtherInfo.tel = telNumber;
	       
	       let address = provinceName+cityName+countyName+detailInfo;
	       userOtherInfo.address = address;
	       
	       console.log(countyName);
	       console.log(provinceName);
	       console.log(cityName);
	       console.log(detailInfo);
	       let openid = wx.getStorageSync('openid')
	       //去服务器更新用户信息
	       let updateUser = protocol.wxPromisify(wx.request,'User/update_user',{"openid":openid,"phone":telNumber,"name":userName,"consignee_address":address})
	       updateUser().then((res) =>{
	           if(res.data.error == 0){
	                console.log('进入');
	                wx.setStorageSync("userOtherInfo",userOtherInfo);
	                self.setData({
	                    "userOtherInfo":userOtherInfo
	                })
	           }
	       }).catch((res) =>{
	           
	       })
	       
	    }).catch((res) =>{
	        
	    })
	},
	
	getUserInfo:function(self){
	    let openid = wx.getStorageSync('openid');
	    let User = protocol.wxPromisify(wx.request,'User',{"openid":openid});
	    User().then((res) =>{
	        if(res.data.error ==0){
	            let obj = res.data.data[0];
	            let name = obj.name;
	            let phone =  obj.phone;
	            let consignee_address = obj["consignee_address"];
	            let userOtherInfo = {};
                userOtherInfo.name = name;
                userOtherInfo.tel = phone;
                userOtherInfo.address = consignee_address;
                self.setData({
                    "userOtherInfo":userOtherInfo
                })
                wx.setStorageSync("userOtherInfo",userOtherInfo);
	        }
	    })
	},
	/*去上传签证*/
	
	goTouploadDetails(e){
	    let order_id = e.currentTarget.dataset.orderid;
	    wx.navigateTo({
	        url:'../uploadDetails/uploadDetails?order_id='+order_id //把参数带过去
	    })
	},
	
	/*去详情页*/
	
	goToorderDetails(e) {
	    let index = e.currentTarget.dataset.index;
	    let orderList = this.data.data.data.orderList;
	    console.log(orderList);
	    
        let dataList =orderList[index];
        app.dataList =  dataList;
        wx.navigateTo({
            url:'../orderDetails/orderDetails', //把参数带过去
            success:function(){
                
            }
        })
	},
	
	/*去评价页面*/
	
	goTocomment(e){
	    let order_id = e.currentTarget.dataset.orderid;
	    let index = e.currentTarget.dataset.index;
	    let data = (this.data.data.data.orderList);
	    console.log(data);
	    let d =data[index];
	    
	    console.log(d);
	    let comment_goods = [];
	    for(let [i,v] of  d.entries()){
	        let type = v.type;
	        let goods_id = v["goods_id"];
	        let obj = {
	            type:type,
	            goods_id:goods_id
	        }
	        comment_goods.push(obj)
	    }
	    
	    app.comment_goods = comment_goods;
	    wx.navigateTo({
            url:'../uploadComment/uploadComment?order_id='+order_id, //把参数带过去
        })
	    
    },
    
    /*show再次打开时候*/
    onShow:function(){
        //更新用户信息
        if(this.data.hasDownload){
            return false;
        }
        let self =  this ;
        if(this.data.hasOnload && app.hasNewOrder){
            app.hasNewOrder = false;
            this.getUserInfo(self); //更新用户信息
            //更新新订单信息
            let openid =  wx.getStorageSync('openid');
            console.log(openid);
            this._getOrders(self,openid,'更新成功','更新失败');
        }
        
    },
    
    /*下拉刷新*/ 
    downloadTemplate:function(e){
        this.setData({
            "hasDownload": true,
        })
        
        let  self =  this;
        let  src = e.currentTarget.dataset.src;
        console.log(src);
        if(src == '' || src == null){
            return ;
        };
        
        let save = new protocol.upload_and_download().saveImageToAlbum;
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        
        //showLoading('下载中');
        
        wx.downloadFile({
            url:src,
            success: function (res) {
                console.log(res);
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                let  tempFilePath = res.tempFilePath;
                //console.log(tempFilePaths);
                wx.saveImageToPhotosAlbum({
                    filePath: tempFilePath,
                    success: function(res){
                        showToast(function(){
                            self.setData({
                                "hasDownload": false,
                            })
                        },'保存成功')
                    },
                    fail: function(res){
                        showToast(function(){
                            self.setData({
                                "hasDownload": false,
                            })
                        },'保存失败')
                    }
                })
            },
            fail: function (res) {
                showToast(function(){
                    console.log(res);
                    self.setData({
                        "hasDownload": false,
                    })
                    
                },'下载失败')
            }
        })
    },
    
    /*删除订单*/
   deleteOrder:function(e){
       let pay_status =  e.currentTarget.dataset.paystatus;
       let order_id =  e.currentTarget.dataset.orderid;
       let index = e.currentTarget.dataset.index;
       
       let  self =  this;
       let orderList = this.data.data.data.orderList;
       let showOrderList =  this.data.data.data.showOrderList;
       
//     "data":{
//              "error":0,
//              "data":{
//                  "orderList" :data,
//                  "showOrderList" : showOrderList,
//              }
//          },
            
       
       let  showModal = new protocol.wxCommonAPI().showModal;
       let showToast = new protocol.wxCommonAPI().showToast;
       let showLoading = new protocol.wxCommonAPI().showLoading;
       
       
        
       showModal(function(){
           //确定删除订单
           let delete_orders = protocol.wxPromisify(wx.request,'Orders/delete_orders',{
                "order_id": order_id,
                "pay_status": pay_status,
            });
           delete_orders().then((res) =>{
               if(res.data.error == 0){
                   //删除成功
                   orderList.splice(index,1);
                   showOrderList.splice(index,1);
                   self.setData({
                       "data":{
                            "error":0,
                            "data":{
                                "orderList" :orderList,
                                "showOrderList" : showOrderList,
                            }
                        }
                   })
                   
               } else{
                   //删除失败
                   showToast(function(){
                       
                       
                   },'删除失败')
               }
           }).catch((res) =>{
                showToast(function(){
                       
                },'删除失败')
           })
       
       },'您确定要删除这个订单吗',function(){
           //取消删除订单
       },function(){
           //删除订单失败
            showToast(function(){
                       
            },'删除失败')
           
       },'提示',true)
   },
   
   
   /*下拉刷新*/
    onPullDownRefresh: function(){
        let  self = this;
        let storage = new protocol.storage();
        let i = storage.checkStorage("openid");
        if(i == 0 ){
            wx.stopPullDownRefresh();
            return;    
        } else{
            let openid = wx.getStorageSync('openid');
            this._getOrders(self,openid,'更新成功','更新失败')  //获取数据
        }
       
    },
    
})

