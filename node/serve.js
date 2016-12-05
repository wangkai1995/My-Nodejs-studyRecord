var fs = require('fs');
var http = require('http');

http.createServer(function(request,response){
    console.log(request.url);
    var urlReg = new RegExp(/\/([\w]+).([\w]+)$/);
    var requestName = urlReg.exec(request.url);
    if(requestName){
        switch(requestName[2]){
            case 'css':
                cssOut(requestName[1]+'.'+requestName[2],function(data){
                    response.writeHead(200,{'Content-Type':'text/css'});
                    response.end(data.toString());
                });
                break;
            case 'js':
                jsOut(requestName[1]+'.'+requestName[2],function(data){
                    response.writeHead(200,{'Content-Type':'application/javascript'});
                    response.end(data.toString());
                });
                break;
            case 'html':
                htmlOut(requestName[1]+'.'+requestName[2],function(data){
                    response.writeHead(200,{'Content-Type':'text/html'});
                    response.end(data.toString());
                });
                break;    
        }
    }else{
        htmlOut('index.html',function(data){
            response.writeHead(200,{'Content-Type':'text/html'});
            response.end(data.toString());
        });
    }
}).listen(8080);



//输出JS
function jsOut(jsName,callback){
    fs.readFile('../'+jsName,function(err,data){
        if(err){
            console.log('读取出错');
            return false;
        }
        callback(data);
    });
}

//输出CSS
function cssOut(cssName,callback){
    fs.readFile('../'+cssName,function(err,data){
        if(err){
            console.log('读取出错');
            return false;
        }
        callback(data);
    });
}

//输出HTML
function htmlOut(htmlName,callback){
    fs.readFile('../'+htmlName, function(err,data){
        if(err){
            console.log('读取出错');
            return false;
        }
        callback(data)
    });
}




