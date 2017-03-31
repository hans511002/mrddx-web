package com.ery.hadoop.hq.ws.app;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.hadoop.hq.qureyrule.user.UserToken;
import com.ery.hadoop.hq.ws.Constant;
import com.ery.hadoop.hq.ws.HandleAddDataWs;
import com.ery.hadoop.hq.ws.HandleDeleteDataWs;
import com.ery.hadoop.hq.ws.HandleModifyDataWs;
import com.ery.hadoop.hq.ws.HandleQueryDataWs;
import com.ery.hadoop.hq.ws.WsQuery;

/**
 * @description webserivce全局上下文
 * @date 12-10-29 -
 * @modify
 * @modifyDate -
 */
public class MetaWSContext {

	public static final String RULE_TYPE = "RULE_TYPE";
	public static final String RULE_REQUEST_PARAM = "RULE_REQUEST_PARAM";
	public static final String RULECODE_HBASE01 = "hbase01";
	public static final String RULECODE_HBASE02 = "hbase02";
	public static final String RULECODE_HBASE03 = "hbase03";
	public static final String RULECODE_HBASE04 = "hbase04";
	public static final String RULECODE_HBASE05 = "hbase05";

	// 一些wsSession里面map一些key对应的值
	public static final String USER = "usertoken";// 用户- OBJECT
	public static final String PARAMS_KEY = "params";// 参数 List<Object>
	public static final String SQL_KEY = "sql";// sql String

	private static Map<Long, Map<String, Object>> wsSessionInfo = new HashMap<Long, Map<String, Object>>();// webservice访问session信息
	private static Map<String, Map<String, Object>> ruleInfoMap = new HashMap<String, Map<String, Object>>();// 全局WS规则信息
	private static Map<String, Map<String, Object>> ruleParamMap = new HashMap<String, Map<String, Object>>();// 规则参数信息
	private static Map<String, Class<?>> ruleClassMap = new HashMap<String, Class<?>>();// jar规则类map

	// 登陆
	public static synchronized void login(UserToken user) {
		long threadId = Thread.currentThread().getId();
		Map<String, Object> map = new HashMap<String, Object>();
		map.put(USER, user);
		wsSessionInfo.put(threadId, map);
	}

	// 登出
	public static synchronized void logout() {
		long threadId = Thread.currentThread().getId();
		if (wsSessionInfo.containsKey(threadId)) {
			wsSessionInfo.remove(threadId);
		}
	}

	// 获取当前访问用户
	public static UserToken getCurrentUser() {
		long threadId = Thread.currentThread().getId();
		Object user = wsSessionInfo.get(threadId).get(USER);
		if (null != user && user instanceof UserToken) {
			return (UserToken) user;
		}
		return null;
	}

	// 向请求session里设值
	public static void setSessionValue(String key, Object o) {
		long threadId = Thread.currentThread().getId();
		wsSessionInfo.get(threadId).put(key, o);
	}

	/**
	 * 获取请求session里面的值
	 * 
	 * @param key
	 * @return
	 */
	public static Object getSessionValue(String key) {
		long threadId = Thread.currentThread().getId();
		return wsSessionInfo.get(threadId).get(key);
	}

	// 是否包含某规则
	public static boolean hasRuleCode(String ruleCode) {
		return ruleInfoMap.containsKey(ruleCode);
	}

	// 初始
	public static synchronized void init() {
		// 初始规则
		Map<String, Object> ruleMap = new HashMap<String, Object>();
		ruleMap.put(RULE_TYPE, "0");
		List<MetaWsRequstParamPO> lstParam = new ArrayList<MetaWsRequstParamPO>();
		lstParam.add(new MetaWsRequstParamPO(WsQuery.QUERY_RULEID, true, null));
		lstParam.add(new MetaWsRequstParamPO(WsQuery.START_KEY, true, null));
		lstParam.add(new MetaWsRequstParamPO(WsQuery.END_KEY, true, null));
		lstParam.add(new MetaWsRequstParamPO(WsQuery.CURRENT_PAGE, false, null));
		lstParam.add(new MetaWsRequstParamPO(WsQuery.PAGE_SIZE, false, null));
		lstParam.add(new MetaWsRequstParamPO(WsQuery.ORDERBY_COLUMN, false, null));
		lstParam.add(new MetaWsRequstParamPO(WsQuery.ORDER_DESC, false, null));
		ruleMap.put(RULE_REQUEST_PARAM, lstParam);
		ruleInfoMap.put(RULECODE_HBASE01, ruleMap);
		addClass(RULECODE_HBASE01, WsQuery.class);

		// 初始化查询数据规则
		Map<String, Object> queryDataMap = new HashMap<String, Object>();
		queryDataMap.put(RULE_TYPE, "0");
		List<MetaWsRequstParamPO> queryDataParam = new ArrayList<MetaWsRequstParamPO>();
		queryDataParam.add(new MetaWsRequstParamPO(Constant.HT_NAME, true, null));
		queryDataParam.add(new MetaWsRequstParamPO(Constant.START_KEY, false, null));
		queryDataParam.add(new MetaWsRequstParamPO(Constant.END_KEY, false, null));
		queryDataParam.add(new MetaWsRequstParamPO(Constant.COUNT, false, null));
		queryDataMap.put(RULE_REQUEST_PARAM, queryDataParam);
		ruleInfoMap.put(RULECODE_HBASE02, queryDataMap);
		addClass(RULECODE_HBASE02, HandleQueryDataWs.class);

		// 初始化修改数据规则
		Map<String, Object> modifyDataMap = new HashMap<String, Object>();
		modifyDataMap.put(RULE_TYPE, "0");
		List<MetaWsRequstParamPO> modifyDataParam = new ArrayList<MetaWsRequstParamPO>();
		modifyDataParam.add(new MetaWsRequstParamPO(Constant.HT_NAME, true, null));
		modifyDataParam.add(new MetaWsRequstParamPO(Constant.ITEM_DATA, true, null));
		modifyDataMap.put(RULE_REQUEST_PARAM, modifyDataParam);
		ruleInfoMap.put(RULECODE_HBASE03, modifyDataMap);
		addClass(RULECODE_HBASE03, HandleModifyDataWs.class);

		// 初始化新增数据规则
		Map<String, Object> addDataMap = new HashMap<String, Object>();
		addDataMap.put(RULE_TYPE, "0");
		List<MetaWsRequstParamPO> addDataParam = new ArrayList<MetaWsRequstParamPO>();
		addDataParam.add(new MetaWsRequstParamPO(Constant.HT_NAME, true, null));
		addDataParam.add(new MetaWsRequstParamPO(Constant.ITEM_DATA, true, null));
		addDataMap.put(RULE_REQUEST_PARAM, addDataParam);
		ruleInfoMap.put(RULECODE_HBASE04, addDataMap);
		addClass(RULECODE_HBASE04, HandleAddDataWs.class);

		// 初始化删除数据规则
		Map<String, Object> deleteDataMap = new HashMap<String, Object>();
		deleteDataMap.put(RULE_TYPE, "0");
		List<MetaWsRequstParamPO> deleteDataParam = new ArrayList<MetaWsRequstParamPO>();
		deleteDataParam.add(new MetaWsRequstParamPO(Constant.HT_NAME, true, null));
		deleteDataParam.add(new MetaWsRequstParamPO(Constant.ITEM_DATA, true, null));
		deleteDataMap.put(RULE_REQUEST_PARAM, deleteDataParam);
		ruleInfoMap.put(RULECODE_HBASE05, deleteDataMap);
		addClass(RULECODE_HBASE05, HandleDeleteDataWs.class);

	}

	// 注销
	public static void destroy() {
		wsSessionInfo.clear();
		ruleInfoMap.clear();
		ruleParamMap.clear();
		ruleClassMap.clear();
	}

	// 获取规则信息
	public static synchronized Map<String, Object> getRuleInfo(String ruleCode) {
		return ruleInfoMap.get(ruleCode);
	}

	// 获取规则参数信息
	public static synchronized Map<String, Object> getParams(String ruleCode) {
		return ruleParamMap.get(ruleCode);
	}

	// 返回规则class
	public static Class<?> getClassByCode(String ruleCode) {
		return ruleClassMap.get(ruleCode);
	}

	// 添加规则class
	public static void addClass(String ruleCode, Class<?> clazz) {
		ruleClassMap.put(ruleCode, clazz);
	}

	// 删除规则
	public static synchronized void removeRule(String ruleCode) {
		ruleInfoMap.remove(ruleCode);
		ruleParamMap.remove(ruleCode);
		ruleClassMap.remove(ruleCode);
	}
}
