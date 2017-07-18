<%--
 * Copyrights @ 2012,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author  陈颖
 * @description  WS共享服务访问日志jsp
 * @date 2012-10-29
--%>



<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" >
<html>
  <head>
  <%@include file="../../../public/header.jsp" %>
  <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
  <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MetaShareWsAction.js"></script>
  <script type="text/javascript" src="sharelog.js"></script>
  <style>
  	td.ddd{
  		height:8px;
  	}
  </style>
  </head>
  
  <body style="height:100%;width:100%">
  <div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: auto;">
    <div id="queryFormDIV" style="padding:5px;">
    	<table class="MetaTermTable" border="0" cellpadding="0" cellspacing="0">
    		<tr>
    			<td style="padding-left: 5px;">&nbsp;开始日期:</td><td><input type="text" style="width:130px;" id="startdate" readonly="readonly"/></td>
    			<td style="margin-left: 2px;"><font size=2 >&nbsp;结束日期:</font></td><td><input style="width:130px;" type="text" id="enddate" readonly="readonly"/></td>
    			<td>关键字:</td><td><input type="text" id="keyword"  style="width:130px;"/></td>
    			<td>执行结果:</font></td><td><div id="result"></div></td>
    			<td style="padding-left: 20px;"><input type="button" id="queryBtn" value="查  询" class="btn_2"/></td>
    			<td style="padding-left: 20px;"><input type="button" id="reset" value="清空日期" class="btn_4"/></td>
    		</tr>
    	</table>
    </div>
    
    <!-- 数据表格DIV -->
    <div id="dataDiv" style="min-height:200px;min-width:800px;border-top:1px solid #D0E5FF;left:0px;bottom: 0px;right: 0px;" id="dataDiv"></div>
    
    </div>
    <!-- 详细信息查看表单DIV -->
    <div style="display:none;padding:1px;overflow-y:auto;"  >
        <table id="viewWindowDiv" class="MetaFormTable" style="display:block;width:550px;"  border="0" cellpadding="0" cellspacing="1">
        <tr>
        	<td style=""><div style="height:235px;width:530px;overflow: auto;"><span id="show_msg"></span></div></td>
        </tr>
        <tr>
            <td style="text-align:center;padding-top: 10px;padding-bottom: 10px;">
                <input id="closeBtn" class="btn_2"  value ="关 闭" type="button"/>
            </td>
        </tr>
    </table>
    </div>
    <div style="position:relative;display:none;margin:1px;overflow-y:auto;display: none;" id="viewUserDiv">
    <table class="MetaFormTable" style="display:block;" border="0" cellpadding="0" cellspacing="1">
        <colgroup>
            <col width="15%"><col width="35%">
            <col width="15%"><col width="35%">
        </colgroup>
        <tr>
            <th>用户名:</th>
            <td><span id="username"></span></td>
            <th>密&nbsp;&nbsp;码:</th>
            <td><span id="password"></span></td>
        </tr>
        <tr>
            <th>创建人:</th>
            <td><span id="usercreator"></span></td>
            <th>创建时间:</th>
            <td><span id="usertime"></span></td>
        </tr>
        <tr>
        	<th>备注:</th>
        	<td colspan=3><div style="height:120px;width:400px;overflow: auto;font-size: 2"><span id="userremark"></span></div></td>
        </tr>
        <tr>
            <td colspan="4" style="text-align:center;padding-top: 10px;padding-bottom: 10px;">
                <input id="userBtn" class="btn_2"  value ="关 闭" type="button"/>
            </td>
        </tr>
    </table>
    </div>
    
     <div style="position:relative;display:none;margin:1px;overflow-y:auto;display: none;" id="viewRuleDiv">
    <table class="MetaFormTable" style="display:block;" border="0" cellpadding="0" cellspacing="1">
        <colgroup>
            <col width="15%"><col width="35%">
            <col width="15%"><col width="35%">
        </colgroup>
        <tr>
            <th>服务名:</th>
            <td><div class="ddd"><span id="rulename"></span></div></td>
            <th>规则编码:</th>
            <td><div class="ddd"><span id="rulecode"></span></div></td>
        </tr>
        <tr>
            <th>创建人:</th>
            <td><div class="ddd"><span id="rulecreator"></span></div></td>
            <th>创建时间:</th>
            <td><div class="ddd"><span id="ruletime"></span></div></td>
        </tr>
        <tr>
        	<th>操作类型:</th>
        	<td><div class="ddd"><span id="ruletype"></span></div></td>
        	<th>实现类型:</th>
        	<td><div class="ddd"><span id="ruleimpltype"></span></div></td>
        </tr>
        <tr>
        	<th>状态:</th>
        	<td  colspan="3"><div class="ddd"><span id="rulestate"></span></div></td>
        </tr>
        <tr>
        	<th><font size=2>备注:</font></th>
        	<td colspan="3" style=""><div style="height:120px;width:400px;overflow: auto;font-size: 2"><span id="ruleremark"></span></div></td>
        </tr>
        <tr>
            <td colspan="4" style="text-align:center;padding-bottom: 12px;padding-top: 10px;">
                <input id="ruleBtn" class="btn_2"  value ="关 闭" type="button"/>
            </td>
        </tr>
    </table>
    </div>
  </body>
</html>
