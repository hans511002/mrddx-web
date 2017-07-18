/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        del.js
 *Description：
 *      删除js
 *Dependent：
 *
 *Author:
 *        陈颖
 ********************************************************/
var flag = "RPT";//判断查询目标类型：RPT、TBL、DIM、RQM、PGM、GDL
var user = getSessionAttribute("user");
var userIdtemp = user.userId;//用于删除日志记录的删除人id
var widtemp = "20,20,10,15,10,15,10";//用于表格绘制的列宽度参数
var dataTable = null;//表格全局变量
var objIds = [];//批量删除未被使用指标ID搜集全局变量
cols = "REPORT_TITLE,REQUIRE_TITLE,REPORT_GROUP_NAME,REMARK,ADMIN_USER,CREATE_DATE";
        colsId = {
            REPORT_TITLE:"报表标题",
            REQUIRE_TITLE:"需求元数据表标题",
            REPORT_GROUP_NAME:"报表分类",
            REMARK:"备注",
            ADMIN_USER:"负责人",
            CREATE_DATE:"最后修改时间",
            opt:"操作"
        };
//页面初始化
function pageInit() {
    var termReq = TermReqFactory.createTermReq(1);
    dataTableInit();
    dataTable.setReFreshCall(queryData); //设置表格刷新的回调方法，即实际查询数据的方法
    dataTable.refreshData();
}

//初始化数据表格
function dataTableInit() {
    var dd = document.getElementById("dataDiv");
    var pageContent = document.getElementById("pageContent");
    var queryFormDIV = document.getElementById("queryFormDIV");
    queryFormDIV.style.width = pageContent.offsetWidth - 10 + "px";
    dd.style.width = pageContent.offsetWidth - 10 + "px";
    dd.style.height = pageContent.offsetHeight - queryFormDIV.offsetHeight - 5 + "px";
    dataTable = new meta.ui.DataTable("dataDiv");
    dataTable.setColumns(colsId, cols);
    dataTable.setFormatCellCall(function (rid, cid, data, colId) {
    	state = dataTable.getUserData(rid,"STATE");
        if (colId == "OPT") {
            return "<a href='javascript:void(0)' onclick='view(" + rid + ")'>查看</a>&nbsp;&nbsp;" +
                "<a href='javascript:void(0)' onclick='deleteObj(" + rid + ")'>删除</a>";
        }
        if(flag == "PGI"){
        	if(colId =="STATE"){
        		return state==1?"有效":"无效";
        	}
        }
        return data[cid];
    });
    dataTable.setPaging(true, 20);
    dataTable.render();
    dataTable.grid.setInitWidthsP(widtemp);
    dataTable.setGridColumnCfg(2, {align:"center"});
}
var showWindow = null;
function view(rid) {
    var Id = dataTable.getUserData(rid, "ID");
    if (flag == "GDL") {
        var gdlType = dataTable.getUserData(rid, "GDL_TYPE");
        var gdlVersion = dataTable.getUserData(rid, "GDL_VERSION");
        var gdlCode = dataTable.getUserData(rid, "GDL_CODE");
        if (gdlType == 0) {
            //基础指标查看
            openMenu("基础指标" + gdlCode, "/meta/module/gdl/gdlBasic/viewGdlBasic.jsp?gdlId=" + Id + "&gdlVersion=" + gdlVersion, "top", "bsgdlview_" + Id);
        } else if (gdlType == 1) {
            //复合指标
            openMenu("复合指标" + gdlCode, "/meta/module/gdl/composite/compositeGdlView.jsp?gdlId=" + Id + "&gdlVersion=" + gdlVersion, "top", "comgdlview_" + Id);
        } else if (gdlType == 2) {
            //计算
            openMenu("计算指标" + gdlCode, "/meta/module/gdl/calc/calcGdlView.jsp?gdlId=" + Id + "&gdlVersion=" + gdlVersion, "top", "calcgdlview_" + Id);
        }
    } else if (flag == "TBL") {
        var tblVersion = dataTable.getUserData(rid,"TABLE_VERSION");
        openMenu("查看模型", "/meta/module/tbl/view/tableInfo.jsp?tableId=" + Id + "&tableVersion="+tblVersion, "top");
    } else if (flag == "DIM") {
        var tableVersion = dataTable.getUserData(rid, "TABLE_VERSION");
        var url = "/meta/module/tbl/dim/viewDim.jsp?tableId=" + Id + "&tableVersion=" + tableVersion;
        openMenu("查看维度表", url, "top");
    } else if (flag == "RQM") {
        openMenu("查看需求", "/meta/module/reportManage/requirement/requirement.jsp?requId=" + Id, "top");
    } else if (flag == "RPT") {
        var reportTitle = dataTable.getUserData(rid, "REPORT_TITLE");	//报表标题
        openMenu(reportTitle + "信息查看", "/meta/module/reportManage/reportInfo/viewReportInfo.jsp?reportId=" + Id, "top", "view_" + Id);
    } else if (flag == "PGI") {
    	openMenu("查看程序实例","/meta/module/program/programInst/programInstanceOpt.jsp?state=search&instId="+Id+"","top","viewApp_");
    }
}

function selectChange(){  //select框值变化时的响应方法
	if($("dataType").value=="GDL"){  //如果是指标
		$("unUsedStyle").style.display = "inline";    //checkbox在什么时候显示与隐藏
		$("unUsedGdl").checked = false;              //每次值改变checkbox默认为未勾选
	}else{
		$("deteleAll").style.display = "none";
		$("unUsedStyle").style.display = "none";
	}
}

function changeType() {                      //每次点击查询按钮引起的表格查询内容变化响应方法
    $("dataDiv").innerHTML = "";
    flag = $("dataType").value;
    if (flag == "GDL") {  //当查询指标时的表格设置
    	$("unUsedStyle").style.display = "inline";
        cols = "GDL_CODE,GDL_NAME,TYPE,STATE,GDL_UNIT,USER_NAMECN,GDL_BUS_DESC";
        colsId = {
            GDL_CODE:"指标编码",
            GDL_NAME:"指标名称",
            GDL_TYPE:"指标类型",
            GDL_STATE:"指标状态",
            GDL_UNIT:"单位",
            USER_ID:"创建人",
            GDL_BUS_DESC:"业务解释",
            opt:"操作"
        };
        widtemp = "15,20,10,7,5,6,27,10";
    } else if (flag == "RPT") {//当查询报表时的表格设置
        cols = "REPORT_TITLE,REQUIRE_TITLE,REPORT_GROUP_NAME,REMARK,ADMIN_USER,CREATE_DATE";
        colsId = {
            REPORT_TITLE:"报表标题",
            REQUIRE_TITLE:"需求元数据表标题",
            REPORT_GROUP_NAME:"报表分类",
            REMARK:"备注",
            ADMIN_USER:"负责人",
            CREATE_DATE:"最后打开时间",
            opt:"操作"
        };
        widtemp = "25,20,10,15,10,10,10";
    } else if (flag == "DIM") {//当查询维度时的表格设置
        cols = "TABLE_NAME,TABLE_NAME_CN,TABLE_TYPE,TABLE_GROUP_NAME,DATA_SOURCE_NAME,TABLE_OWNER";
        colsId = {
            TABLE_NAME:"表类名称",
            TABLE_NAME_CN:"表类中文名",
            TABLE_TYPE:"层次分类",
            TABLE_GROUP_NAME:"业务类型",
            DATA_SOURCE_ID:"数据源",
            TABLE_OWNER:"所属用户",
            opt:"操作"
        };
        widtemp = "23,22,10,15,10,10,10";
    } else if (flag == "RQM") {//当查询需求时的表格设置
        cols = "REQUIRE_TITLE,REQUIRE_USER,REQUIRE_DEPT,REQUIRE_TIME,REQUIRE_ZONE";
        colsId = {
            REQUIRE_TITLE:"标题",
            REQUIRE_USER:"申请人",
            REQUIRE_DEPT:"申请人部门",
            REQUIRE_TIME:"需求时间",
            REQUIRE_ZONE:"需求地域",
//            REQUIRE_STATE:"需求状态",
            opt:"操作"
        };
        widtemp = "35,10,15,20,10,10";
    } else if (flag == "TBL") {//当查询模型时的表格设置
        cols = "TABLE_NAME,TABLE_NAME_CN,TABLE_TYPE,TABLE_GROUP_NAME,DATA_SOURCE_NAME,TABLE_OWNER";
        colsId = {
            TABLE_NAME:"表类名称",
            TABLE_NAME_CN:"表类中文名",
            TABLE_TYPE:"层次分类",
            TABLE_GROUP_NAME:"业务类型",
            DATA_SOURCE_ID:"数据源",
            TABLE_OWNER:"所属用户",
            opt:"操作"
        };
        widtemp = "23,22,10,15,10,10,10";
    } else if(flag == "PGI"){
    	cols = "INST_NAME,REQ_TITLE,USER_NAMECN,SIGN_DATE,GROUP_NAME,STATE";
        colsId = {
            INST_NAME:"程序实例名称",
            REQ_TITLE:"实现需求",
            USER_NAMECN:"登记人",
            SIGN_DATE:"最后修改时间",
            GROUP_NAME:"实例分类",
            STATE:"状态",
            opt:"操作"
        };
        widtemp = "23,22,10,15,10,10,10";
    }
    pageInit();
}

function enterEvent(obj) {  //设置key输入框enter事件
    if (event.keyCode == 13) {
        changeType();
    }
}
var deleteObjId = null;    //非批删除指标时的存放删除元素的id的全局变量
var confirmObj = null;    
var confirmWins = null;
function deleteObj(rid) {
	$("page").value=rid;
	$("synonymIs").value = (dataTable.getUserData(rid,"SYNONYM_DIM_TABLE_ID"));
    deleteObjId = dataTable.getUserData(rid, "ID");
    if (!confirmObj) {
        confirmObj = new Object();
        if (!confirmWins) {
            confirmWins = new dhtmlXWindows();
        }
        confirmWins.setImagePath(getBasePath() + "/meta/resource/images/");
        var id = "confirmdelwin";
        confirmObj.win = confirmWins.createWindow(id, 100, 100, 400, 200); //定义一个具体的window对象,默认是隐藏状态
        confirmObj.win.button("minmax1").hide();
        confirmObj.win.button("minmax2").hide();
        confirmObj.win.button("park").hide();
        confirmObj.win.denyResize();
        confirmObj.win.denyPark();
        confirmObj.win.center();//设置居中
        confirmObj.win.setModal(true);//加载mask
        confirmObj.win.setText("确认");
        confirmObj.win.setIcon('title_question.png');

        var msgDiv = document.createElement("Div");//创建win装载层
        msgDiv.setAttribute("id", id);
        document.body.appendChild(msgDiv);
        msgDiv.style.cssText = "height:150px;width:400px;background-color:#fff;position:relative";
        var attachDiv = document.getElementById(id);
        attachDiv.style.css = "height:150px;width:360px;";
        var textDiv = document.createElement("Div"); //创建window的文字层
        var imgDiv = document.createElement("Div");//创建图片层
        imgDiv.innerHTML = '<input type="image" src="' + getBasePath() + '/meta/resource/images/question.png"/>';
        imgDiv.style.cssText = "float:left;width:50px;margin-top:10px;margin-left:10px;";
        textDiv.setAttribute("id", "conTxtDiv" + id);
        textDiv.style.cssText = "font-size:13px;height:80px;width:250px;overflow-y:auto;padding-top:18px;float:right;margin-right:60px;color:red;";
        textDiv.innerHTML = "";
        attachDiv.appendChild(textDiv);
        var chkdiv = document.createElement("DIV");
        chkdiv.id = "checkDiv";
        chkdiv.style.cssText = "width:350px;top:65px;left:90px;position:absolute;background-color:#ffffff;color:blue;font-weight:bold";


        chkdiv.innerHTML = "<span id='ckk1'><input type='checkbox' id='ck1' name='chkdelfalg_1' title='删除指标' value='GDL'>删除指标</span>" +
            " <span id='ckk2'><input type='checkbox' id='ck2' name='chkdelfalg_1' title='删除报表' value='RPT'>删除报表</span>" +
            " <span id='ckk3'><input type='checkbox' id='ck3' name='chkdelfalg_1' title='删除实体表' value='INS'>删除实体表</span>" +"<br>"+
            " <span id='ckk4'><input type='checkbox' id='ck4' name='chkdelfalg_1' title='删除模型' value='TBL' onclick='onTableClick(this)'>删除模型</span>" +
            " <span id='ckk5'><input type='checkbox' id='ck5' name='chkdelfalg_1' title='删除需求' value='RQM'>删除需求</span>"+
            " <span id='ckk6'><input type='checkbox' id='ck6' name='chkdelfalg_1' title='删除程序' value='PGM'>删除程序</span>";


        attachDiv.appendChild(chkdiv);
        confirmObj.textDiv = textDiv;
        attachDiv.appendChild(imgDiv);
        var btnDiv = document.createElement("Div"); //创建window的按钮层
        btnDiv.setAttribute("id", "conBtnDiv" + id);
        btnDiv.style.cssText = "width:310px;";
        attachDiv.appendChild(btnDiv);
        confirmObj.win.attachObject(attachDiv);
        var data = [
            {
                type:"label",
                list:[
                    {type:"button",
                        value:"确定",
                        name:'ok',
                        offsetLeft:80,
                        offsetTop:10
                    },
                    {
                        type:"newcolumn"
                    },
                    {
                        type:"button",
                        value:"取消",
                        name:'cancel',
                        offsetLeft:10,
                        offsetTop:10
                    }
                ]
            }
        ]

        var myForm = new dhtmlXForm("conBtnDiv" + id, data);
        myForm.attachEvent("onButtonClick", function (name, command) {
            var key = "";
            confirmObj.win.close();
            confirmObj.win.setModal(false);
            if (name == "ok") {
                var keyvalue = document.getElementsByName("chkdelfalg_1");
                for (var i = 0; i < keyvalue.length; i++) {
                    if (keyvalue[i].checked) {
                        key = key + keyvalue[i].value + ",";
                    }
                }
                if($("page").value==-1){  //如果是批量删除未被使用GDL
                	var param = {userId:userIdtemp, objType:flag, objLinks:key.substring(0, key.length - 1), objIds:objIds};
                	DelAction.delAllObj(param, function (data) {
                 	   if (data.STATE) {
                 	       dhx.alert("删除成功");   
                    	   dataTable.refreshData();
                  	  } else {
                  	      dhx.alert("删除失败：" + data.ERROR_MESSAGE);
                  	  }
               	    });
                }else{//普通删除元数据
                	var param = {userId:userIdtemp, objType:flag, objLinks:key.substring(0, key.length - 1), objId:deleteObjId};
                	DelAction.delObj(param, function (data) {
                 	   if (data.STATE) {
                 	       dhx.alert("删除成功");
                 	       if($("page").value==1){//如果是此页的最后一条数据
                 	  	     	dataTable.Page.currPageNum = dataTable.Page.currPageNum - 1;
                 	       }
                    	    dataTable.refreshData();
                  	  } else {
                  	      dhx.alert("删除失败：" + data.ERROR_MESSAGE);
                  	  }
               	    });
                }
            }
        });
        confirmObj.win.attachEvent("onShow", function (w) {  //下面是关于不同查询目标的关联元素选择显示于隐藏
            confirmObj.win.setModal(true);//加载mask
            $("ck1").checked = false;
            $("ck2").checked = false;
            $("ck3").checked = false;
            $("ck4").checked = false;
            $("ck5").checked = false;
            $("ck6").checked = false;
	
            if (flag == "RPT") {//指标 报表 实体表 模型 需求
                $("ckk2").style.display = "none";
                $("ckk3").style.display = "none";
                $("ckk1").style.display = "inline";
                $("ckk4").style.display = "inline";
                $("ckk5").style.display = "inline";
                $("ckk6").style.display = "none";
            } else if (flag == "GDL") {
                $("ckk1").style.display = "none";
                $("ckk3").style.display = "none";
                $("ckk5").style.display = "none";
                $("ckk2").style.display = "inline";
                $("ck2").checked = true;
                $("ckk4").style.display = "inline";
                $("ckk6").style.display = "none";
            } else if (flag == "DIM") {
            	$("ckk3").style.display = "inline";
            	if($("synonymIs").value!="null"){
            		$("ckk3").style.display = "none";
            	}
                $("ckk1").style.display = "none";
                $("ckk2").style.display = "none";
                $("ckk4").style.display = "none";
                $("ckk5").style.display = "none";
                $("ckk6").style.display = "none";
            } else if (flag == "RQM") {
                $("ckk1").style.display = "none";
                $("ckk3").style.display = "none";
                $("ckk4").style.display = "none";
                $("ckk5").style.display = "none";
                $("ckk2").style.display = "inline";
                $("ckk6").style.display = "none";
            } else if (flag == "TBL") {
                $("ckk4").style.display = "none";
                $("ckk5").style.display = "none";
                $("ckk1").style.display = "inline";
                $("ckk2").style.display = "inline";
                $("ckk3").style.display = "inline";
                $("ckk6").style.display = "inline";
            } else if (flag == "PGI") {
            	$("ckk4").style.display = "none";
                $("ckk5").style.display = "none";
                $("ckk1").style.display = "none";
                $("ckk2").style.display = "none";
                $("ckk3").style.display = "none";
                $("ckk6").style.display = "none";
            }


        });
        confirmObj.win.attachEvent("onClose", function (w) {
            w.hide();
            w.setModal(false);
        });
        confirmObj.win.hide();
    }
    confirmObj.textDiv.innerHTML = "此操作将会直接在数据库删掉所有版本、关系、实例等信息，且无法通过界面恢复！确定吗？";
    var tableDiv = $("_tableDiv");
    if (tableDiv) {
        tableDiv.parentNode.removeChild(tableDiv);
    }
    confirmObj.win.show();
}

/**
 * 当关联的模型被删除时
 * @param e
 */
function onTableClick(input) {
    if (input.checked) {
        DelAction.queryTables({objType:flag, objId:deleteObjId}, function (data) {
            if (data && data.length > 0) {
                var tables = "";
                for (var i = 0; i < data.length; i++) {
                    tables += (i == 0 ? "" : ",") + data[i].TABLE_NAME;
                }
                var win = confirmWins.createWindow("wind", 100, 100, 400, 200);
                win.button("minmax1").hide();
                win.button("minmax2").hide();
                win.button("park").hide();
                win.denyResize();
                win.denyPark();
                win.center();//设置居中
                win.setModal(true);//加载mask
                win.setText("关联的模型");
                tableDiv = document.createElement("div");
                tableDiv.id = "_tableDiv";
                tableDiv.style.cssText = "word-wrap: break-word; word-break: normal;";
                tableDiv.style.marginTop = "5px";
                tableDiv.style.height = "100%";
                tableDiv.style.width = "100%";
                tableDiv.innerHTML = tables;
                win.attachObject(tableDiv);
                win.show();
            }
        })
    }
}
/**
 * 批量删除按钮响应事件
 */

function deleteAll(){   
	deleteObj(-1);
}

//查询数据
var params = {};
function queryData(dt, params) {
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    dhx.showProgress("数据请求中");
    DelAction.queryInfo({isUnUsedGdl:$("unUsedGdl").checked==true?"1":"0"}, flag, $("kwd").value, {posStart:params.page.rowStart, count:params.page.pageSize}, function (data) {
    	if(data!="" && $("dataType").value=="GDL" && $("unUsedGdl").checked == true){//批量删除按钮显示规则：只有当选择了查询指标且勾选了只查询未使用指标且查询数据不为空时，显示批量删除
    		$("deteleAll").style.display = "inline";
    		for(var i=0;i<data.length;i++){//收集批量删除的元素id，用数据类型变量存放
    			objIds.push(data[i].ID);
    		}
    	}else{
    		$("deteleAll").style.display = "none";
    	}
        dhx.closeProgress();
        var total = 0;
        if (data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data, total);//
    });
}

dhx.ready(pageInit);