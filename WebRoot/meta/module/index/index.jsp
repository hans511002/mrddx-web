<%@ page import="com.ery.meta.common.Constant" %>
<%@ page import="java.util.Map" %>
<%@ page import="com.ery.base.support.utils.Convert" %>
<%@ page import="com.ery.meta.module.mag.menu.MenuCommon" %>
<%@ page import="com.ery.meta.module.mag.login.LoginConstant" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<%
    Map<String,Object> sysInfo=(Map<String,Object>)session.getAttribute(LoginConstant.SESSION_META_SYSTEM_INFO);
    //如果已经定义一个框架URl，跳转到指定的URL，否则默认为元数据管理系统URl。
    if(sysInfo!=null&&!"".equals(Convert.toString(sysInfo.get("frameUrl")))){
        response.sendRedirect(MenuCommon.urlMacroDeal(Convert.toString(sysInfo.get("frameUrl")),request.getContextPath(),session));
    }else{
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
    <meta http-equiv="description" content="This is my page">
    <%@include file="../../public/head.jsp"%>
    <LINK rel="icon" href="<%=rootPath%>/meta/resource/images/data.ico"  type="image/x-icon">
    <title> 企业级大数据平台</title>
    <style type="text/css">
        *{
            padding: 0px;
            margin: 0px;
        }
        body{
            background-color: #A6C8ED;
        }
        #nav{
            background: url('<%=rootPath%>/meta/resource/images/title-bg.gif');
            padding-left:10px;
            height: 45px;
            padding: 0px;
            margin: 0px;
            margin-top:2px;
            padding-left: 10px;
        }

        #navUl{
            height: 38px;
            padding:0px;
            margin:0px;
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

        #_menu_toolbar{
            position:relative;
            right:10px;
            width:500px;
            top:10px;
            vertical-align:middle;
            display: inline;
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
            font: 12px/1.5em Tahoma, Verdana, Simsun, Microsoft YaHei, Arial Unicode MS, Mingliu, Arial, Helvetica;
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
        table.dhtmlxLayoutPolyContainer_dhx_skyblue td.dhtmlxLayoutPolySplitterHorInactive{
            height: 1px;
            border: none;
        }

        table.dhtmlxLayoutPolyContainer_dhx_skyblue td.dhtmlxLayoutPolySplitterHorInactive div{
            display: none;
        }
        table.dhtmlxLayoutPolyContainer_dhx_skyblue td.dhtmlxLayoutSinglePoly div.dhxcont_global_content_area{
            border: none;
        }
    </style>
    <%
        String systemId=SessionManager.getUser(session.getId()).getGroupID()+"";
        if(systemId==null){//如果系统ID为null，从Session中获取当前用户的默认系统ID
            Map<String,Object> userInfo=(Map<String,Object>)session.getAttribute(LoginConstant.SESSION_KEY_USER);
            systemId=userInfo.get("groupId")==null
                    ?String.valueOf(Constant.DEFAULT_META_SYSTEM_ID):userInfo.get("groupId").toString();
        }

        out.println(
                "<script type=\"text/javascript\">var getSystemId=function(){var systemId='"
                +(systemId==null? Constant.DEFAULT_META_SYSTEM_ID:systemId)+"'; " +
                "return parseInt(systemId||1);}</script>"
        );//打印一段JS代码，用于返回当前systemId
    %>

    <script type="text/javascript">
        var _sessionInfo = {};
        var getSessionAttribute=function(attr,realTime){
            if(realTime||!_sessionInfo[attr]){
                SessionManager.getAttribute(attr,{async:false,callback:function(data){
                    _sessionInfo[attr]=data;
                }
                })
            }
            return _sessionInfo[attr];
        };
        if (window.screen) {//判断浏览器是否支持window.screen判断浏览器是否支持screen
            var myw = screen.availWidth;   //定义一个myw，接受到当前全屏的宽
            var myh = screen.availHeight;  //定义一个myw，接受到当前全屏的高
            try{
                window.moveTo(0, 0);           //把window放在左上脚
                window.resizeTo(myw, myh);     //把当前窗体的长宽跳转为myw和myh
            }catch(e){
            }
            if(window.outerWidth!=screen.availWidth || window.outerHeight!=screen.availHeight){
                window.outerWidth=screen.availWidth;
                window.outerHeight=screen.availHeight;
            }

        }
        /**
         * 根据菜单数据配置处理URL信息。
         * @param url
         * @param userAttr 用户属性字符串。
         */
        var urlDeal=function(url){
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
        var faqPathUrl = '<%=!"".equals(LoginConstant.FAQ_PATH)?LoginConstant.FAQ_PATH:rootPath%>';
        var showFaqFlag = <%=LoginConstant.SHOW_FAQ_FLAG%>;
    </script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/LoginAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAction.js"></script>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/MenuAction.js"></script>
    <script type="text/javascript" src="index.js"></script>
</head>


<body>
<div style="overflow: hidden;background-color: #A6C8ED;left:0px;bottom:0px;background-image: url('<%=rootPath%>/meta/resource/images/logo.jpg');background-repeat: no-repeat;"  id="north"  >
    <div style="height: 45px;" align="right">
        <div id="_menu_toolbar" valign="middle">
            <a>
                <img src="<%=rootPath%>/meta/resource/images/change-system.png" alt="" align="middle"/>
                <span>切换系统：
                	<select id="systemSelect" onchange="systemChange()" style="height: 20px;width: 120px;"></select>
                </span>
            </a>
            &nbsp;
            <a href="#" onclick="showMyFavorite()">
                <img src="<%=rootPath%>/meta/resource/images/premium.png" alt="" align="center"/>
                <span>我的收藏</span>
            </a>
            &nbsp;
            <a href="#" onclick="showEditPassDialog()">
                <img src="<%=rootPath%>/meta/resource/images/edit-password.png" alt="" align="center"/>
                <span>修改密码</span>
            </a>
            &nbsp;
            <a href="javascript:logout()">
                <img src="<%=rootPath%>/meta/resource/images/logout.png" alt="" align="center"/>
                <span>退出系统</span>
            </a>
            &nbsp;
            <a id='showFaqA' href="javascript:showFaq()">
                <img src="<%=rootPath%>/meta/resource/images/disableUser.png" alt="" align="center">
                <span>问题收集</span>
            </a>
        </div>
    </div>
    <div id="nav">
        <ul id="navUl">
        </ul>
    </div>
    <iframe src="refreshOnline.jsp" width="0px" style="width:0;height: 0;display: none " frameborder="0" id="refreshFrame" name="refreshFrame"></iframe>
</div>
</body>
</html>
<%}%>