package com.ery.meta.module.mag.draft;

import java.util.List;
import java.util.Map;

import com.ery.meta.common.MetaBaseDAO;

import com.ery.base.support.utils.MapUtils;

public class DraftDAO extends MetaBaseDAO {

	/**
	 * 新增草稿
	 * */
	public int insertsDraft(Map<String, Object> map) {
		String sql = "INSERT INTO META_MAG_DRAFT(DRAFT_ID,DRAFT_CONTENT,DRAFT_TITLE,DRAFT_DESC,BELONGS_MODEL,CREATE_TIME,LAST_MODIFY_TIME,USER_ID)";
		sql += " VALUES(SEQ_DRAFT_ID.NEXTVAL,?,?,?,?,?,?,?)";
		Object[] obj = new Object[7];
		obj[0] = MapUtils.getString(map, "content");
		obj[1] = MapUtils.getString(map, "title");
		obj[2] = MapUtils.getString(map, "desc");
		obj[3] = MapUtils.getString(map, "model");
		obj[4] = MapUtils.getString(map, "ctime");
		obj[5] = MapUtils.getString(map, "mtime");
		obj[6] = MapUtils.getInteger(map, "userId");
		return this.getDataAccess().execUpdate(sql, obj);
	}

	/**
	 * 查询草稿,根据不同的模块加载不同的草稿
	 * */
	public List<Map<String, Object>> queryDraftByModel(String modelName, int userId) {
		String sql = "SELECT T.DRAFT_ID,T.DRAFT_CONTENT,T.DRAFT_TITLE,T.DRAFT_DESC,T.CREATE_TIME,T.LAST_MODIFY_TIME,T.USER_ID,U.USER_NAMECN FROM META_MAG_DRAFT T";
		sql += " LEFT JOIN META_MAG_USER U ON T.USER_ID = U.USER_ID";
		sql += " WHERE T.BELONGS_MODEL =?";
		return this.getDataAccess().queryForList(sql, modelName);
	}
}
