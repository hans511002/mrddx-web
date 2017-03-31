package com.ery.meta.module.analysis;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

import com.ery.base.support.utils.MapUtils;

/******************************************************

 * 
 * Collectname： AnalysisAction Description：
 * 
 * Dependent：
 * 
 * Author: 王鹏坤
 * 
 ********************************************************/
public class AnalysisAction {
	private AnalysisDao analysisDao;

	/**
	 * 查询统计数据
	 * 
	 * @param paramData
	 * @return
	 */
	public Map<String, Object> queryAnalysisData(Map<String, Object> paramData) {
		Map<String, Object> mapRs = new HashMap<String, Object>();
		List<Map<String, Object>> lstColFlagTemp = analysisDao.getColFlag();
		List<Integer> lstColFlag = new ArrayList<Integer>();
		List<Long> lstAuthorCol = new ArrayList<Long>();
		List<Long> lstAuthorDeal = new ArrayList<Long>();

		if (lstColFlagTemp != null) {
			for (Map<String, Object> mapColFlagTemp : lstColFlagTemp) {
				int flag = MapUtils.getIntValue(mapColFlagTemp, "ACTION_TYPE");
				if (flag == 5001 || flag == 6001 || flag == 7001) {
					lstColFlag.add(flag);
				}
			}
		}

		List<Map<String, Object>> lstAuthorColTemp = analysisDao.queryAuthorColList(lstColFlag);
		if (lstAuthorColTemp != null) {
			for (Map<String, Object> mapAuthorColTemp : lstAuthorColTemp) {
				long flag = MapUtils.getIntValue(mapAuthorColTemp, "COL_ID");
				lstAuthorCol.add(flag);
			}
		}

		List<Map<String, Object>> lstAuthorDealTemp = analysisDao.queryAuthorDealList(lstColFlag);
		if (lstAuthorDealTemp != null) {
			for (Map<String, Object> mapAuthorDealTemp : lstAuthorDealTemp) {
				long flag = MapUtils.getIntValue(mapAuthorDealTemp, "JOB_ID");
				lstAuthorDeal.add(flag);
			}
		}

		List<Map<String, Object>> lstAnalysisData = analysisDao.queryAnalysisData(paramData, lstAuthorCol,
				lstAuthorDeal);// 统计总数
		List<Map<String, Object>> lstAnalysisFailData = analysisDao.queryAnalysisFailData(paramData, lstAuthorCol,
				lstAuthorDeal);// 统计失败数
		// List<Map<String,Object>> lstAnalysisCollectData =
		// analysisDao.queryAnalysisCollectData(paramData);//统计采集数
		// List<Map<String,Object>> lstAnalysisDealData =
		// analysisDao.queryAnalysisDealData(paramData);//统计处理数
		List<Map<String, Object>> lstAnalysisCollectDealData = analysisDao.queryAnalyCollectDealData(paramData,
				lstAuthorCol, lstAuthorDeal);
		// Map<String,Object> mapCount =
		// analysisDao.queryAnalysisInfo(paramData);//统计总数，成功，失败数
		// List<Map<String,Object>> lstQueryData =
		// analysisDao.queryAnalysisList(paramData);//表格数据
		List<Map<String, Object>> lstMrType = analysisDao.queryMrTypeInfo(); // 查询业务类型
		mapRs.put("CHART_DATA", lstAnalysisData);
		mapRs.put("CHART_FAIL_DATA", lstAnalysisFailData);
		// mapRs.put("CHART_COLLECT_DATA", lstAnalysisCollectData);
		// mapRs.put("CHART_DEAL_DATA", lstAnalysisDealData);
		// mapRs.put("CHART_COUNT_DATA", mapCount);
		mapRs.put("CHART_COLLECT_DEAL_DATA", lstAnalysisCollectDealData);
		// mapRs.put("CHART_QUERY_DATA", lstQueryData);
		mapRs.put("MR_TYPE", lstMrType);
		return mapRs;
	}

	/**
	 * 查询表格数据
	 * 
	 * @param paraData
	 * @return
	 * @throws ParseException
	 */
	public List<Map<String, Object>> queryChartDataInfo(Map<String, Object> paramData) throws ParseException {
		List<Map<String, Object>> lstColFlagTemp = analysisDao.getColFlag();
		List<Integer> lstColFlag = new ArrayList<Integer>();
		List<Long> lstAuthorCol = new ArrayList<Long>();
		List<Long> lstAuthorDeal = new ArrayList<Long>();

		for (Map<String, Object> mapColFlagTemp : lstColFlagTemp) {
			int flag = MapUtils.getIntValue(mapColFlagTemp, "ACTION_TYPE");
			if (flag == 5001 || flag == 6001 || flag == 7001) {
				lstColFlag.add(flag);
			}
		}
		List<Map<String, Object>> lstAuthorColTemp = analysisDao.queryAuthorColList(lstColFlag);
		if (lstAuthorColTemp != null) {
			for (Map<String, Object> mapAuthorColTemp : lstAuthorColTemp) {
				long flag = MapUtils.getIntValue(mapAuthorColTemp, "COL_ID");
				lstAuthorCol.add(flag);
			}
		}

		List<Map<String, Object>> lstAuthorDealTemp = analysisDao.queryAuthorDealList(lstColFlag);
		if (lstAuthorDealTemp != null) {
			for (Map<String, Object> mapAuthorDealTemp : lstAuthorDealTemp) {
				long flag = MapUtils.getIntValue(mapAuthorDealTemp, "JOB_ID");
				lstAuthorDeal.add(flag);
			}
		}

		List<Map<String, Object>> lstQueryChart = analysisDao.queryAnalysisList(paramData, lstAuthorCol, lstAuthorDeal);
		return lstQueryChart;
	}

	/**
	 * 查询局部表格数据
	 * 
	 * @param paraData
	 * @return
	 */
	public List<Map<String, Object>> queryPartChartDataInfo(Map<String, Object> paramData) {
		List<Map<String, Object>> lstColFlagTemp = analysisDao.getColFlag();
		List<Integer> lstColFlag = new ArrayList<Integer>();
		List<Long> lstAuthorCol = new ArrayList<Long>();
		List<Long> lstAuthorDeal = new ArrayList<Long>();

		for (Map<String, Object> mapColFlagTemp : lstColFlagTemp) {
			int flag = MapUtils.getIntValue(mapColFlagTemp, "ACTION_TYPE");
			if (flag == 5001 || flag == 6001 || flag == 7001) {
				lstColFlag.add(flag);
			}
		}
		List<Map<String, Object>> lstAuthorColTemp = analysisDao.queryAuthorColList(lstColFlag);
		if (lstAuthorColTemp != null && lstAuthorColTemp.size() > 0) {
			for (Map<String, Object> mapAuthorColTemp : lstAuthorColTemp) {
				long flag = MapUtils.getIntValue(mapAuthorColTemp, "COL_ID");
				lstAuthorCol.add(flag);
			}
		}

		List<Map<String, Object>> lstAuthorDealTemp = analysisDao.queryAuthorDealList(lstColFlag);
		if (lstAuthorDealTemp != null && lstAuthorDealTemp.size() > 0) {
			for (Map<String, Object> mapAuthorDealTemp : lstAuthorDealTemp) {
				long flag = MapUtils.getIntValue(mapAuthorDealTemp, "JOB_ID");
				lstAuthorDeal.add(flag);
			}
		}
		List<Map<String, Object>> lstQueryChart = analysisDao.queryPartAnalysisList(paramData, lstAuthorCol,
				lstAuthorDeal);
		return lstQueryChart;
	}

	public Map<String, Object> queryPartMission(Map<String, Object> paramData) {
		Map<String, Object> mapPartMIssion = new HashMap<String, Object>();
		int day = MapUtils.getIntValue(paramData, "DEAL_DAY", 2);

		List<Map<String, Object>> lstPartMissionZoneTimeOne = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> lstPartMissionZoneTimeTwo = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> lstPartMissionZoneTimeThree = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> lstPartMissionZoneTimeFour = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> lstPartMissionZoneTimeFive = new ArrayList<Map<String, Object>>();

		if (day == 2) {// 时间点处理数据量对比图
			paramData.put("DEAL_DAY", 1);
			lstPartMissionZoneTimeOne = analysisDao.queryPartMissionZoneTime(paramData);
			paramData.put("DEAL_DAY", 2);
			lstPartMissionZoneTimeTwo = analysisDao.queryPartMissionZoneTime(paramData);
		} else if (day == 3) {// 时间点平均耗时对比图
			paramData.put("DEAL_DAY", 1);
			lstPartMissionZoneTimeOne = analysisDao.queryPartMissionZoneTime(paramData);
			paramData.put("DEAL_DAY", 2);
			lstPartMissionZoneTimeTwo = analysisDao.queryPartMissionZoneTime(paramData);
			paramData.put("DEAL_DAY", 3);
			lstPartMissionZoneTimeThree = analysisDao.queryPartMissionZoneTime(paramData);
		} else if (day == 5) {
			paramData.put("DEAL_DAY", 1);
			lstPartMissionZoneTimeOne = analysisDao.queryPartMissionZoneTime(paramData);
			paramData.put("DEAL_DAY", 2);
			lstPartMissionZoneTimeTwo = analysisDao.queryPartMissionZoneTime(paramData);
			paramData.put("DEAL_DAY", 3);
			lstPartMissionZoneTimeThree = analysisDao.queryPartMissionZoneTime(paramData);
			paramData.put("DEAL_DAY", 4);
			lstPartMissionZoneTimeFour = analysisDao.queryPartMissionZoneTime(paramData);
			paramData.put("DEAL_DAY", 5);
			lstPartMissionZoneTimeFive = analysisDao.queryPartMissionZoneTime(paramData);
		}

		List<Map<String, Object>> lstPartMissionInfo = analysisDao.querAnalysisPartInfo(paramData);
		List<Map<String, Object>> lstWarehousePartMissionInfo = analysisDao.querAnalysisWarehousePartInfo(paramData);

		mapPartMIssion.put("MISSION_INFO", lstPartMissionInfo);
		mapPartMIssion.put("MISSION_ZONE_TIME_ONE", lstPartMissionZoneTimeOne);
		mapPartMIssion.put("MISSION_ZONE_TIME_TWO", lstPartMissionZoneTimeTwo);
		mapPartMIssion.put("MISSION_ZONE_TIME_THREE", lstPartMissionZoneTimeThree);
		mapPartMIssion.put("MISSION_ZONE_TIME_FOUR", lstPartMissionZoneTimeFour);
		mapPartMIssion.put("MISSION_ZONE_TIME_FIVE", lstPartMissionZoneTimeFive);
		mapPartMIssion.put("WAREHOUSE_FILRER", lstWarehousePartMissionInfo);

		return mapPartMIssion;

	}

	// public List<Map<String,Object>> queryZoneDeal(Map<String,Object>
	// paramData){
	// return analysisDao.queryPartMissionZoneDeal(paramData);
	// }

	public List<Map<String, Object>> queryZoneTime(Map<String, Object> paramData) {
		return analysisDao.queryPartMissionZoneTime(paramData);
	}

	// private List<Map<String,Object>> formatZoneData(List<Map<String,Object>>
	// partMissionZone){
	// List<Map<String,Object>> lstRs = new ArrayList<Map<String,Object>>();
	// List<Integer> lstDealHour = new ArrayList<Integer>();
	// List<String> lstDealTime = new ArrayList<String>();
	// Map<String,Object> mapDealHourTime = new HashMap<String, Object>();
	// for(int i=0;i<partMissionZone.size();i++){
	// Map<String,Object> mapZone = partMissionZone.get(i);
	// int dealHour = MapUtils.getIntValue(mapZone, "DEAL_HOUR");
	// String dealTime = MapUtils.getString(mapZone, "DEAL_TIME");
	// if(!lstDealHour.contains(dealHour)){
	// lstDealHour.add(dealHour);
	// }
	// if(!lstDealTime.contains(dealTime)){
	// lstDealTime.add(dealTime);
	// }
	// }
	// for(int m=0;m<lstDealTime.size();m++){
	// for(int j=0;j<partMissionZone.size();j++){
	// if(!lstDealTime.get(m).equals(partMissionZone.get(j).get("DEAL_TIME"))){
	//
	// }
	// }
	// }
	//
	//
	//
	// return lstRs;
	// }

	/**
	 * 得到任务详情的数据
	 * 
	 * @param paramData
	 * @return
	 */
	public List<Map<String, Object>> queryColData(Map<String, Object> paramData) {

		return analysisDao.queryColData(paramData);
	}

	/**
	 * 查看采集的日志详情
	 * 
	 * @param paramData
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryColMsgLog(Map<String, Object> paramData, Page page) {
		if (page == null) {
			page = new Page(0, 20);
		}
		return analysisDao.queryColMsgLog(paramData, page);

	}

	/**
	 * 查看失败详情
	 * 
	 * @param paramData
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryColFailList(Map<String, Object> paramData, Page page) {
		if (page == null) {
			page = new Page(0, 20);
		}
		return analysisDao.queryColFailList(paramData, page);
	}

	public void setAnalysisDao(AnalysisDao analysisDao) {
		this.analysisDao = analysisDao;
	}
}
