

const app = getApp();

const protocol = require('../../lib/protocol.js');

const util = require('../../lib/util.js');

const order_info = {
  'goods_info':[
    {
      'id': '1',
      "type": 2,
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
    },
    {
      'id': '2',
      "type": 1,
      "id": '112',
      "title": '韩国旅游产品日本旅游呆呆呆呆呆呆地产品',
      "img": '../../images/20170707009_220x220.jpg',
      "price": 15,
      "discount": 10,
      "drive": 2,
      "sum": 44,
      "start_city": '上海',
      "end_city": '韩国',
      "start_day": '2017-08-09',
      "num": 2,
      "selected": true,
      "display": 'y'
    }
  ],
  'order_id' : 123456789,
  'create_time' : '2017-07-17 12:12:12',
  'message' : '尽快发货，谢谢滴答滴答滴答滴答滴答滴答滴答滴答滴答滴答滴答滴答滴答滴答滴答',
  'goods_num' :2,
  'order_sum' : 2387,
  'name' :'小秋天',
  'tel' : '13113113111',
  'address' : '浙江省杭州市余杭区智慧产业创业园B座501',
  'pay_status' : 1
};
/*visa入口*/

Page({
	  data:{
        data: null,    //页面数据
        info:null,   // 页面公用数据信息
        hasClick: true  //控制点击按钮
	  },
	
	/*onLoad*/
	  onLoad(options){
	      let dataList = app.dataList;
	      //数据处理
	      app.dataList = null;
	      
	      console.log(dataList);
	      
	      //公用的拿出来
	      let d = dataList[0];
	      let name = d.name;
	      let address = d.addr;
	      let tel = d.phone;
	      let _comment = d.message;
	      let order_id = d["order_id"];
	      let create_time = d["create_time"];
	      let pay_status = d["pay_status"];
	      let pay_status_name = d["pay_status_name"];
	      let length = dataList.length;
	      let sum = 0;
	      for (let [i,v] of dataList.entries()){
	          sum += parseInt(v.sum);
	      }
	      let obj = {
	          "name": name,
	          "address": address,
	          "tel": tel,
	          "_comment": _comment,
	          "order_id": order_id,
	          "create_time": create_time,
	          "pay_status": pay_status,
	          "pay_status_name": pay_status_name,
	          "length": length,
	          "sum":sum
	      }
	      
	      
        this.setData({
            data: dataList,
            info:obj
        })
	  },
	  
	  goTouploadDetails(e){
        let order_id = e.currentTarget.dataset.orderid;
        wx.navigateTo({
            url:'../uploadDetails/uploadDetails?order_id='+order_id //把参数带过去
        })
    },
	  
	  
	  /*去支付*/
	  gotoPay:function(){
	    let dataList = this.data.data;
	    // 参数准备
	    let showToast = new protocol.wxCommonAPI().showToast ;
      let showLoading = new protocol.wxCommonAPI().showLoading ;
      let  self =  this;
	    if(this.data.hasClick == false){
	        return false;
	    } else{
	        self.setData({
                hasClick: false,
            });
            
          showLoading('支付中');
          //参数准备
          let arr = []
          for (let [i,v] of dataList.entries()){
              let obj ={};
              if(v.type == 1){
                  obj.phone = v.phone;
                  obj.name =v.name;
                  obj["addr"] = v.addr;
                  obj["goods_id"] = v["goods_id"];
                  obj.title = v.title;
                  obj["goods_price"] = v.price;
                  obj["goods_num"] = v.num;
                  obj["order_sum"] = v.sum ;
                  obj["depart_time"] = (new Date(v["depart_time"])).getTime()/1000;
                  obj["pay_type"] = v["pay_type"];
                  obj["pay_status"] = v["pay_status"] ;
                  obj.message = v.message;
                  obj.type = 1;
                  obj["order_id"] = v["order_id"];
                  
              }else if(v.type == 2){
                  obj["contacts_phone"] = v.phone;
                  obj["contacts_name"] = v.name ;
                  obj["addr"] = v.addr;
                  obj["visa_id"] = v["goods_id"];
                  obj["visa_title"] = v.title;
                  obj["visa_price"] = v.price;
                  obj["visa_num"] = v.num;
                  obj["visa_sum"] = v.sum;
                  obj["visa_type"] = v["visa_type_id"];
                  obj["visa_combo"] = v["visa_combo_id"];
                  obj["pay_type"] = v["pay_type"];
                  obj["pay_status"] = v["pay_status"] ;
                  obj.message = v.message;
                  obj.type = 2;
                  obj["order_id"] = v["order_id"];
              }
              
              arr.push(obj);
          }
          
          
          console.log(arr);
          let openid =  wx.getStorageSync('openid');
          let save_orders = protocol.wxPromisify(wx.request,'Orders/save_orders',{"wx_openid":openid,request_pay:true,"save_orders":arr});
          save_orders().then((res) =>{
              if(res.data.error == 0){
                  let payInfo =res.data.data;
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
//                            app.hasNewOrder = true
//                             //未支付不跳转
//                            console.log(res)
//                              // 2秒后去
//                              let t = setTimeout(function(){
//                                  wx.switchTab({
//                                      url:'../mine/mine'
//                                  })
//                              },2000)
                          }, '您未支付')
                            
                      })
                  }
                    
            }else if (res.data.error == 1){
                showToast(function(){
                    self.setData({
                          "hasClick": true
                    });
                  }, '下单出错')
                
            }else if(res.data.error == 2){
                showToast(function(){
                    self.setData({
                          "hasClick": true
                    });
//                  console.log(res)
//                  // 2秒后去
//                  let t = setTimeout(function(){
//                      wx.switchTab({
//                          url:'../mine/mine'
//                      })
//                  },2000)
                  }, '支付失败')
                }
            }).catch((res)=>{
                showToast(function(){
                    self.setData({
                        "hasClick": true
                    });
                }, '支付失败')
            })
	      }
	  },
	  
	  /*下拉刷新*/
	 
    /*下载签证*/
   
    downloadTemplate:function(e){
        let  self =  this;
        let  src = e.currentTarget.dataset.src;
        console.log(src);
        if(src == '' || src == null){
            return ;
        };
        
        let save = new protocol.upload_and_download().saveImageToAlbum;
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        showLoading('下载中');
        
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
                            console.log(res);
                        },'保存成功')
                    },
                    fail: function(res){
                        showToast(function(){
                            console.log(res);
                        },'保存失败')
                    }
                })
            },
            fail: function (res) {
                showToast(function(){
                    console.log(res);
                },'下载失败')
            }
        })
    },
	
})



