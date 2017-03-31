package com.ery.hadoop.hq.ws.utils;

import java.util.Map;

import com.ery.base.support.jdbc.DataAccess;

/**

 * 

 * @description 自实现jar非查询接口
 * @date 12-10-30 -
 * @modify
 * @modifyDate -
 */
public interface MetaWsJarNoQuery {

	public void executeNoQuery(StringBuffer logBuffer, Map<String, Object> params, DataAccess access) throws Exception;

}
