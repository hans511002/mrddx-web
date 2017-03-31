package com.ery.meta.module.bigdata.mrddx.log;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.web.init.SystemVariableInit;

/**

 * 

 * @description 日志查询Action
 * @date 2013-04-18
 */
public class JobLogAction {

	private JobLogDAO jobLogDAO;
	private String filePath = "";
	File fileAllName = null;
	String fileName = "";
	private FileWriter writer;
	private PrintWriter pw;
	private String fileAllPath = "";

	/**
	 * 查询运行job日志表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryJobLog(Map<String, Object> data, Page page) {
		return jobLogDAO.queryJobLog(data, page);
	}

	/**
	 * 查询运行job详细日志表--无分页
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryJobMsgLog(Map<String, Object> data, Page page) {
		if (page == null) {
			page = new Page(0, 20);
		}
		return jobLogDAO.queryJobMsgLog(data, page);
	}

	/**
	 * 查询Map日志表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryMapLog(Map<String, Object> data, Page page) {
		return jobLogDAO.queryMapLog(data, page);
	}

	/**
	 * 查询Map详细日志表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryMapMsgLog(Map<String, Object> data, Page page) {
		return jobLogDAO.queryMapMsgLog(data, page);
	}

	/**
	 * 查询Reduce日志表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryReduceLog(Map<String, Object> data, Page page) {
		return jobLogDAO.queryReduceLog(data, page);
	}

	/**
	 * 查询Reduce详细日志表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryReduceMsgLog(Map<String, Object> data, Page page) {
		return jobLogDAO.queryReduceMsgLog(data, page);
	}

	/**
	 * 查询数据库表信息生成日志文件
	 * 
	 * @param logId
	 * @return
	 * 
	 */
	public boolean writeLogFile(String logId, String date) {
		try {
			filePath = SystemVariableInit.WEB_ROOT_PATH + SystemVariable.getString("logger.filePath") + "/";
			fileName = "mrddx_" + date + "_" + logId + ".log";
			fileAllPath = filePath + fileName;
			fileAllName = new File(fileAllPath);
			try {
				writer = new FileWriter(fileAllPath);
				pw = new PrintWriter(new BufferedWriter(writer));

				// 获取Job日志信息
				List<Map<String, Object>> listLog = (List<Map<String, Object>>) jobLogDAO.getJobLog(logId);

				if (listLog.size() != 0 || !listLog.isEmpty()) {
					String strLog = "";
					for (int i = 0; i < listLog.size(); i++) {
						strLog += listLog.get(i).get("MONTH_NO").toString() + "|" + listLog.get(i).get("DATA_NO") + "|"
								+ listLog.get(i).get("START_DATE") + "|" + listLog.get(i).get("END_DATE") + "|"
								+ listLog.get(i).get("LOG_ID") + "|" + listLog.get(i).get("JOB_ID") + "|"
								+ listLog.get(i).get("RUN_FLAG") + "|" + listLog.get(i).get("ROW_RECORD") + "|"
								+ listLog.get(i).get("ALL_FILE_SIZE") + "|" + listLog.get(i).get("EXEC_CMDT") + "|"
								+ listLog.get(i).get("MAP_INPUT_COUNT") + "|"
								+ listLog.get(i).get("REDUCE_INPUT_COUNT") + "|"
								+ listLog.get(i).get("MAP_OUTPUT_COUNT") + "|"
								+ listLog.get(i).get("REDUCE_OUTPUT_COUNT") + "|" + listLog.get(i).get("LOG_MSG");
						createFile(strLog);
					}

					// 获取Job日志详细信息
					List<Map<String, Object>> listLogMsg = (List<Map<String, Object>>) jobLogDAO.getJobLogMsg(logId);
					String strLogMsg = "\r\n";
					if (listLogMsg.size() != 0 || !listLogMsg.isEmpty()) {
						for (int j = 0; j < listLogMsg.size(); j++) {
							strLogMsg += listLogMsg.get(j).get("LOG_TIME").toString() + "|"
									+ listLogMsg.get(j).get("LOG_ID").toString() + "|"
									+ listLogMsg.get(j).get("LOG_TYPE").toString() + "|"
									+ listLogMsg.get(j).get("LOG_INFO").toString();
							createFile(strLogMsg);
							// 清空数据
							strLogMsg = "";
						}

					}

					// 获取存在Map日志
					List<Map<String, Object>> listMapLog = (List<Map<String, Object>>) jobLogDAO.getMapLog(logId);

					if (listMapLog.size() != 0 || !listMapLog.isEmpty()) {
						String strMapLog = "";
						for (int k = 0; k < listMapLog.size(); k++) {
							// 获取mapTaskId值
							String mapTaskId = (String) listMapLog.get(k).get("MAP_TASK_ID").toString();
							strMapLog += listMapLog.get(k).get("MAP_TASK_ID") + "|" + listMapLog.get(k).get("LOG_ID")
									+ "|" + listMapLog.get(k).get("MAP_INPUT_COUNT") + "|"
									+ listMapLog.get(k).get("MAP_OUTPUT_COUNT") + "|"
									+ listMapLog.get(k).get("START_DATE") + "|" + listMapLog.get(k).get("END_DATE")
									+ "|" + listMapLog.get(k).get("RUN_FLAG") + "|" + listMapLog.get(k).get("LOG_MSG");
							createFile(strMapLog);
							strMapLog = "";
							// 获取存在Map日志详细信息
							List<Map<String, Object>> listMapLogMsg = (List<Map<String, Object>>) jobLogDAO
									.getMapLogMsg(mapTaskId);

							if (listMapLogMsg.size() != 0 || !listMapLogMsg.isEmpty()) {
								String strMapLogMsg = "";
								for (int l = 0; l < listMapLogMsg.size(); l++) {
									strMapLogMsg += listMapLogMsg.get(k).get("MAP_TASK_ID") + "|"
											+ listMapLogMsg.get(k).get("LOG_ID") + "|"
											+ listMapLogMsg.get(k).get("LOG_TYPE") + "|"
											+ listMapLogMsg.get(k).get("LOG_DATE") + "|"
											+ listMapLogMsg.get(k).get("LOG_MSG");
									createFile(strMapLogMsg);
									strMapLogMsg = "";
								}
							}
						}
					}

					// 获取存在Reduce日志
					List<Map<String, Object>> listReduceLog = (List<Map<String, Object>>) jobLogDAO.getReduceLog(logId);
					String strReduceLog = "";
					if (listReduceLog.size() != 0 || !listReduceLog.isEmpty()) {
						for (int m = 0; m < listReduceLog.size(); m++) {
							strReduceLog += listReduceLog.get(m).get("REDUCE_TASK_ID") + "|"
									+ listReduceLog.get(m).get("LOG_ID") + "|"
									+ listReduceLog.get(m).get("REDUCE_INPUT_COUNT") + "|"
									+ listReduceLog.get(m).get("REDUCE_OUTPUT_COUNT") + "|"
									+ listReduceLog.get(m).get("START_DATE") + "|"
									+ listReduceLog.get(m).get("END_DATE") + "|" + listReduceLog.get(m).get("RUN_FLAG")
									+ "|" + listReduceLog.get(m).get("LOG_MSG");
							createFile(strReduceLog);
							strReduceLog = "";

							// 获取reduceTaskId值
							String reduceTaskId = (String) listReduceLog.get(m).get("REDUCE_TASK_ID").toString();
							// 获取存在Reduce日志详细信息
							List<Map<String, Object>> listReduceLogMsg = (List<Map<String, Object>>) jobLogDAO
									.getReduceLogMsg(reduceTaskId);
							String strReduceLogMsg = "";
							if (listReduceLogMsg.size() != 0 || !listReduceLogMsg.isEmpty()) {
								for (int n = 0; n < listReduceLogMsg.size(); n++) {
									strReduceLogMsg += listReduceLogMsg.get(n).get("REDUCE_TASK_ID") + "|"
											+ listReduceLogMsg.get(n).get("LOG_ID") + "|"
											+ listReduceLogMsg.get(n).get("LOG_TYPE") + "|"
											+ listReduceLogMsg.get(n).get("LOG_DATE") + "|"
											+ listReduceLogMsg.get(n).get("LOG_MSG");
									createFile(strReduceLogMsg);
									strReduceLogMsg = "";
								}
							}
						}
					}
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			pw.flush();
			try {
				writer.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		return true;
	}

	/**
	 * 创建file日志文件
	 * 
	 * @param s
	 */
	public void createFile(String s) {
		pw.println(s);
	}

	/**
	 * 根据文件名查找相应的日志文件
	 * 
	 * @param fileName
	 * @return
	 */
	public BufferedReader readLogFile(String fileName) {
		BufferedReader reader = null;
		// 查找文件是否存在
		File file = new File(SystemVariableInit.WEB_ROOT_PATH, SystemVariable.getString("logger.filePath") + "/"
				+ fileName);
		if (!file.exists()) {
			LogUtils.debug(file.getName() + "未找到");
		} else {
			try {
				reader = new BufferedReader(new FileReader(file));
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			}
		}
		return reader;
	}

	public void setdataSourceDAO(JobLogDAO jobLogDAO) {
		this.jobLogDAO = jobLogDAO;
	}
}
