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
    
    var mapTaskId = termReq.createTermControl("mapTaskId","MAP_TASK_ID");
    mapTaskId.setInputEnterCall(function(){
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
    var rollbackBtn = document.getElementById("rollbackBtn");
    
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    attachObjEvent(rollbackBtn,"onclick",function(){
    	window.parent.closeTab("查看Map详细日志");
//    	parent.openMenu("日志管理","/meta/module/bigdata/mrddx/log/jobRunLog.jsp","right");
//        dataTable.refreshData();
    });

}


//初始数据表格
function dataTableInit(){
    var dd = document.getElementById("dataDiv");
    var pageContent = document.getElementById("pageContent");
    var queryFormDIV = document.getElementById("queryFormDIV");
    queryFormDIV.style.width = pageContent.offsetWidth -30  + "px";
    dd.style.width = pageContent.offsetWidth  + "px";
    dd.style.height = pageContent.offsetHeight-queryFormDIV.offsetHeight - 35 + "px";
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
        LOG_ID:"LogID",
        MAP_TASK_ID:"Map任务ID",
        LOG_TYPE_NAME:"日志类型",    	
        LOG_DATE:"生成日志时间",
        LOG_MSG:"日志详情"
    },"LOG_ID,MAP_TASK_ID,LOG_TYPE_NAME,LOG_DATE,LOG_MSG,LOG_TYPE");
    dataTable.setRowIdForField("LOG_ID");
    dataTable.setPaging(true,20);//分页
    dataTable.setSorting(true,{
        LOG_ID:"asc"
    });
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("20,30,10,20,20");
    dataTable.setGridColumnCfg(0,{align:"center"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    
    dataTable.setFormatCellCall(function(rid,cid,data,colId){

        return data[cid];
    });

    return dataTable;
}

//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    dhx.showProgress("请求数据中");
    termVals.MAP_TASK_ID2 = mapTaskId;
    JobLogAction.queryMapMsgLog(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

dhx.ready(pageInit);
