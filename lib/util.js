

/*处理字符串函数*/

let dealTitleStyle = (title) => {
    let type,titlePrev,titleNext ; 
    
    let length = title.length;
    
    if(title.length <= 10){
        type = 0;
        titlePrev = title ;
        return{
            type: 0,
            titlePrev: titlePrev,
            titleNext: null
        }
    } else {
        type = 1;
        if(length <=20){
            titlePrev = title.substr(0,10);
            titleNext = title.substr(11);
        } else {
            titlePrev = title.substr(0,10);
            titleNext = title.substr(11,length-2)+'...';
        }
        return{
            type: 0,
            titlePrev: titlePrev,
            titleNext: titleNext
        }
    }
}

/*提取轮播图地址*/

let  ExtractionBanner = (data) =>{
    let ArrayBanner = [] ;
    for (let value of data ){
        let obj = new Object();
        Reflect.set(obj,'img',value);
        console.log(obj);
        ArrayBanner.push(obj);
    }
    return ArrayBanner ;
}

/*处理日期时间*/

class DateClass {
    constructor(){
        
    }
    
    /* 获取今天时间*/
   
    getDateTime(x) {
        var today = x?new Date(x):new Date();
        var month = today.getMonth() < 9 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1;
        var year =  today.getFullYear();
        var day = today.getDate() < 10 ? '0' + today.getDate() : today.getDate();
        
        var hours = today.getHours() <10 ? '0'+today.getHours():today.getHours();
        var min =  today.getMinutes() <10?  '0'+today.getMinutes():today.getMinutes() ;
        var seconds = today.getSeconds() <10 ? '0' +today.getSeconds() :today.getSeconds();
        
        var startTime = year + '-' + month + '-' + day +' '+hours+':'+min+":"+seconds;
        return startTime;
    }
    
    /*时间戳转换*/
    
    timeStampFormat(data,create_time,depart_time){
        for (var i =0;i<data.length; i++){
            var item = data[i];
            for (var key in item){
                var oldDate = item.key;
                if(key == 'create_time'){
                    item.create_time= getDateTime(Number(item[key])*1000)
                }
                else if(key == 'depart_time' ){
                    item.depart_time = getDate(Number(item[key])*1000);
                }
            }
        }
        return data
    }
   
   
    /*获取今天日期*/
   
    getDate(x) {
        var today = x?new Date(x):new Date();
        var month = today.getMonth() < 9 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1;
        var year =  today.getFullYear();
        var day = today.getDate() < 10 ? '0' + today.getDate() : today.getDate();
        
        var startTime = year + '-' + month + '-' + day;
        return startTime;
    }
    
}

/*处理字符串函数*/

function formatString(str){
    let exp = /\\r\\n/g ;
    str.replace(exp,'<br/>');
    return str;
}

module.exports = {
    dealTitleStyle: dealTitleStyle ,    //处理 title 样式
    ExtractionBanner: ExtractionBanner ,//提取轮播图
    DateClass:  DateClass,   //处理日期时间
    formatString: formatString 
    
}
