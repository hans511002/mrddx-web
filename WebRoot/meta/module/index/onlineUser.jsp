<%@ page import="java.util.Map" %>
<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王春生
 * @description 
 * @date 12-3-30
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title>在线用户统计</title>
    <%@include file="../../public/head.jsp"%>
    <script type="text/javascript">
    <%
        Map<String,Object> sysInfo=(Map<String,Object>)session.getAttribute(LoginConstant.SESSION_META_SYSTEM_INFO);
        String systemId = (sysInfo!=null && sysInfo.get("groupId")!=null) ? sysInfo.get("groupId").toString() : null;
        if(systemId==null){//如果系统ID为null，从Session中获取当前用户的默认系统ID
            Map<String,Object> userInfo=(Map<String,Object>)session.getAttribute(LoginConstant.SESSION_KEY_USER);
            systemId = userInfo.get("groupId")==null ? String.valueOf(Constant.DEFAULT_META_SYSTEM_ID) : userInfo.get("groupId").toString();
        }

        out.println(
                "var getSystemId=function(){var systemId='"
                        +(systemId==null? Constant.DEFAULT_META_SYSTEM_ID:systemId)+"'; " +
                        "return parseInt(systemId||1);}"
        );//打印一段JS代码，用于返回当前systemId
    %>
    </script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/DeptAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/ZoneAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/StationAction.js"></script>
    <script type="text/javascript" src="onlineUser.js"></script>
</head>
<body style="width:100%;height: 100%">
</body>
</html>