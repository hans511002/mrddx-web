<%--
  Created by IntelliJ IDEA.
  User: 春生
  Date: 13-10-23
  Time: 下午2:47
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<html>
	<title>系统资源</title>
	<head>
	    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />
		<%@include file="../../../public/header.jsp"%>
		<script type="text/javascript"
			src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
		<script type="text/javascript"
			src="<%=rootPath%>/dwr/interface/SystemSourceAction.js"></script>
		<script type="text/javascript" src="systemsource.js"></script>
	</head>
	<body>
		<div style="width: 100%; margin-left: 12px;margin-top: 15px;">
		<input type="button" id="queryBtn" class="btn_2" value="刷新" onclick="queryData();" />
		</div>
		<div id="container"  style="text-align:left;vertical-align:top;padding-top:0px;height: 90%; width: 100%">
			<table border="0" cellpadding="0" cellspacing="10" style="width: 100%;text-align: left;">
			<tr>
			<td class="title_blod" style="width: 33%;text-align:left; ">服务器配置情况</td>
			<td class="title_blod" style="width: 33%;text-align:left; ">持久代资源</td>
			<td class="title_blod" style="width: 33%;text-align:left; ">操作系统资源</td>
			</tr>
			<tr>
            <td style="width: 33%;text-align:left; vertical-align:top"><table class="table_list1" id="serverconfig"></table></td>
            <td style="width: 33%;text-align:left; vertical-align:top"><table class="table_list1" id="perm"></table></td>
            <td style="width: 33%;text-align:left; vertical-align:top"><table class="table_list1" id="system"></table></td>
            </tr>
			</table>
		</div>
	</body>
</html>