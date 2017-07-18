<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
    <title>用户维护</title>
    <%@include file="../../../public/head.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MenuAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/DeptAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/ZoneAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/StationAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/RoleAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=USER_STATE"></script>
    <%
        String userNamecn = null;
        try{
            userNamecn = new String(request.getParameter("userNamecn").getBytes("ISO-8859"),"utf-8");
        }catch (Exception e){
        }

    %>
    <script type="text/javascript">
        var userId = <%=request.getParameter("userId")%>;
        var userNamecn = <%=userNamecn%>;
    </script>
    
    <style type="text/css">

        .combo div{
            float:left;
        }
        .label_anou div{
            width: 250px;
        }
        div.dhtmlx_wins_body_inner .dhxlist_obj_dhx_skyblue div.dhxlist_base {
            margin: 0px;
        }
        .zero{
            padding: 0px;margin: 0px;
        }
        .baseInfo{
            margin-bottom: 10px
        }
    </style>
</head>

<body style="height: 100%;width: 100%">
<div id="container" style="height: 100%;width: 100%"></div>
</body>
</html>
<script type="text/javascript" src="user.js"></script>