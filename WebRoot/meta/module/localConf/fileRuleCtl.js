/******************************************************
 *Copyrights @ 2014，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        FileRuleCtlCtl.js
 *Description：
 *        实时入库(动态)文件与hbase字段映射配置
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
    var dataName = termReq.createTermControl("hbase_name","HBASE_NAME");
    dataName.setWidth(120);
    dataName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    dataInit();
    dataTable.setPaging(true, 20);//分页
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("8,8,8,8,8,8,8,8,8,8,8,12");
    dataTable.setGridColumnCfg(0,{align:"left"});
    dataTable.setGridColumnCfg(1,{align:"left"});
    dataTable.setGridColumnCfg(2,{align:"left"});
    dataTable.setGridColumnCfg(3,{align:"left"});
    dataTable.setGridColumnCfg(4,{align:"right"});
    dataTable.setGridColumnCfg(5,{align:"left"});
    dataTable.setGridColumnCfg(6,{align:"left"});
    dataTable.setGridColumnCfg(7,{align:"left"});
    dataTable.setGridColumnCfg(8,{align:"left"});
    dataTable.setGridColumnCfg(9,{align:"right"});
    dataTable.setGridColumnCfg(10,{align:"center"});
    dataTable.setGridColumnCfg(11,{align:"center"});
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
        HBASE_TABLE_NAME : "HBASE表名",
        HBASE_CF_NAME : "HBASE列族名",
        HBASE_COL_NAME : "HBASE字段名",
        IMP_RULE : "入库规则",
        FLUSH_BUFFER: "客户端提交缓存(M)",
        DEST_HBASE_COLUMN: "目标模型列名序列",
        ROW_KEY_FIELDS : "ROWKEY字段组成",
        HBASE_COLUMN_SUFFIX:"列值后缀",
        AREA_EXPR:"地域表达式",
        SKIP_ROWS:"忽略首部行数",
        WRITE_AHEAD_LOG:"是否写WAL日志",
        OPP: "操作"

    },"HBASE_TABLE_NAME,HBASE_CF_NAME,HBASE_COL_NAME,IMP_RULE,FLUSH_BUFFER,"+
    "DEST_HBASE_COLUMN,ROW_KEY_FIELDS,HBASE_COLUMN_SUFFIX,AREA_EXPR,SKIP_ROWS,WRITE_AHEAD_LOG,RULE_ID");

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
        }else if(colId == "WRITE_AHEAD_LOG"){
            return data[cid] =="0"?"否":"是" ;
        }else if(colId == "FLUSH_BUFFER"){
        	return data[cid] == "-1"?"":data[cid];
        }else if(colId == "SKIP_ROWS"){
        	return data[cid] == "-1"?"":data[cid];
        }
        return data[cid];
    });
}


//查询数据
function queryData(dt,params){
    var termVals=TermReqFactory.getTermReq(1).getKeyValue();
    dhx.showProgress("请求数据中");
    FileRuleCtlAction.queryFileRuleCtlList(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

/**
  *操作数据源管理
  *@param rid 用户ID
  *@param flag 1新增，0查看，-1修改
 **/
function showData(rid,flag){
    var title = "";
    var ruleId = dataTable.getUserData(rid,"RULE_ID");
    var hbaseName =  dataTable.getUserData(rid,"HBASE_TABLE_NAME")?dataTable.getUserData(rid,"HBASE_TABLE_NAME"):"";
    var impRule = dataTable.getUserData(rid,"IMP_RULE")?dataTable.getUserData(rid,"IMP_RULE"):"";
    var writeLog = dataTable.getUserData(rid,"WRITE_AHEAD_LOG");
    var flushBuffer = dataTable.getUserData(rid,"FLUSH_BUFFER")!="-1"?dataTable.getUserData(rid,"FLUSH_BUFFER"):"";
    var destHbaseColumn = dataTable.getUserData(rid,"DEST_HBASE_COLUMN")?dataTable.getUserData(rid,"DEST_HBASE_COLUMN"):"";
    var rowKeyFields = dataTable.getUserData(rid,"ROW_KEY_FIELDS")?dataTable.getUserData(rid,"ROW_KEY_FIELDS"):"";
    var hbaseColumnSuffix = dataTable.getUserData(rid,"HBASE_COLUMN_SUFFIX")?dataTable.getUserData(rid,"HBASE_COLUMN_SUFFIX"):"";
    var areaExpr = dataTable.getUserData(rid,"AREA_EXPR")?dataTable.getUserData(rid,"AREA_EXPR"):"";
    var remark = dataTable.getUserData(rid,"REMARK")?dataTable.getUserData(rid,"REMARK"):"";
    var skipRows = dataTable.getUserData(rid,"SKIP_ROWS")!=-1?dataTable.getUserData(rid,"SKIP_ROWS"):"";
    var hbColName =  dataTable.getUserData(rid,"HBASE_COL_NAME")?dataTable.getUserData(rid,"HBASE_COL_NAME"):"";
    var hbCfName = dataTable.getUserData(rid,"HBASE_CF_NAME")?dataTable.getUserData(rid,"HBASE_CF_NAME"):"";

    if(flag==1){
        title = "新增实时入库(动态)文件与hbase字段映射配置";
        document.getElementById("ruleId").value = "";
        document.getElementById("hbaseName").value = "";
        document.getElementById("impRule").value = "" ;
        document.getElementById("writeLog").value = 0;
        document.getElementById("flushBuffer").value = "";
        document.getElementById("destHbaseColumn").value = "";
        document.getElementById("rowKeyFields").value = "";
        document.getElementById("hbaseColumnSuffix").value = "";
        document.getElementById("areaExpr").value = "";
        document.getElementById("remark").value = "";
        document.getElementById("skipRows").value = 8;
        document.getElementById("hbCfName").value = "";
        document.getElementById("hbColName").value = "";
        $("hbaseName").readOnly="";
        $("impRule").readOnly="";
        $("writeLog").disabled="";
        $("flushBuffer").readOnly="";
        $("destHbaseColumn").readOnly="";
        $("rowKeyFields").readOnly="";
        $("hbaseColumnSuffix").readOnly="";
        $("areaExpr").readOnly="";
        $("remark").readOnly="";
        $("skipRows").readOnly="";
        $("hbColName").readOnly="";
        $("hbCfName").readOnly="";
        document.getElementById("saveBtn").style.visibility = "visible";
        $("calBtn").value="取消";
    }
    if(flag==0){
        title = "查看实时入库(动态)文件与hbase字段映射配置";
        document.getElementById("ruleId").value = ruleId;
        document.getElementById("hbaseName").value = hbaseName;
        document.getElementById("impRule").value =  impRule;
        document.getElementById("writeLog").value = writeLog;
        document.getElementById("flushBuffer").value = flushBuffer;
        document.getElementById("destHbaseColumn").value = destHbaseColumn;
        document.getElementById("rowKeyFields").value = rowKeyFields;
        document.getElementById("hbaseColumnSuffix").value = hbaseColumnSuffix;
        document.getElementById("areaExpr").value = areaExpr;
        document.getElementById("remark").value = remark;
        document.getElementById("skipRows").value = skipRows;
        document.getElementById("hbColName").value = hbColName;
        document.getElementById("hbCfName").value = hbCfName;
        $("hbaseName").readOnly="readOnly";
        $("impRule").readOnly="readOnly";
        $("writeLog").disabled="disabled";
        $("flushBuffer").readOnly="readOnly";
        $("destHbaseColumn").readOnly="readOnly";
        $("rowKeyFields").readOnly="readOnly";
        $("hbaseColumnSuffix").readOnly="readOnly";
        $("areaExpr").readOnly="readOnly";
        $("remark").readOnly="readOnly";
        $("skipRows").readOnly="readOnly";
        $("hbColName").readOnly="readOnly";
        $("hbCfName").readOnly="readOnly";
        document.getElementById("saveBtn").style.visibility = "hidden";
        $("calBtn").value="关闭";
    }
    if(flag==-1){
        title = "修改实时入库(动态)文件与hbase字段映射配置";
        document.getElementById("ruleId").value = ruleId;
        document.getElementById("hbaseName").value = hbaseName;
        document.getElementById("impRule").value =  impRule;
        document.getElementById("writeLog").value = writeLog;
        document.getElementById("flushBuffer").value = flushBuffer;
        document.getElementById("destHbaseColumn").value = destHbaseColumn;
        document.getElementById("rowKeyFields").value = rowKeyFields;
        document.getElementById("hbaseColumnSuffix").value = hbaseColumnSuffix;
        document.getElementById("areaExpr").value = areaExpr;
        document.getElementById("remark").value = remark;
        document.getElementById("skipRows").value = skipRows;
        document.getElementById("hbColName").value = hbColName;
        document.getElementById("hbCfName").value = hbCfName;
        $("hbaseName").readOnly="";
        $("impRule").readOnly="";
        $("writeLog").disabled="";
        $("flushBuffer").readOnly="";
        $("destHbaseColumn").readOnly="";
        $("rowKeyFields").readOnly="";
        $("hbaseColumnSuffix").readOnly="";
        $("areaExpr").readOnly="";
        $("remark").readOnly="";
        $("skipRows").readOnly="";
        $("hbColName").readOnly="";
        $("hbCfName").readOnly="";
        document.getElementById("saveBtn").style.visibility = "visible";
        $("calBtn").value="取消";
    }
    if(!maintainWin){
        maintainWin = DHTMLXFactory.createWindow("1","maintainWin",0,0,500,460);
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
        attachObjEvent(saveBtn,"onclick",saveFileRuleCtl);
        attachObjEvent(calBtn,"onclick",function(){maintainWin.close();});

        maintainWin.attachEvent("onClose",function(){
            maintainWin.setModal(false);
            this.hide();
            return false;
        });
        dhtmlxValidation.addValidation(dataFormDIV, [
            {target:"impRule",rule:"MaxLength[50]"},
            {target:"flushBuffer",rule:"MaxLength[20],PositiveInt"},
            {target:"hbaseName",rule:"MaxLength[50]"},
            {target:"destHbaseColumn",rule:"MaxLength[4000]"},
            {target:"rowKeyFields",rule:"MaxLength[100]"},
            {target:"hbaseColumnSuffix",rule:"MaxLength[50]"},
            {target:"remark",rule:"MaxLength[100]"},
            {target:"skipRows",rule:"MaxLength[3],PositiveInt"},
            {target:"hbCfName",rule:"MaxLength[10]"},
            {target:"hbColName",rule:"MaxLength[50]"},
            {target:"areaExpr",rule:"MaxLength[50]"}
        ],"true");
    }
    dhtmlxValidation.validate("dataFormDIV");
    maintainWin.setText(title);
    maintainWin.setModal(true);
    maintainWin.show();
    maintainWin.center();
}

//保存方法
function saveFileRuleCtl(){
	 if(!(dhtmlxValidation.validate("dataFormDIV")))return;
     var data = Tools.getFormValues("dataForm");
     data.ruleId = document.getElementById("ruleId").value;
     dhx.showProgress("保存数据中");
     FileRuleCtlAction.savedFileRuleCtl(data,function(ret){
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
            FileRuleCtlAction.deleteFileRuleCtl(id,function(ret){
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