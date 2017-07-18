/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        sharelog.js
 *Description：
 *       WS共享服务访问日志js
 *Dependent：
 *
 *Author: 陈颖
 *
 ********************************************************/
var dataTable = null;
function pageInit(){
	var termReq = TermReqFactory.createTermReq(1);
	
    var now = new Date();
	var result = termReq.createTermControl("result","RESULT");
	result.setListRule(0,[[2,"全部"],[0,"失败"],[1,"成功"]],2);
	result.setWidth(100);
	var startdate = termReq.createTermControl("startdate","STARTDATE");
	startdate.setDateRule();
	startdate.render();
    startdate.myCalendar.setDateFormat("%Y-%m-%d");
    startdate.myCalendar.hideTime();
	var enddate = termReq.createTermControl("enddate","ENDDATE");
	enddate.setDateRule();
	enddate.render();	
    enddate.myCalendar.setDateFormat("%Y-%m-%d");
    enddate.myCalendar.hideTime();
	startdate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
    enddate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
    startdate.myCalendar.attachEvent("onClick",function(){
		enddate.myCalendar.setSensitiveRange(document.getElementById("startdate").value,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
    });
    enddate.myCalendar.attachEvent("onClick",function(){
    	startdate.myCalendar.setSensitiveRange(null,document.getElementById("enddate").value);
    });
	var kwd = termReq.createTermControl("keyword","KEYWORD");
	kwd.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    var reset = document.getElementById("reset");
    
    
	attachObjEvent(reset,"onclick",function(){
	    document.getElementById("enddate").value="";
	    document.getElementById("startdate").value="";
	    enddate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
	    startdate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
	});
	dataTableInit();
	dataTable.setReFreshCall(queryData);
	dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });

    
}

function dataTableInit(){
	var dd = document.getElementById("dataDiv");
    var pageContent = document.getElementById("pageContent");
    var queryFormDIV = document.getElementById("queryFormDIV");
    queryFormDIV.style.width = pageContent.offsetWidth -10  + "px";
    dd.style.width = pageContent.offsetWidth  + "px";
    dd.style.height = pageContent.offsetHeight-queryFormDIV.offsetHeight-5 + "px";
	dataTable = new meta.ui.DataTable("dataDiv");
	var colsName = {
		SHARE_USER_NAME:"用户",
		RULE_NAME:"服务名",
		VISIT_DATE:"访问时间",
		IS_SUCCESS:"执行结果",
		DEBUG_MSG:"调试信息"
	};
	var cols = "SHARE_USER_NAME,RULE_NAME,VISIT_DATE,LOG_ISSUCCESS";
	dataTable.setColumns(
		colsName,cols
	);
	dataTable.setFormatCellCall(function(rid,cid,data,colId){
		var user = dataTable.getUserData(rid,"SHARE_USER_NAME");
		var rule = dataTable.getUserData(rid,"RULE_NAME")
		var userId = dataTable.getUserData(rid,"SHARE_USER_ID");
		var ruleId = dataTable.getUserData(rid,"RULE_ID");
		var logId = dataTable.getUserData(rid,"LOG_ID"); 
        if(colId=="SHARE_USER_NAME"){
            return "<a href='javascript:void(0)' onclick='showUser("+rid+")'>"+user+"</a>";
        }
        if(colId=="RULE_NAME"){
        	return "<a href='javascript:void(0)' onclick='showRule("+rid+")'>"+rule+"</a>";
        }
        if(colId=="DEBUG_MSG"){
        	return "<a href='javascript:void(0)' onclick='showMsg("+rid+")'>详细信息</a>";
        }
        return data[cid];
    });
	dataTable.setPaging(true,20);
    dataTable.render();
    dataTable.grid.setInitWidthsP("25,30,25,10,10");
    for(var i=0 ;i < 5; i++){
    	dataTable.setGridColumnCfg(i,{align:"center"});
    }
}

var userWindow = null;
function showUser(rid){
	if(!userWindow){
		userWindow = DHTMLXFactory.createWindow("user","showUser",0,0,500,260);//
		userWindow.stick();
		userWindow.denyResize();
		userWindow.denyPark();
		userWindow.button("minmax1").hide();
		userWindow.button("park").hide();
		userWindow.button("stick").hide();
		userWindow.button("sticked").hide();
		userWindow.keepInViewport(true);
		userWindow.center();
	    userWindow.setText("共享用户查看");
		
    	var tableFormDIV = document.getElementById("viewUserDiv");
    	tableFormDIV.style.width = 500-20 + "px";
	    userWindow.attachObject(tableFormDIV);
	    
	    
	    var userBtn = document.getElementById("userBtn");
	    attachObjEvent(userBtn,"onclick",function(){userWindow.close();});
	    userWindow.attachEvent("onClose",function(){
            userWindow.setModal(false);
            this.hide();
            return false;
   		});
	}
	var id = dataTable.getUserData(rid,"SHARE_USER_ID");
	userWindow.setModal(true);
	userWindow.show();
	var username = document.getElementById("username");
	var userremark = document.getElementById("userremark");
	var usercreator = document.getElementById("usercreator");
	var usertime = document.getElementById("usertime");
	var password = document.getElementById("password");
	MetaShareWsAction.queryUserNameCN({"id":id,"flag":2},function(data){
	username.innerHTML = data[0]["SHARE_USER_NAME"];
	userremark.innerHTML = data[0]["REMARK"]==null?"":data[0]["REMARK"].replace(/\n/g,"<br>");
	usercreator.innerHTML = data[0]["USER_NAMECN"];
	usertime.innerHTML = data[0]["USER_CREATE_DATE"];
	password.innerHTML = data[0]["SHARE_USER_PASSWD"];
	});
        
}

var ruleWindow = null;
function showRule(rid){
	if(!ruleWindow){
		ruleWindow = DHTMLXFactory.createWindow("rule","showRule",0,0,500,315);//
		ruleWindow.stick();
		ruleWindow.denyResize();
		ruleWindow.denyPark();
		ruleWindow.button("minmax1").hide();
		ruleWindow.button("park").hide();
		ruleWindow.button("stick").hide();
		ruleWindow.button("sticked").hide();
		ruleWindow.keepInViewport(true);
		ruleWindow.center();
	    ruleWindow.setText("共享服务查看");
		
    	var tableFormDIV = document.getElementById("viewRuleDiv");
    	tableFormDIV.style.width = 500-20 + "px";
	    ruleWindow.attachObject(tableFormDIV);
	    
	    
	    var ruleBtn = document.getElementById("ruleBtn");
	    attachObjEvent(ruleBtn,"onclick",function(){ruleWindow.close();});
	    ruleWindow.attachEvent("onClose",function(){
            ruleWindow.setModal(false);
            this.hide();
            return false;
   		});
	}
	ruleWindow.setModal(true);
	ruleWindow.show();	
	var rulename = document.getElementById("rulename");
	var rulecreator = document.getElementById("rulecreator");
	var ruletime = document.getElementById("ruletime");
	var ruletype = document.getElementById("ruletype");
	var ruleimpltype = document.getElementById("ruleimpltype");
	var rulecode = document.getElementById("rulecode");
    var ruleremark = document.getElementById("ruleremark");
	var rulestate = document.getElementById("rulestate");
	var id = dataTable.getUserData(rid,"RULE_ID");
	MetaShareWsAction.queryUserNameCN({"id":id,"flag":1},function(data){
	rulename.innerHTML = data[0]["RULE_NAME"];
	rulecreator.innerHTML = data[0]["USER_NAMECN"];
	ruletime.innerHTML = data[0]["RULE_CREATE_DATE"];
	ruletype.innerHTML = data[0]["RULE_TYPE_NAME"];
	ruleimpltype.innerHTML = data[0]["RULE_IMPL_TYPE_NAME"];
	rulecode.innerHTML = data[0]["RULE_CODE"];
	ruleremark.innerHTML = data[0]["REMARK"]==null?"":data[0]["REMARK"].replace(/\n/g,"<br>");
	rulestate.innerHTML = data[0]["RULE_STATE_NAME"];
	})
 	
}

var showWindow = null;
function showMsg(rid){

	if(!showWindow){
		showWindow = DHTMLXFactory.createWindow("show","showWin",0,0,550,320);//
		showWindow.stick();
		showWindow.denyResize();
		showWindow.denyPark();
		showWindow.button("minmax1").hide();
		showWindow.button("park").hide();
		showWindow.button("stick").hide();
		showWindow.button("sticked").hide();
		showWindow.keepInViewport(true);
		showWindow.center();
	    showWindow.setText("详细信息");
	
    	var tableFormDIV = document.getElementById("viewWindowDiv");
    	tableFormDIV.style.width = 500-20 + "px";
	    showWindow.attachObject(tableFormDIV);
	    var closeBtn = document.getElementById("closeBtn");
	    attachObjEvent(closeBtn,"onclick",function(){showWindow.close();});
	    showWindow.attachEvent("onClose",function(){
            showWindow.setModal(false);
            this.hide();
            return false;
   		});
	}
	showWindow.setModal(true);
	showWindow.show();
	var show_msg = document.getElementById("show_msg");
	show_msg.innerHTML = (dataTable.getUserData(rid,"DEBUG_MSG") || "").replace(/\n/g,"<br>");
}

function queryData(dt,params){
   var termVals=TermReqFactory.getTermReq(1).getKeyValue();
   dhx.showProgress("数据请求中");
   MetaShareWsAction.queryWSLog(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
       dhx.closeProgress();
       var total=0;
       if(data && data[0])
           total=data[0]["TOTAL_COUNT_"];
       dataTable.bindData(data,total);//
   });
}


dhx.ready(pageInit);