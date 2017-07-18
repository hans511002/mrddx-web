/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        logreports.js
 *Description：
 *       登陆日志报表JS
 *Dependent：
 *       dhtmlx.js，dwr 有关JS，dhtmxExtend.js。。。
 *Author:
 *        程钰
 *Finished：
 *       2012-02-16
 ********************************************************/
/**
 * 页面初始化。
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var loadLogParam = new biDwrMethodParam();//loadDept Action参数设置。
var user = getSessionAttribute("user");
/**
 * 树Data转换器定义
 * 定义之前，先声明一个数组，用来动态存放转换器列 名
 */
var filterColumnsName = ["zoneName","loginNum"];
for(var i=0; i<menuId.length; i++){
    filterColumnsName.push("visitNum"+menuId[i]);
}
/**
 * 树Data转换器定义
 */
var convertConfig= {
    idColumn:"zoneId",pidColumn:"zoneParId",
    filterColumns:filterColumnsName,
    isDycload:true
}
/**
 * JS内部类 用于数据转换
 */
var TreeDataConverter=new dhtmlxTreeGridDataConverter(convertConfig);

/**
 * 声明dwrCaller
 */
var dwrCaller = new biDwrCaller({
    querySubZone:{methodName:"LoginReportAction.querySubZone",converter:TreeDataConverter},
    update:function(afterCall, param){}
});

dwrCaller.addAutoAction("loadLog","LoginReportAction.queryZoneTreeData",loadLogParam
    ,function(data){});
loadZonetreeDataConverter=dhx.extend({},TreeDataConverter);
loadZonetreeDataConverter.setDycload(false);
dwrCaller.addDataConverter("loadLog",loadZonetreeDataConverter);

var logInit = function() {
	var deptLayout = new dhtmlXLayoutObject(document.body, "2E");
	deptLayout.cells("a").setText("登陆报表");
	deptLayout.cells("b").hideHeader();
	deptLayout.cells("a").setHeight(80);
	deptLayout.cells("a").fixSize(false, true);
    deptLayout.hideSpliter();//移除分界边框。
	deptLayout.hideConcentrate();
	//加载查询表单
    var date = new Date();
    var date1 = new Date(date.getFullYear(),date.getMonth(),date.getDate()-1);
	var queryform = deptLayout.cells("a").attachForm( [
        {type : "setting",position : "label-left",labelWidth : 120,inputWidth : 120},
        {type : "calendar",label : "开始日期：",name : "startDate",dateFormat : "%Y-%m-%d",
            weekStart : "7",value : firstDay(),inputWidth: "150",readonly:"readonly"},
        {type : "newcolumn"},
        {type : "calendar",label : "结束日期：",name : "endDate",dateFormat : "%Y-%m-%d",
            weekStart : "7",value : date1,inputWidth: "150",readonly:"readonly"},
        {type : "newcolumn"},
        {type : "button",name : "query",value : "查询"},
        {type : "newcolumn"},
        {type : "button",name:"down",value : "下载"}
    ]);
	var startDate = queryform.getCalendar("startDate");
	var endDate = queryform.getCalendar("endDate");
	//将日历控件语言设置成中文
	startDate.loadUserLanguage('zh');
	endDate.loadUserLanguage('zh');
	//将未来的日期设定为不可操作
	//将未来的日期设定为不可操作
	var today = new Date();
	var tomarrow = new Date();
	tomarrow.setDate(tomarrow.getDate()-1 );
	startDate.setSensitiveRange(new Date(date.getFullYear(),date.getMonth()-1,date.getDate()),tomarrow);
    endDate.setSensitiveRange(new Date(date.getFullYear(),date.getMonth()-1,date.getDate()),tomarrow);
	//日历改变事件，使startDate不晚于endDate，endDate不早于startDate
	startDate.attachEvent("onClick", function(date) {
		endDate.setSensitiveRange(date, tomarrow);
	});
	endDate.attachEvent("onClick", function(date1) {
		date1.setDate(date1.getDate());
		startDate.setSensitiveRange(new Date(date.getFullYear(),date.getMonth()-1,date.getDate()),date1);
	});
	//定义loadRole Action的参数来源于表单queryform数据。
	loadLogParam.setParamConfig( [ {
		index : 0,
		type : "fun",
		value : function() {

			return queryform.getFormData();
		}
	} ]);
//	dwrCaller.addAutoAction("loadLog", "LoginReportAction.queryZoneTreeData",
//		loadLogParam, function(data) {
//		});

    LoginReportAction.queryMenuName(function(data){
    	if(data){
            var menuName = "地域名称,登录次数";
            var intP = 100/(2+menuId.length)+','+100/(2+menuId.length);
            var headAlign = "center,center";
            var colAlign = "left,right";
            var colType = "tree,ro";
            var colSorting  = "na,na";

            for(var j=0; j<menuId.length; j++){
                for(var i=0 ;i<data.length;i++){
                    if(menuId[j] == data[i]["MENU_ID"]){
                        menuName=menuName+","+data[i]["MENU_NAME"];
                    }
                }
                intP= intP+","+100/(2+menuId.length);
                headAlign = headAlign +","+ "center";
                colAlign = colAlign +","+"right";
                colType = colType +","+ "ro";
                colSorting = colSorting + ","+"na";
            }

    		mygrid = deptLayout.cells("b").attachGrid();
			mygrid.setImagePath(dhtmlx.image_path+"csh_"+dhtmlx.skin+"/");
			mygrid.setHeader(menuName);
		    mygrid.setHeaderBold();
			mygrid.setInitWidthsP(intP);
			mygrid.setColAlign(colAlign);
			mygrid.setHeaderAlign(headAlign);
			mygrid.setColTypes(colType);
		    mygrid.enableCtrlC();
			mygrid.setColSorting(colSorting);
			mygrid.setEditable(false);
			mygrid.enableMultiselect(true);
			//mygrid.setColumnIds(filterColumnsName);
			mygrid.init();
			mygrid.load(dwrCaller.loadLog, "json");
//            var param={
//                id:mygrid.getSelectedId(),startDate:queryform.getFormData().startDate,
//                endDate:queryform.getFormData().endDate
//            };
            var dimauditParam = new biDwrMethodParam();
            dimauditParam.setParamConfig([
                {
                    index:0,type:"fun",value:function(){
                    return queryform.getFormData();
                }
                }
            ]);

            mygrid.kidsXmlFile=dwrCaller.querySubZone+dimauditParam;
			//查询表单事件处理
			queryform.attachEvent("onButtonClick", function(id) {
				if (id == "query") {
					//进行数据查询。
					mygrid.clearAll();
					mygrid.load(dwrCaller.loadLog, "json");
				}
                if (id == "down"){
                    window.open("../../../public/downlogreports.jsp?zoneId="+user.zoneId+"&startDate="+queryform.getFormData().startDate.getTime()
                    +"&endDate="+queryform.getFormData().endDate.getTime()+"&menuId="+menuIds+"&menuName="+menuName);
                }
			});
            mygrid.attachEvent("onXLE",function(){
               var ids=mygrid.getSubItems(0);
               if(ids){
                   ids=ids.split(",");
                   for(var i=0;i<ids.length;i++){
                      mygrid.openItem(ids[i]);
                   }
               }
            });

    	}
    });


}
var firstDay = function(){
	var Nowdate=new Date();
    var MonthFirstDay;
    if(Nowdate.getDate() == 1){
        MonthFirstDay=(new Date(Nowdate.getFullYear(),Nowdate.getMonth()-1,1));
    }else{
        MonthFirstDay=(new Date(Nowdate.getFullYear(),Nowdate.getMonth(),1));
    }
	return MonthFirstDay;
}
dhx.ready(logInit);