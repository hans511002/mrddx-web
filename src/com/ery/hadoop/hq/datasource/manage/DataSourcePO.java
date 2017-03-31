package com.ery.hadoop.hq.datasource.manage;

import java.util.Map;

import org.apache.hadoop.hbase.HBaseConfiguration;

import com.ery.hadoop.hq.datasource.Constant;
import com.ery.base.support.utils.MapUtils;

public class DataSourcePO {

	String dateSourceId;
	String dataSourceName;;
	String zkServers;
	int parallelNum;
	int zkPort;
	String parentNode;
	String rootNode;
	String siteXml;
	HBaseConfiguration conf;

	public HBaseConfiguration getConf() {
		return conf;
	}

	public void setConf(HBaseConfiguration conf) {
		this.conf = conf;
	}

	public DataSourcePO(Map<String, Object> map) {
		dateSourceId = MapUtils.getString(map, "DATA_SOURCE_ID");
		dataSourceName = MapUtils.getString(map, "DATA_SOURCE_NAME");
		zkServers = MapUtils.getString(map, "ZOOKEEPER_SERVERS");
		parallelNum = MapUtils.getIntValue(map, "PARALLEL_NUM", Constant.DEFAULT_MIN_COUNT);
		zkPort = MapUtils.getIntValue(map, "ZOOKEEPER_PORT");
		parentNode = MapUtils.getString(map, "PARENT_ZNODE_NAME", Constant.PARENT_ZNODE_NAME);
		rootNode = MapUtils.getString(map, "ROOT_ZNODE_NAME", Constant.ROOT_ZNODE_NAME);
		siteXml = MapUtils.getString(map, "HBASE_SITE_XML", "");
	}

	public String getDateSourceId() {
		return dateSourceId;
	}

	public void setDateSourceId(String dateSourceId) {
		this.dateSourceId = dateSourceId;
	}

	public String getDataSourceName() {
		return dataSourceName;
	}

	public void setDataSourceName(String dataSourceName) {
		this.dataSourceName = dataSourceName;
	}

	public String getZkServers() {
		return zkServers;
	}

	public void setZkServers(String zkServers) {
		this.zkServers = zkServers;
	}

	public int getParallelNum() {
		return parallelNum;
	}

	public void setParallelNum(int parallelNum) {
		this.parallelNum = parallelNum;
	}

	public int getZkPort() {
		return zkPort;
	}

	public void setZkPort(int port) {
		this.zkPort = port;
	}

	public String getRootNode() {
		return rootNode;
	}

	public void setRootNode(String rootNode) {
		this.rootNode = rootNode;
	}

	public String getSiteXml() {
		return siteXml;
	}

	public void setSiteXml(String siteXml) {
		this.siteXml = siteXml;
	}

	public String getParentNode() {
		return parentNode;
	}

	public void setParentNode(String parentNode) {
		this.parentNode = parentNode;
	}
}
