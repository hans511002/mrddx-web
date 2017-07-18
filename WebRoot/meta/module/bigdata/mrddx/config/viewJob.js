/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        viewJob.js 
 *Description	查看任务
 *
 *Dependent：
 *
 *Author:	王建友
 *        
 ********************************************************/
var dataTable = null;//表格
var pluginMaintainWin = null;//窗体
var inputPluginValue = ""; // 输入插件代码
var outputPluginValue = ""; // 输出插件代码
var pluginType = 0;


//初始化JobForm表单
function jobFormInit(){
	$("CloseBtnDiv").style.display=""; 	
	var closeBtn = document.getElementById("closeBtn");
    //关闭按钮
    attachObjEvent(closeBtn,"onclick",function(e){
		if(window.parent && window.parent.closeTab)
                    window.parent.closeTab(menuStr);
                else
                    window.close();
    });
    
	JobAction.queryJobById({jobId:jobId},function(data){
		$("jobName").innerHTML = data[0].JOB_NAME || "";
		$("jobPriorityName").innerHTML = data[0].JOB_PRIORITY_NAME || "";
		$("mapTasks").innerHTML = data[0].MAP_TASKS || "";
		$("reduceTasks").innerHTML = data[0].REDUCE_TASKS || "";
		$("typeName").innerHTML = data[0].TYPE_NAME || "";
		$("inputDir").innerHTML = data[0].INPUT_DIR || "";
		$("jobDescribe").value = data[0].JOB_DESCRIBE || "";
		$("JOB_RUN_DATASOURCE_NAME").innerHTML = data[0].JOB_RUN_DATASOURCE_NAME || "";
		$("jobDescribe").readOnly = "readOnly";
		$(inputDataSourceName).innerHTML = data[0].INPUT_DATA_SOURCE_NAME || "";
		$(outputDataSourceName).innerHTML = data[0].OUTPUT_DATA_SOURCE_NAME || "";
		inputPluginValue = data[0].INPUT_PLUGIN_CODE || "";
		outputPluginValue = data[0].OUTPUT_PLUGIN_CODE || "";
	});
	
	jobParamInit();
	initplugin();
}

function jobParamInit(){
    dataTable = new meta.ui.DataTable("_queryColGridParam_in");//第二个参数表示是否是表格树
    dataTable.setColumns({
        PARAM_NAME:"参数名称",
        PARAM_VALUE:"参数值",
        PARAM_DESC:"参数描述",
        OPP:''
    },"PARAM_NAME,PARAM_VALUE,PARAM_DESC");
    dataTable.setPaging(false);//分页
    dataTable.setSorting(false);
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("30,30,40");
    dataTable.setGridColumnCfg(0,{align:"left"});
    dataTable.setGridColumnCfg(1,{align:"left"});
    dataTable.setGridColumnCfg(2,{align:"left"});

    dataTable.setFormatCellCall(function(rid,cid,data,colId){
    	if((data[cid]+"").indexOf("\&")!=-1){
		    var dataTemp="";
			var indexSplit = (data[cid]+"").split("&");
			for(var i=0;i<indexSplit.length;i++){
				dataTemp += indexSplit[i]+"&";		
			}
			return dataTemp;
		}
        return data[cid];
    });
    dataTable.setReFreshCall(
	    JobAction.queryJobParamById({jobId:jobId},function(data){
	        dhx.closeProgress();
	        dataTable.bindData(data);
	    })
    ); 
    return dataTable;
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
       var closeBtn = document.getElementById("pluginCloseBtn");
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

dhx.ready(jobFormInit);
