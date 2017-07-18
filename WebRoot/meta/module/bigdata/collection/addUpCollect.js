/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        addCollect.js 
 *Description：采集新增
 *
 *Dependent：
 *
 *Author:	王建友
 *        
 ********************************************************/
var dataListTable = null;//表格
var allData = {};//保存所有数据
var rowIdsAdd = null;
var statusParam = null;
var globle_dataSourceId = null;
var globle_dataSourceName = null;
var tid = 0;
var pluginMaintainWin = null;//窗体
var pluginValue = ""; // 插件代码

//初始界面
function pageInit() {
	createValidate();
	UserTypeAction.queryTypeByUser(null,function(data){
	var paramsTD = document.getElementById("COL_TYPE");
    paramsTD.options.length = 0; 
    paramsTD.options[0] = new Option("--全部--","");
    for(var m=0;m<data.length;m++){
    	paramsTD.options[m+1] = new Option(data[m].TYPE_NAME,data[m].TYPE_ID);
    }
		if (flag != 'add') {
		CollectionAction
				.queryJobById(
						col_id,
						function(rs) {
							dhx.closeProgress();
							document.getElementById("COL_ID").value = rs.COL_ID;
							document.getElementById("COL_NAME").value = rs.COL_NAME;
							document.getElementById("COL_ORIGIN").value = rs.COL_ORIGIN;
							document.getElementById("COL_DATATYPE").value = rs.COL_DATATYPE;
							document.getElementById("COL_TASK_PRIORITY").value = rs.COL_TASK_PRIORITY;
							document.getElementById("COL_RUN_DATASOURCE").value=rs.COL_RUN_DATASOURCE==null?"":rs.COL_RUN_DATASOURCE;
							document.getElementById("COL_RUN_DATASOURCE_NAME").value=rs.COL_RUN_DATASOURCE_NAME==null?"":rs.COL_RUN_DATASOURCE_NAME;
							document.getElementById("COL_TASK_NUMBER").value = rs.COL_TASK_NUMBER;
							document.getElementById("COL_SYS_INPUTPATH").value = rs.COL_SYS_INPUTPATH;
							document.getElementById("COL_DESCRIBE").value = rs.COL_DESCRIBE == null ? ""
									: rs.COL_DESCRIBE;
							document.getElementById("COL_TYPE").value=rs.COL_TYPE==null?"":rs.COL_TYPE;
							document.getElementById("INPUT_DOTYPE").value = rs.INPUT_DOTYPE;
							
							document.getElementById("INPUT_DATASOURCE_ID").value = rs.INPUT_DATASOURCE_ID==null?"":rs.INPUT_DATASOURCE_ID;
							document.getElementById("INPUT_DATASOURCE_NAME").value = rs.INPUT_DATASOURCE_NAME==null?"":rs.INPUT_DATASOURCE_NAME;
							document.getElementById("INPUT_FILELST_TYPE").value = rs.INPUT_FILELST_TYPE==null?"":rs.INPUT_FILELST_TYPE;

							document
									.getElementById("INPUT_FILELST_DATASOURCE_ID").value = rs.INPUT_FILELST_DATASOURCE_ID==null?"":rs.INPUT_FILELST_DATASOURCE_ID;
							document
									.getElementById("INPUT_FILELST_DATASOURCE_NAME").value = rs.INPUT_FILELST_DATASOURCE_NAME==null?"":rs.INPUT_FILELST_DATASOURCE_NAME;
							document.getElementById("INPUT_QUERY_SQL").value = rs.INPUT_QUERY_SQL == null ? ""
									: rs.INPUT_QUERY_SQL;
							document.getElementById("INPUT_PATH").value = rs.INPUT_PATH == null ? ""
									: rs.INPUT_PATH;
							document.getElementById("INPUT_FILE_RULE").value = rs.INPUT_FILE_RULE == null ? ""
									: rs.INPUT_FILE_RULE;
							document.getElementById("INPUT_MOVE_PATH").value = rs.INPUT_MOVE_PATH == null ? ""
									: rs.INPUT_MOVE_PATH;
							document.getElementById("INPUT_RENAME_RULE").value = rs.INPUT_RENAME_RULE == null ? ""
									: rs.INPUT_RENAME_RULE;
							document.getElementById("INPUT_RENAME").value = rs.INPUT_RENAME == null ? ""
									: rs.INPUT_RENAME;
							document.getElementById("pluginCode").value=rs.PLUGIN_CODE== null ? "":rs.PLUGIN_CODE;
							pluginValue=document.getElementById("pluginCode").value;
							selectTpye()
							selectTpye2()
							dataListTable.refreshData();
							
							sourceInfo("COL_RUN_DATASOURCE","COL_RUN_DATASOURCE_NAME");
							sourceInfo("INPUT_DATASOURCE_ID","INPUT_DATASOURCE_NAME");
							sourceInfo("INPUT_FILELST_DATASOURCE_ID","INPUT_FILELST_DATASOURCE_NAME");
							
							allData = {};
							if(flag=='info'){
								$("COL_NAME").readOnly="readOnly";
						        $("COL_DATATYPE").disabled="disabled";
						        $("COL_DESCRIBE").readOnly="readOnly";
						        $("COL_TASK_PRIORITY").disabled = "disabled";
						        $("OUTPUT_DATASOURCE_NAME").readOnly = "readOnly";
						        $("INPUT_DATASOURCE_NAME").readOnly = "readOnly";
						        $("COL_TYPE").disabled = "disabled";
						        $("INPUT_RENAME").readOnly="readOnly";
						        $("OUTPUT_RENAME").readOnly="readOnly";
						        $("INPUT_FILELST_TYPE").disabled = "disabled";
						        $("INPUT_DOTYPE").disabled = "disabled";
						        $("INPUT_FILELST_DATASOURCE_NAME").readOnly = "readOnly";
						        $("COL_TASK_NUMBER").readOnly="readOnly";
						        $("COL_SYS_INPUTPATH").readOnly="readOnly";
						        
						        $("COL_RUN_DATASOURCE").disabled="disabled";
								$("COL_RUN_DATASOURCE_NAME").readOnly="readOnly";
						        
								$("OUTPUT_DATASOURCE_ID").readOnly="readOnly";
								$("OUTPUT_DATASOURCE_NAME").readOnly="readOnly";
								$("OUTPUT_PATH").readOnly="readOnly";
								$("OUTPUT_RENAME_RULE").readOnly="readOnly";
								$("OUTPUT_MOVE_PATH").readOnly="readOnly";
								$("NOTE").readOnly="readOnly";
								
								$("INPUT_DATASOURCE_ID").readOnly="readOnly";
								$("INPUT_DATASOURCE_NAME").readOnly="readOnly";
								$("INPUT_FILELST_TYPE").readOnly="readOnly";
								$("INPUT_FILELST_DATASOURCE_ID").readOnly="readOnly";
								$("INPUT_FILELST_DATASOURCE_NAME").readOnly="readOnly";
								$("INPUT_QUERY_SQL").readOnly="readOnly";
								$("INPUT_PATH").readOnly="readOnly";
								$("INPUT_FILE_RULE").readOnly="readOnly";
								$("INPUT_DOTYPE").readOnly="readOnly";
								$("INPUT_MOVE_PATH").readOnly="readOnly";
								$("INPUT_RENAME_RULE").readOnly="readOnly";
								$("pluginCode").readOnly="readOnly";
								document.getElementById("add_SaveBtn").style.visibility = "hidden";
								document.getElementById("add_CleanBtn").style.visibility = "hidden";
							}
						});
	}
 });
	//选择数据源
	var source1 = document.getElementById("OUTPUT_DATASOURCE_NAME");
	attachObjEvent(source1, "onclick", function() {
		openDataSourceTableWin(this, "OUTPUT_DATASOURCE_ID",
				"OUTPUT_DATASOURCE_NAME");
	});
	var source2 = document.getElementById("INPUT_DATASOURCE_NAME");
	attachObjEvent(source2, "onclick", function() {
		openDataSourceTableWin(this, "INPUT_DATASOURCE_ID",
				"INPUT_DATASOURCE_NAME");
	});
	var source3 = document.getElementById("INPUT_FILELST_DATASOURCE_NAME");
	attachObjEvent(source3, "onclick", function() {
		openDataSourceTableWin(this, "INPUT_FILELST_DATASOURCE_ID",
				"INPUT_FILELST_DATASOURCE_NAME");
	});
    var source4 = document.getElementById("COL_RUN_DATASOURCE_NAME");
    attachObjEvent(source4,"onclick",function(){
    	openDataSourceTableWin(this,"COL_RUN_DATASOURCE","COL_RUN_DATASOURCE_NAME"); 
    }); 
    
    var searchSourceName = document.getElementById("searchSourceName");
    attachObjEvent(searchSourceName,"onkeydown",function(evet){
    	if (event.keyCode==13){
	    	dataDataSourceTable.Page.currPageNum = 1;
	        dataDataSourceTable.refreshData();
    	}
    });
    
	var input_filelst_type = document.getElementById("INPUT_FILELST_TYPE");
	attachObjEvent(input_filelst_type, "onchange", selectTpye);

	var input_file_rule = document.getElementById("INPUT_DOTYPE");
	attachObjEvent(input_file_rule, "onchange", selectTpye2);

	//初始化数据类型名称
	//initSelect(0);
	//添加验证
	//createValidate(); 

	//新增事件
	var add_SaveBtn = document.getElementById("add_SaveBtn");
	add_SaveBtn.onclick = function() {
		if(!(dhtmlxValidation.validate("collectForm")))return;	
		if (document.getElementById("COL_NAME").value == "") {
			dhx.alert("请输入采集名称");
			return;
		}
		
		if (document.getElementById("COL_DATATYPE").value == "") {
			dhx.alert("请选择文件类型");
			return;
		}

		if (document.getElementById("COL_TASK_PRIORITY").value == "") {
			dhx.alert("请选择优先级");
			return;
		}
		if(document.getElementById("COL_RUN_DATASOURCE").value==""){
    		 dhx.alert("请选择系统运行数据源");
    		 return;
    	}
		if (document.getElementById("COL_TASK_NUMBER").value == "") {
			dhx.alert("请输入任务数");
			return;
		}
		if (document.getElementById("COL_TASK_NUMBER").value != "") {
			var re = /^[0-9]*$/;
			if (!re.test(document.getElementById("COL_TASK_NUMBER").value)) {
				dhx.alert("任务数必须为数字");
				return;
			}
		}

		if (document.getElementById("COL_SYS_INPUTPATH").value == "") {
			dhx.alert("请输入任务系统目录");
			return;
		}
		if (document.getElementById("COL_SYS_INPUTPATH").value != "") {
			if (document.getElementById("COL_SYS_INPUTPATH").value.charAt(0) != '/') {
				dhx.alert("任务系统目录格式不正确，请以 / 开头");
				return;
			}
		}
		if(document.getElementById("COL_TYPE").value==""){
    		 dhx.alert("请选择业务类型");
    		 return;
    	}
		//——————————————————
		if (document.getElementById("INPUT_DATASOURCE_ID").value == "") {
			dhx.alert("请选择输入数据源");
			return;
		}
		if (document.getElementById("INPUT_FILELST_TYPE").value == "") {
			dhx.alert("请选择文件列表来源类型");
			return;
		}
		if (document.getElementById("INPUT_FILELST_TYPE").value == 1
				&& document.getElementById("INPUT_FILELST_DATASOURCE_ID").value == "") {
			dhx.alert("请选择文件列表来源数据源");
			return;
		}
		if (document.getElementById("INPUT_FILELST_TYPE").value == 1
				&& document.getElementById("INPUT_QUERY_SQL").value == "") {
			dhx.alert("请输入文件列表查询SQL语句");
			return;
		}
		if (document.getElementById("INPUT_FILELST_TYPE").value == 0
				&& document.getElementById("INPUT_PATH").value == "") {
			dhx.alert("请输入输入目录");
			return;
		}
		if (document.getElementById("INPUT_PATH").value != "") {
			if (document.getElementById("INPUT_PATH").value.charAt(0) != '/') {
				dhx.alert("输入目录格式不正确，请以 / 开头");
				return;
			}
		}
		if (document.getElementById("INPUT_DOTYPE").value == "") {
			dhx.alert("请选择输入文件处理类型");
			return;
		}
		if ((document.getElementById("INPUT_DOTYPE").value == 2 || document
				.getElementById("INPUT_DOTYPE").value == 3)
				&& document.getElementById("INPUT_MOVE_PATH").value == "") {
			dhx.alert("请输入输入文件移动目录");
			return;
		}
		if ((document.getElementById("INPUT_DOTYPE").value == 4 || document
				.getElementById("INPUT_DOTYPE").value == 3)
				&& document.getElementById("INPUT_RENAME_RULE").value == "") {
			dhx.alert("请输入输入文件重命名规则");
			return;
		}
		if (document.getElementById("INPUT_RENAME_RULE").value != ""
				&& document.getElementById("INPUT_RENAME").value == "") {
			dhx.alert("请输入输入文件重命名");
			return;
		}

		if (document.getElementById("OUTPUT_DATASOURCE_ID").value == "") {
			dhx.alert("请选择输出数据源！");
			return;
		}
		if (document.getElementById("OUTPUT_PATH").value == "") {
			dhx.alert("请输入输出文件目录！");
			return;
		}
		if (document.getElementById("OUTPUT_PATH").value != "") {
			if (document.getElementById("OUTPUT_PATH").value.charAt(0) != '/') {
				dhx.alert("输出文件目录格式不正确，请以 / 开头");
				return;
			}
		}

		if (document.getElementById("OUTPUT_MOVE_PATH").value != "") {
			if (document.getElementById("OUTPUT_MOVE_PATH").value.charAt(0) != "/") {
				dhx.alert("输出文件移动目录格式不正确，请以 / 开头");
				return;
			}
		}
		if (document.getElementById("OUTPUT_RENAME_RULE").value != ""
				&& document.getElementById("OUTPUT_RENAME").value == "") {
			dhx.alert("请输入输出文件重命名");
			return;
		}

		allData.COL_NAME = document.getElementById("COL_NAME").value;
		allData.COL_ORIGIN = 1;
		allData.COL_TYPE = document.getElementById("COL_TYPE").value;
		allData.COL_DATATYPE = document.getElementById("COL_DATATYPE").value;
		allData.COL_DESCRIBE = document.getElementById("COL_DESCRIBE").value;
		allData.COL_RUN_DATASOURCE = document.getElementById("COL_RUN_DATASOURCE").value;
		allData.COL_TASK_NUMBER = document.getElementById("COL_TASK_NUMBER").value;
		allData.COL_TASK_PRIORITY = document
				.getElementById("COL_TASK_PRIORITY").value;
		allData.COL_SYS_INPUTPATH = document
				.getElementById("COL_SYS_INPUTPATH").value;

		allData.INPUT_DATASOURCE_ID = document
				.getElementById("INPUT_DATASOURCE_ID").value;
		allData.INPUT_FILELST_TYPE = document
				.getElementById("INPUT_FILELST_TYPE").value;
		allData.INPUT_FILELST_DATASOURCE_ID = document
				.getElementById("INPUT_FILELST_DATASOURCE_ID").value;
		allData.INPUT_QUERY_SQL = document.getElementById("INPUT_QUERY_SQL").value;
		allData.INPUT_PATH = document.getElementById("INPUT_PATH").value;
		allData.INPUT_FILE_RULE = document.getElementById("INPUT_FILE_RULE").value;
		allData.INPUT_DOTYPE = document.getElementById("INPUT_DOTYPE").value;
		allData.INPUT_MOVE_PATH = document.getElementById("INPUT_MOVE_PATH").value;
		allData.INPUT_RENAME_RULE = document
				.getElementById("INPUT_RENAME_RULE").value;
		allData.INPUT_RENAME = document.getElementById("INPUT_RENAME").value;

		allData.OUTPUT_DATASOURCE_ID = document
				.getElementById("OUTPUT_DATASOURCE_ID").value;
		allData.OUTPUT_PATH = document.getElementById("OUTPUT_PATH").value;
		allData.OUTPUT_RENAME_RULE = document
				.getElementById("OUTPUT_RENAME_RULE").value;
		allData.OUTPUT_RENAME = document.getElementById("OUTPUT_RENAME").value;
		allData.OUTPUT_MOVE_PATH = document.getElementById("OUTPUT_MOVE_PATH").value;
		allData.NOTE = document.getElementById("NOTE").value;
		allData.IS_COMPRESS = document.getElementById("IS_COMPRESS").value;
		allData.PLUGIN_CODE = pluginValue;

		if (document.getElementById("COL_ID").value != "") {
			allData.COL_ID = document.getElementById("COL_ID").value;
		}
		if (document.getElementById("COL_PAR_ID").value != "") {
			allData.COL_PAR_ID = document.getElementById("COL_PAR_ID").value;
		}

		CollectionAction.insertJob(allData, function(rs) {
			dhx.closeProgress();
			if (rs.RESULT) {
				dhx.alert("保存成功！");
				document.getElementById("COL_ID").value = rs.COL_ID;
				
				cleanForm();
				dataListTable.refreshData();
				allData = {};
			} else {
				dhx.alert("保存失败！" + rs.MESSAGE);
			}
		});
	};

	//新增事件
	var add_CleanBtn = document.getElementById("add_CleanBtn");
	add_CleanBtn.onclick = cleanForm;

    var col_pluginBtn = document.getElementById("pluginBtn");
    attachObjEvent(col_pluginBtn,"onclick",function(){
   	 pluginFun();
    });
    
    var col_pluginValueExample = document.getElementById("pluginValueExample");
    pluginExample("pluginValueExample");
    attachObjEvent(col_pluginValueExample,"onmouseover",function(){
   	 pluginExample("pluginValueExample");
    });
    
	//关闭事件
	var add_CloseBtn = document.getElementById("add_CloseBtn");
	attachObjEvent(add_CloseBtn, "onclick", function() {
		if(window.parent && window.parent.closeTab)
            window.parent.closeTab(menuStr);
        else
            window.close();
	});

	//初始化新增参数表格
	addParamGridInit();
	dataListTable.setReFreshCall(queryListData);
	dataListTable.refreshData();
	//dataListTable.grid.selectRow(1)

	//grid.selectRowById()
    if(flag!='add'){

    	
    }
}
function cleanForm() {
	document.getElementById("COL_PAR_ID").value = "";
	document.getElementById("OUTPUT_DATASOURCE_ID").value = "";
	document.getElementById("OUTPUT_DATASOURCE_NAME").value = "";
	document.getElementById("OUTPUT_PATH").value = "";
	document.getElementById("OUTPUT_RENAME_RULE").value = "";
	document.getElementById("OUTPUT_RENAME").value="";
	document.getElementById("OUTPUT_MOVE_PATH").value = "";
	document.getElementById("NOTE").value = "";
	document.getElementById("IS_COMPRESS").value= 0;
	sourceInfo("OUTPUT_DATASOURCE_ID","OUTPUT_DATASOURCE_NAME");
	
	tid = 0;
	document.getElementById("add_SaveBtn").value = "新增";
}

var selectDataSourceWindow = null;
var dsid = null;
var dsname = null;
function openDataSourceTableWin(obj,id,name){
    if(!selectDataSourceWindow){
    	if(flag=='info'){
    		return;
    	}
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
				sourceInfo(dsid,dsname);
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
function dataDataSourceTableInit() {
	dataDataSourceTable = new meta.ui.DataTable("tableSelectDataSourceContent");//第二个参数表示是否是表格树
	dataDataSourceTable.setColumns( {
		OPP : "选择行",
		DATA_SOURCE_ID : "数据源ID",
		DATA_SOURCE_NAME : "数据源名称",
		SOURCE_NAME : "源类型名称"
	}, "OPP,DATA_SOURCE_ID,DATA_SOURCE_NAME,SOURCE_NAME,SOURCE_TYPE_ID");
	dataDataSourceTable.setRowIdForField("DATA_SOURCE_ID");
	dataDataSourceTable.setPaging(true, 20);//分页
	dataDataSourceTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
	dataDataSourceTable.grid.setInitWidthsP("5,30,30,35");
	dataDataSourceTable.setGridColumnCfg(0, {
		align : "center",
		type : "ra"
	});
	dataDataSourceTable.setGridColumnCfg(1, {
		align : "center"
	});
	dataDataSourceTable.setGridColumnCfg(2, {
		align : "center"
	});
	dataDataSourceTable.setGridColumnCfg(3, {
		align : "center"
	});

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


function queryDataSourceData(dt, params) {
	// var keyWord = $('tableProgramSearch').value;
	var queryData = {};
    var sourceName = $('searchSourceName').value;
    if(sourceName!=''){
    	queryData.DATA_SOURCE_NAME = sourceName;
    }
    if(dsid=='COL_RUN_DATASOURCE'){
    	queryData.SOURCE_CATE=2;
    }else{
    	queryData.SOURCE_CATE=1;
    }
	// queryData.keyWord = keyWord;
	BigDataSourceAction.queryDataSource(queryData, {
		posStart : params.page.rowStart,
		count : params.page.pageSize
	}, function(data) {
		dhx.closeProgress();
		var total = 0;
		if (data && data[0])
			total = data[0]["TOTAL_COUNT_"];
			dataDataSourceTable.bindData(data, total); //查询出数据后，必须显示调用绑定数据的方法
		});
}

//添加验证信息
function createValidate(){
    var validationV = [
        {target:"COL_NAME",rule:"NotEmpty,MaxLength[80]"},
        {target:"COL_TASK_NUMBER",rule:"Num,NotEmpty,MaxLength[10]"},
        {target:"COL_SYS_INPUTPATH",rule:"NotEmpty,MaxLength[128]"},
        {target:"COL_DESCRIBE",rule:"MaxLength[80]"},
        {target:"OUTPUT_PATH",rule:"NotEmpty,MaxLength[128]"},
        {target:"INPUT_QUERY_SQL",rule:"MaxLength[128]"},
        {target:"INPUT_PATH",rule:"MaxLength[128]"},
        {target:"INPUT_FILE_RULE",rule:"MaxLength[80]"},
        {target:"INPUT_MOVE_PATH",rule:"MaxLength[128]"},
        {target:"INPUT_RENAME_RULE",rule:"MaxLength[80]"},
        {target:"INPUT_RENAME",rule:"MaxLength[80]"},
        {target:"OUTPUT_RENAME_RULE",rule:"MaxLength[80]"},
        {target:"OUTPUT_RENAME",rule:"MaxLength[80]"},
        {target:"OUTPUT_MOVE_PATH",rule:"MaxLength[128]"},
        {target:"NOTE",rule:"MaxLength[128]"}
    ];
    dhtmlxValidation.addValidation($("collectForm"),validationV);
}

//初始数据表格
function addParamGridInit() {
	dataListTable = new meta.ui.DataTable("collectListGrid");
	dataListTable
			.setColumns(
					{
						OUTPUT_DATASOURCE_ID : "输出数据源ID",
						OUTPUT_DATASOURCE_NAME : "输出数据源名称",
						OUTPUT_PATH : "输出文件目录",
						OUTPUT_RENAME_RULE : "输出文件重命名规则",
						OUTPUT_MOVE_PATH : "输出文件移动目录",
						OPP : "操作"
					},
					"OUTPUT_DATASOURCE_ID,OUTPUT_DATASOURCE_NAME,OUTPUT_PATH,OUTPUT_RENAME_RULE,OUTPUT_MOVE_PATH,ID,NOTE,COL_ID,INPUT_DATASOURCE_ID,INPUT_DATASOURCE_NAME,INPUT_FILELST_TYPE,INPUT_FILE_RULE,INPUT_DOTYPE,ID,INPUT_FILELST_DATASOURCE_ID,INPUT_QUERY_SQL,INPUT_PATH,INPUT_MOVE_PATH,INPUT_RENAME_RULE,NOTE,INPUT_FILELST_DATASOURCE_NAME"
							+ ",INPUT_SOURCE_NAME,INPUT_FILELST_SOURCE_NAME,OUTPUT_SOURCE_NAME");
	dataListTable.setPaging(true, 20);//分页
	dataListTable.setRowIdForField("ID");
	dataListTable.render();
	if(flag=="info"){
		dataListTable.grid.setInitWidthsP("15,20,20,20,25,0");
	}else{
		dataListTable.grid.setInitWidthsP("15,20,20,20,20,5");
	}
	dataListTable.setGridColumnCfg(0, {
		align : "left"
	});
	dataListTable.setGridColumnCfg(1, {
		align : "left"
	});
	dataListTable.setGridColumnCfg(2, {
		align : "left"
	});
	dataListTable.setGridColumnCfg(3, {
		align : "left"
	});
	dataListTable.setGridColumnCfg(4, {
		align : "left"
	});

    dataListTable.grid.attachEvent("onRowSelect", function(rId,cInd){
    	onrowclick(rId);
	});
    dataListTable.grid.attachEvent("onRowDblClicked", function(rId,cInd){
    	onrowclick(rId);
	});
    
	dataListTable.setFormatCellCall(function(rid, cid, data, colId) {
		if (colId == "OPP") {
			if(flag!='info')
			return "<a href='javascript:void(0)' onclick='delPar("
					+ dataListTable.getUserData(rid, "ID")
					+ ");return false;'>删除</a>";
			else
				return "";
		}
		if (colId == "OUTPUT_DATASOURCE_ID") {
			return "<a href='javascript:void(0)' onclick='openViewDataSource("
					+ dataListTable.getUserData(rid, "OUTPUT_DATASOURCE_ID")
					+ ",\""
					+ dataListTable.getUserData(rid, "OUTPUT_DATASOURCE_NAME")
					+ "\",\""
					+ dataListTable.getUserData(rid, "OUTPUT_SOURCE_NAME")
					+ "\");return false;'>" + data[cid] + "</a>";
		}
    	if(colId=="OUTPUT_DATASOURCE_NAME"){
    		return "<a href='javascript:void(0)' onclick='onrowclick("+rid+");return false;'>"+data[cid]+"</a>";
    	}
		return data[cid];
	});

	return dataListTable;
}

function delPar(collectParId){
    dhx.confirm("您确定要删除配置吗？", function (rs) {
        if (rs) {
            dhx.showProgress("正在执行删除...");
            CollectionAction.deletePar(collectParId,function(rs){
                dhx.closeProgress();
                if(rs==1){
                    dhx.alert("删除成功！");
                    cleanForm();
                    dataListTable.refreshData();
                }else if(rs==2){
                    dhx.alert("删除失败,至少需要一项采集信息！");
                }else{
                    dhx.alert("删除失败！");
                }
            });
        }
    });
}


function onrowclick(id){
	if(tid!=0){
		if(
			(document.getElementById("OUTPUT_DATASOURCE_ID").value!=(dataListTable.getUserData(tid,"OUTPUT_DATASOURCE_ID")==null?"":dataListTable.getUserData(tid,"OUTPUT_DATASOURCE_ID")))||
			(document.getElementById("OUTPUT_DATASOURCE_NAME").value!=(dataListTable.getUserData(tid,"OUTPUT_DATASOURCE_NAME")==null?"":dataListTable.getUserData(tid,"OUTPUT_DATASOURCE_NAME")))||
			(document.getElementById("OUTPUT_PATH").value!=(dataListTable.getUserData(tid,"OUTPUT_PATH")==null?"":dataListTable.getUserData(tid,"OUTPUT_PATH")))||
			(document.getElementById("OUTPUT_RENAME_RULE").value!=(dataListTable.getUserData(tid,"OUTPUT_RENAME_RULE")==null?"":dataListTable.getUserData(tid,"OUTPUT_RENAME_RULE")))||
			(document.getElementById("OUTPUT_RENAME").value!=(dataListTable.getUserData(tid,"OUTPUT_RENAME")==null?"":dataListTable.getUserData(tid,"OUTPUT_RENAME")))||
			(document.getElementById("OUTPUT_MOVE_PATH").value!=(dataListTable.getUserData(tid,"OUTPUT_MOVE_PATH")==null?"":dataListTable.getUserData(tid,"OUTPUT_MOVE_PATH")))||
			(document.getElementById("NOTE").value!=(dataListTable.getUserData(tid,"NOTE")==null?"":dataListTable.getUserData(tid,"NOTE")))||
			(document.getElementById("INPUT_DATASOURCE_ID").value != (dataListTable.getUserData(tid,"INPUT_DATASOURCE_ID")==null?"":dataListTable.getUserData(tid,"INPUT_DATASOURCE_ID")))||
			(document.getElementById("INPUT_DATASOURCE_NAME").value != (dataListTable.getUserData(tid,"INPUT_DATASOURCE_NAME")==null?"":dataListTable.getUserData(tid,"INPUT_DATASOURCE_NAME")))||
			(document.getElementById("INPUT_FILELST_TYPE").value != (dataListTable.getUserData(tid,"INPUT_FILELST_TYPE")==null?"":dataListTable.getUserData(tid,"INPUT_FILELST_TYPE")))||
			(document.getElementById("INPUT_FILELST_DATASOURCE_ID").value != (dataListTable.getUserData(tid,"INPUT_FILELST_DATASOURCE_ID")==null?"":dataListTable.getUserData(tid,"INPUT_FILELST_DATASOURCE_ID")))||
			(document.getElementById("INPUT_FILELST_DATASOURCE_NAME").value != (dataListTable.getUserData(tid,"INPUT_FILELST_DATASOURCE_NAME")==null?"":dataListTable.getUserData(tid,"INPUT_FILELST_DATASOURCE_NAME")))||
			(document.getElementById("INPUT_QUERY_SQL").value != (dataListTable.getUserData(tid,"INPUT_QUERY_SQL")==null?"":dataListTable.getUserData(tid,"INPUT_QUERY_SQL")))||
			(document.getElementById("INPUT_PATH").value != (dataListTable.getUserData(tid,"INPUT_PATH")==null?"":dataListTable.getUserData(tid,"INPUT_PATH")))||
			(document.getElementById("INPUT_FILE_RULE").value != (dataListTable.getUserData(tid,"INPUT_FILE_RULE")==null?"":dataListTable.getUserData(tid,"INPUT_FILE_RULE")))||
			(document.getElementById("INPUT_DOTYPE").value != (dataListTable.getUserData(tid,"INPUT_DOTYPE")==null?"":dataListTable.getUserData(tid,"INPUT_DOTYPE")))||
			(document.getElementById("INPUT_MOVE_PATH").value != (dataListTable.getUserData(tid,"INPUT_MOVE_PATH")==null?"":dataListTable.getUserData(tid,"INPUT_MOVE_PATH")))||
			(document.getElementById("INPUT_RENAME_RULE").value != (dataListTable.getUserData(tid,"INPUT_RENAME_RULE")==null?"":dataListTable.getUserData(tid,"INPUT_RENAME_RULE")))||
			(document.getElementById("INPUT_RENAME").value != (dataListTable.getUserData(tid,"INPUT_RENAME")==null?"":dataListTable.getUserData(tid,"INPUT_RENAME")))
		){
		    dhx.confirm("你已经修改了部分值，切换将会丢失这些修改信息，你确定要切换吗", function (rs) {
		        if (rs) {
					rowclick(id);
		        }else{
		        	dataListTable.grid.selectRowById(tid);
		        	return;
		        }
		    });
		}else{
			rowclick(id);
		}
	}else{
		rowclick(id);
	}
	
}

function rowclick(id){
	if(id==null){
		return;
	}
		tid = id;
		document.getElementById("COL_PAR_ID").value=dataListTable.getUserData(id,"ID");
		
		document.getElementById("OUTPUT_DATASOURCE_ID").value=dataListTable.getUserData(id,"OUTPUT_DATASOURCE_ID")==null?"":dataListTable.getUserData(id,"OUTPUT_DATASOURCE_ID");
		document.getElementById("OUTPUT_DATASOURCE_NAME").value=dataListTable.getUserData(id,"OUTPUT_DATASOURCE_NAME")==null?"":dataListTable.getUserData(id,"OUTPUT_DATASOURCE_NAME");
		document.getElementById("OUTPUT_PATH").value=dataListTable.getUserData(id,"OUTPUT_PATH")==null?"":dataListTable.getUserData(id,"OUTPUT_PATH");
		document.getElementById("OUTPUT_RENAME_RULE").value=dataListTable.getUserData(id,"OUTPUT_RENAME_RULE")==null?"":dataListTable.getUserData(id,"OUTPUT_RENAME_RULE");
		document.getElementById("OUTPUT_RENAME").value=dataListTable.getUserData(id,"OUTPUT_RENAME")==null?"":dataListTable.getUserData(id,"OUTPUT_RENAME");
		document.getElementById("OUTPUT_MOVE_PATH").value=dataListTable.getUserData(id,"OUTPUT_MOVE_PATH")==null?"":dataListTable.getUserData(id,"OUTPUT_MOVE_PATH");
		document.getElementById("NOTE").value=dataListTable.getUserData(id,"NOTE")==null?"":dataListTable.getUserData(id,"NOTE");
		
		document.getElementById("INPUT_DATASOURCE_ID").value = dataListTable.getUserData(id,"INPUT_DATASOURCE_ID")==null?"":dataListTable.getUserData(id,"INPUT_DATASOURCE_ID");
		document.getElementById("INPUT_DATASOURCE_NAME").value = dataListTable.getUserData(id,"INPUT_DATASOURCE_NAME")==null?"":dataListTable.getUserData(id,"INPUT_DATASOURCE_NAME");
		document.getElementById("INPUT_FILELST_TYPE").value = dataListTable.getUserData(id,"INPUT_FILELST_TYPE")==null?"":dataListTable.getUserData(id,"INPUT_FILELST_TYPE");
		document.getElementById("INPUT_FILELST_DATASOURCE_ID").value = dataListTable.getUserData(id,"INPUT_FILELST_DATASOURCE_ID")==null?"":dataListTable.getUserData(id,"INPUT_FILELST_DATASOURCE_ID");
		document.getElementById("INPUT_FILELST_DATASOURCE_NAME").value = dataListTable.getUserData(id,"INPUT_FILELST_DATASOURCE_NAME")==null?"":dataListTable.getUserData(id,"INPUT_FILELST_DATASOURCE_NAME");
		document.getElementById("INPUT_QUERY_SQL").value = dataListTable.getUserData(id,"INPUT_QUERY_SQL")==null?"":dataListTable.getUserData(id,"INPUT_QUERY_SQL");
		document.getElementById("INPUT_PATH").value = dataListTable.getUserData(id,"INPUT_PATH")==null?"":dataListTable.getUserData(id,"INPUT_PATH");
		document.getElementById("INPUT_FILE_RULE").value = dataListTable.getUserData(id,"INPUT_FILE_RULE")==null?"":dataListTable.getUserData(id,"INPUT_FILE_RULE");
		document.getElementById("INPUT_DOTYPE").value = dataListTable.getUserData(id,"INPUT_DOTYPE")==null?"":dataListTable.getUserData(id,"INPUT_DOTYPE");
		document.getElementById("INPUT_MOVE_PATH").value = dataListTable.getUserData(id,"INPUT_MOVE_PATH")==null?"":dataListTable.getUserData(id,"INPUT_MOVE_PATH");
		document.getElementById("INPUT_RENAME_RULE").value = dataListTable.getUserData(id,"INPUT_RENAME_RULE")==null?"":dataListTable.getUserData(id,"INPUT_RENAME_RULE");
		document.getElementById("INPUT_RENAME").value = dataListTable.getUserData(id,"INPUT_RENAME")==null?"":dataListTable.getUserData(id,"INPUT_RENAME");
		document.getElementById("IS_COMPRESS").value = dataListTable.getUserData(id,"IS_COMPRESS")==null?0:dataListTable.getUserData(id,"IS_COMPRESS");
		
		var dataTypeName = document.getElementById("INPUT_FILELST_TYPE");
		var dataTypeId   = dataTypeName.options[dataTypeName.selectedIndex].value;
		//判断数据类型
		if(dataTypeId ==0){
			document.getElementById("INPUT_FILELST_DATASOURCE_NAME").disabled = "disabled";
			document.getElementById("INPUT_QUERY_SQL").disabled = "disabled";
			document.getElementById("INPUT_PATH").disabled = "";
		}else if(dataTypeId ==1){
			document.getElementById("INPUT_FILELST_DATASOURCE_NAME").disabled = "";
			document.getElementById("INPUT_QUERY_SQL").disabled = "";
			document.getElementById("INPUT_PATH").disabled = "disabled";
		}else{
			return ;
		}

		dataTypeName = document.getElementById("INPUT_DOTYPE");
		dataTypeId   = dataTypeName.options[dataTypeName.selectedIndex].value;
		//判断数据类型
		if(dataTypeId ==2){
			document.getElementById("INPUT_MOVE_PATH").disabled = "";
			document.getElementById("INPUT_RENAME_RULE").disabled = "disabled";
			document.getElementById("INPUT_RENAME").disabled = "disabled";
		}else if(dataTypeId ==3){
			document.getElementById("INPUT_MOVE_PATH").disabled = "";
			document.getElementById("INPUT_RENAME_RULE").disabled = "";
			document.getElementById("INPUT_RENAME").disabled = "";
		}else if(dataTypeId ==4){
			document.getElementById("INPUT_MOVE_PATH").disabled = "disabled";
			document.getElementById("INPUT_RENAME_RULE").disabled = "";
			document.getElementById("INPUT_RENAME").disabled = "";
		}else{
			document.getElementById("INPUT_MOVE_PATH").disabled = "disabled";
			document.getElementById("INPUT_RENAME_RULE").disabled = "disabled";
			document.getElementById("INPUT_RENAME").disabled = "disabled";
		}
		
		document.getElementById("add_SaveBtn").value="修改";
		sourceInfo("OUTPUT_DATASOURCE_ID","OUTPUT_DATASOURCE_NAME");
}

function queryListData(dt,params){
    CollectionAction.queryParamById({COL_ID:document.getElementById("COL_ID").value},{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
    	dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
    	dataListTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

//改变下拉框事件
function selectTpye(){
	var dataTypeName = document.getElementById("INPUT_FILELST_TYPE");
	var dataTypeId   = dataTypeName.options[dataTypeName.selectedIndex].value;
	//判断数据类型
	if(dataTypeId ==0){
		document.getElementById("INPUT_FILELST_DATASOURCE_NAME").disabled = "disabled";
		document.getElementById("INPUT_QUERY_SQL").disabled = "disabled";
		document.getElementById("INPUT_PATH").disabled = "";
	}else if(dataTypeId ==1){
		document.getElementById("INPUT_FILELST_DATASOURCE_NAME").disabled = "";
		document.getElementById("INPUT_QUERY_SQL").disabled = "";
		document.getElementById("INPUT_PATH").disabled = "disabled";
	}else{
		return ;
	}
}

//改变下拉框事件
function selectTpye2(){
	var dataTypeName = document.getElementById("INPUT_DOTYPE");
	var dataTypeId   = dataTypeName.options[dataTypeName.selectedIndex].value;
	//判断数据类型
	if(dataTypeId ==2){
		document.getElementById("INPUT_MOVE_PATH").disabled = "";
		document.getElementById("INPUT_RENAME_RULE").disabled = "disabled";
		document.getElementById("INPUT_RENAME").disabled = "disabled";
	}else if(dataTypeId ==3){
		document.getElementById("INPUT_MOVE_PATH").disabled = "";
		document.getElementById("INPUT_RENAME_RULE").disabled = "";
		document.getElementById("INPUT_RENAME").disabled = "";
	}else if(dataTypeId ==4){
		document.getElementById("INPUT_MOVE_PATH").disabled = "disabled";
		document.getElementById("INPUT_RENAME_RULE").disabled = "";
		document.getElementById("INPUT_RENAME").disabled = "";
	}else{
		document.getElementById("INPUT_MOVE_PATH").disabled = "disabled";
		document.getElementById("INPUT_RENAME_RULE").disabled = "disabled";
		document.getElementById("INPUT_RENAME").disabled = "disabled";
	}
}

var viewDataSourceWindows =null; 
function openViewDataSource(dataSourceId,dataSourceName,sourceName){
	if(!viewDataSourceWindows){
	    var dhxWindow = new dhtmlXWindows();
	    var winsize = Tools.propWidthDycSize(10, 10, 10, 16);
	    dhxWindow.createWindow("viewDataSourceWindows", 0, 0, 450, 300);
	    viewDataSourceWindows = dhxWindow.window("viewDataSourceWindows");
	    viewDataSourceWindows.stick();
	    viewDataSourceWindows.setModal(true);
	    viewDataSourceWindows.setDimension(winsize.width, winsize.height - 50);
	    viewDataSourceWindows.button("minmax1").hide();
	    viewDataSourceWindows.button("park").hide();
	    viewDataSourceWindows.button("stick").hide();
	    viewDataSourceWindows.button("sticked").hide();
	    viewDataSourceWindows.center();
	    viewDataSourceWindows.denyResize();
	    viewDataSourceWindows.denyPark();
	    viewDataSourceWindows.setText("查看数据源");
	    viewDataSourceWindows.keepInViewport(true);
	    
	    //添加查询内容
	    var layout = new dhtmlXLayoutObject(viewDataSourceWindows, "2E");
	    layout.cells("a").setHeight(200);
	    layout.cells("a").fixSize(false, true);
	    layout.cells("a").firstChild.style.height = (layout.cells("a").firstChild.offsetHeight + 5) + "px";
	    layout.cells("a").hideHeader();
	    layout.cells("a").attachObject("_viewDataSourceForm");
	    layout.cells("b").hideHeader();
	    layout.cells("b").setHeight(30);
	    layout.cells("b").attachObject("_BtnBottom");
	    
	    //初始化数据
	    viewDataSourceGridInit(dataSourceId,dataSourceName,sourceName);
		var closeBtn = document.getElementById("closeBtn");
	    //关闭按钮
	    attachObjEvent(closeBtn,"onclick",function(e){
	            viewDataSourceWindows.hide();
	            viewDataSourceWindows.setModal(false);
	            return false;
	    });
       //窗体关闭事件
        viewDataSourceWindows.attachEvent("onClose",function(){
            viewDataSourceWindows.setModal(false);
            viewDataSourceWindows.hide();
            return false;
        });
	}else{
		viewDataSourceWindows.show();
        viewDataSourceWindows.setModal(true);
	}
	//数据
	dataViewParamTable.setReFreshCall(BigDataSourceAction.queryParamByDataSourceId({DATA_SOURCE_ID:dataSourceId},function(data){
		dataViewParamTable.bindData(data); 
		})
	);
	//初始化数据源名称
    $("viewDataSourceName").innerHTML = dataSourceName;
	//初始化源类型名称
    $("viewSourceTypeName").innerHTML = sourceName;
}

//初始数据表格
function viewDataSourceGridInit(dataSourceId,dataSourceName,sourceName){

    dataViewParamTable = new meta.ui.DataTable("gridDataSourceParamView",false);
    dataViewParamTable.setColumns({
        PARAM_NAME:"参数名称",
        PARAM_VALUE:"参数值",
        PARAM_DESC:"参数描述"
    },"PARAM_NAME,PARAM_VALUE,PARAM_DESC");
    dataViewParamTable.setPaging(false);//分页
    dataViewParamTable.setSorting(false);
    dataViewParamTable.render();
    dataViewParamTable.grid.setInitWidthsP("30,30,40");
    dataViewParamTable.setGridColumnCfg(0,{align:"left"});
    dataViewParamTable.setGridColumnCfg(1,{align:"left"});
    dataViewParamTable.setGridColumnCfg(2,{align:"left"});

    dataViewParamTable.setFormatCellCall(function(rid,cid,data,colId){
        return data[cid];
    });

    return dataViewParamTable;
}
function sourceInfo(id,name){
	var dataSourceId = $(id).value;
	var dataSourceName = $(name).value;
	var source = $(name);
	BigDataSourceAction.queryParamByDataSourceId({DATA_SOURCE_ID:dataSourceId},function(data){
		var html = "<table class='MetaFormTable'>";
		for(var i=0;i<data.length;i++){
			html+="<tr><td style=\"width: 150px\">"+data[i].PARAM_NAME+"</td><td style=\"width: 150px\">"+(data[i].PARAM_VALUE==null?"":data[i].PARAM_VALUE)+"</td></tr>";
		}
		html += "</table>";
		source.setAttribute("systemText",html);
	    attachObjEvent(source,"onmouseover",function(e){
	    	if(e.srcElement && e.srcElement.getAttribute("systemText")){
	            var paramDiv = document.getElementById("paramDIV");
	            //$("paramTitle").innerHTML = "<span title='数据格式' style='font-weight:normal;color:#b07e6f'>数据源信息：</span>";
	            $("paramDIV").innerHTML = e.srcElement.getAttribute("systemText");
	            var pos = autoPosition(paramDiv,e.srcElement,true,false,Math.min(e.srcElement.offsetWidth-50,e.srcElement.parentNode.offsetWidth-50),-(e.srcElement.offsetHeight-20));
	    	}
	    });
	});
}

/**
 *插件窗体
**/
function pluginFun(){
	if ($("pluginCode").readOnly){
		document.getElementById("pluginSaveBtn").style.visibility = "hidden";
	    document.getElementById("pluginCalBtn").style.visibility = "hidden";
	}else{
		document.getElementById("pluginCloseBtn").style.visibility = "hidden";
	}
	
   var title = "";
   var pluginCode = document.getElementById("pluginCode");
   title = "插件内容";
   pluginCode.value = pluginValue;
   if(!pluginMaintainWin){
       pluginMaintainWin = DHTMLXFactory.createWindow("1","pluginMaintainWin",0,0,552,480);
       pluginMaintainWin.stick();
       pluginMaintainWin.denyResize();
       pluginMaintainWin.denyPark();
       pluginMaintainWin.center();
       
       var divPlugin = document.getElementById("div_plugin");
       pluginMaintainWin.attachObject(divPlugin);
       var saveBtn = document.getElementById("pluginSaveBtn");
       var calBtn = document.getElementById("pluginCalBtn");
       var closeBtn = document.getElementById("pluginCloseBtn");
       attachObjEvent(saveBtn,"onclick",savePluginValue);
       attachObjEvent(calBtn,"onclick",function(){pluginMaintainWin.close();});
       attachObjEvent(closeBtn,"onclick",function(){pluginMaintainWin.close();});
       
       pluginMaintainWin.attachEvent("onClose",function(){
           pluginMaintainWin.setModal(false);
           this.hide();
           return false;
       });
   }
   pluginMaintainWin.setText(title);
   pluginMaintainWin.setModal(true);
   pluginMaintainWin.show();
   pluginMaintainWin.center();
}

//保存HBase数据源
function savePluginValue(){
    if(!(dhtmlxValidation.validate("div_plugin")))return;
    pluginValue = document.getElementById("pluginCode").value;
    pluginMaintainWin.close();
}

function pluginExample(id){
	var source = $(id);
	var html = "<textarea style=\"text-align: left;\" rows=\"20\" cols=\"70\"  readonly=\"readonly\">";
	html +="package com.ery.hadoop.mrddx.remote.plugin;";
	html +="\r\n";
	html +="import java.io.IOException;";
	html +="\r\n";
	html +="import java.util.Map;";
	html +="\r\n";
	html +="import org.apache.hadoop.mapred.JobConf;";
	html +="\r\n";
	html +="/**";
	html +="\r\n";
	html +=" * 插件接口";
	html +="\r\n";
	html +=" *";
	html +="\r\n";
	html +=" */";
	html +="\r\n";
	html +="public interface IRemotePlugin {";
	html +="\r\n";
	html +="\r\n";
	html +="	/**";
	html +="\r\n";
	html +="	 * 处理采集文件（适用于按行读取的处理）";
	html +="\r\n";
	html +="	 * @param lineValue 行记录";
	html +="\r\n";
	html +="	 * @return 返回处理过后的行记录值，返回null表示过滤掉该记录";
	html +="\r\n";
	html +="	 * @throws IOException";
	html +="\r\n";
	html +="	 */";
	html +="\r\n";
	html +="	public String line(String lineValue) throws IOException;";
	html +="\r\n";
	html +="\r\n";
	html +="	/**";
	html +="\r\n";
	html +="	 * 除采集文件之外（适用于拆分字段后的处理）这里只需空实现";
	html +="\r\n";
	html +="	 * @param recode 记录";
	html +="\r\n";
	html +="	 * @return false表示需被过滤掉的数据";
	html +="\r\n";
	html +="	 * @throws IOException";
	html +="\r\n";
	html +="	 */";
	html +="\r\n";
	html +="	public boolean recode(Map<String, Object> recode) throws IOException;";
	html +="\r\n";
	html +="\r\n";
	html +="	/**";
	html +="\r\n";
	html +="	 * 配置相关内容";
	html +="\r\n";
	html +="	 * @param job";
	html +="\r\n";
	html +="	 */";
	html +="\r\n";
	html +="	public void configure(JobConf job);";
	html +="\r\n";
	html +="\r\n";
	html +="	/**";
	html +="\r\n";
	html +="	 * 关闭资源";
	html +="\r\n";
	html +="	 * @throws IOException";
	html +="\r\n";
	html +="	 */";
	html +="\r\n";
	html +="	public void close() throws IOException;";
	html +="\r\n";
	html +="}";
	html += "</textarea>";
	source.setAttribute("systemText",html);
    attachObjEvent(source,"onmouseover",function(e){
    	if(e.srcElement && e.srcElement.getAttribute("systemText")){
            var pluginExampleDIV = document.getElementById("pluginExampleDIV");
            //$("paramTitle").innerHTML = "<span title='数据格式' style='font-weight:normal;color:#b07e6f'>数据源信息：</span>";
            $("pluginExampleDIV").innerHTML = e.srcElement.getAttribute("systemText");
            var pos = autoPosition(pluginExampleDIV,e.srcElement,true,false,Math.min(e.srcElement.offsetWidth-50,e.srcElement.parentNode.offsetWidth-50),-(e.srcElement.offsetHeight-20));
    	}
    });
}

dhx.ready(pageInit);