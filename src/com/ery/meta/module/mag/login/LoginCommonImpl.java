package com.ery.meta.module.mag.login;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ery.meta.common.Common;
import com.ery.meta.module.mag.user.UserConstant;
import com.ery.meta.module.mag.user.UserDAO;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;


public class LoginCommonImpl implements ILoginType {
	/**
	 * UserDao 操作类
	 */
	private UserDAO loginDAO;
	/**
	 * 查询的用户数据，可能多条
	 */
	protected List<Map<String, Object>> loginData;

	/**
	 * 最终的用户数据
	 */
	protected Map<String, Object> userData;

	public void setLoginDAO(BaseDAO loginDAO) {
		this.loginDAO = (UserDAO) loginDAO;
	}

	public UserDAO getLoginDAO() {
		return this.loginDAO;
	}

	/**
	 * 常规用户登录实现类
	 * 
	 * @param loginMessage
	 * @return
	 */
	public LoginResult login(Map<String, Object> loginMessage) {
		// 获取保存到session中的验证码
		String loginId = loginMessage.get("loginId") == null ? "" : loginMessage.get("loginId").toString();
		// 密码
		String password = loginMessage.get("password") == null ? "" : loginMessage.get("password").toString();
		List<Map<String, Object>> rs = null;
		// 正则表达式判断是否是Email
		Pattern pattern = Pattern.compile("\\w+@\\w+(\\.\\w+)+");
		Pattern ptel = Pattern.compile("^((13[0-9])|(15[^4,\\D])|(18[0,5-9]))\\d{8}$");
		Matcher matcher = pattern.matcher(loginId);
		Matcher matchertel = ptel.matcher(loginId);
		// loginMessage.put("password", password);
		if (matcher.matches()) {// 匹配用Email登录
			rs = getLoginDAO().queryUserByEmail(loginId);
		} else if (matchertel.matches()) {// 匹配手机
			rs = getLoginDAO().queryUserByTel(loginId);
		} else {// 尝试用中文名
			rs = getLoginDAO().queryUserByNamecn(loginId);
		}
		loginData = rs;
		if (loginData == null) {
			return LoginResult.ERROR_USER_PASSWD;
		}
		if (loginData.size() == 0) {
			return LoginResult.ERROR_USER_PASSWD;
		}
		if (loginData.size() > 1) {
			LogUtils.warn("根据用户传入信息 匹配出多个用户！");
			return LoginResult.ERROR_NAME_REPEAT;
		}
		// 密码
		password = Common.getMD5(password.getBytes());
		Map<String, Object> userData = loginData.get(0);
		if (!password.equals(userData.get("USER_PASS"))) {// 密码匹配成功
			return LoginResult.ERROR_USER_PASSWD;
		}
		return afterLoginVaildate(loginMessage, userData);
	}

	// }

	/**
	 * 查询数据后，做基本效验
	 * 
	 * @param loginMessage
	 * @return
	 */
	public LoginResult afterLoginVaildate(Map<String, Object> loginMessage, Map<String, Object> userData) {
		Object userState = userData.get("STATE");
		// 检查系统状态
		Object groupState = userData.get("GROUP_STATE");
		if (groupState != null) {
			switch (Integer.parseInt(groupState.toString())) {
			case UserConstant.META_MENU_GROUP_STATE_DISENABLE: {
				return LoginResult.ERROR_GROUP_DISENBLE;
			}
			default:
				break;
			}
		}

		if (userState != null) {
			switch (Integer.parseInt(userState.toString())) {
			case UserConstant.META_MAG_USER_STATE_DISABLE: {
				return LoginResult.ERROR_DISABLED;
			}
			case UserConstant.META_MAG_USER_STATE_AUDITING: {
				return LoginResult.ERROR_AUDITING;
			}
			case UserConstant.META_MAG_USER_STATE_LOCK: {
				return LoginResult.ERROR_LOCKING;
			}
			default:
				break;
			}
		}
		this.userData = userData;
		return LoginResult.SUCCESS;
	}

	/**
	 * 登录成功之后返回用户的数据
	 * 
	 * @return
	 */
	public Map<String, Object> getUserData() {
		return this.userData;
	}
}
