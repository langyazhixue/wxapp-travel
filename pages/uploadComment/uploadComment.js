



const app = getApp();

const protocol = require('../../lib/protocol.js');

const util = require('../../lib/util.js');


/*visa入口*/

Page({
	data:{
	    comment_goods: null,  //从mine 页面带过来的参数
	    
	    imgList: null,
	    stars: [{
                star:0,
                keyItem:null,
            },{
                star:1,
                keyItem:null,
            },{
                star:2,
                keyItem:null,
            },{
                star:3,
                keyItem:null,
            },{
                star:4,
                keyItem:null,
            },
            
        ],
        normalSrc: '../../images/normal.png',
        selectedSrc: '../../images/selected.png',
        halfSrc: '../../images/half.png',
        key: 0,
        score:0, //评分
        order_id:null
	},
	
	
	/*onload*/
	onLoad(options){
	    let comment_goods = app.comment_goods;
	    
	    let order_id = options["order_id"];
	    
	    console.log(comment_goods);
	    
	    this.setData({
	        comment_goods:comment_goods,
	        order_id:order_id,
	    });
	    
	},
	
	/*onUnload 事件*/
	
	onUnload(){
	    app.comment_goods = null;
	    
	    this.setData({
            comment_goods:null
        })
	   
	},
	
	/*左边按钮*/
	
	selectLeft: function (e) {
        let  key = e.currentTarget.dataset.key
        let stars = this.data.stars ;
        let j = key-0.5 ;
        stars[j].keyItem = 0.5 ;
        let  i = 0;
        if  (j > 0){
            for( i ;i < j;i++){
              stars[i].keyItem = 1;
            }
        } 
        this.setData({
            key: key,
            stars: stars,
            score: key*2
            
        })
 
    },
 
    /*点击右边,整颗星*/
 
    selectRight: function (e) {
        let key = e.currentTarget.dataset.key
        let stars = this.data.stars ;
        let j = key-1 ;
        stars[j].keyItem = 1 ;
        let i = 0;
        if  (j > 0){
            for(i ; i < j; i++){
              stars[i].keyItem = 1;
            }
        } 
        this.setData({
            key : key,
            stars : stars,
            score : key*2
      })
    },
    
    /*选择图片*/
    
    checkImg(){
        let self = this ;
        let upload_and_download = new protocol.upload_and_download();
        upload_and_download.chooseImage(1,self); //只上传1张图片
    },
	
	/*删除图片*/
    
    deleteImg(e){
        let self = this;
        wx.showModal({
            title: '提示',
            content: '您确定要删除这张图片吗',
            showCancel:true,
            success:function(res){
                if (res.confirm) {
                    let  index = e.currentTarget.dataset.index;
                    let imgList = self.data.imgList;
                    imgList.splice(index,1); 
                    if(imgList.length ==0) {
                        self.setData({
                            imgList:null
                        })
                    } else{
                        self.setData({
                            imgList:imgList
                        })
                    }
                   
                    
                }
            }
        })
    },
    
    /*预览图片*/
    
    preview(e){
        let upload_and_download = new protocol.upload_and_download();
        let  src = e.currentTarget.dataset.src;
        let imgList = this.data.imgList ;
        upload_and_download.previewImage(src,imgList);
    },
    
    /*表单提交*/
    
    formSubmit(e){
        
        //出现弹窗
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        let showModal = new protocol.wxCommonAPI().showModal
        showLoading('正在提交');
        
        
        //参数准备
        let imgList = this.data.imgList;
        let order_id  = this.data.order_id;
        
       
       
        let comment_goods =  JSON.stringify(this.data.comment_goods);
        //comment_goods =  this.data.comment_goods;
        console.log(comment_goods);
        
        let comment = e.detail.value.textarea;
        let openid =  wx.getStorageSync('openid');
        let score = this.data.score;
        
        if(score == 0) {
            wx.hideLoading();
            showModal(function(){
            },'请选择评分');
        } else{
            let data = {
                "openid" : openid,
                "score" : score,
                "comment": comment,
                "comment_goods" :comment_goods,
                "order_id": order_id, 
            }
            
            console.log(data);
            
            if( imgList == null){
                console.log('1');
                let save_comment = protocol.wxPromisify(wx.request,'Comment/save_comment',data);
                
                save_comment().then((res) =>{
                    console.log(res);
                    
                    let data_return = res.data;
                    if(data_return.error == 0){
                       
                        wx.hideLoading();
                        app.hasNewOrder = true;
                        showModal(function(){
                            let t =  setTimeout(function(){
                                wx.switchTab({
                                    url:'../mine/mine'
                                })
                            },2000)
                            
                            
                        },'提交成功');
                    } else {
                        wx.hideLoading();
                        showModal(function(){
                            
                            //
                            
                        },'提交失败');   
                    }
                    
                }).catch((res) => {
                    
                });
                
            } else {
                let upload_and_download = new protocol.upload_and_download();
                upload_and_download.uploadFile(function(res){
                    
                    console.log('进入到upload');
                    console.log(res);
                    
                    let data_return = JSON.parse(res.data);
                    
                    if(data_return.error == 0){
                        
                        wx.hideLoading();
                        app.hasNewOrder = true;
                        showModal(function(){
                            let t =  setTimeout(function(){
                                wx.switchTab({
                                    url:'../mine/mine'
                                })
                            },2000)
                           
                           
                        },'提交成功');
                        
                    } else{
                        
                        wx.hideLoading();
                        showModal(function(){
                            
                           //
                           
                        },'提交失败')
                    }
                    
                    
                },function(){
                    console.log('else');
                    wx.hideLoading();
                    showModal(function(){
                        
                        //
                        
                    },'提交失败');
                    
                },'Comment/save_comment',imgList[0],data);
            }
        }
    }
    
    
    
})



