package com.ery.meta.module.mag.login;

import java.util.List;
import java.util.Map;

import org.apache.cxf.common.util.CollectionUtils;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.MapUtils;

/**

 * @description 作用：用户同步登陆
 * @date 2012-12-17 下午02:19:45
 */
public class LoginUserSynImpl extends LoginCommonImpl {

	public LoginResult login(Map<String, Object> loginMessage) {
		long userId = MapUtils.getLongValue(loginMessage, "userId", 0);
		String userNamecn = MapUtils.getString(loginMessage, "userNamecn", "");
		if (userId != 0) {
			List<Map<String, Object>> users = super.getLoginDAO().queryUserByUserId(userId);
			if (CollectionUtils.isEmpty(users)) {
				LogUtils.warn("无此用户！");
				return LoginResult.ERROR_USER_PASSWD;
			} else if (users.size() > 1) {
				LogUtils.warn("根据用户传入信息 匹配出多个用户！");
				return LoginResult.ERROR_NAME_REPEAT;
			}
			this.userData = users.get(0);
			return super.afterLoginVaildate(loginMessage, this.userData);
		} else if (!userNamecn.equals("")) {
			List<Map<String, Object>> users = super.getLoginDAO().queryUserByUserNameEn(userNamecn);
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
			LogUtils.warn("用户id和用户中文名为空！");
			return null;
		}
	}

	/**
	 * 废弃掉
	 */
	public LoginResult login1(Map<String, Object> loginMessage) {
		long userId = MapUtils.getLongValue(loginMessage, "userId", 0);
		if (userId != 0) {
			List<Map<String, Object>> users = super.getLoginDAO().queryUserByUserId(userId);
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
			LogUtils.warn("用户id为空！");
			return null;
		}
	}
}
