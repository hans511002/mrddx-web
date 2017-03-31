package com.ery.meta.util.downloadWord;

public class LogTopAnalysisDetail {
	
	private String qryRuleId;//查询ID
	private String qryRuleName;//查询名称
	private String scount;//查询次数
	private String totalTime;//查询耗时
	private String qryNum;//返回记录数
	private String qrySumNum;//查询总记录数
	private String responseTime; // 响应时间点
	public String getQryRuleId() {
		return qryRuleId;
	}
	public void setQryRuleId(String qryRuleId) {
		this.qryRuleId = qryRuleId;
	}
	public String getQryRuleName() {
		return qryRuleName;
	}
	public void setQryRuleName(String qryRuleName) {
		this.qryRuleName = qryRuleName;
	}
	public String getScount() {
		return scount;
	}
	public void setScount(String scount) {
		this.scount = scount;
	}
	public String getTotalTime() {
		return totalTime;
	}
	public void setTotalTime(String totalTime) {
		this.totalTime = totalTime;
	}
	public String getQryNum() {
		return qryNum;
	}
	public void setQryNum(String qryNum) {
		this.qryNum = qryNum;
	}
	public String getQrySumNum() {
		return qrySumNum;
	}
	public void setQrySumNum(String qrySumNum) {
		this.qrySumNum = qrySumNum;
	}
	public String getResponseTime() {
		return responseTime;
	}
	public void setResponseTime(String responseTime) {
		this.responseTime = responseTime;
	}
}
