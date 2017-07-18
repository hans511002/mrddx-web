/**
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 *
 * @author 王春生
 * @description 我的收藏JS
 * @date 2010-3-13
 * -
 * @modify
 * @modifyDate
 * -
 */
dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var base = getBasePath();
var user = getSessionAttribute("user");
var favTab = null;
var btnBar = null;
//需要继承main的方法集合。
var _main={openTab:'',refreshTab:'',refreshTabByName:'',onCloseTabEventByName:'',addTabRefreshOnActive:'',
    addTabRefreshOnActiveByName:'',closeTab:'',getTabIdByName:'',openWindow:'',urlDeal:'',globalInit:'',openMenu:'',getRoleButtons:''};
//所有的继承main的方法需要直接做个中转，访问上层的frame的方法
for(var _key in _main){
    _main[_key]= "window."+_key+"=function(){window.parent."+_key+".apply(window.parent,arguments)}";
    eval(_main[_key]);
}
var initFavorites = function(){
    var favLayout = new dhtmlXLayoutObject(document.body,"2U");
    favLayout.cells("a").setText("收藏目录");
    favLayout.cells("a").hideHeader(true);
    favLayout.cells("b").hideHeader(true);
    favLayout.cells("a").setWidth(260);
    favLayout.cells("a").fixSize(true,true);
    favLayout.hideConcentrate();
//    favLayout.hideSpliter();//移除分界边框。

    //添加收藏内容查看界面
    var iframe = document.createElement("iframe");
    iframe.name = 'favContentFrame';
    iframe.id = 'tabContentFrame';
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.frameBorder = 0;
    iframe.scrolling = "yes";
    if(dhx.env.isIE){
        window.attachEvent('onresize', function(event){
            if(iframe.contentWindow.resizeHandler){
                iframe.contentWindow.resizeHandler();
            }
        });
    }
    favLayout.cells("b").attachObject(iframe);

    //添加工具条
    btnBar = favLayout.cells("a").attachToolbar();
    initBtnBar();

    //添加工具收藏分类Tab
    favLayout.cells("a").attachObject("favDir");
    favTab = new dhtmlXTabBar("favDirTab","left");
    favTab.enableAutoReSize(true);
    favTab.setAlign("left");
    favTab.enableScroll(true);

    var favTypes = getCodeByRemoveValue("FAVORITE_TYPE",[3,4,5]);
    if(favTypes && favTypes.length>0){
        var ix = 999;
        var defActive = null;
        for(var i=0;i<favTypes.length;i++){
            var zhs = 0;
            var txt = favTypes[i].name.replace(/[\u4E00-\u9FA5]/g,function(x){
                zhs ++;
                return x+"<br>";
            });
            txt = (zhs<=3?"<br>":"")+txt;
            favTab.addTab(favTypes[i].value,txt,zhs<=3?100:"*"); //tab的ID即是 收藏分类ID
            if(parseInt(favTypes[i].order) < ix ){
                defActive = favTypes[i].value;
                ix = parseInt(favTypes[i].order);
            }
        }
        favTab.setTabActive(defActive);

        //初始每个收藏分类Tab
        initFavTab();
        //注册tab切换事件
        favTab.attachEvent("onSelect",function(id,lastId){
            var nodeId = favTabTree[id].getSelectedItemId();
            disableFavBtn(nodeId,id); //控制toolbar按钮禁用/启用
            return true;
        });

        //注册订阅按钮事件
        Tools.addEvent($('objopt_dy'),"click",function(){
            dingyue($("opt_nodeId").value);
        });
        Tools.addEvent($("favobjoptdiv"),"mouseover",function(){
            $("favobjoptdiv").setAttribute("overFlag","true");
        });
        Tools.addEvent($("favobjoptdiv"),"mouseout",function(){
            $("favobjoptdiv").removeAttribute("overFlag");
            $("favobjoptdiv").style.display = "none";
        });
    }else{
        dhx.alert("系统还未初始收藏分类!");
    }
};
var initBtnBar = function(){
    btnBar.setAlign("center");
    var imgbase  = base + "/meta/resource/images/toolbar/";
    btnBar.addButton("add",1,"",imgbase+"folder_add.gif",imgbase+"folder_h.gif");
    btnBar.addButton("update",2,"",imgbase+"folder.gif",imgbase+"folder-h.gif");
    btnBar.addButton("delete",3,"",imgbase+"delete.gif",imgbase+"delete-h.gif");
    btnBar.addButton("shang",4,"",imgbase+"move_up.png",imgbase+"move_up-h.png");
    btnBar.addButton("xia",5,"",imgbase+"move_down.png",imgbase+"move_down-h.png");
    btnBar.addButton("up",6,"",imgbase+"undo.png",imgbase+"undo-h.png");
    btnBar.addButton("down",7,"",imgbase+"undo2.png",imgbase+"undo2-h.png");
    btnBar.addButton("reload",8,"",imgbase+"reload.png",imgbase+"reload-h.png");
    btnBar.attachEvent("onclick",function(id){
        var tabid = favTab.getActiveTab();
        var nodeid = favTabTree[tabid].getSelectedItemId();
        if(id=="add"){
            showMangeFavWin(this.obj,"添加分类",{
                favoriteId:0,
                favoriteName:"",
                oldFavoriteName:"",
                parentId:(nodeid||0),
                userId:user.userId,
                favoriteOrder:1,
                favoriteType:tabid
            });
        }else if(id=="update"){
            var fid = favTabTree[tabid].getUserData(nodeid,"favoriteId");
            var fname = favTabTree[tabid].getUserData(nodeid,"favoriteName");
            var pid = favTabTree[tabid].getUserData(nodeid,"parentId");
            var ord = favTabTree[tabid].getUserData(nodeid,"favoriteOrder");
            showMangeFavWin(this.obj,"编辑分类",{
                favoriteId:fid,
                favoriteName:fname,
                oldFavoriteName:fname,
                parentId:pid,
                userId:user.userId,
                favoriteOrder:ord,
                favoriteType:tabid
            });
        }else if(id=="delete"){
            var objtype = favTabTree[tabid].getUserData(nodeid,"objType");//如果有表示是具体收藏对象
            var typeid = favTabTree[tabid].getUserData(nodeid,"favoriteType");
            if(favTabTree[tabid].hasChildren(nodeid)){
                dhx.confirm("该目录有子目录或有收藏对象，删除将删除所有相关收藏！确定吗？",function(x){
                    if(x){
                        submitOptFavorite([nodeid,parseInt(typeid),"true"],FavoriteAction.delFavoriteTypeOrObj);
                    }
                });
            }else{
                dhx.confirm("确定删除该“"+(objtype?'收藏':'目录')+"”吗？",function(x){
                    if(x){
                        //如果是对象 nodeid都有 menu_ 前缀 ，且objtype有值
                        submitOptFavorite([nodeid,typeid,(objtype ? objtype : "false")],FavoriteAction.delFavoriteTypeOrObj);
                    }
                });
            }
        }else if(id=="shang"){
            var objType = favTabTree[tabid].getUserData(nodeid,"objType");
            var pid = favTabTree[tabid].getUserData(nodeid,"parentId");
            dhx.showProgress("","更新中!");
            FavoriteAction.updateFavDirOrObjOrder(nodeid,pid,true,(objType ? tabid : 0),function(data){
                dhx.closeProgress();
                if(data.type=="error"||data.type=="invalid"){
                    dhx.alert("操作出错，请重试！");
                }else{
                    reloadCurrentTree();
                    //刷新树，并选中原节点
                }
            });
        }else if(id=="xia"){
            var objType = favTabTree[tabid].getUserData(nodeid,"objType");
            var pid = favTabTree[tabid].getUserData(nodeid,"parentId");
            dhx.showProgress("","更新中!");
            FavoriteAction.updateFavDirOrObjOrder(nodeid,pid,false,(objType ? tabid : 0),function(data){
                dhx.closeProgress();
                if(data.type=="error"||data.type=="invalid"){
                    dhx.alert("操作出错，请重试！");
                }else{
//                    favTabTree[tabid].moveItem(nodeid,"item_sibling_next",favTabTree[tabid].getSiblingItem(nodeid));
                    reloadCurrentTree();
                    //刷新树，并选中原节点
                }
            });
        }else if(id=="up"){
            var pid = favTabTree[tabid].getParentId(nodeid);
            if(pid==0){
                dhx.alert("无上级目录，无法再升级！");//无父无法升级
            }else{
                submitOptFavorite({
                    favoriteId:nodeid,
                    userId:user.userId,
                    parentId:favTabTree[tabid].getParentId(pid)
                },FavoriteAction.updateFavorite);
            }
        }else if(id=="down"){
            var fch = getFirstFavSibling(favTabTree[tabid],nodeid);
            if(fch){
                submitOptFavorite({
                    favoriteId:nodeid,
                    userId:user.userId,
                    parentId:fch
                },FavoriteAction.updateFavorite);
            }else{
                dhx.alert("无兄弟“目录”，无法再降级！");
            }
        }else if(id=="reload"){
            reloadCurrentTree();
        }
    });
};
/**
 * 获取某树，某节点，第一个兄弟目录（如果有）
 * @param tr
 * @param nodeid
 */
var getFirstFavSibling = function(tr,nodeid){
    return tr.getSiblingItem(nodeid, function (id) {
        return !(this.getUserData(id, "objType"));
    });
};
var mangeFavWindow = null;
var favForm = null;
/**
 * 尝试打开分类编辑窗体,如无，则创建,
 * @param btn 按钮
 * @param title  状体标题
 * @param config 参数
 */
var showMangeFavWin = function(btn,title,data){
    var left = 120;
    var top = 50 ;
    if(!mangeFavWindow){
        var x = new dhtmlXWindows();
        var winid = "manageFavWin";
        mangeFavWindow = x.createWindow(winid,left,top,220,100);
        mangeFavWindow.stick();
        mangeFavWindow.setText(title);
        mangeFavWindow.denyResize();
        mangeFavWindow.denyPark();
//        mangeFavWindow.denyMove();

        //关闭一些不用的按钮。
        mangeFavWindow.button("minmax1").hide();
        mangeFavWindow.button("park").hide();
        mangeFavWindow.button("stick").hide();
        mangeFavWindow.button("sticked").hide();

        //创建表单
        favForm = mangeFavWindow.attachForm([{
            type: "block",
            list: [{
                type:"settings",
                inputWidth: 140,
                position: "label-left",
                labelAlign:"right",
                labelLeft:0 ,
                inputLeft:0,
                offsetTop:0
            },{
                type: "input",
                label: "分类名称",
                name:"favoriteName",
                value: "",
                validate:"NotEmpty"
            },{
                type: "button",
                name:"btn",
                offsetLeft:70,
                value: "保存"
            },{type:"hidden",name:"favoriteId"},
                {type:"hidden",name:"parentId"},
                {type:"hidden",name:"oldFavoriteName"},
                {type:"hidden",name:"userId"},
                {type:"hidden",name:"favoriteOrder"},
                {type:"hidden",name:"favoriteType"}]
        }]);
        //添加验证
        favForm.defaultValidateEvent();

        //为按钮添加事件
        favForm.attachEvent("onButtonClick",function(id){
            submitFavForm();
        });

        //改变关闭事件
        mangeFavWindow.attachEvent("onClose",function(){
            dhtmlxValidation.clearAllTip();
            mangeFavWindow.hide();
            return false;
        });

        mangeFavWindow.hide();
    }
    mangeFavWindow.setPosition(left,top);
    mangeFavWindow.setText(title);
    if(mangeFavWindow.isHidden()){
        favForm.setFormData(data);
        mangeFavWindow.show();
        favForm.getInput("favoriteName").focus();
    }else{
        mangeFavWindow.hide();
    }
};

var submitFavForm = function(){
    var name = favForm.getInput("favoriteName").value;
    var oldname = favForm.getItemValue("oldFavoriteName");
    if(favForm.validate()){
        dhx.showProgress("","保存数据中!");
        FavoriteAction.insertFavorite(favForm.getFormData(),function(data){
            dhx.closeProgress();
            if(data.type=="error"||data.type=="invalid"){
                dhx.alert("保存出错，请重试！");
            }else if(data.sid==-1){
                dhx.alert("已存在相同名称的分类！");
            }else{
                mangeFavWindow.hide();
                if(oldname!=name){
                    reloadCurrentTree(); //名称修改才刷新
                }
            }
        });
    }
};

/**
 * 刷新当前Tab的树
 */
var reloadCurrentTree = function(){
    disableFavBtn();
    favTabTree[favTab.getActiveTab()].reLoad();
};

var submitOptFavorite = function(par,optfun){
    dhx.showProgress("","提交操作中!");
    var calFun = function(data){
        dhx.closeProgress();
        if(data.type=="error"||data.type=="invalid"){
            dhx.alert("操作出错，请重试！");
        }else{
            reloadCurrentTree();
        }
    };
    if(dhx.isArray(par)){
        par[par.length] = calFun;
        optfun.apply(this,par);
    }else{
        optfun(par,calFun);
    }

};

var dyWin = null;
var dyForm = null;
/**
 * 订阅报表
 */
var dingyue = function(nodeid){
    favTabTree[favTab.getActiveTab()].selectItem(nodeid);
    var pos = {left:150,top:100};
    if(!dyWin){
        var x = new dhtmlXWindows();
        var winid = "dyWin";
        dyWin = x.createWindow(winid,pos.left,pos.top,310,240);
        dyWin.stick();
        dyWin.setModal(true);
        dyWin.denyResize();
        dyWin.denyPark();
    //        dyWin.denyMove();

        //关闭一些不用的按钮。
        dyWin.button("minmax1").hide();
        dyWin.button("park").hide();
        dyWin.button("stick").hide();
        dyWin.button("sticked").hide();

        dyForm = dyWin.attachForm(
            [
                {type: "block",  list:[
                    {type: "label", label: "发送方式：",labelWidth:80},
                    {type:"newcolumn"},
                    {type: "checkbox",label: "邮件", name: "sendMethod1", value:"1",checked:true},
                    {type:"newcolumn"},
                    {type: "checkbox",label: "彩信", name: "sendMethod2", value:"2"},
                    {type:"newcolumn"},
                    {type: "checkbox",label: "短信", name: "sendMethod3", value:"3"}
                ]},
                {type: "block",  list:[
                    {type: "radio", name: "typeFlag", value: "1", label: "定时发送：",checked: true,list:[
                        {type:"select",label:"发送频度：",name:"sendSequnce",
                            inputHeight:22,labelWidth:80,inputWidth:142},
                        {type:"newrows"},
                        {type:"calendar",name: "sendTime",label:"初次发送时间：",labelWidth:80,inputWidth:140,inputHeight:17,
                            dateFormat: "%Y-%m-%d %H:%i:%s", skin: "dhx_skyblue",enableTime: true,readonly:true}
                    ]},
                    {type: "newrows"},
                    {type: "radio", name: "typeFlag", value: "2", label: "固定发送：",list:[
                        {type:"calendar",name: "fixedTime",label:"固定发送时间：",labelWidth:80,inputWidth:140,inputHeight:17,
                            dateFormat: "%Y-%m-%d %H:%i:%s", skin: "dhx_skyblue",enableTime: true,readonly:true}
                    ]}
                ]},
                {type: "block",  list:[
                    {type:"button",name:"insertAndSub",value:"保存",offsetLeft:100,offsetTop:5},
                    {type:"hidden",name:"reportFavoriteId",value:""},
                    {type:"hidden",name:"saveOrUpdate",value:""},
                    {type:"hidden",name:"reportId",value:""}
                ]}
            ]
        );
        dyForm.defaultValidateEvent();		//form内数据验证方法
        //加载发送频度数据
        var reportSendType = getComboByRemoveValue("PERORT_SEND_TYPE",0);//0一次，1年，2半年，3月，4周，5天
        Tools.addOption(dyForm.getSelect("sendSequnce"),reportSendType.options);
//        Tools.addOption(dyForm.getSelect("sendSequnce"),[{value:0,text:""}]);
        var tomorrow = new Date();
        tomorrow.setDate(new Date().getDate()+1);
        var dataCalendar = dyForm.getCalendar("fixedTime");
        dataCalendar.setSensitiveRange(tomorrow, null);
        dataCalendar.loadUserLanguage('zh');	//将控件语言设置成中文
        var dataCalendar = dyForm.getCalendar("sendTime");
        dataCalendar.setSensitiveRange(tomorrow, null);
        dataCalendar.loadUserLanguage('zh');	//将控件语言设置成中文

        //设置按钮点击事件
        dyForm.attachEvent("onButtonClick", function(id) {
            if(dyForm.validate()){
                var formData = getData();
                if(formData){
                    if(dyForm.getItemValue("saveOrUpdate")=="save"){
                        //订阅报表
                        dhx.showProgress("","提交数据中!");
                        RepSupermarketAction.insertFavoriteAndSub(formData,function(rs){
                            dhx.closeProgress();
                            if(rs==2){
                                dhx.alert("订阅成功！");
                                dyWin.close();
                                reloadCurrentTree();
                            }else{
                                dhx.alert("订阅失败！请联系管理员！");
                            }
                        });
                    }else{
                        //修改订阅信息
                        dhx.showProgress("","提交数据中!");
                        RepSupermarketAction.updateReportPushConfig(formData,function(rs){
                            dhx.closeProgress();
                            if(rs>0){
                                dhx.alert("修改成功！");
                                dyWin.close();
                                reloadCurrentTree();
                            }else{
                                dhx.alert("修改失败！请联系管理员！");
                            }
                        });
                    }
                }
            }
        });
        dyWin.attachEvent("onClose", function(){
            dyWin.setModal(false);
            dyWin.hide();
            return false;
        });
        dyWin.hide();
    }
    if(dyWin.isHidden()){
        var name = favTabTree[favTab.getActiveTab()].getUserData(nodeid,"favoriteName");
        var objid = favTabTree[favTab.getActiveTab()].getUserData(nodeid,"objId");
        var auditType = favTabTree[favTab.getActiveTab()].getUserData(nodeid,"auditType");  //模型发送方式
        var cnt = favTabTree[favTab.getActiveTab()].getUserData(nodeid,"dyCnt");//被订阅数量=0表示未订阅
        var id = nodeid.replace("report_","");//取得 收藏报表表 的主键ID
        dyForm.setItemValue("reportFavoriteId",id);
        dyForm.setItemValue("reportId",objid);
        if(auditType==11){
            dyForm.getSelect("sendSequnce").value = "5";
        }else if(auditType==22){
            dyForm.getSelect("sendSequnce").value = "3";
        }else{
            dyForm.getSelect("sendSequnce").value = "5";//默认每天发
        }
        if(cnt==0){
            dyWin.setText("订阅“"+name+"”");
            dyForm.setItemValue("saveOrUpdate","save");
        }else{
            dyWin.setText("修改“"+name+"”订阅信息");
            dyForm.setItemValue("saveOrUpdate","update");
            //请求后台获取详细订阅信息
            RepSupermarketAction.getReportPushConfig(id,objid,function(data){
                if(data["sendMethod1"]){
                    dyForm.checkItem("sendMethod1");
                }else{
                    dyForm.uncheckItem("sendMethod1");
                }
                if(data["sendMethod2"]){
                    dyForm.checkItem("sendMethod2");
                }else{
                    dyForm.uncheckItem("sendMethod2");
                }
                if(data["sendMethod3"]){
                    dyForm.checkItem("sendMethod3");
                }else{
                    dyForm.uncheckItem("sendMethod3");
                }
                if(data["SEND_SEQUNCE"]==0 || data["SEND_SEQUNCE"]=="0"){
                    dyForm.checkItem("typeFlag","2");
                    dyForm.setItemValue("fixedTime",data["sendTime"]);
                }else{
                    dyForm.checkItem("typeFlag","1");
                    dyForm.getSelect("sendSequnce").value = data["SEND_SEQUNCE"];
                    dyForm.setItemValue("sendTime",data["sendTime"]);
                }
            });
        }

        dyWin.setPosition(pos.left,pos.top);
        dyWin.setModal(true);
        dyWin.show();
    } else{
        dyWin.close();
    }
};

//得到收藏并订阅储存数据
var getData = function(){
    var data = dyForm.getFormData();
    var pushType = "";
    if(dyForm.isItemChecked("sendMethod1")){	//如果选中，添加值
        pushType += dyForm.getItemValue("sendMethod1")+",";
    }
    if(dyForm.isItemChecked("sendMethod2")){	//如果选中，添加值
        pushType += dyForm.getItemValue("sendMethod2")+",";
    }
    if(dyForm.isItemChecked("sendMethod3")){	//如果选中，添加值
        pushType += dyForm.getItemValue("sendMethod3")+",";
    }
    if(pushType==""){
        dhx.alert("请至少选择一种发送方式！");
        return null;
    }
    data.pushType = pushType.substr(0,pushType.length-1);			//保存发送方式
    var typeFlag = dyForm.getCheckedValue("typeFlag");
    if(typeFlag==1){
        var sendSequnce = dyForm.getItemValue("sendSequnce");
        if(!sendSequnce){
            dhx.alert("请选择发送频度！");
            return null;
        }
        var sendTime = dyForm.getInput("sendTime").value;
        if(!sendTime){
            dhx.alert("请选择初次发送时间！");
            return null;
        }
        data.sendBaseTime = sendTime;		//保存初次发送时间
    }else{
        var fixedTime = dyForm.getInput("fixedTime").value;
        if(!fixedTime){
            dhx.alert("请选择固定发送时间！");
            return null;
        }
        data.sendBaseTime = fixedTime;		//保存固定发送时间
        data.sendSequnce = 0;				//发送频度为固定时间发送
    }
    return data;
};


var treeconv = new dhtmxTreeDataConverter({
    idColumn : "favoriteId",
    pidColumn : "parentId",
    textColumn : "favoriteName",
    getImages:function(rowIndex, rowData){
        var imgs = new Array(0);
        var objType = rowData["objType"];
        if(!objType){
            imgs[0] = this.getIconRelativePath()+"tree_icon/folderClosed.gif"; //叶子状态
            imgs[1] = this.getIconRelativePath()+"tree_icon/folderOpen.gif";   //打开时
            imgs[2] = this.getIconRelativePath()+"tree_icon/folderClosed.gif";  //关闭时
        }else if(objType=="menu"){
            imgs[0] = this.getIconRelativePath() + "tree_icon/iconFlag.gif";
            imgs[1] = this.getIconRelativePath() + "tree_icon/iconFlag.gif";
            imgs[2] = this.getIconRelativePath() + "tree_icon/iconFlag.gif";
        }else if(objType=="report"){
            imgs[0] = this.getIconRelativePath() + "tree_icon/iconGraph.gif";
            imgs[1] = this.getIconRelativePath() + "tree_icon/iconGraph.gif";
            imgs[2] = this.getIconRelativePath() + "tree_icon/iconGraph.gif";
        }else if(objType=="gdl"){

        }else if(objType=="model"){

        }else if(objType=="other"){

        }
        if(imgs.length>0){
            return imgs;
        }
        return this._super.getImages(rowIndex,rowData);
    }
//    ,compare : function(data1, data2){
//        if(data1.userdata[0]["content"].favoriteOrder == undefined || data1.userdata[0]["content"].favoriteOrder == null){
//            return false;
//        }
//        if(data2.userdata[0]["content"].favoriteOrder == undefined || data2.userdata[0]["content"].favoriteOrder == null){
//            return false;
//        }
//        return data1.userdata[0]["content"].favoriteOrder <= data2.userdata[0]["content"].favoriteOrder
//    }
});
var favTabTree = {};
var mouseObjId = null;
var initFavTab = function(){
    for(var tabid in favTab._tabs){
        var favTreeDirUrl = Tools.dwr({
            dwrMethod:FavoriteAction.queryAllFavByConditionAndObj,
            param:[user.userId,tabid],
            converter:treeconv
        });
        favTabTree[tabid] = new Tree(favTab.cells(tabid).attachTree(),{
            onClick:function(nodeId){
                var objtype = this.getUserData(nodeId,"objType");//如果为表示是具体收藏对象
                if(isFavObj(objtype)){
                    //刷新右边链接
                    openFavoriteObj(this,nodeId,this.getUserData(nodeId,"objId"),this.getUserData(nodeId,"favoriteType"));
                }
            },
            afterLoad:function(tr){
                tr.openAllItems(tr.rootId);
            }
        });
        //为每个Tab分类树注册相关事件 或 个性设置
        favTabTree[tabid].attachEvent("onMouseIn",function(nodeid){
            var objType = this.getUserData(nodeid,"objType");
            var favObjDIV = document.getElementById("favobjoptdiv");
            if(objType=="report"){
                mouseObjId = nodeid;
                $("opt_nodeId").value = nodeid;
                var temp=this._globalIdStorageFind(nodeid);
                var t = temp.htmlNode.childNodes[0].childNodes[0].childNodes[3].childNodes[0];
                favObjDIV.style.display = "inline";
                var os = dhx.html.offset(t);
                favObjDIV.style.top = os.y+"px";
                favObjDIV.style.left = (os.x + t.offsetWidth)+"px";
            }else{
                favObjDIV.style.display = "none";
                favObjDIV.removeAttribute("overFlag");
                $("opt_nodeId").value = "";
            }
        });
        favTabTree[tabid].attachEvent("onMouseOut",function(nodeid){
            var favObjDIV = document.getElementById("favobjoptdiv");
            mouseObjId = null;
            setTimeout(function(){
                if(!mouseObjId && $("favobjoptdiv").getAttribute("overFlag")==null){
                    $("opt_nodeId").value = "";
                    favObjDIV.style.display = "none";
                }
            },1000);
        });
        favTabTree[tabid].attachEvent("onSelect",function(nodeid){
            disableFavBtn(nodeid); //控制toolbar按钮禁用/启用
        });


        favTabTree[tabid].enableDragAndDrop(true);
        favTabTree[tabid].attachEvent("onDrag",function(sId,tId){
            var oldType = this.getUserData(sId,"objType");//原节点类型
            var newType = this.getUserData(tId,"objType");//新节点类型
            if(newType){
                dhx.alert("收藏对象不能成为父目录！");
                return false;
            }else{
                if(this.getParentId(sId)==tId){
                    return false;
                }
                if(!oldType){
                    //目录之间的互拖
                    submitOptFavorite({
                        favoriteId:sId,
                        userId:user.userId,
                        parentId:tId
                    },FavoriteAction.updateFavorite);
                }else{
                    if(tId==this.rootId){
                        return false;
                    }
                    //收藏对象拖动到目录（不包括根目录）
                    submitOptFavorite([sId,tId,favTab.getActiveTab()],FavoriteAction.updateFavoriteObjType);
                }
            }
            return true;
        });

        favTabTree[tabid].loadData(favTreeDirUrl);//加载数据
    }
    disableFavBtn();
};
//根据当前节点属性判断 按钮禁用/启用
var disableFavBtn = function(treeNodeId,tabId){
    if(treeNodeId!=null && treeNodeId!=undefined && treeNodeId!=""){
        var objtype = favTabTree[tabId || favTab.getActiveTab()].getUserData(treeNodeId,"objType");//如果为表示是具体收藏对象
        if(!isFavObj(objtype)){ //目录
            btnBar.forEachItem(function(btnid){
                btnBar.enableItem(btnid);//全启用
            });
        }else{ //收藏具体对象（如菜单）
            btnBar.forEachItem(function(btnid){
                if(btnid=="add" || btnid=="update" || btnid=="up" || btnid=="down"){
                    btnBar.disableItem(btnid); //仅（添加，修改）禁用
                }else{btnBar.enableItem(btnid);}
            });
        }

    }else{ //未选中
        btnBar.forEachItem(function(btnid){
            if(btnid=="add" || btnid=="reload"){
                btnBar.enableItem(btnid); //仅（添加，刷新）启用
            }else{btnBar.disableItem(btnid);}
        });
    }
};
var isFavObj = function(objtype){
    if(objtype!=null && objtype!=undefined){
        return objtype=="menu" || objtype=="report" || objtype=="gdl" || objtype=="model" || objtype=="other";
    }
    return false;
};

/**
 * 打开一个收藏对象
 * @param tr 树，获取收藏树节点详细信息
 * @param id 树节点ID，对应加了对象区分前缀的收藏对象表ID，(menu_菜单，report_报表)
 * @param objId 收藏对象ID，如，菜单即是菜单ID
 * @param type 收藏类型（1菜单，2报表……）
 */
var openFavoriteObj = function(tr,id,objId,type){
    if(type==1){
        var menuUrl = tr.getUserData(id,"menuUrl");
        if(menuUrl.indexOf("meta/module/mag/favorite/favorite.jsp")!=-1){
//            window.location.reload();   //自身收藏自身时，刷新自身
        }else{
            document.getElementById("tabContentFrame").src = urlEncode(base+"/"+menuUrl);
        }
    }else if(type==2){
        window.open(urlEncode(base+"/home/module/commentRpt/commentRpt.jsp?rptId="+objId));
    }else if(type==3){
        dhx.alert("展示指标-》"+objId+"《-等待实现……");
    }else if(type==4){
        dhx.alert("展示模型-》"+objId+"《-等待实现……");
    }else if(type==5){
        dhx.alert("展示其他-》"+objId+"《-等待实现……");
    }
};

dhx.ready(initFavorites);