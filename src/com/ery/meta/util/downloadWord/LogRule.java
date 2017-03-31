package com.ery.meta.util.downloadWord;

import java.util.List;

public class LogRule {
	private String sName;//业务名称
	private String timesDay;//调用次数
	private String avgDay;//调用平均时长
	private String countDay;//快查询个数
	private String countMonth;//
	private String fcountDay;//1-5s查询个数
	private String scountDay;//慢查询个数
	private String maxTimeDay;//查询最大耗时间
	private String frateDay;//快查询占比
	private String slowDay;//慢查询占比
	private String wavgDay;//写入平均速度
	private String maxDay;//最大并发数
	private String avgcDay;//平均并发数
	private String serviceStopDay;//服务中断次数
	private String noTimeDay;//平台不能提供服务时长
	private String srateDay;//慢查询占比
	private String lineChart;//入库趋势图
	private String topChart;//查询规则排行榜
	private List<LogRuleDetail> lstRuleDetail;//入库详情列表
	private List<LogAnalysisDetail> tableLogAnalysisDetail;//查询规则详情
	private List<LogTopAnalysisDetail> tableTopLogAnalysisDetail;//按日统计慢查询排行
	
	public String getLineChart() {
		return lineChart;
	}
	public void setLineChart(String lineChart) {
		this.lineChart = lineChart;
	}
	public String getTopChart() {
		return topChart;
	}
	public void setTopChart(String topChart) {
		this.topChart = topChart;
	}
	public List<LogAnalysisDetail> getTableLogAnalysisDetail() {
		return tableLogAnalysisDetail;
	}
	public void setTableLogAnalysisDetail(
			List<LogAnalysisDetail> tableLogAnalysisDetail) {
		this.tableLogAnalysisDetail = tableLogAnalysisDetail;
	}
	public List<LogTopAnalysisDetail> getTableTopLogAnalysisDetail() {
		return tableTopLogAnalysisDetail;
	}
	public void setTableTopLogAnalysisDetail(
			List<LogTopAnalysisDetail> tableTopLogAnalysisDetail) {
		this.tableTopLogAnalysisDetail = tableTopLogAnalysisDetail;
	}
	public List<LogRuleDetail> getLstRuleDetail() {
		return lstRuleDetail;
	}
	public void setLstRuleDetail(List<LogRuleDetail> lstRuleDetail) {
		this.lstRuleDetail = lstRuleDetail;
	}
	public String getsName() {
		return sName;
	}
	public void setsName(String sName) {
		this.sName = sName;
	}
	public String getTimesDay() {
		return timesDay;
	}
	public void setTimesDay(String timesDay) {
		this.timesDay = timesDay;
	}
	public String getAvgDay() {
		return avgDay;
	}
	public void setAvgDay(String avgDay) {
		this.avgDay = avgDay;
	}
	public String getCountDay() {
		return countDay;
	}
	public void setCountDay(String countDay) {
		this.countDay = countDay;
	}
	public String getCountMonth() {
		return countMonth;
	}
	public void setCountMonth(String countMonth) {
		this.countMonth = countMonth;
	}
	public String getFcountDay() {
		return fcountDay;
	}
	public void setFcountDay(String fcountDay) {
		this.fcountDay = fcountDay;
	}
	public String getScountDay() {
		return scountDay;
	}
	public void setScountDay(String scountDay) {
		this.scountDay = scountDay;
	}
	public String getMaxTimeDay() {
		return maxTimeDay;
	}
	public void setMaxTimeDay(String maxTimeDay) {
		this.maxTimeDay = maxTimeDay;
	}
	public String getFrateDay() {
		return frateDay;
	}
	public void setFrateDay(String frateDay) {
		this.frateDay = frateDay;
	}
	public String getSlowDay() {
		return slowDay;
	}
	public void setSlowDay(String slowDay) {
		this.slowDay = slowDay;
	}
	public String getWavgDay() {
		return wavgDay;
	}
	public void setWavgDay(String wavgDay) {
		this.wavgDay = wavgDay;
	}
	public String getMaxDay() {
		return maxDay;
	}
	public void setMaxDay(String maxDay) {
		this.maxDay = maxDay;
	}
	public String getAvgcDay() {
		return avgcDay;
	}
	public void setAvgcDay(String avgcDay) {
		this.avgcDay = avgcDay;
	}
	public String getServiceStopDay() {
		return serviceStopDay;
	}
	public void setServiceStopDay(String serviceStopDay) {
		this.serviceStopDay = serviceStopDay;
	}
	public String getNoTimeDay() {
		return noTimeDay;
	}
	public void setNoTimeDay(String noTimeDay) {
		this.noTimeDay = noTimeDay;
	}
	public String getSrateDay() {
		return srateDay;
	}
	public void setSrateDay(String srateDay) {
		this.srateDay = srateDay;
	}
	
}
