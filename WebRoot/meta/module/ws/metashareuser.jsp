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
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MetaShareUserAction.js"></script>
    <script type="text/javascript">
        var demandId = null;
        var MenuLoaclInfo = {
            USER_NAME:"用户名",
            STATE:"状态"
        };
        toLocal(MenuLoaclInfo);
    </script>
    <script type="text/javascript" src="metashareuser.js"></script>
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
                <td width="10%" style="text-align:right;"><%=I18nManager.getItemText(menuId,"STATE","状态")%>:</td>
                <td width="10%"><div>
                                   <select id ='userState'>
                                      <option value='-1'>全部</option>
                                      <option value='1'>有效</option>
                                      <option value='0'>禁用</option>
                                   </select>
                                </div>
                
                </td>
                <td width="10%" style="text-align:right;"><%=I18nManager.getItemText(menuId,"USER_NAME","用户名")%>:</td>
                <td width="20%"><div id="userName"></div></td>
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
 <div id ="userInfo" style=" width:582px;height:253px;display:none;overflow-y:auto;">
    <table id='userInfoTable' cellpadding="0" cellspacing="0"  style="width:100%;" class='tb'>
      <tr >
         <td class="rb_td">用户名：</td>
         <td class="b_td"><div>
           <input type="text" style="width:200px;height:15px;" id="userName1" name="userName1"/>
         </div></td>
       </tr>
       <tr>
         <td class="rb_td">密码：</td>
         <td class="b_td"><div>
          <input type="text" style="width:200px;height:15px;" id="pwd" name="pwd"/>
         </div></td>
       </tr>
       <tr id="_cuser">
        <td class="rb_td">创建人：</td>
        <td class="b_td"><div id="creater">
           
         </div></td>
       </tr>
       <tr id="_cuset">
         <td class="rb_td">创建时间：</td>
         <td class="b_td"><div id="creTime">
         </div></td>
       </tr>
       <tr>
         <td class="rb_td">备注：</td>
         <td class="b_td"><div>
           <textarea id="mark" rows="3" cols="20" style="width:200px"></textarea>
         </div></td>
       </tr>
    </table>
      <div id="btn" style="width: 100%;"></div>
 </div>
 <div id ="adduserInfo" style=" width:582px;height:253px;display:none;overflow-y:auto;">
    <table id='adduserInfoTable' cellpadding="0" cellspacing="0"  style="width:100%;" class='tb'>
      <tr >
         <td class="rb_td">用户名：</td>
         <td class="b_td"><div>
           <input type="text" style="width:200px;height:15px;" id="userName2" name="userName2"/>
         </div></td>
       </tr>
       <tr>
         <td class="rb_td">密码：</td>
         <td class="b_td"><div>
          <input type="text" style="width:200px;height:15px;" id="pwd2" name="pwd2"/>
         </div></td>
       </tr>
       <tr>
         <td class="rb_td">备注：</td>
         <td class="b_td"><div>
           <textarea id="mark2" rows="3" cols="20" style="width:200px"></textarea>
         </div></td>
       </tr>
    </table>
      <div id="btn2" style="width: 100%;"></div>
 </div>
  <div id ="showUserInfo"  style=" width:582px;height:253px;display:none;overflow-y:auto;">
    <table id='showUserInfo' cellpadding="0" cellspacing="0" style="width:100%;" class='tb'>
      <tr >
         <td class="rb_td">用户名：</td>
         <td class="b_td"><div id='_userName'></div></td>
       </tr>
       <tr>
         <td class="rb_td">密码：</td>
         <td class="b_td"><div id='_pwd'></div></td>
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