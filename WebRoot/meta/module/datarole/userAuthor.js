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


//初始界面
function pageInit() {
	
    var termReq = TermReqFactory.createTermReq(1);
	
    var collectJobName = termReq.createTermControl("S_USER_NAME","USER_NAMECN");
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
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    
    UserTypeAction.queryUser(null,null,function(data){
    	var paramsTD = document.getElementById("user_id");
	    paramsTD.options.length = 0; 
	    paramsTD.options[0] = new Option("--请选择--","");
	    for(var m=0;m<data.length;m++){
	    	paramsTD.options[m+1] = new Option(data[m].USER_NAMECN,data[m].USER_ID);
	    }
    });

	var toolbarData = {
        parent: "toolbarObj",
        icon_path: "../../../meta/resource/images/",
        items: [{
            type: "button",
            id: "add_bt",
            text: "新增",
            img: "addRole.png",
            tooltip: "新增业务类型"
        }]
	};
    toolbar = new dhtmlXToolbarObject(toolbarData);
 	toolbar.attachEvent("onClick", function(id) {
 		if(id=="add_bt"){
 			addUserAction(0,0);
 		}else if(id=="del_bt"){

 		}
	});

}

/**
  *操作数据源管理
  *@param rid 用户ID
  *@param flag 1新增，0查看，-1修改
 **/
var maintainWin = null;
function add(rid,flag){
    var title = "";

    if(flag==1){
        title = "新增业务类型";
        var millTime = new Date().getTime();
        document.getElementById("TYPE_NAME").value = "";
        document.getElementById("TYPE_ID").value = "";

        $("TYPE_NAME").readOnly="";
        document.getElementById("calBtn").style.visibility = "visible";
        document.getElementById("saveBtn").style.visibility = "visible";
        $("saveBtn").value="新增";
        $("calBtn").value="取消";
    }
   if(flag==-1){
        title = "修改业务类型";
        var millTime = new Date().getTime();
        document.getElementById("TYPE_NAME").value = dataTable.getUserData(rid,"TYPE_NAME");
        document.getElementById("TYPE_ID").value = dataTable.getUserData(rid,"TYPE_ID");

        $("TYPE_NAME").readOnly="";
        document.getElementById("calBtn").style.visibility = "visible";
        document.getElementById("saveBtn").style.visibility = "visible";
        $("saveBtn").value="修改";
        $("calBtn").value="取消";
    }
    if(!maintainWin){
        maintainWin = DHTMLXFactory.createWindow("1","maintainWin",0,0,500,150);
        maintainWin.stick();
        maintainWin.denyResize();
        maintainWin.denyPark();
        maintainWin.button("minmax1").hide();
        maintainWin.button("park").hide();
        maintainWin.button("stick").hide();
        maintainWin.button("sticked").hide();
        maintainWin.center();

        var dataFormDIV = document.getElementById("dataFormDIV");
        maintainWin.attachObject(dataFormDIV);
        var saveBtn = document.getElementById("saveBtn");
        var calBtn = document.getElementById("calBtn");
        attachObjEvent(saveBtn,"onclick",saveType);
        attachObjEvent(calBtn,"onclick",function(){maintainWin.close();});

        maintainWin.attachEvent("onClose",function(){
            maintainWin.setModal(false);
            this.hide();
            return false;
        });

        dhtmlxValidation.addValidation(dataFormDIV, [
            {target:"TYPE_NAME",rule:"NotEmpty,MaxLength[64]"}
        ],"true");
    }
    maintainWin.setText(title);
    maintainWin.setModal(true);
    maintainWin.show();
    maintainWin.center();
}

function saveType(){
	if(!(dhtmlxValidation.validate("dataFormDIV")))return;
    var data = Tools.getFormValues("dataForm");
    dhx.showProgress("保存数据中");
    UserTypeAction.insertType(data,function(ret){
        dhx.closeProgress();
        dhx.alert(ret.MESSAGE);
        if(ret.RESULT){
        	dataTable.refreshData();
        	maintainWin.close();
        }
    });
}

//初始数据表格
function dataTableInit(){
    var dd = document.getElementById("dataDiv");
    var pageContent = document.getElementById("pageContent");
    var queryFormDIV = document.getElementById("queryFormDIV");
    dd.style.width = pageContent.offsetWidth  + "px";
    dd.style.height = pageContent.offsetHeight-27-queryFormDIV.offsetHeight + "px";
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
    	USER_ID :"用户ID",
        USER_NAMECN:"用户名称",
        STATE:"用户状态",
        opt:"操作"
    },"USER_ID,USER_NAMECN,STATE,OPT");
    dataTable.setRowIdForField("USER_ID");
    dataTable.setPaging(true,15);//分页
    dataTable.setSorting(true,{
        TYPE_ID:"desc"
	});
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("10,30,30,30");
    dataTable.setGridColumnCfg(0,{align:"center"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
    	if(colId=="STATE"){
    		if(data[cid]=="1"){
    			return "有效";
    		}else{
    			return "无效";
    		}
    	}
        if(colId=="OPT"){
        	var USER_ID = dataTable.getUserData(rid,"USER_ID");
        	var USER_NAMECN = dataTable.getUserData(rid,"USER_NAMECN");
        	
            var str = "";
            str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=\"addUserAction("+rid+",-1);return false;\">修改</a>";
            str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=\"delType("+USER_ID+",'"+USER_NAMECN+"');return false;\">删除</a>";
            str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=\"userToUser("+USER_ID+",'"+USER_NAMECN+"');return false;\">转维护</a>";
            return str;
        }
        return data[cid];
    });
	return dataTable;
}

//新增 修改 权限
var userTypeWin = null;
function addUserAction(rid,flag){
	if(rid!=0){
		document.getElementById("user_id").value=rid;
		document.getElementById("user_id").disabled = "disabled";
	}else{
		document.getElementById("user_id").value="";
		document.getElementById("user_id").disabled = "";
	}
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
        attachObjEvent(saveBtn,"onclick",saveUserType);
        attachObjEvent(calBtn,"onclick",function(){userTypeWin.close();});
		userTypeTableInit();
		userTypeTable.grid.attachEvent("onRowSelect",function(rid,ind){
			userTypeTable.grid.cells(rid,0).setValue(1);
		});
		userTypeTable.setReFreshCall(queryUserTypeData); 
        userTypeWin.attachEvent("onClose",function(){
            userTypeWin.setModal(false);
            this.hide();
            return false;
        });
    }
    if(flag==0){
    	userTypeWin.setText("新增权限");
    }else{
    	userTypeWin.setText("修改权限");
    }
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
    	FLAG:"{#checkBox}",
    	ACTION_ID :"权限ID",
        ACTION_NAME:"权限名称",
        ACTION_MEMO:"备注说明"
    },"FLAG,ACTION_ID,ACTION_NAME,ACTION_MEMO");
    userTypeTable.setRowIdForField("ACTION_ID");
    userTypeTable.setPaging(false);//分页
    
    userTypeTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    userTypeTable.grid.setInitWidthsP("10,30,30,30");
    
    userTypeTable.setGridColumnCfg(0,{align:"center",type:"ch"});
    userTypeTable.setGridColumnCfg(1,{align:"center"});
    userTypeTable.setGridColumnCfg(2,{align:"center"});
    userTypeTable.setGridColumnCfg(3,{align:"center"});
    
    userTypeTable.setFormatCellCall(function(rid,cid,data,colId){
        return data[cid];
    });

    return userTypeTable;
}

function saveUserType(){
	var checkIds = userTypeTable.grid.getCheckedRows(0).split(",");
	var data = {};
 	if(checkIds==""||checkIds.length==0){
 		dhx.alert("请选择一个权限");
		return;
 	}

	data.actionIds=checkIds;
	data.userId=document.getElementById("user_id").value;
    dhx.showProgress("保存数据中");
    UserTypeAction.saveUserAction(data,function(ret){
        dhx.closeProgress();
		dhx.alert(ret.MESSAGE);
		
		if(ret.RESULT){
			dataTable.refreshData();
			userTypeWin.close();
		}
    });
}

//删除数据源
function delType(id,name){
	dhx.confirm("是否确认要删除该用户权限？",function(r){
        if(r){
        	dhx.showProgress("请求数据中");
            UserTypeAction.deleteUserAction(id,function(ret){
            dhx.closeProgress();
                if(ret){
                	dhx.alert("删除成功！");
                    dataTable.refreshData();
                }else{
					dhx.alert("删除失败！");
                }
            });
        }
    });
}


//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals["flag"] = 1;
    termVals["S_USER_NAME"] = document.getElementById("S_USER_NAME").value;
    
    dhx.showProgress("请求数据中");
    UserTypeAction.queryUser(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        	//查询出数据后，必须显示调用绑定数据的方法
        	dataTable.bindData(data,total); 
    });
}

//查询数据
function queryUserTypeData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals["userid"] = document.getElementById("user_id").value;
    dhx.showProgress("请求数据中");
    UserTypeAction.queryActionType(termVals,function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
        	//查询出数据后，必须显示调用绑定数据的方法
        	userTypeTable.bindData(data,total); 
    });
}

//修改创建人
var userToUserWin = null;
function userToUser(rid,username){

	var data = {};
	data.SAME_USER_ID = rid;
	UserTypeAction.queryUser(data,null,function(data){
    	var paramsTD = document.getElementById("to_user_id");
	    paramsTD.options.length = 0; 
	    paramsTD.options[0] = new Option("--请选择--","");
	    for(var m=0;m<data.length;m++){
	    	paramsTD.options[m+1] = new Option(data[m].USER_NAMECN,data[m].USER_ID);
	    }
    });
	document.getElementById("from_user_id").value = rid;
	document.getElementById("from_user_name").value = username;
	document.getElementById("to_user_id").value="";
	
    if(!userToUserWin){
        userToUserWin = DHTMLXFactory.createWindow("1","userToUserWin",0,0,400,200);
        userToUserWin.stick();
        userToUserWin.denyResize();
        userToUserWin.denyPark();
        userToUserWin.button("minmax1").hide();
        userToUserWin.button("park").hide();
        userToUserWin.button("stick").hide();
        userToUserWin.button("sticked").hide();
	    userToUserWin.setText("转维护");
        userToUserWin.center();
        var dataFormDIV = document.getElementById("dataUserToUserDIV");
        userToUserWin.attachObject(dataFormDIV);
        var saveBtn = document.getElementById("saveUserToUserBtn");
        var calBtn  = document.getElementById("calUserToUserBtn");
        attachObjEvent(saveBtn,"onclick",changeUserRole);
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

function changeUserRole(){
	var toUserId = document.getElementById("to_user_id").value;
	var fromUserId = document.getElementById("from_user_id").value;
	if(toUserId==""){
		dhx.alert("请选择新创建人");
		return;
	}
	if(toUserId==fromUserId){
		dhx.alert("相同的创建人");
		return;
	}
	var changeData = {};
	changeData.fromUserId = fromUserId;
	changeData.toUserId = toUserId;
	
    dhx.showProgress("保存数据中");
    UserAuthorAction.changeUserRole(changeData,function(ret){
        dhx.closeProgress();
		dhx.alert(ret.MESSAGE);
		
		if(ret.RESULT){
			dataTable.refreshData();
			userToUserWin.close();
		}
    });
    
}

dhx.ready(pageInit);
