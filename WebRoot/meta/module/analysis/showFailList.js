/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        showColLog.js
 *Description：
 *
 *Dependent：
 *
 *Author:	王鹏坤
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
    	LOG_ID:"日志ID",
    	JOB_NAME:"任务名称",
        START_DATE:"开始时间",    	
        END_DATE:"结束时间",
        RUN_FLAG:"任务状态",
        OPP:"操作"
    },"LOG_ID,JOB_NAME,START_DATE,END_DATE,RUN_FLAG,LOG_MSG");
    dataTable.setPaging(true,20);//分页
	dataTable.setSorting(false);//无排序
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("16,16,16,16,16,20");
    dataTable.setGridColumnCfg(0,{align:"center"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    dataTable.setGridColumnCfg(5,{align:"center"});

    dataTable.setFormatCellCall(function(rid,cid,data,colId){
    	if(colId=="RUN_FLAG"){
    		return data[cid]==1?"成功":"失败";
    	}else if(colId == "OPP"){
    		var flag = dataTable.getUserData(rid, "FLAG");
    		var objName = dataTable.getUserData(rid, "JOB_NAME");
    		var objId = dataTable.getUserData(rid, "LOG_ID");
    		if(flag==1){
    			return "<a href='javascript:void(0)' onclick='OpenDealDetailWin(1,"+rid+");return false;'>Map日志</a>"+
				"&nbsp;&nbsp;<a href='javascript:void(0)' onclick='OpenDealDetailWin(2,"+rid+");return false;'>Reduce日志</a>"+
				"&nbsp;&nbsp;<a href='javascript:void(0)' onclick='OpenDealDetailWin(3,"+rid+");return false;'>Job详细日志</a>";
    		}else{
    			return "<a href='javascript:void(0)' onclick='OpenDetailWin("+rid+");return false;'>查看详情</a>"
    		}
    	}
        return data[cid];
    });

    return dataTable;
}

function OpenDetailWin(rid){
	var objId = dataTable.getUserData(rid,"LOG_ID");
	var objName = dataTable.getUserData(rid,"JOB_NAME");
	try{
          openMenu("查看任务("+objName+")","/meta/module/analysis/showColLog.jsp?colId="+objId+"&COL_NAME="+objName,"top","objId_"+objId+rid);
      }catch(e) {
          window.open(urlEncode(getBasePath()+"/meta/module/analysis/showColLog.jsp?colId="+objId+"&COL_NAME="+objName),'objId_'+objId+rid);
      }
}

function OpenDealDetailWin(flag,rid){
	var objId = dataTable.getUserData(rid,"LOG_ID");
	var objName = dataTable.getUserData(rid,"JOB_NAME");
	var url = "";
	if(flag==1){
		url = "/meta/module/bigdata/mrddx/log/map/jobMapLog.jsp?logId="+objId+"&jobName="+objName;
		try{
	        openMenu("查看任务("+objName+")",url,"top","mapId_"+objId+rid);
	    }catch(e) {
	        window.open(urlEncode(getBasePath()+url),'mapId_'+objId+rid);
	    }
	}else if(flag==2){
		url = "/meta/module/bigdata/mrddx/log/reduce/jobReduceLog.jsp?logId="+objId+"&jobName="+objName;
		try{
	        openMenu("查看任务("+objName+")",url,"top","reduceId_"+objId+rid);
	    }catch(e) {
	        window.open(urlEncode(getBasePath()+url),'reduceId_'+objId+rid);
	    }
	}else if(flag==3){
		url = "/meta/module/bigdata/mrddx/log/jobRunMsgLog.jsp?logId="+objId+"&jobName="+objName;
		try{
	        openMenu("查看任务("+objName+")",url,"top","objId_"+objId+rid);
	    }catch(e) {
	        window.open(urlEncode(getBasePath()+url),'objId_'+objId+rid);
	    }
	}
	
}


//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals.FAIL_TIME = failTime;
    termVals.START_DATE = sDate;
    termVals.END_DATE = eDate;
    	
    dhx.showProgress("请求数据中");
    AnalysisAction.queryColFailList(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

dhx.ready(pageInit);
