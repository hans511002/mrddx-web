<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title>详细日志-<%=request.getParameter("LOG_ID_")%></title>
    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/tag.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />

    <%@include file="../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/resource/Charts/FusionCharts.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=OPERATING_SYSTEM,SERVER_TYPE,CPU_FRAMEWORK"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserTypeAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAuthorAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MonitorAction.js"></script>
    <script type="text/javascript" src="monitorJobDetail.js"></script>
    <script type="text/javascript">
		var log_id_='<%=request.getParameter("LOG_ID_")%>';
	</script> 
</head>

<body style='width:100%;height:100%;'>
<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: hidden;">
<div>
	<div>
		<div style="float:left;width: 30%;">
			<table id="collectTable" class="MetaFormTable"  border="0" cellpadding="0" cellspacing="1" >
				<tr><td>任务名称</td><td colspan="3"><span id="JOB_NAME_SP"></span></td></tr>
				<tr><td>开始时间</td><td colspan="3"><span id="START_TIME_SP"></span></td></tr>
				<tr><td>业务类型</td><td colspan="3"><span id="JOB_TYPE_NAME_SP"></span></td></tr>
				<tr><td>结果行记录数</td><td><span id="FILE_NUM_SP"></span></td><td>文件大小</td><td><span id="FILE_TOTALSIZE_SP"></span></td></tr>
				<tr><td>总成功数</td><td><span id="SUCCESS_SP"></span></td><td>总失败数</td><td><span id="FAILURE_SP"></span></td></tr>
			</table>
		</div>
		<div id="colDetailChar"></div>
	</div>
    <div id="queryFormDIV" class="C_query">
        <table border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td>任务状态:</td>
                <td>
                <select style="width: 150px"  class="input" id="S_STATE">
                	<option value="">--全部--</option>
                	<option value="0">初始化</option>
                	<option value="1">成功</option>
                	<option value="2">失败</option>
                </select>
                </td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>                
                <td><input type="button" value="查 询" class="btn_2" id="queryBtn" /></td>
            </tr>
        </table>
    </div>
	<div id="colDetailTable" style="height: 240px;"></div>
</div>
</div>
</body>
</html>