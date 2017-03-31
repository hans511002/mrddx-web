package com.ery.hadoop.hq.qureyrule;

import java.util.HashMap;
import java.util.Map;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.MapUtils;

public class QueryRuleColumnPO {
	public static final String METHOD_SUM = "SUM"; // 1
	public static final String METHOD_AVG = "AVG"; // 2
	public static final String METHOD_MAX = "MAX"; // 3
	public static final String METHOD_MIN = "MIN"; // 4
	// public static final String METHOD_COUNT = "COUNT"; // 5

	long colRuleId;
	long qryRuleId;
	String columnFamily;
	String columnQualifier;
	String[] defineAllColumnEnName;
	String[] defineAllColumnCnName;
	String[] defineColumnEnName;
	String[] defineColumnCnName;
	int[] columnMethod;
	int[] columnFlag;
	int sortFlag;
	String sortColumn; // 暂未被使用
	int sortType;
	public String splitStr = "";
	QueryRuleConditionPO qrule;

	public QueryRuleColumnPO() {

	}

	public QueryRuleColumnPO(Map<String, Object> map) {
		colRuleId = MapUtils.getIntValue(map, "COL_RULE_ID");
		qryRuleId = MapUtils.getIntValue(map, "QRY_RULE_ID");
		columnFamily = MapUtils.getString(map, "HB_CLUSTER_NAME");
		columnQualifier = MapUtils.getString(map, "HB_COLUMN_NAME");
		sortFlag = MapUtils.getIntValue(map, "SORT_FLAG");
		sortColumn = MapUtils.getString(map, "SORT_COLUMN", null);
		sortType = MapUtils.getIntValue(map, "SORT_TYPE");
		splitStr = MapUtils.getString(map, "COL_SPLIT");
		String tmp = MapUtils.getString(map, "SELECT_COLUMN_EN", "");
		defineColumnEnName = tmp.split(",");
		tmp = MapUtils.getString(map, "SELECT_COLUMN_CH", "");
		defineColumnCnName = tmp.split(",");
		if (defineColumnEnName.length != defineColumnCnName.length) {
			defineColumnCnName = defineColumnEnName;
			LogUtils.warn("查询规则[" + this.qryRuleId + "]配置中英文字段数与中文字段数不一致，以英文字段数为准");
		}

		// 返回拆分的所有列
		tmp = MapUtils.getString(map, "DEFINE_EN_COLUMN_NAME", "");
		defineAllColumnEnName = tmp.split(",");
		tmp = MapUtils.getString(map, "DEFINE_CH_COLUMN_NAME", "");
		defineAllColumnCnName = tmp.split(",");

		String tmpStatisticsMethod = MapUtils.getString(map, "STATISTICS_METHOD");
		if (null != tmpStatisticsMethod && tmpStatisticsMethod.trim().length() > 0) {
			String colMethod[] = tmpStatisticsMethod.split(",");
			this.columnMethod = new int[colMethod.length];
			for (int i = 0; i < colMethod.length; i++) {
				if ("1".equals(colMethod[i])) {
					this.columnMethod[i] = 1;
				} else if ("2".equals(colMethod[i])) {
					this.columnMethod[i] = 2;
				} else if ("3".equals(colMethod[i])) {
					this.columnMethod[i] = 3;
				} else if ("4".equals(colMethod[i])) {
					this.columnMethod[i] = 4;
				} else if ("5".equals(colMethod[i])) {
					this.columnMethod[i] = 5;
				}
			}
		}

		String tmpStatisticsFlag = MapUtils.getString(map, "STATISTICS_FLAG");
		if (null != tmpStatisticsMethod && tmpStatisticsMethod.trim().length() > 0) {
			if ((null == tmpStatisticsFlag || tmpStatisticsFlag.trim().length() <= 0)
					|| "-1".equals(tmpStatisticsMethod)) {
				this.columnFlag = new int[this.columnMethod.length];
				for (int i = 0; i < this.columnFlag.length; i++) {
					this.columnFlag[i] = 1;
				}
			} else {
				String colFlag[] = tmpStatisticsFlag.split(",");
				this.columnFlag = new int[colFlag.length];
				for (int i = 0; i < colFlag.length; i++) {
					if ("0".equals(colFlag[i])) {
						this.columnFlag[i] = 0;
					} else if ("1".equals(colFlag[i])) {
						this.columnFlag[i] = 1;
					}
				}
			}
		}
	}

	public Map<String, Object> toMap() {
		Map<String, Object> col = new HashMap<String, Object>();
		col.put("colRuleId", colRuleId);
		col.put("qryRuleId", qryRuleId);
		col.put("columnFamily", columnFamily);
		col.put("columnQualifier", columnQualifier);
		col.put("columnName", defineColumnEnName);
		col.put("sortFlag", sortFlag);
		col.put("sortColumn", sortColumn);
		col.put("sortType", sortType);
		col.put("columnCFName", this.getColCFName());
		return col;
	}

	/**
	 * 获取字段英文名,CF:Q
	 * 
	 * @return
	 */
	public String getColCFName() {
		return this.columnFamily + ":" + this.columnQualifier;
	}

	public long getColRuleId() {
		return colRuleId;
	}

	public void setColRuleId(long colRuleId) {
		this.colRuleId = colRuleId;
	}

	public long getQryRuleId() {
		return qryRuleId;
	}

	public void setQryRuleId(long qryRuleId) {
		this.qryRuleId = qryRuleId;
	}

	public String getColumnFamily() {
		return columnFamily;
	}

	public void setColumnFamily(String columnFamily) {
		this.columnFamily = columnFamily;
	}

	public String getColumnQualifier() {
		return columnQualifier;
	}

	public void setColumnQualifier(String columnQualifier) {
		this.columnQualifier = columnQualifier;
	}

	/**
	 * 获取字段英文名,配置的
	 * 
	 * @return
	 */
	public String[] getColumnENName() {
		return defineColumnEnName;
	}

	/**
	 * 获取字段中文名,配置的
	 * 
	 * @return
	 */
	public String[] getColumnCNName() {
		return defineColumnCnName;
	}

	public int getSortFlag() {
		return sortFlag;
	}

	public void setSortFlag(int sortFlag) {
		this.sortFlag = sortFlag;
	}

	public String getSortColumn() {
		return sortColumn;
	}

	public void setSortColumn(String sortColumn) {
		this.sortColumn = sortColumn;
	}

	public int getSortType() {
		return sortType;
	}

	public void setSortType(int sortType) {
		this.sortType = sortType;
	}

	public QueryRuleConditionPO getQrule() {
		return qrule;
	}

	public void setQrule(QueryRuleConditionPO qrule) {
		this.qrule = qrule;
	}

	public int[] getColumnMethod() {
		return columnMethod;
	}

	public String[] getDefineAllColumnCnName() {
		return defineAllColumnCnName;
	}

	public String[] getDefineAllColumnEnName() {
		return defineAllColumnEnName;
	}

	public int[] getColumnFlag() {
		return columnFlag;
	}
}
