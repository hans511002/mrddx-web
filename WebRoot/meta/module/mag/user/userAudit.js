/**
 * 用户审核
 * @author 程钰
 * @date   2011-11-01
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var user= getSessionAttribute("user");
var dwrCaller = new biDwrCaller({
	querySystem:{methodName:"UserAction.queryMenuSystem"
        ,converter:new dhtmlxComboDataConverter({
            valueColumn:"groupId",textColumn:"groupName",isAdd:true
        })},
    update:function(afterCall, param){}
}
);
var user= getSessionAttribute("user");
var systemId=1;//用户关联菜单默认的系统代码
/**
 * 定义全局的部门、岗位、地域树
 */
var globDeptTree=null;
var globStationTree = null;
var globZoneTree = null;
dwrCaller.addAutoAction("loadUser", "UserAction.queryUserByState", [{zoneId:user.zoneId}],
        function(data){
        }
);
var userDataConfig = {
		idColumnName:"userId",
	    filterColumns:["userNamecn","userNameen",
	        "userMobile","userEmail","zoneName","deptName","stationName","_buttons"],
        cellDataFormat:function(rowIndex, columnIndex, columnName, cellValue,
    			rowData) {
    		if (columnName == "_buttons") {
    			return "getAuditButton";
    		} else {
    			return this._super.cellDataFormat(rowIndex, columnIndex,
    					columnName, cellValue, rowData);
    		}
    	},
    	userData:function(rowIndex,rowData){
            var userData ={};
            userData["groupId"]=rowData["groupId"];
            userData["orderId"]= rowData["orderId"];
            userData["userAttr"]= rowData["userAttr"];
            userData["menuTip"]= rowData["menuTip"];
            /**
             * 浏览器状态处理
             */
            if(rowData["navState"]){
                var  navState = parseInt(rowData["navState"]);
                if((1 & navState) == 1){//有最大化选项
                    userData["isMax"]= 1;
                }
                if((2 & navState) == 2){//有是否滚动选项
                    userData["isScroll"]=1;
                }
                if((4 & navState) == 4){//有是否菜单栏选项
                    userData["isMenuBar"]= 1;
                }
                if((8 & navState) == 8){//有是否状态栏选项
                    userData["isStatusBar"]= 1;
                }
            }
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
            userData.vipFlag=0;
            userData.headShip=rowData.headShip;
            return userData;
        }
};
var userDataConverter = new dhtmxGridDataConverter(userDataConfig);
dwrCaller.addDataConverter("loadUser",userDataConverter);
var auditUser=function(){
	var base=getBasePath();
    var buttons={
        auditUser:{name:"auditUser",text:"审核",onclick:function(rowData){
                    auditSingleUser(rowData.id);
            }}
    };
	window["getAuditButton"]=function(){
        var res=[];
        buttons["auditUser"].text="审核";
        res.push(buttons["auditUser"]);
        return res;
    };
	var auditWindow = new dhtmlXLayoutObject(document.body,"1C");
	auditWindow.cells("a").setText("待审核用户列表");
	mygrid= auditWindow.cells("a").attachGrid();
    mygrid.setHeader("<span style='font-weight: bold;'>姓名</span>," +
        "<span style='font-weight: bold;'>拼音</span>,<span style='font-weight: bold;'>手机</span>," +
        "<span style='font-weight: bold;'>邮箱</span>,<span style='font-weight: bold;'>地域</span>," +
        "<span style='font-weight: bold;'>部门</span>,<span style='font-weight: bold;'>岗位</span>," +
        "<span style='font-weight: bold;'>操作</span>");
    mygrid.setInitWidthsP("10,15,10,20,10,10,15,"+(window.screen.width>1024?"10.3":"15"));
    mygrid.setColAlign("left,left,left,left,left,left,left,left");
    mygrid.setHeaderAlign("center,center,center,center,center,center,center,center");
    mygrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,sb");
    mygrid.setColSorting("na,na,na,na,na,na,na,na");
    mygrid.enableResizing("true,true,true,true,true,true,true,false");
    mygrid.setEditable(true);
    mygrid.enableMultiselect(true);
    mygrid.enableCtrlC();
    mygrid.enableTooltips("true,true,true,true,true,true,true,false");
    mygrid.setColumnIds("userNamecn,userNameen,userMobile,userEmail,zoneName,deptName,stationName,target");
    mygrid.init();
//    mygrid.showRowNumber();//显示行号
    mygrid.defaultPaging(20);
    mygrid.load(dwrCaller.loadUser,"json");

};
/**
 * 审核用户
 */
var verifyForm ;
var auditSingleUser=function(rowId){
	var userData=mygrid.getRowData(rowId);
    var dhxWindow=new dhtmlXWindows();
    dhxWindow.createWindow("verifyWindow",0,0,520,280);
    var verifyWindow=dhxWindow.window("verifyWindow");
    verifyWindow.setModal(true);
    verifyWindow.stick();
    verifyWindow.setDimension(520,280);
    verifyWindow.center();
    verifyWindow.setPosition(verifyWindow.getPosition()[0],verifyWindow.getPosition()[1]-80)
    verifyWindow.denyResize();
    verifyWindow.denyPark();
    //关闭一些不用的按钮。
    verifyWindow.button("minmax1").hide();
    verifyWindow.button("park").hide();
    verifyWindow.button("stick").hide();
    verifyWindow.button("sticked").hide();
    verifyWindow.setText("审核用户");
    verifyWindow.keepInViewport(true);
    verifyWindow.show();
    

    //建立表单。
    verifyForm=verifyWindow.attachForm(auditUserFormData);
	//verifyForm.disableItem("groupId");
    //添加验证
    verifyForm.defaultValidateEvent();
    verifyForm.getCombo("groupId").readonly(true,false);
    //初始化表单
    verifyForm.getCombo("groupId").loadXML(dwrCaller.querySystem, function(){
    	verifyForm.getCombo("groupId").selectOption(0,true,true);
//        //用户默认系统
//        if(userData.userdata.groupId != null){
//            verifyForm.setFormData({groupId:userData.userdata.groupId});
//        }else{
//            verifyForm.setFormData({groupId:""});
//        }
    });
    
    //加载部门树
    loadDeptTree(userData.userdata.deptId,verifyForm);
    //加载地域树
    loadZoneTree(userData.userdata.zoneId,verifyForm);
    //加载岗位树
    loadStationTree(userData.userdata.stationId,verifyForm);
    //(userData.data[3].length)*3>120?userData.data[3]:120
    //动态判断emailLength的宽度
    var emailLength = (userData.data[3].length)*7;
    verifyForm.setItemWidth("userEmail",emailLength>120?emailLength:120);

    var initForm=function(){	
        var initData={
            userNamecn:userData.data[0],//用户中文名
            userNameen:userData.data[1],//用户拼音
            userMobile:userData.data[2],//用户电话
            userEmail:userData.data[3], //用户邮箱
//            createDate:userData.userdata.createDate, //建立日期
            headShip:userData.userdata.headShip, //职务
            state:1,//初始化页面默认用户状态有效
            userId:userData.id,
            autoRight:1,//默认自动分配权限
            vipFlag:0
        }
        dhx.extend(initData,userData.userdata);
        verifyForm.setFormData(initData);
    }
    initForm();

    /**
     * 添加 onButtonClick 事件
     */
    verifyForm.attachEvent("onButtonClick",function(id){
        if(id=="save"){//保存
            verifyForm.send(dwrCaller.auditUser);
        }else if (id=="reset"){//重置
            verifyForm.clear();

            initForm();
            verifyForm.setFormData({zone:globZoneTree.getItemText(userData.userdata.zoneId),zoneId:userData.userdata.zoneId});
            verifyForm.setFormData({dept:globDeptTree.getItemText(userData.userdata.deptId),deptId:userData.userdata.deptId});
            verifyForm.setFormData({station:globStationTree.getItemText(userData.userdata.stationId),stationId:userData.userdata.stationId});
            //用户默认系统
//            if(userData.userdata.groupId != null){
//                verifyForm.setFormData({groupId:userData.userdata.groupId});
//            }else{
//                verifyForm.setFormData({groupId:""});
//            }
            verifyForm.getCombo("groupId").selectOption(0,true,true);
        }else if(id=="close"){
            verifyWindow.close();
            verifyForm.getCombo("groupId").closeAll();
        }
    });
	verifyForm.setItemFocus("oaUserName");
	
    //关闭Window事件
    verifyWindow.attachEvent("onClose", function(win){
        verifyForm.clear();
        dhxWindow.unload();
        verifyForm.getCombo("groupId").closeAll();
    })
	
    /**
     * 添加审核用户动作
     */
    dwrCaller.addAction("auditUser", function(afterCall,param){
        UserAction.auditUser(param,function(data){
            if(data.type=="error"||data.type=="invalid"){
                dhx.alert("对不起，审核出错，请重试！");
            }else if(data.sid==-1){
                dhx.alert("审核出错，OA登录名重复！");
            } else{
                dhx.alert("审核成功");
                verifyWindow.close();
                mygrid.updateGrid({id:data.sid},"delete");
//                dhx.alert("请对用户进行授权");
//                parent.openMenu("用户维护","/meta/module/mag/user/user.jsp?userNamecn="+userData.data[0]+"&userId=" + userData.userdata.userId,"top",null,true);
                auditUser();
            }
        })
    });
};
var labelTemplate=function(name,value){
    value=value||"无";
    if(name == "state"){
    	value = 2;
    }
    return "<span style='color: #000000;font-size: 12px;font-family: '宋体'>"
                   +(name=="state"?userState(value):value)+"</span>"
};
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
};
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
                  +"是&nbsp;&nbsp;&nbsp;&nbsp;<input type='radio' name='_isVipRadioTemplate' id='_isVipRadioTemplate2' value='0' "+(value==0?"checked":"")+">否";
}

/**
 * 审核用户表单
 */
var auditUserFormData=[
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",labelWidth:85,inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"template",label:"<span style='font-weight:bold;'>姓名：</span>",name:"userNamecn",format:labelTemplate},
        {type:"newcolumn"},
        {type:"template",label:"<span style='font-weight:bold;'>拼音：</span>",name:"userNameen",format:labelTemplate}
    ]},
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",labelWidth:85,inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"template",label:"<span style='font-weight:bold;'>手机：</span>",name:"userMobile",format:labelTemplate},
        {type:"newcolumn"},
        {type:"template",label:"<span style='font-weight:bold;'>邮箱：</span>",name:"userEmail",format:labelTemplate}
    ]},
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",labelWidth:85,inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"template",label:"<span style='font-weight:bold;'>用户状态：</span>",name:"state",format:labelTemplate} ,
        {type:"newcolumn"},
        {type:"template",label:"<span style='font-weight:bold;'>注册日期：</span>",name:"createDate",format:labelTemplate}
    ]},
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"input",label:"<span style='font-weight:bold;'>OA登录名：</span>",name:"oaUserName",validate:"MaxLength[64],IllegalChar",labelWidth:85},
//        {type:"newcolumn"},
//        {type:"label",label:"<span style='color: red'>*</span>",labelWidth:0},
        {type:"newcolumn"},
        {type:"input",label:"<span style='font-weight:bold;'>职务：</span>",name:"headShip",offsetLeft:0,validate:"MaxLength[32]",labelWidth:86}
    ]},
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"input",label:"<span style='font-weight:bold;'>部门：</span>",name:"dept",validate:"NotEmpty",labelWidth:85},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>",labelWidth:0},
        {type:"newcolumn"},
        {type:"input",label:"<span style='font-weight:bold;'>岗位：</span>",name:"station",validate:"NotEmpty",labelWidth:73},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>",labelWidth:0}
    ]},
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"input",label:"<span style='font-weight:bold;'>地域：</span>",name:"zone",validate:"NotEmpty",labelWidth:85},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>",labelWidth:0},
        {type:"newcolumn"},
        {type:"combo",label:"<span style='font-weight:bold;'>默认系统：</span>",name:"groupId",labelWidth:73,inputHeight:20,readonly:"readonly"},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>",labelWidth:0}
    ]},
    {type: "block", list:[
        {type:"settings",position: "label-left",labelAlign:"right",inputWidth: 120,labelLeft:0 ,
            inputLeft:0,offsetTop:0},
        {type:"template",label:"<span style='font-weight:bold;'>权限策略：</span>",name:"autoRight",format:radioTemplate,labelWidth:85},
        {type:"newcolumn"},
        //{type:"template",label:"<span style='font-weight:bold;'>VIP用户：</span>",name:"vipFlag",format:isVipRadioTemplate,labelWidth:84}
        {type:"template",label:"VIP用户：",name:"vipFlag",format:isVipRadioTemplate,labelWidth:84}
       
    ]},
    {type:"block",offsetTop:11,list:[
        {type:"button",label:"审核通过",name:"save",value:"审核通过",offsetLeft:140},
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
    selectDept=selectDept|| global.constant.defaultSystemId;
//    var beginId=global.constant.defaultRoot;
    var beginId=0;
    //创建tree Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;width: 180px;overflow: auto;padding: 0;margin: 0;" +
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
            //div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
    })
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
    selectStation=selectStation|| global.constant.defaultSystemId;
//    var beginId=global.constant.defaultRoot;
    var beginId=0;
    //创建tree Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;width: 180px;overflow: auto;padding: 0;margin: 0;" +
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
            //div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        });
        verifyForm.enableItem("groupId");
    });
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
    var beginId=global.constant.defaultRoot;
    //创建tree Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;width: 180px;overflow: auto;padding: 0;margin: 0;" +
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
            //div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
    })
    div.style.display="none";
}

dhx.ready(auditUser);