<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<%@ page import="com.ery.base.support.sys.SystemVariable" %>
<%@ page import="com.ery.meta.sys.i18n.I18nManager" %>
<%
	String defaultPassword = SystemVariable.getString("defaultPassword","123456");
	String base = request.getScheme() + "://" +  request.getServerName() + ":" + 
	  request.getServerPort() +  request.getContextPath();
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">

<head>
    <title>用户申请</title>
    <%@include file="head.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuIds=2007"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/DeptAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/ZoneAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/StationAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/LoginAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/SessionManager.js"></script>

    <script type="text/javascript" src="userApply.js"></script>
<style type="text/css">
	.but{
		background-image: url("<%=rootPath%>/portal/resource/images/buttont_bg001.gif");
		cursor:pointer;
	}
	.inputClass{
		width: 240px;
		height: 20px;
		line-height: normal !important;
	}
	.userApply-label {
		font-weight:bold;
	}
	.userApply-note{
		color:red;
	}
	
	.pass-desc {
		color:#A1A1A1;
		display:block;
		margin-top:2px;
	}
	table.dhtmlxLayoutPolyContainer_dhx_skyblue td.dhtmlxLayoutSinglePoly div.dhxcont_global_content_area{
		position:absolute;overflow:hidden;border:#a4bed4 0px solid;background-color:#FFF;\
	}
</style>
<script type="text/javascript">
var flag = <%=request.getParameter("flag")%>

function bindImgAction() {
	var img = document.getElementById('validateCodeImg');
	img.onclick = function() {
		changeCode();
	}
}

var defaultPassword = '<%= defaultPassword%>';
var sysPath = '<%= base%>';

function changeCode()
  {
  	document.getElementById("validateCode").value = "";
  	var _validateCodeImgId = document.getElementById("validateCodeImg");
_validateCodeImgId.src="verifyCode.jsp?randomCode="+Math.random();
  }
  
document.onkeypress=function(e){
        var code; 
        if  (!e) 
        { 
            var e = window.event; 
        } 
        if(e.keyCode) 
        {   
            code = e.keyCode; 
        } 
        else if(e.which) 
        { 
            code = e.which; 
        }
        if(code==13)
        {
			save();
        }
}
</script>
</head>
<body style="height: 100%;width: 100%" onload="bindImgAction();">
<div id="container" style="height: 100%;width: 100%"></div>
<div>
	<form action="" id="addUserForm">
	<table style="width:100%;height: 30%;"class="dhtmlxInfoBarLabel formTable" >
		<tbody id="">
			<tr>
				<td width="15%" align="right"><span class="userApply-label" style="position:relative;top:-10px;">用&nbsp;户&nbsp;名：</span></td>
				<td>
					<input type="text" id="userNamecn" name="userNamecn" class="inputClass" checked="checked"/>
					<input type="hidden"/>
					
					<span  class="userApply-note">请填写姓名(必填项*)</span>
					<span class="pass-desc">不超过10个汉字，或20个字节(数字，字母和下划线)</span>
				</td>
			</tr>
			<tr>
				<td width="15%" align="right"><span class="userApply-label" style="position:relative;top:-10px;">拼音账号：</span></td>
				<td><input type="text" id="userNameen" name="userNameen" class="inputClass"/>
					<span class="pass-desc">不超过50个字母</span>
				</td>
			</tr>
			<tr>
				<td width="15%" align="right"><span class="userApply-label" style="position:relative;top:-10px;">手机号码：</span></td>
				<td><input type="text" id="userMobile" name="userMobile" class="inputClass"/>
					<span class="pass-desc">请输入有效的手机号码</span>
				</td>
			</tr>
			<tr>
				<td width="15%" align="right"><span class="userApply-label" style="position:relative;top:-10px;">电子邮件：</span></td>
				<td>
					<input type="text" id="userEmail" name="userEmail" class="inputClass"/>
					<input type="hidden"/>
					<span  class="userApply-note">请填写邮箱(必填项*)</span>
					<span class="pass-desc">请输入有效的邮件地址</span>
				</td>
			</tr>
			<tr style="display: none">
				<td width="15%" align="right"><span class="userApply-label">担任职务：</span></td>
				<td><input type="text" id="headShip" name="headShip" class="inputClass"/></td>
			</tr>
			<tr>
				<td width="15%" align="right"><span class="userApply-label">所属地域：</span></td>
				<td>
					<input type="text" id="zone" name="zone" class="inputClass" readonly="readonly"/>
					<input type="hidden" id="zoneId" name="zoneId"/>
					<span  class="userApply-note" style="position:relative;top:-3px;">请选择地域(必选项*)</span>
					<span class="pass-desc"></span>
				</td>
			</tr>
			<tr>
				<td width="15%" align="right"><span class="userApply-label">所属部门：</span></td>
				<td>
					<input type="text" id="dept" name="dept" class="inputClass" readonly="readonly"/>
					<input type="hidden" id="deptId" name="deptId"/>
					<span  class="userApply-note" style="position:relative;top:-3px;">请选择部门(必选项*)</span>
					<span class="pass-desc"></span>
				</td>
			</tr>
			<tr>
				<td width="15%" align="right"><span class="userApply-label">所属岗位：</span></td>
				<td>
					<input type="text" id="station" name="station" class="inputClass" readonly="readonly"/>
					<input type="hidden" id="stationId" name="stationId"/>
					<span  class="userApply-note" style="position:relative;top:-3px;">请选择岗位(必选项*)</span>
					<span class="pass-desc"></span>
				</td>
			</tr>
			
			
			<tr>
				<td width="15%" align="right"><span class="userApply-label">验&nbsp;证&nbsp;码：</span></td>
				<td >
                    <input id="validateCode" name="validateCode" type="text" style="width: 40px;height: 22px;"/>
                    <img title="点击改变验证码" id="validateCodeImg" src="verifyCode.jsp" style="cursor:pointer;height: 25px;width: 50px;margin-bottom: -9px"/>
                    <a href="javascript:changeCode()">看不清，换一张</a>
				</td>
			</tr>
		</tbody>
		<!--  
		<tfoot style="margin-top: 20px">
			<tr>
				<td></td>
				<td>
					<input type="button" value="申请" class="but" onclick="save()" />&nbsp;&nbsp;&nbsp;&nbsp;
					<input type="reset" value="清空" class="but" />&nbsp;&nbsp;&nbsp;&nbsp;
					<input type="button" value="返回登录" class="but" onclick="returnLogin()"/>&nbsp;&nbsp;&nbsp;&nbsp;
				</td>
			</tr>
		</tfoot>
		-->
	</table>
	 <div style="height: 30px; width:100%; position: relative;top:20px;" id="_submit"></div>
	</form>
	</div>	
</body>
</html>
