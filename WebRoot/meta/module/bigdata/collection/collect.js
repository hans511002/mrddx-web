/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        CollectAction.js
 *Description：
 *
 *Dependent：
 *
 *Author:	王建友
 *        
 ********************************************************/
var dataTable = null;//表格
var addRole = 0;
var addRole2 = 0;
var adminFlag = 0;

//初始界面
function pageInit() {
	adminFlag = getSessionAttribute("user").adminFlag;
	
    var termReq = TermReqFactory.createTermReq(1);
	
    var collectJobName = termReq.createTermControl("collectJobName","COLLECT_JOB_NAME");
    collectJobName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    
    dataTableInit(); 
    dataTable.setReFreshCall(queryData); 
    
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    var newBtnUp   = document.getElementById("newBtnUp");
    var newBtnDown = document.getElementById("newBtnDown");
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    attachObjEvent(newBtnUp,"onclick",function(){
    	openMenu("新增采集任务","/meta/module/bigdata/collection/addUpCollect.jsp?flag='add'","top","up");
    });
    attachObjEvent(newBtnDown,"onclick",function(){
    	openMenu("新增采集任务","/meta/module/bigdata/collection/addDownCollect.jsp?flag='add'&COL_NAME=新增采集任务","top","down");
    });
    
	var toolbarData = {
        parent: "toolbarObj",
        icon_path: "../../../../meta/resource/images/",
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
 	
 	UserTypeAction.getUserAction(function(roledata){
 		for(var i=0;i<roledata.length;i++){
 			if(roledata[i].ACTION_ID==2001){
 				if(roledata[i].FLAG==1){
 					addRole2 = 1;
 					newBtnUp.style.visibility = "";
 				}
 			}else if(roledata[i].ACTION_ID==1001){
 				if(roledata[i].FLAG==1){
 					addRole = 1;
 					newBtnDown.style.visibility = "";
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
		v.src = "../../../../meta/resource/dhtmlx/imgs/csh_dhx_skyblue/item_chk0.gif";
		checkAll = false;
	}else{
		var code_Values = document.getElementsByTagName("input"); 
		for(i = 0;i < code_Values.length;i++){ 
			if(code_Values[i].type == "checkbox") 
			{ 
				code_Values[i].checked = true; 
			} 
		} 
		v.src = "../../../../meta/resource/dhtmlx/imgs/csh_dhx_skyblue/item_chk1.gif";
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
    dd.style.width = pageContent.offsetWidth  + "px";
    dd.style.height = pageContent.offsetHeight-queryFormDIV.offsetHeight-30 + "px";
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
    	//CB:"<div style=\"background-image: url(/meta/resource/dhtmlx/imgs/csh_dhx_skyblue/item_chk1.gif)\" onclick=\"check(this);\">-</div>",
    	CB:"<img style=\"padding-right:10px;\" src=\"../../../../meta/resource/dhtmlx/imgs/csh_dhx_skyblue/item_chk0.gif\" onclick=\"check(this);\"/>",
    	COL_ID :"采集策略ID",
        COL_NAME:"采集名称",
        COL_ORIGIN:"采集方向",
        COL_DATATYPE:"文件类型",
        COL_STATUS:"状态",
        COL_DESCRIBE:"描述",
        opt:"操作"
    },"CB,COL_ID,COL_NAME,COL_ORIGIN,COL_DATATYPE,COL_STATUS,COL_DESCRIBE");
    dataTable.setRowIdForField("COL_ID");
    dataTable.setPaging(true,15);//分页
    dataTable.setSorting(true,{
        COL_ID:"desc"
    });
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("3,10,15,10,10,7,20,25");
    
    dataTable.setGridColumnCfg(0,{align:"center"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    dataTable.setGridColumnCfg(5,{align:"center"});
    dataTable.setGridColumnCfg(6,{align:"center"});
    dataTable.setGridColumnCfg(7,{align:"center"});
    
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
    	
	    if(colId=="CB"&&dataTable.getUserData(rid,"CREATER")==1){
	    	return "<input type=\"checkbox\" value = \""+rid+"\">";
    	}
    	
    	if(colId=="COL_STATUS"){
    		var status = dataTable.getUserData(rid,"COL_STATUS");
    		return status==1?"启用":"禁用";
    	}
    	
    	if(colId=="COL_ORIGIN"){
    		var status = dataTable.getUserData(rid,"COL_ORIGIN");
    		if(status==0){
    			return "下载";
    		}
    		if(status==1){
    			return "上传";
    		}
    		return "";
    	}
    	
    	if(colId=="COL_DATATYPE"){
    		var status = dataTable.getUserData(rid,"COL_DATATYPE");
    		if(status==0){
    			return "文本文件";
    		}
    		if(status==1){
    			return "其他文件";
    		}
    		return "";
    	}
    	
        if(colId=="OPT"){
        	/*if(dataTable.getUserData(rid,"CREATER")==1){
        		dataTable.grid.setCellExcellType(rid,0,"ch");
        	}*/
        	
            var COL_ID = dataTable.getUserData(rid,"COL_ID");
        	var COL_NAME = dataTable.getUserData(rid,"COL_NAME");
        	var COL_ORIGIN = dataTable.getUserData(rid,"COL_ORIGIN");
        	var COL_DATATYPE = dataTable.getUserData(rid,"COL_STATUS");
        	var COL_DESCRIBE = dataTable.getUserData(rid,"COL_DESCRIBE");
        	if(!COL_DESCRIBE){
        		COL_DESCRIBE="";
        	}
        	
            var str = "";
            if(dataTable.getUserData(rid,"COL_ORIGIN")==1){
            //操作
            	str += "<a href='javascript:void(0)' onclick=\"openModiCollect(0,'"+COL_ID+"','"+COL_NAME+"','"+COL_ORIGIN+"','"+COL_DATATYPE+"','"+COL_DESCRIBE+"');return false;\">查看</a>";
            }else if(dataTable.getUserData(rid,"COL_ORIGIN")==0){
            	str += "<a href='javascript:void(0)' onclick=\"openModiCollect2(0,'"+COL_ID+"','"+COL_NAME+"','"+COL_ORIGIN+"','"+COL_DATATYPE+"','"+COL_DESCRIBE+"');return false;\">查看</a>";
            }
            if(dataTable.getUserData(rid,"MODI")==1){
	            if(dataTable.getUserData(rid,"COL_ORIGIN")==1){
	            //操作
	            	str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=\"openModiCollect(1,'"+COL_ID+"','"+COL_NAME+"','"+COL_ORIGIN+"','"+COL_DATATYPE+"','"+COL_DESCRIBE+"');return false;\">修改</a>";
	            }else{
	            	str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=\"openModiCollect2(1,'"+COL_ID+"','"+COL_NAME+"','"+COL_ORIGIN+"','"+COL_DATATYPE+"','"+COL_DESCRIBE+"');return false;\">修改</a>";
	            }
	            if(dataTable.getUserData(rid,"COL_STATUS")==1){
	            	str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=\"jyCollect("+COL_ID+",'"+COL_NAME+"');return false;\">禁用</a>";
	            }else{
	            	str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=\"qyCollect("+COL_ID+",'"+COL_NAME+"');return false;\">启用</a>";
	            }
	        }
            if(dataTable.getUserData(rid,"DEL")==1){
            	str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=\"delCollect("+COL_ID+",'"+COL_NAME+"');return false;\">删除</a>";
            }
            if(adminFlag==1){
            	str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=\"userToUser("+COL_ID+",'"+COL_NAME+"');return false;\">修改创建人</a>";
            }
        	return str;
        }
        
        return data[cid];
    });

    return dataTable;
}


//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals["_COLUMN_SORT"] = params.sort;
    termVals.COL_DATATYPE = document.getElementById("COL_DATATYPE").value;
    termVals.COL_ORIGIN = document.getElementById("COL_ORIGIN").value;
    
    dhx.showProgress("请求数据中");
    CollectionAction.queryJob(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        	//查询出数据后，必须显示调用绑定数据的方法
        	dataTable.bindData(data,total); 
    });
}

function openViewCollect(collectJobId){
	openMenu("查看采集信息","/meta/module/bigdata/datax/viewCollect.jsp?flag='view'&collectJobId="+collectJobId,"top","collectJobjViewId="+collectJobId);
}

function openModiCollect(id,COL_ID,COL_NAME,COL_ORIGIN,COL_DATATYPE,COL_DESCRIBE){
	if(id==0){
		openMenu("查看采集信息","/meta/module/bigdata/collection/addUpCollect.jsp?flag='info'&COL_ID="+COL_ID+"&COL_NAME="+COL_NAME+"&COL_ORIGIN="+COL_ORIGIN+"&COL_DATATYPE="+COL_DATATYPE+"&COL_DESCRIBE="+COL_DESCRIBE,"top","colIdView="+COL_ID);		
	}else if(id==1){
		openMenu("修改采集信息","/meta/module/bigdata/collection/addUpCollect.jsp?flag='modi'&COL_ID="+COL_ID+"&COL_NAME="+COL_NAME+"&COL_ORIGIN="+COL_ORIGIN+"&COL_DATATYPE="+COL_DATATYPE+"&COL_DESCRIBE="+COL_DESCRIBE,"top","colIdModify="+COL_ID);
	}else if(id==2){
		openMenu("复制采集信息","/meta/module/bigdata/collection/copyCollect.jsp?flag='copy'&COL_ID="+COL_ID+"&COL_NAME="+COL_NAME+"&COL_ORIGIN="+COL_ORIGIN+"&COL_DATATYPE="+COL_DATATYPE+"&COL_DESCRIBE="+COL_DESCRIBE,"top","colIdCopy="+COL_ID);		
	}
	
}

function openModiCollect2(id,COL_ID,COL_NAME,COL_ORIGIN,COL_DATATYPE,COL_DESCRIBE){
	if(id==0){
		openMenu("查看采集信息","/meta/module/bigdata/collection/addDownCollect.jsp?flag='info'&COL_ID="+COL_ID+"&COL_NAME="+COL_NAME+"&COL_ORIGIN="+COL_ORIGIN+"&COL_DATATYPE="+COL_DATATYPE+"&COL_DESCRIBE="+COL_DESCRIBE,"top","colIdView="+COL_ID);		
	}else if(id==1){
		openMenu("修改采集信息","/meta/module/bigdata/collection/addDownCollect.jsp?flag='modi'&COL_ID="+COL_ID+"&COL_NAME="+COL_NAME+"&COL_ORIGIN="+COL_ORIGIN+"&COL_DATATYPE="+COL_DATATYPE+"&COL_DESCRIBE="+COL_DESCRIBE,"top","colIdModify="+COL_ID);
	}else if(id==2){
		openMenu("复制采集信息","/meta/module/bigdata/collection/copyCollect.jsp?flag='copy'&COL_ID="+COL_ID+"&COL_NAME="+COL_NAME+"&COL_ORIGIN="+COL_ORIGIN+"&COL_DATATYPE="+COL_DATATYPE+"&COL_DESCRIBE="+COL_DESCRIBE,"top","colIdCopy="+COL_ID);		
	}
	
}

//删除job
function delCollect(collectJobId,collectJobName){
    dhx.confirm("您确定要删除【"+collectJobName+"】配置吗？", function (rs) {
        if (rs) {
            dhx.showProgress("正在执行删除...");
            CollectionAction.deleteJob(collectJobId,function(rs){
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
//启用job
function qyCollect(collectJobId,collectJobName){
    dhx.confirm("您确定要启用【"+collectJobName+"】配置吗？", function (rs) {
        if (rs) {
            dhx.showProgress("正在执行操作...");
            CollectionAction.statusJob(collectJobId,1,function(rs){
                dhx.closeProgress();
                if(rs){
                    dhx.alert("启用成功！");
                    dataTable.refreshData();
                }else{
                    dhx.alert("启用失败！");
                }
            });
        }
    });
}
//禁用job
function jyCollect(collectJobId,collectJobName){
    dhx.confirm("您确定要禁用【"+collectJobName+"】配置吗？", function (rs) {
        if (rs) {
            dhx.showProgress("正在执行操作...");
            CollectionAction.statusJob(collectJobId,0,function(rs){
                dhx.closeProgress();
                if(rs){
                    dhx.alert("禁用成功！");
                    dataTable.refreshData();
                }else{
                    dhx.alert("禁用失败！");
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
    termVals["tasktype"] = 1;
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
	data.tasktype = 1
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
	

    UserAuthorAction.getJobUser(rid,"1",function(userData){
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
	changeData.taskType = 1;
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
