package com.ery.meta.module.hBaseQuery;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

import com.ery.hadoop.hq.datasource.DataSourceInit;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;


public class AuthorityAction {

	private AuthorityDao authorityDao;

	/**
	 * 查询用户权限列表
	 * 
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryAuthrityInfo(Map<String, Object> data, Page page) {
		List<Map<String, Object>> list = this.authorityDao.queryForAuthorityInfo(data, page);
		return list;
	}

	/**
	 * 新增用户
	 * 
	 * @param data 用户信息
	 * @return
	 */
	public String saveAuthorityInfo(Map<String, Object> data) {
		try {
			BaseDAO.beginTransaction();
			Page page = new Page(0, 20);
			data.put("FULL_USER_NAME", data.get("user_name"));

			List<Map<String, Object>> list = authorityDao.queryForAuthorityInfo(data, page);
			int userId = Convert.toInt(MapUtils.getString(data, "user_id"), -1);
			if (userId == -1 && list.size() > 0) {
				return "rename";
			} else {
				for (Map<String, Object> map : list) {
					if (userId != Convert.toInt(map.get("USER_ID").toString(), -1)) {
						return "rename";
					}
				}
			}
			boolean b = authorityDao.saveAuthorityInfo(data);
			BaseDAO.commit();
			if (b) {
				DataSourceInit.loadUserInfo(MapUtils.getString(data, "user_name", null));// 重新加载规则ID与用户的关系
				return "success";
			} else {
				return "failed";
			}
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("更新用户出错", e);
			return "failed";
		}
	}

	/**
	 * 删除用户
	 * 
	 * @param id 用户ID
	 * @return
	 */
	public Map<String, Object> deleteAuthority(String id) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			if (!authorityDao.canDeleteAuthority(id)) {
				BaseDAO.beginTransaction();
				List<Map<String, Object>> lst = authorityDao.getAuthority(id);
				authorityDao.deleteAuthority(id);
				BaseDAO.commit();
				result.put("flag", "true");
				if (lst != null) {
					for (int i = 0; i < lst.size(); i++) {
						DataSourceInit.removeUserInfo(MapUtils.getString(lst.get(i), "USER_NAME", null));// 重新加载规则ID与用户的关系
					}
				}
			} else {
				result.put("flag", "false");
			}
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("删除用户信息出错", e);
			result.put("flag", "error");
		}
		return result;
	}

	/**
	 * 查询规则列表
	 * 
	 * @param queryData
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryRules(Map<String, Object> queryData, Page page) {
		if (page == null) {
			page = new Page(0, 20);
		}
		List<Map<String, Object>> returnValue = authorityDao.queryRulesTables(queryData, page);
		return returnValue;
	}

	/**
	 * 通过查询规则ID查询
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> queryAuthrityInfoByQryId(String qryId) {
		List<Map<String, Object>> list = this.authorityDao.queryColumnInfosByQryId(qryId);
		return list;
	}

	/**
	 * 验证用户是否被使用
	 * 
	 * @param dataSourceId
	 * @return
	 */
	public int checkRuleByUserId(long userId) {
		return this.authorityDao.queryRuleByUserId(userId);
	}

	public void setAuthorityDao(AuthorityDao authorityDao) {
		this.authorityDao = authorityDao;
	}
}
