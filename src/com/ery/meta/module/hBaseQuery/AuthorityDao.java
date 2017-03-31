package com.ery.meta.module.hBaseQuery;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.BlobRowListMapper;
import com.ery.meta.common.Common;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**
 * Created by IntelliJ IDEA. User: Administrator Date: 13-4-24 Time: 下午5:01 To
 * change this template use File | Settings | File Templates.
 */
public class AuthorityDao extends MetaBaseDAO {
	public List<Map<String, Object>> queryForAuthorityInfo(Map<String, Object> data, Page page) {
		String sql = "SELECT USER_ID,USER_NAME,USER_STATE FROM HB_SERVER_USER WHERE 1=1 ";
		List<Object> params = new ArrayList<Object>();

		int userId = Convert.toInt(MapUtils.getString(data, "USER_ID"), -1);
		int userState = Convert.toInt(MapUtils.getString(data, "STATE"), -1);
		String userName = MapUtils.getString(data, "USER_NAME");
		String fulluserName = MapUtils.getString(data, "FULL_USER_NAME");

		if (null != userName & !"".equals(userName)) {
			userName = userName.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += "AND USER_NAME LIKE ? ESCAPE '/'";
			params.add("%" + userName + "%");
		}
		if (userId != -1) {
			sql += "AND USER_ID = ? ";
			params.add(userId);
		}
		if (userState != -1) {
			sql += "AND USER_STATE = ? ";
			params.add(userState);
		}
		if (null != fulluserName && !fulluserName.equals("")) {
			sql += "AND USER_NAME = ? ";
			params.add(fulluserName);
		}

		sql += " ORDER BY USER_ID DESC";

		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
	}

	/**
	 * 保存用户权限
	 * 
	 * @param data
	 * @return
	 */
	public boolean saveAuthorityInfo(Map<String, Object> data) {
		String sql = "";
		String password = "";
		int i = -1;
		int userId = Convert.toInt(MapUtils.getString(data, "user_id"), -1);
		List<Object> params = new ArrayList<Object>();
		if (MapUtils.getString(data, "user_password") != null && !"".equals(MapUtils.getString(data, "user_password"))) {
			password = Common.getMD5(MapUtils.getString(data, "user_password").getBytes());
		}
		if (userId == -1) {
			sql = "INSERT INTO HB_SERVER_USER(USER_ID,USER_NAME,USER_PASS,USER_STATE) VALUES(SEQ_HB_AUTHORITY.NEXTVAL,?,?,?)";
			params.add(MapUtils.getString(data, "user_name"));
			params.add(password);
			params.add(Integer.parseInt(MapUtils.getString(data, "user_state")));
			return getDataAccess().execNoQuerySql(sql, params.toArray());
		} else {
			if (password != null && !"".equals(password)) {
				sql = "UPDATE HB_SERVER_USER SET USER_NAME =?,USER_PASS=?,USER_STATE=?  WHERE USER_ID =?";
				i = getDataAccess().execUpdate(sql, Convert.toString(data.get("user_name")),
						Convert.toString(password), Convert.toString(data.get("user_state")), userId);
			} else {
				sql = "UPDATE HB_SERVER_USER SET USER_NAME =?,USER_STATE=?  WHERE USER_ID =?";
				i = getDataAccess().execUpdate(sql, Convert.toString(data.get("user_name")),
						Convert.toString(data.get("user_state")), userId);
			}
			if (i == 0) {
				return false;
			}
			return true;
		}

	}

	/**
	 * 查看是否存在该用户
	 * 
	 * @param id
	 * @return
	 */
	public boolean canDeleteAuthority(String id) {
		String sql = "SELECT 1 FROM HB_SERVER_USER WHERE USER_ID = ?";
		return getDataAccess().queryForInt(sql, Convert.toInt(id)) == 0;
	}

	/**
	 * 查看用户
	 * 
	 * @param id
	 * @return
	 */
	public List<Map<String, Object>> getAuthority(String id) {
		String sql = "SELECT USER_ID, USER_NAME, USER_PASS FROM HB_SERVER_USER WHERE USER_ID=?";
		return getDataAccess().queryForList(sql, Convert.toInt(id));
	}

	/**
	 * 删除该条用户记录
	 * 
	 * @param id
	 */
	public void deleteAuthority(String id) {
		String sql = "DELETE FROM HB_SERVER_USER WHERE USER_ID=?";
		getDataAccess().execNoQuerySql(sql, Convert.toInt(id));
	}

	/**
	 * 查询规则列表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryRulesTables(Map<String, Object> data, Page page) {

		List<Object> params = new ArrayList<Object>();
		int ruleId = Convert.toInt(MapUtils.getString(data, "ruleId"), -1);
		int userId = Convert.toInt(MapUtils.getString(data, "userId"), -1);
		String ruleName = MapUtils.getString(data, "ruleName").toUpperCase();
		String sql = "SELECT QRY_RULE_ID,QYR_RULE_NAME FROM HB_QRY_RULE  WHERE qry_rule_id IN"
				+ "(SELECT qry_rule_id FROM hb_qry_rule_user_rel  WHERE user_id = '" + userId + "')";
		if (MapUtils.getString(data, "ruleName") != null && !"".equals(MapUtils.getString(data, "ruleName"))) {
			if (!ruleName.contains("%") && !ruleName.contains("_")) {
				sql += " AND UPPER(TABLE_NAME) LIKE ? ESCAPE '/'";
				params.add("%" + ruleName + "%");
			} else {
				ruleName = ruleName.replaceAll("_", "/_").replaceAll("%", "/%");
				sql += " AND UPPER(TABLE_NAME) LIKE ? ESCAPE '/'";
				params.add("%" + ruleName + "%");
			}
		}
		if (ruleId != -1) {
			sql += "AND QRY_RULE_ID = ? ";
			params.add(ruleId);
		}

		sql += " ORDER BY QRY_RULE_ID DESC";
		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());

	}

	/**
	 * 通过查询规则ID查询相关的列
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> queryColumnInfosByQryId(String qryId) {
		String sql = "SELECT USER_ID,QRY_RULE_ID FROM HB_QRY_RULE_USER_REL WHERE QRY_RULE_ID = ?";
		return getDataAccess().queryForList(sql, qryId);

	}

	/**
	 * 通过 userid获取查询规则信息列表
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> queryRuleInfoByUserId(String userId) {
		String sql = "SELECT T1.QRY_RULE_ID, T2.QRY_RULE_NAME, T2.PAGINATION_SIZE FROM HB_QRY_RULE_USER_REL T1, HB_QRY_RULE T2 WHERE T1.QRY_RULE_ID = T2.QRY_RULE_ID AND T2.STATE=0 AND T1.USER_ID=?";
		return getDataAccess().queryForList(sql, userId);
	}

	/**
	 * 验证用户是否被使用
	 * 
	 * @param userId
	 * @return
	 */
	public int queryRuleByUserId(long userId) {
		String sql = "SELECT COUNT(1) FROM HB_QRY_RULE_USER_REL WHERE USER_ID = ?";
		return getDataAccess().queryForInt(sql, userId);
	}
}
