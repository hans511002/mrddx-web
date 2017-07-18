<%--
  Created by IntelliJ IDEA.
  User: 春生
  Date: 13-10-29
  Time: 上午10:42
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>维护数据处理策略任务</title>
    <%@include file="../../../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=WS_RULE_DATA_TYPE,RETURN_TYPE,WS_RULE_TYPE"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/JobAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/BigDataSourceAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserTypeAction.js"></script>
    <script type="text/javascript">
        var jobId = 0;
        var copyFlag = 0;
        <%
        String jobId = request.getParameter("jobId");
        String copyFlag = request.getParameter("copyFlag");
        if(jobId!=null && !"".equals(jobId)){
        out.println("jobId="+jobId+";");
        }
        if("1".equals(copyFlag) || "true".equals(copyFlag)){
        out.println("copyFlag=1;");
        }
        %>
    </script>
    <script type="text/javascript" src="paramInputValCfg.js"></script>
    <script type="text/javascript" src="saveJob.js"></script>
    <style type="text/css">
        .paramTb{}
        .paramTb th{
            font-weight:normal;
            background-color:#ffffee !important;
            height:14px !important;
            line-height:14px !important;
            text-align:left !important;
            padding-right:10px;
        }
        .paramTb td{
            white-space:normal !important;
            word-wrap:break-word;
            word-break:break-all;
            height:14px !important;
            line-height:14px !important;
        }
        .paramTb tr:hover td{
            background-color:#ffffdd !important;
        }
        .MetaFormTable input{
            height:24px !important;
            vertical-align:middle;
        }
        td.ptitle{
            background-color:#E9F5FE !important;
            text-align:left !important;
            width:150px;
            min-width:150px;
            white-space:normal !important;
            word-wrap:break-word;
            word-break:break-all;
        }
        td.pname{
            text-align:left !important;
            white-space:nowrap;
        }
        td.pvalue{
            width:250px;
            min-width:250px;
            padding-left:5px !important;
        }
        td.pdesc{
            position:relative;
            white-space:normal !important;
            word-wrap:break-word;
            word-break:break-all;
            text-overflow:ellipsis;
        }
        tr:hover .pname{
            background-color:#f5f7f4 !important;
        }
        tr:hover .pvalue{
            background-color:#f5f7f4 !important;
        }
        tr:hover .pdesc{
            background-color:#f5f7f4 !important;
        }
    </style>
</head>
<body style="width:100%;height:100%;">
<div style="position:absolute;left:0;right: 0;bottom:40px;top:0;width:100%;" id='dataTabDIV'></div>
<div style="position:absolute;left:0;right:0;bottom:0;height: 30px;text-align:center;margin-top:10px;width:100%;" >
    <input style="display:none;margin-right:10px;" id="prevBtn" type="button" value="上一步"  class="btn_2"  />
    <input style="display:none;margin-right:10px;" id="nextBtn" type="button" value="下一步"  class="btn_2"  />
    <input style="display:none;margin-right:10px;" id="saveBtn" type="button" value="保 存"   class="btn_2"  />
    <input style="margin-right:10px;" id="closeBtn" type="button" value="关 闭" class="btn_2" />
    <input style="margin-right:10px;" id="resetBtn" type="reset" value="重 置"   class="btn_2"  />
</div>
<div id='baseInfo' style="width:100%;height:100%;position:relative;display:none;overflow-x:hidden;overflow-y:auto;">
    <table class="MetaFormTable" border="0" cellpadding="0" cellspacing="1" style="width:100%;">
        <tr>
            <th style="width:120px;">Job名称:<span style="color:red;">*</span></th>
            <td><input type="text" id='jobName'></td>
            <th style="width:120px;">运行优先级:<span style="color:red;">*</span></th>
            <td><div id='jobPriority'></div></td>
        </tr>
        <tr>
            <th style="width:120px;">输入目录:<span style="color:red;">*</span></th>
            <td><input type="text" id='inputDir'></td>
            <th style="width:120px;">任务数:<span style="color:red;">*</span></th>
            <td>
                Map:<input type="text" id='mapTaskNum'>
                &nbsp;Reduce:<input type="text" id='reduceTaskNum'>
            </td>
        </tr>
        <tr>
            <th style="width:120px;">运行数据源:<span style="color:red;">*</span></th>
            <td style="vertical-align:top;">
                <input type="text" id='runDs'>
                <div id='runDsParDIV' style="margin-top:1px;" title="连接配置信息"></div>
            </td>
            <th style="width:120px;">描述信息:&nbsp;</th>
            <td style="vertical-align:top;"><textarea id='descInfo' style="width:300px;height:28px"></textarea></td>
        </tr>
        <tr>
            <th>业务类型：<span style="color:red;">*</span></th>
			<td style="vertical-align:top;"><select id="jobType"></select></td>  
			<th></th>
			<td></td>        
        </tr>
        <tr>
            <th style="width:120px;">输入数据源:<span style="color:red;">*</span></th>
            <td style="vertical-align:top;">
                <input type="text" id='inputDs'>
                <div id='inputDsParDIV' style="margin-top:1px" title="连接配置信息"></div>
            </td>
            <th style="width:120px;">输出数据源:<span style="color:red;">*</span></th>
            <td style="vertical-align:top;">
                <input type="text" id='outDs'>
                <div id='outDsParDIV' style="margin-top:1px;" title="连接配置信息"></div>
            </td>
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
    </table>
</div>
<div id='paramInfo' style="width:100%;height:100%;position:relative;display:none;overflow-x:hidden;overflow-y:auto;">
    <table class="MetaFormTable" border="0" cellpadding="0" cellspacing="1" style="width:100%;">
        <tr>
            <th style="width:150px;">&nbsp;</th>
            <th id='pt1' style="text-align: center;position:relative;z-index:10;border-bottom:0 solid #A4BED4;">参数名</th>
            <th id='pt2' style="text-align: center;position:relative;z-index:10;border-bottom:0 solid #A4BED4;width:200px;">参数值</th>
            <th id='pt3' style="text-align: center;position:relative;z-index:10;border-bottom:0 solid #A4BED4;">参数描述</th>
        </tr>
        <tbody id='inputParTD'></tbody>
        <tbody id='outParTD'></tbody>
        <tbody id='sysParTD'></tbody>
    </table>
</div>
 <div id="div_plugin" style="left: 0;width:532px;height:240;position: absolute;display: none;z-index: 100">
    <div><span>请填写插件代码</span><img id="pluginValueExample" src="../../../../../meta/resource/images/help.gif" alt="" /></div>
    <textarea id="pluginCode"  style="text-align: left;" rows="23" cols="64"></textarea>
    <div style="margin-top: 8px;text-align: center;">
        <input name="" id="pluginSaveBtn" type="button" value="保 存" class="btn_2"/>
        <input name="" id="pluginCloseBtn" type="button" value="关闭" class="btn_2" />
        <input name="" id="pluginCalBtn" type="button" value="取 消" class="btn_2" />
    </div>
 </div>
 <div id="pluginExampleDIV" style="left: 0;width:350px;position: absolute;display: none;z-index: 100"></div>
</body>
</html>