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
    <title>[配置]<%=request.getParameter("DEAL_NAME")==null?"":new String(request.getParameter("DEAL_NAME").getBytes("iso-8859-1"),"UTF-8") %></title>
    <link type="text/css" rel="stylesheet" href="../../css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="../../css/base.css" />
    <link type="text/css" rel="stylesheet" href="../../css/tb_style.css" />
    <%@include file="../../../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
	<script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=WS_RULE_DATA_TYPE,RETURN_TYPE,WS_RULE_TYPE"></script>
	<script type="text/javascript" src="<%=rootPath%>/dwr/interface/JobAction.js"></script>
    <script type="text/javascript" src="viewJob.js"></script>
	<script type="text/javascript">
		var flag=<%=request.getParameter("flag")%>;
		var jobId=<%=request.getParameter("jobId")%>;
	</script>
    <style type="text/css">
		table.ViewTable{
		    width:100%;
		    background-color:#A4BED4;
		    overflow: hidden;
		}
		table.ViewTable tr{
		    height:24px;
		}
		table.ViewTable th{
		    width:70px;
		    text-align: right;
		    padding: 1px 2px 1px 0;
		    background-color:#E9F5FE;
		    vertical-align:middle;
		    white-space:nowrap;
		    font-size:12px;
		    height:100%;
		    min-height:22px;
            line-height:22px;
		}
		table.ViewTable td{
		    text-align: left;
		    padding:2px 2px 2px 2px;
		    background-color:#FFFFFF;
		    vertical-align:middle;
		    white-space:nowrap;
		    font-size:12px;
		    height:100%;
		    min-height:22px;
            line-height:22px;
		}        

    </style>
</head>
<body style='width:100%;height:100%;'>
<div id="pageContentDIV" style="position:absolute;left:0;right: 0;bottom:40px;top:0;overflow:hidden;border-bottom:1px solid #A4BED4;">
    <table class="ViewTable"  border="0" cellpadding="0" cellspacing="1" width="100%;">
        <tr>
            <th style="width:20%">Job运行名称：</th>
            <td style="width:30%"><div id="jobName" ></div></td>
            <th style="width:20%">Job优先级：</th>
            <td style="width:30%"><div id="jobPriorityName" ></div></td>
        </tr>
        <tr>
            <th>输入数据源名称：</th>
            <td><div id="inputDataSourceName"></div></td>
            <th>输出数据源名称：</th>
            <td><div id="outputDataSourceName"></div></td>
        </tr>
        <tr>
            <th>系统运行数据源：</th>
            <td><div id="JOB_RUN_DATASOURCE_NAME"></div></td>
            <th>输入目录：</th>
            <td><div id="inputDir"></div></td>
        </tr>
        <tr><th>Map任务数：</th>
            <td><div id="mapTasks"></div></td>
            <th>Reduce任务数：</th>
            <td><div id="reduceTasks"></div></td>
        </tr>
        <tr><th>业务类型：</th>
            <td><div id="typeName"></div></td>
            <th></th>
            <td></td>
        </tr>
        <tr>
            <th style="width:120px;">输入插件内容:</th>
            <td style="vertical-align:top;">
                <input id="inputPluginBtn" type="button" value="配置" class="btn_2" />
            </td>
            <th style="width:120px;">输出插件内容:</th>
            <td style="vertical-align:top;">
                <input id="outputPluginBtn" type="button" value="配置" class="btn_2" />
            </td>
        </tr>
        <tr>
            <th>描述信息：</th>
            <td colspan="3"><textarea  style="height:50px;width:95%" id="jobDescribe"></textarea></td>
        </tr>
    </table>
    <div id="_queryColGridParam_in" style="position:absolute;left:0;right:0;bottom:0;top:225px;"></div>
</div>
<div id="_BtnBottom" style="position:absolute;left:0;right:0;bottom:0;height: 30px;text-align:center;margin-top:10px;" >
    <span id="CloseBtnDiv" style="display: none"><input name="" id="closeBtn" type="button" value="关 闭" class="btn_2" /></span>
</div>
 <div id="div_plugin" style="left: 0;width:532px;height:240;position: absolute;display: none;z-index: 100;">
    <div><span>插件代码</span><img id="pluginValueExample" src="../../../../../meta/resource/images/help.gif" alt="" /></div>
    <textarea id="pluginCode"  style="text-align: left;" readonly="readonly" rows="23" cols="64"></textarea>
    <div style="margin-top: 8px; text-align: center;">
        <input name="" id="pluginCloseBtn" type="button" value="关闭" class="btn_2" />
    </div>
 </div>
 <div id="pluginExampleDIV" style="left: 0;width:350px;position: absolute;display: none;z-index: 100"></div>
</body>
</html>