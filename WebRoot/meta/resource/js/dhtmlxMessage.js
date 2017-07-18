/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *       dhtmlxMessage.js
 *Description：
 *       扩展dhtmlx的Message控件(包括alert框,confirm框,prompt框)
 *Dependent：
 *        dhmtlx.js
 *Author:
 *        王晶
 *Finished：
 *       2011-9-20
 *Modified By：
 *
 * Modified Date:
 *
 * Modified Reasons:
 ********************************************************/

var dhxMessageWins = null;//windows对象
var cssStr = "height:100px;width:350px;background-color:#fff;"; //css样式
var winIndex = 1; //win的计数器,用来创建win时赋值给win的id,以区别win
var alIndex = 1;//alert框控件的计数器
var conIndex = 1;//确认框控件的计数器
var peoIndex = 1;//输入框框控件的计数器

/**
 *当dom加载完,初始化windows对象,用来创建window对象
 */
var win = null;
function getWin() {
    if (!win) {
        if (dhxMessageWins == null) {
            dhxMessageWins = new dhtmlXWindows();
        }
        win = dhxMessageWins.createWindow("win" + winIndex, 100, 100, 350, 150); //定义一个具体的window对象,默认是隐藏状态
        dhxMessageWins.setImagePath(getBasePath() + "/meta/resource/images/");
    }
    win.button("minmax1").hide();
    win.button("minmax2").hide();
    win.button("park").hide();
    win.denyResize();
    win.denyPark();
    win.center();//设置居中
    win.setModal(true);//加载mask
    dhxMessageWins.modalCoverD.style.zIndex = 9999999996;
    win.style.zIndex = 9999999998;
    win.zi = 9999999998;
    win.show();
    winIndex++;
    return win;
}
var currentAlert = null;
/**
 *封装alert框,调用方式为dhx.alert();
 *@param content 提示信息
 *
 *
 * modify:张伟
 * @date 2011-10-2
 * 调整Alert 框CSS样式。
 * @param conf"{
 *  width:设置宽度
 *  height:设置高度
 * }
 */
var alertWin = null;
dhx.alert = function (content, callback, conf,nomode) {
    dhx.closeProgress(null, 0);
    var width = conf && conf.width || 350;
    var height = conf && conf.height || 150;
    if (!alertWin) {
        if (dhxMessageWins == null) {
            dhxMessageWins = new dhtmlXWindows();
        }
        alertWin = dhxMessageWins.createWindow("alertWin", 100, 130, width, height); //定义一个具体的window对象,默认是隐藏状态
        dhxMessageWins.setImagePath(getBasePath() + "/meta/resource/images/");
        alertWin.button("minmax1").hide();
        alertWin.button("minmax2").hide();
        alertWin.button("park").hide();
        alertWin.denyResize();
        alertWin.denyPark();
        alertWin.center();//设置居中
        alertWin.setIcon("title_information.png");
        alertWin.setText("提示");
    }
    if(!nomode){
        alertWin.setModal(true);//加载mask
    }
    dhxMessageWins.modalCoverD.style.zIndex = 9999999996;
    alertWin.style.zIndex = 9999999998;
    alertWin.zi = 9999999998;
    alertWin.show();
    var msgDiv = document.createElement("Div"); //创建alertWindow的加载层
    msgDiv.setAttribute("id", "alDiv" + alIndex);
    document.body.appendChild(msgDiv);
    msgDiv.style.cssText = cssStr;
    var attachDiv = document.getElementById("alDiv" + alIndex);
    attachDiv.style.css = "height:100px;width:310px;";
    var imgDiv = document.createElement("Div");//创建图片层
    imgDiv.innerHTML = '<input type="image" src="' + getBasePath() + '/meta/resource/images/information.png"/>';
    imgDiv.style.cssText = "float:left;width:50px;margin-top:10px;margin-left:20px;";
    var textDiv = document.createElement("Div"); //创建alertWindow的文字层
    textDiv.setAttribute("id", "alTxtDiv" + alIndex);
    textDiv.style.cssText = "font-size:13px;min-height:42px;height:auto;width:240px;padding-top:18px;float:right;margin-right:20px;text-align:left;overflow-y:auto;";
    textDiv.innerHTML = content;
    attachDiv.appendChild(textDiv); //将文字的层添加到alertWin的层中
    attachDiv.appendChild(imgDiv);
    var btnDiv = document.createElement("Div"); //创建alertWindow的按钮层
    btnDiv.setAttribute("id", "alBtnDiv" + alIndex);
    btnDiv.style.cssText = "height:0px;width:300px; text-align:center;";//在加载form层加载样式,这样可以设置按钮的位置
    attachDiv.appendChild(btnDiv);//加载按钮层到alertWin层中
    alertWin.attachObject(attachDiv);//alertWin加载到层上
    var data = [
        //创建form表单
        {type:"button", value:"确定", name:'ok', offsetLeft:130, offsetTop:(height - 140)}
    ]
    var myForm = new dhtmlXForm(btnDiv, data);
    var closeWin = function () {
        alertWin.hide();
        alertWin.setModal(false);
        currentAlert = null;
        attachDiv.parentNode && (attachDiv.parentNode.innerHTML = "");
        textDiv = null;
        btnDiv = null;
        msgDiv = null;
        callback && callback.call(window);
    }
    //为OK buttom设置onkeypress事件
    for (var key in myForm.itemPull) {
        if (myForm.itemPull[key].name = "ok") {
            try {
                myForm.itemPull[key].firstChild.focus();
            } catch (e) {
            }
            myForm.itemPull[key].firstChild.onkeypress = closeWin;
            myForm.itemPull[key].firstChild.onmouseup = closeWin;
            break;
        }
    }
    alertWin.closeEventId&&(alertWin.detachEvent(alertWin.closeEventId))
    var closeEventId=alertWin.attachEvent("onClose", function (w) {
        alertWin.hide();
        alertWin.setModal(false);
        attachDiv.parentNode && (attachDiv.parentNode.innerHTML = "");
        callback && callback.call(window);
    });
    alertWin.closeEventId= closeEventId;
    currentAlert = alertWin;
    alIndex++;
}

/**
 *封装confirm框,调用方式为dhx.confirm();
 *@param content confirm的提示信息 例如:你确定删除?
 *@param callback 回调函数
 */
dhx.confirm = function (content, callback, okBtnText, noBtnText) {
    var win = getWin();
    win.setText("确认");
    win.setIcon('title_question.png');
    var msgDiv = document.createElement("Div");//创建win装载层
    msgDiv.setAttribute("id", "conDiv" + conIndex);
    document.body.appendChild(msgDiv);
    msgDiv.style.cssText = cssStr;
    var attachDiv = document.getElementById("conDiv" + conIndex);
    attachDiv.style.css = "height:100px;width:310px;";
    var textDiv = document.createElement("Div"); //创建window的文字层
    var imgDiv = document.createElement("Div");//创建图片层
    imgDiv.innerHTML = '<input type="image" src="' + getBasePath() + '/meta/resource/images/question.png"/>';
    imgDiv.style.cssText = "float:left;width:50px;margin-top:10px;margin-left:10px;";
    textDiv.setAttribute("id", "conTxtDiv" + conIndex);
    textDiv.style.cssText = "font-size:13px;height:42px;width:240px;overflow-y:auto;padding-top:18px;float:right;margin-right:20px;";
    textDiv.innerHTML = content;
    attachDiv.appendChild(textDiv);
    attachDiv.appendChild(imgDiv);
    var btnDiv = document.createElement("Div"); //创建window的按钮层
    btnDiv.setAttribute("id", "conBtnDiv" + conIndex);
    btnDiv.style.cssText = "width:310px;";
    attachDiv.appendChild(btnDiv);
    win.attachObject(attachDiv);
    var data = [
        {
            type:"label",
            list:[
                {type:"button",
                    value:okBtnText?okBtnText:"确定",
                    name:'ok',
                    offsetLeft:35,
                    offsetTop:0
                },
                {
                    type:"newcolumn"
                },
                {
                    type:"button",
                    value:noBtnText?noBtnText:"取消",
                    name:'cancel',
                    offsetLeft:10,
                    offsetTop:0
                }
            ]
        }
    ]
    var myForm = new dhtmlXForm("conBtnDiv" + conIndex, data);
    myForm.attachEvent("onButtonClick", function (name, command) {
        win.hide();
        win.setModal(false);
        attachDiv.parentNode && (attachDiv.parentNode.innerHTML = "");
        textDiv = null;
        btnDiv = null;
        msgDiv = null;
        callback.call(window, name == "ok");
    });
    win.attachEvent("onClose", function (w) {
        w.hide();
        w.setModal(false);
        attachDiv.parentNode && (attachDiv.parentNode.innerHTML = "");
        msgDiv = null;
        textDiv = null;
        btnDiv = null;
    });
    conIndex++;
}

/**
 *封装prompt框,调用方式为dhx.prompt();
 *@param content prompt的提示信息 例如:请输入姓名?
 *@param callback 回调函数
 */
dhx.prompt = function (content, callback) {
    var win = getWin();
    win.setText("输入");
    var msgDiv = document.createElement("Div");
    msgDiv.setAttribute("id", "proDiv" + peoIndex);
    document.body.appendChild(msgDiv);
    msgDiv.style.cssText = cssStr;
    var attachDiv = document.getElementById("proDiv" + peoIndex);
    var textDiv = document.createElement("Div"); //创建window的文字层
    var imgDiv = document.createElement("Div");//创建图片层
    imgDiv.innerHTML = '<input type="image" src="' + getBasePath() + '/meta/resource/images/message_pencil.png"/>';
    imgDiv.style.cssText = "float:left;width:50px;margin-top:15px;margin-left:10px;";
    textDiv.setAttribute("id", "proTxtDiv" + attachDivId);
    textDiv.style.cssText = "height:50px;width:200px;padding-top:10px;float:right;margin-right:70px;font-size:13px;";
    var html = '<input type="text" style="width:160px;margin-top:-2px;"/>';
    textDiv.innerHTML = content + "<p></p>" + html;
    attachDiv.appendChild(imgDiv);
    attachDiv.appendChild(textDiv);
    var btnDiv = document.createElement("Div"); //创建window的按钮层
    btnDiv.setAttribute("id", "proBtnDiv" + peoIndex);
    btnDiv.style.cssText = "height:0px;width:310px;margin-left:40px;";
    attachDiv.appendChild(btnDiv);
    win.attachObject(attachDiv);
    var data = [
        {
            type:"label",
            list:[
                {type:"button", value:"确定", name:'ok', offsetLeft:30, offsetTop:25},
                {type:"newcolumn"},
                {type:"button", value:"取消", name:'cancel', offsetLeft:5, offsetTop:25}
            ]
        }
    ]
    var myForm = new dhtmlXForm("proBtnDiv" + peoIndex, data);
    myForm.attachEvent("onButtonClick", function (name, command) {
        if (name == "ok") {
            var ipts = attachDiv.getElementsByTagName("input");
            var value = null;
            if (ipts.length < 2 || ipts[1].value.trim() == '') {
                value = '';
            } else {
                value = ipts[1].value;
                win.hide();
                win.setModal(false);
                textDiv = null;
                btnDiv = null;
                msgDiv = null;
            }//end elseokBtn

        } else {
            value = undefined;
        }
        callback.call(window, value);
    });//end formFun
    win.attachEvent("onClose", function (w) {
        win.hide();
        win.setModal(false);
        textDiv = null;
        btnDiv = null;
        msgDiv = null;
    });
    peoIndex++;
}

/**
 * 全局扩展函数,当用户键盘按下回车键时,默认执行当前函数,如默认回车是执行"确定"函数
 * @param type 弹出框的类型 1:alert框 2为确定框 3为输入框

 document.onkeypress=function(type){
 if (event.keyCode==13){
 if(type==1){

 }//end if 1
 if(type==2){
 }
 if(type==3){
 }
 }//end if
 } */

/**
 * 显示进度条效果
 * @author 张伟
 * @param title
 * @param msg
 * @parem timeClose 多长时间关闭，以毫秒计。
 */
var processWin = null;
var callCount = 0;//调用进度条次数。
dhx.showProgress = function (title, msg, timeClose) {
    callCount++;
    if (!processWin) {
        if (dhxMessageWins == null) {
            dhxMessageWins = new dhtmlXWindows();
        }
        dhxMessageWins.createWindow("processWin", document.body.clientWidth / 2,
            document.body.clientHeight / 2 - 40, 300, 100);
        dhxMessageWins.setImagePath(getBasePath() + "/meta/resource/images/");
        processWin = dhxMessageWins.window("processWin");
        processWin.stick();
        processWin.denyResize();
        processWin.denyPark();
        processWin.denyMove();
        processWin.setText(title ? title : "请您稍后...");
        processWin.button("minmax1").hide();
//        processWin.button("close").hide();
        processWin.button("park").hide();
        processWin.button("stick").hide();
        processWin.button("sticked").hide();
        processWin.keepInViewport(true);
        processWin.setIcon("wait.gif");
        //构造html语句
        var div = document.createElement("div");
        div.style.cssText = "padding:10px;";
        div.id = "_processWinDiv";
        processWin.divId = "_processWinDiv";
        processWin.attachObject(div);
        
        //窗体关闭事件 
        processWin.attachEvent("onClose", function () {
            this.hide();
            this.setModal(false);
        });
    }
    processWin.center();
    processWin.setModal(true);
    dhxMessageWins.modalCoverD.style.zIndex = 9999999996;
    processWin.style.zIndex = 9999999999;
    processWin.zi = 9999999999;
    $(processWin.divId).innerHTML = '<div style="margin-bottom;font-size: 12px">' + (msg || '正在加载数据...') + '</div><div style="border:1px solid #99BBE8;border-radius:5px;' +
        'overflow:hidden;height:15px">' +
        '<div style="width: 244px;text-align:center;color:#15428b;position:absolute;font-size: 12px" ></div>' +
        '<div style="width: 0;background-color:#40e0d0;border-radius:5px;" >&nbsp;</div></div>';
    //设置定时器
    (function () {
        if (processWin) {//窗体未关闭
            var process = $(processWin.divId).lastChild.lastChild;
            //                div.lastChild.firstChild.innerHTML=val+"%";
            var width = parseInt((process.style.width + "").replace(/%/g, ""));
            width = width + 5;
            if (width > 100) {
                width = 0;
            }
            process.style.width = width + "%";
            var arg = arguments;
            setTimeout(function () {
                arg.callee.call(this)
            }, 500);
        }
    })();
    if (timeClose) {
        setTimeout("dhx.closeProgress()", timeClose);
    }
    processWin.show();
}
/**
 * @author 张伟
 * 关闭进度框
 */
dhx.closeProgress = function (callback, relayTime) {
    if (relayTime == null || relayTime == undefined) {
        relayTime = 100;
    }
    function close() {
        if (processWin) {
            try {
                processWin.hide();
                processWin.setModal(false);
                callback && callback();
            } catch (e) {
//                            alert(e);
                return;
            }
            if (currentAlert) {
                currentAlert.setModal(true);
                currentAlert.bringToTop();
            }
        }
        callCount = 0;
    }

    if (--callCount <= 0 && processWin) {//延时关闭。
        if (relayTime > 0) {
            setTimeout(close, relayTime);
        } else {
            close();
        }
    }
}

/**
 * messageBox控件，自定义按钮个数与回调函数，每次点击按钮会执行相应的回调函数，关闭窗口。
 * @param config 配置如下:
 * {buttons:[
 *  {id:"test",text:"测试",callback:function(){}}...
 * ],message:""}
 * 最多支持按钮的个数为4个，每个按钮最长函数个数不大于4个。
 */
dhx.messageBox = function (config) {
    var winWidth = 250;
    if (!config || !config.buttons) {
        return;
    }
    winWidth = winWidth + (config.buttons.length - 1) * 55;
    if (dhxMessageWins == null) {
        dhxMessageWins = new dhtmlXWindows();
    }
    dhxMessageWins.createWindow("messageBoxWin", document.body.clientWidth / 2,
        document.body.clientHeight / 2 - 40, winWidth, 150);
    dhxMessageWins.setImagePath(getBasePath() + "/meta/resource/images/");
    var messageBoxWin = dhxMessageWins.window("messageBoxWin");
    messageBoxWin.setModal(true);
    messageBoxWin.stick();
    messageBoxWin.center();
    messageBoxWin.denyResize();
    messageBoxWin.denyPark();
    messageBoxWin.denyMove();
    dhxMessageWins.modalCoverD.style.zIndex = 9999999996;
    messageBoxWin.style.zIndex = 9999999998;
    messageBoxWin.zi = 9999999998;
    messageBoxWin.setText("确认");
    messageBoxWin.button("minmax1").hide();
    messageBoxWin.button("close").hide();
    messageBoxWin.button("park").hide();
    messageBoxWin.button("stick").hide();
    messageBoxWin.button("sticked").hide();
    messageBoxWin.keepInViewport(true);
    messageBoxWin.setIcon('title_question.png');
    var attachDiv = document.createElement("Div");//创建win装载层
    attachDiv.style.cssText = "height:100px;width:" + winWidth + "px;background-color:#fff;";
    var textDiv = document.createElement("Div"); //创建window的文字层
    var imgDiv = document.createElement("Div");//创建图片层
    imgDiv.innerHTML = '<input type="image" src="' + getBasePath() + '/meta/resource/images/question.png"/>';
    imgDiv.style.cssText = "float:left;width:50px;height:50px;margin-top:30px;margin-left:10px;position: relative;";
    textDiv.style.cssText = "font-size:13px;height:30px;width:" + (winWidth - 100) + "px;padding-top:18px;" +
        "margin-left:70px;position: relative;";
    textDiv.innerHTML = config.message;
    attachDiv.appendChild(imgDiv);
    attachDiv.appendChild(textDiv);
    var btnDiv = document.createElement("Div"); //创建window的按钮层
    btnDiv.style.cssText = "width" + winWidth + ":px;margin-left:0px;margin-top:10px";
    attachDiv.appendChild(btnDiv);
    messageBoxWin.attachObject(attachDiv);
    var data = [];
    var temp = {};
    data.push({type:"button", value:config.buttons[0].text, name:config.buttons[0].id, offsetLeft:10 });
    temp[config.buttons[0].id] = config.buttons[0];
    if (config && config.buttons && config.buttons.length > 0) {
        for (var i = 1; i < config.buttons.length; i++) {
            data.push({type:"newcolumn", offset:5});
            data.push({type:"button", value:config.buttons[i].text, name:config.buttons[i].id});
            temp[config.buttons[i].id] = config.buttons[i];
        }
    }
    ;
    var myForm = new dhtmlXForm(btnDiv, data);
    //添加事件处理：
    myForm.attachEvent("onButtonClick", function (name) {
        if (temp[name] && temp[name].callback) {
            temp[name].callback.call(this);
        }
        messageBoxWin.close();
    });
    messageBoxWin.attachEvent("onClose", function (w) {
        attachDiv.innerHTML = "";
        return true;
    });
    messageBoxWin.show();
}