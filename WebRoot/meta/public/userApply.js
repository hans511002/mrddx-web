/**
 * 申请用户
 * @author 程钰
 * @date   2011-11-01
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var user=null;
SessionManager.getAttribute("user",{async:false,callback:function(data){
    user=data;
}});
//var user= getSessionAttribute('user');
var dwrCaller = new biDwrCaller();
var loadUserParam=new biDwrMethodParam();//loaduser Action参数设置。
var systemId=1;//用户关联菜单默认的系统代码

/**
 * 定义全局的部门、岗位、地域树
 */
var globDeptTree=null;
var globStationTree = null;
var globZoneTree = null;
var treeData = {};

var applyUser=function(){
//	alert(flag);
	var applyWindow = new dhtmlXLayoutObject(document.body,"1C");
	var applyWindows = applyWindow.cells("a");
	//applyWindows.setDimension(400,400);
	applyWindows.setHeight(300);
	if(user!=null && flag != 1){
		applyWindows.setText("申请用户");
	}else{
		applyWindows.hideHeader();	
	}
	
    //建立表单。
   var  applyForm = applyWindows.attachObject($("addUserForm"));
   	//用户名重复验证
    dwrCaller.addAutoAction("valiHasUserName","UserAction.valiHasUserName",{dwrConfig:true,isShowProcess:false,callback:function(data){}});
    dwrCaller.addDataConverter("valiHasUserName",new remoteConverter("用户名已存在！"));
    
    //邮箱重复验证
    dwrCaller.addAutoAction("valiHasEmail","UserAction.valiHasEmail",{dwrConfig:true,isShowProcess:false,callback:function(data){}});
    dwrCaller.addDataConverter("valiHasEmail",new remoteConverter("用户邮箱已存在！"));
 	dhtmlxValidation.addValidation($("addUserForm"), [
        {target:"userNamecn",rule:"NotEmpty,MaxLength[20],IllegalChar,Remote["+dwrCaller.valiHasUserName+"]"},
        {target:"userNameen",rule:"ValidAplhaNumeric,MaxLength[50]"},
        {target:"userMobile",rule:"Mobile"},
        {target:"userEmail",rule:"NotEmpty,ValidEmail,MaxLength[64],Remote["+dwrCaller.valiHasEmail+"]"},
        {target:"dept",rule:"NotEmpty"},
        {target:"zone",rule:"NotEmpty"},
        {target:"station",rule:"NotEmpty"},
        {target:"headShip",rule:"MaxLength[32]"}
    ])
    
    var form = $("addUserForm");
    //加载部门树
    loadDeptTree(null,form);
    //加载地域树
    loadZoneTree(null,form);
    //加载岗位树
    loadStationTree(null,form);

    /**
     * 注册申请用户事件
     */
    dwrCaller.addAction("applyUser", function(afterCall,param){
        UserAction.applyUser(param,function(data){
            if(data.type=="error"||data.type=="invalid"){
                dhx.alert("对不起，申请出错，请重试！");
                return;
            }else if(data.sid==-1){
                dhx.alert("申请出错，邮箱地址已存在！");
                return;
            }else if(data.sid==-2){
                dhx.alert("申请出错，用户名已存在！");
                return;
            }else if(data.sid ==-3){
            	dhx.alert("请输入验证码！");
                return;
            }else if(data.sid ==-4){
            	dhx.alert("验证码错误，请重新输入！");
                return;
            }else {
//	                dhx.alert("申请成功,正在审核中...,您的初始密码为:" +defaultPassword+ "。3 秒后返回登陆页面");
	                //applyWindows.close();
	                //mygrid.updateGrid(userDataConverter.convert(data.successData),"insert");
	//                applyForm.setFormData(
	//                	{
	//                		"userNamecn":"",
	//                		"userNameen":"",
	//                		"userEmail":"",
	//                		"userMobile":"",
	//                		"headShip":""
	//                	});
                    var isRetrun = false;//用来判断用户是否点击返回按钮
                    dhx.messageBox({
                        buttons:[
                            {id:"ok",text:"确定",callback:function(){
                                eval('returnLogin()');
                            }},
                            {id:"cancel",text:"返回", callback:function(){
                                document.getElementById("addUserForm").reset();
                                return;
                            }}
                        ],
                        message:"申请成功,正在审核中...,您的初始密码为:" +defaultPassword+ "。"
                    });
//	                document.getElementById("addUserForm").reset();
//	                setTimeout(function(){eval('returnLogin()');},5000);
	                
            }
        });
    });
    
    
    var saveBut = Tools.getButtonNode("申请");
    $("_submit").appendChild(saveBut);
    //saveBut.style.marginLeft = (Math.round($("_submit").offsetWidth / 2)-130) + "px";
    saveBut.style.marginLeft = "155px";
    saveBut.style.cssFloat="left";
    saveBut.style.styleFloat="left";
    saveBut.onclick = function(){
        save();
    }
    
    var resetBut = Tools.getButtonNode("清空");
    $("_submit").appendChild(resetBut);
    resetBut.style.cssFloat="left";
    resetBut.style.styleFloat="left";
    resetBut.onclick = function(){
       document.getElementById("addUserForm").reset();
    }
    
    
    var returnLoginBut = Tools.getButtonNode("关闭");
    $("_submit").appendChild(returnLoginBut);
    returnLoginBut.style.cssFloat="left";
    returnLoginBut.style.styleFloat="left";
    returnLoginBut.style.display="block";
    returnLoginBut.onclick = function(){
        //returnLogin();
        window.top.location=sysPath;
    }
    hiddenLoginBut(returnLoginBut,resetBut);
};

/**
 * 验证
 * @param {Object} validateDimInfo
 * @return {TypeName} 
 */
var validate = function(){
    //提交数据前进行数据验证。
	var validateRes = true;
    validateRes = validateRes&&dhtmlxValidation.validate("addUserForm");
    return validateRes;
}

/**
 * 获取表单数据
 */
var getFormData = function(){
	var tableData = Tools.getFormValues("addUserForm");
	return tableData;
}


/**
 * 申请事件
 */
function save(){
	if(validate()){
		
		if(dwr.util.getValue("validateCode") == ""){
            dhx.alert("请输入验证码！")
            return false;
        }
		
		var formData = getFormData();
		dwrCaller.executeAction("applyUser",{formData:formData},function(data){
			
		});
	}
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
    selectDept=selectDept|| 0;
//    var beginId=global.constant.defaultRoot;
    var beginId=0;
    //创建tree Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target=document.getElementById("dept");
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
    tree.attachEvent("onclick",function(nodeId){
//    	if(nodeId==1){
//    		dhx.alert("你不能选择此选项");
//    		return;
//    	}
//        form.setFormData({dept:tree.getItemText(nodeId),deptId:nodeId});
    	dwr.util.setValue("dept", tree.getItemText(nodeId));
    	dwr.util.setValue("deptId", nodeId);
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
        
        Tools.addEvent(target,"focus",function(){
            div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        })
        
         Tools.addEvent(target,"click",function(){
            div.style.width = target.offsetWidth+'px';
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
    selectStation=selectStation||0;
//    var beginId=global.constant.defaultRoot;
    var beginId=0;
    //创建tree Div层
    var div=dhx.html.create("div",{
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target=document.getElementById("station");
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
    tree.attachEvent("onclick",function(nodeId){
//    	if(nodeId==1){
//    		dhx.alert("你不能选择此选项");
//    		return;
//    	}
//        form.setFormData({station:tree.getItemText(nodeId),stationId:nodeId});
    	dwr.util.setValue("station", tree.getItemText(nodeId));
    	dwr.util.setValue("stationId", nodeId);
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
        Tools.addEvent(target,"focus",function(){
            div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        });
        Tools.addEvent(target,"click",function(){
            div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        });
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
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    document.body.appendChild(div);
    //移动节点位置至指定节点下。
    var target=document.getElementById("zone")
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
    tree.attachEvent("onclick",function(nodeId){
//        form.setFormData({zone:tree.getItemText(nodeId),zoneId:nodeId});
    	dwr.util.setValue("zone", tree.getItemText(nodeId));
    	dwr.util.setValue("zoneId", nodeId);
    	
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
        Tools.addEvent(target,"focus",function(){
            div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        });
        Tools.addEvent(target,"click",function(){
            div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div,target,true);
            div.style.display="block";
        });
    })
    div.style.display="none";
}

/**
 * 返回登录
 */
dwrCaller.addAction("logout",function(){
    LoginAction.logout(function(data){
        dhx.closeProgress();
        window.location.href = '../meta/module/index/index.jsp'
//        window.location=getBasePath();
    });
});

function returnLogin(){
	//返回登录首先跳出系统
	 dwrCaller.executeAction("logout");
}

// 用户从首页申请 根据flag != 1 判断不影藏[清空按钮]
function hiddenLoginBut(returnLoginBut,restBut){
	if(getSessionAttribute('user')&&flag != 1){
		returnLoginBut.style.display = "none";
		restBut.style.marginLeft = 80+"px";
	}
}
dhx.ready(applyUser);