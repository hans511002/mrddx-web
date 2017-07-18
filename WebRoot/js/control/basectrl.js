/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        metaui.js
 *Description：组件封装
 *
 *Dependent：
 *
 *Author:
 *        王春生
 ********************************************************/
var meta = meta || {};
meta.ui = meta.ui || {};
meta.ui.cmpNum = 0;
meta.ui.getUID = function(){
    meta.ui.cmpNum ++;
    return "MUI"+meta.ui.cmpNum;
};


//js类继承
function extendClass(subClass,superClass){
    var F = function(){};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
    subClass.superclass = superClass.prototype; //加多了个属性指向父类本身以便调用父类函数
    if(superClass.prototype.constructor == Object.prototype.constructor){
        superClass.prototype.constructor = superClass;
    }
}

/**
 * 申明一个下拉树
 * @class meta.ui.selectTree
 * @param bindObj 为下拉框绑定元素可以是数组ID，可以是单个元素ID，被绑定对象可是DIV,SPAN 则会自动创建一个input框，也可直接是input框
 * @param width 宽度
 * @param height 高度
 */
meta.ui.selectTree = function (bindObj, width, height) {
    this.width = parseInt(width) ? parseInt(width) : 150;
    this.height = parseInt(height) ? parseInt(height) : 200;
    this.id = "MetaSelectTree_" + dhx.uid();
    this.binds = {};
    this._autoWidth = true;
    this._dynLoadFlag = false;// 控制动态加载
    this._muiltseleted = false;// 控制多选
    this._dynload = 0;
    this._priFix = "tree_";
//    this.itemFilterIdx = null;
    this.itemCheckFun = null;// 过滤禁用函数（多选时可用)

    if (typeof (bindObj) == "string") {
        var a = document.getElementById(bindObj);
        if (a)
            this.binds[bindObj] = a;
    }
    if (typeof (bindObj) == "object" && bindObj.sort) {
        for (var i = 0; i < bindObj.length; i++) {
            var obj = bindObj[i];
            if (!obj)
                continue;
            if (typeof (obj) == "string") {
                var b = document.getElementById(obj);
                if (b)
                    this.binds[obj] = b;
            } else {
                if (!obj.tagName)
                    continue;
                if (!obj.id)
                    obj.id = "SelTree_" + dhx.uid();
                this.binds[obj.id] = obj;
            }
        }
    } else if (typeof (bindObj) == "object" && bindObj.tagName) {
        this.binds[bindObj.id] = bindObj;
    }
    this.render(); // 初始box或树
    for (var k in this.binds) {
        this.bind(k, true);
    }

};

/**
 * 设置弹出层宽度与高度
 *
 * @memberOf {meta.ui.selectTree}
 * @param width
 * @param height
 */
meta.ui.selectTree.prototype.setListSize = function (width, height) {
    this.width = parseInt(width) ? parseInt(width) : 150;
    this.height = parseInt(height) ? parseInt(height) : 200;
    this.box.style.width = this.width + "px";
    this.box.style.height = this.height + "px";
};

/**
 * 设置下拉树面板的宽度为自动匹配其input框的宽度 ，装载input的容器自适应input框框
 *
 * @memberOf {meta.ui.selectTree}
 * @param mode
 */
meta.ui.selectTree.prototype.enableAutoSize = function (mode) {
    this._autoWidth = !!mode;
};
/**
 * 设置树节点为动态加载
 *
 * @memberOf {meta.ui.selectTree}
 * @param mode
 */
meta.ui.selectTree.prototype.setDynload = function (mode, loadFun) {
    this._dynLoadFlag = !!mode;
    this._dynload = loadFun;
    if (this._dynLoadFlag && this._dynload && typeof (this._dynload) == "function") {
        this.tree.setXMLAutoLoadingBehaviour("function");
        this.tree.setXMLAutoLoading(this._dynload);
    } else {
        this.tree.setXMLAutoLoadingBehaviour(null);
        this.tree.setXMLAutoLoading(0);
    }
};
/**
 * 控制多选 数据加载前置函数(只对加载后的数据有效)
 *
 * @memberOf {meta.ui.selectTree}
 * @param mode
 * @param fun
 *            添加数据时回调，返回true才生成checkbox框
 */
meta.ui.selectTree.prototype.enableMuiltselect = function (mode, fun) {
    this._muiltseleted = !!mode;
    this.tree.enableCheckBoxes(this._muiltseleted);
    if (this._muiltseleted && fun && typeof (fun) == "function") {
        this.checkBoxCall = fun;
    }
};
/**
 * 内置方法，绘制生成dhtmlxTree对象
 *
 * @memberOf {meta.ui.selectTree}
 */
meta.ui.selectTree.prototype.render = function () {
    if (!this.box) {
        this.box = dhx.html.create("div", {
            style:"position:absolute;padding:0;margin:0;"
                + "overflow:auto;border:1px #8f99a2 solid;background-color:white;z-index:1000"
        });
        this.box.id = this.id;
        this.box.style.width = this.width + "px";
        this.box.style.height = this.height + "px";
        this.box.style.display = "none";
        this.box.style.overflow = "auto";
        document.body.appendChild(this.box);
    }
    if (!this.tree) {
        this.tree = DHTMLXFactory.createTree(this.id, this.id, "100%", "100%", 0);
        this.tree.selTree = this;
        this.enableMuiltselect(this._muiltseleted);
        this.setCheckboxFlag(this._checkboxFlag);
        this.setDynload(this._dynLoadFlag, this._dynload);
        if (window["getDefaultImagePath"] && window["getSkin"]) {
            this.tree.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
        }
    }
};
/**
 * 设置自动根据文本框值选择项
 * @memberOf {meta.ui.selectTree}
 * @param mode
 */
meta.ui.selectTree.prototype.setAutoSelectByValue=function(mode){
    this.autoSelect = !!mode;
    if(this.autoSelCall){
        this.tree.detachEvent(this.autoSelCall);
        this.autoSelCall = null;
    }
    if(this.autoSelect){
        if(!this._muiltseleted){
            this.autoSelCall = this.tree.attachEvent("onClick",function(itemId){
                this.selTree.bindInput.value = this.getItemText(itemId);
                this.selTree.bindInput.setAttribute("code",itemId);
                this.selTree.bindInput.setAttribute("selValue",itemId);
                this.selTree.box.style.display = "none";
            });
        }
    }
};

/**
 * 设置某绑定文本框的宽度
 *
 * @memberOf {meta.ui.selectTree}
 * @param bindId
 * @param width
 */
meta.ui.selectTree.prototype.setBindObjWidth = function (bindId, width) {
    var el = this.binds[bindId];
    if (el && width && parseInt(width)) {
        el.style.width = parseInt(width) + "px";
        if (el.input)
            el.input.style.width = parseInt(width) + "px";
    }
};
/**
 * 设置某绑定文本框的高度度
 *
 * @memberOf {meta.ui.selectTree}
 * @param bindId
 * @param width
 */
meta.ui.selectTree.prototype.setBindObjHeight = function (bindId, width) {
    var el = this.binds[bindId];
    if (el && width && parseInt(width)) {
        el.style.height = parseInt(width) + "px";
        if (el.input)
            el.input.style.height = parseInt(width) + "px";
    }
};
/**
 * 文本框单击事件 (私有方法)
 *
 * @memberOf {meta.ui.selectTree}
 * @param e
 */
meta.ui.selectTree.prototype._onclick = function (e) {
    e = e || window.event;
    var el = e.srcElement;
    if (!el.selectTree)
        return;
    el.selectTree.bindInput = el;
    if (el.selectTree._autoWidth) { // 设置了自动宽度
        el.selectTree.box.style.width = el.offsetWidth - 2 + "px";
    }
    if (el.selectTree.showBeforeCall) {
        var flag = el.selectTree.showBeforeCall(el.selectTree);
        if (!flag)
            return;
    }
    if (el.selectTree.box.style.display == "block")
        return;
    autoPosition(el.selectTree.box, el, true);
    if(el.selectTree.autoSelect){
        if(!el.selectTree._muiltseleted){
            if(el.selectTree.bindInput.getAttribute("selValue")){
                el.selectTree.tree.selectItem(el.selectTree.bindInput.getAttribute("selValue"),false);
            }else
                el.selectTree.tree.clearSelection();
        }
    }
    el.selectTree.tree.focusItem(el.selectTree.tree.getSelectedItemId());
    if (el.selectTree.showAfterCall) {
        el.selectTree.showAfterCall(el.selectTree);
    }
};

/**
 * 删除绑定的一个元素
 *
 * @memberOf {meta.ui.selectTree}
 * @param id
 */
meta.ui.selectTree.prototype.removeBindObj = function (id) {
    var el = this.binds[id];
    if (el) {
        if (el.input) {
            detachObjEvent(el.input, "onclick", this._onclick);
            el.input.onkeyup = null;
            el.input.selectTree = null;
            el.removeChild(el.input);
        } else {
            detachObjEvent(el, "onclick", this._onclick);
            el.onkeyup = null;
            el.selectTree = null;
        }
    }
    this.binds[id] = null;
    delete this.binds[id];
};
/**
 * 绑定一个元素
 *
 * @memberOf {meta.ui.selectTree}
 * @param bindObjId
 * @param type
 *            如果为真，表示绑定时会忽略已存在，相关事件注册会重复一次
 */
meta.ui.selectTree.prototype.bind = function (bindObjId, type) {
    var el = document.getElementById(bindObjId);
    if (!el)
        return;
    if (!type && this.binds[bindObjId])
        return;
    this.render();

    this.binds[bindObjId] = el;
    if (el.tagName == "INPUT") {
        el.selectTree = this;
        attachObjEvent(el, "onclick", this._onclick);
    } else {
        var el_ = document.getElementById(bindObjId + "_input");
        if (!el_)
            el_ = document.createElement("INPUT");
        el_.selectTree = this;
        el_.type = "text";
        el_.id = bindObjId + "_input";
        el_.style.width = this.width + "px";
        el_.style.margin = 0 + "px";
        this.binds[bindObjId].appendChild(el_);
        this.binds[bindObjId].input = el_;
        attachObjEvent(el_, "onclick", this._onclick);
    }
    this.enableSearch(this._searchMode);
};
/**
 * 弹出层展示前执行
 *
 * @memberOf {meta.ui.selectTree}
 * @param fun
 */
meta.ui.selectTree.prototype.setShowBeforeCall = function (fun) {
    if (fun && typeof (fun) == "function")
        this.showBeforeCall = fun;
};
/**
 * 弹出层展示后执行
 *
 * @memberOf {meta.ui.selectTree}
 * @param fun
 */
meta.ui.selectTree.prototype.setShowAfterCall = function (fun) {
    if (fun && typeof (fun) == "function")
        this.showAfterCall = fun;
};
/**
 * 弹出层隐藏前执行
 *
 * @memberOf {meta.ui.selectTree}
 * @param fun
 */
meta.ui.selectTree.prototype.setHideBeforeCall = function (fun) {
    if (fun && typeof (fun) == "function")
        this.hideBeforeCall = fun;
};
/**
 * 弹出层隐藏后执行
 *
 * @memberOf {meta.ui.selectTree}
 * @param fun
 */
meta.ui.selectTree.prototype.setHideAfterCall = function (fun) {
    if (fun && typeof (fun) == "function")
        this.hideAfterCall = fun;
};
/**
 * 设置一个项是否动态加载，与节点挂钩，树被rander后，如果需要此功能也需要重新设置 (加载数据后设置)
 *
 * @memberOf {meta.ui.selectTree}
 * @param itemId
 * @param mode
 */
meta.ui.selectTree.prototype.enableItemDynLoad = function (itemId, mode) {
    var parentObject = this.tree._globalIdStorageFind(itemId);
    if (!parentObject)
        return;
    parentObject.XMLload = !mode;
};
/**
 * 设置 异步加载数据时，开启子节点标识(记载数据前设置)
 *
 * @memberOf {meta.ui.selectTree}
 * @param mode
 */
meta.ui.selectTree.prototype.enableChildField = function (mode) {
    this._childCnt = !!mode;
};
/**
 * 设置checkbox传递模式分四种： 1，向下传递（子永远跟着父变） 2，向上传递（勾选子时，依赖的父也勾选，取消子勾选父不变） 3，双向传递（子永远跟着父变；勾选子时，依赖的父也勾选，取消子勾选父不变）
 * 4，父永远控制子的选中，但是子未勾全时，父为半勾选状态
 *
 * @memberOf {meta.ui.selectTree}
 * @param mode
 */
meta.ui.selectTree.prototype.setCheckboxFlag = function (mode) {
    if (this._checkeventid) {
        this.tree.detachEvent(this._checkeventid);
        this._checkeventid = null;
    }
    this._checkboxFlag = mode;
    if (this._checkboxFlag == 1) {
        this._checkeventid = this.tree.attachEvent("onCheck", function (id, state) {
            var sNode = this._globalIdStorageFind(id, 0, 1);
            this._setSubChecked(state, sNode);
        });
    } else if (this._checkboxFlag == 2) {
        this._checkeventid = this.tree.attachEvent("onCheck", function (id, state) {
            if (state == 1) {
                var pid = this.getParentId(id);
                for (; ; pid = this.getParentId(pid)) {
                    if (pid == this.rootId)
                        break;
                    this.setCheck(pid, 1);
                }
            }
            if (state == 0) {
                var sNode = this._globalIdStorageFind(id, 0, 1);
                this._setSubChecked(0, sNode);
            }
        });
    } else if (this._checkboxFlag == 3) {
        this._checkeventid = this.tree.attachEvent("onCheck", function (id, state) {
            var sNode = this._globalIdStorageFind(id, 0, 1);
            this._setSubChecked(state, sNode);
            if (state == 1) {
                var pid = this.getParentId(id);
                for (; ; pid = this.getParentId(pid)) {
                    if (pid == this.rootId)
                        break;
                    this.setCheck(pid, 1);
                }
            }
        });
    } else {
        if (this._checkeventid) {
            this.tree.detachEvent(this._checkeventid);
            this._checkeventid = null;
        }
    }
    if (this._checkboxFlag == 4)
        this.tree.enableThreeStateCheckboxes(true);
    else
        this.tree.enableThreeStateCheckboxes(false);
};

/**
 * 设置过滤，根据某列值过滤禁用数据
 *
 * @param idx
 *            数据索引（-1时，直接取末列)
 */
meta.ui.selectTree.prototype.setItemFilterFun = function (fun) {
    this.itemCheckFun = fun;
};

/**
 * 追加数据，data必须是二维数组，内部数组元素前三个元素必须是id，text，pid（顺序不能乱）,如果绑定成功返回true
 *
 * @memberOf {meta.ui.selectTree}
 * @param data
 */
meta.ui.selectTree.prototype.appendData = function (data, fun, termC) {
    if (!data || !data.sort)
        return false;
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (d == null || d == undefined)
            continue;
        if (fun && typeof (fun) == "function")
            d = fun(d, 'tree', termC);
        if (d == null || d == undefined)
            continue;
        if (!d.sort)
            continue;
        if (d.length < 3)
            continue;
        if (this.checkBoxCall) {
            this.tree.enableCheckBoxes(this.checkBoxCall(d));
        }
        var flag = (this._dynLoadFlag && this._childCnt) ? d[3] : (this._dynLoadFlag ? 1 : 0);
        if (this._dynLoadFlag && !flag && this.itemCheckFun) {//动态加载，并且是子节点
            if (!this.itemCheckFun(d, this)) //无权限
                continue;
        }
        var pid = (d[2] == null || d[2] == "" || d[2] == "null") ? this.tree.rootId : this._priFix + d[2];
        var text = (d[1] == null || d[1] == "null") ? "" : d[1];
        if (pid != this.tree.rootId)
            pid = this.tree.getIndexById(pid) != null ? pid : this.tree.rootId;
        var ud = this.tree.insertNewChild(pid, this._priFix + d[0], text, null, 0, 0, 0, 0, flag);
        for (var j = 2; j < d.length; j++) {
            if (flag && this._childCnt && j == 3) {
                continue;
            }
            this.tree.setUserData(this._priFix + d[0], "USER_DATA_" + j, d[j]);
        }
        if (this._dynLoadFlag && this._childCnt && !d[3])
            this.tree.setUserData(this._priFix + d[0], "refresh", true);

        if (this._muiltseleted && this.itemCheckFun) {
            if (!this.itemCheckFun(d, this)) {
                this.tree.disableCheckbox(this._priFix + d[0], 1);
            }
        }
    }
    return true;
};
/**
 * 清空数据
 *
 * @memberOf {meta.ui.selectTree}
 */
meta.ui.selectTree.prototype.clearData = function () {
    this.tree.deleteChildItems(this.tree.rootId);
};
/**
 * 销毁回收方法
 *
 * @memberOf {meta.ui.selectTree}
 */
meta.ui.selectTree.prototype.destructor = function () {
    Destroy.clearObj(this.tree);
    document.body.removeChild(this.box);
    this.box = null;
    for (var key in this.binds) {
        if (this.binds[key].input) {
            this.binds[key].input.parentNode.removeChild(this.binds[key].input);
        } else {
            this.binds[key].input = null;
            this.binds[key].selectTree = null;
            detachObjEvent(this.binds[key], "onclick", this._onclick);
            this.binds[key].onmouseover = null;
            this.binds[key].onmouseout = null;
        }
        delete this.binds[key];
    }
};
/**
 * 获取树上某项的值，返回一个数组，数据前三列为（id，text，pid）后续的为绑定了多少数据，就返回多少数据
 *
 * @memberOf {meta.ui.selectTree}
 * @param itemid
 */
meta.ui.selectTree.prototype.getItemValue = function (itemid) {
    if (!itemid)
        itemid = this.tree.getSelectedItemId();
    if (this.tree.getIndexById(itemid) == null)
        return null;
    var data = [];
    data[0] = itemid.replace(this._priFix, "");
    data[1] = this.tree.getItemText(itemid);
    var flag = this._dynLoadFlag && this._childCnt;
    for (var i = 2; ; i++) {
        if (flag && i == 3)
            continue;
        var d = this.tree.getUserData(itemid, "USER_DATA_" + i);
        if (d == null)
            break;
        data[data.length] = d;
    }
    return data
};
/**
 * 获取多选值（返回二维数组）
 *
 * @memberOf {meta.ui.selectTree}
 */
meta.ui.selectTree.prototype.getCheckedValue = function () {
    var ids = this.tree.getAllChecked();
    if (ids && ids != "") {
        ids = ids.split(",");
        var list = [];
        var flag = this._dynLoadFlag && this._childCnt;
        for (var ii = 0; ii < ids.length; ii++) {
            var data = new Array();
            data[0] = ids[ii].replace(this._priFix, "");
            data[1] = this.tree.getItemText(ids[ii]);
            for (var i = 2; ; i++) {
                if (flag && i == 3)
                    continue;
                var d = this.tree.getUserData(ids[ii], "USER_DATA_" + i);
                if (d == null)
                    break;
                data[data.length] = d;
            }
            list[list.length] = data;
        }
        return list;
    }
    return null;
};
/**
 * 隐藏树
 */
meta.ui.selectTree.prototype.hideBox = function (flag) {
    if (this.box) {
        this.box.style.display = (flag == null || flag == undefined || flag) ? "none" : "block";
    }
};
/**
 * 为当前活动文本框设置值
 *
 * @memberOf {meta.ui.selectTree}
 * @param data
 */
meta.ui.selectTree.prototype.setValue = function (data) {
    this.bindInput.value = data;
};
/**
 * mode 开启文本框输入时在树里面搜索
 *
 * @memberOf {meta.ui.selectTree}
 * @param mode
 * @param flag
 *            flag为真时，一直往下搜
 */
meta.ui.selectTree.prototype.enableSearch = function (mode, flag) {
    this._searchMode = !!mode;
    this._searchFlag = !!flag;
    if (this._searchMode) {
        this.tree.enableKeySearch(false);
        for (var k in this.binds) {
            var el = this.binds[k].input || this.binds[k];
            el.readonly = false;
            if (el.onkeyup)
                continue;
            el.onkeyup = function (e) {
                e = e || window.event;
                var inp = e.srcElement;
                if (!inp.selectTree)
                    return;
                if (inp.value) {
                    if (e.keyCode == 13 || e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40
                        || (inp.old_value != inp.value)) {
                        inp.selectTree.tree.findItem(inp.value.replace(/(^\s*)|(\s*$)/g, ""),
                            (e.keyCode == 38 || e.keyCode == 37) ? 1 : 0, inp.selectTree._searchFlag ? null : 1);
                    }
                }
                inp.old_value = inp.value;
            }
        }
    } else {
        for (var k in this.binds) {
            var el = this.binds[k].input || this.binds[k];
            el.onkeyup = null;
            el.readonly = true;
        }
    }
};

/**
 * 下拉选择表格
 * @param bindObj
 * @param width
 * @param height
 */
meta.ui.selectTable = function (bindObj, width, height) {

};

/**
 * 数据表格
 * @class {meta.ui.DataTable}
 * @param parentObj 表格容器，可以是ID，可以是容器对象
 * @param isTree 是否是表格树，当为表格树时还必须设置一些特殊参数才会生效
 */
meta.ui.DataTable = function (parentObj, isTree) {
    this.tableId = "MetaDataTable_" + dhx.uid();	//	唯一标识ID
    this.userData = null;		//	绑定数据
    this.desFlag = 0;			//	是否销毁绑定数据
    this.parentObj = parentObj;
    if (typeof(this.parentObj) == "string")
        this.parentObj = document.getElementById(this.parentObj);

    this.pagingFlag = true;	//	分页标识，是否显示分页条
    this.Page = {
        pageSize:10,
        currPageNum:0, //当前页号
        allRowCount:0, //	总记录数
        allPageCount:1, //	总页面数
        pageSizeOptions:[10, 20, 30, 50],
        allowType:0, //当前页面记录数0锁定最后，1动态表格末行数据对齐，2指定div容器
        pageType:0, //分页类型 0默认toolbar类型，后续再扩展
        pageDiv:null  //allowType=2时有效，page容器
    };
    this.pageBar = null;//分页条

    this.sorting = false;		//	表头是否排序
    this.Sort = {
        orderColMap:{}, //	排序字段方向
        orderCols:[], //	排序字段列表
        reserveCount:3             //	保留排序字段数
    };

    this.columnIds = [];			//	数组保持显示顺序
    this.columnNames = {};         //列map

    this.isTree = !!isTree; //是否是树
};
meta.ui.DataTable.goPageSelectMax = 50;//静态变量，设置gopage模式，最大50页，即切换为输入框

/**
 * 绘制，生成各种数据容器和dhtmlxGrid
 * @memberOf {meta.ui.DataTable}
 */
meta.ui.DataTable.prototype.render = function () {
    if (!this.rendered) {
        if (this.parentObj.style.display == "none") {
            this.parentObj.style.display = "block";
        }
        this.parentObj.style.borderTopWidth = "1px";
        this.parentObj.style.borderTopStyle = "solid";
        this.parentObj.style.borderTopColor = "#A4BED4";
        if (this.Page.allowType == 0 || this.Page.allowType == 1) {//锁定最后，需要在最后留27px高度放分页条
            this.gridBox = document.createElement("DIV");
            this.parentObj.appendChild(this.gridBox);
            this.Page.pageDiv = document.createElement("DIV");
            this.Page.pageDiv.id = "pgb_"+this.tableId;
            this.parentObj.appendChild(this.Page.pageDiv);
            this.Page.pageDiv.style.width = "100%";
            this.Page.pageDiv.style.height = 27 + "px";

            this.Page.pageDiv.style.overflow = "hidden";
            this.Page.pageDiv.style.margin = "0px";
            this.Page.pageDiv.style.padding = "0px";
            if (!this.pagingFlag){
                this.parentObj.style.borderBottomWidth = "1px";
                this.parentObj.style.borderBottomStyle = "solid";
                this.parentObj.style.borderBottomColor = "#A4BED4";
                this.Page.pageDiv.style.display = "none";
            }
            this.gridBox.style.width = "100%";

            this.gridBox.style.overflow = "hidden";
            var h = this.parentObj.offsetHeight;
            if (h == 0){
                h = parseInt(this.parentObj.style.height = this.parentObj.getAttribute("height")
                    || (window.getComputedStyle
                    ? (this.parentObj.style.height || window.getComputedStyle(this.parentObj, null)["height"])
                    : (this.parentObj.currentStyle
                    ? this.parentObj.currentStyle["height"]
                    : this.parentObj.style.height || 0))
                    || "100%");
            }
            if (this.Page.allowType == 1) {
                this.gridBox.style.minHeight = h - this.Page.pageDiv.offsetHeight + "px";
                this.parentObj.style.overflowX = "hidden";
                this.parentObj.style.overflowY = "scroll";
                this.parentObj.onscroll = function () {
                    this.getChildNodes()[0].getChildNodes()[0].style.zIndex = 1;
                    this.getChildNodes()[0].getChildNodes()[0].style.top = this.scrollTop + "px";
                };
            } else {
                var ph = 0;
                if(this.parentAutoHeightMode)
                    ph = h - 27;
                else
                    ph = h - (this.pagingFlag?27:0);
                this.gridBox.style.height = ph+"px";
                this.parentObj.style.height = ph + (this.pagingFlag?27:0) + "px";
                this.parentObj.style.overflow = "hidden";
            }
        } else if (this.Page.allowType == 2) {
            if (!this.Page.pageDiv) {
                this.pagingFlag = false;//如果未传入page容器，则自动变为不分页
            }
            if (typeof(this.Page.pageDiv) == "string")
                this.Page.pageDiv = document.getElementById(this.Page.pageDiv);
            this.gridBox = this.parentObj;
            this.gridBox.style.overflow = "hidden";
        }
        if (this.pagingFlag) {
            this._pageRender();
        }
        if (!this.grid) {
            this.grid = DHTMLXFactory.createGrid(this.tableId, {parent:this.gridBox});
            if (window["getDefaultImagePath"] && window["getSkin"]) {
                this.grid.setImagePath(getDefaultImagePath() + "csh_" + getSkin() + "/");
            }
            this.grid.entBox.onselectstart = function (e) {
                (e || event).cancelBubble = false;
                return true;
            };
            if (this.headers && this.headers.length > 0) {
                this.grid.setHeader(this.headers);
            }
            this.grid.setHeaderAlign("center");
            this.grid.setHeaderBold(true);
            this.grid.setColumnIds(this.columnIds.join(","));
            this.grid.enableAutoHeight(this.Page.allowType == 1);
            if (this.columnIds.length > 0) {
                var _width = parseInt(100 / this.columnIds.length);
                this.grid._enbTts = [];
                for (var i = 0, len = this.columnIds.length; i < len; i++) {
                    this.grid.initCellWidth[i] = _width + (i < (100 - _width * len) ? 1 : 0);
                    this.grid.cellType[i] = (this.isTree && i == 0) ? "tree" : "ro";
                    this.grid.cellAlign[i] = "left";//(i==len-1?"center":"left");
                    this.grid._enbTts[i] = (i < len - 1);
                }
            }
            if (this.isTree) {
                this.grid.enableTreeGridLines();
                this.grid.enableTreeCellEdit(false);
                if (this._dynload) {
                    this.grid.kidsXmlFile = this._dynload;
                    this.grid.expandKids = this.grid.expandKids__;
                }
                this.grid.attachEvent("onOpenStart", function (id, state) {
                    //因为dhtmlx在移动过程中，会自动展开下级，且会生成一个新的ID，其ID由时间种子生成，大于Java所表示的Integer的最大值。
                    //这里返回不让其展开，以免报错
//                    if(state==-1 && parseInt(id)>2147483648 && this.kidsXmlFile){
//                        return false;
//                    }
                    if (state == 1) {
                        this.setItemImage(id, getBasePath() + "/meta/resource/images/tree_icon/folderClosed.gif");
                    } else {
                        this.setItemImage(id, getBasePath() + "/meta/resource/images/tree_icon/folderOpen.gif");
                    }
                    var arr = this.getSubItems(id);
                    if (arr.length > 0) {
                        arr = arr.split(this.delim)
                        for (var i = 0; i < arr.length; i++) {
                            if (this.hasChildren(arr[i]) < 1 && !this._h2.get[arr[i]].has_kids) {
                                this._h2.get[arr[i]].image = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/leaf.gif";
                                this.rowsAr[arr[i]].imgTag.nextSibling.src = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/leaf.gif";
                            } else {
                                this._h2.get[arr[i]].image = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/folderClosed.gif";
                                this.rowsAr[arr[i]].imgTag.nextSibling.src = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/folderClosed.gif";
                            }
                        }
                    }
                    return true;
                });
//                this.moveAfterParentId = {};//缓存移动后的父ID
                this.grid.attachEvent("onDrag", function (sId, tId, sObj, tObj, sInd, tInd) {
                    //如果源ID的父节点只有一个子节点了，将其图标设置为叶子节点的图标。
                    var sparId = this.getParentId(sId);
                    var tparId = this.getParentId(tId);
                    if (sparId != 0 && tparId != sparId && tId != sparId && this.hasChildren(sparId) < 2) { //如果源节点的父只有小于两个子，那么被拖出之后即变成叶子
                        this._h2.get[sparId].image = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/leaf.gif";
                        this.rowsAr[sparId].imgTag.nextSibling.src = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/leaf.gif";
                        this._h2.get[sparId].has_kids = false;//无子菜单表示
                    }
                    return true;
                });
                this.grid.attachEvent("onDrop", function (sId, tId, dId, sObj, tObj, sCol, tCol) {
//                    this.MetaDataTable.moveAfterParentId[sId] = this.getParentId(sId);
                    if (this.hasChildren(sId) < 1 && !this._h2.get[sId].has_kids) {
                        this._h2.get[sId].image = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/leaf.gif";
                        this.rowsAr[sId].imgTag.nextSibling.src = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/leaf.gif";
                    } else {
                        this._h2.get[sId].image = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/folderClosed.gif";
                        this.rowsAr[sId].imgTag.nextSibling.src = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/folderClosed.gif";
                    }
                });
            }
            if (this.sorting) {
                this.grid.attachEvent("onHeaderClick", this._sort);
            }
            this.grid.MetaDataTable = this;
            this.grid._fillRow = meta.ui.DataTable._fillRow;
            this.grid.attachEvent("onRowIdChange", function (new_id, old_id) {
                if (this.MetaDataTable && this.MetaDataTable.rowKeyIdIndex) {
                    this.MetaDataTable.rowKeyIdIndex[new_id] = this.MetaDataTable.rowKeyIdIndex[old_id];
                }
                return true;
            });
//            this.grid.changeRowId = function(){alert("不支持changeRowId方法!")};
//            this.grid.attachEvent("onEditCell", function(stage,rId,cInd,nValue,oValue){
//                this.MetaDataTable.setUserData(rId,cInd,nValue);
//                return true;
//            });
        }
        this.rendered = true;
    }
};
/**
 * 设置父容器高度随Grid高度自动适应
 * @param mode
 */
meta.ui.DataTable.prototype.setParentAutoHeight = function(mode){
    this.parentAutoHeightMode = !!mode;
    if(this.rendered && this.parentAutoHeightMode){
        var h = parseInt(this.parentObj.style.height = this.parentObj.getAttribute("height")
            || (window.getComputedStyle
            ? (this.parentObj.style.height || window.getComputedStyle(this.parentObj, null)["height"])
            : (this.parentObj.currentStyle
            ? this.parentObj.currentStyle["height"]
            : this.parentObj.style.height || 0))
            || "100%");
        this.gridBox.style.height = h - 27 + "px";
        this.parentObj.style.height = h + (this.pagingFlag?27:0) + "px";
    }
};
/**
 * 获取拖动过后的数据变化，主要针对排序和层级（如果是树）
 * @return 返回map对象
 *          key=id
 *          value={pid:新的父ID,order:新的顺序号}
 */
meta.ui.DataTable.prototype.getDragAfterLevelAndOrderData = function () {
    var data = {};
    var childStr = this.grid.getAllSubItems(0).split(this.grid.delim);
    for (var i = 0; i < childStr.length; i++) {
        var sid = childStr[i];
        var pid = this.parIdMap[sid];
        if (!pid)
            pid = this.grid.getParentId(sid);
        var order = this._getItemIndexOrder(sid);
        data[sid] = {pid:pid, order:order};
    }
    return data;
};
/**
 * 获取生成一个节点的排序索引 从1开始
 * @param id
 * @return 返回排序ID
 */
meta.ui.DataTable.prototype._getItemIndexOrder = function (id) {
    var pid = this.grid.getParentId(id);
    if (pid == 0) {
        return this.grid._h2.get[id].index + 1;
    } else {
        return this._getItemIndexOrder(pid) + this.grid._h2.get[id].index + 1;
    }
};
/**
 * 设置某列的属性
 * @memberOf {meta.ui.DataTable}
 * @param colIndex 列索引（0开头）
 * @param cf 具体包含 type,label,width,align,valign,tip
 */
meta.ui.DataTable.prototype.setGridColumnCfg = function (colIndex, cf) {
    if (colIndex >= 0 && colIndex < this.columnIds.length && cf) {
        if (cf.label)this.grid.setColumnLabel(colIndex, cf.label);
        if (cf.type)this.grid.cellType[colIndex] = cf.type;
        if (cf.width)this.grid.setColWidth(colIndex, cf.width);
        if (cf.align)this.grid.cellAlign[colIndex] = cf.align;
        if (cf.valign)this.grid.cellVAlign[colIndex] = cf.valign;
        if (cf.tip!=null && cf.tip!=undefined)this.grid._enbTts[colIndex] = !!(cf.tip);
    }
};
/**
 * 静态私有方法
 * 重写原grid的填充行方法，加入行数据格式回调
 * @param r 一行，表格的 TR对象
 * @param text 数据（一维数组）
 */
meta.ui.DataTable._fillRow = function (r, text) {
    if (this.MetaDataTable.isTree && r.parentNode && r.parentNode.tagName == "row")
        r._attrs["parent"] = r.parentNode.getAttribute("idd");

    if (this.editor)
        this.editStop();

    for (var i = 0; i < r.childNodes.length; i++) {
        if ((i < text.length) || (this.defVal[i])) {

            var ii = r.childNodes[i]._cellIndex;
            var val = text[ii];
            var aeditor = this.cells4(r.childNodes[i]);

            if ((this.defVal[ii]) && ((val == "") || ( typeof (val) == "undefined")))
                val = this.defVal[ii];

            if (this.MetaDataTable.formatCellCall) {
                val = this.MetaDataTable.formatCellCall(r.idd, ii, text, this.MetaDataTable.columnIds[ii], this.MetaDataTable);
            }
            if (aeditor) aeditor.setValue(val)
        } else {
            r.childNodes[i].innerHTML = "&nbsp;";
            r.childNodes[i]._clearCell = true;
        }
    }

    if (this.MetaDataTable.formatRowCall) {
        r = this.MetaDataTable.formatRowCall(r, text, r.idd, this.MetaDataTable);
    }
    if (!r)return null;

    return r;
};
/**
 * 设置单元格格式化回调
 * @memberOf {meta.ui.DataTable}
 * @param fun 单元格回调函数,此函数实现支持三个参数（rid，colIndex，data）
 *          rid：行ID
 *          colIndex：列索引
 *          data：一整行的数据（一维数组）
 *          此回调函数需正常返回数据，默认返回 data[colIndex]
 */
meta.ui.DataTable.prototype.setFormatCellCall = function (fun) {
    this.formatCellCall = fun;
};
/**
 * 设置行格式化回调
 * @memberOf {meta.ui.DataTable}
 * @param fun 行回调函数，此函数支持两个参数（tr，data）
 *          tr：表格TR对象
 *          data：一整行数据（一维数组）
 *          此函数需要正常返回，默认返回 TR对象
 */
meta.ui.DataTable.prototype.setFormatRowCall = function (fun) {
    this.formatRowCall = fun;
};
/**
 * 设置排序模式
 * @memberOf {meta.ui.DataTable}
 * @param flag 布尔值，排序开关
 * @param sortMap 排序列数据格式为MAP对象，key表示可排序的列，value表示初始排序方式‘ASC/DESC’两种，默认'',表示初始不排
 * @param reserveCount 保留排序字段数 多列排序时最多记忆排序列数，不传默认为 3
 */
meta.ui.DataTable.prototype.setSorting = function (flag, sortMap, reserveCount) {
    this.sorting = !!flag;
    if (!this.sorting)return;
    if (sortMap) {
        this.Sort.orderCols = [];
        this.Sort.orderColMap = {};
        var i = 0;
        for (var col in sortMap) {
            this.Sort.orderColMap[col.toUpperCase()] = sortMap[col.toUpperCase()].toUpperCase() || "";
            i++;
            if (this.Sort.orderColMap[col.toUpperCase()])
                this.Sort.orderCols[this.Sort.orderCols.length] = col.toUpperCase();
        }
        this.Sort.reserveCount = parseInt(reserveCount) ? parseInt(reserveCount) : this.Sort.reserveCount;
        if (i == 0)this.sorting = false;
    } else {
        if (this.Sort.orderCols.length == 0)
            this.sorting = false;
    }
};
/**
 * 私有方法，排序事件，供列头排序时调用
 * @memberOf {meta.ui.DataTable}
 *  ind - index of the column;
 *  obj - related javascript event object.
 */
meta.ui.DataTable.prototype._sort = function (ind, obj) {
    var dataTable = this.MetaDataTable;
    if (!dataTable.sorting)return;
    if (dataTable.Sort.orderColMap[dataTable.columnIds[ind]] != null && dataTable.Sort.orderColMap[dataTable.columnIds[ind]] != undefined) {
        var ascmode = dataTable.Sort.orderColMap[dataTable.columnIds[ind]];
        if (ascmode == "")dataTable.Sort.orderColMap[dataTable.columnIds[ind]] = "ASC";
        if (dataTable.Sort.orderCols[0] == dataTable.columnIds[ind]) {  //说明当前列连续点击，交换方向
            if (ascmode.toUpperCase() == "DESC") {
                dataTable.Sort.orderColMap[dataTable.columnIds[ind]] = "ASC";
            } else {
                dataTable.Sort.orderColMap[dataTable.columnIds[ind]] = "DESC";
            }
        }
        var sortspan_ = document.getElementById("sortspan_" + dataTable.tableId + "_" + dataTable.Sort.orderCols[0]);
        if (sortspan_)
            sortspan_.style.display = "none";
        dataTable.Sort.orderCols.removeByValue(dataTable.columnIds[ind]);
        dataTable.Sort.orderCols = [dataTable.columnIds[ind]].concat(dataTable.Sort.orderCols);
        dataTable.Sort.orderCols.length = dataTable.Sort.reserveCount;
        dataTable.refreshData();
        sortspan_ = document.getElementById("sortspan_" + dataTable.tableId + "_" + dataTable.Sort.orderCols[0]);
        if (sortspan_) {
            sortspan_.className = "sort_" + (dataTable.Sort.orderColMap[dataTable.Sort.orderCols[0]] == "DESC" ? 'desc' : 'asc');
            sortspan_.style.display = "inline-block";
        }
    } else {
        return;
    }
};
/**
 * 设置分页数目选项
 * 设置分页条下拉框可设置的分页数目
 * @memberOf {meta.ui.DataTable}
 * @param pageSizes 可以是数组，可以是'，'分割的字符串， 默认为10,20,30,50四种值可选
 */
meta.ui.DataTable.prototype.setPageSizeOptions = function (pageSizes, flag) {
    if(this.pageBar)
        this.pageBar.setPageSizeOptions(pageSizes,flag);
};
/**
 * 私有方法
 * 设置分页跳转下拉框项
 * @memberOf {meta.ui.DataTable}
 * @param count 设置分页跳转下拉框数组，count=实际分页数组
 */
meta.ui.DataTable.prototype.setPageCountOptions = function (count) {
    if(this.pageBar)
        this.pageBar.setPageCountOptions(count);
};
/**
 * 设置分页模式
 * @memberOf {meta.ui.DataTable}
 * @param flag 布尔值，分页开关
 * @param pageSize 分页大小，默认10
 * @param allowType 分页条位置，默认0。  0固定在数据表格最后位置，1根据数据数目滚动，2来自外部
 * @param pageDiv 分页条容器，如果allowType=2时，需要传此参数
 * @param pageType 分页条类型，默认0，目前只支持0，即时toolbar模式
 */
meta.ui.DataTable.prototype.setPaging = function (flag, pageSize, allowType, pageDiv, pageType) {
    this.pagingFlag = !!flag;
    if (!this.pagingFlag)return;
    this.Page.pageSize = parseInt(pageSize) ? parseInt(pageSize) : this.Page.pageSize;
    this.Page.allowType = allowType <= 2 ? allowType : 0;
    var pd = $(pageDiv);
    if (pd) {
        this.Page.pageDiv = pd;
    }
    if (this.Page.allowType == 2) {
        if (!pd)
            this.Page.allowType = 0;
    }
    this.Page.pageType = pageType || this.Page.pageType;
};
/**
 * 私有方法，绘制生成分页条
 * @memberOf {meta.ui.DataTable}
 * @param flag 强行重绘
 */
meta.ui.DataTable.prototype._pageRender = function (flag) {
    if (!this.pagingFlag)return;
    if (this.pagerendered && !flag)return;
    if (this.Page.pageType == 0) {
        this.pageBar = new meta.ui.PageBar(this.Page.pageDiv,this.Page.pageSize);
        this.pageBar.fromTable_ = this;
        this.pagerendered = true;

        this.pageBar.setPageSizeOptions(this.Page.pageSize);
        this.pageBar.setPageCountOptions();

        this.pageBar.hidePageBar(this.Page.hidePB_txt, this.Page.hidePB_go, this.Page.hidePB_sel, this.Page.hidePB_jt);
    }
};
/**
 * 隐藏分页条的一部分
 * @param txt
 * @param go
 */
meta.ui.DataTable.prototype.hidePageBar = function (txt, go, sel, jt) {
    if(this.pageBar)
        this.pageBar.hidePageBar(txt,go,sel,jt);
};
//分页跳转前回调
meta.ui.DataTable.prototype.setGoPageBeforeCall = function (fun) {
    if(this.pageBar)
        this.pageBar.setGoPageBeforeCall(fun);
};
//刷新数据前跳转前回调
meta.ui.DataTable.prototype.setRefreshBeforeCall = function (fun) {
    if (fun && typeof(fun) == "function")
        this.refreshBeforeCall = fun;
};
/**
 * 刷新数据，第一次使用时，绑定刷新回调
 * @memberOf {meta.ui.DataTable}
 * @param refreshCall 回调函数支持两个参数，第一个是DataTable对象，第一个是即时参数对象（包括分页和排序参数）
 *          刷新回调函数内部实现，需调用bindData完成数据绑定
 */
meta.ui.DataTable.prototype.refreshData = function (refreshCall) {
    this.refreshCall = refreshCall || this.refreshCall;
    if(this.pageBar){
        this.pageBar.setGoPageCall(this.refreshCall);
    }
    this.parentObj.getChildNodes()[0].getChildNodes()[0].style.top = "0px";
    this.parentObj.scrollTop = "0px";
    if (this.Page.allowType == 1) {
        var h = this.parentObj.offsetHeight;
        if (h == 0)
            h = parseInt(this.parentObj.style.height = this.parentObj.getAttribute("height")
                || (window.getComputedStyle
                ? (this.parentObj.style.height || window.getComputedStyle(this.parentObj, null)["height"])
                : (this.parentObj.currentStyle
                ? this.parentObj.currentStyle["height"]
                : this.parentObj.style.height || 0))
                || "100%");
        this.parentObj.getChildNodes()[0].getChildNodes()[1].style.minHeight = h -
            this.Page.pageDiv.offsetHeight - this.parentObj.getChildNodes()[0].getChildNodes()[0].offsetHeight - 17 + "px";
    }
    if (this.refreshCall) {
        if (!this.refreshBeforeCall || this.refreshBeforeCall(this)) {
            this.refreshCall(this, this.getCurrentParams());
            this.Page.currPageNum = 0;
        }
    } else {
        //alert("请传入refreshCall函数");
    }
};
/**
 * 设置行唯一索引 依据的字段  如果不设置，行索引则默认生成为 从1开始的自然数
 * 如果是表格树，则必须调用此方法显示设置出父子关系，以便形成树结构
 * @memberOf {meta.ui.DataTable}
 * @param idField 依据字段（如果绑定的是数组，则此值为绑定数组的索引）
 * @param pidField 当grid为树时才用
 */
meta.ui.DataTable.prototype.setRowIdForField = function (idField, pidField) {
    this.rowKeyField = idField;
    if (this.isTree) {
        this.rowParKeyField = pidField;
    }
};
/**
 * 设置表格树为动态加载函数
 * @memberOf {meta.ui.DataTable}
 * @param fun 动态加载函数，此回调函数支持3个参数：
 *          id：父ID
 *          dataTable：表格对象
 *          param：表格即时参数（包含分页和排序等属性）
 *          此回调一般用于查询后台，返回数据后调用 loadChildData 绑定子节点数据
 * @param hasChildField 设置标识是否有子节点的字段名或索引
 *          如果没此参数，那么所有节点默认都是有子的，需要点击一下动态去后台查询一次再改变状态
 */
meta.ui.DataTable.prototype.setDynload = function (fun, hasChildField) {
    if (this.isTree) {
        this._dynload = fun;
        this.hasChildField = hasChildField;
        if (this.grid && this._dynload) {
            this.grid.kidsXmlFile = this._dynload;
        }
    }
};
/**
 * 设置列，必须在render之前调用
 * @memberOf {meta.ui.DataTable}
 * @param columns 列MAP，key一般与数据库字段对应，应为要支持排序，value为列中文名，
 *                  其载入顺序即是列的显示顺序
 * @param dataColOrder 绑定数据时一个列的对应映射，不传此参数，即按顺序来；
 *          当绑定MAP类型的数据时，此值传入每个列绑定数据对应的key
 *          当绑定为array类型时，此值传入每个列对应到绑定数据的index
 */
meta.ui.DataTable.prototype.setColumns = function (columns, dataColOrder) {
    if (columns && typeof(columns) == "object") {
        dataColOrder = dataColOrder || [];
        if (typeof(dataColOrder) == 'string')
            dataColOrder = dataColOrder.toUpperCase().split(",");

        this.headers = [];
        this.columnNames = {};
        for (var k in columns) {
            var colid = k.toUpperCase();
            this.columnIds[this.columnIds.length] = colid;
            this.columnNames[colid] = columns[k];
            var colname = this.columnNames[colid];
            if (this.headerRenderCall)
                colname = this.headerRenderCall(k, colname);
            this.headers[this.headers.length] = colname;
        }
        if (dataColOrder.length != 0)this.colOrderIndex = true;
        if (this.colOrderIndex) {
            this.colOrderIndex = [];
            this.colOrderKey = {};
            for (var j = 0; j < dataColOrder.length; j++)
                this.colOrderKey[dataColOrder[j].toUpperCase()] = j + 1;
            var pos = 0;
            for (var i = 0; i < this.columnIds.length; i++) {
                if (this.colOrderKey[this.columnIds[i]]) {
                    this.colOrderIndex[i] = this.colOrderKey[this.columnIds[i]] - 1;
                } else {
                    if (dataColOrder[i] != null && dataColOrder != undefined)
                        this.colOrderIndex[i] = dataColOrder[i];
                    else {
                        if (this.columnIds.length > dataColOrder.length)
                            this.colOrderIndex[i] = dataColOrder.length + pos++;
                        else
                            alert("字段:" + this.columnIds[i] + " 未找到对应数据索引!");
                    }
                }
            }
        }
    }
};
/**
 * 设置列头绘制回调，可用于把某些列头绘制成特殊样式
 * @memberOf {meta.ui.DataTable}
 * @param fun 列头绘制回调函数，用于给列头加一些特殊样式修饰：支持1个参数
 *          name：列头中文名
 *          返回新绘制过后的列头html代码
 */
meta.ui.DataTable.prototype.setHeaderRenderCall = function (fun) {
    this.headerRenderCall = fun;
};
/**
 * 设置刷新回调 (重要)
 * @memberOf {meta.ui.DataTable}
 * @param fun 刷新加载数据的回调接口，支持2个参数：
 *      dataTable：当前数据表格对象
 *      param：表格即时参数（分页和排序）
 *      刷新回调函数一般都是在查询后台数据，后台数据返回后调用 bindData绑定数据
 */
meta.ui.DataTable.prototype.setReFreshCall = function (fun) {
    this.refreshCall = fun;
    if(this.pageBar){
        this.pageBar.setGoPageCall(this.refreshCall);
    }
};
/**
 * 私有初始方法，在所有表格属性设置完成之后调用此方法
 * 也可直接调用 bindData() 内部判断完成初始
 * @memberOf {meta.ui.DataTable}
 */
meta.ui.DataTable.prototype._init = function () {
    if (!this.rendered)this.render();
    if (!this.inited) {
        if (this.isTree) {        //如果是树，则必须纠正某些参数
            this.grid.cellType[0] = "tree";
            this.grid.cellAlign[0] = "left";
        }
        if (this.sorting) {   //如果有排序，则必须改变列头
            for (var i = 0; i < this.grid.columnIds.length; i++) {
                var colid = this.grid.columnIds[i];
                if (this.Sort.orderColMap[colid] != null && this.Sort.orderColMap[colid] != undefined) {
                    var spn = "<span style='display:" + (colid == this.Sort.orderCols[0] ? 'inline-block' : 'none') +
                        "' id='sortspan_" + this.tableId + "_" + colid + "' class='sort_" +
                        (this.Sort.orderColMap[colid].toUpperCase() == "DESC" ? 'desc' : 'asc') + "'></span>";
                    this.grid.hdrLabels[i] = this.grid.hdrLabels[i] + spn;
                }
            }
        }
        this.grid.init()
    }
    this.inited = true;
};
/**
 * 绑定数据，刷新回调函数内部需要主动调用此方法完成数据绑定
 * @memberOf {meta.ui.DataTable}
 * @param data 支持二维数组和Map对象的一维数组
 * @param totalNum totalNum（总记录数，开启分页时必须传此参数）
 */
meta.ui.DataTable.prototype.bindData = function (data, totalNum) {
    if (!this.inited)this._init();
    if(totalNum==0 && this.pageBar!=null&& this.pageBar.currPageNum>1){
    	this.pageBar.currPageNum --;
    	this.refreshData();
    	return;
    }
    this.userData = null;
    if (data) {
        this.grid.clearAll();
        this.userData = data;
        this.rowKeyIdIndex = {};//清空行ID索引
        if (!this.isTree) {
            this.grid.parse(data, "arraymap");
        } else {
            if (this.rowParKeyField == null || this.rowParKeyField == undefined) {
                alert("请使用setRowIdForField方法设置ID与父ID字段标记或索引,否则无法形成树结构!");
                return;
            }
            var pidMap = {};
            this.parIdMap = {};
            for (var i = 0; i < data.length; i++) {
                var _d = data[i];
                _d = this.columnOrderCall(_d);
                var id = data[i][this.rowKeyField];
                var pid = data[i][this.rowParKeyField];
                var flag = data[i][this.hasChildField];
                flag = (flag != null && flag != undefined) ? flag : (this._dynload ? 1 : 0);
                this.rowKeyIdIndex[id] = i + 1;
                if (!(this.grid._h2.get[pid])) {
                    this.parIdMap[id] = pid;//缓存ID，避免模糊查询时拖动错误
                    pid = 0;
                }
                this.grid.addRow(id, _d, null, pid, (flag ? "folderClosed.gif" : undefined), flag);
                pidMap[pid] = 1;
            }
            for (var _id in pidMap) {
                if (_id != 0)
                    this.grid.setItemImage(_id, getBasePath() + "/meta/resource/images/tree_icon/folderClosed.gif");
            }
        }
    }
    this.buildPage(totalNum);
    if(this.parentAutoHeightMode)
        this.parentObj.style.height = this.gridBox.offsetHeight + this.Page.pageDiv.offsetHeight + "px";
};
/**
 * 刷新表格树某节点
 * @param id
 */
meta.ui.DataTable.prototype.refreshNode = function (id) {
    if (this.isTree && this._dynload && this.grid) {
        if (id == 0)
            this.userData = [];
        else {
            var strs = this.grid.getAllSubItems(id);
            var ids = strs.split(this.grid.delim);
            for (var i = 0; i < ids.length; i++) {
                this.userData[this.rowKeyIdIndex[ids[i]]] = null; //先删除
            }
        }
        this.grid.deleteChildItems(id);
        DWREngine.setAsync(false);
        this._dynload(id, this, this.getCurrentParams());
        DWREngine.setAsync(true);

        if (id != 0) {
            if (this.grid.hasChildren(id) < 1) {
                this.grid._h2.change(id, "state", dhtmlXGridObject._emptyLineImg);
                this.grid._updateTGRState(this.grid._h2.get[id]);
                this.grid.setItemImage(id, getBasePath() + "/meta/resource/images/tree_icon/leaf.gif");
            } else {
                this.grid.setItemImage(id, getBasePath() + "/meta/resource/images/tree_icon/folderOpen.gif");
                this.grid.openItem(id);
            }
        }
    }
};

/**
 * 加载子项，树时有效
 * @memberOf {meta.ui.DataTable}
 * @param data 二维数组一维MAP数组
 */
meta.ui.DataTable.prototype.loadChildData = function (data) {
    if (this.isTree && data) {
        var pidMap = {};
        var oldLen = this.userData.length;
        this.userData = this.userData.concat(data);
        for (var i = 0; i < data.length; i++) {
            var _d = data[i];
            _d = this.columnOrderCall(_d);
            var id = data[i][this.rowKeyField];
            var pid = data[i][this.rowParKeyField];
            var flag = data[i][this.hasChildField];
            flag = (flag != null && flag != undefined) ? flag : (this._dynload ? 1 : 0);
            this.rowKeyIdIndex[id] = oldLen + i + 1;
            this.grid.addRow(id, _d, null, pid, (flag ? "folderClosed.gif" : undefined), flag);
            pidMap[pid] = 1;
        }

        for (var _id in pidMap) {
            if (_id != 0)
                this.grid.setItemImage(_id, getBasePath() + "/meta/resource/images/tree_icon/folderClosed.gif");
        }
    }
};
/**
 * 重新计算分页参数并改变状态，一般在刷新数据后调用
 * 一般都是组件内部自动调用，但是如果外面一些方法触发的分页，则需要主动调用一下，以重新设置分页条状态
 * @memberOf {meta.ui.DataTable}
 * @param totalNum 分页数目
 */
meta.ui.DataTable.prototype.buildPage = function (totalNum) {
    if(this.pageBar)
        this.pageBar.buildPage(totalNum);
};
/**
 * 私有方法
 * 主要是结合DhtmlxGrid内部填充数据是，针对数组或MAP格式的数据一个转换函数
 * @memberOf {meta.ui.DataTable}
 * @param data 一行数据（数组或MAP）
 */
meta.ui.DataTable.prototype.columnOrderCall = function (data) {
    var _d = new Array(this.columnIds.length);
    if (data.sort) {
        if (!this.colOrderIndex)return data;
        for (var i = 0; i < this.columnIds.length; i++) {
            _d[i] = data[this.colOrderIndex[i]];
        }
    } else {
        var _map = {};
        for (var k in data) {
            _map[k.toUpperCase()] = data[k];
        }
        if (!this.colOrderIndex) {
            for (var i = 0; i < this.columnIds.length; i++) {
                _d[i] = _map[this.columnIds[i].toUpperCase()];
            }
        } else {
            var i = 0;
            for (var k in this.colOrderKey) {
                if (this.colOrderKey[k]) {
                    _d[this.colOrderKey[k] - 1] = _map[k];
                }
                i++;
            }
        }
    }
    return _d;
};
/**
 * 获取用户数据
 * @memberOf {meta.ui.DataTable}
 * @param rid 行ID
 * @param idx 列索引，如果没传此参数则返回一整行数据
 */
meta.ui.DataTable.prototype.getUserData = function (rid, idx) {
    if (!this.userData)return;
    if (this.rowKeyField == null || this.rowKeyField == undefined) {
        if (rid <= this.userData.length && rid >= 1) {
            if (idx == null || idx == undefined) {
                return this.userData[rid - 1];
            } else {
                if (this.colOrderIndex && this.userData[rid - 1].sort)
                    return this.userData[rid - 1][this.colOrderIndex[idx]];
                return this.userData[rid - 1][idx];
            }
        }
    } else {
        if (this.rowKeyIdIndex[rid] == null || this.rowKeyIdIndex[rid] == undefined)return;
        if (idx == null || idx == undefined) {
            return this.userData[this.rowKeyIdIndex[rid] - 1];
        } else {
            if (this.colOrderIndex && this.userData[this.rowKeyIdIndex[rid] - 1].sort)
                return this.userData[this.rowKeyIdIndex[rid] - 1][this.colOrderIndex[idx]];
            return this.userData[this.rowKeyIdIndex[rid] - 1][idx];
        }
    }
    return null;
};
/**
 * 设置用户数据
 * @memberOf {meta.ui.DataTable}
 * @param rid 行ID
 * @param idx 列索引
 * @param data 数据
 */
meta.ui.DataTable.prototype.setUserData = function (rid, idx, data) {
    if (!this.userData)return;
    if (this.rowKeyField == null || this.rowKeyField == undefined) {
        if (this.colOrderIndex) {
            this.userData[rid - 1][this.colOrderIndex[idx]] = data;
        } else {
            this.userData[rid - 1][idx] = data;
        }
    } else {
        if (this.rowKeyIdIndex[rid] == null || this.rowKeyIdIndex[rid] == undefined)return;
        if (this.colOrderIndex) {
            this.userData[this.rowKeyIdIndex[rid] - 1][this.colOrderIndex[idx]] = data;
        } else {
            this.userData[this.rowKeyIdIndex[rid] - 1][idx] = data;
        }
    }
};
/**
 * 获取当前表格各项即时参数
 * 一般都是在需要查询后台时调用
 * @memberOf {meta.ui.DataTable}
 * @return {} 对象，包含：
 *          page:{pageSize,pageStart,rowStart}
 *          sort:"排序后的order by语句，可拿给sql直接用"
 */
meta.ui.DataTable.prototype.getCurrentParams = function () {
    var pagePar = null;
    if(this.pageBar){
        if(this.Page.currPageNum==1)
            this.pageBar.currPageNum = 1;
        pagePar = this.pageBar.getCurrentParams();
    }
    var page = pagePar || {
        pageSize:this.Page.pageSize,
        pageStart:this.Page.currPageNum,
        rowStart:this.Page.pageSize * ((this.Page.currPageNum || 1) - 1)
    };
    var sort = "";
    for (var i = 0, j = 0; i < this.Sort.orderCols.length; i++) {
        if (j > this.Sort.reserveCount - 1)break;
        if (this.Sort.orderColMap[this.Sort.orderCols[i]] == "")continue;
        if (!this.Sort.orderCols[i])break;
        sort += this.Sort.orderCols[i]
            + (this.Sort.orderColMap[this.Sort.orderCols[i]].toUpperCase() == "DESC" ? " DESC," : " ASC,");
        j++;
    }
    if (sort != "") {
        sort = sort.substring(0, sort.length - 1);
    }
    return {page:page, sort:sort};
};
/**
 * 销毁方法
 * @memberOf {meta.ui.DataTable}
 */
meta.ui.DataTable.prototype.destructor = function () {
    this.userData = null;
    this.rowKeyIdIndex = null;
    this.Sort = null;
    if (this.rendered) {
        if (this.Page.allowType == 0 || this.Page.allowType == 1) {
            this.parentObj.removeChild(this.gridBox);
            this.parentObj.removeChild(this.Page.pageDiv);
            this.parentObj = null;
            this.gridBox = null;
            this.Page.pageDiv = null;
            if (this.grid) {
                this.grid.MetaDataTable = null;
                Destroy.destructorDHMLX(this.grid);
            }
            this.grid = null;
        } else {
            this.parentObj = null;
            this.gridBox = null;
            this.Page.pageDiv = null;
            if (this.grid) {
                this.grid.MetaDataTable = null;
                Destroy.destructorDHMLX(this.grid);
            }
            this.grid = null;
        }
        delete this.gridBox;
        delete this.grid;
    }
    this.Page = null;

    delete this.userData;
    delete this.Sort;
    delete this.Page;
    delete this.parentObj;
};
/**
 * 分页条对象
 * @param parentObj
 * @param pageSize
 * @param pageType  默认1常规：  箭头上下页，显示总页数，可设置每页记录数
 *                  2：无箭头，首页用数子1表示，末页用页数表示，中间分别用连续数组+省略号表示。
 */
meta.ui.PageBar = function (parentObj, pageSize, pageType, pgalign) {
    this.pageSize = parseInt(pageSize) || 10;
    this.currPageNum = 1; 		//当前页号
    this.allRowCount = 0;		//	总记录数
    this.allPageCount = 1;			//	总页面数
    this.pageType = pageType || 1;//默认1常规
    this.pageSizeOptions = [10, 20, 30, 50];
    if (typeof(parentObj) == "string") {
        this.pageDiv = document.getElementById(parentObj);
        this.id = parentObj;
    } else {
        this.pageDiv = parentObj;
        this.id = parentObj.id;
        if (!this.id) {
            this.pageDiv.id = "pdv_" + dhx.uid();
            this.id = this.pageDiv.id;
        }
    }
    this.pageDiv.style.overflow = "hidden";
    this.pageDiv.style.height = "27px";
    this.pageDiv.style.margin = "0px";
    this.pageDiv.style.padding = "0px";
    this.pds = this.pageDiv.style.display != "none" ? (this.pageDiv.style.display || "") : "";
    this.pageAlignStyle = pgalign ? (pgalign != "right" ? "float:left" : "float:right") : "";
    this.render();
};
/**
 * 绘制分页条
 */
meta.ui.PageBar.prototype.render = function () {
    if (this.pagerendered)return;
    if (this.pageType == 1) {
        var inhtml = "<DIV id='pagediv_{id}' style='border:1px #A4BED4 solid;border-bottom:none;border-top:none' class='dhx_toolbar_base_dhx_skyblue'>" +
            "<DIV class=float_left id='pglyt_{id}' style='float:right;margin-right:0;'>" +

            "<DIV id='pg_txtdiv_{id}' style='position:relative;margin-top:4px;margin-right:0;display:inline;' class='dhx_toolbar_text'>" +
            "<span id='pg_txtsp_{id}'>&nbsp;&nbsp;总记录<span id='rowtotal_{id}'>0</span>条&nbsp;" +
            "&nbsp;当前<span id='pagenum_{id}'>1</span>/<span id='pagetotal_{id}'>1</span>页</span>" +
            "<DIV id='pg_seldiv_{id}' style='display:inline'><SELECT style='height:19px;width:60px;' id='pagesize_{id}'></SELECT></DIV>" +
            "</DIV>" +

            "<DIV class='dhx_toolbar1_btn dis'><span id='leftabs_{id}' class='page_leftabs_dis'></span></DIV>" +
            "<DIV class='dhx_toolbar1_btn dis'><span id='left_{id}' class='page_left_dis'></span></DIV>" +
            "<DIV class='dhx_toolbar1_btn dis' ><span id='right_{id}' class='page_right_dis'></span></DIV>" +
            "<DIV class='dhx_toolbar1_btn dis'><span id='rightabs_{id}' class='page_rightabs_dis'></span></DIV>" +

            "<div id='pg_godiv_{id}' class='dhx_toolbar_text' style='margin-top:4px;margin-left:1px;display:inline;'>" +
            "<span id='gospan1_{id}' style='display: none'>" +
            "<span style='float: left'>转到<input id='gotxt_{id}' style='width:18px;height:12px;line-height:12px;' type='text'>页&nbsp;</span>" +
            "<span class='gopage' id='gobtn_{id}' style='float:left;width:22px;height:18px;display:inline;'></span>" +
            "</span>" +
            "<span id='gospan2_{id}' style='display:inline;'>转到<select id='gosel_{id}' style='width:63px;height:19px;'></select></span>" +
            "</div>" +

            "</DIV></DIV>";
        this.pageDiv.innerHTML = inhtml.replace(new RegExp("{id}", "ig"), this.id);
        this.pagerendered = true;

        this.setPageSizeOptions(this.pageSize);
        this.setPageCountOptions();

        this._setPager(true);
        this.hidePageBar(this.hidePB_txt, this.hidePB_go, this.hidePB_sel, this.hidePB_jt);
    } else if (this.pageType == 2) {
        var inhtml = "<div class='page_div' id='pagediv_{id}' style='" + this.pageAlignStyle + "'>" +
            "<span id='pre_span_{id}' style='width:auto'>&lt;&lt;上一页</span>" +
            "<span id='gopage_pre_{id}'>1</span>" +
            "<span id='gopage_-5_{id}' class='nobd'>...</span>" +
            "<span id='gopage_-4_{id}'>2</span>" +
            "<span id='gopage_-3_{id}'>3</span>" +
            "<span id='gopage_-2_{id}'>4</span>" +
            "<span id='gopage_-1_{id}'>5</span>" +
            "<span id='gopage_0_{id}' class='nobd'>6</span>" +
            "<span id='gopage_1_{id}'>7</span>" +
            "<span id='gopage_2_{id}'>8</span>" +
            "<span id='gopage_3_{id}'>9</span>" +
            "<span id='gopage_4_{id}'>10</span>" +
            "<span id='gopage_5_{id}' class='nobd'>...</span>" +
            "<span id='gopage_next_{id}'>100</span>" +
            "<span id='next_span_{id}' style='width:auto'>下一页&gt;&gt;</span>";
        this.pagerendered = true;

        this.pageDiv.innerHTML = inhtml.replace(new RegExp("{id}", "ig"), this.id);
        this._setPager(true);
    }
};
/**
 * 设置分页数目选项
 * 设置分页条下拉框可设置的分页数目
 * @memberOf {meta.ui.PageBar}
 * @param pageSizes 可以是数组，可以是'，'分割的字符串， 默认为10,20,30,50四种值可选
 */
meta.ui.PageBar.prototype.setPageSizeOptions = function (pageSizes, flag) {
    if (this.pageType != 1)return;
    if (pageSizes && typeof(pageSizes) != "object")
        pageSizes = (pageSizes + "").split(",");
    if (pageSizes && pageSizes.sort) {
        for (var i = 0; i < pageSizes.length; i++) {
            if (!this.pageSizeOptions.findByValue(parseInt(pageSizes[i]))) {
                this.pageSizeOptions = [parseInt(pageSizes[i])].concat(this.pageSizeOptions);
            }
        }
    }
    if (!this.pagerendered && !flag)return;
    if (flag) {
        this.pageSize = parseInt(pageSizes[0]);
    }
    var pagesizeSel = document.getElementById("pagesize_" + this.id);
    if (pagesizeSel) {
        pagesizeSel.options.length = 0;
        for (var i = 0; i < this.pageSizeOptions.length; i++) {
            pagesizeSel.options[pagesizeSel.options.length] = new Option(this.pageSizeOptions[i] + "/页", this.pageSizeOptions[i]);
            if (this.pageSizeOptions[i] == this.pageSize)
                pagesizeSel.options[i].selected = true;
        }
    }
};
/**
 * 私有方法
 * 设置分页跳转下拉框项
 * @memberOf {meta.ui.PageBar}
 * @param count 设置分页跳转下拉框数组，count=实际分页数组
 */
meta.ui.PageBar.prototype.setPageCountOptions = function (count) {
    if (this.pageType != 1)return;
    if (count > 0) {
        this.allPageCount = count;
    }
    if (!this.pagerendered)return;
    var gosel_ = document.getElementById("gosel_" + this.id);
    if (gosel_) {
        gosel_.options.length = 0;
        for (var i = 0; i < this.allPageCount; i++) {
            gosel_.options[i] = new Option((i + 1) + "页", i + 1);
        }
    }
};
/**
 * 设置pageType=1 时的分页条状态
 * @param bindEvent
 */
meta.ui.PageBar.prototype._setPager_1 = function (bindEvent) {
    if (!this.pagerendered)return;
    if (this.pageType != 1)return;
    var btnLeftAbs = document.getElementById("leftabs_" + this.id); //首页
    var btnLeft = document.getElementById("left_" + this.id);        //上页
    var btnRight = document.getElementById("right_" + this.id);      //下页
    var btnRightAbs = document.getElementById("rightabs_" + this.id);  //末页
    var gospan1 = document.getElementById("gospan1_" + this.id);      //go 文本框 span
    var gospan2 = document.getElementById("gospan2_" + this.id);      //go 下拉框 span
    var gotxt = document.getElementById("gotxt_" + this.id);         // go 文本框
    var gobtn = document.getElementById("gobtn_" + this.id);         //go 按钮
    var gosel = document.getElementById("gosel_" + this.id);        //go下拉框
    var pagesizeOp = document.getElementById("pagesize_" + this.id);//改变pagesize
    if (bindEvent) {
        btnLeftAbs.pageObj = this;
        btnLeft.pageObj = this;
        btnRight.pageObj = this;
        btnRightAbs.pageObj = this;
        gotxt.pageObj = this;
        gobtn.pageObj = this;
        gosel.pageObj = this;
        pagesizeOp.pageObj = this;
        btnLeftAbs.onclick = this._goFirstPage;
        btnLeft.onclick = this._goPrePage;
        btnRight.onclick = this._goNextPage;
        btnRightAbs.onclick = this._goLastPage;
        gotxt.onkeyup = function (e) {
            e = e || window.event;
            var txt = e.srcElement;
            if (e.keyCode == 13 && txt && txt.pageObj) {
                document.getElementById("gobtn_" + txt.pageObj.id).onclick();
            }
        };
        gobtn.onclick = function (e) {
            e = e || window.event;
            var btn = e.srcElement;
            if (btn && btn.pageObj) {
                var txt = document.getElementById("gotxt_" + btn.pageObj.id);
                var pn = parseInt(txt.value);
                if (pn >= 1 && pn <= btn.pageObj.allPageCount) {
                    btn.pageObj._goPage(pn);
                } else if (pn < 1) {
                    txt.value = 1;
                    btn.pageObj._goPage(1);
                } else if (pn > btn.pageObj.allPageCount) {
                    txt.value = btn.pageObj.allPageCount;
                    btn.pageObj._goPage(btn.pageObj.allPageCount);
                }
            }
        };
        gosel.onchange = function (e) {
            e = e || window.event;
            var sel = e.srcElement;
            if (sel && sel.pageObj) {
                sel.pageObj._goPage(sel.options[sel.selectedIndex].value);
            }
        };
        pagesizeOp.onchange = function (e) {
            e = e || window.event;
            var sel = e.srcElement;
            if (sel && sel.pageObj) {
                var curpageRow = sel.pageObj.pageSize * (sel.pageObj.currPageNum - 1) + 1; //原分页第一条记录的数据库索引
                sel.pageObj.pageSize = parseInt(sel.options[sel.selectedIndex].value);
                sel.pageObj.currPageNum = parseInt((curpageRow + sel.pageObj.pageSize - 1) / sel.pageObj.pageSize);
                sel.pageObj.goPageCall();
            }
        }
    }

    if ((this.currPageNum == this.allPageCount && this.currPageNum == 1) || this.allPageCount == 0) {
        btnLeftAbs.className = "page_leftabs_dis";
        btnLeftAbs.parentNode.className = "dhx_toolbar1_btn dis";
        btnLeft.className = "page_left_dis";
        btnLeft.parentNode.className = "dhx_toolbar1_btn dis";
        btnRight.className = "page_right_dis";
        btnRight.parentNode.className = "dhx_toolbar1_btn dis";
        btnRightAbs.className = "page_rightabs_dis";
        btnRightAbs.parentNode.className = "dhx_toolbar1_btn dis";
    } else if (this.currPageNum == 1) {
        btnLeftAbs.className = "page_leftabs_dis";
        btnLeftAbs.parentNode.className = "dhx_toolbar1_btn dis";
        btnLeft.className = "page_left_dis";
        btnLeft.parentNode.className = "dhx_toolbar1_btn dis";
        btnRight.className = "page_right";
        btnRight.parentNode.className = "dhx_toolbar1_btn def";
        btnRightAbs.className = "page_rightabs";
        btnRightAbs.parentNode.className = "dhx_toolbar1_btn def";
    } else if (this.currPageNum == this.allPageCount) {
        btnLeftAbs.className = "page_leftabs";
        btnLeftAbs.parentNode.className = "dhx_toolbar1_btn def";
        btnLeft.className = "page_left";
        btnLeft.parentNode.className = "dhx_toolbar1_btn def";
        btnRight.className = "page_right_dis";
        btnRight.parentNode.className = "dhx_toolbar1_btn dis";
        btnRightAbs.className = "page_rightabs_dis";
        btnRightAbs.parentNode.className = "dhx_toolbar1_btn dis";
    } else {
        btnLeftAbs.className = "page_leftabs";
        btnLeftAbs.parentNode.className = "dhx_toolbar1_btn def";
        btnLeft.className = "page_left";
        btnLeft.parentNode.className = "dhx_toolbar1_btn def";
        btnRight.className = "page_right";
        btnRight.parentNode.className = "dhx_toolbar1_btn def";
        btnRightAbs.className = "page_rightabs";
        btnRightAbs.parentNode.className = "dhx_toolbar1_btn def";
    }

    document.getElementById("rowtotal_" + this.id).innerHTML = this.allRowCount;
    document.getElementById("pagenum_" + this.id).innerHTML = this.currPageNum;
    document.getElementById("pagetotal_" + this.id).innerHTML = this.allPageCount;
    if (this.allPageCount > meta.ui.DataTable.goPageSelectMax) {
        gospan1.style.display = "inline";
        gospan2.style.display = "none";
        document.getElementById("gotxt_" + this.id).value = this.currPageNum;
    } else {
        gospan1.style.display = "none";
        gospan2.style.display = "inline";
        document.getElementById("gosel_" + this.id).value = this.currPageNum;
    }
};
/**
 * 设置pageType=2 时的分页条状态
 * @param bindEvent
 */
meta.ui.PageBar.prototype._setPager_2 = function (bindEvent) {
    if (!this.pagerendered)return;
    if (this.pageType != 2)return;
    var pdv = document.getElementById("pagediv_" + this.id);
    if (bindEvent) {
        var sps = pdv.childNodes;
        //给按钮注册事件
        for (var i = 0; i < sps.length; i++) {
            if (sps[i].tagName.toUpperCase() == "SPAN") {
                sps[i].pageObj = this;
                attachObjEvent(sps[i], "onclick", function (e) {
                    e = e || window.event;
                    var sp = e.srcElement;
                    if (sp && sp.tagName.toUpperCase() == "SPAN") {
                        if (sp.className != "nobd") {
                            if (sp.innerHTML.indexOf("上一页") != -1) {
                                sp.pageObj._goPage(sp.pageObj.currPageNum - 1);
                            } else if (sp.innerHTML.indexOf("下一页") != -1) {
                                sp.pageObj._goPage(sp.pageObj.currPageNum + 1);
                            } else {
                                sp.pageObj._goPage(parseInt(sp.innerHTML));
                            }
                        }
                    }
                });
            }
        }
    }

    //分析设置分页条状态数值
    var pre_span = document.getElementById("pre_span_" + this.id);
    var next_span = document.getElementById("next_span_" + this.id);
    pre_span.style.display = this.currPageNum == 1 ? "none" : "block";
    next_span.style.display = this.allPageCount == this.currPageNum ? "none" : "block";
    var span0 = document.getElementById("gopage_0_" + this.id);
    span0.innerHTML = this.currPageNum;
    for (var i = 1; i <= 4; i++) {
        if (this.currPageNum + i < this.allPageCount) {
            document.getElementById("gopage_" + i + "_" + this.id).style.display = "block";
            document.getElementById("gopage_" + i + "_" + this.id).innerHTML = this.currPageNum + i;
        } else {
            document.getElementById("gopage_" + i + "_" + this.id).style.display = "none";
        }
        if (this.currPageNum - i > 1) {
            document.getElementById("gopage_-" + i + "_" + this.id).style.display = "block";
            document.getElementById("gopage_-" + i + "_" + this.id).innerHTML = this.currPageNum - i;
        } else {
            document.getElementById("gopage_-" + i + "_" + this.id).style.display = "none";
        }
    }
    document.getElementById("gopage_pre_" + this.id).style.display = this.currPageNum == 1 ? "none" : "block";
    document.getElementById("gopage_next_" + this.id).style.display = this.allPageCount == this.currPageNum ? "none" : "block";
    document.getElementById("gopage_next_" + this.id).innerHTML = this.allPageCount;
    //如  93,94,95,67,97,...,100
    if (this.currPageNum + 6 > this.allPageCount) {
        document.getElementById("gopage_5_" + this.id).style.display = "none";
    } else {
        document.getElementById("gopage_5_" + this.id).style.display = "block";
        if (this.currPageNum + 6 == this.allPageCount) {
            document.getElementById("gopage_5_" + this.id).innerHTML = this.allPageCount - 1;
            document.getElementById("gopage_5_" + this.id).className = "";
        } else {
            document.getElementById("gopage_5_" + this.id).innerHTML = "...";
            document.getElementById("gopage_5_" + this.id).className = "nobd";
        }
    }

    //如 1,...,4,5,6,7,8
    if (this.currPageNum - 6 < 1) {
        document.getElementById("gopage_-5_" + this.id).style.display = "none";
    } else {
        document.getElementById("gopage_-5_" + this.id).style.display = "block";
        if (this.currPageNum - 6 == 1) {
            document.getElementById("gopage_-5_" + this.id).innerHTML = 2;
            document.getElementById("gopage_-5_" + this.id).className = "";
        } else {
            document.getElementById("gopage_-5_" + this.id).innerHTML = "...";
            document.getElementById("gopage_-5_" + this.id).className = "nobd";
        }
    }

    if ((this.currPageNum == this.allPageCount && this.currPageNum == 1) || this.allPageCount == 0) {
        this.pageDiv.style.display = "none";
    } else {
        this.pageDiv.style.display = this.pds;
    }
};
/**
 * 私有方法，设置分页条状态
 * @memberOf {meta.ui.PageBar}
 * @param bindEvent 是否绑定事件，一般初始时才传此参数
 */
meta.ui.PageBar.prototype._setPager = function (bindEvent) {
    if (!this.pagerendered)return;
    if (this.pageType == 1) {
        this._setPager_1(bindEvent);
    } else if (this.pageType == 2) {
        this._setPager_2(bindEvent);
    }
};
/**
 * 隐藏分页条的一部分
 * @param txt
 * @param go
 */
meta.ui.PageBar.prototype.hidePageBar = function (txt, go, sel, jt,txtsp) {
    if (this.pageType == 1) {
        this.hidePB_txt = !!txt;
        this.hidePB_go = !!go;
        this.hidePB_sel = !!sel;
        this.hidePB_jt = !!jt;
        this.hidePB_txtsp = !!txtsp;
        document.getElementById("pg_txtdiv_" + this.id).style.display = this.hidePB_txt ? "none" : "inline";
        document.getElementById("pg_godiv_" + this.id).style.display = this.hidePB_go ? "none" : "inline";
        document.getElementById("pg_seldiv_" + this.id).style.display = this.hidePB_sel ? "none" : "inline";
        document.getElementById("pg_txtsp_" + this.id).style.display = this.hidePB_txtsp ? "none" : "inline";
        document.getElementById("leftabs_" + this.id).parentNode.style.display = this.hidePB_jt ? "none" : "inline";
        document.getElementById("left_" + this.id).parentNode.style.display = this.hidePB_jt ? "none" : "inline";
        document.getElementById("right_" + this.id).parentNode.style.display = this.hidePB_jt ? "none" : "inline";
        document.getElementById("rightabs_" + this.id).parentNode.style.display = this.hidePB_jt ? "none" : "inline";
    }
};
/**
 * 私有方法，首页
 * @param e
 */
meta.ui.PageBar.prototype._goFirstPage = function (e) {
    e = e || window.event;
    var btn = e.srcElement;
    if (btn && btn.pageObj && btn.className.indexOf("_dis") == -1) {
        btn.pageObj._goPage(1);
    }
};
/**
 * 私有方法，上页
 * @memberOf {meta.ui.PageBar}
 * @param e   页面事件对象
 */
meta.ui.PageBar.prototype._goPrePage = function (e) {
    e = e || window.event;
    var btn = e.srcElement;
    if (btn && btn.pageObj && btn.className.indexOf("_dis") == -1) {
        btn.pageObj._goPage(btn.pageObj.currPageNum - 1);
    }
};
/**
 * 私有方法，下页
 * @memberOf {meta.ui.PageBar}
 * @param e
 */
meta.ui.PageBar.prototype._goNextPage = function (e) {
    e = e || window.event;
    var btn = e.srcElement;
    if (btn && btn.pageObj && btn.className.indexOf("_dis") == -1) {
        btn.pageObj._goPage(btn.pageObj.currPageNum + 1);
    }
};
/**
 * 私有方法，末页
 * @memberOf {meta.ui.PageBar}
 * @param e
 */
meta.ui.PageBar.prototype._goLastPage = function (e) {
    e = e || window.event;
    var btn = e.srcElement;
    if (btn && btn.pageObj && btn.className.indexOf("_dis") == -1) {
        btn.pageObj._goPage(btn.pageObj.allPageCount);
    }
};
/**
 * 私有方法，跳转到某页
 * @memberOf {meta.ui.PageBar}
 * @param num
 */
meta.ui.PageBar.prototype._goPage = function (num) {
    //    Debug("跳转到："+this.currPageNum);
    if (!this.goPageBeforeCall || this.goPageBeforeCall(this.fromTable_ || this)) {
        this.currPageNum = parseInt(num);
        this.goPageCall();
    }
};
//分页跳转前回调
meta.ui.PageBar.prototype.setGoPageBeforeCall = function (fun) {
    if (fun && typeof(fun) == "function")
        this.goPageBeforeCall = fun;
};
/**
 * 刷新数据，第一次使用时，绑定刷新回调
 * @memberOf {meta.ui.PageBar}
 * @param goPageCall 回调函数支持两个参数，第一个是pageObj对象，第一个是即时参数对象（包括分页和排序参数）
 *          刷新回调函数内部实现，需调用bindData完成数据绑定
 */
meta.ui.PageBar.prototype.goPageCall = function (goPageCall) {
    this.goPageCallFun = goPageCall || this.goPageCallFun;
    if (this.goPageCallFun) {
        if(this.fromTable_)
            this.goPageCallFun(this.fromTable_, this.fromTable_.getCurrentParams());
        else
            this.goPageCallFun(this, this.getCurrentParams());
    } else {
        alert("pageBar对象需要传入refreshCall函数");
    }
};
meta.ui.PageBar.prototype.setGoPageCall = function (fun) {
    this.goPageCallFun = fun;
};
/**
 * 获取分页即时状态参数
 */
meta.ui.PageBar.prototype.getCurrentParams = function () {
    return {
        pageSize:this.pageSize,
        pageStart:this.currPageNum,
        posStart:this.pageSize * ((this.currPageNum || 1) - 1),
        count:this.pageSize,
        rowStart:this.pageSize * ((this.currPageNum || 1) - 1)
    };
};
/**
 * 重新计算分页参数并改变状态，一般在刷新数据后调用
 * 外面一些方法触发的分页，则需要主动调用一下，以重新设置分页条状态
 * @memberOf {meta.ui.PageBar}
 * @param totalNum 分页数目
 */
meta.ui.PageBar.prototype.buildPage = function (totalNum) {
    if (totalNum >= 0) {
        this.allRowCount = totalNum;
        var pageCount = parseInt((this.allRowCount + this.pageSize - 1) / this.pageSize);
        if (this.allPageCount != pageCount) {
            this.allPageCount = pageCount;
            if (this.allPageCount <= meta.ui.DataTable.goPageSelectMax) {
                this.setPageCountOptions();
            }
        }
    }
    if (this.currPageNum > this.allPageCount)
        this.currPageNum = this.allPageCount || 1;

    this._setPager();
};

//跟随控件缓存区域
var AutoCpFactory = {
    autoCps:{}, //所有跟随控件
    //当前控件
    thisCpId:null,
    inited:0,
    destructorAutoCp:function (id) {
        if ((id + "").indexOf("_ac") == -1)
            id = id + "_ac";
        if (this.autoCps[id])
            this.autoCps[id].destructor();
    },
    hideCp:function () {
        if (!this.thisCpId)return;
        var cp = this.autoCps[this.thisCpId];
        if (cp)
            cp.showHide(false);
    }
};

/**
 * 自动完成完成组件
 * @memberOf {meta.ui.PageBar}
 * @param target 目标控件（必须是可输入的html元素）
 * @param className 样式（默认不传）
 * @isInnerInp boolean值（若为真，则内部生成input框)
 */
meta.ui.autoCompletion = function (target, className, isInnerInp) {
    this.target = $(target);
    if (!this.target.id)
        this.target.id = dhx.uid();
    this.id = this.target.id + "_ac";
    this.pBox = document.createElement("DIV");
    this.pBox.className = "autoCompletionPar";
    document.body.appendChild(this.pBox);
    this.pBox.style.display = "none";
    if (isInnerInp) {
        this.inTarget = document.createElement("INPUT");
        this.inTarget.type = "text";
        this.inTarget.setAttribute("type", "text");
        this.pBox.appendChild(this.inTarget);
    }
    this.box = document.createElement("DIV");
    this.box.className = className || "autoCompletion";
    this.pBox.appendChild(this.box);

    this.box.ul = document.createElement("UL");
    this.box.appendChild(this.box.ul);
    this.selectIndex = -1;
    this.dataCount = 0;
    this.datas = [];
    this.maxShowCount = 10;
    this._render();
    AutoCpFactory.autoCps[this.id] = this;
    if (!AutoCpFactory.inited) {
        attachObjEvent(document.body, "onclick", function (e) {
            AutoCpFactory.hideCp();
        });
        AutoCpFactory.inited = 1;
    }
};
/**
 * 销毁对象
 */
meta.ui.autoCompletion.prototype.destructor = function () {
    this.target.autoCp = null;
    detachObjEvent(this.target, "onkeydown", meta.ui.autoCompletion.inputkeydown);
    detachObjEvent(this.target, "onkeyup", meta.ui.autoCompletion.inputkeyup);
    document.body.removeChild(this.pBox);
    AutoCpFactory.autoCps[this.id] = null;
    delete AutoCpFactory.autoCps[this.id];
    if (AutoCpFactory.thisCpId == this.id)
        AutoCpFactory.thisCpId = null;
    Destroy.clearObj(this);
};
/**
 * 清除缓存旧值
 */
meta.ui.autoCompletion.prototype.clearOldValue = function () {
    this.target.oldAutpCpValue = "";
    if (this.inTarget)
        this.inTarget.oldAutpCpValue = "";
    this.clearData();
};
/**
 * 静态方法，事件
 * @param event
 */
meta.ui.autoCompletion.inputkeydown = function (event) {
    event = event || window.event;
    var inp = event.srcElement;
    if (inp && inp.autoCp) {
        var keyCode = event.keyCode;
        if (keyCode == 38) {//向上
            if (inp.autoCp.dataCount == 0)return;
            if (inp.autoCp.selectIndex != -1) {
                inp.autoCp.box.ul.childNodes[inp.autoCp.selectIndex].className = "";
            }
            inp.autoCp.selectIndex--;
            if (inp.autoCp.selectIndex < 0)
                inp.autoCp.selectIndex = inp.autoCp.dataCount - 1;

            inp.autoCp.showHide(true, inp.autoCp.box.style.display == "none");

            if (inp.autoCp.selectIndex + 1 >= inp.autoCp.maxShowCount) {
                inp.autoCp.box.scrollTop = (inp.autoCp.selectIndex - inp.autoCp.maxShowCount + 1) * 25;
            } else
                inp.autoCp.box.scrollTop = 0;

            inp.autoCp.box.ul.childNodes[inp.autoCp.selectIndex].className = "seld";
        } else if (keyCode == 40) {//向下
            if (inp.autoCp.dataCount == 0)return;
            if (inp.autoCp.selectIndex != -1) {
                inp.autoCp.box.ul.childNodes[inp.autoCp.selectIndex].className = "";
            }
            inp.autoCp.selectIndex++;
            if (inp.autoCp.selectIndex >= inp.autoCp.dataCount)
                inp.autoCp.selectIndex = 0;

            inp.autoCp.showHide(true, inp.autoCp.box.style.display == "none");

            if (inp.autoCp.selectIndex + 1 >= inp.autoCp.maxShowCount)
                inp.autoCp.box.scrollTop = (inp.autoCp.selectIndex - inp.autoCp.maxShowCount + 1) * 25;
            else
                inp.autoCp.box.scrollTop = 0;
            inp.autoCp.box.ul.childNodes[inp.autoCp.selectIndex].className = "seld";
        }
    }
};

/**
 * 静态方法，事件
 * @param event
 */
meta.ui.autoCompletion.inputkeyup = function (event) {
    event = event || window.event;
    var inp = event.srcElement;
    if (inp && inp.autoCp) {
        var keyCode = event.keyCode;
        if (keyCode == 13) {
            if (inp.autoCp.selectIndex != -1) {
                inp.autoCp.selectLi();
            } else if (inp.autoCp.targetEnterCall) {
                inp.autoCp.targetEnterCall();
            }
            inp.autoCp.showHide(false);
        } else if (keyCode == 38) {//向上
        } else if (keyCode == 40) {//向下
        } else {
            var value = dwr.util.getValue(inp).trim();
            if (value != inp.oldAutpCpValue) {
                inp.oldAutpCpValue = value;
                if (inp.autoCp.dataQueryFun && (value != "" || inp.autoCp.emptyValueQueryMode)) {
                    inp.autoCp.clearData();
                    DWREngine.setAsync(false);
                    inp.autoCp.dataQueryFun(value,inp.autoCp,inp);
                    DWREngine.setAsync(true);
                } else if (value == "") {
                    inp.autoCp.clearData();
                }
                inp.autoCp.showHide((inp.autoCp.dataCount > 0 && (value != "" || inp.autoCp.emptyValueQueryMode)) || inp.autoCp.inTarget, inp.autoCp.pBox.style.display == "none");
                if (inp.autoCp.targetValueChangeCall)
                    inp.autoCp.targetValueChangeCall(value,inp.autoCp);
            } else {
                inp.autoCp.showHide((inp.autoCp.dataCount > 0 && (value != "" || inp.autoCp.emptyValueQueryMode)) || inp.autoCp.inTarget, inp.autoCp.pBox.style.display == "none");
            }
        }
    }
};

/**
 * 初始绘制，绑定相关事件
 */
meta.ui.autoCompletion.prototype._render = function (flag) {
    if (!flag && this.rendered)return;
    this.target.autoCp = this;
    if (this.inTarget) {
        this.inTarget.autoCp = this;
        attachObjEvent(this.inTarget, "onkeydown", meta.ui.autoCompletion.inputkeydown);
        attachObjEvent(this.inTarget, "onkeyup", meta.ui.autoCompletion.inputkeyup);
    }
    attachObjEvent(this.target, "onkeydown", meta.ui.autoCompletion.inputkeydown);
    attachObjEvent(this.target, "onkeyup", meta.ui.autoCompletion.inputkeyup);
    if (this.inTarget) {
        attachObjEvent(this.inTarget, "onclick", function (e) {
            e = e || window.event;
            e.cancelBubble = true;
        });
    }
    this.rendered = true;
};
/**
 * 清除数据
 */
meta.ui.autoCompletion.prototype.clearData = function () {
    if(dhx.env.isIE){
        for (var i = 0; i < this.box.ul.childNodes.length; i++) {
            this.box.ul.removeChild(this.box.ul.childNodes[i--]);
        }
    }else{
        //innerHTML IE下效率低下
        this.box.ul.innerHTML = "";
    }
    this.selectIndex = -1;
    this.dataCount = 0;
    this.datas = [];
};
/**
 * 设置数据
 * @param datas
 */
meta.ui.autoCompletion.prototype.setDatas = function (datas) {
    this.clearData();
    if (datas && datas.length) {
        this.setMaxHeightByCount(datas.length);
        for (var i = 0; i < datas.length; i++)
            this.appendData(datas[i]);
    }
};
/**
 * 设置userData回调函数
 * @param fun
 */
meta.ui.autoCompletion.prototype.setUserDataCallBack = function (fun) {
    this.userDataCallBack = fun;
};

/**
 * 追加一条记录
 * @param data
 */
meta.ui.autoCompletion.prototype.appendData = function (data, idx, params) {
    if (idx == null || idx == undefined)
        idx = this.dataCount;
    this.dataCount++;
    var li = document.createElement("LI");
    this.datas[this.datas.length] = data;
    var txt = data.replace(getReplaceStrReg(this.inTarget ? (this.inTarget.oldAutpCpValue || "") : (this.target.oldAutpCpValue || ""),1), function (s) {
        return "<span style='color:red'>" + s + "</span>";
    });
    if (this.userDataCallBack) {
        li.userData = this.userDataCallBack.call(this, params, data);
    }
    this.box.ul.appendChild(li);
    li.innerHTML = txt;
    li.setAttribute("title",data);
    li.title = data;
    li.setAttribute("idx", idx);
    li.autoCp = this;
    attachObjEvent(li, "onclick", function (e) {
        e = e || window.event;
        var _li = e.srcElement;
        if (_li && _li.tagName == "SPAN") {
            _li = _li.parentNode;
        }
        if (_li && _li.autoCp) {
            _li.autoCp.selectLi(_li.getAttribute("idx"));
        }
    });
    attachObjEvent(li, "onmouseover", function (e) {
        e = e || window.event;
        var _li = e.srcElement;
        if (_li && _li.tagName == "SPAN") {
            _li = _li.parentNode;
        }
        if (_li && _li.autoCp) {
            if (_li.autoCp.selectIndex != -1)
                _li.autoCp.box.ul.childNodes[_li.autoCp.selectIndex].className = "";
            _li.className = "seld";
            _li.autoCp.selectIndex = _li.getAttribute("idx");
        }
    });
    attachObjEvent(li, "onmouseout", function (e) {
        e = e || window.event;
        var _li = e.srcElement;
        if (_li && _li.autoCp) {
            if (_li.autoCp.selectIndex != -1)
                _li.autoCp.box.ul.childNodes[_li.autoCp.selectIndex].className = "";
            _li.autoCp.selectIndex = -1;
        }
    });
};
/**
 * 值设置之后的回调函数
 * @param fun
 */
meta.ui.autoCompletion.prototype.setValueCallBack = function (fun) {
    this.valueCallBack = fun;
};
/**
 * 选择一项
 * @param idx
 */
meta.ui.autoCompletion.prototype.selectLi = function (idx) {
    if (idx == null || idx == undefined)
        idx = this.selectIndex;
    if (idx < 0 || idx >= this.box.ul.childNodes.length) {
        dwr.util.setValue(this.target, "");
        return;
    }
    if(this.target.type == "text"){
        this.target.value = this.datas[idx];
    }else{
        dwr.util.setValue(this.target, this.datas[idx]);
    }
    var li = this.box.ul.childNodes[idx];
    li.className = "";
    if (this.valueCallBack) {
        this.valueCallBack.call(this, this.datas[idx], li.userData,this.target);
    }
    this.showHide(false);
};
/**
 * 显示隐藏BOX
 * @param mode
 */
meta.ui.autoCompletion.prototype.showHide = function (mode, flag) {
    this.pBox.style.display = mode ? "block" : "none";
    if (mode) {
        if (AutoCpFactory.thisCpId != this.id) {
            AutoCpFactory.hideCp();
            AutoCpFactory.thisCpId = this.id;
        }
    }
    if (!mode) {
        if (this.selectIndex != -1)
            this.box.ul.childNodes[this.selectIndex].className = "";
        this.selectIndex = -1;
    }
    if (mode && (this.selectIndex == -1 || flag)) {
        this.pBox.style.width = (this.posTarget || this.target).offsetWidth + (this.widthPy || 0) + "px";
        if (this.inTarget) {
            this.inTarget.style.width = this.pBox.offsetWidth - 6 + "px";
        }
        var ps = autoPosition(this.pBox, this.posTarget || this.target, false);
        if (this.lPy)
            this.pBox.style.left = ps.left + this.lPy + "px";
        if (this.tPy)
            this.pBox.style.top = ps.top + this.tPy + "px";
    }
};
/**
 * 设置定位目标参照对象，默认为target
 * @param el
 */
meta.ui.autoCompletion.prototype.setPosTarget = function (el) {
    this.posTarget = $(el);
};
/**
 * 设置位置偏移
 * @param lpy
 * @param tpy
 */
meta.ui.autoCompletion.prototype.setPositionPy = function (lpy, tpy) {
    this.lPy = parseInt(lpy || 0);
    this.tPy = parseInt(tpy || 0);
};
/**
 * 设置宽度偏移
 * @param widthPy
 */
meta.ui.autoCompletion.prototype.setWidthPy = function (widthPy) {
    this.widthPy = parseInt(widthPy || 0);
};
/**
 * 根据记录数设置最大高度，默认是10条记录的高度超过时将出现滚动条
 * 最大高度 = 数目 * 每个项占的高度25px + 上下边框2px
 * @param count
 */
meta.ui.autoCompletion.prototype.setMaxHeightByCount = function (count) {
    count = parseInt(count);
    this.maxShowCount = Math.min(count, 15);
    this.box.style.maxHeight = Math.abs(this.maxShowCount) * 25 + 2 + "px";
};
/**
 * 设置数据查询回调接口
 * 此回调一个参数，即target框的值
 */
meta.ui.autoCompletion.prototype.setDataQueryFun = function (fun) {
    if (fun && typeof(fun) == "function")
        this.dataQueryFun = fun;
};
/**
 * 设置输入框回车事件
 */
meta.ui.autoCompletion.prototype.setTargetEnterCall = function (fun) {
    if (fun && typeof(fun) == "function")
        this.targetEnterCall = fun;
};
/**
 * 输入框值改变事件
 * 此回调一个参数，即target框的值
 */
meta.ui.autoCompletion.prototype.setTargetValueChange = function (fun) {
    if (fun && typeof(fun) == "function")
        this.targetValueChangeCall = fun;
};
/**
 * 组件默认是，当value为空时，不触发跟随事件，此参数设置为true时，则value为空也会触发跟随事件
 * @param mode
 */
meta.ui.autoCompletion.prototype.setEmptyValueQueryMode = function (mode) {
    this.emptyValueQueryMode = !!mode;
};
/**
 * 设置目标控件单击时，显示数据列表层
 * @param mode 1显示，0不显示
 */
meta.ui.autoCompletion.prototype.setTargetClickShow = function (mode) {
    this.clickShow = !!mode;
    if (this.clickShow && !this.clickShowFun) {
        this.clickShowFun = function (e) {
            e = e || window.event;
            if (e.srcElement && e.srcElement.autoCp) {
                e.srcElement.autoCp.showHide(e.srcElement.autoCp.dataCount > 0 || e.srcElement.autoCp.inTarget, e.srcElement.autoCp.pBox.style.display == "none");
                e.cancelBubble = true;
                if (e.srcElement.autoCp.inTarget && e.srcElement.autoCp.pBox.style.display != "none") {
                    e.srcElement.autoCp.inTarget.value = '';
                    e.srcElement.autoCp.inTarget.focus();
                }

            }
        };
        attachObjEvent(this.target, "onclick", this.clickShowFun);
    } else if (!this.clickShow && this.clickShowFun) {
        detachObjEvent(this.target, "onclick", this.clickShowFun);
        this.clickShowFun = null;
    }
};


/**
 * 排序工具条
 * @param dv
 * @fields 排序字段信息数组，格式如下：
 * [
 *   {id:'CREATE_TIME',mode:0,name:'创建时间'},
 *   {id:'RPT_CNT',mode:0,name:'应用数'},
 *   {id:'GDL_NAME',mode:1,name:'名称'}
 * ]
 */
meta.ui.SortBar = function (dv, fields) {
    this.dv = dv;
    if (typeof(this.dv) == "string")
        this.dv = document.getElementById(this.dv);
    if (!this.dv.title)
        this.dv.title = "排序工具条";
    if (!this.dv.className)
        this.dv.className = "sortdivbar";
    else if (this.dv.className != "sortdivbar" && this.dv.className.indexOf("sortdivbar") != -1) {
        this.dv.className = this.dv.className + " sortdivbar";
    }
    this.orderField = {};//排序字段
    this.currentField = null;//当前处于活动状态的排序字段
    this._render(fields);
};
meta.ui.SortBar.prototype._render = function (fields) {
    if (fields && fields.length) {
        for (var i = 0; i < fields.length; i++) {
            this.appendSortField(fields[i]);
        }
    }
};
/**
 * 添加一个排序字段
 * @param field  格式：{id:'CREATE_TIME',mode:0,name:'创建时间'}
 */
meta.ui.SortBar.prototype.appendSortField = function (field) {
    if (field && field["id"] && !this.orderField[field["id"]]) {
        this.orderField[field["id"]] = {
            name:field["name"],
            mode:field["mode"] ? "ASC" : "DESC"
        };
        var sp = document.createElement("SPAN");
        sp.id = "sort_" + this.dv.id + "_" + field["id"];
        sp.className = field.mode ? "sort-hs" : "sort-hx";
        sp.innerHTML = field["name"];
        sp.title = field.tip || ("根据【" + field["name"] + "】排序");
        if (field["hide"])
            sp.style.display = "none";
        this.dv.appendChild(sp);
        sp.setAttribute("field", field["id"]);
        sp.sortBar = this;
        attachObjEvent(sp, "onclick", function (e) {
            e = e || window.event;
            if (e.srcElement && e.srcElement.getAttribute("field")) {
                e.srcElement.sortBar.sortField(e.srcElement.getAttribute("field"));
            }
        });
    }
};

/**
 * 排序某个字段
 * @param fieldId
 */
meta.ui.SortBar.prototype.sortField = function (fieldId, noCall) {
    if (fieldId == this.currentField) {
        //不换字段，将现字段换向
        var sp = document.getElementById("sort_" + this.dv.id + "_" + this.currentField);
        if (this.orderField[this.currentField]["mode"] == "ASC") {
            sp.className = "sort-cx";
            this.orderField[this.currentField]["mode"] = "DESC";
        } else {
            sp.className = "sort-cs";
            this.orderField[this.currentField]["mode"] = "ASC";
        }
    } else {
        //换字段
        if (this.currentField) {
            //将原字段换色
            var odsp = document.getElementById("sort_" + this.dv.id + "_" + this.currentField);
            odsp.className = (this.orderField[this.currentField]["mode"] == "ASC" ? "sort-hs" : "sort-hx");
        }
        //将现字段换色
        this.currentField = fieldId;
        if (this.currentField) {
            var ndsp = document.getElementById("sort_" + this.dv.id + "_" + this.currentField);
            ndsp.className = (this.orderField[this.currentField]["mode"] == "ASC" ? "sort-cs" : "sort-cx");
        }
    }
    if (this.sortCall && !noCall) {
        this.sortCall(this.currentField, this.orderField[this.currentField]["mode"]);
    }
};
/**
 * 排序回调
 * @param fun 支持两个参数，arg0排序字段，arg1排序方向
 */
meta.ui.SortBar.prototype.setSortCall = function (fun) {
    if (fun && typeof(fun) == "function")
        this.sortCall = fun;
};
/**
 * 显示或隐藏某字段
 * @param fieldId
 * @param mode  0隐藏，1显示
 */
meta.ui.SortBar.prototype.showHideFiled = function (fieldId, mode) {
    var sp = document.getElementById("sort_" + this.dv.id + "_" + fieldId);
    sp.style.display = mode ? "inline-block" : "none";
    if (!mode) {
        if (this.currentField == fieldId)
            this.sortField("", 1);
    }
};

/**
 * 富文本编辑器组件
 * @param parId
 */
meta.ui.RichText = function(parId,cfg){
    this.uid = meta.ui.getUID();
    this.pdiv = $(parId);
    this.width = this.pdiv.offsetWidth || 700;
    this.height = this.pdiv.offsetHeight || 350;
    if(cfg && typeof(cfg=="object")){
        dhx.extend(this,cfg,true);
    }
    this.editorFm = document.createElement("iframe");
    this.editorFm.style.width = "100%";
    this.editorFm.style.height = "100%";
    this.editorFm.frameBorder = 0;
    this.editorFm.scrolling = "no";
    var url = getBasePath()+"/meta/public/richEditor/richEditor.jsp?cfg={" +
        "width:"+this.width+
        ",height:"+this.height+
        this.getUrlPar()+
        "}&dateno="+new Date().getTime();
    this.editorFm.src = encodeURI(url);
    this.pdiv.appendChild(this.editorFm);
    this.editor = this.editorFm.contentWindow;
};
meta.ui.RichText.prototype.destructor = function(){};

/**
 * 获取值
 */
meta.ui.RichText.prototype.getValue = function(flag){
    this.htmlVal = this.editor.getHTMLValue(flag);
    return this.htmlVal;
};

/**
 * 设置值
 * @param val
 */
meta.ui.RichText.prototype.setValue = function(val){
    if(this.editor.setHTMLValue){
        return this.editor.setHTMLValue(val);
    }else{
        var that = this;
        setTimeout(function(){
            that.setValue(val);
        },100);
    }
};

/**
 * 设置excel数据检查规则
 * @param rule
 */
meta.ui.RichText.prototype.setDataRule = function(rule){
    if(this.editor.setCheckData){
        return this.editor.setCheckData(rule);
    }else{
        var that = this;
        setTimeout(function(){
            that.setDataRule(rule);
        },100);
    }
};

/**
 * 设置焦点选中
 * @param rule
 */
meta.ui.RichText.prototype.editorFocus = function(){
    if(this.editor.editorFocus){
        return this.editor.editorFocus();
    }else{
        var that = this;
        setTimeout(function(){
            that.editorFocus();
        },100);
    }
};

/**
 * 获取url附加参数
 */
meta.ui.RichText.prototype.getUrlPar = function(){
    return "";
};

/**
 * 快捷录入组件
 * 通过富文本接收从外部文件复制的数据，解析成平台系统需要的结构化数据
 * 如，在创建表时需要输入很多字段信息，此组件可接收外部excel复制的表格数据，解析成前端界面的数据；
 * @param mode 模式【win:窗体，div:非窗体】
 * @param cfg 配置信息
 */
meta.ui.ShortcutInput = function(mode,cfg){
    this.uid = meta.ui.getUID();
    this.mode = mode || "win";
    this.width = 700;
    this.height = 450;
    this.winMode = false;
    this.dataRule = {};
    if(cfg && typeof(cfg=="object")){
        dhx.extend(this,cfg,true);
    }
    this.initMsg = "";
    if(this.initMsg){
        alert(this.initMsg);
    }
};
meta.ui.ShortcutInput.prototype.destructor = function(){
    Destroy.destructorDHMLX(this.importWin);
};

/**
 * 绘制
 */
meta.ui.ShortcutInput.prototype._render = function(){
    if(this.mode=="win"){
        this.ipwCDIVID = "ipwc_"+this.uid;
        //窗体布局div
        this.ipwDIV = document.createElement("DIV");
        this.ipwDIV.className = "ipwwin";
        this.ipwDIV.id = "ipw_"+this.uid;
        document.body.appendChild(this.ipwDIV);
        //富文本div
        this.ipwCDIV = document.createElement("DIV");
        this.ipwCDIV.className = "ipwcont";
        this.ipwCDIV.id = this.ipwCDIVID;
        this.ipwDIV.appendChild(this.ipwCDIV);
        //提示信息div
        this.ipwTDIV = document.createElement("DIV");
        this.ipwTDIV.className = "ipwtip";
        this.ipwTDIV.id = "ipwt_"+this.uid;
        this.ipwDIV.appendChild(this.ipwTDIV);
        if(this.tipInfo){
            this.ipwTDIV.innerHTML = this.tipInfo;
        }else{
            this.ipwTDIV.innerHTML = "提示:部分特殊格式列表类数据可从Excel复制列表表格";
        }
        this.ipwTDIV.title = "如果从Excel复制数据，可点击工具栏设置行列索引\n特别注意录入数据是否包含列头或行头";
        //按钮div
        this.ipwBDIV = document.createElement("DIV");
        this.ipwBDIV.className = "ipwbtn";
        this.ipwBDIV.id = "ipwb_"+this.uid;
        this.ipwDIV.appendChild(this.ipwBDIV);
        //确认按钮
        this.ok = document.createElement("INPUT");
        this.ok.type = "button";
        this.ok.className = "btn_2";
        this.ok.value = "确定";
        this.ok.scIpt = this;
        this.ipwBDIV.appendChild(this.ok);
        //取消按钮
        this.cel = document.createElement("INPUT");
        this.cel.type = "button";
        this.cel.className = "btn_2";
        this.cel.value = "取消";
        this.cel.scIpt = this;
        this.ipwBDIV.appendChild(this.cel);
        this.importWin = DHTMLXFactory.createWindow(this.uid+"IWS",this.uid+"IW", 0, 0, this.width, this.height);
        this.importWin.stick();
        this.importWin.denyResize();
        this.importWin.denyPark();
        this.importWin.button("minmax1").hide();
        this.importWin.button("park").hide();
        this.importWin.button("stick").hide();
        this.importWin.button("sticked").hide();
        this.importWin.center();
        this.importWin.setText("帮助快捷录入");
        this.importWin.keepInViewport(true);
        this.importWin.attachObject(this.ipwDIV);
        this.importWin.hide();
        this.importWin.attachEvent("onClose",function(){
            this.setModal(false);
            this.hide();
            return false;
        });

        attachObjEvent(this.ok ,"onclick",function(e){
            e = e || window.event;
            if(e.srcElement && e.srcElement.scIpt){
                e.srcElement.scIpt.data = e.srcElement.scIpt.getData();
                e.srcElement.scIpt.close();
                if(e.srcElement.scIpt.okCall){
                    e.srcElement.scIpt.okCall(e.srcElement.scIpt);
                }
            }
        });
        attachObjEvent(this.cel ,"onclick",function(e){
            e = e || window.event;
            if(e.srcElement && e.srcElement.scIpt){
                e.srcElement.scIpt.close();
            }
        });
    }else{
        if(!this.parId){
            this.initMsg += " 缺少参数parId;";
        }
        this.ipwCDIVID = this.parId;
    }
    this.richText = new meta.ui.RichText(this.ipwCDIVID,{width:this.width,height:this.height-(this.mode=="win"?50:0)});
    this.rendered = 1;
};

/**
 * shezhi 提示区域信息
 * @param info
 */
meta.ui.ShortcutInput.prototype.setTipInfo = function(info){
    this.tipInfo = info;
    if(this.ipwTDIV){
        this.ipwTDIV.innerHTML = this.tipInfo;
    }
};

/**
 * 打开
 * @param tit 窗体标题
 */
meta.ui.ShortcutInput.prototype.show = function(tit){
    if(!this.rendered){
        this._render();
        this.richText.setDataRule(this.dataRule);
    }else{
        this.richText.editor.setCheckData(this.dataRule,1);
    }
    if(!this.importWin){
        alert("importWin未初始!");
        return;
    }
    this.importWin.show();
    this.importWin.setModal(this.winMode);
    if(tit){
        this.importWin.setText(tit);
    }
    this.richText.editorFocus();
};

/**
 * 关闭
 * @param data
 */
meta.ui.ShortcutInput.prototype.close = function(){
    if(!this.importWin){
        alert("importWin未初始!");
        return;
    }
    this.importWin.close();
};

/**
 * 加载数据
 * @param data
 * @param nullClear 为空时是否清除
 */
meta.ui.ShortcutInput.prototype.parseData = function(data,nullClear){
    if(data){
        this.richText.setValue(data);
    }else{
        if(nullClear){
            this.richText.setValue("");
        }
    }
};

/**
 * 设置数据规则
 * @param rule 按规则解析数据
 * {
 * //最终获取数据类型要求[
 * //                 arrayarray:二维数组，
 * //                 array:数组，
 * //                 groupmaparray:map分组数组，按表格某列分组，
 * //                 maparray:hash对象数组
 * //                 ]
 *  type:arrayarray,
 *  dataTemp:{},数据模板指示了返回数据的基本格式，以及各格式取值的表格索引
 * }
 */
meta.ui.ShortcutInput.prototype.setDataRule = function(rule){
    this.dataRule = rule;
    if(this.richText){
        this.richText.setDataRule(rule);
    }
};

/**
 * 获取解析数据
 */
meta.ui.ShortcutInput.prototype.getData = function(){
    if(!this.getDataFun){
        //不存在自定义解析数据（默认实现）
        this.dr = this.richText.editor.getDataRule();
        if(this.dr){
            var doc = this.richText.editor.document;
            var htmlStr = this.richText.getValue(1);
            var tab = doc.getElementsByName("excelTab");
            if(tab.length>1){
                dhx.alert("只能存在一个表格!");
                return;
            }else if(tab.length==0){
                this.close();
                return htmlStr;
            }
            tab = tab[0];

            //读取数据
            var tmpRow = [];
            var ridx = 0;
            var cidx = 0;
            var maxCLen = 0;
            for(var i=0;i<tab.rows.length;i++){
                var tr = tab.rows[i];
                var cl = tr.cells.length;
                var lastC = 0;
                for(var j=0;j<cl;j++){
                    var td = tr.cells[j];
                    var rowSpan= td.getAttribute("rowSpan") ? parseInt(td.getAttribute("rowSpan")) : 1;
                    var colSpan= td.getAttribute("colSpan") ? parseInt(td.getAttribute("colSpan")) : 1;
                    var val = td.innerText.replaceAll("　"," ").trim().replaceAll("\n","");
                    if(i==0){
                        maxCLen+=colSpan;
                    }
                    var minC = -1;
                    for(var x=0;x<rowSpan;x++){
                        ridx = i+x;
                        tmpRow[ridx] = tmpRow[ridx] || [];
                        for(var k=lastC;k<maxCLen;k++){
                            //此列跨行时未被覆盖不在
                            if(k<minC){continue;}
                            if(tmpRow[ridx][k]==null || tmpRow[ridx][k]==undefined){
                                for(var y=0;y<colSpan;y++){
                                    cidx = k+y;
                                    tmpRow[ridx][cidx] = val;
                                    if(minC<0){
                                        minC = cidx;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    lastC = cidx;
                }
            }

            //过滤行列范围
            var arr = [];
            var m=0;
            for(var i=this.dr.startR-1;i<Math.min(this.dr.endR,tmpRow.length);i++){
                var tmparr = tmpRow[i];
                var n=0;
                for(var j=this.dr.startC-1;j<Math.min(this.dr.endC,tmparr.length);j++){
                    arr[m] = arr[m]||[];
                    arr[m][n] = tmparr[j];
                    n++;
                }
                m++;
            }
            //行列转换
            var tmd = arr;
            if(this.dr.readType.toUpperCase()!="ROW"){
                tmd = [];
                for(var i=0;i<arr.length;i++){
                    for(var j=0;j<arr[i].length;j++){
                        tmd[j] = tmd[j] || [];
                        tmd[j][i] = arr[i][j];
                    }
                }
            }
            //组装字段映射
            var retdata = tmd;
            var colidx = {};
            if(this.dr["colIndex"]){
                retdata = [];
                for(var k in this.dr["colIndex"]){
                    var idx = this.dr["colIndex"][k];
                    idx = idx - (this.dr.readType.toUpperCase()!="ROW"?this.dr.startR:this.dr.startC);
                    colidx[k] = idx;
                }

                for(var i=0;i<tmd.length;i++){
                    var arr = tmd[i];
                    var tar = [];
                    for(var k in colidx){
                        var idx = colidx[k];
                        if(arr[idx]!=null && arr[idx]!=undefined){
                            tar[k] = arr[idx];
                        }else{
                            alert("属性关系索引设置错误，找不到对应的索引【"+(this.dr.readType.toUpperCase()!="ROW"?"行":"列")+"】；" +
                                "\n请检查起始行列范围等!");
                            return [];
                        }
                    }
                    retdata[i] = tar;
                }
            }
            return retdata;
        }
    }else{
        return this.getDataFun(this,this.richText.getValue());
    }
};

/**
 * 自定义解析数据
 */
meta.ui.ShortcutInput.prototype.setDefineGetDataFun = function(fun){
    if(fun && typeof(fun)=="function")
        this.getDataFun = fun;
};

/**
 * 设置点击确定按钮回调函数
 * @param fun
 */
meta.ui.ShortcutInput.prototype.setOkCall = function(fun){
    if(fun && typeof(fun)=="function")
        this.okCall = fun;
};

/**
 * 设置弹出窗模式
 * @param mode
 */
meta.ui.ShortcutInput.prototype.setWinMode = function(mode){
    this.winMode = !!mode;
};


/**
 * 弹出选择组件。
 * 某个界面事件触发弹出一个win，win里面的内容为可选择一系列元素，win下方有确定按钮，点击确定按钮将选择的值返回界面
 */
meta.ui.PopSelectWin = function(){
    this.uid = meta.ui.getUID();
    this.width = 700;
    this.height = 450;
    this.winMode = true;
    this.checkedVal = {};
};
meta.ui.PopSelectWin.prototype.destructor = function(){
    Destroy.destructorDHMLX(this.popWin);
    Destroy.destructorDHMLX(this.dataTable);
    this.checkedVal = {};
    this.rendered = 1;
};

/**
 * 设置弹出窗模式
 * @param mode
 */
meta.ui.PopSelectWin.prototype.setWinMode = function(mode){
    this.winMode = !!mode;
};

/**
 * 绘制
 */
meta.ui.PopSelectWin.prototype._render = function(){
    if(!this.popWin){
        this.popCDIVID = "popc_"+this.uid;

        //窗体布局div
        this.popDIV = document.createElement("DIV");
        this.popDIV.className = "popwin";
        this.popDIV.id = "pop_"+this.uid;
        document.body.appendChild(this.popDIV);
        //cond div
        this.popQDIV = document.createElement("DIV");
        this.popQDIV.className = "popquery";
        this.popQDIV.id = "popq_"+this.uid;
        this.popDIV.appendChild(this.popQDIV);
        //grid div
        this.popCDIV = document.createElement("DIV");
        this.popCDIV.className = "popcont";
        this.popCDIV.id = this.popCDIVID;
        this.popDIV.appendChild(this.popCDIV);
        //按钮div
        this.popBDIV = document.createElement("DIV");
        this.popBDIV.className = "popbtn";
        this.popBDIV.id = "popb_"+this.uid;
        this.popDIV.appendChild(this.popBDIV);

        //选择按钮
        this.ok = document.createElement("INPUT");
        this.ok.type = "button";
        this.ok.className = "btn_2";
        this.ok.value = "选择";
        this.ok.pop = this;
        this.popBDIV.appendChild(this.ok);
        //取消按钮
        this.cel = document.createElement("INPUT");
        this.cel.type = "button";
        this.cel.className = "btn_2";
        this.cel.value = "取消";
        this.cel.pop = this;
        this.popBDIV.appendChild(this.cel);
        this.popWin = DHTMLXFactory.createWindow(this.uid+"PWS",this.uid+"PW", 0, 0, this.width, this.height);

        this.popWin.stick();
        this.popWin.denyResize();
        this.popWin.denyPark();
        this.popWin.button("minmax1").hide();
        this.popWin.button("park").hide();
        this.popWin.button("stick").hide();
        this.popWin.button("sticked").hide();
        this.popWin.center();
        this.popWin.setText("选择");
        this.popWin.keepInViewport(true);
        this.popWin.attachObject(this.popDIV);
        this.popWin.hide();
        this.popWin.attachEvent("onClose",function(){
            this.setModal(false);
            this.hide();
            return false;
        });

        attachObjEvent(this.ok ,"onclick",function(e){
            e = e || window.event;
            if(e.srcElement && e.srcElement.pop){
                var d = e.srcElement.pop.getSelData();
                if(d){
                    e.srcElement.pop.data = d;
                    e.srcElement.pop.close();
                    if(e.srcElement.pop.okCall){
                        e.srcElement.pop.okCall(e.srcElement.pop);
                    }
                }
            }
        });
        attachObjEvent(this.cel ,"onclick",function(e){
            e = e || window.event;
            if(e.srcElement && e.srcElement.pop){
                e.srcElement.pop.close();
            }
        });

        this.rendered = 1;
    }
};

/**
 * 关闭
 */
meta.ui.PopSelectWin.prototype.close = function(){
    this.popWin.close();
};

/**
 * 关闭
 */
meta.ui.PopSelectWin.prototype.show = function(tit){
    if(!this.rendered){
        this._render();
    }
    this.popWin.show();
    this.popWin.setModal(this.winMode);
    if(tit){
        this.popWin.setText(tit);
    }
    this.queryData();
};

/**
 * 获取选择的数据
 */
meta.ui.PopSelectWin.prototype.getSelData = function(){
    var i = 0;
    for(var k in this.checkedVal){
        i++;
    }
    if(i==0){
        dhx.alert("请选择!");
        return null;
    }
    return this.checkedVal;
};

/**
 * 查询数据
 */
meta.ui.PopSelectWin.prototype.queryData = function(){
    if(!this.dataTable){
        this.initDataTable();
    }
    this.dataTable.Page.currPageNum = 1;
    this.dataTable.refreshData();
};

/**
 * 设置表格配置 包括如下参数
 * COL_MAP：列map
 * COL_VAL_KEY：列map对应的字段
 * COL_WIDTH：表格宽度分配（包含首列checkbox的）
 * PAGE_SIZE： 分页
 * muSel：多选
 * CONDTIONS：其他条件,   如：{DATA_SOURCE_ID:{KEY_NAME:"数据源",TYPE:"SELECT,DATAS:[[]]}}
 *   key:条件key
 *   value:条件对象类型，值等
 *   会自动初始一个关键字作为查询条件
 *
 * CLASS_NAME：查询对应的后台类，必须实现com.ery.meta.common.term.TermDataService.queryDataTable方法
 * QUERY_SQL：查询sql，查询字段必须包含val,val_name（与className必须存在2选1，当sql存在时，后台默认通用的PopQueryServiceImpl实现）
 * EXT_PARAMS：扩展参数，可以是一个函数，可以是一个对象
 */
meta.ui.PopSelectWin.prototype.setDataTableCfg = function(cfg){
    this.dtcfg = cfg;
};

/**
 *  初始查询表格
 */
meta.ui.PopSelectWin.prototype.initDataTable = function(){
    if(!this.dataTable){
        this.dtcfg = this.dtcfg || {};
        this.dataTable = new meta.ui.DataTable($(this.popCDIVID));
        var colMap = {};
        colMap["CHOOSE"] = this.dtcfg["muSel"]?"{#checkBox}":"选择";
        var colNum = 1;
        for(var k in this.dtcfg["COL_MAP"]){
            colMap[k] = this.dtcfg["COL_MAP"][k];
            colNum ++;
        }
        this.dataTable.setColumns(colMap,this.dtcfg["COL_VAL_KEY"]);
        var ps = this.dtcfg["PAGE_SIZE"];
        if(ps==0){
            this.dataTable.setPaging(false);
        }else{
            this.dataTable.setPaging(true,ps||15);
        }

        this.dataTable.setRowIdForField("VAL");
        this.dataTable.render();
        var wp = this.dtcfg["COL_WIDTH"]||"";
        if(!wp){
            wp = "6";
            for(var i=0;i<colNum-1 ;i++){
                wp += "," + parseInt((100-6)/(colNum-1));
            }
        }
        this.dataTable.grid.setInitWidthsP(wp);
        this.dataTable.setGridColumnCfg(0,{type:this.dtcfg["muSel"]?"ch":"ra",align:"center"});
        this.dataTable.setGridColumnCfg(colNum-1,{align:"left",tip:true});
        this.dataTable.pop = this;
        if(this.dtcfg["muSel"]){
            this.dataTable.grid.setHeaderCheckBoxCall(function(grid,state){
                var dt = grid.MetaDataTable;
                var ridstr = grid.getAllRowIds();
                if(ridstr=='')return;
                var rids = ridstr.split(",");
                for(var i=0;i<rids.length;i++){
                    if(state){
                        dt.pop.checkedVal[rids[i]] = dt.getUserData(rids[i]);
                    }else{
                        dt.pop.checkedVal[rids[i]] = null;
                        delete dt.pop.checkedVal[rids[i]];
                    }
                }
            });
        }else{
            this.dataTable.grid.attachEvent("onRowSelect", function(rid,cid){
                var dt = this.MetaDataTable;
                dt.pop.checkedVal = {};
                dt.pop.checkedVal[rid] = dt.getUserData(rid);
                this.cells(rid,0).setValue(1);
            });
        }
        this.dataTable.grid.attachEvent("onCheck", function(rid,cInd,state){
            var dt = this.MetaDataTable;
            if(state){
                if(!(dt.pop.dtcfg["muSel"])){
                    dt.pop.checkedVal = {};
                }
                dt.pop.checkedVal[rid] = dt.getUserData(rid);
            }else{
                dt.pop.checkedVal[rid] = null;
                delete dt.pop.checkedVal[rid];
            }
        });
        this.dataTable.setFormatCellCall(function(rid,cid,data,colId,dt){
            if(colId=="CHOOSE"){
                if(dt.pop.checkedVal[rid]){
                    dt.pop.checkedVal[rid] = dt.getUserData(rid);
                    return 1;
                }
                return 0;
            }
            return data[cid];
        });

        //构造查询条件
        var str = "";
        if(this.dtcfg["CONDTIONS"]){
            for(var k in this.dtcfg["CONDTIONS"]){
                switch (this.dtcfg["CONDTIONS"][k]["TYPE"]){
                    case "select":
                        str += this.dtcfg["CONDTIONS"][k]["KEY_NAME"]+":<select id='dtk_"+k+"_"+this.uid+"'>";
                        for(var i=0;i<this.dtcfg["CONDTIONS"][k]["DATAS"].length;i++){
                            str += "<option value='"+this.dtcfg["CONDTIONS"][k]["DATAS"][i][0]+"'>"+this.dtcfg["CONDTIONS"][k]["DATAS"][i][1]+"</option>";
                        }
                        str += "</select>";
                        break;
                    default :
                        str += this.dtcfg["CONDTIONS"][k]["KEY_NAME"]+":<input type='text' id='dtk_"+k+"_"+this.uid+"'>";
                        break;
                }
            }
        }
        str += "关键字:<input type='text' id='dtkwd_"+this.uid+"'>";
        str += "<input type='button' id='dtcbtn_"+this.uid+"' class='btn_2' value='查询'>&nbsp;<input type='button' id='dtcclr_"+this.uid+"' class='btn_2' value='清除'>";
        this.popQDIV.innerHTML = str;
        $("dtkwd_"+this.uid).pop = this;
        $("dtcbtn_"+this.uid).pop = this;
        $("dtcclr_"+this.uid).pop = this;
        attachObjEvent($("dtkwd_"+this.uid),"onkeyup",function(e){
            e = e || window.event;
            if (e.keyCode == 13 && e.srcElement.pop) {
                e.srcElement.pop.firstMode = 0;
                e.srcElement.pop.dataTable.refreshData();
            }
        });
        attachObjEvent($("dtcbtn_"+this.uid),"onclick",function(e){
            e = e || window.event;
            if (e.srcElement.pop) {
                e.srcElement.pop.dataTable.Page.currPageNum = 1;
                e.srcElement.pop.firstMode = 0;
                e.srcElement.pop.dataTable.refreshData();
            }
        });
        attachObjEvent($("dtcclr_"+this.uid),"onclick",function(e){
            e = e || window.event;
            if (e.srcElement.pop) {
                $("dtkwd_"+e.srcElement.pop.uid).value = "";
                e.srcElement.pop.dataTable.Page.currPageNum = 1;
                e.srcElement.pop.checkedVal={};
                e.srcElement.pop.firstMode = 0;
                e.srcElement.pop.dataTable.refreshData();
            }
        });


        this.dataTable.setReFreshCall(function(dt,params){
            var pop = dt.pop;
            var pm = {};
            pm["CLASS_NAME"] = pop.dtcfg["CLASS_NAME"] || "com.ery.meta.common.term.PopQueryServiceImpl";
            pm["QUERY_SQL"] = pop.dtcfg["QUERY_SQL"];
            pm["_KEY_WORD"] = $("dtkwd_"+pop.uid).value;
            var extPar = pop.dtcfg["EXT_PARAMS"];
            if(extPar){
                if(typeof(extPar)=="function"){
                    pm["EXT_PARAMS"] = extPar();
                }else{
                    pm["EXT_PARAMS"] = extPar;
                }
            }
            if(pop.dtcfg['CONDTIONS']){
                var ks = "";
                for(var k in pop.dtcfg['CONDTIONS']){
                    pm[k] = $("dtk_"+k+"_"+pop.uid).value;
                    ks += k+",";
                }
                if(ks){
                    pm["COND_KEY"] = ks.substring(0,ks.length-1);
                }
            }
            if(pop.dtcfg['HIDDEN_VAL']){
                if(typeof(pop.dtcfg['HIDDEN_VAL'])=="function"){
                    pm["HIDDEN_VAL"] = pop.dtcfg['HIDDEN_VAL']();
                }else{
                    pm["HIDDEN_VAL"] = pop.dtcfg['HIDDEN_VAL'];
                }
            }
            if(pop.firstMode){
                var defV = [];
                for(var k in pop.checkedVal){
                    if(k!="")
                        defV.push(k.toUpperCase());
                }
                pm["DEFAULT_VAL"] = defV;
            }
            dhx.showProgress("查询数据中!");
            TermControlAction.queryPopData(pm,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
                dhx.closeProgress();
                var total = 0;
                if(data && data[0])
                    total = data[0]["TOTAL_COUNT_"];
                dt.bindData(data,total);
                dt.pop.firstMode = 0;
            });
        });
        this.dataTable.bindData([]);
    }
};

/**
 * 设置选中值
 * @param vals
 */
meta.ui.PopSelectWin.prototype.setCheckedValue = function(vals){
    this.checkedVal = {};
    if(vals!=null && vals!=undefined && vals.sort){
        for(var i=0;i<vals.length;i++){
            this.checkedVal[vals[i]] = 1;
        }
    }else if(vals!=null && vals!=undefined){
        this.checkedVal[vals] = 1;
    }
    this.firstMode = 1;
};

/**
 * 设置点击确定按钮回调函数
 * @param fun
 */
meta.ui.PopSelectWin.prototype.setOkCall = function(fun){
    if(fun && typeof(fun)=="function")
        this.okCall = fun;
};