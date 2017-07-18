<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title>详细日志-<%=request.getParameter("LOG_ID_")%></title>
    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/tag.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />

    <%@include file="../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/resource/Charts/FusionCharts.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=OPERATING_SYSTEM,SERVER_TYPE,CPU_FRAMEWORK"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserTypeAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAuthorAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MonitorAction.js"></script>
    <script type="text/javascript" src="monitorConfig.js"></script>
</head>

<body style='width:100%;height:100%;'>
<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: hidden;">
<div style="padding: 10px">
<form action="" id="_ConfigParamForm" onsubmit="return false;" >
    <div id="queryFormDIV" class="C_query">
        <table border="0"  class="MetaFormTable" style="width: 700px;" cellpadding="0" cellspacing="1">
            <tr>
                <th>内存刷新间隔时间（秒）:</th>
                <td>
                <input style="width: 300px;" type="text" id="REPEATINTERVAL"/>
                </td>
            </tr>
            <tr>
                <th>界面刷新间隔时间（秒）:</th>
                <td>
                <input style="width: 300px;" type="text" id="WEBINTERVAL"/>
                </td>
            </tr>
            <tr>
                <th>自动刷新:</th>
                <td>
                <select style="width: 300px;" id="ISAUTOREFRESH">
                	<option value="0">否</option>
                	<option value="1">是</option>
                </select>
                </td>
            </tr>
            <tr>
                <th>手动刷新:</th>
                <td>
                <select style="width: 300px;" id="ISMANUREFRESH">
                	<option value="0">否</option>
                	<option value="1">是</option>
                </select>
                </td>
            </tr>
            <tr>
                <th>Hadoop Job Tracker地址</th>
                <td>
                <input title="例如：133.37.135.211:50030/jobtracker.jsp" style="width: 300px;" type="text" id="HADOOPJOBURL"/>
                </td>
            </tr>
            <tr>
                <th>Hadoop版本号:</th>
                <td>
                <input style="width: 300px;" type="text" id="HADOOPVERSION"/>
                </td>
            </tr>
            <tr>
            <td colspan="2">
                <input type="button" value="保存" class="btn_2" id="queryBtn" />
            </td>
            </tr>
        </table>
                     说明：<br />
        1、若自动刷新、手动刷新均选择<span style="color: blue;">“是”</span>，则定时刷新有效，另外，手动点击<span style="color: blue;">“查询”</span>按钮可即时刷新；<br />
		2、若自动刷新、手动刷新均选择<span style="color: blue;">“否”</span>，则定时刷新和手动刷新均无效；<br />
		3、若自动刷新选择<span style="color: blue;">“是”</span>，手动刷新选择<span style="color: blue;">“否”</span>，则只有定时刷新有效；<br />
		4、若自动刷新选择<span style="color: blue;">“否”</span>，手动刷新选择<span style="color: blue;">“是”</span>，则只有手动点击<span style="color: blue;">“查询”</span>按钮有效； <br />
    </div>
    </form>
</div>
</div>
</body>
</html>