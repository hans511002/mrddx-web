/**
 *
 */
package com.ery.meta.module.mag.login;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.directwebremoting.WebContextFactory;

import com.ery.meta.common.Page;
import com.ery.meta.module.mag.user.UserConstant;
import com.ery.meta.web.session.SessionManager;

import com.ery.base.support.sys.SystemVariable;

/**

 * 

 * @description 登录日志控制类
 * @date 2011-10-17
 * 
 */
public class LoginLogAction {
	private LoginLogDAO loginLogDAO;

	/**
	 * setter
	 * 
	 * @param loginLogDAO
	 */
	public void setLoginLogDAO(LoginLogDAO loginLogDAO) {
		this.loginLogDAO = loginLogDAO;
	}

	/**
	 * 访问排名
	 * 
	 * @param queryData 参数列表
	 * @param page 分页参数
	 * @return
	 */
	public List<Map<String, Object>> queryLoginLog(Map<String, Object> queryData, Page page) {
		if (page == null) {
			page = new Page(0, 20);
		}
		// 读取config 配置参数，获取隐藏的岗位
		String hideStations = SystemVariable.getString("hidden.stations", "");
		Map<String, Object> user = SessionManager.getCurrentUser();
		int currentStation = user.get("stationId") == null ? null : Integer.parseInt(user.get("stationId").toString());
		// 如果是用户管理员或者是隐藏岗位的人员登录，可以看到所有
		if (SessionManager.getCurrentUserID() == UserConstant.ADMIN_USERID
				|| hideStations.contains(String.valueOf(currentStation))) {
			hideStations = "";
		}
		return loginLogDAO.queryLoginLog(queryData, hideStations, page);
	}

	/**
	 * 某一用户详细访问信息
	 * 
	 * @param queryData 参数列表
	 * @param page 分页参数
	 * @return
	 */
	public List<Map<String, Object>> queryLoginLogByID(Map<String, Object> queryData, Page page) {
		if (page == null) {
			page = new Page(0, 20);
		}
		// 读取config 配置参数，获取隐藏的岗位
		String hideStations = SystemVariable.getString("hidden.stations", "");
		Map<String, Object> user = SessionManager.getCurrentUser();
		int currentStation = user.get("stationId") == null ? null : Integer.parseInt(user.get("stationId").toString());
		// 如果是用户管理员或者是隐藏岗位的人员登录，可以看到所有
		if (SessionManager.getCurrentUserID() == UserConstant.ADMIN_USERID
				|| hideStations.contains(String.valueOf(currentStation))) {
			hideStations = "";
		}
		return loginLogDAO.queryLoginLogByID(queryData, hideStations, page);
	}

	/**
	 * 取得需要隐藏的岗位和指定的菜单名称
	 */
	String hideStations = SystemVariable.getString("hidden.stations", "");
	private String menuName = (String) SessionManager.getCurrentSession().getAttribute("MenuName");

	/**
	 * 此方法用来动态生成登陆日志和菜单访问报表
	 * 
	 * @param queryData 需要的一些判断条件
	 * @return 返回值
	 */
	public List<Map<String, Object>> queryLoginReport(Map<String, Object> queryData) {
		// 读取config 配置参数，获取隐藏的岗位
		// Map<String,Object> user= SessionManager.getCurrentUser();
		Map<String, Object> user = (Map<String, Object>) WebContextFactory.get().getSession()
				.getAttribute(LoginConstant.SESSION_KEY_USER);
		if (user.get("adminFlag").toString().trim().equals("1")) {
			queryData.put("adminFlag", "true");
		} else {
			queryData.put("adminFlag", "false");
		}
		int currentStation = user.get("stationId") == null ? null : Integer.parseInt(user.get("stationId").toString());
		// 如果是用户管理员或者是隐藏岗位的人员登录，可以看到所有
		if (SessionManager.getCurrentUserID() == UserConstant.ADMIN_USERID
				|| hideStations.contains(String.valueOf(currentStation))) {
			hideStations = "";
		}
		List<Map<String, Object>> loginList = loginLogDAO.queryLoginReport(queryData, hideStations);
		String[] menus = menuName.split(",");
		List<Map<String, Object>> loginCount = new ArrayList<Map<String, Object>>();
		/**
		 * 统计出访问记录的和放在最后一个map中
		 */
		Map<String, Object> totalCount = new HashMap<String, Object>();
		totalCount.put("ZONE_ID", -1);
		totalCount.put("ZONE_NAME", "合计");
		int sum = 0, menuVisit0 = 0, menuVisit1 = 0, menuVisit2 = 0, menuVisit3 = 0;
		for (int j = 0; j < loginList.size(); j++) {
			sum += loginList.get(j).get("SUM") == null ? 0 : Integer.parseInt(loginList.get(j).get("SUM").toString());
			Map<String, Object> loginList_ = loginList.get(j);
			for (int i = 0; i < menus.length; i++) {
				boolean flag = true;
				List<Map<String, Object>> menuMaps = new ArrayList<Map<String, Object>>();
				menuMaps = loginLogDAO.queryMenuList(menus[i]);
				if (menuMaps.size() == 0) {
					Map<String, Object> menuMap = new HashMap<String, Object>();
					menuMap.put("MENU_ID", menus[i]);
					menuMaps.add(menuMap);
				}
				List<Map<String, Object>> menuList = loginLogDAO.queryMenuReport(queryData, hideStations, menuMaps);
				for (int k = 0; k < menuList.size(); k++) {
					Map<String, Object> menuList_ = menuList.get(k);

					if (menuList_.containsKey("MENUVISITCOUNT")
							&& menuList_.get("ZONE_ID").toString().trim()
									.equals(loginList_.get("ZONE_ID").toString().trim())) {
						loginList_.put("MENU_VISIT" + i, menuList_.get("MENUVISITCOUNT"));
						if (i == 0)
							menuVisit0 += menuList_.get("MENUVISITCOUNT") == null ? 0 : Integer.parseInt(menuList_.get(
									"MENUVISITCOUNT").toString());
						if (i == 1)
							menuVisit1 += menuList_.get("MENUVISITCOUNT") == null ? 0 : Integer.parseInt(menuList_.get(
									"MENUVISITCOUNT").toString());
						if (i == 2)
							menuVisit2 += menuList_.get("MENUVISITCOUNT") == null ? 0 : Integer.parseInt(menuList_.get(
									"MENUVISITCOUNT").toString());
						if (i == 3)
							menuVisit3 += menuList_.get("MENUVISITCOUNT") == null ? 0 : Integer.parseInt(menuList_.get(
									"MENUVISITCOUNT").toString());
						flag = false;
					}
				}
				if (flag) {
					loginList_.put("MENU_VISIT" + i, "0");
				}
			}
			loginCount.add(loginList_);
		}
		totalCount.put("SUM", sum);
		totalCount.put("MENU_VISIT0", menuVisit0);
		totalCount.put("MENU_VISIT1", menuVisit1);
		totalCount.put("MENU_VISIT2", menuVisit2);
		totalCount.put("MENU_VISIT3", menuVisit3);
		loginCount.add(totalCount);
		return loginCount;
	}

	/**
	 * 获得菜单 名称，用于前台生成列名
	 * 
	 * @return 指定菜单的名称
	 */
	public List<Map<String, Object>> queryMenuName() {
		// String menuName =
		// SystemVariable.CONF_PROPERTIES.getProperty("reportMenuId");
		Map<String, Object> user = SessionManager.getCurrentUser();
		SessionManager.getCurrentUserID();
		int currentStation = user.get("stationId") == null ? null : Integer.parseInt(user.get("stationId").toString());
		if (SessionManager.getCurrentUserID() == UserConstant.ADMIN_USERID
				|| hideStations.contains(String.valueOf(currentStation))) {
			hideStations = "";
		}
		return loginLogDAO.getMenuName(menuName);
	}
}
