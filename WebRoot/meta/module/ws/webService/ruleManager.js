/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        ruleManager.js
 *Description：
 *       服务规则添加修改js
 *Dependent：
 *
 *Author:
 *        刘弟伟
 ********************************************************/
var rule_Id = 0;
var dataTypes = null;   //数据类型
var ruleTypes = null; //服务操作类型
var paramNames = null; //参数名
var paramNamesOld = null;
var paramNames_rowIndex = null;
var type = 0;  //0:SQL  1:JAR
var flag =0;  //0:新增  1：修改
var winTwo;		//弹出参数解释窗体
var tabBarNum;  //控制TAB
var ruleCode = "";
var className = "";
var update_flag;
/**
 * 指标权限类
 */
var ruleWin = function(){
    this.win = null; //窗体
    this.tab = null;
    this.renderWin();
};
//生成弹出窗口
ruleWin.prototype.renderWin = function(){
    this.win = DHTMLXFactory.createWindow("ruleWins","ruleWin", 0, 0, 756, 360);
    this.win.ruleWin = this;
    this.win.stick();
    this.win.denyResize();
    this.win.denyPark();
    this.win.button("minmax1").hide();
    this.win.button("park").hide();
    this.win.button("stick").hide();
    this.win.button("sticked").hide();
    this.win.center();
    this.win.setText("WebService服务");
    this.win.keepInViewport(true);
    this.win.attachObject("_ruleWidDIV");
    this.win.setModal(false);
    this.win.attachEvent("onClose",function(){
        this.setModal(false);
        this.hide();
        return false;
    });
    //加入TAB
    this.tab = new dhtmlXTabBar("ruleTabDIV", "top");
    this.tab.addTab("a1", "SQL", "100px");
    this.tab.addTab("a2", "Class", "100px");
    this.tab.addTab("a3", "参数", "100px");
    this.tab.addTab("a4", "基本信息", "100px");
    var saveBtn = document.getElementById("_SaveBtn");
    var calBtn = document.getElementById("_CalBtn");
    var nextBtn = document.getElementById("nextBtn");
    saveBtn.ruleWin = this;
    calBtn.ruleWin = this;
    nextBtn.ruleWin = this;
    attachObjEvent(saveBtn,"onclick",function(e){
        e = e || window.event;
        if(e.srcElement && e.srcElement.ruleWin){
            e.srcElement.ruleWin.saveRule();
        }
    });
    attachObjEvent(calBtn,"onclick",function(e){
        e = e || window.event;
        if(e.srcElement && e.srcElement.ruleWin){
            e.srcElement.ruleWin.showHide(0);
        }
    });
    attachObjEvent(nextBtn,"onclick",function(e){
        e = e || window.event;
        if(e.srcElement && e.srcElement.ruleWin){
            e.srcElement.ruleWin.showTabar();
        }
    });
};

/**
 * @param ruleId 用户或角色ID
 * @param type 0:SQL，1:JAR
 */
ruleWin.prototype.show = function(ruleId,typeFlag,flagStr,ruleManagerWin){
    this.showHide(1);
    paramNames = new Array(); //参数名
    paramNamesOld = new Array(); //参数名
    paramNames_rowIndex = new Array();
    className = "";
    update_flag = 0;  //SQL参数修改标记
    tabBarNum = 3;
    type = typeFlag;
    flag = flagStr;
    rule_Id = ruleId;
    this.tab.cells("a1").attachObject($("sqlInfo"));
    this.tab.cells("a2").attachObject($("classInfo"));
    this.tab.cells("a3").attachObject($("paramInfo"));
    this.tab.cells("a4").attachObject($("basicInfo"));
    if(type){
        this.tab.hideTab("a1");
        this.tab.showTab("a2");
        this.tab.setTabActive("a2");
        $("ruleImplType").innerHTML = "JAR";
        $("returnTypeDiv").style.display = "none";
    }else{
        this.tab.hideTab("a2");
        this.tab.showTab("a1");
        this.tab.setTabActive("a1");
        $("ruleImplType").innerHTML = "SQL";
        $("returnTypeDiv").style.display = "";
    }
    if(flag == 0){
        str = "新增";
        $("createInfo").style.display="none";
        this.tab.hideTab("a3");
        this.tab.hideTab("a4");
        $("nextBtnDiv").style.display="";
        $("SaveBtnDiv").style.display="none";
        $("CalBtnDiv").style.display="none";
    }else if(flag == 1){
        $("createInfo").style.display="none";
        this.tab.showTab("a3");
        this.tab.showTab("a4");
        $("nextBtnDiv").style.display="none";
        $("SaveBtnDiv").style.display="";
        $("CalBtnDiv").style.display="";
        str = "修改";
    }
    this.win.setText(str+"WebService服务");
    if(ruleManagerWin == 0){
        initPage();
    }else{
        initRuleTypeValue();
    }

    if(flag == 0){    //新增时初始化页面值
        setEmptyRuleInfo();
    }else{
        initRuleInfo(ruleId);    //修改查看时时初始化页面值
    }
    if(flag ==1){
        createValidate();
    }

};

//点下一步时控制窗口显示
ruleWin.prototype.showTabar = function(){
    if(type){
        dhtmlxValidation.addValidation($("rule_Form"), [
            {target:"className",rule:"NotEmpty,MaxLength[256]"}
        ])
    }else{
        dhtmlxValidation.addValidation($("rule_Form"), [
            {target:"wsSql",rule:"NotEmpty,MaxLength[4000]"}
        ])
    }
    if(!(dhtmlxValidation.validate("rule_Form")))return;
    if(tabBarNum ==3){
        this.tab.showTab("a"+tabBarNum);
        this.tab.setTabActive("a"+tabBarNum);
        tabBarNum++;
    }else{
        this.tab.showTab("a"+tabBarNum);
        this.tab.setTabActive("a"+tabBarNum);
        $("nextBtnDiv").style.display="none";
        $("SaveBtnDiv").style.display="";
        $("CalBtnDiv").style.display="";
        createValidate();
    }
};

//新增时将所有输入框置空
function  setEmptyRuleInfo(){
    $("wsSql").value="";
    $("className").value="";
    $("ruleName").value="";
    $("ruleCode").value="";
    $("remark").value="";
    createHeader();   //新增时创建参数列头
}

//初始化页面下拉框
function initPage(){
    ruleTypes = getCodeByType("WS_RULE_TYPE");
    dataTypes = getCodeByType("WS_RULE_DATA_TYPE");		//初始化服务规则参数类型
    var returnTypeV = getCodeByType("RETURN_TYPE");         //初始化服务返回类型
    if(type){
        dataTypes.splice(2,3);
    }
    MetaShareWsAction.getDataSourceId(function (data) {
        var dataSourceId = document.getElementById("dataSourceId");
        if (data) {
            for(var i = 0;i< data.length;i++){
                dataSourceId.options[i] = new Option(data[i]["DATA_SOURCE_NAME"],data[i]["DATA_SOURCE_ID"]);
            }
        }
    });

    MetaShareWsAction.getJarFilePath(function (data) {
        var jarFileId = document.getElementById("jarFileId");
        if (data) {
            for(var i = 0;i< data.length;i++){
                jarFileId.options[i] = new Option(data[i]["JAR_FILE_NAME"],data[i]["JAR_FILE_PATH"]);
            }
            jarChange();
        }
    });

    var ruleType = document.getElementById("ruleType");
    if (ruleTypes) {
        for(var m=0;m<ruleTypes.length;m++){
            ruleType.options[m] = new Option(ruleTypes[m].name,ruleTypes[m].value);
        }
    }

    var returnType = document.getElementById("returnType");
    if (returnTypeV) {
        for(var m=0;m<returnTypeV.length;m++){
            returnType.options[m] = new Option(returnTypeV[m].name,returnTypeV[m].value);
        }
    }
}

function setValueChange(){
    var ruleTypeValue = $("ruleType").value;
    if(ruleTypeValue == 0 && type ==0){
            $("returnTypeDiv").style.display = "";
        }else{
            $("returnTypeDiv").style.display = "none";
        }
}
//修改查看时时初始化页面值
function initRuleInfo(ruleId){
    MetaShareWsAction.getRuleInfo(ruleId,function(data){
        // async:false,
        //callback:function(data){

        if(data){
            $("ruleName").value =data["RULE_NAME"];
            $("ruleCode").value =data["RULE_CODE"];
            ruleCode =  data["RULE_CODE"];
            $("ruleType").value = data["RULE_TYPE"];
            if(data["RULE_IMPL_TYPE"] == 0 && data["RULE_TYPE"] == 0){ //sql
                $("returnTypeDiv").style.display = "";
                var sqlInfo = data["sqlInfo"];
                $("returnType").value = sqlInfo["RETURN_TYPE"];
            }else{
                $("returnTypeDiv").style.display = "none";
            }
            $("ruleImplType").value =data["RULE_IMPL_TYPE"];
            $("remark").value =data["REMARK"] || "";
            $("userNameCn").innerHTML =data["USER_NAMECN"];
            $("createDate").innerHTML =data["CREATE_DATE"];
            if(data["RULE_IMPL_TYPE"] == 0){ //sql
                var sqlInfo = data["sqlInfo"];
                $("dataSourceId").value = sqlInfo["DATA_SOURCE_ID"];
                $("wsSql").value = sqlInfo["WS_SQL"];
                var wsSql = $("wsSql").value;
                paramNames = wsSql.values();
            }else{  //jar
                var jarInfo = data["jarInfo"];
                $("jarFileId").value=jarInfo["JAR_FILE_PATH"];
                jarChange();
                $("className").value = jarInfo["CLASS_NAME"];
                className =   jarInfo["CLASS_NAME"];
                setRuleTypeValue(jarInfo["CLASS_NAME"]);
            }

            var paramList = data["paramList"];
            if(paramList.length>0){
                createParamGrid_update(paramList);
            }
        }
    });
}
//添加验证信息
function createValidate(){
    if(type){
        dhtmlxValidation.addValidation($("rule_Form"), [
            {target:"ruleName",rule:"NotEmpty,MaxLength[64]"},
            {target:"ruleCode",rule:"NotEmpty,MaxLength[64]"}
        ])
    }else{
        dhtmlxValidation.addValidation($("rule_Form"), [
            {target:"ruleName",rule:"NotEmpty,MaxLength[64]"},
            {target:"ruleCode",rule:"NotEmpty,MaxLength[64]"}
        ])
    }
}
//保存选中的指标
ruleWin.prototype.saveRule = function(){
    if(!(dhtmlxValidation.validate("rule_Form")))return;
    var ruledata = Tools.getFormValues("rule_Form");
    ruledata["dataSourceId"] = $("dataSourceId").value;
    ruledata["ruleId"] = rule_Id;
    ruledata["type"] = type;
    ruledata["flag"] = flag;
    ruledata["wsSql"] = $("wsSql").value;
    ruledata["returnType"] = $("returnType").value;
    ruledata["jarFileId"] = $("jarFileId").value;
    ruledata["className"] = $("className").value;
    if(type){
        var className = $("className").value;
        if(className == ''){
           alert("类(Class)不能为空！请输入后再保存！")
            return;
        }
    }else{
         var wsSql =  $("wsSql").value.trim();
        if(wsSql == ''){
            alert("SQL不能为空！请输入后再保存！")
            return;
        }else{
            if(wsSql.length>4000){
                alert("SQL长度不能超过4000，请重新输入后再保存！")
                return;
            }
        }
    }
    //封装动态参数值开始
    var params = [];
    if(type == 1 && flag == 0){  //新增jar
        getUserAddData(rowIndex,params);   //获取用户添加的参数信息
        getParamVal(paramNames,params);  //获取页面上解析出来的参数信息
    }else{
        if(type == 1){   //jar
            getUserAddData(rowIndex,params);   //获取用户添加的参数信息
            getParamVal(paramNames_rowIndex,params);
        }else{    //sql
            getParamVal(paramNames,params);
        }
    }
    ruledata["params"] = params;
    //封装动态参数值结束
    ruledata["ruleName"] = $("ruleName").value;
    ruledata["ruleCode"] = $("ruleCode").value;
    ruledata["ruleType"] = $("ruleType").value;
    ruledata["ruleImplType"] = type;
    ruledata["remark"] = $("remark").value ||"";
    dhx.showProgress("执行保存数据！");
    MetaShareWsAction.saveRule(ruledata,function(rs){
        dhx.closeProgress();
        if(rs["flag"] == 'success'){
            dhx.alert("保存成功!")
            ruleManagerWin.win.close();
            dataTable.refreshData();
        }else{
            dhx.alert("发生错误！");
        }
    });
};

//保存时获取用户修改参数
function getUserAddData(rowIndex,params){
    if(rowIndex>0){
        for(var j = 0; j<= rowIndex; j++){
            if($("paramName_"+j)){
                var param = {};
                if($("paramName_"+j).value !=''){
                    param["paramName"] = $("paramName_"+j).value;
                    param["dataType"] = $("dataType_"+j).value;
                    if($("isRequire_"+j).checked == true){
                        param["isRequire"] =1;
                    }else{
                        param["isRequire"] = 0;
                    }
                    param["defaultValue"] = $("defaultValue_"+j).value;
                    param["paramDesc"] = $("paramDesc_"+j).value;
                    params[params.length] = param;
                }
            }
        }
    }
}
//保存时获取参数值
function getParamVal(paramNames,params){
    if(paramNames.length>0){
        for(var j = 0; j< paramNames.length; j++){
            var param = {};
            if($("paramName_"+paramNames[j]).value != ''){
                param["paramName"] = $("paramName_"+paramNames[j]).value;
                param["dataType"] = $("dataType_"+paramNames[j]).value;
                if($("isRequire_"+paramNames[j]).checked == true){
                    param["isRequire"] =1;
                }else{
                    param["isRequire"] = 0;
                }
                param["defaultValue"] = $("defaultValue_"+paramNames[j]).value;
                param["paramDesc"] = $("paramDesc_"+paramNames[j]).value;
                params[params.length] = param;
            }
        }
    }
}
//创建参数界面列标题
var paramTable = null;
function createHeader(){
    var paramInfoDiv = $("paramInfo");
    paramInfoDiv.innerHTML = "";
    paramTable = document.createElement("TABLE");
    paramTable.className = "MetaFormTable";
    paramTable.setAttribute("cellspacing",1);
    paramTable.setAttribute("cellpadding",0);
    paramTable.border = 0;
    paramInfoDiv.appendChild(paramTable);
    var tr1 = paramTable.insertRow(-1);
    var th1_1 = tr1.insertCell(-1);
    var th1_2 = tr1.insertCell(-1);
    var th1_3 = tr1.insertCell(-1);
    var th1_4 = tr1.insertCell(-1);
    var th1_5 = tr1.insertCell(-1);
    th1_1.style.background="#E9F5FE";
    th1_2.style.background="#E9F5FE";
    th1_3.style.background="#E9F5FE";
    th1_4.style.background="#E9F5FE";
    th1_5.style.background="#E9F5FE";
    th1_1.style.textAlign ="center";
    th1_2.style.textAlign ="center";
    th1_3.style.textAlign ="center";
    th1_4.style.textAlign ="center";
    th1_5.style.textAlign ="center";
    th1_1.innerHTML="参数名";
    th1_2.innerHTML="数据类型";
    th1_3.innerHTML="是否必须";
    th1_4.innerHTML="参数默认值";
    if(type){
        th1_5.innerHTML="参数解释&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
            "<img src='../../../resource/images/edit_add.png' title='增加' onclick='addParamRow()' style='width:16px;height: 16px;cursor: pointer'>";
    }else{
        th1_5.innerHTML="参数解释";
    }
}

//sql新建时创建参数界面
function createParamGrid_Sql_Add(){
    var wsSql = $("wsSql").value;
    setRuleTypeValueforSql(wsSql);
    paramNames = wsSql.values();
    if(flag && update_flag==0){
        update_flag = 1;
        paramNamesOld =  paramNames_rowIndex;
    }

    if(paramNamesOld.length>0){
        for(var i = 0;i < paramNames.length;i++){
            var bj = 0;
            for(var j = 0;j < paramNamesOld.length;j++){
                if(paramNames[i] == paramNamesOld[j]){
                    bj = 1;
                    paramNamesOld.remove(j);
                    break;
                }
            }
            if(bj == 0){
                createOneRowSqlParam(paramNames[i]);
            }
        }

        if(paramNamesOld.length > 0){
            for(var i = 0;i < paramNamesOld.length;i++){
                deleteSqlParam(paramNamesOld[i]);
            }
        }

    }else{
        createHeader();
        if(paramNames.length>0){
            for(var i = 0; i < paramNames.length; i++){
                var tr_i = paramTable.insertRow(-1);
                var td1_i = tr_i.insertCell(-1);
                var td2_i = tr_i.insertCell(-1);
                var td3_i = tr_i.insertCell(-1);
                var td4_i = tr_i.insertCell(-1);
                var td5_i = tr_i.insertCell(-1);
                td1_i.innerHTML = "<input type='text'  id='paramName_"+paramNames[i]+"' readOnly='readOnly' value='"+paramNames[i]+"' />";
                var dataTypestr = "";
                dataTypestr += "<select id='dataType_"+paramNames[i]+"'>";
                for(var m=0;m<dataTypes.length;m++){
                    dataTypestr += "<option value='"+dataTypes[m].value+"'>"+dataTypes[m].name+"</option>";
                }
                dataTypestr += "</select>";
                td2_i.innerHTML =dataTypestr;
                td3_i.innerHTML ="<input type='checkbox' id='isRequire_"+paramNames[i]+"' />" ;
                td4_i.innerHTML = "<input type='text' id='defaultValue_"+paramNames[i]+"' />";
                td5_i.innerHTML = "<textarea  rows='1' id='paramDesc_"+paramNames[i]+"' style='width:150px;'></textarea>"+
                    "<input style='margin-left:3px;width:30px;' name='' id='paramDesc__BUTTON_"+paramNames[i]+"' type='button' " +
                    " value='...' onclick='setParamDesc(\""+paramNames[i]+"\")'/>";
            }
        }
    }
    paramNamesOld = paramNames;

}


//删除一行
function deleteSqlParam(paramName) {
    var trObj = document.getElementById("paramName_"+paramName).parentNode.parentNode;
    trObj.parentNode.removeChild(trObj);
};
function createOneRowSqlParam(paramName){
    var tr = paramTable.insertRow(-1);
    var td1 = tr.insertCell(-1);
    var td2 = tr.insertCell(-1);
    var td3 = tr.insertCell(-1);
    var td4 = tr.insertCell(-1);
    var td5 = tr.insertCell(-1);
    td1.innerHTML = "<input type='text'  id='paramName_"+paramName+"' readOnly='readOnly' value='"+paramName+"' />";
    var dataTypestr = "";
    dataTypestr += "<select id='dataType_"+paramName+"'>";
    for(var m=0;m<dataTypes.length;m++){
        dataTypestr += "<option value='"+dataTypes[m].value+"'>"+dataTypes[m].name+"</option>";
    }
    dataTypestr += "</select>";
    td2.innerHTML =dataTypestr;
    td3.innerHTML ="<input type='checkbox' id='isRequire_"+paramName+"' />" ;
    td4.innerHTML = "<input type='text' id='defaultValue_"+paramName+"' />";
    td5.innerHTML = "<textarea  rows='1' id='paramDesc_"+paramName+"' style='width:150px;'></textarea>"+
        "<input style='margin-left:3px;width:30px;' name='' id='paramDesc__BUTTON_"+paramName+"' type='button' " +
        " value='...' onclick='setParamDesc(\""+paramName+"\")'/>";
}

//新建根据选择类的参数动态创建参数界面
function createParamGrid_Jar_Add(className){
    createHeader();
    var params = classParams[className];
    paramNames_rowIndex = [];
    paramNames = [];
    if(params.length>0){
        for(var i = 0; i < params.length; i++){
            paramNames_rowIndex.push(params[i]["name"]);
            paramNames.push(params[i]["name"]);
            var tr_i = paramTable.insertRow(-1);
            var td1_i = tr_i.insertCell(-1);
            var td2_i = tr_i.insertCell(-1);
            var td3_i = tr_i.insertCell(-1);
            var td4_i = tr_i.insertCell(-1);
            var td5_i = tr_i.insertCell(-1);
            td1_i.innerHTML = "<input type='text'  id='paramName_"+params[i]["name"]+"'  value='"+params[i]["name"]+"' />";
            var dataTypestr = "";
            dataTypestr += "<select  id='dataType_"+params[i]["name"]+"'>";
            var aa = "string.class";
            //for(var m=0;m<dataTypes.length;m++){
            var valueType = params[i]["valueType"].toLocaleUpperCase();
            if(valueType.indexOf("STRING")!=-1 || valueType.indexOf("VARCHAR")!=-1) {
                dataTypestr += "<option value='"+dataTypes[0].value+"'selected='selected'>"+dataTypes[0].name+"</option>";
                dataTypestr += "<option value='"+dataTypes[1].value+"'>"+dataTypes[1].name+"</option>";
                dataTypestr += "<option value='"+dataTypes[2].value+"'>"+dataTypes[2].name+"</option>";
            }else if(valueType.indexOf("NUMBER")!=-1 || valueType.indexOf("LONG")!=-1 || valueType.indexOf("INTEGER")!=-1) {
                dataTypestr += "<option value='"+dataTypes[0].value+"'>"+dataTypes[0].name+"</option>";
                dataTypestr += "<option value='"+dataTypes[1].value+"' selected='selected'>"+dataTypes[1].name+"</option>";
                dataTypestr += "<option value='"+dataTypes[2].value+"'>"+dataTypes[2].name+"</option>";
            }else{
                dataTypestr += "<option value='"+dataTypes[0].value+"'>"+dataTypes[0].name+"</option>";
                dataTypestr += "<option value='"+dataTypes[1].value+"'>"+dataTypes[1].name+"</option>";
                dataTypestr += "<option value='"+dataTypes[2].value+"' selected='selected'>"+dataTypes[2].name+"</option>";
            }
            // }
            dataTypestr += "</select>";
            td2_i.innerHTML =dataTypestr;
            var isRequirestr = "";
            if(params[i]["required"] == 'true'){
                isRequirestr = "<input type='checkbox' id='isRequire_"+params[i]["name"]+"' checked/>";
            }else{
                isRequirestr ="<input type='checkbox' id='isRequire_"+params[i]["name"]+"' />";
            }
            td3_i.innerHTML =isRequirestr;
            td4_i.innerHTML = "<input type='text' id='defaultValue_"+params[i]["name"]+"' value='"+params[i]["defVal"]+"' />";
            td5_i.innerHTML = "<textarea rows='1' id='paramDesc_"+params[i]["name"]+"' style='width:150px;'>"+params[i]["desc"]+"</textarea>" +
                "<input style='margin-left:3px;width:30px;' name='' id='paramDesc__BUTTON_"+params[i]["name"]+"' type='button' " +
                " value='...' onclick='setParamDesc(\""+params[i]["name"]+"\")'/>"+
                "<img src='../../../resource/images/cancel.png' title='删除' onclick='removeType(this,\""+params[i]["name"]+"\")' style='width:16px;height: 16px;cursor: pointer'>";
        }
    }
}

//设置业务解释
function setParamDesc(paramName){
    var val = $('paramDesc_'+paramName).value;		//对应参数描述
    $('paramDescParamName').value = paramName;		//设置隐藏域值
    $('paramDescTextarea').value = val;				//设置技术口径值
    if (!winTwo) {
        winTwo = DHTMLXFactory.createWindow("2","showWin", 0, 0, 400, 260);
        winTwo.stick();
        winTwo.denyResize();
        winTwo.denyPark();
        winTwo.button("minmax1").hide();
        winTwo.button("park").hide();
        winTwo.button("stick").hide();
        winTwo.button("sticked").hide();
        winTwo.center();
        winTwo.setText("参数解释");
        winTwo.keepInViewport(true);

        var paramDescDiv = document.getElementById("paramDescDiv");
        winTwo.attachObject(paramDescDiv);
        var saveBtn1 = document.getElementById("saveBtn1");
        var calBtn1 = document.getElementById("calBtn1");
        //确定按钮
        attachObjEvent(saveBtn1,"onclick",function(){
            var paramName = $('paramDescParamName').value;
            $('paramDesc_'+paramName).value = $('paramDescTextarea').value;
            winTwo.close();
        });
        //关闭按钮
        attachObjEvent(calBtn1,"onclick",function(){winTwo.close();});
        winTwo.attachEvent("onClose",function(){
            winTwo.setModal(false);
            this.hide();
            return false;
        });
    }
    winTwo.setModal(true);
    winTwo.show();
}

//sql修改时创建参数界面
function createParamGrid_update(params){
    createHeader();
    if(params.length>0){
        for(var i = 0; i < params.length; i++){
            paramNames_rowIndex.push(params[i]["PARAM_NAME"]);
            var tr_i = paramTable.insertRow(-1);
            var td1_i = tr_i.insertCell(-1);
            var td2_i = tr_i.insertCell(-1);
            var td3_i = tr_i.insertCell(-1);
            var td4_i = tr_i.insertCell(-1);
            var td5_i = tr_i.insertCell(-1);

            if(type == 1){       //jar时可能修改
                td1_i.innerHTML = "<input type='text'  id='paramName_"+params[i]["PARAM_NAME"]+"' value='"+params[i]["PARAM_NAME"]+"' />";
            }else{
                td1_i.innerHTML = "<input type='text'  id='paramName_"+params[i]["PARAM_NAME"]+"' readOnly='readOnly' value='"+params[i]["PARAM_NAME"]+"' />";
            }
            var dataTypestr = "";
            dataTypestr += "<select id='dataType_"+params[i]["PARAM_NAME"]+"'>";
            for(var m=0;m<dataTypes.length;m++){
                if(params[i]["DATA_TYPE"] == dataTypes[m].value) {
                    dataTypestr += "<option value='"+dataTypes[m].value+"'selected='selected'>"+dataTypes[m].name+"</option>";
                }else{
                    dataTypestr += "<option value='"+dataTypes[m].value+"'>"+dataTypes[m].name+"</option>";
                }
            }
            dataTypestr += "</select>";
            td2_i.innerHTML =dataTypestr;
            var isRequirestr = "";
            if(params[i]["IS_REQUIRE"] == 1){  //修改
                isRequirestr = "<input type='checkbox' id='isRequire_"+params[i]["PARAM_NAME"]+"' checked/>";
            }else{
                isRequirestr ="<input type='checkbox' id='isRequire_"+params[i]["PARAM_NAME"]+"' />";
            }
            td3_i.innerHTML =isRequirestr;
            var defaultValue = params[i]["DEFAULT_VALUE"] == null?"": params[i]["DEFAULT_VALUE"];
            td4_i.innerHTML = "<input type='text' id='defaultValue_"+params[i]["PARAM_NAME"]+"' value='"+defaultValue+"' />";

            var paramDesc = params[i]["PARAM_DESC"] == null?"": params[i]["PARAM_DESC"];
            if(type){
                td5_i.innerHTML = "<textarea rows='1' id='paramDesc_"+params[i]["PARAM_NAME"]+"' style='width:150px;'>" +paramDesc+"</textarea>"+
                    "<input style='margin-left:3px;width:30px;' name='' id='paramDesc__BUTTON_"+params[i]["PARAM_NAME"]+"' type='button' " +
                    " value='...' onclick='setParamDesc(\""+params[i]["PARAM_NAME"]+"\")'/>"+
                    "<img src='../../../resource/images/cancel.png' title='删除' onclick='removeType(this,\""+params[i]["PARAM_NAME"]+"\")' style='width:16px;height: 16px;cursor: pointer'>";
            }else{
                td5_i.innerHTML = "<textarea rows='1' id='paramDesc_"+params[i]["PARAM_NAME"]+"' style='width:150px;'>"+ paramDesc+"</textarea>" +
                    "<input style='margin-left:3px;width:30px;' name='' id='paramDesc__BUTTON_"+params[i]["PARAM_NAME"]+"' type='button' " +
                    " value='...' onclick='setParamDesc(\""+params[i]["PARAM_NAME"]+"\")'/>";
            }
        }
    }
}

//解析SQL宏变量中的值
String.prototype.values = function(){
    var tmp = this.toString();
    var reg = /\{.*?\}/g;
    var arr = tmp.match(reg) || [];
    var result =  new Array();
    var reg1 = /\{|\}/g
    if(arr.length>0){
        for(var i=0; i<arr.length; i++){
            var  tempStr = arr[i].replace(reg1,'');
            var bj = -1;
            for(var j = 0; j<result.length;j++){
                if(tempStr == result[j]){
                 bj = 1;
                 break;
                }
            }
            if(bj == -1){
                result.push(tempStr);
            }
        }
    }
    return result;
}

var rowIndex = 0;
//新增一行
function addParamRow(){
    rowIndex ++;
    var tr = paramTable.insertRow(-1);
    tr.id ="trId_"+ rowIndex;
    var td1_rowIndex = tr.insertCell(-1);
    var td2_rowIndex = tr.insertCell(-1);
    var td3_rowIndex = tr.insertCell(-1);
    var td4_rowIndex= tr.insertCell(-1);
    var td5_rowIndex = tr.insertCell(-1);
    td1_rowIndex.innerHTML = "<input type='text'  id='paramName_"+rowIndex+"'  value='' />";
    var dataTypestr = "";
    dataTypestr += "<select id='dataType_"+rowIndex+"'>";
    for(var m=0;m<dataTypes.length;m++){
        dataTypestr += "<option value='"+dataTypes[m].value+"'>"+dataTypes[m].name+"</option>";
    }
    dataTypestr += "</select>";
    td2_rowIndex.innerHTML =dataTypestr;
    td3_rowIndex.innerHTML ="<input type='checkbox' id='isRequire_"+rowIndex+"' />" ;
    td4_rowIndex.innerHTML = "<input type='text' id='defaultValue_"+rowIndex+"' />";


    td5_rowIndex.innerHTML = "<textarea rows='1' id='paramDesc_"+rowIndex+"' style='width:150px;'></textarea>"+
        "<input style='margin-left:3px;width:30px;' name='' id='paramDesc__BUTTON_"+rowIndex+"' type='button' " +
        " value='...' onclick='setParamDesc(\""+rowIndex+"\")'/>"+
        "<img src='../../../resource/images/cancel.png' title='删除' onclick='removeType(this)' style='width:16px;height: 16px;cursor: pointer'>";

    dhtmlxValidation.addValidation(tr, [
        {target:"paramName_" + rowIndex, rule:'MaxLength[64],NotEmpty'}
    ]);
}
//删除一行
function removeType(obj,paramName) {
    for(var i=0;i<paramNames_rowIndex.length;i++){
        if(paramNames_rowIndex[i] == paramName){
            paramNames_rowIndex.remove(i);
        }
    }
    for(var i=0;i<paramNames.length;i++){
        if(paramNames[i] == paramName){
            paramNames.remove(i);
        }
    }
    var trObj = obj.parentNode.parentNode;
    trObj.parentNode.removeChild(trObj);
};

//显示隐藏其窗体
ruleWin.prototype.showHide = function(mode){
    if(mode){
        //显示
        this.win.show();
        this.win.setModal(true);
    }else{
        //隐藏
        this.win.close();
        if(this.closeWinCall)
            this.closeWinCall(this);
    }
};

function checkRuleCode(){
    var  rule_code=  document.getElementById("ruleCode").value.trim();
    if(flag && ruleCode == rule_code){
        return;
    }
    MetaShareWsAction.checkRuleCodeisExist(rule_code,function(ret){
        if(ret){
            alert("服务编码已经存在，请重新输入！")
            if(flag){
                document.getElementById("ruleCode").value=ruleCode;
            }else{
                document.getElementById("ruleCode").value="";
            }
        }
    });
}

function checkClassNameisExist(obj){
    if(className == obj.value)  return;
    MetaShareWsAction.checkClassNameisExist(obj.value,function(ret){
        if(ret){
            alert("该类已存在，请重新选择！")
            document.getElementById("className").value="";
        }else{
            createParamGrid_Jar_Add(obj.value);  //根据选择类的参数动态创建参数界面
            setRuleTypeValue(obj.value);  //根据className 中的VALUE设置操作类型的值
        }
    });
}

//初始化操作类型的值
function initRuleTypeValue(){
    ruleTypes = getCodeByType("WS_RULE_TYPE");
    dataTypes = getCodeByType("WS_RULE_DATA_TYPE");		//初始化服务规则参数类型
    if(type){
        dataTypes.splice(2,3);
    }
}

//根据className 中的VALUE设置操作类型的值
function setRuleTypeValue(className){
    if(calassNames[className] == 0){
        ruleTypes.splice(1,2);
    }else if(calassNames[className] == 1){
        ruleTypes.splice(0,1);
    }
    var ruleType = document.getElementById("ruleType");
    ruleType.options.length  = 0;
    if (ruleTypes) {
        for(var m=0;m<ruleTypes.length;m++){
            ruleType.options[m] = new Option(ruleTypes[m].name,ruleTypes[m].value);
        }
    }
    setValueChange();
}

//根据sql类型设置操作类型的值
function setRuleTypeValueforSql(wsSql){
    var sqlType = wsSql.substr(0,7).toLocaleUpperCase().trim();
    if(sqlType == "SELECT"){
        ruleTypes.splice(1,2);
    }else if(sqlType == "UPDATE" || sqlType == "DELETE"){
        ruleTypes.splice(0,1);
        ruleTypes.splice(1,1);
    }else{
        ruleTypes.splice(0,2);
    }
    var ruleType = document.getElementById("ruleType");
    ruleType.options.length  = 0;
    if (ruleTypes) {
        for(var m=0;m<ruleTypes.length;m++){
            ruleType.options[m] = new Option(ruleTypes[m].name,ruleTypes[m].value);
        }
    }
    setValueChange();
}

var calassNames = null;
var classParams = null;
function jarChange() {
    var jarFilePath = $("jarFileId").value;
    MetaShareWsAction.getClassName(jarFilePath,{
        async:false,
        callback:function(data){
            var  className = document.getElementById("className");
            className.length = 0;
            className.innerHTML = "";
            var k = 1;
            if (data) {
                calassNames = data;
                classParams = data["classParams"];
                var names =[];
                for(var key in data){
                    if(key!='classParams')
                        names.push(key);
                }
                names.sort();
                className.options[0] = new Option("","");
                for(var i=0;i<names.length;i++){
                    className.options[i+1] = new Option(names[i],names[i]);
                }
            }
        }
    });
}

