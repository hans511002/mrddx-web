package com.ery.meta.module.bigdata.datax;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;
import com.ery.meta.module.datarole.UserAuthorDAO;

import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;


public class CollectionAction {

	private CollectionDAO collectionDAO;
	private UserAuthorDAO userAuthorDAO;

	/**
	 * 查询所有的采集数据信息
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryJob(Map<String, Object> data, Page page) {
		return collectionDAO.queryJob(data, page);
	}

	public Map<String, Object> queryJobById(String id) {
		Map<String, Object> map = collectionDAO.queryJobById(id);
		Object obj = map.get("PLUGIN_CODE");
		if (obj instanceof oracle.sql.BLOB) {
			String s = StringUtil.convertBLOBtoString((oracle.sql.BLOB) obj);
			map.put("PLUGIN_CODE", s);
		}

		return map;
	}

	/**
	 * 根据ID采集数据类型
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryParamById(Map<String, Object> data, Page page) {
		return collectionDAO.queryParamById(data, page);
	}

	/**
	 * 新增采集任务
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> insertJob(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();
			// 主键、外键关系
			result = collectionDAO.insertJob(data);// 先新增采集任务表
			if (data.get("COL_ID") == null || data.get("COL_ID").equals("")) {
				userAuthorDAO.insertUserAuthor("1", result.get("COL_ID").toString());
			}
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("", e);
		}
		return result;
	}

	public void setdataSourceDAO(CollectionDAO collectionDAO) {
		this.collectionDAO = collectionDAO;
	}

	public void setUserAuthorDAO(UserAuthorDAO userAuthorDAO) {
		this.userAuthorDAO = userAuthorDAO;
	}

	/**
	 * 根据ID删除
	 * 
	 * @param collectJobId
	 * @return
	 */
	public boolean deleteJob(long collectJobId) {
		boolean result = false;
		BaseDAO.beginTransaction();
		result = collectionDAO.deleteJob(collectJobId);
		userAuthorDAO.delete(collectJobId, 1);
		BaseDAO.commit();
		return result;
	}

	/**
	 * 根据ID删除Par
	 * 
	 * @param collectJobId
	 * @return
	 */
	public int deletePar(long collectParId) {
		try {
			BaseDAO.beginTransaction();
			int count = collectionDAO.getCountParByParId(collectParId);
			if (count < 2) {
				return 2;
			}
			collectionDAO.deletePar(collectParId);
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("", e);
			return 0;
		}
		return 1;
	}

	/**
	 * 根据ID删除
	 * 
	 * @param collectJobId
	 * @return
	 */
	public boolean statusJob(long collectJobId, int status) {
		boolean result = false;
		BaseDAO.beginTransaction();
		result = collectionDAO.statusJob(collectJobId, status);
		BaseDAO.commit();
		return result;
	}
}
