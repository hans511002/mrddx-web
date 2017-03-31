package com.ery.hadoop.hq.ws;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.ery.hadoop.hq.log.HQLog;
import com.ery.hadoop.hq.qureyaction.QueryDataAction;
import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.hadoop.hq.ws.utils.MetaWsJarQuery;
import com.ery.hadoop.hq.ws.utils.WsRequest;
import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.utils.Convert;

public class WsQuery implements MetaWsJarQuery {
	public static final String QUERY_RULEID = "QUERY_RULE_ID";
	public static final String START_KEY = "START_KEY";
	public static final String END_KEY = "END_KEY";
	public static final String CURRENT_PAGE = "CURRENT_PAGE";
	public static final String PAGE_SIZE = "PAGE_SIZE";
	public static final String ORDERBY_COLUMN = "ORDERBY_COLUMN";
	public static final String ORDER_DESC = "ORDER_DESC";
	public static final String ORDER_TYPE = "ORDER_TYPE";
	public static final String USERID = "USERID";
	public static final String GROUPBY_COLUMN = "GROUPBY_COLUMN";
	public static final String GROUPBY_STATISTICS = "GROUPBY_STATISTICS";
	public static final String RETURN_STATISTICS = "RETURN_STATISTICS";
	public static final String RETURN_DATA = "RETURN_DATA";
	public static final String QUERY_TYPE = "USE_GET";

	public Object executeQuery(Map<String, Object> params) {
		return this.executeQuery(null, params, null);
	}

	@Override
	public Object executeQuery(StringBuffer arg1, Map<String, Object> params, DataAccess arg2) {
		QueryDataAction queryAction = new QueryDataAction();

		Object param = params.get(WsRequest.PAR_SIMPLE_MAP);
		HQLog hqlog = (HQLog) params.get(WsRequest.HQ_LOG);
		if (!(param instanceof Map<?, ?>)) {// 参数类型错误
			return Constant.getRequetErrorMsg(Constant.ERROR.error_type);
		}
		Map<?, ?> simpleMap = (Map<?, ?>) param;
		Object objQueryRuleId = simpleMap.remove(QUERY_RULEID);
		long queryRuleId = -1;
		try {
			queryRuleId = Long.parseLong(objQueryRuleId.toString());
		} catch (Exception e) {// 查询规则id类型错误
			return Constant.getRequetErrorMsg(Constant.ERROR.error_ruleId_type);
		}

		String startKey = null;
		String endKey = null;
		int currentPage = -1;
		int pageSize = -1;
		String orderByColumn = null;
		int orderDesc = -1;
		int orderType = -1;
		int userId = -1;
		String groupbyColumn = "";
		String groupbyStatistics = "";
		int returnStatistics = -1;// 1:表示返回统计数据，否则不返回
		int returnData = 1;// 1:表示返回清单数据，否则不返回
		// get
		boolean queryTypeGet = false;
		int parallel = 5;
		String rowkeys = null;
		//
		Map<String, String> macroVariableMap = new HashMap<String, String>();
		String tmp = "";
		Iterator<?> iterator = simpleMap.keySet().iterator();
		while (iterator.hasNext()) {
			Object key = iterator.next();
			if (null == key) {
				continue;
			}

			tmp = key.toString();
			Object value = simpleMap.get(key);
			if (START_KEY.equalsIgnoreCase(tmp)) {
				startKey = StringUtil.objectToString(value, null);
			} else if (END_KEY.equalsIgnoreCase(tmp)) {
				endKey = StringUtil.objectToString(value, null);
			} else if (CURRENT_PAGE.equalsIgnoreCase(tmp)) {
				currentPage = StringUtil.objectToInt(value, -1);
			} else if (PAGE_SIZE.equalsIgnoreCase(tmp)) {
				pageSize = StringUtil.objectToInt(value, -1);
			} else if (ORDERBY_COLUMN.equalsIgnoreCase(tmp)) {
				orderByColumn = StringUtil.objectToString(value, null);
			} else if (ORDER_DESC.equalsIgnoreCase(tmp)) {
				orderDesc = StringUtil.objectToInt(value, -1);
			} else if (ORDER_TYPE.equalsIgnoreCase(tmp)) {
				orderType = StringUtil.objectToInt(value, -1);
			} else if (USERID.equalsIgnoreCase(tmp)) {
				userId = StringUtil.objectToInt(value, -1);
			} else if (GROUPBY_COLUMN.equalsIgnoreCase(tmp)) {
				groupbyColumn = StringUtil.objectToString(value, "");
			} else if (GROUPBY_STATISTICS.equalsIgnoreCase(tmp)) {
				groupbyStatistics = StringUtil.objectToString(value, "");
			} else if (RETURN_STATISTICS.equalsIgnoreCase(tmp)) {
				returnStatistics = StringUtil.objectToInt(value, -1);
			} else if (RETURN_DATA.equalsIgnoreCase(tmp)) {
				returnData = StringUtil.objectToInt(value, 1);
			} else if (QUERY_TYPE.equalsIgnoreCase(tmp)) {
				queryTypeGet = Convert.toBool(value, false);
			} else if ("parallel".equalsIgnoreCase(tmp)) {// get时并发查询数量
				parallel = Convert.toInt(value, 5);
			} else if ("rowkeys".equalsIgnoreCase(tmp)) {// get时的rowkey列表
				rowkeys = Convert.toString(value, null);
			} else {
				macroVariableMap.put(tmp, StringUtil.objectToString(value, null));
			}
		}

		Object returnObj = null;
		if (queryTypeGet || simpleMap.containsKey("parallel")) {// get
			if (rowkeys == null || rowkeys.equals("")) {
				rowkeys = startKey + ";" + endKey;
			}
			returnObj = queryAction.queryRowKeysData(queryRuleId, rowkeys, parallel, orderByColumn, orderDesc,
					orderType, macroVariableMap, hqlog, groupbyColumn, groupbyStatistics, returnStatistics, returnData);
		} else {// scan
			if (currentPage <= 0 || pageSize <= 0) {
				// 查询全部据
				returnObj = queryAction.queryAllData(queryRuleId, startKey, endKey, macroVariableMap, hqlog,
						groupbyColumn, groupbyStatistics, returnStatistics, returnData);
				// 只用查询全部原始数据才能进行二个规则的数据合并
			} else {
				// 分页查询
				returnObj = queryAction.queryPageData(queryRuleId, startKey, endKey, currentPage, pageSize,
						orderByColumn, orderDesc, orderType, macroVariableMap, hqlog, groupbyColumn, groupbyStatistics,
						returnStatistics, returnData);
			}
		}
		Map<String, Object> mapValue = new HashMap<String, Object>();
		mapValue.put("result", returnObj);
		return mapValue;
	}
}
