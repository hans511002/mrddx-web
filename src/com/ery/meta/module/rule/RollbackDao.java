package com.ery.meta.module.rule;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.BlobRowListMapper;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;


public class RollbackDao extends MetaBaseDAO {

	/**
	 * 查询回退和调账的rowkey组合规则
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryRollbackList(Map<String, Object> data, Page page) {
		String hbaseColName = MapUtils.getString(data, "TABLE_NAME");
		String sql = "SELECT T.TABLE_NAME,T.ROWKEY_FIELD,T.ROLLBACK_ID,T.HBASE_TABLE_NAME,"
				+ "T.IS_LATN,T.IS_ENABLE,T.ROWKEY_FIELD_ADJUST FROM TB_ROLLBACK_ROWKEY_DEF T WHERE 1=1 ";
		List<Object> params = new ArrayList<Object>();
		if (null != hbaseColName & !"".equals(hbaseColName)) {
			hbaseColName = hbaseColName.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += "AND T.TABLE_NAME LIKE ? ESCAPE '/' OR T.HBASE_TABLE_NAME LIKE ? ESCAPE '/' ";
			params.add("%" + hbaseColName + "%");
			params.add("%" + hbaseColName + "%");
		}
		sql += "ORDER BY T.ROLLBACK_ID DESC";
		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
	}

	/**
	 * 保存回退和调账的rowkey组合规则
	 * 
	 * @param data
	 */
	public void saveRollback(Map<String, Object> data) {
		String sql = "";
		long rollbackId = MapUtils.getIntValue(data, "rollbackId", -1);
		try {
			// 增加
			if (rollbackId == -1) {
				sql = "INSERT INTO TB_ROLLBACK_ROWKEY_DEF(ROLLBACK_ID,TABLE_NAME,ROWKEY_FIELD,"
						+ "HBASE_TABLE_NAME,IS_LATN,IS_ENABLE,ROWKEY_FIELD_ADJUST)" + " VALUES(?,?,?,?,?,?,?)";
				List<Object> params = new ArrayList<Object>();
				rollbackId = queryForNextVal("SEQ_ROLLBACK_ROWKEY_DEF_ID");
				params.add(rollbackId);
				params.add(MapUtils.getString(data, "tableName"));
				params.add(MapUtils.getString(data, "rowkeyField"));
				params.add(MapUtils.getString(data, "hbaseTableName"));
				params.add(MapUtils.getString(data, "isLatn"));
				params.add(MapUtils.getString(data, "isEnable"));
				params.add(MapUtils.getString(data, "rowkeyFieldAdjust"));
				getDataAccess().execNoQuerySql(sql, params.toArray());
			} else {
				// 修改
				sql = "UPDATE TB_ROLLBACK_ROWKEY_DEF SET TABLE_NAME=?,ROWKEY_FIELD=?,"
						+ "HBASE_TABLE_NAME=?,IS_LATN=?,IS_ENABLE=?,ROWKEY_FIELD_ADJUST=? WHERE ROLLBACK_ID=?";
				getDataAccess().execUpdate(sql, Convert.toString(data.get("tableName")),
						Convert.toString(data.get("rowkeyField")), Convert.toString(data.get("hbaseTableName")),
						Convert.toString(data.get("isLatn")), Convert.toString(data.get("isEnable")),
						Convert.toString(data.get("rowkeyFieldAdjust")), rollbackId);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * 删除回退和调账的rowkey组合规则
	 * 
	 * @param id 规则ID
	 */
	public void deleteRollback(String id) {
		String sql = "DELETE FROM TB_ROLLBACK_ROWKEY_DEF WHERE ROLLBACK_ID=?";
		getDataAccess().execNoQuerySql(sql, Convert.toInt(id));
	}
}
