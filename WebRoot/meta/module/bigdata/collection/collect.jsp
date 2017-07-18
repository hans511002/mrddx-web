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
    <link type="text/css" rel="stylesheet" href="../css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="../css/base.css" />
    <link type="text/css" rel="stylesheet" href="../css/tb_style.css" />

    <%@include file="../../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=OPERATING_SYSTEM,SERVER_TYPE,CPU_FRAMEWORK"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/CollectionAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAuthorAction.js"></script>
	<script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserTypeAction.js"></script>
    <script type="text/javascript" src="collect.js"></script>
</head>

<body style='width:100%;height:100%;'>

<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: hidden;">
    <div id="queryFormDIV" class="C_query" style="height: 20px">
        <table border="0" cellpadding="0" cellspacing="0">
            <tr>
            	<td>采集方向：</td>
                <td>
                	 <select style="width: 150px" id="COL_ORIGIN">
						<option value="">全部</option>
						<option value="1">上传</option>
						<option value="0">下载</option>
					</select>
                </td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>文件类型：</td>
                <td>
                	<select style="width: 150px" id="COL_DATATYPE">
					<option value="">全部</option>
					<option value="0">文本文件</option>
					<option value="1">其他文件</option>
					</select>
                </td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>采集名称:</td>
                <td><input type="text" style="width: 150px"  class="input" id="collectJobName"/></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>                
                <td><input type="button" value="查 询" class="btn_2" id="queryBtn" /></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td><input type="button" style="visibility: hidden;" value="新 增下载" class="btn_4" id="newBtnDown" /></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td><input type="button" style="visibility: hidden;" value="新 增上传" class="btn_4" id="newBtnUp" /></td>
            </tr>
        </table>        
    </div>
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