package com.ery.meta.web;

import javax.servlet.ServletContext;

import com.ery.base.support.web.ISystemStart;
import com.ery.meta.sys.i18n.I18nManager;

public class I18nInit implements ISystemStart {
	/*
	 */
	public void destory() {
		I18nManager.clear();
	}

	/*
	 */
	public void init() {
		I18nManager.load();
	}

	/*
	 */
	public void setServletContext(ServletContext arg0) {

	}
}
