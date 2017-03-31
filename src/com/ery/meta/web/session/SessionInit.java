package com.ery.meta.web.session;

import java.lang.reflect.InvocationTargetException;

import javax.servlet.ServletContext;

import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.web.ISystemStart;

public class SessionInit implements ISystemStart {

	/*
	 */
	public void destory() {
		SessionManager.destroy();
		SessionContext.destory();
	}

	/*
	 */
	public void init() {
		String handlerStr = SystemVariable.getString("session.handler", "");
		String[] handlers = handlerStr.split(",");
		for (String handler : handlers) {
			String[] array = handler.split(":");
			if (array.length != 2)
				continue;
			String key = array[0];
			String className = array[1];
			try {
				SessionAttributeListener.addHandler(key, (AbstractSessionEvtHandler) Class.forName(className)
						.getConstructor(String.class).newInstance(key));
			} catch (InstantiationException e) {
				e.printStackTrace();
			} catch (IllegalAccessException e) {
				e.printStackTrace();
			} catch (ClassNotFoundException e) {
				e.printStackTrace();
			} catch (IllegalArgumentException e) {
				e.printStackTrace();
			} catch (SecurityException e) {
				e.printStackTrace();
			} catch (InvocationTargetException e) {
				e.printStackTrace();
			} catch (NoSuchMethodException e) {
				e.printStackTrace();
			}
		}
	}

	/*
	 */
	public void setServletContext(ServletContext servletContext) {
	}

}
