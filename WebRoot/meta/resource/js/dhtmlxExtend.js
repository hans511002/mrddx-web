/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        dhtmlxExtend.js
 *Description：
 *        此JS主要用于对DHTMLX功能的的扩展以及提供一些基本工具函数，这些工具函数的命名空间为Tools.并且提供了针对dwr访问的的控件
 *biDwrMethodParam 和 biDwrCaller控件用于与DHTMX控件的集成。
 *Dependent：
 *        Dwr 的JS文件，如util.js和engine.js 以及dhmtlx.js
 *Author:
 *        张伟
 *Finished：
 *       2011-9-5
 *Modified By：
 *
 * Modified Date:
 *
 * Modified Reasons:

 ********************************************************/

/**
 * 判断浏览器类型及本版，初始化
 */
var ua = navigator.userAgent.toLowerCase();
var s;
(s = ua.match(/msie ([\d.]+)/)) ? dhx.env.ie = s[1] :
    (s = ua.match(/firefox\/([\d.]+)/)) ? dhx.env.firefox = s[1] :
        (s = ua.match(/chrome\/([\d.]+)/)) ? dhx.env.chrome = s[1] :
            (s = ua.match(/opera.([\d.]+)/)) ? dhx.env.opera = s[1] :
                (s = ua.match(/version\/([\d.]+).*safari/)) ? dhx.env.safari = s[1] : 0;
/**
 * outerHtml的垮浏览器实现。
 */
if (!dhx.env.isIE) {
    if (typeof(HTMLElement) != "undefined" && !window.opera) {
        HTMLElement.prototype.__defineGetter__("outerHTML", function () {
            var a = this.attributes, str = "<" + this.tagName, i = 0;
            for (; i < a.length; i++) {
                if (a[i].specified) {
                    str += " " + a[i].name + '="' + a[i].value + '"';
                }
            }
            if (!this.canHaveChildren) {
                return str + " />";
            }
            return str + ">" + this.innerHTML + "</" + this.tagName + ">";
        });
        HTMLElement.prototype.__defineSetter__("outerHTML", function (s) {
            var r = this.ownerDocument.createRange();
            r.setStartBefore(this);
            var df = r.createContextualFragment(s);
            this.parentNode.replaceChild(df, this);
            return s;
        });
        HTMLElement.prototype.__defineGetter__("canHaveChildren", function () {
            return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName
                .toLowerCase());
        });
    }
}

/***************************************************************************
 *                     biDwrMethodParam组件定义
 ***************************************************************************/

/**
 * 此组件封装DWR的方法参数，主要描述参数的个数，参数的获取方式等等。
 * 注：此组件与biDwrcaller联合使用
 * 此组件使用方式：
 * 初始化方式两种：  一:使用构造函数 var param=new biDwrMethodParam([{index:0,type:"ui",vaule:"input1,inut2"}
 * ,{..}..])
 *                 二:使用实例化函数 var param=biDwrMethodParam.instance([{index:0,type:"ui",vaule:"input1,inut2"}
 * ,{..}..])
 *  初始化之后，可用方法setParamConfig设置参数配置，相见setParamConfig 方法注释。
 *  也可以用 setParam 进行参数设置。
 *  此控件也可以作为URl参数中的一个与bidwrCaller控件联合使用
 *  例： var testParam= new biDwrMethodParam();
 testParam.setParamConfig([{
 index:0,type:"ui",value:"_serach,id"
 },{
 index:1,type:"fun",value:function(){return {start:1}}
 }]);
 var dwrtest=new biDwrCaller();
 dwrtest.loadAction("UserCtrlr.dhtmlXuserList");
 var url=dwrtest+"?runAction=load&"+"param="+testParam;
 grid.load(url,"json");
 * @param config 详见setParamConfig方法。
 */
var biDwrMethodParam = function (config) {
    this.size = 0; //参数个数
    this.paramConfig = [];//参数设置
    this._setParam = [];//用户自定义设置的param
    this._isBiDwrMethodParam = true;
    if (config) {
        this.setParamConfig(config);
    }
    var uid = dhx.uid();
    biDwrMethodParam._runParam[uid] = this;
    //返回固定格式的字符串，偏于重新序列化对象。
    this.formatString = "&_biDwrMethodParam=_###biDwrMethodParam_Object_uid:" + uid;
    this.length = this.formatString.length;
};
/**
 * 设置一个静态变量，用于存储调用了biDwrMethodParam toString方法的 biDwrCaller引用，便于后续恢复对象。
 */
biDwrMethodParam._runParam = [];
/**
 * 当此对象序列化成一个String字符串，偏于进行字符串的连接，即此对象可以类似于URL一般
 * 可以用"+”操作符进行参数的连接，连接后的字符串只要用dhx.ajax()调用，自然会还原成原来的对象
 * 实现了本控件与传统URL的无缝连接。
 */
biDwrMethodParam.prototype.toString = function () {
    return this.formatString;
}
biDwrMethodParam.prototype.indexOf = function (s, position) {
    return this.formatString.indexOf(s, position);
}
/**
 * 将URL格式字符串字符串转换为param对象。
 * 设计为静态方法
 * @param s
 * @return object biDwrMethodParam对象
 */
biDwrMethodParam.format = function (s) {
    var uid = null;
    if (uid = biDwrMethodParam.isDwrMethodParamObject(s)) {
        //获取biDwrMethodParam
        return biDwrMethodParam._runParam[uid];
    }
}

/**
 * 静态方法判断指定字符串是否是由biDwrMethodParam对象生成。如果是返回其对象uid，否则为false;
 * @param s
 */
biDwrMethodParam.isDwrMethodParamObject = function (s) {
    if (typeof s == "object") {
        s = s.formatString;
    }
    if (s && typeof s == "string") {
        var reg = /^_#{3}biDwrMethodParam_Object_uid:(\d+)/;
        var match = null;
        return s && (match = reg.exec(s)) ? match[1] : false;
    }
    return false;
}
/**
 * 参数合并
 * @param val1
 * @param val2
 */
biDwrMethodParam.connectParam = function (val1, val2) {
    if (val1 == null || val1 == undefined) {
        return val2;
    }
    if (val2 == null || val2 == undefined) {
        return val1;
    }
    var type1 = typeof val1;
    var type2 = typeof val2;
    if (type1 != "object" && type2 != "object") {//两个都不是对象，连接返回一个数组,对应Java数组类型
        return [type1, type2];
    } else if (type1 == "object") { //如果type1是对象
        if (dhx.isArray(val1)) { //如果val1是数组类型，连接成为数组
            if (dhx.isArray(val2)) {//value2也是数组，直接合并
                val1.concat(val2);
                return val1;
            }
            return val1.push(val2) && val1;//其他原始直接添加。
        } else {//如果value1不是数组，是个纯粹的对象
            if (type2 != "object") {//如果type2不是对象，是string或者是numbei，不能连接
                return null;
            } else {//如果type2是对象
                if (dhx.isArray(val2)) {//如果是数组，则value1加入数组中
                    return val2.push(val1) && val2;
                } else {//是对象直接合并
                    return dhx.extend(val1, val2, true);
                }
            }
        }
    } else {//如果value1不是对象
        return biDwrMethodParam.connectParam(val2, val1);
    }
};

/**
 * 实例化一个biDwrMethodParam
 * @param config config为JS数组,配置见setParamConfig方法。
 */
biDwrMethodParam.instance = function (config) {
    return new biDwrMethodParam(config);
}
/**新增参数配置
 * @author 张伟
 * @param config config为JS数组，完整配置定义示例如下：
 * var config=[
 * {index:0, dwr方法索引位置,必须。
 *  type:"ui", 参数来源，有四种，"ui"：参数来源于页面上组件集合，多个组件以","号分隔，如果其中有form组件，则会遍历form下所有的元素取值
 *                             "fun":用户自定义回调函数取参数值，取其返回结果。
 *                             "static":静态常量值，默认，如果是这种类型type可以省略。
 *                             "watch":动态观察某一个函数的调用，当某一个函数被调用时，会调用一个用户自定义的回调函数返回参数。
 *  vaule:fuction(){return "a"};  必须，参数值，type="ui"时，为ui字符串，如"input1,input2"
 *                                            type="fun"时，为用户自定义回调函数。
 *                                           type="static",为参数实际值
 *                                            type=”watch“时，为动态监测的函数名或者对象，函数名，如”fun1“，如果为某一对象下的函数名
 * 组合为数组，如obj.fun1组合为[obj,"fun1"]，注：函数必须提供函数名，否者无效。
 * append:true/false 对同一索引的参数，如果之前有设置，这里是否进行参数合并也即追加，默认为true，可选。为false将代替前面的同样索引位的参数设置。
 * 参数合并规则如下：
 * 1、当计算出参数都为数组时，进行数组合并，如[1,2]&&[3,4]=[1,2,3,4]
 * 2、当地一个参数为数组时，第二个参数为非数组的其他对象，同样合并为数组，如[1,2]&&2=[1,2,2]或者[1,2]&&{a:1}=[1,2,{a:1}]
 * 3、当第一个参数为对象时，第二个参数为非对象时，不能合并，如{a:1}&&1==error!
 * 4、当第一个参数为对象时，第二个参数为对象时，对象继承，如{a:1}&&{a:2,b:3}={a:2,b:3}
 * 其他依次类推。
 * watchCallback:当type为”watch“时，此参数为必须，监测回调函数，此回调函数有两个参数，第一个为对应函数的调用参数，第二个为函数的返回参数。
 * 例：function(first,second){
 *    return 。。。//返回的极为当时的参数，如果调用多次以最后一次参数生效。
 * }
 * ,{。。。。}
 * ]
 */
biDwrMethodParam.prototype.setParamConfig = function (config) {
    var methodSize = this.size;
    if (!dhx.isArray(config)) {
        alert("参数定义错误！");
        return;
    }
    for (var i = 0; i < config.length; i++) {
        var temp = config[i];
        methodSize = methodSize <= temp.index ? temp.index + 1 : methodSize;
        temp.uid = dhx.uid();
        this.paramConfig[temp.index] = this.paramConfig[temp.index] || [];
        if (dhx.isNotDefined(temp.append) || temp.append == null || temp.append) {//追加配置
            this.paramConfig[temp.index].push(config[i]);
        } else {//否则替换。
            for (var ii = 0; ii < this.paramConfig[temp.index].length; i++) {
                if (this.paramConfig[temp.index][ii]._deleteWatch) {
                    this.paramConfig[temp.index][ii]._deleteWatch(this.paramConfig[temp.index][ii]);
                }
                this.paramConfig[temp.index][ii] = null;
            }
            this.paramConfig[temp.index] = [(config[i])]
        }
        if (config[i].type == "watch") {//如果是监测某一个函数。
            var orgFun = null;
            var funName = null;
            var obj = window;
            if (typeof config[i].value == "string") {
                funName = config[i].value;
                orgFun = window[config[i].value];
            } else if (dhx.isArray(config[i].value)) {
                if (config[i].value.length == 1) {
                    funName = config[i].value[0];
                    orgFun = window[config[i].value[0]];
                } else {
                    funName = config[i].value[1];
                    obj = config[i].value[0];
                    orgFun = obj[funName];
                }
            }
            if (!orgFun) {
                alert("对应索引位" + temp.index + "未找到所要监测的函数！");
                continue;
            } else if (typeof orgFun != "function") {
                alert("对应索引位" + temp.index + "配置中的监测不是一个函数！")
                continue;
            } else if (!temp.watchCallback) {
                alert("对应索引位" + temp.index + "未定义监测回调函数！")
                continue;
            }
            //替换监测的函数。
            var that = this;
            if (orgFun._dwrwatch) {
                temp._addWatch(temp);
            } else {
                obj[funName] = function () {
                    var args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : undefined;
                    var result = obj[funName]._orgFun.apply(obj, arguments);
                    temp._addWatch = function (param, config) {
                        obj[funName]._dwrwatch.push({
                            param:param,
                            config:config
                        });
                    };
                    temp._deleteWatch = function (config) {
                        for (var key = 0; key < obj[funName]._dwrwatch.length; key++) {
                            if (config.uid == obj[funName]._dwrwatch[key].config.uid) {
                                //删除原来记的watch变量值
                                delete obj[funName]._dwrwatch[key].param._watch[obj[funName]._dwrwatch[key].config.uid];
                                obj[funName]._dwrwatch[key].param = null;
                                obj[funName]._dwrwatch[key].config = null;
                                delete obj[funName]._dwrwatch[key];
                            }
                        }
                        if (obj[funName]._dwrwatch.length == 0) {
                            obj[funName]._dwrwatch = null;
                            obj[funName] = obj[funName]._orgFun;
                        }
                    };
                    //依次调用监听的回调函数。
                    for (var key = 0; key < obj[funName]._dwrwatch.length; key++) {
                        var tmppp = obj[funName]._dwrwatch[key];
                        tmppp.param._watch = tmppp.param._watch || [];
                        tmppp.param._watch[tmppp.config.index] = tmppp.param._watch[tmppp.config.index] || [];
                        tmppp.param._watch[tmppp.config.index][tmppp.config.uid] = tmppp.config.watchCallback(args,
                            result);
                    }
                };
                obj[funName]._orgFun = orgFun;
                obj[funName]._dwrwatch = [
                    {
                        param:that,
                        config:temp
                    }
                ];
            }
        }
    }
    this.size = methodSize;
    return this;
};
/**
 * 根据参数配置生成参数。
 */
biDwrMethodParam.prototype.buildParam = function () {
    var arg = [];
    arg[this.size - 1] = null;
    for (var i = 0; i < this.size; i++) {
        var configs = this.paramConfig[i];
        if (configs) {
            for (var k = 0; k < configs.length; k++) {
                var config = configs[k];
                if (config) {
                    var value = config.value;
                    switch (config.type) {
                        case "ui":
                        {
                            value = value.split(",");
                            var uiParam = {};
                            for (var j = 0; j < value.length; j++) {
                                var node = dwr.util.byId(value[j]);
                                if (!node) {
                                    var nodes = document.getElementsByName(value[j]);
                                    if (nodes.length >= 1) {
                                        node = nodes.item(0);
                                    }
                                }
                                if (!node) {
                                    continue;
                                }
                                var name = node.name;
                                //                                if(!name) continue;
                                if (node.nodeName.toLowerCase() == "form") {//form 表单
                                    var formParam = Tools.getFormValues(value[j]);
                                    if (formParam) {
                                        for (var z in formParam) {
                                            if (uiParam[z]) {
                                                uiParam[z] = dhx.isArray(uiParam[z]) ? uiParam[z] : [uiParam[z]];
                                                uiParam[z].push(formParam[z]);
                                            } else {
                                                uiParam[z] = formParam[z];
                                            }
                                        }
                                    }
                                } else {
                                    var fieldValue = dwr.util.getValue(value[j]);
                                    if (fieldValue) {
                                        if (uiParam[name]) {
                                            uiParam[name] = dhx.isArray(uiParam[name]) ? uiParam[name] : [uiParam[name]
                                            ];
                                            uiParam[name].push(fieldValue);

                                        } else {
                                            uiParam[name] = fieldValue;
                                        }
                                    }
                                }
                            }
                            arg[i] = biDwrMethodParam.connectParam(arg[i], uiParam);
                            break;
                        }
                        case "fun":
                        {//用户自定义回调函数获取参数
                            arg[i] = biDwrMethodParam.connectParam(arg[i], value());
                            break;
                        }
                        case "static":
                        {
                            arg[i] = biDwrMethodParam.connectParam(arg[i], value);
                            break;
                        }
                        case "watch":
                        {
                            if (this._watch && this._watch[i] && this._watch[i][config.uid]) {
                                arg[i] = biDwrMethodParam.connectParam(arg[i], this._watch[i][config.uid]);
                            }
                            break;
                        }
                        default:
                            break;
                    }
                } else {
                    arg[i] = biDwrMethodParam.connectParam(arg[i], null);
                }
            }
        }
        arg[i] = biDwrMethodParam.connectParam(arg[i], this._setParam[i]);
    }
    return arg;
};
/**
 * 格式类似URL的字符串，比如"www.sina.com?id=5&name=zzz"，解析此字符串，获取其URL参数
 * 组装为一个JS对象。
 * @param url
 */
biDwrMethodParam.urlParamFormat = function (url) {
    var reg = /[\?|&]{1}([^&|\?|\s|=]+)={1}([^&|\?|\s]*)/g;
    var tempParam = null;
    var append = null;
    while (tempParam = reg.exec(url)) {
        var key = tempParam[1];
        var value = decodeURIComponent(tempParam[2]);
        if (value == "null" || value == "undefined") {
            continue;
        }
        append = append || {};
        //如果URL中有前后中括号的形式，例dhx_filter[name]=value;解析成一个HASH形式，即
        /*    {dhx_filter:{name:value}}形式*/
        var reg1 = /([^\[|\]]+)\[{1}([^\[|\]]+)\]{1}/;
        var filter = reg1.exec(key);
        if (filter) {
            key = filter[1];
            var empty = {};
            empty[filter[2]] = value;
            if (append[key]) { //对象扩展
                append[key] = dhx.extend(append[key], empty, true);
            } else {
                append[key] = empty;
            }
            continue;
        }
        if (append[key]) { //扩展为链表
            var t = append[key];
            if (dhx.isArray(append[key])) {
                append[key].push(value);
            } else {
                append[key] = [];
                append[key].push(t);
                append[key].push(value);
            }
        } else {
            append[key] = value;
        }
    }
    reg.lastIndex = 0;
    return append;
}

/**
 * 设置静态常量参数
 * @param index
 * @param value
 * @param append 是否与前面相同索引的设置进行追加。默认为true
 */
biDwrMethodParam.prototype.setParam = function (index, value, append) {
    this.size = this.size <= index ? index + 1 : this.size;
    if (dhx.isNotDefined(append) || append == null || append) {
        this._setParam[index] = biDwrMethodParam.connectParam(this._setParam[index], value);
    } else {
        this._setParam[index] = value;
    }
}

/**
 *
 * 移除索引位所有的配置。
 * @param indexs 索引序列,数组
 */
biDwrMethodParam.prototype.clearConfigByIndex = function (index) {
    if (index > this.size - 1) {
        return;
    }
    this._setParam[index] = null;
    this._watch[index] = null;
    this.paramConfig[index] = null;
    if (this.size - 1 == index) {
        this.size--;
    }
}
/**
 * 对DWR的参数进行处理，如果某一个索引位的参数是个对象{}形式，且其中的键值有且仅有
 * 一个，那么略去键值，直接传键值对应参数，如果对应索引位是个数组，且数组长度只有一个
 * 取出数组里面的这个值，不以数组形式传参。
 * @param params
 */
biDwrMethodParam.dwrOneParamDeal = function (params) {
    if (params) {
        var isOne = false;
        if (!dhx.isArray(params)) {
            params = [params];
            isOne = true;
        }
        for (var i = 0; i < params.length; i++) {
            if (params[i]) {
                if (dhx.isArray(params[i]) && params[i].length == 1) {
                    params[i] = params[i][0];
                } else if (typeof params[i] == "object") {
                    var cont = 0;
                    var lastValue = null;
                    for (var key in params[i]) {
                        cont++;
                        lastValue = params[i][key];
                    }
                    if (cont == 1) {
                        params[i] = lastValue;
                    }
                }
            }
        }
        if (isOne) {
            return params[0];
        } else {
            return params;
        }
    }
}

/***************************************************************************
 *                     biDwrCaller组件定义
 ***************************************************************************/


/**
 * dwr封装,此控件完全可以作为URL传递。
 * 当此控件示例为：
 *  1、使用方法一：使用方法添加Action
 *  var dwr=new biDwrCaller(); //声明一个dwr控件
 *  dwr.loadAction("UserCtrlr.dhtmlXuserList",null);//添加loadAction
 *  var url=dwr+'?runAction=load';//runAction代表此次URL要执行的Action，默认为"load"
 *  还可以给dwr执行时添加额外参数，这里的参数将作为HSAH方式传入DWR方法最后一个 例
 *  url = url+(url.indexOf("?")==-1?"?":"&")+"action=get&id="+encodeURIComponent("asasa")
 *  当用做URl时，只能适用于DHTMX控件
 *  比如：grid.load(url,"json"); 此Url如上所示；
 *  2、使用方法二：构造函数直接初始化
 *  var dwr=new biDwrCaller({
 *                           load:function(afterCall,param){...}//定义一个完全自控的Action
 *                           update:{methodName:'UserCtrl.logion',param:[null,null],success:function(data){}}//定义一个交由
 *                   控件处理的Action..
 })
 */
var biDwrCaller = function (config) {
    this._action = [];
    //先将原有对象保留
    var uid = dhx.uid();
    this._uid = uid;
    biDwrCaller._runCaller[uid] = this;
    //返回固定格式的字符串，偏于重新序列化对象。
    this.formatString = "_###biDwrCaller_Object_uid:" + uid;
    this.dwr = {};
    this.length = this.formatString.length;
    //进度条参数。
    this._showProcess = true;
    this._showProcessAction = {};
    //当对象或者数据只有一个元素时，是否取出子元素，不以对象或者数组格式传参。
    this._dealOneParam = true;
    this._dealOneParamAction = {};
    //寻找当前页的dwr ctrl
    var reg = /^(\/\S+)*\/dwr\/interface\/(\w+)\.js/;
    var scripts = document.querySelectorAll ? document.querySelectorAll("script[src]") : document
        .getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute("src");
        if (!src) {
            continue;
        }
        var match = reg.exec(src);
        if (match) {
            if (window[match[2]]) {
                dhx.extend(this.dwr, window[match[2]]); //依次继承Dwr中的方法。
            } else {
                alert("未找到DWR对应方法：" + match[1] + ",请确定对应的DWR JS文件是否导入！")
            }
        }
    }
    if (config) {//如果有初始化配置
        for (var key in config) {
            if (typeof config[key] == "function") {//如果是个function
                this.addAction(key, config[key]);
            } else if (typeof config[key] == "object") {
                var param = config[key].param ? (dhx.isArray(config[key].param) ? config[key].param : [config[key].param
                ]) : [];
                var execute = "this.addAutoAction(key,config[key].methodName,";
                for (var i = 0; i < param.length; i++) {
                    execute += "param[" + i + "],"
                }
                execute += "config[key].success)";
                eval(execute);
                if (config[key].converter) {
                    this.addDataConverter(key, config[key].converter);
                }
            }
        }
    }
}
/**
 //当对象或者数据只有一个元素时，是否取出子元素，不以对象或者数组格式传参。
 * @param actionName
 * @param isDeal
 */
biDwrCaller.prototype.isDealOneParam = function (actionName, isDeal) {
    if (arguments.length == 1) {
        this._dealOneParam = actionName;
    } else {
        this._dealOneParamAction[actionName] = isDeal;
    }
}
/**
 * 卸载
 */
biDwrCaller.prototype.unload = function () {
    for (var key in this._action) {
        this['doAction' + key] = null;
        delete this['doAction' + key];
    }
    this._action = null;
    this._converter = null;
    this._dealOneParam = null;
    biDwrCaller._runCaller[this._uid] = null;
    this._uid = null;
    this._showProcess = null;
    this._showProcessAction = null;
    this.addAction = null;
    this.addAutoAction = null;
    this._dealOneParamAction = null;
    this.formatString = null;
    this.dwr = null;
    this.isDealOneParam = null;
    this.addDataConverter = null;
    this.format = null;
    this.executeAction = null;
    this.loadAction = null;
    this.isShowProcess = null;
}

/**
 * 对某一个action定义是否显示进度条
 * @param actionName
 * @param isShow
 */
biDwrCaller.prototype.isShowProcess = function (actionName, isShow) {
    if (arguments.length == 1) {
        this._showProcess = actionName;
    } else {
        this._showProcessAction[actionName] = isShow;
    }
}
/**
 * 设置一个静态变量，用于存储调用了biDwrCaller toString方法的 biDwrCaller引用，便于后续恢复对象。
 */
biDwrCaller._runCaller = [];
/**
 * 当此对象序列化成一个String字符串，偏于进行字符串的连接，即此对象可以类似于URL一般
 * 可以用"+”操作符进行参数的连接，连接后的字符串只要用dhx.ajax()调用，自然会还原成原来的对象
 * 并且会组装后面的URL参数（注：不管后面的参数有多少个，依次按照key=value格式组装成hash数据结构传递给
 * dwr方法的最后一个参数），传递给DWR调用，实现了DWR与传统URl调用的无缝整合。
 */
biDwrCaller.prototype.toString = function () {
    return this.formatString;
}
biDwrCaller.prototype.indexOf = function (s, position) {
    return this.formatString.indexOf(s, position);
}

/**
 * 将URL格式字符串字符串转换为DwR对象，并自动处理链接在其后以URL格式的参数，如果此字符串不是由DWR序列而成，返回Null。
 * 设计为静态方法
 * @param s
 * @return object 包含三个属性：dwrCaller:对应dwrCaller对象，appendParam:追加的param参数，runAction:此URL代表要执行的Action
 */
biDwrCaller.format = function (url) {
    var uid = null;
    if (uid = biDwrCaller.isDwrCallerObject(url)) {
        var reg = /^_#{3}biDwrCaller_Object_uid:\d+(([\?|&]{1}[^&|\?|\s|=]+={1}[^&|\?|\s]*)*)/;
        var temp = reg.exec(url);
        var append = null;
        var totalParam = [];
        var runAction = null;
        if (temp && temp.length > 1 && temp[1]) {
            var param = temp[1];
            append = biDwrMethodParam.urlParamFormat(param);
            for (var key in append) {
                if (key == "runAction") {
                    runAction = append[key];
                    delete append[key];
                    continue;
                }
                //判断是否是biDwrMethodParam控件
                if (biDwrMethodParam.isDwrMethodParamObject(append[key])) {
                    totalParam.push(biDwrMethodParam.format(append[key]));
                    delete append[key];
                }
            }
        }
        append = Tools.isEmptyObject(append) ? null : append;
        reg.lastIndex = 0;
        //获取dwrCaller
        var dwrCaller = biDwrCaller._runCaller[uid];
        var result = new Object();
        result.dwrCaller = dwrCaller;
        if (totalParam.length > 0) {
            if (!Tools.isEmptyObject(append)) {
                totalParam.push(append);
            }
            result.appendParam = totalParam;
        } else if (!Tools.isEmptyObject(append)) {
            result.appendParam = [append];
        }
        result.runAction = runAction || "load";
        return result;
    }
}
/**
 * 静态方法判断指定字符串是否是由biDwrCaller对象生成。如果是返回其对象uid，否则为false;
 * @param s
 */
biDwrCaller.isDwrCallerObject = function (s) {
    if (typeof s == "object") {
        s = s.formatString;
    }
    if (s && typeof s == "string") {
        var reg = /^_#{3}biDwrCaller_Object_uid:(\d+)/
        var match = null;
        return s && (match = reg.exec(s)) ? match[1] : false;
    }
    return false;
}
/**
 * 新增一个自动访问action，该Action基于DWr封装，会自动调用对应的Dwr方法，会产生一个名称格式为"doActionXXX"的方法
 * @param actionName action名称，如“load”
 * @param methodName 执行的DWR方法名，以字符串表示，如果页面已经引入了对应的DWR JS文件，则直接可以省略DWR crtl类名。
 * 如"UserCtrlr.login 可以省略为login，注，如果页面上引入的DWR JS文件中有重复的方法名，则必须指定对应的ctrl名，如果
 * Dwr CtrlrJS文件未加载，第一次使用此方法需指明具体的ctrlr，如"UserCtrlr.login ",此方法会自动加载对应的DWR文件，以后
 * 使用即可省略ctrlr
 * @param dwrParam  dwr方法执行的参数，可省略，也可以多个，比如param1,param2.。。。等，也可以使用封装的dwr参数组件biDwrMethodParam
 * 此控件只能有一个，和普通参数不能共存，意思是说设置了biDwrMethodParam，程序就不会读后面的参数了。 如果和一些DHTMX联合使用，一些参数
 * 比如分页，比如tree动态加载的ID会由控件自动提供。
 * @param success  dwr回调函数，远程访问成功即调用此函数，可选，如存在回调，则回调函数必须置于此方法参数的最后一个，且必须是函数
 * 类型。若和DHTMLX联合使用，回调之后需要DHTMLX继续执行下面的动作，比如数据加载，需要返回data或者true，如果需要显示的定义程序就此终止，
 * 不在执行，需直接返回false（注：false之后，程序不会自动执行下面的动作，也可以主动调用afterCall()函数传入data继续执行后面的操作。
 * 如果存在afterCall()函数，将作为第二个参数传递给success回调函数。）
 */
biDwrCaller.prototype.addAutoAction = function (actionName, methodName, dwrParam, success) {
    var parseActionName = "doAction" + actionName;
    this[actionName] = this + "&runAction=" + actionName;
    if (typeof methodName == "string") {
        var splits = methodName.split(".");
        if (splits.length == 2) {
            var ctrl = splits[0];
            if (!window[ctrl]) {//如果未引入ctrl，重新加载JS文件。
                dhx.require("../../../dwr/interface/" + ctrl + ".js");
                dhx.extend(this.dwr, window[ctrl]); //依次继承Dwr中的方法。
            }
        }
    }
    arguments = Array.prototype.slice.call(arguments);
    //参数处理
    if (arguments.length > 2) {
        if (arguments[2] && typeof arguments[2] == "object" &&
            arguments[2]._isBiDwrMethodParam) {//如果是biDwrMethodParam组件对象
            dwrParam = arguments[2];
        } else {//如果只是普通参数。
            var param = [];
            for (var i = 2; i < arguments.length - 1; i++) {
                param[i - 2] = arguments[i]
            }
            dwrParam = param;
        }
        var lastArg = arguments[arguments.length - 1];
        //读取最后一个回调函数,这里将Dwr 简单化，回调只能放在最后一个参数
        if (arguments.length > 2 && lastArg) {
            if (typeof lastArg == "function") {
                success = lastArg;
                //以元数据形式调用dwr
                success = {callback:success};
            } else if (typeof lastArg == "object") {
                if (lastArg.callback || lastArg.dwrConfig) {
                    success = lastArg;
                    //添加转换器配置
                    lastArg.converter && (this.addDataConverter(actionName, lastArg.converter));
                    delete lastArg.converter;
                    //添加是否显示进度条
                    (lastArg.isShowProcess != null || lastArg.isShowProcess != undefined) && (this.isShowProcess(actionName, lastArg.isShowProcess));
                    delete lastArg.isShowProcess;
                    //添加是否进行一个参数时自动处理。
                    (lastArg.isDealOneParam != null || lastArg.isDealOneParam != undefined) && (this.isDealOneParam(actionName, lastArg.isDealOneParam));
                    //进度条信息
                    (lastArg.processMessage && (this.addProcessMessage(actionName, lastArg.processMessage.message || lastArg.processMessage, lastArg.processMessage.title)))
                    delete lastArg.isDealOneParam;
                    delete lastArg.dwrConfig;
                } else {
                    success = undefined;
                }
            } else {
                success = undefined;
            }
            //如果没有回调函数，最后一个参数为参数
            if (dhx.isArray(dwrParam) && !success) {
                dwrParam.push(lastArg);
            }
        } else {
            success = undefined;
        }
    }
    this._action[actionName] = {methodName:methodName, dwrParam:dwrParam, success:success ? success : {}};
    var callback = this._action[actionName].success.callback;
    /**
     * 定义doActionXXX方法，如果定义了一个anction，调用此方法可以执行定义好的Dwr方法。
     * @param afterCallfun dwr回调函数，如果在添加Action的时候已经定义了回调函数，那么此函数的执行原则为：
     * 1、先执行添加Action时候的回调函数，如果此回调函数返回false，此回调函数不能执行。
     * 2、第一个回调函数返回data，此回调函数得以继续执行，此回调函数也作为第二个参数传递给第一个回调函数
     * 所以第一个回调函数可以显示的调用第二个参数然后执行此回调函数。
     * @param extendParam  执行Action时的扩展参数，可为biDwrMethodParam控件和普通参数，当为biDwrMethodParam控件
     * 时，为避免其复杂性，规定只能有一个biDwrMethodParam控件，即程序如果读取到是此控件。此参数索引位让出，其他普通参数依次提前。
     * 对同一索引的参数的合并规则，取决于biDwrMethodParam控件合并规则的具体定义。最后得出的参数是所有参数定义合并集合。
     * 如果是普通参数，则参数将依次添加到DWR方法中。
     */
    this[parseActionName] = function (afterCallfun, extendParam) {
        if (this._showProcess && this._showProcessAction[actionName] != false) {
            dhx.showProgress(this._processMessage && this._processMessage[actionName] && this._processMessage[actionName].title
                , this._processMessage && this._processMessage[actionName] && this._processMessage[actionName].message);
        }
        var action = this._action[actionName];
        var param = action.dwrParam;
        if (param) {
            param = dhx.isArray(param) ? param.slice() : param.buildParam();
        }
        var afterCall = null;
        if (typeof afterCallfun == "function") {
            afterCall = afterCallfun;
        }
        var that = this;
        action.success.callback = function (data) {
            try {
                if (that._converter && that._converter[actionName]) {
                    data = that._converter[actionName].convert(data);
                }
                if (callback) {//调用dwrCaller中的回调进行数据整理
                    var temp = callback.apply(window, [data, afterCall
                        , (this._dealOneParam && this._dealOneParamAction[actionName] != false) ? biDwrMethodParam.dwrOneParamDeal(extendParam) : extendParam]);
                    if (temp != false) {
                        data = temp || data;
                        if (afterCall) {
                            afterCall(data);
                        }
                    }
                    if (that._showProcess && that._showProcessAction[actionName] != false) {
                        dhx.closeProgress();
                    }
                    return true;
                } else {
                    if (afterCall) {
                        afterCall(data);
                    }
                }
            } catch (e) {
//                alert("ERROR:ACTION:"+actionName+"异常:"+e);
                throw e;
            }
            if (that._showProcess && that._showProcessAction[actionName] != false) {
                dhx.closeProgress();
            }
        }
        param = param || [];
        var commonParam = [];
        //扩展参数扫描。
        for (var i = afterCall ? 1 : 0; i < arguments.length; i++) {
            if (arguments[i] && typeof arguments[i] == "object" && arguments[i]._isBiDwrMethodParam) {
                var tempParam = arguments[i].buildParam();
                for (var iii = 0; iii < tempParam.length; iii++) {
                    param[iii] = biDwrMethodParam.connectParam(param[iii], tempParam[iii]);
                }
            } else {//普通参数直接加在末尾。
                commonParam.push(arguments[i]);
            }
        }
        //处理普通参数，依次加在末尾处
        for (var k = 0; k < commonParam.length; k++) {
            param.push(commonParam[k]);
        }
        var dwrFun = action.methodName;
        if (typeof dwrFun == "string") {
            var obj = window;
            //方法处理
            var split;
            if ((split = action.methodName.split(".")).length == 2) { //如果是"XXX.XXX"形式，在window上执行
                dwrFun = window[split[0]][split[1]];
            } else { //只有方法名，在caller上执行
                dwrFun = this.dwr[action.methodName];
                obj = this;
            }
            if (!dwrFun) {
                alert("未找到DWR对应方法：" + action.methodName + ",请确定对应的DWR JS文件是否导入！")
            }
        }
        var paramCount = 0;//参数个数
        /**
         * 由于Dwr2对参数个数检查严格，而有些情况比如分页查询的时候，第一个load分页参数不一定会传至后台，所以会造成参数不匹配的情况发生
         * 这里扫描Dwr函数的形参个数，个数不足以null补齐，个数多了则弹出error，程序停止执行。JS检查DWR参数个数的原理是利用正则表达式去
         * 匹配函数的toString方法转化后的字符串，匹配规则是否匹配"function (p1,p2。。。){...}"函数形式
         */
        var reg = /function\s*\(((\s*[a-zA-Z_]\w*\s*,?)*)\s*\)[\s\n\r]*\{[\s\S]*\}$/;
        var match = reg.exec(dwrFun.toString());
        if (match && match.length > 0) {
            var dwrParamStr = match[1];
            paramCount = dwrParamStr.split(",").length;
        }
        if (param.length + 1 > paramCount) {
            alert("所传参数个数超过了DWR方法定义的长度:" + (paramCount - 1));
            return;
        } else if (param.length + 1 < paramCount) {
            for (var ii = param.length; ii < paramCount - 1; ii++) {
                param[ii] = null;//以null做补充占个位数
            }
        }
        param = (this._dealOneParam && this._dealOneParamAction[actionName] != false)
            ? biDwrMethodParam.dwrOneParamDeal(param) : param;
        //如果有beforeLoad,调用beforeLoad函数。
        if (action.success.onBeforeLoad) {
            if (action.success.onBeforeLoad.call(window, param) == false) {
                //明确指定其不能访问，直接退回。
                return;
            }
        }
        param.push(action.success);

        //调用Dwr方法
        dwrFun.apply(obj, param);
    }
}
/**
 * 添加一个非常灵活的Action，该Action只需提供一个回调函数，该回调函数中可以用Dwr任意访问数据，可以做其他很复杂的逻辑操作，
 * 全由用户自定义
 * @param actionName
 * @param callBack 如果该Action和一些组件联合使用，如grid，tree,treeGrid，callback,load的时候会需要控件做后续操作，比如
 * 数据加载解析动作，这个时候callBack会有afterCall函数，如果访问的过程中控件会传送其他参数，callBack会有第二个参数param,
 * 以对象形式表示，比如分页参数:{posStart:0,count:10}
 */
biDwrCaller.prototype.addAction = function (actionName, callBack) {
    var parseActionName = "doAction" + actionName;
    this._action[actionName] = {success:callBack};
    this[actionName] = this + "&runAction=" + actionName;

    /**
     * 定义doActionXXX方法，如果定义了一个anction，调用此方法可以执行定义好的Dwr方法。
     * @param afterCallfun 控件后续操作函数，afterCall
     * @param extendParam  控件访问传的参数。
     */
    this[parseActionName] = function (afterCallfun, extendParam) {
        var action = this._action[actionName];
        var success = action.success; //用户自定义访问数据，处理逻辑函数。
        //参数处理
        var execCode = "success(afterCallfun"
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                arguments[i] = (this._dealOneParam && this._dealOneParamAction[actionName] != false)
                    ? biDwrMethodParam.dwrOneParamDeal(arguments[i]) : arguments[i];
                execCode += ",arguments[" + i + "]";
            }
        }
        if (this._converter && this._converter[actionName]) {
            execCode += "," + "this._converter[actionName]";
        }
        execCode += ")";
        eval(execCode);
    }
}
/**
 * 为Action添加数据转换器
 * @param action
 * @param converter
 */
biDwrCaller.prototype.addDataConverter = function (action, converter) {
    this._converter = this._converter || {};
    this._converter[action] = converter;
}
/**
 * 进度条提示信息添加
 * @param message
 * @param title
 */
biDwrCaller.prototype.addProcessMessage = function (action, message, title) {
    this._processMessage = this._processMessage || {};
    this._processMessage[action] = {message:message, title:title}
}
/**
 *
 * @param actionName
 */
biDwrCaller.prototype.getActionParam = function (actionName) {
    return this._action[actionName].dwrParam;
}
biDwrCaller.prototype.setActionParam = function (actionName, param) {
    return this._action[actionName].dwrParam = param;
}
/**
 * 执行指定的actionName
 * @param actionName
 */
biDwrCaller.prototype.executeAction = function (actionName, afterCallfun, extendParam) {
    var executeCode = "doAction" + actionName + "(";
    if (arguments.length > 1) {
        var paramStart = 1;
        var paramEnd = arguments.length;
        if (typeof afterCallfun == "function") {//第一个参数是回调函数
            executeCode += "afterCallfun,"
            paramStart = 2;
        } else if (afterCallfun && typeof afterCallfun == "object" && afterCallfun.isConverter) {//第一个参数是转换函数。
            paramStart = 2;
            this.addDataConverter(actionName, afterCallfun);
        } else if (typeof arguments[arguments.length - 1] == "function") {
            executeCode += "arguments[arguments.length-1],"
            paramEnd = arguments.length - 1;
        } else if (typeof arguments[arguments.length - 1] == "object" && arguments[arguments.length - 1].isConverter) {
            paramEnd = arguments.length - 1;
            this.addDataConverter(actionName, arguments[arguments.length - 1]);
        }
        for (var i = paramStart; i < paramEnd; i++) {
            executeCode += "arguments[" + i + "],";
        }
        executeCode = executeCode.substring(0, executeCode.length - 1);
    }
    executeCode += ")";
    if (this["doAction" + actionName]) {
        eval("this." + executeCode);
    }
}
/**
 * 添加加载数据action
 * @param methodName
 * @param dwrParam
 * @param success
 */
biDwrCaller.prototype.loadAction = function (methodName, dwrParam, success) {
    var agrs = Array.prototype.slice.call(arguments);
    agrs.unshift("load");
    this.addAutoAction.apply(this, agrs);
}


/***************************************************************************
 *                  dhx.ajax组件扩展，主要新增dwr访问方式
 ***************************************************************************/
dhx.oldAjax = dhx.ajax;
/**
 * 重写ajax构造函数，调用dwr
 * @param url
 * @param call
 * @param master
 */
dhx.ajax = function (url, call, master) {
    //if parameters was provided - made fast call
    if (arguments.length !== 0) {
        if (!biDwrCaller.isDwrCallerObject(url)) {
            return dhx.oldAjax(url, call.master);
        }
    }
    return new dhx.dwr(url, call, master);//调用dwr

};
/**
 * 扩展dhtmlx ajax函数，新增dwr执行方法。
 * @param bidwrMethod
 * @param action
 */
dhx.dwr = function (bidwrMethod, call, master) {
    this._ajax = new dhx.oldAjax(); //原ajax访问方式
    this._async = true;//表示异步访问。
    this._post = true;
    if (arguments.length != 0 && bidwrMethod) {
        var http_request = new dhx.dwr();
        if (master) {
            http_request.master = master;
        }
        http_request.post(bidwrMethod, null, call);
    }
    if (!this.getXHR) {
        return new dhx.dwr();
    }
    return this;
}

dhx.dwr.prototype = {
    //creates xmlHTTP object
    getXHR:function () {
        if (dhx.env.isIE) {
            return new ActiveXObject("Microsoft.xmlHTTP");
        } else {
            return new XMLHttpRequest();
        }
    },
    /**
     * 用dwr发送数据，
     * @param dwrcaller biDwrCaller对象
     * @param params 追加参数。
     * @param call  回调函数。
     */
    send:function (url, params, call) {
        if (typeof call == "function") {
            call = [call]
        }
        var dwrcaller = biDwrCaller.format(url);
        var action = dwrcaller.runAction;
        var appendParam = dwrcaller.appendParam || [];
        if (params) {
            //如果是数组，直接连接
            if (dhx.isArray(params)) {
                appendParam = appendParam.concat(params);
            } else {//如果是Key=Value形式,解析进去
                var tempParams = biDwrMethodParam.urlParamFormat("&" + params);
                if (tempParams) {
                    if (tempParams._biDwrMethodParam) {
                        appendParam.push(tempParams._biDwrMethodParam);
                        delete tempParams._biDwrMethodParam;
                    } else {
                        if (!Tools.isEmptyObject(tempParams)) {
                            appendParam.push(tempParams);
                        }
                    }
                } else {//如果不是key=value形式，只是一个值
                    appendParam.push(params);
                }
            }

        }
        dwrcaller = dwrcaller.dwrCaller;
        if (!dwrcaller["doAction" + action]) {
            alert("您或许未定义ACtion:" + action);
            return "";
        }
        //设置post参数
        if (typeof dwrcaller._action[action].success == "object") { //自动方式
            dwrcaller._action[action].success.httpMethod = this._post ? "POST" : "GET";
            dwrcaller._action[action].success.async = this._async;
        }
        var self = this;
        var caller = dwrcaller["doAction" + action];
        var after = function (data) {
            //调用此时回调进行后续操作
            if (call && self) {
                for (var i = 0; i < call.length; i++)    //there can be multiple callbacks
                {
                    if (call[i]) {
                        call[i].call((self.master || self), data);
                    }
                }
            }
            //            self.master=null;
            //            call=self=null;	//anti-leak
        };
        appendParam.unshift(after);
        caller.apply(dwrcaller, appendParam);
        //还原同步异步初始值
        this._async = true;
        return this; //return XHR, which can be used in case of sync. mode
    },
    //GET request
    get:function (url, param, call) {
        if (!biDwrCaller.isDwrCallerObject(url)) {
            return this._ajax.get(url, param, call);
        }
        this._post = false;
        return this.send(url, param, call);
    },
    //POST request
    post:function (url, param, call) {
        if (!biDwrCaller.isDwrCallerObject(url)) {
            return this._ajax.post(url, param, call);
        }
        this._post = true;
        return this.send(url, param, call);
    },
    sync:function () {
        this._async = false;//同步访问。
        return this;
    }
};

/***************************************************************************
 *    dtmlXMLLoaderObject组件扩展，DHTMLX大部分组件都是由此组件访问数据
 *    主要新增dwr访问方式
 ***************************************************************************/
/**    重写组建的Load XMl访问方法，新增dwr访问方式。
 *     @desc: load XML
 *     @type: private
 *     @param: filePath - xml file path
 *     @param: postMode - send POST request
 *     @param: postVars - list of vars for post request
 *     @topic: 0
 */
dtmlXMLLoaderObject.prototype.oldloadXML = dtmlXMLLoaderObject.prototype.loadXML;//缓存一个函数。
dtmlXMLLoaderObject.prototype.loadXML = function (filePath, postMode, postVars, rpc) {
    if (!biDwrCaller.isDwrCallerObject(filePath)) {
        return this.oldloadXML(filePath, postMode, postVars, rpc);
    }
    var dhtmlObject = this;
    return new dhx.dwr().send(filePath, postVars, function (data) {
        dhtmlObject._data = data;
        dhtmlObject.oldxmlDoc = this.xmlDoc;
        dhtmlObject.xmlDoc = {};
        //写一个函数，便于执行
        //eval("data="+loader.xmlDoc.responseText);语句。for formJSONLAOD
        dhtmlObject.xmlDoc.responseText = data;
        dhtmlObject.xmlDoc.responseXML = data;
        this._data = data;
        this.oldxmlDoc = this.xmlDoc;
        this.xmlDoc = {};
        //写一个函数，便于执行
        //eval("data="+loader.xmlDoc.responseText);语句。for formJSONLAOD
        this.xmlDoc.responseText = "(function(obj){return obj._data})(this)";
        this.xmlDoc.responseXML = "(function(obj){return obj._data})(this)";
        //forTree JSON
        if (typeof dhtmlObject.onloadAction == "function") {
            try {
                dhtmlObject.onloadAction(dhtmlObject.mainObject, null, null, null, data);
            } catch (e) { //如果解析失败，可能是由于格式问题，因为DHTMX默认是XMl解析。
                if (typeof data == "object") {
                    if (dhtmlObject.mainObject.parse) { //grid/gridtree/view/chat
                        dhtmlObject.mainObject.parse(data, "json");
                    } else if (dhtmlObject.mainObject.loadJSONObject) { //tree
                        dhtmlObject.mainObject.loadJSONObject(data);
                    }
                }
            }
        }
        if (dhtmlObject.waitCall) {
            dhtmlObject.waitCall.call(this, this);
            dhtmlObject.waitCall = null;
            this.xmlDoc = this.oldxmlDoc;
            this.oldxmlDoc = null;
            this._data = null;
        }
    });
}

/***************************************************************************
 *                   dataProcessor组件扩展，
 ***************************************************************************/
/**
 * dataProcessor发送数据核心，扩展参数统一以List<Map> 形式发送。
 * @param a1 所有数据
 * @param rowId  行ID
 */
dataProcessor.prototype._oldSendData = dataProcessor.prototype._sendData;
dataProcessor.prototype._sendData = function (a1, rowId) {
    if (!biDwrCaller.isDwrCallerObject(this.serverProcessor)) {
        return this._oldSendData(a1, rowId);
    }
    if (!a1) {
        return;
    }
    if (!this.callEvent("onBeforeDataSending", rowId ? [rowId, this.getState(rowId), a1] : [null, null, a1])) {
        return false;
    }
    if (rowId) {
        this._in_progress[rowId] = (new Date()).valueOf();
    }
    var a2 = new dtmlXMLLoaderObject(function (that, b, c, d, xml) {
        var atag = xml.data;
        for (var i = 0; i < atag.length; i++) {
            var btag = atag[i];
            var action = btag["type"];
            var sid = btag["sid"];
            var tid = btag["tid"];
            that.afterUpdateCallback(sid, tid, action, btag);
        }
        that.finalizeUpdate();
    }, this, true);
    var a3 = this.serverProcessor + (this._user ? (getUrlSymbol(this.serverProcessor) + ["dhx_user=" + this._user,
        "dhx_version=" + this.obj.getUserData(0, "version")].join("&")) : "");
    var data = [];
    this._waitMode++;
    if (typeof a1 == "string") {
        data.push(a1);
    } else {
        if (typeof rowId != "undefined") {
            a1[rowId] = a1;
        }
        //update，delete，insert参数各自声明。
        var updated = [];
        var deleted = [];
        var inserted = [];
        for (var key in a1) {
            var temp = {};
            for (var subKey in a1[key]) {
                //判断此数据的操作状态。
                if (subKey.indexOf("!nativeeditor_status") != -1) {
                    temp["!nativeeditor_status"] = a1[key][subKey];
                    eval(a1[key][subKey]).push(temp);
                }
                temp[subKey] = a1[key][subKey];
            }
            temp.rowId = key;
            data.push(temp);
        }
        if (a3.indexOf("runAction") == "-1") {//未定义提交Action，则安装模式依次提交。
            if (updated.length > 0) {//提交更改数据
                a2.loadXML(a3 + ((a3.indexOf("?") != -1) ? "&" : "?") + "runAction=update", true, updated);
            }
            if (deleted.length > 0) {
                a2.loadXML(a3 + ((a3.indexOf("?") != -1) ? "&" : "?") + "runAction=deleted", true, deleted);
            }
            if (inserted.length > 0) {
                a2.loadXML(a3 + ((a3.indexOf("?") != -1) ? "&" : "?") + "runAction=insert", true, inserted);
            }
        } else {
            a2.loadXML(a3, true, data);
        }
        return;
    }
    a2.loadXML(a3, true, data);
}
/**
 * 重写init方法，其他对象缓存db属性
 */
dataProcessor.prototype.init = function (anObj) {
    this.obj = anObj;
    if (this.obj._dp_init) {
        this.obj._dp_init(this);
    }
    anObj._dbProcessor = this;
}

/***************************************************************************
 *                   dhtmlXGridObject组件扩展，
 ***************************************************************************/
/**
 * DHTMX组件扩展，新增用户自定义格式化函数。
 * @param columnIndex  行号
 * @param formater formater函数，有三个参数，value：原value，rowData：行数据，columnIndex：行索引。
 */
dhtmlXGridObject.prototype.setColumnCustFormat = function (columnIndex, formater) {
    this._customerFormater = this._customerFormater || [];
    this._customerFormater[columnIndex] = formater;

}

/**
 * 根据行ID获取一行的数据。
 * @param id
 */
dhtmlXGridObject.prototype.getRowData = function (id) {
    try {
        var data = this.cells(id, 0).cell.parentNode._attrs;
        if (this.isTreeGrid()) {
            //为data添加getparentId方法
            data.getParentId = function () {
                return this._pid_temp_;
            }
        }
        for (var i = 0; i < this.cells(id, 0).cell.parentNode.childNodes.length; i++) {
            var td = this.cells(id, 0).cell.parentNode.childNodes[i];
            if (td._cellType) {
                data.data[i] = {value:td._attrs.value, type:td._cellType};
            }
        }
        return data;
    } catch (e) {
        return null;
    }
}

var _oldLoad = dhtmlXGridObject.prototype.load;
/**
 * 重载LOAD方法，如果表格有分页，且每页分页参数的情况下，加入分页参数。
 * @param url
 * @param call
 * @param type
 */
dhtmlXGridObject.prototype.load = function (url, call, type) {
    if (!this.xmlFileUrl)
        this.xmlFileUrl = url;
    if (this.pagingOn) { //如果表格有分页，且每页分页参数的情况下，加入分页参数。
        var pageSize = this.rowsBufferOutSize;
        if (url.indexOf("posStart") == -1 && url.indexOf("count") == -1) {
            url += getUrlSymbol(url) + "posStart=" + 0 + "&count=" + pageSize;
        }
    }
    _oldLoad.call(this, url, call, type);
}

/**
 * DHTMX组件扩展,实现系统默认分页，并采用DWR访问方法，采用工具条形式在表尾添加分页
 * @param pageSize 每页显示行数
 * @param isGoto:是否显示跳转到...页.默认展示。
 * @param perpagenum 是否显示每页显示多少行数据。默认以[15,20,25,30]显示,如果不显示则设置为false
 * @param isShowTotal 是否显示总条数
 */
dhtmlXGridObject.prototype.defaultPaging = function (pageSize, isGoto, perpagenum, isShowTotal) {
    pageSize = pageSize || this.rowsBufferOutSize || 10;
    isGoto = (isGoto == null || isGoto == undefined) ? true : isGoto;
    perpagenum = (perpagenum == null || perpagenum == undefined) ? [15, 20, 25, 30] : perpagenum;
    isShowTotal = (isShowTotal == null || isShowTotal == undefined) ? true : isShowTotal;
    var genstr = Tools.genStr(8);
    //添加分页工具条节点。将dhtmlXGridObject table再次包装。
    //计算grid 高和宽
    var height = this.entBox.clientHeight;
    var width = this.entBox.offsetWidth;
    var div = dhx.html.create("div", {style:"width:100%;height:100%;position: relative;"},
        '<table style="width: 100%;height: 100%"' + 'cellpadding="0" cellspacing="0">' +
            '<tr><td style="text-align: center;vertical-align: middle;"><div id=_gridbox_' + genstr + ' style="background-color:white;overflow:hidden;"></div></td></tr>'
            + '<tr><td  style="height: 25px;text-align:center;vertical-align:middle;width:' + width + '">' +
            '<div style="background-color:white;overflow:hidden;height: 25px;" id="_pagingArea_' + genstr + '"></td></tr></table>');
    var newGridh = height - 25;
    var mygridParent = this.entBox.parentNode;
    var mygridBox = mygridParent.replaceChild(div, this.entBox);
    $("_gridbox_" + genstr).style.height = newGridh + "px";
    $("_gridbox_" + genstr).style.width = width + "px";
    $("_gridbox_" + genstr).parentNode.style.height = newGridh + "px";
    $("_gridbox_" + genstr).parentNode.style.width = width + "px";
    $("_gridbox_" + genstr).appendChild(mygridBox);
    mygridBox.style.height = newGridh + "px";
    this.enablePaging(true, pageSize, 8, '_pagingArea_' + genstr, true);
    this.setPagingSkin("toolbar", getSkin());
    this.setPagingWTMode(true, false, false, false);
    var that = this;
    var currentPerNum = pageSize;
    this.attachEvent("onPaging", function () {
        var pageToolBar = that.aToolBar;
        var state = that.getStateOfView();
        var totalPages = Math.ceil(that.rowsBuffer.length / that.rowsBufferOutSize);
        //构建当前多少页，跳转逻辑。
        if (!pageToolBar._preparePage) {
            pageToolBar.addText("results", NaN, "");
            var width = 125;
            isGoto && (width += 150);
            perpagenum && (width += 50);
            isShowTotal && (width += 50);
            pageToolBar.setWidth("results", width);
            pageToolBar._preparePage = true;
        }
        if (!that.getRowsNum()) {
            pageToolBar.setItemText('results', that.i18n.paging.notfound);
        } else {
            var pageDescWidth = "100";
            var gotoPageWidth = isGoto ? 20 : 0;
            var perpagenumWidth = perpagenum ? 20 : 0;
            pageDescWidth = pageDescWidth - gotoPageWidth - perpagenum;
            pageToolBar.setItemText('results',
                "<table id='_page_table" + genstr + "' style='width:100%;height: 23px;position: relative;padding: 0px;margin-top: -2px' cellpadding='0' cellspacing='0'><tr>" +
                    (perpagenum ? "<td nowrap='nowrap' valign='top' style='width:" + perpagenumWidth + "%''><select style='margin-top:0;height:18px;' id='_perpagenum_" + genstr + "'></select></td>" : "") +
                    "<td nowrap='nowrap' valign='top' style='width:" + pageDescWidth + "%'>" + (isShowTotal ? ("&nbsp;" + that.i18n.paging.total + "&nbsp;" + that.rowsBuffer.length
                    + "&nbsp;" + that.i18n.paging.item + "&nbsp;&nbsp;" + that.i18n.paging.of + totalPages) : "") +
                    that.i18n.paging.page + "&nbsp;&nbsp;&nbsp;" + that.i18n.paging.records + state[0] + that.i18n.paging.page
                    + (isGoto ? ("&nbsp;&nbsp;&nbsp;" + that.i18n.paging.jump + "&nbsp;") : "")
                    + '</td>' + (isGoto ? ('<td valign="top" width="' + gotoPageWidth + '%;" ><form action="" style="padding: 0;position: relative;margin-top: -3px" id="_pageForm' + genstr + '">' +
                    '<input id="_pageInput' + genstr + 'class="dhxlist_txt_textarea" type="text" value=' + state[0] + ' onkeyup= "this.value=this.value.replace(/\\D/g,\'\')" ' +
                    ' onafterpaste= "this.value=this.value.replace(/\\D/g, \'\') " style="width: 20px;position: relative;padding: 0px;height:18px' +
                    '">&nbsp;' + that.i18n.paging.page + '&nbsp;<input style="position: relative;margin-left: 5px; top:3px; cursor:pointer;" id="goto_img" type="image" src="' + getBasePath() + '/meta/resource/images/goButton_icon.jpg"/></form></td>') : "") + '</tr>' + "</table>");
            if (isGoto) {
                var form = $("_pageForm" + genstr);
                form.onsubmit = function () {
                    //获取到要跳转的页数
                    var toPage = parseInt(form.firstChild.value);
                    if (toPage && toPage != "NaN") {
                        if (toPage > totalPages) {
                            toPage = totalPages;
                        }
                        if (toPage < 0) {
                            toPage = 1;
                        }
                        if (toPage == state[0]) {//等于当前页不做处理
                            return false;
                        }
                        that.changePage(toPage);
                    }
                    return false;
                }
                /**
                 * goto图标添加事件
                 * @return {TypeName}
                 */
                var goto_id = document.getElementById("goto_img");
                goto_id.onclick = function () {
                    var toPage = parseInt(form.firstChild.value);
                    if (toPage && toPage != "NaN") {
                        if (toPage > totalPages) {
                            toPage = totalPages;
                        }
                        if (toPage < 0) {
                            toPage = 1;
                        }
                        if (toPage == state[0]) {//等于当前页不做处理
                            return false;
                        }
                        that.changePage(toPage);
                    }
                    return false;
                }
            }
            if (perpagenum) {
                var options = [];
                var isPageSizeIn = false;
                for (var i = 0; i < perpagenum.length; i++) {
                    options.push({value:perpagenum[i], text:perpagenum[i] + "/页"});
                    if (perpagenum[i] == pageSize) {
                        isPageSizeIn = true;
                    }
                }
                !isPageSizeIn && (options.push({value:pageSize, text:pageSize + "/页"}));
                var select = $("_perpagenum_" + genstr);
                Tools.addOption(select, options);
                dwr.util.setValue(select, currentPerNum);
                //加入点击事件
                select.onchange = function () {
                    var value = dwr.util.getValue(select);
                    currentPerNum = parseInt(value);
                    that.rowsBufferOutSize = currentPerNum;
                    that.changePage();
                }
            }
        }
    })
    //修复Grid查询条件变更没有查询且直接点分页按钮时不停的刷新BUG
    this.attachEvent("onDynXLS", function (start, count) {
        var lastLoadStartCnt = start + "," + count;
        var rs = true;
        if (start > 0) {
            if (this.lastLoadStartCnt && this.lastLoadStartCnt == lastLoadStartCnt) {
                rs = false;
            }
        }
        this.lastLoadStartCnt = lastLoadStartCnt;
        return rs;
    })
    //清空上次的分页缓存
    this.attachEvent("onClearAll", function () {
        this.lastLoadStartCnt = undefined;
    })
    return genstr;
};

/**
 * 重写cell4方法，用于生产cell对象，用AOP方式加入用户的格式化函数显示。
 * @param cell
 */
dhtmlXGridObject.prototype.cells4 = function (cell) {
    var type = window["eXcell_" + (cell._cellType || this.cellType[cell._cellIndex])];
    //        alert("eXcell_"+(cell._cellType||this.cellType[cell._cellIndex]))
    var customerFormater = this._customerFormater ? this._customerFormater[cell._cellIndex] : null;
    if (type) {
        var typeObject = new type(cell);
        if (customerFormater) {
            //重写其setValue方法
            typeObject['__setValue'] = typeObject['setValue'];
            typeObject['setValue'] = function (value) {
                typeObject._cellOrgValue = value;
                //之前调用用户的formater
                if (typeof customerFormater == "string") {
                    customerFormater = window[customerFormater];
                }
                value = customerFormater.call(window, value, cell.parentNode.getAttribute("_attrs"), cell._cellIndex);
                typeObject._cellFormatValue = value;
                typeObject['__setValue'].call(typeObject, value);
            }
        }
        return typeObject;
    }
}
/**
 * 扩展一个cell 类型，此类型为操作选择按钮，按钮的参数和dhtmlxtoolbar一致，此类型也是基于其上实现的。
 * 其value是一个函数名，根据回调函数返回一个button列表。
 * @param cell
 */
function eXcell_sb(cell) {
    if (cell) {
        var that = this;
        this.cell = cell;
        this.grid = this.cell.parentNode.grid;
        if (!this.grid._eXcell_sb_event) {
            this.grid.attachEvent("onEditCell", function (stage, rId, cInd, nValue, oValue) {
                if (cInd == that.cell._cellIndex) {
                    return false;//自身不能编辑。
                }
                if (that.grid._headCheckBox != undefined
                    && that.grid._headCheckBox != null) {
                    if (cInd == that.grid._headCheckBox) {//表头的checkbox不编辑
                        return true;
                    }
                }
                if (stage == 0) {//初始化editor
                    that.grid.cells(rId, that.cell._cellIndex).edit();
                }
                return true;
            });
            this.grid._eXcell_sb_event = true;
        }
    }
    this.edit = function () {
        /*    var options = [
         [
         "_default_save","保存操作",getDefaultImagePath() + "save.png",
         function(rowData, cellindex) {
         if (that.grid._dbProcessor) {
         var id = that.grid._dbProcessor.attachEvent("onAfterUpdate", function(sid, tid, action, btag) {
         var correct = (action != "error" && action != "invalid");
         if (correct) {
         that.createSelectButton(that.cell._orgOptions);
         }
         });
         that.grid._dbProcessor.sendData(rowData.id);
         that.grid._dbProcessor.detachEvent(id);
         } else {
         alert("未绑定dataProcessor，不能保存。");
         }
         }
         ],
         [
         "_default_cancel","取消操作",getDefaultImagePath() + "cancel.png",
         function(rowData, cellindex) {
         that.grid.updateGrid(rowData);
         that.createSelectButton(that.cell._orgOptions);
         }
         ]
         ];
         this.createSelectButton(options);*/
    };

    this.isDisabled = function () {
        return this.cell._disabled || this.grid._edtc;
    };
    this.getValue = function () {
        return  this.cell.__oldVal;
    };
    this.createSelectButton = function (options) {
        var that = this;
        this.cell.innerHTML = "";
//        //构建一个表格，用于包装图片按钮。
//        var table = dhx.html.create("table", {style:"width:100%;height:100%;border:",cellpadding:0,cellspacing:0});
        //创建TR子节点
        //import!!浏览器差异！！IE6、7 BUG，TABLE不能通过appendChild(tr)的节点方式添加一行！！！！！
        //只能通过insertRow方法替代！FUCK  IE！
//        var tr = table.insertRow(0);
//        var td ="";
//        tr.style.textAlign = "center";
        var div = dhx.html.create("div", {style:"width:100%;height:100%;display:inline;border:", cellpadding:0, cellspacing:0});
        var rowId = this.cell.parentNode._attrs.id;
        var cellIndex = this.cell._cellIndex;
        for (var i = 0; i < options.length; i++) {
            //依次新建Td
//            td = tr.insertCell(i);
//            td.style.cssText = "border:0px;";
            /*
             var image = dhx.html.create("img", {id:"_image_" + rowId + "_" + cellIndex,
             name:options[i][0],title:options[i][1],alt:options[i][1],src:options[i][2],style:"height:18px;width:18px;cursor:pointer"});
             */
            var a = dhx.html.create("a", {id:"_a_" + rowId + "_" + cellIndex, href:"javascript:",
                style:"height:18px;width:18px;cursor:pointer"});
            var span = dhx.html.create("span", {id:"_span_" + rowId + "_" + cellIndex, style:"padding-right:5px;"});
            a.innerHTML = options[i][1];
            span.appendChild(a);
            div.appendChild(span);
            a.className = options[i][0];
            a._event = options[i][3];
            a.onclick = function (e) {
                e = e || window.event;
                var target = e.target || e.srcElement;
                if (target._event) {
                    target._event.call(window, that.grid.getRowData(that.cell.parentNode._attrs.id), cellIndex)
                    //选中指定行
                    that.grid.doClick(that.cell, true);
                }
            }
            this.cell.appendChild(div);
        }
    }

    this.setValue = function (val) {
        this.cell.__oldVal = val;
//        return;
        if (( typeof (val) != "number") && (!val || val.toString()._dhx_trim() == "")) {
            val = "&nbsp;"
            this.cell._clearCell = true;
        } else {
            this.cell._clearCell = false;
        }
        var buttons = [];
        if (dhx.isArray(val) || typeof window[val] == "object") {
            buttons = val;
        } else if (window[val]) {
            if (typeof window[val] == "function") {//是函数调用函数返回buttons
                buttons = window[val].call(this.grid, this.cell.parentNode.idd, this.cell._cellIndex, this.cell.parentNode._attrs);
            } else if (dhx.isArray(window[val])) {
                buttons = window[val];
            } else if (typeof window[val] == "object") {
                buttons = window[val];
            }
        }

        if (buttons) {
            var options = [];
            for (var key in buttons) {
                if (typeof buttons[key] != "function") {
                    options.push([buttons[key].className||buttons[key].name, buttons[key].text,
                        buttons[key].img || buttons[key].image || buttons[key].imgEnabled || buttons[key].imgDisabled, buttons[key].onclick]);
                }
            }
            this.cell._orgOptions = options;
            this.createSelectButton(options);

        } else {
            this.setCValue(val);
        }
    }

    this.detach = function () {
        return false;
    }

}
eXcell_sb.prototype = new eXcell;

/**
 * 扩展image类型的setValue方法。新增onerror处理
 */
eXcell_img.prototype._setValue = eXcell_img.prototype.setValue;
eXcell_img.prototype.setValue = function (value) {
    this._setValue(value);
    if (this.cell.lastChild.nodeName.toLowerCase() == "img") {//如果是img
        var that = this;
        Tools.addEvent(this.cell.lastChild, "error", function () {
            that.cell.lastChild.src = getBasePath() + "/meta/resource/images/no.png";
        });
    }
}

/**
 * 用户自定义表头关键字函数扩展，使用关键字"#checkBox"即可在表头生成一个选择框。
 * 当点击选择框选中，则对应列所有都选中，当点击该选择框不选，则改列所有选择框
 * 取消选择。注：只对当前页进行操作。
 * @param tag
 * @param index
 * @param data
 */
dhtmlXGridObject.prototype._in_header_checkBox = function (tag, index, data) {
    var html = "";
    for (var i = 0; data && i < data.length; i++) {
        html += data[i];
    }
    var grid = this;
    html = "<img src='" + getDefaultImagePath() + "item_chk0.gif' id='_in_header_checkBox'>";
    tag.parentNode.style.cssText = "vertical-align: middle;text-align:center; ";
    tag.parentNode.setAttribute("valign", "middle");
    tag.parentNode.setAttribute("align", "center");
    tag.style.padding = '0px';
    tag.style.margin = '0px';
    tag.innerHTML = html;
    var image = tag.lastChild;
    image.setAttribute("_checked", false);
    grid.header_checked=image;
    Tools.addEvent(image, "click", function () {
        var state = grid.getStateOfView();
        var setCheckedRows = function (cInd, v) {
            var start = grid.pagingOn ? state[1] : 0;
            var end = grid.pagingOn ? state[2] : grid.getRowsNum();
            if (grid.isTreeGrid()) {
                start = 0;
                end = grid.getRowsNum();
            }
            for (var i = start; i < end; i++) {
                grid.cells(grid.getRowId(i), tag.parentNode._cellIndex).setValue(v);
            }
        };
        var checked = image.getAttribute("_checked");
        var ch_state = 0;
        if (checked != undefined && checked != null && (checked == "true" || checked == true)) {
            ch_state = 0;
            setCheckedRows(tag.parentNode._cellIndex, 0);
            image.setAttribute("_checked", false);
            image.setAttribute("src", image.getAttribute("src").replace("item_chk1", "item_chk0"));
        } else {
            ch_state = 1;
            setCheckedRows(tag.parentNode._cellIndex, 1);
            image.setAttribute("_checked", true);
            image.setAttribute("src", image.getAttribute("src").replace("item_chk0", "item_chk1"));
        }
        if (grid.headerCheckBoxCall) {
            grid.headerCheckBoxCall(grid, ch_state);
        }
    });
    grid._headCheckBox = tag.parentNode._cellIndex;
    grid.attachEvent("onCheck", function (rId, cInd, state) {
        //当选中checkbox，当前行也必须选中。
        if (cInd == tag.parentNode._cellIndex) {
            if (state) {
                grid.selectRowById(rId, this.selMultiRows, false);
            } else {
                for (var i = 0; i < grid.selectedRows.length; i++) {
                    if (grid.selectedRows[i].idd == rId) {
                        var row = grid.rowsAr[rId];
                        row.className = row.className.replace(/rowselected/g, "");
                        grid.selectedRows._dhx_removeAt(i);
                        break;
                    }
                }
            }
        }
        var state = grid.getStateOfView();
        var start = grid.pagingOn ? state[1] : 0;
        var end = grid.pagingOn ? state[2] : grid.getRowsNum();
        if (grid.isTreeGrid()) {
            start = 0;
            end = grid.getRowsNum();
        }
        //如果当前页没有了选择，取消全部选择的框
        if (!state && convertStringToBoolean(image.getAttribute("_checked"))) {
            var haveCheckd = false;
            for (var i = start; i < end; i++) {
                var rowId = grid.getRowId(i);
                if (rowId != rId && grid.cells(rowId, grid._headCheckBox).isChecked()) {
                    haveCheckd = true;
                    break;
                }
            }
            if (!haveCheckd) {
                image.setAttribute("_checked", false);
                image.setAttribute("src", image.getAttribute("src").replace("item_chk1", "item_chk0"));
            }
        } else if (state && !convertStringToBoolean(image.getAttribute("_checked"))) {
            //如果当前为选择，且表头checkBox为未选择，判断是否加上全选上逻辑
            var state = grid.getStateOfView();
            var allCheckd = true;
            for (var i = start; i < end; i++) {
                var rowId = grid.getRowId(i);
                if (rowId != rId && !grid.cells(rowId, grid._headCheckBox).isChecked()) {
                    allCheckd = false;
                    break;
                }
            }
            if (allCheckd) {
                image.setAttribute("_checked", true);
                image.setAttribute("src", image.getAttribute("src").replace("item_chk0", "item_chk1"));
            }
        }

    });
    //添加选中事件，用于当行选中时，其checkbox框也必须选中。
    grid.attachEvent("onRowSelect", function () {
        if (grid._selectCheckedBoxCheck != 2) { //2代表行选中checkbox不跟随选中。
            if (grid._selectCheckedBoxCheck == 0) {//0代表行选中，其他checkbox框不选。
                //先将以前选中的checkbox反选。
                var checks = grid.getCheckedRows(grid._headCheckBox);
                checks = checks ? checks.split(",") : [];
                for (var i = 0; i < checks.length; i++) {
                    grid.cells(checks[i], grid._headCheckBox).setValue(0);
                }
            }
//            var ids = grid.getSelectedId();
//            ids = ids.split(",");
//            for (var i = 0; i < ids.length; i++) {
//                var orgValue=parseInt(grid.cells(ids[i], grid._headCheckBox).getValue());
//                var setValue=grid._selectCheckedBoxCheck==1?(orgValue?0:1):1;
//                grid.cells(ids[i], grid._headCheckBox).setValue(setValue);
//            }
        }
        return true;
    });
    grid.attachEvent("onXLE", function () {
        var state = grid.getStateOfView();
        var checkedCount = 0;
        var start = grid.pagingOn ? state[1] : 0;
        var end = grid.pagingOn ? state[2] : grid.getRowsNum();
        if (grid.isTreeGrid()) {
            start = 0;
            end = grid.getRowsNum();
        }
        var count = end - start;
        for (var i = start; i < end; i++) {
            var cell = grid.cells(grid.getRowId(i), tag.parentNode._cellIndex).cell;
            //取消checkbox框TD的鼠标点击事件，onclick事件
            cell.onmousedown = function (e) {
                e = e || event;
                if (e.preventDefault)e.preventDefault();
                e.cancelBubble = true;
                return false;
            };
            cell.onmouseup = function (e) {
                e = e || event;
                if (e.preventDefault)e.preventDefault();
                e.cancelBubble = true;
                return false;
            };
            cell.onclick = function (e) {
                e = e || event;
                if (e.preventDefault)e.preventDefault();
                e.cancelBubble = true;
                return false;
            };
            Tools.addEvent(cell.parentNode, "click", function (e) {
                if (grid._selectCheckedBoxCheck && grid._selectCheckedBoxCheck == 1 || grid._selectCheckedBoxCheck == 0) {
                    try {
                        var td = (e || window.event).target || (e || window.event).srcElement;
                        var rowId = td.parentNode.idd;
                        var orgValue = parseInt(grid.cells(rowId, grid._headCheckBox).getValue());
                        var setValue = grid._selectCheckedBoxCheck == 1 ? (orgValue ? 0 : 1) : 1;
                        grid.cells(rowId, grid._headCheckBox).setValue(setValue);
                    } catch (e) {
                    }
                }
            });
            if (grid.cells(grid.getRowId(i), tag.parentNode._cellIndex).isChecked()) {
                checkedCount++;
            } else {
                checkedCount--;
            }
        }
        if (count == checkedCount) {
            image.setAttribute("_checked", true);
            image.setAttribute("src", image.getAttribute("src").replace("item_chk0", "item_chk1"));
        } else {
            image.setAttribute("_checked", false);
            image.setAttribute("src", image.getAttribute("src").replace("item_chk1", "item_chk0"));
        }
    });
    tag.style.verticalAlign = "middle";
    if (index == 0) {
        this.setColumnColor("#CCE2FE");
    }
}
/**
 * 此方法用于行选中，checkBox框的选中模式
 * @param mode：0 代表行选中则checkbox框跟随选中，清除其他checkbox选择框。
 *               1 代表行选中则checkbox框跟随选中，但是不清除以前选择的checkbox框，并且再次选择grid取消选择checkbox
 *               2 代表行选中checkbox框不选中
 */
dhtmlXGridObject.prototype.enableSelectCheckedBoxCheck = function (mode) {
    this._selectCheckedBoxCheck = mode;
};

/**
 * dhtmlx原生的事件不支持 行点击事件，此方法提供一个添加Grid行点击事件的接口
 * @param fun 行点击事件方法，此方法3个参数，e, row_id, col_id(可选)
 * wangcs add
 */
dhtmlXGridObject.prototype.attachOnRowClicked = function (fun) {
    if (!this.obj._onrowclick) {
        this.obj._onrowclick = this.obj.onclick;
    }
    var grid = this;
    Tools.addEvent(grid.obj, "click", function (e) {
        var el = grid.getFirstParentOfType(_isIE ? e.srcElement : e.target, "TD");
        if (el) {
            var rowId = el.parentNode.idd;
            if (!(fun.call(grid, e, rowId, el._cellIndex))) {
                return false;
            }
        }
        grid.obj._onrowclick.call(grid.obj, e);
    });
};

/**
 * 删除 行点击事件
 */
dhtmlXGridObject.prototype.removeOnRowClicked = function () {
    if (!this.obj._onrowclick) {
        this.obj.onclick = this.obj._onrowclick;
    }
};

/**
 * 显示行号，默认显示在第一列
 */
dhtmlXGridObject.prototype.showRowNumber = function (ind) {
    this._showRowNumber = true;
    var index = ind || 0;
    this.insertColumn(index, "&nbsp;", "cntr", 25, "na", "center", "middle", null, "#CCE2FE");
}

dhtmlXGridObject.prototype.enableCtrlC = function () {
    this.entBox.onselectstart = function () {
        return true;
    }
    /*this.enableBlockSelection();
     function onKeyPressed(code, ctrl, shift) {
     if (code == 67 && ctrl) {
     this.setCSVDelimiter("\t");
     this.copyBlockToClipboard();
     }
     return true;
     }

     this.attachEvent("onKeyPress", onKeyPressed);*/
}
/**
 * 设置表头对齐方式
 * @param ind
 */
dhtmlXGridObject.prototype.setHeaderAlign = function (alStr) {
    var align = alStr.split(this.delim);
    for (var i = 0; i < align.length; i++) {
        this._hstyles[i] = (this._hstyles[i] || "") + "text-align: " + align[i] + ";";
    }
}

/**
 * 设置表头粗体显示
 * @param ind
 */
dhtmlXGridObject.prototype.setHeaderBold = function () {
    for (var i = 0; i < this.hdrLabels.length; i++) {
        this.hdrLabels[i] = '<span style="font-weight: bold;">' + this.hdrLabels[i] + "</span>"
    }
}


/**
 * 重写排序方法，用于分页情况下动态数据未加载完成时的排序，原DHTMLX存在缺陷。
 * @param col
 * @param type
 * @param order
 */
dhtmlXGridObject.prototype.sortRows = function (col, type, order) {
    //default values
    order = (order || "asc").toLowerCase();
    type = (type || this.fldSort[col]);
    col = col || 0;

    if (this.isTreeGrid()) {
        this.sortTreeRows(col, type, order);
    } else {

        var arrTS = {};

        var atype = this.cellType[col];
        var amet = "getValue";

        if (atype == "link") {
            amet = "getContent";
        }
        if (atype == "dhxCalendar" || atype == "dhxCalendarA") {
            amet = "getDate";
        }
        try {
            for (var i = 0; i < this.rowsBuffer.length; i++) {
                if (this.rowsBuffer[i])//如果数据已经加载，modify by 张伟
                {
                    arrTS[this.rowsBuffer[i].idd] = this._get_cell_value(this.rowsBuffer[i], col, amet);
                }
            }
            this._sortRows(col, type, order, arrTS);
        } catch (e) {
        }
    }
    this.callEvent("onAfterSorting", [col, type, order]);
};
/**
 * 添加默认验证失败，验证成功效果
 */
dhtmlXGridObject.prototype.defaultValidateEvent = function () {
    var that = this;
    this.attachEvent("onLiveValidationError", function (id, ind, value, element, rule) {
        var msg = element._errorMsg;
        dhtmlxValidation.tipEvent(element, false, msg);
        return false;
    });
    this.attachEvent("onLiveValidationCorrect", function (id, ind, value, element, rule) {
        var msg = element._errorMsg;
        dhtmlxValidation.tipEvent(element, true, msg);
        return false;
    });
    this.attachEvent("onValidationError", function (id, ind, value, rule) {
        var cell = that.cells(id, ind).cell;
        if (dhx.isArray(rule)) {
            rule = rule[0];
        }
        var msg = dhtmlxValidation["is" + rule.split('[')[0]]._errorMsg;
        dhtmlxValidation.tipEvent(cell, false, msg);
        return false;
    });
    this.attachEvent("onValidationCorrect", function (id, ind, value, rule) {
        var cell = that.cells(id, ind).cell;
        if (dhx.isArray(rule)) {
            rule = rule[0];
        }
        var msg = dhtmlxValidation["is" + rule.split('[')[0]]._errorMsg;
        dhtmlxValidation.tipEvent(cell, true, msg);
        return false;
    });
};

dhtmlXLayoutObject.prototype.defaultValidateEvent = function () {
    var that = this;
    this.attachEvent("onLiveValidationError", function (id, ind, value, element, rule) {
        var msg = element._errorMsg;
        dhtmlxValidation.tipEvent(element, false, msg);
        return false;
    });
    this.attachEvent("onLiveValidationCorrect", function (id, ind, value, element, rule) {
        var msg = element._errorMsg;
        dhtmlxValidation.tipEvent(element, true, msg);
        return false;
    });
    this.attachEvent("onValidationError", function (id, ind, value, rule) {
        var cell = that.cells(id, ind).cell;
        if (dhx.isArray(rule)) {
            rule = rule[0];
        }
        var msg = dhtmlxValidation["is" + rule.split('[')[0]]._errorMsg;
        dhtmlxValidation.tipEvent(cell, false, msg);
        return false;
    });
    this.attachEvent("onValidationCorrect", function (id, ind, value, rule) {
        var cell = that.cells(id, ind).cell;
        if (dhx.isArray(rule)) {
            rule = rule[0];
        }
        var msg = dhtmlxValidation["is" + rule.split('[')[0]]._errorMsg;
        dhtmlxValidation.tipEvent(cell, true, msg);
        return false;
    });
};
/**
 * 根据rowData更新数据行
 * @param rowDatas  数据集合，按照Dhtmlx grid指定数据结构封装，如果某行的数据Id在表格中不存在即新增一行，
 * 如果找到了指定Id，则用指定数据进行更新，如果是指定如下格式：{
 *     id:xxx ,isRetainSub:true  deleteSub:如果是true, 会将下级菜单保留，并挂靠在父级节点位置，如果未设置此参数
 *     默认删除其子节点。
 * }不存在data数据，则删除对应Id的行，如果是treegrid，则会删除其子行。
 * 此操作会抹去dataprocesser中的标记，所以此操作应该是确定数据操作成功之后调用的方法，目的在于刷新grid数据。
 */
dhtmlXGridObject.prototype.updateGrid = function (rowDatas, mode) {
    /*    var that=this;
     var cancelDb=function(id){
     //如果设置了dataprocessor，取消其标记操作。
     if(that._dbProcessor){
     that._dbProcessor.set_invalid(id, false);
     that._dbProcessor.setUpdated(id, false);
     }
     };*/
    switch (mode) {
        case "insert":
        {
            if (this.isTreeGrid()) {
                if (this.doesRowExist(rowDatas.rows[0]["_pid_temp_"])) {
                    rowDatas.parent = rowDatas.rows[0]["_pid_temp_"];
                    //父节点未展开，展开父节点
                    if (!this.getOpenState(rowDatas.parent)) {
                        this.openItem(rowDatas.parent);
                    }
                }
                this.parse(rowDatas, "json");
            } else {
                //全部加到当前页
                if (this.pagingOn) {
                    var start = this.getStateOfView()[1];
                } else {
                    var start = 0;
                }
                for (var i = 0; i < rowDatas.rows.length; i++) {
                    this.addRow(rowDatas.rows[i].id,
                        this._showRowNumber ? [].concat("", rowDatas.rows[i].data) : rowDatas.rows[i].data, start);
                    //更新数据缓存
                    this.cells(rowDatas.rows[i].id, 0).cell.parentNode._attrs = rowDatas.rows[i];
                }
            }
            break;
        }
        case "update":
        {
            for (var i = 0; i < rowDatas.rows.length; i++) {
                for (var j = 0; j < rowDatas.rows[i].data.length; j++) {
                    this.cells(rowDatas.rows[i].id, this._showRowNumber ? (j + 1) : j).setValue((rowDatas.rows[i].data[j] && rowDatas.rows[i].data[j].value)
                        || rowDatas.rows[i].data[j]);
                    //更新数据缓存
                    this.cells(rowDatas.rows[i].id, 0).cell.parentNode._attrs = rowDatas.rows[i];
                }
            }
            break;
        }
        case "delete":
        {
            rowDatas = dhx.isArray(rowDatas) ? rowDatas : [rowDatas];
            for (var i = 0; i < rowDatas.length; i++) {
                var deleteRowData = this.getRowData(rowDatas[i].id);
                var subItemsData = [];
                var level = [];
                if (this.isTreeGrid()) {
                    if (rowDatas[i].isRetainSub && this.getOpenState(rowDatas[i].id)) {
                        subItemsData.parent = deleteRowData.getParentId();
                        var subIds = this.getSubItems(rowDatas[i].id);
                        subItemsData.rows = subIds ? subIds.split(",") : [];
                        level[rowDatas[i].id] = subItemsData.rows;
                        while (true) {
                            if (level.length > 0) {
                                var nextRowIds = [];
                                for (var key in level) {
                                    if (typeof level[key] != "function") {
                                        for (var j = 0; j < level[key].length; j++) {
                                            var nextRowsData = this.getRowData(level[key][j]);
                                            level[key][j] = nextRowsData;
                                            if (this.getOpenState(nextRowsData.id)) {
                                                subIds = this.getSubItems(nextRowsData.id);
                                                if (subIds) {
                                                    nextRowIds[nextRowsData.id] = subIds.split(",");
                                                    nextRowsData.rows = nextRowIds[nextRowsData.id];
                                                    nextRowsData.open = true;
                                                }
                                            }
                                        }
                                    }
                                }
                                level = nextRowIds;
                            } else {
                                break;
                            }
                        }
                    }
                    this.deleteChildItems(rowDatas[i].id);
                    this.deleteRow(rowDatas[i].id);
                    this.parse(subItemsData, "json");
                } else {
                    this.deleteRow(rowDatas[i].id);
                }
            }
            break;
        }
    }
};
/**
 * 更新grid rowData缓存。
 * @param rowData
 */
dhtmlXGridObject.prototype.setRowData = function (rowData) {
    for (var j = 0; j < rowData.data.length; j++) {
        this.cells(rowData.id, j).setValue(rowData.data[j]);
    }
    //更新数据缓存
    this.cells(rowData.id, 0).cell.parentNode._attrs = rowData;
}
/**
 * 获取第一个指定类型Cell Index
 * @param celltype
 */
dhtmlXGridObject.prototype.getFirstCellIndex = function (celltype) {
    var index = -1;
    for (var i = 0; i < this.getColumnCount() - 1; i++) {
        var type = this.getColType(i);
        if (type == celltype) {
            index = i;
            break;
        }
    }
    return  index;
}
/**
 * 对DHTMLX GRID控件进行扩展，提供一个静态方法用于产生dhtmlXGridObject实例。
 * 产生实例的逻辑如下：1、如果对应的id是div节点。则直接调用构造方法dhtmlXGridObject产生一个普通实例。
 *                     2：如果对应的id是table节点，则调用dhtmlXGridFromTable方法解析HTML产生一个实例
 * 具体文档参考DHTMX文档。除此之外，添加了一些自定义属性，如下所示：
 *  <table id="user"  style="width:100%;"  imgpath="<%=rootPath%>/resource/dhtmlx/imgs/"
 border="1" lightnavigation="true" paging="true" pageSize="15" autoHeight="true">
 <tr heightStyle="height:30px">
 <%--<td width="12"></td>--%>
 <td  width="20" align="center" type="cntr"></td>
 <td  width="30" align="center" type="ch">{#checkBox}</td>
 <td  width="*" align="center">邮件</td>
 <td  width="*" align="center">姓名</td>
 <td  width="*" align="center" >手机号码</td>
 <%--<th field="deptid" width="97" editor="text" align="center">部门</th>--%>
 <td  width="0" align="center">岗位</td>
 <td  width="*" align="center" >岗位</td>
 <td  width="*"  align="center" customerFormater="stateFormatter">状态</td>
 <td  width="*"  align="center" customerFormater="magFlagFormatter">管理权限</td>
 </tr>
 </table>
 新增属性：新增分页属性， 在table节点中定义 paging="true" pageSize="15"，则可实现默认分页。
 autoHeight：自动高度，
 tr节点中设置 heightStyle 可以设置高度等样式
 column 如果没有设置 type属性，默认为不可编辑，如果没有设置sort属性，默认不可排序
 调整表头与表数据相同的对齐方式。
 customerFormater:自定义格式化函数。
 * @param id  节点ID 或者DOM节点
 */
dhtmlXGridObject.instance = function (id) {
    var gridClass = null;
    var node = null;
    if (dwr.util._isHTMLElement(id)) {
        node = id;
    } else {
        node = dwr.util.byId(id);
    }
    if (!node) {
        return null;
    } else {
        if (node.nodeName.toLowerCase() == "table") {
            var _customerFormater = [];
            var tr = node.rows[0];//取得第一个tr节点
            for (var i = 0; i < tr.cells.length; i++) {
                var td = tr.cells[i];
                var type = td.getAttribute("type");//找到type属性
                if (!type) { //如果没有type属性，设置默认的“ron”
                    td.setAttribute("type", "ron");
                }
                var sort = td.getAttribute("sort");
                if (!sort) {
                    td.setAttribute("sort", "na");//默认不排序
                }
                var algin = td.getAttribute("align") || "left";
                //设置表头与列一样的对齐方式
                var text = td.innerHTML;
                var newHtml = '<div style="text-align:' + algin + ';">' + text + "</div>";
                td.innerHTML = newHtml;
                //如果有用户自定义formater
                var customerFormater = td.getAttribute("customerFormater");
                if (customerFormater) {
                    _customerFormater[i] = customerFormater;
                }
            }
            gridClass = new dhtmlXGridFromTable(node);
            //如果设置了customer，加载用户自定义格式化函数
            for (var i = 0; i < _customerFormater.length; i++) {
                if (_customerFormater[i]) {
                    gridClass.setColumnCustFormat(i, _customerFormater[i]);
                }
            }
            if (tr.getAttribute("heightStyle")) {
                gridClass.setStyle(tr.getAttribute("heightStyle"));
            }
            //分页设置。
            var paging = node.getAttribute("paging");
            paging = (paging != undefined && paging != null && paging == "true");
            if (paging) {
                gridClass.defaultPaging(node.getAttribute("pageSize"));
            }
            //高度，宽度样式设置
            var autoHeight = node.getAttribute("autoHeight");
            if (!node.style.width) {
                gridClass.enableAutoWidth(true);
            } else if (autoHeight != undefined && autoHeight != null && autoHeight == "true") {
                gridClass.enableAutoHeight(true);
            }
            gridClass.setSizes();
        } else {
            gridClass = new dhtmlXGridObject(node);
        }
        if (gridClass != null) {
            //设置表皮肤设置。
            gridClass.setImagesPath(getDefaultImagePath());
            gridClass.setSkin(getSkin());
            return gridClass;
        }
    }
};

/***************************************************************************
 *          dhtmlxValidation组件扩展，主要新增验证方式，远程验证等。
 ***************************************************************************/

/**
 * 以下是新增或者对原有的进行修改的验证规则
 */

/**
 * Email 验证
 * @param value
 */
dhtmlxValidation.isValidEmail = function (value) {
    return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(value);
};
/**
 * 最小值验证，用法，设置validate="Min[X]" 即可
 * @param value
 * @param min
 */
dhtmlxValidation.isMin = function (value, min) {
    return  parseFloat(value) >= parseFloat(min);
};
/**
 * 最大值验证,用法，设置validate="Max[X]" 即可
 * @param value
 * @param max
 */
dhtmlxValidation.isMax = function (value, max) {
    return  parseFloat(value) <= parseFloat(max);
};
dhtmlxValidation.isNotEmpty = function (value) {
    if (!Tools.trim(value)) {
        return false;
    } else {
        return (value + "").length > 0;
    }
};
/**
 * 范围区间验证，用法，设置validate="Range[X Y]" 即可
 * @param value
 * @param min
 * @param max
 */
dhtmlxValidation.isRange = function (value, min, max) {
    return  parseFloat(value) >= parseFloat(min) && parseFloat(value) <= parseFloat(max);
};

/**
 * 输入最小长度验证,中文算两个字符，用法，设置validate="MinLength[X]" 即可
 * @param value
 * @param minLength
 */
dhtmlxValidation.isMinLength = function (value, minLength) {
    var cArr = Tools.trim(value).match(/[^\x00-\xff]/ig);
    var len = Tools.trim(value).length + (cArr == null ? 0 : cArr.length);
    return  len >= minLength;
};
/**
 * 输入最大长度值验证，中文算两个字符，用法：设置validate="MaxLength[X]" 即可
 * @param value
 * @param maxLength
 */
dhtmlxValidation.isMaxLength = function (value, maxLength) {
    var cArr = Tools.trim(value).match(/[^\x00-\xff]/ig);
    var len = Tools.trim(value).length + (cArr == null ? 0 : cArr.length);
    return  len <= maxLength;
};
/**
 * 与另一个HTML元素输入相同的值判断,用法：设置validate="EqualTo[元素ID]" 即可
 * @param value
 * @param org
 */
dhtmlxValidation.isEqualTo = function (value, org) {
    var orgValue = dwr.util.getValue(org);
    return   value == orgValue;

};
/**
 * 输入值是否是中文判断
 * @param value
 */
dhtmlxValidation.isChinese = function (value) {
    return /^[/u4E00\-/u9FA5]/g.test(value);
};

/**
 * 输入字符是否是英文字符
 * @param str
 */
dhtmlxValidation.isEnglish = function (str) {
    var result = str.match(/^[a-zA-Z]+$/);
    return result != null;
}
/**
 * 输入值是否是正整数判断
 * @param value
 */
dhtmlxValidation.isPositiveInt = function (value) {
    return /^[1-9]*[0-9][0-9]*$/.test(value);
};
/**
 * 输入值是否是数字
 * @param value
 */
dhtmlxValidation.isNum = function (value) {
    if(isNaN(value)){
    	return "只能输入数字";	
    }else{
    	return true;
    }
};
/**
 * 判断是否是输入字母
 * @param value
 */
dhtmlxValidation.isAlpha = function (value) {
    return /^[a-zA-Z/u00A1\-/uFFFF]*$/.test(value);
};
/**
 * 判断是否是邮政编码
 * @param value
 */
dhtmlxValidation.isZip = function (value) {
    return /^[1-9][0-9]{5}$/.test(value);
};
/**
 * 是否是电话号码
 * @param value
 */
dhtmlxValidation.isMobile = function (value) {
    return /(^0{0,1}1[358][0-9]{9}$)/.test(value);
}

/**
 * 是否非汉字
 * @param value
 */
dhtmlxValidation.isAsic = function (value) {
    return !(/[\u4e00-\u9fa5]+/.test(value))
}
/**
 * 只能输入汉字、字母、数字。不能输入空格
 * @param {Object} value
 * @return {TypeName}
 */
dhtmlxValidation.isIllegalChar = function (value) {
    return /^[_\-a-zA-Z0-9\u4e00-\u9fa5]+$/gi.test(value);
}
/**
 * 远程判断,远程返回true即验证成功，返回其他值验证失败，并作为验证提示，此用dwr的同步访问方法。
 * 用法：设置validate="Remote[dwrCaller组件]" 即可
 * @param value
 * @param dwr
 */
dhtmlxValidation.isRemote = function (value, dwr) {
    var result = null;
    if (arguments.length > 2) { //因为dwr参数是以“&”形式区分，所以在checkValue时，可能会切断，这里重新组合
        for (var i = 2; i < arguments.length; i++) {
            dwr += (dwr.indexOf("?") != -1 ? "&" : "?") + arguments[i];
        }
    }
    dhx.ajax().sync().post(dwr, value, function (data) {
        result = data;
    });
    //数据的返回应为一个object,格式应为{result:true/false,message:XXXX};
    //亦支持验证成功即返回true，失败返回提示消息。
    if (typeof result == "object") {
        return (result.result == "true" || result.result == true) ? true : result.message;
    } else {
        return result;
    }
}
/**
 * 用回调函数实现验证逻辑，用法：设置validate="ValidByCallBack[函数名&参数1&参数2...]" 即可
 * @param value
 * @param callBack  回调函数名，该函数必须在window中已定义。不支持一个对象中的函数。
 * 注意：该回调函数的返回结果可以有以下两种方式：
 * 1、对象式:例，验证成功返回:{result:true,message:""},验证失败返回:{result:false,message:"XXX"};
 * 2、验证成功可以直接返回true，验证失败直接返回一个字符串表示提示信息。
 * @param params  参数集。
 */
dhtmlxValidation.isValidByCallBack = function (value, callBack, params) {
    var fun = window[callBack];
    if (!fun || typeof fun != "function") {
        alert("回调验证函数未定义,默认验证成功！");
        return true;
    }
    var funParam = [value];
    for (var i = 2; i < arguments.length; i++) {
        funParam.push(arguments[i]);
    }
    var result = fun.apply(window, funParam);
    if (typeof result == "object") {
        return (result.result == "true" || result.result == true) ? true : result.message;
    } else {
        return result;
    }
}
/**
 * 重写checkInput方法
 * @param input
 * @param rule
 */
dhtmlxValidation.checkInput = function (input, rule) {
    return this.checkValue(input, rule);
};
/**
 * 获取元素的值
 * @param element
 */
dhtmlxValidation.getValue = function (element) {
    var nowValue = dwr.util.getValue(element);
    var tipInfo = element.getAttribute("_tipInfo");
    if (tipInfo && tipInfo == nowValue) {
        nowValue = "";
    }
    return nowValue;
}
/**
 * 重写实际验证方法，加入本系统逻辑
 * @param value
 * @param rule
 */
dhtmlxValidation.checkValue = function (value, rule) {
    var input = dwr.util._isHTMLElement(value) ? value : null;
    value = input ? dhtmlxValidation.getValue(value) : value;
    var param = [];
    var required = false;//是否为必须。
    var remoteIndex = -1;//远程验证索引位。
    if (typeof rule == "string") {
        //匹配rule1[param1,param2],rule2形式。
        var reg = /(\w+)(\[([^\,&\[\]]*[\,|&]?)*\])?[\,|&]?/g;
        var match = null;
        var temp = rule.replace(/\\,/g, "\\_@_@_@_@_@_").replace(/\\&/g, "\\_@_@_@_@_@_@_");
        rule = [];
        while (match = (reg.exec(temp))) {
            var tempRule = match[1];
            if (match[2]) {
                var paramTemp = [];
                var regParam = /([^\,&\[\]]+)(?!\\)[\,|&]?/g;
                regParam.lastIndex = 1;
                var paramMatch = null;
                while (paramMatch = (regParam.exec(match[2]))) {
                    paramTemp.push(typeof paramMatch[1] == "string"
                        ? paramMatch[1].replace(/\\_@_@_@_@_@_@_/g, "&").replace(/\\_@_@_@_@_@_/g, ",") : paramMatch[1]);
                }
                param[rule.length] = paramTemp;
            }
            if (!this["is" + tempRule]) {
                alert("Incorrect validation rule: " + tempRule);
            }
            this["is" + tempRule]._errorMsg = null;
            if (tempRule == "NotEmpty") {//如果有非空选项，特殊处理
                required = true;
                continue;
            } else if (tempRule == "Remote") {
                remoteIndex = rule.length;
            }
            rule[rule.length] = tempRule;
        }
    }
    //验证顺序处理，远程验证需在最后，为空判断需要在最前。
    if (required) {//如果必填，需先验证。
        rule.unshift("NotEmpty");
        param.unshift([]);
    } else if (remoteIndex >= 0 && remoteIndex < rule.length - 1) {
        //移动元素，将远程验证放在最后。这样可以减少服务器交互次数。
        var ruleRemote = rule[remoteIndex];
        var paramRemote = param[remoteIndex];
        rule[remoteIndex] = rule[rule.length - 1];
        param[remoteIndex] = param[rule.length - 1];
        rule[rule.length - 1] = ruleRemote;
        param[rule.length - 1] = paramRemote;
    }
    for (var i = 0; rule && rule.length && i < rule.length; i++) {
        if (!required && !value) { //如果不是必填，且value为空。不做验证
            return true;
        }
        var checkParam = (param[i] ? (dhx.isArray(param[i]) ? param[i] : [param[i]]) : []).slice();
        checkParam.unshift(value);
        var checkResult = this["is" + rule[i]].apply(this, checkParam);
        if (checkResult == true || checkResult == "true") { //返回true才能算作校验成功。
        } else {
            var errorMsg = null;
            if (typeof checkResult == "string") { //如果返回是字符串。则默认是错误信息
                errorMsg = checkResult;
            } else { //返回false，从模板中取
                errorMsg = this.validateErrorMag["is" + rule[i]];
                if (errorMsg && param[i]) {
                    errorMsg = errorMsg.replace(/\{(\d)\}/g, function ($1) {
                        return param[i][arguments[1]]
                    });
                }
            }
            //记录errorMsg
            if (input) {
                input._errorMsg = errorMsg;
            }
            this["is" + rule[i]]._errorMsg = errorMsg;
            return false;//只要一个未验证通过即返回false
        }
    }
    if (rule && rule.length == 0) {
        throw new Error("rule has probleam");
    }
    return true;
};
/**
 * 为一个元素新增一个验证机制。如果target是个form表单元素，则rule的定义如下:
 * [{
 *   target:表单下的节点ID或者节点
 *   rule:此节点对应的验证rule
 *      noFocus:无聚焦验证(tanwc add)
 *  }]
 * @param target
 * @param rule
 */
dhtmlxValidation.addValidation = function (target, rule, noFocus) {
    var targets = [];
    var rules = [];
    if (typeof rule == "object") {
        $(target)._validationRule = rule;
        rule = dhx.isArray(rule) ? rule : [rule];
        for (var i = 0; i < rule.length; i++) {
            targets[i] = $(rule[i].target);
            rules[i] = rule[i].rule;
        }
    } else {
        targets = [$(target)];
        rules = [rule];
    }
    var beginValidate = function (event) {
        var element = event.target || event.srcElement;
        element._validating = true;
        element._oldValue = undefined;
        (function () {
            if (element._validating) {
                var nowValue = dhtmlxValidation.getValue(element);
                if (nowValue != element._oldValue) {  //值改变才做验证。
                    element._oldValue = nowValue;
                    dhtmlxValidation.validate(element);
                }
                setTimeout(arguments.callee, 200);
            }
        })();
    }
    for (var i = 0; i < targets.length; i++) {
        target = targets[i];
        rule = rules[i];
        if(!target._validationRule){
            dhx.event(target, "focus", beginValidate);
            if (target.readOnly) {
                dhx.event(target, "click", beginValidate);
            }
            dhx.event(target, "blur", function (event) {
                var element = event.target || event.srcElement;
                element._validating = false;
                dhtmlxValidation.hideTip(element);
            });
        }
        target._validationRule = rule;
    }
}
/**
 * 如果对某个元素添加了验证机制，调用此方法即可进行验证
 * @param target
 */
dhtmlxValidation.validate = function (target) {
    var targets = [];
    var rule = $(target)._validationRule;
    if (typeof rule == "object") {
        rule = dhx.isArray(rule) ? rule : [rule];
        for (var i = 0; i < rule.length; i++) {
            targets[i] = $(rule[i].target);
        }
    } else {
        targets[0] = $(target);
    }
    var result = true;
    for (var i = 0; i < targets.length; i++) {
        if (targets[i].style.display == "none") {
            continue;
        }
        dhtmlxValidation.hideTip(targets[i]);
        if (dhtmlxValidation.checkInput(targets[i], targets[i]._validationRule)) {
            dhtmlxValidation.tipEvent(targets[i], true, targets[i]._errorMsg);
            result = result && true;
        } else {
            dhtmlxValidation.tipEvent(targets[i], false, targets[i]._errorMsg);
            result = result && false;
        }
    }
    return result;
}

/**
 *  根据一个rule字符串返回一个rule函数。未找到返回null。
 * @param ruleStr
 */
dhtmlxValidation.getRule = function (ruleStr) {
    var reg = /(\w+)(\[([^\,\s&\[\]]*[\,|\s|&]?)*\])?/g;
    var match = null;
    match = reg.exec(ruleStr);
    if (match) {
        var tempRule = match[1];
        return this["is" + tempRule];
    }
    return null;
}
/**
 * 显示验证提示信息
 * @param target
 * @param message
 */
dhtmlxValidation.showTip = function (target, msg) {
    var box = $(target);
    if (!box._tipUid) {
        box._tipUid = dhx.uid();
    }
    var owner = box._tipUid + "_validate_tip_";
    dhtmlxValidation._tips = dhtmlxValidation._tips || {};
    dhtmlxValidation._tips[owner] = owner;
    var tip = $(owner); //tipId
    if (!tip) {
        tip = dhx.html.create("div", {id:owner, "class":"validatebox-tip"},
            '<span class=validatebox-tip-content id=' + owner + '_span_validatebox-tip-content></span>' +
                '<span class=validatebox-tip-pointer id=' + owner + '_span_validatebox-tip-pointer></span>');
        document.body.appendChild(tip);
    }
    $(owner + "_span_validatebox-tip-content").innerHTML = msg ? msg : box._errorMsg;
    var offset = dhx.html.offset(box);
    tip.style.display = "block";
    tip.style.left = (offset.x + box.offsetWidth) + "px";
    tip.style.top = (offset.y) + "px";
    setTimeout(function () {
        dhtmlxValidation.hideTip(target)
    }, 3000)
};
/**
 * 隐藏提示信息
 * @param target
 */
dhtmlxValidation.hideTip = function (target) {
    var box = $(target);
    var owner = box._tipUid + "_validate_tip_";
    var tip = $(owner);
    if (tip) {
        tip.parentNode.removeChild(tip);
        box._tipUid = null;
    }
};
/**
 * 清除所有错误标签
 */
dhtmlxValidation.clearAllTip = function () {
    for (var key in dhtmlxValidation._tips) {
        var tip = $(key);
        if (tip) {
            tip.parentNode.removeChild(tip);
            dhtmlxValidation._tips[key] = null;
            delete   dhtmlxValidation._tips[key];
        }
    }
}
/**
 * 验证后提示信息的事件处理
 * @param target
 * @param result 验证结果。
 */
dhtmlxValidation.tipEvent = function (target, result, msg) {
    var box = $(target);
    if (result) {//验证成功，去除所有的验证失败默认效果，移除所有验证失败的效果。
        if (box._events) {
            for (var i = 0; i < box._events.length; i++) {
                dhx.eventRemove(box._events[i]);
            }
            box._events = null;
            dhx.html.removeCss(target, "validatebox-invalid");
            this.hideTip(target);
        }
    } else {//验证失败，添加提示信息
        this.showTip(target, msg);
        dhx.html.addCss(target, "validatebox-invalid");
        if (!box._events) {
            var events = [];
            if (dhx.env.isIE) {//ie
                events.push(dhx.event(target, "mouseenter", function () {
                    dhtmlxValidation.showTip(target);
                }));//获得焦点显示
                events.push(dhx.event(target, "mouseleave", function () {
                    dhtmlxValidation.hideTip(target);
                }));//失去焦点显示
            } else { //非浏览器不支持 mouseenter，mouseleave时间，用其他方式模拟。
                events.push(dhx.event(target, "mouseover", function (e) {
                    //判断事件触发的源是否是自身。阻止事件传播
                    var t = e.relatedTarget;
                    var t2 = e.target;
                    if (t2 && t && !(t.compareDocumentPosition(this) & 8)) {
                        dhtmlxValidation.showTip(target);
                    }
                }));
                events.push(dhx.event(target, "mouseout", function (e) {
                    //判断事件触发的源是否是自身。阻止事件传播
                    var t = e.relatedTarget;
                    var t2 = e.target;
                    if (t2 && t && !(t.compareDocumentPosition(this) & 8)) {
                        dhtmlxValidation.hideTip(target);
                    }
                }));
            }
            box._events = events;
        }
    }
};


/***************************************************************************
 *          dhtmlxform组件扩展.
 ***************************************************************************/
/**
 * 重写doAddInput 方法，加入验证机制。
 * @param item
 * @param data
 * @param el
 * @param type
 * @param pos
 * @param dim
 * @param css
 */
(function () {
    dhtmlXForm.prototype.items.template["getInput"] = dhtmlXForm.prototype.items.input["getInput"];
    for (var key in dhtmlXForm.prototype.items) {
        var item = dhtmlXForm.prototype.items[key];
        item._formClass = null;//为每个item新增_formClass属性
        //递归为每个元素赋值当前formObj
        item.addFormClass = function (formObj) {
            for (var key in dhtmlXForm.prototype.items) {
                dhtmlXForm.prototype.items[key]._formClass = formObj;
            }
        }
        if (item.doAddInput) { //如果有doAddInput方法
            var old = item.doAddInput;
            item.doAddInput = function (itemTemp, data, el, type, pos, dim, css) {
                //先调用原方法；
                old.call(this, itemTemp, data, el, type, pos, dim, css);
                var that = this;
                if (data.validate) {
                    var target = itemTemp.lastChild.lastChild;
                    //如果设置了验证,新增validate方法。
                    itemTemp["validate"] = function () {
                        var formObj = that._formClass;
                        //如果有equalTo验证，先找到其元素
                        var validatedata = data.validate.replace(/(EqualTo\[)(\w+)(\])/g, function () {
                            var id = arguments[2];
                            if (id = formObj.getInput(id) || formObj.getSelect(id)) {
                                id = id.id;
                            }
                            return arguments[1] + id + arguments[3];
                        });
                        var r = dhtmlxValidation.checkInput(target, validatedata);
                        if (formObj) {
                            if (!(formObj.callEvent("onValidate" + (r ? "Success" : "Error"),
                                [target, formObj.getItemValue(data.name) || "", r]) === false)) {
                                formObj.setValidateCss(name, r);
                            }
                        }
                        return r;
                    };
//                    //新增重置错误信息方法
//                    itemTemp['_resetValidateCssDefault'] = function(){
//                        dhx.html.removeCss(target, "validatebox-invalid");
//                        dhtmlxValidation.hideTip(target);
//                    };
                    //添加事件
                    dhx.event(target, "blur", function (event) {
                        var element = event.target || event.srcElement;
                        element._validating = true;
                        element._oldValue = undefined;
                        (function () {
                            if (element._validating) {
                                if (dwr.util.getValue(element) != element._oldValue) {  //值改变才做验证。
                                    element._oldValue = dwr.util.getValue(element);
                                    element && element.parentNode && element.parentNode.parentNode && (element.parentNode.parentNode.validate());
                                }
                                setTimeout(arguments.callee, 200);
                            }
                        })();
                    });
                    dhx.event(target, "blur", function (event) {
                        var element = event.target || event.srcElement;
                        element._validating = false;
                        dhtmlxValidation.hideTip(element);
                    });
                }
            };
        }
    }
})();

/**
 * 默认验证事件处理，格式处理
 */
dhtmlXForm.prototype.defaultValidateEvent = function () {
    for (var key in this.objPull) {
        this.objPull[key].addFormClass(this);
        break;
    }
    //覆盖其验证方法
    this.validate = function (type) {
        if (type != "nestedFormCall") {
            if (this.callEvent("onBeforeValidate", []) == false) {
                return;
            }
        }
        var completed = true;
        // validation
        for (var a in this.itemPull) {
            var name = this.itemPull[a]._idd;
            try {
                var val = (this.getItemValue(name) || "");
            } catch (e) {
                var val = "";
            }
            var item = this.itemPull[a];
            var r = true;
            var isValidate = false;

            if (item.validate) {
                r = item.validate();
                isValidate = true;
            }

            isValidate && (completed = (completed && r));

            if (this.itemPull[a]._list) {
                for (var q = 0; q < this.itemPull[a]._list.length; q++) {
                    var subItem = this.itemPull[a]._list[q];
                    subItem.validate = arguments.callee;
                    completed = (subItem.validate("nestedFormCall") && completed);
                }
            }
        }

// after validate
        if (type != "nestedFormCall") {
            this.callEvent("onAfterValidate", [completed]);
        }
        return completed;
    };
    //重写重置错误信息方法
    this.resetValidateCss = function () {
        dhtmlxValidation.clearAllTip();

//        for(var a in this.itemPull){
//            if(this.itemPull[a]._resetValidateCssDefault){
//                this.itemPull[a]._resetValidateCssDefault();
//            }
//            if(this.itemPull[a]._list != null){
//                for(var q = 0; q < this.itemPull[a]._list.length; q++){
//                    var subItem = this.itemPull[a]._list[q];
//                    subItem.resetValidateCss = arguments.callee;
//                    subItem.resetValidateCss()
//                }
//            }
//        }
    }
    this.attachEvent("onValidateSuccess", function (input, value, result) {
        var msg = input._errorMsg;
        dhtmlxValidation.tipEvent(input, true, msg);
        return false;
    });
    this.attachEvent("onValidateError", function (input, value, result) {
        var msg = input._errorMsg;
        dhtmlxValidation.tipEvent(input, false, msg);
        return false;
    });
}
/**
 * 覆盖dhtmlx。js中的BUG。
 * @param a
 * @param b
 * @param c
 */
dhtmlXForm.prototype.load = function (a, b, c) {
    var d = this;
    d.callEvent("onXLS", []);
    typeof b == "function" && (c = b, b = "xml");
    dhtmlxAjax.get(a, function (e) {
        var f = {};
        if (b == "json") {
//            eval("data=" + e.xmlDoc.responseText);//源代码
            eval("f=" + e.xmlDoc.responseText); //修改处
        } else {
            for (var g = e.doXPath("//data/*"),
                     h = 0; h < g.length; h++) {
                f[g[h].tagName] = g[h].firstChild ? g[h].firstChild.nodeValue : "";
            }
        }
        var i = a.match(/(\?|\&)id\=([a-z0-9_]*)/i);
        i && i[0] && (i = i[0].split("=")[1]);
        if (d.callEvent("onBeforeDataLoad", [i, f])) {
            d.formId = i, d._last_load_data = f, d.setFormData(f), d.resetDataProcessor("updated");
        }
        d.callEvent("onXLE", []);
        c && c.call(this)
    })
};
/***************************************************************************
 *          dhtmlXToolbarObject组件扩展.
 ***************************************************************************/
/**
 * 扩展dhtmlXToolbarObject，新增下拉框
 * @param that
 * @param id
 * @param data
 */
dhtmlXToolbarObject.prototype._comboObject = function (that, id, data) {
    this.id = that.idPrefix + id;
    this.width = data.width;
    this.ladbel = data.label;
    var commboDiv = document.createElement("DIV");
    commboDiv.style.paddingTop = "0px";
    commboDiv.style.paddingBottom = "0px";
    commboDiv.style.position = "relative";
    commboDiv.style.width = data.width || "40";
    that.base.appendChild(commboDiv);
    var combo = new dhtmlXCombo(commboDiv, data.ladbel);
    dhx.extend(this, combo, true);
    return this;
}
/**
 * 根据ID获取元素对象
 * @param id
 */
dhtmlXToolbarObject.prototype.getItemById = function (id) {
    return  this.objPull[this.idPrefix + id];
}
/**
 * 根据ID获取元素节点
 * @param id
 */
dhtmlXToolbarObject.prototype.getItemNodeById = function (id) {
    return  this.objPull[this.idPrefix + id].obj;
}

/***************************************************************************
 *             htmlXCombo组件扩展.
 ***************************************************************************/
/**
 * 重写_fillFromXML方法，以JSON格式解析。
 * JSON格式数据处理,JSON格式的数据应该为{
 *    {add:true,options:[{value:'asd',text:'as',selected:false,img_src:"",checked:0}]}
 * @param obj
 * @param b
 * @param c
 * @param d
 * @param xml
 */
dhtmlXCombo.prototype._fillFromXML = function (obj, b, c, d, xml) {
    var top = xml;
    var options = xml.options;
    var add = false;
    obj.render(false);
    if (top.add && convertStringToBoolean(top.add)) {
        obj.clearAll();
        obj._lastLength = options.length;
        if (obj._xml) {
            if ((!options) || (!options.length)) {
                obj.closeAll();
            } else {
                if (obj._activeMode) {
                    obj._positList();
                    obj.DOMlist.style.display = "block";
                    if (_isIE) {
                        obj._IEFix(true);
                    }
                }
            }
        }
    } else {
        obj._lastLength += options.length || Infinity;
        add = true;
    }
    var selected = null;
    for (var i = 0; i < options.length; i++) {
        var attr = options[i];
        obj._addOption(attr);
        if (attr.selected) {
            selected = attr;
        }
    }
    obj.render(add != true || (!!options.length));

    if ((obj._load) && (obj._load !== true)) {
        obj.loadXML(obj._load);
    } else {
        obj._load = false;
        if ((!obj._lkmode) && (obj._filter)) {
            obj._correctSelection();
        }
    }
    if (selected) {
        obj.selectOption(obj.getIndexByValue(selected.value), false, true);
    }
    obj.callEvent("onXLE", []);
}
/**
 * Combo加载JSON格式的数据
 * SON格式数据处理,JSON格式的数据应该为{
 *    {add:true,options:[{value:'asd',text:'as',selected:false,img_src:"",checked:0}]}
 */
dhtmlXCombo.prototype.loadData = function (data) {
    var selected = null;
    var options = data.options || data;
    for (var i = 0; i < options.length; i++) {
        var attr = options[i];
        this._addOption(attr);
        if (attr.selected) {
            selected = attr;
        }
    }
    if (selected) {
        this.selectOption(this.getIndexByValue(selected.value), false, true);
    }
    this.callEvent("onXLE", []);
};
/**
 * 重写 ，原方法 attr.value=0时有BUG
 * @param attr
 */
dhtmlXCombo.prototype._addOption = function (attr) {
    var op = new this._optionObject();
    op.text = (attr.text != null && attr.text != undefined) ? attr.text : "";
    op.value = (attr.value != null && attr.value != undefined ) ? attr.value : "";
    op.css = (attr.css != null && attr.css != undefined) ? attr.css : "";
    op.selected = attr.selected || false;
    this.optionsArr.push(op);
    this.redrawOptions();
};
/**
 * 隐藏缩放按钮
 * @param area 指定区域的缩放按钮隐藏，如不设置此值，将隐藏所有的缩放按钮。
 */
dhtmlXLayoutObject.prototype.hideConcentrate = function (area) {
    for (var a in this.polyObj) {
        if (area) {
            if (a != area) {
                continue;
            }
        }
        this.polyObj[a].childNodes[0].firstChild.childNodes[4].onclick = "";
        this.polyObj[a].childNodes[0].firstChild.childNodes[4].style.backgroundImage = "url('')";
    }
}
/**
 * 修复mainCount的height>dhxCount的BUG
 * @param id
 */
var _olddhtmlXLayoutObject = dhtmlXLayoutObject;
var dhtmlXLayoutObject = function (base, view, skin) {
    var layout = new _olddhtmlXLayoutObject(base, view, skin);
    var oldAttachGrid = layout.polyObj['a'].attachGrid;
    for (var a in layout.polyObj) {
        layout.polyObj[a].attachGrid = function () {
            if (this.vs[this.av].dhxcont.offsetHeight < this.vs[this.av].dhxcont.mainCont[this.av].offsetHeight) {
                this.vs[this.av].dhxcont.mainCont[this.av].style.height = this.vs[this.av].dhxcont.style.height;
            }
            return oldAttachGrid.apply(this, arguments);
        }
    }
    dhx.extend(this, layout, true);
}
/**
 * 移除指定索引的分割边框
 * @param splitFlag：分割边框的标记，表示横向或者是纵向，横向分割标记为"ver",纵向标记为"hor",如果此参数
 * 未设置，将移除所有的分割框
 * @param index 对应横向或者纵向分割栏的索引，从0开始，如果此参数未设置，将删除对应标记的所有分割框。
 */
dhtmlXLayoutObject.prototype.hideSpliter = function (splitFlag, index) {
    /*  for (var q = 0; q < this.sepHor.length; q++) {
     if (index != undefined && index != null) {
     if (index != q) {
     continue;
     }
     }
     //计算兄弟节点高度，将其高度增加。
     var height = this.sepHor[q].offsetHeight;
     this.sepHor[q].parentNode.style.display = "none";
     //递归节点下的子节点，依次增加其高度。
     (function (node) {
     if (new RegExp("(^|\\s)dhxcont_global_content_area(\\s|$)").test(node.className)) {
     node.style.borderBottomWidth = "0px";
     return;
     }
     arguments.callee.call(this, node.lastChild);
     })(this.sepHor[q].parentNode.previousSibling);
     //下一个TR节点下的主DIV 高度增加
     (function (node) {
     node.style.height = (node.offsetHeight + height) + "px";
     if (new RegExp("(^|\\s)dhxcont_global_content_area(\\s|$)").test(node.className)) {
     node.getElementsByTagName("div")[0].style.height = (node.offsetHeight + height) + "px";
     return;
     }
     arguments.callee.call(this, node.lastChild);
     })(this.sepHor[q].parentNode.nextSibling);
     this.sepHor[q].parentNode.parentNode.removeChild(this.sepHor[q].parentNode);
     }
     for (var q = 0; q < this.sepVer.length; q++) {
     if (index != undefined && index != null) {
     if (index != q) {
     continue;
     }
     }
     //计算兄弟节点宽度，将其宽度增加。
     var width = this.sepVer[q].offsetWidth;
     this.sepVer[q].style.display = "none";
     //递归节点下的子节点，依次增加其宽度
     (function (node) {
     if (new RegExp("(^|\\s)dhxcont_global_content_area(\\s|$)").test(node.className)) {
     node.style.borderRightWidth = "0px";
     node.style.border = "0px";
     //                node.style.border="1px A4BED4 solid";
     return;
     }
     arguments.callee.call(this, node.lastChild);
     })(this.sepVer[q].previousSibling);
     }*/
}
/**
 * 覆盖loadJSOn方法，修改其获参方式
 * @param file
 * @param afterCall
 */
dhtmlXTreeObject.prototype.loadJSON = function (file, afterCall) {
    if (!this.parsCount) {
        this.callEvent("onXLS", [this, this._ld_id]);
    }
    this._ld_id = null;
    this.xmlstate = 1;
    var that = this;

    this.XMLLoader = new dtmlXMLLoaderObject(function () {
        try {
            //  eval("var t="+arguments[4].xmlDoc.responseText);
            //修改为:
            var t = arguments[4];
        } catch (e) {
            dhtmlxError.throwError("LoadXML", "Incorrect JSON", [
                (arguments[4].xmlDoc),
                this
            ]);
            return;
        }
        var p = new jsonPointer(t);
        that._parse(p);
        that._p = p;
    }, this, true, this.no_cashe);

    if (afterCall) {
        this.XMLLoader.waitCall = afterCall;
    }
    this.XMLLoader.loadXML(file);
};
/**
 * 从根节点清空树
 * @param rootId
 */
dhtmlXTreeObject.prototype.clearAll = function (rootId) {
    rootId = rootId || 0;
    var childs = this.getSubItems(rootId);
    if (childs) {
        var childIds = childs.toString().split(",");
        for (var i = 0; i < childIds.length; i++) {
            this.deleteItem(childIds[i]);
        }
    }
};

/**
 * 获取兄弟节点 ，先正序找，没找到再反序找
 * @param nodeId 节点ID
 * @param filterFun 过滤函数  当存在时会忽略pos,当过滤回调返回true时表示是兄弟
 * @param pos 兄弟位置，默认为1，下一个，可传 -1
 * @author 王春生
 */
dhtmlXTreeObject.prototype.getSiblingItem = function (nodeId, filterFun, pos) {
    if (nodeId == this.rootId) {
        return null;
    }
    if (arguments.length > 1) {
        for (var x = 1; x < arguments.length; x++) {
            if (typeof(arguments[x]) == "function") {
                filterFun = arguments[x];
            } else if (!isNaN(arguments[x])) {
                pos = arguments[x];
            }
        }
    }
    if (pos == null || pos == undefined || pos == 0) {
        pos = 1;
    }
    var pid = this.getParentId(nodeId);
    var childs = this.getSubItems(pid);
    if (childs) {
        var childIds = childs.toString().split(",");
        for (var i = 0; i < childIds.length; i++) {
            if (nodeId == childIds[i]) {
                if (filterFun) {
                    for (var j = 1; ; j++) {
                        if (childIds[i + j]) {
                            if (filterFun.call(this, childIds[i + j])) {
                                return childIds[i + j];
                            }
                        } else {
                            for (var k = i - 1; k >= 0; k--) {
                                if (childIds[k]) {
                                    if (filterFun.call(this, childIds[k])) {
                                        return childIds[k];
                                    } else {
                                        return null;
                                    }
                                }
                            }
                            return null;
                        }
                    }
                } else {
                    if (childIds[i + pos]) {
                        return childIds[i + pos];
                    } else if (childIds[i - 1]) {
                        return childIds[i - 1];
                    }
                    return null;
                }
            }
        }
    }
};

/**
 * 此方法用于在树加载完成之后，从指定父节点起所有的字节点依次用radio或者checkBox代替 (不包括父节点)
 * 前提，此树必须支持checkBox。
 * @param mode
 * @param root
 */
dhtmlXTreeObject.prototype.enableAllRadios = function (root, mode) {
    //中序遍历树，依次替换。
    this.enableRadioButtons(mode);
    var nextScan = this.getSubItems(root);
    nextScan = nextScan ? nextScan.toString().split(",") : [];
    mode = convertStringToBoolean(mode);
    while (true) {
        var temNext = [];
        if (nextScan.length) {
            for (var i = 0; i < nextScan.length; i++) {
                var node = this._globalIdStorageFind(nextScan[i]);
                node._r_logic = mode;
                this._setCheck(node, node.checkstate);
                temNext = temNext.concat(!this.getSubItems(nextScan[i]) ? [] : this.getSubItems(nextScan[i]).toString().split(","));
            }
            nextScan = temNext;
        } else {
            break;
        }
    }
};
/**
 * 判断某个节点的下级是否全选
 * @param itemId
 */
dhtmlXTreeObject.prototype.allCheckedState = function (itemId) {
    if (itemId != null || itemId != undefined) {
        var subs = this.getSubItems(itemId)+"";
        if (subs) {
            subs = subs.split(",");
            for (var i = 0; i < subs.length; i++) {
                var checkState= this.isItemChecked(subs[i]);
                if (checkState&&checkState!=3) {
                    return 1;
                }
            }
        }
        return 0;
    }
    return 1;
}
/**
 * 该方法允许节点外漂浮全选/不全选按钮
 */
dhtmlXTreeObject.prototype.enableSmartCheck = function () {
    //必须生成新的div  不然会有BUG
    if ($("__treeSelectDiv")) {
        $("__treeSelectDiv").parentNode.removeChild($("__treeSelectDiv"));
    }
    var div = document.createElement("div");
    div.style.cssText = "display:none;width:50px;position: absolute;z-index: 10000000000";
    div.id = "__treeSelectDiv";
    div.innerHTML = '<input type="checkbox" name="__treeSelect" id="_treeSelectAll" >全选';
    document.body.appendChild(div);
    this.attachEvent("onMouseIn", function (nodeid) {
        var showDiv = $("__treeSelectDiv");
        showDiv.tree = this;
        dwr.util.setValue("_treeSelectAll", this.allCheckedState(nodeid));
        if (this.getAllSubItems(nodeid)) {
            showDiv.mouseObjId = nodeid;
            var temp = this._globalIdStorageFind(nodeid);
            var t = temp.htmlNode.childNodes[0].childNodes[0].childNodes[3].childNodes[0];
            showDiv.style.display = "inline";
            var os = dhx.html.offset(t);
            var divPos = dhx.html.offset(this.allTree);
            showDiv.style.top = os.y + "px";
            var left = os.x + t.offsetWidth;
            if (left > divPos.x + this.allTree.offsetWidth - 20) {
                left = divPos.x + this.allTree.offsetWidth - 20;
            }
            showDiv.style.left = left + "px";
        } else {
            showDiv.style.display = "none";
            showDiv.mouseObjId = null;
        }
    });
    this.attachEvent("onMouseOut", function (id) {
        var showDiv = $("__treeSelectDiv");
        if (showDiv) {
            showDiv.style.display = "none";
        }
    });
    $("__treeSelectDiv").onmouseover = function () {
        this.style.display = "inline";
    }
    $("__treeSelectDiv").onmouseout = function () {
        var showDiv = $("__treeSelectDiv");
        if (showDiv) {
            showDiv.style.display = "none";
        }
    }
    Tools.addEvent($("_treeSelectAll"), "click", function (e) {
        var target = (e || window.event).target || (e || window.event).srcElement;
        var showDiv = $("__treeSelectDiv");
        if (showDiv.mouseObjId != null && showDiv.mouseObjId != undefined) {
            var checkValue = dwr.util.getValue("_treeSelectAll");
            var checkIds = showDiv.tree.getSubItems(showDiv.mouseObjId);
            if (checkIds) {
                checkIds = (checkIds+"").split(",");
            } else {
                checkIds = [];
            }
            for (var i = 0; i < checkIds.length; i++) {
                showDiv.tree.setCheck(checkIds[i], target.checked);
                showDiv.tree.callEvent("onCheck", [checkIds[i], target.checked, true, false])
            }
        }
    })
}


/**
 * 重写DHTMX Combo方法，去掉打开选择面板时的过滤方法；加上动态改变面板宽度的接口
 */
dhtmlXCombo.prototype.openSelect = function () {
    if (this._disabled) return;
    this.closeAll();
    this._positList();
    this.DOMlist.style.display = "block";
    this.callEvent("onOpen", []);
    if (this._tempSel) this._tempSel.deselect();
    if (this._selOption) this._selOption.select();
    if (this._selOption) {
        var corr = this._selOption.content.offsetTop + this._selOption.content.offsetHeight - this.DOMlist.scrollTop - this.DOMlist.offsetHeight;
        if (corr > 0) this.DOMlist.scrollTop += corr;
        corr = this.DOMlist.scrollTop - this._selOption.content.offsetTop;
        if (corr > 0) this.DOMlist.scrollTop -= corr;
    }
    if (Tools && Tools.autoPosition) {
        var pos = Tools.autoPosition(this.DOMlist, this.DOMelem);
        this.DOMlist.style.width = this.DOMelem.offsetWidth - 2 + "px";
    }

    var max = 0;
    for (var i = 0; i < this.optionsArr.length; i++) {
        this.optionsArr[i].hide(false);
        var text = this.optionsArr[i].text;
        var le = text.replace(/[^\x00-\xff]/g, "**").length;
        if (max < le) {
            max = le;
        }
    }
    if (this.auto_list_width) {
        var x = this.DOMlist.offsetWidth;
        this.DOMlist.style.width = (x < max * 6.5) ? max * 6.5 : x + "px";
    }
    if (_isIE) this._IEFix(true);
    this.DOMelem_input.focus();
};


/**
 *  this.DOMelem_input.focus(); 处理在IE下报错的问题
 * @param data
 * @param status
 */
dhtmlXCombo.prototype._confirmSelection = function(data,status){
    if(arguments.length==0){
        var z=this.getOptionByLabel(this.DOMelem_input.value);
        data = z?z.value:this.DOMelem_input.value;
        status = (z==null);
        if (data==this.getActualValue()) return;
    }
    try{
        this.DOMelem_input.focus();
    }catch(e){};
    this.DOMelem_hidden_input.value=data;
    this.DOMelem_hidden_input2.value = (status?"true":"false");
    this.callEvent("onChange",[]);
    this._activeMode=false;
}

/**
 * 根据最大项的宽度自动改变选择面板的宽度
 * @param mode
 */
dhtmlXCombo.prototype.setAutoOpenListWidth = function (mode) {
    this.auto_list_width = mode;
};

/**
 * 显示或隐藏一个树的checkbox
 * @param id
 * @param mode
 */
dhtmlXTreeObject.prototype.showHideCheckNode = function (id, mode) {
    this.hideChecks_ = this.hideChecks_ || {};
    var hnd = this._globalIdStorageFind(id);
    if (!hnd)return;
    hnd = hnd.htmlNode.childNodes[0].childNodes[0].childNodes[1].childNodes[0];
    hnd.style.visibility = mode ? "visible" : "hidden";
    if (mode && this.hideChecks_[id]) {
        delete this.hideChecks_[id];
    } else {
        this.hideChecks_[id] = 1;
    }
};

/**
 * 清楚隐藏checkbox
 * @param id
 * @param mode
 */
dhtmlXTreeObject.prototype.clearAllSubHideCheckNode = function (id) {
    var subid = this.getAllSubItems(id);
    subid = subid.split(",");
    for (var i = 0; i < subid.length; i++) {
        if (this.hideChecks_[subid[i]])
            this.showHideCheckNode(subid[i], 1);
    }
};

/**
 * 清楚隐藏的节点
 */
dhtmlXTreeObject.prototype.clearHideCheckNode = function () {
    this.hideChecks_ = this.hideChecks_ || {};
    for (var id in this.hideChecks_)
        this.showHideCheckNode(id, 1);
};

/**
 * 动态加载函数执行方式时，原实现未传tree参数
 * @param id
 * @param src
 */
dhtmlXTreeObject.prototype._loadDynXML = function (id, src) {
    src = src || this.XMLsource;
    var sn = (new Date()).valueOf();
    this._ld_id = id;
//#__pro_feature:01112006{
    if (this.xmlalb == "function") {
        DWREngine.setAsync(false);
        if (src) src(this._escape(id), this);
        DWREngine.setAsync(true);
        if (!(this.getSubItems(id))) {
            var temp = this._globalIdStorageFind(id);
            if (temp)
                this._HideShow(temp, 1);
        }
    }
    else
    if (this.xmlalb == "name")
        this.loadXML(src + this._escape(id));
    else
    if (this.xmlalb == "xmlname")
        this.loadXML(src + this._escape(id) + ".xml?uid=" + sn);
    else
//#}
        this.loadXML(src + getUrlSymbol(src) + "uid=" + sn + "&id=" + this._escape(id));
};

/**
 * 扩展，用于grid绑定二维数组和map
 * @param data
 */
dhtmlXGridObject.prototype._process_arraymap = function (data) {
    this._parsing = true;
//    if (data&&data.xmlDoc){
//        eval("dhtmlx.temp="+data.xmlDoc.responseText+";");
//        data = dhtmlx.temp;
//    }

    for (var i = 0; i < data.length; i++) {
        var _d = data[i];
        if (this.MetaDataTable && this.MetaDataTable.columnOrderCall) {
            _d = this.MetaDataTable.columnOrderCall(_d);
        }
        var id = i + 1;
        if (this.MetaDataTable && this.MetaDataTable.rowKeyField != null && this.MetaDataTable.rowKeyField != undefined) {
            id = data[i][this.MetaDataTable.rowKeyField];
            this.MetaDataTable.rowKeyIdIndex[id] = i + 1;
        }
        this.rowsBuffer.push({
            idd:id,
            data:_d,
            _parser:this._process_jsarray_row,
            _locator:this._get_jsarray_data
        });

//        this.rowsAr[id]=_d;
        //this.callEvent("onRowCreated",[r.idd]);
    }
    this.render_dataset();
    this._parsing = false;
};
/**
 * 扩展动态加载方式
 * @param curRow
 * @param sEv
 */
dhtmlXGridObject.prototype.expandKids__ = function (curRow, sEv) {

    var r = this._h2.get[curRow.idd];
    if (!r.childs.length && !this.kidsXmlFile) return;
    if (r.state != "plus") return;

    if (!r._loading && !sEv)
        if (!this.callEvent("onOpenStart", [r.id, -1])) return;

    var start = this.getRowIndex(r.id) + 1;
    if (r.childs.length) {
        r._loading = false;
        this._h2.change(r.id, "state", "minus");
        this._updateTGRState(r);
        var len = this._massInsert(r, this.rowsCol[start], start);

        //if (this._cssEven && !this._cssSP)
        this.callEvent("onGridReconstructed", []);

    } else {
        if (r._xml_await) {
            r._loading = true;
            this._h2.change(r.id, "state", "minus");
            this._updateTGRState(r);
            if (this.callEvent("onDynXLS", [r.id])) {
                DWREngine.setAsync(false);
                this.kidsXmlFile(r.id, this.MetaDataTable, this.MetaDataTable.getCurrentParams());
                DWREngine.setAsync(true);
            }
            r._loading = false;

            if (this.hasChildren(r.id) < 1) {
                this._h2.change(r.id, "state", dhtmlXGridObject._emptyLineImg);
                this._updateTGRState(r);
                this._h2.get[r.id].image = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/leaf.gif";
                this.rowsAr[r.id].imgTag.nextSibling.src = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/leaf.gif";
            } else {
                this._h2.get[r.id].image = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/folderOpen.gif";
                this.rowsAr[r.id].imgTag.nextSibling.src = dhtmlx.image_path + "csh_" + dhtmlx.skin + "/folderOpen.gif";
            }
        }
    }
    this.setSizes();
    if (!r._loading)
        this.callEvent("onOpenEnd", [r.id, 1]);
    this._fixAlterCss();
};
/**
 * 原方法，拖动时，禁用鼠标选择事件，未设置到entBox上
 * @param mode
 */
dhtmlXGridObject.prototype.enableDragAndDrop = function (mode) {
    if (mode == "temporary_disabled") {
        this.dADTempOff = false;
        mode = true;
    }
    else
        this.dADTempOff = true;

    this.dragAndDropOff = convertStringToBoolean(mode);
    this._drag_validate = true;
    if (mode) {
        this.objBox.ondragstart = function (e) {
            (e || event).cancelBubble = true;
            return false;
        };
        this.entBox.onselectstart = function (e) {
            (e || event).cancelBubble = true;
            return false;
        };
    } else {
        this.entBox.onselectstart = function (e) {
            (e || event).cancelBubble = true;
            return true;
        };
    }
};

//设置列头checkbox点击完 回调函数
dhtmlXGridObject.prototype.setHeaderCheckBoxCall = function (fun) {
    if (fun && typeof(fun) == 'function')
        this.headerCheckBoxCall = fun;
};
