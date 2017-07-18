/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        checkQuotaAction.js
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
    
//    var fileName = termReq.createTermControl("fileName","FILE_NAME");
//    fileName.setInputEnterCall(function(){
//        dataTable.Page.currPageNum = 1;
//        dataTable.refreshData();
//    });

    var dsType = termReq.createTermControl("fileName","FILE_NAME");	
    dsType.setListRule(1,"SELECT DISTINCT SUBSTR(T.FILE_NAME,26) AS FILE_NAME,SUBSTR(T.FILE_NAME,26) AS FILE_NAME FROM HDFS_QUOTA_TABLE T WHERE T.FILE_NAME IS NOT NULL","");
    dsType.setWidth(200);
    dsType.setValueChange(function(v){
        var val =  (v && v.length)? v[0] : v;
        dataTable.bindData([]);
        if(val=="" || val == null || val==undefined){
            return true;
        }
        CheckQuotaAction.queryQuotaByfileName({FILE_NAME:val},function(data){
            if(data && data.length){
                dataTable.bindData(data);
            }
        });
        return true;
    });
    
    
    var dateNo = termReq.createTermControl("dateNo","DATE_NO");
    dateNo.setWidth(120);
    dateNo.setDateRule();

    dateNo.render();
    dateNo.myCalendar.setDateFormat("%Y-%m-%d");
    dateNo.myCalendar.hideTime();


    var reset1Btn = document.getElementById("reset1");
    attachObjEvent(reset1Btn,"onclick",function(){
        termReq.getTermControl("DATE_NO").clearValue(true);
        termReq.getTermControl("DATE_NO").inited = 1;
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
    
    var realqueryBtn = document.getElementById("realqueryBtn");
    attachObjEvent(realqueryBtn,"onclick",function(){
	    CheckQuotaAction.connectSFTP(function(data){
	    	if(data){
		        dataTable.Page.currPageNum = 1;
		        dataTable.refreshData();
	    	}
	    });
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
        FILE_NAME:"目录名称",
        //MONTH_NO:"月份",
        DATE_NO:"日期",
        CURRENT_DATE:"时间",
        DIR_COUNT:"目录数",
        FILE_COUNT:"文件数",
        CONTENT_SIZE:"内容大小(T)",
        SPACE_QUOTA:"空间配额(T)",
		REMAINING_SPACE_QUOTA:"剩余空间配额(T)",
		USE_PERCENTAGE:"利用百分比",
        REMAIN_PERCENTAGE:"剩余百分比"
    },"FILE_NAME,DATE_NO,CURRENT_DATE,DIR_COUNT,FILE_COUNT,CONTENT_SIZE,SPACE_QUOTA,REMAINING_SPACE_QUOTA,USE_PERCENTAGE,REMAIN_PERCENTAGE");
    dataTable.setPaging(true,15);//分页
//    dataTable.setSorting(false);
    dataTable.setSorting(true,{
        CURRENT_DATE:"desc"
    });
    
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("20,8,14,8,8,8,8,10,8,8");
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
    
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
        return data[cid];
    });

    return dataTable;
}

//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals["_COLUMN_SORT"] = params.sort;
    dhx.showProgress("请求数据中");
    CheckQuotaAction.queryQuota(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法 
    });
}

dhx.ready(pageInit);
