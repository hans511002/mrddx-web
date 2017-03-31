package com.ery.meta.web.session;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import javax.servlet.http.HttpSession;

import org.directwebremoting.WebContextFactory;

import com.ery.meta.module.mag.user.UserConstant;

import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.utils.MapUtils;
import com.ery.base.support.utils.StringUtils;

/**

 * 

 * @description 封装的session Mangager公共类，用于进行session的管理，获取当前session，获取当前在线用户信息 等方法<br>
 * @date 2011-10-03
 */
public class SessionManager {

	private static List<User> users = new Vector<User>();

	static void logIn(User user) {
		users.add(user);
	}

	static void logOut(int userId) {
		for (int i = 0, size = users.size(); i < size; i++) {
			if (users.get(i).getUserID() == userId) {
				users.remove(i);
				break;
			}
		}
	}

	/**
	 * 判断指定用户ID的用户是否登录
	 * 
	 * @param userId 用户ID
	 */
	public static boolean isLoggedIn(int userId) {
		boolean rtn = false;
		for (User user : users) {
			if (user.getUserID() == userId) {
				rtn = true;
				break;
			}
		}
		return rtn;
	}

	/**
	 * 获取当前线程在线的用户，如果当前用户在线则返回AbstractUserOL，不在线则返回null
	 */
	public static User getUser() {
		HttpSession session = WebContextFactory.get().getSession();
		String sid = session.getId();
		User rtnUser = null;
		for (User user : users) {
			if (StringUtils.equals(sid, user.getSessionID())) {
				rtnUser = user;
				break;
			}
		}
		return rtnUser;
	}

	/**
	 * 根据userId获取当前在线的用户，如果该用户在线则返回AbstractUserOL，不在线则返回null
	 * 
	 * @param userId
	 */
	public static User getUser(int userId) {
		User rtnUser = null;
		for (User user : users) {
			if (user.getUserID() == userId) {
				rtnUser = user;
				break;
			}
		}
		return rtnUser;
	}

	public static User getUser(String sessionId) {
		User rtnUser = null;
		for (User user : users) {
			if (StringUtils.equals(user.getSessionID(), sessionId)) {
				rtnUser = user;
				break;
			}
		}
		return rtnUser;
	}

	/**
	 * 设置session属性值
	 * 
	 * @param key
	 * @param value
	 */
	public static void setAttribute(String key, Object value) {
		getCurrentSession().setAttribute(key, value);
	}

	/**
	 * 获取session属性值
	 * 
	 * @param key
	 * @return
	 */
	public static Object getAttribute(String key) {
		return getCurrentSession().getAttribute(key);
	}

	/**
	 * 设置安徽SSO session属性值
	 * 
	 * @param key
	 * @param value
	 */
	public static void setAttribute_AH(HttpSession session, String key, Object value) {
		session.setAttribute(key, value);
	}

	/**
	 * 获取session属性值
	 * 
	 * @param key
	 * @return
	 */
	public static void removeAttribute(String key) {
		getCurrentSession().removeAttribute(key);
	}

	/**
	 * 获取当前用户的session
	 * 
	 * @return
	 */
	public static HttpSession getCurrentSession() {
		return WebContextFactory.get().getSession();
	}

	/**
	 * 根据用户名查找session，此方法不用存在于web上下文中即可查找session， 前提是session存在。
	 * 
	 * @param userId
	 * @return
	 */
	public static HttpSession getSession(int userId) {
		User user = getUser(userId);
		HttpSession session = null;
		if (user != null) {
			session = SessionContext.getSession(user.getSessionID());
		}
		return session;
	}

	/**
	 * 获取当前session的用户信息，如用户名，用户ID等。
	 * 
	 * @return
	 */
	public static Map<String, Object> getCurrentUser() {
		return getUser().getUserMap();
	}

	/**
	 * 获取当前在线用户数。
	 * 
	 * @return
	 */
	public static int getOnlineUserCount() {
		return users.size();
	}

	/**
	 * 取得当前某系统在线人数
	 * 
	 * @param groupId
	 * @return
	 */
	public static int getOnlineUserCountByGroupId(int groupId) {
		int cnt = 0;
		for (User user : users) {
			if (user.getGroupID() == groupId) {
				cnt++;
			}
		}
		return cnt;
	}

	/**
	 * 获取所有系统中所有的在线用户列表
	 */
	public static List<User> getAllOnlineUsers() {
		return users;
	}

	public static List<Map<String, Object>> getAllOnlineUserMaps() {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (User user : users) {
			list.add(user.getUserMap());
		}
		return list;
	}

	/**
	 * 根据业务系统ID获取当前系统中所有的在线用户列表
	 * 
	 * @param groupId 业务系统ID
	 */
	public static List<User> getOnlineUsers(int groupId) {
		List<User> list = new ArrayList<User>();
		for (User user : users) {
			if (user.getGroupID() == groupId) {
				list.add(user);
			}
		}
		return list;
	}

	/**
	 * 判断sessionID代表session的连接用户是否已经登录
	 */
	public static boolean isLogIn(String sessionID) {
		boolean rtn = false;
		for (User user : users) {
			if (StringUtils.equals(user.getSessionID(), sessionID)) {
				rtn = true;
				break;
			}
		}
		return rtn;
	}

	/**
	 * 判断当前Session的连接用户是否已经登录
	 * 
	 * @return
	 */
	public static boolean isLogIn() {
		String sid = WebContextFactory.get().getSession().getId();
		return isLogIn(sid);
	}

	/**
	 * 判断指定用户Id的用户是否登录
	 * 
	 * @param userId
	 * @return
	 */
	public static boolean isLogIn(int userId) {
		User user = getUser(userId);
		return user == null ? false : isLogIn(user.getSessionID());
	}

	/**
	 * 判断当前登录的用户是否是管理员
	 * 
	 * @return
	 */
	public static boolean isCurrentUserAdmin() {
		Map<String, Object> user = getCurrentUser();
		return user.get("adminFlag") == null || user.get("adminFlag").equals("") ? false : MapUtils.getIntValue(user,
				"adminFlag") == UserConstant.ADMIN_FLAG_IS_ADMIN;
	}

	/**
	 * 获取当前登录用户的UserId
	 * 
	 * @return
	 */
	public static int getCurrentUserID() {
		int rtn = -1;
		if (isLogIn()) {
			rtn = getUser().getUserID();
		}
		return rtn;
	}

	/**
	 * 获取当前登录用户的UserId
	 * 
	 * @param sessionId
	 * @return
	 */
	public static int getCurrentUserID(String sessionId) {
		int rtn = -1;
		if (isLogIn(sessionId)) {
			rtn = getUser(sessionId).getUserID();
		}
		return rtn;
	}

	/**
	 * 判断当前登录的用户是否客户
	 */
	public static boolean isCustomer() {
		boolean rtn = true;
		if (isLogIn()) {
			String stationId = MapUtils.getString(getUser().getUserMap(), "stationId");
			String hiddenStations = SystemVariable.getString("hidden.stations", "");
			String[] hiddenStationArry = hiddenStations.split(",");

			for (int i = 0, length = hiddenStationArry.length; i < length; i++) {
				if (StringUtils.equals(stationId, hiddenStationArry[i])) {
					rtn = false;
				}
			}
		} else {
			rtn = false;
		}
		return rtn;
	}

	/**
	 * 判断当前登录的用户是否客户
	 * 
	 * @param sessionId
	 */
	public static boolean isCustomer(String sessionId) {
		boolean rtn = true;
		if (isLogIn(sessionId)) {
			String stationId = MapUtils.getString(getUser(sessionId).getUserMap(), "stationId");
			String hiddenStations = SystemVariable.getString("hidden.stations", "");
			String[] hiddenStationArry = hiddenStations.split(",");

			for (int i = 0, length = hiddenStationArry.length; i < length; i++) {
				if (StringUtils.equals(stationId, hiddenStationArry[i])) {
					rtn = false;
				}
			}
		} else {
			rtn = false;
		}
		return rtn;
	}

	/**
	 * 获取当前登录用户的StationId
	 * 
	 * @return
	 */
	public static int getCurrentStationID() {
		Map<String, Object> user = getCurrentUser();
		return MapUtils.getIntValue(user, "stationId");
	}

	/**
	 * 获取当前登录用户的ZoneId
	 * 
	 * @return
	 */
	public static int getCurrentZoneID() {
		Map<String, Object> user = getCurrentUser();
		return MapUtils.getIntValue(user, "zoneId");
	}

	/**
	 * 获取当前登录用户的DeptId
	 * 
	 * @return
	 */
	public static int getCurrentDeptID() {
		Map<String, Object> user = getCurrentUser();
		return MapUtils.getIntValue(user, "deptId");
	}

	public static void destroy() {
		users.clear();
	}
}