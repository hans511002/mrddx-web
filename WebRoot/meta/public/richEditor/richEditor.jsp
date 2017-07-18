<%--
  Created by IntelliJ IDEA.
  User: 春生
  Date: 13-10-23
  Time: 下午4:14
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" pageEncoding="UTF-8"%>
<html>
<head>
    <%--<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE8"/>--%>
    <META HTTP-EQUIV="X-UA-COMPATIBLE" CONTENT="IE=EDGE" >
    <title></title>
    <%
        String rootPath = request.getContextPath();
        String cfg = request.getParameter("cfg");
    %>
    <script type="text/javascript" src="<%=rootPath%>/js/editor/kindeditor.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/js/editor/lang/zh_CN.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/js/common/Basic.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/js/common/BaseObjExtend.js"></script>
    <script type="text/javascript">
        var initCfgStr = null;
        var basePath = '<%=rootPath%>';
        <%
        if(cfg!=null && !"".equals(cfg)){
            out.println("initCfgStr='"+new String(cfg.getBytes("ISO-8859-1"),"UTF-8")+"';");
        }
        %>
    </script>
    <script type="text/javascript" src="richEditor.js"></script>
</head>
<body>
<body style="height: 100%;width: 100%;overflow: hidden;padding:0;margin:0;">
<textarea id="content" name="content" style="width:100%;height: 100%;"></textarea>
<div id="myContent" style="display: none;"></div>
</body>
</body>
</html>