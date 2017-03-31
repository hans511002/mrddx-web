package com.ery.meta.module.rule;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;


public class RollbackAction {

	private RollbackDao rollbackDao;

	public void setRollbackDao(RollbackDao rollbackDao) {
		this.rollbackDao = rollbackDao;
	}

	/**
	 * 查询回退和调账的rowkey组合规则列表
	 * 
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryRollbackList(Map<String, Object> data, Page page) {
		if (page == null) {
			page = new Page(0, 20);
		}
		List<Map<String, Object>> list = this.rollbackDao.queryRollbackList(data, page);
		return list;
	}

	/**
	 * 保存回退和调账的rowkey组合规则
	 * 
	 * @param data
	 * @return
	 */
	public String savedRollback(Map<String, Object> data) {
		try {
			BaseDAO.beginTransaction();
			this.rollbackDao.saveRollback(data);
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("新增数据源出错", e);
			return "false";
		}
		return "success";
	}

	/**
	 * 删除回退和调账的rowkey组合规则
	 * 
	 * @param id 规则ID
	 * @return
	 */
	public Map<String, Object> deleteRollback(String id) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();
			this.rollbackDao.deleteRollback(id);
			BaseDAO.commit();
			result.put("flag", "success");
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("删除回退和调账的rowkey组合规则", e);
			result.put("flag", "error");
		}
		return result;
	}
}
