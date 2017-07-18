
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
	sdata.STATE = document.getElementById("S_STATE").value;
	
    MonitorAction.getLogDetailInfo(sdata,function(data){
		var datastr = '<chart showBorder="1" imageSave="1" >';
			var SUCCESS = data.SUCCESS;
			var FAILURE = data.FAILURE;
			var FAILURE_OUTPUT_RENAME = data.FAILURE_OUTPUT_RENAME;
			var FAILURE_MOVE_OUTPUT = data.FAILURE_MOVE_OUTPUT;
			var FAILURE_DELETE_INPUT = data.FAILURE_DELETE_INPUT;
			var FAILURE_MOVE_INPUT = data.FAILURE_MOVE_INPUT;
			var FAILURE_INPUT_RENAME = data.FAILURE_INPUT_RENAME;
			
			document.getElementById("JOB_NAME_SP").innerHTML=data.JOB_NAME;
			document.getElementById("FILE_NUM_SP").innerHTML=data.FILE_NUM;
			document.getElementById("JOB_TYPE_NAME_SP").innerHTML=data.JOB_TYPE_NAME;
			document.getElementById("FILE_TOTALSIZE_SP").innerHTML=(data.FILE_TOTALSIZE/1024/1024).toFixed(2)+"(MB)";
			document.getElementById("SUCCESS_SP").innerHTML=data.SUCCESS;
			document.getElementById("FAILURE_SP").innerHTML=data.FAILURE;
			document.getElementById("START_TIME_SP").innerHTML=data.START_TIME;

			
			datastr+='<set label="总成功数" value="'+SUCCESS+'" />';
			datastr+='<set label="总失败数" value="'+FAILURE+'" />';
			datastr+='<set label="删除输入文件失败" value="'+FAILURE_DELETE_INPUT+'" />';
			datastr+='<set label="移动输入文件失败" value="'+FAILURE_MOVE_INPUT+'" />';
			datastr+='<set label="重命名输入文件失败" value="'+FAILURE_INPUT_RENAME+'" />';
			datastr+='<set label="移动输出文件失败" value="'+FAILURE_MOVE_OUTPUT+'" />';
			datastr+='<set label="重命名输出件失败" value="'+FAILURE_OUTPUT_RENAME+'" />';
		datastr += '</chart>';
		
		var chart = new FusionCharts("../../resource/Charts/Column2D.swf", "colDetailChar1", "70%", "160", "0", "1");
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
    	ID :"详情ID",
    	START_TIME :"开始时间",
    	END_TIME :"结束时间",
        FILE_SIZE:"文件大小(MB)",
        STATUS:"状态",
    	INPUT_FILE_NAME :"输入文件名",
    	OUTPUT_FILE_NAME :"输出文件名",
    	INPUT_PATH:"输入路径",
    	OUTPUT_PATH:"输出路径",
    	IS_OUTPUT_RENAME:"是否输出重命名",
		OUTPUT_RENAME:"输出文件重命名",
		OUTPUT_RENAME_STATUS:"输出重命名状态",
		IS_MOVE_OUTPUT:"是否移动出处文件",
		MOVE_OUTPUT_PATH:"输出文件移动路径",
		MOVE_OUTPUT_STATUS:"输出文件移动状态",
		IS_DOINPUTFILETYPE:"是否处理输入文件",
		DELETE_INPUT_STATUS:"删除输入文件状态",
		MOVE_INPUT_PATH:"移动输入文件路径",
		MOVE_INPUT_STATUS:"移动输入文件状态",
		INPUT_RENAME:"输入文件重命名",
		INPUT_RENAME_STATUS:"重命名输入文件状态"
    },"ID,START_TIME,END_TIME,FILE_SIZE,STATUS,INPUT_FILE_NAME,OUTPUT_FILE_NAME,"+
"INPUT_PATH,OUTPUT_PATH,IS_OUTPUT_RENAME,OUTPUT_RENAME,OUTPUT_RENAME_STATUS,IS_MOVE_OUTPUT,"+
"MOVE_OUTPUT_PATH,MOVE_OUTPUT_STATUS,IS_DOINPUTFILETYPE,DELETE_INPUT_STATUS,MOVE_INPUT_PATH,"+
"MOVE_INPUT_STATUS,INPUT_RENAME,INPUT_RENAME_STATUS");
    colDetailTable.setRowIdForField("ID");
    colDetailTable.setPaging(true,20);//分页

    colDetailTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    colDetailTable.grid.setInitWidthsP("5,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10");
    colDetailTable.setGridColumnCfg(0,{align:"left"});
    colDetailTable.setGridColumnCfg(1,{align:"center"});
    colDetailTable.setGridColumnCfg(2,{align:"center"});
    colDetailTable.setGridColumnCfg(3,{align:"center"});
    colDetailTable.setGridColumnCfg(4,{align:"center"});
    colDetailTable.setGridColumnCfg(5,{align:"center"});
    colDetailTable.setGridColumnCfg(6,{align:"center"});
    colDetailTable.setGridColumnCfg(7,{align:"center"});
    colDetailTable.setGridColumnCfg(8,{align:"center"});
    colDetailTable.setGridColumnCfg(9,{align:"center"});
    colDetailTable.setGridColumnCfg(10,{align:"center"});
    colDetailTable.setGridColumnCfg(11,{align:"center"});
    colDetailTable.setGridColumnCfg(12,{align:"center"});
    colDetailTable.setGridColumnCfg(13,{align:"center"});
    colDetailTable.setGridColumnCfg(14,{align:"center"});
    colDetailTable.setGridColumnCfg(15,{align:"center"});
    colDetailTable.setGridColumnCfg(16,{align:"center"});
    colDetailTable.setGridColumnCfg(17,{align:"center"});
    colDetailTable.setGridColumnCfg(18,{align:"center"});
    colDetailTable.setGridColumnCfg(19,{align:"center"});
    colDetailTable.setGridColumnCfg(20,{align:"center",tip:1});
    colDetailTable.setFormatCellCall(function(rid,cid,data,colId){

    	if(colId=="FILE_SIZE"){
		  	var num = data[cid]/1024/1024
    		return num.toFixed(2);
    	}
    	if(colId=="FILE_ID"){
    		if(data[cid]==-1){
    			return "";
    		}
    		return data[cid];
    	}
        if(colId=="STATUS"){
        	if( colDetailTable.getUserData(rid,"STATUS")==0){
				return "初始化";
			}
			if( colDetailTable.getUserData(rid,"STATUS")==1){
				return "成功";
			}
			if( colDetailTable.getUserData(rid,"STATUS")==2){
				return "失败";
			}
			return "";
        }
        if(colId=="IS_OUTPUT_RENAME"){
        	if( colDetailTable.getUserData(rid,"IS_OUTPUT_RENAME")==0){
				return "不需要重命名输出文件";
			}
			if( colDetailTable.getUserData(rid,"IS_OUTPUT_RENAME")==1){
				return "需要重命名输出文件";
			}
			return "";
        }
        if(colId=="OUTPUT_RENAME_STATUS"){
        	if( colDetailTable.getUserData(rid,"OUTPUT_RENAME_STATUS")==0){
				return "成功重命名输出文件";
			}
			if( colDetailTable.getUserData(rid,"OUTPUT_RENAME_STATUS")==1){
				return "失败重命名输出文件";
			}
			return "";
        }
        if(colId=="IS_MOVE_OUTPUT"){
        	if( colDetailTable.getUserData(rid,"IS_MOVE_OUTPUT")==0){
				return "不需要移动";
			}
			if( colDetailTable.getUserData(rid,"IS_MOVE_OUTPUT")==1){
				return "需要移动";
			}
			return "";
        }
        if(colId=="MOVE_OUTPUT_STATUS"){
        	if( colDetailTable.getUserData(rid,"MOVE_OUTPUT_STATUS")==0){
				return "成功移动输出文件";
			}
			if( colDetailTable.getUserData(rid,"MOVE_OUTPUT_STATUS")==1){
				return "失败移动输出文件";
			}
			return "";
        }
        if(colId=="IS_DOINPUTFILETYPE"){
        	if( colDetailTable.getUserData(rid,"IS_DOINPUTFILETYPE")==0){
				return "不处理";
			}
			if( colDetailTable.getUserData(rid,"IS_DOINPUTFILETYPE")==1){
				return "删除源文件";
			}
			if( colDetailTable.getUserData(rid,"IS_DOINPUTFILETYPE")==2){
				return "移动源文件到目标目录";
			}
			if( colDetailTable.getUserData(rid,"IS_DOINPUTFILETYPE")==3){
				return "移动源文件并重命名";
			}
			if( colDetailTable.getUserData(rid,"IS_DOINPUTFILETYPE")==4){
				return "重命名";
			}
			return "";
        }
        if(colId=="DELETE_INPUT_STATUS"){
        	if( colDetailTable.getUserData(rid,"DELETE_INPUT_STATUS")==0){
				return "成功删除输入文件";
			}
			if( colDetailTable.getUserData(rid,"DELETE_INPUT_STATUS")==1){
				return "失败删除输入文件";
			}
			return "";
        }
        if(colId=="MOVE_INPUT_STATUS"){
        	if( colDetailTable.getUserData(rid,"MOVE_INPUT_STATUS")==0){
				return "成功移动输入文件";
			}
			if( colDetailTable.getUserData(rid,"MOVE_INPUT_STATUS")==1){
				return "失败移动输入文件";
			}
			return "";
        }
        if(colId=="INPUT_RENAME_STATUS"){
        	if( colDetailTable.getUserData(rid,"INPUT_RENAME_STATUS")==0){
				return "成功重命名源文件";
			}
			if( colDetailTable.getUserData(rid,"INPUT_RENAME_STATUS")==1){
				return "失败重命名源文件";
			}
			return "";
        }
        return data[cid];
    });
	return colDetailTable;
}


dhx.ready(pageInit);
