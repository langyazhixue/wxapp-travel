
const app = getApp();
const protocol = require('../../lib/protocol.js');
const util = require('../../lib/util.js');

/*app入口*/

Page({
    data: {
        "swiperConfig":app.data.swiperConfig,  //轮播图配置信息
        "imgUrlBase" : app.data.imgUrlBase,   //图片基础地址
        "data":null//数据
    },

    /*处理数据*/
    
    _handleData(data,self) {
        // 获取data
        //处理title 
        //处理图片地址
        
        let imgUrlBase = self.data.imgUrlBase;
        let _data = data["time_push"];
        let banner = data["banner"];
        if(_data.length != 0) {
            for (let [index,item] of _data.entries()) {
                let  title = item.title;
                let title_img = item["title_img"];
                if(title.length >= 20) {
                    title = visa_title.slice(0,19)+'...';
                    item.title = title;
                }
                item["title_img"] = imgUrlBase + title_img;
            };
        }
        
        if(banner.length != 0) {
            for (let [index,item] of banner.entries()) {
                let img = item["img"];
                item["img"] = imgUrlBase + img;
            };
        }
        self.setData({
            "data": {
                "error":0,
                "data":{
                    "banner":banner,
                    "timePush": _data
                },
            }
        })
        
    },
    
    /*getData*/
    
    _getTimePushData(self,openid){
        let showToast = new protocol.wxCommonAPI().showToast;
        
        let showLoading = new protocol.wxCommonAPI().showLoading;
        
        //showLoading();
        let TimePush = protocol.wxPromisify(wx.request,'TimePush',{"openid":openid});
        
        TimePush().then((res) =>{
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
                        }
                    });
                    
                }, '加载失败');
            }
            
        }).catch((value) =>{
            wx.hideLoading();
            wx.stopPullDownRefresh();
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
    
    /*onload*/
    
    onLoad(options){
        let  self = this;
        let openid = wx.getStorageSync('openid');
        this._getTimePushData(self,openid);  //获取数据
    },
    
    go(e) {
        let u  = e.currentTarget.dataset.link;
        console.log(u);
        wx.navigateTo({
            url: u
        })
    },
    
    /*下拉刷新列表*/
  
    onPullDownRefresh: function(){
        let  self = this;
        let openid = wx.getStorageSync('openid');
        this._getTimePushData(self,openid);  //获取数据
    },
})