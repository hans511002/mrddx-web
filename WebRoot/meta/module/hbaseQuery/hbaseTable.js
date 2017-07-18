/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        dataLog.js
 *Description：
 *        hbaseTABLE表管理
 *Dependent：
 *
 *Author: 王鹏坤
 *
 ********************************************************/
var dataTable = null;   //用户权限信息
var maintainWin = null; //弹出界面
var clusterWindow = null;//弹出查看界面
var tableManagerWindow = null;//弹出新增表
var regtableManagerWindow = null;//弹出新增表
var tableInfo = null; //规则列表
var paramTable = null;
var paramClusterTable = null;
var paramClustersTable = null;
var paramTableManagerInfoTable = null;//新建表时第一个table
var paramTableManagerInfoTable1 = null;//新建表时第二个table
var regparamTableManagerInfoTable = null;//新建表时第一个table
var regparamTableManagerInfoTable1 = null;//新建表时第二个table
var rowIndex = 0;
var moveParamObj = null;
var paramArr = [];//存放当前的分类信息的数组
var paramClusterArr = [];// 存放列修改时的各行数据
var paramTable1Arr = [];//存放新建表时的第二个table数据
var paramTable2Arr = [];//   存放新建表时的第一个table数据
var saveClusterTabledata = {};//保存列修改时的数据
var saveTableManagerdata = {};//保存新建表时的数据
var saveTabledata = {};
var paramDatas = [];
var paramClusterDatas = [];
var clusterInfoWindow = null;
var paraCluster = [];
var tableColumnSelect = [];
var globle_dataSourceId = null;
var globle_dataSourceName = null;

/**
 * 页面初始化
 */
function pageInit(){
    var termReq = TermReqFactory.createTermReq(1);
    paramTable = $("paraTable");
    paramClusterTable  = $("paraClusterTable");
    paramClustersTable =$("paraClusterInfoTable");
    paramTableManagerInfoTable = $("paraTableManagerInfoTable");
    paramTableManagerInfoTable1 =  $("paraTableManagerInfoTable1");
    regparamTableManagerInfoTable = $("regparaTableManagerInfoTable");
    regparamTableManagerInfoTable1 =  $("regparaTableManagerInfoTable1");
    var dataId = termReq.createTermControl("tableName","TABLE_NAME");
    dataId.setWidth(240);
    dataId.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });

    dataTableInit();
    dataTable.setPaging(true, 20);//分页
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("15,20,10,20,35");
    dataTable.setGridColumnCfg(0,{align:"center"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    dataTable.setReFreshCall(queryData);
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    var newBtn = document.getElementById("newBtn");
    var regBtn = document.getElementById("regBtn");
     
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    attachObjEvent(newBtn,"onclick",function(){
//            addTableColumn();
        openMenu("新增Hbase表","/meta/module/hbaseQuery/saveHbTable.jsp","top","newhbasetbl");
    });
    attachObjEvent(regBtn,"onclick",function(){
//            regaddTableColumn();
        openMenu("注册Hbase表","/meta/module/hbaseQuery/saveHbTable.jsp?tblMode=2","top","reghbasetbl");
    });
    
    //选择数据源
    var source = document.getElementById("dataSourceName");
    source.onclick = function(){openDataSourceTableWin(this,'dataSourceName','dataSourceId'); };
    //选择数据源
    var regsource = document.getElementById("regdataSourceName");
    regsource.onclick = function(){regopenDataSourceTableWin(this,'regdataSourceName','regdataSourceId'); };
    var managerTableName = document.getElementById("managerTableName");
   // attachObjEvent(managerTableName,"onblur",function(){
   //     checkColumn(managerTableName);
   // });
    
}

//初始数据表格
function dataTableInit(){
    dataTable = new meta.ui.DataTable("container");
    dataTable.setColumns({
        HB_TABLE_NAME: "表名",
        DATA_SOURCE_NAME: "数据源名称",
        STATE: "状态",
        HB_TABLE_MSG:"表描述",
        OPP: "操作"

    },"HB_TABLE_NAME,DATA_SOURCE_NAME,STATE,HB_TABLE_MSG,HB_TABLE_ID,OPP");

    dataTable.setFormatCellCall(function(rid, cid, data, colId){
        var state = dataTable.getUserData(rid,"STATE");
        if(colId == "OPP"){
        var str = "";
             str = "<a href='javascript:void(0)' onclick='showCluster(\""+rid+"\");return false;'>查看</a>&nbsp;&nbsp;&nbsp;&nbsp;"
            str += "<a href='javascript:void(0)' onclick='downloadCluster(\""+rid+"\",\""+dataTable.getUserData(rid,"HB_TABLE_NAME")+"\");return false;'>导出表</a>&nbsp;&nbsp;&nbsp;&nbsp;";
                if(state==0){
                	str += "<a href='javascript:void(0)' onclick='downloadTable(\""+rid+"\",\""+dataTable.getUserData(rid,"HB_TABLE_NAME")+"\");return false;'>建表语句</a>&nbsp;&nbsp;&nbsp;&nbsp;";
                    str += "<a href='javascript:void(0)' onclick='editData(\""+dataTable.getUserData(rid,"HB_TABLE_ID")+"\",\""+dataTable.getUserData(rid,"HB_TABLE_NAME")+"\");return false;'>编辑数据</a>&nbsp;&nbsp;&nbsp;&nbsp;"
//                str += "<a href='javascript:void(0)' onclick='modifyClusterInfo(\""+rid+"\");return false;'>修改列</a>&nbsp;&nbsp;&nbsp;&nbsp;";
//                str += "<a href='javascript:void(0)' onclick='modifyCluster(\""+rid+"\");return false;'>修改分类信息</a>&nbsp;&nbsp;&nbsp;&nbsp;";
                    str += "<a href='javascript:void(0)' onclick='modifyField(\""+rid+"\");return false;'>修改</a>&nbsp;&nbsp;&nbsp;&nbsp;";
                    str += "<a href='javascript:void(0)' onclick='changeTableState(\""+rid+"\",1);return false;'>设为无效</a>&nbsp;&nbsp;&nbsp;&nbsp;";
                }else{
                    str += "<a href='javascript:void(0)' onclick='changeTableState(\""+rid+"\",0);return false;'>设为有效</a>&nbsp;&nbsp;&nbsp;&nbsp;";
                }
                str+= "<a href='javascript:void(0)' onclick='deleteCluster(\""+rid+"\");return false;'>删除</a>&nbsp;&nbsp;&nbsp;&nbsp;";
       		return str;
        }
        if(colId=="STATE"){
            return state==0?"有效":(state==2?"不可用":"无效");
        }
        return data[cid];
    });
    return dataTable;
}

//改变状态
function changeTableState(rid,state){
	 dhx.showProgress("提交数据中!");
	 HBTableAction.changeTableState({HB_TABLE_ID:dataTable.getUserData(rid,"HB_TABLE_ID"),STATE:state},function(ret){
	dhx.closeProgress();
	 if(ret.flag==1){
	 		dataTable.refreshData();
		}else if(ret.flag==0){
			dhx.alert(ret.msg||"");
		}else{
			dhx.alert("发生异常!"+(ret.msg||""));
		 }
	});
}

//修改字段信息
function modifyField(rid){
    var tblId = dataTable.getUserData(rid,"HB_TABLE_ID");
    openMenu("修改Hbase表","/meta/module/hbaseQuery/saveHbTable.jsp?tblMode=1&tblId="+tblId,"top","eidthbasetbl_"+tblId);
}

/**
 * 下载表的信息
 * @param dt
 * @param params
 */
function downloadCluster(rid,rname){
    var tableId = dataTable.getUserData(rid,"HB_TABLE_ID");
   	var url = 'hbaseTableDownload.jsp?tableId='+tableId+'&tableName='+rname ;
    location.href = url;
}
/**
 * 下载建表语句
 * @param dt
 * @param params
 */
function downloadTable(rid,rname){
 	var tableId = dataTable.getUserData(rid,"HB_TABLE_ID");
    var dataSourceId = dataTable.getUserData(rid,"DATA_SOURCE_ID");
	HBTableAction.checkHbaseTable(dataSourceId,rname,{
		asny:false,
		callback:function(rs){
			if(rs>0){
				var url = 'hbaseCreateTableDownload.jsp?tableId='+tableId+'&tableName='+rname+'&dataSourceId='+dataSourceId;
   		        location.href = url;
			}else{
				dhx.alert("HBASE中不存在表"+rname+"!");
				}
			}
		});
}

/**
 * 删除表的信息
 * @param dt
 * @param params
 */
function deleteCluster(rid){
	var tableId = dataTable.getUserData(rid,"HB_TABLE_ID");
	HBTableAction.checkCluster(tableId,1,{
		asny:false,
		callback:function(rs){
			if(rs>0){
				dhx.alert("该表已被使用，不能删除！");
				return;
			}else{
				dhx.confirm("您确定要删除该表吗？", function (rs) {
        if(rs){
        	dhx.showProgress("正在删除表");
            HBTableAction.deleteCluster(tableId,function(data){
            	dhx.closeProgress();
                if(data && data.flag == 1) {
                    dhx.alert("删除成功！");
                    dataTable.refreshData();
                }else {
                    dhx.alert("删除失败，详细信息请查看日志！");
                }
            });
        }
    });
			}
		}
	});
    
}




//查询数据
function queryData(dt,params){
    var termVals=TermReqFactory.getTermReq(1).getKeyValue();
    termVals["_COLUMN_SORT"] = params.sort;
    dhx.showProgress("请求数据中");
    HBTableAction.queryHBTableInfo(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

/**
 *  修改分类信息
 */
var tableWindow = null;
var tableId = null;
function  modifyCluster(rid){
        tableId = dataTable.getUserData(rid,"HB_TABLE_ID");
        if(!tableWindow){
            tableWindow = DHTMLXFactory.createWindow("selectWindow2","tableWindow", 0, 0, 300, 380);
            tableWindow.stick();
            tableWindow.setModal(true);
            tableWindow.setDimension(700);
            tableWindow.button("minmax1").hide();
            tableWindow.button("park").hide();
            tableWindow.button("stick").hide();
            tableWindow.button("sticked").hide();
            tableWindow.center();
            tableWindow.denyResize();
            tableWindow.denyPark();
            tableWindow.setText("修改分类信息");
            tableWindow.keepInViewport(true);

            var layout = new dhtmlXLayoutObject(tableWindow, "2E");
            layout.cells("b").setHeight(50);
            layout.cells("a").fixSize(true, true);
            layout.cells("a").hideHeader();
            layout.cells("a").attachObject($('tableContentTop'));
            layout.cells("b").fixSize(false, true);
            layout.cells("b").hideHeader();
            layout.cells("b").attachObject($('tableContentDown'));

            HBTableAction.getCluster(tableId,function(data){
                if(data){
                    tableInfo = data;
                    initClusterData(data);
                }
            });


            //重置关闭窗口事件
            tableWindow.attachEvent("onClose",function(){
                tableWindow.setModal(false);
                saveTabledata={};
                clearTableData("paraTable");
                this.hide();
                return false;
            });
            var calBtn = document.getElementById("calBtn");
            var saveBtn = document.getElementById("saveBtn");
            attachObjEvent(calBtn,"onclick",function(){
            	clearTableData("paraTable");
                tableWindow.close();
                saveTabledata={};
            });
            attachObjEvent(saveBtn,"onclick",function(){
            	saveTable();
            	paramArr=[];
            });
        }else {
        	HBTableAction.getClusterInfo(tableId,function(data){
                if(data){
                    tableInfo = data;
                    initClusterData(data);
                }
            });
        	
            tableWindow.show();
            tableWindow.setModal(true);
        }
}

//保存数据
function saveTable(){
    var paraArr = [];
        var data = {};
        saveTabledata.TABLE_ID = tableId;
        for(var i =1 ;i<paramTable.rows.length;i++){
            var index = paramTable.rows[i].cells[0].innerHTML;
            var paramData = {};
            paramData.orderId = i;
            paramData.clusterId = $("paramId"+index).value;
            paramData.clusterName = $("paramName"+index).value;
            paramData.clusterMsg =  $("paramPrifix"+index).value;
            paramData.hbclusterName =  $("hbclusterName"+index).value;
            if(checkColumn($("paramName"+index).value)==null&&$("paramName"+index).value!=""){
    			dhx.alert("序号"+index+"的分类别名只能以字母和下划线开头,且不能包含中文");
    			return;
    		}
            
            for(var ix=0;ix<paramArr.length;ix++){
        	if(paramData.clusterName==paramArr[ix].clusterName){
        		dhx.alert("分类别名不能相同！");
        		return;
        	}
        }
            if(paramData.clusterName!=""){
                paramArr.push(paramData);
            }
        }
        saveTabledata.paramDatas = paramArr;
        dhx.showProgress("请求数据中");
        HBTableAction.saveClusterInfo(saveTabledata,function(rs){
            dhx.closeProgress();
            if(rs.flag == 1){
                alert("保存成功！");
                clearTableData("paraTable");
                tableWindow.close();
                saveTabledata={};
            }else if(rs.flag == 2){
                alert("不能删除表的所有分类信息,可以选择删除表！");
                clearTableData("paraTable");
                tableWindow.close();
                saveTabledata={};
            }else{
                alert("保存出错！");
                saveTabledata={};
            }
        });
   // }
}

function  initClusterData(data){
    paramDatas =  data.ClusterDatas;
    if (typeof paramDatas == "undefined"){
    	paramDatas =  data.paramDatas;
    }
    
	if(paramDatas.length > 0 ){
        for(var i=0;i<paramDatas.length;i++){
            showParaRow(paramDatas[i],data);
        }
        addParaRow(null,paramDatas[i-1].ORDER_ID);
    }else{
        addParaRow(null,0);
    }
}

/**
 *  添加参数行,当输入参数名称的时候自动在表格中添加一行
 */
function addParaRow(obj,rowIndex){
    rowIndex = rowIndex+1;
    if(obj!=null){
        var nextTr = obj.parentNode.parentNode.parentNode.nextSibling;
        if(nextTr==null){
            creartParaRow(rowIndex);
        }
        var currTr = obj.parentNode.parentNode.parentNode;
        if(currTr.lastChild.innerHTML=="<DIV>&nbsp;&nbsp;</DIV>"||currTr.lastChild.innerHTML=="<div>&nbsp;&nbsp;</div>"){
            currTr.lastChild.innerHTML="<a href='#' onclick='deleteParamRow(this,"+rowIndex+")'>删除</a>";
        }
    }else{
        creartParaRow(rowIndex);
    }
}


/**
 * 创建一行
 * @param paramData
 */
/**
 * 生成一行操作
 * @parm rowIndex 行号
 */
function creartParaRow(rowIndex){
    var row = document.createElement("tr");
    row.onclick = function(){
        if(moveParamObj != null){
            moveParamObj.style.background = "";
        }
        moveParamObj=this
        row.style.background = "#f5f7f8";
    }
    paramTable.tBodies[0].appendChild(row);
    for(var i = 0 ;i<4;i++){
        var cell= document.createElement("td");
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
            cell.innerHTML ="<div style='width: 200px;'><input id='paramId"+rowIndex+"' value='0' type='hidden'/><input id='paramName"+rowIndex+"' type='text' class='input2' style='width:100px;' onchange='addParaRow(this,"+rowIndex+")'  /></div>";
        }
        if(i==2){
            cell.innerHTML ="<div style='width: 200px;'><input id='hbclusterName"+rowIndex+"' value='' type='hidden'/><input id='paramPrifix"+rowIndex+"'  type='text' class='input2' style='width:100px;'/></div>";
        }
        if(i==3){
            cell.className = 'c_td_end';
            cell.innerHTML= "<div>&nbsp;&nbsp;</div>";
        }
    }
  /**  dhtmlxValidation.addValidation(row,[
        {target:"paramName" + rowIndex,rule:"NotEmpty,MaxLength[32]"}
    ]);**/
    row._rowIndex=rowIndex;
}



/**
 * 加载修改信息
 * @param paramData
 */
function showParaRow(paramData, data){
    var  rowIndex = paramData.ORDER_ID;
    var row = document.createElement("tr");
    paramTable.tBodies[0].appendChild(row);
    $('paraTable_TABLENAME').innerText = data.HB_TABLE_NAME;
    for(var i = 0 ;i<4;i++){
        var cell= document.createElement("td");
        row.onclick = function(){
            if(moveParamObj != null){
                moveParamObj.style.background = "";
            }
            moveParamObj=this;
            row.style.background = "#f5f7f8";
        };
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
            cell.innerHTML ="<div style='width: 200px;'><input id='paramId"+rowIndex+"' value='"+paramData.CLUSTER_ID+"' type='hidden'/><input id='paramName"+rowIndex+"' value='"+(paramData.DEFINE_CLUSTER_NAME==null?"":paramData.DEFINE_CLUSTER_NAME)+"' type='text' class='input2' style='width:100px;' onkeyup='addParaRow(this,"+rowIndex+")' /></div>";
        }
        if(i==2){
            cell.innerHTML ="<div style='width: 200px;'><input id='hbclusterName"+rowIndex+"' value='"+(paramData.HB_CLUSTER_NAME==null?"":paramData.HB_CLUSTER_NAME)+"' type='hidden'/><input id='paramPrifix"+rowIndex+"' value='" + (paramData.DEFINE_CLUSTER_MSG==null?"":paramData.DEFINE_CLUSTER_MSG) + "' type='text' class='input2' style='width:100px;'/></div>";
        }
        if(i==3){
            cell.className = 'c_td_end';
            cell.innerHTML= "<a href='#' onclick='deleteParamRow(this,"+rowIndex+")'>删除</a>";
        }
    }
  /**  dhtmlxValidation.addValidation(row,[
        {target:"paramName" + rowIndex,rule:"NotEmpty,MaxLength[32]"}
    ]);**/
    row._rowIndex=rowIndex;
}

//删除一行参数信息
function deleteParamRow(obj,rowIndex){
    var tr=obj.parentNode.parentNode;
    var table =tr.parentNode;
    table.removeChild(tr);
}

//删除一行参数信息
function deleteregParamRow(obj,rowIndex){
    var tr=obj.parentNode.parentNode;
    var table =tr.parentNode;
    table.removeChild(tr);
}

/**
 * 查看
 * @param rid
 */
function showCluster(rid){
    tableId = dataTable.getUserData(rid,"HB_TABLE_ID");
    if(!clusterWindow){
        clusterWindow = DHTMLXFactory.createWindow("selectWindow3","clusterWindow", 0, 0, 300, 380);
        clusterWindow.stick();
        clusterWindow.setModal(true);
        clusterWindow.setDimension(700);
        clusterWindow.button("minmax1").hide();
        clusterWindow.button("park").hide();
        clusterWindow.button("stick").hide();
        clusterWindow.button("sticked").hide();
        clusterWindow.center();
        clusterWindow.denyResize();
        clusterWindow.denyPark();
        clusterWindow.setText("表信息");
        clusterWindow.keepInViewport(true);

        var layout = new dhtmlXLayoutObject(clusterWindow, "2E");
        layout.cells("b").setHeight(50);
        layout.cells("a").fixSize(true, true);
        layout.cells("a").hideHeader();
        layout.cells("a").attachObject($('clusterContentTop'));
        layout.cells("b").fixSize(false, true);
        layout.cells("b").hideHeader();
        layout.cells("b").attachObject($('clusterContentDown'));

        HBTableAction.getClusterInfo(tableId,function(data){
            if(data){
                tableInfo = data;
                initClusterInfoData(data,0);
            }
        });


        //重置关闭窗口事件
        clusterWindow.attachEvent("onClose",function(){
            clusterWindow.setModal(false);
            saveTabledata={};
            clearTableData("paraClusterTable");
            this.hide();
            return false;
        });
        var calBtn1 = document.getElementById("calBtn1");
        attachObjEvent(calBtn1,"onclick",function(){
        	clearTableData("paraClusterTable");
            clusterWindow.close();
        });

    }else {
    	HBTableAction.getClusterInfo(tableId,function(data){
            if(data){
                tableInfo = data;
                initClusterInfoData(data,0);
            }
        });
        clusterWindow.show();
        clusterWindow.setModal(true);
    }
}

    function  initClusterInfoData(data,flag){
        paraCluster = data.ClusterDatas;
        paramClusterDatas =  data.paramClusterDatas;
        if(flag==0){
            if(paramClusterDatas.length > 0 ){
               for(var i=0;i<paramClusterDatas.length;i++){
                  showClusterParaRow(paramClusterDatas[i], data);
               }
            }
        }
        if(flag==1){
            if(paramClusterDatas.length > 0 ){
                for(var i=0;i<paramClusterDatas.length;i++){
                    showClusterParaRows(paramClusterDatas[i], data);
                }
                addClusterParaRow(null,paramClusterDatas[i-1].ORDER_ID);
            }else{
                addClusterParaRow(null,0);
            }

        }
  }
    /**
     * 加载修改信息
     * @param paramData
     */
    function showClusterParaRows(paramData, data){
        var  rowIndex = paramData.ORDER_ID;
        var row = document.createElement("tr");
        paramClustersTable.tBodies[0].appendChild(row);
        $('paraClusterInfoTable_TABLENAME').innerText = data.HB_TABLE_NAME;
        for(var i = 0 ;i<5;i++){
            var cell= document.createElement("td");
            cell.className = 'c_td';
            row.appendChild(cell);
            if(i==0){
                cell.innerHTML = rowIndex;
            }
            if(i==1){
                cell.innerHTML ="<div style='width: 150px;'><input id='paramColumnIds"+rowIndex+"' value='"+paramData.COLUMN_ID+"' type='hidden'/><input id='paramColumnName"+rowIndex+"' value='"+paramData.HB_COLUMN_NAME+"' type='hidden'/><input id='paramNameCL"+rowIndex+"' value='"+paramData.CLUSTER_ID+"' type='hidden'/>" + paramData.DEFINE_CLUSTER_NAME + "</div>";
            }
            if(i==2){
                cell.innerHTML ="<div style='width: 200px;'><input id='paramColumnId"+rowIndex+"' value='"+paramData.CLUSTER_ID+"' type='hidden'/><input id='paramNameEN"+rowIndex+"' value='"+(paramData.DEFINE_EN_COLUMN_NAME==null?"":paramData.DEFINE_EN_COLUMN_NAME)+"' type='text' class='input2' style='width:100px;' onchange='addClusterParaRow(this,"+rowIndex+")'   /></div>";
            }
            if(i==3){
                cell.innerHTML ="<div style='width: 150px;'><input id='paramNameCH"+rowIndex+"' value='"+(paramData.DEFINE_CH_COLUMN_NAME==null?"":paramData.DEFINE_CH_COLUMN_NAME)+"' type='text' class='input2' style='width:100px;'  /></div>";
            }
            if(i==4){
                cell.innerHTML ="<div style='width: 100px;'><input id='paramNameMark"+rowIndex+"' value='"+(paramData.COL_SPLIT==null?"":paramData.COL_SPLIT)+"' type='text' class='input2' style='width:80px;'  /></div>";
            }

        }
        row._rowIndex=rowIndex;
    }


/**
 *  添加参数行,当输入参数名称的时候自动在表格中添加一行
 */
function addClusterParaRow(obj,rowIndex){
    rowIndex = rowIndex+1;
    if(obj!=null){
        var nextTr = obj.parentNode.parentNode.parentNode.nextSibling;
        if(nextTr==null){
            createClusterParaRow(rowIndex);
        }
       /* var currTr = obj.parentNode.parentNode.parentNode;
        if(currTr.lastChild.innerHTML=="<DIV>&nbsp;&nbsp;</DIV>"||currTr.lastChild.innerHTML=="<div>&nbsp;&nbsp;</div>"){
            currTr.lastChild.innerHTML="<a href='#' onclick='deleteParamRow(this,"+rowIndex+")'>删除</a>";
        } */
    }else{
        createClusterParaRow(rowIndex);
    }
}



/**
 * 生成一行操作
 * @parm rowIndex 行号
 */
function createClusterParaRow(rowIndex){
    var row = document.createElement("tr");
	row.onclick = function(){
        if(moveParamObj != null){
            moveParamObj.style.background = "";
        }
        moveParamObj=this
        row.style.background = "#f5f7f8";
    }
    paramClustersTable.tBodies[0].appendChild(row);
    for(var i = 0 ;i<5;i++){
        var cell= document.createElement("td");
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
            cell.innerHTML ="<div style='width: 150px;'><input id='paramColumnIds"+rowIndex+"' value='' type='hidden'/><input id='paramColumnName"+rowIndex+"' value='' type='hidden'/><select id='paramNameCL"+rowIndex+"''></select></div>";
        }
        if(i==2){
            cell.innerHTML ="<div style='width: 200px;'><input id='paramColumnId"+rowIndex+"' value='' type='hidden'/><input id='paramNameEN"+rowIndex+"' value='' type='text' class='input2' style='width:100px;' onchange='addClusterParaRow(this,"+rowIndex+")'   /></div>";
        }
        if(i==3){
            cell.innerHTML ="<div style='width: 150px;'><input id='paramNameCH"+rowIndex+"' value='' type='text' class='input2' style='width:100px;'  /></div>";
        }
        if(i==4){
            cell.innerHTML ="<div style='width: 100px;'><input id='paramNameMark"+rowIndex+"' value='' type='text' class='input2' style='width:80px;'  /></div>";
        }
    }
    for(var m=0;m<paraCluster.length;m++){
        var option = new Option(paraCluster[m].DEFINE_CLUSTER_NAME, paraCluster[m].CLUSTER_ID);
        $('paramNameCL'+rowIndex).options[m] = option;
    }
    /**dhtmlxValidation.addValidation(row,[
        {target:"paramNameEN" + rowIndex,rule:"NotEmpty,MaxLength[32]"}
    ]);**/
    row._rowIndex=rowIndex;
}
/**
 * 查看
 * @param paramData
 */
   function showClusterParaRow(paramData, data){
       var rowIndex = paramData.ORDER_ID;
       var row = document.createElement("tr");
       paramClusterTable.tBodies[0].appendChild(row);
       $('paraClusterTable_TABLENAME').innerText = data.HB_TABLE_NAME;
       for(var i = 0 ;i<7;i++){
           var cell= document.createElement("td");
           cell.className = 'c_td';
           row.appendChild(cell);
           if(i==0){
               cell.innerHTML = rowIndex;
           }
           if(i==1){
        	   cell.innerHTML ="<div style='width: 90px;'>"+paramData.HB_CLUSTER_NAME+"</div>";
           }
           if(i==2){
               cell.innerHTML ="<div style='width: 90px;'>" + (paramData.DEFINE_CLUSTER_NAME==null?"":paramData.DEFINE_CLUSTER_NAME) + "</div>";
           }
           if(i==3){
               cell.innerHTML ="<div style='width: 90px;'>"+paramData.HB_COLUMN_NAME+"</div>";
           }
           if(i==4){
               cell.innerHTML ="<div style='width: 90px;white-space:normal;word-wrap:break-word;word-break:break-all;'>"+paramData.DEFINE_EN_COLUMN_NAME+"</div>";
           }
           if(i==5){
               cell.innerHTML ="<div style='width: 90px;white-space:normal;word-wrap:break-word;word-break:break-all;'>" + (paramData.DEFINE_CH_COLUMN_NAME==null?"":paramData.DEFINE_CH_COLUMN_NAME) +"</div>";
           }
           if(i==6){
               cell.innerHTML ="<div style='width: 90px;'>" + (paramData.COL_SPLIT==null?"":paramData.COL_SPLIT) +"</div>";
           }
       }
       row._rowIndex=rowIndex;
   }

/**
 * 修改列信息
 */
function modifyClusterInfo(rid){
    tableId = dataTable.getUserData(rid,"HB_TABLE_ID");
    if(!clusterInfoWindow){
        clusterInfoWindow = DHTMLXFactory.createWindow("selectWindow4","clusterInfoWindow", 0, 0, 300, 380);
        clusterInfoWindow.stick();
        clusterInfoWindow.setModal(true);
        clusterInfoWindow.setDimension(700);
        clusterInfoWindow.button("minmax1").hide();
        clusterInfoWindow.button("park").hide();
        clusterInfoWindow.button("stick").hide();
        clusterInfoWindow.button("sticked").hide();
        clusterInfoWindow.center();
        clusterInfoWindow.denyResize();
        clusterInfoWindow.denyPark();
        clusterInfoWindow.setText("修改列信息");
        clusterInfoWindow.keepInViewport(true);

        var layout = new dhtmlXLayoutObject(clusterInfoWindow, "2E");
        layout.cells("b").setHeight(50);
        layout.cells("a").fixSize(true, true);
        layout.cells("a").hideHeader();
        layout.cells("a").attachObject($('clusterInfoContentTop'));
        layout.cells("b").fixSize(false, true);
        layout.cells("b").hideHeader();
        layout.cells("b").attachObject($('clusterInfoContentDown'));

        HBTableAction.getClusterInfo(tableId,function(data){
            if(data){
                tableInfo = data;
                initClusterInfoData(data,1);
            }
        });


        //重置关闭窗口事件
        clusterInfoWindow.attachEvent("onClose",function(){
            clusterInfoWindow.setModal(false);
            saveTabledata={};
            clearTableData("paraClusterInfoTable");
            this.hide();
            return false;
        });
        var calBtn2 = document.getElementById("calBtn2");
        attachObjEvent(calBtn2,"onclick",function(){
        	clearTableData("paraClusterInfoTable");
            clusterInfoWindow.close();
        });
        var saveBtn2 = document.getElementById("saveBtn2");
        attachObjEvent(saveBtn2,"onclick",function(){
            saveCluster();
            paramClusterArr = [];
        });

    }else {
    	HBTableAction.getClusterInfo(tableId,function(data){
            if(data){
                tableInfo = data;
                initClusterInfoData(data,1);
            }
        });
        clusterInfoWindow.show();
        clusterInfoWindow.setModal(true);
    }
}



/**
 * 保存修改列操作
 */

function saveCluster(){
    var paraArr = [];
    var data = {};
    saveClusterTabledata.TABLE_ID = tableId;
       //验证方法
    for(var m =1 ;m<paramClustersTable.rows.length;m++){
   		 var index = paramClustersTable.rows [m].cells[0].innerHTML;
    	
    	//验证中文与英文长度是否一致
    	var cnen = $("paramNameEN"+index).value;
    	 var lastIndex = cnen.substring(cnen.length-1,cnen.length);
    	 if (lastIndex==",") {         
    		  cnen = cnen.substring(0, cnen.length-1);
    		  $("paramNameEN"+index).value = cnen;
    	 }
    	var cnch = $("paramNameCH"+index).value; 
    	var lastIndexCh = cnch.substring(cnch.length-1,cnch.length);
    	 if (lastIndexCh == ",") {         
    		  cnch = cnch.substring(0,cnch.length-1);
    		  $("paramNameCH"+index).value = cnch;
    	 }
    	
    	if(cnch!=""&&cnen.split(",").length!=cnch.split(",").length){
    		dhx.alert("输入中文名称与英文名称长度不一致！");
    		return;
    	}
    
    
    	var cl = $("paramNameCL"+index).value;
    	var en =  $("paramNameEN"+index).value;
    	var enArr =  en.split(",");
    	for(var k = 0;k<enArr.length;k++){
    		if(checkColumn(enArr[k])==null&&enArr[k]!=""){
    			dhx.alert("序号"+index+"的英文别名只能以字母和下划线开头,且不能包含中文");
    			return;
    		}
    	}
    	var cnMark =  $("paramNameMark"+index).value;
    	if(enArr.length>1&&cnMark.Trim()==""){
    		dhx.alert("序号"+index+"需要填写拆分标识！");
    		return;
    	}
    	for(var n =1 ;n<paramClustersTable.rows.length;n++){
    		var indexTemp = paramClustersTable.rows [n].cells[0].innerHTML;
    		var clTemp = $("paramNameCL"+indexTemp).value;
    		var enTemp =  $("paramNameEN"+indexTemp).value;
    		var enArrTemp = enTemp.split(",");
    		for(var j = 0;j<enArrTemp.length;j++){
    			if(m!=n&&enArr.in_array(enArrTemp[j])&&enTemp!=""){
    				dhx.alert("序号"+index+"和序号"+indexTemp+"存在重复数据！");
    				return;
    			}
    		}
    		
    	}
    }
    
    
    for(var i =1 ;i<paramClustersTable.rows.length;i++){
        var index = paramClustersTable.rows [i].cells[0].innerHTML;
        var paramsData = {};
        paramsData.orderId = i;
        paramsData.COLUMN_ID = $("paramColumnIds"+index).value;
        paramsData.CLUSTER_ID = $("paramColumnId"+index).value;
        paramsData.hbName = $("paramColumnName"+index).value;
        paramsData.paramColumnNameEN = $("paramNameEN"+index).value;
        paramsData.clName = $("paramNameCL"+index).value;
        paramsData.paramColumnNameCH =  $("paramNameCH"+index).value;
        paramsData.paramColumnNameMark =  $("paramNameMark"+index).value;
        
     
        var checkRs = checkMark(paramsData.paramColumnNameMark,index);
    	if(checkRs!="mark"){
    		dhx.alert(checkRs);
    		return;
    	}
        /**
        for(var ix=0;ix<paramClusterArr.length;ix++){
        	if(paramsData.paramColumnNameEN==paramClusterArr[ix].paramColumnNameEN){
        		dhx.alert("列英文别名不能相同！");
        		return;
        	}
        }**/
        if(paramsData.paramColumnNameEN!=""){
            paramClusterArr.push(paramsData);
        }
    }
    saveClusterTabledata.paramDatas = paramClusterArr;
    dhx.showProgress("请求数据中");
    HBTableAction.saveClusterInfoTable(saveClusterTabledata,function(rs){
        dhx.closeProgress();
        if(rs.flag == 1){
            alert("保存成功！");
            clearTableData("paraClusterInfoTable");
            clusterInfoWindow.close();
        }else{
            alert("保存出错！");
        }
    });
}

/**
 * 创建表
 */
function addTableColumn(){
    if(!tableManagerWindow){
        tableManagerWindow = DHTMLXFactory.createWindow("selectWindow5","tableManagerWindow", 0, 0, 300, 450);
        tableManagerWindow.stick();
        tableManagerWindow.setModal(true);
        tableManagerWindow.setDimension(700);
        tableManagerWindow.button("minmax1").hide();
        tableManagerWindow.button("park").hide();
        tableManagerWindow.button("stick").hide();
        tableManagerWindow.button("sticked").hide();
        tableManagerWindow.center();
        tableManagerWindow.denyResize();
        tableManagerWindow.denyPark();
        tableManagerWindow.setText("新建表信息");
        tableManagerWindow.keepInViewport(true);

        var layout = new dhtmlXLayoutObject(tableManagerWindow, "2E");
        layout.cells("b").setHeight(50);
        layout.cells("a").fixSize(true, true);
        layout.cells("a").hideHeader();
        layout.cells("a").attachObject($('tableManagerContentTop'));
        
        layout.cells("b").fixSize(false, true);
        layout.cells("b").hideHeader();
        layout.cells("b").attachObject($('tableManagerContentDown'));

        initTableManager();
        document.getElementById("tableManagerContentTop1").style.display = "block";
        document.getElementById("tableManagerContentTop2").style.display = "none";
        document.getElementById("tableManagerContentDown1").style.display = "block";
        document.getElementById("tableManagerContentDown2").style.display = "none";

        //重置关闭窗口事件
        tableManagerWindow.attachEvent("onClose",function(){
            tableManagerWindow.setModal(false);
            this.hide();
            return false;
        });
        var nextBtn = document.getElementById("nextBtn");
        var preBtn = document.getElementById("preBtn");
        var calBtn3 = document.getElementById("calBtn3");
        var calBtn4 = document.getElementById("calBtn4");
        var saveBtn4 = document.getElementById("saveBtn3");
        attachObjEvent(calBtn3,"onclick",function(){ tableManagerWindow.close(); });
        attachObjEvent(calBtn4,"onclick",function(){ tableManagerWindow.close(); });
        attachObjEvent(saveBtn4,"onclick",function(){saveTableManagerInfo();});
        attachObjEvent(nextBtn,"onclick",function(){nextTableManagerInfo();});
        attachObjEvent(preBtn,"onclick",function(){preTableManagerInfo();});

    }else {
    	document.getElementById("tableManagerContentTop1").style.display = "block";
        document.getElementById("tableManagerContentTop2").style.display = "none";
        document.getElementById("tableManagerContentDown1").style.display = "block";
        document.getElementById("tableManagerContentDown2").style.display = "none";
        
        document.getElementById("managerTableMsg").value="";
    	document.getElementById("dataSourceId").value="";
    	document.getElementById("dataSourceName").value="";
    	document.getElementById("managerTableName").value="";
    	
    	initTableManager();
        tableManagerWindow.show();
        tableManagerWindow.setModal(true);
    }
}

/**
 * 创建表
 */

function regaddTableColumn(){
    if(!regtableManagerWindow){
        regtableManagerWindow = DHTMLXFactory.createWindow("selectWindow5x","tableManagerWindow", 0, 0, 300, 450);
        regtableManagerWindow.stick();
        regtableManagerWindow.setModal(true);
        regtableManagerWindow.setDimension(700);
        regtableManagerWindow.button("minmax1").hide();
        regtableManagerWindow.button("park").hide();
        regtableManagerWindow.button("stick").hide();
        regtableManagerWindow.button("sticked").hide();
        regtableManagerWindow.center();
        regtableManagerWindow.denyResize();
        regtableManagerWindow.denyPark();
        regtableManagerWindow.setText("注册表信息");
        regtableManagerWindow.keepInViewport(true);

        var layout = new dhtmlXLayoutObject(regtableManagerWindow, "2E");
        layout.cells("b").setHeight(50);
        layout.cells("a").fixSize(true, true);
        layout.cells("a").hideHeader();
        layout.cells("a").attachObject($('regtableManagerContentTop'));
        layout.cells("b").fixSize(false, true);
        layout.cells("b").hideHeader();
        layout.cells("b").attachObject($('regtableManagerContentDown'));

        initregTableManager();
        document.getElementById("regtableManagerContentTop1").style.display = "block";
        document.getElementById("regtableManagerContentTop2").style.display = "none";
        document.getElementById("regtableManagerContentDown1").style.display = "block";
        document.getElementById("regtableManagerContentDown2").style.display = "none";

        //重置关闭窗口事件
        regtableManagerWindow.attachEvent("onClose",function(){
            regtableManagerWindow.setModal(false);
            this.hide();
            return false;
        });
        var nextBtn = document.getElementById("regnextBtn");
        var preBtn = document.getElementById("regpreBtn");
        var calBtn3 = document.getElementById("regcalBtn3");
        var calBtn4 = document.getElementById("regcalBtn4");
        var saveBtn4 = document.getElementById("regsaveBtn3");
        attachObjEvent(calBtn3,"onclick",function(){ regtableManagerWindow.close(); });
        attachObjEvent(calBtn4,"onclick",function(){ regtableManagerWindow.close(); });
        attachObjEvent(saveBtn4,"onclick",function(){saveregTableManagerInfo();});
        attachObjEvent(nextBtn,"onclick",function(){regnextTableManagerInfo();});
        attachObjEvent(preBtn,"onclick",function(){regpreTableManagerInfo();});

    }else {
    	document.getElementById("regtableManagerContentTop1").style.display = "block";
        document.getElementById("regtableManagerContentTop2").style.display = "none";
        document.getElementById("regtableManagerContentDown1").style.display = "block";
        document.getElementById("regtableManagerContentDown2").style.display = "none";
        
        document.getElementById("regmanagerTableMsg").value="";
    	document.getElementById("regdataSourceId").value="";
    	document.getElementById("regdataSourceName").value="";
    	
        var regmanagerTableName = document.getElementById("regmanagerTableName");
        regmanagerTableName.options.length = 0; 
        regmanagerTableName.options[0]= new Option("--请选择--","");
    	initregTableManager();
        regtableManagerWindow.show();
        regtableManagerWindow.setModal(true);
    }
}

/**
 * 下一步
 */
function nextTableManagerInfo(){
    tableColumnSelect = [];
    for(var i =1 ;i<paramTableManagerInfoTable.rows.length;i++){
        var index = paramTableManagerInfoTable.rows [i].cells[0].innerHTML;
         tableColumnSelect.push($("paramDefineName"+index).value);
    }
    for(var i =1 ;i<paramTableManagerInfoTable1.rows.length;i++){
        var index = paramTableManagerInfoTable1.rows [i].cells[0].innerHTML;
        var im=0;
        $('paramColumnNameCL'+index).options.length=0;
        for(var m=0;m<tableColumnSelect.length-1;m++){
        	if(tableColumnSelect[m]!=null&&tableColumnSelect[m]!=''){
	            var option = new Option(tableColumnSelect[m],tableColumnSelect[m]);
	            $('paramColumnNameCL'+index).options[im] = option;
	            im++;
            }else{
            	alert("分类别名不能为空！");
            	return;
            }
        }
    }
    document.getElementById("tableManagerContentTop1").style.display = "none";
    document.getElementById("tableManagerContentTop2").style.display = "block";
    document.getElementById("tableManagerContentDown1").style.display = "none";
    document.getElementById("tableManagerContentDown2").style.display = "block";

}

function regnextTableManagerInfo(){
    document.getElementById("regtableManagerContentTop1").style.display = "none";
    document.getElementById("regtableManagerContentTop2").style.display = "block";
    document.getElementById("regtableManagerContentDown1").style.display = "none";
    document.getElementById("regtableManagerContentDown2").style.display = "block";
    tableColumnSelect = [];
    for(var i =1 ;i<regparamTableManagerInfoTable.rows.length;i++){
        var index = regparamTableManagerInfoTable.rows [i].cells[0].innerHTML;
         tableColumnSelect.push($("regparamDefineName"+index).value);
    }
    for(var i =1 ;i<regparamTableManagerInfoTable1.rows.length;i++){
        var index = regparamTableManagerInfoTable1.rows [i].cells[0].innerHTML;
        for(var m=0;m<tableColumnSelect.length;m++){
            var option = new Option(tableColumnSelect[m],tableColumnSelect[m]);
            $('regparamColumnNameCL'+index).options[m] = option;
        }
    }
}

/**
 * 上一步
 */
function preTableManagerInfo(){
    document.getElementById("tableManagerContentTop1").style.display = "block";
    document.getElementById("tableManagerContentTop2").style.display = "none";
    document.getElementById("tableManagerContentDown1").style.display = "block";
    document.getElementById("tableManagerContentDown2").style.display = "none";
}
function regpreTableManagerInfo(){
    document.getElementById("regtableManagerContentTop1").style.display = "block";
    document.getElementById("regtableManagerContentTop2").style.display = "none";
    document.getElementById("regtableManagerContentDown1").style.display = "block";
    document.getElementById("regtableManagerContentDown2").style.display = "none";
}

/**
 * 初始化创建表
 */
function initTableManager(){
	clearTableData("paraTableManagerInfoTable");
	clearTableData("paraTableManagerInfoTable1");
    addTableManagerParaRow(null,0);
    addTableManagerColumnParaRow(null,0);
}

/**
 * 初始化创建表
 */
function initregTableManager(){
	clearTableData("regparaTableManagerInfoTable");
	clearTableData("regparaTableManagerInfoTable1");
	
    addregTableManagerColumnParaRow(null,0);
}

/**
 *  添加列的分类
 */
function addTableManagerColumnParaRow(obj,rowIndex){
    rowIndex = rowIndex+1;
    if(obj!=null){
        var nextTr = obj.parentNode.parentNode.parentNode.nextSibling;
        if(nextTr==null){
            createTableManagerColumnParaRow(rowIndex);
        }
        var currTr = obj.parentNode.parentNode.parentNode;
        if(currTr.lastChild.innerHTML=="<DIV>&nbsp;&nbsp;</DIV>"||currTr.lastChild.innerHTML=="<div>&nbsp;&nbsp;</div>"){
            currTr.lastChild.innerHTML="<a href='#' onclick='deleteParamRow(this,"+rowIndex+")'>删除</a>";
        }
    }else{
        createTableManagerColumnParaRow(rowIndex);
    }
}
/**
 *  添加列的分类
 */
function addregTableManagerColumnParaRow(obj,rowIndex){
    rowIndex = rowIndex+1;
    if(obj!=null){
        var nextTr = obj.parentNode.parentNode.parentNode.nextSibling;
        if(nextTr==null){
            createregTableManagerColumnParaRow(rowIndex);
        }
        var currTr = obj.parentNode.parentNode.parentNode;
        if(currTr.lastChild.innerHTML=="<DIV>&nbsp;&nbsp;</DIV>"||currTr.lastChild.innerHTML=="<div>&nbsp;&nbsp;</div>"){
            currTr.lastChild.innerHTML="<a href='#' onclick='deleteregParamRow(this,"+rowIndex+")'>删除</a>";
        }
    }else{
        createregTableManagerColumnParaRow(rowIndex);
    }
}

/**
 * 生成一行列的信息
 * @parm rowIndex 行号
 */
function createTableManagerColumnParaRow(rowIndex){
    var row = document.createElement("tr");
    row.onclick = function(){
        if(moveParamObj != null){
            moveParamObj.style.background = "";
        }
        moveParamObj=this;
        row.style.background = "#f5f7f8";
    }
    paramTableManagerInfoTable1.tBodies[0].appendChild(row);
    for(var i = 0 ;i<6;i++){
        var cell= document.createElement("td");
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
            cell.innerHTML ="<div style='width: 100px;'><select id='paramColumnNameCL"+rowIndex+"' ></select></div>";
        }
        if(i==2){
            cell.innerHTML ="<div style='width: 100px;'><input id='paramColumnNameEN"+rowIndex+"' value='' type='text' class='input2' style='width:100px;' onchange='addTableManagerColumnParaRow(this,"+rowIndex+")'  /></div>";
        }
        if(i==3){
            cell.innerHTML ="<div style='width: 100px;'><input id='paramColumnNameCH"+rowIndex+"' value='' type='text' class='input2' style='width:100px;'  /></div>";
        }
        if(i==4){
            cell.innerHTML ="<div style='width: 100px;'><input id='paramColumnNameMark"+rowIndex+"' value='' type='text' class='input2' style='width:100px;'  /></div>";
        }
        if(i==5){
            cell.className = 'c_td_end';
            cell.innerHTML= "<DIV>&nbsp;&nbsp;</DIV>";
        }
        if(i==1){
              for(var m=0;m<tableColumnSelect.length;m++){
                  var option = new Option(tableColumnSelect[m],tableColumnSelect[m]);
                  $('paramColumnNameCL'+rowIndex).options[m] = option;
               }
        }
    }

   /** dhtmlxValidation.addValidation(row,[
        {target:"paramColumnNameEN" + rowIndex,rule:"NotEmpty,MaxLength[32]"}
    ]);**/
    row._rowIndex=rowIndex;
}


/**
 * 生成一行列的信息
 * @parm rowIndex 行号
 */
function createregTableManagerColumnParaRow(rowIndex){

    var row = document.createElement("tr");
    row.onclick = function(){
        if(moveParamObj != null){
            moveParamObj.style.background = "";
        }
        moveParamObj=this;
        row.style.background = "#f5f7f8";
    }
    regparamTableManagerInfoTable1.tBodies[0].appendChild(row);
    for(var i = 0 ;i<7;i++){
        var cell= document.createElement("td");
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
			cell.innerHTML ="<div style='width: 100px;'><select id='regparamColumnNameCL"+rowIndex+"' ></select></div>";
        }
        if(i==2){
            cell.innerHTML ="<div style='width: 100px;'><input id='regparamColumnNameCO"+rowIndex+"' value='' type='text' class='input2' style='width:100px;' onchange='addregTableManagerColumnParaRow(this,"+rowIndex+")'   /></div>";
        }
        if(i==3){
            cell.innerHTML ="<div style='width: 100px;'><input id='regparamColumnNameEN"+rowIndex+"' value='' type='text' class='input2' style='width:100px;' onchange='addregTableManagerColumnParaRow(this,"+rowIndex+")'   /></div>";
        }
        if(i==4){
            cell.innerHTML ="<div style='width: 100px;'><input id='regparamColumnNameCH"+rowIndex+"' value='' type='text' class='input2' style='width:100px;'  /></div>";
        }
        if(i==5){
            cell.innerHTML ="<div style='width: 100px;'><input id='regparamColumnNameMark"+rowIndex+"' value='' type='text' class='input2' style='width:100px;'  /></div>";
        }
        if(i==6){
            cell.className = 'c_td_end';
            cell.innerHTML= "<DIV>&nbsp;&nbsp;</DIV>";
        }
        if(i==1){
			for(var m=0;m<tableColumnSelect.length;m++){
				var option = new Option(tableColumnSelect[m],tableColumnSelect[m]);
				$('regparamColumnNameCL'+rowIndex).options[m] = option;
			}
        }
    }

  /**  dhtmlxValidation.addValidation(row,[
        {target:"regparamColumnNameEN" + rowIndex,rule:"NotEmpty,MaxLength[32]"}
    ]);
**/    row._rowIndex=rowIndex;
}



/**
 *  添加列的分类
 */
function addTableManagerParaRow(obj,rowIndex){
    rowIndex = rowIndex+1;
    if(obj!=null){
        var nextTr = obj.parentNode.parentNode.parentNode.nextSibling;
        if(nextTr==null){
            createTableManagerParaRow(rowIndex);
        }
         var currTr = obj.parentNode.parentNode.parentNode;
         if(currTr.lastChild.innerHTML=="<DIV>&nbsp;&nbsp;</DIV>"||currTr.lastChild.innerHTML=="<div>&nbsp;&nbsp;</div>"){
         currTr.lastChild.innerHTML="<a href='#' onclick='deleteParamRow(this,"+rowIndex+")'>删除</a>";
         }
    }else{
        createTableManagerParaRow(rowIndex);
    }
}



/**
 * 生成一行列的分类信息
 * @parm rowIndex 行号
 */
function createTableManagerParaRow(rowIndex){
    var row = document.createElement("tr");
    row.onclick = function(){
        if(moveParamObj != null){
            moveParamObj.style.background = "";
        }
        moveParamObj=this;
        row.style.background = "#f5f7f8";
    };
    paramTableManagerInfoTable.tBodies[0].appendChild(row);
    for(var i = 0 ;i<4;i++){
        var cell= document.createElement("td");
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
            cell.innerHTML ="<div style='width: 200px;'><input id='paramDefineName"+rowIndex+"' value='' type='text' class='input2' style='width:100px;' onkeyup='addTableManagerParaRow(this,"+rowIndex+")'   /></div>";
        }
        if(i==2){
            cell.innerHTML ="<div style='width: 200px;'><input id='paramMSG"+rowIndex+"' value='' type='text' class='input2' style='width:100px;'/></div>";
        }
        if(i==3){
            cell.className = 'c_td_end';
            cell.innerHTML = "<DIV>&nbsp;&nbsp;</DIV>";
        }
    }

    dhtmlxValidation.addValidation(row,[
        {target:"paramDefineName" + rowIndex,rule:"NotEmpty,MaxLength[20]"}
    ]);
    row._rowIndex=rowIndex;
}

/**
 * 保存表信息
 */
function saveTableManagerInfo(){
	saveTableManagerdata.reg=0;
    var managerTableName = $("managerTableName").value;
    var managerTableMsg = $("managerTableMsg").value;
    var dataSourceId = $("dataSourceId").value;
    if(managerTableName == null||managerTableName==""){
        dhx.alert("请输入表名称！");
        return;
    }
    if(checkColumn(managerTableName)==null){
    		dhx.alert("表名称只能以字母和下划线开头,且不能包含中文");
    		return;
    	}
    
    if(dataSourceId == null||dataSourceId==""){
        dhx.alert("请选择一个数据源！");
        return;
    }
    
    
    if(paramTableManagerInfoTable.rows.length <= 2){
        dhx.alert("请填写表的分类信息，至少一个！");
        return;
    }
    
    if(paramTableManagerInfoTable1.rows.length <= 2){
        dhx.alert("请填写表的列信息，至少一个");
        return;
    }
    
    saveTableManagerdata.managerTableName = managerTableName;
    saveTableManagerdata.managerTableMsg = managerTableMsg;
    saveTableManagerdata.dataSourceId = dataSourceId;

    var paramTable1Arr = [];
    var paramTable2Arr = [];
    var data = {};
    for(var i =1 ;i<paramTableManagerInfoTable.rows.length-1;i++){
        var index = paramTableManagerInfoTable.rows [i].cells[0].innerHTML;
        var paramsData = {};
        paramsData.orderId = i;
        paramsData.paramDefineName = $("paramDefineName"+index).value;
        paramsData.paramMSG = $("paramMSG"+index).value;
        if(checkColumn($("paramDefineName"+index).value)==null&&$("paramDefineName"+index).value!=""){
    			dhx.alert("序号"+index+"的分类别名只能以字母和下划线开头,且不能包含中文");
    			return;
    		}
        for(var ix=0;ix<paramTable1Arr.length;ix++){
        	if(paramsData.paramDefineName==paramTable1Arr[ix].paramDefineName){
        		dhx.alert("分类别名不能相同！");
        		return;
        	}
        }
        paramTable1Arr.push(paramsData);

    }
    
    //验证方法
    for(var m =1 ;m<paramTableManagerInfoTable1.rows.length;m++){
  	     var index = paramTableManagerInfoTable1.rows [m].cells[0].innerHTML;
   		 var cnen = $("paramColumnNameEN"+index).value;
    	 var lastIndex = cnen.substring(cnen.length-1,cnen.length);
    	 if (lastIndex==",") {         
    		  cnen = cnen.substring(0, cnen.length-1);
    		  $("paramColumnNameEN"+index).value = cnen;
    	 }
    	var cnch = $("paramColumnNameCH"+index).value; 
    	var lastIndexCh = cnch.substring(cnch.length-1,cnch.length);
    	 if (lastIndexCh == ",") {         
    		  cnch = cnch.substring(0,cnch.length-1);
    		  $("paramColumnNameCH"+index).value = cnch;
    	 }
    	
    	if(cnch!=""&&cnen.split(",").length!=cnch.split(",").length){
    		dhx.alert("序号"+index+"输入中文名称与英文名称长度不一致！");
    		return;
    	}
    	
    	var cl = $("paramColumnNameCL"+index).value;
    	var en =  $("paramColumnNameEN"+index).value;
    	var enArr =  en.split(",");
    	for(var k = 0;k<enArr.length;k++){
    		if(checkColumn(enArr[k])==null&&enArr[k]!=""){
    			dhx.alert("序号"+index+"的英文别名只能以字母和下划线开头,且不能包含中文");
    			return;
    		}
    	}
    	
    	var cnMark =  $("paramColumnNameMark"+index).value;
    	if(enArr.length>1&&cnMark.Trim()==""){
    		dhx.alert("序号"+index+"需要填写拆分标识！");
    		return;
    	}
    	for(var n =1 ;n<paramTableManagerInfoTable1.rows.length;n++){
    		var indexTemp = paramTableManagerInfoTable1.rows [n].cells[0].innerHTML;
    		var clTemp = $("paramColumnNameCL"+indexTemp).value;
    		var enTemp =  $("paramColumnNameEN"+indexTemp).value;
    		var enArrTemp = enTemp.split(",");
    		for(var j = 0;j<enArrTemp.length;j++){
    			if(m!=n&&enArr.in_array(enArrTemp[j])&&enTemp!=""){
    				dhx.alert("序号"+index+"和序号"+indexTemp+"存在重复数据！");
    				return;
    			}
    		}
    		
    	}
    }
    
    for(var i =1 ;i<paramTableManagerInfoTable1.rows.length-1;i++){
        var index = paramTableManagerInfoTable1.rows [i].cells[0].innerHTML;
        var paramsData = {};
        paramsData.orderId = i;
        paramsData.paramColumnNameEN = $("paramColumnNameEN"+index).value;
        paramsData.paramColumnNameCL = $("paramColumnNameCL"+index).value;
        paramsData.paramColumnNameCH = $("paramColumnNameCH"+index).value;
        paramsData.paramColumnNameMark = $("paramColumnNameMark"+index).value;
    	if(paramsData.paramColumnNameEN==null||paramsData.paramColumnNameEN==''){
    		dhx.alert("列英文别名不能为空！");
    		return;
    	}
    	var checkRs = checkMark(paramsData.paramColumnNameMark,index);
    	if(checkRs!="mark"){
    		dhx.alert(checkRs);
    		return;
    	}
    	/**
        for(var ix=0;ix<paramTable2Arr.length;ix++){
        	if(paramsData.paramColumnNameEN==paramTable2Arr[ix].paramColumnNameEN){
        		dhx.alert("列英文别名不能相同！");
        		return;
        	}
        }**/
        paramTable2Arr.push(paramsData);

    }
    saveTableManagerdata.paramTable2Datas = paramTable2Arr;
    saveTableManagerdata.paramTable1Datas = paramTable1Arr;
    dhx.showProgress("请求数据中");
    HBTableAction.saveManagerTable(saveTableManagerdata,function(rs){
        dhx.closeProgress();
        if(rs.flag == 1){
            dhx.alert("保存成功！");
            paramTable1Arr = [];
            paramTable2Arr = [];
            saveTableManagerdata = {};
            tableManagerWindow.close();
            //selectDataSourceWindow.close();
            dataDataSourceTable.Page.currPageNum = 1;
            dataDataSourceTable.refreshData();
            dataTable.refreshData();
        }else if(rs.flag == 3){
            dhx.alert("表名已存在！");
        }else{
        	dhx.alert("保存出错！");
        }
    });
}



function checkMark(s,index) { 
	var l = 0; 
	var a = s.split("");
	 for (var i=0;i<a.length;i++) {
	  if (a[i].charCodeAt(0)<299) { 
	  	l++; 
	  } else { 
	  	return  "序号"+index+"的标识符不能包含汉字！"; 
	  } 
	} 
	if(l>5){
	  return "序号"+index+"的标识符长度不能超过5！"; 
	}else{
		return "mark";
	}
}

function saveregTableManagerInfo(){
	saveTableManagerdata.reg=1;
    var managerTableName = $("regmanagerTableName").value;
    var managerTableMsg = $("regmanagerTableMsg").value;
    var dataSourceId = $("regdataSourceId").value;
    if(managerTableName == null||managerTableName==""){
        dhx.alert("请输入表名称！");
        return;
    }
    
    if(dataSourceId == null||dataSourceId==""){
        dhx.alert("请选择一个数据源！");
        return;
    }
    
    if(regparamTableManagerInfoTable1.rows.length <= 1){
        dhx.alert("请填写表的列信息，至少一个");
        return;
    }
    
    saveTableManagerdata.managerTableName = managerTableName;
    saveTableManagerdata.managerTableMsg = managerTableMsg;
    saveTableManagerdata.dataSourceId = dataSourceId;

    var paramTable1Arr = [];
    var paramTable2Arr = [];
    var data = {};
    for(var i =1 ;i<regparamTableManagerInfoTable.rows.length;i++){
        var index = regparamTableManagerInfoTable.rows [i].cells[0].innerHTML;
        var paramsData = {};
        paramsData.orderId = i;
        paramsData.columnName = $("regcolumnName"+index).value;
        paramsData.paramDefineName = $("regparamDefineName"+index).value;
        paramsData.paramMSG = $("regparamMSG"+index).value;
         if(checkColumn($("regparamDefineName"+index).value)==null&&$("regparamDefineName"+index).value!=""){
    			dhx.alert("序号"+index+"的分类别名只能以字母和下划线开头,且不能包含中文");
    			return;
    		}
        for(var ix=0;ix<paramTable1Arr.length;ix++){
        	if(paramsData.paramDefineName==paramTable1Arr[ix].paramDefineName){
        		dhx.alert("分类别名不能相同！");
        		return;
        	}
        }
        paramTable1Arr.push(paramsData);

    }
    
    
        //验证方法
    for(var m =1 ;m<regparamTableManagerInfoTable1.rows.length;m++){
    var index = regparamTableManagerInfoTable1.rows [m].cells[0].innerHTML;
    
    //验证中文与英文长度是否一致
    var cnen = $("regparamColumnNameEN"+index).value;
    	 var lastIndex = cnen.substring(cnen.length-1,cnen.length);
    	 if (lastIndex==",") {         
    		  cnen = cnen.substring(0, cnen.length-1);
    		  $("regparamColumnNameEN"+index).value = cnen;
    	 }
    	var cnch = $("regparamColumnNameCH"+index).value; 
    	var lastIndexCh = cnch.substring(cnch.length-1,cnch.length);
    	 if (lastIndexCh == ",") {         
    		  cnch = cnch.substring(0,cnch.length-1);
    		  $("regparamColumnNameCH"+index).value = cnch;
    	 }
    	
    	if(cnch!=""&&cnen.split(",").length!=cnch.split(",").length){
    		dhx.alert("输入中文名称与英文名称长度不一致！");
    		return;
    	}
    
    
    
    	var cl = $("regparamColumnNameCL"+index).value;
    	var en =  $("regparamColumnNameEN"+index).value;
    	var enArr =  en.split(",");
    	for(var k = 0;k<enArr.length;k++){
    		if(checkColumn(enArr[k])==null&&enArr[k]!=""){
    			dhx.alert("序号"+index+"的英文别名只能以字母和下划线开头,且不能包含中文");
    			return;
    		}
    	}
    	var cnMark =  $("regparamColumnNameMark"+index).value;
    	if(enArr.length>1&&cnMark.Trim()==""){
    		dhx.alert("序号"+index+"需要填写拆分标识！");
    		return;
    	}
    	for(var n =1 ;n<regparamTableManagerInfoTable1.rows.length;n++){
    		var indexTemp = regparamTableManagerInfoTable1.rows [n].cells[0].innerHTML;
    		var clTemp = $("regparamColumnNameCL"+indexTemp).value;
    		var enTemp =  $("regparamColumnNameEN"+indexTemp).value;
    		var enArrTemp = enTemp.split(",");
    		for(var j = 0;j<enArrTemp.length;j++){
    			if(m!=n&&enArr.in_array(enArrTemp[j])&&enTemp!=""){
    				dhx.alert("序号"+index+"和序号"+indexTemp+"存在重复数据！");
    				return;
    			}
    		}
    		
    	}
    }
    
    
    
    
    
    for(var i =1 ;i<regparamTableManagerInfoTable1.rows.length-1;i++){
        var index = regparamTableManagerInfoTable1.rows [i].cells[0].innerHTML;
        var paramsData = {};
        paramsData.orderId = i;
        paramsData.paramColumnNameEN = $("regparamColumnNameEN"+index).value;
        paramsData.paramColumnNameCL = $("regparamColumnNameCL"+index).value;
        paramsData.paramColumnNameCO = $("regparamColumnNameCO"+index).value;
        paramsData.paramColumnNameCH = $("regparamColumnNameCH"+index).value;
        paramsData.paramColumnNameMark = $("regparamColumnNameMark"+index).value;
    	if(paramsData.paramColumnNameCO==null||paramsData.paramColumnNameCO==''){
    		dhx.alert("列名不能为空！");
    		return;
    	}
    	if(checkColumn($("regparamColumnNameCO"+index).value)==null&&$("regparamColumnNameCO"+index).value!=""){
    			dhx.alert("序号"+index+"的列名称只能以字母和下划线开头,且不能包含中文");
    			return;
    		}
        for(var ix=0;ix<paramTable2Arr.length;ix++){
        	if(paramsData.paramColumnNameCL==paramTable2Arr[ix].paramColumnNameCL&&paramsData.paramColumnNameCO==paramTable2Arr[ix].paramColumnNameCO){
        		dhx.alert("列名不能相同！");
        		return;
        	}
        /**	if(paramsData.paramColumnNameEN==paramTable2Arr[ix].paramColumnNameEN){
        		dhx.alert("列英文别名不能相同！");
        		return;
        	}**/
        }
        paramTable2Arr.push(paramsData);

    }
    
    saveTableManagerdata.paramTable2Datas = paramTable2Arr;
    saveTableManagerdata.paramTable1Datas = paramTable1Arr;
    dhx.showProgress("请求数据中");
    HBTableAction.saveManagerTable(saveTableManagerdata,function(rs){
        dhx.closeProgress();
        if(rs.flag == 1){
            dhx.alert("保存成功！");
            paramTable1Arr = [];
            paramTable2Arr = [];
            saveTableManagerdata = {};
            regtableManagerWindow.close();
            regdataDataSourceTable.Page.currPageNum = 1;
            regdataDataSourceTable.refreshData();
            dataTable.refreshData();
        }else{
            dhx.alert("保存出错！");
        }
    });
}

var selectDataSourceWindow = null;
var dname = "";
var did = "";
function openDataSourceTableWin(obj,name,id){
		dname=name;
		did=id;
		globle_dataSourceId = $(id).value;
		globle_dataSourceName = $(name).value;
    if(!selectDataSourceWindow){
        selectDataSourceWindow = DHTMLXFactory.createWindow("selectWindow2","selectDataSourceWindow", 0, 0, 300, 380);
        selectDataSourceWindow.stick();
        selectDataSourceWindow.setModal(true);
        selectDataSourceWindow.setDimension(1000);
        selectDataSourceWindow.button("minmax1").hide();
        selectDataSourceWindow.button("park").hide();
        selectDataSourceWindow.button("stick").hide();
        selectDataSourceWindow.button("sticked").hide();
        selectDataSourceWindow.center();
        selectDataSourceWindow.denyResize();
        selectDataSourceWindow.denyPark();
        selectDataSourceWindow.setText("选择数据源");
        selectDataSourceWindow.keepInViewport(true);

        var layout = new dhtmlXLayoutObject(selectDataSourceWindow, "2E");
        layout.cells("b").setHeight(50);
        layout.cells("a").fixSize(true, true);
        layout.cells("a").hideHeader();
        layout.cells("a").attachObject($('tableSelectDataSourceContentTop'));
        layout.cells("b").fixSize(false, true);
        layout.cells("b").hideHeader();
        layout.cells("b").attachObject($('tableSelectDataSourceContentDown'));

        dataDataSourceTableInit(); //初始数据表格  初始之后dataTable才会被实例化
        dataDataSourceTable.setReFreshCall(queryDataSourceData); //设置表格刷新的回调方法，即实际查询数据的方法
        //添加radio点击事件。
		dataDataSourceTable.grid.attachEvent("onCheck", function(rId, cInd, state){
		    if(state){
		        globle_dataSourceId = dataDataSourceTable.getUserData(rId,"DATA_SOURCE_ID");
		        globle_dataSourceName = dataDataSourceTable.getUserData(rId,"DATA_SOURCE_NAME");
		    }
		});
		// 添加行点击事件
		dataDataSourceTable.grid.attachEvent("onRowSelect",function(rId,ind){
			dataDataSourceTable.grid.cells(rId,0).setValue(1);
		        globle_dataSourceId = dataDataSourceTable.getUserData(rId,"DATA_SOURCE_ID");
		        globle_dataSourceName = dataDataSourceTable.getUserData(rId,"DATA_SOURCE_NAME");
		});
        dataDataSourceTable.refreshData();

        //重置关闭窗口事件
        selectDataSourceWindow.attachEvent("onClose",function(){
            selectDataSourceWindow.setModal(false);
            this.hide();
            return false;
        });

        attachObjEvent($("searchDataSourceTable"), "onclick", function() {
			dataDataSourceTable.Page.currPageNum = 1;
			dataDataSourceTable.refreshData();
		});
        
        $('saveDataSourceBtn').onclick = function(){
            var checkedId=dataDataSourceTable.grid.getCheckedRows(0);//获得提取被选中的一行的ID

            if(globle_dataSourceId==null||globle_dataSourceId==""){
                alert("请选择一个数据源！");
                return;
            }else{
                selectDataSourceWindow.setModal(false);
                selectDataSourceWindow.hide();
               // $('dateSourceId').value = dateSourceId?dateSourceId:"";
                $(did).value = globle_dataSourceId?globle_dataSourceId:"";
                $(dname).value = globle_dataSourceName?globle_dataSourceName:"";
                if(dname=='regdataSourceName'){
                	HBTableAction.queryTableByDataSourceId(globle_dataSourceId,function(data){
		                var regmanagerTableName = document.getElementById("regmanagerTableName");
		                regmanagerTableName.options.length = 0; 
		                regmanagerTableName.options[0]= new Option("--请选择--","");
		                for(var m=0;m<data.length;m++){
		                	regmanagerTableName.options[m+1] = new Option(data[m],data[m]);
		                }
		            });
                }
            }
        };
    }else {
        selectDataSourceWindow.show();
        selectDataSourceWindow.setModal(true);
        $('searchSourceId').value = '';
        $('searchSourceName').value = '';
        dataDataSourceTable.refreshData();
    }
}

var regselectDataSourceWindow = null;
var dhname = "";
var dhid = "";
function regopenDataSourceTableWin(obj,name,id){
		dhname=name;
		dhid=id;
		globle_dataSourceId = $(dhid).value;
		globle_dataSourceName = $(dhname).value;
    if(!regselectDataSourceWindow){
        regselectDataSourceWindow = DHTMLXFactory.createWindow("selectWindow2","regselectDataSourceWindow", 0, 0, 300, 380);
        regselectDataSourceWindow.stick();
        regselectDataSourceWindow.setModal(true);
        regselectDataSourceWindow.setDimension(1000);
        regselectDataSourceWindow.button("minmax1").hide();
        regselectDataSourceWindow.button("park").hide();
        regselectDataSourceWindow.button("stick").hide();
        regselectDataSourceWindow.button("sticked").hide();
        regselectDataSourceWindow.center();
        regselectDataSourceWindow.denyResize();
        regselectDataSourceWindow.denyPark();
        regselectDataSourceWindow.setText("选择数据源");
        regselectDataSourceWindow.keepInViewport(true);

        var layout = new dhtmlXLayoutObject(regselectDataSourceWindow, "2E");
        layout.cells("b").setHeight(50);
        layout.cells("a").fixSize(true, true);
        layout.cells("a").hideHeader();
        layout.cells("a").attachObject($('regtableSelectDataSourceContentTop'));
        layout.cells("b").fixSize(false, true);
        layout.cells("b").hideHeader();
        layout.cells("b").attachObject($('regtableSelectDataSourceContentDown'));

        regdataDataSourceTableInit(); //初始数据表格  初始之后dataTable才会被实例化
        regdataDataSourceTable.setReFreshCall(regqueryDataSourceData); //设置表格刷新的回调方法，即实际查询数据的方法
		
        //添加radio点击事件。
		regdataDataSourceTable.grid.attachEvent("onCheck", function(rId, cInd, state){
		    if(state){
		        globle_dataSourceId = regdataDataSourceTable.getUserData(rId,"DATA_SOURCE_ID");
		        globle_dataSourceName = regdataDataSourceTable.getUserData(rId,"DATA_SOURCE_NAME");
		    }
		});
		// 添加行点击事件
		regdataDataSourceTable.grid.attachEvent("onRowSelect",function(rId,ind){
			regdataDataSourceTable.grid.cells(rId,0).setValue(1);
			globle_dataSourceId = regdataDataSourceTable.getUserData(rId,"DATA_SOURCE_ID");
			globle_dataSourceName = regdataDataSourceTable.getUserData(rId,"DATA_SOURCE_NAME");
		});
       // regdataDataSourceTable.refreshData();

        //重置关闭窗口事件
        regselectDataSourceWindow.attachEvent("onClose",function(){
            regselectDataSourceWindow.setModal(false);
            this.hide();
            return false;
        });


		attachObjEvent($("regsearchDataSourceTable"), "onclick", function() {
			regdataDataSourceTable.Page.currPageNum = 1;
			regdataDataSourceTable.refreshData();
		});

    
        $('regsaveDataSourceBtn').onclick = function(){
            var checkedId=regdataDataSourceTable.grid.getCheckedRows(0);//获得提取被选中的一行的ID
            
            if(globle_dataSourceId==null||globle_dataSourceId==""){
                alert("请选择一个数据源！");
                return;
            }else{
                regselectDataSourceWindow.setModal(false);
                regselectDataSourceWindow.hide();
                $(dhid).value = globle_dataSourceId?globle_dataSourceId:"";
                $(dhname).value = globle_dataSourceName?globle_dataSourceName:"";
                
                if(dhname=='regdataSourceName'){
                	HBTableAction.queryTableByDataSourceId(globle_dataSourceId,function(data){
		                var regmanagerTableName = document.getElementById("regmanagerTableName");
		                regmanagerTableName.options.length = 0; 
		                regmanagerTableName.options[0]= new Option("--请选择--","");
		                for(var m=0;m<data.length;m++){
		                	regmanagerTableName.options[m+1] = new Option(data[m],data[m]);
		                }
		            });
                }
            }
        };
    }else {
        regselectDataSourceWindow.show();
        regselectDataSourceWindow.setModal(true);
        $('regsearchSourceId').value = '';
        $('regsearchSourceName').value = '';
		regdataDataSourceTable.refreshData();
    }
}

//改变下拉框事件
function selectTableName(){
	clearTableData("regparaTableManagerInfoTable");
	var tableName = document.getElementById("regmanagerTableName").value;
	if(tableName!=''&&$('regdataSourceId').value!='')
	HBTableAction.queryClusterNameByTableId($('regdataSourceId').value,tableName,function(data){
		//regparaTableManagerInfoTable
		for(var m=0;m<data.length;m++){
			var rowIndex = m+1;
			var row = document.createElement("tr");
		    row.onclick = function(){
		        if(moveParamObj != null){
		            moveParamObj.style.background = "";
		        }
		        moveParamObj=this;
		        row.style.background = "#f5f7f8";
		    };
		    regparamTableManagerInfoTable.tBodies[0].appendChild(row);
		    for(var i = 0 ;i<4;i++){
		        var cell= document.createElement("td");
		        cell.className = 'c_td';
		        row.appendChild(cell);
		        if(i==0){
		            cell.innerHTML = rowIndex;
		        }
		        if(i==1){
		            cell.innerHTML ="<div style='width: 200px;'><input id='regcolumnName"+rowIndex+"' value='"+data[m]+"' type='hidden' />"+data[m]+"</div>";
		        }
		        if(i==2){
		            cell.innerHTML ="<div style='width: 200px;'><input id='regparamDefineName"+rowIndex+"' value='' type='text' class='input2' style='width:100px;' onkeyup='addTableManagerParaRow(this,"+rowIndex+")' /></div>";
		        }
		        if(i==3){
		            cell.innerHTML ="<div style='width: 200px;'><input id='regparamMSG"+rowIndex+"' value='' type='text' class='input2' style='width:100px;'/></div>";
		        }
		    }
		
		  /**  dhtmlxValidation.addValidation(row,[
		        {target:"regparamDefineName" + rowIndex,rule:"NotEmpty,MaxLength[32]"}
		    ]);**/
		    row._rowIndex=rowIndex;
			
		}
	});
}

var dataDataSourceTable = null;
function dataDataSourceTableInit(){
    dataDataSourceTable= new meta.ui.DataTable("tableSelectDataSourceContent");//第二个参数表示是否是表格树
    dataDataSourceTable.setColumns({
        OPP: "选择行",
        DATA_SOURCE_ID: "数据源ID",
        DATA_SOURCE_NAME : "数据源名称",
        DATA_SOURCE_ADDRESS: "数据源地址",
     // ZOOKEEPER_SERVERS: "ZK地址",
        PARALLEL_NUM: "并发访问数",
     // HBASE_SITE_XML : "HBase配置信息",
     // ZOOKEEPER_PORT:"ZK端口",
        ROOT_ZNODE_NAME:"ZK根节点名称",
        PARENT_ZNODE_NAME: "HBase根节点地址",
        STATE:"状态"
    },"OPP,DATA_SOURCE_ID,DATA_SOURCE_NAME,DATA_SOURCE_ADDRESS,PARALLEL_NUM," +
        "ROOT_ZNODE_NAME,PARENT_ZNODE_NAME,STATE");
    dataDataSourceTable.setRowIdForField("DATA_SOURCE_ID");
    dataDataSourceTable.setPaging(true,20);//分页
    dataDataSourceTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataDataSourceTable.grid.setInitWidthsP("5,10,15,15,10,20,15,10");
    dataDataSourceTable.setGridColumnCfg(0,{align:"center",type:"ra"});
    dataDataSourceTable.setGridColumnCfg(1,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(2,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(3,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(4,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(5,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(6,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(7,{align:"center"});
//    dataDataSourceTable.setGridColumnCfg(8,{align:"center"});
//    dataDataSourceTable.setGridColumnCfg(9,{align:"center"});
//    dataDataSourceTable.setGridColumnCfg(10,{align:"center"});

    dataDataSourceTable.setFormatCellCall(function(rid,cid,data,colId){
        if(colId=="OPP"){
            if(data[1]==globle_dataSourceId){
                return 1;
            }
            return 0;
        }else if(colId == "STATE"){
            return data[cid] =="0"?"有效":"无效" ;
        }
        return data[cid];
    });
    return dataDataSourceTable;

}

var regdataDataSourceTable = null;
function regdataDataSourceTableInit(){
    regdataDataSourceTable= new meta.ui.DataTable("regtableSelectDataSourceContent");//第二个参数表示是否是表格树
    regdataDataSourceTable.setColumns({
        OPP: "选择行",
        DATA_SOURCE_ID: "数据源ID",
        DATA_SOURCE_NAME : "数据源名称",
        DATA_SOURCE_ADDRESS: "数据源地址",
     // ZOOKEEPER_SERVERS: "ZK地址",
        PARALLEL_NUM: "并发访问数",
     // HBASE_SITE_XML : "HBase配置信息",
     // ZOOKEEPER_PORT:"ZK端口",
        ROOT_ZNODE_NAME:"ZK根节点名称",
        PARENT_ZNODE_NAME: "HBase根节点地址",
        STATE:"状态"
    },"OPP,DATA_SOURCE_ID,DATA_SOURCE_NAME,DATA_SOURCE_ADDRESS,PARALLEL_NUM," +
        "ROOT_ZNODE_NAME,PARENT_ZNODE_NAME,STATE");
    regdataDataSourceTable.setRowIdForField("DATA_SOURCE_ID");
    regdataDataSourceTable.setPaging(true,20);//分页
    regdataDataSourceTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    regdataDataSourceTable.grid.setInitWidthsP("5,10,15,15,10,20,15,10");
    regdataDataSourceTable.setGridColumnCfg(0,{align:"center",type:"ra"});
    regdataDataSourceTable.setGridColumnCfg(1,{align:"center"});
    regdataDataSourceTable.setGridColumnCfg(2,{align:"center"});
    regdataDataSourceTable.setGridColumnCfg(3,{align:"center"});
    regdataDataSourceTable.setGridColumnCfg(4,{align:"center"});
    regdataDataSourceTable.setGridColumnCfg(5,{align:"center"});
    regdataDataSourceTable.setGridColumnCfg(6,{align:"center"});
    regdataDataSourceTable.setGridColumnCfg(7,{align:"center"});
//    regdataDataSourceTable.setGridColumnCfg(8,{align:"center"});
//    regdataDataSourceTable.setGridColumnCfg(9,{align:"center"});
//    regdataDataSourceTable.setGridColumnCfg(10,{align:"center"});

    regdataDataSourceTable.setFormatCellCall(function(rid,cid,data,colId){
        if(colId=="OPP"){
            if(data[1]==globle_dataSourceId){
                return 1;
            }
            return 0;
        }else if(colId == "STATE"){
            return data[cid] =="0"?"有效":"无效" ;
        }
        return data[cid];
    });
    return regdataDataSourceTable;

}

function queryDataSourceData(dt,params){
	   // var keyWord = $('tableProgramSearch').value;
	    var queryData = {};
	   // queryData.keyWord = keyWord;
	   queryData.DATA_ID = $("searchSourceId").value;
	   queryData.DATA_NAME = $("searchSourceName").value;
	   queryData.DATA_STATUS = 0;
	    HBaseDataSourceAction.queryDataSourceList(queryData,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
	        dhx.closeProgress();
	        var total = 0;
	        if(data && data[0])
	            total = data[0]["TOTAL_COUNT_"];
	        dataDataSourceTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
	    });
	}

function regqueryDataSourceData(dt,params){
	    var queryData = {};
	   queryData.DATA_ID = $("regsearchSourceId").value;
	   queryData.DATA_NAME = $("regsearchSourceName").value;
	   queryData.DATA_STATUS = 0;
	    HBaseDataSourceAction.queryDataSourceList(queryData,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
	        dhx.closeProgress();
	        var total = 0;
	        if(data && data[0])
	            total = data[0]["TOTAL_COUNT_"];
	        regdataDataSourceTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
	    });
	}

function clearTableData(tid)
{
	var signFrame = findObj(tid, document);
	var rowscount = signFrame.rows.length;
    //循环删除行,从最后一行往前删除
    for(i=rowscount - 1;i > 0; i--){
    	signFrame.deleteRow(i);
    }
}

function findObj(theObj, theDoc)
{
	var p, i, foundObj;
	if(!theDoc)
		theDoc = document;
	if( (p = theObj.indexOf("?")) > 0 && parent.frames.length)
	{
		theDoc = parent.frames[theObj.substring(p+1)].document;
		theObj = theObj.substring(0,p);
	}
	if(!(foundObj = theDoc[theObj]) && theDoc.all)
		foundObj = theDoc.all[theObj];
	for (i=0; !foundObj && i < theDoc.forms.length; i++)
		foundObj = theDoc.forms[i][theObj];
	for(i=0; !foundObj && theDoc.layers && i < theDoc.layers.length; i++)
		foundObj = findObj(theObj,theDoc.layers[i].document);
	if(!foundObj && document.getElementById)
		foundObj = document.getElementById(theObj);
	return foundObj;
}

function editData(tableid,tablename){
    try{
        openMenu("编辑数据","/meta/module/hbaseQuery/hbaseTableData.jsp?tableid="+tableid+"&tablename="+tablename,"top","addRule"+tableid);
    }catch(e) {
        window.open(urlEncode(getBasePath()+"/meta/module/hbaseQuery/qryAdd.jsp?tableid="+tableid+"&tablename="+tablename),'addRule');
    }
}

function checkColumn(obj){
	return obj.match(/^([a-zA-z_]{1})([\w]*)$/);
}

dhx.ready(pageInit);
