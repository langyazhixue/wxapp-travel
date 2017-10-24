
const app = getApp();
const protocol = require('../../lib/protocol.js');
const util = require('../../lib/util.js');

/*App入口*/


Page({
    data: {
        "FirsthasError":null, //判断第一次加载是否错误，如果错误，就显示加载失败
        "hasData":'',//判断第一次是否有数据
        "data_title":null, //放头部信息
        "data":[],  //放置列表信息
        "page":1,
        "id":null,
        "imgUrlBase": app.data.imgUrlBase,
        "height": null,
        "loading": false,  //控制底部是否加载或在那个
        "ending":false,    //控制是否已到底部
        "hasEnd":false,  //控制所有的数据是否加载完
        "isLoading":true  // 控制本次数据加载是否完成
    },
    
    /*处理数据*/
    _handleData(data,self,page) {
        // 获取data
        //处理图片地址
        let _data = self.data.data;
        
        let imgUrlBase = self.data.imgUrlBase;
        
        for (let [index,item] of data.entries()) {
            let imglist = JSON.parse(item.img);
            for (let [i,v] of imglist.entries()) {
                imglist[i] = imgUrlBase + v;
            }
            item.img = imglist;
             _data.push(item);
        };  
        
        self.setData({
            "data": _data,
            "page": page + 1,
            'isLoading':true
        })
        
    },
    
    /*获取page1数据*/
    
    _getstrategyInfo_firstPage(id,page,self){
        self.setData({
            'isLoading':false
        });
        let showToast = new protocol.wxCommonAPI().showToast;
        
        let showLoading = new protocol.wxCommonAPI().showLoading;
        
        //showLoading();
        let  strategy_info = protocol.wxPromisify(wx.request,'Strategy/strategy_info',{
            "id":id,
            "page":page
        });
        
        strategy_info().then((res) =>{
            
            if(res.data.error == 0) {
                wx.hideLoading();
//              showToast(function(){
                    if(res.data.data == '' ||res.data.data.content.length == 0) {
                        self.setData({
                            "FirsthasError":0,
                            'isLoading':true,
                            "hasData":null
                        })
                    }else {
                        let title = res.data.data.title;
                        let ts = res.data.data.time;
                        let scan = res.data.data.scan;
                        let des = res.data.data.des;
                        let data_title ={
                            "title": title,
                            "ts" : ts,
                            "scan": scan,
                            "des":des
                        }
                        self.setData({
                            "FirsthasError":0,
                            "hasData":0,
                            "data_title": data_title,
                           
                        })
                        
                        if(res.data.data.content.length != 0){
                            self._handleData(res.data.data.content,self,page);  //处理数据，再把数据放到data中
                        }
                    }
//              },'加载成功');
               
            } else {
                showToast(function(){
                    self.setData({
                        "FirsthasError":1,
                        "ending":true,
                    });
                    
                }, '加载失败');
            }
            
        }).catch((value) =>{
            showToast(function(){
                self.setData({
                    "FirsthasError":1,
                    "ending":true,
                })
            },'加载失败');
            
        })
        
    },
    
    /*onLoad*/
    
    onLoad:function(options) {
        // 获取设备高度
        let height = '600px';
        let getSystemInfo = protocol.wxPromisify(wx.getSystemInfo);
        getSystemInfo().then((res) =>{
           //console.log(res);
            height = res.windowHeight+ 'px';
            let page = this.data.page;
            let id = options.id;
            let self = this;
            this.setData({
                "id":id,
                "height": height
            })
            if(self.data.isLoading){
                this._getstrategyInfo_firstPage(id,page,self);
            }
            
        }).catch((res) =>{
            
        })
    },
    
    /*加载到底部时候*/
   
    _getstrategyInfo_nextPage(id,page,self){
        let  strategy_info = protocol.wxPromisify(wx.request,'Strategy/strategy_info',{
            "id":id,
            "page":page
        });
        strategy_info().then((res) =>{
            console.log(res);
            if(res.data.error == 0 && res.data.data.content.length !=0) {
                self._handleData(res.data.data.content,self,page);  //处理数据，再把数据放到data中
            } else {
                self.setData({
                    "loading": false,
                    "ending":true,
                    "hasEnd":true,
                    'isLoading':true
                })
            }
            
        }).catch((value) =>{
            self.setData({
                "loading": false,
                "ending":true,
                "hasEnd":true,
                'isLoading':true
           })
            
        })
    },
   
    scrolltolower:function(){
        let self =  this;
        if(!this.data.hasEnd && this.data.isLoading){
            this.setData({
                "loading": true,  //控制底部是否加载或在那个
                "ending":false,
                "isLoading":false
            });
            console.log('e');
            let id = this.data.id;
            let page = this.data.page
            this._getstrategyInfo_nextPage(id,page,self);
        }
    }
})