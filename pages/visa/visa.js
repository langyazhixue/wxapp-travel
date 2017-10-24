
const app = getApp();
const protocol = require('../../lib/protocol.js');
const util = require('../../lib/util.js');


/*visa入口*/

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
        
        let imgUrlBase = self.data.imgUrlBase;
        
        for (let [index,item] of data.entries()) {
            let  title = item.title;
           
            let img = item.img;
            if(title.length >= 20) {
                title = visa_title.slice(0,19)+'...';
                item.title = title;
            }
            item.img = imgUrlBase + img;
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
    
    _getVisaAllData(self,openid){
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        //showLoading();
        let VisaAll = protocol.wxPromisify(wx.request,'VisaAll',{"openid":openid});
        VisaAll().then((res) =>{
            //console.log(res);
            if(res.data.error == 0) {
                wx.hideLoading();
                wx.stopPullDownRefresh();
//              showToast(function(){
                    if(res.data.data.visa_info.length == 0) {
                        self.setData({
                            "data": {
                                "error":0,
                                "data":null,
                            }
                        })
                        
                    }else {
                        self._handleData(res.data.data.visa_info,self);  //处理数据，再把数据放到data中
                    }
//              },'加载成功');
               
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
        this._getVisaAllData(self,openid);  //获取数据
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
        let openid = wx.getStorageSync('openid');
        let  self = this;
        this._getVisaAllData(self,openid);  //获取数据
    },
})