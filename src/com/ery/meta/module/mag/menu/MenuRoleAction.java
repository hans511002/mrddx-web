package com.ery.meta.module.mag.menu;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.OprResult;
import com.ery.meta.common.Page;
import com.ery.meta.module.mag.role.RoleDAO;
import com.ery.meta.module.mag.role.RoleMenuPO;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;


public class MenuRoleAction {

	private MenuDAO menuDAO; // 菜单的dao
	private RoleDAO roleDAO; // 角色的dao

	/**
	 * 加载拥有该菜单的角色
	 * */
	public List<Map<String, Object>> queryMenuRole(Map<String, String> map, Page page) {
		if (page == null) {// 如果没有page，为第一页。
			page = new Page(0, 20);
		}
		return menuDAO.queryMenuRole(map, null);
	}

	/**
	 * 按条件查询没有该菜单的角色
	 * */
	public List<Map<String, Object>> queryMenuRoleByCondition(Map<String, String> map, Page page) {
		if (page == null) {// 如果没有page，为第一页。
			page = new Page(0, 20);
		}
		return menuDAO.queryRoleByCondition(map, null);
	}

	/**
	 * 菜单关联角色
	 * 
	 * @param map 页面选择数据，其数据结构为：{ { add:[{menuId:,roleId},{}...],
	 *            del:{roleId,menuId:}
	 *            exclude:[{menuId,roleId,excluteButton},{}...] }
	 * @return
	 */
	public boolean insertMenuRoleByMenuId(Map<String, Object> map) {
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> addObj = (List<Map<String, Object>>) map.get("add");
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> delObj = (List<Map<String, Object>>) map.get("del");
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> excludeButtons = (List<Map<String, Object>>) map.get("exclude");
		boolean flag = true;
		try {
			BaseDAO.beginTransaction();
			if (addObj != null && addObj.size() > 0) {
				List<RoleMenuPO> roleMenuPOs = new ArrayList<RoleMenuPO>();
				for (int i = 0; i < addObj.size(); i++) {
					RoleMenuPO roleMenuPO = new RoleMenuPO();
					roleMenuPO.setMenuId(Integer.parseInt((addObj.get(i).get("menuId").toString())));
					roleMenuPO.setRoleId(Integer.parseInt((addObj.get(i).get("roleId").toString())));
					roleMenuPO.setExcludeButton("");
					roleMenuPOs.add(roleMenuPO);
				}
				roleDAO.insertRoleMenuBatch(roleMenuPOs);
			}
			if (delObj != null && delObj.size() > 0) {
				List<RoleMenuPO> roleMenuPOs = new ArrayList<RoleMenuPO>();
				for (int i = 0; i < delObj.size(); i++) {
					RoleMenuPO roleMenuPO = new RoleMenuPO();
					roleMenuPO.setMenuId(Integer.parseInt((delObj.get(i).get("menuId").toString())));
					roleMenuPO.setRoleId(Integer.parseInt((delObj.get(i).get("roleId").toString())));
					roleMenuPOs.add(roleMenuPO);
				}
				roleDAO.deleteMenuRoleByIdBatch(roleMenuPOs);
			}
			if (excludeButtons != null && excludeButtons.size() > 0) {
				List<RoleMenuPO> roleMenuPOs = new ArrayList<RoleMenuPO>();
				for (int i = 0; i < excludeButtons.size(); i++) {
					RoleMenuPO roleMenuPO = new RoleMenuPO();
					roleMenuPO.setMenuId(Integer.parseInt((excludeButtons.get(i).get("menuId").toString())));
					roleMenuPO.setRoleId(Integer.parseInt((excludeButtons.get(i).get("roleId").toString())));
					roleMenuPO.setExcludeButton(excludeButtons.get(i).get("excludeButton").toString());
					roleMenuPOs.add(roleMenuPO);
				}
				roleDAO.updateRoleMenuBatch(roleMenuPOs);
			}
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("设置权限与菜单关联关系出错", e);
			flag = false;
		}
		return flag;
	}

	/**
	 * 删除已经拥有某菜单的角色
	 * */
	public OprResult<?, ?>[] deleteMenuRoleByMenuId(Map<String, Object> map) {
		int menuId = 0;
		OprResult<?, ?> result[] = null;
		String menuIdStr = String.valueOf(map.get("menuId"));
		if (menuIdStr != null) {
			menuId = Integer.valueOf(menuIdStr);
		}
		String roleIdsStr = String.valueOf(map.get("roleIds"));
		if (roleIdsStr != null && roleIdsStr != "") {
			int roleArr[] = new int[roleIdsStr.split(",").length];
			for (int i = 0; i < roleArr.length; i++) {
				roleArr[i] = Integer.valueOf((roleIdsStr.split(",")[i]));
			}
			result = new OprResult[roleArr.length];
			try {
				BaseDAO.beginTransaction();
				roleDAO.deleteMenuRoleById(menuId, roleIdsStr);
				BaseDAO.commit();
				for (int i = 0; i < result.length; i++) {
					result[i] = new OprResult<Integer, Object>(roleArr[i], null, OprResult.OprResultType.delete);
				}
			} catch (Exception e) {
				BaseDAO.rollback();
				LogUtils.error("删除菜单与用户关联关系出错", e);
				for (int i = 0; i < result.length; i++) {
					result[i] = new OprResult<Integer, Object>(roleArr[i], null, OprResult.OprResultType.error);
				}
			}// end catch
		}// end if userIdsStr
		return result;
	}

	public void setMenuDAO(MenuDAO menuDAO) {
		this.menuDAO = menuDAO;
	}

	public void setRoleDAO(RoleDAO roleDAO) {
		this.roleDAO = roleDAO;
	}

}
