package com.ery.hadoop.hq.ws;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.module.hBaseQuery.HBTableAction;

import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.hadoop.hq.ws.utils.MetaWsDataUtil;
import com.ery.hadoop.hq.ws.utils.MetaWsJarQuery;
import com.ery.hadoop.hq.ws.utils.WsRequest;
import com.ery.base.support.jdbc.DataAccess;

public class HandleDeleteDataWs implements MetaWsJarQuery {

	@SuppressWarnings("unchecked")
	@Override
	public Object executeQuery(StringBuffer logBuffer, Map<String, Object> params, DataAccess access) throws Exception {
		Object param = params.get(WsRequest.PAR_SIMPLE_MAP);
		if (!(param instanceof Map<?, ?>)) {// 参数类型错误
			return Constant.getRequetErrorMsg(Constant.ERROR.error_type);
		}
		Map<?, ?> simpleMap = (Map<?, ?>) param;
		Object bhtName = simpleMap.get(Constant.HT_NAME);
		Object bsourceId = simpleMap.get(Constant.SOURCE_ID);
		Object bstartKey = simpleMap.get(Constant.ITEM_DATA);
		List<String> lst = null;
		try {
			lst = (List<String>) MetaWsDataUtil.toObject(bstartKey.toString(), List.class);
		} catch (Exception e) {
			return Constant.getRequetErrorMsg(Constant.ERROR.ERROR_MODIFY_HB_TABLE_DATA_TYPE);
		}

		if (null == lst || lst.size() <= 0) {
			return Constant.getRequetErrorMsg(Constant.ERROR.ERROR_MODIFY_HB_TABLE_DATA);
		}

		String htName = null;
		int sourceId = -1;
		if (null == bhtName) {
			return Constant.getRequetErrorMsg(Constant.ERROR.ERROR_HB_TABLE_NAME);
		} else {
			htName = bhtName.toString();
		}

		sourceId = StringUtil.objectToInt(bsourceId, -1);
		if (-1 == sourceId) {
			return Constant.getRequetErrorMsg(Constant.ERROR.ERROR_DATA_SOURCE_ID);
		}

		HBTableAction hbAction = new HBTableAction();
		Map<String, Object> resultMap = new HashMap<String, Object>();
		Map<String, Object> tmpMap = new HashMap<String, Object>();
		boolean resultObj = false;
		String code = null;
		try {
			resultObj = hbAction.deleteHBTableData(htName, lst, sourceId);
		} catch (IOException e) {
			code = Constant.ERROR.ERROR_MODIFY_HB_TABLE_DATA_FIAL.toString();
		} catch (InterruptedException e) {
			code = Constant.ERROR.ERROR_MODIFY_HB_TABLE_DATA_FIAL.toString();
		}

		resultMap.put(Constant.RESULT_NAME, tmpMap);
		tmpMap.put(Constant.RESPONSE_STATUS, resultObj);
		if (null != code) {
			tmpMap.put(Constant.RESPONSE_CODE, code);
		}

		return resultMap;
	}

}