/**
 * Created by MyEclipse
 * @Author: 熊小平
 * @Date: 11-10-17
 * @Time: 上午11:30
 * 
 * 登录日志js文件
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();

//DWR
var dwrCaller = new biDwrCaller();
var queryLoginLogParams = new biDwrMethodParam();//查询参数
var user= getSessionAttribute("user");
/**
 * 查询日志的响应函数
 * @param {Object} data
 */
dwrCaller.addAutoAction("queryLoginLog", "LoginLogAction.queryLoginLog",
		queryLoginLogParams, function(data) {
		});
dwrCaller.addDataConverter("queryLoginLog", new dhtmxGridDataConverter( {
	idColumnName : "userId",
	filterColumns : [ "rn", "userNamecn", "zoneName", "deptName",
			"stationName", "count", "opr" ],
	cellDataFormat : function(rowIndex, columnIndex, columnName, cellValue,
			rowData) {
		if (columnName == "opr") {//操作按钮列
			return "getLoginDetailButtons";
		} else {
			return this._super.cellDataFormat(rowIndex, columnIndex,
					columnName, cellValue, rowData);
		}
	}

}));

var queryform;

/**
 * 初始化函数
 */
var loginLogInit = function() {
	//第一步，先建立一个Layout
	var logLayout = new dhtmlXLayoutObject(document.body, "2E");
	logLayout.cells("a").setText("访问排名");
	logLayout.cells("a").setHeight(96);
	logLayout.cells("a").fixSize(true, true);
	logLayout.hideConcentrate();
	logLayout.hideSpliter();
	logLayout.cells("b").hideHeader();

	//添加查询表单
    queryform = logLayout.cells("a").attachForm( [ {
        type : "setting",
        position : "label-left"
        },
        {type : "newcolumn"},
        {type : "input",label : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;地域：",name : "zone",inputWidth: "150"},
        {type : "calendar",
            label : "开始日期：",
            name : "startDate",
            dateFormat : "%Y-%m-%d",
            weekStart : "7",
            value : firstDay(),
            inputWidth: "150",
            readonly:"readonly"
        },
        {type : "newcolumn"},
        {type : "input",label : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;岗位：",name : "station",inputWidth: "150"},
        {
            type : "calendar",
            label : "结束日期：",
            name : "endDate",
            dateFormat : "%Y-%m-%d",
            weekStart : "7",
            value : new Date(),
            inputWidth: "150",
            readonly:"readonly"
        },
        {type : "newcolumn"},
        {type : "input",label : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;部门：",name : "dept",inputWidth: "150"},
        {
            type : "button",
            name : "query",
            value : "查询",
            offsetLeft:70
        },
        {type:"hidden",name:"zoneId",value:user.zoneId},
        {type : "hidden",name : "groupId"},
        {type : "hidden", name:"adminFlag"}]);
	setInit();

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
		date.setDate(date.getDate() + 1);
		startDate.setInsensitiveRange(date, null);
	});

	//设置查询参数，来自于queryform表单
	queryLoginLogParams.setParamConfig( [ {
		index : 0,
		type : "fun",
		value : function() {
			return queryform.getFormData();
		}
	} ]);
	
	//加载部门树
    loadDeptTree(1,queryform);
    //加载地域树
    loadZoneTree(user.zoneId,queryform);
    //加载岗位树
    loadStationTree(1,queryform);
	//按钮添加
	var buttons = {
		queryLoginLogDetailInfoByID : {
			name : "button1",
			text : "查看详情",
			imgEnabled : getBasePath() + "/meta/resource/images/view.png",
			imgDisabled : getBasePath() + "/meta/resource/images/view.png",
			onclick : function(rowData) {
				visitDetailInfo(rowData.id,rowData.data[1]);
			}
		}
	};
	var buttonCol = [ "queryLoginLogDetailInfoByID" ];
	var bottonRoleRow = [];
    for(var i=0; i<buttonCol.length; i++){
    	if(buttonCol[i] == "queryLoginLogDetailInfoByID"){
    		bottonRoleRow.push(buttonCol[i]);
    	}		
    }
	window["getLoginDetailButtons"] = function() {
		var res = [];
		for ( var i = 0; i < buttonCol.length; i++) {
			if(buttonCol[i] == "queryLoginLogDetailInfoByID"){
        		buttons["queryLoginLogDetailInfoByID"].text="查看详情";
        		res.push(buttons["queryLoginLogDetailInfoByID"])
			}else{
				res.push(buttons[buttonCol[i]]);
			}
		}
		return res;
	};
	//查看详细访问信息
	var queryLoginLogInfoByIdParams = new biDwrMethodParam();//按ID查询详细访问信息参数
	dwrCaller.addAutoAction("queryLoginLogInfoById",
			"LoginLogAction.queryLoginLogByID", queryLoginLogInfoByIdParams,
			function(data) {
			});
	dwrCaller.addDataConverter("queryLoginLogInfoById",
			new dhtmxGridDataConverter( {
				idColumnName : "logId",
				filterColumns : [ "loginIp",
						"logInDate", "logOffDate" ]
			}));

	//辅助表单，用于存储查询详细访问信息的参数
	queryLoginLogInfoByIdParamsForm = logLayout.cells("b").attachForm( [ {
		type : "input",
		name : "userId"
	}, {
		type : "calendar",
		name : "startDate"
	}, {
		type : "calendar",
		name : "endDate"
	} ]);
	queryLoginLogInfoByIdParamsForm.setFormData(queryform.getFormData());
	//设置查询参数，来自于queryform表单
	queryLoginLogInfoByIdParams.setParamConfig( [ {
		index : 0,
		type : "fun",
		value : function() {
			return queryLoginLogInfoByIdParamsForm.getFormData();
		}
	} ]);

	//添加grid,用于将查询出来的日志记录显示出来
	logGrid = logLayout.cells("b").attachGrid();
	logGrid.setHeader("排名,用户姓名,地域,部门,岗位,访问次数,操作");
	logGrid.setInitWidthsP("5,20,15,15,20,10,15");
	logGrid.setColAlign("center,left,left,left,left,right,center");
	logGrid.setHeaderAlign("center,center,center,center,center,center,center");
	logGrid.setColTypes("ro,ro,ro,ro,ro,ro,sb");
    logGrid.enableCtrlC();
	logGrid.setColSorting("na,na,na,na,na,na,na");
	logGrid.setEditable(false);
	logGrid.setColumnIds("rn,userNamecn,zoneName,deptName,stationName,count,target");
	logGrid.enableTooltips("true,true,true,true,true,true,false");
	logGrid.init();
    logGrid.defaultPaging(20);
	logGrid.load(dwrCaller.queryLoginLog, "json");
	//查询响应函数
	queryform.attachEvent("onButtonClick", function(id) {
		if (id == "query") {
			logGrid.clearAll();
			logGrid.load(dwrCaller.queryLoginLog, "json");
			queryLoginLogInfoByIdParamsForm.setFormData(queryform.getFormData());
		}
	});

};

//--------------------------------详细访问信息---------------------------------
var visitDetailInfo = function(userId,userName) {
	
	//menuId参数设定
	queryLoginLogInfoByIdParamsForm.setFormData( {
		"userId" : userId
	});
    queryLoginLogInfoByIdParamsForm.setFormData(
        {"groupId":groupId}
    );
    queryLoginLogInfoByIdParamsForm.setFormData(
        {"adminFlag":adminFlag}
    )
	var dhxWindow = new dhtmlXWindows();
	dhxWindow.createWindow("visitDetailInfoWindow", 0, 0, 1250, 380);
	var visitDetailInfoWindow = dhxWindow.window("visitDetailInfoWindow");
	visitDetailInfoWindow.setModal(true);
	//visitDetailInfoWindow.stick();
	visitDetailInfoWindow.setDimension(610, 380);
	visitDetailInfoWindow.center();
	visitDetailInfoWindow.denyResize();
	visitDetailInfoWindow.denyPark();
	visitDetailInfoWindow.setText(""+userName+"的详细访问信息");
	visitDetailInfoWindow.keepInViewport(true);
	visitDetailInfoWindow.button("minmax1").hide();
	visitDetailInfoWindow.button("park").hide();
	visitDetailInfoWindow.button("stick").hide();
	visitDetailInfoWindow.button("sticked").hide();
	visitDetailInfoWindow.show();

	var visitDetailInfoLayout = new dhtmlXLayoutObject(visitDetailInfoWindow,
			"1C");
	visitDetailInfoLayout.cells("a").hideHeader();
	visitDetailInfoLayout.cells("a").fixSize(false, true);
	visitDetailInfoLayout.hideConcentrate();

	//详细访问信息列表
	var visitDetailInfoGrid = visitDetailInfoLayout.cells("a").attachGrid();
	visitDetailInfoGrid.setHeader("登录IP地址,登录时间,登出时间");
	visitDetailInfoGrid.setInitWidthsP("30,35,35");
	visitDetailInfoGrid.setColAlign("left,left,left");
	visitDetailInfoGrid
			.setHeaderAlign("center,center,center");
	visitDetailInfoGrid.setColTypes("ro,ro,ro");
    visitDetailInfoGrid.enableCtrlC();
	visitDetailInfoGrid.setColSorting("na,na,na");
	visitDetailInfoGrid.enableMultiselect(false);
	visitDetailInfoGrid
			.setColumnIds("loginIp,logInDate,logOffDate");
	visitDetailInfoGrid.init();
	visitDetailInfoGrid.load(dwrCaller.queryLoginLogInfoById, "json");
	visitDetailInfoGrid.defaultPaging(20);
}


dwrCaller.addAutoAction("loadDeptTree","DeptAction.queryDeptByPath");
var treeConverter=new dhtmxTreeDataConverter({
    idColumn:"deptId",pidColumn:"parentId",
    isDycload:false,textColumn:"deptName"
});
dwrCaller.addDataConverter("loadDeptTree",treeConverter);
//树动态加载Action
dwrCaller.addAction("querySubDept",function(afterCall,param){
    var tempCovert=dhx.extend({isDycload:true},treeConverter,false);
    DeptAction.querySubDept(param.id,function(data){
        data=tempCovert.convert(data);
        afterCall(data);
    })
});
/**
 * 部门树input框Html。
 * @param selectDept 已经选择了的部门。
 */
var loadDeptTree=function(selectDept,form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectDept=selectDept|| global.constant.defaultRoot;
    var beginId=global.constant.defaultRoot;
    //创建tree Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target=form.getInput("dept");
    target.readOnly=true;

    //生成树
    var tree = new dhtmlXTreeObject(div, div.style.width, div.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableThreeStateCheckboxes(true);
//    tree.enableSmartRendering();
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubDept);
    //树双击鼠标事件
    tree.attachEvent("onDblClick",function(nodeId){
        form.setFormData({dept:tree.getItemText(nodeId),deptId:nodeId});
        //关闭树
        div.style.display="none";
    });
    dwrCaller.executeAction("loadDeptTree",beginId,selectDept,function(data){
        tree.loadJSONObject(data);
        globDeptTree = tree;
        if(selectDept){
            tree.selectItem(selectDept); //选中指定节点
            //将input框选中
            target.value=tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target,"click",function(){
            div.style.width = target.offsetWidth+80+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
    })
     div.style.display="none";
}

dwrCaller.addAutoAction("loadStationTree","StationAction.queryStationByPath");
var stationConverter=dhx.extend({idColumn:"stationId",pidColumn:"parStationId",
    textColumn:"stationName"
},treeConverter,false);
dwrCaller.addDataConverter("loadStationTree",stationConverter);
//树动态加载Action
dwrCaller.addAction("querySubStation",function(afterCall,param){
    var tempCovert=dhx.extend({isDycload:true},stationConverter,false);
    StationAction.querySubStation(param.id,function(data){
        data=tempCovert.convert(data);
        afterCall(data);
    })
});

/**
 * 岗位input输入框Html
 * @param name
 * @param value
 */
var loadStationTree=function(selectStation,form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectStation=selectStation|| global.constant.defaultRoot;
    var beginId=global.constant.defaultRoot;
    //创建tree Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target=form.getInput("station");
    target.readOnly=true;

    //生成树
    var tree = new dhtmlXTreeObject(div, div.style.width, div.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableThreeStateCheckboxes(true);
//    tree.enableSmartRendering();
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubStation);
    //树双击鼠标事件
    tree.attachEvent("onDblClick",function(nodeId){
        form.setFormData({station:tree.getItemText(nodeId),stationId:nodeId});
        //关闭树
        div.style.display="none";
    });
    dwrCaller.executeAction("loadStationTree",beginId,selectStation,function(data){
        tree.loadJSONObject(data);
        globStationTree = tree;
        if(selectStation){
            tree.selectItem(selectStation); //选中指定节点
            //将input框选中
            target.value=tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target,"click",function(){
            div.style.width = target.offsetWidth+80+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
    })
      div.style.display="none"; 
}

dwrCaller.addAutoAction("loadZoneTree","ZoneAction.queryZoneByPath");
var zoneConverter=dhx.extend({idColumn:"zoneId",pidColumn:"zoneParId",
    textColumn:"zoneName"
},treeConverter,false);
dwrCaller.addDataConverter("loadZoneTree",zoneConverter);
//树动态加载Action
dwrCaller.addAction("querySubZone",function(afterCall,param){
    var tempCovert=dhx.extend({isDycload:true},zoneConverter,false);
    ZoneAction.querySubZone(param.id,function(data){
        data=tempCovert.convert(data);
        afterCall(data);
    })
});
/**
 * 地域树加载
 * @param name
 * @param value
 */
var loadZoneTree=function(selectZone,form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectZone=selectZone|| global.constant.defaultRoot;
    var beginId=(user.userId==global.constant.adminId?global.constant.defaultRoot:user.zoneId)
            || global.constant.defaultRoot;
    //创建tree Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target=form.getInput("zone");
    target.readOnly=true;

    //生成树
    var tree = new dhtmlXTreeObject(div, div.style.width, div.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableThreeStateCheckboxes(true);
//    tree.enableSmartRendering();
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.enableCheckBoxes(false);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubZone);
    //树双击鼠标事件
    tree.attachEvent("onDblClick",function(nodeId){
        form.setFormData({zone:tree.getItemText(nodeId),zoneId:nodeId});
        //关闭树
        div.style.display="none";
    });
    
    dwrCaller.executeAction("loadZoneTree",beginId,selectZone,function(data){
        tree.loadJSONObject(data);
        globZoneTree = tree;
        if(selectZone){
            tree.selectItem(selectZone); //选中指定节点
            //将input框选中
            target.value=tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target,"click",function(){
            div.style.width = target.offsetWidth+80+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
    })
      div.style.display="none";
}
var firstDay = function(){ 
	var Nowdate=new Date(); 
	var MonthFirstDay=(new Date(Nowdate.getFullYear(),Nowdate.getMonth(),1)); 
	return MonthFirstDay; 
}
//--------------------------------详细访问信息---------------------------------

dhx.ready(loginLogInit);
