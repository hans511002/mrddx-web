package com.ery.meta.module.hBaseQuery;

public class SortBean {
	private String name;
	private String sign;
	public SortBean(String name, String sign) {
		this.name = name;
		this.sign = sign;
	}

	public Object getSortItem() {
		return this.name;
	}

	public String getSortSign() {
		return this.sign;
	}

}
