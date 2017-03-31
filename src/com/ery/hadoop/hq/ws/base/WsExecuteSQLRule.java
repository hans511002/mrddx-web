package com.ery.hadoop.hq.ws.base;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.ery.hadoop.hq.ws.app.MetaWSContext;
import com.ery.hadoop.hq.ws.utils.MetaWsDataUtil;
import com.ery.hadoop.hq.ws.utils.MetaWsShareConstant;
import com.ery.hadoop.hq.ws.utils.WsRequest;
import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.sys.DataSourceManager;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**

 * 

 * @description SQL规则执行实现
 * @date 12-10-26 -
 * @modify
 * @modifyDate -
 */
public class WsExecuteSQLRule extends MetaWsExec {

	public boolean before(WsRequest req, StringBuffer buffer) throws Exception {
		// String ruleCode = req.getRuleCode();
		// Map<String, Object> rule = MetaWSContext.getRuleInfo(ruleCode);
		// Map<String, Map<String, Object>> params =
		// MetaWSContext.getParams(ruleCode);
		// Map<String, Object> reqPar = req.getSimpleMap();// 获取请求的map对象
		// if (params != null && params.size() == 1 && reqPar == null) {
		// // 如果参数定义只有一个，则尝试从简单参数里面取
		// reqPar = new HashMap<String, Object>();
		// for (String key : params.keySet())
		// reqPar.put(key, req.getBaseObject());
		// }
		//
		// String sql = rule.get("WS_STR").toString();
		// Matcher mcher =
		// Pattern.compile("\\{([A-Z_][A-Z0-9_]*)\\}").matcher(sql);
		// List<Object> pars = new ArrayList<Object>();
		// boolean fd = mcher.find();
		// if (fd && params != null) {
		// StringBuffer sqlBuffer = new StringBuffer();
		// do {
		// String pn = mcher.group(1);
		// Map<String, Object> pinfo = params.get(pn);
		// if (pinfo != null) {
		// int isrequire = Convert.toInt(pinfo.get("IS_REQUIRE"));
		// Object defV = pinfo.get("DEFAULT_VALUE");
		// int dataType = Convert.toInt(pinfo.get("DATA_TYPE"), 0);
		// Object pv = null;
		// if (reqPar.containsKey(pn)) { // 传递的参数包括在其中
		// pv = reqPar.get(pn);
		// } else {
		// // 未传参数，且参数定义非必填，则取默认值代替
		// if (isrequire == 0 && defV != null) {
		// if (dataType == MetaWsShareConstant.DATA_TYPE_NUMBER) {
		// if (pv.toString().contains("."))
		// pv = Convert.toDouble(defV);
		// else
		// pv = Convert.toLong(defV);
		// } else {
		// pv = Convert.toString(defV);
		// }
		// } else {
		// buffer.append("无法获取参数[" + pn + "]!");
		// return false;
		// }
		// }
		// if (dataType == MetaWsShareConstant.DATA_TYPE_VARCHAR || dataType ==
		// MetaWsShareConstant.DATA_TYPE_NUMBER) {
		// mcher.appendReplacement(sqlBuffer, "?");// 普通参数
		// pars.add(pv);
		// } else {
		// if (dataType == MetaWsShareConstant.DATA_TYPE_FIELDNAME || dataType
		// == MetaWsShareConstant.DATA_TYPE_TABLENAME
		// || dataType == MetaWsShareConstant.DATA_TYPE_TABLEUSER) {
		// if (pv instanceof String && (pv.toString().contains(" ") ||
		// pv.toString().contains(";"))) {
		// buffer.append("参数[" + pn + "]用于'表/字段/表用户名',取得的参数值[" + pv + "]不合法!");
		// return false;
		// }
		// mcher.appendReplacement(sqlBuffer, pv.toString());
		// } else {
		// mcher.appendReplacement(sqlBuffer, "'" + pv.toString() + "'");
		// }
		// }
		// } else {
		// buffer.append("系统错误,发现SQL中有参数未定义!");
		// return false;
		// }
		// fd = mcher.find();
		// } while (fd);
		// MetaWSContext.setSessionValue(MetaWSContext.SQL_KEY,
		// sqlBuffer.toString());
		// } else {
		// MetaWSContext.setSessionValue(MetaWSContext.SQL_KEY, sql);
		// }
		// MetaWSContext.setSessionValue(MetaWSContext.PARAMS_KEY, pars);
		return true;
	}

	@SuppressWarnings("unchecked")
	public String execute(WsRequest req, StringBuffer logBuffer) throws Exception {
		String ruleCode = req.getRuleCode();
		Map<String, Object> rule = MetaWSContext.getRuleInfo(ruleCode);
		int ruleType = Convert.toInt(rule.get("RULE_TYPE"));
		int returnType = Convert.toInt(rule.get("RETURN_TYPE"));
		String dsstr = rule.get("SOURCE_STR").toString();
		String sql = Convert.toString(MetaWSContext.getSessionValue(MetaWSContext.SQL_KEY));
		List<Object> pars = (List<Object>) MetaWSContext.getSessionValue(MetaWSContext.PARAMS_KEY);
		logBuffer.append("最终执行SQL：" + sql);
		logBuffer.append("\n参数个数:" + pars.size() + "--(" + Arrays.deepToString(pars.toArray()) + ")");
		Connection con = DataSourceManager.getConnection(dsstr);
		DataAccess access = new DataAccess(con);
		ResultSet rs = null;
		try {
			if (ruleType == 0) {
				Map<String, Object> reqParam = req.getSimpleMap();
				// 分页处理
				if (reqParam != null) {
					Map<String, Object> page = (Map<String, Object>) MapUtils.getObject(reqParam, "PAGE");
					if (page != null) {
						// 分页参数
						int posStart = MapUtils.getIntValue(page, "POS_START", 0);
						int count = MapUtils.getIntValue(page, "PAGE_COUNT", 15);
						sql = SqlUtils.wrapPagingSql(sql, new Page(posStart, count));
					}
				}
				// 查询
				if (pars.size() > 0)
					rs = access.execQuerySql(sql, ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY,
							pars.toArray());
				else
					rs = access.execQuerySql(sql, ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
				Object ret = null;
				switch (returnType) {
				case MetaWsShareConstant.RETURN_TYPE_ARRAY:
					ret = returnArray(rs);
					break;
				case MetaWsShareConstant.RETURN_TYPE_MAP:
					ret = returnMap(rs);
					break;
				case MetaWsShareConstant.RETURN_TYPE_MAPARRAY:
					ret = returnMapArray(rs);
					break;
				case MetaWsShareConstant.RETURN_TYPE_VAL:
					ret = returnVal(rs);
					break;

				}
				if (ret != null)
					return MetaWsDataUtil.toJSON(ret);
			} else {
				if (pars.size() > 0)
					access.execUpdate(sql, pars.toArray());
				else
					access.execUpdate(sql);
			}
		} finally {
			if (rs != null)
				access.close(rs);
		}
		return null;
	}

	// 处理返回单值
	private Object returnVal(ResultSet rs) throws SQLException {
		if (rs.next()) {
			return rs.getObject(1);
		}
		return null;
	}

	// 返回数组
	private List<Object> returnArray(ResultSet rs) throws SQLException {
		List<Object> list = new ArrayList<Object>();
		while (rs.next()) {
			list.add(rs.getObject(1));
		}
		return list;
	}

	// 返回map
	private Map<String, Object> returnMap(ResultSet rs) throws SQLException {
		Map<String, Object> obj = null;
		ResultSetMetaData metaData = rs.getMetaData();
		if (rs.next()) {
			obj = new HashMap<String, Object>();
			int colCount = metaData.getColumnCount();
			for (int i = 0; i < colCount; i++) {
				String columnName = metaData.getColumnName(i + 1);
				obj.put(columnName.toUpperCase(), rs.getObject(i + 1));
			}
		}
		return obj;
	}

	// 返回map数组
	private List<Map<String, Object>> returnMapArray(ResultSet rs) throws SQLException {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		ResultSetMetaData metaData = rs.getMetaData();
		int colCount = metaData.getColumnCount();
		Set<String> colSet = new HashSet<String>();
		for (int i = 0; i < colCount; i++) {
			colSet.add(metaData.getColumnName(i + 1));
		}
		while (rs.next()) {
			Map<String, Object> map = new HashMap<String, Object>();
			for (String colname : colSet) {
				map.put(colname, rs.getObject(colname));
			}
			list.add(map);
		}
		return list;
	}
}
