/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        authority.js
 *Description：
 *        查询用户管理
 *Dependent：
 *
 *Author: 王鹏坤
 *
 ********************************************************/

var dataTable = null;   //用户权限信息
var maintainWin = null; //弹出界面

/**
 * 页面初始化
 */
function pageInit(){
    var termReq = TermReqFactory.createTermReq(1);

  //  var dataId = termReq.createTermControl("userId","USER_ID");
  //  dataId.setWidth(240);

    var dataName = termReq.createTermControl("userName","USER_NAME");
    dataName.setWidth(240);
    dataName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });

    var dataStatus = termReq.createTermControl("state","STATE");
    dataStatus.setListRule(0,[["","全部"],[0,"启用"],[1,"禁用"]],0);
    dataStatus.setWidth(120);
    dataStatus.enableReadonly(true);

    dataTableInit();
    dataTable.setPaging(true, 20);//分页
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("25,25,25,25");
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
        showAuthority(0,0);
    });
}


//初始数据表格
function dataTableInit(){
    dataTable = new meta.ui.DataTable("container");
    dataTable.setColumns({
        USER_NAME : "用户名称",
        USER_PASS: "用户密码",
        USER_STATE: "用户状态",
        OPP: "操作"
    },"USER_NAME,USER_PASS,USER_STATE,OPP");

    dataTable.setFormatCellCall(function(rid, cid, data, colId){

        if(colId == "OPP"){
            return "<a href='javascript:void(0)' onclick='showAuthority(\""+rid+"\",1);return false;'>修改</a>&nbsp;&nbsp;&nbsp;&nbsp;"
           // + "<a href='javascript:void(0)' onclick='showRuleWin(\""+rid+"\");return false;'>查看规则列表</a>&nbsp;&nbsp;&nbsp;&nbsp;"
            + "<a href='javascript:void(0)' onclick='deleteUser(\""+rid+"\");return false;'>删除</a>&nbsp;&nbsp;&nbsp;&nbsp;";
        }else if(colId == "USER_PASS"){
            return "*********" ;
        }else if(colId == "USER_STATE"){
            return data[cid]==0?"启用":"禁用" ;
        }
        return data[cid];
    });
    return dataTable;
}

//查询数据
function queryData(dt,params){
    var termVals=TermReqFactory.getTermReq(1).getKeyValue();
    termVals["_COLUMN_SORT"] = params.sort;
    dhx.showProgress("请求数据中");
    AuthorityAction.queryAuthrityInfo(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

/**
 * 取得radio的值
 * @param RadioName
 */
function getRadioValue(RadioName){
    var obj;
    obj=document.getElementsByName(RadioName);
    if(obj!=null){
        var i;
        for(i=0;i<obj.length;i++){
            if(obj[i].checked){
                return obj[i].value;
            }
        }
    }
    return null;
}

/**
 * 给radio赋值
 * @param RadioName
 * @param value
 */
function setRadioValue(RadioName,value){
    var obj;
    obj=document.getElementsByName(RadioName);
    if(obj!=null){
        var i;
        for(i=0;i<obj.length;i++){
            if(obj[i].value==value){
                return obj[i].checked=true;
                break;
            }
        }
    }
    return null;
}


/**
 *操作数据源管理
 *@param rid 用户ID
 *@param flag 0新增，1修改
 **/
function showAuthority(rid,flag){
    var title = "";
    var userId =  dataTable.getUserData(rid,"USER_ID");
    var userName =  dataTable.getUserData(rid,"USER_NAME");
    var userState =  dataTable.getUserData(rid,"USER_STATE");
    if(flag==0){
        title = "新增用户";
        document.getElementById("user_id").value = "";
        document.getElementById("user_name").value = "";
        document.getElementById("user_password").value = "";
        document.getElementById("confirm_password").value = "";
        $("user_name").readOnly="";
        //document.getElementById("user_state").value = "0";
        setRadioValue("user_state","0");
        document.getElementById("modify_password").style.display = "none";
        document.getElementById("add_password").style.display = "";
        document.getElementById("fontSize").style.display = "none";
         dhtmlxValidation.addValidation(authorityFormDIV, [
            {target:"user_name",rule:"NotEmpty,MaxLength[64]"},
            {target:"user_password",rule:"NotEmpty,MinLength[6],MaxLength[16]"},
            {target:"confirm_password",rule:"NotEmpty,MinLength[6],MaxLength[16]"}
        ],"true");
    }else if(flag==1){
        title = "修改用户";
        if(userId){
            document.getElementById("user_id").value = userId;
            document.getElementById("user_name").value = userName;
            document.getElementById("user_password").value = "";
            document.getElementById("confirm_password").value = "";
          // document.getElementById("user_state").value = userState;
          // $("user_name").readOnly="readOnly";
            setRadioValue("user_state",userState);
            document.getElementById("modify_password").style.display = "";
            document.getElementById("fontSize").style.display = "block";
            document.getElementById("add_password").style.display = "none";
             dhtmlxValidation.addValidation(authorityFormDIV, [
            {target:"user_name",rule:"NotEmpty,MaxLength[64]"},
            {target:"user_password",rule:"MinLength[6],MaxLength[16]"},
            {target:"confirm_password",rule:"MinLength[6],MaxLength[16]"}
        ],"true");
        }
    }
    if(!maintainWin){
        maintainWin = DHTMLXFactory.createWindow("1","maintainWin",0,0,400,250);
        maintainWin.stick();
        maintainWin.denyResize();
        maintainWin.denyPark();
        maintainWin.button("minmax1").hide();
        maintainWin.button("park").hide();
        maintainWin.button("stick").hide();
        maintainWin.button("sticked").hide();
        maintainWin.center();

        var groupFormDIV = document.getElementById("authorityFormDIV");
        maintainWin.attachObject(authorityFormDIV);
        var saveBtn = document.getElementById("saveBtn");
        var calBtn = document.getElementById("calBtn");
        attachObjEvent(saveBtn,"onclick",saveAuthorityInfo);
        attachObjEvent(calBtn,"onclick",function(){maintainWin.close();});


        maintainWin.attachEvent("onClose",function(){
            maintainWin.setModal(false);
            this.hide();
            return false;
        });

       
    }
    maintainWin.setText(title);
    maintainWin.setModal(true);
    maintainWin.show();
    maintainWin.center();
}

function saveAuthorityInfo(){

    if(!(dhtmlxValidation.validate("authorityFormDIV")))return;
    var data = Tools.getFormValues("authorityForm");
    if(data.user_password!=data.confirm_password){
        dhx.alert("两次密码输入不一致，请重新输入！");
        $("confirm_password").value="";
        $("user_password").value="";
        $("user_password").focus();
        return;
    }
    var user_state = getRadioValue("user_state");
    data.user_state = user_state;
    dhx.showProgress("保存数据中");
    AuthorityAction.saveAuthorityInfo(data,function(ret){
        dhx.closeProgress();
        if(ret=="success"){
            dhx.alert("保存成功!");
	        maintainWin.close();
	        dataTable.refreshData();
        }else if(ret=="rename"){
            dhx.alert("用户名已存在!");
        }else if(ret=="failed"){
            dhx.alert("保存出错!");
        }
    });
}

function deleteUser(rid){
    var id = dataTable.getUserData(rid,"USER_ID");
	AuthorityAction.checkRuleByUserId(id,function(rs){
	if(rs==0){
    	dhx.confirm("是否确认要删除该条用户？",function(r){
      	  if(r){
      	      AuthorityAction.deleteAuthority(id,function(ret){
      	          if(ret.flag=="false"){
                    alert("该条用户信息不存在,删除失败！");
                }else if(ret.flag=="true"){
                	alert("删除成功！");
                    dataTable.refreshData();
                }else if(ret.flag=="error"){
                    alert("删除报错！");
                }
            });

        }
    });
    }else{
    	dhx.alert("该条用户信息已关联查询规则，不能删除！");
    }
    });
}
/**
 * 弹出查看规则列表
 * @param optFlag
 * @param instId
 */
var ruleWindow = null;
var userRuleId = null;
function showRuleWin(rid){
    var mode = 1;
    userRuleId = dataTable.getUserData(rid,"USER_ID");
    if(!ruleWindow){
        ruleWindow = DHTMLXFactory.createWindow("selectWindow2","ruleWindow", 0, 0, 400, 3000);
        ruleWindow.stick();
        ruleWindow.setModal(true);
        ruleWindow.setDimension(700);
        ruleWindow.button("minmax1").hide();
        ruleWindow.button("park").hide();
        ruleWindow.button("stick").hide();
        ruleWindow.button("sticked").hide();
        ruleWindow.center();
        ruleWindow.denyResize();
        ruleWindow.denyPark();
        ruleWindow.setText("查询列表");
        ruleWindow.keepInViewport(true);

        var layout = new dhtmlXLayoutObject(ruleWindow, "2E");
        layout.cells("b").setHeight(50);
        layout.cells("a").fixSize(true, true);
        layout.cells("a").hideHeader();
        layout.cells("a").attachObject($('ruleContentTop'));
        layout.cells("b").fixSize(false, true);
        layout.cells("b").hideHeader();
        layout.cells("b").attachObject($('ruleContentDown'));

        dataRuleTableInit(); //初始数据表格  初始之后dataTable才会被实例化
        ruleTable.setReFreshCall(queryRuleData); //设置表格刷新的回调方法，即实际查询数据的方法
        ruleTable.refreshData();

        //重置关闭窗口事件
        ruleWindow.attachEvent("onClose",function(){
            ruleWindow.setModal(false);
            this.hide();
            return false;
        });
        var calBtn1 = document.getElementById("calBtn1");
        attachObjEvent(calBtn1,"onclick",function(){ruleWindow.close();});


        $('ruleTable').onclick = function() {
            var ruleId = $('ruleId').value;
            var ruleName =  $('ruleName').value;
            var queryData = {};
            queryData.ruleId = ruleId;
            queryData.ruleName = ruleName;
            queryData.userId = userRuleId;
            AuthorityAction.queryRules(queryData,null,function(data){
                dhx.closeProgress();
                var total = 0;
                if(data && data[0])
                    total = data[0]["TOTAL_COUNT_"];
                ruleTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
            });
        }
    }else {
        ruleWindow.show();
        ruleWindow.setModal(true);
        $('ruleId').value='';
        $('ruleName').value='';
        ruleTable.refreshData();
    }
}


var ruleTable = null;
function dataRuleTableInit(){
        ruleTable= new meta.ui.DataTable("tableRuleContent");//第二个参数表示是否是表格树
        ruleTable.setColumns({
            QRY_RULE_ID:"查询规则ID",
            QYR_RULE_NAME:"查询规则名称"
        },"QRY_RULE_ID,QYR_RULE_NAME");
        ruleTable.setRowIdForField("QRY_RULE_ID");
        ruleTable.setPaging(true,20);//分页
        ruleTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
        ruleTable.grid.setInitWidthsP("50,50");
        ruleTable.setGridColumnCfg(0,{align:"center"});
        ruleTable.setGridColumnCfg(1,{align:"center"});

        ruleTable.setFormatCellCall(function(rid,cid,data,colId){
            return data[cid];
        });
        return ruleTable;

    }

    function queryRuleData(dt,params){
        var ruleId = $('ruleId').value;
        var ruleName =  $('ruleName').value;
        var queryData = {};
        queryData.ruleId = ruleId;
        queryData.ruleName = ruleName;
        queryData.userId = userRuleId;

        AuthorityAction.queryRules(queryData,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
            dhx.closeProgress();
            var total = 0;
            if(data && data[0])
                total = data[0]["TOTAL_COUNT_"];
            ruleTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
        });
    }




dhx.ready(pageInit);