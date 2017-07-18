<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>入库文件与hbase表之间的映射关系配置</title>
    <%@ include file="../../public/header.jsp" %>
    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/tag.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/RollbackAction.js"></script>
    <script type="text/javascript" src="rollback.js"></script>
</head>
<body style="height: 100%;width: 100%">
<div id=queryFormDiv style="height:9%;background-color: white">
    <table style="height: 100%">
        <tr>
            <td>&nbsp;&nbsp;&nbsp;&nbsp;表名:</td>
            <td><input id="tableNameQ"/></td>
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
                <td class="t_td">Oracle表名:</td>
                <td class="content_td"><input type="text" name="tableName"  id="tableName"  value="" rows="4" style="width:60%;" />
                    <input type="hidden" id="rollbackId" name="rollbackId" value=""/></td>
            </tr>
            <tr>
                <td class="t_td">回退的rowkey组合信息:</td>
                <td class="content_td"><input type="text" name="rowkeyField" id="rowkeyField" value="" rows="4" style="width:60%;" />
            </tr>
            <tr>
                <td class="t_td">HBase表名:</td>
                <td class="content_td"><input type="text" name="hbaseTableName" id="hbaseTableName" value="" rows="4" style="width:60%;" />
            </tr>
            <tr>
                <td class="t_td">调账的rowkey组合信息:</td>
                <td class="content_td"><input type="text" name="rowkeyFieldAdjust" id="rowkeyFieldAdjust" value="" rows="4" style="width:60%;" />
            </tr>
             <tr>
                <td   class="t_td">是否区分本地网 :</td>
                <td class="content_td"><select type="text" id="isLatn" name="isLatn" value="" style="width:20%">
                    <option value="0" selected="selected">不区分</option>
                    <option value="1">区分</option>
                </select></td>
            </tr>
             <tr>
                <td   class="t_td">是否可用 :</td>
                <td class="content_td"><select type="text" id="isEnable" name="isEnable" value="" style="width:20%">
                    <option value="0" >否</option>
                    <option value="1" selected="selected">是</option>
                </select></td>
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