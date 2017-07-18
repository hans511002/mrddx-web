package com.ery.meta.module.mag.group;

import java.util.List;
import java.util.Map;

import com.ery.base.support.utils.Convert;
import com.ery.meta.common.Constant;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

/**
 * 
 * 
 * 
 * @description 业务系统增删改查数据库访问类 <br>
 * @date 2011-10-18
 */
public class GroupDAO extends MetaBaseDAO {

	/**
	 * 根据系统ID取得系统信息
	 * 
	 * @param groupId
	 *            系统ID
	 * @return 系统信息
	 */
	public Map<String, Object> queryGroupById(int groupId) {
		String sql = "SELECT GROUP_ID, GROUP_NAME, GROUP_SN, GROUP_STATE, GROUP_LOGO, " +
				"DEFAULT_SKIN, FRAME_URL FROM META_MENU_GROUP WHERE GROUP_ID=" + groupId;
		return getDataAccess().queryForMap(sql);
	}

	/**
	 * 获取所有的菜单系统
	 * 
	 * @return 如果dhtmlxMapper==null,返回LIST<MAP<STRING,OBJECT> 返回格式化后的数据
	 */
	public List<Map<String, Object>> queryAllSystem() {
		String sql = "SELECT GROUP_ID,GROUP_NAME,GROUP_SN,GROUP_STATE,GROUP_LOGO, "
				+ "DEFAULT_SKIN FROM META_MENU_GROUP ORDER BY GROUP_SN ";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 根据前台条件取得符合条件的系统列表
	 * 
	 * @param queryData
	 *            查询条件
	 * @param page
	 *            分页对象
	 * @return 符合条件的系统列表
	 */
	public List<Map<String, Object>> queryGroup(Map<?, ?> queryData, Page page) {
		String sql = "SELECT T.SYS_ID AS GROUP_ID,T.SYS_NAME AS GROUP_NAME " + "FROM META_SYS T WHERE 1 = 1";
		String proParams = "";
		if (queryData != null && queryData.containsKey("groupName")) {
			sql = sql + " AND T.SYS_NAME LIKE  " +
					SqlUtils.allLikeParam(Convert.toString(queryData.get("groupName")).trim());
			// proParams = ("%" +
			// Convert.toString(queryData.get("groupName")).trim() + "%");
		}
		sql = sql + " ORDER BY T.SYS_ID";
		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(getDataAccess(), sql, page);
		}
		if (!proParams.equals("")) {
			return getDataAccess().queryForList(sql, proParams);
		} else {
			return getDataAccess().queryForList(sql);
		}
	}

	/**
	 * 查询业务系统
	 * 
	 * @param queryData
	 *            查询条件
	 * @param page
	 *            分页对象
	 * @return 符合条件的系统列表
	 */

	public List<Map<String, Object>> querySysGroup(Map<?, ?> queryData, Page page) {
		String sql = "SELECT  GROUP_ID, GROUP_NAME,GROUP_STATE,GROUP_SN,FRAME_URL "
				+ "FROM META_MENU_GROUP T WHERE 1 = 1";
		String proParams = "";
		if (queryData != null && queryData.containsKey("groupName")) {
			sql = sql + " AND T.GROUP_NAME LIKE  " +
					SqlUtils.allLikeParam(Convert.toString(queryData.get("groupName")).trim());
			// proParams = ("%" +
			// Convert.toString(queryData.get("groupName")).trim() + "%");
		}
		sql = sql + " ORDER BY T.GROUP_ID";
		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(getDataAccess(), sql, page);
		}
		if (!proParams.equals("")) {
			return getDataAccess().queryForList(sql, proParams);
		} else {
			return getDataAccess().queryForList(sql);
		}
	}

	/**
	 * 判断系统名groupName是否已经存在
	 * 
	 * @return
	 */
	public boolean hasGroupByName(String groupName) {
		boolean result = false;
		String sql = "SELECT GROUP_NAME FROM META_MENU_GROUP WHERE GROUP_NAME='" + groupName + "'";
		List data = getDataAccess().queryForList(sql);

		if (data.size() > 0) {
			result = true;
		}
		return result;
	}

	/**
	 * 判断序列是否已经存在
	 * 
	 * @return
	 */
	public boolean hasGroupByGroupSn(String groupSn) {
		boolean result = false;
		String sql = "SELECT GROUP_SN FROM META_MENU_GROUP WHERE GROUP_SN='" + groupSn + "'";
		List data = getDataAccess().queryForList(sql);

		if (data.size() > 0) {
			result = true;
		}
		return result;
	}

	/**
	 * 新增系统
	 * 
	 * @param data
	 *            被新增的数据
	 * @return 新增后的数据的主键ID值
	 * @throws Exception
	 */
	public long insertGroup(Map<?, ?> data) throws Exception {
		String sql = "INSERT INTO META_MENU_GROUP " + " (GROUP_ID, GROUP_NAME, GROUP_SN, GROUP_STATE, GROUP_LOGO, "
				+ " DEFAULT_SKIN, FRAME_URL) " + " VALUES " + " (?, ?, ?, ?, ?, " + " ?, ?) ";
		Object proParams[] = new Object[7];
		long pk = super.queryForNextVal("SEQ_MAG_GROUP_ID");
		proParams[0] = (pk);
		proParams[1] = (Convert.toString(data.get("groupName")).trim());
		proParams[2] = (Convert.toString(data.get("groupSn")));
		if (data.get("groupState") != null && !data.get("groupState").equals("")) {
			proParams[3] = (Convert.toString(data.get("groupState")));
		} else {
			proParams[3] = Constant.META_ENABLE;
		}
		proParams[4] = (Convert.toString(data.get("groupLogo")));
		proParams[5] = (Convert.toString(data.get("defaultSkin")));
		proParams[6] = (Convert.toString(data.get("frameUrl")).trim());
		getDataAccess().execUpdate(sql, proParams);
		return pk;
	}

	/**
	 * 修改系统信息
	 * 
	 * @param data
	 *            修改后的信息
	 * @return
	 * @throws Exception
	 */
	public int updateGroup(Map<?, ?> data) throws Exception {
		String sql = "UPDATE META_MENU_GROUP SET GROUP_NAME=?,GROUP_STATE=?,GROUP_SN=?,FRAME_URL=? WHERE GROUP_ID=?";
		Object proParams[] = new Object[5];
		proParams[0] = (Convert.toString(data.get("groupName")).trim());
		if (data.get("groupState") != null && !data.get("groupState").equals("")) {
			proParams[1] = (Integer.parseInt(data.get("groupState").toString()));
		} else {
			proParams[1] = Constant.META_ENABLE;
		}
		proParams[2] = (Integer.parseInt(data.get("groupSn").toString()));
		proParams[3] = (Convert.toString(data.get("frameUrl").toString()).trim());
		proParams[4] = (Integer.parseInt(data.get("groupId").toString()));
		return getDataAccess().execUpdate(sql, proParams);
	}

	/**
	 * 删除系统信息
	 * 
	 * @param groupIds
	 *            被删除的系统信息ID
	 * @return
	 * @throws Exception
	 */
	public int deleteGroupByGroupIds(int[] groupIds) throws Exception {
		if (groupIds != null && groupIds.length > 0) {
			StringBuffer sql = new StringBuffer("DELETE FROM META_MENU_GROUP WHERE GROUP_ID IN (");
			for (int i = 0; i < groupIds.length; i++) {
				sql.append(groupIds[i]);
				if (i != groupIds.length - 1) {
					sql.append(",");
				}
			}
			sql.append(")");
			return getDataAccess().execUpdate(sql.toString());
		} else {
			return -1;
		}
	}

}
