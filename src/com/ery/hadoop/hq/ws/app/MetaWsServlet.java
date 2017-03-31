package com.ery.hadoop.hq.ws.app;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;

import org.apache.cxf.Bus;
import org.apache.cxf.BusFactory;
import org.apache.cxf.frontend.ServerFactoryBean;
import org.apache.cxf.transport.servlet.CXFNonSpringServlet;

/**

 * 

 * @description 无spring 发布WebService，基予cxf
 * @date 12-10-24 -
 * @modify
 * @modifyDate -
 */
public class MetaWsServlet extends CXFNonSpringServlet {

    /**
     * ID
     */
    private static final long serialVersionUID = 1L;

    public void loadBus(ServletConfig servletConfig) throws ServletException {
	super.loadBus(servletConfig);

	MetaWSContext.init();// 初始全局上下文

	Bus bus = getBus();
	BusFactory.setDefaultBus(bus);
	MetaWebService metaws = new MetaWebService();
	ServerFactoryBean svrFactory = new ServerFactoryBean();
	svrFactory.setServiceClass(metaws.getClass());
	svrFactory.setAddress("/MetaWs");
	svrFactory.setServiceBean(metaws);

	// 添加用户验证拦截器
	svrFactory.getInInterceptors().add(new MetaWsInInterceptor());

	// 登出，关闭连接拦截器
	svrFactory.getOutInterceptors().add(new MetaWsOutInterceptor());

	// svrFactory.getServiceFactory().setDataBinding(new
	// AegisDatabinding());
	svrFactory.create();
    }
}
