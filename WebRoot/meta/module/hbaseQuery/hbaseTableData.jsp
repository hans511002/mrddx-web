<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>HBase表信息管理</title>

    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />
    <%@ include file="../../public/header.jsp" %>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/HBTableAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/HBaseDataSourceAction.js"></script>
    <script type="text/javascript" src="hbaseTableData.js"></script>
    <script type="text/javascript">
        var tableid=<%=request.getParameter("tableid")%>;
    </script>
</head>
<body style="height: 100%;width: 100%">
<div id=queryFormDiv style="height:12%">
    <table style="height: 100%">
        <tr>
            <td width="10%" style="text-align:right;">表名:</td>
            <td width="15%"><%=request.getParameter("tablename")%><input type="hidden" id="tableName" /></td>
            <td width="10%" style="text-align:left;">&nbsp;&nbsp;<input type="button" id="addBtn" class="btn_2" value="新增" /></td>
            <td width="10%" style="text-align:left;">&nbsp;&nbsp;<input type="button" id="editBtn" class="btn_2" value="修改" /></td>
            <td width="10%" style="text-align:left;">&nbsp;&nbsp;<input type="button" id="delBtn" class="btn_2" value="删除" /></td>
            <td width="10%" style="text-align:left;"></td>
            <td width="55%">&nbsp;&nbsp;<input type="button" id="upBtn" class="btn_2" value="上一页" />
            &nbsp;&nbsp;<input type="button" id="downBtn" class="btn_2" value="下一页" />
            &nbsp;&nbsp;当前第<font id="pageNo" color="blue">1</font> 页</td>
        </tr>
    </table>
</div>
<div id="container" style="height: 88%;width: 100%"></div>

<div id="tableManagerContentTop" style="display: none;overflow: scroll;height: 375px">
    <div  id="tableManagerContentTop1" style="display: none;">
       <div>
           <table class="table">
               <tr>
                   <td class="t_td"><span class="Required">*</span>ROWKEY:&nbsp;</td>
                   <td class="content_td" > <input type="text" style="width: 90%;" class="input" id="rowkey" /></td>
				</tr>
           </table>
          </div>
    <table id="paraTableManagerInfoTable" cellpadding="0" cellspacing="0" class="table_list">
        <tr>
            <td class="nav_td_trl">分类名称</td>
            <td class="nav_td_trl">列名称</td>
            <td class="nav_td_trl">列英文别名</td>
            <td class="nav_td_trl">值</td>
        </tr>
        
    </table>
     </div>
     
    <div id="tableManagerContentDown" style="display: none;">
       <div id="tableManagerContentDown1" style="display: none;">
        <p class="btn_area" style="text-align: center">
            <input type="button" value="新增" class="btn_2" id="saveBtn"/>
            <input type="button" value="关闭" class="btn_2" id="calBtn"/>
        </p>
        </div>
    </div>
</div>

</body>
</html>