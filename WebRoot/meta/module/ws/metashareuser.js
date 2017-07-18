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
var shareUserId = -1;
var currRid = 0;
//初始界面
function pageInit() {
	createPopWin();
    var termReq = TermReqFactory.createTermReq(1);

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
       addOrUpdate =1;
       saveOrUpdateUserInfo(-1,-1);
    });
}

//创建窗口
function createPopWin(){
	popWin = DHTMLXFactory.createWindow("1","popWin",0,0,500,175);
	    popWin.setText("查看共享用户");
        popWin.stick();
        popWin.denyResize();
        popWin.denyPark();
        popWin.button("minmax1").hide();
        popWin.button("park").hide();
        popWin.button("stick").hide();
        popWin.button("sticked").hide();
        popWin.center();
        popWin.attachObject($("showUserInfo"));
        popWin.hide();
        
     saveWin = DHTMLXFactory.createWindow("1","saveWin",0,0,500,190);
	    saveWin.stick();
        saveWin.denyResize();
        saveWin.denyPark();
        saveWin.button("minmax1").hide();
        saveWin.button("park").hide();
        saveWin.button("stick").hide();
        saveWin.button("sticked").hide();
        saveWin.center();
        saveWin.attachObject($("adduserInfo"));
        saveWin.hide();
        var addSumbit = Tools.getButtonNode("提交");
        addSumbit.onclick = saveOrUpdate;
        addSumbit.style.marginLeft = 160 + "px";
        addSumbit.style.cssFloat = "left";
        addSumbit.style.styleFloat = "left";
        addSumbit.style.marginTop = "10px";
        var resetBtn = Tools.getButtonNode("重置");
        resetBtn.style.cssFloat = "left";
        resetBtn.style.styleFloat = "left";
        resetBtn.style.marginLeft = "20px";
        resetBtn.style.marginTop = "10px";
        resetBtn.onclick = resetFun;
       $("btn2").appendChild(addSumbit);
       $("btn2").appendChild(resetBtn);
        
        updateWin = DHTMLXFactory.createWindow("1","updateWin",0,0,500,240);
	    updateWin.stick();
        updateWin.denyResize();
        updateWin.denyPark();
        updateWin.button("minmax1").hide();
        updateWin.button("park").hide();
        updateWin.button("stick").hide();
        updateWin.button("sticked").hide();
        updateWin.center();
        updateWin.attachObject($("userInfo"));
        updateWin.hide();
        var addSumbit = Tools.getButtonNode("提交");
        addSumbit.onclick = saveOrUpdate;
        addSumbit.style.marginLeft = 160 + "px";
        addSumbit.style.cssFloat = "left";
        addSumbit.style.styleFloat = "left";
        addSumbit.style.marginTop = "10px";
        var resetBtn = Tools.getButtonNode("重置");
        resetBtn.onclick = resetFun;
        resetBtn.style.cssFloat = "left";
        resetBtn.style.styleFloat = "left";
        resetBtn.style.marginLeft = "20px";
        resetBtn.style.marginTop = "10px";
       $("btn").appendChild(addSumbit);
       $("btn").appendChild(resetBtn);
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
        USER_NAME:"用户名",
        PWD:"密码",
        STATE:"状态",
        CREATER:"创建人",
        CRE_TIME:"创建时间",
        MARK:"备注",
        opt:"操作"
    },"SHARE_USER_NAME,SHARE_USER_PASSWD,SHARE_USER_STATE,USER_NAMECN,CREATE_DATE,REMARK");
    dataTable.setPaging(true,20);//分页
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("17,15,5,8,10,25,20");
    dataTable.setGridColumnCfg(2,{align:"center"});  
    dataTable.setGridColumnCfg(6,{align:"center"});  
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
        if(colId=="OPT"){
           var userState = dataTable.getUserData(rid,"SHARE_USER_STATE");
           var userId = dataTable.getUserData(rid,"SHARE_USER_ID");
           if(userState==1){
        	  var str = "<a href='#' onclick='showUserInfo("+rid+");return false;'>查看</a>";
        	      str+="&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='saveOrUpdateUserInfo("+rid+","+userId+");return false;'>修改</a>";
        	      str+="&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='operateUserInfo("+userId+",0);return false;'>禁用</a>";
        	      str+="&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='deleteUserInfo("+userId+");return false;'>删除</a>";
        	 return str;
           }else if(userState==0){
        	  var str = "<a href='#' onclick='showUserInfo("+rid+");return false;'>查看</a>";
        	      str+="&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='saveOrUpdateUserInfo("+rid+","+userId+");return false;'>修改</a>";
        	      str+="&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='operateUserInfo("+userId+",1);return false;'>启用</a>";
        	      str+="&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' onclick='deleteUserInfo("+userId+");return false;'>删除</a>";
        	 return str;
        }
       }
        if(colId=="STATE"){
        	var state = dataTable.getUserData(rid,"SHARE_USER_STATE");
        	if(state==1){
        		return "有效";
        	}
        	else if(state==0){
        		return "禁用";
        	}
        }
        return data[cid];
    });

    return dataTable;
}

//查询数据
function queryData(dt,params){
    var termVals=TermReqFactory.getTermReq(1).getKeyValue();
    var state = $("userState").value
    //termVals["_COLUMN_SORT"] = params.sort;
    dhx.showProgress("请求数据中");
    MetaShareUserAction.queryShareUser(termVals,state,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

//删除和禁用用户
function operateUserInfo(userId,flag){
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
   dhx.confirm("你确定要"+str+"此用户?", function (r) {
	   if(r){
		   MetaShareUserAction.operateUserInfo(userId,flag,function(data){
			   if(data==1){
				   dhx.alert("操作成功");
				    dataTable.Page.currPageNum = 1;
                    dataTable.refreshData();
			   }else if(data==-1){
				    dhx.alert("此用户已被使用,不能"+str);
			   }else if(data==-2){
				    dhx.alert("共享用户ID出错");
			   }else{
				   dhx.alert("操作失败");
			   }
		   })
	   }
   });
}

//查看 用户
function showUserInfo(userId){
	popWin.show();
	popWin.attachEvent("onClose",function(){
	            popWin.setModal(false);
	            this.hide();
	           
	 });
	 var _userName = dataTable.getUserData(userId,"SHARE_USER_NAME");
	 $("_userName").innerHTML=_userName;
	 var _pwd = dataTable.getUserData(userId,"SHARE_USER_PASSWD");
	 $("_pwd").innerHTML=_pwd;
	 var _creater = dataTable.getUserData(userId,"USER_NAMECN");
	 $("_creater").innerHTML=_creater;
	 var _creTime = dataTable.getUserData(userId,"CREATE_DATE");
	 $("_creTime").innerHTML=_creTime;
	 var _mark = dataTable.getUserData(userId,"REMARK");
	 if(_mark!=null){
	  $("_mark").innerHTML=_mark;
	 }else{
		 $("_mark").innerHTML="";
	 }
}
function saveOrUpdateUserInfo(rId,userId){
	if(userId!=-1){
	  shareUserId = userId;
	  currRid = rId;
	}
	if(userId<0){
		saveWin.show();
	    saveWin.attachEvent("onClose",function(){
	            saveWin.setModal(false);
	            this.hide();
	           
	    });
		saveWin.setText("新增共享用户");
		$("userName2").value="";
		$("pwd2").value="";
		$("mark2").value="";
	}else{
		addOrUpdate =2;
		updateWin.show();
	    updateWin.attachEvent("onClose",function(){
	            updateWin.setModal(false);
	            this.hide();
	           
	    });
		updateWin.setText("修改共享用户");
	 var _userName = dataTable.getUserData(rId,"SHARE_USER_NAME");
	 $("userName1").value=_userName;
	 var _pwd = dataTable.getUserData(rId,"SHARE_USER_PASSWD");
	 $("pwd").value=_pwd;
	 var _creater = dataTable.getUserData(rId,"USER_NAMECN");
	 $("creater").innerHTML=_creater;
	 var _creTime = dataTable.getUserData(rId,"CREATE_DATE");
	 $("creTime").innerHTML=_creTime;
	 var _mark = dataTable.getUserData(rId,"REMARK");
	 if(_mark!=null){
	  $("mark").value=_mark;
	 }else{
		 $("mark").value="";
	 }
	}
}

function saveOrUpdate(){
	if(addOrUpdate==1){
		var userName = $("userName2").value;
		if(userName.trim().length>64){
			dhx.alert("用户名超过长度!");
			return;
		}
		if(userName.trim().length==0){
			dhx.alert("用户名未填写!");
			return;
		}
		var pwd = $("pwd2").value;
		if(pwd.trim().length>64){
			dhx.alert("密码超过长度!");
			return;
		}
		if(pwd.trim().length==0){
			dhx.alert("密码未填写!");
			return;
		}
		var mark =$("mark2").value;
		MetaShareUserAction.insertUserInfo(userName.trim(),pwd.trim(),mark,function(data){
			   if(data==1){
				   dhx.alert("新增成功");
				    dataTable.Page.currPageNum = 1;
                    dataTable.refreshData();
                    saveWin.hide();
			   }else if(data==-2){
				   dhx.alert("共享用户名重复!");
			   }else{
				   dhx.alert("操作失败");
			   }
	    });
	}
    if(addOrUpdate==2){
    	var userName = $("userName1").value;
		if(userName.trim().length>64){
			dhx.alert("用户名超过长度!");
			return;
		}
		if(userName.trim().length==0){
			dhx.alert("用户名未填写!");
			return;
		}
		var pwd = $("pwd").value;
		if(pwd.trim().length>64){
			dhx.alert("密码超过长度!");
			return;
		}
		if(pwd.trim().length==0){
			dhx.alert("密码未填写!");
			return;
		}
		var mark =$("mark").value;
    	MetaShareUserAction.updateUser(userName.trim(),pwd.trim(),mark,shareUserId,function(data){
			   if(data==1){
				   dhx.alert("修改成功");
				    dataTable.Page.currPageNum = 1;
                    dataTable.refreshData();
                    saveWin.hide();
			   }else if(data==-2){
				   dhx.alert("共享用户名重复!");
			   }else{
				   dhx.alert("操作失败");
			   }
	    });
    }
    
} 

function resetFun(){
	if(addOrUpdate==1){
		$("userName2").value="";
		$("pwd2").value="";
		$("mark2").value="";
	}
	if(addOrUpdate==2){
		var _userName = dataTable.getUserData(currRid,"SHARE_USER_NAME");
		 $("userName1").value=_userName;
		 var _pwd = dataTable.getUserData(currRid,"SHARE_USER_PASSWD");
		 $("pwd").value=_pwd;
		 var _creater = dataTable.getUserData(currRid,"USER_NAMECN");
		 $("creater").innerHTML=_creater;
		 var _creTime = dataTable.getUserData(currRid,"CREATE_DATE");
		 $("creTime").innerHTML=_creTime;
		 var _mark = dataTable.getUserData(currRid,"REMARK");
		 if(_mark!=null){
		  $("mark").value=_mark;
		 }else{
			 $("mark").value="";
		 }
	}
}

function deleteUserInfo(userId){
	 dhx.confirm("你确定要删除此用户?", function (r) {
	   if(r){
		   MetaShareUserAction.deleteUserInfo(userId,function(data){
			   if(data==1){
				    dhx.alert("操作成功");
				    dataTable.Page.currPageNum = 1;
                    dataTable.refreshData();
			   }else if(data==-1){
				   dhx.alert("此用户已经被使用,不能删除");
			   }else{
				   dhx.alert("操作失败");
			   }
		   })
	   }
   });
}
dhx.ready(pageInit);