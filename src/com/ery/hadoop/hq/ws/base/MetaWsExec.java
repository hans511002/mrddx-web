package com.ery.hadoop.hq.ws.base;

import com.ery.hadoop.hq.ws.utils.WsRequest;

/**

 * 

 * @description 权限规则执行接口
 * @date 12-10-26 -
 * @modify
 * @modifyDate -
 */
public abstract class MetaWsExec {

    public static final int TYPE_SQL = 0;
    public static final int TYPE_JAR = 1;

    /**
     * 执行
     * 
     * @param request
     * @return json
     * @throws Exception
     */
    public abstract String execute(WsRequest request, StringBuffer logBuffer) throws Exception;

    /**
     * 执行前置验证，构造参数等
     * 
     * @param request
     * @param buffer
     *            不成功时，记录错误信息!
     * @throws Exception
     */
    public boolean before(WsRequest request, StringBuffer buffer) throws Exception {
	return true;
    }

    public static MetaWsExec getInstance(int type) {
	switch (type) {
	case 0:
	    return new WsExecuteSQLRule();
	case 1:
	    return new WsExecuteJARRule();
	default:
	    return null;
	}
    }

}
