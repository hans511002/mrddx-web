var dataTable = null;//表格
var dataTopTable = null;//表格
var dataInputTable = null;//表格
var dataRsTable = null;//表格
var initmyChart2 = 0;
var initmyChart1 = 0;
var firstTypeId = "";
var firstTypeName = "";
var maintainWin = null;
var typeLen = 0;
var dd = null;
var chart1 = null;
var chart2 = null;
var firstRsId = -1;
var firstRsName = "";
var arrHour = ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00",
               "13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
var jsonServcie=new Object();
var paramServiceTable = null;
var arrService = new Array();
var serviceIdToChartId = {};//生成业务ID与CHARTID的MAP

//初始界面
function pageInit() {
	var termReq = TermReqFactory.createTermReq(1);
	paramServiceTable = $("serviceRs");
	var toolbar2 = {
	        parent: "ToolBar2",
	        items: [{type: "text",id: "adds_bt2",text: "12个月入库趋势图"}]};
	var toolbar3 = {
	        parent: "ToolBar3",
	        items: [{type: "text",id: "adds_bt3",text: "查询规则排行榜"}]};
	var toolbar4 = {
	        parent: "ToolBar4",
	        items: [{type: "text",id: "adds_bt4",text: "查询规则详情"}]};
	var toolbar5 = {
	        parent: "ToolBar5",
	        items: [{type: "text",id: "adds_bt5",text: "按月统计慢查询排行（耗时排名）"}]};
	var toolbar6 = {
	        parent: "ToolBar6",
	        items: [{type: "text",id: "adds_bt6",text: "30天统计指标结果"}]};
	var toolbar7 = {
	        parent: "ToolBar7",
	        items: [{type: "text",id: "adds_bt7",text: "统计指标>调用次数"}]};
    new dhtmlXToolbarObject(toolbar2);
    new dhtmlXToolbarObject(toolbar3);
    new dhtmlXToolbarObject(toolbar4);
    new dhtmlXToolbarObject(toolbar5);
    new dhtmlXToolbarObject(toolbar6);
    new dhtmlXToolbarObject(toolbar7);
    
    var start = new Date();
	var datano = start.getFullYear()+"-"+((start.getMonth()+1)<10?("0"+(start.getMonth()+1)):(start.getMonth()+1));
	
//    var myCalendar = new dhtmlXCalendarObject("dateNo",false,{isMonthEditable: true, isYearEditable: true});
//    myCalendar.loadUserLanguage("zh");
//	myCalendar.setDateFormat("%Y-%m");
//	myCalendar.hideTime();
	
	document.getElementById("dateNo").value=datano;
	
    
    var queryBtn = document.getElementById("queryBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        query();
    });
    
    var getRs = document.getElementById("getResult");
    attachObjEvent(getRs,"onclick",function(){
    	var results = document.getElementsByName("result");
    	for (var i = 0; i < results.length; i++) { 
    		var rs = results[i]; 
    		if (document.getElementById("getResult").checked) { 
    			rs.checked = "checked"; 
    		} 
    		else { 
    			rs.checked = ""; 
    		} 
    	}
    });
    
    var getRs = document.getElementById("getService");
    attachObjEvent(getRs,"onclick",function(){
    	var results = document.getElementsByName("service");
    	for (var i = 0; i < results.length; i++) { 
    		var rs = results[i]; 
    		if (document.getElementById("getService").checked) { 
    			rs.checked = "checked"; 
    		} 
    		else { 
    			rs.checked = ""; 
    		} 
    	}
    });
    
    var getWareHource = document.getElementById("warehouse");
    attachObjEvent(getWareHource,"onclick",function(){
    	var results = document.getElementsByName("image");
    	for (var i = 0; i < results.length; i++) { 
    		var rs = results[i]; 
    		if (document.getElementById("warehouse").checked) { 
    			rs.checked = "checked"; 
    		} 
    		else { 
    			rs.checked = ""; 
    		} 
    	}
    });
    
    var getWareHource = document.getElementById("rule");
    attachObjEvent(getWareHource,"onclick",function(){
    	var results = document.getElementsByName("ruleImage");
    	for (var i = 0; i < results.length; i++) { 
    		var rs = results[i]; 
    		if (document.getElementById("rule").checked) { 
    			rs.checked = "checked"; 
    		} 
    		else { 
    			rs.checked = ""; 
    		} 
    	}
    });
    
    
    
    var downloadBtn = document.getElementById("download");
    attachObjEvent(downloadBtn,"onclick",function(){
    	var title = "导出选项";
    	if(!maintainWin){
            maintainWin = DHTMLXFactory.createWindow("1","maintainWin",0,0,560,430);
            maintainWin.stick();
            maintainWin.denyResize();
            maintainWin.denyPark();
            maintainWin.button("minmax1").hide();
            maintainWin.button("park").hide();
            maintainWin.button("stick").hide();
            maintainWin.button("sticked").hide();
            maintainWin.center();

            var dataFormDIV = document.getElementById("dataFormDIV");
            maintainWin.attachObject(dataFormDIV);
            var downBtn = document.getElementById("downl");
            var calBtn = document.getElementById("calBtn");
            attachObjEvent(downBtn,"onclick",function(){
            	arrService = getService("service");//得到业务数组
            	if(arrService.length==0) {
            		dhx.alert("请至少选择一项业务！");
            		return false;
            	}
            	var strImage = getRsList("image");//导出的图片进行辨认
            	var exportTimes = 0;
            	
            	var exportService = new Array();
            	for(var i=0;i<arrService.length;i++){
            		for(var k=0;k<typeLen;k++){
            			if(serviceIdToChartId["ChLine"+k+"Id"]==arrService[i]){
                			exportService.push("ChLine"+k+"Id");
                		}
                		if(serviceIdToChartId["ChTop"+k+"Id"]==arrService[i]){
                			exportService.push("ChTop"+k+"Id");
                		}
            		}
            	}
            	for(var i=0;i<typeLen;i++){
            		var exportLine = "ChLine"+i+"Id";
            		var exportTop = "ChTop"+i+"Id";
            		if(strImage=="10"&&exportService.in_array(exportLine)){
            			  exportTimes =2;
            		}else if(strImage=="01"&&exportService.in_array(exportTop)){
            			 exportTimes = 2;
            		}else if(strImage=="11"&&exportService.in_array(exportLine)&&exportService.in_array(exportTop)){
                		 exportTimes = 2;
            		}
            	}
            	dhx.showProgress("生成文件中...","正在生成WORD文档...");
            	download();
            	
            });
            attachObjEvent(calBtn,"onclick",function(){maintainWin.close();});

            for(var k=0;k<Math.ceil(jsonServcie.length/2);k++){
        		setService(jsonServcie,k);//加载业务选项
        	}
            maintainWin.attachEvent("onClose",function(){
                maintainWin.setModal(false);
                this.hide();
                return false;
            });
        }
        maintainWin.setText(title);
        maintainWin.setModal(true);
        maintainWin.show();
        maintainWin.center();
    });
    
    dataTableInit(); 
    dataTable.setReFreshCall(queryData); 
    dataTopTableInit();
    dataTopTable.setReFreshCall(queryTopData); 
    dataInputTableInit();
    dataInputTable.setReFreshCall(queryInputData);
    dataRsTableInit();//加载统计结果指标
    dataRsTable.setReFreshCall(queryRsData);
    
 // 添加行点击事件
    dataRsTable.grid.attachEvent("onRowSelect",function(rid,ind){
    	if(rid!=1){
    	    dataRsTable.grid.setRowTextStyle(1, "font-weight:normal;font-style:normal;text-decoration:none;color:black;background-color:whrite;");
    	}
    	firstRsId = dataRsTable.getUserData(rid,"LA_ID");
    	firstRsName = dataRsTable.getUserData(rid,"NAME");
		selectPart(rid);
	});
    
    dd = document.getElementById("dataDiv");
    chart1  = new FusionCharts("../../swf/MSLine.swf", "ChLineId",dd.offsetWidth-280, "280", "0", "1");
    chart2 = new FusionCharts("../../swf/MSLine.swf", "ChTopId",dd.offsetWidth, "280", "0", "1"); 
    
  //数据开始
    UserTypeAction.queryTypeByUser(null,{
        async: false,
        callback: function(data){
        typeLen = data.length;
    	var paramsTD = document.getElementById("job_type");
	    paramsTD.options.length = 0; 
	    jsonServcie=getJsonService(data);
	    for(var m=0;m<data.length;m++){
	    	paramsTD.options[m] = new Option(data[m].TYPE_NAME,data[m].TYPE_ID);
	    	if(m>0){
	    		firstTypeId = data[0].TYPE_ID;
	    		firstTypeName = data[0].TYPE_NAME;
	    	}
	    }
    }
    });
    query();
    attachObjEvent(document.getElementById("job_type"),"onchange",query);
}

/**
 * 加载统计指标图形
 * @param missData
 */
function showRs(data,unit,rsName){
	var rsDataXml = getDataXml(data,unit,rsName);
	var chart = new FusionCharts("../../resource/Charts/MSLine.swf",
								"rsId", (dd.offsetWidth/2+140), "266", "0", "0");
	chart.setDataXML(rsDataXml);
	chart.render("showDataDiv");
}

//导出文档
function download(){
	window.setTimeout("dhx.closeProgress()","2000");
	var termVals = {};
	var downtype = getDownType();
	var date =document.getElementById("dateNo").value;
	var rs = getRsList("result");//得到统计指标结果列表
	var image = getRsList("image");//得到图形列表
	var lstTypeId = getServiceIdList();//得到业务列表
	var rule = getRsList("ruleImage");
	var srule = (document.getElementById("srule").checked?1:0);
	if(downtype==""){
		dhx.alert("请选择导出类型！");
		return;
	}else if(downtype=="1"){//导出WORD
    	var url  =  'downloadDayWord.jsp?type=2&dateTime='+date+'&rs='+rs+'&image='+image+'&rule='+rule+'&srule='+srule+'&lstTypeId='+lstTypeId;
		location.href = url;
	}else if(downtype=="2"){//导出EXCEL
		
	}
	
}

/**
 * 查询界面加载方法
 */
function query(){
	termVals = {};
	termVals["jobType"] = document.getElementById("job_type").value==""?firstTypeId:document.getElementById("job_type").value;
	var sObj =document.getElementById("job_type");
	termVals["typeName"] =sObj.options[sObj.selectedIndex].text==""?firstTypeName:sObj.options[sObj.selectedIndex].text;
    termVals["dateNo"] = document.getElementById("dateNo").value;
	dhx.showProgress("请求数据中");
	LogAnalysisAction.showAllDataM(termVals,function(data){
		queryTopFun(data.tempData,dataTable);
		dataInputTable.Page.currPageNum = 1;
		dataTopTable.Page.currPageNum = 1;
		dataInputTable.refreshData();
		dataTopTable.refreshData();
//		queryTopFun(data.inputData,dataInputTable);
//		queryTopFun(data.topData,dataTopTable);
		queryRsTable(data.zoomChart);
		lineChar(data.lineChart);
		lineTopChar(data.lineTopChart);
		dhx.closeProgress();
		
	});
}

/**
 * 查询方法
 * @param data
 */
function queryRsTable(data){
	var total = 0;
    if(data && data[0])
        total = data[0]["TOTAL_COUNT_"];
    	//查询出数据后，必须显示调用绑定数据的方法
    dataRsTable.bindData(data,total);
    firstRsId = data[0]["LA_ID"];
    firstRsName = data[0]["NAME"];
    selectPart(1);
}

//查询数据
function queryRsData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals["_COLUMN_SORT"] = params.sort;
    termVals["dateNo"] = document.getElementById("dateNo").value;
	termVals["jobType"] = document.getElementById("job_type").value==""?firstTypeId:document.getElementById("job_type").value;
    LogAnalysisAction.getLogAnalysis(termVals,function(data){
        if(data){
        	dataRsTable.bindData(data);
        }
        
    });
}

//查询方法
function queryTopFun(data,dataTableTemp){
	 var total = 0;
     if(data && data[0])
         total = data[0]["TOTAL_COUNT_"];
     	//查询出数据后，必须显示调用绑定数据的方法
     dataTableTemp.bindData(data,total);
     
     dataTableTemp.refreshData();
}

function lineTopChar(data,type) {
    var topCharXml = getTopCharXML(data);
	chart2.setXMLData(topCharXml);
	chart2.render("chartContainerLineTop");
}

function lineChar(data){
	var strXML = getXmlData(data);
	chart1.setXMLData(strXML);
	chart1.render("chartContainerLine");
}

function getXmlData(data){
	var strXML;
	strXML = "<chart canvasPadding='10' caption='"+(data.typeName==null?"":data.typeName)+"' yAxisName='入库条数(条)' bgColor='FFFFFF'" +
			" numVDivLines='10' divLineAlpha='30' labelDisplay='ROTATE'  labelPadding ='10' yAxisValuesPadding ='10' " +
			"showValues='0' rotateValues='1' valuePosition='auto'" +
			"exportEnabled='1' exportAction='save' defaultNumberScale='' yAxisMinValue='0' yAxisMaxValue='10' numberScaleUnit='万,亿,兆' numberScaleValue='10000,10000,10000'" +
			">";
	strXML += "<categories>";
	var arrDatanos = data.datanos;
	for(var i=0;i<arrDatanos.length;i++){
		strXML += "<category label='"+arrDatanos[i]+"' /> ";
	}
	strXML += "</categories>";
    strXML += "<dataset>";
    for(var j=0;j<data.datas.length;j++){
    	strXML += "<set value='"+data.datas[j]+"' />" ;
    }
	strXML +=  "</dataset>";
	strXML+='</chart>';
	return strXML;
}


//初始数据表格
function dataTableInit(){
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
    	QRY_RULE_ID :"查询规则ID",
        QRY_RULE_NAME:"查询规则名称",
        SCOUNT:"查询次数（次）",
        QRY_NUM:"返回记录数",
        QRY_SUM_NUM:"查询总记录数",
        QRY_SIZE:"返回数据报文大小(字节)",
        STIME:"平均耗时（MS/次）"
    },"QRY_RULE_ID,QRY_RULE_NAME,SCOUNT,QRY_NUM,QRY_SUM_NUM,QRY_SIZE,STIME");
    dataTable.setRowIdForField("QRY_RULE_ID");
    dataTable.setPaging(true,15);//分页
    dataTable.setSorting(true,{
        QRY_RULE_ID:"desc"
    });
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("10,20,10,10,10,20,20");
    
    dataTable.setGridColumnCfg(0,{align:"center"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    dataTable.setGridColumnCfg(5,{align:"center"});
    dataTable.setGridColumnCfg(6,{align:"center"});
    
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
        return data[cid];
    });
    return dataTable;
}
//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals["_COLUMN_SORT"] = params.sort;
    termVals["dateNo"] = document.getElementById("dateNo").value;
	termVals["jobType"] = document.getElementById("job_type").value==""?firstTypeId:document.getElementById("job_type").value;
    
    LogAnalysisAction.getLogAnalysisDetailM(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        	//查询出数据后，必须显示调用绑定数据的方法
        	dataTable.bindData(data,total); 
    });
}

/**
 * 初始化指标查询表格
 * @returns
 */
function dataRsTableInit(){
    dataRsTable = new meta.ui.DataTable("markDiv");//第二个参数表示是否是表格树
    dataRsTable.setColumns({
    	NAME:"名称",
    	UNIT_NAME:"单位",
    	RANGE:"范围",
    	value:"当前值"
    },"NAME,UNIT_NAME,RANGE,value");
    dataRsTable.setPaging(false);//分页
    dataRsTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataRsTable.grid.setInitWidthsP("20,20,40,20");
    dataRsTable.setGridColumnCfg(0,{align:"left"});
    dataRsTable.setGridColumnCfg(1,{align:"center"});
    dataRsTable.setGridColumnCfg(2,{align:"right"});
    dataRsTable.setGridColumnCfg(3,{align:"right"});
    dataRsTable.setFormatCellCall(function(rid,cid,data,colId){
    	if(colId == "RANGE"){
    		var range = dataRsTable.getUserData(rid,"RANGE");
    		return range;
    	}else if(colId == "VALUE"){
    		var colValue = dataRsTable.getUserData(rid,"COL_VALUE");
    		if(colValue==0){
    			return "<span style='color:red'>"+data[cid]+"</div>";
    		}
    	}
    	if(rid==1){
    		dataRsTable.grid.setRowTextStyle(rid, "font-weight:normal;font-style:normal;text-decoration:none;color:black;background-color:#FFDE96;");
       }
        return data[cid];
    });
    return dataRsTable;
}

//初始数据表格
function dataTopTableInit(){
    dataTopTable = new meta.ui.DataTable("dataTopDiv");//第二个参数表示是否是表格树
    dataTopTable.setColumns({
    	QRY_RULE_ID :"查询规则ID",
        QRY_RULE_NAME:"查询规则名称",
        TOTAL_TIME:"查询耗时",
        QRY_NUM:"返回记录数",
        QRY_SUM_NUM:"查询总记录数",
        QRY_SIZE:"返回数据报文大小(字节)",
        QRY_START_DATE:"查询时间"
    },"QRY_RULE_ID,QRY_RULE_NAME,TOTAL_TIME,QRY_NUM,QRY_SUM_NUM,QRY_SIZE,QRY_START_DATE");
    dataTopTable.setPaging(true,15);//分页
    dataTopTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTopTable.grid.setInitWidthsP("10,20,10,10,10,20,20");
    dataTopTable.setGridColumnCfg(0,{align:"center"});
    dataTopTable.setGridColumnCfg(1,{align:"center"});
    dataTopTable.setGridColumnCfg(2,{align:"center"});
    dataTopTable.setGridColumnCfg(3,{align:"center"});
    dataTopTable.setGridColumnCfg(4,{align:"center"});
    dataTopTable.setGridColumnCfg(5,{align:"center"});
    dataTopTable.setGridColumnCfg(6,{align:"center"});
    dataTopTable.setFormatCellCall(function(rid,cid,data,colId){
        return data[cid];
    });
    return dataTopTable;
}

//查询数据
function queryTopData(dt,params){
	var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals["_COLUMN_SORT"] = params.sort;
    termVals["dateNo"] = document.getElementById("dateNo").value;
	termVals["jobType"] = document.getElementById("job_type").value==""?firstTypeId:document.getElementById("job_type").value;
    LogAnalysisAction.getLogAnalysisTopDetailM(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        	//查询出数据后，必须显示调用绑定数据的方法
        	dataTopTable.bindData(data,total); 
    });
}

//初始数据表格
function dataInputTableInit(){
    dataInputTable = new meta.ui.DataTable("dataInputDiv");//第二个参数表示是否是表格树
    dataInputTable.setColumns({
    	PARAM_VALUE :"表名称",
    	INPUT_COUNT:"当月入库条数"
    },"PARAM_VALUE,INPUT_COUNT");
    dataInputTable.setPaging(false);//分页
    dataInputTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataInputTable.grid.setInitWidthsP("50,50");
    dataInputTable.setGridColumnCfg(0,{align:"center"});
    dataInputTable.setGridColumnCfg(1,{align:"center"});
    dataInputTable.setGridColumnCfg(2,{align:"center"});
    dataInputTable.setGridColumnCfg(3,{align:"center"});
    dataInputTable.setGridColumnCfg(4,{align:"center"});
    dataInputTable.setGridColumnCfg(5,{align:"center"});
    dataInputTable.setGridColumnCfg(6,{align:"center"});
    dataInputTable.setFormatCellCall(function(rid,cid,data,colId){
        return data[cid];
    });
    return dataInputTable;
}

/**
 * 构建XML文件
 * @param timeNum
 * @param unit
 * @param rsName
 * @returns {String}
 */
function getDataXml(data,unit,rsName){
	var zoneTimeDataXml = "<chart  yAxisMinValue='0' yAxisMaxValue='10'  " +
			"bgColor='FFFFFF' numVDivLines='22' defaultNumberScale='' yAxisMinValue='0' yAxisMaxValue='10' numberScaleUnit='万,亿,兆' numberScaleValue='10000,10000,10000'" +
			"divLineAlpha='30'  labelPadding ='10' yAxisValuesPadding ='10' " +
			"showValues='0' animation='0'  labelStep='2'  labelDisplay='Rotate' slantLabels='1'  valuePosition='auto'>";
	var zoneTimeDataSuccess = "";
	var zoneTimeDataCate = "";
	zoneTimeDataSuccess += "<dataset  color='A66EDD' >";
	zoneTimeDataCate += "<categories>";
	for(var i=0;i<data.length;i++){
		zoneTimeDataSuccess += " <set value='"+data[i].T_COUNT+"' /> ";
		zoneTimeDataCate += "<category label='"+data[i].T_HOUR+"' /> ";
	}
	zoneTimeDataSuccess +="</dataset>";
	zoneTimeDataCate += "</categories>";
		
	zoneTimeDataXml = zoneTimeDataXml + zoneTimeDataCate +zoneTimeDataSuccess + "</chart>";
	return zoneTimeDataXml;
}



function getTopCharXML(data){
	var strXML;
	strXML = "<chart canvasPadding='10' caption='"+(data.typeName==null?"":data.typeName)+"' labelDisplay='ROTATE' yAxisName=''" +
			" bgColor='FFFFFF' numVDivLines='10' " +
			" divLineAlpha='30' defaultNumberScale='' yAxisMinValue='0' yAxisMaxValue='10' numberScaleUnit='万,亿,兆' numberScaleValue='10000,10000,10000'  labelPadding ='10' yAxisValuesPadding ='10' showValues='0'" +
			" rotateValues='1'  valuePosition='auto' exportEnabled='1' exportAction='save' " +
			" exportAtClient='0' exportShowMenuItem='0' showExportDialog='0' exportHandler='jsp/FCExporter.jsp' " +
			" showExportDialog='0'  " +
			" exportFileName='"+data.jobType+"Top' >";
	strXML += "<categories>";
	var arrDatanos = data.datanos;
	for(var i=0;i<arrDatanos.length;i++){
		strXML += "<category label='"+arrDatanos[i]+"' /> ";
	}
	strXML += "</categories>";
    strXML += "<dataset>";
    for(var j=0;j<data.datas.length;j++){
    	strXML += "<set value='"+data.datas[j]+"' />" ;
    }
	strXML +=  "</dataset>";
	strXML+='</chart>';
	return strXML;
}

//查询数据
function queryInputData(dt,params){
	 var termVals = TermReqFactory.getTermReq(1).getKeyValue();
	    termVals["_COLUMN_SORT"] = params.sort;
	    termVals["dateNo"] = document.getElementById("dateNo").value;
		termVals["jobType"] = document.getElementById("job_type").value==""?firstTypeId:document.getElementById("job_type").value;
    LogAnalysisAction.getInputDetailM(termVals,function(data){
        if(data)
        	dataInputTable.bindData(data); 
    });
}

//获得radio选中的值
function getDownType(){
	var colorid = "";
	var lstDowntype = document.getElementsByName("downtype");
	for(var i=0;i<lstDowntype.length;i++)
	{
		if(lstDowntype[i].checked){
			colorid=lstDowntype[i].value;
			break;
		}
	}
	return colorid;
}

/**
 * 
 * @param arrService
 */
function getServiceIdList(){
	var strService = "";
	for(var k=0;k<arrService.length;k++){
		strService += arrService[k];
		if(k!=arrService.length-1){
			strService += "-";
		}
	}
	return strService;
}



/**
 * 得到选中的列表值
 * @param checkboxName
 */
function getRsList(checkboxName){
	var docList = document.getElementsByName(checkboxName);
	var myRs="";
	for(var i=0;i<docList.length;i++){
		if(docList[i].checked){
			myRs += "1";
		}else{
			myRs += "0";
		}
	}
	return myRs;
}

/**
 * 得到业务的JSON数据
 * @param lstData
 * @returns
 */
function getJsonService(lstData){
	var json = "";
	for(var i=0;i<lstData.length;i++){
	var service = new Object(); 
		service.name = lstData[i].TYPE_NAME; 
		service.id = lstData[i].TYPE_ID; 
		var j= JSON.stringify(service);
		json += j+',';
	}
	json = json.substr(0,json.length-1);
	json = "["+json+"]";
	var contact = eval('(' + json + ')');
	return contact;
}

/**
 * 得到选择项的数据
 */
function selectPart(rid){
	 var queryParam = {};
	 var unit = dataRsTable.getUserData(rid,"UNIT_NAME");
	 var rsName = dataRsTable.getUserData(rid,"NAME");
	 var ironName = "统计指标>"+rsName;
    var k =  document.getElementById("ToolBar7").lastChild.lastChild;
	 k.innerText = ironName;
	 if(firstRsId!=-1){
		 queryParam.RS_ID = firstRsId;
	 }
	 queryParam.CHECK_DATE = document.getElementById("dateNo").value;
	 queryParam.JOB_TYPE = document.getElementById("job_type").value;
	 
	LogAnalysisAction.queryPartRsM(queryParam,{
			async:false,
	        callback:function(data){
			showRs(data,unit,rsName);		
	   }
	});
}

/**
 * 向页面动态添加checkbox选项
 */
function setService(paramData,rowIndex){
//	var rowIndex = paramData.ORDER_ID;
    var row = document.createElement("tr");
    paramServiceTable.appendChild(row);
    var k = rowIndex*2;
    for(var i = 0;i<2;i++){
        var cell= document.createElement("td");
        row.appendChild(cell);
        if(i==0&&k<paramData.length){
            cell.innerHTML = "<input type='checkbox'  checked='checked' id='' name='service' value='"+paramData[k].id+"' onClick='checkShow(&quot;getService&quot;,&quot;service&quot;)'/>"+paramData[k].name+"</td>";
        }
        if(i==1&&((k+1)<paramData.length)){
        	cell.innerHTML = "<input type='checkbox'  checked='checked' id='' name='service' value='"+paramData[k+1].id+"' onClick='checkShow(&quot;getService&quot;,&quot;service&quot;)'/>"+paramData[k+1].name+"</td>";
        }

    }
    row._rowIndex=rowIndex;
}


/**
 * 得到选中的业务数组
 * @returns {Array}
 */
function getService(docName){
	var arrServiceTemp = new Array();
	var docList = document.getElementsByName(docName);
	var myRs="";
	for(var i=0;i<docList.length;i++){
		if(docList[i].checked){
			arrServiceTemp.push(docList[i].value);
		}
	}
	return arrServiceTemp;
}




/**
 * 检查项目是否全部没有勾选
 * @param eId
 */
function checkShow(eId,itemName){
	var mark = false;
	var results =  document.getElementsByName(itemName);
	for (var i = 0; i < results.length; i++) { 
		var rs = results[i]; 
		if (rs.checked) { 
			mark = true; 
		}
	}
	if(mark){
		document.getElementById(eId).checked = "checked";
	}else{
		document.getElementById(eId).checked = null;
	}
}

dhx.ready(pageInit);
