package com.ery.hadoop.hq.table.action;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HColumnDescriptor;
import org.apache.hadoop.hbase.HTableDescriptor;
import org.apache.hadoop.hbase.KeyValue;
import org.apache.hadoop.hbase.client.Delete;
import org.apache.hadoop.hbase.client.HBaseAdmin;
import org.apache.hadoop.hbase.client.HTable;
import org.apache.hadoop.hbase.client.Put;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.ResultScanner;
import org.apache.hadoop.hbase.client.Scan;
import org.apache.hadoop.hbase.io.compress.Compression.Algorithm;
import org.apache.hadoop.hbase.regionserver.BloomType;
import org.apache.hadoop.hbase.util.Bytes;

import com.ery.hadoop.hq.ws.Constant;
import com.ery.base.support.utils.Convert;

public class HBaseTableDLLAction {

	/**
	 * 压缩类型(Compression.Algorithm中的类型对应)
	 */
	public static final int COMPRESSION_ALGORITHM_NONE = 0;
	public static final int COMPRESSION_ALGORITHM_LZO = 1;
	public static final int COMPRESSION_ALGORITHM_GZ = 2;
	public static final int COMPRESSION_ALGORITHM_SNAPPY = 3;

	public static void createTable(String tableName, int timeToLive, Configuration conf, Set<String> lstColumn)
			throws IOException {
		if (null == conf || lstColumn.size() <= 0) {
			return;
		}

		createTable(tableName, timeToLive, conf, lstColumn.toArray(new String[0]));
	}

	/**
	 * 创建表
	 * 
	 * @throws IOException
	 */
	public static void createTable(String tableName, int timeToLive, Configuration conf, String[] hcolumn)
			throws IOException {
		if (null == conf || hcolumn.length <= 0) {
			return;
		}

		HBaseAdmin admin = new HBaseAdmin(conf);
		if (admin.tableExists(tableName)) {
			System.out.println("table existed");
			return;
		}

		HTableDescriptor tableDesc = new HTableDescriptor(tableName);
		for (String column : hcolumn) {
			// 添加列族
			HColumnDescriptor column1 = new HColumnDescriptor(column);
			if (timeToLive > 0) {
				column1.setTimeToLive(timeToLive);
			}
			column1.setInMemory(true);
			column1.setMaxVersions(6);
			tableDesc.addFamily(column1);
		}

		// 创建表
		admin.createTable(tableDesc);

	}

	/**
	 * 创建表
	 * 
	 * @throws IOException
	 */
	public static void createTable(String tableName, int timeToLive, Configuration conf, String[] hcolumn,
			Map<String, Object> hbConf) throws IOException {
		if (null == conf || hcolumn.length <= 0) {
			return;
		}

		HBaseAdmin admin = new HBaseAdmin(conf);
		if (admin.tableExists(tableName)) {
			System.out.println("table existed");
			return;
		}

		HTableDescriptor tableDesc = new HTableDescriptor(tableName);
		tableDesc.setMaxFileSize(Convert.toLong(hbConf.get("HFILE_MAXVAL")));
		tableDesc.setMemStoreFlushSize(Convert.toLong(hbConf.get("MEMSTORE_FLUSH")));
		tableDesc.setDeferredLogFlush(false);
		for (String column : hcolumn) {
			// 添加列族
			HColumnDescriptor column1 = new HColumnDescriptor(column);
			column1.setBlocksize(Convert.toInt(hbConf.get("BLOCK_SIZE")));
			column1.setCompactionCompressionType(getHBaseCompressionType(Convert.toInt(hbConf.get("COL_ZIP_TYPE"))));
			column1.setCompressionType(getHBaseCompressionType(Convert.toInt(hbConf.get("COL_ZIP_TYPE"))));

			column1.setMaxVersions(Convert.toInt(hbConf.get("COL_MAX_VERSION"), 3));
			column1.setBloomFilterType(getHBaseBloomType(Convert.toString(hbConf.get("BLOOM_TYPE"))));
			column1.setInMemory(Convert.toInt(hbConf.get("NEWDATA_FLUSFLAG"), 0) == 1);

			// 设置数据时间或者版本数小于0时 默认不设置最小保留版本数
			if (timeToLive > 0) {
				column1.setTimeToLive(timeToLive);
			} else if (Convert.toInt(hbConf.get("COL_MIN_VERSION"), 1) > 0) {
				column1.setMinVersions(Convert.toInt(hbConf.get("COL_MIN_VERSION"), 1));
			}

			tableDesc.addFamily(column1);
		}

		// 创建表
		admin.createTable(tableDesc);
	}

	/**
	 * 获取压缩或合并压缩的类型
	 * 
	 * @param type
	 *            压缩标识符
	 * @return 压缩类型 Algorithm
	 */
	private static Algorithm getHBaseCompressionType(int type) {
		switch (type) {
		case COMPRESSION_ALGORITHM_NONE:
			return Algorithm.NONE;
		case COMPRESSION_ALGORITHM_LZO:
			return Algorithm.LZO;
		case COMPRESSION_ALGORITHM_GZ:
			return Algorithm.GZ;
		case COMPRESSION_ALGORITHM_SNAPPY:
			return Algorithm.SNAPPY;
		default:
			return Algorithm.NONE;
		}
	}

	/**
	 * 获取BloomType
	 * 
	 * @param type
	 */
	private static BloomType getHBaseBloomType(String type) {
		if ("ROW".equals(type)) {
			return BloomType.ROW;
		} else if ("ROWCOL".equals(type)) {
			return BloomType.ROWCOL;
		} else {
			return BloomType.NONE;
		}
	}

	public static void modifyTable(String tableName, int timeToLive, Configuration conf, Set<String> lstColumn)
			throws IOException {
		if (null == conf) {
			throw new IOException("conf is null!");
		}

		if (null == lstColumn || lstColumn.size() <= 0) {
			throw new IOException("Do not delete all column!");
		}

		modifyTable(tableName, timeToLive, conf, lstColumn.toArray(new String[0]));
	}

	/**
	 * 查询资源下的表的列簇信息
	 * 
	 * @throws IOException
	 */
	public static List<String> queryTableCluster(String tableName, Configuration conf) throws IOException {
		List<String> lstClusterName = new ArrayList<String>();
		if (null == conf || null == tableName || tableName.length() <= 0) {
			return lstClusterName;
		}

		HBaseAdmin admin = new HBaseAdmin(conf);
		HTableDescriptor tabDes = admin.getTableDescriptor(tableName.getBytes());
		Collection<HColumnDescriptor> lstHColunmn = tabDes.getFamilies();
		for (HColumnDescriptor hcd : lstHColunmn) {
			lstClusterName.add(hcd.getNameAsString());
		}
		return lstClusterName;
	}

	/**
	 * 查询资源下的所有表名称
	 * 
	 * @throws IOException
	 */
	public static List<String> queryTable(Configuration conf) throws IOException {
		List<String> lstTableName = new ArrayList<String>();
		if (null == conf) {
			return lstTableName;
		}

		HBaseAdmin admin = new HBaseAdmin(conf);
		HTableDescriptor[] tb = admin.listTables();

		for (HTableDescriptor htd : tb) {
			lstTableName.add(htd.getNameAsString());
		}
		return lstTableName;
	}

	/**
	 * 修改表的列簇（添加或删除）
	 * 
	 * @throws IOException
	 */
	public static void modifyTable(String tableName, int timeToLive, Configuration conf, String[] hcolumn)
			throws IOException {
		HBaseAdmin admin = new HBaseAdmin(conf);
		if (!admin.tableExists(tableName)) {
			throw new IOException("table is not Exists!");
		}

		if (admin.isTableDisabled(tableName)) {
			admin.enableTable(tableName);
		}
		admin.disableTable(tableName);
		HTableDescriptor htableDes = admin.getTableDescriptor(tableName.getBytes());
		HColumnDescriptor hcolumnDes[] = htableDes.getColumnFamilies();

		boolean ttlflag = false;
		if (timeToLive > 0 && hcolumnDes.length > 0 && hcolumnDes[0].getTimeToLive() != timeToLive) {
			ttlflag = true;
		}

		// 删除列簇的列表
		List<HColumnDescriptor> lstDelColumn = new ArrayList<HColumnDescriptor>();
		boolean flag = false;

		for (HColumnDescriptor befColumn : hcolumnDes) {
			flag = false;
			for (String newColumn : hcolumn) {
				if (befColumn.getNameAsString().equals(newColumn)) {
					flag = true;
					break;
				}
			}
			if (!flag) {
				lstDelColumn.add(befColumn);
			} else if (ttlflag) {
				befColumn.setTimeToLive(timeToLive);
				admin.modifyColumn(tableName, befColumn);
			}
		}

		// 添加列簇的列表
		List<String> lstAddColumn = new ArrayList<String>();
		flag = false;
		for (String newColumn : hcolumn) {
			flag = false;
			for (HColumnDescriptor befColumn : hcolumnDes) {
				if (befColumn.getNameAsString().equals(newColumn)) {
					flag = true;
					break;
				}
			}

			if (!flag) {
				lstAddColumn.add(newColumn);
			}
		}

		// HTableDescriptor tableDesc = new HTableDescriptor(tableName);
		// 添加列族
		for (String column : lstAddColumn) {
			HColumnDescriptor column1 = new HColumnDescriptor(column);
			column1.setInMemory(true);
			column1.setMaxVersions(6);
			if (timeToLive > 0) {
				column1.setTimeToLive(timeToLive);
			}
			// tableDesc.addFamily(column1);
			admin.addColumn(tableName, column1);
		}

		// 删除列簇
		for (HColumnDescriptor column : lstDelColumn) {
			admin.deleteColumn(tableName, column.getNameAsString());
		}
		admin.enableTable(tableName);
	}

	/**
	 * 修改表的列簇（添加或删除）
	 * 
	 * @throws IOException
	 */
	public static void modifyTable(String tableName, int timeToLive, Configuration conf, String[] hcolumn,
			Map<String, Object> hbConf) throws IOException {
		HBaseAdmin admin = new HBaseAdmin(conf);
		if (!admin.tableExists(tableName)) {
			throw new IOException("table is not Exists!");
		}

		if (admin.isTableDisabled(tableName)) {
			admin.enableTable(tableName);
		}
		admin.disableTable(tableName);
		HTableDescriptor htableDes = admin.getTableDescriptor(tableName.getBytes());
		htableDes.setMaxFileSize(Convert.toLong(hbConf.get("HFILE_MAXVAL")));
		htableDes.setMemStoreFlushSize(Convert.toLong(hbConf.get("MEMSTORE_FLUSH")));
		htableDes.setDeferredLogFlush(false);
		admin.modifyTable(tableName.getBytes(), htableDes);

		HColumnDescriptor hcolumnDes[] = htableDes.getColumnFamilies();

		// 删除列簇的列表
		List<HColumnDescriptor> lstDelColumn = new ArrayList<HColumnDescriptor>();
		boolean flag = false;
		for (HColumnDescriptor befColumn : hcolumnDes) {
			flag = false;
			for (String newColumn : hcolumn) {
				if (befColumn.getNameAsString().equals(newColumn)) {
					flag = true;
					break;
				}
			}

			if (!flag) {
				lstDelColumn.add(befColumn);
			}
		}

		// 添加列簇的列表
		List<String> lstAddColumn = new ArrayList<String>();
		flag = false;
		for (String newColumn : hcolumn) {
			flag = false;
			for (HColumnDescriptor befColumn : hcolumnDes) {
				if (befColumn.getNameAsString().equals(newColumn)) {
					flag = true;
					befColumn.setBlocksize(Convert.toInt(hbConf.get("BLOCK_SIZE")));
					befColumn.setCompactionCompressionType(getHBaseCompressionType(Convert.toInt(hbConf
							.get("COL_ZIP_TYPE"))));
					befColumn.setCompressionType(getHBaseCompressionType(Convert.toInt(hbConf.get("COL_ZIP_TYPE"))));
					befColumn.setMaxVersions(Convert.toInt(hbConf.get("COL_MAX_VERSION"), 3));
					befColumn.setBloomFilterType(getHBaseBloomType(Convert.toString(hbConf.get("BLOOM_TYPE"))));
					befColumn.setInMemory(Convert.toInt(hbConf.get("NEWDATA_FLUSFLAG"), 0) == 1);
					if (timeToLive > 0) {
						befColumn.setTimeToLive(timeToLive);
						befColumn.setMinVersions(0);
					} else if (Convert.toInt(hbConf.get("COL_MIN_VERSION"), 1) > 0) {
						befColumn.setMinVersions(Convert.toInt(hbConf.get("COL_MIN_VERSION"), 1));
					}
					admin.modifyColumn(tableName, befColumn); // 原来就存在的列，修改
					break;
				}
			}

			if (!flag) {
				lstAddColumn.add(newColumn);
			}
		}

		// HTableDescriptor tableDesc = new HTableDescriptor(tableName);
		// 添加列族
		for (String column : lstAddColumn) {
			HColumnDescriptor column1 = new HColumnDescriptor(column);
			column1.setBlocksize(Convert.toInt(hbConf.get("BLOCK_SIZE")));
			column1.setCompactionCompressionType(getHBaseCompressionType(Convert.toInt(hbConf.get("COL_ZIP_TYPE"))));
			column1.setCompressionType(getHBaseCompressionType(Convert.toInt(hbConf.get("COL_ZIP_TYPE"))));
			column1.setMaxVersions(Convert.toInt(hbConf.get("COL_MAX_VERSION"), 3));
			column1.setBloomFilterType(getHBaseBloomType(Convert.toString(hbConf.get("BLOOM_TYPE"))));
			column1.setInMemory(Convert.toInt(hbConf.get("NEWDATA_FLUSFLAG"), 0) == 1);
			if (timeToLive > 0) {
				column1.setTimeToLive(timeToLive);
			} else if (Convert.toInt(hbConf.get("COL_MIN_VERSION"), 1) > 0) {
				column1.setMinVersions(Convert.toInt(hbConf.get("COL_MIN_VERSION"), 1));
			}
			admin.addColumn(tableName, column1);
		}

		// 删除列簇
		for (HColumnDescriptor column : lstDelColumn) {
			admin.deleteColumn(tableName, column.getNameAsString());
		}

		admin.enableTable(tableName);
	}

	public static void deleteTable(String tableName, Configuration conf) throws IOException {
		if (null == conf) {
			return;
		}

		HBaseAdmin admin = new HBaseAdmin(conf);
		if (!admin.tableExists(tableName)) {
			System.out.println("table existed");
			return;
		}

		if (!admin.isTableDisabled(tableName)) {
			admin.disableTable(tableName);
		}

		admin.deleteTable(tableName);
	}

	public static void putsData(String tablename, List<Put> lstPut, Configuration conf) throws IOException,
			InterruptedException {
		HTable table = new HTable(conf, tablename);
		table.put(lstPut);
	}

	public static void addPut(List<Put> lstPut, String rowkey, String family, String qualifier, String value) {
		Put put = new Put(Bytes.toBytes(rowkey));
		put.add(Bytes.toBytes(family), Bytes.toBytes(qualifier), Bytes.toBytes(value));
		lstPut.add(put);
	}

	public static void putsData(String tablename, Map<String, Object> fieldMap, List<Map<String, Object>> lst,
			Configuration conf) throws IOException, InterruptedException {
		HTable table = new HTable(conf, tablename);
		List<Put> lstPut = new ArrayList<Put>();
		for (Map<String, Object> map : lst) {
			String rowkey = (String) map.get(Constant.ROWKEY_NAME);
			for (String colmun : map.keySet()) {
				String name[] = (String[]) fieldMap.get(colmun);
				if (name == null || name.length != 2) {
					continue;
				}
				Put put = new Put(Bytes.toBytes(rowkey));
				put.add(Bytes.toBytes(name[0]), Bytes.toBytes(name[1]),
						Bytes.toBytes(map.get(colmun) == null ? "" : map.get(colmun).toString()));
				lstPut.add(put);
			}
		}
		table.put(lstPut);
		table.flushCommits();
	}

	/**
	 * 删除表数据
	 * 
	 * @param tablename
	 * @param lst
	 * @param conf
	 * @throws IOException
	 * @throws InterruptedException
	 */
	public static void deleteData(String tablename, List<String> lst, Configuration conf) throws IOException,
			InterruptedException {
		HTable table = new HTable(conf, tablename);
		List<Delete> lstDel = new ArrayList<Delete>();
		for (String rowkey : lst) {
			if (rowkey == null) {
				continue;
			}
			Delete del = new Delete(Bytes.toBytes(rowkey));
			lstDel.add(del);
		}
		table.delete(lstDel);
		table.flushCommits();
	}

	public static void queryData(List<List<String>> lst, String tablename, String[] columns, String[] enFiled,
			String[] chFiled, String startRowkey, String endRowkey, int count, Configuration conf) throws IOException {
		if (null == conf) {
			return;
		}

		HTable table = null;
		try {
			table = new HTable(conf, tablename);
		} catch (Exception e) {
			e.printStackTrace();
			return;
		}

		Scan s = new Scan();
		if (null != startRowkey) {
			s.setStartRow(Bytes.toBytes(startRowkey));
		}

		if (null != endRowkey) {
			s.setStopRow(Bytes.toBytes(endRowkey));
		}

		ResultScanner rs = table.getScanner(s);
		int index = 0;
		for (Result r : rs) {
			if (index >= count) {
				break;
			}
			index++;
			List<String> tempList = new ArrayList<String>();
			Map<String, String> values = new HashMap<String, String>();
			for (KeyValue kv : r.raw()) {
				String col = new String(kv.getFamily()) + ":" + (new String(kv.getQualifier()));
				values.put(col, new String(kv.getValue(), "utf-8"));
			}

			for (int i = 0; i < columns.length; i++) {
				tempList.add(values.get(columns[i]));
			}

			tempList.add(new String(r.getRow()));
			lst.add(tempList);
		}
	}

	public static List<Map<String, String>> queryData(String tablename, String startRowkey, int count,
			Configuration conf, Map<String, String[][]> mapClusColumn) throws IOException {
		List<Map<String, String>> datalist = new ArrayList<Map<String, String>>();
		if (null == conf) {
			return datalist;
		}

		HTable table = null;
		try {
			table = new HTable(conf, tablename);
		} catch (Exception e) {
			e.printStackTrace();
			return datalist;
		}

		Scan s = new Scan();

		if (null != startRowkey) {
			s.setStartRow(Bytes.toBytes(startRowkey));
		}

		ResultScanner rs = table.getScanner(s);
		int index = 0;
		count++;
		for (Result r : rs) {
			if (index >= count) {
				break;
			}

			index++;
			if (null != startRowkey && index == 1) {
				continue;
			}

			Map<String, String> map = new HashMap<String, String>();
			map.put("rowkey", new String(r.getRow(), "UTF-8"));
			for (KeyValue kv : r.raw()) {
				String[][] column = mapClusColumn.get(new String(kv.getFamily()) + "_" +
						(new String(kv.getQualifier())));
				if (column == null) {
					continue;
				}
				if (column[1].length == 1) {
					map.put(new String(column[1][0]), new String(kv.getValue(), "UTF-8"));
				} else {
					for (int i = 0; i < column[1].length; i++) {
						String ss[] = new String(kv.getValue(), "UTF-8").split(column[0][0]);
						for (int j = 0; j < column[1].length; j++) {
							map.put(new String(column[1][j]), (j + 1) > ss.length ? "" : ss[j]);
						}
					}
				}

				// System.out.println("column fammily："
				// + new String(kv.getFamily()) + " Qualifier:"
				// + new String(kv.getQualifier()) + " value:"
				// + new String(kv.getValue()));

			}
			datalist.add(map);
		}
		return datalist;
	}

	public static void deleteData(String tableName, String[] rows, Configuration configuration) throws IOException {
		HTable table = new HTable(configuration, tableName);
		List<Delete> list = new ArrayList<Delete>();
		for (int i = 0; i < rows.length; i++) {
			Delete del = new Delete(Bytes.toBytes(rows[i]));
			list.add(del);
		}
		table.delete(list);
	}
}
