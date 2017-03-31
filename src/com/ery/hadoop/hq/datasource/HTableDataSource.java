package com.ery.hadoop.hq.datasource;

import java.io.IOException;
import java.util.Hashtable;

import org.apache.hadoop.conf.Configuration;

import com.ery.hadoop.hq.connection.HTableConnection;
import com.ery.hadoop.hq.connection.HTableConnectionPool;
import com.ery.base.support.log4j.LogUtils;

public class HTableDataSource {

	private static Hashtable<String, HTableConnectionPool> source = new Hashtable<String, HTableConnectionPool>();

	public static Hashtable<String, HTableConnectionPool> getDataSources() {
		return source;
	}

	synchronized public static boolean addSource(String dataSourceName, Configuration conf, String tableName, int min,
			int max) throws IOException {
		if (source.containsKey(dataSourceName) == false) {
			source.put(dataSourceName, new HTableConnectionPool(conf, tableName, min, max));
			return true;
		} else
			return false;
	}

	public static boolean addSource(String dataSourceName, Configuration conf, String tableName, int min)
			throws IOException {
		if (source.containsKey(dataSourceName) == false) {
			source.put(dataSourceName, new HTableConnectionPool(conf, tableName, min));
			return true;
		} else
			return false;
	}

	public static boolean addSource(String dataSourceName, Configuration conf, String tableName) throws IOException {
		if (source.containsKey(dataSourceName) == false) {
			source.put(dataSourceName, new HTableConnectionPool(conf, tableName));
			return true;
		} else
			return false;
	}

	public static void setMinCount(String dataSourceName, int min) {
		if (source.containsKey(dataSourceName) == true) {
			HTableConnectionPool pool = source.get(dataSourceName);
			pool.setMinCount(min);
		}
	}

	synchronized public static void removeSource(String dataSourceName) {
		HTableConnectionPool pool = null;
		if (source.containsKey(dataSourceName)) {
			pool = source.get(dataSourceName);
			source.remove(dataSourceName);
		}
		if (pool != null)
			pool.destroy();
	}

	public static HTableConnection getConnection(String dataSourceName) throws IOException {
		if (source.containsKey(dataSourceName) == false) {
			LogUtils.error("Hbase数据源不存在：" + dataSourceName);
			throw new IOException("Hbase数据源不存在[" + dataSourceName + "]");
		}
		HTableConnectionPool pool = source.get(dataSourceName);
		HTableConnection htable = null;
		htable = pool.getConnection();
		return htable;
	}

	public static HTableConnection getConnection(String dataSourceName, boolean onlyQuery) throws IOException {
		if (source.containsKey(dataSourceName) == false) {
			LogUtils.error("Hbase数据源不存在：" + dataSourceName);
			throw new IOException("Hbase数据源不存在[" + dataSourceName + "]");
		}
		HTableConnectionPool pool = source.get(dataSourceName);
		HTableConnection htable = null;
		htable = pool.getConnection(onlyQuery);
		return htable;
	}

	public static HTableConnectionPool getHtableConnectionPool(String dataSourceName) throws IOException {
		if (source.containsKey(dataSourceName) == false) {
			throw new IOException("��������Ϊ[" + dataSourceName + "]�����Դ");
		}
		return source.get(dataSourceName);
	}

}
