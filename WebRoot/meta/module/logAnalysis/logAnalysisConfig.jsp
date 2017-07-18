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
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/LogAnalysisAction.js"></script>
    <script type="text/javascript" src="logAnalysisConfig.js"></script>
</head>

<body style='width:100%;height:100%;'>
<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: hidden;">
<div style="padding: 10px">
<form action="" id="_ConfigParamForm" onsubmit="return false;" >
    <div id="queryFormDIV" class="C_query">
        <table border="0" id="laform" class="MetaFormTable" style="width: 700px;" cellpadding="0" cellspacing="1">
           <tr>
           	<th style="text-align: center">指标名称</th><th style="text-align: center">是否展现</th><th style="text-align: center">警戒最小值（%）</th><th style="text-align: center">警戒最大值（%）</th><th style="text-align: center">备注</th>
           </tr>
        </table>
        说明:警戒最小值、警戒最大值是针对指标的平均值而言，小于警戒最小值和大于警戒最大值，都属于告警。
        <br/>
        <br/>
        <table border="0" id="laform" style="width: 700px;" cellpadding="0" cellspacing="1">
           <tr>
           	<th>按月统计慢查询前：</th><td><input id="MONTHNUM" type="text"/>位</td><th>按日统计慢查询前：</th>
           	<td><input id="DAYNUM" type="text"/>位</td><td>
           		<input type="button" value="保存" class="btn_2" id="saveBtn" />
           	</td>
           </tr>
        </table>
    </div>
</form>
</div>
</div>
</body>
</html>