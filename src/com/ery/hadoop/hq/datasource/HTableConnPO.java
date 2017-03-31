package com.ery.hadoop.hq.datasource;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.codehaus.jackson.map.ObjectMapper;

import com.ery.hadoop.hq.common.Common;
import com.ery.hadoop.hq.datasource.manage.DataSourcePO;
import com.ery.hadoop.hq.qureyrule.QueryRuleColumnPO;
import com.ery.hadoop.hq.qureyrule.QueryRuleConditionPO;
import com.ery.hadoop.hq.qureyrule.QueryRulePO;
import com.ery.hadoop.hq.table.HBaseTableDAO;
import com.ery.hadoop.hq.table.HBaseTablePO;

public class HTableConnPO {

	String qryRuleId;
	String queryName;
	String dateSourceId;
	String dataSourceName;;
	String zkServers;
	int scannerCachingSize;// 缓存的scanner数
	int zkPort;
	String hbaseZkParentNode;
	String hbasezkRootNode;
	public HBaseTablePO hbaseTable;
	int minLinkCount;
	int maxLinkCount;
	int rowKeyQryType;
	int paginationSize;
	int supportSort;
	String defSortColumn;
	int clientRowsBufferSize;
	int visitLogFlag;
	boolean isVisitLogFlagDetail;
	int certAuthFlag;
	int scannerReadCacheSize;// 读取缓存大小

	// 英文名称列表 二级表示拆分
	String[][] colEnNames = null;
	String[][] colCnNames = null;
	String[] colExpandEnNames = null;
	String[] colExpandCnNames = null;
	String[] colCFNames = null;
	public HashMap<String, QueryRuleColumnPO> colCFNameMap;

	int[][] colSelectEnNamesIndex = null; // 拆分字段返回列的索引位置
	Integer[] colIndexMethod = null; // 选择返回的列 与 统计方法
	Integer[] colIndexFlag = null; // 选择返回的列 与 统计方法(过滤之前：0，过滤之后：1)
	public boolean isStaticMethod = false; // 是否统计

	// 查询列配置对象
	QueryRuleColumnPO[] qrCols = null;
	// 英文名称索引关系
	HashMap<String, Integer> nameIndexs = new HashMap<String, Integer>();
	HashMap<String, Integer> nameExpandIndexs = new HashMap<String, Integer>();
	// 多个条件间关系为AND
	QueryRuleConditionPO[] ruleConditionRel = null;
	Configuration conf;

	public Configuration getConf() {
		return conf;
	}

	public void setConf(Configuration conf) {
		this.conf = conf;
	}

	public HTableConnPO(QueryRulePO qryPo) throws Exception {
		DataSourcePO dataSourcePo = DataSourceInit.dataSources.get(qryPo.getDateSourceId());
		if (dataSourcePo == null) {
			long dsId = Long.parseLong(qryPo.getDateSourceId());
			DataSourceInit.reLoadDataSource(dsId, true);
			dataSourcePo = DataSourceInit.dataSources.get(qryPo.getDateSourceId());
			if (dataSourcePo == null)
				throw new Exception("Hbase表查询规则中配置的数据源ID不存在");
		}
		// 获取表信息
		HBaseTableDAO tableDAO = new HBaseTableDAO();
		Map<String, Object> map = tableDAO.queryTableInfo(qryPo.getHBTableId());
		if (null == map || map.size() <= 0) {
			throw new Exception("Hbase表不存在, hbTableId:" + qryPo.getHBTableId());
		}

		hbaseTable = new HBaseTablePO(map);
		qryRuleId = qryPo.getQryRuleId();
		queryName = qryPo.getQryRuleName();
		dateSourceId = qryPo.getDateSourceId();
		dataSourceName = dataSourcePo.getDataSourceName();
		zkServers = dataSourcePo.getZkServers();
		scannerCachingSize = qryPo.getScannerCachingSize();// 缓存的scanner数
		zkPort = dataSourcePo.getZkPort();
		hbaseZkParentNode = dataSourcePo.getParentNode();
		hbasezkRootNode = dataSourcePo.getRootNode();
		int _min = dataSourcePo.getParallelNum();
		int _max = qryPo.getParallelNum();
		if (_min > _max) {
			this.maxLinkCount = _min;
			this.minLinkCount = _max;
		} else {
			this.maxLinkCount = _max;
			this.minLinkCount = _min;
		}
		rowKeyQryType = qryPo.getQryType();
		paginationSize = qryPo.getPaginationSize();
		supportSort = qryPo.getSupportSort();
		defSortColumn = qryPo.getDefSortColumn();
		clientRowsBufferSize = qryPo.getClientRowsBufferSize();
		visitLogFlag = qryPo.getLogFlag();
		isVisitLogFlagDetail = qryPo.getLogFlagDetail() == 1;
		certAuthFlag = qryPo.getAuthFlag();
		scannerReadCacheSize = qryPo.getScannerReadCacheSize();// 读取缓存大小
		init(dataSourcePo.getSiteXml());
	}

	public int getCertAuthFlag() {
		return certAuthFlag;
	}

	public Map<String, Object> toMap() {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("qryRuleId", qryRuleId);
		map.put("queryName", queryName);
		map.put("dateSourceId", dateSourceId);
		map.put("dataSourceName", dataSourceName);
		map.put("zkServers", zkServers);
		map.put("scannerCachingSize", scannerCachingSize);
		map.put("zkPort", zkPort);
		map.put("hbaseZkParentNode", hbaseZkParentNode);
		map.put("hbasezkRootNode", hbasezkRootNode);
		map.put("tableName", hbaseTable.getHbTableName());
		map.put("minLinkCount", minLinkCount);
		map.put("maxLinkCount", maxLinkCount);
		map.put("rowKeyQryType", rowKeyQryType);
		map.put("paginationSize", paginationSize);
		map.put("supportSort", supportSort);
		map.put("defSortColumn", defSortColumn);
		map.put("clientRowsBufferSize", clientRowsBufferSize);
		map.put("visitLogFlag", visitLogFlag);
		map.put("isVisitLogFlagDetail", isVisitLogFlagDetail);
		map.put("scannerReadCacheSize", scannerReadCacheSize);
		ObjectMapper mapper = new ObjectMapper();
		try {
			map.put("colEnNames", mapper.writeValueAsString(colEnNames));
			String[] cols = new String[qrCols.length];
			for (int i = 0; i < qrCols.length; i++) {
				cols[i] = mapper.writeValueAsString(qrCols[i].toMap());
			}
			map.put("qrCols", mapper.writeValueAsString(cols));
			map.put("nameIndexs", mapper.writeValueAsString(nameIndexs));
			String[] cons = new String[ruleConditionRel.length];
			for (int i = 0; i < ruleConditionRel.length; i++) {
				cons[i] = mapper.writeValueAsString(ruleConditionRel[i].toMap());
			}
			map.put("ruleConditionRel", mapper.writeValueAsString(cons));
		} catch (Exception e) {
			return null;
		}
		return map;
	}

	public void init(String siteXml) {
		org.apache.hadoop.conf.Configuration _conf = HBaseConfiguration.create();
		// load siteXml
		if (siteXml != null && !siteXml.trim().equals("")) {
			InputStream in = Common.String2InputStream(siteXml);
			_conf.addResource(in);
		}
		try {
			_conf.set("hbase.client.scanner.caching", scannerReadCacheSize + "");
		} catch (RuntimeException e) {
			throw new RuntimeException("XML配置错误：" + e.getMessage());
		}
		_conf.set("zookeeper.znode.parent", hbaseZkParentNode);
		_conf.set("zookeeper.znode.rootserver", hbasezkRootNode);
		_conf.set("hbase.zookeeper.property.clientPort", zkPort + "");
		_conf.set("hbase.zookeeper.quorum", zkServers);
		this.conf = HBaseConfiguration.create();
		HBaseConfiguration.merge(this.conf, _conf);
	}

	public QueryRuleConditionPO[] getRuleConditionRel() {
		return ruleConditionRel;
	}

	public String[][] getColENNames() {
		return colEnNames;
	}

	public String[] getColExpandENNames() {
		return colExpandEnNames;
	}

	public String[] getColExpandCNNames() {
		return this.colExpandCnNames;
	}

	public String getLinkKey() {
		// modify by 2014-03-26
		return this.getDateSourceId() + "_" + this.getQryRuleId() + "_" + this.getTableName();
	}

	public String getLinkName() {
		return this.getDataSourceName() + "_" + this.getTableName();
	}

	public String getQryRuleId() {
		return qryRuleId;
	}

	public void setQryRuleId(String qryRuleId) {
		this.qryRuleId = qryRuleId;
	}

	public String getDateSourceId() {
		return dateSourceId;
	}

	public void setDateSourceId(String dateSourceId) {
		this.dateSourceId = dateSourceId;
	}

	public String getDataSourceName() {
		return dataSourceName;
	}

	public void setDataSourceName(String dataSourceName) {
		this.dataSourceName = dataSourceName;
	}

	public String getZkServers() {
		return zkServers;
	}

	public void setZkServers(String zkServers) {
		this.zkServers = zkServers;
	}

	public int getScannerCachingSize() {
		return scannerCachingSize;
	}

	public void setScannerCachingSize(int scannerCachingSize) {
		this.scannerCachingSize = scannerCachingSize;
	}

	public int getZkPort() {
		return zkPort;
	}

	public void setZkPort(int zkPort) {
		this.zkPort = zkPort;
	}

	public String getHbaseZkParentNode() {
		return hbaseZkParentNode;
	}

	public void setHbaseZkParentNode(String hbaseZkParentNode) {
		this.hbaseZkParentNode = hbaseZkParentNode;
	}

	public String getHbasezkRootNode() {
		return hbasezkRootNode;
	}

	public void setHbasezkRootNode(String hbasezkRootNode) {
		this.hbasezkRootNode = hbasezkRootNode;
	}

	public String getTableName() {
		return hbaseTable.getHbTableName();
	}

	public int getTableId() {
		return hbaseTable.getHbTableId();
	}

	public int getMinLinkCount() {
		return minLinkCount;
	}

	public void setMinLinkCount(int minLinkCount) {
		this.minLinkCount = minLinkCount;
	}

	public int getMaxLinkCount() {
		return maxLinkCount;
	}

	public void setMaxLinkCount(int maxLinkCount) {
		this.maxLinkCount = maxLinkCount;
	}

	public int getRowKeyQryType() {
		return rowKeyQryType;
	}

	public void setRowKeyQryType(int rowKeyQryType) {
		this.rowKeyQryType = rowKeyQryType;
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

	public int getVisitLogFlag() {
		return visitLogFlag;
	}

	public void setVisitLogFlag(int visitLogFlag) {
		this.visitLogFlag = visitLogFlag;
	}

	public int getScannerReadCacheSize() {
		return scannerReadCacheSize;
	}

	public void setScannerReadCacheSize(int scannerReadCacheSize) {
		this.scannerReadCacheSize = scannerReadCacheSize;
	}

	public String getQueryName() {
		return queryName;
	}

	public void setQueryName(String queryName) {
		this.queryName = queryName;
	}

	public void setColEnNames(String[][] colEnNames) {
		this.colEnNames = colEnNames;
	}

	public String[] getColCFNames() {
		return colCFNames;
	}

	public String[][] getColCnNames() {
		return colCnNames;
	}

	public int[][] getColSelectEnNamesIndex() {
		return colSelectEnNamesIndex;
	}

	public void setColCnNames(String[][] colCnNames) {
		this.colCnNames = colCnNames;
	}

	public QueryRuleColumnPO[] getQrCols() {
		return qrCols;
	}

	public void setQrCols(QueryRuleColumnPO[] qrCols) {
		this.qrCols = qrCols;
		colEnNames = new String[qrCols.length][];
		colCnNames = new String[qrCols.length][];
		colCFNames = new String[qrCols.length];
		colCFNameMap = new HashMap<String, QueryRuleColumnPO>();
		colSelectEnNamesIndex = new int[qrCols.length][];
		List<Integer> selectColumnIndexMethod = new ArrayList<Integer>();
		List<Integer> selectColumnIndexFlag = new ArrayList<Integer>();
		for (int i = 0; i < colEnNames.length; i++) {
			QueryRuleColumnPO col = qrCols[i];
			colEnNames[i] = col.getColumnENName();
			colCnNames[i] = col.getColumnCNName();
			colCFNames[i] = col.getColCFName();
			colCFNameMap.put(colCFNames[i], col);
			int cm[] = col.getColumnMethod();
			if (null != cm) { // 获取列对应的统计方法
				for (int j = 0; j < cm.length; j++) {
					selectColumnIndexMethod.add(cm[j]);
					if (cm[j] >= 1 && cm[j] <= 4) {
						isStaticMethod = true;
					}
				}
			}

			int fl[] = col.getColumnFlag();
			if (null != fl) { // 获取列对应的统计方法
				for (int j = 0; j < fl.length; j++) {
					selectColumnIndexFlag.add(fl[j]);
				}
			}

			// 获取返回字段在整个拆分合并字段中的index位置
			String allColumnEN[] = col.getDefineAllColumnEnName();
			int temp[] = new int[colEnNames[i].length];
			for (int k = 0; k < colEnNames[i].length; k++) {
				for (int m = 0; m < allColumnEN.length; m++) {
					if (allColumnEN[m].equals(colEnNames[i][k])) {
						temp[k] = m;
						break;
					}
				}
			}
			colSelectEnNamesIndex[i] = temp;
		}

		this.colIndexMethod = selectColumnIndexMethod.toArray(new Integer[0]);
		this.colIndexFlag = selectColumnIndexFlag.toArray(new Integer[0]);
		List<String> enames = new ArrayList<String>();
		for (int i = 0; i < this.colEnNames.length; i++) {
			if (this.colEnNames[i] != null && this.colEnNames[i].length > 0) {
				for (String name : this.colEnNames[i]) {
					enames.add(name);
				}
			}
		}
		this.colExpandEnNames = enames.toArray(new String[0]);
		enames.clear();
		for (int i = 0; i < this.colCnNames.length; i++) {
			if (this.colCnNames[i] != null && this.colCnNames[i].length > 0) {
				for (String name : this.colCnNames[i]) {
					enames.add(name);
				}
			}
		}
		this.colExpandCnNames = enames.toArray(new String[0]);
		enames.clear();
	}

	public HashMap<String, Integer> getNameIndexs() {
		return nameIndexs;
	}

	public void setNameIndexs(HashMap<String, Integer> nameIndexs) {
		this.nameIndexs = nameIndexs;
	}

	public void setRuleConditionRel(QueryRuleConditionPO[] ruleConditionRel) {
		this.ruleConditionRel = ruleConditionRel;
	}

	public HashMap<String, Integer> getNameExpandIndexs() {
		return nameExpandIndexs;
	}

	public boolean isVisitLogFlagDetail() {
		return isVisitLogFlagDetail;
	}

	public HBaseTablePO getHbaseTable() {
		return hbaseTable;
	}

	public void setHbaseTable(HBaseTablePO hbaseTable) {
		this.hbaseTable = hbaseTable;
	}
}
