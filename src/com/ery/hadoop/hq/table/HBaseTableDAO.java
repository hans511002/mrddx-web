package com.ery.hadoop.hq.table;

import java.util.Map;

import com.ery.base.support.sys.podo.BaseDAO;

public class HBaseTableDAO extends BaseDAO {
	public Map<String, Object> queryTableInfo(int hbTableId) {
		String sql = "select HB_TABLE_ID, HB_TABLE_NAME, DATA_SOURCE_ID, HB_TABLE_MSG from HB_TABLE_INFO where HB_TABLE_ID=?";
		return getDataAccess().queryForMap(sql, hbTableId);
	}

	/**
	 * 根据查询规则ID获取表信息
	 * 
	 * @param queryRuleId
	 * @return
	 */
	public Map<String, Object> queryTableInfoByQryId(String queryId) {
		String sql = "SELECT T2.HB_TABLE_NAME, T2.DATA_SOURCE_ID, T2.HB_TABLE_ID, T2.HB_STATUS FROM HB_QRY_RULE T1, HB_TABLE_INFO T2 WHERE T2.HB_TABLE_ID = T1.HB_TABLE_ID AND T2.HB_STATUS =0 AND T1.QRY_RULE_ID = ?";
		return getDataAccess().queryForMap(sql, queryId);
	}

	// public Map<String, Object> queryTableInfoByQryRuleId(String queryRuleId)
	// {
	// String sql =
	// "SELECT A.HB_TABLE_ID, A.HB_TABLE_NAME, A.DATA_SOURCE_ID, A.HB_TABLE_MSG FROM HB_TABLE_INFO A, HB_QRY_RULE B WHERE A.HB_TABLE_ID = B.HB_TABLE_ID AND B.QRY_RULE_ID=?";
	// return getDataAccess().queryForMap(sql, queryRuleId);
	// }

	/**
	 * 更新表的状态
	 * 
	 * @param hbTableId
	 * @param status
	 */
	public void updateTableStatus(int hbTableId, int status) {
		String sql = "UPDATE HB_TABLE_INFO SET HB_STATUS=? WHERE HB_TABLE_ID=?";
		getDataAccess().execUpdate(sql, status, hbTableId);
	}
}