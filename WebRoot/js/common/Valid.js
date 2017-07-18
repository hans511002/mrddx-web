/**
 * JS验证函数，本文件所有函数皆返回布尔值 ，函数命名以is或has开头
 * 重上到下，分别为，，日期，字符串，通用
 */

// Function Name: isValidDate
// Function Description: 判断输入是否是有效的短日期格式 - "YYYY-MM-DD"
// Creation Date: 2004-7-13 9:58
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidDate(str){
    var result=str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
    if(result==null) return false;
    var d=new Date(result[1], result[3]-1, result[4]);
    return (d.getFullYear()==result[1]&&d.getMonth()+1==result[3]&&d.getDate()==result[4]);
}

// Function Name: isValidTime
// Function Description: 判断输入是否是有效的时间格式 - "HH:MM:SS"
// Creation Date: 2004-7-13 9:58
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidTime(str){
    var result=str.match(/^(\d{1,2})(:)?(\d{1,2})\2(\d{1,2})$/);
    if (result==null) return false;
    return !(result[1] > 24 || result[2] > 60 || result[3] > 60);

}
/**
 * 是否是日期的检查(日期格式为"yyyy-mm-dd hh:mm:ss")
 * 格式：年必须输入四位数且必须在1900年以后；月日时分秒要么输入两个数字，要么输入一个数字；
 * @param dateStr 被检查的字符串
 * @return true(是日期格式"yyyy-mm-dd hh:mm:ss"); false(不是日期格式"yyyy-mm-dd hh:mm:ss")
 */
function isDateTime(dateStr) {
    dateStr = combChar(dateStr, " ");
    var re = /^(\d{4})\-(\d{1,2})\-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
    var r = dateStr.match(re);
    if (r == null) {
        return false;
    }else {
        var str = dateStr.split(" ");
        var s = str[0].split("-");
        var strTime = str[1].split(":");
        if (s[0].substring(0,2) < 19 || s[1] > 12 || s[1] < 1 || s[2] > 31 || s[2] < 1) {
            return false;
        }
        if ((s[1] == 4 || s[1] == 6 || s[1] == 9 || s[1] == 11) && s[2] == 31) {//月小
            return false;
        }

        if (((s[0] % 4 == 0) && (s[0] % 100 != 0)) || (s[0] % 400 == 0)) { //是闰年
            if (s[1] == 2 &&  s[2] > 29) {
                return false;
            }
        }
        else {//不是闰年
            if (s[1] == 2 &&  s[2]>28) {
                return false;
            }
        }
        if (strTime[0] > 23 || strTime[1] > 59 || strTime[2] > 59 ) {
            return false;
        }
    }
    return true;
}
//Function Name: isValidDatetime
//Function Description: 判断输入是否是有效的长日期格式 - "YYYY-MM-DD HH:MM:SS"
//Creation Date: 2004-7-13 9:59
//Last Modify By: N/A
//Last Modify Date: N/A
function isValidDatetime(str)
{
var result=str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/);
if(result==null) return false;
var d= new Date(result[1], result[3]-1, result[4], result[5], result[6], result[7]);
return (d.getFullYear()==result[1]&&(d.getMonth()+1)==result[3]&&d.getDate()==result[4]&&d.getHours()==result[5]&&d.getMinutes()==result[6]&&d.getSeconds()==result[7]);
}

/**
 * 判断日期dateStr1是否小于日期dateStr2的(日期格式为"yyyy-mm-dd")
 * 格式：年必须输入四位数且必须在1900年以后；月日要么输入两个数字，要么输入一个数字；
 * @param dateStr1 第一个字符串
 * @param dateStr2 第二个的字符串
 * @return null(dateStr1格式不对或dateStr2格式不对); true(dateStr1 < dateStr2); false(dateStr1 >= dateStr2)
 */
function isBeforeDate(dateStr1, dateStr2) {
    if (!isValidDate(dateStr1) || !isValidDate(dateStr1)) {
        return null;
    }
    var s1 = dateStr1.split("-");
    var s2 = dateStr2.split("-");
    if (s1[0] < s2[0]) {//年小于
        return true;
    }else if (s1[0] == s2[0]) {//年相等
    	s1[1]=parseInt(s1[1]);
    	s2[1]=parseInt(s2[1]);
        if (s1[1] < s2[1]) {//月小于
            return true;
        }else if (s1[1] == s2[1]) {//月相等
        	s1[2]=parseInt(s1[2]);
        	s2[2]=parseInt(s2[2]);
            if (s1[2] < s2[2]) {//日小于
                return true;
            }
        }
    }
    return false;
}
/**
 * 判断日期dateStr1是否等于日期dateStr2的(日期格式为"yyyy-mm-dd")
 * 格式：年必须输入四位数且必须在1900年以后；月日要么输入两个数字，要么输入一个数字；
 * @param dateStr1 第一个字符串
 * @param dateStr2 第二个的字符串
 * @return null(dateStr1格式不对或dateStr2格式不对); true(dateStr1 = dateStr2); false(dateStr1 != dateStr2)
 */
function isEqualDate(dateStr1, dateStr2) {
    if (!isValidDate(dateStr1) || !isValidDate(dateStr2)) {
        return null;
    }
    var s1 = dateStr1.split("-");
    var s2 = dateStr2.split("-");
    if (s1[0] != s2[0]) {//年不相等
        return false;
    }else {//年相等
    	s1[1]=parseInt(s1[1]);
    	s2[1]=parseInt(s2[1]);
        if (s1[1] != s2[1]) {//月不相等
            return false;
        }else {//月相等
        	s1[2]=parseInt(s1[2]);
        	s2[2]=parseInt(s2[2]);
            if (s1[2] != s2[2]) {//日不相等
                return false;
            }
        }
    }
    return true;
}

/**
 * 判断日期dateStr1是否小于日期dateStr2的(日期格式为"yyyy-mm-dd hh:mm:ss")
 * 格式：年必须输入四位数且必须在1900年以后；月日时分秒要么输入两个数字，要么输入一个数字；
 * @param dateStr1 第一个字符串
 * @param dateStr2 第二个的字符串
 * @return null(dateStr1格式不对或dateStr2格式不对); true(dateStr1 < dateStr2); false(dateStr1 >= dateStr2)
 */
function isBeforeDateTime(dateStr1, dateStr2) {
    if (!isDateTime(dateStr1) || !isDateTime(dateStr1)) {
        return null;
    }
    var s1 = dateStr1.split(" ");
    var s2 = dateStr2.split(" ");
    if (isBeforeDate(s1[0], s2[0])) {//年月日小于
        return true;
    }
    else if (isEqualDate(s1[0], s2[0])) {//年月日相等
        var strTime1 = s1[1].split(":");
        var strTime2 = s2[1].split(":");
        strTime1[0]=parseInt(strTime1[0]);
        strTime2[0]=parseInt(strTime2[0]);
      
        if (strTime1[0] < strTime2[0]) {//小时小于
            return true;
        }else if (strTime1[0] == strTime2[0]) {//小时相等
        	  strTime1[1]=parseInt(strTime1[1]);
              strTime2[1]=parseInt(strTime2[1]);
            if (strTime1[1] < strTime2[1]) {//分小于
                return true;
            }else if (strTime1[1] == strTime2[1]) {//分相等
            	  strTime1[2]=parseInt(strTime1[2]);
                  strTime2[2]=parseInt(strTime2[2]);
                if (strTime1[2] < strTime2[2]) {//秒小于
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * 判断日期dateStr1是否等于日期dateStr2的(日期格式为"yyyy-mm-dd hh:mm:ss")
 * 格式：年必须输入四位数且必须在1900年以后；月日时分秒要么输入两个数字，要么输入一个数字；
 * @param dateStr1 第一个字符串
 * @param dateStr2 第二个的字符串
 * @return null(dateStr1格式不对或dateStr2格式不对); true(dateStr1 = dateStr2); false(dateStr1 != dateStr2)
 */
function isEqualDateTime(dateStr1, dateStr2) {
    if (!isDateTime(dateStr1) || !isDateTime(dateStr1)) {
        return null;
    }
    var s1 = dateStr1.split(" ");
    var s2 = dateStr2.split(" ");
    if (isEqualDate(s1[0], s2[0])) {//年月日相等
        var strTime1 = s1[1].split(":");
        var strTime2 = s2[1].split(":");
        if (strTime1[0].charAt(0) == '0') {
            strTime1[0] = "" + strTime1[0].charAt(1);
        }
        if (strTime2[0].charAt(0) == '0') {
            strTime2[0] = "" + strTime2[0].charAt(1);
        }
        if (strTime1[0] == strTime2[0]) {//小时相等
            if (strTime1[1].charAt(0) == '0') {
                strTime1[1] = "" + strTime1[1].charAt(1);
            }
            if (strTime2[1].charAt(0) == '0') {
                strTime2[1] = "" + strTime2[1].charAt(1);
            }
            if (strTime1[1] == strTime2[1]) {//分相等
                if (strTime1[2].charAt(0) == '0') {
                    strTime1[2] = "" + strTime1[2].charAt(1);
                }
                if (strTime2[2].charAt(0) == '0') {
                    strTime2[2] = "" + strTime2[2].charAt(1);
                }
                if (strTime1[2] == strTime2[2]) {//秒相等
                    return true;
                }
            }
        }
    }
    return false;
}

//判断是否润年
function isLeapYear(Year){
    if(Math.round(Year/4) == Year/4){
        if(Math.round(Year/100) == Year/100){
            if(Math.round(Year/400) == Year/400)
                return true;
            else return false;
        }else return true;
    }
    return false;
}

//检查字符串是否为空格或空
function isNullStr(str){
    if(str == null) return true;
    if(str.trim()==""){
        return true;
    }else{
        return false;
    }
}

//判断是否是ASCII字符
function isAscii(ch){
    if(ch > 0 && ch <= 255){
        return true;
    }else{
        return false;
    }
}

//---------------------------------------------------检验字符串中是否含有禁止的字符！如： '<>/?&#=
//如果为空或超出长度或含有禁止的字符，则返回 true ； 合法则返回 false
function isBadCharInName(s){
    var errorChar;
    var badChar = "><,[]{}?/+=|\\'\":;~!@#$%^&()`";
    if (isNullStr(s)){
        alert("内容为空，请重新输入！");
        return true;
    }
    errorChar = charsInBagEx(s, badChar)
    if (errorChar != "" ){
//        alert("您输入的内容" + s+"是无效的,\n\n请不要在其中输入字符" + errorChar + "!\n\n请重新输入合法的内容！" );
        return true;
    }
    if (s.length<1 || s.length>50){
//        alert("必须在1至50个字符之间");
        return true;
    }
    return false;
}

/**
 * 判断是否是文件地址，即是否输入了文件不能解析的字符
 * @param str String
 * @return boolean
 */
function isFileAddress(str) {
    if(str==null)return false;
    if(str.indexOf("/")>=0)return false;
    else if (str.indexOf("\\")>=0)return false;
    else if (str.indexOf(":")>=0)return false;
    else if (str.indexOf("*")>=0)return false;
    else if (str.indexOf("?")>=0)return false;
    else if (str.indexOf("<")>=0)return false;
    else if (str.indexOf(">")>=0)return false;
    else if (str.indexOf("|")>=0)return false;
    return true;
}

/**
 * 判断是否有尖括号和单引号
 * @param str String
 * @return boolean
 */
function hasNotSharpAndSinglequotes(str) {
    if (str == null) {
        return true;
    }
    if (str.indexOf("<") >= 0) {
        return false;
    }else if (str.indexOf("'") >= 0) {
        return false;
    }
    return true;
}
/**
 * 检测是否是英文字母
 * @param str 被检查的字符串
 * @return true; false
 */
function isEnglish(str) {
    var result=str.match(/^[a-zA-Z]+$/);
    if(result==null) return false;
    return true;
}

/**
 * 检测是否是合法的名字（字母，数字，下划线，且第一个字符不能为数字）
 * @param str 被检查的字符串
 * @return true; false
 */
function isValidName(str) {
	if(isNullStr(str))return true;
    var Letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
    for (i = 0; i < str.length; i++) {
        var checkChar = str.charAt(i);
        if (Letters.indexOf(checkChar) == -1) {
            return false;
        }if (i == 0 && isInt(checkChar)) {
            return false;
        }
    }
    return true;
}

/*是否整数 */
function isInt(str){
    var reg = /^[1-9]*[0-9]*$/g ;
    if(reg.test(str))
        return true;
    else
        return false;
}

function isURL(url){
    if(url==null)return false;
    var re = /^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))*/g;//匹配url地址的正则表达式
    if(re.test(url))return true;
    return false;
}

function isIP(ip){
    if(ip==null)return false;
    var re=/(\d+)\.(\d+)\.(\d+)\.(\d+)/g;//匹配IP地址的正则表达式
    if(re.test(ip))return true;
    return false;
}

// Function Name: isValidEmail
// Function Description: 判断输入是否是有效的电子邮件
// Creation Date: 2004-7-13 9:59
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidEmail(str){
    var result=str.match(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/);
    if(result==null) return false;
    return true;
}

// Function Name: isValidInteger
// Function Description: 判断输入是否是一个整数
// Creation Date: 2004-7-13 10:01
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidInteger(str){
    var result=str.match(/^(-|\+)?\d+$/);
    if(result==null) return false;
    return true;
}

// Function Name: isValidPositiveInteger
// Function Description: 判断输入是否是一个正整数
// Creation Date: 2004-7-13 10:01
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidPositiveInteger(str){
    var result=str.match(/^\d+$/);
    if(result==null) return false;
    if(parseInt(this)>0) return true;
    return false;
}

// Function Name: isValidNegativeInteger
// Function Description: 判断输入是否是一个负整数
// Creation Date: 2004-7-13 10:28
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidNegativeInteger(str){
    var result=str.match(/^-\d+$/);
    if(result==null) return false;
    return true;
}

// Function Name: isValidNumber
// Function Description: 判断输入是否是一个数字
// Creation Date: 2004-7-13 10:01
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidNumber(str){
    return !isNaN(str);
}

// Function Name: isValidDigits
// Function Description: 判断输入是否是一个由 0-9 组成的数字
// Creation Date: 2004-7-13 10:10
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidDigits(str){
    var result=str.match(/^[0-9][0-9]+$/);
    if(result==null) return false;
    return true;
}

// Function Name: isValidAlphanumeric
// Function Description: 判断输入是否是一个由 0-9 / A-Z / a-z 组成的字符串
// Creation Date: 2004-7-13 10:14
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidAlphanumeric(str){
    var result=str.match(/^[a-zA-Z0-9]+$/);
    if(result==null) return false;
    return true;
}

// Function Name: isValidString
// Function Description: 判断输入是否是一个由 0-9 / A-Z / a-z / . / _ 组成的字符串
// Creation Date: 2004-7-13 10:20
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidString(str){
    var result=str.match(/^[a-zA-Z0-9\s.\-_]+$/);
    if(result==null) return false;
    return true;
}

// Function Name: isValidPostalcode
// Function Description: 判断输入是否是一个有效的邮政编码
// Creation Date: 2004-7-13 10:22
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidPostalcode(str){
    var result=str.match(/(^[0-9]{6}$)/);
    if(result==null) return false;
    return true;
}

// Function Name: isValidPhoneNo
// Function Description: 判断输入是否是一个有效的电话号码
// Creation Date: 2004-7-13 10:22
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidPhoneNo(str){
    var result=str.match(/(^[0-9]{3,4}\-[0-9]{3,8}$)|(^[0-9]{3,8}$)|(^\([0-9]{3,4}\)[0-9]{3,8}$)/);
    if(result==null) return false;
    return true;
}

// Function Name: isValidMobileNo
// Function Description: 判断输入是否是一个有效的手机号码
// Creation Date: 2004-7-13 10:23
// Last Modify By: N/A
// Last Modify Date: N/A
function isValidMobileNo(str){
    var result=str.match(/(^0{0,1}13[0-9]{9}$)/);
    if(result==null) return false;
    return true;
}
//校验输入是否是电话号码正确！
function isTel(telStr){
    var No="0123456789()+-";
    if(telStr.length==0){
        return false;
    }

    for(i=0;i<telStr.length;i++){
        var Checkstr=telStr.charAt(i);
        if(No.indexOf(Checkstr)==-1){
            return false;
        }
    }
    return true;
}
  //----------------------------------------------------除S以外的字符
function isCharsInBagEx (s, bag)
{
    var i,c;
    for (i = 0; i < s.length; i++)
    {
        c = s.charAt(i);
        if (bag.indexOf(c) > -1)  return c;
    }
    return "";
}
function isHtmlNull(str) {
	if (str == null || str == 'null') {
		return '&nbsp;';
	}
	else {
		return str;
	}
}