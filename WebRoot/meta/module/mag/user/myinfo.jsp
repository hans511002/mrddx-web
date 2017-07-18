<%--
  Created by IntelliJ IDEA.
  User: wangcs
  Date: 12-3-12
  Time: 下午6:09
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<%@page import="com.ery.base.support.utils.Convert"%>
<%@page import="com.ery.meta.sys.i18n.I18nManager"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
    <title>个人资料完善</title>
    <%@include file="../../../public/head.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript">
    	var meta_menu_local_info = {
    		USERIF:'个人资料完善',
			USERIF_NAME:'姓名：',
			USERIF_PINYIN:'拼音：',
			USERIF_EMAIL:'邮箱：',
			USERIF_MOBILE:'手机：',
			USERIF_ADDRESS:'地域：',
			USERIF_DEPART:'部门：',
			USERIF_POST:'岗位：',
			USERIF_ZHIWU:'职务：',
			USERIF_OALOGIN:'OA登陆名：',
			USERIF_SYSTEM:'默认系统：',
			USERIF_VIP:'VIP用户：',
			USERIF_SUBMIT:'提交',
			USERIF_AGAIN:'重置',
			USERIF_P_T:"正在提交",
			USERIF_P_C:"用户资料正在提交，请稍后",
			USERIF_ERROR1:"对不起，修改出错，请重试！",
			USERIF_ERROR2:"修改失败，邮箱地址已存在！",
			USERIF_ERROR3:"修改失败，用户名已存在！",
			USERIF_ERROR4:"修改失败，OA登录名已存在！",
			USERIF_SUCCESS:"修改成功"
    	};
    	toLocal(meta_menu_local_info);
    </script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/DeptAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/ZoneAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/StationAction.js"></script>
    <script type="text/javascript" src="myinfo.js"></script>
    <style type="text/css">
        .formAnnotation{
            color:#FFA500;
        }
        #userFormTable{
            margin-right: auto;
            margin-left: auto;
            text-align: center;
            font-size: 12px;
            margin-top: 2px;
        }
        #userFormTable tbody tr td {
            text-align: left;
            padding:5px;
            line-height: 15px;
        }
        #userFormTable tbody tr th {
            white-space: nowrap;
            text-align: right;
            font-weight: normal;
            width:20%;
            padding: 0px;
            margin: 0px;
        }
        #icoTable {
            background: url('<%=rootPath%>/meta/resource/images/ico-h.gif');
            background-position: -50px 0;
            width: 28px;
            height: 24px;
            float: left;
            text-align: right;
        }
        #tableMeg{
            font-weight: bold;
        }
        div.btn-box {width:240px;height:30px;margin:20px auto;}
        .btn1 {
            width:87px;
            height:29px;
            background:url('<%=rootPath%>/meta/resource/images/sbt.png') no-repeat;
            display:block;
            text-align:center;
            float:left;
            margin:10px;
            cursor:pointer;
        }
        .btn1:hover {background:url('<%=rootPath%>/meta/resource/images/sbt_on.png') no-repeat;}
        .btn2 {
            width:87px;
            height:29px;
            background:url('<%=rootPath%>/meta/resource/images/reset.png') no-repeat;
            display:block;
            margin-left:10px;
            text-align:center;
            float:left;
            margin:10px;
            cursor:pointer;
        }
        .btn2:hover {background:url('<%=rootPath%>/meta/resource/images/reset_on.png') no-repeat;}
    </style>
    <%
    	int mId =0;// Convert.toInt(menuId,0);
    %>
</head>
<body style="height:100%;width:100%">
<form action="" id="_userForm" onsubmit="return false;" style="width:100%;height: 100%;display: none">
<table cellpadding="0" cellspacing="0" style="width:100%;position: relative;"
       class="dhtmlxInfoBarLabel formTable" id="userFormTable">
        <tr>
            <th width="15%"><%=I18nManager.getItemText(mId,"USERIF_NAME","姓名：") %></th>
            <td width="35%">
                <input type="hidden" name="userId" id="_userId" value="">
                <input type="hidden" name="autoRight" id="_autoRight" value="0">
                <input type="hidden" name="myinfo" value="1">
                <input type="hidden" name="vipFlag" id="_vipFlag" value="">
                <input name="userNamecn" id="_userNamecn" type="text" style="text-transform: uppercase;width: 250px;height:22px;line-height:22px;"/>
                <span style="color: red">*</span>
                <span class="formAnnotation"></span>
            </td>
        </tr>
        <tr>
            <th><%=I18nManager.getItemText(mId,"USERIF_EMAIL","邮箱：") %></th>
            <td>
                <input name="userEmail" id="_userEmail" type="text" style="width: 250px;height:22px;line-height:22px;"/>
                <span style="color: red">*</span>
                <span class="formAnnotation"></span>
            </td>
        </tr>
        <tr>
            <th><%=I18nManager.getItemText(mId,"USERIF_PINYIN","拼音：") %></th>
            <td>
                <input name="userNameen" id="_userNameen" type="text" style="width: 250px;height:22px;line-height:22px;"/>
                <span class="formAnnotation"></span>
            </td>
        </tr>
        <tr>
            <th><%=I18nManager.getItemText(mId,"USERIF_MOBILE","手机：") %></th>
            <td>
                <input name="userMobile" id="_userMobile" type="text" style="width: 250px;height:22px;line-height:22px;"/>
                <span class="formAnnotation"></span>
            </td>
        </tr>
        <tr>
            <th><%=I18nManager.getItemText(mId,"USERIF_ZHIWU","职务：") %></th>
            <td>
                <input name="headShip" id="_headShip" type="text" style="width: 250px;height:22px;line-height:22px;"/>
                <span class="formAnnotation"></span>
            </td>
        </tr>
        <tr>
            <th><%=I18nManager.getItemText(mId,"USERIF_ADDRESS","地域：") %></th>
            <td>
                <input type="hidden" name="zoneId" id="_zoneId" value=""/>
                <select style="width:255px;padding:2px 0;" name="zoneId" id="_zoneIdSel" disabled="disabled"></select>
                <span class="formAnnotation"></span>
            </td>
        </tr>
        <tr>
            <th><%=I18nManager.getItemText(mId,"USERIF_DEPART","部门：") %></th>
            <td>
                <input type="hidden" name="deptId" id="_deptId" value=""/>
                <select style="width:255px;padding:2px 0;" name="deptId" id="_deptIdSel" disabled="disabled"></select>
                <span class="formAnnotation"></span>
            </td>
        </tr>
        <tr>
            <th><%=I18nManager.getItemText(mId,"USERIF_POST","岗位：") %></th>
            <td>
                <input type="hidden" name="stationId" id="_stationId" value=""/>
                <select style="width:255px;padding:2px 0;" name="stationId" id="_stationIdSel" disabled="disabled"></select>
                <span class="formAnnotation"></span>
            </td>
        </tr>

        <%--<tr>--%>
            <%--<th>OA登陆名：</th>--%>
            <%--<td>--%>
                <%--<input name="oaUserName" id="_oaUserName" type="text" style="width: 155px;height:15px;line-height:15px;"/>--%>
                <%--<span class="formAnnotation"></span>--%>
            <%--</td>--%>
            <%--<th>默认系统：</th>--%>
            <%--<td>--%>
                <%--<select style="width:161px;" name="groupId" id="_groupId"></select>--%>
                <%--<span class="formAnnotation"></span>--%>
            <%--</td>--%>
        <%--</tr>--%>

</table>
<div style="height: 30px; width:100%;"><div class="btn-box">
    <span class="btn1" id="_submit" onclick="submitValidate();"></span>
    <span class="btn2" id="_reset" onclick="initMyInfoForm();"></span>
</div></div>
</form>
</body>
</html>