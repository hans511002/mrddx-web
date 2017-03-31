package com.ery.meta.module.bigdata.mrddx.log;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

import com.ery.base.support.utils.MapUtils;

/**

 * 

 * @description
 * @date 2013-04-22
 */
public class JobLogDAO extends MetaBaseDAO {
	/**
	 * 查询运行Job日志表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryJobLog(Map<String, Object> data, Page page) {
		String columnSort = MapUtils.getString(data, "_COLUMN_SORT");

		String jobName = MapUtils.getString(data, "JOB_NAME");
		String startDate = MapUtils.getString(data, "START_DATE");
		String runFlag = MapUtils.getString(data, "runFlag");// 传递的参数
		String sql = "SELECT  A.JOB_NAME,B.LOG_ID,B.JOB_ID,B.MONTH_NO,B.DATA_NO,B.START_DATE,B.END_DATE,B.RUN_FLAG,B.ROW_RECORD,B.ALL_FILE_SIZE,B.EXEC_CMD,B.LOG_MSG, CASE B.RUN_FLAG WHEN 1 THEN '成功' ELSE '失败' END AS RUN_FLAG_NAME,(SELECT TO_CHAR((SUM(CASE C.RUN_FLAG WHEN  2 THEN 0 ELSE 1 END) / COUNT(*) * 100), 'FM99999990.00') || '%'  FROM MR_JOB_MAP_RUN_LOG C WHERE B.LOG_ID = C.LOG_ID  ) AS MAPRATE,(SELECT TO_CHAR((SUM(CASE D.RUN_FLAG WHEN  2 THEN 0 ELSE 1 END) / COUNT(*) * 100), 'FM99999990.00') || '%' AS REDUCERATE  FROM  MR_JOB_REDUCE_RUN_LOG D WHERE B.LOG_ID = D.LOG_ID ) AS REDUCERATE FROM MR_JOB A ,MR_JOB_RUN_LOG B  WHERE A.JOB_ID = B.JOB_ID";
		if (!jobName.isEmpty()) {
			jobName = jobName.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += " AND A.JOB_NAME LIKE " + "'" + "%" + jobName + "%" + "' ESCAPE '/'";
		}
		if (!startDate.isEmpty()) {
			String dateNo = startDate.replace("-", "");
			sql += " AND B.DATA_NO LIKE " + "'" + "%" + dateNo + "%" + "'";
		}
		if (!runFlag.isEmpty()) {
			if (runFlag.equals("1") || runFlag.equals("2")) {
				sql += " AND B.RUN_FLAG like " + "'" + "%" + runFlag + "%" + "'";
			}
		}
		// sql += " ORDER BY A.JOB_ID ";
		if (columnSort != null && !"".equals(columnSort)) {
			sql += " ORDER BY A." + columnSort;
		} else {
			sql += " ORDER BY A.JOB_ID ";
		}

		List<Object> param = new ArrayList<Object>();
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 查询运行Job详细日志表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryJobMsgLog(Map<String, Object> data, Page page) {
		long logId = MapUtils.getLongValue(data, "LOG_ID", -1);
		long jobId = MapUtils.getLongValue(data, "JOB_ID", -1);
		String sql = "SELECT T.LOG_ID,to_char(T.LOG_TIME,'YYYY-MM-DD HH24:MI:SS') AS LOG_TIME,T.LOG_TYPE,T.LOG_INFO,CASE T.LOG_TYPE WHEN 1 THEN 'DEBUG' WHEN 2 THEN 'INFO'WHEN 3 THEN 'WARN' WHEN 4 THEN 'ERROR' ELSE 'EXECEPTION' END AS LOG_TYPE_NAME FROM MR_JOB_RUN_LOG_MSG T WHERE 1=1";
		if (logId != -1) {
			sql += " AND T.LOG_ID = " + logId;
		}
		if (jobId != -1) {
			sql += " AND T.LOG_ID IN (SELECT LOG_ID FROM MR_JOB_RUN_LOG WHERE JOB_ID =" + jobId + ")";
		}
		sql += " ORDER BY T.LOG_TIME DESC ";
		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}

		return getDataAccess().queryForList(sql);
	}

	/**
	 * 查询Map日志表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryMapLog(Map<String, Object> data, Page page) {
		String logId = MapUtils.getString(data, "LOG_ID");
		String logId2 = MapUtils.getString(data, "LOG_ID2");// 传递的参数
		String runFlag = MapUtils.getString(data, "runFlag");// 传递的参数
		String sql = "SELECT T.LOG_ID,T.MAP_TASK_ID,T.MAP_INPUT_COUNT,T.MAP_OUTPUT_COUNT,T.START_DATE,T.END_DATE,T.RUN_FLAG,T.LOG_MSG, CASE T.RUN_FLAG WHEN 1 THEN '成功' ELSE '失败' END AS RUN_FLAG_NAME FROM MR_JOB_MAP_RUN_LOG T WHERE 1 = 1 ";
		if (!logId.isEmpty()) {
			sql += " AND T.LOG_ID like " + "'" + "%" + logId + "%" + "'";
		} else {
			sql += " AND T.LOG_ID like " + "'" + "%" + logId2 + "%" + "'";
		}
		if (!runFlag.isEmpty()) {
			if (runFlag.equals("1") || runFlag.equals("2")) {
				sql += " AND T.RUN_FLAG like " + "'" + "%" + runFlag + "%" + "'";
			}
		}

		sql += " ORDER BY T.LOG_ID ";
		List<Object> param = new ArrayList<Object>();
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 查询Map详细日志表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryMapMsgLog(Map<String, Object> data, Page page) {
		String mapTaskId = MapUtils.getString(data, "MAP_TASK_ID");
		String mapTaskId2 = MapUtils.getString(data, "MAP_TASK_ID2");// 传递参数
		String sql = "SELECT T.LOG_ID,T.MAP_TASK_ID,T.LOG_DATE,T.LOG_TYPE,T.LOG_MSG,CASE T.LOG_TYPE WHEN 1 THEN 'DEBUG' WHEN 2 THEN 'INFO'WHEN 3 THEN 'WARN' WHEN 4 THEN 'ERROR' ELSE 'EXECEPTION' END AS LOG_TYPE_NAME FROM MR_JOB_MAP_RUN_LOG_MSG T WHERE 1=1";
		if (!mapTaskId.isEmpty()) {
			sql += " AND T.MAP_TASK_ID like " + "'" + "%" + mapTaskId + "%" + "'";
		} else {
			sql += " AND T.MAP_TASK_ID like " + "'" + "%" + mapTaskId2 + "%" + "'";
		}
		sql += " ORDER BY T.LOG_ID ";
		List<Object> param = new ArrayList<Object>();
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 查询Reduce日志表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryReduceLog(Map<String, Object> data, Page page) {
		String logId = MapUtils.getString(data, "LOG_ID");
		String logId2 = MapUtils.getString(data, "LOG_ID2");// 传递的参数
		String runFlag = MapUtils.getString(data, "runFlag");// 传递的参数
		String sql = "SELECT T.LOG_ID,T.REDUCE_TASK_ID,T.REDUCE_INPUT_COUNT,T.REDUCE_OUTPUT_COUNT,T.START_DATE,T.END_DATE,T.RUN_FLAG,T.LOG_MSG, CASE T.RUN_FLAG WHEN 1 THEN '成功' ELSE '失败' END AS RUN_FLAG_NAME FROM MR_JOB_REDUCE_RUN_LOG T WHERE 1 = 1 ";
		if (!logId.isEmpty()) {
			sql += " AND T.LOG_ID like " + "'" + "%" + logId + "%" + "'";
		} else {
			sql += " AND T.LOG_ID like " + "'" + "%" + logId2 + "%" + "'";
		}
		if (!runFlag.isEmpty()) {
			if (runFlag.equals("1") || runFlag.equals("2")) {
				sql += " AND T.RUN_FLAG like " + "'" + "%" + runFlag + "%" + "'";
			}
		}

		sql += " ORDER BY T.LOG_ID ";
		List<Object> param = new ArrayList<Object>();
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 查询Reduce详细日志表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryReduceMsgLog(Map<String, Object> data, Page page) {
		String reduceTaskId = MapUtils.getString(data, "REDUCE_TASK_ID");
		String reduceTaskId2 = MapUtils.getString(data, "REDUCE_TASK_ID2");// 传递参数
		String sql = "SELECT T.LOG_ID,T.REDUCE_TASK_ID,T.LOG_DATE,T.LOG_TYPE,T.LOG_MSG,CASE T.LOG_TYPE WHEN 1 THEN 'DEBUG' WHEN 2 THEN 'INFO'WHEN 3 THEN 'WARN' WHEN 4 THEN 'ERROR' ELSE 'EXECEPTION' END AS LOG_TYPE_NAME FROM MR_JOB_REDUCE_RUN_LOG_MSG T WHERE 1=1";
		if (!reduceTaskId.isEmpty()) {
			sql += " AND T.REDUCE_TASK_ID like " + "'" + "%" + reduceTaskId + "%" + "'";
		} else {
			sql += " AND T.REDUCE_TASK_ID like " + "'" + "%" + reduceTaskId2 + "%" + "'";
		}

		sql += " ORDER BY T.LOG_ID ";
		List<Object> param = new ArrayList<Object>();
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 通过logId获取Job日志
	 * 
	 * @param logId
	 * @return
	 */
	public List<Map<String, Object>> getJobLog(String logId) {
		String sql = "SELECT * FROM MR_JOB_RUN_LOG  T WHERE T.LOG_ID = ?";
		return getDataAccess().queryForList(sql, logId);
	}

	/**
	 * 通过logId获取Job日志
	 * 
	 * @param logId
	 * @return
	 */
	public List<Map<String, Object>> getJobLog(long logId) {
		String sql = "SELECT * FROM MR_JOB_RUN_LOG  T WHERE T.LOG_ID = ?";
		return getDataAccess().queryForList(sql, logId);
	}

	/**
	 * 通过logId获取Job日志详细信息
	 * 
	 * @param logId
	 * @return
	 */
	public List<Map<String, Object>> getJobLogMsg(String logId) {
		String sql = "SELECT * FROM MR_JOB_RUN_LOG_MSG  T WHERE T.LOG_ID = ?";
		return getDataAccess().queryForList(sql, logId);
	}

	/**
	 * 通过logId获取Map日志
	 * 
	 * @param logId
	 * @return
	 */
	public List<Map<String, Object>> getMapLog(String logId) {
		String sql = "SELECT * FROM MR_JOB_MAP_RUN_LOG  T WHERE T.LOG_ID = ?";
		return getDataAccess().queryForList(sql, logId);
	}

	/**
	 * 通过mapTaskId获取Map日志详细信息
	 * 
	 * @param mapTaskId
	 * @return
	 */
	public List<Map<String, Object>> getMapLogMsg(String mapTaskId) {
		String sql = "SELECT * FROM MR_JOB_MAP_RUN_LOG_MSG  T WHERE T.MAP_TASK_ID = ?";
		return getDataAccess().queryForList(sql, mapTaskId);
	}

	/**
	 * 通过logId获取Reduce日志
	 * 
	 * @param logId
	 * @return
	 */
	public List<Map<String, Object>> getReduceLog(String logId) {
		String sql = "SELECT * FROM MR_JOB_REDUCE_RUN_LOG  T WHERE T.LOG_ID = ?";
		return getDataAccess().queryForList(sql, logId);
	}

	/**
	 * 通过reduceTaskId获取Reduce日志详细信息
	 * 
	 * @param reduceTaskId
	 * @return
	 */
	public List<Map<String, Object>> getReduceLogMsg(String reduceTaskId) {
		String sql = "SELECT * FROM MR_JOB_REDUCE_RUN_LOG_MSG  T WHERE T.REDUCE_TASK_ID = ?";
		return getDataAccess().queryForList(sql, reduceTaskId);
	}
}
