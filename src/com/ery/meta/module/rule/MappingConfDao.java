package com.ery.meta.module.rule;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;
import com.ery.meta.common.BlobRowListMapper;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

public class MappingConfDao extends MetaBaseDAO {

	/**
	 * 查询文件规则列表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryMappingConfList(Map<String, Object> data, Page page) {
		String hbaseColName = MapUtils.getString(data, "HB_COL_NAME");
		String sql = "SELECT T.RULE_ID,T.IMP_RULE,T.COL_TYPE,T.ORG_COL_NAME,T.HB_CF_NAME,"
				+ "T.HB_COL_NAME,T.COL_VAL_PREFIX,T.COL_VAL_SUFFIX FROM TB_FILE_HB_RULE_MAPPING T WHERE 1=1 ";
		List<Object> params = new ArrayList<Object>();
		if (null != hbaseColName & !"".equals(hbaseColName)) {
			hbaseColName = hbaseColName.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += "AND T.HB_COL_NAME LIKE ? ESCAPE '/'";
			params.add("%" + hbaseColName + "%");
		}
		sql += "ORDER BY T.RULE_ID DESC";
		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(getDataAccess(), sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
	}

	/**
	 * 保存文件规则
	 * 
	 * @param data
	 */
	public void saveMappingConf(Map<String, Object> data) {
		String sql = "";
		long ruleId = MapUtils.getIntValue(data, "ruleId", -1);
		try {
			// 增加
			if (ruleId == -1) {
				sql = "INSERT INTO TB_FILE_HB_RULE_MAPPING(RULE_ID,IMP_RULE,COL_TYPE,ORG_COL_NAME,HB_CF_NAME,"
						+ "HB_COL_NAME,COL_VAL_PREFIX,COL_VAL_SUFFIX) VALUES(?,?,?,?,?,?,?,?)";
				List<Object> params = new ArrayList<Object>();
				ruleId = queryForNextVal("SEQ_TB_FILE_MAPPING_ID");
				params.add(ruleId);
				params.add(MapUtils.getString(data, "impRule"));
				params.add(MapUtils.getIntValue(data, "colType"));
				params.add(MapUtils.getString(data, "orgColName"));
				params.add(MapUtils.getString(data, "hbCfName"));
				params.add(MapUtils.getString(data, "hbColName"));
				params.add(MapUtils.getString(data, "colValPrefix"));
				params.add(MapUtils.getString(data, "colValSuffix"));
				getDataAccess().execNoQuerySql(sql, params.toArray());
			} else {
				// 修改
				sql = "UPDATE TB_FILE_HB_RULE_MAPPING SET IMP_RULE=?, COL_TYPE=?,ORG_COL_NAME=?,HB_CF_NAME=?,"
						+ "HB_COL_NAME=?,COL_VAL_PREFIX=?,COL_VAL_SUFFIX=? WHERE RULE_ID = ?";
				getDataAccess().execUpdate(sql, Convert.toString(data.get("impRule")),
						Convert.toString(data.get("colType")), Convert.toString(data.get("orgColName")),
						Convert.toString(data.get("hbCfName")), Convert.toString(data.get("hbColName")),
						Convert.toString(data.get("colValPrefix")), Convert.toString(data.get("colValSuffix")), ruleId);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * 删除文件规则
	 * 
	 * @param id
	 *            规则ID
	 */
	public void deleteMappingConf(String id) {
		String sql = "DELETE FROM TB_FILE_HB_RULE_MAPPING WHERE RULE_ID=?";
		getDataAccess().execNoQuerySql(sql, Convert.toInt(id));
	}
}
