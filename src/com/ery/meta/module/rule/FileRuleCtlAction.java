package com.ery.meta.module.rule;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;


public class FileRuleCtlAction {
	private FileRuleCtlDao fileRuleCtlDao;

	public void setFileRuleCtlDao(FileRuleCtlDao fileRuleCtlDao) {
		this.fileRuleCtlDao = fileRuleCtlDao;
	}

	/**
	 * 查询文件规则列表
	 * 
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryFileRuleCtlList(Map<String, Object> data, Page page) {
		if (page == null) {
			page = new Page(0, 20);
		}
		List<Map<String, Object>> list = this.fileRuleCtlDao.queryFileRuleCtlList(data, page);
		return list;
	}

	/**
	 * 保存文件规则
	 * 
	 * @param data
	 * @return
	 */
	public String savedFileRuleCtl(Map<String, Object> data) {
		try {
			BaseDAO.beginTransaction();
			fileRuleCtlDao.saveFileRuleCtl(data);
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("新增数据源出错", e);
			return "false";
		}
		return "success";
	}

	/**
	 * 删除文件规则
	 * 
	 * @param id 规则ID
	 * @return
	 */
	public Map<String, Object> deleteFileRuleCtl(String id) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();
			fileRuleCtlDao.deleteFileRuleCtl(id);
			BaseDAO.commit();
			result.put("flag", "success");
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("删除数据源出错", e);
			result.put("flag", "error");
		}
		return result;
	}
}
