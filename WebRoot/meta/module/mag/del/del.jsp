<%--
 * Copyrights @ 2012,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 陈颖
 * @description  系统订阅查询JSP
 * @date 12-11-19
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title></title>
    <%@include file="../../../public/header.jsp" %>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/DelAction.js"></script>
    <script type="text/javascript" src="del.js"></script>
     <style type="text/css">
        .table1{
        	table-layout:fixed;
        	width:630px;
        	background-color:#D0DBE5;
        	margin: 1px;
        }
        .td{
        	height:30px;
        	background-color:#ffffff;
        }
        .th{
        width:99px;
        background-color:#E1F2FE;
        }
    </style>
</head>
<body style='width:100%;height:100%;'>
<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: auto;">
    <div id="queryFormDIV" style="height:10%">
    	<table style="padding: 13px;">
    		<tr>
    		<td>数据类型:</td><td><select id="dataType" onchange="selectChange()" style="width:120px;"><option value="RPT" selected="selected" >报表</option><option value="DIM">维度</option><option value="RQM">需求</option><option value="TBL">模型</option><option value="GDL">指标</option><option value="PGI">程序实例</option></select>&nbsp;&nbsp;&nbsp;</td>
    		<td>关键字:&nbsp;&nbsp;&nbsp;</td><td><input type="text" id="kwd" style="border:1px solid #A4BED4;" onkeydown="enterEvent(this)"/></td><td>&nbsp;&nbsp;&nbsp;<span id="unUsedStyle" style="display:none"><input id="unUsedGdl" type="checkbox"/>是否只查询未被使用的指标</span>&nbsp;&nbsp;&nbsp;<input type="button" id="queryBtn" class="btn_2" value="查询" onclick="changeType()"/></td>
    		<td><input type="button" id="deteleAll" value="批量删除" onclick="deleteAll()" class="btn_4" style="display: none"/></td>
    		</tr>
    		</table>
    </div>
    <div  id="dataDiv" style="height:90%;width:100%;"></div>  
    <input type="hidden" id="temp"/> 
    <input type="hidden" id="synonymIs"/> 
    <input type="hidden" id="page"/>
    
</div>
</body>
</html>

