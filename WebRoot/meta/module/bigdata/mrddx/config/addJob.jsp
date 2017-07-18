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
    <title></title>
    <link type="text/css" rel="stylesheet" href="../../css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="../../css/base.css" />
    <link type="text/css" rel="stylesheet" href="../../css/tb_style.css" />
    <%@include file="../../../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
	<script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=WS_RULE_DATA_TYPE,RETURN_TYPE,WS_RULE_TYPE"></script>
	<script type="text/javascript" src="<%=rootPath%>/dwr/interface/JobAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/BigDataSourceAction.js"></script>
    <script type="text/javascript" src="addJob.js"></script>
	<script type="text/javascript">
		var flag=<%=request.getParameter("flag")%>;
	</script>   

</head>
<body style='width:100%;height:100%;'>

<div id="pageContentDIV" style="position:relative;width:100%;height:100%;overflow:hidden;">
    <div style="height:85%;width:100%; " id='dataTabDIV'></div>
	<div id="_BtnBottom" style="position:absolute;height: 50px;width:100%;text-align:center;padding-top: 15px;" >
		<span id="PrevBtnDiv" style="display: none"><input name="" id="prevBtn" type="button" value="上一步"  class="btn_2"  /></span>
		<span id="NextBtnDiv" style="display: none"><input name="" id="nextBtn" type="button" value="下一步"  class="btn_2"  /></span>
		<span id="SaveBtnDiv" style="display: none"><input name="" id="saveBtn" type="button" value="保 存"   class="btn_2"  /></span>
		<span id="ResetBtnDiv" style="display: none"><input name="" id="resetBtn" type="reset" value="重 置"   class="btn_2"  /></span>
		<span id="CloseBtnDiv" style="display: none"><input name="" id="closeBtn" type="button" value="关 闭" class="btn_2" /></span>
	</div>
</div>

<form action="" id="_jobConfigParamForm" onsubmit="return false;" >

    <div id="inputDataDIV" style="display: none; padding:1px;height:100%;width:100%;overflow-x:hidden;overflow-y:auto;" >
	        <table   border="0" cellpadding="0" cellspacing="1" >
	            <tr>
	                <td style="width: 20%;text-align:right;">输入源类型名称：</td>
	                <td style="text-align: left;padding: 1px;width: 20%">
	                	<select  id="firstSourceTypeName"></select>
	                </td>
	                <td style="width: 20%;text-align:right;">输入数据源名称：</td>
	                <td style="width: 20%;">
	                	<input style="width: 200px;"  id="firstDataSourceName" ></input>
	                </td>
	                <td style="width: 20%;text-align:center;">
	                	<input  id="firstQueryBtn" type="button" value="查询" class="btn_2"></input>
	                </td>
	            </tr>
	        </table>
        <div id="_queryTableGridFromDb_input" style="height: 190px;width:100%; overflow: auto;"></div>
        	输入数据源ID：
        <input type="text" id="inputDataSourceID" value="" readonly="readonly">
       		 输入数据源名称：
        <input type="text" id="inputDataSourceName" value="" readonly="readonly">
        <div id="_queryColumnGridParam_input" style="height: 100px;width:100%; overflow: auto;"></div>
    </div>
	
    <div id="outputDataDIV" style="display: none; padding:1px;height:100%;width:100%;overflow-x:hidden;overflow-y:auto;" >
        <table   border="0" cellpadding="0" cellspacing="1" >
            <tr>
                <td style="width: 20%;text-align:right;">输出源类型名称：</td>
                <td style="text-align: left;padding: 1px;width: 20%">
                	<select  id="secondSourceTypeName"></select>
                </td>                
                <td style="width: 20%;text-align:right;">输出数据源名称：</td>
                <td style="width: 20%;">
                	<input style="width: 200px;"  id="secondDataSourceName" ></input>
                </td>
                <td style="width: 20%;text-align:center;">
                	<input id="secondQueryBtn" type="button" value="查询" class="btn_2"/>
                </td>
            </tr>
        </table>    	
        <div id="_queryTableGridFromDb_output" style="height: 190px;width:100%; overflow: auto;"></div>
        	输出数据源ID：
        <input type="text" id="outputDataSourceID" value="" readonly="readonly">
       		输出数据源名称：
        <input type="text" id="outputDataSourceName" value="" readonly="readonly">
        <div id="_queryColumnGridParam_output" style="height: 100px;width:100%; overflow: auto;"></div>
    </div>


    <div id="jobParamDIV" style="position:absolute;display: none; padding:1px;height:100%;width:100%;overflow-x:hidden;overflow-y:auto;">
        <table class="MetaFormTable"  border="0" cellpadding="0" cellspacing="1" >
            <tr>
                <th><span style="color: red">*</span>Job运行名称：</th>
                <td><input style="width: 400px" type="text" id="jobName"/></td>
                <th><span style="color: red">*</span>Job优先级：</th>
                <td>
		                <select id="jobPriority">
		                	<option id="jobPriority" value="3">普通</option>
		                	<option id="jobPriority" value="1" >最低级</option>
		                	<option id="jobPriority" value="2">低级</option>
		                	<option id="jobPriority" value="4" >高级</option>
		                	<option id="jobPriority" value="5">最高级</option>
		                </select>                
                </td>
            </tr>
            <tr>
            	<th><font color="red">*</font>系统运行数据源：</th>
            	<td>
            	<input type="hidden" id="JOB_RUN_DATASOURCE" value=""/>
            	<input id="JOB_RUN_DATASOURCE_NAME" readonly="readonly" style="width: 400px;" type="text"></input></td>
                <th><span style="color: red">*</span>Map任务数：</th>
                <td><input style="width: 400px" type="text" id="mapTasks"/></td>
            </tr>
            <tr>
                <th><span style="color: red">*</span>Reduce任务数：</th>
                <td><input style="width: 400px" type="text" id="reduceTasks"/></td>
                <th><span style="color: red">*</span>输入目录：</th>
                <td><input style="width: 400px" type="text" id="inputDir"/></td>
            </tr>
            <tr>
                <th>描述信息：</th>
                <td colspan="3"><textarea style="width:720px;height:20px;" id="jobDescribe"></textarea></td>                
            </tr>	
        </table>
        <div id="_queryColGrid_in"  style="height: 600px;width:100%;padding-top:1px"></div>
        <div id="_queryColGrid_out" style="height: 600px;width:100%;padding-top:1px"></div>
        <div id="_queryColGrid_sys" style="height: 600px;width:100%;padding-top:1px"></div>
    </div>
    
</form>

<div class="TipDIV" id="paramDIV" style="left: 0;top:50px;position: absolute;display: none;z-index: 100">
    <h2 class="TipDIV_title" id="paramTitle"></h2>
    <p>
	    <span class="TipDIV_content_img"></span>
	    <span class="TipDIV_content" id="paramContent" title="参数信息" ></span>
    </p>
</div>

<div id="tableSelectDataSourceContentTop" style="display: none;">
<div>
    <span style="margin-left: 10px;" >数据源名称:</span>
    <input type="text" id="searchSourceName" />
    <input type="button" value="搜索" class="btn_2" id="searchDataSourceTable" />
</div>
<div style="height:255px;" id="tableSelectDataSourceContent"></div>
 </div>
<div id="tableSelectDataSourceContentDown" style="display: none;">
    <p class="btn_area"><input type="button" value="确定" class="btn_2" id="saveDataSourceBtn"/>
    </p>
</div>
    
</body>
</html>