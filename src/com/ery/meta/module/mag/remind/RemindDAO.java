package com.ery.meta.module.mag.remind;

import java.io.ByteArrayInputStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.BlobRowListMapper;
import com.ery.meta.common.BlobRowMapper;
import com.ery.meta.common.MetaBaseDAO;

import com.ery.base.support.jdbc.BinaryStream;
import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.utils.MapUtils;


public class RemindDAO extends MetaBaseDAO {

	public Map<String, Object> querySysEmailCfgById(int id) {
		String sql = "SELECT CFG_ID,CONTENT_SQL,TOPIC,CONTENT,"
				+ " TARGET_USER_TYPE,TARGET_USER,CYCLE_TYPE,CYCLE_RULE,FAILED_TRY_TIMES," + " STATE"
				+ " FROM META_SYS_EMAIL_CFG WHERE CFG_ID=? ";
		return getDataAccess().queryByRowMapper(sql, new BlobRowMapper("GBK"), id);
	}

	/**
	 * 查询系统邮件配置
	 * 
	 * @param cond
	 * @return
	 */
	public List<Map<String, Object>> querySysEmailCfg(Map<String, Object> cond) {
		String sql = "SELECT CFG_ID,CONTENT_SQL,TOPIC,CONTENT,"
				+ " TARGET_USER_TYPE,TARGET_USER,CYCLE_TYPE,CYCLE_RULE,FAILED_TRY_TIMES," + " STATE"
				+ " FROM META_SYS_EMAIL_CFG WHERE 1=1 ";
		List<Object> param = new ArrayList<Object>();
		if (cond != null) {
			if (cond.containsKey("STATE")) {
				sql += " AND STATE=?";
				param.add(cond.get("STATE"));
			}
		}
		if (param.size() > 0)
			return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), param.toArray());
		else
			return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"));
	}

	/**
	 * 查询系统发送邮件日志
	 * 
	 * @param cond
	 * @return
	 */
	public List<Map<String, Object>> querySysEmailSendLog(Map<String, Object> cond) {
		return null;
	}

	/**
	 * 取出满足重发条件的记录
	 * 
	 * @return
	 */
	public List<Map<String, Object>> queryTrySendLog() {
		long repeatInterval = SystemVariable.getLong("trySendSysEmail.repeatInterval", 300000);// 重试间隔
		String sql = "SELECT A.LOG_ID,A.CFG_ID,A.EMAIL,A.TOPIC,A.CONTENT,"
				+ " A.IS_SUCCESS,A.ERROR_MSG,A.SEND_TIME,A.FIRST_SEND_TIME,A.SEND_SN"
				+ "  FROM META_SYS_EMAIL_SEND_LOG A"
				+
				// 此 连接表查询（某配置，某次触发，某个记录发送失败次数，以及最后一次失败发送时间）
				"  LEFT JOIN (SELECT X.CFG_ID,X.FIRST_SEND_TIME,X.SEND_SN,COUNT(1) FAIL_COUNT,MAX(SEND_TIME) LAST_SEND_TIME"
				+ "     FROM META_SYS_EMAIL_SEND_LOG X WHERE X.IS_SUCCESS = 0 GROUP BY X.CFG_ID, X.FIRST_SEND_TIME, X.SEND_SN) B"
				+ "    ON A.CFG_ID = B.CFG_ID AND A.FIRST_SEND_TIME = B.FIRST_SEND_TIME AND A.SEND_SN = B.SEND_SN"
				+
				// 此 连接表查询 某配置重试次数
				"  LEFT JOIN META_SYS_EMAIL_CFG C ON A.CFG_ID = C.CFG_ID"
				+ " WHERE C.STATE="
				+ RemindConstant.STATE_OK
				+
				// 条件：某配置，某次触发，某记录无发送成功记录
				" AND NOT EXISTS (SELECT 1 FROM META_SYS_EMAIL_SEND_LOG"
				+ "    WHERE CFG_ID = A.CFG_ID AND FIRST_SEND_TIME = A.FIRST_SEND_TIME"
				+ "     AND SEND_SN = A.SEND_SN AND IS_SUCCESS = 1) " +
				// 条件：失败次数够用
				" AND B.FAIL_COUNT < C.FAILED_TRY_TIMES " +
				// 条件：上次失败时间与当前时间在重试定时器的时间间隔以内
				" AND ROUND(TO_NUMBER(SYSDATE-B.LAST_SEND_TIME) * 24 * 60 * 60 * 1000)<? ";

		// 优化后的SQL
		String _sql = "SELECT C.LOG_ID,C.CFG_ID,C.EMAIL,C.TOPIC,C.CONTENT,"
				+ "C.IS_SUCCESS,C.ERROR_MSG,C.SEND_TIME,C.FIRST_SEND_TIME,C.SEND_SN FROM " + " META_SYS_EMAIL_CFG A,"
				+ "  (SELECT T.CFG_ID,T.FIRST_SEND_TIME,SUM(CASE T.IS_SUCCESS WHEN 0 THEN 1 ELSE 0 END) FAIL_COUNT,"
				+ "    MAX(SEND_TIME) LAST_SEND_TIME FROM "
				+ "   META_SYS_EMAIL_SEND_LOG T GROUP BY T.CFG_ID,T.FIRST_SEND_TIME"
				+ "   HAVING SUM(CASE T.IS_SUCCESS WHEN 1 THEN 1 ELSE 0 END) = 0) B," + " META_SYS_EMAIL_SEND_LOG C "
				+ "WHERE A.STATE=" + RemindConstant.STATE_OK
				+ " AND A.CFG_ID=B.CFG_ID AND A.FAILED_TRY_TIMES>B.FAIL_COUNT AND B.CFG_ID=C.CFG_ID "
				+ "AND ROUND(TO_NUMBER(SYSDATE-B.LAST_SEND_TIME) * 24 * 60 * 60 * 1000)<?";
		return getDataAccess().queryByRowMapper(_sql, new BlobRowListMapper("GBK"), repeatInterval);
	}

	/**
	 * 插入系统发送邮件日志记录
	 * 
	 * @param data
	 * @return
	 */
	public int insertSysEmailLog(Map<String, Object> data) throws UnsupportedEncodingException {
		String sql = "INSERT INTO META_SYS_EMAIL_SEND_LOG(LOG_ID,CFG_ID,EMAIL,TOPIC,CONTENT,"
				+ " IS_SUCCESS,ERROR_MSG,SEND_TIME,FIRST_SEND_TIME,SEND_SN)"
				+ " VALUES(SEQ_SYS_EMAIL_SEND_LOG_ID.NEXTVAL,?,?,?,?,?,"
				+ " ?,TO_DATE(?,'yyyy-MM-dd hh24:mi:ss'),TO_DATE(?,'yyyy-MM-dd hh24:mi:ss'),?)";
		List<Object> params = new ArrayList<Object>();
		params.add(data.get("CFG_ID"));
		params.add(data.get("EMAIL"));
		params.add(data.get("TOPIC"));

		BinaryStream contStream = new BinaryStream();
		ByteArrayInputStream cs = new ByteArrayInputStream(MapUtils.getString(data, "CONTENT").getBytes("GBK"));
		contStream.setInputStream(cs);
		params.add(contStream);

		params.add(data.get("IS_SUCCESS"));

		BinaryStream msgStream = new BinaryStream();
		java.io.ByteArrayInputStream es = new ByteArrayInputStream(MapUtils.getString(data, "ERROR_MSG")
				.getBytes("GBK"));
		msgStream.setInputStream(es);
		params.add(msgStream);

		params.add(data.get("SEND_TIME"));
		params.add(data.get("FIRST_SEND_TIME"));
		params.add(data.get("SEND_SN"));
		return getDataAccess().execUpdate(sql, params.toArray());
	}

	/**
	 * 检测条件SQL执行情况
	 * 
	 * @param sql
	 * @return
	 */
	public boolean checkTermSql(String sql) {
		Object[][] oo = getDataAccess().queryForArray(sql, false, null);
		return oo != null && oo.length > 0;
	}

	/**
	 * 内容SQL
	 * 
	 * @param contentSql
	 * @return
	 */
	public List<Map<String, Object>> queryContent(String contentSql) {
		return getDataAccess().queryForList(contentSql);
	}

	/**
	 * 
	 * @param id
	 * @param type
	 * @return
	 */
	public String[] getUserEmails(int id, int type) {
		String sql = "";
		if (type == 1) {
			sql = "SELECT USER_EMAIL EMAIL FROM META_MAG_USER WHERE USER_ID=?";
		} else {
			sql = "SELECT USER_EMAIL EMAIL FROM META_MAG_USER A WHERE "
					+ "EXISTS(SELECT 1 FROM META_MAG_USER_ROLE WHERE USER_ID=A.USER_ID AND ROLE_ID=?)";
		}
		return getDataAccess().queryForPrimitiveArray(sql, String.class, id);
	}

	/**
	 * 清理早起发送邮件日志记录
	 */
	public void clearSysEmailLog() {

	}

}
