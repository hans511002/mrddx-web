/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        zone.js
 *Description：
 *       地域查询
 *Dependent：
 *       dhtmlx.js，dwr 有关JS，dhtmxExtend.js。。。
 *Author:
 *        刘斌
 *Finished：
 *       2011-09-29-14-35
 *Modified By：
 *       程钰
 *Modified Date:
 *       2011-10-08-14-30
 *Modified Reasons:
 *       添加地域下属用户

 ********************************************************/
/**
 * 页面初始化。
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var loadZoneParam = new biDwrMethodParam();//loadZone Action参数设置。
/**
 * 树Data转换器定义
 */
var convertConfig= {
    idColumn:"zoneId",pidColumn:"zoneParId",
    filterColumns:["zoneName", "zoneDesc", "zoneCode", "dimTypeName", "dimLevel", "state", "_buttons"],
    isDycload:true,
    /**
     * 列转义，设置第二列的值固定为getRoleButtons，此为操作列，这个值为一个JS函数，用于获取下拉button的值。
     * @param rowIndex
     * @param columnIndex   特别说明，如果实现了filterColumns（）方法，这里的columnIndex是filterColumns后的index
     * @param cellValue
     * @param rowData
     * @return
     */
    cellDataFormat:function( rowIndex,  columnIndex, columnName,cellValue,rowData) {
        if(columnName == '_buttons'){//如果是第二列。即操作按钮列
            return "getZoneButtons";
        }
        return this._super.cellDataFormat(rowIndex, columnIndex,columnName, cellValue, rowData);
    }
}
/**
 * JS内部类 用于数据转换
 */
var zoneTreeDataConverter=new dhtmlxTreeGridDataConverter(convertConfig);
/**
 * User表Data转换器
 */
var userConvertConfig = {
    idColumnName:"userId",
    filterColumns:["userNamecn","userNameen",
                "userMobile","userEmail","zoneName","deptName","stationName","headShip"],
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
        return userData;
    }

}
/**
 * JS内部类 用于数据转换
 */
var userDataConverter=new dhtmxGridDataConverter(userConvertConfig);

/**
 * 声明dwrCaller
 */
var dwrCaller = new biDwrCaller({
    querySubZone:{methodName:"ZoneAction.querySubZone",converter:zoneTreeDataConverter},
    update:function(afterCall, param){}
});

dwrCaller.addAutoAction("loadZone","ZoneAction.queryZoneTreeData",loadZoneParam
    ,function(data){});
loadZonetreeDataConverter=dhx.extend({},zoneTreeDataConverter);
loadZonetreeDataConverter.setDycload(false);
dwrCaller.addDataConverter("loadZone",loadZonetreeDataConverter);

/**
 * 初始化页面加载方法
 */
var zoneInit = function(){
	var base = getBasePath();
	//button详细定义
    var buttons={
        refUser:{name:"refUser",text:"操作",imgEnabled:base+"/meta/resource/images/users.png",
            imgDisabled :base+"/meta/resource/images/users.png",onclick:function(rowData){
    			if(dhx.isArray(rowData)){
                    return;
                }
                refUser(rowData.id);
            }}
    };
    //TODO 按钮权限过滤,checkRule.
    var buttonZone=["refUser"];
//    var buttonZone=getRoleButtons();
    //定义全局函数，用于获取有权限的button列表定义
    window["getZoneButtons"] = function(){
        var res = [];
        for(var i = 0; i < buttonZone.length; i++){
        	if(buttonZone[i] == "refUser"){
        		buttons["refUser"].text="下属用户";
        		res.push(buttons["refUser"])
        	}else{
        		res.push(buttons[buttonZone[i]]);
        	}
        }
        return res;
    };

    var zoneLayout = new dhtmlXLayoutObject(document.body, "2E");
    zoneLayout.cells("a").setText("地域查询");
    zoneLayout.cells("b").hideHeader();
    //zoneLayout.cells("b").setText("地域列表");
    zoneLayout.cells("a").setHeight(80);
    zoneLayout.cells("a").fixSize(false,true);
    zoneLayout.hideSpliter();//移除分界边框。
    zoneLayout.hideConcentrate();
    
    //加载查询表单
    var queryform = zoneLayout.cells("a").attachForm([
        {type:"setting",position: "label-left", labelWidth: 120, inputWidth: 120},
        {type:"input",label:"地域名称：",name:"zoneName",inputHeight : 17} ,
        {type:"newcolumn"},
        {type:"button",name:"query",value:"查询",offsetLeft : 0,offsetTop : 0},
        {type:"hidden",name:"template"}
    ]);

    //定义loadRole Action的参数来源于表单queryform数据。
    loadZoneParam.setParamConfig([{
        index:0,type:"fun",value:function(){
    	var formData=queryform.getFormData();
            formData.zoneName=Tools.trim(queryform.getInput("zoneName").value);
            return formData;
        }
    }]);
    var filterButton=window["getZoneButtons"]();
    //加载地域列表
    mygrid = zoneLayout.cells("b").attachGrid();
    var myg = new Grid(mygrid,{
        headNames:"地域名称,地域描述,地域编码,维度分组类型,层级,状态,操作",
        columnIds:loadZonetreeDataConverter.filterColumns.toString(),
        treeFlag:true,
        pageSize:0
    });
    myg.enableMultiselect(true);
    myg.setColumnCustFormat(5,validOrNot);//第二列进行转义
    myg.genApi.setCellType(6,"sb");
    myg.kidsXmlFile=dwrCaller.querySubZone;
    myg.loadData(dwrCaller.loadZone);


//    mygrid.setImagePath(dhtmlx.image_path+"csh_"+dhtmlx.skin+"/");
//    mygrid.setHeader("地域名称,地域描述,地域编码,维度分组类型,层级,状态,操作");
//    mygrid.setInitWidthsP("18,18,15,15,10,9,15");
//    mygrid.setHeaderBold();
//    mygrid.setColAlign("left,left,center,center,center,center,center");
//    mygrid.setHeaderAlign("left,center,center,center,center,center,center");
//    mygrid.setColTypes("tree,ro,ro,ro,ro,ro,sb");
//    mygrid.enableCtrlC();
//    mygrid.setColSorting("na,na,na,na,na,na,na");
//    mygrid.enableTreeGridLines();
//    mygrid.setEditable(false);
//    mygrid.enableMultiselect(true);
//    mygrid.setColumnCustFormat(5,validOrNot);//第二列进行转义
//    mygrid.setColumnIds("zoneName", "zoneDesc", "zoneCode", "dimTypeName", "dimLevel", "state", "target");
//    mygrid.init();
//    mygrid.load(dwrCaller.loadZone,"json");
//    mygrid.kidsXmlFile=dwrCaller.querySubZone;
    
    //查询表单事件处理
    queryform.attachEvent("onButtonClick", function(id){
        if(id=="query"){
            //进行数据查询。
            mygrid.clearAll();
            mygrid.load(dwrCaller.loadZone,"json");
        }
    });
    // Enter查询事件
    queryform.getInput("zoneName").onkeypress=function(e){
        e=e||window.event;
        var keyCode=e.keyCode;
        if(keyCode==13){
            mygrid.clearAll();
            mygrid.load(dwrCaller.loadZone,"json");
        }
    }

    /**
     *工具栏按钮事件处理中转
     *@param buttonId 按钮的名称
     *@param rowData 当前行的数据
     */
    var buttonEventHandel = function(buttonId, rowData){
        if(buttons[buttonId].onclick){
            buttons[buttonId].onclick(rowData.length == 1 ? rowData[0] : rowData);
        }
    }//end

    //右键菜单
//    var menu = new dhtmlXMenuObject();
//    menu.renderAsContextMenu();
//    menu.attachEvent("onClick", function(menuItemId){
//        var data = mygrid.contextID.split("_");
//        //rowInd_colInd;
//        var rowId = data[0];
//        var rowData = mygrid.getRowData(rowId);
//        buttonEventHandel(menuItemId, rowData);
//        //选中contextmenu指定行
//        mygrid.doClick(mygrid.cells(data[0],data[1]).cell,true);
//        return true;
//    });
//    var pos = 0;
//    for(var i = 0; i < filterButton.length; i++){
//        menu.addNewChild(null, pos++, filterButton[i].name, filterButton[i].text, false, filterButton[i].imgEnabled,
//            filterButton[i].imgDisabled);
//    }
//
//    mygrid.enableContextMenu(menu);
}
/**
 * 地域下属用户.
 * @param rowData
 */
var refUser = function(rowData){
    var tempData = mygrid.getRowData(rowData);//获取行数据
    var loadUserParam=new biDwrMethodParam();
    var dhxWindow=new dhtmlXWindows();
    dhxWindow.createWindow("refUserWindow",0,0,550,380);
    var refUserWindow=dhxWindow.window("refUserWindow");
    refUserWindow.setModal(true);
    //refUserWindow.stick();
    refUserWindow.setDimension(550,380);
    refUserWindow.center();
    refUserWindow.denyResize();
    refUserWindow.denyPark();
    refUserWindow.setText(tempData.data[0]+'</span>'+'<span style="font-weight:normal;">下属用户</span>');
    refUserWindow.keepInViewport(true);
    //关闭一些不用的按钮。
    refUserWindow.button("minmax1").hide();
    refUserWindow.button("park").hide();
    refUserWindow.button("stick").hide();
    refUserWindow.button("sticked").hide();
    refUserWindow.show();
    var refUserLayout = new dhtmlXLayoutObject(refUserWindow,"2E");
    //refUserLayout.cells("a").setText("查询条件");
    //refUserLayout.cells("b").setText("用户列表");
    refUserLayout.cells("a").hideHeader();
    refUserLayout.cells("b").hideHeader();
    refUserLayout.cells("a").setHeight(40);
    refUserLayout.cells("a").fixSize(false,true);
    refUserLayout.hideSpliter();//移除分界边框。
    refUserLayout.hideConcentrate();
    //加载查询表单
    var queryform = refUserLayout.cells("a").attachForm([
        {type:"setting",position: "label-left", labelWidth: 120, inputWidth: 120},
        {type:"input",label:"姓名：",name:"userName"},
        {type:"newcolumn"},
        {type:"hidden",label:"地域",name:"userZone",value:rowData},
        {type:"newcolumn"},
        {type:"button",name:"query",value:"查询"}
    ]);
    //定义loadUser Action的参数来源于表单queryform数据。
    loadUserParam.setParamConfig([{
        index:0,type:"fun",value:function(){
             var formData=queryform.getFormData();
            formData.userName=Tools.trim(queryform.getInput("userName").value);
            return formData;
        }
    }]);
    //添加加载用户事件
    dwrCaller.addAutoAction("loadRefUser", "ZoneAction.queryRefUser",loadUserParam,
        function(data){
//            alert(data);
        }
    );
    dwrCaller.addDataConverter("loadRefUser",userDataConverter);
//
    //用户列表
    var refUserGrid=refUserLayout.cells("b").attachGrid();
    refUserGrid.setHeader("姓名,拼音,手机,邮箱,地域,部门,岗位,职务");
    refUserGrid.setInitWidthsP("10,10,10,26,10,10,15,10");
    refUserGrid.setColAlign("left,left,center,left,left,left,left,left");
    refUserGrid.setHeaderAlign("left,center,center,center,center,center,center,center");
    refUserGrid.setHeaderBold();
    refUserGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro");
    refUserGrid.enableCtrlC();
    refUserGrid.setColSorting("na,na,na,na,na,na,na,na");
    refUserGrid.enableMultiselect(true);
    refUserGrid.setColumnIds("userNamecn,userNameen,userMobile,userEmail,zone,dept,station,headShip");
    refUserGrid.init();
    refUserGrid.defaultPaging(10);
    refUserGrid.load(dwrCaller.loadRefUser,"json");
    //查询表单事件处理
    queryform.attachEvent("onButtonClick", function(id){
        if(id=="query"){
            //进行数据查询。
            refUserGrid.clearAll();
            refUserGrid.load(dwrCaller.loadRefUser,"json");
        }
    });
    queryform.getInput("userName").onkeypress=function(e){
        e=e||window.event;
        var keyCode=e.keyCode;
        if(keyCode==13){
            refUserGrid.clearAll();
            refUserGrid.load(dwrCaller.loadRefUser,"json");
        }
    }
}
dhx.ready(zoneInit);