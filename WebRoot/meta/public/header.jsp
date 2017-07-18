<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" pageEncoding="UTF-8" %>
<%@ page import="java.util.Enumeration" %>
<%@ page import="com.ery.meta.common.JsonUtil" %>
<%@ page import="java.util.HashMap" %>
<%@ page import="com.ery.meta.module.mag.login.LoginConstant" %>
<%@ page import="com.ery.meta.common.Constant" %>
<%@ page import="com.ery.meta.module.mag.user.UserConstant" %>
<%@ page import="com.ery.meta.web.session.SessionManager" %>
<%@page import="com.ery.base.support.utils.Convert"%>
<%@ page import="com.ery.meta.sys.i18n.I18nManager"%>
<%@ page import="java.net.URLDecoder" %>
<%
	response.addHeader("X-XSS-Protection","0");
    response.setHeader("Pragma", "No-cache");
    response.setHeader("Cache-Control", "no-cache");
    response.setDateHeader("Expires", 0);
    String rootPath = request.getContextPath();
    String menuStr = URLDecoder.decode(Convert.toString(request.getParameter("menuId"),""),"UTF-8");
    int menuId = Convert.toInt(menuStr,-999);
%>
<META HTTP-EQUIV="Pragma" CONTENT="no-cache">
<META HTTP-EQUIV="Cache-Control" CONTENT="no-cache">
<META HTTP-EQUIV="Expires" CONTENT="0">
<%--<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE8"/>--%>
<META HTTP-EQUIV="X-UA-COMPATIBLE" CONTENT="IE=EDGE" >
<script type="text/javascript">
    var menuId = '<%=menuId%>';
    var menuStr = '<%=menuStr%>';
    //此段JS用于通知父窗体做些初始化的动作。
    var win = window.parent;
    if (win&&win.globalInit) {//如果是弹出窗口
        win.globalInit(window, '<%=menuId%>');
    }
</script>
<link rel="stylesheet" type="text/css" href="<%=rootPath%>/meta/resource/dhtmlx/dhtmlx.css">
<%--公共验证CSS--%>
<link type="text/css" rel="stylesheet" href="<%=rootPath%>/meta/resource/css/validation.css">
<link type="text/css" rel="stylesheet" href="<%=rootPath%>/meta/resource/css/icon.css">
<link type="text/css" rel="stylesheet" href="<%=rootPath%>/meta/resource/css/meta.css">
<link type="text/css" rel="stylesheet" href="<%=rootPath%>/css/meta_common.css">
<%--公共JS文件导入--%>
<script type='text/javascript' src='<%=rootPath%>/role.js?menuId=<%=menuId%>'></script>
<script type='text/javascript' src='<%=rootPath%>/dwr/engine.js'></script>
<script type='text/javascript' src='<%=rootPath%>/dwr/util.js'></script>
<script type="text/javascript" src="<%=rootPath%>/meta/resource/dhtmlx/dhtmlx.js"></script>
<%--<script type="text/javascript" src="<%=rootPath%>/meta/pro_test/dhtmlxcalendar.js"></script>--%>
<script type="text/javascript" src="<%=rootPath%>/js/common/Basic.js"></script>
<script type="text/javascript" src="<%=rootPath%>/js/common/BaseObjExtend.js"></script>
<script type="text/javascript" src="<%=rootPath%>/js/common/DestroyCtrl.js"></script>
<script type="text/javascript" src="<%=rootPath%>/js/common/DHTMLXFactory.js"></script>
<script type="text/javascript" src="<%=rootPath%>/js/common/OPBaseObj.js"></script>
<script type="text/javascript" src="<%=rootPath%>/js/common/Valid.js"></script>
<script type="text/javascript" src="<%=rootPath%>/js/control/basectrl.js"></script>
<script type="text/javascript" src="<%=rootPath%>/js/control/termControl.js"></script>
<%--<script type="text/javascript" src="<%=rootPath%>/meta/public/component/termControl_tree.js"></script>--%>
<script type="text/javascript" src="<%=rootPath%>/js/control/DhtmlExtend.js"></script>
<script type="text/javascript" src="<%=rootPath%>/js/common/Tool.js"></script>
<script type="text/javascript" src="<%=rootPath%>/js/bus/commonbus.js"></script>
<script type="text/javascript" src="<%=rootPath%>/js/control/dhtmlxMessage.js"></script>
<script type="text/javascript" src="<%=rootPath%>/js/control/dhtmlx_i18n_zh.js"></script>
<script type="text/javascript" src="<%=rootPath%>/meta/resource/js/commonFormater.js"></script>
<script type="text/javascript" src="<%=rootPath%>/dwr/interface/SessionManager.js"></script>
<script type="text/javascript" src="<%=rootPath%>/dwr/interface/TermControlAction.js"></script>
<style type="text/css">
    body {
        overflow:hidden;
        margin:0;padding:0;
    }
</style>
<script type="text/javascript">
    var faqPathUrl = '<%=!"".equals(LoginConstant.FAQ_PATH)?LoginConstant.FAQ_PATH:rootPath%>';
    var showFaqFlag = <%=LoginConstant.SHOW_FAQ_FLAG%>;
    var getSkin = function () {
        // 根据session中的skin配置获取用户的皮肤设置。
        return "dhx_skyblue";
    };
    var getDefaultImagePath = function () {
        return "<%=rootPath%>/meta/resource/dhtmlx/imgs/";
    };
    var getBasePath = function () { //获取根目录
        return "<%=rootPath%>";
    };
    dhtmlx.image_path = getDefaultImagePath();
    dhtmlx.skin = getSkin();
    /*
     JS全局常量定义区，以global开头
     */
    var global = new Object();
    //常量定义
    global.constant = new Object();
    //默认管理员ID
    global.constant.adminId =<%=UserConstant.ADMIN_USERID%>;
    //默认系统ID
    global.constant.defaultSystemId =<%=Constant.DEFAULT_META_SYSTEM_ID%>;
    //默认系统根节点
    global.constant.defaultRoot =<%=Constant.DEFAULT_ROOT_PARENT%>;

    //当前登录用户id
    <%--global.constant.userId = <%=SessionManager.getCurrentUserID(session.getId())%>;--%>

    //for Ie7、IE6 在框架下获取其offsetWidth为0的BUG,重新设置body高和宽。
    var resizeHandler = function () {
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        var div = dhx.html.create('div');
        div.style.position = 'absolute';
        div.style.left = '0px';
        div.style.top = '0px';
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.zIndex = '-10000';
        //div.style.border='1px solid red';
        document.body.appendChild(div);
        document.body.style.width = div.clientWidth;
        document.body.style.height = div.clientHeight;
        document.body.removeChild(div);
    };

    dhx.ready(function () {
        if (dhx.env.isIE) {
//            resizeHandler();
            if (window.self == top) {
//                window.onresize = resizeHandler;
            }
        }
    });
    if (!getSessionAttribute) {
        var _sessionInfo = {};
        var getSessionAttribute = function (attr, realTime) {
            if (realTime || !_sessionInfo[attr]) {
                SessionManager.getAttribute(attr, {async:false, callback:function (data) {
                    _sessionInfo[attr] = data;
                }
                })
            }
            return _sessionInfo[attr];
        };
    }
    /**
     *  url编码
     * @param winUrl
     */
    var urlEncode = function (winUrl) {
        var getSessionAttribute = window.getSessionAttribute || window.parent.getSessionAttribute;
        var user = getSessionAttribute('user');
        if (winUrl.toLowerCase().indexOf("http://") == -1) {
            //加入权限标识
            var strKey = Tools.base64encode(user.userId + user.userPass);
            winUrl = Tools.trim(winUrl) + (winUrl.indexOf("?") == -1 ? "?" : "&") + "_strKey_=" + strKey;
        }
        return winUrl;
    };

    //取消DWR默认异常处理，抛出异常便于JS调试
    dwr.engine.setErrorHandler(function (errorMsg, error) {
        dhx.closeProgress();
        if(error.message=='Failed to read input'&&error.name=='org.directwebremoting.extend.ServerExceptionmessage'){
            alert('连接超时,请稍微重试！');
        }else{
            throw error;
        }
    });
    var ready = dhx.ready;
    dhx.ready = function () {
        ready.apply(this, arguments);
        if (typeof arguments[0] == 'function') {
            arguments = null;
        }
        //执行权限
        window.roleFilter && ready.call(this, window.roleFilter);
        window.roleFilter = null;
        dhx.env.isIE && CollectGarbage();
    };
/**
  *判断数组中是否存在某元素		
  **/    
Array.prototype.in_array = function(e) 
{ 
    for(i=0;i<this.length;i++)
    {
        if(this[i] == e)
        return true;
    }
    return false;
}

 /**
   * 对字符串去空格
  **/
String.prototype.Trim = function() 
{ 
	return this.replace(/(^\s*)|(\s*$)/g, ""); 
} 
String.prototype.LTrim = function() 
{ 
	return this.replace(/(^\s*)/g, ""); 
} 
String.prototype.RTrim = function() 
{ 
	return this.replace(/(\s*$)/g, ""); 
} 


    //var openMenu = window.parent.openMenu;
</script>
<script type="text/javascript" src="<%=rootPath%>/meta/resource/js/constant.js"></script>