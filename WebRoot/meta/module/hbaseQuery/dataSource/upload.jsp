<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page import="org.apache.poi.util.StringUtil" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<%@include file="../../../public/header.jsp" %>
<%
    String msg = "";
    String accRealName = "";
    String accShowName = "";
    String isReLoad = request.getParameter("isReLoad");
    if(isReLoad != null && isReLoad.endsWith("true")) {
        accRealName=(String)request.getAttribute("accRealName");
        request.getParameter("accRealName");
        accShowName=(String)request.getAttribute("accShowName");
        msg =(String) request.getAttribute("errorMsg");
    }
%>
<html>
<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/RequirementAccUpLoad.js"></script>
    <style type="text/css">
        html{
            width:100%;
            height:100%;
        }
        *{ margin:0; padding:0; font-size:12px;}
        .tb{ border:0px solid #d0e4fd; border-bottom:none; margin:0 auto; width:300px;}
        .rb_td{ border-bottom:1px solid #d0e4fd;border-right:1px solid #d0e4fd; background:#e7f5fe; text-align:right; padding-right:0; height:25px; width:15% ;line-height:25px;}
        .b_td{ border-bottom:0px solid #d0e4fd;text-align:left; padding-left:5px; height:25px; line-height:25px;}
    </style>
</head>
<body style='width:100%;height:100%;background: #ffffff;'>
<div id ="jarInfo" style=" height:64px;overflow-y:hidden;">
    <form enctype="multipart/form-data" action='<%=rootPath %>/upload?fileUploadCalss=com.ery.meta.module.hBaseQuery.RequireAccUpLoad' id="_uploadForm" method="post">
        <table id='jarInfoTable' style="width:100%;" class='tb' border="0" cellpadding="0" cellspacing="0">
            <tr id="uploadTr">
                <td class="b_td" style="width:30%">
                    <div><input style="width:150px;height:20px; border: 1px solid #88afe8;" class="dhxlist_txt_textarea"  name="fileName" id="_fileName" type="file"/></div>
                </td>
                <td>
                    <div id="btn" style="padding:4px;" >
                        <input type="submit" name="sub" id="upLoadButton" value="上传" class="btn_2"/>
                        <input type="button" id="clearAcc" value="清除"  class="btn_2"/>

                    </div>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <span id="accName" style="position: relative;top:5px;left:5px;"></span>
                    <span id="msgContent"style="color: red;position: relative;top:5px;left:5px;"></span>
                </td>
            </tr>
        </table>
    </form>
</div>
</body>
<script type="text/javascript">
    function pageInit() {
        $("clearAcc").style.display = "none";
        var msg = '<%=msg%>';
        if(msg && msg != 'null'){
            if(msg == "附件上传成功！"){
                $("upLoadButton").style.display = "none";
                $("clearAcc").style.display = "";
                $("_fileName").disabled = true;
                $("msgContent").innerText = msg;
            } else {
                $("msgContent").innerText = msg;
            }
        }
        var isReLoad = '<%=isReLoad%>';
        var accRealName1 = '<%=accRealName%>';
        var accShowName1 = '<%=accShowName%>';
        if(isReLoad && isReLoad != 'null' && msg == "附件上传成功！"){
            window.parent.accRealName = accRealName1; //如果存在值则不赋值，存在值的可能是为修改并且有附件
            window.parent.accShowName = accShowName1;
        }

        $("clearAcc").onclick = function() {
            if(window.parent.accRealName == null || window.parent.accRealName == "") {
                return;
            }
            window.parent.accRealName = null; //如果存在值则不赋值，存在值的可能是为修改并且有附件
            window.parent.accShowName = null;
            $("upLoadButton").style.display = "";
            $("clearAcc").style.display = "none";
            window.location.href = '<%=rootPath%>/meta/module/hbaseQuery/dataSource/upload.jsp';
        }
        if(window.parent.accShowName && window.parent.accShowName != 'null'){
            $("upLoadButton").style.display = "none";
            $("clearAcc").style.display = "";
            var text =  window.parent.accShowName.length > 15 ? window.parent.accShowName.substr(0,35)+"..." : window.parent.accShowName ;
            $("accName").innerText = text;
            $("_fileName").disabled = true;
            $("accName").title =  window.parent.accShowName;
        }
    }
    dhx.ready(pageInit);
</script>
</html>