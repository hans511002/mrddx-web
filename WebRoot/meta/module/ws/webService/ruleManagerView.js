/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        ruleManagerView.js
 *Description：
 *       服务规则查看js
 *Dependent：
 *
 *Author:
 *        刘弟伟
 ********************************************************/
var ruleWinFactory_View = [];//存放所有对象
var rule_Id = 0;
var dataTypes = null;   //数据类型
var type = 0;  //0:SQL  1:JAR
var tabBarNum;  //控制TAB
/**
 * 指标权限类
 */
var ruleWin_View = function(){
    this.win = null; //窗体
    this.tab = null;
    this.idx = ruleWinFactory_View.length+1;
    ruleWinFactory_View[ruleWinFactory_View.length] = this;
    this.renderWin();
};
//生成弹出窗口
ruleWin_View.prototype.renderWin = function(){
    if(this.renderWinFlag)return;
    this.win = DHTMLXFactory.createWindow("ruleWin_Views","ruleWin_View", 0, 0, 756, 360);
    this.win.ruleWin_View = this;
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
    this.win.attachObject("_ruleWidDIV_View");
    this.win.setModal(false);
    this.win.attachEvent("onClose",function(){
        this.setModal(false);
        this.hide();
        return false;
    });
    //加入TAB
    this.tab = new dhtmlXTabBar("ruleTabDIV_View", "top");
    this.tab.addTab("a1", "SQL", "100px");
    this.tab.addTab("a2", "Class", "100px");
    this.tab.addTab("a3", "参数", "100px");
    this.tab.addTab("a4", "基本信息", "100px");
    var calBtn = document.getElementById("_CalBtn_View");
    calBtn.ruleWin_View = this;
    attachObjEvent(calBtn,"onclick",function(e){
        e = e || window.event;
        if(e.srcElement && e.srcElement.ruleWin_View){
            e.srcElement.ruleWin_View.showHide(0);
        }
    });
    this.renderWinFlag = 1;
};

/**
 * @param ruleId 用户或角色ID
 * @param type 0:SQL，1:JAR
 */
ruleWin_View.prototype.show = function(ruleId,typeFlag){
    this.showHide(1);
    tabBarNum = 3;
    type = typeFlag;
    rule_Id = ruleId;
    this.tab.cells("a1").attachObject($("sqlInfo_View"));
    this.tab.cells("a2").attachObject($("classInfo_View"));
    this.tab.cells("a3").attachObject($("paramInfo_View"));
    this.tab.cells("a4").attachObject($("basicInfo_View"));
    if(type){
        this.tab.hideTab("a1");
        this.tab.showTab("a2");
        this.tab.setTabActive("a2");
        $("ruleImplType_View").innerHTML = "JAR";
    }else{
        this.tab.hideTab("a2");
        this.tab.showTab("a1");
        this.tab.setTabActive("a1");
        $("ruleImplType_View").innerHTML = "SQL";
    }

    this.win.setText("查看WebService服务");
    initRuleInfo_View(ruleId);
};

//查看时时初始化页面值
function initRuleInfo_View(ruleId){
    MetaShareWsAction.getRuleInfo(ruleId,function(data){
        // async:false,
        //callback:function(data){
        if(data){
            dataTypes = getCodeByType("WS_RULE_DATA_TYPE");		//初始化维度计算方式
            $("ruleName_View").innerHTML =data["RULE_NAME"];
            $("ruleCode_View").innerHTML =data["RULE_CODE"];
            $("ruleType_View").innerHTML = data["RULE_TYPE_NAME"];
            $("ruleImplType_View").innerHTML =data["RULE_IMPL_TYPE_NAME"];
            $("remark_View").innerHTML =data["REMARK"];
            $("userNameCn_View").innerHTML =data["USER_NAMECN"];
            $("createDate_View").innerHTML =data["CREATE_DATE"];
            if(data["RULE_IMPL_TYPE"] == 0 && data["RULE_TYPE"] == 0){ //sql
                $("returnTypeDiv_View").style.display = "";
            }else{
                $("returnTypeDiv_View").style.display = "none";
            }

            if(data["RULE_IMPL_TYPE"] == 0){ //sql
                var sqlInfo = data["sqlInfo"];
                $("dataSourceId_View").value = sqlInfo["DATA_SOURCE_NAME"];
                $("wsSql_View").value = sqlInfo["WS_SQL"];
                $("returnType_View").innerHTML = sqlInfo["RETURN_TYPE_NAME"];
            }else{  //jar
                var jarInfo = data["jarInfo"];
                $("jarFileId_View").value=jarInfo["JAR_FILE_NAME"];
                $("className_View").value = jarInfo["CLASS_NAME"];
            }

            var paramList = data["paramList"];
            createViewHeader();
            if(paramList.length>0){
                createParamGrid_View(paramList);
            }
        }
    });
}

//创建参数界面列标题
var paramTable_View = null;
function createViewHeader(){
    var paramInfoDiv = $("paramInfo_View");
    paramInfoDiv.innerHTML = "";
    paramTable_View = document.createElement("TABLE");
    paramTable_View.className = "MetaFormTable";
    paramTable_View.setAttribute("cellspacing",1);
    paramTable_View.setAttribute("cellpadding",0);
    paramTable_View.border = 0;
    paramInfoDiv.appendChild(paramTable_View);
    var tr1 = paramTable_View.insertRow(-1);
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
    th1_5.innerHTML="参数解释";
}

//sql修改时创建参数界面
function createParamGrid_View(params){
    if(params.length>0){
        for(var i = 0; i < params.length; i++){
            var tr_i = paramTable_View.insertRow(-1);
            var td1_i = tr_i.insertCell(-1);
            var td2_i = tr_i.insertCell(-1);
            var td3_i = tr_i.insertCell(-1);
            var td4_i = tr_i.insertCell(-1);
            var td5_i = tr_i.insertCell(-1);

            td1_i.innerHTML = "<input type='text'  readOnly='readOnly'  value='"+params[i]["PARAM_NAME"]+"'  />";
            var dataTypestr = "";
            dataTypestr += "<select  disabled='disabled'>";
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
            if(params[i]["IS_REQUIRE"] == 1){
                isRequirestr = "<input type='checkbox' disabled='disabled'  checked/>";
            }else{
                isRequirestr ="<input type='checkbox' disabled='disabled' />";
            }
            td3_i.innerHTML =isRequirestr;
            var defaultValue = params[i]["DEFAULT_VALUE"] == null?"": params[i]["DEFAULT_VALUE"];
            td4_i.innerHTML = "<input type='text'readOnly='readOnly'  value='"+defaultValue+"' />";
            var paramDesc = params[i]["PARAM_DESC"] == null?"": params[i]["PARAM_DESC"];
            td5_i.innerHTML = "<input type='text' readOnly='readOnly'  value= '"+paramDesc+"'/>";
        }
    }
}

//显示隐藏其窗体
ruleWin_View.prototype.showHide = function(mode){
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


