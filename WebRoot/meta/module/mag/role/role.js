/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        role.js
 *Description：
 *       功能角色模块所有JS
 *Dependent：
 *       dhtmlx.js，dwr 有关JS，dhtmxExtend.js。。。
 *Author:
 *       刘斌
 *Finished：
 *       2011-09-19-14-35
 *Modified By：
 *       熊小平
 *Modified Date:
 *       2011-10-09-17-05
 *Modified Reasons:
 *       添加角色对地狱机构授权的窗口处理代码

 ********************************************************/
/**
 * 页面初始化。
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var user = getSessionAttribute("user");//当前用户
var loadRoleParam = new biDwrMethodParam();//loadRole Action参数设置。
var systemId = 1;//角色关联菜单默认的系统代码
/**
 * Menu树Data转换器定义
 */
var menuConvertConfig = {
    idColumn:"menuId",pidColumn:"parentId",
    filterColumns:["","menuName", "pageButton", "excludebutton"],
    isDycload:true,

    cellDataFormat:function(rowIndex, columnIndex, columnName, cellValue, rowData) {
        if (columnIndex == 0) {//第一列，checkbox列
            var isChecked = rowData["checked"];
            return isChecked;
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
 * Role表Data转换器
 */
var roleConvertConfig = {
    idColumnName:"roleId",
    filterColumns:["","roleName","roleState","roleDesc","refdeptstation",'sys',"_buttons"],
    /**
     * 获取下拉框Button的值
     * @param rowIndex
     * @param columnIndex
     * @param cellValue
     * @param rowData
     */
    cellDataFormat:function(rowIndex, columnIndex, columnName, cellValue, rowData) {
        if (columnName == '_buttons') {//如果是第4列。即操作按钮列
            return "getRoleButtonsCol";
        }else if (columnIndex == 0) {//第一列，checkbox列
            return 0;
        }
        return this._super.cellDataFormat(rowIndex, columnIndex, columnName, cellValue, rowData);
    }
}
var roleDataConverter = new dhtmxGridDataConverter(roleConvertConfig);

/**
 * User表Data转换器
 */
var userConvertConfig = {
    idColumnName:"userId",
    filterColumns:["","userNamecn","userEmail","zoneName","deptName","stationName","userId"],
    /**
     * 覆盖父类方法：数据转换
     * @param rowIndex
     * @param rowData
     */
    userData:function(rowIndex, rowData) {
        var userData = {};
        if (rowData["createDate"] != null) {
            userData["createDate"] = rowData["createDate"];
        } else {
            userData["createDate"] = "";
        }
        if (rowData["oaUserName"] != null) {
            userData["oaUserName"] = rowData["oaUserName"];
        } else {
            userData["oaUserName"] = "";
        }
        return userData;
    }

}
var userDataConverter = new dhtmxGridDataConverter(userConvertConfig);

var userRoleConvertConfig = {
    idColumnName:"userId",
    filterColumns:["","userNamecn",
        "grantFlag","magFlag","userId","userEmail"]
}
var userRoleDataConverter = new dhtmxGridDataConverter(userRoleConvertConfig);

/**
 * 加载的部门树权限树对象。
 */
var deptTree = null;
var stationTree = null;

/**
 * 声明dwrCaller
 */
var dwrCaller = new biDwrCaller({
    querySystem:{methodName:"RoleAction.queryMenuSystem"
        ,converter:new dhtmlxComboDataConverter({
            valueColumn:"groupId",textColumn:"groupName",isAdd:true
        })},
//    loadSubMenu:{methodName:"RoleAction.querySubMenu",converter:menuTreeDataConverter},
    update:function(afterCall, param) {
    }
});

var sysRoleId = {};
/**
 * 初始化页面加载方法
 */
var roleInit = function() {
    var roleLayout = new dhtmlXLayoutObject(document.getElementById("container"), "2E");
    roleLayout.cells("a").setText("角色管理");
    roleLayout.cells("b").hideHeader();
    roleLayout.cells("a").setHeight(70);
    roleLayout.cells("a").fixSize(false, true);
    roleLayout.hideConcentrate();
    roleLayout.hideSpliter();//移除分界边框。
    //加载查询表单
    var queryform = roleLayout.cells("a").attachForm([
        {type:"setting",position: "label-left", labelWidth: 120, inputWidth: 120},
        {type:"input",label:"角色名称：",name:"roleName",inputHeight:17,validate:"MaxLength[64]"},
        {type:"newcolumn"},
        {type:"combo",label:"角色状态：",name:"roleState",inputWidth: 80,
            className:"combo",options:[
            {value:"-1",text:"全部",selected:true},
            {value:"0",text:"无效",selected:false},
            {value:"1",text:"有效",selected:false}
        ]} ,
        {type:"newcolumn"},
        {type:"button",name:"query",value:"查询"}
    ]);
    queryform.getCombo("roleState").readonly(true,false);
    queryform.getCombo("roleState").attachEvent("onBlur",function(){
        queryform.getCombo("roleState").closeAll();
    });
    queryform.defaultValidateEvent();
    //定义loadRole Action的参数来源于表单queryform数据。
    loadRoleParam.setParamConfig([
        {
            index:0,type:"fun",value:function() {
            var formData=queryform.getFormData();
            formData.roleName=Tools.trim(queryform.getInput("roleName").value);
            return formData;
        }
        }
    ]);
    dwrCaller.addAutoAction("loadRole", "RoleAction.queryRole", loadRoleParam,
            function(data) {
                if(!data || !data.rows)return;
                for(var i=0;i<data.rows.length;i++){
                    if(data.rows[i].id<0)
                        sysRoleId[data.rows[i].id] = 1;
                }
            }
    );

//    dwrCaller.addAction("loadRole", function(afterCall,param){
//        RoleAction.queryRole(loadRoleParam,param,function(data){
//
//        });
//    })

    dwrCaller.addDataConverter("loadRole", roleDataConverter);
    var base = getBasePath();

    var buttons = {
        addRole:{name:"addRole",text:"新增",imgEnabled:base + "/meta/resource/images/addRole.png",
            imgDisabled:base + "/meta/resource/images/addRole.png",onclick:function(rowData) {
                addRole();
            }},
        modifyRole:{name:"modifyRole",text:"修改",imgEnabled:base + "/meta/resource/images/editRole.png",
            imgDisabled:base + "/meta/resource/images/editRole.png",onclick:function(rowData) {
                modifyRole(rowData.id);
            }},
        deleteRole:{name:"deleteRole",text:"删除所选",imgEnabled:base + "/meta/resource/images/delete.png",
            imgDisabled :base + "/meta/resource/images/delete.png",onclick:function(rowData) {
                deleteRole(rowData.id);
            }},
        refUser:{name:"refUser",text:"关联用户",imgEnabled:base + "/meta/resource/images/addUser.png",
            imgDisabled :base + "/meta/resource/images/addUser.png",onclick:function(rowData) {
                refUser(rowData.id);
            }},
        refMenu:{name:"refMenu",text:"关联菜单",imgEnabled:base + "/meta/resource/images/menu.png",
            imgDisabled :base + "/meta/resource/images/menu.png",onclick:function(rowData) {
                refMenu(rowData.id);
            }},
        refDimUsers:{name:"refDimUsers",text:"对地域机构授权",imgEnabled:base + "/meta/resource/images/dimUser.png",
            imgDisabled :base + "/meta/resource/images/dimUser.png",onclick:function(rowData) {
                //TODO
                refDimUsers(rowData.id);
            }}
    };

    // 按钮权限过滤,checkRule.
    var buttonRole = ["addRole","modifyRole","deleteRole","refUser","refMenu","refDimUsers"];
//    var buttonRoleCol=["modifyRole","deleteRole","refUser","refMenu","refDimUsers"];

//    var buttonRole = getRoleButtons();

    //过滤表格顶部行显示的操作按钮
    var bottonRoleRow = [];
    for(var i=0; i<buttonRole.length; i++){
        if(buttonRole[i] == "addRole"||buttonRole[i]=="deleteRole"){
            bottonRoleRow.push(buttonRole[i]);
        }
    }

    var buttonRoleCol = [];
    for(var i=0; i<buttonRole.length; i++){
        if(buttonRole[i]!="addRole"){//操作列不加入新增按钮
            buttonRoleCol.push(buttonRole[i]);
        }
    }
    //getRoleButtonsCol
    window["getRoleButtonsCol"]=function(rid){
        var res=[];
        for(var i=0;i<buttonRoleCol.length;i++){
            if(rid<0){
                if(buttonRoleCol[i]=="deleteRole" || buttonRoleCol[i]=="modifyRole")
                    continue;
            }
            if(buttonRoleCol[i]=="deleteRole"){
                buttons["deleteRole"].text="删除";
                res.push(buttons["deleteRole"])
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

    var buttonToolBar = roleLayout.cells("b").attachToolbar();
    var pos = 1;
    var filterButton = window["getButtons"]();

    for (var i = 0; i < filterButton.length; i++) {
        buttonToolBar.addButton(filterButton[i].name, pos++, filterButton[i].text,
                filterButton[i].imgEnabled, filterButton[i].imgDisabled);
        var button=buttonToolBar.getItemNodeById(filterButton[i].name);
        button.setAttribute("id",filterButton[i].name);
    }
    //添加datagrid
    mygrid = roleLayout.cells("b").attachGrid();
//    mygrid.setImagePath(dhtmlx.image_path+"csh_"+dhtmlx.skin+"/");
    mygrid.setHeader("{#checkBox},角色名称,角色状态,<span>角色描述</span>,关联部门岗位,系统标识,操作");
    //mygrid.setHeaderBold();
    mygrid.setInitWidthsP("3,11,11,17,27,8,"+(window.screen.width>1024?"23":"45"));
    mygrid.setColAlign("center,left,center,left,left,center,left");
    mygrid.setHeaderAlign("center,left,center,center,center,center,center");
    mygrid.enableResizing("true,true,true,true,false,false,false");
    mygrid.setColTypes("ch,ro,ro,ro,ro,ro,sb");
    mygrid.setColSorting("na,na,na,na,na,na,na");
//    mygrid.setEditable(false);    //去除此处代码是为了checkbox行能够点击
    mygrid.setColumnCustFormat(2, validOrNot);//第二列进行转义
    mygrid.setColumnCustFormat(5, function(v,rowdata,cid){
        if(rowdata && rowdata.id<0 )
            return "系统固定角色";
        return "";
    });//第5列进行转义
    mygrid.enableMultiselect(true);
    mygrid.enableSelectCheckedBoxCheck(1);
    mygrid.enableCtrlC();
    mygrid.setColumnIds("'',roleName,roleState,roleDesc,refdeptstation,'sys'target");
    mygrid.enableTooltips("true,true,true,true,true,true,false");
    mygrid.init();

//    mygrid.attachEvent("onCellChanged",function(rid,cid,nv){
//        mygrid.setCheck(rid,0);
//    });

//    mygrid.showRowNumber();//显示行号
    mygrid.defaultPaging(20);
    mygrid.load(dwrCaller.loadRole, "json");

    //添加buttonToolBar事件
    buttonToolBar.attachEvent("onclick", function(id) {
        if (id == "addRole") {//新增角色
            addRole();
        }
        if (id == "deleteRole") {//删除角色
            var selecteddRowId = mygrid.getCheckedRows(0);
            if (selecteddRowId == null || selecteddRowId == "") {
                dhx.alert("请选择至少一行进行删除!");
                return;
            } else {
                var selds = selecteddRowId.split(",");
                for(var i=0;i<selds.length;i++){
                    if(sysRoleId[selds[i]]){
                        dhx.alert("系统固定角色不可删除!");
                        return;
                    }
                }
                deleteRole(selecteddRowId);
            }
        }
        if (id == "modifyRole") {//修改角色
            var selecteddRowId = mygrid.getCheckedRows(0);

            if (selecteddRowId == null || selecteddRowId == "") {
                dhx.alert("请选择一行进行修改!");
                return;
            } else if (selecteddRowId.split(",").length > 1) {
                dhx.alert("只能选择一行进行修改!");
                return;
            } else {
                modifyRole(selecteddRowId);
            }
        }
        if (id == "refUser") {//关联用户
            var selecteddRowId = mygrid.getCheckedRows(0);

            if (selecteddRowId == null || selecteddRowId == "") {
                dhx.alert("请选择一行进行关联设置!");
                return;
            } else if (selecteddRowId.split(",").length > 1) {
                dhx.alert("只能选择一行进行关联设置!");
                return;
            } else {
                refUser(selecteddRowId);
            }
        }
        if (id == "refMenu") {//关联菜单
            var selecteddRowId = mygrid.getCheckedRows(0);

            if (selecteddRowId == null || selecteddRowId == "") {
                dhx.alert("请选择一行进行关联设置!");
                return;
            } else if (selecteddRowId.split(",").length > 1) {
                dhx.alert("只能选择一行进行关联设置!");
                return;
            } else {
                refMenu(selecteddRowId);
            }
        }
        if (id == "refDimUsers") {//关联授权地域机构
            var selecteddRowId = mygrid.getCheckedRows(0);

            if (selecteddRowId == null || selecteddRowId == "") {
                dhx.alert("请选择一行进行授权!");
                return;
            } else if (selecteddRowId.split(",").length > 1) {
                dhx.alert("只能选择一行进行授权!");
                return;
            } else {
                refDimUsers(selecteddRowId);
            }
        }
    });

    //查询表单事件处理
    queryform.attachEvent("onButtonClick", function(id) {
        if (id == "query") {
//            if(queryform.validate()){
            //进行数据查询。
            mygrid.clearAll();
            mygrid.load(dwrCaller.loadRole, "json");
//            }
        }
    });
    // 添加Enter查询事件
    queryform.getInput("roleName").onkeypress=function(e){
        e=e||window.event;
        var keyCode=e.keyCode;
        if(keyCode==13){
            mygrid.clearAll();
            mygrid.load(dwrCaller.loadRole, "json");
        }
    }

}

/**
 * 添加角色
 */
var addRole = function() {

    dwrCaller.addAutoAction("valiHasRoleName","RoleAction.valiHasRoleName",{dwrConfig:true,isShowProcess:false});
    dwrCaller.addDataConverter("valiHasRoleName",new remoteConverter("角色名称已经存在！"));

    var addRoleFormData = [
        {type:"block",list:[
            {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 130,labelLeft:0 ,
                inputLeft:0,offsetTop:0},
            {type:"input",label:"角色名称：",name:"roleName",offsetLeft:30,inputHeight:17,validate:"NotEmpty,MaxLength[64],Remote["+dwrCaller.valiHasRoleName+"]"},
            {type:"newcolumn"},
            {type:"label",label:"<span style='color: red'>*</span>"},
            {type:"newcolumn"},
            {type:"combo",label:"角色状态：",name:"roleState",offsetLeft:30,className:"combo",options:[
                {value:"1",text:"有效",selected:true},
                {value:"0",text:"无效",selected:false}
            ]},
            {type:"newcolumn"},
            {type:"label",label:"<span style='color: red'>*</span>"}
        ]},
        {type:"input",label:"角色描述：",name:"roleDesc",rows:3,position: "label-left",validate:"MaxLength[256]",labelWidth: 90,inputWidth: 373,
            offsetTop:0,offsetLeft:30,labelWidth:60},
        {type:"template",label:"关联部门岗位：",name:"refDeptStation",position: "label-left",labelAlign:"right",labelWidth: 88,inputWidth: 377,labelLeft:0 ,
            inputLeft:0,offsetTop:0,format:deptStationTemplate,labelWidth: 90,inputHeight:180 },
        {type:"block",offsetTop:5,list:[
            {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:180},
            {type:"newcolumn"},
            {type:"button",label:"重置",name:"reset",value:"重置"},
            {type:"newcolumn"},
            {type:"button",label:"关闭",name:"close",value:"关闭"}
        ]},
        {type:"hidden",label:"roleId"}
    ];
    //初始化新增弹出窗口。
    var dhxWindow = new dhtmlXWindows();
    dhxWindow.createWindow("addWindow", 0, 0, 450, 300);
    var addWindow = dhxWindow.window("addWindow");
    addWindow.setModal(true);
    addWindow.stick();
    addWindow.setDimension(550, 350);
    //addWindow.setPosition(addWindow.getPosition()[0],addWindow.getPosition()[1]-100);
    //addWindow.setPosition(addWindow.getPosition()[0],50);
    addWindow.denyResize();
    addWindow.denyPark();
    addWindow.button("minmax1").hide();
    addWindow.button("park").hide();
    addWindow.button("stick").hide();
    addWindow.button("sticked").hide();
    addWindow.setText("新增角色");
    addWindow.keepInViewport(true);
    addWindow.center();
    addWindow.show();
    //树只需加载一次即可。
//    if (!deptTree) {
    //加载部门树
    deptTree = new selectDeptTree();
//    }
    //加载岗位树
//    if (!stationTree) {
    stationTree = new selectStationTree();
//    }
    //建立表单。
    var addForm = addWindow.attachForm(addRoleFormData);
    //添加验证
    addForm.defaultValidateEvent();

    addForm.getCombo("roleState").readonly(true,false);
//    addForm.getCombo("roleState").attachEvent("onBlur",function(){
//        if(addForm&&addForm.getCombo("roleState")){
//            addForm.getCombo("roleState").closeAll();
//        }
//    });
    dwrCaller.addAction("addRole", function(afterCall, param) {
        //重新获取关联的机构和岗位关联数据
        var refDeptStation = [];
        for (var key in selectData) {
            refDeptStation.push(selectData[key]);
        }
        param.refDeptStation = refDeptStation;
        RoleAction.insertRole(param, function(data) {
            if (data.type == "error" || data.type == "invalid") {
                dhx.alert("对不起，新增出错，请重试！");
                return;
            }else {
                dhx.alert("新增成功");
                addWindow.close();
                mygrid.updateGrid(roleDataConverter.convert(data.successData), "insert");
            }
        });
    });

    //添加表单处理事件
    addForm.attachEvent("onButtonClick", function(id) {
        if (id == "save") {//保存
            if(!addForm.validate()){
                addForm.setItemFocus("roleName");
            }
            addForm.send(dwrCaller.addRole);
        } else if (id == "reset") {//重置
            addForm.clear();
            //initForm();
        } else if (id == "close") {
            addWindow.close();
        }
    });
    addForm.setItemFocus("roleName");
    //关闭Window事件
    addWindow.attachEvent("onClose", function(win){
        addForm.getCombo("roleState").closeAll();
        addForm.clear();
        addForm.unload();
        dhxWindow.unload();
    })
}

/**
 * 修改角色
 * @param rowId
 */
var modifyRole = function(rowId) {

    var updateRoleFormData = [
        {type:"block",offsetTop:10,list:[
            {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 130,labelLeft:0 ,
                inputLeft:0,offsetTop:0},
            {type:"input",label:"<span>角色名称：</span>",offsetLeft:30,labelWidth:63,name:"roleName",inputHeight:17,validate:"NotEmpty,MaxLength[64]"},
            {type:"newcolumn"},
            {type:"label",label:"<span style='color: red'>*</span>"},
            {type:"newcolumn"},
            {type:"combo",label:"<span>角色状态：</span>",offsetLeft:27,name:"roleState",className:"combo",options:[
                {value:"1",text:"有效",selected:true},
                {value:"0",text:"无效",selected:false}
            ]},
            {type:"newcolumn"},
            {type:"label",label:"<span style='color: red'>*</span>"}
        ]},

        {type:"block",offsetTop:0,list:[
            {type:"input",label:"<span>角色描述：</span>",name:"roleDesc",rows:3,position: "label-left",validate:"MaxLength[256]",inputWidth: 370,
                offsetLeft:30,labelWidth:63},
            {type:"template",label:"<span>关联部门岗位：</span>",name:"refDeptStation",position: "label-left",labelAlign:"right",labelWidth:86,inputWidth: 375,labelLeft:0 ,
                format:deptStationTemplate,inputHeight:180,labelWidth:93,value:"update"}
        ]},
        {type:"block",offsetTop:5,list:[
            {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:180},
            {type:"newcolumn"},
            {type:"button",label:"重置",name:"reset",value:"重置"},
            {type:"newcolumn"},
            {type:"button",label:"关闭",name:"close",value:"关闭"}
        ]},
        {type:"hidden",label:"roleId"}
    ];

    var dhxWindow = new dhtmlXWindows();
    dhxWindow.createWindow("modifyWindow", 0, 0, 450, 300);
    var modifyWindow = dhxWindow.window("modifyWindow");
    modifyWindow.setModal(true);
    modifyWindow.stick();
    modifyWindow.setDimension(550, 360);
    modifyWindow.button("minmax1").hide();
    modifyWindow.button("park").hide();
    modifyWindow.button("stick").hide();
    modifyWindow.button("sticked").hide();
    modifyWindow.center();
    modifyWindow.setPosition(modifyWindow.getPosition()[0],modifyWindow.getPosition()[1]-100)
//    modifyWindow.setPosition(addWindow.getPosition()[0],0);
    modifyWindow.denyResize();
    modifyWindow.denyPark();
    modifyWindow.setText("修改角色");
    modifyWindow.keepInViewport(true);
    modifyWindow.show();




    //建立表单。
    var modifyForm = null;
    modifyForm = modifyWindow.attachForm(updateRoleFormData);

    modifyForm.getInput("roleName").focus();
    modifyForm.getCombo("roleState").readonly(true,false);
    //添加验证
    modifyForm.defaultValidateEvent();

//    modifyForm.getCombo("roleState").attachEvent("onBlur",function(){
//        modifyForm.getCombo("roleState").closeAll();
//    });
    var roleData = mygrid.getRowData(rowId);//获取行数据

    //树只需加载一次即可。
//    if (!deptTree) {
    //加载部门树
    deptTree = new selectDeptTree();
//    }
    //加载岗位树
//    if (!stationTree) {
    stationTree = new selectStationTree();
//    }

    var initForm = function() {
        var initData = {
            roleName:roleData.data[1],//角色名称
            roleState:roleData.data[2],//角色状态
            roleDesc:roleData.data[3],//角色描述
            roleId:roleData.id,
            refDeptStation:roleData.id
        };
        modifyForm.setFormData(initData);
    };
//    modifyForm.setFormData({refDeptStation:roleData.id});
    initForm();

    dwrCaller.addAction("modifyRole", function(afterCall, param) {
        //重新获取关联的机构和岗位关联数据
        var refDeptStation = [];
        for (var key in selectData) {
            refDeptStation.push(selectData[key]);
        }
        param.refDeptStation = refDeptStation;
        RoleAction.updateRole(param, function(data) {
            if (data.type == "error" || data.type == "invalid") {
                dhx.alert("对不起，修改出错，请重试！");
                return;
            } else if(data.sid == -1){
                dhx.alert("对不起，角色名称重复！");
                return;
            }else {
                dhx.alert("修改成功");
                modifyWindow.close();
                mygrid.updateGrid(roleDataConverter.convert(data.successData), "update");
            }
        });
    });

    //添加表单处理事件
    modifyForm.attachEvent("onButtonClick", function(id) {
        if (id == "save") {//保存
            modifyForm.send(dwrCaller.modifyRole);
        } else if (id == "reset") {//重置
            modifyForm.clear();
            initForm();
            //initForm();
        } else if (id == "close") {
            modifyWindow.close();
        }
    });
    modifyForm.setItemFocus("roleName");
    //关闭Window事件
    modifyWindow.attachEvent("onClose", function(win){
        modifyForm.getCombo("roleState").closeAll();
        modifyForm.clear();
        modifyForm.unload();
        dhxWindow.unload();
    })
}

//新增Dwr deleteRole方法
dwrCaller.addAutoAction("deleteRole", "RoleAction.deleteRole", function(data) {
    if (data.type == "error" || data.type == "invalid") {
        dhx.alert("对不起，删除出错，请重试！");
    } else {
        dhx.alert("删除成功");
        var dataArray = [];
        for (var i = 0; i < data.length; i ++) {
            dataArray.push({id:data[i].sid});
        }
        mygrid.updateGrid(dataArray, "delete");
    }
})
//删除角色
var deleteRole = function(rowDatas) {
    dhx.confirm("是否确认删除您所选择的角色？", function(data){
        if(data){
            dwrCaller.executeAction("deleteRole", rowDatas);
        }
    })
};

//***************************************用户关联begin********************************
var roleUserConvertConfig = {
    idColumnName:"userId",
    filterColumns:["","userName","userEmail","userZoneName","userDeptName","userStationName","userId"]
}
var refUser = function(rowData) {
    var magRole=true;
    RoleAction.isMagRole(rowData,{
        callback:function(rs){
            magRole=rs;
        },
        async:true
    })
    var roleData=mygrid.getRowData(rowData);
    var loadUserParam = new biDwrMethodParam();
    var dhxWindow = new dhtmlXWindows();
    var winSize=Tools.propWidthDycSize(10,10,10,10);
    winSize.width=winSize.width<780?780:winSize.width;
    dhxWindow.createWindow("refUserWindow", 0, 0, winSize.width, 500);
    var refUserWindow = dhxWindow.window("refUserWindow");
    refUserWindow.setModal(true);
    refUserWindow.stick();
    refUserWindow.setDimension(winSize.width, winSize.height);
    refUserWindow.center();
    refUserWindow.denyResize();
    refUserWindow.denyPark();
    refUserWindow.setText("当前角色："+roleData.data[1]);
    refUserWindow.keepInViewport(true);
    //关闭一些不用的按钮。
    refUserWindow.button("minmax1").hide();
    refUserWindow.button("park").hide();
    refUserWindow.button("stick").hide();
    refUserWindow.button("sticked").hide();
    refUserWindow.show();
    //创建布局A\B
    var refUserLayout = new dhtmlXLayoutObject(refUserWindow, "3E");
    refUserLayout.cells("a").hideHeader();
    refUserLayout.cells("b").setWidth(winSize.width);
    refUserLayout.cells("c").setHeight(30);
    refUserLayout.cells("b").hideHeader();
    refUserLayout.cells("a").setHeight(20);
    refUserLayout.cells("a").fixSize(false,true);
    refUserLayout.cells("b").fixSize(false,false);
    refUserLayout.cells("c").hideHeader();
    refUserLayout.cells("c").fixSize(true,true);
    refUserLayout.hideConcentrate();
    refUserLayout.cells("a").hideHeader();

    var winDiv=document.createElement("div");
    winDiv.style.height="100%";
    winDiv.style.width="100%";
    var roleTemplate=function(name,value){
        return "<div style='height:100%;background-color:white;overflow:hidden;' id='_roleUserGrid'></div>"
    }
    var refRoleTemplate=function(name,value){
        return "<div style='height:100%;background-color:white;overflow:hidden;' id='_roleGrid'></div>"
    }

    var operTemplate=function(){
        return "<div style='height:100%;width:40px;' id='_oper'><img id='_rightMove' title='右移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 30px;'" +
               "src="+getBasePath()+"/meta/resource/images/arrow_right.png alt='右移'>" +
               "<br/><img id='_allRightMove' title='全部右移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 10px' " +
               "src="+getBasePath()+"/meta/resource/images/arrow_right_double.png alt='当前页全部右移'>" +
               "<br/><img id='_leftMove' title='左移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 10px' " +
               "src="+getBasePath()+"/meta/resource/images/arrow_left.png alt='左移'>"+
               "<br/><img id='_allLeftMove' title='全部左移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 10px' " +
               "src="+getBasePath()+"/meta/resource/images/arrow_left_double.png alt='当前页全部左移'></div>";
    }
    var referenceFormData=[
        {type:"block",className:"zero",width:winSize.width,list:[
            {
                type:"fieldset",label:"备选用户列表",width:(winSize.width-120)/2+40,offsetLeft:0,labelWidth:0,list:[
                {type:"template",name:"role",className:"zero",format:roleTemplate}
            ]},
            {type:"newcolumn"},
            { type:"template",name:"oper",format:operTemplate},
            {type:"newcolumn"},
            {
                type:"fieldset",label:"已选用户列表",width:(winSize.width-120)/2-40,list:[
                {type:"template",name:"refRole",format:refRoleTemplate,className:"zero"}
            ]
            }
        ]}]
    //建立表单。
    var referenceForm=new dhtmlXForm(winDiv,referenceFormData);
    refUserLayout.cells("b").attachObject(winDiv);
    $("_roleUserGrid").style.width=((winSize.width-120)/2+40)+"px";
    $("_roleGrid").style.width=((winSize.width-120)/2-40)+"px";
    $("_roleUserGrid").style.height=(winSize.height-190)+"px";
    $("_roleGrid").style.height=(winSize.height-190)+"px";
    $("_oper").style.marginTop=($("_oper").clientHeight/2-40)+"px";

    //新增用户关联关系事件
    dwrCaller.addAutoAction("insertRefUser", "RoleAction.insertRefUser",
            function(data) {
                if (data) {
                    refUserGrid.clearAll();
                    refUserGrid.load(dwrCaller.loadRefUser, "json");
                    refGrid.clearAll();
                    refGrid.load(dwrCaller.queryUserRole, "json");
                } else {
                    dhx.alert("设置失败，请重试");
                }
            }
    );

//创建查询表单添加到a布局中
    var queryform = refUserLayout.cells("a").attachForm([
        {type:"setting",position: "label-left", labelWidth: 120, inputWidth: 120},
        {type:"input",label:"姓名：",name:"userName", inputWidth: 120},
        {type:"newcolumn"},
        {type:"input",label:"地域：",name:"zone", inputWidth:120} ,
        {type:"newcolumn"},
        {type:"input",label:"部门：",name:"dept", inputWidth: 120},
        {type:"newcolumn"},
        {type:"input",label:"岗位：",name:"station", inputWidth: 120},
        {type:"newcolumn"},
        {type:"button",name:"query",value:"查询"},
        {type:"hidden",name:"roleId",value:rowData}
    ]);

    loadRoleParam.setParamConfig([
        {
            index:0,type:"fun",value:function() {
            var formData=queryform.getFormData();
            formData.userName=Tools.trim(queryform.getInput("userName").value);
            return formData;
        }
        }
    ]);
    //加载部门树
    loadDeptTreeChkbox(null,queryform);
    //加载地域树
    //alert(user.zoneId);
    loadZoneTreeChkBox(user.zoneId,queryform);
    //加载岗位树
    loadStationTreeChkBox(null,queryform);

    loadUserParam.setParamConfig([
        {
            index:0,type:"fun",value:function() {
            var data =  queryform.getFormData();
            if(data.zoneId == null || data.zoneId == ""){
                data.zoneId = user.zoneId;
            }
            return data;
        }
        }
    ]);
    //创建已有用户表单
    dwrCaller.addAutoAction("loadRefUser", "RoleAction.queryRefUser", loadUserParam );
    dwrCaller.addDataConverter("loadRefUser", userDataConverter);
    $("_roleUserGrid").parentNode.parentNode.parentNode.parentNode.parentNode.style.padding="0px";
    var refUserGrid = new dhtmlXGridObject("_roleUserGrid");
    refUserGrid.setHeader("{#checkBox},姓名,邮箱,地域,部门,岗位,id");
    refUserGrid.setHeaderBold();
    refUserGrid.setInitWidthsP("6,40,54,0,0,0,0");
    refUserGrid.setColAlign("center,left,left,left,left,center,center");
    refUserGrid.setHeaderAlign("center,left,center,center,center,center,center");
    refUserGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro");
    refUserGrid.setColSorting("na,na,na,na,na,na,na");
    refUserGrid.enableMultiselect(true);
    refUserGrid.setColumnIds("'',userNamecn,userEmail,zoneName,deptName,stationName","userId");
    refUserGrid.enableCtrlC();
    refUserGrid.init();
    refUserGrid.enableSelectCheckedBoxCheck(1);
    refUserGrid.setColumnHidden(3,true);
    refUserGrid.setColumnHidden(4,true);
    refUserGrid.setColumnHidden(5,true);
    refUserGrid.setColumnHidden(6,true);
    var genstr=refUserGrid.defaultPaging(10,false);
    refUserGrid.load(dwrCaller.loadRefUser, "json");
//    $("_pagingArea_"+genstr).style.marginTop="20px";
    //创建权限表单
    //添加加载用户事件
    dwrCaller.addAutoAction("queryUserRole", "RoleAction.queryUserRole", loadUserParam);
    dwrCaller.addDataConverter("queryUserRole", userRoleDataConverter);
    $("_roleGrid").parentNode.parentNode.parentNode.parentNode.parentNode.style.padding="0px";
    var refGrid = new dhtmlXGridObject("_roleGrid");
    refGrid.setHeader("{#checkBox},姓名,授予权限,管理权限,id,email");
    refGrid.setHeaderBold();
    var nameWidth= !magRole?90:30;
    var checkWidth=!magRole?0:30 ;
    refGrid.setInitWidthsP("10,"+nameWidth+","+checkWidth+","+checkWidth+",0,0");
    refGrid.setColAlign("center,left,center,center,center,center");
    refGrid.setHeaderAlign("center,left,center,center,center,center");
    refGrid.setColTypes("ch,ro,ch,ch,ch,ro");
    refGrid.enableCtrlC();
    refGrid.setColSorting("na,na,na,na,na");
    refGrid.enableMultiselect(true);
    refGrid.setColumnIds("", "userNamecn", "grantFlag", "magFlag","userId");
    refGrid.init();
    refGrid.setColumnHidden(4,true);
    refGrid.setColumnHidden(5,true);
    if(!magRole){
        refGrid.setColumnHidden(2,true);
        refGrid.setColumnHidden(3,true);
    }
    refGrid.enableSelectCheckedBoxCheck(1);
    refGrid.defaultPaging(10,false);
    refGrid.load(dwrCaller.queryUserRole, "json");

//    //加载部门树
//    loadDeptTree(null, queryform);
//    //加载岗位树
//    loadStationTree(null, queryform);
//    //加载地域树
//    loadZoneTree(null, queryform);

    //查询表单事件处理
    queryform.attachEvent("onButtonClick", function(id) {
        if (id == "query") {
            //进行数据查询。
            refUserGrid.clearAll();
            refUserGrid.load(dwrCaller.loadRefUser, "json");
//            refGrid.clearAll();
//            refGrid.load(dwrCaller.queryUserRole, "json");
        }
    });


    var leftAdd={},rightAdd={},update={}; //分别表示左边grid新增的数据，右边表格新增的数据，右边表格修改的数据。
    var moveRight=function(flag){
        var del=[];
        if(flag){
            for(var i in refUserGrid.rowsBuffer){
                if(!refUserGrid.rowsBuffer[i]||typeof refUserGrid.rowsBuffer[i]=="function"){
                    continue;
                }
                var rowId=refUserGrid.getRowId(i);
                var rowData=refUserGrid.getRowData(rowId);
                if(move(refUserGrid,refGrid,{rows:[{id:rowId,data:[rowData.data[0],rowData.data[1],0 ,0,rowData.data[6]]}]},leftAdd,rightAdd,rowId)){
                    del.push(rowId);
                }
            }
        }else{
            var ids=refUserGrid.getCheckedRows(0);
            if(ids){
                ids=ids.split(",");
                for(var i=0;i<ids.length;i++){
                    var rowData=refUserGrid.getRowData(ids[i]);
                    
                    if(move(refUserGrid,refGrid,{rows:[{id:ids[i],data:[rowData.data[0],rowData.data[1],rowData.data[2]
                        ,rowData.data[3],null,null,rowData.data[4]] }]},leftAdd,rightAdd,ids[i])){
                        del.push(ids[i]);
                    }
                }
            }
        }
        //最后删除需要删除的行
        for(var key=0;key<del.length;key++){
            refUserGrid.deleteRow(del[key]);
        }
    }
    /**
     * 取消选择的角色。
     * @param flag 当其为true时，表示将查询出的角色当前页全部右移。当为true时，表示只移动选择的数据。
     */
    var moveLeft=function(flag){
        var del=[];
        if(flag){
            for(var i in refGrid.rowsBuffer){
                if(!refGrid.rowsBuffer[i]||typeof refGrid.rowsBuffer[i]=="function"){
                    continue;
                }
                var rowId=refGrid.getRowId(i);
                var rowData=refGrid.getRowData(rowId);
                if(move(refGrid,refUserGrid,
                        {rows:[{id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[5]
                            ,rowData.data[3],null,null,rowData.data[4]]}]},rightAdd,leftAdd,rowId)){
                    del.push(rowId);
                }
            }
        }else{
            var ids=refGrid.getCheckedRows(0);
            if(ids){
                ids=ids.split(",");
                for(var i=0;i<ids.length;i++){
                    var rowData=refGrid.getRowData(ids[i]);
                    if(move(refGrid,refUserGrid,
                            {rows:[{id:ids[i],data:[rowData.data[0],rowData.data[1],rowData.data[5]
                                ,rowData.data[3],rowData.data[6]]}]},rightAdd,leftAdd,ids[i])){
                        del.push(ids[i]);
                    }
                }
            }
        }
        //最后删除需要删除的行
        for(var key=0;key<del.length;key++){
            refGrid.deleteRow(del[key]);
        }
    }
    //右移新增事件处理
    $("_rightMove").onclick=function(){
        moveRight(false);
    }
    //全部右移事件处理
    $("_allRightMove").onclick=function(){
        moveRight(true);
    }
    //左移新增事件处理
    $("_leftMove").onclick=function(){
        moveLeft(false);
    }
    //全部左移事件处理
    $("_allLeftMove").onclick=function(){
        moveLeft(true);
    }
    var styles={
        inserted:"font-weight:bold;color:#64B201;",
        deleted:"text-decoration:line-through;font-style:italic;color: #808080;",
        change_cell:"border-bottom:2px solid red;",
        clear:"font-weight:normal;font-style:normal;text-decoration:none;color:black;"
    };

    var move=function(moveObj,moveToObj,moveData,moveAdd,moveToAdd,id){
        if(!moveToObj.doesRowExist(id)){
            //移动至对象新增一行。
            moveToObj.updateGrid(moveData,"insert");
            //设置样式标记为新增。
            moveToObj.setRowTextStyle(id,styles.inserted);
            //记录删除变量。
            moveToAdd[id]=moveData;
        }else{ //如果移动过去的对象存在且不是新增的，切换为正常样式
            if(!moveToAdd[id]){
                moveToObj.setRowTextStyle(id,styles.clear);
            }
        }
        var isDel=false;
        if(moveAdd[id]){//如果有数据，需要删除此行。
            isDel=true;
        }else{
            //改变要移动对象的样式,标记已被删除。
            moveObj.setRowTextStyle(id,styles.deleted);
        }
        //删除新增变量
        moveAdd[id]=null;
        delete moveAdd[id];
        return isDel;
    }

    dwrCaller.addAutoAction("insertRole","RoleAction.insertRefUser");
    dwrCaller.isDealOneParam("insertRole",false);
    var saveUserData=function(){
        /*页面选择数据，其数据结构为：{
         {
         add:[{roleId:,userId:,magFlag:,grandFlag:},{}...],
         del:{roleIds:"213,232,123,213,...",userId:}
         update:[{roleId:,userId:,magFlag:,grandFlag:},{}...]
         }
         */
        var data={};//最终要传送给后台的数据结构。
        if(!Tools.isEmptyObject(rightAdd)){
            //右边新增的数据即为要关联的数据。
            data.add=[];
            for(var key in rightAdd){
                data.add.push({roleId:rowData,userId:key,magFlag:refGrid.cells(key,3).getValue(),grandFlag:refGrid.cells(key,2).getValue()});
            }
        }
        if(!Tools.isEmptyObject(leftAdd)){
            //左边新增的数据即为取消的关联。
            data.del=[];
            for(var key in leftAdd){
                data.del.push({roleId:rowData,userId:key});
            }
        }
        //修改的数据
        if(!Tools.isEmptyObject(update)){
            data.update=[];
            for(var key in update){
                data.update.push(update[key]);
            }
        }
        //执行DWR
        dwrCaller.executeAction("insertRole",data,function(rs){
            if(rs){
                dhx.alert("设置关联关系成功！");
                //清空数据
                leftAdd=null;
                rightAdd=null;
                update=null;
            }else{
                dhx.alert("设置关联关系失败，请重试");
            }
        });
    }

    /**
     * 双击更换两侧数据
     * @param {Object} name
     * @param {Object} value
     * @return {TypeName}
     */
    refUserGrid.attachEvent("onRowDblClicked",function(rowId,cInd){
        if(!rightAdd[rowId]){//右边没有，进行选择
            var rowData=refUserGrid.getRowData(rowId);
            if(move(refUserGrid,refGrid,{rows:[{id:rowId,data:[rowData.data[0],rowData.data[1],0
                ,0]
            }]},leftAdd,rightAdd,rowId)){
                refUserGrid.deleteRow(rowId);
            }
        }else{//左边已选择，进行取消选择
            var rowData=refGrid.getRowData(rowId);
            if(move(refGrid,refUserGrid,
                    {rows:[{id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                        ,rowData.data[3],rowData.data[4]]}]},rightAdd,leftAdd,rowId)){
                refGrid.deleteRow(rowId);
            }
        }

    });
    refGrid.attachEvent("onRowDblClicked",function(rowId,cInd){
        if(!leftAdd[rowId]){//左边没有，移动至左边
            var rowData=refGrid.getRowData(rowId);
            if(move(refGrid,refUserGrid,
                    {rows:[{id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[5]
                        ,rowData.data[3],rowData.data[4]]}]},rightAdd,leftAdd,rowId)){
                refGrid.deleteRow(rowId);
            }
        }else{
            var rowData=refUserGrid.getRowData(rowId);
            if(move(refUserGrid,refGrid,{rows:[{id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[5]
                ,rowData.data[3],rowData.data[4]]}]},leftAdd,rightAdd,rowId)){
                refUserGrid.deleteRow(rowId);
            }
        }

    });
    /**
     * 点击改变比边颜色
     * @param {Object} rId
     * @param {Object} cInd
     * @param {Object} nValue
     */
    refGrid.attachEvent("onCheck",function(rId,cInd,nValue,isClick){
        isClick=(undefined||isClick==null)?true:isClick;  //是否由点击事件调用，默认为true
        if(!rightAdd[rId]&&!leftAdd[rId]&&(cInd==2||cInd==3)){//如果是新增或者是已删除的数据，不用关心。
            var oldValue1=refGrid.getRowData(rId).data[2]?1:0;
            var oldValue2=refGrid.getRowData(rId).data[3]?1:0;
            if(update[rId]&&update[rId].magFlag==oldValue1&&update[rId].grandFlag==oldValue2){
                update[rId]=null;
                delete update[rId];
            }else{
                update[rId]={roleId:roleData.id,userId:rId,
                    magFlag:refGrid.cells(rId,3).getValue(),grandFlag:refGrid.cells(rId,2).getValue()};
            }
            //设置样式
            if(nValue==refGrid.getRowData(rId).data[cInd]){
                refGrid.setCellTextStyle(rId,cInd,styles.clear);
            }else{
                refGrid.setCellTextStyle(rId,cInd,styles.change_cell);
            }
        }
        if(cInd==3&&isClick){//如果选择的是管理权限，那么授予权限应该与管理权限一致
            if(parseInt(refGrid.cells(rId,2).getValue())!=parseInt(nValue?1:0) &&  nValue == 1){
                refGrid.cells(rId,2).setValue(nValue);
                arguments.callee.call(this,rId,2,nValue,false);
            }
        }else{ //如果是授予权限，且取消了授予权限，则必然取消管理权限
            if(isClick&&parseInt(refGrid.cells(rId,3).getValue())){
                refGrid.cells(rId,3).setValue(0);
                arguments.callee.call(this,rId,3,0,false);
            }
        }
});
var buttonForm = refUserLayout.cells("c").attachForm([
    {type:"settings",position: "label-left", labelWidth: 70, inputWidth: 120},
    {type:"button",value:"确定",name:"save",offsetLeft:(winSize.width/2-70),offsetTop:5},
    {type:"newcolumn"},
    {type:"button",value:"关闭",name:"close",offsetTop:5}
]);
//保存
buttonForm.attachEvent("onButtonClick",function(id){
    if(id=="save"){//保存
        saveUserData();
        dhxWindow._removeWindowGlobal(refUserWindow);
    }else if(id=="close"){
        refUserWindow.close();
    }
});
refUserWindow.attachEvent("onClose",function(win){
    if(!Tools.isEmptyObject(leftAdd)
               ||!Tools.isEmptyObject(rightAdd)
            ||!Tools.isEmptyObject(update)){
        dhx.messageBox({
            buttons:[{id:"save",text:"保存",callback:function(){
                saveUserData();
                dhxWindow._removeWindowGlobal(refUserWindow);
                dhxWindow.unload();
            }},{id:"notSave",text:"不保存",callback:function(){
                dhxWindow._removeWindowGlobal(win);
                dhxWindow.unload();
            }},
                {id:"cancel",text:"取消" }],
            message:"您有数据未提交，是否保存？"
        });
        return false;  //不关闭窗口，根据逻辑判断再决定是否关闭窗口
    }else{
        return true;
    }
});

}

// 加载地域树、岗位数、部门树
dwrCaller.addAutoAction("loadDeptTree", "DeptAction.queryDeptByPath");
var treeConverter = new dhtmxTreeDataConverter( {
    idColumn : "deptId",
    pidColumn : "parentId",
    userData : function(rowIndex, rowData) {
        return {
            menuData : rowData
        };
    },
    isDycload : false,
    textColumn : "deptName"
});
dwrCaller.addDataConverter("loadDeptTree", treeConverter);
//树动态加载Action
dwrCaller.addAction("querySubDept", function(afterCall, param) {
    var tempCovert = dhx.extend( {
        isDycload : true
    }, treeConverter, false);
    DeptAction.querySubDept(param.id, function(data) {
        data = tempCovert.convert(data);
        afterCall(data);
    })
});
/**
 * 部门树input框Html。
 * @param selectDept 已经选择了的部门。
 */
var loadDeptTree = function(selectDept, form) {
    //加载部门树数据。加载用户所在部门及其子部门。
    selectDept = selectDept || global.constant.defaultRoot;
    var beginId = (user.userId == global.constant.adminId ? global.constant.defaultRoot : user.deptId)
            || global.constant.defaultRoot;
    //创建tree Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target = form.getInput("dept");
    target.readOnly = true;
    //生成树
    var tree = new dhtmlXTreeObject(div, div.style.width, div.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableThreeStateCheckboxes(true);
//    tree.enableSmartRendering();
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubDept);
    //树双击鼠标事件
    tree.attachEvent("onDblClick", function(nodeId) {
        form.setFormData({dept:tree.getItemText(nodeId),deptId:nodeId});
        //关闭树
        div.style.display = "none";
    });
    dwrCaller.executeAction("loadDeptTree", beginId, selectDept, function(data) {
        tree.loadJSONObject(data);
        if (selectDept) {
            tree.selectItem(selectDept); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "click", function() {
            div.style.width = (target.offsetWidth + 100) + 'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display = "block";
        })
    })
}

/**
 * 岗位input输入框Html，为可以多选查询
 * @param name
 * @param value
 */
var loadDeptTreeChkbox=function(selectDept,form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectDept=selectDept|| global.constant.defaultRoot;
//    var beginId=global.constant.defaultRoot;
    var beginId=1;
    //创建tree Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #A4BED4 solid;height: 200px;width:150px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000;background-color:white",id:'_deptDivBox'
    });
    document.body.appendChild(div);
    //创建tree div
    var treeDiv = dhx.html.create("div", {
        style:"position:relative;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    div.appendChild(treeDiv);
//    //创建一个按钮div层
//    var buttonDiv = dhx.html.create("div", {
//        style:"position:relative;border: 1px #eee solid;height: 30px;overflow: auto;padding-top:0px;margin-top: 6px;" +
//              "z-index:1000;padding-left:35px"
//    })
//    div.appendChild(buttonDiv);
    //创建一个button


    //生成树
    var tree = new dhtmlXTreeObject(treeDiv, treeDiv.style.width, treeDiv.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableCheckBoxes(true);
    tree.enableThreeStateCheckboxes(1);
    tree.enableHighlighting(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubDept);
    tree.attachEvent("onCheck",function(id,state){
        var checkedData = [];
        var allChecked = tree.getAllChecked();
        //寻找ID所有子节点

        var nodes = typeof allChecked == "string" ? allChecked.split(",") : [allChecked];
        var depts = "";
        var deptsId = "";
        for (i = 0;i < nodes.length; i++){
            var scanIds = typeof tree.getAllSubItems(nodes[i]) == "string" ? tree.getAllSubItems(nodes[i]).split(","): [tree.getAllSubItems(nodes[i])];
            if( scanIds.length > 1 ){
                for (j = 0; j< scanIds.length; j++){
                    if(depts == ""){
                        depts =  tree.getItemText(scanIds[j]).toString();
                    }else{

                        depts =   depts + "," +  tree.getItemText(scanIds[j]).toString() ;
                    }
                    if(deptsId == ""){
                        deptsId = scanIds[j].toString();
                    }else{
                        deptsId = deptsId   + "," + scanIds[j].toString();
                    }
                }
            }else{
                if(depts == ""){
                    depts =  tree.getItemText(nodes[i]).toString();
                }else{
                    depts =   depts + "," +  tree.getItemText(nodes[i]).toString() ;
                }
                if(deptsId == ""){
                    deptsId = nodes[i].toString();
                }else{
                    deptsId = deptsId   + "," + nodes[i].toString();
                }
            }
        }
        if(depts == 0){
            depts = "";
            deptsId = null;
        }
        form.setFormData({dept:depts,deptId:deptsId});




    });
    div.style.display = "none";
    var that = this;

//    var button = Tools.getButtonNode("确定",getBasePath()+'/meta/resource/images/ok.png');
//    button.style.marginTop="5px";
//    button.type = "button";
//    buttonDiv.appendChild(button);
    //button响应函数，利用回调调用具体的事件相应
//      button.onclick = function() {
//			var checkedData = [];
//            var allChecked = tree.getAllChecked();
//            //寻找ID所有子节点
//
//			var nodes = typeof allChecked == "string" ? allChecked.split(",") : [allChecked];
//			var depts = "";
//			var deptsId = "";
//			for (i = 0;i < nodes.length; i++){
//				var scanIds = typeof tree.getAllSubItems(nodes[i]) == "string" ? tree.getAllSubItems(nodes[i]).split(","): [tree.getAllSubItems(nodes[i])];
//				if( scanIds.length > 1 ){
//			    	   for (j = 0; j< scanIds.length; j++){
//					       if(depts == ""){
//					          depts =  tree.getItemText(scanIds[j]).toString();
//				           }else{
//
//					          depts =   depts + "," +  tree.getItemText(scanIds[j]).toString() ;
//				           }
//				          if(deptsId == ""){
//					          deptsId = scanIds[j].toString();
//				          }else{
//					          deptsId = deptsId   + "," + scanIds[j].toString();
//				          }
//				      }
//			    }else{
//			    	      if(depts == ""){
//					          depts =  tree.getItemText(nodes[i]).toString();
//				           }else{
//					          depts =   depts + "," +  tree.getItemText(nodes[i]).toString() ;
//				           }
//				          if(deptsId == ""){
//					          deptsId = nodes[i].toString();
//				          }else{
//					          deptsId = deptsId   + "," + nodes[i].toString();
//				          }
//			    }
//			}
//			if(depts == 0){
//				depts = "";
//				deptsId = null;
//			}
//			form.setFormData({dept:depts,deptId:deptsId});
//			 div.style.display = "none";
//      }

//    //树双击鼠标事件
//    tree.attachEvent("onDblClick",function(nodeId){
//        form.setFormData({dept:tree.getItemText(nodeId),deptId:nodeId});
//        //关闭树
//        div.style.display="none";
//    });
    tree.attachEvent("onSelect",function(id){
        tree.setCheck(id,1);
        var checkedData = [];
        var allChecked = tree.getAllChecked();
        //寻找ID所有子节点

        var nodes = typeof allChecked == "string" ? allChecked.split(",") : [allChecked];
        var depts = "";
        var deptsId = "";
        for (i = 0;i < nodes.length; i++){
            var scanIds = typeof tree.getAllSubItems(nodes[i]) == "string" ? tree.getAllSubItems(nodes[i]).split(","): [tree.getAllSubItems(nodes[i])];
            if( scanIds.length > 1 ){
                for (j = 0; j< scanIds.length; j++){
                    if(depts == ""){
                        depts =  tree.getItemText(scanIds[j]).toString();
                    }else{

                        depts =   depts + "," +  tree.getItemText(scanIds[j]).toString() ;
                    }
                    if(deptsId == ""){
                        deptsId = scanIds[j].toString();
                    }else{
                        deptsId = deptsId   + "," + scanIds[j].toString();
                    }
                }
            }else{
                if(depts == ""){
                    depts =  tree.getItemText(nodes[i]).toString();
                }else{
                    depts =   depts + "," +  tree.getItemText(nodes[i]).toString() ;
                }
                if(deptsId == ""){
                    deptsId = nodes[i].toString();
                }else{
                    deptsId = deptsId   + "," + nodes[i].toString();
                }
            }
        }
        if(depts == 0){
            depts = "";
            deptsId = null;
        }
        form.setFormData({dept:depts,deptId:deptsId});
    });


    //移动节点位置至指定节点下。
    var target=form.getInput("dept");
    //target.readOnly=true;
    dwrCaller.executeAction("loadDeptTree",beginId,selectDept,function(data){
        tree.loadJSONObject(data);
//        globDeptTree = tree;
        if(selectDept){
            tree.selectItem(selectDept); //选中指定节点
            //将input框选中
            target.value=tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target,"click",function(){
            //div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
    });
    div.style.display="none";
}


dwrCaller.addAutoAction("loadStationTree", "StationAction.queryStationByPath");
var stationConverter = dhx.extend({idColumn:"stationId",pidColumn:"parStationId",
    textColumn:"stationName"
}, treeConverter, false);
dwrCaller.addDataConverter("loadStationTree", stationConverter);
//树动态加载Action
dwrCaller.addAction("querySubStation", function(afterCall, param) {
    var tempCovert = dhx.extend({isDycload:true}, stationConverter, false);
    StationAction.querySubStation(param.id, function(data) {
        data = tempCovert.convert(data);
        afterCall(data);
    })
});

/**
 * 岗位input输入框Html
 * @param name
 * @param value
 */
var loadStationTree = function(selectStation, form) {
    //加载部门树数据。加载用户所在部门及其子部门。
    selectStation = selectStation || global.constant.defaultRoot;
    var beginId = (user.userId == global.constant.adminId ? global.constant.defaultRoot : user.stationId)
            || global.constant.defaultRoot;
    //创建tree Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #A4BED4 solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target = form.getInput("station");
    target.readOnly = true;

    //生成树
    var tree = new dhtmlXTreeObject(div, div.style.width, div.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableThreeStateCheckboxes(true);
//    tree.enableSmartRendering();
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubStation);
    //树双击鼠标事件
    tree.attachEvent("onDblClick", function(nodeId) {
        form.setFormData({station:tree.getItemText(nodeId),stationId:nodeId});
        //关闭树
        div.style.display = "none";
    });
    dwrCaller.executeAction("loadStationTree", beginId, selectStation, function(data) {
        tree.loadJSONObject(data);
        if (selectStation) {
            tree.selectItem(selectStation); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "click", function() {
            div.style.width = (target.offsetWidth + 100) + 'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display = "block";
        })
    })
}
//添加岗位可以多选
var loadStationTreeChkBox=function(selectStation,form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectStation=selectStation|| global.constant.defaultRoot;
//    var beginId=global.constant.defaultRoot;
    var beginId=1;
    //创建Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #A4BED4 solid;height: 190px;width:150px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000;background-color:white",id:"_stationDivBox"
    });
    document.body.appendChild(div);
    //创建tree Div层
    var treeDiv=dhx.html.create("div",{
        style:"display;none;position:relaive;height:190px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    div.appendChild(treeDiv);
//    //创建buttondiv
//    var butDiv=dhx.html.create("div",{
//    	style:"position:relative;height:25px;overflow:auto;padding:0;margin:0;padding-top:0xp;margin-top:6xp" +
//    	"z-index:1000;margin-left:35px"
//    })
//    div.appendChild(butDiv);

    //移动节点位置至指定节点下。
    var target=form.getInput("station");
    target.readOnly=true;

    //生成树
    var tree = new dhtmlXTreeObject(treeDiv, treeDiv.style.width, treeDiv.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableCheckBoxes(true);
    tree.enableThreeStateCheckboxes(true);
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.attachEvent("onCheck", function(){
        var checkedData = tree.getAllChecked();
        var nodes = typeof checkedData == "string" ? checkedData.split(","):[checkedData];
        var stations = "";
        var stationsId ="";
        for (i = 0;i< nodes.length;i++){
            if(stations == ""){
                stations =  tree.getItemText(nodes[i]).toString();
            }else{
                stations =   stations + "," +  tree.getItemText(nodes[i]).toString() ;
            }
            if(stationsId == ""){
                stationsId = nodes[i].toString();
            }else{
                stationsId = stationsId   + "," + nodes[i].toString();
            }
        }
        if(stations == 0){
            stations = "";
            stationsId = null;
        }
        form.setFormData({station:stations,stationId:stationsId});
//			 div.style.display = "none";
    });
    tree.attachEvent("onSelect", function(id){
        tree.setCheck(id,1);
        var checkedData = tree.getAllChecked();
        var nodes = typeof checkedData == "string" ? checkedData.split(","):[checkedData];
        var stations = "";
        var stationsId ="";
        for (i = 0;i< nodes.length;i++){
            if(stations == ""){
                stations =  tree.getItemText(nodes[i]).toString();
            }else{
                stations =   stations + "," +  tree.getItemText(nodes[i]).toString() ;
            }
            if(stationsId == ""){
                stationsId = nodes[i].toString();
            }else{
                stationsId = stationsId   + "," + nodes[i].toString();
            }
        }
        if(stations == 0){
            stations = "";
            stationsId = null;
        }
        form.setFormData({station:stations,stationId:stationsId});
//			 div.style.display = "none";
    });
    tree.setXMLAutoLoading(dwrCaller.querySubStation);
//    var button = Tools.getButtonNode("确定",getBasePath()+'/meta/resource/images/ok.png');
//    button.style.marginTop="5px";
////    button.type = "button";
//    butDiv.appendChild(button);
    // 点击button事件
//    button.onclick = function(){
//    	var checkedData = tree.getAllChecked();
//    	var nodes = typeof checkedData == "string" ? checkedData.split(","):[checkedData];
//    	var stations = "";
//		var stationsId ="";
//    	for (i = 0;i< nodes.length;i++){
//			 if(stations == ""){
//			        stations =  tree.getItemText(nodes[i]).toString();
//		     }else{
//					stations =   stations + "," +  tree.getItemText(nodes[i]).toString() ;
//		     }
//			 if(stationsId == ""){
//			        stationsId = nodes[i].toString();
//			 }else{
//					stationsId = stationsId   + "," + nodes[i].toString();
//			 }
//    	}
//    	if(stations == 0){
//    		stations = "";
//    		stationsId = null;
//    	}
//    	form.setFormData({station:stations,stationId:stationsId});
//			 div.style.display = "none";
//
//    }
    //树双击鼠标事件
//    tree.attachEvent("onDblClick",function(nodeId){
//        form.setFormData({station:tree.getItemText(nodeId),stationId:nodeId});
//        //关闭树
//        div.style.display="none";
//    });
    dwrCaller.executeAction("loadStationTree",beginId,selectStation,function(data){
        tree.loadJSONObject(data);
//        globStationTree = tree;
        if(selectStation){
            tree.selectItem(selectStation); //选中指定节点
            //将input框选中
            target.value=tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target,"click",function(){
            //div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
    })
}

dwrCaller.addAutoAction("loadZoneTree", "ZoneAction.queryZoneByPath");
var zoneConverter = dhx.extend({idColumn:"zoneId",pidColumn:"zoneParId",
    textColumn:"zoneName"
}, treeConverter, false);
dwrCaller.addDataConverter("loadZoneTree", zoneConverter);
//树动态加载Action
dwrCaller.addAction("querySubZone", function(afterCall, param) {
    var tempCovert = dhx.extend({isDycload:true}, zoneConverter, false);
    ZoneAction.querySubZone(param.id, function(data) {
        data = tempCovert.convert(data);
        afterCall(data);
    })
});
/**
 * 地域树加载
 * @param name
 * @param value
 */
var loadZoneTree = function(selectZone, form) {
    //加载部门树数据。加载用户所在部门及其子部门。
    selectZone = selectZone || global.constant.defaultRoot;
    var beginId = (user.userId == global.constant.adminId ? global.constant.defaultRoot : user.zoneId)
            || global.constant.defaultRoot;
    //创建tree Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target = form.getInput("zone");
    target.readOnly = true;

    //生成树
    var tree = new dhtmlXTreeObject(div, div.style.width, div.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableThreeStateCheckboxes(true);
//    tree.enableSmartRendering();
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubZone);
    //树双击鼠标事件
    tree.attachEvent("onDblClick", function(nodeId) {
        form.setFormData({zone:tree.getItemText(nodeId),zoneId:nodeId});
        //关闭树
        div.style.display = "none";
    });
    dwrCaller.executeAction("loadZoneTree", beginId, selectZone, function(data) {
        tree.loadJSONObject(data);
        if (selectZone) {
            tree.selectItem(selectZone); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "click", function() {
            div.style.width = (target.offsetWidth + 100) + 'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display = "block";
        })
    })
}
var loadZoneTreeChkBox=function(selectZone,form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectZone=selectZone|| global.constant.defaultRoot;
    var beginId=(user.userId==global.constant.adminId?global.constant.defaultRoot:user.zoneId)
            || global.constant.defaultRoot;
    //创建Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #A4BED4 solid;height: 190px;width:150px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000;background-color:white",id:"_zoneDiv"
    });
    document.body.appendChild(div);
    //创建tree Div层
    var treeDiv=dhx.html.create("div",{
        style:"display;none;position:relaive;height:190px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    div.appendChild(treeDiv);
    //创建buttondiv
//    var butDiv=dhx.html.create("div",{
//    	style:"position:relative;height:25px;overflow:auto;padding:0;margin:0;padding-top:0xp;margin-top:6xp" +
//    	"z-index:1000;margin-left:35px"
//    })
//    div.appendChild(butDiv);

    //移动节点位置至指定节点下。
    var target=form.getInput("zone");
    target.readOnly=true;

    //生成树
    var tree = new dhtmlXTreeObject(treeDiv, treeDiv.style.width, treeDiv.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableCheckBoxes(true);
    tree.enableThreeStateCheckboxes(true);
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
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
        form.setFormData({zone:zones,zoneId:zonesId});
//			 div.style.display = "none";
    });
    tree.attachEvent("onSelect",function(id){
        tree.setCheck(id,1);
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
        form.setFormData({zone:zones,zoneId:zonesId});
//			 div.style.display = "none";


    });

    tree.setXMLAutoLoading(dwrCaller.querySubZone);
//    var button = Tools.getButtonNode("确定",getBasePath()+'/meta/resource/images/ok.png');
//    button.style.marginTop="5px";
////    button.type = "button";
//    butDiv.appendChild(button);
//    // 点击button事件
//    button.onclick = function(){
//    	var checkedData = tree.getAllChecked();
//    	var nodes = typeof checkedData == "string" ? checkedData.split(","):[checkedData];
//    	var zones = "";
//		var zonesId ="";
//    	for (i = 0;i< nodes.length;i++){
//			 if(zones == ""){
//			        zones =  tree.getItemText(nodes[i]).toString();
//		     }else{
//					zones =   zones + "," +  tree.getItemText(nodes[i]).toString() ;
//		     }
//			 if(zonesId == ""){
//			        zonesId = nodes[i].toString();
//			 }else{
//					zonesId = zonesId   + "," + nodes[i].toString();
//			 }
//    	}
//    	if(zones == 0){
//    		zones = "";
//    		zonesId = null;
//    	}
//    	form.setFormData({zone:zones,zoneId:zonesId});
//			 div.style.display = "none";
//
//    }
    //树双击鼠标事件
//    tree.attachEvent("onDblClick",function(nodeId){
//        form.setFormData({zone:tree.getItemText(nodeId),zoneId:nodeId});
//        //关闭树
//        div.style.display="none";
//    });
    dwrCaller.executeAction("loadZoneTree",beginId,selectZone,function(data){
        tree.loadJSONObject(data);
//        globZoneTree = tree;
        if(selectZone){
            tree.selectItem(selectZone); //选中指定节点
            //将input框选中
            target.value=tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target,"click",function(){
            //div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
    })
}
//********************************用户关联end********************************
/**
 * Menu树Data转换器定义
 */
var menuConvertConfig = {
    idColumn:"menuId",pidColumn:"parentId",
    textColumn:"menuName",
    isDycload:false ,
    /**
     * 实现 userData，将一些数据作为其附加属性
     * @param rowIndex
     * @param rowData
     * @return
     */
    userData:function(rowIndex,rowData){
        return {menuData:rowData};
    },
    isOpen:function(){
        return false;
    },
    afterCoverted:function(data){
        if(data){
            for(var i = 0; i < data.length; i++){
                data[i].open = data[i].items ? true : false;
            }
        }
        return data;
    },
    compare
            : function(data1, data2){
        if(data1.userdata[0]["content"].orderId == undefined
                || data1.userdata[0]["content"].orderId == null){
            return false;
        }
        if(data2.userdata[0]["content"].orderId == undefined
                || data2.userdata[0]["content"].orderId == null){
            return false;
        }
        return data1.userdata[0]["content"].orderId <= data2.userdata[0]["content"].orderId
    }
}
var menuTreeDataConverter=new dhtmxTreeDataConverter(menuConvertConfig);

var buttonConvertConfig={
    filterColumns:["checked","name","enName"],
    isFormatColumn:false,
    /**
     * 此函数目的将格式为类似为 addButton:新增，delete；删除.格式化为列数据
     * @param data 固定为数组，索引位0表示选中的menu已经注册的按钮，格式为： addButton:新增，delete；删除
     * 索引位1表示已经排除的按钮列表，用“,”号分割。
     */
    onBeforeConverted:function(data){
        if(data){
            var pageButton=data[0];
            this.exclude=data[1];
            this.menuData=data[2];
            if(pageButton){
                var buttons=pageButton.split(",");
                var list=[];
                for(var i=0;i<buttons.length;i++){
                    var temp=buttons[i].split(":");
                    list.push({enName:temp[0],name:temp[1]});
                }
                return list;
            }
        }
        this.exclude=undefined;
        this.menuData=undefined;
        return Tools.EmptyList;
    },
    userData:function(){
        return this.menuData;
    }
}
var buttonConverter=new dhtmxGridDataConverter(buttonConvertConfig);
dwrCaller.addAutoAction("insertRefMenu", RoleAction.insertRefMenu,{
    dwrConfig:true,
    processMessage:"正在提交关联菜单数据，请稍后...",
    isDealOneParam:false
})
/**
 * 用户关联菜单
 * @param rowId
 */
var refMenu=function(rowId){
    var windowSize=Tools.propWidthDycSize(8,20,8,20);
    var winHeight=windowSize.height;
    var winWidth=windowSize.width<750?750:windowSize.width;
    var roleData=mygrid.getRowData(rowId);
    var dhxWindow=new dhtmlXWindows();
    dhxWindow.createWindow("refMenuWindow",0,0,800,400);
    var refMenuWindow=dhxWindow.window("refMenuWindow");
    refMenuWindow.setModal(true);
    refMenuWindow.stick();
    refMenuWindow.setDimension(winWidth,winHeight);
    refMenuWindow.center();
    refMenuWindow.denyResize();
    refMenuWindow.denyPark();
    refMenuWindow.setText("当前权限："+roleData.data[1]);
    refMenuWindow.keepInViewport(true);
    //关闭一些不用的按钮。
    refMenuWindow.button("minmax1").hide();
    refMenuWindow.button("park").hide();
    refMenuWindow.button("stick").hide();
    refMenuWindow.button("sticked").hide();
    refMenuWindow.show();

    var refMenuLayout = new dhtmlXLayoutObject(refMenuWindow,"4I");

    refMenuLayout.cells("b").setText('<table style="table-layout: fixed;width: '+refMenuLayout.cells("b").getWidth()+'px;margin-top: -5px"><tbody><tr>'+
                                     '<td style="width: 20%" align="left"><span style="font-size: 12px;font-weight: bold;">菜单数据</span></td>'+
                                     '<td  align="right" style="width:10%"><div style="background-color: #64B201;height: 12px;width: 12px;"></div></td>'+
                                     '<td  align="left" style="width:30%">新增关联菜单</td>'+
                                     '<td  align="right" style="width:10%"><div style="background-color: #CCCCCC;height: 12px;width: 12px;"></div></td>'+
                                     '<td align="left"  style="width:30%" >删除关联菜单</td></tr>'+
                                     '</tbody></table>');
    refMenuLayout.cells("c").setText('<table style="table-layout: fixed;width: '+refMenuLayout.cells("b").getWidth()+'px;margin-top: -5px"><tbody><tr>'+
                                     '<td style="width: 30%" align="left"><span style="font-size: 12px;font-weight: bold;">权限按钮</span></td>'+
                                     '<td  align="right" style="width:6%"><div style="background-color: #64B201;height: 12px;width: 12px;"></div></td>'+
                                     '<td  align="left" style="width:29%">新增按钮</td>'+
                                     '<td  align="right" style="width:6%"><div style="background-color: #CCCCCC;height: 12px;width: 12px;"></div></td>'+
                                     '<td align="left"  style="width:29%" >删除按钮</td></tr>'+
                                     '</tbody></table>');
    refMenuLayout.cells("a").setHeight(20);
    refMenuLayout.cells("a").fixSize(true, true);
    refMenuLayout.cells("a").hideHeader();
    refMenuLayout.cells("d").setHeight(20);
    refMenuLayout.cells("d").hideHeader();
    refMenuLayout.cells("b").fixSize(true, true);
    refMenuLayout.cells("c").fixSize(true, true);
    refMenuLayout.cells("d").fixSize(true, true);
    var queryform = refMenuLayout.cells("a").attachForm([
        {type:"settings",position: "label-left", labelWidth: 60},
        {type:"select",label:"所属系统：",name:"belongSys",inputWidth: 120} ,
        {type:"newcolumn"},
//        {type:"button",name:"query",value:"查询",offsetLeft:5},
        {type:"hidden",name:"userId",value:rowId}
    ]);

    var buttonForm = refMenuLayout.cells("d").attachForm([
        {type:"settings",position: "label-left", labelWidth: 70, inputWidth: 120},
        {type:"button",value:"确定",name:"execute",offsetLeft:(winWidth/2-70),offsetTop:5},
        {type:"newcolumn"},
        {type:"button",value:"关闭",name:"close",offsetTop:5}
    ]);

    //加载元素所属系统下拉数据
    var sysInit = false;
    dwrCaller.executeAction("querySystem",function(data){
        Tools.addOption(queryform.getSelect("belongSys"),data);
        systemId= queryform.getItemValue("belongSys");
        sysInit = true;
    })
    var loadMenuParam = new biDwrMethodParam();//loadMenu Action参数设置。
    //定义loadMen Action的参数来源于表单queryform数据。
    loadMenuParam.setParamConfig([
        {
            index:0,type:"fun",value:function(){
            return queryform.getItemValue("belongSys");
        }
        },{
            index:1,type:"static",value:rowId
        }
    ]);

    var modifyStyle = {
        add:"font-weight:bold;color:#64B201;",
        remove:"font-weight:bold;color:#CCCCCC",
        clear:"font-weight:normal;font-style::normal;text-decoration:none;color:black;border-bottom:0px;"
    };
    /**
     * 添加查询Action:loadMenu
     */
    dwrCaller.addAutoAction("loadMenu",RoleAction.queryMenuTreeData,loadMenuParam,function(data){
//        $("_belongSystemLabel").innerHTML = queryform.getItemText("belongSys");
        dhx.closeProgress();
        systemId= queryform.getItemValue("belongSys");
    });
    dwrCaller.addDataConverter("loadMenu",menuTreeDataConverter);

    var tree = refMenuLayout.cells("b").attachTree();
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableThreeStateCheckboxes(true);
    tree.enableSmartCheckboxes(false);
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.enableCheckBoxes(true);
    var loadTreeData=function(){
        if(sysInit){
            var childs = tree.getSubItems(0);
            if(childs){
                var childIds = (childs + "").split(",");
                for(var i = 0; i < childIds.length; i++){
                    tree.deleteItem(childIds[i]);
                }
            }
            tree.loadJSON(dwrCaller.loadMenu);
        } else{
            setTimeout(arguments.callee ,10);
        }
    }
    var refreshButtonGrid=function(id){
        var menuData=tree.getUserData(id,"menuData");
        var data=[];
        data.push(menuData.pageButton);
        data.push(menuData.excludeButton);
        data.push(menuData);
        refMenuGrid.clearAll();
        refMenuGrid.parse(buttonConverter.convert(data),"json");
        var checked= tree._idpull[id].checkstate;
        if(!checked){
            refMenuGrid.setColumnHidden(0,true);
        }else{
            refMenuGrid.setColumnHidden(0,false);
        }
        exclude[menuData.menuId]&&(exclude[menuData.menuId]._checked_mark=checked);
    }
    tree.attachEvent("onCheck", function(id,state){
        tree.openAllItems(id);
        refreshButtonGrid(id);
    });
    loadTreeData();

    var refMenuGrid = refMenuLayout.cells("c").attachGrid();
    refMenuGrid.setHeader("{#checkBox},按钮名称,");
    refMenuGrid.setHeaderBold();
    refMenuGrid.setInitWidthsP("8,92,42");
    refMenuGrid.setColAlign("center,left,left");
    refMenuGrid.setHeaderAlign("center,center,left");
    refMenuGrid.setColTypes("ch,ro,ro");
    refMenuGrid.enableCtrlC();
    refMenuGrid.setColSorting("na,na,na");
    refMenuGrid.enableMultiselect(true);
    refMenuGrid.enableSelectCheckedBoxCheck(2);
    refMenuGrid.setColumnHidden(2,true);
    refMenuGrid.init();

    tree.attachEvent("onClick",function(id){
        refreshButtonGrid(id);
    });
    var add={}, remove={},exclude={};//新增关联菜单数据、移除关联菜单数据、排除菜单按钮数据。均以MENU_ID为主键，新增和删除的关联以menuData为value
    refMenuGrid.attachEvent("onCellChanged", function(rId,cInd,nValue){
        var excluteButton=refMenuGrid.cells(rId,2).getValue();
        if(cInd==0&&excluteButton){
            var menuId=refMenuGrid.getUserData(rId,"menuId");
            var orgexcludes=refMenuGrid.getUserData(rId,"excludeButton")||"";
            var orgexclude=orgexcludes.split(",");
            exclude[menuId]=exclude[menuId]||{};
            //拷贝原来的排除按钮集
            if(Tools.isEmptyObject(exclude[menuId])){
                if(orgexclude&&orgexclude.length>0){
                    for(var i=0;i<orgexclude.length;i++){
                        exclude[menuId][orgexclude[i]]=orgexclude[i];
                        exclude[menuId]._select_mark=true;//此标记代表有变更记录。
                    }
                }
            }
            refMenuGrid.setRowTextStyle(rId,modifyStyle.clear);
            if(nValue==0){
                exclude[menuId][excluteButton]=excluteButton;
                if(orgexcludes.indexOf(excluteButton)==-1){//原来无，新增
                    refMenuGrid.setRowTextStyle(rId,modifyStyle.remove);
                }
            }else { //选择了一个按钮，代表用户有此按钮权限，则反向的就是排除按钮中删除此按钮
                exclude[menuId][excluteButton]=null;
                delete exclude[menuId][excluteButton];
                if(orgexcludes.indexOf(excluteButton)!=-1){//原来有，删除
                    refMenuGrid.setRowTextStyle(rId,modifyStyle.add);
                }
            }
        }
    });
    //转换器dataFormat
    buttonConverter.cellDataFormat=function(rowIndex,columnIndex,columnName,cellValue,rowData){
        var menuId=this.menuData.menuId;
        if(columnName=="checked"){
            if(exclude[menuId]){
                return !!!exclude[menuId][rowData.enName];
            }else {
                this.exclude=this.exclude||"";
                return this.exclude.indexOf(rowData.enName)==-1;
            }
            return 0;
        }else{
            if(exclude[menuId]){
                if(exclude[menuId][rowData.enName]){
                    if((this.menuData.excludeButton||"").indexOf(rowData.enName)==-1){
                        //无，新增
                        return {style:modifyStyle.remove,value:cellValue};
                    }
                }
                else{
                    if((this.menuData.excludeButton||"").indexOf(rowData.enName)!=-1){
                        //无,删除
                        return {style:modifyStyle.add,value:cellValue};
                    }
                }
            }
        }
        return cellValue;
    }
    //排除的按钮以选择的buttons为value
    /**
     * 当树选择一个checkbox框的数据处理与样式处理操作。
     * @param id
     */
    var whenTreeCheck=function(id){
        var stateDeal=function(menuID){
            var menuData=tree.getUserData(menuID,"menuData");
            var state= tree._idpull[menuID].checkstate;
            if(menuData.checked==state||(menuData.checked==1&&state==2)){//如果原来的状态与现有状态吻合,则不算新增也不算移除
                add[menuID]=null;
                delete add[menuID];
                remove[menuID]=null;
                delete remove[menuID];
                tree.setItemStyle(menuID,modifyStyle.clear);
            }else{
                if(state){//算作新增
                    add[menuID]=menuData;
                    remove[menuID]=null;
                    delete remove[menuID];
                    tree.setItemStyle(menuID,modifyStyle.add);
                }else{//算作删除
                    add[menuID]=null;
                    delete add[menuID];
                    remove[menuID]=menuData;
                    tree.setItemStyle(menuID,modifyStyle.remove);
                }
            }
        }
        var scanIds=[id];
        //寻找ID所有子节点
        var subIds=tree.getAllSubItems(id);
        if(subIds){
            scanIds=scanIds.concat(subIds.split(","));
        }
        //加入所有父节点
        var parId=tree.getParentId(id);
        while(parId){
            scanIds.push(parId);
            parId=tree.getParentId(parId);
        }
        for(var i=0;i<scanIds.length;i++){
            stateDeal(scanIds[i]);
        }
    }
    tree.attachEvent("onCheck",function(id,state){
        whenTreeCheck(id);
    });
    tree.attachEvent("onSelect", function(id){
        whenTreeCheck(id);
    });
    //转换器加入默认选中逻辑
    menuTreeDataConverter.addItemConfig=function(rowIndex,rowData){
        var checked=rowData.checked;
        var menuId=rowData.menuId;
        var style=modifyStyle.clear;
        if(add[menuId]){
            style=modifyStyle.add;
            checked=1;
        }else if(remove[menuId]){
            style=modifyStyle.remove;
            checked=0;
        }
        return {checked:checked,style:style};
    }
    queryform.attachEvent("onButtonClick", function(id){
        if(id == "query"){
            loadTreeData();
        }
    });
    queryform.getSelect("belongSys").onchange=function(){
        loadTreeData();
    };
    /**
     * 获取修正数据，数据结构如下：addRefMenu:[menId1,menuId2....]..//权限表示，-1代表由原关联权限获取到的菜单，>-1表示完全新增的菜单}..],新增关联的菜单
     * removeRefMenu：[menuId1,menuId2...]//删除关联的菜单。
     * excludeButtons:[{menuId,excludeButton:}...]//修改的排除菜单权限。这里只对已经选中的菜单才能有排除菜单按钮权限的操作。
     */
    var getData=function(){
        var result={};
        //获取新增的关联菜单。
        if(!Tools.isEmptyObject(add)){
            var addMenus=[];
            for(var key in add){
                addMenus.push(parseInt(key));
            }
            result.addRefMenu=addMenus;
        }
        //获取删除关联的菜单
        if(!Tools.isEmptyObject(remove)){
            var deleteMenus=[];
            for(var key in remove){
                deleteMenus.push(parseInt(key));
            }
            result.removeRefMenu=deleteMenus;
        }
        //获取按钮变更权限的变更数据
        if(!Tools.isEmptyObject(exclude)){
            var excludeButtons=[];
            for(var menuId in exclude){
                if(exclude[menuId]._checked_mark!=0){
                    var temp={};
                    temp.menuId=menuId;
                    temp.excludeButton="";
                    for(var key in exclude[menuId]){
                        if(key=="_checked_mark"||key=="_select_mark"){
                            continue;
                        }
                        temp.excludeButton=(temp.excludeButton?temp.excludeButton+",":"")+key;
                    }
                    excludeButtons.push(temp);
                }
            }
            if(excludeButtons.length>0){
                result.excludeButtons=excludeButtons;
            }
        }
        return result;
    }

    var submit=function(data){
        dwrCaller.executeAction("insertRefMenu",data,rowId,function(rs){
            if(rs){
                dhx.alert("提交成功！");
            }else{
                dhx.alert("提交失败！");
            }
        });
    }
    buttonForm.attachEvent("onButtonClick", function(id){
        if(id == "execute"){
            var data=getData();
            if(Tools.isEmptyObject(data)){
                dhx.alert("您没有修改关联菜单，不能提交！");
            }else{
                dhx.confirm("是否保存更改？",function(r){
                    if(r){
                        submit(data);
                        dhxWindow._removeWindowGlobal(refMenuWindow);
                    }
                })
            }
        }else if(id=="close"){
            refMenuWindow.close();
        }
    });
    refMenuWindow.attachEvent("onClose",function(win){
        var data=getData();
        if(Tools.isEmptyObject(data)){
            return true;
        }else{
            dhx.messageBox({
                buttons:[{id:"save",text:"保存",callback:function(){
                    submit(data);
                    dhxWindow._removeWindowGlobal(win);
                    dhxWindow.unload();
                }},{id:"notSave",text:"不保存",callback:function(){
                    dhxWindow._removeWindowGlobal(win);
                    dhxWindow.unload();
                }},
                    {id:"cancel",text:"取消" }],
                message:"您有数据未提交，是否保存？"
            });
            return false;//不关闭窗口，根据逻辑判断再决定是否关闭窗口
        }
    });
    refMenuLayout.hideConcentrate();//隐藏缩放按钮
}

// 加载地域树、岗位数、部门树
dwrCaller.addAutoAction("loadDeptTree", "DeptAction.queryDeptByPath");
var treeConverter = new dhtmxTreeDataConverter({
    idColumn:"deptId",pidColumn:"parentId",
    userData:function(rowIndex, rowData) {
        return {menuData:rowData};
    },
    isDycload:false,textColumn:"deptName"
});
dwrCaller.addDataConverter("loadDeptTree", treeConverter);
//树动态加载Action
dwrCaller.addAction("querySubDept", function(afterCall, param) {
    var tempCovert = dhx.extend({isDycload:true}, treeConverter, false);
    DeptAction.querySubDept(param.id, function(data) {
        data = tempCovert.convert(data);
        afterCall(data);
    })
});
/**
 * 部门树input框Html。
 * @param selectDept 已经选择了的部门。
 */
var loadDeptTree = function(selectDept, form) {
    //加载部门树数据。加载用户所在部门及其子部门。
    selectDept = selectDept || global.constant.defaultRoot;
    var beginId = (user.userId == global.constant.adminId ? global.constant.defaultRoot : user.deptId)
            || global.constant.defaultRoot;
    //创建tree Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target = form.getInput("dept");
    target.readOnly = true;
    //生成树
    var tree = new dhtmlXTreeObject(div, div.style.width, div.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableThreeStateCheckboxes(true);
//    tree.enableSmartRendering();
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubDept);
    //树双击鼠标事件
    tree.attachEvent("onDblClick", function(nodeId) {
        form.setFormData({dept:tree.getItemText(nodeId),deptId:nodeId});
        //关闭树
        div.style.display = "none";
    });
    dwrCaller.executeAction("loadDeptTree", beginId, selectDept, function(data) {
        tree.loadJSONObject(data);
        if (selectDept) {
            tree.selectItem(selectDept); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "click", function() {
            div.style.width = (target.offsetWidth + 100) + 'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display = "block";
        })
    })
}

dwrCaller.addAutoAction("loadStationTree", "StationAction.queryStationByPath");
var stationConverter = dhx.extend({idColumn:"stationId",pidColumn:"parStationId",
    textColumn:"stationName"
}, treeConverter, false);
dwrCaller.addDataConverter("loadStationTree", stationConverter);
//树动态加载Action
dwrCaller.addAction("querySubStation", function(afterCall, param) {
    var tempCovert = dhx.extend({isDycload:true}, stationConverter, false);
    StationAction.querySubStation(param.id, function(data) {
        data = tempCovert.convert(data);
        afterCall(data);
    })
});

/**
 * 岗位input输入框Html
 * @param name
 * @param value
 */
var loadStationTree = function(selectStation, form) {
    //加载部门树数据。加载用户所在部门及其子部门。
    selectStation = selectStation || global.constant.defaultRoot;
    var beginId = (user.userId == global.constant.adminId ? global.constant.defaultRoot : user.stationId)
            || global.constant.defaultRoot;
    //创建tree Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target = form.getInput("station");
    target.readOnly = true;

    //生成树
    var tree = new dhtmlXTreeObject(div, div.style.width, div.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableThreeStateCheckboxes(true);
//    tree.enableSmartRendering();
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubStation);
    //树双击鼠标事件
    tree.attachEvent("onDblClick", function(nodeId) {
        form.setFormData({station:tree.getItemText(nodeId),stationId:nodeId});
        //关闭树
        div.style.display = "none";
    });
    dwrCaller.executeAction("loadStationTree", beginId, selectStation, function(data) {
        tree.loadJSONObject(data);
        if (selectStation) {
            tree.selectItem(selectStation); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "click", function() {
            div.style.width = (target.offsetWidth + 100) + 'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display = "block";
        })
    })
}

dwrCaller.addAutoAction("loadZoneTree", "ZoneAction.queryZoneByPath");
var zoneConverter = dhx.extend({idColumn:"zoneId",pidColumn:"zoneParId",
    textColumn:"zoneName"
}, treeConverter, false);
dwrCaller.addDataConverter("loadZoneTree", zoneConverter);
//树动态加载Action
dwrCaller.addAction("querySubZone", function(afterCall, param) {
    var tempCovert = dhx.extend({isDycload:true}, zoneConverter, false);
    ZoneAction.querySubZone(param.id, function(data) {
        data = tempCovert.convert(data);
        afterCall(data);
    })
});
/**
 * 地域树加载
 * @param name
 * @param value
 */
var loadZoneTree = function(selectZone, form) {
    //加载部门树数据。加载用户所在部门及其子部门。
    selectZone = selectZone || global.constant.defaultRoot;
    var beginId = (user.userId == global.constant.adminId ? global.constant.defaultRoot : user.zoneId)
            || global.constant.defaultRoot;
    //创建tree Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target = form.getInput("zone");
    target.readOnly = true;

    //生成树
    var tree = new dhtmlXTreeObject(div, div.style.width, div.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableThreeStateCheckboxes(true);
//    tree.enableSmartRendering();
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubZone);
    //树双击鼠标事件
    tree.attachEvent("onDblClick", function(nodeId) {
        form.setFormData({zone:tree.getItemText(nodeId),zoneId:nodeId});
        //关闭树
        div.style.display = "none";
    });
    dwrCaller.executeAction("loadZoneTree", beginId, selectZone, function(data) {
        tree.loadJSONObject(data);
        if (selectZone) {
            tree.selectItem(selectZone); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "click", function() {
            div.style.width = (target.offsetWidth + 100) + 'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display = "block";
        })
    })
}

dwrCaller.addAutoAction("queryRefDeptStation", "RoleAction.queryRefDeptStation");

/**
 * 岗位和部门grid 自定义生成模板。
 * @param name
 * @param value
 */
var deptStationTemplate = function(name, value) {
    if (value == "update") {//当为update时，为update初始化表单，此时不用渲染，等调用setformData时生成此html
        return "";
    }
    //自定义生成一个表格,风格类似Dhtmlx Grid，该表格有三列。岗位、部门、操作。
    var headData = ['部门','岗位','操作'];
    var width = ['40%','40%','20%'];//表格宽度
    //生成表顶层DIV 节点。
    var top = dhx.html.create("div", {style:"border: 0px; width: 100%;cursor: default;border-color:#a4bed4",id:"_topDiv"});
    top.className = global.css.gridTopDiv;
//    top.style.height = "310px";
    //生成表头DIV节点
    var headDiv = dhx.html.create("div", {
        style:"width: 100%; overflow-x: hidden; overflow-y: hidden; position: relative; height: 26px;border-collapse: separate; border-spacing: 2px;"
//        class:global.css.gridHeadDiv  import!!!此种写法IE7、IE6 拒不接受
    });

    headDiv.className=global.css.gridHeadDiv;
    top.appendChild(headDiv);
    //生成表头。
    var headTable = dhx.html.create("table");
    headDiv.appendChild(headTable);
    //生成一个Tbody
    var headTbody = dhx.html.create("tbody");
    headTable.appendChild(headTbody);
    //循环遍历生成表头TR
    var tr = dhx.html.create("tr");
    for (var i = 0; i < headData.length; i++) {
        //生成表头TD
        var td = dhx.html.create("td", {width:width[i],style:"text-align:center;"
                +(i==0?"border-left-color: #A4BED4;":(i==2?"border-right-color: #A4BED4;":""))}, headData[i]);
        tr.appendChild(td);
    }
    headTbody.appendChild(tr);
    //对表头进行样式设置
    headTable.cellSpacing = 0;
    headTable.cellPadding = 0;
    headTable.style.width = "100%";
    headTable.className = global.css.gridHeadTable;

    var tableData = (value ? [] : null);
    //构建表体
    //表内容DiV
    var contentDiv = dhx.html.create("div", {
        style:"overflow: auto; width: 100%;height:150px;"
//        class:global.css.gridContentDiv
    });
    contentDiv.className=global.css.gridContentDiv;
    top.appendChild(contentDiv);

    //生成表体。
    var contentTable = dhx.html.create("table");
    contentTable.style.height = "auto";
    contentTable.style.overflow = "auto";
    contentDiv.appendChild(contentTable);
    //生成一个Tbody
    var contentTbody = dhx.html.create("tbody", {id:"_contentTbody"});
    contentTable.appendChild(contentTbody);
    //表内容样式设置
    contentTable.cellSpacing = 0;
    contentTable.cellPadding = 0;
    contentTable.className = global.css.gridContentTable;
    contentTable.style.width = "100%";

    //已经选择了的数据。
    selectData = {}; //将其设置为全局变量，用于保存选择的部门和岗位数据。
    var validateInputIds = {};//需要验证的input元素。
    /**
     * 添加一行
     * @param deptId
     * @param stationId
     */
    var addRow = function(body, deptId, deptName, stationId, stationName, afterRow) {
        var rowId = "_row_" + deptId + stationId;
        if ($(rowId)) {
            return;
        }
        var tr = dhx.html.create("tr", {id:rowId,style:"height:22px"});//行节点
        if (deptId && stationId) {
            selectData[rowId] = {deptId:parseInt(deptId),stationId:parseInt(stationId)};
        }
        //创建部门Td，
        var td = document.createElement("td");
        td.style.cssText = "text-align:center;border-left-color: #A4BED4;";
        td.width = width[0];
        if (deptId) {
            td.innerText = deptName;
        } else {//新增一个input框。
            var tdDiv = document.createElement("div");
            tdDiv.style.cssText = "position: relative; width: 100%; height: 100%; overflow-x: auto; overflow-y: auto; font-size: 13px;";
            tdDiv.className = "dhxlist_obj_dhx_skyblue";
            td.appendChild(tdDiv);
            //输入一个input框
            var inputId = "_de_inputpt_" + deptId + stationId;
            var input = document.createElement("input");
            input.className = "dhxlist_txt_textarea";
            input.name = "roleName";
            input.type = "text";
            input.style.width="120px";
            input.readOnly = true;
            input.id = inputId;
            tdDiv.appendChild(input);
            //新增一个图片按钮
            //var imgdeptId="_input_img_dept_"+ deptId + stationId;
            //var img=dhx.html.create("img",{id:imgdeptId,src:getBasePath()+"/meta/resource/images/edit_add.png",style:"padding-top:1px;height:16px;width:16px;margin-left:2px"});
            //tdDiv.appendChild(img);
            if (stationId) {
                validateInputIds[inputId] = {deptId:deptId,deptName:deptName,
                    stationId:stationId,stationName:stationName};
            }
            //添加一个事件处理，用于显示部门树。
            //这么设置事件的原因是因为最终返回的是一段HTML代码，所有在节点上面直接添加的事件都会没有效果。
            setTimeout(//设置定时器，用于节点渲染完成之后加入点击事件处理，显示部门树。
                    function() {
                        if ($(inputId)) {
                            if (stationId) {
                                dhtmlxValidation.addValidation($(inputId), "NotEmpty");
                            }
                            Tools.addEvent($(inputId), "click", function() {
                                showDeptTree($(inputId), deptTree, function(data) {
                                    if (data.length > 0) {//选择了部门。
                                        var inputDatas = validateInputIds[inputId] ? validateInputIds[inputId] : Tools.EmptyObject;
                                        //依次添加到指定节点之后。
                                        for (var i = 0; i < data.length; i++) {
                                            addRow($('_contentTbody'), data[i].id, data[i].text,
                                                    inputDatas.stationId, inputDatas.stationName, $(rowId));
                                        }
                                        if (!!stationId) {
                                            //存在岗位Id，需删除原来的Td
                                            removeRow(undefined, stationId);
                                        }
                                    }
                                },stationId?true:false);
                            })
                        }
                    }, 100)
        }
        tr.appendChild(td);
        //创建岗位TD
        td = dhx.html.create("td", {width:width[1],style:"text-align:center"});
        if (stationId) {
            td.innerText = stationName;
        } else {//新增
            var stationTdDiv = document.createElement("div");
            stationTdDiv.style.cssText = "position: relative; width: 100%; height: 100%; overflow-x: auto; overflow-y: auto; font-size: 13px;textAlign:left";
            stationTdDiv.className = "dhxlist_obj_dhx_skyblue";
            td.appendChild(stationTdDiv);
            //输入一个input框
            var stationInputId = "_input_station_" + deptId + stationId;
            var stationInput = document.createElement("input");
            stationInput.className = "dhxlist_txt_textarea";
            stationInput.name = "roleName";
            stationInput.type = "text";
            stationInput.style.width="120px";
            stationInput.readOnly = true;
            stationInput.id = stationInputId;
            stationTdDiv.appendChild(stationInput);
            //新增一个图片按钮
            //var imgStationId="_input_img_station_"+ deptId + stationId;
            //var img=dhx.html.create("img",{id:imgStationId,src:getBasePath()+"/meta/resource/images/edit_add.png",style:"padding-top:1px;height:16px;width:16px;margin-left:2px"});
            //stationTdDiv.appendChild(img);
            if (deptId) {
                validateInputIds[stationInputId] = {deptId:deptId,deptName:deptName,
                    stationId:stationId,stationName:stationName};
            }
            //添加一个事件处理，用于显示部门树。
            //这么设置事件的原因是因为最终返回的是一段HTML代码，所有在节点上面直接添加的事件都会没有效果。
            setTimeout(//设置定时器，用于节点渲染完成之后加入点击事件处理，显示部门树。
                    function() {
                        if ($(stationInputId)) {
                            if (deptId) {
                                dhtmlxValidation.addValidation($(stationInputId), "NotEmpty");
                            }
                            Tools.addEvent($(stationInputId), "click", function() {
                                showStationTree($(stationInputId), stationTree, function(data) {
                                    if (data.length > 0) {//选择了部门。
                                        //依次添加到指定节点之后。
                                        var inputDatas = validateInputIds[stationInputId] ? validateInputIds[stationInputId] : Tools.EmptyObject;
                                        for (var i = 0; i < data.length; i++) {
                                            addRow($('_contentTbody'), inputDatas.deptId,
                                                    inputDatas.deptName, data[i].id, data[i].text, $(rowId));
                                        }
                                        if (!!deptId) {
                                            //存在岗位Id，需删除原来的Td
                                            removeRow(deptId, undefined);
                                        }
                                    }
                                },deptId?true:false);
                            });
                        }
                    }, 100)
        }
        tr.appendChild(td);
        //创建操作Cell
        //创建一个image 节点
        td = dhx.html.create("td", {width:width[2],style:"text-align:center;vertical-align: top;"});
        td.innerHTML = '<div style="width: 16px;height: 16px" ></div>';
        if (deptId || stationId) {
            var imgId = "_image_" + deptId + stationId;
            td.innerHTML = '<img style="width: 16px;height: 16px" id=' + imgId + ' src=' + getBasePath() + '/meta/resource/images/cancel.png>';
            //为删除按钮设置事件相应。
            setTimeout(function() {
                if ($(imgId)) {
                    $(imgId).onclick = function() {
                        removeRow(deptId, stationId);
                    }
                }
            }, 200)
        }
        tr.appendChild(td);
        afterRow = afterRow ? afterRow.nextSibling : afterRow;
        //加到table中
        if (afterRow) {
            body.insertBefore(tr, afterRow);
        } else {
            body.appendChild(tr);
        }

    }
    /**
     * 删除一行
     * @param deptId
     * @param stationId
     */
    var removeRow = function(deptId, stationId) {
        var rowId = "_row_" + deptId + stationId;
        var inputId = "_de_inputpt_" + deptId + stationId;
        var stationInputId = "_input_station_" + deptId + stationId;
        var row = $(rowId);
        if (row) {
            row.parentNode.removeChild(row);
            selectData[rowId] = null;
            delete selectData[rowId];
            validateInputIds[inputId] = null;
            delete validateInputIds[inputId];
            validateInputIds[stationInputId] = null;
            delete validateInputIds[stationInputId];
        }
    };
    var that = this;
    //设置Value,和dhtmlx Form组件融合
    setTimeout(function() {
        //覆盖默认验证机制
        $("_topDiv").parentNode.parentNode.parentNode.validate = function() {
            var r = true;
            for (var i in validateInputIds) {
                r = dhtmlxValidation.validate($(i)) && r
            }
            return r;
        }
    }, 100);
    addRow(contentTbody);//新增一个空的在表格前面一直存在。
    if (value) {//value 如果不为null，表示的是一个角色ID，查询数据库，访问其关联的部门与岗位
        dwrCaller.executeAction("queryRefDeptStation", parseInt(value), function(data) {
            tableData = new columnNameConverter().convert(data);
            for (var i = 0; i < tableData.length; i++) {
                addRow($('_contentTbody'), tableData[i].deptId, tableData[i].deptName,
                        tableData[i].stationId, tableData[i].stationName);
            }
        })
    }
    return top.outerHTML;
}

/***
 * 新增修改角色 部门岗位树...
 */

/**
 * 部门树input框Html。
 * @param selectDept 已经选择了的部门。
 */
var selectDeptTree = function() {
    //加载部门树数据。加载用户所在部门及其子部门。
    var beginId = (user.adminFlag == 1 ? global.constant.defaultRoot : user.deptId)
            || global.constant.defaultRoot;
    //创建tree Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 190px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000;background-color:white",id:'_deptDiv'
    });
    document.body.appendChild(div);
    //创建tree div
    var treeDiv = dhx.html.create("div", {
        style:"position:relative;height: 150px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    div.appendChild(treeDiv);
    //创建一个按钮div层
    var buttonDiv = dhx.html.create("div", {
        style:"position:relative;border: 1px #eee solid;height: 30px;overflow: auto;padding-top:0px;margin-top: 6px;" +
              "z-index:1000;padding-left:80px"
    })
    div.appendChild(buttonDiv);

//生成树
    var tree = new dhtmlXTreeObject(treeDiv, treeDiv.style.width, treeDiv.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableCheckBoxes(true);
    tree.enableThreeStateCheckboxes(0);
    tree.enableHighlighting(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubDept);
    div.style.display = "none";
    var that = this;

    //创建一个button
    var button = Tools.getButtonNode("确定",getBasePath()+'/meta/resource/images/ok.png');
    button.style.marginTop="5px";
//    button.type = "button";
//    button.value = "确定";
    buttonDiv.appendChild(button);
    //button响应函数，利用回调调用具体的事件相应
    button.onclick = function() {
        if (that.buttonClick) {
            var checkedData = [];
            var allChecked = tree.getAllChecked();
            if (allChecked) {
                var nodes = typeof allChecked == "string" ? allChecked.split(",") : [allChecked];
                for (var i = 0; i < nodes.length; i++) {
                    checkedData.push({id:nodes[i],text:tree.getItemText(nodes[i])});
                }
            }
            that.buttonClick.call(that, checkedData);
        }
        div.style.display = "none";
    }
    this.tree = tree;
    this.getCheckedNode = function() {
        return tree.getAllChecked();
    }
    dwrCaller.executeAction("loadDeptTree", beginId, 0, function(data) {
        tree.loadJSONObject(data);
        /* var parents=tree.getSubItems(0);
         if(parents){
         parents=(parents+"").split(",");
         for(var i=0;i<parents.length;i++){
         tree.disableCheckbox(parents[i],1);
         }
         }*/
    })
}

/**
 * 显示部门树
 * @param target 激发显示树的input对象。
 * @param callBack 双击树产生的回调函数，如果不设置，默认为设值动作。
 * @param radio：是否单选。
 */
var showDeptTree = function(target, deptTree, callBack,radio) {
    $('_stationDiv').style.display="none";
    var div = $('_deptDiv');
    //清空选择
    var allChecked = deptTree.tree.getAllChecked();
    if (allChecked) {
        var nodes = typeof allChecked == "string" ? allChecked.split(",") : [allChecked];
        for (var i = 0; i < nodes.length; i++) {
            deptTree.tree.setCheck(nodes[i], 0);
        }
    }
    div.style.width = (target.offsetWidth + 100) + 'px';
    Tools.divPromptCtrl(div,target,true,0,200);
    if(radio){//是否为单选模式
        deptTree.tree.enableAllRadios(0,true);
    }else{
        deptTree.tree.enableAllRadios(0,false);
    }
    deptTree.buttonClick = callBack;
}

/**
 * 岗位input输入框Html
 * @param name
 * @param value
 */
var selectStationTree = function() {
    //加载岗位树数据。加载用户所在部门及其子部门。
    var beginId = (user.adminFlag == 1 ? global.constant.defaultRoot : user.stationId)
            || global.constant.defaultRoot;
    //创建tree Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 190px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000;background-color:white",id:'_stationDiv'
    });
    document.body.appendChild(div);
    //创建tree div
    var treeDiv = dhx.html.create("div", {
        style:"position:relative;height: 150px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    div.appendChild(treeDiv);
    //创建一个按钮div层
    var buttonDiv = dhx.html.create("div", {
        style:"position:relative;border: 1px #eee solid;height: 30px;overflow: auto;padding-top:0px;margin-top: 6px;" +
              "z-index:1000;padding-left:80px"
    });
    div.appendChild(buttonDiv);
    //生成树
    var tree = new dhtmlXTreeObject(treeDiv, treeDiv.style.width, treeDiv.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableCheckBoxes(true);
    tree.enableThreeStateCheckboxes(0);
    tree.enableHighlighting(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubStation);
    div.style.display = "none";
    var that = this;
    //创建一个button
    var button = Tools.getButtonNode("确定",getBasePath()+'/meta/resource/images/ok.png');
    button.style.marginTop="5px";
//    button.type = "button";
//    button.value = "确定";
    buttonDiv.appendChild(button);
    //button响应函数，利用回调调用具体的事件相应
    button.onclick = function() {
        if (that.buttonClick) {
            var checkedData = [];
            var allChecked = tree.getAllChecked();
            if (allChecked) {
                var nodes = typeof allChecked == "string" ? allChecked.split(",") : [allChecked];
                for (var i = 0; i < nodes.length; i++) {
                    checkedData.push({id:nodes[i],text:tree.getItemText(nodes[i])});
                }
            }
            that.buttonClick.call(that, checkedData);
        }
        div.style.display = "none";
    }
    this.tree = tree;
    dwrCaller.executeAction("loadStationTree", beginId, 0, function(data) {
        tree.loadJSONObject(data);
    });
}

/**
 * 显示岗位树
 * @param target 激发显示树的input对象。
 * @param callBack 双击树产生的回调函数，如果不设置，默认为设值动作。
 * @param radio：是否为单选模式。
 */
var showStationTree = function(target, stationTree, callBack,radio) {
    $('_deptDiv').style.display="none";
    var div = $('_stationDiv');
    //清空选择
    var allChecked = stationTree.tree.getAllChecked();
    if (allChecked) {
        var nodes = typeof allChecked == "string" ? allChecked.split(",") : [allChecked];
        for (var i = 0; i < nodes.length; i++) {
            stationTree.tree.setCheck(nodes[i], 0);
        }
    }
    div.style.width = (target.offsetWidth + 100) + 'px';
    Tools.divPromptCtrl(div,target,true,0,200);
    if(radio){//是否为单选模式
        stationTree.tree.enableAllRadios(0,true);
    }else{
        stationTree.tree.enableAllRadios(0,false);
    }
    stationTree.buttonClick = callBack;
}





dhx.ready(roleInit);