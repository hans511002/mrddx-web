package com.ery.hadoop.hq.ws.client;

import java.util.HashMap;
import java.util.List;

import javax.xml.ws.soap.SOAPFaultException;

import com.ery.hadoop.hq.ws.Constant;
import com.ery.hadoop.hq.ws.utils.MetaWsDataUtil;
import com.ery.hadoop.hq.ws.utils.MetaWsException;
import com.ery.hadoop.hq.ws.utils.WsRequest;

/**
 * @description 客户端代理对象，通过MetaWsClient.getClientProxy()获取
 * @date 12-10-31 -
 * @modify
 * @modifyDate -
 */
public class MetaWsClientProxy {

	private MetaWebServicePortType port;

	protected MetaWebServicePortType getPort() {
		return port;
	}

	protected void setPort(MetaWebServicePortType port) {
		this.port = port;
	}

	/**
	 * 获取有权限访问的所有ws规则接口信息
	 * 
	 * @return hashmap
	 */
	public HashMap<String, Object> getAvailableWS() {
		String str = port.getAvailableWS();
		try {
			if (str != null)
				return MetaWsDataUtil.toObject(str, HashMap.class);
			return null;
		} catch (SOAPFaultException e) {
			throw new MetaWsException(e.getMessage());
		}
	}

	/**
	 * 执行不带参数WS规则请求
	 * 
	 * @param ruleCode
	 *            规则编码
	 * @param clazz
	 *            返回值类型
	 * @param <T>
	 *            返回值calss泛型
	 * @return 根据class定义的泛型返回其具体对象
	 */
	public <T> T executeByNoParams(String ruleCode, Class<T> clazz) {
		WsRequest req = new WsRequest();
		req.setRuleCode(ruleCode);
		try {
			String str = port.doGet(MetaWsDataUtil.toJSON(req));
			if (str != null)
				return MetaWsDataUtil.toObject(str, clazz);
			return null;
		} catch (SOAPFaultException e) {
			throw new MetaWsException(e.getMessage());
		}
	}

	/**
	 * 执行一个不带参数的规则请求（无返回值）
	 * 
	 * @param ruleCode
	 *            规则编码
	 */
	public void executeByNoParams(String ruleCode) {
		WsRequest req = new WsRequest();
		req.setRuleCode(ruleCode);
		try {
			port.doGet(MetaWsDataUtil.toJSON(req));
		} catch (SOAPFaultException e) {
			throw new MetaWsException(e.getMessage());
		}
	}

	/**
	 * 执行一次带基本类型(String,Integer,Long,Double。。。)对象参数的请求
	 * 
	 * @param ruleCode
	 *            规则编码
	 * @param clazz
	 *            返回值类型
	 * @param obj
	 *            参数
	 * @param <T>
	 *            返回泛型
	 * @return
	 */
	public <T> T executeBySimpleObj(String ruleCode, Class<T> clazz, Object obj) {
		WsRequest req = new WsRequest();
		req.setRuleCode(ruleCode);
		req.setBaseObject(obj);
		try {
			String str = port.doGet(MetaWsDataUtil.toJSON(req));
			if (str != null)
				return MetaWsDataUtil.toObject(str, clazz);
			return null;
		} catch (SOAPFaultException e) {
			throw new MetaWsException(e.getMessage());
		}
	}

	/**
	 * 执行一个带基本类型参数的请求（无返回值）
	 * 
	 * @param ruleCode
	 *            规则编码
	 * @param obj
	 *            参数
	 */
	public void executeBySimpleObj(String ruleCode, Object obj) {
		WsRequest req = new WsRequest();
		req.setRuleCode(ruleCode);
		req.setBaseObject(obj);
		try {
			port.doGet(MetaWsDataUtil.toJSON(req));
		} catch (SOAPFaultException e) {
			throw new MetaWsException(e.getMessage());
		}
	}

	/**
	 * 执行一个带list数组参数的请求
	 * 
	 * @param ruleCode
	 *            规则编码
	 * @param clazz
	 *            返回值类型
	 * @param list
	 *            参数
	 * @param <T>
	 *            返回泛型
	 * @return
	 */
	public <T> T executeBySimpleArray(String ruleCode, Class<T> clazz, List<Object> list) {
		WsRequest req = new WsRequest();
		req.setRuleCode(ruleCode);
		req.setSimpleArray(list);
		try {
			String str = port.doGet(MetaWsDataUtil.toJSON(req));
			if (str != null)
				return MetaWsDataUtil.toObject(str, clazz);
			return null;
		} catch (SOAPFaultException e) {
			throw new MetaWsException(e.getMessage());
		}
	}

	/**
	 * 执行一个带数组参数的请求（无返回值）
	 * 
	 * @param ruleCode
	 *            规则编码
	 * @param list
	 *            参数
	 */
	public void executeBySimpleArray(String ruleCode, List<Object> list) {
		WsRequest req = new WsRequest();
		req.setRuleCode(ruleCode);
		req.setSimpleArray(list);
		try {
			port.doGet(MetaWsDataUtil.toJSON(req));
		} catch (SOAPFaultException e) {
			throw new MetaWsException(e.getMessage());
		}
	}

	/**
	 * 执行一个带map对象参数的请求
	 * 
	 * @param ruleCode
	 *            规则编码
	 * @param clazz
	 *            返回值类型
	 * @param map
	 *            参数
	 * @param <T>
	 *            返回泛型
	 * @return
	 */
	public <T> T executeBySimpleMap(String ruleCode, Class<T> clazz, HashMap<String, Object> map) {
		WsRequest req = new WsRequest();
		req.setRuleCode(ruleCode);
		req.setSimpleMap(map);
		try {
			String str = port.doGet(MetaWsDataUtil.toJSON(req));
			if (str != null)
				return MetaWsDataUtil.toObject(str, clazz);
			return null;
		} catch (SOAPFaultException e) {
			// "用户信息认证失败，无法访问MetaWs接口规则!"
			String s = MetaWsDataUtil.toJSON(Constant.getRequetErrorMsg(Constant.ERROR.error_user));
			return MetaWsDataUtil.toObject(s, clazz);
			// throw new MetaWsException(e.getMessage());
		}
	}

	/**
	 * 执行一个带map参数的请求(无返回值）
	 * 
	 * @param ruleCode
	 *            规则编码
	 * @param map
	 *            参数
	 */
	public void executeBySimpleMap(String ruleCode, HashMap<String, Object> map) {
		WsRequest req = new WsRequest();
		req.setRuleCode(ruleCode);
		req.setSimpleMap(map);
		try {
			port.doGet(MetaWsDataUtil.toJSON(req));
		} catch (SOAPFaultException e) {
			throw new MetaWsException(e.getMessage());
		}
	}

	/**
	 * 执行一次带map数组参数的请求
	 * 
	 * @param ruleCode
	 *            规则编码
	 * @param clazz
	 *            返回值类型
	 * @param maps
	 *            参数
	 * @param <T>
	 *            返回泛型
	 * @return
	 */
	public <T> T executeByMapArray(String ruleCode, Class<T> clazz, List<HashMap<String, Object>> maps) {
		WsRequest req = new WsRequest();
		req.setRuleCode(ruleCode);
		req.setMapArray(maps);
		try {
			String str = port.doGet(MetaWsDataUtil.toJSON(req));
			if (str != null)
				return MetaWsDataUtil.toObject(str, clazz);
			return null;
		} catch (SOAPFaultException e) {
			throw new MetaWsException(e.getMessage());
		}
	}

	/**
	 * 执行一个带map数组参数的请求（无返回值）
	 * 
	 * @param ruleCode
	 *            规则编码
	 * @param maps
	 *            参数
	 */
	public void executeByMapArray(String ruleCode, List<HashMap<String, Object>> maps) {
		WsRequest req = new WsRequest();
		req.setRuleCode(ruleCode);
		req.setMapArray(maps);
		try {
			port.doGet(MetaWsDataUtil.toJSON(req));
		} catch (SOAPFaultException e) {
			throw new MetaWsException(e.getMessage());
		}
	}

}
