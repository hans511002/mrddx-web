package com.ery.meta.module.mag.menu;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.ery.base.support.utils.Convert;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.util.SystemSeqService;

public class MenuVisitLogDAO extends MetaBaseDAO {
	/**
	 * 记录菜单访问日志
	 * 
	 * @param logData
	 * @throws Exception
	 */
	public void insert(Map<String, Object> logData) throws Exception {
		String sql = null;
		if ("mysql".equals(getDataAccess().getDatabaseName())) {
			sql = "INSERT INTO META_MAG_MENU_VISIT_LOG(MENU_ID,USER_ID,VISIT_TIME,YEAR_NO,LOG_ID,VISIT_ID) " +
					"VALUES(?,?,NOW(),DATE_FORMAT(NOW(),'%Y'),?," +
					SystemSeqService.getSeqNextValue("META_MAG_MENU_VISIT_LOG.VISIT_ID", "SEQ_VISIT_ID") + ") ";
		} else {
			sql = "INSERT INTO META_MAG_MENU_VISIT_LOG(MENU_ID,USER_ID,VISIT_TIME,YEAR_NO,LOG_ID,VISIT_ID) "
					+ "VALUES(?,?,SYSDATE,TO_CHAR(SYSDATE,'YYYY'),?,SEQ_MAG_MENU_VISIT_LOG_ID.NEXTVAL) ";
		}
		Object[] params = { logData.get("menuId"), logData.get("userId"), logData.get("logId") };
		getDataAccess().execUpdate(sql, params);
	}

	/**
	 * 取得菜单访问排名列表 熊小平
	 * 
	 * @param startTime
	 * @param endTime
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> menuVisitInfo(Date startTime, Date endTime, Integer groupID, String hideStations,
			Page page, boolean adminFlag, Integer zoneId) {
		StringBuffer sql = new StringBuffer("SELECT COUNT(*) COUNT, T.MENU_ID,MENU.MENU_NAME,G.GROUP_NAME "
				+ "FROM META_MAG_MENU_VISIT_LOG T " + "LEFT JOIN META_MAG_MENU MENU ON T.MENU_ID=MENU.MENU_ID "
				+ "LEFT JOIN META_MENU_GROUP G ON MENU.GROUP_ID=G.GROUP_ID "
				+ "LEFT JOIN META_MAG_USER U ON T.USER_ID=U.USER_ID " + "WHERE 1=1 AND MENU.MENU_NAME IS NOT NULL "
				+ "AND G.GROUP_NAME IS NOT NULL ");

		String zoneSql = "";
		zoneSql = "AND U.ZONE_ID IN (SELECT B.ZONE_ID FROM META_DIM_ZONE B   START WITH B.ZONE_PAR_ID in (" + zoneId +
				") CONNECT BY PRIOR B.ZONE_ID = B.ZONE_PAR_ID union SELECT  F.ZONE_ID" +
				"  FROM META_DIM_ZONE F WHERE F.ZONE_ID in (" + zoneId + "))";
		sql.append(zoneSql);

		if (hideStations != null && !hideStations.equals("")) {
			sql.append(" AND U.STATION_ID NOT IN (");
			String[] stations = hideStations.contains(",") ? hideStations.split(",") : new String[] { hideStations };
			for (int i = 0; i < stations.length; i++) {
				sql.append(i == stations.length - 1 ? stations[i] : (stations[i] + ","));
			}
			sql.append(") ");
		}
		List<Object> params = new ArrayList<Object>();
		if (startTime != null) {
			sql.append("AND T.VISIT_TIME >= TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ");
			params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(startTime));
		}
		if (endTime != null) {
			endTime.setTime(endTime.getTime() + 24 * 60 * 60 * 1000);
			sql.append("AND T.VISIT_TIME <= TO_DATE(?,'yyyy-MM-dd hh24:mi:ss')  ");
			params.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(endTime));
		}
		if (groupID != null) {
			sql.append("AND MENU.GROUP_ID = ? ");
			params.add(groupID);
		}
		if (!adminFlag) {
			sql.append(" AND U.ADMIN_FLAG = 0 ");
		}

		sql.append("GROUP BY T.MENU_ID,MENU.MENU_NAME,G.GROUP_NAME ORDER BY COUNT DESC, T.MENU_ID,G.GROUP_NAME ");

		List<Map<String, Object>> result = getDataAccess().queryForList(
				SqlUtils.wrapPagingSql(getDataAccess(), sql.toString(), page), params.toArray());

		// 将菜单名称改为全路径，不包括所属用户组
		for (Map<String, Object> map : result) {
			String menuName = getMenuText((Integer.parseInt(Convert.toString(map.get("MENU_ID")))), false);
			map.remove("MENU_NAME");
			map.put("MENU_NAME", menuName);
		}

		return result;

	}

	/**
	 * 按menuId查寻startTime与endTime之间的详细访问记录
	 * 
	 * 
	 * @param menuId
	 * @param startTime
	 * @param endTime
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryMenuVisitDetailInfoById(Integer menuId, Date startTime, Date endTime,
			Integer groupID, String hideStations, Page page, boolean adminFlag, Integer zoneId) {

		StringBuffer sql = new StringBuffer(
				"SELECT M.MENU_ID,L.VISIT_ID,U.USER_EMAIL,U.USER_NAMECN,TO_CHAR(L.VISIT_TIME,'yyyy-MM-dd hh24:mi:ss') VISIT_TIME,M.MENU_NAME "
						+ "FROM META_MAG_MENU_VISIT_LOG L "
						+ "LEFT JOIN META_MAG_MENU M ON L.MENU_ID=M.MENU_ID "
						+ "LEFT JOIN META_MAG_USER U ON L.USER_ID=U.USER_ID " + "WHERE 1=1 ");
		String zoneSql = "";
		zoneSql = "AND U.ZONE_ID IN (SELECT B.ZONE_ID FROM META_DIM_ZONE B   START WITH B.ZONE_PAR_ID in (" + zoneId +
				") CONNECT BY PRIOR B.ZONE_ID = B.ZONE_PAR_ID union SELECT  F.ZONE_ID" +
				"  FROM META_DIM_ZONE F WHERE F.ZONE_ID in (" + zoneId + "))";
		sql.append(zoneSql);
		List<Object> params = new ArrayList<Object>();
		if (hideStations != null && !hideStations.equals("")) {
			sql.append(" AND U.STATION_ID NOT IN (");
			String[] stations = hideStations.contains(",") ? hideStations.split(",") : new String[] { hideStations };
			for (int i = 0; i < stations.length; i++) {
				sql.append(i == stations.length - 1 ? stations[i] : (stations[i] + ","));
			}
			sql.append(") ");
		}
		// 参数添加
		assert (menuId != null);
		sql.append("AND L.MENU_ID = ? ");
		params.add(menuId);
		if (startTime != null) {
			sql.append("AND L.VISIT_TIME >= ? ");
			params.add(startTime);
		}
		if (endTime != null) {
			endTime.setTime(endTime.getTime() + 24 * 60 * 60 * 1000);
			sql.append("AND L.VISIT_TIME <= ? ");
			params.add(endTime);
		}
		if (groupID != null) {
			sql.append("AND M.GROUP_ID= ? ");
			params.add(groupID);
		}
		if (!adminFlag) {
			sql.append(" AND U.ADMIN_FLAG = 0 ");
		}

		// 排序
		sql.append("ORDER BY L.VISIT_TIME DESC ");

		// 查询结果
		List<Map<String, Object>> result = getDataAccess().queryForList(
				SqlUtils.wrapPagingSql(getDataAccess(), sql.toString(), page), params.toArray());

		// 将菜单名称改为全路径，包括所属用户组
		for (Map<String, Object> map : result) {
			String menuName = getMenuText((Integer.parseInt(Convert.toString(map.get("MENU_ID")))), true);
			map.remove("MENU_NAME");
			map.put("MENU_NAME", menuName);
		}

		return result;
	}

	/**
	 * 根据menuName取得对应的Menu全路径 isAddGroup : 是否添加group名称
	 * 
	 * @param
	 * @return
	 */
	private String getMenuText(int menuId, boolean isAddGroup) {
		String sql = "SELECT T.MENU_NAME, LEVEL AS L "
				+ "FROM META_MAG_MENU T CONNECT BY MENU_ID = PRIOR PARENT_ID START WITH MENU_ID = ? "
				+ "ORDER BY L DESC";

		String[] menuTexts = getDataAccess().queryForPrimitiveArray(sql, String.class, menuId);
		String groupText = "";
		if (isAddGroup) {
			groupText = this.getMenuGroupText(menuId);
		}
		String rtn = groupText;
		for (String menu : menuTexts) {
			rtn = rtn + "-->" + menu;
		}
		if (!isAddGroup && rtn.length() > 0) {
			rtn = rtn.substring(3, rtn.length());
		}
		return rtn;
	}

	/**
	 * 根据menuName取GroupName
	 * 
	 * @param
	 * @return
	 */
	private String getMenuGroupText(int menuId) {
		String sql = "SELECT GROUP_NAME FROM META_MENU_GROUP A, META_MAG_MENU B WHERE A.GROUP_ID = B.GROUP_ID AND B.MENU_ID = ?";
		return getDataAccess().queryForString(sql, menuId);
	}

}
