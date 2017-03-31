package com.ery.meta.module.mag.login;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.MetaBaseDAO;

/**

 * 

 * @description
 * @date: 12-2-16
 * @time: 下午3:28
 */

public class LoginReportDAO extends MetaBaseDAO {
	/**
	 * 初始化页面查询
	 * 
	 * @param queryData
	 * @return
	 */
	public List<Map<String, Object>> queryZone(Map<?, ?> queryData, String menuName) {
		String[] menuId = menuName.split(",");
		String select = "SELECT MIN(T.ZONE_ID) ZONE_ID,'四川省' ZONE_NAME,MIN(T.ZONE_PAR_ID) ZONE_PAR_ID,SUM(T.LOGIN_NUM) LOGIN_NUM, "
				+ "1 CHILDREN ";
		for (int i = 0; i < menuId.length; i++) {
			select += ",SUM(T.VISIT_NUM" + menuId[i] + ") VISIT_NUM" + menuId[i] + " ";
		}
		select += "FROM TB_B_DATA_VISIT1 T WHERE VISIT_DATE >=? AND VISIT_DATE <=? AND ZONE_PAR_ID <>1 ";
		// String select =
		// "SELECT A.ZONE_ID,MAX(A.ZONE_PAR_ID) ZONE_PAR_ID,MAX(ZONE_NAME) ZONE_NAME, "
		// +
		// "SUM(CASE WHEN B.CNT IS NULL OR B.CNT=0 THEN A.LOGIN_NUM ELSE B.LOGIN_NUM END ) LOGIN_NUM ";
		// for(int i=0; i<menuId.length; i++){
		// select +=
		// ",SUM(CASE WHEN B.CNT IS NULL OR B.CNT=0 THEN A.VISIT_NUM"+menuId[i]+" ELSE B.VISIT_NUM"+menuId[i]+" END ) VISIT_NUM"+menuId[i]+" ";
		// }
		// select +=
		// ",DECODE(NVL(SUM(B.CNT),0),0,0,1) CHILDREN FROM  TB_B_DATA_VISIT ";
		// select +=
		// "A LEFT JOIN (SELECT ZONE_PAR_ID,VISIT_DATE,SUM(T.LOGIN_NUM) LOGIN_NUM,COUNT(*) CNT ";
		// for(int i=0; i<menuId.length; i++){
		// select += ",SUM(T.VISIT_NUM"+menuId[i]+") VISIT_NUM"+menuId[i]+" ";
		// }
		// select +=
		// "FROM TB_B_DATA_VISIT T WHERE  VISIT_DATE >= ? AND VISIT_DATE <= ? "
		// +
		// "GROUP BY ZONE_PAR_ID,VISIT_DATE) B ON A.ZONE_ID=B.ZONE_PAR_ID AND A.VISIT_DATE=B.VISIT_DATE "
		// +
		// "WHERE A.ZONE_PAR_ID=0  AND A.VISIT_DATE >= ? " +
		// "AND A.VISIT_DATE <= ? GROUP BY A.ZONE_ID ";
		// for(int i=0;i<menuId.length; i++){
		// select += ",SUM(T.VISIT_NUM"+menuId[i]+") VISIT_NUM"+menuId[i]+" ";
		// }
		List proParams = new ArrayList();
		// select +=
		// "FROM TB_B_DATA_VISIT T WHERE T.VISIT_DATE>=? AND T.VISIT_DATE<=? " +
		// "GROUP BY T.ZONE_ID ORDER BY T.ZONE_ID) ";
		Date startDate = new Date();
		Date endDate = new Date();

		startDate.setTime(Long.parseLong(queryData.get("startDate").toString()));
		endDate.setTime(Long.parseLong(queryData.get("endDate").toString()));
		proParams.add(new SimpleDateFormat("yyyyMMdd").format(startDate));
		proParams.add(new SimpleDateFormat("yyyyMMdd").format(endDate));
		// proParams.add(SessionManager.getCurrentSession().getAttribute("startDate"));
		// proParams.add(SessionManager.getCurrentSession().getAttribute("endDate"));
		// select += "A LEFT JOIN " +
		// "(SELECT ZONE_PAR_ID, COUNT(1) CNT FROM TB_B_DATA_VISIT GROUP BY ZONE_PAR_ID) C "
		// +
		// "ON A.ZONE_ID=C.ZONE_PAR_ID WHERE 1=1 ";
		//
		// if(queryData != null){
		// Object zoneName = queryData.get("zoneName");
		// Object parZoneName = queryData.get("parZoneName");
		// if(zoneName!=null && !zoneName.toString().trim().equals("")){
		// if(parZoneName != null && !parZoneName.toString().trim().equals("")){
		// select += "AND A.ZONE_PAR_ID NOT IN " +
		// "(SELECT D.ZONE_ID FROM TB_B_DATA_VISIT D WHERE D.ZONE_NAME LIKE ?) ";
		// proParams.add("%"+parZoneName+"%");
		// select += "AND A.ZONE_NAME LIKE ? " +
		// "CONNECT BY A.ZONE_PAR_ID = PRIOR A.ZONE_ID START WITH A.ZONE_ID IN( "
		// +
		// "SELECT B.ZONE_ID FROM TB_B_DATA_VISIT B WHERE B.ZONE_NAME LIKE ? " +
		// "CONNECT BY ZONE_PAR_ID = PRIOR ZONE_ID START WITH ZONE_PAR_ID=0) ";
		// proParams.add("%"+zoneName+"%");
		// proParams.add("%"+parZoneName+"%");
		// }else{
		// select += "AND A.ZONE_NAME LIKE ? ";
		// proParams.add("%"+zoneName+"%");
		// select += "AND A.ZONE_PAR_ID NOT IN " +
		// "(SELECT D.ZONE_ID FROM TB_B_DATA_VISIT D WHERE D.ZONE_NAME LIKE ?) ";
		// proParams.add("%"+zoneName+"%");
		// }
		// }else{
		// if(parZoneName != null && !parZoneName.toString().trim().equals("")){
		// select += "AND A.ZONE_NAME LIKE ? ";
		// proParams.add("%"+parZoneName+"%");
		// select += "AND A.ZONE_PAR_ID NOT IN " +
		// "(SELECT D.ZONE_ID FROM TB_B_DATA_VISIT D WHERE D.ZONE_NAME LIKE ?) ";
		// proParams.add("%"+parZoneName+"%");
		// }else{
		// select += "AND A.ZONE_PAR_ID=0 ";
		// }
		// }
		// }else{
		// select += "AND A.ZONE_PAR_ID=0 ";
		// }
		select += " ORDER BY CHILDREN DESC";
		return getDataAccess().queryForList(select, proParams.toArray());
	}

	/**
	 * 查询子地域
	 * 
	 * @param parentId
	 * @return
	 */
	public List<Map<String, Object>> querySubZone(int parentId, String menuName, Map<String, Object> queryDate) {
		String[] menuId = menuName.split(",");
		String select = "SELECT A.ZONE_ID,MAX(A.ZONE_PAR_ID) ZONE_PAR_ID,MAX(ZONE_NAME) ZONE_NAME, "
				+ "SUM(CASE WHEN B.CNT IS NULL OR B.CNT=0 THEN A.LOGIN_NUM ELSE B.LOGIN_NUM END ) LOGIN_NUM ";
		for (int i = 0; i < menuId.length; i++) {
			select += ",SUM(CASE WHEN B.CNT IS NULL OR B.CNT=0 THEN A.VISIT_NUM" + menuId[i] + " ELSE B.VISIT_NUM"
					+ menuId[i] + " END ) VISIT_NUM" + menuId[i] + " ";
		}
		select += ",DECODE(NVL(SUM(B.CNT),0),0,0,1) CHILDREN FROM  TB_B_DATA_VISIT1 ";
		select += "A LEFT JOIN (SELECT ZONE_PAR_ID,VISIT_DATE,SUM(T.LOGIN_NUM) LOGIN_NUM,COUNT(*) CNT ";
		for (int i = 0; i < menuId.length; i++) {
			select += ",SUM(T.VISIT_NUM" + menuId[i] + ") VISIT_NUM" + menuId[i] + " ";
		}
		select += "FROM TB_B_DATA_VISIT1 T WHERE  VISIT_DATE >= ? AND VISIT_DATE <= ? "
				+ "GROUP BY ZONE_PAR_ID,VISIT_DATE) B ON A.ZONE_ID=B.ZONE_PAR_ID AND A.VISIT_DATE=B.VISIT_DATE "
				+ "WHERE A.ZONE_PAR_ID=?  AND A.VISIT_DATE >= ? "
				+ "AND A.VISIT_DATE <= ? GROUP BY A.ZONE_ID order BY LOGIN_NUM DESC ";
		// String select = "SELECT NVL(TAB1.ZONE_ID,TAB2.ZONE_ID) ZONE_ID, " +
		// "NVL(TAB1.ZONE_PAR_ID,TAB2.ZONE_PAR_ID) ZONE_PAR_ID, " +
		// "NVL(TAB1.ZONE_NAME,TAB2.ZONE_NAME) ZONE_NAME,TAB1.CHILDREN,NVL(TAB1.LOGIN_NUM,0) LOGIN_NUM ";
		// for(int i=0;i<menuId.length; i++){
		// select +=
		// ",NVL(TAB1.VISIT_NUM"+menuId[i]+",0) VISIT_NUM"+menuId[i]+" ";
		// }
		// select +=
		// "FROM ( SELECT A.*, DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM ";
		// select +=
		// "(SELECT T.ZONE_ID,MAX(T.ZONE_PAR_ID) ZONE_PAR_ID,MAX(T.ZONE_NAME) ZONE_NAME, SUM(T.LOGIN_NUM) LOGIN_NUM ";
		// for(int i=0;i<menuId.length; i++){
		// select += ",SUM(T.VISIT_NUM"+menuId[i]+") VISIT_NUM"+menuId[i]+" ";
		// }
		// select +=
		// "FROM TB_B_DATA_VISIT T WHERE T.VISIT_DATE>=? AND T.VISIT_DATE<=? " +
		// "GROUP BY T.ZONE_ID ORDER BY T.ZONE_ID) ";
		// select += "A LEFT JOIN " +
		// "(SELECT ZONE_PAR_ID, COUNT(1) CNT FROM META_DIM_ZONE GROUP BY ZONE_PAR_ID) C "
		// +
		// "ON A.ZONE_ID=C.ZONE_PAR_ID WHERE A.ZONE_PAR_ID=? ORDER BY CHILDREN DESC ) "
		// +
		// "TAB1,META_DIM_ZONE TAB2 WHERE TAB1.ZONE_ID(+)=TAB2.ZONE_ID " +
		// " AND TAB2.ZONE_PAR_ID = ? ";
		Date startDate = new Date();
		Date endDate = new Date();

		startDate.setTime(Long.parseLong(queryDate.get("startDate").toString()));
		endDate.setTime(Long.parseLong(queryDate.get("endDate").toString()));
		DateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");
		Object[] proParams = { dateFormat.format(startDate), dateFormat.format(endDate), parentId,
				dateFormat.format(startDate), dateFormat.format(endDate) };
		// Object[] proParams =
		// {"20120201","20120228",parentId,"20120201","20120228"};
		return getDataAccess().queryForList(select, proParams);
	}

	/**
	 * 获取指定菜单ID 的列表
	 * 
	 * @param str 菜单ID字符串 格式为：“10，11,12,13”
	 * @return 查询结果
	 */
	public List<Map<String, Object>> getMenuName(String str) {
		StringBuffer sql = new StringBuffer("SELECT MENU_ID,MENU_NAME FROM META_MAG_MENU T WHERE T.MENU_ID IN (" + str
				+ ") ");
		sql.append("ORDER BY T.MENU_ID ");
		return getDataAccess().queryForList(sql.toString());
	}

	/**
	 * 判断默认用户下该表是否存在
	 * 
	 * @param tableName 表名
	 * @return
	 */
	public String isExistTable(String tableName) {
		String sql = "SELECT 'DROP TABLE '||OWNER||'.'||TABLE_NAME FROM ALL_TABLES WHERE TABLE_NAME =? ";
		Object[] params = { tableName };
		return getDataAccess().queryForString(sql, params);
	}

	/**
	 * 执行建表SQL
	 * 
	 * @param sql 建表sql
	 * @return 建表结果
	 */
	public boolean createTable(String sql) {
		return getDataAccess().execNoQuerySql(sql);
	}

	/**
	 * 返回某一天的执行所有地域的登陆次数
	 * 
	 * @param dayTime 时间，格式为“YYYYMMDD”
	 * @param hideStation 过滤隐藏地域
	 * @return 结果
	 */
	public List<Map<String, Object>> queryLogNumForDay(String dayTime, String hideStation) {
		String sql = "SELECT C.ZONE_ID,MAX(C.ZONE_PAR_ID) ZONE_PAR_ID,MAX(C.ZONE_NAME) ZONE_NAME, "
				+ "SUM(NVL(LOGIN_NUM,0)) LOGIN_NUM," + dayTime + " VISIT_TIME "
				+ "FROM (SELECT T.USER_ID,COUNT(1) LOGIN_NUM FROM META_MAG_LOGIN_LOG T WHERE GROUP_ID=20 "
				+ "AND TO_CHAR(LOGIN_DATE, 'YYYYMMDD') = ? GROUP BY T.USER_ID)  A, "
				+ "(SELECT * FROM META_MAG_USER WHERE STATION_ID<>?)  B, META_DIM_ZONE C "
				+ " WHERE C.ZONE_ID = B.ZONE_ID(+) AND B.USER_ID = A.USER_ID(+) " + "GROUP BY C.ZONE_ID ";
		Object[] params = { dayTime, hideStation };
		return getDataAccess().queryForList(sql, params);
	}

	/**
	 * 按天和菜单查询
	 * 
	 * @param menuId
	 * @param hideStation
	 * @return
	 */
	public List<Map<String, Object>> queryMenuNum(String visitTime, String menuId, String hideStation) {
		StringBuffer sql = new StringBuffer(
				"SELECT A.ZONE_ID,nvl(SUM(VISIT_TIME),0) VISITNUM FROM ( "
						+ "SELECT B.ZONE_ID,A.MENU_ID,COUNT(1) VISIT_TIME FROM META_MAG_MENU_VISIT_LOG A LEFT JOIN META_MAG_USER B "
						+ "ON A.USER_ID=B.USER_ID WHERE 1=1 ");
		List<Object> params = new ArrayList<Object>();
		if (menuId != null && !menuId.trim().equals("")) {
			sql.append("AND A.MENU_ID IN ( SELECT  T.MENU_ID " + "FROM META_MAG_MENU T START WITH T.MENU_ID = ? "
					+ "CONNECT BY PRIOR T.MENU_ID = T.PARENT_ID ");
			sql.append(") ");
			params.add(menuId);
		}
		if (!hideStation.equals("")) {
			sql.append("AND B.STATION_ID<>? ");
			params.add(hideStation);
		}
		if (visitTime != null && !visitTime.equals("")) {
			sql.append("AND TO_CHAR(A.VISIT_TIME,'YYYYMMDD') = ? ");
			params.add(visitTime);
		}
		sql.append("GROUP BY B.ZONE_ID,A.MENU_ID) A GROUP BY A.ZONE_ID ");
		return getDataAccess().queryForList(sql.toString(), params.toArray());
	}

	public void insertLog(List<Map<String, Object>> oneList, String[] menuIds) {
		StringBuffer sql = new StringBuffer("INSERT INTO TB_B_DATA_VISIT1 T ( T.ZONE_ID, T.ZONE_PAR_ID, "
				+ "T.ZONE_NAME, T.VISIT_DATE, T.LOGIN_NUM, ");
		for (int i = 0; i < menuIds.length; i++) {
			sql.append("T.VISIT_ID_" + menuIds[i].toUpperCase() + ",T.VISIT_NUM" + menuIds[i].toUpperCase() + " ");
			if (i != menuIds.length - 1)
				sql.append(",");
		}
		sql.append(") VALUES (?,?,?,?,?,");
		for (int j = 0; j < menuIds.length; j++) {
			sql.append("?,?");
			if (j != menuIds.length - 1)
				sql.append(",");
		}
		sql.append(")");
		Object[][] params = new Object[oneList.size()][5 + menuIds.length * 2];
		for (int i = 0; i < oneList.size(); i++) {
			params[i][0] = oneList.get(i).get("ZONE_ID");
			params[i][1] = oneList.get(i).get("ZONE_PAR_ID");
			params[i][2] = oneList.get(i).get("ZONE_NAME");
			params[i][3] = oneList.get(i).get("VISIT_TIME");
			params[i][4] = oneList.get(i).get("LOGIN_NUM");
			for (int j = 0; j < menuIds.length; j++) {
				params[i][5 + j * 2] = oneList.get(i).get("VISIT_ID_" + menuIds[j]);
				params[i][5 + j * 2 + 1] = oneList.get(i).get("VISIT_NUM" + menuIds[j]);
			}
		}
		getDataAccess().execUpdateBatch(sql.toString(), params);
	}

	/***
	 * 查询一个菜单的所有子菜单，包括自身
	 * 
	 * @param menuId
	 * @return
	 */
	public List<Map<String, Object>> queryMenuList(String menuId) {
		StringBuffer sql = new StringBuffer("SELECT  T.MENU_ID " + "FROM META_MAG_MENU T START WITH T.MENU_ID = ? "
				+ "CONNECT BY PRIOR T.MENU_ID = T.PARENT_ID ");
		// 参数处理
		Object[] params = { menuId };
		return getDataAccess().queryForList(sql.toString(), params);
	}
}
