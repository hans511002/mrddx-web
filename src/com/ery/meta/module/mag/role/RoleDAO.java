package com.ery.meta.module.mag.role;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.module.mag.user.UserConstant;
import com.ery.meta.module.mag.user.UserRolePO;

import com.ery.base.support.jdbc.IParamsSetter;
import com.ery.base.support.utils.Convert;

/**

 * 该类是角色相关操作DAO类，用于连接数据库操作，供RoleAction调用 包括但不仅包括角色的增、删、改、查、关联菜单、关联用户等功能
 * 其中还有角色-菜单关系表的维护方法
 * 

 * @date 2011-9-26 ----------------------
 * @modify 张伟
 * @date 2011-10-2 添加分页设置
 * @modifyDate
 */
public class RoleDAO extends MetaBaseDAO {

	/**
	 * 查询符合条件的角色信息
	 * 
	 * @param queryData 查询条件
	 * @param page 分页参数。
	 * @return 角色列表
	 */
	public List<Map<String, Object>> queryRoles(Map<?, ?> queryData, Page page) {
		StringBuffer sql = new StringBuffer("SELECT ROLE_ID, ROLE_NAME, ROLE_DESC, ROLE_STATE, CREATE_DATE "
				+ "FROM META_MAG_ROLE WHERE 1=1 ");
		Object roleName = queryData.get("roleName");
		Object roleState = queryData.get("roleState");
		List<Object> params = new ArrayList<Object>();
		if (roleName != null && !"".equals(roleName)) {
			sql.append("AND ROLE_NAME LIKE  " + SqlUtils.allLikeParam(Convert.toString(roleName).trim()));
			// params.add("%" + Convert.toString(roleName).trim() + "%");
		}
		if (roleState != null && Integer.parseInt(String.valueOf(roleState)) != -1) {
			sql.append("AND ROLE_STATE=?");
			params.add(Integer.parseInt(Convert.toString(roleState)));
		}
		String pageSql = sql.toString();
		pageSql = pageSql + " ORDER by ROLE_ID ";
		// 分页包装
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}
		return getDataAccess().queryForList(pageSql, params.toArray());
	}

	/**
	 * 添加角色信息
	 * 
	 * @param data 表单数据
	 * @return 操作结果
	 * @throws Exception
	 */
	public Object insertRole(Map<?, ?> data) throws Exception {
		StringBuffer sql = new StringBuffer("INSERT INTO META_MAG_ROLE");
		sql.append("(ROLE_ID, ROLE_NAME, ROLE_DESC, ROLE_STATE)");
		sql.append("VALUES(?,?,?,?)");
		List<Object> proParams = new ArrayList<Object>();
		int pk = (int) super.queryForNextVal("SEQ_MAG_ROLE_ID");
		proParams.add(pk);
		proParams.add(data.get("roleName"));
		proParams.add(data.get("roleDesc"));
		proParams.add(data.get("roleState"));// 角色状态
		getDataAccess().execUpdate(sql.toString(), proParams.toArray());
		return pk;
	}

	/**
	 * 修改角色信息
	 * 
	 * @param data 表单信息
	 * @return 操作结果
	 * @throws Exception
	 */
	public int updateRole(Map<?, ?> data) throws Exception {
		String sql = "UPDATE META_MAG_ROLE SET ROLE_NAME=?, ROLE_DESC=?, ROLE_STATE=? WHERE ROLE_ID=?";
		List<Object> proParams = new ArrayList<Object>();
		if (data.containsKey("roleName")) {// 角色名称
			proParams.add(Convert.toString(data.get("roleName")));
		} else {
			proParams.add(null);
		}
		if (data.containsKey("roleDesc")) {// 角色描述
			proParams.add(Convert.toString(data.get("roleDesc")));
		} else {
			proParams.add(null);
		}
		if (data.containsKey("roleState")) {// 角色状态
			proParams.add(Integer.parseInt(String.valueOf(data.get("roleState"))));
		} else {
			proParams.add(null);
		}
		proParams.add(Integer.parseInt(String.valueOf(data.get("roleId"))));
		return getDataAccess().execUpdate(sql.toString(), proParams.toArray());
	}

	/**
	 * 根据role_id取得角色信息
	 * 
	 * @param roleId 角色ID
	 * @return 角色信息
	 */
	public Map<String, Object> queryRoleById(Integer roleId) {
		StringBuffer sql = new StringBuffer("SELECT ROLE_ID, ROLE_NAME, ROLE_DESC, ROLE_STATE, "
				+ "CREATE_DATE FROM META_MAG_ROLE WHERE ROLE_ID=?");
		return getDataAccess().queryForMap(sql.toString(), roleId);
	}

	/**
	 * 根据role_name取得角色信息
	 * 
	 * @param rolename 角色名称
	 * @return 角色信息
	 */
	public List<Map<String, Object>> queryUserByRoleName(String roleName) {
		String sql = "SELECT ROLE_ID, ROLE_NAME, ROLE_DESC, ROLE_STATE, "
				+ "CREATE_DATE FROM META_MAG_ROLE WHERE ROLE_NAME=?";
		getDataAccess().queryForList(sql);
		return getDataAccess().queryForList(sql, roleName);
	}

	public List<Map<String, Object>> queryUserMenuByUserBelogSys(int userId, int belongSys, int roleId) {
		String wherSql = "WHERE B.USER_ID = " + userId;
		if (userId == 1) {
			wherSql = "";
		}

		String sql = "select T1.MENU_ID,T1.PARENT_ID,T1.MENU_NAME,T1.MENU_TIP,T1.MENU_URL,T1.PAGE_BUTTON,T1.GROUP_ID,T1.ORDER_ID,T1.IS_SHOW,T1.CREATE_DATE,T1.ICON_URL,T1.TARGET,T1.USER_ATTR,"
				+ "T1.NAV_STATE,T1.USER_ATTR_LIST,T1.MENU_STATE "
				+ " from META_MAG_MENU T1,("
				+ " select b.menu_id,wmsys.wm_concat(b.exclude_button) exclude_buttons"
				+ " from META_MAG_USER_ROLE A, META_MAG_ROLE_MENU B"
				+ " where A.USER_ID = "
				+ userId
				+ " And a.grant_flag = 1"
				+ " and b.menu_id in ("
				+

				" SELECT distinct MENU_ID"
				+ "  FROM META_MAG_USER_ROLE A, META_MAG_ROLE_MENU B"
				+ "  WHERE A.USER_ID = "
				+ userId
				+ "   And a.grant_flag = 1"
				+ "    AND B.ROLE_ID = A.ROLE_ID"
				+ " minus"
				+ " select t.menu_id"
				+ "  from meta_mag_user_menu t"
				+ " where t.USER_ID = "
				+ userId
				+ "   and t.flag = 0)"
				+

				" and B.ROLE_ID = A.ROLE_ID"
				+ " and A.ROLE_ID = "
				+ roleId
				+ " group by b.menu_id) T2 where T1.Group_Id=1 and T1.Menu_Id=T2.menu_id";
		List<Map<String, Object>> data = getDataAccess().queryForList(sql);
		return data;
	}

	/**
	 * 根据ROLE_ID删除Role信息
	 * 
	 * @param roleIds 角色ID
	 * @return 执行的数据条数
	 * @throws Exception
	 */
	public int deleteRoleByRoleIds(int[] roleIds) throws Exception {
		if (roleIds != null && roleIds.length > 0) {
			StringBuffer sql = new StringBuffer("DELETE FROM META_MAG_ROLE WHERE ROLE_ID IN (");
			for (int i = 0; i < roleIds.length; i++) {
				sql.append(roleIds[i]);
				if (i != roleIds.length - 1) {
					sql.append(",");
				}
			}
			sql.append(")");
			return getDataAccess().execUpdate(sql.toString());
		} else {
			return -1;
		}
	}

	/**
	 * 新增角色菜单关联关系
	 * 
	 * @return 操作条数
	 * @throws Exception
	 */
	public int insertRoleMenu(RoleMenuPO roleMenuPO) throws Exception {
		String insert = "INSERT INTO META_MAG_ROLE_MENU(ROLE_ID,MENU_ID,EXCLUDE_BUTTON) VALUES(?,?,?)";
		Object[] proParams = new Object[3];
		proParams[0] = roleMenuPO.getRoleId();
		proParams[1] = roleMenuPO.getMenuId();
		proParams[2] = roleMenuPO.getExcludeButton();
		return getDataAccess().execUpdate(insert, proParams);
	}

	/**
	 * 批量新增一批角色关联数据
	 * 
	 * @param roleMenuPOs
	 * @return
	 * @throws Exception
	 */
	public int[] insertRoleMenuBatch(final List<RoleMenuPO> roleMenuPOs) throws Exception {
		String insert = "INSERT INTO META_MAG_ROLE_MENU(ROLE_ID,MENU_ID,EXCLUDE_BUTTON) VALUES(?,?,?)";
		return getDataAccess().execUpdateBatch(insert, new IParamsSetter() {
			public void setValues(PreparedStatement preparedStatement, int i) throws SQLException {
				RoleMenuPO roleMenuPO = roleMenuPOs.get(i);
				preparedStatement.setObject(1, roleMenuPO.getRoleId());
				preparedStatement.setObject(2, roleMenuPO.getMenuId());
				preparedStatement.setObject(3, roleMenuPO.getExcludeButton());
			}

			public int batchSize() {
				return roleMenuPOs.size();
			}
		});
	}

	/**
	 * 批量更新
	 * 
	 * @param roleMenuPOs
	 * @return
	 * @throws Exception
	 */
	public int[] updateRoleMenuBatch(final List<RoleMenuPO> roleMenuPOs) throws Exception {
		String update = "UPDATE META_MAG_ROLE_MENU SET EXCLUDE_BUTTON=? " + "WHERE ROLE_ID=? AND MENU_ID=?";
		return getDataAccess().execUpdateBatch(update, new IParamsSetter() {
			public void setValues(PreparedStatement proParams, int i) throws SQLException {
				RoleMenuPO roleMenuPO = roleMenuPOs.get(i);
				proParams.setObject(1, roleMenuPO.getExcludeButton());
				proParams.setObject(2, roleMenuPO.getRoleId());
				proParams.setObject(3, roleMenuPO.getMenuId());
			}

			public int batchSize() {
				return roleMenuPOs.size();
			}
		});
	}

	/**
	 * 批量删除菜单和角色中间表的关系
	 * 

	 * @param menuId int 菜单的id
	 * @param roleIds String 角色所有的id的集合
	 * @return int
	 * @throws Exception
	 * */
	public int deleteMenuRoleById(int menuId, String roleIds) throws Exception {
		String sql = null;
		int flag = -1;
		if (roleIds != null) {
			sql = "DELETE FROM META_MAG_ROLE_MENU WHERE MENU_ID=" + menuId + " AND ROLE_ID IN(" + roleIds + ")";
			flag = getDataAccess().execUpdate(sql);
		}
		return flag;
	}

	/**
	 * 批量删除
	 * 
	 * @param roleMenuPOs
	 * @return
	 * @throws Exception
	 */
	public int[] deleteMenuRoleByIdBatch(final List<RoleMenuPO> roleMenuPOs) throws Exception {
		String sql = "DELETE FROM META_MAG_ROLE_MENU WHERE MENU_ID=? AND ROLE_ID =?";
		return getDataAccess().execUpdateBatch(sql, new IParamsSetter() {
			public void setValues(PreparedStatement proParams, int i) throws SQLException {
				RoleMenuPO roleMenuPO = roleMenuPOs.get(i);
				proParams.setObject(1, roleMenuPO.getMenuId());
				proParams.setObject(2, roleMenuPO.getRoleId());
			}

			public int batchSize() {
				return roleMenuPOs.size();
			}
		});
	}

	/**
	 * 根据角色ID删除角色-用户关联关系信息
	 * 
	 * @param roleIds 角色ID
	 * @return 删除条数
	 * @throws Exception
	 */
	public int deleteUserRoleByRoleId(String[] roleIds, Integer userId) throws Exception {
		if (roleIds != null && roleIds.length > 0) {
			StringBuffer sql = new StringBuffer("DELETE FROM META_MAG_USER_ROLE WHERE ROLE_ID IN (");
			for (int i = 0; i < roleIds.length; i++) {
				sql.append(roleIds[i]);
				if (i != roleIds.length - 1) {
					sql.append(",");
				}
			}
			sql.append(") ");
			if (userId != null && userId > 0) {
				sql.append("AND USER_ID=" + userId);
			}
			return getDataAccess().execUpdate(sql.toString());
		} else {
			return -1;
		}
	}

	/**
	 * 根据角色ID删除角色-菜单关联关系信息
	 * 
	 * @param roleIds 角色ID
	 * @return 删除条数
	 * @throws Exception
	 */
	public int deleteRoleMenuByRoleId(int[] roleIds) throws Exception {
		if (roleIds != null && roleIds.length > 0) {
			StringBuffer sql = new StringBuffer("DELETE FROM META_MAG_ROLE_MENU WHERE ROLE_ID IN (");
			for (int i = 0; i < roleIds.length; i++) {
				sql.append(roleIds[i]);
				if (i != roleIds.length - 1) {
					sql.append(",");
				}
			}
			sql.append(") ");
			return getDataAccess().execUpdate(sql.toString());
		} else {
			return -1;
		}
	}

	/**
	 * 根据角色ID删除META_MAG_ROLE_ORG信息
	 * 
	 * @param roleIds 角色ID
	 * @return 删除条数
	 * @throws Exception
	 */
	public int deleteRoleOrgByRoleId(int[] roleIds) throws Exception {
		if (roleIds != null && roleIds.length > 0) {
			StringBuffer sql = new StringBuffer("DELETE FROM META_MAG_ROLE_ORG WHERE ROLE_ID IN (");
			for (int i = 0; i < roleIds.length; i++) {
				sql.append(roleIds[i]);
				if (i != roleIds.length - 1) {
					sql.append(",");
				}
			}
			sql.append(") ");
			return getDataAccess().execUpdate(sql.toString());
		} else {
			return -1;
		}
	}

	/**
	 * 根据管理员的的授予角色,查看用户管理的角色
	 * 
	 */
	public List<Map<String, Object>> queryUserRoleByMgUser(Map<?, ?> condition, int mguserId, boolean isAddmin) {
		StringBuffer sql = new StringBuffer(
				"SELECT A.USER_ID, A.ROLE_ID, A.GRANT_FLAG, A.MAG_FLAG, B.USER_NAMECN,C.ROLE_NAME,D.GRANT_FLAG MGGRANT_FLAG, D.MAG_FLAG  MGMAG_FLAG, "
						+ "C.ROLE_DESC FROM META_MAG_USER_ROLE A, META_MAG_USER B,META_MAG_USER_ROLE D, META_MAG_ROLE C "
						+ "WHERE A.USER_ID=B.USER_ID AND A.ROLE_ID=C.ROLE_ID  AND A.ROLE_ID = D.ROLE_ID  AND D.GRANT_FLAG = 1 ");
		List<Object> params = new ArrayList<Object>();
		if (!isAddmin) {
			sql.append("AND D.USER_ID =?");
			params.add(mguserId);
		} else {
			sql = new StringBuffer(
					"SELECT A.USER_ID, A.ROLE_ID, A.GRANT_FLAG, A.MAG_FLAG, B.USER_NAMECN,C.ROLE_NAME,1 MGGRANT_FLAG, 1  MGMAG_FLAG, "
							+ "C.ROLE_DESC FROM META_MAG_USER_ROLE A, META_MAG_USER B, META_MAG_ROLE C WHERE A.USER_ID=B.USER_ID AND A.ROLE_ID=C.ROLE_ID");
		}
		if (condition != null && condition.containsKey("userId")) {
			int userId = Integer.parseInt(condition.get("userId").toString());
			sql.append(" AND A.USER_ID=? ");
			params.add(userId);
		}

		return getDataAccess().queryForList(sql.toString(), params.toArray());

	}

	/**
	 * 判断用户是否具有某个权限的管理权限
	 * 
	 * @param userId
	 * @return
	 */
	public int isMagRole(int userId, int roleId) {
		String sql = "SELECT MAG_FLAG FROM META_MAG_USER_ROLE WHERE " + "USER_ID=" + userId + " AND ROLE_ID=" + roleId;
		return getDataAccess().queryForInt(sql);
	}

	/**
	 * 根据条件查询用户-角色关联关系信息
	 * 
	 * @param condition 查询条件
	 * @param page 分页参数
	 * @return 查询结果
	 */
	public List<Map<String, Object>> queryUserRoleByCondition(Map<?, ?> condition, Page page) {

		String zoneId = "", zoneSql = "", deptId = "", deptIdSql = "", stationId = "", stationIdSql = "";
		if (condition != null && condition.get("zoneId") != null) {
			zoneId = condition.get("zoneId").toString();
			zoneSql = "((SELECT b.zone_id,level zone_level  FROM META_DIM_ZONE B START WITH B.zone_id in (" + zoneId
					+ ") CONNECT BY PRIOR B.ZONE_ID = B.ZONE_PAR_ID " + ")) E,";
		}
		if (condition != null && condition.get("deptId") != null) {
			deptId = condition.get("deptId").toString();
			deptIdSql = "AND DEPT_ID IN (" + deptId + ")";
		}

		if (condition != null && condition.get("stationId") != null) {
			stationId = condition.get("stationId").toString();
			stationIdSql = "AND DEPT_ID IN (" + stationId + ")";
		}
		StringBuffer sql = new StringBuffer(
				"SELECT A.USER_ID, A.ROLE_ID, A.GRANT_FLAG, A.MAG_FLAG, B.USER_NAMECN,C.ROLE_NAME,B.USER_EMAIL, "
						+ "C.ROLE_DESC,zone_level FROM" + zoneSql
						+ "META_MAG_USER_ROLE A, META_MAG_USER B, META_MAG_ROLE C "
						+ "WHERE A.USER_ID=B.USER_ID AND A.ROLE_ID=C.ROLE_ID AND B.ZONE_ID = E.ZONE_ID" + stationIdSql
						+ deptIdSql);
		List<Object> params = new ArrayList<Object>();
		if (condition != null && condition.containsKey("roleId")) {
			int roleId = Integer.parseInt(condition.get("roleId").toString());
			sql.append(" AND A.ROLE_ID=? ");
			params.add(roleId);
		}
		if (condition != null && condition.containsKey("userId")) {
			int userId = Integer.parseInt(condition.get("userId").toString());
			sql.append(" AND A.USER_ID=? ");
			params.add(userId);
		}
		if (condition != null && condition.get("userName") != null && !condition.get("userName").toString().equals("")) {// 姓名
			sql.append("AND USER_NAMECN LIKE ? ESCAPE '/'");
			params.add(SqlUtils.allLikeBindParam(Convert.toString(condition.get("userName"))));
		}
		if (condition != null && condition.get("userState") != null
				&& !condition.get("userState").toString().equals("-1")) {// 状态
			sql.append("AND STATE=? ");
			params.add(Integer.parseInt(String.valueOf(condition.get("userState"))));
		}
		if (condition != null && condition.get("mguserId") != null && !condition.get("mguserId").toString().equals("")) {// 不能查询出自己
			sql.append("AND A.USER_ID !=? ");
			params.add(Integer.parseInt(String.valueOf(condition.get("mguserId"))));
		}
		// if(condition != null && condition.get("zoneId") != null
		// && !condition.get("zoneId").toString().equals("")){//地域
		// sql.append("AND ZONE_ID=? ");
		// params.add(Integer.parseInt(String.valueOf(condition.get("zoneId"))));
		// }
		// if(condition != null && condition.get("deptId") != null
		// && !condition.get("deptId").toString().equals("")){//部门
		// sql.append("AND DEPT_ID=? ");
		// params.add(Integer.parseInt(String.valueOf(condition.get("deptId"))));
		// }
		// if(condition != null && condition.get("stationId") != null
		// && !condition.get("stationId").toString().equals("")){//岗位
		// sql.append("AND STATION_ID=? ");
		// params.add(Integer.parseInt(String.valueOf(condition.get("stationId"))));
		// }
		sql.append(" ORDER BY zone_level, A.ROLE_ID");
		return getDataAccess().queryForList(
				page == null ? sql.toString() : SqlUtils.wrapPagingSql(sql.toString(), page), params.toArray());
	}

	/**
	 * 用户关联角色功能中，查询备选角色，不包含已存在的角色信息
	 * 
	 * @param queryData 查询条件
	 * @param page 分页信息
	 * @return 查询结果
	 */
	public List<Map<String, Object>> queryRolesNotInUserRole(Map<?, ?> queryData, Page page) {
		int userId = Integer.parseInt(queryData.get("userId").toString());
		String wheres = " AND ROLE_ID NOT IN (SELECT ROLE_ID FROM META_MAG_USER_ROLE WHERE USER_ID=" + userId
				+ ") ORDER BY ROLE_ID ";

		StringBuffer sql = new StringBuffer("SELECT ROLE_ID, ROLE_NAME, ROLE_DESC, ROLE_STATE, CREATE_DATE "
				+ "FROM META_MAG_ROLE WHERE 1=1 ");
		Object roleName = queryData.get("roleName");
		Object roleState = queryData.get("roleState");
		List<Object> params = new ArrayList<Object>();
		if (roleName != null && !"".equals(roleName)) {
			sql.append("AND ROLE_NAME LIKE ? ESCAPE '/'  ");
			params.add(SqlUtils.allLikeBindParam(Convert.toString(roleName)));
		}
		if (roleState != null && Integer.parseInt(String.valueOf(roleState)) != -1) {
			sql.append("AND ROLE_STATE=?");
			params.add(Integer.parseInt(Convert.toString(roleState)));
		}
		String pageSql = sql.toString();

		pageSql = pageSql + wheres;

		// 分页包装
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}
		return getDataAccess().queryForList(pageSql, params.toArray());
	}

	/**
	 * 更新用户-角色关联关系信息
	 * 
	 * @param userRolePO 用户-角色关系对象
	 * @return 操作成功与否
	 */
	public boolean updateUserRole(UserRolePO userRolePO) throws Exception {
		String updateSql = "update META_MAG_USER_ROLE SET GRANT_FLAG=" + userRolePO.getGrantFlag() + ",MAG_FLAG="
				+ userRolePO.getMagFlag() + " " + "WHERE USER_ID=" + userRolePO.getUserId() + " AND ROLE_ID="
				+ userRolePO.getRoleId();
		return getDataAccess().execUpdate(updateSql) > -1;
	}

	/**
	 * 根据角色取得角色-菜单对应关系信息
	 * 
	 * @param roleId 角色ID
	 * @return 查询结果
	 */
	public List<Map<String, Object>> queryRoleMenuByRoleId(int roleId) {
		String sql = "SELECT ROLE_ID, MENU_ID, EXCLUDE_BUTTON, MAP_TYPE FROM META_MAG_ROLE_MENU WHERE ROLE_ID="
				+ roleId;
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 根据岗位ID，部门ID取对应的角色数组
	 * 
	 * @param stationId 岗位ID
	 * @param deptId 部门ID
	 * @return
	 * @throws Exception
	 */
	public int[] queryRoleIdsByStationIdDeptId(int stationId, int deptId) throws Exception {
		String sql = "SELECT ROLE_ID FROM META_MAG_ROLE_ORG WHERE STATION_ID = " + stationId + " AND DEPT_ID=" + deptId
				+ " ";
		String[] stringValues = getDataAccess().queryForPrimitiveArray(sql, String.class);
		int[] intValues = new int[stringValues.length];
		for (int i = 0; i < intValues.length; i++) {
			intValues[i] = Integer.parseInt(stringValues[i]);
		}
		return intValues;
	}

	/**
	 * 根据角色ID，岗位、地域、部门ID删除对应的用户-角色关联关系 角色管理的-对地域机构授权-对选中范围取消
	 * 
	 * @param roleId 角色ID
	 * @param stationId 岗位ID
	 * @param zoneId 地域ID
	 * @param deptId 部门ID
	 * @return 删除的条数
	 * @throws Exception
	 */
	public int deleteUserRoleByRoleIdDim(int roleId, String stationIds, String zoneIds, String deptIds)
			throws Exception {
		String sql = "DELETE FROM META_MAG_USER_ROLE A WHERE A.ROLE_ID=" + roleId + " AND"
				+ " A.USER_ID IN (SELECT B.USER_ID FROM META_MAG_USER B WHERE B.USER_ID<>" + UserConstant.ADMIN_USERID
				+ " ";
		if (!stationIds.equals("")) {
			sql = sql + " AND B.STATION_ID IN (SELECT STATION_ID FROM META_DIM_USER_STATION START WITH STATION_ID in("
					+ stationIds + ") CONNECT BY PRIOR STATION_ID=STATION_PAR_ID) ";
		}
		if (!zoneIds.equals("")) {
			sql = sql + " AND B.ZONE_ID IN (SELECT ZONE_ID FROM META_DIM_ZONE START WITH ZONE_ID in(" + zoneIds
					+ ") CONNECT BY PRIOR ZONE_ID=ZONE_PAR_ID) ";
		}
		if (!deptIds.equals("")) {
			sql = sql + " AND B.DEPT_ID IN (SELECT DEPT_ID FROM META_DIM_USER_DEPT START WITH DEPT_ID in(" + deptIds
					+ ") CONNECT BY PRIOR DEPT_ID=DEPT_PAR_ID)";
		}
		sql = sql + ")";
		return getDataAccess().execUpdate(sql);
	}

	/**
	 * 新增角色与部门和岗位的关联关系。
	 * 

	 * @param roleId
	 * @param data
	 * @return
	 */
	public int[] insertRoleRefDeptStation(final int roleId, final List<Map<Long, Long>> data) throws Exception {
		String sql = "INSERT INTO  META_MAG_ROLE_ORG(ROLE_ID,STATION_ID,DEPT_ID) VALUES(?,?,?)";
		return getDataAccess().execUpdateBatch(sql, new IParamsSetter() {
			public void setValues(PreparedStatement proParams, int i) throws SQLException {
				Map<Long, Long> rowData = data.get(i);
				proParams.setObject(1, roleId);
				proParams.setObject(2, rowData.get("stationId"));
				proParams.setObject(3, rowData.get("deptId"));
			}

			public int batchSize() {
				return data.size();
			}
		});
	}

	/**
	 * 查询角色关联的部门和岗位关系
	 * 

	 * @param roleId
	 * @return
	 */
	public List<Map<String, Object>> queryRefDeptStation(int roleId) {
		String sql = "SELECT T.ROLE_ID,T.STATION_ID,T.DEPT_ID,DEPT.DEPT_NAME, "
				+ "STATION.STATION_NAME FROM META_MAG_ROLE_ORG T "
				+ "LEFT JOIN META_DIM_USER_DEPT DEPT ON T.DEPT_ID=DEPT.DEPT_CODE "
				+ "LEFT JOIN META_DIM_USER_STATION STATION ON T.STATION_ID=STATION.STATION_CODE " + "WHERE T.ROLE_ID="
				+ roleId;
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 根据RoleID取得对应的部门-岗位信息字符串
	 * 
	 * @param roleId
	 * @return
	 */
	public String queryDeptNamesStationNamesByRoleId(int roleId) {
		String sql = "SELECT B.DEPT_NAME ||'--'|| C.STATION_NAME FROM "
				+ "META_MAG_ROLE_ORG A LEFT JOIN META_DIM_USER_DEPT B "
				+ "ON A.DEPT_ID=B.DEPT_CODE LEFT JOIN META_DIM_USER_STATION C "
				+ "ON A.STATION_ID=C.STATION_CODE WHERE A.ROLE_ID=" + roleId;
		String names[] = getDataAccess().queryForPrimitiveArray(sql, String.class);
		String rtnValue = "";
		for (int i = 0; i < names.length; i++) {
			if (i != names.length - 1) {
				rtnValue = rtnValue + names[i] + ",  ";
			} else {
				rtnValue = rtnValue + names[i];
			}
		}
		return rtnValue;
	}

	/**
	 * 根据名字查询角色
	 * 
	 * @param roleName
	 * @return
	 */
	public List<Map<String, Object>> queryRoleByName(Map<String, Object> userData, Page page) {
		int userId = Integer.parseInt(userData.get("userId").toString());
		String wheres = " AND ROLE_ID NOT IN (SELECT ROLE_ID FROM META_MAG_USER_ROLE WHERE USER_ID=" + userId
				+ ") ORDER BY ROLE_ID ";

		StringBuffer sql = new StringBuffer("SELECT ROLE_ID, ROLE_NAME, ROLE_DESC, ROLE_STATE, CREATE_DATE "
				+ "FROM META_MAG_ROLE WHERE 1=1 ");
		Object roleName = userData.get("roleNameCn");
		Object roleNameDesc = userData.get("roleNameDesc");
		Object mgUserId = userData.get("mgUserId");
		int roleState = 1;
		List<Object> params = new ArrayList<Object>();
		if (roleName != null && !"".equals(roleName)) {
			sql.append("AND ROLE_NAME LIKE ? ESCAPE '/'  ");
			params.add(SqlUtils.allLikeBindParam(Convert.toString(roleName)));
		}
		if (roleNameDesc != null && !"".equals(roleNameDesc)) {
			sql.append("AND ROLE_NAME LIKE ? ESCAPE '/'  ");
			params.add(SqlUtils.allLikeBindParam(Convert.toString(roleNameDesc)));
		}
		if (mgUserId != null && !"".equals(mgUserId)) {
			sql.append("  AND ROLE_ID IN(SELECT ROLE_ID FROM  META_MAG_USER_ROLE WHERE USER_ID = ? AND (grant_flag=1 or mag_flag=1))");
			params.add(Convert.toString(mgUserId));
		}

		sql.append("AND ROLE_STATE=?");
		params.add(roleState);
		String pageSql = sql.toString();

		pageSql = pageSql + wheres;

		// 分页包装
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}
		return getDataAccess().queryForList(pageSql, params.toArray());
	}

	/**
	 * 根据角色名称和ID查询角色
	 * 
	 * @param roleName
	 * @param roleId
	 * @return
	 */
	public List<Map<String, Object>> queryRoleByNameAndId(String roleName, int roleId) {
		String sql = "SELECT ROLE_ID, ROLE_NAME, ROLE_DESC, ROLE_STATE, " + "CREATE_DATE FROM META_MAG_ROLE "
				+ "WHERE ROLE_NAME = ?" + " AND ROLE_ID <> " + roleId;
		return getDataAccess().queryForList(sql, roleName);
	}

	/**
	 * 根据名字查询是否存在
	 * 
	 * @param roleName
	 * @return
	 */
	public List<Map<String, Object>> queryRoleByName(String roleName) {
		String sql = "SELECT ROLE_ID, ROLE_NAME, ROLE_DESC, ROLE_STATE, " + "CREATE_DATE FROM META_MAG_ROLE "
				+ "WHERE ROLE_NAME = ?";
		return getDataAccess().queryForList(sql, roleName);
	}

	/**
	 * 根据状态查询角色，设置用户和角色。过滤已经关联用户的角色
	 * 
	 * @param queryData
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryRolesNotInUserRoleByRoleId(Map<?, ?> queryData, int userId, boolean isAdmin) {
		String wheres = "";

		if (!isAdmin) {
			wheres = " AND ROLE_ID  IN (SELECT ROLE_ID FROM META_MAG_USER_ROLE WHERE USER_ID=" + userId
					+ " AND  MAG_FLAG = 1) ORDER BY ROLE_ID ";
		}

		StringBuffer sql = new StringBuffer("SELECT ROLE_ID, ROLE_NAME, ROLE_DESC, ROLE_STATE, CREATE_DATE "
				+ "FROM META_MAG_ROLE WHERE 1=1 ");
		Object roleName = queryData.get("roleName");
		Object roleState = queryData.get("roleState");
		List<Object> params = new ArrayList<Object>();
		if (roleName != null && !"".equals(roleName)) {
			sql.append("AND ROLE_NAME LIKE ?  ESCAPE '/' ");
			params.add(SqlUtils.allLikeBindParam(Convert.toString(roleName).trim()));
		}
		if (roleState != null && Integer.parseInt(String.valueOf(roleState)) != -1) {
			sql.append("AND ROLE_STATE=?");
			params.add(Integer.parseInt(Convert.toString(roleState)));
		}
		String pageSql = sql.toString();

		pageSql = pageSql + wheres;
		//
		// //分页包装
		// if(page!=null){
		// pageSql= SqlUtils.wrapPagingSql(pageSql, page);
		// }
		return getDataAccess().queryForList(pageSql, params.toArray());
	}

}
