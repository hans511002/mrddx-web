/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        Tool.js
 *Description：工具函数
 *
 *Dependent：
 *
 *Author:
 *        王春生
 ********************************************************/
/***************************************************************************
 *                     Tools工具类定义
 ***************************************************************************/


var Tools = {};//工具函数命名空间
Tools.EmptyObject = {};
Tools.EmptyList = [];
Tools.EmptyFunction = new Function();

/**
 * 判断指定对象是否为空对象，即{}形式
 * @param obj
 * @return 当不是对象类型时，返回false，当为null undefined 返回false
 */
Tools.isEmptyObject = function (obj) {
    if (typeof obj == "object") {
        var cont = 0;
        for (var key in obj) {
            cont++
        }
        return !cont;
    }
    return !!obj;
}
/**
 * 获取指定对象的键值数目
 * @param obj
 */
Tools.objectCount = function (obj) {
    if (typeof obj == "object") {
        var cont = 0;
        for (var key in obj) {
            cont++
        }
        return cont;
    }
    return 0;
}

/**
 * 跨浏览器添加事件
 * @param oTarget 要添加事件的DOM节点
 * @param sEventType  事件名称，如“click”
 * @param funName 事件函数
 */
Tools.addEvent = function (oTarget, sEventType, funName) {
    if (oTarget.addEventListener) {//for DOM;
        oTarget.addEventListener(sEventType, funName, false);
    } else if (oTarget.attachEvent) {
        oTarget.attachEvent("on" + sEventType, funName);
    } else {
        oTarget["on" + sEventType] = funName;
    }
};
/**
 * 垮浏览器为制定节点移除事件
 * @param oTarget 要添加事件的DOM节点
 * @param sEventType  事件名称，如“click”
 * @param funName 事件函数
 */
Tools.removeEvent = function (oTarget, sEventType, funName) {
    if (oTarget.removeEventListener) {//for DOM;
        oTarget.removeEventListener(sEventType, funName, false);
    } else if (oTarget.detachEvent) {
        oTarget.detachEvent("on" + sEventType, funName);
    } else {
        oTarget["on" + sEventType] = null;
    }
};

Tools.fireEvent = function (target, eventName) {
    if (document.all) {    // For IE.
        target.fireEvent("on" + eventName);
    } else {    // For Nescape
        var e = document.createEvent('HTMLEvents');
        e.initEvent(eventName, true, true);
        target.dispatchEvent(e);
    }
};
/**
 * 寻找同级的前一个相同类型节点
 * @param node
 */
Tools.findPreviousSibling = function (node) {
    var pre = node.previousSibling;
    while (pre && pre.nodeName != node.nodeName) {
        pre = pre.previousSibling;
    }
    return pre;
};
/**
 * 寻找同级的下一个相同类型的节点
 * @param node
 */
Tools.findNextSibling = function (node) {
    var next = node.nextSibling;
    while (next && next.nodeName != node.nodeName) {
        next = next.nextSibling;
    }
    return next;
};
Tools.base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
Tools.base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52,
    53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
    36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
/**
 * BASE 64编码。
 * @param str
 */
Tools.base64encode = function (str) {
    var out, i, len;
    var c1, c2, c3;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += Tools.base64EncodeChars.charAt(c1 >> 2);
            out += Tools.base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += Tools.base64EncodeChars.charAt(c1 >> 2);
            out += Tools.base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += Tools.base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += Tools.base64EncodeChars.charAt(c1 >> 2);
        out += Tools.base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += Tools.base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += Tools.base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
};


/**
 * 为节点添加垮浏览器的mouserEnter事件
 * @param target
 * @param fun
 */
Tools.mouseEnter = function (target, fun) {
    if (dhx.env.isIE) {//ie
        Tools.addEvent(target, "mouseenter", fun);
    } else {
        Tools.addEvent(target, "mouseover", function (e) {
            //判断事件触发的源是否是自身。阻止事件传播
            var t = e.relatedTarget;
            var t2 = e.target;
            if (t2 && t && !(t.compareDocumentPosition(this) & 8)) {
                fun(e);
            }
        });
    }
};
/**
 * 跨浏览器添加mouseLeave事件
 * @param target
 * @param fun
 */
Tools.mouseLeave = function (target, fun) {
    if (dhx.env.isIE) {//ie
        Tools.addEvent(target, "mouseleave", fun);
    } else {
        Tools.addEvent(target, "mouseout", function (e) {
            //判断事件触发的源是否是自身。阻止事件传播
            var t = e.relatedTarget;
            var t2 = e.target;
            if (t2 && t && !(t.compareDocumentPosition(this) & 8)) {
                fun(e);
            }
        });
    }
};
/**
 * 获取鼠标位置。
 * @param ev
 */
Tools.mousePosition = function (ev) {
    if (ev.pageX || ev.pageY) {
        return {x:ev.pageX, y:ev.pageY};
    }
    return {
        x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        y:ev.clientY + document.body.scrollTop - document.body.clientTop
    };
};
/**
 * 去除字符串左右空格
 * @param s
 */
Tools.trim = function (s) {
    if (s + "" == null || s + "" == undefined) {
        return "";
    }
    return (s + "").replace(/(^\s*)|(\s*$)/g, "");
}
/**
 * 去除字符串左空格
 * @param s
 */
Tools.ltrim = function (s) {
    return s.replace(/(^\s*)/g, "");
}
/**
 * 去除字符串右空格
 * @param s
 */
Tools.rtrim = function (s) {
    return s.replace(/(\s*$)/g, "");
}
/**
 * 产生一个随机的不重复的字符串。
 * @param w
 */
Tools.genStr = function (w) {
    var s = "";
    var z = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (var q = 0; q < w; q++) {
        s += z.charAt(Math.round(Math.random() * (z.length - 1)));
    }
    return s;
};

/**
 * 按照JAVA命名规范将数据库字段名替换成JAVA风格的字段名。
 * @param columnName
 * @param isTranWhenNospliter:是否进行转换，当没有下划线分隔的时候
 * @return
 */
Tools.tranColumnToJavaName = function (columnName, isTranWhenNospliter) {
    //匹配XXX_格式的命名
    var reg = /([A-Za-z_])([A-Za-z0-9]*)_?/g;
    var match = null;
    var count = 0;
    var javaName = "";
    while ((match = reg.exec(columnName))) {
        //变量第一个字母小写
        if (count++ == 0) {
            javaName += match[1].toLowerCase();
        } else { //以下划线分割的第一个字母大写
            javaName += match[1].toUpperCase();
        }
        javaName += match[2].toLowerCase();
    }
    return isTranWhenNospliter ? (count == 1 ? columnName : javaName) : javaName;
};
/**
 * 获取一个表单元素的值。
 * @param eleOrNameOrId
 */
Tools.getFormValues = function (eleOrNameOrId) {
    var ele = null;
    if (typeof eleOrNameOrId == "string") {
        ele = document.forms[eleOrNameOrId];
        if (ele == null) {
            ele = dwr.util.byId(eleOrNameOrId);
        }
    } else if (dwr.util._isHTMLElement(eleOrNameOrId)) {
        ele = eleOrNameOrId;
    }
    if (ele != null) {
        if (ele.elements == null) {
            alert("getFormValues() requires an object or reference to a form element.");
            return null;
        }
        var reply = {};
        var name;
        var value;
        for (var i = 0; i < ele.elements.length; i++) {
            if (ele[i].type in {button:0, submit:0, reset:0, image:0, file:0}) {
                continue;
            }
            if (ele[i].name) {
                name = ele[i].name;
                value = dwr.util.getValue(ele[i]);
            } else {
                if (ele[i].id) {
                    name = ele[i].id;
                } else {
                    name = "element" + i;
                }
                value = dwr.util.getValue(ele[i]);
            }
            reply[name] = value;
        }
        return reply;
    }
};

/**
 * 清空对象里面的所有属性
 * @param obj
 */
Tools.clearObject = function (obj) {
    if (obj) {
        for (var key in obj) {
            obj[key] = null;
            delete obj[key];
        }
    }
};

/**
 * 获取页面一个元素距离body 的绝对位置
 * @param e
 */
Tools.getPositionForBody = function (e) {
    var t = e.offsetTop;
    var l = e.offsetLeft;
    for (e = e.offsetParent; e;) {
        t += e.offsetTop;
        l += e.offsetLeft;
        e = e.offsetParent;
    }
    return {top:t, left:l};
};
/**
 * 根据屏幕分辨率的不同，与上下左右的一个间隔百分比，动态获取一个适合的弹出窗口Size，然后一个对象，包含属性width，height
 * @param top
 * @param left
 * @param buttom
 * @param right
 */
Tools.propWidthDycSize = function (top, left, buttom, right) {
    var bodyWidth = document.body.clientWidth;
    var bodyHeight = document.body.clientHeight;
    //弹出层窗口高。
    var height = (100 - parseInt(buttom) - parseInt(top)) * bodyHeight / 100;
    var width = (100 - parseInt(left) - parseInt(right)) * bodyWidth / 100;
    return {width:width, height:height};
};
/**
 * 获取一个定义好样式的button节点。
 * @param text
 * @param image
 */
Tools.getButtonNode = function (text, image, id) {
    var genbutton = Tools.genStr(8);
    var buttonDiv = dhx.html.create("div");
    buttonDiv.className = global.css.formContentDiv;
    id = id ? id : ("_table_" + genbutton);
    buttonDiv.innerHTML = ' <div class="dhx_list_btn">' +
        '<table cellspacing="0" cellpadding="0" border="0" align="left" id="'
        +id+'">' + '<tbody>' + ' <tr>' + '<td class="btn_l">' + '<div class="btn_l">&nbsp;</div>' +
        '</td>' + '<td class="btn_m">' + (!image ? ""
        : '<div style="position: relative;padding: 2px 6px;float: left;height: 14px;width: 14px">' +
        '<img style="height: 14px;width: 14px" src="' + image + '"/>' + '</div>') + '<div class="btn_txt"' +
        (image ? 'style="padding:1px 15px 1px 4px;float:right">' : '>') + text + '</div>' + '</td>' +
        '<td class="btn_r">' + '<div class="btn_r">&nbsp;</div>' + '</td></tr></tbody></table></div>';
    //添加事件用于定义鼠标移动到按钮上的显示效果
    Tools.mouseEnter(buttonDiv, function (e) {
        $('_table_' + genbutton).className = "dhx_list_btn_over";
    });
    Tools.mouseLeave(buttonDiv, function (e) {
        $('_table_' + genbutton).className = "";
    });
    return buttonDiv;
}
/**
 * Div弹出层控制，此方法功能如下，对于弹出的div相对源节点做定位控制，判断此DIV应该向上飘还是向下飘。
 * 此DIV的高度和宽度应该事先确定，否则会定位失败。
 * @param div  弹出的div层节点
 * @param target div弹出层相对于的节点。
 * @param isMouseMoveCrtl 此参数为true时会判断鼠标位置，当鼠标位置不在div和target节点范围内的时候，
 * div会隐藏。false不会作此处理。
 */
Tools.divPromptCtrl = function (div, target, isMouseMoveCrtl, extendWidth, extendHeight) {
    var offset = dhx.html.offset(target);
    var divHeight = parseInt(div.offsetHeight <= 0 ? div.style.height.replace("px", "") : div.offsetHeight);
    var divWidth = parseInt(div.offsetWidth <= 0 ? div.style.width.replace("px", "") : div.offsetWidth);
    //判断弹出层是否向上飘还是向下飘。
    var top = 0;
    //定义鼠标范围。
    //鼠标在target区域定义
    var offsetTargetStart = {};
    var offsetTargetEnd = {};
    //鼠标在div层中区域定义。
    var offsetDivStart = {};
    var offsetDivEnd = {};
    offsetTargetStart.x = offset.x - 5;
    offsetTargetStart.y = offset.y;
    offsetTargetEnd.x = offset.x + target.offsetWidth + 20 + (extendWidth ? extendWidth : 0);
    offsetTargetEnd.y = offset.y + target.offsetHeight + 5 + (extendHeight ? extendHeight : 0);
    offsetDivStart.x = offset.x - 5;
    offsetDivEnd.x = offset.x + divWidth + 5;
    if ((offset.y + target.offsetHeight + divHeight) > document.body.clientHeight) {
        top = offset.y - divHeight;
        offsetDivStart.y = top - 5;
        offsetDivEnd.y = offset.y;
    } else {
        top = offset.y + target.offsetHeight;
        offsetDivStart.y = offset.y + target.offsetHeight;
        offsetDivEnd.y = offset.y + target.offsetHeight + divHeight + 5;
    }
    div.style.left = (offset.x) + 'px';
    div.style.top = top + "px";
    div.style.display = "block";
    //添加div 消失事件
    if (isMouseMoveCrtl) {
        document.onmousemove = function (ev) {
            ev = ev || window.event;
            var mousePos = Tools.mousePosition(ev);
            //判断鼠标坐标是否在指定区域内。
            if (((mousePos.x >= offsetTargetStart.x && mousePos.y >= offsetTargetStart.y) &&
                (mousePos.x <= offsetTargetEnd.x && mousePos.y <= offsetTargetEnd.y)) ||
                ((mousePos.x >= offsetDivStart.x && mousePos.y >= offsetDivStart.y) &&
                    (mousePos.x <= offsetDivEnd.x && mousePos.y <= offsetDivEnd.y))) {
                //鼠标在指定区域内，无动作。
            } else {
                //关闭DIV
                div.style.display = "none";
            }
        }
    }
};
/**
 * 对select 添加option。
 * @param select 下拉框节点
 * @param list 下拉框数据
 */
Tools.addOption = function (select, list) {
    var diaplay = $(select).style.display;
    //重新渲染，解决IE7不显示BUG、而且在display:none的时候   速度不一样的。
    $(select).style.display = "none";
    if (list || list.options) {
        list = list.options || list;
        for (var i = 0; i < list.length; i++) {
            //新建option节点
            var option = document.createElement("option");
            option.value = (list[i].value + "").trim();
            option.innerText = (list[i].text+"").trim();
            (list[i].userdata) && (option.userdata = list[i].userdata);
            $(select).appendChild(option);
        }
    }
    $(select).style.display = diaplay;
};
/**
 * 对List<Map<String,Object>结构的数据，寻找指定键值=value的值
 * 如[{
 *     a1:123
 *     a2:234
 * },{
 *    a1:321,
 *    a2:1222
 * }
 * ]
 *Tools.selectValueFromArray("a1",123)={a1:123,a2:234}
 * @param key
 * @param value
 */
Tools.selectValueFromArray = function (array, key, value) {
    if (dhx.isArray(array)) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] == value) {
                return array[i];
            }
        }
    }
}
/**
 * 对List<Map<String,Object>结构的数据，删除指定键值=value的值
 * 如[{
 *     a1:123
 *     a2:234
 * },{
 *    a1:321,
 *    a2:1222
 * }
 * ]
 *Tools.removeValueFromArray("a1",123)={a1:123,a2:234}
 * @param key
 * @param value
 */
Tools.removeValueFromArray = function (array, key, value) {
    if (dhx.isArray(array)) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] == value) {
                array.splice(i, 1);
                return array[i];
            }
        }
    }
};
/**
 * 处理正则表达式关键字
 * @param str
 */
Tools.replaceKeyWord = function (str) {
    if (str) {
        return str.replace(/(\(|\)|\[|\]\{|\}|\*|\+|\.|-|\?|\\)/g, "\\$1");
    }
    return str;
}
/***
 * 输入时代码跟随或者代码补全控件，该控件提供默认实现，默认实现为一个隐藏域和一个input输入框，value输入到隐藏域，text输入到input框
 * 默认实现均可以被覆盖或者重写。
 * @param target..//要进行跟随的input节点，为必须。
 * @param config 跟随控制，里面存在的属性或者函数介绍如下；
 * {
 *  dwrAction:...//要进行数据访问的DWRCALLer设置，如已经定义了一个dwrAction为queryData,Dwr控件变量为dwrCaller,则传入方式为
 *     dwrCaller.queryData,如果有参数加入"?param=参数",如dwrCaller.queryData+"?param=参数",默认会传参数input的输入值value
 *     数据转换器要求为:dhtmlxComboDataConverter
 *  hidden:..//要设置Value的隐藏域，非必须。
 *  style:{
 *      div:"display;none;position:absolute;border: 1px #eee solid;overflow: auto;padding: 0;margin: 0;background-color: #F7F7F7;z-index:1000"//最外层DIV样式。
 *      select:"background-color: #76EEC6;"//选中样式
 *      unSelect:"background-color: #FFFFFF;"//未选中样式。
 *      contentDiv://实际包装内容的DIV样式。
 *      }
 *  onDivBuild:function(div){}//最外层DIV节点生成之后做的回调操作。
 *  onTargetValeChange:function(value){}//当输入框值变更时的操作，默认为访问ajax,查询数据。
 *  queryData:function(){}//查询数据方法，默认是通过配置的dwrAction访问。
 *  build:function(data){}//根据data生成一段HTML。默认是一个table。
 *  select:function(index){};//选中时执行的方法，默认实现是将text放入input中，如果有hidden将value放入hidden中。
 * }
 */
Tools.completion = function (target, config) {
    this.target = $(target);
    this.style = {
        div:"display;none;position:absolute;border: 1px #eee solid;overflow: auto;padding: 0;height:200px;" +
            "background-color: #FFFFFF;z-index:1000",
        contentDiv:"display;none;position:relative;border: 0px;overflow: auto;padding: 0; height:100%;width:100%;" +
            "background-color: #FFFFFF;z-index:1000;overflow: auto;",
        select:"background-color: #76EEC6;",
        unSelect:"background-color: #FFFFFF;"
    };
    //super关键字
    this._super = dhx.extend({}, this, true);
    if (config) {
        dhx.extend(this, config, true);
    }
    //新建一个外层DIV，宽度和target相同，高度250px;
    var div = dhx.html.create("div", {style:this.style.div});
    //调用回调函数，实现DIV建成之后的操作，或新增节点，或修改样式。
    this.onDivBuild(div);
    document.body.appendChild(div);
    this._div = div;
    //在DIV中加入一个节点，此节点用于包装返回数据的内容。
    var content = dhx.html.create("div", {style:this.style.contentDiv});
    div.appendChild(content);
    this._uid = dhx.uid();
    this._content = content;
    this._selectIndex = -1;//选择索引。
    Tools.completion._completions[this._uid] = this;
    //键盘事件与定位处理。
    this.target._completionOldValue = this.target.value;
    var that = this;
    Tools.addEvent(this.target, "keyup", function (e) {
        var event = e || window.event;
        var keyCode = event.keyCode;
        var isUp = false;
        if (keyCode == 40 || keyCode == 38) {
            //键盘上下键
            if (keyCode == 40) {
                isUp = true;
            }
            that.chageSelection(isUp);
        } else if (keyCode == 13) {
            if (that._selectIndex > -1) {
                that.select(that._selectIndex);
            }
        } else {
            var value = dwr.util.getValue(that.target);
            if (value != that.target._completionOldValue) {
                that.target._completionOldValue = value;
                that.onTargetValeChange(value);
            }
        }
    });
    /**
     * 改变选择。
     * @param isUp true代表向上移，false代表向下移
     */
    this.chageSelection = function (isUp) {
        var maxIndex = this._options ? this._options.length - 1 : 0;
        if (isUp) {
            this._selectIndex++;
        } else {
            this._selectIndex--;
        }
        this._selectIndex = this._selectIndex < 0 ? 0
            : (this._selectIndex > maxIndex ? maxIndex : this._selectIndex);
        for (var intTmp = 0; intTmp < maxIndex; intTmp++) {
            if (intTmp == this._selectIndex) {
                this.suggestOver($(this.getSelectUniqueName(intTmp)), this._selectIndex);
            } else {
                this.suggestOut($(this.getSelectUniqueName(intTmp)));
            }
        }
    };
    //鼠标选中
    this.suggestOver = function (td, index) {
        td.style.cssText = this.style.select;
        this._selectIndex = index;
    };
    //鼠标离开
    this.suggestOut = function (td) {
        td.style.cssText = this.style.unSelect;
    };
    /**
     *显示或者是隐藏输入提示框
     * @param types
     */
    this.showAndHide = function (types) {
        switch (types) {
            case "show":
                this._div.style.display = "block";
                break;
            case "hide":
                this._div.style.display = "none";
        }
    };
    /**
     * 为要进行选中的行进行一个唯一标识的赋值，此方法不可覆盖
     * @param index
     */
    this.getSelectUniqueName = function (index) {
        return  "_completion_tr_" + index + "_" + this._uid;
    }
};
/**
 * 最外层DIV建成做的回调操作，默认实现为什么都不做。
 * @param div
 */
Tools.completion.prototype.onDivBuild = function (div) {
};
/**
 * 当input输入值变更时的操作，默认是通过queryData调用ajax
 * @param value
 */
Tools.completion.prototype.onTargetValeChange = function (value) {
    this.queryData(value);
};
/**
 * 查询数据方法，默认是通过配置的dwrAction访问。
 * @param value
 */
Tools.completion.prototype.queryData = function (value) {
    var that = this;
    this._keyWord = value;
    //dwr 同步访问。
    dhx.ajax().sync().post(this.dwrAction, value, function (data) {
        that.build(data);
    });
};
/**
 * 生成一段HTML
 */
Tools.completion.prototype.build = function (data) {
    this._content.innerHTML = "";
    var contentHtml = '<table cellpadding="0" cellspacing="0" style=" width: 100%;height: auto; table-layout: fixed;" >' +
        '<tbody>';
    this._selectIndex = -1;//重置选择索引。
    this._options = data.options || data;
    if (this._options && this._options.length > 1) {
        for (var i = 0; i < this._options.length; i++) {
            contentHtml += '<tr id="' + this.getSelectUniqueName(i) + '" style="' + this.style.unSelect +
                '" onmouseover=Tools.completion._completions[' + +this._uid + '].suggestOver(this,' + i + ')';
            contentHtml += " onmouseout=Tools.completion._completions[" + this._uid + "].suggestOut(this) ";
            contentHtml += " onmousedown=Tools.completion._completions[" + this._uid + "].select(" + i + ") >";
            contentHtml += "<td>" +
                this._options[i].text.replace(this._keyWord, "<font color=red>" + this._keyWord + "</font>") +
                "</td>";
            contentHtml += "</tr>";
        }
    } else {
        contentHtml += "<tr><td style='text-align: center;'>无匹配记录</td></tr>"
    }
    contentHtml += "</tbody></table>";
    this._content.innerHTML = contentHtml;
    this._div.style.width = this.target.offsetWidth + "px";
    this._content.style.width = this.target.offsetWidth + "px";
    Tools.divPromptCtrl(this._div, this.target, true);
    this._div.style.display = "inline";
};
/**
 * 确定选择的函数。
 * @param index.
 */
Tools.completion.prototype.select = function (index) {
    this.target.value = this._options[index].text;
    if (this.hidden) {
        this.hidden.value = this._options[index].value;
    }
    this._div.style.display = "none";
};
Tools.completion._completions = {};


Tools.hasClass = function (element, className) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    return element.className.match(reg);
};
Tools.addClass = function (element, className) {
    if (!Tools.hasClass(element, className)) {
        element.className += " " + className;
    }
};
Tools.removeClass = function (element, className) {
    if (Tools.hasClass(element, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        element.className = element.className.replace(reg, ' ');
    }
};

/**
 * tanwc add
 * 添加提示信息到input或者textarea
 * @param    relationObj    关联对象，即提示信息要显示的区域DOM
 * @param    tipClass    提示内容样式 现在在head.jsp中添加了一个默认样式input_click可以使用，也可自己定义样式传入
 * @param    tipInfo        提示内容
 */
Tools.addTip4Input = function (relationObj, tipClass, tipInfo) {
    tipClass = tipClass == '' || tipClass == null || tipClass == 'undefined' ? 'input_click' : tipClass;//不传入class默认为input_click
    try {
        if (relationObj.value == tipInfo || relationObj.value == '' || relationObj.value == 'undefined' || relationObj.value == null) {
            relationObj.value = tipInfo;
            Tools.addClass(relationObj, tipClass);
            relationObj.setAttribute("ucflag", '0');
        } else {
            relationObj.setAttribute("ucflag", '1');
        }

        Tools.addEvent(relationObj, 'focus', function () {
            if (tipInfo == relationObj.value) {
                Tools.removeClass(relationObj, tipClass);
                relationObj.value = '';
                relationObj.setAttribute('ucflag', '0');
            } else {
                relationObj.setAttribute('ucflag', '1');
            }
        });

        Tools.addEvent(relationObj, 'blur', function () {
            if (relationObj.value == '' || relationObj.value == 'undefined' || relationObj.value == null) {
                relationObj.value = tipInfo;
                Tools.addClass(relationObj, tipClass);
                relationObj.setAttribute('ucflag', '0');
            } else {
                relationObj.setAttribute('ucflag', '1');
            }
        });
        Tools.addEvent(relationObj, 'keydown', function () {
            relationObj.setAttribute('ucflag', '1');
        });
    } catch (e) {
        alert(e);
    }
};
/**
 * 与addTip4Input合起用，根据ucflag取值
 * @param {Object} relationObj
 * @return {TypeName}
 */
Tools.getInputValue = function (relationObj) {
    if (relationObj.getAttribute('ucflag') == '0') {
        return "";
    } else {
        return relationObj.value;
    }
}

/**
 * 获取一组radio当前选中的dom
 * @param {Object} radioName    radio的name属性
 * @return {TypeName}     返回的是选中的radio的dom
 */
Tools.getCheckedRadio = function (radioName) {
    var result = null;
    var list = document.getElementsByName(radioName);
    for (var i = 0; i < list.length; i++) {
        if (list[i].checked) {
            result = list[i];
        }
    }
    return result;
};

/**
 * 字符过长，截断字符以...表示。
 * @param obj        字符绑定到的DOM对象
 * @param content    字符串内容
 * @param length    要截断的字符长度,默认为4个字节
 * @param ellipsis     自定义省略号，默认为...
 *
 * @return 数组[0]返回被截断的字符,[1]返回原始值
 */
Tools.toEllipsis = function (content, obj, length, ellipsis) {
    var result = new Array();
    length = length ? length : 4;
    content = content ? content : '';
    ellipsis = ellipsis ? ellipsis : '...';
    if (content.length <= length) {
        result.push(content);
    } else {
        result.push(content.substr(0, length) + ellipsis);
    }

    if (obj) {
        obj.setAttribute('title', content);
    }
    return result;
};
/**
 * 取消事件冒泡
 * @param e
 */
Tools.cancelBubble = function (e) {
    e = e || window.event;
    if (!e)return false;
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.cancelBubble = true;
    return false;
};

/**
 * ie下对getElementsByName支持有问题，故封装一下
 * @param {Object} tag
 * @param {Object} name
 * @return {TypeName}
 */
Tools.getElementsByName = function (tag, name) {
    var elts = document.getElementsByTagName(tag);
    var count = 0;
    var elements = [];
    for (var i = 0; i < elts.length; i++) {
        if (elts[i].getAttribute("name") == name) {
            elements[count++] = elts[i];
        }
    }
    return elements;
};

/***
 * 输入时代码跟随或者代码补全控件，该控件提供默认实现，默认实现为一个隐藏域和一个input输入框，value输入到隐藏域，text输入到input框
 * 默认实现均可以被覆盖或者重写。
 * @param target..//要进行跟随的input节点，为必须。
 * @param config 跟随控制，里面存在的属性或者函数介绍如下；
 * {
 *  dataQuery:要进行数据访问的回调方法
 *  hidden:..//要设置Value的隐藏域，非必须。
 *  style:{
 *      div:"display;none;position:absolute;border: 1px #eee solid;overflow: auto;padding: 0;margin: 0;background-color: #F7F7F7;z-index:1000"//最外层DIV样式。
 *      select:"background-color: #76EEC6;"//选中样式
 *      unSelect:"background-color: #FFFFFF;"//未选中样式。
 *      contentDiv://实际包装内容的DIV样式。
 *      }
 *  onDivBuild:function(div){}//最外层DIV节点生成之后做的回调操作。
 *  onTargetValeChange:function(value){}//当输入框值变更时的操作，默认为访问ajax,查询数据。
 *  queryData:function(){}//查询数据方法，默认是通过配置的dwrAction访问。
 *  build:function(data){}//根据data生成一段HTML。默认是一个table。
 *  select:function(index){};//选中时执行的方法，默认实现是将text放入input中，如果有hidden将value放入hidden中。
 * }
 */
Tools.completion = function (target, config) {
    this.target = $(target);
    this.style = {
        div:"display;none;position:absolute;border: 1px #eee solid;overflow: auto;padding: 0;height:200px;" +
            "background-color: #FFFFFF;z-index:1000",
        contentDiv:"display;none;position:relative;border: 0px;overflow: auto;padding: 0; height:100%;width:100%;" +
            "background-color: #FFFFFF;z-index:1000;overflow: auto;",
        select:"background-color: #76EEC6;",
        unSelect:"background-color: #FFFFFF;"
    }
    //super关键字
    this._super = dhx.extend({}, this, true);
    if (config) {
        dhx.extend(this, config, true);
    }
    //新建一个外层DIV，宽度和target相同，高度250px;
    var div = dhx.html.create("div", {style:this.style.div});
    div.style.width = this.target.offsetWidth + "px";
    div.style.display = 'none';
    //调用回调函数，实现DIV建成之后的操作，或新增节点，或修改样式。
    this.onDivBuild(div);
    document.body.appendChild(div);
    this._div = div;
    //在DIV中加入一个节点，此节点用于包装返回数据的内容。
    var content = dhx.html.create("div", {style:this.style.contentDiv});
    content.style.width = this.target.offsetWidth + "px";
    div.appendChild(content);
    this._uid = dhx.uid();
    this._content = content;
    this._selectIndex = -1;//选择索引。
    Tools.completion._completions[this._uid] = this;
    //键盘事件与定位处理。
    this.target._completionOldValue = this.target.value;
    var that = this;
    Tools.addEvent(this.target, "keyup", function (e) {
        var event = e || window.event;
        var keyCode = event.keyCode;
        var isUp = false;
        if (keyCode == 40 || keyCode == 38) {
            //键盘上下键
            if (keyCode == 40) {
                isUp = true;
            }
            that.chageSelection(isUp);
        } else if (keyCode == 13) {
            if (that._selectIndex > -1) {
                that.select(that._selectIndex);
            }
        } else {
            var value = dwr.util.getValue(that.target);
            if (value != that.target._completionOldValue) {
                that.target._completionOldValue = value;
                that.onTargetValeChange(value);
            }
        }
    });
    /**
     * 改变选择。
     * @param isUp true代表向上移，false代表向下移
     */
    this.chageSelection = function (isUp) {
        var maxIndex = this._options ? this._options.length - 1 : 0;
        if (isUp) {
            this._selectIndex++;
        } else {
            this._selectIndex--;
        }
        this._selectIndex = this._selectIndex < 0 ? 0
            : (this._selectIndex > maxIndex ? maxIndex : this._selectIndex);
        for (var intTmp = 0; intTmp < maxIndex; intTmp++) {
            if (intTmp == this._selectIndex) {
                this.suggestOver($(this.getSelectUniqueName(intTmp)), this._selectIndex);
            } else {
                this.suggestOut($(this.getSelectUniqueName(intTmp)));
            }
        }
    }
    //鼠标选中
    this.suggestOver = function (td, index) {
        td.style.cssText = this.style.select;
        this._selectIndex = index;
    }
    //鼠标离开
    this.suggestOut = function (td) {
        td.style.cssText = this.style.unSelect;
    }
    /**
     *显示或者是隐藏输入提示框
     * @param types
     */
    this.showAndHide = function (types) {
        switch (types) {
            case "show":
                this._div.style.display = "block";
                break;
            case "hide":
                this._div.style.display = "none";
        }
    }
    /**
     * 为要进行选中的行进行一个唯一标识的赋值，此方法不可覆盖
     * @param index
     */
    this.getSelectUniqueName = function (index) {
        return  "_completion_tr_" + index + "_" + this._uid;
    }
}
/**
 * 最外层DIV建成做的回调操作，默认实现为什么都不做。
 * @param div
 */
Tools.completion.prototype.onDivBuild = function (div) {
}
/**
 * 当input输入值变更时的操作，默认是通过queryData调用ajax
 * @param value
 */
Tools.completion.prototype.onTargetValeChange = function (value) {
    this.queryData(value);
}
/**
 * 查询数据方法，默认是通过配置的dwrAction访问。
 * @param value
 */
Tools.completion.prototype.queryData = function (value) {
    var that = this;
    this._keyWord = value;
    this.dataQuery.call(this, that.build);
}
/**
 * 生成一段HTML
 */
Tools.completion.prototype.build = function (data) {
    this._content.innerHTML = "";
    var contentHtml = '<table cellpadding="0" cellspacing="0" style=" width: 100%;height: auto; table-layout: fixed;" >' +
        '<tbody>';
    this._selectIndex = -1;//重置选择索引。
    this._options = data.options || data;
    if (this._options && this._options.length > 1) {
        for (var i = 0; i < this._options.length; i++) {
            contentHtml += '<tr id="' + this.getSelectUniqueName(i) + '" style="' + this.style.unSelect +
                '" onmouseover=Tools.completion._completions[' + +this._uid + '].suggestOver(this,' + i + ')';
            contentHtml += " onmouseout=Tools.completion._completions[" + this._uid + "].suggestOut(this) ";
            contentHtml += " onmousedown=Tools.completion._completions[" + this._uid + "].select(" + i + ") >";
            contentHtml += "<td>" +
                this._options[i].text.replace(this._keyWord, "<font color=red>" + this._keyWord + "</font>") +
                "</td>";
            contentHtml += "</tr>";
        }
    } else {
        contentHtml += "<tr><td style='text-align: center;'>无匹配记录</td></tr>"
    }
    contentHtml += "</tbody></table>";
    this._content.innerHTML = contentHtml;
    this._div.style.width = this.target.offsetWidth + "px";
    this._content.style.width = this.target.offsetWidth + "px";
    Tools.divPromptCtrl(this._div, this.target, true);
    this._div.style.display = "inline";
}
/**
 * 确定选择的函数。
 * @param index.
 */
Tools.completion.prototype.select = function (index) {
    this.target.value = this._options[index].text;
    if (this.hidden) {
        this.hidden.value = this._options[index].value;
    }
    this._div.style.display = "none";
}
Tools.completion._completions = {};


var OpenWinFactory = [];//存放被打开的页面句柄
Tools.closeOpenWins = function () {
    var len = OpenWinFactory.length;
    for (var i = 0; i < len; i++) {
        try {
            OpenWinFactory.shift().close();
        } catch (e) {
        }
    }
};
/**
 * 重写Number.toFixed 解决IE下的一个BUG
 * @param s
 */
if (dhx.env.isIE) {
    Number.prototype.toFixed = function (s) {
        var value = (parseInt(this * Math.pow(10, s) + 0.5) / Math.pow(10, s)).toString();
        if (value.indexOf(".") == -1 && s > 0) {
            value = value + ".";
            for (var i = 0; i < s; i++) {
                value = value + "0";
            }
        }
        return value;
    }

}
dhx.ready(function () {
    attachObjEvent(window, "onbeforeunload", function (e) {
        e = e || window.event;
        if (e.clientX > document.body.clientWidth && e.clientY < 0 || e.altKey) {
            Tools.closeOpenWins();
        }
    });
});

Tools.gbtrim = function (baseStr, len, s) {
    var str = '';
    var sp = s || '';
    var len2 = 0;
    for (var i = 0; i < baseStr.length; i++) {
        if (baseStr.charCodeAt(i) > 127 || baseStr.charCodeAt(i) == 94) {
            len2 += 2;
        } else {
            len2++;
        }
    }
    if (len2 <= len) {
        return baseStr;
    }
    len2 = 0;
    len = (len > sp.length) ? len - sp.length : len;
    for (var i = 0; i < baseStr.length; i++) {
        if (baseStr.charCodeAt(i) > 127 || baseStr.charCodeAt(i) == 94) {
            len2 += 2;
        } else {
            len2++;
        }
        if (len2 > len) {
            str += sp;
            break;
        }
        str += baseStr.charAt(i);
    }
    return str;
}
/**
 * 获取字符串长度，中文算作两个字符
 * @param value
 */
Tools.getLength = function (value) {
    if (value) {
        return (value + "").replace(/[^\x00-\xff]/g, "**").length;
    } else {
        return 0;
    }
}
/**
 * 判断以一定字符分割字符串中是否存在某个字符
 * @param strs
 * @param str
 * @param split
 */
Tools.isExistsStr = function (strs, str, split) {
    if (strs == null || strs == undefined || strs == "") {
        return false;
    }
    if (!str) {
        return false;
    }
    strs = strs + "";
    str = str + "";
    if (strs == str) {
        return true;
    }
    split = split || ",";

    var index = -1;
    while (true) {
        if ((index = strs.indexOf(str)) == -1) {
            return false;
        }
        var last = index > 0 ? strs.substr(index - 1, 1) : "";
        var end = index == strs.length - 1 ? "" : strs.substr(index + str.length, 1);
        if ((last == split && end == split) || (last == "" && end == split) || (last == split && end == "") || (last == "" && end == "")) {
            return true;
        } else {
            strs = strs.substring(index + str.length, strs.length);
        }
    }
}

/**
 * 删除以","号为分隔的字符串
 * @param allStr
 * @param str
 */
Tools.deleteStr = function (allStr, str, split) {
    split = split || ",";
    if (!allStr) {
        return allStr;
    }
    allStr = (allStr + "").split(split);
    var delStr = "";
    for (var i = 0; i < allStr.length; i++) {
        if (allStr[i] != str) {
            delStr += allStr[i] + split;
        }
    }
    if (delStr) {
        return delStr.substr(0, delStr.length - 1);
    } else {
        return delStr;
    }
}
/**
 * 日期格式化
 * @param fmt
 */
Tools.dateFormat = function (date, fmt) { //author: meizz
    var o = {
        "M+":date.getMonth() + 1, //月份
        "d+":date.getDate(), //日
        "h+":date.getHours(), //小时
        "m+":date.getMinutes(), //分
        "s+":date.getSeconds(), //秒
        "q+":Math.floor((date.getMonth() + 3) / 3), //季度
        "S":date.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
/**
 * 进行数字的格式化
 * @param value   数字
 * @param partten   格式为####.###.##.##的格式其中#号代表数字
 */
Tools.formatValue=function(value, partten) {
    if (!parseFloat(value)) {
        return value;
    }
    try {
        if (partten && partten != "0" && value) {
            //格式开始字符
            var begin = partten.substr(0, partten.indexOf("#"));
            //数字格式
            var dataParttern = partten.substring(partten.indexOf("#"), partten.lastIndexOf("#") + 1);
            //数字结束字符
            var end = partten.substring(partten.lastIndexOf("#") + 1, partten.length);
            //计算数字小数点位数。
            var data = undefined;
            var decimalLegth = 0;
            if (dataParttern.indexOf(".") != -1) {
                decimalLegth = dataParttern.length - dataParttern.lastIndexOf(".") - 1;
            }
            data = parseFloat(value).toFixed(decimalLegth);
            data = data + "";
            var integerParttern = decimalLegth != 0 ? dataParttern.substr(0, dataParttern.lastIndexOf(".")) : dataParttern;
            var formatValue = decimalLegth == 0 ? "" : data.substr(data.lastIndexOf("."), data.length);
            var integerValue = decimalLegth == 0 ? data : data.substr(0, data.lastIndexOf("."));
            var count = 0;
            var abstant = integerValue.length - integerParttern.length;
            for (var i = integerParttern.length; i > 0; i--) {
                var tempFormat = integerParttern.substr(i - 1, 1);
                if (i + count + abstant - 1 < 0) {
                    break;
                }
                var tempValue = integerValue.substr(i + count + abstant - 1, 1);
                if (tempValue == "-") {
                    formatValue = tempValue + "" + formatValue;
                    continue;
                }
                if (tempFormat == "#") {
                    formatValue = tempValue + "" + formatValue;
                } else {
                    formatValue = tempFormat + "" + formatValue;
                    count++;
                }
            }
            if (i + count + abstant > 0) {
                formatValue = integerValue.substr(0, i + count + abstant) + formatValue;
            }
            formatValue = begin + formatValue + end;
            return formatValue;
//                    alert(end);
        } else {
            return value;
        }
    } catch (e) {
        return value;
    }
}



