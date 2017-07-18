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
    
    dataTableInit(); //初始数据表格  初始之后dataTable才会被实例化
    dataTable.setReFreshCall(queryData); //设置表格刷新的回调方法，即实际查询数据的方法
    
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        
        dataTable.refreshData();
        dhx.closeProgress();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

}


//初始数据表格
function dataTableInit(){
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
        LOG_ID:"LogID",
        LOG_TYPE_NAME:"日志类型",    	
        LOG_TIME:"生成日志时间",
        LOG_INFO:"日志详情",
        OPP:"OPP"
    },"LOG_ID,LOG_TYPE_NAME,LOG_TIME,LOG_INFO,LOG_TYPE");
    dataTable.setPaging(true,20);//分页
	dataTable.setSorting(false);//无排序
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("15,15,15,55,0");
    dataTable.setGridColumnCfg(0,{align:"center"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"left"});

    dataTable.setFormatCellCall(function(rid,cid,data,colId){
        return data[cid];
    });

    return dataTable;
}

//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals.LOG_ID = logId;
    termVals.JOB_ID = jobId;
    dhx.showProgress("请求数据中");
    JobLogAction.queryJobMsgLog(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

dhx.ready(pageInit);
