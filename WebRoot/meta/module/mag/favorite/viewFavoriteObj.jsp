<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王春生
 * @description 
 * @date 12-3-14
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title></title>
    <%@include file="../../../public/head.jsp"%>
    <script type="text/javascript">
        <%
         String id = request.getParameter("objFavoriteId");  //对应具体收藏对象表ID
         String favoriteType = request.getParameter("favoriteType");//收藏类型
         String objId = request.getParameter("objId");//收藏对象ID
         %>
    </script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/FavoriteAction.js"></script>
    <script type="text/javascript" src="viewFavoriteObj.js"></script>
</head>
<body>
</body>
</html>