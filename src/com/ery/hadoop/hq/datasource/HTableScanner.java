package com.ery.hadoop.hq.datasource;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.hadoop.hbase.KeyValue;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.ResultScanner;
import org.apache.hadoop.hbase.client.Scan;
import org.apache.hadoop.hbase.util.Bytes;

import com.googlecode.aviator.AviatorEvaluator;
import com.ery.hadoop.hq.connection.HTableConnection;
import com.ery.hadoop.hq.qureyrule.QueryRuleColumnPO;
import com.ery.hadoop.hq.qureyrule.QueryRuleConditionPO;
import com.ery.hadoop.hq.qureyrule.QueryRulePO;
import com.ery.hadoop.hq.table.HBaseTableDAO;
import com.ery.hadoop.hq.table.HBaseTablePO;
import com.ery.hadoop.hq.utils.MacroVariable;
import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.utils.Convert;

public class HTableScanner implements ResultScanner {

	/**
	 * 查询游标缓存数据，Key:Hbase查询规则ID，Value:Hashtable<key:tablename,
	 * Value:Hashtable<key:rowKey, value:HTableScanPO>>
	 */
	public static Hashtable<String, Hashtable<String, Hashtable<String, HTableScanner>>> qryRuleScanCache = new Hashtable<String, Hashtable<String, Hashtable<String, HTableScanner>>>();
	public static final int COMPARE_MIN_TYPE = 0; // 用于比较最小数字标识符
	public static final int COMPARE_MAX_TYPE = 1; // 用于比较最大数字标识符
	public static final int COMPARE_AVG_TYPE = 2; // 用于比较平均的数字标识符
	public static final int COMPARE_SUM_TYPE = 3; // 用于比较求和的数字标识符

	public static final double INIT_DOUBLE = 0.00000000000001;
	public static final String REX_COMPILE = "(-)?\\d*";
	public static final String REX_COMPILE_RS = "(-)?\\d*\\.0*";

	public static final int DOUBLE_POINT = 2;// 取平均数时保留小数点后到几位

	public static final int INIT_GROUP_COL = 0;// 取分组字段的位置
	public static final int INIT_GROUP_COL_FUN = 1;// 取分组字段方法的位置

	ResultScanner scaner = null;
	Scan scan = null;
	String startKey;
	String endKey;
	/**
	 * 最近访问时间 ，用于LRU筛选
	 */
	Date date = new Date();
	long createDate = -1;
	public static long SCANNER_CACHE_MAX_TIME = 600000;
	HTableConnPO tableConPo = null;
	HTableConnection table = null;

	// java.util.Arrays.sort(a, c);
	Vector<PageInfo> pages = null;

	boolean enableSort = false;// 是否支持排序
	int pageSize = 0;// 分页大小
	/**
	 * 缓存记录 key:cf:qu value:val
	 */
	String[][] buffData;
	int totalRowCount;// 总读取记录数
	int currentPage;
	int allowBuffSize = 0;
	String orderByCol = Constant.HBASE_ROWKEY_COLUMN_CFNAME;
	int orderType = 1;
	int orderDesc = 0;// 排序方向
	int paramsKey = 0;

	// tableConPo 对象引用
	// String[][] colEnNames = null;
	// String[][] colCnNames = null;
	// String[] colExpandEnNames = null;
	// String[] colExpandCnNames = null;
	Map<String, Object[]> mapGcol = new HashMap<String, Object[]>();

	public boolean isFirstQy = false;
	public int totalTime = 0;
	public int filterTime = 0;
	public int pageTime = 0;
	long _totalTime = 0;
	long _filterTime = 0;
	long _pageTime = 0;
	int convertMapToArray = 0;

	public Object[][] grows = null;
	public int[] gcol = null; // 分组字段的位置，如：1,2,3,表示分组字段位于位置1,2,3
	public int[] gstatistic = null;// 分组之后统计字段（MAX,MIN,AVG,COUNT,SUM）的位置,
	// 如：1,2,3,4,5,表示对第一个字段取最大，第二个字段取最小，第三个字段取平均值，第四个取数目，第五个取和
	public int[] gstatisticFun = null;// 分组之后统计字段的方法（1:max;2:min;3:avg;4:count,5:sum）

	public boolean isCache = false;// 是否在缓存中分组
	public boolean isError = false;// 是否分组错误
	public boolean isGroupBy = true;// 是否进行分组

	// 统计方法对象
	Map<Integer, FiledMethod> mapFiledMethod = new HashMap<Integer, FiledMethod>();

	static {
		AviatorEvaluator.setOptimize(AviatorEvaluator.EVAL);
		SCANNER_CACHE_MAX_TIME = SystemVariable.getInt("hq.scanner.cache.max.time", 600000);// 默认缓存十分钟
	}

	/**
	 * 不能缓存情况下的数据分页，不支持排序
	 * 

	 * 
	 */
	public class PageInfo {
		byte[] startkey;
		byte[] endkey;
		int pageNum;// 页位置数，从1开始

		public PageInfo() {
			this.pageNum = 0;
			startkey = null;
			endkey = null;
		}
	}

	/**
	 * 统计对象
	 */
	public class FiledMethod {
		public static final int STATAIC_BEFOR_FLAG = 0;// 过滤之前统计
		public static final int STATAIC_AFTER_FLAG = 1;// 过滤之后统计
		String filedName;
		int type;
		Object value;
		String responseFiledName;
		long count;

		public FiledMethod(String filedName, int type, int stataicFlag) {
			this.filedName = filedName;
			this.type = type;
			if (1 == type) {
				responseFiledName = this.filedName + "_" + QueryRuleColumnPO.METHOD_SUM;
			} else if (2 == type) {
				responseFiledName = this.filedName + "_" + QueryRuleColumnPO.METHOD_AVG;
			} else if (3 == type) {
				responseFiledName = this.filedName + "_" + QueryRuleColumnPO.METHOD_MAX;
			} else if (4 == type) {
				responseFiledName = this.filedName + "_" + QueryRuleColumnPO.METHOD_MIN;
				// }else if (5 == type){
				// responseFiledName =
				// this.filedName+"_"+QueryRuleColumnPO.METHOD_COUNT;
			}

			switch (stataicFlag) {
			case 0:
				responseFiledName += "_BF";
				break;
			case 1:
				responseFiledName += "_AF";
				break;
			}
		}

		public void setValue(Object value) {
			this.value = value;
		}

		public Object getValue() {
			return value;
		}

		public Object getResponseValue() {
			if (2 == type) {
				double b = StringUtil.stringToDouble(value);
				if (b == 0.0) {
					return 0.0;
				}

				return StringUtil.doubleToString(b / count, StringUtil.DOUBLE_FORMAT_pattern3);
			}

			return value;
		}

		public String getResponseFiledName() {
			return responseFiledName;
		}
	}

	public HTableScanner(HTableConnPO tableConPo) {
		this.tableConPo = tableConPo;
		this.createDate = System.currentTimeMillis();
	}

	public long getCreateDate() {
		return createDate;
	}

	public int getPageSize() {
		return pageSize;
	}

	private void initParams() throws IOException {
		orderByCol = Constant.HBASE_ROWKEY_COLUMN_CFNAME;
		pages = null;
		if (scaner != null)
			scaner.close();
		scaner = null;
		orderType = 1;
		orderDesc = 0;// 排序方向
		pageSize = tableConPo.paginationSize;
		enableSort = tableConPo.supportSort > 0;
		allowBuffSize = this.tableConPo.clientRowsBufferSize;
		date = new Date();
	}

	private void initScaner(byte[] startKey, byte[] endKey) throws IOException {
		scan.setStartRow(startKey);
		if (tableConPo.rowKeyQryType == 0) {
			scan.setStopRow(startKey);
		} else {
			scan.setStopRow(endKey);
		}
		scaner = table.getScanner(scan);
		// Result r = null;
		// while((r = next())!= null){
		// System.out.println("获得rowkey:" + new String(r.getRow()));
		// KeyValue keyValue[] = r.raw();
		// for (KeyValue kv : keyValue) {
		// System.out.println("column fammily：" + new String(kv.getFamily()) +
		// " column:" + new String(kv.getQualifier()) + " value:"
		// + new String(kv.getValue()) + " timestamp:" + kv.getTimestamp());
		// }
		// }
		// for (Result r : scaner) {
		// System.out.println("获得rowkey:" + new String(r.getRow()));
		// KeyValue keyValue[] = r.raw();
		// for (KeyValue kv : keyValue) {
		// System.out.println("column fammily：" + new String(kv.getFamily()) +
		// " column:" + new String(kv.getQualifier()) + " value:"
		// + new String(kv.getValue()) + " timestamp:" + kv.getTimestamp());
		// }
		// }
	}

	public void initScan(String startKey, String endKey) throws IOException {
		if (tableConPo == null)
			throw new IOException("Hbase查询Table对象和连接未初始化，不能进行查询初始化");
		initParams();
		this.startKey = startKey;
		this.endKey = endKey;
		String qryId = tableConPo.qryRuleId;
		// modify by 2014-03-26 begin
		String tableName = tableConPo.hbaseTable.getHbTableName();
		Hashtable<String, Hashtable<String, HTableScanner>> tableBuffs = null;
		this.table = HTableDataSource.getConnection(this.tableConPo.getLinkKey(), true);
		Hashtable<String, HTableScanner> scanBuffs = null;
		synchronized (qryRuleScanCache) {
			if (qryRuleScanCache.containsKey(qryId)) {
				tableBuffs = qryRuleScanCache.get(qryId);
			} else {
				tableBuffs = new Hashtable<String, Hashtable<String, HTableScanner>>();
				qryRuleScanCache.put(qryId, tableBuffs);
			}

			scanBuffs = tableBuffs.get(tableName);
			if (null == scanBuffs) {
				scanBuffs = new Hashtable<String, HTableScanner>();
				tableBuffs.put(tableName, scanBuffs);
			}
		}
		// modify by 2014-03-26 end
		synchronized (scanBuffs) {
			if (scanBuffs.size() >= tableConPo.scannerCachingSize) {
				HTableScanner lruLast = getLastScanner(scanBuffs);
				if (lruLast != null) {
					if (new Date().getTime() - lruLast.date.getTime() > Constant.HTABLE_SCANNER_CACHE_LEAST_TIME) {
						scanBuffs.remove(lruLast.getKey());
						lruLast.close();
					}
				}
			}

			HTableScanner oscan = scanBuffs.put(this.getKey(), this);
			if (oscan != null && !oscan.equals(this)) {
				oscan.close();
			}
		}
		totalRowCount = 0;
		scan = new Scan();
		// 从查询规则组装scan
		for (QueryRuleColumnPO colPo : tableConPo.qrCols) {
			scan.addColumn(colPo.getColumnFamily().getBytes(), colPo.getColumnQualifier().getBytes());
		}
	}

	public static HTableScanner getLastScanner(Hashtable<String, HTableScanner> scanBuffs) {
		HTableScanner lruLast = null;
		Set<String> keys = scanBuffs.keySet();
		for (String key : keys) {
			HTableScanner tmp = scanBuffs.get(key);
			if (lruLast == null)
				lruLast = tmp;
			else {
				if (tmp.date.before(lruLast.date))
					lruLast = tmp;
			}
		}
		return lruLast;
	}

	public String getKey() {
		return startKey + ":" + endKey;
	}

	public static String getKey(String startKey, String endKey) {
		return startKey + ":" + endKey;
	}

	public static int genParamsKey(Map<String, String> macroVariableMap) {
		if (macroVariableMap == null || macroVariableMap.size() == 0)
			return 0;
		StringBuffer bf = new StringBuffer();
		for (String key : macroVariableMap.keySet()) {
			bf.append(key);
			bf.append(macroVariableMap.get(key));
		}
		return bf.toString().hashCode();
	}

	public static synchronized String getHTableName(String qryRuleId, String startKey, String endKey,
			Map<String, String> macroVariableMap) throws Exception {
		QueryRulePO qryPo = DataSourceInit.htableRuleList.get(StringUtil.objectToLong(qryRuleId, -1l));
		String tableName = qryPo.getHbaseTablePartition();
		if (StringUtil.isIncludeMacroVariable(tableName)) {// 动态表名，替换宏变量
			Map<String, Object> newParaMap = new HashMap<String, Object>();
			newParaMap.putAll(macroVariableMap);
			if (startKey != null)
				newParaMap.put("START_KEY", startKey);
			if (endKey != null)
				newParaMap.put("END_KEY", endKey);
			tableName = StringUtil.replaceMacroVariable(tableName, newParaMap);
		} else {// 固定表名
			HBaseTablePO hbaseTablePO = DataSourceInit.ruleIdhtableList.get(StringUtil.objectToLong(qryRuleId, -1l));
			if (hbaseTablePO == null) {
				HBaseTableDAO tableDAO = new HBaseTableDAO();
				Map<String, Object> map = tableDAO.queryTableInfoByQryId(qryRuleId);
				tableDAO.close();
				if (null == map || map.size() <= 0) {
					throw new Exception("Hbase表不存在, query Id:" + qryRuleId);
				}
				hbaseTablePO = new HBaseTablePO(map);
			}
			tableName = hbaseTablePO.getHbTableName();
			if (null == tableName) {
				throw new Exception("Hbase表不存在, query Id:" + qryRuleId);
			}
		}
		return tableName;
	}

	public static synchronized HTableConnPO getHTableConnPO(String qryRuleId, String tableName) throws Exception {
		Hashtable<String, HTableConnPO> htableListConPo = DataSourceInit.htableQryRules.get(qryRuleId);
		HTableConnPO htableConPo = htableListConPo.get(tableName);
		if (htableConPo == null) {
			DataSourceInit.reLoadQueryRule(Convert.toLong(qryRuleId), tableName);
			htableConPo = DataSourceInit.htableQryRules.get(qryRuleId).get(tableName);
			if (htableConPo == null)
				throw new Exception("访问的数据查询规则[" + qryRuleId + "]不存在");
		}
		return htableConPo;
	}

	// modify by 2014-03-26 begin
	public static synchronized HTableScanner getHtableScanner(String qryRuleId, String startKey, String endKey,
			Map<String, String> macroVariableMap) throws Exception {
		String tableName = getHTableName(qryRuleId, startKey, endKey, macroVariableMap);
		HTableConnPO htableConPo = getHTableConnPO(qryRuleId, tableName);
		HTableScanner tableScanner = null;
		if (HTableScanner.qryRuleScanCache.containsKey(qryRuleId)) {
			Hashtable<String, Hashtable<String, HTableScanner>> tableBuffs = HTableScanner.qryRuleScanCache
					.get(qryRuleId);
			Hashtable<String, HTableScanner> scanBuffs = tableBuffs.get(tableName);
			if (tableBuffs.containsKey(tableName)) {// 包含表名
				String scanKey = getKey(startKey, endKey);
				if (scanBuffs.containsKey(scanKey)) {
					tableScanner = scanBuffs.get(scanKey);
					long temp = System.currentTimeMillis() - tableScanner.getCreateDate();
					if (temp > SCANNER_CACHE_MAX_TIME) {
						scanBuffs.remove(scanKey);
						tableScanner.close();
						tableScanner = new HTableScanner(htableConPo);
						tableScanner.initScan(startKey, endKey);// 初始化会加入到缓存中
					}
				} else {
					tableScanner = new HTableScanner(htableConPo);
					tableScanner.initScan(startKey, endKey);// 初始化会加入到缓存中
				}
			} else {
				tableScanner = new HTableScanner(htableConPo);
				tableScanner.initScan(startKey, endKey);
			}
		} else {
			tableScanner = new HTableScanner(htableConPo);
			tableScanner.initScan(startKey, endKey);
		}
		return tableScanner;
	}

	public DataTable getAllData(long queryRuleId, Map<String, String> macroVariableMap, String groupbyColumn,
			String groupbyStatistics) throws IOException {
		return getAllData(queryRuleId, macroVariableMap, groupbyColumn, groupbyStatistics, 500000);
	}

	/**
	 * 返回查询到的所有数据
	 * 
	 * @param macroVariableMap
	 * 
	 * @return
	 * @throws IOException
	 */
	public DataTable getAllData(long queryRuleId, Map<String, String> macroVariableMap, String groupbyColumn,
			String groupbyStatistics, int rowLimits) throws IOException {
		if (tableConPo.isVisitLogFlagDetail()) {
			totalTime = 0;
			filterTime = 0;
			pageTime = 0;
			_totalTime = System.currentTimeMillis();
		}
		isFirstQy = true;
		// 得到统计方法所含列在表中的位置
		showGroupbyStaIndex(groupbyColumn, groupbyStatistics);

		date = new Date();
		DataTable table = cloneTable();
		int termKey = genParamsKey(macroVariableMap);
		String[][] rows = this.buffData;
		if ((this.allowBuffSize <= 0 || this.totalRowCount > this.allowBuffSize) || termKey != this.paramsKey
				|| rows == null) {// 超出缓存或者条件变了
			this.pages = null;
			this.totalRowCount = 0;
			this.paramsKey = termKey;
			this.buffData = null;
			rows = splitPage(this.pageSize, queryRuleId, macroVariableMap, 0, null, null, rowLimits);
		}
		table.setRowsCount(rows.length);
		table.setRows(rows);
		// 添加分组数据到table中
		addGroupbyRows(groupbyColumn, groupbyStatistics);
		table.grows = this.grows;
		if (tableConPo.isVisitLogFlagDetail()) {
			filterTime = filterTime / 1000000;
			pageTime = pageTime / 1000000;
			convertMapToArray = convertMapToArray / 1000000;
			totalTime = (int) (System.currentTimeMillis() - _totalTime);
			LogUtils.info("查询总用时：" + totalTime + "ms 过滤数据用时：" + filterTime + "ms 返回数据的获取用时：" + pageTime + "ms 转换用时："
					+ convertMapToArray + "ms");
		}
		return table;
	}

	public DataTable getPageData(int currentPage) throws IOException {
		return getPageData(currentPage, pageSize, null, 0, -1, -1, null, null, null);
	}

	public DataTable getPageData(int currentPage, String orderByColumn, int orderDesc, int orderType)
			throws IOException {
		return getPageData(currentPage, pageSize, orderByColumn, orderDesc, orderType, -1, null, null, null);
	}

	public DataTable getPageData(int currentPage, int pageSize) throws IOException {
		return getPageData(currentPage, pageSize, null, 0, -1, -1, null, null, null);
	}

	/**
	 * 添加判断方法，判断属性（是否是缓存，是否分组错误） 1.如果是缓存则在缓存里进行分组 2.页面如果返回条数大于规则定义的条数就会重新读取
	 * 3.如果分组错误则提示错误信息，添加错误字段，分组错误就不进行分组，直接赋值
	 * 
	 * @param currentPage
	 * @param pageSize
	 * @param orderByColumn
	 * @param orderDesc
	 * @param orderType
	 * @param queryRuleId
	 * @param macroVariableMap
	 * @param groupbyColumn
	 * @param groupbyStatistics
	 * @return
	 * @throws IOException
	 */
	public DataTable getPageData(int currentPage, int pageSize, String orderByColumn, int orderDesc, int orderType,
			long queryRuleId, Map<String, String> macroVariableMap, String groupbyColumn, String groupbyStatistics)
			throws IOException {
		if (tableConPo.isVisitLogFlagDetail()) {
			totalTime = 0;
			filterTime = 0;
			pageTime = 0;
			_totalTime = System.currentTimeMillis();
		}
		isFirstQy = false;
		date = new Date();
		int termKey = genParamsKey(macroVariableMap);
		boolean readData = false;
		this.currentPage = currentPage;

		// 得到统计方法所含列在表中的位置
		showGroupbyStaIndex(groupbyColumn, groupbyStatistics);

		if (pages == null || termKey != this.paramsKey// 未读取或者条件改变
				|| this.totalRowCount == 0 // 读取,但是缓存的记录数为0
				|| (pageSize != this.pageSize && (this.allowBuffSize <= 0 || this.totalRowCount > this.allowBuffSize))) {// 超出缓存分页大小改变
			this.pages = null;
			this.totalRowCount = 0;
			this.buffData = null;
			this.paramsKey = termKey;
			readData = true;
			isFirstQy = true;
			long l = System.currentTimeMillis();
			if (pageSize > 0 && currentPage > 0) {
				this.pageSize = pageSize;
				splitPage(pageSize, queryRuleId, macroVariableMap, currentPage, groupbyColumn, groupbyStatistics,
						500000);
			} else {
				splitPage(pageSize, queryRuleId, macroVariableMap, 0, null, null, 500000);// 全部读取
			}
			LogUtils.info("=====从Hbase查询数据用时：" + (System.currentTimeMillis() - l));
		}
		DataTable table = cloneTable();
		if (pageSize == 0) {
			table.rows = buffData;
			table.setRowsCount(buffData.length);
			if (this.allowBuffSize <= 0 || this.totalRowCount > this.allowBuffSize) {
				this.buffData = null;
				if (this.pageSize == 0)
					this.pages = null;
			}
		} else { // Constant.SERVER_RECORD_BUFFER_MAX_SIZE;
			if (readData == false && this.allowBuffSize > 0 && this.totalRowCount <= this.allowBuffSize) {// 已经缓存数据
				if (tableConPo.isVisitLogFlagDetail()) {
					_pageTime = System.nanoTime();
				}
				if ((enableSort && orderBufData(orderByColumn, orderDesc, orderType)) || this.pageSize != pageSize) {
					currentPage = 1;// 排序改变，跳转第一页
				}
				// 直接取数据
				int rowNum = totalRowCount >= currentPage * pageSize ? pageSize : totalRowCount % pageSize;
				if (rowNum > 0) {
					table.rows = new String[rowNum][table.colsCount];
					System.arraycopy(this.buffData, (currentPage - 1) * pageSize, table.rows, 0, rowNum);
				}
				// 分组是否取缓存数据
				if (!isCache && !isError && isGroupBy) {
					this.mapGcol.clear();
					for (String[] row : this.buffData) {
						// 构建分组统计数据
						addGroupByRow(row);
					}
				}
				table.setRowsCount(rowNum);
				if (tableConPo.isVisitLogFlagDetail()) {
					pageTime = (int) (System.nanoTime() - _pageTime);
				}
			} else if (readData == false && pages != null && pages.size() > 0) { // 不支持排序，重新读取数据,不支持pageSize改变
				// 已分页，不再读取全部数据 未缓存数据,
				PageInfo page = pages.get(currentPage - 1);
				initScaner(page.startkey, page.endkey);
				List<String[]> res = new ArrayList<String[]>();
				String[] row = null;
				QueryRuleConditionPO[] mapQueryRule = tableConPo.ruleConditionRel;
				if (tableConPo.isVisitLogFlagDetail()) {
					_pageTime = System.nanoTime();
				}
				mapFiledMethod.clear();
				this.mapGcol.clear();
				while ((row = getNextRow()) != null) {
					if (this.tableConPo.isStaticMethod) {
						_stataicMethod(row, FiledMethod.STATAIC_BEFOR_FLAG);
					}
					if (null != mapQueryRule && this.filterRow(row, mapQueryRule, macroVariableMap)) {
						continue;
					}
					res.add(row);
					if (this.tableConPo.isStaticMethod) {
						_stataicMethod(row, FiledMethod.STATAIC_AFTER_FLAG);
					}
					addGroupByRow(row);
				}
				table.rows = new String[res.size()][];
				table.setRowsCount(res.size());
				res.toArray(table.rows);
				if (tableConPo.isVisitLogFlagDetail()) {
					pageTime = (int) (System.nanoTime() - _pageTime);
				}
			} else {// 重新读取过数据
				table.rows = buffData;
				buffData = null;// 不缓存一页数据
				table.setRowsCount(null != table.rows ? table.rows.length : 0);
			}
		}
		// 添加分组数据到table中
		addGroupbyRows(groupbyColumn, groupbyStatistics);
		table.grows = this.grows;

		if (!this.isGroupBy) {
			table.grows = null;
		}
		if (this.isError) {
			table.gErrorMSG = "分组字段有误！";
		} else {
			table.gErrorMSG = "";
		}

		if (tableConPo.isVisitLogFlagDetail()) {
			filterTime = filterTime / 1000000;
			pageTime = pageTime / 1000000;
			convertMapToArray = convertMapToArray / 1000000;
			totalTime = (int) (System.currentTimeMillis() - _totalTime);
			LogUtils.info("查询总用时：" + totalTime + "ms 过滤数据用时：" + filterTime + "ms 返回数据的获取用时：" + pageTime + "ms 转换用时："
					+ convertMapToArray + "ms");
		}
		return table;
	}

	/**
	 * 得到统计方法所含列在表中的位置
	 * 
	 * @param groupbyColumn
	 * @param groupbyStatistics
	 */
	public void showGroupbyStaIndex(String groupbyColumn, String groupbyStatistics) {
		if (groupbyColumn == null || groupbyColumn.equals("")) {
			this.isError = false;
			this.isGroupBy = false;
			return;
		}
		int[] arrCol = getGroupByCol(groupbyColumn);
		int[] arrColSta = getGroupBySta(groupbyStatistics, INIT_GROUP_COL);// 得到统计方法字段的值
		int[] arrColStaFun = getGroupBySta(groupbyStatistics, INIT_GROUP_COL_FUN);// 得到统计方法的值
		if (arrCol == null || arrCol == null || arrColStaFun == null) {
			this.isError = true;
			this.isGroupBy = true;
			return;
		}
		if ((arrCol.length > 0 && Arrays.binarySearch(arrCol, -1) > -1)
				&& (arrColSta.length > 0 && Arrays.binarySearch(arrColSta, -3) > -1)
				&& (arrColStaFun.length > 0 && Arrays.binarySearch(arrColStaFun, -2) > -1)) {
			this.isError = true;
			this.isGroupBy = true;
			return;
		} else {
			this.isError = false;
			this.isGroupBy = true;
		}
		if (this.gcol != null && this.gstatistic != null && this.gstatisticFun != null
				&& Arrays.equals(arrCol, this.gcol) && Arrays.equals(arrColSta, this.gstatistic)
				&& Arrays.equals(arrColStaFun, this.gstatisticFun)) {
			this.isCache = true;
		} else {
			this.gcol = arrCol;
			this.gstatistic = arrColSta;
			this.gstatisticFun = arrColStaFun;
		}
	}

	/**
	 * 添加分组数据到table中
	 */
	public void addGroupbyRows(String groupbyColumn, String groupbyStatistics) {
		if (!isGroupBy || isError) {
			return;
		}
		Vector<Object[]> groupByBuffData = new Vector<Object[]>();
		String gcols[] = (groupbyColumn + "," + groupbyStatistics).split(",");
		groupByBuffData.add(gcols);// 第一行返回字段名
		for (Map.Entry<String, Object[]> entry : this.mapGcol.entrySet()) {
			String keys[] = entry.getKey().split("~");
			List<Object> list = new ArrayList<Object>();
			for (String kv : keys) {
				list.add(kv);
			}
			Object[] objTemp = entry.getValue();
			for (int i = 0; i < objTemp.length; i++) {
				list.add(formatReturnGroup(i, objTemp));
			}
			groupByBuffData.add(list.toArray());
		}
		this.grows = new Object[groupByBuffData.size()][];
		groupByBuffData.toArray(grows);
	}

	/**
	 * 格式化返回的分组数据
	 * 
	 * @param index
	 * @param arrObj
	 *            返回的数组数据 （1:max;2:min;3:avg;4:count,5:sum）
	 */
	private Object formatReturnGroup(int index, Object[] arrObj) {
		String k = Convert.toString(arrObj[index]);
		String initDouble = INIT_DOUBLE + "";
		switch (this.gstatisticFun[index]) {
		case 1:// max
			if (k.equals(initDouble)) {
				return "NA";
			} else {
				return formatPoint(k);
			}
		case 2:// min
			if (k.equals(initDouble)) {
				return "NA";
			} else {
				return formatPoint(k);
			}
		case 3:// avg
			if (k.equals(initDouble)) {
				return "NA";
			} else {
				String[] arr = k.split("~");
				double max = Double.parseDouble(arr[0]);
				double count = Double.parseDouble(arr[1]);
				return formatPoint(formatDouble(max / count, 2) + "");
			}

		case 4:// count
			return formatPoint(k);
		case 5:// sum
			if (k.equals(initDouble)) {
				return "NA";
			} else {
				return formatPoint(k);
			}
		case -1:
			return "NA";
		default:
			return null;
		}
	}

	/**
	 * 格式化返回结果
	 * 
	 * @param k
	 * @return
	 */
	private static String formatPoint(String str) {
		if (str.indexOf(".") == -1)
			return str;
		int rs = -1;
		Pattern paO = Pattern.compile(REX_COMPILE_RS);
		if (paO.matcher(str).matches()) {
			rs = Integer.parseInt(str.split("\\.")[0]);
			return rs + "";
		}
		return str;
	}

	/**
	 * 得到分组方法的位置
	 * 
	 * @param groupbyStatistics
	 * @return
	 */
	private int[] getGroupBySta(String groupbyStatistics, int type) {
		String[] arrGroupbystatistics = groupbyStatistics.split(",");
		int[] arrCol = new int[arrGroupbystatistics.length];
		switch (type) {
		case 0:// 取得分组字段的位置
			for (int i = 0; i < arrGroupbystatistics.length; i++) {
				String groupCol = arrGroupbystatistics[i];

				if (groupCol.length() > 0 && groupCol != null) {
					String groupColTemp = groupCol.substring(groupCol.indexOf("(") + 1, groupCol.indexOf(")"));
					int arrIndex = isIn(groupColTemp, tableConPo.colEnNames[0]);
					if (arrIndex == -1) {
						a: for (int j = 0; j < tableConPo.colEnNames.length; j++) {
							arrIndex = isIn(groupColTemp, tableConPo.colEnNames[j]);
							if (arrIndex != -1) {
								arrIndex = getArrNum(j, tableConPo.colEnNames, arrIndex);
								;
								break a;
							}
						}
					}
					arrCol[i] = arrIndex;
				}
			}
			break;
		case 1:// 取得分组字段方法的位置
			for (int i = 0; i < arrGroupbystatistics.length; i++) {
				String groupCol = arrGroupbystatistics[i];
				arrCol[i] = getGroupFunbyIndex(groupCol);
			}
			break;
		default:
			break;
		}
		return arrCol;
	}

	/**
	 * 得到分组方法的值
	 * 
	 * @param groupCol
	 * @return （1:max;2:min;3:avg;4:count,5:sum）
	 */
	private int getGroupFunbyIndex(String groupCol) {
		String groupColToLowerCase = groupCol.toLowerCase();
		if (groupColToLowerCase.indexOf("max") != -1) {
			return 1;
		} else if (groupColToLowerCase.indexOf("min") != -1) {
			return 2;
		} else if (groupColToLowerCase.indexOf("avg") != -1) {
			return 3;
		} else if (groupColToLowerCase.indexOf("count") != -1) {
			return 4;
		} else if (groupColToLowerCase.indexOf("sum") != -1) {
			return 5;
		}
		return -1;
	}

	/**
	 * 得到分组列的位置
	 * 
	 * @param groupbyColumn
	 * @return
	 */
	private int[] getGroupByCol(String groupbyColumn) {
		String[] arrGroupbyColumn = groupbyColumn.split(",");
		int[] arrCol = new int[arrGroupbyColumn.length];
		for (int i = 0; i < arrGroupbyColumn.length; i++) {
			String groupbyCol = arrGroupbyColumn[i];
			int arrIndex = isIn(groupbyCol, tableConPo.colEnNames[0]);
			if (arrIndex == -1) {
				a: for (int j = 1; j < tableConPo.colEnNames.length; j++) {
					arrIndex = isIn(groupbyCol, tableConPo.colEnNames[j]);
					if (arrIndex != -1) {
						arrIndex = getArrNum(j, tableConPo.colEnNames, arrIndex);
						break a;
					}
				}
			}
			arrCol[i] = arrIndex;
		}
		return arrCol;
	}

	/**
	 * 计算统计方法中列在表的位置, groupbyStatistic为空则返回-2， groupbyStatistic不为空却存在则返回-3
	 * 
	 * @param groupbyStatistic
	 * @return
	 */
	public int getGroupbyIndex(String groupbyStatistic) {
		int groupbyIndex = isIn(groupbyStatistic, tableConPo.colEnNames[0]);
		if (groupbyIndex == -1) {
			a: for (int j = 0; j < tableConPo.colEnNames.length; j++) {
				groupbyIndex = isIn(groupbyStatistic, tableConPo.colEnNames[j]);
				if (groupbyIndex != -1) {
					groupbyIndex = getArrNum(j, tableConPo.colEnNames, groupbyIndex);
					break a;
				}
			}
		}
		if (groupbyIndex == -1) {
			groupbyIndex = -3;
		}
		return groupbyIndex;
	}

	/**
	 * 重新计算分组字段的位置
	 * 
	 * @param j
	 * @param strings
	 * @return
	 */
	private int getArrNum(int j, String[][] arrStr, int groupIndex) {
		int total = 0;
		for (int i = 0; i < j; i++) {
			total += arrStr[i].length;
		}
		return total + groupIndex;
	}

	public Map<String, Object> getRegexEnv(QueryRuleConditionPO cond, Matcher m) {
		int mg = m.groupCount();
		Map<String, Object> env = new HashMap<String, Object>();
		for (int i = 0; i < cond.regDindex.length; i++) {
			if (mg >= cond.regDindex[i]) {
				env.put("$" + cond.regDindex[i], m.group(cond.regDindex[i]));
			} else {
				LogUtils.warn("宏变量{$" + cond.regDindex[i] + "}未获取到输入值" + cond.matchExStr);
				env.put("$" + cond.regDindex[i], "");
			}
		}
		return env;
	}

	public Map<String, Object> getMacEnv(QueryRuleConditionPO cond, int type, String[] row,
			Map<String, String> macroVariableMap) {
		Map<String, Object> env = new HashMap<String, Object>();
		if (type == 0) {// 计算表达式
			for (int i = 0; i < cond.exprVar.length; i++) {
				if (cond.exprVarIndex[i] != -1) {
					env.put(tableConPo.colExpandEnNames[cond.exprVarIndex[i]],
							convertToExecEnvObj(row[cond.exprVarIndex[i]]));
				} else {
					String value = macroVariableMap.get(cond.exprVar[i]);
					if (value == null) {
						value = MacroVariable.getVarValue(cond.exprVar[i]);
					}
					if (value == null) {
						value = "";
						LogUtils.warn("宏变量{" + cond.exprVar[i] + "}未获取到输入值" + cond.getExpr());
					}
					env.put(cond.exprVar[i], convertToExecEnvObj(value));
				}
			}
		} else if (type == 1) {// 正则表达式
			for (int i = 0; i < cond.regexVar.length; i++) {
				if (cond.regexVarIndex[i] != -1) {
					env.put(tableConPo.colExpandEnNames[cond.regexVarIndex[i]],
							convertToExecEnvObj(row[cond.regexVarIndex[i]]));
				} else {
					String value = macroVariableMap.get(cond.regexVar[i]);
					if (value == null) {
						value = MacroVariable.getVarValue(cond.regexVar[i]);
					}
					if (value == null) {
						value = "";
						LogUtils.warn("宏变量{" + cond.regexVar[i] + "}未获取到输入值" + cond.getRegexExp());
					}
					env.put(cond.regexVar[i], convertToExecEnvObj(value));
				}
			}
		}
		return env;

		// String res = exp;
		//
		// while (m.find()) {
		// String name = m.group(1);
		// byte[] v = row.get(name);
		// String value = null;
		// if (v != null) {
		// value = new String(v, "UTF-8");
		// }
		// if (value == null) {
		// value = macroVariableMap.get(name);
		// }
		// if (value == null) {
		// value = MacroVariable.getVarValue(name);
		// }
		// if (value == null) {
		// // QueryRuleColumnPO obj = this.tableConPo.getNameIndexs().get(name);
		// // if (obj != null) {
		// // v = row.get(obj.getColCFName());
		// // value = new String(v, "UTF-8");
		// // }
		// }
		// if (value == null) {
		// value = "";
		// LogUtils.warn("宏变量{" + name + "}未获取到输入值" + exp);
		// // throw new IOException("宏变量{" + name + "}未获取到输入值" + exp);
		// }
		// res = res.replaceAll("\\{" + name + "\\}", value);
		// m = QueryRuleConditionPO.macroPattern.matcher(res);
		// }
		// return res;

		// String temp, value;
		// Iterator<String> iterator = row.keySet().iterator();
		// while (iterator.hasNext()) {
		// temp = new String(iterator.next());
		// value = new String(row.get(temp), "UTF-8");
		// exp = exp.replaceAll("\\{" + temp + "\\}", value);
		// }
		// // 替换宏变量
		// if (null != macroVariableMap) {
		// Iterator<String> mvm = macroVariableMap.keySet().iterator();
		// while (mvm.hasNext()) {
		// temp = mvm.next();
		// // 如果输入的宏变量有值，这优先使用，否则，查看系统宏变量是否有值
		// value = macroVariableMap.get(temp);
		// if (null == value) {
		// value = MacroVariable.getVarValue(temp);
		// }
		// if (null == value) {
		// continue;
		// }
		// exp = exp.replaceAll("\\{" + temp + "\\}", value);
		// }
		// }
		//
		// if (exp.indexOf('{') < exp.indexOf('}')) {
		// throw new IOException("宏变量 未获取到输入值" + exp);
		// }
		// return exp;
	}

	private boolean orderBufData(String orderByColumn, int orderDesc, int orderType) {
		/**
		 * ORDERTYPE==-1 处理默认的情况 ORDERTYPE!=-1 处理动态传入排序类型
		 */

		if (orderType == -1) {
			if (orderByColumn == null || orderByColumn.trim().equals("")) {
				orderByColumn = Constant.HBASE_ROWKEY_COLUMN_CFNAME;
			}
			if (this.orderByCol.equals(orderByColumn) && this.orderDesc == orderDesc) {
				return false;
			}
			if (!tableConPo.nameIndexs.containsKey(orderByColumn))
				return false;
			int colRuleIndex = tableConPo.nameIndexs.get(orderByColumn);
			HTableDataSortCmp c = new HTableDataSortCmp();
			for (int i = 0; i < tableConPo.colExpandEnNames.length; i++) {
				if (tableConPo.colExpandEnNames[i].equalsIgnoreCase(orderByColumn)) {
					if (this.tableConPo.qrCols[colRuleIndex].getSortFlag() == 1) {
						this.orderByCol = orderByColumn;
						this.orderDesc = orderDesc;
						c.index = i;
						c.orderDesc = orderDesc;
						c.cmpType = this.tableConPo.qrCols[colRuleIndex].getSortType();
						java.util.Arrays.sort(this.buffData, c);
						return true;
					} else {
						return false;
					}
				}
			}
			return false;
		} else {
			if (orderByColumn == null || orderByColumn.trim().equals("")) {
				orderByColumn = Constant.HBASE_ROWKEY_COLUMN_CFNAME;
			}
			if (this.orderByCol.equals(orderByColumn) && this.orderDesc == orderDesc && this.orderType == orderType) {
				return false;
			}
			if (!tableConPo.nameIndexs.containsKey(orderByColumn))
				return false;
			HTableDataSortCmp c = new HTableDataSortCmp();
			for (int i = 0; i < tableConPo.colExpandEnNames.length; i++) {
				if (tableConPo.colExpandEnNames[i].equalsIgnoreCase(orderByColumn)) {
					this.orderByCol = orderByColumn;
					this.orderDesc = orderDesc;
					this.orderType = orderType;
					c.index = i;
					c.orderDesc = orderDesc;
					c.cmpType = orderType;
					java.util.Arrays.sort(this.buffData, c);
					return true;
				}
			}

		}
		return false;
	}

	private DataTable cloneTable() {
		DataTable table = new DataTable();
		table.setColsCount(this.tableConPo.colExpandCnNames.length + 1);
		table.colsName = new String[this.tableConPo.colExpandEnNames.length + 1];
		System.arraycopy(this.tableConPo.colExpandEnNames, 0, table.colsName, 0,
				this.tableConPo.colExpandEnNames.length);
		table.colsName[this.tableConPo.colExpandEnNames.length] = Constant.HBASE_ROWKEY_COLUMN_CNNAME;
		table.setRowsCount(0);
		return table;
	}

	public String[][] splitPage(int pageSize, long queryRuleId, Map<String, String> macroVariableMap, int curPage,
			String groupbyColumn, String groupbyStatistics, int rowLimits) throws IOException {
		if (pages != null || this.buffData != null)// 已分页或者已经缓存数据 ，不再读取数据
			return this.buffData;
		initScaner(Bytes.toBytes(this.startKey), Bytes.toBytes(this.endKey));
		try {
			totalRowCount = 0;
			Vector<String[]> _buffData = new Vector<String[]>();
			Vector<HTableScanner.PageInfo> _pages = new Vector<HTableScanner.PageInfo>();
			String[] row = null;
			String[] lrow = null;
			PageInfo page = null;

			QueryRuleConditionPO[] mapQueryRule = tableConPo.ruleConditionRel;
			Vector<String[]> _pageData = new Vector<String[]>();
			if (tableConPo.isVisitLogFlagDetail()) {
				_pageTime = System.nanoTime();
			}
			this.mapFiledMethod.clear();
			this.mapGcol.clear();
			while ((row = getNextRow()) != null) {
				if (this.tableConPo.isStaticMethod) {
					_stataicMethod(row, FiledMethod.STATAIC_BEFOR_FLAG);
				}
				if (null != mapQueryRule && this.filterRow(row, mapQueryRule, macroVariableMap)) {
					continue;
				}

				this.totalRowCount++;
				if (this.totalRowCount >= rowLimits) {
					this.totalRowCount = 0;
					this.buffData = null;
					this.pages = null;
					throw new IOException("result rowcount over limit " + rowLimits);
				}
				if (this.tableConPo.isStaticMethod) {
					_stataicMethod(row, FiledMethod.STATAIC_AFTER_FLAG);
				}

				if (this.totalRowCount <= this.allowBuffSize || curPage <= 0) {
					_buffData.add(row);
				} else if (this.totalRowCount > this.allowBuffSize) {
					enableSort = false;// 不再支持排序
					_buffData.clear();
				}
				int _curRowInPage = 1;
				if (this.pageSize > 0 && curPage > 0) {
					_curRowInPage = (this.totalRowCount + this.pageSize - 1) / this.pageSize;
				} else {
					if (tableConPo.isVisitLogFlagDetail()) {
						pageTime += System.nanoTime() - _pageTime;
						_pageTime = System.nanoTime();
					}
				}

				if (curPage > 0 && pageSize > 0 && _curRowInPage == curPage && _pageData.size() < pageSize) {
					_pageData.add(row);// 输出当前页数据
					if (tableConPo.isVisitLogFlagDetail()) {
						pageTime += System.nanoTime() - _pageTime;
						_pageTime = System.nanoTime();
					}
				}
				// 构建分页
				if (page == null || (curPage > 0 && pageSize > 0 && page.pageNum != _curRowInPage)) {
					if (page != null)
						page.endkey = Bytes.toBytes(row[row.length - 1]);
					page = new PageInfo();
					_pages.add(page);
					page.pageNum = (this.pageSize <= 0) ? 1 : (this.totalRowCount + this.pageSize - 1) / this.pageSize;
					// (this.totalRowCount + this.pageSize - 1)/
					// ((this.pageSize== 0) ? 1 : this.pageSize);
					page.startkey = Bytes.toBytes(row[row.length - 1]);
				}
				lrow = row;
				if ((curPage == 0 || pageSize == 0) || _curRowInPage == curPage) {
					if (!isError && isGroupBy) {
						// 构建分组统计数据
						addGroupByRow(row);
					}
				}
			}
			if (lrow != null)
				page.endkey = Bytes.toBytes(lrow[lrow.length - 1]);
			pages = _pages;
			// 缓存数据 或者取全部数据
			if (this.allowBuffSize > 0 && this.totalRowCount <= this.allowBuffSize || curPage <= 0) {
				buffData = new String[_buffData.size()][];
				_buffData.toArray(buffData);
				pages.clear();
				_pageData.clear();
			} else {// 分页数据
				buffData = new String[_pageData.size()][];
				_pageData.toArray(buffData);
			}
			return buffData;
		} finally {
			scaner.close();
		}
	}

	public String[][] convertToArr(Vector<String[]> buffa) {
		String[][] _bfData = new String[buffa.size()][];
		for (int i = 0; i < _bfData.length; i++) {
			_bfData[i] = buffa.get(i);
		}
		return _bfData;
	}

	public String[] getDefColENName() {
		return this.tableConPo.getColExpandENNames();
	}

	public String[] getColCHName() {
		return this.tableConPo.getColExpandCNNames();
	}

	public String[] getIncludeRowkeyDefColENName() {
		String[] defColEn = this.getDefColENName();
		if (null == defColEn) {
			return null;
		}
		String[] rowDefColEn = new String[defColEn.length + 1];
		for (int i = 0; i < defColEn.length; i++) {
			rowDefColEn[i] = defColEn[i];
		}
		rowDefColEn[defColEn.length] = Constant.HBASE_ROWKEY_COLUMN_CFNAME;
		return rowDefColEn;
	}

	public String[] getIncludeRowkeyColCHName() {
		String[] defColCH = this.getColCHName();
		if (null == defColCH) {
			return null;
		}
		String[] rowDefColCH = new String[defColCH.length + 1];
		for (int i = 0; i < defColCH.length; i++) {
			rowDefColCH[i] = defColCH[i];
		}
		rowDefColCH[defColCH.length] = Constant.HBASE_ROWKEY_COLUMN_CFNAME;
		return rowDefColCH;
	}

	public void close() {
		if (tableConPo != null && HTableScanner.qryRuleScanCache.containsKey(tableConPo.qryRuleId)
				&& HTableScanner.qryRuleScanCache.get(tableConPo.qryRuleId).containsKey(this.getKey())) {
			return;
		} else {
			if (scaner != null)
				scaner.close();
			scaner = null;
			buffData = null;
			table.close();
			table = null;
		}
	}

	@SuppressWarnings("deprecation")
	public String[] getNextRow() throws IOException {
		Map<String, byte[]> res = new HashMap<String, byte[]>();
		Result r = next();
		if (r == null)
			return null;
		for (KeyValue kv : r.raw()) {
			String fc = new String(kv.getFamily()) + ":" + new String(kv.getQualifier());
			byte[] v = kv.getValue();
			// System.out.println("column:" + fc + " value:" + new String(v,
			// "utf-8"));
			res.put(fc, v);
		}
		res.put(Constant.HBASE_ROWKEY_COLUMN_CFNAME, r.getRow());
		long l = System.nanoTime();
		String[] row = convertToArray(res);
		convertMapToArray += System.nanoTime() - l;
		return row;
	}

	private String[] convertToArray(Map<String, byte[]> row) throws UnsupportedEncodingException {
		String[] resRow = new String[tableConPo.colExpandEnNames.length + 1];
		// 初始化为空串
		for (int i = 0; i < resRow.length; i++) {
			if (null == resRow[i]) {
				resRow[i] = "";
			}
		}

		int colIndex = 0;
		for (int i = 0; i < tableConPo.colEnNames.length; i++) {
			byte[] val = row.get(tableConPo.colCFNames[i]);
			if (val != null && val.length > 0)
				resRow[colIndex] = new String(val, "UTF-8");
			else
				resRow[colIndex] = "";

			// 获取字段所在的列簇:列
			QueryRuleColumnPO qc = this.tableConPo.colCFNameMap.get(this.tableConPo.colCFNames[i]);
			// for (int j = 0; j < this.tableConPo.qrCols.length; j++) {
			// qc = this.tableConPo.qrCols[j];
			// if (qc.getColCFName().equals(this.tableConPo.colCFNames[i]))
			// break;
			// }

			if (qc == null) {
				continue;// 不包括在默认列簇中，数据无法处理，是不允许发生的，这里做了容错处理
			}

			String defineAllColEn[] = qc.getDefineAllColumnEnName();
			if (defineAllColEn.length > 1) {
				String[] tmp = resRow[colIndex].split(this.tableConPo.qrCols[i].splitStr);
				if (tmp.length <= this.tableConPo.colEnNames[i].length) {
					for (String v : tmp) {
						resRow[colIndex] = v;
						colIndex++;
					}
					colIndex += this.tableConPo.colEnNames[i].length - tmp.length;
				} else if (tmp.length > this.tableConPo.colEnNames[i].length) {
					int pos[] = this.tableConPo.colSelectEnNamesIndex[i]; // 返回列的索引位置
					for (int c = 0; c < pos.length; c++) {
						resRow[colIndex] = tmp[pos[c]];
						colIndex++;
					}
				}
			} else {
				colIndex++;
			}
		}
		resRow[tableConPo.colExpandEnNames.length] = new String(row.get(Constant.HBASE_ROWKEY_COLUMN_CFNAME), "UTF-8");
		return resRow;
	}

	public List<String[]> getNextRow(int nbRows) throws IOException {
		List<String[]> res = new ArrayList<String[]>();
		// Result[] rs = scaner.next(nbRows);
		// if (rs == null)
		// return res;
		// for (Result r : rs) {
		// Map<String, byte[]> row = new HashMap<String, byte[]>();
		// for (KeyValue kv : r.raw()) {
		// row.put(new String(kv.getFamily()) + ":" + new
		// String(kv.getQualifier()), kv.getValue());
		// }
		// row.put(Constant.HBASE_ROWKEY_COLUMN_CFNAME, r.getRow());
		// res.add(row);
		// this.totalRowCount++;
		// }
		int rowNum = 0;
		String[] row = null;// 不能全读取
		while ((row = getNextRow()) != null) {
			rowNum++;
			res.add(row);
			if (rowNum >= nbRows)
				break;
		}
		return res;
	}

	@Override
	public Iterator<Result> iterator() {
		return this.scaner.iterator();
	}

	@Override
	public Result next() throws IOException {
		if (pages != null && this.buffData != null) {// 初始查询，已经分页读取
			throw new IOException("已经分页读取完数据，不允许再读取");
		}
		if (this.scaner == null) {
			throw new IOException("未初始化scanner");
		}
		Result r = this.scaner.next();
		return r;
	}

	@Override
	public Result[] next(int nbRows) throws IOException {
		if (pages != null && this.buffData != null) {// 初始查询，已经分页读取
			throw new IOException("已经分页读取完数据，不允许再读取");
		}
		if (this.scaner == null) {
			throw new IOException("未初始化scanner");
		}
		Result[] r = this.scaner.next(nbRows);
		return r;
	}

	public static void remove() {
		remove(null, null);
	}

	// modify by 2014-03-26 begin
	public static void remove(String qryId, String tableName) {
		if (qryId == null || qryId.equals("")) {// 移除所有规则下面所有表的scanner
			for (String qryRuleId : HTableScanner.qryRuleScanCache.keySet()) {
				Hashtable<String, Hashtable<String, HTableScanner>> scanBuffs = HTableScanner.qryRuleScanCache
						.get(qryRuleId);
				if (scanBuffs != null) {
					for (String key : scanBuffs.keySet()) {
						Hashtable<String, HTableScanner> ts = scanBuffs.get(key);
						if (null == ts) {
							continue;
						}
						for (String k : ts.keySet()) {
							HTableScanner scanner = ts.get(k);
							scanBuffs.remove(key);
							if (scanner != null)
								scanner.close();
						}
					}
					scanBuffs.clear();
					HTableScanner.qryRuleScanCache.remove(qryRuleId);
				}
			}
			qryRuleScanCache.clear();
		} else if (tableName != null && !tableName.equals("")) {// 移除规则下面的某个表的scanner
			Hashtable<String, Hashtable<String, HTableScanner>> scanBuffs = HTableScanner.qryRuleScanCache.get(qryId);
			if (scanBuffs != null) {
				Hashtable<String, HTableScanner> htablesanner = scanBuffs.get(tableName);
				if (htablesanner != null) {
					for (String key : htablesanner.keySet()) {
						HTableScanner scanner = htablesanner.get(key);
						if (scanner != null)
							scanner.close();
					}
					htablesanner.clear();
				}
				scanBuffs.remove(tableName);
			}
		} else {// 移除某个规则下面所有表的scanner
			Hashtable<String, Hashtable<String, HTableScanner>> scanBuffs = HTableScanner.qryRuleScanCache.get(qryId);
			if (scanBuffs != null) {
				for (String key : scanBuffs.keySet()) {
					Hashtable<String, HTableScanner> ts = scanBuffs.get(key);
					for (String k : ts.keySet()) {
						HTableScanner scanner = ts.get(k);
						if (scanner != null)
							scanner.close();
					}
				}
				scanBuffs.clear();
				HTableScanner.qryRuleScanCache.remove(qryId);
			}
		}
	}

	// 正则表达式的定向替换,已未用，HBQryRuleAction有引用
	public static String ReplaceRegex(Matcher m, String substitution) {
		try {
			Matcher vm = QueryRuleConditionPO.valPartsRegex.matcher(substitution);
			String val = substitution;
			String regpar = substitution;
			int gl = m.groupCount();
			while (vm.find()) {
				regpar = regpar.substring(vm.end());
				int g = Integer.parseInt(vm.group(1));
				if (g > gl) {
					val = val.replaceAll("\\$\\d", "");
					break;
				}
				String gv = m.group(Integer.parseInt(vm.group(1)));
				if (gv != null)
					val = val.replaceAll("\\$" + vm.group(1), gv);
				else
					val = val.replaceAll("\\$" + vm.group(1), "");
				vm = QueryRuleConditionPO.valPartsRegex.matcher(regpar);
			}
			return val;
		} catch (Exception e) {
			return null;
		}
	}

	public static Object convertToExecEnvObj(String value) {
		try {
			if (value.indexOf('.') >= 0) {
				return Double.parseDouble(value);
			} else {
				return Long.parseLong(value);
			}
		} catch (NumberFormatException e) {
			return value;
		}
	}

	public boolean getEexcBoolean(Object obj, String[] row, Map<String, String> macroVariableMap) throws IOException {
		boolean res = false;
		try {
			if (obj instanceof Boolean) {
				res = (Boolean) obj;
			} else if (obj instanceof Integer) {
				res = ((Integer) obj > 0);
			} else if (obj instanceof Long) {
				res = ((Long) obj > 0);
			} else if (obj instanceof Double) {
				res = ((Double) obj > 0.000001);
			} else if (obj instanceof Float) {
				res = ((Float) obj > 0.000001);
			} else if (obj instanceof String) {
				if (obj != null && obj.toString().indexOf("{") >= 0) {
					Map<String, Object> env = new HashMap<String, Object>();
					Matcher m = QueryRuleConditionPO.macroPattern.matcher(obj.toString());
					String exp = obj.toString();
					String expTmp = exp;
					while (m.find()) {
						expTmp = expTmp.substring(m.end());
						String name = m.group(1);
						Integer index = this.tableConPo.nameExpandIndexs.get(name);
						String value = null;
						if (index != null) {
							value = row[index];
						}
						if (value == null) {
							value = macroVariableMap.get(name);
						}
						if (value == null) {
							value = MacroVariable.getVarValue(name);
						}
						if (value == null) {
							value = "";
							LogUtils.warn("宏变量{" + name + "}未获取到输入值" + obj);
							// throw new IOException("宏变量{" + name + "}未获取到输入值"
							// + expTmp);
						}
						m = QueryRuleConditionPO.macroPattern.matcher(expTmp);
						env.put(name, value.trim().length() > 0 ? convertToExecEnvObj(value) : null);
						// exp = exp.replaceAll("\\{" + name + "\\}", value);
					}
					exp = QueryRuleConditionPO.macroPattern.matcher(exp).replaceAll("$1");
					obj = AviatorEvaluator.execute(exp, env);
					res = getEexcBoolean(obj, row, macroVariableMap);
					// getEexcBoolean(AviatorEvaluator.execute(obj.toString()),
					// row, macroVariableMap);
				} else {
					if (obj != null && !obj.toString().trim().equals(""))
						return true;
					else
						return false;
				}
			}
		} catch (Exception e) {
			throw new IOException("计算失败，表达式或变量异常:" + e.getMessage());
		}
		return res;
	}

	/**
	 * 过滤行数据
	 * 
	 * @param row
	 * @param macroVariableMap
	 * @param mapColmunNameQueryRule
	 * @return true:过滤掉
	 * @throws UnsupportedEncodingException
	 */
	public boolean filterRow(String[] row, QueryRuleConditionPO[] lstCondition, Map<String, String> macroVariableMap)
			throws IOException {
		if (tableConPo.isVisitLogFlagDetail()) {
			_filterTime = System.nanoTime();
		}
		boolean res = _filterRow(row, lstCondition, macroVariableMap);
		if (tableConPo.isVisitLogFlagDetail()) {
			filterTime += (System.nanoTime() - _filterTime);
		}
		return res;
	}

	private boolean _filterRow(String[] row, QueryRuleConditionPO[] lstCondition, Map<String, String> macroVariableMap)
			throws IOException {
		boolean res = false;// 初始为不过滤
		if (null == lstCondition || lstCondition.length <= 0) {
			return res;
		}
		String matchCondition = null;
		String expreCondition = null;
		Pattern pattern = null;
		boolean isMatch = false;
		for (QueryRuleConditionPO cond : lstCondition) {
			int patternType = cond.getPatternType();
			matchCondition = cond.getRegexExp();
			expreCondition = cond.getExpr();
			int conditonType = cond.getConditonType();
			pattern = cond.getPattern();
			Map<String, Object> env = getMacEnv(cond, conditonType, row, macroVariableMap);
			if (conditonType == QueryRuleConditionPO.CONDITON_TYPE_EXPR) {// 条件计算,expreCondition不可能为空
				Object obj = cond.execExp.execute(env);
				res = getEexcBoolean(obj, row, macroVariableMap);
				if (patternType == QueryRuleConditionPO.PATTERN_TYPE_MATCH) {// 0
																				// 匹配满足条件保留
					isMatch = !res;
				} else if (patternType == QueryRuleConditionPO.PATTERN_TYPE_NOT_MATCH) {// 1
																						// 不匹配不满足条件
																						// 保留,满足过滤掉
					isMatch = res;
				}
				if (isMatch)// 过滤优先
					return true;
			} else if (conditonType == QueryRuleConditionPO.CONDITON_TYPE_REGEX) {// 正则匹配
				if (pattern == null) {
					for (String key : env.keySet()) {
						matchCondition = matchCondition.replaceAll("\\{" + key + "\\}", env.get(key).toString());
						pattern = Pattern.compile(matchCondition);
					}
				}
				if (pattern == null) {
					if (patternType == QueryRuleConditionPO.PATTERN_TYPE_MATCH) {// 0
																					// 匹配满足条件保留
						return true;
					}
					LogUtils.warn("正则匹配模式为空：" + matchCondition + "语法错误，当不匹配处理");
					continue;
				}
				env = getMacEnv(cond, 0, row, macroVariableMap);
				String exp = null;
				if (cond.execExp != null) {
					String[] exps = expreCondition.split("~");
					String expStr = exps[0];
					for (String key : env.keySet()) {
						expStr = expStr.replaceAll("\\{" + key + "\\}", env.get(key).toString());
					}
					Matcher m = pattern.matcher(expStr);
					res = m.find();
					if (res) {// 匹配
						exp = exps[1];
						env = getRegexEnv(cond, m);
						if (exp != null && !exp.trim().equals("")) {
							Object obj = cond.execExp.execute(env);
							res = getEexcBoolean(obj, row, macroVariableMap);
							if (patternType == QueryRuleConditionPO.PATTERN_TYPE_MATCH) {// 0
																							// 匹配满足条件保留
								isMatch = !res;
							} else if (patternType == QueryRuleConditionPO.PATTERN_TYPE_NOT_MATCH) {// 1
																									// 不匹配不满足条件
																									// 保留,满足过滤掉
								isMatch = res;
							}
							if (isMatch)// 过滤优先
								return true;
						} else {
							if (patternType == QueryRuleConditionPO.PATTERN_TYPE_NOT_MATCH) {// 1
																								// 不匹配不满足条件
																								// 保留,满足过滤掉
								return true;// 过滤优先
							}
						}
					} else {
						if (patternType == QueryRuleConditionPO.PATTERN_TYPE_MATCH) {// 0
																						// 匹配满足条件保留
							return true;// 过滤优先
						}
					}
				} else {
					for (String key : env.keySet()) {// 处理动态表达式替换
						expreCondition = expreCondition.replaceAll("\\{" + key + "\\}", env.get(key).toString());
					}
					res = pattern.matcher(expreCondition).find();
					if (patternType == QueryRuleConditionPO.PATTERN_TYPE_MATCH) {// 0
																					// 匹配满足条件保留
						isMatch = !res;
					} else if (patternType == QueryRuleConditionPO.PATTERN_TYPE_NOT_MATCH) {// 1
																							// 不匹配不满足条件
																							// 保留,满足过滤掉
						isMatch = res;
					}
					if (isMatch)// 过滤优先
						return true;
				}
			}
		}
		return false;
	}

	public void _stataicMethod(String[] row, int flag) {
		for (int j = 0; j < row.length - 1; j++) {
			int method = (int) this.tableConPo.colIndexMethod[j]; // 返回列的索引位置
			int stataicFlag = (int) this.tableConPo.colIndexFlag[j];
			if (stataicFlag != flag) {
				continue;
			}
			if (1 > method || method > 4) {
				continue;
			}
			String filedName = this.tableConPo.colExpandEnNames[j]; // 返回列的名字
			stataicMethod(row[j], j, method, filedName, stataicFlag);
		}
	}

	private void stataicMethod(String currentValue, int j, int method, String filedName, int stataicFlag) {
		switch (method) {
		case 1: // SUM
		case 2: // AVG
			FiledMethod fMethodSum = this.mapFiledMethod.get(j);
			if (null == fMethodSum) {
				fMethodSum = new FiledMethod(filedName, method, stataicFlag);
				this.mapFiledMethod.put(j, fMethodSum);
			}
			Double d = null == fMethodSum.getValue() ? 0 : StringUtil.stringToDouble(fMethodSum.getValue().toString());
			Double objv = null == currentValue ? 0 : StringUtil.stringToDouble(currentValue.toString());
			fMethodSum.setValue(StringUtil.doubleToString(d + objv, StringUtil.DOUBLE_FORMAT_pattern3));
			fMethodSum.count++;
			break;
		case 3: // MAX
			FiledMethod fMethodMax = this.mapFiledMethod.get(j);
			if (null == fMethodMax) {
				fMethodMax = new FiledMethod(filedName, method, stataicFlag);
				this.mapFiledMethod.put(j, fMethodMax);
			}
			fMethodMax.setValue(StringUtil.getBigObject(currentValue, fMethodMax.getValue()));
			break;
		case 4: // MIN
			FiledMethod fMethodMin = this.mapFiledMethod.get(j);
			if (null == fMethodMin) {
				fMethodMin = new FiledMethod(filedName, method, stataicFlag);
				this.mapFiledMethod.put(j, fMethodMin);
			}
			fMethodMin.setValue(StringUtil.getSmallObject(currentValue, fMethodMin.getValue()));
			break;
		}
		// case 5: // COUNT
		// FiledMethod fMethodCount = this.mapFiledMethod.get(j);
		// if (null == fMethodCount){
		// fMethodCount = new FiledMethod(filedName, method);
		// this.mapFiledMethod.put(j, fMethodCount);
		// }
		// fMethodCount.setValue(null == currentValue ? 1 :
		// (StringUtil.objectToInt(currentValue)) + 1);
		// break;
		// }
	}

	/**
	 * 构建分组统计数据
	 * 
	 * @param row
	 * 
	 */
	public void addGroupByRow(String[] row) {
		if (isError || !isGroupBy) {
			return;
		}
		String gcolTemp = "";
		Object[] gStatisticsTemp = new Object[this.gstatisticFun.length];
		for (int i = 0; i < this.gcol.length; i++) {
			if (gcol[i] != -1 && gcol[i] != -2) {
				gcolTemp += row[this.gcol[i]];
			}
			if (i != this.gcol.length - 1) {
				gcolTemp += "~";
			}
		}

		Object[] objStrArr = this.mapGcol.get(gcolTemp) == null ? null : this.mapGcol.get(gcolTemp);
		for (int k = 0; k < this.gstatisticFun.length; k++) {
			String groupFunValue = "0";
			if (objStrArr == null || objStrArr.length <= 0) {
				groupFunValue = INIT_DOUBLE + "";
			} else {
				groupFunValue = Convert.toString(objStrArr[k]);
			}
			gStatisticsTemp[k] = getGroupValue(groupFunValue, row[this.gstatistic[k]], this.gstatisticFun[k]);
		}
		this.mapGcol.put(gcolTemp, gStatisticsTemp);
	}

	/**
	 * 
	 * @param groupFunValue
	 *            分组字段的初始值
	 * @param currentValue
	 *            分组字段的现有值
	 * @param j
	 *            分组字段的方法
	 * @return
	 */
	private Object getGroupValue(String groupFunValue, String currentValue, int j) {
		if (j == -1)
			return -1;
		return getNumByType(j, groupFunValue, currentValue);
	}

	/**
	 * 
	 * @param type
	 *            （1:max;2:min;3:avg;4:count,5:sum）
	 * @param befNum
	 * @param curNum
	 * @return
	 */
	public String getNumByType(int type, String befNum, String curNum) {
		// 判断是否为数字
		Pattern pattern = Pattern.compile(REX_COMPILE);
		if (!pattern.matcher(curNum).matches()) {
			return befNum;
		}
		double curTemp = Double.parseDouble(curNum);

		switch (type) {
		case 2:// 返回最小值
			double befTempMin = Double.parseDouble(befNum);
			if (befTempMin == INIT_DOUBLE)
				return curNum;
			return befTempMin > curTemp ? curNum : befNum;
		case 1:// 返回最大值
			double befTempMax = Double.parseDouble(befNum);
			if (befTempMax == INIT_DOUBLE)
				return curNum;
			return curTemp > befTempMax ? curNum : befNum;
		case 3:// 平均值
			if (befNum.equals(INIT_DOUBLE + "")) {
				return curNum + "~" + 1;
			}
			String[] arrAvg = befNum.split("~");
			String sum = getNumByType(5, arrAvg[0], curNum);
			String count = getNumByType(4, arrAvg[1], curNum);
			return sum + "~" + count;
		case 4:
			if (befNum.equals(INIT_DOUBLE + "")) {
				return 1 + "";
			}
			return (Double.parseDouble(befNum) + 1) + "";
		case 5:// 求和
			double befTempSum = Double.parseDouble(befNum);
			if (befTempSum == INIT_DOUBLE) {
				befTempSum = 0;
			}
			return (curTemp + befTempSum) + "";
		default:
			return befNum;
		}
	}

	/**
	 * 保留小数点后几位
	 * 
	 * @param d
	 * @param double_point
	 * @return
	 */
	private double formatDouble(double d, int double_point) {
		double s = Math.pow(10, double_point);
		double t = Math.pow(10.0, double_point);
		return (double) (Math.round(d * s) / t);
	}

	/**
	 * JAVA判断字符串数组中是否包含某字符串元素
	 * 
	 * @param substring
	 *            某字符串
	 * @param source
	 *            源字符串数组
	 * @return 包含则返回位置，否则返回-1
	 */
	public int isIn(String substring, String[] source) {
		if (source == null || source.length == 0) {
			return -1;
		}
		if ("".equals(substring)) {
			return -2;
		}
		for (int i = 0; i < source.length; i++) {
			String aSource = source[i];
			if (aSource.equals(substring)) {
				return i;
			}
		}
		return -1;
	}

	public HTableConnPO getTableConPo() {
		return tableConPo;
	}

	public Vector<PageInfo> getPages() {
		return pages;
	}

	public int getTotalRowCount() {
		return totalRowCount;
	}

	public int getCurrentPage() {
		return currentPage;
	}

	public Map<Integer, FiledMethod> getMapFiledMethod() {
		return mapFiledMethod;
	}
}
