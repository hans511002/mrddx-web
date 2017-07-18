// 查询相关变量
var userList = new Array();
var userRuleList = new Array();
var xmlhttp;
var macro_params = null;
var sql_params = null;
var startdt;
var curRule;
var maintainWin = null;
var moveParamObj = null;
var paramRexArr = []; // 存放宏变量
var paramInitArr = new Array();// 初始化加载的宏变量

// 查询结果
var currentData = new Array();
var enField = new Array();
var chField = new Array();
var totalCount = 0;
var totalPageSize = -1;
var currentPage = 1;
var currentCount = 0;
var status = "false";
var index = 1;

page_int();
function page_int() {
	init_user_list();// 初始化用户列表
}

// 查询用户列表
function init_user_list() {
	userList = new Array();
	var userV = {};
	userV["STATE"] = 0;
	TestRuleAction.queryUserListAction(userV, function(data) {
		for (var i = 0; i < data.length; i++) {
			var tmp = new Array();
			tmp.push(data[i].USER_ID);
			tmp.push(data[i].USER_NAME);
			userList.push(tmp);
		}
		if (qryRuleId != null && qryRuleId != 'null') {

			var tmpList = new Array();
			AuthorityAction.queryAuthrityInfoByQryId(qryRuleId, function(data) {
				for (var i = 0; i < data.length; i++) {
					for (var m = 0; m < userList.length; m++) {
						if (userList[m][0] == data[i].USER_ID) {
							var tmp = new Array();
							tmp.push(userList[m][0]);
							tmp.push(userList[m][1]);
							tmpList.push(tmp);
						}
					}
				}
				userList = tmpList;
				user_list_change();
			});
		} else {
			user_list_change();
		}
	});

}

// 改变用户列表
function user_list_change() {
	var paramsTD = document.getElementById("user_id");
	paramsTD.options.length = 0;
	paramsTD.options[m] = new Option("", "");
	for (var m = 0; m < userList.length; m++) {
		paramsTD.options[m + 1] = new Option(userList[m][1], userList[m][1]);
	}

}

// 用户改变
function user_change() {
	// 查询改变修改查询规则id的列表
	var userid = $("user_id");
	var userIdValue;
	for (var i = 0; i < userList.length; i++) {
		if (userid.value == userList[i][1]) {
			userIdValue = userList[i][0];
		}
	}

	query_user_rule(userIdValue);
}

// 查询用户对应的规则列表
function query_user_rule(userid) {
	userRuleList = new Array();
	TestRuleAction.queryUserRuleListAction(userid, function(data) {
		var idTmp = new Array();
		var maptmp = new Map();
		for (var i = 0; i < data.length; i++) {
			var tmp = new Array();
			tmp.push(data[i].QRY_RULE_ID);
			tmp.push(data[i].QRY_RULE_NAME);
			tmp.push(data[i].PAGINATION_SIZE);
			idTmp.push(data[i].QRY_RULE_ID);
			maptmp.put(data[i].QRY_RULE_ID, tmp);
		}

		// 降序排列
		idTmp.sort(function(e1, e2) {
			return e1 > e2 ? -1 : (e1 < e2 ? 1 : 0);
		});
		for (var i = 0; i < idTmp.length; i++) {
			userRuleList.push(maptmp.get(idTmp[i]));
		}

		var paramsTD = document.getElementById("rule_id");
		paramsTD.options.length = 0;
		for (var i = 0; i < userRuleList.length; i++) {
			paramsTD.options[i] = new Option(userRuleList[i][0] + ":"
					+ userRuleList[i][1], userRuleList[i][0] + ":"
					+ userRuleList[i][1]);
		}
		document.getElementById("rule_id").value = qryRuleId + ":"
				+ qryRuleName;
		rule_id_change();
	});
	return userRuleList;
}
function rule_id_change() {
	var ruleId = $("rule_id").value;

	var rule_id = ruleId.substring(0, ruleId.indexOf(":"));
	if (rule_id != "") {
		TestRuleAction.queryRexByQryId(rule_id, {
			async : false,
			callback : function(data) {
				if (data) {
					paramInitArr = data;
				}
			}
		});
	}
	var ruleListparamsTD = document.getElementById("rule_list");
	var ruleListhtml = '';
	for (var i = 0; i < userRuleList.length; i++) {
		if (rule_id == userRuleList[i][0]) {
			if (0 == userRuleList[i][2]) {
				ruleListparamsTD.options[0] = new Option("全部查询", "0");
			} else {
				ruleListparamsTD.options[0] = new Option("分页查询", "1");
			}
			break;
		}
	}
	rule_list_change();
}

function rule_list_change() {
	var paramsTD = $("paramsTD");
	var rule_list = $("rule_list");
	var ruleId = rule_list.value;
	if (ruleId == -1 || "" == ruleId) {
		var html = '<table width="100%" border="0" align="center" cellpadding=0 cellspacing="2" class="table_list2" >';
		html += "</table>";
		paramsTD.innerHTML = html;
		return;
	}

	var html = '<table width="100%" border="0"  align="center" cellpadding="0" cellspacing="1" class="table_list2" >';
	html += "<tr>";
	html += "<td class='label_blod1'>";
	html += "<span style='color: red'>*</span>开始RowKey：";
	html += "</td>";
	html += "<td class='label_blod1'>";
	html += "<input type='text' id='startrowkey' ";
	html += "style='width:200px;'/>";
	html += "</td>";
	html += "</tr>";

	html += "<tr>";
	html += "<td class='label_blod1'>";
	html += "<span style='color: red'>*</span>结束RowKey：";
	html += "</td>";
	html += "<td class='label_blod1'>";
	html += "<input type='text' id='endrowkey' ";
	html += "style='width:200px;'/>";
	html += "</td>";
	html += "</tr>";

	if (ruleId == 1) {
		html += "<tr>";
		html += "<td class='label_blod1'>";
		html += "<span style='color: red'>*</span>当前页码：";
		html += "</td>";
		html += "<td class='label_blod1'>";
		html += "<input type='text' id='currentpage' ";
		html += "style='width:200px;'/>";
		html += "</td>";
		html += "</tr>";

		html += "<tr>";
		html += "<td class='label_blod1'>";
		html += "<span style='color: red'>*</span>每页条数：";
		html += "</td>";
		html += "<td class='label_blod1'>";
		html += "<input type='text' id='pagesize' ";
		html += "style='width:200px;'/>";
		html += "</td>";
		html += "</tr>";

		html += "<tr>";
		html += "<td class='label_blod1'>";
		html += "排序列：";
		html += "</td>";
		html += "<td class='label_blod1'>";
		html += "<input type='text' id='orderbycolumn' ";
		html += "style='width:200px;'/>";
		html += "</td>";
		html += "</tr>";

		html += "<tr>";
		html += "<td class='label_blod1'>";
		html += "排序类型：";
		html += "</td>";
		html += "<td class='label_blod1'>";
		html += "<select style='width:200px' id='orderbytype'>";
		html += "<option value='-1'>--请选择--</option><option value='2'>字符串</option><option value='0'>整数</option><option value='1'>小数</option><option value='3'>时间</option></select>";
		html += "</td>";
		html += "</tr>";

		html += "<tr>";
		html += "<td class='label_blod1'>";
		html += "排序方式：";
		html += "</td>";
		html += "<td class='label_blod1'>";
		html += "<select style='width:200px' id='orderdesc'>";
		html += "<option selected='selected' value='0'>升序</option><option value='1'>降序</option></select>";
		html += "</td>";
		html += "</tr>";

		html += "<tr>";
		html += "<td class='label_blod1'>";
		html += "分组字段：";
		html += "</td>";
		html += "<td class='label_blod1'>";
		html += "<input type='text' id='groupbycolumn' ";
		html += "style='width:200px;'/>";
		html += "</td>";
		html += "</tr>";

		html += "<tr>";
		html += "<td class='label_blod1'>";
		html += "统计方法：";
		html += "</td>";
		html += "<td class='label_blod1'>";
		html += "<input type='text' id='groupbystatistics' ";
		html += "style='width:200px;'/>";
		html += "</td>";
		html += "</tr>";

		html += "<tr>";
		html += "<td class='label_blod1'>";
		html += "返回统计数据:";
		html += "</td>";
		html += "<td class='label_blod1'>";
		html += "<select style='width:200px' id='returnstatistics'>";
		html += "<option  value='0'>否</option><option selected='selected' value='1'>是</option></select>";
		html += "</td>";
		html += "</tr>";

		html += "<tr>";
		html += "<td class='label_blod1'>";
		html += "返回清单数据:";
		html += "</td>";
		html += "<td class='label_blod1'>";
		html += "<select style='width:200px' id='returndata'>";
		html += "<option value='0'>否</option><option selected='selected' value='1'>是</option></select>";
		html += "</td>";
		html += "</tr>";

	}
	html += "</table>";
	var divHeight = "90px";
	if (paramInitArr.length < 1) {
		divHeight = "0px";
	}
	html += '<div style="overflow: auto;height:'
			+ divHeight
			+ ';" id="macroDiv"><table id="macroVariableTable" width="100%" border="0" align="center" cellpadding="0" cellspacing="1" class="table_list2" >';
	for (var i = 1; i <= paramInitArr.length; i++) {
		html += "<tr>";
		html += "<td class='label_blod1'>";
		html += "宏变量" + paramInitArr[i - 1] + "：";
		html += "<td class='label_blod1'>";
		html += "<input type='text' id='macroVariable" + i + "'  ";
		html += "style='width:200px;'/>";
		html += "<td></td>"
		html += "</tr>";
	}

	/**
	 * html+="
	 * <tr>"; html+="
	 * <td class='label_blod1'>";
	 * html+="宏变量"+index+"：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"; html+="</td>";
	 * html+="
	 * <td class='label_blod1'>"; html+="<input type='text'
	 * id='macroVariable"+1+"' onkeyup='addMacroVariable(this,"+1+")'
	 * onblur='checkColumn(this)'"; html+="style='width:200px;'/>"; html+="</td>";
	 */
	html += "</table></div>";

	paramsTD.innerHTML = html;
}

/**
 * 添加一行字段列名
 */
function addMacroVariable(obj, rowIndex) {
	rowIndex = rowIndex + 1;
	if (obj != null) {
		var nextTr = obj.parentNode.parentNode.nextSibling;
		if (nextTr == null) {
			createMacroVariable(rowIndex);
		}
		var currTr = obj.parentNode.parentNode;
		if (currTr.lastChild.innerHTML == "<DIV>&nbsp;&nbsp;</DIV>"
				|| currTr.lastChild.innerHTML == "<div>&nbsp;&nbsp;</div>") {
			currTr.lastChild.innerHTML = "<a style='' href='#' onclick='deleteParamRow(this,"
					+ rowIndex + ")'>删除</a>";
		}
	}
}

function createMacroVariable(rowIndex) {
	var row = document.createElement("tr");
	row.onclick = function() {
		if (moveParamObj != null) {
			moveParamObj.style.background = "";
		}
		moveParamObj = this
		row.style.background = "#f5f7f8";
	}
	$("macroVariableTable").tBodies[0].appendChild(row);
	for (var i = 0; i < 3; i++) {
		var cell = document.createElement("td");
		cell.className = 'label_blod1';
		row.appendChild(cell);
		if (i == 0) {
			cell.innerHTML = "宏变量" + rowIndex + ":";
		}
		if (i == 1) {
			cell.innerHTML = "<input type='text' id='macroVariable" + rowIndex
					+ "' onkeyup='addMacroVariable(this," + rowIndex
					+ ")' onblur='checkColumn(this)' style='width:200px;'/>";
			;
		}
		if (i == 2) {
			cell.innerHTML = "<div>&nbsp;&nbsp;</div>";
		}
	}
	row._rowIndex = rowIndex;
}

// 删除一行参数信息
function deleteParamRow(obj, rowIndex) {
	var tr = obj.parentNode.parentNode;
	var table = tr.parentNode;
	table.removeChild(tr);
}

function checkColumn(obj) {
	var result = obj.value.match(/^(\{\w*\}=[\w]*)$/);
	if (result == null && obj.value != "") {
		dhx.alert("宏变量的格式必须是{name}=name");
		obj.focus();
	}

}
function createXMLHttpRequest() {
	if (window.ActiveXObject) {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	} else if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	}
}

function reportResult() {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		var dt2 = new Date();
		var m = (dt2.getHours() - startdt.getHours()) * 60 + dt2.getMinutes()
				- startdt.getMinutes();
		var s = m * 60 + dt2.getSeconds() - startdt.getSeconds();
		var mm = s * 1000 + dt2.getMilliseconds() - startdt.getMilliseconds();
		var st = (mm / 1000);
		remark.innerHTML = "完成 用时：" + st + "s";
		var value = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>";// alert(xmlhttp.responseText);
		if (xmlhttp.responseText && xmlhttp.responseText.length > 200000) {
			alert("数据量太大，无法直接显示在文本框中！\n请使用\"服务端测试\"访问。数据长度："
					+ xmlhttp.responseText.length);
			return;
		} else {
			value += xmlhttp.responseText;
		}
		$("jsoutput").value = formatXML(unmaskHTMLCode(value));
	}
}

function formatXML(str) {
	str = str.replace(/<(.*?)>/ig, '<$1>\n');
	str = str.replace(/<(.*?)>\n(.*?)<\/(.*?)>/ig, '<$1>$2<\/$3>');
	return str.replace(/<\/(.*?)><\/(.*?)>/ig, '<\/$1>\n<\/$2>');
}

function share(name) {
	$("jsinput").value = "";
	$("jsoutput").value = "";
	var rule_list = $("rule_list").value;
	var webServiceUrl = $("webServiceUrl").value;
	if (-1 == rule_list) {
		return;
	}

	if (!validateString($("user_id"), "测试用户")
			|| !validateString($("rule_id"), "测试规则ID")
			|| !validateString($("startrowkey"), "开始RowKey")
			|| !validateString($("endrowkey"), "结束RowKey")) {
		return;
	}

	for (var i = 1; i < $("macroVariableTable").rows.length + 1; i++) {
		// var index = $("macroVariableTable").rows[i].cells[0].innerHTML;
		var paramData = {}
		paramData.MACRO_VARIABLE = $("macroVariable" + i).value;
		if (paramData.MACRO_VARIABLE != "") {
			paramRexArr.push(paramData);
		}
	}

	var user_id = $("user_id").value;
	var user_pwd = $("user_pwd").value;
	var ruleid = $("rule_id").value;
	var rule_id = ruleid.substring(0, ruleid.indexOf(":"));
	var startrowkey = $("startrowkey").value;
	var endrowkey = $("endrowkey").value;
	var currentpage;
	var pagesize;
	var orderbycolumn;
	var orderbytype;
	var orderdesc;
	var groupbycolumn;
	var groupbystatistics;
	var returnstatistics;
	var returndata;

	var mesg = "";
	if (1 == rule_list) {
		currentpage = $("currentpage").value;
		pagesize = $("pagesize").value;
		orderbycolumn = $("orderbycolumn").value;
		orderbytype = $("orderbytype").value;
		orderdesc = $("orderdesc").value;
		groupbycolumn = $("groupbycolumn").value;
		groupbystatistics = $("groupbystatistics").value;
		returnstatistics = $("returnstatistics").value;
		returndata = $("returndata").value;
		if (!validateNum($("currentpage"), "当前页码")
				|| !validateNum($("pagesize"), "每页条数")) {
			return;
		}

		mesg += "{\"ruleCode\":\"hbase01\",\"type\":3,";
		mesg += "\"simpleMap\":{";
		mesg += "\"USERID\":\"" + user_id + "\",";
		mesg += "\"PASSWD\":\"" + user_pwd + "\",";
		mesg += "\"QUERY_RULE_ID\":\"" + rule_id + "\",";
		mesg += "\"START_KEY\":\"" + startrowkey + "\",";
		mesg += "\"END_KEY\":\"" + endrowkey + "\",";
		mesg += "\"CURRENT_PAGE\":\"" + currentpage + "\",";
		mesg += "\"PAGE_SIZE\":\"" + pagesize + "\",";
		mesg += "\"ORDERBY_COLUMN\":\"" + orderbycolumn + "\",";
		mesg += "\"ORDER_TYPE\":\"" + orderbytype + "\",";
		mesg += "\"GROUPBY_COLUMN\":\"" + groupbycolumn + "\",";
		mesg += "\"GROUPBY_STATISTICS\":\"" + groupbystatistics + "\",";
		mesg += "\"RETURN_STATISTICS\":\"" + returnstatistics + "\",";
		mesg += "\"RETURN_DATA\":\"" + returndata + "\",";
		for (var i = 0; i < paramRexArr.length; i++) {
			mesg += "\"" + paramInitArr[i] + "\":\""
					+ paramRexArr[i]["MACRO_VARIABLE"] + "\",";
		}
		mesg += "\"ORDER_DESC\":\"" + orderdesc + "\"";

		mesg += "}}";
		paramRexArr = [];
	} else {

		mesg += "{\"ruleCode\":\"hbase01\",\"type\":3,";
		mesg += "\"simpleMap\":{";
		mesg += "\"USERID\":\"" + user_id + "\",";
		mesg += "\"PASSWD\":\"" + user_pwd + "\",";
		mesg += "\"QUERY_RULE_ID\":\"" + rule_id + "\",";
		mesg += "\"START_KEY\":\"" + startrowkey + "\",";
		for (var i = 0; i < paramRexArr.length; i++) {
			var tempArr = paramRexArr[i]["MACRO_VARIABLE"];
			mesg += "\"" + paramInitArr[i] + "\":\"" + tempArr + "\",";
		}
		mesg += "\"END_KEY\":\"" + endrowkey + "\"";

		mesg += "}}";
		paramRexArr = [];
	}

	$("remark").innerHTML = "正在查询...";
	var URL = webServiceUrl;
	var soapMess = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
	soapMess += "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:app=\"http://app.ws.hq.hadoop.ery.com/\">";
	soapMess += "<soapenv:Body>";
	soapMess += "<app:" + name + ">";
	soapMess += "<app:jsonStr>" + mesg + "</app:jsonStr>";
	soapMess += "</app:" + name + ">";
	soapMess += "</soapenv:Body></soapenv:Envelope>";
	$("jsinput").value = soapMess;
	createXMLHttpRequest();
	xmlhttp.onreadystatechange = reportResult;
	xmlhttp.Open("POST", URL, true);
	xmlhttp.SetRequestHeader("SOAPAction", URL);
	xmlhttp.SetRequestHeader("Content-Type", "text/xml; charset=utf-8");
	var resval = formatXML(soapMess);
	startdt = new Date();
	xmlhttp.Send(soapMess);
}

// 验证参数
function validateNum(colm, name) {
	if (isNaN(colm.value) || colm.value == null || colm.value == "") {
		alert("\"" + name + "\" 参数必须是数字");
		colm.focus();
		return false;
	}
	return true;
}

// 验证参数
function validateString(colm, name) {
	if (colm.value == null || colm.value == "") {
		alert("\"" + name + "\" 参数不能为空");
		colm.focus();
		return false;
	}
	return true;
}

function queryData() {
	var ruleList = $("rule_list").value;
	if (-1 == ruleList) {
		return;
	}

	var user_id = $("user_id").value;
	var user_pwd = $("user_pwd").value;
	var rule_id = $("rule_id").value;
	var startrowkey = $("startrowkey").value;
	var endrowkey = $("endrowkey").value;

	var map = new Map();
	var amap = new Map();
	amap.put("_pmap_", map);
	map.put("USER_ID", "wanghao");
	map.put("USER_PWD", "123456");
	map.put("QUERY_RULE_ID", 1389);
	map.put("START_KEY", "8613308121444-2013/07/26");
	map.put("END_KEY", "8613308121444-2013/07/27");

	if (0 == ruleList) { // 全部查询
		TestRuleAction.executeQuery(amap, function(data) {
			var result = data.result;
			chField = result.chField;
			enField = result.enField;
			status = result.status;
			totalCount = result.totalCount;
			currentData = result.values;
			showData();
		});
	} else if (1 == ruleList) { // 分页查询
		var rule_list = $("rule_list").value;
		var currentpage = $("currentpage").value;
		var pagesize = $("pagesize").value;
		var orderbycolumn = $("orderbycolumn").value;
		var orderbytype = $("orderbytype").value;
		var orderdesc = $("orderdesc").value;

		map.put("CURRENT_PAGE", currentpage);
		map.put("PAGE_SIZE", pagesize);
		map.put("ORDERBY_COLUMN", orderbycolumn);
		map.put("ORDER_TYPE", orderbytype);
		map.put("ORDER_DESC", orderdesc);

		TestRuleAction.executeQuery(amap, function(data) {
			var result = data.result;
			chField = result.chField;
			enField = result.enField;
			status = result.status;
			totalCount = result.totalCount;
			totalPageSize = result.totalPageSize;
			currentPage = result.currentPage;
			currentCount = result.currentCount;
			showData();
		});
	}
}

function openPreview() {
	remark.innerHTML = "&nbsp;";
	var url = "preview.jsp?rule_id=" + $("rule_list").value;
	url += "&user=" + $("user_list").options[$("user_list").selectedIndex].text;
	url += "&pass=" + $("user_list").value;
	url += "&params=";
	if (macro_params) {
		for (var i = 0; i < macro_params.length; i++) {
			if ($("macroParams" + i).value != "")
				url += urlHandle(macro_params[i]) + ","
						+ urlHandle($("macroParams" + i).value.trim()) + ";";
		}
	}
	for (var i = 0; i < sql_params.length; i++) {
		var obj = $("opt_sqlParams" + i);
		var opts = (obj ? obj.value : "==");
		if (curRule[8] == '1')
			opts = "";
		if (opts + $("sqlParams" + i).value.trim() != "")
			url += urlHandle(sql_params[i]) + "," + opts
					+ urlHandle($("sqlParams" + i).value.trim()) + ";";
	}
	alert(url);
	winopen(url, "preview");
}

// 配置规则查询界面，测试点击方式
function openPreviewAction() {
	remark.innerHTML = "&nbsp;";
	var url = "testRule.jsp?rule_id=" + $("rule_list").value;
	url += "&user=" + $("user_list").options[$("user_list").selectedIndex].text;
	url += "&pass=" + $("user_list").value;
	url += "&params=";
	if (macro_params) {
		for (var i = 0; i < macro_params.length; i++) {
			if ($("macroParams" + i).value != "")
				url += urlHandle(macro_params[i]) + ","
						+ urlHandle($("macroParams" + i).value.trim()) + ";";
		}
	}
	for (var i = 0; i < sql_params.length; i++) {
		var obj = $("opt_sqlParams" + i);
		var opts = (obj ? obj.value : "==");
		if (curRule[8] == '1')
			opts = "";
		if (opts + $("sqlParams" + i).value.trim() != "")
			url += urlHandle(sql_params[i]) + "," + opts
					+ urlHandle($("sqlParams" + i).value.trim()) + ";";
	}
	alert(url);
	winopen(url, "preview");
}

function showData() {
	var title = "查看数据";
	var showDataTable = document.getElementById("showDataTable");

	var columns = "";
	var enColumns = "";
	var data = new Array();
	// 添加列表头
	data.push('<tr class="t_td">');
	for (var i = 0; i < enField.length; i++) {
		data.push('<th>');
		data.push(enField[i]);
		data.push('</th>');
	}
	data.push('</tr>');
	alert(currentData);

	// 添加数据
	for (var i = 0; i < enField.length; i++) {
		data.push('<tr>');
		for (var j = 0; j < enField.length; j++) {
			data.push('<td class="content_td">' + i + ',' + j + '</td>');
		}
		data.push('</tr>');
	}

	showDataTable.innerHTML = data.join('');
	if (!maintainWin) {
		maintainWin = DHTMLXFactory.createWindow("1", "maintainWin", 0, 0, 500,
				400);
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
		var downloadBtn = document.getElementById("downloadBtn");
		var calBtn = document.getElementById("calBtn");
		attachObjEvent(calBtn, "onclick", function() {
			maintainWin.close();
		});

		maintainWin.attachEvent("onClose", function() {
			maintainWin.setModal(false);
			this.hide();
			return false;
		});

		// dhtmlxValidation.addValidation(dataFormDIV, [
		// {target:"dateSourceName",rule:"NotEmpty,MaxLength[64]"},
		// {target:"dateSourceName",rule:"NotEmpty,MaxLength[64]"},
		// {target:"dateSourceName",rule:"NotEmpty,MaxLength[64]"},
		// {target:"dateSourceName",rule:"NotEmpty,MaxLength[64]"},
		// {target:"dateSourceName",rule:"NotEmpty,MaxLength[64]"},
		// {target:"dateSourceName",rule:"NotEmpty,MaxLength[64]"},
		// {target:"dateSourceName",rule:"NotEmpty,MaxLength[64]"},
		// {target:"dateSourceName",rule:"NotEmpty,MaxLength[64]"},
		// {target:"dateSourceName",rule:"NotEmpty,MaxLength[64]"},
		// {target:"dateSourceName",rule:"NotEmpty,MaxLength[64]"}
		// ],"true");
	}
	maintainWin.setText(title);
	maintainWin.setModal(true);
	maintainWin.show();
	maintainWin.center();
}

// 定义简单Map
function Map() {// 初始化map_,给map_对象增加方法，使map_像Map
	var map_ = new Object();
	map_.put = function(key, value) {
		map_[key] = value;
	};
	map_.get = function(key) {
		return map_[key];
	};
	map_.remove = function(key) {
		delete map_[key];
	};
	map_.keyset = function() {
		var ret = "";
		for ( var p in map_) {
			if (typeof p == 'string') {
				ret += ",";
				ret += p.substring(0, p.length - 1);
			}
		}
		if (ret == "") {
			return ret.split(",");
		} else {
			return ret.substring(1).split(",");
		}
	};
	return map_;
}