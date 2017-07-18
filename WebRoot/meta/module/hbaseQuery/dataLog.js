/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        dataLog.js
 *Description：
 *        查询数据源
 *Dependent：
 *
 *Author: 王鹏坤
 *
 ********************************************************/
var dataTable = null;   //数据日志信息
var maintainWin = null;//维护分类窗体（查看）

/**
 * 页面初始化
 */
function pageInit(){
    var termReq = TermReqFactory.createTermReq(1);

  /*  var dataId = termReq.createTermControl("userId","USER_ID");
    dataId.setListRule(0,[[0,"成功"],[1,"失败"]],1);
    dataId.setWidth(120);
    dataId.enableReadonly(true);  */

    var dataId = document.getElementById("userId");
    HBaseDataSourceAction.queryUser(function(data){
        if (data) {
            dataId.options[0] = new Option("全部","");
            for(var m=0;m<data.length;m++){
                dataId.options[m+1] = new Option(data[m].USER_NAME,data[m].USER_ID);
            }
        }
    });

    var dataName = termReq.createTermControl("ruleName","RULE_NAME");
    dataName.setWidth(120);
    dataName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });


    var dataStatus = termReq.createTermControl("state","STATE");
    dataStatus.setListRule(0,[[0,"成功"],[1,"失败"]],0);
    dataStatus.setWidth(120);
    dataStatus.enableReadonly(true);

    var now = new Date();
    var startdate = termReq.createTermControl("startDate","START_DATE");
    startdate.setWidth(120);
    startdate.setDateRule();
    startdate.render();
    startdate.myCalendar.setDateFormat("%Y-%m-%d");
    startdate.myCalendar.hideTime();

    var enddate = termReq.createTermControl("endDate","END_DATE");
    enddate.setWidth(120);
    enddate.setDateRule();
    enddate.render();
    enddate.myCalendar.setDateFormat("%Y-%m-%d");
    enddate.myCalendar.hideTime();
	
    startdate.myCalendar.attachEvent("onClick",function(){
        enddate.myCalendar.setSensitiveRange(document.getElementById("startDate").value,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
    });
    enddate.myCalendar.attachEvent("onClick",function(){
        startdate.myCalendar.setSensitiveRange(null,document.getElementById("endDate").value);
    });

    dataTableInit();
    dataTable.setPaging(true, 20);//分页
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("10,10,10,15,10,10,10,10,10,8,7");
    dataTable.setReFreshCall(queryData);
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        var now = new Date();
        termReq.getTermControl("START_DATE").myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        termReq.getTermControl("END_DATE").myCalendar.setSensitiveRange(preWeekDay(),now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        $("startDate").value = preWeekDay();
        $("endDate").value = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    var reset1Btn = document.getElementById("reset1");
    attachObjEvent(reset1Btn,"onclick",function(){
        termReq.getTermControl("START_DATE").clearValue(true);
        var now = new Date();
        if(document.getElementById("endDate").value)
            startdate.myCalendar.setSensitiveRange(null,document.getElementById("endDate").value);
        else
            startdate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        enddate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        termReq.getTermControl("START_DATE").inited = 1;
    });
    var reset2Btn = document.getElementById("reset2");
    attachObjEvent(reset2Btn,"onclick",function(){
        termReq.getTermControl("END_DATE").clearValue(true);
        var now = new Date();
        if(document.getElementById("startDate").value)
            enddate.myCalendar.setSensitiveRange(document.getElementById("startDate").value,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        else
            enddate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        startdate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        termReq.getTermControl("END_DATE").inited = 1;
    });

}


//初始数据表格
function dataTableInit(){
    dataTable = new meta.ui.DataTable("container");
    dataTable.setColumns({
        LOG_ID: "日志ID",
        USER_NAME : "用户名称",
        QRY_RULE_NAME: "查询规则名称",
        QRY_START_DATE: "查询时间",
        TOTAL_TIME: "响应耗时(ms)",
        QRY_TOTAL_TIME: "查询耗时(ms)",
        QRY_FILTER_TIME: "过滤耗时(ms)",
        QRY_PAGE_TIME: "分页耗时(ms)",
        QRY_FLAG: "查询结果状态",
        OPP: "操作"
    },"LOG_ID,USER_NAME,QRY_RULE_NAME,QRY_START_DATE,TOTAL_TIME,QRY_TOTAL_TIME,QRY_FILTER_TIME,QRY_PAGE_TIME,QRY_FLAG,OPP");

    dataTable.setFormatCellCall(function(rid, cid, data, colId){

        if(colId == "OPP"){
            return "<a href='javascript:void(0)' onclick='showDataLog(\""+rid+"\");return false;'>查看详情</a>&nbsp;&nbsp;&nbsp;&nbsp;";
        }else if(colId == "QRY_FLAG"){
            return data[cid] =="0"?"成功":"失败" ;
        }
        return data[cid];
    });
    return dataTable;
}

//查询数据
function queryData(dt,params){
    var termVals=TermReqFactory.getTermReq(1).getKeyValue();
    termVals["_COLUMN_SORT"] = params.sort;
    termVals["USER_ID"] = document.getElementById("userId").value;
    
    if(termVals["START_DATE"] == null || termVals["START_DATE"] == ""
    	|| termVals["END_DATE"] == null || termVals["END_DATE"] == ""){
    	dhx.alert("\"开始时间\" 和 \"结束时间\" 不能为空!");
    	return;
    }
    
    dhx.showProgress("请求数据中");
    HBaseDataSourceAction.queryDataLog(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

function showDataLog(rid){
    var title = "查看日志";
    var logId = dataTable.getUserData(rid,"LOG_ID");;
    var logMsg = dataTable.getUserData(rid,"LOG_MSG");;

    document.getElementById("logId").innerHTML = logId;
    document.getElementById("logMsg").value = logMsg;

    if(!maintainWin){
        maintainWin = DHTMLXFactory.createWindow("1","maintainWin",0,0,610,290);
        maintainWin.stick();
        maintainWin.denyResize();
        maintainWin.denyPark();
        maintainWin.button("minmax1").hide();
        maintainWin.button("park").hide();
        maintainWin.button("stick").hide();
        maintainWin.button("sticked").hide();
        maintainWin.center();

        var logFormDIV = document.getElementById("logFormDIV");
        maintainWin.attachObject(logFormDIV);
        var calBtn = document.getElementById("calBtn");
        attachObjEvent(calBtn,"onclick",function(){maintainWin.close();});
        maintainWin.attachEvent("onClose",function(){
            maintainWin.setModal(false);
            this.hide();
            return false;
        });

    }
    maintainWin.setText(title);
    maintainWin.setModal(true);
    maintainWin.show();
    maintainWin.center();
}

//得到本周第一天
function  preWeekDay(){
    var now = new Date();
	var start = new Date();
	start.setDate(now.getDate() - 7);//取得一周内的第一天、第二天、第三天...
	return start.getFullYear()+"-"+(start.getMonth()+1)+"-"+(start.getDate()<10?("0"+start.getDate()):start.getDate());
}








dhx.ready(pageInit);
