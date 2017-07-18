<%@ page language="java" import="java.util.*" pageEncoding="UTF-8" %>
<%@page import="com.ery.meta.common.Common" %>
<%@ page import="com.ery.meta.module.mag.login.LoginConstant" %>
<%@ page import="com.ery.base.support.utils。MapUtils" %>
<%@ page import="com.ery.meta.module.mag.login.LoginAction" %>
<%@ page import="com.ery.meta.module.mag.login.ILoginType" %>
<%@ page import="com.ery.meta.module.mag.dept.DeptDAO" %>
<%@ page import="com.ery.meta.module.mag.group.GroupDAO" %>
<%@ page import="com.ery.meta.module.mag.menu.MenuDAO" %>
<%@ page import="com.ery.meta.module.mag.station.StationDAO" %>
<%@ page import="com.ery.meta.module.mag.user.UserDAO" %>
<%@ page import="com.ery.meta.module.mag.zone.ZoneDAO" %>
<%@ page import="com.ery.base.support.log4j.LogUtils" %>
<%@ page import="com.ery.base.support.sys.DataSourceManager" %>
<%@ page import="sun.misc.BASE64Encoder" %>
<%@ page import="com.ery.base.support.utils.StringUtils" %>
<%@ page import="java.io.IOException" %>
<%
    String path = request.getContextPath();
    String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + path + "/";
    String userNamecn = request.getParameter("userNamecn");
    String strCode = Common.getEncoding(userNamecn);
    if (request.getHeader("User-Agent").contains("MSIE") || request.getHeader("User-Agent").contains("Firefox")) {
        if(!StringUtils.isEmpty(userNamecn)){
            userNamecn = new String(userNamecn.getBytes(strCode),"GBK");	//google需要使用UTF-8编码
        }
    }else {
        if(!StringUtils.isEmpty(userNamecn)){
            userNamecn = new String(userNamecn.getBytes(strCode),"UTF-8");	//google需要使用UTF-8编码
        }
    }

    String userId = request.getParameter("userId");
    String url = request.getParameter("url");
    String isChannel = request.getParameter("isChannel");
    
    if (StringUtils.isNotEmpty(url)) {
        url = url.toString().replace("$", "&");
        if (url.indexOf("/") == 0) {
            url = url.substring(1);
        }
    } else {
        out.write("参数url为空，跳转失败！");
        return;
    }
    try {
        boolean isLogin = false;
    	if(!StringUtils.isEmpty(userId)){	//用户id
            Map<String, Object> user = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
            if (user != null) {
                if (userId.equals(MapUtils.getString(user, "userId", ""))) {
                    isLogin = true;
                }
            }
            if (!isLogin) {
                //未登录，进行登录
                Map<String, Object> loginData = new HashMap<String, Object>();
                loginData.put("userId", userId);
                loginData.put("session",session);
                //登录
                try {
                    LoginAction loginAction = new LoginAction();
                    loginAction.setDeptDAO(new DeptDAO());
                    loginAction.setGroupDAO(new GroupDAO());
                    loginAction.setMenuDAO(new MenuDAO());
                    loginAction.setStationDAO(new StationDAO());
                    loginAction.setUserDAO(new UserDAO());
                    loginAction.setZoneDAO(new ZoneDAO());
                    ILoginType.LoginResult loginResult = loginAction.login(loginData, "userSyn");
                    if(ILoginType.LoginResult.SUCCESS==loginResult){
                        isLogin = true;
                       // DataAuthHelper.login(Long.parseLong(userId));	加载维度权限数据
                    }
                } catch (Exception e) {
                    LogUtils.error(null, e);
                } finally {
                    DataSourceManager.destroy();
                }
            }
            //登录成功之后获取session数据
            user = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
            if(isLogin && user!=null){
                if("1".equals(isChannel)){
                    session.setAttribute(LoginConstant.IS_CHANNEL,isChannel);
                }
                if (!url.startsWith("http://")) {
                    url = path + "/" + url;
                }
                //加入URl权限表示
                BASE64Encoder encoder = new BASE64Encoder();
                String strKey = encoder.encode((MapUtils.getString(user, "userId") + MapUtils.getString(user, "userPass")).getBytes());
                url = url.trim() + (!url.contains("?") ? "?" : "&") + "_strKey_=" + strKey;
                response.sendRedirect(url);
            }else{
                out.write("未找到用户信息，或则找到多个用户信息无法区分!");
            }
    	}else if(!StringUtils.isEmpty(userNamecn)){	//用户中午名
            Map<String, Object> user = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
            if (user != null) {
            	System.out.println(userNamecn);
                if (userNamecn.equals(MapUtils.getString(user, "userNamecn", ""))) {
                	System.out.println(MapUtils.getString(user, "userNamecn", ""));
                    isLogin = true;
                }
            }
            if (!isLogin) {
                //未登录，进行登录
                Map<String, Object> loginData = new HashMap<String, Object>();
                loginData.put("userNamecn", userNamecn);
                System.out.println(userNamecn);
                loginData.put("session",session);
                //登录
                try {
                    LoginAction loginAction = new LoginAction();
                    loginAction.setDeptDAO(new DeptDAO());
                    loginAction.setGroupDAO(new GroupDAO());
                    loginAction.setMenuDAO(new MenuDAO());
                    loginAction.setStationDAO(new StationDAO());
                    loginAction.setUserDAO(new UserDAO());
                    loginAction.setZoneDAO(new ZoneDAO());
                    ILoginType.LoginResult loginResult = loginAction.login(loginData, "userSyn");
                    if(ILoginType.LoginResult.SUCCESS==loginResult){
                        isLogin = true;
                        // DataAuthHelper.login(Long.parseLong(userId));	//加载维度权限数据
                    }
                } catch (Exception e) {
                    LogUtils.error(null, e);
                } finally {
                    DataSourceManager.destroy();
                }
            }
            //登录成功之后获取session数据
            user = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
            if(isLogin && user!=null){
                if("1".equals(isChannel)){
                    session.setAttribute(LoginConstant.IS_CHANNEL,isChannel);
                }
                if (!url.startsWith("http://")) {
                    url = path + "/" + url;
                }
                //加入URl权限表示
                BASE64Encoder encoder = new BASE64Encoder();
                String strKey = encoder.encode((MapUtils.getString(user, "userId") + MapUtils.getString(user, "userPass")).getBytes());
                url = url.trim() + (!url.contains("?") ? "?" : "&") + "_strKey_=" + strKey;
                response.sendRedirect(url);
            }else{
                out.write("未找到用户信息，或则找到多个用户信息无法区分!");
            }
    	}else{
            out.write("参数userId和userNamecn至少需要存在一个，跳转失败！");
            return;
    	}
    } catch (IOException e) {
        LogUtils.error(null, e);
        out.write("未知错误");
    }
%>
