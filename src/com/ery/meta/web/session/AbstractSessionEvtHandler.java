package com.ery.meta.web.session;

import javax.servlet.http.HttpSession;

public abstract class AbstractSessionEvtHandler {
	private String key;

	public AbstractSessionEvtHandler(String key) {
		this.key = key;
	}

	public String getKey() {
		return key;
	}

	public abstract void attributeAdded(HttpSession session);

	public abstract void attributeRemoved(HttpSession session);

	public abstract void attributeReplaced(Object preValue, Object curValue, HttpSession session);

	public abstract void sessionDestroyed(HttpSession session);
}
