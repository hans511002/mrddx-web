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
	
    var collectJobName = termReq.createTermControl("S_TYPE_NAME","TYPE_NAME");
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
 			add(1,1);
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
            {target:"TYPE_NAME",rule:"NotEmpty,MaxLength[50]"}
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
    	TYPE_ID :"业务类型ID",
        TYPE_NAME:"业务类型名称",
        opt:"操作"
    },"TYPE_ID,TYPE_NAME");
    dataTable.setRowIdForField("TYPE_ID");
    dataTable.setPaging(true,15);//分页
    dataTable.setSorting(true,{
        TYPE_ID:"desc"
    });
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("30,35,35");
    
    dataTable.setGridColumnCfg(0,{align:"center"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
        if(colId=="OPT"){
        	var TYPE_ID = dataTable.getUserData(rid,"TYPE_ID");
        	var TYPE_NAME = dataTable.getUserData(rid,"TYPE_NAME");
        	
            var str = "";
            str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=\"add("+rid+",-1);return false;\">修改</a>";
            str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=\"delType("+TYPE_ID+",'"+TYPE_NAME+"');return false;\">删除</a>";
            str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick=\"userType("+TYPE_ID+",'"+TYPE_NAME+"');return false;\">关联用户</a>";
            return str;
        }
        return data[cid];
    });

    return dataTable;
}

//关联用户
var userTypeWin = null;
var typeid;
function userType(id,name){
	typeid = id;
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
    userTypeWin.setText(name+"-关联用户");
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
    	USER_ID :"用户ID",
        USER_NAMECN:"用户中文名称",
        USER_NAMEEN:"用户英文名称"
    },"FLAG,USER_ID,USER_NAMECN,USER_NAMEEN");
    userTypeTable.setRowIdForField("USER_ID");
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
	data.userIds=checkIds;
	data.typeId=typeid;
    dhx.showProgress("保存数据中");
    UserTypeAction.saveUserType(data,function(ret){
        dhx.closeProgress();
		dhx.alert(ret.MESSAGE);
		
		if(ret.RESULT){
			userTypeWin.close();
		}
    });
}

//删除数据源
function delType(id,name){
	dhx.confirm("是否确认要删除该业务类型？",function(r){
        if(r){
        	dhx.showProgress("请求数据中");
            UserTypeAction.deleteType(id,function(ret){
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
    termVals["_COLUMN_SORT"] = params.sort;
    //termVals.COL_DATATYPE = document.getElementById("COL_DATATYPE").value;
    //termVals.COL_ORIGIN = document.getElementById("COL_ORIGIN").value;
    
    dhx.showProgress("请求数据中");
    UserTypeAction.queryType(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
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
    termVals["TYPE_ID"] = typeid;
    //termVals.COL_DATATYPE = document.getElementById("COL_DATATYPE").value;
    //termVals.COL_ORIGIN = document.getElementById("COL_ORIGIN").value;
    
    dhx.showProgress("请求数据中");
    UserTypeAction.queryUserType(termVals,null,function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        	//查询出数据后，必须显示调用绑定数据的方法
        	userTypeTable.bindData(data,total); 
    });
}



dhx.ready(pageInit);
