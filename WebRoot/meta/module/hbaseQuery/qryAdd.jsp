<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>


<html>
<head>
    <title>查询规则操作页面</title>
    <link type="text/css" rel="stylesheet" href="css/tc_style.css" />
    <link type="text/css" rel="stylesheet" href="css/tag.css" />
    <link type="text/css" rel="stylesheet" href="css/base.css" />
    <link type="text/css" rel="stylesheet" href="css/tb_style.css" />
    <%@include file="../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/HBQryRuleAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/AuthorityAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/HBaseDataSourceAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/HBTableAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserTypeAction.js"></script>
    <script type="text/javascript" src="qryAdd.js"></script>
    <script type="text/javascript">
        var qryRuleId=<%=request.getParameter("qryRuleId")%>;				//查询规则ID
        var qryFlag=<%=request.getParameter("flag")%>;				//查询规则ID
    </script>
</head>

<body style='width:100%;height:100%;overflow-y: auto;'>
<div style="position:absolute; top:0; left:0; right:0; bottom:0; overflow-x:hidden;overflow-y:auto;padding-left:90px;padding-right:90px;">
    <div id="mainDiv" class="tabDiv">
        <ul id="mianUl" class="tabUl">
            <li id="dataSource" class="selectTag">
                <a onClick=""
                   href="javascript:void(0)">设置数据源</a>
            </li>
            <li id="rule">
                <a onClick=""
                   href="javascript:void(0)">设置查询规则基本信息</a>
            </li>
            <li id="column">
                <a onClick=""
                   href="javascript:void(0)">选择需要的列</a>
            </li>
            <li id="filter">
                <a onClick=""
                   href="javascript:void(0)">设置过滤条件</a>
            </li>
            <li id="user">
                <a onClick=""
                   href="javascript:void(0)">设置用户访问权限</a>
            </li>
        </ul>

	    <div id="dataSourceDiv">
	        <div style="height:350px;">
	        	<table cellpadding="0" cellspacing="0" class="table">
	        		<tr>
        				<td class="t_td"><span class="Required">*</span>规则名称：</td>
               			 <td colspan="3" class="content_td"><input type="text" value="" class="input" id="ruleName" rows="4" style="width:30%;"/></td>
               			 <td class="t_td"><span class="Required">*</span>业务类型：</td>
               			 <td colspan="3" class="content_td">
               			 	<select type="text" style="width: 50%"  class="input" id="departType"/>
               			 </td>
        			</tr>
		            <tr>
		                <td class="t_td"><span class="Required">*</span>数据源名称：</td>
		                <td class="content_td">
		                    <input type="text" value="" class="input" id="dataSourceName" readonly="readonly" rows="4" style="width:50%;" />
		                    <input type="hidden" value="" class="input" id="dateSourceId"  />
		                </td>
		                <td class="t_td">状态：</td>
		                <td class="content_td">
		                    <input type="text" id="state"  class="input" style="width:50%;" readonly="readonly" rows="4" /></td>
		                <td class="t_td">数据源地址：</td>
		                <td class="content_td"><input type="text" value="" class="input" id="dateSourceAddress" rows="4" style="width:50%;" readonly="readonly"/></td>
		            </tr>
		            <tr>
		                <td class="t_td">ZK节点地址：</td>
		                <td class="content_td"><input type="text" value="" class="input" id="rootZnodeName" rows="4" style="width:50%;" readonly="readonly"/></td>
		                <td class="t_td">HBase配置文件：</td>
		                <td class="content_td"><input type="text" value="" class="input" id="hbaseSiteXml" name="hbaseSiteXml" rows="4" style="width:50%;" readonly="readonly"/></td>
		                <td class="t_td">ZK根节点名称：</td>
		                <td class="content_td"><input type="text" value="" class="input" id="parentZnodeName" rows="4" style="width:50%;" readonly="readonly"/></td>
		            </tr>
		            <tr>
		                <td class="t_td">ZK服务地址：</td>
		                <td colspan="5" class="content_td"><textarea class="textarea" id="zookeeperServers" readonly="readonly"></textarea></td>
		            </tr>
		            <tr>
		                <td class="t_td">ZK服务端口：</td>
		                <td colspan="5" class="content_td"><input type="text" value="" class="input" id="zookeeperPort" rows="4" style="width:50%;" readonly="readonly"/></td>
		            </tr>
	        	</table>
	       </div>
	        <p class="btn_area">
	            <input type="button" value="下一步" class="btn1" id="nextBtn1"/>
	        </p>
	    </div>
	    
	    
	    <div id="ruleDiv" style="display: none;">
	        <div style="height:350px;">
	         	<form action="" id="ruleForm" method="">
	         	    <div style="margin-top: 5px">
                        <span>数据源id：</span>
                        <label id="dataSourceId"></label>
                    </div>
		        	<table cellpadding="0" cellspacing="0" class="table">
			            <tr>
			                <td class="t_td"><span class="Required">*</span>HBase表名：</td>
			                <td class="content_td">
			                    <input type="text" value="" class="input" id="hBaseName" readonly="readonly" rows="4" style="width:50%;" />
			                    <input type="hidden" value="" class="input" id="hBaseId"  />
			                </td>
			                <td class="t_td">分区表规则：</td>
			                <td class="content_td"><input type="text" value="" class="input" id="hbaseTablePartition" style="width:50%;" /></td>
			                <td class="t_td">查询类型：</td>
			                <td class="content_td">
			                    <select id="qryType" rows="4" style="width:50%;" >
			                          <option value='1' selected="selected">按ROWKEY区间查询</option>
			                          <option value='0'>按ROWKEY查询</option>
			                    </select>
			
			                </td>
			            </tr>
			            <tr>
			                <td class="t_td">并发访问数：</td>
			                <td class="content_td"><input type="text" value="100" class="input" id="qryParallelNum" rows="4" style="width:50%;"/></td>
			                <td class="t_td">状态：</td>
			                <td class="content_td">
			                    <select  id="qryState" rows="4" style="width:50%;">
			                        <option value='0' selected="selected">有效</option>
			                        <option value='1'>无效</option>
			                    </select>
			                </td>
			                <td class="t_td">是否支持排序：</td>
			                <td class="content_td">
			                    <select id="supportSort" rows="4" style="width:50%;">
			                         <option value='0' selected="selected">否</option>
			                         <option value='1'>是</option>
			                    </select>
			                </td>
			            </tr>
			            <tr>
			                <td class="t_td">分页大小：</td>
			                <td class="content_td"><input type="text" value="0" class="input" id="paginationSize" rows="4" style="width:50%;"/></td>
			                <td class="t_td">分页缓存记录大小限制：</td>
			                <td class="content_td"><input type="text" value="0" class="input" id="clientRowsBufferSize" rows="4" style="width:50%;"/></td>
			                <td class="t_td">排序列：</td>
			                <td class="content_td"><input type="text" value="" class="input" id="defSortColumn" rows="4" style="width:50%;"/></td>
			            </tr>
			            <tr>
			                <td class="t_td">客户端游标缓存大小：</td>
			                <td class="content_td"><input type="text" value="10" class="input" id="scannerCachingSize" rows="4" style="width:50%;" /></td>
			                <td class="t_td">客户端读取缓存大小：</td>
			                <td class="content_td"><input type="text" value="500" class="input" id="scannerReadCacheSize" rows="4" style="width:50%;" /></td>
			            	<td class="t_td">排序类型：</td>
			                <td class="content_td">
			               		 <select id="sortType" rows="4" style="width:40%;" >
			               		 	<option value='2' >字符串</option>
			                        <option value='0'>整数</option>
			                        <option value='1'>小数</option>
			                        <option value='3'>时间</option>
			                	 </select>
							</td>
			            </tr>
			              <tr>
			                <td class="t_td">是否需要认证访问：</td>
			                <td class="content_td" >
			                    <select id="certAuth" rows="4" style="width:40%;" >
			                        <option value='0'>否</option>
			                        <option value='1' selected="selected">是</option>
			                    </select>
			                </td>
			                 <td class="t_td">是否记录访问日志：</td>
			                <td class="content_td" >
			                    <select id="logFlag" rows="4" style="width:20%;" >
			                   		 <option value='1'>是</option>
			                        <option value='0'>否</option>
			                    </select>
			                </td>
			                 <td class="t_td">是否记录详细访问日志：</td>
			                <td class="content_td">
			                    <select id="logFlagDetail" rows="4" style="width:20%;" >
			                   		 <option value='1'>是</option>
			                        <option value='0'>否</option>
			                    </select>
			                </td>
			            </tr>
		        	</table>
	       		</form>
	       		<label id="input_tip"></label>
			</div>
	        <p class="btn_area">
	            <input type="button" value="上一步" class="btn1" id="preBtn2"/>
	            <input type="button" value="下一步" class="btn1" id="nextBtn2"/>
	        </p>
	    </div>
	    
	    
	    <div id="columnDiv" style="display: none;">
	    	<div>
	    	英文名称：<input type="text" id="en_name" /> <input type="button" value="快速定位" class="btn_4" id="ksdw"/>
	    	 <input type="button" value="查看选中" class="btn_4" id="ckxz"/>
	    	 </div>
			<div style="height:355px;" id="tableSelectContent"></div>
	        <p class="btn_area">
	            <input type="button" value="上一步" class="btn1" id="preBtn3"/>
	            <input type="button" value="下一步" class="btn1" id="nextBtn3"/>
	        </p>
	    </div>
	    
	    
	    <div id="filterDiv" style="display: none;">
	        <div style="height:350px;">
		        <div id="con" class="tabDiv">
		            <ul id="tags" class="tabUl">
		                <li id="jb" class="selectTag">
		                    <a onClick="selectDiv('jbDiv',this);"
		                       href="javascript:void(0)">逻辑条件</a>
		                </li>
		                <li id="ss">
		                    <a onClick="selectDiv('ssDiv',this);"
		                       href="javascript:void(0)">正则表达式条件</a>
		                </li>
		            </ul>
		            <div id="jbDiv" style="height:340px; overflow:auto;">
		                <table id="paraLogicTable" cellpadding="0" cellspacing="0" class="table_list">
		                    <tr>
		                        <td class="nav_td_trl">序号</td>
		                        <td class="nav_td_trl">条件语句</td>
		                        <td class="nav_td_trl" width="100px">操作</td>
		                    </tr>
		                </table>
		            </div>
		            
		
		            <div id="ssDiv" style="display: none;height:340px; overflow:auto;">
		                <table id="paraRexTable" cellpadding="0" cellspacing="0" class="table_list">
		                    <tr>
		                        <td class="nav_td_trl">序号</td>
		                        <td class="nav_td_trl">表达式语句</td>
		                        <td class="nav_td_trl">匹配数据语句</td>
		                        <td class="nav_td_trl">筛选类型</td>
		                        <td class="nav_td_trl" width="100px">操作</td>
		                    </tr>
		                </table>
		            </div>
		        </div>
	        </div>
	        <p class="btn_area" style="margin-top:10px">
	            <input type="button" value="上一步" class="btn1" id="preBtn4"/>
	            <input type="button" value="下一步" class="btn1" id="nextBtn4"/>
	        </p>
	    </div>
		<div id="logicColumnDiv" style="display: none">
			<div>
                <table id="testConditionExp" cellpadding="0" cellspacing="0" class="table">
                    <tr>
                        <td class="t_td">条件语句：</td>
                        <td class="content_td" colspan="3"><input id="conditionExp" style="width: 50%" type="text"/><input type="hidden" id="rowIndexLogic" />例：{name}="成都"</td>
                    </tr>                
                </table>			
			</div>
            <div>
                <table id="testColumnFiled" cellpadding="0" cellspacing="0" class="table">               
                    <tr>
                    	<td class="nav_td_trl">序号</td>
                        <td class="nav_td_trl">字段列名</td>
                        <td class="nav_td_trl">字段值</td>
                        <td class="nav_td_trl">操作</td>
                    </tr>
                </table>
            </div>
	        <p class="btn_area">
	            <input type="button" value="测试" class="btn1" id="testLogic"/>
	            <input type="button" value="确定" class="btn1" id="saveLogic"/>
	            <input type="button" value="关闭" class="btn1" id="closeLogic"/>
	        </p>
	    </div>
	    
		<div id="regExpColumnDiv" style="display: none">
			<div>
                <table id="testConditionExp2" cellpadding="0" cellspacing="0" class="table">
                    <tr>
                        <td class="t_td">表达式语句：</td>
                        <td class="content_td" colspan="3"><input id="regExpState" style="width: 50%" type="text"/>例：[1][3-8]\\d{9}</td>
                    </tr>
                    <tr>
                        <td class="t_td">匹配语句：</td>
                        <td class="content_td" colspan="3"><input id="matchState" style="width: 50%" type="text"/><input type="hidden" id="rowIndexRex" /><input type="hidden" id="patternType">例：{name}="成都"</td>
                    </tr>                     
                </table>			
			</div>
            <div>
                <table id="testColumnFiled2" cellpadding="0" cellspacing="0" class="table">               
                    <tr>
                    	<td class="nav_td_trl">序号</td>
                        <td class="nav_td_trl">字段列名</td>
                        <td class="nav_td_trl">字段值</td>
                        <td class="nav_td_trl">操作</td>
                    </tr>
                </table>
            </div>
	        <p class="btn_area">
	       	   <input type="button" value="测试" class="btn1" id="testReg"/>
	            <input type="button" value="确定" class="btn1" id="saveReg"/>
	            <input type="button" value="关闭" class="btn1" id="closeReg"/>
	        </p>
	    </div>	      
	    
	    <div id="userDiv" style="display: none;">
	        <div style="height:350px;" id="tableAuthorityContent"></div>
	        <div>
	            <p class="btn_area">
	                <input type="button" value="上一步" class="btn1" id="preBtn5"/>
	                <input type="button" value="保存" class="btn1" id="saveBtn"/>
	                <input  type="button"  value="关闭" class="btn1" id="closeBtn"/>
	            </p>
	        </div>
	    </div>
	    
	    <div>
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
		    
		    <div id="tableSelectHBaseContentTop" style="display: none;">
		        <div>
		            <span style="margin-left: 10px;" >HBase表名:</span>
		            <input type="text" id="searchHBaseName" />
		            <input type="button" value="搜索" class="btn1" id="searchHBaseTable" />
		        </div>
		        <div style="height:255px;" id="tableSelectHBaseContent"></div>
		    </div>
		    
		    <div id="tableSelectHBaseContentDown" style="display: none;">
		        <p class="btn_area">
		        	<input type="button" value="确定" class="btn1" id="saveHBaseBtn"/>
		        	<input type="button" value="关闭" class="btn1" id="closeHBaseBtn"/>
		        </p>
		    </div>
		</div>
	</div>
</div>
</body>
</html>