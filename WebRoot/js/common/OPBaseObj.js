function DateToString(sdate,format){
    if(sdate==null) return "";
    if(sdate=="") return "";
    var date;
    if(typeof(new Date())!="string"){
        date=sdate;
    }else{
        date=new Date(sdate);
    }
    switch (format.toLowerCase()) {
        case 'yyyy-mm-dd' :
            return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
            break;
        case 'yyyy-mm-dd hh:mm:ss' :
            return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
            break;
        case 'yyyy/mm/dd':
            return date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();
            break;
        case 'dd/mm/yyyy':
            return date.getDate() +'/'+(date.getMonth()+1)+'/'+date.getFullYear();
            break;
        case 'mm/dd/yyyy':
            return date.getMonth()+'/'+(date.getMonth()+1) +'/'+date.getFullYear();
            break;
        case 'hh:mm:ss' :
            return date.getHours()+':'+(date.getMonth()+1)+':'+date.getSeconds();
            break;
        case 'yyyy年mm月dd日' :
            return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日';
            break;
        default :
            return date.toLocaleString();
    }
}

/*
 获得当前日期,格式YYYY-MM-DD
 */
function getCurDate(){
    var fun_dt = new Date();
    var fun_month = eval(1+fun_dt.getMonth());
    var fun_day = fun_dt.getDate();

    if(fun_month < 10) fun_month = "0"+fun_month;
    if(fun_day < 10) fun_day = "0"+fun_day;
    var fun_ds = fun_dt.getFullYear()+"-"+fun_month+"-"+fun_day;

    return fun_ds;
}

//将空类型的字符串转换成''
function cvtNull(str) {
    if (str == null || str == 'null') {
        return '';
    }else {
        return str;
    }
}
//将空类型的字符串转换成HTML空&nbsp;
function cvtHtmlNull(str) {
    if (str == null || str == 'null') {
        return '&nbsp;';
    }else {
        return str;
    }
}
/// 字符串字节长度
function strByteLen(str) {
    var fun_len = 0;
    var fun_i=0;
    if (str==null){
        return 0;
    }
    fun_len = str.length;
    for (fun_i = 0; fun_i < fun_len; fun_i++) {
        if (str.charCodeAt(fun_i) < 0 || str.charCodeAt(fun_i) > 255) {
            fun_len++;
        }
    }
    return fun_len;
}
// Function Name: len
// Function Description: 返回字符串的实际长度, 一个汉字算2个长度
// Creation Date: 2004-7-13 9:58
// Last Modify By: N/A
// Last Modify Date: N/A
function lenbyte(str){
    return str.replace(/[^\x00-\xff]/g, "**").length
}


/**********************************************************
 根据需要的长度将字符串截断
 input : str要截断的字符串 length要截断的长度
 output: 截断后的字符串。
 如果截断后字符串长度比要求的大一，则末尾为一个英文字母加一个汉字的形式，将后面的汉字截掉
 如...d号＝＝》...d ，以保证长度不超长
 */
function getFmtStr(str,length){
    var len,idx;
    len = 0;
    idx = 0;
    if(length>=StrLenOfAscii(str)) return str;
    var str_result = "";
    length=length-1;
    while (len < length){
        str_result += str.charAt(idx);
        if(isAscii(str.charCodeAt(idx))){
            len += 1;
        }else{
            len += 2;
        }
        idx += 1;
    }
    if(len > length){
        str_result = str_result.substr(0,str_result.length-1);
    }
    return str_result+".";
}


//移除字符串中的空格
function ReMoveStrNull(str){
    var temp='';
    for(var i=0;i<str.length;i++){
        if(str.substring(i,i+1)!=' '){
            temp+=str.substring(i,i+1);
        }
    }
    return temp;
}
//----------------------------------------------------除S以外的字符
function charsInBagEx (s, bag){
    var i,c;
    for (i = 0; i < s.length; i++){
        c = s.charAt(i);
        if (bag.indexOf(c) > -1)  return c;
    }
    return "";
}

/**
 * 合并紧挨着的相同的字符
 * @param str 被合并的字符串
 * @param strChar 字符
 * @return 完成合并后的字符串
 */
function combChar(str, strChar) {
    if (strChar == null || strChar == "") {
        return str;
    }
    var len = str.length;
    var index = 0;//上次匹配的地方
    var isFirst = "false";//第一个字符开始的子串是否与strChar匹配
    for (i = 0; i < len; i++) {
        if (strChar.length > (len - i)) {
            break;
        }
        var strTemp = str.substring(i, i + strChar.length);
        if (strTemp == strChar) {
            if (i == 0) {
                isFirst = "true";
            }
            //如果这次匹配与上次匹配是连续匹配
            if (index == (i - strChar.length)) {
                //如果上次匹配的地方不为0，或者上次匹配的地方是第一个字符，才是连续匹配
                if (index != 0 || isFirst == "true") {
                    str = str.substring(0,index) + str.substring(index + strChar.length);
                    len = len - strChar.length;
                    i = i - strChar.length;
                }
            }
            index = i;
            i = i + strChar.length - 1;
        }
        else {
            index = 0;
        }
    }
    return str;
}
//alert(combChar("2004200420042004aaaa","2004"));

function urlHandle(urlStr) {
    urlStr = urlStr.replaceAll("%","%25");
    urlStr = urlStr.replaceAll("#","%23");
    urlStr = urlStr.replaceAll("&","%26");
    urlStr = urlStr.replaceAll("+","%2B");
    //urlStr = urlStr.replaceAll("\\","%2F");
    urlStr = urlStr.replaceAll("=","%3D");
    urlStr = urlStr.replaceAll("?","%3F");
    return urlStr;
}


//在JAVASCRIPT中替换左右尖括号 < >  "  '  \  &
function maskHTMLCode(str) {
    if(str!=null){
        str = replaceAll(str,"&","&amp;");
        str = replaceAll(str,"<","&lt;");
        str = replaceAll(str,">","&gt;");
        str = replaceAll(str,"\"","&quot;");
        str = replaceAll(str,"'","&apos;");
    }
    return str;
}

function HTMLEncode(str) {
    if(str!=null){
        str = replaceAll(str,"\r\n","<br/>");
        str = replaceAll(str,"\n","<br/>");
        str = replaceAll(str,"\r","<br/>");
        str = replaceAll(str," ","&nbsp;");
    }else{
        str="";
    }
    return str;
}

function replaceAll(str,olds,news){
    if(str!=null)
    //str=str.replace(/olds/g, news);
        while(str.indexOf(olds)>=0){
            str=str.replace(olds,news);
        }
    return str;
}

//	格式化数字日期
function formatNumDate(val)
{
	try
	{
        if(typeof(val)=="string"){
            val = val.replace(/\s/g,"");
            val = val.replace(/-/g,"");
            val = val.replace(/\//g, "");
        }
		var y=parseInt(val/10000);
		var m=parseInt(val/100 %100);
		var d=parseInt(val%100);
	 	var D=new Date(y, m-1,d);
		if(D.getFullYear()==y && D.getMonth()+1==m && D.getDate()==d)
			return y+"-"+m+"-"+d;
		else return null;
	}
	catch(ex)
	{
		return null;
	}	
}
//逗号格式化数字  formatNum(1234005651.789,2);
function formatNum(num,n){//参数说明：num 要格式化的数字 n 保留小数位
    num = String(num.toFixed(n));
    var re = /(-?\d+)(\d{3})/;
    while(re.test(num)) num = num.replace(re,"$1,$2")
    return num;
}
function _format(pattern,num,z){
    //alert("pattern = " + pattern + "\n" + "num = " + num + "\n" + "z = " + z + "\n");
    var j = pattern.length >= num.length ? pattern.length : num.length ;
    var p = pattern.split("");
    var n = num.split("");
    var bool = true,nn = "";
    for(var i=0;i<j;i++){
        var x = n[n.length-j+i];
        var y = p[p.length-j+i];
        //alert("x="+x+"_y="+y);
        if( z == 0){
            if(bool){
                if( ( x && y && (x != "0" || y == "0")) || ( x && x != "0" && !y ) || ( y && y == "0" && !x )  ){
                    nn += x ? x : "0";
                    bool = false;
                }
            } else {
                nn +=  x ? x : "0" ;
            }
        } else {
            if( y && ( y == "0" || ( y == "#" && x ) ))
                nn += x ? x : "0" ;
        }
    }
    // alert("nn="+nn);
    return nn;
}
function _formatNumber(numChar,pattern){
    var patterns = pattern.split(".");
    var numChars = numChar.split(".");
    var z = patterns[0].indexOf(",") == -1 ? -1 : patterns[0].length - patterns[0].indexOf(",") ;
    var num1 = _format(patterns[0].replace(",",""),numChars[0],0);
    var num2 = _format( patterns[1]?patterns[1].split('').reverse().join(''):"", numChars[1]?numChars[1].split('').reverse().join(''):"",1);
    num1 =  num1.split("").reverse().join('');
    var reCat = eval("/[0-9]{" + (z-1) + "," + (z-1) + "}/gi");
    var arrdata = z > -1 ? num1.match(reCat) : undefined ;
    if( arrdata && arrdata.length > 0 ){
        var w = num1.replace(arrdata.join(''),'');
        num1 = arrdata.join(',') + ( w == "" ? "" : "," ) + w ;
    }
    num1 = num1.split("").reverse().join("");
    return (num1 == "" ? "0" : num1) + (num2 != "" ? "." + num2.split("").reverse().join('') : "" );
}
function formatNumber(num,opt){
    if(opt.pattern.indexOf("%")>0)
        num=num*100;
    var reCat = /[0#,.]{1,}/gi;
    var zeroExc = opt.zeroExc == undefined ? true : opt.zeroExc ;
    var pattern = opt.pattern.match(reCat)[0];
    var patterns = opt.pattern.split(".");
    var numChars = num.toString().split(".");
    if(numChars[1] && patterns[1])
        num=parseFloat(num).toFixed(patterns[1].length);
    numChar = num.toString();
    //alert(num+" numChar="+numChar);
    return !(zeroExc && numChar == 0) ? opt.pattern.replace(pattern,_formatNumber(numChar,pattern)) : opt.pattern.replace(pattern,"0");
}

/*
 var n = 1234567890000;
 var p = "######.00";
 var x = formatNumber(n,{pattern:p});
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 1234567890000.01;
 var p = "#";
 var x = formatNumber(n,{pattern:p});
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 n = 1234567890000;
 p = "######.##";
 x = formatNumber(n,{pattern:p});
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");


 var n = 1234567890000.00;
 p = "######.##";
 x = formatNumber(n,{pattern:p})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 1234567890000.00;
 p = "######.00";
 x = formatNumber(n,{pattern:p})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 1234567890000.01;
 p = "######.00";
 x = formatNumber(n,{pattern:p})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 1234567890000.01;
 p = "######.##";
 x = formatNumber(n,{pattern:p})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 1234567890000.00;
 p = "###,###.##";
 x = formatNumber(n,{pattern:p})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 1234567890000.01;
 p = "###,###.##";
 x = formatNumber(n,{pattern:p})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 1234567890000.00;
 p = "##,####.##";
 x = formatNumber(n,{pattern:p})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 1234567890000.01;
 p = "$###,###.##";
 x = formatNumber(n,{pattern:p})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 1234567890000.01;
 p = "###,###.##元";
 x = formatNumber(n,{pattern:p})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 0.01123123;
 p = "$###,###.##";
 x = formatNumber(n,{pattern:p})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 0.3453213;
 p = "$###,###.00";
 x = formatNumber(n,{pattern:p})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 0;
 p = "###,###.00元";
 x = formatNumber(n,{pattern:p})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n");

 var n = 0;
 p = "###,###.00元";
 x = formatNumber(n,{pattern:p,zeroExc:false})
 alert("n = " + n + "\n" + "p = " + p + "\n" + "x = " + x + "\n" + "zeroExc = " + false + "\n");

 */