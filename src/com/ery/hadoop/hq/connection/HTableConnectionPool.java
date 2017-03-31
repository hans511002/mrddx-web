package com.ery.hadoop.hq.connection;

import java.io.IOException;
import java.util.Vector;

import org.apache.hadoop.conf.Configuration;

public class HTableConnectionPool {

    public Vector<HTableConnection> htables = new Vector<HTableConnection>();
    private int minCount = 5;// ���������Ӵ�С
    private int maxCount = 100;// ��������Ӵ�С
    private String tableName = "";
    private Configuration conf = null; // hbase.client.scanner.caching
    HTableConnection pmy = null;// ���ѯ����

    public int getMaxCount() {
	return maxCount;
    }

    public synchronized void setMaxCount(int maxCount) {
	this.maxCount = maxCount;
    }

    public String getTableName() {
	return tableName;
    }

    public Configuration getConf() {
	return conf;
    }

    public HTableConnectionPool(Configuration conf, String tableName) throws IOException {
	this(conf, tableName, 5, 100);
    }

    public HTableConnectionPool(Configuration conf, String tableName, int min) throws IOException {
	this(conf, tableName, min, 100);
    }

    public HTableConnectionPool(Configuration conf, String tableName, int min, int max) throws IOException {
	this.conf = conf;
	this.tableName = tableName;
	this.minCount = min;
	this.maxCount = max;
	this.pmy = getNewConnection();
    }

    synchronized public void setMinCount(int Value) {
	minCount = Value;
    }

    public int getMinCount() {
	return minCount;
    }

    public int getCurrentConnSize() {
	return htables.size();
    }

    /**
     * Ĭ�ϻ�ȡ�ɸ��µı�����
     * 
     * @return
     * @throws IOException
     */
    public HTableConnection getConnection() throws IOException {
	return getConnection(true);
    }

    public HTableConnection getConnection(boolean onlyQuery) throws IOException {
	if (onlyQuery)
	    return this.pmy;
	HTableConnection pConnection = null;
	synchronized (htables) {
	    for (int i = 0; i < htables.size(); i++) {
		HTableConnection aCon = htables.get(i);
		if (!aCon.isUsed()) {
		    pConnection = aCon;
		    pConnection.use();
		    break;
		}
	    }
	}
	if (pConnection != null)
	    return pConnection;
	if (htables.size() < this.getMaxCount()) {
	    return getNewConnection();
	} else {
	    try {
		htables.wait(100);
		return getConnection();
	    } catch (InterruptedException e) {
		e.printStackTrace();
	    }
	}
	return pConnection;
    }

    private HTableConnection getNewConnection() throws IOException {
	HTableConnection table = new HTableConnection(this, conf, this.tableName);
	synchronized (htables) {
	    htables.add(table);
	}
	return table;
    }

    public void destroy() {
	if (pmy != null) {
	    pmy.close();
	}
	pmy = null;
	for (HTableConnection con : htables) {
	    con.close();
	}
	htables.clear();
    }
}
