<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王春生
 * @description 
 * @date 12-5-22
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<html>
<head>
    <title></title>
    <link rel="stylesheet" type="text/css" href="<%=request.getContextPath()%>/meta/resource/dhtmlx/dhtmlx.css">
    <%--公共验证CSS--%>
    <link type="text/css" rel="stylesheet" href="<%=request.getContextPath()%>/meta/resource/css/validation.css">
    <link type="text/css" rel="stylesheet" href="<%=request.getContextPath()%>/meta/resource/css/icon.css">
    <link type="text/css" rel="stylesheet" href="<%=request.getContextPath()%>/meta/resource/css/meta.css">
    <link type="text/css" rel="stylesheet" href="<%=request.getContextPath()%>/css/meta_common.css">
    <%--公共JS文件导入--%>
    <script type='text/javascript' src='<%=request.getContextPath()%>/dwr/engine.js'></script>
    <script type='text/javascript' src='<%=request.getContextPath()%>/dwr/util.js'></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/meta/resource/dhtmlx/dhtmlx.js"></script>
    <%--<script type="text/javascript" src="<%=request.getContextPath()%>/meta/pro_test/dhtmlxcalendar.js"></script>--%>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/common/Basic.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/common/BaseObjExtend.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/common/DestroyCtrl.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/common/DHTMLXFactory.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/common/OPBaseObj.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/common/Valid.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/control/basectrl.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/control/busctrl.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/meta/public/component/termControl.js"></script>
    <%--<script type="text/javascript" src="<%=request.getContextPath()%>/meta/public/component/termControl_tree.js"></script>--%>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/control/DhtmlExtend.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/common/Tool.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/control/dhtmlxMessage.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/control/dhtmlx_i18n_zh.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/meta/resource/js/commonFormater.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/dwr/interface/SessionManager.js"></script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/dwr/interface/TermControl.js"></script>
    <style type="text/css">
        div:hover.def {
            border:
            #FFB552 1px solid;
            padding: 2px;
            padding-bottom: 1px;
            background-image: url('../../meta/resource/dhtmlx/imgs/dhxtoolbar_dhx_skyblue/dhxtoolbar_bg_over.gif');
            background-position: top;
            background-repeat: repeat-x;
        }
        input.gopage{
            cursor: pointer;
            font-size: 12px;
            overflow: hidden;
            padding-bottom: 1px;
            border-radius: 2px;
            color: black;
            border: 1px solid #198EB4;
            background:url('../../meta/resource/images/goButton_icon.jpg') -1px -1px no-repeat;
        }
    </style>
</head>
<body style='width:100%;height:100%;'>
<DIV style="BACKGROUND-COLOR: white; HEIGHT: 27px; OVERFLOW: hidden" dir=ltr id=_pagingArea_EBjuSYKH class=dhx_toolbar_base_dhx_skyblue>
    <DIV class=float_left style="float:right;margin-right:20px;">
        <DIV style="position:relative;margin-top:4px;margin-right:15px;" class=dhx_toolbar_text title="" idd="results">
            <span>
                &nbsp;&nbsp;总记录<span id="">112</span>条&nbsp;
                <span>
                    <SELECT style="height:19px;">
                        <OPTION value=15>15/页</OPTION>
                        <OPTION selected value=20>20/页</OPTION>
                        <OPTION value=25>25/页</OPTION>
                        <OPTION value=30>30/页</OPTION>
                    </SELECT>
                </span>
                &nbsp;当前<span>2</span>/<span>6</span>页&nbsp;&nbsp;&nbsp;
            </span>
        </DIV>
        <DIV class="dhx_toolbar_btn dis" title="" idd="leftabs" allowClick="false" extAction="null" renderAs="dhx_toolbar_btn def" pressed="false">
            <IMG src="/bi-meta/meta/resource/dhtmlx/imgs/ar_left_abs_dis.gif">
        </DIV>
        <DIV class="dhx_toolbar_btn dis" title="" idd="left" allowClick="false" extAction="null" renderAs="dhx_toolbar_btn def" pressed="false">
            <IMG src="/bi-meta/meta/resource/dhtmlx/imgs/ar_left_dis.gif">
        </DIV>
        <DIV class="dhx_toolbar_btn def" title="" idd="right" allowClick="false" extAction="null" renderAs="dhx_toolbar_btn over" pressed="false">
            <IMG src="/bi-meta/meta/resource/dhtmlx/imgs/ar_right.gif">
        </DIV>
        <DIV class="dhx_toolbar_btn def" title="" idd="rightabs" allowClick="false" extAction="null" renderAs="dhx_toolbar_btn over" pressed="false">
            <IMG src="/bi-meta/meta/resource/dhtmlx/imgs/ar_right_abs.gif">
        </DIV>
        <div class="dhx_toolbar_text" style="margin-top:4px;margin-left:15px;">
            <span>
                <span>转到<input style="width:19px;height:13px;line-height:12px;" type="text">&nbsp;页&nbsp;</span>
                <span>
                    <input type="button" class="gopage" style="text-align:center;width:19px;height:18px;line-height:16px;margin-top:1px;">
                </span>
                <%--<img src="/bi-meta/meta/resource/images/goButton_icon.jpg" align="absmiddle" valign="absmiddle" style="margin-top:0;margin-bottom:5px;cursor:pointer;margin-left:5px;">--%>
            </span>
        </div>
    </DIV>
</DIV>

<br>

<DIV style="BACKGROUND-COLOR: white; HEIGHT: 27px; OVERFLOW: hidden" dir=ltr id=_pagingArea_EBjuSYKH class=dhx_toolbar_base_dhx_skyblue>
    <DIV class=float_left style="float:right;margin-right:20px;">
        <DIV style="position:relative;margin-top:4px;margin-right:15px;" class=dhx_toolbar_text title="" idd="results">
            <span>
                &nbsp;&nbsp;总记录<span id="">112</span>条&nbsp;
                <span>
                    <SELECT style="height:19px;">
                        <OPTION value=15>15/页</OPTION>
                        <OPTION selected value=20>20/页</OPTION>
                        <OPTION value=25>25/页</OPTION>
                        <OPTION value=30>30/页</OPTION>
                    </SELECT>
                </span>
                &nbsp;当前<span>2</span>/<span>6</span>页&nbsp;&nbsp;&nbsp;
            </span>
        </DIV>
        <DIV class="dhx_toolbar_btn dis" title="" idd="leftabs" allowClick="false" extAction="null" renderAs="dhx_toolbar_btn def" pressed="false">
            <IMG src="/bi-meta/meta/resource/dhtmlx/imgs/ar_left_abs_dis.gif">
        </DIV>
        <DIV class="dhx_toolbar_btn dis" title="" idd="left" allowClick="false" extAction="null" renderAs="dhx_toolbar_btn def" pressed="false">
            <IMG src="/bi-meta/meta/resource/dhtmlx/imgs/ar_left_dis.gif">
        </DIV>
        <DIV class="dhx_toolbar_btn def" title="" idd="right" allowClick="false" extAction="null" renderAs="dhx_toolbar_btn over" pressed="false">
            <IMG src="/bi-meta/meta/resource/dhtmlx/imgs/ar_right.gif">
        </DIV>
        <DIV class="dhx_toolbar_btn def" title="" idd="rightabs" allowClick="false" extAction="null" renderAs="dhx_toolbar_btn over" pressed="false">
            <IMG src="/bi-meta/meta/resource/dhtmlx/imgs/ar_right_abs.gif">
        </DIV>
        <div class="dhx_toolbar_text" style="margin-top:4px;margin-left:15px;">
            <span style="margin-bottom:2px;">转到<select style="width:60px;height:19px;">
                <option>1页</option>
                <option>200页</option>
            </select></span>
        </div>
    </DIV>
</DIV>
</body>
</html>