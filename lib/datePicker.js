
 function datePicker (){
    this.monthData = '';
    this.$wrapper = null;
}
    
datePicker.prototype = {
    format: function(date) {
        var year = date.getFullYear();
        var month = date.getMonth()+1 ;
        var _date = date.getDate();
        return year + '-' + month + '-' + _date;
    },
    
    extendsArray: function(array){
        let a = array;
        for(let i = 0 ;i < 6 ;i++){
            a = [...a,...array]
        }
        return a
    },
    
    formate: function(date) {
        var year = date.getFullYear();
        var month = date.getMonth()+1 ;
        var _date = date.getDate();
        return year + '-' + month + '-' + _date;
    },
    
    formateDiscount: function(year,month,obj){
        let res = {};
        let startDate =  new Date(obj.discount_start_time);
        
        //如果开始时间大于页面显示的最后时间 返回空的数组
        //let startDateAll = new Date(year,month-1+1,0);
        
        let discount = obj.discount;
        
        
        let year_start = startDate.getFullYear(); //开始的年数
        
        let month_start = startDate.getMonth()+1;  //开始的月数
        
        let date_start = startDate.getDate();  //开始的天数\
        
        let endDate;
        
        if( Number(obj.discount_end_time) != 0){
            endDate = new Date(obj.discount_end_time);
        } else{
            //获取第六个月的最后一天的时间
            
            let endDate_1 = new Date(year_start,(month_start-1+6),0);
            let endDate_2 = new Date(year,(month-1+6),0); //
            
            //取小
            
            if(endDate_1.getTime() < endDate_2.getTime()) {
                endDate = endDate_1;
            } else {
                endDate = endDate_2;
            }
        }
        
        /*计算相差天数*/
        let distance = parseInt(Math.abs((endDate.getTime())-(startDate.getTime()))/1000/60/60/24)+1 ;
        for(let i = 0;  i<distance ; i++){
            
            let d = new Date(year_start,month_start-1,date_start+i);
            
            let o = this.formate(d);
            
            res[o] = discount;
            
        };
        
        return res;
    },
    
    
    formatePrice: function(year,month,discount){
        
        let res ={};
        if(discount != null) {
            console.log('f');
            for(let i = 0; i < discount.length; i++) {
                let d = this.formateDiscount(year,month,discount[i]);
                Object.assign(res,d);
            }
        } else{
            console.log('d');
        }
        
        return res;
    },
        
    getMonthData: function(year,month,modeArray) {
        var ret = [] ;
        if(!year || !month) {
            var today = new Date();
            year = today.getFullYear();
            month = today.getMonth() + 1;
        }
        
        var firstDay = new Date(year,month-1,1);
        
        var firstWeekDay = firstDay.getDay();
        
        // 获取当月的year 和month
        
        year = firstDay.getFullYear();
        
        month = firstDay.getMonth()+1;
        
        
        
        // 上一个月最后一天
        
        var lastDayOfLastMonth = new Date(year,month-1,0);
        
        var lastDateOfLastMonth =  lastDayOfLastMonth.getDate();
        
        //
        var preMonthDayCount = firstWeekDay ;
        
        //最后一天
        var lastDay = new Date(year, month ,0);
        
        var lastDateOfThisMonth =  lastDay.getDate();
        
        
        
        //  获取今天的数据 今天以前的数据应该不显示
        
        let  _today = new Date();
        let _year = _today.getFullYear();
        let _month = _today.getMonth() + 1;
        
        let _date =  _today.getDate();
        
        
        //循环一个月的数据
        
        for (var i = 0; i<7*6;i++){
            var item = i+1 - preMonthDayCount  ;
            var showData = item;
            var thisMonth = month ;
            var thisYear = year;
            
            var show = true;
            var showOnPage = true
            var afterToday = true;
            
            // 处理这个月今天以前的数据
            if(year == _year && _month == month){
                if(showData < _date ) {
                    afterToday = false
                }else if (showData == _date){
                    //showData = '今天'
                }
            } 
            
            //是不是今天
            
            
            // 处理上个月的情况
            if(item <= 0) {
                show = false;
                showOnPage = true;
                showData = lastDateOfLastMonth + item;
                thisMonth = month -1 ;
            } else if (showData > lastDateOfThisMonth){
                // 下一个月的情况
                show = false;
                showOnPage = false;
                thisMonth = month+1;
                showData = showData - lastDateOfThisMonth;
            }
            
            if (thisMonth == 0 ){
                thisMonth = 12;
                thisYear = year -1;
            } else if (thisMonth == 13){ 
                thisMonth = 1 ;
                thisYear = year + 1;
                
            }
            
            // 用来处理价格的字段
            let yearMonthDay = thisYear+'-'+thisMonth+'-'+showData;
            
            ret.push({
                "showData":showData,
                "thisMonth": thisMonth,
                "thisYear": thisYear,
                "data": item,
                "show": show,   //控制是不是这个月的数据
                "showOnPage": showOnPage,  // 控制是否需要显示在页面中
                "yearMonthDay": yearMonthDay,
                "afterToday": afterToday   //控制是不是今天以后的数据
            })
            
        }
        
        // 针对modeArray 处理ret
        
        let a = this.extendsArray(modeArray);
        
        let startDay; // 控制出团日，出团日需要显示价格
        for (let j = 0 ; j<7*6;j++) {
            if(a[j] == '0') {
                ret[j]['startDay'] = false
            } else{
                ret[j]['startDay'] = true
            }
        }
        
        //返回数据
        
        var data ={
            "year":year,
            "month":month,
            "ret":ret
        }
        return data ;
        
    },
      
    buildUI: function (year,month,price,discount,modeArray){
        let _data =[];
        
        let data ;
        
        let m;
        
        for (let i = 0;i<6;i++) {
            m = month+ i  ;
            if(m == 0){
                year = year -1 ;
                m = 12 ;
            } else if (m >12){
                year = year + 1 ;
                m = m-12 ;
            }
            
            data = this.getMonthData(year,m,modeArray) ;
            _data.push(data);
            
        }
        
        // 处理价格
        let discountObj = this.formatePrice(year,month,discount);
        
        for (let [index,item] of _data.entries()) {
            for (let [index_,item_] of (item.ret).entries()){
                let yearMonthDay = item_.yearMonthDay;
                
                if(discountObj[yearMonthDay]){
                    Reflect.set(item_ ,"price",discountObj[yearMonthDay]);
                    Reflect.set(item_ ,"hasDiscount",true);
                } else{
                    Reflect.set(item_ ,"price",price);
                    Reflect.set(item_ ,"hasDiscount",false);
                }
            }
            
        }
        
        
        return _data;
    }
}


module.exports = {
    datePicker: datePicker 
    
}
