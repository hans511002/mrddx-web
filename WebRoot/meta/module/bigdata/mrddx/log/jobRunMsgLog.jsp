<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王建友
 * @description 
 * @date 2013-04-18
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title>[Job详细日志]<%=request.getParameter("jobName")==null?"":new String(request.getParameter("jobName").getBytes("iso-8859-1"),"UTF-8") %></title>
    <%@include file="../../../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=OPERATING_SYSTEM,SERVER_TYPE,CPU_FRAMEWORK"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/JobLogAction.js"></script>

    <script type="text/javascript" src="jobRunMsgLog.js"></script>
	<script type="text/javascript">
		var logId =<%=request.getParameter("logId")%>;
		var jobId =<%=request.getParameter("jobId")%>;
	</script>      
</head>

<body style='width:100%;height:100%;'>
	<div  style="height: 100%;width: 100%" id="dataDiv"></div>
    </div>
</body>
</html>