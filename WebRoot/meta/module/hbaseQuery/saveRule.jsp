<%--
  Created by IntelliJ IDEA.
  User: 春生
  Date: 13-10-29
  Time: 下午12:11
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>维护数据处理策略任务</title>
    <%@include file="../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=WS_RULE_DATA_TYPE,RETURN_TYPE,WS_RULE_TYPE"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/JobAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/BigDataSourceAction.js"></script>
    <script type="text/javascript">
        var ruleId = 0;
        var copyFlag = 0;
        <%
        String ruleId = request.getParameter("ruleId");
        String copyFlag = request.getParameter("copyFlag");
        if(ruleId!=null && !"".equals(ruleId)){
        out.println("ruleId="+ruleId+";");
        }
        if("1".equals(copyFlag) || "true".equals(copyFlag)){
        out.println("copyFlag=1;");
        }
        %>
    </script>
    <script type="text/javascript" src="saveRule.js"></script>
</head>
<body>
<div style="position:absolute;left:0;right: 0;bottom:40px;top:0;" id='dataTabDIV'></div>
<div style="position:absolute;left:0;right:0;bottom:0;height: 30px;text-align:center;margin-top:10px;" >
    <input style="display:none;margin-right:10px;" id="prevBtn" type="button" value="上一步"  class="btn_2"  />
    <input style="display:none;margin-right:10px;" id="nextBtn" type="button" value="下一步"  class="btn_2"  />
    <input style="display:none;margin-right:10px;" id="saveBtn" type="button" value="保 存"   class="btn_2"  />
    <input style="margin-right:10px;" id="resetBtn" type="reset" value="重 置"   class="btn_2"  />
    <input style="margin-right:10px;" id="closeBtn" type="button" value="关 闭" class="btn_2" />
</div>
<div id='baseInfo' style="width:100%;height:100%;display:none;position:relative;overflow-x:hidden;overflow-y:auto;">
</div>
<div id='paramInfo' style="width:100%;height:100%;display:none;position:relative;overflow-x:hidden;overflow-y:auto;"></div>
</body>
</html>