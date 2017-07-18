<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>查询规则</title>
    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/tag.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />
    <%@ include file="../../public/header.jsp" %>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAuthorAction.js"></script>
	<script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserTypeAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/HBQryRuleAction.js"></script>
    <script type="text/javascript" src="qryRule.js"></script>
</head>
<body style="height: 100%;width: 100%">
<div id=queryFormDiv style="height:14%">
    <table style="height: 100%">
        <tr>
            <td width="15%" style="text-align:right;">查询规则ID:</td>
            <td width="15%"><input id="ruleId" /></td>
            <td width="15%" style="text-align:right;">查询规则名称:</td>
            <td width="15%"><input id="ruleName" /></td>
            <td width="15%" style="text-align:right;">数据源名称:</td>
            <td width="15%"><input id="sourceName" /></td>
            <td width="5%"></td>
        </tr>
        <tr>
            <td style="text-align:right;">HBase表名:</td>
            <td ><input id="hbName" /></td>
            <td style="text-align:right;">用户名:</td>
            <td ><input id="userName" /></td>
            <td style="text-align:left;">&nbsp;&nbsp;<input type="button" id="queryBtn" class="btn_2" value="查询" /></td>
            <td style="text-align:left;">&nbsp;&nbsp;<input type="button" id="newBtn" class="btn_2" style="visibility: hidden;" value="新增" /></td>
            <td ></td>
        </tr>
        </table>
</div>
<div id="toolbarObj" style="height:6%"></div>
<div id="container" style="height: 80%;width: 100%"></div>
<div style="overflow-y:auto;display:none;" id="authorityFormDIV">
    <form action="#" id="authorityForm">
    	<div style="line-height：100px">
        <table  border="0" cellpadding="0" cellspacing="1" >
            <tr>
                <td style="width:20%" class="t_td">查询规则名称:</td>
                <td ><input type="hidden" id="qryRuleNameId" ><input type="text"   id="qryRuleName"  value=""  style="width:80%"/>
                </td>
                </tr>
                </table>
                <p class="btn_area">
                	<input type="text" readonly="readonly" id="saveBtn" class="btn_2" value="保存" /></div>
            	</p>
        
       </div>
    </form>
</div>

 <div style="overflow-y:auto;display:none;" id="dataUserTypeDIV">
	<div id="tableUserType" style="height: 320px;width:100%;"></div>
    <p class="btn_area">
        <input name="" id="saveUserTypeBtn" type="button" value="保 存" class="btn_2" />
        <input name="" id="calUserTypeBtn" type="button" value="取 消" class="btn_2" />
    </p>
 </div>

<div style="overflow-y:auto;display:none;" id="dataUserToUserDIV">
	<br />
	&ensp;&ensp;任务名称：<input style="width: 200px" type="text" id="task_name"/><input type="hidden" id="task_id"/><br><br>
 	&ensp;&ensp;原创建人：<input style="width: 200px" type="text" id="from_user_name"/><input type="hidden" id="from_user_id"/><br><br>
 	&ensp;&ensp;新创建人：<select style="width: 200px" id="to_user_id"></select>
    <p class="btn_area">
        <input name="" id="saveUserToUserBtn" type="button" value="保 存" class="btn_2" />
        <input name="" id="calUserToUserBtn" type="button" value="取 消" class="btn_2" />
    </p>
</div>
 
</body>
</html>