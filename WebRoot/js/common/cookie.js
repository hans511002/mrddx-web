/******************************************************************************
 * Cookie functions.                                                           *
 ******************************************************************************/

    //设置cookie的函数
function SetCookie (name,value)   {
    var the_cookie = "'"+name + "=" + escape (value) +"'";
    var dateexpire = 'Tuesday, 01-Dec-2020 12:00:00 GMT';
    document.cookie = the_cookie + '; expires='+dateexpire;
}
//设置cookie的函数 路径和认证
function SetCookieWithPar (name,value,expires,path,domain,secure)   {
    var argv = SetCookie.arguments;
    var argc = SetCookie.arguments.length;
    var Expires=new Date();
    if(expires!=null && expires!=''){
        Expires =new Date(expires);
    }else{
        Expires.setTime(Expires.getTime()+(30*24*60*60*1000));//有效日期 30天
    }
    document.cookie = name + "=" + escape (value);
    document.cookie +='; expires=' + expires.toGMTString() +
        ((path == null) ? '' : ('; path=' + path)) +
        ((domain == null) ? '' : ('; domain=' + domain)) +
        ((secure == true) ? '; secure' : '');}
// 输出JS取cookie的函数
// 通过名称 /name
function GetCookieByname(sName){
    var aCookie = document.cookie.split(";");
    for (var i=0; i < aCookie.length; i++){
        var aCrumb = aCookie[i].split("=");
        if (sName == aCrumb[0])
            return unescape(aCrumb[1]);
    }
    return null;
}
//名称 /索引 取cookie的函数 
function getCookie(name) {
    var search;
    search = name + "="
    offset = document.cookie.indexOf(search)
    if (offset != -1) {
        offset += search.length ;
        end = document.cookie.indexOf(";", offset) ;
        if (end == -1)
            end = document.cookie.length;
        return unescape(document.cookie.substring(offset, end));
    }
    else
        return "";
}
//删除
function deleteCookie(name) {
    SetCookie(name, "");
}
/******************************************************************************
 * End of cookie functions.                                                    *
 ******************************************************************************/