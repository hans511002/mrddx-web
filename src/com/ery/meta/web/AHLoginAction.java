package com.ery.meta.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;

public class AHLoginAction {
	private AHLoginDao ahLoginDao;

	/*
	 * 根据用户帐号查询该用户是否已存在 0:不存在 1：存在 当已存在查出该记录，不存在时插入一条
	 * 
	 * @param username
	 * 
	 * @return map
	 */
	public Map<String, Object> getUserDate(Map<String, Object> userInfo) {
		Map<String, Object> userDate = new HashMap<String, Object>();
		String userNameCn = userInfo.get("staffAccount").toString(); // 用户帐号
		try {
			// 查询该用户是否已存在 0:不存在 1：存在
			int user_num = ahLoginDao.isUser_Exist(userNameCn);
			if (user_num == 0) {
				ahLoginDao.insertUserByCondition(userInfo);
				userDate = ahLoginDao.getUserInfo(userNameCn);
			} else if (user_num == 1) {
				userDate = ahLoginDao.getUserInfo(userNameCn);
			} else {
				userDate = null;
			}
		} catch (Exception e) {
			LogUtils.error(null, e);
			return null;
		}

		return userDate;
	}

	/*
	 * 将该用户对应的菜单删除后，重新插入
	 * 
	 * @param username
	 * 
	 * @return map
	 */
	public int setMenu(Map<String, Object> userData, List menuId) {
		int flag = 0;
		try {
			BaseDAO.beginTransaction();

			flag = ahLoginDao.deleteMenuId(userData);
			ahLoginDao.insertBatchUserMenu(userData, menuId);
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error(null, e);
			return -1;
		}
		return flag;
	}

	public AHLoginDao getAhLoginDao() {
		return ahLoginDao;
	}

	public void setAhLoginDao(AHLoginDao ahLoginDao) {
		this.ahLoginDao = ahLoginDao;
	}

}
