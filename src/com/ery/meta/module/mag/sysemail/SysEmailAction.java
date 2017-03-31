package com.ery.meta.module.mag.sysemail;

import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;
import com.ery.meta.module.mag.remind.AnalyzeSysEmailInitTimer;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.MapUtils;

/**
 * 

 * @description 系统订阅Action
 * @date 2012-11-19
 */
public class SysEmailAction {
	private SysEmailDao sysEmailDao;

	public void setSysEmailDao(SysEmailDao sysEmailDao) {
		this.sysEmailDao = sysEmailDao;
	}

	/**
	 * @description 系统订阅查询
	 * @param data
	 * @param page
	 */
	public List<Map<String, Object>> querySysEmail(Map<String, Object> data, Page page) {
		List<Map<String, Object>> list = sysEmailDao.querySysEmail(data, page);
		for (Map<String, Object> map : list) {
			map.put("keywordss", sysEmailDao.getKeyCol(MapUtils.getString(map, "CONTENT_SQL")));
		}
		return list;
	}

	/**
	 * @description 启用/禁用
	 * @param is
	 * @param id
	 */
	public boolean ableEmail(int id, boolean is) {
		boolean ret = false;
		try {
			ret = sysEmailDao.ableEmail(id, is);
			if (ret) {
				Map<String, Object> cfg = sysEmailDao.getEmailCfg(id);
				if (cfg != null) {
					AnalyzeSysEmailInitTimer.changeTimerState(cfg, is);
				}
			}
		} catch (Exception e) {
			LogUtils.error(is ? "启用" : "禁用" + "出错[" + id + "]！" + e.getMessage());
		}
		return ret;
	}

	/**
	 * @description 删除
	 * @param id
	 */
	public boolean deleteEmail(int id) {
		try {
			return sysEmailDao.deleteEmail(id);
		} catch (Exception e) {
			return false;
		}
	}

	/**
	 * @description 添加订阅配置
	 * @param data
	 * @param userId
	 */
	public boolean addEmail(Map<String, Object> data, String userId) {
		try {
			return sysEmailDao.addEmail(data, userId);
		} catch (Exception e) {
			return false;
		}
	}

	/**
	 * @description 修改订阅配置
	 * @param data
	 * @param userId
	 */
	public boolean updateEmail(Map<String, Object> data, String userId) {
		try {
			return sysEmailDao.updateEmail(data, userId);
		} catch (Exception e) {
			return false;
		}
	}

	/**
	 * 查询用户或者角色ID
	 * 
	 * @param userName
	 * @param type
	 * @return
	 */
	public String queryUserId(String userName, int type) {
		return sysEmailDao.queryUserId(userName, type);
	}

	/**
	 * @description Combo信息查询
	 * @param
	 */
	public List<Map<String, Object>> queryRoleOrUserInfo(Map<String, Object> data, boolean flag) {
		return sysEmailDao.queryRoleOrUserInfo(data, flag);
	}

	/**
	 * @description 获取查询字段
	 * @param sql
	 */
	public String getKeyCol(String sql) {
		try {
			return sysEmailDao.getKeyCol(sql);
		} catch (Exception e) {
			return null;
		}
	}
}
