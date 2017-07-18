<%--
 * Copyrights @ 2014,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王鹏坤
 * @description 
 * @date 2014-01-7
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title><%=request.getParameter("failTime")%>点的失败任务详情</title>
    <%@include file="../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/AnalysisAction.js"></script>

    <script type="text/javascript" src="showFailList.js"></script>
	<script type="text/javascript">
		var failTime =<%=request.getParameter("failTime")%>;
		var eDate =<%=request.getParameter("eDate")%>;
		var sDate =<%=request.getParameter("sDate")%>;
	</script>      
</head>

<body style='width:100%;height:100%;'>
	<div  style="height: 100%;width: 100%" id="dataDiv"></div>
    </div>
</body>
</html>