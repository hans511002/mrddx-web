
var dataTable = null;//表格
var myChart ;
var initmyChart1 = 0;
var myChart2 ;
var initmyChart2 = 0;
var chart3 ;
var initmyChart3 = 0;

//初始界面
function pageInit() {
	
    var termReq = TermReqFactory.createTermReq(1);
    dataTableInit(); 
    dataTable.setReFreshCall(queryData); 
    
	var toolbarData = {
	        parent: "missTypeToolObj",
	        icon_path: "",
	        items: [{
	            type: "text",
	            id: "adds_bt",
	            text: "24H任务执行情况"
	           // img: "addRole.png",
	          //  tooltip: "设置批量权限"
	        }]
		};
    new dhtmlXToolbarObject(toolbarData);
    
    termReq.init(function(termVals){
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    attachObjEvent(queryBtn,"onclick",function(){
    	renderChart();
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    
    UserTypeAction.queryTypeByUser(null,function(data){
    	var paramsTD = document.getElementById("job_type");
	    paramsTD.options.length = 0; 
	    paramsTD.options[0] = new Option("--全部--","");
	    for(var m=0;m<data.length;m++){
	    	paramsTD.options[m+1] = new Option(data[m].TYPE_NAME,data[m].TYPE_ID);
	    }
	    
	    paramsTD = document.getElementById("S_JOB_TYPE");
	    paramsTD.options.length = 0; 
	    paramsTD.options[0] = new Option("--全部--","");
	    for(var m=0;m<data.length;m++){
	    	paramsTD.options[m+1] = new Option(data[m].TYPE_NAME,data[m].TYPE_ID);
	    }
    });
 	
    var lineQueryBtn = document.getElementById("lineQueryBtn");
    attachObjEvent(lineQueryBtn,"onclick",function(){
        buildLineChar();
    });

    var dd = document.getElementById("dataDiv");
    
    //初始化图标
    myChart = new FusionCharts("../../resource/Charts/MSColumn2D.swf", "myChartId", "280", "270", "0", "1");
    
    myChart2 = new FusionCharts("../../resource/Charts/Pie2D.swf", "myChartId2", "280", "280", "0", "1");
    
    chart3 = new FusionCharts("../../resource/Charts/ZoomLine.swf", "ChId1",dd.offsetWidth, "300", "0", "1");
    
    //启动定时器
    MonitorAction.getMonitorConfig(function(data){
    	if(data.ISAUTOREFRESH==1){
    		webinterval = data.WEBINTERVAL;
    		timer();
    		//myChart.render("chartContainer");
    		//myChart2.render("chartContainer2");
    		//chart3.render("chartContainerLine");
    	}else{
    		renderChart();
		 	buildLineChar();
		 	dataTable.refreshData();
		 	//myChart.render("chartContainer");
    		//myChart2.render("chartContainer2");
    		//chart3.render("chartContainerLine");
    	}
    });
}

var t = null; 
var webinterval = 60000;

function timer() {  
 	renderChart();
 	buildLineChar();
 	dataTable.refreshData();
	t = setTimeout(timer, webinterval);//单位：毫秒 
} 

function renderChart()
{
	MonitorAction.getJobStatusData(function(data){
		if(data!=null){
			for(var i=0;i<data.length;i++){
				document.getElementById("status"+data[i].STATUS).innerHTML=data[i].STATUS_NUM;
			}
		}
	});
	
	// get chart type from combo box
	MonitorAction.getSysResources(function(data){
		
		var datastr = '<chart caption="系统资源" animation="0" bgColor="FFFFFF" decimals="0" >';
		datastr += '<categories><category label="系统资源"/><category label="当前占用资源"/><category label="用户占用资源"/></categories>';
			var SYS_MAP = data.SYS_MAP;
			var SYS_REDUCE = data.SYS_REDUCE;
			var JOB_MAP = data.JOB_MAP;
			var JOB_REDUCE = data.JOB_REDUCE;
			var OWN_MAP = data.OWN_MAP;
			var OWN_REDUCE = data.OWN_REDUCE;
			
			datastr+='<dataset seriesName="MAP" color="AFD8F8">';
			datastr+='<set value="'+SYS_MAP+'"/>';
			datastr+='<set value="'+JOB_MAP+'"/>';
			datastr+='<set value="'+OWN_MAP+'"/>';
			datastr+='</dataset>';
			datastr+='<dataset seriesName="REDUCE" color="F6BD0F">';
			datastr+='<set value="'+SYS_REDUCE+'"/>';
			datastr+='<set value="'+JOB_REDUCE+'"/>';
			datastr+='<set value="'+OWN_REDUCE+'"/>';
			datastr+='</dataset>';
			datastr+='</chart>';
		myChart.setXMLData(datastr);
		if(initmyChart1 == 0){
			myChart.render("chartContainer");
			initmyChart1 = 1;
		}
	});
	
	MonitorAction.getUserJobData(function(data){
		var datastr = '<chart caption="任务用户分布" animation="0" bgColor="FFFFFF"  showLabels="0" xAxisName="Type" yAxisName="Sales" >';
		if(data!=null){
			for(var i=0;i<data.length;i++){
				datastr+='<set label="'+data[i].USER_NAMECN+'" value="'+data[i].USER_NUM+'" />';
			}
		}
		datastr += '</chart>';
		myChart2.setXMLData(datastr);
		if(initmyChart2 == 0){
			myChart2.render("chartContainer2");
			initmyChart2 = 1;
		}
	});
}
	

function buildLineChar() {
    
    var interval = document.getElementById("interval").value;
    var task_type = document.getElementById("task_type").value;
    var job_type = document.getElementById("job_type").value;
    
    var submitdata = {};
    
    if(task_type!=""){
    	submitdata.task_type=task_type;
    }
    if(job_type!=""){
    	submitdata.job_type=job_type;
    }
    submitdata.interval=interval;
    
	MonitorAction.getJobStatusLineData(submitdata,function(data){
        var strXML;
		strXML = "<chart compactDataMode='1' limitsDecimalPrecision='0' yAxisMinValue='0' yAxisMaxValue='5' bgColor='FFFFFF' dataSeparator='|' paletteThemeColor='5D57A5' divLineColor='5D57A5' divLineAlpha='40' vDivLineAlpha='40' allowPinMode='1'";
		strXML += ">\n<categories>"
		var STARTNUM  = "<dataset seriesName='开始数量'>\n";
		var SUCCESS  = "<dataset seriesName='结束数量'>\n";
		var FAILURE = "<dataset seriesName='异常数量'>\n";
		for(var i=0;i<data.length;i++){
			strXML   += (data[i].DATE_TIME	+"|");
			STARTNUM += (data[i].STARTNUM	+"|");
			SUCCESS  += (data[i].SUCCESS	+"|");
			FAILURE  += (data[i].FAILURE	+"|");
		}
		strXML += "</categories>\n";
		STARTNUM += "</dataset>";
		SUCCESS += "</dataset>";
		FAILURE += "</dataset>";
		strXML+=STARTNUM+SUCCESS+FAILURE+'</chart>';
		chart3.setXMLData(strXML);
		if(initmyChart3 == 0){
			chart3.render("chartContainerLine");
			initmyChart3 = 1;
		}
	});
}


//初始数据表格
function dataTableInit(){
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
    	JOB_NAME :"任务",
    	USER_NAMECN :"用户",
    	FILE_NUM :"文件数",
    	FILE_TOTALSIZE :"总大小(MB)",
    	JOB_TYPE_NAME :"业务类型",
    	MAP_RED:"MAP/RED",
    	QUEUE:"队列",
    	SUCCESS:"成功/失败",
        SCHEDULE:"进度",
        START_TIME:"开始时间",
        opt:"操作"
    },"JOB_NAME,USER_NAMECN,FILE_NUM,FILE_TOTALSIZE,JOB_TYPE_NAME,MAP_RED,QUEUE,SUCCESS,SCHEDULE,START_TIME,OPT,LOG_ID,LOG_ID_");
    dataTable.setRowIdForField("LOG_ID_");
    dataTable.setPaging(false);//分页

    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("20,5,6,10,12,8,5,8,6,12,8");
    dataTable.setGridColumnCfg(0,{align:"left"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    dataTable.setGridColumnCfg(5,{align:"center"});
    dataTable.setGridColumnCfg(6,{align:"center"});
    dataTable.setGridColumnCfg(7,{align:"center"});
    dataTable.setGridColumnCfg(8,{align:"center"});
    dataTable.setGridColumnCfg(9,{align:"center"});
    dataTable.setGridColumnCfg(10,{align:"center"});
    dataTable.setFormatCellCall(function(rid,cid,data,colId){

    	if(colId=="FILE_TOTALSIZE"){
    		if(data[cid]==-1){
    			return "";
    		}else{
    			var num = data[cid]/1024/1024
	    		return num.toFixed(2);
    		}
    	}
    	
    	if(colId=="SUCCESS"){
    		return "<span style=\"color: green;\">"+data[cid]+"</span>/<span style=\"color: red;\">"+dataTable.getUserData(rid,"FAILURE")+"</span>";
    	}
    	if(colId=="JOB_NAME"){
    		 if(dataTable.getUserData(rid,"TASK_JOB_TYPE")==0){
    		 	return "<image src='images/Download.png'/>"+data[cid];
    		 }
    		 if(dataTable.getUserData(rid,"TASK_JOB_TYPE")==1){
    		 	return "<image src='images/Upload.png'/>"+data[cid];
    		 }
    		 if(dataTable.getUserData(rid,"TASK_JOB_TYPE")==2){
    		 	return "<image src='images/Settings.png'/>"+data[cid];
    		 }
    	}
        if(colId=="OPT"){
        	var LOG_ID = dataTable.getUserData(rid,"LOG_ID");
        	var TASK_TYPE = dataTable.getUserData(rid,"TASK_TYPE");
        	var JOB_NAME = dataTable.getUserData(rid,"JOB_NAME");
            var str = "";
        	str += "<a href='javascript:void(0)' onclick=\"openDetail('"+rid+"',"+TASK_TYPE+");return false;\">查看明细</a>";
            return str;
        }
        return data[cid];
    });
	return dataTable;
}


//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals["SEARCH_WORD"] = document.getElementById("S_SEARCH_WORD").value;
    termVals["JOB_TYPE"] = document.getElementById("S_JOB_TYPE").value;
    termVals["STATE"] = document.getElementById("S_STATE").value;
    
    dhx.showProgress("请求数据中");
    MonitorAction.getLogData(termVals,function(data){
        dhx.closeProgress();
        if(data)
        	//查询出数据后，必须显示调用绑定数据的方法
        	dataTable.bindData(data); 
    });
}

function openDetail(rid,task_type){
	if(task_type==1){
		 try{
	         openMenu("查看采集日志信息","/meta/module/monitor/monitorColDetail.jsp?LOG_ID_="+rid,"top","LOG_ID_VIEW="+rid);	
	     }catch(e) {
	         window.open(urlEncode(getBasePath()+"/meta/module/monitor/monitorColDetail.jsp?LOG_ID_="+rid),'LOG_ID_VIEW'+rid);
	     }
	}
	if(task_type==2){
		 try{
	         openMenu("查看处理日志信息","/meta/module/monitor/monitorJobDetail.jsp?LOG_ID_="+rid,"top","JOB_ID_VIEW="+rid);		
	     }catch(e) {
	         window.open(urlEncode(getBasePath()+"/meta/module/monitor/monitorJobDetail.jsp?LOG_ID_="+rid),'JOB_ID_VIEW'+rid);
	     }
	}
}

/**
 * 查看24小时的任务
 */
function showPreDay(){
	var url = "/meta/module/analysis/overallAnalysis.jsp?flag=1";
	try{
		openMenu("查看24小时间详细",url,"top",'viewPreDay=show');
	}catch(e){
		window.open(urlEncode(getBasePath()+url),'viewPreDayshow');
	}
}

dhx.ready(pageInit);
