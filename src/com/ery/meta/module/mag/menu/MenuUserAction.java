package com.ery.meta.module.mag.menu;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.OprResult;
import com.ery.meta.common.Page;
import com.ery.meta.module.mag.user.UserDAO;
import com.ery.meta.module.mag.user.UserMenuPO;
import com.ery.meta.web.session.SessionManager;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;


public class MenuUserAction {

	private MenuDAO menuDAO; // 菜单模块的dao
	private UserDAO userDAO; // 用户模块的dao

	/**
	 * 按条件加载拥有该菜单的用户
	 */
	public List<Map<String, Object>> queryMenuUser(Map<String, String> map, Page page) {
		if (page == null) {// 如果没有page，为第一页。
			page = new Page(0, 10);
		}
		// if(!SessionManager.isCurrentUserAdmin()){
		map.put("mguserId", Convert.toString(SessionManager.getCurrentUserID()));
		// }
		Map<Integer, Map<String, Object>> userMenuData = new HashMap<Integer, Map<String, Object>>();
		List<Map<String, Object>> mguserMenuList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> menuTree = menuDAO.queryMenuUser(map, page);
		for (int i = 0; i < menuTree.size(); i++) {
			Map<String, Object> menuData = menuTree.get(i);
			int menuId = Integer.parseInt(menuData.get("USER_ID").toString());
			if (userMenuData.containsKey(menuId) && menuData.get("EXCLUDE_BUTTON") != null
					&& menuData.get("EXCLUDE_BUTTON") != "") {
				String tmpeUser = "";
				if (userMenuData.get(menuId).get("EXCLUDE_BUTTON") != null
						&& userMenuData.get(menuId).get("EXCLUDE_BUTTON") != "") {
					tmpeUser = userMenuData.get(menuId).get("EXCLUDE_BUTTON").toString();
					String excludeBut = tmpeUser + "," + tmpeUser;
					userMenuData.get(menuId).put("EXCLUDE_BUTTON", excludeBut);
				} else {
					userMenuData.put(menuId, menuData);
				}
			} else if (userMenuData.containsKey(menuId)) {

			} else {
				userMenuData.put(menuId, menuData);
			}
		}
		List<Map<String, Object>> mguserMenuList1 = new ArrayList<Map<String, Object>>();
		Iterator it = userMenuData.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry entry = (Map.Entry) it.next();
			if (((Map) entry.getValue()).get("TOTAL_COUNT_").toString().equals("0")) {
				mguserMenuList1.add((Map) entry.getValue());
			} else {
				mguserMenuList.add((Map) entry.getValue());
			}
		}
		for (int j = 0; j < mguserMenuList1.size(); j++) {
			mguserMenuList.add(mguserMenuList1.get(j));
		}
		return mguserMenuList;
	}

	/**
	 * 按条件查询没有该菜单的用户
	 */
	public List<Map<String, Object>> queryMenuUserByCondition(Map<String, String> map, Page page) {
		if (page == null) {// 如果没有page，为第一页。
			page = new Page(0, 10);
		}
		if (!SessionManager.isCurrentUserAdmin()) {
			map.put("mguserId", Convert.toString(SessionManager.getCurrentUserID()));
		}
		return menuDAO.queryUserByCondition(map, page);
	}

	/**
	 * 菜单关联用户
	 * 
	 * @param map 页面选择数据，其数据结构为：{ { add:[{menuId:,userId},{}...],
	 *            del:{userId,menuId:}
	 *            exclude:[{menuId,userId,excluteButton},{}...] }
	 * @return
	 */
	public boolean insertMenuUserByMenuId(Map<String, Object> map) {
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> addObj = (List<Map<String, Object>>) map.get("add");
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> delObj = (List<Map<String, Object>>) map.get("del");
		List<Map<String, Object>> delObjtmpe = new ArrayList<Map<String, Object>>();
		List<UserMenuPO> insObj = new ArrayList<UserMenuPO>();
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> excludeButtons = (List<Map<String, Object>>) map.get("exclude");
		boolean flag = true;
		try {
			BaseDAO.beginTransaction();
			if (addObj != null && addObj.size() > 0) {
				for (int i = 0; i < addObj.size(); i++) {
					UserMenuPO userPO = new UserMenuPO();
					userPO.setMenuId(Integer.parseInt((addObj.get(i).get("menuId").toString())));
					userPO.setUserId(Integer.parseInt((addObj.get(i).get("userId").toString())));
					if (userDAO.queryUserMenuid(userPO.getUserId(), userPO.getMenuId()) > 0) {
						delObjtmpe.add(addObj.get(i));
					} else {
						menuDAO.queryAllParentId(userPO.getMenuId(), userPO.getUserId());
					}

					userPO = null;
				}

			}
			if (delObj != null && delObj.size() > 0) {
				List<UserMenuPO> userMenuPOs = new ArrayList<UserMenuPO>();
				for (int i = 0; i < delObj.size(); i++) {
					int userId = Integer.parseInt((delObj.get(i).get("userId") + ""));
					int menuId = Integer.parseInt((delObj.get(i).get("menuId") + ""));
					UserMenuPO userPO = new UserMenuPO();
					userPO.setMenuId(menuId);
					userPO.setUserId(userId);
					if (userDAO.queryUserMenuid(userId, menuId) > 0) {
						userMenuPOs.add(userPO);
					} else {
						userPO.setFlag(0);
						userPO.setExcludeButton("");
						insObj.add(userPO);
					}

				}
				if (userMenuPOs != null && userMenuPOs.size() > 0) {
					userDAO.deleteBatchUserMenu(userMenuPOs);
				} else {
					userDAO.insertBatchUserMenu(insObj);
				}

			}

			if (delObjtmpe != null && delObjtmpe.size() > 0) {
				List<UserMenuPO> userMenuPOs = new ArrayList<UserMenuPO>();
				for (int i = 0; i < delObjtmpe.size(); i++) {
					int userId = Integer.parseInt((delObjtmpe.get(i).get("userId") + ""));
					int menuId = Integer.parseInt((delObjtmpe.get(i).get("menuId") + ""));
					UserMenuPO userPO = new UserMenuPO();
					userPO.setMenuId(menuId);
					userPO.setUserId(userId);
					if (userDAO.queryUserMenuid(userId, menuId) > 0) {
						userMenuPOs.add(userPO);
					} else {
						userPO.setFlag(0);
						userPO.setExcludeButton("");
						insObj.add(userPO);
					}

				}
				if (userMenuPOs != null && userMenuPOs.size() > 0) {
					userDAO.deleteBatchUserMenu(userMenuPOs);
				} else {
					userDAO.insertBatchUserMenu(insObj);
				}

			}
			if (excludeButtons != null && excludeButtons.size() > 0) {
				List<UserMenuPO> userMenuPOs = new ArrayList<UserMenuPO>();
				for (int i = 0; i < excludeButtons.size(); i++) {
					UserMenuPO userPO = new UserMenuPO();
					userPO.setMenuId(Integer.parseInt((excludeButtons.get(i).get("menuId").toString())));
					userPO.setUserId(Integer.parseInt((excludeButtons.get(i).get("userId").toString())));
					userPO.setExcludeButton(excludeButtons.get(i).get("excludeButton").toString());
					userPO.setFlag(MenuConstant.ROLE_FLAG_ADD_USER_MENU);
					userMenuPOs.add(userPO);
				}
				userDAO.updateBatchUserMenu(userMenuPOs);
			}
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("设置用户与菜单关联关系出错", e);
			flag = false;
		}
		return flag;
	}

	/**
	 * 删除已经拥有某菜单的用户
	 */
	public OprResult<?, ?>[] deleteMenuUserByMenuId(Map<String, Object> map) {
		int menuId = 0;
		OprResult<?, ?> result[] = null;
		String menuIdStr = String.valueOf(map.get("menuId"));
		if (menuIdStr != null) {
			menuId = Integer.valueOf(menuIdStr);
		}
		String userIdsStr = String.valueOf(map.get("userIds"));
		if (userIdsStr != null) {
			int userArr[] = new int[userIdsStr.split(",").length];
			for (int i = 0; i < userArr.length; i++) {
				userArr[i] = Integer.valueOf((userIdsStr.split(",")[i]));
			}
			result = new OprResult[userArr.length];
			try {
				BaseDAO.beginTransaction();
				userDAO.deleteMenuUserById(menuId, userIdsStr);
				BaseDAO.commit();
				for (int i = 0; i < result.length; i++) {
					result[i] = new OprResult<Integer, Object>(userArr[i], null, OprResult.OprResultType.delete);
				}
			} catch (Exception e) {
				BaseDAO.rollback();
				LogUtils.error("删除菜单与用户关联关系出错", e);
				for (int i = 0; i < result.length; i++) {
					result[i] = new OprResult<Integer, Object>(userArr[i], null, OprResult.OprResultType.error);
				}
			}// end catch
		}// end if userIdsStr
		return result;
	}

	public void setMenuDAO(MenuDAO menuDAO) {
		this.menuDAO = menuDAO;
	}

	public void setUserDAO(UserDAO userDAO) {
		this.userDAO = userDAO;
	}
}
