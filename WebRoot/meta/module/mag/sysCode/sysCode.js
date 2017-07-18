/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *
 *Description：
 *
 *Dependent：
 *
 *Author:
 *        刘斌
 *Finished：
 *       2012-03-14
 *Modified By：
 *
 * Modified Date:
 *
 * Modified Reasons:

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
 * 编码列表转换器
 */
var sysCodeConverter = new dhtmxGridDataConverter({
    idColumnName:"codeId",
    filterColumns:["codeName","codeValue","_buttons"],
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
});
dwrCaller.addAutoAction("querySysCode", "CodeAction.querySysCode");
dwrCaller.addDataConverter("querySysCode", sysCodeConverter);

dwrCaller.addAutoAction("queryTypeTree", "CodeAction.queryTypeTree");
var typeTreeConvert = new dhtmxTreeDataConverter({
    idColumn:"dirId",pidColumn:"parentDirId",textColumn:"dirName",
    isDycload:false
});
dwrCaller.addDataConverter("queryTypeTree", typeTreeConvert);
dwrCaller.isShowProcess("queryTypeTree", false);

//当前编码类型ID
var codeTypeId = null;
//是否允许编辑，0：只能新增不能修改，1：可以新增可以修改
var isEditable = null;

/**
 * 目录树结构变化之后缓存于此
 *
 * {dir_1:dir_2, type_1:dir_3}
 */
var struData = {};

/**
 * 界面初始化
 */
var sysCodeInit = function(){
    var codeLayout = new dhtmlXLayoutObject(document.getElementById("detail"), "2U");
    codeLayout.hideConcentrate();
    codeLayout.hideSpliter();
    codeLayout.cells("a").hideHeader();
    codeLayout.cells("b").hideHeader();
    codeLayout.cells("a").setWidth(320);
    treeButtonBar = codeLayout.cells("a").attachToolbar();
    treeButtonBar.addButton("newDir",1,"新增目录",getBasePath()+"/meta/resource/images/addSubmenu.png",getBasePath()+"/meta/resource/images/addSubmenu.png");
    treeButtonBar.addButton("modifyDir",2,"修改目录",getBasePath()+"/meta/resource/images/pencil.png",getBasePath()+"/meta/resource/images/pencil.png");
    treeButtonBar.addButton("deleteDir",3,"删除目录",getBasePath()+"/meta/resource/images/delete.png",getBasePath()+"/meta/resource/images/delete.png");
    treeButtonBar.addButton("saveTreeStru",4,"保存",getBasePath()+"/meta/resource/images/ok.png",getBasePath()+"/meta/resource/images/ok.png");
    treeButtonBar.hideItem("saveTreeStru");
    tree = codeLayout.cells("a").attachTree();
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableThreeStateCheckboxes(true);
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.enableDragAndDrop(true,true);
    tree.setDataMode("json");
    dwrCaller.executeAction("queryTypeTree",function(data){
        tree.loadJSONObject(data);
    });
    buttonToolBar=codeLayout.cells("b").attachToolbar();
    tree.attachEvent("onClick", function(id){
        mygrid.clearAll();
        if(tree.getUserData(id,"typeCode")){
            codeTypeId = tree.getUserData(id,"dirId").substring(5,tree.getUserData(id,"dirId").length);
            isEditable = tree.getUserData(id,"isEditable");
            if(isEditable==0){
                buttonToolBar.hideItem("addCode");
            }
            if(isEditable==1){
                buttonToolBar.showItem("addCode")
            }
            mygrid.load(dwrCaller.querySysCode+"?codeTypeId="+codeTypeId, "json");
            buttonToolBar.hideItem("saveSeq");
        }else{
            buttonToolBar.hideItem("addCode");
            codeTypeId = null;
            isEditable = null;
        }
    });
    tree.attachEvent("onDrag", function(sId,tId,id,sObject,tObject){
        if(!tree.getUserData(tId,"typeCode")&&tree.getUserData(tId,"dirId")){
            treeButtonBar.showItem("saveTreeStru");
            struData[sId]=tId;
            return true;
        }else{
            if(!tree.getUserData(tId,"dirId")&&!tree.getUserData(sId,"typeCode")){//最根目录
                treeButtonBar.showItem("saveTreeStru");
                struData[sId]=tId;
                return true;
            }
            return false;
        }
    });
    treeButtonBar.attachEvent("onclick",function(id){
        if(id=="saveTreeStru"){
            saveTree();
        }
        if(id=="newDir"){
            newDir();
        }
        if(id=="modifyDir"){
            modifyDir();
        }
        if(id=="deleteDir"){
            deleteDir();
        }
    });

    buttonToolBar.addButton("addCode",1,"新增编码",getBasePath()+"/meta/resource/images/addGroup.png",getBasePath()+"/meta/resource/images/addGroup.png");
    buttonToolBar.addButton("saveSeq",2,"保存序列变更",getBasePath()+"/meta/resource/images/ok.png",getBasePath()+"/meta/resource/images/ok.png");
    buttonToolBar.hideItem("addCode");
    buttonToolBar.hideItem("saveSeq");
    buttonToolBar.attachEvent("onclick",function(id){
        if(id=="addCode"&&codeTypeId!=null){
            addCode();
        }
        if(id=='saveSeq'&&codeTypeId!=null){
            saveSeq();
        }
    });

    window["getRoleButtonsCol"]=function(){
//        if(isEditable==1){
            return [{name:"modifyCode",text:"修改编码",imgEnabled:getBasePath() + "/meta/resource/images/transparent.gif",
                imgDisabled:getBasePath() + "/meta/resource/images/transparent.gif",onclick:function(rowData) {
                    modifyCode(rowData);
                }
            }];
//        }else{
//            return [];
//        }

    };
    //右侧的编码列
    mygrid = codeLayout.cells("b").attachGrid();
    mygrid.setHeader("编码名称,编码值,操作");
    mygrid.setHeaderAlign("center,center,center");
    mygrid.setInitWidthsP("40,40,20");
    mygrid.setColAlign("left,left,center");
    mygrid.setColTypes("ro,ro,sb");
    mygrid.enableResizing("true,true,false");
    mygrid.setColSorting("na,na,na");
    mygrid.enableMultiselect(false);
    mygrid.setColumnIds("codeName","codeValue","");
    mygrid.enableTooltips("true,true,false");
    mygrid.enableDragAndDrop(true);//允许拖动
    mygrid.init();
    mygrid.attachEvent("onDrop", function(sId,tId,dId,sObj,tObj,sCol,tCol){
        buttonToolBar.showItem("saveSeq");
    });

};

/**
 * 添加编码
 */
var addCode = function(){
    var addFormData = [{type:"block",offsetTop:15,list:[
        {type:"input",offsetLeft:40,label:"编码名称：",inputWidth: 120,name:"codeName",validate:"NotEmpty,MaxLength[32]"},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},
        {type:"block",offsetTop:15,list:[
            {type:"input",offsetLeft:51,label:"编码值：",inputWidth: 120,name:"codeValue",validate:"NotEmpty,MaxLength[32]"},
            {type:"newcolumn"},
            {type:"label",label:"<span style='color: red'>*</span>"}
        ]},
        {type:"block",offsetTop:10,list:[
            {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:80},
            {type:"newcolumn"},
            {type:"button",label:"关闭",name:"close",value:"关闭"}
        ]},
        {type:"hidden",name:"codeTypeId",id:"codeTypeId",value:codeTypeId}
    ];
    var dhxWindow = new dhtmlXWindows();
    dhxWindow.createWindow("addWindow", 0, 0, 250, 180);
    var addWindow = dhxWindow.window("addWindow");
    addWindow.setModal(true);
    addWindow.stick();
    addWindow.setDimension(300, 180);
    addWindow.center();
    addWindow.setPosition(addWindow.getPosition()[0],addWindow.getPosition()[1]-100);
    addWindow.denyResize();
    addWindow.denyPark();
    addWindow.button("minmax1").hide();
    addWindow.button("park").hide();
    addWindow.button("stick").hide();
    addWindow.button("sticked").hide();
    addWindow.setText("新增编码");
    addWindow.keepInViewport(true);
    addWindow.show();
    //建立表单。
    var addForm = addWindow.attachForm(addFormData);
    //添加验证
    addForm.defaultValidateEvent();
    addForm.attachEvent("onButtonClick", function(id) {
        if(id == "save"){
            if(addForm.validate()){
                CodeAction.insertSysCode(addForm.getFormData(),function(data){
                    if(data){
                        dhx.alert("新增成功");
                        dhtmlxValidation.clearAllTip();
                        addForm.clear();
                        addWindow.close();
                        dhxWindow.unload();
                        mygrid.updateGrid(sysCodeConverter.convert(data),"insert");
                    }else{
                        dhx.alert("新增失败，这也许是由于当前编码值有重复,请重试！");
                    }
                });

            }
        }
        if(id == "close"){
            addForm.clear();
            addWindow.close();
            dhxWindow.unload();
        }
    });

};

/**
 * 修改编码
 * @param rowData
 */
var modifyCode = function(rowData){
	var codeTypeId = rowData.userdata.codeTypeId;
    var modifyFormData = [{type:"block",offsetTop:15,list:[
        {type:"input",offsetLeft:40,label:"编码名称：",inputWidth: 120,name:"codeName",value:rowData.data[0],validate:"NotEmpty,MaxLength[32]"},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},
        {type:"block",offsetTop:15,list:[
            {type:"input",offsetLeft:51,label:"编码值：",inputWidth: 120,name:"codeValue",value:rowData.data[1],validate:"NotEmpty,MaxLength[32]"},
            {type:"newcolumn"},
            {type:"label",label:"<span style='color: red'>*</span>"}
        ]},
        {type:"block",offsetTop:10,list:[
            {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:80},
            {type:"newcolumn"},
            {type:"button",label:"关闭",name:"close",value:"关闭"}
        ]},
        {type:"hidden",name:"codeId",id:"codeId",value:rowData.userdata.codeId}
    ];
    var dhxWindow = new dhtmlXWindows();
    dhxWindow.createWindow("modifyWindow", 0, 0, 250, 180);
    var modifyWindow = dhxWindow.window("modifyWindow");
    modifyWindow.setModal(true);
    modifyWindow.stick();
    modifyWindow.setDimension(300, 180);
    modifyWindow.center();
    modifyWindow.setPosition(modifyWindow.getPosition()[0],modifyWindow.getPosition()[1]-100);
    modifyWindow.denyResize();
    modifyWindow.denyPark();
    modifyWindow.button("minmax1").hide();
    modifyWindow.button("park").hide();
    modifyWindow.button("stick").hide();
    modifyWindow.button("sticked").hide();
    modifyWindow.setText("修改编码");
    modifyWindow.keepInViewport(true);
    modifyWindow.show();
    //建立表单。
    var modifyForm = modifyWindow.attachForm(modifyFormData);
    //添加验证
    modifyForm.defaultValidateEvent();
    modifyForm.attachEvent("onButtonClick", function(id) {
        if(id == "save"){
            if(modifyForm.validate()){
                CodeAction.updateSysCode(modifyForm.getFormData(),codeTypeId,function(data){
                    if(data){
                        dhx.alert("修改成功");
                        modifyForm.clear();
                        modifyWindow.close();
                        dhxWindow.unload();
                        mygrid.updateGrid(sysCodeConverter.convert(data),"update");
                    }else{
                        dhx.alert("修改失败,这也许是由于当前的编码值重复,请重试！");
                    }
                });
            }
        }
        if(id == "close"){
            modifyForm.clear();
            modifyWindow.close();
            dhxWindow.unload();
        }
    });
    if(isEditable==0){
        modifyForm.setReadonly('codeValue', true);
    }
};

/**
 * 保存序列
 */
var saveSeq = function(){
    var ids=mygrid.getAllRowIds();
    CodeAction.changeSeq(ids,codeTypeId,function(r){
        if(r){
            dhx.alert("序列修改成功！");
        }else{
            dhx.alert("序列修改失败，请重试！");
        }
    });
};

///**
// * 保存树结构
// */
//var saveTreeStru = function(){
//    CodeAction.changeTreeStru(struData, function(r){
//        if(r){
//            dhx.alert("目录结构修改成功！");
//        }else{
//            dhx.alert("目录结构修改失败，请重试！");
//        }
//    });
//
//};

/**
 * 保存树信息
 */
var saveTree = function(){
    var allData = {};
    allData.struData = struData;
    allData.newDirData = newDirData;
    allData.modifyDirData = modifyDirData;
    allData.deleteDirData = deleteDirData;
    CodeAction.saveTree(allData, function(r){
        if(r){
            struData = {};
            newDirId = 0;
            newDirData = [];
            modifyDirData={};
            deleteDirData = [];
            dhx.alert("保存成功！");
        }else{
            dhx.alert("保存失败，请重试！");
        }
    })

};


var newDirId = 0;
var newDirData = [];
/**
 * 新增目录
 */
var newDir = function(){
    if(tree.getSelectedItemId()){
        if(tree.getUserData(tree.getSelectedItemId(),"typeCode")){
            dhx.alert("系统编码类型下不能新增目录！");
            return;
        }
    }
    var dhxWindow = new dhtmlXWindows();
    dhxWindow.createWindow("newDirWindow", 0, 0, 300, 50);
    var newDirWindow = dhxWindow.window("newDirWindow");
    newDirWindow.setModal(true);
    newDirWindow.stick();
    newDirWindow.setDimension(300, 50);
    newDirWindow.center();
    newDirWindow.denyResize();
    newDirWindow.denyPark();
    newDirWindow.button("minmax1").hide();
    newDirWindow.button("park").hide();
    newDirWindow.button("stick").hide();
    newDirWindow.button("sticked").hide();
    newDirWindow.setText("新增目录");
    newDirWindow.keepInViewport(true);
    newDirWindow.show();
    var formData = [{type:"block",offsetTop:15,list:[
        {type:"input",offsetLeft:30,label:"目录名称：",inputWidth: 140,name:"dirName",value:"",validate:"NotEmpty,MaxLength[32]"},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},{type:"block",offsetTop:10,list:[
        {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:90},
        {type:"newcolumn"},
        {type:"button",label:"关闭",name:"close",value:"关闭"}
    ]}];
     //建立表单。
    var newForm = newDirWindow.attachForm(formData);
    newForm.defaultValidateEvent();
    newForm.attachEvent("onButtonClick", function(id) {
        if(id == "save"){
            if(newForm.validate()){
                var dirData = {};
                dirData.dirId = "newDir_"+newDirId;
                newDirId ++;
                dirData.dirName=newForm.getItemValue("dirName");
                dirData.parentDirId=tree.getSelectedItemId()?tree.getSelectedItemId():0;
                newDirData.push(dirData);
                tree.insertNewChild(tree.getSelectedItemId()?tree.getSelectedItemId():0,dirData.dirId,dirData.dirName);
//                newForm.clear();
                newDirWindow.close();
                dhxWindow.unload();
                dhtmlxValidation.clearAllTip();
                treeButtonBar.showItem("saveTreeStru");
            }
        }
        if(id == "close"){
//            newForm.clear();
            newDirWindow.close();
            dhxWindow.unload();
        }
    });

};

var modifyDirData={};
/**
 * 编辑目录
 */
var modifyDir = function(){
    if(tree.getSelectedItemId()){
        if(tree.getUserData(tree.getSelectedItemId(),"typeCode")){
            dhx.alert("不能修改编码类型，只能修改目录名称！");
            return;
        }
    }else{
        dhx.alert("请选择一个目录进行修改！");
        return;
    }
    var dhxWindow = new dhtmlXWindows();
    dhxWindow.createWindow("modifyDirWindow", 0, 0, 300, 50);
    var modifyDirWindow = dhxWindow.window("modifyDirWindow");
    modifyDirWindow.setModal(true);
    modifyDirWindow.stick();
    modifyDirWindow.setDimension(300, 50);
    modifyDirWindow.center();
    modifyDirWindow.denyResize();
    modifyDirWindow.denyPark();
    modifyDirWindow.button("minmax1").hide();
    modifyDirWindow.button("park").hide();
    modifyDirWindow.button("stick").hide();
    modifyDirWindow.button("sticked").hide();
    modifyDirWindow.setText("修改目录");
    modifyDirWindow.keepInViewport(true);
    modifyDirWindow.show();
    var formData = [{type:"block",offsetTop:15,list:[
        {type:"input",offsetLeft:30,label:"目录名称：",inputWidth: 140,name:"dirName",value:tree.getSelectedItemText(),validate:"NotEmpty,MaxLength[32]"},
        {type:"newcolumn"},
        {type:"label",label:"<span style='color: red'>*</span>"}
    ]},{type:"block",offsetTop:10,list:[
        {type:"button",label:"保存",name:"save",value:"保存",offsetLeft:90},
        {type:"newcolumn"},
        {type:"button",label:"关闭",name:"close",value:"关闭"}
    ]}];
    var modifyForm = modifyDirWindow.attachForm(formData);
    modifyForm.defaultValidateEvent();
    modifyForm.attachEvent("onButtonClick", function(id) {
        if(id == "save"){
            if(modifyForm.validate()){
                var dirData = {};
                dirData.dirId = tree.getSelectedItemId();
                dirData.dirName=modifyForm.getItemValue("dirName");
                modifyDirData[tree.getSelectedItemId()]=modifyForm.getItemValue("dirName");
                tree.setItemText(dirData.dirId,dirData.dirName);
                modifyForm.clear();
                modifyDirWindow.close();
                dhxWindow.unload();
                treeButtonBar.showItem("saveTreeStru");
            }
        }
        if(id == "close"){
            modifyForm.clear();
            modifyDirWindow.close();
            dhxWindow.unload();
        }
    });

};

var deleteDirData = [];

/**
 * 删除目录
 */
var deleteDir = function(){
    if(tree.getSelectedItemId()){
        if(tree.getUserData(tree.getSelectedItemId(),"typeCode")){
            dhx.alert("不能删除编码类型！");
            return;
        }
    }else{
        dhx.alert("请选择一个目录删除！");
        return;
    }
    if(tree.hasChildren(tree.getSelectedItemId())){
        dhx.alert("该目录有子节点，不能删除！");
        return;
    }
    deleteDirData.push(tree.getSelectedItemId());
    tree.deleteItem(tree.getSelectedItemId());
    treeButtonBar.showItem("saveTreeStru");
};

dhx.ready(sysCodeInit);