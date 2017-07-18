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
    <script type="text/javascript" src="hbaseTable.js"></script>
</head>
<body style="height: 100%;width: 100%">
<div id=queryFormDiv style="position:absolute;left:0;top:0;right:0;height:46px;text-align:left;vertical-align:middle;padding-top:8px;">
    <table class="MetaTermTable" border="0" cellpadding="0" cellspacing="1">
        <tr>
            <th style="width:120px;">关键字:</th>
            <td style="width:255px;"><input id="tableName" /></td>
            <td style="width:120px;text-align:left;"><input type="button" id="queryBtn" class="btn_2" value="查询" /></td>
            <td>
                <input type="button" id="newBtn" class="btn_2" value="创建表" />
                &nbsp;&nbsp;<input type="button" id="regBtn" class="btn_2" value="注册表" /></td>
        </tr>
    </table>
</div>
<div id="container" style="position:absolute;left:0;top:46px;right:0;bottom:0;"></div>
<div id="tableContentTop" style="display: none;overflow: scroll;height: 275px">
    <div class="info_area"><span class="title_blod">修改分类信息&nbsp;&nbsp;表名：</span> <label id="paraTable_TABLENAME" class="label_blod"></label></div>
    <table id="paraTable" cellpadding="0" cellspacing="0" class="table_list">
        <tr>
            <td class="nav_td_trl">序号</td>
            <td class="nav_td_trl">分类别名</td>
            <td class="nav_td_trl">分类说明</td>
            <td class="nav_td_trl" width="50px">操作</td>
        </tr>

    </table>
<div id="tableContentDown" style="display: none;">
    <p class="btn_area" style="text-align: center">
        <input type="text" id="saveBtn" class="btn_2" value="保存" />
        <input type="button" value="关闭" class="btn_2" id="calBtn"/>
    </p>
</div>
</div>
<div id="clusterContentTop" style="display: none;overflow: scroll;height: 275px">
    <div class="info_area"><span class="title_blod">查看表信息&nbsp;&nbsp;表名：</span> <label id="paraClusterTable_TABLENAME" class="label_blod"></label></div>
    <table id="paraClusterTable" cellpadding="0" cellspacing="0" class="table_list">
        <tr>
            <td class="nav_td_trl">序号</td>
            <td class="nav_td_trl">分类名称</td>
            <td class="nav_td_trl">分类别名</td>
            <td class="nav_td_trl">列名称</td>
            <td class="nav_td_trl">列英文别名</td>
            <td class="nav_td_trl" >列中文别名</td>
            <td class="nav_td_trl" >拆分标识</td>
        </tr>
    </table>
    <div id="clusterContentDown" style="display: none;">
        <p class="btn_area" style="text-align: center">
            <input type="button" value="关闭" class="btn_2" id="calBtn1"/>
        </p>
    </div>
</div>
<div id="clusterInfoContentTop" style="display: none;overflow: scroll;height: 275px">
    <div class="info_area"><span class="title_blod">修改表信息&nbsp;&nbsp;表名：</span> <label id="paraClusterInfoTable_TABLENAME" class="label_blod"></label></div>
    <table id="paraClusterInfoTable" cellpadding="0" cellspacing="0" class="table_list">
        <tr>
            <td class="nav_td_trl">序号</td>
            <td class="nav_td_trl">分类别名</td>
            <td class="nav_td_trl">列英文别名</td>
            <td class="nav_td_trl" >列中文别名</td>
            <td class="nav_td_trl" >拆分标识</td>
        </tr>
    </table>
    <div id="clusterInfoContentDown" style="display: none;">
        <p class="btn_area" style="text-align: center">
            <input type="button" value="保存" class="btn_2" id="saveBtn2"/>
            <input type="button" value="关闭" class="btn_2" id="calBtn2"/>
        </p>
    </div>
</div>
<div id="tableManagerContentTop" style="display: none;overflow: scroll;height: 375px">
    <div  id="tableManagerContentTop1" style="display: none;">
       <div>
           <table class="table">
               <tr>
                   <td class="t_td"><span class="Required">*</span>表名称:&nbsp;</td>
                        <td class="content_td" > <input type="text"  class="input" id="managerTableName" /></td>
                   <td class="t_td"><span class="Required">*</span>数据源名称：</td>
                   <td class="content_td">
                        <input type="text" value="" class="input" id="dataSourceName" readonly="readonly" rows="4" style="width:50%;" />
                        <input type="hidden" value="" class="input" id="dataSourceId"  />
                   </td>
                   <td class="t_td1">状态：</td>
                   <td class="content_td1">
                        <select id="state" rows="4" style="width:50%;" readonly="readonly" disabled="disabled" >
                            <option value='0'>有效</option>
                            <option value='1'>无效</option>
                        </select></td>
                   </td>
               </tr>
               <tr>
                   <td class="t_td">表描述:&nbsp;</td><td class="content_td" rowspan="5"> <input type="text"  class="input" id="managerTableMsg" style="width:80%"/></td>
               </tr>
           </table>
          </div>
    <div class="info_area"><span class="title_blod">创建列的分类信息</span></div>
    <table id="paraTableManagerInfoTable" cellpadding="0" cellspacing="0" class="table_list">
        <tr>
            <td class="nav_td_trl">序号</td>
            <td class="nav_td_trl">分类别名</td>
            <td class="nav_td_trl">分类说明</td>
            <td class="nav_td_trl" width="50px">操作</td>
        </tr>
    </table>
     </div>
     
      <div id="tableSelectDataSourceContentTop" style="display: none;">
        <div>
            <span style="margin-left: 10px;" >数据源ID:</span>
            <input type="text" id="searchSourceId" />
            <span style="margin-left: 10px;" >数据源名称:</span>
            <input type="text" id="searchSourceName" />

            <input type="button" value="搜索" class="btn1" id="searchDataSourceTable" />
        </div>
        <div style="height:255px;" id="tableSelectDataSourceContent"></div>
     </div>
    <div id="tableSelectDataSourceContentDown" style="display: none;">
        <p class="btn_area"><input type="button" value="确定" class="btn1" id="saveDataSourceBtn"/>
        </p>
    </div>
    
    <div id="regtableSelectDataSourceContentTop" style="display: none;">
        <div>
            <span style="margin-left: 10px;" >数据源ID:</span>
            <input type="text" id="regsearchSourceId" />
            <span style="margin-left: 10px;" >数据源名称:</span>
            <input type="text" id="regsearchSourceName" />

            <input type="button" value="搜索" class="btn1" id="regsearchDataSourceTable" />
        </div>
        <div style="height:255px;" id="regtableSelectDataSourceContent"></div>
     </div>
    <div id="regtableSelectDataSourceContentDown" style="display: none;">
        <p class="btn_area"><input type="button" value="确定" class="btn1" id="regsaveDataSourceBtn"/>
        </p>
    </div>   
    
    
    
    <div id="tableManagerContentTop2" style="display: none">
        <div class="info_area"><span class="title_blod">创建列信息</span></div>
        <table id="paraTableManagerInfoTable1" cellpadding="0" cellspacing="0" class="table_list">
            <tr>
                <td class="nav_td_trl">序号</td>
                <td class="nav_td_trl">分类别名</td>
                <td class="nav_td_trl">列英文别名</td>
                <td class="nav_td_trl" >列中文别名</td>
                <td class="nav_td_trl" >拆分标识</td>
                <td class="nav_td_trl" width="50px">操作</td>
            </tr>
        </table>
     </div>
     
    <div id="tableManagerContentDown" style="display: none;">
       <div id="tableManagerContentDown1" style="display: none;">
        <p class="btn_area" style="text-align: center">
            <input type="button" value="下一步" class="btn_2" id="nextBtn"/>
            <input type="button" value="取消" class="btn_2" id="calBtn3"/>
        </p>
        </div>
        <div id="tableManagerContentDown2" style="display: none;">
            <p class="btn_area" style="text-align: center">
                <input type="button" value="上一步" class="btn_2" id="preBtn"/>
                <input type="button" value="保存" class="btn_2" id="saveBtn3"/>
                <input type="button" value="取消" class="btn_2" id="calBtn4"/>
            </p>
         </div>
    </div>
</div>



<div id="regtableManagerContentTop" style="display: none;overflow: scroll;height: 375px">
    <div id="regtableManagerContentTop1" style="display: none">
       <div>
           <table class="table">
               <tr>
                   <td class="t_td"><span class="Required">*</span>数据源名称：</td>
                   <td class="content_td">
                        <input type="text" value="" class="input" id="regdataSourceName" readonly="readonly" rows="4" style="width:50%;" />
                        <input type="hidden" value="" class="input" id="regdataSourceId"  />
                   </td>
                   <td class="t_td"><span class="Required">*</span>表名称:&nbsp;</td>
                   		<td>
                        <select id="regmanagerTableName" readonly="readonly" onchange="selectTableName()">
                            <option value=''>---请选择---</option>
                        </select>
                        </td>
                   <td class="t_td1">状态：</td>
                   <td class="content_td1">
                        <select id="regstate" rows="4" style="width:50%;" readonly="readonly" disabled="disabled" >
                            <option value='0'>有效</option>
                            <option value='1'>无效</option>
                        </select></td>
                   </td>
               </tr>
               <tr>
                   <td class="t_td">表描述:&nbsp;</td><td class="regcontent_td" rowspan="5"> <input type="text"  class="input" id="regmanagerTableMsg" style="width:80%"/></td>
               </tr>
           </table>
          </div>
    <div class="info_area"><span class="title_blod">注册列的分类信息</span></div>
    <table id="regparaTableManagerInfoTable" cellpadding="0" cellspacing="0" class="table_list">
        <tr>
            <td class="nav_td_trl">序号</td>
            <td class="nav_td_trl">分类名称</td>
            <td class="nav_td_trl">分类别名</td>
            <td class="nav_td_trl">分类说明</td>
        </tr>
    </table>
     </div>
     
    
    <div id="regtableManagerContentTop2" style="display: none">
        <div class="info_area"><span class="title_blod">注册列信息</span></div>
        <table id="regparaTableManagerInfoTable1" cellpadding="0" cellspacing="0" class="table_list">
            <tr>
                <td class="nav_td_trl">序号</td>
                <td class="nav_td_trl">分类别名</td>
                <td class="nav_td_trl">列名称</td>
                <td class="nav_td_trl">列英文别名</td>
                <td class="nav_td_trl">列中文别名</td>
                <td class="nav_td_trl">拆分标识</td>
                <td class="nav_td_trl" width="50px">操作</td>
            </tr>
        </table>
     </div>
    <div id="regtableManagerContentDown" style="display: none;">
       <div id="regtableManagerContentDown1" style="display: none;">
        <p class="btn_area" style="text-align: center">
            <input type="button" value="下一步" class="btn_2" id="regnextBtn"/>
            <input type="button" value="取消" class="btn_2" id="regcalBtn3"/>
        </p>
        </div>
        <div id="regtableManagerContentDown2" style="display: none;">
            <p class="btn_area" style="text-align: center">
                <input type="button" value="上一步" class="btn_2" id="regpreBtn"/>
                <input type="button" value="保存" class="btn_2" id="regsaveBtn3"/>
                <input type="button" value="取消" class="btn_2" id="regcalBtn4"/>
            </p>
         </div>
    </div>
</div>

</body>
</html>