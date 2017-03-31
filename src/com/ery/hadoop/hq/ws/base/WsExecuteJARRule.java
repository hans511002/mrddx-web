package com.ery.hadoop.hq.ws.base;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.ery.hadoop.hq.ws.app.MetaWSContext;
import com.ery.hadoop.hq.ws.app.MetaWsRequstParamPO;
import com.ery.hadoop.hq.ws.utils.MetaWsDataUtil;
import com.ery.hadoop.hq.ws.utils.MetaWsJarNoQuery;
import com.ery.hadoop.hq.ws.utils.MetaWsJarQuery;
import com.ery.hadoop.hq.ws.utils.WsRequest;
import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.utils.Convert;

/**

 * 

 * @description JAR规则执行实现
 * @date 12-10-26 -
 * @modify
 * @modifyDate -
 */
public class WsExecuteJARRule extends MetaWsExec {

	@SuppressWarnings("unchecked")
	public boolean before(WsRequest req, StringBuffer buffer) throws Exception {
		Map<String, Object> reqSimpleMap = req.getSimpleMap();

		String ruleCode = req.getRuleCode();
		Map<String, Object> rule = MetaWSContext.getRuleInfo(ruleCode);
		Iterator<String> iterator = rule.keySet().iterator();
		while (iterator.hasNext()) {
			Object obj = iterator.next();
			if (null == obj || !MetaWSContext.RULE_REQUEST_PARAM.equals(obj.toString())) {
				continue;
			}

			List<MetaWsRequstParamPO> lst = (List<MetaWsRequstParamPO>) rule.get(obj);
			for (MetaWsRequstParamPO param : lst) {
				String pname = param.getName();
				String pDefValue = param.getDefaultValue();
				boolean pISMust = param.isMust();
				Object reqParamValue = reqSimpleMap.get(pname);
				if (pISMust && null == reqParamValue) {
					throw new Exception("必填参数" + pname + "的值为空");
				}

				if (!pISMust && null == reqParamValue) {
					reqSimpleMap.put(pname, pDefValue);
				}
			}
		}

		Map<String, Object> reqPar = new HashMap<String, Object>();
		reqPar.put(WsRequest.PAR_SIMPLE_OBJ, req.getBaseObject());
		reqPar.put(WsRequest.PAR_MAP_ARRAY, req.getMapArray());
		reqPar.put(WsRequest.PAR_SIMPLE_ARRAY, req.getSimpleArray());
		reqPar.put(WsRequest.PAR_SIMPLE_MAP, req.getSimpleMap());
		MetaWSContext.setSessionValue(MetaWSContext.PARAMS_KEY, reqPar);
		return true;
	}

	@SuppressWarnings("unchecked")
	public String execute(WsRequest req, StringBuffer logBuffer) throws Exception {
		String ruleCode = req.getRuleCode();
		Map<String, Object> rule = MetaWSContext.getRuleInfo(ruleCode);
		int ruleType = Convert.toInt(rule.get("RULE_TYPE"));
		Class<?> clazz = MetaWSContext.getClassByCode(ruleCode);
		Map<String, Object> param = (Map<String, Object>) MetaWSContext.getSessionValue(MetaWSContext.PARAMS_KEY);
		// MetaWsDAO dao = new MetaWsDAO();
		// DataAccess access = dao.getAccess();
		DataAccess access = null;
		f: for (String str : param.keySet()) {
			if (str.equals("_pmap_")) {
				Map<String, Object> pmap = (Map<String, Object>) param.get("_pmap_");
				for (String strTemp : pmap.keySet()) {
					if ("PASSWD".equals(strTemp)) {
						pmap.remove("PASSWD");
						break f;
					}
				}
			}
		}
		try {
			if (ruleType == 0) {
				MetaWsJarQuery exec = (MetaWsJarQuery) clazz.newInstance();

				// 查询
				logBuffer.append("执行" + clazz.getName() + "类方法[executeQuery];" + "\n参数:" + param.toString());
				param.put(WsRequest.HQ_LOG, req.getHqlog());
				Object o = exec.executeQuery(logBuffer, param, access);
				return MetaWsDataUtil.toJSON(o);
			} else {
				MetaWsJarNoQuery exec = (MetaWsJarNoQuery) clazz.newInstance();
				logBuffer.append("执行" + clazz.getName() + "类方法[executeNoQuery];" + "\n参数:" + param.toString());
				exec.executeNoQuery(logBuffer, param, access);
			}
		} finally {
			// dao.close();
		}
		return null;
	}
}
