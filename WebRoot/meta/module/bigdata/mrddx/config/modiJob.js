/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        modiJob.js 
 *Description	修改任务、复制任务
 *
 *Dependent：
 *
 *Author:	王建友
 *        
 ********************************************************/
var dataTable = null;//表格
var dataTableInput = null;//输入数据源
var dataTableOutput = null;//输出数据源
var dataTableParam = null;//输入数据源参数信息
var dataTableParamOutput = null;//输出数据源参数信息
var dataJobParamAll = null ;//输入、输出、系统job参数
var allData ={};//所有数据
var dataInput = {};//输入数据源表数据
var dataOutput = {};//输出数据源表数据
var paramInputTable = null ;//输入参数表格
var paramOutputTable = null ;//输出参数表格
var paramSystemTable = null ;//系统参数表格
var rowIdInput = null;//输入参数行数
var rowIdOutput = null;//输出参数行数
var rowIdSystem = null;//系统参数行数

var inputDataSourceIdTemp = "";
var outputDataSourceIdTemp = "";
var globle_dataSourceId = null;
var tab = null;

//生成弹出窗口
function jobModiWin (){
	dataInput.DATA_SOURCE_ID = inputDataSourceId;
	dataInput.DATA_SOURCE_NAME = inputDataSourceName;
	
	dataOutput.DATA_SOURCE_ID = outputDataSourceId;
	dataOutput.DATA_SOURCE_NAME = outputDataSourceName;
	
	inputDataSourceIdTemp = inputDataSourceId;
	outputDataSourceIdTemp = outputDataSourceId;
	$("pageContentDIV").style.display=""; 
    //加入TAB
    tab = new dhtmlXTabBar("dataTabDIV", "top");
    tab.addTab("a1", "第一步：输入数据源配置", "200px");
    tab.addTab("a2", "第二步：输出数据源配置", "200px");
    tab.addTab("a3", "第三步：任务参数配置", "200px");
    
    var source = document.getElementById("JOB_RUN_DATASOURCE_NAME");
	attachObjEvent(source,"onclick",function(){
		openDataSourceTableWin(this,"JOB_RUN_DATASOURCE","JOB_RUN_DATASOURCE_NAME"); 
	});    
	
	//初始化Tab显示
    init();
    //初始化From表单数据
	jobFormInit();
	
    var prevBtn = document.getElementById("prevBtn");
    var nextBtn = document.getElementById("nextBtn");
    var saveBtn = document.getElementById("saveBtn");
    var closeBtn = document.getElementById("closeBtn");
    
    //上一步按钮
    attachObjEvent(prevBtn,"onclick",function(){
    	
        var tabActive = tab.getActiveTab();
        
        if(tabActive =='a3'){
		    hiddenDIV(3);        	
			showDIV(2);
			
			//控制Tab框
			tab.enableTab("a2");
			tab.disableTab("a3");
			
			//控制按钮
	        $("PrevBtnDiv").style.display=""; 		    
		    $("NextBtnDiv").style.display="";  
		    $("SaveBtnDiv").style.display="none";  
			$("CloseBtnDiv").style.display="none";
			
        }else if(tabActive =='a2'){
			hiddenDIV(2);
        	showDIV(1);
        	
        	//控制Tab框
        	tab.enableTab("a1");
        	tab.disableTab("a2");
        	
        	//控制按钮
		    $("NextBtnDiv").style.display="";
		    $("PrevBtnDiv").style.display="none";
		    
        }
    });
    
    
    //下一步按钮
    attachObjEvent(nextBtn,"onclick",function(){

        var tabActive = tab.getActiveTab();
        
        if(tabActive =='a1'){
         var inputCheckedId = $('inputDataSourceID').value;
        	if(inputCheckedId==""){
        		dhx.alert("请选择输入数据源ID，进入下一步");        		
        		return ;
        	}else{
			    hiddenDIV(1);
				showDIV(2);
				
				//控制Tab框
				tab.disableTab("a1")
				tab.enableTab("a2");
				
				//控制按钮
		        $("PrevBtnDiv").style.display=""; 		    
			    $("NextBtnDiv").style.display="";
			    
				//初始化第二步
			    secondInit();
			    
        	}
        }else if(tabActive =='a2'){
        	var outCheckedId =  $('outputDataSourceID').value;
        	if(outCheckedId==""){
        		dhx.alert("请选择输出数据源ID，进入下一步");
        		return;
        	}else{
        		hiddenDIV(2);
 				showDIV(3);
 				
 				//控制Tab框
 				tab.disableTab("a2");
		    	tab.enableTab("a3");
		    	

		    	//控制按钮
		        $("NextBtnDiv").style.display="none";
			    $("SaveBtnDiv").style.display=""; 		    
			    $("CloseBtnDiv").style.display="";
			    
			     //初始化第三步
			   	inputPageInit();
//			    paramInputTable.setReFreshCall(querySourceParam);
			    outputPageInit();
//			    paramOutputTable.setReFreshCall(querySourceParam);
			    systemPageInit();
//			    paramSystemTable.setReFreshCall(querySystemParam);
			    
			    //添加表单验证信息
			    createValidate();
        	}
        }
    });

    //初始化第二步数据源、源类型参数表格
    dataSourceOutputInit(); 
    secondSourceParamInit();
    dataTableOutput.setReFreshCall(queryDataSourceOutput); 
    
    //初始化第三步参数表格
	paramInputInit();
	paramOutputInit();
	paramSystemInit();
	
    
    //保存按钮
    attachObjEvent(saveBtn,"onclick",function(){
    	
    	//验证表单
        if(!(dhtmlxValidation.validate("_jobConfigParamForm")))return;
        
			 //获取输入表格数据的值
			 var dataInputInfos = [];
			 for(i=1; i<=rowIdInput; i++){
				 var tempData = {};//注意这里只能在里面申请
				 tempData.PARAM_NAME =  paramInputTable.getUserData([i],"PARAM_NAME");
				 tempData.DEFAULT_VALUE = document.getElementById("paramInputValue"+i).value;
				 tempData.PARAM_DESC =  paramInputTable.getUserData([i],"PARAM_DESC");
				 if(paramInputTable.getUserData([i],"IS_MUST")==null||paramInputTable.getUserData([i],"IS_MUST")==1){
					 if(tempData.DEFAULT_VALUE==null||tempData.DEFAULT_VALUE==''){
						 dhx.alert("输入参数不完整，*为必填项！");
						 return;
					 }
				 }
				 dataInputInfos.push(tempData);
			 }
			//获取表单的值
			var jobConfigParamForm = {};
			jobConfigParamForm.jobName = $("jobName").value;
			jobConfigParamForm.jobPriority = $("jobPriority").value;
			jobConfigParamForm.mapTasks = $("mapTasks").value;
			jobConfigParamForm.reduceTasks = $("reduceTasks").value;
			jobConfigParamForm.jobRunDatasource = $("JOB_RUN_DATASOURCE").value;
			jobConfigParamForm.inputDir = $("inputDir").value;
			jobConfigParamForm.jobDescribe = $("jobDescribe").value;
			
			allData.dataInputInfos = dataInputInfos;
			allData.jobConfigParamForm= jobConfigParamForm;
			
			 //获取输出表格数据的值
			 var dataOutputInfos = [];
			 for(i=1; i<=rowIdOutput; i++){
				 var tempData = {};//注意这里只能在里面申请
				 tempData.PARAM_NAME =  paramOutputTable.getUserData([i],"PARAM_NAME");
				 tempData.DEFAULT_VALUE = document.getElementById("paramOutputValue"+i).value;
				 tempData.PARAM_DESC =  paramOutputTable.getUserData([i],"PARAM_DESC");
				 if(paramOutputTable.getUserData([i],"IS_MUST")==null||paramOutputTable.getUserData([i],"IS_MUST")==1){
					 if(tempData.DEFAULT_VALUE==null||tempData.DEFAULT_VALUE==''){
						 dhx.alert("输出参数不完整，*为必填项！");
						 return;
					 }
				 }
				 dataOutputInfos.push(tempData);
			 }
			allData.dataOutputInfos = dataOutputInfos;
			
			
			 //获取输出表格数据的值
			 var dataSystemInfos = [];
			 for(i=1; i<=rowIdSystem; i++){
				 var tempData = {};//注意这里只能在里面申请
				 tempData.PARAM_NAME =  paramSystemTable.getUserData([i],"PARAM_NAME");
				 tempData.DEFAULT_VALUE = document.getElementById("paramSysValue"+i).value;
				 tempData.PARAM_DESC =  paramSystemTable.getUserData([i],"PARAM_DESC");
				 if(paramSystemTable.getUserData([i],"IS_MUST")==null||paramSystemTable.getUserData([i],"IS_MUST")==1){
				 	 if(tempData.DEFAULT_VALUE==null||tempData.DEFAULT_VALUE==''){
						 dhx.alert("系统参数不完整，*为必填项！");
						 return;
					 }
				 }
				 dataSystemInfos.push(tempData);
			 }
			allData.dataSystemInfos = dataSystemInfos;
			
			allData.jobId = jobId;
			allData.inputDataSourceId = $('inputDataSourceID').value;
			allData.outputDataSourceId = $('outputDataSourceID').value;
			allData.inputSourceTypeId = inputSourceTypeId;
			allData.outputSourceTypeId = outputSourceTypeId;
			
			if(flag=='modi'){
			dhx.showProgress("保存数据中");
				JobAction.updateJob(allData, function(rs){
			        dhx.closeProgress();
			        if(rs){
			            dhx.alert("修改成功！",function(){
			            	if(window.parent && window.parent.closeTab)
                   				 window.parent.closeTab(menuStr);
              					  else
                  				  window.close();
			            });
			            
			        }else{
			            dhx.alert("修改失败！");
			        }
				});
			}else{
				dhx.showProgress("保存数据中");
				JobAction.copyJob(allData, function(rs){
			        dhx.closeProgress();
			        if(rs){
			            dhx.alert("复制成功！",function(){
			            	if(window.parent && window.parent.closeTab)
                   			 window.parent.closeTab(menuStr);
               				 else
                  			  window.close();
			            });
			            
			        }else{
			            dhx.alert("复制失败！");
			        }
				});
			}

    });
    
    
    //关闭按钮
    attachObjEvent(closeBtn,"onclick",function(){
    	if(flag=='modi'){
    		if(window.parent && window.parent.closeTab)
                window.parent.closeTab(menuStr);
            else
                window.close();
    	}else{
    		if(window.parent && window.parent.closeTab)
                window.parent.closeTab(menuStr);
            else
                window.close();
    	}
    });

};

//初始化第一步TAB
function init(){
	showDIV(1);
	tab.disableTab("a2");
	tab.disableTab("a3");
    $("NextBtnDiv").style.display="";  
}

//初始化JobForm表单
function jobFormInit(){
	JobAction.queryJobById({jobId:jobId},function(data){
	        $("jobName").value = data[0].JOB_NAME ||"";
	        $("jobPriority").value = data[0].JOB_PRIORITY ;
	        $("mapTasks").value = data[0].MAP_TASKS ||"";
	        $("reduceTasks").value = data[0].REDUCE_TASKS ||"";
	        $("JOB_RUN_DATASOURCE").value = data[0].JOB_RUN_DATASOURCE ||"";
	        $("JOB_RUN_DATASOURCE_NAME").value = data[0].JOB_RUN_DATASOURCE_NAME ||"";
	        $("inputDir").value = data[0].INPUT_DIR ||"";
	        $("jobDescribe").value = data[0].JOB_DESCRIBE ||"";
	        globle_dataSourceId = data[0].JOB_RUN_DATASOURCE ||"";
	});
}


function showDIV(a){
	if(a==1){
	    tab.setTabActive("a1");
	    tab.cells("a1").attachObject($("inputDataDIV"));
	    $("inputDataDIV").style.display="";
	    $("_queryTableGridFromDb_input").style.display="";
	    $("_queryColumnGridParam_input").style.display="";
	}else if(a==2){
   		tab.setTabActive("a2");
   		tab.cells("a2").attachObject($("outputDataDIV"));
	    $("outputDataDIV").style.display="";
	    $("_queryTableGridFromDb_output").style.display="";
	    $("_queryColumnGridParam_output").style.display="";
	}else if(a==3){
   		tab.setTabActive("a3");
   		tab.cells("a3").attachObject($("jobParamDIV"));
	    $("jobParamDIV").style.display="";
	    $("_queryColGrid_in").style.display="";
	    $("_queryColGrid_out").style.display="";    
	    $("_queryColGrid_sys").style.display=""; 
	}
}

function hiddenDIV(a){
	if(a==1){
	    $("inputDataDIV").style.display="none";
	    $("_queryTableGridFromDb_input").style.display="none";
	    $("_queryColumnGridParam_input").style.display="none";
	}else if(a==2){
	    $("outputDataDIV").style.display="none";
	    $("_queryTableGridFromDb_output").style.display="none";
	    $("_queryColumnGridParam_output").style.display="none";	
	}else if(a==3){
	    $("jobParamDIV").style.display="none";
	    $("_queryColGrid_in").style.display="none";
	    $("_queryColGrid_out").style.display="none";    
	    $("_queryColGrid_sys").style.display="none"; 
	}
}


//添加验证信息
function createValidate(){
    dhtmlxValidation.addValidation($("_jobConfigParamForm"), [
        {target:"jobName",rule:"NotEmpty,MaxLength[64]"},
        {target:"mapTasks",rule:"PositiveInt,NotEmpty,MaxLength[64]"},
        {target:"reduceTasks",rule:"PositiveInt,NotEmpty,MaxLength[64]"},
        {target:"JOB_RUN_DATASOURCE_NAME",rule:"NotEmpty,MaxLength[64]"},
        {target:"inputDir",rule:"NotEmpty,MaxLength[64]"}
    ])

}
// dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd第一步ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd 
//输入数据源：初始化界面
function firstInit() {
    var termReq = TermReqFactory.createTermReq(1);
    var firstSourceTypeName = termReq.createTermControl("firstSourceTypeName","SOURCE_TYPE_ID");	//源类型        
    firstSourceTypeName.setAppendData([["","--请选择--"]]);
  	firstSourceTypeName.setListRule(1,"SELECT SOURCE_TYPE_ID, SOURCE_NAME  FROM MR_SOURCE_TYPE WHERE SOURCE_CATE = 0 ","");   //设置条件数据来自SQL
  	firstSourceTypeName.setWidth(200);
	firstSourceTypeName.enableReadonly(true);
    var firstDataSourceName = termReq.createTermControl("firstDataSourceName","DATA_SOURCE_NAME");
    firstDataSourceName.setInputEnterCall(function(){
        inputDataSourceId = null;
		dataTableInput.Page.currPageNum = 1;
		dataTableInput.refreshData();
    });

    dataSourceInputInit(); //初始数据表格  初始之后dataTable才会被实例化
    sourceParamInit();
    dataTableInput.setReFreshCall(queryDataSourceInput); //设置表格刷新的回调方法，即实际查询数据的方法
    
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTableInput.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

}

//输入数据源：初始数据表格
function dataSourceInputInit(){
    dataTableInput = new meta.ui.DataTable("_queryTableGridFromDb_input");//第二个参数表示是否是表格树
    dataTableInput.setColumns({
    	RA : "选择",
        DATA_SOURCE_ID:" 输入数据源ID",
		DATA_SOURCE_NAME:"输入数据源名称",
        SOURCE_NAME:"输入源类型名称",
        OPP:''
    },"","DATA_SOURCE_ID,DATA_SOURCE_NAME,SOURCE_TYPE_ID");
    dataTableInput.setRowIdForField("DATA_SOURCE_ID");
    dataTableInput.setPaging(true,20);//分页
    dataTableInput.setSorting(true,{
        DATA_SOURCE_ID:"asc"
    });
    dataTableInput.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTableInput.grid.setInitWidthsP("10,20,40,30");
    dataTableInput.setGridColumnCfg(0,{type : 'ra',align:"center"});
    dataTableInput.setGridColumnCfg(1,{align:"center"});
    dataTableInput.setGridColumnCfg(2,{align:"center"});
    dataTableInput.setGridColumnCfg(3,{align:"center"});
    
    //第一步：输入数据源配置--查询按钮
	var firstQueryBtn = document.getElementById("firstQueryBtn");
	attachObjEvent(firstQueryBtn, "onclick", function() {
		//inputDataSourceId = null;
		dataTableInput.Page.currPageNum = 1;
		dataTableInput.refreshData();
	});

	dataTableInput.setFormatCellCall(function(rid, cid, data, colId) {
		
		if (colId == "RA") {
			if(inputDataSourceId==dataTableInput.getUserData(rid,"DATA_SOURCE_ID")){
				return 1;
			}
			return 0;
		}
			return data[cid];
	});


        var radioCheck = function(rowId){
	    	//数据源ID
	    	var dataSourceId = dataTableInput.getUserData(rowId,"DATA_SOURCE_ID");
	    	$('inputDataSourceID').value = dataTableInput.getUserData(rowId,"DATA_SOURCE_ID");
	    	$('inputDataSourceName').value = dataTableInput.getUserData(rowId,"DATA_SOURCE_NAME");
	    	//数据源名称
	    	var dataSourceName = dataTableInput.getUserData(rowId,"DATA_SOURCE_NAME");
	    	//源类型ID
			var sourceTypeId = dataTableInput.getUserData(rowId,"SOURCE_TYPE_ID");
			
	    	dataInput.DATA_SOURCE_ID = dataSourceId;
	    	dataInput.DATA_SOURCE_NAME = dataSourceName;
	    	dataInput.SOURCE_TYPE_ID = sourceTypeId;
			allData.dataInput = dataInput;
			//根据DATA_SOURCE_ID查询数据源参数---改变事件
			dataTableParam.setReFreshCall(
				JobAction.queryDataSourceParam({DATA_SOURCE_ID:dataSourceId},function(data){
					 //查询出数据后，必须显示调用绑定数据的方法
		    		dataTableParam.bindData(data);
	    		})
			);
        }
        //添加radio点击事件。
        dataTableInput.grid.attachEvent("onCheck", function(rId, cInd, state){
        	
            if(state){
            	inputDataSourceId = dataTableInput.getUserData(rId,"DATA_SOURCE_ID");
                radioCheck(rId);
            }
        });
        // 添加行点击事件
        dataTableInput.grid.attachEvent("onRowSelect",function(id,ind){
        	dataTableInput.grid.cells(id,0).setValue(1);
        	inputDataSourceId = dataTableInput.getUserData(id,"DATA_SOURCE_ID");
        	radioCheck(id);
        });

    return dataTableInput;
}
//输入数据源：查询数据源
function queryDataSourceInput(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
	termVals["_COLUMN_SORT"] = params.sort;
	
	//inputDataSourceIdTemp = inputDataSourceId;
	
    JobAction.queryDataSource(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTableInput.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

//第一步：公共数据源参数：初始化界面
function sourceParamInit() {
	commSourceParamInit();
	dataTableParam.setReFreshCall(queryDataSourceParam);
	dataTableParam.setReFreshCall(
		JobAction.queryDataSourceParam({DATA_SOURCE_ID:inputDataSourceId},function(data){
			 //查询出数据后，必须显示调用绑定数据的方法
    		dataTableParam.bindData(data);
		})
	);
}


//第一步：公共数据源参数：初始数据表格
function commSourceParamInit(){
    dataTableParam = new meta.ui.DataTable("_queryColumnGridParam_input");//第二个参数表示是否是表格树
    dataTableParam.setColumns({
        PARAM_NAME:"输入数据源参数名称",
		PARAM_VALUE:"输入参数值",
        PARAM_DESC:"参数描述",
        OPP:''
    },"PARAM_NAME,PARAM_VALUE,PARAM_DESC,DATA_SOURCE_ID");
    dataTableParam.setPaging(false);//分页
    dataTableParam.setSorting(false);//不排序
    dataTableParam.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTableParam.grid.setInitWidthsP("30,40,30");
    dataTableParam.setGridColumnCfg(0,{align:"left"});
    dataTableParam.setGridColumnCfg(1,{align:"left"});
    dataTableParam.setGridColumnCfg(2,{align:"left"});
	
	dataTableParam.setFormatCellCall(function(rid, cid, data, colId) {
		 //获取表格数据的值
		 var paramInput = [];
		 for(i=1; i<=rid;i++){
			 var tempData = {};//注意这里只能在里面申请
			 tempData.PARAM_NAME =  dataTableParam.getUserData([i],"PARAM_NAME");
			 tempData.PARAM_VALUE = dataTableParam.getUserData([i],"PARAM_VALUE");
			 tempData.PARAM_DESC =  dataTableParam.getUserData([i],"PARAM_DESC");
			 paramInput.push(tempData);
		 }
		allData.paramInput = paramInput;
		return data[cid];
	});
	return dataTableParam;
}

//第一步：公共数据源参数：查询数据源
function queryDataSourceParam(dt){

}


//ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff第二步dfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

//输出数据源：初始化界面
function secondInit() {
    var termReq = TermReqFactory.createTermReq(2);
    var secondSourceTypeName = termReq.createTermControl("secondSourceTypeName","SOURCE_TYPE_ID");	//源类型        
    secondSourceTypeName.setAppendData([["","--请选择--"]]);
  	secondSourceTypeName.setListRule(1,"SELECT SOURCE_TYPE_ID, SOURCE_NAME  FROM MR_SOURCE_TYPE WHERE SOURCE_CATE = 0 ","");   //设置条件数据来自SQL
  	secondSourceTypeName.setWidth(200);
	secondSourceTypeName.enableReadonly(true);
    var secondDataSourceName = termReq.createTermControl("secondDataSourceName","DATA_SOURCE_NAME");
    secondDataSourceName.setInputEnterCall(function(){
   	    outputDataSourceId = null;
        dataTableOutput.Page.currPageNum = 1;
        dataTableOutput.refreshData();
    });

//    dataSourceOutputInit(); //初始数据表格  初始之后dataTable才会被实例化
//    secondSourceParamInit();
//    dataTableOutput.setReFreshCall(queryDataSourceOutput); //设置表格刷新的回调方法，即实际查询数据的方法
    
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTableOutput.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

}

//输出数据源：初始数据表格
function dataSourceOutputInit(){
    dataTableOutput = new meta.ui.DataTable("_queryTableGridFromDb_output");//第二个参数表示是否是表格树
    dataTableOutput.setColumns({
    	RA : "选择",
        DATA_SOURCE_ID:"输出数据源ID",
		DATA_SOURCE_NAME:"输出数据源名称",
        SOURCE_NAME:"输出源类型名称",
        OPP:''
    },"","DATA_SOURCE_ID,DATA_SOURCE_NAME,SOURCE_TYPE_ID");
    dataTableOutput.setRowIdForField("DATA_SOURCE_ID");
    dataTableOutput.setPaging(true,20);//分页
    dataTableOutput.setSorting(true,{
        DATA_SOURCE_ID:"asc"
    });
    dataTableOutput.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTableOutput.grid.setInitWidthsP("10,20,40,30");
    dataTableOutput.setGridColumnCfg(0,{type : 'ra',align:"center"});
    dataTableOutput.setGridColumnCfg(1,{align:"center"});
    dataTableOutput.setGridColumnCfg(2,{align:"center"});
    dataTableOutput.setGridColumnCfg(3,{align:"center"});
    //第二步：输出数据源配置--查询按钮
	var secondQueryBtn = document.getElementById("secondQueryBtn");
	attachObjEvent(secondQueryBtn, "onclick", function() {
		//outputDataSourceId = null;
		dataTableOutput.Page.currPageNum = 1;
		dataTableOutput.refreshData();
	});

	dataTableOutput.setFormatCellCall(function(rid, cid, data, colId) {
//		alert("rid"+rid+"-cid"+cid+"-data"+data+"-colId"+colId);
		if (colId == "RA") {
//			alert(outputDataSourceId+"-"+dataTableOutput.getUserData(rid,"DATA_SOURCE_ID"));
			if(outputDataSourceId==dataTableOutput.getUserData(rid,"DATA_SOURCE_ID")){
				return 1;
			}
			return 0;
		}
			return data[cid];
	});
	
	
        var radioCheckOutput = function(rowId){
	    	//数据源ID
	    	var dataSourceId = dataTableOutput.getUserData(rowId,"DATA_SOURCE_ID");
	    	//数据源名称
	    	var dataSourceName = dataTableOutput.getUserData(rowId,"DATA_SOURCE_NAME");
	    	
	    	$('outputDataSourceID').value = dataTableOutput.getUserData(rowId,"DATA_SOURCE_ID");
	    	$('outputDataSourceName').value = dataTableOutput.getUserData(rowId,"DATA_SOURCE_NAME");
	    	
	    	//源类型ID
			var sourceTypeId = dataTableOutput.getUserData(rowId,"SOURCE_TYPE_ID");
	    	dataOutput.DATA_SOURCE_ID = dataSourceId;
	    	dataOutput.DATA_SOURCE_NAME = dataSourceName;
	    	dataOutput.SOURCE_TYPE_ID = sourceTypeId;
			allData.dataOutput = dataOutput;
			
			//根据DATA_SOURCE_ID查询数据源参数---改变事件
			dataTableParamOutput.setReFreshCall(
				JobAction.queryDataSourceParam({DATA_SOURCE_ID:dataSourceId},function(data){
					 //查询出数据后，必须显示调用绑定数据的方法
		    		dataTableParamOutput.bindData(data);
	    		})
			);
        }
        //添加radio点击事件。
        dataTableOutput.grid.attachEvent("onCheck", function(rId, cInd, state){
            if(state){
            	outputDataSourceId = dataTableOutput.getUserData(rId,"DATA_SOURCE_ID");
                radioCheckOutput(rId);
            }
        });
        // 添加行点击事件
        dataTableOutput.grid.attachEvent("onRowSelect",function(id,ind){
        	dataTableOutput.grid.cells(id,0).setValue(1);
        	outputDataSourceId = dataTableOutput.getUserData(id,"DATA_SOURCE_ID");
        	radioCheckOutput(id);
        });
	
    return dataTableOutput;
}
//输出数据源：查询数据源
function queryDataSourceOutput(dt,params){
    var termVals = TermReqFactory.getTermReq(2).getKeyValue();
    //termVals.DATA_SOURCE_ID_2 = outputDataSourceId;
	termVals["_COLUMN_SORT"] = params.sort;
    JobAction.queryDataSource(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTableOutput.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

//第二步：公共数据源参数：初始化界面
function secondSourceParamInit() {
	secondCommSourceParamInit();
	dataTableParamOutput.setReFreshCall(queryDataSourceParam);
	dataTableParamOutput.setReFreshCall(
		JobAction.queryDataSourceParam({DATA_SOURCE_ID:outputDataSourceId},function(data){
			 //查询出数据后，必须显示调用绑定数据的方法
    		dataTableParamOutput.bindData(data);
		})
	);
	
}


//第二步：公共数据源参数：初始数据表格
function secondCommSourceParamInit(){
    dataTableParamOutput = new meta.ui.DataTable("_queryColumnGridParam_output");//第二个参数表示是否是表格树
    dataTableParamOutput.setColumns({
        PARAM_NAME:"输出数据源参数名称",
		PARAM_VALUE:"输出参数值",
        PARAM_DESC:"参数描述",
        OPP:''
    },"PARAM_NAME,PARAM_VALUE,PARAM_DESC,DATA_SOURCE_ID");
    dataTableParamOutput.setPaging(false);//分页
    dataTableParamOutput.setSorting(false);//不排序
    dataTableParamOutput.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTableParamOutput.grid.setInitWidthsP("30,40,30");
    dataTableParamOutput.setGridColumnCfg(0,{align:"left"});
    dataTableParamOutput.setGridColumnCfg(1,{align:"left"});
    dataTableParamOutput.setGridColumnCfg(2,{align:"left"});
	
	dataTableParamOutput.setFormatCellCall(function(rid, cid, data, colId) {
		 //获取表格数据的值
		 var paramOutput = [];
		 for(i=1; i<=rid;i++){
			 var tempData = {};//注意这里只能在里面申请
			 tempData.PARAM_NAME =  dataTableParamOutput.getUserData([i],"PARAM_NAME");
			 tempData.PARAM_VALUE = dataTableParamOutput.getUserData([i],"PARAM_VALUE");
			 tempData.PARAM_DESC =  dataTableParamOutput.getUserData([i],"PARAM_DESC");
			 paramOutput.push(tempData);
		 }
		allData.paramOutput = paramOutput;
		return data[cid];
	});
	return dataTableParamOutput;
}

//第二步：公共数据源参数：查询数据源
function queryDataSourceParam(dt){

}



//ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg第三步gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg

var INPUT_SOURCE_TYPE_ID = '';
function inputPageInit() {
	var termReq = TermReqFactory.createTermReq(4);
	var termVals ={};
	termVals.inputOrOutput = 1;
	if(allData.dataInput!=null){
	    termVals.DATA_SOURCE_ID = dataInput.DATA_SOURCE_ID;
	    termVals.SOURCE_TYPE_ID = dataInput.SOURCE_TYPE_ID;
	    termVals.jobId = jobId;
	    if(INPUT_SOURCE_TYPE_ID==dataInput.SOURCE_TYPE_ID){
	    	return;
	    }else{
	    	INPUT_SOURCE_TYPE_ID=dataInput.SOURCE_TYPE_ID;
	    }
	    paramInputTable.setReFreshCall(
		    JobAction.queryInputParamById(termVals,function(data){
		        dhx.closeProgress();
		        paramInputTable.bindData(data);
		        document.getElementById("_queryColGrid_in").style.height=(28+data.length*25)+"px";
		        bindMouseEventToInputDesc();
		    })
	    ); 
	    
	}else{
		termVals.DATA_SOURCE_ID = inputDataSourceId;
    	termVals.SOURCE_TYPE_ID = inputSourceTypeId;
    	termVals.jobId = jobId;
	    if(INPUT_SOURCE_TYPE_ID==inputSourceTypeId){
	    	return;
	    }else{
	    	INPUT_SOURCE_TYPE_ID=inputSourceTypeId;
	    }
	    paramInputTable.setReFreshCall(
		    JobAction.queryInputParamById(termVals,function(data){
		        dhx.closeProgress();
		        paramInputTable.bindData(data);
		        document.getElementById("_queryColGrid_in").style.height=(28+data.length*25)+"px";
		        bindMouseEventToInputDesc();
		    })
	    ); 
	}


//	paramInputInit();

    
    termReq.init(function(termVals){
        dhx.closeProgress();
        paramInputTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据
}
//输入源类型数据表格
function paramInputInit(){
    paramInputTable = new meta.ui.DataTable("_queryColGrid_in");//第二个参数表示是否是表格树
    paramInputTable.setColumns({
        PARAM_NAME:"输入参数名称",
        DEFAULT_VALUE:"输入参数值",
        PARAM_DESC:"参数描述",
        OPP:''
    },"PARAM_NAME,'',PARAM_DESC,DATA_SOURCE_ID,IS_MUST");
    paramInputTable.setPaging(false);//分页
    paramInputTable.setSorting(false);
    paramInputTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    paramInputTable.grid.setInitWidthsP("30,30,40");
    paramInputTable.setGridColumnCfg(0,{align:"left"});
    paramInputTable.setGridColumnCfg(1,{align:"left"});
    paramInputTable.setGridColumnCfg(2,{align:"left"});

    paramInputTable.setFormatCellCall(function(rid,cid,data,colId){
    	
    	//传递行数多少行
    	rowIdInput = rid;
    	if(colId=="DEFAULT_VALUE"){
			var paramInputValue = paramInputTable.getUserData(rid,"DEFAULT_VALUE");
			if(paramInputValue == null){
				paramInputValue ='';
			}
			var str = '<input value="'+paramInputValue+'" style="width: 350px" id="paramInputValue'+rid+'" title="'+rid+'" ></input>';
			return str;
    	}
    	if(colId=="PARAM_DESC"){
    		var ismust = paramInputTable.getUserData(rid,"IS_MUST");
    		if(ismust == null||ismust == '1'){
				return '<span style="font-weight: bold;color: red">*</span>'+data[cid];
			}
    	}
        return data[cid];
    });
    // 添加行点击事件
        paramInputTable.grid.attachEvent("onRowSelect",function(rid,ind){
        	document.getElementById("paramInputValue"+rid).focus();
        	var val = $("paramInputValue"+rid).value;
        	$("paramInputValue"+rid).value="";
        	$("paramInputValue"+rid).value= val;
        });
    return paramInputTable;
}


function querySourceParam(dt){
	//刷新回调
}

var OUTPUT_SOURCE_TYPE_ID = '';
function outputPageInit() {
	var termReq = TermReqFactory.createTermReq(5);
	var termVals = {};
    termVals.inputOrOutput = 2;	
	if(allData.dataOutput!=null){
	    termVals.DATA_SOURCE_ID = dataOutput.DATA_SOURCE_ID;
	    termVals.SOURCE_TYPE_ID = dataOutput.SOURCE_TYPE_ID;
	    termVals.jobId = jobId;
		if(OUTPUT_SOURCE_TYPE_ID==dataOutput.SOURCE_TYPE_ID){
	    	return;
	    }else{
	    	OUTPUT_SOURCE_TYPE_ID=dataOutput.SOURCE_TYPE_ID;
	    }
	    paramOutputTable.setReFreshCall(
		    JobAction.queryOutputParamById(termVals,function(data){
		        dhx.closeProgress();
		        paramOutputTable.bindData(data);
		        document.getElementById("_queryColGrid_out").style.height=(28+data.length*25)+"px";
		        bindMouseEventToOutputDesc();
		    })
	    ); 
	    
	}else{
		termVals.DATA_SOURCE_ID = outputDataSourceId;
    	termVals.SOURCE_TYPE_ID = outputSourceTypeId;
    	termVals.jobId = jobId;
		if(OUTPUT_SOURCE_TYPE_ID==outputSourceTypeId){
	    	return;
	    }else{
	    	OUTPUT_SOURCE_TYPE_ID=outputSourceTypeId;
	    }
	    paramOutputTable.setReFreshCall(
		    JobAction.queryOutputParamById(termVals,function(data){
		        dhx.closeProgress();
		        paramOutputTable.bindData(data);
		        document.getElementById("_queryColGrid_out").style.height=(28+data.length*25)+"px";
		        bindMouseEventToOutputDesc();
		    })
	    );  
	}


//	paramOutputInit();

    
    termReq.init(function(termVals){
        dhx.closeProgress();
        paramOutputTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据
}


//输出源类型数据表格
function paramOutputInit(){
    paramOutputTable = new meta.ui.DataTable("_queryColGrid_out");//第二个参数表示是否是表格树
    paramOutputTable.setColumns({
        PARAM_NAME:"输出参数名称",
        DEFAULT_VALUE:"输出参数值",
        PARAM_DESC:"参数描述",
        OPP:''
    },"PARAM_NAME,'',PARAM_DESC,DATA_SOURCE_ID,IS_MUST");
    paramOutputTable.setPaging(false);//分页
    paramOutputTable.setSorting(false);
    paramOutputTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    paramOutputTable.grid.setInitWidthsP("30,30,40");
    paramOutputTable.setGridColumnCfg(0,{align:"left"});
    paramOutputTable.setGridColumnCfg(1,{align:"left"});
    paramOutputTable.setGridColumnCfg(2,{align:"left"});

    paramOutputTable.setFormatCellCall(function(rid,cid,data,colId){
    	//传递行数多少行
    	rowIdOutput = rid;
    	if(colId=="DEFAULT_VALUE"){
			var paramOutputValue = paramOutputTable.getUserData(rid,"DEFAULT_VALUE");
			if(paramOutputValue == null){
				paramOutputValue ='';
			}
			var str = '<input value="'+paramOutputValue+'" style="width: 350px" id="paramOutputValue'+rid+'" title="'+rid+'" ></input>';
			return str;
    	}
    	if(colId=="PARAM_DESC"){
    		var ismust = paramOutputTable.getUserData(rid,"IS_MUST");
    		if(ismust == null||ismust == '1'){
				return '<span style="color: red">*</span>'+data[cid];
			}
    	}
        return data[cid];
    });
    // 添加行点击事件
        paramOutputTable.grid.attachEvent("onRowSelect",function(rid,ind){
        	document.getElementById("paramOutputValue"+rid).focus();
        	var val = $("paramOutputValue"+rid).value;
        	$("paramOutputValue"+rid).value="";
        	$("paramOutputValue"+rid).value= val;
        });
    return paramOutputTable;
}




var sysinit = '';
function systemPageInit() {
	var termReq = TermReqFactory.createTermReq(6);
	var termVals = {};
	termVals.jobId = jobId;
	if(allData.dataInput!=null || allData.dataOutput!=null){
		if(sysinit!=''){
			return;
		}else{
			sysinit = '1';
		}
	    paramSystemTable.setReFreshCall(
		    JobAction.querySysParamById(termVals,function(data){
		        dhx.closeProgress();
		        paramSystemTable.bindData(data);
		        document.getElementById("_queryColGrid_sys").style.height=(28+data.length*25)+"px";
		        bindMouseEventToSystemDesc();
		    })
	    );
	}else{
		if(sysinit!=''){
			return;
		}else{
			sysinit = '1';
		}
	    paramSystemTable.setReFreshCall(
		    JobAction.querySysParamById(termVals,function(data){
		        dhx.closeProgress();
		        paramSystemTable.bindData(data);
		        document.getElementById("_queryColGrid_sys").style.height=(28+data.length*25)+"px";
		        bindMouseEventToSystemDesc();
		    })
	    );
	}
	
	paramSystemTable.grid.attachEvent("onRowSelect",function(rid,ind){
		document.getElementById("paramSysValue"+rid).focus();
		var val = $("paramSysValue"+rid).value;
		$("paramSysValue"+rid).value="";
		$("paramSysValue"+rid).value= val;
	});

    
    termReq.init(function(termVals){
        dhx.closeProgress();
        paramSystemTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据
}
// 添加行点击事件
//系统数据表格
function paramSystemInit(){
    paramSystemTable = new meta.ui.DataTable("_queryColGrid_sys");//第二个参数表示是否是表格树
    paramSystemTable.setColumns({
        PARAM_NAME:"系统参数名称",
        DEFAULT_VALUE:"系统参数值",
        PARAM_DESC:"参数描述",
        OPP:''
    },"PARAM_NAME,'',PARAM_DESC,IS_MUST");
    paramSystemTable.setPaging(false);//分页
    paramSystemTable.setSorting(false);
    paramSystemTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    paramSystemTable.grid.setInitWidthsP("30,30,40");
    paramSystemTable.setGridColumnCfg(0,{align:"left"});
    paramSystemTable.setGridColumnCfg(1,{align:"left"});
    paramSystemTable.setGridColumnCfg(2,{align:"left"});

    paramSystemTable.setFormatCellCall(function(rid,cid,data,colId){
    	//传递行数多少行
    	rowIdSystem = rid;
    	if(colId=="DEFAULT_VALUE"){
			var paramSysValue = paramSystemTable.getUserData(rid,"DEFAULT_VALUE");
			if(paramSysValue == null){
				paramSysValue ='';
			}
			var str = '<input value="'+paramSysValue+'" style="width: 350px" id="paramSysValue'+rid+'" title="'+rid+'" ></input>';
			return str;
    	}
    	if(colId=="PARAM_DESC"){
    		var ismust = paramSystemTable.getUserData(rid,"IS_MUST");
    		if(ismust == null||ismust == '1'){
				return '<span style="color: red">*</span>'+data[cid];
			}
    	}
        return data[cid];
    });

    return paramSystemTable;
}


function querySystemParam(dt){
	//刷新回调
}

//向 job输入参数描述名称列绑定鼠标事件
function bindMouseEventToInputDesc(){
    var rids = paramInputTable.grid.getAllRowIds();
    if(rids){
        rids = rids.split(",");
        for(var i=0;i<rids.length;i++){
            var paramDesc = paramInputTable.getUserData(rids[i],"PARAM_DESC");
            var inputValue = document.getElementById("paramInputValue"+rids[i]);
            if(inputValue){
            	inputValue.setAttribute("inputText",paramDesc);
                attachObjEvent(inputValue,"onmouseover",function(e){
                	if(e.srcElement && e.srcElement.getAttribute("inputText")){
                        var paramDiv = document.getElementById("paramDIV");
                        $("paramTitle").innerHTML = "<span title='数据格式' style='font-weight:normal;color:#b07e6f'>参数描述信息：</span>";
                        $("paramContent").innerHTML = e.srcElement.getAttribute("inputText");
                        var pos = autoPosition(paramDiv,e.srcElement,true,false,Math.min(e.srcElement.offsetWidth,e.srcElement.parentNode.offsetWidth-5),-(e.srcElement.offsetHeight));
                	}

                });
            }
        }
    }
}
//向 job输出参数描述名称列绑定鼠标事件
function bindMouseEventToOutputDesc(){
    var rids = paramOutputTable.grid.getAllRowIds();
    if(rids){
        rids = rids.split(",");
        for(var i=0;i<rids.length;i++){
            var paramDesc = paramOutputTable.getUserData(rids[i],"PARAM_DESC");
            var outputValue = document.getElementById("paramOutputValue"+rids[i]);
            if(outputValue){
            	outputValue.setAttribute("outputText",paramDesc);
                attachObjEvent(outputValue,"onmouseover",function(e){
                	if(e.srcElement && e.srcElement.getAttribute("outputText")){
                        var paramDiv = document.getElementById("paramDIV");
                        $("paramTitle").innerHTML = "<span title='数据格式' style='font-weight:normal;color:#b07e6f'>参数描述信息：</span>";
                        $("paramContent").innerHTML = e.srcElement.getAttribute("outputText");
                        var pos = autoPosition(paramDiv,e.srcElement,true,false,Math.min(e.srcElement.offsetWidth,e.srcElement.parentNode.offsetWidth-5),-(e.srcElement.offsetHeight));
                	}

                });
            }
        }
    }
}

//向 job系统参数描述名称列绑定鼠标事件
function bindMouseEventToSystemDesc(){
    var rids = paramSystemTable.grid.getAllRowIds();
    if(rids){
        rids = rids.split(",");
        for(var i=0;i<rids.length;i++){
            var paramDesc = paramSystemTable.getUserData(rids[i],"PARAM_DESC");
            var systemValue = document.getElementById("paramSysValue"+rids[i]);
            if(systemValue){
            	systemValue.setAttribute("systemText",paramDesc);
                attachObjEvent(systemValue,"onmouseover",function(e){
                	if(e.srcElement && e.srcElement.getAttribute("systemText")){
                        var paramDiv = document.getElementById("paramDIV");
                        $("paramTitle").innerHTML = "<span title='数据格式' style='font-weight:normal;color:#b07e6f'>参数描述信息：</span>";
                        $("paramContent").innerHTML = e.srcElement.getAttribute("systemText");
                        var pos = autoPosition(paramDiv,e.srcElement,true,false,Math.min(e.srcElement.offsetWidth,e.srcElement.parentNode.offsetWidth-5),-(e.srcElement.offsetHeight));
                	}
                });
            }
        }
    }
}

var selectDataSourceWindow = null;
var dsid = null;
var dsname =null;
function openDataSourceTableWin(obj,id,name){
    if(!selectDataSourceWindow){
    	dsid=id;
    	dsname=name;
        selectDataSourceWindow = DHTMLXFactory.createWindow("selectWindow2","selectDataSourceWindow", 0, 0, 300, 380);
        selectDataSourceWindow.stick();
        selectDataSourceWindow.setModal(true);
        selectDataSourceWindow.setDimension(1000);
        selectDataSourceWindow.button("minmax1").hide();
        selectDataSourceWindow.button("park").hide();
        selectDataSourceWindow.button("stick").hide();
        selectDataSourceWindow.button("sticked").hide();
        selectDataSourceWindow.center();
        selectDataSourceWindow.denyResize();
        selectDataSourceWindow.denyPark();
        selectDataSourceWindow.setText("选择数据源");
        selectDataSourceWindow.keepInViewport(true);

        var layout = new dhtmlXLayoutObject(selectDataSourceWindow, "2E");
        layout.cells("b").setHeight(50);
        layout.cells("a").fixSize(true, true);
        layout.cells("a").hideHeader();
        layout.cells("a").attachObject($('tableSelectDataSourceContentTop'));
        layout.cells("b").fixSize(false, true);
        layout.cells("b").hideHeader();
        layout.cells("b").attachObject($('tableSelectDataSourceContentDown'));

        globle_dataSourceId = $(id).value;
        globle_dataSourceName = $(name).value;
        
        dataDataSourceTableInit(); //初始数据表格  初始之后dataTable才会被实例化
        dataDataSourceTable.setReFreshCall(queryDataSourceData); //设置表格刷新的回调方法，即实际查询数据的方法
		//添加radio点击事件。
		dataDataSourceTable.grid.attachEvent("onCheck", function(rId, cInd, state){
		    if(state){
		        globle_dataSourceId = dataDataSourceTable.getUserData(rId,"DATA_SOURCE_ID");
		        globle_dataSourceName = dataDataSourceTable.getUserData(rId,"DATA_SOURCE_NAME");
		    }
		});
		// 添加行点击事件
		dataDataSourceTable.grid.attachEvent("onRowSelect",function(id,ind){
			dataDataSourceTable.grid.cells(id,0).setValue(1);
			globle_dataSourceId = dataDataSourceTable.getUserData(id,"DATA_SOURCE_ID");
			globle_dataSourceName = dataDataSourceTable.getUserData(id,"DATA_SOURCE_NAME");
		});
        dataDataSourceTable.refreshData();

        //重置关闭窗口事件
        selectDataSourceWindow.attachEvent("onClose",function(){
            selectDataSourceWindow.setModal(false);
            this.hide();
            return false;
        });

        $('searchDataSourceTable').onclick = function() {
            dataDataSourceTable.refreshData();
        }
        $('saveDataSourceBtn').onclick = function(){
            var dateSourceId = '';
            var dateSourceName = '';

            if((globle_dataSourceId==null||globle_dataSourceId=="")){
                alert("请选择一个数据源！");
                return;
            }else{

				dateSourceId = globle_dataSourceId;
				dateSourceName = globle_dataSourceName;
     
                selectDataSourceWindow.setModal(false);
                selectDataSourceWindow.hide();

                $(dsid).value = dateSourceId?dateSourceId:"";
                $(dsname).value = dateSourceName?dateSourceName:"";

            }
        };
    }else {
    	dsid=id;
    	dsname=name;
        globle_dataSourceId = $(id).value;
        globle_dataSourceName = $(name).value;
        selectDataSourceWindow.show();
        selectDataSourceWindow.setModal(true);
        $('searchSourceName').value = '';
        dataDataSourceTable.Page.currPageNum = 1;
        dataDataSourceTable.refreshData();
    }
}
var dataDataSourceTable = null;
function dataDataSourceTableInit(){
    dataDataSourceTable= new meta.ui.DataTable("tableSelectDataSourceContent");//第二个参数表示是否是表格树
    dataDataSourceTable.setColumns({
        OPP: "选择行",
        DATA_SOURCE_ID:"数据源ID",
        DATA_SOURCE_NAME:"数据源名称",
        SOURCE_NAME:"源类型名称"
    },"OPP,DATA_SOURCE_ID,DATA_SOURCE_NAME,SOURCE_NAME,SOURCE_TYPE_ID");
	    dataDataSourceTable.setRowIdForField("DATA_SOURCE_ID");
	    dataDataSourceTable.setPaging(true,20);//分页
	    dataDataSourceTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
	    dataDataSourceTable.grid.setInitWidthsP("5,30,30,35");
	    dataDataSourceTable.setGridColumnCfg(0,{align:"center",type:"ra"});
	    dataDataSourceTable.setGridColumnCfg(1,{align:"center"});
	    dataDataSourceTable.setGridColumnCfg(2,{align:"center"});
	    dataDataSourceTable.setGridColumnCfg(3,{align:"center"});
	    	
		dataDataSourceTable.setFormatCellCall(function(rid, cid, data, colId) {
		if(colId=="OPP"){
            if(data[1]==globle_dataSourceId){
                return 1;
            }
            return 0;
        }
		return data[cid];
		});
	    return dataDataSourceTable;
}

function queryDataSourceData(dt,params){
	   // var keyWord = $('tableProgramSearch').value;
	    var queryData = {};
    	queryData.SOURCE_CATE=2;
        var sourceName = $('searchSourceName').value;
        if(sourceName!=''){
        	queryData.DATA_SOURCE_NAME = sourceName;
        }
	    BigDataSourceAction.queryDataSource(queryData,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
	    	dhx.closeProgress();
	        var total = 0;
	        if(data && data[0])
	            total = data[0]["TOTAL_COUNT_"];
	        dataDataSourceTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
	    });
	}

dhx.ready(jobModiWin);
dhx.ready(firstInit);

