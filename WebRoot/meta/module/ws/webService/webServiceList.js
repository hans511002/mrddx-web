/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        webServiceList.js
 *Description：
 *
 *Dependent：
 *
 *Author:
 *        刘弟伟
 ********************************************************/
var dataTable = null;//表格
var ruleManagerWin = null;
var ruleManagerViewWin = null;
var authWin = null;
var testWin = null;
var ruleId = 0;
var ruleCode = "";
var shareUserId =0;
var paramsName = null;
//初始界面
function pageInit() {
    var termReq = TermReqFactory.createTermReq(1);
    var kwd = termReq.createTermControl("kwd","KEY_WORD");
    kwd.setWidth(380);
    kwd.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    var ruleStateTerm = termReq.createTermControl("ruleState","RULE_STATE");
    ruleStateTerm.setListRule(0,[["","全部"],[1,"有效"],[0,"禁用"]],"");
    ruleStateTerm.enableReadonly(true);

    dataTableInit(); //初始数据表格  初始之后dataTable才会被实例化
    dataTable.setReFreshCall(queryData); //设置表格刷新的回调方法，即实际查询数据的方法

    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    var newSQLBtn = document.getElementById("newSQLBtn");
    var newJARBtn = document.getElementById("newJARBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    attachObjEvent(newSQLBtn,"onclick",function(){
        openRuleManagerWin("",0,0);
    });
    attachObjEvent(newJARBtn,"onclick",function(){
        openRuleManagerWin("",1,0);
    });
}

//初始数据表格
function dataTableInit(){
    var dd = document.getElementById("dataDiv");
    var pageContent = document.getElementById("pageContent");
    var queryFormDIV = document.getElementById("queryFormDIV");
    queryFormDIV.style.width = pageContent.offsetWidth -10  + "px";
    dd.style.width = pageContent.offsetWidth  + "px";
    dd.style.height = pageContent.offsetHeight-queryFormDIV.offsetHeight - 5 + "px";
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
        RULE_NAME:"服务名",
        RULE_CODE:"服务编码",
        RULE_STATE:"状态",
        RULE_TYPE:"操作类型",
        RULE_IMPL_TYPE:"实现方式",
        CREATE_USER:"创建人",
        CREATE_DATE:"创建时间",
        REMARK:"备注",
        opt:"操作"
    },"RULE_NAME,RULE_CODE,RULE_STATE,RULE_TYPE,RULE_IMPL_TYPE,USER_NAMECN,CREATE_DATE,REMARK,RULE_ID");
    dataTable.setRowIdForField("RULE_ID");
    dataTable.setPaging(true,20);//分页
    dataTable.setSorting(false,{
        RULE_NAME:"asc",
        RULE_CODE:"asc"
    });
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("10,10,8,8,8,8,15,21,12");
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    dataTable.setGridColumnCfg(5,{align:"center"});


    dataTable.setFormatCellCall(function(rid,cid,data,colId){
        if(colId=="OPT"){
            var ruleId = dataTable.getUserData(rid,"RULE_ID");
            var state = dataTable.getUserData(rid,"RULE_STATE");
            var implType = dataTable.getUserData(rid,"RULE_IMPL_TYPE");
            var ruleCode = dataTable.getUserData(rid,"RULE_CODE");
            var str = "";

            if(implType == 0){
                str += "<a href='javascript:void(0)' onclick='openRuleView("+ruleId+",0);return false;'>查看</a>";
                if(state==0){
                    str += "&nbsp;&nbsp;<a href='javascript:void(0)' onclick='openRuleManagerWin("+ruleId+",0,1);return false;'>修改</a>";
                }

            }else if(implType == 1){
                str += "<a href='javascript:void(0)' onclick='openRuleView("+ruleId+",1);return false;'>查看</a>";
                if(state==0){
                    str += "&nbsp;&nbsp;<a href='javascript:void(0)' onclick='openRuleManagerWin("+ruleId+",1,1);return false;'>修改</a>";
                }
            }
            if(state==1){     //启用状态
                str += "&nbsp;&nbsp;<a href='javascript:void(0)' onclick='setRule("+ruleId+",0);return false;'>禁用</a>";
                str += "&nbsp;&nbsp;<a href='javascript:void(0)' onclick='authority("+ruleId+");return false;'>授权</a>";
            }else{
                str += "&nbsp;&nbsp;<a href='javascript:void(0)' onclick='setRule("+ruleId+",1);return false;'>启用</a>";
                str += "&nbsp;&nbsp;<a href='javascript:void(0)' onclick='deleteRule("+ruleId+");return false;'>删除</a>";
            }
            if(state==1){
                str += "&nbsp;&nbsp;<a href='javascript:void(0)' onclick='testRule("+ruleId+",\""+ruleCode+"\");return false;'>测试</a>";
            }

            return str;
        }else if(colId=="RULE_STATE"){
            var state = dataTable.getUserData(rid,"RULE_STATE");
            return state==1?"有效":"禁用";
        }else if(colId == "RULE_TYPE"){
            var ruleType = dataTable.getUserData(rid,"RULE_TYPE");
            if(ruleType == 0){
                return "查询";
            }else if(ruleType == 1){
                return "更新";
            }else{
                return "其它";
            }
        }else if(colId == "RULE_IMPL_TYPE"){
            var ruleImplType = dataTable.getUserData(rid,"RULE_IMPL_TYPE");
            return  ruleImplType == 0?"SQL":"JAR";
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
    MetaShareWsAction.queryRule(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

//打开服务规则管理界面   type:0 sql 1:jqr   flag:0 新增 1：修改
function openRuleManagerWin(ruleId,type,flag){
    if(!ruleManagerWin){
        ruleManagerWin = new ruleWin();
        ruleManagerWin.show(ruleId,type,flag,0);
    }else{
        ruleManagerWin.show(ruleId,type,flag,1);
    }

}

//打开服务规则管理查看界面   type:0 sql 1:jqr
function openRuleView(ruleId,type){
    if(!ruleManagerViewWin){
        ruleManagerViewWin = new ruleWin_View();
    }
    ruleManagerViewWin.show(ruleId,type);
}

//设置规则为禁用或启用状态
function setRule(ruleId,flag){
    var ruleName = dataTable.getUserData(ruleId,"RULE_NAME");
    var ruleCode = dataTable.getUserData(ruleId,"RULE_CODE");
    dhx.confirm("你确定【"+(flag?"启用":"禁用")+"】规则["+ruleName+"]吗?",function(r){
        if(r){
            dhx.showProgress("提交请求中!");
            MetaShareWsAction.disableRule(ruleId,ruleCode,flag?1:0,function(rs){
                dhx.closeProgress();
                if(rs["flag"] == 'success'){
                    alert("操作成功!");
                    dataTable.refreshData();
                }else{
                    alert("操作失败!"+rs["msg"]);
                }
            });
        }
    });
}

//删除规则
function deleteRule(ruleId){
    var ruleName = dataTable.getUserData(ruleId,"RULE_NAME");
    var ruleImplType = dataTable.getUserData(ruleId,"RULE_IMPL_TYPE");
    MetaShareWsAction.isExistLog(ruleId,function(data){
        if(data){
           dhx.alert("服务规则["+ruleName+"]已存在访日志，不能删除！");
            return;
        }else{
            var cfm = "你确定将服务规则["+ruleName+"]删除吗?";
            dhx.confirm(cfm,function(r){
                if(r){
                    dhx.showProgress("提交数据中");
                    MetaShareWsAction.deleteRule(ruleId,ruleImplType,function(rs){
                        dhx.closeProgress();
                        if(rs["flag"] == 'success'){
                            alert("执行删除操作成功!");
                            dataTable.refreshData();
                        }else{
                            alert("执行删除操作出错!");
                        }
                    });
                }
            });
        }
    });

}

//规则授权
var leftAuthTable = null;
var rightAuthTable = null;
function authority(rule_Id){
    ruleId = rule_Id;
    authWin=DHTMLXFactory.createWindow("1","authWin",0,0,660,430);
    authWin.setModal(true);
    authWin.stick();
    authWin.center();
    authWin.denyResize();
    authWin.denyPark();
    authWin.setText("服务授权");

    authWin.keepInViewport(true);
    //关闭一些不用的按钮。
    authWin.button("minmax1").hide();
    authWin.button("park").hide();
    authWin.button("stick").hide();
    authWin.button("sticked").hide();
    authWin.show();
    authWin.attachObject($("ruleAuthDIV"));
    authWin.attachEvent("onClose",function(){
        closeAuthWin();
    });

    initLeftAuth();
    leftAuthTable.setReFreshCall(queryLeftAuthData); //设置表格刷新的回调方法，即实际查询数据的方法
    leftAuthTable.refreshData();

    initRightAuth();
    rightAuthTable.setReFreshCall(queryRightAuthData); //设置表格刷新的回调方法，即实际查询数据的方法
    rightAuthTable.refreshData();

    var _rightMove = document.getElementById("_rightMove");
    var _allRightMove = document.getElementById("_allRightMove");
    var _leftMove = document.getElementById("_leftMove");
    var _allLeftMove = document.getElementById("_allLeftMove");
    var saveBtn = document.getElementById("saveBtn");
    var calBtn = document.getElementById("calBtn");

    _rightMove.onclick = function(){
        moveRight(false);
    }
    _allRightMove.onclick = function(){
        moveRight(true);
    }
    _leftMove.onclick = function(){
        moveLeft(false);
    }
    _allLeftMove.onclick = function(){
        moveLeft(true);
    }
    saveBtn.onclick = function(){
        save(ruleId);
    }
    calBtn.onclick = function(){
        closeAuthWin();
    }
}

function initLeftAuth(){
    leftAuthTable = new meta.ui.DataTable("leftDIV");
    leftAuthTable.setColumns({
        CHECK_BOX:"{#checkBox}",
        RULE_CODE:"用户名"
    },"SHARE_USER_ID,SHARE_USER_NAME");
    leftAuthTable.setRowIdForField("SHARE_USER_ID");
    leftAuthTable.setPaging(false);//分页
    leftAuthTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    leftAuthTable.setGridColumnCfg(0,{type:"ch",align:"center"});
    leftAuthTable.grid.setInitWidthsP("20,80");
    leftAuthTable.setGridColumnCfg(0,{align:'center'});		//设置第一列复选款位置居中
    //为两个表格添加鼠标双击事件,双击时进行选择或者是取消选择。
    leftAuthTable.grid.attachEvent("onRowDblClicked",function(rowId,cInd){
        if(!rightAdd[rowId]){//右边没有，进行选择
            var rowData=leftAuthTable.getUserData(rowId,"SHARE_USER_NAME");
            if(move(leftAuthTable,rightAuthTable,{rows:[{id:rowId,data:[0,rowData]}]},leftAdd,rightAdd,rowId)){
                leftAuthTable.grid.deleteRow(rowId);
            }
        }else{//左边已选择，进行取消选择
            var rowData=rightAuthTable.getUserData(rowId,"SHARE_USER_NAME");
            if(move(rightAuthTable,leftAuthTable,
                {rows:[{id:rowId,data:[0,rowData]}]},rightAdd,leftAdd,rowId)){
                rightAuthTable.grid.deleteRow(rowId);
            }
        }
    });

}
function initRightAuth(){
    rightAuthTable = new meta.ui.DataTable("rightDIV");
    rightAuthTable.setColumns({
        CHECK_BOX:"{#checkBox}",
        RULE_CODE:"用户名"
    },"SHARE_USER_ID,SHARE_USER_NAME");
    rightAuthTable.setRowIdForField("SHARE_USER_ID");
    rightAuthTable.setPaging(false);//分页
    rightAuthTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    rightAuthTable.setGridColumnCfg(0,{type:"ch",align:"center"});
    rightAuthTable.grid.setInitWidthsP("20,80");
    rightAuthTable.setGridColumnCfg(0,{align:'center'});		//设置第一列复选款位置居中
    rightAuthTable.grid.attachEvent("onRowDblClicked",function(rowId,cInd){
        if(!leftAdd[rowId]){//左边没有，移动至左边
            var rowData=rightAuthTable.getUserData(rowId,"SHARE_USER_NAME");
            if(move(rightAuthTable,leftAuthTable,
                {rows:[{id:rowId,data:[0,rowData]}]},rightAdd,leftAdd,rowId)){
                rightAuthTable.grid.deleteRow(rowId);
            }
        }else{
            var rowData=leftAuthTable.getUserData(rowId,"SHARE_USER_NAME");
            if(move(leftAuthTable,rightAuthTable,{rows:[{id:rowId,data:[0,rowData]}]},leftAdd,rightAdd,rowId)){
                leftAuthTable.grid.deleteRow(rowId);
            }
        }

    });
}

var leftAdd={},rightAdd={}; //分别表示左边grid新增的数据，右边表格新增的数据。

/**
 * 将选择的角色移动至右边。
 * @param flag  当其为true时，表示将查询出的角色当前页全部右移。当为true时，表示只移动选择的数据。
 */
function moveRight(flag){
    var del=[];
    if(flag){
        for(var i in leftAuthTable.grid.rowsBuffer){
            if(!leftAuthTable.grid.rowsBuffer[i]||typeof leftAuthTable.grid.rowsBuffer[i]=="function"){
                continue;
            };
            var rowId=leftAuthTable.grid.getRowId(i);
            var rowData=leftAuthTable.getUserData(rowId,"SHARE_USER_NAME");
            if(move(leftAuthTable,rightAuthTable,{rows:[{id:rowId,data:[0,rowData]}]},leftAdd,rightAdd,rowId)){
                del.push(rowId);
            }
        }
    }else{
        var ids=leftAuthTable.grid.getCheckedRows(0);
        if(ids){
            ids=ids.split(",");
            for(var i=0;i<ids.length;i++){
                var rowData=leftAuthTable.getUserData(ids[i],"SHARE_USER_NAME");
                if(move(leftAuthTable,rightAuthTable,{rows:[{id:ids[i],data:[0,rowData]}]},leftAdd,rightAdd,ids[i])){
                    del.push(ids[i]);
                }
            }
        }
    }
    //最后删除需要删除的行
    for(var key=0;key<del.length;key++){
        leftAuthTable.grid.deleteRow(del[key]);
    }
}
/**
 * 取消选择的角色。
 * @param flag 当其为true时，表示将查询出的角色当前页全部右移。当为true时，表示只移动选择的数据。
 */
function moveLeft(flag){
    var del=[];
    if(flag){
        for(var i in rightAuthTable.grid.rowsBuffer){
            if(!rightAuthTable.grid.rowsBuffer[i]||typeof rightAuthTable.grid.rowsBuffer[i]=="function"){
                continue;
            }
            var rowId=rightAuthTable.grid.getRowId(i);
            var rowData=rightAuthTable.getUserData(rowId,"SHARE_USER_NAME");
            if(move(rightAuthTable,leftAuthTable,
                {rows:[{id:rowId,data:[0,rowData]}]},rightAdd,leftAdd,rowId)){
                del.push(rowId);
            }
        }
    }else{
        var ids=rightAuthTable.grid.getCheckedRows(0);
        if(ids){
            ids=ids.split(",");
            for(var i=0;i<ids.length;i++){
                var rowData=rightAuthTable.getUserData(ids[i],"SHARE_USER_NAME");
                if(move(rightAuthTable,leftAuthTable,
                    {rows:[{id:ids[i],data:[0,rowData]}]},rightAdd,leftAdd,ids[i])){
                    del.push(ids[i]);
                }
            }
        }
    }
    //最后删除需要删除的行
    for(var key=0;key<del.length;key++){
        rightAuthTable.grid.deleteRow(del[key]);
    }
}

/**
 * 具体移动数据的动作。
 * @param moveObj 要移动的grid Object
 * @param moveToObj 移动到的grid Object
 * @param moveData  移动的grid data 也即要新增的数据
 * @param moveAdd  移动Grid新增的数据变量
 * @param moveToAdd 移动至对象Grid的新增数据
 * @param id 此次移动数据的键值
 * @return boolean: 返回true表示被移动对象需要删除一行，返回false表示被移动对象不需要删除此行。
 */
function move(moveObj,moveToObj,moveData,moveAdd,moveToAdd,id){
    if(!moveToObj.grid.doesRowExist(id)){
        //移动至对象新增一行。
        moveToObj.grid.updateGrid(moveData,"insert");
        //设置样式标记为新增。
        moveToObj.grid.setRowTextStyle(id,styles.inserted);
        //记录删除变量。
        moveToAdd[id]=moveData;
    }else{ //如果移动过去的对象存在且不是新增的，切换为正常样式
        if(!moveToAdd[id]){
            moveToObj.grid.setRowTextStyle(id,styles.clear);
        }
    }
    var isDel=false;
    if(moveAdd[id]){//如果有数据，需要删除此行。
        isDel=true;
    }else{
        //改变要移动对象的样式,标记已被删除。
        moveObj.grid.setRowTextStyle(id,styles.deleted);
    }
    //删除新增变量
    moveAdd[id]=null;
    delete moveAdd[id];
    return isDel;
}
/**
 * 标记删除、新增、改变的样式集合
 */
var styles={
    inserted:"font-weight:bold;color:#64B201;",
    deleted:"text-decoration : line-through;font-style: italic;color: #808080;",
    change_cell:"border-bottom:2px solid red;",
    clear:"font-weight:normal;font-style::normal;text-decoration:none;color:black;"
};



//做数据保存操作。
function save(ruleId){
    /*页面选择数据，其数据结构为：{
     {
     add:[{SHARE_USER_ID:,ruleId:},{}...],
     del:{SHARE_USER_ID:"213,232,123,213,...",ruleId:}
     }
     */
    var data={};//最终要传送给后台的数据结构。
    data["ruleId"] = ruleId;
    if(!Tools.isEmptyObject(rightAdd)){
        //右边新增的数据即为要关联的数据。
        data.add=[];
        for(var key in rightAdd){
            data.add.push({shareUserId:key,ruleId:ruleId});
        }
    }
    if(!Tools.isEmptyObject(leftAdd)){
        //左边新增的数据即为取消的关联。
        data.del={};
        for(var key in leftAdd){
            data.del.ruleId=ruleId;
            data.del.shareUserId=(data.del.shareUserId||"")+key+",";
        }
        //去除最后一个"，"
        data.del.shareUserId= data.del.shareUserId.substr(0,data.del.shareUserId.length-1);
    }

    //执行DWR
    MetaShareWsAction.refRule(data,function(rs){
        if(rs){
            dhx.alert("授权操作成功！");
            closeAuthWin();
        }else{
            dhx.alert("授权操作失败，请重试");
        }
    });
}
//查询待选用户
function queryLeftAuthData(dt,params){
    dhx.showProgress("请求数据中");
    MetaShareWsAction.queryLeftAuthData(ruleId,function(data){
        dhx.closeProgress();
        var total = 0;
        leftAuthTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

//查询已选用户
function queryRightAuthData(dt,params){
    dhx.showProgress("请求数据中");
    MetaShareWsAction.queryRightAuthData(ruleId,function(data){
        dhx.closeProgress();
        var total = 0;
        rightAuthTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

//隐藏窗口
function closeAuthWin(){
    authWin.setModal(false);
    authWin.hide();
//    //清空数据
    leftAdd={};
    rightAdd={};
    $("rightDIV").innerHTML="";
    $("leftDIV").innerHTML="";
    return false;
}

function testRule(rule_Id,rule_Code){
    ruleId = rule_Id;
    ruleCode = rule_Code;
    testWin=DHTMLXFactory.createWindow("testWins","testWin",0,0,660,430);
    testWin.setModal(true);
    testWin.stick();
    testWin.center();
    testWin.denyResize();
    testWin.denyPark();
    testWin.setText("测试WebService服务");
    testWin.keepInViewport(true);
    //关闭一些不用的按钮。
    testWin.button("minmax1").hide();
    testWin.button("park").hide();
    testWin.button("stick").hide();
    testWin.button("sticked").hide();
    testWin.show();
    testWin.attachObject($("testRuleDiv"));
    testWin.attachEvent("onClose",function(){
        testWin.setModal(false);
        testWin.hide();
        return false;
    });
    initParamPage(ruleId);
    var testBtn = document.getElementById("testBtn");
    testBtn.onclick = function(){
        testWsClient(ruleId,ruleCode);
    }
}


//测试界面初始化
function initParamPage(ruleId){
    paramsName = new Array(); //参数名
    $("message").value = "";
    MetaShareWsAction.getRuleInfo(ruleId,function(data){
        if(data){
            dataTypes = getCodeByType("WS_RULE_DATA_TYPE");		//初始化维度计算方式
            var paramList = data["paramList"];
            if(paramList.length>0){
                createParamGrid_Test(paramList);
            }
        }
    });
}

function testWsClient(ruleId,ruleCode){
    $("message").value = "";
    var ruleParams = {};
    if(paramsName.length>0){
        for(var j = 0; j< paramsName.length; j++){
            if($("isRequire_"+paramsName[j]).value == 1){
                if($("defaultValue_"+paramsName[j]).value == ""){
                    alert("参数【"+$("paramName_"+paramsName[j]).value+"】为必须项，参数默认值不能为空！");
                    return;
                }
            }
            ruleParams[$("paramName_"+paramsName[j]).value] = $("defaultValue_"+paramsName[j]).value;
        }
    }
    dhx.showProgress("正在测试中...");
    TestWsClient.clientTest(ruleId,rootPath,ruleCode,ruleParams,function(rs){
        dhx.closeProgress();
        if(rs && rs.length>0){
            $("message").value = (rs[0]["DEBUG_MSG"]|| "").replace(/\n/g,"<br>");
        }
    });
}

//sql修改时创建参数界面
function createParamGrid_Test(params){
    var testParamInfoDiv = $("testParamInfoDiv");
    testParamInfoDiv.innerHTML = "";
    var paramTable_Test = document.createElement("TABLE");
    paramTable_Test.className = "c_table";
    paramTable_Test.setAttribute("cellspacing",0);
    paramTable_Test.setAttribute("cellpadding",0);
    paramTable_Test.border = 0;
    testParamInfoDiv.appendChild(paramTable_Test);
    if(params.length>0){
        for(var i = 0; i < params.length; i++){
            paramsName.push(params[i]["PARAM_NAME"]);
            var tr_i = paramTable_Test.insertRow(-1);
            var td1_i = tr_i.insertCell(-1);
            td1_i.className="c_br_td";
            if(i%2 != 0){
                td1_i.className="c_tb_bg c_br_td";
            }
            var td2_i = tr_i.insertCell(-1)
            td2_i.className = "c_b_td";
            td1_i.innerHTML =params[i]["PARAM_NAME"]+"<input type='hidden'  id='paramName_"+params[i]["PARAM_NAME"]+"' readOnly='readOnly'  value='"+params[i]["PARAM_NAME"]+"'  />";
            var defaultValue = params[i]["DEFAULT_VALUE"] == null?"": params[i]["DEFAULT_VALUE"];
            td2_i.innerHTML = "<input type='text' id='defaultValue_"+params[i]["PARAM_NAME"]+"'  value='"+defaultValue+"' />"+
                "<input type='hidden' id='isRequire_"+params[i]["PARAM_NAME"]+"'  value='"+params[i]["IS_REQUIRE"]+"' />";
            if(params[i]["IS_REQUIRE"] == 1){
                td2_i.innerHTML += "<font style='color:red;font-weight:normal;'>*</font>参数【"+params[i]["PARAM_NAME"]+"】默认值为必填项";
            }

        }
    }
}


dhx.ready(pageInit);