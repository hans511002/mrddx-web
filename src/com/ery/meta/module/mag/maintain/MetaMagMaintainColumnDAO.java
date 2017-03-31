package com.ery.meta.module.mag.maintain;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.MetaBaseDAO;

import com.ery.base.support.utils.MapUtils;

/**
 * 

 * @date 2012-05-21
 * @description 维护表列信息表操作DAO
 * 
 */
public class MetaMagMaintainColumnDAO extends MetaBaseDAO {

	/**
	 * 通过ids查询关联列
	 * 
	 * @param ids 列ids
	 * @return
	 */
	public List<Map<String, Object>> queryColumnsByIds(String ids) {
		String sql = "SELECT T.MAINTAIN_COLUMN_ID,T.MAINTAIN_COLUMN_NAME,T.MAINTAIN_COLUMN_NAMECN,"
				+ " T.DATA_FROM,T.DATASOURCE_ID,T.VALIDATE_RULE,T.COLUMN_DESC "
				+ " FROM META_MAG_MAINTAIN_COLUMN T WHERE T.MAINTAIN_COLUMN_ID IN (" + ids + ")"
				+ " order by T.MAINTAIN_COLUMN_ID";
		List<Map<String, Object>> rs = getDataAccess().queryForList(sql);
		return rs;
	}

	/**
	 * 通过传入列ids查询DATA_FROM存在的数据
	 * 
	 * @param colIds 列ids
	 * @return
	 */
	public Map<String, Object> queryAllColumn(String colIds) {
		Map<String, Object> rs = new HashMap<String, Object>();
		String sql = "SELECT T.MAINTAIN_COLUMN_ID,T.MAINTAIN_COLUMN_NAME,T.MAINTAIN_COLUMN_NAMECN,"
				+ " T.DATA_FROM,T.DATASOURCE_ID,T.VALIDATE_RULE,T.COLUMN_DESC "
				+ " FROM META_MAG_MAINTAIN_COLUMN T WHERE " + " T.MAINTAIN_COLUMN_ID IN(" + colIds
				+ ") AND T.DATA_FROM IS NOT NULL";
		List<Map<String, Object>> colList = getDataAccess().queryForList(sql);
		if (colList != null && colList.size() > 0) {
			for (int i = 0; i < colList.size(); i++) {
				List<Map<String, Object>> dataFromList = new ArrayList<Map<String, Object>>(); // 保存有dataFrom的数据
				Map<String, Object> colMap = colList.get(i);
				String dataFrom = MapUtils.getString(colMap, "DATA_FROM"); // 数据来源
				// 当同时存在select和from的时候，该数据来源为sql
				if (dataFrom.toUpperCase().indexOf("SELECT") != -1 && dataFrom.toUpperCase().indexOf("FROM") != -1) {
					String datasourceId = MapUtils.getString(colMap, "DATASOURCE_ID");
					Object data[][] = getDataAccess(datasourceId).queryForArray(dataFrom, false, null);
					// 对查询到的数据进行转换，返回键为CODE和CODE_NAME的形式
					for (int j = 0; j < data.length; j++) {
						Map<String, Object> outMap = new HashMap<String, Object>();
						outMap.put("CODE", data[j][0]);
						outMap.put("CODE_NAME", data[j][1]);
						dataFromList.add(outMap);
					}
				} else { // 数据来源为组合值1:男,0:女
					String val[] = dataFrom.split(",");
					for (int j = 0; j < val.length; j++) {
						Map<String, Object> valMap = new HashMap<String, Object>();
						String dataVal[] = val[j].split(":");
						valMap.put("CODE", dataVal[0]);
						valMap.put("CODE_NAME", dataVal[1]);
						dataFromList.add(valMap);
					}
				}
				rs.put(MapUtils.getString(colMap, "MAINTAIN_COLUMN_ID"), dataFromList);
			}
		}
		return rs;
	}
}
