
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<% String rootPath = request.getContextPath();
%>
<html>
<head>
<link rel="stylesheet" type="text/css" href="<%=request.getContextPath()%>/meta/resource/dhtmlx/dhtmlx.css">
<style type="text/css">
body
{
	margin-top: 0px;
	margin-right: 0px;
	margin-bottom: 0px; 
	margin-left: 0px; 
	padding-top: 0px; 
	padding-right: 0px; 
	padding-bottom: 0px; 
	padding-left: 0px; 
	border-color:#808080 #FFFFFF #FFFFFF #808080; 
	border-style:none; 
	border-top-width: 0px; 
	border-right-width: 0px; 
	border-bottom-width: 0px; 
	border-left-width: 0px;
	font-family: "Arial", "宋体";
	font-size: 12px;
	SCROLLBAR-FACE-COLOR: menu; 
    SCROLLBAR-HIGHLIGHT-COLOR: menu; 
    SCROLLBAR-SHADOW-COLOR: #999999; 
    SCROLLBAR-3DLIGHT-COLOR: #777777; 
    SCROLLBAR-ARROW-COLOR: #ffffff;  
    SCROLLBAR-TRACK-COLOR: #dddddd; 
    SCROLLBAR-DARKSHADOW-COLOR: menu;
    height: 100%;
    width: 100%;
    
}
</style>
<script type="text/javascript" src="<%=rootPath%>/meta/public/reportDesign/js/dhtmlx/dhtmlxcommon.js"></script>
<script type="text/javascript" src="<%=rootPath%>/meta/resource/dhtmlx/dhtmlx.js"></script>

<script type='text/javascript' src='<%=rootPath%>/dwr/engine.js'></script>
<script type='text/javascript' src='<%=rootPath%>/dwr/util.js'></script>
<script type="text/javascript" src="<%=rootPath%>/dwr/interface/TermControl.js"></script>
<script type="text/javascript" src="../../../js/control/DhtmlExtend.js"></script>
<link rel="stylesheet" href="js/dhtmlx/dhtmlx.css" type="text/css"></link>
<script type="text/javascript" src="../../../js/common/Basic.js"></script>
<script type="text/javascript" src="../../../js/common/BaseObjExtend.js"></script>
<script type="text/javascript" src="../../../js/common/Valid.js"></script>
<script type="text/javascript" src="../../../js/common/OPBaseObj.js"></script>
<script type="text/javascript" src="../../../js/common/json.js"></script>
<script type="text/javascript" src="../../../js/common/helptip.js"></script>
<script type="text/javascript" src="../../../js/common/drag.js"></script>
<script type="text/javascript" src="../../../js/common/DestroyCtrl.js"></script>
<script type="text/javascript" src="../../../js/common/DHTMLXFactory.js"></script>
<script type="text/javascript" src="../../../js/common/cookie.js"></script>
<script type="text/javascript" src="../../../js/control/busctrl.js"></script>
<script type="text/javascript" src="../../../js/control/basectrl.js"></script>

<script type="text/javascript" src="termControl.js"></script>


<script type="text/javascript" src="termControl_tree.js"></script></head>
<body style="overflow:auto;padding:0px;margin:0px;">
<div id="a" style="width:200px;height: 20px;top:0px;position: relative;">a</div>
<div id="b" style="width:200px;height: 20px;top:100px;position: relative;">b</div>
 <div id="e" style="width:200px;height: 20px;top:200px;left:10px;position: relative;">e</div>
 <div id="f" style="width:200px;height: 20px;top:200px;left:300px;position: relative;">f</div>
<div id="c" style="width:200px;height: 20px;top:250px;left:400px;position: relative;">c</div>
 <div id="d" style="width:200px;height: 20px;top:300px;position: relative;">d</div>

<div id=debugDiv style="width: 1000px;height:200px;top:500px;position: relative;"></div>

<input value="button" type=button onclick="if(box.style.display=='')box.style.display='none';else box.style.display=''; "/>
</body></html>
<script>
var debug=true;
var getSkin = function () {
           // 根据session中的skin配置获取用户的皮肤设置。
           return "dhx_skyblue";
        }
var getDefaultImagePath = function () {
    return "<%=request.getContextPath()%>/meta/resource/dhtmlx/imgs/";
}
if(debug)$("debugDiv").style.display="";
function Debug(msg)
{
	if(debug)
	{
		if(typeof msg=="string" || typeof msg=="number")
			debugDiv.innerHTML=msg+"<br/>"+debugDiv.innerHTML;
		else
		{
			if(typeof msg=="object")
			{
				if(msg.sort)
					debugDiv.innerHTML=msg+"<br/>"+debugDiv.innerHTML;
				else
				{
					for(var obj in msg)
						debugDiv.innerHTML=obj+":"+msg[obj]+"<br/>"+debugDiv.innerHTML;
				}
			}
		}
	}
}
</script>
<script type="text/javascript" src="<%=rootPath%>/meta/public/component/termTest.js"></script>
