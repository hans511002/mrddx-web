<%@ page contentType="text/html;charset=UTF-8" language="java"
	isELIgnored="false"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
    
	<%--作者:张伟--%>
	<%--时间:2011-10-10--%>
	<%--描述:--%>
	<%@include file="../../../public/head.jsp"%>
	<head>
		<title></title>
		<link rel="stylesheet" type="text/css"
			href="../../../resource/css/meta.css"/>
		<script type="text/javascript"
			src="<%=rootPath%>/dwr/interface/MenuAction.js">
		</script>
        <script type="text/javascript" src="<%=rootPath%>/dwr/interface/LoginLogAction.js">
        </script>
        
	    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/DeptAction.js"></script>
	    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/ZoneAction.js"></script>
	    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/StationAction.js"></script>
		<%
            String groupId = request.getParameter("groupId");
            String adminFlag = request.getParameter("adminFlag");
            if("true".equalsIgnoreCase(adminFlag)){
                adminFlag="true";
            }else{
                adminFlag="false";
            }
		%>
		<script type="text/javascript">
            var groupId=<%=groupId%>;
            var adminFlag=<%=adminFlag%>;
		function setInit(){
            queryform.setItemValue("adminFlag",<%=adminFlag%>);
            queryform.setItemValue("groupId",<%=groupId%>);
		}
		</script>
</head>
<body>
</body>
</html>
<script type="text/javascript" src="loginLog.js"></script>
