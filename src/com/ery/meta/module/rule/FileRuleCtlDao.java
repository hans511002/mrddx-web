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


public class FileRuleCtlDao extends MetaBaseDAO {

	/**
	 * 查询动态入库映射列表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryFileRuleCtlList(Map<String, Object> data, Page page) {
		String hbaseName = MapUtils.getString(data, "HBASE_NAME");
		String sql = "SELECT T.IMP_RULE,T.WRITE_AHEAD_LOG,T.FLUSH_BUFFER,"
				+ "T.HBASE_TABLE_NAME,T.DEST_HBASE_COLUMN,T.ROW_KEY_FIELDS,T.HBASE_COLUMN_SUFFIX"
				+ ",T.AREA_EXPR,T.REMARK,T.SKIP_ROWS,T.RULE_ID,T.HBASE_CF_NAME,T.HBASE_COL_NAME FROM  TB_FILE_HB_RULE_CTL T WHERE 1=1 ";
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
	 * 保存动态入库映射
	 * 
	 * @param data
	 */
	public void saveFileRuleCtl(Map<String, Object> data) {
		String sql = "";
		long ruleId = MapUtils.getIntValue(data, "ruleId", -1);
		try {
			// 增加
			if (ruleId == -1) {
				sql = "INSERT INTO TB_FILE_HB_RULE_CTL(RULE_ID,IMP_RULE,WRITE_AHEAD_LOG,"
						+ "FLUSH_BUFFER,HBASE_TABLE_NAME,DEST_HBASE_COLUMN,ROW_KEY_FIELDS,"
						+ "HBASE_COLUMN_SUFFIX,AREA_EXPR,REMARK,SKIP_ROWS,HBASE_CF_NAME,HBASE_COL_NAME)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)";
				List<Object> params = new ArrayList<Object>();
				ruleId = queryForNextVal("SEQ_TB_FILE_CTL_ID");
				params.add(ruleId);
				params.add(MapUtils.getString(data, "impRule"));
				params.add(MapUtils.getIntValue(data, "writeLog"));
				params.add(MapUtils.getIntValue(data, "flushBuffer", -1));
				params.add(MapUtils.getString(data, "hbaseName"));
				params.add(MapUtils.getString(data, "destHbaseColumn"));
				params.add(MapUtils.getString(data, "rowKeyFields"));
				params.add(MapUtils.getString(data, "hbaseColumnSuffix"));
				params.add(MapUtils.getString(data, "areaExpr"));
				params.add(MapUtils.getString(data, "remark"));
				params.add(MapUtils.getIntValue(data, "skipRows", -1));
				params.add(MapUtils.getString(data, "hbCfName"));
				params.add(MapUtils.getString(data, "hbColName"));
				getDataAccess().execNoQuerySql(sql, params.toArray());
			} else {
				// 修改
				sql = "UPDATE TB_FILE_HB_RULE_CTL SET IMP_RULE=?, WRITE_AHEAD_LOG=?,FLUSH_BUFFER=?,HBASE_TABLE_NAME=?,"
						+ "DEST_HBASE_COLUMN=?,ROW_KEY_FIELDS=?,HBASE_COLUMN_SUFFIX=?,AREA_EXPR=?,"
						+ "REMARK=?,SKIP_ROWS=?,HBASE_CF_NAME=?,HBASE_COL_NAME=? WHERE RULE_ID = ?";
				getDataAccess().execUpdate(sql, Convert.toString(data.get("impRule")),
						Convert.toInt(data.get("writeLog")), MapUtils.getIntValue(data, "flushBuffer", -1),
						Convert.toString(data.get("hbaseName")), Convert.toString(data.get("destHbaseColumn")),
						Convert.toString(data.get("rowKeyFields")), Convert.toString(data.get("hbaseColumnSuffix")),
						Convert.toString(data.get("areaExpr")), Convert.toString(data.get("remark")),
						MapUtils.getIntValue(data, "skipRows", -1), Convert.toString(data.get("hbCfName")),
						Convert.toString(data.get("hbColName")), ruleId);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * 删除动态入库映射
	 * 
	 * @param id 映射ID
	 */
	public void deleteFileRuleCtl(String id) {
		String sql = "DELETE FROM TB_FILE_HB_RULE_CTL WHERE RULE_ID=?";
		getDataAccess().execNoQuerySql(sql, Convert.toInt(id));
	}

}
