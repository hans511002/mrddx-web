/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *       selectPeople.js
 *Description：
 *       选择人员的一个JS文件
 *Dependent：
 *       dhtmlx.js，dwr 有关JS，dhtmxExtend.js
 *Author:
 *       张伟
 *Date：
 *       2012-04-16
 ********************************************************/
/**
 * 定义全局的部门、岗位、地域树
 */
var globDeptTree = null;
var globStationTree = null;
var globZoneTree = null;
var user = getSessionAttribute("user");
var dwrCaller = new biDwrCaller();
/**
 * User表Data转换器
 */
var userConvertConfig = {
    idColumnName:"userId",
    filterColumns:["ischecked", "userNamecn", "zoneName", "deptName", "stationName"],
	userData:function(rowIndex, rowData) {
		var userData = {};
		userData["userNamecn"] = rowData["userNamecn"];
		return userData;
	}
};
/**
 * JS内部类 用于数据转换
 */
var userDataConverter = new dhtmxGridDataConverter(userConvertConfig);
var loadUserParam = new biDwrMethodParam();
//添加加载用户事件
dwrCaller.addAutoAction("selectUser", "UserAction.selectUser", loadUserParam);
dwrCaller.addDataConverter("selectUser", userDataConverter);
var dhxUserWindow = null;
var refUserWindow = null;
/**
 * config{
 *  selectUsers:已经选择了的人员ID，以","号分割
 *  selectModel:1:单选,0:多选 //TODO 待实现
 *  onSelectUser:function(userId,win) 当选择一个用户的回调事件，//TODO 待实现
 *  onOkClick:function(userIds) 当点击确定时的回调事件
 *  title:选择人员的标题,
 *  width: //宽度
 *  height: //高度
 *  onWinClose:当window关闭的事件
 * }
 * @param config
 */
var showUser = function (config) {
    var title = config.title || '请您选择人员';
    if (!dhxUserWindow) {
        dhxUserWindow = new dhtmlXWindows();
    }
    var size = Tools.propWidthDycSize(20, 20, 20, 20);
    var width = config.width || size.width;
    var height = config.height || size.height;
    dhxUserWindow.createWindow("refUserWindow", 0, 0, width, height);
    var refUserWindow = dhxUserWindow.window("refUserWindow");
    refUserWindow.setModal(false);
    refUserWindow.setDimension(width, height);
    refUserWindow.center();
    refUserWindow.denyResize();
    refUserWindow.setText(title);
    //关闭一些不用的按钮。
    refUserWindow.button("minmax1").hide();
    refUserWindow.button("park").hide();
    refUserWindow.button("stick").hide();
    refUserWindow.button("sticked").hide();
    refUserWindow.show();
    var refUserLayout = new dhtmlXLayoutObject(refUserWindow, "3E");
    refUserLayout.cells("a").hideHeader(true);
    refUserLayout.cells("b").hideHeader(true);
    refUserLayout.cells("c").hideHeader(true);
    refUserLayout.cells("a").setHeight(20);
    refUserLayout.cells("a").fixSize(false, true);
    refUserLayout.cells("c").setHeight(20);
    refUserLayout.hideSpliter();//移除分界边框。
    refUserLayout.hideConcentrate();
    //加载查询表单
    var queryform = refUserLayout.cells("a").attachForm([
        {type:"settings", position:"label-left", labelWidth:30, inputWidth:50},
        {type:"input", label:"姓名：", name:"userName"},
        {type:"newcolumn"},
        {type:"input", label:"地域：", name:"zone"},
        {type:"newcolumn"},
        {type:"input", label:"部门：", name:"dept"},
        {type:"newcolumn"},
        {type:"input", label:"岗位：", name:"station"},
        {type:"newcolumn"},
        {type:"hidden", name:"reportId", value:reportId},
        {type:"button", name:"query", value:"查询"}
    ]);
    //定义loadUser Action的参数来源于表单queryform数据。
    loadUserParam.setParamConfig([
        {index:0, type:"fun", value:function () {
            var formData = queryform.getFormData();
            formData.userName = Tools.trim(queryform.getInput("userName").value);
            return formData;
        }
        },
        {
            index:1, type:"static", value:config.selectUsers && (config.selectUsers + "").split(",")}
    ]);

//加载部门树
    loadDeptTreeChkbox(null, queryform);
//加载地域树
    loadZoneTreeChkBox(user.zoneId, queryform);
//加载岗位树
    loadStationTreeChkBox(null, queryform);
    var btnFormData =
        [
            {type:"settings", position:"label-left"},
            {type:"block", offsetTop:5, inputTop:5, list:[
                {type:"settings", position:"label-left"},
                {type:"button", label:"确定", name:"save", value:"确定", offsetLeft:180}
            ]}
        ];
    var btnForm = refUserLayout.cells("c").attachForm(btnFormData);
    btnForm.attachEvent("onButtonClick", function (id) {
        if (id == "save") {
            var ids = refUserGrid.getCheckedRows(0);
            var names = new Array();
            for(var i=0;i<((ids+"").split(",")).length;i++) {
            	names.push(refUserGrid.getUserData(ids.split(",")[i],"userNamecn"));
            }
            config.onOkClick(ids,names.join(','));
            refUserWindow.close();
        }
    });
    userDataConverter.cellDataFormat = function (rowIndex, columnIndex, columnName, cellValue, rowData) {
        if (columnName == "ischecked") {//如果是选中列
            if (config.selectUsers) {
                return (config.selectUsers+"").indexOf(rowData.userId)>-1?1:0;
            }
        }else{
            return this._super.cellDataFormat(rowIndex, columnIndex, columnName, cellValue, rowData);
        }
    }
    var refUserGrid = refUserLayout.cells("b").attachGrid();
    refUserGrid.setHeader(",姓名,地域,部门,岗位");
    refUserGrid.setHeaderBold();
    refUserGrid.setInitWidthsP("8,22,20,25,25");
    refUserGrid.setColAlign("center,left,left,left,left");
    refUserGrid.setHeaderAlign("center,left,center,center,center");
    refUserGrid.setColTypes("ch,ro,ro,ro,ro");
    refUserGrid.enableCtrlC();
    refUserGrid.setColSorting("na,na,na,na,na");
    refUserGrid.enableMultiselect(true);
    refUserGrid.init();
    refUserGrid.defaultPaging(10);
    refUserGrid.clearAll();
    refUserGrid.load(dwrCaller.selectUser, "json");

    queryform.attachEvent("onButtonClick", function (id) {
        if (id == "query") {
            //进行数据查询。
            refUserGrid.clearAll();
            refUserGrid.load(dwrCaller.selectUser, "json");
        }
    });
// 添加Enter查询事件
    queryform.getInput("userName").onkeypress = function (e) {
        e = e || window.event;
        var keyCode = e.keyCode;
        if (keyCode == 13) {
            refUserGrid.clearAll();
            refUserGrid.load(dwrCaller.selectUser, "json");
        }
    }
    refUserWindow.attachEvent("onClose", function () {
        config.onWinClose && config.onWinClose(this);
        return true;
    })
    return refUserWindow;
};

dwrCaller.addAutoAction("loadDeptTree", "DeptAction.queryDeptByPath");
var treeConverter = new dhtmxTreeDataConverter({
    idColumn:"deptId", pidColumn:"parentId",
    isDycload:false, textColumn:"deptName"
});
dwrCaller.addDataConverter("loadDeptTree", treeConverter);
//树动态加载Action
dwrCaller.addAction("querySubDept", function (afterCall, param) {
    var tempCovert = dhx.extend({isDycload:true}, treeConverter, false);
    DeptAction.querySubDept(param.id, function (data) {
        data = tempCovert.convert(data);
        afterCall(data);
    })
});
/**
 * 部门树input框Html。
 * @param selectDept 已经选择了的部门。
 */
var loadDeptTree = function (selectDept, form) {
    //加载部门树数据。加载用户所在部门及其子部门。
    selectDept = selectDept || global.constant.defaultRoot;
//    var beginId=global.constant.defaultRoot;
    var beginId = 1;
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
    tree.attachEvent("onDblClick", function (nodeId) {
        form.setFormData({dept:tree.getItemText(nodeId), deptId:nodeId});
        //关闭树
        div.style.display = "none";
    });
    dwrCaller.executeAction("loadDeptTree", beginId, selectDept, function (data) {
        tree.loadJSONObject(data);
        globDeptTree = tree;
        if (selectDept) {
            tree.selectItem(selectDept); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "focus", function () {
            div.style.width = target.offsetWidth + 'px';
            Tools.divPromptCtrl(div, target, true);
            div.style.display = "block";
        })
    });
    div.style.display = "none";
}

//为查询时可多选，新添加的TREE
var loadDeptTreeChkbox = function (selectDept, form) {
    //加载部门树数据。加载用户所在部门及其子部门。
    selectDept = selectDept || global.constant.defaultRoot;
//    var beginId=global.constant.defaultRoot;
    var beginId = 1;
    //创建tree Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 190px;width: 180px;overflow: auto;padding: 0;margin: 0;" +
            "z-index:1000;background-color:white", id:'_deptDiv'
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
    tree.attachEvent("onCheck", function (id, state) {
        var checkedData = [];
        var allChecked = tree.getAllChecked();
        //寻找ID所有子节点

        var nodes = typeof allChecked == "string" ? allChecked.split(",") : [allChecked];
        var depts = "";
        var deptsId = "";
        for (i = 0; i < nodes.length; i++) {
            var scanIds = typeof tree.getAllSubItems(nodes[i]) == "string" ? tree.getAllSubItems(nodes[i]).split(",") : [tree.getAllSubItems(nodes[i])];
            if (scanIds.length > 1) {
                for (j = 0; j < scanIds.length; j++) {
                    if (depts == "") {
                        depts = tree.getItemText(scanIds[j]).toString();
                    } else {

                        depts = depts + "," + tree.getItemText(scanIds[j]).toString();
                    }
                    if (deptsId == "") {
                        deptsId = scanIds[j].toString();
                    } else {
                        deptsId = deptsId + "," + scanIds[j].toString();
                    }
                }
            } else {
                if (depts == "") {
                    depts = tree.getItemText(nodes[i]).toString();
                } else {
                    depts = depts + "," + tree.getItemText(nodes[i]).toString();
                }
                if (deptsId == "") {
                    deptsId = nodes[i].toString();
                } else {
                    deptsId = deptsId + "," + nodes[i].toString();
                }
            }


        }
        if (depts == 0) {
            depts = "";
            deptsId = null;
        }

        form.setFormData({dept:depts, deptId:deptsId});
//        div.style.display = "none";
    });
    tree.attachEvent("onSelect", function (id) {
        tree.setCheck(id, 1);
        var checkedData = [];
        var allChecked = tree.getAllChecked();
        //寻找ID所有子节点

        var nodes = typeof allChecked == "string" ? allChecked.split(",") : [allChecked];
        var depts = "";
        var deptsId = "";
        for (i = 0; i < nodes.length; i++) {
            var scanIds = typeof tree.getAllSubItems(nodes[i]) == "string" ? tree.getAllSubItems(nodes[i]).split(",") : [tree.getAllSubItems(nodes[i])];
            if (scanIds.length > 1) {
                for (j = 0; j < scanIds.length; j++) {
                    if (depts == "") {
                        depts = tree.getItemText(scanIds[j]).toString();
                    } else {

                        depts = depts + "," + tree.getItemText(scanIds[j]).toString();
                    }
                    if (deptsId == "") {
                        deptsId = scanIds[j].toString();
                    } else {
                        deptsId = deptsId + "," + scanIds[j].toString();
                    }
                }
            } else {
                if (depts == "") {
                    depts = tree.getItemText(nodes[i]).toString();
                } else {
                    depts = depts + "," + tree.getItemText(nodes[i]).toString();
                }
                if (deptsId == "") {
                    deptsId = nodes[i].toString();
                } else {
                    deptsId = deptsId + "," + nodes[i].toString();
                }
            }


        }
        if (depts == 0) {
            depts = "";
            deptsId = null;
        }

        form.setFormData({dept:depts, deptId:deptsId});
//        div.style.display = "none";
    });


    tree.setXMLAutoLoading(dwrCaller.querySubDept);
//    div.style.display = "none";
    var that = this;

    //移动节点位置至指定节点下。
    var target = form.getInput("dept");
    //target.readOnly=true;


    dwrCaller.executeAction("loadDeptTree", beginId, selectDept, function (data) {
        tree.loadJSONObject(data);
        globDeptTree = tree;
        if (selectDept) {
            tree.selectItem(selectDept); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "focus", function () {
            //div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div, target, true);
            div.style.display = "block";
        })
    });
    div.style.display = "none";
}

dwrCaller.addAutoAction("loadStationTree", "StationAction.queryStationByPath");
var stationConverter = dhx.extend({idColumn:"stationId", pidColumn:"parStationId",
    textColumn:"stationName"
}, treeConverter, false);
dwrCaller.addDataConverter("loadStationTree", stationConverter);
//树动态加载Action
dwrCaller.addAction("querySubStation", function (afterCall, param) {
    var tempCovert = dhx.extend({isDycload:true}, stationConverter, false);
    StationAction.querySubStation(param.id, function (data) {
        data = tempCovert.convert(data);
        afterCall(data);
    })
});

/**
 * 岗位input输入框Html
 * @param name
 * @param VALUE
 */
var loadStationTree = function (selectStation, form) {
    //加载部门树数据。加载用户所在部门及其子部门。
    selectStation = selectStation || global.constant.defaultRoot;
//    var beginId=global.constant.defaultRoot;
    var beginId = 1;
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
    tree.attachEvent("onDblClick", function (nodeId) {
        form.setFormData({station:tree.getItemText(nodeId), stationId:nodeId});
        //关闭树
        div.style.display = "none";
    });
    dwrCaller.executeAction("loadStationTree", beginId, selectStation, function (data) {
        tree.loadJSONObject(data);
        globStationTree = tree;
        if (selectStation) {
            tree.selectItem(selectStation); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "focus", function () {
            div.style.width = target.offsetWidth + 'px';
            Tools.divPromptCtrl(div, target, true);
            div.style.display = "block";
        })
    })
    div.style.display = "none";
}
//添加岗位可以多选
var loadStationTreeChkBox = function (selectStation, form) {
    //加载部门树数据。加载用户所在部门及其子部门。
    selectStation = selectStation || global.constant.defaultRoot;
//    var beginId=global.constant.defaultRoot;
    var beginId = 1;
    //创建Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;width: 180px;overflow: auto;padding: 0;margin: 0;" +
            "z-index:1000;background-color:white", id:"_stationDiv"
    });
    document.body.appendChild(div);
    //创建tree Div层
    var treeDiv = dhx.html.create("div", {
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
    var target = form.getInput("station");
    target.readOnly = true;

    //生成树
    var tree = new dhtmlXTreeObject(treeDiv, treeDiv.style.width, treeDiv.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableCheckBoxes(true);
    tree.enableThreeStateCheckboxes(true);
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.attachEvent("onCheck", function (id, state) {
        var checkedData = tree.getAllChecked();
        var nodes = typeof checkedData == "string" ? checkedData.split(",") : [checkedData];
        var stations = "";
        var stationsId = "";
        for (i = 0; i < nodes.length; i++) {
            if (stations == "") {
                stations = tree.getItemText(nodes[i]).toString();
            } else {
                stations = stations + "," + tree.getItemText(nodes[i]).toString();
            }
            if (stationsId == "") {
                stationsId = nodes[i].toString();
            } else {
                stationsId = stationsId + "," + nodes[i].toString();
            }
        }
        if (stations == 0) {
            stations = "";
            stationsId = null;
        }
        form.setFormData({station:stations, stationId:stationsId});
//        div.style.display = "none";
    });
    tree.attachEvent("onSelect", function (id) {
        tree.setCheck(id, 1);
        var checkedData = tree.getAllChecked();
        var nodes = typeof checkedData == "string" ? checkedData.split(",") : [checkedData];
        var stations = "";
        var stationsId = "";
        for (i = 0; i < nodes.length; i++) {
            if (stations == "") {
                stations = tree.getItemText(nodes[i]).toString();
            } else {
                stations = stations + "," + tree.getItemText(nodes[i]).toString();
            }
            if (stationsId == "") {
                stationsId = nodes[i].toString();
            } else {
                stationsId = stationsId + "," + nodes[i].toString();
            }
        }
        if (stations == 0) {
            stations = "";
            stationsId = null;
        }
        form.setFormData({station:stations, stationId:stationsId});
//        div.style.display = "none";
    });


    tree.setXMLAutoLoading(dwrCaller.querySubStation);
    dwrCaller.executeAction("loadStationTree", beginId, selectStation, function (data) {
        tree.loadJSONObject(data);
        globStationTree = tree;
        if (selectStation) {
            tree.selectItem(selectStation); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "focus", function () {
            //div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div, target, true);
            div.style.display = "block";
        })
    })
    div.style.display = "none";
}


dwrCaller.addAutoAction("loadZoneTree", "ZoneAction.queryZoneByPath");
var zoneConverter = dhx.extend({idColumn:"zoneId", pidColumn:"zoneParId",
    textColumn:"zoneName"
}, treeConverter, false);
dwrCaller.addDataConverter("loadZoneTree", zoneConverter);
//树动态加载Action
dwrCaller.addAction("querySubZone", function (afterCall, param) {
    var tempCovert = dhx.extend({isDycload:true}, zoneConverter, false);
    ZoneAction.querySubZone(param.id, function (data) {
        data = tempCovert.convert(data);
        afterCall(data);
    })
});

var loadZoneTreeChkBox = function (selectZone, form) {
    //加载部门树数据。加载用户所在部门及其子部门。
    selectZone = selectZone || global.constant.defaultRoot;
    var beginId = (user.userId == global.constant.adminId ? global.constant.defaultRoot : user.zoneId)
        || global.constant.defaultRoot;
    //创建Div层
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;width: 180px;overflow: auto;padding: 0;margin: 0;" +
            "z-index:1000;background-color:white", id:"_zoneDiv"
    });
    document.body.appendChild(div);
    //创建tree Div层
    var treeDiv = dhx.html.create("div", {
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
    var target = form.getInput("zone");
    target.readOnly = true;

    //生成树
    var tree = new dhtmlXTreeObject(treeDiv, treeDiv.style.width, treeDiv.style.height, 0);
    tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
    tree.enableCheckBoxes(true);
    tree.enableThreeStateCheckboxes(true);
    tree.enableHighlighting(true);
    tree.enableSingleRadioMode(true);
    tree.setDataMode("json");
    tree.setXMLAutoLoading(dwrCaller.querySubZone);
    tree.attachEvent("onCheck", function (id, state) {
        var checkedData = tree.getAllChecked();
        var nodes = typeof checkedData == "string" ? checkedData.split(",") : [checkedData];
        var zones = "";
        var zonesId = "";
        for (i = 0; i < nodes.length; i++) {
            if (zones == "") {
                zones = tree.getItemText(nodes[i]).toString();
            } else {
                zones = zones + "," + tree.getItemText(nodes[i]).toString();
            }
            if (zonesId == "") {
                zonesId = nodes[i].toString();
            } else {
                zonesId = zonesId + "," + nodes[i].toString();
            }
        }
        if (zones == 0) {
            zones = "";
            zonesId = null;
        }
        form.setFormData({zone:zones, zoneId:zonesId});
    });


    tree.attachEvent("onSelect", function (id) {
        tree.setCheck(id, 1);
        var checkedData = tree.getAllChecked();
        var nodes = typeof checkedData == "string" ? checkedData.split(",") : [checkedData];
        var zones = "";
        var zonesId = "";
        for (i = 0; i < nodes.length; i++) {
            if (zones == "") {
                zones = tree.getItemText(nodes[i]).toString();
            } else {
                zones = zones + "," + tree.getItemText(nodes[i]).toString();
            }
            if (zonesId == "") {
                zonesId = nodes[i].toString();
            } else {
                zonesId = zonesId + "," + nodes[i].toString();
            }
        }
        if (zones == 0) {
            zones = "";
            zonesId = null;
        }
        form.setFormData({zone:zones, zoneId:zonesId});
    });

    dwrCaller.executeAction("loadZoneTree", beginId, selectZone, function (data) {
        tree.loadJSONObject(data);
        globZoneTree = tree;
        if (selectZone) {
            tree.selectItem(selectZone); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "click", function () {
            // div.style.width = target.offsetWidth+'px';
            Tools.divPromptCtrl(div, target, true);
            div.style.display = "block";
        })
    })
    div.style.display = "none";
}

var loadZoneTree = function (selectZone, form) {
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
    tree.attachEvent("onDblClick", function (nodeId) {
        form.setFormData({zone:tree.getItemText(nodeId), zoneId:nodeId});
        //关闭树
        div.style.display = "none";
    });
    dwrCaller.executeAction("loadZoneTree", beginId, selectZone, function (data) {
        tree.loadJSONObject(data);
        globZoneTree = tree;
        if (selectZone) {
            tree.selectItem(selectZone); //选中指定节点
            //将input框选中
            target.value = tree.getSelectedItemText();
        }
        //为div添加事件
        Tools.addEvent(target, "focus", function () {
            div.style.width = target.offsetWidth + 'px';
            Tools.divPromptCtrl(div, target, true);
            div.style.display = "block";
        })
    })
    div.style.display = "none";
}