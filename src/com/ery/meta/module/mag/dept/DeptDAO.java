package com.ery.meta.module.mag.dept;

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
 * 该类是部门查询DAO类，用于连接数据库操作，供DeptAction调用
 * 
 * 
 * @date 2011-9-26 ----------------------
 * @modify 程钰 怎就关联用户的DAO,修改查询条件
 * @modifyDate 2011-10-11
 * 
 * @modify 张伟 新增方法queryDeptByBeginEndPath
 * @modifyDate 2011-10-11
 * 
 * @modify 熊小平 增加部门查询时的条件查询
 * @modifyDate 2011-10-10
 * 
 * @modify 王春生 新增方法queryAllDeptForBegin
 * @modifyDate 2012-3-12
 */
public class DeptDAO extends BaseDAO {

	/**
	 * 部门查询，初始化查询时视为传递空参数，即查询所有部门信息
	 * 
	 * @modify 熊小平
	 * @Date 2011-10-12-09-39
	 * @描述 部门加载时的参数传递，初始化时视为空参数，字符串拼接时使用StringBuffer
	 * 
	 * @param queryData
	 * @return
	 */
	public List<Map<String, Object>> queryDept(Map<?, ?> queryData) {
		/**
		 * StringBuffer sqlQueryDept = new StringBuffer( "SELECT A.DEPT_ID, A.PARENT_ID, A.DEPT_NAME, A.DEPT_SN, A.DEPT_STATE, " +
		 * "DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_MAG_USER_DEPT A LEFT JOIN " +
		 * "(SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_USER_DEPT GROUP BY PARENT_ID) C " +
		 * "ON A.DEPT_ID=C.PARENT_ID WHERE 1=1 ");
		 **/
		StringBuffer sqlQueryDept = new StringBuffer(
				"SELECT A.DEPT_ID, A.DEPT_PAR_ID AS PARENT_ID, A.DEPT_NAME, A.ORDER_ID AS DEPT_SN, A.STATE AS DEPT_STATE, "
						+ "DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_DIM_USER_DEPT A LEFT JOIN "
						+ "(SELECT DEPT_PAR_ID AS PARENT_ID,COUNT(1) CNT FROM META_DIM_USER_DEPT GROUP BY DEPT_PAR_ID) C "
						+ "ON A.DEPT_ID=C.PARENT_ID WHERE 1=1 ");

		List<Object> proParams = new ArrayList<Object>();
		if (queryData != null) {
			Object deptName = queryData.get("deptName");
			Object superDeptName = queryData.get("superDeptName");
			if (deptName != null && !deptName.toString().trim().equals("")) {
				if (superDeptName != null && !superDeptName.toString().trim().equals("")) {
					// 参数：父级部门与部门名称
					sqlQueryDept.append("AND A.DEPT_PAR_ID NOT IN "
							+ "(SELECT D.DEPT_CODE FROM META_DIM_USER_DEPT D WHERE D.DEPT_NAME LIKE ?) ");
					proParams.add("%" + superDeptName + "%");
					sqlQueryDept.append("AND A.DEPT_NAME LIKE ? "
							+ "CONNECT BY A.DEPT_PAR_ID = PRIOR A.DEPT_ID START WITH A.DEPT_ID IN( "
							+ "SELECT B.DEPT_CODE FROM META_DIM_USER_DEPT B WHERE B.DEPT_NAME LIKE ? "
							+ "CONNECT BY PARENT_ID = PRIOR DEPT_ID START WITH PARENT_ID=0) ");
					proParams.add("%" + deptName + "%");
					proParams.add("%" + superDeptName + "%");
				} else {
					// 参数：部门名称
					sqlQueryDept.append("AND A.DEPT_NAME LIKE ? ");
					proParams.add("%" + deptName + "%");
					sqlQueryDept.append("AND A.DEPT_PAR_ID NOT IN "
							+ "(SELECT D.DEPT_CODE FROM META_DIM_USER_DEPT D WHERE D.DEPT_NAME LIKE ?) ");
					proParams.add("%" + deptName + "%");
				}
			} else {
				if (superDeptName != null && !superDeptName.toString().trim().equals("")) {
					// 参数：父级部门
					sqlQueryDept.append("AND A.DEPT_NAME LIKE ? ");
					proParams.add("%" + superDeptName + "%");
					sqlQueryDept.append("AND A.DEPT_PAR_ID NOT IN "
							+ "(SELECT D.DEPT_CODE FROM META_DIM_USER_DEPT D WHERE D.DEPT_NAME LIKE ?) ");
					proParams.add("%" + superDeptName + "%");
				} else {
					// 参数：空（查询所有顶级部门，即父级部门为0的部门）
					sqlQueryDept.append("AND A.DEPT_PAR_ID=0 ");
				}
			}
		} else {
			// 参数：空（查询所有顶级部门，即父级部门为0的部门）
			sqlQueryDept.append("AND A.DEPT_PAR_ID=0 ");
		}
		sqlQueryDept.append(" ORDER BY CHILDREN DESC");
		return getDataAccess().queryForList(sqlQueryDept.toString(), proParams.toArray());
	}

	/**
	 * 查询子部门
	 * 
	 * @param parentId
	 * @return
	 */
	public List<Map<String, Object>> querySubDept(int parentId) {
		String sqlQuerySubDept = "SELECT A.DEPT_ID, A.DEPT_PAR_ID AS PARENT_ID, A.DEPT_NAME, A.ORDER_ID AS DEPT_SN , A.STATE AS DEPT_STATE, "
				+ "DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_DIM_USER_DEPT A LEFT JOIN "
				+ "(SELECT DEPT_PAR_ID AS PARENT_ID, COUNT(1) CNT FROM META_DIM_USER_DEPT GROUP BY DEPT_PAR_ID) "
				+ "C ON A.DEPT_ID=C.PARENT_ID WHERE  A.DEPT_PAR_ID=? ORDER BY CHILDREN DESC";
		return getDataAccess().queryForList(sqlQuerySubDept, parentId);
	}

	/**
	 * 根据岗位关联用户
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
			sql.append("AND USER_NAMECN LIKE ? ");
			params.add("%" + Convert.toString(condtions.get("userName")) + "%");
		}
		if (condtions != null && condtions.get("userDept") != null &&
				!condtions.get("userDept").toString().equals("-1")) {// 地域
			sql.append("AND DEPT_ID IN (SELECT DEPT_ID FROM META_DIM_USER_DEPT "
					+ "START WITH DEPT_ID=? CONNECT BY PRIOR DEPT_ID=DEPT_PAR_ID) ");
			params.add(Integer.parseInt(String.valueOf(condtions.get("userDept"))));
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
	 * 加载从起始节点到结束节点之间有路径关系节点的所有数据，而不是加载从起始节点到结束节点之间所有的节点数据。 比如可以查询起始部门为0，结束部门为7之间树集关系的所有的数据，而部门7必然为部门0下的部门。
	 * 
	 * 
	 * @param beginId
	 *            起始部门ID。
	 * @param endId
	 *            结束部门ID，如=0，只查找从指定起始节点下的两层树形数据。
	 * @return
	 */
	public List<Map<String, Object>> queryDeptByBeginEndPath(int beginId, int endId) {

		StringBuffer sql = new StringBuffer(
				"SELECT A.DEPT_ID, A.DEPT_PAR_ID AS PARENT_ID,A.DEPT_NAME,A.ORDER_ID AS DEPT_SN,A.STATE AS DEPT_STATE "
						+ ",DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_DIM_USER_DEPT A ");
		// 关联子查询，用于查询是否还有子节点
		sql.append("LEFT JOIN (SELECT DEPT_PAR_ID,COUNT(1) CNT FROM META_DIM_USER_DEPT GROUP BY DEPT_PAR_ID) C ");
		// 连接条件
		sql.append("ON A.DEPT_ID=C.DEPT_PAR_ID ");
		// 下面的SQL用于当endId存在的时候限制查询的层级，如果endId不存在，只查询到begId下一个层级即可。用不到下面这段逻辑。
		if (endId > 0) {
			sql.append("WHERE A.DEPT_PAR_ID IN ");
			sql.append("(SELECT A.DEPT_ID FROM META_DIM_USER_DEPT A  ");
			sql.append("WHERE  LEVEL<= ");
			sql.append("(SELECT NVL(MAX(L),99999999999999) FROM (SELECT DEPT_ID,DEPT_PAR_ID, LEVEL L " +
					"FROM META_DIM_USER_DEPT CONNECT BY PRIOR DEPT_PAR_ID=DEPT_ID START WITH DEPT_ID=" + endId +
					") A " + "WHERE A." + (beginId == Constant.DEFAULT_ROOT_PARENT ? "DEPT_PAR_ID=" : "DEPT_ID=") +
					beginId + " )" + " CONNECT BY  PRIOR A.DEPT_ID=A.DEPT_PAR_ID START WITH " +
					(beginId == Constant.DEFAULT_ROOT_PARENT ? "DEPT_PAR_ID=" : "DEPT_ID=") + beginId + ") ");
			if (beginId == Constant.DEFAULT_ROOT_PARENT) {
				sql.append("OR A.DEPT_PAR_ID =" + beginId);
			}

		} else {// 如果不存在endId，指定查找其子节点数据
			sql.append("WHERE A.DEPT_PAR_ID=" + beginId + " OR A.DEPT_ID=" + beginId);
		}
		return getDataAccess().queryForList(sql.toString());
	}

	/**
	 * 查询出begionID下所有子部门
	 * 
	 * @param begionId
	 * @return
	 */
	public List<Map<String, Object>> queryAllDeptForBegin(int begionId) {
		String sql = "SELECT A.DEPT_ID, A.DEPT_PAR_ID AS PARENT_ID,A.DEPT_NAME,A.ORDER_ID AS DEPT_SN,A.STATE AS DEPT_STATE ,DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN "
				+ "FROM META_DIM_USER_DEPT A LEFT JOIN (SELECT DEPT_PAR_ID,COUNT(1) CNT FROM META_DIM_USER_DEPT GROUP BY DEPT_PAR_ID) C ON A.DEPT_ID=C.DEPT_PAR_ID "
				+ "WHERE A.DEPT_ID IN(SELECT DEPT_ID FROM META_DIM_USER_DEPT CONNECT BY PRIOR DEPT_ID=DEPT_PAR_ID START WITH DEPT_PAR_ID=?) ORDER BY A.DEPT_PAR_ID ASC";
		return getDataAccess().queryForList(sql, begionId);
	}

	/**
	 * 查询部门信息。
	 * 
	 * @param deptId
	 * @return
	 */
	public Map<String, Object> queryDeptInfo(int deptId) {
		String sqlQuerySubDept = null;
		if ("mysql".equals(getDataAccess().getDatabaseName())) {
			sqlQuerySubDept = "SELECT A.DEPT_ID, A.DEPT_PAR_ID AS PARENT_ID, A.DEPT_NAME, A.ORDER_ID AS DEPT_SN, A.STATE AS DEPT_STATE, "
					+ "if(ifnull(C.CNT,0)=0,0,1) AS CHILDREN FROM META_DIM_USER_DEPT A LEFT JOIN "
					+ "(SELECT DEPT_PAR_ID, COUNT(1) CNT FROM META_DIM_USER_DEPT GROUP BY DEPT_PAR_ID) "
					+ "C ON A.DEPT_ID=C.DEPT_PAR_ID WHERE  A.DEPT_ID=? ORDER BY CHILDREN DESC";
		} else {
			sqlQuerySubDept = "SELECT A.DEPT_ID, A.DEPT_PAR_ID AS PARENT_ID, A.DEPT_NAME, A.ORDER_ID AS DEPT_SN, A.STATE AS DEPT_STATE, "
					+ "DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_DIM_USER_DEPT A LEFT JOIN "
					+ "(SELECT DEPT_PAR_ID, COUNT(1) CNT FROM META_DIM_USER_DEPT GROUP BY DEPT_PAR_ID) "
					+ "C ON A.DEPT_ID=C.DEPT_PAR_ID WHERE  A.DEPT_ID=? ORDER BY CHILDREN DESC";
		}
		return getDataAccess().queryForMap(sqlQuerySubDept, deptId);
	}
}
