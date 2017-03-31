package com.ery.meta.module.faq;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;


public class FaqAction {

	private FaqDao faqDao;

	/**
	 * 添加实施中出现的问题（提问）
	 * 
	 * @param data 问题基本信息
	 * @return
	 */
	public String saveAskProblem(Map<String, Object> data) {
		try {
			BaseDAO.beginTransaction();
			boolean b = faqDao.saveAskProblem(data);
			BaseDAO.commit();
			if (b) {
				return "success";
			} else {
				return "failed";
			}
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("添加实施问题出错", e);
			return "failed";
		}
	}

	/**
	 * 根据问题主题查询问题
	 * 
	 * @param title 问题主题
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryByTitle(String title, Page page) {
		List<Map<String, Object>> list = this.faqDao.queryByTitle(title, page);
		return list;
	}

	/**
	 * 查询实施处理问题
	 * 
	 * @param map 过滤条件
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryForFaq(Map<String, Object> data, Page page) {
		List<Map<String, Object>> list = this.faqDao.queryForFaq(data, page);
		return list;
	}

	/**
	 * 通过实施处理id得到实施信息
	 * 
	 * @param faqId 实施处理id
	 * @return
	 */
	public Map<String, Object> queryFaqInfoById(int faqId) {
		return faqDao.queryFaqById(faqId);
	}

	/**
	 * 通过实施处理id得到实施信息
	 * 
	 * @param faqId 实施处理id
	 * @return
	 */
	public Map<String, Object> updateFAQ(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			BaseDAO.beginTransaction();
			int flag = faqDao.updateFaq(data);
			if (flag == 0) {
				result.put("flag", "error");
			}
			BaseDAO.commit();
			result.put("flag", "success");
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("处理实施信息出错", e);
			result.put("flag", "error");

		}

		return result;
	}

	public void setFaqDao(FaqDao faqDao) {
		this.faqDao = faqDao;
	}

}
