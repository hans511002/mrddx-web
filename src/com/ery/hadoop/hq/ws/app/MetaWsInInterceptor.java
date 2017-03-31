package com.ery.hadoop.hq.ws.app;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;

import javax.xml.soap.SOAPBody;
import javax.xml.soap.SOAPException;
import javax.xml.soap.SOAPHeader;
import javax.xml.soap.SOAPMessage;

import org.apache.cxf.binding.soap.SoapMessage;
import org.apache.cxf.binding.soap.saaj.SAAJInInterceptor;
import org.apache.cxf.interceptor.Fault;
import org.apache.cxf.phase.AbstractPhaseInterceptor;
import org.apache.cxf.phase.Phase;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ery.hadoop.hq.datasource.DataSourceInit;
import com.ery.hadoop.hq.datasource.HTableConnPO;
import com.ery.hadoop.hq.qureyrule.QueryRulePO;
import com.ery.hadoop.hq.qureyrule.user.UserToken;
import com.ery.hadoop.hq.table.HBaseTablePO;
import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.hadoop.hq.ws.Constant;
import com.ery.hadoop.hq.ws.utils.Common;
import com.ery.hadoop.hq.ws.utils.MetaWsDataUtil;
import com.ery.hadoop.hq.ws.utils.WsRequest;
import com.ery.base.support.log4j.LogUtils;

/**

 * 

 * @description 访问ws请求开始拦截器
 * @date 12-10-25 -
 * @modify
 * @modifyDate -
 */
public class MetaWsInInterceptor extends AbstractPhaseInterceptor<SoapMessage> {
	private SAAJInInterceptor saa = new SAAJInInterceptor();

	public MetaWsInInterceptor() {
		super(Phase.PRE_PROTOCOL);
		getAfter().add(SAAJInInterceptor.class.getName());
	}

	@SuppressWarnings("unchecked")
	public void handleMessage(SoapMessage message) throws Fault {
		SOAPMessage mess = message.getContent(SOAPMessage.class);
		if (mess == null) {
			saa.handleMessage(message);
			mess = message.getContent(SOAPMessage.class);
		}

		SOAPHeader head = null;
		try {
			head = mess.getSOAPHeader();
		} catch (Exception e) {
			e.printStackTrace();
		}

		String userName = null;
		String passwd = null;

		if (head != null) {
			// 先取header中的用户名和密码
			NodeList nodes = head.getElementsByTagName(WsRequest.HEADER_USERNAME);
			NodeList nodepass = head.getElementsByTagName(WsRequest.HEADER_PASSWORD);

			if (nodes != null && nodes.getLength() == 1 && nodepass != null && nodepass.getLength() == 1) {
				userName = nodes.item(0).getTextContent();
				passwd = nodepass.item(0).getTextContent();
			}
		}

		long queryRuleId = -1l;
		Object ob = null;
		try {
			// 取body中的用户名和密码
			if (this.illegUser(userName, passwd)) {
				SOAPBody soap = mess.getSOAPBody();
				NodeList list = soap.getElementsByTagName("app:doGet");
				HashMap<?, ?> map = null;
				for (int i = 0; i < list.getLength(); i++) {
					if (list.item(i).getNodeName().equals("app:doGet")) {
						String content = this.getJsonStr(list.item(i), "app:jsonStr");
						// String content =
						// list.item(i).getParentNode().getFirstChild().getFirstChild().getTextContent();
						map = MetaWsDataUtil.toObject(content, HashMap.class);
						break;
					}
				}

				if (null != map) {
					for (Object objs : map.keySet()) {
						if ("simpleMap".equals(objs)) {
							ob = map.get(objs);
						}
					}
				}

				if (this.illegUser(userName, passwd) && null != ob && ob instanceof Map<?, ?>) {
					Map<?, ?> ma = (Map<?, ?>) ob;
					userName = (String) ma.get("USERID");
					passwd = (String) ma.get("PASSWD");
					passwd = Common.getMD5(passwd == null ? "".getBytes() : passwd.getBytes());
					queryRuleId = StringUtil.objectToLong(ma.get("QUERY_RULE_ID"), -1l);
				}
			}

			UserToken user = checkUser(userName, passwd);
			if (null != user) {
				MetaWSContext.login(user);
				LogUtils.debug("用户:" + userName + ",访问WS验证成功!");
			} else {
				// HTableConnPO conpo =
				// DataSourceInit.htableQryRules.get(String.valueOf(queryRuleId));
				// modify by 2014-03-26 begin
				HTableConnPO conpo = null;
				// 通过查询规则表中的分区字段，判断是否存在宏变量替换
				String qryRuleId = String.valueOf(queryRuleId);
				QueryRulePO qryPo = DataSourceInit.htableRuleList.get(StringUtil.objectToLong(queryRuleId, -1l));
				if (qryPo == null) {
					String msg = MetaWsDataUtil.toJSON(Constant
							.getRequetErrorMsg(Constant.ERROR.ERROR_QUERY_RULE_ERROR));
					throw new Fault(new SOAPException(msg));
				}
				String tableName = qryPo.getHbaseTablePartition();
				if (StringUtil.isIncludeMacroVariable(tableName)) {// 替换宏变量
					Map<String, Object> map = new HashMap<String, Object>();
					if (ob != null) {
						map.putAll((Map<String, Object>) ob);
					}
					tableName = StringUtil.replaceMacroVariable(tableName, map);
				} else {
					HBaseTablePO hbaseTablePO = DataSourceInit.ruleIdhtableList.get(StringUtil.objectToLong(
							queryRuleId, -1l));
					if (hbaseTablePO == null || null == hbaseTablePO.getHbTableName()) {
						String msg = MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_tablename));
						throw new Fault(new SOAPException(msg));
					} else {
						tableName = hbaseTablePO.getHbTableName();
					}
				}

				// conpo =
				// DataSourceInit.htableQryRules.get(queryRuleId.toString());
				Hashtable<String, HTableConnPO> tableMap = DataSourceInit.htableQryRules.get(qryRuleId);
				if (tableMap != null && tableMap.containsKey(tableName)) {
					conpo = tableMap.get(tableName);
				}
				if (null == conpo) {
					// DataSourceInit.reLoadQueryRule(StringUtil.objectToLong(queryRuleId,
					// -1));
					// conpo =
					// DataSourceInit.htableQryRules.get(queryRuleId.toString());
					DataSourceInit.reLoadQueryRule(StringUtil.objectToLong(queryRuleId, -1), tableName);
					tableMap = DataSourceInit.htableQryRules.get(qryRuleId);
					if (tableMap.containsKey(tableName)) {
						conpo = tableMap.get(tableName);
					}
					if (null == conpo) {
						String msg = MetaWsDataUtil.toJSON(Constant
								.getRequetErrorMsg(Constant.ERROR.ERROR_QUERY_RULE_ERROR));
						throw new Fault(new SOAPException(msg));
					}
				}
				// modify by 2014-03-26 end
				if (conpo.getCertAuthFlag() <= 0) {// 无需验证
					MetaWSContext.login(null);
					return;
				}
				String msg = MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_user));
				throw new Fault(new SOAPException(msg));
			}
		} catch (Exception ex) {
			ex.printStackTrace();
			if (ex instanceof Fault)
				throw new Fault(new SOAPException(ex.getMessage()));
			else
				throw new Fault(new SOAPException("认证失败，请检查SOAP头是否传入用户认证信息!"));
		}
	}

	private String getJsonStr(Node node, String nodeName) {
		if (node == null || null == nodeName || nodeName.trim().length() <= 0) {
			return null;
		}

		if (nodeName.equals(node.getNodeName())) {
			return node.getTextContent();
		}

		NodeList lst = node.getChildNodes();
		if (null == lst) {
			return null;
		}

		for (int i = 0; i < lst.getLength(); i++) {
			String content = this.getJsonStr(lst.item(i), nodeName);
			if (null != content) {
				return content;
			}
		}

		return null;
	}

	private boolean illegUser(String userName, String passwd) {
		return null == userName || userName.trim().length() <= 0 || null == passwd || passwd.trim().length() <= 0;
	}

	// 验证用户密码
	private UserToken checkUser(String userName, String pass) throws SQLException {
		if (!"".equals(userName) && !"".equals(pass)) {
			UserToken user = DataSourceInit.htableUser.get(userName);
			if (null == user) {
				return null;
			}
			if (pass.equals(user.getPassword())) {
				return user;
			}
		}
		return null;
	}
}
