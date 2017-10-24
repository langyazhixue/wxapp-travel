
var app=getApp();
var protocol = require('../../lib/protocol.js');



const goods = [{
  'id1': '1',
  "type": 1,
  "id": '111',
  "title": '日本旅游产品日本旅游产品',
  "img": '../../images/20170707009_220x220.jpg',
  "price": 12,
  "discount": 10,
  "sum": 44,
  "drive": 2,
  "start_city": '上海',
  "end_city": '日本',
  "start_day": '2017-08-07',
  "num": 1,
  "selected": true,
  "display": 'y'
}, {
  'id1': '2',
  "type": 1,
  "id": '112',
  "title": '韩国旅游产品日本旅游呆呆呆呆呆呆地产品',
  "img": '../../images/20170707009_220x220.jpg',
  "price": 15,
  "discount": 10,
  "drive": 2,
  "sum":44,
  "start_city": '上海',
  "end_city": '韩国',
  "start_day": '2017-08-09',
  "num": 2,
  "selected": true,
  "display": 'y'
}, {
  'id1': '3',
  "type": 2,
  "id": '113',
  "title": '韩国旅游产品日发发发发发发反反复复本旅游产品',
  "img": '../../images/20170707009_220x220.jpg',
  "price": 220,
  "discount": 300,
  "sum": 44,
  "drive": 2,
  "start_city": '上海',
  "end_city": '日本',
  "start_day": '2017-08-09',
  "num": 2,
  "country": '日本',
  "visa_type": '单次签证',
  "area": '大阪',
  "selected": true,
  "display": 'y'
}, {
  'id1': '4',
  "type": 2,
  "id": '113',
  "title": '泰国旅游产品日本旅游产品',
  "img": '../../images/20170707009_220x220.jpg',
  "price": 220,
  "discount": 300,
  "sum": 44,
  "drive": 2,
  "start_city": null,
  "end_city": null,
  "start_day": null,
  "num": 2,
  "country": '泰国',
  "visa_type": '单次签证',
  "area": '曼谷',
  "selected": true,
  "display": true
}, {
  'id1': '5',
  "type": 1,
  "id": '111',
  "title": '日本旅游产品日本旅游产品',
  "img": '../../images/20170707009_220x220.jpg',
  "price": 12,
  "discount": 10,
  "sum": 44,
  "drive": 2,
  "start_city": '上海',
  "end_city": '日本',
  "start_day": '2017-08-07',
  "num": 1,
  "selected": true,
  "display": true
}
]


/*order入口*/

Page({
	  data: {
	      "userOtherInfo":null,
        "payInfo":null,
    		'hasClick':true,
    		"hasUserInfo":null
	   },
    	
	/*获取订单参数*/
				
	  onLoad:function(res){
	      //那订单数据
        let payInfo = app.payInfo;
        app.payInfo = [];
        this.setData({
            "payInfo": payInfo
        })
        
        console.log(payInfo);
        //计算总价
        this.getTotalPrice(payInfo)
        
        //去服务器拿用户的数据
        let self = this;
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
                       "hasUserInfo":true
                  })
              } else{
                  self.setData({
                      "hasUserInfo":false
                  })
              }
            } else{
                self.setData({
                    "hasUserInfo":false
                })
            }
        }).catch((res)=>{
             self.setData({
                  "hasUserInfo":false
              })
        })
	  },

      /* 计算总价*/
    getTotalPrice(payInfo) {
        let total = 0
        for (let [index, item] of payInfo.entries()) {         // 循环列表得到每个数据
            if(item.type == 1){
                total+=item.order_sum
            } else if (item.type == 2){
                total+=item.visa_sum
            }
        }
        this.setData({                                // 最后赋值到data中渲染到页面
          totalPrice: total
        });
    },
  
  /*选择地址*/
  
    chooseAddress(){
      let self =  this;
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
            self.setData({
                "userOtherInfo": userOtherInfo
            })
            
            let  hasUserInfo = self.data.hasUserInfo;
            console.log(hasUserInfo );
            if(hasUserInfo == false){
                //走更新用户
                let openid = wx.getStorageSync('openid')
                //去服务器更新用户信息
                let updateUser = protocol.wxPromisify(wx.request,'User/update_user',{"openid":openid,"phone":telNumber,"name":userName,"consignee_address":address})
                updateUser().then((res) =>{
                    if(res.data.error == 0){
                        console.log('进入');
                        wx.setStorageSync("userOtherInfo",userOtherInfo);
                    }
                })
            }
        })
    },
    
    /*提交订单*/
    
    formSubmit:function(e){
        if(this.data.hasClick == false){
            return false;
        }
        let self =  this;
        console.log(e);
        console.log(this.data.payInfo);
        
        let userOtherInfo = self.data.userOtherInfo;
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        if(userOtherInfo == null){
            showToast(function(){
                
            },'请选择收货地址')
        } else{
            //数据准备
            self.setData({
                "hasClick": false,
            });
            
            showLoading('支付中');
            let name = userOtherInfo.name;
            let tel = userOtherInfo.tel;
            let address =  userOtherInfo.address;
            let _comment =  e.detail.value.text;
            let arr = [];
            let payInfo =self.data.payInfo;
            
            for (let [i,v] of payInfo.entries()){
                let obj ={};
                if(v.type == 1){
                    //
                    obj.phone = tel;
                    obj.name =name;
                    obj["addr"] = address;
                    obj["goods_id"] = v["goods_id"];
                    obj.title = v.title;
                    obj["goods_price"] = v["goods_price"];
                    obj["goods_num"] = v["goods_num"];
                    obj["order_sum"] = v["order_sum"] ;
                    obj["depart_time"] = (new Date(v["depart_time"])).getTime()/1000;
                    obj["pay_type"] = v["pay_type"];
                    obj["pay_status"] = v["pay_status"] ;
                    obj.message = _comment;
                    obj.type = 1;
                    
                }else if(v.type == 2){
                    obj["contacts_phone"] = tel;
                    obj["contacts_name"] = name ;
                    obj["addr"] = address;
                    obj["visa_id"] = v["visa_id"];
                    obj["visa_title"] = v["visa_title"];
                    obj["visa_price"] = v["visa_price"];
                    obj["visa_num"] = v["visa_num"];
                    obj["visa_sum"] = v["visa_sum"];
                    obj["visa_type"] = v["visa_type"];
                    obj["visa_combo"] = v["visa_combo"];
                    obj["pay_type"] = v["pay_type"];
                    obj["pay_status"] = v["pay_status"] ;
                    obj.message = _comment;
                    obj.type = 2;
                    
                }
                arr.push(obj);
            }
            
            // 走下单方法
            //
            
            console.log(arr);
            let openid =  wx.getStorageSync('openid');
            let save_orders = protocol.wxPromisify(wx.request,'Orders/save_orders',{"wx_openid":openid,request_pay:false,"save_orders":arr});
            save_orders().then((res) =>{
                if(res.data.error == 0){
                    // 修改全局购物车长度
                    app.CartLength = 0;
                    let payInfo = res.data.data;
                    let appId = payInfo.appId;
                    let nonceStr = payInfo.nonceStr;
                    let _package = payInfo.package;
                    let signType = payInfo.signType;
                    let timeStamp = payInfo.timeStamp;
                    let paySign = payInfo.paySign;
                    let openId = payInfo.openId;
                    if ( typeof payInfo != 'undefined' && payInfo != '' && payInfo !=null){
                        let requestPayment = protocol.wxPromisify(wx.requestPayment);
                        requestPayment({
                            'timeStamp':timeStamp,
                            'nonceStr': nonceStr,
                            'package': _package,
                            'signType': signType,
                            'paySign':paySign,
                        }).then((res) =>{
                            
                            //成功 去mine 页面
                            showToast(function(){
                                self.setData({
                                    "hasClick": true
                                });
                                console.log(res)
//                              // 2秒后去
                                app.hasNewOrder = true;
                                let t = setTimeout(function(){
                                    wx.switchTab({
                                        url:'../mine/mine'
                                    })
                                },2000)
                            }, '支付成功')
                            
                        }).catch((res) =>{
                            //成功 去mine 页面
                            showToast(function(){
                                self.setData({
                                    "hasClick": true
                                });
                                 console.log(res)
                                // 2秒后去
                                app.hasNewOrder = true;
                              let t = setTimeout(function(){
                                    wx.switchTab({
                                        url:'../mine/mine'
                                    })
                                },2000)
                            }, '您未支付')
                            
                        })
                    }
                    
                }else if(res.data.error == 1){
                    showToast(function(){
                        self.setData({
                              "hasClick": true
                        });
                        //留在当页，不跳转...
                    }, '下单出错')
                    
                }else if(res.data.error == 2){
                    showToast(function(){
                        self.setData({
                              "hasClick": true
                        });
                        console.log(res)
                        // 2秒后去
                        let t = setTimeout(function(){
                            wx.switchTab({
                                url:'../mine/mine'
                            })
                        },2000)
                    }, '支付失败')
                  
                }
            }).catch((res)=>{
                showToast(function(){
                    self.setData({
                        "hasClick": true
                    });
                }, '下单失败')
            })
        }
        
    }
    
})



