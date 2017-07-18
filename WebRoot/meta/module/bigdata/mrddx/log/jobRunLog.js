/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        JobLogAction.js
 *Description：
 *
 *Dependent：
 *
 *Author:	王建友
 *        
 ********************************************************/
var dataTable = null;//表格

//初始界面
function pageInit() {
    var termReq = TermReqFactory.createTermReq(1);
    
    var jobName = termReq.createTermControl("jobName","JOB_NAME");
    jobName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });

    var startdate = termReq.createTermControl("startDate","START_DATE");
    startdate.setWidth(120);
    startdate.setDateRule();

    startdate.render();
    startdate.myCalendar.setDateFormat("%Y-%m-%d");
    startdate.myCalendar.hideTime();

    
//    var enddate = termReq.createTermControl("endDate","END_DATE");
//    enddate.setWidth(120);
//    enddate.setDateRule();
//    enddate.render();
//    enddate.myCalendar.setDateFormat("%Y-%m-%d");
//    enddate.myCalendar.hideTime();
    
//    startdate.myCalendar.attachEvent("onClick",function(){
//        enddate.myCalendar.setSensitiveRange(document.getElementById("startDate").value,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
//    });
//    enddate.myCalendar.attachEvent("onClick",function(){
//        startdate.myCalendar.setSensitiveRange(null,document.getElementById("endDate").value);
//    });
    var reset1Btn = document.getElementById("reset1");
    attachObjEvent(reset1Btn,"onclick",function(){
        termReq.getTermControl("START_DATE").clearValue(true);
//        var now = new Date();
//        if(document.getElementById("endDate").value)
//            startdate.myCalendar.setSensitiveRange(null,document.getElementById("endDate").value);
//        else
//            startdate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
//        enddate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        termReq.getTermControl("START_DATE").inited = 1;
    });
    dataTableInit(); //初始数据表格  初始之后dataTable才会被实例化
    dataTable.setReFreshCall(queryData); //设置表格刷新的回调方法，即实际查询数据的方法
    
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });

//    var reset1Btn = document.getElementById("reset1");
//    attachObjEvent(reset1Btn,"onclick",function(){
//        termReq.getTermControl("START_DATE").clearValue(true);
//        var now = new Date();
//        if(document.getElementById("endDate").value)
//            startdate.myCalendar.setSensitiveRange(null,document.getElementById("endDate").value);
//        else
//            startdate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
//        enddate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
//        termReq.getTermControl("START_DATE").inited = 1;
//    });
//    var reset2Btn = document.getElementById("reset2");
//    attachObjEvent(reset2Btn,"onclick",function(){
//        termReq.getTermControl("END_DATE").clearValue(true);
//        var now = new Date();
//        if(document.getElementById("startDate").value)
//            enddate.myCalendar.setSensitiveRange(document.getElementById("startDate").value,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
//        else
//            enddate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
//        startdate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
//        termReq.getTermControl("END_DATE").inited = 1;
//    });
}


//初始数据表格
function dataTableInit(){
    var dd = document.getElementById("dataDiv");
    var pageContent = document.getElementById("pageContent");
    var queryFormDIV = document.getElementById("queryFormDIV");
    queryFormDIV.style.width = pageContent.offsetWidth -30  + "px";
    dd.style.width = pageContent.offsetWidth  + "px";
    dd.style.height = pageContent.offsetHeight-queryFormDIV.offsetHeight - 18 + "px";
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
        JOB_NAME:"Job名称",    	
        JOB_ID:"JobID",
        //LOG_ID:"LogID",
        MONTH_NO:"执行月份",
        DATA_NO:"执行日期",
        START_DATE:"开始时间",
        END_DATE:"结束时间",
        RUN_FLAG_NAME:"运行状态",
		ROW_RECORD:"结果行记录数",
        ALL_FILE_SIZE:"文件大小(M)",
        EXEC_CMD:"执行命令",
        LOG_MSG:"日志信息",
        MAPRATE:"Map成功率",
        REDUCERATE:"Reduce成功率",
        opt:"操作"
    },"JOB_NAME,JOB_ID,MONTH_NO,DATA_NO,START_DATE,END_DATE,RUN_FLAG_NAME,ROW_RECORD,ALL_FILE_SIZE,EXEC_CMD,LOG_MSG,MAPRATE,REDUCERATE,RUN_FLAG");
    dataTable.setPaging(true,20);//分页
    dataTable.setSorting(true,{
        JOB_ID:"desc"
    });
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("8,8,8,8,10,10,8,10,10,8,8,10,10,25");
    dataTable.setGridColumnCfg(0,{align:"left"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    dataTable.setGridColumnCfg(5,{align:"center"});
    dataTable.setGridColumnCfg(6,{align:"center"});
    dataTable.setGridColumnCfg(6,{align:"center"});
    dataTable.setGridColumnCfg(7,{align:"center"});
    dataTable.setGridColumnCfg(8,{align:"center"});    
    dataTable.setGridColumnCfg(9,{align:"center"});
    dataTable.setGridColumnCfg(10,{align:"center"});
    dataTable.setGridColumnCfg(11,{align:"center"});
    dataTable.setGridColumnCfg(12,{align:"center"});
    dataTable.setGridColumnCfg(13,{align:"center"});
//  dataTable.setGridColumnCfg(14,{align:"center"});
    
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
//    	alert("rid:"+rid+"-cid:"+cid);
        if(colId=="OPT"){
            var jobId = dataTable.getUserData(rid,"JOB_ID");
            var jobName = dataTable.getUserData(rid,"JOB_NAME");
            var logId = dataTable.getUserData(rid,"LOG_ID");
            var date = dataTable.getUserData(rid,"DATA_NO");
            
            
            var str = "";
            //操作
            str += "<a href='javascript:void(0)' onclick='OpenWin(1,"+logId+");return false;'>Map日志</a>";
            str += "&nbsp;&nbsp;<a href='javascript:void(0)' onclick='OpenWin(2,"+logId+");return false;'>Reduce日志</a>";
            str += "&nbsp;&nbsp;<a href='javascript:void(0)' onclick='OpenWin(3,"+logId+");return false;'>Job详细日志</a>";
            str += "&nbsp;&nbsp;<a href='javascript:void(0)' onclick='LoadLog(\""+logId+"\",\""+jobName+"\",\""+date+"\");return false;'>下载日志</a>";
            return str;
        }else if(colId =="MAPRATE"){
        	var mapRate = dataTable.getUserData(rid,"MAPRATE");
			if(mapRate=="%"){
				return mapRate='0.00%';
			}
        }else if(colId == "REDUCERATE"){
        	var reduceRate = dataTable.getUserData(rid,"REDUCERATE");
			if(reduceRate=="%"){
				return reduceRate='0.00%';
			}
        }
        return data[cid];
    });

    return dataTable;
}

//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    var runFlag = document.getElementById("runFlag").value;    
    termVals.runFlag = runFlag;
    
    termVals["_COLUMN_SORT"] = params.sort;
    dhx.showProgress("请求数据中");
    JobLogAction.queryJobLog(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法 
    });
}

function OpenWin(a,b){
	if(a==1){
		parent.openMenu("查看Map日志","/meta/module/bigdata/mrddx/log/map/jobMapLog.jsp?logId="+b,"top","mapId="+b);
	}else if(a==2){
		parent.openMenu("查看Reduce日志","/meta/module/bigdata/mrddx/log/reduce/jobReduceLog.jsp?logId="+b,"top","reduceId="+b);
	}else{
		parent.openMenu("查看Job详细日志","/meta/module/bigdata/mrddx/log/jobRunMsgLog.jsp?logId="+b,"top","jobLog="+b);
	}
}

function LoadLog(logId,jobName,date){
	
//	if(typeof logId === 'number' && isFinite(logId)){
//		alert(typeof(logId)+"---"+typeof(date));
//		return;
//	}
	dhx.showProgress("请求数据中");
    JobLogAction.writeLogFile(logId,date,function(rs){
        dhx.closeProgress();
        if(rs){
        	location.href = 'downLoadLog.jsp?logId='+logId+"&jobName="+jobName+"&date="+date;
        	dhx.closeProgress();
//			dhx.alert("成功下载【"+jobName+"】日志!");
        }else{
            dhx.alert("下载失败！");
        }
    });
}

dhx.ready(pageInit);
