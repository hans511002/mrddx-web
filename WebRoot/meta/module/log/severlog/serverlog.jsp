<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王晶
 * @description 
 * @date 2012-7-24
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="com.ery.meta.module.log.serverlog.ServerLogService"%>
<html>
<head>
    <title></title>
    <%@include file="../../../public/header.jsp" %>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/ServerLogAction.js"></script>
    <style type="text/css">
       
    </style>
</head>
<body style="background: #ffffff;">
<div id="main" style='overflow-y:auto'  class="gridbox gridbox_dhx_skyblue">
    <div id="typehead" style="height:11%;width:100%;" class="xhdr">
        <table cellpadding="0" cellspacing="0" style="width:98.4%;" class="hdr">
  
            <tr style="height: 0px; ">
                <th style="height: 0px; width: 40% "></th>
                <th style="height: 0px; width: 20%;"></th>
                <th style="height: 0px; width: 20% "></th>
                <th style="height: 0px; width: 20% "></th>
            </tr>
            <tr>
                <td style="text-align:center">文件名称</td>
                <td style="text-align:center">文件最后修改时间</td>
                <td style="text-align:center">文件大小</td>
                <td style="text-align:center">操作</td>
            </tr>
          
        </table>
    </div>
    <!--end head  -->
    <div id="typebody" style="width: 100%;overflow-y:scroll;" class="objbox">
        <table id='dimtypetable' cellpadding="0" cellspacing="0" style="width: 100%;" class="obj">
            <tbody>
            <tr style="height: 0px;">
                <th style="height: 0px; width: 40% "></th>
                <th style="height: 0px; width: 20%"></th>
                <th style="height: 0px; width: 20% "></th>
                <th style="height: 0px; width: 20% "></th>
            </tr>
            <%
                String[] infoArr =null;
                List<String> dataList = new ServerLogService().readLogFileList();
                if (dataList != null && dataList.size() != 0) {
                    for (int i = 0; i<dataList.size(); i++) {
                        String fileInfo = dataList.get(i); %>
                       <tr>
                        <%if (fileInfo != null) {
                          infoArr = fileInfo.split(",");
                          for(int j=0;j<infoArr.length-1;j++){
                         %>
                <td><%=infoArr[j]%>
                </td>
                <% }%>
                <td><div><a href="#" onclick="showLog('<%=infoArr[0]%>',1)">查看</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="logInfo.jsp?fileName=<%=infoArr[0]%>&flag=2">下载</a></div></td>
            </tr>
            <%
                        }
                    }
                }
            %>
            </tbody>
        </table>
    </div>
    <!--end body  -->
</div>
<!--end typeDiv  -->
</div>
  <div id = 'messageInfo' style='width:600px;hight:600px;'></div>
  <script type="text/javascript">
       var dd = document.getElementById("typebody");
       dd.style.height = document.body.offsetHeight-30 + "px";
       var popWin = null;
       function showLog(fileName,flag){
        window.open(urlEncode(getBasePath()+"/meta/module/log/severlog/logInfo.jsp?fileName="+fileName+"&flag="+flag));
       }
  </script>
</body>
</html>