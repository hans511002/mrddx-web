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
 * @description 维护表查询信息表操作DAO
 * 
 */
public class MetaMagMaintainQueryDAO extends MetaBaseDAO {

	private MetaMagMaintainColumnDAO metaMagMaintainColumnDAO = new MetaMagMaintainColumnDAO();

	/**
	 * 查询搜索条件数据
	 * 
	 * @param maintainId 维护表id
	 * @return
	 */
	public Map<String, Object> querySearchList(int maintainId) {
		Map<String, Object> rsMap = new HashMap<String, Object>(); // 返回map
		String ids = ""; // 关联列ids
		List<Map<String, Object>> rs = new ArrayList<Map<String, Object>>(); // 搜索条件数据
		// 查询搜索条件信息
		String searchSql = "SELECT Q.MAINTAIN_QUERY_ID,Q.MAINTAIN_ID,Q.QUERY_COLUMNS,"
				+ " Q.IS_LIKE_QUERY,Q.QUERY_COLUMN_TITLE,Q.QUERY_CONTROL,Q.ORDER_ID "
				+ " FROM META_MAG_MAINTAIN_QUERY Q WHERE Q.MAINTAIN_ID=? order by Q.ORDER_ID";
		List<Map<String, Object>> searchList = getDataAccess().queryForList(searchSql, maintainId);
		if (searchList != null && searchList.size() > 0) {
			for (int i = 0; i < searchList.size(); i++) {
				Map<String, Object> searchMap = searchList.get(i);
				String searchColumns = MapUtils.getString(searchMap, "QUERY_COLUMNS");
				List<Map<String, Object>> searchCol = metaMagMaintainColumnDAO.queryColumnsByIds(searchColumns);
				searchMap.put("SHOW_SEARCH_COLUMNS", searchCol);
				rs.add(searchMap);
				ids += searchColumns + ",";
			}
		}
		ids = ids.substring(0, ids.length() - 1);
		rsMap.put("ids", ids);
		rsMap.put("SHOW_SEARCH_LIST", rs);
		return rsMap;
	}
}
