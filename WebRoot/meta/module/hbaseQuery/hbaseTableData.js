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
var dataTable = null; //用户权限信息
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
var moveParamObj = null;
var pageNo = 1;
var columnnames;
var columnparams;

var HB_TABLE_NAME;
var DATA_SOURCE_ID;


/**
 * 页面初始化
 */
function pageInit() {
	var columns;
	var columnwitdh;

	HBTableAction.getColmnsInfo(tableid, function(data) {
		if (data) {
			columns = data.columns;
			columnnames = data.columnnames;
			columnwitdh = data.columnwitdh;
			columnparams = data.paramClusterDatas;
			HB_TABLE_NAME = data.HB_TABLE_NAME;
			DATA_SOURCE_ID = data.DATA_SOURCE_ID;

			var termReq = TermReqFactory.createTermReq(1);
			paramTable = $("paraTable");
			paramClusterTable = $("paraClusterTable");
			paramClustersTable = $("paraClusterInfoTable");
			paramTableManagerInfoTable = $("paraTableManagerInfoTable");
			paramTableManagerInfoTable1 = $("paraTableManagerInfoTable1");
			var dataId = termReq.createTermControl("tableName", "TABLE_NAME");
			dataId.setWidth(240);

			dataTableInit(columns, columnnames);
			dataTable.setPaging(false, 20);//分页
			dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
			dataTable.grid.setInitWidthsP(columnwitdh);
			dataTable.grid.enableSelectCheckedBoxCheck(1);

			dataTable.setGridColumnCfg(0, {
				align : "center",
				type : "ch"
			});
		}
		for ( var i = 1; i < columnparams.length; i++) {
			dataTable.setGridColumnCfg(i, {
				align : "left"
			});
		}
		
		
		
		
		dataTable.setReFreshCall(queryData);
		dhx.showProgress("请求数据中");
		termReq.init(function(termVals) {
			dhx.closeProgress();
			dataTable.refreshData();
		}); //打包请求数据，初始，传入回调函数，里面开始查询数据
	});

	var addBtn = document.getElementById("addBtn");
	var editBtn = document.getElementById("editBtn");
	var delBtn = document.getElementById("delBtn");
	var upBtn = document.getElementById("upBtn");
	var downBtn = document.getElementById("downBtn");

	attachObjEvent(addBtn, "onclick", function() {
		addTableColumn();
	});
	attachObjEvent(editBtn, "onclick", function() {
		editTableColumn();
	});
	attachObjEvent(delBtn, "onclick", function() {
		delTableColumn();
	});
	attachObjEvent(upBtn, "onclick", function() {
		if(pageNo>1){
			pageNo--;
		}else{
			dhx.alert("第一页！");
			pageNo=1;
			return;
		}
		queryData();
	});
	attachObjEvent(downBtn, "onclick", function() {
		pageNo++;
		queryData();
	});

}

//初始数据表格
function dataTableInit(columns, colmnnames) {
	dataTable = new meta.ui.DataTable("container");
	dataTable.setColumns(columns, colmnnames);
	dataTable.setFormatCellCall(function(rid, cid, data, colId) {
	
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
	
	return dataTable;
}

//查询数据
var startRowkey = [];
function queryData(dt, params) {
	var termVals = TermReqFactory.getTermReq(1).getKeyValue();
	termVals["columnnames"] = columnnames;
	termVals["tableName"] = HB_TABLE_NAME;
	termVals["tableid"] = tableid;
	termVals["dataSourceId"] = DATA_SOURCE_ID;
	dhx.showProgress("请求数据中");
	HBTableAction.queryListMapHBTableData(termVals,startRowkey[pageNo] , 20, function(data) {
		dhx.closeProgress();
		var total = 0;
		if (data&&data.length>0){
			startRowkey[pageNo+1]=data[data.length-1].rowkey;
		}
		if (data.length<20){
			$("downBtn").disabled="disabled";
		}else{
			$("downBtn").disabled="";
		}
		document.getElementById("pageNo").innerHTML=pageNo;
		dataTable.bindData(data, total); //查询出数据后，必须显示调用绑定数据的方法
	});
}

function delTableColumn() {
	var checkedId = dataTable.grid.getCheckedRows(0);
	//dataTable.grid.selectAll();
	if (checkedId == null || checkedId == "") {
		dhx.alert("请选择一条数据！");
		return;
	} else {
		dhx.confirm("您确定要删除该条数据吗？", function (rs) {
        	if(rs){
				var rowkeys="";
				var checkedIds = checkedId.split(",");
				for(var i=0;i<checkedIds.length;i++){
					rowkeys+=dataTable.userData[checkedIds[i]-1].rowkey+",";
				}
				var delInfo = {};
				delInfo.rowkeys = rowkeys;
				delInfo.tableName = HB_TABLE_NAME;
				delInfo.dataSourceId = DATA_SOURCE_ID;
				dhx.showProgress("请求数据中");
				HBTableAction.delTableData(delInfo,function(rs){
			        if(rs == 1){
				        dhx.closeProgress();
			            dhx.alert("删除成功！");
			            dataTable.refreshData();
			        }else{
			            dhx.alert("删除失败！");
			        }
			    });
			}
		});
	}
	
}

function editTableColumn() {
	var checkedId = dataTable.grid.getCheckedRows(0);
	//dataTable.grid.selectAll();
	if (checkedId == null || checkedId == "") {
		dhx.alert("请选择一条数据！");
		return;
	} else {
		if(checkedId.split(",").length>1){
		dhx.alert("选择过多，请选择一条数据！");
		return;
		}
		addTableColumn(checkedId);
	}
	
}

/**
 * 创建表
 */
function addTableColumn(index) {
	var title = "";
	if (index){
		title = "修改数据";
	}else{
		title = "新增数据";
	}
	
	if (!tableManagerWindow) {
		tableManagerWindow = DHTMLXFactory.createWindow("selectWindow5",
				"tableManagerWindow", 0, 0, 300, 450);
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
		tableManagerWindow.setText(title);
		tableManagerWindow.keepInViewport(true);

		var layout = new dhtmlXLayoutObject(tableManagerWindow, "2E");
		layout.cells("b").setHeight(50);
		layout.cells("a").fixSize(true, true);
		layout.cells("a").hideHeader();
		layout.cells("a").attachObject($('tableManagerContentTop'));

		layout.cells("b").fixSize(false, true);
		layout.cells("b").hideHeader();
		layout.cells("b").attachObject($('tableManagerContentDown'));

		initTableManager(index);
		document.getElementById("tableManagerContentTop1").style.display = "block";
		document.getElementById("tableManagerContentDown1").style.display = "block";
		
		var saveBtn = document.getElementById("saveBtn");
		attachObjEvent(saveBtn,"onclick",function(){saveData();});
		var calBtn = document.getElementById("calBtn");
		attachObjEvent(calBtn,"onclick",function(){ tableManagerWindow.close(); });
		//重置关闭窗口事件
		tableManagerWindow.attachEvent("onClose", function() {
			tableManagerWindow.setModal(false);
			this.hide();
			return false;
		});
	} else {
		tableManagerWindow.setText(title);
		initTableManager(index);
		tableManagerWindow.show();
		tableManagerWindow.setModal(true);
	}
}
function saveData(){
	var saveTableInfo = {};
	var saveTabledata = [];
	
	if(document.getElementById("rowkey").value==''){
		dhx.alert("请输入ROWKEY！");
		return;
	}
	
	saveTableInfo.rowkey = document.getElementById("rowkey").value;
	saveTableInfo.tableName = HB_TABLE_NAME;
	saveTableInfo.dataSourceId = DATA_SOURCE_ID;
	saveTableInfo.tableid = tableid;
	for ( var x = 0; x < columnparams.length; x++) {
		var rdata = {};
		rdata.HB_CLUSTER_NAME=columnparams[x].HB_CLUSTER_NAME;
		rdata.HB_COLUMN_NAME=columnparams[x].HB_COLUMN_NAME;
		rdata.DEFINE_EN_COLUMN_NAME=columnparams[x].DEFINE_EN_COLUMN_NAME;
		rdata.ROW_VALUE=document.getElementById("row_value"+x).value;
		saveTabledata.push(rdata);
	}
	
	saveTableInfo.datas=saveTabledata;
	dhx.showProgress("请求数据中");
    HBTableAction.addTableData(saveTableInfo,function(rs){
    dhx.closeProgress();
        if(rs == 1){
            dhx.alert("保存成功！");
            document.getElementById("rowkey").value='';
            tableManagerWindow.close();
            dataTable.refreshData();
        }else{
            dhx.alert("保存出错！");
        }
	        
    });
	
}

function initTableManager(index) {
	var signFrame = document.getElementById("paraTableManagerInfoTable");
	var rowscount = signFrame.rows.length;
	//循环删除行,从最后一行往前删除
	for (i = rowscount - 1; i > 0; i--) {
		signFrame.deleteRow(i);
	}
	if(index!=null){
		index = index-1;
		document.getElementById("rowkey").value=dataTable.userData[index].rowkey;
		document.getElementById("rowkey").readOnly="readOnly";
		document.getElementById("saveBtn").value="修改";
	}else{
		document.getElementById("rowkey").value='';
		document.getElementById("rowkey").readOnly="";
		document.getElementById("saveBtn").value="新增";
	}
	
	for ( var x = 0; x < columnparams.length; x++) {
		var row = document.createElement("tr");
		row.onclick = function() {
			if (moveParamObj != null) {
				moveParamObj.style.background = "";
			}
			moveParamObj = this;
			row.style.background = "#f5f7f8";
		};
		paramTableManagerInfoTable.tBodies[0].appendChild(row);
		for ( var i = 0; i < 4; i++) {
			var cell = document.createElement("td");
			cell.className = 'c_td';
			row.appendChild(cell);
			if (i == 0) {
				cell.innerHTML = "<div style='width: 50px;'>"
						+ columnparams[x].HB_CLUSTER_NAME + "</div>";
			}
			if (i == 1) {
				cell.innerHTML = "<div style='width: 100px;'>"
						+ columnparams[x].HB_COLUMN_NAME + "</div>";
			}
			if (i == 2) {
				cell.innerHTML = "<div style='width: 110px;white-space:normal;word-wrap:break-word;word-break:break-all'>"
						+ columnparams[x].DEFINE_EN_COLUMN_NAME + "</div>";
			}
			if (i == 3) {
				if (index!=null){
					var arr = dataTable.userData[index];
					var columnName = columnparams[x].DEFINE_EN_COLUMN_NAME;
					cell.innerHTML = "<div style='width: 310px;'><input id='row_value"
							+ x
							+ "' value='"
							+ (arr[columnName]==null?"":arr[columnName])
							+ "' type='text' class='input2' style='width:310px;'/></div>";
					}
				else
					cell.innerHTML = "<div style='width: 310px;'><input id='row_value"
							+ x
							+ "' value='' type='text' class='input2' style='width:310px;'/></div>";
			}
		}
	}
}

dhx.ready(pageInit);
