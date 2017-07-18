package com.ery.meta.module.mag.sysemail;

import java.io.ByteArrayInputStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.base.support.jdbc.BinaryStream;
import com.ery.base.support.utils.MapUtils;
import com.ery.meta.common.BlobRowListMapper;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

/**
 * 
 * 
 * @description 系统订阅DAO
 * @date 2012-11-19
 */
public class SysEmailDao extends MetaBaseDAO {
	/**
	 * @description 系统订阅信息查询
	 * @param data
	 * @param page
	 * @return getDataAccess.queryForList()
	 */
	public List<Map<String, Object>> querySysEmail(Map<String, Object> data, Page page) {
		String sql = "select CFG_ID,CONTENT_SQL,TOPIC,CONTENT,TARGET_USER_TYPE,TARGET_USER,CYCLE_TYPE,"
				+ "CYCLE_RULE,FAILED_TRY_TIMES,STATE from Meta_Sys_Email_Cfg  WHERE 1=1";
		int cycleType = MapUtils.getInteger(data, "CTYPE");
		String kwd = MapUtils.getString(data, "KEYWORD");
		List<Object> params = new ArrayList<Object>();
		if (cycleType != 0) {
			sql = sql + " AND CYCLE_TYPE = ? ";
			params.add(cycleType);
		}
		if (!"".equals(kwd)) {
			sql = sql + " AND TOPIC LIKE ? ";
			params.add("%" + kwd + "%");
		}

		sql = sql + " ORDER BY CFG_ID DESC";
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(getDataAccess(), sql, page);
		}
		List<Map<String, Object>> rs = new ArrayList<Map<String, Object>>();
		rs = getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
		for (Map<String, Object> map : rs) {
			String rule = map.get("CYCLE_RULE").toString();
			int cycle = Integer.parseInt(map.get("CYCLE_TYPE").toString());
			int user_type = Integer.parseInt(map.get("TARGET_USER_TYPE").toString());
			map.put("RULE", SysEmailDao.getCycleRule(cycle, rule));
			if (map.get("TARGET_USER").toString().contains("{") && map.get("TARGET_USER").toString().contains("}")) {
				map.put("USERNAMERS", map.get("TARGET_USER").toString());
			} else {
				String USERNAMERS = "";
				if (user_type == 1) {
					USERNAMERS = getDataAccess().queryForString(
							"select USER_NAMECN from meta_mag_user where USER_ID=" +
									Integer.parseInt(map.get("TARGET_USER").toString()));
				} else {
					USERNAMERS = getDataAccess().queryForString(
							"select ROLE_NAME from meta_mag_role where ROLE_ID=" +
									Integer.parseInt(map.get("TARGET_USER").toString()));
				}
				map.put("USERNAMERS", USERNAMERS);
			}
		}

		return rs;
	}

	private static String getCycleRule(int cycleType, String rule) {
		String[] rules = rule.split("#");
		String[] temp = null;
		String rs = null;
		switch (cycleType) {
		case 1:
			rs = "每小时" + rules[0] + "分钟开始执行，" + "每" + rules[1] + "分钟，" + rules[2] + "秒时执行";
			break;
		case 2:
			temp = rules[2].split(":");
			rs = "每天" + rules[0] + "点开始执行，" + "每" + rules[1] + "小时，" + temp[0] + "分" + temp[1] + "秒执行";
			break;
		case 3:
			temp = rules[2].split(",");
			rs = "每隔" + rules[1] + "周，周" + temp[0] + temp[1] + "执行";
			break;
		case 4:
			rs = "每月" + rules[0] + "号开始执行，" + "每" + rules[1] + "天，" + rules[2] + "执行";
			break;
		case 5:
			temp = rules[2].split(",");
			rs = "每年" + rules[0] + "月开始执行，" + "每" + rules[1] + "个月，" + temp[0] + "号" + temp[1] + "执行";
			break;
		}
		return rs;
	}

	/**
	 * @description 启用/禁用
	 * @param id
	 * @param is
	 * @return
	 */
	public boolean ableEmail(int id, boolean is) {
		String sql = " UPDATE META_SYS_EMAIL_CFG SET STATE=? WHERE CFG_ID=?";
		List<Object> params = new ArrayList<Object>();
		params.add(is ? 1 : 0);
		params.add(id);
		return getDataAccess().execNoQuerySql(sql, params.toArray());// execNoQuerySql(sql);
	}

	/**
	 * 删除
	 * 
	 * @param id
	 * @return
	 */
	public boolean deleteEmail(int id) {
		String sql = "delete from META_SYS_EMAIL_CFG where CFG_ID=?";
		Object[] params = { id };
		return getDataAccess().execNoQuerySql(sql, params);
	}

	/**
	 * @description 修改系统订阅
	 * @param data
	 *            ,map
	 * @throws UnsupportedEncodingException
	 */
	public boolean updateEmail(Map<String, Object> data, String userId) throws UnsupportedEncodingException {
		String sqltemp = MapUtils.getString(data, "sqlrs");
		String topictemp = MapUtils.getString(data, "topicrs");
		int trytimestemp = MapUtils.getIntValue(data, "trytimesrs");
		String contenttemp = MapUtils.getString(data, "contentrs");
		String sendtypetemp = MapUtils.getString(data, "sendtypers"); // 发送类型-未使用
																		// 邮件/短信
		int sendcycletemp = MapUtils.getIntValue(data, "sendcyclers");
		int TargetuserType = MapUtils.getIntValue(data, "TargetuserTypers");
		String sendtimetemp = MapUtils.getString(data, "sendtimers");
		String key = MapUtils.getString(data, "key");
		int id = MapUtils.getIntValue(data, "idrs");
		String sql = "UPDATE META_SYS_EMAIL_CFG SET CONTENT_SQL=?,TOPIC=?,CONTENT=?,"
				+ "TARGET_USER_TYPE=?,TARGET_USER=?,CYCLE_TYPE=?,CYCLE_RULE=?,FAILED_TRY_TIMES=?" + " WHERE CFG_ID=?";
		List<Object> params = new ArrayList<Object>();

		BinaryStream debugmsgStream = new BinaryStream();
		ByteArrayInputStream cs = new ByteArrayInputStream(sqltemp.getBytes("GBK"));
		debugmsgStream.setInputStream(cs);
		params.add(debugmsgStream);

		params.add(topictemp);

		BinaryStream debugStream = new BinaryStream();
		ByteArrayInputStream rs = new ByteArrayInputStream(contenttemp.getBytes("GBK"));
		debugStream.setInputStream(rs);
		params.add(debugStream);
		params.add(TargetuserType);

		if (userId.contains("{") && userId.contains("}")) { // 先粗略检查是否匹配宏变量
															// 否则直接从数据库查询名称
			String[] temp = (key + ",").split(",");
			for (int i = 0; i < temp.length; i++) {
				if (userId.equals("{" + temp[i] + "}")) {// 循环检查名称以宏变量匹配查询字段
					break;
				} else if (i == (temp.length - 1)) { // 当循环到查询字段列表的最后一个字段仍然不能匹配到宏变量
					if (TargetuserType == 1) {
						String sqlforUserId = " SELECT T.USER_ID FROM META_MAG_USER T where T.USER_NAMECN = '" +
								userId + "'";
						userId = getDataAccess().queryForString(sqlforUserId);
					} else {
						String sqlforRoleId = " SELECT T.ROLE_ID FROM META_MAG_ROLE T where T.ROLE_NAME = '" + userId +
								"'";
						userId = getDataAccess().queryForString(sqlforRoleId);
					}
					if (userId == null) {
						return false;
					}
				}
			}
		} else { // 非宏变量
			if (TargetuserType == 1) {
				String sqlforUserId = " SELECT T.USER_ID FROM META_MAG_USER T WHERE T.USER_NAMECN = '" + userId + "'";
				userId = getDataAccess().queryForString(sqlforUserId);
			} else {
				String sqlforRoleId = " SELECT T.ROLE_ID FROM META_MAG_ROLE T WHERE T.ROLE_NAME = '" + userId + "'";
				userId = getDataAccess().queryForString(sqlforRoleId);
			}
			if (userId == null) {
				return false;
			}
		}
		params.add(userId);
		params.add(sendcycletemp);
		params.add(sendtimetemp);
		params.add(trytimestemp);
		params.add(id);
		return getDataAccess().execNoQuerySql(sql, params.toArray());
	}

	/**
	 * 获取一个订阅任务对象
	 * 
	 * @param id
	 * @return
	 */
	public Map<String, Object> getEmailCfg(int id) {
		String sql = "SELECT CFG_ID,CYCLE_TYPE,CYCLE_RULE" + " FROM META_SYS_EMAIL_CFG WHERE CFG_ID=?";
		return getDataAccess().queryForMap(sql, id);
	}

	/**
	 * 
	 * @param data
	 * @param userId
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	public boolean addEmail(Map<String, Object> data, String userId) throws UnsupportedEncodingException {
		String sqltemp = MapUtils.getString(data, "sqlrs");
		String topictemp = MapUtils.getString(data, "topicrs");
		int trytimestemp = MapUtils.getIntValue(data, "trytimesrs");
		String contenttemp = MapUtils.getString(data, "contentrs");
		String sendtypetemp = MapUtils.getString(data, "sendtypers");
		int sendcycletemp = MapUtils.getIntValue(data, "sendcyclers");
		int TargetuserType = MapUtils.getIntValue(data, "TargetuserTypers");
		String sendtimetemp = MapUtils.getString(data, "sendtimers");
		String key = MapUtils.getString(data, "key");
		String sql = " INSERT INTO META_SYS_EMAIL_CFG(CFG_ID,CONTENT_SQL,TOPIC,CONTENT,TARGET_USER_TYPE,TARGET_USER,CYCLE_TYPE,CYCLE_RULE,FAILED_TRY_TIMES,STATE) "
				+ " VALUES(SEQ_SYS_EMAIL_CFG_ID.NEXTVAL,?,?,?,?,?,?,?,?,0)";
		List<Object> params = new ArrayList<Object>();
		BinaryStream debugmsgStream = new BinaryStream();
		ByteArrayInputStream cs = new ByteArrayInputStream(sqltemp.getBytes("GBK"));
		debugmsgStream.setInputStream(cs);
		params.add(debugmsgStream);

		params.add(topictemp);

		BinaryStream debugStream = new BinaryStream();
		ByteArrayInputStream rs = new ByteArrayInputStream(contenttemp.getBytes("GBK"));
		debugStream.setInputStream(rs);
		params.add(debugStream);
		params.add(TargetuserType);

		if (userId.contains("{") && userId.contains("}")) { // 先粗略检查是否匹配宏变量
															// 否则直接从数据库查询名称
			String[] temp = (key + ",").split(",");
			for (int i = 0; i < temp.length; i++) { // 循环检查名称以宏变量匹配查询字段
				if (userId.equals("{" + temp[i] + "}")) {
					break;
				} else if (i == (temp.length - 1)) { // 当循环到查询字段列表的最后一个字段仍然不能匹配到宏变量
					if (TargetuserType == 1) {
						String sqlforUserId = " SELECT T.USER_ID FROM META_MAG_USER T WHERE T.USER_NAMECN = '" +
								userId + "'";
						userId = getDataAccess().queryForString(sqlforUserId);
					} else {
						String sqlforRoleId = " SELECT T.ROLE_ID FROM META_MAG_ROLE T WHERE T.ROLE_NAME = '" + userId +
								"'";
						userId = getDataAccess().queryForString(sqlforRoleId);
					}
					if (userId == null) {
						return false;
					}
				}
			}
		} else { // 非宏变量
			if (TargetuserType == 1) {
				String sqlforUserId = " SELECT T.USER_ID FROM META_MAG_USER T WHERE T.USER_NAMECN = '" + userId + "'";
				userId = getDataAccess().queryForString(sqlforUserId);
			} else {
				String sqlforRoleId = " SELECT T.ROLE_ID FROM META_MAG_ROLE T WHERE T.ROLE_NAME = '" + userId + "'";
				userId = getDataAccess().queryForString(sqlforRoleId);
			}
			if (userId == null) {
				return false;
			}
		}
		params.add(userId);
		params.add(sendcycletemp);
		params.add(sendtimetemp);
		params.add(trytimestemp);
		// return false;
		return getDataAccess().execNoQuerySql(sql, params.toArray());
	}

	/**
	 * 查询用户或者角色ID
	 * 
	 * @param userName
	 * @param type
	 * @return
	 */
	public String queryUserId(String userName, int type) {
		if (type == 1) { // 查询用户
			List<Object> params = new ArrayList<Object>();
			String sql = " SELECT USER_ID FROM META_MAG_USER WHERE USER_NAMECN = ?";
			params.add(userName);
			return getDataAccess().queryForString(sql, params.toArray());
		} else { // 查询角色
			List<Object> params = new ArrayList<Object>();
			String sql = " SELECT ROLE_ID FROM META_MAG_ROLE WHERE ROLE_NAME = ?";
			params.add(userName);
			return getDataAccess().queryForString(sql, params.toArray());
		}
	}

	/**
	 * @description 获取跟随匹配信息
	 * @param data
	 * @param flag
	 * @return
	 */

	public List<Map<String, Object>> queryRoleOrUserInfo(Map<String, Object> data, boolean flag) {
		if (flag) { // 查询角色名称匹配信息
			String sql = "SELECT ROLE_ID,ROLE_NAME FROM META_MAG_ROLE WHERE 1=1";
			String keyWords = MapUtils.getString(data, "keyWord", "").toUpperCase();
			if (!keyWords.equals("")) {
				if (keyWords.contains("_") || keyWords.contains("%")) {
					keyWords = keyWords.replaceAll("_", "/_").replaceAll("%", "/%");
				}
				sql += " AND UPPER(ROLE_NAME) LIKE '%" + keyWords + "%' ESCAPE '/'";
			}
			sql = sql + " ORDER BY ROLE_ID";
			return getDataAccess().queryForList(sql);
		} else { // 查询用户名称匹配信息
			String sql = "SELECT USER_ID,USER_NAMECN FROM META_MAG_USER WHERE 1=1";
			if (data != null && data.size() != 0) {
				String keyWords = MapUtils.getString(data, "keyWord", "").toUpperCase();
				if (keyWords.contains("_") || keyWords.contains("%")) {
					keyWords = keyWords.replaceAll("_", "/_").replaceAll("%", "/%");
				}
				sql += " AND UPPER(USER_NAMECN) LIKE '%" + keyWords + "%' ESCAPE '/'";
			}
			sql = sql + " ORDER BY USER_ID";
			return getDataAccess().queryForList(sql);
		}
	}

	/**
	 * @description 获取查询字段
	 * @param sql
	 * @return keyword
	 */
	public String getKeyCol(String sql) {
		if (!(sql.trim().toUpperCase().startsWith("SELECT"))) { // 非select语句
			return null;
		} else {
			sql = "SELECT * FROM (" + sql + ") WHERE 1=0";
			try {
				Object[][] a = getDataAccess().queryForArray(sql, true, null);
				String keyword = "";
				for (int i = 0; i < a[0].length; i++) {
					keyword = keyword + a[0][i] + ",";
				}
				return keyword.substring(0, keyword.length() - 1);
			} catch (Exception e) {
				return null;
			}
		}
	}
}
