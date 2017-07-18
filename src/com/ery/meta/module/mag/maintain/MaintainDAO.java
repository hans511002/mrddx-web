package com.ery.meta.module.mag.maintain;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.base.support.utils.MapUtils;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

/**
 * 
 * 
 * @date 2012-05-21
 * @description 维护表操作DAO
 * 
 */
public class MaintainDAO extends MetaBaseDAO {

	// /**
	// * 通过维护表id，查询对应的表主信息和字段信息
	// * @param maintainId 维护表id
	// * @return
	// */
	// public Map<String,Object> queryTableInfo(int maintainId){
	// String sql =
	// "SELECT T.MAINTAIN_ID,T.MAINTAIN_TABLE_NAME,T.MAINTAIN_SEQ,T.TABLE_PRIMARY_ID_COLUMN,"
	// +
	// " T.DATASOURCE_ID,T.QUERY_COLUMNS,T.EDIT_COLUMNS,T.TABLE_TITLE " +
	// " FROM META_MAG_TABLE_MAINTAIN T WHERE T.MAINTAIN_ID=?";
	// Map<String,Object> rs = getDataAccess().queryForMap(sql,maintainId);
	// if(rs!=null&&rs.size()>0){
	// //查询显示字段列
	// String queryColumns = MapUtils.getString(rs, "QUERY_COLUMNS");
	// List<Map<String,Object>> queryCol = queryColumnsByIds(queryColumns);
	// //查询编辑字段列
	// String editColumns = MapUtils.getString(rs, "EDIT_COLUMNS");
	// List<Map<String,Object>> editCol = queryColumnsByIds(editColumns);
	// rs.put("SHOW_QUERY_COLUMNS", queryCol);
	// rs.put("SHOW_EDIT_COLUMNS", editCol);
	// return rs;
	// }else{
	// return null;
	// }
	// }
	//
	// /**
	// * 查询搜索条件数据
	// * @param maintainId 维护表id
	// * @return
	// */
	// public Map<String,Object> querySearchList(int maintainId){
	// Map<String,Object> rsMap = new HashMap<String, Object>(); //返回map
	// String ids = ""; //关联列ids
	// List<Map<String,Object>> rs = new ArrayList<Map<String,Object>>();
	// //搜索条件数据
	// //查询搜索条件信息
	// String searchSql =
	// "SELECT Q.MAINTAIN_QUERY_ID,Q.MAINTAIN_ID,Q.QUERY_COLUMNS," +
	// " Q.IS_LIKE_QUERY,Q.QUERY_COLUMN_TITLE,Q.QUERY_CONTROL,Q.ORDER_ID " +
	// " FROM META_MAG_MAINTAIN_QUERY Q WHERE Q.MAINTAIN_ID=? order by Q.ORDER_ID";
	// List<Map<String,Object>> searchList =
	// getDataAccess().queryForList(searchSql,maintainId);
	// if(searchList!=null&&searchList.size()>0){
	// for (int i = 0; i < searchList.size(); i++) {
	// Map<String,Object> searchMap = searchList.get(i);
	// String searchColumns = MapUtils.getString(searchMap, "QUERY_COLUMNS");
	// List<Map<String,Object>> searchCol = queryColumnsByIds(searchColumns);
	// searchMap.put("SHOW_SEARCH_COLUMNS", searchCol);
	// rs.add(searchMap);
	// ids += searchColumns+",";
	// }
	// }
	// ids = ids.substring(0, ids.length()-1);
	// rsMap.put("ids", ids);
	// rsMap.put("SHOW_SEARCH_LIST", rs);
	// return rsMap;
	// }
	//
	// /**
	// * 通过ids查询关联列
	// * @param ids 列ids
	// * @return
	// */
	// public List<Map<String,Object>> queryColumnsByIds(String ids){
	// String sql =
	// "SELECT T.MAINTAIN_COLUMN_ID,T.MAINTAIN_COLUMN_NAME,T.MAINTAIN_COLUMN_NAMECN,"
	// +
	// " T.DATA_FROM,T.DATASOURCE_ID,T.VALIDATE_RULE,T.COLUMN_DESC " +
	// " FROM META_MAG_MAINTAIN_COLUMN T WHERE T.MAINTAIN_COLUMN_ID IN ("+ids+")"
	// +
	// " order by T.MAINTAIN_COLUMN_ID";
	// List<Map<String,Object>> rs = getDataAccess().queryForList(sql);
	// return rs;
	// }

	// /**
	// * 通过传入列ids查询DATA_FROM存在的数据
	// * @param colIds 列ids
	// * @return
	// */
	// public Map<String,Object> queryAllColumn(String colIds){
	// Map<String,Object> rs = new HashMap<String, Object>();
	// String sql =
	// "SELECT T.MAINTAIN_COLUMN_ID,T.MAINTAIN_COLUMN_NAME,T.MAINTAIN_COLUMN_NAMECN,"
	// +
	// " T.DATA_FROM,T.DATASOURCE_ID,T.VALIDATE_RULE,T.COLUMN_DESC " +
	// " FROM META_MAG_MAINTAIN_COLUMN T WHERE " +
	// " T.MAINTAIN_COLUMN_ID IN("+colIds+") AND T.DATA_FROM IS NOT NULL";
	// List<Map<String,Object>> colList = getDataAccess().queryForList(sql);
	// if(colList!=null&&colList.size()>0){
	// for (int i = 0; i < colList.size(); i++) {
	// List<Map<String,Object>> dataFromList = new
	// ArrayList<Map<String,Object>>(); //保存有dataFrom的数据
	// Map<String,Object> colMap = colList.get(i);
	// String dataFrom = MapUtils.getString(colMap, "DATA_FROM"); //数据来源
	// //当同时存在select和from的时候，该数据来源为sql
	// if(dataFrom.toUpperCase().indexOf("SELECT")!=-1&&dataFrom.toUpperCase().indexOf("FROM")!=-1){
	// String datasourceId = MapUtils.getString(colMap, "DATASOURCE_ID");
	// dataFromList = getDataAccess(datasourceId).queryForList(dataFrom);
	// }else{ //数据来源为组合值1:男,0:女
	// String val [] = dataFrom.split(",");
	// for (int j = 0; j < val.length; j++) {
	// Map<String,Object> valMap = new HashMap<String, Object>();
	// String dataVal [] = val[j].split(":");
	// valMap.put("CODE", dataVal[0]);
	// valMap.put("CODE_NAME", dataVal[1]);
	// dataFromList.add(valMap);
	// }
	// }
	// rs.put(MapUtils.getString(colMap, "MAINTAIN_COLUMN_ID"), dataFromList);
	// }
	// }
	// return rs;
	// }

	/**
	 * 通过搜索条件，查询对应表信息下的数据
	 * 
	 * @param data
	 * @param page
	 *            分页
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> queryTableDataById(Map<String, Object> data, Page page) {
		Map<String, Object> tableInfo = (Map<String, Object>) data.get("tableInfo"); // 表信息map
		String tableName = MapUtils.getString(tableInfo, "MAINTAIN_TABLE_NAME"); // 表名
		String datasourceId = MapUtils.getString(tableInfo, "DATASOURCE_ID"); // 表数据源
		String primaryId = MapUtils.getString(tableInfo, "TABLE_PRIMARY_ID_COLUMN"); // 表主键
		List<Map<String, Object>> searchList = (List<Map<String, Object>>) tableInfo.get("SHOW_SEARCH_LIST"); // 搜索条件
		List<Object> param = new ArrayList<Object>(); // 传入参数
		String sql = "SELECT T.* FROM " + tableName + " T WHERE 1=1 ";
		for (int i = 0; i < searchList.size(); i++) {
			boolean check = false; // 验证开关，判断搜索框中是否有输入信息，为true时，添加查询条件
			Map<String, Object> map = searchList.get(i);
			int queryControl = MapUtils.getIntValue(map, "QUERY_CONTROL"); // 类型，0表示input框，1表示select框
			int isLikeQuery = MapUtils.getIntValue(map, "IS_LIKE_QUERY"); // 查询方式，0表示普通查询，1表示模糊查询
			String maintainQueryId = MapUtils.getString(map, "MAINTAIN_QUERY_ID");// 查询列主键id
			Object search = data.get(("search" + maintainQueryId));
			// 如果查询框不为空时
			if (search != null) {
				if (queryControl == 1) { // 为select框
					// 值并且不为-1时，验证通过
					if (!search.toString().equals("-1")) {
						check = true;
					}
				} else if (queryControl == 0) { // 为input框
					check = true;
				}
			}
			if (check) {
				sql += " AND ( ";
				List<Map<String, Object>> searchColumns = (List<Map<String, Object>>) map.get("SHOW_SEARCH_COLUMNS");
				for (int j = 0; j < searchColumns.size(); j++) {
					Map<String, Object> colMap = searchColumns.get(j);
					String columnName = MapUtils.getString(colMap, "MAINTAIN_COLUMN_NAME");
					if (j == 0) {
						sql += " UPPER(T." + columnName + ")";
					} else {
						sql += " OR UPPER(T." + columnName + ")";
					}
					if (isLikeQuery == 0) { // 普通查询
						sql += " = ?";
						param.add(search.toString().toUpperCase());
					} else if (isLikeQuery == 1) { // 模糊查询
						String keyWord = search.toString();
						sql += " LIKE ? ESCAPE '/' ";
						if (keyWord.contains("_") || keyWord.contains("%")) {
							keyWord = keyWord.replaceAll("_", "/_").replaceAll("%", "/%");
						}
						param.add("%" + keyWord.toUpperCase() + "%");
					}
				}
				sql += " ) ";
			}
		}
		sql += " ORDER BY T." + primaryId + " DESC";
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(getDataAccess(), sql, page);
		}
		List<Map<String, Object>> rs = getDataAccess(datasourceId).queryForList(sql, param.toArray());
		return rs;
	}

	/**
	 * 通过主键信息，删除数据
	 * 
	 * @param data
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public void deleteData(Map<String, Object> data) {
		Map<String, Object> tableInfo = (Map<String, Object>) data.get("tableInfo"); // 表信息map
		String tableName = MapUtils.getString(tableInfo, "MAINTAIN_TABLE_NAME"); // 表名
		String datasourceId = MapUtils.getString(tableInfo, "DATASOURCE_ID"); // 表数据源
		String primaryCol = MapUtils.getString(tableInfo, "TABLE_PRIMARY_ID_COLUMN"); // 表主键
		String sql = "DELETE FROM " + tableName + " T WHERE T." + primaryCol + " = ?";
		getDataAccess(datasourceId).execUpdate(sql, data.get("valId"));
	}

	/**
	 * 新增数据
	 * 
	 * @param data
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public void addData(Map<String, Object> data) {
		Map<String, Object> tableInfo = (Map<String, Object>) data.get("tableInfo"); // 表信息map
		String tableName = MapUtils.getString(tableInfo, "MAINTAIN_TABLE_NAME"); // 表名
		String datasourceId = MapUtils.getString(tableInfo, "DATASOURCE_ID"); // 表数据源
		String primaryCol = MapUtils.getString(tableInfo, "TABLE_PRIMARY_ID_COLUMN"); // 表主键
		String seq = MapUtils.getString(tableInfo, "MAINTAIN_SEQ"); // 表seq
		long primaryId = 1;
		if (seq != null && !seq.equals("")) {
			primaryId = queryForNextVal(seq, datasourceId);
		} else {
			String searchSql = "SELECT (MAX(" + primaryCol + ")+1) AS ID FROM " + tableName + " T ";
			Map<String, Object> idMap = getDataAccess(datasourceId).queryForMap(searchSql);
			if (idMap != null) {
				primaryId = MapUtils.getLongValue(idMap, "ID", 1);
			}
		}

		// 得到可编辑的列配置
		List<Object> param = new ArrayList<Object>(); // 传入参数
		List<Map<String, Object>> editColumnsList = (List<Map<String, Object>>) tableInfo.get("SHOW_EDIT_COLUMNS");
		String sql = "INSERT INTO " + tableName + "(" + primaryCol;
		String str = "?";
		param.add(primaryId);
		for (int i = 0; i < editColumnsList.size(); i++) {
			Map<String, Object> editColumnMap = editColumnsList.get(i);
			sql += "," + MapUtils.getString(editColumnMap, "MAINTAIN_COLUMN_NAME");
			str += ",?";
			param.add(data.get(MapUtils.getString(editColumnMap, "MAINTAIN_COLUMN_NAME")));
		}
		sql += ") VALUES(" + str + ")";
		getDataAccess(datasourceId).execUpdate(sql, param.toArray());
	}

	/**
	 * 修改数据
	 * 
	 * @param data
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public void updateData(Map<String, Object> data) {
		Map<String, Object> tableInfo = (Map<String, Object>) data.get("tableInfo"); // 表信息map
		String tableName = MapUtils.getString(tableInfo, "MAINTAIN_TABLE_NAME"); // 表名
		String datasourceId = MapUtils.getString(tableInfo, "DATASOURCE_ID"); // 表数据源
		String primaryCol = MapUtils.getString(tableInfo, "TABLE_PRIMARY_ID_COLUMN"); // 表主键

		// 得到可编辑的列配置
		List<Object> param = new ArrayList<Object>(); // 传入参数
		List<Map<String, Object>> editColumnsList = (List<Map<String, Object>>) tableInfo.get("SHOW_EDIT_COLUMNS");
		String sql = "UPDATE " + tableName + " T SET ";
		for (int i = 0; i < editColumnsList.size(); i++) {
			Map<String, Object> editColumnMap = editColumnsList.get(i);
			if (i == 0) {
				sql += " " + MapUtils.getString(editColumnMap, "MAINTAIN_COLUMN_NAME") + "=?";
			} else {
				sql += ", " + MapUtils.getString(editColumnMap, "MAINTAIN_COLUMN_NAME") + "=?";
			}
			param.add(data.get(MapUtils.getString(editColumnMap, "MAINTAIN_COLUMN_NAME")));
		}
		sql += " WHERE T." + primaryCol + "=?";
		param.add(data.get("valId"));
		getDataAccess(datasourceId).execUpdate(sql, param.toArray());
	}
}
