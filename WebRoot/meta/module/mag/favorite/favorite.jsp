<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 *
 * @author 王春生
 * @description 我的收藏
 * @date ${DATE}
 * -
 * @modify
 * @modifyDate
 * - .
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title>收藏夹</title>
    <%@include file="../../../public/head.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=FAVORITE_TYPE,PERORT_SEND_TYPE"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/FavoriteAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/RepSupermarketAction.js"></script>
    <script type="text/javascript" src="favorite.js"></script>
    <style type="text/css">
        .favobjoptdiv{
            height:20px;
            width:50px;
            margin-left:15px;
            position: absolute;
            display: none;
            text-align: center;
            z-index: 9
        }
        div.favobjoptdiv img{
            height: 13px;
            width:13px;
            padding-top: 2px;
            padding-bottom: 3px;
            padding-left:10px;
            margin-right:10px;
            float:left;
            cursor: pointer;
        }
    </style>
</head>
<body style="width:100%;height:100%">
<table id="favDir" style="height:100%;width:100%;position:relative;">
    <tr ><td style="width:100%;height:100%"><div id="favDirTab" style="width:100%; height: 100%"></div></td></tr>
</table>
<div id="favobjoptdiv" class="favobjoptdiv">
    <input type="hidden" id="opt_nodeId" value="">
    <img src="<%=rootPath%>/meta/resource/images/dataBase.png" title="订阅" id="objopt_dy" alt="订阅">
    <%--<img src="<%=rootPath%>/meta/resource/images/toolbar/delete.gif" alt="删除">--%>
</div>
</body>
</html>