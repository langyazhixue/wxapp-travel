const app = getApp();
const protocol = require('../../lib/protocol.js');
const util = require('../../lib/util.js');

/*Page入口*/

Page({
     data: {
        "data":null,  //数据
        "imgUrlBase" : app.data.imgUrlBase,   //图片基础地址
        "tabData":null   //tab 头部数据
    },

    /*处理数据*/
    
    _handleData(data,self) {
        // 获取data
        //处理图片地址
        //处理title 长度
        self.setData({
            "data": {
                "error":0,
                "data": null,
            }
        })
        
        let imgUrlBase = self.data.imgUrlBase;
        
        for (let [index,item] of data.entries()) {
            let  title = item.title;
            let img = item.img;
            if(title.length >= 25) {
                title = visa_title.slice(0,24)+'...';
                item.title = title;
            }
            item.img = imgUrlBase + img;
        };    
        console.log(data);
        self.setData({
            
            "data": {
                "error":0,
                "data": data,
            }
        })
        
    },
    
    /*getData*/
    
    _getAllGoodsData(self,url,obj){
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        //showLoading();
        let AllGoods = protocol.wxPromisify(wx.request,url,obj);
        
        AllGoods().then((res) =>{
            console.log(res);
            if(res.data.error == 0) {
                wx.hideLoading();
                wx.stopPullDownRefresh();
                
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
        let storage = new protocol.storage();
        let i = storage.checkStorage("openid");
        if(i == 0 ){
            return;    
        }
        let tabData = [{
                'title':'综合排序',
                'style':'checked',
                'hasShow':true,
                "type":null
            },{
                'title':'销量优先',
                'style':null,
                'hasShow':false,
                "type":null
                
            },{
                'title':'价格排序',
                'style':null,
                'hasShow':false,
                "type":0,
                "img":["../../images/all_rise_nor.png","../../images/all_rise_up.png",'../../images/all_rise_down.png']
            }
        ];
        this.setData({
            "tabData": tabData
        })
        let  self = this;
        let openid = wx.getStorageSync('openid');
        this._getAllGoodsData(self,'allGoods',{"openid":openid});  //获取数据
    },
    
    /*tab切换*/
    
    tab:function(e){
        let index = e.currentTarget.dataset.index;
        let tabData = this.data.tabData;
        let self = this;
        if(!tabData[index].hasShow) {
            for(let [i,v] of tabData.entries()) {
                if (i == index) {
                    v.hasShow = true ;
                    v["style"] = 'checked' ;
                    if(i == 2){
                        v.type = 1 ;
                    }
                }else{
                    v.hasShow = false ;
                    v["style"] = null ;
                    if(i == 2){
                        v.type = 0 ;
                    }
                }
            }
        } else{
            if(index == 2){
                let type = tabData[index].type;
                if(type == 1){
                    tabData[index].type = 2
                }else if(type ==2){
                    tabData[index].type = 1
                }
            }
        }
        
        this.setData({
            "tabData": tabData
        });
        let openid = wx.getStorageSync('openid');
        if (index == 0) {
          this._getAllGoodsData(self, 'allGoods', { "openid": openid});
        } else if(index == 1){
          this._getAllGoodsData(self, 'allGoods?', { "sale": 2, "openid": openid});
        } else if(index ==2){
            if(tabData[index].type == 1){
                //升
              this._getAllGoodsData(self, 'allGoods', { "price": 1, "openid": openid}); 
            } else if(tabData[index].type == 2) {
                //降
              this._getAllGoodsData(self, 'allGoods', { "price": 2, "openid": openid}); 
            }
        }
    },
    
    /*去新页面*/
   
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
        let storage = new protocol.storage();
        let i = storage.checkStorage("openid");
        if(i == 0 ){
            wx.stopPullDownRefresh();
            return;    
        } else{
            let openid = wx.getStorageSync('openid');
            this._getAllGoodsData(self,'allGoods',{"openid":openid})  //获取数据
        }
       
    },
    
})