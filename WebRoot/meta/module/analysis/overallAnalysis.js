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
 
 var chartData = null;
 var chartFailData = null;
 //var chartCollectData = null;
 //var chartDealData = null;
 var chartColDealData = null;
 var chartCountData = null;
 var mrType = null;
 //var chartQueryData = null;
 var dataTable = null;//表格
 var monthNum =0;
 var termReq = null;
 var offWidth = 0;//宽
 var timeArr = ["00点","01点","02点","03点","04点","05点","06点","07点","08点","09点","10点","11点","12点",
                "13点","14点","15点","16点","17点","18点","19点","20点","21点","22点","23点"];
 
 
 /**
 * 初始化
 */
function initData(){
	
	addToolBar();
	offWidth = document.body.offsetWidth-117;
	termReq = TermReqFactory.createTermReq(1);
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
        enddate.myCalendar.setSensitiveRange(document.getElementById("startDate").value,getFormatDay());
    });
    enddate.myCalendar.attachEvent("onClick",function(){
        startdate.myCalendar.setSensitiveRange(null,document.getElementById("endDate").value);
    });
    
    var reset1Btn = document.getElementById("reset1");
    attachObjEvent(reset1Btn,"onclick",function(){
        termReq.getTermControl("START_DATE").clearValue(true);
        var now = new Date();
        if(document.getElementById("endDate").value)
            startdate.myCalendar.setSensitiveRange(null,document.getElementById("endDate").value);
        else
            startdate.myCalendar.setSensitiveRange(null,getFormatDay());
        enddate.myCalendar.setSensitiveRange(null,getFormatDay());
        termReq.getTermControl("START_DATE").inited = 1;
    });
    var reset2Btn = document.getElementById("reset2");
    attachObjEvent(reset2Btn,"onclick",function(){
        termReq.getTermControl("END_DATE").clearValue(true);
        var now = new Date();
        if(document.getElementById("startDate").value)
            enddate.myCalendar.setSensitiveRange(document.getElementById("startDate").value,getFormatDay());
        else
            enddate.myCalendar.setSensitiveRange(null,getFormatDay());
        startdate.myCalendar.setSensitiveRange(null,getFormatDay());
        termReq.getTermControl("END_DATE").inited = 1;
    });
    
    var queryBtn = document.getElementById("queryBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        show_charts(null);
    });
    
	show_charts(null); 
}



function show_charts(param){
	//dhx.showProgress("数据加载中...");
   var queryParam = {};
   var now = new Date();
   if(param!=null){
   	  queryParam.MONTH = param;
   	  monthNum = param;
   	  if(param==-1){
   	  	$("startDate").value = getFormatToday();
   	  	$("endDate").value = getFormatDay();
   	  }else if(param==1){
   	  	$("startDate").value = preMonth(1);
   	  	$("endDate").value = getFormatDay();
   	  }else if(param==3){
   	  	$("startDate").value = preMonth(3);
   	  	$("endDate").value = getFormatDay();
   	  }else if(param==6){
   	  	$("startDate").value = preMonth(6);
   	  	$("endDate").value = getFormatDay();
   	  }
   }
   queryParam.START_DATE = document.getElementById("startDate").value;
   queryParam.END_DATE = document.getElementById("endDate").value;	 
   if(dataTable==null){
	   if(v_flag==0){
		   queryParam.START_DATE = preWeekDay();
		  	queryParam.END_DATE = getFormatDay();
	   }else if(v_flag==1){
		   queryParam.START_DATE = preDay();
		   queryParam.END_DATE = getFormatDay();
	   }
 	}
   
	 if (queryParam.START_DATE == null || queryParam.END_DATE == null
	   || queryParam.START_DATE.length ==0 || queryParam.END_DATE.length ==0 ){
		dhx.alert("时间区间不能为空，请填写");
		return;
	}
	 
    AnalysisAction.queryAnalysisData(queryParam,{
    async:false,
    callback:function(data){
   		 if (data != null && data != "") {
   		 	chartData = data.CHART_DATA;
   		 	chartFailData = data.CHART_FAIL_DATA;
   		 	chartColDealData = data.CHART_COLLECT_DEAL_DATA;
   		 	mrType = data.MR_TYPE;
   		 	showAnalysisData();
    	}
     }
   });
   // dhx.closeProgress();
   if(dataTable==null){
   		dataTableInit(); //初始数据表格  初始之后dataTable才会被实例化
		dataTable.setReFreshCall(queryData); //设置表格刷新的回调方法，即实际查询数据的方法
		termReq.init(function(termVals){
        termReq.getTermControl("START_DATE").myCalendar.setSensitiveRange(null,getFormatDay());
        
        if(v_flag==0){
        	termReq.getTermControl("END_DATE").myCalendar.setSensitiveRange(preWeekDay(),getFormatDay());
        	$("startDate").value = preWeekDay();
            $("endDate").value = getFormatDay();
        }else if(v_flag==1){
        	termReq.getTermControl("END_DATE").myCalendar.setSensitiveRange(preDay(),getFormatDay());
        	$("startDate").value = preDay();
            $("endDate").value = getFormatDay();
        }
	    
	    dataTable.refreshData();
	});
	}else{
   		dataTable.refreshData();
   }
   
}

//绘画 统计分布图
function showAnalysisData(){

		var dataCount = "<dataset seriesName='任务总数' color='1D8BD1' anchorBorderColor='1D8BD1' >";
		var dataFail = "<dataset seriesName='失败数' color='F1683C' anchorBorderColor='F1683C' >";
		var dataSuccess = "<dataset seriesName='成功数' color='91AF46' anchorBorderColor='91AF46'>";
		var dataXml = "<chart yAxisMinValue='0' yAxisMaxValue='10'   labelDisplay='rotate' yAxisName='任务数(个)' xAxisName='时间' slantLabels='1'  divIntervalHints='0, 600, 1200, 1800' palette='3' labelHeight='130'>"
		//var dataXml = "<chart  numdivlines='9' lineThickness='2' showValues='0' numVDivLines='22' formatNumberScale='1' labelDisplay='ROTATE' slantLabels='1' anchorRadius='2' anchorBgAlpha='50' showAlternateVGridColor='1' anchorAlpha='100' animation='1' limitsDecimalPrecision='0' divLineIsDashed='1' divLineDecimalPrecision='1'>";
			dataXml += "<categories >";
		var now = new Date();
		var timeTemp = v_flag==0?preWeekDay():preDay();
		var startTime = document.getElementById("startDate").value==""?timeTemp:document.getElementById("startDate").value;
		var endTime = document.getElementById("endDate").value==""?(getFormatDay()):document.getElementById("endDate").value;
		var arr = getHour(startTime,endTime);
		
		for(var k=0;k<arr.length;k++){
			var boolCheck = 0;
			for(var i=0;i<chartData.length;i++){
				if(arr[k]==chartData[i].DATA_NO){
					dataXml += "<category label='"+chartData[i].DATA_NO+"' />";
					dataFail += "<set value='"+chartData[i].FAIL+"' />";
					dataSuccess += "<set value='"+chartData[i].SUCCESS+"' />";
					dataCount += "<set value='"+chartData[i].TOTAL+"' />";
					boolCheck = 1;
					break;
				}
			}
			if(boolCheck==0){
				dataXml += "<category label='"+arr[k]+"' />";
				dataFail += "<set value='0' />";
				dataSuccess += "<set value='0' />";
				dataCount += "<set value='0' />";
			}
		}
			
		dataFail += "</dataset>";
		dataCount += "</dataset>";
		dataSuccess += "</dataset>";
		dataXml += "</categories>";
		
		dataXml = dataXml+ dataSuccess+ dataFail+dataCount+"</chart>";
		
		var chart = new FusionCharts("../../resource/Charts/ZoomLine.swf",
									"ChartId", offWidth, "400", "0", "0");
		chart.setDataXML(dataXml);
		chart.render("chartAnalysis");
	//if(chartFailData!=null&&chartFailData!=""){
		var dataFailCount = "<dataset seriesName='失败数'  color='F1683C' anchorBorderColor='F1683C' >";
		var dataFailXml = "<chart  yAxisMinValue='0' yAxisMaxValue='10' caption='失败数' yAxisName='失败数(个)' xAxisName='时间点' lineThickness='1' showValues='0' "
				+"formatNumberScale='0' anchorRadius='2' "  
				+"divLineAlpha='20' divLineColor='F1683C' divLineIsDashed='1' showAlternateHGridColor='1' alternateHGridColor='F1683C' shadowAlpha='40' labelStep='2' numvdivlines='5' chartRightMargin='35'  bgAngle='270' bgAlpha='10,10' alternateHGridAlpha='5'  legendPosition ='RIGHT '>";
		dataFailXml += "<categories >";
//		if(chartFailData.length==0){
//			dataFailXml += "<category label='' />";
//			dataFailCount += "<set value=''  />";
//		}
		for(var k=0;k<timeArr.length;k++){
			 var booleanCheck = 0;
			for(var i=0;i<chartFailData.length;i++){
				if(timeArr[k]==chartFailData[i].DATE_HOUR){
					dataFailXml += "<category label='"+chartFailData[i].DATE_HOUR+"' />";
					dataFailCount += "<set value='"+chartFailData[i].COUNT+"' link='JavaScript:myJS(&quot;"+chartFailData[i].DATE_HOUR.substr(0,2)+"&quot;);'  />";
					booleanCheck = 1;
					break;
				}
			}
			if(booleanCheck==0){
				dataFailXml += "<category label='"+timeArr[k]+"' />";
				dataFailCount += "<set value='0' />";
			}
		}
		dataFailXml += "</categories>";
		dataFailCount += "</dataset>";
		dataFailXml = dataFailXml+dataFailCount;
		var dataEnd = "<styles><definition><style name='CaptionFont' type='font' size='12'/>"
                +"</definition><application><apply toObject='CAPTION' styles='CaptionFont' />"
                +"<apply toObject='SUBCAPTION' styles='CaptionFont' /></application></styles>";
		dataFailXml = dataFailXml + dataEnd+ "</chart>";
		var chartFail = new FusionCharts("../../resource/Charts/MSLine.swf",
									"ChartFailId", offWidth/2, "300", "0", "0");
		chartFail.setDataXML(dataFailXml);
		chartFail.render("chartFail");
	
		var dataColDealXml = "<chart pYAxisMinValue='0' pYAxisMaxValue='10'  numberScaleUnit='KB,M,G,T' numberScaleValue='1024,1024,1024,1024' sYAxisMinValue='0' sYAxisMaxValue='10'  palette='1' pYAxisName='采集数(文件大小)'  xAxisName='任务名称' sYAxisName='处理量(条)' rotateNames='0' animation='1'  numdivlines='4'  baseFont='Arial' baseFontSize='12' useRoundEdges='1' legendBorderAlpha='0'>";
			dataColDealXml += "<categories >";
			dataCate = "";
			dataCol = "<dataset seriesname='按采集统计' color='9ACCF6' alpha='90' showValues='0' >";
			dataDeal = "<dataset seriesname='按处理统计' color='82CF27'  showValues='0' alpha='90' parentYAxis='S'>";
			for(var i=0;i<chartColDealData.length;i++){
				dataCate += "<category label='"+chartColDealData[i].TYPE_NAME+"' />";
				dataCol += "<set value='"+chartColDealData[i].COL_COUNT+"' />";
				dataDeal += "<set value='"+chartColDealData[i].DEAL_COUNT+"' />";
			}
			if(chartColDealData.length==0){
				dataCate += "<category label='' />";
				dataCol += "<set value='' />";
				dataDeal += "<set value='' />";
			}
			dataCate += "</categories>";
			dataCol += "</dataset>";
			dataDeal += "</dataset>";
			
			
			dataColDealXml = dataColDealXml + dataCate +dataCol+dataDeal+"</chart>";
		
			var chartColDeal = new FusionCharts("../../resource/Charts/MSCombiDY2D.swf",
									"ChartColDealId", (offWidth/2-20), "300", "0", "0");
				chartColDeal.setDataXML(dataColDealXml);
				chartColDeal.render("chartCollectDeal");
		
}

function myJS(param1){
	var sDate = document.getElementById("startDate").value;
	var eDate = document.getElementById("endDate").value;
	try{
        openMenu("查看任务("+objName+")","/meta/module/analysis/showFailList.jsp?failTime="+param1,"top","objId_"+param1);
    }catch(e) {
        window.open(urlEncode(getBasePath()+"/meta/module/analysis/showFailList.jsp?failTime='"+param1+"'&sDate='"+sDate+"'&eDate='"+eDate+"'"),'objId_'+param1);
    }
} 

//初始化表格
function dataTableInit(){
	dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
        NAME:"名称",    	
        TOTAL:"任务总数",
        SUCCESS:"成功数",
        FAIL:"失败数",
        SUCCESS_RATE:"成功率"
    },"NAME,TOTAL,SUCCESS,FAIL,SUCCESS_RATE");
    dataTable.setPaging(false);//分页
    
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("20,20,20,20,20");
    dataTable.setGridColumnCfg(0,{align:"left"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
    	
    	if(colId=="NAME"){
			return "<a href='javascript:void(0)' onclick='showWork("+rid+");return false;'>"+data[cid]+"</a>"    		
    	}else if(colId=="SUCCESS_RATE"){
    		return Number(Math.round(data[2]/data[1]*10000)/100).toFixed(2)+'%';
    	}
        return data[cid];
    });

    return dataTable;
}

function showWork(rid){
	var objId = dataTable.getUserData(rid,"JOB_TYPE");
    var objName = dataTable.getUserData(rid,"NAME");
    var startDate = document.getElementById("startDate").value;
    var endDate = document.getElementById("endDate").value;
    
    var url = "/meta/module/analysis/partAnalysis.jsp?workId="+objId+"&startDate='"+startDate+"'&endDate='"+endDate+"'&workName="+objName;
    try{
         openMenu("查看任务("+objName+")",url,"top","objId_"+objId);
     }catch(e) {
         window.open(urlEncode(getBasePath()+url),'objId_'+objId);
     }
}

//查询表格数据
function queryData(dt,params){
        var termVals = TermReqFactory.getTermReq(1).getKeyValue();
//        termVals.MONTH = monthNum;
        termVals.START_DATE = document.getElementById("startDate").value;
   		termVals.END_DATE = document.getElementById("endDate").value;
        //dhx.showProgress("请求数据中");
        AnalysisAction.queryChartDataInfo(termVals,function(data){
        	//dhx.closeProgress();
        	var total = 0;
        	if(data&&data.length>0){
        		total = data[0]["TOTAL_COUNT_"];
        	}
        	dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法 
        });
}

//得到本周第一天
function  preWeekDay(){
	var now = new Date();
	var start = new Date();
	start.setDate(now.getDate() - 7);//取得一周内的第一天、第二天、第三天...
	return start.getFullYear()+"-"+((start.getMonth()+1)<10?("0"+(start.getMonth()+1)):(start.getMonth()+1))+"-"
	+(start.getDate()<10?("0"+start.getDate()):start.getDate())+" "+(start.getHours()<10?("0"+start.getHours()):start.getHours())+":"
	+(start.getMinutes()<10?("0"+start.getMinutes()):start.getMinutes())+":00";
}

//得到几个月之前的日志
function preMonth(month){
	var intDate = new Date();
	var start = new Date();
	start.setMonth(intDate.getMonth()-month);
	return start.getFullYear()+"-"+((start.getMonth()+1)<10?("0"+(start.getMonth()+1)):(start.getMonth()+1))+"-"
	+(start.getDate()<10?("0"+start.getDate()):start.getDate())+" "+(start.getHours()<10?("0"+start.getHours()):start.getHours())+":"
	+(start.getMinutes()<10?("0"+start.getMinutes()):start.getMinutes())+":00";
}

function addToolBar(){
	var toolbarData = {
	        parent: "missTypeToolObj",
	        icon_path: "../../../../meta/resource/images/",
	        items: [{
	            type: "text",
	            id: "adds_bt",
	            text: "按业务类型统计"
	           // img: "addRole.png",
	          //  tooltip: "设置批量权限"
	        }]
		};
	     new dhtmlXToolbarObject(toolbarData);
	    
	    var statisticalTooltatisticalbarData = {
	    		parent: "statisticalToolObj",
	    		icon_path: "../../../../meta/resource/images/",
	    		items: [{
	    			type: "text",
	    			id: "adds_bt",
	    			text: "统计分布图",
	    			// img: "addRole.png",
	    			//  tooltip: "设置批量权限"
	    		}]
	    };
	     new dhtmlXToolbarObject(statisticalTooltatisticalbarData);
	 	
	
	    
	
	    var failTooltatisticalbarData = {
	    		parent: "failToolObj",
	    		icon_path: "../../../../meta/resource/images/",
	    		items: [{
	    			type: "text",
	    			id: "adds_bt",
	    			text: "失败24小时的任务图",
	    			// img: "addRole.png",
	    			//  tooltip: "设置批量权限"
	    		}]
	    };
	     new dhtmlXToolbarObject(failTooltatisticalbarData);
	     
	     var colDealToolbarData = {
	    		 parent: "colDealToolObj",
	    		 icon_path: "../../../../meta/resource/images/",
	    		 items: [{
	    			 type: "text",
	    			 id: "adds_bt",
	    			 text: "按采集(文件大小)、处理(入库量)统计"
	    			 // img: "addRole.png",
	    			 //  tooltip: "设置批量权限"
	    		 }]
	     };
	     new dhtmlXToolbarObject(colDealToolbarData);
}



/**
 * 格式化今天时间，返回时分秒
 * @param start
 * @returns
 */
function getFormatDay(){
	var start = new Date();
	return start.getFullYear()+"-"+((start.getMonth()+1)<10?("0"+(start.getMonth()+1)):(start.getMonth()+1))+"-"
	+(start.getDate()<10?("0"+start.getDate()):start.getDate())+" "+(start.getHours()<10?("0"+start.getHours()):start.getHours())+":"
	+(start.getMinutes()<10?("0"+start.getMinutes()):start.getMinutes())+":00";
	
}



function getHalfHour(startTime,endTime){
	var arr = [];
	var arrTemp = [];
	startTime = startTime.substr(0,10);
	endTime = endTime.substr(0,10);

	var startDate = parseISO8601(startTime);
	var endDate = parseISO8601(endTime);
	var dayLength = getDayLength(startTime,endTime);
//	var startTemp = null;
	for(var i=0;i<=dayLength;i++){
		startDate.setDate(startDate.getDate()+i);
//		for(var k=0;k<getOneDay(startDate).length;k++){
//			arr.push(getOneDay(startDate)[k]);//得到一天的半个小时数组
//		}
		arrTemp.push(getOneDay(startDate));
		startDate = parseISO8601(startTime);
	}
	for(var m=0;m<arrTemp.length;m++){
		for(n=0;n<arrTemp[m].length;n++){
			arr.push(arrTemp[m][n]);
		}
	}
	return arr;
}


function getHour(startTime,endTime){
	var arr = [];
	var arrTemp = [];
	startTime = startTime.substr(0,10);
	endTime = endTime.substr(0,10);

	var startDate = parseISO8601(startTime);
	var endDate = parseISO8601(endTime);
	var dayLength = getDayLength(startTime,endTime);
//	var startTemp = null;
	for(var i=0;i<=dayLength;i++){
		startDate.setDate(startDate.getDate()+i);
//		for(var k=0;k<getOneDay(startDate).length;k++){
//			arr.push(getOneDay(startDate)[k]);//得到一天的半个小时数组
//		}
		arrTemp.push(getOneDayonhour(startDate));
		startDate = parseISO8601(startTime);
	}
	for(var m=0;m<arrTemp.length;m++){
		for(n=0;n<arrTemp[m].length;n++){
			arr.push(arrTemp[m][n]);
		}
	}
	return arr;
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
	

//得到一天的半个小时数组
function getOneDay(startDate){
	var startTime = startDate.getFullYear()+"-"+((startDate.getMonth()+1)<10?("0"+(startDate.getMonth()+1)):(startDate.getMonth()+1))+"-"+(startDate.getDate()<10?("0"+startDate.getDate()):startDate.getDate());
	var arrDay =[];
	var temp = "";
	var tempT = "";
	for(var i=0;i<24;i++){
		if(i<10){
			temp = startTime+" 0"+i+":00";
			tempT = startTime+" 0"+i+":30";
		}else{
			temp = startTime+" "+i+":00"
			tempT = startTime+" "+i+":30";
		}
		arrDay.push(temp);
		arrDay.push(tempT);
	}
	return arrDay;
}

//得到一天的一个小时数组
function getOneDayonhour(startDate){
	var startTime = startDate.getFullYear()+"-"+((startDate.getMonth()+1)<10?("0"+(startDate.getMonth()+1)):(startDate.getMonth()+1))+"-"+(startDate.getDate()<10?("0"+startDate.getDate()):startDate.getDate());
	var arrDay =[];
	var temp = "";
	var tempT = "";
	for(var i=0;i<24;i++){
		if(i<10){
			temp = startTime+" 0"+i+":00";
		}else{
			temp = startTime+" "+i+":00";
		}
		arrDay.push(temp);
	}
	return arrDay;
}
	
//将字节换算成M
function kbToM(kbNum){
	return Number(kbNum/1024/1024).toFixed(2);
}

function preDay(){
	var intDate = new Date();
	var start = new Date();
	start.setDate(intDate.getDate()-1);
	return start.getFullYear()+"-"+((start.getMonth()+1)<10?("0"+(start.getMonth()+1)):(start.getMonth()+1))+"-"
	+(start.getDate()<10?("0"+start.getDate()):start.getDate())+" "+(start.getHours()<10?("0"+start.getHours()):start.getHours())+":"
	+(start.getMinutes()<10?("0"+start.getMinutes()):start.getMinutes())+":00";
}
	
function getFormatToday(){
	var start = new Date();
	return start.getFullYear()+"-"+((start.getMonth()+1)<10?("0"+(start.getMonth()+1)):(start.getMonth()+1))+"-"
	+(start.getDate()<10?("0"+start.getDate()):start.getDate())+" 00:00:00";
}


dhx.ready(initData);