var userFlag = false;
var dataTable = null;
var keyword = "";
function pageInit(){
	var termReq = TermReqFactory.createTermReq(1);
	var kwd = termReq.createTermControl("kwd","KEYWORD");
	kwd.setWidth(200);
    kwd.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    var circleType = termReq.createTermControl("circletype","CTYPE");
    circleType.enableReadonly(true);
    circleType.setAppendData([[0,"全部"]]);
    circleType.setListRule(0,[[1,"分"],[2,"小时"],[3,"周"],[4,"天"],[5,"月"]],0);
    
    dataTableInit();
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
}

function dataTableInit(){
	dataTable = new meta.ui.DataTable("dataDiv");
	dataTable.setColumns({
       TOPIC:"发送主题",
       CYCLE_TYPE:"发送周期",
       RULE:"发送时间",
       FAILED_TRY_TIMES:"重复次数",
       STATE:"状态",
       SEND_TYPE:"订阅类型",
       opt:"操作"
    },"TOPIC,CYCLE_TYPE,RULE,FAILED_TRY_TIMES,STATE,SEND_TYPE");
	dataTable.setFormatCellCall(function(rid,cid,data,colId){
		var circle = dataTable.getUserData(rid,"CYCLE_TYPE");
		var state = dataTable.getUserData(rid,"STATE");
		var trytimes = dataTable.getUserData(rid,"FAILED_TRY_TIMES");
		if(colId=="SEND_TYPE"){
			return "邮件";
		}
		if(colId=="OPT"){
			if(state=="0"){
				return '<a href="javascript:void(0)" onclick="view('+rid+')">查看</a>&nbsp;&nbsp;' +
				'<a href="javascript:void(0)" onclick="changeCfgState('+rid+',1)">启用</a>&nbsp;&nbsp;' +
				'<a href="javascript:void(0)" onclick="modify('+rid+')">修改</a>&nbsp;&nbsp;' +
				'<a href="javascript:void(0)" onclick="deleteEmail('+rid+')">删除</a>';
			}else{
				return '<a href="javascript:void(0)" onclick="view('+rid+')">查看</a>&nbsp;&nbsp;' +
				'<a href="javascript:void(0)" onclick="changeCfgState('+rid+',0)">禁用</a>';
			}
		}
		if(colId=="CYCLE_TYPE"){
			if(circle==1){
				return "分";
			}else if(circle==2){
				return "小时";
			}else if(circle==3){
				return "周";
			}else if(circle==4){
				return "天";
			}else if(circle==5){
				return "月";
			}
		}
		if(colId=="STATE"){
			if(state==1){
				return "运行中";
			}else{
				return "<span style='color:#a9a9a9;'>被禁用</span>";
			}
		}
		if(colId=="FAILED_TRY_TIMES"){
			if(trytimes==-1){
				return "无限";
			}else if(trytimes==0){
				return "不重复"
			}/*else{
				return data[rid];
			}*/
		}
		return data[cid];
	});
	dataTable.setPaging(true,20);//分页
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("25,8,26,8,10,8,15");
    dataTable.setGridColumnCfg(4,{align:"center"});
}
var showWindow = null;
function view(rid){
	if(!showWindow){
		showWindow = DHTMLXFactory.createWindow("showEmail","shEmail",0,0,650,440);	
        showWindow.stick();
		showWindow.denyResize();
		showWindow.denyPark();
		showWindow.button("minmax1").hide();
		showWindow.button("park").hide();
		showWindow.button("stick").hide();
		showWindow.button("sticked").hide();
		showWindow.keepInViewport(true);
		showWindow.center();
	    showWindow.setText("订阅信息查看");
		
    	var showFormDIV = document.getElementById("showmsg");
    	showFormDIV.style.width = 650-20 + "px";
	    showWindow.attachObject(showFormDIV);
	    var closeBtn2 = document.getElementById("closeBtn2");
	    attachObjEvent(closeBtn2,"onclick",function(){showWindow.close();});
	    showWindow.attachEvent("onClose",function(){
            showWindow.setModal(false);
            this.hide();
   		});
	}
	$("Sql").value= dataTable.getUserData(rid,"CONTENT_SQL");
	$("Topics").innerHTML = dataTable.getUserData(rid,"TOPIC");
	$("viewusername").innerHTML = dataTable.getUserData(rid,"USERNAMERS");
	$("Usertypes").innerHTML = dataTable.getUserData(rid,"TARGET_USER_TYPE")=="1"?"用户":"角色";
	$("Sendtypes").innerHTML = "邮件";//dataTable.getUserData(rid,"TOPIC");
	$("Sendtimes").innerHTML = dataTable.getUserData(rid,"RULE");
	$("Trytimess").innerHTML = dataTable.getUserData(rid,"FAILED_TRY_TIMES");
	$("Contents").value = dataTable.getUserData(rid,"CONTENT");
	var circle = dataTable.getUserData(rid,"CYCLE_TYPE");
	if(circle==1){
		$("Cycletypes").innerHTML = "分";
	}else if(circle==2){
		$("Cycletypes").innerHTML = "时";
	}else if(circle==3){
		$("Cycletypes").innerHTML = "周";
	}else if(circle==4){
		$("Cycletypes").innerHTML = "天";
	}else if(circle==5){
		$("Cycletypes").innerHTML = "月";
	}	
	showWindow.setModal(true);
	showWindow.show();
}

//修改
function modify(rid){
	addORmodify(2,rid);
}
//删除
function deleteEmail(rid){
	var id = dataTable.getUserData(rid,"CFG_ID");
	dhx.confirm("确认删除？",function(data){
		if(data){
			dhx.showProgress("数据请求中");
			SysEmailAction.deleteEmail(id,function(data){
			dhx.closeProgress();
			if(data){
				dhx.alert("成功删除");
				dataTable.refreshData();
			}else{
				dhx.alert("删除失败");
			}
			});
		}
	});
}
var sqlflag = false;
function testSQLforOnblur(){
	var testSqls = $("confgSql").value; 
	if(sqlflag){
		if(testSqls.trim().toUpperCase().substring(0,6)=="SELECT"){
			SysEmailAction.getKeyCol(testSqls,function(data){
				if(data!=null){
					$("Macrov").innerHTML = data;
				}
			});
		}
		sqlflag=false;
	}
}



//启用禁用
function changeCfgState(rid,state){
    dhx.confirm("你确定【"+(state?"启用":"禁用")+"】此配置吗?",function(r){
        if(r){
            var id = dataTable.getUserData(rid,"CFG_ID");
            dhx.showProgress("数据请求中");
            SysEmailAction.ableEmail(id,state?true:false,function(data){
                dhx.closeProgress();
                if(data){
                    dhx.alert("操作成功!");
                    dataTable.refreshData();
                }else{
                    dhx.alert("操作失败!");
                }
            });
        }
    });
}

var viewWindow = null;

function addORmodify(am,rid){
	var id = dataTable.getUserData(rid,"CFG_ID");
	if(!viewWindow){
		
		viewWindow = DHTMLXFactory.createWindow("Email","SHOWEmail",0,0,720,440);//
		viewWindow.stick();
		viewWindow.denyResize();
		viewWindow.denyPark();
		viewWindow.button("minmax1").hide();
		viewWindow.button("park").hide();
		viewWindow.button("stick").hide();
		viewWindow.button("sticked").hide();
		viewWindow.keepInViewport(true);
		viewWindow.center();
	   // viewWindow.setText("共享用户查看");
		
    	var tableFormDIV = document.getElementById("viewWindow");
    	tableFormDIV.style.width = 720-20 + "px";
	    viewWindow.attachObject(tableFormDIV);
	    var closeBtn = document.getElementById("closeBtn");
	    attachObjEvent(closeBtn,"onclick",function(){viewWindow.close();});
	    viewWindow.attachEvent("onClose",function(){
	    	$("Macrov").innerHTML="";
            viewWindow.setModal(false);
            this.hide();
            return false;
   		});
	}
 		dhtmlxValidation.addValidation($('topic'),"NotEmpty")
 		dhtmlxValidation.addValidation($('confgSql'),"NotEmpty")
 		dhtmlxValidation.addValidation($('content'),"NotEmpty")
 		dhtmlxValidation.addValidation($('userName'),"NotEmpty")
 	if(am==2){ //修改订阅配置
		viewWindow.setText("修改订阅配置");
		var timeType = dataTable.getUserData(rid,"CYCLE_TYPE");
		var SQL = dataTable.getUserData(rid,"CONTENT_SQL"); 
		var SQL = dataTable.getUserData(rid,"CONTENT_SQL");
		var Tpic = dataTable.getUserData(rid,"TOPIC");
		//var sdType = dataTable.getUserData(rid,"sendType"); 
		var tryTimes = dataTable.getUserData(rid,"FAILED_TRY_TIMES");
		var con = dataTable.getUserData(rid,"CONTENT");
		var targetUserType = dataTable.getUserData(rid,"TARGET_USER_TYPE");
		var targetUser = dataTable.getUserData(rid,"USERNAMERS");
		var cycle_rule = dataTable.getUserData(rid,"CYCLE_RULE");
		var keyss = dataTable.getUserData(rid,"keywordss")
		//初始化界面信息
		$("hiden").value=0;
		$("id").value=id;
		$("userName").value = targetUser;
		tableCollection.userId=targetUser;
		$("userORrole").value = targetUserType;
		$("sendCycle").value=timeType;
		$("confgSql").value = SQL;
		$("topic").value = Tpic;
		$("TryTimes").value = tryTimes;
		$("content").value = con;
		$("Macrov").innerHTML = keyss;
		if(targetUserType==1){  //选择用户
			$("userORrole").value=1;
			userFlag = false;
			name = "USER_NAMECN";
            ID = "USER_ID";
		}else if(targetUserType==2){  //选择角色
			$("userORrole").value=2;
			userFlag = true;
			name = "ROLE_NAME";
            ID = "ROLE_ID";
		}
		if(timeType == 1){  //时间周期为  分
			$("staMinu").value = cycle_rule.substr(0,cycle_rule.indexOf("#"));
			$("minuvalue").value = cycle_rule.substr(cycle_rule.indexOf("#")+1).substring(0,cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#"));
			$("minus").value = cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1);
			$("minu").style.display = "inline";
			$("hour").style.display = "none";
			$("day").style.display = "none";
			$("week").style.display = "none";
			$("month").style.display = "none";
		}
		if(timeType == 2){	//时间周期为 时
			$("staHours").value = cycle_rule.substr(0,cycle_rule.indexOf("#"));
			$("hourvalue").value = cycle_rule.substr(cycle_rule.indexOf("#")+1).substring(0,cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#"));
			$("hourminu").value =cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1).substring(0,cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1).indexOf(":"));
			$("hours").value =cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1).indexOf(":")+1);
			$("minu").style.display = "none";
			$("hour").style.display = "inline";
			$("day").style.display = "none";
			$("week").style.display = "none";
			$("month").style.display = "none";
		}
		if(timeType == 3){ //时间周期为 周
			$("weekvalue").value=cycle_rule.substr(cycle_rule.indexOf("#")+1).substring(0,cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#"));
			$("weekday").value=cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1).substring(0,cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1).indexOf(","));
			var temp = cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1).indexOf(",")+1);
			$("weekhour").value= temp.substring(0,temp.indexOf(":"));
			$("weekminu").value=temp.substring(temp.indexOf(":")+1).substring(0,temp.substring(temp.indexOf(":")+1).indexOf(":"));
			
			
			$("minu").style.display = "none";
			$("hour").style.display = "none";
			$("day").style.display = "none";
			$("week").style.display = "inline";
			$("month").style.display = "none";
		}
		if(timeType == 4){  //时间周期为 天
			$("staDay").value = cycle_rule.substr(0,cycle_rule.indexOf("#"));
			//cycle_rule = 22#2#13:55:00
			$("dayvalue").value= cycle_rule.substr(cycle_rule.indexOf("#")+1).substring(0,cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#"));
			var temp = cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1);
			$("dayhour").value = temp.substring(0,temp.indexOf(":"));
			$("dayminu").value = temp.substr(temp.indexOf(":")+1).substring(0,temp.substr(temp.indexOf(":")+1).indexOf(":"));
			//$("dayminu").value = temp.substr(temp.indexOf(":"))   //temp.substring(temp.indexOf(":")+1,temp.substr());
			$("minu").style.display = "none";
			$("hour").style.display = "none";
			$("day").style.display = "inline";
			$("week").style.display = "none";
			$("month").style.display = "none";
		}
		if(timeType == 5){  //时间周期为 月
			$("staMonth").value = cycle_rule.substr(0,cycle_rule.indexOf("#"));
			$("month").value = cycle_rule.substr(cycle_rule.indexOf("#")+1).substring(0,cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#"));
			$("monthday").value = cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1).substring(0,cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1).indexOf(","));
			var temp = cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).substr(cycle_rule.substr(cycle_rule.indexOf("#")+1).indexOf("#")+1).indexOf(",")+1);
			$("monthhour").value= temp.substring(0,temp.indexOf(":"));
			$("monthminu").value=temp.substring(temp.indexOf(":")+1).substring(0,temp.substring(temp.indexOf(":")+1).indexOf(":"));

			
			$("minu").style.display = "none";
			$("hour").style.display = "none";
			$("day").style.display = "none";
			$("week").style.display = "none";
			$("month").style.display = "inline";
		}
			
	}else{   //新增订阅配置
		$("hiden").value=1;
		$("confgSql").value ="";
		$("topic").value = "";
		$("TryTimes").value = "";
		$("content").value = "";
		$("Macrov").innerHTML= "";
		$("userName").value = "";
		$("TryTimes").value=1;
		viewWindow.setText("新增订阅配置");
	}
    selectInit();
	viewWindow.setModal(true);
	viewWindow.show();	   
}
function change(){
	$("Macrov").innerHTML="";
	sqlflag = true;
}

//时间输入框验证
function InputTest(s){
	if(s.value.length >2){
		s.value = s.value.substr(s.value.length-2,s.value.length);
    }
	if(!(/^\d+$/.test(s.value) )) 
	{ 
		s.value="00";
		if(s.id=="minuvalue"){
			s.value="01";
		}
	}
	if(parseInt(s.value)<=0){
		s.value="00";
		if(s.id=="minuvalue"){
			s.value="01";
		}
	}
	if(parseInt(s.value)>59){
		s.value="59";
	}
}
function test(obj){
	if(obj.value.length==1){
		obj.value ="0" + obj.value ;
	}
}

function InputHourTest(s){
	if(!(/^\d+$/.test(s.value) )) 
	{ 
		s.value="00";
	}
	if(s.value.length >2){
		s.value = s.value.substr(s.value.length-2,s.value.length);
    }
	if(parseInt(s.value)<0){
		s.value="00";
	}
	if(parseInt(s.value)>23){
		s.value="23";
	}
}



var name = "USER_NAMECN";  //用于输入跟随变量，   默认新增时选择用户
var ID = "USER_ID";    //用于输入跟随变量，    默认新增时选择用户
function userChange(){
	var userORrole = $("userORrole").value;
	if(userORrole==1){
		userFlag = false;
		name = "USER_NAMECN";
		ID = "USER_ID";
	}else if(userORrole==2){
		userFlag=true;
		name = "ROLE_NAME";
		ID = "ROLE_ID";
	}
	$("userName").value = "";
}

function testSql(){   
	if(!dhtmlxValidation.validate("confgSql")){
		return ;
	}
	var sql = $("confgSql").value;
	SysEmailAction.getKeyCol(sql,function(data){
		if(!(data==null)){
			dhx.alert("执行SQL成功!");
			$("Macrov").innerHTML=data;
			keyword = data;
		}else{
			dhx.alert("执行测试SQL出错!");
			$("Macrov").innerHTML= "";
		}
	});
}

function addOrUpdateEmail(){  //增加/修改订阅配置
	var id = $("id").value;
	var hiden = $("hiden").value;
	var sqltemp = $("confgSql").value;
	var topictemp = $("topic").value;
	var trytimestemp = $("TryTimes").value;
	var contenttemp = $("content").value;
	var sendtypetemp = $("sendType").value;   // 发送方式  （邮件/短信） 暂时没使用
	var sendcycletemp = $("sendCycle").value;
	var TargetuserTypetemp = $("userORrole").value;
	
	if(!(sqltemp.trim().toUpperCase().substring(0,6)==("SELECT"))){
		dhx.alert("非法SQL");
		return;
	}
	
	var sendtimetemp="";
	var data = {sql:"sqltemp"};//,topic:topictemp,trytimes:trytimestemp,content:contenttemp,sendtype:sendtypetemp};	if(sendcycletemp==1){
	if(sendcycletemp==1){  //发送周期为
		var mm = $("staMinu").value;
		var minuvalue = $("minuvalue").value;
		var minus = $("minus").value;
		sendtimetemp = mm+"#"+minuvalue+"#"+minus;
		var data = {key:keyword,idrs:id,TargetuserTypers:TargetuserTypetemp,sqlrs:sqltemp,topicrs:topictemp,trytimesrs:trytimestemp,contentrs:contenttemp,sendtypers:sendtypetemp,sendcyclers:sendcycletemp,sendtimers:sendtimetemp};
	}
	if(sendcycletemp==2){
		var hh = $("staHours").value;
		var hourvalue = $("hourvalue").value;
		var hourminu = $("hourminu").value;
		var hours = $("hours").value;
		sendtimetemp = hh+"#"+hourvalue+"#"+hourminu+":"+hours;
		var data = {key:keyword,idrs:id,TargetuserTypers:TargetuserTypetemp,sqlrs:sqltemp,topicrs:topictemp,trytimesrs:trytimestemp,contentrs:contenttemp,sendtypers:sendtypetemp,sendcyclers:sendcycletemp,sendtimers:sendtimetemp};
	}
	if(sendcycletemp==3){
		var weekvalue = $("weekvalue").value;
		var weekday = $("weekday").value;
		var weekhour = $("weekhour").value;
		var weekminu = $("weekminu").value;
		sendtimetemp = "0"+"#"+weekvalue+"#"+weekday+","+weekhour+":"+weekminu+":00";
			
		var data = {key:keyword,idrs:id,TargetuserTypers:TargetuserTypetemp,sqlrs:sqltemp,topicrs:topictemp,trytimesrs:trytimestemp,contentrs:contenttemp,sendtypers:sendtypetemp,sendcyclers:sendcycletemp,sendtimers:sendtimetemp};
	}
	if(sendcycletemp==4){
		var dd = $("staDay").value;
		var dayvalue = $("dayvalue").value;
		var dayhour = $("dayhour").value;
		var dayminu = $("dayminu").value;
		sendtimetemp = dd+"#"+dayvalue+"#"+dayhour+":"+dayminu+":00";
		var data = {key:keyword,idrs:id,TargetuserTypers:TargetuserTypetemp,sqlrs:sqltemp,topicrs:topictemp,trytimesrs:trytimestemp,contentrs:contenttemp,sendtypers:sendtypetemp,sendcyclers:sendcycletemp,sendtimers:sendtimetemp};
	}
	if(sendcycletemp==5){
		var mo = $("staMonth").value;
		var monthvalue = $("monthvalue").value;
		var monthday = $("monthday").value;
		var monthminu = $("monthminu").value;
		var monthhour = $("monthhour").value;
		sendtimetemp = mo+"#"+monthvalue+"#"+monthday+","+monthhour+":"+monthminu+":00";
		var data = {key:keyword,idrs:id,TargetuserTypers:TargetuserTypetemp,sqlrs:sqltemp,topicrs:topictemp,trytimesrs:trytimestemp,contentrs:contenttemp,sendtypers:sendtypetemp,sendcyclers:sendcycletemp,sendtimers:sendtimetemp};
	}
	if(hiden==0){
		if(!dhtmlxValidation.validate("userName")||!dhtmlxValidation.validate("topic")||!dhtmlxValidation.validate("content")||!dhtmlxValidation.validate("confgSql")){
			return;
		}
		if($("Macrov").innerHTML==""){
			dhx.alert("请测试SQL是否正确");
			return ;
		};
		tableCollection.userId = $("userName").value;		
		SysEmailAction.updateEmail(data,tableCollection.userId,function(result){
			if(result){
				dataTable.refreshData();
				dhx.alert("修改成功！");
				viewWindow.close();
			}else{
				dhx.alert("修改失败")
			}
		});
	}else if(hiden==1){
		if(!dhtmlxValidation.validate("userName")||!dhtmlxValidation.validate("topic")||!dhtmlxValidation.validate("content")||!dhtmlxValidation.validate("confgSql")){
			return;
		}
		if($("Macrov").innerHTML==""){
			dhx.alert("请测试SQL是否正确");
			return ;
		}
		tableCollection.userId = $("userName").value;
		SysEmailAction.addEmail(data,tableCollection.userId,function(rs){
			if(rs){
				dataTable.refreshData();
				dhx.alert("添加成功");
				viewWindow.close();
			}else{
				dhx.alert("添加失败")
			}
		});
	}
		
	
}


function msg(){
	var cycl = $("sendCycle").value;
	
	
	if(cycl == 1){
		$("minu").style.display = "inline";
		$("hour").style.display = "none";
		$("day").style.display = "none";
		$("week").style.display = "none";
		$("month").style.display = "none";
	}
	if(cycl == 2){
		$("minu").style.display = "none";
		$("hour").style.display = "inline";
		$("day").style.display = "none";
		$("week").style.display = "none";
		$("month").style.display = "none";
	}
	if(cycl == 3){
		$("minu").style.display = "none";
		$("hour").style.display = "none";
		$("day").style.display = "none";
		$("week").style.display = "inline";
		$("month").style.display = "none";
	}
	if(cycl == 4){
		$("minu").style.display = "none";
		$("hour").style.display = "none";
		$("day").style.display = "inline";
		$("week").style.display = "none";
		$("month").style.display = "none";
	}
	if(cycl == 5){
		$("minu").style.display = "none";
		$("hour").style.display = "none";
		$("day").style.display = "none";
		$("week").style.display = "none";
		$("month").style.display = "inline";
	}
}
//1 
function queryData(dt,params){
   var termVals=TermReqFactory.getTermReq(1).getKeyValue();
   dhx.showProgress("数据请求中");
   SysEmailAction.querySysEmail(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
       dhx.closeProgress();
       var total=0;
       if(data && data[0])
           total=data[0]["TOTAL_COUNT_"];
       dataTable.bindData(data,total);
   });
   
}

var tableCollection = {};
function selectInit(){
	SysEmailAction.queryRoleOrUserInfo({},userFlag,function(data){
	tableCollection.allTables = data;
	});
}
function selectRoleAndUesr(obj){
	var inputId = obj.id;
    AutoCpFactory.destructorAutoCp(inputId+"_ac");
    tableCollection.autoCp = new meta.ui.autoCompletion(inputId);
    tableCollection.autoCp.setWidthPy(-2);
    tableCollection.autoCp.setTargetEnterCall(SysEmailAction.queryRoleOrUserInfo);
    tableCollection.autoCp.setEmptyValueQueryMode(1);		//为空时也会启动跟随事件
    tableCollection.autoCp.setMaxHeightByCount(8);			//最大高度
    tableCollection.autoCp.setDataQueryFun(function(v){		//设置输入跟随查询事件
        SysEmailAction.queryRoleOrUserInfo({keyWord:v},userFlag,function(data){
            if(data && data.length){
                tableCollection.allTables = data;
                /******设置动态高度******/
                if(data.length < 8){
                    tableCollection.autoCp.setMaxHeightByCount(data.length);
                }else{
                    tableCollection.autoCp.setMaxHeightByCount(8);
                }
                /******设置动态高度******/
                for(var i=0;i<data.length;i++){
                    tableCollection.autoCp.appendData(data[i][name],null,data[i][ID]);

                }
            }
        });
    });

    tableCollection.autoCp.clearData();		//清空数据
    SysEmailAction.queryRoleOrUserInfo({keyWord:""},userFlag,function(data){
        if(data && data.length){
            tableCollection.allTables = data;
            /******设置动态高度******/
            if(data.length < 8){
                tableCollection.autoCp.setMaxHeightByCount(data.length);
            }else{
                tableCollection.autoCp.setMaxHeightByCount(8);
            }
            /******设置动态高度******/
            for(var i=0;i<data.length;i++){
                tableCollection.autoCp.appendData(data[i][name],null,data[i][ID]);

            }
        }
    });
    tableCollection.autoCp.showHide(1,1);
}

function cancelBubble(e) {
    e = e || window.event;
    if (!e)return false;
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.cancelBubble = true;
    return false;
}

dhx.ready(pageInit);