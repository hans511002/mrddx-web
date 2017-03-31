package com.ery.hadoop.hq.ws.app;

import org.apache.cxf.binding.soap.SoapMessage;
import org.apache.cxf.interceptor.Fault;
import org.apache.cxf.phase.AbstractPhaseInterceptor;
import org.apache.cxf.phase.Phase;

import com.ery.base.support.sys.DataSourceManager;

/**

 * 

 * @description
 * @date 12-10-25 -
 * @modify
 * @modifyDate -
 */
public class MetaWsOutInterceptor extends AbstractPhaseInterceptor<SoapMessage> {

	public MetaWsOutInterceptor() {
		super(Phase.SEND_ENDING);
	}

	public void handleMessage(SoapMessage message) throws Fault {
		MetaWSContext.logout();// 清楚本次访问内存数据
		DataSourceManager.destroy(); // 关闭连接
	}

}
