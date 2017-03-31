package com.ery.meta.module.rule;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;


public class FileImpAction {
	private FileImpDao fileImpDao;

	/**
	 * 查询入库文件与hbase表之间的映射关系配置列表
	 * 
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryFileImpList(Map<String, Object> data, Page page) {
		if (page == null) {
			page = new Page(0, 20);
		}
		List<Map<String, Object>> list = this.fileImpDao.queryFileImpList(data, page);
		return list;
	}

	/**
	 * 保存入库文件与hbase表之间的映射关系配置
	 * 
	 * @param data
	 * @return
	 */
	public String savedFileImp(Map<String, Object> data) {
		try {
			BaseDAO.beginTransaction();
			this.fileImpDao.saveFileImp(data);
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("新增数据源出错", e);
			return "false";
		}
		return "success";
	}

	/**
	 * 删除入库文件与hbase表之间的映射关系配置
	 * 
	 * @param id 关系ID
	 * @return
	 */
	public Map<String, Object> deleteFileImp(String id) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();
			this.fileImpDao.deleteFileImp(id);
			BaseDAO.commit();
			result.put("flag", "success");
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("删除数据源出错", e);
			result.put("flag", "error");
		}
		return result;
	}

	public void setFileImpDao(FileImpDao fileImpDao) {
		this.fileImpDao = fileImpDao;
	}

}
