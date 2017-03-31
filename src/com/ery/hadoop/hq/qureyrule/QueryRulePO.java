package com.ery.hadoop.hq.qureyrule;

import java.util.Map;

import org.apache.hadoop.hbase.HBaseConfiguration;

import com.ery.hadoop.hq.datasource.Constant;
import com.ery.base.support.utils.MapUtils;

public class QueryRulePO {

	HBaseConfiguration conf;
	String qryRuleId;
	int hbTableId;
	String qryRuleName;
	String hbaseTablePartition;
	int parallelNum;
	int qryType;
	int paginationSize;
	int supportSort;
	String defSortColumn;
	int clientRowsBufferSize;
	int logFlag;
	int logFlagDetail;
	int authFlag;
	int scannerReadCacheSize;
	String dateSourceId;
	int scannerCachingSize;

	private QueryRulePO() {
	}

	public static QueryRulePO create() {
		return new QueryRulePO();
	}

	public QueryRulePO(Map<String, Object> map) {
		qryRuleId = MapUtils.getString(map, "QRY_RULE_ID");
		hbTableId = MapUtils.getIntValue(map, "HB_TABLE_ID");
		qryRuleName = MapUtils.getString(map, "QRY_RULE_NAME");
		hbaseTablePartition = MapUtils.getString(map, "HBASE_TABLE_PARTITION");
		parallelNum = MapUtils.getIntValue(map, "PARALLEL_NUM", 0);
		qryType = MapUtils.getIntValue(map, "QRY_TYPE", 0);
		paginationSize = MapUtils.getIntValue(map, "PAGINATION_SIZE", 0);
		supportSort = MapUtils.getIntValue(map, "SUPPORT_SORT", 0);
		defSortColumn = MapUtils.getString(map, "DEF_SORT_COLUMN");
		clientRowsBufferSize = MapUtils.getIntValue(map, "CLIENT_ROWS_BUFFER_SIZE", Constant.CLIENT_ROWS_BUFFER_SIZE);
		logFlag = MapUtils.getIntValue(map, "LOG_FLAG", 1);
		logFlagDetail = MapUtils.getIntValue(map, "LOG_FLAG_DETAIL", 1);
		authFlag = MapUtils.getIntValue(map, "CERT_AUTH_FLAG", 1);
		scannerReadCacheSize = MapUtils.getIntValue(map, "SCANNER_READ_CACHE_SIZE", Constant.SCANNER_READ_CACHE_SIZE);
		dateSourceId = MapUtils.getString(map, "DATA_SOURCE_ID");
		scannerCachingSize = MapUtils.getIntValue(map, "CLIENT_SCANNER_CACHING", Constant.CLIENT_SCANNER_CACHING);

	}

	public int getAuthFlag() {
		return authFlag;
	}

	public String getQryRuleName() {
		return qryRuleName;
	}

	public void setQryRuleName(String queryName) {
		this.qryRuleName = queryName;
	}

	public int getScannerCachingSize() {
		return scannerCachingSize;
	}

	public void setScannerCachingSize(int scannerCachingSize) {
		this.scannerCachingSize = scannerCachingSize;
	}

	public String getDateSourceId() {
		return dateSourceId;
	}

	public void setDateSourceId(String dateSourceId) {
		this.dateSourceId = dateSourceId;
	}

	public HBaseConfiguration getConf() {
		return conf;
	}

	public void setConf(HBaseConfiguration conf) {
		this.conf = conf;
	}

	public String getQryRuleId() {
		return qryRuleId;
	}

	public void setQryRuleId(String qryRuleId) {
		this.qryRuleId = qryRuleId;
	}

	public int getHBTableId() {
		return hbTableId;
	}

	public void setHBTableId(int hbTableId) {
		this.hbTableId = hbTableId;
	}

	public String getHbaseTablePartition() {
		return hbaseTablePartition;
	}

	public void setHbaseTablePartition(String hbaseTablePartition) {
		this.hbaseTablePartition = hbaseTablePartition;
	}

	public int getParallelNum() {
		return parallelNum;
	}

	public void setParallelNum(int parallelNum) {
		this.parallelNum = parallelNum;
	}

	public int getQryType() {
		return qryType;
	}

	public void setQryType(int qryType) {
		this.qryType = qryType;
	}

	public int getPaginationSize() {
		return paginationSize;
	}

	public void setPaginationSize(int paginationSize) {
		this.paginationSize = paginationSize;
	}

	public int getSupportSort() {
		return supportSort;
	}

	public void setSupportSort(int supportSort) {
		this.supportSort = supportSort;
	}

	public String getDefSortColumn() {
		return defSortColumn;
	}

	public void setDefSortColumn(String defSortColumn) {
		this.defSortColumn = defSortColumn;
	}

	public int getClientRowsBufferSize() {
		return clientRowsBufferSize;
	}

	public void setClientRowsBufferSize(int clientRowsBufferSize) {
		this.clientRowsBufferSize = clientRowsBufferSize;
	}

	public int getLogFlag() {
		return logFlag;
	}

	public void setLogFlag(int logFlag) {
		this.logFlag = logFlag;
	}

	public int getScannerReadCacheSize() {
		return scannerReadCacheSize;
	}

	public void setScannerReadCacheSize(int scannerReadCacheSize) {
		this.scannerReadCacheSize = scannerReadCacheSize;
	}

	public int getLogFlagDetail() {
		return logFlagDetail;
	}

	public void setLogFlagDetail(int logFlagDetail) {
		this.logFlagDetail = logFlagDetail;
	}
}
