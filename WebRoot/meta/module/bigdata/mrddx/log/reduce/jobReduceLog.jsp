<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王建友
 * @description 
 * @date 2013-04-18
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title>[Reduce日志]<%=request.getParameter("jobName")==null?"":new String(request.getParameter("jobName").getBytes("iso-8859-1"),"UTF-8") %></title>
    <link type="text/css" rel="stylesheet" href="../../../css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="../../../css/base.css" />
    <link type="text/css" rel="stylesheet" href="../../../css/tb_style.css" />
    <%@include file="../../../../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=OPERATING_SYSTEM,SERVER_TYPE,CPU_FRAMEWORK"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/JobLogAction.js"></script>

    <script type="text/javascript" src="jobReduceLog.js"></script>
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
	<script type="text/javascript">
		var logId = <%=request.getParameter("logId")%>;		
	</script>      
</head>

<body style='width:100%;height:100%;'>
<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: auto;">
    <div  id="queryFormDIV" class="C_query" >
        <ul>
            <input type="hidden" value="" class="input" id="logId" />
            <li>运行状态：<select style="height:22px;width: 100px" id="runFlag">
            	  <option value="3" selected="selected">全部</option>
            	  <option value ="1">成功</option>
				  <option value ="2">失败</option>
            </select>
            </li>   
            <li>
            <input type="button" value="查 询" class="btn_2" id="queryBtn" /> 
            </li>
        </ul>
    </div>
    <br class="clear" />
    <div style="min-height:200px;min-width:800px;border-top:1px solid #D0E5FF;left:0px;bottom: 0px;right: 0px;" id="dataDiv">
    </div>
</div>

</body>
</html>