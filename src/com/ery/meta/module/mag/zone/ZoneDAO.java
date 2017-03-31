package com.ery.meta.module.mag.zone;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Constant;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.module.mag.user.UserConstant;

import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;

/**

 * 该类是地域查询DAO类，用于连接数据库操作，供ZoneAction调用
 * 

 * @date 2011-9-26 ----------------------
 * @modify 程钰 增加关联用户的DAO，修改初始化查询条件
 * @modifyDate 2011-10-11
 * 
 * @modify 张伟 新增方法queryDeptByBeginEndPath
 * @modifyDate 2011-10-11
 * 
 * @modify 王春生 新增方法queryAllZoneForBegin
 * @modifyDate 2012-3-12
 */
public class ZoneDAO extends BaseDAO {
	/**
	 * 初始化页面查询
	 * 
	 * @param queryData
	 * @return
	 */
	public List<Map<String, Object>> queryZone(Map<?, ?> queryData) {
		String select = "SELECT A.ZONE_ID, A.ZONE_NAME, A.ZONE_PAR_ID, A.ZONE_CODE, A.ZONE_DESC, "
				+ "A.DIM_TYPE_ID, A.STATE, A.DIM_LEVEL,D.DIM_TYPE_NAME, DECODE(NVL(C.CNT,0),0,0,1) AS "
				+ "CHILDREN FROM META_DIM_ZONE A LEFT JOIN "
				+ "(SELECT ZONE_PAR_ID, COUNT(1) CNT FROM META_DIM_ZONE GROUP BY ZONE_PAR_ID) C "
				+ "ON A.ZONE_ID=C.ZONE_PAR_ID LEFT JOIN META_DIM_TYPE D ON D.DIM_TYPE_ID = A.DIM_TYPE_ID WHERE 1=1 ";
		List proParams = new ArrayList();
		if (queryData != null) {
			Object zoneName = queryData.get("zoneName");
			Object parZoneName = queryData.get("parZoneName");
			if (zoneName != null && !zoneName.toString().trim().equals("")) {
				if (parZoneName != null && !parZoneName.toString().trim().equals("")) {
					select += "AND A.ZONE_PAR_ID NOT IN "
							+ "(SELECT D.ZONE_ID FROM META_DIM_ZONE D WHERE D.ZONE_NAME LIKE ?) ";
					proParams.add(SqlUtils.allLikeBindParam(parZoneName.toString()));
					select += "AND A.ZONE_NAME LIKE ? ESCAPE '/' "
							+ "CONNECT BY A.ZONE_PAR_ID = PRIOR A.ZONE_ID START WITH A.ZONE_ID IN( "
							+ "SELECT B.ZONE_ID FROM META_DIM_ZONE B WHERE B.ZONE_NAME LIKE ? ESCAPE '/' "
							+ "CONNECT BY ZONE_PAR_ID = PRIOR ZONE_ID START WITH ZONE_PAR_ID=0) ";
					proParams.add(SqlUtils.allLikeBindParam(zoneName.toString()));
					proParams.add(SqlUtils.allLikeBindParam(parZoneName.toString()));
				} else {
					select += "AND A.ZONE_NAME LIKE ? ESCAPE '/' ";
					proParams.add(SqlUtils.allLikeBindParam(zoneName.toString()));
					select += "AND A.ZONE_PAR_ID NOT IN "
							+ "(SELECT D.ZONE_ID FROM META_DIM_ZONE D WHERE D.ZONE_NAME LIKE ?) ";
					proParams.add(SqlUtils.allLikeBindParam(zoneName.toString()));
				}
			} else {
				if (parZoneName != null && !parZoneName.toString().trim().equals("")) {
					select += "AND A.ZONE_NAME LIKE ? ESCAPE '/' ";
					proParams.add(SqlUtils.allLikeBindParam(parZoneName.toString()));
					select += "AND A.ZONE_PAR_ID NOT IN "
							+ "(SELECT D.ZONE_ID FROM META_DIM_ZONE D WHERE D.ZONE_NAME LIKE ?) ";
					proParams.add(SqlUtils.allLikeBindParam(parZoneName.toString()));
				} else {
					select += "AND A.ZONE_PAR_ID=0 ";
				}
			}
		} else {
			select += "AND A.ZONE_PAR_ID=0 ";
		}
		select += " ORDER BY CHILDREN DESC";
		return getDataAccess().queryForList(select, proParams.toArray());
	}

	/**
	 * 查询子地域
	 * 
	 * @param parentId
	 * @return
	 */
	public List<Map<String, Object>> querySubZone(int parentId) {
		String select = "SELECT A.ZONE_ID, A.ZONE_NAME, A.ZONE_PAR_ID, A.ZONE_CODE, A.ZONE_DESC, "
				+ " A.STATE, A.DIM_LEVEL,  DECODE(NVL(C.CNT,0),0,0,1) AS " + "CHILDREN FROM META_DIM_ZONE A LEFT JOIN "
				+ "(SELECT ZONE_PAR_ID, COUNT(1) CNT FROM META_DIM_ZONE GROUP BY ZONE_PAR_ID) C "
				+ "ON A.ZONE_ID=C.ZONE_PAR_ID  WHERE A.ZONE_PAR_ID=? ORDER BY CHILDREN DESC";
		Object[] proParams = { parentId };
		return getDataAccess().queryForList(select, proParams);
	}

	/**
	 * 根据地域关联用户
	 * 
	 * @param condtions 限制条件
	 * @param page 分页
	 * @return
	 */
	public List<Map<String, Object>> queryUserByCondition(Map<String, Object> condtions, Page page) {
		StringBuffer sql = new StringBuffer("SELECT A.USER_NAMECN, A.USER_NAMEEN, A.USER_MOBILE, A.USER_EMAIL,"
				+ "A.USER_ID, A.USER_PASS,A.STATE, A.ADMIN_FLAG, A.CREATE_DATE, A.OA_USER_NAME, "
				+ "B.DEPT_NAME, C.STATION_NAME, D.ZONE_NAME, A.HEAD_SHIP FROM "
				+ "META_MAG_USER A LEFT JOIN META_DIM_USER_DEPT B "
				+ "ON A.DEPT_ID=B.DEPT_CODE LEFT JOIN META_DIM_USER_STATION C "
				+ "ON C.STATION_CODE=A.STATION_ID LEFT JOIN META_DIM_ZONE D "
				+ "ON D.ZONE_ID=A.ZONE_ID WHERE A.USER_ID<>" + UserConstant.ADMIN_USERID + " ");
		List<Object> params = new ArrayList<Object>();
		if (condtions != null && condtions.get("userName") != null && !condtions.get("userName").toString().equals("")) {// 姓名
			sql.append("AND USER_NAMECN LIKE ? ESCAPE '/' ");
			params.add(SqlUtils.allLikeBindParam(Convert.toString(condtions.get("userName")).toString()) + "%");
		}
		if (condtions != null && condtions.get("userZone") != null
				&& !condtions.get("userZone").toString().equals("-1")) {// 地域
			sql.append("AND ZONE_ID IN (SELECT ZONE_ID FROM META_DIM_ZONE "
					+ "START WITH ZONE_ID=? CONNECT BY PRIOR ZONE_ID=ZONE_PAR_ID) ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("userZone"))));
		}
		sql.append("ORDER BY A.ZONE_ID,A.USER_SN,A.USER_ID");
		String pageSql = sql.toString();
		// 分页包装
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(sql.toString(), page);
		}
		return getDataAccess().queryForList(pageSql, params.toArray());
	}

	/**
	 * 加载从起始节点到结束节点之间有路径关系节点的所有数据，而不是加载从起始节点到结束节点之间所有的节点数据。
	 * 比如可以查询起始地域为0，结束地域为7之间树集关系的所有的数据，而地域7必然为地域0下的地域。
	 * 

	 * @param beginId 起始地域ID。
	 * @param endId 结束地域ID，如=0，只查找从指定起始节点下的两层树形数据。
	 * @return
	 */
	public List<Map<String, Object>> queryZoneByBeginEndPath(int beginId, int endId) {

		StringBuffer sql = new StringBuffer("SELECT A.ZONE_ID, A.ZONE_NAME, A.ZONE_PAR_ID, A.ZONE_CODE, A.ZONE_DESC, "
				+ "A.DIM_TYPE_ID, A.STATE, A.DIM_LEVEL, DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN "
				+ "FROM META_DIM_ZONE A ");
		// 关联子查询，用于查询是否还有子节点
		sql.append("LEFT JOIN (SELECT ZONE_PAR_ID,COUNT(1) CNT FROM META_DIM_ZONE  WHERE DIM_TYPE_ID = "
				+ SystemVariable.getString("userZoneDimTypeId", "4") + " GROUP BY ZONE_PAR_ID) C ");
		// 连接条件
		sql.append("ON A.ZONE_ID=C.ZONE_PAR_ID ");
		// 下面的SQL用于当endId存在的时候限制查询的层级，如果endId不存在，只查询到begId下一个层级即可。用不到下面这段逻辑。
		if (endId > 0) {
			sql.append("WHERE A.ZONE_ID IN ");
			sql.append("(SELECT A.ZONE_ID FROM META_DIM_ZONE A  ");
			sql.append("WHERE A.DIM_TYPE_ID = " + SystemVariable.getString("userZoneDimTypeId", "4") + " AND  LEVEL<= ");
			sql.append("(SELECT NVL(MAX(L),99999999999999) FROM (SELECT ZONE_ID,ZONE_PAR_ID, LEVEL L "
					+ "FROM META_DIM_ZONE CONNECT BY PRIOR ZONE_PAR_ID=ZONE_ID START WITH ZONE_ID=" + endId + ") A "
					+ "WHERE A." + (beginId == Constant.DEFAULT_ROOT_PARENT ? "ZONE_PAR_ID=" : "ZONE_ID=") + beginId
					+ " )" + " CONNECT BY  PRIOR A.ZONE_ID=A.ZONE_PAR_ID START WITH "
					+ (beginId == Constant.DEFAULT_ROOT_PARENT ? "ZONE_PAR_ID=" : "ZONE_ID=") + beginId + ") ");
			if (beginId == Constant.DEFAULT_ROOT_PARENT) {
				// sql.append("OR A.ZONE_PAR_ID ="+beginId);
			}

		} else {// 如果不存在endId，指定查找其子节点数据
		// sql.append("WHERE A.ZONE_PAR_ID="+beginId+" OR A.ZONE_ID="+beginId);
			sql.append("WHERE A.ZONE_PAR_ID=" + beginId + " AND A.DIM_TYPE_ID="
					+ SystemVariable.getString("userZoneDimTypeId", "4") + "");
		}
		return getDataAccess().queryForList(sql.toString());
	}

	/**
	 * 查询出所有begionId 下所有子地域
	 * 
	 * @param beginId
	 * @return

	 */
	public List<Map<String, Object>> queryAllZoneForBegin(int beginId) {
		String sql = "SELECT A.ZONE_ID, A.ZONE_NAME, A.ZONE_PAR_ID, A.ZONE_CODE, A.ZONE_DESC, A.DIM_TYPE_ID, A.STATE,"
				+ "A.DIM_LEVEL, DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN "
				+ "FROM META_DIM_ZONE A LEFT JOIN (SELECT ZONE_PAR_ID,COUNT(1) CNT FROM META_DIM_ZONE GROUP BY ZONE_PAR_ID) C ON A.ZONE_ID=C.ZONE_PAR_ID "
				+ "WHERE A.ZONE_ID IN(SELECT ZONE_ID FROM META_DIM_ZONE CONNECT BY PRIOR ZONE_ID=ZONE_PAR_ID START WITH ZONE_PAR_ID=?)  ORDER BY A.ZONE_PAR_ID ASC";
		return getDataAccess().queryForList(sql, beginId);
	}

	/**
	 * 根据zoneId查询相关的地域信息。
	 * 
	 * @param zoneId
	 * @return
	 */
	public Map<String, Object> queryZoneInfo(int zoneId) {
		String sql = " SELECT A.ZONE_ID,A.ZONE_PAR_ID,A.ZONE_NAME,A.ZONE_DESC,A.DIM_TYPE_ID, A.DIM_TYPE_ID,A.DIM_LEVEL,"
				+ " CASE WHEN A.ZONE_CODE IS NULL OR A.ZONE_CODE = '0000' THEN '0000' ELSE A.ZONE_CODE END ZONE_CODE,"
				+ " CASE WHEN B.ZONE_CODE IS NULL OR B.ZONE_CODE = '0000' THEN '0' ELSE A.ZONE_CODE END AREA_ID"
				+ " FROM META_DIM_ZONE A, META_DIM_ZONE B WHERE A.ZONE_ID = ? AND A.DIM_TYPE_ID=4"
				+ " AND A.ZONE_PAR_ID = B.ZONE_ID(+)";
		return getDataAccess().queryForMap(sql, zoneId);
	}

	/**
	 * 根据用户ID，查询该用户地域编码
	 * 
	 * @param userId
	 * @return
	 */
	public Map<String, Object> queryZoneCodeByUserId(long userId) {
		String sql = "SELECT Z.ZONE_CODE,Z.DIM_LEVEL FROM META_DIM_ZONE Z " + "LEFT JOIN META_MAG_USER U "
				+ "ON U.ZONE_ID = Z.ZONE_ID WHERE U.USER_ID=?";
		return getDataAccess().queryForMap(sql, userId);
	}

}
