package com.ery.meta.module.mag.role;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.OprResult;
import com.ery.meta.common.OprResult.OprResultType;
import com.ery.meta.common.Page;
import com.ery.meta.module.mag.menu.MenuDAO;
import com.ery.meta.module.mag.user.UserDAO;
import com.ery.meta.module.mag.user.UserRolePO;
import com.ery.meta.web.session.SessionManager;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;

/**

 * 该类是角色相关操作Action类， 包括但不仅包括角色的增、删、改、查、关联菜单、关联用户等功能
 * 

 * @date 2011-9-26 ----------------------
 * @modify 张伟
 * @date 2011-10-2 添加分页设置
 * @modifyDate
 */
public class RoleAction {

	/**
	 * 数据处理类
	 */
	private RoleDAO roleDAO;
	private UserDAO userDAO;
	private MenuDAO menuDAO;

	/**
	 * 根据前台查询条件返回角色列表
	 * 
	 * @param queryData 查询表单
	 * @return 符合条件的角色列表
	 */
	public List<Map<String, Object>> queryRole(Map<?, ?> queryData, Page page) {
		// 张伟：添加分页查询
		if (page == null) {// 如果没有page，为第一页。
			page = new Page(0, 20);
		}
		// 用AOP的方法实现前台页面“关联部门岗位”一栏的展示 refDeptStation

		// List<Map<String,Object>> roleList = roleDAO.queryRoles(queryData,
		// page);
		int mguserId = SessionManager.getCurrentUserID();

		return roleDAO.queryRolesNotInUserRoleByRoleId(queryData, mguserId, SessionManager.isCurrentUserAdmin());
	}

	/**
	 * 查询角色关联的岗位与部门数据。
	 * 
	 * @param roleId
	 * @return
	 */
	public List<Map<String, Object>> queryRefDeptStation(int roleId) {
		return roleDAO.queryRefDeptStation(roleId);
	}

	/**
	 * 增加角色验证唯一性
	 * 
	 * @param
	 * @return 操作结果
	 */

	public boolean queryUserByRoleName(String roleName) {
		boolean flag = false;
		List<Map<String, Object>> mapList = roleDAO.queryUserByRoleName(roleName.trim());
		if (mapList.size() == 0) {
			flag = true;

		}
		return flag;
	}

	/**
	 * 增加角色信息 增加对岗位部门关联关系的维护
	 * 
	 * @param data 表单数据
	 * @return 操作结果
	 */
	public OprResult<?, ?> insertRole(Map<String, Object> data) {
		OprResult<Integer, Object> result = null;
		try {
			// 构建结果
			int mguserId = SessionManager.getCurrentUserID();

			result = new OprResult<Integer, Object>(null, Integer.parseInt(roleDAO.insertRole(data).toString()),
					OprResultType.insert);
			// 插入角色与部门、岗位关联关系
			roleDAO.insertRoleRefDeptStation(Integer.parseInt(result.getTid().toString()),
					(List<Map<Long, Long>>) data.get("refDeptStation"));
			if (!SessionManager.isCurrentUserAdmin()) {
				UserRolePO userRolePO = new UserRolePO();
				userRolePO.setUserId(mguserId);
				userRolePO.setRoleId(Integer.parseInt(result.getTid().toString()));
				userRolePO.setGrantFlag(1);
				userRolePO.setMagFlag(1);
				userDAO.insertUserRole(userRolePO);
				userRolePO = null;
			}
			// 查询刚新增的数据
			Map<String, Object> newData = roleDAO.queryRoleById(Integer.parseInt(result.getTid().toString()));
			newData.put("refDeptStation",
					roleDAO.queryDeptNamesStationNamesByRoleId(Integer.parseInt(result.getTid().toString())));
			result.setSuccessData(newData);
			return result;
		} catch (Exception e) {
			LogUtils.error("新增角色信息失败", e);
			result = new OprResult<Integer, Object>(null, null, OprResultType.error);
		}
		return result;
	}

	/**
	 * 修改角色 增加对岗位部门关联关系的维护
	 * 
	 * @param data 表单数据
	 * @return 操作结果
	 */
	public OprResult<?, ?> updateRole(Map<String, Object> data) {
		OprResult<Integer, Object> result = null;
		int roleId = Integer.parseInt(String.valueOf(data.get("roleId")));
		List<Map<String, Object>> mapList = roleDAO
				.queryRoleByNameAndId(Convert.toString(data.get("roleName")), roleId);
		if (mapList.size() > 0) {
			result = new OprResult<Integer, Object>();
			result.setSid(-1);
			mapList = null;
			return result;
		}
		try {
			int number = roleDAO.updateRole(data);
			result = new OprResult<Integer, Object>(null, number, OprResultType.update);
			// 先删除角色与部门’岗位的关联关系
			roleDAO.deleteRoleOrgByRoleId(new int[] { roleId });
			// 新增关联关系
			roleDAO.insertRoleRefDeptStation(roleId, (List<Map<Long, Long>>) data.get("refDeptStation"));
			// 查询修改的数据
			Map<String, Object> newData = roleDAO.queryRoleById(roleId);
			newData.put("refDeptStation", roleDAO.queryDeptNamesStationNamesByRoleId(roleId));
			result.setSuccessData(newData);
			return result;
		} catch (Exception e) {
			LogUtils.error("修改角色信息失败", e);
			result = new OprResult<Integer, Object>(null, null, OprResultType.error);
		}
		return result;
	}

	/**
	 * 删除所选角色 删除步骤：
	 * 1，首先根据META_MAG_ROLE_DIM中对应ROLE_ID找到对应META_MAG_ROLE_DIM_DETAIL的记录删除
	 * 2，删除META_MAG_ROLE_DIM中对应ROLE_ID的数据 3，删除META_MAG_ROLE_GDL中对应ROLE_ID的数据
	 * 4，删除META_MAG_ROLE_ORG中对应ROLE_ID的数据
	 * 
	 * 5，删除META_MAG_ROLE_MENU中对应ROLE_ID的数据 6，删除META_MAG_USER_ROLE中对应ROLE_ID的数据
	 * 7，删除主表META_MAG_ROLE中对应ROLE_ID的数据
	 * 
	 * @param roleIdStr 角色数组
	 * @return
	 */
	public OprResult<?, ?>[] deleteRole(String roleIdStr) {
		// 前台传入的ID是字符串形式以逗号隔开
		int roleId[] = new int[roleIdStr.split(",").length];
		for (int i = 0; i < roleId.length; i++) {
			roleId[i] = Integer.parseInt(roleIdStr.split(",")[i]);
		}
		OprResult<?, ?> result[] = new OprResult[roleId.length];
		try {
			BaseDAO.beginTransaction();
			// //删除META_MAG_ROLE_DIM_DETAIL相关
			// //删除META_MAG_ROLE_DIM相关
			// //删除META_MAG_ROLE_GDL相关
			// //删除META_MAG_ROLE_ORG相关
			// 删除META_MAG_ROLE_MENU相关
			roleDAO.deleteRoleMenuByRoleId(roleId);
			// 删除META_MAG_USER_ROLE相关
			roleDAO.deleteUserRoleByRoleId(roleIdStr.split(","), null);
			// 删除主表
			roleDAO.deleteRoleByRoleIds(roleId);
			BaseDAO.commit();
			for (int i = 0; i < result.length; i++) {
				result[i] = new OprResult<Integer, Object>(roleId[i], null, OprResultType.delete);
			}
			return result;
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("删除角色信息失败", e);
			for (int i = 0; i < result.length; i++) {
				result[i] = new OprResult<Integer, Object>(roleId[i], null, OprResultType.error);
			}
			return result;
		}
	}

	/**
	 * 查询关联用户 只查询出没有被关联的用户
	 * 
	 * @param queryData 查询表单
	 * @param page 分页参数
	 * @return 用户列表
	 */
	public List<Map<String, Object>> queryRefUser(Map<String, Object> queryData, Page page) {
		if (page == null) {
			page = new Page(0, 10);// 每页10行
		}
		int roleId = Integer.parseInt(queryData.get("roleId").toString());
		if (!SessionManager.isCurrentUserAdmin()) {
			queryData.put("mguserId", SessionManager.getCurrentUserID());
		}

		return userDAO.queryUserNotInUserRole(queryData, page, roleId);
	}

	/**
	 * 获取菜单所属系统列表。
	 * 
	 * @return
	 */
	public List<Map<String, Object>> queryMenuSystem() {
		return menuDAO.queryMenuSystem();
	}

	/**
	 * 加载menu treeGrid树，在用户菜单关联关系设置中 用AOP的方式实现选中已经关联的菜单
	 * 
	 * @param belongSys 所属系统
	 * @return 树列表
	 */
	public List<Map<String, Object>> queryMenuTreeData(int belongSys, int roleId) {
		List<Map<String, Object>> menuTree = menuDAO.queryMenuBySystemId(belongSys);
		int userId = SessionManager.getCurrentUserID();

		if (!SessionManager.isCurrentUserAdmin()) {
			menuTree = userDAO.queryUserMenuByUserBelogSys(userId, belongSys);
		}
		// 用AOP的方式实现选中已经关联的菜单
		List<Map<String, Object>> roleMenuList = roleDAO.queryRoleMenuByRoleId(roleId);
		List<Map<String, Object>> mguserMenuList = userDAO.queryUserMenuByUserID(userId, belongSys);
		Map<Integer, Map<String, Object>> mguserMenuData = new HashMap<Integer, Map<String, Object>>();
		if (mguserMenuList != null && mguserMenuList.size() > 0) {
			for (Map<String, Object> menuData : mguserMenuList) {
				if (menuData.get("EXCLUDE_BUTTON") != null && menuData.get("EXCLUDE_BUTTON").toString() != "") {
					if (mguserMenuData.containsKey(Integer.parseInt(menuData.get("MENU_ID").toString()))) {
						String temp = mguserMenuData.get(Integer.parseInt(menuData.get("MENU_ID").toString()))
								.get("EXCLUDE_BUTTON").toString();
						String temp2 = menuData.get("EXCLUDE_BUTTON").toString();
						menuData.put("EXCLUDE_BUTTON", temp2 + "," + temp);
					}
					mguserMenuData.put(Integer.parseInt(menuData.get("MENU_ID").toString()), menuData);
				}
			}
		}
		for (int i = 0; i < menuTree.size(); i++) {// 循环菜单树列表
			Map<String, Object> menuMap = menuTree.get(i);
			int menuId = Integer.valueOf(menuMap.get("MENU_ID").toString());
			String hasMeuns[] = null;
			String delMeuns[] = null;
			if (mguserMenuData.containsKey(menuId)) {
				hasMeuns = menuMap.get("PAGE_BUTTON").toString().split(",");
				delMeuns = mguserMenuData.get(menuId).get("EXCLUDE_BUTTON").toString().split(",");
				String meunsIs = "";
				String temp = "";
				for (int j = 0; j < hasMeuns.length; j++) {
					int m = 0;
					for (int n = 0; n < delMeuns.length; n++) {

						if (hasMeuns[j].indexOf(delMeuns[n]) < 0) {
						} else {
							m = m + 1;
						}
					}
					if (m == 0) {
						if (meunsIs == "") {
							temp = hasMeuns[j];
						} else {
							temp = hasMeuns[j] + "," + meunsIs;
						}
						meunsIs = temp;
					} else {

					}
				}
				menuMap.put("PAGE_BUTTON", meunsIs);
			}
			menuMap.put("CHECKED", 0);
			for (int j = 0; j < roleMenuList.size(); j++) {// 循环
				int refMenuId = Integer.valueOf(roleMenuList.get(j).get("MENU_ID").toString());
				if (refMenuId == menuId) {
					menuMap.put("CHECKED", 1);
					menuMap.put("EXCLUDE_BUTTON", Convert.toString(roleMenuList.get(j).get("EXCLUDE_BUTTON")));
					break;
				} else {
					// menuMap.put("CHECKED", 0);
					menuMap.put("EXCLUDE_BUTTON", "");
				}
			}
		}
		return menuTree;
	}

	/**
	 * 设置角色-用户关联关系
	 * 
	 * @param data 表单数据
	 * @return 成功与否
	 */
	public boolean insertRefUser(Map<String, Object> data) {
		List<Map<String, Object>> addObj = null;
		List<Map<String, Object>> delObj = null;
		List<Map<String, Object>> updateObj = null;
		if (data.get("add") != null) {
			addObj = (List<Map<String, Object>>) data.get("add");
		}
		if (data.get("del") != null) {
			delObj = (List<Map<String, Object>>) data.get("del");
		}
		if (data.get("update") != null) {
			updateObj = (List<Map<String, Object>>) data.get("update");
		}
		try {
			BaseDAO.beginTransaction();
			if (addObj != null && addObj.size() > 0) {
				for (int i = 0; i < addObj.size(); i++) {
					UserRolePO userRolePO = new UserRolePO();
					userRolePO.setUserId(Integer.parseInt(addObj.get(i).get("userId").toString()));
					userRolePO.setRoleId(Integer.parseInt(addObj.get(i).get("roleId").toString()));
					userRolePO.setGrantFlag(Integer.parseInt(addObj.get(i).get("grandFlag").toString()));
					userRolePO.setMagFlag(Integer.parseInt(addObj.get(i).get("magFlag").toString()));
					userDAO.insertUserRole(userRolePO);
					userRolePO = null;
				}
			}

			if (updateObj != null) {// 待修改的关联关系不为空，则进行修改操作
				for (int i = 0; i < updateObj.size(); i++) {
					UserRolePO userRolePO = new UserRolePO();
					userRolePO.setRoleId(Integer.parseInt(updateObj.get(i).get("roleId").toString()));
					userRolePO.setUserId(Integer.parseInt(updateObj.get(i).get("userId").toString()));
					userRolePO.setMagFlag(Integer.parseInt(updateObj.get(i).get("magFlag").toString()));
					userRolePO.setGrantFlag(Integer.parseInt(updateObj.get(i).get("grandFlag").toString()));
					userDAO.updateUserRole(userRolePO);
					userRolePO = null;
				}
			}

			if (delObj != null && delObj.size() > 0) { // 当有用户的时候才开启事务进行添加操作
				for (int i = 0; i < delObj.size(); i++) {
					int roleId = Integer.parseInt((delObj.get(i).get("roleId") + ""));
					String userId[] = (delObj.get(i).get("userId").toString().split(","));
					userDAO.deleteUserRoleByUserId(userId, roleId);
				}
			}
			BaseDAO.commit();
			return true;
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("设置角色-用户关联关系失败", e);
			return false;
		}
	}

	/**
	 * 删除关联关系
	 * 
	 * @param data 传入的数据
	 * @return
	 */
	public boolean deleteRefUser(Map<String, Object> data) {
		int roleId = Integer.parseInt(String.valueOf(data.get("roleId")));
		String refUserIdstr = String.valueOf(data.get("refUserIds"));
		String userIds[] = refUserIdstr.split(",");
		try {
			userDAO.deleteUserRoleByUserId(userIds, roleId);
			return true;
		} catch (Exception e) {
			LogUtils.error("删除用户-角色关联关系失败", e);
			return false;
		}
	}

	/**
	 * 角色关联菜单。
	 * 
	 * @param data 
	 *            数据结构如下：addRefMenu:[menId1,menuId2....]..//权限表示，-1代表由原关联权限获取到的菜单
	 *            ，>-1表示完全新增的菜单}..],新增关联的菜单
	 *            removeRefMenu：[menuId1,menuId2...]//删除关联的菜单。
	 *            excludeButtons:[{menuId
	 *            ,excludeButton:}...]//修改的排除菜单权限。这里只对已经选中的菜单才能有排除菜单按钮权限的操作。
	 * @param roleId
	 * @return
	 */
	public boolean insertRefMenu(Map<String, Object> data, int roleId) {
		try {
			BaseDAO.beginTransaction();
			@SuppressWarnings("unchecked")
			List<Long> addRefMenu = (List<Long>) data.get("addRefMenu");
			@SuppressWarnings("unchecked")
			List<Long> removeRefMenu = (List<Long>) data.get("removeRefMenu");
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> excludeButtons = (List<Map<String, Object>>) data.get("excludeButtons");
			// 此次需要新增入库的关联菜单数据。
			List<RoleMenuPO> insertRefMenus = new ArrayList<RoleMenuPO>();
			// 此次需要删除的关联菜单ID集合，menuId,UserId
			List<RoleMenuPO> deleteRefMenus = new ArrayList<RoleMenuPO>();
			// 此次需要update的关联菜单ID集合，menuId,UserId,excludeButton
			List<RoleMenuPO> updateRefMenus = new ArrayList<RoleMenuPO>();
			// 前台显示新增的关联菜单
			if (addRefMenu != null && addRefMenu.size() > 0) {
				for (Long addMenuId : addRefMenu) {
					RoleMenuPO roleMenuPO = new RoleMenuPO();
					roleMenuPO.setRoleId(roleId);
					roleMenuPO.setMenuId(addMenuId);
					roleMenuPO.setExcludeButton("");
					insertRefMenus.add(roleMenuPO);
				}
			}
			// 前台显示需要删除的关联菜单处理
			if (removeRefMenu != null && removeRefMenu.size() > 0) {
				for (Long deleteMenuId : removeRefMenu) {
					RoleMenuPO roleMenuPO = new RoleMenuPO();
					roleMenuPO.setRoleId(roleId);
					roleMenuPO.setMenuId(deleteMenuId);
					deleteRefMenus.add(roleMenuPO);
				}
			}
			// 前台显示已经修改了的排除按钮。
			if (excludeButtons != null && excludeButtons.size() > 0) {
				for (Map<String, Object> exclude : excludeButtons) {
					int menuId = Integer.parseInt(exclude.get("menuId").toString());
					RoleMenuPO roleMenuPO = new RoleMenuPO();
					roleMenuPO.setRoleId(roleId);
					roleMenuPO.setMenuId(menuId);
					roleMenuPO.setExcludeButton(Convert.toString(exclude.get("excludeButton")));
					updateRefMenus.add(roleMenuPO);
				}
			}
			// 实际数据库操作
			roleDAO.insertRoleMenuBatch(insertRefMenus);
			roleDAO.updateRoleMenuBatch(updateRefMenus);
			roleDAO.deleteMenuRoleByIdBatch(deleteRefMenus);
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("设置用户-菜单关联关系失败", e);
			BaseDAO.rollback();
			return false;
		}
		return true;
	}

	/**
	 * 修改角色-用户关联关系信息 多条修改
	 * 
	 * @param data
	 * @return
	 */
	public boolean updateRefUser(Map<String, Object> data[]) {
		try {
			BaseDAO.beginTransaction();
			for (int i = 0; i < data.length; i++) {
				UserRolePO userRolePO = new UserRolePO();
				// 用户ID
				int userId = Integer.parseInt(data[i].get("userId").toString());
				userRolePO.setUserId(userId);
				// 角色ID
				int roleId = Integer.parseInt(data[i].get("roleId").toString());
				userRolePO.setRoleId(roleId);
				// 赋予权限
				boolean isGrantFlag = Boolean.parseBoolean(data[i].get("grantFlag").toString());
				if (isGrantFlag) {
					userRolePO.setGrantFlag(1);
				} else {
					userRolePO.setGrantFlag(0);
				}
				// 管理权限
				boolean isMagFlag = Boolean.parseBoolean(data[i].get("magFlag").toString());
				if (isMagFlag) {
					userRolePO.setMagFlag(1);
				} else {
					userRolePO.setMagFlag(0);
				}
				roleDAO.updateUserRole(userRolePO);
				userRolePO = null;
			}
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("设置角色-用户关联关系失败", e);
			BaseDAO.rollback();
			return false;
		}
		return true;
	}

	/**
	 * 单条修改
	 * 
	 * @param data
	 * @return
	 */
	public boolean updateRefUserOne(Map<String, Object> data) {
		UserRolePO userRolePO = new UserRolePO();
		// 用户ID
		int userId = Integer.parseInt(data.get("userId").toString());
		userRolePO.setUserId(userId);
		// 角色ID
		int roleId = Integer.parseInt(data.get("roleId").toString());
		userRolePO.setRoleId(roleId);
		// 赋予权限
		boolean isGrantFlag = Boolean.parseBoolean(data.get("grantFlag").toString());
		if (isGrantFlag) {
			userRolePO.setGrantFlag(1);
		} else {
			userRolePO.setGrantFlag(0);
		}
		// 管理权限
		boolean isMagFlag = Boolean.parseBoolean(data.get("magFlag").toString());
		if (isMagFlag) {
			userRolePO.setMagFlag(1);
		} else {
			userRolePO.setMagFlag(0);
		}
		try {
			roleDAO.updateUserRole(userRolePO);
		} catch (Exception e) {
			LogUtils.error("修改用户-角色关联关系失败", e);
			return false;
		}
		return true;
	}

	/**
	 * 查询符合条件的角色-用户关联关系信息
	 * 
	 * @param condition 查询条件
	 * @return
	 */
	public List<Map<String, Object>> queryUserRole(Map<String, Object> condition, Page page) {

		if (page == null) {
			page = new Page(0, 10);// 每页10行
		}
		if (!SessionManager.isCurrentUserAdmin()) {
			condition.put("mguserId", SessionManager.getCurrentUserID());
		}
		return roleDAO.queryUserRoleByCondition(condition, page);
	}

	/**
	 * 对地域机构授权或取消
	 * 
	 * @param data JS传来的数据
	 * @return 被授权或取消的用户
	 */
	public int refUserBatch(Map<?, ?> data) {
		int count = -1;
		try {
			BaseDAO.beginTransaction();
			// 角色ID
			int roleId = Integer.parseInt(data.get("roleId").toString());
			// 岗位ID1,1,2
			String stationIds = Convert.toString(data.get("stationId"));
			// 地域ID
			String zoneIds = Convert.toString(data.get("zoneId"));
			// 部门ID
			String deptIds = Convert.toString(data.get("deptId"));
			// 授权或取消：1为授权，2为取消
			int status = Integer.parseInt(data.get("status").toString());
			// 实现角色的批量关联用户
			if (status == 1) {// 批量授权
				// 查出符合条件的用户
				int userIdsAll[] = userDAO.queryUserNotInUserRoleByRoleIdDim(roleId, stationIds, zoneIds, deptIds);
				count = userDAO.insertUserRoleBatch(userIdsAll, roleId).length;
			} else if (status == 2) {// 批量取消
				// 直接删除关联关系
				count = roleDAO.deleteUserRoleByRoleIdDim(roleId, stationIds, zoneIds, deptIds);
			}
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("对地域机构授权失败", e);
			BaseDAO.rollback();
			return -1;
		}
		return count;
	}

	/**
	 * 根据名字查询角色
	 * 
	 * @param
	 * @return
	 */
	public List<Map<String, Object>> queryRoleByName(Map<String, Object> userDatas, Page page) {
		int mgUserId = SessionManager.getCurrentUserID();
		if (!SessionManager.isCurrentUserAdmin()) {
			userDatas.put("mgUserId", mgUserId);
		} else {
			userDatas.remove(mgUserId);
		}
		return roleDAO.queryRoleByName(userDatas, page);
	}

	/**
	 * 判断当前用户是否具备某个角色的管理权限
	 * 
	 * @return
	 */
	public boolean isMagRole(int roleId) {
		if (SessionManager.isCurrentUserAdmin()) {
			// 是管理员，有权限
			return true;
		} else {
			return roleDAO.isMagRole(SessionManager.getCurrentUserID(), roleId) != 0;
		}
	}

	/**
	 * 验证权限名字是否重复
	 * 
	 * @param
	 * @return
	 */
	public boolean valiHasRoleName(String roleName) {
		boolean flag = false;
		List<Map<String, Object>> mapList = roleDAO.queryRoleByName(roleName);
		if (mapList.size() == 0) {
			flag = true;

		}
		return flag;
	}

	public void setMenuDAO(MenuDAO menuDAO) {
		this.menuDAO = menuDAO;
	}

	public void setUserDAO(UserDAO userDAO) {
		this.userDAO = userDAO;
	}

	public void setRoleDAO(RoleDAO roleDAO) {
		this.roleDAO = roleDAO;
	}
}
