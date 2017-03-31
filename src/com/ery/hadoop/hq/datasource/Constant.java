package com.ery.hadoop.hq.datasource;

public class Constant {

    public static int DATA_SOURCE_ID = 0;
    public static int DEFAULT_MIN_COUNT = 5;
    public static int CLIENT_SCANNER_CACHING = 10;
    public static int CLIENT_ROWS_BUFFER_SIZE = 1000;
    public static int SCANNER_READ_CACHE_SIZE = 500;
    public static String PARENT_ZNODE_NAME = "/hbase";
    public static String ROOT_ZNODE_NAME = "root-region-server";

    public static int HTABLE_SCANNER_CACHE_LEAST_TIME = 60000;// 60秒
    // scann至少缓存的时间
    public static int SERVER_RECORD_BUFFER_MAX_SIZE = 60000;//

    public static String HBASE_ROWKEY_COLUMN_CFNAME = "ROWID";
    public static String HBASE_ROWKEY_COLUMN_CNNAME = "ROWID";

}
