<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 刘弟伟
 * @description 
 * @date 12-10-29
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title></title>
    <%@include file="../../../public/header.jsp"%>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/i18n.jsp?menuId=<%=menuId%>"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/public/code.jsp?types=WS_RULE_DATA_TYPE"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MetaShareWsAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/TestWsClient.js"></script>
    <script type="text/javascript">
        var rootPath =  '<%=request.getScheme() + "://" + request.getServerName()+ ":" + request.getServerPort()+ request.getContextPath() %>';
        var MenuLoaclInfo = {
            QUERY_KEY:"关键字",
            RULE_STAT:"状态",
            QUERY_BTN:"查询",
            ADD_SQL_SERVICE:"新增SQL服务",
            ADD_JAR_SERVICE:"新增JAR服务"
        };
        toLocal(MenuLoaclInfo);
    </script>
    <script type="text/javascript" src="webServiceList.js"></script>
    <style type="text/css">
        html{
            width:100%;
            height:100%;
        }
        .c_table{ width:100%;border-spacing:0; padding: 0; margin: 0;}
        .c_br_td{ width: 200px; border-bottom:1px solid #b1bbc5;border-right:1px solid #b1bbc5; height:25px; line-height:25px;padding: -1px; text-align: center; }
        .c_b_td{ border-bottom:1px solid #b1bbc5;height:23px;line-height:25px; padding-top: 2px; padding-left: 3px;}
        .c_tb_bg{background:#E9F5FE;}
        .c_bottom_td{border-bottom:1px solid #b1bbc5;}
    </style>
</head>
<body style='width:100%;height:100%;'>
<div id="pageContent" style="position:absolute;top:0px;left:0px;right: 0px;bottom: 0px;overflow: auto;">
    <div style="padding:5px;" id="queryFormDIV">
        <%--查询条件表单模板--%>
        <table class="MetaTermTable" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td width="10%" style="text-align:right;"><%=I18nManager.getItemText(menuId,"RULE_STAT","状态")%>：</td>
                <td width="15%" colspan="3"><div id="ruleState"></div></td>
                <td width="10%" style="text-align:right;"><%=I18nManager.getItemText(menuId,"QUERY_KEY","关键字")%>：</td>
                <td width="40%"><div id="kwd"></div></td>
                <td>
                    <input name="" id="queryBtn" type="button" value="<%=I18nManager.getItemText(menuId,"QUERY_BTN","查 询")%>" class="btn_2" />
                    &nbsp;&nbsp;
                    <input name="" id="newSQLBtn" type="button" value="<%=I18nManager.getItemText(menuId,"ADD_SQL_SERVICE","新增SQL服务")%>" class="btn_6" />
                    &nbsp;&nbsp;
                    <input name="" id="newJARBtn" type="button" value="<%=I18nManager.getItemText(menuId,"ADD_JAR_SERVICE","新增JAR服务")%>" class="btn_6" />
                    &nbsp;
                </td>
            </tr>
        </table>
    </div>
    <div style="min-height:200px;min-width:800px;border-top:1px solid #D0E5FF;left:0px;bottom: 0px;right: 0px;" id="dataDiv">
    </div>
</div>
<div id='ruleAuthDIV' style="display:none;">
    <table style="margin: 5px;">
        <tr>
            <td>
                <div style="margin:5px 0;">待选用户</div>
                <div style="width:290px;height:300px;" id="leftDIV"></div>
            </td>
            <td style="text-align:center;vertical-align:middle;">
                <div><img id="_rightMove" title="右移" style="width: 20px;height: 20px; margin:10px;" src="<%=rootPath%>/meta/resource/images/arrow_right.png "></div>
                <div><img id="_leftMove" title="左移" style="width: 20px;height: 20px;margin:5px 10px;" src="<%=rootPath%>/meta/resource/images/arrow_left.png "></div>
                <div><img id="_allRightMove" title="全部右移" style="width: 20px;height: 20px;margin:5px 10px;" src="<%=rootPath%>/meta/resource/images/arrow_right_double.png "></div>
                <div><img id="_allLeftMove" title="全部左移" style="width: 20px;height: 20px;margin:5px 10px;" src="<%=rootPath%>/meta/resource/images/arrow_left_double.png "></div>
            </td>
            <td>
                <div style="margin:5px 0;">已选用户</div>
                <div style="width:290px;height:300px;" id="rightDIV"></div>
            </td>
        </tr>
        <tr>
            <td colspan="3" style="text-align:center;padding-top:10px;">
                <input type="button" class="btn_2" id="saveBtn" value="保存">
                <input type="button" class="btn_2" id="calBtn" value="取消">
            </td>
        </tr>
    </table>
</div>
<div id='testRuleDiv' style="display:none;padding:1px;height: 100%;overflow-x: hidden; overflow-y: auto;">
    <table class="c_table" border="0" cellpadding="0" cellspacing="0" >
        <tr>
            <th class="c_br_td c_tb_bg">参数名</th>
            <th class="c_b_td c_tb_bg">参数默认值</th>
        </tr>
        <tr>
            <td colspan="2">
            <div id="testParamInfoDiv">
            </div>
            </td>
        </tr>
        <tr>
            <th class="c_br_td c_tb_bg">调试信息：</th>
            <td class="c_b_td"><textarea rows="6" readOnly="readOnly" id="message" style="width: 90%"></textarea></td>
        </tr>
        <tr>
            <td colspan="3" style="text-align:center;padding-top:10px;">
                <input type="button" class="btn_2" id="testBtn" value="测试">
            </td>
        </tr>
    </table>
</div>

<%@include file="ruleManager.jsp"%>
<%@include file="ruleManagerView.jsp"%>
</body>
</html>