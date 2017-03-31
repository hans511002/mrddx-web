package com.ery.hadoop.hq.ws.app;

/**
 * 默认参数类型
 * 

 *             reserved.

 * @createDate 2013-3-13
 * @version v1.0
 */
public class MetaWsRequstParamPO {
    public String name;
    public boolean isMust;
    public String defaultValue;

    public MetaWsRequstParamPO(String name, boolean isMust, String defaultValue) {
	this.name = name;
	this.isMust = isMust;
	this.defaultValue = defaultValue;
    }

    public String getName() {
	return name;
    }

    public void setName(String name) {
	this.name = name;
    }

    public boolean isMust() {
	return isMust;
    }

    public void setMust(boolean isMust) {
	this.isMust = isMust;
    }

    public String getDefaultValue() {
	return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
	this.defaultValue = defaultValue;
    }
}