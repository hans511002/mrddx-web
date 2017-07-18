/******************************************************
 *Copyrights @ 2014，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        FileImp.js
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
    var dataName = termReq.createTermControl("file_typeQ","FILE_TYPE");
    dataName.setWidth(120);
    dataName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    dataInit();
    dataTable.setPaging(true, 20);//分页
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("20,20,20,40");
    dataTable.setGridColumnCfg(0,{align:"right"});
    dataTable.setGridColumnCfg(1,{align:"left"});
    dataTable.setGridColumnCfg(2,{align:"left"});
    dataTable.setGridColumnCfg(3,{align:"center"});
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
        FILETYPE_IMP_REL_ID : "映射关系ID",
        FILE_TYPE: "文件类型",
        IMP_RULE : "入库规则",
        OPP: "操作"

    },"FILETYPE_IMP_REL_ID,FILE_TYPE,IMP_RULE");

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
        }
        return data[cid];
    });
}


//查询数据
function queryData(dt,params){
    var termVals=TermReqFactory.getTermReq(1).getKeyValue();
    dhx.showProgress("请求数据中");
    FileImpAction.queryFileImpList(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
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
    var filetypeImpRelId =  dataTable.getUserData(rid,"FILETYPE_IMP_REL_ID");
    var fileType =  dataTable.getUserData(rid,"FILE_TYPE")?dataTable.getUserData(rid,"FILE_TYPE"):"";
    var impRule = dataTable.getUserData(rid,"IMP_RULE")?dataTable.getUserData(rid,"IMP_RULE"):"";
    if(flag==1){
        title = "新增入库文件与hbase表之间的映射关系配置";
        document.getElementById("filetypeImpRelId").value = "";
        document.getElementById("fileType").value = "";
        document.getElementById("impRule").value = "" ;
        $("fileType").readOnly="";
        $("impRule").readOnly="";
        document.getElementById("saveBtn").style.visibility = "visible";
        $("calBtn").value="取消";
    }
    if(flag==0){
        title = "查看入库文件与hbase表之间的映射关系配置";
        document.getElementById("filetypeImpRelId").value = filetypeImpRelId;
        document.getElementById("fileType").value = fileType;
        document.getElementById("impRule").value =  impRule;
        $("fileType").readOnly="readOnly";
        $("impRule").readOnly="readOnly";
        document.getElementById("saveBtn").style.visibility = "hidden";
        $("calBtn").value="关闭";
    }
    if(flag==-1){
        title = "修改入库文件与hbase表之间的映射关系配置";
        document.getElementById("filetypeImpRelId").value = filetypeImpRelId;
        document.getElementById("fileType").value = fileType;
        document.getElementById("impRule").value =  impRule;
        $("fileType").readOnly="";
        $("impRule").readOnly="";
        document.getElementById("saveBtn").style.visibility = "visible";
        $("calBtn").value="取消";
    }
    if(!maintainWin){
        maintainWin = DHTMLXFactory.createWindow("1","maintainWin",0,0,400,150);
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
        attachObjEvent(saveBtn,"onclick",saveFileImp);
        attachObjEvent(calBtn,"onclick",function(){maintainWin.close();});

        maintainWin.attachEvent("onClose",function(){
            maintainWin.setModal(false);
            this.hide();
            return false;
        });
        dhtmlxValidation.addValidation(dataFormDIV, [
            {target:"impRule",rule:"MaxLength[30]"},
            {target:"fileType",rule:"MaxLength[30]"}
        ],"true");
    }
    dhtmlxValidation.validate("dataFormDIV");
    maintainWin.setText(title);
    maintainWin.setModal(true);
    maintainWin.show();
    maintainWin.center();
}

//保存方法
function saveFileImp(){
	 if(!(dhtmlxValidation.validate("dataFormDIV")))return;
     var data = Tools.getFormValues("dataForm");
     dhx.showProgress("保存数据中");
     FileImpAction.savedFileImp(data,function(ret){
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
	var id = dataTable.getUserData(rid,"FILETYPE_IMP_REL_ID");
	dhx.confirm("是否确认要删除该条数据？",function(r){
        if(r){
        	dhx.showProgress("请求数据中");
            FileImpAction.deleteFileImp(id,function(ret){
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