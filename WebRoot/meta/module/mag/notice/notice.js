/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *           notice.js
 *Description：
 *           公告维护JS
 *Dependent：
 *       dhtmlx.js，dwr 有关JS，dhtmxExtend.js。。。
 *Author:
 *       程钰
 *Finished：
 *       12-3-21
 *Modified By：
 *
 *Modified Date:
 *
 *Modified Reasons:
 *
 ********************************************************/
/**
 * 页面初始化。
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var user= getSessionAttribute("user");
/**
 * 声明dwrCaller
 */
var dwrCaller = new biDwrCaller();
/**
 * 数据转换Convert
 */
var noticeConvertConfig = {
    idColumnName:"noticeId",
    filterColumns:["noticeTitle","noticeFunction","levelName","isShow","updateDate","failureDate","userNamecn","noticeContent","_buttons"],
    /**
     * 实现 userData，将一些数据作为其附加属性
     * @param rowIndex
     * @param rowData
     * @return
     */
    userData:function(rowIndex, rowData) {
        var userData = {};
        userData.noticeLevel = rowData.noticeLevel;
        userData.noticeType = rowData.noticeType;
        userData.noticeState = rowData.noticeState;
        userData.effectDate = rowData.effectDate;
        userData.failureDate = rowData.failureDate;
        userData.noticeDisplayZones = rowData.noticeDisplayZones;
        userData.noticeDisplayZone = rowData.noticeDisplayZone;
        return userData;
    },
    /**
     * 获取下拉框Button的值
     * @param rowIndex
     * @param columnIndex
     * @param cellValue
     * @param rowData
     */
    cellDataFormat:function(rowIndex, columnIndex, columnName, cellValue, rowData) {
        if (columnName == '_buttons') {//如果是第3列。即操作按钮列
            return "getRoleButtonsCol";
        }
        return this._super.cellDataFormat(rowIndex, columnIndex, columnName, cellValue, rowData);
    }
}
var noticeDataConverter = new dhtmxGridDataConverter(noticeConvertConfig);
/**
 * 初始化界面
 */
var noticeInit=function(){
    var noticeLayout = new dhtmlXLayoutObject(document.getElementById("container"), "2E");
    noticeLayout.cells("a").setText("业务系统");
    noticeLayout.cells("b").hideHeader();
    noticeLayout.cells("a").setHeight(75);
    noticeLayout.cells("a").fixSize(false, true);
    noticeLayout.hideConcentrate();
    noticeLayout.hideSpliter();//移除分界边框。

    //加载查询表单
    var queryform = noticeLayout.cells("a").attachForm([
        {type:"setting",position: "label-left", labelWidth: 120, inputWidth: 120},
        {type:"input",label:"公告名称：",name:"noticeTitle"},
        {type:"newcolumn"},
        {type:"combo",label:"公告层级：",name:"noticeLevel",options:[{value:"",text:"全部",selected:true}],inputWidth:100,inputHeight:22,readonly:true},
        {type:"newcolumn"},
        {type:"button",name:"query",value:"查询"}
    ]);
    //加载层级类型
    var tableTypeData = getComboByRemoveValue("NOTICE_LEVEL");
    queryform.getCombo("noticeLevel").addOption(tableTypeData.options);
    var loadNoticeParam = new biDwrMethodParam();
    loadNoticeParam.setParamConfig([
        {
            index:0,type:"fun",value:function() {
            var formData=queryform.getFormData();
            formData.noticeTitle=Tools.trim(queryform.getInput("noticeTitle").value);
            return formData;
        }
        }
    ]);
    var loadNoticeUrl = Tools.dwr({
        dwrMethod:NoticeAction.queryNotice,
        converter:noticeDataConverter,
        param:loadNoticeParam
    });
    var base = getBasePath();
    var buttons = {
        addNotice:{name:"addNotice",text:"新增",imgEnabled:base + "/meta/resource/images/addGroup.png",
            imgDisabled:base + "/meta/resource/images/addGroup.png",onclick:function(rowData) {
                addNotice();
            }},
        modifyNotice:{name:"modifyNotice",text:"修改",imgEnabled:base + "/meta/resource/images/edit.png",
            imgDisabled:base + "/meta/resource/images/edit.png",onclick:function(rowData) {
                modifyNotice(rowData.id);
            }},
        deleteNotice:{name:"deleteNotice",text:"删除",imgEnabled:base + "/meta/resource/images/delete.png",
            imgDisabled :base + "/meta/resource/images/delete.png",onclick:function(rowData) {
                deleteNotice(rowData.id);
            }},
        viewNotice:{name:"viewNotice",text:"查看",imgEnabled:base + "/meta/resource/images/delete.png",
            imgDisabled :base + "/meta/resource/images/delete.png",onclick:function(rowData) {
                viewNotice(rowData.id);
            }},
        startNotice:{name:"startNotice",text:"公告上线",imgEnabled:base + "/meta/resource/images/delete.png",
            imgDisabled :base + "/meta/resource/images/delete.png",onclick:function(rowData) {
                startNotice(rowData.id,rowData.userdata.noticeState);
            }}
    };

    var buttonRole = ["addNotice","modifyNotice","deleteNotice","viewNotice","startNotice"];
    //过滤显示顶部按钮
    var bottonRoleRow = [];
    for(var i=0; i<buttonRole.length; i++){
        if(buttonRole[i] == "addNotice"){
            bottonRoleRow.push(buttonRole[i]);
        }
    }
    //过滤列按钮摆放
    var buttonRoleCol = [];
    for(var i=0; i<buttonRole.length; i++){
        if(buttonRole[i]!="addNotice"){
            buttonRoleCol.push(buttonRole[i]);
        }
    }
    //getRoleButtonsCol
    window["getRoleButtonsCol"]=function(rowid){
        var rowData = mygrid.getRowData(rowid);
        var res=[];
        for(var i=0; i<buttonRoleCol.length; i++){
            if(buttonRoleCol[i] == "startNotice"){
                try{
                    if(rowData.userdata.noticeState == 0){
                        buttons[buttonRoleCol[i]].text= "公告上线";
                    }else{
                        buttons[buttonRoleCol[i]].text= "公告下线";
                    }
                }catch(e){
                    buttons[buttonRoleCol[i]].text= "公告下线";
                }
            };
            res.push(buttons[buttonRoleCol[i]]);
        }
        return res;
    };
    //定义全局函数，用于获取有权限的button列表定义
    window["getButtons"] = function() {
        var res = [];
        for(var i=0;i<bottonRoleRow.length;i++){
            res.push(buttons[bottonRoleRow[i]]);
        }
        return res;
    };
    var buttonToolBar = noticeLayout.cells("b").attachToolbar();
    var pos = 1;
    var filterButton = window["getButtons"]();
    for (var i = 0; i < filterButton.length; i++) {
        buttonToolBar.addButton(filterButton[i].name, pos++, filterButton[i].text,
                filterButton[i].imgEnabled, filterButton[i].imgDisabled);
        var button=buttonToolBar.getItemNodeById(filterButton[i].name);
        button.setAttribute("id",filterButton[i].name);
    }

    //添加buttonToolBar事件
    buttonToolBar.attachEvent("onclick", function(id) {
        if(id=="addNotice"){
            addNotice();
        }
    })
    mygrid = noticeLayout.cells("b").attachGrid()
    //添加datagrid
    var myg = new Grid(mygrid,{
        headNames:"公告标题,公告类型,公告层级,公告状态,上次更新时间,失效时间,发布人,公告内容,操作",
        columnIds:noticeConvertConfig.filterColumns.toString(),
        widthsP:"10,10,10,10,10,10,10,10,20"
//        colAlign:,
    });
    myg.setColAlign("left,center,center,center,center,center,left,left,center");
    myg.genApi.setCellType(8,"sb");
    myg.genApi.setColTip(8,false)
    myg.loadData(loadNoticeUrl);
    //查询表单事件处理
    queryform.attachEvent("onButtonClick", function(id) {
        if (id == "query") {
            //进行数据查询。
            mygrid.clearAll();
            mygrid.load(loadNoticeUrl,"json");
        }
    });
    // 添加Enter查询事件
    queryform.getInput("noticeTitle").onkeypress=function(e){
        e=e||window.event;
        var keyCode=e.keyCode;
        if(keyCode==13){
            mygrid.clearAll();
            mygrid.load(loadNoticeUrl,"json");
        }
    }
}
//注册添加系统Action
dwrCaller.addAutoAction("insertNotice","NoticeAction.insertNotice");
dwrCaller.addAutoAction("updateNotice","NoticeAction.updateNotice");
dwrCaller.addAutoAction("deleteNotice","NoticeAction.deleteNotice");
/**
 * 新增公告
 */
var addNotice=function(){
    //初始化新增弹出窗口。
    var dhxWindow = new dhtmlXWindows();
    dhxWindow.createWindow("addWindow", 0, 0, 250, 400);
    var addWindow = dhxWindow.window("addWindow");
    addWindow.setModal(true);
    addWindow.stick();
    addWindow.setDimension(550, 400);
    addWindow.center();
    addWindow.setPosition(addWindow.getPosition()[0],addWindow.getPosition()[1]-50);
    addWindow.denyResize();
    addWindow.denyPark();
    addWindow.button("minmax1").hide();
    addWindow.button("park").hide();
    addWindow.button("stick").hide();
    addWindow.button("sticked").hide();
    addWindow.setText("新增公告");
    addWindow.keepInViewport(true);
    addWindow.show();
    //建立表单。
    var addForm = addWindow.attachForm(addFormData);
    loadZoneTreeChkBox(user.zoneId,addForm);
    //加载层级类型
    var levelData = getComboByRemoveValue("NOTICE_LEVEL");
    addForm.getCombo("noticeLevel").addOption(levelData.options);
    addForm.setFormData({noticeLevel:1,noticeType:1,noticeState:1});
    //添加验证
    addForm.defaultValidateEvent();

    //查询表单事件处理
    addForm.attachEvent("onButtonClick", function(id) {
        if (id == "save") {
            if(addForm.validate()){
                //处理数据
                var data = addForm.getFormData();
                data.effectDate = addForm.getInput("effectDate").value;
                data.failureDate = addForm.getInput("failureDate").value;
                //保存
                dwrCaller.executeAction("insertNotice",data,function(data){
                    if(data.type == "error" || data.type == "invalid"){
                        dhx.alert("对不起，新增出错，请重试！");
                    }
                    else{
                        dhx.alert("新增成功");
                        addWindow.close();
                        dhxWindow.unload();
                        mygrid.updateGrid(noticeDataConverter.convert(data.successData),"insert");
                    }
                })
            }
        }
        if(id == "close"){
            addWindow.close();
            dhxWindow.unload();
        }
    });
}
/**
 * 修改一条公告
 * @param dataId
 * @param bool 不为空表示是流浪
 */
var modifyNotice=function(rowId){
    var rowData = mygrid.getRowData(rowId);//获取行数据
    //初始化新增弹出窗口。
    var dhxWindow = new dhtmlXWindows();
    dhxWindow.createWindow("modifyWindow", 0, 0, 250, 400);
    var modifyWindow = dhxWindow.window("modifyWindow");
    modifyWindow.setModal(true);
    modifyWindow.stick();
    modifyWindow.setDimension(550, 400);
    modifyWindow.center();
    modifyWindow.setPosition(modifyWindow.getPosition()[0],modifyWindow.getPosition()[1]-50);
    modifyWindow.denyResize();
    modifyWindow.denyPark();
    modifyWindow.button("minmax1").hide();
    modifyWindow.button("park").hide();
    modifyWindow.button("stick").hide();
    modifyWindow.button("sticked").hide();
    modifyWindow.setText("修改公告");
    modifyWindow.keepInViewport(true);
    modifyWindow.show();
    //建立表单。
    var modifyForm = modifyWindow.attachForm(addFormData);
    loadZoneTreeChkBox(user.zoneId,modifyForm,rowData.userdata.noticeDisplayZones);
    //加载层级类型
    var levelData = getComboByRemoveValue("NOTICE_LEVEL");
    modifyForm.getCombo("noticeLevel").addOption(levelData.options);
    //添加验证
    modifyForm.defaultValidateEvent();
    //初始化表单信息
    var initForm = function() {
        var initData = {
            //"noticeTitle","noticeLevel","isShow","noticeFunction","updateDate","noticeContent","_buttons"],
            noticeId:rowId,
            noticeTitle:rowData.data[0],//名称
            noticeLevel:rowData.userdata.noticeLevel,//状态
            noticeContent:rowData.data[7],
            noticeType:rowData.userdata.noticeType,
            noticeState:rowData.userdata.noticeState,
            effectDate:rowData.userdata.effectDate,
            failureDate:rowData.userdata.failureDate
        }
        if(rowData.userdata.effectDate == null || Tools.trim(rowData.userdata.effectDate) == ""){
            delete initData.effectDate;
        }
        if(rowData.userdata.failureDate == null || Tools.trim(rowData.userdata.failureDate) == ""){
            delete initData.failureDate;
        }
        modifyForm.setFormData(initData);
//        modifyForm.disableItem("groupSn");
    }
    initForm();
    modifyForm.attachEvent("onButtonClick", function(id) {
        if (id == "save") {
            if(modifyForm.validate()){
                var data = modifyForm.getFormData();
                data.effectDate = modifyForm.getInput("effectDate").value;
                data.failureDate = modifyForm.getInput("failureDate").value;
                //保存
                dwrCaller.executeAction("updateNotice",data,function(data){
                    if(data.type == "error" || data.type == "invalid"){
                        dhx.alert("对不起，修改出错，请重试！");
                    }
                    else{
                        dhx.alert("修改成功");
                        modifyWindow.close();
                        dhxWindow.unload();
                        mygrid.updateGrid(noticeDataConverter.convert(data.successData),"update");
                    }
                })
            }
        }
        if(id == "close"){
            modifyWindow.close();
            dhxWindow.unload();
        }
    });
}

/**
 * 查看
 * @param dataId
 */
var viewNotice=function(rowId){
    var rowData = mygrid.getRowData(rowId);//获取行数据
    //初始化新增弹出窗口。
    var dhxWindow = new dhtmlXWindows();
    dhxWindow.createWindow("modifyWindow", 0, 0, 250, 400);
    var modifyWindow = dhxWindow.window("modifyWindow");
    modifyWindow.setModal(true);
    modifyWindow.stick();
    modifyWindow.setDimension(400, 400);
    modifyWindow.center();
    modifyWindow.setPosition(modifyWindow.getPosition()[0],modifyWindow.getPosition()[1]-50);
    modifyWindow.denyResize();
    modifyWindow.denyPark();
    modifyWindow.button("minmax1").hide();
    modifyWindow.button("park").hide();
    modifyWindow.button("stick").hide();
    modifyWindow.button("sticked").hide();
    modifyWindow.setText("查看公告");
    modifyWindow.keepInViewport(true);
    modifyWindow.show();
    //建立表单。
    var modifyForm = modifyWindow.attachForm([
            {type:"label",offsetLeft:40,label:"公告名称："+rowData.data[0],name:"noticeTitle"},
            {type:"label",offsetLeft:40,label:"公告内容："+rowData.data[7],name:"noticeContent"},
            {type:"label",offsetLeft:40,label:"公告层级："+getNameByTypeValue("NOTICE_LEVEL",rowData.userdata.noticeLevel),name:"noticeLevel"},
            {type:"label",offsetLeft:40,label:"有效地市："+(rowData.userdata.noticeDisplayZone==null?"":rowData.userdata.noticeDisplayZone),name:"noticeDisplayZone"},
            {type:"label",offsetLeft:40,label:"生效时间："+(rowData.userdata.effectDate==null?"":rowData.userdata.effectDate),name:"effectDate"} ,
            {type:"label",offsetLeft:40,label:"失效时间："+(rowData.userdata.failureDate==null?"":rowData.userdata.failureDate),name : "failureDate"},
            {type:"button",label:"关闭",offsetLeft:60,name:"close",value:"关闭"}
    ]);
    //加载层级类型
//    var levelData = getComboByRemoveValue("NOTICE_LEVEL");
//    modifyForm.getCombo("noticeLevel").addOption(levelData.options);
//    //添加验证
//    modifyForm.defaultValidateEvent();
//    //初始化表单信息
//    var initForm = function() {
//        var initData = {
//            noticeLevel:rowData.userdata.noticeLevel,//状态
//            noticeType:rowData.userdata.noticeType,
//            noticeState:rowData.userdata.noticeState
//        }
//        modifyForm.setFormData(initData);
//    }
//    initForm();
    modifyForm.attachEvent("onButtonClick", function(id) {
        if(id == "close"){
            modifyWindow.close();
            dhxWindow.unload();
        }
    });
}
/**
 * 删除一条公告
 * @param dataId
 */
var deleteNotice=function(dataId){
    dhx.confirm("确定要删除该记录吗？", function(r){
        if(r){
            dwrCaller.executeAction("deleteNotice",dataId,function(data){
                if(data.type == "error" || data.type == "invalid"){
                    dhx.alert("对不起，删除失败，请重试！");
                }else{
                    dhx.alert("删除成功！");
                    var dataArray = [];
                    for (var i = 0; i < data.length; i ++) {
                        dataArray.push({id:data[i].sid});
                    }
                    mygrid.updateGrid(dataArray, "delete");
                }
            });
        }
    })
}
/**
 * 公告上下线
 * @param dataId
 */
var startNotice = function(dataId,noticeState){
     var showData = getCodeByType("IS_SHOW");
     if(showData.length >2){
         dhx.alert("状态码表值超过了规定范围，请确认！");
         return;
     }
     var stateAfterModify = null;
     if(showData[0].value == noticeState){
        stateAfterModify = showData[1].value;
        dhx.confirm("是否要禁用您所选择的公告？",function(r){
            if(r){
            dwrCaller.executeAction("startNotice",dataId,stateAfterModify);
            }
        });
     }
     if(showData[1].value == noticeState){
        stateAfterModify = showData[0].value;
        dhx.confirm("是否要启用您所选择的公告？",function(r){
            if(r){
            dwrCaller.executeAction("startNotice",dataId,stateAfterModify);
            }
        });
     }
     dwrCaller.addAutoAction("startNotice","NoticeAction.updateNoticeCtrlr",function(data){
        if(data.type=="error"||data.type=="invalid"){
            dhx.alert("对不起，操作出错，请重试！");
        }else{
            dhx.alert("用户操作成功！");
            // 修正禁用用户时的刷新bug
            mygrid.updateGrid(noticeDataConverter.convert(data.successData),"update");
        }
    });

}
/**
 * 添加公告  表单
 */
var addFormData=[
    {type:"block",offsetTop:15,list:[
        {type:"input",offsetLeft:40,label:"公告名称：",inputWidth: 370,name:"noticeTitle",validate:"NotEmpty,MaxLength[64]"},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},
    {type:"hidden",name:"noticeId"},
    {type:"hidden",name:"noticeUser",value:user.userId},
    {type:"block",list:[
        {type:"input",offsetLeft:40,rows:4,label:"公告内容：",inputWidth: 370,name:"noticeContent",validate:"NotEmpty,MaxLength[600]" },
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},
    {type:"hidden", name:"noticeType"},
    {type:"hidden", name:"noticeState"},
    {type:"block",list:[
        {type:"combo",offsetLeft:40,label:"公告层级：",inputWidth: 200,name:"noticeLevel",readonly:true}
    ]},
    {type:"block",list:[
        {type:"input",offsetLeft:40,label:"有效地市：",inputWidth: 200,name:"noticeDisplayZone",readonly:true},
        {type:"hidden",name:"noticeDisplayZones"}
    ]},
    {type:"block",list:[
        {type : "calendar",offsetLeft:40,label : "生效时间：",inputWidth: 200,name : "effectDate",dateFormat : "%Y-%m-%d",weekStart : "7",readonly:true}
    ]},
    {type:"block",list:[
        {type : "calendar",offsetLeft:40,label : "失效时间：",inputWidth: 200,name : "failureDate",dateFormat : "%Y-%m-%d",weekStart : "7",readonly:true}
    ]},
    {type:"block",offsetTop:10,list:[
        {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:200},
        {type:"newcolumn"},
        {type:"button",label:"关闭",name:"close",value:"关闭"}
    ]}
];

dwrCaller.addAutoAction("loadZoneTree","ZoneAction.queryZoneByPath");
var zoneConverter=new dhtmxTreeDataConverter({
    idColumn:"zoneId",pidColumn:"zoneParId",
   textColumn:"zoneName"
});
dwrCaller.addDataConverter("loadZoneTree",zoneConverter);
var loadZoneTreeChkBox=function(selectZone,form,selectedZoneId){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectZone=selectZone|| global.constant.defaultRoot;
    var beginId=(user.userId==global.constant.adminId?global.constant.defaultRoot:user.zoneId)
            || global.constant.defaultRoot;
    //创建Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;width: 180px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000;background-color:white",id:"_zoneDiv"
    });
    document.body.appendChild(div);
    //创建tree Div层
    var treeDiv=dhx.html.create("div",{
        style:"position:relative;height:200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000;"
    });
    div.appendChild(treeDiv);
    //移动节点位置至指定节点下。
    var target=form.getInput("noticeDisplayZone");
    target.readOnly=true;

    //生成树
    var tree = new dhtmlXTreeObject(treeDiv, treeDiv.style.width, treeDiv.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableCheckBoxes(true);
    tree.enableThreeStateCheckboxes(true);
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubZone);
    tree.attachEvent("onCheck",function(id,state){
        var checkedData = tree.getAllChecked();
        var nodes = typeof checkedData == "string" ? checkedData.split(","):[checkedData];
        var zones = "";
        var zonesId ="";
        for (i = 0;i< nodes.length;i++){
            if(zones == ""){
                zones =  tree.getItemText(nodes[i]).toString();
            }else{
                zones =   zones + "," +  tree.getItemText(nodes[i]).toString() ;
            }
            if(zonesId == ""){
                zonesId = nodes[i].toString();
            }else{
                zonesId = zonesId   + "," + nodes[i].toString();
            }
        }
        if(zones == 0){
            zones = "";
            zonesId = null;
        }
        form.setFormData({noticeDisplayZone:zones,noticeDisplayZones:zonesId});
    });
    tree.attachEvent("onSelect",function(id){
        tree.setCheck(id,1);
        var checkedData = tree.getAllChecked();
        var nodes = typeof checkedData == "string" ? checkedData.split(","):[checkedData];
        var zones = "";
        var zonesId ="";
        for (var i = 0;i< nodes.length;i++){
            if(zones == ""){
                zones =  tree.getItemText(nodes[i]).toString();
            }else{
                zones =   zones + "," +  tree.getItemText(nodes[i]).toString() ;
            }
            if(zonesId == ""){
                zonesId = nodes[i].toString();
            }else{
                zonesId = zonesId   + "," + nodes[i].toString();
            }
        }
        if(zones == 0){
            zones = "";
            zonesId = null;
        }
        form.setFormData({noticeDisplayZone:zones,noticeDisplayZones:zonesId});
    });
    dwrCaller.executeAction("loadZoneTree",beginId,999999999,function(data){
        tree.loadJSONObject(data);
        if(selectedZoneId){
            var selectedZoneIds = selectedZoneId.split(",");
            var zones = "";
            var zonesId = "";
            for(var j=0; j<selectedZoneIds.length; j++){
                tree.setCheck(selectedZoneIds[j],1);
                if(zones == ""){
                    zones = tree.getItemText(selectedZoneIds[j]).toString();
                }else{
                    zones = zones + "," + tree.getItemText(selectedZoneIds[j]).toString();
                }
                if(zonesId == ""){
                    zonesId = selectedZoneIds[j].toString();
                }else{
                    zonesId = zonesId   + "," + selectedZoneIds[j].toString();
                }
                target.value=tree.getSelectedItemText();
            }
            if(zones == 0){
                zones = "";
                zonesId = null;
            }
            form.setFormData({noticeDisplayZone:zones,noticeDisplayZones:zonesId});
        }else{
            if(selectZone){
                tree.selectItem(selectZone); //选中指定节点
                //将input框选中
                target.value=tree.getSelectedItemText();
            }
        }
        //为div添加事件
        Tools.addEvent(target,"click",function(){
            // div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
    })
    div.style.display="none";
}
dhx.ready(noticeInit);