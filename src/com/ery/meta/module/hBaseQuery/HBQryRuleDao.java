package com.ery.meta.module.hBaseQuery;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import com.ery.meta.common.BlobRowListMapper;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.web.session.SessionManager;

import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**
 * 

 * 

 * @description 查询规则的 Dao
 * @date 2013-4-29
 */
public class HBQryRuleDao extends MetaBaseDAO {

	public List<Map<String, Object>> queryHBQryRuleInfo() {
		String sql = "SELECT QRY_RULE_ID," + "       DATA_SOURCE_ID," + "       QRY_RULE_NAME" + "  FROM HB_QRY_RULE ";
		sql += " ORDER BY QRY_RULE_NAME DESC";
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"));
	}

	public List<Map<String, Object>> queryHBQryRuleInfo(Map<String, Object> data, Page page) {

		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		String userId = formatUser.get("userId").toString();
		String rolesql = "select count(*) from META_MR_USER_ADDACTION where action_type = 8001 and user_id = " + userId;

		String sql = "SELECT A.QRY_RULE_ID,"
				+ "       A.DATA_SOURCE_ID,"
				+ "       B.hb_table_name,"
				+ "       C.DATA_SOURCE_NAME,"
				+
				// "       E.USER_NAME," +
				"       A.PARALLEL_NUM,"
				+ "       A.HBASE_TABLE_PARTITION,"
				+ "       A.PAGINATION_SIZE,"
				+ "       A.SUPPORT_SORT,"
				+ "       A.SORT_TYPE,"
				+ "       A.DEF_SORT_COLUMN,"
				+ "       A.STATE,"
				+ "       A.SCANNER_CACHING_SIZE,"
				+ "       A.SCANNER_READ_CACHE_SIZE,"
				+ "       A.QRY_TYPE,"
				+ "       A.CLIENT_ROWS_BUFFER_SIZE,"
				+ "       A.LOG_FLAG,"
				+ "       A.LOG_FLAG_DETAIL,"
				+ "       A.QRY_RULE_NAME,"
				+ "       A.QRY_RULE_MSG,"
				+ " decode(m.view_action,null,0,m.view_action) \"VIEW\",decode(m.modify_action,null,0,m.modify_action) modi,decode(m.delete_action,null,0,m.delete_action) del,"
				+ " decode(m.create_user_id," + userId + ",1,0) creater"
				+ "  FROM HB_QRY_RULE A"
				+ "  left join HB_TABLE_INFO B on A.HB_TABLE_ID = B.hb_table_id"
				+ "  inner join HB_DATA_SOURCE C on A.DATA_SOURCE_ID = C.DATA_SOURCE_ID"
				+
				// "  HB_QRY_RULE_USER_REL D" +
				// "  HB_SERVER_USER E" +
				" left join META_MR_USER_AUTHOR m on m.user_id= " + userId
				+ " and m.task_id = a.QRY_RULE_ID and m.task_type =3" + " WHERE 1=1 ";
		// "	AND A.Qry_Rule_Id = D.QRY_RULE_ID ";
		// "	AND D.USER_ID = E.USER_ID";

		if (getDataAccess().queryForInt(rolesql) == 0) {
			sql += " and A.QRY_RULE_ID in (select task_id from META_MR_USER_AUTHOR where task_type=3 and user_id = "
					+ userId + ")";
		}

		List<Object> params = new ArrayList<Object>();

		int ruleId = Convert.toInt(MapUtils.getString(data, "RULE_ID"), -1);
		int sourceId = Convert.toInt(MapUtils.getString(data, "SOURCE_ID"), -1);
		String hbName = MapUtils.getString(data, "HB_NAME");
		String userName = MapUtils.getString(data, "USER_NAME");
		String ruleName = MapUtils.getString(data, "RULE_NAME");
		String sourceName = MapUtils.getString(data, "SOURCE_NAME");

		if (null != sourceName & !"".equals(sourceName)) {
			if (!sourceName.contains("%") && !sourceName.contains("_")) {
				sql += " AND UPPER(C.DATA_SOURCE_NAME) LIKE UPPER(?) ";
				params.add("%" + sourceName + "%");
			} else {
				sourceName = sourceName.replaceAll("_", "/_").replaceAll("%", "/%");
				sql += " AND Upper(C.DATA_SOURCE_NAME) LIKE UPPER(?) ESCAPE '/'  ";
				params.add("%" + sourceName + "%");
			}
		}

		if (null != ruleName & !"".equals(ruleName)) {
			if (!ruleName.contains("%") && !ruleName.contains("_")) {
				sql += " AND UPPER(A.QRY_RULE_NAME) LIKE UPPER(?) ";
				params.add("%" + ruleName + "%");
			} else {
				ruleName = ruleName.replaceAll("_", "/_").replaceAll("%", "/%");
				sql += " AND Upper(A.QRY_RULE_NAME) LIKE UPPER(?) ESCAPE '/'  ";
				params.add("%" + ruleName + "%");
			}
		}

		if (null != hbName & !"".equals(hbName)) {
			if (!hbName.contains("%") && !hbName.contains("_")) {
				sql += " AND UPPER(b.hb_table_name) LIKE UPPER(?) ";
				params.add("%" + hbName + "%");
			} else {
				hbName = hbName.replaceAll("_", "/_").replaceAll("%", "/%");
				sql += " AND Upper(b.hb_table_name) LIKE UPPER(?) ESCAPE '/'  ";
				params.add("%" + hbName + "%");
			}
		}
		if (ruleId != -1) {
			sql += "AND a.QRY_RULE_ID LIKE ? ESCAPE '/'";
			params.add("%" + ruleId + "%");
		}
		if (sourceId != -1) {
			sql += "AND a.DATA_SOURCE_ID LIKE ? ESCAPE '/'";
			params.add("%" + sourceId + "%");
		}
		if (null != userName && !"".equals(userName)) {
			sql += " AND A.QRY_RULE_ID IN ( SELECT QRY_RULE_ID FROM HB_QRY_RULE_USER_REL WHERE user_id IN ";
			sql += "(SELECT USER_ID FROM HB_SERVER_USER WHERE 1=1 ";
			if (!userName.contains("%") && !userName.contains("_")) {
				sql += " AND UPPER(USER_NAME) LIKE UPPER(?))) ";
				params.add("%" + userName + "%");
			} else {
				userName = userName.replaceAll("_", "/_").replaceAll("%", "/%");
				sql += " AND  UPPER(USER_NAME) LIKE UPPER(?) ESCAPE '/')) ";
				params.add("%" + userName + "%");
			}
		}

		sql += " ORDER BY QRY_RULE_ID DESC";

		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
	}

	/**
	 * 查询列规则列表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryColumnInfo(Map<String, Object> data, String qryRuleId, Page page) {

		String sql = "SELECT F.*, C.SELECT_COLUMN_EN, C.STATISTICS_METHOD , C.STATISTICS_FLAG "
				+ "			from ( SELECT T.COLUMN_ID COLUMN_IDS," + "                         T.CLUSTER_ID,"
				+ "                         T.HB_COLUMN_NAME," + "                         T.HB_TABLE_ID,"
				+ "                         T.DEFINE_EN_COLUMN_NAME,"
				+ "                         T.DEFINE_CH_COLUMN_NAME," + "                         T.ORDER_ID,"
				+ "                         A.DEFINE_CLUSTER_NAME FROM HB_COLUMN_INFO T "
				+ "                   LEFT JOIN HB_COLUMN_CLUSTER_INFO A "
				+ "                          ON A.CLUSTER_ID = T.CLUSTER_ID "
				+ "                   WHERE T.HB_TABLE_ID =";
		List<Object> params = new ArrayList<Object>();

		int hbTableId = Convert.toInt(MapUtils.getString(data, "HB_TABLE_ID"), -1);
		if (hbTableId != -1) {
			sql += hbTableId;
		}
		// int sourceId = Convert.toInt(MapUtils.getString(data, "SOURCE_ID"),
		// -1);
		// String hbName = MapUtils.getString(data, "HB_NAME");

		/*
		 * if(null != hbName & !"".equals(hbName)){ sql +=
		 * "AND b.hb_table_name LIKE ? ESCAPE '/'"; params.add("%" + hbName +
		 * "%"); }
		 */
		/*
		 * if(sourceId!=-1){ sql += "AND a.DATA_SOURCE_ID LIKE ? ESCAPE '/'";
		 * params.add("%" + sourceId + "%"); }
		 */
		String columnSort = MapUtils.getString(data, "_COLUMN_SORT");
		if (columnSort != null && !"".equals(columnSort)) {
			sql += " ORDER BY " + columnSort + ") F";
		} else {
			sql += " ORDER BY T.COLUMN_ID DESC) F";
		}

		int ruleid = Convert.toInt(qryRuleId, -1);
		sql += " LEFT JOIN (select COLUMN_ID, SELECT_COLUMN_EN, STATISTICS_METHOD ,STATISTICS_FLAG from "
				+ "                     HB_QRY_COLUMN_RULE B " + "                     where B.QRY_RULE_ID = " + ruleid
				+ ") C " + "        ON  C.COLUMN_ID = F.COLUMN_IDS ";

		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
	}

	/**
	 * 保存规则信息
	 * 
	 * @param data
	 * @return
	 */
	public long saveQryRuleInfo(Map<String, Object> data) {
		long pk = super.queryForNextVal("SEQ_QRY_RULE_ID");
		String sql = "INSERT INTO HB_QRY_RULE(QRY_RULE_ID," + "       DATA_SOURCE_ID," + "       HB_TABLE_ID,"
				+ "       SCANNER_CACHING_SIZE," + "       SCANNER_READ_CACHE_SIZE," + "       HBASE_TABLE_PARTITION,"
				+ "       PARALLEL_NUM," + "       QRY_TYPE," + "       PAGINATION_SIZE," + "       SUPPORT_SORT,"
				+ "       DEF_SORT_COLUMN," + "       CLIENT_ROWS_BUFFER_SIZE," + "       LOG_FLAG," + "       STATE,"
				+ "       QRY_RULE_NAME," + "       QRY_RULE_MSG,CERT_AUTH_FLAG,SORT_TYPE,LOG_FLAG_DETAIL,DEPART_TYPE)"
				+ "     VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		getDataAccess().execUpdate(sql, pk, Convert.toLong(data.get("DATA_SOURCE_ID")),
				Convert.toLong(data.get("HB_TABLE_ID")), Convert.toLong(data.get("SCANNER_CACHING_SIZE"), -1),
				Convert.toLong(data.get("SCANNER_READ_CACHE_SIZE"), -1),
				Convert.toString(data.get("HBASE_TABLE_PARTITION"), ""), Convert.toInt(data.get("PARALLEL_NUM"), -1),
				Convert.toInt(data.get("QRY_TYPE")), Convert.toInt(data.get("PAGINATION_SIZE"), 0),
				Convert.toInt(data.get("SUPPORT_SORT")), Convert.toString(data.get("DEF_SORT_COLUMN")),
				Convert.toLong(data.get("CLIENT_ROWS_BUFFER_SIZE"), -1), Convert.toLong(data.get("LOG_FLAG")),
				Convert.toInt(data.get("STATE")), Convert.toString(data.get("RULE_NAME")), "查询说明",
				MapUtils.getIntValue(data, "CERT_AUTH_FLAG"), MapUtils.getIntValue(data, "SORT_TYPE"),
				MapUtils.getIntValue(data, "LOG_FLAG_DETAIL"), MapUtils.getIntValue(data, "DEPART_TYPE"));
		return pk;
	}

	/**
	 * 保存规则信息
	 * 
	 * @param data
	 * @return
	 */
	public void updateRuleInfo(Map<String, Object> data, long qryId) {
		String sql = "update HB_QRY_RULE set " + "       DATA_SOURCE_ID=?," + "       HB_TABLE_ID=?,"
				+ "       SCANNER_CACHING_SIZE=?," + "       SCANNER_READ_CACHE_SIZE=?,"
				+ "       HBASE_TABLE_PARTITION=?," + "       PARALLEL_NUM=?," + "       QRY_TYPE=?,"
				+ "       DEPART_TYPE=?," + "       PAGINATION_SIZE=?," + "       SUPPORT_SORT=?,"
				+ "       DEF_SORT_COLUMN=?," + "       CLIENT_ROWS_BUFFER_SIZE=?," + "       LOG_FLAG=?,"
				+ "       STATE=?," + "       QRY_RULE_NAME=?,"
				+ "       QRY_RULE_MSG=?,CERT_AUTH_FLAG=?,SORT_TYPE = ?,LOG_FLAG_DETAIL=? where QRY_RULE_ID=?";
		getDataAccess().execUpdate(sql, Convert.toLong(data.get("DATA_SOURCE_ID")),
				Convert.toLong(data.get("HB_TABLE_ID")), Convert.toLong(data.get("SCANNER_CACHING_SIZE"), -1),
				Convert.toLong(data.get("SCANNER_READ_CACHE_SIZE"), -1),
				Convert.toString(data.get("HBASE_TABLE_PARTITION"), ""), Convert.toInt(data.get("PARALLEL_NUM"), -1),
				Convert.toInt(data.get("QRY_TYPE")), Convert.toInt(data.get("DEPART_TYPE")),
				Convert.toInt(data.get("PAGINATION_SIZE"), 0), Convert.toInt(data.get("SUPPORT_SORT")),
				Convert.toString(data.get("DEF_SORT_COLUMN")), Convert.toLong(data.get("CLIENT_ROWS_BUFFER_SIZE"), -1),
				Convert.toLong(data.get("LOG_FLAG"), 0), Convert.toInt(data.get("STATE")),
				Convert.toString(data.get("RULE_NAME")), "查询说明", MapUtils.getIntValue(data, "CERT_AUTH_FLAG"),
				MapUtils.getIntValue(data, "SORT_TYPE"), MapUtils.getIntValue(data, "LOG_FLAG_DETAIL", 1), qryId);
	}

	/**
	 * 保存列分类
	 * 
	 * @param data
	 * @param string
	 */
	public void saveColumn(Map<String, Object> data, int orderId, long sortColumnId, Map<String, Object> map,
			String selectEnColumnName, String selectCHColumnName, String selectEnColumnMethod, String selectEnColumnFlag) {
		String sql = "INSERT INTO HB_QRY_COLUMN_RULE(COL_RULE_ID,QRY_RULE_ID,COLUMN_ID,SORT_FLAG,SORT_COLUMN,SORT_TYPE,ORDER_ID,SELECT_COLUMN_EN,SELECT_COLUMN_CH, STATISTICS_METHOD,STATISTICS_FLAG)"
				+ " VALUES(?,?,?,?,?,?,?,?,?,?,?)";
		int sortType = 0;
		int sortFlag = 0;
		String sortColumn = "";
		if (sortColumnId != -1 && sortColumnId == MapUtils.getLongValue(data, "COLUMN_ID")) {
			sortType = MapUtils.getIntValue(map, "SORT_TYPE");
			sortFlag = MapUtils.getIntValue(map, "SUPPORT_SORT");
			sortColumn = MapUtils.getString(map, "DEF_SORT_COLUMN", "");
		}

		getDataAccess().execUpdate(sql, queryForNextVal("SEQ_COL_RULE_ID"), Convert.toLong(data.get("QRY_RULE_ID")),
				Convert.toLong(data.get("COLUMN_ID")), sortFlag, sortColumn, sortType, orderId, selectEnColumnName,
				selectCHColumnName, selectEnColumnMethod, selectEnColumnFlag);
	}

	/**
	 * 保存用户访问权限信息
	 * 
	 * @param data
	 */
	public void saveAuthority(Map<String, Object> data) {
		if (data.get("USER_ID") == null || "".equals(data.get("USER_ID"))) {
			return;
		}
		String sql = "INSERT INTO HB_QRY_RULE_USER_REL(USER_ID,QRY_RULE_ID)" + " VALUES(?,?)";
		getDataAccess().execUpdate(sql, Convert.toLong(data.get("USER_ID")), Convert.toLong(data.get("QRY_RULE_ID")));
	}

	/**
	 * 保存逻辑条件信息
	 * 
	 * @param data
	 */
	public void saveLogic(Map<String, Object> data) {
		String sql = "INSERT INTO HB_QRY_RULE_CONDITION(FILTER_ID,QRY_RULE_ID,EXPRE_CONDITION,CONDITION_TYPE,ORDER_ID)"
				+ " VALUES(?,?,?,?,?)";
		getDataAccess().execUpdate(sql, queryForNextVal("SEQ_FILTER_ID"), Convert.toLong(data.get("QRY_RULE_ID")),
				Convert.toString(data.get("EXPRE_CONDITION")), 0, Convert.toInt(data.get("ORDER_ID"))

		);
	}

	/**
	 * 保存逻辑条件信息
	 * 
	 * @param data
	 */
	public void saveRex(Map<String, Object> data) {
		String sql = "INSERT INTO HB_QRY_RULE_CONDITION(FILTER_ID,QRY_RULE_ID,MATCH_CONDITION,CONDITION_TYPE,EXPRE_CONDITION,ORDER_ID,PATTERN_TYPE)"
				+ " VALUES(?,?,?,?,?,?,?)";
		getDataAccess().execUpdate(sql, queryForNextVal("SEQ_FILTER_ID"), Convert.toLong(data.get("QRY_RULE_ID")),
				Convert.toString(data.get("MATCH_CONDITION")), 1, Convert.toString(data.get("EXPRE_CONDITION")),
				Convert.toInt(data.get("ORDER_ID")), Convert.toInt(data.get("PATTERN_TYPE"))

		);
	}

	/**
	 * 通过ID查询规则
	 * 
	 * @param id
	 * @return
	 */
	public Map<String, Object> queryColumnInfoById(long id) {
		String sql = "SELECT * FROM HB_QRY_RULE WHERE QRY_RULE_ID = ?";
		Map<String, Object> qryRule = getDataAccess().queryForMap(sql, id);
		return qryRule;
	}

	/**
	 * 根据查询规则ID查询相关的列
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> queryColumnInfosByQryId(long qryId) {
		String sql = "SELECT * FROM HB_QRY_COLUMN_RULE WHERE QRY_RULE_ID =?";
		return getDataAccess().queryForList(sql, qryId);
	}

	/**
	 * 根据查询规则ID查询相关的列
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> queryColumnInfoByQryId(long qryId) {
		String sql = "SELECT t1.column_id, t1.SELECT_COLUMN_EN FROM HB_QRY_COLUMN_RULE t1,HB_COLUMN_INFO t2 WHERE  t1.column_id = t2.column_id and  t1.QRY_RULE_ID = ?";
		return getDataAccess().queryForList(sql, qryId);
	}

	/**
	 * 根据查询规则ID查询正则表达式条件
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> getRexByQryId(long qryId) {
		String sql = "SELECT * FROM HB_QRY_RULE_CONDITION WHERE QRY_RULE_ID = ? AND CONDITION_TYPE=1";
		return getDataAccess().queryForList(sql, qryId);
	}

	/**
	 * 根据查询规则ID查询逻辑表达式条件
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> getLogicByQryId(long qryId) {
		String sql = "SELECT FILTER_ID,QRY_RULE_ID,MATCH_CONDITION,CONDITION_TYPE,EXPRE_CONDITION,ORDER_ID,PATTERN_TYPE FROM HB_QRY_RULE_CONDITION WHERE QRY_RULE_ID = ? AND CONDITION_TYPE=0";
		return getDataAccess().queryForList(sql, qryId);
	}

	/**
	 * 删除相关列信息
	 * 
	 * @param qryId
	 */
	public void deleteColumn(long qryId) {
		String sql = "DELETE HB_QRY_COLUMN_RULE WHERE QRY_RULE_ID = ? ";
		getDataAccess().execNoQuerySql(sql, qryId);
	}

	/**
	 * 删除相关权限问题
	 * 
	 * @param qryId
	 */
	public void deleteAuthority(long qryId) {
		String sql = "DELETE HB_QRY_RULE_USER_REL WHERE QRY_RULE_ID = ? ";
		getDataAccess().execNoQuerySql(sql, qryId);
	}

	/**
	 * 删除相关逻辑问题
	 * 
	 * @param qryId
	 */
	public void deleteLogic(long qryId) {
		String sql = "DELETE HB_QRY_RULE_CONDITION WHERE QRY_RULE_ID = ? AND CONDITION_TYPE =0 ";
		getDataAccess().execNoQuerySql(sql, qryId);
	}

	/**
	 * 删除相关正则问题
	 * 
	 * @param qryId
	 */
	public void deleteRex(long qryId) {
		String sql = "DELETE HB_QRY_RULE_CONDITION WHERE QRY_RULE_ID = ? AND CONDITION_TYPE=1";
		getDataAccess().execNoQuerySql(sql, qryId);
	}

	/**
	 * 通过qryId获得规则信息
	 * 
	 * @param qryId
	 * @return
	 */
	public Map<String, Object> getQyrRuleInfo(long qryId) {
		String sql = "SELECT * FROM HB_QRY_RULE WHERE QRY_RULE_ID=? ";
		return getDataAccess().queryForMap(sql, qryId);
	}

	/**
	 * 通过 qryId获得权限关联问题
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> getAuthorityInfos(long qryId) {
		String sql = "SELECT * FROM HB_QRY_RULE_USER_REL WHERE QRY_RULE_ID=?";
		return getDataAccess().queryForList(sql, qryId);
	}

	/**
	 * 删除查询规则
	 * 
	 * @param qryId
	 */
	public void deleteQryRuleInfo(long qryId) {
		String sql = "DELETE HB_QRY_RULE WHERE QRY_RULE_ID = ? ";
		getDataAccess().execNoQuerySql(sql, qryId);
	}

	/**
	 * 根据规则ID取得列集合
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> queryEnByQryId(long qryId) {
		String sql = "SELECT T.DEFINE_EN_COLUMN_NAME FROM HB_COLUMN_INFO T "
				+ "INNER JOIN  HB_QRY_COLUMN_RULE B  ON T.COLUMN_ID = B.COLUMN_ID WHERE B.QRY_RULE_ID = ?";
		return getDataAccess().queryForList(sql, qryId);
	}

	/**
	 * 根据规则ID取得表达式集合
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> queryConditionMapByQryId(long qryId) {
		String sql = "SELECT DISTINCT C.EXPRE_CONDITION EXPRE_CONDITION ,C.MATCH_CONDITION MATCH_CONDITION FROM HB_QRY_COLUMN_RULE B "
				+ " LEFT JOIN HB_QRY_RULE_CONDITION	C ON B.QRY_RULE_ID = C.QRY_RULE_ID	WHERE B.QRY_RULE_ID = ?";
		return getDataAccess().queryForList(sql, qryId);
	}

	/**
	 * 通过列ID获取列ID与英文名称的集合
	 * 
	 * @param sortColumn
	 * @return
	 */
	public Map<String, Object> getQryColumnById(long columnId) {
		String sql = "SELECT COLUMN_ID,DEFINE_EN_COLUMN_NAME  FROM HB_COLUMN_INFO WHERE COLUMN_ID = ?";
		return getDataAccess().queryForMap(sql, columnId);
	}

	/**
	 * 查看Hbase表的状态
	 * 
	 * @param tableId
	 * @return
	 */
	public int checkTableState(long tableId) {
		String sql = "SELECT count(*) FROM HB_TABLE_INFO WHERE HB_TABLE_ID = ? AND HB_STATUS !=0";
		return getDataAccess().queryForInt(sql, tableId);
	}

	/**
	 * 根据表ID获取列信息
	 * 
	 * @param tableid
	 * @return
	 */
	public List<Map<String, Object>> getQryColumnInfoByTableId(long tableid) {
		String sql = "	select T.COLUMN_ID, " + "T.HB_COLUMN_NAME, " + "T.CLUSTER_ID, " + "T.DEFINE_EN_COLUMN_NAME, "
				+ "T.DEFINE_CH_COLUMN_NAME, " + "T.COL_SPLIT, " + "T.ORDER_ID " + "from HB_COLUMN_INFO T "
				+ "WHERE HB_TABLE_ID = ?";
		return getDataAccess().queryForList(sql, tableid);
	}
}
