/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        richTest.js
 *Description：
 *
 *Dependent：
 *
 *Author:
 *       wangcs
 ********************************************************/

function pageInit(){

    var kjinp = new meta.ui.ShortcutInput();
    kjinp.setDataRule({
        columns:["分类(列簇)","列英文别名"],
        readType:"col"
    });
    attachObjEvent($("a1"),"onclick",function(e){
        kjinp.show();
    });
    kjinp.setOkCall(function(inp){
        alert(inp.data.join("\n"));
    });
}

dhx.ready(pageInit);