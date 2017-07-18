/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        logreport.js
 *Description：
 *       登陆日志报表JS
 *Dependent：
 *       dhtmlx.js，dwr 有关JS，dhtmxExtend.js。。。
 *Author:
 *        程钰
 *Finished：
 *       2011-12-28
 ********************************************************/
/**
 * 页面初始化。
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var dwrCaller = new biDwrCaller();
var loadLogParam = new biDwrMethodParam();//loadDept Action参数设置。
var user = getSessionAttribute("user");
/**
 * 树Data转换器定义
 */
var convertConfig = {
	idColumn : "zoneId",
	filterColumns : [ "zoneName", "sum","menuVisit0","menuVisit1","menuVisit2","menuVisit3"],
	isDycload : true
}
/**
 * JS内部类 用于数据转换
 */
var logreportDataConverter = new dhtmlxTreeGridDataConverter(convertConfig);
/**
 * 初始化页面加载方法
 */
var menuName = ",";
var logInit = function() {
	var deptLayout = new dhtmlXLayoutObject(document.body, "2E");
	deptLayout.cells("a").setText("登陆报表");
	deptLayout.cells("b").hideHeader();
	deptLayout.cells("a").setHeight(80);
	deptLayout.cells("a").fixSize(false, true);
    deptLayout.hideSpliter();//移除分界边框。
	deptLayout.hideConcentrate();
	//加载查询表单
	var queryform = deptLayout.cells("a").attachForm( [ {
        type : "setting",
        position : "label-left",
        labelWidth : 120,
        inputWidth : 120
    }, {type : "calendar",
            label : "开始日期：",
            name : "startDate",
            dateFormat : "%Y-%m-%d",
            weekStart : "7",
            value : firstDay(),
            inputWidth: "150",
            readonly:"readonly"
        },
        {type : "newcolumn"},
        {
            type : "calendar",
            label : "结束日期：",
            name : "endDate",
            dateFormat : "%Y-%m-%d",
            weekStart : "7",
            value : new Date(),
            inputWidth: "150",
            readonly:"readonly"
        }, {
        type : "newcolumn"
    }, {
        type : "button",
        name : "query",
        value : "查询"
    }, {type : "hidden",name : "groupId",value:20},
        {type : "hidden", name:"adminFlag",value:false}
    ]);
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
	//定义loadRole Action的参数来源于表单queryform数据。
	loadLogParam.setParamConfig( [ {
		index : 0,
		type : "fun",
		value : function() {
			return queryform.getFormData();
		}
	} ]);
	dwrCaller.addAutoAction("loadLog", "LoginLogAction.queryLoginReport",
		loadLogParam, function(data) {
		});
	dwrCaller.addDataConverter("loadLog", logreportDataConverter);
	//加载所有的菜单
	
    LoginLogAction.queryMenuName(function(data){
    	if(data){
    		for(var i=0 ;i<data.length;i++){
    			menuName += data[i]["MENU_NAME"];
    			if(i != data.length-1){
    				menuName += ",";
    			}
    			
    		}
    		
    		mygrid = deptLayout.cells("b").attachGrid();
			mygrid.setImagePath(dhtmlx.image_path + "csh_" + dhtmlx.skin + "/");
			mygrid.setHeader("地域名称,登录次数"+menuName);
		    mygrid.setHeaderBold();
			mygrid.setInitWidthsP("15,17,17,17,17,17");
			mygrid.setColAlign("left,right,right,right,right,right");
			mygrid.setHeaderAlign("center,center,center,center,center,center");
			mygrid.setColTypes("ro,ro,ro,ro,ro,ro");
		    mygrid.enableCtrlC();
			mygrid.setColSorting("na,na,na,na,na,na");
			mygrid.setEditable(false);
			mygrid.enableMultiselect(true);
			mygrid.setColumnIds("zoneName,sum,menuVisit0,menuVisit1,menuVisit2,menuVisit3");
			mygrid.init();
			mygrid.load(dwrCaller.loadLog, "json");
			//mygrid.defaultPaging(20);
			//查询表单事件处理
			queryform.attachEvent("onButtonClick", function(id) {
				if (id == "query") {
					//进行数据查询。
					mygrid.clearAll();
					mygrid.load(dwrCaller.loadLog, "json");
				}
			});
    		
    	}
    });
	
	
}
var firstDay = function(){ 
	var Nowdate=new Date(); 
	var MonthFirstDay=(new Date(Nowdate.getFullYear(),Nowdate.getMonth(),1)); 
	return MonthFirstDay; 
}
dhx.ready(logInit);