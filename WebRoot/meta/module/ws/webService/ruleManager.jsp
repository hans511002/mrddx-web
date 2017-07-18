<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 刘弟伟
 * @description 
 * @date 2012-10-29
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<script type="text/javascript" src="/meta/public/code.jsp?types=WS_RULE_DATA_TYPE,RETURN_TYPE,WS_RULE_TYPE"></script>
<script type="text/javascript" src="/dwr/interface/MetaShareWsAction.js"></script>
<script type="text/javascript" src="/meta/module/ws/webService/ruleManager.js"></script>

<div id="_ruleWidDIV" style="position:relative;width:100%;height:100%;overflow:hidden;display:none;">
    <div style="height:85%;width:100%; " id='ruleTabDIV'>
</div>
    <div id="_ruleRightBottom" style="text-align:center;padding-top:10px;" >
        <span id="nextBtnDiv" style="display: none"><input name="" id="nextBtn" type="button" value="下一步" class="btn_2"  /></span>
        <span id="SaveBtnDiv" style="display: none"><input name="" id="_SaveBtn" type="button" value="保 存" class="btn_2"  /></span>
        <span id="CalBtnDiv" style="display: none"><input name="" id="_CalBtn" type="button" value="关 闭" class="btn_2" /></span>
     </div>
</div>
<form action="" id="rule_Form" onsubmit="return false;" >
    <div id="sqlInfo" STYLE="display: none; padding:1px;">
        <table class="MetaFormTable"  border="0" cellpadding="0" cellspacing="1" >
            <tr>
                <th style="width: 100px;">请选择数据源：</th>
                <td><select style="width: 260px;" id="dataSourceId"></select></td>
            </tr>
            <tr>
                <th colspan="2"><div align="left">请输入SQL语句，参数使用宏变量形式代替，例如{LOCAL_CODE}：</div></th>
            </tr>
            <tr>
                <td colspan="2"><textarea style="width:632px;height:180px;" id="wsSql" onblur="createParamGrid_Sql_Add()"></textarea></td>
            </tr>
        </table>
    </div>
    <div id="classInfo" STYLE="display: none; padding:1px;">
        <table class="MetaFormTable"  border="0" cellpadding="0" cellspacing="1" >
            <tr>
                <td>JAR包：</td>
                <td><select  style="width: 360px;" onchange="jarChange(this)" id="jarFileId"></select></td>
            </tr>
            <tr>
                <td>类(Class)：</td>
                <td><select style="width: 360px;"  id="className" onchange="checkClassNameisExist(this)"> </select></td>
            </tr>
        </table>
    </div>
    <div id="paramInfo" style="height: 250px; overflow-x: hidden; overflow-y: auto; padding:1px;">

    </div>
    <div id="basicInfo" style="display:none; padding:1px;">
        <table class="MetaFormTable"  border="0" cellpadding="0" cellspacing="1" width="400px;">
            <tr>
                <th>服务名：</th>
                <td><input type="text" id="ruleName"/></td>
                <th>服务编码：</th>
                <td><input type="text" id="ruleCode" onblur="checkRuleCode()"></td>
            </tr>
            <tr>
                <th>操作类型：</th>
                <td><select id="ruleType"   onchange="setValueChange(this)"></select></td>
                <th>实现类型：</th>
                <td><div  id="ruleImplType" ></div></td>
            </tr>
            <tr id="createInfo" style="display: none">
                <th>创建人：</th>
                <td><div id="userNameCn"></div></td>
                <th>创建时间：</th>
                <td><div id="createDate"></div></td>
            </tr>
            <tr  id="returnTypeDiv"  style="display: none;">
                <th>返回类型：</th>
                <td colspan="3"><select id="returnType"></select></td>
            </tr>
            <tr>
                <th>备注：</th>
                <td colspan="3"><textarea style="width:585px;height:170px;" id="remark"></textarea></td>
            </tr>
        </table>
    </div>
    <div style="overflow-y:auto;display:none;text-align: center;" id="paramDescDiv">
        <input type="hidden" id='paramDescParamName' value=''/>
        <textarea style="height: 150px; width: 370px; margin-top:5px;" id="paramDescTextarea"></textarea>
        <div style="padding-top: 15px;">
            <input name="" id="saveBtn1" type="button" value="确 定" class="btn_2" />
            <input name="" id="calBtn1" type="button" value="关 闭" class="btn_2" />
        </div>
    </div>
</form>