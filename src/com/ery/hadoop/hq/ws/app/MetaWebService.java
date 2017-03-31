package com.ery.hadoop.hq.ws.app;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Hashtable;
import java.util.Map;
import java.util.Set;

import javax.jws.WebMethod;
import javax.jws.WebService;
import javax.jws.soap.SOAPBinding;

import com.ery.base.support.utils.MapUtils;
import com.ery.hadoop.hq.datasource.DataSourceInit;
import com.ery.hadoop.hq.datasource.HTableConnPO;
import com.ery.hadoop.hq.log.HQLog;
import com.ery.hadoop.hq.qureyrule.QueryRulePO;
import com.ery.hadoop.hq.qureyrule.user.UserToken;
import com.ery.hadoop.hq.table.HBaseTablePO;
import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.hadoop.hq.utils.WSLogManager;
import com.ery.hadoop.hq.ws.Constant;
import com.ery.hadoop.hq.ws.WsQuery;
import com.ery.hadoop.hq.ws.base.MetaWsExec;
import com.ery.hadoop.hq.ws.utils.MetaWsDataUtil;
import com.ery.hadoop.hq.ws.utils.WsRequest;
import com.ery.meta.common.Common;

/**
 * @description 系统webSerivce总接口
 * @date 12-10-24
 * @modify
 * @modifyDate -
 */
@WebService
@SOAPBinding(style = SOAPBinding.Style.RPC)
public class MetaWebService {

	public static final String USER_NAME = "USERID";
	public static final String USER_PASSWD = "PASSWD";

	/**
	 * 获取可用的WS接口编码及说明
	 * 
	 * @return 接口编码及说明，key编码，value说明
	 */
	@WebMethod
	public String getAvailableWS() {
		return null;
	}

	/**
	 * 访问webSerivce接口
	 * 
	 * @param jsonStr
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@WebMethod
	public String doGet(String jsonStr) throws Exception {
		WsRequest req = MetaWsDataUtil.toWsReq(jsonStr);
		String ret = "";

		Map<String, Object> simpleMap = req.getSimpleMap();
		if (null == simpleMap || simpleMap.size() <= 0) {
			return MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_param));
		}

		long logStartTime = System.currentTimeMillis();
		if (!checkReq(req)) {
			return MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_noruleCode));
		}

		String ruleCode = req.getRuleCode();
		if (!MetaWSContext.hasRuleCode(ruleCode)) {
			return MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_ruleCode));
		}

		// 只有ruleCode = hbase01才验证 queryRuleId
		HTableConnPO conpo = null;
		UserToken user = null;
		Object queryRuleId = null;
		if (MetaWSContext.RULECODE_HBASE01.equals(ruleCode)) {
			queryRuleId = req.getSimpleMap().get(WsQuery.QUERY_RULEID);
			if (null == queryRuleId || StringUtil.objectToLong(queryRuleId, -1l) == -1) {
				return MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_noqryruleCode));
			}
			// 四川定制：处理历史的id，满足直接替换到历史id(全部更新到新环境后，可以去掉这3行代码)
			String startkey = req.getSimpleMap().get(WsQuery.START_KEY).toString();
			queryRuleId = Common.getTmpRuleId(StringUtil.objectToLong(queryRuleId, -1l), startkey);
			req.getSimpleMap().put(WsQuery.QUERY_RULEID, queryRuleId);
			System.out.println("替换为新的规则ID：" + queryRuleId);

			// modify by 2014-03-26 begin
			// 通过查询规则表中的分区字段，判断是否存在宏变量替换
			QueryRulePO qryPo = DataSourceInit.htableRuleList.get(StringUtil.objectToLong(queryRuleId, -1l));
			if (qryPo == null) {
				throw new Exception("规则不存在, query Id:" + queryRuleId.toString());
			}
			String tableName = qryPo.getHbaseTablePartition();
			if (StringUtil.isIncludeMacroVariable(tableName)) {// 替换宏变量
				tableName = StringUtil.replaceMacroVariable(tableName, req.getSimpleMap());
			} else {
				HBaseTablePO hbaseTablePO = DataSourceInit.ruleIdhtableList.get(StringUtil.objectToLong(queryRuleId,
						-1l));
				if (hbaseTablePO == null || null == hbaseTablePO.getHbTableName()) {
					throw new Exception("Hbase表不存在, query Id:" + queryRuleId.toString());
				} else {
					tableName = hbaseTablePO.getHbTableName();
				}
			}

			// conpo =
			// DataSourceInit.htableQryRules.get(queryRuleId.toString());
			Hashtable<String, HTableConnPO> tableMap = DataSourceInit.htableQryRules.get(queryRuleId.toString());
			if (tableMap != null && tableMap.containsKey(tableName)) {
				conpo = tableMap.get(tableName);
			}
			if (null == conpo) {
				// DataSourceInit.reLoadQueryRule(StringUtil.objectToLong(queryRuleId,
				// -1));
				// conpo =
				// DataSourceInit.htableQryRules.get(queryRuleId.toString());
				DataSourceInit.reLoadQueryRule(StringUtil.objectToLong(queryRuleId, -1), tableName);
				tableMap = DataSourceInit.htableQryRules.get(queryRuleId.toString());
				if (tableMap.containsKey(tableName)) {
					conpo = tableMap.get(tableName);
				}
				if (null == conpo) {
					return MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.ERROR_QUERY_RULE_ERROR));
				}
			}
			// modify by 2014-03-26 end
			if (conpo.getCertAuthFlag() > 0) {
				user = MetaWSContext.getCurrentUser();
				if (null == user || null == user.getUsername() || null == user.getPassword()) {
					return MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_user));
				}
				if (null == queryRuleId || !this.checkRuleId(user.getUserId(), queryRuleId.toString())) {
					return MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_noauthority));
				}
			}
			if (!DataSourceInit.htableQryRules.containsKey(queryRuleId.toString())) {
				return MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_noqryrule));
			}
		}
		// 目前只支持jar类型
		MetaWsExec exector = MetaWsExec.getInstance(MetaWsExec.TYPE_JAR);
		if (exector == null) {
			return MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_decoderule));
		}

		StringBuffer logBuffer = new StringBuffer();
		int flag = 0; // 0失败，1成功，2异常

		HQLog hqlog = new HQLog();
		req.setHqlog(hqlog);

		try {
			if (exector.before(req, logBuffer)) {
				ret = exector.execute(req, logBuffer);
				logBuffer.append("\n执行成功!");
				flag = 1;
			} else {
				flag = 0;
				logBuffer.append("\n执行失败!");
				return MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_paramvalid));
			}
		} catch (Throwable e) {
			e.printStackTrace();
			flag = 2;
			StringWriter sw = new StringWriter();// 将异常先输出到String,Writer中
			e.printStackTrace(new PrintWriter(sw));
			logBuffer.append("\n内部执行错误!").append(sw.toString());
			return MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_other));
		} finally {
			// 记录访问日志
			if (conpo != null && conpo.getCertAuthFlag() > 0 && conpo.getVisitLogFlag() == 1) {
				if (conpo.isVisitLogFlagDetail()) {
					Map<String, Object> result = (Map<String, Object>) MetaWsDataUtil.toObject(ret, Map.class);
					Map<String, Object> mapRs = (Map<String, Object>) result.get("result");

					if (mapRs != null && mapRs.size() > 0) {
						long totalCount = MapUtils.getLong(mapRs, "totalCount", 0l);
						long currentCount = MapUtils.getLong(mapRs, "currentCount", 0l);
						String enField = MapUtils.getString(mapRs, "enField", "");
						long resultByte = ret.getBytes().length;
						logBuffer.append("\n详细日志：{");
						logBuffer.append("totalCount=" + totalCount);
						hqlog.setTotalCount(totalCount);
						logBuffer.append(",currentCount=" + currentCount);
						hqlog.setCurrentCount(currentCount);
						if (!"".equals(enField) && enField.length() > 0) {
							logBuffer.append(",totalField=" + enField.split(",").length);
						} else {
							logBuffer.append(",totalField=0");
						}
						logBuffer.append(",resultByte=" + resultByte + "}");
						hqlog.setResultByte(resultByte);
					}

					hqlog.setUserId(user.getUserId());
					hqlog.setQueryRuleId(queryRuleId.toString());
					hqlog.setStartTime(logStartTime);
					hqlog.setLogStartTime(logStartTime);
					hqlog.setLogEndTime(System.currentTimeMillis());
					hqlog.setMsg(logBuffer.toString());
					hqlog.setQryFlag(flag == 1);
					hqlog.setDetail(true);
					WSLogManager.getInstance().add(hqlog);
					// HQLogDAO hqLogdao = new HQLogDAO();
					// try{
					// hqLogdao.log(user.getUserId(), queryRuleId.toString(),
					// logStartTime, logBuffer.toString(), flag == 1, hqlog);
					// hqLogdao.close();
					// }catch (Exception e) {
					// e.printStackTrace();
					// }
				} else {
					hqlog.setUserId(user.getUserId());
					hqlog.setQueryRuleId(queryRuleId.toString());
					hqlog.setStartTime(logStartTime);
					hqlog.setLogStartTime(logStartTime);
					hqlog.setLogEndTime(System.currentTimeMillis());
					hqlog.setMsg(logBuffer.toString());
					hqlog.setQryFlag(flag == 1);
					hqlog.setDetail(false);
					WSLogManager.getInstance().add(hqlog);

					// HQLogDAO hqLogdao = new HQLogDAO();
					// try{
					// hqLogdao.log(user.getUserId(), queryRuleId.toString(),
					// logStartTime, logBuffer.toString(), flag == 1);
					// hqLogdao.close();
					// }catch (Exception e) {
					// e.printStackTrace();
					// }
				}
			}
		}
		return ret;
	}

	// 验证请求对象
	private boolean checkReq(WsRequest req) {
		return !(req == null || req.getRuleCode() == null || "".equals(req.getRuleCode()));
	}

	// 验证用户对查询规则是否有访问权限
	public synchronized boolean checkRuleId(long userId, String queryRuleId) {
		try {
			Set<Long> setUser = DataSourceInit.htableRuleUserList.get(StringUtil.stringToLong(queryRuleId, -1));
			return setUser.contains(userId);
		} catch (Exception e) {
			return false;
		}
	}
}
