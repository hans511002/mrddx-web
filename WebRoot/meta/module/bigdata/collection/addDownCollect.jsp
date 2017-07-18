<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王建友
 * @description 
 * @date 2013-07-16
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title>[配置]<%=request.getParameter("COL_NAME")==null?"":new String(request.getParameter("COL_NAME").getBytes("iso-8859-1"),"UTF-8") %></title>
    <link type="text/css" rel="stylesheet" href="../css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="../css/base.css" />
    <link type="text/css" rel="stylesheet" href="../css/tb_style.css" />
    <%@include file="../../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
	<script type="text/javascript" src="<%=rootPath%>/dwr/interface/CollectionAction.js"></script>
	<script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserTypeAction.js"></script>
	<script type="text/javascript" src="<%=rootPath%>/dwr/interface/BigDataSourceAction.js"></script>
    <script type="text/javascript" src="addDownCollect.js"></script>
	<script type="text/javascript">
		var flag=<%=request.getParameter("flag")%>;
		var col_id=<%=request.getParameter("COL_ID")%>;
		var col_name='<%=request.getParameter("COL_NAME")%>';
		var col_origin=<%=request.getParameter("COL_ORIGIN")%>;
		var col_datatype=<%=request.getParameter("COL_DATATYPE")%>;
		var col_describe='<%=request.getParameter("COL_DESCRIBE")%>';
	</script>   
	</script>   

</head>
<body style='width:100%;height:100%;'>

<form action="collectForm" id="collectForm" onsubmit="return false;" style="width:100%;height:100%;">
    <div id="collectDIV" style="position:absolute; padding:1px;height:100%;width:100%;overflow-x:hidden;overflow-y:auto;">
        <table id="collectTable" class="MetaFormTable"  border="0" cellpadding="0" cellspacing="1" >
            <tr>
                <th style="width: 10%"><font color="red">*</font>采集名称：</th>
                <td style="width: 20%"><input type="hidden" id="COL_ID" name="COL_ID" value=""/><input style="width: 180px" type="text" id="COL_NAME"/></td>
                <th style="width: 10%"><font color="red">*</font>采集方向：</th>
                <td style="width: 20%">
                	<input type="hidden" id="COL_ORIGIN" name="COL_ORIGIN" value="0"/>
					下载
                </td>
                <th style="width: 10%"><font color="red">*</font>文件类型：</th>
                <td style="width: 20%">
					<select id="COL_DATATYPE" style="width: 180px;">
					<option value="">--请选择--</option>
					<option value="0">文本文件</option>
					<option value="1">其他文件</option>
					</select>
                </td>
            </tr>
            <tr>
                <th><font color="red">*</font>优先级：</th>
                <td>
					<select id="COL_TASK_PRIORITY" style="width: 180px;">
					<option value="">--请选择--</option>
					<option value="1">最低级</option>
					<option value="2">低级</option>
					<option value="3">普通</option>
					<option value="4">高级</option>
					<option value="5">最高级</option>
					</select>
                </td>
            	<th><font color="red">*</font>系统运行数据源：</th>
            	<td>
            	<input type="hidden" id="COL_RUN_DATASOURCE" name="COL_RUN_DATASOURCE" value=""/>
            	<input id="COL_RUN_DATASOURCE_NAME" readonly="readonly" style="width: 180px;" name="COL_RUN_DATASOURCE_NAME" type="text"></input></td>
                <th><font color="red">*</font>任务数：</th>
                <td><input style="width: 180px" id="COL_TASK_NUMBER"></input></td>   
            </tr>
            <tr>
                <th><font color="red">*</font>任务系统目录：</th>
                <td><input style="width: 180px" id="COL_SYS_INPUTPATH"></input></td>  
                <th style="width: 10%">描述信息：</th>
                <td style="width: 20%"><input style="width: 180px" id="COL_DESCRIBE"></input></td>                
            	<th><font color="red">*</font>输出数据源：</th>
            	<td>
            	<input type="hidden" id="COL_PAR_ID" name="COL_PAR_ID" value=""/>
            	<input type="hidden" id="OUTPUT_DATASOURCE_ID" name="OUTPUT_DATASOURCE_ID" value=""/>
            	<input id="OUTPUT_DATASOURCE_NAME" readonly="readonly" style="width: 180px;" name="OUTPUT_DATASOURCE_NAME" type="text"></input></td>
           </tr> 
           <tr>
            	<th><font color="red">*</font>输出文件目录：</th>
            	<td><input id="OUTPUT_PATH" style="width: 180px;" name="OUTPUT_PATH" type="text"></input></td>
           		<th><font color="red">*</font>业务类型:</th>
		        <td>
		        <select id="COL_TYPE"></select> 
		        </td>	 
                <th>插件内容：</th>
                <td><input name="" id="pluginBtn" type="button" value="配置" class="btn_2" /></td>
           </tr>
        </table>
        <div id="collectListGrid"  style="height: 175px;width:100%; overflow: auto; padding-top:0px"></div>
        <div style="position:absolute;height: 50px;width:100%;">
        <table style=" " id="collectTable2" class="MetaFormTable"  border="0" cellpadding="0" cellspacing="1" >

			<tr>
            	<td><font color="red">*</font>输入数据源：</td>
            	<td><input type="hidden" style="width: 180px" id="INPUT_DATASOURCE_ID">
            		<input readonly="readonly" style="width: 180px" id="INPUT_DATASOURCE_NAME">
            	</td>
            	<td><font color="red">*</font>文件列表类型：</td>
            	<td>
					<select id="INPUT_FILELST_TYPE">
					<option value="1">关系型数据库</option>
					<option value="0">文本系统</option>
					</select>
            	</td>
            	<td>文件列表数据源：</td>
            	<td>
					<input type="hidden" style="width: 180px" id="INPUT_FILELST_DATASOURCE_ID"></input>
					<input readonly="readonly" style="width: 180px" id="INPUT_FILELST_DATASOURCE_NAME" ></input>
            	</td>
				<td>输入查询SQL语句：</td>
				<td><input style="width: 180px;"  id="INPUT_QUERY_SQL"></td>
            </tr>
			<tr>
				<td>输入目录：</td>
				<td><input style="width: 180px" id="INPUT_PATH" disabled="disabled"></td>
            	<td>输入文件规则：</td>
            	<td><input style="width: 180px" id="INPUT_FILE_RULE"></td>
            	<td><font color="red">*</font>输入文件处理类型：</td>
            	<td>
					<select id="INPUT_DOTYPE">
						<option value="0">不处理</option>
						<option value="1">删掉源文件</option>
						<option value="2">移动源文件</option>
						<option value="3">移动源文件并重命名</option>
						<option value="4">重命名</option>
					</select>
            	</td>
            	<td>输入文件移动目录：</td>
            	<td><input style="width: 180px;" id="INPUT_MOVE_PATH" disabled="disabled"></td>
            </tr>
            <tr>
            	<td>输入文件重命名规则：</td>
            	<td><input style="width: 180px;" id="INPUT_RENAME_RULE" disabled="disabled"></td>
            	<td>输入文件重命名：</td>
            	<td><input style="width: 180px" id="INPUT_RENAME"  disabled="disabled"></td>
            	<td>输出文件重命名规则：</td>
            	<td><input id="OUTPUT_RENAME_RULE" style="width: 180px;" name="OUTPUT_RENAME_RULE" type="text"></input></td>
            	<td>输出文件重命名：</td>
            	<td><input id="OUTPUT_RENAME" style="width: 180px;"></input></td>
            </tr>
            <tr>
            	<td>输出文件移动目录：</td>
            	<td><input id="OUTPUT_MOVE_PATH" style="width: 180px;" name="OUTPUT_MOVE_PATH" type="text"></input></td>
            	<td>压缩类型：</td>
            	<td><select id="IS_COMPRESS" style="width: 180px;" name="OUTPUT_MOVE_PATH">
            		<option value="0">--请选择--</option>
            		<option value="1">GzipCodec</option>
            	</select></td>
            	<td>备注：</td>
            	<td><input id="NOTE" style="width: 180px;" name="NOTE" type="text"></input></td>
            	<td colspan="4"></td>
            </tr>
        </table>
        </div>
        <!--  <div id="collectGrid"  style="position:absolute;height: 300px;width:100%; overflow: auto; padding-top:1px"></div>-->
        <div style="position:absolute;height: 30px;width:100%;text-align:center;padding-top: 150px;">
			<input name="" id="add_SaveBtn" type="button" value="新增" class="btn_2" />
			<input name="" id="add_CleanBtn" type="button" value="重置" class="btn_2" />
			<input name="" id="add_CloseBtn" type="button" value="关 闭" class="btn_2" />
        </div>  
    </div>
</form>
     <div id="tableSelectDataSourceContentTop" style="display: none;">
        <div>
            <span style="margin-left: 10px;" >数据源名称:</span>
            <input type="text" id="searchSourceName" />
            <input type="button" value="搜索" class="btn_2" id="searchDataSourceTable" />
        </div>
        <div style="height:255px;" id="tableSelectDataSourceContent"></div>
     </div>
    <div id="tableSelectDataSourceContentDown" style="display: none;">
        <p class="btn_area"><input type="button" value="确定" class="btn_2" id="saveDataSourceBtn"/>
        </p>
    </div>
    
<form action="" id="_viewDataSourceForm" style="display: none" onsubmit="return false;" >
    <div id="jobParamDIV" style=" position:absolute;padding:1px;height:400px;width:100%;overflow-x:hidden;overflow-y:auto;">
        <table class="ViewTable"  border="0" cellpadding="0" cellspacing="1" width="100%;">
            <tr>
                <th style="width:20%">数据源名称：</th>
                <td style="width:30%"><div id="viewDataSourceName" ></div></td>
                <th style="width:20%">源类型名称：</th>
                <td style="width:30%"><div id="viewSourceTypeName" ></div></td>
            </tr>         	          	
        </table>
        <div id="gridDataSourceParamView" style="position:absolute;height: 200px;width:100%; overflow: auto; padding-top:1px;"></div>
    </div>
    <div id="_BtnBottom" style="text-align:center;padding-top:20px;height: 50px;width:100%;" >
        <span id="_viewCloseBtn" ><input name="" id="closeBtn" type="button" value="关 闭" class="btn_2" /></span>
     </div>
</form>
 
 <div id="paramDIV" style="left: 0;width:350px;position: absolute;display: none;z-index: 100">
</div>
 <div id="div_plugin" style="left: 0;width:532px;height:240;position: absolute;display: none;z-index: 100">
    <div><span>请填写插件代码</span><img id="pluginValueExample" src="../../../../meta/resource/images/help.gif" alt="" /></div>
    <textarea id="pluginCode"  style="text-align: left;" rows="23" cols="64"></textarea>
	<div style="margin-top: 8px;text-align: center;">
	    <input name="" id="pluginSaveBtn" type="button" value="保 存" class="btn_2"/>
	    <input name="" id="pluginCloseBtn" type="button" value="关闭" class="btn_2" />
	    <input name="" id="pluginCalBtn" type="button" value="取 消" class="btn_2" />
	</div>
 </div>
 <div id="pluginExampleDIV" style="left: 0;width:350px;position: absolute;display: none;z-index: 100"></div>
</body>
</html>