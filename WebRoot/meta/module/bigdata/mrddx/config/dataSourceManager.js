/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        BigDataSourceAction.js
 *Description：
 *
 *Dependent：
 *
 *Author:	王建友
 *        
 ********************************************************/
var dataTable = null;//表格

var querySourceTypeName = null;
var termReq = null;
var termVals = null;

var dataSourceWin = null;//管理窗体（增改查）
var dsReq = null;
var paramTable = null;

//初始界面
function pageInit() {
	
    termReq = TermReqFactory.createTermReq(1);
    var dataSourceName = termReq.createTermControl("dataSourceName","DATA_SOURCE_NAME");
    //var sourceCate = termReq.createTermControl("sourceCate","SOURCE_CATE");
    //sourceCate.setWidth(200);
    dataSourceName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });

    querySourceTypeName = termReq.createTermControl("querySourceTypeName","SOURCE_TYPE_ID_QUREY");	//源类型        
    querySourceTypeName.setAppendData([["","--请选择--"]]);
  	querySourceTypeName.setListRule(1,"SELECT SOURCE_TYPE_ID, SOURCE_NAME  FROM MR_SOURCE_TYPE WHERE SOURCE_CATE = 0","");   //设置条件数据来自SQL
	querySourceTypeName.enableReadonly(true);
	querySourceTypeName.setWidth(200);
    
    dataTableInit(); //初始数据表格  初始之后dataTable才会被实例化
    dataTable.setReFreshCall(queryData); //设置表格刷新的回调方法，即实际查询数据的方法
    
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    var newBtn   = document.getElementById("newBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    attachObjEvent(newBtn,"onclick",function(){
    	//弹出新增数据源界面
        showDataSourceWin();
    });

}

// 改变下拉框事件
function selectTpyeCate(){
    var typeModi      = document.getElementById("SOURCE_CATE");
    var sourceTypeId  = typeModi.options[typeModi.selectedIndex].value;
    querySourceTypeName.setListRule(1,"SELECT SOURCE_TYPE_ID, SOURCE_NAME  FROM MR_SOURCE_TYPE WHERE SOURCE_CATE = "+sourceTypeId,"");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTable.refreshData();
    });
}


//初始数据表格
function dataTableInit(){
    var dd = document.getElementById("dataDiv");
    var pageContent = document.getElementById("pageContent");
    var queryFormDIV = document.getElementById("queryFormDIV");
    queryFormDIV.style.width = pageContent.offsetWidth -50  + "px";
    dd.style.width = pageContent.offsetWidth  + "px";
    dd.style.height = pageContent.offsetHeight-queryFormDIV.offsetHeight - 3 + "px";
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
        DATA_SOURCE_ID:"数据源ID",
        DATA_SOURCE_NAME:"数据源名称",
        SOURCE_CATE_NAME:"数据类型",
        SOURCE_NAME:"源类型名称",
        opt:"操作"
    },"DATA_SOURCE_ID,DATA_SOURCE_NAME,SOURCE_CATE_NAME,SOURCE_NAME,SOURCE_TYPE_ID");
    dataTable.setRowIdForField("DATA_SOURCE_ID");
    dataTable.setPaging(true,17);//分页
    dataTable.setSorting(true,{
        DATA_SOURCE_ID:"desc"
    });
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("10,30,20,20,20");
    dataTable.setGridColumnCfg(0,{align:"center"});
    dataTable.setGridColumnCfg(1,{align:"left"});
    dataTable.setGridColumnCfg(2,{align:"left"});
    dataTable.setGridColumnCfg(3,{align:"left"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
        if(colId=="OPT"){
            var dataSourceId = dataTable.getUserData(rid,"DATA_SOURCE_ID");
            var dataSourceName = dataTable.getUserData(rid,"DATA_SOURCE_NAME");
            var sourceName = dataTable.getUserData(rid,"SOURCE_NAME");
            var sourceTypeId = dataTable.getUserData(rid,"SOURCE_TYPE_ID");
            
            var str = "";
            //操作
            str += "<a href='javascript:void(0)' onclick='openViewDataSource("+dataSourceId+",\""+dataSourceName+"\",\""+sourceName+"\");return false;'>查看</a>";
            str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick='openModifyDataSource("+rid+",\""+sourceName+"\");return false;'>修改</a>";
            str += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' onclick='delDataSource("+dataSourceId+",\""+dataSourceName+"\","+sourceTypeId+");return false;'>删除</a>";
            return str;
        }
        return data[cid];
    });

    return dataTable;
}



//查询数据
function queryData(dt,params){
    termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals["_COLUMN_SORT"] = params.sort;
    termVals["SOURCE_CATE"] = document.getElementById("SOURCE_CATE").value;
    dhx.showProgress("请求数据中");
    BigDataSourceAction.queryDataSource(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        for ( var i = 0; i < data.length; i++) {
        	var scid = data[i]["SOURCE_CATE"];
			if (0 == scid){
		        data[i]["SOURCE_CATE_NAME"] = "数据处理";
			}else if (1 == scid){
			    data[i]["SOURCE_CATE_NAME"] = "数据采集";
			}else if (2 == scid){
				data[i]["SOURCE_CATE_NAME"] = "系统运行";
			}
		}
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}


//删除job
function delDataSource(dataSourceId,dataSourceName,sourceTypeId){
	
    BigDataSourceAction.queryJobId(dataSourceId,function(rs){
        dhx.closeProgress();
        if(rs==0){
		    dhx.confirm("您确定要删除【"+dataSourceName+"】配置及相应的数据源参数表信息吗？", function (rs) {
		        if (rs) {
		            dhx.showProgress("正在执行删除操作...");
		            BigDataSourceAction.deleteDataSource(dataSourceId,sourceTypeId,function(rs){
		                dhx.closeProgress();
		                if(rs==1){
		                    dhx.alert("删除成功！");
		                    dataTable.refreshData();
		                }else if(rs==2){
		                    dhx.alert("已使用的数据源！");
		                }else{
		                	dhx.alert("删除失败！");
		                }
		            });
		        }
		    });
        }else{
	        	dhx.alert("该数据源【"+dataSourceName+"】已经有Job关联不能删除！");

        }
    });
}

function openModifyDataSource(rid){
    showDataSourceWin({dataSourceId:rid});
}

//根据下拉框的值判断值是否相等，如果相等则被选中
//function isSelectItemByValue(objSel, objItemValue) {
//	for (var i = 0; i < objSel.options.length; i++) {  
//        if (objSel.options[i].value == objItemValue) {        
//            objSel.options[i].selected = true;        
//            break;        
//        }   
//   }
//}

function openViewDataSource(dataSourceId,dataSourceName,sourceName){
    showDataSourceWin({dataSourceId:dataSourceId},1);
}

//弹出窗体
function showDataSourceWin(data,readOnly){
    if(!dataSourceWin){
        dataSourceWin = DHTMLXFactory.createWindow("dswin","dswin",0,0,720,405);
        dataSourceWin.stick();
        dataSourceWin.setModal(true);
        dataSourceWin.center();
        dataSourceWin.button("minmax1").hide();
        dataSourceWin.button("stick").hide();
        dataSourceWin.button("park").hide();
        dataSourceWin.button("sticked").hide();
        dataSourceWin.denyResize();
        dataSourceWin.denyPark();
        dataSourceWin.keepInViewport(true);
        dataSourceWin.attachObject($("magDSDIV"));
        dataSourceWin.hide();

        dataSourceWin.attachEvent("onClose", function () {
            dataSourceWin.hide();
            dataSourceWin.setModal(false);
            $("saveDataSourceName").style.display = "";
            $("saveDataSourceCate").style.display = "";
            $("saveDataSourceType").style.display = "";
            $("saveDataSourceName_V").style.display = "none";
            $("saveDataSourceCate_V").style.display = "none";
            $("saveDataSourceType_V").style.display = "none";
            $("saveBtn").style.display  = "none";
            return false;
        });

        attachObjEvent($("saveBtn"),"onclick",function(e){
            saveDsData();
        });

        attachObjEvent($("cloBtn"),"onclick",function(e){
            dataSourceWin.close();
        });

        initDsWin();
    }
    dataSourceWin.show();
    dataSourceWin.setModal(true);
    dataSourceWin.center();
    initParamTable();
    dataSourceWin.dsId = 0;
    if(data){
        if(readOnly){
            dataSourceWin._saveMode = 2;
            dataSourceWin.setText("查看数据源");
        }else{
            dataSourceWin._saveMode = 1;
            dataSourceWin.setText("修改数据源");
        }
        pareseDataToWin(data);
    }else{
        clearDsWin();
        dataSourceWin._saveMode = 0;//0新增，1修改，2查看
        dataSourceWin.setText("新增数据源");
    }
    dsReq.init(function(){
        disabledDsWin(dataSourceWin._saveMode==2);
    });
}

//初始数据源窗体win
function initDsWin(){
    dsReq = TermReqFactory.createTermReq(2);

    var dsCate = dsReq.createTermControl("saveDataSourceCate","SOURCE_CATE");	//源类型;
    dsCate.setAppendData([["-1","--请选择--"]]);
    dsCate.setListRule(0,[["0","数据处理"],["1","数据采集"],["2","数据运行"]],"-1");   //设置条件数据来自SQL
    dsCate.enableReadonly(true);
    dsCate.setWidth(200);
    dsCate.setValueChange(function(v){
        var val =  (v && v.length)? v[0] : v;
        paramTable.bindData([]);
        var sc = dsReq.getTermControl("SOURCE_CATE");
        if(val==sc.defaultValue[0]){
            var st = dsReq.getTermControl("SOURCE_TYPE_ID");
            var stv = st.defaultValue[0];
            if(stv=="" || stv == null || stv==undefined){
                return true;
            }
            BigDataSourceAction.queryParamBySourceTypeId({SOURCE_DB_TYPE:stv}, function(data) {
                if(data && data.length){
                    paramTable.bindData(data);
                }
            });
        }
        return true;
    });

    var dsType = dsReq.createTermControl("saveDataSourceType","SOURCE_TYPE_ID");	//源类型;
    dsType.setListRule(1,"SELECT SOURCE_DB_TYPE||':'||SOURCE_TYPE_ID, SOURCE_NAME  FROM MR_SOURCE_TYPE WHERE SOURCE_CATE ={SOURCE_CATE}");
    dsType.enableReadonly(true);
    dsType.setWidth(200);
    dsType.setParentTerm("SOURCE_CATE");
    dsType.setValueChange(function(v){
        var val =  (v && v.length)? v[0] : v;
        paramTable.bindData([]);
        if(val=="" || val == null || val==undefined){
            return true;
        }
        BigDataSourceAction.queryParamBySourceTypeId({SOURCE_DB_TYPE:val}, function(data) {
            if(data && data.length){
                paramTable.bindData(data);
            }
        });
        return true;
    });

    dsReq.render();

    var validationV = [
        {target:"saveDataSourceName",rule:"NotEmpty,MaxLength[100]"}
    ];
    dhtmlxValidation.addValidation($("magDSDIV"),validationV);
}

function initParamTable(){
    if(!paramTable){
        paramTable = new meta.ui.DataTable("paramsDIV");
        paramTable.setColumns({
            PARAM_NAME:"参数名称",
            PARAM_VALUE:"参数值",
            PARAM_DESC:"参数描述"
        },"PARAM_NAME,PARAM_VALUE,PARAM_DESC");
        paramTable.setPaging(0);
        paramTable.render();
        paramTable.grid.setInitWidthsP("45,25,30");
        paramTable.setGridColumnCfg(2,{align:"left",tip:true});
        paramTable.setFormatCellCall(function(rid,cid,data,colId){
            //传递行数多少行
            var rlyMode = dataSourceWin._saveMode;
            if(colId=="PARAM_VALUE"){
                var paramValue = paramTable.getUserData(rid,"PARAM_VALUE");
                if(paramValue == null){
                    paramValue ='';
                }
                if(rlyMode!=2){
                    return '<input value="'+paramValue+'" style="width:98%;"  id="paramValue'+rid+'" title="'+rid+'" ></input>';
                }
                return paramValue;
            }
            return data[cid];
        });
    }
    paramTable.bindData([]);
}

//加载数据到窗体
function pareseDataToWin(d){
    var dsId = d.dataSourceId;
    dataSourceWin.dsId = dsId;
    BigDataSourceAction.queryParamByDataSourceId({DATA_SOURCE_ID:dsId},function(data){
        paramTable.bindData(data);
    });
    //初始化数据源名称
    $("saveDataSourceName").value = dataTable.getUserData(dsId,"DATA_SOURCE_NAME");
    //初始化源类型名称
    var sc = dsReq.getTermControl("SOURCE_CATE");
    var st = dsReq.getTermControl("SOURCE_TYPE_ID");
    var scValue = dataTable.getUserData(dsId,"SOURCE_CATE");
    var stValue = dataTable.getUserData(dsId,"SOURCE_DB_TYPE")+":"+dataTable.getUserData(dsId,"SOURCE_TYPE_ID");
    sc.defaultValue = [scValue];
    st.defaultValue = [stValue];
}

//清除窗体数据
function clearDsWin(){
    $("saveDataSourceName").value = "";
    var sc = dsReq.getTermControl("SOURCE_CATE");
    var st = dsReq.getTermControl("SOURCE_TYPE_ID");
    sc.defaultValue = [-1];
    st.defaultValue = [];
}

//将窗体设为只读
function disabledDsWin(flag){
    $("saveDataSourceName_V").innerHTML = $("saveDataSourceName").value;
    var sc = dsReq.getTermControl("SOURCE_CATE");
    var st = dsReq.getTermControl("SOURCE_TYPE_ID");
    $("saveDataSourceCate_V").innerHTML = sc.combo[sc.bindObjs[0].id].getComboText();
    $("saveDataSourceType_V").innerHTML = st.combo[st.bindObjs[0].id].getComboText();
    if(flag){
        $("saveDataSourceName").style.display = "none";
        $("saveDataSourceCate").style.display = "none";
        $("saveDataSourceType").style.display = "none";
        $("saveBtn").style.display = "none";
        $("saveDataSourceName_V").style.display = "";
        $("saveDataSourceCate_V").style.display = "";
        $("saveDataSourceType_V").style.display = "";
    }else{
        $("saveDataSourceName").style.display = "";
        $("saveDataSourceCate").style.display = "";
        $("saveDataSourceType").style.display = "";
        $("saveBtn").style.display = "";
        $("saveDataSourceName_V").style.display = "none";
        $("saveDataSourceCate_V").style.display = "none";
        $("saveDataSourceType_V").style.display = "none";
    }
}

//保存数据源信息
function saveDsData(){
    //验证信息
    if(!(dhtmlxValidation.validate("magDSDIV")))return;
    var sc = dsReq.getTermControl("SOURCE_CATE");
    var st = dsReq.getTermControl("SOURCE_TYPE_ID");
    var scValue = sc.getKeyValue();
    var stValue = st.getKeyValue();
    if(stValue==""||stValue==null ||stValue==undefined){
        alert("请选择源类型!");
        return;
    }

    //获取表格数据的值
    var dataInfos = [];
    var rowIds = paramTable.grid.getAllRowIds().split(",");
    for(var i=0; i<rowIds.length;i++){
        if(rowIds[i]=="")continue;
        var tempData = {};//注意这里只能在里面申请
        tempData.PARAM_NAME =  paramTable.getUserData(rowIds[i],"PARAM_NAME");
        tempData.PARAM_VALUE = document.getElementById("paramValue"+rowIds[i]).value;
        tempData.PARAM_DESC =  paramTable.getUserData(rowIds[i],"PARAM_DESC");
        dataInfos.push(tempData);
    }

    var allData = {};
    allData.sourceTypeId = stValue;
    allData.sourceCate = scValue;
    if(dataSourceWin._saveMode==1){
        allData.dataSourceId = dataSourceWin.dsId;
    }
    allData.dataSourceName = document.getElementById("saveDataSourceName").value.trim();
    allData.dataInfos = dataInfos;
    BigDataSourceAction.saveDataSource(allData, function(ret){
        dhx.closeProgress();
        if(ret.flag==1){
            dhx.alert("保存成功！");
            dataTable.refreshData();
            dataSourceWin.close();
        }else{
            dhx.alert("保存失败！"+ret.msg);
        }
    });
}

dhx.ready(pageInit);
