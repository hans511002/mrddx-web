/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        index.js
 *Description：
 *       主页JS文件，实现主页功能
 *Dependent：
 *       dhtmlx.js，dwr 有关JS，dhtmxExtend.js。。。
 *Author:
 *        张伟
 *Finished：
 *       2011-09-11-9-23
 *Modified By：
 *
 * Modified Date:
 *
 * Modified Reasons:

 ********************************************************/

/**
 * 主页面初始化
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var user=getSessionAttribute("user");
var dwrCaller=new biDwrCaller();
//当前系统的主页Path
var base = getBasePath();
//根级菜单数据
var rootMenuData=null;
var frameLoadSuccess=false;
//添加根菜单访问Action
dwrCaller.addAutoAction("queryRootMenu","LoginAction.queryRootMenu",getSystemId());
//dwrCaller.addDataConverter("queryRootMenu",new columnNameConverter());
var indexInit=function(){
    var indexLayout = new dhtmlXLayoutObject(document.body, "2E");
    //主页导航栏layout
    indexLayout.cells("a").hideHeader(true);
    indexLayout.cells("a").setHeight(88);
    indexLayout.cells("a").fixSize(true,true);

    //添加导航栏设置。
    indexLayout.cells("a").attachObject($("north"));

    if(!showFaqFlag){
        $("showFaqA").style.display = "none";
    }

    //主页菜单栏layout
//    indexLayout.cells("b").fixSize(true,true);
    //菜单栏设置
//    indexLayout.cells("b").attachObject(dhx.html.create("div",{id:"menuTreeBox",style:"width:200;height:100%"}));

    //内容layout
    indexLayout.cells("b").fixSize(true,true);
    indexLayout.cells("b").hideHeader(true);
    //添加一个内容iframe
    var iframe = document.createElement("iframe");
    iframe.name="main";
    iframe.id= "main" ;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.frameBorder=0;
    iframe.scrolling="no";
    iframe.src=urlEncode("main.jsp");
    if (iframe.attachEvent){
        iframe.attachEvent("onload", function(){
            frameLoadSuccess=true;//子窗体加载成功
        });
    } else {
        iframe.onload = function(){
            frameLoadSuccess=true;
        };
    }
    indexLayout.cells("b").attachObject(iframe);
    indexLayout.hideConcentrate();

    //执行Action 访问根节点
    dwrCaller.executeAction("queryRootMenu",function(data){
        //交由子窗口处理进行隐藏菜单筛选操作。
        if(frameLoadSuccess){
            data= window.frames["main"].window["filterHiddenMenu"](data); //过滤隐藏菜单。
        }else{
            var arg=arguments;
            setTimeout(function(){arg.callee.call(this,data)},10);
            return;
        }
        if(data){
            data=dhx.isArray(data)?data:[data];
            rootMenuData=data;
            var str="";
            for(var i=0;i<data.length;i++){
                if(i==0){
                    str+='<li><a href="####" onclick="menuChange('+i+')"><img src="'+base+"/"+data[i].iconUrl+'" style="width:32px;height32px;border:none;" align="middle" />'+
                         data[i].menuName+'</a></li>';
                    //加载第一个菜单数据
                    menuChange(i);
                }else{
                    str+='<li><a href="####" onclick="menuChange('+i+')"><img src="'+base+"/"+data[i].iconUrl+'" style="width:32px;height32px;border:none;" align="middle" />'+
                         data[i].menuName+'</a></li>';
                }
            }
            $("navUl").innerHTML= str;
            delete str;
        }
        navInit();
    });

    //导航栏工具条设置


    //加载所有的系统
    dwrCaller.addAutoAction("querySystem", "MenuAction.queryMenuSystem");
    dwrCaller.executeAction("querySystem",new columnNameConverter(),function(data){
        //定义切换系统selectButton
        var opts=[];
        if(data&&data.length>0){
            var systemSelect = $("systemSelect");
            for(var i=0;i<data.length;i++){
                var option = document.createElement('option');
                option.value = data[i].groupId;
                option.innerHTML = data[i].groupName;
                systemSelect.appendChild(option);

                opts[i]=["_change_system_"+data[i].groupId,"obj",data[i].groupName];
                if(data[i].groupId==getSystemId()){
                    option.selected = true;
                }
            }
        }
    });
    //for IE GC
    dhx.env.isIE&&CollectGarbage();
}


/**
 * 注册logout Action
 */
dwrCaller.addAction("logout",function(){
    LoginAction.logout(function(data){
        dhx.closeProgress();
        if(data){
            windowclose();
        }else{
            window.location=getBasePath();
        }
    });
    dhx.env.isIE&&CollectGarbage();
});

/**
 * 关闭浏览器
 */
function windowclose() {
    var browserName = navigator.appName;
    if (browserName=="Netscape") {
        window.open('', '_self', '');
        window.close();
    } else {
        if (browserName == "Microsoft Internet Explorer"){
            window.opener = "whocares";
            window.opener = null;
            window.open('', '_top');
            window.close();
        }else{
            window.close();
        }
    }
}
var logout=function(){
    dhx.confirm("您确定要退出系统吗?",function(r){
        if(r){
            dhx.showProgress("退出","正在退出系统");
            //发送退出消息，清空session，并重定向页面
            dwrCaller.executeAction("logout");
        }
    });
};

//弹出faq页面
var showFaq = function(){
    window.open(faqPathUrl+"/meta/module/faq/faqAsk.jsp");
};

var showMyFavorite = function(){
    window.frames["main"].openMenu("我的收藏","meta/module/mag/favorite/favorite.jsp","top","2012",true);
};
var newPassCheck=function(value){
            if(!/^(?![0-9a-z]+$)(?![0-9A-Z]+$)(?![0-9\W]+$)(?![a-z\W]+$)(?![a-zA-Z]+$)(?![A-Z\W]+$)[a-zA-Z0-9\W_]+$/.test(value)){
                return "您的密码必须包含数字、字母与特殊字符"
            }else{
                return true;
            }
    }
var showEditPassDialog=function(){
    //远程确认原密码输入是否正确
    var temp = null;
    var isBlooean = false;
    dwrCaller.addAutoAction("passwordConfirm","UserAction.passwordConfirm",user.userId,
            {dwrConfig:true,isShowProcess:false,callback:function(data){
                temp = data;
            }}
    );
    dwrCaller.addDataConverter("passwordConfirm",new remoteConverter("您输入的密码与原密码不符，请您再次输入！"));
    //修改密码Action
    dwrCaller.addAutoAction("updatePassword","UserAction.updatePassword",user.userId);


    var editPasswordFormData=[
        {type:"block",list:[
            {type:"settings",position: "label-left",labelAlign:"right", labelWidth: 100,inputHeight:20, inputWidth: 150},
            {type:"password",label:"<span style='font-size:14px;'>旧密码：</span>",name:"oldPass"
                ,id:"oldPass",validate:"NotEmpty,MaxLength[32],MinLength[8],Remote["+dwrCaller.passwordConfirm+"]"},
            {type:"label",offsetLeft:120,labelHeight:10,label:"<span style='color:#A1A1A1;font-size:12px;position:relative;top:-5px;'>请输入旧密码</span>"},
            {type:"password",label:"<span style='font-size:14px;'>新密码：</span>",name:"password"
                ,validate:"NotEmpty,MaxLength[32],MinLength[8],ValidByCallBack[newPassCheck]"},
            {type:"label",offsetLeft:120,labelHeight:10,label:"<span style='color:#A1A1A1;font-size:12px;position:relative;top:-5px;'>请输入新密码</span>"},
            {type:"password",label:"<span style='font-size:14px;'>确认新密码：</span>",name:"againPassword",
                validate:"NotEmpty,MaxLength[32],MinLength[8],EqualTo[password]"},
            {type:"label",offsetLeft:120,labelHeight:10,label:"<span style='color:#A1A1A1;font-size:12px;position:relative;top:-5px;'>请再次输入新密码</span>"},
            {type:"newcolumn",labelWidth: 1},
            {type:"label",labelWidth: 50,label:"<span style='color: red;position:relative;top:5px;'>*</span>"},
            {type:"label",labelWidth: 50,label:"<span style='color: red;position:relative;top:23px;'>*</span>"},
            {type:"label",labelWidth: 50,label:"<span style='color: red;position:relative;top:45px;'>*</span>"}
        ]},
        {type:"block",list:[
            {type:"button",label:"修改",name:"save",value:"修改",offsetLeft:120,offsetTop:15},
            {type:"newcolumn"},
            {type:"button",label:"关闭",name:"close",value:"关闭",offsetTop:15}
        ]}];

    var dhxWindow=new dhtmlXWindows();
    dhxWindow.createWindow("password",0,0,200,200);
    dhxWindow.setImagePath(getBasePath()+"/meta/resource/images/");
    var password=dhxWindow.window("password");
    password.setModal(true);
    password.stick();
    password.setDimension(380,230);
    password.center();
    password.denyResize();
    password.denyPark();
    password.button("minmax1").hide();
    password.button("park").hide();
    password.button("stick").hide();
    password.button("sticked").hide();
    password.setText("修改密码");
    password.setIcon("password-small.png");
    password.keepInViewport(true);
    password.show();
    var passwordForm=password.attachForm(editPasswordFormData);
    passwordForm.defaultValidateEvent();

    var closeWindow=function(){
        password.close();
        passwordForm.unload();
        dhxWindow.unload();
    }

    //添加表单处理事件
    passwordForm.attachEvent("onButtonClick",function(id){
        //alert(passwordForm.getItemValue("password"));
        if(passwordForm.getItemValue("password")!= "" && passwordForm.getItemValue("againPassword") != null && passwordForm.getItemValue("password") == passwordForm.getItemValue("againPassword") && passwordForm.getItemValue("againPassword").length >=6){
            isBlooean = true;
        }
        if(id=="save"  && isBlooean){//保存
            if(temp == true){
                dwrCaller.executeAction("updatePassword",passwordForm.getItemValue("password"),function(data){
                    if(data.type=="error"||data.type=="invalid"){
                        alert("对不起，修改密码出错，请重试！");
                    }else{
                        alert("修改成功");
                        closeWindow();
                        dwrCaller.executeAction("logout");
                    }
                })
            }
            else{alert("您输入的密码与原密码不符，请您再次输入！")}
        }else if (id=="reset"){//重置
            passwordForm.clear();
        }else if(id=="close"){
            closeWindow();
        }
    });
    dhx.env.isIE&&CollectGarbage();
}
dwrCaller.addAutoAction("changeSystem","LoginAction.changeSystem");
var systemChange = function(){
    //访问DWr，记录切换系统系统
    dwrCaller.executeAction("changeSystem",document.getElementById('systemSelect').value,function(){
        window.location.href="index.jsp";
    });
}

/**
 * 切换menu
 * @param menuId
 */
var menuChange=function(menuIndex){
    var menuData=rootMenuData[menuIndex];
    if(menuIndex==0){//如果是第一个导航菜单，默认其为tab模式
        menuData.target="top";
    }
    //交由子窗口处理进行菜单打开操作。
    window.frames["main"].window["menuClick"](menuData.menuId,menuData);
    dhx.env.isIE&&CollectGarbage();
}

var nav=function(c, config){
    this.config = config || {speed: 10, num: 2};
    this.container = (typeof(c)=="object") ? c : document.getElementById(c);
    this.lineHeight = this.container.offsetHeight;
    this.scrollTimeId = null;
    var _this = this;
    this.__construct = function (){
        var inner,el,href;
        inner = _this.container.childNodes[0].innerHTML;
        href = _this.container.childNodes[0].href;
        el = document.createElement("a");
//        el.innerHTML = inner;
        el.href = href;
        el.className = 'hover';
        if(!dhx.env.isIE){
            el.style.width=_this.container.offsetWidth+'px';
        }
        _this.container.appendChild(el);
        //注册事件
        _this.container.onmouseover = function (){_this.start()};
        _this.container.onmouseout  = function (){_this.end()};
        _this.container.onclick = function (){_this.toggle()};
    }();
    this.toggle = function(){
        for(var i=0;i<$("navUl").childNodes.length;i++){
            dwr.util.removeClassName($("navUl").childNodes[i],"on");
        }
        var target=_this.container;
        dwr.util.addClassName(target,'on');
        navInit();
    };
    this.start = function (){
        _this.clear();
        _this.scrollTimeId = setTimeout(function(){_this.scrollUp();}, _this.config.speed);
    };
    this.end = function (){
        _this.clear();
        _this.scrollTimeId = setTimeout(function(){_this.scrollDown();}, _this.config.speed);
    };
    this.scrollUp = function (){
        var c = _this.container;
        if(c.scrollTop >= _this.lineHeight){c.scrollTop = _this.lineHeight;return;}
        c.scrollTop += _this.config.num;
        _this.scrollTimeId = setTimeout(function(){_this.scrollUp();}, _this.config.speed);
    };
    this.scrollDown = function (){
        var c = _this.container;
        if(c.scrollTop <= 0){c.scrollTop = 0;return;}
        c.scrollTop -= _this.config.num;
        _this.scrollTimeId = setTimeout(function(){_this.scrollDown();}, _this.config.speed);
    };
    this.clear = function (){clearTimeout(_this.scrollTimeId)};
    dhx.env.isIE&&CollectGarbage();
}
var navInit=function(){
    for(var i=0;i<$("navUl").childNodes.length;i++){
        if($("navUl").childNodes[i].nodeName.toLowerCase()!="#text"){
            new nav($("navUl").childNodes[i],{speed:10,num:4});
        }
    }
    dhx.env.isIE&&CollectGarbage();
}


//window.onload=indexInit;
dhx.ready(indexInit);