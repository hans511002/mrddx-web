package com.ery.meta.module.mag.timer;

import java.util.List;
import java.util.Map;

import com.ery.meta.module.mag.user.UserConstant;
import com.ery.meta.module.mag.user.UserDAO;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.utils.Convert;



public class UserCtrlrTimer implements IMetaTimer {
	private UserDAO userDAO;

	public void init() {
		userDAO = new UserDAO();
	}

	/**
	 * 定期器实现任务程序
	 * 
	 * @param timerName timer唯一标识
	 */
	public void run(String timerName) {
		String hiddenStations = SystemVariable.getString("hidden.stations", "22");
		String userLoseTimes = SystemVariable.getString("userloselongtime", "30*24*60*60*1000");
		// 获取 超级用户，取消禁用
		String userLoseTime[] = userLoseTimes.contains("*") ? userLoseTimes.split("\\*")
				: new String[] { userLoseTimes };
		String hiddenStation[] = hiddenStations.contains(",") ? hiddenStations.split(",")
				: new String[] { hiddenStations };
		long timeLong = 1;
		for (int i = 0; i < userLoseTime.length; i++) {
			timeLong = timeLong * Long.parseLong(userLoseTime[i]);
		}
		// 得到禁用的
		java.util.Date date = new java.util.Date(System.currentTimeMillis() - timeLong);
		List<Map<String, Object>> list = userDAO.getUserLoginLast(hiddenStation, date);
		int[] intName = new int[list.size()];

		for (int j = 0; j < list.size(); j++) {
			intName[j] = Convert.toInt(list.get(j).get("USER_ID"));
		}
		try {
			userDAO.disableUser(intName);
			// 记录日志
			userDAO.insertUserChangeLog(intName, UserConstant.META_MAG_USER_CHANGE_NAME_DISABLEUSER,
					UserConstant.META_MAG_USER_EDITOR_TYPE_AUTO, null);
		} catch (Exception e) {
			LogUtils.error("用户禁用失败", e);
		}
	}
}
