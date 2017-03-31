package com.ery.meta.module.mag.menu;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Constant;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.module.mag.user.UserConstant;

import com.ery.base.support.utils.Convert;

/**

 * 

 * @description 作用:菜单数据访问Dao <br>
 * @date 2011-09-16
 * @modify 程钰 修改查询菜单条件
 * @date 2011-10-12
 */
public class MenuDAO extends MetaBaseDAO {

	/**
	 * 获取所有的菜单系统
	 * 
	 * @return 
	 *         如果dhtmlxMapper==null,返回LIST<MAP<STRING,OBJECT>，如果dhtmlxMapper！=null
	 *         ， 返回格式化后的数据
	 */
	public List<Map<String, Object>> queryMenuSystem() {
		String sql = "SELECT GROUP_ID,GROUP_NAME,GROUP_SN,GROUP_STATE,GROUP_LOGO, "
				+ "DEFAULT_SKIN FROM META_MENU_GROUP T WHERE T.GROUP_STATE=? ORDER BY GROUP_SN";
		return getDataAccess().queryForList(sql, UserConstant.META_MENU_GROUP_STATE_ENABLE);
	}

	/**
	 * 查询所有的菜单数据。
	 * 
	 * @return
	 */
	public List<Map<String, Object>> queryAllMenu() {
		String sql = "SELECT MENU_ID,PARENT_ID,MENU_NAME,MENU_TIP,MENU_URL, "
				+ "PAGE_BUTTON,GROUP_ID,ORDER_ID,IS_SHOW,CREATE_DATE, "
				+ "ICON_URL,TARGET,USER_ATTR,NAV_STATE,USER_ATTR_LIST, " + "MENU_STATE FROM META_MAG_MENU ";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 根据用户查询所有有权限的菜单。 此方法无管理员判断逻辑
	 * 
	 * @param userId
	 * @return
	 */
	public List<Map<String, Object>> queryAllMenuByUserId(int userId) {
		String sql = "SELECT  A.MENU_ID,A.PARENT_ID,A.MENU_NAME,A.MENU_TIP,A.MENU_URL, "
				+ "A.PAGE_BUTTON,A.GROUP_ID,A.ORDER_ID,A.IS_SHOW,A.CREATE_DATE, "
				+ "A.ICON_URL,A.TARGET,A.USER_ATTR,A.NAV_STATE,A.USER_ATTR_LIST, "
				+ "A.MENU_STATE,DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN, "
				+ "D.FLAG ROLE_FLAG FROM META_MAG_MENU A "
				+ "LEFT JOIN (SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_MENU GROUP BY PARENT_ID) C "
				+ "ON A.MENU_ID=C.PARENT_ID "
				// 关联出没有权限的按钮
				// 关联菜单用户表中的数据
				+ "LEFT JOIN (SELECT MENU_ID,EXCLUDE_BUTTON,FLAG FROM  META_MAG_USER_MENU  WHERE USER_ID=" + userId
				+ ") D ON A.MENU_ID=D.MENU_ID ";
		sql += " WHERE EXISTS (SELECT 1 FROM " + "(SELECT MENU_ID FROM  META_MAG_USER_MENU B WHERE USER_ID=" + userId
				+ " " + "UNION " + "SELECT B.MENU_ID FROM META_MAG_USER_ROLE A,META_MAG_ROLE_MENU B WHERE A.USER_ID="
				+ userId + " AND B.ROLE_ID=A.ROLE_ID) C WHERE A.MENU_ID=C.MENU_ID) ";
		sql += "ORDER BY A.PARENT_ID,A.ORDER_ID ASC";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 查询指定ID的菜单信息
	 * 
	 * @return
	 */
	public Map<String, Object> queryMenuById(int menuId) {
		String sql = "SELECT MENU_ID,PARENT_ID,MENU_NAME,MENU_TIP,MENU_URL, "
				+ "PAGE_BUTTON,GROUP_ID,ORDER_ID,IS_SHOW,CREATE_DATE, "
				+ "ICON_URL,TARGET,USER_ATTR,NAV_STATE,USER_ATTR_LIST, "
				+ "MENU_STATE FROM META_MAG_MENU WHERE MENU_ID=? ORDER BY ORDER_ID ASC ";
		return getDataAccess().queryForMap(sql, menuId);
	}

	/**
	 * 查询菜单
	 * 
	 * @param queryData
	 * @return
	 */
	public List<Map<String, Object>> queryMenu(Map<?, ?> queryData) {
		String sql = "SELECT A.MENU_ID,A.PARENT_ID,A.MENU_NAME,A.MENU_TIP,A.MENU_URL, "
				+ "A.PAGE_BUTTON,A.GROUP_ID,A.ORDER_ID,A.IS_SHOW,A.CREATE_DATE, "
				+ "A.ICON_URL,A.TARGET,A.USER_ATTR,A.NAV_STATE,A.USER_ATTR_LIST, "
				+ "A.MENU_STATE,DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_MAG_MENU A ";
		Object parentMenuName = queryData.get("parentMenuName");
		Object menuName = queryData.get("menuName");
		Object belongSys = queryData.get("belongSys");
		List<Object> params = new ArrayList<Object>();
		// 关联子查询，判断是否还有子节点。
		sql += "LEFT JOIN (SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_MENU GROUP BY PARENT_ID) C "
				+ "ON A.MENU_ID=C.PARENT_ID ";
		sql += "WHERE A.GROUP_ID=? ";
		params.add(belongSys);
		// 如果父菜单和菜单名查询选项都没有设置，查询指定系统下所有的根节点菜单。
		if ((parentMenuName == null || parentMenuName.toString().trim().equals(""))
				&& (menuName == null || menuName.toString().trim().equals(""))) {
			// 选择的时候关联出所有的菜单数据。
			sql += "AND A.PARENT_ID=? ORDER BY A.ORDER_ID ASC "; // 同级下根据ORDER_ID排序
			params.add(Constant.DEFAULT_ROOT_PARENT);
		} else if ((parentMenuName == null || parentMenuName.toString().trim().equals(""))
				|| (menuName == null || menuName.toString().trim().equals(""))) {
			// 如果父菜单查询条件或者菜单查询条件其中有一个为空，则查询菜单like "parentMenuName"的菜单。
			sql += "AND A.MENU_NAME LIKE  "
					+ SqlUtils
							.allLikeParam(((parentMenuName == null || parentMenuName.toString().trim().equals("")) ? menuName
									: parentMenuName).toString());
			sql += "AND A.PARENT_ID NOT IN "
					+ "(SELECT D.MENU_ID FROM META_MAG_MENU D WHERE D.MENU_NAME LIKE "
					+ SqlUtils
							.allLikeParam(((parentMenuName == null || parentMenuName.toString().trim().equals("")) ? menuName
									: parentMenuName).toString()) + ") ";
		} else { // 当两个条件都有设置，寻找父菜单下like 子菜单的菜单
			sql += "AND A.PARENT_ID NOT IN " + "(SELECT D.MENU_ID FROM META_MAG_MENU D WHERE D.MENU_NAME LIKE "
					+ SqlUtils.allLikeParam(parentMenuName.toString()) + ") ";
			sql += "AND A.MENU_NAME LIKE " + SqlUtils.allLikeParam(menuName.toString())
					+ "CONNECT BY A.PARENT_ID = PRIOR A.MENU_ID START WITH A.MENU_ID IN( "
					+ "SELECT B.MENU_ID FROM META_MAG_MENU B WHERE B.MENU_NAME LIKE  "
					+ SqlUtils.allLikeParam(parentMenuName.toString())
					+ "CONNECT BY PARENT_ID = PRIOR MENU_ID START WITH PARENT_ID=0) ";
			// params.add("%" + menuName + "%");
			// params.add("%" + parentMenuName + "%");
		}
		// 关联统计自身，查询出是否还有子节点。
		return getDataAccess().queryForList(sql, params.toArray());
	}

	/**
	 * 动态加载子菜单。
	 * 
	 * @param parentId
	 * @return
	 */
	public List<Map<String, Object>> querySubMenu(int parentId) {
		String sql = "SELECT  A.MENU_ID,A.PARENT_ID,A.MENU_NAME,A.MENU_TIP,A.MENU_URL, "
				+ "A.PAGE_BUTTON, A.GROUP_ID,A.ORDER_ID,A.IS_SHOW,A.CREATE_DATE, "
				+ "A.ICON_URL,A.TARGET,A.USER_ATTR,A.NAV_STATE, A.USER_ATTR_LIST, "
				+ "A.MENU_STATE,DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN  FROM META_MAG_MENU A "
				+ "LEFT JOIN (SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_MENU GROUP BY PARENT_ID) C "
				+ "ON A.MENU_ID=C.PARENT_ID " + "WHERE A.PARENT_ID='" + parentId + "' ORDER BY A.ORDER_ID ASC";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 加载指定菜单所有的子菜单数据。结果集包括隐藏菜单数据以及排除菜单按钮集。
	 * 
	 * @param parentId
	 * @return
	 */
	public List<Map<String, Object>> queryAllSubMenu(int parentId, int userId) {
		String sql = "SELECT  A.MENU_ID,A.PARENT_ID,A.MENU_NAME,A.MENU_TIP,A.MENU_URL, "
				+ "A.PAGE_BUTTON,A.GROUP_ID,A.ORDER_ID,A.IS_SHOW,A.CREATE_DATE, "
				+ "A.ICON_URL,A.TARGET,A.USER_ATTR,A.NAV_STATE,A.USER_ATTR_LIST, "
				+ "A.MENU_STATE,DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN, "
				+ "D.FLAG ROLE_FLAG FROM META_MAG_MENU A "
				+ "LEFT JOIN (SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_MENU GROUP BY PARENT_ID) C "
				+ "ON A.MENU_ID=C.PARENT_ID "
				// 关联出没有权限的按钮
				// 关联菜单用户表中的数据
				+ "LEFT JOIN (SELECT MENU_ID,EXCLUDE_BUTTON,FLAG FROM  META_MAG_USER_MENU  WHERE USER_ID="
				+ userId
				+ ") D ON A.MENU_ID=D.MENU_ID "
				// 所有子节点条件
				+ "WHERE A.MENU_ID IN (SELECT MENU_ID FROM META_MAG_MENU CONNECT BY PRIOR MENU_ID= PARENT_ID START WITH PARENT_ID="
				+ parentId + ") ";
		if (userId != UserConstant.ADMIN_USERID) {// 如果不是管理员。
			sql += "AND EXISTS (SELECT 1 FROM " + "(SELECT MENU_ID FROM  META_MAG_USER_MENU B WHERE USER_ID=" + userId
					+ " " + "UNION "
					+ "SELECT B.MENU_ID FROM META_MAG_USER_ROLE A,META_MAG_ROLE_MENU B WHERE A.USER_ID=" + userId
					+ " AND B.ROLE_ID=A.ROLE_ID) C WHERE A.MENU_ID=C.MENU_ID) ";
		}
		sql += "ORDER BY A.PARENT_ID,A.ORDER_ID ASC";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 加载菜单指定层级的最大序列，即orderId
	 * 
	 * @param parentId
	 * @return
	 */
	public Map<String, Object> queryMaxMinOrder(int parentId) {
		String sql = "SELECT MAX(NVL(ORDER_ID,0)) MAX_ORDER,MIN(NVL(ORDER_ID,0)) MIN_ORDER FROM META_MAG_MENU WHERE PARENT_ID= "
				+ parentId;
		return getDataAccess().queryForMap(sql);
	}

	/**
	 * 新增一个菜单
	 * 
	 * @param data Map数据，键值对应。map中无对应键值的将置为null。
	 * @return
	 */
	public int insertMenu(Map<?, ?> data) throws Exception {
		String sql = "INSERT INTO META_MAG_MENU(MENU_ID,PARENT_ID,MENU_NAME,MENU_TIP,MENU_URL, "
				+ "PAGE_BUTTON,GROUP_ID,ORDER_ID,IS_SHOW,ICON_URL, "
				+ "TARGET,USER_ATTR,NAV_STATE,USER_ATTR_LIST,MENU_STATE) " + "VALUES(?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?)";
		List<Object> proParams = new ArrayList<Object>();// 参数
		long pk = (long) queryForNextVal("SEQ_MAG_MENU_ID");
		String ORDER = "";
		proParams.add(pk);

		if (data.containsKey("parentId")) {
			Integer ORDER_ID = getDataAccess().queryForInt(
					"SELECT count(*) FROM META_MAG_MENU WHERE PARENT_ID="
							+ Integer.parseInt(data.get("parentId").toString())) + 1;
			proParams.add(Integer.parseInt(data.get("parentId").toString()));
			ORDER = ORDER_ID.toString();
		} else {
			Integer ORDER_ID = getDataAccess().queryForInt("SELECT count(*) FROM META_MAG_MENU WHERE PARENT_ID=0") + 1;
			ORDER = ORDER_ID.toString();
		}
		proParams.add(Convert.toString(data.get("menuName")));
		proParams.add(Convert.toString(data.get("menuTip")));
		proParams.add(Convert.toString(data.get("menuUrl")));
		proParams.add(Convert.toString(data.get("pageButton")));
		proParams.add(Integer.parseInt(data.get("groupId").toString()));
		proParams.add(ORDER);
		if (data.containsKey("isShow")) {
			proParams.add(Integer.parseInt(data.get("isShow").toString()));
		} else {
			proParams.add(Constant.META_ENABLE);
		}
		proParams.add(Convert.toString(data.get("iconUrl")));
		proParams.add(Convert.toString(data.get("target")));
		proParams.add(Convert.toString(data.get("userAttr")));
		proParams.add(Convert.toString(data.get("navState")));
		proParams.add(Convert.toString(data.get("userAttrList")));
		proParams.add(Convert.toString(data.get("menuState")));
		getDataAccess().execUpdate(sql, proParams.toArray());
		return (int) pk;
	}

	/**
	 * 修改一条菜单,此SQL不能修改主键MENU_ID,此SQL要传入所有的列值，没有的会更新为null
	 * 
	 * @param data
	 * @return
	 * @throws Exception
	 */
	public Object updateMenuById(Map<?, ?> data) throws Exception {
		String sql = "UPDATE META_MAG_MENU SET PARENT_ID=?,MENU_NAME=?,MENU_URL=?, "
				+ "PAGE_BUTTON=?,GROUP_ID=?,ORDER_ID=?,IS_SHOW=?,ICON_URL=?,"
				+ "TARGET=?,USER_ATTR=?,NAV_STATE=?,USER_ATTR_LIST=?,MENU_STATE=? " + "WHERE MENU_ID=? ";
		List<Object> params = new ArrayList<Object>();// 参数
		params.add(data.get("parentId"));
		params.add(data.get("menuName"));
		params.add(data.get("menuUrl"));
		params.add(data.get("pageButton"));
		params.add(data.get("groupId"));
		params.add(data.get("orderId"));
		params.add(data.get("isShow"));
		params.add(data.get("iconUrl"));
		params.add(data.get("target"));
		params.add(data.get("userAttr"));
		params.add(data.get("navState"));
		params.add(data.get("userAttrList"));
		params.add(data.get("menuState"));
		// 条件，此为必须
		if (data.containsKey("menuId")) {
			params.add(data.get("menuId"));
		} else {
			throw new IllegalStateException("没有传入主键MenuID，更新出错");
		}
		return getDataAccess().execUpdate(sql, params.toArray());
	}

	/**
	 * 修改某个父菜单下子菜单的父ID
	 * 
	 * @param updateParentId
	 * @param condtionParentId
	 * @return
	 * @throws Exception
	 */
	public Object updateParentId(int updateParentId, int condtionParentId) throws Exception {
		String sql = "UPDATE META_MAG_MENU SET PARENT_ID=? WHERE PARENT_ID=? ";
		return getDataAccess().execUpdate(sql, updateParentId, condtionParentId);
	}

	/**
	 * 删除一条菜单
	 * 
	 * @param menuId
	 * @return
	 */
	public int deleteMenuById(int menuId) throws Exception {
		return getDataAccess().execUpdate("DELETE FROM META_MAG_MENU WHERE MENU_ID=" + menuId);
	}

	/**
	 * 删除菜单与User表的关联关系
	 * 
	 * @param menuId
	 * @return
	 * @throws Exception
	 */
	public int deleteMenuUser(int menuId) throws Exception {
		return getDataAccess().execUpdate("DELETE FROM META_MAG_USER_MENU WHERE MENU_ID=" + menuId);
	}

	/**
	 * 删除菜单与Role表的关联关系
	 * 
	 * @param menuId
	 * @return
	 * @throws Exception
	 */
	public int deleteMenuRole(int menuId) throws Exception {
		return getDataAccess().execUpdate("DELETE FROM META_MAG_ROLE_MENU WHERE MENU_ID=" + menuId);
	}

	/**
	 * 加载用户有权限的根级菜单。此结果集包括隐藏菜单数据以及没有权限的按钮菜单。
	 * 
	 * @param systemId
	 * @param userId
	 * @return
	 */
	public List<Map<String, Object>> queryRootMenu(int systemId, int userId) {
		String sql = "SELECT  A.MENU_ID,A.PARENT_ID,A.MENU_NAME,A.MENU_TIP,A.MENU_URL, "
				+ "A.PAGE_BUTTON,A.GROUP_ID,A.ORDER_ID,A.IS_SHOW,A.CREATE_DATE, "
				+ "A.ICON_URL,A.TARGET,A.USER_ATTR,A.NAV_STATE,A.USER_ATTR_LIST, "
				+ "A.MENU_STATE,D.FLAG AS ROLE_FLAG "
				+ "FROM META_MAG_MENU A "
				// 关联出没有权限的按钮列表
				+ "LEFT JOIN (SELECT MENU_ID,EXCLUDE_BUTTON,FLAG FROM  META_MAG_USER_MENU  WHERE USER_ID=" + userId
				+ ") D ON A.MENU_ID=D.MENU_ID " + "WHERE A.PARENT_ID=" + Constant.DEFAULT_ROOT_PARENT
				+ " AND A.GROUP_ID=? ";
		if (userId != UserConstant.ADMIN_USERID) {// 如果不是管理员。
			sql += "AND EXISTS (SELECT 1 FROM " + "(SELECT MENU_ID FROM  META_MAG_USER_MENU B WHERE USER_ID=" + userId
					+ " " + "UNION "
					+ "SELECT B.MENU_ID FROM META_MAG_USER_ROLE A,META_MAG_ROLE_MENU B WHERE A.USER_ID=" + userId
					+ " AND B.ROLE_ID=A.ROLE_ID) C WHERE A.MENU_ID=C.MENU_ID) ";
		}
		sql += "ORDER BY A.ORDER_ID ASC ";
		Object[] params = new Object[] { systemId };
		return getDataAccess().queryForList(sql, params);
	}

	/**
	 * 查询用户所有的菜单集合
	 * 
	 * @param userId
	 * @return
	 */
	public List<Map<String, Object>> queryAllMenu(int userId, int sysId) {
		String sql = "SELECT  A.MENU_ID,A.PARENT_ID,A.MENU_NAME,A.MENU_TIP,A.MENU_URL, "
				+ "A.PAGE_BUTTON,A.GROUP_ID,A.ORDER_ID,A.IS_SHOW,A.CREATE_DATE, "
				+ "A.ICON_URL,A.TARGET,A.USER_ATTR,A.NAV_STATE,A.USER_ATTR_LIST, "
				+ "A.MENU_STATE,D.FLAG AS ROLE_FLAG " + "FROM META_MAG_MENU A "
				// 关联出没有权限的按钮列表
				+ "LEFT JOIN (SELECT MENU_ID,EXCLUDE_BUTTON,FLAG FROM  META_MAG_USER_MENU  WHERE USER_ID=" + userId
				+ ") D ON A.MENU_ID=D.MENU_ID " + "WHERE A.GROUP_ID=? ";
		;
		if (userId != UserConstant.ADMIN_USERID) {// 如果不是管理员。
			sql += "AND EXISTS (SELECT 1 FROM " + "(SELECT MENU_ID FROM  META_MAG_USER_MENU B WHERE USER_ID=" + userId
					+ " " + "UNION "
					+ "SELECT B.MENU_ID FROM META_MAG_USER_ROLE A,META_MAG_ROLE_MENU B WHERE A.USER_ID=" + userId
					+ " AND B.ROLE_ID=A.ROLE_ID) C WHERE A.MENU_ID=C.MENU_ID) ";
		}
		sql += "ORDER BY A.ORDER_ID ASC ";
		Object[] params = new Object[] { sysId };
		return getDataAccess().queryForList(sql, params);
	}

	/**
	 * 根据菜单和用户获取当前页面被排除的菜单按钮
	 * 
	 * @param menuId
	 * @param userId
	 * @return
	 */
	public List<String> excludeButton(long menuId, long userId) {
		String sql = "SELECT B.EXCLUDE_BUTTON,-1 ROLE_FLAG FROM META_MAG_USER_ROLE A,META_MAG_ROLE_MENU B WHERE A.USER_ID="
				+ userId
				+ " AND B.MENU_ID="
				+ menuId
				+ " AND B.ROLE_ID=A.ROLE_ID "
				+ "UNION "
				+ "SELECT T.EXCLUDE_BUTTON,FLAG ROLE_FLAG FROM META_MAG_USER_MENU T WHERE T.MENU_ID="
				+ menuId
				+ " AND T.USER_ID=" + userId;
		List<Map<String, Object>> excludes = getDataAccess().queryForList(sql);
		if (excludes != null && excludes.size() > 0) {
			List<String> excludeButtons = new ArrayList<String>();
			for (Map<String, Object> temp : excludes) {
				if (Integer.parseInt(temp.get("ROLE_FLAG").toString()) == MenuConstant.ROLE_FLAG_DELETE_MENU) {
					// 如果是删除类型，说明此用户不存在此菜单按钮权限，不用关心其排除按钮问题。
					return null;
				} else if (Integer.parseInt(temp.get("ROLE_FLAG").toString()) == MenuConstant.ROLE_FLAG_ADD_USER_MENU) {
					// 如果用户关联菜单中存在此MENU_ID,则其排出菜单的权限应有用户关联菜单中为准。
					excludeButtons.clear();
					excludeButtons.add(Convert.toString(temp.get("EXCLUDE_BUTTON")));
				} else {
					excludeButtons.add(Convert.toString(temp.get("EXCLUDE_BUTTON")));
				}
			}
			return excludeButtons;
		}
		return null;
	}

	/**
	 * 判断指定用户是否存在指定的用户权限
	 * 
	 * @param menuId
	 * @param userId
	 * @return
	 */
	public boolean isUserExistsMenu(long menuId, long userId) {
		String sql = "SELECT B.EXCLUDE_BUTTON,-1 ROLE_FLAG FROM META_MAG_USER_ROLE A,META_MAG_ROLE_MENU B WHERE A.USER_ID="
				+ userId
				+ " AND B.MENU_ID="
				+ menuId
				+ " AND B.ROLE_ID=A.ROLE_ID "
				+ "UNION "
				+ "SELECT T.EXCLUDE_BUTTON,FLAG ROLE_FLAG FROM META_MAG_USER_MENU T WHERE T.MENU_ID="
				+ menuId
				+ " AND T.USER_ID=" + userId;
		List<Map<String, Object>> excludes = getDataAccess().queryForList(sql);
		if (excludes != null && excludes.size() > 0) {
			for (Map<String, Object> temp : excludes) {
				if (Integer.parseInt(temp.get("ROLE_FLAG").toString()) == MenuConstant.ROLE_FLAG_DELETE_MENU) {
					// 如果是删除类型，说明此用户不存在此菜单按钮权限。
					return false;
				}
			}
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 按页面输入的信息查询用户信息加载没有该菜单的用户
	 * 
	 * @param queryData Map<String,String> key:输入框的名称即需要查询的字段 value:查询的值
	 * @param page 分页的对象
	 * @return List 查询的结果集

	 */
	public List<Map<String, Object>> queryUserByCondition(Map<String, String> queryData, Page page) {
		Object userName = null;
		Object deptName = null;
		Object stationName = null;
		Object menuIdObj = null;
		String pageSql = null;
		String zoneId = "", zoneSql = "";
		if (queryData != null && queryData.get("zoneId") != null) {
			zoneId = Convert.toString(queryData.get("zoneId"));
			zoneSql = " AND Z.ZONE_ID IN (SELECT B.ZONE_ID FROM META_DIM_ZONE B   START WITH B.ZONE_PAR_ID in ("
					+ zoneId + ") CONNECT BY PRIOR B.ZONE_ID = B.ZONE_PAR_ID union SELECT  F.ZONE_ID"
					+ "  FROM META_DIM_ZONE F WHERE F.ZONE_ID in (" + zoneId + "))";
		}
		StringBuffer sqlSb = new StringBuffer();
		sqlSb.append("SELECT U.USER_ID,U.USER_EMAIL,U.USER_NAMECN,U.STATE,U.USER_MOBILE,");
		sqlSb.append("U.USER_NAMEEN,Z.ZONE_NAME,D.DEPT_NAME,S.STATION_NAME FROM META_MAG_USER U");
		sqlSb.append(" LEFT JOIN META_DIM_ZONE Z ON U.ZONE_ID = Z.ZONE_ID");
		sqlSb.append(" LEFT JOIN META_DIM_USER_DEPT D ON U.DEPT_ID = D.DEPT_CODE");
		sqlSb.append(" LEFT JOIN META_DIM_USER_STATION S ON U.STATION_ID = S.STATION_CODE");
		sqlSb.append(" WHERE 1=1" + zoneSql);
		if (queryData != null && queryData.size() != 0) {
			userName = queryData.get("userName"); // 用户姓名
			// zoneName = queryData.get("zoneName"); //地域
			deptName = queryData.get("deptName");
			stationName = queryData.get("stationName");
			menuIdObj = queryData.get("menuId");
		}// end if qd
		List<Object> params = new ArrayList<Object>();
		if (menuIdObj != null && menuIdObj != "") {
			int menuId = Integer.valueOf(menuIdObj.toString());
			sqlSb.append(" AND U.USER_ID NOT IN(SELECT USER_ID "
					+ " FROM META_MAG_USER_MENU BB WHERE BB.MENU_ID ="
					+ menuId
					+ " AND BB.FLAG = 1 UNION "
					+ " SELECT DISTINCT A.USER_ID FROM META_MAG_USER_ROLE A,META_MAG_USER_ROLE D, META_MAG_ROLE_MENU B,META_MAG_MENU C"
					+ " WHERE A.USER_ID = D.USER_ID AND D.ROLE_ID = B.ROLE_ID AND B.MENU_ID = C.MENU_ID "
					+ " AND NOT EXISTS (SELECT  1 FROM META_MAG_USER_MENU F  WHERE F.MENU_ID= B.MENU_ID AND F.USER_ID = D.USER_ID  AND F.FLAG = 0) "
					+ "AND C.MENU_ID = " + menuId + ")");
		}
		if (userName != null) {
			sqlSb.append(" AND U.USER_NAMECN LIKE " + SqlUtils.allLikeParam(Convert.toString(userName)));
			// params.add("%" + Convert.toString(userName) + "%");
		}
		// if(zoneName!=null){
		// sqlSb.append(" AND Z.ZONE_NAME LIKE ?");
		// params.add("%" + Convert.toString(zoneName) + "%");
		// }
		if (deptName != null) {
			sqlSb.append(" AND D.DEPT_NAME LIKE " + SqlUtils.allLikeParam(Convert.toString(deptName)));
			// params.add("%" + Convert.toString(deptName) + "%");
		}
		if (stationName != null) {
			sqlSb.append(" AND S.STATION_NAME LIKE " + SqlUtils.allLikeParam(Convert.toString(stationName)));
			// params.add("%" + Convert.toString(stationName) + "%");
		}
		if (queryData != null && queryData.get("mguserId") != null) {// 用户ID
			sqlSb.append(" AND U.USER_ID !=? ");
			params.add(Integer.parseInt(String.valueOf(queryData.get("mguserId"))));
		}
		sqlSb.append(" AND U.STATE=" + UserConstant.META_MAG_USER_STATE_ENABLE + " ORDER BY U.USER_SN");
		pageSql = sqlSb.toString();
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}
		return getDataAccess().queryForList(pageSql, params.toArray());
	}

	/**
	 * 按页面输入的信息查询用户信息加载拥有该菜单的用户
	 * 
	 * @param queryData Map<String,String> key:输入框的名称即需要查询的字段 value:查询的值
	 * @param page 分页的对象
	 * @return List 查询的结果集

	 */
	public List<Map<String, Object>> queryMenuUser(Map<String, String> queryData, Page page) {
		String pageSql = null;
		StringBuffer sqlSb = new StringBuffer(
				"SELECT USER_ID,USER_EMAIL,USER_NAMECN,USER_MOBILE,USER_NAMEEN,EXCLUDE_BUTTON from ( ");
		sqlSb.append("SELECT U.USER_ID,  U.USER_EMAIL,  U.USER_NAMECN,  U.USER_MOBILE,   U.STATE,  U.USER_NAMEEN,  MU.EXCLUDE_BUTTON"
				+ "  FROM META_MAG_USER U,META_MAG_USER_MENU MU  WHERE U.USER_ID = MU.USER_ID  AND MU.MENU_ID = ?  AND MU.FLAG = 1"
				+ "  AND U.USER_ID <> ?  AND U.ZONE_ID IN  (SELECT B.ZONE_ID  FROM META_DIM_ZONE B  START WITH B.ZONE_ID = ?"
				+ "  CONNECT BY PRIOR B.ZONE_ID = B.ZONE_PAR_ID)  UNION   SELECT U.USER_ID,  U.USER_EMAIL,  U.USER_NAMECN,"
				+ "  U.USER_MOBILE,  U.STATE, U.USER_NAMEEN,  '' EXCLUDE_BUTTON  FROM META_MAG_USER U"
				+ "  WHERE U.USER_ID IN (SELECT A.USER_ID FROM META_MAG_USER_ROLE A,META_MAG_ROLE_MENU C  WHERE A.ROLE_ID = C.ROLE_ID AND C.MENU_ID = ? "
				+ "  AND NOT EXISTS(SELECT 1 FROM META_MAG_USER_MENU D WHERE D.USER_ID = A.USER_ID AND D.MENU_ID = C.MENU_ID"
				+ "  AND D.MENU_ID = ? AND D.FLAG = 0))  AND U.USER_ID <> ?  AND U.ZONE_ID IN (SELECT B.ZONE_ID  FROM META_DIM_ZONE B START WITH B.ZONE_ID = ? "
				+ "  CONNECT BY PRIOR B.ZONE_ID = B.ZONE_PAR_ID)) TAB ORDER BY TAB.USER_ID ");
		List<Object> params = new ArrayList<Object>();// 参数
		params.add(queryData.get("menuId"));
		params.add(queryData.get("mguserId"));
		params.add(queryData.get("zoneId"));
		params.add(queryData.get("menuId"));
		params.add(queryData.get("menuId"));
		params.add(queryData.get("mguserId"));
		params.add(queryData.get("zoneId"));
		pageSql = sqlSb.toString();
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}
		return getDataAccess().queryForList(pageSql, params.toArray());
	}

	/**
	 * 按页面输入的信息查询角色信息
	 * 
	 * @param page 分页的对象
	 * @param queryData Map<String,String> key:输入框的名称即需要查询的字段 value:查询的值
	 * @return List 查询的结果集

	 */
	public List<Map<String, Object>> queryRoleByCondition(Map<String, String> queryData, Page page) {
		Object roleName = null;
		Object menuIdObj = null;
		String pageSql = null;
		int menuId = 0;
		StringBuffer sql = new StringBuffer();
		List<Object> params = new ArrayList<Object>();
		sql.append("SELECT R.ROLE_ID,R.ROLE_NAME,R.ROLE_DESC,R.ROLE_STATE FROM META_MAG_ROLE R");
		sql.append(" WHERE 1=1");
		if (queryData != null && queryData.size() != 0) {
			roleName = queryData.get("roleName");
			menuIdObj = queryData.get("menuId");
		}
		if (menuIdObj != null) {
			menuId = Integer.valueOf(menuIdObj.toString());
			sql.append(" AND R.ROLE_ID NOT IN(SELECT MR.ROLE_ID FROM META_MAG_ROLE_MENU MR WHERE MR.MENU_ID=" + menuId
					+ ")");
		}
		if (roleName != null) {
			sql.append(" AND R.ROLE_NAME LIKE " + SqlUtils.allLikeParam(Convert.toString(roleName)));
			// params.add("%" + Convert.toString(roleName) + "%");
		}
		sql.append(" ORDER BY R.ROLE_ID");
		pageSql = sql.toString();
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}
		return getDataAccess().queryForList(pageSql, params.toArray());
	}

	/**
	 * 按页面输入的信息查询拥有某菜单角色信息
	 * 
	 * @param queryData Map<String,String> key:输入框的名称即需要查询的字段 value:查询的值
	 * @param page 分页的对象
	 * @return List 查询的结果集

	 */
	public List<Map<String, Object>> queryMenuRole(Map<String, String> queryData, Page page) {
		Object roleName = null;
		Object menuIdObj = null;
		int menuId = 0;
		String pageSql = null;
		StringBuffer sql = new StringBuffer();
		List<Object> params = new ArrayList<Object>();
		sql.append("SELECT R.ROLE_ID,R.ROLE_NAME,R.ROLE_DESC,R.ROLE_STATE,MR.EXCLUDE_BUTTON FROM META_MAG_ROLE R");
		sql.append(" LEFT JOIN META_MAG_ROLE_MENU MR ON R.ROLE_ID=MR.ROLE_ID");
		sql.append(" WHERE 1=1");
		if (queryData != null && queryData.size() != 0) {
			roleName = queryData.get("roleName");
			menuIdObj = queryData.get("menuId");
		}
		if (menuIdObj != null) {
			menuId = Integer.valueOf(menuIdObj.toString());
			sql.append(" AND MR.MENU_ID=" + menuId);
		}
		if (roleName != null) {
			sql.append(" AND R.ROLE_NAME LIKE " + SqlUtils.allLikeParam(Convert.toString(roleName)));
			// params.add("%" + Convert.toString(roleName) + "%");
		}
		sql.append(" ORDER BY R.ROLE_ID");
		pageSql = sql.toString();
		if (page != null) {
			pageSql = SqlUtils.wrapPagingSql(pageSql, page);
		}
		return getDataAccess().queryForList(sql.toString(), params.toArray());
	}

	/**
	 * 根据menuId查询其对应的所有父菜单ID
	 * 
	 * @param menuId
	 * @return

	 */
	public Integer[] queryParentIds(int menuId) {
		String sql = "SELECT T.MENU_ID FROM META_MAG_MENU T WHERE T.MENU_ID<> ? "
				+ "START WITH T.MENU_ID=? CONNECT BY PRIOR T.PARENT_ID=T.MENU_ID ";
		return getDataAccess().queryForPrimitiveArray(sql, int.class, menuId, menuId);

	}

	/**
	 * 根据拖拽结果批量更新菜单
	 * 
	 * @param levelDatas evelData 数据结构如下： [ { menuId, orderId,parentId, } ... ]
	 * @return
	 * @throws Exception
	 */
	public int[] updateBatchLevel(List<Map<String, Object>> levelDatas) throws Exception {
		String sql = "UPDATE META_MAG_MENU SET PARENT_ID=? , ORDER_ID=? " + " WHERE MENU_ID=? ";
		Object[][] proParamses = new Object[levelDatas.size()][3];
		int i = 0;
		for (Map<String, Object> levelData : levelDatas) {
			// Object params=new Object();
			proParamses[i][0] = (Integer.parseInt(levelData.get("parentId").toString()));
			try {
				proParamses[i][1] = (Integer.parseInt(levelData.get("orderId").toString()));
			} catch (Exception e) {
				proParamses[i][1] = 0;
			}
			proParamses[i][2] = (Integer.parseInt(levelData.get("menuId").toString()));
			i++;
		}
		return getDataAccess().execUpdateBatch(sql, proParamses);
	}

	/**
	 * 批量更新Order数据
	 * 
	 * @param orderDatas 排序数据，以menuID作为主键，orderId作为键值
	 * @return
	 * @throws Exception
	 */
	public int[] updateBatchOrder(Map<String, Long> orderDatas) throws Exception {
		String sql = "UPDATE META_MAG_MENU SET  ORDER_ID=? " + " WHERE MENU_ID=? ";
		Object[][] proParamses = new Object[orderDatas.size()][2];
		int i = 0;
		for (Map.Entry<String, Long> orderData : orderDatas.entrySet()) {
			proParamses[i] = new Object[] { orderData.getValue(), orderData.getKey() };
			i++;
		}
		return getDataAccess().execUpdateBatch(sql, proParamses);
	}

	/**
	 * 查询某系统下的所有菜单
	 * 
	 * @param sysId
	 * @return
	 */
	public List<Map<String, Object>> queryMenuBySystemId(int sysId) {
		String sql = "SELECT  A.MENU_ID,A.PARENT_ID,A.MENU_NAME,A.MENU_TIP,A.MENU_URL, "
				+ "A.PAGE_BUTTON,A.GROUP_ID,A.ORDER_ID,A.IS_SHOW,A.CREATE_DATE, "
				+ "A.ICON_URL,A.TARGET,A.USER_ATTR,A.NAV_STATE,A.USER_ATTR_LIST, " + "A.MENU_STATE "
				+ "FROM META_MAG_MENU A WHERE IS_SHOW = 1 AND GROUP_ID=" + sysId + " ORDER By A.MENU_ID";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 查询业务系统最大的序列号
	 * 
	 * @return
	 */
	public int queryMaxGroupSN() {
		String sql = "SELECT MAX(GROUP_SN) FROM META_MENU_GROUP";
		return getDataAccess().queryForInt(sql);
	}

	/**
	 * 查询选择菜单的所有父节点
	 * 
	 * @return
	 */
	public boolean queryAllParentId(int meunId, int userId) {
		String sql = "MERGE INTO META_MAG_USER_MENU A USING (SELECT A.MENU_ID FROM META_MAG_MENU A  START WITH A.MENU_ID = "
				+ meunId
				+ " CONNECT BY PRIOR A.PARENT_ID = A.MENU_ID) B ON (A.MENU_ID = B.MENU_ID AND A.USER_ID = "
				+ userId
				+ ") WHEN MATCHED THEN UPDATE SET A.FLAG=1 "
				+ " WHEN NOT MATCHED THEN INSERT(USER_ID,MENU_ID,EXCLUDE_BUTTON,FLAG) VALUES("
				+ userId
				+ ",B.MENU_ID,'',1)";
		return getDataAccess().execNoQuerySql(sql);
	}
}
