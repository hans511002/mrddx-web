
var colDetailTable = null;//表格


//初始界面
function pageInit() {
    var termReq = TermReqFactory.createTermReq(1);
    
	colDetailTableInit();
	colDetailTable.setReFreshCall(renderData); 

	
    var queryBtn = document.getElementById("queryBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        colDetailTable.Page.currPageNum = 1;
        colDetailTable.refreshData();
    });

    //启动定时器
    MonitorAction.getMonitorConfig(function(data){
    	if(data.ISAUTOREFRESH==1){
    		webinterval = data.WEBINTERVAL;
    		timer();
    	}else{
    		renderChart();
		 	colDetailTable.refreshData();
    	}

    });

}
var t = null; 
var webinterval = 60000;
function timer() {  
 	renderChart();
 	colDetailTable.refreshData();
	t = setTimeout(timer, webinterval);//单位：毫秒 
} 

function renderData(dt,params){
	var sdata = {};
	sdata.LOG_ID_=log_id_;
	sdata.STATE = document.getElementById("S_STATE").value;
	MonitorAction.getLogDetailData(sdata,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
	var total = 0;
    if(data && data[0])
        total = data[0]["TOTAL_COUNT_"];
    	//查询出数据后，必须显示调用绑定数据的方法
    	colDetailTable.bindData(data,total); 
    });
}

function renderChart()
{	
	var sdata = {};
	sdata.LOG_ID_=log_id_;
    MonitorAction.getLogDetailInfo(sdata,function(data){
		var datastr = '<chart decimals="0" >';
		datastr += '<categories><category label="运行中"/><category label="成功数"/><category label="失败数"/></categories>';
			var SUCCESS = data.SUCCESS;
			var FAILURE = data.FAILURE;
			var MAP_SUCCESS = data.MAP_SUCCESS;
			var REDUCE_SUCCESS = data.REDUCE_SUCCESS;
			var MAP_FAILURE = data.MAP_FAILURE;
			var REDUCE_FAILURE = data.REDUCE_FAILURE;
			var MAP_RUNING = data.MAP_RUNING;
			var REDUCE_RUNING = data.REDUCE_RUNING;
			
			document.getElementById("JOB_NAME_SP").innerHTML=data.JOB_NAME;
			document.getElementById("FILE_NUM_SP").innerHTML=data.FILE_NUM;
			document.getElementById("JOB_TYPE_NAME_SP").innerHTML=data.JOB_TYPE_NAME;
			document.getElementById("FILE_TOTALSIZE_SP").innerHTML=(data.FILE_TOTALSIZE/1024/1024).toFixed(2)+"(MB)";
			document.getElementById("SUCCESS_SP").innerHTML=data.SUCCESS;
			document.getElementById("FAILURE_SP").innerHTML=data.FAILURE;
			document.getElementById("START_TIME_SP").innerHTML=data.START_TIME;


		datastr+='<dataset seriesName="MAP" color="AFD8F8">';
		datastr+='<set value="'+MAP_RUNING+'"/>';
		datastr+='<set value="'+MAP_SUCCESS+'"/>';
		datastr+='<set value="'+MAP_FAILURE+'"/>';
		datastr+='</dataset>';
		datastr+='<dataset seriesName="REDUCE" color="F6BD0F">';
		datastr+='<set value="'+REDUCE_RUNING+'"/>';
		datastr+='<set value="'+REDUCE_SUCCESS+'"/>';
		datastr+='<set value="'+REDUCE_FAILURE+'"/>';
		datastr+='</dataset>';
		datastr += '</chart>';
		var chart = new FusionCharts("../../resource/Charts/MSColumn2D.swf", "colDetailChar1", "70%", "160", "0", "1");
		chart.setXMLData(datastr);
	    chart.render("colDetailChar");
    });
	    	
}
	

//初始数据表格
function colDetailTableInit(){
	var dd = document.getElementById("colDetailTable");
    var pageContent = document.getElementById("pageContent");
    dd.style.width = pageContent.offsetWidth  + "px";
	dd.style.height = pageContent.offsetHeight-190 + "px";
    colDetailTable = new meta.ui.DataTable("colDetailTable");//第二个参数表示是否是表格树
    colDetailTable.setColumns({
    	TASK_ID :"详情ID",
    	START_DATE :"开始时间",
    	END_DATE :"结束时间",
        TASK_TYPE:"类型",
    	INPUT_COUNT :"输入数量",
    	OUTPUT_COUNT :"输出数量",
    	RUN_FLAG:"运行状态",
    	LOG_MSG:"日志信息"
    },"TASK_ID,START_DATE,END_DATE,TASK_TYPE,INPUT_COUNT,OUTPUT_COUNT,RUN_FLAG,LOG_MSG");
    colDetailTable.setRowIdForField("TASK_ID");
    colDetailTable.setPaging(true,20);//分页

    colDetailTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    colDetailTable.grid.setInitWidthsP("20,15,15,10,10,10,10,10");
    colDetailTable.setGridColumnCfg(0,{align:"left"});
    colDetailTable.setGridColumnCfg(1,{align:"center"});
    colDetailTable.setGridColumnCfg(2,{align:"center"});
    colDetailTable.setGridColumnCfg(3,{align:"center"});
    colDetailTable.setGridColumnCfg(4,{align:"center"});
    colDetailTable.setGridColumnCfg(5,{align:"center"});
    colDetailTable.setGridColumnCfg(6,{align:"center"});
    colDetailTable.setGridColumnCfg(7,{align:"center"});
    colDetailTable.setGridColumnCfg(8,{align:"center"});
    colDetailTable.setGridColumnCfg(9,{align:"center",tip:1});
    colDetailTable.setFormatCellCall(function(rid,cid,data,colId){

        if(colId=="RUN_FLAG"){
        	if( colDetailTable.getUserData(rid,"RUN_FLAG")==0){
				return "初始化";
			}
			if( colDetailTable.getUserData(rid,"RUN_FLAG")==1){
				return "成功";
			}
			if( colDetailTable.getUserData(rid,"RUN_FLAG")==2){
				
				return "失败";
			}
        }
        if(colId=="TASK_ID"){
        	if(colDetailTable.getUserData(rid,"TASK_TYPE")=="MAP"){
	        	return "<a href='javascript:void(0)' onclick='opMapDetail(\""
						+ data[cid]
						+ "\");return false;'>"+data[cid]+"</a>";
	        	}
        	else{
	        	return "<a href='javascript:void(0)' onclick='opReduceDetail(\""
						+ data[cid]
						+ "\");return false;'>"+data[cid]+"</a>";
        	}
        }
        return data[cid];
    });
	return colDetailTable;
}

function opMapDetail(task_id){
	try{
         openMenu("MAP日志详情","/meta/module/bigdata/mrddx/log/map/jobMapMsgLog.jsp?mapTaskId="+task_id,"top","MAP_ID_VIEW="+task_id);		
     }catch(e) {
         window.open(urlEncode(getBasePath()+"/meta/module/bigdata/mrddx/log/map/jobMapMsgLog.jsp?mapTaskId="+task_id),'MAP_ID_VIEW'+task_id);
     }
}

function opReduceDetail(task_id){
	try{
         openMenu("REDUCE日志详情","/meta/module/bigdata/mrddx/log/reduce/jobReduceMsgLog.jsp?mapTaskId="+task_id,"top","REDUCE_ID_VIEW="+task_id);			
     }catch(e) {
         window.open(urlEncode(getBasePath()+"/meta/module/bigdata/mrddx/log/reduce/jobReduceMsgLog.jsp?mapTaskId="+task_id),'REDUCE_ID_VIEW'+task_id);
     }
	
}

dhx.ready(pageInit);
