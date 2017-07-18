<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 刘弟伟
 * @description 
 * @date 2012-11-19
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<script type="text/javascript" src="/meta/public/code.jsp?types=WS_RULE_DATA_TYPE,WS_RULE_TYPE,RETURN_TYPE"></script>
<script type="text/javascript" src="/dwr/interface/MetaShareWsAction.js"></script>
<script type="text/javascript" src="/meta/module/ws/webService/ruleManagerView.js"></script>

<div id="_ruleWidDIV_View" style="position:relative;width:100%;height:100%;overflow:hidden;display:none;">
    <div style="height:85%;width:100%;" id='ruleTabDIV_View'>
    </div>
    <div id="_ruleRightBottom_View" style="text-align:center;padding-top:10px;" >
       <input name="" id="_CalBtn_View" type="button" value="关 闭" class="btn_2" />
     </div>
</div>
    <div id="sqlInfo_View" STYLE="display: none">
        <table class="MetaFormTable" border="0" cellpadding="0" cellspacing="1">
            <tr>
                <th style="width: 100px;">请选择数据源：</th>
                <td><input type="text"  readOnly="readOnly" id="dataSourceId_View" style="width: 205px;"/></td>
            </tr>
            <tr>
                <th colspan="2"><div align="left">请输入SQL语句，参数使用宏变量形式代替，例如{LOCAL_CODE}：</div></th>
            </tr>
            <tr>
                <td colspan="2"><textarea style="width:632px;height:180px;"  readOnly="readOnly" id="wsSql_View"></textarea></td>
            </tr>
        </table>
    </div>
    <div id="classInfo_View" STYLE="display: none">
        <table class="MetaFormTable" border="0" cellpadding="0" cellspacing="1" >
            <tr>
                <td>JAR包：</td>
                <td><input type="text"  readOnly="readOnly" style="width: 360px;"  id="jarFileId_View" /></td>
            </tr>
            <tr>
                <td>类(Class)：</td>
                <td><input style="width: 360px;"  readOnly="readOnly"  id="className_View" /></td>
            </tr>
        </table>
    </div>
    <div id="paramInfo_View" style="height: 250px; overflow-x: hidden; overflow-y: auto;">

    </div>
    <div id="basicInfo_View" style="display:none;">
        <table class="MetaFormTable" border="0" cellpadding="0" cellspacing="1" width="400px;">
            <tr>
                <th>服务名：</th>
                <td><div id="ruleName_View"> </div></td>
                <th>服务编码：</th>
                <td><div  id="ruleCode_View"></div></td>
            </tr>
            <tr>
                <th>操作类型：</th>
                <td><div id="ruleType_View"></div></td>
                <th>实现类型：</th>
                <td><div id="ruleImplType_View"></div></td>
            </tr>
            <tr>
                <th>创建人：</th>
                <td><div id="userNameCn_View"></div></td>
                <th>创建时间：</th>
                <td><div id="createDate_View"></div></td>
            </tr>
            <tr  id="returnTypeDiv_View"  style="display: none;">
                <th>返回类型：</th>
                <td colspan="3"><div id="returnType_View"></div></td>
            </tr>
            <tr>
                <th>备注：</th>
                <td colspan="3"><div style="width:585px;height:170px;" id="remark_View"></div></td>
            </tr>
        </table>
    </div>

