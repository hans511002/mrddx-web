package com.ery.meta.web;

import javax.servlet.ServletContext;

import com.ery.base.support.web.ISystemStart;
import com.ery.meta.sys.code.CodeManager;

public class CodesInit implements ISystemStart {

	/*
	 */
	public void destory() {
		CodeManager.clear();
	}

	public void init() {
		CodeManager.load();
	}

	/*
	 */
	public void setServletContext(ServletContext arg0) {

	}

}
