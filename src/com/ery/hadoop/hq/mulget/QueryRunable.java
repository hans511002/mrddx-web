package com.ery.hadoop.hq.mulget;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.hadoop.hbase.KeyValue;
import org.apache.hadoop.hbase.client.Get;
import org.apache.hadoop.hbase.client.Result;

import com.ery.hadoop.hq.connection.HTableConnection;
import com.ery.hadoop.hq.datasource.Constant;
import com.ery.hadoop.hq.datasource.HTableConnPO;
import com.ery.hadoop.hq.datasource.HTableDataSource;
import com.ery.hadoop.hq.datasource.HTableScanner;
import com.ery.hadoop.hq.mulget.QueryStatus.QuerySubStatus;
import com.ery.hadoop.hq.qureyrule.QueryRuleColumnPO;
import com.ery.base.support.log4j.LogUtils;

public class QueryRunable implements Runnable {
	public static final Log LOG = LogFactory.getLog(QueryRunable.class.getName());
	public static ThreadPoolExecutor queryPool;
	final HTableConnPO tableConPo;
	QueryStatus queryStatus;
	QuerySubStatus querySubStatus;
	HTableScanner scanner = null;
	HTableConnection table = null;
	Object lock;
	public boolean started = false;
	public Thread thread;

	private void initScanner(long queryRuleId, String startKey, String endKey, Map<String, String> macroVariableMap)
			throws Exception {
		String qryRuleId = queryRuleId + "";
		if (scanner == null) {
			scanner = HTableScanner.getHtableScanner(qryRuleId, startKey, endKey, macroVariableMap);
		}
	}

	public QueryRunable(HTableConnPO htableConPo, QueryStatus queryStatus, QuerySubStatus querySubStatus, Object lock) {
		if (queryPool == null) {
			queryPool = new ThreadPoolExecutor(10, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS,
					new SynchronousQueue<Runnable>());
		}
		this.tableConPo = htableConPo;
		this.queryStatus = queryStatus;
		this.querySubStatus = querySubStatus;
		this.lock = lock;
	}

	@Override
	public void run() {
		thread = Thread.currentThread();
		while (true)
			synchronized (lock) {
				started = true;
				long now = System.currentTimeMillis();
				try {
					if (querySubStatus == null)
						return;
					if (querySubStatus.isGet) {// get
						getOneRow();
					} else {// scan
						queryAllData();
					}
				} catch (Throwable e) {
					queryStatus.isError = true;
					if (querySubStatus.msg == null || querySubStatus.msg.equals("")) {
						querySubStatus.msg = e.getMessage();
					}
					break;
				} finally {
					LogUtils.info("子线程执行查询用时：" + (System.currentTimeMillis() - now) + "ms ");
					synchronized (queryStatus) {
						if (queryStatus.isError)
							break;
						if (querySubStatus.msg != null && querySubStatus.msg.equals("")) {
							queryStatus.isError = true;
							break;
						} else if (queryStatus.isStartAll()) {
							break;
						} else {
							this.querySubStatus = queryStatus.getNext();
							if (queryStatus.isError) {
								return;
							}
							if (this.querySubStatus == null) {
								break;
							}
						}
					}
				}
			}
		synchronized (queryStatus) {
			queryStatus.parallelCount--;
		}
	}

	// 查询一行
	void getOneRow() {
		List<QuerySubStatus> querySubLists = new ArrayList<QuerySubStatus>();
		List<Get> glist = new ArrayList<Get>();
		long l = System.nanoTime();
		try {
			if (table == null) {
				this.table = HTableDataSource.getConnection(this.tableConPo.getLinkKey(), true);
			}
			QuerySubStatus tmpQuerySubStatus = this.querySubStatus;
			synchronized (queryStatus) {
				while (tmpQuerySubStatus != null && !queryStatus.isError) {
					if (!tmpQuerySubStatus.isGet) {
						tmpQuerySubStatus = queryStatus.getGetNext();
						continue;
					}
					querySubLists.add(tmpQuerySubStatus);
					queryStatus.startFlag(tmpQuerySubStatus);
					Get get = initGet(queryStatus.queryRuleId, tmpQuerySubStatus.skey, queryStatus.macroVariableMap);
					glist.add(get);
					tmpQuerySubStatus = queryStatus.getGetNext();
					if (queryStatus.isError)
						return;
					if (queryStatus.threadNum > 1 && glist.size() > queryStatus.rowkey.length / queryStatus.threadNum) {
						break;
					}
				}
			}
			if (glist.size() > 0) {
				Result[] rs = table.get(glist);
				for (int i = 0; i < rs.length; i++) {
					Result r = rs[i];
					if (queryStatus.isError) {
						return;
					}
					// 解析记录，存储到querySubStatus
					querySubLists.get(i).result = null;
					if (r == null)
						continue;
					querySubLists.get(i).result = getRow(r);
				}
				l = (System.nanoTime() - 1) / 1000000;
				for (QuerySubStatus qss : querySubLists) {
					qss.qryTime = l;
				}
			}
		} catch (Exception e) {
			querySubStatus.msg = e.getMessage();
			LogUtils.error("queryAllData【" + querySubStatus.skey + "," + querySubStatus.ekey + "】 error", e);
		} finally {
			synchronized (queryStatus) {
				queryStatus.endCount += querySubLists.size();
			}
		}
	}

	public String[] getRow(Result r) throws IOException {
		Map<String, byte[]> res = new HashMap<String, byte[]>();
		if (r == null)
			return null;
		for (KeyValue kv : r.raw()) {
			String fc = new String(kv.getFamily()) + ":" + new String(kv.getQualifier());
			byte[] v = kv.getValue();
			res.put(fc, v);
		}
		res.put(Constant.HBASE_ROWKEY_COLUMN_CFNAME, r.getRow());
		long l = System.nanoTime();
		String[] row = convertToArray(res);
		return row;
	}

	private String[] convertToArray(Map<String, byte[]> row) throws UnsupportedEncodingException {
		String[] resRow = new String[tableConPo.getColExpandENNames().length + 1];
		// 初始化为空串
		for (int i = 0; i < resRow.length; i++) {
			if (null == resRow[i]) {
				resRow[i] = "";
			}
		}
		int colIndex = 0;
		for (int i = 0; i < tableConPo.getColENNames().length; i++) {
			String cfName = tableConPo.getColCFNames()[i];
			byte[] val = row.get(cfName);
			if (val != null && val.length > 0)
				resRow[colIndex] = new String(val, "UTF-8");
			else
				resRow[colIndex] = "";
			// 获取字段所在的列簇:列
			QueryRuleColumnPO qc = this.tableConPo.colCFNameMap.get(cfName);
			if (qc == null) {
				continue;// 不包括在默认列簇中，数据无法处理，是不允许发生的，这里做了容错处理
			}
			String defineAllColEn[] = qc.getDefineAllColumnEnName();
			if (defineAllColEn.length > 1) {
				String[] tmp = resRow[colIndex].split(this.tableConPo.getQrCols()[i].splitStr);
				if (tmp.length <= this.tableConPo.getColCnNames()[i].length) {
					for (String v : tmp) {
						resRow[colIndex] = v;
						colIndex++;
					}
					colIndex += this.tableConPo.getColCnNames()[i].length - tmp.length;
				} else if (tmp.length > this.tableConPo.getColCnNames()[i].length) {
					int pos[] = this.tableConPo.getColSelectEnNamesIndex()[i]; // 返回列的索引位置
					for (int c = 0; c < pos.length; c++) {
						resRow[colIndex] = tmp[pos[c]];
						colIndex++;
					}
				}
			} else {
				colIndex++;
			}
		}
		resRow[resRow.length - 1] = new String(row.get(Constant.HBASE_ROWKEY_COLUMN_CFNAME), "UTF-8");
		return resRow;
	}

	// 从查询规则组装get
	private Get initGet(long queryRuleId, String skey, Map<String, String> macroVariableMap) {
		Get get = new Get(skey.getBytes());
		for (QueryRuleColumnPO colPo : tableConPo.getQrCols()) {
			get.addColumn(colPo.getColumnFamily().getBytes(), colPo.getColumnQualifier().getBytes());
		}
		return get;
	}

	void queryAllData() {
		try {
			initScanner(queryStatus.queryRuleId, querySubStatus.skey, querySubStatus.ekey, queryStatus.macroVariableMap);
			if (queryStatus.isError) {
				return;
			}
			synchronized (scanner) {
				querySubStatus.result = scanner.getAllData(queryStatus.queryRuleId, queryStatus.macroVariableMap, null,
						null, queryStatus.subMaxRowCount);
			}
		} catch (Exception e) {
			querySubStatus.msg = e.getMessage();
			LogUtils.error("queryAllData【" + querySubStatus.skey + "," + querySubStatus.ekey + "】 error", e);
		} finally {
			querySubStatus.qryTime = scanner.totalTime;
			synchronized (queryStatus) {
				queryStatus.endCount++;
			}
		}
	}

}
