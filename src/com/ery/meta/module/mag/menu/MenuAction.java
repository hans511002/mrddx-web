package com.ery.meta.module.mag.menu;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.OprResult;
import com.ery.meta.sys.i18n.I18nManager;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.web.init.SystemVariableInit;

/**

 * 

 * @description 菜单控制类 <br>
 * @date 2011-09-16
 * 
 * @modify 王春生 新增方法queryMenuById
 * @modifyDate 2012-3-15
 */

public class MenuAction {
	/**
	 * Menu DAO
	 */
	private MenuDAO menuDAO;

	private MetaSysI18nItemDAO metaSysI18nItemDAO;

	private MetaSysI18nResourceDAO metaSysI18nResourceDAO;

	/**
	 * 获取菜单所属系统列表。
	 * 
	 * @return
	 */
	public List<Map<String, Object>> queryMenuSystem() {
		return menuDAO.queryMenuSystem();
	}

	/**
	 * 加载menu treeGrid树
	 * 
	 * @param queryData
	 * @return
	 */
	public List<Map<String, Object>> queryMenuTreeData(Map<Object, Object> queryData) {
		if (queryData == null) {// 如果queryData为空，则默认查询GroupId为1的菜单
			queryData = new HashMap<Object, Object>();
			queryData.put("belongSys", MenuConstant.DEFAULT_SYSTEM_ID); // 设置所属系统默认为1
		}
		return menuDAO.queryMenu(queryData);
	}

	/**
	 * 动态加载子菜单
	 * 
	 * @param parentId
	 * @return
	 */
	public List<Map<String, Object>> querySubMenu(Integer parentId) {
		return menuDAO.querySubMenu(parentId);
	}

	/**
	 * 加载菜单指定层级的最大、最小序列，即orderId
	 * 
	 * @param parentId
	 * @return {maxOrder: minOrder}
	 */
	public Map<String, Object> queryMaxMinOrder(Integer parentId) {
		return menuDAO.queryMaxMinOrder(parentId);
	}

	/**
	 * 查询某菜单信息
	 * 
	 * @param id
	 * @return

	 */
	public Map<String, Object> queryMenuById(int id) {
		return menuDAO.queryMenuById(id);
	}

	/**
	 * 新增菜单。
	 * 
	 * @param data
	 * @return
	 */
	public OprResult<?, ?> insertMenu(Map<String, Object> data) {
		// 浏览器状态进行处理
		int navState = 0;

		if (data.containsKey("isMax") && Integer.parseInt(data.get("isMax").toString()) == 1) {
			navState += 1;
		}
		if (data.containsKey("isScroll") && Integer.parseInt(data.get("isScroll").toString()) == 1) {
			navState += 2;
		}
		if (data.containsKey("isMenuBar") && Integer.parseInt(data.get("isMenuBar").toString()) == 1) {
			navState += 4;
		}
		if (data.containsKey("isStatusBar") && Integer.parseInt(data.get("isStatusBar").toString()) == 1) {
			navState += 8;
		}
		if (data.containsKey("isLinkBar") && Integer.parseInt(data.get("isLinkBar").toString()) == 1) {
			navState += 16;
		}

		data.put("navState", navState);
		OprResult<Integer, Map<String, Object>> result = null;
		try {
			BaseDAO.beginTransaction();
			// 构建结果
			result = new OprResult<Integer, Map<String, Object>>(null, menuDAO.insertMenu(data),
					OprResult.OprResultType.insert);
			// 查询刚新增的数据
			result.setSuccessData(menuDAO.queryMenuById(Integer.parseInt(result.getTid().toString())));
			BaseDAO.commit();
			return result;
		} catch (Exception e) {
			LogUtils.error(null, e);
			BaseDAO.rollback();
			result = new OprResult<Integer, Map<String, Object>>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 修改菜单
	 * 
	 * @param data
	 * @return
	 */
	public OprResult<?, ?> updateMenu(Map<String, Object> data) {
		// 浏览器状态进行处理
		int navState = 0;
		if (data.containsKey("isMax") && Integer.parseInt(data.get("isMax").toString()) == 1) {
			navState += 1;
		}
		if (data.containsKey("isScroll") && Integer.parseInt(data.get("isScroll").toString()) == 1) {
			navState += 2;
		}
		if (data.containsKey("isMenuBar") && Integer.parseInt(data.get("isMenuBar").toString()) == 1) {
			navState += 4;
		}
		if (data.containsKey("isStatusBar") && Integer.parseInt(data.get("isStatusBar").toString()) == 1) {
			navState += 8;
		}
		if (data.containsKey("isLinkBar") && Integer.parseInt(data.get("isLinkBar").toString()) == 1) {
			navState += 16;
		}
		data.put("navState", navState);
		OprResult<Integer, Map<String, Object>> result = null;
		try {
			BaseDAO.beginTransaction();
			menuDAO.updateMenuById(data);
			// 构建结果
			result = new OprResult<Integer, Map<String, Object>>(Integer.parseInt(data.get("menuId").toString()),
					Integer.parseInt(data.get("menuId").toString()), OprResult.OprResultType.update);
			// 查询刚新增的数据
			result.setSuccessData(menuDAO.queryMenuById(Integer.parseInt(result.getSid().toString())));
			BaseDAO.commit();
			return result;
		} catch (Exception e) {
			LogUtils.error(null, e);
			BaseDAO.rollback();
			result = new OprResult<Integer, Map<String, Object>>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 删除一条菜单，其子菜单的层级依次往上移
	 * 
	 * @param menuId
	 * @return
	 */
	public OprResult<?, ?> deleteMenus(int menuId, int parentId) {
		OprResult<Integer, Map<String, Object>> result = null;
		try {
			BaseDAO.beginTransaction();
			// 第一步，修改被删除菜单的父ID等于被删除菜单的父ID，也即树层级上移
			menuDAO.updateParentId(parentId, menuId); // 以父ID作为条件修改
			// 接着再删除指定的ID的菜单
			menuDAO.deleteMenuById(menuId);
			// 删除与Menu有关的关系表。
			menuDAO.deleteMenuRole(menuId);
			menuDAO.deleteMenuUser(menuId);
			result = new OprResult<Integer, Map<String, Object>>(menuId, null, OprResult.OprResultType.delete);
			BaseDAO.commit();
			return result;
		} catch (Exception e) {
			LogUtils.error(null, e);
			result = new OprResult<Integer, Map<String, Object>>(menuId, null, OprResult.OprResultType.error);
			return result;
		}
	}

	/**
	 * 层次与序号的更改。
	 * 
	 * @param levelData 数据结构如下： [ { menuId, orderId,parentId, } ... ]
	 * @param orderData 排序数据，以menuID作为主键，orderId作为键值。
	 * @return
	 * @throws Exception
	 */
	public boolean changeLevel(List<Map<String, Object>> levelData, Map<String, Long> orderData) {
		try {
			BaseDAO.beginTransaction();
			menuDAO.updateBatchLevel(levelData);
			menuDAO.updateBatchOrder(orderData);
			BaseDAO.commit();
			return true;
		} catch (Exception e) {
			LogUtils.error(null, e);
			BaseDAO.rollback();
			return false;
		}
	}

	/**
	 * 返回对应菜单的本地化信息
	 * 
	 * @param menuId
	 * @return {localResource:[],localItem:[]}
	 */
	public Map<String, Object> queryLocalDetail(int menuId, String menuUrl) {
		try {
			BaseDAO.beginTransaction();
			;
			List<Map<String, Object>> localResource = metaSysI18nResourceDAO.queryByMenuId(menuId);
			List<Map<String, Object>> tmpLocalItem = metaSysI18nItemDAO.queryByMenuId(menuId);
			if (menuUrl != null && !menuUrl.startsWith("\\")) {
				menuUrl = "\\" + menuUrl;
			}
			List<Map<String, Object>> tmpLocalJSP = new ArrayList<Map<String, Object>>();
			try {
				tmpLocalJSP = MetaResourceParse.parseI118n(SystemVariableInit.WEB_ROOT_PATH + menuUrl, menuId);
			} catch (Exception e) {
				e.printStackTrace(); // To change body of catch statement use
										// File | Settings | File Templates.
			}

			List<Map<String, Object>> localJSP = new ArrayList<Map<String, Object>>();
			List<Map<String, Object>> localItem = new ArrayList<Map<String, Object>>();
			// 数据库中不存在则添加，存在则以数据库中值为准
			for (Map<String, Object> m : tmpLocalJSP) {
				if (!metaSysI18nItemDAO.isExist(Convert.toString(m.get("I18N_ITEM_CODE")),
						Convert.toInt(m.get("MENU_ID")))) {
					localJSP.add(m);
				}
			}
			if (localJSP.size() > 0) {
				metaSysI18nItemDAO.insertCode(localJSP);
			}
			// TODO 将数据库中没有的插入多余的删除
			for (Map<String, Object> mDB : tmpLocalItem) {
				boolean exist = false;
				for (Map<String, Object> mJSP : tmpLocalJSP) {
					if (Convert.toString(mDB.get("I18N_ITEM_CODE"))
							.equals(Convert.toString(mJSP.get("I18N_ITEM_CODE")))) {
						exist = true;
					}
				}
				if (!exist) {// 删除
					metaSysI18nItemDAO.deleteLocal(Convert.toString(mDB.get("I18N_ITEM_CODE")), menuId);
				} else {
					localItem.add(mDB);
				}
			}

			localItem.addAll(localJSP);
			Map<String, Object> rtn = new HashMap<String, Object>();
			rtn.put("localResource", localResource);
			rtn.put("localItem", localItem);
			BaseDAO.commit();
			return rtn;
		} catch (Exception e) {
			e.printStackTrace();
			BaseDAO.rollback();
			return new HashMap<String, Object>();
		}
	}

	/**
	 * 保存本地化信息
	 * 
	 * @param data
	 * @return
	 */
	public boolean updateLocalInfo(Map<String, Object> data) {
		try {
			BaseDAO.beginTransaction();
			int menuId = Convert.toInt(data.get("menuId"), 0);
			List<Map<String, String>> itemData = data.get("itemData") == null ? null : (List<Map<String, String>>) data
					.get("itemData");
			List<Map<String, String>> resourceData = data.get("resourceData") == null ? null
					: (List<Map<String, String>>) data.get("resourceData");
			if (itemData != null) {
				metaSysI18nItemDAO.updateItemInfo(menuId, itemData);
			}
			if (resourceData != null) {
				metaSysI18nResourceDAO.updateResourceInfo(menuId, resourceData);
			}
			BaseDAO.commit();
			I18nManager.clear();
			I18nManager.load();
			return true;
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("", e);
			return false;
		}
	}

	public void setMenuDAO(MenuDAO menuDAO) {
		this.menuDAO = menuDAO;
	}

	public void setMetaSysI18nItemDAO(MetaSysI18nItemDAO metaSysI18nItemDAO) {
		this.metaSysI18nItemDAO = metaSysI18nItemDAO;
	}

	public void setMetaSysI18nResourceDAO(MetaSysI18nResourceDAO metaSysI18nResourceDAO) {
		this.metaSysI18nResourceDAO = metaSysI18nResourceDAO;
	}
}
