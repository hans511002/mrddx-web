<%@ page import="com.ery.base.support.sys.SystemVariable" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<%
	String menuName = SystemVariable.getString("menuId","10,11,12,13,294,443").toString();
//     String groupId = request.getParameter("groupId");
%>
	<%@include file="../../../public/head.jsp"%>
  <head>
    <title>登陆日志报表</title>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/LoginReportAction.js"></script>
      <script type="text/javascript">
            var menuId = ("<%=menuName%>").toString().split(",");
            var menuIds = ("<%=menuName%>").toString();
            <%--var rootPath=<%=rootPath%>;--%>
            <%--var adminFlag=<%=adminFlag%>;--%>
		</script>
    <script type="text/javascript" src="logreports.js"></script>

    <%


//            String adminFlag = request.getParameter("adminFlag");
//            if("true".equalsIgnoreCase(adminFlag)){
//                adminFlag="true";
//            }else{
//                adminFlag="false";
//            }
		%>

  </head>

  <body>
  </body>
</html>
