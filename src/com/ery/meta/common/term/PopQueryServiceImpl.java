package com.ery.meta.common.term;

import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.utils.Convert;


public class PopQueryServiceImpl extends TermDataService {
	/**
	 * 查询数据表格
	 * 
	 * @param access 数据库连接
	 * @param map 条件对象
	 * @return
	 * @throws Exception
	 */
	public List<Map<String, Object>> queryDataTable(DataAccess access, Map<String, Object> map, Page page)
			throws Exception {
		String sql = Convert.toString(map.get("QUERY_SQL"));
		String kwd = Convert.toString(map.get("_KEY_WORD"), "");
		String condKStr = Convert.toString(map.get("COND_KEY"), "");
		List<Object> defV = (List<Object>) map.get("DEFAULT_VAL");
		Map<String, Object> hiddenVal = (Map<String, Object>) map.get("HIDDEN_VAL");
		if (!"".equals(condKStr)) {
			for (String k : condKStr.split(",")) {
				String v = Convert.toString(map.get(k), "");
				sql = sql.replace("\\{" + k + "\\}", "'" + v + "'");
			}
		}
		if (hiddenVal != null && hiddenVal.size() > 0) {
			for (String k : hiddenVal.keySet()) {
				String v = Convert.toString(hiddenVal.get(k), "");
				sql = sql.replace("\\{" + k + "\\}", "'" + v + "'");
			}
		}
		if (!"".equals(kwd) || (defV != null && defV.size() > 0)) {
			sql = "SELECT * FROM (" + sql + ") WHERE 1=1 ";
			if ((defV != null && defV.size() > 0)) {
				sql += " AND UPPER(VAL) IN" + SqlUtils.inParamDeal(defV);
			}
			if (!"".equals(kwd)) {
				kwd = kwd.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%").toUpperCase();
				sql += " AND (UPPER(VAL) like '%" + kwd + "%' ";
				sql += " OR UPPER(VAL_NAME) like '%" + kwd + "%' ESCAPE '/')";
			}
		}
		sql += " ORDER BY VAL";
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return access.queryForList(sql);
	}
}
