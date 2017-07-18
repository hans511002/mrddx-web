/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        saveJob.js
 *Description：
 *        维护数据处理策略任务(增，改，复制）
 *Dependent：
 *
 *Author:
 *       wangcs
 ********************************************************/

var jobInfo = null;
var tab = null;
var curTabIdx = 0;//当前步骤
var maxTabIdx = 0;//目前加载的最大步骤
var optFlag = 0;//0新增，1修改，2复制
var maxIdx = 2;
var tabConfig = {
    1:{title:"第一步：基本信息配置",width:200,divId:"baseInfo"},
    2:{title:"第二步：任务参数配置",width:200,divId:"paramInfo"}
};
var termReq = null;
var sourceCateData = {};
var dataSourceParamMap = {};
var sourceTypeNameMap = {};

var oldInputSource = null;//选中的输入数据源
var oldOutSource = null;//选中的输出数据源
var oldInDsName = null;//源名称
var oldOutDsName = null;
var oldRunTypeId = null;//选中的运行数据源类型ID
var oldInputTypeId = null;//输入数据源类型ID
var oldOutTypeId = null;//输出数据源类型ID

var allParamIdMap = {};//存放所有参数ID【key=输入框ID，value!=0标示输入框有效，=1标示需要必填】
var pluginMaintainWin = null;//窗体
var inputPluginValue = ""; // 输入插件代码
var outputPluginValue = ""; // 输出插件代码
var pluginType = 0;

function pageInit(){
    $("dataTabDIV").style.height = document.body.offsetHeight-40+"px";
    tab = new dhtmlXTabBar("dataTabDIV", "top");
    addTabIdx();
    bindBtnOpt();
    formInit();
    initplugin(); 
}

//绑定按钮事件
function bindBtnOpt(){
    attachObjEvent($("prevBtn"),"onclick",function(e){
        showTabIdx(parseInt(curTabIdx)-1);
    });
    attachObjEvent($("nextBtn"),"onclick",function(e){
        showTabIdx(parseInt(curTabIdx)+1);
    });
    attachObjEvent($("saveBtn"),"onclick",function(e){
        if(dhtmlxValidation.validate($("baseInfo"))){
            if(checkMustParamVal()){
                //验证通过，提取数据保存到后台
                var saveData = termReq.getKeyValue();
                saveData["JOB_DESC"] = $("descInfo").value.trim();
                saveData["JOB_TYPE"] =  document.getElementById("jobType").value;
                saveData["PARAM_INFOS"] = [];
                for(var k in allParamIdMap){
                    if(allParamIdMap[k]){
                        var p = {};
                        p.PARAM_NAME = $(k).PARAM_NAME;
                        p.PARAM_DESC = $(k).PARAM_DESC;
                        p.PARAM_VALUE = $(k).value;
                        saveData["PARAM_INFOS"].push(p);
                    }
                }
                saveData.jobId = jobId;
                saveData.optFlag = optFlag;
                saveData.inputPluginValue = inputPluginValue;
                saveData.outputPluginValue = outputPluginValue;

                dhx.showProgress("保存数据中!");
                JobAction.saveJob(saveData,function(ret){
                    dhx.closeProgress();
                    if(ret.flag==1){
                        dhx.alert("保存成功");
                        closePg();
                    }else{
                        dhx.alert("保存出错!"+(ret.msg||""));
                    }
                });

            }else{
                showTabIdx(2);
            }
        }else{
            showTabIdx(1);
        }
    });
    attachObjEvent($("resetBtn"),"onclick",function(e){
        ClearParamDealObjMap();
        allParamIdMap = {};
        if(jobId){
            loadInfo();
        }
        querySysParam();
        termReq.init(function(){
            dhx.closeProgress();
            showTabIdx(1);
        });
    });
    attachObjEvent($("closeBtn"),"onclick",function(e){
        closePg();
    });
    attachObjEvent($("paramInfo"),"onscroll",function(e){
        computScroll();
    });
    tab.attachEvent("onSelect", function(id,last_id){
        var idx = id.replace("a","");
        return !showTabIdx(idx,1);
    });

    dhtmlxValidation.addValidation($("baseInfo"), [
        {target:"jobName",rule:"NotEmpty,MaxLength[64]"},
        {target:"inputDir",rule:"NotEmpty,MaxLength[64]"},
        {target:"mapTaskNum",rule:"PositiveInt,NotEmpty,MaxLength[9]"},
        {target:"reduceTaskNum",rule:"PositiveInt,NotEmpty,MaxLength[9]"},
        {target:"runDs",rule:"NotEmpty"},
        {target:"inputDs",rule:"NotEmpty"},
        {target:"jobType",rule:"NotEmpty"},
        {target:"outDs",rule:"NotEmpty"}
    ])

}

//计算滚动
function computScroll(){
    var t = $("paramInfo").scrollTop || 0;
    for(var i=1;i<=3;i++){
        var pt = $("pt"+i);
        if(t>0){
            pt.style.top = t-1 + "px";
            pt.style.borderBottomWidth = "1px";
        }else{
            pt.style.top = "0px";
            pt.style.borderBottomWidth = "0px";
        }
    }
}

//展示某个步骤
function showTabIdx(idx,noSel){
    if(!tabConfig[idx])return;
    if(curTabIdx==idx)return;
    if(idx<=maxTabIdx){
        if(idx==2){
            if(dhtmlxValidation.validate($("inputDs")) && dhtmlxValidation.validate($("outDs"))){
            }else{
                showTabIdx(1);
                return true;
            }
        }
        if(!noSel){
            tab.setTabActive("a"+idx);
        }
        if(curTabIdx && curTabIdx!=idx){
            $(tabConfig[curTabIdx].divId).style.display = "none";
            if(idx==2){
                computScroll();
            }
        }
        curTabIdx = parseInt(idx);
        $(tabConfig[idx].divId).style.display = "";
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
    }else{
        addTabIdx();
    }
}

//添加一个tab
function addTabIdx(noShow){
    if(maxTabIdx<maxIdx){
        maxTabIdx++;
        var cfg = tabConfig[maxTabIdx];
        tab.addTab("a"+maxTabIdx,cfg.title, cfg.width+"px");
        tab.cells("a"+maxTabIdx).attachObject($(cfg.divId));
        if(!noShow){
            showTabIdx(maxTabIdx);
        }
        if(maxTabIdx==maxIdx){
            $("saveBtn").style.display = "";
        }
    }
}

//关闭
function closePg(){
    if (window.parent && window.parent.closeTab)
        window.parent.closeTab(menuStr);
    else
        window.close();
}

//查询数据源类型
function querySourceType(){
    dhx.showProgress("加载数据中!");
    JobAction.querySourceTypeMap({
        async:false,
        callback:function(data){
            dhx.closeProgress();
            if(data){
                for(var k in data){
                    var arr = data[k];
                    sourceCateData[k] = [];
                    for(var i=0;i<arr.length;i++){
                        var a = [];
                        a.push(arr[i]["SOURCE_TYPE_ID"]);
                        a.push(arr[i]["SOURCE_NAME"]);
                        a.push(arr[i]["SOURCE_DB_TYPE"]);
                        a.push(arr[i]["SOURCE_CATE"]);
                        sourceCateData[k].push(a);
                        sourceTypeNameMap[arr[i]["SOURCE_TYPE_ID"]] = arr[i]["SOURCE_NAME"];
                    }
                }
            }
        }
    });
}

//表单初始
function formInit(){
    querySourceType();
    //申明一些条件组件
    termReq = TermReqFactory.createTermReq(1);
    var jobNameTm = termReq.createTermControl("jobName","JOB_NAME");
    jobNameTm.setWidth(300);
    var jobTypeTm = termReq.createTermControl("jobType","JOB_TYPE");
    jobNameTm.setWidth(300);
    
    var jobPriorityTm = termReq.createTermControl("jobPriority","JOB_PRIORITY");
    jobPriorityTm.setWidth(300);
    jobPriorityTm.setHeight(25);
    jobPriorityTm.setListRule(0,[
        [3,"普通"],[1,"最低级"],[2,"低级"],[4,"高级"],[5,"最高级"]
    ],3);
    jobPriorityTm.enableReadonly(true);

    var inputDirTm = termReq.createTermControl("inputDir","INPUT_DIR");
    inputDirTm.setWidth(300);
    var mapTaskNumTm = termReq.createTermControl("mapTaskNum","MAP_TASK_NUM");
    mapTaskNumTm.setWidth(110);
    var reduceTaskNumTm = termReq.createTermControl("reduceTaskNum","REDUCE_TASK_NUM");
    reduceTaskNumTm.setWidth(110);

    var runDsTm = termReq.createTermControl("runDs","RUN_DS");
    runDsTm.setWidth(300);
    runDsTm.setClassRule("com.ery.meta.module.bigdata.mrddx.config.SelectDsServiceImpl",4,null,{
        SOURCE_CATE:2
    },0,{VAL:"ID",VAL_NAME:"运行源名称"});
    runDsTm.setDataTableAppCond({
        title:"源类型",
        type:"SELECT" ,
        key:"SOURCE_TYPE_ID",
        data:sourceCateData[2]
    });
    runDsTm.setValueChange(function(v,t){
        oldRunTypeId = t.myDataTable.getUserData(v,"SOURCE_TYPE_ID");
        queryDsParam("run",v);
    });

    var inputDsTm = termReq.createTermControl("inputDs","INPUT_DS");
    inputDsTm.setWidth(300);
    inputDsTm.setClassRule("com.ery.meta.module.bigdata.mrddx.config.SelectDsServiceImpl",4,null,{
        SOURCE_CATE:0
    },0,{VAL:"ID",VAL_NAME:"处理源名称"});
    inputDsTm.setDataTableAppCond({
        title:"源类型",
        type:"SELECT" ,
        key:"SOURCE_TYPE_ID",
        data:sourceCateData[0]
    });
    inputDsTm.setValueChange(function(v,t){
        oldInputTypeId = t.myDataTable.getUserData(v,"SOURCE_TYPE_ID");
        oldInDsName = t.myDataTable.getUserData(v,"VAL_NAME");
        queryDsParam("input",v);
    });

    var outDsTm = termReq.createTermControl("outDs","OUT_DS");
    outDsTm.setWidth(300);
    outDsTm.setClassRule("com.ery.meta.module.bigdata.mrddx.config.SelectDsServiceImpl",4,null,{
        SOURCE_CATE:0
    },0,{VAL:"ID",VAL_NAME:"处理源名称"});
    outDsTm.setDataTableAppCond({
        title:"源类型",
        type:"SELECT" ,
        key:"SOURCE_TYPE_ID",
        data:sourceCateData[0]
    });
    outDsTm.setValueChange(function(v,t){
        oldOutTypeId = t.myDataTable.getUserData(v,"SOURCE_TYPE_ID");
        oldOutDsName = t.myDataTable.getUserData(v,"VAL_NAME");
        queryDsParam("out",v);
    });

    UserTypeAction.queryTypeByUser(null,function(data){
		var paramsTD = document.getElementById("jobType");
	    paramsTD.options.length = 0; 
	    paramsTD.options[0] = new Option("--全部--","");
	    for(var m=0;m<data.length;m++){
	    	paramsTD.options[m+1] = new Option(data[m].TYPE_NAME,data[m].TYPE_ID);
	    }
	    document.getElementById("jobType").value = jobInfo==null?"":jobInfo["JOB_TYPE"];
	});	
	    //加载初始信息
    if(jobId){
        optFlag = copyFlag ? 2 : 1;
        dhx.showProgress("加载数据中!");
        JobAction.queryJobById({jobId:jobId},{
            async:false,
            callback:function(data){
                dhx.closeProgress();
                jobInfo = data[0];
                loadInfo();
            }
        });
    }else{
        optFlag = 0;
    }

    querySysParam();//系统参数

    termReq.init(function(){
        dhx.closeProgress();
    });
}

//加载信息
function loadInfo(){
    termReq.getTermControl("JOB_NAME").defaultValue = [optFlag==1?(jobInfo["JOB_NAME"] ||""):""];
    termReq.getTermControl("JOB_PRIORITY").defaultValue = [jobInfo["JOB_PRIORITY"]];
    termReq.getTermControl("INPUT_DIR").defaultValue = [jobInfo["INPUT_DIR"] ||""];
    termReq.getTermControl("MAP_TASK_NUM").defaultValue = [jobInfo["MAP_TASKS"] ||""];
    termReq.getTermControl("REDUCE_TASK_NUM").defaultValue =[jobInfo["REDUCE_TASKS"] ||""];
    $("descInfo").value = jobInfo["JOB_DESCRIBE"]||"";
    termReq.getTermControl("RUN_DS").defaultValue = [jobInfo["JOB_RUN_DATASOURCE"] ||""];
    termReq.getTermControl("INPUT_DS").defaultValue = [jobInfo["INPUT_DATA_SOURCE_ID"] ||""];
    termReq.getTermControl("OUT_DS").defaultValue = [jobInfo["OUTPUT_DATA_SOURCE_ID"] ||""];
    document.getElementById("jobType").value = jobInfo["JOB_TYPE"];
    termReq.getTermControl("JOB_TYPE").defaultValue = [jobInfo["JOB_TYPE"] ||""];
    inputPluginValue = jobInfo["INPUT_PLUGIN_CODE"]==null?"":jobInfo["INPUT_PLUGIN_CODE"];
    outputPluginValue = jobInfo["OUTPUT_PLUGIN_CODE"]==null?"":jobInfo["OUTPUT_PLUGIN_CODE"];

    oldRunTypeId = jobInfo["RUN_SOURCE_TYPE_ID"];
    oldInputTypeId = jobInfo["INPUT_SOURCE_TYPE_ID"];
    oldOutTypeId = jobInfo["OUTPUT_SOURCE_TYPE_ID"];
    oldInputSource = jobInfo["INPUT_DATA_SOURCE_ID"];
    oldInDsName = jobInfo["INPUT_DATA_SOURCE_NAME"];
    oldOutSource = jobInfo["OUTPUT_DATA_SOURCE_ID"];
    oldOutDsName = jobInfo["OUTPUT_DATA_SOURCE_NAME"];
    queryDsParam("run",jobInfo["JOB_RUN_DATASOURCE"] ||"");
    queryDsParam("input",oldInputSource);
    queryDsParam("out",oldOutSource);
    querySourceParam("input",oldInputSource);
    querySourceParam("out",oldOutSource);
    addTabIdx(true);
}

//查询数据源的参数(默认参数)
function queryDsParam(k,v){
    if(!dataSourceParamMap[v]){
        JobAction.queryDataSourceParam({DATA_SOURCE_ID:v},function(data){
            dataSourceParamMap[v] = data;
            loadDsParam(k,v,dataSourceParamMap[v]);
        })
    }else{
        loadDsParam(k,v,dataSourceParamMap[v]);
    }
}

//加载数据源参数
var tdMax = 0;
function loadDsParam(k,dsId,data){
    var dv = $(k+"DsParDIV");
    var w = dv.parentNode.offsetWidth-4;
    if(!tdMax){
        tdMax = w;
        dv.parentNode.style.width = w + "px";
    }else{
        w = tdMax;
    }
    dv.innerHTML = "<table class='paramTb' border='1' style='border-collapse:collapse;border:1px solid #a9a9a9;width:"+(w-2)+"px;' id='ptb_"+k+"'><tr>" +
        "<th style='width:57%;'>" +
        "<span title='数据源类型'>"+(sourceTypeNameMap[k=="run"?oldRunTypeId:(k=="input"?oldInputTypeId:oldOutTypeId)]||"")+"</span>" +
        "&nbsp;&nbsp;连接配置项</th>" +
        "<th style='width:43%;text-align:center !important;'>值</th>" +
        "</tr></table>";
    var ptb = $("ptb_"+k);
    for(var i=0;i<data.length;i++){
        var tr = ptb.insertRow(-1);
        var td = tr.insertCell(-1);
        td.innerHTML = data[i]["PARAM_NAME"];
        td.title = data[i]["PARAM_DESC"];
        td = tr.insertCell(-1);
        td.innerHTML = data[i]["PARAM_VALUE"]||"";
    }
    if(k=="run"){
        if($("baseInfo").style.display !="none"){
            $("descInfo").style.height = dv.offsetHeight + 26 + "px";
        }
    }else if(k=="out"){
        if($("baseInfo").style.display !="none"){
            $("descInfo").style.width = dv.offsetWidth -2 + "px";
        }
        if(oldOutSource!=dsId){
            querySourceParam(k,dsId);
            oldOutSource = dsId;
        }
    }else if(k=="input"){
        if(oldInputSource!=dsId){
            querySourceParam(k,dsId);
            oldInputSource = dsId;
        }
    }
}

//查询源参数
function querySysParam(){
    dhx.showProgress("加载数据中!");
    JobAction.querySystemParam({jobId:jobId},function(data){
        dhx.closeProgress();
        renderSourceParam("sys",data);
    })
}

//查询源参数
function querySourceParam(k,dsId){
    var data = {};
    data["DATA_SOURCE_ID"] = dsId;
    data["SOURCE_TYPE_ID"] = k=="input"?oldInputTypeId:oldOutTypeId;
    data["inputOrOutput"] = k=="input"?1:2;
    data["jobId"] = jobId;
    JobAction.querySourceParam(data,function(ret){
        renderSourceParam(k,ret);
    });
}

//绘制参数界面
function renderSourceParam(k,data){
    var tbd = null;
    if(k=="sys"){
        tbd = $("sysParTD");
    }else{
        tbd = k=="input" ? $("inputParTD") : $("outParTD");
    }
    //清除老数据
    var oldMapV = {};//缓存老数据，避免类型未变动时重复的值多次输入
    var chs = tbd.childNodes;
    for(var i=0;i<chs.length;i++){
        var tds = chs[i].childNodes;
        if(tds[0].className == "ptitle"){
            oldMapV[tds[1].innerHTML] = $("p_"+tds[1].innerHTML).value.trim();
        }else if(tds[0].className == "pname"){
            oldMapV[tds[0].innerHTML] = $("p_"+tds[0].innerHTML).value.trim();
        }
        tbd.removeChild(chs[i]);
        i--;
        chs = tbd.childNodes;
    }

    //载入新数据
    for(var i=0;i<data.length;i++){
        var tr = tbd.insertRow(-1);
        var td = null;
        var str = "";
        if(i==0){
            td = tr.insertCell(-1);
            td.rowSpan = data.length;
            td.rowspan = data.length;
            td.className = "ptitle";
            if(k=="sys"){
                str = "系统参数";
            }else if(k=="input"){
                str = "源: "+oldInDsName + "<br>输入参数";
            }else if(k=="out"){
                str = "源: "+oldOutDsName + "<br>输出参数";
            }
            td.innerHTML = str;
        }
        td = tr.insertCell(-1);
        td.className = "pname";
        td.innerHTML = data[i]["PARAM_NAME"];

        var pv = data[i]["DEFAULT_VALUE"] || oldMapV[data[i]["PARAM_NAME"]] || "";
        td = tr.insertCell(-1);
        td.className = "pvalue";
        var w = ParamInputValCfg[data[i]["PARAM_NAME"]] ? 190 : 240;
        var iid = "p_"+data[i]["PARAM_NAME"];
        str = "<input style='width:"+w+"px;' type='text' id='"+iid+"' value=''>"+
            (data[i]["IS_MUST"]?"<span style='color:red'>*</span>":"&nbsp;");
        if(ParamInputValCfg[data[i]["PARAM_NAME"]]){
            str += "<a onclick='$(\""+iid+"\").clikf()' href='javascript:void(0)'>快捷选入</a>";
            td.innerHTML = str;
            createParamDealObj(iid,data[i]["PARAM_NAME"]);
        }else{
            td.innerHTML = str;
        }
        document.getElementById(iid).value = pv;
        if(data[i]["IS_MUST"]){
            dhtmlxValidation.addValidation($(iid),"NotEmpty");
            allParamIdMap[iid] = 1;
        }else{
            allParamIdMap[iid] = -1;
        }

        td = tr.insertCell(-1);
        td.className = "pdesc";
        td.innerHTML = data[i]["PARAM_DESC"];
        td.title = data[i]["PARAM_DESC"];


        $(iid).PARAM_NAME = data[i]["PARAM_NAME"];
        $(iid).PARAM_DESC = data[i]["PARAM_DESC"];
    }

}

//必填参数验证
function checkMustParamVal(){
    var ret = true;
    for(var k in allParamIdMap){
        if(allParamIdMap[k]){
            if($(k)){
                if(allParamIdMap[k]==1){
                    var r = dhtmlxValidation.validate($(k));
                    ret = ret && r;
                }
            }else{
                allParamIdMap[k]=0;//文本框不存在，置0，无效，下次忽略验证
            }
        }
    }
    return ret;
}

function initplugin(){
    var in_pluginBtn = document.getElementById("inputPluginBtn");
    attachObjEvent(in_pluginBtn,"onclick",function(){
    	pluginType =1;
    	pluginFun();
    });
    
    var out_pluginBtn = document.getElementById("outputPluginBtn");
    attachObjEvent(out_pluginBtn,"onclick",function(){
    	pluginType =2;
   	 	pluginFun();
    });
    
    var col_pluginValueExample = document.getElementById("pluginValueExample");
    pluginExample("pluginValueExample");
    attachObjEvent(col_pluginValueExample,"onmouseover",function(){
   	 pluginExample("pluginValueExample");
    });
}

/**
 *插件窗体
**/
function pluginFun(){
	if ($("pluginCode").readOnly){
		document.getElementById("pluginSaveBtn").style.visibility = "hidden";
	    document.getElementById("pluginCalBtn").style.visibility = "hidden";
	}else{
		document.getElementById("pluginCloseBtn").style.visibility = "hidden";
	}

   var title = "";
   var pluginCode = document.getElementById("pluginCode");
   title = "插件内容";
   if (pluginType == 1){
	   pluginCode.value = inputPluginValue;
   }else if (pluginType == 2){
	   pluginCode.value = outputPluginValue;
   }
   if(!pluginMaintainWin){
       pluginMaintainWin = DHTMLXFactory.createWindow("1","pluginMaintainWin",0,0,552,480);
       pluginMaintainWin.stick();
       pluginMaintainWin.denyResize();
       pluginMaintainWin.denyPark();
       pluginMaintainWin.center();
       
       var divPlugin = document.getElementById("div_plugin");
       pluginMaintainWin.attachObject(divPlugin);
       var saveBtn = document.getElementById("pluginSaveBtn");
       var calBtn = document.getElementById("pluginCalBtn");
       var closeBtn = document.getElementById("pluginCloseBtn");
       attachObjEvent(saveBtn,"onclick",savePluginValue);
       attachObjEvent(calBtn,"onclick",function(){pluginMaintainWin.close();});
       attachObjEvent(closeBtn,"onclick",function(){pluginMaintainWin.close();});
       
       pluginMaintainWin.attachEvent("onClose",function(){
           pluginMaintainWin.setModal(false);
           this.hide();
           return false;
       });
   }
   pluginMaintainWin.setText(title);
   pluginMaintainWin.setModal(true);
   pluginMaintainWin.show();
   pluginMaintainWin.center();
}

//保存HBase数据源
function savePluginValue(){
    if(!(dhtmlxValidation.validate("div_plugin")))return;
    var pluginValue = document.getElementById("pluginCode").value;
    pluginMaintainWin.close();
    if (pluginType == 1){
    	inputPluginValue = pluginValue;
    }else if (pluginType == 2){
    	outputPluginValue = pluginValue;
    }
}

function pluginExample(id){
	var source = $(id);
	var html = "<textarea style=\"text-align: left;\" rows=\"20\" cols=\"70\"  readonly=\"readonly\">";
	html +="package com.ery.hadoop.mrddx.remote.plugin;";
	html +="\r\n";
	html +="import java.io.IOException;";
	html +="\r\n";
	html +="import java.util.Map;";
	html +="\r\n";
	html +="import org.apache.hadoop.mapred.JobConf;";
	html +="\r\n";
	html +="/**";
	html +="\r\n";
	html +=" * 插件接口";
	html +="\r\n";
	html +=" *";
	html +="\r\n";
	html +=" */";
	html +="\r\n";
	html +="public interface IRemotePlugin {";
	html +="\r\n";
	html +="\r\n";
	html +="	/**";
	html +="\r\n";
	html +="	 * 除采集文件之外（适用于拆分字段后的处理）";
	html +="\r\n";
	html +="	 * @param recode 记录";
	html +="\r\n";
	html +="	 * @return false表示需被过滤掉的数据";
	html +="\r\n";
	html +="	 * @throws IOException";
	html +="\r\n";
	html +="	 */";
	html +="\r\n";
	html +="	public boolean recode(Map<String, Object> recode) throws IOException;";
	html +="\r\n";
	html +="\r\n";
	html +="	/**";
	html +="\r\n";
	html +="	 * 处理采集文件（适用于按行读取的处理），这里只需空实现";
	html +="\r\n";
	html +="	 * @param lineValue 行记录";
	html +="\r\n";
	html +="	 * @return 返回处理过后的行记录值，返回null表示过滤掉该记录";
	html +="\r\n";
	html +="	 * @throws IOException";
	html +="\r\n";
	html +="	 */";
	html +="\r\n";
	html +="	public String line(String lineValue) throws IOException;";
	html +="\r\n";
	html +="\r\n";
	html +="	/**";
	html +="\r\n";
	html +="	 * 配置相关内容";
	html +="\r\n";
	html +="	 * @param job";
	html +="\r\n";
	html +="	 */";
	html +="\r\n";
	html +="	public void configure(JobConf job);";
	html +="\r\n";
	html +="\r\n";
	html +="	/**";
	html +="\r\n";
	html +="	 * 关闭资源";
	html +="\r\n";
	html +="	 * @throws IOException";
	html +="\r\n";
	html +="	 */";
	html +="\r\n";
	html +="	public void close() throws IOException;";
	html +="\r\n";
	html +="}";
	html += "</textarea>";
	source.setAttribute("systemText",html);
    attachObjEvent(source,"onmouseover",function(e){
    	if(e.srcElement && e.srcElement.getAttribute("systemText")){
            var pluginExampleDIV = document.getElementById("pluginExampleDIV");
            //$("paramTitle").innerHTML = "<span title='数据格式' style='font-weight:normal;color:#b07e6f'>数据源信息：</span>";
            $("pluginExampleDIV").innerHTML = e.srcElement.getAttribute("systemText");
            var pos = autoPosition(pluginExampleDIV,e.srcElement,true,false,Math.min(e.srcElement.offsetWidth-50,e.srcElement.parentNode.offsetWidth-50),-(e.srcElement.offsetHeight-20));
    	}
    });
}

dhx.ready(pageInit);