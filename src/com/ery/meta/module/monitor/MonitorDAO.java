package com.ery.meta.module.monitor;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.web.session.SessionManager;

public class MonitorDAO extends MetaBaseDAO {

	public List<Map<String, Object>> getTypeJobData() {
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		String userId = formatUser.get("userId").toString();
		String adminFlag = formatUser.get("adminFlag").toString();

		String sql = "select t.TYPE_ID,mt.type_name,count(*) TYPE_NUM from ("
				+ " select FL.COL_ID TASK_ID,1 TASK_TYPE,CJ.COL_TYPE TYPE_ID from MR_FTP_COL_FILE_LOG FL"
				+ " inner join MR_FTP_COL_JOB CJ ON FL.COL_ID = CJ.COL_ID"
				+ " where status = 0"
				+ " union all"
				+ " select JR.JOB_ID TASK_ID,2 TASK_TYPE,JOB_TYPE TYPE_ID FROM MR_JOB_RUN_LOG JR"
				+ " INNER JOIN  MR_JOB MJ ON JR.JOB_ID = MJ.JOB_ID"
				+ " WHERE nvl(RUN_FLAG,0) = 0) t inner join META_MR_TYPE MT"
				+ " on t.TYPE_ID = mt.type_id"
				+ " INNER JOIN META_MR_USER_AUTHOR UA ON T.TASK_ID = UA.TASK_ID AND T.TASK_TYPE = UA.TASK_TYPE AND UA.USER_ID =UA.CREATE_USER_ID";
		if (!adminFlag.equals("1")) {
			sql += " and UA.USER_ID = " + userId;
		}
		sql += " group by  t.TYPE_ID,mt.type_name";
		List<Map<String, Object>> list = getDataAccess().queryForList(sql);
		return list;
	}

	public List<Map<String, Object>> getUserJobData() {
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		String userId = formatUser.get("userId").toString();
		String userNamecn = formatUser.get("userNamecn").toString();
		String adminFlag = formatUser.get("adminFlag").toString();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		if (MonitorData.getMonitorConfig().get("ISAUTOREFRESH").toString().equals("0") &&
				MonitorData.getMonitorConfig().get("ISMANUREFRESH").toString().equals("0")) {
			Map<String, Object> m = new HashMap<String, Object>();
			m.put("USER_ID", userId);
			m.put("USER_NAMECN", userNamecn);
			m.put("USER_NUM", 0.0000001);
			list.add(m);
			return list;
		}
		String sql = " SELECT U.USER_ID,U.USER_NAMECN,COUNT(*) USER_NUM FROM ("
				+ " select FL.COL_ID TASK_ID,1 TASK_TYPE from MR_FTP_COL_FILE_LOG FL"
				+ " where status = 0 and start_time>to_char(sysdate-1,'yyyy-mm-dd hh24:mi:ss')"
				+ " union all"
				+ " select JR.JOB_ID TASK_ID,2 TASK_TYPE FROM MR_JOB_RUN_LOG JR"
				+ " WHERE nvl(RUN_FLAG,0) = 0 and start_date>sysdate-1) T INNER JOIN META_MR_USER_AUTHOR UA ON T.TASK_ID = UA.TASK_ID AND T.TASK_TYPE = UA.TASK_TYPE AND UA.USER_ID =UA.CREATE_USER_ID"
				+ " INNER JOIN META_MAG_USER U ON UA.USER_ID = U.USER_ID";
		if (!adminFlag.equals("1")) {
			sql += " and UA.USER_ID = " + userId;
		}
		sql += " GROUP BY U.USER_ID,U.USER_NAMECN";
		list = getDataAccess().queryForList(sql);
		if (list.size() == 0) {
			Map<String, Object> m = new HashMap<String, Object>();
			m.put("USER_ID", userId);
			m.put("USER_NAMECN", userNamecn);
			m.put("USER_NUM", 0.0000001);
			list.add(m);
		}
		return list;
	}

	public List<Map<String, Object>> getJobStatusData() {
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		String userId = formatUser.get("userId").toString();
		String adminFlag = formatUser.get("adminFlag").toString();

		String sql = " select count(1) STATUS_NUM,nvl(T.STATUS,0) STATUS from("
				+ " select COL_ID TASK_ID,1 TASK_TYPE,status STATUS from MR_FTP_COL_FILE_LOG FL where fl.start_time>to_char(sysdate-1,'yyyy-mm-dd hh24:mi:ss')"
				+ " union all"
				+ " select JOB_ID TASK_ID,2 TASK_TYPE,RUN_FLAG STATUS FROM MR_JOB_RUN_LOG JR where JR.start_date>sysdate-1) T"
				+ " INNER JOIN META_MR_USER_AUTHOR UA ON T.TASK_ID = UA.TASK_ID AND T.TASK_TYPE = UA.TASK_TYPE AND UA.USER_ID =UA.CREATE_USER_ID";
		if (!adminFlag.equals("1")) {
			sql += " and UA.USER_ID = " + userId;
		}
		sql += " GROUP BY nvl(T.STATUS,0)";
		List<Map<String, Object>> list = getDataAccess().queryForList(sql);
		return list;
	}

	public Map<String, Object> getMonitorData() {
		Map<String, Object> monitorData = new HashMap<String, Object>();
		Map<String, List<Map<String, Object>>> logoDetailData = new HashMap<String, List<Map<String, Object>>>();
		String sql = "SELECT U.USER_ID,U.USER_NAMECN,t.* FROM ("
				+ " select FL.COL_LOG_ID LOG_ID,FL.COL_ID TASK_ID,NVL(FL.QUEUE ,'default') QUEUE,1 TASK_TYPE,CJ.COL_ORIGIN TASK_JOB_TYPE, FL.START_TIME, MT.TYPE_ID JOB_TYPE,MT.TYPE_NAME JOB_TYPE_NAME, "
				+ " '['||CJ.COL_ID||']-'||CJ.COL_NAME JOB_NAME,nvl(FL.FILE_NUM,0) FILE_NUM,FL.FILE_TOTALSIZE from MR_FTP_COL_FILE_LOG FL"
				+ " inner join MR_FTP_COL_JOB CJ ON FL.COL_ID = CJ.COL_ID"
				+ " inner join META_MR_TYPE MT ON CJ.COL_TYPE=MT.TYPE_ID"
				+ " where status = 0 and start_time>to_char(sysdate-1,'yyyy-mm-dd hh24:mi:ss')"
				+ " union all "
				+ " select JL.LOG_ID LOG_ID,JL.JOB_ID TASK_ID,NVL(JL.QUEUE ,'default') QUEUE,2 TASK_TYPE,2 TASK_JOB_TYPE,to_char(JL.START_DATE,'yyyy-mm-dd hh24:mi:ss') START_TIME, MT.TYPE_ID JOB_TYPE,"
				+ " MT.TYPE_NAME JOB_TYPE_NAME, "
				+ " '['||JL.LOG_ID||']-'||MJ.JOB_NAME JOB_NAME,nvl(MJ.MAP_TASKS + MJ.REDUCE_TASKS,0) FILE_NUM,JL.ALL_FILE_SIZE FILE_TOTALSIZE from MR_JOB_RUN_LOG JL"
				+ " INNER JOIN MR_JOB MJ ON JL.JOB_ID = MJ.JOB_ID"
				+ " inner join META_MR_TYPE MT ON MJ.JOB_TYPE=MT.TYPE_ID"
				+ " where nvl(RUN_FLAG,0) = 0 and start_date>sysdate-1 ) T INNER JOIN META_MR_USER_AUTHOR UA ON T.TASK_ID = UA.TASK_ID AND T.TASK_TYPE = UA.TASK_TYPE AND UA.USER_ID =UA.CREATE_USER_ID"
				+ " INNER JOIN META_MAG_USER U ON UA.USER_ID = U.USER_ID ORDER BY START_TIME DESC";
		List<Map<String, Object>> logoData = getDataAccess().queryForList(sql);

		for (Map<String, Object> map : logoData) {
			if (map.get("TASK_TYPE").toString().equals("1")) {
				sql = "select * from MR_FTP_COL_DETAIL_FILELOG where col_log_id = " + map.get("LOG_ID");
				List<Map<String, Object>> col_detail_log_list = getDataAccess().queryForList(sql);
				int success = 0;// 成功数
				int failure = 0;// 失败数
				int map_runing = 0;
				int output_rename = 0;// 重命名输入文件
				int move_output = 0;// 移动输出文件
				int delete_input = 0;// 删除输入文件
				int move_input = 0;// 移动输入文件
				int input_rename = 0;// 输出文件重命名
				for (Map<String, Object> map2 : col_detail_log_list) {
					if (map2.get("STATUS").toString().equals("1")) {
						success++;
					} else if (map2.get("STATUS").toString().equals("2")) {
						failure++;
					} else if (map2.get("STATUS").toString().equals("0")) {
						map_runing++;
					}
					if (null != map2.get("IS_OUTPUT_RENAME") && null != map2.get("OUTPUT_RENAME_STATUS") &&
							map2.get("IS_OUTPUT_RENAME").toString().equals("1") &&
							map2.get("OUTPUT_RENAME_STATUS").toString().equals("1")) {
						output_rename++;
					}
					if (null != map2.get("IS_MOVE_OUTPUT") && null != map2.get("MOVE_OUTPUT_STATUS") &&
							map2.get("IS_MOVE_OUTPUT").toString().equals("1") &&
							map2.get("MOVE_OUTPUT_STATUS").toString().equals("1")) {
						move_output++;
					}
					if (null != map2.get("DELETE_INPUT_STATUS") &&
							map2.get("DELETE_INPUT_STATUS").toString().equals("1")) {
						delete_input++;
					}
					if (null != map2.get("MOVE_INPUT_STATUS") && map2.get("MOVE_INPUT_STATUS").toString().equals("1")) {
						move_input++;
					}
					if (null != map2.get("INPUT_RENAME_STATUS") &&
							map2.get("INPUT_RENAME_STATUS").toString().equals("1")) {
						input_rename++;
					}
				}
				map.put("LOG_ID_", "COL" + map.get("LOG_ID"));
				map.put("SUCCESS", success);
				map.put("FAILURE", failure);
				map.put("FAILURE_OUTPUT_RENAME", output_rename);
				map.put("FAILURE_MOVE_OUTPUT", move_output);
				map.put("FAILURE_DELETE_INPUT", delete_input);
				map.put("FAILURE_MOVE_INPUT", move_input);
				map.put("FAILURE_INPUT_RENAME", input_rename);
				map.put("MAP_RUNING", map_runing);
				map.put("REDUCE_RUNING", 0);
				int filenumber = col_detail_log_list.size();
				map.put("MAP_RED", filenumber + "/0");
				if (filenumber == 0) {
					map.put("SCHEDULE", "100%");
				} else {
					map.put("SCHEDULE", ((success + failure) * 100 / filenumber) + "%");
				}
				// logoDetailData.put("COL"+map.get("LOG_ID").toString(),
				// col_detail_log_list);
			} else {
				sql = "	select ML.Map_Task_Id TASK_ID,ML.LOG_ID,'MAP' Task_type, ML.MAP_INPUT_COUNT INPUT_COUNT ,ML.MAP_OUTPUT_COUNT OUTPUT_COUNT ,to_char(ML.START_DATE,'yyyy-mm-dd hh24:mi:ss') START_DATE, to_char(ML.END_DATE,'yyyy-mm-dd hh24:mi:ss') END_DATE,NVL(ML.RUN_FLAG,0) RUN_FLAG ,NVL(ML.RUN_FLAG,0) STATUS,ML.LOG_MSG from MR_JOB_MAP_RUN_LOG ML where log_id = " +
						map.get("LOG_ID") +
						" union all " +
						" select RL.REDUCE_Task_Id TASK_ID,RL.LOG_ID,'REDUCE' Task_type ,RL.REDUCE_INPUT_COUNT INPUT_COUNT ,RL.REDUCE_OUTPUT_COUNT OUTPUT_COUNT, to_char(RL.START_DATE,'yyyy-mm-dd hh24:mi:ss') START_DATE, to_char(RL.END_DATE,'yyyy-mm-dd hh24:mi:ss') END_DATE,NVL(RL.RUN_FLAG,0)  RUN_FLAG ,NVL(RL.RUN_FLAG,0) STATUS,RL.LOG_MSG from Mr_Job_Reduce_Run_Log RL where log_id = " +
						map.get("LOG_ID") + " order by START_DATE desc";
				List<Map<String, Object>> col_detail_log_list = getDataAccess().queryForList(sql);
				int success = 0;// 成功数
				int failure = 0;// 失败数
				int MAP_SUCCESS = 0;
				int MAP_FAILURE = 0;
				int REDUCE_SUCCESS = 0;
				int REDUCE_FAILURE = 0;
				int MAP_RUNING = 0;
				int REDUCE_RUNING = 0;
				for (Map<String, Object> map2 : col_detail_log_list) {
					if (map2.get("RUN_FLAG").toString().equals("1")) {
						success++;
						if (map2.get("TASK_TYPE").toString().equals("MAP")) {
							MAP_SUCCESS++;
						} else {
							REDUCE_SUCCESS++;
						}
					} else if (map2.get("RUN_FLAG").toString().equals("2")) {
						failure++;
						if (map2.get("TASK_TYPE").toString().equals("MAP")) {
							MAP_FAILURE++;
						} else {
							REDUCE_FAILURE++;
						}
					} else if (map2.get("RUN_FLAG").toString().equals("0")) {
						if (map2.get("TASK_TYPE").toString().equals("MAP")) {
							MAP_RUNING++;
						} else {
							REDUCE_RUNING++;
						}
					}
				}
				map.put("LOG_ID_", "JOB" + map.get("LOG_ID"));
				map.put("SUCCESS", success);
				map.put("FAILURE", failure);
				map.put("MAP_SUCCESS", MAP_SUCCESS);
				map.put("MAP_FAILURE", MAP_FAILURE);
				map.put("REDUCE_SUCCESS", REDUCE_SUCCESS);
				map.put("REDUCE_FAILURE", REDUCE_FAILURE);

				map.put("MAP_RUNING", MAP_RUNING);
				map.put("REDUCE_RUNING", REDUCE_RUNING);

				map.put("MAP_RED", MAP_RUNING + "/" + REDUCE_RUNING);
				int filenumber = col_detail_log_list.size();
				if (filenumber == 0) {
					map.put("SCHEDULE", "100%");
				} else {
					map.put("SCHEDULE", ((success + failure) * 100 / filenumber) + "%");
				}
				// logoDetailData.put("JOB"+map.get("LOG_ID").toString(),
				// col_detail_log_list);
			}
		}
		monitorData.put("LOG_DATA", logoData);
		monitorData.put("LOG_DETAIL_DATA", logoDetailData);

		// 处理

		return monitorData;
	}

	public Map<String, Object> getLogInfo(Map<String, Object> data) {
		String log_id = data.get("LOG_ID_").toString();
		String task_type = "";
		if (log_id.startsWith("COL")) {
			task_type = "1";
			log_id = log_id.replace("COL", "");
		} else if (log_id.startsWith("JOB")) {
			task_type = "2";
			log_id = log_id.replace("JOB", "");
		}
		String sql = "SELECT U.USER_ID,U.USER_NAMECN,t.* FROM (" +
				" select FL.COL_LOG_ID LOG_ID,FL.COL_ID TASK_ID ,NVL(FL.QUEUE ,'default') QUEUE,1 TASK_TYPE,CJ.COL_ORIGIN TASK_JOB_TYPE, FL.START_TIME, MT.TYPE_ID JOB_TYPE,MT.TYPE_NAME JOB_TYPE_NAME, " +
				" '['||CJ.COL_ID||']-'||CJ.COL_NAME JOB_NAME,nvl(FL.FILE_NUM,0) FILE_NUM,FL.FILE_TOTALSIZE from MR_FTP_COL_FILE_LOG FL" +
				" inner join MR_FTP_COL_JOB CJ ON FL.COL_ID = CJ.COL_ID" +
				" inner join META_MR_TYPE MT ON CJ.COL_TYPE=MT.TYPE_ID" +
				" union all " +
				" select JL.LOG_ID LOG_ID,JL.JOB_ID TASK_ID,NVL(JL.QUEUE ,'default') QUEUE,2 TASK_TYPE,2 TASK_JOB_TYPE,to_char(JL.START_DATE,'yyyy-mm-dd hh24:mi:ss') START_TIME, MT.TYPE_ID JOB_TYPE," +
				" MT.TYPE_NAME JOB_TYPE_NAME, " +
				" '['||JL.LOG_ID||']-'||MJ.JOB_NAME JOB_NAME,nvl(MJ.MAP_TASKS + MJ.REDUCE_TASKS,0) FILE_NUM,JL.ALL_FILE_SIZE FILE_TOTALSIZE from MR_JOB_RUN_LOG JL" +
				" INNER JOIN MR_JOB MJ ON JL.JOB_ID = MJ.JOB_ID" +
				" inner join META_MR_TYPE MT ON MJ.JOB_TYPE=MT.TYPE_ID" +
				" ) T INNER JOIN META_MR_USER_AUTHOR UA ON T.TASK_ID = UA.TASK_ID AND T.TASK_TYPE = UA.TASK_TYPE AND UA.USER_ID =UA.CREATE_USER_ID" +
				" INNER JOIN META_MAG_USER U ON UA.USER_ID = U.USER_ID " + " WHERE T.LOG_ID = " + log_id +
				" and T.TASK_TYPE = " + task_type + " ORDER BY START_TIME DESC";
		Map<String, Object> map = getDataAccess().queryForMap(sql);

		if (map.get("TASK_TYPE").toString().equals("1")) {
			sql = "select * from MR_FTP_COL_DETAIL_FILELOG where col_log_id = " + map.get("LOG_ID");
			List<Map<String, Object>> col_detail_log_list = getDataAccess().queryForList(sql);
			int success = 0;// 成功数
			int failure = 0;// 失败数
			int map_runing = 0;//
			int output_rename = 0;// 重命名输入文件
			int move_output = 0;// 移动输出文件
			int delete_input = 0;// 删除输入文件
			int move_input = 0;// 移动输入文件
			int input_rename = 0;// 输出文件重命名
			for (Map<String, Object> map2 : col_detail_log_list) {
				if (map2.get("STATUS").toString().equals("1")) {
					success++;
				} else if (map2.get("STATUS").toString().equals("2")) {
					failure++;
				} else if (map2.get("STATUS").toString().equals("0")) {
					map_runing++;
				}
				if (null != map2.get("IS_OUTPUT_RENAME") && null != map2.get("OUTPUT_RENAME_STATUS") &&
						map2.get("IS_OUTPUT_RENAME").toString().equals("1") &&
						map2.get("OUTPUT_RENAME_STATUS").toString().equals("1")) {
					output_rename++;
				}
				if (null != map2.get("IS_MOVE_OUTPUT") && null != map2.get("MOVE_OUTPUT_STATUS") &&
						map2.get("IS_MOVE_OUTPUT").toString().equals("1") &&
						map2.get("MOVE_OUTPUT_STATUS").toString().equals("1")) {
					move_output++;
				}
				if (null != map2.get("DELETE_INPUT_STATUS") && map2.get("DELETE_INPUT_STATUS").toString().equals("1")) {
					delete_input++;
				}
				if (null != map2.get("MOVE_INPUT_STATUS") && map2.get("MOVE_INPUT_STATUS").toString().equals("1")) {
					move_input++;
				}
				if (null != map2.get("INPUT_RENAME_STATUS") && map2.get("INPUT_RENAME_STATUS").toString().equals("1")) {
					input_rename++;
				}
			}
			map.put("LOG_ID_", "COL" + map.get("LOG_ID"));
			map.put("SUCCESS", success);
			map.put("FAILURE", failure);
			map.put("RUNING", map_runing);
			map.put("FAILURE_OUTPUT_RENAME", output_rename);
			map.put("FAILURE_MOVE_OUTPUT", move_output);
			map.put("FAILURE_DELETE_INPUT", delete_input);
			map.put("FAILURE_MOVE_INPUT", move_input);
			map.put("FAILURE_INPUT_RENAME", input_rename);
			int filenumber = col_detail_log_list.size();
			map.put("MAP_RED", filenumber + "/0");
			if (filenumber == 0) {
				map.put("SCHEDULE", "100%");
			} else {
				map.put("SCHEDULE", ((success + failure) * 100 / filenumber) + "%");
			}
		} else {
			sql = "	select ML.Map_Task_Id TASK_ID,ML.LOG_ID,'MAP' Task_type, ML.MAP_INPUT_COUNT INPUT_COUNT ,ML.MAP_OUTPUT_COUNT OUTPUT_COUNT ,to_char(ML.START_DATE,'yyyy-mm-dd hh24:mi:ss') START_DATE, to_char(ML.END_DATE,'yyyy-mm-dd hh24:mi:ss') END_DATE,NVL(ML.RUN_FLAG,0) RUN_FLAG ,NVL(ML.RUN_FLAG,0) STATUS,ML.LOG_MSG from MR_JOB_MAP_RUN_LOG ML where log_id = " +
					map.get("LOG_ID") +
					" union all " +
					" select RL.REDUCE_Task_Id TASK_ID,RL.LOG_ID,'REDUCE' Task_type ,RL.REDUCE_INPUT_COUNT INPUT_COUNT ,RL.REDUCE_OUTPUT_COUNT OUTPUT_COUNT, to_char(RL.START_DATE,'yyyy-mm-dd hh24:mi:ss') START_DATE, to_char(RL.END_DATE,'yyyy-mm-dd hh24:mi:ss') END_DATE,NVL(RL.RUN_FLAG,0)  RUN_FLAG ,NVL(RL.RUN_FLAG,0) STATUS,RL.LOG_MSG from Mr_Job_Reduce_Run_Log RL where log_id = " +
					map.get("LOG_ID") + " order by START_DATE desc";
			List<Map<String, Object>> col_detail_log_list = getDataAccess().queryForList(sql);
			int success = 0;// 成功数
			int failure = 0;// 失败数
			int MAP_SUCCESS = 0;
			int MAP_FAILURE = 0;
			int REDUCE_SUCCESS = 0;
			int REDUCE_FAILURE = 0;
			int MAP_RUNING = 0;
			int REDUCE_RUNING = 0;
			for (Map<String, Object> map2 : col_detail_log_list) {
				if (map2.get("RUN_FLAG").toString().equals("1")) {
					success++;
					if (map2.get("TASK_TYPE").toString().equals("MAP")) {
						MAP_SUCCESS++;
					} else {
						REDUCE_SUCCESS++;
					}
				} else if (map2.get("RUN_FLAG").toString().equals("2")) {
					failure++;
					if (map2.get("TASK_TYPE").toString().equals("MAP")) {
						MAP_FAILURE++;
					} else {
						REDUCE_FAILURE++;
					}
				} else if (map2.get("RUN_FLAG").toString().equals("0")) {
					if (map2.get("TASK_TYPE").toString().equals("MAP")) {
						MAP_RUNING++;
					} else {
						REDUCE_RUNING++;
					}
				}
			}
			map.put("LOG_ID_", "JOB" + map.get("LOG_ID"));
			map.put("SUCCESS", success);
			map.put("FAILURE", failure);
			map.put("MAP_SUCCESS", MAP_SUCCESS);
			map.put("MAP_FAILURE", MAP_FAILURE);
			map.put("REDUCE_SUCCESS", REDUCE_SUCCESS);
			map.put("REDUCE_FAILURE", REDUCE_FAILURE);
			map.put("MAP_RUNING", MAP_RUNING);
			map.put("REDUCE_RUNING", REDUCE_RUNING);
			map.put("MAP_RED", MAP_RUNING + "/" + REDUCE_RUNING);
			int filenumber = col_detail_log_list.size();
			if (filenumber == 0) {
				map.put("SCHEDULE", "100%");
			} else {
				map.put("SCHEDULE", ((success + failure) * 100 / filenumber) + "%");
			}

		}

		return map;
	}

	public List<Map<String, Object>> getLogDetail(Map<String, Object> data, Page page) {
		String sql = "";
		String log_id = data.get("LOG_ID_").toString();
		String task_type = "";
		if (log_id.startsWith("COL")) {
			task_type = "1";
			log_id = log_id.replace("COL", "");
		} else if (log_id.startsWith("JOB")) {
			task_type = "2";
			log_id = log_id.replace("JOB", "");
		}
		if (task_type.equals("1")) {
			sql = "select * from MR_FTP_COL_DETAIL_FILELOG where col_log_id = " + log_id;
			if (data.containsKey("STATE") && !data.get("STATE").toString().equals("")) {
				sql += " and STATUS = " + data.get("STATE").toString();
			}
			sql += " order by START_TIME desc";
		} else if (task_type.equals("2")) {
			sql = "select * from (select ML.Map_Task_Id TASK_ID,ML.LOG_ID,'MAP' Task_type, ML.MAP_INPUT_COUNT INPUT_COUNT ,ML.MAP_OUTPUT_COUNT OUTPUT_COUNT ,to_char(ML.START_DATE,'yyyy-mm-dd hh24:mi:ss') START_DATE, to_char(ML.END_DATE,'yyyy-mm-dd hh24:mi:ss') END_DATE,NVL(ML.RUN_FLAG,0) RUN_FLAG ,NVL(ML.RUN_FLAG,0) STATUS,ML.LOG_MSG from MR_JOB_MAP_RUN_LOG ML where log_id = " +
					log_id +
					" union all " +
					" select RL.REDUCE_Task_Id TASK_ID,RL.LOG_ID,'REDUCE' Task_type ,RL.REDUCE_INPUT_COUNT INPUT_COUNT ,RL.REDUCE_OUTPUT_COUNT OUTPUT_COUNT, to_char(RL.START_DATE,'yyyy-mm-dd hh24:mi:ss') START_DATE, to_char(RL.END_DATE,'yyyy-mm-dd hh24:mi:ss') END_DATE,NVL(RL.RUN_FLAG,0)  RUN_FLAG ,NVL(RL.RUN_FLAG,0) STATUS,RL.LOG_MSG from Mr_Job_Reduce_Run_Log RL where log_id = " +
					log_id + ")t where 1=1 ";
			if (data.containsKey("STATE") && !data.get("STATE").toString().equals("")) {
				sql += " and t.STATUS = " + data.get("STATE").toString();
			}
			sql += " order by START_DATE desc";
		}
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(getDataAccess(), sql, page);
		}
		List<Map<String, Object>> detail_log_list = getDataAccess().queryForList(sql);
		return detail_log_list;
	}

	public List<Map<String, Object>> getJobStatusLineData(Map<String, Object> data) {
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		String userId = formatUser.get("userId").toString();
		String adminFlag = formatUser.get("adminFlag").toString();

		Integer interval = Integer.valueOf(data.get("interval").toString());
		SimpleDateFormat df = new SimpleDateFormat("HH:mm");

		Calendar c = Calendar.getInstance();
		c.add(Calendar.DAY_OF_MONTH, -1);
		c.add(Calendar.HOUR, 0);
		int min = (c.get(Calendar.MINUTE) / interval + 1) * interval;
		c.set(Calendar.MINUTE, min);
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		if (MonitorData.getMonitorConfig().get("ISAUTOREFRESH").toString().equals("0") &&
				MonitorData.getMonitorConfig().get("ISMANUREFRESH").toString().equals("0")) {

		} else {
			String sql = " select " +
					" to_char((trunc(sysdate)+trunc((date_time-trunc(sysdate))*24*60/" +
					interval +
					"+ (case when to_char(date_time,'yyyymmdd')<to_char(sysdate,'yyyymmdd') then -1 else 0 end ))*" +
					interval +
					"/60/24),'hh24:mi') date_time," +
					" sum(decode(T.STATUS,1,1,0)) SUCCESS," +
					" sum(decode(T.STATUS,2,1,0)) FAILURE," +
					" sum(decode(T.STATUS,5,1,0)) STARTNUM" +
					" from (" +
					" select status STATUS,cj.col_id  TASK_ID,cj.col_origin task_type,cj.col_type job_type,to_date(end_time,'yyyy-mm-dd:hh24:mi:ss') date_time from MR_FTP_COL_FILE_LOG FL inner join MR_FTP_COL_JOB cj on fl.col_id = cj.col_id where fl.start_time>to_char(sysdate-1,'yyyy-mm-dd hh24:mi:ss') " +
					" union all" +
					" select 5 STATUS,cj.col_id  TASK_ID,cj.col_origin task_type,cj.col_type job_type,to_date(start_time,'yyyy-mm-dd:hh24:mi:ss') date_time from MR_FTP_COL_FILE_LOG FL inner join MR_FTP_COL_JOB cj on fl.col_id = cj.col_id where fl.start_time>to_char(sysdate-1,'yyyy-mm-dd hh24:mi:ss')" +
					" union all" +
					" select RUN_FLAG STATUS,jr.job_id TASK_ID,2 task_type,mj.job_type,END_DATE date_time FROM MR_JOB_RUN_LOG JR inner join mr_job mj on jr.job_id=mj.job_id where JR.START_DATE>sysdate-1" +
					" union all" +
					" select 5 STATUS,jr.job_id TASK_ID,2 task_type,mj.job_type,START_DATE date_time FROM MR_JOB_RUN_LOG JR inner join mr_job mj on jr.job_id=mj.job_id where JR.START_DATE>sysdate-1" +
					" )  T INNER JOIN META_MR_USER_AUTHOR UA ON T.TASK_ID = UA.TASK_ID AND decode(T.TASK_TYPE,0,1,T.TASK_TYPE) = UA.TASK_TYPE AND UA.USER_ID =UA.CREATE_USER_ID " +
					" where date_time is not null";
			if (!adminFlag.equals("1")) {
				sql += " and UA.USER_ID = " + userId;
			}
			if (data.containsKey("task_type")) {
				sql += " and T.task_type= " + data.get("task_type").toString();
			}
			if (data.containsKey("job_type")) {
				sql += " and T.job_type= " + data.get("job_type").toString();
			}

			sql += " GROUP BY " + " to_char((trunc(sysdate)+trunc((date_time-trunc(sysdate))*24*60/" + interval +
					"+ (case when to_char(date_time,'yyyymmdd')<to_char(sysdate,'yyyymmdd') then -1 else 0 end ))*" +
					interval + "/60/24),'hh24:mi')" + " order by 1";
			list = getDataAccess().queryForList(sql);
		}
		List<Map<String, Object>> rlist = new ArrayList<Map<String, Object>>();
		int count = 1440 / interval;
		for (int i = 0; i < count; i++) {
			String date_time = df.format(c.getTime());
			c.add(Calendar.MINUTE, interval);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("DATE_TIME", date_time);
			map.put("SUCCESS", 0);
			map.put("FAILURE", 0);
			map.put("STARTNUM", 0);
			for (Map<String, Object> tmap : list) {
				if (tmap.get("DATE_TIME").toString().equals(date_time)) {
					map = tmap;
					continue;
				}
			}
			rlist.add(map);
		}
		return rlist;
	}

	public Map<String, Object> getMonitorConfig() {
		String sql = "select * from META_MAG_MONITOR where rownum = 1";
		return getDataAccess().queryForMap(sql);
	}

	public void updateMonitorConfig(Map<String, Object> data) {
		int REPEATINTERVAL = Integer.valueOf(data.get("REPEATINTERVAL").toString()) * 1000;
		int WEBINTERVAL = Integer.valueOf(data.get("WEBINTERVAL").toString()) * 1000;
		int ISAUTOREFRESH = Integer.valueOf(data.get("ISAUTOREFRESH").toString());
		int ISMANUREFRESH = Integer.valueOf(data.get("ISMANUREFRESH").toString());
		String HADOOPJOBURL = data.get("HADOOPJOBURL").toString();
		String HADOOPVERSION = data.get("HADOOPVERSION").toString();
		String sql = "update meta_mag_timer set timer_rule = '-1," + REPEATINTERVAL + "' where timer_id = " +
				MonitorTimer.TimerName;
		getDataAccess().execUpdate(sql);
		sql = "update META_MAG_MONITOR set REPEATINTERVAL = " + REPEATINTERVAL + ", WEBINTERVAL = " + WEBINTERVAL +
				", ISAUTOREFRESH = " + ISAUTOREFRESH + ", HADOOPJOBURL = '" + HADOOPJOBURL + "', HADOOPVERSION = '" +
				HADOOPVERSION + "', ISMANUREFRESH = " + ISMANUREFRESH;
		getDataAccess().execUpdate(sql);
	}

}
