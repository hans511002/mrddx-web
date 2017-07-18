<%--
  Created by IntelliJ IDEA.
  User: 春生
  Date: 13-11-12
  Time: 下午3:33
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Hbase表维护</title>
    <%@ include file="../../public/header.jsp" %>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/HBTableAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/HBaseDataSourceAction.js"></script>
    <script type="text/javascript">
        var tblMode = 0;
        var tblId = 0;
        <%
        String tblMode = request.getParameter("tblMode");
        String tblId = request.getParameter("tblId");
        if(tblMode!=null && !"".equals(tblMode)){
        out.println("tblMode="+tblMode+";");
        }
        if(tblId!=null && !"".equals(tblId)){
        out.println("tblId="+tblId+";");
        }
        %>
    </script>
    <script type="text/javascript" src="hbaseTableSave.js"></script>
    <style type="text/css">
    table.colFormTable{
        background-color:#A4BED4;
        overflow: hidden;
    }
    table.colFormTable tr{
        height:24px;
    }
    table.colFormTable th{
        text-align: center;
        background-color:#E9F5FE;
        position:relative;
        vertical-align:middle;
        text-overflow:ellipsis;
        white-space:nowrap;
        font-size:12px;
        height:100%;
        min-height:26px;
        line-height: 26px;
    }
    table.colFormTable td{
        position:relative;
        text-align: left;
        padding:1px;
        background-color:#FFFFFF;
        /*display:block;*/
        /*text-overflow:ellipsis;*/
        vertical-align:middle;
        white-space:nowrap;
        font-size:12px;
        height:100%;
        min-height:26px;
        line-height: 26px;
    }

    table.colFormTable span.bm,span.fbm,span.ms,span.cf{
        position:relative;
        vertical-align:middle;
    }
    span.bm input[type="text"]{
        width:150px;
        vertical-align:middle;
    }
    span.fm input[type="text"]{
        width:99%;
        vertical-align:middle;
    }
    span.fbm input[type="text"]{
        width:150px;
        vertical-align:middle;
    }
    span.ms input[type="text"]{
        width:99%;
        vertical-align:middle;
    }
    span.cf input[type="text"]{
        width:60px;
        vertical-align:middle;
    }
    table.h td span.newt{
        visibility:hidden;
    }
    table.h td span.delt{
        visibility:hidden;
    }

    table.colFormTable td span.newt{
        position:absolute;
        top:0;right:-35px;
        display:none;
        width:16px;
        height:16px;
        background:url(../../resource/images/toolbar/folder_add.gif) no-repeat;
        cursor:pointer;
    }
    table.colFormTable td span.delt{
        position:absolute;
        top:0;right:-16px;
        display:none;
        width:16px;
        height:16px;
        background:url(../../resource/images/cancel.png) no-repeat;
        cursor:pointer;
    }
    table.colFormTable td:hover span.newt{
        display:inline-block;
    }
    table.colFormTable td:hover span.delt{
        display:inline-block;
    }


    table.colFormTable td span.newf{
        position:absolute;
        top:0;right:-35px;
        display:none;
        width:16px;
        height:16px;
        background:url(../../resource/images/edit_add.png) no-repeat;
        cursor:pointer;
    }
    table.colFormTable td span.delf{
        position:absolute;
        top:0;right:-16px;
        display:none;
        width:16px;
        height:16px;
        background:url(../../resource/images/cancel.png) no-repeat;
        cursor:pointer;
    }
    table.colFormTable td:hover span.newf{
        display:inline-block;
    }
    table.colFormTable td:hover span.delf{
        display:inline-block;
    }

    table.colFormTable td span.h{
        position:absolute;
        top:0;right:-17px;
        display:none;
        width:16px;
        height:16px;
        background:url(../../../js/editor/themes/default/default.png) no-repeat 0 -1104px;
        cursor:pointer;
    }
    table.colFormTable td:hover span.h{
        display:inline-block;
    }

    table.colFormTable td span.c{
        position:absolute;
        top:0;right:-34px;
        display:none;
        width:16px;
        height:16px;
        background:url(../../../js/editor/themes/default/default.png) no-repeat 0 -1120px;
        cursor:pointer;
    }
    table.colFormTable td:hover span.c{
        display:inline-block;
    }

    table.colFormTable td span.up{
        position:absolute;
        top:0;right:-51px;
        display:none;
        width:16px;
        height:16px;
        background:url(../../resource/images/move_up.png) no-repeat;
        cursor:pointer;
    }
    table.colFormTable td:hover span.up{
        display:inline-block;
    }

    table.colFormTable td span.down{
        position:absolute;
        top:0;right:-68px;
        display:none;
        width:16px;
        height:16px;
        background:url(../../resource/images/move_down.png) no-repeat;
        cursor:pointer;
    }
    table.colFormTable td:hover span.down{
        display:inline-block;
    }
    table.colFormTable td input.ihd{
        visibility:hidden;
    }
    table.colFormTable td.hd span.h{
        visibility:hidden;
    }
    table.colFormTable td.hd span.c{
        visibility:hidden;
    }
    table.colFormTable td.hd span.up{
        visibility:hidden;
    }
    table.colFormTable td.hd span.down{
        visibility:hidden;
    }

    input::-webkit-input-placeholder {
        color: #999;
        -webkit-transition: color.5s;
    }
    input:focus::-webkit-input-placeholder, input:hover::-webkit-input-placeholder {
        color: #c2c2c2;
        -webkit-transition: color.5s;
    }
    </style>
</head>
<body style="width:100%;height:100%;">
<div id='createHbTblDIV' style="position:absolute;top:0;left:0;right: 0;bottom:0;">
    <table border="0" cellpadding="0" cellspacing="1" class="MetaFormTable">
        <tr>
            <th style="width:120px;">数据源:<span style="color:red">*</span></th>
            <td><input type="text" id="hbDs" style="width:99%;min-width:140px;" readonly="readonly"></td>
            <th style="width:120px;">HBase表名:<span style="color:red">*</span></th>
            <td><input type="text" id="hbTblName" style="width:99%;min-width:140px;"></td>
            <th style="width:120px;">块大小(KB):&nbsp;</th>
            <td><input type="text" id="blockSize" title="默认64KB" style="width:99%;min-width:140px;"></td>
            <th style="width:120px;">压缩类型:&nbsp;</th>
            <td>
                <select style="width:99%;min-width:140px;" id="colZipType">
                    <option value="0">不压缩</option>
                    <option value="1">lzo</option>
                    <option value="2">gz</option>
                    <option value="3">snappy</option>
                </select>
            </td>
        </tr>
        <tr>
            <th>列最大版本号:&nbsp;</th>
            <td><input type="text" id="colMaxVersion" style="width:99%;min-width:140px;"></td>
            <th>Bloomtype:&nbsp;</th>
            <td style="line-height:0;">
                <select style="width:99%;min-width:140px;" id="bloomtype">
                    <option value="ROW">行(ROW)</option>
                    <option value="ROWCOL">行列(ROWCOL)</option>
                    <option value="NONE">无(NONE)</option>
                </select>
            </td>
            <th>Hfile的最大值(MB):&nbsp;</th>
            <td><input type="text" id="hfileMaxVal" title="默认256M" style="width:99%;min-width:140px;"></td>
            <th>过期时间(秒):&nbsp;</th>
            <td style="line-height:0;">
                <input id="hbTblTTL" type="text" title="默认-1，系统最大过期时间2147483647秒" style="width:99%;min-width:140px;"></textarea>
            </td>
        </tr>
        <tr>
            <th>列最小版本号:&nbsp;</th>
            <td><input type="text" id="colMinVersion" style="width:99%;min-width:140px;"></td>
            <th>新数据缓存:&nbsp;</th>
            <td>
                <input type="radio" name="newDataFlush" id='newDataFlush0' checked="checked" value="0"><label for="newDataFlush0">不缓存</label>&nbsp;
                <input type="radio" name="newDataFlush" id='newDataFlush1' value="1"><label for="newDataFlush1">缓存</label>
            </td>
            <th>缓存刷新大小(MB):&nbsp;</th>
            <td style="line-height:0;">
                <input type="text" id="memstoreFlush" title="默认64M" style="width:99%;min-width:140px;">
            </td>
            <th>描述:&nbsp;</th>
            <td style="line-height:0;">
                <input id="hbTblDesc" type="text" style="width:99%;min-width:140px;""></input>
            </td>
        </tr>
    </table>
    <fieldset style="position:absolute;left:0;right:0;top:105px;bottom:30px;padding:0;">
        <legend>&nbsp;字段信息&nbsp;<a id='shortCutBtn' href="javascript:showShortCutInpu();">Excel复制录入</a>
            <span id='tip' style="font-size:12px;color:#5f9ea0;"></span></legend>
        <div style="position:absolute;left:0;right:0;top:12px;bottom:1px;overflow-y:auto;overflow-x:auto;" id="filedInfoDIV">
            <table border="0" class="colFormTable" id="colFormTable" style="width:98%;" cellpadding="0" cellspacing="1">
                <tbody id='filedInfoTable'><tr style="position:relative;z-index:10;">
                    <th style="width:5%;" id='snTd' title="列簇">序号</th>
                    <th style="width:15%;min-width:185px;">分类别名<span style="color:red">*</span></th>
                    <th style="width:20%;">分类描述</th>
                    <th style="width:15%;min-width:185px;">字段别名<span style="color:red">*</span></th>
                    <th style="width:20%;">字段中文名<span style="color:red">*</span></th>
                    <th style="width:10%;" title="Hbase存储字段名">HB字段名*</th>
                    <th style="width:15%;min-width:172px;" title="同分类下相同HB字段名，将按拆分符合并入库">合并字段-拆分符*</th>
                </tr>
                <%--<tr id='tr_idd_1' idd=1>--%>
                <%--<td rowspan="1" style="text-align:center;">1</td>--%>
                <%--<td rowspan="1"><span class="bm"><input type="text"><span class="delt" title="删除分类" onclick='clikOpt(1)'></span><span title="在此分类下添加新分类" class="newt" onclick='clikOpt(1)'></span></span></td>--%>
                <%--<td rowspan="1"><span class="ms"><input type="text"></span></td>--%>
                <%--<td><span class="bm"><input type="text"><span class="delf" title="删除字段" onclick='clikOpt(2)'></span><span title="在此字段下添加新字段" class="newf" onclick='clikOpt(2)'></span></span></td>--%>
                <%--<td><span class="ms"><input type="text"></span></td>--%>
                <%--<td><span class="cf"><input type="text"></span></td>--%>
                <%--</tr>--%>
                </tbody>
            </table>
        </div>
    </fieldset>
    <div style="position:absolute;left:0;right:0;bottom:0;height:30px;text-align:center;">
        <input type="button" value="保存" id='saveTblBtn' class="btn_2" style="margin-top:5px;">&nbsp;&nbsp;
        <input type="button" value="重置" id='resetTblBtn' class="btn_2" style="margin-top:5px;">&nbsp;&nbsp;
        <input type="button" value="关闭" id='cloTblBtn' class="btn_2" style="margin-top:5px;">
    </div>
</div>
</body>
</html>