var Destroy = {}; // 销毁器名字空间
 Destroy.data = [];
 /**
 * 清除一个对象，可以是数组，可以是map，排除对象依赖的DOM对象
 *
 * @param data
 */
Destroy.clearObj = function(data) {
    Destroy.clearVarVal(data, function(key, val) {
        if (typeof val == "object" && val.tagName)
            return false;
        else
            return true;
    });
};
/**
 * 清除一个对象，并排除一些不想清除的东西
 *
 * @param data
 * @param filter
 *            可选过滤回调函数，返回false表示不销毁，过滤掉不想清除的东西 filter 有两个参数，arg0表示被销毁对象某属性，arg1表示被销毁对象某属性对应的值
 */
Destroy.clearVarVal = function(data, filter) {
    try {
        if (!filter)
            filter = Destroy.defaultFilter;
        if (Destroy.destructorDHMLX && data.DHTML_TYPE) {
            return Destroy.destructorDHMLX(data);
        }
        for ( var m in data) {
            if (Destroy.destructorDHMLX && data[m].DHTML_TYPE) {
                return Destroy.destructorDHMLX(data[m]);
            }
            var notDel = false;
            if (filter && typeof filter == "function" && !filter(m, data[m])) {
                notDel = true;
            } else if (filter && typeof filter == "object") {
                if (filter.sort) {
                    notDel = filter.findByValue(m);
                } else {
                    notDel = filter[m] ? true : false;
                }
            }
            if (notDel) {
                data[m] = null;
                delete data[m];
                continue;
            }
            if (typeof data[m] == "object" && data[m] && data[m] != data)
                Destroy.clearVarVal(data[m], filter);
            data[m] = null;
            delete data[m];
        }
        data = undefined;
    } catch (ex) {
    }
};
/**
 * 暴露给外部的接口，将需要销毁的对象数据加入到销毁器
 *
 * @param data
 */
Destroy.addDestroyVar = function(data) {
    Destroy.data[Destroy.data.length] = data;
};
/**
 * DHTML特殊销毁器，用于销毁dhtml特有对象
 */
Destroy.destructorDHMLX = function(obj) {
    try {
        if (!obj)
            return;
        if (obj.DHTML_TYPE) {
            if (obj.dhtmlxWindowsId || obj.comboId || obj.treeId || obj.gridId || obj.calendarId) {
                if (DHTMLXFactory)
                    DHTMLXFactory.destructor(obj);
            }
            switch (obj.DHTML_TYPE) {
                case "dhtmlXCombo":
                // var a=dhx_glbSelectAr;
                // for(var b=0;b<a.length;b++) {
                // if(a[b]==obj)
                // {a[b]=null;a.splice(b,1);break;}
                // }
                case "dhtmlXGrid":
                case "dhtmlXTree":
                    tryEval(obj, "destructor");
                    break;
                case "dhtmlXCalendar":
                    obj.i = [];
                    tryEval(obj, "unload");
                case "dhtmlXWindows":
                    tryEval(obj[o], "unload");
                    break;
                case "termReqs":
                    tryEval(obj, "destructor");
                    break;
            }
            return;
        }
        for ( var o in obj) {
            if (obj[o] && obj[o].DHTML_TYPE) {
                switch (obj[o].DHTML_TYPE) {
                    case "dhtmlXCombo":
                    case "dhtmlXGrid":
                    case "dhtmlXTree":
                        if (obj[o].DHTML_TYPE == "dhtmlXCombo") {
                            var a = dhx_glbSelectAr;
                            for ( var b = 0; b < a.length; b++)
                                if (a[b] == obj[o]) {
                                    a[b] = null;
                                    a.splice(b, 1);
                                    break;
                                }
                        }
                        tryEval(obj[o], "destructor");
                        break;
                    case "dhtmlXCalendar":
                        obj[o].i = [];
                        tryEval(obj[o], "unload");
                        break;
                    case "dhtmlXWindows":
                        tryEval(obj[o], "unload");
                        break;
                    case "termReqs":
                        tryEval(obj, "destructor");
                        break;
                }
            } else if (obj[o] && obj[o] != obj && typeof obj[o] == "object") {
                Destroy.destructorDHMLX(obj[o]);
            }
        }
    } catch (ex) {
    }
};
/**
 * 销毁器默认过滤器
 *
 * @param key
 * @param val
 */
Destroy.defaultFilter = function(key, val) {
    if (typeof val == "object" && val.tagName)
        return false;
    else
        return true;
};
/**
 * 销毁器内置方法，供window unload回调
 */
Destroy._unloadDestroyData = function() {
    Destroy.clearVarVal(Destroy.data, Destroy.defaultFilter);
};
/**
 * 将销毁程序加入到window的unload事件中
 */
try{
    attachObjEvent(window, "onunload", Destroy._unloadDestroyData);
}catch(e){

}
