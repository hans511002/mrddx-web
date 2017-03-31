package com.ery.meta.module.mag.maintain;

import java.util.List;
import java.util.Map;

import com.ery.meta.common.MetaBaseDAO;

import com.ery.base.support.utils.MapUtils;

/**
 * 

 * @date 2012-05-21
 * @description 维护表主信息表操作DAO
 * 
 */
public class MetaMagTableMaintainDAO extends MetaBaseDAO {

	private MetaMagMaintainColumnDAO metaMagMaintainColumnDAO = new MetaMagMaintainColumnDAO();

	/**
	 * 通过维护表id，查询对应的表主信息和字段信息
	 * 
	 * @param maintainId 维护表id
	 * @return
	 */
	public Map<String, Object> queryTableInfo(int maintainId) {
		String sql = "SELECT T.MAINTAIN_ID,T.MAINTAIN_TABLE_NAME,T.MAINTAIN_SEQ,T.TABLE_PRIMARY_ID_COLUMN,"
				+ " T.DATASOURCE_ID,T.QUERY_COLUMNS,T.EDIT_COLUMNS,T.TABLE_TITLE,T.QUERY_PERCENTAGE "
				+ " FROM META_MAG_TABLE_MAINTAIN T WHERE T.MAINTAIN_ID=?";
		Map<String, Object> rs = getDataAccess().queryForMap(sql, maintainId);
		if (rs != null && rs.size() > 0) {
			// 查询显示字段列
			String queryColumns = MapUtils.getString(rs, "QUERY_COLUMNS");
			List<Map<String, Object>> queryCol = metaMagMaintainColumnDAO.queryColumnsByIds(queryColumns);
			// 查询编辑字段列
			String editColumns = MapUtils.getString(rs, "EDIT_COLUMNS");
			List<Map<String, Object>> editCol = metaMagMaintainColumnDAO.queryColumnsByIds(editColumns);
			rs.put("SHOW_QUERY_COLUMNS", queryCol);
			rs.put("SHOW_EDIT_COLUMNS", editCol);
			return rs;
		} else {
			return null;
		}
	}
}
