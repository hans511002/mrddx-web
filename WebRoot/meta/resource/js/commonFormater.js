/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        commonFormater.js
 *Description：
 *        此JS用于公共的数据显示转义函数
 *Dependent：
 *        Dwr 的JS文件，如util.js和engine.js 以及dhmtlx.js
 *Author:
 *        张伟
 *Finished：
 *       2011-09-18
 *Modified By：
 *
 * Modified Date:
 *
 * Modified Reasons:

 ********************************************************/

/**
 * 是或否
 * @param value
 */
var yesOrNo=function(value){
    return parseInt(value)==0?"否"
        :(parseInt(value)==1?"是":value);
}

/**
 * 有效或无效
 * @param value
 */
var validOrNot=function(value){
    return parseInt(value)==0?"无效"
        :(parseInt(value)==1?"有效":value);
}

/**
 * 用户状态
 * @param value
 */
var userState=function(value){
    if(parseInt(value)==0){
        return "禁用";
    }else if(parseInt(value)==1){
        return "有效";
    }else if(parseInt(value)==2){
        return "待审核";
    }else if(parseInt(value)==3){
        return "锁定";
    }else{
        return value;
    }
}

/**
 * 有或无
 * @param value
 */
var haveOrNot=function(value){
    return parseInt(value)==0?"无"
        :(parseInt(value)==1?"有":value);
}

/**
 * 用户对表关系类型
 * @param value
 */
var relType = function(value){
    if(parseInt(value)==0){
        return "申请";
    }else if(parseInt(value)==1){
        return "建立";
    }else if(parseInt(value)==2){
        return "修改";
    }else if(parseInt(value)==3){
        return "维护";
    }else if(parseInt(value)==4){
        return "审核通过";
    }else if(parseInt(value)==5){
        return "审核不通过";
    }else{
        return value;
    }
}
/**
 * 表状态
 * @param value
 */
var tableState = function(value){
    if(parseInt(value)==0){
        return "无效";
    }else if(parseInt(value)==1){
        return "有效";
    }else if(parseInt(value)==2){
        return "修改状态"
    }else{
        return value;
    }
}

/**
 * 表分区状态
 * @param {Object} value
 * @return {TypeName} 
 */
var tablePartState = function(value){
    if(parseInt(value)==0){
        return "未完成";
    }else if(parseInt(value)==1){
        return "已完成";
    }else{
        return value;
    }
}
/**
 *审核状态
 */
var auditState = function(value){
    if(parseInt(value)==1){
        return "已审核";
    }else if(parseInt(value)==0){
        return "待审核";
    }else{
        return value;
    }
}

/**
 * 信息推送状态
 * @param value
 */
var pushState = function(value){
    if(parseInt(value)==0){
        return "建立";
    }else if(parseInt(value)==1){
        return "已处理";
    }else if(parseInt(value)==2){
        return "已审核";
    }else{
        return value;
    }
}

/**
 * 数据源状态
 * @param value
 */
var dataSourceOnlineOrNot = function(value){
    if(parseInt(value)==1){
        return "已启用";
    }else if(parseInt(value)==0){
        return "已停用";
    }else{
        return value;
    }
};

/**
 * 数据源类型为文件或者数据库
 * @param value
 */
var dataSourceTableOrFile = function(value){
    if(value=="TABLE"){
        return "数据库";
    }else{
        if(value && value.indexOf("TXT")>0){
            return "TXT文件";
        }else if(value && value.indexOf("DMP")>0){
            return "DMP文件"
        }else{
            return "文件";
        }
    }
};