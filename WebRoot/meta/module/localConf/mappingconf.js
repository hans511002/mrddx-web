/******************************************************
 *Copyrights @ 2014，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        mappingconf.js
 *Description：
 *        入库映射配置
 *Dependent：
 *
 *Author: 王鹏坤
 *
 ********************************************************/
 
 var dataTable = null;   //数据来源
 var maintainWin = null;//窗口（新增，修改，查看）
 
  /**
 * 页面初始化
 */ 
function pageInit(){
	var termReq = TermReqFactory.createTermReq(1);
    var dataName = termReq.createTermControl("hbColNameQ","HB_COL_NAME");
    dataName.setWidth(120);
    dataName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    dataInit();
    dataTable.setPaging(true, 20);//分页
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("12,12,12,12,12,12,12,16");
    dataTable.setGridColumnCfg(0,{align:"left"});
    dataTable.setGridColumnCfg(1,{align:"left"});
    dataTable.setGridColumnCfg(2,{align:"right"});
    dataTable.setGridColumnCfg(3,{align:"left"});
    dataTable.setGridColumnCfg(4,{align:"left"});
    dataTable.setGridColumnCfg(5,{align:"left"});
    dataTable.setGridColumnCfg(6,{align:"left"});
    dataTable.setReFreshCall(queryData);
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    var newBtn = document.getElementById("newBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    attachObjEvent(newBtn,"onclick",function(){
        showData(0,1);
    });

}

function dataInit(){
    dataTable = new meta.ui.DataTable("container");
    dataTable.setColumns({
        HB_COL_NAME : "HBASE字段名",
        IMP_RULE : "入库规则",
        COL_TYPE: "字段类型",
        ORG_COL_NAME: "原始字段名",
        HB_CF_NAME : "HBASE列族名",
        COL_VAL_PREFIX:"列值前缀",
        COL_VAL_SUFFIX:"列值后缀",
        OPP: "操作"

    },"HB_COL_NAME,IMP_RULE,COL_TYPE,"+
    "ORG_COL_NAME,HB_CF_NAME,COL_VAL_PREFIX,COL_VAL_SUFFIX,RULE_ID");

    dataTable.setFormatCellCall(function(rid, cid, data, colId){
		if((data[cid]+"").indexOf("\&")!=-1){
		    var dataTemp="";
			var indexSplit = (data[cid]+"").split("&");
			for(var i=0;i<indexSplit.length;i++){
				dataTemp += indexSplit[i]+"&";		
			}
			return dataTemp;
		}
        if(colId == "OPP"){
            return "<a href='javascript:void(0)' onclick='showData(\""+rid+"\",0);return false;'>查看</a>&nbsp;&nbsp;&nbsp;&nbsp;"
                +"<a href='javascript:void(0)' onclick='showData(\""+rid+"\",-1);return false;'>修改</a>&nbsp;&nbsp;&nbsp;&nbsp;"
                +"<a href='javascript:void(0)' onclick='deleteData(\""+rid+"\");return false;'>删除</a>&nbsp;&nbsp;&nbsp;&nbsp;";
        }else if(colId == "COL_TYPE"){
        	if(data[cid]=="1"){
        		return "单列";
        	}else if(data[cid]=="2"){
        		return "合并列";
        	}else if(data[cid]=="3"){
        		return "常量列";
        	}
        }
        return data[cid];
    });
}


//查询数据
function queryData(dt,params){
    var termVals=TermReqFactory.getTermReq(1).getKeyValue();
    dhx.showProgress("请求数据中");
    MappingConfAction.queryMappingConfList(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

/**
  *字段映射配置管理
  *@param rid 用户ID
  *@param flag 1新增，0查看，-1修改
 **/
function showData(rid,flag){
    var title = "";
    var ruleId =  dataTable.getUserData(rid,"RULE_ID");
    var hbColName =  dataTable.getUserData(rid,"HB_COL_NAME")?dataTable.getUserData(rid,"HB_COL_NAME"):"";
    var impRule = dataTable.getUserData(rid,"IMP_RULE")?dataTable.getUserData(rid,"IMP_RULE"):"";
    var colType = dataTable.getUserData(rid,"COL_TYPE");
    var orgColName = dataTable.getUserData(rid,"ORG_COL_NAME")?dataTable.getUserData(rid,"ORG_COL_NAME"):"";
    var hbCfName = dataTable.getUserData(rid,"HB_CF_NAME")?dataTable.getUserData(rid,"HB_CF_NAME"):"";
    var colValPrefix = dataTable.getUserData(rid,"COL_VAL_PREFIX")?dataTable.getUserData(rid,"COL_VAL_PREFIX"):"";
    var colValSuffix = dataTable.getUserData(rid,"COL_VAL_SUFFIX")?dataTable.getUserData(rid,"COL_VAL_SUFFIX"):"";

    if(flag==1){
        title = "新增实时入库文件与hbase字段映射配置";
        var millTime = new Date().getTime();
        document.getElementById("ruleId").value = "";
        document.getElementById("hbColName").value = "";
        document.getElementById("impRule").value = "" ;
        document.getElementById("colType").value = 1;
        document.getElementById("orgColName").value = "";
        document.getElementById("hbCfName").value = "";
        document.getElementById("colValPrefix").value = "";
        document.getElementById("colValSuffix").value = "";
        $("hbColName").readOnly="";
        $("impRule").readOnly="";
        $("colType").disabled="";
        $("orgColName").readOnly="";
        $("hbCfName").readOnly="";
        $("colValPrefix").readOnly="";
        $("colValSuffix").readOnly="";
        document.getElementById("saveBtn").style.visibility = "visible";
        $("calBtn").value="取消";
    }
    if(flag==0){
        title = "查看实时入库文件与hbase字段映射配置";
        document.getElementById("ruleId").value = ruleId;
        document.getElementById("hbColName").value = hbColName;
        document.getElementById("impRule").value = impRule;
        document.getElementById("colType").value = colType;
        document.getElementById("orgColName").value = orgColName;
        document.getElementById("hbCfName").value = hbCfName;
        document.getElementById("colValPrefix").value = colValPrefix;
        document.getElementById("colValSuffix").value = colValSuffix;
        $("hbColName").readOnly="readOnly";
        $("impRule").readOnly="readOnly";
        $("colType").disabled="disabled";
        $("orgColName").readOnly="readOnly";
        $("hbCfName").readOnly="readOnly";
        $("colValPrefix").readOnly="readOnly";
        $("colValSuffix").readOnly="readOnly";
        document.getElementById("saveBtn").style.visibility = "hidden";
        $("calBtn").value="关闭";
    }
    if(flag==-1){
        title = "修改实时入库文件与hbase字段映射配置";
        document.getElementById("ruleId").value = ruleId;
        document.getElementById("hbColName").value = hbColName;
        document.getElementById("impRule").value = impRule;
        document.getElementById("colType").value = colType;
        document.getElementById("orgColName").value = orgColName;
        document.getElementById("hbCfName").value = hbCfName;
        document.getElementById("colValPrefix").value = colValPrefix;
        document.getElementById("colValSuffix").value = colValSuffix;
        $("hbColName").readOnly="";
        $("impRule").readOnly="";
        $("colType").disabled="";
        $("orgColName").readOnly="";
        $("hbCfName").readOnly="";
        $("colValPrefix").readOnly="";
        $("colValSuffix").readOnly="";
        document.getElementById("saveBtn").style.visibility = "visible";
        $("calBtn").value="取消";
    }
    if(!maintainWin){
        maintainWin = DHTMLXFactory.createWindow("1","maintainWin",0,0,450,320);
        maintainWin.stick();
        maintainWin.denyResize();
        maintainWin.denyPark();
        maintainWin.button("minmax1").hide();
        maintainWin.button("park").hide();
        maintainWin.button("stick").hide();
        maintainWin.button("sticked").hide();
        maintainWin.center();

        var dataFormDIV = document.getElementById("dataFormDIV");
        maintainWin.attachObject(dataFormDIV);
        var saveBtn = document.getElementById("saveBtn");
        var calBtn = document.getElementById("calBtn");
        attachObjEvent(saveBtn,"onclick",saveMappingConf);
        attachObjEvent(calBtn,"onclick",function(){maintainWin.close();});

        maintainWin.attachEvent("onClose",function(){
            maintainWin.setModal(false);
            this.hide();
            return false;
        });
        dhtmlxValidation.addValidation(dataFormDIV, [
            {target:"impRule",rule:"MaxLength[50]"},
            {target:"orgColName",rule:"MaxLength[4000]"},
            {target:"hbCfName",rule:"MaxLength[10]"},
            {target:"hbColName",rule:"MaxLength[50]"},
            {target:"colValPrefix",rule:"MaxLength[50]"},
            {target:"colValSuffix",rule:"MaxLength[50]"}
        ],"true");
    }
    dhtmlxValidation.validate("dataFormDIV");
    maintainWin.setText(title);
    maintainWin.setModal(true);
    maintainWin.show();
    maintainWin.center();
}

//保存方法
function saveMappingConf(){
	 if(!(dhtmlxValidation.validate("dataFormDIV")))return;
     var data = Tools.getFormValues("dataForm");
     dhx.showProgress("保存数据中");
     MappingConfAction.savedMappingConf(data,function(ret){
         dhx.closeProgress();
         maintainWin.close();
         if(ret=="success"){
             dhx.alert("保存成功!");
             dataTable.refreshData();
         }else if(ret=="failed"){
             dhx.alert("保存出错!");
         }
     });
}

//删除文件规则
function deleteData(rid){
	var id = dataTable.getUserData(rid,"RULE_ID");
	dhx.confirm("是否确认要删除该条数据吗？",function(r){
        if(r){
        	dhx.showProgress("请求数据中");
            MappingConfAction.deleteMappingConf(id,function(ret){
            dhx.closeProgress();
                if(ret.flag=="false"){
                    dhx.alert("删除失败！");
                }else if(ret.flag=="success"){
                	dhx.alert("删除成功！");
                    dataTable.refreshData();
                }else if(ret.flag=="error"){
                    dhx.alert("删除报错！");
                }
            });
        }
    });
}

dhx.ready(pageInit);