package com.ery.meta.module.mag.draft;

import java.util.List;
import java.util.Map;

import com.ery.meta.web.session.SessionManager;

public class DraftAction {
  
	private DraftDAO draftDao;
	public void setDraftDao(DraftDAO draftDao) {
		this.draftDao = draftDao;
	}
	/**
	 * 查询草稿,根据不同的模块加载不同的草稿
	 * */
	public List<Map<String,Object>> queryDraftByModel(String modelName){
		int userId = SessionManager.getCurrentUserID();
		return draftDao.queryDraftByModel(modelName, userId);
	}
	
	/**
	 * 新增草稿 
	 * */
	public int insertsDraft(Map<String,Object> map){
		return draftDao.insertsDraft(map);
	}
}
