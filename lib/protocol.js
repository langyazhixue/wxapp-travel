
/*模块引入*/

const  md5 = require('md5.js');
var Promise = require('./bluebird.min');  //引入Promise
const regeneratorRuntime = require("./runtime");   //引入Generator

//function md5(value) {
// let v =  md5.md5(value);
// return v 
//}

/*全局交互地址*/

//const urlBase = 'http://192.168.8.225/travel/php/travel/index.php/Home/';
//const host = 'https://travel.babawifi.com/testtravel/';
const host = 'https://travel.babawifi.com/mytravel/';
const urlBase =  host+'index.php/Home/';

/*封装一个微信 wxPromisify*/

function wxPromisify(fn,url,data,method ="POST") {
    let u  = urlBase + url;
    return function (obj = {url: u,header: {"Content-Type":"application/json"},data: data,method:method}){
        return new Promise((resolve, reject) => {      
            obj.success = function (res) {        
                resolve(res)      
            }      
            obj.fail = function (res) {        
                reject(res)      
            }
            fn(obj)    
        })  
    }
}


/*pay*/

function wxRequestPayment(timeStamp,nonceStr,package1,signType,paySign,cb,fail){
    wx.requestPayment({
       "timeStamp": timeStamp,
       "nonceStr": nonceStr,
       "package": package1,
       "signType": signType,
       "paySign": paySign,
       "success": function(res){
            typeof cb == "function" && cb(res);
        },
        "fail": function(res){
            typeof fail=="function" && fail(res);
        }
    })
}



/*wx公共API 类型*/

class  wxCommonAPI {
    constructor(){
        
    }
    
    /* 获取电话号码*/
    
    call (phoneNumber){
        let wxcall = wxPromisify(wx.makePhoneCall);
        wxcall({
            phoneNumber:phoneNumber
        }).then(() => {
            console.log('拨打电话成功')
        }).catch(() =>{
            console.log('拨打电话失败')
        })
    }
    
    /*获得地址信息*/
   
    chooseAddress(fn,fail){
        let chooseAddress = wxPromisify(wx.chooseAddress);
        chooseAddress({}).then((res) =>{
            fn(res);
        }).catch((err) =>{
            fail(err);
        })
    }
    
    /*showToast*/
   
    showToast(fn,title = '出错',icon = 'success',duration = 2000){
        let showToast = wxPromisify(wx.showToast);
        showToast({
            title: title,
            icon: icon,
            mask: true,
            duration: duration
        }).then((value) =>{
           fn(value)
        }).catch((value) =>{
           //console.log('有误')
        })
   }
   
    /*showLoading*/
   
    showLoading(title = '加载中...',mask = true){
        let showToast = wxPromisify(wx.showLoading);
        showToast({
            title: title,
            mask: true
        }).then((value) =>{
           //fn(value)
        }).catch((value) =>{
           //console.log('有误')
        })
    }
    
    /*showModal*/
   
    showModal(fn,content,cancel,fail,title = '提示',showCancel = false){
       let showModal = wxPromisify(wx.showModal);
       showModal({
            title: title,
            content:content,
            showCancel: showCancel,
       }).then((res) =>{
            if(res.confirm){
                typeof fn == 'function' && fn();
            }else if(res.cancel){
               typeof cancel == 'function' && cancel()
            }
           
       }).catch((value) =>{
           typeof fail  == 'function' && fail()
       })
       
       
       
   }
    
    
   /*微信登录*/
       
    wxLogin(){
        return new Promise ((resolve,reject) =>{
            
            let  l = protocol.wxPromisify(wx.login);
            
            l({}).then((res) =>{
                let code = res.code;
                wx.setStorageSync(code,code);   //设置code用户缓存
                
                resolve({error:0})
                
            }).catch((res) =>{
                //去设置页面
            })
            
        })
    }
     
    /*获取用户信息*/
       
    getUserInfo()  {
        return new Promise ((resolve,reject) =>{
            
            let wxGetUserInfo = protocol.wxPromisify(wx.getUserInfo);
            
            wxGetUserInfo({}).then((res) =>{
               
                let userWxInfo  = res.userInfo;
                
                wx.setStorageSync(userWxInfo,userWxInfo);   //设置微信用户缓存
                
                resolve({error:0})
                
            }).catch((res) =>{
                // 获取用户信息失败
            })
            
        })
    }
    /*获取设备高度*/
}



/*设置缓存*/

class storage {
    
    constructor(){
        
    }
    
    /*获得缓存*/
   
    setStorage (a, b) {
        wx.setStorageSync(a,b); 
    }
    
    /*获取缓存*/
    
    getStorage (a) {
        var info = wx.getStorageSync(a);
        return info;
    }
    
    /*确认缓存*/
   
    checkStorage(a) {
        var info = wx.getStorageSync(a);
        if(info == ''||info == null ||info == 'null'){
            return 0
        } else {
            return 1
        }
    }
}


/*upload */

class upload_and_download {
    constructor(){
    }
    
    /*下载文件*/
    downloadFile(e,self){
        self.setData({
            loading:true, 
        });
        console.log(e.currentTarget.dataset.src);
        
        wx.downloadFile({
            url: e.currentTarget.dataset.src,
            success: function(res) {
                console.log(res);
                let tempFilePaths = res.tempFilePath;  // 图片下载的临时地址
                wx.saveImageToPhotosAlbum({
                    filePath: tempFilePaths,
                    success:function (){
                        console.log('保存图片成功');
                    },
                    fail: function (){
                        console.log('保存图片失败');
                    }
                })
            },
            
            fail:function(){
                console.log('fail');
            },
            complete:function(){
                //console.log('complete')
                self.setData({
                   loading:false, 
                })
            }
        })
        
    };
  
    /*选择图片*/
   
    chooseImage(count,self){
        wx.chooseImage({
            count:count, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                //console.log(res);
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                let  tempFilePaths = res.tempFilePaths;
                //console.log(tempFilePaths);
                self.setData({
                    imgList: tempFilePaths
                })
            },
            fail: function (res) {
                //console.log('选择图片失败');
            }
        })
    };
    
    /*预览图片*/
   
    previewImage(src,imgList){
        wx.previewImage({
            current:src,
            urls:imgList // 需要预览的图片http链接列表
        })
    };
    
    /*上传图片*/
    uploadFile(fn, fail, url, img, data){
        let uploadFile = wxPromisify(wx.uploadFile);
        let u = urlBase + url;
        
        uploadFile({
            url: u,
            name: 'file',
            header: {"Content-Type":"multipart/form-data"},
            filePath: img,
            formData: data
            
        }).then((res) =>{
            typeof fn == 'function' && fn(res);
            
        }).catch((res) =>{
             typeof fail == 'function' && fail(res);
        })
   };
   
   
   /*保存图片到相册*/
   saveImageToAlbum(src,fn,fail){
       wx.saveImageToPhotosAlbum({
           filePath:'https://travel.babawifi.com/visa_table.jpg',
            success:function(res){
                console.log('成功');
                console.log(res);
                //typeof fn  == 'function' && fn();
                fn();
            },
            fail:function(res){
                //typeof fail  == 'function' && fail();
                console.log('失败');
                console.log(res);
                fail();
            }
        })
       
   }
}

/*模块输出*/

module.exports = {
	md5: md5.md5,
	
	wxPromisify: wxPromisify,  //封装了一个微信Promise
	
	wxCommonAPI: wxCommonAPI,   //微信公共API 
	
	storage: storage,  //缓存相关
	
	upload_and_download : upload_and_download, //与上传下载相关
	host: host
    

}
