package com.ery.hadoop.hq.log;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

import com.ery.base.support.jdbc.IParamsSetter;
import com.ery.base.support.sys.podo.BaseDAO;

public class HQLogDAO extends BaseDAO {

	public void outputHBLogBatch(final List<HQLog> lstlog) {
		String sql = "insert into HB_USER_QRY_LOG(LOG_ID, USER_ID,QRY_RULE_ID,QRY_START_DATE,"
				+ "TOTAL_TIME,QRY_FLAG,LOG_MSG,QRY_TOTAL_TIME,QRY_FILTER_TIME,QRY_PAGE_TIME,QRY_NUM,QRY_SUM_NUM,QRY_SIZE,FIRST_QRY)"
				+ " values(Hb_Log_Id.nextval,?,?,to_date(?,'yyyy-MM-dd HH24:mi:ss'),?,?,?,?,?,?,?,?,?,?)";
		getDataAccess().execUpdateBatch(sql, lstlog.size(), new IParamsSetter() {
			public void setValues(PreparedStatement statment, int i) throws SQLException {
				HQLog hqLog = lstlog.get(i);
				statment.setLong(1, hqLog.getUserId());
				statment.setString(2, hqLog.getQueryRuleId());
				statment.setString(3, hqLog.getStartTime());
				statment.setLong(4, hqLog.getLogEndTime() - hqLog.getLogStartTime());
				statment.setLong(5, hqLog.isQryFlag() ? 0 : 1);
				String msg = hqLog.getMsg();
				if (msg.length() > 3999) {
					msg = msg.substring(0, 3999);
				}
				statment.setString(6, msg);
				if (hqLog.isDetail()) {
					statment.setString(7, String.valueOf(hqLog.getTotalTime()));
					statment.setString(8, String.valueOf(hqLog.getFilterTime()));
					statment.setString(9, String.valueOf(hqLog.getPageTime()));
				} else {
					statment.setString(7, "");
					statment.setString(8, "");
					statment.setString(9, "");
				}
				statment.setLong(10, hqLog.getCurrentCount());
				statment.setLong(11, hqLog.getTotalCount());
				statment.setLong(12, hqLog.getResultByte());
				statment.setLong(13, hqLog.isFirstQy() ? 1 : 2);// 1：初次查询
			}

			public int batchSize() {
				return lstlog.size();
			}
		});
	}

	// public void log(long userId, String queryRuleId, long startTime, String
	// logMsg, boolean query_flag) throws ParseException {
	// String sql =
	// "insert into HB_USER_QRY_LOG(LOG_ID, USER_ID,QRY_RULE_ID,QRY_START_DATE, TOTAL_TIME,QRY_FLAG,LOG_MSG)"
	// +
	// " values(Hb_Log_Id.nextval,?,?,to_date(?,'yyyy-MM-dd HH24:mi:ss'),?,?,?)";
	// String stTime = StringUtil.longToString(startTime,
	// StringUtil.DATE_FORMAT_TYPE1);
	// long endTime = System.currentTimeMillis();
	// if (logMsg.length() > 3999) {
	// logMsg = logMsg.substring(0, 3999);
	// }
	// getDataAccess().execNoQuerySql(sql, Long.valueOf(userId), queryRuleId,
	// stTime, (endTime-startTime)+"", query_flag ? 0 : 1, logMsg);
	// }

	// public void log(long userId, String queryRuleId, long startTime, String
	// logMsg, boolean query_flag, HQLog hqlog) throws ParseException {
	// String sql =
	// "insert into HB_USER_QRY_LOG(LOG_ID, USER_ID,QRY_RULE_ID,QRY_START_DATE,"
	// +
	// "TOTAL_TIME,QRY_FLAG,LOG_MSG," +
	// "QRY_TOTAL_TIME,QRY_FILTER_TIME,QRY_PAGE_TIME)"
	// +
	// " values(Hb_Log_Id.nextval,?,?,to_date(?,'yyyy-MM-dd HH24:mi:ss'),?,?,?,?,?,?)";
	// String stTime = StringUtil.longToString(startTime,
	// StringUtil.DATE_FORMAT_TYPE1);
	// long endTime = System.currentTimeMillis();
	// if (logMsg.length() > 3999) {
	// logMsg = logMsg.substring(0, 3999);
	// }
	// getDataAccess().execNoQuerySql(sql, Long.valueOf(userId), queryRuleId,
	// stTime, (endTime-startTime)+"", query_flag ? 0 : 1, logMsg,
	// hqlog.getTotalTime(),hqlog.getFilterTime(),hqlog.getPageTime());
	// }

	/**
	 * 查询序列的下一个值
	 * 
	 * @param scequenceName 序列名称
	 * @return
	 */
	public long queryForNextVal(String scequenceName) {
		String sql = "SELECT " + scequenceName + ".NEXTVAL FROM DUAL";
		return getDataAccess().queryForLong(sql);
	}
}
