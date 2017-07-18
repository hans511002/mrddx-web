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
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=OPERATING_SYSTEM,SERVER_TYPE,CPU_FRAMEWORK"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/JobAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAuthorAction.js"></script>
	<script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserTypeAction.js"></script>
    <script type="text/javascript" src="jobManager.js"></script>
    
</head>

<body style='width:100%;height:100%;'>
<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: auto;">
    <div  id="queryFormDIV" class="C_query" >
        <ul>
            <li>关键字：<input type="text" value="" class="input" id="jobName" /></li>
            <li>
            <input type="button" value="查 询" class="btn_2" id="queryBtn" /> 
            <input type="button" style="visibility: hidden;" value="新 增" class="btn_2" id="newBtn" />
            </li>
        </ul>
    </div>
    <br class="clear" />
    <div id="toolbarObj"></div>
    <div style="min-height:200px;min-width:800px;border-top:1px solid #D0E5FF;left:0px;bottom: 0px;right: 0px;" id="dataDiv">
    </div>
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