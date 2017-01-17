var https = require('https');
var fs = require('fs');

//查询请求
function getQuery(select,callback){
    var query = 'https://www.zhihu.com/search?type=content&q='+encodeURI(select);
    https.get(query,function(requset,response){
        var html = '';

        requset.on('data',function(data){
            html += data;
        })

        requset.on('end',function(){
            callback(filtration(html));
        })
    });
};


//正则过滤
function filtration(data){
    var list = [];
    var reg = new RegExp(/<div\sclass="title"><a(?:[^\$]*?)href="([\/\w]+?)"(?:.*?)>(.+?)<\/a><\/div>/g);
    var buff = data.match(reg);
    if(buff){
        // console.log(buff);
        var itemReg = new RegExp(/<a(?:.*?)href="([\/\w]+?)"(?:.*?)>(.+?)<\/a>/);
        for(var i=0; i<buff.length;i++){
            var str = itemReg.exec(buff[i]);
            if(str){
                var item = {};
                item.url = 'https://www.zhihu.com'+str[1];
                item.title =  str[2].replace(/[\/<em>]/g,''); 
                list.push(item);            
            }
        }
        return list;
    }else{
        console.log('匹配出错');
    }        
};


var select = process.argv[2];


getQuery(select,function(data){
    console.log(data);
    fs.writeFile('查询结果.txt', JSON.stringify(data), function(err){
        if(err){
            return console.error(err);
        }
        console.error('写入成功');
    })
});

