/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Collectname：
 *        analysis.js
 *Description：
 *
 *Dependent：
 *
 *Author:	王鹏坤
 *        
 ********************************************************/
 
var dataTable = null;//表格
var dataColTable = null;//表格
var dataDealTable = null;//表格
var timeOne = null;
var timeTwo = null;
var timeThree = null;
var timeFour = null;
var timeFive = null;
//var colDeal = 0;//0为采集，1为处理
var firstColDealId = -1;
var firstColDealType = -1;//0为采集，1为处理
var offWidth = 0;//宽
var arrHour = ["00点","01点","02点","03点","04点","05点","06点","07点","08点","09点","10点","11点","12点",
               "13点","14点","15点","16点","17点","18点","19点","20点","21点","22点","23点"];
 
 /**
  *初始化	
 **/	 
 function initData(){	 
	 addToolBar();
	 offWidth = document.body.offsetWidth-117;
	 $("missionDataDiv").style.width = (offWidth/2)+"px";
 	var termReq = TermReqFactory.createTermReq(1);
 	
 	 var ruleName = termReq.createTermControl("ruleName","RULE_NAME");
     ruleName.setWidth(150);
     ruleName.setInputEnterCall(function(){
         dataTable.Page.currPageNum = 1;
         dataTable.refreshData();
         //selectPart();
     });
 	
 	var startdate = termReq.createTermControl("startDate","START_DATE");
   	startdate.setWidth(120);
  	startdate.setDateRule();
	startdate.render();
  	startdate.myCalendar.setDateFormat("%Y-%m-%d %H:%i:%s");
  	startdate.myCalendar.showTime();
    
    var enddate = termReq.createTermControl("endDate","END_DATE");
    enddate.setWidth(120);
    enddate.setDateRule();
    enddate.render();
    enddate.myCalendar.setDateFormat("%Y-%m-%d %H:%i:%s");
    enddate.myCalendar.showTime();
    
    startdate.myCalendar.attachEvent("onClick",function(){
        enddate.myCalendar.setSensitiveRange(document.getElementById("startDate").value,getFormatToday());
        startdate.myCalendar.setSensitiveRange(null,document.getElementById("endDate").value);
    });
    enddate.myCalendar.attachEvent("onClick",function(){
        startdate.myCalendar.setSensitiveRange(null,document.getElementById("endDate").value);
        enddate.myCalendar.setSensitiveRange(document.getElementById("startDate").value,getFormatToday());
    });
    
    var reset1Btn = document.getElementById("reset1");
    attachObjEvent(reset1Btn,"onclick",function(){
        termReq.getTermControl("START_DATE").clearValue(true);
        var now = new Date();
        if(document.getElementById("endDate").value)
            startdate.myCalendar.setSensitiveRange(null,document.getElementById("endDate").value);
        else
            startdate.myCalendar.setSensitiveRange(null,getFormatToday());
        enddate.myCalendar.setSensitiveRange(null,getFormatToday());
        termReq.getTermControl("START_DATE").inited = 1;
    });
    var reset2Btn = document.getElementById("reset2");
    attachObjEvent(reset2Btn,"onclick",function(){
        termReq.getTermControl("END_DATE").clearValue(true);
        var now = new Date();
        if(document.getElementById("startDate").value)
            enddate.myCalendar.setSensitiveRange(document.getElementById("startDate").value,getFormatToday());
        else
            enddate.myCalendar.setSensitiveRange(null,getFormatToday());
        startdate.myCalendar.setSensitiveRange(null,getFormatToday());
        termReq.getTermControl("END_DATE").inited = 1;
    });
    
 	dataTableInit(); //初始数据表格  初始之后dataTable才会被实例化
	dataTable.setReFreshCall(queryData); //设置表格刷新的回调方法，即实际查询数据的方法
	termReq.init(function(termVals){
		termReq.getTermControl("START_DATE").myCalendar.setSensitiveRange(null,getFormatToday());
		dataTable.refreshData();
	});
	
	// 添加行点击事件
    dataTable.grid.attachEvent("onRowSelect",function(rid,ind){
    	if(rid!=1){
    		dataTable.grid.setRowTextStyle(1, "font-weight:normal;font-style:normal;text-decoration:none;color:black;background-color:whrite;");
    	}
		firstColDealId = dataTable.getUserData(rid,"JOB_ID");
		firstColDealType  = (dataTable.getUserData(rid,"JOB_ORIGIN")=="处理"?1:0);
		selectPart();
		//dataColTable.refreshData();
		if(firstColDealType==1){
			$("colDataDiv").innerHTML="";
			dataDealTableInit();
			dataDealTable.setReFreshCall(queryDealData); //设置表格刷新的回调方法，即实际查询数据的方法
			dataDealTable.refreshData();
		}else{
			$("colDataDiv").innerHTML="";
			dataColTableInit(); //初始数据表格  初始之后dataTable才会被实例化
			dataColTable.setReFreshCall(queryColData); //设置表格刷新的回调方法，即实际查询数据的方法
			dataColTable.refreshData();
		}
	});
	
	
	dataColTableInit(); //初始数据表格  初始之后dataTable才会被实例化
	dataColTable.setReFreshCall(queryColData); //设置表格刷新的回调方法，即实际查询数据的方法
	
	document.getElementById("startDate").value = startDate;
	document.getElementById("endDate").value = endDate;
	
	 var queryBtn = document.getElementById("queryBtn");
	    attachObjEvent(queryBtn,"onclick",function(){
//	    	selectPart();
//	    	dataColTable.refreshData();
	    	dataTable.refreshData();
	    });
 }
 
function  getPartTime(obj){
	//查询任务数据
	 var queryParam = {};
	 if(firstColDealId!=-1){
		 queryParam.COL_DEAL_ID = firstColDealId;
		 queryParam.COL_DEAL_TYPE = firstColDealType;
	 }
	 queryParam.START_DATE = document.getElementById("startDate").value;
	 queryParam.END_DATE = document.getElementById("endDate").value;
	 queryParam.DEAL_DAY = obj.value;
	 
	AnalysisAction.queryPartMission(queryParam,{
		async:false,
        callback:function(data){
		if(data!=null&&data!=""){
			timeOne = data.MISSION_ZONE_TIME_ONE;
			timeTwo = data.MISSION_ZONE_TIME_TWO;
			timeThree = data.MISSION_ZONE_TIME_THREE;
			timeFour = data.MISSION_ZONE_TIME_FOUR;
			timeFive = data.MISSION_ZONE_TIME_FIVE;
			
			showMissionZoneTime(obj.value);//时间区域耗时对比分析图
		}
        }
	});
	
}
 
 
function getPartDeal(obj){
	//查询任务数据
	 var queryParam = {};
	 if(firstColDealId!=-1){
		 queryParam.COL_DEAL_ID = firstColDealId;
		 queryParam.COL_DEAL_TYPE = firstColDealType;
	 }
	 queryParam.START_DATE = document.getElementById("startDate").value;
	 queryParam.END_DATE = document.getElementById("endDate").value;
	 queryParam.DEAL_DAY = obj.value;
	 
	AnalysisAction.queryPartMission(queryParam,{
		async:false,
        callback:function(data){
		if(data!=null&&data!=""){
			timeOne = data.MISSION_ZONE_TIME_ONE;
			timeTwo = data.MISSION_ZONE_TIME_TWO;
			timeThree = data.MISSION_ZONE_TIME_THREE;
			timeFour = data.MISSION_ZONE_TIME_FOUR;
			timeFive = data.MISSION_ZONE_TIME_FIVE;
//			showMission(data.MISSION_INFO);		
//			showMissionBase(data.MISSION_BASE_INFO);
			showMissionZoneDeal(obj.value);//时间区域处理数据对比分析
//			showMissionZoneTime();//时间区域耗时对比分析图
		}
        }
	});
	
}
 
//初始化表格
function dataTableInit(){
	dataTable = new meta.ui.DataTable("missionDataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
        COL_NAME:"任务名称",  
//        JOB_ORIGIN:"类型",  	
        MR:"M/R",
        INPUT_COUNT:"输入",
        OUTPUT_COUNT:"输出",
        SUCCESS_RATE:"成功率",
        OPP:"操作"
    },"COL_NAME,MR,INPUT_COUNT,OUTPUT_COUNT,SUCCESS_RATE,JOB_ID");
    dataTable.setPaging(false);//分页
    
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("28,14,14,14,14,16");
    dataTable.setGridColumnCfg(0,{align:"left",tip:0,select:1});
    dataTable.setGridColumnCfg(1,{align:"center",tip:1});
    dataTable.setGridColumnCfg(2,{align:"center",tip:1});
    dataTable.setGridColumnCfg(3,{align:"center",tip:1});
    dataTable.setGridColumnCfg(4,{align:"center",tip:1});
    dataTable.setGridColumnCfg(5,{align:"center",tip:1});
    
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
    	if(colId == "OPP"){
    		return "<a href='javascript:void(0)' onclick='OpenWin("+rid+");return false;'>配置详情</a>"
    	}else if(colId == "COL_NAME"){
            var missionId = dataTable.getUserData(rid,"JOB_ID");
            var missionType =dataTable.getUserData(rid,"JOB_ORIGIN");
            var missionTemp = "";
            if(missionType=="上传"){
            	missionTemp = "<image src='images/Upload.png'/>";
            }else if(missionType == "下载"){
            	missionTemp = "<image src='images/Download.png'/>";
            }else if(missionType == "处理"){
            	missionTemp = "<image src='images/Settings.png'/>";
            }
            
            return "<span style='min-width:30px;display:inline-block;' id='mission_name_sp_"+missionId+rid+"'>"+missionTemp+data[cid]+"</span>";
         }
        return data[cid];
    });
    
    
    dataTable.setFormatRowCall(function (r, data, rid) {
//    	alert(rid);
        if(rid==1){
        	 dataTable.grid.setRowTextStyle(rid, "font-weight:normal;font-style:normal;text-decoration:none;color:black;background-color:#FFDE96;");
        }
        return r;
    });

    return dataTable;
}

function OpenDetailWin(rid){
	
    	if(firstColDealType==1){
    		var objId = dataDealTable.getUserData(rid,"COL_ID");
    		var objName = dataDealTable.getUserData(rid,"JOB_NAME");
			try{
	              openMenu("查看任务("+objName+")","/meta/module/bigdata/mrddx/log/jobRunMsgLog.jsp?logId="+objId+"&DEAL_NAME="+objName,"top","objId_"+objId+rid);
	          }catch(e) {
	              window.open(urlEncode(getBasePath()+"/meta/module/bigdata/mrddx/log/jobRunMsgLog.jsp?logId="+objId+"&DEAL_NAME="+objName),'objId_'+objId+rid);
	          }
    	}else{
    		var objId = dataColTable.getUserData(rid,"COL_LOG_ID");
    		var objName = dataColTable.getUserData(rid,"COL_NAME");
	    	try{
	              openMenu("查看任务("+objName+")","/meta/module/analysis/showColLog.jsp?colId="+objId+"&COL_NAME="+objName,"top","objId_"+objId+rid);
	          }catch(e) {
	              window.open(urlEncode(getBasePath()+"/meta/module/analysis/showColLog.jsp?colId="+objId+"&COL_NAME="+objName),'objId_'+objId+rid);
	          }
    	}
}


function OpenWin(rid){
	var objId = dataTable.getUserData(rid,"JOB_ID");
    var objName = dataTable.getUserData(rid,"COL_NAME");
    var objDescribe = dataTable.getUserData(rid, "COL_DESCRIBE");
    var missionType = dataTable.getUserData(rid,"JOB_ORIGIN");
    var COL_DATATYPE = dataTable.getUserData(rid, "COL_DATATYPE");
    var colRegin = (missionType=="下载"?0:1);
    if(missionType=="处理"){
    	try{
    		openMenu("查看处理","/meta/module/bigdata/mrddx/config/viewJob.jsp?flag='view'&jobId="+objId+"&DEAL_NAME="+objName,"top","jobViewId="+objId);
    	}catch(e){
    		window.open(urlEncode(getBasePath()+"/meta/module/bigdata/mrddx/config/viewJob.jsp?flag='view'&jobId="+objId+"&DEAL_NAME="+objName),'jobViewId'+objId);
    	}
    	
    }else{
    	
		if(colRegin==0){
			
			var urlDown = "/meta/module/bigdata/collection/addDownCollect.jsp?flag='info'&COL_ID="+objId+"&COL_NAME="+objName+"&COL_ORIGIN="+colRegin+"&COL_DATATYPE="+COL_DATATYPE+"&COL_DESCRIBE="+objDescribe;
//			dhx.alert(urlDown);
//			try{
//				openMenu("查看采集信息","/meta/module/bigdata/collection/addDownCollect.jsp?flag='info'&COL_ID="+objId+"&COL_NAME="+objName+"&COL_ORIGIN="+colRegin+"&COL_DATATYPE="+COL_DATATYPE+"&COL_DESCRIBE="+objDescribe,"top","colIdView="+objId);
//			}catch(e){
				window.open(urlEncode(getBasePath()+urlDown),'colIdView'+objId);
//			}
			
			
		}else{
			var url = "/meta/module/bigdata/collection/addUpCollect.jsp?flag='info'&COL_ID="+objId+"&COL_NAME="+objName+"&COL_ORIGIN="+colRegin+"&COL_DATATYPE="+COL_DATATYPE+"&COL_DESCRIBE="+objDescribe;
			//var url = "/meta/module/bigdata/collection/addUpCollect.jsp?flag='info'&COL_ID=1543&COL_NAME=remotehdfs_重命名&COL_ORIGIN=1&COL_DATATYPE=1&COL_DESCRIBE=remotehdfs_重命名";
//			dhx.alert(url);
//			try{
//				openMenu("查看采集信息",url,"top","colIdView="+objId);
//			}catch(e){
				window.open(urlEncode(getBasePath()+url),'colUpId'+objId);
//			}
				
		}
    	
    }
}

//查询表格数据
function queryData(dt,params){
        var termVals = TermReqFactory.getTermReq(1).getKeyValue();
//        document.getElementById("startDate").value = startDate;
//    	document.getElementById("endDate").value = endDate;
        var startTime = document.getElementById("startDate").value;
        var endTime = document.getElementById("endDate").value;
         termVals.START_DATE = startTime;
         termVals.END_DATE = endTime;
          termVals.WORK_ID = workId;
        AnalysisAction.queryPartChartDataInfo(termVals,function(data){
        	var total = 0;
        	if(data&&data.length>0){
        		total = data[0]["TOTAL_COUNT_"];
        		firstColDealId = data[0]["JOB_ID"];
        		firstColDealType = (data[0]["JOB_ORIGIN"]=="处理"?1:0);
        	}
        	if(data&&data.length>0){
        		for(var k=0;k<data.length;k++){
        			if(data[k]["TYPE_NAME"]&&data[k]["TYPE_NAME"]!=""){
        				document.getElementById('missName').innerHTML = data[k]["TYPE_NAME"];
        				break;
        			}
        		}
        	}
        	dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法 
        	bindMouseEventToMissNameDiv();//绑定任务的基本信息
        	selectPart();
        	if(firstColDealType==1){
    			$("colDataDiv").innerHTML="";
    			dataDealTableInit();
    			dataDealTable.setReFreshCall(queryDealData); //设置表格刷新的回调方法，即实际查询数据的方法
    			dataDealTable.refreshData();
    		}else{
    			$("colDataDiv").innerHTML="";
    			dataColTableInit(); //初始数据表格  初始之后dataTable才会被实例化
    			dataColTable.setReFreshCall(queryColData); //设置表格刷新的回调方法，即实际查询数据的方法
    			dataColTable.refreshData();
    		}
        });
}

//鼠标绑定事件
function bindMouseEventToMissNameDiv(){
var rids = dataTable.grid.getAllRowIds();
    if(rids){
        rids = rids.split(",");
        for(var i=0;i<rids.length;i++){
            var gdl_name_sp_ = document.getElementById("mission_name_sp_"+dataTable.getUserData(rids[i],"JOB_ID")+rids[i]);
            if(gdl_name_sp_){
                gdl_name_sp_.setAttribute("missionId",rids[i]);
                attachObjEvent(gdl_name_sp_,"onmouseover",function(e){
                    e = e || window.event;
                    if(e.srcElement && e.srcElement.getAttribute("missionId")){
                        var gdlbustipdiv = document.getElementById("missionbustipdiv");
                        var data = dataTable.getUserData(e.srcElement.getAttribute("missionId"));
                        $("missionbustipdiv_title").innerHTML = "任务名称：<span title='任务名称' style='font-weight:normal;color:#b07e6f'>"+data["COL_NAME"]
                            +"</span>";
                        $("missionbustipdiv_content").innerHTML = data["PARAM_VALUE"];
                        //  $("missionbustipdiv_content").innerHTML = data["COL_DESCRIBE"];
                        var pos = autoPosition(gdlbustipdiv,e.srcElement,true,false,Math.min(e.srcElement.offsetWidth,e.srcElement.parentNode.offsetWidth-5),-(e.srcElement.offsetHeight));
                    }
                });
            }
        }
    }
}

//初始化表格
function dataDealTableInit(){
	dataDealTable = new meta.ui.DataTable("colDataDiv");//第二个参数表示是否是表格树
    dataDealTable.setColumns({
        COL_ID:"日志ID",
        START_DATE:"任务开始时间",    	
        END_DATE:"任务结束时间",
        TIME_CON:"任务耗时(秒)",
        ALL_FILE_SIZE:"文件大小(M)",
        MAP_INPUT_COUNT:"map输入数据量",
        MAP_OUTPUT_COUNT:"map输出数据量",
        REDUCE_INPUT_COUNT:"reduce输入数据量",
        REDUCE_OUTPUT_COUNT:"reduce输出数据量",
        RUN_FLAG:"执行状态",
        OPP:"操作"
    },"COL_ID,START_DATE,END_DATE,TIME_CON,ALL_FILE_SIZE,MAP_INPUT_COUNT,MAP_OUTPUT_COUNT,REDUCE_INPUT_COUNT,REDUCE_OUTPUT_COUNT,RUN_FLAG");
    dataDealTable.setPaging(false);//分页
    
    dataDealTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataDealTable.grid.setInitWidthsP("8,10,10,8,8,8,8,8,8,8,16");
    dataDealTable.grid.setColAlign("center,center,center,center,center,center,center,center,center,center,center");

    dataDealTable.setFormatCellCall(function(rid,cid,data,colId){
//    	if(colId=='OPP'){
//    		return "<a href='javascript:void(0)' onclick='OpenDetailWin("+rid+");return false;'>查看详情</a>";
//    	}else 
    		if(colId=='RUN_FLAG'){
    			return data[cid]==1?"成功":"失败";
//    		return "<a href='javascript:void(0)' onclick='OpenDetailWin("+rid+");return false;'>"+(data[cid]==1?"成功":"失败")+"</a>";
    	}else if(colId == 'ALL_FILE_SIZE'){
    		return kbToM(data[cid]);
    	}else if(colId == "OPP"){
    		return  "<a href='javascript:void(0)' onclick='OpenDealDetailWin(1,"+rid+");return false;'>Map日志</a>"+
    				"&nbsp;&nbsp;<a href='javascript:void(0)' onclick='OpenDealDetailWin(2,"+rid+");return false;'>Reduce日志</a>"+
    				"&nbsp;&nbsp;<a href='javascript:void(0)' onclick='OpenDealDetailWin(3,"+rid+");return false;'>Job详细日志</a>";
    	}else if(colId == "TIME_CON"){
    		return getTimeConf(rid,2);
    	}
        return data[cid];
    });

    return dataDealTable;
}


function OpenDealDetailWin(flag,rid){
	var objId = dataDealTable.getUserData(rid,"COL_ID");
	var objName = dataDealTable.getUserData(rid,"JOB_NAME");
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


//查询表格数据
function queryDealData(dt,params){
        var termVals = TermReqFactory.getTermReq(1).getKeyValue();
       // termVals.MONTH = monthNum;
        if(firstColDealId!=-1){
        	termVals.COL_DEAL_ID = firstColDealId;
        	termVals.COL_DEAL_TYPE = firstColDealType;
   	 }
        termVals.START_DATE = document.getElementById("startDate").value;
   	   	termVals.END_DATE = document.getElementById("endDate").value;
        //dhx.showProgress("请求数据中");
        AnalysisAction.queryColData(termVals,function(data){
        	//dhx.closeProgress();
        	var total = 0;
        	if(data&&data.length>0){
        		total = data[0]["TOTAL_COUNT_"];
        	}
        	dataDealTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法 
        });
}





//初始化表格
function dataColTableInit(){
	dataColTable = new meta.ui.DataTable("colDataDiv");//第二个参数表示是否是表格树
    dataColTable.setColumns({
        COL_LOG_ID:"日志ID",
        START_TIME:"任务开始时间",    	
        END_TIME:"任务结束时间",
        TIME_CON:"任务耗时(秒)",
        FILE_NUM:"采集文件数",
        STATUS:"采集任务状态"
//        OPP:"操作"
    },"COL_LOG_ID,START_TIME,END_TIME,TIME_CON,FILE_NUM,STATUS,COL_ID");
    dataColTable.setPaging(false);//分页
    
    dataColTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataColTable.grid.setInitWidthsP("16,16,16,16,16,20");
    dataColTable.setGridColumnCfg(0,{align:"center"});
    dataColTable.setGridColumnCfg(1,{align:"center"});
    dataColTable.setGridColumnCfg(2,{align:"center"});
    dataColTable.setGridColumnCfg(3,{align:"center"});
    dataColTable.setGridColumnCfg(4,{align:"center"});
    dataColTable.setGridColumnCfg(5,{align:"center"});
//    dataColTable.setGridColumnCfg(5,{align:"center"});
    
    dataColTable.setFormatCellCall(function(rid,cid,data,colId){
//    	if(colId=='OPP'){
//    		return "<a href='javascript:void(0)' onclick='OpenDetailWin("+rid+");return false;'>查看详情</a>";
//    	}else 
    		if(colId=='STATUS'){
    		switch(data[cid]){
    			case 0:{return "<a href='javascript:void(0)' onclick='OpenDetailWin("+rid+");return false;'>运行中</a>";};break;
    			case 1:{return "<a href='javascript:void(0)' onclick='OpenDetailWin("+rid+");return false;'>成功</a>";};break;
    			case 2:{return "<a href='javascript:void(0)' onclick='OpenDetailWin("+rid+");return false;'>失败</a>";};break;
    			case 3:{return "<a href='javascript:void(0)' onclick='OpenDetailWin("+rid+");return false;'>重新执行</a>";};break;
    			default:{return "<a href='javascript:void(0)' onclick='OpenDetailWin("+rid+");return false;'>失败</a>";}
    		}
//    		return data[cid]==1?"成功":"失败";
    	}else if(colId == 'TIME_CON'){
    		 return getTimeConf(rid,1);
    	}
        return data[cid];
    });

    return dataColTable;
}

/**
 * 
 * @param rid
 */
function getTimeConf(rid,flag){
	var startD = "";
	var endD = "";
	if(flag==1){//采集
		startD = dataColTable.getUserData(rid, "START_TIME");
		endD = dataColTable.getUserData(rid, "END_TIME");
	}else if(flag==2){//处理
		startD = dataDealTable.getUserData(rid, "START_DATE");
		endD = dataDealTable.getUserData(rid, "END_DATE");
	}
	
	var sTime = getTimeD(startD);
	var eTime = getTimeD(endD);
	//作为除数的数字
	var divNum = 1000;
	return (eTime - sTime)/divNum;
}

function getTimeD(dateStr){  
    var  dateStr = dateStr.replace("-", "/");  
    return Date.parse(dateStr);  
} 




//查询表格数据
function queryColData(dt,params){
        var termVals = TermReqFactory.getTermReq(1).getKeyValue();
       // termVals.MONTH = monthNum;
        if(firstColDealId!=-1){
        	termVals.COL_DEAL_ID = firstColDealId;
        	termVals.COL_DEAL_TYPE = firstColDealType;
   	 }
        termVals.START_DATE = document.getElementById("startDate").value;
   	   	termVals.END_DATE = document.getElementById("endDate").value;
        //dhx.showProgress("请求数据中");
        AnalysisAction.queryColData(termVals,function(data){
        	//dhx.closeProgress();
        	var total = 0;
        	if(data&&data.length>0){
        		total = data[0]["TOTAL_COUNT_"];
        	}
        	dataColTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法 
        });
}

function selectPart(){
	//查询任务数据
	 var queryParam = {};
	 if(firstColDealId!=-1){
		 queryParam.COL_DEAL_ID = firstColDealId;
		 queryParam.COL_DEAL_TYPE = firstColDealType;
	 }
	 queryParam.START_DATE = document.getElementById("startDate").value;
	 queryParam.END_DATE = document.getElementById("endDate").value;
	 
	AnalysisAction.queryPartMission(queryParam,{
			async:false,
	        callback:function(data){
		if(data!=null&&data!=""){
			timeOne = data.MISSION_ZONE_TIME_ONE;
			timeTwo = data.MISSION_ZONE_TIME_TWO;
			timeThree = data.MISSION_ZONE_TIME_THREE;
			timeFour = data.MISSION_ZONE_TIME_FOUR;
			timeFive = data.MISSION_ZONE_TIME_FIVE;
			showMission(data.MISSION_INFO);		
//			showMissionBase(data.MISSION_BASE_INFO);
			var ridaolen=document.form1.partTime.length;        
			for(var i=0;i<ridaolen;i++){            
				if(2==document.form1.partTime[i].value){                
					document.form1.partTime[i].checked=true            
					}        
				}
			var ridaolen2=document.form2.partDeal.length;        
			for(var i=0;i<ridaolen2;i++){            
				if(2==document.form2.partDeal[i].value){                
					document.form2.partDeal[i].checked=true            
					}        
				}
			showMissionZoneDeal(2);//时间区域处理数据对比分析
			showMissionZoneTime(2);//时间区域耗时对比分析图
			showMissionZoneDealTime();//时间区域处理耗时对比
			showMissionZoneWarehouseFilter(data.WAREHOUSE_FILRER);//每天的入库，过滤量
		}
	   }
	});
}

/**
 * 查看每天的入库，过滤量
 */
function showMissionZoneWarehouseFilter(warehouseData){
	var unit = "";
	var dealFlag = 0;
	if(firstColDealType==0||firstColDealType=='0'){
		unit = "采集数据量大小";//采集
	}else{
		unit = "处理数据量(条)";//处理
		dealFlag = 1;
	}
	
	var zoneDealDataXml = getWarehouse(warehouseData,unit,dealFlag);
//	if(dealFlag==1){
//		var chart = new FusionCharts("../../resource/Charts/MSLine.swf",
//				"missDealWarehouseId", (offWidth/2), "200", "0", "0");
//		chart.setDataXML(zoneDealDataXml);
//		chart.render("partMissionComDeal");
//	}else if(dealFlag==0){
//		var chart = new FusionCharts("../../resource/Charts/MSLine.swf",
//				"missDealWarehouseId", (offWidth/2), "200", "0", "0");
//		chart.setDataXML(zoneDealDataXml);
//		chart.render("partMissionComDeal");
//	}
	var chart = new FusionCharts("../../resource/Charts/ScrollLine2D.swf",
			"missDealWarehouseId", (offWidth/2), "200", "0", "0");
	chart.setDataXML(zoneDealDataXml);
	chart.render("partMissionComDeal");
	
}



/**
 * 查看每天的入库，过滤量
 * @param unit
 * @param dealFlag 0为采集，1表示处理
 */
function getWarehouse(whData,unit,dealFlag){
	var dataColDealXml = "";
	var sDate = document.getElementById("startDate").value;
	var eDate = document.getElementById("endDate").value;
	if(sDate==""){
		sDate = startDate;
	}
	if(eDate==""){
		eDate = endDate;
	}
	var arr = getDayDistance(sDate,eDate);
	if(dealFlag == 0){
		dataColDealXml = "<chart   lineThickness='2' AxisMinValue='0'  yAxisMaxValue='10' bgColor='F4F4F4'  " +
				" baseFont='宋休' baseFontSize='11' labelPadding='10' " +
		" numberScaleUnit='KB,M,G,T' numberScaleValue='1024,1024,1024,1024'" +
		" defaultNumberScale='KB' " +
		"palette='1' pYAxisName='"+unit+"'  numVisiblePlot='31' canvasPadding='10'   rotateNames='0' animation='1'  " +
				" numdivlines='4' numVDivLines='"+arr.length+"'  baseFont='Arial' baseFontSize='12' useRoundEdges='1' legendBorderAlpha='0'>";
		var dataCate = "<categories >";
		var dataCol = "<dataset renderAs='Line' color='9ACCF6' alpha='90' showValues='0' seriesName='"+unit+"'>";
//		var dataDeal = "<dataset color='82CF27' renderAs='Line'  showValues='0' alpha='90' parentYAxis='S'  seriesName='过滤记录数'>";
//		for(var k=0;k<arrHour.length;k++){
//			dataCate += "<category label='"+arrHour[k]+"' /> ";
//		}
		for(var k=0;k<arr.length;k++){
			var booleanCheck = 0;
			for(var i=0;i<whData.length;i++){
				if(arr[k]==whData[i].T_HOUR){
					booleanCheck= 1;
					dataCate += "<category label='"+whData[i].T_HOUR.substring(5,10)+"' /> ";
					dataCol += " <set value='"+whData[i].TOTAL+"' /> ";		
//					missDataFail += " <set value='"+missData[i].FAIL+"' /> ";
					continue;
				}
			}
			if(booleanCheck == 0){
				dataCate += "<category label='"+arr[k].substring(5,10)+"' /> ";
				dataCol += " <set value='0' /> ";		
//				missDataFail += " <set value='0' /> ";
			}
		} 
		
		
		
//		dataCol += getHour(whData,0,0);
//		dataDeal += getHour(whData,1,0);
		
		dataCate += "</categories>";
		dataCol += "</dataset>";
//		dataDeal += "</dataset>";
		
		dataColDealXml = dataColDealXml + dataCate +dataCol+"</chart>";
	}else if(dealFlag == 1){
		dataColDealXml = "<chart lineThickness='2' canvasPadding='10' alternateVGridAlpha='3' yAxisMinValue='0'  yAxisMaxValue='10' bgColor='F4F4F4'   " +
				"baseFont='宋休' baseFontSize='11' labelPadding='10' " +
		" numberScaleUnit='万,亿,兆' numVisiblePlot='31'  numberScaleValue='10000,10000,10000'" +
		"palette='1' rotateNames='0' animation='1'  " +
				"numdivlines='4' numVDivLines='"+arr.length+"' showValues='0'  baseFont='Arial' baseFontSize='12' useRoundEdges='1' legendBorderAlpha='0'>";
		var dataCate = "<categories >";
		var dataCol = "<dataset color='9ACCF6' seriesName='处理记录数'  anchorBorderColor='9ACCF6' >";
//		var dataDeal = "<dataset color='82CF27' seriesName='过滤记录数' anchorBorderColor='82CF27'>";
		for(var k=0;k<arr.length;k++){
			var booleanCheck = 0;
			for(var i=0;i<whData.length;i++){
				if(arr[k]==whData[i].T_HOUR){
					booleanCheck= 1;
					dataCate += "<category label='"+whData[i].T_HOUR.substring(5,10)+"' /> ";
					dataCol += " <set value='"+whData[i].TOTAL+"' /> ";		
//					missDataFail += " <set value='"+missData[i].FAIL+"' /> ";
					continue;
				}
			}
			if(booleanCheck == 0){
				dataCate += "<category label='"+arr[k].substring(5,10)+"' /> ";
				dataCol += " <set value='0' /> ";		
//				missDataFail += " <set value='0' /> ";
			}
		} 
		
//		dataDeal += getHour(whData,1,0);
		
		dataCate += "</categories>";
		dataCol += "</dataset>";
//		dataDeal += "</dataset>";
		
		dataColDealXml = dataColDealXml + dataCate +dataCol+"</chart>";
	}
	

	return dataColDealXml;
}

/**
 * 查看时间区域处理耗时对比
 */
function showMissionZoneDealTime(){
	var unit = "";
	var dealFlag = 0;
	if(firstColDealType==0||firstColDealType=='0'){
		unit = "数据量大小";
	}else{
		unit = "数据量(条)";
		dealFlag = 1;
	}
	
	var zoneDealDataXml = getDataComXml(unit,dealFlag);
	var chart = new FusionCharts("../../resource/Charts/MSCombiDY2D.swf",
								"missDealId", (offWidth/2-37), "200", "0", "0");
	chart.setDataXML(zoneDealDataXml);
	chart.render("partMissionDealTime");
}

function getDataComXml(unit,dealFlag){
	var dataColDealXml = "";
	if(dealFlag == 0){
		dataColDealXml = "<chart bgColor='F4F4F4'   baseFont='宋休' baseFontSize='11' labelPadding='10' " +
		" numberScaleUnit='KB,M,G,T' numberScaleValue='1024,1024,1024,1024'  defaultNumberScale='KB' " +
		" pYAxisMinValue='0' pYAxisMaxValue='10' sYAxisMinValue='0' sYAxisMaxValue='10'  " +
		"palette='1' pYAxisName='"+unit+"'  sYAxisName='时长(秒)' rotateNames='0' animation='1'  " +
				"numdivlines='4'  baseFont='Arial' baseFontSize='12' useRoundEdges='1' legendBorderAlpha='0'>";
	}else if(dealFlag == 1){
		dataColDealXml = "<chart bgColor='F4F4F4'   baseFont='宋休' baseFontSize='11' labelPadding='10' " +
		" numberScaleUnit='万,亿,兆' numberScaleValue='10000,10000,10000'" +
		"pYAxisMinValue='0' pYAxisMaxValue='10' sYAxisMinValue='0' sYAxisMaxValue='10'  " +
		"palette='1' pYAxisName='"+unit+"'  sYAxisName='时长(秒)' rotateNames='0' animation='1'  " +
				"numdivlines='4'  baseFont='Arial' baseFontSize='12' useRoundEdges='1' legendBorderAlpha='0'>";
	}
	var dataCate = "<categories >";
	var dataCol = "<dataset color='9ACCF6' alpha='90' showValues='0'  seriesName='数据量'>";
	var dataDeal = "<dataset color='82CF27'  showValues='0' alpha='90' parentYAxis='S' seriesName='时长'>";
	for(var k=0;k<arrHour.length;k++){
		dataCate += "<category label='"+arrHour[k]+"' /> ";
	}
	 
	dataCol += getHour(timeOne,0,0);
	dataDeal += getHour(timeOne,1,0);
	
	
	dataCate += "</categories>";
	dataCol += "</dataset>";
	dataDeal += "</dataset>";
	
	
	dataColDealXml = dataColDealXml + dataCate +dataCol+dataDeal+"</chart>";

	return dataColDealXml;
}




function showMission(missData){
	if(missData!=null&&missData.length>0){
		var sDate = document.getElementById("startDate").value;
		var eDate = document.getElementById("endDate").value;
		if(sDate==""){
			sDate = startDate;
		}
		if(eDate==""){
			eDate = endDate;
		}
		var arr = getDayDistance(sDate,eDate);
		
		var missDataXml = "<chart yAxisMinValue='0'  yAxisMaxValue='10' animation='1' labelDisplay='rotate'  slantLabels='1' canvasPadding='10' yAxisName='运行任务数'  xAxisName='时间' bgColor='F7F7F7, E9E9E9'  divLineAlpha='30'  labelPadding ='10' yAxisValuesPadding ='10' numberScaleUnit='万,亿,兆' numberScaleValue='10000,10000,10000' numVDivLines='22'  showValues='0' rotateValues='1' valuePosition='auto'>";
		var missDataSuccess = "<dataset seriesName='成功数' color='A66EDD' >";
		var missDataFail = "<dataset seriesName='失败数' color='F6BD0F'>";
		var missDataCate = "<categories>";
		for(var k=0;k<arr.length;k++){
			var booleanCheck = 0;
			for(var i=0;i<missData.length;i++){
				if(arr[k]==missData[i].SHOW_DATE){
					booleanCheck= 1;
					missDataCate += "<category label='"+missData[i].SHOW_DATE+"' /> ";
					missDataSuccess += " <set value='"+missData[i].SUCCESS+"' /> ";		
					missDataFail += " <set value='"+missData[i].FAIL+"' /> ";
					continue;
				}
			}
			if(booleanCheck == 0){
				missDataCate += "<category label='"+arr[k]+"' /> ";
				missDataSuccess += " <set value='0' /> ";		
				missDataFail += " <set value='0' /> ";
			}
		}
		
		missDataCate += "</categories>";
		missDataFail += "</dataset>";
		missDataSuccess += "</dataset>";
		missDataXml = missDataXml + missDataCate + missDataSuccess + missDataFail + "</chart>";
		
		var chart = new FusionCharts("../../resource/Charts/ZoomLine.swf",
									"missId", (offWidth/2-37), "289", "0", "0");
		chart.setDataXML(missDataXml);
		chart.render("partMission");
	
	}
}

function showMissionZoneDeal(timeNum){
	var unit = "";
	var dealFlag = 0;//0表示数据大小(M,G,T)，1表示采集数据量(条)
	if(firstColDealType==0||firstColDealType=='0'){
		unit = "数据量大小";
	}else{
		unit = "数据量(条)";
		dealFlag = 1;
	}
	
	var zoneDealDataXml = getDataXml(timeNum,unit,0,dealFlag);
	var chart = new FusionCharts("../../resource/Charts/MSLine.swf",
								"missDealId", (offWidth/2), "200", "0", "0");
	chart.setDataXML(zoneDealDataXml);
	chart.render("partMissionDeal");
	
}

function showMissionZoneTime(timeNum){
	var zoneTimeDataXml = getDataXml(timeNum,"时长",1,0);
	var chartTime = new FusionCharts("../../resource/Charts/MSLine.swf",
			"missTimeId", (offWidth/2-37), "200", "0", "0");
	chartTime.setDataXML(zoneTimeDataXml);
	chartTime.render("partMissionTime");	
}

/**
 * 
 * @param timeNum
 * @param unit
 * @param flag 0表示为时间点处理数据,1表示时间区域耗时对比
 * @param dealFlag 0表示采集，数据量的大小，1表示处理，数据量的条数
 * @returns {String}
 */
function getDataXml(timeNum,unit,flag,dealFlag){
	var zoneTimeDataXml = "";
	if(flag == 0){
		if(dealFlag == 1){
			zoneTimeDataXml = "<chart  yAxisMinValue='0' yAxisMaxValue='10'  bgColor='F7F7F7, E9E9E9' " +
			" yAxisName='"+unit+"'   defaultNumberScale='' yAxisMinValue='0' yAxisMaxValue='10' " +
					"numberScaleUnit='万,亿,兆' numberScaleValue='10000,10000,10000'    " +
					"divLineAlpha='30'  labelPadding ='10'  numVDivLines='22'     yAxisValuesPadding ='10' " +
					"showValues='0' rotateValues='1' valuePosition='auto'>";
		}else if(dealFlag == 0){
			zoneTimeDataXml = "<chart  yAxisMinValue='0' yAxisMaxValue='10'  bgColor='F7F7F7, E9E9E9' " +
			" yAxisName='"+unit+"'   defaultNumberScale='KB' yAxisMinValue='0' yAxisMaxValue='10' " +
					"numberScaleUnit='KB,M,G,T' numberScaleValue='1024,1024,1024,1024' " +
					"divLineAlpha='30'  labelPadding ='10'  numVDivLines='22'     yAxisValuesPadding ='10' " +
					"showValues='0' rotateValues='1' valuePosition='auto'>";
		}
		
	}else if(flag == 1){
		zoneTimeDataXml = "<chart  yAxisMinValue='0' yAxisMaxValue='10'  bgColor='F7F7F7, E9E9E9' " +
		"  yAxisName='"+unit+"'   defaultNumberScale='秒' " +
				" numberScaleUnit='分钟,小时' numberScaleValue='60,60'    " +
				"divLineAlpha='30'  labelPadding ='10'  numVDivLines='22'    " +
				" yAxisValuesPadding ='10' showValues='0' rotateValues='1' valuePosition='auto'>";
	}
	var zoneTimeDataSuccess = "";
	var zoneTimeDataFail = "";
	var zoneTimeDataThree = "";
	var zoneTimeDataFour = "";
	var zoneTimeDataFive = "";
	var zoneTimeDataCate = "";
	var enArr = new Array();
	var now = new Date();
	if(timeNum==2){
		zoneTimeDataSuccess += "<dataset seriesname='"+getDay(0)+"' color='A66EDD' >";
		zoneTimeDataFail += "<dataset seriesname='"+getDay(1)+"' color='F6BD0F'>";
		 
		zoneTimeDataSuccess += getHour(timeOne,flag,dealFlag);
		zoneTimeDataFail += getHour(timeTwo,flag,dealFlag);
		zoneTimeDataSuccess +="</dataset>";
		zoneTimeDataFail += "</dataset>";
		zoneTimeDataCate += "<categories>";
		
		for(var k=0;k<arrHour.length;k++){
			zoneTimeDataCate += "<category label='"+arrHour[k]+"' /> ";
		}
		zoneTimeDataCate += "</categories>";
		
	}else if(timeNum==3){
		zoneTimeDataSuccess += "<dataset seriesname='"+getDay(0)+"' color='A66EDD' >";
		zoneTimeDataFail += "<dataset seriesname='"+getDay(1)+"' color='F6BD0F'>";
		zoneTimeDataThree += "<dataset seriesname='"+getDay(2)+"' color='1D8BD1'>";
		
		zoneTimeDataSuccess += getHour(timeOne,flag,dealFlag);
		zoneTimeDataFail += getHour(timeTwo,flag,dealFlag);
		zoneTimeDataThree += getHour(timeThree,flag,dealFlag);
		
		zoneTimeDataCate += "<categories>";
		for(var k=0;k<arrHour.length;k++){
			zoneTimeDataCate += "<category label='"+arrHour[k]+"' /> ";
		}
		zoneTimeDataCate += "</categories>";
		
		zoneTimeDataSuccess += "</dataset>";
		zoneTimeDataFail += "</dataset>";
		zoneTimeDataThree += "</dataset>";
	}else if(timeNum==5){
		zoneTimeDataSuccess += "<dataset seriesname='"+getDay(0)+"' color='A66EDD' >";
		zoneTimeDataFail += "<dataset seriesname='"+getDay(1)+"' color='F6BD0F' >";
		zoneTimeDataThree += "<dataset seriesname='"+getDay(2)+"' color='1D8BD1' >";
		zoneTimeDataFour += "<dataset seriesname='"+getDay(3)+"' color='F1683C' >";
		zoneTimeDataFive += "<dataset seriesname='"+getDay(4)+"' color='2AD62A' >";
		
		zoneTimeDataSuccess += getHour(timeOne,flag,dealFlag);
		zoneTimeDataFail += getHour(timeTwo,flag,dealFlag);
		zoneTimeDataThree += getHour(timeThree,flag,dealFlag);
		zoneTimeDataFour += getHour(timeFour,flag,dealFlag);
		zoneTimeDataFive += getHour(timeFive,flag,dealFlag);	
		
		
		zoneTimeDataCate += "<categories>";
		for(var k=0;k<arrHour.length;k++){
			zoneTimeDataCate += "<category label='"+arrHour[k]+"' /> ";
		}
		zoneTimeDataCate += "</categories>";
		
		zoneTimeDataSuccess += "</dataset>";
		zoneTimeDataFail += "</dataset>";
		zoneTimeDataThree += "</dataset>";
		zoneTimeDataFour += "</dataset>";
		zoneTimeDataFive += "</dataset>";
	}
	
	zoneTimeDataXml = zoneTimeDataXml + zoneTimeDataCate +zoneTimeDataSuccess+zoneTimeDataFail+zoneTimeDataThree+zoneTimeDataFour+zoneTimeDataFive + "</chart>";
	return zoneTimeDataXml;
}


function addToolBar(){
	var toolbarData = {
	        parent: "missCountToolObj",
	        icon_path: "../../../../meta/resource/images/",
	        items: [{
	            type: "text",
	            id: "adds_bt",
	            text: "按任务数状态分布图"
	           // img: "addRole.png",
	          //  tooltip: "设置批量权限"
	        }]
		};
	     new dhtmlXToolbarObject(toolbarData);
	    
	    var statisticalTooltatisticalbarData = {
	    		parent: "timeZoneComToolObj",
	    		icon_path: "../../../../meta/resource/images/",
	    		items: [{
	    			type: "text",
	    			id: "adds_bt",
	    			text: "时间点耗时对比分布图"
	    			// img: "addRole.png",
	    			//  tooltip: "设置批量权限"
	    		}]
	    };
	     new dhtmlXToolbarObject(statisticalTooltatisticalbarData);
 
 var toolbarData = {
	        parent: "timeZoneToolObj",
	        icon_path: "../../../../meta/resource/images/",
	        items: [{
	            type: "text",
	            id: "adds_bt",
	            text: "时间点处理数据量对比图"
	        }]
		};
	     new dhtmlXToolbarObject(toolbarData);
	    
	    var statisticalTooltatisticalbarData = {
	    		parent: "timeZoneComToolObj",
	    		icon_path: "../../../../meta/resource/images/",
	    		items: [{
	    			type: "text",
	    			id: "adds_bt",
	    			text: "时间点平均耗时对比图"
	    		}]
	    };
	     new dhtmlXToolbarObject(statisticalTooltatisticalbarData);

	    var failTooltatisticalbarData = {
	    		parent: "countToolObj",
	    		icon_path: "../../../../meta/resource/images/",
	    		items: [{
	    			type: "text",
	    			id: "adds_bt",
	    			text: "记录数统计"
	    		}]
	    };
	     new dhtmlXToolbarObject(failTooltatisticalbarData);

	     
	     var missListToolObjbarData = {
		    		parent: "missListToolObj",
		    		icon_path: "../../../../meta/resource/images/",
		    		items: [{
		    			type: "text",
		    			id: "adds_bt",
		    			text: "任务列表"
		    		}]
		    };
		     new dhtmlXToolbarObject(missListToolObjbarData);
		     
		     var missListToolComObjbarData = {
			    		parent: "timeZoneComToolComObj",
			    		icon_path: "../../../../meta/resource/images/",
			    		items: [{
			    			type: "text",
			    			id: "adds_bt",
			    			text: "最近一天处理数据量与耗时分布图"
			    		}]
		     	};
			     new dhtmlXToolbarObject(missListToolComObjbarData);
			     
			     var missListToolComObjbar = {
				    		parent: "timeZoneToolComObj",
				    		icon_path: "../../../../meta/resource/images/",
				    		items: [{
				    			type: "text",
				    			id: "adds_bt",
				    			text: "入库量统计(按天统计)"
				    		}]
				    };
				     new dhtmlXToolbarObject(missListToolComObjbar);     
		     
		     
}

//得到24小时的横座标
function getHour(arrTime,flag,dealFlag){
	var rs ="";
	for(var k=0;k<arrHour.length;k++){
		var booleanCheck = 0;
		for(var i=0;i<arrTime.length;i++){
			if(arrHour[k]==arrTime[i].T_HOUR){
				booleanCheck =1;
				if(flag==0){
					var valTemp = parseInt(arrTime[i].TOTAL);
					rs += " <set value='"+valTemp+"' /> ";
				}else if(flag==1){
					rs += " <set value='"+parseInt(arrTime[i].T_TOTAL)+"' /> ";
				}
				continue;
			}
		}
		if(booleanCheck==0){
			rs += "<set value='0' />";
		}	
	} 
	return rs;
}

//得到距选择日期最后一天前几天的值
function getDay(i){
	var endD = document.getElementById("endDate").value;
	var now = new Date(getTimeD(endD));
	var start = new Date(getTimeD(endD));
	start.setDate(now.getDate() - i);//取得一周内的第一天、第二天、第三天...
	return start.getFullYear()+"-"+((start.getMonth()+1)<10?("0"+(start.getMonth()+1)):(start.getMonth()+1))+"-"+(start.getDate()<10?("0"+start.getDate()):start.getDate());
}

/**兼容IE8取得一个日期
 *Parses string formatted as YYYY-MM-DD to a Date object. 
* If the supplied string does not match the format, an 
* invalid Date (value NaN) is returned. 
* @param {string} dateStringInRange format YYYY-MM-DD, with year in 
* range of 0000-9999, inclusive. 
* @return {Date} Date object representing the string. 
*/  
function parseISO8601(dateStringInRange) {  
var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/,  
  date = new Date(NaN), month,  
  parts = isoExp.exec(dateStringInRange);  
if(parts) {  
 month = +parts[2];  
 date.setFullYear(parts[1], month - 1, parts[3]);  
 if(month != date.getMonth() + 1) {  
  date.setTime(NaN);  
 }  
}  
return date;  
} 





//得到两个时间的差值，天为单位,兼容IE8

function getDayLength(strDateStart,strDateEnd){ 
var strSeparator = "-"; //日期分隔符 
var oDate1; 
var oDate2; 
var iDays; 
oDate1= strDateStart.split(strSeparator); 
oDate2= strDateEnd.split(strSeparator); 
var strDateS = new Date(oDate1[0], oDate1[1]-1, oDate1[2]); 
var strDateE = new Date(oDate2[0], oDate2[1]-1, oDate2[2]); 
iDays = parseInt(Math.abs(strDateS - strDateE ) / 1000 / 60 / 60 /24)//把相差的毫秒数转换为天数 
return iDays ; 
} 

function getDayDistance(sd,ed){
	var arrRs = [];
	sd = sd.substr(0,10);
	ed = ed.substr(0,10);
	var sdDate = parseISO8601(sd);
	var edDate = parseISO8601(ed);
	var dayLength = getDayLength(sd,ed);
	for(var i=0;i<=dayLength;i++){
		sdDate.setDate(sdDate.getDate()+i);
		arrRs.push(getFormatDay(sdDate));
		sdDate = parseISO8601(sd);
	}
	return arrRs;
}

function getFormatDay(start){
	return start.getFullYear()+"-"+((start.getMonth()+1)<10?("0"+(start.getMonth()+1)):(start.getMonth()+1))+"-"+(start.getDate()<10?("0"+start.getDate()):start.getDate());
}

//将字节换算成M
function kbToM(kbNum){
	return Number(kbNum/1024/1024).toFixed(2);
}

/**
 * 格式化今天时间，返回时分秒
 * @param start
 * @returns
 */
function getFormatToday(){
	var start = new Date();
	return start.getFullYear()+"-"+((start.getMonth()+1)<10?("0"+(start.getMonth()+1)):(start.getMonth()+1))+"-"
	+(start.getDate()<10?("0"+start.getDate()):start.getDate())+" "+(start.getHours()<10?("0"+start.getHours()):start.getHours())+":"
	+(start.getMinutes()<10?("0"+start.getMinutes()):start.getMinutes())+":00";
}


dhx.ready(initData);