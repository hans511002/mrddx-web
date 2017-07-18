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
    <script type="text/javascript" src="<%=rootPath%>/meta/resource/js/WdatePicker.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=OPERATING_SYSTEM,SERVER_TYPE,CPU_FRAMEWORK"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/LogAnalysisAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserTypeAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserTypeAction.js"></script>
    <script type="text/javascript" src="logAnalysisM.js"></script>
</head>

<body style='width:100%;height:100%;'>
<div style="width: 100%;height: 100%;overflow: auto;padding-top: 5px;">

    <div id="queryFormDIV" class="C_query">
        <table border="0" cellpadding="0" cellspacing="0" style="padding-bottom: 5px;">
            <tr>
            	<td>选择月份:</td>
                <td><input type="text" onfocus="WdatePicker({dateFmt:'yyyy-MM'})" class="Wdate" id="dateNo" /></td>
                <td>&nbsp;业务类型：<select id="job_type"></select></td>
                <td>&nbsp;&nbsp;<input type="button" value="查 询" class="btn_2" id="queryBtn" /></td>
                <td>&nbsp;&nbsp;<input type="button" value="导 出" class="btn_2" id="download" /></td>
           		
	        </td>
           	</tr>
            </tr>
        </table>
    </div>
    
     <div style="margin-top:5px;width:100%;">
    	<div id="ToolBar6" style="font-weight:bold;width:100%"></div>
		<div style="width:36%;float:left;height:300px">
			<div style="height:289px;" id="markDiv"></div>
		</div>
		<div style="width:64%;float:left;height:300px">
			<div id="ToolBar7" style="font-weight:bold;margin-left:20px"></div>
			<div style="height:200px;margin-left: 20px;" id="showDataDiv"></div>
		</div>
		</div>
    
    
    <div id="a1" name="常规指标">
           <table border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td>
                	<div id="LA001" style="width: 140px; height: 180px; margin: 0 auto;float: left;display: none;"></div>
                	<div id="LA002" style="width: 140px; height: 180px; margin: 0 auto;float: left;display: none;"></div>
                	<div id="LA003" style="width: 140px; height: 180px; margin: 0 auto;float: left;display: none;"></div>
                	<div id="LA004" style="width: 140px; height: 180px; margin: 0 auto;float: left;display: none;"></div>
                	<div id="LA005" style="width: 140px; height: 180px; margin: 0 auto;float: left;display: none;"></div>
                	<div id="LA006" style="width: 140px; height: 180px; margin: 0 auto;float: left;display: none;"></div>
                	<div id="LA007" style="width: 140px; height: 180px; margin: 0 auto;float: left;display: none;"></div>
                	<div id="LA008" style="width: 140px; height: 180px; margin: 0 auto;float: left;display: none;"></div>
                	<div id="LA009" style="width: 140px; height: 180px; margin: 0 auto;float: left;display: none;"></div>
                	<div id="LA010" style="width: 140px; height: 180px; margin: 0 auto;float: left;display: none;"></div>
                </td>	 
            </tr>
        </table>
    </div>
	<div style="font-weight:bold;" id = "ToolBar2"></div>
	<div id="chartContainerLine" style="float: left;"></div>
	<div style="height: 280px;width: 280px;" id="dataInputDiv"></div>
	<div style="font-weight:bold;" id = "ToolBar3"></div>
	<div id="chartContainerLineTop" style="float: left;"></div>
	<div style="font-weight:bold;" id = "ToolBar4"></div>
	<div style="height: 280px;" id="dataDiv"> </div>
	<div style="font-weight:bold;" id = "ToolBar5"></div>
	<div style="height: 280px;" id="dataTopDiv"> </div>
</div>
<div style="overflow-y:auto;display:none;" id="dataFormDIV">
    <form action="" id="dataForm"  method="post">
        <table cellpadding="0" cellspacing="0" class="table">
        	<tr>
        		<td class="t_td">
        		<input type="checkbox" checked="checked" id="getService" />业务类型</td>
        		 <td colspan = "3" class="content_td">
        		 <div style="height:100px;overflow-y:auto;"><table id="serviceRs">
        		 
        		 </table></div>
        		 </td>
        	</tr>
			<tr>
			<td class="t_td" ><input type="checkbox" checked="checked" id="getResult" >统计指标结果</td>
			    <td colspan = "3" class="content_td">
			    <table><tr>
			    <td><input type="checkbox"  checked="checked" id="" name="result" value="1" onClick="checkShow('getResult','result')"/>总调用次数</td>
			    <td><input type="checkbox" checked="checked" id=""  name="result"  value="2" onClick="checkShow('getResult','result')"/>调用次数&lt;5秒</td>
			    <td><input type="checkbox" checked="checked" id=""  name="result" value="3" onClick="checkShow('getResult','result')"/>慢查询占比</td>
			    </tr>
			    <tr>
			    <td><input type="checkbox" checked="checked" id="" name="result" value="4" onClick="checkShow('getResult','result')"/>快查询占比</td>
			    <td><input type="checkbox" checked="checked" id="" name="result" value="5" onClick="checkShow('getResult','result')"/>查询平均耗时</td>
			    <td><input type="checkbox" checked="checked" id="" name="result" value="6" onClick="checkShow('getResult','result')"/>查询最大耗时</td>
			    </tr>
			    <!--<tr>
			    <td><input type="checkbox" checked="checked" id="" name="result" value="7" onClick="checkShow('getResult','result')"/>并发统计</td>
				<td><input type="checkbox" checked="checked" id="" name="result" value="8" onClick="checkShow('getResult','result')"/>服务中断次数</td>
				<td><input type="checkbox" checked="checked" id="" name="result" value="9" onClick="checkShow('getResult','result')"/>不能提供服务时长</td>
			    </tr>-->
			    </table>
				</td>
			</tr>
			<tr>
			<td class="t_td"><input type="checkbox" checked="checked" id="warehouse">入库趋势</td>
			<td colspan="3"  class="content_td"><table><tr>
				<td><input type="checkbox" checked="checked" name="image" value="1" onClick="checkShow('warehouse','image')" />入库趋势图</td>
				<td><input type="checkbox" checked="checked"  name="image" value="2" onClick="checkShow('warehouse','image')"/>入库详情</td>
			</tr></table></td>
			</tr>
			<tr><td  class = "t_td"><input type="checkbox" checked="checked" id="rule">查询规则排行榜</td><td colspan="3"  class="content_td">
				<table>
					<tr>
						<td><input type="checkbox" checked="checked" name="ruleImage" value="1" onClick="checkShow('rule','ruleImage')" />查询规则排行榜图</td>
						<td><input type="checkbox" checked="checked"  name="ruleImage" value="2" onClick="checkShow('rule','ruleImage')"/>查询规则详情</td>
					</tr>
				</table>
			</td></tr>
			<tr><td  class = "t_td"><input type="checkbox" checked="checked" id="srule">慢查询排行榜</td><td colspan="3"  class="content_td"></td></tr>
            <tr>
                <td class="t_td">选择导出项:</td>
                <td class="content_td"><input type="radio" name="downtype" checked="checked"  id="downtype"  value="1" />Word
                   
            	</td>
            </tr>
        </table>
    </form>
    <p class="btn_area">
    	<input type="button" value="导 出" class="btn_2" id="downl" />
        <input name="" id="calBtn" type="button" value="取 消" class="btn_2" />
    </p>
 </div>
</body>
</html>