package com.ery.hadoop.hq.qureyaction;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.googlecode.aviator.AviatorEvaluator;
import com.googlecode.aviator.Expression;
import com.ery.hadoop.hq.datasource.DataTable;
import com.ery.hadoop.hq.datasource.HTableConnPO;
import com.ery.hadoop.hq.datasource.HTableDataSortCmp;
import com.ery.hadoop.hq.datasource.HTableScanner;
import com.ery.hadoop.hq.datasource.HTableScanner.FiledMethod;
import com.ery.hadoop.hq.log.HQLog;
import com.ery.hadoop.hq.mulget.QueryRunable;
import com.ery.hadoop.hq.mulget.QueryStatus;
import com.ery.hadoop.hq.mulget.QueryStatus.QuerySubStatus;
import com.ery.hadoop.hq.qureyrule.QueryRuleConditionPO;
import com.ery.hadoop.hq.utils.MacroVariable;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.Convert;

public class QueryDataAction {

	HTableScanner scanner = null;

	public Map<String, Object> queryAllData(long queryRuleId, String startKey, String endKey) {
		return this.queryAllData(queryRuleId, startKey, endKey, null, null, "", "", -1, 1);
	}

	/**
	 * 
	 * @param qryRuleId
	 * @param startKey
	 * @param endKey
	 * @param macroVariableMap
	 * @param returnData
	 * @param returnStatistics
	 * @return DataTable
	 * @throws Exception
	 */
	public Map<String, Object> queryAllData(long queryRuleId, String startKey, String endKey,
			Map<String, String> macroVariableMap, HQLog hqlog, String groupbyColumn, String groupbyStatistics,
			int returnStatistics, int returnData) {
		DataTable tab = null;
		Map<String, Object> mapValue = new HashMap<String, Object>();

		try {
			initScanner(queryRuleId, startKey, endKey, macroVariableMap);
			synchronized (scanner) {
				try {
					tab = scanner.getAllData(queryRuleId, macroVariableMap, groupbyColumn, groupbyStatistics);
					mapValue.put("status", "true");
					mapValue.put("enField", scanner.getIncludeRowkeyDefColENName());
					mapValue.put("chField", scanner.getIncludeRowkeyColCHName());
					mapValue.put("totalCount", scanner.getTotalRowCount());
					if (returnData == 1) {
						mapValue.put("values", tab == null ? "" : tab.rows);
					}

					String errorMsg = tab.gErrorMSG;
					if (returnStatistics == 1) {
						if ("".equals(errorMsg)) {
							mapValue.put("gvalues", tab == null || tab.grows == null ? "" : tab.grows);
						} else {
							mapValue.put("gvalues", tab == null ? "" : errorMsg);
						}
					}

					Map<Integer, FiledMethod> mapFiledMethod = scanner.getMapFiledMethod();
					if (mapFiledMethod.size() > 0) {
						Map<String, String> statistics = new HashMap<String, String>();
						mapValue.put("statistics", statistics);
						for (Integer key : mapFiledMethod.keySet()) {
							FiledMethod fm = mapFiledMethod.get(key);
							statistics.put(fm.getResponseFiledName(), fm.getResponseValue().toString());
						}
					}
				} catch (Exception e) {
					mapValue.put("status", "false");
					mapValue.put("msg", e.getMessage());
					e.printStackTrace();
				} finally {
					if (null != hqlog) {
						hqlog.setFilterTime(scanner.filterTime);
						hqlog.setPageTime(scanner.pageTime);
						hqlog.setTotalTime(scanner.totalTime);
					}
				}
			}
		} catch (Exception e) {
			mapValue.put("status", "false");
			mapValue.put("msg", e.getMessage());
		}
		return mapValue;
	}

	public Map<String, Object> queryPageData(long queryRuleId, String startKey, String endKey, int currentPage,
			int pageSize, String orderByColumn, int orderDesc, int orderType, String groupbyColumn,
			String groupbyStatistics, int returnStatistics, int returnData) {
		return this.queryPageData(queryRuleId, startKey, endKey, currentPage, pageSize, orderByColumn, orderDesc,
				orderType, null, null, groupbyColumn, groupbyStatistics, returnStatistics, returnData);
	}

	public Map<String, Object> queryPageData(long queryRuleId, String startKey, String endKey, int currentPage,
			int pageSize, String orderByColumn, int orderDesc, int orderType, Map<String, String> macroVariableMap,
			HQLog hqlog, String groupbyColumn, String groupbyStatistics, int returnStatistics, int returnData) {
		DataTable tab = null;
		Map<String, Object> mapValue = new HashMap<String, Object>();
		try {
			initScanner(queryRuleId, startKey, endKey, macroVariableMap);
			synchronized (scanner) {
				try {
					tab = scanner.getPageData(currentPage, pageSize, orderByColumn, orderDesc, orderType, queryRuleId,
							macroVariableMap, groupbyColumn, groupbyStatistics);
					int totalRowCount = scanner.getTotalRowCount();
					String errorMsg = tab.gErrorMSG;
					mapValue.put("status", "true");
					mapValue.put("enField", scanner.getIncludeRowkeyDefColENName());
					mapValue.put("chField", scanner.getIncludeRowkeyColCHName());
					mapValue.put("currentCount", tab == null ? 0 : tab.rowsCount);
					mapValue.put("currentPage", scanner.getCurrentPage());
					mapValue.put("totalPageSize", totalRowCount > 0 ? (totalRowCount - 1 + pageSize) / pageSize : 1);
					mapValue.put("pageSize", pageSize);
					mapValue.put("totalCount", totalRowCount);
					if (returnData == 1) {
						mapValue.put("values", tab == null || tab.rows == null ? "" : tab.rows);
					}
					if (returnStatistics == 1) {
						if ("".equals(errorMsg)) {
							mapValue.put("gvalues", tab == null || tab.grows == null ? "" : tab.grows);
						} else {
							mapValue.put("gvalues", tab == null ? "" : errorMsg);
						}
					}

					Map<Integer, FiledMethod> mapFiledMethod = scanner.getMapFiledMethod();
					if (mapFiledMethod.size() > 0) {
						Map<String, String> statistics = new HashMap<String, String>();
						mapValue.put("statistics", statistics);
						for (Integer key : mapFiledMethod.keySet()) {
							FiledMethod fm = mapFiledMethod.get(key);
							statistics.put(fm.getResponseFiledName(), fm.getResponseValue().toString());
						}
					}
				} catch (Exception e) {
					mapValue.put("status", "false");
					mapValue.put("msg", e.getMessage());
					e.printStackTrace();
				} finally {
					if (null != hqlog) {
						hqlog.setFilterTime(scanner.filterTime);
						hqlog.setPageTime(scanner.pageTime);
						hqlog.setTotalTime(scanner.totalTime);
						hqlog.setIsFirstQy(scanner.isFirstQy);
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			mapValue.put("status", "false");
			mapValue.put("msg", e.getMessage());
		}
		return mapValue;
	}

	private void initScanner(long queryRuleId, String startKey, String endKey, Map<String, String> macroVariableMap)
			throws Exception {
		String qryRuleId = queryRuleId + "";
		if (scanner == null) {
			scanner = HTableScanner.getHtableScanner(qryRuleId, startKey, endKey, macroVariableMap);
		}
	}

	public Map<String, Object> queryRowKeysData(long queryRuleId, String rowkeys, int parallel, String orderByColumn,
			int orderDesc, int orderType, Map<String, String> macroVariableMap, HQLog hqlog, String groupbyColumn,
			String groupbyStatistics, int returnStatistics, int returnData) {
		long startQryTime = System.nanoTime();
		long totalQueryTime = 0, assTime = 0, parallelEndQryTime = 0;
		Map<String, Object> mapValue = new HashMap<String, Object>();
		try {
			String filterEXpr = macroVariableMap.get("filter_expr");
			Expression filterExp = null;// 编译后的表达式对象
			int filterType = Convert.toInt(macroVariableMap.get("filter_expr"), 0);
			List<String> exprVar = null;
			if (filterEXpr != null && !filterEXpr.equals("")) {
				try {
					filterExp = AviatorEvaluator.compile(filterEXpr, true);
					exprVar = filterExp.getVariableNames();
				} catch (Exception e) {
					throw new Exception("滤过表达式编译错误：" + e.getMessage());
				}
			}
			String tableName = HTableScanner.getHTableName(queryRuleId + "", null, null, macroVariableMap);
			HTableConnPO htableConPo = HTableScanner.getHTableConnPO(queryRuleId + "", tableName);
			if (htableConPo == null)
				throw new IOException("Hbase查询Table对象和连接未初始化，不能进行查询初始化");
			// 分组计算等
			scanner = new HTableScanner(htableConPo);
			scanner.showGroupbyStaIndex(groupbyColumn, groupbyStatistics);

			String rowkey[] = rowkeys.split(",");
			QueryStatus queryStatus = new QueryStatus(queryRuleId, rowkey, macroVariableMap);
			queryStatus.enField = htableConPo.getColExpandENNames();
			queryStatus.chField = htableConPo.getColExpandCNNames();

			int threadNum = rowkey.length;
			threadNum = parallel < threadNum ? parallel : threadNum;
			if (threadNum > 20) {
				threadNum = 20;
			}
			queryStatus.threadNum = threadNum;
			if (threadNum > 1) {
				Object lock[] = new Object[threadNum];
				for (int i = 0; i < lock.length; i++) {
					lock[i] = new Object();
				}
				QueryRunable processes[] = new QueryRunable[threadNum];
				while (queryStatus.parallelCount < threadNum && !queryStatus.isError) {// 启动
					synchronized (queryStatus) {
						QuerySubStatus qrySubSt = queryStatus.getNext();
						if (queryStatus.isError) {
							mapValue.put("status", "false");
							mapValue.put("msg", queryStatus.getError());
							return mapValue;
						}
						queryStatus.startFlag(qrySubSt);
						if (qrySubSt != null) {
							processes[queryStatus.parallelCount] = new QueryRunable(htableConPo, queryStatus, qrySubSt,
									lock[queryStatus.parallelCount]);
							QueryRunable.queryPool.execute(processes[queryStatus.parallelCount]);
							queryStatus.parallelCount++;
						}
					}
				}
				long waitTime = System.nanoTime();
				int pos = 0;
				while (pos < processes.length) {
					if (processes[pos] != null) {
						if (processes[pos].started) {
							synchronized (lock[pos]) {
								LogUtils.info("lock released " + pos);
								pos++;
							}
						} else {
							try {
								Thread.sleep(1);
							} catch (InterruptedException e) {
							}
						}
					} else {
						pos++;
					}
					if (System.nanoTime() - waitTime > 20000000000l) {
						for (QueryRunable queryRunable : processes) {
							if (queryRunable != null) {
								try {
									queryRunable.thread.stop();
									queryRunable.thread.destroy();
								} catch (Throwable e) {
								}
							}
						}
						throw new Exception("等待数据查询结束超时 20s");
					}
				}
				// while (queryStatus.endCount != rowkey.length &&
				// !queryStatus.isError) {// 等待结束
				// try {
				// Thread.sleep(10);
				// } catch (InterruptedException e) {
				// }
				// }
			} else {
				QuerySubStatus qrySubSt = queryStatus.getNext();
				if (queryStatus.isError) {
					mapValue.put("status", "false");
					mapValue.put("msg", queryStatus.getError());
					return mapValue;
				}
				QueryRunable command = new QueryRunable(htableConPo, queryStatus, qrySubSt, new Object());
				if (qrySubSt != null) {
					queryStatus.parallelCount++;
					command.run();
				} else {
					mapValue.put("status", "false");
					mapValue.put("msg", "rowkey 参数错误");
					return mapValue;
				}
			}
			parallelEndQryTime = (System.nanoTime() - startQryTime) / 1000000;// ms
			if (queryStatus.isError) {
				mapValue.put("status", "false");
				mapValue.put("msg", queryStatus.getError());
				return mapValue;
			}
			// 组装数据
			assTime = System.nanoTime();
			List<String[]> rows = new ArrayList<String[]>();
			for (int i = 0; i < rowkey.length; i++) {
				Object obj = queryStatus.getResult(i);
				if (obj == null)
					continue;
				if (obj instanceof DataTable) {
					DataTable dt = (DataTable) obj;
					if (dt.rows != null) {
						for (Object[] row : dt.rows) {
							String[] _row = new String[row.length];
							for (int j = 0; j < _row.length; j++) {
								_row[j] = row[j] == null ? "" : row[j].toString();
							}
							rows.add(_row);
						}
					}
				} else if (obj instanceof String[][]) {
					String[][] rs = (String[][]) obj;
					for (String[] row : rs) {
						rows.add(row);
					}
					rows.add((String[]) obj);
				} else {
					rows.add((String[]) obj);
				}
			}
			assTime = (System.nanoTime() - assTime) / 1000000;// ms
			mapValue.put("status", "true");
			mapValue.put("enField", queryStatus.enField);
			mapValue.put("chField", queryStatus.chField);
			mapValue.put("totalCount", rows.size());
			QueryRuleConditionPO[] mapQueryRule = htableConPo.getRuleConditionRel();
			if (filterExp != null && (filterType & 1) == 1) {// 标准过滤前过滤
				filterDataExpr(queryStatus, rows, filterEXpr, filterExp, exprVar, macroVariableMap);
			}
			List<String[]> frows = new ArrayList<String[]>();
			for (String[] row : rows) {
				if (htableConPo.isStaticMethod) {
					scanner._stataicMethod(row, FiledMethod.STATAIC_BEFOR_FLAG);
				}
				if (null != mapQueryRule && scanner.filterRow(row, mapQueryRule, macroVariableMap)) {
					frows.add(row);
					continue;
				}
				if (htableConPo.isStaticMethod) {
					scanner._stataicMethod(row, FiledMethod.STATAIC_AFTER_FLAG);
				}
				if (!scanner.isError && scanner.isGroupBy) {
					scanner.addGroupByRow(row);
				}
				if (htableConPo.isStaticMethod) {
					scanner._stataicMethod(row, FiledMethod.STATAIC_BEFOR_FLAG);
				}
			}
			rows.removeAll(frows);
			frows.clear();
			if (filterExp != null && (filterType & 1) == 1) {// 标准过滤后
				filterDataExpr(queryStatus, rows, filterEXpr, filterExp, exprVar, macroVariableMap);
			}
			if (returnData == 1) {
				Object[][] data = rows.toArray(new Object[rows.size()][]);
				if (orderByColumn != null && !orderByColumn.equals("")) { // 排序
					HTableDataSortCmp c = new HTableDataSortCmp();
					for (int i = 0; i < queryStatus.enField.length; i++) {
						if (queryStatus.enField[i].equalsIgnoreCase(orderByColumn)) {
							c.index = i;
							c.orderDesc = orderDesc;
							c.cmpType = orderType;
							java.util.Arrays.sort(data, c);
							break;
						}
					}
				}
				mapValue.put("values", data);
			}
			if (returnStatistics == 1 && scanner.isGroupBy) {// 返回汇总数据
				// 添加分组数据到table中
				scanner.addGroupbyRows(groupbyColumn, groupbyStatistics);
				mapValue.put("gvalues", scanner.isError ? "分组字段或方法有误！" : scanner.grows);
			}
			totalQueryTime = (System.nanoTime() - startQryTime) / 1000000;
			mapValue.put("qtime", totalQueryTime);
			LogUtils.info("整个查询用时： " + totalQueryTime + " ms");
		} catch (Exception e) {
			mapValue.put("status", "false");
			mapValue.put("msg", e.getMessage());
		} finally {
			if (null != hqlog) {
				hqlog.setFilterTime(scanner.filterTime);
				hqlog.setPageTime(parallelEndQryTime);
				hqlog.setTotalTime(totalQueryTime);
				hqlog.setIsFirstQy(true);
			}
		}
		return mapValue;
	}

	void filterDataExpr(QueryStatus queryStatus, List<String[]> rows, String filterEXpr, Expression filterExp,
			List<String> exprVar, Map<String, String> macroVariableMap) throws IOException {
		Map<String, Object> env = new HashMap<String, Object>();
		for (String expVar : exprVar) {
			String value = macroVariableMap.get(expVar);
			if (value == null) {
				value = MacroVariable.getVarValue(expVar);
			}
			if (value == null) {
				value = "";
				LogUtils.warn("宏变量{" + expVar + "}未获取到输入值：" + filterEXpr);
			}
			env.put(expVar, HTableScanner.convertToExecEnvObj(value));
		}
		List<String[]> frows = new ArrayList<String[]>();
		for (String[] row : rows) {
			for (int i = 0; i < row.length - 1; i++) {// 去年rowkey
				env.put(queryStatus.enField[i], HTableScanner.convertToExecEnvObj(row[i]));
			}
			Object obj = filterExp.execute(env);
			if (!scanner.getEexcBoolean(obj, row, macroVariableMap)) {
				frows.add(row);
			}
		}
		rows.removeAll(frows);
		frows.clear();
	}
}
