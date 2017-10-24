

const app = getApp();

const protocol = require('../../lib/protocol.js');

const util = require('../../lib/util.js');


/*visa入口*/

Page({
	data:{
        "img":{
             normalSrc: '../../images/com_normal.png',
            selectedSrc: '../../images/com_selected.png',
             halfSrc: '../../images/com_half.png',
        },
        "data":null,
        "imgUrlBase" : app.data.imgUrlBase,
	},
	
	/*控制star*/
	_updateStar(stars,key){
	    /*key 向下取整*/
	    console.log(key);
	    if(key > 1){
	        if((key - Math.floor(key)) > 0){
            
                stars[Math.floor(key)-1].keyItem = 0.5;
            }
	    }else if( key<1){
	        stars[0].keyItem = 0.5;
	    }
	    
	    
	},
	
	/*处理数据*/
	
	_handleData(data,self) {
	    // 获取data
        //处理title 
        //处理时间
        //处理star
        // 处理key
        // 处理图片地址
        let imgUrlBase = self.data.imgUrlBase;
        let  getDate = new util.DateClass().getDate;
        for (let [index,item] of data.entries()) {
            let user_name = item.user_name;
            if(user_name.length>10) {
                user_name = user_name.slice(0,9)+'...';
                item.user_name = user_name;
            }
            item.ts = getDate((item.ts)*1000);
            
            item.key = ((item.score)/2)>=5?5:(item.score/2);
            
            let stars =[{
                    star:0,
                    keyItem:null
                },{
                    star:1,
                    keyItem:null
                },{
                    star:2,
                    keyItem:null
                },{
                    star:3,
                    keyItem:null
                },{
                    star:4,
                    keyItem:null
                },
            
            ];
            
            this._updateStar(stars,item.key);
            item.stars = stars;
            
            // 处理图片地址
            if( typeof  item.img!='undefined' 
                && item.img!= ''
            ) {
               let _img = item.img.split("|");
               let  arr = [];
               for (let [i,v] of _img.entries()){
                   arr.push(imgUrlBase+ v)
               }
               item.img = arr ;
            }
        }
        
        this.setData({
            "data": {
                "error":0,
                "data": data,
            }
        })
        
	},
	
	/*getData*/
	
	_getCommentData(id,type,self){
	    let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        //showLoading();
         
        let openid = wx.getStorageSync('openid');
        
        let Comment = protocol.wxPromisify(wx.request,'Comment',{
            "id": id,
            "type": type
        });
        
        
        Comment().then((res) =>{
            console.log(res);
            if(res.data.error == 0) {
                wx.hideLoading();
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
	    let id = options.it ;
	    let type = options.type ;
	    this._getCommentData(id,type,self);  //获取数据
	    console.log(id);
	    console.log(type);
	},
	
	/*onUnload 事件*/
	
	onUnload(){
	   
	},
	
	
	/*预览图片*/
	
	_previewImage(e){
	    let src = e.currentTarget.dataset.src;
	    let  imglist = e.currentTarget.dataset.imglist;
	    
	    //imglist =['http://opnxrafks.bkt.clouddn.com/xiaoxiao.jpg','http://opnxrafks.bkt.clouddn.com/xiaoxiao.jpg','http://opnxrafks.bkt.clouddn.com/xiaoxiao.jpg'];
	    
	    let previewImage = new protocol.upload_and_download().previewImage;
	    
	    previewImage(src,imglist);
	},
	
	
})



