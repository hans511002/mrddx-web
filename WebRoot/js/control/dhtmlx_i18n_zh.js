/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *      dhtmlx_i18n_zh.js
 *Description：
 *      dhtmlx中文显示信息。
 *Dependent：
 *       dhtmlx.js
 *Author:
 *        张伟
 *Finished：
 *       2011-09-11-9-14
 *Modified By：
 *
 * Modified Date:
 *
 * Modified Reasons:

 ********************************************************/

/**
 * 分页中文设置
 * @param pageSize
 */
dhtmlXGridObject.prototype.i18n.paging = {
    results : "结果集",
    records : "当前第 ",
    to : " 到 ",
    page : " 页",
    perpage : "当前第 ",
    first : "第一页",
    previous : "前一页",
    found : "已找到记录",
    next : "下一页",
    last : "末页",
    of : " 共有 ",
    notfound : "查询无结果",
    jump : "跳转到",
    item:"条",
    showPage:"每页显示",
    total:"总记录数"
};

/**
 * 定义验证失败的提示信息
 */
dhtmlxValidation.validateErrorMag = {
    isEmpty : "不能输入任何值！",
    isNotEmpty : "此项为必填！",
    isValidBoolean : "此项只能为布尔值",
    isValidEmail : "请输入正确的Email",
    isValidInteger : "请输入整数",
    isValidNumeric : "请输入数字",
    isValidAplhaNumeric : "只能输入字母和数字",
    isValidDatetime : "只能输入格式为YYYY-MM-DD HH-MI-SS的日期时间",
    isValidDate : "只能输入日期格式为YYYY-MM-DD的日期",
    isValidTime : "只能输入格式为HH-MI-SS的时间",
    isValidIPv4 : "请输入正确的IP地址",
    isMin : "输入的最小值为{0}",
    isMax : "输入的最大值为{0}",
    isRange : "输入的值只能介于{0}到{1}之间",
    isMinLength : "输入的最小长度值为{0}",
    isMaxLength : "输入的最大长度值为{0}",
    isEqualTo : "请再次输入相同的值",
    isChinese : "只能输入中文",
    isPositiveInt : "只能输入正整数",
    isAlpha : "只能输入字母",
    isZip : "不是正确的邮政编码",
    isMobile : "不是正确的电话号码",
    isIllegalChar : "只能输入数字、字母或汉字",
    isAsic : "不能输入汉字"
};

/**
 * 定义dhtmlxCalendar组件的中文格式，使用方法为：carlendarName.loadloadUserLanguage('zh')
 */
dhtmlXCalendarObject.prototype.langData["zh"] = {
    dateformat : '%Y%m%d',//2011-08
    monthesFNames : [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月",
        "十月", "十一月", "十二月" ],
    monthesSNames : [ "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一",
        "十二" ],
    daysFNames : [ "星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六" ],
    daysSNames : [ "日", "一", "二", "三", "四", "五", "六" ],
    weekstart : 7
}