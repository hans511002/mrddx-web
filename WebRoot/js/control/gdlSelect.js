/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *       填文件名
 *Description：
 *       填描述
 *Dependent：
 *       dhtmlx.js，dwr 有关JS，dhtmxExtend.js
 *Author:
 *       张伟
 *Date：
 *       2012-11-08
 ********************************************************/

/**
 * 指标选择配置，包括下面配置
 * isMultiple:true/false 是否多选
 * confirmCall:确认时的回调函数
 * @param config
 */
var selectGdlId = {};
function Gdl(config) {
    this.config = config;
    this.childCount = {};
    this.moreGdlId = -2;
    this.gdlInfo = {};
    this.showWin = function () {
        if (!this.win) {
            var newWindow = DHTMLXFactory.createWindow("1", "winInst", 0, 0, 500, 450);
            newWindow.stick();
            newWindow.denyResize();
            newWindow.denyPark();
            newWindow.button("minmax1").hide();
            newWindow.button("park").hide();
            newWindow.button("stick").hide();
            newWindow.button("sticked").hide();
            newWindow.center();
            newWindow.setText("选择指标<span style='font-size: 12px;color: red;'>注：双击指标进行选择</span>");
            newWindow.keepInViewport(true);
            this.win = newWindow;
            var self=this;
            $("_gdlSave").onclick = function () {
                if (Tools.isEmptyObject(selectGdlId)) {
                    dhx.alert("您未选择指标！");
                    return;
                }
                if (self.config.confirmCall) {
                    self.config.confirmCall.call(window, selectGdlId);
                }
                self.win.close();
            }
            this.win.attachEvent("onClose", function (win) {
                win.hide();
                self.childCount = {};
                self.moreGdlId = -2;
                self.gdlInfo = {};
                selectGdlId = {};
            })
            $("_gdlCancel").onclick = function () {
                self.win.close();
            }
        }
        this.win.bringToTop();
        this.win.show();
        this.win.attachObject(document.getElementById("_gdlSelectTb"));
    }
    this.initGdlTree = function () {
        var self = this;
        //初始化全选指标树
        if (!this.gdlTree) {
            var tree = new dhtmlXTreeObject($("gdlTree"), ($("gdlTree").offsetWidth - 20) + "px", ($("gdlTree").offsetHeight + 0) + "px", 0);
            tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
            tree.enableMultiselection(0);
            tree.setXMLAutoLoadingBehaviour("function");
            tree.setXMLAutoLoading(function (groupId) {
                self.dycLoadTree(groupId);
            });//设置异步加载
            this.gdlTree = tree;
            this.gdlTree.attachEvent("onDblClick", function (id) {
                var thatTree = this;
                //更多节点
                if (parseInt(id) < -1) {
                    var parId = thatTree.getParentId(id);
                    thatTree.deleteItem(id);
                    self.queryTree(parId, self.childCount[parId]);
                } else {
                    var gdlInfo = self.gdlTree.getUserData(id, "GDL_INFO");
                    if (gdlInfo) {
                        //选中指标数据
                        var gdlId = id.split("_")[1];
                        if (!selectGdlId[gdlId]) {
                            var selectHtml = '<div class="dimOrGdlDiv" id="GDL_' + gdlId + '"><label for="' + gdlInfo.GDL_NAME + '">' + gdlInfo.GDL_NAME
                                + '</label><span style="color:red; cursor:pointer;" onclick="removeSelectGdl(\'' + gdlId + '\')" title="删除">×</span></div>';
                            $("hasSelect").innerHTML += selectHtml;
                            selectGdlId[gdlId] = gdlInfo;
                        }
                    }
                }
            });
            $("searchInput").onkeyup = function (e) {
                e = e || window.event;
                if (e.keyCode == 13) {
                    var keyWord = dwr.util.getValue("searchInput");
                    self.treeKeyWord = keyWord;
                    self.queryTree(0, 0, keyWord);
                }
            }
        }
        this.queryTree(0, 0);
    }
    /**
     * 动态加载树
     * @param groupId
     */
    this.dycLoadTree = function (groupId) {
        if (!this.treeKeyWord) {
            this.queryTree(groupId);
        }
    }
    /**
     * 查询指标树
     * @param groupId 分类ID
     * @param start  起始值
     * @param keyWord 关键字
     */
    this.queryTree = function (groupId, start, keyWord) {
        if (!groupId) {
            dhx.showProgress("提示", "正在为您查询指标数据，请耐心稍后...");
        }
        var self = this;
        start = start || 0;
        var page = {posStart:start, count:10};
        ReportIndexAction.queryGdlTree(groupId, page, keyWord, function (data) {
            dhx.closeProgress();
            self.bindGdlTreeData(groupId, data, groupId == 0, keyWord);
        })
    }
    /**
     * 绑定指标树
     * @param groupId
     * @param data
     * @param isClear
     * @param keyWord
     */
    this.bindGdlTreeData = function (groupId, data, isClear, keyWord) {
        if (isClear) {
            this.childCount = {};
            this.gdlTree.clearAll();
        }
        if (data) {
            var groups = data["group"];
            var gdls = data["gdlInfos"];
            if (groups && groups.length > 0) {
                for (var i = 0; i < groups.length; i++) {
                    var pid = groups[i]["PAR_GROUP_ID"];
                    var itemid = groups[i]["GDL_GROUP_ID"];
                    var txt = groups[i]["GROUP_NAME"];
                    this.gdlTree.insertNewChild(pid, itemid, txt, null, "folderClosed.gif", 0, 0, 0, 1);
                }
            }
            var dataCount = (gdls && gdls[0] && gdls[0].TOTAL_COUNT_) || 0;
            if (!this.childCount[groupId]) {
                this.childCount[groupId] = 0;
            }
            if (gdls && gdls.length) {
                for (var j = 0; j < gdls.length; j++) {
                    var tempGroup = gdls[j]["GDL_GROUP_ID"] || groupId;
                    var tempGroups = (tempGroup + "").split(",");
                    this.gdlInfo[gdls[j]["GDL_ID"]] = gdls[j];
                    for (var k = 0; k < tempGroups.length; k++) {
                        var itemid = "GDL" + tempGroups[k] + "_" + gdls[j]["GDL_ID"];
                        var txt = gdls[j]["GDL_NAME"];
                        if (keyWord) {
                            var word = keyWord.replace(/\s+/g, " ");
                            word = word.split(" ");
                            for (var count = 0; count < word.length; count++) {
                                if (!word[count].trim()) {
                                    continue;
                                }
                                txt = txt.replace(new RegExp("(" + Tools.replaceKeyWord(word[count]) + ")", "ig"), "<span style='color: red'>$1</span>");
                            }
                        }
                        this.gdlTree.insertNewChild(tempGroups[k], itemid, txt, null, 0, 0, 0, 0, 0);
                        this.gdlTree.setUserData(itemid, "GDL_INFO", dhx.extend({}, gdls[j]));
                        if (gdls[j]["RIGHT_TYPE"] == 1) {  //私有指标
                            this.gdlTree.setItemStyle(itemid, "color:#64B201");
                        }
                    }
                }
                this.childCount[groupId] += gdls.length;
            }
            //加入更多节点
            if (groupId && dataCount > this.childCount[groupId]) {
                var nowCount = dataCount - this.childCount[groupId];
                this.gdlTree.insertNewChild(groupId, this.moreGdlId, "更多指标(" + nowCount + ")", null, "../../../images/move_down.png", 0, 0, 0, 0);
                this.gdlTree.setItemStyle(this.moreGdlId--, "color:red");
            }
        }
    }

}

Gdl.prototype.show = function (gdlIds) {
    this.showWin();
    this.initGdlTree();
    this.treeKeyWord = "";
    $("hasSelect").innerHTML="";
    $("searchInput").value = "";
    if (gdlIds) {
        if (!dhx.isArray(gdlIds)) {
            gdlIds = (gdlIds + "").split(",");
        }
        var self = this;
        ReportIndexAction.queryGdlInfos(gdlIds, function (data) {
            var gdls = data["gdlInfos"];
            if (gdls && gdls.length > 0) {
                for (var i = 0; i < gdls.length; i++) {
                    var gdlId = gdls[i].GDL_ID;
                    self.gdlInfo[gdlId] = gdls[i];
                    selectGdlId[gdlId] = gdls[i];
                    var selectHtml = '<div class="dimOrGdlDiv" id="GDL_' + gdlId + '"><label for="' + self.gdlInfo[gdlId].GDL_NAME + '">' + self.gdlInfo[gdlId].GDL_NAME
                        + '</label><span style="color:red; cursor:pointer;" onclick="removeSelectGdl(\'' + gdlId + '\')" title="删除">×</span></div>';
                    $("hasSelect").innerHTML += selectHtml;
                }
            }
        })
    }
}

function removeSelectGdl(gdlId) {
    delete selectGdlId[gdlId];
    $("GDL_" + gdlId).parentNode.removeChild($("GDL_" + gdlId));
}