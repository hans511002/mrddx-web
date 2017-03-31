package com.ery.meta.module.mag.menu;

import java.util.Date;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Constant;
import com.ery.meta.common.Page;
import com.ery.meta.module.mag.user.UserConstant;
import com.ery.meta.web.session.SessionManager;
import com.ery.meta.web.session.User;

import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.utils.Convert;

/**
 * 作用(Ctrl:具体功能作用,BO:针对功能块,DAO:针对表)
 * 

 * @date 2011-10-13
 * 
 * @modify 熊小平
 * @description 添加菜单访问记录排名查询
 * @date 2011-10-20
 * 
 */
public class MenuVisitLogAction {
	private MenuVisitLogDAO menuVisitLogDAO;

	/**
	 * 
	 * @param menuVisitData
	 * @throws Exception
	 */
	public void writeMenuLog(Map<String, Object> menuVisitData) throws Exception {
		if (!SessionManager.isLogIn()) {
			return;
		}
		User user = SessionManager.getUser();
		menuVisitData.put("userId", user.getUserID());
		menuVisitData.put("logId", user.getLogId());
		user.setLastVisitedMenu(menuVisitData);
		menuVisitLogDAO.insert(menuVisitData);
	}

	/**
	 * 查询菜单访问信息
	 * 
	 * @param queryData
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryMenuVisitInfo(Map<Object, Object> queryData, Page page) {

		Date startTime = new Date();
		Date endTime = new Date();
		// 读取config 配置参数，获取隐藏的岗位
		String hideStations = SystemVariable.getString("hidden.stations", "");
		Map<String, Object> user = SessionManager.getCurrentUser();
		int currentStation = Integer.parseInt(user.get("stationId").toString());
		int zoneId = Integer.parseInt(user.get("zoneId").toString());
		// 如果是用户管理员或者是隐藏岗位的人员登录，可以看到所有
		if (SessionManager.getCurrentUserID() == UserConstant.ADMIN_USERID
				|| hideStations.contains(String.valueOf(currentStation))) {
			hideStations = "";
		}
		// 时间参数处理，如果参数为空或者解析错误则赋值null
		try {
			startTime.setTime(Long.parseLong(queryData.get("startDate").toString()));
			startTime.setHours(0);
			startTime.setMinutes(0);
			startTime.setSeconds(0);
		} catch (NumberFormatException e) {
			startTime = null;
		} catch (NullPointerException e) {
			startTime = null;
		}
		try {
			endTime.setTime(Long.parseLong(queryData.get("endDate").toString()));
			endTime.setDate(endTime.getDate());
			endTime.setHours(0);
			endTime.setMinutes(0);
			endTime.setSeconds(0);
		} catch (NumberFormatException e) {
			endTime = null;
		} catch (NullPointerException e) {
			endTime = null;
		}

		int groupID = Constant.DEFAULT_META_SYSTEM_ID;
		if (queryData.get("groupId") != null && !Convert.toString(queryData.get("groupId")).equals("")
				&& !Convert.toString(queryData.get("groupId")).equalsIgnoreCase("null")) {
			groupID = Integer.parseInt((String) queryData.get("groupId"));
		}
		boolean adminFlag = false;
		if ("true".equals(Convert.toString(queryData.get("adminFlag")))) {
			adminFlag = true;
		}

		// 分页处理
		if (page == null) {
			page = new Page(0, 20);
		}

		// 按是否传递了menuId参数分支处理
		Long menuId = (Long) queryData.get("menuId");
		if (menuId != null) {
			return menuVisitLogDAO.queryMenuVisitDetailInfoById(menuId.intValue(), startTime, endTime, groupID,
					hideStations, page, adminFlag, zoneId);
		} else {
			return menuVisitLogDAO.menuVisitInfo(startTime, endTime, groupID, hideStations, page, adminFlag, zoneId);
		}
	}

	/**
	 * setter方法
	 * 
	 * @param menuVisitLogDAO
	 */
	public void setMenuVisitLogDAO(MenuVisitLogDAO menuVisitLogDAO) {
		this.menuVisitLogDAO = menuVisitLogDAO;
	}

}
