package com.ery.meta.module.bigdata.mrddx.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**

 * 

 * @description
 * @date 2013-04-22
 */
public class DataSourceDAO extends MetaBaseDAO {

	/**
	 * 通过源类型ID判断：查询数据源参数--无分页
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryParamBySourceTypeId(Map<String, Object> data) {
		String sourceDBType = MapUtils.getString(data, "SOURCE_DB_TYPE");
		String sql = "SELECT T.SOURCE_PARAM_NAME AS PARAM_NAME,T.SOURCE_DESC AS PARAM_DESC FROM MR_DATA_SOURCE_PARAM_DEFAULT T WHERE 1=1 ";
		if (sourceDBType != null && !"".equals(sourceDBType)) {
			String tmp[] = sourceDBType.split(":");
			if (tmp.length == 2) {
				sql += " AND  T.SOURCE_DB_TYPE = " + tmp[0];
			}
		}
		sql += " ORDER BY  T.ORDER_ID";
		List<Object> param = new ArrayList<Object>();
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 查询数据源参数--无分页
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryTypeAll(Map<String, Object> data) {
		String sql = "SELECT T.SOURCE_TYPE_ID, T.SOURCE_NAME, T.SOURCE_DB_TYPE FROM MR_SOURCE_TYPE T WHERE 1 = 1 ";
		int sourceCate = MapUtils.getIntValue(data, "SOURCE_CATE", -1);
		if (sourceCate != -1) {
			sql += " AND SOURCE_CATE = " + sourceCate;
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql);
		return list;
	}

	/**
	 * 查询数据源
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryDataSource(Map<String, Object> data, Page page) {
		String columnSort = MapUtils.getString(data, "_COLUMN_SORT");
		String dataSourceName = MapUtils.getString(data, "DATA_SOURCE_NAME");
		String sourceTypeId = MapUtils.getString(data, "SOURCE_TYPE_ID_QUREY");
		String sourceCate = MapUtils.getString(data, "SOURCE_CATE");

		String sql = "SELECT A.DATA_SOURCE_ID, A.DATA_SOURCE_NAME,B.SOURCE_NAME, A.SOURCE_TYPE_ID,B.SOURCE_CATE,B.SOURCE_DB_TYPE  FROM MR_DATA_SOURCE A ,MR_SOURCE_TYPE B WHERE 1 = 1 AND A.SOURCE_TYPE_ID = B.SOURCE_TYPE_ID ";

		List<Object> param = new ArrayList<Object>();
		if (dataSourceName != null && !"".equals(dataSourceName)) {
			dataSourceName = dataSourceName.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += " AND A.DATA_SOURCE_NAME LIKE " + "'" + "%" + dataSourceName + "%" + "' ESCAPE '/'";
		}
		if (sourceTypeId != null && !"".equals(sourceTypeId)) {
			sql += " AND A.SOURCE_TYPE_ID = " + "'" + "" + sourceTypeId + "'";
		}
		if (sourceCate != null && !"".equals(sourceCate)) {
			sql += " AND A.SOURCE_CATE = " + sourceCate;
		} else {
			sql += " AND A.SOURCE_CATE = 0";
		}
		if (columnSort != null && !"".equals(columnSort)) {
			sql += " ORDER BY A." + columnSort;
		} else {
			sql += " ORDER BY A.DATA_SOURCE_ID ";
		}
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 查询最新的数据源ID
	 * 
	 * @return
	 */
	public long queryIdFromDataSourceTable() {
		String sql = "SELECT MAX(A.DATA_SOURCE_ID) FROM MR_DATA_SOURCE A WHERE 1 = 1";
		long pk = getDataAccess().queryForLong(sql);
		return pk;
	}

	/**
	 * 新增数据源
	 * 
	 * @param data
	 * @return
	 */
	public long saveDataSource(Map<String, Object> data) {
		// 获取数据源ID
		long pk = super.queryForNextVal("SEQ_BIG_DATA_SOURCE_ID");
		String sql = "INSERT INTO MR_DATA_SOURCE(DATA_SOURCE_ID,DATA_SOURCE_NAME,SOURCE_TYPE_ID,SOURCE_CATE) VALUES(?,?,?,(SELECT SOURCE_CATE FROM MR_SOURCE_TYPE WHERE SOURCE_TYPE_ID=?))";
		getDataAccess().execUpdate(sql, pk, Convert.toString(data.get("DATA_SOURCE_NAME")),
				Convert.toInt(data.get("SOURCE_TYPE_ID")), Convert.toInt(data.get("SOURCE_TYPE_ID")));

		return pk;
	}

	/**
	 * 新增数据源参数
	 * 
	 * @param data
	 * @return
	 */
	public int saveDataSourceParam(Map<String, Object> data) {
		String sql = "INSERT INTO MR_DATA_SOURCE_PARAM(DATA_SOURCE_ID,PARAM_NAME,PARAM_VALUE,PARAM_DESC) VALUES(?,?,?,?)";
		return getDataAccess().execUpdate(sql, Convert.toString(data.get("DATA_SOURCE_ID")),
				Convert.toString(data.get("PARAM_NAME")), Convert.toString(data.get("PARAM_VALUE")),
				Convert.toString(data.get("PARAM_DESC")));
	}

	/**
	 * 修改数据源表
	 * 
	 * @param data
	 * @return
	 */
	public boolean updateDataSource(Map<String, Object> data) {
		String sql = "UPDATE MR_DATA_SOURCE SET DATA_SOURCE_NAME=?,SOURCE_TYPE_ID=?,SOURCE_CATE=? WHERE DATA_SOURCE_ID=? ";
		return getDataAccess().execNoQuerySql(sql, Convert.toString(data.get("DATA_SOURCE_NAME")),
				Convert.toInt(data.get("SOURCE_TYPE_ID")), Convert.toInt(data.get("SOURCE_CATE")),
				Convert.toString(data.get("DATA_SOURCE_ID")));
	}

	/**
	 * 查询数据源参数表中是否存在数据源ID
	 * 
	 * @param data
	 * @return
	 */
	public String queryIsSouceTypeId(int dataSourceId) {
		String sql = "SELECT DISTINCT(t.data_source_id) FROM MR_DATA_SOURCE_PARAM t WHERE 1=1";
		sql += " AND T.DATA_SOURCE_ID = " + "'" + dataSourceId + "'";
		String rs = getDataAccess().queryForString(sql);
		return rs;
	}

	/**
	 * 新增数据源参数
	 * 
	 * @param data
	 * @return
	 */
	public boolean insertDataSourceParam(Map<String, Object> data) {
		String sql = "INSERT INTO MR_DATA_SOURCE_PARAM(DATA_SOURCE_ID,PARAM_NAME,PARAM_VALUE,PARAM_DESC) VALUES(?,?,?,?)";
		return getDataAccess().execNoQuerySql(sql, Convert.toString(data.get("DATA_SOURCE_ID")),
				Convert.toString(data.get("PARAM_NAME")), Convert.toString(data.get("PARAM_VALUE")),
				Convert.toString(data.get("PARAM_DESC")));
	}

	/**
	 * 修改数据源参数表
	 * 
	 * @param data
	 * @return
	 */
	public boolean updateDataSourceParam(Map<String, Object> data) {
		String sql = "UPDATE MR_DATA_SOURCE_PARAM SET PARAM_VALUE=?,PARAM_DESC=? WHERE DATA_SOURCE_ID=? AND PARAM_NAME =?";
		return getDataAccess().execNoQuerySql(sql, Convert.toString(data.get("PARAM_VALUE")),
				Convert.toString(data.get("PARAM_DESC")), Convert.toString(data.get("DATA_SOURCE_ID")),
				Convert.toString(data.get("PARAM_NAME")));
	}

	/**
	 * 通过数据源ID：查询是否存在引用的数据源的ID--无分页
	 * 
	 * @param data
	 * @return
	 */
	public int queryJobId(int data) {
		String sql = "SELECT COUNT(*) FROM("
				+ " SELECT 1 FROM MR_FTP_COL_JOB WHERE COL_RUN_DATASOURCE = ?"
				+ " UNION ALL"
				+ " SELECT 1 FROM MR_FTP_COL_JOBparam where INPUT_DATASOURCE_ID = ? or INPUT_FILELST_DATASOURCE_ID = ? or OUTPUT_DATASOURCE_ID = ?"
				+ " UNION ALL"
				+ " SELECT 1 FROM MR_JOB WHERE INPUT_DATA_SOURCE_ID = ? OR OUTPUT_DATA_SOURCE_ID = ? OR JOB_RUN_DATASOURCE = ?"
				+ " )";
		List<Object> param = new ArrayList<Object>();
		param.add(data);
		param.add(data);
		param.add(data);
		param.add(data);
		param.add(data);
		param.add(data);
		param.add(data);
		return getDataAccess().queryForInt(sql, param.toArray());
	}

	/**
	 * 根据数据源ID删除数据源表+数据源参数表
	 * 
	 * @param serverId
	 * @return
	 */
	public boolean deleteDataSource(int dataSourceId) {
		String sql = "DELETE  FROM MR_DATA_SOURCE WHERE DATA_SOURCE_ID=?";
		return getDataAccess().execNoQuerySql(sql, dataSourceId);
	}

	/**
	 * 根据数据源ID删除数据源表+数据源参数表
	 * 
	 * @param serverId
	 * @return
	 */
	public boolean deleteDataSourceParam(int dataSourceId) {
		String sql = "DELETE FROM MR_DATA_SOURCE_PARAM WHERE DATA_SOURCE_ID=?";
		return getDataAccess().execNoQuerySql(sql, dataSourceId);
	}

	/**
	 * 通过数据源ID判断：查询数据源参数--无分页
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryParamByDataSourceId(Map<String, Object> data) {
		String dataSourceId = MapUtils.getString(data, "DATA_SOURCE_ID");
		String sql = "SELECT B.DATA_SOURCE_ID, B.PARAM_NAME, B.PARAM_VALUE, B.PARAM_DESC FROM MR_DATA_SOURCE A, MR_DATA_SOURCE_PARAM B WHERE A.DATA_SOURCE_ID = B.DATA_SOURCE_ID";
		if (dataSourceId != null && !"".equals(dataSourceId)) {
			sql += " AND B.DATA_SOURCE_ID = " + "'" + dataSourceId + "'";
		}
		List<Object> param = new ArrayList<Object>();
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 通过所属数据类型ID判断：查询数据源默认参数--无分页
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryDataSourceDefaultParamBySourceDBType(Map<String, Object> data) {
		String dataSourceId = MapUtils.getString(data, "DATA_SOURCE_ID");
		String sql = "SELECT A.SOURCE_PARAM_NAME AS PARAM_NAME, A.SOURCE_DESC PARAM_DESC, B.DATA_SOURCE_ID DATA_SOURCE_ID FROM MR_DATA_SOURCE_PARAM_DEFAULT A, MR_DATA_SOURCE B, MR_SOURCE_TYPE C WHERE B.SOURCE_TYPE_ID = C.SOURCE_TYPE_ID AND C.SOURCE_DB_TYPE=A.SOURCE_DB_TYPE";
		if (dataSourceId != null && !"".equals(dataSourceId)) {
			sql += " AND B.DATA_SOURCE_ID = " + "'" + dataSourceId + "'";
		} else {
			sql += " AND B.DATA_SOURCE_ID = '-1'";
		}

		List<Object> param = new ArrayList<Object>();
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

}
