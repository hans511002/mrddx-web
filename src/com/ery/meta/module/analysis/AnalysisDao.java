package com.ery.meta.module.analysis;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.web.session.SessionManager;

import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.base.support.utils.MapUtils;

/*******************************************************************************

 * 
 * Collectname： AnalysisDao Description：
 * 
 * Dependent：
 * 
 * Author: 王鹏坤
 * 
 ******************************************************************************/
public class AnalysisDao extends MetaBaseDAO {

	/**
	 * 统计分布图
	 * 
	 * @param paramData
	 * @return
	 */
	public List<Map<String, Object>> queryAnalysisData(Map<String, Object> paramData, List<Long> lstAuthorCol,
			List<Long> lstAuthorDeal) {
		String startTime = MapUtils.getString(paramData, "START_DATE", "");
		String endTime = MapUtils.getString(paramData, "END_DATE", "");
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		long userId = MapUtils.getLongValue(formatUser, "userId", 1);

		// 获取结束时间的毫秒
		long end = StringUtil.stringToLong(endTime, StringUtil.DATE_FORMAT_TYPE1, -1);
		long currentData = StringUtil.dateToLong(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		String currentDateBegin = StringUtil.dateToString(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		String sql = "";
		if (currentData > end) {// 获取历史数据
			sql = " select SUM(C.SUCCESS_COUNT) AS SUCCESS,"
					+ " SUM(C.FAIL_COUNT) AS FAIL,"
					+ " C.TIMEHOUR AS DATA_NO,"
					+ " SUM(C.FAIL_COUNT)+SUM(C.SUCCESS_COUNT) AS TOTAL"
					+ " FROM ((select A.COL_SUCCESS_COUNT AS SUCCESS_COUNT,"
					+ "  A.COL_FAIL_COUNT AS Fail_Count,"
					+ "  TO_CHAR(TO_DATE(A.RUN_YEAR_MONTH_DAY || A.RUN_TIME || '00', 'YYYYMMDDHH24MI'), 'YYYY-MM-DD HH24:MI') AS TIMEHOUR "
					+ " from MR_FTP_COL_STATISTICS_DATE A, MR_FTP_COL_JOB B " + " where A.COL_ID = B.COL_ID ";
			if (userId != 1 && lstAuthorCol.size() > 0) {
				sql += " AND a.col_ID IN " + SqlUtils.inParamDeal(lstAuthorCol);
			}
			if (userId != 1 && lstAuthorCol.size() == 0) {
				sql += " AND a.COL_ID is null";
			}
			sql += "  AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" +
					"  TO_CHAR(TO_DATE('" +
					startTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" +
					"  TO_CHAR(TO_DATE('" +
					endTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24'))" +
					" union all" +
					" 	 (select A.JOB_SUCCESS_COUNT AS SUCCESS_COUNT," +
					" A.Job_Fail_Count AS Fail_Count," +
					" TO_CHAR(TO_DATE(A.RUN_YEAR_MONTH_DAY || A.RUN_TIME || '00', 'YYYYMMDDHH24MI'), 'YYYY-MM-DD HH24:MI') AS TIMEHOUR " +
					" from mr_statistics_date A, MR_JOB B " + " where A.JOB_ID = B.JOB_ID";
			if (userId != 1 && lstAuthorDeal.size() > 0) {
				sql += " AND A.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
			}
			if (userId != 1 && lstAuthorDeal.size() == 0) {
				sql += " AND A.JOB_ID IS NULL ";
			}
			sql += " 	AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" + "  TO_CHAR(TO_DATE('" + startTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + "  TO_CHAR(TO_DATE('" + endTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24'))" + " 	) C" + " GROUP BY C.TIMEHOUR";
			return getDataAccess().queryForList(sql);
		}

		// 获取历史数据和当天数据
		sql = " SELECT X.TIMEHOUR AS DATA_NO,"
				+ " SUM(X.SUCCESS_COUNT) AS SUCCESS,"
				+ " SUM(X.FAIL_COUNT) AS FAIL,"
				+ " SUM(X.FAIL_COUNT)+SUM(X.SUCCESS_COUNT) AS TOTAL"
				+ " FROM("
				+
				// -- 当天的数据
				" ((SELECT "
				+ " SUM(C.SUCCESS_COUNT) AS SUCCESS_COUNT,"
				+ " SUM(C.FAIL_COUNT) AS FAIL_COUNT,"
				+ " TO_CHAR(TO_DATE(C.RUN_YEAR_MONTH_DAY || C.RUN_TIME || '00', 'YYYYMMDDHH24MI'), 'YYYY-MM-DD HH24:MI') AS TIMEHOUR "
				+ " 	FROM"
				+ " ((SELECT to_char(to_date(b.start_time, 'yyyy-mm-dd hh24:mi:ss'), 'yyyymmdd') RUN_YEAR_MONTH_DAY,"
				+ " to_char(to_date(b.start_time, 'yyyy-mm-dd hh24:mi:ss'), 'hh24') RUN_TIME,"
				+ " SUM(case when b.status=1 then 1 else 0 end) AS SUCCESS_COUNT,"
				+ " SUM(case when b.status!=1 then 1 else 0 end) AS FAIL_COUNT"
				+ " 	 from MR_FTP_COL_JOB a, MR_FTP_COL_FILE_LOG b" + " where a.col_id = b.col_id";
		if (userId != 1 && lstAuthorCol.size() > 0) {
			sql += " AND a.col_ID IN " + SqlUtils.inParamDeal(lstAuthorCol);
		}
		if (userId != 1 && lstAuthorCol.size() == 0) {
			sql += " AND a.COL_ID is null";
		}
		if (startTime != null && startTime.length() > 0) {
			sql += " AND TO_DATE(b.START_TIME,'YYYY-MM-DD HH24:MI:SS')>TO_DATE('" + currentDateBegin +
					" 00:00:00','YYYY-MM-DD HH24:MI:SS') ";
		}
		if (endTime != null && endTime.length() > 0) {
			sql += " AND TO_DATE(b.START_TIME,'YYYY-MM-DD HH24:MI:SS')<TO_DATE('" + endTime +
					"','YYYY-MM-DD HH24:MI:SS') ";
		}
		sql += " GROUP BY to_char(to_date(b.start_time, 'yyyy-mm-dd hh24:mi:ss'), 'yyyymmdd'),"
				+ " to_char(to_date(b.start_time, 'yyyy-mm-dd hh24:mi:ss'), 'hh24'))" + " 	union all"
				+ " (SELECT A.DATA_NO RUN_YEAR_MONTH_DAY," + " to_char(A.START_DATE, 'hh24') RUN_TIME, "
				+ " SUM(case when A.RUN_FLAG = 1 then 1 else 0 end) AS SUCCESS_COUNT,"
				+ " SUM(case when A.RUN_FLAG != 1 then 1 else 0 end) AS FAIL_COUNT"
				+ " 	 from MR_JOB_RUN_LOG A, MR_JOB B" + " 	where A.JOB_ID = B.JOB_ID";
		if (userId != 1 && lstAuthorDeal.size() > 0) {
			sql += " AND A.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
		}
		if (userId != 1 && lstAuthorDeal.size() == 0) {
			sql += " AND A.JOB_ID IS NULL ";
		}
		if (startTime != null && startTime.length() > 0) {
			sql += " AND A.START_DATE>TO_DATE('" + currentDateBegin + " 00:00:00','YYYY-MM-DD HH24:MI:SS') ";
		}
		if (endTime != null && endTime.length() > 0) {
			sql += " AND A.START_DATE<TO_DATE('" + endTime + "','YYYY-MM-DD HH24:MI:SS') ";
		}
		sql += "	 GROUP BY A.DATA_NO, to_char(A.START_DATE, 'hh24')))"
				+ "	 C 	 GROUP BY C.RUN_YEAR_MONTH_DAY,C.RUN_TIME"
				+ " ) "
				+ "	 UNION ALL"
				+ " ("
				+
				// -- 历史的数据
				" select SUM(G.SUCCESS_COUNT) AS SUCCESS_COUNT,"
				+ " SUM(G.FAIL_COUNT) AS FAIL_COUNT,"
				+ " G.TIMEHOUR"
				+ " 	 FROM ((select E.COL_SUCCESS_COUNT AS SUCCESS_COUNT,"
				+ " E.COL_FAIL_COUNT AS Fail_Count,"
				+ " TO_CHAR(TO_DATE(E.RUN_YEAR_MONTH_DAY || E.RUN_TIME || '00', 'YYYYMMDDHH24MI'), 'YYYY-MM-DD HH24:MI') AS TIMEHOUR "
				+ " from MR_FTP_COL_STATISTICS_DATE E, MR_FTP_COL_JOB P" + "  where E.COL_ID = P.COL_ID";
		if (userId != 1 && lstAuthorCol.size() > 0) {
			sql += " AND p.col_ID IN " + SqlUtils.inParamDeal(lstAuthorCol);
		}
		if (userId != 1 && lstAuthorCol.size() == 0) {
			sql += " AND p.COL_ID is null";
		}
		sql += " 	 AND E.RUN_YEAR_MONTH_DAY || E.RUN_TIME BETWEEN" +
				" 	 TO_CHAR(TO_DATE('" +
				startTime +
				"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" +
				" 	 TO_CHAR(TO_DATE('" +
				currentDateBegin +
				" 00:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24'))" +
				" union all" +
				" (select F.JOB_SUCCESS_COUNT AS SUCCESS_COUNT," +
				" F.Job_Fail_Count AS Fail_Count," +
				" TO_CHAR(TO_DATE(F.RUN_YEAR_MONTH_DAY || F.RUN_TIME || '00', 'YYYYMMDDHH24MI'), 'YYYY-MM-DD HH24:MI') AS TIMEHOUR " +
				" from mr_statistics_date F, MR_JOB K" + " 	 where F.JOB_ID = K.JOB_ID";
		if (userId != 1 && lstAuthorDeal.size() > 0) {
			sql += " AND F.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
		}
		if (userId != 1 && lstAuthorDeal.size() == 0) {
			sql += " AND F.JOB_ID IS NULL ";
		}
		sql += " 	 AND F.RUN_YEAR_MONTH_DAY || F.RUN_TIME BETWEEN" + " TO_CHAR(TO_DATE('" + startTime +
				"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + " TO_CHAR(TO_DATE('" + currentDateBegin +
				" 00:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24'))" + " 	) G" + " 	GROUP BY G.TIMEHOUR" + " ))" +
				" ) X" + " GROUP BY X.TIMEHOUR";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 获得24小时失几分布图
	 * 
	 * @param paramData
	 * @return
	 */
	public List<Map<String, Object>> queryAnalysisFailData(Map<String, Object> paramData, List<Long> lstAuthorCol,
			List<Long> lstAuthorDeal) {
		String startTime = MapUtils.getString(paramData, "START_DATE", "");
		String endTime = MapUtils.getString(paramData, "END_DATE", "");
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		long userId = MapUtils.getLongValue(formatUser, "userId", 1);

		// 获取结束时间的毫秒
		long end = StringUtil.stringToLong(endTime, StringUtil.DATE_FORMAT_TYPE1, -1);
		long currentData = StringUtil.dateToLong(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		String currentDateBegin = StringUtil.dateToString(new Date(), StringUtil.DATE_FORMAT_TYPE4) + " 00:00:00";
		String sql = "";
		if (currentData > end) {// 获取历史数据
			sql = "SELECT SUM(N.FAIL_COUNT) AS COUNT, N.DATE_HOUR||'点' AS DATE_HOUR FROM (	"
					+ "	(SELECT A.COL_FAIL_COUNT AS FAIL_COUNT," + "	 A.RUN_TIME AS DATE_HOUR "
					+ "	 FROM MR_FTP_COL_STATISTICS_DATE A, MR_FTP_COL_JOB B" + " WHERE A.COL_ID = B.COL_ID";
			if (userId != 1 && lstAuthorCol.size() > 0) {
				sql += " AND A.COL_ID IN " + SqlUtils.inParamDeal(lstAuthorCol);
			}
			if (userId != 1 && lstAuthorCol.size() == 0) {
				sql += " AND A.COL_ID is null";
			}
			sql += " AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" + " 	 TO_CHAR(TO_DATE('" + startTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + " 	 TO_CHAR(TO_DATE('" + endTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24'))" + "	 UNION ALL" +
					"	(SELECT A.JOB_FAIL_COUNT AS FAIL_COUNT," + "	 A.RUN_TIME AS DATE_HOUR " +
					" FROM MR_STATISTICS_DATE A, MR_JOB B" + " WHERE A.JOB_ID = B.JOB_ID";
			if (userId != 1 && lstAuthorDeal.size() > 0) {
				sql += " AND A.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
			}
			if (userId != 1 && lstAuthorDeal.size() == 0) {
				sql += " AND A.JOB_ID IS NULL ";
			}
			sql += " AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" + " 	 TO_CHAR(TO_DATE('" + startTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + " 	 TO_CHAR(TO_DATE('" + endTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24'))" + " " + "	 ) N" + "	GROUP BY N.DATE_HOUR";
			return getDataAccess().queryForList(sql);
		}

		// 获取历史数据和当天数据
		sql = "SELECT SUM(N.FAIL_COUNT) AS COUNT, N.DATE_HOUR||'点' AS DATE_HOUR FROM (	"
				+ " (SELECT COUNT(1) AS FAIL_COUNT," + " 	TO_CHAR(A.start_date, 'HH24') AS DATE_HOUR"
				+ " FROM MR_JOB_RUN_LOG A, MR_JOB B" + " WHERE A.JOB_ID = B.JOB_ID" + " AND A.START_DATE IS NOT NULL"
				+ " 	AND A.RUN_FLAG = 2 ";
		if (userId != 1 && lstAuthorDeal.size() > 0) {
			sql += " AND A.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
		}
		if (userId != 1 && lstAuthorDeal.size() == 0) {
			sql += " AND A.JOB_ID IS NULL ";
		}
		if (startTime != null && startTime.length() > 0) {
			sql += " AND END_DATE>TO_DATE('" + currentDateBegin + "','YYYY-MM-DD HH24:MI:SS') ";
		}
		if (endTime != null && endTime.length() > 0) {
			sql += " AND END_DATE<TO_DATE('" + endTime + "','YYYY-MM-DD HH24:MI:SS') ";
		}
		sql += " GROUP BY TO_CHAR(A.START_DATE, 'HH24'))" + " UNION ALL " + " (SELECT COUNT(1) AS FAIL_COUNT,"
				+ " TO_CHAR(to_date(A.START_TIME, 'YYYY-MM-DD HH24:MI:SS'), 'HH24') AS DATE_HOUR"
				+ " FROM MR_FTP_COL_FILE_LOG A,MR_FTP_COL_JOB B" + " WHERE A.START_TIME IS NOT NULL"
				+ " AND A.COL_ID = B.COL_ID" + " 	AND A.STATUS = 2";
		if (userId != 1 && lstAuthorCol.size() > 0) {
			sql += " AND A.COL_ID IN " + SqlUtils.inParamDeal(lstAuthorCol);
		}
		if (userId != 1 && lstAuthorCol.size() == 0) {
			sql += " AND A.COL_ID is null";
		}
		if (startTime != null && startTime.length() > 0) {
			sql += " AND to_date(start_time,'YYYY-MM-DD HH24:MI:SS')>TO_DATE('" + currentDateBegin +
					"','YYYY-MM-DD HH24:MI:SS') ";
		}
		if (endTime != null && endTime.length() > 0) {
			sql += " AND to_date(start_time,'YYYY-MM-DD HH24:MI:SS')<TO_DATE('" + endTime +
					"','YYYY-MM-DD HH24:MI:SS') ";
		}
		sql += " GROUP BY TO_CHAR(to_date(A.START_TIME, 'YYYY-MM-DD HH24:MI:SS'), 'HH24'))" + " UNION ALL "
				+ "	(SELECT A.Col_Fail_Count AS FAIL_COUNT," + "	 A.RUN_TIME AS DATE_HOUR "
				+ "	 FROM MR_FTP_COL_STATISTICS_DATE A, MR_FTP_COL_JOB B" + " WHERE A.COL_ID = B.COL_ID";
		if (userId != 1 && lstAuthorCol.size() > 0) {
			sql += " AND A.COL_ID IN " + SqlUtils.inParamDeal(lstAuthorCol);
		}
		if (userId != 1 && lstAuthorCol.size() == 0) {
			sql += " AND A.COL_ID is null";
		}
		sql += " AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" + " TO_CHAR(TO_DATE('" + startTime +
				"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + " TO_CHAR(TO_DATE('" + currentDateBegin +
				"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24'))" + "	 UNION ALL" +
				"	(SELECT A.JOB_FAIL_COUNT AS FAIL_COUNT," + "	 A.RUN_TIME AS DATE_HOUR " +
				" FROM MR_STATISTICS_DATE A, MR_JOB B" + " WHERE A.JOB_ID = B.JOB_ID";
		if (userId != 1 && lstAuthorDeal.size() > 0) {
			sql += " AND A.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
		}
		if (userId != 1 && lstAuthorDeal.size() == 0) {
			sql += " AND A.JOB_ID IS NULL ";
		}
		sql += " AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" + " TO_CHAR(TO_DATE('" + startTime +
				"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + " TO_CHAR(TO_DATE('" + currentDateBegin +
				"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24'))" + " " + "	 ) N" + "	GROUP BY N.DATE_HOUR";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 获得采集数据
	 * 
	 * @param paramData
	 * @return
	 */
	public List<Map<String, Object>> queryAnalysisCollectData(Map<String, Object> paramData) {
		String startTime = MapUtils.getString(paramData, "START_DATE", "");
		String endTime = MapUtils.getString(paramData, "END_DATE", "");
		int month = 0 - MapUtils.getIntValue(paramData, "MONTH", 0);
		String sql = "SELECT COUNT(A.COL_ID) COUNT,TYPE_NAME FROM"
				+ " MR_FTP_COL_JOB A LEFT JOIN META_MR_TYPE B ON A.COL_TYPE = B.TYPE_ID "
				+ " INNER JOIN MR_FTP_COL_DETAIL_FILELOG C ON A.COL_ID = C.COL_ID WHERE 1=1 ";

		if (startTime != null && startTime.length() > 0 && month == 0) {
			sql += " AND TO_DATE(C.END_TIME,'YYYY-MM-DD HH24:MI:SS')>TO_DATE('" + startTime +
					"','YYYY-MM-DD HH24:MI:SS') ";
		}
		if (endTime != null && endTime.length() > 0 && month == 0) {
			sql += " AND TO_DATE(C.END_TIME,'YYYY-MM-DD HH24:MI:SS')<TO_DATE('" + endTime +
					"','YYYY-MM-DD HH24:MI:SS') ";
		}
		if (month < 0) {
			sql += " AND TO_DATE(C.END_TIME,'YYYY-MM-DD HH24:MI:SS')<SYSDATE AND" +
					" TO_DATE(C.END_TIME,'YYYY-MM-DD HH24:MI:SS') > ADD_MONTHS(SYSDATE," + month + ")";
		} else if (month == 1) {
			sql += " AND TO_DATE(C.END_TIME,'YYYY-MM-DD HH24:MI:SS')<SYSDATE AND TO_DATE(C.END_TIME,'YYYY-MM-DD HH24:MI:SS') > to_date(to_char(SYSDATE,'yyyy-mm-dd')||' 00:00:00','YYYY-MM-DD HH24:MI:SS')";
		}

		sql += " GROUP BY COL_TYPE,B.TYPE_NAME";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 获得处理数据
	 * 
	 * @param paramData
	 * @return
	 */
	public List<Map<String, Object>> queryAnalysisDealData(Map<String, Object> paramData) {
		String startTime = MapUtils.getString(paramData, "START_DATE", "");
		String endTime = MapUtils.getString(paramData, "END_DATE", "");
		int month = 0 - MapUtils.getIntValue(paramData, "MONTH", 0);
		String sql = "SELECT COUNT(A.JOB_ID) COUNT,TYPE_NAME FROM "
				+ " MR_JOB A INNER JOIN META_MR_TYPE B ON A.JOB_TYPE = B.TYPE_ID "
				+ "	INNER JOIN MR_JOB_RUN_LOG C 	ON A.JOB_ID = C.JOB_ID " + " WHERE 1=1 ";
		if (startTime != null && startTime.length() > 0 && month == 0) {
			sql += " AND A.END_DATE>TO_DATE('" + startTime + "','YYYY-MM-DD HH24:MI:SS') ";
		}
		if (endTime != null && endTime.length() > 0 && month == 0) {
			sql += " AND A.END_DATE<TO_DATE('" + endTime + "','YYYY-MM-DD HH24:MI:SS') ";
		}

		if (month < 0) {
			sql += " AND A.END_DATE<SYSDATE AND A.END_DATE > ADD_MONTHS(SYSDATE," + month + ")";
		} else if (month == 1) {
			sql += " AND a.END_DATE<SYSDATE AND a.END_DATE > to_date(to_char(SYSDATE,'yyyy-mm-dd')||' 00:00:00','YYYY-MM-DD HH24:MI:SS')";
		}

		return getDataAccess().queryForList(sql);
	}

	// /**
	// * 获得成功失败总数
	// *
	// * @return
	// */
	// public Map<String, Object> queryAnalysisInfo(Map<String, Object>
	// paramData) {
	// String startTime = MapUtils.getString(paramData, "START_DATE", "");
	// String endTime = MapUtils.getString(paramData, "END_DATE", "");
	// int month = 0 - MapUtils.getIntValue(paramData, "MONTH", 0);
	// String sql =
	// "SELECT SUM(CASE RUN_FLAG WHEN 1 THEN 1 ELSE 0 END) AS SUCCESS,"
	// + "SUM(CASE RUN_FLAG WHEN 2 THEN 1 ELSE 0 END) AS FAIL,"
	// +
	// "COUNT(*) AS TOTAL,DECODE(SUM(CASE RUN_FLAG WHEN 1 THEN 1 ELSE 0 END)/COUNT(*)*100,100,100||'%'"
	// +
	// ",TO_CHAR(SUM(CASE RUN_FLAG WHEN 1 THEN 1 ELSE 0 END)/COUNT(*)*100,'FM00.00')||'%') AS SUCCESS_RATE "
	// + "FROM MR_JOB_RUN_LOG WHERE RUN_FLAG IN (1,2) ";
	// if(startTime!=null&&startTime.length()>0&&month==0){
	// sql += " AND END_DATE>TO_DATE('"+startTime+"','YYYY-MM-DD HH24:MI:SS') ";
	// }
	// if(endTime!=null&&endTime.length()>0&&month==0){
	// sql += " AND END_DATE<TO_DATE('"+endTime+"','YYYY-MM-DD HH24:MI:SS') ";
	// }
	// if (month<0) {
	// sql += " AND END_DATE<SYSDATE AND END_DATE > ADD_MONTHS(SYSDATE,"
	// + month + ")";
	// }else if(month == 1){
	// sql +=
	// " AND END_DATE<SYSDATE AND END_DATE > to_date(to_char(SYSDATE,'yyyy-mm-dd')||' 00:00:00','YYYY-MM-DD HH24:MI:SS')";
	// }
	// return getDataAccess().queryForMap(sql);
	// }
	public static java.text.SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	public static java.text.SimpleDateFormat ym = new SimpleDateFormat("yyyyMM");
	public static java.text.SimpleDateFormat ymd = new SimpleDateFormat("yyyyMMdd");

	/**
	 * 获得表格数据
	 * 
	 * @param paramData
	 * @return
	 * @throws ParseException
	 */
	public List<Map<String, Object>> queryAnalysisList(Map<String, Object> paramData, List<Long> lstAuthorCol,
			List<Long> lstAuthorDeal) throws ParseException {
		String startTime = MapUtils.getString(paramData, "START_DATE", "");
		String endTime = MapUtils.getString(paramData, "END_DATE", "");
		Date startDate = sdf.parse(startTime);
		Date endDate = sdf.parse(endTime);
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		long userId = MapUtils.getLongValue(formatUser, "userId", 1);

		// 获取结束时间的毫秒
		long end = StringUtil.stringToLong(endTime, StringUtil.DATE_FORMAT_TYPE1, -1);
		long currentData = StringUtil.dateToLong(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		String currentDateBegin = StringUtil.dateToString(new Date(), StringUtil.DATE_FORMAT_TYPE4) + " 00:00:00";
		String sql = "";
		if (currentData > end) {// 获取历史数据
			sql = "SELECT INNERTABLE_.*, DECODE(ROWNUM, 1, MAX(ROWNUM) OVER(), 0) TOTAL_COUNT_ FROM"
					+ "(	 "
					+
					// 历史采集数据
					" SELECT M.TYPE_ID AS JOB_TYPE, N.TYPE_NAME AS NAME, SUM(M.SUCCESS) AS SUCCESS ,SUM(FAIL) AS FAIL, (SUM(M.SUCCESS)+SUM(FAIL)) AS total FROM"
					+ " 	(SELECT SUM(A.COL_SUCCESS_COUNT) AS SUCCESS," + " 	SUM(A.COL_FAIL_COUNT) AS FAIL,"
					+ " 	B.COL_TYPE AS TYPE_ID" + " FROM MR_FTP_COL_STATISTICS_DATE A, MR_FTP_COL_JOB B"
					+ " WHERE A.COL_ID = B.COL_ID";
			if (userId != 1 && lstAuthorCol.size() > 0) {
				sql += " AND A.COL_ID IN " + SqlUtils.inParamDeal(lstAuthorCol);
			}

			if (userId != 1 && lstAuthorCol.size() == 0) {
				sql += " AND A.COL_ID is null";
			}
			sql += " AND A.RUN_YEAR_MONTH_DAY BETWEEN '" +
					ymd.format(startDate) +
					"' AND '" +
					ymd.format(endDate) +
					"'"
					// " 	 AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" +
					// " 	 TO_CHAR(TO_DATE('" + startTime
					// + "', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" +
					// " 	 TO_CHAR(TO_DATE('" + endTime
					// + "', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') "
					+ " GROUP BY B.COL_TYPE" + " 	 UNION ALL" +
					// 历史处理数据
					" 	 SELECT SUM(A.JOB_SUCCESS_COUNT) AS SUCCESS," + " 	SUM(A.JOB_FAIL_COUNT) AS FAIL," +
					" 	B.JOB_TYPE AS TYPE_ID" + " FROM MR_STATISTICS_DATE A, MR_JOB B" + " WHERE A.JOB_ID = B.JOB_ID";
			if (userId != 1 && lstAuthorDeal.size() > 0) {
				sql += " AND A.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
			}
			if (userId != 1 && lstAuthorDeal.size() == 0) {
				sql += " AND A.JOB_ID IS NULL ";
			}
			sql += " AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" + " 	 TO_CHAR(TO_DATE('" + startTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + " 	 TO_CHAR(TO_DATE('" + endTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" + " GROUP BY B.JOB_TYPE) M,META_MR_TYPE N" +
					" 	WHERE M.TYPE_ID = N.TYPE_ID" + " 	GROUP BY M.TYPE_ID, N.TYPE_NAME " + " ORDER BY M.TYPE_ID " +
					")INNERTABLE_";
			return getDataAccess().queryForList(sql);
		}
		sql = "SELECT INNERTABLE_.*, DECODE(ROWNUM, 1, MAX(ROWNUM) OVER(), 0) TOTAL_COUNT_ FROM"
				+ "(	 "
				+
				// 当天处理数据
				" SELECT M.TYPE_ID AS JOB_TYPE, N.TYPE_NAME AS NAME, SUM(M.SUCCESS) AS SUCCESS ,SUM(FAIL) AS FAIL, (SUM(M.SUCCESS)+SUM(FAIL)) AS total FROM "
				+ " 	 ( SELECT SUM(CASE WHEN A.RUN_FLAG = 1 THEN 1 ELSE 0 END) AS SUCCESS,"
				+ " 	SUM(CASE WHEN A.RUN_FLAG != 1 THEN 1 ELSE 0 END) AS FAIL," + " 	B.JOB_TYPE AS TYPE_ID"
				+ " FROM MR_JOB_RUN_LOG A,MR_JOB B" + " WHERE A.JOB_ID = B.JOB_ID";
		if (userId != 1 && lstAuthorDeal.size() > 0) {
			sql += " AND A.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
		}
		if (userId != 1 && lstAuthorDeal.size() == 0) {
			sql += " AND A.JOB_ID IS NULL ";
		}
		sql += " 	AND A.START_DATE > TO_DATE('" + currentDateBegin + "', 'YYYY-MM-DD HH24:MI:SS')" +
				" AND A.START_DATE < TO_DATE('" + endTime + "', 'YYYY-MM-DD HH24:MI:SS')" +
				" GROUP BY B.JOB_TYPE" +
				" 	 UNION ALL" +
				// 当天采集数据
				" 	 SELECT SUM(CASE WHEN A.STATUS = 1 THEN 1 ELSE 0 END) AS SUCCESS," +
				" 	SUM(CASE WHEN A.STATUS != 1 THEN 1 ELSE 0 END) AS FAIL," + " 	B.COL_TYPE AS TYPE_ID" +
				" FROM MR_FTP_COL_FILE_LOG A,MR_FTP_COL_JOB B" + " WHERE A.COL_ID = B.COL_ID";
		if (userId != 1 && lstAuthorCol.size() > 0) {
			sql += " AND A.COL_ID IN " + SqlUtils.inParamDeal(lstAuthorCol);
		}

		if (userId != 1 && lstAuthorCol.size() == 0) {
			sql += " AND A.COL_ID is null";
		}
		sql += " AND TO_DATE(A.START_TIME, 'YYYY-MM-DD HH24:MI:SS') > TO_DATE('" + currentDateBegin +
				"', 'YYYY-MM-DD HH24:MI:SS')" + " AND TO_DATE(A.START_TIME, 'YYYY-MM-DD HH24:MI:SS') < TO_DATE('" +
				endTime + "', 'YYYY-MM-DD HH24:MI:SS')" + " GROUP BY B.COL_TYPE" +
				" 	 UNION ALL" +
				// 历史采集数据
				" 	 SELECT SUM(A.COL_SUCCESS_COUNT) AS SUCCESS," + " 	SUM(A.COL_FAIL_COUNT) AS FAIL," +
				" 	B.COL_TYPE AS TYPE_ID" + " FROM MR_FTP_COL_STATISTICS_DATE A, MR_FTP_COL_JOB B" +
				" WHERE A.COL_ID = B.COL_ID";
		if (userId != 1 && lstAuthorCol.size() > 0) {
			sql += " AND A.COL_ID IN " + SqlUtils.inParamDeal(lstAuthorCol);
		}

		if (userId != 1 && lstAuthorCol.size() == 0) {
			sql += " AND A.COL_ID is null";
		}
		sql += " 	 AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" + " TO_CHAR(TO_DATE('" + startTime +
				"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + " TO_CHAR(TO_DATE('" + currentDateBegin +
				"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" + " GROUP BY B.COL_TYPE" + " 	 UNION ALL" +
				// 历史处理数据
				" 	 SELECT SUM(A.JOB_SUCCESS_COUNT) AS SUCCESS," + " 	SUM(A.JOB_FAIL_COUNT) AS FAIL," +
				" 	B.JOB_TYPE AS TYPE_ID" + " FROM MR_STATISTICS_DATE A, MR_JOB B" + " WHERE A.JOB_ID = B.JOB_ID";
		if (userId != 1 && lstAuthorDeal.size() > 0) {
			sql += " AND A.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
		}
		if (userId != 1 && lstAuthorDeal.size() == 0) {
			sql += " AND A.JOB_ID IS NULL ";
		}
		sql += " 	 AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" + " TO_CHAR(TO_DATE('" + startTime +
				"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + " TO_CHAR(TO_DATE('" + currentDateBegin +
				"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" + " GROUP BY B.JOB_TYPE) M,META_MR_TYPE N" +
				" 	WHERE M.TYPE_ID = N.TYPE_ID" + " 	GROUP BY M.TYPE_ID,N.TYPE_NAME" + " ORDER BY M.TYPE_ID" +
				")INNERTABLE_";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 查询业务类型
	 * 
	 * @return
	 */
	public List<Map<String, Object>> queryMrTypeInfo() {
		String sql = "SELECT TYPE_ID,TYPE_NAME FROM META_MR_TYPE";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 按采集(文件数)、处理(入库量)统计
	 * 
	 * @param paramData
	 * @return
	 */
	public List<Map<String, Object>> queryAnalyCollectDealData(Map<String, Object> paramData, List<Long> lstAuthorCol,
			List<Long> lstAuthorDeal) {
		String startTime = MapUtils.getString(paramData, "START_DATE", "");
		String endTime = MapUtils.getString(paramData, "END_DATE", "");
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		long userId = MapUtils.getLongValue(formatUser, "userId", 1);

		// 获取结束时间的毫秒
		long end = StringUtil.stringToLong(endTime, StringUtil.DATE_FORMAT_TYPE1, -1);
		long currentData = StringUtil.dateToLong(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		String currentDateBegin = StringUtil.dateToString(new Date(), StringUtil.DATE_FORMAT_TYPE4) + " 00:00:00";
		String sql = "";
		if (currentData > end) {// 获取历史数据
			sql = "SELECT N.TYPE_NAME AS type_name, SUM(M.FILE_SIZE) AS col_count, SUM(M.RECORD_COUNT) AS deal_count FROM "
					+ "("
					+ " 	(SELECT C.TYPE_ID,"
					+ " 	SUM(A.COL_FILESIZE) AS FILE_SIZE,"
					+ " 	 0  AS RECORD_COUNT"
					+ " 	 FROM MR_FTP_COL_STATISTICS_DATE A, MR_FTP_COL_JOB B, META_MR_TYPE C"
					+ " 	 WHERE A.COL_ID = B.COL_ID";
			if (userId != 1 && lstAuthorCol.size() > 0) {
				sql += " AND A.COL_ID IN " + SqlUtils.inParamDeal(lstAuthorCol);
			}
			if (userId != 1 && lstAuthorCol.size() == 0) {
				sql += " AND A.COL_ID is null";
			}
			sql += " 	 AND B.COL_TYPE = C.TYPE_ID" +
					" AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" +
					" TO_CHAR(TO_DATE('" +
					startTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" +
					" TO_CHAR(TO_DATE('" +
					endTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" +
					" GROUP BY C.TYPE_ID)" +
					" 	UNION ALL" +
					" 	(SELECT C.TYPE_ID," +
					" 	0  AS FILE_SIZE," +
					" 	SUM(CASE WHEN A.REDUCE_OUTPUT_COUNT > 0 THEN A.REDUCE_OUTPUT_COUNT ELSE A.MAP_OUTPUT_COUNT END) AS RECORD_COUNT" +
					" FROM MR_STATISTICS_DATE A, MR_JOB B, META_MR_TYPE C" + " WHERE A.JOB_ID = B.JOB_ID";
			if (userId != 1 && lstAuthorDeal.size() > 0) {
				sql += " AND A.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
			}
			if (userId != 1 && lstAuthorDeal.size() == 0) {
				sql += " AND A.JOB_ID IS NULL ";
			}
			sql += " 	AND B.JOB_TYPE = C.TYPE_ID" + " 	AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" +
					" 	TO_CHAR(TO_DATE('" + startTime + "', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" +
					" 	TO_CHAR(TO_DATE('" + endTime + "', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" +
					" 	GROUP BY C.TYPE_ID)	" + ") M, META_MR_TYPE N" + " WHERE M.TYPE_ID = N.TYPE_ID" +
					" GROUP BY N.TYPE_NAME";

			return getDataAccess().queryForList(sql);
		}

		sql = "SELECT N.TYPE_NAME AS type_name, SUM(M.FILE_SIZE) AS col_count, SUM(M.RECORD_COUNT) AS deal_count FROM "
				+ "("
				+ " 	(SELECT B.TYPE_ID,"
				+ " 	0 AS FILE_SIZE,"
				+ " 	SUM(CASE WHEN C.REDUCE_OUTPUT_COUNT > 0 THEN C.REDUCE_OUTPUT_COUNT ELSE C.MAP_OUTPUT_COUNT END) AS RECORD_COUNT"
				+ " FROM MR_JOB A, META_MR_TYPE B, MR_JOB_RUN_LOG C" + " 	 WHERE A.JOB_ID = C.JOB_ID";
		if (userId != 1 && lstAuthorDeal.size() > 0) {
			sql += " AND A.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
		}
		if (userId != 1 && lstAuthorDeal.size() == 0) {
			sql += " AND A.JOB_ID IS NULL ";
		}
		sql += " 	 AND C.RUN_FLAG = 1" + " AND A.JOB_TYPE = B.TYPE_ID" + " AND END_DATE > TO_DATE('" +
				currentDateBegin +
				"', 'YYYY-MM-DD HH24:MI:SS')" +
				" AND END_DATE < TO_DATE('" +
				endTime +
				"', 'YYYY-MM-DD HH24:MI:SS')" +
				" 	 GROUP BY B.TYPE_ID)" +
				" 	UNION ALL" +
				" 	(SELECT B.TYPE_ID," +
				" 	SUM(NVL(C.FILE_TOTALSIZE,0)) AS FILE_SIZE," +
				" 	0 AS RECORD_COUNT" +
				" FROM MR_FTP_COL_JOB A, META_MR_TYPE B, MR_FTP_COL_FILE_LOG C" +
				" 	 WHERE TYPE_NAME IS NOT NULL" +
				" AND A.COL_TYPE = B.TYPE_ID" +
				" AND C.STATUS = 1" +
				" AND A.COL_ID = C.COL_ID" +
				" AND TO_DATE(C.END_TIME, 'YYYY-MM-DD HH24:MI:SS') > TO_DATE('" +
				currentDateBegin +
				"', 'YYYY-MM-DD HH24:MI:SS')" +
				" AND TO_DATE(C.END_TIME, 'YYYY-MM-DD HH24:MI:SS') < TO_DATE('" +
				endTime +
				"', 'YYYY-MM-DD HH24:MI:SS')" +
				" 	GROUP BY B.TYPE_ID)" +
				" union all" +
				" 	(SELECT C.TYPE_ID," +
				" 	SUM(A.COL_FILESIZE) AS FILE_SIZE," +
				" 	0 AS RECORD_COUNT" +
				" 	 FROM MR_FTP_COL_STATISTICS_DATE A, MR_FTP_COL_JOB B, META_MR_TYPE C" +
				" 	 WHERE A.COL_ID = B.COL_ID" +
				" 	 AND B.COL_TYPE = C.TYPE_ID" +
				" 	 AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" +
				" TO_CHAR(TO_DATE('" +
				startTime +
				"', 'YYYY-MM-DD HH24:MI:SS'),'YYYYMMDDHH24') AND" +
				" TO_CHAR(TO_DATE('" +
				currentDateBegin +
				"', 'YYYY-MM-DD HH24:MI:SS'),'YYYYMMDDHH24')" +
				" GROUP BY C.TYPE_ID)" +
				" 	UNION ALL" +
				" 	(SELECT C.TYPE_ID," +
				" 	0 AS FILE_SIZE," +
				" 	SUM(CASE WHEN A.REDUCE_OUTPUT_COUNT > 0 THEN A.REDUCE_OUTPUT_COUNT ELSE A.MAP_OUTPUT_COUNT END) AS RECORD_COUNT" +
				" 	 FROM MR_STATISTICS_DATE A, MR_JOB B, META_MR_TYPE C" + " 	 WHERE A.JOB_ID = B.JOB_ID";
		if (userId != 1 && lstAuthorDeal.size() > 0) {
			sql += " AND A.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
		}
		if (userId != 1 && lstAuthorDeal.size() == 0) {
			sql += " AND A.JOB_ID IS NULL ";
		}
		sql += " 	 AND B.JOB_TYPE = C.TYPE_ID" + " AND A.RUN_YEAR_MONTH_DAY || A.RUN_TIME BETWEEN" +
				" TO_CHAR(TO_DATE('" + startTime + "', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" +
				" TO_CHAR(TO_DATE('" + currentDateBegin + "', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" +
				" 	GROUP BY C.TYPE_ID)	" + ") M, META_MR_TYPE N " + " WHERE M.TYPE_ID = N.TYPE_ID" +
				" GROUP BY N.TYPE_NAME";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 任务列表
	 * 
	 * @param paramData
	 * @param lstAuthorCol
	 * @param lstAuthorDeal
	 * @return
	 */
	public List<Map<String, Object>> queryPartAnalysisList(Map<String, Object> paramData, List<Long> lstAuthorCol,
			List<Long> lstAuthorDeal) {
		String startTime = MapUtils.getString(paramData, "START_DATE", "");
		String endTime = MapUtils.getString(paramData, "END_DATE", "");
		long workId = MapUtils.getLongValue(paramData, "WORK_ID");
		String ruleName = MapUtils.getString(paramData, "RULE_NAME");
		List<Object> params = new ArrayList<Object>();
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		long userId = MapUtils.getLongValue(formatUser, "userId", 1);

		// 获取结束时间的毫秒
		long end = StringUtil.stringToLong(endTime, StringUtil.DATE_FORMAT_TYPE1, -1);
		long currentData = StringUtil.dateToLong(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		String currentDateBegin = StringUtil.dateToString(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		List<Map<String, Object>> lstResult = new ArrayList<Map<String, Object>>();
		String sql = "";
		if (currentData > end) {// 获取历史数据
			sql = "SELECT C.JOB_ID,"
					+ " C.INPUT_COUNT,"
					+ " C.OUTPUT_COUNT,"
					+ " ROUND(C.SUCCESS_COUNT / (CASE WHEN (FAIL_COUNT+SUCCESS_COUNT)=0 THEN 1 ELSE (FAIL_COUNT+SUCCESS_COUNT) END), 2) * 100 || '%' AS SUCCESS_RATE,"
					+ " D.COL_NAME AS col_name,"
					+ "	 CASE WHEN D.COL_ORIGIN = 0 THEN '下载' ELSE '上传' END AS job_origin,"
					+ " D.COL_TYPE AS job_type," + " D.COL_DATATYPE," + " D.COL_DESCRIBE,"
					+ "	 D.COL_TASK_NUMBER || '/' || 0 AS MR," + "	 E.PARAM_VALUE," + " F.TYPE_NAME"
					+ " FROM (SELECT A.COL_ID AS JOB_ID,"
					+ "  SUM(CASE WHEN B.COL_FILE_COUNT IS NULL THEN 0 ELSE B.COL_FILE_COUNT END) AS OUTPUT_COUNT,"
					+ " 	 SUM(CASE WHEN B.COL_FILE_COUNT IS NULL THEN 0 ELSE B.COL_FILE_COUNT END) AS INPUT_COUNT,"
					+ " 	 SUM(NVL(B.Col_Fail_Count, 0)) as FAIL_COUNT,"
					+ "  SUM(NVL(B.COL_SUCCESS_COUNT, 0)) SUCCESS_COUNT"
					+ " FROM MR_FTP_COL_JOB A, MR_FTP_COL_STATISTICS_DATE B" + " WHERE A.Col_Id = B.Col_Id"
					+ " AND A.COL_TYPE = ?";
			params.add(workId);
			// 设置权限部分的任务ID
			if (userId != 1 && lstAuthorCol.size() > 0) {
				sql += " AND A.COL_ID in " + SqlUtils.inParamDeal(lstAuthorCol);
			}
			if (userId != 1 && lstAuthorCol.size() == 0) {
				sql += " AND A.COL_ID is null";
			}

			if (null != ruleName & !"".equals(ruleName)) {
				if (!ruleName.contains("%") && !ruleName.contains("_")) {
					sql += " AND UPPER(A.COL_NAME ) LIKE UPPER(?) ";
					params.add("%" + ruleName + "%");
				} else {
					String ruleNameTemp = ruleName.replaceAll("_", "/_").replaceAll("%", "/%");
					sql += " AND Upper(A.COL_NAME ) LIKE UPPER(?) ESCAPE '/' ";
					params.add("%" + ruleNameTemp + "%");
				}
			}
			sql += " AND B.RUN_YEAR_MONTH_DAY || B.RUN_TIME BETWEEN" + "  TO_CHAR(TO_DATE('" + startTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + "  TO_CHAR(TO_DATE('" + endTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" + " GROUP BY A.Col_Id) C," + " MR_FTP_COL_JOB D," +
					" MR_DATA_SOURCE_PARAM E," + " META_MR_TYPE F" + " WHERE C.JOB_ID = D.COL_ID" +
					" AND D.col_run_datasource = E.DATA_SOURCE_ID" + " AND D.COL_TYPE = F.TYPE_ID" +
					" AND E.PARAM_NAME = 'mr.mapred.sys.fs.default.name'";
			lstResult.addAll(getDataAccess().queryForList(sql, params.toArray()));// 获取历史部分采集数据

			params.clear();
			sql = "SELECT C.JOB_ID,"
					+ "  C.MAP_INPUT_COUNT INPUT_COUNT,"
					+ "  (CASE WHEN C.REDUCE_OUTPUT_COUNT != 0 THEN C.REDUCE_OUTPUT_COUNT ELSE C.MAP_OUTPUT_COUNT END)AS OUTPUT_COUNT,"
					+ " ROUND( C.SUCCESS_COUNT / (CASE WHEN (C.SUCCESS_COUNT+C.FAIL_COUNT)=0 THEN 1 ELSE (C.SUCCESS_COUNT+C.FAIL_COUNT) END), 2) * 100 || '%' AS SUCCESS_RATE,"
					+ " D.job_name AS col_name,"
					+ "  '处理' AS job_origin,"
					+ "  D.job_type,"
					+ " D.map_tasks || '/' || D.reduce_tasks AS MR,"
					+ " D.job_describe AS col_describe,"
					+ " E.param_value,"
					+ "  F.TYPE_NAME,"
					+ "  -1 AS COL_DATATYPE"
					+ " FROM (SELECT A.JOB_ID,"
					+ " 	 SUM(CASE WHEN B.MAP_INPUT_COUNT IS NULL THEN 0 ELSE B.MAP_INPUT_COUNT END) AS MAP_INPUT_COUNT,"
					+ " SUM(CASE WHEN B.MAP_OUTPUT_COUNT IS NULL THEN 0 ELSE B.MAP_OUTPUT_COUNT END) AS MAP_OUTPUT_COUNT,"
					+ " SUM(CASE WHEN B.REDUCE_OUTPUT_COUNT IS NULL THEN 0 ELSE B.REDUCE_OUTPUT_COUNT END) AS REDUCE_OUTPUT_COUNT,"
					+ " SUM(NVL(B.JOB_FAIL_COUNT, 0)) FAIL_COUNT," + " SUM(NVL(B.Job_Success_Count, 0)) SUCCESS_COUNT"
					+ " FROM MR_JOB A, MR_STATISTICS_DATE B" + " WHERE A.JOB_ID = B.JOB_ID" + " 	AND A.JOB_TYPE = ?";
			params.add(workId);
			// 设置权限部分的任务ID
			if (userId != 1 && lstAuthorDeal.size() > 0) {
				sql += " AND A.JOB_ID in " + SqlUtils.inParamDeal(lstAuthorDeal);
			}
			if (userId != 1 && lstAuthorDeal.size() == 0) {
				sql += " AND A.JOB_ID is null";
			}

			if (null != ruleName & !"".equals(ruleName)) {
				if (!ruleName.contains("%") && !ruleName.contains("_")) {
					sql += " AND UPPER(A.JOB_NAME ) LIKE UPPER(?) ";
					params.add("%" + ruleName + "%");
				} else {
					String ruleNameTemp = ruleName.replaceAll("_", "/_").replaceAll("%", "/%");
					sql += " AND Upper(A.JOB_NAME ) LIKE UPPER(?) ESCAPE '/' ";
					params.add("%" + ruleNameTemp + "%");
				}
			}
			sql += " AND B.RUN_YEAR_MONTH_DAY || B.RUN_TIME BETWEEN" + " TO_CHAR(TO_DATE('" + startTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + " TO_CHAR(TO_DATE('" + endTime +
					"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" +
					" GROUP BY A.JOB_ID)C, MR_JOB D, MR_DATA_SOURCE_PARAM E, META_MR_TYPE F" +
					" WHERE C.JOB_ID = D.JOB_ID" + "	 AND D.job_run_datasource = E.data_source_id" +
					"	 AND D.JOB_TYPE = F.TYPE_ID" + "	 AND E.PARAM_NAME = 'mr.mapred.sys.fs.default.name'";
			lstResult.addAll(getDataAccess().queryForList(sql, params.toArray()));// 获取历史部分处理数据
			return lstResult;
		}

		// 获取历史和当天采集数据
		sql = "SELECT X.JOB_ID,      "
				+ " X.OUTPUT_COUNT,      "
				+ " X.SUCCESS_RATE || '%' AS SUCCESS_RATE,      "
				+ " X.INPUT_COUNT,      "
				+ " D.COL_NAME,      "
				+ " CASE WHEN D.COL_ORIGIN = 0 THEN '下载' ELSE '上传' END AS job_origin,   "
				+ " D.COL_TYPE AS job_type,      "
				+ " D.COL_DATATYPE,      "
				+ " D.COL_DESCRIBE,      "
				+ " D.COL_TASK_NUMBER || '/' || 0 AS MR,     "
				+ " E.PARAM_VALUE,      "
				+ " F.TYPE_NAME      "
				+ " FROM (SELECT JOB_ID,      "
				+ " SUM(C.INPUT_COUNT) AS INPUT_COUNT,     "
				+ " SUM(C.OUTPUT_COUNT) AS OUTPUT_COUNT,    "
				+ " ROUND(SUM(C.SUCCESS_COUNT) / (CASE WHEN SUM(C.SUCCESS_COUNT + C.FAIL_COUNT)=0 THEN 1 ELSE SUM(C.SUCCESS_COUNT + C.FAIL_COUNT) END), 2) * 100 AS SUCCESS_RATE  "
				+ " FROM ((SELECT A.COL_ID AS JOB_ID,     "
				+ "  SUM(CASE WHEN B.STATUS = 1 THEN B.FILE_NUM ELSE 0 END) AS INPUT_COUNT,  "
				+ "  SUM(CASE WHEN B.STATUS = 1 THEN B.FILE_NUM ELSE 0 END) AS OUTPUT_COUNT,  "
				+ "  SUM(CASE WHEN B.STATUS = 1 THEN 1 ELSE 0 END) AS SUCCESS_COUNT,   "
				+ "  SUM(CASE WHEN B.STATUS != 1 THEN 1 ELSE 0 END) AS FAIL_COUNT   " + " FROM MR_FTP_COL_JOB A      "
				+ " LEFT JOIN MR_FTP_COL_FILE_LOG B     " + "  ON A.COL_ID = B.COL_ID     "
				+ "  WHERE A.COL_TYPE = ?     ";
		params.add(workId);
		// 设置权限部分的采集ID
		if (userId != 1 && lstAuthorCol.size() > 0) {
			sql += " AND A.COL_ID in " + SqlUtils.inParamDeal(lstAuthorCol);
		}
		if (userId != 1 && lstAuthorCol.size() == 0) {
			sql += " AND A.COL_ID is null";
		}

		if (null != ruleName & !"".equals(ruleName)) {
			if (!ruleName.contains("%") && !ruleName.contains("_")) {
				sql += " AND UPPER(A.COL_NAME ) LIKE UPPER(?) ";
				params.add("%" + ruleName + "%");
			} else {
				String ruleNameTemp = ruleName.replaceAll("_", "/_").replaceAll("%", "/%");
				sql += " AND Upper(A.COL_NAME ) LIKE UPPER(?) ESCAPE '/' ";
				params.add("%" + ruleNameTemp + "%");
			}
		}

		sql += " AND TO_DATE(B.end_time, 'YYYY-MM-DD HH24:MI:SS') > TO_DATE('" + currentDateBegin +
				" 00:00:00', 'YYYY-MM-DD HH24:MI:SS')" +
				"  AND TO_DATE(B.END_TIME, 'YYYY-MM-DD HH24:MI:SS') < TO_DATE('" + endTime +
				"', 'YYYY-MM-DD HH24:MI:SS')  " + "  GROUP BY A.COL_ID)     " + " union all     " +
				"  (SELECT A.COL_ID AS JOB_ID,     " +
				"  SUM(CASE WHEN B.COL_FILE_COUNT IS NULL THEN 0 ELSE B.COL_FILE_COUNT END) AS INPUT_COUNT, " +
				"  SUM(CASE WHEN B.COL_FILE_COUNT IS NULL THEN 0 ELSE B.COL_FILE_COUNT END) AS OUTPUT_COUNT,  " +
				"  SUM(NVL(B.COL_SUCCESS_COUNT, 0)) SUCCESS_COUNT,   " +
				"  SUM(NVL(B.COL_FAIL_COUNT, 0)) as FAIL_COUNT   " +
				" FROM MR_FTP_COL_JOB A, MR_FTP_COL_STATISTICS_DATE B    " + "  WHERE A.COL_ID = B.COL_ID     " +
				"  AND A.COL_TYPE = ?      ";
		params.add(workId);
		// 设置权限部分的采集ID
		if (userId != 1 && lstAuthorCol.size() > 0) {
			sql += " AND A.COL_ID in " + SqlUtils.inParamDeal(lstAuthorCol);
		}
		if (userId != 1 && lstAuthorCol.size() == 0) {
			sql += " AND A.COL_ID is null";
		}

		if (null != ruleName & !"".equals(ruleName)) {
			if (!ruleName.contains("%") && !ruleName.contains("_")) {
				sql += " AND UPPER(A.COL_NAME ) LIKE UPPER(?) ";
				params.add("%" + ruleName + "%");
			} else {
				String ruleNameTemp = ruleName.replaceAll("_", "/_").replaceAll("%", "/%");
				sql += " AND Upper(A.COL_NAME ) LIKE UPPER(?) ESCAPE '/' ";
				params.add("%" + ruleNameTemp + "%");
			}
		}
		sql += "  AND B.RUN_YEAR_MONTH_DAY || B.RUN_TIME BETWEEN    " + "  TO_CHAR(TO_DATE('" + startTime +
				"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND  " + "  TO_CHAR(TO_DATE('" + currentDateBegin +
				"', 'YYYY-MM-DD'), 'YYYYMMDD')||00  " + "  GROUP BY A.Col_Id)) C     " +
				" GROUP BY C.JOB_ID) X,      " + " 	MR_FTP_COL_JOB D, MR_DATA_SOURCE_PARAM E, META_MR_TYPE F   " +
				" WHERE X.JOB_ID = D.COL_ID     " + " AND D.col_run_datasource = E.DATA_SOURCE_ID    " +
				" AND D.COL_TYPE = F.TYPE_ID      " + " AND E.PARAM_NAME = 'mr.mapred.sys.fs.default.name'";

		lstResult.addAll(getDataAccess().queryForList(sql, params.toArray()));

		params.clear();
		// 获取历史和当天处理部分数据
		sql = "SELECT X.JOB_ID,       "
				+ " X.MAP_INPUT_COUNT INPUT_COUNT,      "
				+ " (CASE WHEN X.REDUCE_OUTPUT_COUNT != 0 THEN X.REDUCE_OUTPUT_COUNT ELSE X.MAP_OUTPUT_COUNT END) AS OUTPUT_COUNT,  "
				+ " X.SUCCESS_RATE || '%' AS SUCCESS_RATE,       "
				+ " D.JOB_NAME AS COL_NAME,      "
				+ " '处理' AS JOB_ORIGIN,      "
				+ " D.JOB_TYPE,       "
				+ " D.MAP_TASKS || '/' || D.REDUCE_TASKS AS MR,      "
				+ " D.JOB_DESCRIBE AS COL_DESCRIBE,      "
				+ " E.PARAM_VALUE,       "
				+ " F.TYPE_NAME,      "
				+ " -1 AS COL_DATATYPE       "
				+ " FROM (select C.JOB_ID,      "
				+ " SUM(C.MAP_INPUT_COUNT) AS MAP_INPUT_COUNT,     "
				+ " SUM(C.MAP_OUTPUT_COUNT) AS MAP_OUTPUT_COUNT,     "
				+ " SUM(C.REDUCE_OUTPUT_COUNT) AS REDUCE_OUTPUT_COUNT,    "
				+ " ROUND(SUM(C.SUCCESS_COUNT) / (CASE WHEN SUM(C.SUCCESS_COUNT + C.FAIL_COUNT)=0 THEN 1 ELSE SUM(C.SUCCESS_COUNT + C.FAIL_COUNT) END), 2) * 100 AS SUCCESS_RATE  "
				+ "	 from ((SELECT A.JOB_ID,      "
				+ "  SUM(CASE WHEN B.MAP_INPUT_COUNT IS NULL THEN 0 ELSE B.MAP_INPUT_COUNT END) AS MAP_INPUT_COUNT,  "
				+ "  SUM(CASE WHEN B.MAP_OUTPUT_COUNT IS NULL THEN 0 ELSE B.MAP_OUTPUT_COUNT END) AS MAP_OUTPUT_COUNT, "
				+ "  SUM(CASE WHEN B.REDUCE_OUTPUT_COUNT IS NULL THEN 0 ELSE B.REDUCE_OUTPUT_COUNT END) AS REDUCE_OUTPUT_COUNT, "
				+ " SUM(CASE WHEN B.RUN_FLAG != 1 THEN 1 ELSE 0 END) FAIL_COUNT,    "
				+ " SUM(CASE WHEN B.RUN_FLAG = 1 THEN 1 ELSE 0 END) SUCCESS_COUNT    "
				+ " 	 FROM MR_JOB A, MR_JOB_RUN_LOG B     " + " 	 WHERE A.JOB_ID = B.JOB_ID      "
				+ " AND A.JOB_TYPE = ?      ";
		params.add(workId);
		// 设置权限部分的任务ID
		if (userId != 1 && lstAuthorDeal.size() > 0) {
			sql += " AND A.JOB_ID in " + SqlUtils.inParamDeal(lstAuthorDeal);
		}
		if (userId != 1 && lstAuthorDeal.size() == 0) {
			sql += " AND A.JOB_ID is null";
		}

		if (null != ruleName & !"".equals(ruleName)) {
			if (!ruleName.contains("%") && !ruleName.contains("_")) {
				sql += " AND UPPER(A.JOB_NAME ) LIKE UPPER(?) ";
				params.add("%" + ruleName + "%");
			} else {
				String ruleNameTemp = ruleName.replaceAll("_", "/_").replaceAll("%", "/%");
				sql += " AND Upper(A.JOB_NAME ) LIKE UPPER(?) ESCAPE '/' ";
				params.add("%" + ruleNameTemp + "%");
			}
		}
		sql += " AND B.end_date > TO_DATE('" +
				currentDateBegin +
				" 00:00:00', 'YYYY-MM-DD HH24:MI:SS')    " +
				" AND B.end_date < TO_DATE('" +
				endTime +
				"', 'YYYY-MM-DD HH24:MI:SS')    " +
				" 	 GROUP BY A.JOB_ID)      " +
				" UNION ALL (SELECT A.JOB_ID,      " +
				"  SUM(CASE WHEN B.MAP_INPUT_COUNT IS NULL THEN 0 ELSE B.MAP_INPUT_COUNT END) AS MAP_INPUT_COUNT,  " +
				" SUM(CASE WHEN B.MAP_OUTPUT_COUNT IS NULL THEN 0 ELSE B.MAP_OUTPUT_COUNT END) AS MAP_OUTPUT_COUNT, " +
				" SUM(CASE WHEN B.REDUCE_OUTPUT_COUNT IS NULL THEN 0 ELSE B.REDUCE_OUTPUT_COUNT END) AS REDUCE_OUTPUT_COUNT, " +
				" SUM(NVL(B.JOB_FAIL_COUNT, 0)) FAIL_COUNT,     " +
				" SUM(NVL(B.Job_Success_Count, 0)) SUCCESS_COUNT    " + " 	 FROM MR_JOB A, MR_STATISTICS_DATE B     " +
				" WHERE A.JOB_ID = B.JOB_ID      " + " AND A.JOB_TYPE = ?     ";
		params.add(workId);
		// 设置权限部分的任务ID
		if (userId != 1 && lstAuthorDeal.size() > 0) {
			sql += " AND A.JOB_ID in " + SqlUtils.inParamDeal(lstAuthorDeal);
		}
		if (userId != 1 && lstAuthorDeal.size() == 0) {
			sql += " AND A.JOB_ID is null";
		}

		if (null != ruleName & !"".equals(ruleName)) {
			if (!ruleName.contains("%") && !ruleName.contains("_")) {
				sql += " AND UPPER(A.JOB_NAME ) LIKE UPPER(?) ";
				params.add("%" + ruleName + "%");
			} else {
				String ruleNameTemp = ruleName.replaceAll("_", "/_").replaceAll("%", "/%");
				sql += " AND Upper(A.JOB_NAME ) LIKE UPPER(?) ESCAPE '/' ";
				params.add("%" + ruleNameTemp + "%");
			}
		}
		sql += " AND B.RUN_YEAR_MONTH_DAY || B.RUN_TIME BETWEEN    " + " 	 TO_CHAR(TO_DATE('" + startTime +
				"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND  " + "   TO_CHAR(TO_DATE('" + currentDateBegin +
				"', 'YYYY-MM-DD'), 'YYYYMMDD') || 00   " + " GROUP BY A.JOB_ID)) C GROUP BY C.JOB_ID)X,     " +
				" MR_JOB D,       " + " MR_DATA_SOURCE_PARAM E,       " + " META_MR_TYPE F       " +
				" WHERE X.JOB_ID = D.JOB_ID       " + " AND D.job_run_datasource = E.data_source_id      " +
				" AND D.JOB_TYPE = F.TYPE_ID      " + " AND E.PARAM_NAME = 'mr.mapred.sys.fs.default.name'     ";
		lstResult.addAll(getDataAccess().queryForList(sql, params.toArray()));
		return lstResult;
	}

	/**
	 * 任务列表
	 * 
	 * @param paramData
	 * @param lstAuthorCol
	 * @param lstAuthorDeal
	 * @return
	 */
	public List<Map<String, Object>> queryPartAnalysisList1(Map<String, Object> paramData, List<Long> lstAuthorCol,
			List<Long> lstAuthorDeal) {
		String startTime = MapUtils.getString(paramData, "START_DATE", "");
		String endTime = MapUtils.getString(paramData, "END_DATE", "");
		long workId = MapUtils.getLongValue(paramData, "WORK_ID");
		String ruleName = MapUtils.getString(paramData, "RULE_NAME");
		List<Object> params = new ArrayList<Object>();
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		long userId = MapUtils.getLongValue(formatUser, "userId", 1);
		String sql = " SELECT INNERTABLE_.*, DECODE(ROWNUM, 1, MAX(ROWNUM) OVER(), 0) TOTAL_COUNT_"
				+ " FROM ("
				+ " SELECT k.col_name,k.job_id,k.job_origin,k.job_type,k.mr,k.param_value,k.col_describe,k.type_name,k.col_datatype,SUM(input_count) AS INPUT_COUNT,SUM(output_count) AS OUTPUT_COUNT, "
				+ " CASE SUM(k.success_rate)/COUNT(1) WHEN 1 THEN '100%' WHEN 0 THEN '0.00%' ELSE to_char(SUM(k.success_rate)/COUNT(1),'FM90.00')||'%' END AS SUCCESS_RATE "
				+ " FROM ( "
				+ " SELECT M.* FROM (SELECT A.COL_NAME,a.col_id AS job_id,CASE WHEN a.col_origin=0 THEN '下载' ELSE '上传' END AS job_origin,a.col_type AS job_type,"
				+ " COUNT(d.id) AS INPUT_COUNT,"
				+ " a.col_task_number||'/'||0 AS MR,"
				+ " count(d.id) AS OUTPUT_COUNT,"
				+ " CASE SUM(CASE d.STATUS WHEN 1 THEN 1 ELSE 0 END) /( CASE WHEN COUNT(d.ID)=0 THEN 1 ELSE COUNT(d.id) END )"
				+ " WHEN 1 THEN 1 ELSE SUM(CASE d.STATUS WHEN 1 THEN 1 ELSE 0"
				+ " END) / ( CASE WHEN COUNT(d.ID)=0 THEN 1 ELSE COUNT(d.id) END ) * 100"
				+ " END AS SUCCESS_RATE,e.param_value,a.col_describe,M.TYPE_NAME,A.COL_DATATYPE FROM MR_FTP_COL_JOB A"
				+ " LEFT JOIN MR_FTP_COL_DETAIL_FILELOG d" + " ON A.COL_ID = d.COL_ID"
				+ " LEFT JOIN MR_DATA_SOURCE_PARAM e" + " ON a.col_run_datasource = e.data_source_id"
				+ " LEFT JOIN META_MR_TYPE M" + " ON M.TYPE_ID = A.COL_TYPE"
				+ " AND e.PARAM_NAME = 'mr.mapred.sys.fs.default.name' " + " WHERE a.col_type = ?";
		if (userId != 1 && lstAuthorCol.size() > 0) {
			sql += " AND a.col_id in " + SqlUtils.inParamDeal(lstAuthorCol);
		}
		if (userId != 1 && lstAuthorCol.size() == 0) {
			sql += " AND a.COL_ID is null";
		}
		params.add(workId);
		if (startTime != null && startTime.length() > 0) {
			sql += " AND to_date(d.end_time,'YYYY-MM-DD HH24:MI:SS')>TO_DATE('" + startTime +
					"','YYYY-MM-DD HH24:MI:SS') ";
		}
		if (endTime != null && endTime.length() > 0) {
			sql += " AND TO_DATE(D.END_TIME,'YYYY-MM-DD HH24:MI:SS')<TO_DATE('" + endTime +
					"','YYYY-MM-DD HH24:MI:SS') ";
		}

		if (null != ruleName & !"".equals(ruleName)) {
			if (!ruleName.contains("%") && !ruleName.contains("_")) {
				sql += " AND UPPER(A.COL_NAME ) LIKE UPPER(?) ";
				params.add("%" + ruleName + "%");
			} else {
				String ruleNameTemp = ruleName.replaceAll("_", "/_").replaceAll("%", "/%");
				// ruleName = ruleName.replaceAll("_", "/_").replaceAll("%",
				// "/%");
				sql += " AND Upper(A.COL_NAME ) LIKE UPPER(?) ESCAPE '/' ";
				params.add("%" + ruleNameTemp + "%");
			}
		}

		sql += " GROUP BY A.COL_NAME,a.col_task_number,a.col_origin,a.col_id,a.col_type,e.param_value,a.col_describe,M.TYPE_NAME,A.COL_DATATYPE,d.col_log_id "
				+ " UNION ALL"
				+ " SELECT b.job_name AS col_name,b.job_id,'处理' AS job_origin,b.job_type,"
				+ " sum(CASE WHEN (CASE WHEN c.map_input_count IS NULL THEN 0 ELSE c.map_input_count END)=0 THEN (CASE WHEN c.reduce_input_count IS NULL THEN 0 ELSE c.reduce_input_count END) ELSE map_input_count END ) AS INPUT_COUNT,"
				+ " b.map_tasks||'/'||b.reduce_tasks AS MR,"
				+ " sum(CASE WHEN (CASE WHEN c.reduce_output_count IS NULL THEN 0 ELSE c.reduce_output_count END)=0 THEN (CASE WHEN c.map_output_count IS NULL THEN 0 ELSE c.map_output_count END) ELSE c.reduce_output_count END ) AS output_count,"
				+ " CASE SUM(CASE c.run_flag WHEN 1 THEN 1 ELSE 0 END) / (CASE WHEN COUNT(c.log_id)=0 THEN 1 ELSE COUNT(c.log_id) END)"
				+ " WHEN 1 THEN 1 ELSE SUM(CASE c.run_flag"
				+ " WHEN 1 THEN 1 ELSE 0 END) /(CASE WHEN COUNT(c.log_id)=0 THEN 1 ELSE COUNT(c.log_id) END) * 100"
				+ " END AS SUCCESS_RATE,"
				+ " f.param_value,b.job_describe AS col_describe,N.TYPE_NAME,-1 AS COL_DATATYPE"
				+ " FROM mr_job b"
				+ " LEFT JOIN mr_job_run_log c"
				+ " ON b.job_id = c.job_id"
				+ " LEFT JOIN MR_DATA_SOURCE_PARAM f"
				+ "	ON b.job_run_datasource = f.data_source_id"
				+ " LEFT JOIN META_MR_TYPE N "
				+ " ON N.TYPE_ID = B.JOB_TYPE "
				+ "	AND f.PARAM_NAME = 'mr.mapred.sys.fs.default.name'"
				+ " WHERE b.job_type = ?";
		if (userId != 1 && lstAuthorDeal.size() > 0) {
			sql += " AND B.JOB_ID IN " + SqlUtils.inParamDeal(lstAuthorDeal);
		}
		if (userId != 1 && lstAuthorDeal.size() == 0) {
			sql += " AND B.JOB_ID IS NULL ";
		}
		params.add(workId);
		if (startTime != null && startTime.length() > 0) {
			sql += " AND c.end_date > TO_DATE('" + startTime + "','YYYY-MM-DD HH24:MI:SS') ";
		}
		if (endTime != null && endTime.length() > 0) {
			sql += " AND c.end_date < TO_DATE('" + endTime + "','YYYY-MM-DD HH24:MI:SS') ";
		}
		if (null != ruleName & !"".equals(ruleName)) {
			if (!ruleName.contains("%") && !ruleName.contains("_")) {
				sql += " AND UPPER( B.JOB_NAME ) LIKE UPPER(?) ";
				params.add("%" + ruleName + "%");
			} else {
				String ruleNameTemp = ruleName.replaceAll("_", "/_").replaceAll("%", "/%");
				// ruleName = ruleName.replaceAll("_", "/_").replaceAll("%",
				// "/%");
				sql += " AND Upper( B.JOB_NAME ) LIKE UPPER(?) ESCAPE '/' ";
				params.add("%" + ruleNameTemp + "%");
			}
		}

		sql += " GROUP BY b.job_name,b.job_id,b.job_type,b.map_tasks||'/'||b.reduce_tasks,f.param_value,b.job_describe,N.TYPE_NAME,c.log_id )m where m.type_name is not null ";
		sql += ")k GROUP BY k.col_name,k.job_id,k.job_origin,k.job_type,k.mr,k.param_value,k.col_describe,k.type_name,k.col_datatype ";
		sql += ")INNERTABLE_";

		return getDataAccess().queryForList(sql, params.toArray());
	}

	/**
	 * 查询任务的成功失败数
	 * 
	 * @param paramData
	 * @return
	 */
	public List<Map<String, Object>> querAnalysisPartInfo(Map<String, Object> paramData) {
		long col_id = MapUtils.getLongValue(paramData, "COL_DEAL_ID", -1);
		long col_type = MapUtils.getLongValue(paramData, "COL_DEAL_TYPE", -1);// 0为采集，1为处理
		String startTime = MapUtils.getString(paramData, "START_DATE", "");
		String endTime = MapUtils.getString(paramData, "END_DATE", "");

		// 获取结束时间的毫秒
		long end = StringUtil.stringToLong(endTime, StringUtil.DATE_FORMAT_TYPE1, -1);
		long currentData = StringUtil.dateToLong(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		String currentDateBegin = StringUtil.dateToString(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		String sql = "";
		if (col_type == 0) {
			if (currentData > end) {// 获取历史数据
				sql = "select S.COL_NAME AS COL_NAME, SUCCESS, FAIL, SHOW_DATE" + " from (select M.COL_ID," +
						" SUM(NVL(M.COL_SUCCESS_COUNT, 0)) AS SUCCESS," + " SUM(NVL(M.Col_Fail_Count, 0)) AS FAIL," +
						" TO_CHAR(TO_DATE(M.RUN_YEAR_MONTH_DAY, 'YYYYMMDDHH'), 'YYYY-MM-DD') AS SHOW_DATE" +
						" from MR_FTP_COL_STATISTICS_DATE M" + " WHERE M.COL_ID = ?" +
						" AND M.RUN_YEAR_MONTH_DAY || M.RUN_TIME BETWEEN" + " TO_CHAR(TO_DATE('" + startTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + " TO_CHAR(TO_DATE('" + endTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" +
						" GROUP BY M.RUN_YEAR_MONTH_DAY, M.COL_ID) N," + " MR_FTP_COL_JOB S" +
						" WHERE N.COL_ID = S.COL_ID";
				return getDataAccess().queryForList(sql, col_id);
			} else {// 历史数据和当前数据
				sql = "select S.COL_NAME AS COL_NAME, SUCCESS, FAIL, SHOW_DATE" + " from ((SELECT A.Col_Id, "
						+ "  SUM(CASE A.STATUS WHEN 1 THEN 1 ELSE 0 END) SUCCESS,"
						+ "  SUM(CASE A.STATUS WHEN 1 THEN 0 ELSE 1 END) FAIL,"
						+ "  TO_CHAR(TO_DATE(END_TIME, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD') AS SHOW_DATE"
						+ " FROM MR_FTP_COL_FILE_LOG A" + " LEFT JOIN MR_FTP_COL_JOB B" + " ON A.COL_ID = B.COL_ID"
						+ " WHERE A.COL_ID = ?" + " AND TO_DATE(END_TIME, 'YYYY-MM-DD HH24:MI:SS') > TO_DATE('" +
						currentDateBegin +
						" 00:00:00', 'YYYY-MM-DD HH24:MI:SS')" +
						" AND TO_DATE(END_TIME, 'YYYY-MM-DD HH24:MI:SS') < TO_DATE('" +
						endTime +
						"', 'YYYY-MM-DD HH24:MI:SS')" +
						" GROUP BY TO_CHAR(TO_DATE(END_TIME, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD'), A.Col_Id)" +
						"union all" +
						" (select M.COL_ID," +
						" SUM(NVL(M.COL_SUCCESS_COUNT, 0)) AS SUCCESS," +
						" SUM(NVL(M.Col_Fail_Count, 0)) AS FAIL," +
						" TO_CHAR(TO_DATE(M.RUN_YEAR_MONTH_DAY, 'YYYYMMDDHH'), 'YYYY-MM-DD') AS SHOW_DATE" +
						" from MR_FTP_COL_STATISTICS_DATE M" +
						" WHERE M.COL_ID = ?" +
						" AND M.RUN_YEAR_MONTH_DAY || M.RUN_TIME BETWEEN" +
						" TO_CHAR(TO_DATE('" +
						startTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" +
						" TO_CHAR(TO_DATE('" +
						currentDateBegin +
						" 00:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" +
						" GROUP BY M.RUN_YEAR_MONTH_DAY, M.COL_ID)) N," +
						" MR_FTP_COL_JOB S" +
						" WHERE N.COL_ID = S.COL_ID";
				return getDataAccess().queryForList(sql, col_id, col_id);
			}
		} else {
			if (currentData > end) {// 获取历史数据
				sql = " select S.JOB_NAME AS COL_NAME, SUCCESS, FAIL, SHOW_DATE" + " from (SELECT T.JOB_ID," +
						" SUM(NVL(T.Job_Success_Count, 0)) AS SUCCESS," + " SUM(NVL(T.JOB_FAIL_COUNT, 0)) AS FAIL," +
						" TO_CHAR(TO_DATE(T.RUN_YEAR_MONTH_DAY, 'YYYYMMDDHH'), 'YYYY-MM-DD') AS SHOW_DATE" +
						" FROM MR_STATISTICS_DATE T" + " WHERE T.JOB_ID = ?" +
						" AND T.RUN_YEAR_MONTH_DAY || T.RUN_TIME BETWEEN" + " TO_CHAR(TO_DATE('" + startTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" + " TO_CHAR(TO_DATE('" + endTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" +
						" GROUP BY T.RUN_YEAR_MONTH_DAY, T.JOB_ID) N," + " MR_JOB S" + " WHERE N.JOB_ID = S.JOB_ID";
				return getDataAccess().queryForList(sql, col_id);
			} else {// 历史数据和当前数据
				sql = "select S.JOB_NAME AS COL_NAME, SUCCESS,FAIL,SHOW_DATE from (" + " (SELECT M.JOB_ID AS JOB_ID,"
						+ " SUM(CASE T.RUN_FLAG WHEN 1 THEN 1 ELSE 0 END) SUCCESS,"
						+ " SUM(CASE T.RUN_FLAG WHEN 1 THEN 0 ELSE 1 END) FAIL,"
						+ " TO_CHAR(START_DATE, 'YYYY-MM-DD') AS SHOW_DATE" + " FROM MR_JOB_RUN_LOG T"
						+ " LEFT JOIN MR_JOB M" + " ON M.JOB_ID = T.JOB_ID" + " WHERE T.JOB_ID = ?"
						+ " AND T.END_DATE > TO_DATE('" +
						currentDateBegin +
						" 00:00:00', 'YYYY-MM-DD HH24:MI:SS')" +
						" AND T.END_DATE < TO_DATE('" +
						endTime +
						"', 'YYYY-MM-DD HH24:MI:SS')" +
						" GROUP BY TO_CHAR(START_DATE, 'YYYY-MM-DD'), M.JOB_ID)" +
						"union all" +
						" (SELECT T.JOB_ID, " +
						" SUM(NVL(T.Job_Success_Count, 0)) AS SUCCESS," +
						" SUM(NVL(T.JOB_FAIL_COUNT, 0)) AS FAIL," +
						" TO_CHAR(TO_DATE(T.RUN_YEAR_MONTH_DAY, 'YYYYMMDDHH'), 'YYYY-MM-DD') AS SHOW_DATE" +
						" FROM MR_STATISTICS_DATE T" +
						" WHERE T.JOB_ID = ?" +
						" AND T.RUN_YEAR_MONTH_DAY || T.RUN_TIME BETWEEN" +
						" TO_CHAR(TO_DATE('" +
						startTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" +
						" TO_CHAR(TO_DATE('" +
						currentDateBegin +
						" 00:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" +
						" GROUP BY T.RUN_YEAR_MONTH_DAY, T.JOB_ID)" + ")N," + "MR_JOB S WHERE N.JOB_ID = S.JOB_ID";
				return getDataAccess().queryForList(sql, col_id, col_id);
			}
		}
	}

	// public Map<String, Object> queryAnalysisBaseInfo(
	// Map<String, Object> paramData) {
	// //long col_id = MapUtils.getLongValue(paramData, "COL_ID");
	// long col_id = 1980;
	// String sql =
	// "SELECT B.PARAM_VALUE,A.COL_ORIGIN,COUNT(C.COL_ID) MAP_COUNT,0 AS REDUCE_COUNT "
	// +" FROM MR_FTP_COL_JOB A INNER JOIN MR_DATA_SOURCE_PARAM B"
	// +" ON A.COL_RUN_DATASOURCE = B.DATA_SOURCE_ID"
	// +" INNER JOIN MR_FTP_COL_REMOTE_FILE_LOG_MSG C ON A.COL_ID = C.COL_ID"
	// +" WHERE A.COL_ID = ? "
	// +" AND B.PARAM_NAME = 'mr.mapred.sys.fs.default.name' AND " +
	// " C.COL_LOG_ID=(SELECT MAX(COL_LOG_ID) FROM MR_FTP_COL_REMOTE_FILE_LOG_MSG WHERE COL_ID = ?) GROUP BY B.PARAM_VALUE,A.COL_ORIGIN";
	// return getDataAccess().queryForMap(sql, col_id,col_id);
	// }

	// /**
	// * 处理
	// * @param paramData
	// * @return
	// */
	// public List<Map<String, Object>> queryPartMissionZoneDeal(
	// Map<String, Object> paramData) {
	// //long col_id = MapUtils.getLongValue(paramData, "COL_ID");
	// long col_id = MapUtils.getLongValue(paramData, "COL_DEAL_ID",-1);
	// long col_deal_type = MapUtils.getLongValue(paramData,
	// "COL_DEAL_TYPE",-1);//0为采集，1为处理
	// String startTime = MapUtils.getString(paramData, "START_DATE","");
	// String endTime = MapUtils.getString(paramData, "END_DATE","");
	// String sql = "";
	// int day = MapUtils.getIntValue(paramData, "DEAL_DAY",2);
	// // int day = MapUtils.getIntValue(paramData, "DEAL_DAY");
	// if(col_deal_type==0){
	// sql
	// ="SELECT to_char(TO_DATE(END_TIME,'YYYY-MM-DD HH24:MI:SS'),'yyyy-mm-dd') AS t_time,"
	// +
	// "TO_CHAR(TO_DATE(END_TIME,'YYYY-MM-DD HH24:MI:SS'),'HH24') AS t_hour," +
	// "SUM(file_totalsize) AS total FROM MR_FTP_COL_FILE_LOG " +
	// "WHERE to_date(end_time,'YYYY-MM-DD HH24:MI:SS') < TO_DATE(to_char(SYSDATE-?,'YYYY-MM-DD')||' 00:00:00' ,'YYYY-MM-DD HH24:MI:SS') AND "
	// +
	// "to_date(end_time,'YYYY-MM-DD HH24:MI:SS') > TO_DATE(to_char(SYSDATE-?,'YYYY-MM-DD')||' 00:00:00' ,'YYYY-MM-DD HH24:MI:SS') "
	// +
	// "AND COL_ID = ? ";
	// if(startTime!=null&&startTime.length()>0){
	// sql +=
	// " AND to_date(end_time,'YYYY-MM-DD HH24:MI:SS')>TO_DATE('"+startTime+"','YYYY-MM-DD HH24:MI:SS') ";
	// }
	// if(endTime!=null&&endTime.length()>0){
	// sql +=
	// " AND TO_DATE(END_TIME,'YYYY-MM-DD HH24:MI:SS')<TO_DATE('"+endTime+"','YYYY-MM-DD HH24:MI:SS') ";
	// }
	// sql +=
	// "GROUP BY TO_CHAR(TO_DATE(END_TIME,'YYYY-MM-DD HH24:MI:SS'),'HH24'),to_char(TO_DATE(END_TIME,'YYYY-MM-DD HH24:MI:SS'),'yyyy-mm-dd')";
	// }else if(col_deal_type==1){
	// sql = "SELECT TO_CHAR(start_date, 'yyyy-mm-dd') AS T_TIME," +
	// " TO_CHAR(start_date, 'HH24') AS T_HOUR, " +
	// " SUM(end_date-start_date) * 24 * 60 * 60 AS t_TOTAL," +
	// " CASE WHEN SUM(map_input_count) IS NULL THEN 0 ELSE SUM(map_input_count) END AS total "
	// +
	// " FROM mr_job_run_log WHERE job_id = ?";
	// if(startTime!=null&&startTime.length()>0){
	// sql += " AND end_date>TO_DATE('"+startTime+"','YYYY-MM-DD HH24:MI:SS') ";
	// }
	// if(endTime!=null&&endTime.length()>0){
	// sql += " AND end_date<TO_DATE('"+endTime+"','YYYY-MM-DD HH24:MI:SS') ";
	// }
	// sql +=
	// " AND end_date < TO_DATE(to_char(SYSDATE-?,'YYYY-MM-DD')||' 23:59:59' ,'YYYY-MM-DD HH24:MI:SS')"
	// +
	// " AND end_date > TO_DATE(to_char(SYSDATE-?,'YYYY-MM-DD')||' 00:00:00' ,'YYYY-MM-DD HH24:MI:SS')"
	// +
	// " GROUP BY TO_CHAR(start_date, 'yyyy-mm-dd'),TO_CHAR(start_date, 'HH24')";
	// }
	//
	//
	// return getDataAccess().queryForList(sql,123+day,123+day, col_id);
	// }

	/**
	 * 最近一天处理数据量与耗时分布图
	 * 
	 * @param paramData
	 * @return
	 */
	public List<Map<String, Object>> queryPartMissionZoneTime(Map<String, Object> paramData) {
		long col_id = MapUtils.getLongValue(paramData, "COL_DEAL_ID", -1);
		long col_Type = MapUtils.getLongValue(paramData, "COL_DEAL_TYPE", -1);// 0为采集，1为处理
		String startTime = MapUtils.getString(paramData, "START_DATE", "");
		String endTime = MapUtils.getString(paramData, "END_DATE", "");
		int dealDay = (MapUtils.getIntValue(paramData, "DEAL_DAY", 0) - 1);
		if (dealDay > 0) {// 减去的天数
			endTime = stringDateAddCut(endTime, -dealDay, StringUtil.DATE_FORMAT_TYPE1);
		}

		// 获取结束时间的毫秒
		long end = StringUtil.stringToLong(endTime, StringUtil.DATE_FORMAT_TYPE1, -1);
		long currentData = StringUtil.dateToLong(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		String endTimeYYYYMMDD = "";
		try {
			endTimeYYYYMMDD = StringUtil.dateToString(StringUtil.stringToDate(endTime, StringUtil.DATE_FORMAT_TYPE4),
					StringUtil.DATE_FORMAT_TYPE4);
		} catch (ParseException e) {
			e.printStackTrace();
		}

		String sql = "";
		if (col_Type == 0) {
			if (currentData > end) {// 获取历史数据
				sql = "SELECT '" +
						endTimeYYYYMMDD +
						"' T_TIME," +
						" T.RUN_TIME|| '点' T_HOUR," +
						" (CASE WHEN SUM(T.Col_Avg_Run_Time) IS NULL THEN 0 ELSE sum(T.Col_Avg_Run_Time) END)/COUNT(1) AS T_TOTAL," +
						" (CASE WHEN SUM(T.COL_FILESIZE) IS NULL THEN 0 ELSE SUM(T.COL_FILESIZE) END) AS TOTAL" +
						" FROM MR_FTP_COL_STATISTICS_DATE T" + " WHERE T.COL_ID = ?" +
						" AND T.RUN_YEAR_MONTH_DAY || T.RUN_TIME BETWEEN" + " TO_CHAR(TO_DATE('" + endTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDD')||00 AND" + " TO_CHAR(TO_DATE('" + endTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" + " GROUP BY T.RUN_TIME";
				return getDataAccess().queryForList(sql, col_id);
			} else {// 当前数据
				sql = "select '" +
						endTimeYYYYMMDD +
						"' T_TIME," +
						" TO_CHAR(TO_DATE(a.START_TIME, 'YYYY-MM-DD HH24:MI:SS'), 'HH24') || '点' AS T_HOUR," +
						" (CASE" +
						" WHEN SUM(TO_DATE(a.END_TIME, 'YYYY-MM-DD HH24:MI:SS') - TO_DATE(a.START_TIME, 'YYYY-MM-DD HH24:MI:SS')) * 24 * 60 * 60 IS NULL THEN" +
						" 0" +
						" ELSE" +
						" SUM(TO_DATE(a.END_TIME, 'YYYY-MM-DD HH24:MI:SS') - TO_DATE(a.START_TIME, 'YYYY-MM-DD HH24:MI:SS')) * 24 * 60 * 60" +
						" END) / count(1) AS T_TOTAL," + " sum(a.file_totalsize) AS TOTAL" +
						" FROM MR_FTP_COL_FILE_LOG a" + " WHERE a.COL_ID = ?" + " and a.status = 1" +
						" and to_date(a.start_time, 'YYYY-MM-DD HH24:MI:SS') > TO_DATE('" + endTimeYYYYMMDD +
						" 00:00:00', 'YYYY-MM-DD HH24:MI:SS')" +
						" AND TO_DATE(a.start_time, 'YYYY-MM-DD HH24:MI:SS') < TO_DATE('" + endTime +
						"', 'YYYY-MM-DD HH24:MI:SS')" +
						" GROUP BY TO_CHAR(TO_DATE(a.start_time, 'YYYY-MM-DD HH24:MI:SS'), 'HH24')";
				return getDataAccess().queryForList(sql, col_id);
			}
		} else {
			if (currentData > end) {// 获取历史数据
				sql = "SELECT '" + endTimeYYYYMMDD + "' T_TIME," + " T.RUN_TIME|| '点' T_HOUR," +
						" SUM(NVL(NVL(T.REDUCE_OUTPUT_COUNT, NVL(T.MAP_OUTPUT_COUNT, 0)),0)) AS total," +
						" SUM(NVL(T.JOB_AVG_RUN_TIME, 0))/count(1) t_TOTAL" + " FROM MR_STATISTICS_DATE T" +
						" WHERE T.JOB_ID = ?" + " AND T.RUN_YEAR_MONTH_DAY || T.RUN_TIME BETWEEN" +
						" TO_CHAR(TO_DATE('" + endTime + "', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDD')||'00' AND" +
						" TO_CHAR(TO_DATE('" + endTime + "', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" +
						" GROUP BY T.RUN_TIME";
				return getDataAccess().queryForList(sql, col_id);
			} else {// 当前数据
				sql = "SELECT '" +
						endTimeYYYYMMDD +
						"' AS T_TIME," +
						" TO_CHAR(C.START_DATE, 'HH24')|| '点' AS T_HOUR," +
						" SUM(NVL(NVL(C.REDUCE_OUTPUT_COUNT, NVL(C.MAP_OUTPUT_COUNT, 0)),0)) AS TOTAL, " +
						" (CASE WHEN SUM(end_date-start_date) * 24 * 60 * 60 IS NULL THEN 0 ELSE SUM(end_date-start_date) * 24 * 60 * 60 END)/count(1) AS t_TOTAL" +
						" FROM MR_JOB_RUN_LOG C" + " WHERE C.RUN_FLAG = 1" + " AND C.JOB_ID = ?" +
						" AND start_date > TO_DATE(to_char((to_date('" + endTime +
						"', 'YYYY-MM-DD hh24:mi:ss')), 'YYYY-MM-DD') || ' 00:00:00', 'YYYY-MM-DD HH24:MI:SS')" +
						" AND start_date < TO_DATE(to_char((to_date('" + endTime +
						"', 'YYYY-MM-DD hh24:mi:ss')), 'YYYY-MM-DD hh24:mi') || ':00', 'YYYY-MM-DD HH24:MI:SS')" +
						" GROUP BY TO_CHAR(C.START_DATE, 'HH24')";
				return getDataAccess().queryForList(sql, col_id);
			}
		}
	}

	/**
	 * 日期天数的加减
	 * 
	 * @param endTime
	 * @param dealDay
	 *            正整数表示加，负整数表示减
	 * @param type
	 * @return
	 */
	private String stringDateAddCut(String endTime, int dealDay, String type) {
		SimpleDateFormat df = new SimpleDateFormat(type);
		Date d = null;
		try {
			d = df.parse(endTime);
			Calendar cal = Calendar.getInstance();
			cal.setTime(d);
			cal.add(Calendar.DATE, dealDay); // 减1天
			return df.format(cal.getTime());
		} catch (ParseException e) {
			e.printStackTrace();
			return "";
		}
	}

	public List<Map<String, Object>> queryColData(Map<String, Object> paramData) {
		long col_id = MapUtils.getLongValue(paramData, "COL_DEAL_ID", -1);
		long col_type = MapUtils.getLongValue(paramData, "COL_DEAL_TYPE", -1);// 0为采集，1为处理
		String startTime = MapUtils.getString(paramData, "START_DATE", "");
		String endTime = MapUtils.getString(paramData, "END_DATE", "");
		String sql = "";
		if (col_type == 0) {
			sql = "SELECT INNERTABLE_.*,DECODE(ROWNUM, 1, MAX(ROWNUM) OVER(), 0) TOTAL_COUNT_ FROM ( ";
			sql += "SELECT T.START_TIME,T.END_TIME,T.FILE_NUM,T.FILE_TOTALSIZE,T.STATUS,T.COL_LOG_ID,T.COL_ID,M.COL_NAME FROM MR_FTP_COL_FILE_LOG T "
					+ " LEFT JOIN MR_FTP_COL_JOB M ON M.COL_ID=T.COL_ID WHERE T.COL_ID = ? ";
			if (startTime != null && startTime.length() > 0) {
				sql += " AND to_date(T.end_time,'YYYY-MM-DD HH24:MI:SS')>TO_DATE('" + startTime +
						"','YYYY-MM-DD HH24:MI:SS') ";
			}
			if (endTime != null && endTime.length() > 0) {
				sql += " AND TO_DATE(T.END_TIME,'YYYY-MM-DD HH24:MI:SS')<TO_DATE('" + endTime +
						"','YYYY-MM-DD HH24:MI:SS') ";
			}
			sql += " ORDER BY T.COL_LOG_ID desc) INNERTABLE_";
		} else {
			sql = "SELECT INNERTABLE_.*,DECODE(ROWNUM, 1, MAX(ROWNUM) OVER(), 0) TOTAL_COUNT_ FROM ( ";
			sql += "SELECT T.LOG_ID AS COL_ID,TO_CHAR(T.START_DATE,'YYYY-MM-DD HH24:MI:SS') AS START_DATE,"
					+ "TO_CHAR(T.END_DATE,'YYYY-MM-DD HH24:MI:SS') AS END_DATE,T.RUN_FLAG,T.ALL_FILE_SIZE,"
					+ "(CASE WHEN T.MAP_OUTPUT_COUNT IS NULL THEN 0 ELSE T.MAP_OUTPUT_COUNT END) AS MAP_OUTPUT_COUNT,"
					+ "(CASE WHEN T.MAP_INPUT_COUNT IS NULL THEN 0 ELSE T.MAP_INPUT_COUNT END) AS MAP_INPUT_COUNT,"
					+ "(CASE WHEN T.REDUCE_INPUT_COUNT IS NULL THEN 0 ELSE T.REDUCE_INPUT_COUNT END) AS REDUCE_INPUT_COUNT,"
					+ "(CASE WHEN T.REDUCE_OUTPUT_COUNT IS NULL THEN 0 ELSE T.REDUCE_OUTPUT_COUNT END) AS REDUCE_OUTPUT_COUNT, "
					+ " M.JOB_NAME FROM MR_JOB_RUN_LOG T LEFT JOIN MR_JOB M ON M.JOB_ID = T.JOB_ID WHERE T.JOB_ID = ? ";
			if (startTime != null && startTime.length() > 0) {
				sql += " AND T.end_DATE>TO_DATE('" + startTime + "','YYYY-MM-DD HH24:MI:SS') ";
			}
			if (endTime != null && endTime.length() > 0) {
				sql += " AND T.END_DATE <TO_DATE('" + endTime + "','YYYY-MM-DD HH24:MI:SS') ";
			}
			sql += " ORDER BY t.log_id desc) INNERTABLE_";
		}

		return getDataAccess().queryForList(sql, col_id);
	}

	/**
	 * 查看采集日志详情
	 * 
	 * @param paramData
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryColMsgLog(Map<String, Object> paramData, Page page) {
		long logId = MapUtils.getLongValue(paramData, "LOG_ID", -1);

		String sql = "SELECT A.ID,A.START_TIME,A.END_TIME,A.INPUT_FILE_NAME,A.OUTPUT_FILE_NAME,"
				+ "A.INPUT_PATH,A.OUTPUT_PATH,A.FILE_SIZE,A.STATUS,A.IS_OUTPUT_RENAME,"
				+ "A.OUTPUT_RENAME_STATUS,A.MOVE_OUTPUT_PATH,"
				+ "A.MOVE_INPUT_STATUS,A.IS_DOINPUTFILETYPE,A.DELETE_INPUT_STATUS,"
				+ "A.MOVE_INPUT_PATH,A.COL_LOG_ID,A.INPUT_RENAME_STATUS,"
				+ "A.INPUT_RENAME,A.OUTPUT_RENAME FROM MR_FTP_COL_DETAIL_FILELOG A WHERE A.COL_LOG_ID =? ";

		sql += " ORDER BY A.START_TIME DESC ";
		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryForList(sql, logId);
	}

	/**
	 * 查看失败列表
	 * 
	 * @param paramData
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryColFailList(Map<String, Object> paramData, Page page) {
		String failTime = MapUtils.getString(paramData, "FAIL_TIME");
		String startDate = MapUtils.getString(paramData, "START_DATE");
		String endDate = MapUtils.getString(paramData, "END_DATE");

		String sql = " select * from (SELECT 1 AS FLAG,T.LOG_ID,to_char(T.START_DATE,'YYYY-MM-DD HH24:MI:SS') AS START_DATE ,TO_CHAR(T.END_DATE,'YYYY-MM-DD HH24:MI:SS') AS END_DATE,"
				+ "	T.RUN_FLAG,T.LOG_MSG,B.JOB_NAME FROM MR_JOB_RUN_LOG T LEFT JOIN MR_JOB B ON T.JOB_ID = B.JOB_ID "
				+ " WHERE T.RUN_FLAG = 2 ";
		if (failTime != null && failTime.length() > 0) {
			sql += " AND TO_CHAR(T.START_DATE,'HH24')= '" + failTime + "'";
		}
		if (startDate != null && startDate.length() > 0) {
			sql += " AND T.START_DATE > TO_DATE('" + startDate + "','YYYY-MM-DD HH24:MI:SS')";
		}
		if (endDate != null && endDate.length() > 0) {
			sql += " AND T.START_DATE < TO_DATE('" + endDate + "','YYYY-MM-DD HH24:MI:SS')";
		}
		sql += " UNION ALL SELECT 0 AS FLAG, C.COL_LOG_ID AS LOG_ID," + " C.START_TIME AS START_DATE,"
				+ " C.END_TIME AS END_DATE," + " C.STATUS AS RUN_FLAG," + " 'FAIL' AS LOG_MSG,"
				+ " D.COL_NAME AS JOB_NAME"
				+ " FROM MR_FTP_COL_FILE_LOG C LEFT JOIN MR_FTP_COL_JOB D ON C.COL_ID = D.COL_ID"
				+ " WHERE C.STATUS=2 ";
		if (failTime != null && failTime.length() > 0) {
			sql += " AND TO_CHAR(TO_DATE(C.START_TIME,'YYYY-MM-DD HH24:MI:SS'),'HH24')='" + failTime + "'";
		}
		if (startDate != null && startDate.length() > 0) {
			sql += " AND TO_DATE(C.START_TIME,'yyyy-mm-dd hh24:mi:ss') > TO_DATE('" + startDate +
					"','YYYY-MM-DD HH24:MI:SS')";
		}
		if (endDate != null && endDate.length() > 0) {
			sql += " AND TO_DATE(C.START_TIME,'yyyy-mm-dd hh24:mi:ss') < TO_DATE('" + endDate +
					"','YYYY-MM-DD HH24:MI:SS'))M ORDER BY M.START_DATE";
		}

		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 查询该用户下的采集任务ID的集合
	 * 
	 * @return
	 */
	public List<Map<String, Object>> queryAuthorColList(List<Integer> lstAuthorCol) {
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		long userId = MapUtils.getLongValue(formatUser, "userId", 1);
		if (userId == 1)
			return null;
		String sql = "";
		if (lstAuthorCol.contains(5001) && lstAuthorCol.contains(6001)) {
			sql = "SELECT COL_ID FROM MR_FTP_COL_JOB";
		} else if (lstAuthorCol.contains(5001)) {
			sql = "SELECT DISTINCT * FROM (SELECT task_id AS col_id FROM meta_mr_user_author WHERE " +
					" view_action = 1 AND task_type = 1 AND status = 1 AND user_id = " + userId;
			sql += " UNION SELECT col_id FROM MR_FTP_COL_JOB a WHERE a.col_origin =0)";
		} else if (lstAuthorCol.contains(6001)) {
			sql = "SELECT DISTINCT * FROM (SELECT task_id AS col_id FROM meta_mr_user_author WHERE " +
					" view_action = 1 AND task_type = 1 AND status = 1 AND user_id = " + userId;
			sql += " UNION SELECT col_id FROM MR_FTP_COL_JOB a WHERE a.col_origin =1)";
		} else {
			sql += " SELECT task_id AS col_id FROM meta_mr_user_author WHERE view_action = 1 AND task_type = 1 AND status = 1 AND user_id = " +
					userId;
		}

		return getDataAccess().queryForList(sql);
	}

	/**
	 * 查询该用户下的处理任务ID的集合
	 * 
	 * @return
	 */
	public List<Map<String, Object>> queryAuthorDealList(List<Integer> lstAuthorCol) {
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		long userId = MapUtils.getLongValue(formatUser, "userId", 1);
		if (userId == 1)
			return null;
		String sql = "";
		if (lstAuthorCol.contains(7001)) {
			sql = "SELECT DISTINCT * FROM (SELECT task_id AS job_id FROM meta_mr_user_author WHERE " +
					" view_action = 1 AND task_type = 2 AND status = 1 AND user_id = " + userId;
			sql += " UNION SELECT JOB_ID FROM MR_JOB )";
		} else {
			sql += " SELECT TASK_ID AS JOB_ID FROM META_MR_USER_AUTHOR WHERE VIEW_ACTION = 1 AND TASK_TYPE = 2 AND STATUS = 1 AND USER_ID = " +
					userId;
		}

		return getDataAccess().queryForList(sql);
	}

	/**
	 * 查询该用户是采集中的下载还是上传
	 * 
	 * @return
	 */
	public List<Map<String, Object>> getColFlag() {
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		long userId = MapUtils.getLongValue(formatUser, "userId", 1);
		String sql = "SELECT ACTION_TYPE FROM META_MR_USER_ADDACTION WHERE USER_ID = ?";

		return getDataAccess().queryForList(sql, userId);
	}

	/**
	 * 入库量统计(按天统计)
	 * 
	 * @param paramData
	 * @return
	 */
	public List<Map<String, Object>> querAnalysisWarehousePartInfo(Map<String, Object> paramData) {
		long col_id = MapUtils.getLongValue(paramData, "COL_DEAL_ID", -1);
		long col_type = MapUtils.getLongValue(paramData, "COL_DEAL_TYPE", -1);// 0为采集，1为处理
		String startTime = MapUtils.getString(paramData, "START_DATE", "");
		String endTime = MapUtils.getString(paramData, "END_DATE", "");

		// 获取结束时间的毫秒
		long end = StringUtil.stringToLong(endTime, StringUtil.DATE_FORMAT_TYPE1, -1);
		long currentData = StringUtil.dateToLong(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		String currentDateBegin = StringUtil.dateToString(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		String sql = "";
		if (col_type == 0) {
			if (currentData > end) {// 获取历史数据
				sql = "	SELECT TO_CHAR(TO_DATE(T.RUN_YEAR_MONTH_DAY, 'YYYYMMDDHH'),'YYYY-MM-DD') AS T_HOUR," +
						" (CASE WHEN SUM(T.COL_FILESIZE) IS NULL THEN 0 ELSE SUM(T.COL_FILESIZE) END) AS TOTAL" +
						" FROM MR_FTP_COL_STATISTICS_DATE T  WHERE T.COL_ID = ?" +
						" AND T.RUN_YEAR_MONTH_DAY || T.RUN_TIME BETWEEN" + " TO_CHAR(TO_DATE('" + startTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" + " AND" + " TO_CHAR(TO_DATE('" + endTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" + " GROUP BY T.RUN_YEAR_MONTH_DAY";
				return getDataAccess().queryForList(sql, col_id);
			} else {// 历史数据和当前数据
				sql = "	select T_HOUR, (CASE WHEN SUM(TOTAL) IS NULL THEN 0 ELSE SUM(TOTAL) END) AS TOTAL" +
						"	from ((SELECT TO_CHAR(TO_DATE(B.START_TIME, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD') AS T_HOUR," +
						" SUM(B.FILE_TOTALSIZE) AS TOTAL  FROM MR_FTP_COL_FILE_LOG B" + "	 WHERE B.STATUS = 1" +
						" AND B.COL_ID = ?" + " AND to_date(b.start_time, 'YYYY-MM-DD HH24:MI:SS') >" + " TO_DATE('" +
						currentDateBegin + " 00:00:00', 'YYYY-MM-DD HH24:MI:SS')" +
						" AND TO_DATE(b.start_time, 'YYYY-MM-DD HH24:MI:SS') <" + " TO_DATE('" + endTime +
						"', 'YYYY-MM-DD HH24:MI:SS')" +
						"	 GROUP BY TO_CHAR(TO_DATE(B.START_TIME, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD'))" +
						"	 UNION ALL" +
						"	 (SELECT TO_CHAR(TO_DATE(T.RUN_YEAR_MONTH_DAY, 'YYYYMMDDHH'), 'YYYY-MM-DD') AS T_HOUR," +
						" SUM(T.COL_FILESIZE) AS TOTAL" + " FROM MR_FTP_COL_STATISTICS_DATE T" +
						" 	WHERE T.COL_ID = ?" + "	 AND T.RUN_YEAR_MONTH_DAY || T.RUN_TIME BETWEEN" +
						" 	 TO_CHAR(TO_DATE('" + startTime + "', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') AND" +
						" TO_CHAR(TO_DATE('" + currentDateBegin +
						" 00:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" + "	GROUP BY T.RUN_YEAR_MONTH_DAY))" +
						"	GROUP BY T_HOUR";
				return getDataAccess().queryForList(sql, col_id, col_id);
			}
		} else {
			if (currentData > end) {// 获取历史数据
				sql = "SELECT TO_CHAR(TO_DATE(T.RUN_YEAR_MONTH_DAY, 'YYYYMMDDHH'), 'YYYY-MM-DD') AS T_HOUR," +
						" SUM(NVL(NVL(T.REDUCE_OUTPUT_COUNT, NVL(T.MAP_OUTPUT_COUNT, 0)),0)) AS TOTAL" +
						" FROM MR_STATISTICS_DATE T  WHERE T.JOB_ID = ?" +
						" AND T.RUN_YEAR_MONTH_DAY || T.RUN_TIME BETWEEN" + " TO_CHAR(TO_DATE('" + startTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" + "	 AND" + " TO_CHAR(TO_DATE('" + endTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24') GROUP BY T.RUN_YEAR_MONTH_DAY";
				return getDataAccess().queryForList(sql, col_id);
			} else {// 历史数据和当前数据
				sql = "select T_HOUR, SUM(TOTAL) AS TOTAL "
						+ " from ((SELECT TO_CHAR(C.START_DATE, 'YYYY-MM-DD') AS T_HOUR,"
						+ " SUM(NVL(NVL(C.REDUCE_OUTPUT_COUNT, NVL(C.MAP_OUTPUT_COUNT, 0)),0)) AS TOTAL"
						+ " FROM MR_JOB_RUN_LOG C" + " WHERE C.RUN_FLAG = 1" + " AND C.JOB_ID = ?"
						+ " AND c.end_DATE > TO_DATE('" +
						currentDateBegin +
						" 00:00:00', 'YYYY-MM-DD HH24:MI:SS')" +
						" AND c.END_DATE < TO_DATE('" +
						endTime +
						"', 'YYYY-MM-DD HH24:MI:SS')" +
						" GROUP BY TO_CHAR(C.START_DATE, 'YYYY-MM-DD'))" +
						" UNION ALL" +
						" (SELECT TO_CHAR(TO_DATE(T.RUN_YEAR_MONTH_DAY, 'YYYYMMDDHH')," +
						"  'YYYY-MM-DD') AS T_HOUR," +
						"  SUM(NVL(NVL(T.REDUCE_OUTPUT_COUNT, NVL(T.MAP_OUTPUT_COUNT, 0)),0)) AS TOTAL" +
						" FROM MR_STATISTICS_DATE T" +
						"	 WHERE T.JOB_ID = ?" +
						" AND T.RUN_YEAR_MONTH_DAY || T.RUN_TIME BETWEEN" +
						" TO_CHAR(TO_DATE('" +
						startTime +
						"', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" +
						" AND" +
						" TO_CHAR(TO_DATE('" +
						currentDateBegin +
						" 00:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'YYYYMMDDHH24')" +
						" GROUP BY T.RUN_YEAR_MONTH_DAY))" + " GROUP BY T_HOUR";
				return getDataAccess().queryForList(sql, col_id, col_id);
			}
		}
	}
}
