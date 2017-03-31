package com.ery.hadoop.hq.ws.utils;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.hadoop.hq.log.HQLog;

/**
 * 
 * 
 * 
 * @description 请求对象
 * @date 12-10-26 -
 * @modify
 * @modifyDate -
 */
public class WsRequest implements Serializable {

	private static final long serialVersionUID = 1L;
	public static final String HEADER_NAME = "AuthSoapHeader";
	public static final String HEADER_USERNAME = "tns:username";
	public static final String HEADER_PASSWORD = "tns:password";
	public static final String PAR_SIMPLE_MAP = "_pmap_";
	public static final String PAR_SIMPLE_OBJ = "_pobj_";
	public static final String PAR_SIMPLE_ARRAY = "_parray_";
	public static final String PAR_MAP_ARRAY = "_pmaparray_";
	public static final String HQ_LOG = "_hqlog_";

	private String ruleCode;// 规则编码
	private int type;// 0无参数，1基本类型参数，2数组，3Map对象，4map对象数组
	private Object baseObject;// 基本类型对象
	private List<Object> simpleArray;// 简单数组
	private HashMap<String, Object> simpleMap;// 简单map
	private List<HashMap<String, Object>> mapArray;// map数组
	private HQLog hqlog; // 记录过程的日志对象.

	public String getRuleCode() {
		return ruleCode;
	}

	public void setRuleCode(String ruleCode) {
		this.ruleCode = ruleCode;
	}

	public int getType() {
		return type;
	}

	public Object getBaseObject() {
		return baseObject;
	}

	public void setBaseObject(Object baseObject) {
		this.baseObject = baseObject;
		if (baseObject != null)
			type = 1;
	}

	public List<Object> getSimpleArray() {
		return simpleArray;
	}

	public void setSimpleArray(List<Object> simpleArray) {
		this.simpleArray = simpleArray;
		if (simpleArray != null)
			type = 2;
	}

	public Map<String, Object> getSimpleMap() {
		return simpleMap;
	}

	public void setSimpleMap(HashMap<String, Object> simpleMap) {
		this.simpleMap = simpleMap;
		if (simpleMap != null)
			type = 3;
	}

	public List<HashMap<String, Object>> getMapArray() {
		return mapArray;
	}

	public void setMapArray(List<HashMap<String, Object>> mapArray) {
		this.mapArray = mapArray;
		if (mapArray != null)
			type = 4;
	}

	public HQLog getHqlog() {
		return hqlog;
	}

	public void setHqlog(HQLog hqlog) {
		this.hqlog = hqlog;
	}
}
