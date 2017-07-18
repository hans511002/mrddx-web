<%@ page import="com.ery.meta.web.session.SessionManager" %>
<%@ page import="java.util.Map" %>
<%@ page import="com.ery.meta.module.mag.login.LoginConstant" %>
<%@ page import="com.ery.meta.common.Constant" %>
<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王春生
 * @description 
 * @date 12-4-11
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <script type="text/javascript">
        var a = <%
            if(SessionManager.isLogIn(session.getId())){
            	int systemId=SessionManager.getUser(session.getId()).getGroupID();
                out.print(SessionManager.getOnlineUserCountByGroupId(systemId));
            }else{
                out.print(-1);
            }

        %>;
        try{
            parent.frames["main"].setOnlineCount(a);
        }catch(e){}
        setTimeout("window.location.reload()",15000);
    </script>
</head>
<body></body>
</html>