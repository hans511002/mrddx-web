<%--
  User: wangpengkun
  Date: 13-12-18
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
	
    <title><%=new String(request.getParameter("workName").getBytes("iso-8859-1"),"UTF-8") %></title>
    <%@include file="../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/AnalysisAction.js"></script>
 	<script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="../../resource/Charts/FusionCharts.js"></script>
    <script type="text/javascript" src="partAnalysis.js"></script>
    <script type="text/javascript" >
    	var workId  =<%=request.getParameter("workId")%>;
    //	var workName =<%=request.getParameter("workName")%>;
    	var startDate =<%=request.getParameter("startDate")%>;	
    	var endDate =<%=request.getParameter("endDate")%>;
    </script>
    
</head>
<body style="width:100%;overflow-y: auto;">
	<div style="position:absolute; top:0; left:0; right:0; bottom:0; overflow-x:hidden;overflow-y:auto;padding-left:10px;padding-right:90px;">
	<div style="text-align: center;margin-top: 10px;font-weight:bold;font-size: 120%;" id="missName"></div>
		<table  style="margin-top:10px">
			<tr>
			<td>时间:<input id="startDate"/><a id='reset1' href="javascript:void(0)">×</a>至<input id="endDate"/><a id='reset2' href="javascript:void(0)">×</a></td>
			<td>&nbsp;&nbsp;任务名称：<input type="text" id="ruleName"/></td>
			<td>&nbsp;&nbsp;<input type="button" id="queryBtn"  class="btn_2" value="查询"/></td>
			</tr>
		</table>
	<div style="margin-top:10px;width:100%">
	<div style="width:50%;float:left">
		<div style="font-weight:bold" id="missListToolObj"></div>
		<div style="height:244px;" id="missionDataDiv"></div>
		<div style="height:32px;width:100%;margin-top: 8px">注:1.数据处理,输入输出为数据量的条数;</br>&nbsp;&nbsp;&nbsp;2.采集任务,输入输出为采集的文件个数.
			</div>
	</div>
	<div style="width:50%;float:left">
		<div style="font-weight:bold;text-aligh:left;margin-left: 37px;" id="missCountToolObj"></div>
		<div style="height:289px;margin-left: 37px;" id="partMission" ></div>
	</div>
	</div>
	
	<div style="width:100%;margin-top:10px">
	<div style="width:50%;float:right;">
		<div style="font-weight:bold;text-align: left;margin-top:10px;margin-left: 37px;" id="timeZoneComToolComObj"></div>
		<div style="margin-left: 37px;text-align: left;" id="partMissionDealTime"></div>	
	</div>
	<div style="width:50%;float:right">
		<div style="font-weight:bold;text-aligh:left;margin-top:10px" id="timeZoneToolComObj"></div>
		<div style="text-align: left"" id="partMissionComDeal"></div>
	</div>
	</div>
	
	
	
	<div style="width:100%;margin-top:10px">
	<div style="width:50%;float:right;">
		<div style="font-weight:bold;text-align: left;margin-top:10px;margin-left: 37px;" id="timeZoneComToolObj"></div>
		<div style="margin-left: 37px;"><form name="form1" id="form1"><input type="radio" name="partTime" value ="2" checked="checked"  onclick="getPartTime(this)"/>最近2天
			<input type="radio" name="partTime" value="3" onclick="getPartTime(this)" />最近3天
			<input type="radio" name="partTime" value="5" onclick="getPartTime(this)" />最近5天</form></div>
		<div style="margin-left: 37px;text-align: left;" id="partMissionTime"></div>	
	</div>
	<div style="width:50%;float:right">
		<div style="font-weight:bold;text-aligh:left;margin-top:10px" id="timeZoneToolObj"></div>
		<div><form name="form2" id="form2"><input type="radio" name="partDeal" value="2" checked="checked" onclick="getPartDeal(this)" />最近2天
			<input type="radio" value="3" name="partDeal" onclick="getPartDeal(this)"/>最近3天
			<input type="radio" value="5" name="partDeal" onclick="getPartDeal(this)"/>最近5天</form></div>
		<div style="text-align: left"" id="partMissionDeal"></div>
	</div>
	
	</div>
	<div style="padding-top: 20px">
		<div style="font-weight:bold;" id="countToolObj"></div>
		<div style="height:120px;" id="colDataDiv"></div>
	</div>
	</div>
	<div class="TipDIV" id="missionbustipdiv" style="left: 0;top:50px;position: absolute;display: none;z-index: 100">
    <div class="TipDIV_jiao"></div>
    <%--<a href="javascript:void(0)" class="TipDIV_close" onclick=""></a>--%>
    <h2 class="TipDIV_title" id="missionbustipdiv_title"></h2>
    <p><span class="TipDIV_content_img"></span><span id="missionbustipdiv_content" title="运行数据源地址" class="TipDIV_content"></span></p>
	</div>
</body>
</html>