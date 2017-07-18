/**
 * Created by MyEclipse
 * @Author: 熊小平
 * @Date: 11-10-19
 * @Time: 上午11:00
 * 
 * 应用排名js文件
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var dwrCaller = new biDwrCaller();

var queryMenuVisitInfoParams = new biDwrMethodParam();//查询参数
/**
 * 查询日志的响应函数
 * @param {Object} data
 */
dwrCaller.addAutoAction("queryMenuVisitInfo",
		"MenuVisitLogAction.queryMenuVisitInfo", queryMenuVisitInfoParams,
		function(data) {

		});
dwrCaller.addDataConverter("queryMenuVisitInfo", new dhtmxGridDataConverter( {
	idColumnName : "menuId",
	filterColumns : [ "rn", "menuName", "groupName", "count", "_buttons" ],
	cellDataFormat : function(rowIndex, columnIndex, columnName, cellValue,
			rowData) {
		if (columnName == "_buttons") {//操作按钮列
			return "getButtons";
		} else {
			return this._super.cellDataFormat(rowIndex, columnIndex,
					columnName, cellValue, rowData);
		}
	}

}));

//页面初始化
var menuVisitInfoInit = function() {
	var layout = new dhtmlXLayoutObject(document.body, "2E");
	layout.cells("a").setText("应用排名");
	layout.cells("a").setHeight(65);
	layout.cells("a").fixSize(true, true);
	layout.hideConcentrate();
	layout.hideSpliter();
	layout.cells("b").hideHeader();
	layout.setEffect("collapse", false);

	//查询表单
	queryform = layout.cells("a").attachForm( [ {
		type : "calendar",
		label : "开始日期：",
		name : "startDate",
		dateFormat : "%Y-%m-%d",
		weekStart : "7",
		value: firstDay(),
		readonly:"readonly"
	}, {
		type : "newcolumn"
	}, {
		type : "calendar",
		label : "结束日期：",
		name : "endDate",
		dateFormat : "%Y-%m-%d",
		weekStart : "7",
		value : new Date(),
		readonly:"readonly"
	}, {
		type : "hidden",
		name : "groupId"
	},{type : "hidden", name:"adminFlag"}, {
		type : "newcolumn"
	}, {
		type : "button",
		name : "query",
		value : "查询"
	} ]);
	setGroupID();

	var startDate = queryform.getCalendar("startDate");
	var endDate = queryform.getCalendar("endDate");
	
	//将日历控件语言设置成中文
	startDate.loadUserLanguage('zh');
	endDate.loadUserLanguage('zh');

	//将未来的日期设定为不可操作
	var today = new Date();
	var tomarrow = new Date();
	tomarrow.setDate(tomarrow.getDate() + 1);
	startDate.setInsensitiveRange(tomarrow, null);
	endDate.setInsensitiveRange(tomarrow, null);

	//日历改变事件，使startDate不晚于endDate，endDate不早于startDate
	startDate.attachEvent("onClick", function(date) {
		endDate.setSensitiveRange(date, today);
	});
	endDate.attachEvent("onClick", function(date) {
		date.setDate(date.getDate()+1);
		startDate.setInsensitiveRange(date, null);
	});
	
	//设置查询参数，来自于queryform表单
	queryMenuVisitInfoParams.setParamConfig( [ {
		index : 0,
		type : "fun",
		value : function() {
			return queryform.getFormData();
		}
	} ]);

	//查询响应函数
	queryform.attachEvent("onButtonClick", function(id) {
		if (id == "query") {
			logGrid.clearAll();
			logGrid.load(dwrCaller.queryMenuVisitInfo, "json");
			queryMenuVisitInfoByIdParamsForm.setFormData(queryform.getFormData());
			//设定startDate和endDate
			
		}
	});

	//按钮添加
	var buttons = {
		queryVisitInfoByID : {
			name : "queryVisitInfoByID",
			text : "操作",
			imgEnabled : getBasePath() + "/meta/resource/images/view.png",
			imgDisabled : getBasePath() + "/meta/resource/images/view.png",
			onclick : function(rowData) {
				visitDetailInfo(rowData.id);
			}
		}
	};
	var buttonCol = [ "queryVisitInfoByID" ];
	window["getButtons"] = function() {
		var res = [];
		for ( var i = 0; i < buttonCol.length; i++) {
			if(buttonCol[i] == "queryVisitInfoByID"){
				buttons["queryVisitInfoByID"].text="查看详情";
        		res.push(buttons["queryVisitInfoByID"])
			}else{
				res.push(buttons[buttonCol[i]]);
			}
		}
		return res;
	};
	//查看详细访问信息
	var queryMenuVisitInfoByIdParams = new biDwrMethodParam();//按ID查询详细访问信息参数
	dwrCaller.addAutoAction("queryMenuVisitInfoById",
			"MenuVisitLogAction.queryMenuVisitInfo",
			queryMenuVisitInfoByIdParams, function(data) {

			});
	dwrCaller.addDataConverter("queryMenuVisitInfoById",
			new dhtmxGridDataConverter( {
				idColumnName : "visitId",
				filterColumns : [ "rn", "userEmail", "userNamecn", "visitTime",
						"menuName" ]
			}));

	//辅助表单，用于存储查询详细访问信息的参数，包括menuId,startTime,endTime
	queryMenuVisitInfoByIdParamsForm = layout.cells("b").attachForm( [ {
		type : "input",
		name : "menuId"
	}, {
		type : "calendar",
		name : "startDate"
	}, {
		type : "calendar",
		name : "endDate"
	} ]);
	queryMenuVisitInfoByIdParamsForm.setFormData(queryform.getFormData());
	//设置查询参数，来自于queryform表单
	queryMenuVisitInfoByIdParams.setParamConfig( [ {
		index : 0,
		type : "fun",
		value : function() {
			return queryMenuVisitInfoByIdParamsForm.getFormData();
		}
	} ]);

	//查询结果列表
	logGrid = layout.cells("b").attachGrid();
	logGrid.setHeader("排名,菜单名称,菜单所属子系统,被访问次数,操作");
	logGrid.setInitWidthsP("5,60,15,10,10");
	logGrid.setColAlign("center,left,left,right,center");
	logGrid.setHeaderAlign("center,center,center,center,center");
	logGrid.enableResizing("true,true,true,false,false");
	logGrid.setColTypes("ro,ro,ro,ro,sb");
    logGrid.enableCtrlC();
	logGrid.setColSorting("na,na,na,na,na");
	logGrid.setEditable(false);
	logGrid.setColumnIds("rn,menuName,groupName,count,target");
	logGrid.enableTooltips("true,true,true,true,false");
	logGrid.init();
    logGrid.defaultPaging(20);
	logGrid.load(dwrCaller.queryMenuVisitInfo, "json");

};

//--------------------------------详细访问信息---------------------------------
var visitDetailInfo = function(menuId) {

	//menuId参数设定
	queryMenuVisitInfoByIdParamsForm.setFormData( {
		"menuId" : menuId
	});
    queryMenuVisitInfoByIdParamsForm.setFormData( {
		"adminFlag" : adminFlag
	});

	var dhxWindow = new dhtmlXWindows();
	dhxWindow.createWindow("visitDetailInfoWindow", 0, 0, 1250, 400);
	var visitDetailInfoWindow = dhxWindow.window("visitDetailInfoWindow");
	visitDetailInfoWindow.setModal(true);
	//visitDetailInfoWindow.stick();
	visitDetailInfoWindow.setDimension(750, 400);
	visitDetailInfoWindow.center();
	visitDetailInfoWindow.denyResize();
	visitDetailInfoWindow.denyPark();
	visitDetailInfoWindow.setText("该菜单的详细访问信息");
	visitDetailInfoWindow.keepInViewport(true);
	visitDetailInfoWindow.button("minmax1").hide();
	visitDetailInfoWindow.button("park").hide();
	visitDetailInfoWindow.button("stick").hide();
	visitDetailInfoWindow.button("sticked").hide();
	//visitDetailInfoWindow
	visitDetailInfoWindow.show();

	var visitDetailInfoLayout = new dhtmlXLayoutObject(visitDetailInfoWindow,
			"1C");
	visitDetailInfoLayout.cells("a").hideHeader();
	visitDetailInfoLayout.cells("a").fixSize(false, true);
	visitDetailInfoLayout.hideConcentrate();

	//详细访问信息列表
	var visitDetailInfoGrid = visitDetailInfoLayout.cells("a").attachGrid();
	visitDetailInfoGrid.setHeader("序号,操作人Email,操作人姓名,操作时间,操作菜单");
	visitDetailInfoGrid.setInitWidthsP("8,20,12,20,51");
	visitDetailInfoGrid.setColAlign("center,left,left,left,left");
	visitDetailInfoGrid.setHeaderAlign("center,center,center,center,center");
	visitDetailInfoGrid.setColTypes("ro,ro,ro,ro,ro");
    visitDetailInfoGrid.enableCtrlC();
	visitDetailInfoGrid.setColSorting("na,na,na,na,na");
	visitDetailInfoGrid.enableMultiselect(false);
	//visitDetailInfoGrid.enableCtrlC();
	//u.user_email,u.user_namecn,l.visit_time,m.menu_name
	visitDetailInfoGrid
			.setColumnIds("rn,userEmail,userNamecn,visitTime,menuName");
	visitDetailInfoGrid.init();
    visitDetailInfoGrid.defaultPaging(20);
	visitDetailInfoGrid.load(dwrCaller.queryMenuVisitInfoById, "json");
}
//得到本月第一天 
var firstDay = function(){ 
	var Nowdate=new Date(); 
	var MonthFirstDay=(new Date(Nowdate.getFullYear(),Nowdate.getMonth(),1)); 
	return MonthFirstDay; 
}
//--------------------------------详细访问信息---------------------------------

dhx.ready(menuVisitInfoInit);