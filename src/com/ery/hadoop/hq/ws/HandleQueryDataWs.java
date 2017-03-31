package com.ery.hadoop.hq.ws;

import java.util.Map;

import com.ery.meta.module.hBaseQuery.HBTableAction;

import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.hadoop.hq.ws.utils.MetaWsJarQuery;
import com.ery.hadoop.hq.ws.utils.WsRequest;
import com.ery.base.support.jdbc.DataAccess;

public class HandleQueryDataWs implements MetaWsJarQuery {

	@Override
	public Object executeQuery(StringBuffer logBuffer, Map<String, Object> params, DataAccess access) throws Exception {
		Object param = params.get(WsRequest.PAR_SIMPLE_MAP);
		if (!(param instanceof Map<?, ?>)) {// 参数类型错误
			return Constant.getRequetErrorMsg(Constant.ERROR.error_type);
		}
		Map<?, ?> simpleMap = (Map<?, ?>) param;
		Object bhtName = simpleMap.get(Constant.HT_NAME);
		Object bsourceId = simpleMap.get(Constant.SOURCE_ID);
		Object bstartKey = simpleMap.get(Constant.START_KEY);
		Object bendKey = simpleMap.get(Constant.END_KEY);
		Object bcount = simpleMap.get(Constant.COUNT);

		String htName = null;
		int sourceId = -1;
		String startKey = null;
		String endKey = null;
		int count = -1;
		if (null == bhtName) {
			return Constant.getRequetErrorMsg(Constant.ERROR.ERROR_HB_TABLE_NAME);
		} else {
			htName = bhtName.toString();
		}

		sourceId = StringUtil.objectToInt(bsourceId, -1);
		if (-1 == sourceId) {
			return Constant.getRequetErrorMsg(Constant.ERROR.ERROR_DATA_SOURCE_ID);
		}

		if (null != bstartKey) {
			startKey = bstartKey.toString();
		}

		if (null != bendKey) {
			endKey = bendKey.toString();
		}

		count = StringUtil.objectToInt(bcount, -1);
		if (-1 == count) {
			count = Constant.QUERY_RETURN_DEFAULT_COUNT;
		}

		if (count < 1 || count > 200000) {
			return Constant.getRequetErrorMsg(Constant.ERROR.ERROR_QUERY_RETURN_COUNT);
		}

		HBTableAction hbAction = new HBTableAction();
		return hbAction.queryHBTableData(htName, startKey, endKey, count, sourceId);
	}

}