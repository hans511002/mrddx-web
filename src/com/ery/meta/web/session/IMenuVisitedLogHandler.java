package com.ery.meta.web.session;

public interface IMenuVisitedLogHandler {
	public void log(User user, AbstractMenu preMenu, AbstractMenu curMenu);
}
