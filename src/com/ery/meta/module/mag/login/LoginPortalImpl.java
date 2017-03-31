package com.ery.meta.module.mag.login;

import java.util.List;
import java.util.Map;

import org.apache.cxf.common.util.CollectionUtils;

import com.ery.base.support.log4j.LogUtils;

public class LoginPortalImpl extends LoginBiMetaImpl {
	public LoginResult login(Map<String, Object> loginMessage) {
		String userName = (String) loginMessage.get("oldPortal");
		if (userName != null) {
			List<Map<String, Object>> users = super.getLoginDAO().queryUserByNamecn(userName);
			if (CollectionUtils.isEmpty(users)) {
				LogUtils.warn("无此用户！");
				return LoginResult.ERROR_USER_PASSWD;
			} else if (users.size() > 1) {
				LogUtils.warn("根据用户传入信息 匹配出多个用户！");
				return LoginResult.ERROR_NAME_REPEAT;
			}
			this.userData = users.get(0);
			return super.afterLoginVaildate(loginMessage, this.userData);
		} else {
			LogUtils.warn("用户名" + userName + "为空");
			return null;
		}
	}
}
