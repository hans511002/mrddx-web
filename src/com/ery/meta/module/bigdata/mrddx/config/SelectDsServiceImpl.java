package com.ery.meta.module.bigdata.mrddx.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.common.term.TermConstant;
import com.ery.meta.common.term.TermDataCall;
import com.ery.meta.common.term.TermDataService;

import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

public class SelectDsServiceImpl extends TermDataService {
	@Override
	public Object[][] getData(DataAccess access, Map<String, Object> params, TermDataCall call) throws Exception {
		return new Object[0][];
	}

	public List<Map<String, Object>> queryDataTable(DataAccess access, Map<String, Object> params, Page page) {
		Map classPar = MapUtils.getMap(params, TermConstant.KEY_classRuleParams);
		String kwd = MapUtils.getString(params, TermConstant.KEY_dataTableKwd, "");
		int tableLoaded = MapUtils.getIntValue(params, TermConstant.KEY_tableLoaded, 0);
		String defV = MapUtils.getString(params, TermConstant.KEY_defaultValue, "");
		int dataSourceType = Convert.toInt(params.get("SOURCE_TYPE_ID"), -1);
		if (classPar != null) {
			long sourceCate = Convert.toLong(classPar.get("SOURCE_CATE"), 0);
			String sql = "SELECT A.DATA_SOURCE_ID VAL,A.DATA_SOURCE_NAME VAL_NAME,A.SOURCE_TYPE_ID,B.SOURCE_NAME SOURCE_TYPE_NAME "
					+ ((tableLoaded == 0 && !"".equals(defV)) ? ",(case when A.DATA_SOURCE_ID=" + defV
							+ " then 1 else 0 end) order_key" : "")
					+ " FROM MR_DATA_SOURCE A,MR_SOURCE_TYPE B "
					+ " WHERE A.SOURCE_TYPE_ID=B.SOURCE_TYPE_ID AND A.SOURCE_CATE=" + sourceCate;
			if (dataSourceType != -1) {
				sql += " AND A.SOURCE_TYPE_ID=" + dataSourceType;
			}
			List<Object> param = new ArrayList<Object>();
			if (kwd != null && !"".equals(kwd)) {
				if (!kwd.contains("%") && !kwd.contains("_")) {
					sql += "AND Upper(A.DATA_SOURCE_NAME) LIKE UPPER(?) ";
					param.add("%" + kwd + "%");
				} else {
					kwd = kwd.replaceAll("_", "/_").replaceAll("%", "/%");
					sql += "AND Upper(A.DATA_SOURCE_NAME) LIKE UPPER(?) ESCAPE '/' ";
					param.add("%" + kwd + "%");
				}
			}
			if (tableLoaded == 0 && !"".equals(defV)) {
				sql += " ORDER BY order_key desc,A.DATA_SOURCE_ID desc ";
			} else {
				sql += " ORDER BY DATA_SOURCE_ID desc ";
			}
			if (page != null)
				sql = SqlUtils.wrapPagingSql(sql, page);
			return access.queryForList(sql, param.toArray());
		}
		return null;
	}
}
