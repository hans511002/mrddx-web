package com.ery.meta.module.datarole;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;


public class UserAuthorAction {

	private UserAuthorDAO userAuthorDao;

	/**
	 * 查询所有的采集数据信息
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryAuthor(Map<String, Object> data, Page page) {
		return userAuthorDao.queryAuthor(data, page);
	}

	public List<Map<String, Object>> queryUserAuthor(Map<String, Object> data, Page page) {
		return userAuthorDao.queryUserAuthor(data, page);
	}

	public List<Map<String, Object>> queryUser(Map<String, Object> data, Page page) {
		return userAuthorDao.queryUser(data, page);
	}

	/**
	 * 新增业务类型
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> insertAuthor(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();

			result = userAuthorDao.insertAuthor(data);
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
	public Map<String, Object> saveUserAuthor(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();
			result = userAuthorDao.saveUserAuthor(data);
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("", e);
		}
		return result;
	}

	public void setdataSourceDAO(UserAuthorDAO collectionDAO) {
		this.userAuthorDao = collectionDAO;
	}

	/**
	 * 根据ID删除
	 * 
	 * @param collectJobId
	 * @return
	 */
	public boolean deleteAuthor(long typeId) {
		boolean result = false;
		BaseDAO.beginTransaction();
		result = userAuthorDao.deleteAuthor(typeId);
		BaseDAO.commit();
		return result;
	}

	public Map<String, Object> getJobUser(String taskId, String taskType) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();
			result = userAuthorDao.getJobUser(taskId, taskType);
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("", e);
		}
		return result;
	}

	public Map<String, Object> changeCreateUser(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();
			result = userAuthorDao.changeCreateUser(data);
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("", e);
		}
		return result;
	}

	public Map<String, Object> changeUserRole(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();
			result = userAuthorDao.changeUserRole(data);
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("", e);
		}
		return result;
	}

}
