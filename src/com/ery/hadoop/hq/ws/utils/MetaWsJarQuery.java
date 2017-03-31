package com.ery.hadoop.hq.ws.utils;

import java.util.Map;

import com.ery.base.support.jdbc.DataAccess;

/**

 * 

 * @description 自实现jar查询接口
 * @date 12-11-5 -
 * @modify
 * @modifyDate -
 */
public interface MetaWsJarQuery {

	public Object executeQuery(StringBuffer logBuffer, Map<String, Object> params, DataAccess access) throws Exception;

}
