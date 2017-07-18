<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<%@ include file="../../../public/head.jsp" %>
<% 
String path = request.getContextPath();
%>
<html>
  <head>
    <title></title>
	<script type="text/javascript" src="<%=rootPath%>/dwr/interface/MaintainAction.js"></script>
	<script type="text/javascript" src="<%=path %>/portal/resource/js/OPString.js"></script>
	<script type="text/javascript" src="maintain.js"></script>
	<script type="text/javascript">
		var maintainId=<%=request.getParameter("maintainId")%>;			//维护表id
	</script>
	
	<style type="text/css">
    	#viewDataTable{
			margin-right: auto;
			margin-left: auto;
			border-left: #99b2c9 solid 1px;
			text-align: center;
			font-size: 12px;
			margin-top: 2px;
			border-bottom: #99b2c9 solid 1px;
		}
		#viewDataTable tr td{
			border-top: #99b2c9 solid 1px; 
			border-right: #99b2c9 solid 1px; 
			text-align: left; 
			padding-left: 5px; 
			line-height: 24px; 
			height:24px;
			background-color: #ffffff; 
		}
		#viewDataTable tr th{ 
			white-space: nowrap; 
			text-align: right; 
			font-weight: normal; 
			background-color: #f6f9fa; 
			border-top: #99b2c9 solid 1px; 
			border-right: #99b2c9 solid 1px;  
			line-height: 24px; 
			height:24px;
			padding: 0px; 
			margin: 0px;
		}
	</style>
 </head>
 <body>
 <form id="_fromData" action="">
 <div id="_addOrUpdateData" style="height: 100%;overflow-x:hidden;overflow-y:auto;"></div>
 </form>
   <div id="_viewData" style="height: 100%;overflow-x:hidden;overflow-y:auto;"></div>
 </body>
</html>