package com.ery.hadoop.hq.table;

import java.util.Map;

import com.ery.base.support.utils.MapUtils;

public class HBaseTablePO {
	public static final int HB_STATUS_EFFECTIVE = 0;
	public static final int HB_STATUS_INVALID = 1;
	public static final int HB_STATUS_NOT_AVAILABLE = 2;

	int hbTableId;
	String hbTableName;
	int hbTableType;
	String hbTableMSG;
	int hbStatus;

	private HBaseTablePO() {
	}

	public static HBaseTablePO create() {
		return new HBaseTablePO();
	}

	public HBaseTablePO(Map<String, Object> map) {
		hbTableId = MapUtils.getIntValue(map, "HB_TABLE_ID");
		hbTableName = MapUtils.getString(map, "HB_TABLE_NAME");
		hbTableType = MapUtils.getIntValue(map, "DATA_SOURCE_ID", -1);
		hbTableMSG = MapUtils.getString(map, "HB_TABLE_MSG");
		hbStatus = MapUtils.getIntValue(map, "HB_STATUS");
	}

	public int getHbTableId() {
		return hbTableId;
	}

	public void setHbTableId(int hbTableId) {
		this.hbTableId = hbTableId;
	}

	public String getHbTableName() {
		return hbTableName;
	}

	public void setHbTableName(String hbTableName) {
		this.hbTableName = hbTableName;
	}

	public int getHbTableType() {
		return hbTableType;
	}

	public void setHbTableType(int hbTableType) {
		this.hbTableType = hbTableType;
	}

	public String getHbTableMSG() {
		return hbTableMSG;
	}

	public void setHbTableMSG(String hbTableMSG) {
		this.hbTableMSG = hbTableMSG;
	}
}
