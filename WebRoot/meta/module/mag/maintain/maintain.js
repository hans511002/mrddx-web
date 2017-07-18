/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *
 *Description：
 *
 *Dependent：
 *
 *Author:
 *        李国民
 *Finished：
 *       2012-05-21
 *Modified By：
 *
 * Modified Date:
 *
 * Modified Reasons:

 ********************************************************/

dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
/**
 * 声明dwrCaller
 */
var dwrCaller = new biDwrCaller();
var dhxWindow = null;
var dataInfo = {};				//缓存数据
var grid = null;
var queryForm = null;
var dataWindow = null;			//弹出窗口
var showViewData = null;		//缓存html
var addOrUpdateData = null;
var addFromData = null;

//新增表数据
dwrCaller.addAutoAction("addData","MaintainAction.addData");
//修改表数据
dwrCaller.addAutoAction("updateData","MaintainAction.updateData");
//删除表数据
dwrCaller.addAutoAction("deleteData","MaintainAction.deleteData");

//查询表信息
dwrCaller.addAutoAction("queryTableInfo","MaintainAction.queryTableInfo");

// 查询表数据
var param = new biDwrMethodParam();
param.setParamConfig([
    {
       index:0,type:"fun",value:function() {
    		var data = queryForm.getFormData();
			data.tableInfo = dataInfo.table;
			/************对input框值进行重设，用于修复回车事件bug**********/
			var searchData = dataInfo.showSearchList;
			for(var i=0;i<searchData.length;i++){
				if(searchData[i].QUERY_CONTROL==0){
					data[("search"+searchData[i].MAINTAIN_QUERY_ID)] = 
						Tools.trim(queryForm.getInput("search"+searchData[i].MAINTAIN_QUERY_ID).value);
				}
			}
			return data;
   	   	}
    }
]);
dwrCaller.addAutoAction("queryTableData","MaintainAction.queryTableData",param,function(data){
});
//查询表数据
var dataConverter = new dhtmxGridDataConverter({
	idColumnName:"",
	filterColumns:[],

	/**
	 * 把每一行数据返回到userData中
	 * @param rowIndex
	 * @param rowData
	 * @return userData
	 */
    userData:function(rowIndex, rowData) {
        var userData = rowData;
        return userData;
    },
	
    /**
     * 获取下拉框Button的值
     * @param rowIndex
     * @param columnIndex
     * @param cellValue`
     * @param rowData
     */
    cellDataFormat:function(rowIndex, columnIndex, columnName, cellValue, rowData) {
		for(var i=0;i<dataInfo.showQueryColumns.length;i++){
			var colName = Tools.tranColumnToJavaName(dataInfo.showQueryColumns[i].MAINTAIN_COLUMN_NAME.toLowerCase(),true);
			if (columnName == colName) {	//当值相等时
				//转换数据值
				var optionsData = dataInfo.dataFrom[dataInfo.showQueryColumns[i].MAINTAIN_COLUMN_ID];
				if(optionsData){
					//如果存在转换值，替换值
					for(var m=0;m<optionsData.length;m++){
						if(optionsData[m].CODE == cellValue){
							return optionsData[m].CODE_NAME;
						}
					}
				}
           		break;
        	}
		}
        if (columnName == '_buttons') {//操作按钮列
            return "getDataButtonsCol";
        }
        return this._super.cellDataFormat(rowIndex, columnIndex, columnName, cellValue, rowData);
   }
});
dwrCaller.addDataConverter("queryTableData",dataConverter);

//初始化界面
var init = function(){
	dhxWindow = new dhtmlXWindows();
	showViewData = $('_viewData');
	addOrUpdateData = $('_addOrUpdateData');
	addFromData = $('_fromData');
	setData();
}

//查询初始数据
var setData = function(){
    dwrCaller.executeAction("queryTableInfo",maintainId,function(data){
    	if(data){
    		dataInfo.table = data;
    		dataInfo.showQueryColumns = data.SHOW_QUERY_COLUMNS;
    		dataInfo.showEditColumns = data.SHOW_EDIT_COLUMNS;
    		dataInfo.showSearchList = data.SHOW_SEARCH_LIST;
    		dataInfo.dataFrom = data.DATA_FROM;
    		createWin();	
    	}
    });
}

//创建页面
var createWin = function(){
	/**************动态配置搜索条件开始*******************/
	var searchCol = [];
	searchCol.push({type:"settings",position: "label-left", inputWidth:120});
	var searchData = dataInfo.showSearchList;
	for(var i=0;i<searchData.length;i++){
		if(searchData[i].QUERY_CONTROL==1){		//当为下拉列表时
			var options = [];	
			var colIds = searchData[i].QUERY_COLUMNS.split(",");
			for(var j=0;j<colIds.length;j++){		//查询对应关联数据
				if(dataInfo.dataFrom[colIds[j]]){
					options.push({text:"全部",value:"-1"});		//添加全部选择项
					//绑定下拉列表数据
					var optionsData = dataInfo.dataFrom[colIds[j]];
					for(var m=0;m<optionsData.length;m++){
						options.push({text:(optionsData[m].CODE_NAME),value:(optionsData[m].CODE)});
					}
					break;
				}
			}
			searchCol.push({type:"select",label:(searchData[i].QUERY_COLUMN_TITLE+"："),
				name:("search"+searchData[i].MAINTAIN_QUERY_ID),inputHeight : 22,options:options});
		}else{
			searchCol.push({type:"input",label:(searchData[i].QUERY_COLUMN_TITLE+"："),
				name:("search"+searchData[i].MAINTAIN_QUERY_ID),inputHeight : 17});
		}
		searchCol.push({type:"newcolumn"});
	}
	searchCol.push({type:"button",name:"queryBtn",value:"查询",offsetLeft : 0,offsetTop : 0});
	/**************动态配置搜索条件*******************/
	
	var dhxLayout = new dhtmlXLayoutObject(document.body, "2E");
	dhxLayout.hideConcentrate();
	dhxLayout.hideSpliter();
	var topCell = dhxLayout.cells("a");
	topCell.setText(dataInfo.table.TABLE_TITLE);
	topCell.setHeight(80); 
	topCell.fixSize(true,true);
	queryForm = topCell.attachForm(
		searchCol
    );
	queryForm.attachEvent("onButtonClick", function(id) {
        if (id == "queryBtn") {
        	grid.clearAll();
    		grid.load(dwrCaller.queryTableData, "json");
        }
    });
	
	//添加input输入框回车事件
	for(var i=0;i<searchData.length;i++){
		if(searchData[i].QUERY_CONTROL==0){
			Tools.addEvent(queryForm.getInput("search"+searchData[i].MAINTAIN_QUERY_ID), "keyup", function(event){
				if (event.keyCode==13){		//当为回车时，查询信息
					//查询信息
		        	grid.clearAll();
		    		grid.load(dwrCaller.queryTableData, "json");
				}
			});
		}
	}
		
	//设置每一列的列id为主键id
	dataConverter.idColumnName=Tools.tranColumnToJavaName(dataInfo.table.TABLE_PRIMARY_ID_COLUMN.toLowerCase(),true);
	/*******动态生成grid列开始*********/
	var data = dataInfo.showQueryColumns;
	var colHeader = "";		//头信息
	var colName = "";		//列名
	var colHeard = ""		//列头位置
	var colAlign = "";		//列位置
	var colBoole = "";		//列尺寸
	var colTypes = "";		//列类型
	var colSorts = "";
	var colWidth = "";
	var isSP = data.length>11;
	for(var i=0;i<data.length;i++){
		colHeader += data[i].MAINTAIN_COLUMN_NAMECN+",";
		colName += Tools.tranColumnToJavaName(data[i].MAINTAIN_COLUMN_NAME.toLowerCase(),true)+",";
		colAlign += "left,";
		colHeard += "center,";
		colBoole += "true,";
		colTypes += "ro,";
		colSorts += "na,";
        dataConverter.filterColumns.push(Tools.tranColumnToJavaName(data[i].MAINTAIN_COLUMN_NAME.toLowerCase(),true));
		colWidth += "120,";
	}
	colHeader += "操作";
	colName += "_buttons";
	dataConverter.filterColumns.push("_buttons");
	colHeard += "center";
	colAlign += "center";
	colBoole += "true";
	colTypes += "sb";
	colSorts += "na";
	colWidth += "120";
	/*******动态生成grid列*********/
	
	/*********添加grid按钮开始*************/
    var base = getBasePath();
	var buttons = {
        modifyData:{name:"modifyData",text:"修改",imgEnabled:base + "/meta/resource/images/editRole.png",
            imgDisabled:base + "/meta/resource/images/editRole.png",onclick:function(rowData) {
                modifyData(rowData);
            }},
        deleteData:{name:"deleteData",text:"删除",imgEnabled:base + "/meta/resource/images/delete.png",
            imgDisabled :base + "/meta/resource/images/delete.png",onclick:function(rowData) {
                deleteData(rowData.id);
            }},
        viewData:{name:"viewData",text:"查看",imgEnabled:base + "/meta/resource/images/view.png",
            imgDisabled :base + "/meta/resource/images/view.png",onclick:function(rowData) {
                viewData(rowData);
            }}
    };
	var buttonCol=["viewData","modifyData","deleteData"];	
    window["getDataButtonsCol"]=function(){
        var res=[];
        for(var i=0;i<buttonCol.length;i++){
        	res.push(buttons[buttonCol[i]]);
        }
        return res;
    };
	/*********添加grid按钮*************/
    
	/***********添加grid头部按钮开始**************/
    var buttonToolBar = dhxLayout.cells("b").attachToolbar();
        buttonToolBar.addButton("addData", 1, "新增",base + "/meta/resource/images/addGroup.png", 
        	base + "/meta/resource/images/addGroup.png");
	/***********添加grid头部按钮**************/
	var middleCell = dhxLayout.cells("b");
	middleCell.fixSize(true,true);
	middleCell.setHeight(400);
	middleCell.hideHeader();
	grid = middleCell.attachGrid();
	grid.setHeader(colHeader);
    grid.setColumnIds(colName);
    if(dataInfo.table.QUERY_PERCENTAGE){
    	//如果存在设定宽度，设置宽度。
	    grid.setInitWidthsP(dataInfo.table.QUERY_PERCENTAGE);
    }else{
		if(isSP){	//如果超过长度，这是每一列宽度
	    	grid.setInitWidths(colWidth);
		}
    }
	grid.setColAlign(colAlign);			//列值显示位置
	grid.setHeaderAlign(colHeard)		//头显示位置
	grid.setColTypes(colTypes);			//列显示类型
	grid.setColSorting(colSorts);		//列值类型
	grid.enableResizing(colBoole);   	//能否改变大小
	grid.enableTooltips(colBoole);
	grid.setEditable(true);				//是否可以编辑
	grid.init();
	grid.defaultPaging(20);
    grid.load(dwrCaller.queryTableData, "json");
	
    //添加buttonToolBar事件
    buttonToolBar.attachEvent("onclick", function(id) {
        if (id == "addData") {//新增角色
        	addData();
        }
    });
    
    grid.entBox.onselectstart=function(){
        return true;
    }
}

////创建动态表单
//var createFrom = function(rowData){
//	/***************创建动态表单开始******************/
//	var fromData = dataInfo.showEditColumns		//可编辑的列
//	var columns = [];
//	var blockList =[];	 //block中的信息
//	for(var i=0;i<fromData.length;i++){
//		var isPush = false;		//是否换行
//		var notEmptyStr = "";	//显示信息
//		if(i%2==0){	//每行显示两列，如当前一行为两列时，换行操作
//			blockList =[];
//			blockList.push({type:"settings",position: "label-left", inputWidth:120});
//		}else{
//			blockList.push({type:"newcolumn"});
//			isPush = true;
//		}
//		if(fromData[i].VALIDATE_RULE!=null){
//			//当验证规则不为空，且存在必填验证时，添加红色星号显示信息
//			if(fromData[i].VALIDATE_RULE.toString().toLocaleUpperCase().indexOf("NOTEMPTY") != -1){
//				notEmptyStr = "<span style='color:red;'>*</span>";
//			}
//		}
//		//动态值
//		var editValue = rowData!=null?rowData.userdata[Tools.tranColumnToJavaName(fromData[i].MAINTAIN_COLUMN_NAME.toLowerCase(),true)]:"";
//		if(fromData[i].DATA_FROM){		//当为下拉列表时
//			var options = [];	
//			if(dataInfo.dataFrom[fromData[i].MAINTAIN_COLUMN_ID]){
//				//绑定下拉列表数据
//				var optionsData = dataInfo.dataFrom[fromData[i].MAINTAIN_COLUMN_ID];
//				for(var m=0;m<optionsData.length;m++){
//					options.push({text:(optionsData[m].CODE_NAME),value:(optionsData[m].CODE),
//						selected:(editValue == optionsData[m].CODE?true:false)});
//				}
//			}
//			blockList.push({type:"select",label:(notEmptyStr+fromData[i].MAINTAIN_COLUMN_NAMECN+"："),
//				name:(fromData[i].MAINTAIN_COLUMN_NAME),inputHeight:22,labelWidth:86,offsetLeft:8,
//				validate:(fromData[i].VALIDATE_RULE!=null?fromData[i].VALIDATE_RULE:""),options:options});
//		}else{
//			blockList.push({type:"input",label:(notEmptyStr+fromData[i].MAINTAIN_COLUMN_NAMECN+"："),
//				name:(fromData[i].MAINTAIN_COLUMN_NAME),inputHeight : 17,labelWidth:86,offsetLeft:8,
//				validate:(fromData[i].VALIDATE_RULE!=null?fromData[i].VALIDATE_RULE:""),
//				value:(editValue)});
//		}
//		if(isPush){	//当创建了两列时，把该行放到block块中
//			columns.push({type:"block",offsetTop:2,list:blockList});
//		}
//		//当为总数的最后一条，且剩下一行没有添加时，添加剩下的block
//		if(i%2==0 && i==fromData.length-1){
//			columns.push({type:"block",offsetTop:2,list:blockList});
//		}
//	}
//	var buttonList = [{type:"button",label:"保存",name:"save",value:"保存",offsetLeft:150},
//		    {type:"newcolumn"},
//		    {type:"button",label:"重置",name:"reset",value:"重置"},
//		    {type:"newcolumn"},
//		    {type:"button",label:"关闭",name:"close",value:"关闭"}];
//	columns.push({type:"block",offsetTop:15,list:buttonList});
//	columns.push({type:"hidden",name:"valId",value:(rowData!=null?rowData.id:"")});
//	var dataFormData = columns;
//	/***************创建动态表单******************/
//	var dateForm = dataWindow.attachForm(dataFormData);
//	return dateForm;
//}


//创建动态表单
var createHtmlFrom = function(rowData){
	/******************动态生成html开始*********************/
    var htmlStr = '<table cellpadding="0" cellspacing="0" style="width:100%;" id="viewDataTable">';
	var fromData = dataInfo.showEditColumns		//可编辑的列
	var rowCount = 0;
	for(var i=0;i<fromData.length;i++){
		var isPush = false;		//是否换行
		var notEmptyStr = "";	//显示信息
		if(fromData[i].VALIDATE_RULE!=null){
			//当验证规则不为空，且存在必填验证时，添加红色星号显示信息
			if(fromData[i].VALIDATE_RULE.toString().toLocaleUpperCase().indexOf("NOTEMPTY") != -1){
				notEmptyStr = "<span style='color:red;'>*</span>";
			}
		}
		
		if(i%2==0){	//每行显示两列，如当前一行为两列时，换行操作
			htmlStr += '<tr>';
		}else{
			isPush = true;
		}
		//动态值
		var addName = fromData[i].MAINTAIN_COLUMN_NAME;
		var viewName = fromData[i].MAINTAIN_COLUMN_NAMECN;
		var viewValue = rowData!=null?rowData.userdata[Tools.tranColumnToJavaName(fromData[i].MAINTAIN_COLUMN_NAME.toLowerCase(),true)]:"";
		viewValue = viewValue?viewValue:"";
		htmlStr += '<th width="18%">'+notEmptyStr+viewName+'：</th><td width="32%" style="valign:middle;">';
		if(fromData[i].DATA_FROM){		//当为下拉列表时
			if(dataInfo.dataFrom[fromData[i].MAINTAIN_COLUMN_ID]){
				htmlStr += '<select id="'+addName+'" name="'+addName+'" style="width:126px;">';
				//绑定下拉列表数据
				var optionsData = dataInfo.dataFrom[fromData[i].MAINTAIN_COLUMN_ID];
				for(var m=0;m<optionsData.length;m++){
					var selectCheck = "";
					if(rowData&&viewValue == optionsData[m].CODE){
						selectCheck = 'selected="selected"';
					}
					htmlStr += '<option value="'+optionsData[m].CODE+'" '+selectCheck+'>'+optionsData[m].CODE_NAME+'</option>';
					
				}
				htmlStr += '</select>'
			}
		}else{
			htmlStr += '<input type="text" style="width:120px;height:15px;" id="'+addName+'" name="'+addName+'" value="'+viewValue+'" />';
		}
		htmlStr += '</td>';
		if(isPush){	//当创建了两列时，进行换行
			htmlStr += '</tr>';
			rowCount++;
		}
		//当为总数的最后一条，切只有一列时，补充完整tr
		if(i%2==0 && i==fromData.length-1){
			htmlStr += '<th>&nbsp;</th><td>&nbsp;</td></tr>';
			rowCount++;
		}
	}
	var paddingHeight = 260-rowCount*25-35;		//关闭按钮div到顶部的高度
	htmlStr += '</table><input type="hidden" id="valId" name="valId" value="'+(rowData!=null?rowData.id:"")+'" />'+
	'<div id="closeButton" style="height:30px;text-align: right;' +
	'padding-top:'+(paddingHeight<10?10:paddingHeight)+'px;"></div>'
    /******************动态生成html*********************/
	return htmlStr;
}

//新增操作
var addData= function(){
	dhxWindow.createWindow("dataWindow", 0, 0, 500, 300);
	dataWindow = dhxWindow.window("dataWindow");
	dataWindow.setModal(true);
	dataWindow.stick();
	dataWindow.denyResize();
	dataWindow.denyPark();
	dataWindow.button("minmax1").hide();
	dataWindow.button("park").hide();
	dataWindow.button("stick").hide();
	dataWindow.button("sticked").hide();
	dataWindow.setText("新增信息");
	dataWindow.keepInViewport(true);
	dataWindow.center();
	dataWindow.show();
	
	var layout = new dhtmlXLayoutObject(dataWindow, "1C");
    layout.cells("a").fixSize(false, true);
    layout.cells("a").firstChild.style.height = (layout.cells("a").firstChild.offsetHeight + 5) + "px";
    layout.cells("a").hideHeader();
    layout.cells("a").attachObject(addFromData);
   	addOrUpdateData.innerHTML = createHtmlFrom(null);		//把动态生成html添加到div中
   	
   	/*******添加提示文字开始*******/
	var validate = [];
	var fromData = dataInfo.showEditColumns		//可编辑的列
	for(var i=0;i<fromData.length;i++){
		if(!fromData[i].DATA_FROM&&fromData[i].COLUMN_DESC){		//当不为下拉列表时
			Tools.addTip4Input($(fromData[i].MAINTAIN_COLUMN_NAME), 'input_click', fromData[i].COLUMN_DESC);
		}
		if(fromData[i].VALIDATE_RULE!=null){
			//添加验证
			validate.push({target:(fromData[i].MAINTAIN_COLUMN_NAME),rule:fromData[i].VALIDATE_RULE});
		}
	}
	/*******添加提示文字结束*******/
    /******************添加验证信息*********************/
    dhtmlxValidation.addValidation(addFromData, validate ,"true");
    /******************添加验证信息*********************/
	/****************添加按钮开始***********/
    var colseButton = Tools.getButtonNode("关闭");
    colseButton.style.cssFloat="right";
    colseButton.style.styleFloat="right";
    colseButton.style.marginRight="140px";
    colseButton.onclick = function(){
        dataWindow.close();
    }
    $("closeButton").appendChild(colseButton);
    var resetButton = Tools.getButtonNode("重置");
    resetButton.style.cssFloat="right";
    resetButton.style.styleFloat="right";
    resetButton.style.marginRight="5px";
    resetButton.onclick = function(){
        addFromData.reset();
    }
    $("closeButton").appendChild(resetButton);
    var addButton = Tools.getButtonNode("保存");
    addButton.style.cssFloat="right";
    addButton.style.styleFloat="right";
    addButton.style.marginRight="5px";
    addButton.onclick = function(){
    	if(dhtmlxValidation.validate(addFromData)){
			var data = Tools.getFormValues("_fromData");
			data.tableInfo = dataInfo.table;
			dwrCaller.executeAction("addData", data, function(rs) {
		    	if(rs){
		    		dhx.alert("新增成功！");
        			dataWindow.close();
		        	grid.clearAll();
		    		grid.load(dwrCaller.queryTableData, "json");
		    	}else{
		    		dhx.alert("新增失败！请联系管理员！");
		    	}
		   	});
    	}
    }
    $("closeButton").appendChild(addButton);
	/****************添加按钮结束***********/
}

//修改操作
var modifyData = function(rowData){
	dhxWindow.createWindow("dataWindow", 0, 0, 500, 300);
	dataWindow = dhxWindow.window("dataWindow");
	dataWindow.setModal(true);
	dataWindow.stick();
	dataWindow.denyResize();
	dataWindow.denyPark();
	dataWindow.button("minmax1").hide();
	dataWindow.button("park").hide();
	dataWindow.button("stick").hide();
	dataWindow.button("sticked").hide();
	dataWindow.setText("修改信息");
	dataWindow.keepInViewport(true);
	dataWindow.center();
	dataWindow.show();
	
	var layout = new dhtmlXLayoutObject(dataWindow, "1C");
    layout.cells("a").fixSize(false, true);
    layout.cells("a").firstChild.style.height = (layout.cells("a").firstChild.offsetHeight + 5) + "px";
    layout.cells("a").hideHeader();
    layout.cells("a").attachObject(addFromData);
   	addOrUpdateData.innerHTML = createHtmlFrom(rowData);		//把动态生成html添加到div中
    /******************添加验证信息*********************/
	var validate = [];
	var fromData = dataInfo.showEditColumns		//可编辑的列
	for(var i=0;i<fromData.length;i++){
		if(fromData[i].VALIDATE_RULE!=null){
			//添加验证
			validate.push({target:(fromData[i].MAINTAIN_COLUMN_NAME),rule:fromData[i].VALIDATE_RULE});
		}
	}
    dhtmlxValidation.addValidation(addFromData, validate ,"true");
    /******************添加验证信息*********************/
	/****************添加按钮开始***********/
    var colseButton = Tools.getButtonNode("关闭");
    colseButton.style.cssFloat="right";
    colseButton.style.styleFloat="right";
    colseButton.style.marginRight="140px";
    colseButton.onclick = function(){
        dataWindow.close();
    }
    $("closeButton").appendChild(colseButton);
    var resetButton = Tools.getButtonNode("重置");
    resetButton.style.cssFloat="right";
    resetButton.style.styleFloat="right";
    resetButton.style.marginRight="5px";
    resetButton.onclick = function(){
        addFromData.reset();
    }
    $("closeButton").appendChild(resetButton);
    var addButton = Tools.getButtonNode("保存");
    addButton.style.cssFloat="right";
    addButton.style.styleFloat="right";
    addButton.style.marginRight="5px";
    addButton.onclick = function(){
    	if(dhtmlxValidation.validate(addFromData)){
			var data = Tools.getFormValues("_fromData");
			data.tableInfo = dataInfo.table;
			dwrCaller.executeAction("updateData", data, function(rs) {
		    	if(rs){
		    		dhx.alert("修改成功！");
        			dataWindow.close();
		        	grid.clearAll();
		    		grid.load(dwrCaller.queryTableData, "json");
		    	}else{
		    		dhx.alert("修改失败！请联系管理员！");
		    	}
		   	});
    	}
    }
    $("closeButton").appendChild(addButton);
}

//删除操作
var deleteData = function(id){
	dhx.confirm("确定要删除该数据？",function(r){
		if(r){
		   	var data = {};
			data.tableInfo = dataInfo.table;
			data.valId = id;
			dwrCaller.executeAction("deleteData", data, function(rs) {
		    	if(rs){
		    		dhx.alert("删除成功！");
		        	grid.clearAll();
		    		grid.load(dwrCaller.queryTableData, "json");
		    	}else{
		    		dhx.alert("删除失败！请联系管理员！");
		    	}
		   	});
		}
	});
}

//查看操作
var viewData = function(rowData){
	dhxWindow.createWindow("dataWindow", 0, 0, 500, 300);
	dataWindow = dhxWindow.window("dataWindow");
	dataWindow.setModal(true);
	dataWindow.stick();
	dataWindow.denyResize();
	dataWindow.denyPark();
	dataWindow.button("minmax1").hide();
	dataWindow.button("park").hide();
	dataWindow.button("stick").hide();
	dataWindow.button("sticked").hide();
	dataWindow.setText("查看信息");
	dataWindow.keepInViewport(true);
	dataWindow.center();
	dataWindow.show();
	
    var layout = new dhtmlXLayoutObject(dataWindow, "1C");
    layout.cells("a").fixSize(false, true);
    layout.cells("a").firstChild.style.height = (layout.cells("a").firstChild.offsetHeight + 5) + "px";
    layout.cells("a").hideHeader();
    layout.cells("a").attachObject(showViewData);
    /******************动态生成html开始*********************/
    var htmlStr = '<table cellpadding="0" cellspacing="0" style="width:100%;" id="viewDataTable">';
	var fromData = dataInfo.showEditColumns		//可编辑的列
	var rowCount = 0;
	for(var i=0;i<fromData.length;i++){
		var isPush = false;		//是否换行
		if(i%2==0){	//每行显示两列，如当前一行为两列时，换行操作
			htmlStr += '<tr>';
		}else{
			isPush = true;
		}
		//动态值
		var viewName = fromData[i].MAINTAIN_COLUMN_NAMECN;
		var viewValue = rowData.userdata[Tools.tranColumnToJavaName(fromData[i].MAINTAIN_COLUMN_NAME.toLowerCase(),true)];
		if(fromData[i].DATA_FROM){		//当为下拉列表时,进行值转换
			if(dataInfo.dataFrom[fromData[i].MAINTAIN_COLUMN_ID]){
				//绑定下拉列表数据
				var optionsData = dataInfo.dataFrom[fromData[i].MAINTAIN_COLUMN_ID];
				for(var m=0;m<optionsData.length;m++){
					if(viewValue == optionsData[m].CODE){
						viewValue = optionsData[m].CODE_NAME
						break;
					}
				}
			}
		}
		htmlStr += '<th width="18%">'+viewName+'：</th><td width="32%">'+(viewValue?viewValue:"&nbsp;")+'</td>';
		if(isPush){	//当创建了两列时，进行换行
			htmlStr += '</tr>';
			rowCount++;
		}
		//当为总数的最后一条，切只有一列时，补充完整tr
		if(i%2==0 && i==fromData.length-1){
			htmlStr += '<th>&nbsp;</th><td>&nbsp;</td></tr>';
			rowCount++;
		}
	}
	var paddingHeight = 260-rowCount*25-35;		//关闭按钮div到顶部的高度
	htmlStr += '</table><div id="closeButton" style="height:30px;text-align: right;' +
	'padding-top:'+(paddingHeight<10?10:paddingHeight)+'px;"></div>'
    /******************动态生成html*********************/
   	showViewData.innerHTML = htmlStr;		//把动态生成html添加到div中
	/****************添加关闭按钮开始***********/
    var button = Tools.getButtonNode("关闭");
    button.style.cssFloat="right";
    button.style.styleFloat="right";
    button.style.marginRight="210px";
    button.onclick = function(){
        dataWindow.close();
    }
    $("closeButton").appendChild(button);
	/****************添加关闭按钮结束***********/
}

dhx.ready(init);