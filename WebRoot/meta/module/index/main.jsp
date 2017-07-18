<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<%--作者:张伟--%>
<%--时间:2011-09-15--%>
<%--描述:菜单主JSP--%>
<head>
    <title></title>
    <%@include file="../../public/head.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MenuAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/LoginAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MenuVisitLogAction.js"></script>
    <!-- 引入DWR必须的JS文件 -->
	<script type='text/javascript' src='<%=rootPath%>/dwr/engine.js'></script>
	<script type='text/javascript' src='<%=rootPath%>/dwr/util.js'></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/FavoriteAction.js"></script>
    <script type="text/javascript" src="main.js"></script>
    <style type="text/css">
        *{
            font-size: 12px;
        }
    </style>
</head>
<body style="height: 100%;width: 100%"
      oncontextmenu=self.event.returnValue=false
        >
<div id="main_tabbar" style="width:100%;height:100%"></div>
</body>
</html>