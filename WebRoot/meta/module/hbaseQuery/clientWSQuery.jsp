<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王建友
 * @description 
 * @date 2013-07-10
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title></title>
    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />

    <%@include file="../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/ClientWSAction.js"></script>
    <script type="text/javascript" src="clientWSQuery.js"></script>
</head>

<body style='width:100%;height:100%;'>

<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: hidden;">
    <div id="queryFormDIV" class="C_query" style="height: 20px">
        <table border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td>策略ID号:</td>
                <td><div id="ruleId"></div></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>电话号码:</td>
                <td><div id="mdn"></div></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>开始时间:</td>
                <td><input type="text" value="" class="input" id="startDate" /><a id='reset1' href="javascript:void(0)">×</a></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>结束时间:</td>
                <td><input type="text" value="" class="input" id="endDate" /><a id='reset2' href="javascript:void(0)">×</a></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td><input type="button" value="查 询" class="btn_2" id="queryBtn" /></td>
            </tr>
        </table>        
    </div>
    
    <div style="min-height:200px;min-width:800px;border-top:1px solid #D0E5FF;left:0px;bottom: 0px;right: 0px;" id="dataDiv">
    </div>
</div>



</body>
</html>