<%--
 * Copyrights @ 2014,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王鹏坤
 * @description 
 * @date 2014-01-7
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title>[日志]<%=new String(request.getParameter("COL_NAME").getBytes("iso-8859-1"),"UTF-8") %></title>
    <%@include file="../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/AnalysisAction.js"></script>

    <script type="text/javascript" src="showColLog.js"></script>
	<script type="text/javascript">
		var logId =<%=request.getParameter("colId")%>;
	</script>      
</head>

<body style='width:100%;height:100%;'>
	<div  style="height: 100%;width: 100%" id="dataDiv"></div>
    </div>
    <div style="overflow-y:auto;display:none;" id="logFormDIV">
    <form action="#" id="logForm">
        <table class="LogFormTable" border="0" cellpadding="0" cellspacing="1">
            <tr>
                <td style="text-align: right;" class="t_td">日志详情ID:</td>
                <td class="content_td"><div type="text"  id="logId" class="input"  value=""  ></div>
                    </td>
            </tr>
            <tr>
                <td style="text-align: right;" class="t_td">日志详情信息:</td>
                <td class="content_td"><textarea type="text" id="logMsg" value="" class="input" readonly="readonly"  style="width:250%;height: 140px" ></textarea>
            </tr>
        </table>
    </form>
    <p class="btn_area">
        <input type="button" value="关闭" class="btn1" id="calBtn"/>
    </p>
</div>
</body>
</html>