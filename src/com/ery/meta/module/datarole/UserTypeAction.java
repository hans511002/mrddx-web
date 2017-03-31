package com.ery.meta.module.datarole;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import com.ery.meta.common.Page;
import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.web.session.SessionManager;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;


public class UserTypeAction {

	private UserTypeDAO userTypeDao;

	/**
	 * 查询所有的用户业务类型管理
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryType(Map<String, Object> data, Page page) {
		return userTypeDao.queryType(data, page);
	}

	public List<Map<String, Object>> queryUserType(Map<String, Object> data, Page page) {
		return userTypeDao.queryUserType(data, page);
	}

	public List<Map<String, String>> queryActionType(Map<String, Object> data) {
		List<Map<String, String>> listMap = null;
		if (data != null && data.containsKey("userid") && !data.get("userid").toString().equals("")) {
			String userid = data.get("userid").toString();
			List<Map<String, Object>> userAction = userTypeDao.queryUserAction(userid);
			listMap = UserTypeData.GET_ACTION_TYPE_LIST();
			for (Map<String, String> listmap : listMap) {
				for (Map<String, Object> map : userAction) {
					if (map.get("ACTION_TYPE").toString().equals(listmap.get("ACTION_ID").toString())) {
						listmap.put("FLAG", "1");
						break;
					} else {
						listmap.put("FLAG", "0");
					}
				}
			}
		} else {
			listMap = UserTypeData.GET_ACTION_TYPE_LIST();
			for (Map<String, String> listmap : listMap) {
				listmap.put("FLAG", "0");
			}
		}
		return listMap;
	}

	public List<Map<String, String>> getUserAction() {
		List<Map<String, String>> listMap = null;
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		String userid = formatUser.get("userId").toString();
		List<Map<String, Object>> userAction = userTypeDao.queryUserAction(userid);
		listMap = UserTypeData.GET_ACTION_TYPE_LIST();
		for (Map<String, String> listmap : listMap) {
			for (Map<String, Object> map : userAction) {
				if (map.get("ACTION_TYPE").toString().equals(listmap.get("ACTION_ID").toString())) {
					listmap.put("FLAG", "1");
					break;
				} else {
					listmap.put("FLAG", "0");
				}
			}
		}
		return listMap;
	}

	public List<Map<String, Object>> queryUser(Map<String, Object> data, Page page) {
		return userTypeDao.queryUser(data, page);
	}

	/**
	 * 新增业务类型
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> insertType(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();

			result = userTypeDao.insertType(data);
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("", e);
		}
		return result;
	}

	/**
	 * 关联业务类型
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> saveUserType(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();
			result = userTypeDao.saveUserType(data);
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("", e);
		}
		return result;
	}

	public Map<String, Object> saveUserAction(Map<String, Object> data) {
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		data.put("createUserDate", formatUser.get("userId"));
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();
			result = userTypeDao.saveUserAction(data);
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("", e);
		}
		return result;
	}

	public void setdataSourceDAO(UserTypeDAO collectionDAO) {
		this.userTypeDao = collectionDAO;
	}

	/**
	 * 根据ID删除
	 * 
	 * @param collectJobId
	 * @return
	 */
	public boolean deleteType(long typeId) {
		boolean result = false;
		BaseDAO.beginTransaction();
		result = userTypeDao.deleteType(typeId);
		BaseDAO.commit();
		return result;
	}

	/**
	 * 根据ID删除
	 * 
	 * @param collectJobId
	 * @return
	 */
	public boolean deleteUserAction(String userId) {
		boolean result = false;
		BaseDAO.beginTransaction();
		result = userTypeDao.deleteUserAction(userId);
		BaseDAO.commit();
		return result;
	}

	/**
	 * 获取当前用户业务类型
	 * 
	 * @param data
	 * @return
	 */

	public List<Map<String, Object>> queryTypeByUser(Map<String, Object> data) {
		if (data == null) {
			data = new HashMap<String, Object>();
			HttpSession session = SessionManager.getCurrentSession();
			@SuppressWarnings("unchecked")
			Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
			data.put("USER_ID", formatUser.get("userId"));
		}
		if (userTypeDao == null) {
			userTypeDao = new UserTypeDAO();
		}
		List<Map<String, Object>> list = userTypeDao.queryTypeByUser(data);
		return list;
	}

}
