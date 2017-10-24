
//var url = 'http://192.168.8.225/travel/php/travel/index.php/Home/VisaInfo';
//var url = 'https://travel.babawifi.com/testtravel/index.php/Home/VisaInfo';

const app = getApp();

const protocol = require('../../lib/protocol.js');

const util = require('../../lib/util.js');

var isshow = false;

var type = 0;
var area = 0;
var area_arr = '';//套餐数组
var arr = ''//签证数组
var type_arr = '';
var type_id = '';//最终选择的类型id
var area_id = '';//最终选择的套餐id
var type_name = '';//最终选择的类型名称
var area_name = '';//最终选择的套餐名称
var num = 1;//购买数量
var discount = "";//单价
var sum = "";//总价格
var foot_name = "";//页底模板名
var goods_id = '';

//var open_id = 'obrIM0WzH22JtEB55QCWtC_51Wfo';

/*visa入口*/

Page({
	data: {
	    
	    swiperConfig:app.data.swiperConfig,
        imgUrlBase: app.data.imgUrlBase,
	    visaInfo: null,
    	titleData: {titlePrev:"是电话费返回介绍的发",titleNext:"发送到姐夫发送到"},
//      titleData: null,
      orderNum:1,
      
      select: isshow,//选择框是否显示 默认否
      windowHeight: '',//可视区域高度
      windowWidth: '',//可视区域宽度
      select_type: type,//所选择的签证类型  下标
      select_area: area,//所选择的套餐类型 下标
      area_arr : '',//套餐展示数组
      num : num, //购买数量
      discount : discount,//单价
      comment:'',
      shop_cart:0,//购物车商品数量
      foot_name:foot_name,
      goods_type:2,//签证类型
      "min-discount": null,
      "min-price":null,
      "visa_title":null


	},
	
	getGoodsInfo: function(data) {
	    protocol.getGoodsInfo(data,(res) => {
	        if(res.data.error == 0) {
	            let data = res.data.data ;
	            let titleData = util.dealTitleStyle(res.data.data.title);
	            
	            this.setData({
	                visaInfo: res.data.data,
	                
	                titleData: titleData,
	                
	                comment: res.data.comment,
	            })
	        } else {
	            
	        }
	        
	    },() =>{
	        
	    })
	},
	onLoad:function(options) {

    goods_id = options.id;
    var d = wx.getSystemInfoSync();
//console.log(d);
    const s = this;
    let url = protocol.host+'index.php/Home/VisaInfo';
    wx.request({
      url: url,
      data: { id: goods_id,type:2},
      header: {
        "Content-Type": "application/json"
      },
      method: 'POST',
      success: function (ress) {
        //console.log(ress);
        console.log(ress.data.data);
        

        //模拟评论数据
        // var a = {
        //   comment_num: 122,
        //   comment_content: {
        //     user_name: 'aqq937241319',
        //     user_img: '../../images/20170607001_750X400.jpg',
        //     content: '这个签证又快又好，实在的赞，赞的不要不要的，大家多来捧场多来购买。'
        //   }
        // };
        // var b = a.comment_content.user_name;
        // var c = b.substring(0, 2) + '***' + b.substring((b.length - 1), (b.length));//处理评论用户名
        // a.comment_content.user_name = c;

        this.arr = ress.data.data.visainfo;
        type_arr = ress.data.data.visainfo.visa_type;
        this.type_id = type_arr[0].id;//默认选中
        this.type_name = type_arr[0].name;
        this.area_id = type_arr[0].areas[0].id;//默认选中
        this.area_name = type_arr[0].areas[0].name;
        this.discount = type_arr[0].areas[0].discount;//默认选中
        this.price = type_arr[0].areas[0].price;//默认选中
        this.area_arr = type_arr[0].areas;
      
        if (ress.data.error == 0) {
            let a = null;
          if(ress.data.data.comment.length!=0){
                a = ress.data.data.comment[0];
                a.comment_num = ress.data.data.comment.length;
                var b = a.user_name;
                var c = b.substring(0, 2) + '***' + b.substring((b.length - 1), (b.length));//处理评论用户名
                a.user_name = c;
                a.content = a.comment;
          }
         


          
          let ban = JSON.parse(this.arr.slideshow);
          let ba = {};
          for (let [i, v] of ban.entries()) {
            if (ban[i]){
              ba[i] = app.data.imgUrlBase + ban[i]
            }
          }

          console.log(ba);
          let imgUrlBase = s.data.imgUrlBase;
          let title_img = imgUrlBase+this.arr["title_img"];
          s.setData({
            //data: res.travel
            goods_id: goods_id,
            type_id : this.type_id,
            type_name: this.type_name,
            area_id : this.area_id,
            area_name : this.area_name,
            area_arr: this.area_arr,
            data: this.arr,
            sum:this.sum,
            discount:this.discount,
            price: this.price,
            windowHeight: d.windowHeight,
            windowWidth: d.windowWidth,
            comment: a,
            shop_cart: app.CartLength,
            "min_discount": this.arr["min_discount"],
            "min_price":this.arr["min_price"],
            slideshow:ba,
            'visa_title':this.arr.title,
            "title_img":title_img
          });
        }
      }
    })
	},
	
  go(e) {
    let u = e.currentTarget.dataset.link;
    console.log(u);
    //return false;
    wx.navigateTo({
      url: u
    })
  },

  gos(e){
    let u = e.currentTarget.dataset.link;
    console.log(u);
    //return false;
    wx.switchTab({
      url: u
    })
  },

  //遮罩显示
  myshow:function(){
    var s = (this.data.discount) * (this.data.num); 
    //console.log(this.data.num);
    this.setData({
      //data: res.travel
      select:true,
      sum : s
    });
  },
  //遮罩隐藏
  mynone:function(){
    this.setData({
      foot_name:foot_name,
      select: false
    });
  },
	/*获取订单信息*/
	
	getOrderInfo:function() {
		
		
	},
	
	/*更新订单信息*/
	
	updataOrder: function() {
		
	},
	
	// 切换单次还是多次
	
	changeType: function(e) {
    console.log(e.target.id);
    this.type = e.target.id;
    //console.log(type_arr);
    this.area_arr = type_arr[this.type].areas;
    console.log(this.area_arr);
    this.discount = this.area_arr[0].discount;//切换之后默认显示第一个套餐的价格
    this.type_id = type_arr[this.type].id;//取类型id
    this.type_name = type_arr[this.type].name;//取类型名称
    this.area_id = this.area_arr[0].id;//取套餐id
    this.area_name = this.area_arr[0].name;//取套餐名称

    this.price = this.area_arr[0].price;
    this.sum = this.discount * 1; //数量重置为1
    

    this.type_id = type_arr[this.type].id;
    console.log(this.area_arr);
    this.setData({
      type_id: this.type_id,
      type_name: this.type_name,
      area_id: this.area_id,
      area_name: this.area_name,
      select_type: this.type,
      area_arr: this.area_arr,
      discount: this.discount,
      price: this.price,
      sum: this.sum,
      num: 1,
      select_area : 0 //套餐重置为下标0
    });
	},
	
	/*多次选择目的地*/
	
	changeDesType: function(e) {
    this.area = e.target.id;
   // console.log(this.data.area_arr);  
    
    this.area_id = this.data.area_arr[this.area].id;
    this.area_name = this.data.area_arr[this.area].name;
    this.discount = this.data.area_arr[this.area].discount;
    this.price = this.data.area_arr[this.area].price;
    this.sum = this.discount * 1;//数量重置为1
    //console.log(type_arr);

    this.setData({
      //select_type: this.type,
      area_id : this.area_id,
      area_name : this.area_name,
      select_area: this.area,
      discount:this.discount,
      price: this.price,
      sum : this.sum,
      num : 1
    });
	},
	
	/*增加订单数量*/
	
	addNumber: function() {
    this.data.num ++ ;
    this.data.sum = this.data.discount * this.data.num;
		this.setData({
      num: this.data.num,
      sum: this.data.sum
		})
		//this.updataOrder();
	},
	
	/*减少订单数量*/
	
	cutNumber: function() {
    var num = this.data.num;
		if (num > 1) {
      this.data.num -- ;
      this.data.sum = this.data.discount * this.data.num;
			this.setData({
        num: this.data.num,
        sum: this.data.sum
			})
		}
		//this.updataOrder();
	},
	

  GoToCart:function(){
    if (!this.data.select) {
      this.setData({
        foot_name: 'cart'
      })
      this.myshow();
      return;
    }
    console.log('选择框是否显示:' + this.data.select);
    console.log('选择的类型id为：' + this.data.type_id);
    console.log('选择的类型名称为' + this.data.type_name);
    console.log('选择的套餐id为:' + this.data.area_id);
    console.log('选择的套餐名称为:' + this.data.area_name);
    console.log('选择的数量为:' + this.data.num);
    console.log('商品的单价为：' + this.data.discount);
    console.log('goods_id为:' + goods_id);
    
    console.log('走购物车逻辑');

    const s = this;
    let showToast = new protocol.wxCommonAPI().showToast;
    let showLoading = new protocol.wxCommonAPI().showLoading;
    let open_id =  wx.getStorageSync('openid');
    let saveCart = protocol.wxPromisify(wx.request,'Cart/save_cart',{openid: open_id, goods_id: goods_id, nu: this.data.num, price: (this.data.discount * this.data.num), type: 2, visa_type: this.data.type_id,area:this.data.area_id})
    saveCart().then((res) =>{
        if(res.data.error == 0){
            wx.hideLoading();
            showToast(function(){
                let shop_cart = res.data.cart_num;
                app.CartLength = shop_cart ; //更新app 中的数据
                app.hasNewCart = true ;
                s.setData({
                    foot_name: foot_name,
                    select: false,
                    shop_cart: shop_cart
                })
            },'加入购物车成功');
            
        }else{
            wx.hideLoading();
            showToast(function(){
            },'加入购物车失败');
        }
        
    }).catch((res)=>{
        wx.hideLoading();
        showToast(function(){
        },'加入购物车失败');
    })


  },


	/*去下单页*/
	
	GoToPay:function(){

        if (!this.data.select){
          this.setData({
            foot_name:'buy'
          })
          this.myshow();
          return;
        }
        console.log('选择框是否显示:'+this.data.select);
        console.log('选择的类型id为：' + this.data.type_id);
        console.log('选择的类型名称为' + this.data.type_name);
        console.log('选择的套餐id为:' + this.data.area_id);
        console.log('选择的套餐名称为:' + this.data.area_name);
        console.log('选择的数量为:'+this.data.num);
        console.log('商品的单价为：'+this.data.discount);
        console.log('goods_id为:' + this.data.goods_id);
        console.log('商品标题为'+this.data["visa_title"]);
        
        let obj = {};
        let openid =  wx.getStorageSync('openid');
        let visa_id =  this.data["goods_id"];
        let visa_title = this.data["visa_title"];
        let visa_price  = this.data.discount;
        let visa_num = this.data.num;
        let visa_sum = visa_price*visa_num ;
        let  visa_type = this.data.type_id;
        let visa_combo =  this.data.area_id;
        let pay_type = 1;
        let pay_status = 0;
        let type =2;
        let title_img = this.data["title_img"];
        
        let visa_type_name  = this.data.type_name;
        let  visa_combo_name = this.data.area_name; 
        
        obj = {
            "openid": openid,
            "visa_id": visa_id,
            "visa_title": visa_title,
            "visa_price": visa_price,
            "visa_num": visa_num,
            "visa_sum": visa_sum,
            "visa_type": visa_type,  //type_id
            "visa_combo": visa_combo, //area_id
            "pay_type": pay_type,
            "pay_status": pay_status,
            "type": type,
            "title_img": title_img,
            "visa_type_name": visa_type_name,
            "visa_combo_name": visa_combo_name
        }
        
        console.log(obj);
        app.payInfo = [];
        app.payInfo.push(obj);
        wx.navigateTo({
            url:'../order/order',
            success:function(){
                
            },
        })
	},
	
	/*预览图片*/
	
	_previewImage(e){
        //let src = e.currentTarget.dataset.src;
        let src = protocol.host+'Application/Uploads/VisaTemplate/visa_table.jpg';
        let arr = [];
        
        arr.push(src);
        
        let previewImage = new protocol.upload_and_download().previewImage;
        previewImage(src,arr);
    },
	
})



