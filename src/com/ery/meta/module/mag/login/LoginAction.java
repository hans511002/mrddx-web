package com.ery.meta.module.mag.login;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpSession;

import org.directwebremoting.WebContextFactory;

import com.ery.meta.common.Common;
import com.ery.meta.common.Constant;
import com.ery.meta.module.mag.dept.DeptDAO;
import com.ery.meta.module.mag.group.GroupDAO;
import com.ery.meta.module.mag.menu.MenuCommon;
import com.ery.meta.module.mag.menu.MenuDAO;
import com.ery.meta.module.mag.station.StationDAO;
import com.ery.meta.module.mag.user.UserConstant;
import com.ery.meta.module.mag.user.UserDAO;
import com.ery.meta.module.mag.zone.ZoneDAO;
import com.ery.meta.web.session.SessionContext;
import com.ery.meta.web.session.SessionManager;
import com.ery.meta.web.session.User;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.utils.MapUtils;
import com.ery.base.support.utils.StringUtils;

/**

 * 

 * @description 登录控制Action <br>
 * @date 2011-09-22
 */
public class LoginAction {

	/**
	 * 用户DAO
	 */
	private UserDAO userDAO;

	private MenuDAO menuDAO;

	private GroupDAO groupDAO;

	private ZoneDAO zoneDAO;

	private DeptDAO deptDAO;

	private StationDAO stationDAO;

	/**
	 * 登录类型与登录控制类之间的映射
	 */
	private final static Map<String, ILoginType> LOGIN_TYPE_MAP = new HashMap<String, ILoginType>();

	/**
	 * 在此初始化登录控制类与登录类型之间的关系
	 */
	public LoginAction() {
		// 读取登陆类型与实现类的关系，并实例化实现类。
		Properties properties = SystemVariable.getProperties();
		Set<String> keys = properties.stringPropertyNames();
		for (String key : keys) {
			if (key.startsWith("loginType")) { // 定义的登录类型，读取其具体类型与实现类。
				String[] splits = key.split("\\.");
				if (splits.length == 2) {
					String implClass = properties.getProperty(key);
					try {
						LOGIN_TYPE_MAP.put(splits[1], (ILoginType) Class.forName(implClass).newInstance());
					} catch (Exception e) {
						LogUtils.error("初始化指定登录类型[" + key + "]失败，请确认是否配置正确！", e);
					}
				}
			}
		}
	}

	/**
	 * 登录成功之后初始化session信息
	 * 
	 * @param userData
	 */
	public void initSession(Map<String, Object> userData, String sysId, HttpSession session) {
		// 记录用户信息
		Map<String, Object> formatUser = new HashMap<String, Object>();
		for (Map.Entry<String, Object> entry : userData.entrySet()) {
			formatUser.put(Common.tranColumnToJavaName(entry.getKey()), entry.getValue());
		}
		if (session == null) {
			session = SessionManager.getCurrentSession();
		}
		session.setAttribute(LoginConstant.SESSION_KEY_USER, formatUser);
		// //加载部门、岗位、地域信息
		if (userData.get("ZONE_ID") != null) {
			Map<String, Object> zoneInfo = zoneDAO.queryZoneInfo(Integer.parseInt(userData.get("ZONE_ID").toString()));
			if (zoneInfo != null) {
				Map<String, Object> formatZone = new HashMap<String, Object>();
				for (Map.Entry<String, Object> entry : zoneInfo.entrySet()) {
					formatZone.put(Common.tranColumnToJavaName(entry.getKey()), entry.getValue());
				}
				session.setAttribute(LoginConstant.SESSION_META_ZONE_INFO, formatZone);
			}
		}
		if (userData.get("DEPT_ID") != null) {
			Map<String, Object> deptInfo = deptDAO.queryDeptInfo(Integer.parseInt(userData.get("DEPT_ID").toString()));
			if (deptInfo != null) {
				Map<String, Object> formatDept = new HashMap<String, Object>();
				for (Map.Entry<String, Object> entry : deptInfo.entrySet()) {
					formatDept.put(Common.tranColumnToJavaName(entry.getKey()), entry.getValue());
				}
				session.setAttribute(LoginConstant.SESSION_META_DEPT_INFO, formatDept);
			}
		}
		if (userData.get("STATION_ID") != null) {
			Map<String, Object> stationInfo = stationDAO.queryStationInfo(Integer.parseInt(userData.get("STATION_ID")
					.toString()));
			if (stationInfo != null) {
				Map<String, Object> formatStation = new HashMap<String, Object>();
				for (Map.Entry<String, Object> entry : stationInfo.entrySet()) {
					formatStation.put(Common.tranColumnToJavaName(entry.getKey()), entry.getValue());
				}
				session.setAttribute(LoginConstant.SESSION_META_STATION_INFO, formatStation);
			}
		}
		session.removeAttribute(LoginConstant.LAST_VISIT_URL_KEY);
		if (StringUtils.isNotEmpty(sysId)) {
			changeSystem(formatUser, Integer.parseInt(sysId), session);
		} else {
			changeSystem(formatUser, null, session);
		}
	}

	/**
	 * 安徽SSO初始化SessionManager信息
	 * 
	 * @param userData
	 */
	public void initSession_AH(HttpSession session, Map<String, Object> userData, String sysId) {
		// 记录用户信息
		Map<String, Object> formatUser = new HashMap<String, Object>();
		for (Map.Entry<String, Object> entry : userData.entrySet()) {
			formatUser.put(Common.tranColumnToJavaName(entry.getKey()), entry.getValue());
		}
		SessionManager.setAttribute_AH(session, LoginConstant.SESSION_KEY_USER, formatUser);
		// //加载部门、岗位、地域信息
		if (userData.get("ZONE_ID") != null) {
			Map<String, Object> zoneInfo = zoneDAO.queryZoneInfo(Integer.parseInt(userData.get("ZONE_ID").toString()));
			Map<String, Object> formatZone = new HashMap<String, Object>();
			for (Map.Entry<String, Object> entry : zoneInfo.entrySet()) {
				formatZone.put(Common.tranColumnToJavaName(entry.getKey()), entry.getValue());
			}
			SessionManager.setAttribute_AH(session, LoginConstant.SESSION_META_ZONE_INFO, formatZone);
		}
		if (userData.get("DEPT_ID") != null) {
			Map<String, Object> deptInfo = deptDAO.queryDeptInfo(Integer.parseInt(userData.get("DEPT_ID").toString()));
			Map<String, Object> formatDept = new HashMap<String, Object>();
			for (Map.Entry<String, Object> entry : deptInfo.entrySet()) {
				formatDept.put(Common.tranColumnToJavaName(entry.getKey()), entry.getValue());
			}
			SessionManager.setAttribute_AH(session, LoginConstant.SESSION_META_DEPT_INFO, formatDept);
		}
		if (userData.get("STATION_ID") != null) {
			Map<String, Object> stationInfo = stationDAO.queryStationInfo(Integer.parseInt(userData.get("STATION_ID")
					.toString()));
			Map<String, Object> formatStation = new HashMap<String, Object>();
			for (Map.Entry<String, Object> entry : stationInfo.entrySet()) {
				formatStation.put(Common.tranColumnToJavaName(entry.getKey()), entry.getValue());
			}
			SessionManager.setAttribute_AH(session, LoginConstant.SESSION_META_STATION_INFO, formatStation);
		}
		/*
		 * if (StringUtils.isNotEmpty(sysId)) {
		 * changeSystem(Integer.parseInt(sysId)); } else { changeSystem(null); }
		 */
	}

	/**
	 * 切换系统，做一些切换系统的一些操作，比如变更session中的键值。
	 */
	public void changeSystem(Integer sysId) {
		User user = SessionManager.getUser();
		// 根据用户groupId获取其系统信息。
		if (sysId == null) {
			sysId = user.getDefaultGroupID();
		}
		sysId = (sysId == null || sysId == 0) ? Constant.DEFAULT_META_SYSTEM_ID : sysId;
		changeSystem(SessionManager.getCurrentUser(), sysId, null);
	}

	/**
	 * 切换系统，做一些切换系统的一些操作，比如变更session中的键值。
	 */
	private void changeSystem(Map<String, Object> user, Integer sysId, HttpSession session) {
		// 根据用户groupId获取其系统信息。
		if (sysId == null) {
			sysId = MapUtils.getIntValue(user, "groupId");
		}
		if (session == null) {
			session = SessionManager.getCurrentSession();
		}
		sysId = (sysId == null || sysId == 0) ? Constant.DEFAULT_META_SYSTEM_ID : sysId;
		// 查询并获取系统信息。
		Map<String, Object> sysInfo = groupDAO.queryGroupById(sysId);
		Map<String, Object> formatSysInfo = new HashMap<String, Object>();
		if (sysInfo != null) {
			for (Map.Entry<String, Object> entry : sysInfo.entrySet()) {
				formatSysInfo.put(Common.tranColumnToJavaName(entry.getKey()), entry.getValue());
			}
		}
		session.setAttribute(LoginConstant.SESSION_META_SYSTEM_INFO, formatSysInfo);
	}

	/**
	 * 登录控制
	 * 
	 * @param loginData
	 * @param type
	 *            登录类型。根据loginType判断是那种登录类型，此类型为null时，默认是正常登录，即登录原系统 另可能会有OA登录等
	 * @return
	 */
	public ILoginType.LoginResult login(Map<String, Object> loginData, String type) {
		type = (type == null || type.equals("")) ? "meta" : type;
		// 获取实际控制登录类
		ILoginType loginType = LOGIN_TYPE_MAP.get(type);
		if (loginType == null) {
			LogUtils.error("未注册登录类型");
			return null;
		}
		// 设置DAO
		loginType.setLoginDAO(userDAO);
		ILoginType.LoginResult loginResult = loginType.login(loginData);
		// 设置session
		if (loginResult == ILoginType.LoginResult.SUCCESS || loginResult == ILoginType.LoginResult.USER_FIRST_LOGIN
				|| loginResult == ILoginType.LoginResult.USER_FORCE_MODIFY_PASS
				|| loginResult == ILoginType.LoginResult.USER_TIP_MODIFY_PASS) {
			initSession(loginType.getUserData(), MapUtils.getString(loginData, "systemId"),
					(HttpSession) MapUtils.getObject(loginData, "session"));
		}
		return loginResult;
	}

	/**
	 * 访问用户root级菜单。
	 * 
	 * @param systemId
	 * @return
	 */
	public List<Map<String, Object>> queryRootMenu(Integer systemId) {
		systemId = systemId == null ? Constant.DEFAULT_META_SYSTEM_ID : systemId;
		HttpSession session = WebContextFactory.get().getSession();
		Map<String, Object> userData = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		int adminFlag = userData.get("adminFlag") == null ? Constant.META_DISABLE : Integer.parseInt(userData.get(
				"adminFlag").toString());
		int userId = Integer.parseInt(userData.get("userId").toString());
		if (adminFlag == 1) {
			userId = UserConstant.ADMIN_USERID;
		}
		return MenuCommon.filterMenu(menuDAO.queryRootMenu(systemId, userId));
	}

	/**
	 * 用户退出系统
	 * 
	 * @return
	 */
	public boolean logout() {
		boolean isClose = SystemVariable.getBoolean("is_close_system");
		HttpSession session = WebContextFactory.get().getSession();
		// 销毁session的属性
		Enumeration<String> s = session.getAttributeNames();
		while (s.hasMoreElements()) {
			session.removeAttribute(s.nextElement());
		}
		SessionContext.removeSession(session.getId());
		return isClose;
	}

	/**
	 * 加载所有的子菜单数据，有权限过滤。
	 * 
	 * @param menuId
	 * @return
	 */
	public List<Map<String, Object>> queryAllSubMenu(int menuId) {
		HttpSession session = WebContextFactory.get().getSession();
		Map<String, Object> userData = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		int adminFlag = userData.get("adminFlag") == null ? Constant.META_DISABLE : Integer.parseInt(userData.get(
				"adminFlag").toString());
		int userId = Integer.parseInt(userData.get("userId").toString());
		if (adminFlag == 1) {
			userId = UserConstant.ADMIN_USERID;
		}
		return MenuCommon.filterMenu(menuDAO.queryAllSubMenu(menuId, userId));
	}

	public void setUserDAO(UserDAO userDAO) {
		this.userDAO = userDAO;
	}

	public void setMenuDAO(MenuDAO menuDAO) {
		this.menuDAO = menuDAO;
	}

	public void setGroupDAO(GroupDAO groupDAO) {
		this.groupDAO = groupDAO;
	}

	public void setZoneDAO(ZoneDAO zoneDAO) {
		this.zoneDAO = zoneDAO;
	}

	public void setDeptDAO(DeptDAO deptDAO) {
		this.deptDAO = deptDAO;
	}

	public void setStationDAO(StationDAO stationDAO) {
		this.stationDAO = stationDAO;
	}
}
