package com.ery.meta.module.mag.login;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import com.ery.meta.web.session.SessionManager;

import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.utils.MapUtils;


public class LoginBiMetaImpl extends LoginCommonImpl {

	/**
	 * 进行先决行验证。验证验证码
	 * 
	 * @param loginMessage
	 * @return 验证失败返回一个实体对象，返回NULL代表验证成功。
	 */
	public LoginResult beginLogin(Map<String, Object> loginMessage) {
		// 获取界面输入框的验证码
		String inputCode = loginMessage.get("validateCode") == null ? "" : loginMessage.get("validateCode").toString();
		// 获取保存到session中的验证码
		String sessionCode = (String) SessionManager.getAttribute("randomCode");
		String loginId = loginMessage.get("loginId") == null ? "" : loginMessage.get("loginId").toString();
		// 密码
		String password = loginMessage.get("password") == null ? "" : loginMessage.get("password").toString();
		if (null == sessionCode) {
			return LoginResult.ERROR_VALIDATEOVERDUE;
		} else if (!sessionCode.equalsIgnoreCase(inputCode)) { // 验证码比较不区分大小写
			return LoginResult.ERROR_VALIDATECODE;
		} else if (loginId.equals("") || password.equals("")) {
			return LoginResult.ERROR_USER_PASSWD;
		}
		return null;
	}

	/**
	 * Bi 大数据平台管理登录。
	 * 
	 * @param loginMessage
	 * @return
	 */
	public LoginResult login(Map<String, Object> loginMessage) {
		LoginResult beforeLoginRs = beginLogin(loginMessage);
		if (beforeLoginRs == null) {
			LoginResult rs = super.login(loginMessage);
			return rs;
		} else {
			return beforeLoginRs;
		}
	}

	/**
	 * 查询数据后，做基本效验
	 * 
	 * @param loginMessage
	 * @return
	 */
	public LoginResult afterLoginVaildate(Map<String, Object> loginMessage, Map<String, Object> userData) {
		if (super.afterLoginVaildate(loginMessage, userData) == LoginResult.SUCCESS) {
			// 检查用后是否第一次登录 排除隐藏ID 和 超级管理员
			Object loginDate = userData.get("CHANGE_TIME");

			if (loginDate == null || "".equals(loginDate.toString().trim())) {
				return LoginResult.USER_FIRST_LOGIN;
			}
			if (MapUtils.getIntValue(userData, "VIP_FLAG", 0) != 1) {// 如果是VIP客户则不需验证是否超时忘记修改密码
				// 判断用登陆时长并返回相应的结果
				String userForceModifyPassS = SystemVariable.getString("userForceModifyPassS", "90*24*60*60*1000");
				String userTipModifyPassS = SystemVariable.getString("userTipModifyPass", "80*24*60*60*1000");

				String userTipModifyPass[] = userTipModifyPassS.contains("*") ? userTipModifyPassS.split("\\*")
						: new String[] { userTipModifyPassS };
				String userForceModifyPass[] = userForceModifyPassS.contains("*") ? userForceModifyPassS.split("\\*")
						: new String[] { userForceModifyPassS };
				long timeTipPass = 1;
				long timeForcePass = 1;
				for (int i = 0; i < userTipModifyPass.length; i++) {
					timeTipPass = timeTipPass * Long.parseLong(userTipModifyPass[i]);
				}
				for (int i = 0; i < userForceModifyPass.length; i++) {
					timeForcePass = timeForcePass * Long.parseLong(userForceModifyPass[i]);
				}
				// 得到提示修改密码的时间
				DateFormat simple = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				java.util.Date dateTip = new java.util.Date(System.currentTimeMillis() - timeTipPass);
				java.util.Date dateForce = new Date(System.currentTimeMillis() - timeForcePass);
				if (loginDate.toString().compareTo(simple.format(dateForce)) < 0) {
					return LoginResult.USER_FORCE_MODIFY_PASS;
				}
				if (loginDate.toString().compareTo(simple.format(dateTip)) < 0) {
					return LoginResult.USER_TIP_MODIFY_PASS;
				}
			}
		} else {
			return LoginResult.SUCCESS;
		}
		return LoginResult.SUCCESS;
	}
}
