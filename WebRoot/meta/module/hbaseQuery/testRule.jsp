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
    <title>规则测试</title>
	<link type="text/css" rel="stylesheet" href="css/tc_style.css" />
	<link type="text/css" rel="stylesheet" href="css/base.css" />
	<link type="text/css" rel="stylesheet" href="css/tb_style.css" />
    <link type="text/css" rel="stylesheet" href="css/tag.css" />
	<%@include file="../../public/header.jsp"%>
	<script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
	<script type="text/javascript" src="<%=rootPath%>/dwr/interface/TestRuleAction.js"></script>
	 <script type="text/javascript" src="<%=rootPath%>/meta/resource/js/OPString.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/AuthorityAction.js"></script>
	<script type="text/javascript" src="testRule.js"></script>
	<script type="text/javascript">
		var qryRuleId = '<%=request.getParameter("qryRuleId")%>';
		var qryRuleName = '<%=URLDecoder.decode(request.getParameter("qryRuleName") == null?"":request.getParameter("qryRuleName"), "UTF-8")%>';
	</script>
</head>

<body>
<p align="center"  style="font-size:14px; color:#3b639f; font-weight:bold; margin-top: 10px">查询规则测试</p>
<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0" style="margin-left: 10px" >
    <tr>
       <td valign=top width="30%" height="100%" >
        <p class="title_blod">参数选项</p>
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="3" class="table_list1" >     
            <tr>
	                <td class="label_blod1"><span style="color: red">*</span>测试用户： </td>
	                <td class="label_blod1"> 
	                    <select id="user_id" style="width:200px" name="user_id" onchange="user_change()">
	                    </select>
	                </td>
            </tr>
            <tr>
                   <td class="label_blod1"><span style="color: red">*</span>用户密码： </td>
                   <td class="label_blod1"> 
                       <input type="text" style="width:200px" id="user_pwd" name ="user_pwd"/>
                   </td>
            </tr>
            <tr>
                   <td class="label_blod1"><span style="color: red">*</span>测试规则ID： </td>
                   <%if(request.getParameter("qryRuleId")!=null){%>
	                   <td class="label_blod1" id="rule_idstd1" style="display: none;"> 
	                       <select style="width:200px" id="rule_id"  name="rule_ids" onchange="rule_id_change()"></select>
	                   </td>
	                   <td class="label_blod1" id="rule_idstd2"> 
	                       <%=request.getParameter("qryRuleId")%>:<%= URLDecoder.decode(request.getParameter("qryRuleName") == null?"":request.getParameter("qryRuleName"), "utf-8")%>
	                   </td>
                   <%}else {%>
	                   <td class="label_blod1" id="rule_idstd1"> 
	                       <select style="width:200px" id="rule_id"  name="rule_ids" onchange="rule_id_change()"></select>
	                   </td>
                   <%} %>
            </tr>
            <tr>
                <td class="label_blod1"><span style="color: red">*</span>测试服务： </td>
                <td class="label_blod1"> 
                    <select style="width:200px;" id="rule_list" name="rule_list" onchange="rule_list_change()">
                    </select>
                </td>
            </tr>
            <tr>
                 <td colspan="2" id="paramsTD"> </td>
            </tr>
            <tr>
                <td colspan="2"> 
                    <input type="hidden" style="width:0px" id=webServiceUrl name ="webServiceUrl" value="<%=webServiceUrl%>"/>
                </td> 
            </tr> 
            <tr>
                <td  colspan="2"> 
                    <input type="button" class="btn_4"  onclick="share('doGet')" id="xmlTestBnt" value="XML 测试 "/>
                    
                </td> 
               <!--  <td>
                    <input type="text" class="btn_4" onclick="queryData()" id="serverTestBnt" value="服务端测试"/>
                </td>
                 -->
            </tr> 
            <tr><td id="remark" class="label_blod1" colspan="2"></td>
            </tr>
        </table>
       </td>
       <td width="70%" height="100%" valign=top style="padding-top:0px;">
			<p class="title_blod">请求地址:<span class="label_blod1"><%=webServiceUrl%></span></p>
			<p class="title_blod">请求消息：</p>
			<textarea id="jsinput" style="width:80%;height:170px;"></textarea>
			<p class="title_blod">响应消息：</p>
			<textarea id="jsoutput" style="width:80%;height:180px;"></textarea>
       </td>
    </tr>
</table>
<div id="tableContentTop" style="display: none;">
        <div style="height:255px;" id="tableContent"></div>
     </div>
     
<div style="overflow-y:auto;display:none;" id="dataFormDIV">
        <table width="100%" border="0" align="center"  cellpadding="0" cellspacing="0" class="showDataTable" id ="showDataTable"> </table>
        <table width="100%" border="0" align="center"  cellpadding="0" cellspacing="0" class="buttontable">
            <tr>
                 <td  class="a1" nowrap width="30%" align="right" style="height: 20px; padding-right:15px;" valign="bottom">
                    &nbsp;&nbsp;
                    <a id="getFirstPage">首页</a>
                    &nbsp;
                    <a id="getPreiPage" >上一页</a>
                    &nbsp;&nbsp;
                    <a id="getNextPage" >下一页</a>
                    &nbsp;&nbsp;
                    <a id="getLastPage" >尾页</a>
                    &nbsp;&nbsp;
                </td>
            </tr>
        </table>
        <p class="btn_area">
        <input name="" id="calBtn" type="text" value="关闭" class="btn_2" />
    </p>
 </div>
</body>
</html>