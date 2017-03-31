package com.ery.meta.module.mag.group;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.OprResult;
import com.ery.meta.common.Page;
import com.ery.meta.module.mag.menu.MenuDAO;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;

/**

 * 

 * @description 业务系统增删改查控制类 <br>
 * @date 2011-10-18
 */
public class GroupAction {
	/**
	 * 数据处理类
	 */
	private GroupDAO groupDAO;
	private MenuDAO menuDAO;

	/**
	 * 根据前台条件查询系统
	 * 
	 * @param queryData 查询条件
	 * @param page 分页对象
	 * @return 符合条件的列表
	 */
	public List<Map<String, Object>> queryGroup(Map<?, ?> queryData, Page page) {
		if (page == null) {// 如果没有page，为第一页。
			page = new Page(0, 20);
		}
		List<Map<String, Object>> list = groupDAO.queryGroup(queryData, page);
		return list;
	}

	/**
	 * 查询业务系统
	 * 
	 * @param queryData 查询条件
	 * @param page 分页对象
	 * @return 符合条件的系统列表
	 */
	public List<Map<String, Object>> querySysGroup(Map<?, ?> queryData, Page page) {
		if (page == null) {// 如果没有page，为第一页。
			page = new Page(0, 20);
		}
		List<Map<String, Object>> list = groupDAO.querySysGroup(queryData, page);
		return list;
	}

	/**
	 * 新增系统
	 * 
	 * @param data
	 * @return
	 */
	public OprResult<?, ?> insertGroup(Map<String, Object> data) {
		OprResult<Integer, Object> result = null;
		try {
			if (groupDAO.hasGroupByName(Convert.toString(data.get("groupName")).trim())) {
				return result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.nameExist);
			}

			// if(groupDAO.hasGroupByGroupSn(Convert.toString(data.get("groupSn")).trim()))
			// {
			// return result = new OprResult<Integer,Object>(null, null,
			// OprResult.OprResultType.snExist);
			// }

			result = new OprResult<Integer, Object>(null, Integer.parseInt(groupDAO.insertGroup(data) + ""),
					OprResult.OprResultType.insert);
			// 查询刚新增的数据
			result.setSuccessData(groupDAO.queryGroupById(Integer.parseInt(result.getTid().toString())));
		} catch (Exception e) {
			LogUtils.error("新增系统信息失败", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 修改系统信息
	 * 
	 * @param data 修改信息
	 * @return
	 */
	public OprResult<?, ?> updateGroup(Map<String, Object> data) {
		OprResult<Integer, Object> result = null;
		try {
			// 系统ID
			int groupId = data.get("groupId") == null ? null : Integer.parseInt(data.get("groupId").toString());

			Map oldMap = groupDAO.queryGroupById(groupId);

			String GroupSn = "";
			String GroupName = "";
			for (int i = 0; i < oldMap.size(); i++) {
				GroupSn = oldMap.get("GROUP_SN").toString();
				GroupName = oldMap.get("GROUP_NAME").toString();
			}

			if (groupDAO.hasGroupByName(Convert.toString(data.get("groupName")).trim())) {
				if (!GroupName.equals(Convert.toString(data.get("groupName")).trim()))
					return result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.nameExist);
			}

			// if(groupDAO.hasGroupByGroupSn(Convert.toString(data.get("groupSn")).trim()))
			// {
			// if(!GroupSn.equals(Convert.toString(data.get("groupSn")).trim()))
			// return result = new OprResult<Integer,Object>(null, null,
			// OprResult.OprResultType.snExist);
			// }

			result = new OprResult<Integer, Object>(null, groupDAO.updateGroup(data), OprResult.OprResultType.update);
			result.setSuccessData(groupDAO.queryGroupById(groupId));
		} catch (Exception e) {
			LogUtils.error("修改系统信息失败", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 删除系统信息
	 * 
	 * @param groupIdStr
	 * @return
	 */
	public OprResult<?, ?>[] deleteGroup(String groupIdStr) {
		// 前台传入的ID是字符串形式以逗号隔开
		int groupId[] = new int[groupIdStr.split(",").length];
		for (int i = 0; i < groupId.length; i++) {
			groupId[i] = Integer.parseInt(groupIdStr.split(",")[i]);
		}
		OprResult<?, ?> result[] = new OprResult[groupId.length];
		try {
			BaseDAO.beginTransaction();
			groupDAO.deleteGroupByGroupIds(groupId);
			BaseDAO.commit();
			for (int i = 0; i < result.length; i++) {
				result[i] = new OprResult<Integer, Object>(groupId[i], null, OprResult.OprResultType.delete);
			}
			return result;
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("删除系统信息失败", e);
			for (int i = 0; i < result.length; i++) {
				result[i] = new OprResult<Integer, Object>(groupId[i], null, OprResult.OprResultType.error);
			}
			return result;
		}
	}

	/**
	 * 查询系统所属菜单
	 * 
	 * @param groupId 系统ID
	 * @return
	 */
	public List<Map<String, Object>> queryMenuTreeData(Integer groupId) {
		Map<Object, Object> queryData = new HashMap<Object, Object>();
		queryData.put("belongSys", groupId);
		List<Map<String, Object>> menuTree = menuDAO.queryMenu(queryData);
		return menuTree;
	}

	/**
	 * 根据父节点查询子节点
	 * 
	 * @param parentId 父节点ID
	 * @return
	 */
	public List<Map<String, Object>> querySubMenu(Integer parentId) {
		List<Map<String, Object>> menuTree = menuDAO.querySubMenu(parentId);

		return menuTree;
	}

	/**
	 * 查询业务系统最大序列
	 * 
	 * @return
	 */
	public int queryMaxGroupSN() {
		return menuDAO.queryMaxGroupSN();
	}

	public void setGroupDAO(GroupDAO groupDAO) {
		this.groupDAO = groupDAO;
	}

	public void setMenuDAO(MenuDAO menuDAO) {
		this.menuDAO = menuDAO;
	}

}
