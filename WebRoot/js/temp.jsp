<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王春生
 * @description 
 * @date 12-5-21
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title></title>
    <%@include file="../meta/public/header.jsp"%>
</head>
<body style='width:100%;height:100%;'>
    <%--查询页面布局模板--%>
    <div>
        <div style="width:100%;height: 100%;position:relative;margin:2px;">
            条件表单表格
            <%--查询条件表单模板--%>
            <table class="MetaTermTable" border="0" cellpadding="0" cellspacing="0">
                <colgroup>
                    <col width="15%"><col width="35%">
                    <col width="15%"><col width="35%">
                </colgroup>
                <tr>
                    <th>字段一</th>
                    <td><input type="text" name="aaa" value=""></td>
                    <th>字段二</th>
                    <td><select name="bbb"><option></option></select></td>
                </tr>
                <tr>
                    <th>字段一</th>
                    <td><input type="text" name="aaa" value=""></td>
                    <th>字段二</th>
                    <td><select name="bbb"><option></option></select></td>
                </tr>
                <tr>
                    <td colspan="4">
                        <input type="button" value="查询">
                        <input type="button" value="重置">
                    </td>
                </tr>
            </table>
        </div>

        <div style="width:100%;height: 100%;position:relative;margin:2px;">
            数据表单表格
            <%--新增维护表单模板--%>
            <table class="MetaFormTable" border="0" cellpadding="0" cellspacing="1">
                <colgroup>
                    <col width="15%"><col width="35%">
                    <col width="15%"><col width="35%">
                </colgroup>
                <tr>
                    <th>字段一</th>
                    <td><input type="text" name="aaa" value=""></td>
                    <th>字段二</th>
                    <td><select name="bbb"><option></option></select></td>
                </tr>
                <tr>
                    <th>字段二</th>
                    <td><select name="ccc"><option></option></select></td>
                    <th>字段二</th>
                    <td><select name="bbb"><option></option></select></td>
                </tr>
                <tr>
                    <td colspan="4">
                        <input type="button" value="保存">
                        <input type="button" value="取消">
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>