/*app入口*/
const app = getApp();
const protocol = require('../../lib/protocol.js');
const util = require('../../lib/util.js');

Page({
    data: {
        "data":null,  //数据
        "imgUrlBase" : app.data.imgUrlBase,   //图片基础地址
    },

    /*处理数据*/
    
    _handleData(data,self) {
        // 获取data
        //处理title 
        //处理图片地址
        //处理时间
        
        let imgUrlBase = self.data.imgUrlBase;
        let getDate = new util.DateClass().getDate;
        
        for (let [index,item] of data.entries()) {
            let  title = item.title;
            let img = item.img;
            let ts = item.ts;
            
            if(title.length >= 30) {
                title = visa_title.slice(0,29)+'...';
                item.title = title;
            }
            item.img = imgUrlBase + img;
            //item.ts =  getDate(ts*1000);
        };    
        //console.log(data);
        
        self.setData({
            "data": {
                "error":0,
                "data": data,
            }
        })
        
    },
    
    /*getData*/
    
    _getStrategyData(self,openid){
        let showToast = new protocol.wxCommonAPI().showToast;
        
        let showLoading = new protocol.wxCommonAPI().showLoading;
        
        //showLoading();
        let Strategy = protocol.wxPromisify(wx.request,'Strategy',{"openid":openid});
        
        Strategy().then((res) =>{
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
        this._getStrategyData(self,openid);  //获取数据
    },
    
    go(e) {
        let u  = e.currentTarget.dataset.link;
        console.log(u);
        wx.navigateTo({
            url: u
        })
    },
    
    /*下拉刷新*/
   
   /*下拉刷新列表*/
    onPullDownRefresh: function(){
        let  self = this;
         let openid = wx.getStorageSync('openid');
        this._getStrategyData(self,openid);  //获取数据
    },
})