/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        qryRule.js
 *Description：
 *        查询规则
 *Dependent：
 *
 *Author: 王鹏坤
 *
 ********************************************************/
var dataTable = null;   //查询规则列表
var maintainWin = null; //弹出界面

var addRole = 0;
var adminFlag = 0;
/**
 * 页面初始化
 */
function pageInit(){
	adminFlag = getSessionAttribute("user").adminFlag;
    var termReq = TermReqFactory.createTermReq(1);
    var ruleId = termReq.createTermControl("ruleId","RULE_ID");
    ruleId.setWidth(240);
    ruleId.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    
    var ruleName = termReq.createTermControl("ruleName","RULE_NAME");
    ruleName.setWidth(240);
    ruleName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });

    var sourceName = termReq.createTermControl("sourceName","SOURCE_NAME");
    sourceName.setWidth(240);
    sourceName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });

    var hbName = termReq.createTermControl("hbName","HB_NAME");
    hbName.setWidth(240);
    hbName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });

    var userName = termReq.createTermControl("userName","USER_NAME");
    userName.setWidth(240);
    userName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    
    dataTableInit();
    dataTable.setPaging(true, 20);//分页
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("3,8,10,10,10,10,7,10,8,4,20");
    dataTable.setReFreshCall(queryData);
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    var newBtn = document.getElementById("newBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    attachObjEvent(newBtn,"onclick",function(){
        addQryRule(null,0);
    });
    
    var toolbarData = {
        parent: "toolbarObj",
        icon_path: "../../../meta/resource/images/",
        items: [{
            type: "button",
            id: "adds_bt",
            text: "设置批量权限",
            img: "addRole.png",
            tooltip: "设置批量权限"
        },{
            type: "button",
            id: "add_bt",
            text: "设置单个权限",
            img: "addRole.png",
            tooltip: "设置单个权限"
        }]
	};
    toolbar = new dhtmlXToolbarObject(toolbarData);
 	toolbar.attachEvent("onClick", function(id) {
 		if(id=="add_bt"){
 			var checkIds = getCheckIds();
 			if(checkIds==""||checkIds.length==0){
 				dhx.alert("请选择一个任务");
 			}else if(checkIds.length>1){
 				dhx.alert("只能选择一个任务");
 			}else{
 				userType();
 			}
 		}else if(id=="adds_bt"){
 			var checkIds = getCheckIds();
 			if(checkIds==""||checkIds.length==0){
 				dhx.alert("请选择一个任务");
 			}else{
 				userType();
 			}
 		}
    });

 	UserTypeAction.getUserAction(function(data){
 		for(var i=0;i<data.length;i++){
 			if(data[i].ACTION_ID==3001){
 				if(data[i].FLAG==1){
 					addRole = 1;
 					newBtn.style.visibility = "";
 				}
	 			return;
 			}
 		}
    });
}

/**
 * 查询数据规则名称
 */
function queryDataRuleInfo(){
	HBQryRuleAction.queryDataRuleInfo(function(data){
		dataRuleInfo = data;
		alert("规则名称:"+dataRuleInfo);
    });
}

/**
 * 查询数据源信息
 */
function queryDataSource(){
	alert("数据源名称:"+dataSource);
	DataSourceAction.queryDataSource(function(data){
		dataSource = data;
		alert("数据源名称:"+dataSource);
    });
}

/**
 * 查询表信息
 */
function queryDataTableInfo(sourceId){
	HBTableAction.queryDataTableInfo(sourceId,function(data){
		dataTableInfo = data;
		alert("表信息名称:"+dataTableInfo);
    });
}

/**
 * 查询数据
 */
function queryData(dt,params){
        var termVals=TermReqFactory.getTermReq(1).getKeyValue();
        termVals["_COLUMN_SORT"] = params.sort;
        dhx.showProgress("请求数据中");
        HBQryRuleAction.queryQryRuleInfo(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
            dhx.closeProgress();
            var total = 0;
            if(data && data[0])
                total = data[0]["TOTAL_COUNT_"];
            dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
        });

}

var checkAll = false;
function check(v){
	//dataTable.grid.checkAll(false);
	//v.checked="checked";
	//var ids=dataTable.grid.getAllRowIds();

	//document.getElementById("chk_list1805").checked = "checked";
	
	if(checkAll){
		var code_Values = document.getElementsByTagName("input"); 
		for(i = 0;i < code_Values.length;i++){ 
			if(code_Values[i].type == "checkbox") 
			{ 
				code_Values[i].checked = false; 
			} 
		} 
		v.src = "../../../meta/resource/dhtmlx/imgs/csh_dhx_skyblue/item_chk0.gif";
		checkAll = false;
	}else{
		var code_Values = document.getElementsByTagName("input"); 
		for(i = 0;i < code_Values.length;i++){ 
			if(code_Values[i].type == "checkbox") 
			{ 
				code_Values[i].checked = true; 
			} 
		} 
		v.src = "../../../meta/resource/dhtmlx/imgs/csh_dhx_skyblue/item_chk1.gif";
		checkAll = true;
	}
}

function getCheckIds(){
	var ids = [];
	var code_Values = document.getElementsByTagName("input"); 
	for(i = 0;i < code_Values.length;i++){ 
		if(code_Values[i].type == "checkbox") 
		{ 
			if(code_Values[i].checked == true){
				ids.push(code_Values[i].value);
			}
		} 
	} 
	return ids;
}



function dataTableInit(){
    dataTable = new meta.ui.DataTable("container");
    dataTable.setColumns({
    	CB:"<img style=\"padding-right:10px;\" src=\"../../../meta/resource/dhtmlx/imgs/csh_dhx_skyblue/item_chk0.gif\" onclick=\"check(this);\"/>",
        QRY_RULE_ID: "查询规则ID",
        QRY_RULE_NAME: "查询规则名称",
        DATA_SOURCE_NAME: "数据源名称",
        HB_TABLE_NAME: "HBase表名",
        PARALLEL_NUM: "并发访问数",
        PAGINATION_SIZE: "分页大小",
        SUPPORT_SORT: "是否支持排序",
        DEF_SORT_COLUMN: "排序列",
        STATE: "状态",
        OPP: "操作"
    },"CB,QRY_RULE_ID,QRY_RULE_NAME,DATA_SOURCE_NAME,HB_TABLE_NAME,PARALLEL_NUM,PAGINATION_SIZE,SUPPORT_SORT,DEF_SORT_COLUMN,STATE,OPP");
 	dataTable.setRowIdForField("QRY_RULE_ID");
    dataTable.setFormatCellCall(function(rid, cid, data, colId){
    	
    	if(colId=="CB"&&dataTable.getUserData(rid,"CREATER")==1){
	    	return "<input type=\"checkbox\" value = \""+rid+"\">";
    	}
    	
        if(colId == "OPP"){
	    	
        	var str = "";
        		str += "<a href='javascript:void(0)' onclick='addQryRule(\""+rid+"\",1);return false;'>查看</a>&nbsp;";
        	if(dataTable.getUserData(rid,"MODI")==1){
        		str += "<a href='javascript:void(0)' onclick='addQryRule(\""+rid+"\",-1);return false;'>修改</a>&nbsp;";
        	}
        	if(addRole==1&&dataTable.getUserData(rid,"MODI")==1){
        		str += "<a href='javascript:void(0)' onclick='copyQryRule(\""+rid+"\");return false;'>复制</a>&nbsp;";
        	}
        	if(dataTable.getUserData(rid,"VIEW")==1&&dataTable.getUserData(rid,"STATE")=="0"){
        		str += "<a href='javascript:void(0)' onclick='addQryRule(\""+rid+"\",2);return false;'>测试</a>&nbsp;";
        	}
        	if(dataTable.getUserData(rid,"DEL")==1){
        		str += "<a href='javascript:void(0)' onclick='deleteQryRule(\""+rid+"\");return false;'>删除</a>&nbsp;";
        	}
            if(adminFlag==1){
            	str += "<a href='javascript:void(0)' onclick=\"userToUser("+dataTable.getUserData(rid,"QRY_RULE_ID")+",'"+dataTable.getUserData(rid,"QRY_RULE_NAME")+"');return false;\">修改创建人</a>";
            }
            return str;
        }else if(colId == "SUPPORT_SORT"){
            return data[cid] =="0"?"否":"是" ;
        }else if(colId == "STATE"){
            return data[cid] =="0"?"有效":"无效" ;
        }else if(colId = "PARALLEL_NUM"){
        	return data[cid] == -1?"":data[cid]
        }else if(colId = "PAGINATION_SIZE"){
        	return data[cid] == -1?"":data[cid]
        }
        return data[cid];
    });
    return dataTable;
}

function addQryRule(rid,flag){
    if(flag==0){
        try{
            openMenu("新增规则","/meta/module/hbaseQuery/qryAdd.jsp?flag='add'","top","addRule");
        }catch(e) {
            window.open(urlEncode(getBasePath()+"/meta/module/hbaseQuery/qryAdd.jsp?flag='add'"),'addRule');
        }
    }else if(flag==1){
        try{
            openMenu("查看规则","/meta/module/hbaseQuery/qryAdd.jsp?qryRuleId="+dataTable.getUserData(rid,"QRY_RULE_ID")+"&flag='show'","top","showRule_"+dataTable.getUserData(rid,"QRY_RULE_ID"));
        }catch(e) {
            window.open(urlEncode(getBasePath()+"/meta/module/hbaseQuery/qryAdd.jsp?qryRuleId="+dataTable.getUserData(rid,"QRY_RULE_ID")+"&flag='show'"),'showRule_'+dataTable.getUserData(rid,"QRY_RULE_ID"));
        }
    }
    else if(flag==2){
        try{
            openMenu("测试规则","/meta/module/hbaseQuery/testRule.jsp?qryRuleId="+dataTable.getUserData(rid,"QRY_RULE_ID")+"&qryRuleName="+encodeURIComponent(encodeURIComponent(dataTable.getUserData(rid,"QRY_RULE_NAME")))+"&flag='show'","top","testRule_"+dataTable.getUserData(rid,"QRY_RULE_ID"));
        }catch(e) {
            window.open(urlEncode(getBasePath()+"/meta/module/hbaseQuery/testRule.jsp"),'showRule_'+dataTable.getUserData(rid,	"QRY_RULE_ID"));
        }
    }
    else if(flag==-1){
        try{
            openMenu("修改规则","/meta/module/hbaseQuery/qryAdd.jsp?qryRuleId="+dataTable.getUserData(rid,"QRY_RULE_ID")+"&flag='modify'","top","modifyRule_"+dataTable.getUserData(rid,"QRY_RULE_ID"));
        }catch(e) {
            window.open(urlEncode(getBasePath()+"/meta/module/hbaseQuery/qryAdd.jsp?qryRuleId="+dataTable.getUserData(rid,"QRY_RULE_ID")+"&flag=0"),'showRule_'+dataTable.getUserData(rid,"QRY_RULE_ID"));
        }
    }
}
/**
 * 复制
 * @param rid
 */
function copyQryRule(rid){
   /** HBQryRuleAction.copyQryRuleInfo(ruleId,function(data){
        if(data && data.flag == 1) {
            alert("复制成功！");
            dataTable.refreshData();
        }else {
            dhx.alert("复制失败，详细信息请查看日志！");
        }
    });**/
    var qryId = dataTable.getUserData(rid,"QRY_RULE_ID");
    $("qryRuleNameId").value = qryId;
    if(!maintainWin){
        maintainWin = DHTMLXFactory.createWindow("1","maintainWin",0,0,500,150);
        maintainWin.stick();
        maintainWin.setModal(true);
        maintainWin.denyResize();
        maintainWin.denyPark();
        maintainWin.button("minmax1").hide();
        maintainWin.button("park").hide();
        maintainWin.button("stick").hide();
        maintainWin.button("sticked").hide();
        maintainWin.center();
        maintainWin.keepInViewport(true);
        maintainWin.setText("复制查询规则");
        

        var groupFormDIV = document.getElementById("authorityFormDIV");
        maintainWin.attachObject(authorityFormDIV);
        var saveBtn = document.getElementById("saveBtn");
        
        attachObjEvent(saveBtn,"onclick",function(){
        	if(!(dhtmlxValidation.validate("authorityFormDIV")))return;
   			 var data = {};
   			 data["qryRuleName"] = $("qryRuleName").value;
   			 data["RULE_ID"] = $("qryRuleNameId").value;
   	 dhx.showProgress("保存数据中");
   	 HBQryRuleAction.copyQryRuleInfo(data,function(data){
   	 dhx.closeProgress();
        if(data && data.flag == 1) {
            alert("复制成功！");
            dataTable.refreshData();
            $("qryRuleName").value = "";
            $("qryRuleNameId").value = "";
            qryId = "";
            maintainWin.setModal(false);
            maintainWin.hide();
        }else {
            dhx.alert("复制失败，详细信息请查看日志！");
            $("qryRuleName").value = "";
            maintainWin.setModal(false);
            maintainWin.hide();
        }
    });
        });
        maintainWin.attachEvent("onClose",function(){
            maintainWin.setModal(false);
            this.hide();
            return false;
        });

        dhtmlxValidation.addValidation(authorityFormDIV, [
            {target:"qryRuleName",rule:"NotEmpty,MaxLength[64]"}
        ],"true");
    }else{
    	maintainWin.show();
        maintainWin.setModal(true);
        dataTable.refreshData();
    }
   
}


/**
 * 删除
 * @param rid
 */
function deleteQryRule(rid){
    dhx.confirm("您确定要删除该查询规则吗？", function (rs) {
        if(rs){
          var qryId = dataTable.getUserData(rid,"QRY_RULE_ID");
           HBQryRuleAction.deleteQryRuleInfo(qryId,function(data){
            if(data && data.flag == 1) {
                dhx.alert("删除成功！");
                dataTable.refreshData();
            }else {
                dhx.alert("删除失败，详细信息请查看日志！");
        }
    });
    }
    });
}


//关联用户
var userTypeWin = null;

function userType(){

    if(!userTypeWin){
        userTypeWin = DHTMLXFactory.createWindow("1","userTypeWin",0,0,600,400);
        userTypeWin.stick();
        userTypeWin.denyResize();
        userTypeWin.denyPark();
        userTypeWin.button("minmax1").hide();
        userTypeWin.button("park").hide();
        userTypeWin.button("stick").hide();
        userTypeWin.button("sticked").hide();
       

        userTypeWin.center();

        var dataFormDIV = document.getElementById("dataUserTypeDIV");
        userTypeWin.attachObject(dataFormDIV);
        var saveBtn = document.getElementById("saveUserTypeBtn");
        var calBtn = document.getElementById("calUserTypeBtn");
        attachObjEvent(saveBtn,"onclick",saveUserAuthor);
        attachObjEvent(calBtn,"onclick",function(){userTypeWin.close();});
		userTypeTableInit();
		userTypeTable.setReFreshCall(queryUserTypeData); 
		
        userTypeWin.attachEvent("onClose",function(){
            userTypeWin.setModal(false);
            this.hide();
            return false;
        });


    }
    userTypeWin.setText("关联用户");
    userTypeTable.refreshData();
    userTypeWin.setModal(true);
    userTypeWin.show();
    userTypeWin.center();
}

var userTypeTable = null;//表格
//初始数据表格
function userTypeTableInit(){
	
    userTypeTable = new meta.ui.DataTable("tableUserType",false);//第二个参数表示是否是表格树
    userTypeTable.setColumns({
        USER_NAMECN:"用户中文名称",
        VIEW:"查看",
        MODI:"修改",
        DEL:"删除"
    },"USER_NAMECN,VIEW,MODI,DEL");
    userTypeTable.setRowIdForField("USER_ID");
    userTypeTable.setPaging(false);//分页
    
    userTypeTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    userTypeTable.grid.setInitWidthsP("40,20,20,20");
    
    userTypeTable.setGridColumnCfg(0,{align:"center"});
    userTypeTable.setGridColumnCfg(1,{align:"center",type:"ch"});
    userTypeTable.setGridColumnCfg(2,{align:"center",type:"ch"});
    userTypeTable.setGridColumnCfg(3,{align:"center",type:"ch"});
    userTypeTable.setFormatCellCall(function(rid,cid,data,colId){

        return data[cid];
    });

    return userTypeTable;
}

//查询数据
var userData = null;
function queryUserTypeData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    var checkIds = getCheckIds();
    if(checkIds.length==1){
    	termVals["jobId"] = checkIds[0];
    }
    termVals["tasktype"] = 3;
    //termVals.COL_DATATYPE = document.getElementById("COL_DATATYPE").value;
    //termVals.COL_ORIGIN = document.getElementById("COL_ORIGIN").value;
    
    dhx.showProgress("请求数据中");
    UserAuthorAction.queryUserAuthor(termVals,null,function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        userData = data;
    	//查询出数据后，必须显示调用绑定数据的方法
    	userTypeTable.bindData(data,total); 
    });
}

function saveUserAuthor(){
	//alert(userData[0]["USER_ID"]);
	var checkIds = getCheckIds();
	var userAuthorData = [];
	//alert(userTypeTable.grid.cellById(userData[0]["USER_ID"], 0).getValue());
	//var checkIds = userTypeTable.grid.getAllRows(0).split(",");
	for(var i = 0;i<userData.length;i++){
		var datat = {};
		datat.userid=userData[i]["USER_ID"];
		datat.view=userTypeTable.grid.cellById(userData[i]["USER_ID"], 1).getValue();
		datat.modi=userTypeTable.grid.cellById(userData[i]["USER_ID"], 2).getValue();
		datat.del=userTypeTable.grid.cellById(userData[i]["USER_ID"], 3).getValue();
		userAuthorData.push(datat);
	}
	
	var jobIds = [];
	for(var i = 0;i<checkIds.length;i++){
		if(dataTable.getUserData(checkIds[i],"CREATER")==1){
			jobIds.push(checkIds[i]);
		}
	}
	
	if(jobIds.length==0){
		dhx.alert("请选择一个任务");
		return;
	}
	var data = {};
	data.tasktype = 3
	data.jobIds = jobIds;
	data.userAuthorData=userAuthorData;
    dhx.showProgress("保存数据中");
    UserAuthorAction.saveUserAuthor(data,function(ret){
        dhx.closeProgress();
		dhx.alert(ret.MESSAGE);
		
		if(ret.RESULT){
			dataTable.refreshData();
			userTypeWin.close();
		}
    });
}

//修改创建人
var userToUserWin = null;
function userToUser(rid,username){
	document.getElementById("task_id").value=rid;
	

    UserAuthorAction.getJobUser(rid,"3",function(userData){
		var data = {};
		data.SAME_USER_ID = userData.USER_ID;
		UserTypeAction.queryUser(data,null,function(data){
	    	var paramsTD = document.getElementById("to_user_id");
		    paramsTD.options.length = 0; 
		    paramsTD.options[0] = new Option("--请选择--","");
		    for(var m=0;m<data.length;m++){
		    	paramsTD.options[m+1] = new Option(data[m].USER_NAMECN,data[m].USER_ID);
		    }
	    });
		document.getElementById("from_user_id").value = userData.USER_ID;
		document.getElementById("from_user_name").value = userData.USER_NAMECN;
		document.getElementById("from_user_name").disabled = "disabled";
		document.getElementById("task_name").value=username;
		document.getElementById("task_name").disabled = "disabled";
		document.getElementById("to_user_id").value="";
    });
	
    if(!userToUserWin){
        userToUserWin = DHTMLXFactory.createWindow("1","userToUserWin",0,0,400,200);
        userToUserWin.stick();
        userToUserWin.denyResize();
        userToUserWin.denyPark();
        userToUserWin.button("minmax1").hide();
        userToUserWin.button("park").hide();
        userToUserWin.button("stick").hide();
        userToUserWin.button("sticked").hide();
	    userToUserWin.setText("修改创建人");
        userToUserWin.center();
        var dataFormDIV = document.getElementById("dataUserToUserDIV");
        userToUserWin.attachObject(dataFormDIV);
        var saveBtn = document.getElementById("saveUserToUserBtn");
        var calBtn  = document.getElementById("calUserToUserBtn");
        attachObjEvent(saveBtn,"onclick",changeCreateUser);
        attachObjEvent(calBtn,"onclick",function(){userToUserWin.close();});
        userToUserWin.attachEvent("onClose",function(){
            userToUserWin.setModal(false);
            this.hide();
            return false;
        });
    }

    userToUserWin.setModal(true);
    userToUserWin.show();
    userToUserWin.center();
}

function changeCreateUser(){
	var taskId = document.getElementById("task_id").value;
	var toUserId = document.getElementById("to_user_id").value;
	var fromUserId = document.getElementById("from_user_id").value;
	if(toUserId==""){
		dhx.alert("请选择新创建人");
		return;
	}
	if(taskId==""){
		dhx.alert("任务ID异常");
		return;
	}
	if(toUserId==fromUserId){
		dhx.alert("相同的创建人");
		return;
	}
	var changeData = {};
	changeData.taskId = taskId;
	changeData.taskType = 3;
	changeData.fromUserId = fromUserId;
	changeData.toUserId = toUserId;
	
    dhx.showProgress("保存数据中");
    UserAuthorAction.changeCreateUser(changeData,function(ret){
        dhx.closeProgress();
		dhx.alert(ret.MESSAGE);
		
		if(ret.RESULT){
			dataTable.refreshData();
			userToUserWin.close();
		}
    });
    
}

dhx.ready(pageInit);