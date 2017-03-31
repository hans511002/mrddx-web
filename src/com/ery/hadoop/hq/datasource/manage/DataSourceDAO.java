package com.ery.hadoop.hq.datasource.manage;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Blob;
import java.util.List;
import java.util.Map;

import com.ery.base.support.sys.podo.BaseDAO;

public class DataSourceDAO extends BaseDAO {

	public List<Map<String, Object>> queryDataSourceList() {
		String sql = "select t.data_source_id from hb_data_source t where t.state=0";
		List<Map<String, Object>> list = getDataAccess().queryForList(sql);
		return list;
	}

	public List<Map<String, Object>> queryDataSource() {
		String sql = "select t.data_source_id,t.data_source_name,t.zookeeper_servers,t.parallel_num,t.zookeeper_port"
				+ ",t.parent_znode_name,t.root_znode_name,t.hbase_site_xml from hb_data_source t where t.state=0";
		List<Map<String, Object>> list = getDataAccess().queryForList(sql);
		for (Map<String, Object> map : list) {
			readXml(map);
		}

		return list;
	}

	public Map<String, Object> queryDataSourceById(long id) {
		String sql = "select t.data_source_id,t.data_source_name,t.zookeeper_servers,t.parallel_num,t.zookeeper_port"
				+ ",t.parent_znode_name,t.root_znode_name,t.hbase_site_xml from hb_data_source t where t.data_source_id=? and t.state=0";
		Map<String, Object> map = getDataAccess().queryForMap(sql, id);
		this.readXml(map);
		return map;
	}

	private void readXml(Map<String, Object> map) {
		if (null == map) {
			return;
		}
		java.sql.Blob blob = (Blob) map.get("HBASE_SITE_XML");
		if (blob == null) {
			return;
		}
		InputStreamReader in = null;
		try {
			in = new InputStreamReader(blob.getBinaryStream());
			BufferedReader bf = new BufferedReader(in);
			StringBuffer buf = new StringBuffer();
			String s = null;
			while ((s = bf.readLine()) != null) {
				buf.append(s);
				buf.append("\n");
			}
			map.put("HBASE_SITE_XML", buf.toString());
		} catch (Exception e) {
			map.put("HBASE_SITE_XML", "");
		} finally {
			if (in != null) {
				try {
					in.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}

		}
	}
}
