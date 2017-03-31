package com.ery.hadoop.hq.connection;

import java.io.IOException;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.client.HTable;

public class HTableConnection extends HTable {

    private boolean inUse = false;
    private HTableConnectionPool pool = null;

    public HTableConnection(HTableConnectionPool pool, Configuration conf, String tableName) throws IOException {
	super(conf, tableName);
	inUse = true;
	this.pool = pool;
    }

    public void close() {
	try {
	    flushCommits();
	} catch (IOException e) {
	    e.printStackTrace();
	}
	if (this.equals(this.pool.pmy))
	    return;
	int poolCount = 0;
	if (pool != null)
	    synchronized (pool.htables) {
		poolCount = pool.getCurrentConnSize();
	    }
	if (pool != null && poolCount <= pool.getMinCount()) {
	    this.inUse = false;
	} else {
	    try {
		closeConnection();
	    } catch (IOException e) {
		e.printStackTrace();
	    }
	}
    }

    public void closeConnection() throws IOException {
	inUse = false;
	if (pool != null)
	    synchronized (pool.htables) {
		pool.htables.remove(this);
		pool.htables.notifyAll();
	    }
	super.close();
    }

    public boolean isUsed() {
	return inUse;
    }

    public void use() {
	inUse = true;
    }

}
