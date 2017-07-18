/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        saveRule.js
 *Description：
 *        维护查询规则（增改……）
 *Dependent：
 *
 *Author:
 *       wangcs
 ********************************************************/

var tab = null;
var curTabIdx = 0;//当前步骤
var maxTabIdx = 0;//目前加载的最大步骤
var maxIdx = 2;
var tabConfig = {
    1:{title:"第一步：",width:200,divId:"baseInfo"},
    2:{title:"第二步：",width:200,divId:"paramInfo"}
};

function pageInit(){
    tab = new dhtmlXTabBar("dataTabDIV", "top");
    addTabIdx();
    bindBtnOpt();
}

//绑定按钮事件
function bindBtnOpt(){
    attachObjEvent($("prevBtn"),"onclick",function(e){
        curTabIdx--;
        showTabIdx(curTabIdx);
    });
    attachObjEvent($("nextBtn"),"onclick",function(e){
        curTabIdx++;
        showTabIdx(curTabIdx);
    });
    attachObjEvent($("saveBtn"),"onclick",function(e){

    });
    attachObjEvent($("resetBtn"),"onclick",function(e){

    });
    attachObjEvent($("closeBtn"),"onclick",function(e){

    });
    tab.attachEvent("onSelect", function(id,last_id){
        var idx = id.replace("a","");
        showTabIdx(idx,1);
        return true;
    });
}

//展示某个步骤
function showTabIdx(idx,noSel){
    if(!tabConfig[idx])return;
    if(idx<=maxTabIdx){
        if(!noSel){
            tab.setTabActive("a"+idx);
        }
        curTabIdx = idx;
        if(idx==1){
            $("nextBtn").style.display="";
            $("prevBtn").style.display="none";
        }else if(idx==maxIdx){
            $("nextBtn").style.display="none";
            $("prevBtn").style.display="";
        }else{
            $("nextBtn").style.display="";
            $("prevBtn").style.display="";
        }
        if(maxTabIdx==maxIdx){
            $("saveBtn").style.display = "";
        }
    }else{
        addTabIdx();
    }
}

//添加一个tab
function addTabIdx(){
    if(maxTabIdx<maxIdx){
        maxTabIdx++;
        var cfg = tabConfig[maxTabIdx];
        tab.addTab("a"+maxTabIdx,cfg.title, cfg.width+"px");
        tab.cells("a"+maxTabIdx).attachObject($(cfg.divId));
        showTabIdx(maxTabIdx);
    }
}

dhx.ready(pageInit);