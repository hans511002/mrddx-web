/******************************************************
 *Copyrights @ 2013，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        dataSource_list.js
 *Description：
 *        查询数据源
 *Dependent：
 *
 *Author: 王鹏坤
 *
 ********************************************************/

var dataTable = null;   //数据来源
var maintainWin = null;//维护分类窗体（新增，修改，查看）
var accRealName = null;  //附件真实名
var accShowName = null;  //附件显示名称


 /**
 * 页面初始化
 */
function pageInit(){
	
	initAcc();
    var termReq = TermReqFactory.createTermReq(1);
    var dataName = termReq.createTermControl("data_name","DATA_NAME");
    dataName.setWidth(240);
    dataName.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });

    var dataStatus = termReq.createTermControl("data_status","DATA_STATUS");
    dataStatus.setListRule(0,[[-1,"全部"],[0,"有效"],[1,"无效"]],-1);
    dataStatus.setWidth(120);
    dataStatus.enableReadonly(true);
    dataInit();
    dataTable.setPaging(true, 20);//分页
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("10,10,10,10,10,5,10,10,5,20");
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
        DATA_SOURCE_NAME : "数据源名称",
        DATA_SOURCE_ADDRESS: "数据源地址",
        ZOOKEEPER_SERVERS: "ZK地址",
        PARALLEL_NUM: "并发访问数",
        HBASE_SITE_XML : "HBase配置信息",
        ZOOKEEPER_PORT:"ZK端口",
        ROOT_ZNODE_NAME:"ZK根节点名称",
        PARENT_ZNODE_NAME: "HBase根节点地址",
        STATE:"状态",
        OPP: "操作"

    },"DATA_SOURCE_NAME,DATA_SOURCE_ADDRESS,ZOOKEEPER_SERVERS,PARALLEL_NUM," +
        "HBASE_SITE_XML,ZOOKEEPER_PORT,ROOT_ZNODE_NAME,PARENT_ZNODE_NAME,STATE,DATA_SOURCE_ID");

    dataTable.setFormatCellCall(function(rid, cid, data, colId){

        if(colId == "OPP"){
            return "<a href='javascript:void(0)' onclick='showData(\""+rid+"\",0);return false;'>查看</a>&nbsp;&nbsp;&nbsp;&nbsp;"
                +"<a href='javascript:void(0)' onclick='showData(\""+rid+"\",-1);return false;'>修改</a>&nbsp;&nbsp;&nbsp;&nbsp;"
                +"<a href='javascript:void(0)' onclick='deleteData(\""+rid+"\");return false;'>删除</a>&nbsp;&nbsp;&nbsp;&nbsp;";
        }else if(colId == "STATE"){
            return data[cid] =="0"?"有效":"无效" ;
        }else if(colId == "HBASE_SITE_XML"){
            return  "< BLOB >";
        }
        return data[cid];
    });
}

/**
 * 初始化附件
 */
function initAcc() {
	accRealName = null;  //附件真实名
    accShowName = null;
    $("iframeContent").innerHTML = '<iframe id="uploadIfame" style="height:64px;width:100%;border: 0" ></iframe>';
    $("uploadIfame").src = urlEncode("upload.jsp");
    
}

//查询数据
function queryData(dt,params){
    var termVals=TermReqFactory.getTermReq(1).getKeyValue();
    dhx.showProgress("请求数据中");
    termVals["_COLUMN_SORT"] = params.sort;
    //termVals["DATA_STATUS"] = -1;
    HBaseDataSourceAction.queryDataSourceList(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
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
    var dataId =  dataTable.getUserData(rid,"DATA_SOURCE_ID");
    var dataName =  dataTable.getUserData(rid,"DATA_SOURCE_NAME");
    var dataAddress = dataTable.getUserData(rid,"DATA_SOURCE_ADDRESS");
    var zookServers = dataTable.getUserData(rid,"ZOOKEEPER_SERVERS");
    var ParallelNum = dataTable.getUserData(rid,"PARALLEL_NUM");
    var HBaseXML = dataTable.getUserData(rid,"HBASE_SITE_XML");
    var zookPort = dataTable.getUserData(rid,"ZOOKEEPER_PORT");
    var rootName = dataTable.getUserData(rid,"ROOT_ZNODE_NAME");
    var parentName = dataTable.getUserData(rid,"PARENT_ZNODE_NAME");
    var state = dataTable.getUserData(rid,"STATE");

    if(flag==1){
        title = "新增实时入库文件格式配置";
        var millTime = new Date().getTime();
        document.getElementById("dateSourceId").value = "";
        document.getElementById("dateSourceName").value = "";
        document.getElementById("dateSourceAddress").value = "" ;
        document.getElementById("rootZnodeName").value = "root-region-server";
        //document.getElementById("hbaseSiteXml").value = "";
        document.getElementById("parentZnodeName").value = "/hbase";
        document.getElementById("zookeeperServers").value = "";
        document.getElementById("zookeeperPort").value = "2181";
        document.getElementById("parallelNum").value = "100";
        document.getElementById("state").value = "0";
        $("dateSourceId").readOnly="";
        $("dateSourceName").readOnly="";
        $("dateSourceAddress").readOnly="";
        $("rootZnodeName").readOnly="";
        //$("hbaseSiteXml").readOnly="";
        $("parentZnodeName").readOnly="";
        $("zookeeperServers").readOnly="";
        $("zookeeperPort").readOnly="";
        $("parallelNum").readOnly="";
        $("state").disabled="";
        document.getElementById("viewHB").style.display = "none";
        document.getElementById("addHB").style.display = "block";
        document.getElementById("saveBtn").style.visibility = "visible";
        $("calBtn").value="取消";
    }
    if(flag==0){
        title = "查看实时入库文件格式配置";
        document.getElementById("dateSourceId").value = dataId;
        document.getElementById("dateSourceName").value = dataName;
        document.getElementById("dateSourceAddress").value = dataAddress ;
        document.getElementById("rootZnodeName").value =  rootName;
      //  document.getElementById("hbaseSiteXml").value = "<BLOB>";
        document.getElementById("parentZnodeName").value = parentName;
        document.getElementById("zookeeperServers").value =  zookServers
        document.getElementById("zookeeperPort").value = zookPort;
        document.getElementById("parallelNum").value =  ParallelNum;
        document.getElementById("state").value = state;
        $("dateSourceId").readOnly="readOnly";
        $("dateSourceName").readOnly="readOnly";
        $("dateSourceAddress").readOnly="readOnly";
        $("rootZnodeName").readOnly="readOnly";
        //$("hbaseSiteXml").readOnly="readOnly";
        $("parentZnodeName").readOnly="readOnly";
        $("zookeeperServers").readOnly="readOnly";
        $("zookeeperPort").readOnly="readOnly";
        $("parallelNum").readOnly="readOnly";
        $("state").disabled="disabled";
        //$("saveBtn").hidden="hidden";
        document.getElementById("viewHB").style.display = "block";
        document.getElementById("addHB").style.display = "none";
        document.getElementById("saveBtn").style.visibility = "hidden";
        $("calBtn").value="关闭";
        //$("zookeeperPort").readOnly="readOnly";
    }
    if(flag==-1){
   	    initAcc();
        title = "修改实时入库文件格式配置";
        document.getElementById("dateSourceId").value = dataId;
        document.getElementById("dateSourceName").value = dataName;
        document.getElementById("dateSourceAddress").value = dataAddress ;
        document.getElementById("rootZnodeName").value = rootName;
       // document.getElementById("hbaseSiteXml").value = "<BLOB>";
        document.getElementById("parentZnodeName").value =  parentName;
        document.getElementById("zookeeperServers").value = zookServers;
        document.getElementById("zookeeperPort").value =zookPort;
        document.getElementById("parallelNum").value = ParallelNum;
        document.getElementById("state").value = state;
        $("dateSourceId").readOnly="";
        $("dateSourceName").readOnly="";
        $("dateSourceAddress").readOnly="";
        $("rootZnodeName").readOnly="";
       // $("hbaseSiteXml").readOnly="";
        $("parentZnodeName").readOnly="";
        $("zookeeperServers").readOnly="";
        $("zookeeperPort").readOnly="";
        $("parallelNum").readOnly="";
        $("state").disabled="";
        document.getElementById("saveBtn").style.visibility = "visible";
        document.getElementById("viewHB").style.display = "none";
        document.getElementById("addHB").style.display = "block";
        $("calBtn").value="取消";
    }
    if(!maintainWin){
        maintainWin = DHTMLXFactory.createWindow("1","maintainWin",0,0,500,450);
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
        attachObjEvent(saveBtn,"onclick",saveDataSource);
        attachObjEvent(calBtn,"onclick",function(){maintainWin.close();});

        maintainWin.attachEvent("onClose",function(){
            maintainWin.setModal(false);
            this.hide();
            return false;
        });

        dhtmlxValidation.addValidation(dataFormDIV, [
            {target:"dateSourceName",rule:"NotEmpty,MaxLength[64]"},
            {target:"zookeeperPort",rule:"NotEmpty,Range[0,65535],PositiveInt"},
            {target:"parallelNum",rule:"NotEmpty,Range[0,10000],PositiveInt"},
            {target:"dateSourceAddress",rule:"NotEmpty,MaxLength[256]"},
            {target:"rootZnodeName",rule:"NotEmpty,MaxLength[18]"},
            {target:"parentZnodeName",rule:"NotEmpty,MaxLength[32]"},
            {target:"zookeeperServers",rule:"NotEmpty,MaxLength[512]"}
        ],"true");
    }
    maintainWin.setText(title);
    maintainWin.setModal(true);
    maintainWin.show();
    maintainWin.center();
}


/**
 *  下载配置文件
 */
 function downloadHB(){
     var dateSourceId = $("dateSourceId").value;
    if(!dateSourceId){
        dhx.alert("请选择数据源！");
        return;
    }
    
    //var HBDateID = $("dateSourceId").value;
    
    
    HBaseDataSourceAction.checkXml(dateSourceId,{
     async:false,
        callback:function(rs){
        	if(rs==0){
        		dhx.alert("该数据源没有HBase配置文件！");
        		return;	
        	}else{
        	var url  =  'downloadDateSource.jsp?HBDateID='+dateSourceId ;
    		location.href = url;
       		 }
        }
     });
}


//保存HBase数据源
 function saveDataSource(){
     if(!(dhtmlxValidation.validate("dataFormDIV")))return;
     var data = Tools.getFormValues("dataForm");
      var dateSourceAddress = document.getElementById("dateSourceAddress").value;
 	var result=dateSourceAddress.match(/^([a-zA-z_]{1})([\w]*)$/); 
 	if(result==null&&dateSourceAddress!=""){
 		dhx.alert("数据源地址只能以字母和下划线开头,且不能包含中文!");
 		return;
 	} 

     var zookeeperServers = document.getElementById("zookeeperServers").value;
  	var result2=zookeeperServers.match(/^([a-zA-z_]{1})([\w|,]*)$/); 
 	if(result2==null&&zookeeperServers!=""){
 		dhx.alert("zookeeper只能以字母和下划线开头,且不能包含中文!");
 		return;
 	}
  //   document.getElementById("dataForm").submit();
     
  //   var hbXml = document.getElementById("hbaseSiteXml");
  //   hbXml.select();
  //   document.getElementById("saveBtn").focus();
  //   var objTemp = document.selection.createRange()
  //   var realpath = objTemp.text;
  //   data.hbaseSiteXml = realpath;
//     if(hbXml.indexOf('.xml')<0){
//         dhx.alert("请选择XML文件！");
//         return;
//     }
      data["accRealName"] = !accRealName || accRealName == null || accRealName =='null' ? "" : accRealName ;
 	
     dhx.showProgress("保存数据中");
     HBaseDataSourceAction.savedataSourceInfo(data,function(ret){
         dhx.closeProgress();
     	if(ret=="failed3"){
             dhx.alert("数据源名称已存在!");
             return;
         }
     	if(ret=="failed2"){
             dhx.alert("数据源地址已存在!");
             return;
         }
         maintainWin.close();
         if(ret=="success"){
             dhx.alert("保存成功!");
             dataTable.refreshData();
         }else if(ret=="failed"){
             dhx.alert("保存出错!");
         }
     });
 }


//删除数据源
function deleteData(rid){
	var id = dataTable.getUserData(rid,"DATA_SOURCE_ID");
	HBaseDataSourceAction.queryRuleByDataSourceId(id,function(rs){
			if(rs==0){
				dhx.confirm("是否确认要删除该数据源？",function(r){
			        if(r){
			        	dhx.showProgress("请求数据中");
			            HBaseDataSourceAction.deleteData(id,function(ret){
			            dhx.closeProgress();
			                if(ret.flag=="false"){
			                    alert("删除失败！");
			                }else if(ret.flag=="true"){
			                	alert("删除成功！");
			                    dataTable.refreshData();
			                }else if(ret.flag=="error"){
			                    alert("删除报错！");
			                }
			            });
			        }
			    });
		    }else{
		    	dhx.alert("该数据源已被使用不能删除！");
		    }
		});
}

function readFile(fileBrowser) {
    if (navigator.userAgent.indexOf("MSIE")!=-1)  //浏览器为IE
        readFileIE(fileBrowser);
    else if (navigator.userAgent.indexOf("Firefox")!=-1 || navigator.userAgent.indexOf("Mozilla")!=-1)  //浏览器为firefox
        readFileFirefox(fileBrowser);
    else
        alert("Not IE or Firefox (userAgent=" + navigator.userAgent + ")");
}

//firefox获取文件全路径的方法
function readFileFirefox(fileBrowser) {
    try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    }
    catch (e) {
        alert('Unable to access local files due to browser security settings. To overcome this, follow these steps: (1) Enter "about:config" in the URL field; (2) Right click and select New->Boolean; (3) Enter "signed.applets.codebase_principal_support" (without the quotes) as a new preference name; (4) Click OK and try loading the file again.');
        return;
    }

    var fileName=fileBrowser.value;
    var file = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
    try {
        // Back slashes for windows
        file.initWithPath( fileName.replace(/\//g, "\\\\") );
    }
    catch(e) {
        if (e.result!=Components.results.NS_ERROR_FILE_UNRECOGNIZED_PATH) throw e;
        alert("File '" + fileName + "' cannot be loaded: relative paths are not allowed. Please provide an absolute path to this file.");
        return;
    }

    if ( file.exists() == false ) {
        alert("File '" + fileName + "' not found.");
        return;
    }
    //alert(file.path); // I test to get the local file's path.
}
//IE获取文件全路径方法
function readFileIE(fileBrowser) {
    var path = fileBrowser.value;
}

dhx.ready(pageInit);