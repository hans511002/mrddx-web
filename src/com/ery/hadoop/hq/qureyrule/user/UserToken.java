package com.ery.hadoop.hq.qureyrule.user;

import java.util.HashMap;
import java.util.Map;

import com.ery.base.support.utils.MapUtils;

public class UserToken {
	private long userId;
	private String username;
	private String password;

	public UserToken() {
	}

	public UserToken(Map<String, Object> map) {
		userId = MapUtils.getLongValue(map, "USER_ID");
		username = MapUtils.getString(map, "USER_NAME");
		password = MapUtils.getString(map, "USER_PASS");
	}

	public Map<String, Object> toMap() {
		Map<String, Object> col = new HashMap<String, Object>();
		col.put("userId", userId);
		col.put("username", username);
		col.put("password", password);
		return col;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}
}
