/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        main.js
 *Description：
 *       主页内容框架页调度JS
 *Dependent：
 *       写依赖文件
 *Author:
 *        张伟
 *Finished：
 *       2011-9-26
 *Modified By：程钰
 *
 *Modified Date:
 *         2011-10-13
 *Modified Reasons:
 *          添加菜单访问日志方法

 ********************************************************/
/**
 * 框架内容页面
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var user = window.parent.getSessionAttribute("user");
//当前打开得Tab个数
var tabCount = 0;
//允许的最大tab个数
var maxTabCont = 50;
//主页tabbar
var mainTabbar = null;
//
var base = getBasePath();
//已经打开的menuTabs
var menuTabs = {};
//所有的子菜单菜单数据，如无子节点，对应空数组
var subMenuData = [];
//所有菜单数据
var allMenuData = [];
//菜单访问历史。
var menuHistory = [];
var empty = [];
var dwrCaller = new biDwrCaller();
dwrCaller.isShowProcess(false);//不用显示进度条。
dwrCaller.addAction("queryAllSubMenu", function (afterCall, param, converter) {
    LoginAction.queryAllSubMenu(param, function (data) {
        var replaceData = filterHiddenMenu(data);
        afterCall(converter.convert(replaceData));
    })
    dhx.env.isIE && CollectGarbage();
});

var treeConverter = new dhtmxTreeDataConverter({
    /**
     * 设置自定义用户属性
     * @param rowIndex
     * @param rowData
     * @return
     */
    userData:function (rowIndex, rowData) {
        return {menuData:rowData};
    },
    isDycload:false, idColumn:"menuId", pidColumn:"parentId", textColumn:"menuName",
    isFormatColumn:false,
    isOpen:function () {//默认所有都不展开。
        return true;
    },
    compare:function (data1, data2) {
        if (data1.userdata[0]["content"].orderId == undefined || data1.userdata[0]["content"].orderId == null) {
            return false;
        }
        if (data2.userdata[0]["content"].orderId == undefined || data2.userdata[0]["content"].orderId == null) {
            return false;
        }
        return data1.userdata[0]["content"].orderId <= data2.userdata[0]["content"].orderId
    }
});
dwrCaller.addDataConverter("queryAllSubMenu", treeConverter);
dwrCaller.addAutoAction("menuVisitLog", "MenuVisitLogAction.writeMenuLog", function () {
});
/**
 * 点击菜单操作
 * @param menuId
 * @param menuData
 * @param isRefresh 如果此菜单已打开，是否进行刷新
 */
var menuClick = function (menuId, menuData, isRefresh) {
    if (!menuData.menuUrl) {
        return;
    }
    if (!Tools.trim(menuData.menuUrl)) {
        return;
    }
    //记录访问日志。
    if ((menuId != undefined || menuId != null) && !isNaN(menuId)) {
        dwrCaller.executeAction("menuVisitLog", [
            {menuId:menuId, menuName:menuData.menuName}
        ]);
        //缓存菜单访问历史
        menuHistory.push(menuId);
    } else {
        //判断menuId是否为null，如果为 null，是在数据中一个未注册的ID,伪造一个假菜单数据。
        //但menuData中必须有的三个属性为，menuName,menuUrl, target
        if (!menuId)
            menuId = menuData.menuName;

        menuId = encodeURI(encodeURI(menuId));
        menuData.menuId = menuId;
        //伪造菜单数据。
        subMenuData[menuId] = empty;
    }
    //处理菜单动作，是新开窗口还是openTab
    if (menuData.target == "blank") { //新开一个窗口
        openWindow(menuId, menuData);
    } else {//open Tab
        loadSubdMenuData(menuId, menuData, (isRefresh == null || isRefresh == undefined) ? menuData.isRefresh : isRefresh, openTab);
    }
    dhx.env.isIE && CollectGarbage();
}
/**
 * 加载子菜单数据
 * @param menuId
 */
var loadSubdMenuData = function (menuId, menuData, isRefresh, afterCall) {
    if (!subMenuData[menuId]) {
        treeConverter.setRoot(menuId);
        //查询所有的子节点。
        dwrCaller.executeAction("queryAllSubMenu", menuId, function (data) {
            treeConverter.setRoot(menuId);
            if (data) {
                var item = data.item;
                if (item && item.length > 0) { //有子节点
                    subMenuData[menuId] = item;
                    //中序遍历，依次访问子节点数据。
                    var nextScan = item;
                    while (true) {
                        var tempScan = [];
                        if (nextScan.length > 0) {
                            for (var i = 0; i < nextScan.length; i++) {
                                var node = nextScan[i];
                                if (node.item) {//有子节点
                                    subMenuData[node.id] = node.item;
                                    if (dhx.isArray(node.item)) {
                                        tempScan = tempScan.concat(node.item);//数组连接
                                    } else {
                                        tempScan.push(node.item);
                                    }
                                } else {
                                    subMenuData[node.id] = empty;
                                }
                            }
                            nextScan = tempScan;
                        } else {
                            break;
                        }
                    }
                }
            }
            if (!subMenuData[menuId]) {
                subMenuData[menuId] = empty;
            }
            return afterCall ? afterCall(menuId, menuData, isRefresh) : null;
        });
    } else {
        return afterCall ? afterCall(menuId, menuData, isRefresh) : null;
    }
}

//收藏夹窗口
var favoritesWin = null;
/**
 * 打开收藏夹 favType为收藏类型
 */
var openFavoritesWin = function (favA, width, height, favType) {
    var left = screen.width - width - 5;
    var top = favA.offsetTop + favA.offsetHeight;
    if (!favoritesWin) {
        var x = new dhtmlXWindows();
        var winid = "favoritesWin";
        x.createWindow(winid, left, top, width, height);
        favoritesWin = x.window(winid);
        favoritesWin.stick();
        favoritesWin.setText("添加为收藏");
        favoritesWin.denyResize();
        favoritesWin.denyPark();
        favoritesWin.denyMove();
        favoritesWin.setPosition(left, top);
        //关闭一些不用的按钮。
        favoritesWin.button("minmax1").hide();
        favoritesWin.button("park").hide();
        favoritesWin.button("stick").hide();
        favoritesWin.button("sticked").hide();

        //创建表单
        var f = favoritesWin.attachForm([
            {
                type:"block",
                list:[
                    {
                        type:"settings",
                        inputWidth:200,
                        labelWidth:50,
                        position:"label-left",
                        labelAlign:"right"
                    },
                    {
                        type:"input",
                        label:"菜单:",
                        name:"objName",
                        value:"",
                        validate:"NotEmpty"
                    },
                    {
                        type:"input",
                        label:"分类目录:",
                        name:"favoriteTypeName",
                        value:"",
                        validate:"NotEmpty"
                    },
                    {type:"newcolumn"},
                    {
                        type:"button",
                        name:"btn",
                        offsetTop:30,
                        value:"保存"
                    },
                    {type:"hidden", name:"favoriteType", value:"0"},
                    {type:"hidden", name:"userId"},
                    {type:"hidden", name:"objType", value:"1"},
                    {type:"hidden", name:"objId"}
                ]
            }
        ]);
        //添加验证
        f.defaultValidateEvent();
        var favTr = createFavDirTree(f);

        //改变关闭事件
        favoritesWin.attachEvent("onClose", function () {
            favoritesWin.hide();
            return false;
        });
        favoritesWin.attachEvent("onShow", function () {
            var menu = getLastVisitMenu();
            f.setFormData({
                objId:menu.menuId,
                objName:menu.menuName,
                userId:user.userId
            });
            loadFavDirTree(favTr, favType);
        });

        //为按钮添加事件
        f.attachEvent("onButtonClick", function (id) {
            submitFavObj(f, favTr);
        });

        favoritesWin.hide();
    }
    if (favoritesWin.isHidden()) {
        favoritesWin.show();
    } else {
        favoritesWin.hide();
    }
};

/**
 * 创建目录树
 * @param favForm
 */
var createFavDirTree = function (favForm) {
    var div = dhx.html.create("div", {
        style:"display;none;position:absolute;border: 1px #eee solid;height: 200px;overflow: auto;padding: 0;margin: 0;" +
            "z-index:1000"
    });
    document.body.appendChild(div);
    div.style.display = "none";
    div.style.width = "200px";
    var target = favForm.getInput("favoriteTypeName");
    var tr = new Tree(div, {
        onClick:function (nodeId) {
            var favT = this.getUserData(nodeId, "typeFlag");
            if (favT == 0 || !this.hasChildren(nodeId)) {
                favForm.setFormData({
                    objType:this.getUserData(nodeId, "favoriteType"),
                    favoriteTypeName:this.getItemText(nodeId),
                    favoriteType:nodeId
                });
                //关闭树
                div.style.display = "none";
                favForm.validate();
            }
        },
        afterLoad:function (tr) {
            tr.openAllItems(0);//展开所有节点
            Tools.addEvent(target, "click", function () {
                div.style.width = target.offsetWidth + 'px';
                Tools.divPromptCtrl(div, target, true);
                div.style.display = "block";
            })
        }
    });
    tr.enableSingleRadioMode(true);
    return tr;
};

/**
 * 初始收藏目录树
 * @param favForm
 */
var loadFavDirTree = function (tr, type) {
    tr.clearAll();
    var favDirUrl = Tools.dwr({
        dwrMethod:FavoriteAction.queryFavoriteTypeAndDir,
        param:[user.userId, type],
        showProcess:false,
        converter:new dhtmxTreeDataConverter({
            idColumn:"favoriteId",
            pidColumn:"parentId",
            textColumn:"favoriteName"
        })
    });
    tr.loadData(favDirUrl);
};

/**
 * 收藏
 * @param f
 */
var submitFavObj = function (f, favTr) {
    if (f.validate()) {
        dhx.showProgress("", "保存数据中!");
        FavoriteAction.addFavoriteObj(f.getFormData(), function (data) {
            dhx.closeProgress();
            if (data.type == "error" || data.type == "invalid") {
                dhx.alert("保存出错，请重试！");
            } else if (data.sid == -1) {
                dhx.alert("必须选择一个子分类目录！");
            } else if (data.sid >= 1) {
                dhx.alert("已被收藏过，无法重复收藏！");
            } else {
                favTr.reLoad();
                favoritesWin.hide();
            }
        });
    }
};

/**
 * 弹出一个新的Tab页，如果存在则设置当前的tab为active
 * @param menuId
 * @param menuData
 */
var openTab = function (menuId, menuData, isRefresh) {
    if (!mainTabbar) {
        mainTabbar = new dhtmlXTabBar("main_tabbar", "top");
        //Tab设置
        mainTabbar.enableTabCloseButton(true);
        mainTabbar.enableAutoReSize(true);
        mainTabbar.enableScroll(true);
        //每个tab加一个iframe
        mainTabbar.attachEvent("onTabClose", function (id) {
            if (tabCount == 1) {
                return false;
            }
            var temp = mainTabbar.cells(id);
            if (temp.getElementsByTagName('iframe')) {
                var iframes = temp.getElementsByTagName('iframe');
                for (var i = 0; i < iframes.length; i++) {
                    try {
                        var win = iframes[i].contentWindow;
                        //如果子窗口中有卸载事件，执行
                        if (win.unloadOnClose) {
                            if (win.unloadOnClose() == false) {
                                return false;
                            }
                        }
                        //进行iframe销毁，内存回收
                        try {
                            iframes[i].contentWindow.document.write('');
                            iframes[i].contentWindow.document.close();
                            iframes[i].contentWindow.document.clear();
                        } catch (e) {
                        }
                        dhx.env.isIE && iframes[i].removeNode(true);
                    } catch (e) {
                    }

                }
            }
            menuTabs[id] = null;
            delete menuTabs[id];
            tabCount--;
            if (tabCloseEvent[id]) {
                tabCloseEvent[id].call(this);
                tabCloseEvent[id] = null;
            }
            return true;
        });
        mainTabbar.attachEvent("onTabClick", function (id, lastid) {
            if (id != lastid) {
                if (onTabActiveEvent[id]) {
                    onTabActiveEvent[id].apply(this, arguments);
                }
            }
        })
        var el = document.getElementById('main_tabbar').firstChild.firstChild;
        el.style.textAlign = "right";
        
        el.style.backgroundImage = "url(../../../meta/resource/dhtmlx/imgs/dhx_skyblue/bg_top.png)";
        document.getElementById('main_tabbar').firstChild.firstChild.firstChild.style.width = (getWinDimensions().winWidth - 210) + "px";
        document.getElementById('main_tabbar').firstChild.firstChild.firstChild.style.left = "0px";
        
        var div = document.createElement("div");
//        div.style.width = "160px";
        div.style.paddingTop = "5px";
        div.style.marginRight = "10px";
        div.style.styleFloat = "right";//ie
        div.style.cssFloat = "right";//firefox
        var _online = document.createElement("a");//在线用户
        _online.id = "_onlineCount";
        _online.style.marginRight = "10px";
        _online.href = "#";
//        _online.innerHTML="当前在线:"+1+"&nbsp;人";
        var sp = document.createElement("span");//你好
        sp.style.marginRight = "10px";
        sp.innerHTML = "您好," + user.userNamecn;
        var favA = document.createElement("a");//收藏
        favA.innerText = "收藏";
        favA.href = "#";
        Tools.addEvent(favA, "click", function () {
            openFavoritesWin(favA, 350, 110, 1);//打开收藏夹 默认分类为1-菜单
        });
        Tools.addEvent(_online, "click", function () {
//            openUserList();
//            openOnlineUserWin(850, 500);//打开在线用户窗口
            openMenu("在线用户统计", "meta/module/index/onlineUser.jsp", "top", "2222", true);
        });

        div.appendChild(_online);
        div.appendChild(sp);
        div.appendChild(favA);
        el.insertBefore(div, el.lastChild);

        refreshOnlineCount();//刷新人数
    }
    var url = urlDeal(menuData.menuUrl, menuData.userAttrList, menuId);
    /**
     * 新建一个frame节点。
     * @param menuIndex
     * @param menuData
     */
    var createFrame = function () {
        var iframe = document.createElement("iframe");
        iframe.name = 'tabFrame_' + menuId;
        iframe.id = 'tabFrame_' + menuId;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.frameBorder = 0;
        iframe.scrolling = "no";
        if (dhx.env.isIE) {
            window.attachEvent('onresize', function (event) {
                try {
                    iframe && iframe.contentWindow && iframe.contentWindow.resizeHandler && iframe.contentWindow.resizeHandler();
                } catch (e) {
                }
            });
        }
        iframe.src = url;
        return iframe;
    }

    if (tabCount <= maxTabCont) {
        var tabId = "menu_" + menuId;
        if (menuData.target == "top") {//顶层弹出Tab
            if (!menuTabs[tabId]) {
                // var cArr = menuData.menuName.replace(/[^\x00-\xff]/g, "**").length;
                //Tools.trim(menuData.menuName).match(/[^\x00-\xff]/ig);
//                var len = menuData.menuName.replace(/[^\x00-\xff]/g, "**").length;//Tools.trim(menuData.menuName).length + (cArr == null ? 0 : cArr.length);
                //6个字以内宽度为100，每增加一个字增加7px宽度
//                var width = len * 8.5 < 100 ? 100 : len * 8.6;
                mainTabbar.addTab(tabId, menuData.menuName, "*");
                tabCount++;
                //判断是否有子节点，有子节点需加载树。
                if (subMenuData[menuId].length > 0) {
                    var tabLayout = mainTabbar.cells(tabId).attachLayout("2U");
                    tabLayout.cells("a").setWidth(200);
                    tabLayout.cells("a").fixSize(true, true);
                    tabLayout.cells("a").setText(menuData.menuName);
                    //添加一棵树
                    var tree = tabLayout.cells("a").attachTree();
                    tree.enableIEImageFix(true);
                    tree.setImagePath(dhtmlx.image_path + "csh_" + dhtmlx.skin + "/");
                    var treeData = {id:0, item:subMenuData[menuId]};
                    tree.loadJSONObject(treeData);
                    //添加事件处理
                    tree.attachEvent("onClick", function (id) {
                        tree.openItem(id);
                        menuClick(id, tree.getUserData(id, "menuData"));
                    });
                    //添加内容iframe
                    tabLayout.cells("b").hideHeader();
                    tabLayout.cells("b").attachObject(createFrame());
                } else { //无子节点直接加载内容
                    mainTabbar.setContent(tabId, createFrame());
                }
                menuTabs[tabId] = true;
                mainTabbar.setTabActive(tabId);
            } else {
                mainTabbar.setTabActive(tabId);
                if (isRefresh) { //刷新iframe
                    refreshTab(menuId, url);
                }
            }
        } else {//当前iframe直接刷新数据
            refreshTab(null, url);
        }
    } else {
        alert("TAB已经超过当前最大数目限制，请先关闭！")
    }
    dhx.env.isIE && CollectGarbage();
}
/**
 * 刷新TAB页
 */
var refreshTab = function (menuId, url) {
    var tabId = menuId ? ("menu_" + menuId) : mainTabbar.getActiveTab();
    try {
        var iframe = document.getElementById("tabFrame" + tabId.replace(/menu/, ""));
        iframe.contentWindow.document.write('');
        iframe.contentWindow.document.close();
        iframe.contentWindow.document.clear();
        if (url) {
            iframe.contentWindow.location = url;
        } else {
            iframe.contentWindow.location.reload();
        }
    } catch (e) {
        if (url) {
            iframe.src = url;
        }
        return;
    }
    if (mainTabbar.getActiveTab() != tabId) {
        mainTabbar.setTabActive(tabId);
    }
}
/**
 * 根据TAB NAME 刷新标签页
 * @param tabName
 * @param url
 */
var refreshTabByName = function (tabName, url, isActive) {
    for (var key in mainTabbar._content) {
        if (mainTabbar.getLabel(key) == tabName) {
            isActive && (mainTabbar.setTabActive(key));
            try {
                if (url) {
                    document.getElementById("tabFrame" + key.replace(/menu/, "")).contentWindow.location = url;
                } else {
                    document.getElementById("tabFrame" + key.replace(/menu/, "")).contentWindow.location.reload();
                }
                return;
            } catch (e) {
                if (url) {
                    document.getElementById("tabFrame" + key.replace(/menu/, "")).src = url;
                }
                return;
            }
        }
    }
}

var tabCloseEvent = {};
/**
 * Tab关闭的事件
 * @param id
 * @param fun
 */
var onCloseTabEvent = function (menuId, fun) {
    tabCloseEvent["menu_" + menuId] = fun;
}
/**
 * 根据tab名称添加关闭事件
 * @param tabName
 * @param fun
 */
var onCloseTabEventByName = function (tabName, fun) {
    for (var key in mainTabbar._content) {
        if (mainTabbar.getLabel(key) == tabName) {
            tabCloseEvent[key] = fun;
        }
    }
}
var onTabActiveEvent = {};
var isRefresh = {};
/**
 * 根据menuId，添加触发Tab页的时候刷新页面
 * @param id
 * @param fun
 */
var addTabRefreshOnActive = function (menuId) {
    eval("onTabActiveEvent['menu_" + menuId + "'] = function(){document.getElementById('tabFrame_" + menuId + "').contentWindow.location.reload();}");
    eval("tabCloseEvent['menu_" + menuId + "']=function(){ delete onTabActiveEvent['menu_" + menuId + "'];delete tabCloseEvent['menu_" + menuId + "'];}");
}
/**
 * 根据TAB NAME添加触发tab页的时候刷新页面
 * @param name
 * @param fun
 */
var addTabRefreshOnActiveByName = function (name) {
    for (var key in mainTabbar._content) {
        var value = "";
        try {
            value = mainTabbar.getLabel(key)
        } catch (e) {
        }
        if (value == name) {
            isRefresh[key] = true;
            onTabActiveEvent[key] = function (id) {
                if (isRefresh[key]) {
                    document.getElementById("tabFrame" + id.replace(/menu/, "")).contentWindow.location.reload();
                    isRefresh[key] = false;
                }
            };
            break;
        }
    }
}
/**
 *
 * @param tabTd
 */
var closeTab = function (menuId, activeId) {
    var tabId = "menu_" + encodeURI(encodeURI(menuId));
    if (menuTabs[tabId]) {
        if (activeId) {
            mainTabbar.setTabActive(activeId);
        } else {
            mainTabbar.goToPrevTab();
        }
        if (mainTabbar.callEvent("onTabClose", [tabId])) {
            mainTabbar.removeTab(tabId);
            menuTabs[tabId] = null;
            delete menuTabs[tabId];
        }
    }
}


/**
 * 根据名称获取TabId
 * @param name
 */
var getTabIdByName = function (name) {
    for (var key in mainTabbar._content) {
        var value = "";
        try {
            value = mainTabbar.getLabel(key);
        } catch (e) {
        }
        if (value == name) {
            return key;
        }
    }
}
/**
 * 刷新当前的在线人数。
 * @param count
 */
var refreshOnlineCount = function () {
    UserAction.getOnlineNums(parent.getSystemId(), function (count) {
        setOnlineCount(count);
    });
};
var setOnlineCount = function (count) {
    if (count > 0) {
        if ($("_onlineCount")) {
            $("_onlineCount").innerHTML = "当前在线:" + count + "&nbsp;人";
        }
    } else if (count == -1) {
        alert("您的账户在另一地点登录，您将被迫下线！若非您本人操作，请及时修改密码！");
        window.top.location.href = base;
    } else {
        alert("您的账户掉线了，请重新登录！");
        window.top.location.href = base;
    }
};

var onlineUserWin = null;
/**
 * 打开在线用户窗口
 */
var openOnlineUserWin = function (width, height) {
    var left = (screen.width - width) / 2;
    var top = (screen.height - height) / 2;
    if (!onlineUserWin) {
        var x = new dhtmlXWindows();
        var winid = "onlineUserWin";
        x.createWindow(winid, left, top, width, height);
        onlineUserWin = x.window(winid);
        onlineUserWin.stick();
        onlineUserWin.setText("在线用户");
        onlineUserWin.denyResize();
        onlineUserWin.denyPark();
        onlineUserWin.keepInViewport(true);
//        onlineUserWin.setPosition(left, top);
        //关闭一些不用的按钮。
        onlineUserWin.button("minmax1").hide();
        onlineUserWin.button("park").hide();
        onlineUserWin.button("stick").hide();
        onlineUserWin.button("sticked").hide();

        //在线用户列表
        var userConverter = new dhtmxGridDataConverter({
            idColumnName:"userId",
            filterColumns:["userNamecn", "userMobile", "userEmail", "zoneName", "deptName", "stationName", "loginTime", "lastVisitedMenu"],
//            cellDataFormat:function(rowIndex,columnIndex,columnName,cellValue,rowData){
//                if(columnName=="lastVisitedMenu"){
//                    return cellValue["menuName"];
//                }
//                return this._super.cellDataFormat(rowIndex,columnIndex,columnName,cellValue,rowData);
//            },
            isFormatColumn:false
        });
        var onlineGrid = new Grid(onlineUserWin.attachGrid(), {
            headNames:"姓名,手机,邮箱,地域,部门,岗位,登入时间,最后访问菜单",
            widthsP:"13,11,14,11,11,11,15,14",
            pageSize:0
        });
        onlineGrid.genApi.setColumnCfg(6, {type:"ro", sort:"str", tip:true});
        onlineGrid.genApi.setCellType(7, "ro");
        onlineGrid.genApi.setColTip(7, true);
        var actionurl = Tools.dwr({
            dwrMethod:UserAction.getOnlineUsers,
            param:parent.getSystemId(),
            converter:userConverter
        });
        onlineGrid.init();

        //改变关闭事件
        onlineUserWin.attachEvent("onClose", function () {
            onlineUserWin.hide();
            return false;
        });
        onlineUserWin.attachEvent("onShow", function () {
            onlineUserWin.center();
            onlineGrid.reLoad(actionurl);
        });
        onlineUserWin.hide();
    }
    if (onlineUserWin.isHidden()) {
        onlineUserWin.show();
    } else {
        onlineUserWin.hide();
    }
};

/**
 * 根据菜单配置打开一个新窗口
 * @param menuId
 * @param menuData
 */
var openWindow = function (menuId, menuData) {
    var winName = "newWindow" + menuId;
    var winUrl = urlDeal(menuData.menuUrl, menuData.userAttrList, menuId);
    var config = "toolbar=yes,resizable=yes,top=0,left=0";
    var browserState = parseInt(menuData.navState);
    if ((1 & browserState) == 1) {//可以最大化
        config += ",fullScreen=yes";
    } else {
        config += ",fullScreen=no,height=300,width=600";//设置默认高宽度
    }
    if ((2 & browserState) == 2) {//可以有滚动
        config += ",scrollbars=yes";
    } else {
        config += ",scrollbars=no";
    }
    if ((4 & browserState) == 4) {//可以有菜单栏
        config += ",menubar=yes";
    } else {
        config += ",menubar=no";
    }
    if ((8 & browserState) == 8) {//可以有状态栏
        config += ",status=yes";
    } else {
        config += ",status=no";
    }
    if ((16 & browserState) == 16) {//可以有链接栏
        config += ",location=yes";
    } else {
        config += ",location=no";
    }
    try {
        dhx.env.isIE && (winName = "newWindow"+parseInt(Math.random()*1000));
        var child = window.open(winUrl, winName, config);
        //child.document.location.href = winUrl;
        dhx.env.isIE && CollectGarbage();
    } catch (e) {
    }

}
var urlDeal = function (winUrl, userAttrList, menuId) {
    winUrl = Tools.trim(winUrl);
    if (winUrl) {
        //为其添加扩展参数menuId
        if (menuId && winUrl.toLowerCase().indexOf("http://") == -1) {
            winUrl = Tools.trim(winUrl) + (winUrl.indexOf("?") == -1 ? "?" : "&") + "menuId=" + menuId;
        }
        if (userAttrList) {
            winUrl = Tools.trim(winUrl) + (winUrl.indexOf("?") == -1 ? "?" : "&") + userAttrList;
        }
        return window.parent.urlDeal(urlEncode(winUrl));
    }
    dhx.env.isIE && CollectGarbage();
};
/**
 * 全局初始化方法，调用时机在于弹出子窗口或者子ifame加载时候调用，用于为其做些初始化动作。
 * @param frameWin 子窗体或者子frame window对象
 * @param menuId
 */
var globalInit = function (frameWin, menuId) {
    //子窗体加载成功后为子窗体设置一个获取菜单按钮权限列表的函数getRoleButtons
    frameWin.getRoleButtons = function (id) {
        if (this.opener && this.opener.getRoleButtons) {
            return this.opener.getRoleButtons(id ? id : menuId);
        } else if (this.parent && this.parent.getRoleButtons) {
            return this.parent.getRoleButtons(id ? id : menuId)
        }
    };
    //子窗体加载成功后设置一个访问菜单的函数 openMenu.
    /**
     * 打开一个菜单，前三个为必须。
     * @param menuName 菜单名称
     * @param menuUrl 菜单Url
     * @param target 菜单目标窗口，目前支持right,top,target三种
     * @param menuId 非必选，如果有菜单ID，则会认为此菜单在数据库中已存在，需要记录菜单访问日志
     */
    frameWin.openMenu = function (menuName, menuUrl, target, menuId, isRefresh) {
        //打开菜单操作。
        if (this.opener && this.opener.openMenu) {
            return this.opener.openMenu(menuName, menuUrl, target, menuId, isRefresh);
        } else if (this.parent && this.parent.openMenu) {
            return this.parent.openMenu(menuName, menuUrl, target, menuId, isRefresh);
        }else{
        	return openMenu(menuName, menuUrl, target, menuId, isRefresh);
        }
    };
    /**
     * 获取session信息
     * @param attr
     * @param realTime:是否实时查询。
     */
    frameWin.getSessionAttribute = function (attr, realTime) {
        return window.parent.getSessionAttribute(attr, realTime);
    };
    dhx.env.isIE && CollectGarbage();
}
/**
 * 获取最后一个访问的菜单信息
 */
var getLastVisitMenu = function () {
    return menuHistory.length > 0 ? allMenuData[menuHistory[menuHistory.length - 1]] : null;
}
/**
 * 打开一个菜单
 * @param menuName
 * @param menuUrl
 * @param target
 * @param menuId
 * @param isRefresh 如果菜单已经打开，是否进行刷新。
 */
var openMenu = function (menuName, menuUrl, target, menuId, isRefresh) {
    if (!menuName || !menuUrl || !target) {
        alert("缺少打开菜单的必选参数，不能打开一个菜单!");
        return;
    }
    var menuData = {};
    //打开一个虚拟的菜单。
    menuName && (menuData.menuName = menuName);
    menuUrl && (menuData.menuUrl = menuUrl);
    target && (menuData.target = target);
    menuId && (menuData.menuId = menuId);
    //打开菜单操作。
    return menuClick(menuId, menuData || allMenuData[menuId], isRefresh);
}
/**
 *  过滤隐藏菜单,并缓存菜单数据
 */
var filterHiddenMenu = function (data) {
    var columnConverter = new columnNameConverter();
    //首先过滤隐藏菜单。
    var replaceData = [];
    if (data) {
        for (var i = 0; i < data.length; i++) {
            var id = data[i].MENU_ID;
            allMenuData[id] = columnConverter.convert(data[i]);
            if (allMenuData[id].isShow != 0) {
                replaceData.push(allMenuData[id]);
            }
        }
        columnConverter = null;
    }
    dhx.env.isIE && CollectGarbage();
    return replaceData;
}

/**
 * 根据MenuID获取指定的权限。
 * @param menuId
 */
var getRoleButtons = function (menuId) {
    //获取当前的菜单信息
    var menuData = allMenuData[menuId];
    if (!menuData) {
        return Tools.EmptyList;
    }
    var pageButton = menuData.pageButton;
    if (!pageButton) {
        return Tools.EmptyList;
    }
    //替换中文。
    pageButton = pageButton.replace(/:[\w\u4e00-\u9fa5]+/g, "");
    if (!pageButton) {
        return Tools.EmptyList;
    }
    return pageButton.split(",");
    /*    //排除的按钮
     var excludeButtonUser = menuData.excludeButtonUser ? menuData.excludeButtonUser : "";
     var excludeButtonRole = menuData.excludeButtonRole ? menuData.excludeButtonRole : "";
     if (!excludeButtonUser && !excludeButtonRole) {
     //都未设置排除按钮，返回该菜单所有的按钮
     return pageButton.split(",");
     }
     pageButton += ",";//加一个，号便于做正则表达式替换。
     //先将其竖线去掉
     excludeButtonUser = excludeButtonUser.replace(new RegExp("\|", "g"), "");
     excludeButtonRole = excludeButtonRole.replace(new RegExp("\|", "g"), "");
     //再次替换逗号为竖线
     excludeButtonUser = excludeButtonUser.replace(new RegExp(",", "g"), "|");
     excludeButtonRole = excludeButtonRole.replace(new RegExp(",", "g"), "|");
     if (excludeButtonUser) {
     pageButton = pageButton.replace(new RegExp("(" + excludeButtonUser + "),", "g"), "");
     }
     if (excludeButtonRole) {
     pageButton = pageButton.replace(new RegExp("(" + excludeButtonRole + "),", "g"), "");
     }
     if (pageButton) {//还有按钮权限
     return pageButton.substr(0, pageButton.length - 1).split(",");
     } else {
     return Tools.EmptyList;
     }*/
}

var userConvertConfig = {
    idColumnName:"userId",
    filterColumns:["userNamecn", "userNameen",
        "userMobile", "userEmail", "zoneName", "deptName", "stationName", "headShip", "currmenuName"]
}

/**
 * 打开当前登陆用户详细信息
 */
var openUserList = function () {
    //初始化并创建弹出层窗口
    var dhxWindow = new dhtmlXWindows();	//实例dhtml窗口组建
    var loadUserParam = new biDwrMethodParam();
    dhxWindow.createWindow("userListWindow", 0, 0, 600, 400);	//组件ID，宽度、高度
    var userListWindow = dhxWindow.window("userListWindow");	//初始化窗口参数
    userListWindow.setModal(true);
    userListWindow.setDimension(600, 400);
    userListWindow.center();
    userListWindow.denyResize();
    userListWindow.denyPark();
    userListWindow.setText('当前登陆用户信息');
    userListWindow.keepInViewport(true);
    //隐藏最小化和放大缩小按钮
    userListWindow.button("minmax1").hide();
    userListWindow.button("park").hide();
    userListWindow.button("stick").hide();
    userListWindow.button("sticked").hide();
    userListWindow.show();

    /**
     * JS内部类 用于数据转换
     */
    var userDataConverter = new dhtmxGridDataConverter(userConvertConfig);


//注册后台java的action
    dwrCaller.addAutoAction("loadUserListAction", "UserAction.getAllUserList", loadUserParam, function (data) {
//	    alert(data);
    });

    dwrCaller.addDataConverter("loadUserListAction", userDataConverter);//添加转化数据


    //创建窗口内的布局
    var refUserLayout = new dhtmlXLayoutObject(userListWindow, "2E");	//创建布局，分成2部分
    refUserLayout.cells("a").hideHeader(true);	//隐藏布局头
    refUserLayout.cells("b").hideHeader(true);
    refUserLayout.cells("a").setHeight(30);	//设置布局A的高度
    refUserLayout.cells("a").fixSize(false, true); //特定布局各自的宽度和高度
    refUserLayout.hideSpliter();//移除分界边框。
    refUserLayout.hideConcentrate();

    //弹出窗口布局上部分添加查询表单
    var queryform = refUserLayout.cells("a").attachForm([
        {type:"setting", position:"label-left", labelWidth:120, inputWidth:120},
        {type:"input", label:"姓名：", name:"userNamecn"},
        {type:"newcolumn"},
        {type:"button", name:"query", value:"查询"}
    ]);

    loadUserParam.setParamConfig([
        {
            index:0, type:"fun", value:function () {
            return queryform.getFormData();
        }
        }
    ]);

    //弹出窗口下部分添加表格，设置表格参数
    var userGirid = refUserLayout.cells("b").attachGrid();
    userGirid.setHeader("姓名,拼音,手机,邮箱,地域,部门,岗位,职务,最后打开菜单");	//表头
    userGirid.setInitWidthsP("10,10,10,16,10,10,10,10,15");	//列宽度
    userGirid.setColAlign("left,center,center,center,center,center,center,center,center");	//列的对其方式
    userGirid.setHeaderAlign("left,center,center,center,center,center,center,center,center");	//头的对其方式
    userGirid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro");	//修改方式：RO只读
    userGirid.setColSorting("na,na,na,na,na,na,na,na,na");	//排序类型
    userGirid.enableMultiselect(true);		//设置表格单选或者多选
    userGirid
        .setColumnIds("userNamecn,userNameen,userMobile,userEmail,zoneName,deptName,stationName,headShip,currmenuName");	//列的ID
    userGirid.enableCtrlC();
    userGirid.init();
    userGirid.defaultPaging(10);
    userGirid.load(dwrCaller.loadUserListAction, "json");	//注册action
    //查询表单事件处理
    queryform.attachEvent("onButtonClick", function (id) {
        if (id == "query") {
            //进行数据查询。
            userGirid.clearAll();
            userGirid.load(dwrCaller.loadUserListAction, "json");
        }
    });
    dhx.env.isIE && CollectGarbage();
};

/**
 * 获得浏览器窗口尺寸
 * @return
 */
function getWinDimensions() {
	var winWidth = 0;
	var winHeight = 0;

	//获取窗口宽度
	if (window.innerWidth){
		winWidth = window.innerWidth;
	}else if ((document.body) && (document.body.clientWidth)){
		winWidth = document.body.clientWidth;
	}
	//获取窗口高度
	if (window.innerHeight){
		winHeight = window.innerHeight;
	}else if ((document.body) && (document.body.clientHeight)){
		winHeight = document.body.clientHeight;
	}
	//通过深入Document内部对body进行检测，获取窗口大小
	if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth){
		winHeight = document.documentElement.clientHeight;
		winWidth = document.documentElement.clientWidth;
	}
	
	var obj = new Object();
	obj.winWidth = winWidth;
	obj.winHeight = winHeight;
	return obj;
}