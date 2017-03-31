package com.ery.meta.module.bigdata.mrddx.config;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.web.session.SessionManager;

import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.base.support.jdbc.BinaryStream;
import com.ery.base.support.jdbc.IParamsSetter;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**

 * 

 * @description
 * @date 2013-04-22 -
 * @modify
 * @modifyDate -
 */
public class JobDAO extends MetaBaseDAO {

	/**
	 * 查询数据源参数表--无 分页：根据数据源ID
	 * 
	 * @return
	 */
	public List<Map<String, Object>> queryDataSourceParam(Map<String, Object> data) {
		long dataSourceId = Convert.toLong(data.get("DATA_SOURCE_ID"), -999);
		String sql = "SELECT a.DATA_SOURCE_ID,a.PARAM_NAME,b.PARAM_VALUE,a.PARAM_DESC FROM "
				+ "(SELECT A.SOURCE_PARAM_NAME AS PARAM_NAME, A.SOURCE_DESC PARAM_DESC, B.DATA_SOURCE_ID DATA_SOURCE_ID,A.ORDER_ID "
				+ "FROM MR_DATA_SOURCE_PARAM_DEFAULT A, MR_DATA_SOURCE B, MR_SOURCE_TYPE C "
				+ "WHERE B.SOURCE_TYPE_ID = C.SOURCE_TYPE_ID AND C.SOURCE_DB_TYPE=A.SOURCE_DB_TYPE AND B.DATA_SOURCE_ID = ?) a, "
				+ "(SELECT B.DATA_SOURCE_ID, B.PARAM_NAME, B.PARAM_VALUE, B.PARAM_DESC "
				+ "FROM MR_DATA_SOURCE A, MR_DATA_SOURCE_PARAM B "
				+ "WHERE A.DATA_SOURCE_ID = B.DATA_SOURCE_ID AND B.DATA_SOURCE_ID = ?) b "
				+ "Where a.PARAM_NAME = b.PARAM_NAME(+)" + " ORDER BY A.ORDER_ID";
		List<Object> param = new ArrayList<Object>();
		param.add(dataSourceId);
		param.add(dataSourceId);
		return getDataAccess().queryForList(sql, param.toArray());
	}

	/**
	 * 查询源类型参数表--无分页：根据数据源ID + 源类型ID
	 * 
	 * @return
	 */
	public List<Map<String, Object>> querySourceParam(Map<String, Object> data) {
		int inputOrOutput = Convert.toInt(data.get("inputOrOutput"), 0);
		long dataSourceId = Convert.toLong(data.get("DATA_SOURCE_ID"), -999);
		int sourceTypeId = Convert.toInt(data.get("SOURCE_TYPE_ID"), 0);
		long jobId = Convert.toLong(data.get("jobId"), 0);
		String sql = "SELECT A.DATA_SOURCE_ID,A.DATA_SOURCE_NAME,A.SOURCE_TYPE_ID,B.IS_MUST,B.INPUT_OR_OUTPUT,"
				+ "B.PARAM_NAME," + (jobId != 0 ? "NVL(C.PARAM_VALUE,B.DEFAULT_VALUE)" : "B.DEFAULT_VALUE")
				+ " DEFAULT_VALUE,B.PARAM_DESC "
				+ "FROM MR_SOURCE_PARAM B INNER JOIN MR_DATA_SOURCE A ON A.SOURCE_TYPE_ID = B.SOURCE_TYPE_ID ";
		if (jobId != 0) {
			sql += " LEFT JOIN MR_JOB_PARAM C ON B.PARAM_NAME = C.PARAM_NAME AND C.JOB_ID=" + jobId;
		}
		sql += " WHERE 1=1 ";
		if (dataSourceId != -999) {
			sql += " AND A.DATA_SOURCE_ID = " + dataSourceId;
		}
		if (sourceTypeId != 0) {
			sql += " AND A.SOURCE_TYPE_ID = " + sourceTypeId;
		}
		if (inputOrOutput != 0) {
			sql += " AND B.INPUT_OR_OUTPUT = " + inputOrOutput;
		}
		sql += " ORDER BY B.ORDER_ID";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 查询系统参数表信息--无分页
	 * 
	 * @return
	 */
	public List<Map<String, Object>> querySystemParam(Map<String, Object> data) {
		long jobId = Convert.toLong(data.get("jobId"), 0);
		String sql = "SELECT T.PARAM_NAME," + (jobId != 0 ? "NVL(A.PARAM_VALUE,T.DEFAULT_VALUE)" : "T.DEFAULT_VALUE")
				+ " DEFAULT_VALUE,T.IS_MUST, T.PARAM_DESC FROM MR_SYSTEM_PARAM T ";
		if (jobId != 0) {
			sql += " LEFT JOIN MR_JOB_PARAM A ON T.PARAM_NAME = A.PARAM_NAME AND A.JOB_ID=" + jobId;
		}
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 查询源类型名称
	 * 
	 * @return
	 */
	public List<Map<String, Object>> querySourceType() {
		String sql = "SELECT T.SOURCE_TYPE_ID, T.SOURCE_NAME  FROM MR_SOURCE_TYPE T ORDER BY T.SOURCE_TYPE_ID";
		List<Object> param = new ArrayList<Object>();
		return getDataAccess().queryForList(sql, param.toArray());
	}

	public Map<String, List<Map<String, Object>>> querySourceTypeMap() {
		String sql = "select SOURCE_CATE,SOURCE_TYPE_ID,SOURCE_NAME,SOURCE_DB_TYPE from MR_SOURCE_TYPE";
		return getDataAccess().queryForMapListMap(sql, "SOURCE_CATE");
	}

	/**
	 * 查询数据源
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryDataSource(Map<String, Object> data, Page page) {
		String dataSourceId = MapUtils.getString(data, "DATA_SOURCE_ID");
		String dataSourceId2 = MapUtils.getString(data, "DATA_SOURCE_ID_2");
		String columnSort = MapUtils.getString(data, "_COLUMN_SORT");
		String dataSourceName = MapUtils.getString(data, "DATA_SOURCE_NAME");
		String sourceTypeId = MapUtils.getString(data, "SOURCE_TYPE_ID");
		String dataSourceName2 = MapUtils.getString(data, "DATA_SOURCE_NAME_2");
		String sourceTypeId2 = MapUtils.getString(data, "SOURCE_TYPE_ID_2");
		String sql = "SELECT A.DATA_SOURCE_ID, A.DATA_SOURCE_NAME, A.SOURCE_TYPE_ID,B.SOURCE_NAME  FROM MR_DATA_SOURCE A ,MR_SOURCE_TYPE B  WHERE A.SOURCE_TYPE_ID = B.SOURCE_TYPE_ID AND B.SOURCE_CATE=0 ";
		if (dataSourceName != null && !"".equals(dataSourceName)) {
			dataSourceName = dataSourceName.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += " AND A.DATA_SOURCE_NAME LIKE " + "'" + "%" + dataSourceName + "%" + "' ESCAPE '/'";
		}
		if (sourceTypeId != null && !"".equals(sourceTypeId)) {
			sql += " AND A.SOURCE_TYPE_ID = " + sourceTypeId;
		}
		if (dataSourceName2 != null && !"".equals(dataSourceName2)) {
			dataSourceName2 = dataSourceName2.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += " AND A.DATA_SOURCE_NAME LIKE " + "'" + "%" + dataSourceName2 + "%" + "' ESCAPE '/'";
		}
		if (sourceTypeId2 != null && !"".equals(sourceTypeId2)) {
			sql += " AND A.SOURCE_TYPE_ID = " + sourceTypeId2;
		}
		// sql += " ORDER BY A.DATA_SOURCE_ID ";

		if (dataSourceId != null && !"".equals(dataSourceId)) {
			sql += " AND A.DATA_SOURCE_ID = " + dataSourceId;
		}
		if (dataSourceId2 != null && !"".equals(dataSourceId2)) {
			sql += " AND A.DATA_SOURCE_ID = " + dataSourceId2;
		}

		if (columnSort != null && !"".equals(columnSort)) {
			sql += " ORDER BY A." + columnSort;
		} else {
			sql += " ORDER BY A.DATA_SOURCE_ID ";
		}
		List<Object> param = new ArrayList<Object>();
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 查询job表信息
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryJob(Map<String, Object> data, Page page) {
		String jobName = MapUtils.getString(data, "JOB_NAME");
		String columnSort = MapUtils.getString(data, "_COLUMN_SORT");

		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		String userId = formatUser.get("userId").toString();

		String rolesql = "select count(*) from META_MR_USER_ADDACTION where action_type = 7001 and user_id = " + userId;

		// String sql =
		// "SELECT A.JOB_ID,A.JOB_NAME,A.JOB_STATUS,A.INPUT_DATA_SOURCE_ID,(SELECT B.DATA_SOURCE_NAME  FROM MR_DATA_SOURCE B WHERE B.DATA_SOURCE_ID=A.INPUT_DATA_SOURCE_ID) AS INPUT_DATA_NAME,A.OUTPUT_DATA_SOURCE_ID,(SELECT B.DATA_SOURCE_NAME  FROM MR_DATA_SOURCE B WHERE B.DATA_SOURCE_ID=A.OUTPUT_DATA_SOURCE_ID) AS OUTPUT_DATA_NAME,A.INPUT_DIR,A.JOB_PRIORITY,CASE A.JOB_PRIORITY WHEN '1' THEN 'VERY_LOW' WHEN '2' THEN 'LOW' WHEN '3' THEN 'NORMAL' WHEN '4' THEN 'HIGH' ELSE 'VERY_HIGH' END AS JOB_PRIORITY_NAME,A.MAP_TASKS,A.REDUCE_TASKS, A.JOB_DESCRIBE,(SELECT B.SOURCE_TYPE_ID FROM MR_DATA_SOURCE B WHERE B.DATA_SOURCE_ID = A.INPUT_DATA_SOURCE_ID) AS INPUT_SOURCE_TYPE_ID, (SELECT B.SOURCE_TYPE_ID FROM MR_DATA_SOURCE B WHERE B.DATA_SOURCE_ID = A.OUTPUT_DATA_SOURCE_ID) AS OUTPUT_SOURCE_TYPE_ID FROM MR_JOB A WHERE 1 = 1 ";

		String sql = "SELECT A.JOB_ID,A.JOB_NAME,A.JOB_STATUS,A.INPUT_DATA_SOURCE_ID,(SELECT B.DATA_SOURCE_NAME  FROM MR_DATA_SOURCE B WHERE B.DATA_SOURCE_ID=A.INPUT_DATA_SOURCE_ID) AS INPUT_DATA_NAME,A.OUTPUT_DATA_SOURCE_ID,(SELECT B.DATA_SOURCE_NAME  FROM MR_DATA_SOURCE B WHERE B.DATA_SOURCE_ID=A.OUTPUT_DATA_SOURCE_ID) AS OUTPUT_DATA_NAME,A.INPUT_DIR,A.JOB_PRIORITY,CASE A.JOB_PRIORITY WHEN '1' THEN '最低级' WHEN '2' THEN '低级' WHEN '3' THEN '普通' WHEN '4' THEN '高级' ELSE '最高级' END AS JOB_PRIORITY_NAME,A.MAP_TASKS,A.REDUCE_TASKS, A.JOB_DESCRIBE,(SELECT B.SOURCE_TYPE_ID FROM MR_DATA_SOURCE B WHERE B.DATA_SOURCE_ID = A.INPUT_DATA_SOURCE_ID) AS INPUT_SOURCE_TYPE_ID, (SELECT B.SOURCE_TYPE_ID FROM MR_DATA_SOURCE B WHERE B.DATA_SOURCE_ID = A.OUTPUT_DATA_SOURCE_ID) AS OUTPUT_SOURCE_TYPE_ID ,"
				+ " decode(m.view_action,null,0,m.view_action) \"VIEW\",decode(m.modify_action,null,0,m.modify_action) modi,decode(m.delete_action,null,0,m.delete_action) del,"
				+ " decode(m.create_user_id,"
				+ userId
				+ ",1,0) creater"
				+ " FROM MR_JOB A "
				+ " left join META_MR_USER_AUTHOR m on m.user_id= "
				+ userId
				+ " and m.task_id = a.job_id and m.task_type =2" + " WHERE 1 = 1 ";

		if (getDataAccess().queryForInt(rolesql) == 0) {
			sql += " and JOB_ID in (select task_id from META_MR_USER_AUTHOR where task_type=2 and user_id = " + userId
					+ ")";
		}

		/*
		 * sql =
		 * "SELECT A.JOB_ID,A.JOB_NAME,A.JOB_STATUS,A.INPUT_DATA_SOURCE_ID," +
		 * "(SELECT B.DATA_SOURCE_NAME  FROM MR_DATA_SOURCE B WHERE B.DATA_SOURCE_ID=A.INPUT_DATA_SOURCE_ID) AS INPUT_DATA_NAME,"
		 * +
		 * "A.OUTPUT_DATA_SOURCE_ID,(SELECT B.DATA_SOURCE_NAME  FROM MR_DATA_SOURCE B WHERE B.DATA_SOURCE_ID=A.OUTPUT_DATA_SOURCE_ID) AS OUTPUT_DATA_NAME,"
		 * + "A.INPUT_DIR,A.JOB_PRIORITY," +
		 * "CASE A.JOB_PRIORITY WHEN '1' THEN '最低级' WHEN '2' THEN '低级' WHEN '3' THEN '普通' WHEN '4' THEN '高级' ELSE '最高级' END AS JOB_PRIORITY_NAME,"
		 * + "A.MAP_TASKS,A.REDUCE_TASKS, A.JOB_DESCRIBE," +
		 * "(SELECT B.SOURCE_TYPE_ID FROM MR_DATA_SOURCE B WHERE B.DATA_SOURCE_ID = A.INPUT_DATA_SOURCE_ID) AS INPUT_SOURCE_TYPE_ID,"
		 * +
		 * " (SELECT B.SOURCE_TYPE_ID FROM MR_DATA_SOURCE B WHERE B.DATA_SOURCE_ID = A.OUTPUT_DATA_SOURCE_ID) AS OUTPUT_SOURCE_TYPE_ID FROM MR_JOB A WHERE 1 = 1 "
		 * ;
		 */

		List<Object> param = new ArrayList<Object>();
		if (jobName != null && !"".equals(jobName)) {
			jobName = jobName.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += "AND A.JOB_NAME LIKE " + "'" + "%" + jobName + "%" + "' ESCAPE '/'";
			sql += " OR A.JOB_DESCRIBE     LIKE " + "'" + "%" + jobName + "%" + "' ESCAPE '/'";
			// param.add(" AND A.JOB_NAME LIKE "+"%" + jobName + "%");
		}
		// sql += " ORDER BY A.JOB_ID ";

		if (columnSort != null && !"".equals(columnSort)) {
			sql += " ORDER BY A." + columnSort;
		} else {
			sql += " ORDER BY A.JOB_ID ";
		}
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		// for(Map<String,Object> map : list){
		// map.put("OPERATING_SYSTEM_NAME",
		// CodeManager.getName(ProgramConstant.OPERATING_SYSTEM_NAME,
		// MapUtils.getString(map, "OPERATING_SYSTEM")));
		// }
		return list;
	}

	/**
	 * 查询单条job表信息
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryJobById(Map<String, Object> data) {
		String jobId = MapUtils.getString(data, "jobId");

		String sql = "SELECT T.JOB_ID,T.JOB_STATUS,T.JOB_TYPE,"
				+ "T.JOB_RUN_DATASOURCE,R.DATA_SOURCE_NAME JOB_RUN_DATASOURCE_NAME,R.SOURCE_TYPE_ID RUN_SOURCE_TYPE_ID,"
				+ "T.INPUT_DATA_SOURCE_ID, I.DATA_SOURCE_NAME INPUT_DATA_SOURCE_NAME,i.SOURCE_TYPE_ID INPUT_SOURCE_TYPE_ID,"
				+ "T.OUTPUT_DATA_SOURCE_ID,O.DATA_SOURCE_NAME OUTPUT_DATA_SOURCE_NAME,o.SOURCE_TYPE_ID OUTPUT_SOURCE_TYPE_ID,"
				+ "T.JOB_NAME,T.JOB_PRIORITY,MT.TYPE_NAME ,T.INPUT_PLUGIN_CODE,T.OUTPUT_PLUGIN_CODE,"
				+ "CASE t.job_priority WHEN '1' THEN '最低级' WHEN  '2' THEN '低级' WHEN '3' THEN '普通' WHEN '4' THEN '高级' ELSE '最高级' END AS JOB_PRIORITY_NAME,"
				+ "T.INPUT_DIR,to_char(T.MAP_TASKS) MAP_TASKS,to_char(T.REDUCE_TASKS) REDUCE_TASKS,T.JOB_DESCRIBE "
				+ "FROM MR_JOB T " + "LEFT JOIN META_MR_TYPE MT ON T.JOB_TYPE = MT.TYPE_ID "
				+ "LEFT JOIN MR_DATA_SOURCE R ON T.JOB_RUN_DATASOURCE=R.DATA_SOURCE_ID "
				+ "LEFT JOIN MR_DATA_SOURCE i ON T.INPUT_DATA_SOURCE_ID=i.DATA_SOURCE_ID "
				+ "LEFT JOIN MR_DATA_SOURCE o ON T.OUTPUT_DATA_SOURCE_ID=o.DATA_SOURCE_ID " + "WHERE 1 = 1";
		if (jobId != null && !"".equals(jobId)) {
			sql += " AND T.JOB_ID = " + "'" + jobId + "'";
		}
		List<Object> param = new ArrayList<Object>();
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());

		for (Map<String, Object> map : list) {
			Object obj = map.get("INPUT_PLUGIN_CODE");
			if (obj instanceof oracle.sql.BLOB) {
				String s = StringUtil.convertBLOBtoString((oracle.sql.BLOB) obj);
				map.put("INPUT_PLUGIN_CODE", s);
			}

			Object outobj = map.get("OUTPUT_PLUGIN_CODE");
			if (outobj instanceof oracle.sql.BLOB) {
				String out = StringUtil.convertBLOBtoString((oracle.sql.BLOB) outobj);
				map.put("OUTPUT_PLUGIN_CODE", out);
			}
		}
		return list;
	}

	/**
	 * 查询job参数表信息
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryJobParamById(Map<String, Object> data) {
		String jobId = MapUtils.getString(data, "jobId");
		String sql = "SELECT C.PARAM_NAME,NVL(A.PARAM_VALUE, C.DEFAULT_VALUE) AS PARAM_VALUE,C.PARAM_DESC FROM MR_SOURCE_PARAM C LEFT JOIN MR_JOB_PARAM A ON C.PARAM_NAME = A.PARAM_NAME AND A.JOB_ID = ?"
				+ " WHERE (C.SOURCE_TYPE_ID = (select SOURCE_TYPE_ID from MR_DATA_SOURCE where data_source_id = (select input_data_source_id from MR_JOB where JOB_ID = ?)) AND C.INPUT_OR_OUTPUT = 1 )"
				+ "    or (C.SOURCE_TYPE_ID = (select SOURCE_TYPE_ID from MR_DATA_SOURCE where data_source_id = (select output_data_source_id from MR_JOB where JOB_ID = ?)) AND C.INPUT_OR_OUTPUT = 2)"
				+ " union all"
				+ " SELECT C.PARAM_NAME, NVL(A.PARAM_VALUE,C.DEFAULT_VALUE) AS PARAM_VALUE, C.PARAM_DESC FROM MR_SYSTEM_PARAM C LEFT JOIN MR_JOB_PARAM A ON C.PARAM_NAME = A.PARAM_NAME AND A.JOB_ID =?";

		// String sql =
		// "SELECT distinct t.param_name,t.param_value,t.param_desc FROM mr_job_param t WHERE 1 = 1 ";
		List<Object> param = new ArrayList<Object>();
		if (jobId != null && !"".equals(jobId)) {
			param.add(jobId);
			param.add(jobId);
			param.add(jobId);
			param.add(jobId);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 查询最新的job表ID
	 * 
	 * @return
	 */
	public long queryIdFromJobTable() {
		String sql = "SELECT MAX(T.JOB_ID) FROM MR_JOB T WHERE 1 = 1";
		long pk = getDataAccess().queryForLong(sql);
		return pk;
	}

	/**
	 * 查询job输入、输出、系统参数信息
	 * 
	 * @param
	 * @return
	 */
	public List<Map<String, Object>> queryJobParamAll() {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		String sql = "SELECT T.DATA_SOURCE_ID, T.DATA_SOURCE_NAME, T.SOURCE_TYPE_ID FROM MR_DATA_SOURCE T ";
		list = getDataAccess().queryForList(sql);
		return list;
	}

	/**
	 * 根据JobId查询job输入、输出、系统参数信息是否存在或者存在的条数
	 * 
	 * @param id
	 * @return
	 */
	public List<Map<String, Object>> queryJobParam(int id) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		String sql = "SELECT T.JOB_ID FROM MR_JOB_PARAM T WHERE  1=1" + " AND T.JOB_ID =" + "'" + id + "'";
		list = getDataAccess().queryForList(sql);
		return list;
	}

	/**
	 * 根据JobId查询log日志是否存在
	 * 
	 * @param jobId
	 * @return
	 */
	public List<Map<String, Object>> queryJobLog(int jobId) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		String sql = "SELECT T.LOG_ID,T.JOB_ID FROM MR_JOB_RUN_LOG T WHERE  1=1" + " AND T.JOB_ID =" + "'" + jobId
				+ "'";
		list = getDataAccess().queryForList(sql);
		return list;
	}

	/**
	 * 根据logId查询log日志详细是否存在
	 * 
	 * @param logId
	 * @return
	 */
	public List<Map<String, Object>> queryJobLogMsg(String logId) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		String sql = "SELECT T.LOG_ID FROM MR_JOB_RUN_LOG_MSG T WHERE  1=1" + " AND T.LOG_ID =" + "'" + logId + "'";
		list = getDataAccess().queryForList(sql);
		return list;
	}

	/**
	 * 根据logId查询Map日志是否存在
	 * 
	 * @param logId
	 * @return
	 */
	public List<Map<String, Object>> queryMapLog(String logId) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		String sql = "SELECT T.MAP_TASK_ID,T.LOG_ID FROM MR_JOB_MAP_RUN_LOG T WHERE  1=1" + " AND T.LOG_ID =" + "'"
				+ logId + "'";
		list = getDataAccess().queryForList(sql);
		return list;
	}

	/**
	 * 根据mapTaskId查询log日志详细是否存在
	 * 
	 * @param mapTaskId
	 * @return
	 */
	public List<Map<String, Object>> queryMapLogMsg(String mapTaskId) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		String sql = "SELECT T.MAP_TASK_ID FROM MR_JOB_MAP_RUN_LOG_MSG T WHERE  1=1" + " AND T.MAP_TASK_ID =" + "'"
				+ mapTaskId + "'";
		list = getDataAccess().queryForList(sql);
		return list;
	}

	/**
	 * 根据logId查询Reduce日志是否存在
	 * 
	 * @param logId
	 * @return
	 */
	public List<Map<String, Object>> queryReduceLog(String logId) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		String sql = "SELECT T.REDUCE_TASK_ID,T.LOG_ID FROM MR_JOB_REDUCE_RUN_LOG T WHERE  1=1" + " AND T.LOG_ID ="
				+ "'" + logId + "'";
		list = getDataAccess().queryForList(sql);
		return list;
	}

	/**
	 * 根据reduceTaskId查询log日志详细是否存在
	 * 
	 * @param reduceTaskId
	 * @return
	 */
	public List<Map<String, Object>> queryReduceLogMsg(String reduceTaskId) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		String sql = "SELECT T.REDUCE_TASK_ID FROM MR_JOB_REDUCE_RUN_LOG_MSG T WHERE  1=1" + " AND T.REDUCE_TASK_ID ="
				+ "'" + reduceTaskId + "'";
		list = getDataAccess().queryForList(sql);
		return list;
	}

	/**
	 * 新增Job表
	 * 
	 * @param data
	 * @return
	 */
	public boolean insertJob(Map<String, Object> data) {
		// 获取数据源ID
		long pk = super.queryForNextVal("MR_JOB_ID");
		data.put("JOB_ID", pk);
		// 状态字段JOB_STATUS暂时设置为定制：0表示未运行
		String sql = "INSERT INTO MR_JOB(JOB_ID,JOB_STATUS,JOB_TYPE,JOB_DESCRIBE,INPUT_DATA_SOURCE_ID,OUTPUT_DATA_SOURCE_ID,JOB_NAME,JOB_PRIORITY,INPUT_DIR,MAP_TASKS,REDUCE_TASKS,JOB_RUN_DATASOURCE,INPUT_PLUGIN_CODE,OUTPUT_PLUGIN_CODE) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		Object inputPluginCode = MapUtils.getString(data, "INPUT_PLUGIN_CODE", "");
		BinaryStream inbs = StringUtil.convertStringtoBinaryStream(inputPluginCode);
		Object outputPluginCode = MapUtils.getString(data, "OUTPUT_PLUGIN_CODE", "");
		BinaryStream outbs = StringUtil.convertStringtoBinaryStream(outputPluginCode);

		return getDataAccess().execNoQuerySql(sql, pk, 0, Convert.toString(data.get("JOB_TYPE")),
				Convert.toString(data.get("JOB_DESCRIBE")), Convert.toString(data.get("INPUT_DATA_SOURCE_ID")),
				Convert.toString(data.get("OUTPUT_DATA_SOURCE_ID")), Convert.toString(data.get("JOB_NAME")),
				Convert.toString(data.get("JOB_PRIORITY")), Convert.toString(data.get("INPUT_DIR")),
				Convert.toString(data.get("MAP_TASKS")), Convert.toString(data.get("REDUCE_TASKS")),
				Convert.toString(data.get("JOB_RUN_DATASOURCE")), inbs, outbs);
	}

	/**
	 * 新增Job参数表
	 * 
	 * @param data
	 * @return
	 */
	public boolean insertJobParam(Map<String, Object> data) {
		String sql = "INSERT INTO MR_JOB_PARAM(JOB_ID,PARAM_NAME,PARAM_VALUE,PARAM_DESC) VALUES(?,?,?,?)";
		return getDataAccess().execNoQuerySql(sql, Convert.toInt(data.get("JOB_ID")),
				Convert.toString(data.get("PARAM_NAME")), Convert.toString(data.get("DEFAULT_VALUE")),
				Convert.toString(data.get("PARAM_DESC")));
	}

	/**
	 * 批量插入任务参数
	 * 
	 * @param params
	 * @return
	 */
	public void insertBatchJobParams(final List<Map<String, Object>> params) {
		String sql = "INSERT INTO MR_JOB_PARAM(JOB_ID,PARAM_NAME,PARAM_VALUE,PARAM_DESC) VALUES(?,?,?,?)";
		getDataAccess().execUpdateBatch(sql, new IParamsSetter() {
			@Override
			public void setValues(PreparedStatement pstmt, int i) throws SQLException {
				Map<String, Object> param = params.get(i);
				pstmt.setObject(1, param.get("JOB_ID"));
				pstmt.setObject(2, param.get("PARAM_NAME"));
				pstmt.setObject(3, param.get("PARAM_VALUE"));
				pstmt.setObject(4, param.get("PARAM_DESC"));
			}

			@Override
			public int batchSize() {
				return params.size();
			}
		});
	}

	/**
	 * 修改Job表
	 * 
	 * @param data
	 * @return
	 */
	public boolean updateJob(Map<String, Object> data) {
		String sql = "UPDATE MR_JOB T SET T.JOB_NAME=?,T.JOB_STATUS=?,T.JOB_TYPE=?,T.INPUT_DATA_SOURCE_ID=?,T.OUTPUT_DATA_SOURCE_ID=?,T.JOB_PRIORITY=?,T.INPUT_DIR=?,T.MAP_TASKS=?,T.REDUCE_TASKS=?,T.JOB_DESCRIBE=?,T.JOB_RUN_DATASOURCE=?,INPUT_PLUGIN_CODE=?,OUTPUT_PLUGIN_CODE=? WHERE T.JOB_ID =?";
		// 状态字段JOB_STATUS暂时设置为定制：0表示未运行
		Object inputPluginCode = MapUtils.getString(data, "INPUT_PLUGIN_CODE", "");
		BinaryStream inbs = StringUtil.convertStringtoBinaryStream(inputPluginCode);
		Object outputPluginCode = MapUtils.getString(data, "OUTPUT_PLUGIN_CODE", "");
		BinaryStream outbs = StringUtil.convertStringtoBinaryStream(outputPluginCode);
		return getDataAccess().execNoQuerySql(sql, Convert.toString(data.get("JOB_NAME")), 0,
				Convert.toString(data.get("JOB_TYPE")), Convert.toString(data.get("INPUT_DATA_SOURCE_ID")),
				Convert.toString(data.get("OUTPUT_DATA_SOURCE_ID")), Convert.toString(data.get("JOB_PRIORITY")),
				Convert.toString(data.get("INPUT_DIR")), Convert.toString(data.get("MAP_TASKS")),
				Convert.toString(data.get("REDUCE_TASKS")), Convert.toString(data.get("JOB_DESCRIBE")),
				Convert.toString(data.get("JOB_RUN_DATASOURCE")), inbs, outbs, Convert.toString(data.get("JOB_ID")));
	}

	/**
	 * 修改Job参数表
	 * 
	 * @param data
	 * @return
	 */
	public void updateParam(Map<String, Object> data) {
		String sql = "UPDATE mr_job_param SET ";
		getDataAccess().execUpdate(sql, Convert.toInt(data.get("SERVER_ID")));
	}

	/**
	 * 根据JobID删除Job配置信息
	 * 
	 * @param jobId
	 * @return
	 */
	public int deleteJob(int jobId) {
		String sql = "DELETE FROM MR_JOB WHERE JOB_ID =?";
		return getDataAccess().execUpdate(sql, jobId);
	}

	/**
	 * 根据JobID删除Job参数信息：输入、输出、系统参数
	 * 
	 * @param jobId
	 * @return
	 */
	public int deleteJobParam(long jobId) {
		String sql = "DELETE FROM MR_JOB_PARAM WHERE JOB_ID =?";
		return getDataAccess().execUpdate(sql, jobId);
	}

	/**
	 * 根据JobID删除Job相应的日志信息
	 * 
	 * @param jobId
	 * @return
	 */
	public int deleteJobLog(int jobId) {
		String sql = "DELETE FROM mr_job_run_log t1 WHERE t1.job_id = ?";
		return getDataAccess().execUpdate(sql, jobId);
	}

	/**
	 * 根据JobID删除Job相应的日志信息
	 * 
	 * @param jobId
	 * @return
	 */
	public int deleteJobMapDataLog(int jobId) {
		String sql = "DELETE FROM MR_JOB_MAP_DATALOG t1 WHERE t1.jobid = ?";
		return getDataAccess().execUpdate(sql, jobId);
	}

	/**
	 * 根据logID删除Job相应的日志详细信息
	 * 
	 * @param logId
	 * @return
	 */
	public int deleteJobLogMsg(int logId) {
		String sql = "DELETE FROM MR_JOB_RUN_LOG_MSG t1 where t1.log_id in ( SELECT t2.log_id FROM mr_job_run_log t2 WHERE t2.job_id=?)";
		return getDataAccess().execUpdate(sql, logId);
	}

	/**
	 * 根据logID删除Map相应的日志信息
	 * 
	 * @param logId
	 * @return
	 */
	public int deleteMapLog(int jobid) {
		String sql = "DELETE FROM MR_JOB_MAP_RUN_LOG t1 where t1.log_id in ( SELECT t2.log_id FROM mr_job_run_log t2 WHERE t2.job_id=?)";
		return getDataAccess().execUpdate(sql, jobid);
	}

	/**
	 * 根据mapTaskId删除Map相应的日志详细信息
	 * 
	 * @param mapTaskId
	 * @return
	 */
	public int deleteMapLogMsg(int jobid) {
		String sql = "DELETE FROM MR_JOB_MAP_RUN_LOG_MSG t where t.map_task_id in (select t1.MAP_TASK_ID FROM MR_JOB_MAP_RUN_LOG t1, mr_job_run_log t2 WHERE t2.log_id = t1.log_id and t2.job_id=?)";
		return getDataAccess().execUpdate(sql, jobid);
	}

	/**
	 * 根据logID删除Reduce相应的日志信息
	 * 
	 * @param logId
	 * @return
	 */
	public int deleteReduceLog(int logId) {
		String sql = "DELETE FROM MR_JOB_REDUCE_RUN_LOG t1 where t1.log_id in ( SELECT t2.log_id FROM mr_job_run_log t2 WHERE t2.job_id=?)";
		return getDataAccess().execUpdate(sql, logId);
	}

	/**
	 * 根据reduceTaskId删除Reduce相应的日志详细信息
	 * 
	 * @param reduceTaskId
	 * @return
	 */
	public int deleteReduceLogMsg(int jobid) {
		String sql = "DELETE FROM MR_JOB_REDUCE_RUN_LOG_MSG t where t.reduce_task_id in (select t1.REDUCE_TASK_ID FROM MR_JOB_REDUCE_RUN_LOG t1, mr_job_run_log t2 WHERE t2.log_id = t1.log_id and t2.job_id=?)";
		return getDataAccess().execUpdate(sql, jobid);
	}

	/**
	 * 查询job参数表信息：输入参数
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryInputParamById(Map<String, Object> data) {
		String jobId = MapUtils.getString(data, "jobId");

		String sourceTypeId = MapUtils.getString(data, "SOURCE_TYPE_ID");
		String inputOrOutput = MapUtils.getString(data, "inputOrOutput");

		String sql = "SELECT C.PARAM_NAME, NVL(A.PARAM_VALUE,C.DEFAULT_VALUE) AS DEFAULT_VALUE, C.PARAM_DESC ,C.IS_MUST "
				+ "FROM MR_SOURCE_PARAM C LEFT JOIN MR_JOB_PARAM A ON C.PARAM_NAME = A.PARAM_NAME AND A.JOB_ID =? "
				+ "WHERE C.SOURCE_TYPE_ID = ? AND C.INPUT_OR_OUTPUT = ?";

		// String sql =
		// "SELECT A.PARAM_NAME, A.PARAM_VALUE AS DEFAULT_VALUE, A.PARAM_DESC FROM MR_JOB_PARAM A, MR_JOB B WHERE A.JOB_ID = B.JOB_ID  AND A.PARAM_NAME IN (SELECT T.PARAM_NAME  FROM MR_SOURCE_PARAM T  WHERE T.SOURCE_TYPE_ID = ?   AND T.INPUT_OR_OUTPUT = ?)";
		List<Object> param = new ArrayList<Object>();
		if (jobId != null && !"".equals(jobId)) {
			param.add(jobId);
			// sql += " AND A.JOB_ID = "+"'" + jobId +"'";
		}
		if (sourceTypeId != null && !"".equals(sourceTypeId)) {
			param.add(sourceTypeId);
		}
		if (inputOrOutput != null && !"".equals(inputOrOutput)) {
			param.add(inputOrOutput);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 查询job参数表信息：输出参数
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryOutputParamById(Map<String, Object> data) {
		String jobId = MapUtils.getString(data, "jobId");

		String sourceTypeId = MapUtils.getString(data, "SOURCE_TYPE_ID");
		String inputOrOutput = MapUtils.getString(data, "inputOrOutput");

		String sql = "SELECT C.PARAM_NAME, NVL(A.PARAM_VALUE,C.DEFAULT_VALUE) AS DEFAULT_VALUE, C.PARAM_DESC ,C.IS_MUST "
				+ "FROM MR_SOURCE_PARAM C LEFT JOIN MR_JOB_PARAM A ON C.PARAM_NAME = A.PARAM_NAME AND A.JOB_ID =? "
				+ "WHERE C.SOURCE_TYPE_ID = ? AND C.INPUT_OR_OUTPUT = ?";
		// String sql =
		// "SELECT A.PARAM_NAME, A.PARAM_VALUE AS DEFAULT_VALUE, A.PARAM_DESC FROM MR_JOB_PARAM A, MR_JOB B WHERE A.JOB_ID = B.JOB_ID  AND A.PARAM_NAME IN (SELECT T.PARAM_NAME  FROM MR_SOURCE_PARAM T  WHERE T.SOURCE_TYPE_ID = ?   AND T.INPUT_OR_OUTPUT = ?)";
		List<Object> param = new ArrayList<Object>();
		if (jobId != null && !"".equals(jobId)) {
			param.add(jobId);
		}
		if (sourceTypeId != null && !"".equals(sourceTypeId)) {
			param.add(sourceTypeId);
		}
		if (inputOrOutput != null && !"".equals(inputOrOutput)) {
			param.add(inputOrOutput);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 查询job参数表信息：系统参数
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> querySysParamById(Map<String, Object> data) {
		String jobId = MapUtils.getString(data, "jobId");

		String sql = "SELECT C.PARAM_NAME, NVL(A.PARAM_VALUE,C.DEFAULT_VALUE) AS DEFAULT_VALUE, C.IS_MUST, C.PARAM_DESC "
				+ "FROM MR_SYSTEM_PARAM C LEFT JOIN MR_JOB_PARAM A ON C.PARAM_NAME = A.PARAM_NAME AND A.JOB_ID =? ";

		// String sql =
		// "SELECT A.PARAM_NAME, A.PARAM_VALUE AS DEFAULT_VALUE, A.PARAM_DESC  FROM MR_JOB_PARAM A, MR_JOB B WHERE A.JOB_ID = B.JOB_ID ";

		/*
		 * if(jobId!=null && !"".equals(jobId)){ sql += " AND A.JOB_ID = "+"'" +
		 * jobId +"'"; sql += " AND A.PARAM_NAME LIKE '%.sys.%'";//系统参数 }
		 */

		List<Object> param = new ArrayList<Object>();
		if (jobId != null && !"".equals(jobId)) {
			param.add(jobId);
			// sql += " AND A.JOB_ID = "+"'" + jobId +"'";
			// sql += " AND A.PARAM_NAME LIKE '%.sys.%'";//系统参数
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

}
