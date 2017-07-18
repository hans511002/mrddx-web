<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王晶
 * @description 
 * @date 2012-7-23
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title></title>
    <%@include file="../../public/header.jsp" %>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MetaShareJarAction.js"></script>
    <script type="text/javascript">
        var demandId = null;
        var MenuLoaclInfo = {
            JAR_NAME:"文件名",
            USER_NAME:"上传者"
        };
        toLocal(MenuLoaclInfo);
    </script>
    <script type="text/javascript" src="metasharejar.js"></script>
    <style type="text/css">
        html{
            width:100%;
            height:100%;
        }
        *{ margin:0; padding:0; font-size:12px;}
    .tb{ border:1px solid #d0e4fd; border-bottom:none; margin:0 auto; width:300px;}
	.rb_td{ border-bottom:1px solid #d0e4fd;border-right:1px solid #d0e4fd; background:#e7f5fe; text-align:right; padding-right:0; height:25px; width:25% ;line-height:25px;}
	.b_td{ border-bottom:1px solid #d0e4fd;text-align:left; padding-left:5px; height:25px; line-height:25px;}
    </style>
</head>
<body style='width:100%;height:100%;'>
<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: auto;">
    <div style="padding:5px;" id="queryFormDIV">
        <%--查询条件表单模板--%>
        <table class="MetaTermTable" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td width="10%" style="text-align:right;"><%=I18nManager.getItemText(menuId,"JAR_NAME","文件名")%>:</td>
                <td width="20%"><div id="jarName"></div></td>
                <td width="10%" style="text-align:right;"><%=I18nManager.getItemText(menuId,"USER_NAME","上传者")%>:</td>
                <td width="10%"><div id="userName"></div>
                </td>
                <td>
                    <input name="" id="queryBtn" type="button" value="<%=I18nManager.getItemText(menuId,"QUERY_BTN","查 询")%>" class="btn_2" style="margin-left: 20px;"/>
                    <input name="" id="addBtn" type="button" value="<%=I18nManager.getItemText(menuId,"ADD_BTN","新增")%>" class="btn_2" style="margin-left: 20px;"/>
                </td>
            </tr>
        </table>
    </div>
    <div style="min-height:200px;min-width:800px;border-top:1px solid #D0E5FF;left:0px;bottom: 0px;right: 0px;" id="dataDiv">
    </div>
</div>
  <div id ="showJarInfo" cellpadding="0" cellspacing="0" style=" width:582px;height:253px;display:none;overflow-y:auto;">
    <table id='showJarInfo' cellpadding="0" cellspacing="0" style="width:100%;" class='tb'>
      <tr >
         <td class="rb_td">文件名：</td>
         <td class="b_td"><div id='_fileName'></div></td>
       </tr>
       <tr>
         <td class="rb_td">创建人：</td>
         <td class="b_td"><div id='_creater'></div></td>
       </tr>
       <tr>
         <td class="rb_td">创建时间：</td>
         <td class="b_td"><div id='_creTime'></div></td>
       </tr>
       <tr>
         <td class="rb_td">备注：</td>
         <td class="b_td"><div id='_mark'></div></td>
       </tr>
    </table>
 </div>
</body>
</html>