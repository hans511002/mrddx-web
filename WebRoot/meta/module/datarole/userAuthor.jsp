<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王建友
 * @description 
 * @date 2013-07-10
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title></title>
    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/tag.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />

    <%@include file="../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=OPERATING_SYSTEM,SERVER_TYPE,CPU_FRAMEWORK"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserTypeAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAuthorAction.js"></script>
    <script type="text/javascript" src="userAuthor.js"></script>
</head>

<body style='width:100%;height:100%;'>

<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: hidden;">
    <div id="queryFormDIV" class="C_query">
        <table border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td>用户名称:</td>
                <td><input type="text" style="width: 150px"  class="input" id="S_USER_NAME"/></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>                
                <td><input type="button" value="查 询" class="btn_2" id="queryBtn" /></td>
            </tr>
        </table>        
    </div>
    <div id="toolbarObj"></div>
    <div style="min-height:300px;min-width:800px;border-top:1px solid #D0E5FF;left:0px;bottom: 0px;right: 0px;" id="dataDiv">
    </div>
</div>

<div style="overflow-y:auto;display:none;" id="dataFormDIV">
    <form action="#" id="dataForm">
        <table cellpadding="0" cellspacing="0" class="table">
            <tr>
                <td class="t_td"><span style="color:red;font-weight:normal;">*</span>业务类型名称:</td>
                <td class="content_td"><input type="text"  id="TYPE_NAME" class="input" value="" rows="4" style="width:60%;" />
					<input type="hidden" id="TYPE_ID" value="0"/>
				</td>
            </tr>
        </table>
    </form>
    <p class="btn_area">
        <input name="" id="saveBtn" type="button" value="保 存" class="btn_2" />
        <input name="" id="calBtn" type="button" value="取 消" class="btn_2" />
    </p>
</div>

 <div style="overflow-y:auto;display:none;" id="dataUserTypeDIV">
 	用户名称：<select id="user_id"></select>
	<div id="tableUserType" style="height: 280px;width:100%;"></div>
    <p class="btn_area">
        <input name="" id="saveUserTypeBtn" type="button" value="保 存" class="btn_2" />
        <input name="" id="calUserTypeBtn" type="button" value="取 消" class="btn_2" />
    </p>
 </div>

<div style="overflow-y:auto;display:none;" id="dataUserToUserDIV">
	<br />
 	&ensp;&ensp;原始用户：<input readonly="readonly" style="width: 200px" type="text" id="from_user_name"/><input type="hidden" id="from_user_id"/><br><br>
 	&ensp;&ensp;转维用户：<select style="width: 200px" id="to_user_id"></select>
    <p class="btn_area">
        <input name="" id="saveUserToUserBtn" type="button" value="保 存" class="btn_2" />
        <input name="" id="calUserToUserBtn" type="button" value="取 消" class="btn_2" />
    </p>
</div>

</body>
</html>