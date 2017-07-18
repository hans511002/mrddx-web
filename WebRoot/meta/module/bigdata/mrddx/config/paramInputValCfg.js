/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        公共JS：paramInputValCfg.js
 *Description：
 *        参数值输入辅助处理配置
 *Dependent：
 *
 *Author:
 *       wangcs
 ********************************************************/


/**
 * 将一个字符串转换成二维数据表格展示（内部先将字符串转换为二维数组）
 * @param str 字符串
 * @param cols 表格列头数据
 * @return 表格HTML代码
 */
function ParamConvertArrToHTML(str,cols){
    var arr = this.convertFun(str,"str",this.convertCfg);
    if(arr.sort){
        cols = cols || this.cfg["columns"];
        var htmlArr  = ["<table>"];
        htmlArr.push("<tr>");
        htmlArr.push("<td class='snn' style='background-color:#bdb76b;'>No.</td>");
        if(cols && cols.length){
            for(var i=0;i<cols.length;i++){
                htmlArr.push("<td class='tt'>"+cols[i]+"</td>");
            }
        }else{
            htmlArr.push("<td class='tt'>行头</td>");
        }
        htmlArr.push("</tr>");
        var cl = (cols && cols.length) ? cols.length : 1;
        for(var i=0;i<arr.length;i++){
            htmlArr.push("<tr>");
            htmlArr.push("<td class='snn'>"+(i+1)+"</td>");
            if(typeof(arr[i])=="string" && cl==1){
                htmlArr.push("<td class='ct'>"+arr[i]+"</td>");
            }else if(arr[i].sort && arr[i].length<=cl){
                for(var j=0;j<arr[i].length;j++){
                    htmlArr.push("<td class='ct'>"+(arr[i][j]!=""?arr[i][j]:"&nbsp;")+"</td>");
                }
                if(arr[i].length!=cl){
                    for(var x=0;x<cl-arr[i].length;x++){
                        htmlArr.push("<td class='ct'>&nbsp;</td>");
                    }
                }
            }else{
                htmlArr.push("<td class='ct' colspan='100%'>错误数据:<span style='color:red'>"+arr[i]+"</span></td>");
            }
            htmlArr.push("</tr>");
        }
        htmlArr.push("</table>");
        return htmlArr.join("");
    }else{
        return arr || "";
    }
}

/****========分割线=========****/
/**
 * 默认简单实现
 * 数组转字符=====一维数组：直接[,]连接=====二维数组：内部每个子数组先[:]连接，最后再[,]连接
 * 字符转数组=====先按[,]拆分，对拆分的数据再[:]拆分(如果能拆形成二维数组，否则形成一维数组)
 *                 ——其中[,]和[:]为行连接符和列连接符，可通过convertCfg配置
 * 能识别：【列簇1:列1,列簇1:列2,列簇2:列3……】 和【a,b,c,d……】 格式数据互转
 * @param data 数据
 * @param mode 转换模式 arr:将数组转换成字符串。str:将字符串转换为数组 (内部实现必须是一套规则)，默认为arr
 * @param convertCfg 转换参数配置
 */
function _ParamConvertFunDefImpl(data,mode,convertCfg){
    convertCfg = convertCfg||{};
    mode = mode || "arr";
    var ret = null;
    var ignoreEndNvl = convertCfg["ignoreEndColNullVal"] || false;
    var eachKh = convertCfg["eachItemAppendKh"] || 0;
    var rowCh = convertCfg["connectRowCh"]||",";//行连接符
    var colCh = convertCfg["connectColCh"]||":";//列连接符
    var arrDim = convertCfg["arrDim"] || 2;//数组维度
    switch (mode){
        case "arr":
            var x = [];
            for(var i=0;i<data.length;i++){
                var d = data[i];
                if(arrDim==2){
                    if(ignoreEndNvl && d[d.length-1]==""){
                        d.pop();
                    }
                    switch (eachKh){
                        case 1:
                            x[i] = "("+d.join(colCh)+")";
                            break;
                        case 2:
                            x[i] = "["+d.join(colCh)+"]";
                            break;
                        case 3:
                            x[i] = "{"+d.join(colCh)+"}";
                            break;
                        default:
                            x[i] = d.join(colCh);
                    }
                }else{
                    if(ignoreEndNvl && d[0]=="" && i==data.length-1){
                        break;
                    }switch (eachKh){
                        case 1:
                            x[i] = "("+d[0]+")";
                            break;
                        case 2:
                            x[i] = "["+d[0]+"]";
                            break;
                        case 3:
                            x[i] = "{"+d[0]+"}";
                            break;
                        default:
                            x[i] = d[0];
                    }
                }
            }
            ret = x.join(rowCh);
            break;
        case "str":
            ret = [];
            if(data){
                var a = data.split(rowCh);
                for(var i=0;i<a.length;i++){
                    if(arrDim==2){
                        var x = null;
                        if(eachKh){
                            x = a[i].substring(1,a[i].length-1).split(colCh)
                        }else{
                            x = a[i].split(colCh);
                        }
                        ret.push(x);
                    }else{
                        ret.push(a[i]);
                    }
                }
            }
            break;
    }
    return ret;
}

//【[a:b:[x,y,z]]-[列簇:列:[x1,y1,z1]]……】 格式数据互转
function _ColCuColNameSpiltFun(data,mode,convertCfg){
    mode = mode || "arr";
    var ret = null;
    switch (mode){
        case "arr":
            ret = "";
            if(data.sort && data.length){
                var colF = {};
                //数组分组合并
                for(var i=0;i<data.length;i++){
                    var a = data[i][0];
                    var b = data[i][1];
                    var c = data[i][2];
                    colF[a+":"+b] = colF[a+":"+b] || [];
                    colF[a+":"+b].push(c);
                }
                for(var k in colF){
                    ret += "["+k+":["+colF[k].join(",")+"]]-"
                }
                ret = ret.substring(0,ret.length-1);
            }
            break;
        case "str":
            ret = [];
            var x = data.split("-");
            var dataMap = {};
            for(var i=0;i<x.length;i++){
                if(x[i]){
                    var sar = x[i].substring(1,x[i].length-1).split(":");
                    var ssar = sar[2].substring(1,sar[2].length-1).split(",");
                    dataMap[sar[0]] = dataMap[sar[0]] || {};
                    dataMap[sar[0]][sar[1]] = dataMap[sar[0]][sar[1]] || [];
                    for(var j=0;j<ssar.length;j++){
                        dataMap[sar[0]][sar[1]].push(ssar[j]);
                    }
                }
            }
            for(var k in dataMap){
                for(var k1 in dataMap[k]){
                    for(var i=0;i<dataMap[k][k1].length ;i++){
                        ret.push([k,k1,dataMap[k][k1][i]]);
                    }
                }
            }
            break;
    }
    return ret;
}

/****========分割线=========****/
/**
 * 参数录入值个性化处理
 * 某个参数key在里面存在，则说明此参数选值需要特殊处理
 */
var ParamInputValCfg = {
    /**
     * 各配置key含义
     * @type 类型，rich弹出富文本，pop弹出选择
     * @cfg 配置map，弹出对象内部数据需要的扩展辅助参数
     * @tip 弹出窗提示信息
     * @convertCfg 转换规则参数配置 ——此配置参数只为默认转换使用。其他个性的自己实现
     *      arrDim：数组数据维度，默认2表示表格，为1时标示一维列表（展示为一个一列的表格）
     *      ignoreEndColNullVal：默认false,忽略末列空值，即当在数组转字符时，如果末列为空，则忽略此单元格，再看倒数第二列……
     *                          默认情况下，拼接的串可能是【a:b:c,a1:b1:c1,a2:b2:】  ——第三条数据末列为空
     *                          当为true时，则为【a:b:c,a1:b1:c1,a2:b2】
     *      eachItemAppendKh：外层为每个项用连接符号连接时是否为每个项加括号，如【a,b,c】变为【(a),(b),(c)】
     *                        设为1时，加小括号()
     *                        设为2时，加中括号[]
     *                        设为3时，加大括号{}
     *       connectRowCh：行数据连接符，默认为逗号【,】
     *       connectColCh：列数据连接符，默认为冒号【:】
     * @convertToHTMLFun 将文本框的值转换为富文本html表格展示（内部会先调用convertFun转换成数组，真正的实现是将数组展示为表格）
     * @convertFun 数据转换函数，将富文本返回的表格类二维数组数据与某种特殊规则文本（带各种分割符之类的）相互转换
     * @desc 描述信息版主其他使用者查看
     */

    //HBASE输入表名,需要弹出选择
    "input.mr.maperd.hbase.table":{
        type:"pop",
        cfg:{
            COL_MAP:{
                HB_TABLE_ID:"表ID",
                HB_TABLE_NAME:"表名",
                HB_TABLE_MSG:"表描述",
                HB_DS:"Hbase数据源"
            },
            COL_VAL_KEY:",VAL,VAL_NAME,HB_TABLE_MSG,DATA_SOURCE_NAME",
            QUERY_SQL:"SELECT HB_TABLE_ID VAL,HB_TABLE_NAME VAL_NAME,HB_TABLE_MSG,A.DATA_SOURCE_ID,B.DATA_SOURCE_NAME " +
                "FROM HB_TABLE_INFO A,HB_DATA_SOURCE B WHERE A.DATA_SOURCE_ID=B.DATA_SOURCE_ID AND A.HB_STATUS=0",
            COL_WIDTH:"6,10,28,28,28"
        },
        inpAval:true, //输入框可继续输入
        title:"Hbase表选择"
    },

     //HBASE输出表名,需要弹出选择
    "output.mr.maperd.hbase.table":{
        type:"pop",
        cfg:{
            COL_MAP:{
                HB_TABLE_ID:"表ID",
                HB_TABLE_NAME:"表名",
                HB_TABLE_MSG:"表描述",
                HB_DS:"Hbase数据源"
            },
            COL_VAL_KEY:",VAL,VAL_NAME,HB_TABLE_MSG,DATA_SOURCE_NAME",
            QUERY_SQL:"SELECT HB_TABLE_ID VAL,HB_TABLE_NAME VAL_NAME,HB_TABLE_MSG,A.DATA_SOURCE_ID,B.DATA_SOURCE_NAME " +
                "FROM HB_TABLE_INFO A,HB_DATA_SOURCE B WHERE A.DATA_SOURCE_ID=B.DATA_SOURCE_ID AND A.HB_STATUS=0",
            COL_WIDTH:"6,10,28,28,28"
        },
        inpAval:true,
        title:"Hbase表选择"
    },

    //查询条件：FILTER,格式：filter类型:filter参数, limit:1000,...;其中filterType为filter类型，必须在开头,后面是filter的参数
    "input.mr.maperd.hbase.table.query.filter.bak":{
        type:"rich",
        cfg:{columns:["filter类型","参数值"]},
        title:"查询条件",
        tip:"提示:1,可从Excel复制带filter类型，参数的表格" +
            "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2,直接输入【filter类型:filter参数, limit:1000,……】(优先识别表格)",
        convertHTMLFun:ParamConvertArrToHTML,
        convertFun:_ParamConvertFunDefImpl
    },

    //输入字段拆分关系，列簇:列名称:[a:b:[x,y,z]]-[列簇:列名称:[x1,y1,z1]]-……
    "input.mr.maperd.hbase.column.relation":{
        type:"rich",
        cfg:{columns:["列簇(分类)","列名","字段"]},
        title:"输入字段拆分关系录入",
        tip:"提示:1,可从Excel复制带列簇、列名、字段名的表格，相同列簇和列名可根据关系合并" +
            "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2,直接输入【[a:b:[x,y,z]]-[列簇:列:[x1,y1,z1]]……】(优先识别表格)",
        convertHTMLFun:ParamConvertArrToHTML,
        convertFun:_ColCuColNameSpiltFun
    },

    //输出字段拆分字段关系，列簇:列名称:[a:b:[x,y,z]]-[列簇:列名称:[x1,y1,z1]]-……
    "output.mr.maperd.hbase.column.relation":{
        type:"rich",
        cfg:{columns:["列簇(分类)","列名","字段"]},
        title:"输出字段拆分关系录入",
        tip:"提示:1,可从Excel复制带列簇、列名、字段名的表格，相同列簇和列名可根据关系合并" +
            "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2,直接输入【[a:b:[x,y,z]]-[列簇:列:[x1,y1,z1]]……】(优先识别表格)",
        convertHTMLFun:ParamConvertArrToHTML,
        convertFun:_ColCuColNameSpiltFun
    },

    //列簇名:列名，注意列名称需与输入字段一致
    "output.mr.maperd.hbase.table.columnfamily.rels":{
        type:"rich",
        cfg:{columns:["列簇(分类)","列名"]},
        title:"列与列簇对应关系录入",
        tip:"提示:1,可从Excel复制带列簇、列名的表格，相同列簇可根据关系合并" +
            "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2,直接输入【列簇1:列1,列簇1:列2,列簇2:列3……】(优先识别表格)",
        convertHTMLFun:ParamConvertArrToHTML,
        convertFun:_ParamConvertFunDefImpl
    },

    //输入字段(多个按逗号(,)分隔)
    "input.sys.mr.mapred.field.names":{
        type:"rich",
        cfg:{columns:["输入字段别名"]},
        title:"输入字段列表",
        tip:"提示:1,可从Excel复制输入字段列表数据" +
            "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2,也可直接按规则输入，多个字段用[,]分割（优先识别表格）",
        convertCfg:{arrDim:1},
        convertHTMLFun:ParamConvertArrToHTML,
        convertFun:_ParamConvertFunDefImpl
    },

    //输出字段(多个按逗号(,)分隔)
    "output.sys.mr.mapred.field.names":{
        type:"rich",
        cfg:{columns:["输出字段别名"]},
        title:"输出字段列表",
        tip:"提示:1,可从Excel复制输出字段列表数据" +
            "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2,也可直接按规则输入，多个字段用[,]分割(优先识别表格)",
        convertCfg:{arrDim:1},
        convertHTMLFun:ParamConvertArrToHTML,
        convertFun:_ParamConvertFunDefImpl
    },

    //输出字段计算关系
    "output.sys.mr.mapred.group.field.method.rel":{
        type:"rich",
        cfg:{columns:["输出字段别名","输入字段别名","统计方法"]},
        title:"输出输入字段关系及计算方法",
        tip:"提示:1,可从Excel复制输出字段与统计方法对应关系表格数据" +
            "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2,也可直接按规则输入【输出字段:输入字段:方法,o1:i1:SUM,……】(优先识别表格)",
        convertCfg:{ignoreEndColNullVal:true},
        convertHTMLFun:ParamConvertArrToHTML,
        convertFun:_ParamConvertFunDefImpl
    },

    //输出字段的默认值,例如：[a:defvaluea],[b:defvalueb]
    "output.sys.mr.maperd.outcolumn.default.value":{
        type:"rich",
        cfg:{columns:["输出字段别名","输出默认值"]},
        title:"输出字段默认值设置",
        tip:"提示:1,可从Excel复制输出字段默认值数据" +
            "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2,也可按规则输入【[输出字段:默认值],[a:1],[b,2],……】(优先识别表格)",
        convertCfg:{eachItemAppendKh:2},
        convertHTMLFun:ParamConvertArrToHTML,
        convertFun:_ParamConvertFunDefImpl
    }
};

//存快捷录入对象,避免重复创建
var ParamDealObjMap = {};

/**
 * 调用此方法后，将自动为一个参数值输入框 实现快捷选取值的一系列方法
 * @param id input框id，
 * @param key 用到的参数名key。固定的必须【ParamInputValCfg】里存在，否则快捷选取找不到实现
 * @param selectValCall 选择值回调
 */
function createParamDealObj(id,key,selectValCall){
    if(!ParamInputValCfg[key]){
        return null;
    }
    if(!ParamDealObjMap[id]){
        switch (ParamInputValCfg[key].type){
            case "rich":
                var cfg = ParamInputValCfg[key]["cfg"]||{};
                if(cfg["columns"]){
                    cfg["startR"] = 2;
                    cfg["startC"] = 2;
                }
                ParamDealObjMap[id] = new meta.ui.ShortcutInput();
                ParamDealObjMap[id].setDataRule(cfg);
                ParamDealObjMap[id].setTipInfo(ParamInputValCfg[key]["tip"]);
                if(selectValCall){
                    ParamDealObjMap[id].__selectValCall = selectValCall;
                }
                ParamDealObjMap[id].setOkCall(function(ipt){
                    var d = ipt.data;
                    if(typeof(d)=="object"){
                        d = ParamInputValCfg[key]["convertFun"](d,"arr",ParamInputValCfg[key]["convertCfg"]||{});
                    }
                    d = d.replace(/\s/ig,"");
                    $(id).value = d;
                    if(ipt.__selectValCall){
                        ipt.__selectValCall(d);
                    }
                });
                break;
            case "pop":
                ParamDealObjMap[id] = new meta.ui.PopSelectWin();
                ParamDealObjMap[id].setDataTableCfg(ParamInputValCfg[key]["cfg"]);
                if(selectValCall){
                    ParamDealObjMap[id].__selectValCall = selectValCall;
                }
                ParamDealObjMap[id].setOkCall(function(ipt){
                    var d = ipt.data;
                    var str = "";
                    var idK = "";
                    for(var k in d){
                        str += d[k]["VAL_NAME"]+",";
                        idK += k + ",";
                    }
                    if(str){
                        str = str.substring(0,str.length-1);
                        idK = idK.substring(0,idK.length-1);
                    }
                    $(id).value = str;
                    $(id).hiddenValue = idK;
                    if(ipt.__selectValCall){
                        ipt.__selectValCall(d);
                    }
                });
                break;
        }
    }
    if(!ParamInputValCfg[key].inpAval)
        $(id).readOnly = true;
    var clikf = (function(e){
        if(ParamDealObjMap[id]){
            switch (ParamInputValCfg[key].type){
                case "rich":
                    ParamDealObjMap[id].show(ParamInputValCfg[key]["title"]);
                    var val = ParamInputValCfg[key]["convertHTMLFun"]($(id).value.trim());
                    ParamDealObjMap[id].parseData(val,1);
                    break;
                case "pop":
                    e = e || window.event;
                    if(e.srcElement && e.srcElement.tagName=="INPUT" && ParamInputValCfg[key].inpAval){
                        return;
                    }
                    var v = $(id).hiddenValue;
                    ParamDealObjMap[id].setCheckedValue(v);
                    ParamDealObjMap[id].show(ParamInputValCfg[key]["title"]);
                    break;
            }
        }else{
            dhx.alert("未能找到参数名【"+key+"】的快捷选入实现!");
        }
    });
    attachObjEvent($(id),"onclick",clikf);
    $(id).clikf = clikf;

    return ParamDealObjMap[id];
}

//清除对象
function ClearParamDealObjMap(){
    for(var k in ParamDealObjMap){
        var inp = $(k);
        if(inp){
            detachObjEvent(inp,"onclick",inp.clikf);
        }
        ParamDealObjMap[k].destructor();
        ParamDealObjMap[k] = null;
        delete ParamDealObjMap[k];
    }
}
