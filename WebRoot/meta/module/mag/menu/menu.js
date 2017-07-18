/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        menu.js
 *Description：
 *       菜单功能模块所有JS
 *Dependent：
 *       dhtmlx.js，dwr 有关JS，dhtmxExtend.js。。。
 *Author:
 *        张伟
 *Finished：
 *       2011-09-11-9-15
 *Modified By：
 *       王晶
 *Modified Date:
 *       2011-09-11-10-12
 *Modified Reasons:
 *       添加了"关联用户"和"关联角色"的处理方法,弹出菜单样式修改等,具体控件的用法等
 ********************************************************/
//页面全局变量定义
dhtmlx.image_path = getDefaultImagePath();
var user = getSessionAttribute("user");
dhtmlx.skin = getSkin();
var loadMenuParam = new biDwrMethodParam();//loadMenu Action参数设置。
var systemId = 1;//当前系统的系统号码
var currMenuId = null;//当前选中的菜单id
var currMenuName = null;//当前选中的菜单的名字
var base = getBasePath(); //获得当前服务器的根地址
var list = null;

/**************************菜单本身数据加载start********************************************************/
    //菜单本身显示页面的树转换器
var convertConfig = {
    idColumn:"menuId",pidColumn:"parentId",
    filterColumns:["menuName", "menuUrl", "isShow", "iconUrl", "target", "_buttons"],
    isDycload:true,
    /**
     * 列转义，设置第五列的值固定为getRoleButtons，此为操作列，这个值为一个JS函数，用于获取下拉button的值。
     * @param rowIndex   当前行的id
     * @param columnIndex  特别说明，如果实现了filterColumns（）方法，这里的columnIndex是filterColumns后的index
     * @param columnName   当前列的名字
     * @param cellValue   单元格的值
     * @param rowData   当前行的数据
     * @return
     */
    cellDataFormat:function(rowIndex, columnIndex, columnName, cellValue, rowData){
        if(columnName == "_buttons"){//如果是第五列。即操作按钮列
            return "getSelectButtons";
        }else if(columnName=="iconUrl"){
            if(cellValue){
                return {type:"img",value:getBasePath()+"/"+cellValue};
            }else{
                return cellValue||"";
            }
        }
        return this._super.cellDataFormat(rowIndex, columnIndex, columnName, cellValue, rowData);
    },
    /**
     * 实现 userData，将一些数据作为其附加属性
     * @param rowIndex
     * @param rowData
     * @return
     */
    userData:function(rowIndex, rowData){
        var userData = {};
        userData["groupId"] = rowData["groupId"];
        userData["orderId"] = rowData["orderId"];
        userData["userAttr"] = rowData["userAttr"];
        userData["pageButton"] = rowData["pageButton"];
        userData["iconUrl"] = rowData["iconUrl"];
        userData["parentId"]=rowData["parentId"];
        /**
         * 浏览器状态处理
         */
        if(rowData["navState"]){
            var navState = parseInt(rowData["navState"]);
            if((1 & navState) == 1){//有最大化选项
                userData["isMax"] = 1;
            }
            if((2 & navState) == 2){//有是否滚动选项
                userData["isScroll"] = 1;
            }
            if((4 & navState) == 4){//有是否菜单栏选项
                userData["isMenuBar"] = 1;
            }
            if((8 & navState) == 8){//有是否状态栏选项
                userData["isStatusBar"] = 1;
            }
            if((16 & navState) == 16){
                userData["isLinkBar"] = 1;
            }
        }
        userData["menuTip"] = rowData["menuTip"];
        userData["menuUrl"] = rowData["menuUrl"];
        return userData;
    },
    compare : function(data1, data2){
        if(data1.userdata.orderId == undefined || data1.userdata.orderId == null){
            return false;
        }
        if(data2.userdata.orderId == undefined || data2.userdata.orderId == null){
            return false;
        }
        return data1.userdata.orderId <= data2.userdata.orderId
    }
}// end convertConfig

var treeDataConverter = new dhtmlxTreeGridDataConverter(convertConfig); //转换器,将后台取出的数据封装成页面需要的数据组件

var dwrCallerConfig = {              //caller组件的配置,里面具体的方法是可以自己定义的,比如查询,修改这些需要执行的方法,与封装的caller控件一起使用
    querySystem:{methodName:"MenuAction.queryMenuSystem"   //需要执行的方法
        ,converter:new dhtmlxComboDataConverter({   //下拉列表转换器,
            valueColumn:"groupId",textColumn:"groupName",isAdd:true  //valueColumn 下拉列表中的值  textColumn:下拉列表展示的值,这里的如"groupName"的东西是与数据中的字段对应的,
        })},                                                         //如数据库中的字段名是Group_Name或其他格式,这里都是封装成groupName这样的格式
    querySubMenu:{methodName:"MenuAction.querySubMenu",converter:treeDataConverter},
    update:function(afterCall, param){
        dhx.showProgress("菜单管理", "正在加载子菜单数据...");
        //直接调用Dwr
        MenuAction.save(param, function(data){
            if(data){
                afterCall(data);//调用afterCall解析
                dhx.closeProgress();
            }
        })
    }} // end config

/**
 * caller组件的用法: 1.构造函数可以是已经配置好的dwrCallerConfig,里面包含需要执行的方法,也可以是空
 *                 2.可以用addAutoAction,加载自动执行的dwr的方法,格式为caller.addAutoAction(actionName,actionMethod,param)
 actionName为自定义的名称,任意字符串
 actionMethod 为处理的dwr函数,如MenuAction.queryMenuSystem 就是MenuAction中的queryMenuSystem方法执行
 param为参数,他有基本的map格式和{key:value}这样的格式,其中map的格式与biDwrMethodParam组件联合使用多,多用于表单的提交
 3.当某方法需要celler执行回调函数的时候,调用方式为caller.name,其中name是执行的方法的自定义名称,
 如在表格中,我们加载更改之后的数据myGrid.load(caller.name,"json");
 4.caller.executeAction(name),用于执行方法,其中的name是在celler中定义好的执行的方法的名称
 5.加载数据转换器:caller.addDataConverter(name,converter)其中name是在当前caller中定义好的名称.converter转换器组件名称
 */
var dwrCaller = new biDwrCaller(dwrCallerConfig);// caller组件
var imagePath=null;
/**
 * 具体页面展示部分
 */
var menuInit = function(){

    var menuLayout = new dhtmlXLayoutObject(document.body, "2E"); //建立一个布局,document.body表明这个布局附着在哪里,可以是层或者window等,2E为布局格式,详见dhtmlX文档
    //menuLayout.hiddleConcentrate();//隐藏缩放按钮
    menuLayout.cells("a").setText("菜单管理");
    menuLayout.cells("b").hideHeader(true);
    menuLayout.cells("b")
            .setText('<span style="font-weight:normal;">所属系统:</span><span id="_belongSystemLabel" style="font-size:12px;color:#000;font-weight:bold;"></span>');
    menuLayout.cells("a").setHeight(80);
    menuLayout.cells("a").fixSize(false, true);
    menuLayout.hideConcentrate();//隐藏缩放按钮

    //添加查询表单 表单的详细用法详见dhx的文档
    var queryform = menuLayout.cells("a").attachForm([
        {type:"setting"},
        {type:"combo",className:'queryItem',label:"所属系统：",name:"belongSys",readonly:true,labelWidth:60,inputWidth:160} ,
        {type:"newcolumn"},
        {type:"input",className:'queryItem',label:"菜单名称：",name:"menuName",inputHeight:17},
        {type:"newcolumn"},
        {type:"button",className:'queryItem',name:"query",value:"查询"}
    ]); //end form

    //加载元素所属系统下拉数据 ,说明:这里dwrCaller.querySystem是celler的典型用法.
    //其中querySystem一定是要在caller中定义了的,querySystem为定义好的方法名,如这里的querySystem与dwrCallerConfig中定义的querySystem对应
    var sysInit = false;
    queryform.getCombo("belongSys").loadXML(dwrCaller.querySystem, function(){
        $("_belongSystemLabel").innerHTML = queryform.getCombo("belongSys").getSelectedText();
        systemId = queryform.getCombo("belongSys").getSelectedValue();
        sysInit = true;
    });

    //定义loadMen Action的参数来源于表单queryform数据。
    /**
     * biDwrMethodParam组件的用法:1.主要用于参数的获取,这个控件要与caller控件联合使用,一般是在caller执行某个方法的时候,传入参数
     *                            典型用法,在提交表单数据的时候 如:dwrCaller.addAutoAction("loadUserByCondition", "MenuUserAction.queryMenuUserByCondition", loadMenuUserParam,fun)
     *                            其中的loadMenuUserParam就是一个biDwrMethodParam对象,fun为回调函数
     *                          2.setParamConfig方法设置参数,其中index是代表参数的位置,以0开头
     *                                                        type:参数类型,支持4种fun,ui,static,watch.其中使用较多的是
     *                                                             fun和ui
     *                                                             ui:参数来源于页面上组件集合，多个组件以","号分隔，如果其中有form组件，则会遍历form下所有的元素取值
     *                                                             fun:用户自定义回调函数取参数值，取其返回结果。
     *                                                             static:静态常量值，默认，如果是这种类型type可以省略。
     *                                                             watch:动态监控回调函数,使用较少
     *                                                        value:参数的值,可以是用函数return的结果作为参数的值,在获取整个表单数据的时候,通常会使用这样的方式
     *
     *
     *
     */
    loadMenuParam.setParamConfig([
        {
            index:0,type:"fun",value:function(){
            var formData=queryform.getFormData();
            formData.menuName=Tools.trim(queryform.getInput("menuName").value);
            return formData;   //结果为map,与caller联合使用,在dwr的调用方法中,方法中的参数与这里对应
        }
        }
    ]); //end param

    //定义一个加载父级菜单的转换器
    var loadMenutreeDataConverter = dhx.extend({}, treeDataConverter);
    loadMenutreeDataConverter.setDycload(false);

    /**
     * 添加查询Action:loadMenu,添加一个自动执行的action,具体用法见前面caller用法的注释
     */
    dwrCaller.addAutoAction("queryMenu", "MenuAction.queryMenuTreeData", loadMenuParam, function(data){
        $("_belongSystemLabel").innerHTML = queryform.getCombo("belongSys").getSelectedText();
        systemId = queryform.getCombo("belongSys").getSelectedValue();
        dhx.closeProgress();
    });

    //添加数据转换器到caller中,参数1是需要执行的action名称,这里对应的是queryMenu方法,方法名称一定是要在对应的caller组件中定义的
    //                     参数2是转化器的名称,转化器负责将数据以定义好的方式展示出来
    dwrCaller.addDataConverter("queryMenu", loadMenutreeDataConverter);

    //设置权限按钮,具体权限按钮的定义
    var buttons = {
        addSiblingMenu:{name:"addSiblingMenu",text:"新增同级菜单",className:"addSiblingMenu",imgEnabled:base + "/meta/resource/images/addMenu.png",
            imgDisabled:base + "/meta/resource/images/addMenu.png",onclick:function(rowData){
                if(dhx.isArray(rowData) && rowData.length != 0){
                    dhx.alert("一次只能选择一个菜单为其新增同级菜单，您多选了!");
                    return;
                }
                insertMenu(rowData, "sameLevel");
            }},
        addSubMenu:{name:"addSubMenu",text:"新增下级菜单",imgEnabled:base + "/meta/resource/images/addSubmenu.png",
            imgDisabled :base + "/meta/resource/images/addSubmenu.png",onclick:function(rowData){
                if(dhx.isArray(rowData)){
                    dhx.alert("一次只能选择一个菜单为其新增下级菜单，您多选了!");
                    return;
                }
                insertMenu(rowData, "nextLevel");
            }} ,
        deleteMenu:{name:"deleteMenu",text:"删除",imgEnabled:base + "/meta/resource/images/delete.png",
            imgDisabled :base + "/meta/resource/images/delete.png",onclick:function(rowData){
                if(mygrid.hasChildren(rowData.id) > 0){
                    dhx.alert("该菜单有子菜单，不能删除！");
                    return;
                }

                if(dhx.isArray(rowData)){
                    dhx.alert("一次只能选择一个菜单进行删除，您多选了!");
                    return;
                }
                deleteMenu(rowData);
            }},
        updateMenu:{name:"updateMenu",text:"修改",imgEnabled:base + "/meta/resource/images/menu.png",
            imgDisabled :base + "/meta/resource/images/menu.png",onclick:function(rowData){
                if(dhx.isArray(rowData)){
                    dhx.alert("一次只能选择一个菜单进行修改，您多选了!");
                    return;
                }
                updateMenu(rowData);
            }},
        refUser:{name:"refUser",text:"关联用户",imgEnabled:base + "/meta/resource/images/addUser.png",
            imgDisabled :base + "/meta/resource/images/addUser.png", onclick:function(rowData){
                if(dhx.isArray(rowData)){
                    dhx.alert("请选择一个你要查看的菜单");
                    return;
                } else{
                    currMenuId = rowData.id;
                    currMenuName = rowData.data[0];
                    if(currMenuId != undefined){
                        menuUserFun(rowData.id);
                    } else{
                        dhx.alert("对不起,未获取所选菜单的id");
                    }
                }
            }},
        refRole:{name:"refRole",text:"关联角色",imgEnabled:base + "/meta/resource/images/addRole.png",
            imgDisabled :base + "/meta/resource/images/addRole.png",onclick:function(rowData){
                if(dhx.isArray(rowData)){
                    dhx.alert("请选择一个你要查看的菜单");
                    return;
                } else{
                    currMenuId = rowData.id;
                    currMenuName = rowData.data[0];
                    if(currMenuId != undefined){
                        menuRoleFun(currMenuId);
                    } else{
                        dhx.alert("对不起,未获取所选菜单的id");
                    }
                }
            }},
        localMag:{name:"localMag",text:"本地化管理",onclick:function(rowData){
            localMagFun(rowData);
        }}
    };//end buttons按钮权限列表;
    //获取有权限的标签,这里的如"addSiblingMenu"是和按钮的名称对应的
    var buttonRole = ["addSiblingMenu","addSubMenu","deleteMenu","updateMenu","refUser","refRole","localMag"];
//    var buttonRole = getRoleButtons(); // 这里获取的权限按钮方法,为了好调试页面,暂时注释
    var bottonRoleRow = [];
    for(var i = 0; i < buttonRole.length; i++){
        if(buttonRole[i] == "addSiblingMenu"){
            bottonRoleRow.push(buttonRole[i]);
        }
    }

    /**
     * 定义全局函数，用于获取有权限的button列表定义
     */
    window["getSelectButtons"] = function(){
        var res = [];
        for(var i = 0; i < buttonRole.length; i++){
            res.push(buttons[buttonRole[i]]);
        }
        return res;
    };
    window["getButtons"] = function(){
        var res = [];
        for(var i = 0; i < bottonRoleRow.length; i++){
            res.push(buttons[bottonRoleRow[i]]);
        }
        return res;
    };

    //这里将有权限的按钮添加到表格的title中
    var buttonToolBar = menuLayout.cells("b").attachToolbar();  //dhx的本身方法,用于在layout中添加按钮行
    var pos = 1;
    var filterButton = window["getButtons"]();
    for(var i = 0; i < filterButton.length; i++){
        buttonToolBar.addButton(filterButton[i].name, pos++, filterButton[i].text, filterButton[i].imgEnabled,
                filterButton[i].imgDisabled);
        var button=buttonToolBar.getItemNodeById(filterButton[i].name);
        button.setAttribute("id",filterButton[i].name);
    }
    var changMenuLevel = {id:'changeLevel',classname:'changeLevel',name:"changeLevel",text:"确定菜单层次更改",imgEnabled:base +
                                                                                                                 "/meta/resource/images/changeLevel.png",
        imgDisabled:base + "/meta/resource/images/changeLevel.png"}
    buttonToolBar.addButton(changMenuLevel.name, 7, changMenuLevel.text, changMenuLevel.imgEnabled,
            changMenuLevel.imgDisabled);
        var button=buttonToolBar.getItemNodeById(changMenuLevel.name);
        button.setAttribute("id",changMenuLevel.name);
    //buttonToolBar.attachEvent("onClick",function(itemId){

    //})

    //定义表格的展示
    imagePath = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/";
    mygrid = menuLayout.cells("b").attachGrid();
    mygrid.setImagePath(imagePath);
    //mygrid.setIconPath(imagePath);
    mygrid.setHeader("菜单名称,菜单地址,是否显示,图标,目标窗口,操作");
    mygrid.setInitWidthsP("20,25.1,6,5,6,"+(window.screen.width>1024?"38":"55"));
    mygrid.setColAlign("left,left,center,center,center,center");
    mygrid.setHeaderAlign("left,left,center,center,center,center");
    mygrid.enableResizing("true,true,true,true,false,false");	//不允许拖动列宽
    mygrid.setColTypes("tree,ro,ro,ro,ro,sb");
//    mygrid.enableCtrlC();
    mygrid.setColSorting("na,na,na,na,na,na");
    mygrid.enableTooltips("true,true,true,true,true,false");
    mygrid.enableTreeGridLines();
    mygrid.setEditable(false);
    mygrid.setColumnCustFormat(2, yesOrNo);//第二列进行转义,其中yesOrNo是在resource\js\commonFormater.js中定义的
    mygrid.setColumnIds("menuName,menuUrl,isShow,iconUrl,target");//关键,这里的每一项是和前面的转换器中的filterColumns属性值一一对应的
    mygrid.enableDragAndDrop(true);//设置拖拽
    mygrid.setDragBehavior("complex");
    mygrid.init(); //必须加这句,表格才会被显示出来
    var loadGridData = function(){
        if(sysInit){
            dhx.showProgress("菜单管理", "正在查询菜单数据...");
            mygrid.load(dwrCaller.queryMenu, "json");
        } else{
            setTimeout(arguments.callee, 10);
        }
    };
    loadGridData();
    mygrid.kidsXmlFile = dwrCaller.querySubMenu; //加载子系统
    mygrid.attachEvent("onXLE", function(){
        if(mygrid.getRowsNum() && !mygrid.getSelectedRowId()){
            mygrid.selectRow(0);//默认选择一行
        }
        mygrid.forEachRow(function(id){
            if(mygrid.cells(id,3).cell._cellType=="img"){
                mygrid.cells(id,3).cell.lastChild.style.width="18px";
                mygrid.cells(id,3).cell.lastChild.style.height="18px";
            }
        });
    })
    /**
     *工具栏按钮事件处理中转
     *@param buttonId 按钮的名称
     *@param rowData 当前行的数据
     */
    var buttonEventHandle = function(buttonId, rowData){
        if(buttonId == "changeLevel"){
            if(Tools.isEmptyObject(modifyMoveData)){
                dhx.alert("您没有修改菜单层级，不能提交！");
            }else{
                var levelData=[];
                for(var menuId in modifyMoveData){
                    levelData.push({menuId:menuId,orderId:modifyMoveData[menuId].orderId,parentId:modifyMoveData[menuId].parentId});
                }
                dwrCaller.executeAction("changeLevel",levelData,orderData,function(data){
                    if(data){
                        mygrid.forEachRow(function(id){
                            mygrid.setRowTextStyle(id,modifyStyle.clear);
                        });
                        modifyMoveData={};
                        orderData={};
                        dhx.alert("层级修改成功！");
                    }else{
                        dhx.alert("修改失败，请重试！");
                    }
                });
            }
        } else{//buttons[buttonId].onclick){
            buttons[buttonId].onclick(rowData.length == 1 ? rowData[0] : rowData);
        }
    }//end

    /**
     *添加工具栏button事件处理
     */
    buttonToolBar.attachEvent("onclick", function(id){
        var selectedRowIds = mygrid.getSelectedRowId();
        var rowDatas = [];
        if(!selectedRowIds){
            if(id != "addSiblingMenu"&&id!="changeLevel"){ //同级节点未选择默认为新增根节点。
                dhx.alert("请选择一行进行操作!");
                return;
            } else{//如果其未选节点，默认找到当前第一个节点，如果没有找到，设置其父节点为0
                var rowData = {};
                if(mygrid.getRowsNum() == 0){
                    rowData.parentId = 0;
                    rowData.getParentId = function(){
                        return 0
                    };
                    rowData.userdata = {groupId:systemId}
                } else{
                    rowData = mygrid.getRowData(mygrid.getRowId(0));//取第0行
                }
                rowDatas.push(rowData);
            }
        } else{
            selectedRowIds = selectedRowIds.split(",");
            for(var i = 0; i < selectedRowIds.length; i++){
                rowDatas.push(mygrid.getRowData(selectedRowIds[i]));
            }
        }//end else
        //if(id =='changeLevel'){
        // dwrCaller.executeAction("updateMenuRef");
        //}
        buttonEventHandle(id, rowDatas);
    }); //end buttonToolBar

    /**
     * 表单查询事件
     */

    queryform.attachEvent("onButtonClick", function(id){
        if(id == "query"){
            mygrid.clearAll();
            mygrid.load(dwrCaller.queryMenu, "json");
        }
    });
    queryform.getInput("menuName").onkeypress=function(e){
        e=e||window.event;
        var keyCode=e.keyCode;
        if(keyCode==13){
            mygrid.clearAll();
            mygrid.load(dwrCaller.queryMenu, "json");
        }
    }

//    var menu = new dhtmlXMenuObject();
//    menu.renderAsContextMenu();
//    menu.attachEvent("onClick", function(menuItemId){
//        var data = mygrid.contextID.split("_");
//        //rowInd_colInd;
//        var rowId = data[0];
//        var rowData = mygrid.getRowData(rowId);
//        buttonEventHandle(menuItemId, rowData);
//        return true;
//    });
//    pos = 0;
//    for(var i = 0; i < filterButton.length; i++){
//        menu.addNewChild(null, pos++, filterButton[i].name, filterButton[i].text, false, filterButton[i].imgEnabled,
//                filterButton[i].imgDisabled);
//    }
//    mygrid.enableContextMenu(menu);
    list = [];
    var currRowdata = {}; //移动的时候，绑定在td节点的data会移除，所以，需要重新绑定数据，这些数据对后面的操作
    //非常有用，这个变量保存当前移动节点及其子节点的数据，便于重置。以rowId作为键值。
    var  iconImage="ro";
    mygrid.attachEvent("onDrag", function(sId, tId, sObj, tObj, sInd, tInd){
        if(!tId){ //拖动至grid区域以外，直接返回。
            return false;
        }
        //缓存TD节点以及子节点数据
        currRowdata = backUpGridData(sId);
        var x = mygrid._h2.get[sId];
        //记录节点原来位置
        if(currRowdata[sId]._orgIndex == null || currRowdata[sId]._orgIndex == undefined){
            currRowdata[sId]._orgIndex = x.index;
        }
        //如果源ID的父节点只有一个子节点了，将其图标设置为叶子节点的图标。
        var sparId = mygrid.getParentId(sId);
        if(mygrid.getSubItems(sparId).split(",").length == 1){
            mygrid.rowsAr[sparId]&&(mygrid.rowsAr[sparId].imgTag.nextSibling.src=imagePath+"/leaf.gif");
            mygrid._h2.get[sparId].has_kids=false;//无子菜单表示
        }
        //缓存当前图标列的类型
        iconImage=mygrid.cells(sId,3).cell._cellType;
        return true;
    });
    mygrid.attachEvent("onDrop", function(sId, tId, dId, sObj, tObj, sCol, tCol){
        var sparId = mygrid.getParentId(sId);
        var tparId = mygrid.getParentId(tId);
        if(sparId != tparId){ //父子节点拖动
            mygrid.rowsAr[tId]&&(mygrid.rowsAr[tId].imgTag.nextSibling.src=imagePath+"/folderOpen.gif");
        }
        sparId&& (mygrid.rowsAr[sparId]&&(mygrid.rowsAr[sparId].imgTag.nextSibling.src=imagePath+"/folderOpen.gif"));
        restoreGridData(sId, currRowdata);
        dealMoveData(sId, tId, currRowdata[sId],sparId != tparId);
        mygrid.setCellExcellType(sId,3,iconImage);
    });
    mygrid.attachEvent("onOpenStart", function(id,state){
        //因为dhtmlx在移动过程中，会自动展开下级，且会生成一个新的ID，其ID由时间种子生成，大于Java所表示的Integer的最大值。
        //这里返回不让其展开，以免报错
        if(state==-1&&parseInt(id)>2147483648){
            return false;
        }
        return true;
    });

}
dwrCaller.addAutoAction("changeLevel", MenuAction.changeLevel);
dwrCaller.isDealOneParam("changeLevel", false);

/**
 * 备份treegrid数据
 * @param id
 */
var backUpGridData = function(id){
    //数据备份
    var ids = [id];
    var currRowdata = {};
    var subIds = mygrid.getSubItems(id);
    if(subIds){
        ids = ids.concat(subIds.split(","));
    }
    for(var i = 0; i < ids.length; i++){
        currRowdata[ids[i]] = mygrid.getRowData(ids[i]);
    }
    return currRowdata;
}
/**
 * 还原TreeGrid数据
 * @param id
 */
var restoreGridData = function(id, currRowdata){
    var ids = [id];
    var subIds = mygrid.getSubItems(id);
    if(subIds){
        ids = ids.concat(subIds.split(","));
    }
    for(var i = 0; i < ids.length; i++){
        var cell= mygrid.cells(ids[i], 0).cell;
        mygrid.cells(ids[i], 0).cell.parentNode._attrs = currRowdata[ids[i]];
        if(cell._cellType=="img"){
            mygrid.cells(ids[i],3).cell.lastChild.style.width="18px";
            mygrid.cells(ids[i],3).cell.lastChild.style.height="18px";
        }
        if(mygrid.hasChildren(ids[i])){
            mygrid.rowsAr[ids[i]]&&(mygrid.rowsAr[ids[i]].imgTag.nextSibling.src=imagePath+"/folderOpen.gif");
        } else{
            mygrid.rowsAr[ids[i]]&&(mygrid.rowsAr[ids[i]].imgTag.nextSibling.src=imagePath+"/leaf.gif");
        }
    }
}
var moveDataSrcParId={};//移动数据原始父节点。
var modifyMoveData={};//修改的层级移动数据，以menuId作为键值，value为{orderId，parentId}
var modifyStyle = {
    move:"font-weight:bold;color:#EEC900",
    order: "font-weight:bold;color:#7A378B",
    clear:"font-weight:normal;font-style::normal;text-decoration:none;color:black;border-bottom:0px;"
};
//排序数据。以menuId作为键值，orderId作为value
var orderData={};
/**
 * 节点移动数据处理，这里没有对节点是否能够移动的逻辑进行处理，这里只是节点移动完成之后做数据的缓存操作。
 * @param sId
 * @param tId
 * @param sRowData 原始rowData
 * @param isChildMove 是否为父子拖动
 */
var dealMoveData = function(sId, tId, sRowData,isChildMove){
    var moveData = {orderId:sRowData.userdata.orderId,parentId:sRowData.userdata.parentId};
    if(isChildMove){
        moveData.parentId=tId;
        //对排序值的处理
//        var source = mygrid._h2.get[sId];
//        var next = source.parent.childs[source.index + 1];
//        var pre = source.parent.childs[source.index - 1];
//        var order = next ? (parseInt(mygrid.getRowData(next.id).userdata["orderId"]) - 1) : (pre
//                ? (parseInt(mygrid.getRowData(pre.id).userdata["orderId"]) + 1) : 0);
//        moveData["orderId"] = order;
    }else{
//        moveData["orderId"] = (tRowData.userdata.orderId==null||tRowData.userdata.orderId==undefined?0:tRowData.userdata.orderId)+1;
        moveData.parentId=mygrid.getParentId(tId);
    }
    //    记录原始父节点值
    if(moveDataSrcParId[sId] == undefined || moveDataSrcParId[sId] == null){
        moveDataSrcParId[sId] = sRowData.getParentId();
    }
    var x = mygrid._h2.get[sId];
    modifyMoveData[sId]=moveData;
    var parId=moveData.parentId;
    //节点再次移动，比较节点原来的父ID与现在的父ID是否相同，相同则已经移到了原来的位置
    if(isChildMove){
        if(moveDataSrcParId[sId] == tId){
            if(sRowData._orgIndex == x.index){
                mygrid.setRowTextStyle(sId,modifyStyle.clear);
                modifyMoveData[sId]=null;
                delete modifyMoveData[sId];
            }else{
                mygrid.setRowTextStyle(sId,modifyStyle.order);
            }
        }else{
            mygrid.setRowTextStyle(sId, modifyStyle.move);
        }
    }else{
        if(moveDataSrcParId[sId] == parId){
            if(sRowData._orgIndex == x.index){
                mygrid.setRowTextStyle(sId,modifyStyle.clear);
                modifyMoveData[sId]=null;
                delete modifyMoveData[sId];
            }else{
                mygrid.setRowTextStyle(sId,modifyStyle.order);
            }
        }else{
            mygrid.setRowTextStyle(sId,modifyStyle.move);
        }
    }
    //排序处理     计算order值。原理：同层级order值从前往后依次从1递加。
    var childCount=mygrid.hasChildren(parId);
    if(childCount>0){
        for(var i=0;i<childCount;i++){
            var childId=parseInt(mygrid.getChildItemIdByIndex(parId,i));
            if(mygrid.getRowData(childId).userdata.orderId!=(i+1)){
                orderData[childId]=i+1;
            }else{
                delete  orderData[childId];
            }
        }
    }
}

/**************************菜单本身数据加载end********************************************************/

/**************************新增数据加载start********************************************************/
/**
 * 菜单按钮列表格式验证，菜单按钮只能以如下格式:  按钮唯一标示+":"+按钮名称，多个按钮以","号分隔。
 * @param value
 */
var buttonCheck = function(value){
    //为便于匹配，将value最后一个字符复制一个。
    value += value.substr(value.length - 1, 1);
    var reg = /\w+:[\w\u4e00-\u9fa5]+(,\w+:[\w\u4e00-\u9fa5]+)*[\w\u4e00-\u9fa5]$/;
    if(!reg.test(value)){
        return '菜单按钮列表格式不正确，正确格式应为:按钮唯一标示+":"+按钮描述，多个按钮以","号分隔，如：' + 'add:新增,del:删除';
    }
    return true;
}

/**
 * 定义加载痛层级最大序列号
 */
dwrCaller.addAutoAction("loadMaxMinOrder","MenuAction.queryMaxMinOrder",function(data){
    //$("_maxOrder").innerHTML=data.MAX_ORDER||0;
    //$("_minOrder").innerHTML=data.MIN_ORDER||0;
});

var insertMenu = function(rowData, level){
    var dhxWindow = new dhtmlXWindows();
    var winSize=Tools.propWidthDycSize(15,20,15,20);
    winSize.width=550;
    dhxWindow.createWindow("addWindow", 0, 0, 750, 480);
    var addWindow = dhxWindow.window("addWindow");
    addWindow.setModal(true);
    addWindow.setDimension(winSize.width, 420);
    addWindow.center();
    //addWindow.setPosition(addWindow.getPosition()[0],0);
    addWindow.button("minmax1").hide();
    addWindow.button("minmax2").hide();
    addWindow.button("park").hide();
    addWindow.denyResize();
    addWindow.denyPark();
    addWindow.setText("新增菜单");
    addWindow.keepInViewport(true);
    addWindow.show();
    var addMenuLayout = new dhtmlXLayoutObject(addWindow, "1C");
    addMenuLayout.cells("a").hideHeader();
    //addMenuLayout.cells("b").setHeight(40);
    // addMenuLayout.cells("b").hideHeader();
    addMenuLayout.cells("a").fixSize(true, true);
    //addMenuLayout.cells("b").fixSize(true, true);
    var menuFormData = [
        {type: "settings", position: "label-left"},
        {type:"block",className:"blockStyle",list:[
            {type:"label",label:'<span style="color:#000;font-size:12px;margin-left:30px;width:100px;">所属系统：</span>'},
            {type:"newcolumn"},
            {type:"label",label:'<span id="belongSysName" style="color:#000"></span>',name:"belongSys",labelWidth:100},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:28px;">父级菜单：</span>',offsetLeft:10},
            {type:"newcolumn"},
            {type:"label",name:"parentMenuName",label:'<span id="FatherMenuName" style="color:#000"></span>',labelWidth:100}
        ]},
        //end block
        {type:"block",className:"blockStyle",list:[
            {type:"input",label:"<span style='margin-left:25px;'>菜单名称：</span>",name:"menuName",inputWidth:150,validate:"NotEmpty,MaxLength[64]",className:"inputStyle"},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:red">*（请输入菜单名称）</span>'},
            {type:"newcolumn"},
            //{type:"input",label:"<span style='margin-left:12px;'>菜单地址：</span>",name:"menuUrl",inputWidth:120,validate:"MaxLength[512]",className:"inputStyle"},
            {type:"newcolumn"}//,
            //{type:"label",label:'<span style="color:red">*</span>'}
        ]},

        {type:"block",className:"blockStyle",list:[

            {type:"input",label:"x：",rows:3,label:"<span style='margin-left:25px;'>菜单地址：</span>",name:"menuUrl",inputWidth:350,validate:"MaxLength[1024]",className:"inputStyle"},
            {type:"newcolumn"}//,
        ]},
        //end block
    /**
     {type:"block",className:"blockStyle",list:[
     {type:"input",label:"<span style='padding-left:49px;'>序号：</span>", name:"orderId",inputWidth:40,validate:"ValidNumeric",className:"inputStyle"},
     {type:"newcolumn"},
     {type:"label",label:'<span style="color:#A1A1A1;font-size:1.0em;">当前层级下最大序号为：' +
     '<span style="color:red;font-size:14px;" id="_maxOrder"></span>，最小为：' +
     '<span style="color:red;font-size:14px;" id="_minOrder"></span></span>',labelWidth:340}

     ]},
     **/
        {type:"block",className:"blockStyle",list:[
            {type:"label",label:'<div style="padding-left: 26px; " class="item_label_left"><div class="dhxlist_txt_label align_left">' +
                                '<label for="_fileupload">图标地址：</label></div><div class="dhxlist_cont" style="height:20px;">' +
                                '<form enctype="multipart/form-data" action="upload" name="uploadForm" id="_uploadForm" method="post">' +
                                '<input style="width:250px;" class="dhxlist_txt_textarea" name="iconUrl" id="_fileupload" type="FILE" accept="image/*"></form></div></div>',name:"file",labelWidth:620},
//            {type:'file',name: "iconUrl", label: "图标地址：",offsetLeft:28},
            {type:'hidden',name: "iconUrl"}]},
//end block
        {type:"block",className:"blockStyle",list:[
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:30.5px;">显示菜单：</span>'},
            {type:"newcolumn"},
            {type:"radio", className:"radioStyle",value:1,name:"isShow",checked:true},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;">是</span>'},
            {type:"newcolumn"},
            {type:"radio", value:0,name:"isShow"},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;">否</span>'}
        ]},
//end block
        {type:"block",className:"blockStyle",list:[
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:30.5px;">目标窗口：</span>'},
            {type:"newcolumn"},
            {type:"combo",className:"combo",readonly:true,name:"target",options:[
                {text:"right",value:"right",selected:true},
                {text:"blank",value:"blank",selected:false},
                {text:"top",value:"top",selected:false}
            ]}
        ]},
        {type:"block",className:"blockStyle",name:"browserState",list:[
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:16px;font-weight:normal">浏览器状态：</span>',labelWidth:90},
            {type:"newcolumn"},
            {type:"checkbox",className:"checkBox",name:"isMax",value:1,position:"label-right",checked:false},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;margin-left:-8px;">最大化</span>'},
            {type:"newcolumn"},
            {type:"checkbox",className:"checkBox",name:"isScroll",value:2,checked:false},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;margin-left:-2px;">滚动条</span>'},
            {type:"newcolumn"},
            {type:"checkbox",className:"checkBox",name:"isMenuBar",value:4,checked:false},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;margin-left:-2px;">菜单栏</span>'},
            {type:"newcolumn"},
            {type:"checkbox",className:"checkBox",name:"isStatusBar",value:8,checked:false},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;margin-left:-2px;">状态栏</span>'},
            {type:"newcolumn"},
            {type:"checkbox",className:"checkBox",name:"isLinkBar",value:8,checked:false},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;margin-left:-2px;">链接栏</span>'}
        ]},
//end block
        {type:"block",className:"blockStyle",list:[
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:6.5px;">传输用户属性：</span>', name:"userAttr"},
            {type:"newcolumn"},
            {type:"radio", className:"radioStyle",value:1,name:"userAttr",checked:true},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;">是</span>'},
            {type:"newcolumn"},
            {type:"radio", value:0,name:"userAttr"},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;">否</span>'}
        ]},
//end block
        {type:"block",className:"blockStyle",list:[
            {type:"input",label:"x：",label:"菜单按钮列表：",rows:3,name:"pageButton",labelWidth:80,inputWidth:350,validate:"ValidByCallBack[buttonCheck],MaxLength[256]",className:"inputStyle"}
        ]},
        {type:"hidden",name:"groupId"},
        {type:"hidden",label:"parentId",value:0},
        {type:"hidden",label:"menuId",value:0},

        {type:"block",offsetTop:20,inputTop :20,list:[
            {type: "settings", position: "label-left"},
            {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:150},
            {type:"newcolumn"},
            {type:"button",label:"清空",name:"reset",value:"清空"},
            {type:"newcolumn"},
            {type:"button",label:"关闭",name:"close",value:"关闭"}
        ]}
    ] //end menuFormData

    var addForm = addMenuLayout.cells("a").attachForm(menuFormData);
    //目标窗口名称和浏览器状态之间的联动
    addForm.getCombo("target").attachEvent("onChange",function(){
        if(addForm.getCombo("target").getSelectedValue()=="blank"){
            addForm.enableItem("browserState");
            addForm.checkItem('isMax');
            addForm.checkItem('isScroll');
            addForm.checkItem('isMenuBar');
            addForm.checkItem('isStatusBar');
            addForm.checkItem('isLinkBar');

        }else{
            addForm.disableItem("browserState");
            addForm.uncheckItem('isMax');
            addForm.uncheckItem('isScroll');
            addForm.uncheckItem('isMenuBar');
            addForm.uncheckItem('isStatusBar');
            addForm.uncheckItem('isLinkBar');
        }
    });
    addForm.base[0].parentNode.style.overflowX="hidden";
    $("_uploadForm").setAttribute("action",urlEncode(getBasePath()+"/meta/module/mag/menu/menuIconPost.jsp"))
    addForm.disableItem("belongSys");
    addForm.disableItem("parentMenuName");
    addForm.getCombo("target").readonly(true, false);

//初始化数据
    var parentId = (level == "nextLevel" ? rowData.id : (rowData.getParentId() || 0));

    var initForm = function(){
        var parentRowData = (level == "nextLevel" ? rowData : (mygrid.getRowData(parentId)));
        var parentMenuName = (level == "nextLevel" ? rowData.data[0] : (parentRowData ? parentRowData.data[0] : "根节点"));
        var initData = {
            belongSys:$("_belongSystemLabel").innerHTML,
            parentMenuName:parentMenuName,target:"right",groupId: rowData.userdata.groupId,
            parentId:parentId
        };
        document.getElementById("belongSysName").innerHTML = $("_belongSystemLabel").innerHTML;
        document.getElementById("FatherMenuName").innerHTML = parentMenuName;

        addForm.setFormData(initData);
    };
    initForm();
//加载此层级最大order。
    dwrCaller.executeAction("loadMaxMinOrder", parentId);
//    //form默认验证机制，极重要
    addForm.defaultValidateEvent();
//新增Dwr addMenu方法
    dwrCaller.addAction("insertMenu", function(afterCall, param){
        dhx.closeProgress();
        //执行Dwr方法
        MenuAction.insertMenu(param, function(data){
            if(data.type == "error" || data.type == "invalid"){
                dhx.alert("对不起，新增出错，请重试！");
            } else{
                dhx.alert("新增成功");
                addWindow.close();
                mygrid.updateGrid(treeDataConverter.convert(data.successData), "insert");
                var cell= mygrid.cells(data.successData.MENU_ID,3).cell;
                if(data.successData.ICON_URL){
                    mygrid.setCellExcellType(data.successData.MENU_ID,3,"img");
                }
                if(cell._cellType=="img"){
                    cell.lastChild.style.width="18px";
                    cell.lastChild.style.height="18px";
                }
            }
        });
    });
//添加表单处理事件
    addForm.attachEvent("onButtonClick", function(id){
        if(id == "save"){//保存
            if(addForm.validate()){
                //先上传文件
                var file=null;
                var supportFile=['png','gif','jpg','jpeg'];
                if(file=dwr.util.getValue("_fileupload")){
                    if(new RegExp("["+supportFile.join("|")+"]$","i").test(file)){
                        var iframeName="_uploadFrame";
                        var ifr=$(iframeName);
                        //生成一个隐藏iframe，并设置form的target为该iframe，模拟ajax效果
                        if(!ifr){
                            ifr=document.createElement("iframe");
                            ifr.name=iframeName;
                            ifr.id=iframeName;
                            ifr.style.display="none";
                            document.body.appendChild(ifr);
                            if (ifr.attachEvent){
                                ifr.attachEvent("onload", function(){
                                    //alert(window.frames[iframeName].fileName);
                                    addForm.setItemValue("iconUrl",window.frames[iframeName].fileName);
                                    addForm.send(dwrCaller.insertMenu);
                                });
                            } else {
                                ifr.onload = function(){
                                    // alert(window.frames[iframeName].fileName);
                                    addForm.setItemValue("iconUrl",window.frames[iframeName].fileName);
                                    addForm.send(dwrCaller.insertMenu);
                                };
                            }
                        }
                        var fm = $("_uploadForm");
                        fm.target = iframeName;
                        $("_uploadForm").submit();
                    }else{
                        dhx.alert("请选择一个图片文件，支持格式png/gif/jpg/jpeg");
                        return;
                    }
                }else{
                    dhx.showProgress("菜单管理", "正在提交表单数据...");
                    addForm.send(dwrCaller.insertMenu);
                }
            }
        }else if(id == "reset"){//重置
            addForm.clear();
            initForm();
        } else if(id == "close"){
            addWindow.hide();
            addForm.unload();
            dhxWindow.unload();
        }
    });
    addForm.setItemFocus("menuName");
    addWindow.attachEvent("onClose", function (id, value, checkedState){
        addWindow.hide();
        dhtmlxValidation.clearAllTip();
        addForm.unload();
        dhxWindow.unload();
    });
};//end insertMenu

/**************************新增数据加载end********************************************************/

/**************************修改数据加载start********************************************************/
var updateMenu = function(rowData){
    //初始化新增弹出窗口。
    var dhxWindow = new dhtmlXWindows();
    var winSize=Tools.propWidthDycSize(15,20,15,20);
    winSize.width=550;
    dhxWindow.createWindow("modifyWindow", 0, 0, 600, 340);
    var modifyWindow = dhxWindow.window("modifyWindow");
    modifyWindow.setModal(true);
    modifyWindow.setDimension(winSize.width, 440);
    modifyWindow.center();
//    addWindow.setPosition(addWindow.getPosition()[0],0);
    modifyWindow.button("minmax1").hide();
    modifyWindow.button("minmax2").hide();
    modifyWindow.button("park").hide();
    modifyWindow.denyResize();
    modifyWindow.denyPark();
    modifyWindow.setText("修改菜单");
    modifyWindow.keepInViewport(true);
    modifyWindow.show();
    var modifyMenuLayout = new dhtmlXLayoutObject(modifyWindow, "1C");
    modifyMenuLayout.cells("a").hideHeader();
    //modifyMenuLayout.cells("b").setHeight(30);
    //modifyMenuLayout.cells("b").hideHeader();
    modifyMenuLayout.cells("a").fixSize(true, true);
    //modifyMenuLayout.cells("b").fixSize(true, true);
    var menuFormData = [
        {type:"setting",position: "label-left", labelWidth: 120, inputWidth: 150},
        {type:"block",className:"blockStyle",list:[
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:30px;height:20px;line-height:20px;">所属系统：</span>'},
            {type:"newcolumn"},
            {type:"label",label:'<span id="belongSysName" style="color:#000;height:20px;line-height:20px;"></span>',name:"belongSys",labelWidth: 120},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;height:20px;line-height:20px;padding-left:30px;">父级菜单：</span>'},
            {type:"newcolumn"},
            {type:"label",label:'<span id="FatherMenuName" style="color:#000;height:20px;line-height:20px;"></span>',labelWidth:100}
        ]},
        //end block
        {type:"block",className:"blockStyle",list:[
            {type:"input",label:"<span style='padding-left:25px;'>菜单名称：</span>",name:"menuName",inputWidth:150,validate:"NotEmpty,MaxLength[64]",className:"inputStyle"},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:red">*（请输入菜单名称）</span>'},
            {type:"newcolumn"}

            //{type:"label",label:'<span style="color:red">*</span>'}
        ]},

        {type:"block",className:"blockStyle",list:[
            {type:"input",rows:2,label:"<span style='padding-left:25px;'>菜单地址：</span>",name:"menuUrl",inputWidth:350,validate:"MaxLength[1024]",className:"inputStyle"},
            {type:"newcolumn"}//,
        ]},
        //end block
    /**
     {type:"block",className:"blockStyle",list:[
     {type:"input",label:"<span style='padding-left:49px;'>序号：</span>", name:"orderId",inputWidth:15,validate:"ValidNumeric",className:"inputStyle"},
     {type:"newcolumn"},
     {type:"label",label:'<span style="color:#000;font-size:12px;">注：序号越小排名越前，当前层级最大值为：' +
     '<span style="color:#000;font-size:14px;font-weight: bold;" id="_maxOrder"></span>，最小值为：' +
     '<span style="color:#000;font-size:14px;font-weight: bold;" id="_minOrder"></span></span>',labelWidth:370}
     //{type:'input',label:"图标地址:",name:"iconUrl",inputWidth:150,validate:"MaxLength[100]",className:"inputStyle"}
     //            {type:'file',name: "iconUrl", label: "图标地址：",offsetLeft:28}
     ]},
     **/
        {type:"block",className:"blockStyle",list:[
            {type:"label",labelHeight:25,label:'<div style="padding-left: 25px; left;height:25px;" class="item_label_left"><div class="dhxlist_txt_label align_left" >' +
                                               '<label for="_fileupload" style="float:left;position:absolute;top:12px;left:33px;">图标地址：</label></div>'+
                                               '<div class="dhxlist_cont" style="float:left;position:absolute;top:10px;left:99px;">' +
                                               '<form enctype="multipart/form-data" action="upload" name="uploadForm" id="_uploadForm" method="post">' +
                                               '<input style="width:250px;" class="dhxlist_txt_textarea" name="iconUrl" id="_fileupload" type="FILE" accept="image/*"></form></div>' +
                                               '<img src=""  id="_menuIconImg" style="width: 18px;height: 18px;float:left;position:absolute;top:10px;left:354px;"></div>',name:"file",labelWidth:620},
//            {type:'file',name: "iconUrl", label: "图标地址：",offsetLeft:28},
            {type:'hidden',name: "iconUrl"}]},
        //end block
        {type:"block",className:"blockStyle",list:[
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:30.5px;">显示菜单：</span>'},
            {type:"newcolumn"},
            {type:"radio", className:"radioStyle",value:1,name:"isShow",checked:true},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;">是</span>'},
            {type:"newcolumn"},
            {type:"radio", value:0,name:"isShow"},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;">否</span>'}
        ]},
        //end block
        {type:"block",className:"blockStyle",list:[
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:30.5px;">目标窗口：</span>',labelWidth:95},
            {type:"newcolumn"},
            {type:"combo",className:"combo",readonly:true,name:"target",options:[
                {text:"blank",value:"blank"},
                {text:"top",value:"top"},
                {text:"right",value:"right"}
            ]}
        ]},
        {type:"block",className:"blockStyle",name:"browserState",list:[
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:17px;">浏览器状态：</span>',labelWidth:90},
            {type:"newcolumn"},
            {type:"checkbox",className:"checkBox",name:"isMax",value:1},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:0px;">最大化</span>'},
            {type:"newcolumn"},
            {type:"checkbox",className:"checkBox",name:"isScroll",value:2},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:0px;">滚动条</span>'},
            {type:"newcolumn"},
            {type:"checkbox",className:"checkBox",name:"isMenuBar",value:4},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:0px;">菜单栏</span>'},
            {type:"newcolumn"},
            {type:"checkbox",className:"checkBox",name:"isStatusBar",value:8},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:0px;">状态栏</span>'},
            {type:"newcolumn"},
            {type:"checkbox",className:"checkBox",name:"isLinkBar",value:8},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:0px;">链接栏</span>'}
        ]},
        //end block
        {type:"block",className:"blockStyle",list:[
            {type:"label",label:'<span style="color:#000;font-size:12px;padding-left:6px;">传输用户属性：</span>', name:"userAttr"},
            {type:"newcolumn"},
            {type:"radio", className:"radioStyle",value:1,name:"userAttr",checked:true},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;">是</span>'},
            {type:"newcolumn"},
            {type:"radio", value:0,name:"userAttr"},
            {type:"newcolumn"},
            {type:"label",label:'<span style="color:#000;font-size:12px;">否</span>'}
        ]},
        //end block
        {type:"input",label:"菜单按钮列表：",offsetLeft:4,rows:3,name:"pageButton",labelWidth:90,inputWidth:350,validate:"ValidByCallBack[buttonCheck],MaxLength[256]",className:"inputStyle"},

        {type:"hidden",name:"groupId"},
        {type:"hidden",label:"parentId",value:0},
        {type:"hidden",label:"menuId",value:0},

        {type:"block",className:"blockStyle",offsetTop:20,list:[
            {type: "settings", position: "label-left"},
            {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:150,offsetTop:5},
            {type:"newcolumn"},
            {type:"button",label:"重置",name:"reset",value:"重置",offsetTop:5},
            {type:"newcolumn"},
            {type:"button",label:"关闭",name:"close",value:"关闭",offsetTop:5}
        ]}
    ] //end menuFormData
    var modifyForm = modifyMenuLayout.cells("a").attachForm(menuFormData);
    //目标窗口名称和浏览器状态之间的联动
    modifyForm.getCombo("target").attachEvent("onChange",function(){
        if(modifyForm.getCombo("target").getSelectedValue()=="blank"){
            modifyForm.enableItem("browserState");
            modifyForm.checkItem('isMax');
            modifyForm.checkItem('isScroll');
            modifyForm.checkItem('isMenuBar');
            modifyForm.checkItem('isStatusBar');
            modifyForm.checkItem('isLinkBar');

        }else{
            modifyForm.disableItem("browserState");
            modifyForm.uncheckItem('isMax');
            modifyForm.uncheckItem('isScroll');
            modifyForm.uncheckItem('isMenuBar');
            modifyForm.uncheckItem('isStatusBar');
            modifyForm.uncheckItem('isLinkBar');
        }
    });
    modifyForm.base[0].parentNode.style.overflowX="hidden";
    $("_uploadForm").setAttribute("action",urlEncode(getBasePath()+"/meta/module/mag/menu/menuIconPost.jsp"));
    modifyForm.disableItem("belongSys");
    modifyForm.disableItem("parentMenuName");
    modifyForm.getCombo("target").readonly(true, false);
    //var buttonForm=modifyMenuLayout.cells("b").attachForm([

    //]);
    //设置初始值。不能被重置的。
    var parentId = rowData.getParentId() || 0;

    //加载此层级最大order。
    dwrCaller.executeAction("loadMaxMinOrder", parentId);
    var initForm = function(){
        var parentRowData = mygrid.getRowData(parentId);
        var parentMenuName = parentRowData ? parentRowData.data[0] : "根节点";
        var initData = {
            belongSys:$("_belongSystemLabel").innerHTML,
            parentMenuName:parentMenuName,target:
                    "blank",groupId: rowData.userdata.groupId,
            parentId:parentId,menuId:rowData.id
        };
        modifyForm.setFormData(initData);
        document.getElementById("belongSysName").innerHTML = $("_belongSystemLabel").innerHTML;
        document.getElementById("FatherMenuName").innerHTML = parentMenuName;
    };
    initForm();
    //从grid加载的数据，可被重置。
    var loadFormData = {};
    for(var i = 0; i < mygrid.getColumnsNum() - 1; i++){
        loadFormData[mygrid.getColumnId(i)] = !rowData.data[i] ? rowData.data[i] : ( rowData.data[i].value ||
                                                                                     rowData.data[i]);
    }
    $("_menuIconImg").onerror=function(){
        $("_menuIconImg").src =getBasePath() + "/meta/resource/images/no.png"
    }
    $("_menuIconImg").src= rowData.data[3].value||rowData.data[3];
    dhx.extend(loadFormData, rowData.userdata, true);
    loadFormData.orderId=loadFormData.orderId||"0";
    try{
        loadFormData.isMax=loadFormData.isMax||0;
        loadFormData.isScroll= loadFormData.isScroll||0;
        loadFormData.isMenuBar=loadFormData.isMenuBar||0;
        loadFormData.isStatusBar= loadFormData.isStatusBar||0;
        loadFormData.isLinkBar= loadFormData.isLinkBar||0;
    modifyForm.setFormData(loadFormData);
   } catch (e) {}
    modifyForm.defaultValidateEvent();

    //新增Dwr modifyMenu方法
    dwrCaller.addAction("updateMenu", function(afterCall, param){
        //执行Dwr方法
        MenuAction.updateMenu(param, function(data){
            dhx.closeProgress();
            if(data.type == "error" || data.type == "invalid"){
                dhx.alert("对不起，修改出错，请重试！");
            } else{
                dhx.alert("修改成功");
                modifyWindow.close();
                mygrid.updateGrid(treeDataConverter.convert(data.successData), "update");
                var cell= mygrid.cells(data.successData.MENU_ID,3).cell;
                if(data.successData.ICON_URL){
                    mygrid.setCellExcellType(data.successData.MENU_ID,3,"img");
                }
                if(cell._cellType=="img"){
                    cell.lastChild.style.width="18px";
                    cell.lastChild.style.height="18px";
                }
            }
        });
    });
    //添加表单处理事件
    modifyForm.attachEvent("onButtonClick", function(id){
        if(id == "save"){//保存
            if(modifyForm.validate()){
                //先上传文件
                var file=null;
                var supportFile=['png','gif','jpg','jpeg']
                if(file=dwr.util.getValue("_fileupload")){
                    if(new RegExp("["+supportFile.join("|")+"]$","i").test(file)){
                        var iframeName="_uploadFrame";
//                        var fileStr=file.split("\\");
                        // var fileName=fileStr[fileStr.length-1];
                        //modifyForm.setItemValue("iconUrl","meta/public/upload/menuIcon/"+fileName.toLowerCase());
                        var ifr=$(iframeName);
                        //生成一个隐藏iframe，并设置form的target为该iframe，模拟ajax效果
                        if(!ifr){
                            ifr=document.createElement("iframe");
                            ifr.name=iframeName;
                            ifr.id=iframeName;
                            ifr.style.display="none";
                            document.body.appendChild(ifr);
                            if (ifr.attachEvent){
                                ifr.attachEvent("onload", function(){
                                    modifyForm.setItemValue("iconUrl",window.frames[iframeName].fileName);
                                    dhx.showProgress("菜单管理", "正在提交表单数据...");
                                    modifyForm.send(dwrCaller.updateMenu);
                                });
                            } else {
                                ifr.onload = function(){
                                    modifyForm.setItemValue("iconUrl",window.frames[iframeName].fileName);
                                    dhx.showProgress("菜单管理", "正在提交表单数据...");
                                    modifyForm.send(dwrCaller.updateMenu);
                                };
                            }
                        }
                        var fm = $("_uploadForm");
                        fm.target = iframeName;
                        $("_uploadForm").submit();
                    }else{
                        dhx.alert("请选择一个图片文件，支持格式png/gif/jpg/jpeg");
                        return;
                    }
                }else{
                    dhx.showProgress("菜单管理", "正在提交表单数据...");
                    modifyForm.send(dwrCaller.updateMenu);
                }

            }
        } else if(id == "reset"){//重置
            modifyForm.clear();
            modifyForm.setFormData(loadFormData);
//            initForm();
        } else if(id == "close"){
            modifyWindow.close();
            /*            modifyForm.unload();
             dhxWindow.unload();*/
        }
    });
    modifyForm.setItemFocus("menuName");
    modifyForm.attachEvent("onclose", function (id, value, checkedState){
        modifyWindow.close();
        dhtmlxValidation.clearAllTip();
        modifyForm.unload();
        dhxWindow.unload();
    });
}
/**************************修改还数据加载end********************************************************/

/**************************删除菜单start****************************************************************************/
dwrCaller.addAutoAction("deleteMenu", "MenuAction.deleteMenus", function(data){
    dhx.closeProgress();
    if(data.type == "error" || data.type == "invalid"){
        dhx.alert("对不起，删除出错，请重试！");
    } else{
        dhx.alert("删除成功");
        mygrid.deleteRow(data.sid);
    }
})

/**
 * 删除一批菜单。
 * @param rowDatas
 */
var deleteMenu = function(rowDatas){
    dhx.confirm("确定要删除该菜单？", function(r){
        if(r){
            dhx.showProgress("菜单管理", "正在提交删除请求...");
            dwrCaller.executeAction("deleteMenu", rowDatas.id, rowDatas.getParentId());
        }
    });
};

/**************************删除菜单end****************************************************************************/


/**************************菜单用户数据start********************************************************/
var base = getBasePath();
var loadMenuUserParam = new biDwrMethodParam();// 参数组件,将form中的参数传递给dwr中对应的方法
var dwrUserCaller = new biDwrCaller({});

var menuUserConvertConfig = {
    idColumnName:"userId",
    filterColumns:["","userNamecn","userMobile","userEmail","excludeButton"],
    userData:function(rowIndex, rowData){
        return rowData;
    }
}
var menuUserDataConverter = new dhtmxGridDataConverter(menuUserConvertConfig);

var addUserArr = null;
var delUserArr = null;

var buttonConvertConfig = {
    filterColumns:["checked","name","enName"],
    isFormatColumn:false,
    /**
     * 此函数目的将格式为类似为 addButton:新增，delete；删除.格式化为列数据
     * @param data 固定为数组，索引位0表示选中的menu已经注册的按钮，格式为： addButton:新增，delete；删除
     * 索引位1表示已经排除的按钮列表，用“,”号分割。
     */
    onBeforeConverted:function(data){
        if(data){
            var pageButton = data[0];
            this.exclude = data[1];
            this.userId = data[2];
            if(pageButton){
                var buttons = pageButton.split(",");
                var list = [];
                for(var i = 0; i < buttons.length; i++){
                    var temp = buttons[i].split(":");
                    list.push({enName:temp[0],name:temp[1]});
                }
                return list;
            }
        }
        this.exclude = undefined;
        this.userId = undefined;
        return Tools.EmptyList;
    },
    userData:function(){
        return {userId:this.userId};
    }
}
var buttonConverter = new dhtmxGridDataConverter(buttonConvertConfig);

var menuUserFun = function(menuId){
    var menuData = mygrid.getRowData(menuId).userdata;
    menuUserDataConverter.cellDataFormat = function(rowIndex, columnIndex, columnName, cellValue, rowData){
        //将adduser，addmenu格式的数据格式化为对应中文名称 “新增用户,新增菜单”
        if(columnName == "excludeButton"){
            var pageButton = menuData.pageButton;
            if(pageButton){
                if(cellValue){
                    var temp = cellValue.split(",");
                    for(var i = 0; i < temp.length; i++){
                        pageButton = pageButton.replace(new RegExp("(,?)" + temp[i] + ":[\w\u4e00-\u9fa5]+(,?)"),
                                function($0, $1, $2){
                                    if($1 && $2){
                                        return $1;
                                    } else{
                                        return "";
                                    }
                                });
                    }
                }
                pageButton = pageButton.replace(/\w+:([\w\u4e00-\u9fa5]+)/g, "$1");
                return pageButton;
            } else{
                return "";
            }
        }
        return cellValue;
    }
    addUserArr = new Array(); //添加用户的数组
    delUserArr = new Array(); //删除用户的数组
    var dhxWindows = new dhtmlXWindows();
    var winSize = Tools.propWidthDycSize(10, 10, 10, 10);
    winSize.width = winSize.width < 780 ? 780 : winSize.width;
    dhxWindows.createWindow("menuUserWin", 0, 0, winSize.width, winSize.height);
    var menuUserWin = dhxWindows.window("menuUserWin");
    menuUserWin.setText("关联用户");
    menuUserWin.center();
    menuUserWin.setModal(true);
    menuUserWin.show();
    menuUserWin.setDimension(winSize.width, winSize.height);
    menuUserWin.button("minmax1").hide();
    menuUserWin.button("minmax2").hide();
    menuUserWin.button("park").hide();
    menuUserWin.button("stick").hide();
    menuUserWin.button("sticked").hide();
    menuUserWin.denyResize();
    menuUserWin.denyPark();
    menuUserWin.keepInViewport(true);
    menuUserWin.show();
    var muserLayout = new dhtmlXLayoutObject(menuUserWin, "3E");
    muserLayout.cells("a").hideHeader();
    muserLayout.cells("b").setWidth(winSize.width);
    muserLayout.cells("c").setHeight(30);
    muserLayout.cells("b").hideHeader();
    muserLayout.cells("a").setHeight(20);
    muserLayout.cells("a").fixSize(false, true);
    muserLayout.cells("b").fixSize(false, false);
    muserLayout.cells("c").hideHeader();
    muserLayout.cells("c").fixSize(true, true);
    muserLayout.hideConcentrate();
    muserLayout.hideSpliter();//移除分界边框。
    muserLayout.cells("a").hideHeader();

    var winDiv = document.createElement("div");
    winDiv.style.height = "100%";
    winDiv.style.width = "100%";

    var leftAdd = {}, rightAdd = {},exclude = {}; //分别表示左边grid新增的数据，右边表格新增的数据，右边表格修改的数据。
    var currentUserId = null;//当前选择的用户ID；
    var currentChangeButton = {};
    /**
     * 拥有用户Template
     * @param name
     * @param value
     */
    var roleTemplate = function(name, value){
        return "<div style='height:100%;background-color:white;overflow:hidden;' id='_roleGrid'></div>"
    }
    var refRoleTemplate = function(name, value){
        return "<div style='height:100%;background-color:white;overflow:hidden;' id='_roleRefGrid'></div>"
    }
    var operTemplate = function(){
        return "<div style='height:100%;width:40px;margin-top: 20px' id='_oper'><img id='_rightMove' title='右移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 30px' " +
               "src=" + getBasePath() + "/meta/resource/images/arrow_right.png alt='右移'>" +
               "<br/><img id='_allRightMove' title='全部右移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 10px' " +
               "src=" + getBasePath() + "/meta/resource/images/arrow_right_double.png alt='当前页全部右移'>" +
               "<br/><img id='_leftMove' title='左移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 10px' " +
               "src=" + getBasePath() + "/meta/resource/images/arrow_left.png alt='左移'>" +
               "<br/><img id='_allLeftMove' title='全部左移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 10px' " +
               "src=" + getBasePath() + "/meta/resource/images/arrow_left_double.png alt='当前页全部左移'></div>";
    }
    /**
     * 菜单用户关联表单
     */
    var referenceFormData = [
        {type:"block",className:"zero",width:winSize.width-40,offsetLeft:winSize.width*0.02,height:winSize.height*0.1-50,list:[
            {
                type:"fieldset",label:"菜单用户选择",width:(winSize.width - 120) / 2 - 40,offsetLeft:0,labelWidth:0,list:[
                {type:"template",name:"role",className:"zero",format:roleTemplate}
            ]},
            {type:"newcolumn"},
            { type:"template",name:"oper",format:operTemplate},
            {type:"newcolumn"},
            {
                type:"fieldset",label:"已拥有菜单用户",width:(winSize.width - 120) / 2 + 40,list:[
                {type:"template",name:"refRole",format:refRoleTemplate}
            ]
            }
        ]}
    ]
    //建立表单。
    var referenceForm = new dhtmlXForm(winDiv, referenceFormData);
    muserLayout.cells("b").attachObject(winDiv);
    $("_roleRefGrid").style.width = ((winSize.width - 150) / 2 + 40) + "px";
    $("_roleRefGrid").style.marginLeft = "-" + 1 +"px";
    $("_roleGrid").style.width = ((winSize.width - 120) / 2 - 40) + "px";
    $("_roleGrid").style.marginLeft = "-" + 1 +"px";
    $("_roleRefGrid").style.height = (winSize.height - 190) + "px";
    $("_roleGrid").style.height = (winSize.height - 190) + "px";
    $("_oper").style.marginTop = ($("_oper").clientHeight / 2 - 40) + "px";
    /**
     * 查询菜单
     */
    var queryRoleform = muserLayout.cells("a").attachForm([
        {type:"settings",position: "label-left", labelWidth: 70, inputWidth: 140},
        {type:"label",label:"<span style='font-size:12px;font-weight:normal;color:#000;'>当前菜单：</span>"},
        {type:"newcolumn"},
        {type:"label",label:"<span id='currMenuName' style='font-weight:bold;color:#000;margin-left:-20px;position:absolute;'>"},
        {type:"newcolumn"},
        {type:"input",label:"姓名:",name:"userName",inputWidth:110,labelWidth: 35} ,
        {type:"hidden",name:'menuId',value:currMenuId},
        {type:"hidden",name:'zoneId'},
        {type:"hidden",name:'deptId'},
        {type:"hidden",name:"stationId"},
        {type:"newcolumn",offset:10},
        {type:"button",name:"query",value:"查询"}
    ]);//end formDat
    loadMenuUserParam.setParamConfig([
        {
            index:0,type:"fun",value:function(){
            var data = queryRoleform.getFormData();
            if(data.zoneId == null || data.zoneId ==""){
                data.zoneId = user.zoneId;
            }
            return data;
        }
        }
    ]);

    dwrUserCaller.addAutoAction("loadUserByCondition", "MenuUserAction.queryMenuUserByCondition", loadMenuUserParam,
            function(data){
            });
    document.getElementById("currMenuName").innerHTML = currMenuName;
    dwrUserCaller.addDataConverter("loadUserByCondition", menuUserDataConverter);
    //修改对齐样式。
    $("_roleGrid").parentNode.parentNode.parentNode.parentNode.parentNode.style.padding = "0px";
    //生成权限列表表格。
    var refRoleGrid = new dhtmlXGridObject("_roleGrid");
    refRoleGrid.setHeader("{#checkBox},姓名,手机,邮箱");
    refRoleGrid.setInitWidthsP("10,20,20,50");
    refRoleGrid.setColAlign("center,left,left,left");
    refRoleGrid.setHeaderAlign("center,center,center,center");
    refRoleGrid.setColTypes("ch,ro,ro,ro");
    refRoleGrid.enableCtrlC();
    refRoleGrid.setColSorting("na,na,na,ro");
    refRoleGrid.enableMultiselect(true);
    refRoleGrid.init();
    var genstr=refRoleGrid.defaultPaging(10, false);
    refRoleGrid.load(dwrUserCaller.loadUserByCondition,"json");
    $("_pagingArea_"+genstr).style.marginTop="20px";

    //加载有该菜单的用户
    dwrUserCaller.addAutoAction("loadMenuUser", "MenuUserAction.queryMenuUser", loadMenuUserParam);

    dwrUserCaller.addDataConverter("loadMenuUser", dhx.extend({},menuUserDataConverter,true));
    //用户已关联权限列表
    //关联关系列表
    $("_roleRefGrid").parentNode.parentNode.parentNode.parentNode.parentNode.style.padding = "0px";
    var refGrid = new dhtmlXGridObject("_roleRefGrid");
    refGrid.setHeader("{#checkBox},姓名,手机,邮箱,按钮权限(右键编辑)");
    refGrid.setInitWidthsP("10,15,20,25,50");
    refGrid.setColAlign("center,center,left,left,left");
    refGrid.setHeaderAlign("centert,center,center,center,center");
    refGrid.setColTypes("ch,ro,ro,ro,ro");
    refGrid.enableCtrlC();
    refGrid.setColSorting("na,na,na,na,ro");
    refGrid.enableMultiselect(true);
//    refGrid.setColumnIds("", "userNamecn", "userMobile", "userEmail", "userId");
    refGrid.init();
    refGrid.setColumnHidden(2, true);
    var genstr1=refGrid.defaultPaging(10);
    refGrid.load(dwrUserCaller.loadMenuUser,"json");
    $("_pagingArea_"+genstr1).style.marginTop="20px";
//    refGrid.defaultPaging(10, false);

    //排除按钮grid，
    var excludeButtonDiv = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 230px;width:200px;padding: 0;margin: 0;" +
              "z-index:1000;background-color: white;"
    });
    var excludeButtonGridDiv = dhx.html.create("div", {
        style:"position:relative;border: 1px #eee solid;height: 200px;width:200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    excludeButtonDiv.appendChild(excludeButtonGridDiv);

    document.body.appendChild(excludeButtonDiv);
    var refMenuGrid = new dhtmlXGridObject(excludeButtonGridDiv);
    excludeButtonDiv.style.display = "none";
    refMenuGrid.setHeader("{#checkBox},按钮名称,按钮英文名");
    refMenuGrid.setInitWidthsP("12,88,1");
    refMenuGrid.setColAlign("center,left,left");
    refMenuGrid.setHeaderAlign("center,center,left");
    refMenuGrid.setColTypes("ch,ro,ro");
    refMenuGrid.enableCtrlC();
    refMenuGrid.setColSorting("na,na,na");
    refMenuGrid.enableMultiselect(true);
    refMenuGrid.enableSelectCheckedBoxCheck(2);
    refMenuGrid.setColumnHidden(2, true);
    refMenuGrid.init();
    var refreshButtonGrid = function(excludeButton, userId){
        var data = [];
        data.push(menuData.pageButton);
        data.push(excludeButton);
        data.push(userId);
        refMenuGrid.clearAll();
        refMenuGrid.parse(buttonConverter.convert(data), "json");
    }
    var modifyStyle = {
        add:"font-weight:bold;color:#64B201;",
        remove:"font-weight:bold;color:#CCCCCC",
        modifyButton:"border-bottom:2px solid red;",
        clear:"font-weight:normal;font-style::normal;text-decoration:none;color:black;border-bottom:0px;"
    };

    //添加确定按钮。
    var button = Tools.getButtonNode("确定", getBasePath() + '/meta/resource/images/ok.png');
    button.style.cssFloat = "left";
    button.style.styleFloat = "left";
    button.style.marginLeft = "15px";
    button.onclick = function(e){
        var orgexcludes = refGrid.getUserData(currentUserId, "excludeButton") || "";
        var selectExcludes = dhx.extend({}, currentChangeButton);
        //判断原来与现在的数据是否有变更
        var isChange = false;
        for(var key in selectExcludes){
            if(orgexcludes){
                orgexcludes = orgexcludes.replace(new RegExp(key + ",?"), "");
                delete selectExcludes[key];
            }
            if(!orgexcludes && !Tools.isEmptyObject(selectExcludes)){
                isChange = true;
                break;
            }
        }
        if(orgexcludes){
            isChange = true;
        }
        //设置选择的值
        var selectIds = refMenuGrid.getCheckedRows(0);
        var selectButtons = "";
        if(selectIds){
            selectIds = selectIds.split(",");
            for(var i = 0; i < selectIds.length; i++){
                selectButtons += (refMenuGrid.cells(selectIds[i], 1).getValue() +
                                  (i == selectIds.length - 1 ? "" : ","));
            }
        }
        refGrid.cells(currentUserId, 4).setValue(selectButtons);
        if(isChange){
            //将临时修改的数据进入缓存区
            exclude[currentUserId] = currentChangeButton;
            currentChangeButton = {};
            refGrid.setCellTextStyle(currentUserId,4, modifyStyle.modifyButton);
        }else{
            refGrid.setCellTextStyle(currentUserId,4, modifyStyle.clear);
            //将临时修改的数据进入缓存区
            exclude[currentUserId] = null;
            delete exclude[currentUserId] ;
            currentChangeButton = {};
        }
        excludeButtonDiv.style.display = "none";
    }
    excludeButtonDiv.appendChild(button);
    //添加取消按钮
    button = Tools.getButtonNode("取消", getBasePath() + '/meta/resource/images/cancel.png');
    button.style.cssFloat = "left";
    button.style.styleFloat = "left";
    button.onclick = function(){
        excludeButtonDiv.style.display = "none";
        currentChangeButton = {};
    }
    excludeButtonDiv.appendChild(button);
    refMenuGrid.attachEvent("onCellChanged", function(rId, cInd, nValue){
        var excludeButton = refMenuGrid.cells(rId, 2).getValue();
        if(cInd == 0 && excludeButton){
            var userId = currentUserId;
            var orgexcludes = refGrid.getUserData(currentUserId, "excludeButton") || "";
            var orgexclude = orgexcludes.split(",");
            //拷贝原来的排除按钮集
            if(Tools.isEmptyObject(currentChangeButton)){
                if(exclude[userId]){
                    dhx.extend(currentChangeButton,exclude[userId],true);
                }else  if(orgexclude && orgexclude.length > 0){
                    for(var i = 0; i < orgexclude.length; i++){
                        if(orgexclude[i]){
                            currentChangeButton[orgexclude[i]] = orgexclude[i];
                        }
                    }
                }
            }
            refMenuGrid.setRowTextStyle(rId, modifyStyle.clear);
            if(nValue == 0){
                currentChangeButton[excludeButton] = excludeButton;
                if(orgexcludes.indexOf(excludeButton) == -1){//原来无，新增
                    refMenuGrid.setRowTextStyle(rId, modifyStyle.remove);
                }
            } else{ //选择了一个按钮，代表用户有此按钮权限，则反向的就是排除按钮中删除此按钮
                currentChangeButton[excludeButton] = null;
                delete currentChangeButton[excludeButton];
                if(orgexcludes.indexOf(excludeButton) != -1){//原来有，删除
                    refMenuGrid.setRowTextStyle(rId, modifyStyle.add);
                }
            }
        }
    });
    //排除按钮右键菜单
    refGrid.attachEvent("onRightClick", function(rowId, cellId, obj){
        if(cellId == 4){
            var cell = refGrid.cells(rowId, cellId).cell;
            Tools.divPromptCtrl(excludeButtonDiv, cell, false);
            excludeButtonDiv.style.display = "block";
            refGrid.selectRowById(rowId, false, true, true);
            var excludeButton = refGrid.getUserData(rowId, "excludeButton");
            refreshButtonGrid(excludeButton, rowId);
            currentUserId = rowId;
        }
    })
    buttonConverter.cellDataFormat = function(rowIndex, columnIndex, columnName, cellValue, rowData){
        var userId = this.userId;
        if(columnName == "checked"){
            if(exclude[userId]){
                return !!!exclude[userId][rowData.enName];
            } else{
                this.exclude = this.exclude || "";
                return this.exclude.indexOf(rowData.enName) == -1;
            }
            return 0;
        } else{
            if(exclude[userId]){
                if(exclude[userId][rowData.enName]){
                    if((this.exclude || "").indexOf(rowData.enName) == -1){
                        //无，新增
                        return {style:modifyStyle.remove,value:cellValue};
                    }
                } else{
                    if((this.exclude || "").indexOf(rowData.enName) != -1){
                        //无,删除
                        return {style:modifyStyle.add,value:cellValue};
                    }
                }
            }
        }
        return cellValue;
    }
    //查询表单事件处理
    queryRoleform.attachEvent("onButtonClick", function(id){
        refRoleGrid.clearAll();
        refRoleGrid.load(dwrUserCaller.loadUserByCondition,"json");

    });
    menuUserDataConverter.addRowConfig=function(rowIndex,rowData){
        if(leftAdd[rowData.userId]){//左边有新增
            return {style:styles.inserted};
        }else if(rightAdd[rowData.userId]){
            return {style:styles.deleted};
        }
        return Tools.EmptyObject;
    }
    /**
     * 将选择的角色移动至右边。
     * @param flag  当其为true时，表示将查询出的角色当前页全部右移。当为true时，表示只移动选择的数据。
     */
    var moveRight = function(flag){
        var del = [];
        if(flag){
            for(var i in refRoleGrid.rowsBuffer){
                if(!refRoleGrid.rowsBuffer[i] || typeof refRoleGrid.rowsBuffer[i] == "function"){
                    continue;
                }
                var rowId = refRoleGrid.getRowId(i);
                var rowData = refRoleGrid.getRowData(rowId);
                if(move(refRoleGrid, refGrid, {rows:[
                    {id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                        ,rowData.data[3],rowData.data[4]]}
                ]}, leftAdd, rightAdd, rowId)){
                    del.push(rowId);
                }
            }
        } else{
            var ids = refRoleGrid.getCheckedRows(0);
            if(ids){
                ids = ids.split(",");
                for(var i = 0; i < ids.length; i++){
                    var rowData = refRoleGrid.getRowData(ids[i]);
                    if(move(refRoleGrid, refGrid, {rows:[
                        {id:ids[i],data:[rowData.data[0],rowData.data[1],rowData.data[2]
                            ,rowData.data[3],rowData.data[4]] }
                    ]}, leftAdd, rightAdd, ids[i])){
                        del.push(ids[i]);
                    }
                }
            }
        }
        //最后删除需要删除的行
        for(var key = 0; key < del.length; key++){
            refRoleGrid.deleteRow(del[key]);
        }
    }
    /**
     * 取消选择的角色。
     * @param flag 当其为true时，表示将查询出的角色当前页全部右移。当为true时，表示只移动选择的数据。
     */
    var moveLeft = function(flag){
        var del = [];
        if(flag){
            for(var i in refGrid.rowsBuffer){
                if(!refGrid.rowsBuffer[i] || typeof refGrid.rowsBuffer[i] == "function"){
                    continue;
                }
                var rowId = refGrid.getRowId(i);
                var rowData = refGrid.getRowData(rowId);
                if(move(refGrid, refRoleGrid, {rows:[
                    {id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                        ,rowData.data[3],rowData.data[4]]}
                ]}, rightAdd, leftAdd, rowId)){
                    del.push(rowId);
                }
                //取消排除的按钮选择
                exclude[rowId] = null;
                delete exclude[rowId];
            }
        } else{
            var ids = refGrid.getCheckedRows(0);
            if(ids){
                ids = ids.split(",");
                for(var i = 0; i < ids.length; i++){
                    var rowData = refGrid.getRowData(ids[i]);
                    if(move(refGrid, refRoleGrid, {rows:[
                        {id:ids[i],data:[rowData.data[0],rowData.data[1],rowData.data[2]
                            ,rowData.data[3],rowData.data[4]]}
                    ]}, rightAdd, leftAdd, ids[i])){
                        del.push(ids[i]);
                    }
                    //取消排除的按钮选择
                    exclude[ids[i]] = null;
                    delete exclude[ids[i]];
                }
            }
        }
        //最后删除需要删除的行
        for(var key = 0; key < del.length; key++){
            refGrid.deleteRow(del[key]);
        }
    }
    //右移新增事件处理
    $("_rightMove").onclick = function(){
        moveRight(false);
    }
    //全部右移事件处理
    $("_allRightMove").onclick = function(){
        moveRight(true);
    }
    //左移新增事件处理
    $("_leftMove").onclick = function(){
        moveLeft(false);
    }
    //全部左移事件处理
    $("_allLeftMove").onclick = function(){
        moveLeft(true);
    }
    /**
     * 标记删除、新增、改变的样式集合
     */
    var styles = {
        inserted:"font-weight:bold;color:#64B201;",
        deleted:"text-decoration:line-through;font-style:italic;color: #808080;",
        change_cell:"border-bottom:2px solid red;",
        clear:"font-weight:normal;font-style:normal;text-decoration:none;color:black;border-bottom:0px;"
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
    var move = function(moveObj, moveToObj, moveData, moveAdd, moveToAdd, id){
        if(!moveToObj.doesRowExist(id)){
            //移动至对象新增一行。
            moveToObj.updateGrid(moveData, "insert");
            //设置样式标记为新增。
            moveToObj.setRowTextStyle(id, styles.inserted);
            //记录删除变量。
            moveToAdd[id] = moveData;
        } else{ //如果移动过去的对象存在且不是新增的，切换为正常样式
            if(!moveToAdd[id]){
                moveToObj.setRowTextStyle(id, styles.clear);
            }
        }
        var isDel = false;
        if(moveAdd[id]){//如果有数据，需要删除此行。
            isDel = true;
        } else{
            //改变要移动对象的样式,标记已被删除。
            moveObj.setRowTextStyle(id, styles.deleted);
        }
        //删除新增变量
        moveAdd[id] = null;
        delete moveAdd[id];
        return isDel;
    }
    //为两个表格添加鼠标双击事件,双击时进行选择或者是取消选择。
    refRoleGrid.attachEvent("onRowDblClicked", function(rowId, cInd){
        if(!rightAdd[rowId]){//右边没有，进行选择
            var rowData = refRoleGrid.getRowData(rowId);
            if(move(refRoleGrid, refGrid, {rows:[
                {id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                    ,rowData.data[3],rowData.data[4]]
                }
            ]}, leftAdd, rightAdd, rowId)){
                refRoleGrid.deleteRow(rowId);
            }
        } else{//左边已选择，进行取消选择
            var rowData = refGrid.getRowData(rowId);
            if(move(refGrid, refRoleGrid, {rows:[
                {id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                    ,rowData.data[3],rowData.data[4]]}
            ]}, rightAdd, leftAdd, rowId)){
                refGrid.deleteRow(rowId);
            }
        }

    });
//    refGrid.attachEvent('onRowDblClicked',function(rowId,cInd){
//    	alert('ssssss');
//    	
//    });
    refGrid.attachEvent("onRowDblClicked", function(rowId, cInd){
        //alert(refGrid.getRowData(rowId));
        if(!leftAdd[rowId]){//左边没有，移动至左边
            var rowData = refGrid.getRowData(rowId);
            if(move(refGrid, refRoleGrid, {rows:[
                {id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                    ,rowData.data[3],rowData.data[4]]}
            ]}, rightAdd, leftAdd, rowId)){
                refGrid.deleteRow(rowId);
                //取消排除的按钮选择
                exclude[rowId] = null;
                delete exclude[rowId];
            }
        } else{
            var rowData = refRoleGrid.getRowData(rowId);
            if(move(refRoleGrid, refGrid, {rows:[
                {id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                    ,rowData.data[3],rowData.data[4]]}
            ]}, leftAdd, rightAdd, rowId)){
                refRoleGrid.deleteRow(rowId);
            }
        }

    });
    dwrUserCaller.addAutoAction("insertMenuUserByMenuId", "MenuUserAction.insertMenuUserByMenuId");
    dwrUserCaller.isDealOneParam("insertMenuUserByMenuId", false);
    //做数据保存操作。
    var saveUserData = function(){
        /*页面选择数据，其数据结构为：{
         {
         add:[{menuId:,userId},{}...],
         del:{userIds:"213,232,123,213,...",menuId:}
         exclude:[{menuId,userId,excludeButton},{}...]
         }
         */
        var data = {};//最终要传送给后台的数据结构。
        if(!Tools.isEmptyObject(rightAdd)){
            //右边新增的数据即为要关联的数据。
            data.add = [];
            for(var key in rightAdd){
                data.add.push({menuId:currMenuId,userId:key});
            }
        }
        if(!Tools.isEmptyObject(leftAdd)){
            //左边新增的数据即为取消的关联。
            data.del = [];
            for(var key in leftAdd){
                data.del.push({menuId:currMenuId,userId:key});
            }
        }
        //修改的数据
        if(!Tools.isEmptyObject(exclude)){
            data.exclude = [];
            for(var key in exclude){
                var  tempExcludeButtons=[];
                for(var tempExclude in exclude[key]){
                    tempExcludeButtons.push(tempExclude);
                }
                data.exclude.push({menuId:currMenuId,userId:key,excludeButton:tempExcludeButtons.join(",")});
            }
        }
        //执行DWR
        dwrUserCaller.executeAction("insertMenuUserByMenuId", data, function(rs){
            if(rs){
                dhx.alert("设置关联关系成功！");
                //清空数据
                leftAdd = {};
                rightAdd = {};
                exclude={};
                //referenceForm.clear();
                //dhxWindows.unload();
            } else{
                dhx.alert("设置关联关系失败，请重试");
            }
        });
    }
    //给window 添加一个onClose事件，用于检测其关闭时是否有修改数据,且做一些关闭之前的数据清理工作。
    menuUserWin.attachEvent("onClose", function(win){
        if(!Tools.isEmptyObject(leftAdd) || !Tools.isEmptyObject(rightAdd) || !Tools.isEmptyObject(exclude)){
            dhx.messageBox({
                buttons:[
                    {id:"save",text:"保存",callback:function(){
                        saveUserData();
                        excludeButtonDiv.parentNode.removeChild(excludeButtonDiv);
                        dhxWindows._removeWindowGlobal(win);
                        dhxWindows.unload();
                    }},
                    {id:"notSave",text:"不保存",callback:function(){
                        excludeButtonDiv.parentNode.removeChild(excludeButtonDiv);
                        dhxWindows._removeWindowGlobal(win);
                        dhxWindows.unload();
                    }},
                    {id:"cancel",text:"取消" }
                ],
                message:"您有数据未提交，是否保存？"
            });
            return false;  //不关闭窗口，根据逻辑判断再决定是否关闭窗口
        } else{
            excludeButtonDiv.parentNode.removeChild(excludeButtonDiv);
            return true;
        }
    });
    var buttonForm = muserLayout.cells("c").attachForm([
        {type:"settings",position: "label-left", labelWidth: 70, inputWidth: 120},
        {type:"button",value:"确定",name:"save",offsetLeft:(winSize.width / 2 - 70),offsetTop:5},
        {type:"newcolumn"},
        {type:"button",value:"关闭",name:"close",offsetTop:5}
    ]);
    //保存
    buttonForm.attachEvent("onButtonClick", function(id){
        if(id == "save"){//保存
            saveUserData();
            leftAdd = {}, rightAdd = {}, exclude = {};
            dhxWindows._removeWindowGlobal(menuUserWin);
        } else if(id == "close"){
            menuUserWin.close();
        }
    });
}//end

/**************************菜单用户数据end********************************************************/

/**************************菜单角色数据start********************************************************/

var loadMenuRoleParam = new biDwrMethodParam();// 参数组件,将form中的参数传递给dwr中对应的方法

var menuRoleConvertConfig = {
    idColumnName:"roleId",
    filterColumns:["","roleName","roleDesc","excludeButton"],
    userData:function(rowIndex, rowData){
        return rowData;
    }
}
var menuRoleDataConverter = new dhtmxGridDataConverter(menuRoleConvertConfig);
var buttonRoleConvertConfig = {
    filterColumns:["checked","name","enName"],
    isFormatColumn:false,
    /**
     * 此函数目的将格式为类似为 addButton:新增，delete；删除.格式化为列数据
     * @param data 固定为数组，索引位0表示选中的menu已经注册的按钮，格式为： addButton:新增，delete；删除
     * 索引位1表示已经排除的按钮列表，用“,”号分割。
     */
    onBeforeConverted:function(data){
        if(data){
            var pageButton = data[0];
            this.exclude = data[1];
            this.roleId = data[2];
            if(pageButton){
                var buttons = pageButton.split(",");
                var list = [];
                for(var i = 0; i < buttons.length; i++){
                    var temp = buttons[i].split(":");
                    list.push({enName:temp[0],name:temp[1]});
                }
                return list;
            }
        }
        this.exclude = undefined;
        this.roleId = undefined;
        return Tools.EmptyList;
    },
    userData:function(){
        return {roleId:this.roleId};
    }
}
var buttonRoleConverter = new dhtmxGridDataConverter(buttonRoleConvertConfig);

var menuRoleFun = function(menuId){
    var menuData = mygrid.getRowData(menuId).userdata;
    menuRoleDataConverter.cellDataFormat = function(rowIndex, columnIndex, columnName, cellValue, rowData){
        //将adduser，addmenu格式的数据格式化为对应中文名称 “新增用户,新增菜单”
        if(columnName == "excludeButton"){
            var pageButton = menuData.pageButton;
            if(pageButton){
                if(cellValue){
                    var temp = cellValue.split(",");
                    for(var i = 0; i < temp.length; i++){
                        pageButton = pageButton.replace(new RegExp("(,?)" + temp[i] + ":[\w\u4e00-\u9fa5]+(,?)"),
                                function($0, $1, $2){
                                    if($1 && $2){
                                        return $1;
                                    } else{
                                        return "";
                                    }
                                });
                    }
                }
                pageButton = pageButton.replace(/\w+:([\w\u4e00-\u9fa5]+)/g, "$1");
                return pageButton;
            } else{
                return "";
            }
        }
        return cellValue;
    }
    var dhxWindows = new dhtmlXWindows();
    var winSize = Tools.propWidthDycSize(10, 10, 10, 10);
    winSize.width = winSize.width < 780 ? 780 : winSize.width;
    dhxWindows.createWindow("menuRoleWin", 0, 0, winSize.width, winSize.height);
    var menuRoleWin = dhxWindows.window("menuRoleWin");

    menuRoleWin.center();
    menuRoleWin.setModal(true);
    menuRoleWin.show();
    menuRoleWin.setDimension(winSize.width, winSize.height);
    menuRoleWin.button("minmax1").hide();
    menuRoleWin.button("minmax2").hide();
    menuRoleWin.button("park").hide();
    menuRoleWin.button("stick").hide();
    menuRoleWin.button("sticked").hide();
    menuRoleWin.denyResize();
    menuRoleWin.denyPark();
    menuRoleWin.keepInViewport(true);
    menuRoleWin.show();
    var mroleLayout = new dhtmlXLayoutObject(menuRoleWin, "2E");
//    mroleLayout.cells("a").hideHeader();
    mroleLayout.cells("a").setWidth(winSize.width);
    mroleLayout.cells("b").setHeight(30);
    mroleLayout.cells("a").hideHeader();
//    mroleLayout.cells("a").setHeight(20);
//    mroleLayout.cells("a").fixSize(false, true);
    mroleLayout.cells("a").fixSize(false, false);
    mroleLayout.cells("b").hideHeader();
    mroleLayout.cells("b").fixSize(true, true);
    mroleLayout.hideConcentrate();
    mroleLayout.hideSpliter();//移除分界边框。
//    mroleLayout.cells("a").hideHeader();

    var winDiv = document.createElement("div");
    winDiv.style.height = "100%";
    winDiv.style.width = "100%";

    var leftAdd = {}, rightAdd = {},exclude = {}; //分别表示左边grid新增的数据，右边表格新增的数据，右边表格修改的数据。
    var currentUserId = null;//当前选择的用户ID；
    var currentChangeButton = {};
    /**
     * 拥有用户Template
     * @param name
     * @param value
     */
    var roleTemplate = function(name, value){
        return "<div style='height:100%;background-color:white;overflow:hidden;' id='_roleGrid'></div>"
    }
    var refRoleTemplate = function(name, value){
        return "<div style='height:100%;background-color:white;overflow:hidden;' id='_roleRefGrid'></div>"
    }
    var operTemplate = function(){
        return "<div style='height:100%;width:40px;margin-top: 40px' id='_oper'><img id='_rightMove' title='右移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 30px' " +
               "src=" + getBasePath() + "/meta/resource/images/arrow_right.png alt='右移'>" +
               "<br/><img id='_allRightMove' title='全部右移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 10px' " +
               "src=" + getBasePath() + "/meta/resource/images/arrow_right_double.png alt='当前页全部右移'>" +
               "<br/><img id='_leftMove' title='左移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 10px' " +
               "src=" + getBasePath() + "/meta/resource/images/arrow_left.png alt='左移'>" +
               "<br/><img id='_allLeftMove' title='全部左移' style='width: 20px;height: 20px;margin-left: 10px;margin-top: 10px' " +
               "src=" + getBasePath() + "/meta/resource/images/arrow_left_double.png alt='当前页全部左移'></div>";
    }
    /**
     * 菜单用户关联表单
     */
    var referenceFormData = [
        {type:"block",className:"zero",width:winSize.width,list:[
            {
                type:"fieldset",label:"菜单角色选择",width:(winSize.width - 120) / 2 - 40,offsetLeft:0,labelWidth:0,list:[
                {type:"template",name:"role",className:"zero",format:roleTemplate}
            ]},
            {type:"newcolumn"},
            { type:"template",name:"oper",format:operTemplate},
            {type:"newcolumn"},
            {
                type:"fieldset",label:"已拥有菜单角色",width:(winSize.width - 120) / 2 + 40,list:[
                {type:"template",name:"refRole",format:refRoleTemplate}
            ]
            }
        ]}
    ]
    //建立表单。
    var referenceForm = new dhtmlXForm(winDiv, referenceFormData);
    mroleLayout.cells("a").attachObject(winDiv);
    $("_roleRefGrid").style.width = ((winSize.width - 120) / 2 + 40) + "px";
    $("_roleGrid").style.width = ((winSize.width - 120) / 2 - 40) + "px";
    $("_roleRefGrid").style.height = (winSize.height - 140) + "px";
    $("_roleGrid").style.height = (winSize.height - 140) + "px";
    $("_oper").style.marginTop = ($("_oper").clientHeight / 2 - 40) + "px";
    /**
     * 查询菜单
     */
//    var queryRoleform = mroleLayout.cells("a").attachForm([
//        {type:"settings",position: "label-left", labelWidth: 70, inputWidth: 120},
//        {type:"label",label:"<span style='font-size:12px;font-weight:normal;color:#000;'>当前菜单：</span>"},
//        {type:"newcolumn"},
//        {type:"label",label:"<span id='currMenuName' style='font-weight:bold;color:#000;margin-left:-20px;position:absolute;'>"},
//        {type:"newcolumn"},
//        {type:"input",label:"角色名称：",name:"roleName",className:"queryInput"},
//        {type:"newcolumn"},
//        {type:"hidden",name:'menuId',value:currMenuId},
//        {type:"button",name:"query",value:"查询"}
//    ]);//end formDat
//    loadMenuRoleParam.setParamConfig([
//        {
//            index:0,type:"fun",value:function(){
//            return queryRoleform.getFormData();
//        }
//        }
//    ]);
    dwrCaller.addAutoAction("loadRoleByCondition", "MenuRoleAction.queryMenuRoleByCondition", {menuId:currMenuId,roleName:""},
            function(data){
            }
    );
    dwrCaller.addAutoAction("loadMenuRole", "MenuRoleAction.queryMenuRole", {menuId:currMenuId,roleName:""},
            function(data){
            }
    );
    dwrCaller.addDataConverter("loadRoleByCondition",menuRoleDataConverter);
    dwrCaller.addDataConverter("loadMenuRole",dhx.extend({},menuRoleDataConverter,true));
//    document.getElementById("currMenuName").innerHTML = currMenuName;
    menuRoleWin.setText("当前菜单："+currMenuName);
    //修改对齐样式。
    $("_roleGrid").parentNode.parentNode.parentNode.parentNode.parentNode.style.padding = "0px";
    //生成权限列表表格。
    var refRoleGrid = new dhtmlXGridObject("_roleGrid");
    refRoleGrid.setHeader("{#checkBox},角色名称,角色描述");
    refRoleGrid.attachHeader("#rspan,<div id='role_input'><input type='text' id='roleNameId' style='width: 90%; border:1px solid gray;' onClick='(arguments[0]||window.event).cancelBubble=true;' onKeyUp='filterBy()'></div>" +
                             ",<div ></div>");
    refRoleGrid.setInitWidthsP("10,40,50");
    refRoleGrid.setColAlign("center,left,left");
    refRoleGrid.setHeaderAlign("center,center,center");
    refRoleGrid.setColTypes("ch,ro,ro");
    refRoleGrid.enableCtrlC();
    refRoleGrid.setColSorting("na,na,na");
    refRoleGrid.enableMultiselect(true);
    refRoleGrid.enableSelectCheckedBoxCheck(1);
//    refRoleGrid.setColumnCustFormat(3,validOrNot);//对状态列进行转义
    refRoleGrid.init();
    refRoleGrid.load(dwrCaller.loadRoleByCondition,"json");
//    refRoleGrid.defaultPaging(10, false);
    //用户已关联权限列表
    //关联关系列表
    $("_roleRefGrid").parentNode.parentNode.parentNode.parentNode.parentNode.style.padding = "0px";
    var refGrid = new dhtmlXGridObject("_roleRefGrid");
    refGrid.setHeader("{#checkBox},角色名称,角色描述,按钮权限(右键编辑)");
    refGrid.setInitWidthsP("10,20,25,45");
    refGrid.setColAlign("center,left,left,left");
    refGrid.setHeaderAlign("centert,center,center,center");
    refGrid.setColTypes("ch,ro,ro,ro");
    refGrid.enableCtrlC();
    refGrid.setColSorting("na,na,na,ro");
    refGrid.enableMultiselect(true);
    //refGrid.setColumnHidden(3,true);
    refGrid.enableSelectCheckedBoxCheck(1);
    refGrid.init();
    refGrid.load(dwrCaller.loadMenuRole,"json");
//    refGrid.defaultPaging(10, false);

    //排除按钮grid，
    var excludeButtonDiv = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 230px;width:200px;padding: 0;margin: 0;" +
              "z-index:1000;background-color: white;"
    });
    var excludeButtonGridDiv = dhx.html.create("div", {
        style:"position:relative;border: 1px #eee solid;height: 200px;width:200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000"
    });
    excludeButtonDiv.appendChild(excludeButtonGridDiv);

    document.body.appendChild(excludeButtonDiv);
    var refMenuGrid = new dhtmlXGridObject(excludeButtonGridDiv);
    excludeButtonDiv.style.display = "none";
    refMenuGrid.setHeader("{#checkBox},按钮名称,按钮英文名");
    refMenuGrid.setInitWidthsP("12,88,1");
    refMenuGrid.setColAlign("center,left,left");
    refMenuGrid.setHeaderAlign("center,center,left");
    refMenuGrid.setColTypes("ch,ro,ro");
    refMenuGrid.enableCtrlC();
    refMenuGrid.setColSorting("na,na,na");
    refMenuGrid.enableMultiselect(true);
    refMenuGrid.enableSelectCheckedBoxCheck(2);
    refMenuGrid.setColumnHidden(2, true);
    refMenuGrid.init();
    var refreshButtonGrid = function(excludeButton, userId){
        var data = [];
        data.push(menuData.pageButton);
        data.push(excludeButton);
        data.push(userId);
        refMenuGrid.clearAll();
        refMenuGrid.parse(buttonRoleConverter.convert(data), "json");
    }
    var modifyStyle = {
        add:"font-weight:bold;color:#64B201;",
        remove:"font-weight:bold;color:#CCCCCC",
        modifyButton:"border-bottom:2px solid red;",
        clear:"font-weight:normal;font-style::normal;text-decoration:none;color:black;border-bottom:0px;"
    };
    /**
     * 标记删除、新增、改变的样式集合
     */
    var styles = {
        inserted:"font-weight:bold;color:#64B201;",
        deleted:"text-decoration:line-through;font-style:italic;color: #808080;",
        change_cell:"border-bottom:2px solid red;",
        clear:"font-weight:normal;font-style:normal;text-decoration:none;color:black;border-bottom:0px;"
    };
    //添加确定按钮。
    var button = Tools.getButtonNode("确定", getBasePath() + '/meta/resource/images/ok.png');
    button.style.cssFloat = "left";
    button.style.styleFloat = "left";
    button.style.marginLeft = "15px";
    button.onclick = function(e){
        var orgexcludes = refGrid.getUserData(currentUserId, "excludeButton") || "";
        var selectExcludes = dhx.extend({}, currentChangeButton);
        //判断原来与现在的数据是否有变更
        var isChange = false;
        for(var key in selectExcludes){
            if(orgexcludes){
                orgexcludes = orgexcludes.replace(new RegExp(key + ",?"), "");
                delete selectExcludes[key];
            }
            if(!orgexcludes && !Tools.isEmptyObject(selectExcludes)){
                isChange = true;
                break;
            }
        }
        if(orgexcludes){
            isChange = true;
        }
        //设置选择的值
        var selectIds = refMenuGrid.getCheckedRows(0);
        var selectButtons = "";
        if(selectIds){
            selectIds = selectIds.split(",");
            for(var i = 0; i < selectIds.length; i++){
                selectButtons += (refMenuGrid.cells(selectIds[i], 1).getValue() +
                                  (i == selectIds.length - 1 ? "" : ","));
            }
        }
        refGrid.cells(currentUserId, 3).setValue(selectButtons);
        if(isChange){
            //将临时修改的数据进入缓存区
            exclude[currentUserId] = currentChangeButton;
            currentChangeButton = {};
            refGrid.setCellTextStyle(currentUserId,3, modifyStyle.modifyButton);
        }else{
            refGrid.setCellTextStyle(currentUserId,3, modifyStyle.clear);
            //将临时修改的数据进入缓存区
            exclude[currentUserId] = null;
            delete exclude[currentUserId] ;
            currentChangeButton = {};
        }
        excludeButtonDiv.style.display = "none";
    }
    excludeButtonDiv.appendChild(button);
    //添加取消按钮
    button = Tools.getButtonNode("取消", getBasePath() + '/meta/resource/images/cancel.png');
    button.style.cssFloat = "left";
    button.style.styleFloat = "left";
    button.onclick = function(){
        excludeButtonDiv.style.display = "none";
        currentChangeButton = {};
    }
    excludeButtonDiv.appendChild(button);
    refMenuGrid.attachEvent("onCellChanged", function(rId, cInd, nValue){
        var excludeButton = refMenuGrid.cells(rId, 2).getValue();
        if(cInd == 0 && excludeButton){
            var userId = currentUserId;
            var orgexcludes = refGrid.getUserData(currentUserId, "excludeButton") || "";
            var orgexclude = orgexcludes.split(",");
            //拷贝原来的排除按钮集
            if(Tools.isEmptyObject(currentChangeButton)){
                if(exclude[userId]){
                    dhx.extend(currentChangeButton,exclude[userId],true);
                }else  if(orgexclude && orgexclude.length > 0){
                    for(var i = 0; i < orgexclude.length; i++){
                        if(orgexclude[i]){
                            currentChangeButton[orgexclude[i]] = orgexclude[i];
                        }
                    }
                }
            }
            refMenuGrid.setRowTextStyle(rId, modifyStyle.clear);
            if(nValue == 0){
                currentChangeButton[excludeButton] = excludeButton;
                if(orgexcludes.indexOf(excludeButton) == -1){//原来无，新增
                    refMenuGrid.setRowTextStyle(rId, modifyStyle.remove);
                }
            } else{ //选择了一个按钮，代表用户有此按钮权限，则反向的就是排除按钮中删除此按钮
                currentChangeButton[excludeButton] = null;
                delete currentChangeButton[excludeButton];
                if(orgexcludes.indexOf(excludeButton) != -1){//原来有，删除
                    refMenuGrid.setRowTextStyle(rId, modifyStyle.add);
                }
            }
        }
    });
    //排除按钮右键菜单
    refGrid.attachEvent("onRightClick", function(rowId, cellId, obj){
        if(cellId == 3){
            var cell = refGrid.cells(rowId, cellId).cell;
            Tools.divPromptCtrl(excludeButtonDiv, cell, false);
            excludeButtonDiv.style.display = "block";
            refGrid.selectRowById(rowId, false, true, true);
            var excludeButton = refGrid.getUserData(rowId, "excludeButton");
            refreshButtonGrid(excludeButton, rowId);
            currentUserId = rowId;
        }
    })
    buttonRoleConverter.cellDataFormat = function(rowIndex, columnIndex, columnName, cellValue, rowData){
        var userId = this.userId;
        if(columnName == "checked"){
            if(exclude[userId]){
                return !!!exclude[userId][rowData.enName];
            } else{
                this.exclude = this.exclude || "";
                return this.exclude.indexOf(rowData.enName) == -1;
            }
            return 0;
        } else{
            if(exclude[userId]){
                if(exclude[userId][rowData.enName]){
                    if((this.exclude || "").indexOf(rowData.enName) == -1){
                        //无，新增
                        return {style:modifyStyle.remove,value:cellValue};
                    }
                } else{
                    if((this.exclude || "").indexOf(rowData.enName) != -1){
                        //无,删除
                        return {style:modifyStyle.add,value:cellValue};
                    }
                }
            }
        }
        return cellValue;
    }

    //查询表单事件处理
//    queryRoleform.attachEvent("onButtonClick", function(id){
//        refRoleGrid.clearAll();
//        refRoleGrid.load(dwrCaller.loadRoleByCondition,"json");
//    });
    menuRoleDataConverter.addRowConfig=function(rowIndex,rowData){
        if(leftAdd[rowData.roleId]){//左边有新增
            return {style:styles.inserted};
        }else if(rightAdd[rowData.roleId]){
            return {style:styles.deleted};
        }
        return Tools.EmptyObject;
    }
    /**
     * 将选择的角色移动至右边。
     * @param flag  当其为true时，表示将查询出的角色当前页全部右移。当为true时，表示只移动选择的数据。
     */
    var moveRight = function(flag){
        var del = [];
        if(flag){
            for(var i in refRoleGrid.rowsBuffer){
                if(!refRoleGrid.rowsBuffer[i] || typeof refRoleGrid.rowsBuffer[i] == "function"){
                    continue;
                }
                var rowId = refRoleGrid.getRowId(i);
                var rowData = refRoleGrid.getRowData(rowId);
                if(move(refRoleGrid, refGrid, {rows:[
                    {id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                        ,rowData.data[3],rowData.data[4]]}
                ]}, leftAdd, rightAdd, rowId)){
                    del.push(rowId);
                }
            }
        } else{
            var ids = refRoleGrid.getCheckedRows(0);
            if(ids){
                ids = ids.split(",");
                for(var i = 0; i < ids.length; i++){
                    var rowData = refRoleGrid.getRowData(ids[i]);
                    if(move(refRoleGrid, refGrid, {rows:[
                        {id:ids[i],data:[rowData.data[0],rowData.data[1],rowData.data[2]
                            ,rowData.data[3],rowData.data[4]] }
                    ]}, leftAdd, rightAdd, ids[i])){
                        del.push(ids[i]);
                    }
                }
            }
        }
        //最后删除需要删除的行
        for(var key = 0; key < del.length; key++){
            refRoleGrid.deleteRow(del[key]);
        }
    }
    /**
     * 取消选择的角色。
     * @param flag 当其为true时，表示将查询出的角色当前页全部右移。当为true时，表示只移动选择的数据。
     */
    var moveLeft = function(flag){
        var del = [];
        if(flag){
            for(var i in refGrid.rowsBuffer){
                if(!refGrid.rowsBuffer[i] || typeof refGrid.rowsBuffer[i] == "function"){
                    continue;
                }
                var rowId = refGrid.getRowId(i);
                var rowData = refGrid.getRowData(rowId);
                if(move(refGrid, refRoleGrid, {rows:[
                    {id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                        ,rowData.data[3],rowData.data[4]]}
                ]}, rightAdd, leftAdd, rowId)){
                    del.push(rowId);
                }
                //取消排除的按钮选择
                exclude[rowId] = null;
                delete exclude[rowId];
            }
        } else{
            var ids = refGrid.getCheckedRows(0);
            if(ids){
                ids = ids.split(",");
                for(var i = 0; i < ids.length; i++){
                    var rowData = refGrid.getRowData(ids[i]);
                    if(move(refGrid, refRoleGrid, {rows:[
                        {id:ids[i],data:[rowData.data[0],rowData.data[1],rowData.data[2]
                            ,rowData.data[3],rowData.data[4]]}
                    ]}, rightAdd, leftAdd, ids[i])){
                        del.push(ids[i]);
                    }
                    //取消排除的按钮选择
                    exclude[ids[i]] = null;
                    delete exclude[ids[i]];
                }
            }
        }
        //最后删除需要删除的行
        for(var key = 0; key < del.length; key++){
            refGrid.deleteRow(del[key]);
        }
    }
    //右移新增事件处理
    $("_rightMove").onclick = function(){
        moveRight(false);
    }
    //全部右移事件处理
    $("_allRightMove").onclick = function(){
        moveRight(true);
    }
    //左移新增事件处理
    $("_leftMove").onclick = function(){
        moveLeft(false);
    }
    //全部左移事件处理
    $("_allLeftMove").onclick = function(){
        moveLeft(true);
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
    var move = function(moveObj, moveToObj, moveData, moveAdd, moveToAdd, id){
        if(!moveToObj.doesRowExist(id)){
            //移动至对象新增一行。
            moveToObj.updateGrid(moveData, "insert");
            //设置样式标记为新增。
            moveToObj.setRowTextStyle(id, styles.inserted);
            //记录删除变量。
            moveToAdd[id] = moveData;
        } else{ //如果移动过去的对象存在且不是新增的，切换为正常样式
            if(!moveToAdd[id]){
                moveToObj.setRowTextStyle(id, styles.clear);
            }
        }
        var isDel = false;
        if(moveAdd[id]){//如果有数据，需要删除此行。
            isDel = true;
        } else{
            //改变要移动对象的样式,标记已被删除。
            moveObj.setRowTextStyle(id, styles.deleted);
        }
        //删除新增变量
        moveAdd[id] = null;
        delete moveAdd[id];
        return isDel;
    }
    //为两个表格添加鼠标双击事件,双击时进行选择或者是取消选择。
    refRoleGrid.attachEvent("onRowDblClicked", function(rowId, cInd){
        if(!rightAdd[rowId]){//右边没有，进行选择
            var rowData = refRoleGrid.getRowData(rowId);
            if(move(refRoleGrid, refGrid, {rows:[
                {id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                    ,rowData.data[3],rowData.data[4]]
                }
            ]}, leftAdd, rightAdd, rowId)){
                refRoleGrid.deleteRow(rowId);
            }
        } else{//左边已选择，进行取消选择
            var rowData = refGrid.getRowData(rowId);
            if(move(refGrid, refRoleGrid, {rows:[
                {id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                    ,rowData.data[3],rowData.data[4]]}
            ]}, rightAdd, leftAdd, rowId)){
                refGrid.deleteRow(rowId);
            }
        }

    });
    refGrid.attachEvent("onRowDblClicked", function(rowId, cInd){
        if(!leftAdd[rowId]){//左边没有，移动至左边
            var rowData = refGrid.getRowData(rowId);
            if(move(refGrid, refRoleGrid, {rows:[
                {id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                    ,rowData.data[3],rowData.data[4]]}
            ]}, rightAdd, leftAdd, rowId)){
                refGrid.deleteRow(rowId);
                //取消排除的按钮选择
                exclude[rowId] = null;
                delete exclude[rowId];
            }
        } else{
            var rowData = refRoleGrid.getRowData(rowId);
            if(move(refRoleGrid, refGrid, {rows:[
                {id:rowId,data:[rowData.data[0],rowData.data[1],rowData.data[2]
                    ,rowData.data[3],rowData.data[4]]}
            ]}, leftAdd, rightAdd, rowId)){
                refRoleGrid.deleteRow(rowId);
            }
        }

    });
    dwrCaller.addAutoAction("insertMenuRoleByMenuId", "MenuRoleAction.insertMenuRoleByMenuId");
    dwrCaller.isDealOneParam("insertMenuRoleByMenuId",false);
    //做数据保存操作。
    var saveUserData = function(){
        /*页面选择数据，其数据结构为：{
         {
         add:[{menuId:,roleId},{}...],
         del:{roleId,menuId:}
         exclude:[{menuId,roleId,excludeButton},{}...]
         }
         */
        var data = {};//最终要传送给后台的数据结构。
        if(!Tools.isEmptyObject(rightAdd)){
            //右边新增的数据即为要关联的数据。
            data.add = [];
            for(var key in rightAdd){
                data.add.push({menuId:currMenuId,roleId:key});
            }
        }
        if(!Tools.isEmptyObject(leftAdd)){
            //左边新增的数据即为取消的关联。
            data.del = [];
            for(var key in leftAdd){
                data.del.push({menuId:currMenuId,roleId:key});
            }
        }
        //修改的数据
        if(!Tools.isEmptyObject(exclude)){
            data.exclude = [];
            for(var key in exclude){
                var  tempExcludeButtons=[];
                for(var tempExclude in exclude[key]){
                    tempExcludeButtons.push(tempExclude);
                }
                data.exclude.push({menuId:currMenuId,roleId:key,excludeButton:tempExcludeButtons.join(",")});
            }
        }
        //执行DWR
        dwrCaller.executeAction("insertMenuRoleByMenuId", data, function(rs){
            if(rs){
                dhx.alert("设置关联关系成功！");
                //清空数据
                leftAdd = {};
                rightAdd = {};
                exclude= {};
                //referenceForm.clear();
                //dhxWindows.unload();
            } else{
                dhx.alert("设置关联关系失败，请重试");
            }
        });
    }
    //给window 添加一个onClose事件，用于检测其关闭时是否有修改数据,且做一些关闭之前的数据清理工作。
    menuRoleWin.attachEvent("onClose", function(win){
        if(!Tools.isEmptyObject(leftAdd) || !Tools.isEmptyObject(rightAdd) || !Tools.isEmptyObject(exclude)){
            dhx.messageBox({
                buttons:[
                    {id:"save",text:"保存",callback:function(){
                        saveUserData();
                        excludeButtonDiv.parentNode.removeChild(excludeButtonDiv);
                        dhxWindows._removeWindowGlobal(menuRoleWin);
                        dhxWindows.unload();
                    }},
                    {id:"notSave",text:"不保存",callback:function(){
                        excludeButtonDiv.parentNode.removeChild(excludeButtonDiv);
                        dhxWindows._removeWindowGlobal(win);
                        dhxWindows.unload();
                    }},
                    {id:"cancel",text:"取消" }
                ],
                message:"您有数据未提交，是否保存？"
            });
            return false;  //不关闭窗口，根据逻辑判断再决定是否关闭窗口
        } else{
            excludeButtonDiv.parentNode.removeChild(excludeButtonDiv);
            return true;
        }
    });
    var buttonForm = mroleLayout.cells("b").attachForm([
        {type:"settings",position: "label-left", labelWidth: 70, inputWidth: 120},
        {type:"button",value:"确定",name:"save",offsetLeft:(winSize.width / 2 - 70),offsetTop:5},
        {type:"newcolumn"},
        {type:"button",value:"关闭",name:"close",offsetTop:5}
    ]);
    //保存
    buttonForm.attachEvent("onButtonClick", function(id){
        if(id == "save"){//保存
            saveUserData();
            leftAdd = {}, rightAdd = {}, exclude = {};
            dhxWindows._removeWindowGlobal(menuRoleWin);
        } else if(id == "close"){
            menuRoleWin.close();
        }
    });
    window.filterBy = function(id) {
        var roleNameCn = dwr.util.getValue("roleNameId").replace(/(^\s*)|(\s*$)/g, "");
        if(roleNameCn && roleNameCn!=""){
            refRoleGrid.clearAll();
            refRoleGrid.load(dwrCaller.loadRoleByName+"?roleName="+roleNameCn+"&tmp=0", "json");
        }else{
            refRoleGrid.load(dwrCaller.loadRoleByCondition,"json");
        }

    }
    window.filterByDesc = function(id){
        var roleNameCn = dwr.util.getValue("roleNameDesc").replace(/(^\s*)|(\s*$)/g, "");
        if(roleNameCn && roleNameCn!=""){
            refRoleGrid.clearAll();
            refRoleGrid.load(dwrCaller.loadRoleByName+"?roleName="+roleNameCn+"&tmp=0", "json");
        }else{
            refRoleGrid.load(dwrCaller.loadRoleByCondition,"json");
        }
    }
}
dwrCaller.addAutoAction("loadRoleByName", "MenuRoleAction.queryMenuRoleByCondition",
        function(data){
        }
);
dwrCaller.addDataConverter("loadRoleByName",menuRoleDataConverter);
/**************************加载部门,岗位,地域start******************************/
dwrCaller.addAutoAction("loadDeptTree", "DeptAction.queryDeptByPath");
var treeConverter = new dhtmxTreeDataConverter({
    idColumn:"deptId",pidColumn:"parentId",
    isDycload:false,textColumn:"deptName"
});
dwrCaller.addDataConverter("loadDeptTree", treeConverter);
//树动态加载Action
dwrCaller.addAction("querySubDept", function(afterCall, param){
    var tempCovert = dhx.extend({isDycload:true}, treeConverter, false);
    DeptAction.querySubDept(param.id, function(data){
        data = tempCovert.convert(data);
        afterCall(data);
    })
});
/**
 * 部门树input框Html。
 * @param selectDept 已经选择了的部门。
 */
var loadDeptTree = function(selectDept, form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectDept = selectDept || global.constant.defaultRoot;
    var beginId = global.constant.defaultRoot;
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
    tree.attachEvent("onDblClick", function(nodeId){
        form.setFormData({dept:tree.getItemText(nodeId),deptId:nodeId});
        //关闭树
        div.style.display = "none";
    });
    dwrCaller.executeAction("loadDeptTree", beginId, selectDept, function(data){
        tree.loadJSONObject(data);
        if(selectDept){
            tree.selectItem(selectDept); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "click", function(){
            div.style.width = target.offsetWidth + 'px';
            Tools.divPromptCtrl(div, target, true);
            div.style.display = "block";
        })
    })
    div.style.display = "none";
}

dwrCaller.addAutoAction("loadZoneTree", "ZoneAction.queryZoneByPath");
var zoneConverter = dhx.extend({idColumn:"zoneId",pidColumn:"zoneParId",
    textColumn:"zoneName"
}, treeConverter, false);
dwrCaller.addDataConverter("loadZoneTree", zoneConverter);
//树动态加载Action
dwrCaller.addAction("querySubZone", function(afterCall, param){
    var tempCovert = dhx.extend({isDycload:true}, zoneConverter, false);
    ZoneAction.querySubZone(param.id, function(data){
        data = tempCovert.convert(data);
        afterCall(data);
    })
});
/**
 * 地域树加载
 * @param name
 * @param value
 */
var loadZoneTree = function(selectZone, form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectZone = selectZone || global.constant.defaultRoot;
    var beginId = (user.userId == global.constant.adminId ? global.constant.defaultRoot : user.zoneId) ||
                  global.constant.defaultRoot;
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
    tree.attachEvent("onDblClick", function(nodeId){
        form.setFormData({zone:tree.getItemText(nodeId),zoneId:nodeId});
        //关闭树
        div.style.display = "none";
    });
    dwrCaller.executeAction("loadZoneTree", beginId, selectZone, function(data){
        tree.loadJSONObject(data);
        if(selectZone){
            tree.selectItem(selectZone); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "click", function(){
            div.style.width = target.offsetWidth + 'px';
            Tools.divPromptCtrl(div, target, true);
            div.style.display = "block";
        })
    })
    div.style.display = "none";
}

dwrCaller.addAutoAction("loadStationTree", "StationAction.queryStationByPath");
var stationConverter = dhx.extend({idColumn:"stationId",pidColumn:"parStationId",
    textColumn:"stationName"
}, treeConverter, false);
dwrCaller.addDataConverter("loadStationTree", stationConverter);
//树动态加载Action
dwrCaller.addAction("querySubStation", function(afterCall, param){
    var tempCovert = dhx.extend({isDycload:true}, stationConverter, false);
    StationAction.querySubStation(param.id, function(data){
        data = tempCovert.convert(data);
        afterCall(data);
    })
});

/**
 * 岗位input输入框Html
 * @param name
 * @param value
 */
var loadStationTree = function(selectStation, form){
    //加载部门树数据。加载用户所在部门及其子部门。
    selectStation = selectStation || global.constant.defaultRoot;
    var beginId = global.constant.defaultRoot;
    //创建tree Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
              "z-index:1000;"
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
    tree.attachEvent("onDblClick", function(nodeId){
        form.setFormData({station:tree.getItemText(nodeId),stationId:nodeId});
        //关闭树
        div.style.display = "none";
    });
    dwrCaller.executeAction("loadStationTree", beginId, selectStation, function(data){
        tree.loadJSONObject(data);
        if(selectStation){
            tree.selectItem(selectStation); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "click", function(){
            div.style.width = target.offsetWidth + 'px';
            Tools.divPromptCtrl(div, target, true);
            div.style.display = "block";
        })
    })
    div.style.display = "none";
}


var localWindow = null;
/**
 * 本地化管理
 * @param menuId
 */
var localMagFun = function(rowData){
    var menuId = rowData.id;
    MenuAction.queryLocalDetail(menuId,rowData.userdata.menuUrl, function(data){
        if(!localWindow){
            var dhxWindow = new dhtmlXWindows();
            dhxWindow.createWindow("localWindow", 0, 0, 600, 400);
            localWindow = dhxWindow.window("localWindow");
            localWindow.setModal(true);
            localWindow.stick();
            localWindow.setDimension(600, 450);
            localWindow.center();
            localWindow.denyResize();
            localWindow.denyPark();
            localWindow.button("minmax1").hide();
            localWindow.button("park").hide();
            localWindow.button("stick").hide();
            localWindow.button("sticked").hide();

            localWindow.keepInViewport(true);
            localWindow.attachEvent("onClose", function(){
                localWindow.hide();
                localWindow.setModal(false);
                return false;
            });
            localWindow.setText("本地化管理");
            var localLayout = new dhtmlXLayoutObject(localWindow, "3U");
            localLayout.hideSpliter();
            localLayout.hideConcentrate();
            localLayout.cells("c").hideHeader();
//        localLayout.cells("a").fixSize(false, true);
            localLayout.cells("c").setHeight(50);
            localLayout.cells("a").hideHeader();
            localLayout.cells("b").hideHeader();

            localLayout.cells("a").attachObject($("_itemForm"));
            localLayout.cells("b").attachObject($("_resourceForm"));
            dhx.html.addCss($("_itemTableDiv"), global.css.gridTopDiv);
            dhx.html.addCss($("_resourceTableDiv"), global.css.gridTopDiv);
            $("_itemHeadTable").style.width=  ((dhx.env.isIE&&parseInt(dhx.env.ie)<=7)
            ?$("_itemContentDiv").offsetWidth:$("_itemContentDiv").clientWidth)+"px";
            $("_resourceHeadTable").style.width=  ((dhx.env.isIE&&parseInt(dhx.env.ie)<=7)
            ?$("_resourceContentDiv").offsetWidth:$("_resourceContentDiv").clientWidth)+"px";
            $("_resourceForm").setAttribute("action",urlEncode(getBasePath()+"/meta/module/mag/menu/localPost.jsp?menuId="+menuId));

            var btnFormData =
            [
                {type: "settings", position: "label-left"},
                {type:"block",offsetTop:5,inputTop :5,list:[
                    {type: "settings", position: "label-left"},
                    {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:225},
                    {type:"newcolumn"},
                    {type:"button",label:"关闭",name:"close",value:"关闭"}
                ]}
            ];
            var btnForm = localLayout.cells("c").attachForm(btnFormData);
            btnForm.attachEvent("onButtonClick", function(id){
                if(id=="save"){
                    saveLocalInfo(localWindow._menuId);
                }
                if(id=="close"){
                    localWindow.close();
                }
            });
        }
        clearAllColumnData();
        if(data&&data.localItem){
            for(var i=0; i < data.localItem.length; i++){
                addItemRow(data.localItem[i]);
            }
        }
        if(data&&data.localResource){
            for(var i=0; i < data.localResource.length; i++){
                addResourceRow(data.localResource[i]);
            }
        }
        localWindow._menuId=menuId;
        localWindow.setModal(true);
        localWindow.show();
    });
};

/**
 * 清空本地化管理数据
 */
var clearAllColumnData=function(){
    var tableObj1 = $("_resourceContentTable");
    for(var rowIndex = 1; rowIndex < tableObj1.rows.length ; rowIndex++){
        var row=  tableObj1.rows[rowIndex--];
        row.parentNode.removeChild(row);
    }

    var tableObj2 = $("_itemContentTable");
    for(var rowIndex = 1; rowIndex < tableObj2.rows.length ; rowIndex++){
        var row=  tableObj2.rows[rowIndex--];
        row.parentNode.removeChild(row);
    }
};

/**
 * 文本设置
 * @param rowData
 */
var addItemRow = function(rowData){
    var tr = document.createElement("tr");
    $("_itemContentBody").appendChild(tr);
    var td = tr.insertCell(0);
    td.align = "left";
    td.innerHTML=rowData.VAL_TEXT;
    td = tr.insertCell(1);
    var input = dhx.html.create("input", {type:'text',name:"itemText",id:rowData.MENU_ID +'_'+ rowData.I18N_ITEM_CODE,value:rowData.VAL_TEXT,style:"width: 90%"});
    td.appendChild(input);
    input = dhx.html.create("input", {type:'hidden',name:"itemCode",value:rowData.I18N_ITEM_CODE});
    td.appendChild(input);
    //为tr添加验证机制
    dhtmlxValidation.addValidation(tr,[
        {target:rowData.MENU_ID +'_'+ rowData.I18N_ITEM_CODE, rule:'MaxLength['+rowData.MAX_LENGTH+'],NotEmpty'}
    ]);
};

/**
 * 图片设置
 * @param rowData
 */
var addResourceRow = function(rowData){
    var tr = document.createElement("tr");
    $("_resourceContentBody").appendChild(tr);
    var td = tr.insertCell(0);
    td.align = "center";
    td.innerHTML='<img height="22" width="22" src="'+getBasePath()+"/"+rowData.RESOURCE_PATH+'" >';
    td = tr.insertCell(1);
    var input = dhx.html.create("input",{type:"FILE", name:"itemText", accept:"image/*", id:'_fileupload_'+rowData.RESOUCE_CODE});
    td.appendChild(input);
    input = dhx.html.create("input", {type:'hidden',name:"itemCode",value:rowData.RESOUCE_CODE});
    td.appendChild(input);
};

/**
 * 保存本地化设置
 * @param menuId
 */
var saveLocalInfo = function(menuId){
    if(validateLocal()){
        var resourceData = null;
        //上传图片
        var iframeName="_resourceFrame";
        var ifr=$(iframeName);
        //生成一个隐藏iframe，并设置form的target为该iframe，模拟ajax效果
//    if(!ifr){
        ifr=document.createElement("iframe");
        ifr.name=iframeName;
        ifr.id=iframeName;
        ifr.style.display="none";
        document.body.appendChild(ifr);
        if (ifr.attachEvent){
            ifr.attachEvent("onload", function(){
                //保存图片设置
                resourceData = getResourceData();
                var fileNames = window.frames[iframeName].fileNames;
                if(resourceData&&fileNames&&resourceData.length==fileNames.length){
                    for(var i=0; i<resourceData.length; i++ ){
                        resourceData[i].itemText=fileNames[i];
                    }
                }
                saveFun();
            });
        } else {
            ifr.onload = function(){
                //保存图片设置
                resourceData = getResourceData();
                var fileNames = window.frames[iframeName].fileNames;
                if(resourceData&&fileNames&&resourceData.length==fileNames.length){
                    for(var i=0; i<resourceData.length; i++ ){
                        resourceData[i].itemText=fileNames[i];
                    }
                }
                saveFun();
            };
        }
        var fm = $("_resourceForm");
        fm.target = iframeName;
        $("_resourceForm").submit();

        var saveFun = function(){
            //保存文本设置
            var itemData = getItemData();

            var submitData = {itemData:itemData,resourceData:resourceData,menuId:menuId};
            MenuAction.updateLocalInfo(submitData, function(r){
                if(r){
                    dhx.alert("保存成功！");
                    localWindow.close();
                }else{
                    dhx.alert("保存失败！请重试！");
                }
            });
        }
    }
};

/**
 * 取得文本数据
 */
var getItemData = function(){
    var rtnData = [];
    var tableObj = $("_itemContentTable");
    for(var i = 0; i < tableObj.rows.length; i++){
        var rowData = {};
        for(var j = 0; j < tableObj.rows[i].cells.length; j++){
            var elements = tableObj.rows[i].cells[j].getElementsByTagName("input");
            for(var z = 0; z < elements.length; z++){
                if([elements[z].name]){
                    rowData[elements[z].name] = dwr.util.getValue(elements[z]);
                }
            }
        }
        if(rowData.itemCode&&rowData.itemText){
            rtnData.push(rowData);
        }
    }
    return rtnData;
};


/**
 * 取得资源数据
 * TODO 更改文件路径
 */
var getResourceData = function(){
    var rtnData = null;
    var tableObj = $("_resourceContentTable");
    for(var i = 0; i < tableObj.rows.length; i++){
        var rowData = {};
        for(var j = 0; j < tableObj.rows[i].cells.length; j++){
            var elements = tableObj.rows[i].cells[j].getElementsByTagName("input");
            for(var z = 0; z < elements.length; z++){
                rowData[elements[z].name] = dwr.util.getValue(elements[z]);
            }
        }
        if(rowData.itemText){
            if(rtnData==null)rtnData=[];
            rtnData.push(rowData);
        }
    }
    return rtnData;
};

var validateLocal = function(){
    var tableObj = $("_itemContentTable");
    var validateRes=true;
    for(var i = 1; i < tableObj.rows.length; i++){
        validateRes=dhtmlxValidation.validate(tableObj.rows[i])&&validateRes;
    }
    return validateRes;
};

/**************************加载部门,岗位,地域end********************************/
dhx.ready(menuInit);