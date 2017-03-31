package com.ery.meta.module.logAnalysis;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import com.ery.meta.common.DateUtil;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.web.session.SessionManager;

import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.base.support.utils.MapUtils;

/**

 * 

 * @description
 * @date 2014-01-13
 */
public class LogAnalysisDAO extends MetaBaseDAO {

	public List<Map<String, Object>> getLogAnalysisConfig() {
		String sql = "SELECT * FROM HB_MAG_LOG_ANALYSIS";
		List<Map<String, Object>> list = getDataAccess().queryForList(sql);
		return list;
	}

	public void saveLogAnalysisConfig(List<Map<String, String>> data) {
		try {
			getDataAccess().beginTransaction();
			for (Map<String, String> map : data) {
				String sql = "update HB_MAG_LOG_ANALYSIS set SHOWFLAG = " + map.get("SHOWFLAG") + ",MINSCALE="
						+ map.get("MINSCALE") + ",MAXSCALE=" + map.get("MAXSCALE") + ",MONTHNUM=" + map.get("MONTHNUM")
						+ ",DAYNUM=" + map.get("DAYNUM") + " where LA_ID='" + map.get("LA_ID") + "'";
				getDataAccess().execUpdate(sql);
			}
			getDataAccess().commit();
		} catch (Exception e) {
			getDataAccess().rollback();
			e.printStackTrace();
		}
	}

	/**
	 * 统计指标结果
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> getLogAnalysis(Map<String, Object> data) {
		String todayValue = MapUtils.getString(data, "dateNo");
		int jobType = MapUtils.getIntValue(data, "jobType");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMdd");
		String today = "";
		try {
			today = sdf1.format(sdf.parse(todayValue));
		} catch (Exception ex) {
			ex.printStackTrace();
		}

		// 获取结束时间的毫秒
		long end = StringUtil.stringToLong(todayValue, StringUtil.DATE_FORMAT_TYPE4, -1);
		long currentData = StringUtil.dateToLong(new Date(), StringUtil.DATE_FORMAT_TYPE4);
		boolean isNotToday = currentData > end;// true:表示获取历史数据，false表示获取今天的数据

		// 调用次数
		String sqlLA001Y = "";
		if (isNotToday) {// 指定日期的调用次数，从统计表中获取数据
			sqlLA001Y = " SELECT CASE WHEN SUM(A.QRY_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_COUNT) END AS TOTAL_COUNT"
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B" + " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
					+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH_DAY = '" + today + "'";
		} else {// 从清单表中获取数据
			sqlLA001Y = " SELECT COUNT(*) AS TOTAL_COUNT" + " FROM HB_USER_QRY_LOG QL" + " INNER JOIN HB_QRY_RULE QR"
					+ "  ON QL.QRY_RULE_ID = QR.QRY_RULE_ID" + " WHERE QR.DEPART_TYPE = " + jobType
					+ " AND TO_CHAR(QL.QRY_START_DATE, 'YYYY-MM-DD') = '" + todayValue + "'";
		}

		// 指定日期的历史调用次数
		String sqlLA001 = " SELECT CASE WHEN SUM(A.QRY_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_COUNT) END AS TOTAL_COUNT"
				+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B" + " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
				+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH_DAY < '" + today + "'";

		String LA001 = getDataAccess().queryForString(sqlLA001Y); // 当前日期调用次数
		String LA001Y = getDataAccess().queryForString(sqlLA001);// 历史调用次数

		// 低于5s查询次数
		String sqlLA002Y = "";
		if (isNotToday) {// 指定日期的低于5s查询次数，从统计表中获取数据
			sqlLA002Y = " SELECT CASE WHEN SUM(A.QRY_QUICK_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_QUICK_COUNT) END AS TOTAL_COUNT"
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
					+ " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
					+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH_DAY = '" + today + "'";
		} else {
			sqlLA002Y = "SELECT COUNT(*) AS TOTAL_COUNT" + " FROM HB_USER_QRY_LOG QL" + " INNER JOIN HB_QRY_RULE QR"
					+ "  ON QL.QRY_RULE_ID = QR.QRY_RULE_ID" + " WHERE QR.DEPART_TYPE =  " + jobType
					+ " AND QL.TOTAL_TIME < 5001 " + " AND TO_CHAR(QL.QRY_START_DATE, 'YYYY-MM-DD') = '" + todayValue
					+ "'";
		}

		// 指定日期的历史低于5s查询次数
		String sqlLA002 = " SELECT CASE WHEN SUM(A.QRY_QUICK_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_QUICK_COUNT) END AS TOTAL_COUNT"
				+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
				+ " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
				+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH_DAY < '" + today + "'";

		String LA002 = getDataAccess().queryForString(sqlLA002Y);// 当前低于5s查询个数
		String LA002Y = getDataAccess().queryForString(sqlLA002);// 历史低于5s查询个数

		// 指定日期的快查询占比
		String sqlLA003Y = "";
		if (isNotToday) {// 指定日期的快查询占比，从统计表中获取数据
			sqlLA003Y = " SELECT CASE WHEN M.TOTAL_COUNT=0 THEN 0 ELSE ROUND(M.QUICK_COUNT/M.TOTAL_COUNT,2)*100 END AS VAL FROM"
					+ "("
					+ "  SELECT CASE WHEN SUM(A.QRY_QUICK_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_QUICK_COUNT) END AS QUICK_COUNT,"
					+ " 					 CASE WHEN SUM(A.QRY_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_COUNT) END AS TOTAL_COUNT"
					+ " 			FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
					+ " 		 WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
					+ " 			 AND B.DEPART_TYPE = " + jobType + " 			 AND A.QRY_YEAR_MONTH_DAY = '" + today + "') M";
		} else {
			sqlLA003Y = "SELECT CASE WHEN N.QUICK_COUNT=0 THEN 0 ELSE ROUND(N.QUICK_COUNT/(N.SLOW_COUNT + N.QUICK_COUNT),2)*100 END AS VAL "
					+ "FROM(		"
					+ "		SELECT CASE WHEN M.QUICK_COUNT IS NULL THEN 0 ELSE M.QUICK_COUNT END AS QUICK_COUNT,"
					+ "					 CASE WHEN M.SLOW_COUNT IS NULL THEN 0 ELSE M.SLOW_COUNT END AS SLOW_COUNT"
					+ "					 FROM("
					+ "					  select sum(CASE WHEN QL.TOTAL_TIME < 5001 THEN 1 ELSE 0 END) AS QUICK_COUNT,"
					+ "									 sum(CASE WHEN QL.TOTAL_TIME >= 5001 THEN 1 ELSE 0 END) AS SLOW_COUNT"
					+ "							from HB_USER_QRY_LOG ql"
					+ "						 inner join Hb_Qry_Rule qr"
					+ "								on ql.qry_rule_id = qr.qry_rule_id"
					+ "						 where qr.depart_type = "
					+ jobType
					+ "							 and to_char(QRY_START_DATE, 'yyyy-mm-dd') = '" + todayValue + "') M)N";

		}

		String sqlLA003 = " SELECT CASE WHEN M.TOTAL_COUNT=0 THEN 0 ELSE ROUND(M.QUICK_COUNT/M.TOTAL_COUNT,2)*100 END AS VAL FROM"
				+ "("
				+ "  SELECT CASE WHEN SUM(A.QRY_QUICK_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_QUICK_COUNT) END AS QUICK_COUNT,"
				+ " 					 CASE WHEN SUM(A.QRY_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_COUNT) END AS TOTAL_COUNT"
				+ " 			FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
				+ " 		 WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
				+ " 			 AND B.DEPART_TYPE = " + jobType + " 			 AND A.QRY_YEAR_MONTH_DAY < '" + today + "') M";
		String LA003 = getDataAccess().queryForString(sqlLA003Y);// 当前日期
		String LA003Y = getDataAccess().queryForString(sqlLA003);// 历史快查询占比

		// 指定日期的慢查询占比
		long tmp004 = StringUtil.stringToLong(LA003, 0);
		long tmp004Y = StringUtil.stringToLong(LA003Y, 0);
		String LA004 = (tmp004 == 0) ? "0" : String.valueOf(100 - tmp004);// 当前日期
		String LA004Y = (tmp004Y == 0) ? "0" : String.valueOf(100 - tmp004Y);// 历史慢查询占比

		// 指定日期的调用平均时长
		String sqlLA005Y = "";
		if (isNotToday) {// 指定日期的调用平均时长，从统计表中获取数据
			sqlLA005Y = " SELECT CASE WHEN TOTAL_COUNT = 0 THEN 0 ELSE ROUND(TOTAL_TIME/TOTAL_COUNT/1000,2) END AS T_COUNT"
					+ " FROM( "
					+ "	     SELECT COUNT(1) TOTAL_COUNT,"
					+ "      CASE WHEN SUM(A.QRY_AVG_TOTAL_TIME) IS NULL THEN 0 ELSE SUM(A.QRY_AVG_TOTAL_TIME) END AS TOTAL_TIME"
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
					+ " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
					+ "  AND B.DEPART_TYPE = " + jobType + "  AND A.QRY_YEAR_MONTH_DAY = '" + today + "')";
		} else {
			sqlLA005Y = " SELECT CASE WHEN TOTAL_COUNT = 0 THEN 0 ELSE ROUND(TOTAL_TIME / TOTAL_COUNT / 1000, 2) END AS T_COUNT"
					+ " FROM (SELECT SUM(QL.TOTAL_TIME) AS TOTAL_TIME, COUNT(*) AS TOTAL_COUNT"
					+ " FROM HB_USER_QRY_LOG QL"
					+ " INNER JOIN HB_QRY_RULE QR"
					+ " ON QL.QRY_RULE_ID = QR.QRY_RULE_ID"
					+ " WHERE QR.DEPART_TYPE = "
					+ jobType
					+ " AND TO_CHAR(QRY_START_DATE, 'YYYY-MM-DD') = '"
					+ todayValue + "')";
		}

		String sqlLA005 = " SELECT CASE WHEN TOTAL_COUNT = 0 THEN 0 ELSE ROUND(TOTAL_TIME/TOTAL_COUNT/1000,2) END AS T_COUNT"
				+ " FROM( "
				+ "	     SELECT COUNT(1) TOTAL_COUNT,"
				+ "      CASE WHEN SUM(A.QRY_AVG_TOTAL_TIME) IS NULL THEN 0 ELSE SUM(A.QRY_AVG_TOTAL_TIME) END AS TOTAL_TIME"
				+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
				+ " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
				+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH_DAY < '" + today + "')";
		String LA005 = getDataAccess().queryForString(sqlLA005Y);// 当前日期
		String LA005Y = getDataAccess().queryForString(sqlLA005);// 历史调用平均时长

		// 查询最大耗时间
		String sqlLA006Y = "";
		if (isNotToday) {// 指定日期的最大耗时间，从统计表中获取数据
			sqlLA006Y = "SELECT CASE WHEN QRY_PER_MAX_TIME = 0 THEN 0 ELSE round(QRY_PER_MAX_TIME/1000,2) END AS T_COUNT"
					+ " FROM( "
					+ "      SELECT  CASE WHEN MAX(A.QRY_PER_MAX_TIME) IS NULL THEN 0 ELSE SUM(A.QRY_PER_MAX_TIME) END AS QRY_PER_MAX_TIME"
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
					+ " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
					+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH_DAY = '" + today + "')";
		} else {
			sqlLA006Y = " SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND(MAX(QL.TOTAL_TIME) / 1000, 2) END AS T_COUNT"
					+ " FROM HB_USER_QRY_LOG QL" + " INNER JOIN HB_QRY_RULE QR"
					+ "	 ON QL.QRY_RULE_ID = QR.QRY_RULE_ID" + " WHERE QR.DEPART_TYPE = " + jobType
					+ "	AND TO_CHAR(QRY_START_DATE, 'YYYY-MM-DD') = '" + todayValue + "'";

		}
		String sqlLA006 = "SELECT CASE WHEN QRY_PER_MAX_TIME = 0 THEN 0 ELSE round(QRY_PER_MAX_TIME/1000,2) END AS T_COUNT"
				+ " FROM( "
				+ "      SELECT  CASE WHEN MAX(A.QRY_PER_MAX_TIME) IS NULL THEN 0 ELSE SUM(A.QRY_PER_MAX_TIME) END AS QRY_PER_MAX_TIME"
				+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
				+ " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
				+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH_DAY < '" + today + "')";

		String LA006 = getDataAccess().queryForString(sqlLA006Y);// 当前日期
		String LA006Y = getDataAccess().queryForString(sqlLA006);// 历史查询最大耗时间

		Map<String, Object> LAMap = new HashMap<String, Object>();
		LAMap.put("LA001", LA001);
		LAMap.put("LA002", LA002);
		LAMap.put("LA003", LA003);
		LAMap.put("LA004", LA004);
		LAMap.put("LA005", LA005);
		LAMap.put("LA006", LA006);
		LAMap.put("LA001Y", LA001Y);
		LAMap.put("LA002Y", LA002Y);
		LAMap.put("LA003Y", LA003Y);
		LAMap.put("LA004Y", LA004Y);
		LAMap.put("LA005Y", LA005Y);
		LAMap.put("LA006Y", LA006Y);

		List<Map<String, Object>> list = getDataAccess().queryForList(
				"select * from HB_MAG_LOG_ANALYSIS t where t.showflag =0");
		for (Map<String, Object> map : list) {
			String signname = map.get("LA_ID").toString();
			String min = "";
			String max = "";
			if ("LA003".equalsIgnoreCase(signname) || "LA004".equalsIgnoreCase(signname)) {// 需要小数点后两位
				double temp = MapUtils.getDoubleValue(LAMap, map.get("LA_ID").toString() + "Y");
				double tmp = (temp * MapUtils.getLongValue(map, "MINSCALE")) / 100;
				min = StringUtil.getDoublePoint(tmp >= 100 ? 100 : tmp, "0");
				tmp = temp + (temp * MapUtils.getLongValue(map, "MAXSCALE")) / 100;
				max = StringUtil.getDoublePoint(tmp >= 100 ? 100 : tmp, "0");
			} else if ("LA005".equalsIgnoreCase(signname) || "LA006".equalsIgnoreCase(signname)) {// 需要小数点后两位
				double temp = MapUtils.getDoubleValue(LAMap, map.get("LA_ID").toString() + "Y");
				min = StringUtil.getDoublePoint((double) ((temp * MapUtils.getLongValue(map, "MINSCALE")) / 100),
						"0.00");
				max = StringUtil.getDoublePoint(
						temp + (double) ((temp * MapUtils.getLongValue(map, "MAXSCALE")) / 100), "0.00");
			} else {
				long temp = MapUtils.getLongValue(LAMap, map.get("LA_ID").toString() + "Y");
				min = String.valueOf((int) ((double) ((temp * MapUtils.getLongValue(map, "MINSCALE")) / 100)));
				max = String.valueOf(temp + (int) ((double) ((temp * MapUtils.getLongValue(map, "MAXSCALE")) / 100)));
			}
			map.put("UNIT_NAME", getUnitName(signname));
			map.put("value", LAMap.get(map.get("LA_ID").toString()));
			map.put("rate", "");
			map.put("RANGE", min + "~" + max);
			map.put("minvalue", min);
			map.put("maxvalue", max);
		}

		return list;
	}

	public List<Map<String, Object>> getLogAnalysisDetail(Map<String, Object> data, Page page) {
		String userId = MapUtils.getString(data, "userId", "");
		if ("".equals(userId) && userId.length() <= 0) {
			HttpSession session = SessionManager.getCurrentSession();
			@SuppressWarnings("unchecked")
			Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
			userId = formatUser.get("userId").toString();
		}
		String typeId = MapUtils.getString(data, "jobType", "");
		String today = MapUtils.getString(data, "dateNo", "");
		String sql = "select t.qry_rule_id,QR.QRY_RULE_NAME,count(*) scount,SUM(QRY_NUM) QRY_NUM,SUM(QRY_SUM_NUM) QRY_SUM_NUM,SUM(QRY_SIZE) QRY_SIZE,cast(round(SUM(T.TOTAL_TIME)/ COUNT(*),2) as decimal(10,2)) stime from HB_USER_QRY_LOG t "
				+ " INNER JOIN HB_QRY_RULE QR ON t.QRY_RULE_ID = QR.QRY_RULE_ID "
				+ "  where qr.depart_type in (select type_id from meta_mr_usertype where user_id = " + userId;
		if (!"".equals(typeId) && typeId.length() > 0) {
			sql += " AND TYPE_ID = " + typeId;
		}
		sql += " ) and to_char(t.qry_start_date,'yyyy-mm-dd') = '" + today + "'"
				+ " group by to_char(t.qry_start_date,'yyymmdd'),t.qry_rule_id,QR.QRY_RULE_NAME ORDER BY qry_rule_id";
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryForList(sql);
	}

	public List<Map<String, Object>> getLogAnalysisTopDetail(Map<String, Object> data, Page page) {
		String userId = MapUtils.getString(data, "userId", "");
		if ("".equals(userId) && userId.length() <= 0) {
			HttpSession session = SessionManager.getCurrentSession();
			@SuppressWarnings("unchecked")
			Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
			userId = formatUser.get("userId").toString();
		}
		int pageNum = getDayPageNum();
		String typeId = MapUtils.getString(data, "jobType", "");
		String today = MapUtils.getString(data, "dateNo", "");
		String sql = "SELECT * FROM (SELECT QL.LOG_ID,QL.USER_ID,QL.QRY_RULE_ID,QL.QRY_FLAG,"
				+ "QL.LOG_MSG,QL.TOTAL_TIME,QL.QRY_TOTAL_TIME," + "QL.QRY_FILTER_TIME,QL.QRY_PAGE_TIME,"
				+ "TO_CHAR(QL.QRY_START_DATE,'YYYY-MM-DD HH24:MI:SS') AS QRY_START_DATE,"
				+ "QL.QRY_NUM,QL.QRY_SUM_NUM,QL.QRY_SIZE,QR.QRY_RULE_NAME "
				+ "FROM HB_USER_QRY_LOG QL INNER JOIN HB_QRY_RULE QR ON QL.QRY_RULE_ID = QR.QRY_RULE_ID "
				+ "  WHERE QR.DEPART_TYPE IN (SELECT TYPE_ID FROM META_MR_USERTYPE WHERE USER_ID = " + userId;
		if (!"".equals(typeId) && typeId.length() > 0) {
			sql += " AND TYPE_ID = " + typeId;
		}
		sql += ") and to_char(QL.qry_start_date,'yyyy-mm-dd') = '" + today + "'";
		sql += " order by total_time desc";
		if (pageNum >= 0) {
			sql += ") WHERE ROWNUM <= " + pageNum;
		}
		sql += " order by total_time desc";
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 得到天排行榜返回条数
	 * 
	 * @return
	 */
	private int getDayPageNum() {
		String sql = "SELECT DISTINCT DAYNUM FROM HB_MAG_LOG_ANALYSIS";
		return getDataAccess().queryForInt(sql);
	}

	/**
	 * 得到月排行榜返回条数
	 * 
	 * @return
	 */
	private int getMonthPageNum() {
		String sql = "SELECT DISTINCT MONTHNUM FROM HB_MAG_LOG_ANALYSIS";
		return getDataAccess().queryForInt(sql);
	}

	public List<Map<String, Object>> getInputDetail(Map<String, Object> data) {

		String userId = MapUtils.getString(data, "userId", "");
		if ("".equals(userId) && userId.length() <= 0) {
			HttpSession session = SessionManager.getCurrentSession();
			@SuppressWarnings("unchecked")
			Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
			userId = formatUser.get("userId").toString();
		}
		String typeId = MapUtils.getString(data, "jobType", "");
		String today = MapUtils.getString(data, "dateNo", "").replace("-", "");
		String sql = " select PARAM_VALUE,"
				+ " CASE WHEN REDUCE_OUTPUT_COUNT IS NULL THEN (CASE WHEN MAP_OUTPUT_COUNT IS NULL THEN 0 ELSE MAP_OUTPUT_COUNT END) ELSE REDUCE_OUTPUT_COUNT END INPUT_COUNT from("
				+ " select JP.PARAM_VALUE,SUM(JL.MAP_INPUT_COUNT) MAP_INPUT_COUNT,SUM(JL.MAP_OUTPUT_COUNT) MAP_OUTPUT_COUNT,"
				+ " SUM(JL.REDUCE_OUTPUT_COUNT) REDUCE_OUTPUT_COUNT,SUM(JL.REDUCE_INPUT_COUNT) REDUCE_INPUT_COUNT from mr_job_run_log jl"
				+ " inner join mr_job j on jl.job_id=j.job_id" + " inner join mr_job_param jp on j.job_id = jp.job_id"
				+ " inner join mr_data_source ds on j.output_data_source_id = ds.data_source_id"
				+ " inner join mr_source_type st on ds.source_type_id=st.source_type_id "
				+ " INNER JOIN meta_mr_type mt on j.job_type = mt.type_id"
				+ " where st.source_type = 'HBASE' and JP.PARAM_NAME = 'output.mr.maperd.hbase.table'"
				+ " and j.job_type in (select type_id from meta_mr_usertype where user_id = " + userId
				+ ") and JL.DATA_NO = '" + today + "'";
		if (!"".equals(typeId) && typeId.length() > 0) {
			sql += "AND MT.TYPE_ID = " + typeId;
		}
		sql += " GROUP BY JP.PARAM_VALUE)";
		return getDataAccess().queryForList(sql);
	}

	public Map<String, Object> getInputLineDetail(Map<String, Object> data) {
		String userId = MapUtils.getString(data, "userId", "");
		if ("".equals(userId) && userId.length() <= 0) {
			HttpSession session = SessionManager.getCurrentSession();
			@SuppressWarnings("unchecked")
			Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
			userId = formatUser.get("userId").toString();
		}

		String today = MapUtils.getString(data, "dateNo", "");
		String typeId = MapUtils.getString(data, "jobType", "");
		String typeNameVar = MapUtils.getString(data, "typeName", "");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String sql = " select mt.type_name,SUM(JL.MAP_INPUT_COUNT) MAP_INPUT_COUNT,SUM(JL.MAP_OUTPUT_COUNT) MAP_OUTPUT_COUNT,"
				+ " SUM(JL.REDUCE_OUTPUT_COUNT) REDUCE_OUTPUT_COUNT,SUM(JL.REDUCE_INPUT_COUNT) REDUCE_INPUT_COUNT,JL.DATA_NO from mr_job_run_log jl"
				+ " inner join mr_job j on jl.job_id=j.job_id"
				+ " inner join mr_job_param jp on j.job_id = jp.job_id"
				+ " inner join mr_data_source ds on j.output_data_source_id = ds.data_source_id"
				+ " inner join mr_source_type st on ds.source_type_id=st.source_type_id "
				+ " INNER JOIN meta_mr_type mt on j.job_type = mt.type_id"
				+ " where st.source_type = 'HBASE' and JP.PARAM_NAME = 'output.mr.maperd.hbase.table'"
				+ " and j.job_type in (select type_id from meta_mr_usertype where user_id = " + userId;
		if (!"".equals(typeId) && typeId.length() > 0) {
			sql += " AND TYPE_ID = " + typeId;
		}
		sql += ") and to_char(jl.start_date,'yyyy-mm-dd') <= '" + today
				+ "' and to_char(jl.start_date+30,'yyyy-mm-dd') > '" + today + "' "
				+ " GROUP BY JL.DATA_NO,mt.type_name  order by DATA_NO desc";
		List<Map<String, Object>> list = getDataAccess().queryForList(sql);
		Map<String, Map<String, Object>> maps = new HashMap<String, Map<String, Object>>();
		List<String> typeNames = new ArrayList<String>();
		for (Map<String, Object> map : list) {
			if (maps.containsKey(map.get("TYPE_NAME").toString())) {
				if (map.get("REDUCE_INPUT_COUNT") != null && !map.get("REDUCE_INPUT_COUNT").toString().equals("")) {
					maps.get(map.get("TYPE_NAME").toString()).put(map.get("DATA_NO").toString(),
							map.get("REDUCE_INPUT_COUNT").toString());
				} else {
					maps.get(map.get("TYPE_NAME").toString()).put(map.get("DATA_NO").toString(),
							MapUtils.getString(map, "MAP_INPUT_COUNT", ""));
				}
			} else {
				maps.put(map.get("TYPE_NAME").toString(), new HashMap<String, Object>());
				if (map.get("REDUCE_INPUT_COUNT") != null && !map.get("REDUCE_INPUT_COUNT").toString().equals("")) {
					maps.get(map.get("TYPE_NAME").toString()).put(map.get("DATA_NO").toString(),
							map.get("REDUCE_INPUT_COUNT").toString());
				} else {
					maps.get(map.get("TYPE_NAME").toString()).put(map.get("DATA_NO").toString(),
							MapUtils.getString(map, "MAP_INPUT_COUNT", ""));
				}
				typeNames.add(map.get("TYPE_NAME").toString());
			}
		}

		Calendar c = Calendar.getInstance();
		try {
			Date date = sdf.parse(today);
			c.setTime(date);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		// int datenonow =
		// c.get(Calendar.YEAR)*10000+c.get(Calendar.MONTH)*100+100+c.get(Calendar.DAY_OF_MONTH);
		// c.add(Calendar.MONTH, -1);
		// int dateno =
		// c.get(Calendar.YEAR)*10000+c.get(Calendar.MONTH)*100+c.get(Calendar.DAY_OF_MONTH);

		// 数据
		String[] datas = new String[30];
		SimpleDateFormat sf = new SimpleDateFormat("yyyyMMdd");
		// 刻度
		String datanos = "";
		for (int k = 0; k < 30; k++) {

			String dateno = sf.format(c.getTime());
			// int dateno =
			// c.get(Calendar.YEAR)*10000+c.get(Calendar.MONTH)*100+c.get(Calendar.DAY_OF_MONTH);
			datanos += dateno + "|";
			// for (String typeName : typeNames) {
			// if(maps.get(typeName).containsKey(dateno+"")){
			// datas[typeNames.indexOf(typeName)] =
			// (datas[typeNames.indexOf(typeName)]==null?"":datas[typeNames.indexOf(typeName)]+
			// maps.get(typeName).get(dateno+"").toString())+"|";
			// }else{
			// datas[typeNames.indexOf(typeName)] =
			// (datas[typeNames.indexOf(typeName)]==null?"":datas[typeNames.indexOf(typeName)])+
			// "0|";
			// }
			// }
			if (maps.size() > 0 && maps.get(typeNameVar).containsKey(dateno + "")) {
				String temp = MapUtils.getString(maps.get(typeNameVar), dateno + "", "0");
				if ("".equals(temp)) {
					temp = "0";
				}
				datas[k] = temp + "|";
			} else {
				datas[k] = "0|";
			}
			c.add(Calendar.DATE, -1);
		}

		for (int i = 0; i < datas.length; i++) {
			datas[i] = datas[i].substring(0, datas[i].length() - 1);
		}
		datanos = datanos.substring(0, datanos.length() - 1);

		String[] arrDatanos = datanos.split("\\|");

		Map<String, Object> returnData = new HashMap<String, Object>();
		returnData.put("typeNames", typeNames);
		returnData.put("datanos", invertArray(arrDatanos));
		returnData.put("datas", invertArray(datas));
		returnData.put("typeName", typeNameVar);
		returnData.put("jobType", typeId);

		return returnData;
	}

	/**
	 * 反转数组
	 * 
	 */
	public String[] invertArray(String[] array) {
		String t[] = new String[array.length]; // 开辟一个新的数组
		int count = t.length - 1;
		for (int x = 0; x < t.length; x++) {
			t[count] = array[x]; // 数组反转
			count--;
		}
		return t;
	}

	public Map<String, Object> getLogAnalysisLineTop(Map<String, Object> data) {
		String userId = MapUtils.getString(data, "userId", "");
		if ("".equals(userId) && userId.length() <= 0) {
			HttpSession session = SessionManager.getCurrentSession();
			@SuppressWarnings("unchecked")
			Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
			userId = formatUser.get("userId").toString();
		}
		String today = MapUtils.getString(data, "dateNo", "");
		String typeId = MapUtils.getString(data, "jobType", "");
		String typeNameVar = MapUtils.getString(data, "typeName", "");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String sql = " select count(*) SEARCH_COUNT, mt.type_name,to_char(ql.qry_start_date,'yyyymmdd') DATA_NO"
				+ " from HB_USER_QRY_LOG QL " + " INNER JOIN HB_QRY_RULE QR "
				+ " INNER JOIN meta_mr_type mt on qr.depart_type = mt.type_id "
				+ " ON QL.QRY_RULE_ID = QR.QRY_RULE_ID "
				+ " where qr.depart_type in (select type_id from meta_mr_usertype where user_id = " + userId;
		if (!"".equals(typeId) && typeId.length() > 0) {
			sql += " AND TYPE_ID = " + typeId;
		}
		sql += ") and to_char(QL.qry_start_date,'yyyy-mm-dd') <= '" + today
				+ "' and to_char(QL.qry_start_date+30,'yyyy-mm-dd') > '" + today + "' "
				+ " group by mt.type_name,to_char(ql.qry_start_date,'yyyymmdd') "
				+ " order by to_char(ql.qry_start_date,'yyyymmdd')";
		List<Map<String, Object>> list = getDataAccess().queryForList(sql);
		Map<String, Map<String, Object>> maps = new HashMap<String, Map<String, Object>>();
		List<String> typeNames = new ArrayList<String>();
		for (Map<String, Object> map : list) {
			if (maps.containsKey(map.get("TYPE_NAME").toString())) {
				maps.get(map.get("TYPE_NAME").toString()).put(map.get("DATA_NO").toString(),
						map.get("SEARCH_COUNT").toString());
			} else {
				maps.put(map.get("TYPE_NAME").toString(), new HashMap<String, Object>());
				maps.get(map.get("TYPE_NAME").toString()).put(map.get("DATA_NO").toString(),
						map.get("SEARCH_COUNT").toString());
				typeNames.add(map.get("TYPE_NAME").toString());
			}
		}
		Calendar c = Calendar.getInstance();
		try {
			Date date = sdf.parse(today);
			c.setTime(date);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		// int datenonow =
		// c.get(Calendar.YEAR)*10000+c.get(Calendar.MONTH)*100+100+c.get(Calendar.DAY_OF_MONTH);
		// c.add(Calendar.MONTH, -1);
		// int dateno =
		// c.get(Calendar.YEAR)*10000+c.get(Calendar.MONTH)*100+c.get(Calendar.DAY_OF_MONTH);
		// 数据
		String[] datas = new String[30];
		SimpleDateFormat sf = new SimpleDateFormat("yyyyMMdd");
		// 刻度
		String datanos = "";
		// int j=0;
		for (int k = 0; k < 30; k++) {
			// c.add(Calendar.DAY_OF_MONTH, );

			String dateno = sf.format(c.getTime());
			datanos += dateno + "|";
			// for (String typeName : typeNames) {
			// if(maps.get(typeName).containsKey(dateno+"")){
			// datas[typeNames.indexOf(typeName)] =
			// (datas[typeNames.indexOf(typeName)]==null?"":datas[typeNames.indexOf(typeName)]+
			// maps.get(typeName).get(dateno+"").toString())+"|";
			// }else{
			// datas[typeNames.indexOf(typeName)] =
			// (datas[typeNames.indexOf(typeName)]==null?"":datas[typeNames.indexOf(typeName)])+
			// "0|";
			// }
			// }
			if (maps.size() > 0 && maps.get(typeNameVar).containsKey(dateno + "")) {
				String temp = MapUtils.getString(maps.get(typeNameVar), dateno + "", "0");
				if ("".equals(temp)) {
					temp = "0";
				}
				datas[k] = temp + "|";
			} else {
				datas[k] = "0|";
			}
			if (typeNames.size() == 0) {
				datas[k] = "0|";
			}
			c.add(Calendar.DATE, -1);

		}
		for (int i = 0; i < datas.length; i++) {
			datas[i] = datas[i].substring(0, datas[i].length() - 1);
		}
		datanos = datanos.substring(0, datanos.length() - 1);
		String[] arrTemp = datanos.split("\\|");

		Map<String, Object> returnData = new HashMap<String, Object>();
		returnData.put("typeNames", typeNames);
		returnData.put("datanos", invertArray(arrTemp));
		returnData.put("datas", invertArray(datas));
		returnData.put("typeName", typeNameVar);
		returnData.put("jobType", typeId);

		return returnData;
	}

	/**
	 * 统计指标结果
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> getLogAnalysisM(Map<String, Object> data) {
		String todayValue = MapUtils.getString(data, "dateNo");
		int jobType = MapUtils.getIntValue(data, "jobType");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM");
		SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMM");
		String today = "";
		try {
			today = sdf1.format(sdf.parse(todayValue));
		} catch (Exception ex) {
			ex.printStackTrace();
		}

		// 获取结束时间的毫秒
		long end = StringUtil.stringToLong(todayValue, "yyyy-MM", -1);
		long currentData = StringUtil.dateToLong(new Date(), "yyyy-MM");
		boolean isNotToday = currentData > end;// true:表示获取历史数据，false表示获取当月的数据

		// 调用次数
		String sqlLA001Y = "";
		if (isNotToday) {// 指定日期的调用次数，从统计表中获取数据
			sqlLA001Y = " SELECT CASE WHEN SUM(A.QRY_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_COUNT) END AS TOTAL_COUNT"
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B" + " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
					+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH = '" + today + "'";
		} else {// 从清单表中获取数据
			sqlLA001Y = " SELECT COUNT(*) AS TOTAL_COUNT" + " FROM HB_USER_QRY_LOG QL" + " INNER JOIN HB_QRY_RULE QR"
					+ "  ON QL.QRY_RULE_ID = QR.QRY_RULE_ID" + " WHERE QR.DEPART_TYPE = " + jobType
					+ " AND TO_CHAR(QL.QRY_START_DATE, 'YYYY-MM') = '" + todayValue + "'";
		}

		// 指定日期的历史调用次数
		String sqlLA001 = " SELECT CASE WHEN SUM(A.QRY_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_COUNT) END AS TOTAL_COUNT"
				+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B" + " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
				+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH < '" + today + "'";

		String LA001 = getDataAccess().queryForString(sqlLA001Y); // 当前日期调用次数
		String LA001Y = getDataAccess().queryForString(sqlLA001);// 历史调用次数

		// 低于5s查询次数
		String sqlLA002Y = "";
		if (isNotToday) {// 指定日期的低于5s查询次数，从统计表中获取数据
			sqlLA002Y = " SELECT CASE WHEN SUM(A.QRY_QUICK_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_QUICK_COUNT) END AS TOTAL_COUNT"
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
					+ " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
					+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH = '" + today + "'";
		} else {
			sqlLA002Y = "SELECT COUNT(*) AS TOTAL_COUNT" + " FROM HB_USER_QRY_LOG QL" + " INNER JOIN HB_QRY_RULE QR"
					+ "  ON QL.QRY_RULE_ID = QR.QRY_RULE_ID" + " WHERE QR.DEPART_TYPE =  " + jobType
					+ " AND QL.TOTAL_TIME < 5001 " + " AND TO_CHAR(QL.QRY_START_DATE, 'YYYY-MM') = '" + todayValue
					+ "'";
		}

		// 指定日期的历史低于5s查询次数
		String sqlLA002 = " SELECT CASE WHEN SUM(A.QRY_QUICK_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_QUICK_COUNT) END AS TOTAL_COUNT"
				+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
				+ " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
				+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH < '" + today + "'";

		String LA002 = getDataAccess().queryForString(sqlLA002Y);// 当前低于5s查询个数
		String LA002Y = getDataAccess().queryForString(sqlLA002);// 历史低于5s查询个数

		// 指定日期的快查询占比
		String sqlLA003Y = "";
		if (isNotToday) {// 指定日期的快查询占比，从统计表中获取数据
			sqlLA003Y = " SELECT CASE WHEN M.TOTAL_COUNT=0 THEN 0 ELSE ROUND(M.QUICK_COUNT/M.TOTAL_COUNT,2)*100 END AS VAL FROM"
					+ "("
					+ "  SELECT CASE WHEN SUM(A.QRY_QUICK_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_QUICK_COUNT) END AS QUICK_COUNT,"
					+ " 					 CASE WHEN SUM(A.QRY_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_COUNT) END AS TOTAL_COUNT"
					+ " 			FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
					+ " 		 WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
					+ " 			 AND B.DEPART_TYPE = " + jobType + " 			 AND A.QRY_YEAR_MONTH = '" + today + "') M";
		} else {
			sqlLA003Y = "SELECT CASE WHEN N.QUICK_COUNT=0 THEN 0 ELSE ROUND(N.QUICK_COUNT/(N.SLOW_COUNT + N.QUICK_COUNT),2)*100 END AS VAL "
					+ "FROM(		"
					+ "		SELECT CASE WHEN M.QUICK_COUNT IS NULL THEN 0 ELSE M.QUICK_COUNT END AS QUICK_COUNT,"
					+ "					 CASE WHEN M.SLOW_COUNT IS NULL THEN 0 ELSE M.SLOW_COUNT END AS SLOW_COUNT"
					+ "					 FROM("
					+ "					  select sum(CASE WHEN QL.TOTAL_TIME < 5001 THEN 1 ELSE 0 END) AS QUICK_COUNT,"
					+ "									 sum(CASE WHEN QL.TOTAL_TIME >= 5001 THEN 1 ELSE 0 END) AS SLOW_COUNT"
					+ "							from HB_USER_QRY_LOG ql"
					+ "						 inner join Hb_Qry_Rule qr"
					+ "								on ql.qry_rule_id = qr.qry_rule_id"
					+ "						 where qr.depart_type = "
					+ jobType
					+ "							 and to_char(QRY_START_DATE, 'yyyy-mm') = '" + todayValue + "') M)N";

		}

		String sqlLA003 = " SELECT CASE WHEN M.TOTAL_COUNT=0 THEN 0 ELSE ROUND(M.QUICK_COUNT/M.TOTAL_COUNT,2)*100 END AS VAL FROM"
				+ "("
				+ "  SELECT CASE WHEN SUM(A.QRY_QUICK_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_QUICK_COUNT) END AS QUICK_COUNT,"
				+ " 					 CASE WHEN SUM(A.QRY_COUNT) IS NULL THEN 0 ELSE SUM(A.QRY_COUNT) END AS TOTAL_COUNT"
				+ " 			FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
				+ " 		 WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
				+ " 			 AND B.DEPART_TYPE = " + jobType + " 			 AND A.QRY_YEAR_MONTH < '" + today + "') M";
		String LA003 = getDataAccess().queryForString(sqlLA003Y);// 当前日期
		String LA003Y = getDataAccess().queryForString(sqlLA003);// 历史快查询占比

		// 指定日期的慢查询占比
		long tmp004 = StringUtil.stringToLong(LA003, 0);
		long tmp004Y = StringUtil.stringToLong(LA003Y, 0);
		String LA004 = (tmp004 == 0) ? "0" : String.valueOf(100 - tmp004);// 当前日期
		String LA004Y = (tmp004Y == 0) ? "0" : String.valueOf(100 - tmp004Y);// 历史慢查询占比

		// 指定日期的调用平均时长
		String sqlLA005Y = "";
		if (isNotToday) {// 指定日期的低于5s查询次数，从统计表中获取数据
			sqlLA005Y = " SELECT CASE WHEN TOTAL_COUNT = 0 THEN 0 ELSE ROUND(TOTAL_TIME/TOTAL_COUNT/1000,2) END AS T_COUNT"
					+ " FROM( "
					+ "	     SELECT COUNT(1) TOTAL_COUNT,"
					+ "      CASE WHEN SUM(A.QRY_AVG_TOTAL_TIME) IS NULL THEN 0 ELSE SUM(A.QRY_AVG_TOTAL_TIME) END AS TOTAL_TIME"
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
					+ " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
					+ "  AND B.DEPART_TYPE = " + jobType + "  AND A.QRY_YEAR_MONTH = '" + today + "')";
		} else {
			sqlLA005Y = " SELECT CASE WHEN TOTAL_COUNT = 0 THEN 0 ELSE ROUND(TOTAL_TIME / TOTAL_COUNT / 1000, 2) END AS T_COUNT"
					+ " FROM (SELECT SUM(QL.TOTAL_TIME) AS TOTAL_TIME, COUNT(*) AS TOTAL_COUNT"
					+ " FROM HB_USER_QRY_LOG QL"
					+ " INNER JOIN HB_QRY_RULE QR"
					+ " ON QL.QRY_RULE_ID = QR.QRY_RULE_ID"
					+ " WHERE QR.DEPART_TYPE = "
					+ jobType
					+ " AND TO_CHAR(QRY_START_DATE, 'YYYY-MM') = '"
					+ todayValue
					+ "')";
		}

		String sqlLA005 = " SELECT CASE WHEN TOTAL_COUNT = 0 THEN 0 ELSE ROUND(TOTAL_TIME/TOTAL_COUNT/1000,2) END AS T_COUNT"
				+ " FROM( "
				+ "	     SELECT COUNT(1) TOTAL_COUNT,"
				+ "      CASE WHEN SUM(A.QRY_AVG_TOTAL_TIME) IS NULL THEN 0 ELSE SUM(A.QRY_AVG_TOTAL_TIME) END AS TOTAL_TIME"
				+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
				+ " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
				+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH < '" + today + "')";
		String LA005 = getDataAccess().queryForString(sqlLA005Y);// 当前日期
		String LA005Y = getDataAccess().queryForString(sqlLA005);// 历史调用平均时长

		// 查询最大耗时间
		String sqlLA006Y = "";
		if (isNotToday) {// 指定日期的最大耗时间，从统计表中获取数据
			sqlLA006Y = "SELECT CASE WHEN QRY_PER_MAX_TIME = 0 THEN 0 ELSE round(QRY_PER_MAX_TIME/1000,2) END AS T_COUNT"
					+ " FROM( "
					+ "      SELECT  CASE WHEN MAX(A.QRY_PER_MAX_TIME) IS NULL THEN 0 ELSE SUM(A.QRY_PER_MAX_TIME) END AS QRY_PER_MAX_TIME"
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
					+ " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
					+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH = '" + today + "')";
		} else {
			sqlLA006Y = " SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND(MAX(QL.TOTAL_TIME) / 1000, 2) END AS T_COUNT"
					+ " FROM HB_USER_QRY_LOG QL" + " INNER JOIN HB_QRY_RULE QR"
					+ "	 ON QL.QRY_RULE_ID = QR.QRY_RULE_ID" + " WHERE QR.DEPART_TYPE = " + jobType
					+ "	AND TO_CHAR(QRY_START_DATE, 'YYYY-MM') = '" + todayValue + "'";

		}
		String sqlLA006 = "SELECT CASE WHEN QRY_PER_MAX_TIME = 0 THEN 0 ELSE round(QRY_PER_MAX_TIME/1000,2) END AS T_COUNT"
				+ " FROM( "
				+ "      SELECT  CASE WHEN MAX(A.QRY_PER_MAX_TIME) IS NULL THEN 0 ELSE SUM(A.QRY_PER_MAX_TIME) END AS QRY_PER_MAX_TIME"
				+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B"
				+ " WHERE A.QRY_RULE_ID = B.QRY_RULE_ID"
				+ " AND B.DEPART_TYPE = " + jobType + " AND A.QRY_YEAR_MONTH < '" + today + "')";

		String LA006 = getDataAccess().queryForString(sqlLA006Y);// 当前日期
		String LA006Y = getDataAccess().queryForString(sqlLA006);// 历史查询最大耗时间

		Map<String, Object> LAMap = new HashMap<String, Object>();
		LAMap.put("LA001", LA001);
		LAMap.put("LA002", LA002);
		LAMap.put("LA003", LA003);
		LAMap.put("LA004", LA004);
		LAMap.put("LA005", LA005);
		LAMap.put("LA006", LA006);
		LAMap.put("LA001Y", LA001Y);
		LAMap.put("LA002Y", LA002Y);
		LAMap.put("LA003Y", LA003Y);
		LAMap.put("LA004Y", LA004Y);
		LAMap.put("LA005Y", LA005Y);
		LAMap.put("LA006Y", LA006Y);

		List<Map<String, Object>> list = getDataAccess().queryForList(
				"select * from HB_MAG_LOG_ANALYSIS t where t.showflag =0");
		for (Map<String, Object> map : list) {
			String signname = map.get("LA_ID").toString();
			String min = "";
			String max = "";
			if ("LA003".equalsIgnoreCase(signname) || "LA004".equalsIgnoreCase(signname)) {// 需要小数点后两位
				double temp = MapUtils.getDoubleValue(LAMap, map.get("LA_ID").toString() + "Y");
				double tmp = (temp * MapUtils.getLongValue(map, "MINSCALE")) / 100;
				min = StringUtil.getDoublePoint(tmp >= 100 ? 100 : tmp, "0");
				tmp = temp + (temp * MapUtils.getLongValue(map, "MAXSCALE")) / 100;
				max = StringUtil.getDoublePoint(tmp >= 100 ? 100 : tmp, "0");
			} else if ("LA005".equalsIgnoreCase(signname) || "LA006".equalsIgnoreCase(signname)) {// 需要小数点后两位
				double temp = MapUtils.getDoubleValue(LAMap, map.get("LA_ID").toString() + "Y");
				min = StringUtil.getDoublePoint((double) ((temp * MapUtils.getLongValue(map, "MINSCALE")) / 100),
						"0.00");
				max = StringUtil.getDoublePoint(
						temp + (double) ((temp * MapUtils.getLongValue(map, "MAXSCALE")) / 100), "0.00");
			} else {
				long temp = MapUtils.getLongValue(LAMap, map.get("LA_ID").toString() + "Y");
				min = String.valueOf((int) ((double) ((temp * MapUtils.getLongValue(map, "MINSCALE")) / 100)));
				max = String.valueOf(temp + (int) ((double) ((temp * MapUtils.getLongValue(map, "MAXSCALE")) / 100)));
			}

			map.put("UNIT_NAME", getUnitName(signname));
			map.put("value", LAMap.get(map.get("LA_ID").toString()));
			map.put("rate", "");
			map.put("RANGE", min + "~" + max);
			map.put("minvalue", min);
			map.put("maxvalue", max);
		}

		return list;
	}

	/**
	 * 得到统计指标单位
	 * 
	 * @param markName
	 * @return
	 */
	public String getUnitName(String markName) {
		if ("".equals(markName) && markName.length() == 0) {
			return "";
		}
		if ("LA001".equals(markName) || "LA002".equals(markName) || "LA007".equals(markName)
				|| "LA008".equals(markName)) {
			return "次";
		} else if ("LA005".equals(markName) || "LA006".equals(markName)) {
			return "秒";
		} else if ("LA003".equals(markName) || "LA004".equals(markName)) {
			return "%";
		}

		return "";
	}

	public List<Map<String, Object>> getLogAnalysisDetailM(Map<String, Object> data, Page page) {
		String userId = MapUtils.getString(data, "userId", "");
		if ("".equals(userId) && userId.length() <= 0) {
			HttpSession session = SessionManager.getCurrentSession();
			@SuppressWarnings("unchecked")
			Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
			userId = formatUser.get("userId").toString();
		}
		String typeId = MapUtils.getString(data, "jobType", "");
		String today = MapUtils.getString(data, "dateNo", "");
		String sql = "select t.qry_rule_id,QR.QRY_RULE_NAME,count(*) scount,SUM(QRY_NUM) QRY_NUM,SUM(QRY_SUM_NUM) QRY_SUM_NUM,SUM(QRY_SIZE) QRY_SIZE,cast(round(SUM(T.TOTAL_TIME)/ COUNT(*),2) as decimal(10,2)) stime from HB_USER_QRY_LOG t "
				+ " INNER JOIN HB_QRY_RULE QR ON t.QRY_RULE_ID = QR.QRY_RULE_ID "
				+ "  where qr.depart_type in (select type_id from meta_mr_usertype where user_id = " + userId;
		if (!"".equals(typeId) && typeId.length() > 0) {
			sql += " AND TYPE_ID = " + typeId;
		}
		sql += ") and to_char(t.qry_start_date,'yyyy-mm') = '" + today + "'"
				+ " group by to_char(t.qry_start_date,'yyyymm'),t.qry_rule_id,QR.QRY_RULE_NAME ORDER BY qry_rule_id";
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryForList(sql);
	}

	public List<Map<String, Object>> getLogAnalysisTopDetailM(Map<String, Object> data, Page page) {
		String userId = MapUtils.getString(data, "userId", "");
		if ("".equals(userId) && userId.length() <= 0) {
			HttpSession session = SessionManager.getCurrentSession();
			@SuppressWarnings("unchecked")
			Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
			userId = formatUser.get("userId").toString();
		}
		String typeId = MapUtils.getString(data, "jobType", "");
		String today = MapUtils.getString(data, "dateNo", "");
		int pageNum = getMonthPageNum();
		String sql = "SELECT * FROM (SELECT  QL.LOG_ID,QL.USER_ID,QL.QRY_RULE_ID,QL.QRY_FLAG,QL.LOG_MSG"
				+ ",QL.TOTAL_TIME,QL.QRY_TOTAL_TIME,QL.QRY_FILTER_TIME"
				+ ",QL.QRY_PAGE_TIME,TO_CHAR(QL.QRY_START_DATE,'YYYY-MM-DD HH24:MI:SS') AS QRY_START_DATE"
				+ ",QL.QRY_NUM,QL.QRY_SUM_NUM,QL.QRY_SIZE,QR.QRY_RULE_NAME FROM HB_USER_QRY_LOG QL "
				+ "INNER JOIN HB_QRY_RULE QR ON QL.QRY_RULE_ID = QR.QRY_RULE_ID "
				+ "  WHERE QR.DEPART_TYPE IN (SELECT TYPE_ID FROM META_MR_USERTYPE WHERE USER_ID = " + userId;
		if (!"".equals(typeId) && typeId.length() > 0) {
			sql += " AND TYPE_ID = " + typeId;
		}

		sql += ") and to_char(QL.qry_start_date,'yyyy-mm') = '" + today + "'";
		sql += " order by total_time desc)";
		if (pageNum >= 0) {
			sql += " WHERE ROWNUM <= " + pageNum;
		}
		sql += " order by total_time desc";
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryForList(sql);
	}

	public List<Map<String, Object>> getInputDetailM(Map<String, Object> data) {
		String userId = MapUtils.getString(data, "userId", "");
		if ("".equals(userId) && userId.length() <= 0) {
			HttpSession session = SessionManager.getCurrentSession();
			@SuppressWarnings("unchecked")
			Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
			userId = formatUser.get("userId").toString();
		}
		String typeId = MapUtils.getString(data, "jobType", "");
		String today = MapUtils.getString(data, "dateNo", "").replace("-", "");
		String sql = " select PARAM_VALUE,"
				+ " CASE WHEN REDUCE_OUTPUT_COUNT IS NULL THEN (CASE WHEN MAP_OUTPUT_COUNT IS NULL THEN 0 ELSE MAP_OUTPUT_COUNT END) ELSE REDUCE_OUTPUT_COUNT END INPUT_COUNT from("
				+ "  select JP.PARAM_VALUE,SUM(JL.MAP_INPUT_COUNT) MAP_INPUT_COUNT,SUM(JL.MAP_OUTPUT_COUNT) MAP_OUTPUT_COUNT,"
				+ "  SUM(JL.REDUCE_OUTPUT_COUNT) REDUCE_OUTPUT_COUNT,SUM(JL.REDUCE_INPUT_COUNT) REDUCE_INPUT_COUNT from mr_job_run_log jl"
				+ " inner join mr_job j on jl.job_id=j.job_id" + " inner join mr_job_param jp on j.job_id = jp.job_id"
				+ " inner join mr_data_source ds on j.output_data_source_id = ds.data_source_id"
				+ " inner join mr_source_type st on ds.source_type_id=st.source_type_id "
				+ " INNER JOIN meta_mr_type mt on j.job_type = mt.type_id"
				+ " where st.source_type = 'HBASE' and JP.PARAM_NAME = 'output.mr.maperd.hbase.table'"
				+ " and j.job_type in (select type_id from meta_mr_usertype where user_id = " + userId;
		if (!"".equals(typeId) && typeId.length() > 0) {
			sql += "AND TYPE_ID = " + typeId;
		}
		sql += ") and JL.MONTH_NO = '" + today + "'" + " GROUP BY JP.PARAM_VALUE)";

		return getDataAccess().queryForList(sql);
	}

	public Map<String, Object> getInputLineDetailM(Map<String, Object> data) {
		String userId = MapUtils.getString(data, "userId", "");
		if ("".equals(userId) && userId.length() <= 0) {
			HttpSession session = SessionManager.getCurrentSession();
			@SuppressWarnings("unchecked")
			Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
			userId = formatUser.get("userId").toString();
		}
		String today = MapUtils.getString(data, "dateNo", "");
		String typeId = MapUtils.getString(data, "jobType", "");
		String typeNameVar = MapUtils.getString(data, "typeName", "");
		SimpleDateFormat sdfm = new SimpleDateFormat("yyyy-MM");
		// int dateno=0;
		String yestoday = "";
		Calendar c = Calendar.getInstance();
		try {
			Date date = sdfm.parse(today);
			c.setTime(date);
			// datenonow = c.get(Calendar.YEAR)*100+c.get(Calendar.MONTH)*1;
			c.add(Calendar.YEAR, -1);
			yestoday = sdfm.format(c.getTime());
			// dateno = c.get(Calendar.YEAR)*100+c.get(Calendar.MONTH)*1;
		} catch (ParseException e) {
			e.printStackTrace();
		}
		String sql = " select mt.type_name,SUM(JL.MAP_INPUT_COUNT) MAP_INPUT_COUNT,SUM(JL.MAP_OUTPUT_COUNT) MAP_OUTPUT_COUNT,"
				+ "SUM(JL.REDUCE_OUTPUT_COUNT) REDUCE_OUTPUT_COUNT,SUM(JL.REDUCE_INPUT_COUNT) REDUCE_INPUT_COUNT,JL.MONTH_NO DATA_NO from mr_job_run_log jl"
				+ " inner join mr_job j on jl.job_id=j.job_id"
				+ " inner join mr_job_param jp on j.job_id = jp.job_id"
				+ " inner join mr_data_source ds on j.output_data_source_id = ds.data_source_id"
				+ " inner join mr_source_type st on ds.source_type_id=st.source_type_id "
				+ " INNER JOIN meta_mr_type mt on j.job_type = mt.type_id"
				+ " where st.source_type = 'HBASE' and JP.PARAM_NAME = 'output.mr.maperd.hbase.table'"
				+ " and j.job_type in (select type_id from meta_mr_usertype where user_id = " + userId;
		if (!"".equals(typeId) && typeId.length() > 0) {
			sql += "AND TYPE_ID = " + typeId;
		}
		sql += ") and to_char(jl.start_date,'yyyy-mm') <= '" + today + "' and to_char(jl.start_date,'yyyy-mm') > '"
				+ yestoday + "' " + " GROUP BY JL.MONTH_NO,mt.type_name  order by JL.MONTH_NO desc";
		List<Map<String, Object>> list = getDataAccess().queryForList(sql);
		Map<String, Map<String, Object>> maps = new HashMap<String, Map<String, Object>>();
		List<String> typeNames = new ArrayList<String>();
		for (Map<String, Object> map : list) {
			if (maps.containsKey(map.get("TYPE_NAME").toString())) {
				if (map.get("REDUCE_INPUT_COUNT") != null && !map.get("REDUCE_INPUT_COUNT").toString().equals("")) {
					maps.get(map.get("TYPE_NAME").toString()).put(map.get("DATA_NO").toString(),
							map.get("REDUCE_INPUT_COUNT").toString());
				} else {
					maps.get(map.get("TYPE_NAME").toString()).put(map.get("DATA_NO").toString(),
							map.get("MAP_INPUT_COUNT").toString());
				}
			} else {
				maps.put(map.get("TYPE_NAME").toString(), new HashMap<String, Object>());
				if (map.get("REDUCE_INPUT_COUNT") != null && !map.get("REDUCE_INPUT_COUNT").toString().equals("")) {
					maps.get(map.get("TYPE_NAME").toString()).put(map.get("DATA_NO").toString(),
							map.get("REDUCE_INPUT_COUNT").toString());
				} else {
					maps.get(map.get("TYPE_NAME").toString()).put(map.get("DATA_NO").toString(),
							map.get("MAP_INPUT_COUNT").toString());
				}
				typeNames.add(map.get("TYPE_NAME").toString());
			}
		}

		Date dateMonth = DateUtil.getDateTimeByString(today, "yyyyMM");
		Calendar ca = Calendar.getInstance();
		ca.setTime(dateMonth);
		// 数据
		String[] datas = new String[12];
		SimpleDateFormat sf = new SimpleDateFormat("yyyyMM");
		// 刻度
		String datanos = "";
		// c.add(Calendar.MONTH, 1);
		// while (dateno<=datenonow) {
		for (int k = 0; k < 12; k++) {
			String dateno = sf.format(ca.getTime());
			// c.add(Calendar.MONTH, 1);
			// dateno = c.get(Calendar.YEAR)*100+c.get(Calendar.MONTH);
			datanos += dateno + "|";
			if (maps.size() > 0 && maps.get(typeNameVar).containsKey(dateno)) {
				String temp = MapUtils.getString(maps.get(typeNameVar), dateno, "0");
				if ("".equals(temp)) {
					temp = "0";
				}
				datas[k] = temp + "|";
			} else {
				datas[k] = "0|";
			}
			ca.add(Calendar.MONTH, -1);
			// for (String typeName : typeNames) {
			// if(maps.get(typeName).containsKey(dateno+"")){
			// datas[typeNames.indexOf(typeName)] =
			// (datas[typeNames.indexOf(typeName)]==null?"":datas[typeNames.indexOf(typeName)]+
			// maps.get(typeName).get(dateno+"").toString())+"|";
			// }else{
			// datas[typeNames.indexOf(typeName)] =
			// (datas[typeNames.indexOf(typeName)]==null?"":datas[typeNames.indexOf(typeName)])+
			// "0|";
			// }
			// }
		}
		for (int i = 0; i < datas.length; i++) {
			datas[i] = datas[i].substring(0, datas[i].length() - 1);
		}
		datanos = datanos.substring(0, datanos.length() - 1);
		String[] arrDatanos = datanos.split("\\|");

		Map<String, Object> returnData = new HashMap<String, Object>();
		returnData.put("typeNames", typeNames);
		returnData.put("datanos", invertArray(arrDatanos));
		returnData.put("datas", invertArray(datas));
		returnData.put("typeName", typeNameVar);
		returnData.put("jobType", typeId);

		return returnData;
	}

	public Map<String, Object> getLogAnalysisLineTopM(Map<String, Object> data) {
		String userId = MapUtils.getString(data, "userId", "");
		if ("".equals(userId) && userId.length() <= 0) {
			HttpSession session = SessionManager.getCurrentSession();
			@SuppressWarnings("unchecked")
			Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
			userId = formatUser.get("userId").toString();
		}
		String today = MapUtils.getString(data, "dateNo", "");
		String typeId = MapUtils.getString(data, "jobType", "");
		String typeNameVar = MapUtils.getString(data, "typeName", "");
		SimpleDateFormat sdfm = new SimpleDateFormat("yyyy-MM");
		// int datenonow=0;
		// int dateno=0;
		String yestoday = "";
		Calendar c = Calendar.getInstance();
		try {
			Date date = sdfm.parse(today);
			c.setTime(date);
			// datenonow = c.get(Calendar.YEAR)*100+c.get(Calendar.MONTH)*1;
			c.add(Calendar.YEAR, -1);
			yestoday = sdfm.format(c.getTime());
			// dateno = c.get(Calendar.YEAR)*100+c.get(Calendar.MONTH)*1;
		} catch (ParseException e) {
			e.printStackTrace();
		}
		String sql = " select count(*) SEARCH_COUNT, mt.type_name,to_char(ql.qry_start_date,'yyyymm') DATA_NO"
				+ " from HB_USER_QRY_LOG QL " + " INNER JOIN HB_QRY_RULE QR "
				+ " INNER JOIN meta_mr_type mt on qr.depart_type = mt.type_id "
				+ " ON QL.QRY_RULE_ID = QR.QRY_RULE_ID "
				+ " where qr.depart_type in (select type_id from meta_mr_usertype where user_id = " + userId;
		if (!"".equals(typeId) && typeId.length() > 0) {
			sql += " AND TYPE_ID = " + typeId;
		}
		sql += ") and to_char(QL.qry_start_date,'yyyy-mm') <= '" + today
				+ "' and to_char(QL.qry_start_date,'yyyy-mm') > '" + yestoday + "' "
				+ " group by mt.type_name,to_char(ql.qry_start_date,'yyyymm') "
				+ " order by to_char(ql.qry_start_date,'yyyymm')";
		List<Map<String, Object>> list = getDataAccess().queryForList(sql);
		Map<String, Map<String, Object>> maps = new HashMap<String, Map<String, Object>>();
		List<String> typeNames = new ArrayList<String>();
		for (Map<String, Object> map : list) {
			if (maps.containsKey(map.get("TYPE_NAME").toString())) {
				maps.get(map.get("TYPE_NAME").toString()).put(map.get("DATA_NO").toString(),
						map.get("SEARCH_COUNT").toString());
			} else {
				maps.put(map.get("TYPE_NAME").toString(), new HashMap<String, Object>());
				maps.get(map.get("TYPE_NAME").toString()).put(map.get("DATA_NO").toString(),
						map.get("SEARCH_COUNT").toString());
				typeNames.add(map.get("TYPE_NAME").toString());
			}
		}
		Calendar ca = Calendar.getInstance();
		// 数据
		String[] datas = new String[12];
		SimpleDateFormat sf = new SimpleDateFormat("yyyyMM");
		// 刻度
		String datanos = "";
		// c.add(Calendar.MONTH, 1);
		// while (dateno<=datenonow) {
		for (int k = 0; k < 12; k++) {
			String dateno = sf.format(ca.getTime());
			// c.add(Calendar.MONTH, 1);
			// dateno = c.get(Calendar.YEAR)*100+c.get(Calendar.MONTH);
			datanos += dateno + "|";
			if (maps.size() > 0 && maps.get(typeNameVar).containsKey(dateno)) {
				String temp = MapUtils.getString(maps.get(typeNameVar), dateno, "0");
				if ("".equals(temp)) {
					temp = "0";
				}
				datas[k] = temp + "|";
			} else {
				datas[k] = "0|";
			}
			ca.add(Calendar.MONTH, -1);
			// for (String typeName : typeNames) {
			// if(maps.get(typeName).containsKey(dateno+"")){
			// datas[typeNames.indexOf(typeName)] =
			// (datas[typeNames.indexOf(typeName)]==null?"":datas[typeNames.indexOf(typeName)]+
			// maps.get(typeName).get(dateno+"").toString())+"|";
			// }else{
			// datas[typeNames.indexOf(typeName)] =
			// (datas[typeNames.indexOf(typeName)]==null?"":datas[typeNames.indexOf(typeName)])+
			// "0|";
			// }
			// }
		}
		for (int i = 0; i < datas.length; i++) {
			datas[i] = datas[i].substring(0, datas[i].length() - 1);
		}
		datanos = datanos.substring(0, datanos.length() - 1);
		String[] arrDatanos = datanos.split("\\|");

		Map<String, Object> returnData = new HashMap<String, Object>();
		returnData.put("typeNames", typeNames);
		returnData.put("datanos", invertArray(arrDatanos));
		returnData.put("datas", invertArray(datas));
		returnData.put("typeName", typeNameVar);
		returnData.put("jobType", typeId);

		return returnData;
	}

	/**
	 * 获得一项指标值
	 * 
	 * @param mapData
	 * @return
	 */
	public List<Map<String, Object>> queryForRsList(Map<String, Object> mapData) {
		String checkDate = MapUtils.getString(mapData, "CHECK_DATE");
		int jobType = MapUtils.getIntValue(mapData, "JOB_TYPE");
		String rsId = MapUtils.getString(mapData, "RS_ID");
		String sql = "";
		String whereToday = " and to_char(QRY_START_DATE,'yyyy-mm-dd')='" + checkDate + "'";

		if ("LA001".equals(rsId)) {// 调用次数
			sql = "SELECT TO_CHAR(QL.QRY_START_DATE,'HH24') ||':00' AS T_HOUR,COUNT(*) AS T_COUNT FROM HB_USER_QRY_LOG QL "
					+ "INNER JOIN HB_QRY_RULE QR ON QL.QRY_RULE_ID = QR.QRY_RULE_ID WHERE QR.DEPART_TYPE = " + jobType;
			if (!"".equals(checkDate) && checkDate.length() > 0) {
				sql += whereToday;
			}
			sql += " GROUP BY TO_CHAR(QL.QRY_START_DATE, 'HH24')";
		} else if ("LA002".equals(rsId)) {
			sql = "SELECT TO_CHAR(QL.QRY_START_DATE, 'HH24') ||':00' AS T_HOUR,COUNT(*) AS T_COUNT FROM HB_USER_QRY_LOG QL "
					+ "INNER JOIN HB_QRY_RULE QR ON QL.QRY_RULE_ID = QR.QRY_RULE_ID WHERE QL.TOTAL_TIME < 5001 AND QR.DEPART_TYPE = "
					+ jobType;
			if (!"".equals(checkDate) && checkDate.length() > 0) {
				sql += whereToday;
			}
			sql += " GROUP BY TO_CHAR(QL.QRY_START_DATE, 'HH24')";
		} else if ("LA003".equals(rsId)) { // 快查询占比
			sql = "select TO_CHAR(QL.QRY_START_DATE, 'HH24') ||':00' AS T_HOUR, "
					+ "CASE WHEN COUNT(*)=0 THEN 0 ELSE round(sum(CASE WHEN QL.TOTAL_TIME < 5001 THEN  1 ELSE 0 END) / COUNT(*),2)*100 END AS T_COUNT "
					+ "from HB_USER_QRY_LOG ql "
					+ " inner join Hb_Qry_Rule qr on ql.qry_rule_id = qr.qry_rule_id where qr.depart_type = " + jobType;

			if (!"".equals(checkDate) && checkDate.length() > 0) {
				sql += whereToday;
			}
			sql += " GROUP BY TO_CHAR(QL.QRY_START_DATE, 'HH24')";
		} else if ("LA004".equals(rsId)) { // 慢查询占比
			sql = "select TO_CHAR(QL.QRY_START_DATE, 'HH24') ||':00' AS T_HOUR, "
					+ "CASE WHEN COUNT(*)=0 THEN 0 ELSE round(sum(CASE WHEN (QL.TOTAL_TIME > 5000 or QL.TOTAL_TIME <= 0) THEN  1 ELSE 0 END) / COUNT(*),2)*100 END AS T_COUNT "
					+ "from HB_USER_QRY_LOG ql "
					+ " inner join Hb_Qry_Rule qr on ql.qry_rule_id = qr.qry_rule_id where qr.depart_type = " + jobType;

			if (!"".equals(checkDate) && checkDate.length() > 0) {
				sql += whereToday;
			}
			sql += " GROUP BY TO_CHAR(QL.QRY_START_DATE, 'HH24')";
		} else if ("LA005".equals(rsId)) { // 平均调用时长
			sql = "SELECT TO_CHAR(QL.QRY_START_DATE, 'HH24') ||':00' AS T_HOUR, "
					+ "CASE WHEN COUNT(*)=0 THEN 0 ELSE round(sum(CASE  WHEN QL.TOTAL_TIME <= 0 THEN   0    ELSE QL.TOTAL_TIME  END)/COUNT(*)/1000,2)  END AS T_COUNT "
					+ "FROM HB_USER_QRY_LOG QL "
					+ " INNER JOIN HB_QRY_RULE QR ON QL.QRY_RULE_ID = QR.QRY_RULE_ID WHERE QR.DEPART_TYPE = " + jobType;

			if (!"".equals(checkDate) && checkDate.length() > 0) {
				sql += whereToday;
			}
			sql += " GROUP BY TO_CHAR(QL.QRY_START_DATE, 'HH24')";
		} else if ("LA006".equals(rsId)) {// 查询最大耗时间
			sql = "SELECT TO_CHAR(QL.QRY_START_DATE, 'HH24') ||':00' AS T_HOUR, "
					+ " round((MAX(QL.TOTAL_TIME)/ 1000),2) AS T_COUNT " + "FROM HB_USER_QRY_LOG QL "
					+ " INNER JOIN HB_QRY_RULE QR ON QL.QRY_RULE_ID = QR.QRY_RULE_ID WHERE QR.DEPART_TYPE = " + jobType;

			if (!"".equals(checkDate) && checkDate.length() > 0) {
				sql += whereToday;
			}
			sql += " GROUP BY TO_CHAR(QL.QRY_START_DATE, 'HH24')";
		} else if ("LA007".equals(rsId)) {// 最大并发数
			sql = "SELECT NVL(MAX(K.T_COUNT),0) AS T_COUNT, TO_CHAR(K.HOUR, 'HH24') ||':00' AS T_HOUR FROM("
					+ "SELECT COUNT(*) AS T_COUNT,QL.QRY_START_DATE AS HOUR FROM "
					+ "HB_USER_QRY_LOG QL INNER JOIN HB_QRY_RULE QR ON QL.QRY_RULE_ID"
					+ " = QR.QRY_RULE_ID WHERE QR.DEPART_TYPE =  " + jobType;
			if (!"".equals(checkDate) && checkDate.length() > 0) {
				sql += whereToday;
			}
			sql += " GROUP BY QL.QRY_START_DATE)K GROUP BY TO_CHAR(K.HOUR, 'HH24')";
		} else if ("LA008".equals(rsId)) {// 平均并发数
			sql = "SELECT TO_CHAR(K.HOUR,'HH24') ||':00' AS T_HOUR, round(AVG(K.COUNT),0) AS T_COUNT FROM"
					+ "(SELECT COUNT(*) COUNT,QL.QRY_START_DATE HOUR  FROM HB_USER_QRY_LOG QL "
					+ "INNER JOIN HB_QRY_RULE QR ON QL.QRY_RULE_ID = QR.QRY_RULE_ID WHERE QR.DEPART_TYPE = " + jobType;
			if (!"".equals(checkDate) && checkDate.length() > 0) {
				sql += whereToday;
			}
			sql += "GROUP BY QRY_START_DATE)K GROUP BY TO_CHAR(K.HOUR,'HH24')";
		}
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 获得一项指标30天分布值
	 * 
	 * @param mapData
	 * @return
	 */
	public List<Map<String, Object>> queryForRsMList(Map<String, Object> mapData) {
		String checkDate = MapUtils.getString(mapData, "CHECK_DATE");
		int jobType = MapUtils.getIntValue(mapData, "JOB_TYPE");
		String rsId = MapUtils.getString(mapData, "RS_ID");
		String sql = "";
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM");
		SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMM");
		String today = "";
		try {
			today = sdf1.format(sdf.parse(checkDate));
		} catch (Exception ex) {
			ex.printStackTrace();
		}

		if ("LA001".equals(rsId)) {
			sql = "SELECT SUM(A.QRY_COUNT) AS T_COUNT,A.QRY_YEAR_MONTH_DAY AS T_HOUR"
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B "
					+ " WHERE A.QRY_RULE_ID=B.QRY_RULE_ID AND B.DEPART_TYPE = " + jobType + " and A.QRY_YEAR_MONTH ='"
					+ today + "'" + " GROUP BY A.QRY_YEAR_MONTH_DAY";
		} else if ("LA002".equals(rsId)) {
			sql = "SELECT SUM(A.QRY_QUICK_COUNT) AS T_COUNT,A.QRY_YEAR_MONTH_DAY AS T_HOUR "
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B "
					+ " WHERE A.QRY_RULE_ID=B.QRY_RULE_ID AND B.DEPART_TYPE = " + jobType + " and A.QRY_YEAR_MONTH ='"
					+ today + "'" + " GROUP BY A.QRY_YEAR_MONTH_DAY";
		} else if ("LA003".equals(rsId)) {
			sql = "SELECT round(SUM(CASE  WHEN A.QRY_QUICK_COUNT is null THEN 0 ELSE A.QRY_QUICK_COUNT END) / sum(A.QRY_COUNT),2)*100 AS T_COUNT, A.QRY_YEAR_MONTH_DAY AS T_HOUR "
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B "
					+ " WHERE A.QRY_RULE_ID=B.QRY_RULE_ID AND B.DEPART_TYPE = "
					+ jobType
					+ " and A.QRY_YEAR_MONTH ='"
					+ today + "'" + " GROUP BY A.QRY_YEAR_MONTH_DAY";
		} else if ("LA004".equals(rsId)) {
			sql = "SELECT round((sum(A.QRY_COUNT)-SUM(CASE  WHEN A.QRY_QUICK_COUNT is null THEN    0  ELSE   A.QRY_QUICK_COUNT  END)) / sum(A.QRY_COUNT),2)*100 AS T_COUNT, A.QRY_YEAR_MONTH_DAY AS T_HOUR "
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B "
					+ " WHERE A.QRY_RULE_ID=B.QRY_RULE_ID AND B.DEPART_TYPE = "
					+ jobType
					+ " and A.QRY_YEAR_MONTH ='"
					+ today + "'" + " GROUP BY A.QRY_YEAR_MONTH_DAY";
		} else if ("LA005".equals(rsId)) {
			sql = "SELECT round(sum(A.QRY_AVG_TOTAL_TIME)/count(*)/1000,2) AS T_COUNT, A.QRY_YEAR_MONTH_DAY AS T_HOUR "
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B "
					+ " WHERE A.QRY_RULE_ID=B.QRY_RULE_ID AND B.DEPART_TYPE = " + jobType + " and A.QRY_YEAR_MONTH ='"
					+ today + "'" + " GROUP BY A.QRY_YEAR_MONTH_DAY";
		} else if ("LA006".equals(rsId)) {
			sql = "SELECT round(max(A.QRY_PER_MAX_TIME)/1000,2) AS T_COUNT, A.QRY_YEAR_MONTH_DAY AS T_HOUR "
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B "
					+ " WHERE A.QRY_RULE_ID=B.QRY_RULE_ID AND B.DEPART_TYPE = " + jobType + " and A.QRY_YEAR_MONTH ='"
					+ today + "'" + " GROUP BY A.QRY_YEAR_MONTH_DAY";
		} else if ("LA007".equals(rsId)) {
			sql = "SELECT case when max(A.QRY_CONCURRENCE_MAX) is null then 0 else max(A.QRY_CONCURRENCE_MAX) end  AS T_COUNT, A.QRY_YEAR_MONTH_DAY AS T_HOUR"
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B "
					+ " WHERE A.QRY_RULE_ID=B.QRY_RULE_ID AND B.DEPART_TYPE = "
					+ jobType
					+ " and A.QRY_YEAR_MONTH ='"
					+ today + "'" + " GROUP BY A.QRY_YEAR_MONTH_DAY";
		} else if ("LA008".equals(rsId)) {
			sql = "SELECT round(sum(case when A.QRY_CONCURRENCE_AVG is null then 0 else A.QRY_CONCURRENCE_AVG end)/count(*),0) AS T_COUNT, A.QRY_YEAR_MONTH_DAY AS T_HOUR "
					+ " FROM HB_STATISTICS_LOG A, HB_QRY_RULE B "
					+ " WHERE A.QRY_RULE_ID=B.QRY_RULE_ID AND B.DEPART_TYPE = "
					+ jobType
					+ " and A.QRY_YEAR_MONTH ='"
					+ today + "'" + " GROUP BY A.QRY_YEAR_MONTH_DAY";
		}
		return getDataAccess().queryForList(sql);
	}

}
