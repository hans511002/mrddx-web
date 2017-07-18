/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        JobAction.js
 *Description：
 *
 *Dependent：
 *
 *Author:	王建友
 *        
 ********************************************************/
var dataTable = null;//表格

var addRole = 0;
var adminFlag = 0;
//初始界面
function pageInit() {
	adminFlag = getSessionAttribute("user").adminFlag;
    var termReq = TermReqFactory.createTermReq(1);
    
    var jobName = termReq.createTermControl("jobName","JOB_NAME");
    jobName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });


    dataTableInit(); //初始数据表格  初始之后dataTable才会被实例化
    dataTable.setReFreshCall(queryData); //设置表格刷新的回调方法，即实际查询数据的方法
    
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    var newBtn   = document.getElementById("newBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    attachObjEvent(newBtn,"onclick",function(){
//    	openMenu("新增任务","/meta/module/bigdata/mrddx/config/addJob.jsp?flag='add'","top");
        openMenu("新增任务","/meta/module/bigdata/mrddx/config/saveJob.jsp","top","newjob");
    });
    
	var toolbarData = {
        parent: "toolbarObj",
        icon_path: "../../../../../meta/resource/images/",
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
 			}
 		}
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
		v.src = "../../../../../meta/resource/dhtmlx/imgs/csh_dhx_skyblue/item_chk0.gif";
		checkAll = false;
	}else{
		var code_Values = document.getElementsByTagName("input"); 
		for(i = 0;i < code_Values.length;i++){ 
			if(code_Values[i].type == "checkbox") 
			{ 
				code_Values[i].checked = true; 
			} 
		} 
		v.src = "../../../../../meta/resource/dhtmlx/imgs/csh_dhx_skyblue/item_chk1.gif";
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

//初始数据表格
function dataTableInit(){
    var dd = document.getElementById("dataDiv");
    var pageContent = document.getElementById("pageContent");
    var queryFormDIV = document.getElementById("queryFormDIV");
    queryFormDIV.style.width = pageContent.offsetWidth -30  + "px";
    dd.style.width = pageContent.offsetWidth  + "px";
    dd.style.height = pageContent.offsetHeight-queryFormDIV.offsetHeight - 44 + "px";
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
    	CB:"<img style=\"padding-right:10px;\" src=\"../../../../../meta/resource/dhtmlx/imgs/csh_dhx_skyblue/item_chk0.gif\" onclick=\"check(this);\"/>",
        JOB_ID:"JobID",
        JOB_NAME:"Job名称",
//        JOB_STATUS:"状态",
        INPUT_DATA_NAME:"输入数据源",
        OUTPUT_DATA_NAME:"输出数据源",
        JOB_PRIORITY_NAME:"优先级",
        INPUT_DIR:"输入目录",
		MAP_TASKS:"Map任务数",
        REDUCE_TASKS:"Reduce任务数",
        JOB_DESCRIBE:"描述信息",
        opt:"操作"
    },"CB,JOB_ID,JOB_NAME,INPUT_DATA_NAME,OUTPUT_DATA_NAME,JOB_PRIORITY_NAME,INPUT_DIR,MAP_TASKS,REDUCE_TASKS,JOB_DESCRIBE,INPUT_DATA_SOURCE_ID,OUTPUT_DATA_SOURCE_ID,JOB_PRIORITY,INPUT_SOURCE_TYPE_ID,OUTPUT_SOURCE_TYPE_ID,VIEW");
    dataTable.setRowIdForField("JOB_ID");
    dataTable.setPaging(true,17);//分页
    dataTable.setSorting(true,{
        JOB_ID:"desc"
    });
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("3,7,10,9,8,5,10,8,10,10,20");
    dataTable.setGridColumnCfg(0,{align:"center"});
    dataTable.setGridColumnCfg(1,{align:"left"});
    dataTable.setGridColumnCfg(2,{align:"left"});
    dataTable.setGridColumnCfg(3,{align:"left"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    dataTable.setGridColumnCfg(5,{align:"left"});
    dataTable.setGridColumnCfg(6,{align:"center"});
    dataTable.setGridColumnCfg(7,{align:"center"});
    dataTable.setGridColumnCfg(8,{align:"left"});
    dataTable.setGridColumnCfg(9,{align:"center"});
    dataTable.setGridColumnCfg(10,{align:"center"});
    
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
    	
    	if(colId=="CB"&&dataTable.getUserData(rid,"CREATER")==1){
	    	return "<input type=\"checkbox\" value = \""+rid+"\">";
    	}
    	
        if(colId=="OPT"){
        	var jobId = dataTable.getUserData(rid,"JOB_ID");
            var jobName = dataTable.getUserData(rid,"JOB_NAME");
            var inputDataName = dataTable.getUserData(rid,"INPUT_DATA_NAME");
            var outputDataName = dataTable.getUserData(rid,"OUTPUT_DATA_NAME");
            var jobPriorityName = dataTable.getUserData(rid,"JOB_PRIORITY_NAME");
            var inputDir = dataTable.getUserData(rid,"INPUT_DIR");
            var mapTasks = dataTable.getUserData(rid,"MAP_TASKS");
            var reduceTasks = dataTable.getUserData(rid,"REDUCE_TASKS");
            var jobDescribe = dataTable.getUserData(rid,"JOB_DESCRIBE");
            var inputDataSourceId = dataTable.getUserData(rid,"INPUT_DATA_SOURCE_ID");
            var outputDataSourceId = dataTable.getUserData(rid,"OUTPUT_DATA_SOURCE_ID");
            var jobPriority = dataTable.getUserData(rid,"JOB_PRIORITY");
            var inputSourceTypeId = dataTable.getUserData(rid,"INPUT_SOURCE_TYPE_ID");
            var outputSourceTypeId = dataTable.getUserData(rid,"OUTPUT_SOURCE_TYPE_ID");
            var str = "";
            //操作
            	str += "<a href='javascript:void(0)' onclick='OpenViewWin(1,"+jobId+");return false;'>查看</a>";
            if(dataTable.getUserData(rid,"MODI")==1){
            	str += "&nbsp;<a href='javascript:void(0)' onclick='OpenManagerWin(2,"+jobId+","+inputDataSourceId+",\""+inputDataName+"\","+outputDataSourceId+",\""+outputDataName+"\","+inputSourceTypeId+","+outputSourceTypeId+");return false;'>修改</a>";
            }
            if(addRole==1&&dataTable.getUserData(rid,"MODI")==1){
            	str += "&nbsp;<a href='javascript:void(0)' onclick='OpenManagerWin(3,"+jobId+","+inputDataSourceId+",\""+inputDataName+"\","+outputDataSourceId+",\""+outputDataName+"\","+inputSourceTypeId+","+outputSourceTypeId+");return false;'>复制</a>";
            }
            if(dataTable.getUserData(rid,"DEL")==1){
            	str += "&nbsp;<a href='javascript:void(0)' onclick='delJob("+jobId+",\""+jobName+"\");return false;'>删除</a>";
            }
            if(adminFlag==1){
            	str += "&nbsp;<a href='javascript:void(0)' onclick=\"userToUser("+jobId+",'"+jobName+"');return false;\">修改创建人</a>";
            }
            return str;
        }
        return data[cid];
    });

    return dataTable;
}
//查看
function OpenViewWin(a,b){
	if(a==1){
		openMenu("查看任务","/meta/module/bigdata/mrddx/config/viewJob.jsp?flag='view'&jobId="+b,"top","jobViewId="+b);
	}
}
//修改
function OpenManagerWin(a,b,c,c1,d,d1,e,f){
//	if(a==2){
//		openMenu("修改任务","/meta/module/bigdata/mrddx/config/modiJob.jsp?flag='modi'&jobId="+b+"&inputDataSourceId="+c+"&inputDataSourceName="+encodeURIComponent(encodeURIComponent(c1))+"&outputDataSourceId="+d+"&outputDataSourceName="+encodeURIComponent(encodeURIComponent(d1))+"&inputSourceTypeId="+e+"&outputSourceTypeId="+f,"top","jobModifyId"+b);
//	}else if(a==3){
//		openMenu("复制任务","/meta/module/bigdata/mrddx/config/modiJob.jsp?flag='copy'&jobId="+b+"&inputDataSourceId="+c+"&inputDataSourceName="+encodeURIComponent(encodeURIComponent(c1))+"&outputDataSourceId="+d+"&outputDataSourceName="+encodeURIComponent(encodeURIComponent(d1))+"&inputSourceTypeId="+e+"&outputSourceTypeId="+f,"top","jobCopyId="+b);
//	}

    if(a==2){
        openMenu("修改任务","/meta/module/bigdata/mrddx/config/saveJob.jsp?jobId="+b,"top","jobModifyId"+b);
    }else if(a==3){
        openMenu("复制任务","/meta/module/bigdata/mrddx/config/saveJob.jsp?jobId="+b+"&copyFlag=1","top","jobCopyId="+b);
    }
}
	
//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals["_COLUMN_SORT"] = params.sort;
    dhx.showProgress("请求数据中");
    JobAction.queryJob(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}


//删除job
function delJob(jobId,jobName){
    dhx.confirm("您确定要删除【"+jobName+"】配置吗？", function (rs) {
        if (rs) {
            dhx.showProgress("正在执行删除...");
            JobAction.deleteJob(jobId,function(rs){
                dhx.closeProgress();
                if(rs){
                    dhx.alert("删除成功！");
                    dataTable.refreshData();
                }else{
                    dhx.alert("删除失败！");
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
    termVals["tasktype"] = 2;
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
	data.tasktype = 2
	data.jobIds = checkIds;
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
    UserAuthorAction.getJobUser(rid,"2",function(userData){
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
	changeData.taskType = 2;
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
