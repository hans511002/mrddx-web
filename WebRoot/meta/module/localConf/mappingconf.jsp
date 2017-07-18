<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>实时入库文件格式配置</title>
    <%@ include file="../../public/header.jsp" %>
    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/tag.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MappingConfAction.js"></script>
    <script type="text/javascript" src="mappingconf.js"></script>
</head>
<body style="height: 100%;width: 100%">
<div id=queryFormDiv style="height:9%;background-color: white">
    <table style="height: 100%">
        <tr>
            <td>&nbsp;&nbsp;&nbsp;&nbsp;HBASE字段名:</td>
            <td><input id="hbColNameQ"/></td>
            <td>&nbsp;&nbsp;<input type="button" id="queryBtn" class="btn_2" value="查询" /></td>
            <td><input type="button" id="newBtn" class="btn_2" value="新增" /></td>
        </tr>
    </table>
</div>
<div id="container" style="height: 91%;width: 100%"></div>
<div style="overflow-y:auto;display:none;" id="dataFormDIV">
    <form action="" id="dataForm"  method="post">
        <table cellpadding="0" cellspacing="0" class="table">
            <tr>
                <td class="t_td">HBASE字段名:</td>
                <td class="content_td"><input type="text" name="hbColName"  id="hbColName"  value="" rows="4" style="width:60%;" />
                    <input type="hidden" id="ruleId" name="ruleId" value=""/></td>
            </tr>
            <tr>
                <td class="t_td">入库规则:</td>
                <td class="content_td"><input type="text" name="impRule" id="impRule" value="" rows="4" style="width:60%;" />
            </tr>
            <tr>
                <td class="t_td">字段类型:</td>
                <td class="content_td"><select type="text" id="colType" name="colType" value="" style="width:20%">
                    <option value="1" selected="selected">单列</option>
                    <option value="2">合并列</option>
                    <option value="3">常量列</option>
                </select></td>
            </tr>
            <tr>
                <td class="t_td">原始字段名:</td>
                <td class="content_td"><input type="text" name="orgColName" id="orgColName" value="" rows="4" style="width:60%;" />
                </td>
            </tr>
            <tr>
                <td class="t_td">HBASE列族名:</td>
                <td class="content_td"><input type="text" id="hbCfName" name="hbCfName" value="" rows="4" style="width:60%;"/>
            </tr>
            <tr>
                <td class="t_td">列值前缀:</td>
                <td class="content_td"><input type="text" id="colValPrefix" name="colValPrefix" value="" rows="4" style="width:60%;"/>
            </tr>
            <tr>
                <td   class="t_td">列值后缀:</td>
                <td class="content_td" ><input type="text" id="colValSuffix" name="colValSuffix" value="" rows="4" style="width:60%;"/>
            </tr>
        </table>
    </form>
    <p class="btn_area">
        <input name="" id="saveBtn" type="button" value="保 存" class="btn_2" />
        <input name="" id="calBtn" type="button" value="取 消" class="btn_2" />
    </p>
 </div>
</body>
</html>