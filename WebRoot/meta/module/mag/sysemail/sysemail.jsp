<%--
 * Copyrights @ 2012,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 陈颖
 * @description  系统订阅查询JSP
 * @date 12-11-19
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title></title>
    <%@include file="../../../public/header.jsp" %>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/SysEmailAction.js"></script>
    <script type="text/javascript" src="sysemail.js"></script>
    <script type="text/javascript">
    </script>
    <style type="text/css">
        .table1{
        	table-layout:fixed;
        	width:630px;
        	background-color:#D0DBE5;
        	margin: 1px;
        }
        .td{
        	height:30px;
        	background-color:#ffffff;
        }
        .th{
        width:99px;
        background-color:#E1F2FE;
        }
    </style>
</head>
<body style='width:100%;height:100%;'>
    <div id=queryFormDiv style="height:9%">
    	<table>
    		<tr>
    		<td><span style="padding-left: 30px;">发送周期:</span></td><td><div id="circletype" style="margin-top: 14px"></div>&nbsp;&nbsp;&nbsp;</td>
    		<td>关键字:&nbsp;&nbsp;&nbsp;</td><td><input type="text" id="kwd" style="border:1px solid #A4BED4;"/></td><td>&nbsp;&nbsp;&nbsp;<input type="button" id="queryBtn" class="btn_2" value="查询"/>&nbsp;&nbsp;&nbsp;<input type="button" value="新增" id="addBtn" onclick='addORmodify()' class="btn_2"/></td>
    		</tr>
    	</table>
    </div>
    <div  id="dataDiv" style="height:91%;width:100%"></div>
    
    <div id="viewWindow">
    	<input type="hidden" id="hiden"/>
    	<input type="hidden" id="id"/>
    	<table class="table1" cellpadding="0" cellspacing="1">
    		<tr>
    	    	<td style="width:100px;"></td>
    	    	<td style="width:140px;"></td>
    	    	<td style="width:100px;"></td>
    	    	<td style="width:278px;"></td>
    	    	<td style="width:75px;"></td>
    	    </tr>
    		<tr>
    			<th class="th">配置SQL:</th>
				<td class="td" colspan="3"><textarea  style="padding:4px;height:80px;resize:none; width:510px;" id="confgSql" onkeyup="change()" onblur="testSQLforOnblur()"></textarea></td>
				<td class="td"><input type="button" id="testBtn" value="测试执行" class="btn_4" onclick="testSql()" onkeyup="change()"/></td>
			</tr>
    		<tr>
    			<th class="th">查询字段:</th><td class="td" colspan="4"><div style="height: 30px;width:584px;word-break:break-all;margin:6px; "><span id="Macrov"></span></div></td>
			</tr>
    		<tr>
    			<th class="th" >发送主题:</th>
				<td colspan="4" class="td"><input type="text" id="topic" style="width:584px;padding:4px;"/></td>
			</tr> 	
			<tr>
				<th class="th">用户类型:</th>
				<td colspan="1" class="td"><select id="userORrole" style="width:100px;margin-left:4PX;" onchange="userChange()"><option value=1>用户</option><option value=2>角色</option></select></td><th class="th">名称:</th><td class="td" colspan="2"><input id="userName" style="width:342px;padding:4px;" type="text" onclick="selectRoleAndUesr(this);cancelBubble();"/></td>
			</tr>	
    		<tr>
    			<th class="th">内容模板:</th>
				<td colspan="4" class="td"><textarea style="padding:4px;width:586px;height:80px;resize:none;" id="content"></textarea></td>
			</tr>
    		<tr>
    			<th class="th">发送周期:</th>
    			<td class="td"><select style="margin:4px;width:100px;" id="sendCycle"  onchange="msg()"><option value=4>天&nbsp;&nbsp;&nbsp;</option><option value=3>周&nbsp;&nbsp;&nbsp;</option><option value=5>月&nbsp;&nbsp;&nbsp;</option><option value="1">分&nbsp;&nbsp;&nbsp;</option><option value=2>小时&nbsp;&nbsp;&nbsp;</option></select></td><th class="th">发送时间:</th><td colspan="3" class="td">  			
    			<span style="display:inline;margin-left: 4px;margin-bottom:4px;" id="day">
    			每月<select id="staDay" style="width:40px;"><option value=1>1</option><option value=2>2</option><option value=3>3</option><option value=4>4</option><option value=5>5</option><option value=6>6</option><option value=7>7</option><option value=8>8</option><option value=9>9</option><option value=10>10</option><option value=11>11</option><option value=12>12</option><option value=13>13</option><option value=14>14</option><option value=15>15</option><option value=16>16</option><option value=17>17</option><option value=18>18</option><option value=19>19</option><option value=20>20</option><option value=21>21</option><option value=22>22</option><option value=23>23</option><option value=24>24</option><option value=25>25</option><option value=26>26</option><option value=27>27</option><option value=28>28</option><option value=29>29</option><option value=30>30</option></select>号开始&nbsp;&nbsp;每<select id="dayvalue" style="width:33px;"><option value=1>1</option><option value=2>2</option><option value=3>3</option><option value=4>4</option><option value=5>5</option></select>天&nbsp;&nbsp;<input type="text"  style="width:20px;" id="dayhour" value="00" onkeyup="InputHourTest(this)" onchange="test(this)"/>时<input type="text" size="2" style="width: 20px;" id="dayminu" value="00" onkeyup="InputTest(this)" onchange="test(this)"/>分
    			</span>
    			
    			<span style="display:none;margin: 4px;" id="week">
    				每<select id="weekvalue" style="width:40px;"><option value=1>1</option><option value=2>2</option><option value=3>3</option><option value=4>4</option><option value=5>5</option></select>周&nbsp;&nbsp;&nbsp;<select id="weekday"><option value=1>周一</option><option value=2>周二</option><option value=3>周三</option><option value=4>周四</option><option value=5>周五</option><option value=6>周六</option><option value=7>周日</option></select>&nbsp;&nbsp;&nbsp;<input id="weekhour" type="text" style="width:20px;" value="00" onkeyup="InputHourTest(this)" onchange="test(this)"/>时<input id="weekminu" type="text" style="width:20px;" value="00" onchange="test(this)" onkeyup="InputTest(this)" onchange="test(this)"/>分
    			</span>
    			
    			<span style="display:none;margin: 4px;" id="month">
    				每年<select id="staMonth" style="width:40px;"><option value=1>1</option><option value=2>2</option><option value=3>3</option><option value=4>4</option><option value=5>5</option><option value=6>6</option><option value=7>7</option><option value=8>8</option><option value=9>9</option><option value=10>10</option><option value=11>11</option><option value=12>12</option></select>月开始&nbsp;&nbsp;每<select id="monthvalue" style="width:40px;"><option value=1>1</option><option value=2>2</option><option value=3>3</option><option value=4>4</option><option value=5>5</option></select>个月&nbsp;&nbsp;<select id="monthday"><option value=1>1</option><option value=2>2</option><option value=3>3</option><option value=4>4</option><option value=5>5</option><option value=6>6</option><option value=7>7</option><option value=8>8</option><option value=9>9</option><option value=10>10</option><option value=11>11</option><option value=12>12</option><option value=13>13</option><option value=14>14</option><option value=15>15</option><option value=16>16</option><option value=17>17</option><option value=18>18</option><option value=19>19</option><option value=20>20</option><option value=21>21</option><option value=22>22</option><option value=23>23</option><option value=24>24</option><option value=25>25</option><option value=26>26</option><option value=27>27</option><option value=28>28</option><option value=29>29</option><option value=30>30</option></select>号<input id="monthhour" type="text" style="width:20px;" value="00" onkeyup="InputHourTest(this)" onchange="test(this)"/>时<input id="monthminu" type="text" style="width:20px;" value="00" onchange="test(this)" onkeyup="InputTest(this)"/>分
    			</span>
    			
    			<span style="display:none;margin: 4px;" id="hour">
    				每天<select id="staHours" style="width:40px;" ><option value=0>0</option><option value=1 selected="selected">1</option><option value=2>2</option><option value=3>3</option><option value=4>4</option><option value=5>5</option><option value=6>6</option><option value=7>7</option><option value=8>8</option><option value=9>9</option><option value=10>10</option><option value=11>11</option><option value=12>12</option><option value=13>13</option><option value=14>14</option><option value=15>15</option><option value=16>16</option><option value=17>17</option><option value=18>18</option><option value=19>19</option><option value=20>20</option><option value=21>21</option><option value=22>22</option><option value=23>23</option></select>点开始&nbsp;&nbsp;&nbsp;每<select id="hourvalue" style="width:40px;"><option value="1" selected="selected">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select>个小时&nbsp;&nbsp;&nbsp;<input type="text" style="width: 20px" id="hourminu" value="00" onkeyup="InputTest(this)" onchange="test(this)"/>分<input type="text" style="width: 20px" id="hours" value="00" onkeyup="InputTest(this)" onchange="test(this)"/>秒
    			</span>
    			<span style="display:none;margin: 4px;" id="minu">
    				每小时<input type="text" id="staMinu" style="width:20px;" value="01" onkeyup="InputTest(this)" onchange="test(this)"/>分钟开始&nbsp;&nbsp;&nbsp;每<input id="minuvalue" value="01" style="width:20px;" type="text" onkeyup="InputTest(this)" onchange="test(this)"/>分钟&nbsp;&nbsp;&nbsp;<input type="text" style="width: 20px" id="minus" value="00" onkeyup="InputTest(this)" onchange="test(this)"/>秒
    			</span>
    			
    			</td>
				</tr>
            <tr>
            <th class="th">发送类型:</th>
			<td class="td"><select style="margin:4px;width:100px;" id="sendType"><option value="">邮件&nbsp;&nbsp;&nbsp;</option><option value="">短信&nbsp;&nbsp;&nbsp;</option></select></td><th class="th">重试次数:</th><td class="td" colspan="3"><select style="margin-left:4px;margin-bottom:4px;" id="TryTimes" ><option value=1>1</option><option value=2>2</option><option value=3>3</option><option value=0>不重复</option><option value=-1>无限</option></select></td>
			</tr>
    		<tr><td align="center" colspan="5" class="td"><input style="margin-bottom:20PX;margin-top:10px;" type="button" value="保存" class="btn_2" onclick="addOrUpdateEmail()"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="button" id="closeBtn" value="取消" class="btn_2" style="margin-bottom:20PX;margin-top:10px;"/></td></tr>
    	</table>
    </div>
    
    <div id="showmsg">
    	<table class="table1" border="0" cellpadding="0" cellspacing="1">
    		<tr>
    	    	<td style="width:94px;"></td>
    	    	<td style="width:218px;"></td>
    	    	<td style="width:94px;"></td>
    	    	<td style="width:218px;"></td>
    	    </tr>
    		<tr>
    			<th class="th">配置SQL:</th>
				<td class="td" colspan="3"><textarea readonly="readonly"  style="height:100px;resize:none; width:530px;border:1px solid #ffffff;" id="Sql"></textarea></td>
			</tr>
    		<tr>
    			<th class="th">发送主题:</th>
				<td colspan="3" class="td"><span style="width:504px;margin:4px;" id="Topics"></span></td>
			</tr> 	
			<tr>
				<th class="th">用户类型:</th>
				<td class="td"><span id="Usertypes" style="width:80px;margin:4PX;" ></span></td><th class="th">名称:</th><td class="td"><span id="viewusername" style="display:inline;width:455px;margin: 4px;"></span></td>
			</tr>	
    		<tr>
    			<th class="th">内容模板:</th>
				<td colspan="3" class="td"><textarea readonly="readonly" style="padding:4px;width:524px;height:100px;resize:none;border:1px solid #ffffff;" id="Contents"></textarea></td>
			</tr>
    		<tr>
    			<th class="th">发送周期:</th>
    			<td class="td"><span id="Cycletypes" style="margin:4px;"></span></td><th class="th">发送时间:</th><td class="td"><span id="Sendtimes" style="margin: 4px;"></span></td>
				</tr>
            <tr>
            <th class="th">发送类型:</th>
			<td class="td"><span id="Sendtypes" style="margin:4px;"></span></td><th class="th">重复次数:</th><td class="td"><span id="Trytimess" style="margin: 4px;"></span></td>
			</tr>
    		<tr><td align="center" colspan="4" class="td"><input type="button" id="closeBtn2" value="关闭" class="btn_2" style="margin-bottom:20px;margin-top:15px;"/></td></tr>
    	</table>
    </div>
    
</body>
</html>








