package com.ery.hadoop.hq.ws.client;

import java.util.HashMap;
import java.util.Map;

import org.apache.cxf.endpoint.Client;
import org.apache.cxf.frontend.ClientProxy;
import org.apache.cxf.jaxws.JaxWsProxyFactoryBean;
import org.apache.cxf.transport.http.HTTPConduit;
import org.apache.cxf.transports.http.configuration.HTTPClientPolicy;

/**
 * @description metaws 客户端
 * @date 12-10-31 -
 * @modify
 * @modifyDate -
 */
public class MetaWsClient {

	protected static final String DEFAULT = "_def";// 默认一个客户端
	private static Map<String, String> address = new HashMap<String, String>();// 地址
	private static Map<String, JaxWsProxyFactoryBean> factory = new HashMap<String, JaxWsProxyFactoryBean>();
	private static Map<String, Long> connectionTimeout = new HashMap<String, Long>();// 1000*10;//20秒,连接超时时间
	private static Map<String, Long> receiveTimeout = new HashMap<String, Long>();// 1000*60*2;//2分钟，响应时间

	private static Map<String, String> username = new HashMap<String, String>();
	private static Map<String, String> password = new HashMap<String, String>();
	private static Map<String, Boolean> addressChanged = new HashMap<String, Boolean>();// 地址发生变化

	/**
	 * 初始客户端，初始之前必须设置address，username，password，否则会抛出异常! 此方法只需在系统启动之初执行一次！
	 * 
	 * @throws Exception
	 */
	public static void init() throws Exception {
		init(DEFAULT);
	}

	public static void init(String key) throws Exception {
		if (!addressChanged.get(key)) {
			return;
		}
		if (getUsername(key) != null && getPassword(key) != null && !"".equals(getUsername(key)) &&
				!"".equals(getPassword(key))) {
			String _add = address.get(key);
			if (_add != null && !"".equals(_add)) {
				JaxWsProxyFactoryBean facBean = new JaxWsProxyFactoryBean();
				facBean.setServiceClass(MetaWebServicePortType.class);// 实例化ws
				facBean.setAddress(_add + ("/".endsWith(_add) ? "" : "/") + "WS/MetaWs");
				facBean.getOutInterceptors().add(new MetaWsClientOutInterceptor(key));
				factory.put(key, facBean);

				if (!connectionTimeout.containsKey(key)) {
					connectionTimeout.put(key, 1000 * 10l);
				}
				if (!receiveTimeout.containsKey(key)) {
					receiveTimeout.put(key, 1000 * 60 * 2l);
				}
				addressChanged.put(key, false);
			} else {
				throw new Exception("未设置[key:" + key + "]address，客户端无法初始!");
			}
		} else {
			throw new Exception("未设置[key:" + key + "]username与password，客户端无法初始!");
		}
	}

	/**
	 * 获取一个访问代理对象实例
	 * 
	 * @return
	 */
	public static synchronized MetaWsClientProxy getClientProxy() {
		return getClientProxy(DEFAULT);
	}

	public static synchronized MetaWsClientProxy getClientProxy(String key) {
		if (factory.get(key) == null) {
			return null;
		}
		MetaWsClientProxy client = new MetaWsClientProxy();
		Object o = factory.get(key).create();
		Client proxy = ClientProxy.getClient(o);
		HTTPConduit conduit = (HTTPConduit) proxy.getConduit();
		HTTPClientPolicy policy = new HTTPClientPolicy();
		policy.setConnectionTimeout(connectionTimeout.get(key));// 设置连接超时
		policy.setReceiveTimeout(receiveTimeout.get(key));// 2分钟 等待
		conduit.setClient(policy);
		client.setPort((MetaWebServicePortType) o);
		return client;
	}

	/**
	 * 获取一个访问代理对象实例
	 * 
	 * @param connectionTimeout
	 *            连接超时
	 * @param receiveTimeout
	 *            响应超时
	 * @return
	 */
	public static synchronized MetaWsClientProxy getClientProxy(long connectionTimeout, long receiveTimeout) {
		return getClientProxy(DEFAULT, connectionTimeout, receiveTimeout);
	}

	public static synchronized MetaWsClientProxy getClientProxy(String key, long connectionTimeout, long receiveTimeout) {
		if (factory.get(key) == null) {
			return null;
		}
		MetaWsClientProxy client = new MetaWsClientProxy();
		Object o = factory.get(key).create();
		Client proxy = ClientProxy.getClient(o);
		HTTPConduit conduit = (HTTPConduit) proxy.getConduit();
		HTTPClientPolicy policy = new HTTPClientPolicy();
		policy.setConnectionTimeout(connectionTimeout);// 设置连接超时
		policy.setReceiveTimeout(receiveTimeout);// 2分钟 等待
		conduit.setClient(policy);
		client.setPort((MetaWebServicePortType) o);
		return client;
	}

	/**
	 * 获取访问地址
	 * 
	 * @return
	 */
	public static String getAddress() {
		return getAddress(DEFAULT);
	}

	public static String getAddress(String key) {
		return address.get(key);
	}

	/**
	 * 设置访问地址：http://localhost:9080/bi-meta
	 * 
	 * @param address
	 */
	public static void setAddress(String address) {
		setAddress(DEFAULT, address);
	}

	public static void setAddress(String key, String address) {
		if (!address.equals(MetaWsClient.address.get(key))) {
			addressChanged.put(key, true);
			clearClient(key);// 地址发生变化，清除客户端
		}
		MetaWsClient.address.put(key, address);
	}

	/**
	 * 获取用户名
	 * 
	 * @return
	 */
	public static String getUsername() {
		return getUsername(DEFAULT);
	}

	public static String getUsername(String key) {
		return username.get(key);
	}

	/**
	 * 设置用户名
	 * 
	 * @param u
	 */
	public static void setUsername(String u) {
		setUsername(DEFAULT, u);
	}

	public static void setUsername(String key, String u) {
		username.put(key, u);
	}

	/**
	 * 获取密码
	 * 
	 * @return
	 */
	public static String getPassword() {
		return getPassword(DEFAULT);
	}

	public static String getPassword(String key) {
		return password.get(key);
	}

	/**
	 * 设置密码（明文，系统会自动加密）
	 * 
	 * @param p
	 */
	public static void setPassword(String p) {
		setPassword(DEFAULT, p);
	}

	public static void setPassword(String key, String p) {
		password.put(key, p);
	}

	/**
	 * 设置连接超时时间（单位毫秒），默认10秒
	 * 
	 * @param connectionTimeot
	 */
	public static void setConnectionTimeout(long connectionTimeot) {
		setConnectionTimeout(DEFAULT, connectionTimeot);
	}

	public static void setConnectionTimeout(String key, long ct) {
		connectionTimeout.put(key, ct);
	}

	/**
	 * 设置请求响应超时时间（单位毫秒）,默认2分钟
	 * 
	 * @param rt
	 */
	public static void setReceiveTimeout(long rt) {
		setReceiveTimeout(DEFAULT, rt);
	}

	public static void setReceiveTimeout(String key, long rt) {
		receiveTimeout.put(key, rt);
	}

	/**
	 * 清除客户端
	 * 
	 * @param key
	 */
	private static void clearClient(String key) {
		address.remove(key);
		factory.remove(key);
		connectionTimeout.remove(key);
		receiveTimeout.remove(key);
		username.remove(key);
		password.remove(key);
	}
}
