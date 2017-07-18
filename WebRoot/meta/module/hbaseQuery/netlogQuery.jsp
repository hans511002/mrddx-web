<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<%
	String path = request.getContextPath();
	String servName=request.getServerName();
	String basePath = request.getScheme()+"://"+servName+":"+request.getServerPort()+path+"/";
	String webServiceUrl=basePath+"WS/MetaWs";
%>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>上网日志查询</title>
    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/tag.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />
    <%@ include file="../../public/header.jsp" %>
    <script type="text/javascript" src="netlogQuery.js"></script>
</head>
<body style="height: 100%;width: 100%">
<div id=queryFormDiv style="height:14%">
    <table style="height: 100%">
    	<tr>
    		<td style="text-align:right;">*查询号码:</td>
    		<td colspan="2"><input id="queryNum" />	
    		<td><input type="hidden" style="width:0px" id=webServiceUrl name ="webServiceUrl" value="<%=webServiceUrl%>"/></td>
    		</td>
    	</tr>
        <tr>
        	<td width="15%" style="text-align:right;">选择查询月份:</td>
        	<td width="10%" id="month01"></td>
        	<td width="10%" id="month02"></td>
        	<td width="10%" id="month03"></td>
        	<td width="10%" id="month04"></td>
        	<td width="10%" id="month05"></td>
        	<td width="10%" id="month06"></td>
        	<td width="10%" id="month07"></td>
        </tr>
        <tr>
        	<td style="text-align:right;">选择查询日期区间:</td>
        	<!-- 
        	<td colspan="2"><input id="startDay"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</td>
        	<td colspan="2"><input id="endDay"/></td>
        	 -->
        	<td colspan="2" id="startHtml">
        	<select id="startDay" onchange="deloptE();">
        		<option value="01">01日</option>
        		<option value="02">02日</option>
        		<option value="03">03日</option>
        		<option value="04">04日</option>
        		<option value="05">05日</option>
        		<option value="06">06日</option>
        		<option value="07">07日</option>
        		<option value="08">08日</option>
        		<option value="09">09日</option>
        		<option value="10">10日</option>
        		<option value="11">11日</option>
        		<option value="12">12日</option>
        		<option value="13">13日</option>
        		<option value="14">14日</option>
        		<option value="15">15日</option>
        		<option value="16">16日</option>
        		<option value="17">17日</option>
        		<option value="18">18日</option>
        		<option value="19">19日</option>
        		<option value="20">20日</option>
        		<option value="21">21日</option>
        		<option value="22">22日</option>
        		<option value="23">23日</option>
        		<option value="24">24日</option>
        		<option value="25">25日</option>
        		<option value="26">26日</option>
        		<option value="27">27日</option>
        		<option value="28">28日</option>
        	</select>
        	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</td>
        	<td colspan="2" id="endHtml">
        	<select id="endDay" onchange="deloptS();">
        		<option value="01">01日</option>
        		<option value="02">02日</option>
        		<option value="03">03日</option>
        		<option value="04">04日</option>
        		<option value="05">05日</option>
        		<option value="06">06日</option>
        		<option value="07">07日</option>
        		<option value="08">08日</option>
        		<option value="09">09日</option>
        		<option value="10">10日</option>
        		<option value="11">11日</option>
        		<option value="12">12日</option>
        		<option value="13">13日</option>
        		<option value="14">14日</option>
        		<option value="15">15日</option>
        		<option value="16">16日</option>
        		<option value="17">17日</option>
        		<option value="18">18日</option>
        		<option value="19">19日</option>
        		<option value="20">20日</option>
        		<option value="21">21日</option>
        		<option value="22">22日</option>
        		<option value="23">23日</option>
        		<option value="24">24日</option>
        		<option value="25">25日</option>
        		<option value="26">26日</option>
        		<option value="27">27日</option>
        		<option value="28">28日</option>
        	</select>
        	</td>
        </tr>
        <tr>
        	<td colspan="7"></td>
            <td style="text-align:left;">&nbsp;&nbsp;<input type="button" id="queryBtn" class="btn_2" value="查询" /></td>
        </tr>
        </table>
</div>
<div id="toolbarObj" style="height:8%"></div>
<div id="container" style="height: 78%;width: 100%"></div>
</body>
</html>