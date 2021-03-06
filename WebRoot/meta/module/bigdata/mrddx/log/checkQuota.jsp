<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王建友
 * @description 
 * @date 2013-11-19
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title></title>
    <link type="text/css" rel="stylesheet" href="../../css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="../../css/base.css" />
    <link type="text/css" rel="stylesheet" href="../../css/tb_style.css" />
    <%@include file="../../../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=OPERATING_SYSTEM,SERVER_TYPE,CPU_FRAMEWORK"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/CheckQuotaAction.js"></script>

    <script type="text/javascript" src="checkQuota.js"></script>
    <style type="text/css">
        html{
            width:100%;
            height:100%;
        }
        span.etlsqltitle {
            overflow: hidden;
            white-space: nowrap;
            width: 470px;
            height: 20px;
            line-height: 20px;
            margin-bottom: 1px;
            background-color: #e9eaf7;
            display: block;
            border-bottom: 1px solid #c2c2d3;
        }
        span.etlsqltitle label {
            cursor: pointer;
        }
    </style>
</head>

<body style='width:100%;height:100%;'>
<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: auto;">
    <div  id="queryFormDIV" class="C_query" >
        <ul>
            <!-- <li>HDFS目录名称：<input type="text" value="" class="input" id="fileName" /></li> -->
            <li style="padding-top: 6px">HDFS目录名称：</li>
            <li><div id='fileName'></div></li>
            <li>日期：<input type="text" value="" class="input" id="dateNo" /><a id='reset1' href="javascript:void(0)">×</a></li>
            <li>
            <input type="button" value="查 询" class="btn_2" id="queryBtn" /> 
            </li>
            <li>
            <input type="button" value="实 时 查 询" class="btn_4" id="realqueryBtn" /> 
            </li>            
        </ul>
    </div>
    <br class="clear" />
    <div style="min-height:200px;min-width:800px;border-top:1px solid #D0E5FF;left:0px;bottom: 0px;right: 0px;" id="dataDiv">
    </div>
</div>

</body>
</html>