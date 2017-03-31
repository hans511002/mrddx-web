package com.ery.hadoop.hq.qureyrule;

import java.util.List;
import java.util.Map;

import com.ery.base.support.sys.podo.BaseDAO;

public class QueryRuleDAO extends BaseDAO {

	public List<Map<String, Object>> queryQueryRule() {
		String sql = "SELECT QRY_RULE_ID,DATA_SOURCE_ID,HB_TABLE_ID,SCANNER_CACHING_SIZE,SCANNER_READ_CACHE_SIZE,HBASE_TABLE_PARTITION,"
				+ "PARALLEL_NUM,QRY_TYPE,PAGINATION_SIZE,SUPPORT_SORT,DEF_SORT_COLUMN,CLIENT_ROWS_BUFFER_SIZE,LOG_FLAG"
				+ ",QRY_RULE_NAME,QRY_RULE_MSG,CERT_AUTH_FLAG,LOG_FLAG_DETAIL from hb_qry_rule t where t.state=0";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 查询列定义
	 * 
	 * @param qryRuleId
	 * @return
	 */
	public List<Map<String, Object>> queryQueryRuleColumn(String qryRuleId) {
		String sql = "SELECT T1.COL_RULE_ID, T1.QRY_RULE_ID, T2.HB_CLUSTER_NAME,"
				+ "T3.HB_COLUMN_NAME, T3.DEFINE_EN_COLUMN_NAME, T3.DEFINE_CH_COLUMN_NAME,T1.SELECT_COLUMN_CH,T1.SELECT_COLUMN_EN"
				+ ", T1.SORT_FLAG, T1.SORT_COLUMN ,T1.SORT_TYPE,T3.COL_SPLIT,T1.STATISTICS_METHOD ,T1.STATISTICS_FLAG FROM HB_QRY_COLUMN_RULE T1, "
				+ "HB_COLUMN_CLUSTER_INFO T2, HB_COLUMN_INFO T3 WHERE T1.COLUMN_ID = T3.COLUMN_ID "
				+ " AND T3.CLUSTER_ID = T2.CLUSTER_ID AND T1.QRY_RULE_ID = ? order by t1.order_id,T1.COL_RULE_ID";
		return getDataAccess().queryForList(sql, qryRuleId);
	}

	public Map<String, Object> queryQueryRuleById(long id) {
		String sql = "SELECT QRY_RULE_ID,DATA_SOURCE_ID,HB_TABLE_ID,SCANNER_CACHING_SIZE,SCANNER_READ_CACHE_SIZE,HBASE_TABLE_PARTITION,"
				+ "PARALLEL_NUM,QRY_TYPE,PAGINATION_SIZE,SUPPORT_SORT,DEF_SORT_COLUMN,CLIENT_ROWS_BUFFER_SIZE,LOG_FLAG"
				+ ",QRY_RULE_NAME,QRY_RULE_MSG,CERT_AUTH_FLAG,LOG_FLAG_DETAIL from hb_qry_rule t where t.state=0 and t.QRY_RULE_ID=? ";
		return getDataAccess().queryForMap(sql, id);
	}

	public Map<String, Object> queryQueryRuleAllById(long id) {
		String sql = "SELECT QRY_RULE_ID,DATA_SOURCE_ID,HB_TABLE_ID,SCANNER_CACHING_SIZE,SCANNER_READ_CACHE_SIZE,HBASE_TABLE_PARTITION,"
				+ "PARALLEL_NUM,QRY_TYPE,PAGINATION_SIZE,SUPPORT_SORT,DEF_SORT_COLUMN,CLIENT_ROWS_BUFFER_SIZE,LOG_FLAG"
				+ ",QRY_RULE_NAME,QRY_RULE_MSG,CERT_AUTH_FLAG,LOG_FLAG_DETAIL from hb_qry_rule t where t.QRY_RULE_ID=? ";
		return getDataAccess().queryForMap(sql, id);
	}

	public int queryQueryRuleStatus(long id) {
		String sql = "SELECT t.state from hb_qry_rule t where t.QRY_RULE_ID=? ";
		return getDataAccess().queryForIntByNvl(sql, -1, id);
	}

	/**
	 * 根据规则id查询条件
	 * 
	 * @param qureyRuleId
	 *            规则id
	 * @return 条件
	 */
	public List<Map<String, Object>> queryQueryRuleCondition(String qureyRuleId) {
		String sql = "SELECT FILTER_ID, QRY_RULE_ID, MATCH_CONDITION, CONDITION_TYPE, EXPRE_CONDITION, PATTERN_TYPE FROM HB_QRY_RULE_CONDITION WHERE QRY_RULE_ID=?";
		return getDataAccess().queryForList(sql, qureyRuleId);
	}

	/**
	 * 根据规则id更新规则状态
	 * 
	 * @param qureyRuleId
	 * @param status
	 */
	public void updateQueryRuleStatus(String qureyRuleId, int status) {
		String sql = "UPDATE HB_QRY_RULE SET STATE =? WHERE QRY_RULE_ID=?";
		getDataAccess().execUpdate(sql, status, qureyRuleId);
	}

	/**
	 * 更新表对应的所有规则状态
	 * 
	 * @param qureyRuleId
	 * @param status
	 */
	public void updateQueryRuleStatusByHTableId(int htableId, int status) {
		String sql = "UPDATE HB_QRY_RULE SET STATUS=? WHERE HB_TABLE_ID=?";
		getDataAccess().execUpdate(sql, status, htableId);
	}
}
