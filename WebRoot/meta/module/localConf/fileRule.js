/******************************************************
 *Copyrights @ 2014，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        fileRule.js
 *Description：
 *        实时入库文件格式配置
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
    dataTable.grid.setInitWidthsP("8,8,10,12,12,12,10,10,8,10");
    dataTable.setGridColumnCfg(0,{align:"left"});
    dataTable.setGridColumnCfg(1,{align:"left"});
    dataTable.setGridColumnCfg(2,{align:"right"});
    dataTable.setGridColumnCfg(3,{align:"left"});
    dataTable.setGridColumnCfg(4,{align:"left"});
    dataTable.setGridColumnCfg(5,{align:"left"});
    dataTable.setGridColumnCfg(6,{align:"left"});
    dataTable.setGridColumnCfg(7,{align:"right"});
    dataTable.setGridColumnCfg(8,{align:"center"});
    dataTable.setGridColumnCfg(9,{align:"center"});
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
        IMP_RULE : "入库规则",
        FLUSH_BUFFER: "客户端提交缓存(M)",
        FILE_LINE_FIELDS: "源文件行列名序列",
        ROW_KEY_FIELDS : "ROWKEY字段组成",
        ROW_KEY_SUFFIX:"ROWKEY后缀",
        AREA_EXPR:"地域表达式",
        SKIP_ROWS:"忽略首部行数",
        WRITE_AHEAD_LOG:"是否写WAL日志",
        OPP: "操作"

    },"HBASE_TABLE_NAME,IMP_RUL,FLUSH_BUFFER,"+
    "FILE_LINE_FIELDS,ROW_KEY_FIELDS,ROW_KEY_SUFFIX,AREA_EXPR,SKIP_ROWS,WRITE_AHEAD_LOG,RULE_ID");

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
        	return data[cid] != "-1"?data[cid]:"";
        }else if(colId == "SKIP_ROWS"){
        	return data[cid] != "-1"?data[cid]:"";
        }
        return data[cid];
    });
}


//查询数据
function queryData(dt,params){
    var termVals=TermReqFactory.getTermReq(1).getKeyValue();
    dhx.showProgress("请求数据中");
    FileRuleAction.queryFileRuleList(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
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
    var ruleId =  dataTable.getUserData(rid,"RULE_ID")?dataTable.getUserData(rid,"RULE_ID"):"";
    var hbaseName =  dataTable.getUserData(rid,"HBASE_TABLE_NAME")?dataTable.getUserData(rid,"HBASE_TABLE_NAME"):"";
    var impRule = dataTable.getUserData(rid,"IMP_RUL")?dataTable.getUserData(rid,"IMP_RUL"):"";
    var writeLog = dataTable.getUserData(rid,"WRITE_AHEAD_LOG");
    var flushBuffer = dataTable.getUserData(rid,"FLUSH_BUFFER")!=-1?dataTable.getUserData(rid,"FLUSH_BUFFER"):"";
    var fileLineFields = dataTable.getUserData(rid,"FILE_LINE_FIELDS")?dataTable.getUserData(rid,"FILE_LINE_FIELDS"):"";
    var rowKeyFields = dataTable.getUserData(rid,"ROW_KEY_FIELDS")?dataTable.getUserData(rid,"ROW_KEY_FIELDS"):"";
    var rowKeySuffix = dataTable.getUserData(rid,"ROW_KEY_SUFFIX")?dataTable.getUserData(rid,"ROW_KEY_SUFFIX"):"";
    var areaExpr = dataTable.getUserData(rid,"AREA_EXPR")?dataTable.getUserData(rid,"AREA_EXPR"):"";
    var remark = dataTable.getUserData(rid,"REMARK")?dataTable.getUserData(rid,"REMARK"):"";
    var skipRows = dataTable.getUserData(rid,"SKIP_ROWS")!=-1?dataTable.getUserData(rid,"SKIP_ROWS"):"";

    if(flag==1){
        title = "新增实时入库文件格式配置";
        var millTime = new Date().getTime();
        document.getElementById("ruleId").value = "";
        document.getElementById("hbaseName").value = "";
        document.getElementById("impRule").value = "" ;
        document.getElementById("writeLog").value = 0;
        document.getElementById("flushBuffer").value = "";
        document.getElementById("fileLineFields").value = "";
        document.getElementById("rowKeyFields").value = "";
        document.getElementById("rowKeySuffix").value = "";
        document.getElementById("areaExpr").value = "";
        document.getElementById("remark").value = "";
        document.getElementById("skipRows").value = "";
        $("hbaseName").readOnly="";
        $("impRule").readOnly="";
        $("writeLog").disabled="";
        $("flushBuffer").readOnly="";
        $("fileLineFields").readOnly="";
        $("rowKeyFields").readOnly="";
        $("rowKeySuffix").readOnly="";
        $("areaExpr").readOnly="";
        $("remark").readOnly="";
        $("skipRows").readOnly="";
//        document.getElementById("viewHB").style.display = "none";
//        document.getElementById("addHB").style.display = "block";
        document.getElementById("saveBtn").style.visibility = "visible";
        $("calBtn").value="取消";
    }
    if(flag==0){
        title = "查看实时入库文件格式配置";
        document.getElementById("ruleId").value = ruleId;
        document.getElementById("hbaseName").value = hbaseName;
        document.getElementById("impRule").value =  impRule;
        document.getElementById("writeLog").value = writeLog;
        document.getElementById("flushBuffer").value = flushBuffer;
        document.getElementById("fileLineFields").value = fileLineFields;
        document.getElementById("rowKeyFields").value = rowKeyFields;
        document.getElementById("rowKeySuffix").value = rowKeySuffix;
        document.getElementById("areaExpr").value = areaExpr;
        document.getElementById("remark").value = remark;
        document.getElementById("skipRows").value = skipRows;
        $("hbaseName").readOnly="readOnly";
        $("impRule").readOnly="readOnly";
        $("writeLog").disabled="disabled";
        $("flushBuffer").readOnly="readOnly";
        $("fileLineFields").readOnly="readOnly";
        $("rowKeyFields").readOnly="readOnly";
        $("rowKeySuffix").readOnly="readOnly";
        $("areaExpr").readOnly="readOnly";
        $("remark").readOnly="readOnly";
        $("skipRows").readOnly="readOnly";
//        document.getElementById("viewHB").style.display = "block";
//        document.getElementById("addHB").style.display = "none";
        document.getElementById("saveBtn").style.visibility = "hidden";
        $("calBtn").value="关闭";
    }
    if(flag==-1){
        title = "修改实时入库文件格式配置";
        document.getElementById("ruleId").value = ruleId;
        document.getElementById("hbaseName").value = hbaseName;
        document.getElementById("impRule").value =  impRule;
        document.getElementById("writeLog").value = writeLog;
        document.getElementById("flushBuffer").value = flushBuffer;
        document.getElementById("fileLineFields").value = fileLineFields;
        document.getElementById("rowKeyFields").value = rowKeyFields;
        document.getElementById("rowKeySuffix").value = rowKeySuffix;
        document.getElementById("areaExpr").value = areaExpr;
        document.getElementById("remark").value = remark;
        document.getElementById("skipRows").value = skipRows;
        $("hbaseName").readOnly="";
        $("impRule").readOnly="";
        $("writeLog").disabled="";
        $("flushBuffer").readOnly="";
        $("fileLineFields").readOnly="";
        $("rowKeyFields").readOnly="";
        $("rowKeySuffix").readOnly="";
        $("areaExpr").readOnly="";
        $("remark").readOnly="";
        $("skipRows").readOnly="";
        document.getElementById("saveBtn").style.visibility = "visible";
        $("calBtn").value="取消";
    }
    if(!maintainWin){
        maintainWin = DHTMLXFactory.createWindow("1","maintainWin",0,0,450,400);
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
        attachObjEvent(saveBtn,"onclick",saveFileRule);
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
            {target:"fileLineFields",rule:"MaxLength[4000]"},
            {target:"rowKeyFields",rule:"MaxLength[100]"},
            {target:"rowKeySuffix",rule:"MaxLength[10]"},
            {target:"remark",rule:"MaxLength[100]"},
            {target:"skipRows",rule:"MaxLength[3],PositiveInt"},
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
function saveFileRule(){
	 if(!(dhtmlxValidation.validate("dataFormDIV")))return;
     var data = Tools.getFormValues("dataForm");
     dhx.showProgress("保存数据中");
     FileRuleAction.savedFileRule(data,function(ret){
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
            FileRuleAction.deleteFileRule(id,function(ret){
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