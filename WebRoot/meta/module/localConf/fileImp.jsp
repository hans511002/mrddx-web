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
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/FileImpAction.js"></script>
    <script type="text/javascript" src="fileImp.js"></script>
</head>
<body style="height: 100%;width: 100%">
<div id=queryFormDiv style="height:9%;background-color: white">
    <table style="height: 100%;">
        <tr>
            <td>&nbsp;&nbsp;&nbsp;&nbsp;文件类型:</td>
            <td><input id="file_typeQ"/></td>
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
                <td class="t_td">文件类型:</td>
                <td class="content_td"><input type="text" name="fileType"  id="fileType"  value="" rows="4" style="width:60%;" />
                    <input type="hidden" id="filetypeImpRelId" name="filetypeImpRelId" value=""/></td>
            </tr>
            <tr>
                <td class="t_td">入库规则:</td>
                <td class="content_td"><input type="text" name="impRule" id="impRule" value="" rows="4" style="width:60%;" />
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