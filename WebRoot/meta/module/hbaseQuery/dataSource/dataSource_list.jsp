<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>数据源管理</title>
    <link type="text/css" rel="stylesheet" href="../css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="../css/tag.css" />
    <link type="text/css" rel="stylesheet" href="../css/base.css" />
    <link type="text/css" rel="stylesheet" href="../css/tb_style.css" />
    <%@ include file="../../../public/header.jsp" %>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/HBaseDataSourceAction.js"></script>
    <script type="text/javascript" src="dataSource_list.js"></script>
    <script type="text/javascript">
  	 var isReLoad = <%=request.getParameter("isReLoad")%>;
  
    </script>
</head>
<body style="height: 100%;width: 100%">
<div id=queryFormDiv style="height:9%">
    <table style="height: 100%">
        <tr>
            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;数据源名称:</td>
            <td><input id="data_name"/></td>
            <td>&nbsp;&nbsp;&nbsp;&nbsp;状态:</td>
            <td><select type="text" id="data_status"></select></td>
            <td>&nbsp;&nbsp;<input type="button" id="queryBtn" class="btn_2" value="查询" /></td>
            <td><input type="button" id="newBtn" class="btn_2" value="新增" /></td>
        </tr>
    </table>
</div>
<div id="container" style="height: 91%;width: 100%"></div>
<div style="overflow-y:auto;display:none;" id="dataFormDIV">
    <form action="<%=rootPath %>/upload?fileUploadCalss=com.ery.meta.module.hBaseQuery.DataSourceUploadImpl" id="dataForm" enctype="multipart/form-data" method="post">
        <table cellpadding="0" cellspacing="0" class="table">
            <tr>
                <td   class="t_td"><span style="color:red;font-weight:normal;">*</span>数据源名称:</td>
                <td class="content_td"><input type="text" name="dateSourceName"  id="dateSourceName" class="input" value="" rows="4" style="width:60%;" />
                    <input type="hidden" id="dateSourceId" name="dateSourceId" value="0"/></td>
            </tr>
            <tr>
                <td   class="t_td"><span style="color:red;font-weight:normal;">*</span>数据源地址:</td>
                <td class="content_td"><input type="text" name="dateSourceAddress" id="dateSourceAddress" value="" rows="4" style="width:60%;" />
            </tr>
            <tr>
                <td   class="t_td"><span style="color:red;font-weight:normal;">*</span>HBase的ZK节点名称:</td>
                <td class="content_td"><input type="text" name="rootZnodeName" id="rootZnodeName" value="" rows="4" style="width:60%;" />
            </tr>
            <tr>
                <td   class="t_td">HBase配置文件:</td>
                <td class="content_td">
                <div id="addHB">
                	<table  border="0" cellpadding="0" cellspacing="0" style="width:100%" >
                    <tr>
                        <td style="width:70%;padding:1px;border: 0;" id="iframeContent"><iframe id="uploadIfame" style="height:64px;width:100%;border: 0" ></iframe></td>
                    </tr>
                </table>
                </div>
                    <div id="viewHB"><input type="button" value="下载" id="downloadBtn" /></div>
                </td>
            </tr>
            <tr>
                <td   class="t_td"><span style="color:red;font-weight:normal;">*</span>ZK根节点名称:</td>
                <td class="content_td"><input type="text" id="parentZnodeName" name="parentZnodeName" value="" rows="4" style="width:60%;"/>
            </tr>
            <tr>
                <td   class="t_td"><span style="color:red;font-weight:normal;">*</span>ZK服务地址:</td>
                <td class="content_td"><input type="text" id="zookeeperServers" name="zookeeperServers" value="" rows="4" style="width:60%;"/>
            </tr>
            <tr>
                <td   class="t_td"><span style="color:red;font-weight:normal;">*</span>ZK服务端口:</td>
                <td class="content_td" ><input type="text" id="zookeeperPort" name="zookeeperPort" value="" rows="4" style="width:60%;"/>
            </tr>
            <tr>
                <td   class="t_td"><span style="color:red;font-weight:normal;">*</span>并发访问数:</td>
                <td class="content_td"><input type="text" id="parallelNum" name="parallelNum" value="" rows="4" style="width:60%;"/>
            </tr>
            <tr>
                <td   class="t_td"><span style="color:red;font-weight:normal;">*</span>状态:</td>
                <td class="content_td"><select type="text" id="state" name="state" value="" style="width:20%">
                    <option value="0" selected="selected">有效</option>
                    <option value="1">无效</option>
                </select>
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