/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        demand.js
 *Description：
 *
 *Dependent：
 *
 *Author:
 *        王晶
 ********************************************************/

var dataTable = null;//表格
var popWin = null;
var saveWin = null;
var addOrUpdate = 1;
var shareJarId = -1;
var currRid = 0;
//初始界面
function pageInit() {
	createPopWin();
    var termReq = TermReqFactory.createTermReq(1);
   
    var file = termReq.createTermControl("jarName","FILE_NAME");
    file.setWidth(200);
    file.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    
    var user = termReq.createTermControl("userName","USER_NAME");
    user.setWidth(200);
    user.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });

    dataTableInit(); //初始数据表格  初始之后dataTable才会被实例化
    dataTable.setReFreshCall(queryData); //设置表格刷新的回调方法，即实际查询数据的方法

    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    
    var addBtn = document.getElementById("addBtn");
    attachObjEvent(addBtn,"onclick",function(){
       addOrUpdate = 1;
       saveOrUpdateJarInfo(-1,-1);
    });
}

//创建窗口
function createPopWin(){
	popWin = DHTMLXFactory.createWindow("1","popWin",0,0,500,150);
	    popWin.setText("查看JAR文件");
        popWin.stick();
        popWin.denyResize();
        popWin.denyPark();
        popWin.button("minmax1").hide();
        popWin.button("park").hide();
        popWin.button("stick").hide();
        popWin.button("sticked").hide();
        popWin.center();
        popWin.attachObject($("showJarInfo"));
        popWin.hide();
     saveWin = DHTMLXFactory.createWindow("1","saveWin",0,0,500,200);
	    saveWin.stick();
        saveWin.denyResize();
        saveWin.denyPark();
        saveWin.button("minmax1").hide();
        saveWin.button("park").hide();
        saveWin.button("stick").hide();
        saveWin.button("sticked").hide();
        saveWin.center();
        saveWin.hide();
      updateWin = DHTMLXFactory.createWindow("1","updateWin",0,0,500,245);
	    updateWin.stick();
        updateWin.denyResize();
        updateWin.denyPark();
        updateWin.button("minmax1").hide();
        updateWin.button("park").hide();
        updateWin.button("stick").hide();
        updateWin.button("sticked").hide();
        updateWin.center();
        updateWin.hide();
        
        
}
//初始数据表格
function dataTableInit(){
    var dd = document.getElementById("dataDiv");
    var pageContent = document.getElementById("pageContent");
    var queryFormDIV = document.getElementById("queryFormDIV");
    queryFormDIV.style.width = pageContent.offsetWidth -10  + "px";
    dd.style.width = pageContent.offsetWidth  + "px";
    dd.style.height = pageContent.offsetHeight-queryFormDIV.offsetHeight - 5 + "px";
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
        FILE_NAME:"文件名",
        FILE_PATH:"文件路径",
        UPLOAD_USER:"创建人",
        UPLOAD_DATE:"创建时间",
        MARK:"备注",
        opt:"操作"
    },"JAR_FILE_NAME,JAR_FILE_PATH,USER_NAMECN,UPLOAD_DATE,REMARK");
    dataTable.setPaging(true,20);//分页
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("10,25,10,20,15,20");
    dataTable.setGridColumnCfg(5,{align:"center"});  
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
        if(colId=="OPT"){
           var jarState = dataTable.getUserData(rid,"JAR_FILE_STATE");
           var jarId = dataTable.getUserData(rid,"JAR_FILE_ID");
           if(jarState==1){
        	  var str = "<a href='#' onclick='showJarInfo("+rid+");return false;'>查看</a>";
        	      str+="&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='saveOrUpdateJarInfo("+rid+","+jarId+");return false;'>修改</a>";
        	      str+="&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='operateJarInfo("+jarId+",0);return false;'>禁用</a>";
        	      str+="&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='operateJarInfo("+jarId+",2);return false;'>删除</a>";
        	 return str;
           }else if(jarState==0){
        	  var str = "<a href='#' onclick='showJarInfo("+rid+");return false;'>查看</a>";
        	      str+="&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='saveOrUpdateJarInfo("+rid+","+jarId+");return false;'>修改</a>";
        	      str+="&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='operateJarInfo("+jarId+",1);return false;'>启用</a>";
        	      str+="&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='operateJarInfo("+jarId+",2);return false;'>删除</a>";
        	 return str;
        }
       }
        return data[cid];
    });

    return dataTable;
}

//查询数据
function queryData(dt,params){
    var termVals=TermReqFactory.getTermReq(1).getKeyValue();
    dhx.showProgress("请求数据中");
    MetaShareJarAction.queryShareJar(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

//删除和禁用用户
function operateJarInfo(userId,flag){
   var str = "";
   if(flag==0){
	   str = "禁用"
   }
   if(flag==1){
	   str = "启用"
   }
   if(flag==2){
	   str = "删除"
   }
   dhx.confirm(str+"此JAR包,是否继续？", function (r) {
	   if(r){
		   MetaShareJarAction.operateJarInfo(userId,flag,function(data){
			   if(data==1){
				   dhx.alert("操作成功");
				    dataTable.Page.currPageNum = 1;
                    dataTable.refreshData();
			   }else if(data==-1){
				   dhx.alert("当前JAR包正在被使用,不允许"+str);
			   }else if(data==-2){
				    dhx.alert("Jar包ID出错");
			   }else{
				   dhx.alert("操作失败");
			   }
		   })
	   }
   });
}

//查看 用户
function showJarInfo(rid){
	popWin.show();
	popWin.attachEvent("onClose",function(){
	            popWin.setModal(false);
	            this.hide();
	           
	 });
	 var _fileName = dataTable.getUserData(rid,"JAR_FILE_NAME");
	 $("_fileName").innerHTML=_fileName;
	 var _creater = dataTable.getUserData(rid,"USER_NAMECN");
	 $("_creater").innerHTML=_creater;
	 var _creTime = dataTable.getUserData(rid,"UPLOAD_DATE");
	 $("_creTime").innerHTML=_creTime;
	 var _mark = dataTable.getUserData(rid,"REMARK");
	 if(_mark!=null){
	  $("_mark").innerHTML=_mark;
	 }else{
		 $("_mark").innerHTML="";
	 }
}
function saveOrUpdateJarInfo(rid,jarId){
	
	var  _fileName = null;
	 var _creater = null;
	 var _creTime = null;
	 var _mark = null;
	if(jarId<0){
		saveWin.show();
		addOrUpdate=1;
		saveWin.setText("新增JAR包");
		saveWin.attachURL(urlEncode(getBasePath() + "/meta/module/ws/uploadsharejar.jsp?addOrUpdate="+addOrUpdate+"&jarId="+jarId));
        saveWin.attachEvent("onClose", function () {
            window.location.reload();
        });
	}else{
		addOrUpdate =2;
		updateWin.show();
		updateWin.setText("修改JAR包");
		 _fileName = dataTable.getUserData(rid,"JAR_FILE_NAME");
	     _creater = dataTable.getUserData(rid,"USER_NAMECN");
	     _creTime = dataTable.getUserData(rid,"UPLOAD_DATE");
	     _mark = dataTable.getUserData(rid,"REMARK");
	}
	 updateWin.attachURL(urlEncode(getBasePath() + "/meta/module/ws/uploadsharejar.jsp?addOrUpdate="+addOrUpdate+"&jarId="+jarId));
     updateWin.attachEvent("onClose", function () {
            window.location.reload();
     });
}

function saveOrUpdate(){
	var filePath = $("filePath").value;
	if(filePath.trim().length==0){
		dhx.alert("未选择文件!");
		return;
	}
	var fileName = $("fileName").value;
	if(fileName.trim().length==0){
		dhx.alert("文件名未填写!");
		return;
	}
	var mark =$("mark").value;
	if(addOrUpdate==1){
		MetaShareJarAction.insertJarInfo(filePath.trim(),fileName.trim(),mark,function(data){
			   if(data==1){
				   dhx.alert("新增成功");
				    dataTable.Page.currPageNum = 1;
                    dataTable.refreshData();
                    saveWin.hide();
			   }else if(data==-2){
				   dhx.alert("jar包名称重复!");
			   }else{
				   dhx.alert("操作失败");
			   }
	    });
	}
    if(addOrUpdate==2){
    	MetaShareJarAction.updateJar(filePath.trim(),fileName.trim(),mark,shareJarId,function(data){
			   if(data==1){
				   dhx.alert("修改成功");
				    dataTable.Page.currPageNum = 1;
                    dataTable.refreshData();
                     saveWin.hide();
			   }else if(data==-2){
				   dhx.alert("jar包名称重复!");
			   }else{
				   dhx.alert("操作失败");
			   }
	    });
    }
    
} 


dhx.ready(pageInit);