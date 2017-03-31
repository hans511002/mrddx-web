package com.ery.hadoop.hq.table.action;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;

import com.ery.hadoop.hq.common.Common;
import com.ery.hadoop.hq.datasource.manage.DataSourcePO;

public class HBaseDataSourceManager {

	private static Map<String, Configuration> map = new HashMap<String, Configuration>();
	private static HBaseDataSourceManager INSTANCE;

	private HBaseDataSourceManager() {

	}

	public static synchronized HBaseDataSourceManager getInstance() {
		if (null == INSTANCE) {
			synchronized (HBaseDataSourceManager.class) {
				if (null == INSTANCE) {
					INSTANCE = new HBaseDataSourceManager();
				}
			}
		}

		return INSTANCE;
	}

	public void putConfiguration(DataSourcePO dataSource) {
		if (null != dataSource) {
			Configuration conf = createConfiguration(dataSource);
			if (null != conf) {
				map.put(dataSource.getDateSourceId(), conf);
			}
		}
	}

	public Configuration getConfiguration(String dateSourceId) {
		return map.get(dateSourceId);
	}

	public Configuration removeConfiguration(String dateSourceId) {
		return map.remove(dateSourceId);
	}

	public Configuration createConfiguration(DataSourcePO dataSource) {
		org.apache.hadoop.conf.Configuration conf = HBaseConfiguration.create();
		// load siteXml
		try {
			String siteXml = dataSource.getSiteXml();
			if (siteXml != null && !siteXml.trim().equals("")) {
				InputStream in = Common.String2InputStream(siteXml);
				conf.addResource(in);
			}
		} catch (RuntimeException e) {
			throw new RuntimeException("XML配置错误：" + e.getMessage());
		}
		conf.set("zookeeper.znode.parent", dataSource.getParentNode());
		conf.set("zookeeper.znode.rootserver", dataSource.getRootNode());
		conf.set("hbase.zookeeper.property.clientPort", dataSource.getZkPort() + "");
		conf.set("hbase.zookeeper.quorum", dataSource.getZkServers());
		org.apache.hadoop.conf.Configuration nconf = HBaseConfiguration.create();
		for (Entry<String, String> e : conf) {
			nconf.set(e.getKey(), e.getValue());
		}
		return nconf;
	}
}
