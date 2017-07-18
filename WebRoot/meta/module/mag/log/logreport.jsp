<%@ page contentType="text/html;charset=UTF-8" language="java"
	isELIgnored="false"%>
<%
	String menuName = "10,11,12,294";
	session.setAttribute("MenuName",menuName);
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
	<%@include file="../../../public/head.jsp"%>
  <head>
    <title>登陆日志报表</title>
    <script type="text/javascript" src="logreport.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/LoginLogAction.js"></script>
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
		</script>
  </head>
  
  <body>
  </body>
</html>
