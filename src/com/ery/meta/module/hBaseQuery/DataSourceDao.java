package com.ery.meta.module.hBaseQuery;

import java.io.File;
import java.io.FileInputStream;
import java.sql.Blob;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.BlobRowListMapper;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

import com.ery.base.support.jdbc.BinaryStream;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;
import com.ery.base.support.web.init.SystemVariableInit;

/**
 * 

 * 

 * @description 源数据管理的 Dao
 * @date 2013-4-22
 */
public class DataSourceDao extends MetaBaseDAO {

	public List<Map<String, Object>> queryForDataSource() {

		String sql = "SELECT DATA_SOURCE_ID, " + "DATA_SOURCE_NAME " + " FROM HB_DATA_SOURCE WHERE 1=1 ";
		sql += " ORDER BY DATA_SOURCE_NAME DESC";

		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"));
	}

	public List<Map<String, Object>> queryForDataSource(Map<String, Object> data, Page page) {
		String sql = "SELECT DATA_SOURCE_ID, DATA_SOURCE_NAME , DATA_SOURCE_ADDRESS, ZOOKEEPER_SERVERS,"
				+ " PARALLEL_NUM, HBASE_SITE_XML , ZOOKEEPER_PORT,ROOT_ZNODE_NAME,PARENT_ZNODE_NAME, STATE FROM HB_DATA_SOURCE WHERE 1=1 ";
		List<Object> params = new ArrayList<Object>();

		int data_state = Convert.toInt(MapUtils.getString(data, "DATA_STATUS"), -1);
		String data_id = MapUtils.getString(data, "DATA_ID");
		String data_name = MapUtils.getString(data, "DATA_NAME");
		String data_source_name = MapUtils.getString(data, "DATA_SOURCE_NAME");
		String data_source_address = MapUtils.getString(data, "DATA_SOURCE_ADDRESS");

		if (null != data_id & !"".equals(data_id)) {
			data_id = data_id.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += "AND DATA_SOURCE_ID LIKE ? ESCAPE '/'";
			params.add("%" + data_id + "%");
		}
		if (null != data_name & !"".equals(data_name)) {
			data_name = data_name.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += "AND DATA_SOURCE_NAME LIKE ? ESCAPE '/'";
			params.add("%" + data_name + "%");
		}
		if (null != data_source_address & !"".equals(data_source_address)) {
			sql += "AND DATA_SOURCE_ADDRESS = ? ";
			params.add(data_source_address);
		}
		if (null != data_source_name & !"".equals(data_source_name)) {
			sql += "AND DATA_SOURCE_NAME = ? ";
			params.add(data_source_name);
		}
		if (data_state != -1) {
			sql += "AND STATE = ? ";
			params.add(data_state);
		}
		sql += " ORDER BY DATA_SOURCE_ID DESC";

		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
	}

	/**
	 * 保存数据源(增加，修改)
	 * 
	 * @param data
	 * @return
	 */
	public long saveSourceInfo(Map<String, Object> data) throws Exception {
		String sql = "";
		long dataSourceId = -1;
		// ByteArrayInputStream byteIs = new
		// ByteArrayInputStream(MapUtils.getString(data,"hbaseSiteXml").getBytes("GBK"));
		BinaryStream bs = new BinaryStream();
		String sourceName = MapUtils.getString(data, "accRealName");
		// File f = new File(SystemVariable.WEB_ROOT_PATH);

		// bs.setInputStream((FileInputStream)MapUtils.getObject(data, "bs"));
		File file = new File(SystemVariableInit.WEB_ROOT_PATH, "../../requireAcc" + "/" + sourceName);
		if (file.isFile()) {
			FileInputStream fin = new FileInputStream(file);
			bs.setInputStream(fin);
		}
		if (MapUtils.getString(data, "dateSourceId") != null && !"".equals(MapUtils.getString(data, "dateSourceId"))) {
			dataSourceId = Long.parseLong(MapUtils.getString(data, "dateSourceId"));
			// File fe = new
			// File(SystemVariable.WEB_ROOT_PATH,"../../requireAcc"+"/"+sourceName);
			if (file.isFile()) {
				sql = "UPDATE HB_DATA_SOURCE SET DATA_SOURCE_NAME =?,DATA_SOURCE_ADDRESS=?,ZOOKEEPER_SERVERS=?,PARALLEL_NUM=?,HBASE_SITE_XML=?,ZOOKEEPER_PORT=?,ROOT_ZNODE_NAME=?,PARENT_ZNODE_NAME=?,STATE=?  WHERE DATA_SOURCE_ID =?";
			} else {
				sql = "UPDATE HB_DATA_SOURCE SET DATA_SOURCE_NAME =?,DATA_SOURCE_ADDRESS=?,ZOOKEEPER_SERVERS=?,PARALLEL_NUM=?,ZOOKEEPER_PORT=?,ROOT_ZNODE_NAME=?,PARENT_ZNODE_NAME=?,STATE=?  WHERE DATA_SOURCE_ID =?";
			}
		}
		List<Object> params = new ArrayList<Object>();
		if (dataSourceId == -1) {
			sql = "INSERT INTO HB_DATA_SOURCE(DATA_SOURCE_ID,DATA_SOURCE_NAME,DATA_SOURCE_ADDRESS,ZOOKEEPER_SERVERS,PARALLEL_NUM,"
					+ "HBASE_SITE_XML,ZOOKEEPER_PORT,ROOT_ZNODE_NAME,PARENT_ZNODE_NAME,STATE )"
					+ " VALUES(?,?,?,?,?,?,?,?,?,?)";
			dataSourceId = queryForNextVal("SEQ_HBASE_QUERY_DATA_SOURCE");
			params.add(dataSourceId);
			params.add(MapUtils.getString(data, "dateSourceName"));
			params.add(MapUtils.getString(data, "dateSourceAddress"));
			params.add(MapUtils.getString(data, "zookeeperServers"));
			params.add(MapUtils.getString(data, "parallelNum"));
			params.add(bs);
			params.add(MapUtils.getString(data, "zookeeperPort"));
			params.add(MapUtils.getString(data, "rootZnodeName"));
			params.add(MapUtils.getString(data, "parentZnodeName"));
			params.add(Integer.parseInt(MapUtils.getString(data, "state")));
			boolean isFlag = getDataAccess().execNoQuerySql(sql, params.toArray());
			return isFlag ? dataSourceId : -1l;
		} else {
			int i = 0;
			if (file.isFile()) {
				i = getDataAccess().execUpdate(sql, Convert.toString(data.get("dateSourceName")),
						Convert.toString(data.get("dateSourceAddress")),
						Convert.toString(data.get("zookeeperServers")), Convert.toString(data.get("parallelNum")), bs,
						Convert.toString(data.get("zookeeperPort")), Convert.toString(data.get("rootZnodeName")),
						Convert.toString(data.get("parentZnodeName")), Convert.toString(data.get("state")),
						dataSourceId);
			} else {
				i = getDataAccess().execUpdate(sql, Convert.toString(data.get("dateSourceName")),
						Convert.toString(data.get("dateSourceAddress")),
						Convert.toString(data.get("zookeeperServers")), Convert.toString(data.get("parallelNum")),
						Convert.toString(data.get("zookeeperPort")), Convert.toString(data.get("rootZnodeName")),
						Convert.toString(data.get("parentZnodeName")), Convert.toString(data.get("state")),
						dataSourceId);
			}
			if (i == 0) {
				return -1l;
			}
			return dataSourceId;
		}
	}

	/**
	 * 测试是否有这条数据源
	 * 
	 * @param id 数据源ID
	 * @return
	 */
	public boolean canDeleteData(String id) {
		String sql = "SELECT 1 FROM HB_DATA_SOURCE WHERE DATA_SOURCE_ID = ?";
		return getDataAccess().queryForInt(sql, Convert.toInt(id)) == 0;
	}

	/**
	 * 删除数据源
	 * 
	 * @param id 数据源ID
	 */
	public void deleteData(String id) {
		String sql = "DELETE FROM HB_DATA_SOURCE WHERE DATA_SOURCE_ID=?";
		getDataAccess().execNoQuerySql(sql, Convert.toInt(id));
	}

	/**
	 * 查询日志列表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryForDataLog(Map<String, Object> data, Page page) {
		String sql = "SELECT A.LOG_ID, B.USER_NAME, C.QRY_RULE_NAME, to_char(QRY_START_DATE,'yyyy-MM-dd HH24:mi:ss') QRY_START_DATE,TOTAL_TIME,A.QRY_TOTAL_TIME,A.QRY_FILTER_TIME,A.QRY_PAGE_TIME,A.QRY_FLAG, A.LOG_MSG FROM HB_USER_QRY_LOG A,HB_SERVER_USER B,HB_QRY_RULE C WHERE A.USER_ID=B.USER_ID(+) AND A.QRY_RULE_ID = C.QRY_RULE_ID ";
		List<Object> params = new ArrayList<Object>();
		int user_id = Convert.toInt(MapUtils.getString(data, "USER_ID"), -1);
		String qry_rule_name = MapUtils.getString(data, "RULE_NAME");
		int qry_flag = Convert.toInt(MapUtils.getString(data, "STATE"), -1);
		String start_date = MapUtils.getString(data, "START_DATE");
		String end_date = MapUtils.getString(data, "END_DATE");
		if (user_id != -1) {
			sql += "AND A.USER_ID = ? ";
			params.add(user_id);
		}
		if (qry_rule_name != null && !"".equals(qry_rule_name)) {
			if (!qry_rule_name.contains("%") && !qry_rule_name.contains("_")) {
				sql += " AND UPPER(C.QRY_RULE_NAME) LIKE UPPER(?) ";
				params.add("%" + qry_rule_name + "%");
			} else {
				qry_rule_name = qry_rule_name.replaceAll("_", "/_").replaceAll("%", "/%");
				sql += " AND Upper(C.QRY_RULE_NAME) LIKE UPPER(?) ESCAPE '/'  ";
				params.add("%" + qry_rule_name + "%");
			}
		}
		if (qry_flag != -1) {
			sql += "AND A.QRY_FLAG = ? ";
			params.add(qry_flag);
		}

		start_date = start_date + " 00:00:00";
		end_date = end_date + " 23:59:59";

		if (start_date != null && !"".equals(start_date)) {
			sql += " and A.QRY_START_DATE > to_date('" + start_date + "', 'yyyy-MM-dd HH24:mi:ss')";
		}
		if (end_date != null && !"".equals(end_date)) {
			sql += " and A.QRY_START_DATE < to_date('" + end_date + "', 'yyyy-MM-dd HH24:mi:ss')";
		}

		sql += " ORDER BY A.LOG_ID DESC";

		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
	}

	/**
	 * 根据ID查询数据源
	 * 
	 * @param dataSourceId
	 * @return
	 */
	public Map<String, Object> queryDataSourceById(long dataSourceId) {
		String sql = "SELECT * FROM HB_DATA_SOURCE WHERE DATA_SOURCE_ID = (SELECT DATA_SOURCE_ID FROM HB_QRY_RULE WHERE QRY_RULE_ID = ?)";
		Map<String, Object> maps = getDataAccess().queryForMap(sql, dataSourceId);
		return maps;
	}

	/**
	 * 查询用户与ID
	 * 
	 * @return
	 */
	public List<Map<String, Object>> getUser() {
		String sql = "SELECT USER_ID,USER_NAME  FROM HB_SERVER_USER";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 通过ID得到文件内容
	 * 
	 * @param dataId
	 * @return
	 */
	public Map<String, Object> getBlob(long dataId) {
		String sql = "SELECT HBASE_SITE_XML FROM HB_DATA_SOURCE  WHERE DATA_SOURCE_ID = ?";
		return getDataAccess().queryForMap(sql, dataId);
	}

	/**
	 * 验证数据源是否被启用
	 */
	public int queryRuleByDataSourceId(long dataSourceId) {
		String sql = "SELECT COUNT(1) FROM HB_QRY_RULE WHERE DATA_SOURCE_ID = ?";
		return getDataAccess().queryForInt(sql, dataSourceId);
	}

	/**
	 * 验证是否有配置文件
	 * 
	 * @param dataSourceId
	 * @return
	 */
	public int checkXml(long dataSourceId) {
		String sql = "SELECT HBASE_SITE_XML FROM HB_DATA_SOURCE WHERE DATA_SOURCE_ID = ?";
		Map<String, Object> map = getDataAccess().queryForMap(sql, dataSourceId);
		Blob blob = (Blob) map.get("HBASE_SITE_XML");
		if (blob == null) {
			return 0;
		}
		return 1;
	}

	/**
	 * 验证表是否使用数据源
	 * 
	 * @param dataSourceId
	 * @return
	 */
	public int queryTableInfoByDataId(long dataSourceId) {
		String sql = "SELECT COUNT(1) FROM HB_TABLE_INFO WHERE DATA_SOURCE_ID = ?";
		return getDataAccess().queryForInt(sql, dataSourceId);
	}

}