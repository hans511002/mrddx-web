/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        user.js
 *Description：
 *       用户维护模块所有JS
 *Dependent：
 *       dhtmlx.js，dwr 有关JS，dhtmxExtend.js。。。
 *Author: 刘斌
 *
 *Finished：
 *       2011-09-23-10-51
 *Modified By：
 *
 *Modified Date:
 *
 *Modified Reasons:

 ********************************************************/

/**
 * 页面初始化。
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var user= getSessionAttribute("user");
var loadUserParam=new biDwrMethodParam();//loaduser Action参数设置。
//TODO 用于审核成功后传过来的参数
var userNamecn= userNamecn;
var systemId=1;//用户关联菜单默认的系统代码

/**
 * 定义全局的部门、岗位、地域树
 */
var globDeptTree=null;
var globStationTree = null;
var globZoneTree = null;


/**
 * Role表Data转换器
 */
var roleConvertConfig = {
    idColumnName:"roleId",
    filterColumns:["isChecked","roleName","roleDesc","mggrantFlag","mgmagFlag"],
    onBeforeConverted:function(data){
	//return data;
    }
}
var roleDataConverter=new dhtmxGridDataConverter(roleConvertConfig);

/**
 * User表Data转换器
 */
var userConvertConfig = {
    idColumnName:"userId",
    filterColumns:["","userNamecn","userEmail","stateName","zoneName","deptName","stationName","headShip","_buttons","userNameen","userMobile"],
    /**
     * 覆盖父类方法：数据转换
     * @param rowIndex
     * @param rowData
     */
    userData:function(rowIndex,rowData){
        var userData ={};
        if(rowData["createDate"] != null){
            userData["createDate"]=rowData["createDate"];
        } else {
            userData["createDate"]="";
        }
        if(rowData["oaUserName"] != null){
            userData["oaUserName"]=rowData["oaUserName"];
        } else {
            userData["oaUserName"]="";
        }
        userData.deptId=rowData.deptId;
        userData.stationId=rowData.stationId;
        userData.zoneId=rowData.zoneId;
        userData.groupId=rowData.groupId;
        userData.vipFlag=rowData.vipFlag;
        userData.state = rowData.state;
        //userData.userNameen = rowData.userNameen;
        //alert(rowData);
        return userData;
    },
    /**
     * 获取下拉框Button的值
     * @param rowIndex
     * @param columnIndex
     * @param cellValue
     * @param rowData
     */
    cellDataFormat:function( rowIndex,  columnIndex,columnName,  cellValue,rowData) {
        if(columnName == "_buttons"){//如果是第10列。即操作按钮列
            return "getRoleButtonsCol";
        }
        return this._super.cellDataFormat(rowIndex, columnIndex, columnName,cellValue, rowData);
    }

}
var userDataConverter=new dhtmxGridDataConverter(userConvertConfig);

var userRoleConvertConfig = {
    idColumnName:"roleId",
    filterColumns:["","roleName",
        "grantFlag","magFlag","mggrantFlag","mgmagFlag"],
    userData:function(rowIndex,rowData){
        return {roleDesc:rowData.roleDesc};
    },     cellDataFormat:function( rowIndex,  columnIndex,columnName,  cellValue,rowData) {
        if(columnName == "magFlag"){
            if(rowData["mgmagFlag"] == 0){
                return {type:"ro",value:""}
            }

        }
        if(columnName == "grantFlag"){
            if(rowData["mgmagFlag"] == 0){
                return {type:"ro",value:""}
            }
        }
        return this._super.cellDataFormat(rowIndex, columnIndex, columnName,cellValue, rowData);
    }
}
var userRoleDataConverter=new dhtmxGridDataConverter(userRoleConvertConfig);
/**
 * 构造dwrCaller
 */
var dwrCaller = new biDwrCaller({
    querySystem:{methodName:"UserAction.queryMenuSystem"
        ,converter:new dhtmlxComboDataConverter({
            valueColumn:"groupId",textColumn:"groupName",isAdd:true
        })},
//    loadSubMenu:{methodName:"UserAction.querySubMenu",converter:menuTreeDataConverter},
    update:function(afterCall, param){}
});

/**
 * 用户页面初始化方法
 */
var userInit=function(){
    var userLayout = new dhtmlXLayoutObject(document.body,"2E");
    userLayout.cells("a").setText("用户维护");
    userLayout.cells("b").hideHeader(true);
    userLayout.cells("a").setHeight(100);
    userLayout.cells("a").fixSize(false,true);
    userLayout.hideConcentrate();
    userLayout.hideSpliter();//移除分界边框。
    //加载查询表单
    var queryform = userLayout.cells("a").attachForm([

        {type: "block", list:[
            {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 120,labelLeft:0 ,
                inputLeft:0,offsetTop:0},
            {type:"input",label:"姓名：",name:"userName",inputHeight:17,inputWidth:150,validate:"MaxLength[20]"},
            {type:"newcolumn"},
            {type:"combo",label:"状态：",name:"userState",inputWidth: 150,
                className:"combo",readonly:"readonly",options:[
                {value:"-1",text:"全部",selected:true}
            ]} ,
            {type:"newcolumn"},
            {type:"input",label:"地域：",name:"zone",inputHeight:17,inputWidth: 150}
        ]},
        {type: "block", list:[
            {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 120,labelLeft:0 ,
                inputLeft:0,offsetTop:0},
            {type:"input",label:"部门：",name:"dept",inputHeight:17,inputWidth: 150},
            {type:"newcolumn"},
            {type:"input",label:"岗位：",name:"station",inputHeight:17,inputWidth:150},
            {type:"newcolumn"},
            {type:"button",name:"query",value:"查询",offsetLeft:45,offsetTop:3}
        ]}
    ]);
    //给form 表单的  userState 的combo 对象赋值
    var userStateData = getComboByRemoveValue("USER_STATE");
    queryform.getCombo("userState").addOption(userStateData.options);

    queryform.getCombo("userState").readonly(true,false);
    queryform.getCombo("userState").attachEvent("onBlur",function(){
        queryform.getCombo("userState").closeAll();
    });

    if(userNamecn != null){
        queryform.setValue("userName",userNamecn);
    }

    queryform.defaultValidateEvent();
    //定义loadUser Action的参数来源于表单queryform数据。
    loadUserParam.setParamConfig([{
        index:0,type:"fun",value:function(){
            var data=queryform.getFormData();
            //alert(queryform.getItemValue("zoneId"));
            if(data.zoneId == null || data.zoneId ==""){
                data.zoneId=user.zoneId.toString();
            }
            return data;
        }
    }]);
    loadUserParam.setParamConfig([
        {
            index:0,type:"fun",value:function(){
            var formData=queryform.getFormData();
            if(formData.zoneId == null || formData.zoneId ==""){
                formData.zoneId=user.zoneId.toString();
            }
            formData.userName=Tools.trim(queryform.getInput("userName").value);
            return formData;   //结果为map,与caller联合使用,在dwr的调用方法中,方法中的参数与这里对应
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
    var base=getBasePath();

    var buttons={
        applyUser:{name:"applyUser",text:"申请",imgEnabled:base+"/meta/resource/images/addUser.png",
            imgDisabled:base+"/meta/resource/images/addUser.png",onclick:function(rowData){
                applyUser();
            }},
        modifyUser:{name:"modifyUser",text:"修改",imgEnabled:base+"/meta/resource/images/editUser.png",
            imgDisabled:base+"/meta/resource/images/editUser.png",onclick:function(rowData){
                modifyUser(rowData.id);
            }},
        deleteUser:{name:"deleteUser",text:"删除所选",imgEnabled:base+"/meta/resource/images/removeUser.png",
            imgDisabled :base+"/meta/resource/images/removeUser.png",onclick:function(rowData){
                if((rowData.data[1]).toString()==(user.userNamecn).toString()){
                    dhx.alert("用户本身不能删除自己！");
                    return;
                }
                deleteUser(rowData.id);
            }},
        startUser:{name:"startUser",text:"启用所选",imgEnabled:base+"/meta/resource/images/auditUser.png",
            imgDisabled :base+"/meta/resource/images/auditUser.png",onclick:function(rowData){
                if(rowData.data[5]==2){
                    dhx.alert("该用户未通过审核，不能启用！");
                    return;
                }
                startUser(rowData.id);
            }},
        disableUser:{name:"disableUser",text:"禁用所选",imgEnabled:base+"/meta/resource/images/disableUser.png",
            imgDisabled :base+"/meta/resource/images/disableUser.png",onclick:function(rowData){
                if((rowData.data[1]).toString()==(user.userNamecn).toString()){
                    dhx.alert("用户本身不能禁用自己！");
                    return;
                }
                disableUser(rowData.id);
            }},
        refRole:{name:"refRole",text:"关联角色",imgEnabled:base+"/meta/resource/images/addRole.png",
            imgDisabled :base+"/meta/resource/images/addRole.png",onclick:function(rowData){
                if(rowData.data[5]==0){
                    dhx.alert("该用户被禁用，不能关联角色！");
                    return;
                }else if(rowData.data[5]==2){
                    dhx.alert("该用户未通过审核，不能关联角色！");
                    return;
                }
                refRole(rowData.id);
            }},
        refMenu:{name:"refMenu",text:"关联菜单",imgEnabled:base + "/meta/resource/images/menu.png",
            imgDisabled :base + "/meta/resource/images/menu.png",onclick:function(rowData) {
                if(rowData.data[5]==0){
                    dhx.alert("该用户被禁用，不能关联菜单！");
                    return;
                }else if(rowData.data[5]==2){
                    dhx.alert("该用户未通过审核，不能关联菜单！");
                    return;
                }
                refMenu(rowData.id);
            }},
        initPwd:{name:"initPwd",text:"密码重置",imgEnabled:base + "/meta/resource/images/menu.png",
            imgDisabled :base + "/meta/resource/images/menu.png",onclick:function(rowData) {
                initPwd(rowData.id);
            }}
    };

    // 按钮权限过滤,checkRule.
//    var buttonRole=["applyUser","auditUser","modifyUser","deleteUser","startUser","disableUser","refRole","refMenu"];
//    var buttonRole = getRoleButtons();
    var buttonRole=["modifyUser","deleteUser","startUser","disableUser","refRole","refMenu","initPwd"];
    var bottonRoleRow = [];
    for(var i=0; i<buttonRole.length; i++){
        if(buttonRole[i]=="deleteUser"||buttonRole[i]=="disableUser"
                || buttonRole[i]=="startUser"){
            bottonRoleRow.push(buttonRole[i]);
        }
    }

    var buttonRoleCol = [];
    for(var i=0; i<buttonRole.length; i++){
        if(buttonRole[i]!="applyUser"){//操作列不加入新增按钮
            buttonRoleCol.push(buttonRole[i]);
        }
    }
    //getRoleButtonsCol
    window["getRoleButtonsCol"]=function(rowId,cellId){
        var rowdata = mygrid.getRowData(rowId);
        var res=[];
        if(rowdata.userdata.state == 1){
            for(var i=0;i<buttonRoleCol.length;i++){
                if(buttonRoleCol[i]=="deleteUser"){
                    buttons["deleteUser"].text="删除";
                    res.push(buttons["deleteUser"])
                }else if(buttonRoleCol[i]=="disableUser"){
                    buttons["disableUser"].text="禁用";
                    res.push(buttons["disableUser"])
                }else if(buttonRoleCol[i]=="startUser"){
                    buttons["startUser"].text="启用";
                    //res.push(buttons["startUser"])
                }else{
                    res.push(buttons[buttonRoleCol[i]]);
                }

            }
        }else{
            for(var i=0;i<buttonRoleCol.length;i++){
                if(buttonRoleCol[i]=="deleteUser"){
                    buttons["deleteUser"].text="删除";
                    res.push(buttons["deleteUser"])
                }else if(buttonRoleCol[i]=="disableUser"){
                    buttons["disableUser"].text="禁用";
                    //res.push(buttons["disableUser"])
                }else if(buttonRoleCol[i]=="startUser"){
                    buttons["startUser"].text="启用";
                    res.push(buttons["startUser"])
                }else{
                    res.push(buttons[buttonRoleCol[i]]);
                }

            }
        }

        return res;
    };
    //定义全局函数，用于获取有权限的button列表定义
    window["getButtons"]=function(){
        var res=[];
        for(var i=0;i<bottonRoleRow.length;i++){
            res.push(buttons[bottonRoleRow[i]]);
        }
        return res;
    };



    var buttonToolBar=userLayout.cells("b").attachToolbar();
    var pos=1;
    var filterButton=window["getButtons"]();
    for(var i=0;i<filterButton.length;i++){
        buttonToolBar.addButton(filterButton[i].name,pos++,filterButton[i].text,
                filterButton[i].imgEnabled,filterButton[i].imgDisabled);
        var button=buttonToolBar.getItemNodeById(filterButton[i].name);
        button.setAttribute("id",filterButton[i].name);
    }

    dwrCaller.addAutoAction("loadUser", "UserAction.queryUser", loadUserParam,

            function(data){
//            alert(data);
            }
    );
    dwrCaller.addDataConverter("loadUser",userDataConverter);
    //添加datagrid
    mygrid= userLayout.cells("b").attachGrid();
    mygrid.setHeader("{#checkBox},<span style='font-weight: bold;'>姓名</span>," +
                     "<span style='font-weight: bold;'>邮箱</span>,<span style='font-weight: bold;'>状态</span>," +
                     "<span style='font-weight: bold;'>地域</span>,<span style='font-weight: bold;'>部门</span>,<span style='font-weight: bold;'>岗位</span>," +
                     "<span style='font-weight: bold;'>职务</span>,<span style='font-weight: bold;'>操作</span>");
    mygrid.setInitWidthsP("2.5,8,16,8,9,9,7,7,"+(window.screen.width>1024?"32":"50"));
    mygrid.setColAlign("center,left,left,center,left,left,left,left,left");
    mygrid.setHeaderAlign("center,center,center,center,center,center,center,center,center");
    mygrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,sb");
    mygrid.setColSorting("na,na,na,na,na,na,na,na,na");
//    mygrid.enableResizing("true,true,true,true,true,true,true,true,true,true,true");
    mygrid.setEditable(true);
//    mygrid.setColumnCustFormat(5,userState);//第5列进行转义
    mygrid.enableMultiselect(true);
    mygrid.enableCtrlC();
    mygrid.setColumnIds("'',userNamecn,userEmail,stateName,zoneName,deptName,stationName,headShip,target");
    //隐藏显示tooltip
    mygrid.enableTooltips("true,true,true,true,true,true,true,true,false,true");
    mygrid.enableSelectCheckedBoxCheck(1);
    mygrid.init();
    mygrid.defaultPaging(20);
//    mygrid.showRowNumber();//显示行号
    mygrid.load(dwrCaller.loadUser,"json");

    //添加buttonToolBar事件
    buttonToolBar.attachEvent("onclick",function(id){
        if(id=="applyUser"){//申请用户
            applyUser();
        }
        if(id == "modifyUser"){//修改用户
            var selecteddRowId= mygrid.getCheckedRows(0);
            if(selecteddRowId == null || selecteddRowId==""){
                dhx.alert("请选择一行进行修改!");
                return ;
            }else if(selecteddRowId.split(",").length>1){
                dhx.alert("只能选择一行进行修改!");
                return ;
            }else{
                modifyUser(selecteddRowId);
            }
        }
        if(id == "deleteUser"){//删除用户
            var selecteddRowId= mygrid.getCheckedRows(0);
            if(selecteddRowId == null || selecteddRowId==""){
                dhx.alert("请选择至少一行进行删除!");
                return ;
            }else{
                deleteUser(selecteddRowId);
            }
        }
        if(id == "startUser"){
            var selecteddRowId= mygrid.getCheckedRows(0);
            if(selecteddRowId == null || selecteddRowId==""){
                dhx.alert("请选择至少一行数据!");
                return ;
            }else{
                for(var i=0; i<selecteddRowId.split(",").length; i++){
                    var rowData=mygrid.getRowData(selecteddRowId.split(",")[i]);
                    if(rowData.data[5]==2){
                        dhx.alert("您选择了待审核的用户，不能启用！")
                        return;
                    }
                }

                startUser(selecteddRowId);
            }
        }
        if(id == "disableUser"){//禁用用户
            var selecteddRowId= mygrid.getCheckedRows(0);
            if(selecteddRowId == null || selecteddRowId==""){
                dhx.alert("请选择至少一行数据!");
                return ;
            }else{
                disableUser(selecteddRowId);
            }
        }
        if(id == "refRole"){//关联角色
            var selecteddRowId= mygrid.getCheckedRows(0);
            if(selecteddRowId == null || selecteddRowId==""){
                dhx.alert("请选择一行进行设置!");
                return ;
            }else if(selecteddRowId.split(",").length>1){
                dhx.alert("只能选择一行进行设置!");
                return ;
            }else{
                refRole(selecteddRowId);
            }
        }
        if(id == "refMenu"){//关联菜单
            var selecteddRowId= mygrid.getCheckedRows(0);
            if(selecteddRowId == null || selecteddRowId==""){
                dhx.alert("请选择一行进行设置!");
                return ;
            }else if(selecteddRowId.split(",").length>1){
                dhx.alert("只能选择一行进行设置!");
                return ;
            }else{
                refMenu(selecteddRowId);
            }
        }

    })


    //查询表单事件处理
    queryform.attachEvent("onButtonClick", function(id){
        if(id=="query"){
            //进行数据查询。
            if(queryform.validate()){
                mygrid.clearAll();
                mygrid.load(dwrCaller.loadUser,"json");
            }
        }
    });
    queryform.getInput("userName").onkeypress=function(e){
        e=e||window.event;
        var keyCode=e.keyCode;
        if(keyCode==13){
            mygrid.clearAll();
            mygrid.load(dwrCaller.loadUser, "json");
        }
    }


}

/**
 * 申请用户
 */
var applyUser=function(){
    var dhxWindow=new dhtmlXWindows();
    dhxWindow.createWindow("applyWindow",0,0,400,220);
    var applyWindow=dhxWindow.window("applyWindow");
    applyWindow.setModal(true);
    applyWindow.stick();
    applyWindow.setDimension(400,220);
    applyWindow.center();
    applyWindow.denyResize();
    applyWindow.denyPark();
    //关闭一些不用的按钮。
    applyWindow.button("minmax1").hide();
    applyWindow.button("park").hide();
    applyWindow.button("stick").hide();
    applyWindow.button("sticked").hide();
    applyWindow.setText("申请用户");
    applyWindow.keepInViewport(true);
    applyWindow.show();

    //建立表单。
    var applyForm=applyWindow.attachForm(applyUserFormData);
    //添加验证
    applyForm.defaultValidateEvent();
    //加载部门树
    loadDeptTree(null,applyForm);
    //加载地域树
    loadZoneTree(null,applyForm);
    //加载岗位树
    loadStationTree(null,applyForm);
    //添加表单处理事件
    applyForm.attachEvent("onButtonClick",function(id){
        if(id=="save"){//保存
            applyForm.send(dwrCaller.applyUser);
        }else if (id=="reset"){//重置
            applyForm.clear();
        }else if(id=="close"){
            applyWindow.close();
        }
    });

    //关闭Window事件
    applyWindow.attachEvent("onClose", function(win){
        applyForm.clear();
        dhxWindow.unload();
    })

    /**
     * 注册申请用户事件
     */
    dwrCaller.addAction("applyUser", function(afterCall,param){
        UserAction.applyUser(param,function(data){
            if(data.type=="error"||data.type=="invalid"){
                dhx.alert("对不起，申请出错，请重试！");
            }else if(data.sid==-1){
                dhx.alert("申请出错，邮箱地址已存在！");
            } else {
                dhx.alert("申请成功");
                applyWindow.close();
//                applyForm.clear();
//                dhxWindow.unload();
                //新增之后刷新页面
                mygrid.updateGrid(userDataConverter.convert(data.successData),"insert");
            }
        });
    });

}

/**
 * 修改用户
 * @param rowId
 */
var modifyUser=function(rowId){
    var dhxWindow=new dhtmlXWindows();
    dhxWindow.createWindow("modifyWindow",0,0,520,300);
    var modifyWindow=dhxWindow.window("modifyWindow");
    modifyWindow.setModal(true);
    modifyWindow.stick();
    modifyWindow.setDimension(520,270);
    modifyWindow.center();
    modifyWindow.denyResize();
    modifyWindow.denyPark();
    modifyWindow.setText("修改用户");
    modifyWindow.keepInViewport(true);
    //关闭一些不用的按钮。
    modifyWindow.button("minmax1").hide();
    modifyWindow.button("park").hide();
    modifyWindow.button("stick").hide();
    modifyWindow.button("sticked").hide();
    modifyWindow.show();

    //建立表单。
    var modifyForm=modifyWindow.attachForm(modifyUserFormData);
    //添加验证
    modifyForm.defaultValidateEvent();

    var userData=mygrid.getRowData(rowId);//获取行数据
    //初始化表单数据
    modifyForm.getCombo("groupId").readonly(true,false);
    modifyForm.getCombo("groupId").attachEvent("onBlur",function(){
        modifyForm.getCombo("groupId").closeAll();
        return false;
    });
//    modifyForm.getCombo("state").readonly(true,false);
//    modifyForm.getCombo("state").attachEvent("onBlur",function(){
//        modifyForm.getCombo("state").closeAll();
//        return false;
//    });
    modifyForm.getCombo("groupId").loadXML(dwrCaller.querySystem, function(){
        if(userData.userdata.groupId != null){
            modifyForm.setFormData({groupId:userData.userdata.groupId});
        }else{
            modifyForm.setFormData({groupId:""});
        }
    });
    //alert(userDate.userdata.userNameen);
    var initForm=function(){
        var initData={
            userNamecn:userData.data[1],//用户中文名
            userNameen:userData.data[9],//用户拼音
            userMobile:userData.data[10],//用户电话
            userEmail:userData.data[2], //用户邮箱
            createDate:userData.userdata.createDate, //建立日期
            headShip:userData.data[7], //职务
//            state:userData.data[5],//状态有效
            userId:userData.id,
            autoRight:2,//默认手动添加权限
            vipFlag:userData.userdata.vipFlag
        }
        dhx.extend(initData,userData.userdata);
        modifyForm.setFormData(initData);
    }
    //加载部门树
    loadDeptTree(userData.userdata.deptId,modifyForm);
    //加载地域树
    loadZoneTree(userData.userdata.zoneId,modifyForm);
    //加载岗位树
    loadStationTree(userData.userdata.stationId,modifyForm);
    initForm();
    /**
     * 添加 onButtonClick 事件
     */
    modifyForm.attachEvent("onButtonClick",function(id){
        if(id=="save"){//保存
            modifyForm.send(dwrCaller.modifyUser);
        }else if (id=="reset"){//重置
            modifyForm.clear();
            initForm();
            modifyForm.setFormData({zone:globZoneTree.getItemText(userData.userdata.zoneId),zoneId:userData.userdata.zoneId});
            modifyForm.setFormData({dept:globDeptTree.getItemText(userData.userdata.deptId),deptId:userData.userdata.deptId});
            modifyForm.setFormData({station:globStationTree.getItemText(userData.userdata.stationId),stationId:userData.userdata.stationId});
            if(userData.userdata.groupId != null){
                modifyForm.setFormData({groupId:userData.userdata.groupId});
            }else{
                modifyForm.setFormData({groupId:""});
            }
        }else if(id=="close"){
            modifyWindow.close();
        }
    });
    //关闭Window事件
    modifyWindow.attachEvent("onClose", function(win){
        modifyForm.clear();
        dhxWindow.unload();
    })

    /**
     * 注册DWR
     */
    dwrCaller.addAction("modifyUser", function(afterCall,param){
        UserAction.modifyUser(param,function(data){
            if(data.type=="error"||data.type=="invalid"){
                dhx.alert("对不起，修改出错，请重试！");
            }else if(data.sid==-1){
                dhx.alert("修改失败，邮箱地址已存在！");
            }else if(data.sid==-2){
                dhx.alert("修改失败，用户名已存在！");
            }else if(data.sid==-3){
                dhx.alert("修改失败，OA登录名已存在！");
            }else{
                dhx.alert("修改成功");
                modifyWindow.close();
//                modifyForm.clear();
//                dhxWindow.unload();
                //新增之后及时刷新页面
                mygrid.updateGrid(userDataConverter.convert(data.successData),"update");
            }
        })
    });
}

/**
 * 添加事件查询改用户已经关联的角色名称和菜单名称
 */
dwrCaller.addAutoAction("getRefRoleNamesAndMenuNames", "UserAction.getRefRoleNamesAndMenuNames",
        function(data){
            var initRefData={
                refMenuNames:data[1],
                refRoleNames:data[0]
            }
            referenceForm.setFormData(initRefData);
        }
);
/**
 * 将初始化角色菜单表单写为全局变量，用于各关联功能调用
 * @param rowId 用户ID
 */
var initReferenceForm=function(rowId){

    var userData=mygrid.getRowData(rowId);//获取行数据
    var initData={
        // 添加已存在的用户对应菜单角色信息、用户对应菜单信息
        userNamecn:userData.data[1],//用户中文名
        userMobile:userData.data[3],//用户电话
        userEmail:userData.data[4], //用户邮箱
//            state:userData.data[5],//状态有效
        userId:userData.id,
        zone:userData.data[6],
        dept:userData.data[7],
        station:userData.data[8]
    }
    dhx.extend(initData,userData.userdata);
    referenceForm.setFormData(initData);
    //查询已经关联的角色名称以及菜单名称
    dwrCaller.executeAction("getRefRoleNamesAndMenuNames",{userId:rowId});
}

//添加加载权限事件
dwrCaller.addAutoAction("loadRefRole", "UserAction.loadRefRoleByRoleId");
dwrCaller.addDataConverter("loadRefRole",roleDataConverter);
//当对象或者数据只有一个元素时，不用取出子元素，以对象或者数组格式传参。
dwrCaller.isDealOneParam("loadRefRole",false);

//添加加载用户-角色关联列表事件
dwrCaller.addAutoAction("queryUserRole", "UserAction.queryUserRole");
dwrCaller.addDataConverter("queryUserRole",userRoleDataConverter);
//当对象或者数据只有一个元素时，不用取出子元素，以对象或者数组格式传参。
dwrCaller.isDealOneParam("queryUserRole",false);

//关联角色DWR方法
dwrCaller.addAutoAction("refRole","UserAction.refRole");
//当对象或者数据只有一个元素时，不用取出子元素，以对象或者数组格式传参。
dwrCaller.isDealOneParam("refRole",false);
/**
 * 角色菜单功能点。
 * @param rowId
 */
var refRole=function(userId){
    var dhxWindow=new dhtmlXWindows();
    var winSize=Tools.propWidthDycSize(10,20,10,10);
    winSize.width=winSize.width<780?780:winSize.width;
    dhxWindow.createWindow("referenceWindow", 0, 0, winSize.width, 500);
    var referenceWindow=dhxWindow.window("referenceWindow");
    referenceWindow.setModal(true);
    referenceWindow.stick();
    referenceWindow.setDimension(winSize.width,winSize.height);
    referenceWindow.center();
    referenceWindow.denyResize();
    referenceWindow.denyPark();

    referenceWindow.keepInViewport(true);
    //关闭一些不用的按钮。
    referenceWindow.button("minmax1").hide();
    referenceWindow.button("park").hide();
    referenceWindow.button("stick").hide();
    referenceWindow.button("sticked").hide();
    referenceWindow.show();
    var refUserLayout = new dhtmlXLayoutObject(referenceWindow, "2E");
    refUserLayout.cells("a").hideHeader();
    refUserLayout.cells("b").hideHeader();
    refUserLayout.cells("b").setHeight(30);
    refUserLayout.cells("a").fixSize(true,true);
    refUserLayout.cells("b").fixSize(true,true);
    refUserLayout.hideConcentrate();
    refUserLayout.hideSpliter();//移除分界边框。
    //建立一个DIV，最高为body高度，当超过body高度时，用滚动条。
    var winDiv=document.createElement("div");
    winDiv.style.height="100%";
    winDiv.style.width="100%";
    /**
     * 拥有角色Template
     * @param name
     * @param value
     */
    var roleTemplate=function(name,value){
        return "<div style='height:100%;;background-color:white;overflow:hidden;' id='_roleGrid'></div>"
    }
    var refRoleTemplate=function(name,value){
        return "<div style='height:100%;background-color:white;overflow:hidden;' id='_roleRefGrid'></div>"
    }
    var operTemplate=function(){
        return "<div style='width:40px;' id='_oper'><img id='_rightMove' title='右移' style='width: 20px;height: 20px;margin-left: 10px;margin-top:20px' " +
               "src="+getBasePath()+"/meta/resource/images/arrow_right.png alt='右移'>" +
               "<br/><img id='_allRightMove' title='全部右移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 10px' " +
               "src="+getBasePath()+"/meta/resource/images/arrow_right_double.png alt='当前页全部右移'>" +
               "<br/><img id='_leftMove' title='左移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 10px' " +
               "src="+getBasePath()+"/meta/resource/images/arrow_left.png alt='左移'>"+
               "<br/><img id='_allLeftMove' title='全部左移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 10px' " +
               "src="+getBasePath()+"/meta/resource/images/arrow_left_double.png alt='当前页全部左移'></div>";
    }
    /**
     * 角色菜单关联表单
     */
    var referenceFormData=[
        {type:"block",className:"zero",width:winSize.width-40,offsetLeft:winSize.width*0.02,height:winSize.height*0.1-50,list:[
            {
                type:"fieldset",label:"角色列表",width:(winSize.width-118)/2,offsetLeft:0,labelWidth:0,list:[
//                {type:"block",list:[
//                	{type:"input",label:"角色名称：",name:"roleName",inputWidth: 120},
//                	{type:"newcolumn"},
//                	{type:"button",name:"query",value:"查询"}
//                ]},

                {type:"template",name:"role",className:"zero",format:roleTemplate}
            ]},
            {type:"newcolumn"},
            { type:"template",name:"oper",format:operTemplate},
            {type:"newcolumn"},
            {
                type:"fieldset",label:"已选择角色",width:(winSize.width-118)/2,list:[
                {type:"template",name:"refRole",format:refRoleTemplate}
            ]
            }
        ]},
        {type:"hidden",label:"userId"},
        {type:"hidden",label:"roleIdStr"},
        {type:"hidden",label:"menuIdStr"}]
    //建立表单。
    var referenceForm=new dhtmlXForm(winDiv,referenceFormData);
    refUserLayout.cells("a").attachObject(winDiv);
    $("_roleRefGrid").style.marginLeft="-" + 1 + "px";
    $("_roleGrid").style.marginLeft="-" + 1 + "px";
    $("_roleRefGrid").style.width=((winSize.width-118)/2)+"px";
    $("_roleGrid").style.width=((winSize.width-118)/2)+"px";
    $("_roleRefGrid").style.height=(winSize.height-140)+"px";
    $("_roleGrid").style.height=(winSize.height-140)+"px";
    $("_oper").style.marginTop=($("_roleGrid").offsetHeight/2-40)+"px";
    //初始化表单数据

    var initData;
    var initForm=function(){
        var userData=mygrid.getRowData(userId);//获取行数据
        initData={
            userNamecn:userData.data[1],//用户中文名
            userMobile:userData.data[3],//用户电话
            userId:userData.id,
            userEmail:userData.data[4],
            zone:userData.data[6],
            station:userData.data[8],
            dept:userData.data[7]
        }
        dhx.extend(initData,userData.userdata);
        referenceForm.setFormData(initData);
    }
    initForm();
    referenceWindow.setText("姓名：" + initData.userNamecn + " , 地域：" +initData.zone +" , 部门：" + initData.dept);
    //DWR参数封装。
    var biParam=new biDwrMethodParam();
    biParam.setParam(0,{userId:userId});
    //生成角色列表的table。



    //修改对齐样式。
    $("_roleGrid").parentNode.parentNode.parentNode.parentNode.parentNode.style.padding="0px";
    //生成权限列表表格。
    var refRoleGrid=new dhtmlXGridObject("_roleGrid");
    refRoleGrid.setHeader("{#checkBox},角色名称,角色描述");
    refRoleGrid.attachHeader("#rspan,<div id='role_input'><input type='text' id='roleNameId' style='width: 90%; border:1px solid gray;' onClick='(arguments[0]||window.event).cancelBubble=true;' onKeyUp='filterBy()'></div>" +
                             ",<div ></div>");
    refRoleGrid.setHeaderBold();
    refRoleGrid.setInitWidthsP("10,40,50,0,0");
    refRoleGrid.setColAlign("center,left,left,left");
    refRoleGrid.setHeaderAlign("center,center,center,left");
    refRoleGrid.setColTypes("ch,ro,ro,ro");
    refRoleGrid.setColSorting("na,na,na,na");
    refRoleGrid.enableMultiselect(true);
    refRoleGrid.enableSelectCheckedBoxCheck(1);
    refRoleGrid.enableCtrlC();
//    refRoleGrid.setColumnIds("isChecked,roleName,roleDesc");
    refRoleGrid.setColumnHidden(3);
    refRoleGrid.setColumnHidden(4);
    refRoleGrid.init();
    refRoleGrid.load(dwrCaller.loadRefRole+biParam,"json");
    //refRoleGrid.defaultPaging(10,false);

    //用户已关联权限列表
    //关联关系列表
    $("_roleRefGrid").parentNode.parentNode.parentNode.parentNode.parentNode.style.padding="0px";
//    referenceForm.getInput("userNamecn").parentNode.parentNode.parentNode.style.lineHeight="1em";
    var refGrid=new dhtmlXGridObject("_roleRefGrid");
    refGrid.setHeader("{#checkBox},角色名称,授予权限,管理权限");
    refGrid.setHeaderBold();
    refGrid.setInitWidthsP("10,40,25,25,0,0");
    refGrid.setColAlign("center,left,center,center,center");
    refGrid.setHeaderAlign("center,center,left,left,left");
    refGrid.setColTypes("ch,ro,ch,ch,ro");
    refGrid.setColSorting("na,na,na,na,ro");
    refGrid.enableCtrlC();
    refGrid.enableMultiselect(true);
    refGrid.enableSelectCheckedBoxCheck(1);
    refGrid.setColumnHidden(4);
    refGrid.setColumnHidden(5);
    refGrid.setColumnIds("", "roleName", "grantFlag", "magFlag");
    refGrid.init();
    refGrid.loadXML(dwrCaller.queryUserRole+biParam,"json");
    // refGrid.defaultPaging(10,false);
    var leftAdd={},rightAdd={},update={}; //分别表示左边grid新增的数据，右边表格新增的数据，右边表格修改的数据。

    /**
     * 将选择的角色移动至右边。
     * @param flag  当其为true时，表示将查询出的角色当前页全部右移。当为true时，表示只移动选择的数据。
     */
    var moveRight=function(flag){
        var del=[];
        if(flag){
            for(var i in refRoleGrid.rowsBuffer){
                if(!refRoleGrid.rowsBuffer[i]||typeof refRoleGrid.rowsBuffer[i]=="function"){
                    continue;
                }
                var rowId=refRoleGrid.getRowId(i);
                var rowData=refRoleGrid.getRowData(rowId);
                var mggrantFlag = 0;
                if(move(refRoleGrid,refGrid,{rows:[{id:rowId,data:[0,rowData.data[1],0,0]
                    ,userdata:{roleDesc:rowData.data[2]}}]},leftAdd,rightAdd,rowId)){
                    del.push(rowId);
                }
                if(parseInt(rowData.data[4]) == 0){
                	refGrid.setCellExcellType(ids[i],2,"ro");
                    refGrid.setCellExcellType(ids[i],3,"ro");
                    refGrid.cells(ids[i],2).setValue("");
                    refGrid.cells(ids[i],3).setValue("");
                }


            }
        }else{
            var ids=refRoleGrid.getCheckedRows(0);
            if(ids){
                ids=ids.split(",");
                for(var i=0;i<ids.length;i++){
                    var rowData=refRoleGrid.getRowData(ids[i]);
                    if(move(refRoleGrid,refGrid,{rows:[{id:ids[i],data:[0,rowData.data[1],0,0]
                        ,userdata:{roleDesc:rowData.data[2]}}]},leftAdd,rightAdd,ids[i])){
                        del.push(ids[i]);
                    }

                if(parseInt(rowData.data[4]) == 0){
                    refGrid.setCellExcellType(ids[i],2,"ro");
                    fGrid.setCellExcellType(ids[i],3,"ro");
                    refGrid.cells(ids[i],2).setValue("");
                    refGrid.cells(ids[i],3).setValue("");
                }
                }
            }
        }
        //最后删除需要删除的行
        for(var key=0;key<del.length;key++){
            refRoleGrid.deleteRow(del[key]);
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
                if(move(refGrid,refRoleGrid,
                        {rows:[{id:rowId,data:[0,rowData.data[1],rowData.userdata.roleDesc]}]},rightAdd,leftAdd,rowId)){
                    del.push(rowId);
                }
            }
        }else{
            var ids=refGrid.getCheckedRows(0);
            if(ids){
                ids=ids.split(",");
                for(var i=0;i<ids.length;i++){
                    var rowData=refGrid.getRowData(ids[i]);
                    if(move(refGrid,refRoleGrid,
                            {rows:[{id:ids[i],data:[0,rowData.data[1],rowData.userdata.roleDesc]}]},rightAdd,leftAdd,ids[i])){
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
    /**
     * 标记删除、新增、改变的样式集合
     */
    var styles={
        inserted:"font-weight:bold;color:#64B201;",
        deleted:"text-decoration : line-through;font-style: italic;color: #808080;",
        change_cell:"border-bottom:2px solid red;",
        clear:"font-weight:normal;font-style::normal;text-decoration:none;color:black;"
    };
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
    //为两个表格添加鼠标双击事件,双击时进行选择或者是取消选择。
    refRoleGrid.attachEvent("onRowDblClicked",function(rowId,cInd){
        if(!rightAdd[rowId]){//右边没有，进行选择
            var rowData=refRoleGrid.getRowData(rowId);
            if(move(refRoleGrid,refGrid,{rows:[{id:rowId,data:[0,rowData.data[1],0,0]
                ,userdata:{roleDesc:rowData.data[2]}}]},leftAdd,rightAdd,rowId)){
                refRoleGrid.deleteRow(rowId);
            }
                if(parseInt(rowData.data[4]) == 0){
                    refGrid.setCellExcellType(rowId,2,"ro");
                    refGrid.setCellExcellType(rowId,3,"ro");
                    refGrid.cells(rowId,2).setValue("");
                    refGrid.cells(rowId,3).setValue("");
                }

        }else{//左边已选择，进行取消选择
            var rowData=refGrid.getRowData(rowId);
            if(move(refGrid,refRoleGrid,
                    {rows:[{id:rowId,data:[0,rowData.data[1],rowData.userdata.roleDesc]}]},rightAdd,leftAdd,rowId)){
                refGrid.deleteRow(rowId);
            }
        }
    });
    refGrid.attachEvent("onRowDblClicked",function(rowId,cInd){
        if(!leftAdd[rowId]){//左边没有，移动至左边
            var rowData=refGrid.getRowData(rowId);
            if(move(refGrid,refRoleGrid,
                    {rows:[{id:rowId,data:[0,rowData.data[1],rowData.userdata.roleDesc]}]},rightAdd,leftAdd,rowId)){
                refGrid.deleteRow(rowId);
            }
        }else{
            var rowData=refRoleGrid.getRowData(rowId);
            if(move(refRoleGrid,refGrid,{rows:[{id:rowId,data:[0,rowData.data[1],0,0]
                ,userdata:{roleDesc:rowData.data[2]}}]},leftAdd,rightAdd,rowId)){
                refRoleGrid.deleteRow(rowId);
            }
        }

    });
    //添加单元格改变事件，用于记录修改的数据。
    refGrid.attachEvent("onCheck",function(rId,cInd,nValue,isClick){
        isClick=(undefined||isClick==null)?true:isClick;  //是否由点击事件调用，默认为true
        if(!rightAdd[rId]&&!leftAdd[rId]&&(cInd==2||cInd==3)){//如果是新增或者是已删除的数据，不用关心。
            var oldValue1=refGrid.getRowData(rId).data[2]?1:0;
            var oldValue2=refGrid.getRowData(rId).data[3]?1:0;
            if(update[rId]&&update[rId].magFlag==oldValue1&&update[rId].grandFlag==oldValue2){
                update[rId]=null;
                delete update[rId];
            }else{
                update[rId]={roleId:rId,userId:userId,
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
            if(parseInt(refGrid.cells(rId,2).getValue())!=parseInt(nValue?1:0) && nValue == 1){
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

    //做数据保存操作。
    var save=function(userId){
        /*页面选择数据，其数据结构为：{
         {
         add:[{roleId:,userId:,magFlag:,grandFlag:},{}...],
         del:{roleIds:"213,232,123,213,...",userId:}
         update:[{roleId:,userId:,magFlag:,grandFlag:},{}...]
         }
         */
        var data={};//最终要传送给后台的数据结构。
        data["userId"] = userId;
        if(!Tools.isEmptyObject(rightAdd)){
            //右边新增的数据即为要关联的数据。
            data.add=[];
            for(var key in rightAdd){
            	var magFlag=parseInt(refGrid.cells(key,3).getValue());
            	var grandFlag = parseInt(refGrid.cells(key,2).getValue());
                data.add.push({roleId:key,userId:userId,magFlag:magFlag||0,grandFlag:grandFlag||0});
            }
        }
        if(!Tools.isEmptyObject(leftAdd)){
            //左边新增的数据即为取消的关联。
            data.del={};
            for(var key in leftAdd){
                data.del.userId=userId;
                data.del.roleIds=(data.del.roleIds||"")+key+",";
            }
            //去除最后一个"，"
            data.del.roleIds= data.del.roleIds.substr(0,data.del.roleIds.length-1);
        }
        //修改的数据
        if(!Tools.isEmptyObject(update)){
            data.update=[];
            for(var key in update){
                data.update.push(update[key]);
            }
        }
        //执行DWR
        dwrCaller.executeAction("refRole",data,function(rs){
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
    var buttonForm = refUserLayout.cells("b").attachForm([
        {type:"settings",position: "label-left", labelWidth: 70, inputWidth: 120},
        {type:"button",value:"确定",name:"save",offsetLeft:(winSize.width/2-70),offsetTop:5},
        {type:"newcolumn"},
        {type:"button",value:"关闭",name:"close",offsetTop:5}
    ]);
    //保存
    buttonForm.attachEvent("onButtonClick",function(id){
        if(id=="save"){//保存
            save(userId);
            dhxWindow._removeWindowGlobal(referenceWindow);
        }else if(id=="close"){
            referenceWindow.close();
        }
    });
    referenceWindow.attachEvent("onClose",function(win){
        if(!Tools.isEmptyObject(leftAdd)
                   ||!Tools.isEmptyObject(rightAdd)
                ||!Tools.isEmptyObject(update)){
            dhx.messageBox({
                buttons:[{id:"save",text:"保存",callback:function(){
                    save(userId);
                    dhxWindow._removeWindowGlobal(win);
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

    dwrCaller.addAutoAction("loadRoleByName", "RoleAction.queryRoleByName",
            {dwrConfig:true,isShowProcess:false,callback: function(data) {
            }}

    );

    dwrCaller.addDataConverter("loadRoleByName", roleDataConverter);
    referenceForm.attachEvent("onChange", function(id) {
        var roleNameCn = dwr.util.getValue("roleNameId");
        if (id == "roleNameId") {
            refRoleGrid.clearAll();
            refRoleGrid.load(dwrCaller.loadRoleByName+"?roleNameCn="+roleNameCn+"&userId="+userId, "json");
        }
    });

    window.filterBy = function(id) {
        var roleNameCn = dwr.util.getValue("roleNameId").replace(/(^\s*)|(\s*$)/g, "");
        refRoleGrid.clearAll();
        refRoleGrid.load(dwrCaller.loadRoleByName+"?roleNameCn="+roleNameCn+"&userId="+userId, "json");


    }
    window.filterByDesc = function(id){
        var roleNameCn = dwr.util.getValue("roleNameDesc").replace(/(^\s*)|(\s*$)/g, "");
        refRoleGrid.clearAll();
        refRoleGrid.load(dwrCaller.loadRoleByName+"?roleNameCn="+roleNameCn+"&userId="+userId, "json");
    }
}

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
    compare : function(data1, data2){
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
dwrCaller.addAutoAction("insertRefMenu", "UserAction.insertRefMenu",{
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
    var userData=mygrid.getRowData(rowId);
    var dhxWindow=new dhtmlXWindows();
    dhxWindow.createWindow("refMenuWindow",0,0,800,400);
    var refMenuWindow=dhxWindow.window("refMenuWindow");
    refMenuWindow.setModal(true);
    refMenuWindow.stick();
    refMenuWindow.setDimension(winWidth,winHeight);
    refMenuWindow.center();
    refMenuWindow.denyResize();
    refMenuWindow.denyPark();
    refMenuWindow.setText("当前用户："+userData.data[1]);
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
    refMenuLayout.hideSpliter();//移除分界边框。
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
//        $("_belongSystemLabel").innerHTML = queryform.getItemText("belongSys");
        systemId= queryform.getItemValue("belongSys");
        sysInit = true;
    })
    var loadMenuParam = new biDwrMethodParam();//loadMenu Action参数设置。
    //定义loadMen Action的参数来源于表单queryform数据。
    loadMenuParam.setParamConfig([
        {
            index:0,type:"fun",value:function(){
            return  queryform.getItemValue("belongSys");
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
    dwrCaller.addAutoAction("loadMenu","UserAction.queryMenuTreeData",loadMenuParam,function(data){
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
    refMenuGrid.setHeaderAlign("center,left,left");
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
            //当state为2时为部分选择，但是这个菜单是选中了的，所以设置成1
            state = ((state == 2)?1:state);
            if(menuData.checked==state&&(menuData.checked==1&&state==2)){//如果原来的状态与现有状态吻合,则不算新增也不算移除
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
     * 获取修正数据，数据结构如下：addRefMenu:[{menuId:1,roleFlag:1..//权限表示，-1代表由原关联权限获取到的菜单，>-1表示完全新增的菜单}..],新增关联的菜单
     *                            ：[{menuId,roleFlag}..]//删除关联的菜单。
     * excludeButtons:[{menuId,excludeButton:}...]//修改的排除菜单权限。这里只对已经选中的菜单才能有排除菜单按钮权限的操作。
     */
    var getData=function(){
        var result={};
        //获取新增的关联菜单。
        if(!Tools.isEmptyObject(add)){
            var addMenus=[];
            for(var key in add){
                addMenus.push({menuId:key,roleFlag:(add[key].isRoleFrom==undefined||add[key].isRoleFrom==null?0:add[key].isRoleFrom)});
            }
            result.addRefMenu=addMenus;
        }
        //获取删除关联的菜单
        if(!Tools.isEmptyObject(remove)){
            var deleteMenus=[];
            for(var key in remove){
                deleteMenus.push({menuId:key,roleFlag:(remove[key].isRoleFrom==undefined||remove[key].isRoleFrom==null?0:remove[key].isRoleFrom)});
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
                    if(r) {
                        dwrCaller.executeAction("insertRefMenu",data,rowId,function(rs){
                            if(rs){
                                dhx.alert("提交成功！");
                                dhxWindow._removeWindowGlobal(refMenuWindow);
                            }else{
                                dhx.alert("提交失败！");
                            }
                        });
                    }})
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

/**
 * 删除用户
 * @param rowDatas
 */
var deleteUser = function(rowDatas){

//Dwr deleteUser方法
    dwrCaller.addAutoAction("deleteUser","UserAction.deleteUser",function(data){
        if(data.type=="error"||data.type=="invalid"){
            dhx.alert("对不起，删除出错，请重试！");
        }else{
            dhx.alert("删除成功");
            var dataArray=[];
            for(var i=0; i<data.length; i ++){
                dataArray.push({id:data[i].sid});
            }
            mygrid.updateGrid(dataArray,"delete");
        }
    })
    dhx.confirm("是否要删除您所选择的用户？",function(r){
        if(r){
            dwrCaller.executeAction("deleteUser",rowDatas);
        }
    });
};

/**
 * 启用用户
 * @param rowDatas
 */
var startUser = function(rowDatas){

    dwrCaller.addAutoAction("startUser","UserAction.startUser",function(data){
        if(data.type=="error"||data.type=="invalid"){
            dhx.alert("对不起，启用出错，请重试！");
        }else{
            dhx.alert("用户启用成功！");
            // 修正禁用用户时的刷新bug
            mygrid.updateGrid(userDataConverter.convert(data.successData),"update");
        }
    });
    dhx.confirm("确认启用您所选择的用户？",function(r){
        if(r){
            dwrCaller.executeAction("startUser",rowDatas);
        }
    });
}

/**
 * 禁用用户
 * @param rowDatas
 */
var disableUser = function(rowDatas){

    dwrCaller.addAutoAction("disableUser","UserAction.disableUser",function(data){
        if(data.type=="error"||data.type=="invalid"){
            dhx.alert("对不起，禁用出错，请重试！");
        }else{
            dhx.alert("用户禁用成功！");
            // 修正禁用用户时的刷新bug
            mygrid.updateGrid(userDataConverter.convert(data.successData),"update");
        }
    });
    dhx.confirm("是否要禁用您所选择的用户？",function(r){
        if(r){
            dwrCaller.executeAction("disableUser",rowDatas);
        }
    });
}

var initPwd = function(rowDatas){

    dwrCaller.addAutoAction("initPwd","UserAction.initPassword",function(data){
        if(data==""){
            dhx.alert("对不起，重置，请重试！");
        }else{
            dhx.alert("重置成功，密码为"+data);
        }
    });
    dhx.confirm("确认要重置该用户密码？",function(r){
        if(r){
            dwrCaller.executeAction("initPwd",rowDatas);
        }
    });
}

dwrCaller.addAutoAction("loadDeptTree","DeptAction.queryAllDeptForBegin");
var treeConverter=new dhtmxTreeDataConverter({
    idColumn:"deptId",pidColumn:"parentId",
    isDycload:false,textColumn:"deptName"
});
dwrCaller.addDataConverter("loadDeptTree",treeConverter);
//树动态加载Action
dwrCaller.addAction("querySubDept",function(afterCall,param){
    var tempCovert=dhx.extend({isDycload:true},treeConverter,false);
    DeptAction.querySubDept(param.id,function(data){
        data=tempCovert.convert(data);
        afterCall(data);
    })
});
/**
 * 部门树input框Html。
 * @param selectDept 已经选择了的部门。
 */
var loadDeptTree=function(selectDept,form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectDept=selectDept|| global.constant.defaultRoot;
//    var beginId=global.constant.defaultRoot;
    var beginId=0;
    //创建tree Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target=form.getInput("dept");
    target.readOnly=true;

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
    tree.attachEvent("onDblClick",function(nodeId){
        form.setFormData({dept:tree.getItemText(nodeId),deptId:nodeId});
        //关闭树
        div.style.display="none";
    });
    dwrCaller.executeAction("loadDeptTree",beginId,function(data){
        tree.loadJSONObject(data);
        globDeptTree = tree;
        if(selectDept){
            tree.selectItem(selectDept); //选中指定节点
            //将input框选中
            target.value=tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target,"click",function(){
            div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
    });
    div.style.display="none";
}

//为查询时可多选，新添加的TREE
var loadDeptTreeChkbox=function(selectDept,form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectDept=selectDept|| global.constant.defaultRoot;
//    var beginId=global.constant.defaultRoot;
    var beginId=0;
    //创建tree Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 190px;width: 180px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000;background-color:white",id:'_deptDiv'
    });
    document.body.appendChild(div);
    //创建tree div
    var treeDiv = dhx.html.create("div", {
        style:"position:relative;height: 190px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    div.appendChild(treeDiv);
    //创建一个按钮div层
//    var buttonDiv = dhx.html.create("div", {
//        style:"position:relative;border: 1px #eee solid;height: 30px;overflow: auto;padding-top:0px;margin-top: 6px;" +
//              "z-index:1000;padding-left:50px"
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
//        div.style.display = "none";
    });
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
//        div.style.display = "none";
    });


    tree.setXMLAutoLoading(dwrCaller.querySubDept);
//    div.style.display = "none";
    var that = this;

//    var button = Tools.getButtonNode("确定");
//    button.style.marginTop="5px";
////    button.type = "button";
//    buttonDiv.appendChild(button);
//    //button响应函数，利用回调调用具体的事件相应
//    button.onclick = function() {
//        var checkedData = [];
//        var allChecked = tree.getAllChecked();
//        //寻找ID所有子节点
//
//        var nodes = typeof allChecked == "string" ? allChecked.split(",") : [allChecked];
//        var depts = "";
//        var deptsId = "";
//        for (i = 0;i < nodes.length; i++){
//            var scanIds = typeof tree.getAllSubItems(nodes[i]) == "string" ? tree.getAllSubItems(nodes[i]).split(","): [tree.getAllSubItems(nodes[i])];
//            if( scanIds.length > 1 ){
//                for (j = 0; j< scanIds.length; j++){
//                    if(depts == ""){
//                        depts =  tree.getItemText(scanIds[j]).toString();
//                    }else{
//
//                        depts =   depts + "," +  tree.getItemText(scanIds[j]).toString() ;
//                    }
//                    if(deptsId == ""){
//                        deptsId = scanIds[j].toString();
//                    }else{
//                        deptsId = deptsId   + "," + scanIds[j].toString();
//                    }
//                }
//            }else{
//                if(depts == ""){
//                    depts =  tree.getItemText(nodes[i]).toString();
//                }else{
//                    depts =   depts + "," +  tree.getItemText(nodes[i]).toString() ;
//                }
//                if(deptsId == ""){
//                    deptsId = nodes[i].toString();
//                }else{
//                    deptsId = deptsId   + "," + nodes[i].toString();
//                }
//            }
//
//
//
//        }
//        if(depts == 0){
//            depts = "";
//            deptsId = null;
//        }
//
//        form.setFormData({dept:depts,deptId:deptsId});
//        div.style.display = "none";
//
//    }

    //树双击鼠标事件
//    tree.attachEvent("onDblClick",function(nodeId){
//        form.setFormData({dept:tree.getItemText(nodeId),deptId:nodeId});
//        //关闭树
//        div.style.display="none";
//    });

    //移动节点位置至指定节点下。
    var target=form.getInput("dept");
    //target.readOnly=true;


    dwrCaller.executeAction("loadDeptTree",beginId,function(data){
        tree.loadJSONObject(data);
        globDeptTree = tree;
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

dwrCaller.addAutoAction("loadStationTree","StationAction.queryAllStationForBegin");
var stationConverter=dhx.extend({idColumn:"stationId",pidColumn:"parStationId",
    textColumn:"stationName"
},treeConverter,false);
dwrCaller.addDataConverter("loadStationTree",stationConverter);
//树动态加载Action
dwrCaller.addAction("querySubStation",function(afterCall,param){
    var tempCovert=dhx.extend({isDycload:true},stationConverter,false);
    StationAction.querySubStation(param.id,function(data){
        data=tempCovert.convert(data);
        afterCall(data);
    })
});

/**
 * 岗位input输入框Html
 * @param name
 * @param value
 */
var loadStationTree=function(selectStation,form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectStation=selectStation|| global.constant.defaultRoot;
//    var beginId=global.constant.defaultRoot;
    var beginId=0;
    //创建tree Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target=form.getInput("station");
    target.readOnly=true;

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
    tree.attachEvent("onDblClick",function(nodeId){
        form.setFormData({station:tree.getItemText(nodeId),stationId:nodeId});
        //关闭树
        div.style.display="none";
    });
    dwrCaller.executeAction("loadStationTree",beginId,function(data){
        tree.loadJSONObject(data);
        globStationTree = tree;
        if(selectStation){
            tree.selectItem(selectStation); //选中指定节点
            //将input框选中
            target.value=tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target,"click",function(){
            div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
    })
    div.style.display="none";
}
//添加岗位可以多选
var loadStationTreeChkBox=function(selectStation,form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectStation=selectStation|| global.constant.defaultRoot;
//    var beginId=global.constant.defaultRoot;
    var beginId=0;
    //创建Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;width: 180px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000;background-color:white",id:"_stationDiv"
    });
    document.body.appendChild(div);
    //创建tree Div层
    var treeDiv=dhx.html.create("div",{
        style:"display;none;position:relaive;height:200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    div.appendChild(treeDiv);
//    //创建buttondiv
//    var butDiv=dhx.html.create("div",{
//        style:"position:relative;height:30px;overflow:auto;padding:0;margin:0;padding-top:0xp;margin-top:6xp" +
//              "z-index:1000;margin-left:55px"
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
    tree.attachEvent("onCheck",function(id,state){
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
//        div.style.display = "none";
    });
    tree.attachEvent("onSelect",function(id){
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
//        div.style.display = "none";
    });


    tree.setXMLAutoLoading(dwrCaller.querySubStation);
//    var button = Tools.getButtonNode("确定");
//    button.style.marginTop="5px";
////    button.type = "button";
//    butDiv.appendChild(button);
//    // 点击button事件
//    button.onclick = function(){
//        var checkedData = tree.getAllChecked();
//        var nodes = typeof checkedData == "string" ? checkedData.split(","):[checkedData];
//        var stations = "";
//        var stationsId ="";
//        for (i = 0;i< nodes.length;i++){
//            if(stations == ""){
//                stations =  tree.getItemText(nodes[i]).toString();
//            }else{
//                stations =   stations + "," +  tree.getItemText(nodes[i]).toString() ;
//            }
//            if(stationsId == ""){
//                stationsId = nodes[i].toString();
//            }else{
//                stationsId = stationsId   + "," + nodes[i].toString();
//            }
//        }
//        if(stations == 0){
//            stations = "";
//            stationsId = null;
//        }
//        form.setFormData({station:stations,stationId:stationsId});
//        div.style.display = "none";
//
//    }
    //树双击鼠标事件
//    tree.attachEvent("onDblClick",function(nodeId){
//        form.setFormData({station:tree.getItemText(nodeId),stationId:nodeId});
//        //关闭树
//        div.style.display="none";
//    });
    dwrCaller.executeAction("loadStationTree",beginId,function(data){
        tree.loadJSONObject(data);
        globStationTree = tree;
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
    div.style.display="none";
}


dwrCaller.addAutoAction("loadZoneTree","ZoneAction.queryZoneByPath");
var zoneConverter=dhx.extend({idColumn:"zoneId",pidColumn:"zoneParId",
    textColumn:"zoneName"
},treeConverter,false);
dwrCaller.addDataConverter("loadZoneTree",zoneConverter);
//树动态加载Action
dwrCaller.addAction("querySubZone",function(afterCall,param){
    var tempCovert=dhx.extend({isDycload:true},zoneConverter,false);
    ZoneAction.querySubZone(param.id,function(data){
        data=tempCovert.convert(data);
        afterCall(data);
    })
});
/**
 * 地域树加载
 * @param name
 * @param value
 */
var loadZoneTree=function(selectZone,form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectZone=selectZone|| global.constant.defaultRoot;
    var beginId=(user.userId==global.constant.adminId?global.constant.defaultRoot:user.zoneId)
            || global.constant.defaultRoot;
    //创建tree Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target=form.getInput("zone");
    target.readOnly=true;

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
    tree.attachEvent("onDblClick",function(nodeId){
        form.setFormData({zone:tree.getItemText(nodeId),zoneId:nodeId});
        //关闭树
        div.style.display="none";
    });
    dwrCaller.executeAction("loadZoneTree",beginId,selectZone,function(data){
        tree.loadJSONObject(data);
        globZoneTree = tree;
        if(selectZone){
            tree.selectItem(selectZone); //选中指定节点
            //将input框选中
            target.value=tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target,"click",function(){
            div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
    })
    div.style.display="none";
}

var loadZoneTreeChkBox=function(selectZone,form){
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
    //创建buttondiv
//    var butDiv=dhx.html.create("div",{
//        style:"position:relative;border: 1px #eee solid;border-bottom:0px;height:30px;overflow:auto;;padding-top:0xp;margin-top:6xp" +
//              "z-index:1000;padding-left:55px"
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
        form.setFormData({zone:zones,zoneId:zonesId});
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
    });


//    var button = Tools.getButtonNode("确定");
//    button.style.marginTop="5px";
////    button.type = "button";
//    butDiv.appendChild(button);
//    // 点击button事件
//    button.onclick = function(){
//        var checkedData = tree.getAllChecked();
//        var nodes = typeof checkedData == "string" ? checkedData.split(","):[checkedData];
//        var zones = "";
//        var zonesId ="";
//        for (i = 0;i< nodes.length;i++){
//            if(zones == ""){
//                zones =  tree.getItemText(nodes[i]).toString();
//            }else{
//                zones =   zones + "," +  tree.getItemText(nodes[i]).toString() ;
//            }
//            if(zonesId == ""){
//                zonesId = nodes[i].toString();
//            }else{
//                zonesId = zonesId   + "," + nodes[i].toString();
//            }
//        }
//        if(zones == 0){
//            zones = "";
//            zonesId = null;
//        }
//        form.setFormData({zone:zones,zoneId:zonesId});
//        div.style.display = "none";
//
//    }
//    //树双击鼠标事件
//    tree.attachEvent("onDblClick",function(nodeId){
//        form.setFormData({zone:tree.getItemText(nodeId),zoneId:nodeId});
//        //关闭树
//        div.style.display="none";
//    });
    dwrCaller.executeAction("loadZoneTree",beginId,selectZone,function(data){
        tree.loadJSONObject(data);
        globZoneTree = tree;
        if(selectZone){
            tree.selectItem(selectZone); //选中指定节点
            //将input框选中
            target.value=tree.getSelectedItemText();
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




/**
 * 申请用户的Form表单
 */
var applyUserFormData=[
    //label 和控件三七分
    {type:"block",list:[
        {type:"settings",position: "label-left",labelAlign:"right",labelWidth: 50,inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"input",label:"<span style='color: red'>*</span>姓名：",name:"userNamecn",validate:"NotEmpty"
            ,labelAlign:"right"},
        {type:"input",label:"拼音：",name:"userNameen",validate:"ValidAplhaNumeric"},
        {type:"input",label:"职务：",name:"headShip"},
        {type:"input",label:"<span style='color: red'>*</span>部门：",name:"dept",validate:"NotEmpty"},
        //开始分列。
        {type:"newcolumn",offset:20},
        {type:"input",label:"<span style='color: red'>*</span>邮箱：",name:"userEmail",validate:"NotEmpty,ValidEmail"},
        {type:"input",label:"手机：",name:"userMobile",validate:"Mobile"},
        {type:"input",label:"<span style='color: red'>*</span>地域：",name:"zone",validate:"NotEmpty"},
        {type:"input",label:"<span style='color: red'>*</span>岗位：",name:"station",validate:"NotEmpty"}]},
    {type:"block",offsetTop:15,list:[
        {type:"button",label:"申请",name:"save",value:"申请",offsetLeft:80},
        {type:"newcolumn"},
        {type:"button",label:"重置",name:"reset",value:"清空"},
        {type:"newcolumn"},
        {type:"button",label:"关闭",name:"close",value:"关闭"}
    ]},
    {type:"hidden",name:"deptId"},
    {type:"hidden",name:"zoneId"},
    {type:"hidden",name:"stationId"}
]

var labelTemplate=function(name,value){
    value=value||"无";
    return "<span style='color: #000000;font-size: 12px;font-family: '宋体'>"
                   +(name=="state"?userState(value):value)+"</span>"
}

var radioTemplate=function(name,value){
    //设置定时器，便于为radio设置事件响应函数,用于设置选中的值。
    setTimeout(function(){
        Tools.addEvent($("_radioTemplate1"),"click",function(){
            $("_radioTemplate1").parentNode.parentNode.parentNode._value=1;
        });
        Tools.addEvent($("_radioTemplate2"),"click",function(){
            $("_radioTemplate2").parentNode.parentNode.parentNode._value=2;
        });
    },100);
    return"<input type='radio' name='_radioTemplate' id='_radioTemplate1' value='1' "+(value==1?"checked":"")+">"
                  +"自动<input type='radio' name='_radioTemplate' id='_radioTemplate2' value='2' "+(value==2?"checked":"")+">手动";
}

/**
 * 是否是VIP用户
 * @param name
 * @param value
 */
var isVipRadioTemplate=function(name,value){
    if(value==null||value==""){
        value=0;
    }
    //设置定时器，便于为radio设置事件响应函数,用于设置选中的值。
    setTimeout(function(){
        Tools.addEvent($("_isVipRadioTemplate1"),"click",function(){
            $("_isVipRadioTemplate1").parentNode.parentNode.parentNode._value=1;
        });
        Tools.addEvent($("_isVipRadioTemplate2"),"click",function(){
            $("_isVipRadioTemplate2").parentNode.parentNode.parentNode._value=0;
        });
    },100);
    return"<input type='radio' name='_isVipRadioTemplate' id='_isVipRadioTemplate1' value='1' "+(value==1?"checked":"")+">"
                  +"是&nbsp;&nbsp;&nbsp;<input type='radio' name='_isVipRadioTemplate' id='_isVipRadioTemplate2' value='0' "+(value==0?"checked":"")+">否";
}

var radioAutoRightModify=function(name,value){
    //设置定时器，便于为radio设置事件响应函数,用于设置选中的值。
    setTimeout(function(){
        Tools.addEvent($("_radioAutoRightModify1"),"click",function(){
            $("_radioAutoRightModify1").parentNode.parentNode.parentNode._value=1;
        });
        Tools.addEvent($("_radioAutoRightModify2"),"click",function(){
            $("_radioAutoRightModify2").parentNode.parentNode.parentNode._value=2;
        });
    },100);
    //默认手动分配权限被选中
    return"<input type='radio' name='_radioAutoRightModify' id='_radioAutoRightModify1' value='1' "+(value==1?"checked":"")+">"
                  +"自动<input type='radio' name='_radioAutoRightModify' id='_radioAutoRightModify2' value='2' "+(value==2?"checked":"")+">手动";
}

/**
 * 修改用户表单
 */
var modifyUserFormData=[
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"input",label:"姓名：",name:"userNamecn",validate:"NotEmpty,MaxLength[20],IllegalChar",labelWidth:80},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>",labelWidth:0},
        {type:"newcolumn"},
        {type:"input",label:"地域：",name:"zone",validate:"NotEmpty",labelWidth:80},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"input",label:"拼音：",name:"userNameen",validate:"ValidAplhaNumeric,MaxLength[50]",labelWidth:80},
        {type:"newcolumn"},
        {type:"input",label:"部门：",name:"dept",validate:"NotEmpty",labelWidth:95},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"input",label:"手机：",name:"userMobile",validate:"Mobile",labelWidth:80},
        {type:"newcolumn"},
        {type:"input",label:"岗位：",name:"station",validate:"NotEmpty",labelWidth:95},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"input",label:"邮箱：",name:"userEmail",validate:"NotEmpty,ValidEmail,MaxLength[64]",labelWidth:80},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"},
        {type:"newcolumn"},
        {type:"input",label:"OA登录名：",name:"oaUserName",validate:"MaxLength[64],IllegalChar",labelWidth:82}
//        {type:"newcolumn"},
//        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"input",label:"职务：",name:"headShip",validate:"MaxLength[32]",labelWidth:80},
        {type:"newcolumn"},
        {type:"combo",label:"默认系统：",name:"groupId",className:'queryItem',labelWidth:95,readonly:"readonly"}
    ]},
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",labelWidth:80,inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},

        {type:"newcolumn"},
        {type:"template",label:"VIP用户：",name:"vipFlag",format:isVipRadioTemplate,labelWidth:95}
    ]},
    {type:"block",offsetTop:15,list:[
        {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:158},
        {type:"newcolumn"},
        {type:"button",label:"重置",name:"reset",value:"重置"},
        {type:"newcolumn"},
        {type:"button",label:"关闭",name:"close",value:"关闭"}
    ]},

    {type:"hidden",label:"userId"},
    {type:"hidden",name:"deptId"},
    {type:"hidden",name:"zoneId"},
    {type:"hidden",name:"stationId"}
]
dhx.ready(userInit);