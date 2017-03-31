package com.ery.hadoop.hq.log;

import java.text.ParseException;

import com.ery.hadoop.hq.utils.StringUtil;

public class HQLog {
	private long userId;
	private String queryRuleId;
	private String startTime;
	private long totalTime;
	private long filterTime;
	private long pageTime;
	
	private long logStartTime;
	private long logEndTime;
	private String msg;
	private boolean qryFlag;
	private boolean isDetail;
	
	private long currentCount;
	private long totalCount;
	private long resultByte;
	
	private boolean isFirstQy;

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}

	public String getQueryRuleId() {
		return queryRuleId;
	}

	public void setQueryRuleId(String queryRuleId) {
		this.queryRuleId = queryRuleId;
	}

	public String getStartTime() {
		return startTime;
	}

	public void setStartTime(long startTime) {
		try {
			this.startTime = StringUtil.longToString(startTime, StringUtil.DATE_FORMAT_TYPE1);
		} catch (ParseException e) {
			this.startTime = "";
		}
	}

	public long getTotalTime() {
		return totalTime;
	}

	public void setTotalTime(long totalTime) {
		this.totalTime = totalTime;
	}

	public long getFilterTime() {
		return filterTime;
	}

	public void setFilterTime(long filterTime) {
		this.filterTime = filterTime;
	}

	public long getPageTime() {
		return pageTime;
	}

	public void setPageTime(long pageTime) {
		this.pageTime = pageTime;
	}

	public long getLogStartTime() {
		return logStartTime;
	}

	public void setLogStartTime(long logStartTime) {
		this.logStartTime = logStartTime;
	}

	public long getLogEndTime() {
		return logEndTime;
	}

	public void setLogEndTime(long logEndTime) {
		this.logEndTime = logEndTime;
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	public boolean isQryFlag() {
		return qryFlag;
	}

	public void setQryFlag(boolean qryFlag) {
		this.qryFlag = qryFlag;
	}

	public boolean isDetail() {
		return isDetail;
	}

	public void setDetail(boolean isDetail) {
		this.isDetail = isDetail;
	}

	public long getCurrentCount() {
		return currentCount;
	}

	public void setCurrentCount(long currentCount) {
		this.currentCount = currentCount;
	}

	public long getTotalCount() {
		return totalCount;
	}

	public void setTotalCount(long totalCount) {
		this.totalCount = totalCount;
	}

	public long getResultByte() {
		return resultByte;
	}

	public void setResultByte(long resultByte) {
		this.resultByte = resultByte;
	}

	public void setIsFirstQy(boolean isFirstQy) {
		this.isFirstQy = isFirstQy;
	}
	
	public boolean isFirstQy() {
		return isFirstQy;
	}
}
