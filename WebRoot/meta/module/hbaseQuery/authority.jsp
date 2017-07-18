<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>日志信息</title>
    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/tag.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />
    <%@ include file="../../public/header.jsp" %>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/AuthorityAction.js"></script>
    <script type="text/javascript" src="authority.js"></script>
</head>
<body style="height: 100%;width: 100%">
<div id=queryFormDiv style="height:12%">
    <table style="height: 100%">
        <tr>
            <td width="10%" style="text-align:right;" >&nbsp;&nbsp;&nbsp;&nbsp;用户名称:</td>
            <td width="15%" ><input id="userName" style="width: 120px"/></td>
            <td width="10%" style="text-align:right;">&nbsp;&nbsp;&nbsp;&nbsp;状态:</td>
            <td width="15%"><select type="text" id="state"></select></td>
            <td width="10%" style="text-align:left;">&nbsp;&nbsp;<input type="button" id="queryBtn" class="btn_2" value="查询" /></td>
            <td width="10%" style="text-align:left;">&nbsp;&nbsp;<input type="button" id="newBtn" class="btn_2" value="新增" /></td>
            <td width="30%"></td>
        </tr>
    </table>
</div>
<div id="container" style="height: 88%;width: 100%"></div>
<div style="overflow-y:auto;display:none;" id="authorityFormDIV">
    <form action="#" id="authorityForm">
        <table class="authorityFormTable" border="0" cellpadding="0" cellspacing="1">
            <tr>
                <td style="width:20%" class="t_td">用户名:</td>
                <td class="content_td"><input type="text" class="input"   id="user_name"  value=""  />
                    <input type="hidden"  id="user_id"  value=""  />
                </td>
            </tr>
            <tr>
                <td style="text-align: right;" class="t_td"><div id="add_password">密码:</div><div id="modify_password">新密码:</div></td>
                <td class="content_td" width="100%"><input type="password" class="input" id="user_password" value="" /><div id="fontSize">不填写密码、不更改密码</div></td>
            </tr>
            <tr>

                <td style="text-align: right;" class="t_td">确认密码: </td>
                <td class="content_td"><input type="password" class="input" id="confirm_password" value="" /> </td>
            </tr>

            <tr>
                <td style="text-align: right;" class="t_td" >状态:</td>
                <td class="content_td">
                    <input type="radio"   name="user_state" value="0"  />启用
                    <input type="radio"   name="user_state" value="1" />禁用
            </tr>
        </table>
        <p class="btn_area">
            <input type="text" readonly="readonly" id="saveBtn" class="btn_2" value="保存" />
            <input type="text" readonly="readonly" id="calBtn" class="btn_2" value="取消" />
        </p>
    </form>
</div>
<div id="ruleContentTop" style="display: none;">
    <div>
        <span style="margin-left: 10px;" >查询规则ID:</span>
        <input type="text" id="ruleId" />
        <span style="margin-left: 10px;" >查询规则名称:</span>
        <input type="text" id="ruleName" />

        <input type="button" value="查询" class="btn1" id="ruleTable" />
    </div>
    <div style="height:255px;" id="tableRuleContent"></div>
</div>
<div id="ruleContentDown" style="display: none;">
    <p class="btn_area" style="text-align: center"><input type="button" value="关闭" class="btn_2" id="calBtn1"/>
    </p>
</div>
</body>
</html>