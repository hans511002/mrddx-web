<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title>企业大数据平台-日志监控</title>
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
    <script type="text/javascript" src="monitor.js"></script>
</head>

<body style='width:100%;height:100%;'>

<div style="width: 100%;height: 100%;overflow: auto;padding-top: 5px;">
<div style="float:left;width:285px;">
	<div>
		  <div style="height: 27px;margin-bottom:0 auto; "><img src="images/tj.png"/><a href='javascript:void(0)' onclick='showPreDay();return false;' style="text-decoration:underline; color:blue ; cursor: pointer;">统计当前24H运行情况</a></div>
		  <div style="font-weight:bold;width: 270px;" id="missTypeToolObj"></div>
		  <table style="width: 280px;" id="collectTable"  class="MetaFormTable"  border="0" cellpadding="0" cellspacing="1" >
            <tr>
            <td>运行中:<span id="status0" style="color: blue;">0</span>个</td>
            <td>已完成:<span id="status1" style="color: green;">0</span>个</td>
            <td>异常:<span id="status2" style="color: red;">0</span>个</td>
            </tr>
          </table>
	</div>
	<div id="chartContainer" style="padding-top: 5px;">数据加载中……</div>
	<div id="chartContainer2" style="padding-top: 5px;">数据加载中……</div>
</div>

<div id="pageContent" style="top:0px;left:0px;right: 0px;bottom: 0px;overflow: hidden;">
    <div id="queryFormDIV" class="C_query">
        <table border="0" cellpadding="0" cellspacing="0" style="padding-bottom: 5px;">
            <tr>
            	<td>关键字:</td>
                <td><input type="text" title="可以输入任务名称或者用户名" style="width: 150px"  class="input" id="S_SEARCH_WORD"/></td>
                <td>&nbsp;</td>
                <td>业务类型:</td>
                <td><select type="text" style="width: 150px"  class="input" id="S_JOB_TYPE"/></td>
                <td>&nbsp;</td>
                <td>任务状态:</td>
                <td><select style="width: 150px"  class="input" id="S_STATE">
                	<option value="">--全部--</option>
                	<option value="0">失败数等于0</option>
                	<option value="1">失败数大于0</option>
                </select></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>                
                <td><input type="button" value="查 询" class="btn_2" id="queryBtn" /></td>
            </tr>
        </table>
    </div>
    <div style="min-width:800px;border-top:1px solid #D0E5FF;left:0px;bottom: 0px;right: 0px;height: 250px;" id="dataDiv">
    </div>
	<div id="a_tabbar" class="dhtmlxTabBar" imgpath="<%=rootPath%>/meta/resource/dhtmlx/imgs/" style="min-width:800px; height:340px;padding-top: 5px;"  skinColors="#FCFBFC,#F4F3EE" >
	    <div id="a1" name="总体概况">
	            <table border="0" cellpadding="0" cellspacing="0">
		            <tr>
		                <td>任务类型:</td>
		                <td>
		                <select id="task_type">
		                	<option value="">--全部--</option>
		                	<option value="1">采集上传</option>
		                	<option value="0">采集下载</option>
		                	<option value="2">数据处理</option>
		                </select> 
		                </td>
		                <td>&nbsp;</td>
		                <td>业务类型:</td>
		                <td>
		                <select id="job_type">
		                </select> 
		                </td>	 
		                <td>&nbsp;</td>               
		                <td>时间间隔:</td>
		                <td>
		                <select id="interval">
                			<option value="5" >5分钟</option>
		                	<option value="10">10分钟</option>
		                	<option value="30">30分钟</option>
		                	<option value="60" selected="selected">60分钟</option>
		                </select> 
						</td>
		                <td>&nbsp;</td>
		                <td>&nbsp;</td>                
		                <td><input type="button" value="查 询" class="btn_2" id="lineQueryBtn" /></td>
		            </tr>
		        </table>
				<div id="chartContainerLine" > </div>
	    </div>
	</div>
</div>
</div>

<div style="overflow-y:auto;display:none;" id="colLogDetailWindows">
	<div id="colDetailChar" ></div>
	<div id="colDetailTable" style="height: 160px;width:100%;"></div>
</div>

</body>
</html>