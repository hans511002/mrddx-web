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
    
    var logId = termReq.createTermControl("logId","LOG_ID");
    logId.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
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
        LOG_ID:"LogID",
        MAP_TASK_ID:"Map任务ID",
        MAP_INPUT_COUNT:"输入数据量",
        MAP_OUTPUT_COUNT:"输出数据量",
        START_DATE:"开始时间",
        END_DATE:"结束时间",
        RUN_FLAG_NAME:"结果标识符",
        LOG_MSG:"日志信息",
        opt:"操作"
    },"LOG_ID,MAP_TASK_ID,MAP_INPUT_COUNT,MAP_OUTPUT_COUNT,START_DATE,END_DATE,RUN_FLAG_NAME,LOG_MSG,RUN_FLAG");
//    dataTable.setRowIdForField("LOG_ID");
    dataTable.setPaging(true,20);//分页
    dataTable.setSorting(true,{
        LOG_ID:"asc"
    });
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("10,15,10,10,13,13,8,7,14");
    dataTable.setGridColumnCfg(0,{align:"center"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    dataTable.setGridColumnCfg(5,{align:"center"});
    dataTable.setGridColumnCfg(6,{align:"center"});
    dataTable.setGridColumnCfg(6,{align:"center"});
    dataTable.setGridColumnCfg(7,{align:"center"});
    dataTable.setGridColumnCfg(8,{align:"center"});    

    
    dataTable.setFormatCellCall(function(rid,cid,data,colId){

        if(colId=="OPT"){
            var mapTaskId = dataTable.getUserData(rid,"MAP_TASK_ID");
            
            var str = "";
            //操作
            str += "&nbsp;<a href='javascript:void(0)' onclick='OpenViewMapWin(\""+mapTaskId+"\");return false;'>查看Map详细日志</a>";
            return str;
        }
        return data[cid];
    });

    return dataTable;
}

//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    var runFlag = document.getElementById("runFlag").value;    
    termVals.LOG_ID2 = logId;
    termVals.runFlag = runFlag;
    dhx.showProgress("请求数据中");
    JobLogAction.queryMapLog(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}


function OpenViewMapWin(b){
	var url = "/meta/module/bigdata/mrddx/log/map/jobMapMsgLog.jsp?mapTaskId="+b;
	try{
		parent.openMenu("查看Map详细日志",url,"top",'mapTaskId='+b);	
	}catch(e){
		window.open(urlEncode(getBasePath()+url),'mapTaskId'+b);
	}
	
}

dhx.ready(pageInit);
