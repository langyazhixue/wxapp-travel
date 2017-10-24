

const app = getApp();

const protocol = require('../../lib/protocol.js');

const util = require('../../lib/util.js');


/*visa入口*/

Page({
    data: {
	   order_id:null,  //order_id
	   imgList: null, //图片地址
    },
	
	/*onLoad*/
	
	onLoad(options) {
	    let order_id = options.order_id;
	    console.log(order_id);
	    this.setData({
	        order_id: order_id,
	    })
	},
	
	/*选择图片*/
	
	checkImg(){
	    let self = this ;
	    let upload_and_download = new protocol.upload_and_download();
	    upload_and_download.chooseImage(1,self); //上传图片
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
                    self.setData({
                        imgList:imgList
                    })
                    
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
    
    formSubmit(){
        let imgList = this.data.imgList;
        let order_id  = this.data.order_id;
        let data = {
            "order_id": order_id
        }
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        let showModal = new protocol.wxCommonAPI().showModal;
        
        
        if(imgList == null || imgList.length == 0){
            //提示选择图片
            showModal(function(){
                
            },'请选择图片');
            return false;
            
        } else{
            showLoading('正在提交');
            let upload_and_download = new protocol.upload_and_download();
            upload_and_download.uploadFile(function(res){
                    console.log(res);
                    let data_return = JSON.parse(res.data);
                    if(data_return.error == 0){
                        wx.hideLoading();
                        showModal(function(){
                            let t = setTimeout(function(){
                                wx.switchTab({
                                    url:'../mine/mine'
                                })
                            },2000)
                        
                        },'提交成功')
                        
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
                    
                },'Orders/upload_visa',imgList[0],data)
        }
    }
    
	
})



