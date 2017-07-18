/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *       tool.js
 *Description：
 *       JS日常工具文件，主要提供一些工具方法，以Tools命名空间命名
 *Dependent：
 *        Dwr 的JS文件，如util.js和engine.js 以及dhmtlx.js
 *Author:
 *        张伟
 *Finished：
 *       2011-10-28
 *Modified By：
 *
 * Modified Date:
 *
 * Modified Reasons:

 ********************************************************/
/***************************************************************************
 *                     Tools工具类定义
 ***************************************************************************/


var Tools = new Object();//工具函数命名空间
Tools.EmptyObject = {};
Tools.EmptyList = [];
Tools.EmptyFunction = new Function();

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
}
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
}
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
}
var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
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
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}


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
}
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
}
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
}
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
                value = dhtmlxValidation.getValue(ele[i]);
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
}
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
        $('_table_' + genbutton) && ($('_table_' + genbutton).className = "dhx_list_btn_over");
    });
    Tools.mouseLeave(buttonDiv, function (e) {
        $('_table_' + genbutton) && ($('_table_' + genbutton).className = "");
    });
    return buttonDiv;
}

/*var debug=function(msg,append){
 if(append){
 $("_debug").innerHTML+=msg+"</br>";
 }else{
 $("_debug").innerHTML=msg+"</br>";

 }
 }*/
Tools._divPromptArray = {};
/**
 * Div弹出层控制，此方法功能如下，对于弹出的div相对源节点做定位控制，判断此DIV应该向上飘还是向下飘。
 * 此DIV的高度和宽度应该事先确定，否则会定位失败。
 * @param div  弹出的div层节点
 * @param target div弹出层相对于的节点。
 * @param isMouseMoveCrtl 此参数为true时会判断鼠标位置，当鼠标位置不在div和target节点范围内的时候，
 * div会隐藏。false不会作此处理。
 */
Tools.divPromptCtrl = function (div, target, isMouseMoveCrtl, extendWidth, extendHeight) {
    Tools.autoPosition.apply(this, arguments);
    /* var offset = dhx.html.offset(target);
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
     offsetDivStart.y = offset.y - target.offsetHeight-divHeight;
     offsetDivEnd.y = offset.y -target.offsetHeight + divHeight + 5;
     }
     div.style.left = (offset.x) + 'px';
     div.style.top = top + "px";
     div.style.display = "block";
     target.div = div;
     target.offsetTargetStart = offsetTargetStart;
     target.offsetTargetEnd = offsetTargetEnd;
     target.offsetDivStart = offsetDivStart;
     target.offsetDivEnd = offsetDivEnd;

     if (!target.id) {
     target.id = dhx.uid();
     }
     //添加div 消失事件
     if (isMouseMoveCrtl) {
     Tools._divPromptArray[target.id] = target.id;
     } else {
     Tools._divPromptArray[target.id] = null;
     delete  Tools._divPromptArray[target.id];
     }
     document.onmousemove = function (ev) {
     ev = ev || window.event;
     var mousePos = Tools.mousePosition(ev);
     for (var key in Tools._divPromptArray) {
     var target = $(key);
     if (target) {
     var offsetTargetStart = target.offsetTargetStart;
     var offsetTargetEnd = target.offsetTargetEnd;
     var offsetDivStart = target.offsetDivStart;
     var offsetDivEnd = target.offsetDivEnd;
     if (offsetTargetStart && offsetTargetEnd && offsetDivStart && offsetDivEnd) {
     //判断鼠标坐标是否在指定区域内。
     if (((mousePos.x >= offsetTargetStart.x && mousePos.y >= offsetTargetStart.y) &&
     (mousePos.x <= offsetTargetEnd.x && mousePos.y <= offsetTargetEnd.y)) ||
     ((mousePos.x >= offsetDivStart.x && mousePos.y >= offsetDivStart.y) &&
     (mousePos.x <= offsetDivEnd.x && mousePos.y <= offsetDivEnd.y))) {
     //鼠标在指定区域内，无动作。
     } else {
     target.div.style.display = "none";
     }
     }
     }
     }
     }*/
}
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
}
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
    }
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
    //dwr 同步访问。
    dhx.ajax().sync().post(this.dwrAction, value, function (data) {
        that.build(data);
    });
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


Tools.hasClass = function (element, className) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    return element.className.match(reg);
}
Tools.addClass = function (element, className) {
    if (!Tools.hasClass(element, className)) {
        element.className += " " + className;
    }
}
Tools.removeClass = function (element, className) {
    if (Tools.hasClass(element, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        element.className = element.className.replace(reg, ' ');
    }
}

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
        $(relationObj).setAttribute("_tipInfo", tipInfo);
    } catch (e) {
        alert(e);
    }
}
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
}

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
}
/**
 * 取消事件冒泡
 * @param e
 */
Tools.cancelBubble = function (e) {
    e = e || window.event;
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.cancelBubble = true;
    return false;
}

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
}

String.prototype.replaceAll = function (AFindText, ARepText) {
    raRegExp = new RegExp(AFindText, "g");
    return this.replace(raRegExp, ARepText);
}

Array.prototype.unique = function () {
    var newArray = [],
        temp = {};
    for (var i = 0; i < this.length; i++) {
        temp[typeof(this[i]) + this[i]] = this[i];
    }
    for (var j in temp) {
        newArray.push(temp[j]);
    }
    return newArray;
};

Array.prototype.indexOf = function (value) {
    var _self = this;
    for (var i = 0; i < _self.length; i++) {
        if (_self[i] == value) {
            return true;
        }
    }
    return false;
}

Array.prototype.removeByValue = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
};

/**
 * 获取一个元素的位置
 * @param e
 */
Tools.getElPos = function (e) {
    var t = e.offsetTop;
    var l = e.offsetLeft;
    while (e = e.offsetParent) {
        if (e.scrollTop)t -= e.scrollTop;
        t += e.offsetTop;
        if (e.scrollLeft)l -= e.scrollLeft;
        l += e.offsetLeft;
    }
    return {top:t, left:l};
};
/**
 * 自动定位
 * @param el 被定位的对象
 * @param target 目标对象（参照物）
 */
Tools.autoPosition = function (el, target, mouseRangeCtrl) {
    el.style.display = "block";
    if (el.beforeScroll != null && el.beforeScroll != undefined) {
        el.scrollTop = el.beforeScroll.y + "px";
        el.scrollLeft = el.beforeScroll.x + "px";
    }
    var pos = dhx.html.offset(target);
    var mw = document.body.clientWidth + document.documentElement.scrollLeft + document.body.scrollLeft;
    var mh = document.body.clientHeight + document.documentElement.scrollTop + document.body.scrollTop;
    var lscroll = document.documentElement.scrollLeft + document.body.scrollLeft;
    var tscroll = document.documentElement.scrollTop + document.body.scrollTop;
    var l = 0;
    var t = 0;
    if (pos.x + el.offsetWidth > mw && pos.x + target.offsetWidth > mw) {   //隐藏目标一部分
        if (mw - el.offsetWidth > pos.x) {
            l = pos.x - lscroll;//左对齐目标el
        } else {
            l = mw - el.offsetWidth - lscroll;//右对齐浏览器边框
        }
    } else {
        l = pos.x - lscroll;//左对齐目标el
    }
    if (pos.y + target.offsetHeight + el.offsetHeight > mh) {//下面不够
        var dt = mh - pos.y - target.offsetHeight;
        var ut = pos.y - (document.documentElement.scrollTop + document.body.scrollTop);
        if (ut > el.offsetHeight) {
            t = pos.y - el.offsetHeight - tscroll + 1;//目标上边框对齐
        } else if (ut < dt) {
            t = mh - el.offsetHeight - tscroll;//浏览器下边框对齐
        } else {
            t = 0;//浏览器上边框对齐
        }
    } else {
        t = pos.y + target.offsetHeight - tscroll - 1;//目标下边框对齐
    }
    el.style.left = l + "px";
    el.style.top = t + "px";
    if (mouseRangeCtrl) {
        var ctrlFun = function (ev) {
            ev = ev || window.event;
            var mousePos = null;
            if (ev.pageX || ev.pageY) {
                mousePos = {x:ev.pageX, y:ev.pageY};
            } else {
                mousePos = {
                    x:ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
                    y:ev.clientY + document.body.scrollTop + document.documentElement.scrollTop
                };
            }
            var elt = {x:l, y:t};
            var er = {startX:elt.x, endX:elt.x + el.offsetWidth, startY:elt.y, endY:elt.y + el.offsetHeight};
            var tr = {startX:pos.x, endX:pos.x + target.offsetWidth, startY:pos.y, endY:pos.y + target.offsetHeight};
            //判断鼠标坐标是否在指定区域内。
            if (((mousePos.x >= tr.startX && mousePos.y >= tr.startY) &&
                (mousePos.x <= tr.endX && mousePos.y <= tr.endY)) ||
                ((mousePos.x >= er.startX && mousePos.y >= er.startY) &&
                    (mousePos.x <= er.endX && mousePos.y <= er.endY))) {
                //鼠标在指定区域内，无动作。
            } else {
                //关闭DIV
                el.beforeScroll = {x:el.scrollLeft, y:el.scrollTop};
                el.style.display = "none";
                Tools.removeEvent(document, "mousemove", ctrlFun);
            }
        };
        Tools.addEvent(document, "mousemove", ctrlFun);
    }
    return {left:l, top:t};
};

/**
 * dwr数据查询构造器 （系统Grid，Tree 准备数据时一个简化封装，整合addAutoAction,AddDataConverter等）
 * 数据加载原理和原来一样，不过比原来的方式业务相关的代码更集中，可读性更高
 * @param config json对象
 * dwrMethod：dwr请求URL
 * param：参数：多个参数按位置以数组形式传入，若传入的参数本身就是数组类型，请把 arrayPar设为true
 * converter：转换器
 * callback：执行后回调
 * beforeLoad：执行前执行回调
 * dealOneParam：一个参数特殊处理，默认为true
 * showProcess：是否有进度条，默认true
 * processMsg：进度条显示信息
 * processMsgTitle：进度条标题
 * isExec：是否立即执行，  与 dwrCaller.executeAction()同理，默认false
 * afterCall：当isExec为true时 有效，最后执行完的回调
 * arrayPar：DWR支持数组参数，由于本方法会对参数做特殊处理，因此如果参数是DWR的数组类型参数时，需指明，默认false
 * ansync：异步执行，默认为true //此参数是dwr支持的
 * @return 返回dwrCaller[actionId] url。可以被系统扩展的各组件load直接用
 * 调用方式有两种如下：
 * 一 复杂调用：
 * gridobj.load(Tools.dwr({
 *      dwrMethod:"XXXAction.doYYY",//DWR方法
 *      converter:converterOBJ, //转换器 ,针对具体的应用是必选的
 *      param:{},             //参数 可选,多个参数直接传数组
 *      callback:function(data){}, //回调 可选
 *      beforeLoad:function(data){},//加载前执行 可选
 *      ansync:true/false,//异步执行 可选
 *      dealOneParam:true/false, //参数如果只有一个对象或值是否特殊处理，默认true
 *      showProcess:true/false, // 加载数据时等待过程中是否启动进度条，默认false
 *      processMsg:"进度条显示信息",  //
 *      processMsgTitle:"进度条标题" ,
 *      isExec: false/true,  //是否立即执行 默认false
 *      execCall: function(data){},
 *      arrayPar:false/true  //是否数组参数，因DWR参数支持数组，如果是数组参数时需要特殊指明，避免被拆分成参数列表。默认为false
 * }),"json");
 * 二简单调用：
 * Tools.dwr("XXXAction.doYYY",param ... ,converterOBJ,callbackFUN);
 * 简单调用除了第一个参数必选，其他都是可选（转换器针对具体应用也是必选），且 参数与转换器回调函数传入顺序无要求
 *
 * 实际应用时，Tools.dwr()一个构造器可能会在一个JS被多次调用，最常用如初始加载和更新加载，可如下写法
 * var x = Tools.dwr();
 * gridobj.load(x,"json");
 *
 *
 * 以前实现同样功能代码如下：
 * 这四行代码在实际写的时候会造成代码相关逻辑不够集中，且三个“ID”必须一样，后期维护性不高
 * var dwrCaller = new biDwrCaller();
 * dwrCaller.addAutoAction("ID","XXXAction.doYYY",param:{},callback:function(){});
 * dwrCaller.addDataConverter("ID", converterOBJ);
 * gridobj.load(dwrCaller.ID,"json");或 gridobj.load(dwrCaller["ID"],"json");
 *
 */
var ToolDwrCaller = null;
Tools.dwr = function (config) {
    var firstPar = arguments[0];
    if (firstPar.dwrMethod == null || firstPar.dwrMethod == undefined) {
        var method = arguments[0];
        var par = [];
        var cbk = null;
        var cvt = null;
        for (var x = 1; x < arguments.length; x++) {
            if (typeof(arguments[x]) == "function") {
                cbk = arguments[x];
            } else if (typeof(arguments[x]) == "object" && arguments[x].isConverter) {
                cvt = arguments[x];
            } else {
                par.push(arguments[x]);
            }
        }
        config = {
            dwrMethod:method,
            param:par.length > 0 ? par : null,
            callback:cbk != null ? cbk : null,
            converter:cvt != null ? cvt : null
        };
    }
    var defConfig = {
        dwrMethod:config.dwrMethod,
        isExec:(config.exec != null && config.exec != undefined) ? config.exec : false,
        execCall:(typeof(config.execCall) == "function") ? config.execCall : function () {
        },
        param:config.param,
        arrayPar:(config.arrayPar != null && config.arrayPar != undefined) ? config.arrayPar : false
    };
    var actionId = "dwr_" + dhx.uid();
    if (ToolDwrCaller == null || ToolDwrCaller == undefined) {
        ToolDwrCaller = new biDwrCaller();
    }
    var cfg = {
        dwrConfig:true,
        callback:(typeof(config.callback) == "function") ? config.callback : function () {
        },
        ansync:(config.ansync != null && config.ansync != undefined) ? config.ansync : true,
        onBeforeLoad:(typeof(config.beforeLoad) == "function") ? config.beforeLoad : function () {
        }
    };

    if (config.converter != null && config.converter != undefined) {
        ToolDwrCaller.addDataConverter(actionId, config.converter);
    }
    if (config.dealOneParam != null && config.dealOneParam != undefined) {
        ToolDwrCaller.isDealOneParam(actionId, config.dealOneParam);
    }
    if (config.showProcess != null && config.showProcess != undefined) {
        ToolDwrCaller.isShowProcess(actionId, config.showProcess);
    }
    ToolDwrCaller.addProcessMessage(actionId, config.processMsg, config.processMsgTitle);

    var pastr = "";
    if (dhx.isArray(defConfig.param) && !defConfig.arrayPar) {
        for (var i = 0; i < defConfig.param.length; i++) {
            pastr += ",defConfig.param[" + i + "]";
        }
        eval("ToolDwrCaller.addAutoAction(actionId,defConfig.dwrMethod" + pastr + ",cfg)");
    } else if (defConfig.param != null && defConfig.param != undefined) {
        ToolDwrCaller.addAutoAction(actionId, defConfig.dwrMethod, defConfig.param, cfg);
    } else {
        ToolDwrCaller.addAutoAction(actionId, defConfig.dwrMethod, cfg);
    }

    if (defConfig.isExec) {
        ToolDwrCaller.executeAction(actionId, defConfig.execCall);
    }

    return ToolDwrCaller[actionId];
};
/**
 * 封装过的Tree。完成树基本属性设置和check封装，一个简单的树只需new一个Tree,再加载数据就OK。
 * @param pobj 装载树的容器。也可以是通过layout布局器生成的dhtmlxTree。
 * @param config 各项参数
 * @return 返回dhtmlxTree对象，可再次个性设置
 * width宽，height高
 * checkMode，选择框模式，默认无；——"ra"或“raido”单选，“ch”或“checkbox”复选
 * tscheck，三态复选框，（只能选父，不能直接选子）
 * singleRa，特殊单选模式（兄弟节点之间单选）
 * onDblClick
 * onClick
 * onOpenStart
 * onOpenEnd
 * onBeforeCheck
 * onCheck     这是树常用的六个事件，可以通过这里直接传入，其他dhtmlxTree事件只能创建好了再单独添加
 * 还提供两个特殊事件，数据加载前后的事件
 * beforeLoad 使用时必须返回true，否则后续加载不会执行
 * afterLoad。 加载后执行
 * isDynload，动态加载默认为false
 * dynLoadurl，展开子节点动态加载URL，可单独实现，默认和初始展开URL一样
 *
 * 使用场景：
 * var t = userLayout.cells("c").attachTree();
 * var tree = Tree(t,{
 checkMode:"ch",
 beforeLoad:function(tree){alert("树加载前");return true;},
 afterLoad:function(tree){alert("树加载后");}
 });
 * var treeDwrUrl = Tools.dwr({
 dwrMethod:TestWCSAction.queryTest1,
 converter:new dhtmxTreeDataConverter({
 idColumn : "id",
 pidColumn : "pid",
 textColumn : "name"
 })
 });
 * tree.loadData(treeDwrUrl); //loadData 是新加入的方法，只有通过本类创建的Tree才支持
 *
 */
var Tree = function (pobj, config) {
    var parentObj = null;
    if (typeof(pobj) == "string") {
        parentObj = document.getElementById(pobj);
    } else {
        parentObj = pobj;
    }
    if (parentObj.mytype != "tree") {
        var w = parseInt(parentObj.offsetWidth || parentObj.style.width) || 160;
        var h = parseInt(parentObj.offsetHeight || parentObj.style.height) || 200;
        this.width = w + "px";
        this.height = h + "px";
    } else {
        this.width = "160px";
        this.height = "200px";
    }
    this.checkMode = "";
    this.tscheck = false;
    this.singleRa = true;
    this.image_path = getDefaultImagePath() + "csh_" + getSkin() + "/";
    this.rootId = 0;
    this.isDynload = false;
    this.dynLoadurl = "";
    config && dhx.extend(this, config, true);
    var cfg = {
        parent:parentObj,
        width:this.width,
        height:this.height,
        rootId:this.rootId,
        onDblClick:this.onDblClick || null,
        onClick:this.onClick || null,
        onOpenStart:this.onOpenStart || null,
        onOpenEnd:this.onOpenEnd || null,
        onBeforeCheck:this.onBeforeCheck || null,
        onCheck:this.onCheck || null
    };
    this.tree = null;
    if (parentObj.mytype == "tree") {
        this.tree = parentObj;
    } else {
        this.tree = new dhtmlXTreeObject(cfg);
    }
    if (cfg.onDblClick != null)this.tree.attachEvent("onDblClick", cfg.onDblClick);
    if (cfg.onClick != null)this.tree.attachEvent("onClick", cfg.onClick);
    if (cfg.onOpenStart != null)this.tree.attachEvent("onOpenStart", cfg.onOpenStart);
    if (cfg.onOpenEnd != null)this.tree.attachEvent("onOpenEnd", cfg.onOpenEnd);
    if (cfg.onBeforeCheck != null)this.tree.attachEvent("onBeforeCheck", cfg.onBeforeCheck);
    if (cfg.onCheck != null)this.tree.attachEvent("onCheck", cfg.onCheck);
    this.tree.setImagePath(this.image_path);
    if (this.checkMode == "ch" || this.checkMode == "checkbox") {
        this.tree.enableCheckBoxes(true);
        if (this.tscheck || this.tscheck == "true") {
            this.tree.enableThreeStateCheckboxes(true);
        }
    } else if (this.checkMode == "ra" || this.checkMode == "radio") {
        this.tree.enableRadioButtons(true);
        if (this.singleRa == "false") {
            this.tree.enableSingleRadioMode(false);
        }
    }
    this.tree.enableHighlighting(true);
    this.actionurl = "";
    this.tree.mytree = this;
    this.tree.reLoad = function (actionurl) {
        this.actionurl = actionurl || this.actionurl;
        if (this.actionurl) {
            this.clearAll(this.mytree.rootId);
            this.loadData(this.actionurl);
        }
    };
    this.tree.loadData = function (actionurl) {
        this.actionurl = actionurl;
        var f = true;
        if (this.mytree.beforeLoad && typeof(this.mytree.beforeLoad) == "function") {
            f = this.mytree.beforeLoad(this);
        }
        if (f) {
            var dwrca = biDwrCaller.format(actionurl);
            if (this.mytree.isDynload) {
                if (ToolDwrCaller && ToolDwrCaller[dwrca.runAction]) {
                    ToolDwrCaller._converter[dwrca.runAction].setDycload(true);
                } else {
                    biDwrCaller._runCaller[dwrca.dwrCaller._uid]._converter[dwrca.runAction].setDycload(true);
                }
                if (this.mytree.dynLoadurl != "") {
                    this.setXMLAutoLoading(this.mytree.dynLoadurl);
                } else {
                    this.setXMLAutoLoading(dwrca.dwrCaller.formatString + "&runAction=" + dwrca.runAction);
                }
            }
            var tr = this;
            new dhx.ajax(actionurl, function (data) {
                tr.loadJSONObject(data);
                if (tr.mytree.afterLoad && typeof(tr.mytree.afterLoad) == "function") {
                    tr.mytree.afterLoad(tr);
                }
            });
        }
    };
    return this.tree;
};

/**
 * 封转过的Grid，可支持TreeGrid，实现表格80%场景一般性设置封装，使用者不需要再手动设置列行对其方式等；
 * @param pobj Grid容器或由layout布局器生成dhtmlxGrid对象
 * @param config 配置参数
 * treeFlag：首列是否是树（表格树），默认为false
 * headNams：列头（必须，列头名字符串，用“,"分割）
 * columnIds：列ID（可选，如果需要对表格数据进行编辑取数据时必须，一般情况下传入converter.filterNames.toString()
 * widthsP：列宽百分比字符串（可选，默认平均分配）
 * widths：列宽数值字符串（可选，默认根据实际浏览器平均分配）
 * headAlign：列头对齐方式（可选，默认center）
 * colAlign：数据对齐方式（可选，默认left）
 * colVAlign：数据上下对齐方式（可选，默认middle）
 * colType：表格类型（可选，默认为ro，,末列为sb。当为表格树时，首列为tree）
 * colSort：列排序（可选，默认na）
 * pageSize：分页大小（默认为15，传入0时，关闭分页）
 * headBold：列头加粗（默认为true）
 * multiline: 行根据内容变高,false;
 * multiselect: 多选false;
 * clickRowChecked：点击行是否选中该行checkbox(默认为false，为true时，触发点击选中该行所有checkbox）
 * ccrc：不需要显示传入（主要用来记录clickRow时必须要被关联选中的列checkbox）
 * isDynload：表格树（动态加载，默认为false）
 * dynLoadurl：展开子节点动态URL，默认和初始URL一样
 * beforeLoad：数据加载前执行（必须返回true才会继续往下执行）
 * @return 返回dhtmlxGrid对象，可再次个性设置
 * 本类还提供了几个外部接口方法，方便个性化设置列，单元格数据类型，对齐方式等，可以通过“返回grid.genApi.方法”来调用
 * genApi.enableClickRowChecked(true/false) 控制clickRowChecked的值
 * genApi.setClickRowChecked(colindex,mode)设置ccrc的值
 * genApi.setColHeader(colindex,text) 设置列头
 * genApi.setCellType(colindex,type)设置某列类型
 * genApi.setCellAlign(colindex,align)设置某列对齐方式
 * genApi.setCellVAlign(colindex,valign)设置某列上下对齐方式
 * genApi.setColSort（colindex,sort)设置某列排序方式
 * genApi.setColumnCfg(colindex,config) 全面设置某列属性，通过config方式传参(包含：id,type,label,width,sort,align,valign,tip)
 * 由于原dhmlxGrid已经包含load方式，为了不改变结构，控制beforeLoad，和init的时机，新加入了loadData方法
 *
 * 使用场景：
 * var tableGrid = userLayout.cells("b").attachGrid();
 * var mygrid = new Grid(tableGrid,{
 headNames:"名称,ID,描述,操作",
 treeFlag:true, //默认为false，设为true时即为表格树，当然对应的数据转换器得换
 columnIds:tableConverter.filterColumns.toString(),  //避免和转换器里面重复，这里可以直接用转换器里面的参数
 beforeLoad:function(grid){return  true;}  //加载前执行的回调，如果有，则函数实现必须返回true，否则后续不会执行
 });
 * mygrid.genApi.setCellType(1,"ch");//个性设置第二列为checkbox
 * mygrid.enableMultiselect(true);//调用原始接口设置表格可多选
 *
 * var dwrGridUrl = Tools.dwr(TestWCSAction.queryTest2,tableConverter,function(data){});
 * mygrid.loadJOSN(dwrGridUrl);
 * 到此一个简单的表格（树）已完成
 * 目前动态加载表格树还需要的手动设置下 mygrid.kidsXmlFile = “dwrCaller.actionid” 和相关子节点加载方法
 * 后续会完成isDynload参数功能，实现动态化
 *
 * 原生dhtmlxGrid不已存在load方法，为了支持beforeLoad和区分此类后面加了一个方法 loadData(); 简化 init和load方法，还加入加载前回调
 *
 * 原生dhtmlxGrid不支持行点击事件，只有onRowSelected事件，为了方便本类，在dhtmlxExtend.js中扩展了
 * dhtmlXGridObject.prototype.attachOnRowClicked 方法，专门加入了一个添加行点击事件的接口
 *
 */
var Grid = function (pobj, config) {
    var parentObj = null;
    if (typeof(pobj) == "string") {
        parentObj = document.getElementById(pobj);
    } else {
        parentObj = pobj;
    }
    this.image_path = getDefaultImagePath() + "csh_" + getSkin() + "/";
    this.headNames = null;
    this.columnIds = null;
    this.widthsP = null;
    this.widths = null;
    this.headAlign = "center";
    this.colAlign = "left";
    this.colType = "ro";
    this.colSort = "na";
    this.colTip = true;
    this.colVAlign = "middle";
    this.pageSize = 15;
    this.headBold = true;
    this.clickRowChecked = false;
    this.ccrc = new Array(0);
    this.treeFlag = false;
    this.isDynload = false;
    this.dynLoadurl = "";
    this.multiline = false;
    this.multiselect = false;
    dhx.extend(this, config, true);
    var cfg = {parent:parentObj};
    this.grid = null;
    if (parentObj.entBox != null && parentObj.entBox.cmp == "grid") {
        this.grid = parentObj;
    } else {
        this.grid = new dhtmlXGridObject(cfg);
    }
    this.grid.setHeader(this.headNames);
    this.grid.enableCtrlC();
//    this.grid.setEditable(false);
    if (this.headBold)this.grid.setHeaderBold();
    if (this.columnIds != null && this.columnIds != undefined && this.columnIds != "") {
        this.grid.setColumnIds(this.columnIds);
    }
    var colcnt = this.grid.hdrLabels.length;
    var cts = "";
    var tips = "";
    for (var i = 0; i < colcnt; i++) {
        this.ccrc[i] = true;
        this.grid.cellAlign[i] = this.colAlign;
        this.grid.cellVAlign[i] = this.colVAlign;
        this.grid.fldSort[i] = this.colSort;
        this.grid._hstyles[i] = (this.grid._hstyles[i] || "") + "text-align: " + ((i == 0 && this.treeFlag) ? "left" : this.headAlign) + ";";
        cts += ((this.treeFlag && i == 0) ? "tree" : ((i == (colcnt - 1)) ? "sb" : this.colType)) + this.grid.delim;
        tips += ((i == (colcnt - 1)) ? "false" : this.colTip) + this.grid.delim;
    }
    cts = cts.substring(0, cts.length - this.grid.delim.length);
    tips = tips.substring(0, tips.length - this.grid.delim.length);
    this.grid.setColTypes(cts);
    this.grid.enableTooltips(tips);
    if (this.widthsP != null && this.widthsP != undefined && this.widthsP != "") {
        this.grid.setInitWidthsP(this.widthsP);
    }
    if (this.widths != null && this.widths != undefined && this.widths != "") {
        this.grid.setInitWidths(this.widths);
    }
    if (this.treeFlag) {
        this.grid.enableTreeGridLines();
        this.grid.enableTreeCellEdit(false);
    }
    this.grid.enableMultiline(this.multiline);
    this.grid.enableMultiselect(this.multiselect);
//    this.grid.setImagePath(this.image_path);

    this.setClickRowChecked = function (colIndex, mode) {
        this.ccrc[colIndex] = mode;
    };
    this.enableClickRowChecked = function (mode) {
        this.clickRowChecked = convertStringToBoolean(mode);
    };
    this.setColHeader = function (colIndex, text) {
        if (this.headBold) {
            this.grid.hdrLabels[colIndex] = '<span style="font-weight: bold;">' + text + "</span>"
        } else {
            this.grid.hdrLabels[colIndex] = text;
        }
    };
    this.setCellType = function (colIndex, type) {
        if (colIndex == 0 && this.treeFlag) {
            type = "tree";
        }
        if (!this.grid._strangeParams) {
            this.grid._strangeParams = new Array(colcnt);
        }
        if ((type.indexOf("[") != -1)) {
            var z = type.split(/[\[\]]+/g);
            this.grid.cellType[colIndex] = z[0];
            this.grid.defVal[colIndex] = z[1];
            if (z[1].indexOf("=") == 0) {
                this.grid.cellType[colIndex] = "math";
                this.grid._strangeParams[colIndex] = z[0];
            }
        } else {
            this.grid.cellType[colIndex] = type;
        }
        if (!window["eXcell_" + this.grid.cellType[colIndex]]) dhtmlxError.throwError("Configuration", "Incorrect cell type: " + this.grid.cellType[colIndex], [this.grid, this.grid.cellType[colIndex]]);
    };
    this.setCellAlign = function (colIndex, al) {
        this.grid.cellAlign[colIndex] = (colIndex == 0 && this.treeFlag) ? "left" : al;
    };
    this.setCellVAlign = function (colIndex, al) {
        this.grid.cellVAlign[colIndex] = al;
    };
    this.setColTip = function (colIndex, mode) {
        this.grid._enbTts[colIndex] = convertStringToBoolean(mode);
    };
    this.setColSort = function (colIndex, st) {
        if (((st).length > 4) && ( typeof (window[st]) == "function")) {
            if (!this._customSorts)
                this._customSorts = new Array(colcnt);
            this._customSorts[colIndex] = window[st];
            this.fldSort[colIndex] = "cus";
        } else {
            this.grid.fldSort[colIndex] = st;
        }
    };
    this.setColumnCfg = function (colIndex, cf) {
        if (cf.id)this.grid.setColumnId(colIndex, cf.id);
        if (cf.label)this.grid.setColumnLabel(colIndex, cf.label);
        if (cf.type)this.setCellType(colIndex, cf.type);
        if (cf.width)this.grid.setColWidth(colIndex, cf.width);
        if (cf.sort)this.setColSort(colIndex, cf.sort);
        if (cf.tip)this.setColTip(colIndex, cf.tip);
        if (cf.align)this.grid.cellAlign[colIndex] = (colIndex == 0 && this.treeFlag) ? "left" : cf.align;
        if (cf.valign)this.grid.cellVAlign[colIndex] = cf.valign;
    };
    this.grid.reLoad = function (actionurl) {
        this.actionurl = actionurl || this.actionurl;
        if (this.actionurl) {
            this.clearAll();
            this.load(this.actionurl, "json");
        }
    };

    this.grid.genApi = this;
    this.oldSelectedRows = null;
    this.newSelectRowId = null;

    return this.grid;
};

dhtmlXGridObject.prototype.loadData = function (actionurl) {
    if (!this.genApi.clickRowChecked && this.genApi.treeFlag) {
        this.setImagePath(this.genApi.image_path);
    }
    this.actionurl = actionurl;
    var mygrid = this.genApi;
    if (mygrid.clickRowChecked) {
        this.attachEvent("onRowSelect", function (ridx) {
            for (var j = 0; j < mygrid.ccrc.length; j++) {
                if (mygrid.ccrc[j]) {
                    if (this.cellType[j] == "ch" || this.cellType[j] == "ra") {
                        var cel = this.cells(ridx, j);
                        cel.setValue(1);
                    }
                }
            }
            return true;
        });
        this.attachEvent("onBeforeSelect", function (nr, or) {
            mygrid.oldSelectedRows = this.selectedRows;
            mygrid.newSelectRowId = nr;
            return true;
        });
        this.attachOnRowClicked(function (ev, ridx) {
            var thisRowIsSelected = false;
            if (mygrid.oldSelectedRows) {
                for (var i = 0; i < mygrid.oldSelectedRows.length; i++) {
                    if (mygrid.oldSelectedRows[i].idd == ridx) {
                        thisRowIsSelected = true;
                        break;
                    }
                }
            }
            for (var j = 0; j < mygrid.ccrc.length; j++) {
                if (mygrid.ccrc[j]) {
                    if (this.cellType[j] == "ch" || this.cellType[j] == "ra") {
                        var cel = this.cells(ridx, j);
                        if (ev.ctrlKey) {
                            if (mygrid.newSelectRowId == ridx) {
                                cel.setValue(1);
                            } else {
                                cel.setValue(0);
                            }
                        } else {
                            if (thisRowIsSelected && cel.getValue() == 1) {
                                cel.setValue(0);
                            } else {
                                cel.setValue(1);
                            }
                        }
                    }
                }
            }
            return true;
        });
    }

    var f = true;
    if (mygrid && mygrid.beforeLoad && typeof(mygrid.beforeLoad) == "function") {
        f = mygrid.beforeLoad(this);
    }
    if (f) {
        this.init();
        if (parseInt(this.genApi.pageSize) > 0) {
            this.defaultPaging(parseInt(this.genApi.pageSize));
        }
        var dwrca = biDwrCaller.format(actionurl);
        if (mygrid.treeFlag && mygrid.isDynload) {
            if (ToolDwrCaller && ToolDwrCaller[dwrca.runAction]) {
                ToolDwrCaller._converter[dwrca.runAction].setDycload(true);
            } else {
                biDwrCaller._runCaller[dwrca.dwrCaller._uid]._converter[dwrca.runAction].setDycload(true);
            }
            if (mygrid.dynLoadurl != "") {
                this.kidsXmlFile = mygrid.dynLoadurl;
            } else {
                this.kidsXmlFile = dwrca.dwrCaller.formatString + "&runAction=" + dwrca.runAction;
            }
        }
        this.load(actionurl, "json");
    }
};

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
dhx.ready(function () {
    Tools.addEvent(window, "beforeunload", function (e) {
        e = e || window.event;
        if (e.clientX > document.body.clientWidth && e.clientY < 0 || e.altKey) {
            Tools.closeOpenWins();
        }
    });
});

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

if (dhx.env.isIE) {
    Number.prototype.toFixed = function (s) {
        var number = this.toString();
        //判断原有的小数点个数
        if (s >= 0) {
            var polishingNum = 0;
            if (number.indexOf(".") == -1) {//原生无小数点。
                polishingNum = s;
            } else {
                //有小数点
                polishingNum = s - (number.length - number.indexOf(".") - 1);
            }
            var value = "";
            if (polishingNum > 0) {
                if (number.indexOf(".") == -1) {
                    value = this + ".";
                } else {
                    value = number;
                }
                for (var i = 0; i < polishingNum; i++) {
                    value = value + "0";
                }
            } else {
                if (this >= 0) {
                    value = (parseInt(this * Math.pow(10, s) + 0.5) / Math.pow(10, s)).toString();
                } else {
                    value = (parseInt(this * Math.pow(10, s) - 0.5) / Math.pow(10, s)).toString();
                }
                if (s > 0 && (value + "").indexOf(".") == -1) {
                    value += ".";
                    for (var i = 0; i < s; i++) {
                        value = value + "0";
                    }
                }
            }
        } else {
            value = this;
        }
        return value;
    }
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
/**
 * 给table  添加 html
 * @param table
 * @param html
 */
Tools.setTableInnerHTML = function(table, html) {
    if(navigator && navigator.userAgent.match(/msie/i)){
        var temp = table.ownerDocument.createElement('div');
        temp.innerHTML = '<table><tbody>' + html + '</tbody></table>';
        if(table.tBodies.length == 0){
            var tbody=document.createElement("tbody");
            table.appendChild(tbody);
        }
        table.replaceChild(temp.firstChild.firstChild, table.tBodies[0]);
    } else {
        table.innerHTML=html;
    }
}





