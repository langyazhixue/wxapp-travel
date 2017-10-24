/*app入口*/


const  _datePicker = require ('../../lib/datePicker');
const app = getApp();
const util = require('../../lib/util');
const protocol =  require('../../lib/protocol');

Page({
    data:{
        "data": null,
        "windowWidth":null,
        "start_day":108,
        "price": 900,
        "discount":[{
                "discount_start_time": "2017-06-25",
                "discount_end_time": "2017-06-27",
                "discount": "333"
            },{
                "discount_start_time": "2017-07-04",
                "discount_end_time": "2017-07-30",
                "discount": "555"
            },{
                "discount_start_time": "2017-08-04",
                "discount_end_time": "0",
                "discount": "222"
            }
        ],
    },
    
    /*onLoad*/
   
    onLoad: function (){
        var self = this;
        
        /*获取设备宽度*/
       
       wx.getSystemInfo({
            success: function(res) {
                console.log(res.windowWidth);
                self.setData({
                    windowWidth: res.windowWidth+'px'
                })
            }
        })
       
        let datePic = _datePicker.datePicker;
        let traveDate = new  datePic();
        
        //数据准备
        let datePickerData =  app.dataPickerData;
        
        console.log(datePickerData);
        
        let start_day = Number(datePickerData["start_day"]);  //出团
        let price =  datePickerData.price;  //正常价格
        let discount = datePickerData.discount;  //折扣价
        
        let modeArray;//出团数组
        
        if(discount == null || discount =='') {
            discount = null
        }
        if(start_day != '' && start_day != null) {
            //console.log('mode_1');
            modeArray = Array.of(...(start_day.toString(2)));
            console.log(modeArray)
            let len = modeArray.length;
            if(len < 7){
                let d = 7-len;
                for(let i =0; i<d; i++){
                   modeArray.unshift("0"); 
                }
            }
            
            console.log(modeArray)
            //let a = Array.of(...(start_day.toString(2)));
            modeArray = self.sort(modeArray);
            
        } else {
            //console.log('mode_2');
            modeArray = Array.of(...("127".toString(2)));
        }
        
        console.log(modeArray);
        
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth()+1;
        
        let _date = today.getDate();
        
        let data = traveDate.buildUI(year,month,price,discount,modeArray);
        console.log(data);
        this.setData({
            "data":data
        })
        
    },
    
    /*选择时间*/
    
    chooseData:function(e){
        let getDate = new util.DateClass().getDate
         
        let price = e.currentTarget.dataset.price ;
        let hasDiscount = e.currentTarget.dataset.hasdiscount;
       
        let  startday = (e.currentTarget.dataset.startday).split('-');
        let  choosedDate = '';
        if(startday.some(function(value){
            return value == '今天'
        })){
            choosedDate = getDate(new Date());
        } else{
            choosedDate = getDate(new Date(parseInt(startday[0]),parseInt(startday[1]-1),parseInt(startday[2])));
        }
          
        let  choosedTime = {
            "choosedPrice":price,
            "hasDiscount": hasDiscount,
            "choosedDate": choosedDate
        };
        
        app.choosedTime = choosedTime;
        console.log(choosedTime);
        wx.navigateBack();
    },
    
    /*排序*/
    sort:function(a){
     var  b = (a.slice(1)).reverse();
     var arr = [a[0]].concat(b);
     return arr ;
    }
})
