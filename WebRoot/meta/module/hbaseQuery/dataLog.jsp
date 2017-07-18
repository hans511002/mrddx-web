<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>日志信息</title>
    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/tag.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />
    <%@ include file="../../public/header.jsp" %>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/HBaseDataSourceAction.js"></script>
    <script type="text/javascript" src="dataLog.js"></script>
</head>

<body style="height: 100%;width: 100%">
<div id=queryFormDiv style="height:12%">
    <table style="height: 100%">
        <tr>
            <td width="10%" style="text-align:right;">用户名称:</td>
            <td width="15%"><select id="userId" style="width: 120px"></select></td>
            <td width="10%" style="text-align:right;">查询规则名称:</td>
            <td width="15%" ><input id="ruleName" /></td>
            <td width="10%" style="text-align:right;">&nbsp;&nbsp;&nbsp;&nbsp;结果状态:</td>
            <td width="15%"><select type="text" id="state"></select></td>
            <td width="25%"></td>
        </tr>
        <tr>
            <td width="10%" style="text-align:right;">开始时间:</td>
            <td width="15%" ><input id="startDate" /><a id='reset1' href="javascript:void(0)">×</a></td>
            <td width="10%" style="text-align:right;">结束时间:</td>
            <td width="15%" ><input id="endDate" /><a id='reset2' href="javascript:void(0)">×</a></td>
            <td width="10%" style="text-align:right;">&nbsp;&nbsp;<input type="button" id="queryBtn" class="btn_2" value="查询" /></td>
            <td width="40%"></td>
        </tr>
    </table>
</div>
<div id="container" style="height: 88%;width: 100%"></div>
<div style="overflow-y:auto;display:none;" id="logFormDIV">
    <form action="#" id="logForm">
        <table class="LogFormTable" border="0" cellpadding="0" cellspacing="1">
            <tr>
                <td style="text-align: right;" class="t_td">日志ID:</td>
                <td class="content_td"><div type="text"  id="logId" class="input"  value=""  ></div>
                    </td>
            </tr>
            <tr>
                <td style="text-align: right;" class="t_td">日志详情:</td>
                <td class="content_td"><textarea type="text" id="logMsg" value="" class="input" readonly="readonly"  style="width:250%;height: 140px" ></textarea>
            </tr>
        </table>
    </form>
    <p class="btn_area">
        <input type="button" value="关闭" class="btn1" id="calBtn"/>
    </p>
</div>
</body>
</html>