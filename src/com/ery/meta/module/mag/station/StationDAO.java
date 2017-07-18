package com.ery.meta.module.mag.station;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;
import com.ery.meta.common.Constant;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.module.mag.user.UserConstant;

/**
 * 
 * 该类是岗位查询DAO类，用于连接数据库操作，供StationAction调用
 * 
 * 
 * @date 2011-9-26 ----------------------
 * @modify 程钰 添加关联用户的DAO,修改初始化条件
 * @modifyDate 2011-10-11
 * 
 * @modify 张伟 新增方法queryStationByBeginEndPath
 * @modifyDate 2011-10-11
 * 
 * @modify 王春生 新增方法queryAllStationForBegin
 * @modifyDate 2012-3-12
 */
public class StationDAO extends BaseDAO {

	/**
	 * 初始化页面查询
	 * 
	 * @param queryData
	 * @return
	 */
	public List<Map<String, Object>> queryStationTree(Map<?, ?> queryData) {
		String select = "SELECT A.STATION_ID, A.STATION_NAME, A.STATION_PAR_ID AS PAR_STATION_ID, A.ORDER_ID AS STATION_SN, A.STATE AS STATION_STATE, "
				+ "DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_DIM_USER_STATION A LEFT JOIN (SELECT STATION_PAR_ID, "
				+ "COUNT(1) CNT FROM META_DIM_USER_STATION GROUP BY STATION_PAR_ID) C ON A.STATION_ID=C.STATION_PAR_ID "
				+ "WHERE 1=1 ";
		List proParams = new ArrayList();
		if (queryData != null) {
			Object stationName = queryData.get("stationName");
			Object parStationName = queryData.get("parStationName");
			if (stationName != null && !stationName.toString().trim().equals("")) {
				if (parStationName != null && !parStationName.toString().trim().equals("")) {
					select += "AND A.STATION_PAR_ID NOT IN "
							+ "(SELECT D.STATION_ID FROM META_DIM_USER_STATION D WHERE D.STATION_NAME LIKE ?) ";
					proParams.add("%" + parStationName + "%");
					select += "AND A.STATION_NAME LIKE ? ESCAPE '/' "
							+

							"CONNECT BY A.STATION_PAR_ID = PRIOR A.STATION_ID START WITH A.STATION_ID IN( "
							+ "SELECT B.STATION_ID FROM META_DIM_USER_STATION B WHERE B.STATION_NAME LIKE ? ESCAPE '/' "
							+ "CONNECT BY STATION_PAR_ID = PRIOR STATION_ID START WITH STATION_PAR_ID=0) ";

					proParams.add("%" + stationName + "%");
					proParams.add("%" + parStationName + "%");
				} else {
					select += "AND A.STATION_NAME LIKE ? ESCAPE '/' ";
					proParams.add(SqlUtils.allLikeBindParam(stationName.toString()));
					select += "AND A.STATION_PAR_ID NOT IN "
							+ "(SELECT D.STATION_ID FROM META_DIM_USER_STATION D WHERE D.STATION_NAME LIKE ?) ";
					proParams.add(SqlUtils.allLikeBindParam(stationName.toString()));
				}
			} else {
				if (parStationName != null && !parStationName.toString().trim().equals("")) {

					select += "AND A.STATION_PAR_ID LIKE ? ESCAPE '/' ";
					proParams.add(SqlUtils.allLikeBindParam(parStationName.toString()));

					select += "AND A.STATION_PAR_ID NOT IN "
							+ "(SELECT D.STATION_ID FROM META_DIM_USER_STATION D WHERE D.STATION_NAME LIKE ?) ";
					proParams.add(SqlUtils.allLikeBindParam(parStationName.toString()));
				} else {
					select += "AND A.STATION_PAR_ID=0 ";
				}
			}
		} else {
			select += "AND A.STATION_PAR_ID=0 ";
		}
		select += " ORDER BY CHILDREN DESC";
		return getDataAccess().queryForList(select, proParams.toArray());
	}

	/**
	 * 查询子部门
	 * 
	 * @param parentId
	 * @return
	 */
	public List<Map<String, Object>> querySubStation(int parentId) {
		String select = "SELECT A.STATION_ID, A.STATION_NAME, A.STATION_PAR_ID AS PAR_STATION_ID, A.ORDER_ID AS STATION_SN, A.STATE AS STATION_STATE, "
				+ "DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_DIM_USER_STATION A LEFT JOIN (SELECT STATION_PAR_ID, "
				+ "COUNT(1) CNT FROM META_DIM_USER_STATION GROUP BY STATION_PAR_ID) C ON A.STATION_ID=C.STATION_PAR_ID "
				+ "WHERE  A.STATION_PAR_ID=? ORDER BY CHILDREN DESC ";
		Object[] proParams = { parentId };
		return getDataAccess().queryForList(select, proParams);
	}

	/**
	 * 根据部门关联用户
	 * 
	 * @param condtions
	 *            限制条件
	 * @param page
	 *            分页
	 * @return
	 */
	public List<Map<String, Object>> queryUserByCondition(Map<String, Object> condtions, Page page) {
		StringBuffer sql = new StringBuffer("SELECT A.USER_ID,A.USER_EMAIL,A.USER_PASS,A.USER_NAMECN, " +
				"A.STATE,A.USER_MOBILE,D.STATION_NAME,A.ADMIN_FLAG,A.HEAD_SHIP, " +
				"A.CREATE_DATE,A.USER_NAMEEN,A.OA_USER_NAME,B.ZONE_NAME,C.DEPT_NAME, " +
				"A.USER_SN,A.VIP_FLAG,A.GROUP_ID FROM META_MAG_USER A LEFT JOIN " +
				"META_DIM_ZONE B ON A.ZONE_ID=B.ZONE_ID LEFT JOIN " +
				"META_DIM_USER_DEPT C ON A.DEPT_ID=C.DEPT_CODE LEFT JOIN " +
				"META_DIM_USER_STATION D ON A.STATION_ID=D.STATION_CODE " + "WHERE A.USER_ID<>" +
				UserConstant.ADMIN_USERID + " ");
		List<Object> params = new ArrayList<Object>();
		if (condtions != null && condtions.get("userName") != null && !condtions.get("userName").toString().equals("")) {// 姓名
			sql.append("AND USER_NAMECN LIKE ? ESCAPE '/' ");
			params.add("%" + Convert.toString(condtions.get("userName")) + "%");
		}
		if (condtions != null && condtions.get("userStation") != null &&
				!condtions.get("userStation").toString().equals("-1")) {// 地域
			sql.append("AND STATION_ID IN (SELECT STATION_ID FROM META_DIM_USER_STATION "
					+ "START WITH STATION_ID=? CONNECT BY PRIOR STATION_ID=STATION_PAR_ID) ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("userStation"))));
		}
		sql.append("ORDER BY A.ZONE_ID,A.USER_SN,A.USER_ID");
		String pageSql = sql.toString();
		// 分页包装
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(getDataAccess(), sql.toString(), page);
		}
		return getDataAccess().queryForList(pageSql, params.toArray());
	}

	/**
	 * 加载从起始节点到结束节点之间有路径关系节点的所有数据，而不是加载从起始节点到结束节点之间所有的节点数据。 比如可以查询起始岗位为0，结束岗位为7之间树集关系的所有的数据，而岗位7必然为岗位0下的岗位。
	 * 
	 * 
	 * @param beginId
	 *            起始岗位ID。
	 * @param endId
	 *            结束岗位ID，如=0，只查找从指定起始节点下的两层树形数据。
	 * @return
	 */
	public List<Map<String, Object>> queryStationByBeginEndPath(int beginId, int endId) {

		StringBuffer sql = new StringBuffer(
				" SELECT A.STATION_ID, A.STATION_NAME,A.STATION_PAR_ID AS PAR_STATION_ID, A.ORDER_ID AS STATION_SN, A.STATE AS STATION_STATE,"
						+ "DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_DIM_USER_STATION A ");
		// 关联子查询，用于查询是否还有子节点
		sql.append("LEFT JOIN (SELECT STATION_PAR_ID,COUNT(1) CNT FROM META_DIM_USER_STATION GROUP BY STATION_PAR_ID) C ");
		// 连接条件
		sql.append("ON A.STATION_ID=C.STATION_PAR_ID ");
		// 下面的SQL用于当endId存在的时候限制查询的层级，如果endId不存在，只查询到begId下一个层级即可。用不到下面这段逻辑。
		if (endId > 0) {
			sql.append("WHERE A.STATION_PAR_ID IN ");
			sql.append("(SELECT A.STATION_ID FROM META_DIM_USER_STATION A  ");
			sql.append("WHERE  LEVEL<= ");
			sql.append("(SELECT NVL(MAX(L),99999999999999) FROM (SELECT STATION_ID,STATION_PAR_ID, LEVEL L " +
					"FROM META_DIM_USER_STATION CONNECT BY PRIOR STATION_PAR_ID=STATION_ID START WITH STATION_ID=" +
					endId + ") A " + "WHERE A." +
					(beginId == Constant.DEFAULT_ROOT_PARENT ? "STATION_PAR_ID=" : "STATION_ID=") + beginId + " )" +
					" CONNECT BY  PRIOR A.STATION_ID=A.STATION_PAR_ID START WITH " +
					(beginId == Constant.DEFAULT_ROOT_PARENT ? "STATION_PAR_ID=" : "STATION_ID=") + beginId + ") ");
			if (beginId == Constant.DEFAULT_ROOT_PARENT) {
				sql.append("OR A.STATION_PAR_ID =" + beginId);
			}

		} else {// 如果不存在endId，指定查找其子节点数据
			sql.append("WHERE A.STATION_PAR_ID=" + beginId + " OR A.STATION_ID=" + beginId);
		}
		return getDataAccess().queryForList(sql.toString());
	}

	/**
	 * 查询begionId 下所有子岗位
	 * 
	 * @param beginId
	 * @return
	 */
	public List<Map<String, Object>> queryAllStationForBegin(int beginId) {
		String sql = "SELECT A.STATION_ID, A.STATION_NAME, A.STATION_PAR_ID AS PAR_STATION_ID, A.ORDER_ID AS STATION_SN, A.STATE AS STATION_STATE, DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN "
				+ " FROM META_DIM_USER_STATION A LEFT JOIN (SELECT STATION_PAR_ID,COUNT(1) CNT FROM META_DIM_USER_STATION GROUP BY STATION_PAR_ID) C "
				+ " ON A.STATION_ID=C.STATION_PAR_ID "
				+ " WHERE A.STATION_ID IN(SELECT STATION_ID FROM META_DIM_USER_STATION CONNECT BY PRIOR STATION_ID=STATION_PAR_ID START WITH STATION_PAR_ID=?) "
				+ " ORDER BY A.STATION_PAR_ID ASC";
		return getDataAccess().queryForList(sql, beginId);
	}

	/**
	 * 查询岗位
	 * 
	 * @param stationId
	 * @return
	 */
	public Map<String, Object> queryStationInfo(int stationId) {
		String select = " ";
		if (isMysql()) {
			select = "SELECT A.STATION_ID, A.STATION_NAME, A.STATION_PAR_ID AS PAR_STATION_ID, A.ORDER_ID AS STATION_SN, A.STATE AS STATION_STATE, "
					+ "if(ifnull(C.CNT,0)=0,0,1) AS CHILDREN FROM META_DIM_USER_STATION A LEFT JOIN (SELECT STATION_PAR_ID, "
					+ "COUNT(1) CNT FROM META_DIM_USER_STATION GROUP BY STATION_PAR_ID) C ON A.STATION_ID=C.STATION_PAR_ID "
					+ "WHERE  A.STATION_ID=? ORDER BY CHILDREN DESC ";
		} else {
			select = "SELECT A.STATION_ID, A.STATION_NAME, A.STATION_PAR_ID AS PAR_STATION_ID, A.ORDER_ID AS STATION_SN, A.STATE AS STATION_STATE, "
					+ "DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_DIM_USER_STATION A LEFT JOIN (SELECT STATION_PAR_ID, "
					+ "COUNT(1) CNT FROM META_DIM_USER_STATION GROUP BY STATION_PAR_ID) C ON A.STATION_ID=C.STATION_PAR_ID "
					+ "WHERE  A.STATION_ID=? ORDER BY CHILDREN DESC ";
		}
		Object[] proParams = { stationId };
		return getDataAccess().queryForMap(select, proParams);
	}

}
