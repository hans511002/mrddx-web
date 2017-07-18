<%@ page language="java" import="java.util.*" pageEncoding="UTF-8" %>
<%@page import="com.ery.meta.common.Common" %>
<%
    String path = request.getContextPath();
    String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + path + "/";
    String oldPortal = "";
    Map<String, String[]> parameter;
    try {
        parameter = (Map<String, String[]>) request.getAttribute("@param");
    } catch (Exception e) {
        parameter = null;
    }
    if (request.getHeader("User-Agent").contains("MSIE") || request.getHeader("User-Agent").contains("Firefox")) {
        if (parameter.containsKey("workid") && parameter.get("workid") != null && !parameter.get("workid")[0].equals("")) {
            oldPortal = Common.parseChinese(parameter.get("workid")[0]);
        } else if (parameter.containsKey("email") && parameter.get("email") != null && !parameter.get("email")[0].equals("")) {
            oldPortal = Common.parseChinese(parameter.get("email")[0]);
        } else if (parameter.containsKey("userName") && parameter.get("userName") != null && !parameter.get("userName")[0].equals("")) {
            oldPortal = Common.parseChinese(parameter.get("userName")[0]);
        } else {

        }
    } else {
        if (parameter.containsKey("workid") && parameter.get("workid") != null && !parameter.get("workid")[0].equals("")) {
            oldPortal = Common.parseChinese(parameter.get("workid")[0].toString());
        } else if (parameter.containsKey("email") && parameter.get("email") != null && !parameter.get("email")[0].equals("")) {
            oldPortal = Common.parseChinese(parameter.get("email")[0].toString());
        } else if (parameter.containsKey("userName") && parameter.get("userName") != null && !parameter.get("userName")[0].equals("")) {
            oldPortal = Common.parseChinese(parameter.get("userName")[0].toString());
        } else {

        }
    }
    String src = "";
    if (parameter.containsKey("src")) {
        src = parameter.get("src")[0].toString();
    }
    String systemId = "";
    if (parameter.containsKey("systemId")) {
        systemId = parameter.get("systemId")[0].toString();
    }
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
    <base href="<%=basePath%>">

    <title></title>

    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
    <meta http-equiv="description" content="This is my page">
    <!--
     <link rel="stylesheet" type="text/css" href="styles.css">
     -->

</head>
<script type='text/javascript' src='<%=path%>/dwr/engine.js'></script>
<script type='text/javascript' src='<%=path%>/dwr/util.js'></script>
<script type="text/javascript" src="<%=path%>/dwr/interface/LoginAction.js"></script>
<script type="text/javascript">
    var getBasePath = function () { //获取根目录
        return "<%=path%>";
    }
    function onSubmit() {
        var oldPortal = dwr.util.getValue("oldPortal");
        var src = dwr.util.getValue("src");
        var type;
        if (oldPortal != null && src == "oa") {
            // 老OA
            type = "oldoa";
        } else if (oldPortal != null) {
            // 门户1.0
            type = "portal";
        } else {
            alert("你没有访问权限");
            window.location.href = "<%=path%>";
        }
        LoginAction.login(
                dwr.util.getFormValues("submitForm")
                , "portal", function (data) {
                    switch (data) {
                        case "SUCCESS":
                        {
                            window.location.href = "<%=path%>/meta/module/index/index.jsp";
                            break;
                        }
                        default:
                        {
                            window.location.href = "<%=path%>";
                        }
                    }
                });
    }
</script>

<body onload="onSubmit();">
<form id="submitForm" name="submitForm" action="" method="post">
    <input type="hidden" id="oldPortal" name="oldPortal" value="<%=oldPortal %>"/>
    <input type="hidden" name="src" id="src" value="<%=src %>"/>
    <input type="hidden" name="systemId" id="systemId" value="<%=systemId%>"/>
</form>
</body>
</html>
