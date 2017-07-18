<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王建友
 * @description 
 * @date 2013-04-18
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title></title>
    <link type="text/css" rel="stylesheet" href="../../css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="../../css/base.css" />
    <link type="text/css" rel="stylesheet" href="../../css/tb_style.css" />

    <%@include file="../../../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=OPERATING_SYSTEM,SERVER_TYPE,CPU_FRAMEWORK"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/BigDataSourceAction.js"></script>

    <script type="text/javascript" src="dataSourceManager.js"></script>
    <style type="text/css">
        html{
            width:100%;
            height:100%;
        }
		table.ViewTable{
		    width:100%;
		    background-color:#A4BED4;
		    overflow: hidden;
		}
		table.ViewTable tr{
		    height:24px;
		}
		table.ViewTable th{
		    width:70px;
		    text-align: right;
		    padding: 1px 2px 1px 0;
		    background-color:#E9F5FE;
		    vertical-align:middle;
		    white-space:nowrap;
		    font-size:12px;
		    height:100%;
		    min-height:22px;
		}
		table.ViewTable td{
		    text-align: left;
		    padding:2px 2px 2px 2px;
		    background-color:#FFFFFF;
		    vertical-align:middle;
		    white-space:nowrap;
		    font-size:12px;
		    height:100%;
		    min-height:22px;
		}

        .MetaFormTable #paramsDIV th,td{
            line-height:16px;
            min-height:16px;
        }
    </style>
</head>
<body style='width:100%;height:100%;'>

<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: auto;">
    <div id="queryFormDIV" class="C_query" style="height: 20px">
        <%--查询条件表单模板--%>
        <table border="0" cellpadding="0" cellspacing="0">
            <tr style="height: 10px">
                <td>分类:</td>
                <td>
                <select id="SOURCE_CATE" style="width: 200px" onchange="selectTpyeCate();">
	                <option value="0">数据处理</option>
	                <option value="1">数据采集</option>
	                <option value="2">系统运行</option>
                </select>
				</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>源类型:</td>
                <td><div id="querySourceTypeName"></div></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>数据源名称:</td>
                <td><input type="text" class="input" id="dataSourceName"/></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>                
                <td><input type="button" value="查 询" class="btn_2" id="queryBtn" /></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td><input type="button" value="新 增" class="btn_2" id="newBtn" /></td>
            </tr>
        </table>        
    </div>
    
    <div style="min-height:200px;min-width:800px;border-top:1px solid #D0E5FF;left:0px;bottom: 0px;right: 0px;" id="dataDiv">
    </div>
</div>

<div id='magDSDIV' style="position:relative;display:none;width:100%;height:100%;overflow-x:hidden;overflow-y:hidden;">
    <table border="0" cellpadding="0" cellspacing="1" style="width:702px;background-color:#A4BED4;">
        <tr>
            <th style="width:100px;height:24px;background-color:#E9F5FE;white-space:nowrap;font-size:12px;line-height:24px;text-align:right;">数据源名称:<span style="color:red;font-weight:normal;">*</span></th>
            <td colspan="3" style="background-color:#fff;">
                <input type="text" id='saveDataSourceName' style="width:500px;">
                <span id="saveDataSourceName_V" style="display:none;padding-left:5px;"></span>
            </td>
        </tr>
        <tr>
            <th style="height:24px;background-color:#E9F5FE;white-space:nowrap;font-size:12px;line-height:24px;text-align:right;">分类:<span style="color:red;font-weight:normal;">*</span></th>
            <td style="width:220px;background-color:#fff;"><div id='saveDataSourceCate'></div><span id='saveDataSourceCate_V' style="display:none;padding-left:5px;"></span></td>
            <th style="width:80px;height:24px;background-color:#E9F5FE;white-space:nowrap;font-size:12px;line-height:24px;text-align:right;">源类型:<span style="color:red;font-weight:normal;">*</span></th>
            <td style="background-color:#fff;"><div id='saveDataSourceType'></div><span id='saveDataSourceType_V' style="display:none;padding-left:5px;"></span></td>
        </tr>
        <tr>
            <th style="height:24px;background-color:#E9F5FE;white-space:nowrap;font-size:12px;line-height:24px;text-align:right;">参数信息:&nbsp;</th>
            <td colspan="3" style="position:relative;height:auto;background-color:#fff;">
                <div id='paramsDIV' style="width:608px;;height:250px;"></div>
            </td>
        </tr>
    </table>
    <div style="position:absolute;width:100%;bottom:10px;left:0;text-align:center;">
        <input type="button" class="btn_2" value="保存" id='saveBtn' style="margin-right:10px;display:none;">
        <input type="button" class="btn_2" value="关闭" id='cloBtn' style="margin-right:10px;">
    </div>
</div>

</body>
</html>