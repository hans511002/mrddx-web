<%--
  User: wangpengkun
  Date: 13-12-09
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java"
	isELIgnored="false"%>
<html>
<head>
<title>全局任务统计分析</title>
<%@include file="../../public/header.jsp"%>
<script type="text/javascript">
		var v_flag=<%=request.getParameter("flag")%>;
</script>
<script type="text/javascript"
	src="<%=rootPath%>/dwr/interface/AnalysisAction.js"></script>

<script type="text/javascript"
	src="../../resource/Charts/FusionCharts.js"></script>
<script type="text/javascript" src="overallAnalysis.js"></script>
</head>
<body style='width:100%;height:100%;top:10;overflow-y: auto;'>
	<div style="position:absolute; top:0; left:0; right:0; bottom:0; overflow-x:hidden;overflow-y:auto;padding-left:10px;padding-right:90px;">
		<table cellpadding="0" cellspacing="0" style="margin-top: 10px" class="table">
			<tr>
				<td><a href="javascript:void(0);"
					onclick="show_charts(-1); return false;">当天</a> <a
					href="javascript:void(0);" onclick="show_charts(1); return false;">最近一个月</a>
					<a href="javascript:void(0);"
					onclick="show_charts(3); return false;">最近三个月</a> <a
					href="javascript:void(0);" onclick="show_charts(6); return false;">最近六个月</a>
					时间：<input id="startDate" /><a id='reset1'
					href="javascript:void(0)">×</a>&nbsp;至&nbsp;<input id="endDate" /><a
					id='reset2' href="javascript:void(0)">×</a> &nbsp;<input
					type="button" id="queryBtn" class="btn_2" value="查询" />
				</td>
			</tr>
		</table>
		<div style="font-weight:bold;" id="missTypeToolObj"></div>
		<div style="height:120px;margin-top: 0px" id="dataDiv"></div>
		<div id="statisticalToolObj" style="text-align:left;font-weight:bold;margin-top:10px"></div>
		<div style="height:400px;text-align: left" id="chartAnalysis"></div>
	
		<div style="margin-top:10px">
		<div style="width:50%;float:left">
			<div id="failToolObj" style="font-weight:bold"></div>
			<div id="chartFail" style="text-align: left;"></div>
		</div>
		<div style="width:50%;float:left">
			<div id="colDealToolObj" style="font-weight:bold;margin-left:20px"></div>
			<div id="chartCollectDeal" style="padding-left:20px;text-align: left">
		</div>
		</div>
		</div>
</body>
</html>