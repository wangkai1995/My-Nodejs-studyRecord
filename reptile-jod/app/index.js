var $ = require('cheerio');
var https = require('http');


//查询请求
function getQuery(){
    var query = 'http://sou.zhaopin.com/jobs/searchresult.ashx?jl='+encodeURI('深圳')+'&kw='+encodeURI('前台')+'&sm=0&p=1';
    https.get(query,function(requset,response){
        var html = '';

        requset.on('data',function(data){
            html += data;
        })

        requset.on('end',function(){
            filterStart(html);
        })
    });
};


//过滤开始
function filterStart(html){
   var tableList = $.load(html)('.newlist');
   var jodData  = [];

   tableList.map(function(index,item){
        var buff = {};
        var tr = $('tr',item);
        if(tr.length === 2){
            buff.jodLabel = filterJodLabel( tr[0] );
            buff.jodDetail = filterJodDetail( tr[1] ); 
        }
        jodData.push(buff);
   })

   console.log(jodData);
   return jodData;
}




//过滤岗位标签
function filterJodLabel(dom){
    var td = $('td',dom);
    var jodDetail = {};

    td.map(function(index,item){
        switch(index){
            case 0:
                jodDetail.jod =  filterJod(item);
                break;
            case 1:
                jodDetail.feedback = filterFeedback(item);
                break;
            case 2:
                jodDetail.company = filterCompany(item);
                break;
            case 3:
                jodDetail.call = filterCall(item);
                break;
            case 4:
                jodDetail.site = filterSite(item);
                break;
            case 5:
                jodDetail.date = filterDate(item);
                break;
            default:
                break;
        }
    });
    return jodDetail;
}

//过滤职位信息
function filterJod(dom){
    var jod = $('a',dom)[0];
    var jodUrl = jod.attribs.href;
    var jodText = $(jod).text();

    return{ jodUrl, jodText};
}

//过滤反馈率
function filterFeedback(dom){

    return $(dom).text() 
}

//过滤公司信息
function filterCompany(dom){
    var Company = $('a',dom)[0];
    var CompanyUrl = Company.attribs.href;
    var CompanyText = $(Company).text();
    return { CompanyUrl, CompanyText};
}

//过滤电话
function filterCall(dom){

    return $(dom).text();
}

//过滤地址
function filterSite(dom){

    return $(dom).text();
}

//过滤日期
function filterDate(dom){

    return $(dom).text();
}

//过滤岗位详细
function filterJodDetail(dom){
    var li = $('li',dom);
    var detail = {};
    
    detail.label = filterLabel(li[0]);
    detail.describe = $(li[1]).text();
    return detail;
}

//过滤标签
function filterLabel(dom){
    var label = {};
    for(var i=0; i< dom.children.length; i++){
        switch(i){
            case 0:
                label.city = $(dom.children[i]).text();
                break;
            case 1:
                label.CompanyType = $(dom.children[i]).text();
                break;
            case 2:
                label.CompanyNum = $(dom.children[i]).text();
                break;
            case 3:
                label.education = $(dom.children[i]).text();
                break;
            case 4:
                label.salary = $(dom.children[i]).text();
                break;
            default:
                break;
        }
    }
    return label;
}




getQuery();

