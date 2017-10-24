/*app入口*/
const app = getApp();
const protocol = require('../../lib/protocol.js');
const util = require('../../lib/util.js');

Page({
    data: {
        tab: '',
        data:null,  //数据
        "imgUrlBase" : app.data.imgUrlBase,
    },
   
    _handleData(data,self) {
        
        let titleList = [];
        
        let imgUrlBase = self.data.imgUrlBase;
        //处理title
        //处理图片地址
        for (let [index,item] of data.entries() ){
            if (index == 0) {
                titleList.push({
                    "title": item.title,
                    "hasShow": true,
                    "style": "tab-list"
                });
            } else {
                titleList.push({
                    "title": item.title,
                    "hasShow": false,
                    "style": null
                });
            }
            
            if(index == 0) {
                Reflect.set(item,"hasShow",true);
            } else{
                Reflect.set(item,"hasShow",false);
            }
            
            for(let [i,v] of item.goods.entries()) {
                v["title_img"] =imgUrlBase + v["title_img"];
            }
            
        }
        console.log(data);
        console.log(titleList);
        
        self.setData({
            "data": {
                "error":0,
                "data":{
                    "titleList": titleList,
                    "data": data
                },
            }
        })
    },
    
    /*getData*/
    
    _getCategoryData(self,openid){
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        //showLoading();
        
        let Category = protocol.wxPromisify(wx.request,'Category',{"openid":openid});
        
        Category().then((res) =>{
            console.log(res);
            if(res.data.error == 0) {
                wx.hideLoading();
                wx.stopPullDownRefresh();
//              showToast(function(){
//                  if(res.data.data.category.length == 0) {
//                      self.setData({
//                          "data": {
//                              "error":0,
//                              "data":null,
//                          }
//                      })
//                      
//                  }else {
//                      self._handleData(res.data.data.category,self);  //处理数据，再把数据放到data中
//                  }
//              },'加载成功');
                if(res.data.data.category.length == 0) {
                    self.setData({
                        "data": {
                            "error":0,
                            "data":null,
                        }
                    })
                
                }else {
                    self._handleData(res.data.data.category,self);  //处理数据，再把数据放到data中
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
        let openid = wx.getStorageSync('openid')
        this._getCategoryData(self,openid);  //获取数据
        
    },
    
  
    /*切换*/
    
    tab:function(e){
      let index = e.currentTarget.dataset.index ;
      let data = this.data.data.data;
      
      let titleList = data.titleList;
      
      let _data = data.data;
      
      for (let[i,item] of titleList.entries()) {
          if(i == index) {
              item["hasShow"] = true;
              item.style = "tab-list";
              
          } else{
              item["hasShow"] = false;
              item.style = null;
          }
      }
      
      for(let[i,item] of _data.entries()) {
          if( i == index) {
              Reflect.set(item,"hasShow",true);
          } else{
              Reflect.set(item,"hasShow",false);
          }
      }
      
      this.setData({
          "data":{
              "error": 0,
                  "data":{
                    "titleList": titleList,
                    "data": _data
                   
                }
          }
      })
    },
    
    /*页面跳转*/
   
    go(e) {
        let u  = e.currentTarget.dataset.link;
        console.log(u);
        wx.navigateTo({
            url: u
        })
    },
    
    /*下拉刷新列表*/
    onPullDownRefresh: function(){
        let self = this;
        let openid = wx.getStorageSync('openid')
        this._getCategoryData(self,openid);  //获取数据
    },
    

})