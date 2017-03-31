package com.ery.hadoop.hq.ws.client.test;

import java.util.Map;

import com.ery.hadoop.hq.ws.utils.MetaWsJarNoQuery;
import com.ery.hadoop.hq.ws.utils.MetaWsJarQuery;
import com.ery.hadoop.hq.ws.utils.WsDesc;
import com.ery.hadoop.hq.ws.utils.WsParam;
import com.ery.hadoop.hq.ws.utils.WsParams;
import com.ery.base.support.jdbc.DataAccess;

/**

 * 

 * @description 测试客户端jar
 * @date 12-10-30 -
 * @modify
 * @modifyDate -
 */
@WsDesc("测试class")
public class TestWsJar implements MetaWsJarQuery, MetaWsJarNoQuery {

	@WsParams({ @WsParam(name = "GDL_NAME", valueType = String.class, required = false),
			@WsParam(name = "GDL_ID", valueType = Long.class, defVal = "0") })
	public Object executeQuery(StringBuffer logBuffer, Map<String, Object> params, DataAccess access) throws Exception {
		return null; // To change body of implemented methods use File |
		// Settings | File Templates.
	}

	public void executeNoQuery(StringBuffer logBuffer, Map<String, Object> params, DataAccess access) throws Exception {
		// To change body of implemented methods use File | Settings | File
		// Templates.
	}
}
