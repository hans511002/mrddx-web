package com.ery.meta.module.bigdata.mrddx.config;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;
import com.ery.meta.module.datarole.UserAuthorDAO;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**

 * 

 * @description Job管理action
 * @date 2013-04-18
 */
public class JobAction {

	private JobDAO jobDAO;
	private UserAuthorDAO userAuthorDAO;

	/**
	 * 查询数据源参数表--无 分页：根据数据源ID
	 * 
	 * @return
	 */
	public List<Map<String, Object>> queryDataSourceParam(Map<String, Object> data) {
		return jobDAO.queryDataSourceParam(data);
	}

	/**
	 * 查询源类型参数表--无分页：根据数据源ID + 源类型ID
	 * 
	 * @return
	 */
	public List<Map<String, Object>> querySourceParam(Map<String, Object> data) {
		return jobDAO.querySourceParam(data);
	}

	/**
	 * 查询系统参数表信息--无分页
	 * 
	 * @return
	 */
	public List<Map<String, Object>> querySystemParam(Map<String, Object> data) {
		return jobDAO.querySystemParam(data);
	}

	/**
	 * 查询源类型名称
	 * 
	 * @return
	 */
	public List<Map<String, Object>> querySourceType() {
		return jobDAO.querySourceType();
	}

	/**
	 * 查询 数据源
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryDataSource(Map<String, Object> data, Page page) {
		return jobDAO.queryDataSource(data, page);
	}

	/**
	 * 查询数据类型（按source_cate分组）
	 * 
	 * @return
	 */
	public Map<String, List<Map<String, Object>>> querySourceTypeMap() {
		return jobDAO.querySourceTypeMap();
	}

	/**
	 * 查询job表信息
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryJob(Map<String, Object> data, Page page) {
		return jobDAO.queryJob(data, page);
	}

	/**
	 * 查询单条job表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryJobById(Map<String, Object> data) {
		return jobDAO.queryJobById(data);
	}

	/**
	 * 查询单条job参数表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryJobParamById(Map<String, Object> data) {
		return jobDAO.queryJobParamById(data);
	}

	/**
	 * 查询job输入、输出、系统参数信息
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryJobParamAll(Map<String, Object> data) {
		return jobDAO.queryJobParamAll();
	}

	/**
	 * 保存job数据（增，改，copy）
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> saveJob(Map<String, Object> data) {
		Map<String, Object> ret = new HashMap<String, Object>();
		List<Map<String, Object>> paramInfos = (List<Map<String, Object>>) data.get("PARAM_INFOS");
		Map<String, Object> jobMap = new HashMap<String, Object>();
		jobMap.put("INPUT_DATA_SOURCE_ID", data.get("INPUT_DS"));
		jobMap.put("OUTPUT_DATA_SOURCE_ID", data.get("OUT_DS"));
		jobMap.put("JOB_NAME", data.get("JOB_NAME"));
		jobMap.put("JOB_PRIORITY", data.get("JOB_PRIORITY"));
		jobMap.put("INPUT_DIR", data.get("INPUT_DIR"));
		jobMap.put("MAP_TASKS", data.get("MAP_TASK_NUM"));
		jobMap.put("REDUCE_TASKS", data.get("REDUCE_TASK_NUM"));
		jobMap.put("JOB_DESCRIBE", data.get("JOB_DESC"));
		jobMap.put("JOB_RUN_DATASOURCE", data.get("RUN_DS"));
		jobMap.put("JOB_TYPE", data.get("JOB_TYPE"));
		jobMap.put("INPUT_PLUGIN_CODE", data.get("inputPluginValue"));
		jobMap.put("OUTPUT_PLUGIN_CODE", data.get("outputPluginValue"));

		int optFlag = Convert.toInt(data.get("optFlag"), 0);
		long jobId = Convert.toLong(data.get("jobId"), 0);
		try {
			BaseDAO.beginTransaction();
			if (optFlag == 0 || optFlag == 2) {
				jobDAO.insertJob(jobMap);
				jobId = Convert.toLong(jobMap.get("JOB_ID"));
				userAuthorDAO.insertUserAuthor("2", String.valueOf(jobId));
			} else {
				jobMap.put("JOB_ID", jobId);
				jobDAO.updateJob(jobMap);
				jobDAO.deleteJobParam(jobId);
			}

			// 保存参数信息
			for (Map<String, Object> param : paramInfos) {
				param.put("JOB_ID", jobId);
				System.out.println(param.toString());
			}
			jobDAO.insertBatchJobParams(paramInfos);
			BaseDAO.commit();
			ret.put("flag", 1);
		} catch (Exception e) {
			BaseDAO.rollback();
			ret.put("flag", 0);
			ret.put("msg", e.getMessage());
			LogUtils.error("", e);
		}
		return ret;
	}

	/**
	 * 新增Job任务
	 * 
	 * @param data
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public boolean insertJob(Map<String, Object> data) {
		boolean result = false;
		Map<String, Object> jobMap = new HashMap<String, Object>();
		Map<String, String> dataInput = (Map<String, String>) data.get("dataInput");
		Map<String, String> dataOutput = (Map<String, String>) data.get("dataOutput");
		Map<String, String> jobConfigParamForm = (Map<String, String>) data.get("jobConfigParamForm");

		List<Map<String, Object>> dataInputInfos = (List<Map<String, Object>>) data.get("dataInputInfos");
		List<Map<String, Object>> dataOutputInfos = (List<Map<String, Object>>) data.get("dataOutputInfos");
		List<Map<String, Object>> dataSystemInfos = (List<Map<String, Object>>) data.get("dataSystemInfos");

		// 输入数据源
		jobMap.put("INPUT_DATA_SOURCE_ID", MapUtils.getString(dataInput, "DATA_SOURCE_ID"));
		// 输出数据源
		jobMap.put("OUTPUT_DATA_SOURCE_ID", MapUtils.getString(dataOutput, "DATA_SOURCE_ID"));
		// 获取Form表单数据
		jobMap.put("JOB_NAME", MapUtils.getString(jobConfigParamForm, "jobName"));
		jobMap.put("JOB_PRIORITY", MapUtils.getString(jobConfigParamForm, "jobPriority"));
		jobMap.put("JOB_STATUS", MapUtils.getString(jobConfigParamForm, "jobStatus"));
		jobMap.put("INPUT_DIR", MapUtils.getString(jobConfigParamForm, "inputDir"));
		jobMap.put("MAP_TASKS", MapUtils.getString(jobConfigParamForm, "mapTasks"));
		jobMap.put("REDUCE_TASKS", MapUtils.getString(jobConfigParamForm, "reduceTasks"));
		jobMap.put("JOB_DESCRIBE", MapUtils.getString(jobConfigParamForm, "jobDescribe"));
		jobMap.put("JOB_RUN_DATASOURCE", MapUtils.getString(jobConfigParamForm, "jobRunDatasource"));
		jobMap.put("INPUT_PLUGIN_CODE", data.get("inputPluginValue"));
		jobMap.put("OUTPUT_PLUGIN_CODE", data.get("outputPluginValue"));

		try {
			BaseDAO.beginTransaction();
			// 首先插入job表
			result = jobDAO.insertJob(jobMap);

			Object jobId = jobMap.get("JOB_ID");

			userAuthorDAO.insertUserAuthor("2", jobId.toString());

			// 最后循环插入：输入、输出、系统参数进Job参数表
			if (!dataInputInfos.isEmpty()) {
				for (int i = 0; i < dataInputInfos.size(); i++) {
					Map<String, Object> dataInputInfo = dataInputInfos.get(i);
					dataInputInfo.put("JOB_ID", jobId);
					result = jobDAO.insertJobParam(dataInputInfo);
				}
			}
			if (!dataOutputInfos.isEmpty()) {
				for (int i = 0; i < dataOutputInfos.size(); i++) {
					Map<String, Object> dataOutputInfo = dataOutputInfos.get(i);
					dataOutputInfo.put("JOB_ID", jobId);
					result = jobDAO.insertJobParam(dataOutputInfo);
				}
			}
			if (!dataSystemInfos.isEmpty()) {
				for (int i = 0; i < dataSystemInfos.size(); i++) {
					Map<String, Object> dataSystemInfo = dataSystemInfos.get(i);
					dataSystemInfo.put("JOB_ID", jobId);
					result = jobDAO.insertJobParam(dataSystemInfo);
				}
			}
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("", e);
		}
		return result;
	}

	/**
	 * 修改Job任务
	 * 
	 * @param data
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public boolean updateJob(Map<String, Object> data) {
		boolean result = false;
		Map<String, Object> jobMap = new HashMap<String, Object>();
		Map<String, String> dataInput = (Map<String, String>) data.get("dataInput");
		Map<String, String> dataOutput = (Map<String, String>) data.get("dataOutput");
		Map<String, String> jobConfigParamForm = (Map<String, String>) data.get("jobConfigParamForm");

		List<Map<String, Object>> dataInputInfos = (List<Map<String, Object>>) data.get("dataInputInfos");
		List<Map<String, Object>> dataOutputInfos = (List<Map<String, Object>>) data.get("dataOutputInfos");
		List<Map<String, Object>> dataSystemInfos = (List<Map<String, Object>>) data.get("dataSystemInfos");

		int jobId = Convert.toInt(data.get("jobId"));
		// JobId
		jobMap.put("JOB_ID", MapUtils.getString(data, "jobId"));

		if (dataInput == null || dataOutput == null) {
			// 输入数据源
			jobMap.put("INPUT_DATA_SOURCE_ID", MapUtils.getString(data, "inputDataSourceId"));
			// 输出数据源
			jobMap.put("OUTPUT_DATA_SOURCE_ID", MapUtils.getString(data, "outputDataSourceId"));
		} else {
			// 输入数据源
			jobMap.put("INPUT_DATA_SOURCE_ID", MapUtils.getString(dataInput, "DATA_SOURCE_ID"));
			// 输出数据源
			jobMap.put("OUTPUT_DATA_SOURCE_ID", MapUtils.getString(dataOutput, "DATA_SOURCE_ID"));
		}

		// 获取Form表单数据
		jobMap.put("JOB_NAME", MapUtils.getString(jobConfigParamForm, "jobName"));
		jobMap.put("JOB_PRIORITY", MapUtils.getString(jobConfigParamForm, "jobPriority"));
		jobMap.put("JOB_STATUS", MapUtils.getString(jobConfigParamForm, "jobStatus"));
		jobMap.put("INPUT_DIR", MapUtils.getString(jobConfigParamForm, "inputDir"));
		jobMap.put("MAP_TASKS", MapUtils.getString(jobConfigParamForm, "mapTasks"));
		jobMap.put("REDUCE_TASKS", MapUtils.getString(jobConfigParamForm, "reduceTasks"));
		jobMap.put("JOB_DESCRIBE", MapUtils.getString(jobConfigParamForm, "jobDescribe"));
		jobMap.put("JOB_RUN_DATASOURCE", MapUtils.getString(jobConfigParamForm, "jobRunDatasource"));
		jobMap.put("INPUT_PLUGIN_CODE", data.get("inputPluginValue"));
		jobMap.put("OUTPUT_PLUGIN_CODE", data.get("outputPluginValue"));

		try {
			BaseDAO.beginTransaction();
			// 首先修改job表
			result = jobDAO.updateJob(jobMap);

			// 其次根据JobId查询存在的Job参数表信息
			List<Map<String, Object>> listParam = (List<Map<String, Object>>) jobDAO.queryJobParam(jobId);

			// 其次判别是否有记录
			if (listParam.size() != 0 || !listParam.isEmpty()) {
				for (int i = 0; i < listParam.size(); i++) {
					// 再次循环删除job参数信息
					jobDAO.deleteJobParam(jobId);
				}
				// 最后循环插入：输入、输出、系统参数进Job参数表
				if (!dataInputInfos.isEmpty()) {
					for (int i = 0; i < dataInputInfos.size(); i++) {
						Map<String, Object> dataInputInfo = dataInputInfos.get(i);
						dataInputInfo.put("JOB_ID", jobId);
						result = jobDAO.insertJobParam(dataInputInfo);
					}
				}
				if (!dataOutputInfos.isEmpty()) {
					for (int i = 0; i < dataOutputInfos.size(); i++) {
						Map<String, Object> dataOutputInfo = dataOutputInfos.get(i);
						dataOutputInfo.put("JOB_ID", jobId);
						result = jobDAO.insertJobParam(dataOutputInfo);
					}
				}
				if (!dataSystemInfos.isEmpty()) {
					for (int i = 0; i < dataSystemInfos.size(); i++) {
						Map<String, Object> dataSystemInfo = dataSystemInfos.get(i);
						dataSystemInfo.put("JOB_ID", jobId);
						result = jobDAO.insertJobParam(dataSystemInfo);
					}
				}
			}
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("", e);
		}
		return result;
	}

	/**
	 * 复制Job任务
	 * 
	 * @param data
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public boolean copyJob(Map<String, Object> data) {
		boolean result = false;
		Map<String, Object> jobMap = new HashMap<String, Object>();
		Map<String, String> dataInput = (Map<String, String>) data.get("dataInput");
		Map<String, String> dataOutput = (Map<String, String>) data.get("dataOutput");
		Map<String, String> jobConfigParamForm = (Map<String, String>) data.get("jobConfigParamForm");

		List<Map<String, Object>> dataInputInfos = (List<Map<String, Object>>) data.get("dataInputInfos");
		List<Map<String, Object>> dataOutputInfos = (List<Map<String, Object>>) data.get("dataOutputInfos");
		List<Map<String, Object>> dataSystemInfos = (List<Map<String, Object>>) data.get("dataSystemInfos");

		if (dataInput == null || dataOutput == null) {
			// 输入数据源
			jobMap.put("INPUT_DATA_SOURCE_ID", MapUtils.getString(data, "inputDataSourceId"));
			// 输出数据源
			jobMap.put("OUTPUT_DATA_SOURCE_ID", MapUtils.getString(data, "outputDataSourceId"));
		} else {
			// 输入数据源
			jobMap.put("INPUT_DATA_SOURCE_ID", MapUtils.getString(dataInput, "DATA_SOURCE_ID"));
			// 输出数据源
			jobMap.put("OUTPUT_DATA_SOURCE_ID", MapUtils.getString(dataOutput, "DATA_SOURCE_ID"));
		}

		// 获取Form表单数据
		jobMap.put("JOB_NAME", MapUtils.getString(jobConfigParamForm, "jobName"));
		jobMap.put("JOB_PRIORITY", MapUtils.getString(jobConfigParamForm, "jobPriority"));
		jobMap.put("JOB_STATUS", MapUtils.getString(jobConfigParamForm, "jobStatus"));
		jobMap.put("INPUT_DIR", MapUtils.getString(jobConfigParamForm, "inputDir"));
		jobMap.put("MAP_TASKS", MapUtils.getString(jobConfigParamForm, "mapTasks"));
		jobMap.put("REDUCE_TASKS", MapUtils.getString(jobConfigParamForm, "reduceTasks"));
		jobMap.put("JOB_DESCRIBE", MapUtils.getString(jobConfigParamForm, "jobDescribe"));
		jobMap.put("JOB_RUN_DATASOURCE", MapUtils.getString(jobConfigParamForm, "jobRunDatasource"));

		try {
			BaseDAO.beginTransaction();
			// 首先修改job表
			result = jobDAO.insertJob(jobMap);

			Object jobId = jobMap.get("JOB_ID");
			userAuthorDAO.insertUserAuthor("2", jobId.toString());

			// 最后循环插入：输入、输出、系统参数进Job参数表
			if (!dataInputInfos.isEmpty()) {
				for (int i = 0; i < dataInputInfos.size(); i++) {
					Map<String, Object> dataInputInfo = dataInputInfos.get(i);
					dataInputInfo.put("JOB_ID", jobId);
					result = jobDAO.insertJobParam(dataInputInfo);
				}
			}
			if (!dataOutputInfos.isEmpty()) {
				for (int i = 0; i < dataOutputInfos.size(); i++) {
					Map<String, Object> dataOutputInfo = dataOutputInfos.get(i);
					dataOutputInfo.put("JOB_ID", jobId);
					result = jobDAO.insertJobParam(dataOutputInfo);
				}
			}
			if (!dataSystemInfos.isEmpty()) {
				for (int i = 0; i < dataSystemInfos.size(); i++) {
					Map<String, Object> dataSystemInfo = dataSystemInfos.get(i);
					dataSystemInfo.put("JOB_ID", jobId);
					result = jobDAO.insertJobParam(dataSystemInfo);
				}
			}
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("", e);
		}
		return result;
	}

	/**
	 * 根据ID删除Job配置信息
	 * 
	 * @param serverId
	 * @return
	 */
	public boolean deleteJob(int jobId) {
		// boolean result = false;

		try {
			BaseDAO.beginTransaction();
			// 删除mapreduce详细日志信息
			jobDAO.deleteMapLogMsg(jobId);
			jobDAO.deleteReduceLogMsg(jobId);

			// 删除mapreduce日志信息
			jobDAO.deleteMapLog(jobId);
			jobDAO.deleteReduceLog(jobId);

			// 删除job详情日志信息
			jobDAO.deleteJobLogMsg(jobId);
			jobDAO.deleteJobLog(jobId);

			// 删除文件作为输入的处理日志信息
			jobDAO.deleteJobMapDataLog(jobId);

			// 删除job表
			jobDAO.deleteJobParam(jobId);
			jobDAO.deleteJob(jobId);

			userAuthorDAO.delete(jobId, 2);
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			e.printStackTrace();
			LogUtils.error("", e);
			return false;
		}
		return true;
	}

	/**
	 * 查询单条job参数表：输入参数
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryInputParamById(Map<String, Object> data) {
		return jobDAO.queryInputParamById(data);
	}

	/**
	 * 查询单条job参数表：输出参数
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryOutputParamById(Map<String, Object> data) {
		return jobDAO.queryOutputParamById(data);
	}

	/**
	 * 查询单条job参数表：系统参数
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> querySysParamById(Map<String, Object> data) {
		return jobDAO.querySysParamById(data);
	}

	public void setjobDAO(JobDAO jobDAO) {
		this.jobDAO = jobDAO;
	}

	public void setuserAuthorDAO(UserAuthorDAO userAuthorDAO) {
		this.userAuthorDAO = userAuthorDAO;
	}
}
