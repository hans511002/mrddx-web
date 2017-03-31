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



public class FileRuleDao extends MetaBaseDAO {

	/**
	 * 查询文件规则列表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryFileRuleList(Map<String, Object> data, Page page) {
		String hbaseName = MapUtils.getString(data, "HBASE_NAME");
		String sql = "SELECT T.IMP_RUL,T.WRITE_AHEAD_LOG,T.FLUSH_BUFFER,"
				+ "T.HBASE_TABLE_NAME,T.FILE_LINE_FIELDS,T.ROW_KEY_FIELDS,T.ROW_KEY_SUFFIX"
				+ ",T.AREA_EXPR,T.REMARK,T.SKIP_ROWS,T.RULE_ID FROM  TB_FILE_HB_RULE T WHERE 1=1 ";
		List<Object> params = new ArrayList<Object>();
		if (null != hbaseName & !"".equals(hbaseName)) {
			hbaseName = hbaseName.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += "AND T.HBASE_TABLE_NAME LIKE ? ESCAPE '/'";
			params.add("%" + hbaseName + "%");
		}
		sql += "ORDER BY T.RULE_ID DESC";
		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
	}

	/**
	 * 保存文件规则
	 * 
	 * @param data
	 */
	public void saveFileRule(Map<String, Object> data) {
		String sql = "";
		long ruleId = MapUtils.getIntValue(data, "ruleId", -1);
		try {
			// 增加
			if (ruleId == -1) {
				sql = "INSERT INTO TB_FILE_HB_RULE(RULE_ID,IMP_RUL,WRITE_AHEAD_LOG,"
						+ "FLUSH_BUFFER,HBASE_TABLE_NAME,FILE_LINE_FIELDS,ROW_KEY_FIELDS,"
						+ "ROW_KEY_SUFFIX,AREA_EXPR,REMARK,SKIP_ROWS)VALUES(?,?,?,?,?,?,?,?,?,?,?)";
				List<Object> params = new ArrayList<Object>();
				ruleId = queryForNextVal("SEQ_TB_FILE_HB_RULE_ID");
				params.add(ruleId);
				params.add(MapUtils.getString(data, "impRule"));
				params.add(MapUtils.getIntValue(data, "writeLog"));
				params.add(MapUtils.getIntValue(data, "flushBuffer", -1));
				params.add(MapUtils.getString(data, "hbaseName"));
				params.add(MapUtils.getString(data, "fileLineFields"));
				params.add(MapUtils.getString(data, "rowKeyFields"));
				params.add(MapUtils.getString(data, "rowKeySuffix"));
				params.add(MapUtils.getString(data, "areaExpr"));
				params.add(MapUtils.getString(data, "remark"));
				params.add(MapUtils.getIntValue(data, "skipRows", -1));
				getDataAccess().execNoQuerySql(sql, params.toArray());
			} else {
				// 修改
				sql = "UPDATE TB_FILE_HB_RULE SET IMP_RUL=?, WRITE_AHEAD_LOG=?,FLUSH_BUFFER=?,HBASE_TABLE_NAME=?,"
						+ "FILE_LINE_FIELDS=?,ROW_KEY_FIELDS=?,ROW_KEY_SUFFIX=?,AREA_EXPR=?,"
						+ "REMARK=?,SKIP_ROWS=? WHERE RULE_ID = ?";
				getDataAccess().execUpdate(sql, Convert.toString(data.get("impRule")),
						Convert.toInt(data.get("writeLog")), MapUtils.getIntValue(data, "flushBuffer", -1),
						Convert.toString(data.get("hbaseName")), Convert.toString(data.get("fileLineFields")),
						Convert.toString(data.get("rowKeyFields")), Convert.toString(data.get("rowKeySuffix")),
						Convert.toString(data.get("areaExpr")), Convert.toString(data.get("remark")),
						MapUtils.getIntValue(data, "skipRows", -1), ruleId);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * 删除文件规则
	 * 
	 * @param id 规则ID
	 */
	public void deleteFileRule(String id) {
		String sql = "DELETE FROM TB_FILE_HB_RULE WHERE RULE_ID=?";
		getDataAccess().execNoQuerySql(sql, Convert.toInt(id));
	}

}
