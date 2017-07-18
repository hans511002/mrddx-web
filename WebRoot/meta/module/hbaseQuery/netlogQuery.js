var dataTable = null; // 查询规则列表
var maintainWin = null; // 弹出界面

var xmlhttp;
var termReq;
var monS;
var monE;
var starDayHtml;
var endDayHtml;
var initHtml = '<select id="endDay" onchange="deloptS();">'
		+ '<option value="01">01日</option>' + '<option value="02">02日</option>'
		+ '<option value="03">03日</option>' + '<option value="04">04日</option>'
		+ '<option value="05">05日</option>' + '<option value="06">06日</option>'
		+ '<option value="07">07日</option>' + '<option value="08">08日</option>'
		+ '<option value="09">09日</option>' + '<option value="10">10日</option>'
		+ '<option value="11">11日</option>' + '<option value="12">12日</option>'
		+ '<option value="13">13日</option>' + '<option value="14">14日</option>'
		+ '<option value="15">15日</option>' + '<option value="16">16日</option>'
		+ '<option value="17">17日</option>' + '<option value="18">18日</option>'
		+ '<option value="19">19日</option>' + '<option value="20">20日</option>'
		+ '<option value="21">21日</option>' + '<option value="22">22日</option>'
		+ '<option value="23">23日</option>' + '<option value="24">24日</option>'
		+ '<option value="25">25日</option>' + '<option value="26">26日</option>'
		+ '<option value="27">27日</option>' + '<option value="28">28日</option>'
		+ '</select>';
/**
 * 页面初始化
 */
function pageInit() {
	String.prototype.replaceAll = function(s1, s2) {
		return this.replace(new RegExp(s1, "gm"), s2);
	}
	termReq = TermReqFactory.createTermReq(1);
	var month01 = document.getElementById("month01");
	var month02 = document.getElementById("month02");
	var month03 = document.getElementById("month03");
	var month04 = document.getElementById("month04");
	var month05 = document.getElementById("month05");
	var month06 = document.getElementById("month06");
	var month07 = document.getElementById("month07");

	var now = new Date();
	var va;
	va = now.getFullYear() + "" + (now.getMonth() + 1);
	month07.innerHTML = '<input name="monthValue" onclick="changeTime();" type="radio" value="'
			+ va
			+ '" checked="checked" />'
			+ now.getFullYear()
			+ '年'
			+ (now.getMonth() + 1) + '月';
	now = lastMonth(now);
	va = now.getFullYear() + "" + (now.getMonth() + 1);
	month06.innerHTML = '<input name="monthValue" onclick="changeTime();" type="radio" value="'
			+ va
			+ '" />'
			+ now.getFullYear()
			+ '年'
			+ (now.getMonth() + 1)
			+ '月';
	now = lastMonth(now);
	va = now.getFullYear() + "" + (now.getMonth() + 1);
	month05.innerHTML = '<input name="monthValue" onclick="changeTime();" type="radio" value="'
			+ va
			+ '" />'
			+ now.getFullYear()
			+ '年'
			+ (now.getMonth() + 1)
			+ '月';
	now = lastMonth(now);
	va = now.getFullYear() + "" + (now.getMonth() + 1);
	month04.innerHTML = '<input name="monthValue" onclick="changeTime();" type="radio" value="'
			+ va
			+ '" />'
			+ now.getFullYear()
			+ '年'
			+ (now.getMonth() + 1)
			+ '月';
	now = lastMonth(now);
	va = now.getFullYear() + "" + (now.getMonth() + 1);
	month03.innerHTML = '<input name="monthValue" onclick="changeTime();" type="radio" value="'
			+ va
			+ '" />'
			+ now.getFullYear()
			+ '年'
			+ (now.getMonth() + 1)
			+ '月';
	now = lastMonth(now);
	va = now.getFullYear() + "" + (now.getMonth() + 1);
	month02.innerHTML = '<input name="monthValue" onclick="changeTime();" type="radio" value="'
			+ va
			+ '" />'
			+ now.getFullYear()
			+ '年'
			+ (now.getMonth() + 1)
			+ '月';
	now = lastMonth(now);
	va = now.getFullYear() + "" + (now.getMonth() + 1);
	month01.innerHTML = '<input name="monthValue" onclick="changeTime();" type="radio" value="'
			+ va
			+ '" />'
			+ now.getFullYear()
			+ '年'
			+ (now.getMonth() + 1)
			+ '月';

	// var startday = termReq.createTermControl("startDay","START_DAY");
	// startday.setWidth(120);
	// startday.setDateRule();
	// startday.render();
	// startday.myCalendar.setDateFormat("%Y/%m/%d");
	// startday.myCalendar.hideTime();
	//
	// var endday = termReq.createTermControl("endDay","END_DAY");
	// endday.setWidth(120);
	// endday.setDateRule();
	// endday.render();
	// endday.myCalendar.setDateFormat("%Y/%m/%d");
	// endday.myCalendar.hideTime();
	changeTime();

	dataTableInit();
	dataTable.setPaging(true, 20);// 分页
	dataTable.render();// 绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
	dataTable.grid
			.setInitWidthsP("8,10,10,6,12,12,6,4,6,6,6,6,8,8,10,10,10,7,6,8,6");
	dataTable.setReFreshCall(queryData);
	// dhx.showProgress("请求数据中");
	// termReq.init(function(termVals){
	// dhx.closeProgress();
	// dataTable.refreshData();
	// }); //打包请求数据，初始，传入回调函数，里面开始查询数据

	var queryBtn = document.getElementById("queryBtn");
	attachObjEvent(queryBtn, "onclick", function() {
		dataTable.Page.currPageNum = 1;
		dataTable.refreshData();
	});
}

/**
 * 查询数据
 */
function queryData(dt, params) {
	dhx.showProgress("请求数据中");
	share("doGet", (params.page.rowStart / params.page.pageSize + 1),
			params.page.pageSize);
}

function dataTableInit() {
	dataTable = new meta.ui.DataTable("container");
	dataTable
			.setColumns(
					{
						MDN : "电话号码",
						NAI : "网络接入标识",
						URL : "地址",
						SERVTYPE : "业务类型",
						STARTTIME : "开始时间",
						ENDTIME : "结束时间",
						VOLUME : "总流量",
						DURATION : "时长",
						RECVBYTE : "下行流量",
						SENDBYTE : "上行流量",
						SERVICEOPTION : "接入类型",
						PROTID : "协议类型",
						BUSSID : "业务标识编号",
						BUSSNAME : "业务标识名称",
						DOMAINNAME : "外网域名",
						IMSI : "设备识别码",
						DESTINATIONIP : "目标网址",
						BSID : "基站标识",
						DESTINATIONPORT : "目标端口",
						SOURCEIP : "用户网址",
						SOURCEPORT : "用户端口"
					},
					"MDN,NAI,URL,SERVTYPE,STARTTIME,ENDTIME,VOLUME,DURATION,RECVBYTE,SENDBYTE,SERVICEOPTION,PROTID,BUSSID,BUSSNAME,DOMAINNAME,IMSI,DESTINATIONIP,BSID,DESTINATIONPORT,SOURCEIP,SOURCEPORT");
	return dataTable;
}

function lastMonth(date) {
	var year = date.getFullYear();
	var now = date.getMonth();
	var last = now - 1;
	if (last < 0) {
		last = 11;
		year--;
	}
	date.setFullYear(year);
	date.setMonth(last);
	return date;
}

function share(name, pageNum, pageSize) {
	var phoneNum = document.getElementById("queryNum");
	if (!validateString(phoneNum, "查询号码") || !validateNum(phoneNum, "查询号码")
			|| !validateLength(phoneNum, "查询号码")) {
		dhx.closeProgress();
		return;
	}
	var end = document.getElementById("endDay").value;
	var start = document.getElementById("startDay").value;
	var num = phoneNum.value;
	if (start > end) {
		alert("开始时间不得大于结束时间");
		dhx.closeProgress();
		return;
	}
	monE1 = monE + end + " 23:59:59";
	monS1 = monS + start + " 00:00:00";

	var webServiceUrl = $("webServiceUrl").value;
	var user_id = "netlog_jiangtao";
	var user_pwd = "111111";
	var rule_id = "43";
	var startrowkey = num + "-" + monS1;
	var endrowkey = num + "-" + monE1;
	var currentpage = pageNum;
	var pagesize = pageSize;
	var orderbycolumn = "STARTTIME";
	var orderbytype = "3";
	var orderdesc = "1";

	var mesg = "";
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
	mesg += "\"ORDER_DESC\":\"" + orderdesc + "\"";
	mesg += "}}";
	paramRexArr = [];

	var URL = webServiceUrl;
	var soapMess = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
	soapMess += "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:app=\"http://app.ws.hq.hadoop.ery.com/\">";
	soapMess += "<soapenv:Body>";
	soapMess += "<app:" + name + ">";
	soapMess += "<app:jsonStr>" + mesg + "</app:jsonStr>";
	soapMess += "</app:" + name + ">";
	soapMess += "</soapenv:Body></soapenv:Envelope>";
	createXMLHttpRequest();
	xmlhttp.onreadystatechange = reportResult;
	xmlhttp.Open("POST", URL, true);
	xmlhttp.SetRequestHeader("SOAPAction", URL);
	xmlhttp.SetRequestHeader("Content-Type", "text/xml; charset=utf-8");
	var resval = formatXML(soapMess);
	xmlhttp.Send(soapMess);
}
function reportResult() {
	dhx.closeProgress();
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		if (!xmlhttp.responseText)
			return;
		var value = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>";// alert(xmlhttp.responseText);
		value += xmlhttp.responseText;
		var xmldoc = loadXML(formatXML(value));
		var reslut = xmldoc.getElementsByTagName("return")[0].firstChild.nodeValue;
		var jsonobj = eval('(' + reslut + ')');
		var data = [];
		for (var i = 0; i < jsonobj.result.values.length; i++) {
			var jstr = jsonobj.result.values[i];
			var item = {};
			item.MDN = jstr[0], item.NAI = jstr[1], item.URL = jstr[2],
					item.SERVTYPE = jstr[3], item.STARTTIME = jstr[4],
					item.ENDTIME = jstr[5], item.VOLUME = jstr[6],
					item.DURATION = jstr[7], item.RECVBYTE = jstr[8],
					item.SENDBYTE = jstr[9], item.SERVICEOPTION = jstr[10],
					item.PROTID = jstr[11], item.BUSSID = jstr[12],
					item.BUSSNAME = jstr[13], item.DOMAINNAME = jstr[14],
					item.IMSI = jstr[15], item.DESTINATIONIP = jstr[16],
					item.BSID = jstr[17], item.DESTINATIONPORT = jstr[18],
					item.SOURCEIP = jstr[19], item.SOURCEPORT = jstr[20], data
							.push(item);
		}
		dataTable.bindData(data, jsonobj.result.totalCount);
	}
}

function formatXML(str) {
	str = str.replaceAll("&quot;", '"');
	str = str.replace(/<(.*?)>/ig, '<$1>\n');
	str = str.replace(/<(.*?)>\n(.*?)<\/(.*?)>/ig, '<$1>$2<\/$3>');
	return str.replace(/<\/(.*?)><\/(.*?)>/ig, '<\/$1>\n<\/$2>');
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
function validateLength(colm, name) {
	if (colm.value.length != 11) {
		alert("\"" + name + "\" 必须是11位数字");
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
function createXMLHttpRequest() {
	xmlhttp = null;
	if (window.ActiveXObject) {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	} else if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	}
}
function changeTime() {
	document.getElementById("endHtml").innerHTML = initHtml;
	var initHtml2 = initHtml.replace("endDay", "startDay").replace("deloptS",
			"deloptE")
			+ "&nbsp\;&nbsp\;&nbsp\;&nbsp\;&nbsp\;-";
	document.getElementById("startHtml").innerHTML = initHtml2;
	var daymax = 0;
	var mon = '';
	var chkObjs = document.getElementsByName("monthValue");
	for (var i = 0; i < chkObjs.length; i++) {
		if (chkObjs[i].checked) {
			mon = chkObjs[i].value;
			break;
		}
	}
	var year = mon.substring(0, 4);
	var m = mon.substring(4, mon.length);
	if (parseInt(m) % 2 == 1) {
		if (parseInt(m) <= 7)
			daymax = 31;
		else
			daymax = 30;
	} else {
		if (parseInt(m) <= 7)
			daymax = 30;
		else
			daymax = 31;
	}
	if (parseInt(m) == 2) {
		if (parseInt(year) % 4 == 0)
			daymax = 29;
		else
			daymax = 28;
	}
	if (m.length == 1)
		m = "0" + m;
	// monS = year+"/"+m+"/01";
	// monE = year+"/"+m+"/"+daymax;
	monS = year + "/" + m + "/";
	monE = year + "/" + m + "/";
	var n = 29;
	document.getElementById("startDay").value = '01';
	document.getElementById("endDay").value = 28;
	while (n <= daymax) {
		var str = n + "日";
		document.getElementById("endDay").options.add(new Option(str, n));
		document.getElementById("startDay").options.add(new Option(str, n));
		if (n == daymax) {
			document.getElementById("endDay").value = n;
		}
		n++;
	}
	// starDayHtml = document.getElementById("startHtml").innerHTML;
	// endDayHtml = document.getElementById("endHtml").innerHTML;
	// var endtime = document.getElementById("endDay");
	// attachObjEvent(endtime,"onclick",function(){
	// termReq.getTermControl("START_DAY").myCalendar.setSensitiveRange(year+"/"+m+"/01",year+"/"+m+"/"+daymax);
	// termReq.getTermControl("END_DAY").myCalendar.setSensitiveRange(year+"/"+m+"/01",year+"/"+m+"/"+daymax);
	// //
	// termReq.getTermControl("END_DAY").myCalendar.setDate(year+"/"+m+"/"+daymax);
	// $("endDay").value = year+"/"+m+"/"+daymax;
	// });
	// var starttime = document.getElementById("startDay");
	// attachObjEvent(starttime,"onclick",function(){
	// termReq.getTermControl("START_DAY").myCalendar.setSensitiveRange(year+"/"+m+"/01",year+"/"+m+"/"+daymax);
	// termReq.getTermControl("END_DAY").myCalendar.setSensitiveRange(year+"/"+m+"/01",year+"/"+m+"/"+daymax);
	// //
	// termReq.getTermControl("START_DAY").myCalendar.setDate(year+"/"+m+"/01");
	// $("startDay").value = year+"/"+m+"/01";
	// });
}
loadXML = function(xmlString) {
	var xmlDoc = null;
	// 判断浏览器的类型
	// 支持IE浏览器
	if (!window.DOMParser && window.ActiveXObject) { // window.DOMParser
														// 判断是否是非ie浏览器
		var xmlDomVersions = [ 'MSXML.2.DOMDocument.6.0',
				'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM' ];
		for (var i = 0; i < xmlDomVersions.length; i++) {
			try {
				xmlDoc = new ActiveXObject(xmlDomVersions[i]);
				xmlDoc.async = false;
				xmlDoc.loadXML(xmlString); // loadXML方法载入xml字符串
				break;
			} catch (e) {
			}
		}
	}
	// 支持Mozilla浏览器
	else if (window.DOMParser && document.implementation
			&& document.implementation.createDocument) {
		try {
			/*
			 * DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。 要使用
			 * DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
			 * parseFromString(text, contentType) 参数text:要解析的 XML 标记
			 * 参数contentType文本的内容类型 可能是 "text/xml" 、"application/xml" 或
			 * "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
			 */
			domParser = new DOMParser();
			xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
		} catch (e) {
		}
	} else {
		return null;
	}

	return xmlDoc;
}
function deloptS() {
	return;
	// document.getElementById("startHtml").innerHTML = starDayHtml;
	var nn = document.getElementById("endDay").value;
	while (nn != document.getElementById("startDay").options.length) {
		document.getElementById("startDay").options.remove(nn);
	}
}
function deloptE() {
	return;
	document.getElementById("endHtml").innerHTML = endDayHtml;
	var nn = document.getElementById("startDay").value;
	while (nn != 1) {
		document.getElementById("endDay").options.remove(0);
		nn--;
	}
}
dhx.ready(pageInit);