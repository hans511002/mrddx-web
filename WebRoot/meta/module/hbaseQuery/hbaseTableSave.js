/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        hbaseTableSave.js
 *Description：
 *        hBase表维护js
 *Dependent：
 *
 *Author:
 *       wangcs
 ********************************************************/

var typeSn = 1;//行序列
var typeNum = 1;
var shortCutObj = null;
var huanCunData = {};//缓存数据
var tblInfo = null;

var selectDsWin = null;
var selectHbTblWin = null;
var typeHbMap = {};//存放每个分类下hb字段(主要是修改时用)
var defVal = {
    COL_ZIP_TYPE:0,
    COL_MAX_VERSION:3,
    COL_MIN_VERSION:-1,
    BLOCK_SIZE:64,
    BLOOM_TYPE:"ROW",
    TABLE_TTL:-1,
    HFILE_MAXVAL:256,
    MEMSTORE_FLUSH:64,
    NEWDATA_FLUSFLAG:0
};

function pageInit(){
    attachObjEvent($("saveTblBtn"),"onclick",function(e){
        saveHbTblData();
    });

    attachObjEvent($("resetTblBtn"),"onclick",function(e){
        formInit();
    });

    attachObjEvent($("cloTblBtn"),"onclick",function(e){
        closePg();
    });

    initTblForm();
    initNewRow();
    initShortCutObj();

    var validationval =[
        {target:"hbDs",rule:"NotEmpty"},
        {target:"hbTblName",rule:"NotEmpty,ValidByCallBack[tblNameCheck]"},
        {target:"blockSize",rule:"PositiveInt,Range[16,10240]"},
        {target:"colMaxVersion",rule:"PositiveInt,Min[2]"},
        {target:"hfileMaxVal",rule:"PositiveInt,Range[64,102400]"},
        {target:"hbTblTTL",rule:"Range[-1,2147483647]"},
        {target:"colMinVersion",rule:"Min[-1]"},
        {target:"memstoreFlush",rule:"PositiveInt,Range[16,1024]"},
        {target:"hbTblDesc",rule:"MaxLength[200]"}
    ];
    dhtmlxValidation.addValidation($("createHbTblDIV"),validationval ,"true");
    formInit();
}

//关闭
function closePg(){
    if (window.parent && window.parent.closeTab)
        window.parent.closeTab(menuStr);
    else
        window.close();
}

function loadHbTblInfo(){
     if(!tblInfo){
        dhx.showProgress("请求数据中!");
        HBTableAction.getHbTabInfo(tblId,function(data){
            dhx.closeProgress();
            if(data && !data["err"]){
                tblInfo = data;
                var hbDs = $("hbDs");
                var hbTblName = $("hbTblName");
                var hbTblDesc = $("hbTblDesc");
                $("blockSize").value = tblInfo["BLOCK_SIZE"]||defVal["BLOCK_SIZE"];
                $("colZipType").value = tblInfo["COL_ZIP_TYPE"]||defVal["COL_ZIP_TYPE"];
                $("colMaxVersion").value = tblInfo["COL_MAX_VERSION"]||defVal["COL_MAX_VERSION"];
                $("hfileMaxVal").value = tblInfo["HFILE_MAXVAL"]||defVal["HFILE_MAXVAL"];
                $("hbTblTTL").value = tblInfo["TABLE_TTL"]||defVal["TABLE_TTL"];
                
                $("bloomtype").value = tblInfo["BLOOM_TYPE"]||defVal["BLOOM_TYPE"];
                $("colMinVersion").value = tblInfo["COL_MIN_VERSION"]||defVal["COL_MIN_VERSION"];
                $("newDataFlush"+(tblInfo["NEWDATA_FLUSFLAG"]||defVal["NEWDATA_FLUSFLAG"])).checked = true;
                $("memstoreFlush").value = tblInfo["MEMSTORE_FLUSH"]||defVal["MEMSTORE_FLUSH"];

                hbDs.value = tblInfo["DATA_SOURCE_NAME"];
                hbDs.hiddenValue = tblInfo["DATA_SOURCE_ID"];
                hbTblName.value = tblInfo["HB_TABLE_NAME"];
                hbTblDesc.value = tblInfo["HB_TABLE_MSG"]||"";
                var titStr = "源ID:"+tblInfo["DATA_SOURCE_ID"]+
                    "\n源地址:"+tblInfo["DATA_SOURCE_ADDRESS"]+
                    "\n并发数:"+tblInfo["PARALLEL_NUM"]+
                    "\nZK根名称:"+tblInfo["ROOT_ZNODE_NAME"]+
                    "\nHBase根地址:"+tblInfo["PARENT_ZNODE_NAME"];
                hbDs.title = titStr;
                parseFieldToTable(tblInfo["FIELDS"]||[]);
            }else{
                dhx.alert("异常:"+data["err"]);
            }
        });
     }else{
         var hbDs = $("hbDs");
         var hbTblName = $("hbTblName");
         var hbTblDesc = $("hbTblDesc");
         $("blockSize").value = tblInfo["BLOCK_SIZE"]||defVal["BLOCK_SIZE"];
         $("colZipType").value = tblInfo["COL_ZIP_TYPE"]||defVal["COL_ZIP_TYPE"];
         $("colMaxVersion").value = tblInfo["COL_MAX_VERSION"]||defVal["COL_MAX_VERSION"];
         $("hfileMaxVal").value = tblInfo["HFILE_MAXVAL"]||defVal["HFILE_MAXVAL"];
         $("hbTblTTL").value = tblInfo["TABLE_TTL"]||defVal["TABLE_TTL"];
         
         $("bloomtype").value = tblInfo["BLOOM_TYPE"]||defVal["BLOOM_TYPE"];
         $("colMinVersion").value = tblInfo["COL_MIN_VERSION"]||defVal["COL_MIN_VERSION"];
         $("newDataFlush"+(tblInfo["NEWDATA_FLUSFLAG"]||defVal["NEWDATA_FLUSFLAG"])).checked = true;
         $("memstoreFlush").value = tblInfo["MEMSTORE_FLUSH"]||defVal["MEMSTORE_FLUSH"];

         hbDs.value = tblInfo["DATA_SOURCE_NAME"];
         hbDs.hiddenValue = tblInfo["DATA_SOURCE_ID"];
         hbTblName.value = tblInfo["HB_TABLE_NAME"];
         hbTblDesc.value = tblInfo["HB_TABLE_MSG"]||"";
         var titStr = "源ID:"+tblInfo["DATA_SOURCE_ID"]+
             "\n源地址:"+tblInfo["DATA_SOURCE_ADDRESS"]+
             "\n并发数:"+tblInfo["PARALLEL_NUM"]+
             "\nZK根名称:"+tblInfo["ROOT_ZNODE_NAME"]+
             "\nHBase根地址:"+tblInfo["PARENT_ZNODE_NAME"];
         hbDs.title = titStr;
         parseFieldToTable(tblInfo["FIELDS"]||[]);
     }
}

function formInit(){

    var hbDs = $("hbDs");
    var hbTblName = $("hbTblName");
    var hbTblDesc = $("hbTblDesc");
    $("blockSize").value = defVal["BLOCK_SIZE"];
    $("colZipType").value = defVal["COL_ZIP_TYPE"];
    $("colMaxVersion").value = defVal["COL_MAX_VERSION"];
    $("hfileMaxVal").value = defVal["HFILE_MAXVAL"];
    $("hbTblTTL").value = defVal["TABLE_TTL"];
    $("bloomtype").value = defVal["BLOOM_TYPE"];
    $("colMinVersion").value = defVal["COL_MIN_VERSION"];
    $("newDataFlush"+defVal["NEWDATA_FLUSFLAG"]).checked = true;
    $("memstoreFlush").value = defVal["MEMSTORE_FLUSH"];

    hbDs.value = "";
    hbDs.hiddenValue = null;
    hbTblName.value = "";
    hbTblDesc.value = "";
    if(tblMode==0){
        hbDs.disabled = false;
        hbTblName.disabled = false;
        hbTblName.readOnly = false;
        $("colFormTable").className = "colFormTable";
        $("shortCutBtn").style.display = "";
        $("tip").innerHTML = "合并的分类表示同一个列簇!同分类下字段合并表示数据入库时这些字段的值将按拆分符合并入库!";
        parseFieldToTable([]);
    }else if(tblMode==1){
        hbDs.disabled = true;
        hbTblName.disabled = true;
        $("colFormTable").className = "colFormTable";
        $("shortCutBtn").style.display = "none";
        $("tip").innerHTML = "修改时，分类下已存在的HB字段名不可删除（至少存在一个），可删除分类!";
        loadHbTblInfo();
    }else if(tblMode==2){
        hbDs.disabled = false;
        hbTblName.disabled = false;
        hbTblName.readOnly = true;
        $("colFormTable").className = "colFormTable h";
        $("shortCutBtn").style.display = "none";
        $("tip").innerHTML = "选择数据源和Hbase表，列簇分类将自动带入,为其配置别名实现注册(不可删除和新增)，分类下字段可自由配置，配置HB字段名必须与真实对应!";
        parseFieldToTable([]);
    }
    $("snTd").innerHTML = tblMode ? "HB分类" : "序号";
}


//验证Hbase表名重复问题
function tblNameCheck(v){
    if(tblMode!=0){
        return true;
    }
    var dsId = $("hbDs").hiddenValue;
    if(dsId=="" || dsId==null || dsId==undefined){
        return "请先选择数据源，进行表名验证";
    }
    var res = true;
    HBTableAction.isExistsTables(v,dsId, {
        async:false,
        callback:function (data) {
            if(data["err"]){
                res = "发生错误:"+data["err"];
            }else if (data["flag"]) {
                res = "Hbase表名已经在系统存在，不可重复";
            } else {
                res = true;
            }
        }
    });
    return res;
}

//保存hbtable信息
function saveHbTblData(){
    if(dhtmlxValidation.validate("createHbTblDIV")){
        var chkMap = {};
        var fieldInfos = getFieldValues(chkMap);
        for(var k=0;k<fieldInfos.length;k++){
        	if(fieldInfos[k][fieldInfos[k].length-1].length>10){
        		dhx.alert("合并拆分符(如果需要)长度不能大于10");
        		return;
        	}
        }
        if(chkMap["t_null"] || chkMap["f_null"] || chkMap["fz_null"] || chkMap["cf_null"] || chkMap["fb_null"]){
            dhx.alert("分类别名、字段别名、字段中文名、HB字段名(如果需要)、合并拆分符(如果需要)为必填项!");
            return;
        }
        if(chkMap["t_fail"] || chkMap["f_fail"]){
            dhx.alert("分类别名、字段别名只能由字母数字下划线组成,首字符不能是数字!");
            return;
        }
        if(chkMap["t"] || chkMap["f"]){
            dhx.alert("分类别名、字段别名不可重复!");
            return;
        }
        if(chkMap["cv_e"]){
            dhx.alert("同分类下,HB字段名相同的字段需要合并!并填写拆分符!");
            return;
        }
        var saveData = {};
        saveData["TBL_MODE"] = tblMode;
        saveData["HB_TABLE_ID"] = tblId;
        saveData["DATA_SOURCE_ID"] = $("hbDs").hiddenValue;
        saveData["HB_TABLE_NAME"] = $("hbTblName").value.trim();
        saveData["HB_TABLE_DESC"] = $("hbTblDesc").value.trim();
        saveData["BLOCK_SIZE"] = $("blockSize").value.trim()||defVal["BLOCK_SIZE"];
        saveData["COL_ZIP_TYPE"] = $("colZipType").value||defVal["COL_ZIP_TYPE"];
        saveData["COL_MAX_VERSION"] = $("colMaxVersion").value.trim() ||defVal["COL_MAX_VERSION"];
        saveData["HFILE_MAXVAL"] = $("hfileMaxVal").value.trim()||defVal["HFILE_MAXVAL"];
        saveData["TABLE_TTL"]= $("hbTblTTL").value.trim()||defVal["TABLE_TTL"];
        saveData["BLOOM_TYPE"] = $("bloomtype").value||defVal["BLOOM_TYPE"];
        saveData["COL_MIN_VERSION"] = $("colMinVersion").value.trim()||defVal["COL_MIN_VERSION"];
        saveData["NEWDATA_FLUSFLAG"] = $("newDataFlush1").checked ? 1 : 0;
        saveData["MEMSTORE_FLUSH"] = $("memstoreFlush").value.trim()||defVal["MEMSTORE_FLUSH"];
        saveData["FIELDS"] = fieldInfos;
        saveData["CF_HB"] = chkMap["CF_HB"];
        if(tblMode==1){
            saveData["OLD_T_MAP"] = tblInfo["HB_MAP"];
        }
        dhx.showProgress("保存数据中!");
        HBTableAction.saveHbTable(saveData,function (ret){
            dhx.closeProgress();
            if(ret.flag==1){
            	var qryNameStr = ret.qryNames
            	if(qryNameStr==""){
	                dhx.alert("保存成功!",function(){
	                    closePg();
	                });
                }else{
                	 dhx.alert("保存成功!由于列的更改下列查询规则要重新关联："+qryNameStr,function(){
	                    closePg();
	                });
                }
            }else{
                dhx.alert("保存失败!"+(ret.msg||""));
            }
        });

    }
}

//表单初始
function initTblForm(){
    if(!selectDsWin){
        selectDsWin = new meta.ui.PopSelectWin();
        selectDsWin.setDataTableCfg({
            COL_MAP:{
                HB_DS_ID:"ID",
                HB_DS_NAME:"源名称",
                HB_DS_ADDRESS:"源地址",
                HB_DS_BFFW:"并发数",
                HB_ZK_NAME:"ZK根名称",
                HB_ROOT_NAME:"HBase根地址"
            },
            COL_VAL_KEY:",VAL,VAL_NAME,HB_DS_ADDRESS,HB_DS_BFFW,HB_ZK_NAME,HB_ROOT_NAME",
            COL_WIDTH:"6,5,20,24,10,20,15",
            QUERY_SQL:"SELECT A.DATA_SOURCE_ID  VAL,"+
                "A.DATA_SOURCE_NAME  VAL_NAME,"+
                "A.DATA_SOURCE_ADDRESS HB_DS_ADDRESS,"+
                "A.PARALLEL_NUM   HB_DS_BFFW,"+
                "A.ROOT_ZNODE_NAME     HB_ZK_NAME,"+
                "A.PARENT_ZNODE_NAME   HB_ROOT_NAME "+
                "FROM HB_DATA_SOURCE A "+
                "WHERE A.STATE = 0 "
        });
        selectDsWin.setOkCall(function(ipt){
            var d = ipt.data;
            for(var k in d){
                var oldV = $("hbDs").hiddenValue;
                $("hbDs").value = d[k]["VAL_NAME"];
                $("hbDs").hiddenValue = k;
                var titStr = "源ID:"+k+
                    "\n源地址:"+d[k]["HB_DS_ADDRESS"]+
                    "\n并发数:"+d[k]["HB_DS_BFFW"]+
                    "\nZK根名称:"+d[k]["HB_ZK_NAME"]+
                    "\nHBase根地址:"+d[k]["HB_ROOT_NAME"];
                $("hbDs").title = titStr;
                if(tblMode==2 && oldV!=k){
                    $("hbTblName").value = "";
                }
                break;
            }
        });
        attachObjEvent($("hbDs"),"onclick",function(e){
            selectDsWin.setCheckedValue($("hbDs").hiddenValue);
            selectDsWin.show("选择Hbase数据源");
        });
        attachObjEvent($("hbTblName"),"onclick",function(e){
            if(tblMode==2){
                if(dhtmlxValidation.validate("hbDs")){
                    initSelTblWin();
                    selectHbTblWin.setCheckedValue($("hbTblName").value||null);
                    selectHbTblWin.show("选择待注册的Hbase数据表");
                }else{
                    dhx.alert("请先选择数据源!");
                }
            }
        });
    }
}

//获取数据源ID
function getExtPars(){
    return {dataSourceId:$("hbDs").hiddenValue,defV:$("hbTblName").value};
}

//初始Hbase表选择窗
function initSelTblWin(){
    if(!selectHbTblWin){
        selectHbTblWin = new meta.ui.PopSelectWin();
        selectHbTblWin.setDataTableCfg({
            COL_MAP:{
                HB_NAME:"表名",
                HB_DESC:"列簇"
            },
            COL_VAL_KEY:",VAL,VAL_NAME",
            PAGE_SIZE :0,
            CLASS_NAME:"com.ery.meta.module.hBaseQuery.SelectHbaseTblImpl",
            EXT_PARAMS:getExtPars
        });
        selectHbTblWin.setOkCall(function(ipt){
            var d = ipt.data;
            for(var k in d){
                $("hbTblName").value = k;
                var cs = d[k]["COLS"];
                var arr = [];
                for(var i=0;i<cs.length;i++){
                    arr[i] = [[cs[i]]];
                }
                parseFieldToTable(arr);
                break;
            }
        });
    }
}

//表格字段操作
function clikOpt(flag){
    var tbl = $("filedInfoTable");
    var evtEl = window.event.srcElement;
    var curTr = evtEl.parentNode.parentNode.parentNode;
    if(evtEl.className.indexOf("del")!=-1){
        //删除
        switch (flag){
            case 1://分类
                if(typeNum==1){
                    dhx.alert("至少需要存在一个分类!");
                    return;
                }else{
                    cleanWhitespace(curTr);
                    var rowSpan = parseInt(curTr.firstChild.rowSpan);
                    for(var i=1;i<rowSpan;i++){
                        tbl.removeChild(curTr.nextSibling);
                    }
                    tbl.removeChild(curTr);
                    typeNum --;
                }
                break;
            case 2://字段
                var rowSpan = parseInt($("tr_idd_"+curTr.idd).firstChild.rowSpan);
                if(rowSpan==1){
                    dhx.alert("一个分类下至少需要存在一个字段!");
                    return;
                }else{
                    var curthbm = $("tr_idd_"+curTr.idd).childNodes[0].innerHTML;
                    var cuTxt = null;
                    if(curTr.lastChild.lastChild.className != "cf"){
                        cuTxt = curTr.lastChild.firstChild.firstChild;
                    }else{
                        cuTxt = curTr.lastChild.previousSibling.firstChild.firstChild;
                    }
                    if(tblMode==1 && typeHbMap[curthbm]){
                        if(cuTxt.value && typeHbMap[curthbm][cuTxt.value]==1){
                            dhx.alert("已存在的HB字段不可删除!");
                            return;
                        }
                    }

                    var rsp = parseInt(curTr.lastChild.rowSpan);
                    if(curTr.lastChild.lastChild.className != "cf" || rsp>1){
                        //说明当前行结尾有合并
                        for(var pt = curTr;;){
                            if(pt.lastChild.lastChild.className=="cf"){
                                var spNum = parseInt(pt.lastChild.rowSpan)-1;
                                pt.lastChild.rowSpan = spNum;
                                pt.lastChild.setAttribute("rowspan",spNum);
                                if(spNum==1){
                                    pt.lastChild.lastChild.childNodes[0].className = "ihd";
                                }
                                if(curTr.lastChild.lastChild.className=="cf"){
                                    curTr.nextSibling.insertAdjacentElement("beforeEnd",pt.lastChild);
                                }
                                break;
                            }
                            pt = pt.previousSibling;
                        }
                    }

                    if(curTr.id=="tr_idd_"+curTr.idd){
                        //删除头行,将此行3个单元格放入第二行
                        var ntr = $("tr_idd_"+curTr.idd).nextSibling;
                        var td1 = $("tr_idd_"+curTr.idd).firstChild;
                        td1.rowSpan = rowSpan-1;
                        ntr.insertAdjacentElement("afterBegin",td1);

                        var td2 = $("tr_idd_"+curTr.idd).firstChild;
                        td2.rowSpan = rowSpan-1;
                        td1.insertAdjacentElement("afterEnd",td2);

                        var td3 = $("tr_idd_"+curTr.idd).firstChild;
                        td3.rowSpan = rowSpan-1;
                        td2.insertAdjacentElement("afterEnd",td3);

                        ntr.id = "tr_idd_"+curTr.idd;
                    }else{
                        var td = $("tr_idd_"+curTr.idd).firstChild;
                        td.rowSpan = rowSpan-1;
                        td = td.nextSibling;
                        td.rowSpan = rowSpan-1;
                        td = td.nextSibling;
                        td.rowSpan = rowSpan-1;
                    }
                    if(tblMode==1 && cuTxt.value){
                        typeHbMap[curthbm][cuTxt.value] = typeHbMap[curthbm][cuTxt.value]-1;
                    }
                    tbl.removeChild(curTr);
                    if(rowSpan==2){
                        $("tr_idd_"+curTr.idd).lastChild.className = "hd";
                        $("tr_idd_"+curTr.idd).lastChild.lastChild.childNodes[0].className = "ihd";
                    }
                }
                break;
        }
    }else if(evtEl.className.indexOf("new")!=-1){
        //新增
        switch (flag){
            case 1://分类
                typeSn ++;
                typeNum ++;
                var tr = tbl.insertRow(-1);
                tr.id = "tr_idd_"+typeSn;
                tr.idd = typeSn;
                var rowSpan = parseInt($("tr_idd_"+curTr.idd).firstChild.rowSpan);
                for(var i=1;i<rowSpan;i++){
                    curTr = curTr.nextSibling;
                }
                curTr.insertAdjacentElement("afterEnd",tr);
                var td = tr.insertCell(-1);
                td.style.textAlign = "center";
                td.innerHTML = typeSn;
                if(tblMode!=0){
                    td.style.color = "red";
                    td.style.fontWeight = "bold";
                    td.title = "临时序号，真实HB分类名需要保存后生成";
                }
                td.rowSpan = 1;
                td = tr.insertCell(-1);
                td.innerHTML = "<span class='bm'><input type='text'><span class='delt' title='删除分类' onclick='clikOpt(1)'></span><span title='在此分类下方添加新分类' class='newt' onclick='clikOpt(1)'></span></span>";
                td.rowSpan = 1;
                td = tr.insertCell(-1);
                td.innerHTML = "<span class='ms'><input type='text'></span>";
                td.rowSpan = 1;

                td = tr.insertCell(-1);
                td.innerHTML = "<span class='fbm'><input type='text'><span class='delf' title='删除字段' onclick='clikOpt(2)'></span><span title='在此字段下方添加新字段' class='newf' onclick='clikOpt(2)'></span></span>";
                td = tr.insertCell(-1);
                td.innerHTML = "<span class='ms'><input type='text'></span>";
                td = tr.insertCell(-1);
                td.innerHTML = "<span class='fm'><input type='text' "+(tblMode==2?"":"disabled='disabled'")+" value=''></span>";
                td = tr.insertCell(-1);
                td.rowSpan = 1;
                td.setAttribute("rowspan",1);
                td.className = "hd";
                td.innerHTML = "<span class='cf'><input type='text' class='ihd'>" +
                    "<span class='h' onclick='clikOpt(3);' title='同一分类之内向下合并'></span>" +
                    "<span class='c' onclick='clikOpt(4);' title='取消合并'></span>" +
                    "<span class='up' onclick='clikOpt(5);' title='同一分类之内上移'></span>" +
                    "<span class='down' onclick='clikOpt(6);' title='同一分类之内下移'></span>" +
                    "</span>";

                break;
            case 2://字段
                var tr = tbl.insertRow(-1);
                tr.idd = curTr.idd;
                $("tr_idd_"+curTr.idd).lastChild.className = "";
                curTr.insertAdjacentElement("afterEnd",tr);
                var rowSpan = parseInt($("tr_idd_"+curTr.idd).firstChild.rowSpan);
                var td = $("tr_idd_"+curTr.idd).firstChild;
                td.rowSpan = rowSpan+1;
                td = td.nextSibling;
                td.rowSpan = rowSpan+1;
                td = td.nextSibling;
                td.rowSpan = rowSpan+1;

                td = tr.insertCell(-1);
                td.innerHTML = "<span class='fbm'><input type='text'><span class='delf' title='删除字段' onclick='clikOpt(2)'></span><span title='在此字段下方添加新字段' class='newf' onclick='clikOpt(2)'></span></span>";
                td = tr.insertCell(-1);
                td.innerHTML = "<span class='ms'><input type='text'></span>";
                td = tr.insertCell(-1);
                td.innerHTML = "<span class='fm'><input type='text' "+(tblMode==2?"":"disabled='disabled'")+" value=''></span>";

                if(curTr.nextSibling.nextSibling && curTr.nextSibling.nextSibling.lastChild.lastChild.className!="cf"){
                    //说明当前行结尾有合并
                    for(var pt = curTr;;){
                        if(pt.lastChild.lastChild.className=="cf"){
                            var spNum = parseInt(pt.lastChild.rowSpan)+1;
                            pt.lastChild.rowSpan = spNum;
                            pt.lastChild.setAttribute("rowspan",spNum);
                            break;
                        }
                        pt = pt.previousSibling;
                    }
                    var cuTxt = null;
                    if(curTr.lastChild.lastChild.className=="cf"){
                        cuTxt = curTr.lastChild.previousSibling.firstChild.firstChild;
                    }else{
                        cuTxt = curTr.lastChild.firstChild.firstChild;
                    }
                    td.firstChild.firstChild.value = cuTxt.value;
                    td.firstChild.firstChild.hiddenValue = cuTxt.hiddenValue;
                    if(tblMode==1 && cuTxt.value){
                        var curthbm = $("tr_idd_"+curTr.idd).childNodes[0].innerHTML;
                        typeHbMap[curthbm][cuTxt.value] = typeHbMap[curthbm][cuTxt.value]+1;
                    }
                }else{
                    td = tr.insertCell(-1);
                    td.rowSpan = 1;
                    td.setAttribute("rowspan",1);
                    td.innerHTML = "<span class='cf'><input type='text' class='ihd'>" +
                        "<span class='h' onclick='clikOpt(3);' title='同一分类之内向下合并'></span>" +
                        "<span class='c' onclick='clikOpt(4);' title='取消合并'></span>" +
                        "<span class='up' onclick='clikOpt(5);' title='同一分类之内上移'></span>" +
                        "<span class='down' onclick='clikOpt(6);' title='同一分类之内下移'></span>" +
                        "</span>";
                }

                break;
        }
    }else{
        switch(flag){
            case 3://合并

                var curTd = evtEl.parentNode.parentNode;
                var rsp = parseInt(curTd.rowSpan);
                var nextTr = curTr.nextSibling;
                for(var i=1;i<rsp;i++){
                    nextTr = nextTr.nextSibling;
                }
                if(nextTr && nextTr.idd == curTr.idd){
                    var nrTxt = nextTr.lastChild.previousSibling.firstChild.firstChild;
                    if(tblMode==1 && nrTxt.value){
                        dhx.alert("下方字段是已存在的HB字段，合并会引起下方HB字段被删除，不允许!");
                        return;
                    }

                    //满足合并条件
                    var nextTd = nextTr.lastChild;
                    var nrsp = nextTd.rowSpan;
                    rsp += parseInt(nrsp);
                    nextTr.removeChild(nextTd);
                    curTd.rowSpan = rsp;
                    curTd.setAttribute("rowspan",rsp);
                    curTd.lastChild.childNodes[0].className = "";

                    var cuTxt = curTr.lastChild.previousSibling.firstChild.firstChild;
                    for(var i=0,ntr = nextTr;i<nrsp;i++){
                        var nctd = ntr.lastChild;
                        nctd.firstChild.firstChild.value = cuTxt.value;
                        nctd.firstChild.firstChild.hiddenValue = cuTxt.hiddenValue;
                        ntr = nextTr.nextSibling;
                    }

                    var curthbm = $("tr_idd_"+curTr.idd).childNodes[0].innerHTML;
                    if(tblMode==1 && cuTxt.value){
                        typeHbMap[curthbm][cuTxt.value] = typeHbMap[curthbm][cuTxt.value]+nrsp;
                    }
                }
                break;
            case 4://取消合并
                var curthbm = $("tr_idd_"+curTr.idd).childNodes[0].innerHTML;
                var curTd = evtEl.parentNode.parentNode;
                var cuTxt = curTd.previousSibling.firstChild.firstChild;
                if(tblMode==1 && cuTxt.value){
//                    dhx.alert("已存在HB字段不允许取消合并,如果某字段多余请使用删除字段!");
//                    return;
                    typeHbMap[curthbm][cuTxt.value] = 1;
                }

                var rsp = parseInt(curTd.rowSpan);
                curTd.rowSpan = 1;
                curTd.setAttribute("rowspan",1);
                curTd.lastChild.childNodes[0].className = "ihd";
                for(var i=1,nextTr = curTr.nextSibling;i<rsp;i++){
                    nextTr.lastChild.firstChild.firstChild.value = "";
                    nextTr.lastChild.firstChild.firstChild.hiddenValue = null;
                    var td  = nextTr.insertCell(-1);
                    td.rowSpan = 1;
                    td.setAttribute("rowspan",1);
                    td.innerHTML = "<span class='cf'><input type='text' class='ihd'>" +
                        "<span class='h' onclick='clikOpt(3);' title='同一分类之内向下合并'></span>" +
                        "<span class='c' onclick='clikOpt(4);' title='取消合并'></span>" +
                        "<span class='up' onclick='clikOpt(5);' title='同一分类之内上移'></span>" +
                        "<span class='down' onclick='clikOpt(6);' title='同一分类之内下移'></span>" +
                        "</span>";

                    nextTr = nextTr.nextSibling;
                }
                break;
            case 5://上移
                var curTd = evtEl.parentNode.parentNode;
                var rsp = parseInt(curTd.rowSpan);
                for(var preTr = curTr.previousSibling;preTr && preTr.idd == curTr.idd;){
                    if(preTr.lastChild.lastChild.className == "cf"){
                        var posTr = curTr;//位置，需要将节点移动到此位置节点结束标签之后
                        for(var i=1;i<rsp;i++){
                            posTr = posTr.nextSibling;
                        }
                        var pt = preTr.previousSibling;
                        posTr.insertAdjacentElement("afterEnd",preTr);
                        if(preTr.id == "tr_idd_"+curTr.idd){
                            //将上行的三个单元格放到当前行
                            var td1 = preTr.firstChild;
                            curTr.insertAdjacentElement("afterBegin",td1);

                            var td2 = preTr.firstChild;
                            td1.insertAdjacentElement("afterEnd",td2);

                            var td3 = preTr.firstChild;
                            td2.insertAdjacentElement("afterEnd",td3);

                            curTr.id = "tr_idd_"+curTr.idd;
                            preTr.id = "";
                        }
                        preTr = pt;
                        break;
                    } else{
                        var posTr = curTr;
                        for(var i=1;i<rsp;i++){
                            posTr = posTr.nextSibling;
                        }
                        var pt = preTr.previousSibling;
                        posTr.insertAdjacentElement("afterEnd",preTr);
                        preTr = pt;
                        continue;
                    }
                    preTr = preTr.previousSibling;
                }
                break;
            case 6://下移
                var curTd = evtEl.parentNode.parentNode;
                for(var nextTr = curTr.nextSibling;nextTr && nextTr.idd == curTr.idd;){
                    if(nextTr.lastChild.lastChild.className == "cf"){
                        var rsp = parseInt(nextTr.lastChild.rowSpan);
                        var posTr = nextTr;//位置，需要将节点插入到此位置结束标签之后
                        for(var i=1;i<rsp;i++){
                            posTr = posTr.nextSibling;
                        }
                        rsp = parseInt(curTd.rowSpan);
                        for(var i=1,ydTr = curTr;i<=rsp;i++){
                            var pt = ydTr.nextSibling;
                            posTr.insertAdjacentElement("afterEnd",ydTr);
                            posTr = ydTr;
                            ydTr = pt;
                        }
                        if(curTr.id == "tr_idd_"+curTr.idd){
                            //将当前行的三个单元格放到下行
                            var td1 = curTr.firstChild;
                            nextTr.insertAdjacentElement("afterBegin",td1);

                            var td2 = curTr.firstChild;
                            td1.insertAdjacentElement("afterEnd",td2);

                            var td3 = curTr.firstChild;
                            td2.insertAdjacentElement("afterEnd",td3);

                            nextTr.id = "tr_idd_"+curTr.idd;
                            curTr.id = "";
                        }
                        break;
                    }
                    nextTr = nextTr.nextSibling;
                }
                break;
        }
    }
}

//初始一个新行，执行一次
function initNewRow(){
    var tbl = $("filedInfoTable");
    var tr = tbl.insertRow(-1);
    tr.id = "tr_idd_"+typeSn;
    tr.idd = typeSn;
    var td = tr.insertCell(-1);
    td.style.textAlign = "center";
    td.innerHTML = typeSn;
    td.rowSpan = 1;
    td = tr.insertCell(-1);
    td.innerHTML = "<span class='bm'><input type='text'><span class='delt' title='删除分类' onclick='clikOpt(1)'></span><span title='在此分类下方添加新分类' class='newt' onclick='clikOpt(1)'></span></span>";
    td.rowSpan = 1;
    td = tr.insertCell(-1);
    td.innerHTML = "<span class='ms'><input type='text'></span>";
    td.rowSpan = 1;

    td = tr.insertCell(-1);
    td.innerHTML = "<span class='fbm'><input type='text'><span class='delf' title='删除字段' onclick='clikOpt(2)'></span><span title='在此字段下方添加新字段' class='newf' onclick='clikOpt(2)'></span></span>";
    td = tr.insertCell(-1);
    td.innerHTML = "<span class='ms'><input type='text'></span>";
    td = tr.insertCell(-1);
    td.innerHTML = "<span class='fm'><input type='text' "+(tblMode==2?"":"disabled='disabled'")+" value=''></span>";

    td = tr.insertCell(-1);
    td.rowSpan = 1;
    td.setAttribute("rowspan",1);
    td.className = "hd";
    td.innerHTML = "<span class='cf'><input type='text' class='ihd'>" +
        "<span class='h' onclick='clikOpt(3);' title='同一分类之内向下合并'></span>" +
        "<span class='c' onclick='clikOpt(4);' title='取消合并'></span>" +
        "<span class='up' onclick='clikOpt(5);' title='同一分类之内上移'></span>" +
        "<span class='down' onclick='clikOpt(6);' title='同一分类之内下移'></span>" +
        "</span>";
}


/**
 * 获取字段信息
 */
function getFieldValues(chkMap){
    var tbl = $("filedInfoTable");
    var arr = [];
    var preTr = {};
    chkMap = chkMap || {};
    var tmap = {};
    var fmap = {};
    var chb = {};

    var lastcv = {};
    for(var i=0;i<tbl.childNodes.length;i++){
        var tr = tbl.childNodes[i];
        if(tr.idd){
            var ar = [];
            if(preTr.idd!=tr.idd){
                preTr = tr;
                ar.push(preTr.childNodes[0].innerHTML);

                var tv = preTr.childNodes[1].firstChild.firstChild.value.trim();
                if(tv==""){
                    chkMap["t_null"] = 1;
                }
                if(!tmap[tv]){
                    tmap[tv] = 1;
                }else{
                    chkMap["t"] = 1;
                }
                if(!isValidName(tv)){
                    chkMap["t_fail"] = 1;
                }
                ar.push(tv);

                ar.push(preTr.childNodes[2].firstChild.firstChild.value.trim());

                var fv = tr.childNodes[3].firstChild.firstChild.value.trim();
                if(fv==""){
                    chkMap["f_null"] = 1;
                }
                if(!fmap[fv]){
                    fmap[fv] = 1;
                }else{
                    chkMap["f"] = 1;
                }
                if(!isValidName(fv)){
                    chkMap["f_fail"] = 1;
                }
                ar.push(fv);

                fv = tr.childNodes[4].firstChild.firstChild.value.trim();
                if(fv==""){
                    chkMap["fz_null"] = 1;
                }
                ar.push(fv);

                var fbv = tr.childNodes[5].firstChild.firstChild.value.trim();
                if(tblMode==0){
                    fbv = tr.childNodes[5].firstChild.firstChild.hiddenValue||"";
                }
                if(fbv=="" && tblMode==2){
                    chkMap["fb_null"] = 1;
                }
                ar.push(fbv);
                ar.push(tr.childNodes[6].firstChild.firstChild.value.trim());

                if(tr.lastChild.lastChild.className=="cf"){
                    var rsp = parseInt(tr.lastChild.rowSpan);
                    if(rsp>1){
                        chb[ar[0]] = chb[ar[0]]||[];
                        var hb = {};
                        if(tr.childNodes[0].rowSpan>1){
                            hb[tr.childNodes[3].firstChild.firstChild.value.trim()] = fbv;
                        }else{
                            hb[tr.childNodes[0].firstChild.firstChild.value.trim()] = fbv;
                        }
                        for(var tdr=tr.nextSibling,j=1;j<rsp;j++){
                            hb[tdr.childNodes[0].firstChild.firstChild.value.trim()] = fbv;
                            tdr = tdr.nextSibling;
                        }
                        chb[ar[0]].push(hb);
                    }
                }
            }else{
                ar.push(preTr.childNodes[0].innerHTML);
                ar.push(preTr.childNodes[1].firstChild.firstChild.value.trim());
                ar.push(preTr.childNodes[2].firstChild.firstChild.value.trim());

                var fv = tr.childNodes[0].firstChild.firstChild.value.trim();
                if(fv==""){
                    chkMap["f_null"] = 1;
                }
                if(!fmap[fv]){
                    fmap[fv] = 1;
                }else{
                    chkMap["f"] = 1;
                }
                if(!isValidName(fv)){
                    chkMap["f_fail"] = 1;
                }
                ar.push(fv);
                fv = tr.childNodes[1].firstChild.firstChild.value.trim();
                if(fv==""){
                    chkMap["fz_null"] = 1;
                }
                ar.push(fv);
                var fbv = tr.childNodes[2].firstChild.firstChild.value.trim();
                if(tblMode==0){
                    fbv = tr.childNodes[2].firstChild.firstChild.hiddenValue||"";
                }
                if(fbv=="" && tblMode==2){
                    chkMap["fb_null"] = 1;
                }
                ar.push(fbv);

                for(var pt = tr;pt;){
                    if(pt.lastChild.lastChild.className=="cf"){
                        var cv = pt.lastChild.firstChild.firstChild.value.trim();
                        if(cv=="" && pt.nextSibling && pt.nextSibling.lastChild.lastChild.className!="cf"){
                            chkMap["cf_null"] = 1;
                        }
                        ar.push(cv);
                        break;
                    }
                    pt = pt.previousSibling;
                }

                if(tr.lastChild.lastChild.className=="cf"){
                    var rsp = parseInt(tr.lastChild.rowSpan);
                    if(rsp>1){
                        chb[ar[0]] = chb[ar[0]]||[];
                        var hb = {};
                        if(tr.childNodes[0].rowSpan>1){
                            hb[tr.childNodes[3].firstChild.firstChild.value.trim()] = fbv;
                        }else{
                            hb[tr.childNodes[0].firstChild.firstChild.value.trim()] = fbv;
                        }
                        for(var tdr=tr.nextSibling,j=1;j<rsp;j++){
                            hb[tdr.childNodes[0].firstChild.firstChild.value.trim()] = fbv;
                            tdr = tdr.nextSibling;
                        }
                        chb[ar[0]].push(hb);
                    }
                }
            }
            if(lastcv[ar[0]+"="+ar[5]]!=null && lastcv[ar[0]+"="+ar[5]]!=undefined && ar[5]!="" && ar[5]!=null && ar[5]!=undefined){
                if((lastcv[ar[0]+"="+ar[5]]!=ar[6]) || (lastcv[ar[0]+"="+ar[5]]==""&&ar[6]=="")){
                    chkMap["cv_e"] = 1;
                }
            }
            lastcv[ar[0]+"="+ar[5]] = ar[6];
            arr.push(ar);
        }
    }
    chkMap["CF_HB"] = chb;
    return arr;
}

/**
 * 将一个二维数组转换展示到表格中
 * @param arr
 */
function parseFieldToTable(arr,excelflag){
    var tbl = $("filedInfoTable");
    var chs = tbl.childNodes;
    for(var i=1;i<chs.length;i++){
        tbl.removeChild(chs[i]);
        chs = tbl.childNodes;
        i--;
    }
    var tmap = {};//分类map
    typeSn = 0;
    typeNum = 0;
    if(arr.length ==0){
        arr = [[]];
    }
    var fmMap = {};//字段名map
    typeHbMap = {};
    for(var i=0;i<arr.length;i++){
        var thbm = arr[i][0]||"";
        var tbm = arr[i][1]||"";
        var tms = arr[i][2]||"";
        var fbm = arr[i][3]||"";
        var fms = arr[i][4]||"";
        var fm = arr[i][5]||"";
        var cff = arr[i][6]||"";
        if(tblMode==1){
            typeHbMap[thbm] = typeHbMap[thbm] || {};
            typeHbMap[thbm][fm] = (typeHbMap[thbm][fm]||0) + 1;
        }

        var tr = tbl.insertRow(-1);
        var td = null;
        var newTFlag = false;
        if(!tbm || !tmap[tbm]){
            typeSn ++;
            typeNum ++;
            tmap[tbm] = tr;
            tr.id = "tr_idd_"+typeSn;
            tr.idd = typeSn;
            td = tr.insertCell(-1);
            td.style.textAlign = "center";
            td.innerHTML = tblMode?(thbm):typeSn;
            td.rowSpan = 1;
            td = tr.insertCell(-1);
            td.innerHTML = "<span class='bm'><input type='text' value='"+tbm+"'><span class='delt' title='删除分类' onclick='clikOpt(1)'></span><span title='在此分类下方添加新分类' class='newt' onclick='clikOpt(1)'></span></span>";
            td.rowSpan = 1;
            td = tr.insertCell(-1);
            td.innerHTML = "<span class='ms'><input type='text' value='"+tms+"'></span>";
            td.rowSpan = 1;
            newTFlag = true;
        }else{
            td = tmap[tbm].firstChild;
            tr.idd = tmap[tbm].idd;
            var rsp = parseInt(td.rowSpan);
            td.rowSpan = rsp + 1;
            td = td.nextSibling;
            td.rowSpan = rsp + 1;
            td = td.nextSibling;
            td.rowSpan = rsp + 1;
            var pos = tmap[tbm];
            for(var x=1;x<rsp;x++){
                pos = pos.nextSibling;
            }
            pos.insertAdjacentElement("afterEnd",tr);
        }
        td = tr.insertCell(-1);
        td.innerHTML = "<span class='fbm'><input type='text' value='"+fbm+"'><span class='delf' title='删除字段' onclick='clikOpt(2)'></span><span title='在此字段下方添加新字段' class='newf' onclick='clikOpt(2)'></span></span>";
        td = tr.insertCell(-1);
        td.innerHTML = "<span class='ms'><input type='text' value='"+fms+"'></span>";
        td = tr.insertCell(-1);
        td.innerHTML = "<span class='fm'><input type='text' "+(tblMode==2?"":"disabled='disabled'")+" value='"+(tblMode==0?"":fm)+"'></span>";
        if(tblMode==0){
            td.firstChild.firstChild.hiddenValue = fm;
        }
        fmMap[tbm] = fmMap[tbm] || {};
        if(!newTFlag){
            //非新分类
            if(!fmMap[tbm][fm] || fm==""){  //
                td = tr.insertCell(-1);
                td.rowSpan = 1;
                td.setAttribute("rowspan",1);
                td.className = "";
                td.innerHTML = "<span class='cf'><input type='text' class='ihd' value='"+cff+"'>" +
                    "<span class='h' onclick='clikOpt(3);' title='同一分类之内向下合并'></span>" +
                    "<span class='c' onclick='clikOpt(4);' title='取消合并'></span>" +
                    "<span class='up' onclick='clikOpt(5);' title='同一分类之内上移'></span>" +
                    "<span class='down' onclick='clikOpt(6);' title='同一分类之内下移'></span>" +
                    "</span>";
                for(var pt = tr.previousSibling;pt && pt.idd==tr.idd;){
                    pt.lastChild.className = "";
                    pt = pt.previousSibling;
                }
                fmMap[tbm][fm] = tr;
            }else{
                for(var pt = tr;pt;){
                    if(pt.lastChild.lastChild.className=="cf"){
                        var spNum = parseInt(pt.lastChild.rowSpan)+1;
                        pt.lastChild.rowSpan = spNum;
                        pt.lastChild.setAttribute("rowspan",spNum);
                        pt.lastChild.className = "";
                        pt.lastChild.lastChild.childNodes[0].className = "";
                        break;
                    }
                    pt = pt.previousSibling;
                }
            }
        }else{
            fmMap[tbm][fm] = tr;
            td = tr.insertCell(-1);
            td.rowSpan = 1;
            td.setAttribute("rowspan",1);
            td.className = "hd";
            td.innerHTML = "<span class='cf'><input type='text' class='ihd' value='"+cff+"'>" +
                "<span class='h' onclick='clikOpt(3);' title='同一分类之内向下合并'></span>" +
                "<span class='c' onclick='clikOpt(4);' title='取消合并'></span>" +
                "<span class='up' onclick='clikOpt(5);' title='同一分类之内上移'></span>" +
                "<span class='down' onclick='clikOpt(6);' title='同一分类之内下移'></span>" +
                "</span>";
        }
    }
}

//初始快捷录入
function initShortCutObj(){
    if(!shortCutObj){
        shortCutObj = new meta.ui.ShortcutInput();
        shortCutObj.setTipInfo("提示:相同【分类别名】识别为一个分类,同分类下字段需要合并时,通过相同【HB字段名】识别," +
            "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;拆分符取合并行的首行.注意在工具条设置属性与行列索引对应关系");
        shortCutObj.setOkCall(function(){
            var d = shortCutObj.data;
            parseFieldToTable(d,1);
        });
    }
}

//弹出快捷录入
function showShortCutInpu(){
    initShortCutObj();
    if(tblMode==0){
        shortCutObj.setDataRule({
            startR : 2,
            startC : 1,
            columns :["分类别名*","分类描述","字段别名*","字段中文名*","HB字段名","合并拆分符"]
        });
        shortCutObj.show("Excel复制录入Hbase表字段信息");
    }else if(tblMode==1){
        shortCutObj.setDataRule({
            startR : 2,
            startC : 1,
            columns :["分类别名*","分类描述","字段别名*","字段中文名*","HB字段名","合并拆分符"]
        });
        shortCutObj.show("快速编辑Hbase表字段信息(可从Excel复制)");
    }else if(tblMode==2){
        shortCutObj.setDataRule({
            startR : 2,
            startC : 1,
            columns :["分类别名*","分类描述","字段别名*","字段中文名*","HB字段名*","合并拆分符"]
        });
        shortCutObj.show("快速注册Hbase表信息(可从Excel复制)");
    }
    toHtmlforArr(getFieldValues());
}

//数组转换为html
function toHtmlforArr(arr){
    var htmlArr  = ["<table>"];
    htmlArr.push("<tr>");
    htmlArr.push("<td style='background-color:#bdb76b;padding:0 5px !important;font-weight:bold;'>" +
        (tblMode==0?"No.":"HB分类(编辑无效)")+
        "</td>");
    for(var i=0;i<shortCutObj.dataRule.columns.length;i++){
        htmlArr.push("<td style='background-color:#bdb76b;padding:0 5px !important;font-weight:bold;'>"+shortCutObj.dataRule.columns[i]+"</td>");
    }
    htmlArr.push("</tr>");

    for(var i=0;i<arr.length;i++){
        htmlArr.push("<tr>");
        for(var j=0;j<arr[i].length;j++){
            htmlArr.push("<td>"+(arr[i][j]||"&nbsp;")+"</td>");
        }
        htmlArr.push("</tr>");
    }

    htmlArr.push("</table>");
    shortCutObj.parseData(htmlArr.join(""));
}

dhx.ready(pageInit);