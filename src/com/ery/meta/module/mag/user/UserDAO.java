package com.ery.meta.module.mag.user;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Common;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.sys.code.CodeManager;

import com.ery.base.support.jdbc.IParamsSetter;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**
 * user表访问Dao <br>
 * 
 * @date 2011-09-22
 * @modify 刘斌 增加用户的查询、申请、审核、删除、关联角色、关联菜单等方法，供UserAction调用 其中包括用户-角色、用户-菜单表的维护方法
 * @modifyDate 2011-09-26
 * @modify 熊小平 增加方法queryUserByNewOAUserName：根据新OA用户名查询用户
 * @date 2011-10-22
 * @modify 王春生 添加getMenuAllPath
 * @date 2012-03-25
 */
public class UserDAO extends MetaBaseDAO {

	public List<Map<String, Object>> queryUserByEmail(String email) {
		String sql = "SELECT A.USER_ID,USER_EMAIL,USER_PASS,USER_NAMECN "
				+ ",STATE,USER_MOBILE,STATION_ID,ADMIN_FLAG,HEAD_SHIP "
				+ ",TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH:MI:SS') CREATE_DATE,USER_NAMEEN,OA_USER_NAME,DEPT_ID,ZONE_ID "
				+ ",USER_SN,VIP_FLAG,A.GROUP_ID,B.GROUP_STATE,TO_CHAR(D.CHANGE_TIME,'YYYY-MM-DD HH24:MI:SS') CHANGE_TIME "
				+ ",CNL_USER_NAME " + "FROM META_MAG_USER A LEFT JOIN META_MENU_GROUP B "
				+ " ON A.GROUP_ID=B.GROUP_ID LEFT JOIN (SELECT C.USER_ID,MAX(C.CHANGE_TIME) CHANGE_TIME "
				+ "FROM META_MAG_USER_CHANGE_LOG C WHERE C.CHANGE_TYPE=? GROUP BY C.USER_ID) D "
				+ " ON A.USER_ID=D.USER_ID WHERE  A.USER_EMAIL= ? ";
		return getDataAccess().queryForList(sql, UserConstant.META_MAG_USER_CHANGE_NAME_MODIFYPAS, email);
	}

	/**
	 * 根据中文名查询用户信息。
	 * 
	 * @param namecn 用户中文名
	 * @return 符合条件的数据
	 */
	public List<Map<String, Object>> queryUserByNamecn(String namecn) {
		String sql = "SELECT A.USER_ID,USER_EMAIL,USER_PASS,USER_NAMECN "
				+ ",STATE,USER_MOBILE,STATION_ID,ADMIN_FLAG,HEAD_SHIP "
				+ ",TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH:MI:SS') CREATE_DATE,USER_NAMEEN,OA_USER_NAME,DEPT_ID,ZONE_ID "
				+ ",USER_SN,VIP_FLAG,A.GROUP_ID,B.GROUP_STATE,TO_CHAR(D.CHANGE_TIME,'YYYY-MM-DD HH24:MI:SS') CHANGE_TIME "
				+ ",CNL_USER_NAME " + "FROM META_MAG_USER A LEFT JOIN META_MENU_GROUP B "
				+ " ON A.GROUP_ID=B.GROUP_ID LEFT JOIN (SELECT C.USER_ID,MAX(C.CHANGE_TIME) CHANGE_TIME "
				+ "FROM META_MAG_USER_CHANGE_LOG C WHERE C.CHANGE_TYPE=? GROUP BY C.USER_ID) D "
				+ " ON A.USER_ID=D.USER_ID WHERE A.USER_NAMECN= ? ";
		return getDataAccess().queryForList(sql, UserConstant.META_MAG_USER_CHANGE_NAME_MODIFYPAS, namecn);
	}

	/**
	 * 根据中文名查询用户信息。
	 * 
	 * @param userNamecn
	 * @return 符合条件的数据

	 */
	public List<Map<String, Object>> queryUserByUserNameEn(String userNamecn) {
		String sql = "SELECT A.USER_ID,USER_EMAIL,USER_PASS,USER_NAMECN "
				+ ",STATE,USER_MOBILE,STATION_ID,ADMIN_FLAG,HEAD_SHIP "
				+ ",TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH:MI:SS') CREATE_DATE,USER_NAMEEN,OA_USER_NAME,DEPT_ID,ZONE_ID "
				+ ",USER_SN,VIP_FLAG,A.GROUP_ID,B.GROUP_STATE,TO_CHAR(D.CHANGE_TIME,'YYYY-MM-DD HH24:MI:SS') CHANGE_TIME "
				+ ",CNL_USER_NAME " + "FROM META_MAG_USER A LEFT JOIN META_MENU_GROUP B "
				+ " ON A.GROUP_ID=B.GROUP_ID LEFT JOIN (SELECT C.USER_ID,MAX(C.CHANGE_TIME) CHANGE_TIME "
				+ "FROM META_MAG_USER_CHANGE_LOG C WHERE C.CHANGE_TYPE=? GROUP BY C.USER_ID) D "
				+ " ON A.USER_ID=D.USER_ID WHERE A.USER_NAMEEN= ? ";
		return getDataAccess().queryForList(sql, UserConstant.META_MAG_USER_CHANGE_NAME_MODIFYPAS, userNamecn);
	}

	/**
	 * 根据中文名查询用户信息。
	 * 
	 * @param userId
	 * @return 符合条件的数据
	 */
	public List<Map<String, Object>> queryUserByUserId(long userId) {
		String sql = "SELECT A.USER_ID,USER_EMAIL,USER_PASS,USER_NAMECN "
				+ ",STATE,USER_MOBILE,STATION_ID,ADMIN_FLAG,HEAD_SHIP "
				+ ",TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH:MI:SS') CREATE_DATE,USER_NAMEEN,OA_USER_NAME,DEPT_ID,ZONE_ID "
				+ ",USER_SN,VIP_FLAG,A.GROUP_ID,B.GROUP_STATE,TO_CHAR(D.CHANGE_TIME,'YYYY-MM-DD HH24:MI:SS') CHANGE_TIME "
				+ ",CNL_USER_NAME " + "FROM META_MAG_USER A LEFT JOIN META_MENU_GROUP B "
				+ " ON A.GROUP_ID=B.GROUP_ID LEFT JOIN (SELECT C.USER_ID,MAX(C.CHANGE_TIME) CHANGE_TIME "
				+ "FROM META_MAG_USER_CHANGE_LOG C WHERE C.CHANGE_TYPE=? GROUP BY C.USER_ID) D "
				+ " ON A.USER_ID=D.USER_ID WHERE A.USER_ID= ? ";
		return getDataAccess().queryForList(sql, UserConstant.META_MAG_USER_CHANGE_NAME_MODIFYPAS, userId);
	}

	/**
	 * 查询要选择的人员，已经选择的人员要排在前面
	 * 
	 * @param condtions
	 * @param page
	 * @return

	 */
	public List<Map<String, Object>> selectPrivateUser(Map<String, Object> condtions, String[] selectUserIds, Page page) {
		String deptId = "";
		String stationId = "";
		String zoneId = "";
		String deptIdSql = "", stationSql = "", zoneSql = "";
		if (condtions != null && condtions.get("DEPT_ID") != null && !condtions.get("DEPT_ID").toString().equals("")) {
			deptId = condtions.get("DEPT_ID").toString();
			deptIdSql = " AND A.DEPT_ID IN (" + deptId + ")";
		}
		if (condtions != null && condtions.get("STATION_ID") != null
				&& !condtions.get("STATION_ID").toString().equals("")) {
			stationId = condtions.get("STATION_ID").toString();
			stationSql = " AND A.STATION_ID IN (" + stationId + ")";
		}
		if (condtions != null && condtions.get("ZONE_ID") != null && !condtions.get("ZONE_ID").toString().equals("")) {
			zoneId = condtions.get("ZONE_ID").toString();
			zoneSql = "((SELECT B.ZONE_ID,LEVEL ZONE_LEVEL  FROM META_DIM_ZONE B START WITH B.zone_id in (" + zoneId
					+ ") CONNECT BY PRIOR B.ZONE_ID = B.ZONE_PAR_ID " + ")) E,";
		}
		StringBuffer sql = new StringBuffer(
				"SELECT A.USER_ID, A.USER_EMAIL, A.USER_PASS, A.USER_NAMECN, A.STATE, "
						+ "A.USER_MOBILE, A.STATION_ID, A.ADMIN_FLAG, A.HEAD_SHIP,TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH24:MI:SS') CREATE_DATE, "
						+ "A.USER_NAMEEN, A.OA_USER_NAME, A.DEPT_ID, A.ZONE_ID, A.USER_SN, "
						+ "A.VIP_FLAG, A.GROUP_ID, B.ZONE_NAME, C.DEPT_NAME,D.STATION_NAME ");
		if (condtions != null && condtions.get("ZONE_ID") != null && !condtions.get("ZONE_ID").toString().equals("")) {
			sql.append(",E.zone_level FROM "
					+ zoneSql
					+ "META_MAG_USER A LEFT JOIN META_DIM_ZONE B ON A.ZONE_ID=B.ZONE_ID "
					+ "LEFT JOIN META_DIM_USER_DEPT C ON A.DEPT_ID=C.DEPT_CODE LEFT JOIN META_DIM_USER_STATION D ON D.STATION_CODE=A.STATION_ID "
					+ "WHERE USER_ID<>" + UserConstant.ADMIN_USERID + "AND A.STATE <> 2 AND E.ZONE_ID = A.ZONE_ID"
					+ deptIdSql + stationSql);
		} else {
			sql.append("FROM "
					+ zoneSql
					+ "META_MAG_USER A LEFT JOIN META_DIM_ZONE B ON A.ZONE_ID=B.ZONE_ID "
					+ "LEFT JOIN META_DIM_USER_DEPT C ON A.DEPT_ID=C.DEPT_CODE LEFT JOIN META_DIM_USER_STATION D ON D.STATION_CODE=A.STATION_ID "
					+ "WHERE USER_ID<>" + UserConstant.ADMIN_USERID + "AND A.STATE <> 2 ");
		}

		List<Object> params = new ArrayList<Object>();
		if (condtions != null && condtions.get("USER_NAME") != null
				&& !condtions.get("USER_NAME").toString().equals("")) {// 姓名
			sql.append(" AND A.USER_NAMECN LIKE ? ESCAPE '/' ");
			params.add("%" + Convert.toString(condtions.get("USER_NAME")).trim() + "%");
		}
		if (condtions != null && MapUtils.getBoolean(condtions, "isChannel", false) == true) {
			sql.append(" AND A.Cnl_User_Name IS NOT NULL ");
		}
		String pageSql = sql.toString();
		if (selectUserIds != null && selectUserIds.length > 0) {
			pageSql = pageSql + " ORDER BY INSTR('," + Common.join(selectUserIds, ",")
					+ "',','||A.USER_ID||',',1,1) DESC";
		} else {
			if (condtions != null && condtions.get("ZONE_ID") != null
					&& !condtions.get("ZONE_ID").toString().equals("")) {
				pageSql += " ORDER BY ZONE_LEVEL,ZONE_ID,STATE DESC";
			} else {
				pageSql += " ORDER BY ZONE_ID,STATE DESC";
			}
		}
		// 分页包装
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}
		List<Map<String, Object>> rtn = getDataAccess().queryForList(pageSql, params.toArray());
		if (rtn != null && rtn.size() > 0) {
			for (Map<String, Object> map : rtn) {
				map.put("STATE_NAME",
						CodeManager.getName(UserConstant.META_MAG_USER_STATE, MapUtils.getString(map, "STATE")));
			}
		}
		return rtn;
	}

	/**
	 * 查询要选择的人员，已经选择的人员要排在前面
	 * 
	 * @param condtions
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> selectUser(Map<String, Object> condtions, String[] selectUserIds, Page page) {
		String deptId = "";
		String stationId = "";
		String zoneId = "";
		String deptIdSql = "", stationSql = "", zoneSql = "";
		if (condtions != null && condtions.get("deptId") != null) {
			deptId = condtions.get("deptId").toString();
			deptIdSql = " AND A.DEPT_ID IN (" + deptId + ")";
		}
		if (condtions != null && condtions.get("stationId") != null) {
			stationId = condtions.get("stationId").toString();
			stationSql = " AND A.STATION_ID IN (" + stationId + ")";
		}
		if (condtions != null && condtions.get("zoneId") != null) {
			zoneId = condtions.get("zoneId").toString();
			zoneSql = "((SELECT B.ZONE_ID,LEVEL ZONE_LEVEL  FROM META_DIM_ZONE B START WITH B.zone_id in (" + zoneId
					+ ") CONNECT BY PRIOR B.ZONE_ID = B.ZONE_PAR_ID " + ")) E,";
		}
		StringBuffer sql = new StringBuffer(
				"SELECT A.USER_ID, A.USER_EMAIL, A.USER_PASS, A.USER_NAMECN, A.STATE, "
						+ "A.USER_MOBILE, A.STATION_ID, A.ADMIN_FLAG, A.HEAD_SHIP,TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH24:MI:SS') CREATE_DATE, "
						+ "A.USER_NAMEEN, A.OA_USER_NAME, A.DEPT_ID, A.ZONE_ID, A.USER_SN, "
						+ "A.VIP_FLAG, A.GROUP_ID, B.ZONE_NAME, C.DEPT_NAME,D.STATION_NAME ");
		if (condtions != null && condtions.get("zoneId") != null) {
			sql.append(",E.zone_level FROM "
					+ zoneSql
					+ "META_MAG_USER A LEFT JOIN META_DIM_ZONE B ON A.ZONE_ID=B.ZONE_ID "
					+ "LEFT JOIN META_DIM_USER_DEPT C ON A.DEPT_ID=C.DEPT_CODE LEFT JOIN META_DIM_USER_STATION D ON D.STATION_CODE=A.STATION_ID "
					+ "WHERE USER_ID<>" + UserConstant.ADMIN_USERID + "AND A.STATE <> 2 AND E.ZONE_ID = A.ZONE_ID"
					+ deptIdSql + stationSql);
		} else {
			sql.append("FROM "
					+ zoneSql
					+ "META_MAG_USER A LEFT JOIN META_DIM_ZONE B ON A.ZONE_ID=B.ZONE_ID "
					+ "LEFT JOIN META_DIM_USER_DEPT C ON A.DEPT_ID=C.DEPT_CODE LEFT JOIN META_DIM_USER_STATION D ON D.STATION_CODE=A.STATION_ID "
					+ "WHERE USER_ID<>" + UserConstant.ADMIN_USERID + "AND A.STATE <> 2 ");
		}

		List<Object> params = new ArrayList<Object>();
		if (condtions != null && condtions.get("userName") != null && !condtions.get("userName").toString().equals("")) {// 姓名
			sql.append(" AND A.USER_NAMECN LIKE ? ESCAPE '/' ");
			params.add("%" + Convert.toString(condtions.get("userName")).trim() + "%");
		}
		if (condtions != null && condtions.get("userState") != null
				&& !String.valueOf(condtions.get("userState")).equals("-1")) {// 状态
			sql.append(" AND A.STATE=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("userState"))));
		}
		if (condtions != null && condtions.get("dimUserState") != null) {
			sql.append(" AND A.STATE =" + Integer.parseInt(condtions.get("dimUserState").toString()) + " ");
		}
		if (condtions != null && condtions.get("userId") != null) {// 用户ID
			sql.append(" AND A.USER_ID=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("userId"))));
		}
		if (condtions != null && condtions.get("mguserId") != null) {// 用户ID
			sql.append(" AND A.USER_ID !=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("mguserId"))));
		}
		String pageSql = sql.toString();
		if (selectUserIds != null && selectUserIds.length > 0) {
			pageSql = pageSql + " ORDER BY INSTR('," + Common.join(selectUserIds, ",")
					+ "',','||A.USER_ID||',',1,1) DESC";
		} else {
			if (condtions != null && condtions.get("zoneId") != null) {
				pageSql += " ORDER BY ZONE_LEVEL,ZONE_ID,STATE DESC";
			} else {
				pageSql += " ORDER BY ZONE_ID,STATE DESC";
			}
		}
		// 分页包装
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}
		List<Map<String, Object>> rtn = getDataAccess().queryForList(pageSql, params.toArray());
		if (rtn != null && rtn.size() > 0) {
			for (Map<String, Object> map : rtn) {
				map.put("STATE_NAME",
						CodeManager.getName(UserConstant.META_MAG_USER_STATE, MapUtils.getString(map, "STATE")));
			}
		}
		return rtn;
	}

	/**
	 * 根据手机号码查询用户信息。
	 * 
	 * @param telNo 手机号码
	 * @return 符合条件的数据
	 */
	public List<Map<String, Object>> queryUserByTel(String telNo) {
		String sql = "SELECT A.USER_ID,USER_EMAIL,USER_PASS,USER_NAMECN "
				+ ",STATE,USER_MOBILE,STATION_ID,ADMIN_FLAG,HEAD_SHIP "
				+ ",TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH:MI:SS') CREATE_DATE,USER_NAMEEN,OA_USER_NAME,DEPT_ID,ZONE_ID "
				+ ",USER_SN,VIP_FLAG,A.GROUP_ID,B.GROUP_STATE,TO_CHAR(D.CHANGE_TIME,'YYYY-MM-DD HH24:MI:SS') CHANGE_TIME "
				+ ",CNL_USER_NAME " + "FROM META_MAG_USER A LEFT JOIN META_MENU_GROUP B "
				+ " ON A.GROUP_ID=B.GROUP_ID LEFT JOIN (SELECT C.USER_ID,MAX(C.CHANGE_TIME) CHANGE_TIME "
				+ "FROM META_MAG_USER_CHANGE_LOG C WHERE C.CHANGE_TYPE=? GROUP BY C.USER_ID) D "
				+ " ON A.USER_ID=D.USER_ID WHERE A.USER_MOBILE= ? ";
		return getDataAccess().queryForList(sql, UserConstant.META_MAG_USER_CHANGE_NAME_MODIFYPAS, telNo);
	}

	/**
	 * 根据USER_ID查询用户信息。
	 * 
	 * @param userId 用户ID
	 * @return 符合条件的数据
	 */
	public List<Map<String, Object>> queryUserById(int userId) {
		String sql = "SELECT A.USER_ID,USER_EMAIL,USER_PASS,USER_NAMECN "
				+ ",STATE,USER_MOBILE,STATION_ID,ADMIN_FLAG,HEAD_SHIP "
				+ ",TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH:MI:SS') CREATE_DATE,USER_NAMEEN,OA_USER_NAME,DEPT_ID,ZONE_ID "
				+ ",USER_SN,VIP_FLAG,A.GROUP_ID,B.GROUP_STATE,TO_CHAR(D.CHANGE_TIME,'YYYY-MM-DD HH24:MI:SS') CHANGE_TIME "
				+ ",CNL_USER_NAME " + "FROM META_MAG_USER A LEFT JOIN META_MENU_GROUP B "
				+ " ON A.GROUP_ID=B.GROUP_ID LEFT JOIN (SELECT C.USER_ID,MAX(C.CHANGE_TIME) CHANGE_TIME "
				+ "FROM META_MAG_USER_CHANGE_LOG C WHERE C.CHANGE_TYPE=? GROUP BY C.USER_ID) D "
				+ " ON A.USER_ID=D.USER_ID WHERE A.USER_ID= ? ";
		return getDataAccess().queryForList(sql, UserConstant.META_MAG_USER_CHANGE_NAME_MODIFYPAS, userId);
	}

	/**
	 * 根据USER_ID查询用户信息。
	 * 
	 * @param mguserId 用户ID
	 * @return 符合条件的数据
	 */
	public List<Map<String, Object>> queryRolesMgUserRoleByRoleId(Map<?, ?> queryData, int mguserId, boolean isAdmin) {
		String wheres = "";
		String userWhere = "";
		if (queryData.get("userId") != null && queryData.get("userId") != null) {
			int userId = Integer.parseInt(queryData.get("userId").toString());
			userWhere = " AND A.ROLE_ID NOT IN (SELECT ROLE_ID FROM META_MAG_USER_ROLE WHERE USER_ID=" + userId + ")";
		}
		StringBuffer sql = new StringBuffer(
				"SELECT  A.ROLE_ID, A.ROLE_NAME, A.ROLE_DESC, A.ROLE_STATE,A.CREATE_DATE,B.GRANT_FLAG MGGRANT_FLAG,B.MAG_FLAG MGMAG_FLAG "
						+ "FROM META_MAG_ROLE A,META_MAG_USER_ROLE B WHERE 1=1 AND A. ROLE_STATE= 1 AND B.GRANT_FLAG = 1 "
						+ "AND A.ROLE_ID = B.ROLE_ID");
		List<Object> params = new ArrayList<Object>();
		if (!isAdmin) {// 姓名
			sql.append(" AND B.USER_ID = ? ");
			params.add(mguserId);
		} else {
			sql = new StringBuffer(
					"SELECT ROLE_ID, ROLE_NAME, ROLE_DESC, ROLE_STATE, CREATE_DATE,1 MGGRANT_FLA,1 MGMAG_FLAG FROM META_MAG_ROLE A "
							+ "WHERE ROLE_STATE = 1");
		}
		String pageSql = sql.toString();
		pageSql = pageSql + userWhere + " ORDER BY ROLE_ID ";
		return getDataAccess().queryForList(pageSql.toString(), params.toArray());
	}

	/**
	 * 根据USER_ID查询用户信息。
	 * 
	 * @param userId 用户ID
	 * @return 符合条件的数据
	 */
	public Map<String, Object> queryUserByUserId(int userId) {
		String sql = "SELECT A.USER_ID,USER_EMAIL,USER_PASS,USER_NAMECN "
				+ ",STATE,USER_MOBILE,STATION_ID,ADMIN_FLAG,HEAD_SHIP "
				+ ",TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH:MI:SS') CREATE_DATE,USER_NAMEEN,OA_USER_NAME,DEPT_ID,ZONE_ID "
				+ ",USER_SN,VIP_FLAG,A.GROUP_ID,B.GROUP_STATE,A.CNL_USER_NAME FROM META_MAG_USER A LEFT JOIN META_MENU_GROUP B "
				+ " ON A.GROUP_ID=B.GROUP_ID " + " WHERE  A.USER_ID= ? ";
		return getDataAccess().queryForMap(sql, userId);
	}

	/**
	 * 修改用户密码
	 * 
	 * @param userId 用户ID
	 * @param password 密码
	 * @return 执行条数
	 */
	public int updateUserPassword(int userId, String password) throws Exception {
		String sql = "UPDATE META_MAG_USER SET USER_PASS=? " + "WHERE USER_ID=?";
		return getDataAccess().execUpdate(sql, new Object[] { password, userId });
	}

	/**
	 * 根据条件查询用户信息
	 * 
	 * @param condtions 查询条件
	 * @param page 分页参数
	 * @param otherWheres 扩展SQL语句，这里可以加入Order By或者其他的查询条件，例如 USER_ID NOT IN ()..
	 * @return 查询结果列表
	 */
	public List<Map<String, Object>> queryUserByCondition(Map<String, Object> condtions, Page page, String otherWheres) {
		String deptId = "";
		String stationId = "";
		String zoneId = "";
		String deptIdSql = "", stationSql = "", zoneSql = "";
		if (condtions != null && condtions.get("deptId") != null) {
			deptId = condtions.get("deptId").toString();
			deptIdSql = " AND A.DEPT_ID IN (" + deptId + ")";
		}
		if (condtions != null && condtions.get("stationId") != null) {
			stationId = condtions.get("stationId").toString();
			stationSql = " AND A.STATION_ID IN (" + stationId + ")";
		}
		if (condtions != null && condtions.get("zoneId") != null) {
			zoneId = condtions.get("zoneId").toString();
			zoneSql = "((SELECT b.zone_id,level zone_level  FROM META_DIM_ZONE B START WITH B.zone_id in (" + zoneId
					+ ") CONNECT BY PRIOR B.ZONE_ID = B.ZONE_PAR_ID " + ")) E,";
		}
		StringBuffer sql = new StringBuffer(
				"SELECT A.USER_ID, A.USER_EMAIL, A.USER_PASS, A.USER_NAMECN, A.STATE, "
						+ "A.USER_MOBILE, A.STATION_ID, A.ADMIN_FLAG, A.HEAD_SHIP,TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH24:MI:SS') CREATE_DATE, "
						+ "A.USER_NAMEEN, A.OA_USER_NAME, A.DEPT_ID, A.ZONE_ID, A.USER_SN, "
						+ "A.VIP_FLAG, A.GROUP_ID, B.ZONE_NAME, C.DEPT_NAME,D.STATION_NAME,E.zone_level "
						+ "FROM "
						+ zoneSql
						+ "META_MAG_USER A LEFT JOIN META_DIM_ZONE B ON A.ZONE_ID=B.ZONE_ID "
						+ "LEFT JOIN META_DIM_USER_DEPT C ON A.DEPT_ID=C.DEPT_CODE LEFT JOIN META_DIM_USER_STATION D ON D.STATION_CODE=A.STATION_ID "
						+ "WHERE USER_ID<>" + UserConstant.ADMIN_USERID + "AND A.STATE <> 2 AND E.ZONE_ID = A.ZONE_ID"
						+ deptIdSql + stationSql);

		List<Object> params = new ArrayList<Object>();
		if (condtions != null && condtions.get("userName") != null && !condtions.get("userName").toString().equals("")) {// 姓名
			sql.append(" AND A.USER_NAMECN LIKE ? ESCAPE '/' ");
			params.add("%" + Convert.toString(condtions.get("userName")).trim() + "%");
		}
		if (condtions != null && condtions.get("userState") != null
				&& !String.valueOf(condtions.get("userState")).equals("-1")) {// 状态
			sql.append(" AND A.STATE=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("userState"))));
		}
		if (condtions != null && condtions.get("dimUserState") != null) {
			sql.append(" AND A.STATE =" + Integer.parseInt(condtions.get("dimUserState").toString()) + " ");
		}
		if (condtions != null && condtions.get("userId") != null) {// 用户ID
			sql.append(" AND A.USER_ID=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("userId"))));
		}
		if (condtions != null && condtions.get("mguserId") != null) {// 用户ID
			sql.append(" AND A.USER_ID !=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("mguserId"))));
		}
		String pageSql = sql.toString();
		if (otherWheres != null) {
			pageSql = pageSql + " " + otherWheres + " ORDER BY zone_level,ZONE_ID ";
		} else {
			pageSql += " ORDER BY ZONE_LEVEL,ZONE_ID,STATE DESC";
		}
		// 分页包装
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}
		List<Map<String, Object>> rtn = getDataAccess().queryForList(pageSql, params.toArray());
		if (rtn != null && rtn.size() > 0) {
			for (Map<String, Object> map : rtn) {
				map.put("STATE_NAME",
						CodeManager.getName(UserConstant.META_MAG_USER_STATE, MapUtils.getString(map, "STATE")));
			}
		}
		return rtn;
	}

	/**
	 * 根据UserID修改用户信息
	 * 
	 * @param data 待修改的数据
	 * @return 操作条数
	 * @throws Exception
	 */
	public int updateUserByUserId(Map<String, Object> data) throws Exception {
		String sql = "UPDATE META_MAG_USER SET ";
		List<Object> proParams = new ArrayList<Object>();
		if (data.containsKey("userEmail")) {// 邮箱
			sql = sql + "USER_EMAIL=?, ";
			proParams.add(data.get("userEmail"));
		}
		if (data.containsKey("userPass")) {// 用户密码
			sql = sql + "USER_PASS=?, ";
			proParams.add(data.get("userPass"));
		}
		if (data.containsKey("userNamecn")) {// 用户中文名称
			sql = sql + "USER_NAMECN=?, ";
			proParams.add(data.get("userNamecn"));
		}
		if (data.containsKey("state")) {// 用户状态
			sql = sql + "STATE=?, ";
			proParams.add(data.get("state"));
		}
		if (data.containsKey("userMobile")) {// 用户手机号，用于短信提醒
			sql = sql + "USER_MOBILE=?, ";
			proParams.add(data.get("userMobile"));
		}
		if (data.containsKey("stationId")) {// 用户所属岗位
			sql = sql + "STATION_ID=?, ";
			proParams.add(data.get("stationId"));
		}
		if (data.containsKey("adminFlag")) {// 是否具有管理子部门用户的权限
			sql = sql + "ADMIN_FLAG=?, ";
			proParams.add(data.get("adminFlag"));
		}
		if (data.containsKey("headShip")) {// 职务
			sql = sql + "HEAD_SHIP=?, ";
			proParams.add(data.get("headShip"));
		}
		if (data.containsKey("userNameen")) {// 用户拼音名
			sql = sql + "USER_NAMEEN=?, ";
			proParams.add(data.get("userNameen"));
		}
		if (data.containsKey("oaUserName")) {// OA登录名
			sql = sql + "OA_USER_NAME=?, ";
			proParams.add(data.get("oaUserName"));
		}
		if (data.containsKey("deptId")) {// 部门ID
			sql = sql + "DEPT_ID=?, ";
			proParams.add(data.get("deptId"));
		}
		if (data.containsKey("zoneId")) {// 地域编码ID
			sql = sql + "ZONE_ID=?, ";
			proParams.add(data.get("zoneId"));
		}
		if (data.containsKey("userSn")) {// 序号
			sql = sql + "USER_SN=?, ";
			proParams.add(data.get("userSn"));
		}
		if (data.containsKey("vipFlag")) {// 代码:1是,0否.
			sql = sql + "VIP_FLAG=?, ";
			proParams.add(data.get("vipFlag"));
		}
		if (data.containsKey("groupId")) {// 默认系统
			sql = sql + "GROUP_ID=?, ";
			proParams.add(data.get("groupId"));
		}
		sql = sql.substring(0, sql.length() - 2);
		sql = sql + " WHERE USER_ID=? ";
		proParams.add(data.get("userId"));
		return getDataAccess().execUpdate(sql, proParams.toArray());
	}

	/**
	 * 新增用户
	 * 
	 * @param data 用户数据
	 * @return 操作条数
	 * @throws Exception
	 */
	public int insertUserByCondition(Map<String, Object> data) throws Exception {
		String sql = "INSERT INTO META_MAG_USER " + "(USER_ID, USER_EMAIL, USER_PASS, USER_NAMECN, STATE, "
				+ "USER_MOBILE, STATION_ID, ADMIN_FLAG, HEAD_SHIP, USER_NAMEEN, "
				+ "OA_USER_NAME, DEPT_ID, ZONE_ID, USER_SN, VIP_FLAG, GROUP_ID) " + "VALUES " + "(?,?,?,?, ?, "
				+ "?,?,?,?,?, ?,?,?,?,?, ?)";
		List<Object> proParams = new ArrayList<Object>();
		long pk = queryForNextVal("SEQ_MAG_USER_ID");
		proParams.add(pk);
		if (data.containsKey("userEmail"))
			proParams.add(data.get("userEmail"));
		else
			proParams.add("");
		if (data.containsKey("userPass"))
			proParams.add(data.get("userPass"));
		else
			proParams.add("");
		if (data.containsKey("userNamecn"))
			proParams.add(data.get("userNamecn"));
		else
			proParams.add("");
		if (data.containsKey("state"))
			proParams.add(data.get("state"));
		else
			proParams.add("2");
		if (data.containsKey("userMobile"))
			proParams.add(data.get("userMobile"));
		else
			proParams.add("");
		if (data.containsKey("stationId"))
			proParams.add(data.get("stationId"));
		else
			proParams.add("");
		if (data.containsKey("adminFlag"))
			proParams.add(data.get("adminFlag"));
		else
			proParams.add(0);
		if (data.containsKey("headShip"))
			proParams.add(data.get("headShip"));
		else
			proParams.add("");
		if (data.containsKey("userNameen"))
			proParams.add(data.get("userNameen"));
		else
			proParams.add("");
		if (data.containsKey("oaUserName"))
			proParams.add(data.get("oaUserName"));
		else
			proParams.add("");
		if (data.containsKey("deptId"))
			proParams.add(data.get("deptId"));
		else
			proParams.add("");
		if (data.containsKey("zoneId"))
			proParams.add(data.get("zoneId"));
		else
			proParams.add("");
		if (data.containsKey("userSn"))
			proParams.add(data.get("userSn"));
		else
			proParams.add("");
		if (data.containsKey("vipFlag"))
			proParams.add(data.get("vipFlag"));
		else
			proParams.add("");
		if (data.containsKey("groupId"))
			proParams.add(data.get("groupId"));
		else
			proParams.add("");
		getDataAccess().execUpdate(sql, proParams.toArray());
		return (int) pk;
	}

	/**
	 * 根据用户ID删除用户信息
	 * 
	 * @param userId 用户ID
	 * @return 执行条数
	 * @throws Exception
	 */
	public int deleteUserByUserId(int[] userId) throws Exception {
		if (userId != null && userId.length > 0) {
			StringBuffer sql = new StringBuffer("DELETE FROM META_MAG_USER WHERE USER_ID IN (");
			for (int i = 0; i < userId.length; i++) {
				sql.append(userId[i]);
				if (i != userId.length - 1) {
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
	 * 根据用户ID删除用户-角色信息
	 * 
	 * @param userId 用户ID
	 * @param roleId 角色ID，如果没有则为Null
	 * @return 执行条数
	 * @throws Exception
	 */
	public int deleteUserRoleByUserId(String[] userId, Integer roleId) throws Exception {
		if (userId != null && userId.length > 0) {
			StringBuffer sql = new StringBuffer("DELETE FROM META_MAG_USER_ROLE WHERE USER_ID IN (");
			for (int i = 0; i < userId.length; i++) {
				sql.append(userId[i]);
				if (i != userId.length - 1) {
					sql.append(",");
				}
			}
			sql.append(") ");
			if (roleId != null && roleId > 0) {
				sql.append("AND ROLE_ID=" + roleId);
			}
			return getDataAccess().execUpdate(sql.toString());
		} else {
			return -1;
		}
	}

	/**
	 * 根据用户ID删除用户-菜单信息
	 * 
	 * @param userId 用户ID
	 * @return 执行条数
	 * @throws Exception
	 */
	public int deleteUserMenuByUserId(int[] userId) throws Exception {
		if (userId != null && userId.length > 0) {
			StringBuffer sql = new StringBuffer("DELETE FROM META_MAG_USER_MENU WHERE USER_ID IN "
					+ SqlUtils.inParamDeal(userId));
			return getDataAccess().execUpdate(sql.toString());
		} else {
			return -1;
		}
	}

	/**
	 * 禁用用户
	 * 
	 * @param userId 用户ID
	 * @return 执行条数
	 * @throws Exception
	 */
	public int disableUser(int[] userId) throws Exception {
		if (userId != null && userId.length > 0) {
			StringBuffer sql = new StringBuffer("update META_MAG_USER set STATE=");
			sql.append(UserConstant.META_MAG_USER_STATE_DISABLE);
			sql.append(" WHERE USER_ID in (");
			for (int i = 0; i < userId.length; i++) {
				sql.append(userId[i]);
				if (i != userId.length - 1) {
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
	 * 启用用户
	 * 
	 * @param userId
	 * @return
	 * @throws Exception
	 */
	public int startUser(int[] userId) throws Exception {
		if (userId != null && userId.length > 0) {
			StringBuffer sql = new StringBuffer("update META_MAG_USER set STATE=");
			sql.append(UserConstant.META_MAG_USER_STATE_ENABLE);
			sql.append(" WHERE USER_ID in (");
			for (int i = 0; i < userId.length; i++) {
				sql.append(userId[i]);
				if (i != userId.length - 1) {
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
	 * 根据批量的userId查出对应表的信息
	 * 
	 * @param userId 用户ID
	 * @return 用户信息列表
	 */
	public List<Map<String, Object>> queryUserByUserIds(int userId[]) {
		List<Object> params = new ArrayList<Object>();
		StringBuffer sql = new StringBuffer("SELECT A.USER_ID, A.USER_EMAIL, A.USER_PASS, A.USER_NAMECN, A.STATE, "
				+ "A.USER_MOBILE, A.STATION_ID, A.ADMIN_FLAG, A.HEAD_SHIP, "
				+ "TO_CHAR(A.CREATE_DATE,'YYYY-MM-DD HH:MI:SS') CREATE_DATE, "
				+ "A.USER_NAMEEN, A.OA_USER_NAME, A.DEPT_ID, A.ZONE_ID, A.USER_SN, "
				+ "A.VIP_FLAG, A.GROUP_ID,B.DEPT_NAME,C.STATION_NAME, " + "D.ZONE_NAME FROM META_MAG_USER A LEFT JOIN "
				+ "META_DIM_USER_DEPT B ON A.DEPT_ID=B.DEPT_CODE LEFT "
				+ "JOIN META_DIM_USER_STATION C ON A.STATION_ID=C.STATION_CODE "
				+ "LEFT JOIN META_DIM_ZONE D ON A.ZONE_ID=D.ZONE_ID WHERE USER_ID IN (");
		for (int i = 0; i < userId.length; i++) {
			sql.append(userId[i]);
			if (i != userId.length - 1) {
				sql.append(",");
			}
		}
		sql.append(")");
		List<Map<String, Object>> rtn = getDataAccess().queryForList(sql.toString(), params.toArray());
		if (rtn != null && rtn.size() > 0) {
			for (Map<String, Object> map : rtn) {
				map.put("STATE_NAME",
						CodeManager.getName(UserConstant.META_MAG_USER_STATE, MapUtils.getString(map, "STATE")));
			}
		}
		return rtn;
		// return getDataAccess().queryForList(sql.toString(),
		// params.toArray());
	}

	/**
	 * 添加用户——角色关联关系
	 * 
	 * @param userRolePO 用户-角色对应关系对象
	 * @return 执行条数
	 */
	public int insertUserRole(UserRolePO userRolePO) throws Exception {
		String insert = "INSERT INTO META_MAG_USER_ROLE(USER_ID,ROLE_ID,GRANT_FLAG,MAG_FLAG) VALUES(?,?,?,?)";
		Object[] proParams = { userRolePO.getUserId(), userRolePO.getRoleId(), userRolePO.getGrantFlag(),
				userRolePO.getMagFlag() };
		return getDataAccess().execUpdate(insert, proParams);
	}

	/**
	 * 修改用户-角色关联关系 修改用户对角色的管理权限以及用户对角色的赋予权限
	 * 
	 * @param userRolePO 用户-角色对应关系对象
	 * @return 执行条数
	 * @throws Exception
	 */
	public int updateUserRole(UserRolePO userRolePO) throws Exception {
		String update = "UPDATE META_MAG_USER_ROLE SET GRANT_FLAG=?, MAG_FLAG=? " + "WHERE USER_ID=? AND ROLE_ID=?";
		Object[] proParams = { userRolePO.getGrantFlag(), userRolePO.getMagFlag(), userRolePO.getUserId(),
				userRolePO.getRoleId() };
		return getDataAccess().execUpdate(update, proParams);
	}

	/**
	 * 添加用户——菜单关联关系
	 * 
	 * @param userMenuPO 用户-菜单对应关系对象
	 * @return 执行条数
	 */
	public int insertUserMenu(UserMenuPO userMenuPO) throws Exception {
		String insert = "INSERT INTO META_MAG_USER_MENU(USER_ID,MENU_ID,EXCLUDE_BUTTON,FLAG) VALUES(?,?,?,?)";
		Object[] proParams = { userMenuPO.getUserId(), userMenuPO.getMenuId(), userMenuPO.getExcludeButton(),
				userMenuPO.getFlag() };
		return getDataAccess().execUpdate(insert, proParams);
	}

	/**
	 * 批量新增一批关联用户数据
	 * 
	 * @param userMenuPOs
	 * @return
	 * @throws Exception
	 */
	public int[] insertBatchUserMenu(final List<UserMenuPO> userMenuPOs) throws Exception {
		String insert = "INSERT INTO META_MAG_USER_MENU(USER_ID,MENU_ID,EXCLUDE_BUTTON,FLAG) VALUES(?,?,?,?)";
		return getDataAccess().execUpdateBatch(insert, new IParamsSetter() {
			public void setValues(PreparedStatement proParams, int i) throws SQLException {
				UserMenuPO userMenuPO = userMenuPOs.get(i);
				proParams.setObject(1, userMenuPO.getUserId());
				proParams.setObject(2, userMenuPO.getMenuId());
				proParams.setObject(3, userMenuPO.getExcludeButton() == null ? "" : userMenuPO.getExcludeButton());
				proParams.setObject(4, userMenuPO.getFlag());
			}

			public int batchSize() {
				return userMenuPOs.size();
			}
		});
	}

	/**
	 * 批量删除一批关联菜单数据
	 * 
	 * @param userMenuPOs
	 * @return
	 * @throws Exception
	 */
	public int[] deleteBatchUserMenu(final List<UserMenuPO> userMenuPOs) throws Exception {
		String sql = "DELETE META_MAG_USER_MENU WHERE USER_ID=? AND MENU_ID=? ";
		return getDataAccess().execUpdateBatch(sql, new IParamsSetter() {
			public void setValues(PreparedStatement proParams, int i) throws SQLException {
				UserMenuPO userMenuPO = userMenuPOs.get(i);
				proParams.setObject(1, userMenuPO.getUserId());
				proParams.setObject(2, userMenuPO.getMenuId());
			}

			public int batchSize() {
				return userMenuPOs.size();
			}
		});
	}

	/**
	 * 有则更新，无则新增
	 * 
	 * @param userMenuPOs
	 * @return
	 * @throws Exception
	 */
	public int[] mergeInto(final List<UserMenuPO> userMenuPOs) throws Exception {
		String sql = "MERGE INTO META_MAG_USER_MENU A USING (SELECT ? USER_ID,? MENU_ID,? FLAG,? EXCLUDE_BUTTON FROM DUAL ) B "
				+ "ON (A.MENU_ID=B.MENU_ID AND A.USER_ID=B.USER_ID) WHEN NOT MATCHED THEN "
				+ "INSERT (USER_ID,MENU_ID,EXCLUDE_BUTTON,FLAG) VALUES(B.USER_ID,B.MENU_ID,B.EXCLUDE_BUTTON,B.FLAG ) "
				+ "WHEN MATCHED THEN UPDATE SET A.FLAG=B.FLAG ,A.EXCLUDE_BUTTON=B.EXCLUDE_BUTTON ";
		return getDataAccess().execUpdateBatch(sql, new IParamsSetter() {
			public void setValues(PreparedStatement proParams, int i) throws SQLException {
				UserMenuPO userMenuPO = userMenuPOs.get(i);
				proParams.setObject(1, userMenuPO.getUserId());
				proParams.setObject(2, userMenuPO.getMenuId());
				proParams.setObject(3, userMenuPO.getFlag());
				proParams.setObject(4, userMenuPO.getExcludeButton() == null ? "" : userMenuPO.getExcludeButton());
			}

			public int batchSize() {
				return userMenuPOs.size();
			}
		});
	}

	/**
	 * 修改用户-菜单关联关系 修改标志位以及无权限的按钮
	 * 
	 * @param userMenuPOs 用户-菜单对应关系对象
	 * @return 执行条数
	 * @throws Exception
	 */
	public int[] updateBatchUserMenu(final List<UserMenuPO> userMenuPOs) throws Exception {
		String update = "UPDATE META_MAG_USER_MENU SET EXCLUDE_BUTTON=?, FLAG=? " + "WHERE USER_ID=? AND MENU_ID=?";
		return getDataAccess().execUpdateBatch(update, new IParamsSetter() {
			public void setValues(PreparedStatement proParams, int i) throws SQLException {
				UserMenuPO userMenuPO = userMenuPOs.get(i);
				proParams.setObject(1, userMenuPO.getExcludeButton());
				proParams.setObject(2, userMenuPO.getFlag());
				proParams.setObject(3, userMenuPO.getUserId());
				proParams.setObject(4, userMenuPO.getMenuId());
			}

			public int batchSize() {
				return userMenuPOs.size();
			}
		});
	}

	/**
	 * 查询人员简单信息
	 * 
	 * @param userIds
	 * @return
	 */
	public List<Map<String, Object>> querySimpleInfoByIds(long[] userIds) {
		String sql = "SELECT USER_ID, USER_EMAIL, USER_PASS, USER_NAMECN, STATE, USER_MOBILE, STATION_ID, ADMIN_FLAG, HEAD_SHIP, CREATE_DATE,"
				+ " USER_NAMEEN, OA_USER_NAME, DEPT_ID, ZONE_ID, USER_SN, VIP_FLAG, GROUP_ID, DEFAULT_URL FROM META_MAG_USER WHERE　USER_ID IN"
				+ SqlUtils.inParamDeal(userIds);
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 批量删除菜单和用户中间表的关系
	 * 
	 * @param menuId int 菜单的id
	 * @param userIds String 用户所有的id的集合
	 * @return int
	 * @throws Exception

	 */
	public int deleteMenuUserById(int menuId, String userIds) throws Exception {
		String sql = null;
		int flag = -1;
		if (userIds != null) {
			sql = "DELETE FROM META_MAG_USER_MENU WHERE MENU_ID=" + menuId + " AND USER_ID IN(" + userIds + ")";
			flag = getDataAccess().execUpdate(sql);
		}
		return flag;
	}

	/**
	 * 角色管理模块：角色-用户关联关系设置中的查询备选用户
	 * 
	 * @param condtions 查询条件
	 * @param page 分页对象
	 * @param roleID 角色ID
	 * @return
	 */
	public List<Map<String, Object>> queryUserNotInUserRole(Map<String, Object> condtions, Page page, int roleID) {
		String where = " AND A.USER_ID NOT IN (SELECT USER_ID FROM META_MAG_USER_ROLE WHERE ROLE_ID=" + roleID + ") ";
		return this.queryUserByCondition(condtions, page, where);
	}

	/**
	 * 根据用户ID查询当前用户已存在的权限，包括角色授予的权限和用户和菜单关联的菜单数据
	 * 和用户关联的菜单数据有两种，一种是相对于权限增加FLAG=1，一种是减少FLAG=0 对于一个菜单ID，不可能又存在增加的数据，又存在减少的数据。
	 * 
	 * @param userId 用户ID
	 * @return 符合条件的数据
	 */
	public List<Map<String, Object>> queryUserMenuByUserID(int userId, int groupId) {
		String sql = "SELECT USER_ID, MENU_ID, EXCLUDE_BUTTON, FLAG ROLE_FLAG FROM META_MAG_USER_MENU WHERE USER_ID="
				+ userId
				+ " UNION ALL SELECT USER_ID, c.MENU_ID, EXCLUDE_BUTTON, -1 ROLE_FLAG FROM META_MAG_USER_ROLE A, "
				+ " META_MAG_ROLE_MENU B,META_mag_menu C WHERE A.USER_ID=" + userId
				+ " AND B.ROLE_ID=A.ROLE_ID and c.menu_id = b.menu_id AND c.GROUP_ID=" + groupId;
		List<Map<String, Object>> data = getDataAccess().queryForList(sql);
		return data;
	}

	/**
	 * 查询用户拥有的权限和按钮权限
	 * 
	 * @param userId belongSys
	 * @return 符合条件的数据
	 */
	public List<Map<String, Object>> queryUserMenuByUserBelogSys(int userId, int belongSys) {
		String wherSql = "WHERE B.USER_ID = " + userId;
		if (userId == 1) {
			wherSql = "";
		}

		String sql = "select T1.MENU_ID,T1.PARENT_ID,T1.MENU_NAME,T1.MENU_TIP,T1.MENU_URL,T1.PAGE_BUTTON,T1.GROUP_ID,T1.ORDER_ID,T1.IS_SHOW,T1.CREATE_DATE,T1.ICON_URL,T1.TARGET,T1.USER_ATTR,"
				+ "T1.NAV_STATE,T1.USER_ATTR_LIST,T1.MENU_STATE "
				+ " from META_MAG_MENU T1,("
				+ " select b.menu_id"
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
				+ " group by b.menu_id) T2 where  T1.Menu_Id=T2.menu_id AND T1.IS_SHOW = 1 AND T1.GROUP_ID="
				+ belongSys;
		List<Map<String, Object>> data = getDataAccess().queryForList(sql);
		return data;
	}

	/**
	 * 根据GroupID和UserId从用户-菜单关联表中取出对应的menuId
	 * 
	 * @param groupId 系统ID
	 * @param userId 用户ID
	 * @return 菜单ID数组
	 */
	public int[] queryMenuIdsByGroupIdUserId(int groupId, int userId) {
		String sql = "SELECT T.MENU_ID FROM META_MAG_USER_MENU T WHERE T.USER_ID=" + userId
				+ " AND T.MENU_ID IN (SELECT T1.MENU_ID FROM META_MAG_MENU T1 " + "WHERE T1.GROUP_ID=" + groupId + ") ";
		String[] stringValues = getDataAccess().queryForPrimitiveArray(sql, String.class);
		int[] intValues = new int[stringValues.length];
		for (int i = 0; i < intValues.length; i++) {
			intValues[i] = Integer.parseInt(stringValues[i]);
		}
		return intValues;
	}

	/**
	 * 根据用户ID和菜单ID判断是否存在关联关系
	 * 
	 * @param userId 用户ID
	 * @param menuId 菜单ID
	 * @return 是否存在
	 */
	public boolean ifExistUserMenu(int userId, int menuId) {
		String sql = "SELECT COUNT(*) FROM META_MAG_USER_MENU WHERE USER_ID=" + userId + " AND MENU_ID=" + menuId;
		return getDataAccess().queryForInt(sql) > 0;
	}

	/**
	 * 根据用户ID，菜单ID删除用户-菜单关联关系
	 * 
	 * @param userId 用户ID
	 * @param menuId 菜单ID
	 * @return 执行的条数
	 * @throws Exception
	 */
	public int deleteUserMenuByUserIdMenuId(int userId, int menuId) throws Exception {
		String sql = "DELETE FROM META_MAG_USER_MENU WHERE MENU_ID=" + menuId + " AND USER_ID=" + userId;
		return getDataAccess().execUpdate(sql);
	}

	/**
	 * 根据用户ID和岗位ID(关联角色的岗位)删除用户-角色关联关系信息
	 * 
	 * @param stationId 岗位ID
	 * @param userId 用户ID
	 * @return 删除条数
	 * @throws Exception
	 */
	public int deleteUserRoleByStationIdUserId(int stationId, int userId) throws Exception {
		String sql = "DELETE FROM META_MAG_USER_ROLE T WHERE T.USER_ID=" + userId + " AND "
				+ "T.ROLE_ID IN (SELECT T1.ROLE_ID FROM META_MAG_ROLE_ORG T1 WHERE T1.STATION_ID=" + stationId + ") ";
		return getDataAccess().execUpdate(sql);
	}

	/**
	 * 根据用户ID和部门ID(关联角色的部门)删除用户-角色关联关系信息
	 * 
	 * @param deptId 部门ID
	 * @param userId 用户ID
	 * @return 删除条数
	 * @throws Exception
	 */
	public int deleteUserRoleByDeptIdUserId(int deptId, int userId) throws Exception {
		String sql = "DELETE FROM META_MAG_USER_ROLE T WHERE T.USER_ID=" + userId + " AND "
				+ "T.ROLE_ID IN (SELECT T1.ROLE_ID FROM META_MAG_ROLE_ORG T1 WHERE T1.DEPT_ID=" + deptId + ") ";
		return getDataAccess().execUpdate(sql);
	}

	/**
	 * 批量插入用户-角色关联关系表
	 * 
	 * @param userId 单个的用户ID
	 * @param roleIds 批量的角色ID数组
	 * @return 插入条数
	 * @throws Exception
	 */
	public int[] insertUserRoleBatch(final int userId, final int[] roleIds) throws Exception {
		String sql = "INSERT INTO META_MAG_USER_ROLE VALUES(" + userId + ",?,0,0)";
		return getDataAccess().execUpdateBatch(sql, new IParamsSetter() {
			public void setValues(PreparedStatement proParams, int i) throws SQLException {
				proParams.setObject(1, roleIds[i]);
			}

			public int batchSize() {
				return roleIds.length;
			}
		});
	}

	/**
	 * 批量插入用户-角色关联关系表
	 * 
	 * @param userIds 批量的用户ID数组
	 * @param roleId 单个的角色ID
	 * @return
	 * @throws Exception
	 */
	public int[] insertUserRoleBatch(final int userIds[], int roleId) throws Exception {
		String sql = "INSERT INTO META_MAG_USER_ROLE VALUES(?," + roleId + ",0,0)";
		return getDataAccess().execUpdateBatch(sql, new IParamsSetter() {
			public void setValues(PreparedStatement proParams, int i) throws SQLException {
				proParams.setObject(1, userIds[i]);
			}

			public int batchSize() {
				return userIds.length;
			}
		});
	}

	/**
	 * 根据用户ID取得其关联的角色名称字符串
	 * 
	 * @param userId 用户ID
	 * @return 角色名称字符串
	 */
	public String queryRefRoleNamesByUserId(int userId) {
		String sql = "SELECT B.ROLE_NAME FROM META_MAG_USER_ROLE A LEFT JOIN META_MAG_ROLE B ON A.ROLE_ID = B.ROLE_ID "
				+ "WHERE A.USER_ID=" + userId;
		String[] rtnArray = getDataAccess().queryForPrimitiveArray(sql, String.class);
		String rtnValue = "";
		for (int i = 0; i < rtnArray.length; i++) {
			rtnValue = rtnValue + rtnArray[i] + ",";
			if (i == rtnArray.length - 1) {
				rtnValue = rtnValue.substring(0, rtnValue.length() - 1);
			}
		}
		return rtnValue;
	}

	/**
	 * 根据用户ID取得其关联的菜单名称字符串
	 * 
	 * @param userId 用户ID
	 * @return 菜单名称字符串
	 */
	public String queryRefMenuNamesByUserId(int userId) {
		String sql = "SELECT B.MENU_NAME FROM META_MAG_USER_MENU A LEFT JOIN META_MAG_MENU B ON A.MENU_ID = B.MENU_ID "
				+ "WHERE A.USER_ID=" + userId;
		sql = sql + " ORDER BY A.MENU_ID";
		String[] rtnArray = getDataAccess().queryForPrimitiveArray(sql, String.class);
		String rtnValue = "";
		for (int i = 0; i < rtnArray.length; i++) {
			rtnValue = rtnValue + rtnArray[i] + ",";
			if (i == rtnArray.length - 1) {
				rtnValue = rtnValue.substring(0, rtnValue.length() - 1);
			}
		}
		return rtnValue;
	}

	/**
	 * 根据岗位、部门、地域ID取得批量的用户ID 包括子岗位、子部门、子地域的用户
	 * 返回的用户ID不存在于用户-角色表中的已知roleID对应的UserID中
	 * 
	 * @param roleId 角色ID
	 * @param stationIds 岗位ID
	 * @param zoneIds 地域ID
	 * @param deptIds 部门ID
	 * @return 符合条件的用户ID数组
	 * @throws Exception
	 */
	public int[] queryUserNotInUserRoleByRoleIdDim(int roleId, String stationIds, String zoneIds, String deptIds)
			throws Exception {
		String sql = "SELECT B.USER_ID FROM META_MAG_USER B WHERE B.USER_ID<>" + UserConstant.ADMIN_USERID
				+ " AND B.STATE = 1";
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
		sql = sql + " AND B.USER_ID NOT IN(SELECT USER_ID FROM META_MAG_USER_ROLE WHERE ROLE_ID=" + roleId + ")";
		String[] strValues = getDataAccess().queryForPrimitiveArray(sql, String.class);
		int[] intValues = new int[strValues.length];
		for (int i = 0; i < intValues.length; i++) {
			intValues[i] = Integer.parseInt(strValues[i]);
		}
		return intValues;
	}

	/**
	 * 根据角色、岗位、部门、地域查询与该角色关联的用户ID数组
	 * 
	 * @param stationId
	 * @param zoneId
	 * @param deptId
	 * @return
	 * @throws Exception
	 */
	public int[] queryUserIdsByRoleIdDim(int roleId, int stationId, int zoneId, int deptId) throws Exception {
		String sql = "SELECT A.USER_ID FROM META_MAG_USER_ROLE A WHERE A.ROLE_ID=" + roleId + " AND"
				+ " A.USER_ID IN (SELECT B.USER_ID FROM META_MAG_USER B WHERE B.USER_ID<>" + UserConstant.ADMIN_USERID
				+ " ";
		if (stationId != 0) {
			sql = sql + " AND B.STATION_ID IN (SELECT STATION_ID FROM META_DIM_USER_STATION START WITH STATION_ID="
					+ stationId + " CONNECT BY PRIOR STATION_ID=STATION_PAR_ID) ";
		}
		if (zoneId != 0) {
			sql = sql + " AND B.ZONE_ID IN (SELECT ZONE_ID FROM META_DIM_ZONE START WITH ZONE_ID=" + zoneId
					+ " CONNECT BY PRIOR ZONE_ID=ZONE_PAR_ID) ";
		}
		if (deptId != 0) {
			sql = sql + " AND B.DEPT_ID IN (SELECT DEPT_ID FROM META_DIM_USER_DEPT START WITH DEPT_ID=" + deptId
					+ " CONNECT BY PRIOR DEPT_ID=DEPT_PAR_ID)";
		}
		sql = sql + ")";
		String[] stringValues = getDataAccess().queryForPrimitiveArray(sql, String.class);
		int[] intValues = new int[stringValues.length];
		for (int i = 0; i < intValues.length; i++) {
			intValues[i] = Integer.parseInt(stringValues[i]);
		}
		return intValues;
	}

	/**
	 * @param oaUserName 新OA 用户名
	 * @return

	 */
	public int findUserByNewOAUserName(String oaUserName) {
		String sql = "SELECT USER_ID FROM META_MAG_USER T WHERE T.OA_USER_NAME='" + oaUserName + "'";
		int rtn = -1;
		try {
			rtn = Integer.parseInt(getDataAccess().queryForString(sql));
		} catch (Exception e) {
		}
		return rtn;

	}

	/**
	 * @param menuID
	 * @return

	 */
	public String findMenuNameByMenuId(String menuID) {
		String sql = "SELECT MENU_NAME FROM META_MAG_MENU WHERE MENU_ID=" + menuID;
		String menuNames = getDataAccess().queryForString(sql);
		return menuNames;
	}

	/**
	 * @param condtions session中的数据
	 * @param page 分页
	 * @param userId 用户ID
	 * @param otherWheres 排序
	 * @return 返回查询list结果集

	 */
	public List<Map<String, Object>> queryUserBySession(Map<String, Object> condtions, Page page, String userId,
			String otherWheres) {
		StringBuffer sql = new StringBuffer(
				"SELECT A.USER_EMAIL, A.USER_NAMECN,A.USER_ID, "
						+ "A.USER_MOBILE, A.HEAD_SHIP,"
						+ "A.USER_NAMEEN, A.OA_USER_NAME, A.USER_SN, "
						+ "B.ZONE_NAME, C.DEPT_NAME,D.STATION_NAME "
						+ "FROM META_MAG_USER A LEFT JOIN META_DIM_ZONE B ON A.ZONE_ID=B.ZONE_ID "
						+ "LEFT JOIN META_DIM_USER_DEPT C ON A.DEPT_ID=C.DEPT_CODE LEFT JOIN META_DIM_USER_STATION D ON D.STATION_CODE=A.STATION_ID "
						+ "WHERE USER_ID =" + userId + " ");
		List<Object> params = new ArrayList<Object>();
		if (condtions != null && condtions.get("zoneId") != null && !String.valueOf(condtions.get("zoneId")).equals("")) {// 地域
			sql.append("AND A.ZONE_ID=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("zoneId"))));
		}
		if (condtions != null && condtions.get("deptId") != null && !String.valueOf(condtions.get("deptId")).equals("")) {// 部门
			sql.append("AND A.DEPT_ID=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("deptId"))));
		}
		if (condtions != null && condtions.get("stationId") != null
				&& !String.valueOf(condtions.get("stationId ")).equals("")) {// 岗位
			sql.append("AND A.STATION_ID=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("stationId"))));
		}
		String pageSql = sql.toString();
		if (otherWheres != null) {
			pageSql = pageSql + " " + otherWheres;
		} else {
			pageSql += " ORDER BY A.USER_SN,A.USER_ID ";
		}
		// 分页包装
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}

		return getDataAccess().queryForList(pageSql, params.toArray());
	}

	/**
	 * @param condtions
	 * @param page
	 * @param userName
	 * @param otherWheres
	 * @return

	 */
	public List<Map<String, Object>> querUserListByUserName(Map<String, Object> condtions, Page page, String userName,
			String otherWheres) {
		StringBuffer sql = new StringBuffer(
				"SELECT A.USER_EMAIL, A.USER_NAMECN,A.USER_ID, "
						+ "A.USER_MOBILE, A.HEAD_SHIP,"
						+ "A.USER_NAMEEN, A.OA_USER_NAME, A.USER_SN, "
						+ "B.ZONE_NAME, C.DEPT_NAME,D.STATION_NAME "
						+ "FROM META_MAG_USER A LEFT JOIN META_DIM_ZONE B ON A.ZONE_ID=B.ZONE_ID "
						+ "LEFT JOIN META_DIM_USER_DEPT C ON A.DEPT_ID=C.DEPT_CODE LEFT JOIN META_DIM_USER_STATION D ON D.STATION_CODE=A.STATION_ID "
						+ "WHERE USER_NAMECN LIKE ?");
		List<Object> params = new ArrayList<Object>();
		params.add("%" + userName + "%");
		if (condtions != null && condtions.get("zoneId") != null && !String.valueOf(condtions.get("zoneId")).equals("")) {// 地域
			sql.append("AND A.ZONE_ID=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("zoneId"))));
		}
		if (condtions != null && condtions.get("deptId") != null && !String.valueOf(condtions.get("deptId")).equals("")) {// 部门
			sql.append("AND A.DEPT_ID=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("deptId"))));
		}
		if (condtions != null && condtions.get("stationId") != null
				&& !String.valueOf(condtions.get("stationId ")).equals("")) {// 岗位
			sql.append("AND A.STATION_ID=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("stationId"))));
		}
		if (condtions != null && condtions.get("userId") != null
				&& !String.valueOf(condtions.get("userId ")).equals("")) {// 岗位
			sql.append("AND A.USER_ID=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("userId"))));
		}
		String pageSql = sql.toString();
		if (otherWheres != null) {
			pageSql = pageSql + " " + otherWheres;
		} else {
			pageSql += " ORDER BY A.USER_SN,A.USER_ID ";
		}
		// 分页包装
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}

		return getDataAccess().queryForList(pageSql, params.toArray());
	}

	/**
	 * 查询所有用户最后一次登录时间 只包括有效用户，并派出指定岗位的用户
	 * 如果日志中不存在该用户，会查出该用户申请的时间，并且用户如果是启用状态，会查出该用户上一次被修改的时间
	 * 

	 */
	public List<Map<String, Object>> getUserLoginLast(String[] hiddenStation, Date date) {
		String sqlInter = "SELECT USER_ID,LOGINDATE,CHANGEDATE FROM "
				+ "(SELECT T.USER_ID,NVL(NVL(MAX(A.LOGIN_DATE),MAX(B.CHANGE_TIME)),MAX(T.CREATE_DATE)) "
				+ "LOGINDATE,NVL(MAX(B.CHANGE_TIME),MAX(T.CREATE_DATE)) "
				+ "CHANGEDATE FROM META_MAG_USER T LEFT JOIN META_MAG_LOGIN_LOG A "
				+ "ON T.USER_ID=A.USER_ID LEFT JOIN (SELECT * FROM META_MAG_USER_CHANGE_LOG "
				+ "WHERE CHANGE_TYPE IN (?,?)) B ON T.USER_ID=B.USER_ID WHERE T.STATE=1 " + " AND T.STATION_ID NOT "
				+ "IN(22) GROUP BY T.USER_ID) TAB WHERE TAB.LOGINDATE<TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') "
				+ "AND TAB.CHANGEDATE<TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ";
		DateFormat simple = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Object[] params = { UserConstant.META_MAG_USER_CHANGE_NAME_STARTUSER,
				UserConstant.META_MAG_USER_CHANGE_NAME_AUDITSTATEPASS, simple.format(date), simple.format(date) };
		return getDataAccess().queryForList(sqlInter, params);
	}

	/**
	 * 重置密码
	 * 
	 * @param userId 用户ID
	 * @param password 密码
	 * @return 返回结果
	 * @throws Exception
	 */
	public int initPassWord(int userId, String password) throws Exception {
		String sql = "UPDATE META_MAG_USER SET USER_PASS=?" + "WHERE USER_ID=?";
		return getDataAccess().execUpdate(sql, new Object[] { password, userId });
	}

	/**
	 * 根据中文名查询用户信息。
	 * 
	 * @param namecn 用户中文名
	 * @return 符合条件的数据
	 */
	public List<Map<String, Object>> queryUserByNamecnAndId(String namecn, int userId) {
		String sql = "SELECT USER_ID,USER_EMAIL,USER_PASS,USER_NAMECN "
				+ ",STATE,USER_MOBILE,STATION_ID,ADMIN_FLAG,HEAD_SHIP "
				+ ",TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH:MI:SS') CREATE_DATE,USER_NAMEEN,OA_USER_NAME,DEPT_ID,ZONE_ID, "
				+ " USER_SN,VIP_FLAG,GROUP_ID FROM META_MAG_USER " + " WHERE  USER_NAMECN= ? ";
		return getDataAccess().queryForList(sql, namecn);
	}

	/**
	 * 根据用户邮箱和用户ID查询用户信息
	 * 
	 * @param email 用户邮箱
	 * @param userId 用户ID
	 * @return 用户信息
	 */
	public List<Map<String, Object>> queryUserByEmailAndId(String email, int userId) {
		String sql = "SELECT USER_ID,USER_EMAIL,USER_PASS,USER_NAMECN "
				+ ",STATE,USER_MOBILE,STATION_ID,ADMIN_FLAG,HEAD_SHIP "
				+ ",TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH:MI:SS') CREATE_DATE,USER_NAMEEN,OA_USER_NAME,DEPT_ID,ZONE_ID, "
				+ " USER_SN,VIP_FLAG,GROUP_ID FROM META_MAG_USER " + " WHERE  USER_EMAIL= ? " + " AND USER_ID <> "
				+ userId;
		return getDataAccess().queryForList(sql, email);
	}

	/**
	 * 根据用户名和用户ID查询用户信息
	 * 
	 * @param namecn 用户名
	 * @param userId 用户ID
	 * @return 用户信息
	 */
	public List<Map<String, Object>> queryUserByNamecnAnduserId(String namecn, int userId) {
		String sql = "SELECT USER_ID,USER_EMAIL,USER_PASS,USER_NAMECN "
				+ ",STATE,USER_MOBILE,STATION_ID,ADMIN_FLAG,HEAD_SHIP "
				+ ",TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH:MI:SS') CREATE_DATE,USER_NAMEEN,OA_USER_NAME,DEPT_ID,ZONE_ID, "
				+ " USER_SN,VIP_FLAG,GROUP_ID FROM META_MAG_USER " + " WHERE  USER_NAMECN= ? " + " AND USER_ID <> "
				+ userId;
		return getDataAccess().queryForList(sql, namecn);
	}

	/**
	 * 根据状态查询用户信息（待审核用户）
	 * 
	 * @param condtions
	 * @param page
	 * @param otherWheres
	 * @return
	 */
	public List<Map<String, Object>> queryUserByState(Map<String, Object> condtions, Page page, String otherWheres) {
		String zoneId = "", zoneSql = "";
		if (condtions != null && condtions.get("zoneId") != null) {
			zoneId = condtions.get("zoneId").toString();
			zoneSql = "((SELECT b.zone_id,level zone_level  FROM META_DIM_ZONE B START WITH B.ZONE_PAR_ID in ("
					+ zoneId + ") CONNECT BY PRIOR B.ZONE_ID = B.ZONE_PAR_ID "
					+ "union SELECT F.ZONE_ID,-1 zone_level FROM META_DIM_ZONE F WHERE F.ZONE_ID in (" + zoneId
					+ "))) E,";
		}
		StringBuffer sql = new StringBuffer(
				"SELECT A.USER_ID, A.USER_EMAIL, A.USER_PASS, A.USER_NAMECN, A.STATE, "
						+ "A.USER_MOBILE, A.STATION_ID, A.ADMIN_FLAG, A.HEAD_SHIP,TO_CHAR(CREATE_DATE,'YYYY-MM-DD HH24:MI:SS') CREATE_DATE, "
						+ "A.USER_NAMEEN, A.OA_USER_NAME, A.DEPT_ID, A.ZONE_ID, A.USER_SN, "
						+ "A.VIP_FLAG, A.GROUP_ID, B.ZONE_NAME, C.DEPT_NAME,D.STATION_NAME,E.zone_level "
						+ "FROM "
						+ zoneSql
						+ "META_MAG_USER A LEFT JOIN META_DIM_ZONE B ON A.ZONE_ID=B.ZONE_ID "
						+ "LEFT JOIN META_DIM_USER_DEPT C ON A.DEPT_ID=C.DEPT_CODE LEFT JOIN META_DIM_USER_STATION D ON D.STATION_CODE=A.STATION_ID "
						+ "WHERE USER_ID<>" + UserConstant.ADMIN_USERID
						+ " AND A.STATE = 2  AND A.ZONE_ID  = E.ZONE_ID");
		List<Object> params = new ArrayList<Object>();
		if (condtions != null && condtions.get("userName") != null && !condtions.get("userName").toString().equals("")) {// 姓名
			sql.append("AND A.USER_NAMECN LIKE ? ESCAPE '/' ");
			params.add("%" + Convert.toString(condtions.get("userName")).trim() + "%");
		}
		// if (condtions != null && condtions.get("userState") != null
		// && !String.valueOf(condtions.get("userState")).equals("-1")) {// 状态
		// sql.append("AND A.STATE=? ");
		// params.add(Integer.parseInt(String.valueOf(condtions
		// .get("userState"))));
		// }
		// if (condtions != null && condtions.get("zoneId") != null
		// && !String.valueOf(condtions.get("zoneId")).equals("")) {// 地域
		// sql.append("AND A.ZONE_ID=? ");
		// params.add(Integer
		// .parseInt(String.valueOf(condtions.get("zoneId"))));
		// }
		if (condtions != null && condtions.get("deptId") != null && !String.valueOf(condtions.get("deptId")).equals("")) {// 部门
			sql.append("AND A.DEPT_ID=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("deptId"))));
		}
		if (condtions != null && condtions.get("stationId") != null
				&& !String.valueOf(condtions.get("stationId ")).equals("")) {// 岗位
			sql.append("AND A.STATION_ID=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("stationId"))));
		}
		if (condtions != null && condtions.get("userId") != null) {// 用户ID
			sql.append("AND A.USER_ID=? ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("userId"))));
		}
		String pageSql = sql.toString();
		if (otherWheres != null) {
			pageSql = pageSql + " " + otherWheres;
		} else {
			pageSql += "  ORDER BY zone_level,ZONE_ID";
		}
		// 分页包装
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}

		return getDataAccess().queryForList(pageSql, params.toArray());
	}

	/**
	 * 根据OA名称查询用户
	 * 
	 * @param oaName
	 * @return
	 */
	public List<Map<String, Object>> queryUserByOaName(String oaName) {
		String sql = "SELECT T.USER_ID,T.USER_NAMECN FROM META_MAG_USER T WHERE T.OA_USER_NAME = ?";
		return getDataAccess().queryForList(sql, oaName);
	}

	/**
	 * 根据ID和OA名字查询用户信息
	 * 
	 * @param oaName
	 * @param userId
	 * @return
	 */
	public List<Map<String, Object>> queryUserByOANamecnAnduserId(String oaName, int userId) {
		String sql = "SELECT T.USER_ID,T.USER_NAMECN FROM META_MAG_USER T WHERE T.OA_USER_NAME = ?"
				+ " AND T.USER_ID <> " + userId;
		return getDataAccess().queryForList(sql, oaName);
	}

	/**
	 * 根据用户ID查询其菜单保存的菜单信息
	 * 
	 * @param userId
	 * @return
	 */
	public List<Map<String, Object>> queryUserMenuByUserId(int userId) {
		// String sql =
		// "SELECT T.USER_ID,T.MENU_ID,TO_CHAR(T.CREATE_TIME,'YYYY-MM-DD')CREATE_TIME,M.MENU_URL,M.MENU_NAME "
		// +
		// " FROM META_MAG_USER_FAVORITE T LEFT JOIN META_MAG_MENU M ON T.MENU_ID = M.MENU_ID  "
		// +
		// " WHERE T.USER_ID = "+userId;
		String sql = "SELECT B.*,TO_CHAR(A.CREATE_TIME,'YYYY-MM-DD HH24:MI:SS') CREATE_TIME FROM META_MAG_USER_FAVORITE A "
				+ "JOIN (SELECT SUBSTR(SYS_CONNECT_BY_PATH(Y.MENU_NAME, '->'), 3) MENU_NAME_INS,Y.MENU_NAME,"
				+ "Y.MENU_ID, Y.MENU_URL FROM META_MAG_MENU Y START WITH Y.PARENT_ID = 0 CONNECT BY PRIOR Y.MENU_ID = Y.PARENT_ID) B "
				+ "ON A.USER_ID=" + userId + " AND A.MENU_ID=B.MENU_ID";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 添加菜单到收藏夹
	 * 
	 * @param
	 * @return
	 * @throws Exception
	 */
	public int addUserMenuFavorite(int userId, int menuId) throws Exception {
		String sql = " INSERT INTO META_MAG_USER_FAVORITE" + " (USER_ID,MENU_ID,CREATE_TIME)"
				+ " VALUES(?,?,TO_DATE(?,'YYYY-MM-DD HH24:MI:SS'))";
		Date stateDate = new Date();
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");// 转换格式
		Object[] params = { userId, menuId, dateFormat.format(stateDate) };
		return getDataAccess().execUpdate(sql, params);
	}

	public int queryUserMenuFavorite(int userId, int menuId) {
		String sql = "SELECT COUNT(1) FROM META_MAG_USER_FAVORITE WHERE USER_ID=? AND MENU_ID=?";
		Object[] params = { userId, menuId };
		return super.getDataAccess().queryForInt(sql, params);
	}

	/**
	 * 删除用户收藏夹菜单
	 * 
	 * @param userId
	 * @param menuId
	 * @return
	 * @throws Exception
	 */
	public int deleteUserMenu(int userId, int menuId) throws Exception {
		String sql = "DELETE FROM META_MAG_USER_FAVORITE M " + " WHERE M.USER_ID = " + userId + "AND M.MENU_ID = "
				+ menuId;
		return getDataAccess().execUpdate(sql);
	}

	/**
	 * 查询用户在meta_mag_user_menu表中是否有对于menu_id的记录如果有且flag为1则delete,
	 * 若没有menu_id记录这insert一条flag为0的记录
	 * 
	 * @param userId
	 * @param menuId
	 * @return
	 * @throws Exception
	 */
	public int queryUserMenuid(int userId, int menuId) throws Exception {
		String sql = "SELECT count(1)  FROM META_MAG_USER_MENU WHERE USER_ID =" + userId + " AND MENU_ID = " + menuId;

		return getDataAccess().queryForInt(sql);
	}

	public int[] insertUserChangeLog(int[] userIds, String changeType, int editorType, Integer currUserId) {
		String insertSql = "INSERT INTO META_MAG_USER_CHANGE_LOG (LOG_ID,USER_ID,CHANGE_TYPE, "
				+ "CHANGE_TIME,EDITOR_TYPE,EDITOR_ID) VALUES (?,?,?,SYSDATE,?,?) ";
		Object[][] params = new Object[userIds.length][5];
		for (int i = 0; i < userIds.length; i++) {
			params[i][0] = queryForNextVal("SEQ_MAG_USER_CHANGE_ID");
			params[i][1] = userIds[i];
			params[i][2] = changeType;
			params[i][3] = editorType;
			params[i][4] = currUserId;
		}
		return getDataAccess().execUpdateBatch(insertSql, params);
	}

	/**
	 * 根据菜单ID，获取此菜单的完全路径
	 * 
	 * @param menuId 菜单ID
	 * @param conChar 连接字符
	 * @return 返回用连接字符连接的完全字符 如：系统管理->用户管理->用户申请 (其中“->”为连接符)
	 */
	public String getMenuAllPath(int menuId, String conChar) {
		if (conChar == null || "".equals(conChar)) {
			conChar = "/";
		}
		String sql = "SELECT MENU_ID,PARENT_ID,MENU_NAME FROM META_MAG_MENU CONNECT BY PRIOR PARENT_ID=MENU_ID START WITH MENU_ID=? ORDER BY PARENT_ID ";
		List<Map<String, Object>> menus = getDataAccess().queryForList(sql, menuId);
		String path = "";
		for (int i = 0; i < menus.size(); i++) {
			path += MapUtils.getString(menus.get(i), "MENU_NAME");
			if (i != menus.size() - 1) {
				path += conChar;
			}
		}
		return path;
	}

	/**
	 * 通过渠道取数的userName查询用户id
	 * 
	 * @param cnlUserName
	 * @return
	 */
	public int queryUserIdByCnlUserName(String cnlUserName) {
		int userId = -1;
		String sql = "SELECT T.USER_ID FROM META_MAG_USER T WHERE T.CNL_USER_NAME=?";
		Map<String, Object> rs = getDataAccess().queryForMap(sql, cnlUserName);
		if (rs != null && rs.size() > 0) {
			userId = MapUtils.getIntValue(rs, "USER_ID", -1);
		}
		return userId;
	}
}
