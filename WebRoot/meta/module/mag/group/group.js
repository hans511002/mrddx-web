/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        group.js
 *Description：
 *       系统列表维护JS
 *Dependent：
 *       dhtmlx.js，dwr 有关JS，dhtmxExtend.js。。。
 *Author:
 *       刘斌
 *Date：
 *       2011-10-18-16-18

 ********************************************************/

/**
 * 页面初始化。
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
/**
 * 声明dwrCaller
 */
var dwrCaller = new biDwrCaller();

/**
 * 数据转换Convert
 */
var groupConvertConfig = {
    idColumnName:"groupId",
    filterColumns:["groupName","groupState","_buttons"],
    /**
     * 实现 userData，将一些数据作为其附加属性
     * @param rowIndex
     * @param rowData
     * @return
     */
    userData:function(rowIndex, rowData) {
        var userData = {};
        userData.frameUrl = rowData.frameUrl;
        userData.groupSn = rowData.groupSn;
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
var groupDataConverter = new dhtmxGridDataConverter(groupConvertConfig);

/**
 * Menu树Data转换器定义
 */
var menuConvertConfig = {
    idColumn:"menuId",pidColumn:"parentId",
    filterColumns:["menuName", "menuUrl", "isShow", "iconUrl", "target"],
    isDycload:true,

    cellDataFormat:function(rowIndex, columnIndex, columnName, cellValue, rowData){
        if(columnName=="iconUrl"){
            if(cellValue){
                return {type:"img",value:getBasePath()+"/"+cellValue};
            }else{
                return cellValue||"";
            }
        }
        return this._super.cellDataFormat(rowIndex, columnIndex, columnName, cellValue, rowData);
    },

    /**
     * 加入处理逻辑，即当图片Url值为null，加列type置为只读，否则会报错。
     * @param rowIndex
     * @param columnIndex
     * @param cellValue
     * @param rowData
     * @return
     */
    addCellDataConfig:function(rowIndex, columnIndex, columnName, cellValue, rowData) {
        if (columnName == "iconUrl" && cellValue == null) {//即iconurl列
            var imageConfig = {};
            //如果图片列是null值，设置其type为 ro
            imageConfig["type"] = "ro";
            return imageConfig;
        } else {
            return this._super.addCellDataConfig(rowIndex, columnIndex, columnName, cellValue, rowData);
        }
    },
    /**
     * 实现 userData，将一些数据作为其附加属性
     * @param rowIndex
     * @param rowData
     * @return
     */
    userData:function(rowIndex, rowData) {
        var userData = {};
        userData["groupId"] = rowData["groupId"];
        userData["orderId"] = rowData["orderId"];
        userData["userAttr"] = rowData["userAttr"];
        /**
         * 浏览器状态处理
         */
        if (rowData["navState"]) {
            var navState = parseInt(rowData["navState"]);
            if ((1 & navState) == 1) {//有最大化选项
                userData["isMax"] = 1;
            }
            if ((2 & navState) == 2) {//有是否滚动选项
                userData["isScroll"] = 1;
            }
            if ((4 & navState) == 4) {//有是否菜单栏选项
                userData["isMenuBar"] = 1;
            }
            if ((8 & navState) == 8) {//有是否状态栏选项
                userData["isStatusBar"] = 1;
            }
        }
        userData["menuTip"] = rowData["menuTip"];
        return userData;
    }
}
var menuTreeDataConverter = new dhtmlxTreeGridDataConverter(menuConvertConfig);


/**
 * 初始化界面
 */
var groupInit=function(){
    var groupLayout = new dhtmlXLayoutObject(document.getElementById("container"), "2E");
    groupLayout.cells("a").setText("业务系统");
    groupLayout.cells("b").hideHeader();
    groupLayout.cells("a").setHeight(75);
    groupLayout.cells("a").fixSize(false, true);
    groupLayout.hideConcentrate();
    groupLayout.hideSpliter();//移除分界边框。

    //加载查询表单

    var queryform = groupLayout.cells("a").attachForm([
        {type:"setting",position: "label-left", labelWidth: 120, inputWidth: 120},
        {type:"input",label:"系统名称：",name:"groupName"},
        {type:"newcolumn"},
        {type:"button",name:"query",value:"查询"},
        {type:"hidden",name:"template"}
    ]);


    var loadGroupParam = new biDwrMethodParam();
    loadGroupParam.setParamConfig([
        {
            index:0,type:"fun",value:function() {
            var formData=queryform.getFormData();
            formData.groupName=Tools.trim(queryform.getInput("groupName").value);
            return formData;
        }
        }
    ]);
    dwrCaller.addAutoAction("loadGroup", "GroupAction.querySysGroup", loadGroupParam,
            function(data) {

            }
    );

    dwrCaller.addDataConverter("loadGroup", groupDataConverter);

    var base = getBasePath();
    var buttons = {
        addGroup:{name:"addGroup",text:"新增",imgEnabled:base + "/meta/resource/images/addGroup.png",
            imgDisabled:base + "/meta/resource/images/addGroup.png",onclick:function(rowData) {
                addGroup();
            }},
        modifyGroup:{name:"modifyGroup",text:"修改",imgEnabled:base + "/meta/resource/images/editGroup.png",
            imgDisabled:base + "/meta/resource/images/editGroup.png",onclick:function(rowData) {
                modifyGroup(rowData.id);
            }},
        deleteGroup:{name:"deleteGroup",text:"删除",imgEnabled:base + "/meta/resource/images/delete.png",
            imgDisabled :base + "/meta/resource/images/delete.png",onclick:function(rowData) {
                deleteGroup(rowData.id);
            }},
        ownMenus:{name:"ownMenus",text:"操作",imgEnabled:base + "/meta/resource/images/ownMenus.png",
            imgDisabled :base + "/meta/resource/images/ownMenus.png",onclick:function(rowData) {
                ownMenus(rowData.id);
            }


        }
    }

    //TODO 按钮权限过滤,checkRule.
    var buttonRole = ["addGroup","modifyGroup","deleteGroup","ownMenus"];
//    var buttonRoleCol = ["ownMenus"];
//    var buttonRole = [];
    //过滤显示顶部按钮
    var bottonRoleRow = [];
    for(var i=0; i<buttonRole.length; i++){
        if(buttonRole[i] == "addGroup"){
            bottonRoleRow.push(buttonRole[i]);
        }
    }

    //过滤列按钮摆放
    var buttonRoleCol = [];
    for(var i=0; i<buttonRole.length; i++){
        if(buttonRole[i]!="addGroup"){
            buttonRoleCol.push(buttonRole[i]);
        }
    }

    //getRoleButtonsCol
    window["getRoleButtonsCol"]=function(){
        var res=[];
        for(var i=0;i<buttonRoleCol.length;i++){
            if(buttonRoleCol[i]=="ownMenus"){
                buttons["ownMenus"].text="下属菜单";
                res.push(buttons["ownMenus"])
            }else{
                res.push(buttons[buttonRoleCol[i]]);
            }
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
    var buttonToolBar = groupLayout.cells("b").attachToolbar();
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
        if(id=="addGroup"){
            addGroup();
        }
        if(id=="modifyGroup"){
            var selecteddRowId = mygrid.getCheckedRows(0);

            if (selecteddRowId == null || selecteddRowId == "") {
                dhx.alert("请选择一行进行修改!");
                return;
            } else if (selecteddRowId.split(",").length > 1) {
                dhx.alert("只能选择一行进行修改!");
                return;
            } else {
                modifyGroup(selecteddRowId);
            }
        }
        if(id=="deleteGroup"){
            var selecteddRowId = mygrid.getCheckedRows(0);
            if (selecteddRowId == null || selecteddRowId == "") {
                dhx.alert("请选择至少一行进行删除!");
                return;
            } else {
                deleteGroup(selecteddRowId);
            }
        }
        if(id=="ownMenus"){
            var selecteddRowId = mygrid.getCheckedRows(0);

            if (selecteddRowId == null || selecteddRowId == "") {
                return;
            } else if (selecteddRowId.split(",").length > 1) {
                return;
            } else {
                ownMenus(selecteddRowId);
            }
        }

    })

    //添加datagrid
    mygrid = groupLayout.cells("b").attachGrid();
    mygrid.setHeader("系统名称,系统状态,操作");
    mygrid.setHeaderAlign("left,center,center")
    mygrid.setInitWidthsP("50,25.1,"+(window.screen.width>1024?"25":"37"));
    mygrid.setColAlign("left,center,center");
    mygrid.setColTypes("ro,ro,sb");
    mygrid.enableCtrlC();
    mygrid.enableResizing("true,false,false");
    mygrid.setColSorting("na,na,na");
    mygrid.setColumnCustFormat(1, validOrNot);//第二列进行转义
    mygrid.enableMultiselect(true);
    mygrid.setColumnIds("groupName,groupState,''");
    mygrid.enableTooltips("true,true,false");
    mygrid.init();
//    mygrid.showRowNumber();
    mygrid.defaultPaging(20);
    mygrid.load(dwrCaller.loadGroup, "json");

    //查询表单事件处理
    queryform.attachEvent("onButtonClick", function(id) {
        if (id == "query") {
            //进行数据查询。
            mygrid.clearAll();
            mygrid.load(dwrCaller.loadGroup, "json");
        }
    });
    // 添加Enter查询事件
    queryform.getInput("groupName").onkeypress=function(e){
        e=e||window.event;
        var keyCode=e.keyCode;
        if(keyCode==13){
            mygrid.clearAll();
            mygrid.load(dwrCaller.loadGroup, "json");
        }
    }
}

/**
 * 新增系统
 */
dwrCaller.addAutoAction("queryMaxGroupSN", "GroupAction.queryMaxGroupSN");
var addGroup=function(){
    //初始化新增弹出窗口。
    var dhxWindow = new dhtmlXWindows();
    dhxWindow.createWindow("addWindow", 0, 0, 250, 220);
    var addWindow = dhxWindow.window("addWindow");
    addWindow.setModal(true);
    addWindow.stick();
    addWindow.setDimension(550, 230);
    addWindow.center();
    addWindow.setPosition(addWindow.getPosition()[0],addWindow.getPosition()[1]-100);
    addWindow.denyResize();
    addWindow.denyPark();
    addWindow.button("minmax1").hide();
    addWindow.button("park").hide();
    addWindow.button("stick").hide();
    addWindow.button("sticked").hide();
    addWindow.setText("新增系统");
    addWindow.keepInViewport(true);
    addWindow.show();

    //建立表单。
    var addForm = addWindow.attachForm(addFormData);
    //添加验证
    addForm.defaultValidateEvent();
    addForm.getCombo("groupState").readonly(true,false);
    addForm.getCombo("groupState").attachEvent("onBlur",function(){
        addForm.getCombo("groupState").closeAll();
    });
    addForm.setItemFocus("groupName");
    addForm.disableItem("groupSn");

    dwrCaller.executeAction("queryMaxGroupSN",function(data){
        var _groupSn = parseInt(data.toString(),10);
        _groupSn = _groupSn+1;
        addForm.setItemValue("groupSn",_groupSn);
    });
    //查询表单事件处理
    addForm.attachEvent("onButtonClick", function(id) {
        if (id == "save") {
            if(addForm.validate()){
                //保存
                dwrCaller.executeAction("insertGroup",addForm.getFormData(),function(data){

                    if(data.type == "error" || data.type == "invalid"){
                        dhx.alert("对不起，新增出错，请重试！");
                    }else if(data.type == "nameExist") {
                        dhx.alert("系统名称已存在，请重新输入！");
                    }
//                    else if(data.type == "snExist") {
//                    	dhx.alert("系统序号已存在，请重新输入！");
//                    }
                    else{
                        dhx.alert("新增成功");
//                        addForm.clear();
                        addWindow.close();
                        dhxWindow.unload();
                        //mygrid.load(dwrCaller.loadGroup, "json");
                        mygrid.updateGrid(groupDataConverter.convert(data.successData),"insert");
                        dhtmlxValidation.clearAllTip();
                    }
                })
            }
        }
        if(id == "close"){
//            addForm.clear();
            addWindow.close();
            dhxWindow.unload();
            dhtmlxValidation.clearAllTip();
        }
    });
}
//注册添加系统Action
dwrCaller.addAutoAction("insertGroup","GroupAction.insertGroup");
dwrCaller.addAutoAction("updateGroup","GroupAction.updateGroup");
dwrCaller.addAutoAction("deleteGroup","GroupAction.deleteGroup");

/**
 * 修改系统
 * @param dataId
 */
var modifyGroup=function(rowId){
    var rowData = mygrid.getRowData(rowId);//获取行数据
    //初始化新增弹出窗口。
    var dhxWindow = new dhtmlXWindows();
    dhxWindow.createWindow("modifyWindow", 0, 0, 250, 220);
    var modifyWindow = dhxWindow.window("modifyWindow");
    modifyWindow.setModal(true);
    modifyWindow.stick();

    //modifyWindow.setDimension(230, 190);

    modifyWindow.setDimension(550, 250);

    modifyWindow.center();
    modifyWindow.setPosition(modifyWindow.getPosition()[0],modifyWindow.getPosition()[1]-100);
    modifyWindow.denyResize();
    modifyWindow.denyPark();
    modifyWindow.button("minmax1").hide();
    modifyWindow.button("park").hide();
    modifyWindow.button("stick").hide();
    modifyWindow.button("sticked").hide();
    modifyWindow.setText("修改系统");
    modifyWindow.keepInViewport(true);
    modifyWindow.show();

    modifyWindow.attachEvent("onClose",function(){
        dhtmlxValidation.clearAllTip();
        return true;
    });

    //建立表单。
    var modifyForm = modifyWindow.attachForm(modifyFormData);
    //添加验证
    modifyForm.defaultValidateEvent();
    modifyForm.getCombo("groupState").readonly(true,false);
    modifyForm.getCombo("groupState").attachEvent("onBlur",function(){
        modifyForm.getCombo("groupState").closeAll();
    });

    //初始化表单信息
    var initForm = function() {
        var initData = {
            groupName:rowData.data[0],//名称
            groupState:rowData.data[1],//状态
            groupId:rowData.id,
            groupSn:rowData.userdata.groupSn,
            frameUrl:rowData.userdata.frameUrl
        }
        modifyForm.setFormData(initData);
        modifyForm.disableItem("groupSn");
    }
    initForm();
    modifyForm.setItemFocus("groupName");

    modifyForm.attachEvent("onButtonClick", function(id) {
        if (id == "save") {
            if(modifyForm.validate()){
                //保存
                dwrCaller.executeAction("updateGroup",modifyForm.getFormData(),function(data){
                    if(data.type == "error" || data.type == "invalid"){
                        dhx.alert("对不起，修改出错，请重试！");
                    }else if(data.type == "nameExist") {
                        dhx.alert("系统名称已存在，请重新输入！");
                    }
//                     else if(data.type == "snExist") {
//                    	dhx.alert("系统序号已存在，请重新输入！");
//                    }
                    else{
                        dhx.alert("修改成功");
                        modifyWindow.close();
                        dhxWindow.unload();
                        mygrid.updateGrid(groupDataConverter.convert(data.successData),"update");
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
 * 删除系统
 * @param dataId
 */
var deleteGroup=function(dataId){
    dhx.confirm("确定要删除该系统吗？", function(r){
        if(r){
            dwrCaller.executeAction("deleteGroup",dataId,function(data){
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
 * 下属菜单
 * @param dataId
 */
var ownMenus=function(dataId){
    var rowData = mygrid.getRowData(dataId);//获取行数据
    var dhxWindow = new dhtmlXWindows();
    dhxWindow.createWindow("refMenuWindow", 0, 0, 650, 300);
    var refMenuWindow = dhxWindow.window("refMenuWindow");
    refMenuWindow.setModal(true);
    refMenuWindow.stick();
    refMenuWindow.setDimension(650, 300);
    refMenuWindow.center();
    refMenuWindow.denyResize();
    refMenuWindow.denyPark();
    refMenuWindow.setText(rowData.data[1]+ '<span style="font-weight:normal;">：菜单列表</span>');
    refMenuWindow.keepInViewport(true);

    //关闭一些不用的按钮。
    refMenuWindow.button("minmax1").hide();
    refMenuWindow.button("park").hide();
    refMenuWindow.button("stick").hide();
    refMenuWindow.button("sticked").hide();
    refMenuWindow.show();

    var refMenuLayout = new dhtmlXLayoutObject(refMenuWindow, "1C");
    refMenuLayout.cells("a").hideHeader();
    //添加treegrid
    var imagePath = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/";
    var refMenuGrid = refMenuLayout.cells("a").attachGrid();
    refMenuGrid.setImagePath(imagePath);
    refMenuGrid.setHeader("菜单名称,菜单地址,是否显示,图标,目标窗口");
    refMenuGrid.setInitWidthsP("35,35,10,10,10");
    refMenuGrid.setColAlign("left,left,center,center,center");
    refMenuGrid.setHeaderAlign("left,center,center,center,center");
    refMenuGrid.setColTypes("tree,ro,ro,ro,ro");
    refMenuGrid.enableCtrlC();
    refMenuGrid.setColSorting("na,na,na,na,na,na");
    refMenuGrid.enableTreeGridLines();
    refMenuGrid.enableMultiselect(false);
    refMenuGrid.setColumnCustFormat(2, yesOrNo);
    refMenuGrid.setColumnIds("menuName,menuUrl,isShow,iconUrl,target");
    refMenuGrid.enableTreeCellEdit(false);
    refMenuGrid.init();

    var loadMenutreeDataConverter = dhx.extend({}, menuTreeDataConverter);
    loadMenutreeDataConverter.setDycload(false);
    dwrCaller.addDataConverter("loadMenu", loadMenutreeDataConverter);

    var loadGridData=function(){
        refMenuGrid.load(dwrCaller.loadMenu+"&groupId="+dataId, "json");
    }
    loadGridData();

    refMenuGrid.kidsXmlFile = dwrCaller.loadSubMenu;
    refMenuGrid.attachEvent("onXLE", function(){
        if(refMenuGrid.getRowsNum() && !refMenuGrid.getSelectedRowId()){
            refMenuGrid.selectRow(0);//默认选择一行
        }
        refMenuGrid.forEachRow(function(id){
            if(refMenuGrid.cells(id,3).cell._cellType=="img"){
                refMenuGrid.cells(id,3).cell.lastChild.style.width="18px";
                refMenuGrid.cells(id,3).cell.lastChild.style.height="18px";
            }
        });
    })
}
//装载查询所属菜单树事件
dwrCaller.addAutoAction("loadMenu", "GroupAction.queryMenuTreeData");
//查询子菜单树事件
dwrCaller.addAutoAction("loadSubMenu", "GroupAction.querySubMenu");
dwrCaller.addDataConverter("loadSubMenu", menuTreeDataConverter);
/**
 * 添加系统FORM
 */
var addFormData=[

    {type:"block",offsetTop:15,list:[
        {type:"input",offsetLeft:40,label:"系统名称：",inputWidth: 370,name:"groupName",validate:"NotEmpty,MaxLength[64]"},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},

//    {type:"block",list:[
//        {type:"input",offsetLeft:40,label:"<span style='color:black'>系统序号：<span>",id:"groupSn_id",inputWidth: 370,name:"groupSn",validate:"NotEmpty,ValidNumeric,MaxLength[9]"},
//    	{type:"newcolumn"},
//    	{type:"label",label:"<span style='color: red'>*</span>"}
//    ]},
    {type:"hidden",name:"groupSn",id:"groupSn_id",value:"1"},

    {type:"block",list:[
        {type:"input",offsetLeft:40,rows:4,label:"框架地址：",inputWidth: 370,name:"frameUrl",validate:"NotEmpty,MaxLength[256]"},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},

    {type:"block",list:[
        {type:"combo",offsetLeft:40,label:"系统状态：",inputWidth: 200,name:"groupState",readonly:true,options:[
            {value:"1",text:"有效",selected:true},
            {value:"0",text:"无效",selected:false}
        ]},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},


    {type:"block",offsetTop:10,list:[
        {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:200},
        {type:"newcolumn"},
        {type:"button",label:"关闭",name:"close",value:"关闭"}
    ]}
];

/**
 * 修改系统FORM
 */
var modifyFormData=[
    {type:"block",offsetTop:15,list:[
        {type:"input",offsetLeft:40,label:"系统名称：",inputWidth: 370,name:"groupName",validate:"NotEmpty,MaxLength[64]"},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},

//    {type:"block",list:[
//        {type:"input",offsetLeft:40,label:"<span style='color:black'>系统序号：</span>",inputWidth: 370,name:"groupSn",validate:"NotEmpty,ValidNumeric,MaxLength[9]"},
//    	{type:"newcolumn"},
//    	{type:"label",label:"<span style='color: red'>*</span>"}
//    ]},
    {type:"hidden",name:"groupSn",id:"groupSn_id",value:"1"},

    {type:"block",list:[
        {type:"input",offsetLeft:40,rows:4,label:"框架地址：",inputWidth: 370,name:"frameUrl",validate:"NotEmpty,MaxLength[256]"},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},

    {type:"block",list:[
        {type:"combo",offsetLeft:40,label:"系统状态：",inputWidth: 200,name:"groupState",readonly:true,options:[
            {value:"1",text:"有效",selected:true},
            {value:"0",text:"无效",selected:false}
        ]},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},


    {type:"block",offsetTop:10,list:[
        {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:200},
        {type:"newcolumn"},
        {type:"button",label:"关闭",name:"close",value:"关闭"}
    ]},
    {type:"hidden",name:"groupId"}
];


dhx.ready(groupInit);