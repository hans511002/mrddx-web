package com.ery.meta.module.mag.login;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;
import com.ery.meta.common.DateUtil;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.util.SystemSeqService;
import com.ery.meta.web.session.User;

/**
 * 
 * 
 * 
 * @description 登录日志记录DAO <br>
 * @date 2011-10-03
 */
public class LoginLogDAO extends MetaBaseDAO {

	/**
	 * 登录时记录登录日志
	 * 
	 * @param loginData
	 * @return
	 */
	public long insertLoginLog(User user) {
		String sql = " ";
		long pk = 0;
		if (isMysql()) {
			pk = SystemSeqService.getSeqNextValue("META_MAG_LOGIN_LOG.LOG_ID", "SEQ_LOGIN_LOG_ID");
			sql = "INSERT INTO META_MAG_LOGIN_LOG ( " + " LOG_ID, USER_ID,GROUP_ID, LOGIN_IP, LOGIN_MAC, "
					+ " LOGIN_DATE) VALUES ( " + " ?,?,?,?,? ,STR_TO_DATE(?,'%Y-%m-%d %H:%i:%s'))";
		} else {
			pk = queryForNextVal("SEQ_LOGIN_LOG_ID");
			sql = " INSERT INTO META_MAG_LOGIN_LOG ( " + " LOG_ID, USER_ID,GROUP_ID, LOGIN_IP, LOGIN_MAC, "
					+ " LOGIN_DATE) VALUES ( " + " ?,?,?,?,? ,TO_DATE(?,'YYYY-MM-DD HH24:MI:SS'))";
		}
		Map<String, Object> userMap = user.getUserMap();
		Object[] params = { pk, MapUtils.getIntValue(userMap, "userId"), MapUtils.getIntValue(userMap, "groupId"),
				MapUtils.getString(userMap, "loginIp"), MapUtils.getString(userMap, "loginMac"),
				DateUtil.format(new Date(user.getLogInTime()), "yyyy-MM-dd HH:mm:ss") };
		getDataAccess().execUpdate(sql, params);
		return pk;
	}

	/**
	 * session失效或者注销时记录日志
	 * 
	 * @throws Exception
	 */
	public void updateLoginOutTime(long logId) {
		String sql = "UPDATE META_MAG_LOGIN_LOG SET LOGOFF_DATE=TO_DATE(?,'YYYY-MM-DD HH24:MI:SS') WHERE LOG_ID=?";
		if (isMysql()) {
			sql = "UPDATE META_MAG_LOGIN_LOG SET LOGOFF_DATE=STR_TO_DATE(?,'%Y-%m-%d %H:%i:%s') WHERE LOG_ID=?";
		}
		getDataAccess().execUpdate(sql, DateUtil.format(new Date(System.currentTimeMillis()), "yyyy-MM-dd HH:mm:ss"),
				logId);
	}

	/**
	 * 
	 * @description 访问排名
	 * @param queryData
	 *            查询时的过滤参数
	 * @param hideStations
	 *            需要隐藏不需要统计的岗位集
	 * @param page
	 *            分页参数
	 * @return
	 */
	public List<Map<String, Object>> queryLoginLog(Map<String, Object> queryData, String hideStations, Page page) {
		boolean adminFlag = false;
		if ("true".equals(Convert.toString(queryData.get("adminFlag")))) {
			adminFlag = true;
		}
		StringBuffer sql = new StringBuffer(
				"SELECT COUNT(*) COUNT, U.USER_ID, NVL(U.USER_EMAIL,'') USER_EMAIL, NVL(U.USER_NAMECN,'') USER_NAMECN, NVL(Z.ZONE_NAME,'') ZONE_NAME, "
						+ "NVL(D.DEPT_NAME,'') DEPT_NAME, NVL(S.STATION_NAME,'') STATION_NAME "
						+ "FROM META_MAG_LOGIN_LOG L "
						+ "LEFT JOIN META_MAG_USER U ON L.USER_ID = U.USER_ID "
						+ "LEFT JOIN META_DIM_ZONE Z ON U.ZONE_ID = Z.ZONE_ID "
						+ "LEFT JOIN META_DIM_USER_DEPT D ON U.DEPT_ID = D.DEPT_CODE "
						+ "LEFT JOIN META_DIM_USER_STATION S ON U.STATION_ID = S.STATION_CODE "
						+ "WHERE 1=1 AND U.USER_ID IS NOT NULL ");

		if (hideStations != null && !hideStations.equals("")) {
			sql.append(" AND U.STATION_ID NOT IN (");
			String[] stations = hideStations.contains(",") ? hideStations.split(",") : new String[] { hideStations };
			for (int i = 0; i < stations.length; i++) {
				sql.append(i == stations.length - 1 ? stations[i] : (stations[i] + ","));
			}
			sql.append(") ");
		}

		if (hideStations != null && !hideStations.equals("")) {
			sql.append(" AND U.STATION_ID NOT IN (");
			String[] stations = hideStations.contains(",") ? hideStations.split(",") : new String[] { hideStations };
			for (int i = 0; i < stations.length; i++) {
				sql.append(i == stations.length - 1 ? stations[i] : (stations[i] + ","));
			}
			sql.append(") ");
		}

		// 参数处理
		List<Object> params = new ArrayList<Object>();
		if (queryData != null) {

			if (queryData.get("startDate") != null) {
				try {
					Date startDate = new Date();
					startDate.setTime(Long.parseLong(queryData.get("startDate").toString()));
					startDate.setHours(0);
					startDate.setMinutes(0);
					startDate.setSeconds(0);
					sql.append("AND L.LOGIN_DATE >= TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
					params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(startDate));
				} catch (NumberFormatException e) {
				}
			}
			if (queryData.get("endDate") != null) {
				try {
					Date endDate = new Date();
					endDate.setTime(Long.parseLong(queryData.get("endDate").toString()));
					endDate.setDate(endDate.getDate() + 1);
					endDate.setHours(0);
					endDate.setMinutes(0);
					endDate.setSeconds(0);
					sql.append("AND L.LOGIN_DATE < TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
					params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(endDate));
				} catch (NumberFormatException e) {
				}
			}
			if (queryData.get("stationId") != null) {
				sql.append("AND (S.STATION_ID=? OR STATION_PAR_ID=?) ");
				params.add(queryData.get("stationId"));
				params.add(queryData.get("stationId"));
			}
			if (queryData.get("deptId") != null) {
				sql.append("AND (D.DEPT_ID = ? OR D.DEPT_PAR_ID = ?) ");
				params.add(queryData.get("deptId"));
				params.add(queryData.get("deptId"));
			}
			if (queryData.get("zoneId") != null) {
				if (!queryData.get("zoneId").toString().equals("0") && !queryData.get("zoneId").toString().equals("1")) {
					sql.append("AND (Z.ZONE_ID=? OR ZONE_PAR_ID=?) ");
					params.add(queryData.get("zoneId"));
					params.add(queryData.get("zoneId"));
				}
			}
			if (!Convert.toString(queryData.get("groupId")).equals("") &&
					!Convert.toString(queryData.get("groupId")).equalsIgnoreCase("null")) {
				sql.append(" AND L.GROUP_ID=? ");
				params.add(Integer.parseInt(queryData.get("groupId").toString()));
			}
			if (!adminFlag) {
				sql.append(" AND U.ADMIN_FLAG = 0 ");
			}

		}

		sql.append(" GROUP BY U.USER_ID, U.USER_EMAIL, U.USER_NAMECN, Z.ZONE_NAME, "
				+ "D.DEPT_NAME, S.STATION_NAME ORDER BY COUNT DESC,U.USER_ID ");

		assert (page != null);
		return getDataAccess().queryForList(SqlUtils.wrapPagingSql(getDataAccess(), sql.toString(), page),
				params.toArray());
	}

	/**
	 * 
	 * @description 查询某一用户详细访问信息
	 * @param queryData
	 *            查询时的过滤参数
	 * @param page
	 *            分页参数，为空表示不分页
	 * @return
	 */
	public List<Map<String, Object>> queryLoginLogByID(Map<?, ?> queryData, String hideStations, Page page) {
		boolean adminFlag = false;
		if ("true".equals(Convert.toString(queryData.get("adminFlag")))) {
			adminFlag = true;
		}
		StringBuffer sql = new StringBuffer(
				"SELECT L.LOG_ID, U.USER_EMAIL, U.USER_NAMECN, L.LOGIN_IP, L.LOGIN_MAC LOG_IN_MAC, "
						+ "TO_CHAR(L.LOGIN_DATE,'yyyy-MM-dd hh24:mi:ss') LOG_IN_DATE, "
						+ "TO_CHAR(L.LOGOFF_DATE,'yyyy-MM-dd hh24:mi:ss') LOG_OFF_DATE, " + "G.GROUP_NAME "
						+ "FROM META_MAG_LOGIN_LOG L " + "LEFT JOIN META_MAG_USER U ON L.USER_ID=U.USER_ID "
						+ "LEFT JOIN META_MENU_GROUP G ON L.GROUP_ID=G.GROUP_ID " + "WHERE 1=1 ");

		// 参数处理
		List<Object> params = new ArrayList<Object>();
		if (queryData != null) {
			Long userId = (Long) queryData.get("userId");
			String userEmail = (String) queryData.get("userEmail");
			// Long belongSys = (Long) queryData.get("belongSys");

			assert (userId != null);
			sql.append("AND L.USER_ID = ? ");
			params.add(userId.intValue());

			if (userEmail != null && !userEmail.equals("")) {
				sql.append("AND U.USER_EMAIL LIKE  " + SqlUtils.allLikeParam(userEmail));
				// params.add("%" + userEmail + "%");
			}
			// if (belongSys == null)
			// belongSys = 1L;// 默认为大数据平台管理系统
			// sql.append("AND G.GROUP_ID = ? ");
			// params.add(belongSys.intValue());

			// 默认情况：没有传入isAdminTran参数，或者解析结果为假，则应过滤掉admin的访问记录

			if (queryData.get("startDate") != null) {
				try {
					Date startDate = new Date();
					startDate.setTime(Long.parseLong(queryData.get("startDate").toString()));
					startDate.setHours(0);
					startDate.setMinutes(0);
					startDate.setSeconds(0);
					sql.append("AND L.LOGIN_DATE >= TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
					params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(startDate));
				} catch (NumberFormatException e) {
					// e.printStackTrace();
				}
			}
			if (queryData.get("endDate") != null) {
				try {
					Date endDate = new Date();
					endDate.setTime(Long.parseLong(queryData.get("endDate").toString()));
					endDate.setDate(endDate.getDate() + 1);
					endDate.setHours(0);
					endDate.setMinutes(0);
					endDate.setSeconds(0);
					sql.append("AND L.LOGIN_DATE < TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
					params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(endDate));
				} catch (NumberFormatException e) {
					// e.printStackTrace();
				}
			}
			if (!Convert.toString(queryData.get("groupId")).equals("") &&
					!Convert.toString(queryData.get("groupId")).equalsIgnoreCase("null")) {
				sql.append(" AND L.GROUP_ID=? ");
				params.add(Integer.parseInt(queryData.get("groupId").toString()));
			}
			if (!adminFlag) {
				sql.append(" AND U.ADMIN_FLAG = 0 ");
			}
		}

		sql.append("ORDER BY L.LOG_ID DESC ");

		assert (page != null);
		return getDataAccess().queryForList(SqlUtils.wrapPagingSql(getDataAccess(), sql.toString(), page),
				params.toArray());
	}

	/**
	 * 获取用户访问报表
	 * 
	 * @param queryData
	 *            查询条件
	 * @param hideStations
	 *            隐藏岗位
	 * @return 查询结果
	 */
	public List<Map<String, Object>> queryLoginReport(Map<?, ?> queryData, String hideStations) {
		boolean adminFlag = false;
		if ("true".equals(Convert.toString(queryData.get("adminFlag")))) {
			adminFlag = true;
		}
		// 参数处理
		List<Object> params = new ArrayList<Object>();
		StringBuffer sql = new StringBuffer("SELECT A.ZONE_ID,B.ZONE_NAME,SUM(A.LOGIN_COUNT) SUM FROM ( "
				+ "SELECT Z.ZONE_ID, USER_VISIT.LOGIN_COUNT LOGIN_COUNT "
				+ "FROM META_DIM_ZONE Z,(SELECT COUNT(*) LOGIN_COUNT, "
				+ "Z.ZONE_ID ZONE_ID,Z.ZONE_PAR_ID FROM META_MAG_LOGIN_LOG L "
				+ "LEFT JOIN META_MAG_USER U ON L.USER_ID=U.USER_ID "
				+ "LEFT JOIN META_DIM_ZONE Z ON U.ZONE_ID=Z.ZONE_ID WHERE 1=1 ");
		if (queryData != null) {
			if (queryData.get("startDate") != null) {
				try {
					Date startDate = new Date();
					startDate.setTime(Long.parseLong(queryData.get("startDate").toString()));
					startDate.setHours(0);
					startDate.setMinutes(0);
					startDate.setSeconds(0);
					sql.append("AND L.LOGIN_DATE >= TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
					params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(startDate));
				} catch (NumberFormatException e) {
				}
			}
			if (queryData.get("endDate") != null) {
				try {
					Date endDate = new Date();
					endDate.setTime(Long.parseLong(queryData.get("endDate").toString()));
					endDate.setDate(endDate.getDate() + 1);
					endDate.setHours(0);
					endDate.setMinutes(0);
					endDate.setSeconds(0);
					sql.append("AND L.LOGIN_DATE < TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
					params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(endDate));
				} catch (NumberFormatException e) {
				}
			}
		}
		if (hideStations != null && !hideStations.equals("")) {
			sql.append(" AND U.STATION_ID NOT IN (");
			String[] stations = hideStations.contains(",") ? hideStations.split(",") : new String[] { hideStations };
			for (int i = 0; i < stations.length; i++) {
				sql.append(i == stations.length - 1 ? stations[i] : (stations[i] + ","));
			}
			sql.append(") ");
		}
		if (queryData != null && !Convert.toString(queryData.get("groupId")).equals("") &&
				!Convert.toString(queryData.get("groupId")).equalsIgnoreCase("null")) {
			sql.append(" AND L.GROUP_ID=? ");
			params.add(Integer.parseInt(queryData.get("groupId").toString()));
		}
		if (!adminFlag) {
			sql.append(" AND U.ADMIN_FLAG = 0 ");
		}
		sql.append("GROUP BY Z.ZONE_ID,Z.ZONE_PAR_ID) USER_VISIT " + "WHERE Z.ZONE_ID = USER_VISIT.ZONE_ID AND "
				+ "(USER_VISIT.ZONE_PAR_ID=0 OR USER_VISIT.ZONE_PAR_ID=1) "
				+ "UNION ALL SELECT USER_VISIT.ZONE_PAR_ID ZONE_ID , "
				+ "USER_VISIT.LOGIN_COUNT LOGIN_COUNT FROM META_DIM_ZONE Z, "
				+ "(SELECT COUNT(*) LOGIN_COUNT, Z.ZONE_ID ZONE_ID,Z.ZONE_PAR_ID "
				+ "FROM META_MAG_LOGIN_LOG L LEFT JOIN META_MAG_USER U "
				+ "ON L.USER_ID=U.USER_ID LEFT JOIN META_DIM_ZONE Z " + "ON U.ZONE_ID=Z.ZONE_ID WHERE 1=1");
		if (queryData != null) {
			if (queryData.get("startDate") != null) {
				try {
					Date startDate = new Date();
					startDate.setTime(Long.parseLong(queryData.get("startDate").toString()));
					startDate.setHours(0);
					startDate.setMinutes(0);
					startDate.setSeconds(0);
					sql.append("AND L.Login_Date >= TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
					params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(startDate));
				} catch (NumberFormatException e) {
				}
			}
			if (queryData.get("endDate") != null) {
				try {
					Date endDate = new Date();
					endDate.setTime(Long.parseLong(queryData.get("endDate").toString()));
					endDate.setDate(endDate.getDate() + 1);
					endDate.setHours(0);
					endDate.setMinutes(0);
					endDate.setSeconds(0);
					sql.append("AND L.Login_Date < TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
					params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(endDate));
				} catch (NumberFormatException e) {
				}
			}
		}
		if (hideStations != null && !hideStations.equals("")) {
			sql.append(" AND U.STATION_ID NOT IN (");
			String[] stations = hideStations.contains(",") ? hideStations.split(",") : new String[] { hideStations };
			for (int i = 0; i < stations.length; i++) {
				sql.append(i == stations.length - 1 ? stations[i] : (stations[i] + ","));
			}
			sql.append(") ");
		}
		if (queryData != null && !Convert.toString(queryData.get("groupId")).equals("") &&
				!Convert.toString(queryData.get("groupId")).equalsIgnoreCase("null")) {
			sql.append(" AND L.GROUP_ID=? ");
			params.add(Integer.parseInt(queryData.get("groupId").toString()));
		}
		if (!adminFlag) {
			sql.append(" AND U.ADMIN_FLAG = 0 ");
		}
		sql.append("AND Z.ZONE_PAR_ID<>0 AND Z.ZONE_PAR_ID<>1 " + "GROUP BY Z.ZONE_ID,Z.ZONE_PAR_ID) USER_VISIT "
				+ "WHERE Z.ZONE_ID = USER_VISIT.ZONE_ID ) A " + "LEFT JOIN META_DIM_ZONE B ON A.ZONE_ID=B.ZONE_ID "
				+ "GROUP BY A.ZONE_ID,B.ZONE_NAME ORDER BY A.ZONE_ID");
		return getDataAccess().queryForList(sql.toString(), params.toArray());
	}

	/**
	 * 获取指定菜单ID 的列表
	 * 
	 * @param str
	 *            菜单ID字符串 格式为：“10，11,12,13”
	 * @return 查询结果
	 */
	public List<Map<String, Object>> getMenuName(String str) {
		StringBuffer sql = new StringBuffer("SELECT MENU_NAME FROM META_MAG_MENU T WHERE T.MENU_ID IN (" + str + ") ");
		sql.append("ORDER BY T.MENU_ID ");
		return getDataAccess().queryForList(sql.toString());
	}

	/**
	 * 条件查询菜单访问统计
	 * 
	 * @param queryData
	 *            查询条件
	 * @param hideStations
	 *            隐藏岗位
	 * @param --menuId 菜单ID
	 * @return 查询结果
	 */
	public List<Map<String, Object>> queryMenuReport(Map<?, ?> queryData, String hideStations,
			List<Map<String, Object>> listMenuId) {
		boolean adminFlag = false;
		if ("true".equals(Convert.toString(queryData.get("adminFlag")))) {
			adminFlag = true;
		}

		// 参数处理
		List<Object> params = new ArrayList<Object>();
		StringBuffer Sql = new StringBuffer("SELECT A.ZONE_ID, SUM(A.MENUVISITCOUNT) MENUVISITCOUNT FROM ( "
				+ "SELECT Z.ZONE_ID, MENU_VISIT.MENU_VISIT_COUNT MENUVISITCOUNT "
				+ "FROM META_DIM_ZONE Z,(SELECT COUNT(*) MENU_VISIT_COUNT, Z.ZONE_ID ZONE_ID,Z.ZONE_PAR_ID "
				+ "FROM META_MAG_MENU_VISIT_LOG L LEFT JOIN META_MAG_USER U ON L.USER_ID=U.USER_ID "
				+ "LEFT JOIN META_DIM_ZONE Z ON U.ZONE_ID=Z.ZONE_ID WHERE 1=1 ");
		if (listMenuId != null) {
			Sql.append("AND L.MENU_ID IN ( ");
			for (int i = 0; i < listMenuId.size(); i++) {
				Sql.append(listMenuId.get(i).get("MENU_ID"));
				if (i != listMenuId.size() - 1) {
					Sql.append(",");
				}
			}
			Sql.append(")");
		}
		if (queryData != null) {
			if (queryData.get("startDate") != null) {
				try {
					Date startDate = new Date();
					startDate.setTime(Long.parseLong(queryData.get("startDate").toString()));
					startDate.setHours(0);
					startDate.setMinutes(0);
					startDate.setSeconds(0);
					Sql.append("AND L.VISIT_TIME >= TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
					params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(startDate));
				} catch (NumberFormatException e) {
				}
			}
			if (queryData.get("endDate") != null) {
				try {
					Date endDate = new Date();
					endDate.setTime(Long.parseLong(queryData.get("endDate").toString()));
					endDate.setDate(endDate.getDate() + 1);
					endDate.setHours(0);
					endDate.setMinutes(0);
					endDate.setSeconds(0);
					Sql.append("AND L.VISIT_TIME < TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
					params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(endDate));
				} catch (NumberFormatException e) {
				}
			}
		}
		if (hideStations != null && !hideStations.equals("")) {
			Sql.append(" AND U.STATION_ID NOT IN (");
			String[] stations = hideStations.contains(",") ? hideStations.split(",") : new String[] { hideStations };
			for (int i = 0; i < stations.length; i++) {
				Sql.append(i == stations.length - 1 ? stations[i] : (stations[i] + ","));
			}
			Sql.append(") ");
		}
		if (!adminFlag) {
			Sql.append(" AND U.ADMIN_FLAG = 0 ");
		}
		Sql.append("GROUP BY Z.ZONE_ID,Z.ZONE_PAR_ID) MENU_VISIT "
				+ "WHERE Z.ZONE_ID = MENU_VISIT.ZONE_ID AND (MENU_VISIT.ZONE_PAR_ID=0 OR MENU_VISIT.ZONE_PAR_ID=1) "
				+ "UNION ALL SELECT MENU_VISIT.ZONE_PAR_ID ZONE_ID , MENU_VISIT.MENU_VISIT_COUNT MENUVISITCOUNT "
				+ "FROM META_DIM_ZONE Z,(SELECT COUNT(*) MENU_VISIT_COUNT, Z.ZONE_ID ZONE_ID,Z.ZONE_PAR_ID "
				+ "FROM META_MAG_MENU_VISIT_LOG L LEFT JOIN META_MAG_USER U "
				+ "ON L.USER_ID=U.USER_ID LEFT JOIN META_DIM_ZONE Z ON U.ZONE_ID=Z.ZONE_ID WHERE 1=1 ");
		if (listMenuId != null) {
			Sql.append("AND L.MENU_ID IN ( ");
			for (int i = 0; i < listMenuId.size(); i++) {
				Sql.append(listMenuId.get(i).get("MENU_ID"));
				if (i != listMenuId.size() - 1) {
					Sql.append(",");
				}
			}
			Sql.append(")");
		}
		if (queryData != null) {

			if (queryData.get("startDate") != null) {
				try {
					Date startDate = new Date();
					startDate.setTime(Long.parseLong(queryData.get("startDate").toString()));
					startDate.setHours(0);
					startDate.setMinutes(0);
					startDate.setSeconds(0);
					Sql.append("AND L.VISIT_TIME >= TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
					params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(startDate));
				} catch (NumberFormatException e) {
				}
			}
			if (queryData.get("endDate") != null) {
				try {
					Date endDate = new Date();
					endDate.setTime(Long.parseLong(queryData.get("endDate").toString()));
					endDate.setDate(endDate.getDate() + 1);
					endDate.setHours(0);
					endDate.setMinutes(0);
					endDate.setSeconds(0);
					Sql.append("AND L.VISIT_TIME < TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
					params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(endDate));
				} catch (NumberFormatException e) {
				}
			}
		}
		if (hideStations != null && !hideStations.equals("")) {
			Sql.append(" AND U.STATION_ID NOT IN (");
			String[] stations = hideStations.contains(",") ? hideStations.split(",") : new String[] { hideStations };
			for (int i = 0; i < stations.length; i++) {
				Sql.append(i == stations.length - 1 ? stations[i] : (stations[i] + ","));
			}
			Sql.append(") ");
		}
		if (!adminFlag) {
			Sql.append(" AND U.ADMIN_FLAG = 0 ");
		}
		Sql.append("AND Z.ZONE_PAR_ID<>0 AND Z.ZONE_PAR_ID<>1 " + "GROUP BY Z.ZONE_ID,Z.ZONE_PAR_ID) MENU_VISIT "
				+ "WHERE Z.ZONE_ID = MENU_VISIT.ZONE_ID) A GROUP BY A.ZONE_ID");
		return getDataAccess().queryForList(Sql.toString(), params.toArray());
	}

	public List<Map<String, Object>> queryMenuList(String menuId) {
		StringBuffer sql = new StringBuffer("SELECT  T.MENU_ID " + "FROM META_MAG_MENU T START WITH T.PARENT_ID = ? "
				+ "CONNECT BY PRIOR T.MENU_ID = T.PARENT_ID ");
		// 参数处理
		List<Object> params = new ArrayList<Object>();
		params.add(menuId);
		return getDataAccess().queryForList(sql.toString(), params.toArray());
	}
}
