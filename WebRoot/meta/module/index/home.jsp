<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<%@page import="com.ery.base.support.utils.Convert"%>
<%@page import="java.util.Map"%>
<%@page import="com.ery.meta.module.mag.menu.MenuCommon"%>
<%@page import="com.ery.meta.module.mag.login.LoginConstant"%>
<%@page import="com.ery.base.support.utils.*"%>
<%@page import="com.ery.meta.web.session.SessionManager"%>
<%
	response.setHeader("Pragma","No-cache"); 
	response.setHeader("Cache-Control","no-cache"); 
	response.setDateHeader("Expires", 0); 
	
    String rootPath = request.getContextPath();
    
    
    Map<String,Object> sysInfo=(Map<String,Object>)session.getAttribute(LoginConstant.SESSION_META_SYSTEM_INFO);
    //如果已经定义一个框架URl，跳转到指定的URL，否则默认为元数据管理系统URl。
    String frameUrl= MapUtils.getString(sysInfo,"frameUrl");
    if(frameUrl!=null&&!"".equals(frameUrl)){
        response.sendRedirect(MenuCommon.urlMacroDeal(frameUrl,request.getContextPath(),session));
    }else{
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN" dir="ltr">
  <head>
    
    <title> 企业级大数据平台</title>
    
	<meta http-equiv="pragma" content="no-cache"/>
	<meta http-equiv="cache-control" content="no-cache"/>
	<meta http-equiv="expires" content="0"/>    
	<link rel="stylesheet" type="text/css" href="<%=rootPath%>/meta/resource/dhtmlx/dhtmlx.css"/>
	<script type='text/javascript' src='<%=rootPath%>/dwr/engine.js'></script>
	<script type='text/javascript' src='<%=rootPath%>/dwr/util.js'></script>
	<script type="text/javascript" src="<%=rootPath%>/meta/resource/dhtmlx/dhtmlx.js"></script>
	<script type="text/javascript" src="<%=rootPath%>/dwr/interface/LoginAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MenuAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MenuVisitLogAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/SessionManager.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/meta/resource/js/tool.js"></script>
	<style>
		.min-width{
			min-width: 1024px;
		}
		
		.min-height{
			min-height: 600px;
		}
        html, body {
             width: 100%;
             height: 100%;
             overflow-x:auto;
             overflow-y:hidden;
             min-width: 1024px;
             min-height: 600px;
        }
        *{
           padding: 0px;
           margin: 0px;
           font-size: 12px;
        }
        #nav{
           background: url('<%=rootPath%>/meta/resource/images/title-bg.gif');
           padding-left:10px;
           height: 42px;
           padding: 0px;
           margin: 0px;
           margin-top:2px;
           padding-left: 10px;
        }

        #navUl{
            height: 40px;
            padding:0px;
            margin:0px;
            vertical-align:middle;
            list-style: none;
        }
        #navUl li{
            float:left;
            padding:0px;
            margin:0px;
            text-align:center;
            padding-top:5px;
            padding-right:5px;
            height:38px;
            width:110px;
            display:block;
            background: url('<%=rootPath%>/meta/resource/images/menu-line.png') no-repeat;
            background-position: right;
        }

        #navUl li a{
            text-align:left;
            text-decoration: none;
            font-family:"黑体";
            font-size: 14px;
            color: black;
            width:100px;
            height:38px;
            float: right;
            border: none;
        }
        
        #navUl li a img{
        	border:none;
        }

        #_menu_toolbar{
            position:relative;
            right:10px;
            width:500px;
            top:10px;
            vertical-align:middle;
        }

        #_menu_toolbar a{
            text-decoration: none;
            font-size: 14px;
            color: black;
        }

        #_menu_toolbar a span{
            padding:0px;
            margin:0px;
            height:100%;
        }

        #_menu_toolbar a img{
            padding:0px;
            margin:0px;
            padding-left: 0px;
            padding-right: 0px;
            width: 24px;
            height: 24px;
            border: none;
        }
    </style>
    <script type="text/javascript">
    	var systemId = <%=SessionManager.getUser(session.getId()).getGroupID()%>;
    	var rootPath = '<%=rootPath%>';
    	dhtmlx.image_path = "<%=rootPath%>/meta/resource/dhtmlx/imgs/";
    	
    	function getBasePath(){
    		return rootPath;
    	}
    </script>
	<script type="text/javascript" src="home.js"></script>
  </head>
  
  <body>
  		<div class="min-width" style="overflow: hidden;background-color: #A6C8ED;left:0px;bottom:0px;background-image: url('<%=rootPath%>/meta/resource/images/logo.jpg');background-repeat: no-repeat;"  id="north"  >
		    <div style="height: 45px;" class="min-width" align="right">
		        <div id="_menu_toolbar" valign="middle">
		            <a>
		                <img src="<%=rootPath%>/meta/resource/images/change-system.png" alt="" align="middle"/>
		                <span>切换系统：
		                	<select id="systemSelect" onchange="systemChange()" style="height: 20px;width: 120px;"></select>
		                </span>
		            </a>
		            &nbsp;
		            <a href="javascript:showMyFavorite()">
		                <img src="<%=rootPath%>/meta/resource/images/premium.png" alt="" align="middle"/>
		                <span>我的收藏</span>
		            </a>
		            &nbsp;
		            <a href="javascript:showEditPassDialog()">
		                <img src="<%=rootPath%>/meta/resource/images/edit-password.png" alt="" align="middle"/>
		                <span>修改密码</span>
		            </a>
		            &nbsp;
		            <a href="javascript:logout()">
		                <img src="<%=rootPath%>/meta/resource/images/logout.png" alt="" align="middle"/>
		                <span>退出系统</span>
		            </a>
		        </div>
		    </div>
		    <div id="nav" class="min-width">
		        <ul id="navUl">
		        </ul>
		    </div>
		</div>
		<div  class="min-width" style="position: absolute;top: 88px;bottom: 0px;left: 0px;right: 0px;padding: 0px;margin: 0px;" >
			<div id="tabbar" style="position:absolute;width:100%;height:100%;top:0px;bottom: 0px;left: 0px;right: 0px;padding: 0px;margin: 0px;"></div>
		</div>
		<iframe src="refreshOnline.jsp" width="0px" style="width:0;height: 0;display: none " frameborder="0" id="refreshFrame" name="refreshFrame"></iframe>
  </body>
</html>
<<script type="text/javascript">
	/**
     * 根据菜单数据配置处理URL信息。
     * @param url
     * @param userAttr 用户属性字符串。
     */
    var doUrlDeal=function(url){
        var user=getSessionAttribute("user");
        var zone=getSessionAttribute("zoneInfo");
        var dept=getSessionAttribute("deptInfo");
        var station=getSessionAttribute("stationInfo");
        var winUrl = url;
        //检测url,如果不是以http开头的，默认是本系统路径
        if (winUrl) {
            if (winUrl.toLowerCase().indexOf("http://") == -1){
                winUrl = getBasePath() +  (winUrl.substr(0,1)=="/"?"":"/") + winUrl;
            }
            //替换宏变量
            winUrl=winUrl.replace(/(\w+)=\[(([0-9a-zA-Z]+):)?(\w+)\]/g,function($0,$1,$2,$3,$4){
                if(!$3||$3.toLowerCase()=="<%=LoginConstant.URL_MARCO_USER%>"){//用户属性
                    return $1+"="+encodeURIComponent(user[Tools.tranColumnToJavaName($4)]);
                }else if($3.toLowerCase()=="<%=LoginConstant.URL_MARCO_ZONE%>"){
                    return $1+"="+encodeURIComponent(zone[Tools.tranColumnToJavaName($4)]);
                }else if($3.toLowerCase()=="<%=LoginConstant.URL_MARCO_DEPT%>"){
                    return $1+"="+encodeURIComponent(dept[Tools.tranColumnToJavaName($4)]);
                }else if($3.toLowerCase()=="<%=LoginConstant.URL_MARCO_STATION%>"){
                    return $1+"="+encodeURIComponent(station[Tools.tranColumnToJavaName($4)]);
                }
            });
        }
        return winUrl;
    }
	
	var showMyFavorite = function(){
	  openMenu("我的收藏","meta/module/mag/favorite/favorite.jsp","top","2012",true);
	};
</script>
<%} %>
