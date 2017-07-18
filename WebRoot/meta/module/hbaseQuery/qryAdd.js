/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        qryAdd.js
 *Description：
 *        用户规则管理
 *Dependent：
 *
 *Author: 王鹏坤
 *
 ********************************************************/
var paramLogicTable = null; //逻辑条件table
var paramRexTable = null;   //正则表达式条件table
var paramColumnTable = null;   //选择列table
var paramAuthorityTable = null;   //选择用户权限table
var moveParamObj = null;
var globle_dataSourceId = null;
var globle_dataSourceName = null;
var dateSourceAddress = '';
var rootZnodeName = '';
var hbaseSiteXml ="<BLOB>";
var parentZnodeName ='';
var zookeeperServers = '';
var zookeeperPort = '';
var globle_state = '';
var globle_save_userIds=null;

var globle_HBaseId = null;
var globle_HBaseName = null;
var paramArr = [];//存放列的信息
var paramUserArr = []; //存放用户访问权限
var paramRexArr = []; //存放用户访问权限
var paramLogicArr = []; //存放用户访问权限
var qryColumnIds = null; //存放选中的列的集合
var qryAuthorityIds = null;//存放选中的权限ID集合

var paramCol = [];//存放英文列名
var paramLogicData = [];//存放测试逻辑列名值
var paramRegData = [];//存放测试正则列名值
//var dataTableAll = null;
var checkedAllIds = [];


/**
 * 初始化
 */
function initData(){
    paramLogicTable = $("paraLogicTable");
    paramRexTable = $("paraRexTable");
    paramColumnTable = $("paraColumnTable");
    paramAuthorityTable = $("paraAuthorityTable");
    
    UserTypeAction.queryTypeByUser(null,function(data){
    	var paramsTD = document.getElementById("departType");
	    paramsTD.options.length = 0; 
	    paramsTD.options[0] = new Option("---请选择---","");
	    for(var m=0;m<data.length;m++){
	    	paramsTD.options[m+1] = new Option(data[m].TYPE_NAME,data[m].TYPE_ID);
	    }
	    initQryRuleData(null);
    });
    addValidation();
}

/**
 * 控制选项卡
 * @param blockDiv
 * @param a
 */
function selectDiv(blockDiv, a){
    if (blockDiv == "jbDiv") {
       document.getElementById("jbDiv").style.display = "block";
       a.parentElement.className = "selectTag";
       document.getElementById("ssDiv").style.display = "none";
       document.getElementById("ss").className = "";
    }
    if (blockDiv == "ssDiv") {
       document.getElementById("jbDiv").style.display = "none";
        document.getElementById("jb").className = "";
        document.getElementById("ssDiv").style.display = "block";
        a.parentElement.className = "selectTag";
    }
}
/**
 * 控制主选项卡
 * @param blockDiv
 * @param a
 */
function selectMainDiv(blockDiv){
    if (blockDiv == "dataSourceDiv") {
		document.getElementById("dataSourceDiv").style.display = "block";
		document.getElementById("ruleDiv").style.display = "none";
		document.getElementById("columnDiv").style.display = "none";
		document.getElementById("filterDiv").style.display = "none";
		document.getElementById("userDiv").style.display = "none";
		document.getElementById("dataSource").className = "selectTag";
		document.getElementById("rule").className = "";
		document.getElementById("column").className = "";
		document.getElementById("filter").className = "";
		document.getElementById("user").className = "";
    }
    if (blockDiv == "ruleDiv") {
		document.getElementById("dataSourceDiv").style.display = "none";
		document.getElementById("ruleDiv").style.display = "block";
		document.getElementById("columnDiv").style.display = "none";
		document.getElementById("filterDiv").style.display = "none";
		document.getElementById("userDiv").style.display = "none";
		document.getElementById("dataSource").className = "";
		document.getElementById("rule").className = "selectTag";
		document.getElementById("column").className = "";
		document.getElementById("filter").className = "";
		document.getElementById("user").className = "";
    }if (blockDiv == "columnDiv") {
        document.getElementById("dataSourceDiv").style.display = "none";
        document.getElementById("ruleDiv").style.display = "none";
        document.getElementById("columnDiv").style.display = "block";
        document.getElementById("filterDiv").style.display = "none";
        document.getElementById("userDiv").style.display = "none";
        document.getElementById("column").className = "selectTag";
        document.getElementById("dataSource").className = "";
        document.getElementById("rule").className = "";
        document.getElementById("filter").className = "";
        document.getElementById("user").className = "";
    }if (blockDiv == "filterDiv") {
        document.getElementById("dataSourceDiv").style.display = "none";
        document.getElementById("ruleDiv").style.display = "none";
        document.getElementById("columnDiv").style.display = "none";
        document.getElementById("filterDiv").style.display = "block";
        document.getElementById("userDiv").style.display = "none";
        document.getElementById("filter").className = "selectTag";
        document.getElementById("dataSource").className = "";
        document.getElementById("rule").className = "";
        document.getElementById("column").className = "";
        document.getElementById("user").className = "";
        if(dataAuthorityTable!=null){
        	globle_save_userIds = dataAuthorityTable.grid.getCheckedRows(0).split(",");
        }

    }if (blockDiv == "userDiv") {
        document.getElementById("dataSourceDiv").style.display = "none";
        document.getElementById("ruleDiv").style.display = "none";
        document.getElementById("columnDiv").style.display = "none";
        document.getElementById("filterDiv").style.display = "none";
        document.getElementById("userDiv").style.display = "block";
        document.getElementById("dataSource").className = "";
        document.getElementById("user").className = "selectTag";
        document.getElementById("rule").className = "";
        document.getElementById("column").className = "";
        document.getElementById("filter").className = "";
    }
}

function  initQryRuleData(data){
     if(qryFlag=='show'){
             $('dataSourceName').disabled = true;
             $('dateSourceAddress').disabledled = true;
             $('rootZnodeName').disabled =true;
             $('hbaseSiteXml').disabled = true;
             $('parentZnodeName').disabled =true;
             $('zookeeperServers').disabled = true;
             $('zookeeperPort').disabled = true;
             // $('parallelNum').disabled = parallelNum?parallelNum:"";
             $('state').disabled = true;
             $('ruleName').disabled = true;
             $('departType').disabled = true;
             $('hBaseName').disabled = true;
             $('qryType').disabled = true;
             $('hbaseTablePartition').disabled = true;
             $('qryParallelNum').disabled = true;
             $('qryState').disabled = true;
             $('supportSort').disabled = true;
             $('sortType').disabled = true;
             $('paginationSize').disabled = true;
             $('clientRowsBufferSize').disabled = true;
             $('defSortColumn').disabled = true;
             $('logFlag').disabled = true;
             $('logFlagDetail').disabled = true;
             $('scannerCachingSize').disabled = true;
             $('scannerReadCacheSize').disabled = true;
             $('certAuth').disabled = true;
             //document.getElementById("saveBtn").style.display = "none";
             //document.getElementById("closeBtn").style.display = "block";
             
                 HBaseDataSourceAction.queryDataSourceInfoById(qryRuleId,function(data){
            $('dataSourceId').innerText = data["DATA_SOURCE_ID"]?data["DATA_SOURCE_ID"]:"";
            $('dataSourceName').value = data["DATA_SOURCE_NAME"]?data["DATA_SOURCE_NAME"]:"";

            $('dateSourceAddress').value = data["DATA_SOURCE_ADDRESS"];
            $('rootZnodeName').value = data["ROOT_ZNODE_NAME"]?data["ROOT_ZNODE_NAME"]:"";
            $('hbaseSiteXml').value = "<BLOB>";
            $('parentZnodeName').value = data["PARENT_ZNODE_NAME"]?data["PARENT_ZNODE_NAME"]:"";
            document.getElementById('zookeeperServers').value = data["ZOOKEEPER_SERVERS"]?data["ZOOKEEPER_SERVERS"]:"";
            $('zookeeperPort').value = data["ZOOKEEPER_PORT"]?data["ZOOKEEPER_PORT"]:"";
            // $('parallelNum').value = parallelNum?parallelNum:"";
            $('state').value = data["STATE"]==0?"有效":"无效";
        });

        HBTableAction.getHBTableInfoByQryId(qryRuleId,function(data){
            $('hBaseId').value = data["HB_TABLE_ID"]?data["HB_TABLE_ID"]:"";
            $('hBaseName').value = data["HB_TABLE_NAME"]?data["HB_TABLE_NAME"]:"";
        });

        HBQryRuleAction.getHBQryRuleById(qryRuleId,function(data){
        	$('ruleName').value = data["QRY_RULE_NAME"]?data["QRY_RULE_NAME"]:"";
            $('departType').value = data["DEPART_TYPE"]?data["DEPART_TYPE"]:"";
        	$('qryType').value = data["QRY_TYPE"];
        	$('hbaseTablePartition').value = data["HBASE_TABLE_PARTITION"]?data["HBASE_TABLE_PARTITION"]:"";
            $('qryParallelNum').value = (data["PARALLEL_NUM"]==null||data["PARALLEL_NUM"]!=-1)?data["PARALLEL_NUM"]:"";
            $('qryState').value = data["STATE"];
            $('supportSort').value = data["SUPPORT_SORT"];
            $('sortType').value = data["SORT_TYPE"];
            $('paginationSize').value = (data["PAGINATION_SIZE"]==null||data["PAGINATION_SIZE"]!=-1)?data["PAGINATION_SIZE"]:"";
            $('clientRowsBufferSize').value = (data["CLIENT_ROWS_BUFFER_SIZE"]==null||data["CLIENT_ROWS_BUFFER_SIZE"]!=-1)?data["CLIENT_ROWS_BUFFER_SIZE"]:"";
            $('defSortColumn').value = data["DEF_SORT_COLUMN"]?data["DEF_SORT_COLUMN"]:"";
            $('logFlag').value = data["LOG_FLAG"];
            $('logFlagDetail').value = data["LOG_FLAG_DETAIL"];
            $('scannerCachingSize').value = (data["SCANNER_CACHING_SIZE"]==null||data["SCANNER_CACHING_SIZE"]!=-1)?data["SCANNER_CACHING_SIZE"]:"";
            $('scannerReadCacheSize').value = (data["SCANNER_READ_CACHE_SIZE"]==null||data["SCANNER_READ_CACHE_SIZE"]!=-1)?data["SCANNER_READ_CACHE_SIZE"]:"";
            $('certAuth').value = data["CERT_AUTH_FLAG"];
        });

        HBQryRuleAction.queryColumnInfoStringByQryId(qryRuleId,function(data){
            qryColumnIds = data;
            checkedAllIds = data;

        });
        AuthorityAction.queryAuthrityInfoByQryId(qryRuleId,function(data){
            qryAuthorityIds = data;
        });
        HBQryRuleAction.getRexByQryId(qryRuleId,function(data){
            for(var m=0;m<data.length;m++){
                showRex(data[m]);
            }
            //addParaRexRow(null,m);
        });
        HBQryRuleAction.getLogicByQryIdShow(qryRuleId,function(data){
            for(var m=0;m<data.length;m++){
                showLogic(data[m]);
            }
            //addParaLogicRow(null,m);
        });
     }
    if(qryFlag=="add"){
        addParaLogicRow(null,0);
        addParaRexRow(null,0);
    }
    if(qryFlag=="modify"){
        HBaseDataSourceAction.queryDataSourceInfoById(qryRuleId,function(data){
            $('dataSourceId').innerText = data["DATA_SOURCE_ID"]?data["DATA_SOURCE_ID"]:"";
            globle_dataSourceId = data["DATA_SOURCE_ID"];
            $('dataSourceName').value = data["DATA_SOURCE_NAME"]?data["DATA_SOURCE_NAME"]:"";

            $('dateSourceAddress').value = data["DATA_SOURCE_ADDRESS"];
            $('rootZnodeName').value = data["ROOT_ZNODE_NAME"]?data["ROOT_ZNODE_NAME"]:"";
            $('hbaseSiteXml').value = "<BLOB>";
            $('parentZnodeName').value = data["PARENT_ZNODE_NAME"]?data["PARENT_ZNODE_NAME"]:"";
            document.getElementById('zookeeperServers').value = data["ZOOKEEPER_SERVERS"]?data["ZOOKEEPER_SERVERS"]:"";
            $('zookeeperPort').value = data["ZOOKEEPER_PORT"]?data["ZOOKEEPER_PORT"]:"";
            // $('parallelNum').value = parallelNum?parallelNum:"";
             $('state').value = data["STATE"]==0?"有效":"无效";
        });
        HBTableAction.getHBTableInfoByQryId(qryRuleId,function(data){
        	globle_HBaseId = data["HB_TABLE_ID"]?data["HB_TABLE_ID"]:"";
            $('hBaseId').value = data["HB_TABLE_ID"]?data["HB_TABLE_ID"]:"";
            $('hBaseName').value = data["HB_TABLE_NAME"]?data["HB_TABLE_NAME"]:"";
        });

        HBQryRuleAction.getHBQryRuleById(qryRuleId,
        		 {async: false,
                 callback: function(data){
        	$('ruleName').value = data["QRY_RULE_NAME"]?data["QRY_RULE_NAME"]:"";
        	$('departType').value = data["DEPART_TYPE"]?data["DEPART_TYPE"]:"";
        	$('qryType').value = data["QRY_TYPE"];
        	$('hbaseTablePartition').value = data["HBASE_TABLE_PARTITION"]?data["HBASE_TABLE_PARTITION"]:"";
            $('qryParallelNum').value = (data["PARALLEL_NUM"]==null||data["PARALLEL_NUM"]!=-1)?data["PARALLEL_NUM"]:"";
            $('qryState').value = data["STATE"];
            $('supportSort').value = data["SUPPORT_SORT"];
            $('sortType').value = data["SORT_TYPE"];
            $('paginationSize').value = (data["PAGINATION_SIZE"]==null||data["PAGINATION_SIZE"]!=-1)?data["PAGINATION_SIZE"]:"";
            $('clientRowsBufferSize').value = (data["CLIENT_ROWS_BUFFER_SIZE"]==null||data["CLIENT_ROWS_BUFFER_SIZE"]!=-1)?data["CLIENT_ROWS_BUFFER_SIZE"]:"";
            $('defSortColumn').value = data["DEF_SORT_COLUMN"]?data["DEF_SORT_COLUMN"]:"";
            $('logFlag').value = data["LOG_FLAG"];
            $('logFlagDetail').value = data["LOG_FLAG_DETAIL"];
            $('scannerCachingSize').value = (data["SCANNER_CACHING_SIZE"]==null||data["SCANNER_CACHING_SIZE"]!=-1)?data["SCANNER_CACHING_SIZE"]:"";
            $('scannerReadCacheSize').value = (data["SCANNER_READ_CACHE_SIZE"]==null||data["SCANNER_READ_CACHE_SIZE"]!=-1)?data["SCANNER_READ_CACHE_SIZE"]:"";
            $('certAuth').value = data["CERT_AUTH_FLAG"];
        }
       });

        HBQryRuleAction.queryColumnInfoStringByQryId(qryRuleId,function(data){
            qryColumnIds = data;
            checkedAllIds = data;

        });
        AuthorityAction.queryAuthrityInfoByQryId(qryRuleId,function(data){
            qryAuthorityIds = data;
        });
        HBQryRuleAction.getRexByQryId(qryRuleId,function(data){
            for(var m=0;m<data.length;m++){
                showRex(data[m]);
            }
            addParaRexRow(null,m);
        });
        HBQryRuleAction.getLogicByQryId(qryRuleId,function(data){
            for(var m=0;m<data.length;m++){
                showLogic(data[m]);
            }
            addParaLogicRow(null,m);
        });




    }

//  addParaColumnRow(null,0);


  //addParaAuthorityRow(null,0);
    //选择数据源
    var source = document.getElementById("dataSourceName");
    var saveBtn = document.getElementById("saveBtn");
    var closeBtn = document.getElementById("closeBtn");
    var hBaseTable = document.getElementById("hBaseName");
    var nextBtn1 = document.getElementById("nextBtn1");
    var nextBtn2 = document.getElementById("nextBtn2");
    var nextBtn3 = document.getElementById("nextBtn3");
    var nextBtn4 = document.getElementById("nextBtn4");
    var preBtn2 = document.getElementById("preBtn2");
    var preBtn3 = document.getElementById("preBtn3");
    var preBtn4 = document.getElementById("preBtn4");
    var preBtn5 = document.getElementById("preBtn5");
    nextBtn1.onclick = function(){
    	if($('ruleName').value==null||$('ruleName').value==""){
            dhx.alert("请输入规则名称!");
            return;
        }
    	if($('departType').value==null||$('departType').value==""){
            dhx.alert("请选择业务类型!");
            return;
        }
    	if($('dataSourceName').value==null||$('dataSourceName').value==""){
            dhx.alert("请选择数据源!");
            return;
        }
    	selectMainDiv("ruleDiv");
    	};
    nextBtn2.onclick = function(){
        if($('hBaseId').value==null||$('hBaseId').value==""){
            dhx.alert("请先选择HBase表!");
            return;
        }
        if(!(dhtmlxValidation.validate("ruleForm")))return;
        dataColumnInit();
        selectMainDiv("columnDiv");
    };
    nextBtn3.onclick = function(){
    //var i = dataTable.grid.getCheckedRows(0);
	//
	checkedAllIds= [];
    var allIds=dataTable.grid.getAllRowIds().split(",");
    var checkIds = dataTable.grid.getCheckedRows(0).split(",");
    for(var i=0;i<allIds.length;i++){
    	if(in_array(checkIds,allIds[i])!=-1){
    		if(in_array(checkedAllIds,allIds[i])==-1)
    		{
    			checkedAllIds.push(allIds[i]);
    		}
    	}else{
			if(in_array(checkedAllIds,allIds[i])!=-1){ 
			 removeArr(checkedAllIds,in_array(checkedAllIds,allIds[i]));   	
			}
    	}
    }
    if(checkedAllIds.toString()==""){
    	dhx.alert("请选择需要的列！");
    	return;
    }
    selectMainDiv("filterDiv"); 
    };
    nextBtn4.onclick = function(){
		//初始数据表格  初始之后dataTable才会被实例化
	    dataAuthorityInfoTableInit();
        selectMainDiv("userDiv");
        if (qryFlag=='show'){
        	document.getElementById("saveBtn").style.display = "none";
        	
        }else{
           document.getElementById("closeBtn").style.display = "none";
        }
    };
    closeBtn.onclick = function(){
    	if(window.parent && window.parent.closeTab)
                    window.parent.closeTab(menuStr);
                else
                    window.close();
     };
    preBtn2.onclick = function(){selectMainDiv("dataSourceDiv"); };
    preBtn3.onclick = function(){selectMainDiv("ruleDiv"); };
    preBtn4.onclick = function(){selectMainDiv("columnDiv"); };
    preBtn5.onclick = function(){selectMainDiv("filterDiv"); };
    saveBtn.onclick = function(){saveRuleTable(); };
    source.onclick  = function(){openDataSourceTableWin(this); };
    hBaseTable.onclick = function(){openHBaseTableWin(this); };
    $('hbaseTablePartition').onfocus = function(){inputtip($('hbaseTablePartition'), 0); };
    $('hbaseTablePartition').onblur = function(){inputtip($('hbaseTablePartition'), 1); };
}


function addValidation(){
 	 var validationV = [
        {target:"qryParallelNum" ,rule:"Num,MaxLength[9]"},
        {target:"paginationSize" ,rule:"Num,MaxLength[9]"},
        {target:"clientRowsBufferSize" ,rule:"Num,MaxLength[9]"},
        {target:"scannerCachingSize" ,rule:"Num,MaxLength[9]"},
        {target:"scannerReadCacheSize" ,rule:"Num,MaxLength[9]"}
    ];
    dhtmlxValidation.addValidation($("ruleForm"),validationV);
 
}


var hbid = null;
function dataColumnInit(){
	if(dataTable==null){
		dataTableInit(); //初始数据表格  初始之后dataTable才会被实例化
    }
	if(hbid!=$('hBaseId').value){
		hbid = $('hBaseId').value;
		dataTable.setReFreshCall(queryData); //设置表格刷新的回调方法，即实际查询数据的方法
		dataTable.refreshData();
   	}
}

function dataAuthorityInfoTableInit(){
    dataAuthorityTableInit();
    dataAuthorityTable.setReFreshCall(queryAuthorityData); //设置表格刷新的回调方法，即实际查询数据的方法
    dataAuthorityTable.refreshData();
}
/***********************************加载逻辑条件开始************************************************/

/**
 * 查看逻辑条件
 * @param paramData
 */
function showLogic(paramData){
     var rowIndex = paramData.ORDER_ID;
    var row = document.createElement("tr");
    paramLogicTable.tBodies[0].appendChild(row);
    for(var i = 0 ;i<3;i++){
        var cell= document.createElement("td");
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
            if(qryFlag=="show"){
            	cell.innerHTML ="<div style='width: 1000px;'>"+paramData.EXPRE_CONDITION+"</div>";
            }else{
            	cell.innerHTML ="<div style='width: 1000px;'><input id='paramLogic"+rowIndex+"' value='"+paramData.EXPRE_CONDITION.replace(/(&apos;)/g,"&#39;")+"' onkeyup='addParaLogicRow(this,"+rowIndex+")' style='width:50%;' /></div>";
        	}
        }

        if(i==2){
            if(qryFlag=="show"){
                cell.innerHTML ="<div>&nbsp;&nbsp;</div>";
            }
            if(qryFlag=="modify"){
                var logic = "<a href='#' onclick='deleteParamRow(this,"+rowIndex+")'>删除</a>";
                logic += "&nbsp;&nbsp;<a href='#' onclick='testLogicCondition(this,"+rowIndex+")'>测试</a>";
                cell.innerHTML = logic;
                
            }
        }

    }
    row._rowIndex=rowIndex;
}


/**
 * 添加一行逻辑条件
 */
function addParaLogicRow(obj,rowIndex){
        rowIndex = rowIndex+1;
        if(obj!=null){
            var nextTr = obj.parentNode.parentNode.parentNode.nextSibling;
            if(nextTr==null){
                creartLogicParaRow(rowIndex);
            }
            var currTr = obj.parentNode.parentNode.parentNode;
            if(currTr.lastChild.innerHTML=="<DIV>&nbsp;&nbsp;</DIV>"||currTr.lastChild.innerHTML=="<div>&nbsp;&nbsp;</div>"){
                currTr.lastChild.innerHTML="<a href='#' onclick='deleteParamRow(this,"+rowIndex+")'>删除</a>";
            	currTr.lastChild.innerHTML +="&nbsp;&nbsp;<a href='#' onclick='testLogicCondition(this,"+(rowIndex-1)+")'>测试</a>";
            }
        }else{
            creartLogicParaRow(rowIndex);
        }
}

function creartLogicParaRow(rowIndex){
    var row = document.createElement("tr");
    row.onclick = function(){
        if(moveParamObj != null){
            moveParamObj.style.background = "";
        }
        moveParamObj=this
        row.style.background = "#f5f7f8";
    }
    paramLogicTable.tBodies[0].appendChild(row);
    for(var i = 0 ;i<3;i++){
        var cell= document.createElement("td");
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
            cell.innerHTML ="<div style='width: 1000px;'><input id='paramLogic"+rowIndex+"' value='' onkeyup='addParaLogicRow(this,"+rowIndex+")' style='width:50%;' /></div>";
        }
        if(i==2){
            cell.className = 'c_td_end';
            cell.innerHTML= "<div>&nbsp;&nbsp;</div>";
        }
    }
    dhtmlxValidation.addValidation(row,[
        {target:"paramLogic" + rowIndex,rule:"NotEmpty,MaxLength[64]"}
    ]);
    row._rowIndex=rowIndex;
}

/**
 * 添加一行字段列名
 */
function addColumnRow(obj,rowIndex){
        rowIndex = rowIndex+1;
        if(obj!=null){
            var nextTr = obj.parentNode.parentNode.parentNode.nextSibling;
            if(nextTr==null){
                creartColumnRow(rowIndex);
            }
            var currTr = obj.parentNode.parentNode.parentNode;
            if(currTr.lastChild.innerHTML=="<DIV>&nbsp;&nbsp;</DIV>"||currTr.lastChild.innerHTML=="<div>&nbsp;&nbsp;</div>"){
                currTr.lastChild.innerHTML="<a href='#' onclick='deleteColumnRow(this,"+rowIndex+")'>删除</a>";
            }
        }else{
            creartColumnRow(rowIndex);
        }
}

function creartColumnRow(rowIndex){
    var row = document.createElement("tr");
    row.onclick = function(){
        if(moveParamObj != null){
            moveParamObj.style.background = "";
        }
        moveParamObj=this
        row.style.background = "#f5f7f8";
    }
    $("testColumnFiled").tBodies[0].appendChild(row);
    for(var i = 0 ;i<4;i++){
        var cell= document.createElement("td");
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
            cell.innerHTML ="<div style='width: 200px;'><select id='columnLogicName"+rowIndex+"' value=''   style='width:50%;' ><option value=''>--请选择--</option></select></div>";
           
        }
        if(i==2){
        	cell.innerHTML ="<div style='width: 200px;'><input id='columnLogicValue"+rowIndex+"' value='' onkeyup='addColumnRow(this,"+rowIndex+")'  style='width:50%;' /></div>";
        }
        if(i==3){
            cell.className = 'c_td_end';
            cell.innerHTML= "<div>&nbsp;&nbsp;</div>";
        }
    }
   // var temp = dataTable.grid.getCheckedRows(0);
            if(checkedAllIds.toString()!=""){
            //	var checkedId=dataTable.grid.getCheckedRows(0).split(",");//获得提取被选中的一行的ID
            	var columnNameTemp = document.getElementById("columnLogicName"+rowIndex);
            	 var ki=1;
  			  for(var m=0;m<checkedAllIds.length;m++){
  			  	if(checkedAllIds[m]!=""){
           		  var colName = dataTable.getUserData(checkedAllIds[m],"DEFINE_EN_COLUMN_NAME");
           		  var arrColName = colName.split(",");
           		  for(var k=0;k<arrColName.length;k++){
           		  	 columnNameTemp.options[ki] = new Option(arrColName[k],checkedAllIds[m]);
           		  	 ki++;
           		  }
           		  }
    			}
            }
   
    row._rowIndex=rowIndex;
}


//删除一行测试列名
function deleteColumnRow(obj,rowIndex){
    var tr=obj.parentNode.parentNode;
    var table =tr.parentNode;
    table.removeChild(tr);
}


var logicWindows = null;
var rowIndexLogic = null;
function testLogicCondition(obj,rowIndex){
    
	var exp = document.getElementById("paramLogic"+rowIndex).value;
	document.getElementById("conditionExp").value = exp;
	document.getElementById("rowIndexLogic").value = rowIndex;
	if(!logicWindows){
		//增加列
		addColumnRow(null,0);
		
	    var dhxWindow = new dhtmlXWindows();
	    var winsize = Tools.propWidthDycSize(10, 20, 20, 16)
	    dhxWindow.createWindow("logicWindows", 0, 0, 250, 280);
	    logicWindows = dhxWindow.window("logicWindows");
	    logicWindows.stick();
	    logicWindows.setModal(true);
	    logicWindows.setDimension(winsize.width, winsize.height);
	    logicWindows.button("minmax1").hide();
	    logicWindows.button("park").hide();
	    logicWindows.button("stick").hide();
	    logicWindows.button("sticked").hide();
	    logicWindows.center();
	    logicWindows.denyResize();
	    logicWindows.denyPark();
	    logicWindows.setText("测试逻辑条件");
	    logicWindows.keepInViewport(true);
	    //添加查询内容
	    var layout = new dhtmlXLayoutObject(logicWindows, "1C");
	    layout.cells("a").setHeight(50);
	    layout.cells("a").fixSize(false, true);
	    layout.cells("a").firstChild.style.height = (layout.cells("a").firstChild.offsetHeight + 5) + "px";
	    layout.cells("a").hideHeader();
	    layout.cells("a").attachObject("logicColumnDiv");

        layout.hideConcentrate();
        layout.hideSpliter();//移除分界边框
        
        //窗口关闭事件
        logicWindows.attachEvent("onClose", function () {
        	logicWindows.hide();
            logicWindows.setModal(false);
            return false;
        })
        
	    var saveLogic    = document.getElementById("saveLogic");
	    var closeLogic   = document.getElementById("closeLogic");
	    var testLogic  = document.getElementById("testLogic");
	
	    //关闭按钮事件
	    attachObjEvent(closeLogic,"onclick",function(){
	        logicWindows.hide();
	        logicWindows.setModal(false);
	        return false;
	    });
	    
	    //var testLogicData ={};
	    //测试逻辑语句
	    attachObjEvent(testLogic,"onclick",function(){
	    	//获取逻辑表达式
	    	var conditionExp = document.getElementById("conditionExp").value;

		//	HBQryRuleAction.isColumn(testLogicData,conditionExp, function(rsCol){
		//		if(rsCol){
					//回显逻辑表达式
				//	document.getElementById("paramLogic"+rowIndex).value= conditionExp;
					
				    //列名不能重复
				    for(var i=1;i<$("testColumnFiled").rows.length;i++){
				    	var index = $("testColumnFiled").rows[i].cells[0].innerHTML;
				    	var tempName = $("columnLogicName"+index).value;
				    	var objT = document.getElementById("columnLogicName"+index); //定位id
					  	var selectIndexT = objT.selectedIndex; // 选中索引
                        var textT = objT.options[selectIndexT].text; // 选中文本
				    	for(var j=1;j<$("testColumnFiled").rows.length;j++){
				    		if(i!=j){
				    			var indexTemp = $("testColumnFiled").rows[j].cells[0].innerHTML;
				    	    	//var tempNameCom = $("columnLogicName"+indexTemp).value;
				    	    	var obj = document.getElementById("columnLogicName"+indexTemp); //定位id
					  		    var selectIndex = obj.selectedIndex; // 选中索引
                                var text = obj.options[selectIndex].text; // 选中文本
				    	    	if(text==textT&&tempName!=""){
				    	    		dhx.alert("请选择不同的字段列名！");
				    	    		return;
				    	    	}
				    		}
				    	}
				    }
				
				
				
				
					var paramLogicDataCon = [];
					//获取测试列名值
				    for(var i =1 ;i<$("testColumnFiled").rows.length;i++){
				        var index = $("testColumnFiled").rows[i].cells[0].innerHTML;
				        var testParamData = {};
				        testParamData.ORDER_ID = i;
				        var obj = document.getElementById("columnLogicName"+index); //定位id
					    var selectIndex = obj.selectedIndex; // 选中索引
                        var text = obj.options[selectIndex].text; // 选中文本
				        		
				        testParamData.TEST_COLUMN_NAME = text;
				        var logicTemp = document.getElementById("columnLogicValue"+index);
				        
				        testParamData.TEST_COLUMN_VALUE = document.getElementById("columnLogicValue"+index).value;
				         if(obj.value!=""){
				            paramLogicDataCon.push(testParamData);
				        }
				       
				    }
				    
				    //testLogicData.testParamData = paramLogicData;
	    			dhx.showProgress("请求数据中");
					HBQryRuleAction.validataConditionPre(conditionExp,paramLogicDataCon, function(rs){
				        dhx.closeProgress();
				        if(rs) dhx.alert(rs);
						});
					});

	    
	    
    	
    	
	   /** var checkedId = dataTable.grid.getCheckedRows(0).split(",");//获得提取被选中的一行的ID
	    for(var m=0; m<checkedId.length; m++){
	    	var columnName = dataTable.getUserData(checkedId[m],"DEFINE_EN_COLUMN_NAME");
	        var columnNameInfo = {};
	       	columnNameInfo.COLUMN_NAME = columnName;
			paramCol.push(columnNameInfo);
	    }
	    testLogicData.columnNameInfo = paramCol;
    	**/
	    
	  	//按钮保存事件
	    attachObjEvent(saveLogic,"onclick",function(){
			var conditionExp = document.getElementById("conditionExp").value;
					var rowIndextemp = document.getElementById("rowIndexLogic").value;
					//回显逻辑表达式
					document.getElementById("paramLogic"+rowIndextemp).value= conditionExp;
					logicWindows.hide();
				    logicWindows.setModal(false);
				          
	    });
        
	}else{
	//var temp = dataTable.grid.getCheckedRows(0);
	
	 for(var i=1;i<$("testColumnFiled").rows.length;i++){
		var index = $("testColumnFiled").rows[i].cells[0].innerHTML;
		var obj = document.getElementById("columnLogicName"+index); //定位id
		obj.options.length = 1;
		if(checkedAllIds.toString()!=""){
            //var checkedId=dataTable.grid.getCheckedRows(0).split(",");//获得提取被选中的一行的ID
            var columnNameTemp = document.getElementById("columnLogicName"+index);
            var ki=1;
  			 for(var m=0;m<checkedAllIds.length;m++){
           		 var colName = dataTable.getUserData(checkedAllIds[m],"DEFINE_EN_COLUMN_NAME");
           		  var arrColName = colName.split(",");
           		  for(var k=0;k<arrColName.length;k++){
           		  	 columnNameTemp.options[ki] = new Option(arrColName[k],checkedAllIds[m]);
           		  	 ki++;
           		  }
    			}
           	 }
		}
	    logicWindows.setModal(true);
	    logicWindows.show();
	}
}

/*************************************加载逻辑条件结束***************************************************/

/***********************************加载正则表达式条件开始************************************************/


/**
 * 查看正则表达式
 * @param obj
 * @param rowIndex
 */

function showRex(paramData){
    var rowIndex = paramData.ORDER_ID;
    var row = document.createElement("tr");
    paramRexTable.tBodies[0].appendChild(row);
    for(var i = 0 ;i<5;i++){
        var cell= document.createElement("td");
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
        	if(qryFlag=="show"){
            	cell.innerHTML ="<div style='width: 200px;'>"+paramData.MATCH_CONDITION+"</div>";
	       	}else{
            	cell.innerHTML ="<div style='width: 200px;'><input id='paramRexSentence"+rowIndex+"' value='"+paramData.MATCH_CONDITION+"' onkeyup='addParaRexRow(this,"+rowIndex+")'  style='width:80%;' /></div>";
        	}
        }
        if(i==2){
        	var exepeCondition = paramData.EXPRE_CONDITION?paramData.EXPRE_CONDITION:"";
        	if(exepeCondition==null||exepeCondition=="null"){
        		exepeCondition="";
        	}
        	if(qryFlag=="show"){
            	cell.innerHTML ="<div style='width: 200px;'>"+exepeCondition+"</div>";
        	}else{
            	cell.innerHTML ="<div style='width: 200px;'><input id='paramRexData"+rowIndex+"' value='"+exepeCondition+"'  style='width:80%;' /></div>";
        	}
        }
        if(i==3){
        	if(qryFlag=="show"){
        		if(paramData.PATTERN_TYPE==0){
	            	cell.innerHTML ="<div style='width: 200px;'>匹配条件保留</div>";
	        	}else{
	        		cell.innerHTML ="<div style='width: 200px;'>不匹配条件保留</div>";
	        	}
        	}else{
	        	if(paramData.PATTERN_TYPE==0){
	            	cell.innerHTML ="<div style='width: 200px;'><select id='paramRexSelect"+rowIndex+"'><option value='0'>匹配条件保留</option><option value='1'>不匹配条件保留</option></select></div>";
	        	}else{
	        		cell.innerHTML ="<div style='width: 200px;'><select id='paramRexSelect"+rowIndex+"'><option value='0'>匹配条件保留</option><option value='1' selected='selected'>不匹配条件保留</option></select></div>";
	        	}
        	}
        }
        if(i==4){
            if(qryFlag=="show"){
                cell.innerHTML ="<div>&nbsp;&nbsp;</div>";
            }
            if(qryFlag=="modify"){
                var rex = "<a href='#' onclick='deleteParamRow(this,"+rowIndex+")'>删除</a>";
                rex += "&nbsp;&nbsp;<a href='#' onclick='testRegExpCondition(this,"+rowIndex+")'>测试</a>";
                cell.innerHTML += rex;
            }
        }

    }
    row._rowIndex=rowIndex;
}

/**
 * 添加一行正则表达式条件
 */
    function addParaRexRow(obj,rowIndex){
    rowIndex = rowIndex+1;
    if(obj!=null){
        var nextTr = obj.parentNode.parentNode.parentNode.nextSibling;
        if(nextTr==null){
            creartRexParaRow(rowIndex);
        }
        var currTr = obj.parentNode.parentNode.parentNode;
        if(currTr.lastChild.innerHTML=="<DIV>&nbsp;&nbsp;</DIV>"||currTr.lastChild.innerHTML=="<div>&nbsp;&nbsp;</div>"){
            currTr.lastChild.innerHTML="<a href='#' onclick='deleteParamRow(this,"+rowIndex+")'>删除</a>";
            currTr.lastChild.innerHTML +="&nbsp;&nbsp;<a href='#' onclick='testRegExpCondition(this,"+(rowIndex-1)+")'>测试</a>";
        }
    }else{
        creartRexParaRow(rowIndex);
    }
}

function creartRexParaRow(rowIndex){
    var row = document.createElement("tr");
    row.onclick = function(){
        if(moveParamObj != null){
            moveParamObj.style.background = "";
        }
        moveParamObj=this
        row.style.background = "#f5f7f8";
    }
    paramRexTable.tBodies[0].appendChild(row);
    for(var i = 0 ;i<5;i++){
        var cell= document.createElement("td");
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
            cell.innerHTML ="<div style='width: 200px;'><input id='paramRexSentence"+rowIndex+"' value='' onkeyup='addParaRexRow(this,"+rowIndex+")' style='width:80%;' /></div>";
        }
        if(i==2){
            cell.innerHTML ="<div style='width: 200px;'><input id='paramRexData"+rowIndex+"' value='' style='width:80%;' /></div>";
        }
        if(i==3){
            cell.innerHTML ="<div style='width: 200px;'><select id='paramRexSelect"+rowIndex+"'><option value='0'>匹配条件保留</option><option value='1'>不匹配条件保留</option></select></div>";
        }
        if(i==4){
            cell.className = 'c_td_end';
            cell.innerHTML= "<div>&nbsp;&nbsp;</div>";
        }
    }
    dhtmlxValidation.addValidation(row,[
        {target:"paramRexSentence" + rowIndex,rule:"NotEmpty,MaxLength[32]"}
    ]);
    row._rowIndex=rowIndex;
}



/**
 * 添加一行字段列名
 */
function addColumnRow2(obj,rowIndex){
        rowIndex = rowIndex+1;
        if(obj!=null){
            var nextTr = obj.parentNode.parentNode.parentNode.nextSibling;
            if(nextTr==null){
                creartColumnRow2(rowIndex);
            }
            var currTr = obj.parentNode.parentNode.parentNode;
            if(currTr.lastChild.innerHTML=="<DIV>&nbsp;&nbsp;</DIV>"||currTr.lastChild.innerHTML=="<div>&nbsp;&nbsp;</div>"){
                currTr.lastChild.innerHTML="<a href='#' onclick='deleteColumnRow(this,"+rowIndex+")'>删除</a>";
            }
        }else{
            creartColumnRow2(rowIndex);
        }
}

function creartColumnRow2(rowIndex){
    var row = document.createElement("tr");
    row.onclick = function(){
        if(moveParamObj != null){
            moveParamObj.style.background = "";
        }
        moveParamObj=this
        row.style.background = "#f5f7f8";
    }
    $("testColumnFiled2").tBodies[0].appendChild(row);
    for(var i = 0 ;i<4;i++){
        var cell= document.createElement("td");
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
            cell.innerHTML ="<div style='width: 200px;'><select id='columnRexName"+rowIndex+"' value=''   style='width:50%;' ><option value=''>--请选择--</option></select></div>";
            //var temp = dataTable.grid.getCheckedRows(0);
            if(checkedAllIds.toString()!=""){
            	//var checkedId=dataTable.grid.getCheckedRows(0).split(",");//获得提取被选中的一行的ID
            	var columnNameTemp = document.getElementById("columnRexName"+rowIndex);
  			  var ki = 1;
  			  for(var m=0;m<checkedAllIds.length;m++){
           		  var colName = dataTable.getUserData(checkedAllIds[m],"DEFINE_EN_COLUMN_NAME");
           		  	var arrColName = colName.split(",");
           		  for(var k=0;k<arrColName.length;k++){
           		  	 columnNameTemp.options[ki] = new Option(arrColName[k],checkedAllIds[m]);
           		  	 ki++;
           		  }
    			}
            }
        }
        if(i==2){
        	cell.innerHTML ="<div style='width: 200px;'><input id='columnRexValue"+rowIndex+"' value='' onkeyup='addColumnRow2(this,"+rowIndex+")'  style='width:50%;' /></div>";
        }
        if(i==3){
            cell.className = 'c_td_end';
            cell.innerHTML= "<div>&nbsp;&nbsp;</div>";
        }
        
        
    }
    
    row._rowIndex=rowIndex;
}



var regExpWindows = null;
function testRegExpCondition(obj,rowIndex){
    document.getElementById("rowIndexRex").value = rowIndex;
	var regExpState = document.getElementById("paramRexSentence"+rowIndex).value;
	document.getElementById("regExpState").value = regExpState;
	var matchState = document.getElementById("paramRexData"+rowIndex).value;
	document.getElementById("matchState").value = matchState;
	var patternType = document.getElementById("paramRexSelect"+rowIndex).value;	
	document.getElementById("patternType").value = patternType;
	if(!regExpWindows){
		//增加列
		addColumnRow2(null,0);
		
	    var dhxWindow = new dhtmlXWindows();
	    var winsize = Tools.propWidthDycSize(10, 20, 10, 16)
	    dhxWindow.createWindow("regExpWindows", 0, 0, 250, 280);
	    regExpWindows = dhxWindow.window("regExpWindows");
	    regExpWindows.stick();
	    regExpWindows.setModal(true);
	    regExpWindows.setDimension(winsize.width, winsize.height);
	    regExpWindows.button("minmax1").hide();
	    regExpWindows.button("park").hide();
	    regExpWindows.button("stick").hide();
	    regExpWindows.button("sticked").hide();
	    regExpWindows.center();
	    regExpWindows.denyResize();
	    regExpWindows.denyPark();
	    regExpWindows.setText("测试正则表达式");
	    regExpWindows.keepInViewport(true);
	    //添加查询内容
	    var layout = new dhtmlXLayoutObject(regExpWindows, "1C");
	    layout.cells("a").setHeight(50);
	    layout.cells("a").fixSize(false, true);
	    layout.cells("a").firstChild.style.height = (layout.cells("a").firstChild.offsetHeight + 5) + "px";
	    layout.cells("a").hideHeader();
	    layout.cells("a").attachObject("regExpColumnDiv");

        layout.hideConcentrate();
        layout.hideSpliter();//移除分界边框
        
        //窗口关闭事件
        regExpWindows.attachEvent("onClose", function () {
        	regExpWindows.hide();
            regExpWindows.setModal(false);
            return false;
        })
        
	    var saveBtn    = document.getElementById("saveReg");
	    var closeBtn   = document.getElementById("closeReg");
	    var testReg = document.getElementById("testReg");
	
	    //关闭按钮事件
	    attachObjEvent(closeBtn,"onclick",function(){
	        regExpWindows.hide();
	        regExpWindows.setModal(false);
	        return false;
	    });
	    
	  	//按钮测试事件
	    attachObjEvent(testReg,"onclick",function(){
			//获取正则表达式
	    	var regExpState = document.getElementById("regExpState").value;
	    	var matchState = document.getElementById("matchState").value;
	    	var patternType = document.getElementById("patternType").value;
	    	
	    	
	    	
	    	//列名不能重复
				    for(var i=1;i<$("testColumnFiled2").rows.length;i++){
				    	var index = $("testColumnFiled2").rows[i].cells[0].innerHTML;
				    	var tempName = $("columnRexName"+index).value;
				    	var objT = document.getElementById("columnRexName"+index); //定位id
					  	var selectIndexT = objT.selectedIndex; // 选中索引
                        var textT = objT.options[selectIndexT].text; // 选中文本
				    	for(var j=1;j<$("testColumnFiled2").rows.length;j++){
				    		if(i!=j){
				    			var indexTemp = $("testColumnFiled2").rows[j].cells[0].innerHTML;
				    	    	//var tempNameCom = $("columnLogicName"+indexTemp).value;
				    	    	var obj = document.getElementById("columnRexName"+indexTemp); //定位id
					  		    var selectIndex = obj.selectedIndex; // 选中索引
                                var text = obj.options[selectIndex].text; // 选中文本
				    	    	if(text==textT&&tempName!=""){
				    	    		dhx.alert("请选择不同的字段列名！");
				    	    		return;
				    	    	}
				    		}
				    	}
				    }
	    	
	    	
	    	
			//获取测试列名值
		    for(var i =1 ;i<$("testColumnFiled2").rows.length;i++){
		        var index = $("testColumnFiled2").rows[i].cells[0].innerHTML;
		        var testParamData = {}
		        testParamData.ORDER_ID = i;
		        var obj = document.getElementById("columnRexName"+index); //定位id
			    var indexSelect = obj.selectedIndex; // 选中索引
                var text = obj.options[indexSelect].text; // 选中文本
		        testParamData.TEST_COLUMN_NAME = text;
		        testParamData.TEST_COLUMN_VALUE = document.getElementById("columnRexValue"+index).value;
		        if(obj.value!=""){
		            paramRegData.push(testParamData);
		        }
		        
		    }
			dhx.showProgress("请求数据中");
			HBQryRuleAction.validataPatternConditionPre(regExpState,matchState,patternType,paramRegData, function(rs){
		        dhx.closeProgress();
		        if(rs){
		            dhx.alert(rs);
		            return;
		        }
		});	
	    });
	    	//按钮保存事件
	    attachObjEvent(saveBtn,"onclick",function(){
	        var rowIndexTemp = document.getElementById("rowIndexRex").value;
			var regExpState = document.getElementById("regExpState").value;
	    	var matchState = document.getElementById("matchState").value;
			document.getElementById("paramRexSentence"+rowIndexTemp).value= regExpState;
			document.getElementById("paramRexData"+rowIndexTemp).value= matchState; 
			
			regExpWindows.hide();
			regExpWindows.setModal(false);
				            
	    });
        
	}else{
	//var temp = dataTable.grid.getCheckedRows(0);
	 for(var i=1;i<$("testColumnFiled2").rows.length;i++){
				    	var index = $("testColumnFiled2").rows[i].cells[0].innerHTML;
				    	var obj = document.getElementById("columnRexName"+index); //定位id
				    	obj.options.length = 1;
		if(checkedAllIds.toString()!=""){
            //var checkedId=dataTable.grid.getCheckedRows(0).split(",");//获得提取被选中的一行的ID
            var ki =1;
            var columnNameTemp = document.getElementById("columnRexName"+index);
  			 for(var m=0;m<checkedAllIds.length;m++){
           		 var colName = dataTable.getUserData(checkedAllIds[m],"DEFINE_EN_COLUMN_NAME");
           		 var arrColName = colName.split(",");
           		  for(var k=0;k<arrColName.length;k++){
           		  	 columnNameTemp.options[ki] = new Option(arrColName[k],checkedAllIds[m]);
           		  	 ki++;
           		  }
    			}
           	 }
		}
	    regExpWindows.setModal(true);
	    regExpWindows.show();
	}
}


/*****************************************加载正则表达式条件结束****************************************************************/

/*****************************************加载用户列开始**********************************************************************/




var dataTable = null;
/**
 * 初始需要选择的列表格
 * @param mode 操作模式 0：多选，1单选
 */
var tabledata = null;
var ckxzse = 0;
var selectColumnMethodArray = new Array();
function dataTableInit(){
	var ksdw = document.getElementById("ksdw");
	ksdw.onclick = function(){
		var en_name = document.getElementById("en_name").value;
	    for(var i =0 ;i<dataTable.grid.getRowsNum();i++){
	        var text = dataTable.grid.cellByIndex(i,3).getValue();
	        if(en_name==text){
				dataTable.grid.selectRow(i);
			}
	    }
	};
	var ckxz = document.getElementById("ckxz");
	ckxz.onclick = function(){
		if(ckxzse==0){
			checkedAllIds=[];
			//tabledata = dataTable.grid.getUserData();
			var idArray = new Array();
		    for(var i =0 ;i<dataTable.grid.getRowsNum();i++){
		        var text = dataTable.grid.cellByIndex(i,0);
		        if(!text.isChecked()){
		        	idArray.push(dataTable.grid.getRowId(i));
				}else{
					checkedAllIds.push(dataTable.grid.getRowId(i));
				}
		    }
		    for(var i =0;i<idArray.length;i++){
		    	dataTable.grid.deleteRow(idArray[i]);
		    }
		    ckxzse=1;
	    }else{

			var idArray = new Array();
		    for(var i =0 ;i<dataTable.grid.getRowsNum();i++){
		        var text = dataTable.grid.cellByIndex(i,0);
		        if(!text.isChecked()){
		        	idArray.push(dataTable.grid.getRowId(i));
				}
		    }
	    	dataTable.bindData(tabledata,0);
	    	ckxzse=0;
	    	//setColumnMethodValue();// 设置列的统计方法.
	    	
		    for(var i =0;i<idArray.length;i++){
		    	dataTable.grid.cellById(idArray[i],0).setValue(0);
		    }
	    	//setColumnMethodValue();// 设置列的统计方法.
		    
	    	for ( var i = 0; i < tabledata.length; i++) {// 注册选中监听
	    		columnMethodListen(tabledata[i].COLUMN_ID);
	    	}
	    }
	};
    dataTable = new meta.ui.DataTable("tableSelectContent");//第二个参数表示是否是表格树
    dataTable.setColumns({
    	COLUMN_ID:"{#checkBox}",
    	COLUMN_IDS:"列ID",
        DEFINE_CLUSTER_NAME:"分类别名",
        DEFINE_EN_COLUMN_NAME:"英文名称",
        DEFINE_CH_COLUMN_NAME:"中文名称",
        STATISTICS_METHOD:"统计方法",
        STATISTICS_FLAG:"统计阶段"
    },"COLUMN_ID,COLUMN_IDS,DEFINE_CLUSTER_NAME,DEFINE_EN_COLUMN_NAME,DEFINE_CH_COLUMN_NAME,STATISTICS_METHOD,STATISTICS_FLAG");
    dataTable.setRowIdForField("COLUMN_ID");
    dataTable.setPaging(false);//分页
   
    dataTable.setSorting(true,{
        DEFINE_CLUSTER_NAME:"asc",
        DEFINE_EN_COLUMN_NAME:"asc",
        DEFINE_CH_COLUMN_NAME:"asc"
    });
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("2,8,20,20,20,15,15");
    dataTable.grid.enableStableSorting(false);
    dataTable.setGridColumnCfg(0,{align:"center",type:"ch"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    dataTable.setGridColumnCfg(5,{align:"center"});
    dataTable.setGridColumnCfg(6,{align:"center"});
    
    dataTable.grid.enableSelectCheckedBoxCheck("1");// 添加行点击事件
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
        if(colId=="COLUMN_ID"){
            if(checkedAllIds!=null){
                for(var m=0;m<checkedAllIds.length;m++){
                    if(checkedAllIds[m]==data[cid]){
                        return 1;
                        break;
                    }
                }
            }
            return 0;
        }
        
    	if(colId=="STATISTICS_METHOD"){
    		var methodIndex = data[5];
    		var mtthod = "<div style='width: 100%;'><select style='width:100%' id='"+ data[0] +"'>"+
    		"<option value='-1'>--请选择--</option>";
    		if (methodIndex==1){
    			mtthod += "<option value='1' selected='selected'>SUM</option>";
    		}else{
    			mtthod += "<option value='1'>SUM</option>";
    		}
    		
    		if (methodIndex==2){
    			mtthod += "<option value='2' selected='selected'>AVG</option>";
    		}else{
    			mtthod += "<option value='2'>AVG</option>";
    		}
    		
    		if (methodIndex==3){
    			mtthod += "<option value='3' selected='selected'>MAX</option>";
    		}else{
    			mtthod += "<option value='3'>MAX</option>";
    		}
    		
    		if (methodIndex==4){
    			mtthod += "<option value='4' selected='selected'>MIN</option>";
    		}else{
    			mtthod += "<option value='4'>MIN</option>";
    		}
    		
//    		if (methodIndex==5){
//    			mtthod += "<option value='5' selected='selected'>COUNT</option>";
//    		}else{
//    			mtthod += "<option value='5'>COUNT</option>";
//    		}
    		
    		mtthod += "</select></div>";
    		
    		if (methodIndex==5 || methodIndex==4 || methodIndex==3 || methodIndex==2 || methodIndex==1){
    			pushColumnMethodValue(data[0], methodIndex);
    		}
    		
    		return mtthod;
    	}
    	if(colId=="STATISTICS_FLAG"){
    		var flagIndex = data[cid];
    		var mtthod = "<div style='width: 100%;'><select style='width:100%' id='flag"+ data[0] +"'>"+
    		"<option value='-1'>--请选择--</option>";
    		if (flagIndex==0){
    			mtthod += "<option value='0' selected='selected'>过滤前统计</option>";
    		}else{
    			mtthod += "<option value='0'>过滤前统计</option>";
    		}
    		if (flagIndex==1){
    			mtthod += "<option value='1' selected='selected'>过滤后统计</option>";
    		}else{
    			mtthod += "<option value='1'>过滤后统计</option>";
    		}
    		mtthod += "</select></div>";
    		if (flagIndex==0 || flagIndex==1 ){
    			pushColumnMethodValue('flag'+data[0], flagIndex);
    		}
    		return mtthod;
        }
    	
        return data[cid];
    });
    return dataTable;
}

function in_array(arr,str){
 	for(i=0;i<arr.length;i++){
 		if(arr[i] == str)
 			return i;
 		}
 	return -1;
 }
 
function removeArr(arr,dx) 
{ 
    if(isNaN(dx)||dx>this.length){return false;} 
    for(var i=0,n=0;i<arr.length;i++) 
    { 
        if(arr[i]!=arr[dx]) 
        { 
            arr[n++]=arr[i]; 
        } 
    } 
    arr.length-=1 ;
} 
function queryData(dt,params){
    //var keyWord = $('tableSearch').value;
    var queryData = {};
    //queryData.keyWord = keyWord;
    var hb_table_id = $('hBaseId').value;
    queryData.HB_TABLE_ID = hb_table_id;
    //var allIds = ;
    //var checkIds = ;

    var allIds=dataTable.grid.getAllRowIds().split(",");
    var checkIds = dataTable.grid.getCheckedRows(0).split(",");
    for(var i=0;i<allIds.length;i++){
    	if(in_array(checkIds,allIds[i])!=-1){
    		if(in_array(checkedAllIds,allIds[i])==-1&&allIds[i]!="")
    		{
    			checkedAllIds.push(allIds[i]);
    		}
    	}else{
			if(in_array(checkedAllIds,allIds[i])!=-1){ 
				removeArr(checkedAllIds,in_array(checkedAllIds,allIds[i]));   	
			}
    	}
    }

    
//    dataTableAll =  new meta.ui.DataTable("tableSelectContent");
//    dataTableAll.setColumns({
//    	COLUMN_ID:"{#checkBox}",
//        COLUMN_IDS:"列ID",
//        DEFINE_CLUSTER_NAME:"分类别名",
//        DEFINE_EN_COLUMN_NAME:"英文名称",
//        DEFINE_CH_COLUMN_NAME:"中文名称",
//        STATISTICS_METHOD:"统计方法"
//    },"COLUMN_ID,COLUMN_IDS,DEFINE_CLUSTER_NAME,DEFINE_EN_COLUMN_NAME,DEFINE_CH_COLUMN_NAME,STATISTICS_METHOD");
//    
//    dataTableAll.setSorting(true,{
//        DEFINE_CLUSTER_NAME:"asc",
//        DEFINE_EN_COLUMN_NAME:"asc",
//        DEFINE_CH_COLUMN_NAME:"asc"
//    });
//    dataTableAll.setRowIdForField("COLUMN_ID");
//    dataTableAll.setPaging(true,20);//分页
//    dataTableAll.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
//    dataTableAll.grid.setInitWidthsP("2,8,25,25,25,15");
//    dataTableAll.setGridColumnCfg(0,{align:"center",type:"ch"});
//    dataTableAll.setGridColumnCfg(1,{align:"center"});
//    dataTableAll.setGridColumnCfg(2,{align:"center"});
//    dataTableAll.setGridColumnCfg(3,{align:"center"});
//    dataTableAll.setGridColumnCfg(4,{align:"center"});
//    dataTableAll.setGridColumnCfg(5,{align:"center"});
    
//    HBQryRuleAction.queryColumnInfo(queryData,null,function(data){
//    	if(data&&data[0]){
//    		total = 0;
//    		dataTableAll.bindData(data,total);
//    	}
//    });
   
    queryData["_COLUMN_SORT"] = params.sort;
	dhx.showProgress("请求数据中");
    HBQryRuleAction.queryColumnInfo(queryData,qryRuleId,null,function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        tabledata=data;
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
		for ( var i = 0; i < data.length; i++) {// 注册选中监听
			columnMethodListen(data[i].DEFINE_EN_COLUMN_NAME);
		}
    });
}

/**
 * 设置列方法选中监听
 * @param columnName
 */
function columnMethodListen(columnName){
	//alert(columnName);
	var columnMethodNode = document.getElementById(columnName);
	columnMethodNode.onchange = function(){
        var columnMethod = document.getElementById(columnName);
        pushColumnMethodValue(columnName, columnMethod.value);
        dataTable.grid.selectRowById(columnName,null,false); // 选中行
	};
	
	columnMethodNode.onclick = function(e){ // 取消事件传递
		 e = e || window.event;
		 e.cancelBubble = true;
	};
	
	var columnFlagNode = document.getElementById("flag"+columnName);
	columnFlagNode.onchange = function(){
        var columnMethod = document.getElementById("flag"+columnName);
        pushColumnMethodValue("flag"+columnName, columnMethod.value);
        dataTable.grid.selectRowById(columnName,null,false); // 选中行
	};
	columnFlagNode.onclick = function(e){ // 取消事件传递
		 e = e || window.event;
		 e.cancelBubble = true;
	};
}

/**
 * 设置列对应的统计方法
 */
function setColumnMethodValue(){
	/*alert(selectColumnMethodArray.length);
	for ( var i = 0; i < selectColumnMethodArray.length; i++) {
    	var scma = selectColumnMethodArray[i];
    	var columnMethod = document.getElementById(scma[0]);
    	columnMethod.value = scma[1];   
	}*/
}

function getColumnMethodValue(columnName){
	for ( var i = 0; i < selectColumnMethodArray.length; i++) {
    	var scma = selectColumnMethodArray[i];
    	if (scma[0] == columnName){
    		return scma[1];
    	}
	}
	
	return -1;
}

/**
 * 
 * @param columnName
 * @param columnValue
 */
function pushColumnMethodValue(columnName, columnValue){
    for ( var i = 0; i < tabledata.length; i++) {
    	if(tabledata[i].COLUMN_ID==columnName){
    		tabledata[i].STATISTICS_METHOD = columnValue;
    	}else
    	if(("flag"+tabledata[i].COLUMN_ID)==columnName){
    		tabledata[i].STATISTICS_FLAG = columnValue;
    	}
	}
}

/*****************************************加载用户列结束**********************************************************************/


/*****************************************加载用户访问开始**********************************************************************/

/**
 * 添加一行用户权限条件

function addParaAuthorityRow(obj,rowIndex){
    rowIndex = rowIndex+1;
    if(obj!=null){
        var nextTr = obj.parentNode.parentNode.parentNode.nextSibling;
        if(nextTr==null){
            creartAuthorityParaRow(rowIndex);
        }
        var currTr = obj.parentNode.parentNode.parentNode;
        if(currTr.lastChild.innerHTML=="<DIV>&nbsp;&nbsp;</DIV>"||currTr.lastChild.innerHTML=="<div>&nbsp;&nbsp;</div>"){
            currTr.lastChild.innerHTML="<a href='#' onclick='deleteParamRow(this,"+rowIndex+")'>删除</a>";
        }
    }else{
        creartAuthorityParaRow(rowIndex);
    }
}

function creartAuthorityParaRow(rowIndex){
    var row = document.createElement("tr");
    row.onclick = function(){
        if(moveParamObj != null){
            moveParamObj.style.background = "";
        }
        moveParamObj=this
        row.style.background = "#f5f7f8";
    }
    paramAuthorityTable.tBodies[0].appendChild(row);
    for(var i = 0 ;i<5;i++){
        var cell= document.createElement("td");
        cell.className = 'c_td';
        row.appendChild(cell);
        if(i==0){
            cell.innerHTML = rowIndex;
        }
        if(i==1){
            cell.innerHTML ="<div style='width: 200px;'><input id='paramAuthorityId"+rowIndex+"' value='' onkeyup='addParaAuthorityRow(this,"+rowIndex+")' /></div>";
        }
        if(i==2){
            cell.innerHTML ="<div style='width: 200px;'><input id='paramAuthorityName"+rowIndex+"' value=''  /></div>";
        }
        if(i==3){
            cell.innerHTML ="<div style='width: 200px;'><select id='paramAuthorityState"+rowIndex+"' ><option value='0'>有效</option><option value='1'>无效</option></select></div>";
        }
        if(i==4){
            cell.className = 'c_td_end';
            cell.innerHTML= "<div>&nbsp;&nbsp;</div>";
        }
    }
    dhtmlxValidation.addValidation(row,[
        {target:"paramAuthorityId" + rowIndex,rule:"NotEmpty,MaxLength[32]"}
    ]);
    row._rowIndex=rowIndex;
}

 */



var dataAuthorityTable = null;
/**
 * 初始需要选择的列表格
 * @param mode 操作模式 0：多选，1单选
 */
function dataAuthorityTableInit(){
    dataAuthorityTable = new meta.ui.DataTable("tableAuthorityContent");//第二个参数表示是否是表格树
    dataAuthorityTable.setColumns({
        OPP:"{#checkBox}",
        USER_ID: "用户ID",
        USER_NAME : "用户名称",
        USER_STATE: "用户状态"
    },"USER_ID,USER_ID,USER_NAME,USER_STATE");
    dataAuthorityTable.setRowIdForField("USER_ID");
    dataAuthorityTable.setPaging(false);//分页
    dataAuthorityTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataAuthorityTable.grid.setInitWidthsP("5,35,30,30");
    dataAuthorityTable.setGridColumnCfg(0,{align:"center",type:"ch"});
    dataAuthorityTable.setGridColumnCfg(1,{align:"center"});
    dataAuthorityTable.setGridColumnCfg(2,{align:"center"});
    dataAuthorityTable.setGridColumnCfg(3,{align:"center"});

    dataAuthorityTable.grid.enableSelectCheckedBoxCheck("1");// 添加行点击事件
    dataAuthorityTable.setFormatCellCall(function(rid,cid,data,colId){
        if(colId=="OPP"){
            if(qryAuthorityIds!=null){
                for(var m=0;m<qryAuthorityIds.length;m++){
                    if(qryAuthorityIds[m]["USER_ID"]==data[1]){
                        return 1;
                        break;
                    }
                }
            }
            return 0;
        }
        else if(colId == "USER_STATE"){
            return data[cid]==0?"启用":"禁用" ;
        }
        return data[cid];
    });
    return dataAuthorityTable;
}


function queryAuthorityData(dt,params){
    //var keyWord = $('tableSearch').value;
    var queryData = {};
    //queryData.keyWord = keyWord;
    dhx.showProgress("请求数据中");
    AuthorityAction.queryAuthrityInfo(queryData,null,function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataAuthorityTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}


/*****************************************加载用户访问结束**********************************************************************/
/*****************************************加载数据源开始**********************************************************************/


var selectDataSourceWindow = null;
function openDataSourceTableWin(obj){
    if(!selectDataSourceWindow){
        selectDataSourceWindow = DHTMLXFactory.createWindow("selectWindow2","selectDataSourceWindow", 0, 0, 300, 380);
        selectDataSourceWindow.stick();
        selectDataSourceWindow.setModal(true);
        selectDataSourceWindow.setDimension(1200);
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
        globle_dataSourceId=$('dataSourceId').innerText;
        globle_dataSourceName=$('dataSourceName').value;
        dateSourceAddress=$('dateSourceAddress').value;
        rootZnodeName=$('rootZnodeName').value;
        parentZnodeName=$('parentZnodeName').value;
        zookeeperServers=document.getElementById('zookeeperServers').value;
        zookeeperPort=$('zookeeperPort').value ;
        globle_state=$('state').value=="有效"?"0":"1";
        
	    var searchSourceId = document.getElementById("searchSourceId");
	    attachObjEvent(searchSourceId,"onkeydown",function(evet){
	    	if (event.keyCode==13){
		    	dataDataSourceTable.Page.currPageNum = 1;
		        dataDataSourceTable.refreshData();
	    	}
	    });
	
	    var searchSourceName = document.getElementById("searchSourceName");
	    attachObjEvent(searchSourceName,"onkeydown",function(evet){
	    	if (event.keyCode==13){
		    	dataDataSourceTable.Page.currPageNum = 1;
		        dataDataSourceTable.refreshData();
	    	}
	    }); 
	    
        //添加radio点击事件。
		dataDataSourceTable.grid.attachEvent("onCheck", function(rid, cInd, state){
		    if(state){
		        globle_dataSourceId = dataDataSourceTable.getUserData(rid,"DATA_SOURCE_ID");
		        globle_dataSourceName = dataDataSourceTable.getUserData(rid,"DATA_SOURCE_NAME");
				 dateSourceAddress = dataDataSourceTable.getUserData(rid,"DATA_SOURCE_ADDRESS");
				 rootZnodeName = dataDataSourceTable.getUserData(rid,"ROOT_ZNODE_NAME");
				 parentZnodeName =dataDataSourceTable.getUserData(rid,"PARENT_ZNODE_NAME");
				 zookeeperServers = dataDataSourceTable.getUserData(rid,"ZOOKEEPER_SERVERS");
				 zookeeperPort = dataDataSourceTable.getUserData(rid,"ZOOKEEPER_PORT");
				 globle_state = dataDataSourceTable.getUserData(rid,"STATE");
		    }
		});
		// 添加行点击事件
		dataDataSourceTable.grid.attachEvent("onRowSelect",function(rid,ind){
			dataDataSourceTable.grid.cells(rid,0).setValue(1);
			globle_dataSourceId = dataDataSourceTable.getUserData(rid,"DATA_SOURCE_ID");
			globle_dataSourceName = dataDataSourceTable.getUserData(rid,"DATA_SOURCE_NAME");
			 dateSourceAddress = dataDataSourceTable.getUserData(rid,"DATA_SOURCE_ADDRESS");
			 rootZnodeName = dataDataSourceTable.getUserData(rid,"ROOT_ZNODE_NAME");
			 parentZnodeName =dataDataSourceTable.getUserData(rid,"PARENT_ZNODE_NAME");
			 zookeeperServers = dataDataSourceTable.getUserData(rid,"ZOOKEEPER_SERVERS");
			 zookeeperPort = dataDataSourceTable.getUserData(rid,"ZOOKEEPER_PORT");
			 globle_state = dataDataSourceTable.getUserData(rid,"STATE");
		});
        dataDataSourceTable.refreshData();

        //重置关闭窗口事件
        selectDataSourceWindow.attachEvent("onClose",function(){
            selectDataSourceWindow.setModal(false);
            this.hide();
            return false;
        });


        $('searchDataSourceTable').onclick = function() {
            var sourceId = $('searchSourceId').value;
            var sourceName = $('searchSourceName').value;
            var sourceState = 0;
            var queryData = {};
            queryData.DATA_ID = sourceId;
            queryData.DATA_NAME = sourceName;
            queryData.DATA_STATUS = sourceState;
            HBaseDataSourceAction.queryDataSourceList(queryData,null,function(data){
                dhx.closeProgress();
                var total = 0;
                if(data && data[0])
                    total = data[0]["TOTAL_COUNT_"];
                dataDataSourceTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
            });
        }
        $('saveDataSourceBtn').onclick = function(){
            var checkedId=dataDataSourceTable.grid.getCheckedRows(0);//获得提取被选中的一行的ID
            var dataRow = dataDataSourceTable.userData;


            if(globle_dataSourceId==null||globle_dataSourceId==""){
                alert("请选择一个数据源！");
                return;
            }else{

		        if(globle_dataSourceId != $('dateSourceId').innerText){
					globle_HBaseId = null;
					$('hBaseName').value = "";
					$('hBaseId').value = "";
				}
		        
                selectDataSourceWindow.setModal(false);
                selectDataSourceWindow.hide();

                $('dataSourceId').innerText = globle_dataSourceId?globle_dataSourceId:"";
                $('dataSourceName').value = globle_dataSourceName?globle_dataSourceName:"";
                $('dateSourceAddress').value = dateSourceAddress;
                $('rootZnodeName').value = rootZnodeName?rootZnodeName:"";
                $('hbaseSiteXml').value = hbaseSiteXml;
                $('parentZnodeName').value = parentZnodeName?parentZnodeName:"";
                document.getElementById('zookeeperServers').value = zookeeperServers?zookeeperServers:"";
                $('zookeeperPort').value = zookeeperPort?zookeeperPort:"";
                $('state').value = globle_state==0?"有效":"无效";
                /*if(globle_HBaseId !=null && globle_HBaseId!=""){//检查表名称是否属于该资源
                	queryHBaseDataById();
                }*/

            }
        };
    }else {
        selectDataSourceWindow.show();
        selectDataSourceWindow.setModal(true);
        globle_dataSourceId = $('dataSourceId').innerText;
        globle_dataSourceName = $('dataSourceName').value;
        $('searchSourceId').value = '';
        $('searchSourceName').value = '';
        dataDataSourceTable.refreshData();
    }
}

var dataDataSourceTable = null;
function dataDataSourceTableInit(){
    dataDataSourceTable= new meta.ui.DataTable("tableSelectDataSourceContent");//第二个参数表示是否是表格树
    dataDataSourceTable.setColumns({
        OPP: "选择行",
        DATA_SOURCE_ID: "数据源ID",
        DATA_SOURCE_NAME : "数据源名称",
        DATA_SOURCE_ADDRESS: "数据源地址",
        ZOOKEEPER_SERVERS: "ZK地址",
        PARALLEL_NUM: "并发访问数",
        HBASE_SITE_XML : "HBase配置信息",
        ZOOKEEPER_PORT:"ZK端口",
        ROOT_ZNODE_NAME:"ZK根节点名称",
        PARENT_ZNODE_NAME: "HBase根节点地址",
        STATE:"状态"
    },"OPP,DATA_SOURCE_ID,DATA_SOURCE_NAME,DATA_SOURCE_ADDRESS,ZOOKEEPER_SERVERS,PARALLEL_NUM," +
        "HBASE_SITE_XML,ZOOKEEPER_PORT,ROOT_ZNODE_NAME,PARENT_ZNODE_NAME,STATE");
    dataDataSourceTable.setRowIdForField("DATA_SOURCE_ID");
    dataDataSourceTable.setPaging(true,20);//分页
    dataDataSourceTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataDataSourceTable.grid.setInitWidthsP("5,8,8,8,5,10,12,8,14,14,8");
    dataDataSourceTable.setGridColumnCfg(0,{align:"center",type:"ra"});
    dataDataSourceTable.setGridColumnCfg(1,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(2,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(3,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(4,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(5,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(6,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(7,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(8,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(9,{align:"center"});
    dataDataSourceTable.setGridColumnCfg(10,{align:"center"});

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

function queryDataSourceData(dt,params){
    var sourceId = $('searchSourceId').value;
    var sourceName = $('searchSourceName').value;
    var sourceState = 0;
    var queryData = {};
    queryData.DATA_ID = sourceId;
    queryData.DATA_NAME = sourceName;
    queryData.DATA_STATUS = sourceState;
    HBaseDataSourceAction.queryDataSourceList(queryData,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataDataSourceTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}


/*****************************************加载数据源结束**********************************************************************/
/*****************************************加载查询规则开始**********************************************************************/


var selectHBaseWindow = null;
function openHBaseTableWin(obj){
    if(!selectHBaseWindow){
        selectHBaseWindow = DHTMLXFactory.createWindow("selectWindow3","selectHBaseWindow", 0, 0, 300, 380);
        selectHBaseWindow.stick();
        selectHBaseWindow.setModal(true);
        selectHBaseWindow.setDimension(700);
        selectHBaseWindow.button("minmax1").hide();
        selectHBaseWindow.button("park").hide();
        selectHBaseWindow.button("stick").hide();
        selectHBaseWindow.button("sticked").hide();
        selectHBaseWindow.center();
        selectHBaseWindow.denyResize();
        selectHBaseWindow.denyPark();
        selectHBaseWindow.setText("选择HBase表名");
        selectHBaseWindow.keepInViewport(true);

        var layout = new dhtmlXLayoutObject(selectHBaseWindow, "2E");
        layout.cells("b").setHeight(50);
        layout.cells("a").fixSize(true, true);
        layout.cells("a").hideHeader();
        layout.cells("a").attachObject($('tableSelectHBaseContentTop'));
        layout.cells("b").fixSize(false, true);
        layout.cells("b").hideHeader();
        layout.cells("b").attachObject($('tableSelectHBaseContentDown'));

        dataHBaseTableInit(); //初始数据表格  初始之后dataTable才会被实例化
        dataHBaseTable.setReFreshCall(queryHBaseData); //设置表格刷新的回调方法，即实际查询数据的方法
        globle_HBaseId = $('hBaseId').value;
        globle_HBaseName = $('hBaseName').value;
        //添加radio点击事件。
		dataHBaseTable.grid.attachEvent("onCheck", function(rid, cInd, state){
		    if(state){
		        globle_HBaseId = dataHBaseTable.getUserData(rid,"HB_TABLE_ID");
		        globle_HBaseName = dataHBaseTable.getUserData(rid,"HB_TABLE_NAME");
		    }
		});
		// 添加行点击事件
		dataHBaseTable.grid.attachEvent("onRowSelect",function(rid,ind){
			dataHBaseTable.grid.cells(rid,0).setValue(1);
			globle_HBaseId = dataHBaseTable.getUserData(rid,"HB_TABLE_ID");
			globle_HBaseName = dataHBaseTable.getUserData(rid,"HB_TABLE_NAME");
		});
        dataHBaseTable.refreshData();

        //重置关闭窗口事件
        selectHBaseWindow.attachEvent("onClose",function(){
            selectHBaseWindow.setModal(false);
            this.hide();
            return false;
        });
		var searchHBaseName = document.getElementById("searchHBaseName");
	    attachObjEvent(searchHBaseName,"onkeydown",function(evet){
	    	if (event.keyCode==13){
	            var hbaseName = $('searchHBaseName').value;
	
	            var queryData = {};
	            queryData.TABLE_NAME = hbaseName;
	            queryData.DATA_SOURCE_ID = globle_dataSourceId;
	            queryData.HB_STATE = 0;
	            HBTableAction.queryHBTableInfo(queryData,null,function(data){
	                var total = 0;
	                if(data && data[0])
	                    total = data[0]["TOTAL_COUNT_"];
	                dataHBaseTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
	            });
	    	}
	    });

        $('searchHBaseTable').onclick = function() {
            var hbaseName = $('searchHBaseName').value;

            var queryData = {};
            queryData.TABLE_NAME = hbaseName;
            queryData.DATA_SOURCE_ID = globle_dataSourceId;
            queryData.HB_STATE = 0;
            HBTableAction.queryHBTableInfo(queryData,null,function(data){
                var total = 0;
                if(data && data[0])
                    total = data[0]["TOTAL_COUNT_"];
                dataHBaseTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
            });
        }
        $('closeHBaseBtn').onclick = function(){
        	selectHBaseWindow.setModal(false);
            selectHBaseWindow.hide();
        }
        
        $('saveHBaseBtn').onclick = function(){
            var checkedId=dataHBaseTable.grid.getCheckedRows(0);//获得提取被选中的一行的ID
            var dataRow = dataHBaseTable.userData;
            var  hBaseName = '';
            var  hBaseId = '';

            if(globle_HBaseId==null||globle_HBaseId==""){
                dhx.alert("请选择一个表！");
                return;
            }else{
                // initInstanceParamByProgram(checkedId.replace("tree_", ""));
                selectHBaseWindow.setModal(false);
                selectHBaseWindow.hide();

                $('hBaseId').value = globle_HBaseId?globle_HBaseId:"";
                $('hBaseName').value = globle_HBaseName?globle_HBaseName:"";
				checkedAllIds = []; 
            }
        };
    }else {
        selectHBaseWindow.show();
        selectHBaseWindow.setModal(true);
        globle_HBaseId = $('hBaseId').value;
        globle_HBaseName = $('hBaseName').value;
        $('searchHBaseName').value = '';
        dataHBaseTable.refreshData();
    }
    
}

var dataHBaseTable = null;
function dataHBaseTableInit(){
    dataHBaseTable= new meta.ui.DataTable("tableSelectHBaseContent");//第二个参数表示是否是表格树
    dataHBaseTable.setColumns({
        OPP: "选择行",
        HB_TABLE_NAME: "表名称",
        HB_TABLE_MSG : "表描述"
    },"HB_TABLE_ID,HB_TABLE_NAME,HB_TABLE_MSG");
    dataHBaseTable.setRowIdForField("HB_TABLE_ID");
    dataHBaseTable.setPaging(true,20);//分页
    dataHBaseTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataHBaseTable.grid.setInitWidthsP("10,40,50");
    dataHBaseTable.setGridColumnCfg(0,{align:"center",type:"ra"});
    dataHBaseTable.setGridColumnCfg(1,{align:"center"});
    dataHBaseTable.setGridColumnCfg(2,{align:"center"});

    dataHBaseTable.setFormatCellCall(function(rid,cid,data,colId){
        if(colId=="OPP"){
            if(data[cid]==globle_HBaseId){
                return 1;
            }
            return 0;
        }
        return data[cid];
    });
    return dataHBaseTable;

}

function queryHBaseData(dt,params){
    // var keyWord = $('tableProgramSearch').value;
    var queryData = {};
    // queryData.keyWord = keyWord;
    
    queryData["_COLUMN_SORT"] = params.sort;
    queryData["DATA_SOURCE_ID"] = globle_dataSourceId;
    queryData.HB_STATE = 0;
    dhx.showProgress("请求数据中");
    HBTableAction.queryHBTableInfo(queryData,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataHBaseTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

// 检查资源ID与表的关系，用户第一次下一步的判断
function queryHBaseDataById(){
    HBTableAction.getHBTableInfoById(globle_dataSourceId, globle_HBaseId,function(data){
    	if (data == 0){
    		globle_HBaseId = null;
    		$('hBaseName').value = "";
    		$('hBaseId').value = "";
    	}
    });
}

/*****************************************加载查询规则结束**********************************************************************/



//删除一行参数信息
function deleteParamRow(obj,rowIndex){
    var tr=obj.parentNode.parentNode;
    var table =tr.parentNode;
    table.removeChild(tr);
}

/**
 * 保存规则
 */
function saveRuleTable(){
    //先执行校验
  	if(!(dhtmlxValidation.validate("ruleForm")))return;
  	var params = getSaveParams();
    if(params.errorInfo) {
        dhx.alert(params.errorInfo);
        return;
    }
   $("saveBtn").disabled = true;
   $("preBtn5").disabled = true;
	dhx.showProgress("保存数据中");
    HBQryRuleAction.saveQryRuleInfo(params,function(data){
    	dhx.closeProgress();
        if(data && data.flag == 1){
          dhx.alert("保存成功！",function(){
                //window.refreshParentTab();
                if(window.parent && window.parent.closeTab)
                    window.parent.closeTab(menuStr);
                else
                    window.close();
            });
        } else if(data.flag == 0){
        	dhx.alert(data.msg+"",function(){
        		if(window.parent && window.parent.closeTab)
                    window.parent.closeTab(menuStr);
                else
                    window.close();
        	});
        } else{
             dhx.alert("保存失败，详细信息请查看日志！",function(){
                if(window.parent && window.parent.closeTab)
                    window.parent.closeTab(menuStr);
                else
                    window.close();
            });
        }
    });
    
}

/**
 * 刷新父级标签页
 * @return {*}
 */
function refreshParentTab() {
    if (this.opener && this.opener.refreshParentTab && this.opener._mainFrameFlag) {
        return this.opener.refreshParentTab(this.menuStr);
    } else if (this.parent && this.parent.refreshParentTab && this.parent._mainFrameFlag) {
        return this.parent.refreshParentTab(this.menuStr);
    }
}
/**
 * 获取保存参数
 */
function getSaveParams(){
    var result = {};

    result.QRY_RULE_ID = qryRuleId;
    var qryRuleInfo = {};
    qryRuleInfo.RULE_NAME = $('ruleName').value;
    qryRuleInfo.DEPART_TYPE = $('departType').value;
    qryRuleInfo.DATA_SOURCE_ID = $('dataSourceId').innerText;
    qryRuleInfo.HB_TABLE_ID = $('hBaseId').value;
    qryRuleInfo.SCANNER_CACHING_SIZE = $('scannerCachingSize').value;
    qryRuleInfo.SCANNER_READ_CACHE_SIZE = $('scannerReadCacheSize').value;
    qryRuleInfo.HBASE_TABLE_PARTITION = $('hbaseTablePartition').value;
    qryRuleInfo.PARALLEL_NUM = $('qryParallelNum').value;
    qryRuleInfo.QRY_TYPE = $('qryType').value;
    qryRuleInfo.PAGINATION_SIZE = $('paginationSize').value;
    qryRuleInfo.SUPPORT_SORT = $('supportSort').value;
    qryRuleInfo.SORT_TYPE = $('sortType').value;
    qryRuleInfo.DEF_SORT_COLUMN = $('defSortColumn').value;
    qryRuleInfo.CLIENT_ROWS_BUFFER_SIZE = $('clientRowsBufferSize').value;
    qryRuleInfo.LOG_FLAG = $('logFlag').value;
    qryRuleInfo.LOG_FLAG_DETAIL = $('logFlagDetail').value;
    qryRuleInfo.STATE = $('qryState').value;
    qryRuleInfo.CERT_AUTH_FLAG = $('certAuth').value;
    result.qyrRuleInfo = qryRuleInfo;

    var checkedId=dataTable.grid.getCheckedRows(0).split(",");//获得提取被选中的一行的ID
    for(var m=0;m<checkedAllIds.length;m++){
           var qryColumnInfo = {};
           var columnID = dataTable.getUserData(checkedAllIds[m],"COLUMN_IDS");
           var colEnName = dataTable.getUserData(checkedAllIds[m],"DEFINE_EN_COLUMN_NAME");
           var colChName = dataTable.getUserData(checkedAllIds[m],"DEFINE_CH_COLUMN_NAME");
           
           var colMethod = document.getElementById(checkedAllIds[m]).value; 
           var colFlag = document.getElementById("flag"+checkedAllIds[m]).value;
           if(colMethod!=-1&&colFlag==-1){
				colFlag = 1;
           }
           qryColumnInfo.COLUMN_ID = parseInt(columnID);
           qryColumnInfo.DEFINE_EN_COLUMN_NAME = colEnName;
           qryColumnInfo.DEFINE_CH_COLUMN_NAME = colChName;
           qryColumnInfo.METHOD = colMethod;
           qryColumnInfo.FLAG = colFlag;
           paramArr.push(qryColumnInfo);
    }
    result.qryColumnInfo = paramArr;

    var checkedUserId=dataAuthorityTable.grid.getCheckedRows(0).split(",");//获得提取被选中的一行的ID
    if(globle_save_userIds!=null){
    	for(var m=0;m<globle_save_userIds.length;m++){
	        var qryAuthorityInfo = {};
	        qryAuthorityInfo.USER_ID = globle_save_userIds[m];
	        paramUserArr.push(qryAuthorityInfo);
	    }
    }else{
	    for(var m=0;m<checkedUserId.length;m++){
	        var qryAuthorityInfo = {};
	        qryAuthorityInfo.USER_ID = checkedUserId[m];
	        paramUserArr.push(qryAuthorityInfo);
	    }
    }
    

    result.qryAuthorityInfo = paramUserArr;
    
    for(var i =1 ;i<paramLogicTable.rows.length;i++){
        var index = paramLogicTable.rows[i].cells[0].innerHTML;
        var paramData = {};
        paramData.ORDER_ID = i;
        paramData.EXPRE_CONDITION = $("paramLogic"+index).value;
        if(paramData.EXPRE_CONDITION!=""){
            paramLogicArr.push(paramData);
        }
    }
    result.logicDatas = paramLogicArr;

    for(var i =1 ;i<paramRexTable.rows.length;i++){
        var index = paramRexTable.rows[i].cells[0].innerHTML;
        var paramData = {};
        paramData.ORDER_ID = i;
        paramData.MATCH_CONDITION = $("paramRexSentence"+index).value;
        paramData.EXPRE_CONDITION = $("paramRexData"+index).value;
        paramData.PATTERN_TYPE = $("paramRexSelect"+index).value;
        if(paramData.MATCH_CONDITION!=""){
            paramRexArr.push(paramData);
        }
    }
    result.rexDatas = paramRexArr;
    
    
    return result;
}

function inputtip(obj, type){
	if (type == 1){
		$('input_tip').innerText = '';
		return;
	}
	
	if (obj == null){
		return;
	}
	if (obj.id == 'hbaseTablePartition' ){
		$('input_tip').innerText = "提示：分区表支持的宏变量，例如，请求参数中存在a,b,c,d四个参数，"
			+"参数值分别为：10023,1001-201401-1213213,CNG,TXT，分区名称支持以下几种："
			+"\n1、单个字段，分区表名规则为：test_{a}; 替换后的表名为：test_10023"
			+"\n2、多个字段组合，分区表名规则为：test_$1$2:{a}:{c}; 替换后的表名为：test_10023CNG"
			+"\n3、多个字段，每个字段取区间值,分区表名规则为：test_$1$2:{a}-{4,5}:{b}-{6,11}; 替换后的表名为：test_23201401";
	}
}

dhx.ready(initData);