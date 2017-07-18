/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        richEditor.js
 *Description： 富文本编辑器加载js
 *
 *Dependent：
 *
 *Author:
 *       wangcs
 ********************************************************/
var editor = null;
var dr = {
    readType:"row",
    startR:1,
    endR:999,
    startC:1,
    endC:999
};
var odr = null;
KindEditor.ready(function(K) {
    var initCfg = {};
    if(initCfgStr){
        try{
            eval("initCfg="+initCfgStr.replace(/\n/g," ").replace(/\r/g," "));
        }catch(e){
            alert(e);
        }
    }
    var width = 700;
    var height = 450;
    if(initCfg){
        width = initCfg["width"] || width;
        height = initCfg["height"] || height;
        if(initCfg["datarule"]){
            for(var k in initCfg["datarule"] ){
                dr[k] = initCfg["datarule"][k];
            }
        }
    }
    width -= 20;
    height -= 31;
    document.getElementById("content").style.width = width+"px";
    document.getElementById("content").style.height = height+"px";
    var items = [
        'undo', 'redo', '|', 'cut', 'copy', 'paste',
        'bold', 'table', 'hr',
        'link', 'unlink'
    ];

    items.push('|','datarule');

    editor = K.create('textarea[name="content"]', {
        resizeType : 0,
        allowPreviewEmoticons : false,
        uploadJson : basePath+'/editorUpload?r=' + Math.random(),
        formatUploadUrl: false,
        items : items
    });

    editor.clickToolbar("datarule",function(){
        if(!dr){
            dr = odr;
        }
        var html = [
            '<div style="padding:8px;">',
            //
            '<div class="ke-dialog-row">',
            '<label for="keWidth">组件将解析表格数据（故可从Excel直接复制粘贴数据以达到快捷录入的目的）</label>',
            '</div>',
            //
            '<div class="ke-dialog-row">',
            '<label for="keAlign" style="width:80px;">解析方式</label>',
            '<select id="readType" value="'+dr.readType+'">',
            '<option value="row" '+(dr.readType=="row"?"selected=\"selected\"":"")+'>按行</option>',
            '<option value="col" '+(dr.readType=="col"?"selected=\"selected\"":"")+'>按列</option>',
            '</select>',
            '&nbsp;行范围<input title="注意排除【列】头" type="text" id="startR" style="width:30px;height:20px;vertical-align:middle;" class="ke-input-text ke-input-number" value="'+dr.startR+'" maxlength="4" />',
            '-<input type="text" id="endR" style="width:30px;height:20px;vertical-align:middle;" class="ke-input-text ke-input-number" value="'+dr.endR+'" maxlength="4" />',
            '&nbsp;&nbsp;&nbsp;列范围<input title="注意排除【行】头" type="text" id="startC" style="width:30px;height:20px;vertical-align:middle;" class="ke-input-text ke-input-number" value="'+dr.startC+'" maxlength="4" />',
            '-<input type="text" id="endC" style="width:30px;height:20px;vertical-align:middle;" class="ke-input-text ke-input-number" value="'+dr.endC+'" maxlength="4" />',
            '</div>'
        ];
        if(dr["columns"]){
            var cols = dr["columns"];
            var colIndex = dr["colIndex"];
            if(!colIndex){
                colIndex = {};
                for(var i=0;i<cols.length;i++){
                    colIndex[i] = parseInt(dr["readType"]=="row"?dr["startC"]:dr["startR"]) + i;
                }
            }
            if(cols.length>0){
                for(var i=0;i<cols.length;i++){
                    if(i%2==0){
                        if(i>0){html.push('</div>');}
                        html.push('<div class="ke-dialog-row">');
                        html.push('<label title="当按行解析时，此索引对应列索引;\n反之按列解析，此索引对应行索引" for="keAlign" style="width:80px;display:inline-block;height:18px;line-height:18px;">'+(i==0?"属性关系索引":"")+'</label>');
                    }
                    html.push('<span style="width:158px;display:inline-block;vertical-align:middle;text-align:right;" title="'+cols[i]+'">');
                    html.push(cutStrToEllipsis(cols[i],115));
                    html.push('<input style="vertical-align:middle;height:20px;" type="text" id="colr'+i+'" style="width:40px;" value="'+(colIndex[i]||(i+1))+'" class="ke-input-text ke-input-number" maxlength="4">&nbsp;&nbsp;');
                    html.push('</span>');
                    if(i==cols.length-1){
                        html.push('</div>');
                    }
                }
            }
        }
        html.push(
            //结束标签
            '</div>');
        editor.createDialog({
            name : 'datarule',
            width : 450,
            title : "设置解析规则<span style='font-size:12px;color:#a9a9a9'>——注:行列计数以最小单元格为准</span>",
            body : html.join(''),
            yesBtn : {
                name : editor.lang('yes'),
                click : function(e) {
                    getDataRule();
                }
            }
        });
        odr = dr;
        dr = null;
    });
});

//准备解析规则数据
function getDataRule(){
    if(!dr){
        if(!document.getElementById("readType")){
            dr = odr;
            return dr;
        }
        dr = {
            readType:document.getElementById("readType").value,
            startR:document.getElementById("startR").value.trim(),
            endR:document.getElementById("endR").value.trim(),
            startC:document.getElementById("startC").value.trim(),
            endC:document.getElementById("endC").value.trim()
        };
        var chked = true;
        chked = chked && dr.startR.match(/^[1-9][0-9]*$/);
        chked = chked && dr.endR.match(/^[1-9][0-9]*$/);
        chked = chked && dr.startC.match(/^[1-9][0-9]*$/);
        chked = chked && dr.endC.match(/^[1-9][0-9]*$/);
        if(chked){
            dr["columns"] = odr["columns"];
            var colIndex = {};
            var cmp = {};
            for(var i=0;i<9999;i++){
                var ct = document.getElementById("colr"+i);
                if(!ct){
                    break;
                }
                colIndex[i]=ct.value.trim();
                chked = chked && colIndex[i].match(/^[1-9][0-9]*$/);
                if(!chked)break;
                if(cmp[colIndex[i]]){
                    chked = false;
                    break;
                }
                cmp[colIndex[i]]=1;
            }
            if(chked){
                dr["colIndex"] = colIndex;
                editor.select().hideDialog().focus();
            }else{
                dr = null;
                alert("属性关系索引值必须是正整数，且不可重复!");
            }
        }else{
            dr = null;
            alert("行列范围值必须输入正整数,且顺序正确!");
        }
    }
    return dr;
}

/**
 * 返回富文本值
 * @param flag 为真时，标示取纯文本
 */
function getHTMLValue(flag){
    var str = editor.html();
    str = str.replace(/<table/ig,"<table id=\"excelTab\" name=\"excelTab\" ");
    document.getElementById("myContent").innerHTML = str;
    return flag ? document.getElementById("myContent").innerText :str;
}

//设置富文本值
function setHTMLValue(val){
    if(editor){
        editor.html(val);
    }else{
        setTimeout(function(){
            setHTMLValue(val);
        },100);
    }
}

//设置excel数据检查规则
function setCheckData(rule,noOverrd){
    if(rule){
        dr = dr || odr || {
            readType:"row",
            startR:1,
            endR:9999,
            startC:1,
            endC:9999
        };
        for(var k in rule){
            if(!dr[k] || !noOverrd)
                dr[k] = rule[k];
        }
    }
}

//获取焦点
function editorFocus(){
    if(editor){
        editor.focus();
    }else{
        setTimeout(function(){
            editorFocus();
        },100);
    }
}