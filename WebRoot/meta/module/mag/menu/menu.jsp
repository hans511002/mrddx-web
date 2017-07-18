<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<%@include file="../../../public/head.jsp"%>
<html  lang="en" xml:lang="en">
<%--作者:张伟--%>
<%--时间:2011-09-15--%>
<%--描述:菜单主JSP--%>
<head>
    <title>菜单管理</title>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MenuAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MenuUserAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MenuRoleAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/DeptAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/ZoneAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/StationAction.js"></script>
    <script type="text/javascript" src="menu.js"></script>
    <style type="text/css">
        .blockStyle{
            font-size:12px;
            height:22px;
            margin-top:0px;
            width:500px;
            *padding:5px;
        }


        .queryItem *{
            padding: 0px;
            margin: 0px;
            float: left;
            display:block;
        }

        .checkBox{
            margin-left:3px;
            margin-top:5px;
            height:22px;

        }
        .inputStyle{
            margin-top:5px;
            margin-left:3px;
        }
        .radioStyle{
            margin-left:-5px;
        }
        .queryInput{
            margin-left:-15px;
        }
    </style>
</head>
<body style="height: 100%;width: 100%">
<form action="" id="_itemForm" style="width:100%;height: 100%">
    <div style="height: 100%; width:100%; ">
        <%--表头DIV--%>
        <div style="width:100%;" class="gridbox" id="_itemTableDiv">
            <div style="width: 100%; overflow-x: hidden; overflow-y: hidden; position: relative; height: 30px; "
                 class="xhdr">
                <table cellpadding="0" cellspacing="0" style="width: 100%;height: 100%; table-layout: fixed;" class="hdr" id="_itemHeadTable">
                    <tbody>
                    <tr style="height: 0px; ">
                        <%--定义表头列宽--%>
                        <th style="height: 0px; " nowrap></th>
                        <th style="height: 0px; " nowrap></th>
                    </tr>
                    <tr>
                        <td style="text-align: center;" nowrap>原文本名</td>
                        <td style="text-align: center; line-height:22px;" nowrap>文本名</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <%--表体内容--%>
            <div style="width: 100%; height: 310px; overflow-y: scroll;overflow-x: hidden" class="objbox" id="_itemContentDiv">
                <table cellpadding="0" cellspacing="0" style=" width: 100%;height: auto; table-layout: fixed;" class="obj" id="_itemContentTable">
                    <tbody id="_itemContentBody">
                    <%--定义表体列宽--%>
                    <tr style="height: 0px; ">
                        <th style="height: 0px; " nowrap></th>
                        <th style="height: 0px; " nowrap></th>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</form>
<form action="localPost.jsp" id="_resourceForm" enctype="multipart/form-data" method="post" style="width:100%;height: 100%">
    <div style="height: 100%; width:100%; ">
        <%--表头DIV--%>
        <div style="width:100%;" class="gridbox" id="_resourceTableDiv">
            <div style="width: 100%; overflow-x: hidden; overflow-y: hidden; position: relative; height: 30px; "
                 class="xhdr">
                <table cellpadding="0" cellspacing="0" style="width: 100%;height: 100%; table-layout: fixed;" class="hdr" id="_resourceHeadTable">
                    <tbody>
                    <tr style="height: 0px; ">
                        <%--定义表头列宽--%>
                        <th style="height: 0px; width: 25%;" nowrap></th>
                        <th style="height: 0px; width: 75%;" nowrap></th>
                    </tr>
                    <tr>
                        <td style="text-align: center;width: 25%;" nowrap>原图片</td>
                        <td style="text-align: center; line-height:22px;width: 75%;" nowrap>图片</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <%--表体内容--%>
            <div style="width: 100%; height: 310px; overflow-y: scroll;overflow-x: hidden" class="objbox" id="_resourceContentDiv">
                <table cellpadding="0" cellspacing="0" style=" width: 100%;height: auto; table-layout: fixed;" class="obj" id="_resourceContentTable">
                    <tbody id="_resourceContentBody">
                    <%--定义表体列宽--%>
                    <tr style="height: 0px; ">
                        <th style="height: 0px; width: 25%;" nowrap></th>
                        <th style="height: 0px; width: 75%;" nowrap></th>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</form>
</body>
</html>