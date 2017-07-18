package com.ery.meta.module.hBaseQuery;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.ery.base.support.jdbc.IParamsSetter;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;
import com.ery.meta.common.BlobRowListMapper;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

/**
 * 
 * 
 * 
 * 
 * @description 表管理的 Dao
 * @date 2013-4-25
 */

public class HBTableDao extends MetaBaseDAO {
	public List<Map<String, Object>> queryHBTableInfo(Map<String, Object> data) {
		String sql = "SELECT HB_TABLE_ID," + "			 HB_TABLE_NAME," + "            HB_TABLE_MSG "
				+ "            DATA_SOURCE_NAME " + "       FROM HB_TABLE_INFO,  " + "		WHERE 1=1 ";
		if (MapUtils.getString(data, "SOURCE_ID") != null && !"".equals(MapUtils.getString(data, "SOURCE_ID"))) {
			int source_id = MapUtils.getInteger(data, "SOURCE_ID");
			sql += " AND SOURCE_ID = " + source_id;
		}
		sql += " ORDER BY HB_TABLE_NAME DESC";
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"));
	}

	public List<Map<String, Object>> queryHBTableInfo(Map<String, Object> data, Page page) {
		String sql = "SELECT A.HB_TABLE_ID, A.HB_TABLE_NAME, B.DATA_SOURCE_NAME, A.HB_STATUS STATE, A.HB_TABLE_MSG,B.DATA_SOURCE_ID FROM HB_TABLE_INFO A, HB_DATA_SOURCE B WHERE   A.DATA_SOURCE_ID = B.DATA_SOURCE_ID";
		List<Object> params = new ArrayList<Object>();
		int state = MapUtils.getIntValue(data, "HB_STATE", -1);
		if (state != -1) {
			sql += " AND A.HB_STATUS=" + state;
		}
		if (MapUtils.getString(data, "TABLE_NAME") != null && !"".equals(MapUtils.getString(data, "TABLE_NAME"))) {
			String table_name = MapUtils.getString(data, "TABLE_NAME").toUpperCase();
			if (!table_name.contains("%") && !table_name.contains("_")) {
				sql += " AND UPPER(A.HB_TABLE_NAME) LIKE ? ESCAPE '/'";
				params.add("%" + table_name + "%");
			} else {
				table_name = table_name.replaceAll("_", "/_").replaceAll("%", "/%");
				sql += " AND UPPER(A.HB_TABLE_NAME) LIKE ? ESCAPE '/'";
				params.add("%" + table_name + "%");
			}
		}

		String dataSourceId = MapUtils.getString(data, "DATA_SOURCE_ID");
		if (dataSourceId != null && !"".equals(dataSourceId)) {
			sql += " AND B.DATA_SOURCE_ID = ?";
			params.add(Convert.toInt(dataSourceId, -1));
		}

		sql += " ORDER BY A.HB_TABLE_ID DESC";

		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(getDataAccess(), sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
	}

	/**
	 * 根据表ID，查询出规则信息
	 * 
	 * @param tableId
	 * @return
	 */
	public List<Map<String, Object>> getParamListById(long tableId) {
		String sql = "SELECT CLUSTER_ID,HB_CLUSTER_NAME,HB_TABLE_ID,DEFINE_CLUSTER_NAME,DEFINE_CLUSTER_MSG,ORDER_ID FROM HB_COLUMN_CLUSTER_INFO  WHERE HB_TABLE_ID=? ORDER BY ORDER_ID";
		return getDataAccess().queryForList(sql, tableId);
	}

	/**
	 * 根据ID取得表信息
	 * 
	 * @param tableId
	 * @return
	 */
	public Map<String, Object> getHBTable(long tableId) {
		String sql = "SELECT A.HB_TABLE_ID, " + "       A.HB_TABLE_NAME, " + "       A.HB_TABLE_MSG,A.COL_ZIP_TYPE,"
				+ "       A.COL_MAX_VERSION,A.COL_MIN_VERSION,A.BLOCK_SIZE,"
				+ "       A.HFILE_MAXVAL,A.MEMSTORE_FLUSH,A.BLOOM_TYPE," + "       A.NEWDATA_FLUSFLAG, "
				+ "       A.TABLE_TTL, " + "       A.DATA_SOURCE_ID, " + "       B.DATA_SOURCE_NAME, "
				+ "       B.DATA_SOURCE_ADDRESS, " + "       B.ROOT_ZNODE_NAME, " + "       B.PARENT_ZNODE_NAME, "
				+ "       B.PARALLEL_NUM " + "  FROM HB_TABLE_INFO A, HB_DATA_SOURCE B "
				+ " WHERE A.DATA_SOURCE_ID = B.DATA_SOURCE_ID " + "   AND A.HB_TABLE_ID = ?";
		Map<String, Object> map = getDataAccess().queryForMap(sql, tableId);
		return map;
	}

	/**
	 * 根据ID取得列信息列表
	 * 
	 * @param tableId
	 * @return
	 */
	public List<Map<String, Object>> getColumnInfoById(long tableId) {
		String sql = "SELECT COLUMN_ID, HB_COLUMN_NAME, HB_TABLE_ID, CLUSTER_ID, DEFINE_EN_COLUMN_NAME,DEFINE_CH_COLUMN_NAME, ORDER_ID FROM HB_COLUMN_INFO WHERE HB_TABLE_ID = ?";
		return getDataAccess().queryForList(sql, tableId);
	}

	/**
	 * 删除表信息
	 * 
	 * @param tableId
	 */
	public void deleteManagerTable(long tableId) {
		String sql = "DELETE FROM HB_TABLE_INFO WHERE HB_TABLE_ID=?";
		getDataAccess().execNoQuerySql(sql, tableId);
	}

	/**
	 * 删除字段信息
	 * 
	 * @param tableId
	 */
	public void deleteFieldInfo(long tableId) {
		String sql = "DELETE FROM HB_COLUMN_INFO WHERE HB_TABLE_ID=?";
		getDataAccess().execUpdate(sql, tableId);
		sql = "DELETE FROM HB_COLUMN_CLUSTER_INFO WHERE HB_TABLE_ID=?";
		getDataAccess().execUpdate(sql, tableId);
	}

	/**
	 * 保存表数据
	 * 
	 * @param data
	 * @param tblMode
	 */
	public void saveHbTableInfo(Map<String, Object> data, int tblMode) {
		if (tblMode != 1) {
			String sql = "INSERT INTO HB_TABLE_INFO" + " (HB_TABLE_ID,DATA_SOURCE_ID,HB_TABLE_NAME"
					+ ",HB_TABLE_MSG,HB_STATUS,COL_ZIP_TYPE" + ",COL_MAX_VERSION,COL_MIN_VERSION,BLOCK_SIZE"
					+ ",HFILE_MAXVAL,MEMSTORE_FLUSH,BLOOM_TYPE" + ",NEWDATA_FLUSFLAG,TABLE_TTL)"
					+ " VALUES(?,?,? ,?,?,? ,?,?,? ,?,?,? ,?,?)";
			getDataAccess().execUpdate(sql, Convert.toLong(data.get("HB_TABLE_ID")),
					Convert.toLong(data.get("DATA_SOURCE_ID")), Convert.toString(data.get("HB_TABLE_NAME")),
					Convert.toString(data.get("HB_TABLE_DESC")), 0, Convert.toLong(data.get("COL_ZIP_TYPE"), 0),
					Convert.toLong(data.get("COL_MAX_VERSION"), 3), Convert.toLong(data.get("COL_MIN_VERSION"), 1),
					Convert.toLong(data.get("BLOCK_SIZE"), 65536), Convert.toLong(data.get("HFILE_MAXVAL"), 268435456),
					Convert.toLong(data.get("MEMSTORE_FLUSH"), 67108864), Convert.toString(data.get("BLOOM_TYPE")),
					Convert.toLong(data.get("NEWDATA_FLUSFLAG")), Convert.toLong(data.get("TABLE_TTL")));
		} else {
			String sql = "UPDATE HB_TABLE_INFO" + " SET HB_TABLE_MSG=?,COL_ZIP_TYPE=?"
					+ ",COL_MAX_VERSION=?,COL_MIN_VERSION=?,BLOCK_SIZE=?"
					+ ",HFILE_MAXVAL=?,MEMSTORE_FLUSH=?,BLOOM_TYPE=?" + ",NEWDATA_FLUSFLAG=?,TABLE_TTL=? "
					+ " WHERE HB_TABLE_ID=?";
			getDataAccess().execUpdate(sql, Convert.toString(data.get("HB_TABLE_DESC")),
					Convert.toLong(data.get("COL_ZIP_TYPE"), 0), Convert.toLong(data.get("COL_MAX_VERSION"), 3),
					Convert.toLong(data.get("COL_MIN_VERSION"), 0), Convert.toLong(data.get("BLOCK_SIZE"), 65536),
					Convert.toLong(data.get("HFILE_MAXVAL"), 268435456),
					Convert.toLong(data.get("MEMSTORE_FLUSH"), 67108864), Convert.toString(data.get("BLOOM_TYPE")),
					Convert.toLong(data.get("NEWDATA_FLUSFLAG")), Convert.toLong(data.get("TABLE_TTL")),
					Convert.toLong(data.get("HB_TABLE_ID")));
		}
	}

	/**
	 * 保存字段信息
	 * 
	 * @param clus
	 */
	public void saveFieldInfos(List<Map<String, Object>> clus) {
		String cluSql = "INSERT INTO HB_COLUMN_CLUSTER_INFO"
				+ " (CLUSTER_ID,HB_CLUSTER_NAME,HB_TABLE_ID,DEFINE_CLUSTER_NAME,DEFINE_CLUSTER_MSG,ORDER_ID)"
				+ " VALUES(?,?,?,?,?,?)";
		String colSql = "INSERT INTO HB_COLUMN_INFO"
				+ " (COLUMN_ID,HB_COLUMN_NAME,HB_TABLE_ID,CLUSTER_ID,DEFINE_EN_COLUMN_NAME,"
				+ "   DEFINE_CH_COLUMN_NAME,ORDER_ID,COL_SPLIT)" + " VALUES(SEQ_HB_COLUMN_ID.NEXTVAL,?,?,?,?,?,?,?)";

		for (Map<String, Object> clu : clus) {
			getDataAccess().execUpdate(cluSql, Convert.toLong(clu.get("CLUSTER_ID")),
					Convert.toString(clu.get("HB_CLUSTER_NAME")), Convert.toLong(clu.get("HB_TABLE_ID")),
					Convert.toString(clu.get("DEFINE_CLUSTER_NAME")), Convert.toString(clu.get("DEFINE_CLUSTER_MSG")),
					Convert.toInt(clu.get("ORDER_ID")));

			final List<Map<String, Object>> cols = (List<Map<String, Object>>) clu.get("COLS");
			getDataAccess().execUpdateBatch(colSql, new IParamsSetter() {
				@Override
				public void setValues(PreparedStatement pstmt, int i) throws SQLException {
					Map<String, Object> col = cols.get(i);
					pstmt.setString(1, Convert.toString(col.get("HB_COLUMN_NAME")));
					pstmt.setLong(2, Convert.toLong(col.get("HB_TABLE_ID")));
					pstmt.setLong(3, Convert.toLong(col.get("CLUSTER_ID")));
					pstmt.setString(4, Convert.toString(col.get("DEFINE_EN_COLUMN_NAME")));
					pstmt.setString(5, Convert.toString(col.get("DEFINE_CH_COLUMN_NAME")));
					pstmt.setInt(6, Convert.toInt(col.get("ORDER_ID")));
					pstmt.setString(7, Convert.toString(col.get("COL_SPLIT")));
				}

				@Override
				public int batchSize() {
					return cols.size();
				}
			});
		}
	}

	/**
	 * 变更表状态
	 * 
	 * @param tableId
	 * @param state
	 */
	public void changeTableState(long tableId, int state) {
		getDataAccess().execUpdate("UPDATE HB_TABLE_INFO SET HB_STATUS=? WHERE HB_TABLE_ID=?", state, tableId);
	}

	/**
	 * 删除列族信息
	 * 
	 * @param tableId
	 */
	public void deleteCluster(long tableId) {
		String sql = "DELETE FROM HB_COLUMN_CLUSTER_INFO WHERE HB_TABLE_ID=?";
		getDataAccess().execNoQuerySql(sql, tableId);
	}

	/**
	 * 删除列信息
	 * 
	 * @param tableId
	 */
	public void deleteColumn(long tableId) {
		String sql = "DELETE FROM HB_COLUMN_INFO WHERE HB_TABLE_ID=?";
		getDataAccess().execNoQuerySql(sql, tableId);
	}

	/**
	 * 存储列信息
	 * 
	 * @param data
	 */
	public void deleteColumn(final List<Long> lstColumnId) {
		String sql = "DELETE FROM HB_COLUMN_INFO WHERE COLUMN_ID = ?";
		getDataAccess().execUpdateBatch(sql, new IParamsSetter() {
			public void setValues(PreparedStatement preparedStatement, int i) throws SQLException {
				Long columnId = lstColumnId.get(i);
				preparedStatement.setObject(1, columnId);
			}

			public int batchSize() {
				return lstColumnId.size();
			}
		});
	}

	public int[] saveCluster(final List<Map<String, Object>> paramDatas, final long tableId) {

		String sql = "INSERT INTO HB_COLUMN_CLUSTER_INFO(CLUSTER_ID,HB_CLUSTER_NAME,HB_TABLE_ID,DEFINE_CLUSTER_NAME,DEFINE_CLUSTER_MSG,ORDER_ID)"
				+ "VALUES(?,?,?,?,?,?)";
		List<Map<String, Object>> temp = new ArrayList<Map<String, Object>>();
		String maxName = null;
		for (Map<String, Object> map : paramDatas) {
			Object obj = map.get("hbclusterName");
			if (null == obj || obj.toString().length() <= 0) {
				temp.add(map);
			} else {// 获取最大的名称
				String tempName = obj.toString();
				if (null == maxName) {
					maxName = tempName;
					continue;
				}
				maxName = this.getMaxName(tempName, maxName);
			}
		}

		for (Map<String, Object> map : temp) {
			maxName = getNextName(maxName, "f1", 0);
			map.put("hbclusterName", maxName);
		}

		return getDataAccess().execUpdateBatch(sql, new IParamsSetter() {
			public void setValues(PreparedStatement preparedStatement, int i) throws SQLException {
				Map<String, Object> data = paramDatas.get(i);
				long clusterId = Convert.toLong(data.get("clusterId"), 0L);
				if (clusterId == 0l) {
					clusterId = queryForNextVal("SEQ_HB_CLUSTER_ID");
				}
				preparedStatement.setObject(1, clusterId);
				preparedStatement.setObject(2, Convert.toString(data.get("hbclusterName"), ""));
				preparedStatement.setObject(3, tableId);
				preparedStatement.setObject(4, Convert.toString(data.get("clusterName"), ""));
				preparedStatement.setObject(5, Convert.toString(data.get("clusterMsg"), ""));
				preparedStatement.setObject(6, Convert.toInt(data.get("orderId")));
			}

			public int batchSize() {
				return paramDatas.size();
			}
		});
	}

	/**
	 * 通过表ID查询出相关的列规则
	 * 
	 * @param tableId
	 * @return
	 */
	public List<Map<String, Object>> getClusterParamListById(long tableId) {
		String sql = "SELECT A.HB_TABLE_ID," + "       A.HB_CLUSTER_NAME," + "       A.DEFINE_CLUSTER_NAME,"
				+ "       A.DEFINE_CLUSTER_MSG," + "       C.HB_COLUMN_NAME," + "       C.DEFINE_EN_COLUMN_NAME,"
				+ "       C.DEFINE_CH_COLUMN_NAME," + "       C.CLUSTER_ID," + "       C.COLUMN_ID,"
				+ "       B.DATA_SOURCE_ID," + "       C.COL_SPLIT," + "       ROWNUM ORDER_ID"
				+ "  FROM HB_COLUMN_CLUSTER_INFO A, HB_TABLE_INFO B, HB_COLUMN_INFO C"
				+ " WHERE A.HB_TABLE_ID = B.HB_TABLE_ID" + "   AND A.CLUSTER_ID = C.CLUSTER_ID"
				+ "   AND C.HB_TABLE_ID = A.HB_TABLE_ID" + "   AND a.HB_TABLE_ID = ?"
				+ "   ORDER BY A.CLUSTER_ID,C.ORDER_ID";
		return getDataAccess().queryForList(sql, tableId);
	}

	/**
	 * 通过表ID查询出相关的列规则
	 * 
	 * @param tableId
	 * @return
	 */
	public List<Map<String, Object>> getClusterParamListById(String tableName, long sourceId) {
		String sql = "SELECT A.HB_TABLE_ID," + "       A.DEFINE_CLUSTER_NAME," + "       A.HB_CLUSTER_NAME,"
				+ "       C.DEFINE_EN_COLUMN_NAME," + "       C.DEFINE_CH_COLUMN_NAME," + "       C.CLUSTER_ID,"
				+ "       C.COLUMN_ID," + "       C.HB_COLUMN_NAME," + "       B.DATA_SOURCE_ID,"
				+ "       C.ORDER_ID ORDER_ID" + "  FROM HB_COLUMN_CLUSTER_INFO A, HB_TABLE_INFO B, HB_COLUMN_INFO C"
				+ " WHERE A.HB_TABLE_ID = B.HB_TABLE_ID" + "   AND A.CLUSTER_ID = C.CLUSTER_ID"
				+ "   AND C.HB_TABLE_ID = A.HB_TABLE_ID" + "   AND B.HB_TABLE_NAME = ?" + "   AND B.DATA_SOURCE_ID = ?"
				+ "    ORDER BY C.ORDER_ID";
		return getDataAccess().queryForList(sql, tableName, sourceId);
	}

	public void deleteClusterColumn(long tableId) {
		String sql = "DELETE FROM HB_COLUMN_INFO WHERE HB_TABLE_ID=?";
		getDataAccess().execNoQuerySql(sql, tableId);
	}

	/**
	 * 保存列规则
	 * 
	 * @param paramDatas
	 * @param tableId
	 * @return
	 */
	public int[] saveClusterComlumn(final List<Map<String, Object>> paramDatas, final long tableId) {
		String sql = "INSERT INTO HB_COLUMN_INFO" + "  (CLUSTER_ID," + "   HB_COLUMN_NAME," + "   HB_TABLE_ID,"
				+ "   HB_INDEX_TABLE_ID," + "   DEFINE_EN_COLUMN_NAME," + "   DEFINE_CH_COLUMN_NAME,"
				+ "   HB_ORDER_ID)" + "VALUES" + "  (?, ? ,?, ? ,?, ?,?)";
		;

		return getDataAccess().execUpdateBatch(sql, new IParamsSetter() {
			public void setValues(PreparedStatement preparedStatement, int i) throws SQLException {
				Map<String, Object> data = paramDatas.get(i);
				long clusterId = Convert.toLong(data.get("clusterId"), 0L);
				if (clusterId == 0l) {
					clusterId = Convert.toInt(data.get("clName"));
				}
				preparedStatement.setObject(1, clusterId);
				preparedStatement.setObject(2,
						Convert.toString(data.get("hbName")).length() > 0 ? Convert.toString(data.get("hbName")) : "测试");
				preparedStatement.setObject(3, tableId);
				preparedStatement.setObject(4,
						Convert.toInt(data.get("indexName")) == 1 ? tableId : Integer.parseInt(""));
				preparedStatement.setObject(5, Convert.toString(data.get("enName"), ""));
				preparedStatement.setObject(6, Convert.toString(data.get("chName"), ""));
				preparedStatement.setObject(7, Convert.toInt(data.get("orderId")));
			}

			public int batchSize() {
				return paramDatas.size();
			}
		});

	}

	/**
	 * 存储新建表信息
	 * 
	 */
	public long saveManagerTable(int dataSourceId, String managerName, String msg) {
		long pk = super.queryForNextVal("SEQ_HB_MANAGER_ID");
		String sql = "INSERT INTO HB_TABLE_INFO(HB_TABLE_ID, DATA_SOURCE_ID, HB_TABLE_NAME, HB_TABLE_MSG) VALUES(?,?,?,?)";
		getDataAccess().execUpdate(sql, pk, dataSourceId, managerName, msg);
		return pk;
	}

	/**
	 * 存储列族信息
	 */
	public Map<String, Object> saveCluster(Map<String, Object> data) {
		long pk = super.queryForNextVal("SEQ_HB_CLUSTER_ID");
		Map<String, Object> map = new HashMap<String, Object>();
		String sql = "INSERT INTO HB_COLUMN_CLUSTER_INFO(CLUSTER_ID,HB_CLUSTER_NAME,HB_TABLE_ID,DEFINE_CLUSTER_NAME,DEFINE_CLUSTER_MSG,ORDER_ID)"
				+ " VALUES(?,?,?,?,?,?)";
		getDataAccess().execUpdate(sql, pk, Convert.toString(data.get("HB_CLUSTER_NAME")),
				Convert.toLong(data.get("HB_TABLE_ID")), Convert.toString(data.get("paramDefineName")),
				Convert.toString(data.get("paramMSG")), Convert.toInt(data.get("orderId")));
		map.put(Convert.toString(data.get("paramDefineName")), pk);
		return map;
	}

	/**
	 * 获取列或者列簇自定义名称的最后一个
	 * 
	 * @param data
	 * @throws SQLException
	 */
	public String queryLastClusterName(Map<String, Object> data, String defaultName) throws SQLException {
		String sql = "SELECT A.* FROM (SELECT HB_CLUSTER_NAME, length(HB_CLUSTER_NAME) lens"
				+ "                      FROM HB_COLUMN_CLUSTER_INFO" + "                     WHERE HB_TABLE_ID = ?"
				+ "                  ORDER BY lens desc, HB_CLUSTER_NAME desc) A" + "             WHERE rowNum = 1";
		ResultSet res = getDataAccess().execQuerySql(sql, Convert.toLong(data.get("HB_TABLE_ID")));

		String name = null;
		while (res.next()) {
			name = res.getString("HB_CLUSTER_NAME");
		}

		return this.getNextName(name, defaultName, 0);
	}

	/**
	 * 获取列或者列簇自定义名称的最后一个
	 * 
	 * @param data
	 * @throws SQLException
	 */
	public String queryLastColumnName(Map<String, Object> data, String defaultName) throws SQLException {
		String sql = "SELECT A.* FROM (SELECT HB_COLUMN_NAME" + "                      FROM HB_COLUMN_INFO"
				+ "                     WHERE HB_TABLE_ID = ?" + "                       AND CLUSTER_ID = ?"
				+ "                  ORDER BY HB_COLUMN_NAME desc) A" + "             WHERE rowNum = 1";
		ResultSet res = getDataAccess().execQuerySql(sql, Convert.toLong(data.get("HB_TABLE_ID")),
				Convert.toLong(data.get("CLUSTER_ID")));

		String name = null;
		while (res.next()) {
			name = res.getString("HB_COLUMN_NAME");
		}

		return getNextName(name, defaultName, 1);
	}

	/**
	 * 获取列或者列簇自定义名称的最后一个
	 * 
	 * @param
	 * @throws SQLException
	 */
	public String queryLastColumnName(long hbTableId, String cluName, String defaultName) throws SQLException {
		String sql = "SELECT A.* FROM (SELECT HB_COLUMN_NAME, length(HB_COLUMN_NAME) lens"
				+ "                      FROM HB_COLUMN_INFO x"
				+ "                     WHERE EXISTS(select 1 from hb_column_cluster_info y where x.CLUSTER_ID=y.CLUSTER_ID"
				+ "                     and y.HB_TABLE_ID = ? AND y.HB_CLUSTER_NAME=?)"
				+ "                  ORDER BY lens desc, HB_COLUMN_NAME desc) A" + "             WHERE rowNum = 1";
		ResultSet res = getDataAccess().execQuerySql(sql, hbTableId, cluName);

		String name = null;
		while (res.next()) {
			name = res.getString("HB_COLUMN_NAME");
		}

		return getNextName(name, defaultName, 1);
	}

	/**
	 * 
	 * @param name
	 * @param defaultName
	 * @param type
	 *            0:列簇， 1：列
	 * @return
	 */
	public String getNextName(String name, String defaultName, int type) {
		switch (type) {
		case 0:
			if (name == null || name.length() <= 0) {
				return defaultName;
			}

			if (name.length() == 1) {
				char[] a = { (char) ((char) name.charAt(0) + 1) };
				return new String(a);
			} else {
				String ch = name.substring(1);
				int tmp = (null == ch || ch.length() <= 0) ? 1 : Integer.parseInt(ch) + 1;
				return name = name.substring(0, 1) + tmp;
			}
		case 1:
			if (name == null || name.length() <= 0) {
				return defaultName;
			}

			if ("z".equals(name)) {
				return "a1";
			}

			if ("a9".equals(name)) {
				return "b1";
			}

			if ("b9".equals(name)) {
				return "c1";
			}

			if ("c9".equals(name)) {
				return "d1";
			}

			if ("d9".equals(name)) {
				return "e1";
			}

			if ("e9".equals(name)) {
				return "f1";
			}

			if ("f9".equals(name)) {
				return "g1";
			}

			if ("g9".equals(name)) {
				return "h1";
			}

			if ("h9".equals(name)) {
				return "i1";
			}
			if ("i9".equals(name)) {
				return "j1";
			}
			if ("j9".equals(name)) {
				return "k1";
			}
			if ("k9".equals(name)) {
				return "l1";
			}
			if ("l9".equals(name)) {
				return "m1";
			}
			if ("m9".equals(name)) {
				return "n1";
			}
			if ("n9".equals(name)) {
				return "o1";
			}
			if ("o9".equals(name)) {
				return "p1";
			}
			if ("p9".equals(name)) {
				return "q1";
			}
			if ("q9".equals(name)) {
				return "r1";
			}
			if ("r9".equals(name)) {
				return "s1";
			}
			if ("s9".equals(name)) {
				return "t1";
			}
			if ("t9".equals(name)) {
				return "u1";
			}
			if ("u9".equals(name)) {
				return "v1";
			}
			if ("v9".equals(name)) {
				return "w1";
			}
			if ("w9".equals(name)) {
				return "x1";
			}
			if ("x9".equals(name)) {
				return "y1";
			}
			if ("y9".equals(name)) {
				return "z1";
			}

			if (name.length() == 1) {
				char[] a = { (char) ((char) name.charAt(0) + 1) };
				return new String(a);
			} else {
				String ch = name.substring(1);
				int tmp = (null == ch || ch.length() <= 0) ? 1 : Integer.parseInt(ch) + 1;
				return name = name.substring(0, 1) + tmp;
			}
		default:
			break;
		}

		return null;
	}

	/**
	 * 存储列信息
	 * 
	 * @param data
	 */
	public void saveColumn(Map<String, Object> data) {
		long pk = 0L;
		if (data.get("COLUMN_ID") == null || "".equals(data.get("COLUMN_ID"))) {
			pk = super.queryForNextVal("SEQ_HB_COLUMN_ID");
		} else {
			pk = Convert.toLong(data.get("COLUMN_ID"));
		}
		if (data.get("CLUSTER_ID") == null || "".equals(data.get("CLUSTER_ID"))) {
			data.put("CLUSTER_ID", data.get("clName"));
		}

		String sql = "INSERT INTO HB_COLUMN_INFO" + "  (COLUMN_ID," + "   CLUSTER_ID," + "   HB_COLUMN_NAME,"
				+ "   HB_TABLE_ID," + "   DEFINE_EN_COLUMN_NAME," + "   DEFINE_CH_COLUMN_NAME,"
				+ "   ORDER_ID,COL_SPLIT)" + "VALUES" + "  (?,?,?,?,?,?,?,?)";
		getDataAccess().execUpdate(sql, pk, Convert.toLong(data.get("CLUSTER_ID")),
				Convert.toString(data.get("HB_COLUMN_NAME")), Convert.toLong(data.get("HB_TABLE_ID")),
				Convert.toString(data.get("paramColumnNameEN")), Convert.toString(data.get("paramColumnNameCH")),
				Convert.toInt(data.get("orderId")), Convert.toString(data.get("paramColumnNameMark"))

		);
	}

	/**
	 * 存储第一张表
	 * 
	 * @param paramTable1Datas
	 */
	public int[] saveManagerTable1(final List<Map<String, Object>> paramTable1Datas,
			final Map<Integer, Long> clusterMap, final long managerId) {

		String sql = "INSERT INTO HB_COLUMN_CLUSTER_INFO(CLUSTER_ID,HB_CLUSTER_NAME,HB_TABLE_ID,DEFINE_CLUSTER_NAME,DEFINE_CLUSTER_MSG,ORDER_ID)"
				+ "VALUES(?,?,?,?,?,?)";

		return getDataAccess().execUpdateBatch(sql, new IParamsSetter() {
			public void setValues(PreparedStatement preparedStatement, int i) throws SQLException {
				Map<String, Object> data = paramTable1Datas.get(i);
				preparedStatement.setObject(1, clusterMap.get(i));
				preparedStatement.setObject(2, "");
				preparedStatement.setObject(3, 1001);
				preparedStatement.setObject(4, Convert.toString(data.get("paramDefineName"), ""));
				preparedStatement.setObject(5, Convert.toString(data.get("paramMSG"), ""));
				preparedStatement.setObject(6, Convert.toInt(data.get("orderId")));
			}

			public int batchSize() {
				return paramTable1Datas.size();
			}
		});

	}

	/**
	 * 存储第一张表
	 * 
	 * @param paramTable1Datas
	 */
	public int[] saveManagerTable2(final List<Map<String, Object>> paramTable1Datas,
			final Map<String, Long> clusterIdNameMap, final long managerId) {
		String sql = "INSERT INTO HB_COLUMN_INFO" + "  (CLUSTER_ID," + "   HB_COLUMN_NAME," + "   HB_TABLE_ID,"
				+ "   HB_INDEX_TABLE_ID," + "   DEFINE_EN_COLUMN_NAME," + "   DEFINE_CH_COLUMN_NAME,"
				+ "   HB_ORDER_ID)" + "VALUES" + "  (?, ? ,?, ? ,?, ?,?)";
		;

		return getDataAccess().execUpdateBatch(sql, new IParamsSetter() {
			public void setValues(PreparedStatement preparedStatement, int i) throws SQLException {
				Map<String, Object> data = paramTable1Datas.get(i);
				Set<String> key = clusterIdNameMap.keySet();
				long clusterId = 0L;
				for (String str : key) {
					if (str.equals(Convert.toString(data.get("paramDefineName")))) {
						clusterId = clusterIdNameMap.get(str);
						break;
					}
				}
				if (Convert.toString(data.get("paramDefineName")) != null &&
						Convert.toString(data.get("paramDefineName")).length() > 0) {

				}
				preparedStatement.setObject(1, 1033);
				preparedStatement.setObject(2, "测试1" + i);
				preparedStatement.setObject(3, 1001);
				preparedStatement.setObject(4, 1001);
				preparedStatement.setObject(5, Convert.toString(data.get("paramColumnNameEN"), ""));
				preparedStatement.setObject(6, Convert.toString(data.get("paramColumnNameCH"), ""));
				preparedStatement.setObject(7, Convert.toInt(data.get("orderId")));
			}

			public int batchSize() {
				return paramTable1Datas.size();
			}
		});

	}

	/**
	 * 根据查询规则ID查询表的信息
	 * 
	 * @param qryId
	 * @return
	 */
	public Map<String, Object> getHBTableInfoByQryId(long qryId) {
		String sql = "SELECT * FROM HB_TABLE_INFO WHERE HB_TABLE_ID =  (SELECT HB_TABLE_ID FROM HB_QRY_RULE WHERE QRY_RULE_ID = ?) ";
		Map<String, Object> map = getDataAccess().queryForMap(sql, qryId);
		return map; // To change body of created methods use File | Settings |
					// File Templates.
	}

	/**
	 * 根据资源ID和表ID查询表的信息
	 * 
	 * @param qryId
	 * @return
	 */
	public int getHBTableInfoById(long dataSourceId, long tableId) {
		String sql = "SELECT COUNT(*) FROM HB_TABLE_INFO WHERE DATA_SOURCE_ID = ? AND HB_TABLE_ID = ?";
		int count = getDataAccess().queryForInt(sql, dataSourceId, tableId);
		return count; // To change body of created methods use File | Settings |
						// File Templates.
	}

	/**
	 * 根据资源ID所属所有表信息
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> getHBTableInfoByDataSourceId(long dataSourceId) {
		String sql = "SELECT HB_TABLE_ID, HB_TABLE_NAME,HB_TABLE_MSG FROM HB_TABLE_INFO WHERE DATA_SOURCE_ID = ?";
		List<Map<String, Object>> tableinfo = getDataAccess().queryForList(sql, dataSourceId);
		return tableinfo;
	}

	/**
	 * 根据资源ID和表ID查询表的信息
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> getHBTableInfoById(long tableId) {
		String sql = "SELECT A.HB_TABLE_ID,A.HB_TABLE_NAME,A.DATA_SOURCE_ID,B.CLUSTER_ID,B.HB_CLUSTER_NAME,"
				+ " B.DEFINE_CLUSTER_NAME, B.DEFINE_CLUSTER_MSG" + " FROM HB_TABLE_INFO A,"
				+ "		 HB_COLUMN_CLUSTER_INFO B" + " WHERE A.HB_TABLE_ID = B.HB_TABLE_ID";
		sql += " AND A.HB_TABLE_ID = " + tableId;
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"));
	}

	/**
	 * 获取最大的名称
	 * 
	 * @param tempName
	 * @param maxName
	 * @return
	 */
	public String getMaxName(String tempName, String maxName) {
		if (tempName == null && maxName == null) {
			return null;
		}

		if (tempName == null && maxName != null) {
			return maxName;
		}

		if (tempName != null && maxName == null) {
			return tempName;
		}

		if (tempName != null && maxName != null && tempName.length() > maxName.length()) {
			return tempName;
		}

		if (tempName != null && maxName != null && tempName.length() < maxName.length()) {
			return maxName;
		}

		char ch[] = tempName.toCharArray();
		char maxCh[] = maxName.toCharArray();
		int len = maxCh.length >= ch.length ? ch.length : maxCh.length;
		for (int i = 0; i < len; i++) {
			if (ch[i] == maxCh[i]) {
				if (maxCh.length == i + 1 && maxCh.length < ch.length) {
					maxName = tempName;
				}
				continue;
			} else if (ch[i] > maxCh[i]) {
				maxName = tempName;
				break;
			} else {
				break;
			}
		}

		return maxName;
	}

	/**
	 * 检查数据表是否被使用
	 * 
	 * @param tableId
	 * @return
	 */
	public int checkCluster(long tableId, int flag) {
		String sql = "SELECT COUNT(*) FROM HB_QRY_RULE B  WHERE B.HB_TABLE_ID = ? ";
		if (flag == 0) {
			sql += " AND B.STATE = " + flag;
		}
		return getDataAccess().queryForInt(sql, tableId);
	}

	/**
	 * 根据表Id获取查询规则
	 * 
	 * @param tableId
	 * @return
	 */
	public List<Map<String, Object>> queryQRYRuleByTableId(long tableId) {
		String sql = "SELECT A.QRY_RULE_ID, A.DATA_SOURCE_ID FROM HB_QRY_RULE A WHERE A.HB_TABLE_ID = ? AND A.STATE = 0";
		return getDataAccess().queryForList(sql, tableId);
	}

	/**
	 * 根据表ID，得到查询规则名称
	 * 
	 * @param tblId
	 * @return
	 */
	public List<Map<String, Object>> getQryNameByTblId(long tblId) {
		String sql = "SELECT QRY_RULE_NAME FROM HB_QRY_RULE WHERE HB_TABLE_ID = ?";
		return getDataAccess().queryForList(sql, tblId);
	}

}
