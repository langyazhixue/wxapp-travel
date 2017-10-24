
const app = getApp();
const protocol = require('../../lib/protocol.js');
const util = require('../../lib/util.js');

const  carts = [{
        'id1':'1',
        "type": 1,
        "id": '111',
        "title": '1',
        "des": '日本旅游产品日本旅游产品',
        "img": '../../images/20170707009_220x220.jpg',
        "price": 12,
        "discount": 10,
        "drive": 2,
        "start_city": '上海',
        "end_city": '日本',
        "start_day": '2017-08-07',
        "nu": 1,
        "selected": true,
        "display":'y'
    },{
        'id1':'2',
        "type": 1,
        "id": '112',
        "title": '2',
        "des": '韩国旅游产品日本旅游产品',
        "img": '../../images/20170707009_220x220.jpg',
        "price": 15,
        "discount": 12,
        "drive": 2,
        "start_city": '上海',
        "end_city": '韩国',
        "start_day": '2017-08-09',
        "nu": 2,
        "selected": true,
        "display":'y'
    },{
        'id1':'3',
        "type": 2,
        "id": '113',
        "title": '3',
        "des": '韩国旅游产品日本旅游产品',
        "img": '../../images/20170707009_220x220.jpg',
        "price": 220,
        "discount": 296,
        "drive": 2,
        "start_city": '上海',
        "end_city": '日本',
        "start_day": '2017-08-09',
        "nu": 2,
        "country":'日本',
        "visa_type":'单次签证',
        "area":'大阪',
        "selected": true,
        "display":'y'
    },{
        'id1':'4',
        "type": 2,
        "id": '113',
        "title": '4',
        "des": '泰国旅游产品日本旅游产品',
        "img": '../../images/20170707009_220x220.jpg',
        "price": 220,
        "discount": 296,
        "drive": 2,
        "start_city":null,
        "end_city":null,
        "start_day":null,
        "nu": 2,
        "country":'泰国',
        "visa_type":'单次签证',
        "area":'曼谷',
        "selected": true,
        "display":true
    },{
        'id1':'5',
        "type": 1,
        "id": '111',
        "title": '5',
        "des": '日本旅游产品日本旅游产品',
        "img": '../../images/20170707009_220x220.jpg',
        "price": 12,
        "discount": 10,
        "drive": 2,
        "start_city": '上海',
        "end_city": '日本',
        "start_day": '2017-08-07',
        "nu": 1,
        "selected": true,
        "display":true
    }
]





/*app入口*/

Page({
    data:{
        carts: null,                 //购物车产品数据
        hasList : false,             //是否含有购物车数据
        hasEditor: false ,                //默认处于未编辑状态， 此时可以  左右滑动
        scrollX : true,
        totalPrice: 0,              // 总价，初始为0
        selectAllStatus: true,       // 全选状态，默认全选
        modalHidden: true,          //是否显示弹窗
        indexNow  :null,              //发起弹窗的商品index
        imgUrlBase:app.data.imgUrlBase,
        "hasOnLoad": false,
        _self: null, // 判别是删除单个，还是删除全部
    },
    /*获得数据*/
    _handleData(data,self) {
        // 获取data
        //处理title 
        //处理图片地址
        let imgUrlBase = self.data.imgUrlBase;
         let getDate = new util.DateClass().getDate;
        for (let[i,v] of data.entries()){
            let img = imgUrlBase+ v.img;
            v.img = img;
            v.selected = true;
            v.discount = (v.price/v.nu);
            if(v.type == 1){
                v.depart_time = getDate(Number(v.depart_time)*1000);
            }
        }
        self.setData({
            "data": {
                "error":0,
                "data":1
            },
            carts: data,
            hasList: true,
            "hasOnLoad":true
        });
        self.getTotalPrice(self);
        
    },
    
    /*getData*/
    
    _getCartData(self,openid,title1 = '加载成功',title2 = '加载失败'){
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        //showLoading();
        let Cart = protocol.wxPromisify(wx.request,'Cart',{"openid":openid});
        Cart().then((res) =>{
            console.log(res);
            if(res.data.error == 0) {
                wx.hideLoading();
                wx.stopPullDownRefresh();
                showToast(function(){
                    if(res.data.data.length == 0) {
                        self.setData({
                            "data": {
                                "error":0,
                                "data":null,
                            },
                            "hasOnLoad":true,
                            
                        })
                        
                    }else {
                        self._handleData(res.data.data,self);  //处理数据，再把数据放到data中
                    }
                },title1);
               
            } else {
                wx.hideLoading();
                wx.stopPullDownRefresh();
                showToast(function(){
                    self.setData({
                        "data": {
                            "error":1,
                            "data":null,
                        },
                         "hasOnLoad":true
                    });
                    
                }, title2);
            }
            
        }).catch((value) =>{
            wx.hideLoading();
            wx.stopPullDownRefresh();
            showToast(function(){
                self.setData({
                    "data": {
                        "error":1,
                        "data":null,
                    },
                    "hasOnLoad":true,
                })
            },title2);
        })
        
    },
    onLoad(){
        let storage = new protocol.storage();
        let i = storage.checkStorage("openid");
        if(i == 0 ){
            return;    
        }else{
            let  self = this;
            let openid = wx.getStorageSync('openid');
            this._getCartData(self,openid);
        }
    },
    onShow() {
        if(app.hasNewCart && this.data.hasOnLoad){
            app.hasNewCart = false;
            let  self = this;
            let openid = wx.getStorageSync('openid');
            this._getCartData(self,openid,'更新成功','更新失败');
        }
    },
    
    /*是否编辑状态*/
    hasEditor() {
       let hasEditor = this.data.hasEditor;
       
       let carts = this.data.carts;
       
       for (let [index,item] of carts.entries()){
           carts[index].scrollLeft = 0;
       }
        // 修改所有的scrollLeft;
        this.setData({
           hasEditor: !hasEditor,
           carts : carts
        })
   },
   
   /*当前商品选中事件*/
  
    selectList(e) {
        let self = this;
        const index = e.currentTarget.dataset.index;
        
        let carts = this.data.carts;
        
        const selected = carts[index].selected;
        
        carts[index].selected = !selected;
        
        /*判断是否是全选状态*/
        
        let selectAllStatus = true ;
        
        
        for (let [index,item] of carts.entries()){
            
            if(!item.selected) {
                selectAllStatus = false ;
                break ;
            }
        }
        
        this.setData({
          carts: carts,
          selectAllStatus: selectAllStatus
        });
        
        this.getTotalPrice(self);
    },
    
    
    /*删除购物车当前商品*/
    
   
    deleteList(self,openid) {
        
        let index = this.data.indexNow ;
        let _self = this.data["_self"];
        let carts = this.data.carts;
        
        let cart_orders = [];
        
        if(_self == 'all'){
            for(let [i,v] of carts.entries()){
                let obj = {};
                obj.type = v.type;
                obj["goods_id"] = v.id;
                obj["cart_id"] = v["cart_id"];
                cart_orders.push(obj);
            }
        }else{
            let obj = {};
            obj.type = carts[index]["type"];
            obj["goods_id"] = carts[index]["id"];
            obj["cart_id"] = carts[index]["cart_id"];
            cart_orders.push(obj);
        }
        
        //cart_orders = JSON.stringify(cart_orders);
        console.log(cart_orders)
        
       //return false;
       
        let showToast = new protocol.wxCommonAPI().showToast;
        let showLoading = new protocol.wxCommonAPI().showLoading;
        showLoading();
        let d = protocol.wxPromisify(wx.request,'Cart/delete_cart',{"openid":openid,'carts':cart_orders});
        
        d().then((res) =>{
            console.log(res);
            if(res.data.error == 0) {
                wx.hideLoading();
                showToast(function(){
                    //去页面中把carts数组中的条数删除掉一条
                    let _self = self.data["_self"];
                    if(_self == 'all'){
                        self.setData({
                            "data": {
                                "error":0,
                                "data":null
                            },
                            carts:null,
                            indexNow:null,
                            _self:null
                        })
                        app.CartLength = 0;
                    }else{
                        let carts = self.data.carts;
                        let index = self.data.indexNow; 
                        carts.splice(index,1);
                        console.log(carts);
                        app.CartLength = app.CartLength-1;
                        if(carts.length == 0){
                            self.setData({
                                "data": {
                                    "error":0,
                                    "data":null
                                },
                                carts:null,
                                indexNow:null,
                                _self:null
                            })
                        }else{
                            self.setData({
                                carts:carts,
                                indexNow:null,
                                _self:null
                            })
                        }
                    }
                    
                },'删除成功');
               
            } else {
                wx.hideLoading();
                showToast(function(){
                    
                }, '删除失败');
            }
            
        }).catch((value) =>{
            wx.hideLoading();
            showToast(function(){
                
            },'删除失败');
        });
        
    },
    
    showModel(e){
        const indexNow = e.currentTarget.dataset.index;
        const self =  e.currentTarget.dataset.self;
        this.setData({
           modalHidden: false,
           indexNow: indexNow,
           "_self": self,
        })
    },
    modalConfirmChange(e){
        let self  = this ;
        this.setData({
            modalHidden: true,
        })
        let openid = wx.getStorageSync("openid");
        this.deleteList(self,openid);
    },
    
    modalCancelChange(e) {
        this.setData({
            modalHidden: true,
            indexNow: null,
            "_self":null
        })
    },
    
    /*绑定减事件*/
    
    minusCount(e){
        let self = this;
        const index = e.currentTarget.dataset.index;
        let carts = this.data.carts;
        let nu = carts[index].nu;
        if(nu > 1) {
            nu--;
            carts[index].nu= nu;
            this.setData({
              carts: carts
            });
            this.getTotalPrice(self);
        }
    },
    
    /*绑定加事件*/
   
    addCount(e){
        let self =  this;
        const index = e.currentTarget.dataset.index;
        let carts = this.data.carts;
        let nu = carts[index].nu;
        nu++;
        carts[index].nu= nu;
        
        this.setData({
          carts: carts
        });
        
        this.getTotalPrice(self);
    },
  
    /* 计算总价*/
    getTotalPrice(self) {
        let carts = self.data.carts;                    // 获取购物车列表
        let total = 0;
        for (let [index,item] of carts.entries()) {         // 循环列表得到每个数据
          if(item.selected) {                               // 判断选中才会计算价格
            total += item.nu*item.discount;               // 所有价格加起来
          }
        }
        self.setData({                                // 最后赋值到data中渲染到页面
          carts: carts,
          totalPrice: total,
        });
    },
    
    /*全选状态*/
    selectAll() {
        let self = this;
        let selectAllStatus = this.data.selectAllStatus;
        let carts = this.data.carts;
        if( !selectAllStatus) {
            for (let [index, item] of carts.entries()) {
               carts[index].selected = true;
            }
        } else {
            for (let [index, item] of carts.entries()) {
                carts[index].selected = false;
            }     
           
        };
       
        this.setData({
           carts: carts,
           selectAllStatus: !selectAllStatus
        });
        this.getTotalPrice(self);
       
    },
    
//  /*刷新*/
     onPullDownRefresh: function(){
        let  self = this;
        let storage = new protocol.storage();
        let i = storage.checkStorage("openid");
        if(i == 0 ){
            wx.stopPullDownRefresh();
            return;    
        } else{
            let openid = wx.getStorageSync('openid');
            this._getCartData(self,openid,'更新成功','更新失败')  //获取数据
        }
       
    },
    
    /*去支付*/
   
    getToPay:function(){
       let carts = this.data.carts;
       let arr = [];
       let openid = wx.getStorageSync('openid');
       
       for (let [i,v] of carts.entries()){
           if(v.selected){
                let obj = {};
                if(v.type == 1){
                    // 产品
                                       
                    let goods_id = v.id;
                    let title =v.title;
                    let goods_price = v.discount;
                    let goods_num = v.nu;
                    let order_sum = v.nu*v.discount;
                    let depart_time = v["depart_time"];
                    let pay_type = 1;
                    let pay_status = 0;
                    let type = 1;
                    let title_img = v.img;
                    obj = {
                        "openid": openid,
                        "goods_id": goods_id,
                        "title": title,
                        "goods_price": goods_price,
                        "goods_num": goods_num,
                        "order_sum": order_sum,
                        "depart_time": depart_time,
                        "pay_type": pay_type,
                        "pay_status": pay_status,
                        "type": type,
                        "title_img": title_img
                    }
                   
                   
                } else if(v.type == 2){
                   //签证
                    let visa_id =  v.id;
                    let visa_title = v["title"];
                    let visa_price  = v.discount;
                    let visa_num = v.nu;
                    let visa_sum = v.nu*v.discount ;
                    let visa_type = v["visa_type_id"];
                    let visa_combo =  v["visa_combo"];
                    let pay_type = 1;
                    let pay_status = 0;
                    let type = 2;
                    let title_img = v.img;
                    
                    let visa_type_name  = v["visa_type"];
                    
                    let  visa_combo_name = v["area"];
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
               }
               arr.push(obj);
               
            }
        }
       
        /*跳去支付*/
        app.payInfo =[];
        app.payInfo = arr;
        wx.navigateTo({
            url:'../order/order',
            success:function(){
                
            },
        })
   },
   
})

