package com.ery.meta.module.hBaseQuery;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HColumnDescriptor;
import org.apache.hadoop.hbase.HTableDescriptor;
import org.apache.hadoop.hbase.client.HBaseAdmin;
import org.apache.hadoop.hbase.client.Put;
import org.apache.hadoop.hbase.util.Bytes;

import com.ery.meta.common.Page;

import com.ery.hadoop.hq.datasource.DataSourceInit;
import com.ery.hadoop.hq.table.action.HBaseDataSourceManager;
import com.ery.hadoop.hq.table.action.HBaseTableDLLAction;
import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.hadoop.hq.ws.Constant;
import com.ery.base.support.common.BusinessException;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**
 * 

 * 

 * @description 表管理的 Action
 * @date 2013-4-22
 */
public class HBTableAction {
	private HBTableDao hbTableDao;

	/**
	 * 查询表信息列表
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryDataTableInfo(Map<String, Object> data) {
		List<Map<String, Object>> list = this.hbTableDao.queryHBTableInfo(data);
		return list;
	}

	/**
	 * 查询源数据列表
	 * 
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryHBTableInfo(Map<String, Object> data, Page page) {
		if (page == null) {
			page = new Page(0, 20);
		}
		List<Map<String, Object>> list = this.hbTableDao.queryHBTableInfo(data, page);
		return list;
	}

	/**
	 * 变更表状态
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> changeTableState(Map<String, Object> data) {
		long tableId = Convert.toLong(data.get("HB_TABLE_ID"));
		int state = Convert.toInt(data.get("STATE"));
		Map<String, Object> ret = new HashMap<String, Object>();
		try {
			if (state == 0) {
				// 有效

			} else if (state == 1) {
				// 无效，是否需要做验证
				int i = this.checkCluster(tableId, 0);
				if (i > 0) {
					ret.put("flag", 0);
					ret.put("msg", "该表已被有效规则使用,不能设置为无效！");
					return ret;
				}
			}
			BaseDAO.beginTransaction();
			hbTableDao.changeTableState(tableId, state);
			BaseDAO.commit();
			ret.put("flag", 1);
		} catch (Exception e) {
			ret.put("flag", 0);
			ret.put("msg", e.getMessage());
			e.printStackTrace();
			LogUtils.error(null, e);
			BaseDAO.rollback();
		}
		return ret;
	}

	/**
	 * 查询规则信息
	 * 
	 * @param
	 * @return Map
	 */
	public Map<String, Object> getCluster(long tableId) {
		Map<String, Object> clusterInfo = hbTableDao.getHBTable(tableId);
		clusterInfo.put("paramDatas", hbTableDao.getParamListById(tableId));
		return clusterInfo;
	}

	/**
	 * 查询全部规则信息
	 * 
	 * @param
	 * @return Map
	 */
	public Map<String, Object> getClusterInfo(long tableId) {
		Map<String, Object> clusterInfo = hbTableDao.getHBTable(tableId);
		clusterInfo.put("paramClusterDatas", hbTableDao.getClusterParamListById(tableId));
		clusterInfo.put("ClusterDatas", hbTableDao.getParamListById(tableId));
		return clusterInfo;
	}

	/**
	 * 保存修改分类信息
	 * 
	 * @param data
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> saveClusterInfo(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		List<Map<String, Object>> paramDatas = (List<Map<String, Object>>) data.get("paramDatas");
		long tableId = Convert.toLong(data.get("TABLE_ID"), 0L);
		try {
			BaseDAO.beginTransaction();
			hbTableDao.deleteCluster(tableId); // 删除列簇信息
			Set<Long> saveClusterIdSet = new HashSet<Long>();
			for (Map<String, Object> mapTmp : paramDatas) {
				long clusterId = Convert.toLong(mapTmp.get("clusterId"), 0L);
				if (0l != clusterId) {
					saveClusterIdSet.add(clusterId);
				}
			}

			List<Map<String, Object>> lst = hbTableDao.getColumnInfoById(tableId);
			List<Long> lstDelColumnId = new ArrayList<Long>();
			for (Map<String, Object> mapColumn : lst) {
				long bclusterId = Convert.toLong(mapColumn.get("CLUSTER_ID"), -1L);
				long bcolumnId = Convert.toLong(mapColumn.get("COLUMN_ID"), -1L);
				if (-1L != bclusterId && -1L != bcolumnId && !saveClusterIdSet.contains(bclusterId)) {
					lstDelColumnId.add(bcolumnId);
				}
			}

			hbTableDao.deleteColumn(lstDelColumnId);

			// 保存参数信息
			if (paramDatas.size() > 0) {
				hbTableDao.saveCluster(paramDatas, tableId);
			}

			// 修改HBase中的列簇
			List<Map<String, Object>> lsts = this.getHBTableInfoById(tableId);
			Set<String> lstClusterName = new HashSet<String>();
			String tmpName = null;
			String dataSourceId = null;
			String tableName = null;
			boolean isFirst = true;
			for (Map<String, Object> map : lsts) {
				tmpName = Convert.toString(map.get("HB_CLUSTER_NAME"), null);
				if (isFirst) {
					dataSourceId = Convert.toString(map.get("DATA_SOURCE_ID"), null);
					tableName = Convert.toString(map.get("HB_TABLE_NAME"), null);
					isFirst = false;
				}
				if (null != tmpName) {
					lstClusterName.add(tmpName);
				}
			}

			if (lstClusterName.size() <= 0) {
				BaseDAO.rollback();
				result.put("flag", 2);
			} else {
				// 在HBase中 修改表
				HBaseTableDLLAction.modifyTable(tableName, -1,
						HBaseDataSourceManager.getInstance().getConfiguration(dataSourceId), lstClusterName);
				BaseDAO.commit();
				result.put("flag", 1);
			}
		} catch (Exception e) {
			e.printStackTrace();
			LogUtils.error(null, e);
			BaseDAO.rollback();
			result.put("flag", 0);
		}

		// 重新加载查询规则
		Object flag = result.get("flag");
		if (flag != null && "1".equals(flag.toString())) {
			this.reloadQueryRule(tableId);
		}
		return result;
	}

	private void reloadQueryRule(long tableId) {
		List<Map<String, Object>> lstRule = hbTableDao.queryQRYRuleByTableId(tableId);
		for (Map<String, Object> map : lstRule) {
			long qryRuleId = StringUtil.objectToLong(map.get("QRY_RULE_ID"), -1l);
			DataSourceInit.reLoadQueryRule(qryRuleId, null);// 重新加载规则ID
		}
	}

	/**
	 * 
	 * @param dataSourceId
	 * @return
	 */
	public List<String> queryTableByDataSourceId(String dataSourceId) {
		List<String> lstTableName = new ArrayList<String>();
		try {
			lstTableName = HBaseTableDLLAction.queryTable(HBaseDataSourceManager.getInstance().getConfiguration(
					dataSourceId));
			if (lstTableName.size() <= 0) {
				return lstTableName;
			}

			List<Map<String, Object>> lstValue = this.hbTableDao.getHBTableInfoByDataSourceId(StringUtil.stringToLong(
					dataSourceId, -1));
			for (Map<String, Object> perValue : lstValue) {
				Object tempTBName = perValue.get("HB_TABLE_NAME");
				if (tempTBName instanceof String) {
					if (lstTableName.contains(tempTBName)) {
						lstTableName.remove(tempTBName);
					}
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		}

		return lstTableName;
	}

	/**
	 * 查询表对应的分类信息
	 * 
	 * @param dataSourceId
	 * @param tableName
	 * @return
	 */
	public List<String> queryClusterNameByTableId(String dataSourceId, String tableName) {
		List<String> lstClusterName = null;
		try {
			lstClusterName = HBaseTableDLLAction.queryTableCluster(tableName, HBaseDataSourceManager.getInstance()
					.getConfiguration(dataSourceId));
		} catch (Exception e) {
			e.printStackTrace();
		}

		return lstClusterName;
	}

	/**
	 * 保存修改列信息
	 * 
	 * @param data
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> saveClusterInfoTable(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		List<Map<String, Object>> paramDatas = (List<Map<String, Object>>) data.get("paramDatas");
		long tableId = Convert.toLong(data.get("TABLE_ID"), 0L);
		try {
			BaseDAO.beginTransaction();
			hbTableDao.deleteClusterColumn(tableId); // 删除源码信息
			// 保存参数信息
			// if(paramDatas.size() > 0){
			// hbTableDao.saveClusterComlumn(paramDatas,tableId);
			// }

			List<Map<String, Object>> temp = new ArrayList<Map<String, Object>>();
			Map<Object, String> tmpMapMaxName = new HashMap<Object, String>();
			for (Map<String, Object> map : paramDatas) {
				Object obj = map.get("hbName");
				if (null == obj || obj.toString().length() <= 0 || "null".equals(obj)) {
					temp.add(map);
				} else {// 获取最大的名称
					String tempName = obj.toString();
					map.put("HB_COLUMN_NAME", tempName);
					Object clusterId = map.get("clName");
					Object maxName = tmpMapMaxName.get(clusterId);
					if (maxName == null) {
						tmpMapMaxName.put(clusterId, tempName);
						continue;
					}
					maxName = hbTableDao.getMaxName(tempName, maxName.toString());
					tmpMapMaxName.put(clusterId, maxName.toString());
				}
			}

			for (Map<String, Object> map : temp) {
				String maxName = tmpMapMaxName.get(map.get("clName"));
				maxName = hbTableDao.getNextName(maxName, "a", 1);
				tmpMapMaxName.put(map.get("clName"), maxName);
				map.put("HB_COLUMN_NAME", maxName);
			}

			// 保存列信息
			for (int i = 0; i < paramDatas.size(); i++) {
				Map<String, Object> columnInfo = paramDatas.get(i);
				columnInfo.put("HB_TABLE_ID", tableId);
				hbTableDao.saveColumn(columnInfo);
			}

			result.put("flag", 1);
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error(null, e);
			BaseDAO.rollback();
			result.put("flag", 0);
		}

		// 重新加载查询规则
		Object flag = result.get("flag");
		if (flag != null && "1".equals(flag.toString())) {
			this.reloadQueryRule(tableId);
		}

		return result;
	}

	/**
	 * 判断表是否存在
	 * 
	 * @param tableName
	 * @param dsId
	 * @return
	 */
	public Map<String, Object> isExistsTables(String tableName, String dsId) {
		Map<String, Object> ret = new HashMap<String, Object>();
		try {
			HBaseAdmin admin = new HBaseAdmin(HBaseDataSourceManager.getInstance().getConfiguration(
					String.valueOf(dsId)));
			ret.put("flag", admin.tableExists(tableName));
		} catch (Exception e) {
			ret.put("err", e.getMessage());
		}
		return ret;
	}

	/**
	 * 保存Hbase表信息
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> saveHbTable(Map<String, Object> data) {
		Map<String, Object> ret = new HashMap<String, Object>();
		long tblId = 0;
		int timeToLive = -1;
		try {
			int tblMode = Convert.toInt(data.get("TBL_MODE"));
			tblId = Convert.toLong(data.get("HB_TABLE_ID"), 0);
			timeToLive = Convert.toInt(data.get("TABLE_TTL"), -1);
			if (tblId == 0) {
				tblId = hbTableDao.queryForNextVal("SEQ_HB_MANAGER_ID");
				data.put("HB_TABLE_ID", tblId);
			}

			List<List<Object>> fields = (List<List<Object>>) data.get("FIELDS");// 字段信息（二维数组）
			Map<String, List<Map<String, Object>>> cfHb = (Map<String, List<Map<String, Object>>>) data.get("CF_HB");// 拆分合并关系
			Map<String, Object> oldTMap = (Map<String, Object>) data.get("OLD_T_MAP");// 修改时，原列簇信息

			// 为拆分合并列计算一个临时hbId
			Map<String, String> fmMap = new HashMap<String, String>();
			for (String t : cfHb.keySet()) {
				int i = 1;
				for (Map<String, Object> o : cfHb.get(t)) {
					for (String f : o.keySet()) {
						String fm = Convert.toString(o.get(f), "");
						if ("".equals(fm)) {
							fm = i + "";
						}
						fmMap.put(t + "=" + f, fm);
					}
					i++;
				}
			}

			// 将数组分组归并
			LinkedHashMap<String, LinkedHashMap<String, LinkedHashMap<String, String[]>>> fieldMap = new LinkedHashMap<String, LinkedHashMap<String, LinkedHashMap<String, String[]>>>();
			int i = 0;
			for (List<Object> o : fields) {
				String hbTName = Convert.toString(o.get(0));
				String tname = Convert.toString(o.get(1));
				String tms = Convert.toString(o.get(2));
				String fbm = Convert.toString(o.get(3));
				String fzn = Convert.toString(o.get(4));
				String hbFName = Convert.toString(o.get(5));
				String cf = Convert.toString(o.get(6));
				LinkedHashMap<String, LinkedHashMap<String, String[]>> tmap = fieldMap.get(hbTName);
				if (tmap == null) {
					i = -1;
					tmap = new LinkedHashMap<String, LinkedHashMap<String, String[]>>();
					fieldMap.put(hbTName, tmap);
				}
				if ("".equals(hbFName)) {
					hbFName = Convert.toString(fmMap.get(hbTName + "=" + fbm), "");
				}
				if ("".equals(hbFName)) {
					hbFName = i + "";
				}

				LinkedHashMap<String, String[]> fmap = tmap.get(hbFName);
				if (fmap == null) {
					fmap = new LinkedHashMap<String, String[]>();
					tmap.put(hbFName, fmap);
				}
				fmap.put(fbm, new String[] { hbTName, tname, tms, fbm, fzn, Convert.toString(o.get(5)), cf });
				i--;
			}

			// 组织保存的信息
			Set<String> newCluName = new HashSet<String>();
			List<Map<String, Object>> fieldList = new ArrayList<Map<String, Object>>();
			String cluName = null;
			int tod = 1;
			for (String t : fieldMap.keySet()) {
				if (tblMode == 1 && oldTMap.containsKey(t)) {
					oldTMap.remove(t);
				}
				Map<String, Object> clu = new HashMap<String, Object>();
				LinkedHashMap<String, LinkedHashMap<String, String[]>> hbmap = fieldMap.get(t);
				List<Map<String, Object>> cols = new ArrayList<Map<String, Object>>();
				int fod = 1;
				String colName = null;
				for (String hbf : hbmap.keySet()) {
					Map<String, Object> col = new HashMap<String, Object>();
					String enName = "";
					String chName = "";
					int j = 1;
					for (String f : hbmap.get(hbf).keySet()) {
						String[] o = hbmap.get(hbf).get(f);
						long cluId = Convert.toLong(clu.get("CLUSTER_ID"), 0);
						if (cluId == 0) {
							cluId = hbTableDao.queryForNextVal("SEQ_HB_CLUSTER_ID");
							clu.put("CLUSTER_ID", cluId);
							clu.put("DEFINE_CLUSTER_NAME", o[1]);
							clu.put("DEFINE_CLUSTER_MSG", o[2]);
							clu.put("ORDER_ID", tod);
							clu.put("HB_TABLE_ID", tblId);
							if (StringUtil.isNum(o[0])) {
								if (cluName == null && tblMode == 1) {
									cluName = hbTableDao.queryLastClusterName(clu, "f1");
								} else {
									cluName = hbTableDao.getNextName(cluName, "f1", 0);
								}
								clu.put("HB_CLUSTER_NAME", cluName);
								newCluName.add(cluName);
							} else {
								clu.put("HB_CLUSTER_NAME", o[0]);
								newCluName.add(o[0]);
							}
						}
						if (j == 1) {
							col.put("CLUSTER_ID", cluId);
							col.put("COL_SPLIT", o[6]);
							col.put("ORDER_ID", fod);
							col.put("HB_TABLE_ID", tblId);
							if (StringUtil.isNum(o[5]) || "".equals(o[5])) {
								if (colName == null && tblMode == 1) {
									colName = hbTableDao.queryLastColumnName(tblId,
											Convert.toString(clu.get("HB_CLUSTER_NAME")), "a");
								} else {
									colName = hbTableDao.getNextName(colName, "a", 1);
								}
								col.put("HB_COLUMN_NAME", colName);
							} else {
								col.put("HB_COLUMN_NAME", o[5]);
							}
						}
						enName += o[3] + ",";
						chName += o[4] + ",";
						j++;
					}
					enName = enName.substring(0, enName.length() - 1);
					chName = chName.substring(0, chName.length() - 1);
					col.put("DEFINE_EN_COLUMN_NAME", enName);
					col.put("DEFINE_CH_COLUMN_NAME", chName);
					cols.add(col);
					fod++;
				}
				clu.put("COLS", cols);
				fieldList.add(clu);
				tod++;
			}

			BaseDAO.beginTransaction();

			// 将几个大小数据转换为 b（界面设置单位为kb或mb）
			data.put("BLOCK_SIZE", Convert.toInt(data.get("BLOCK_SIZE"), 64) * 1024);
			data.put("HFILE_MAXVAL", Convert.toLong(data.get("HFILE_MAXVAL"), 256) * 1024 * 1024);
			data.put("MEMSTORE_FLUSH", Convert.toLong(data.get("MEMSTORE_FLUSH"), 64) * 1024 * 1024);
			// 保存表数据
			hbTableDao.saveHbTableInfo(data, tblMode);
			// 保存字段数据（先删再加)
			if (tblMode == 1) {
				hbTableDao.deleteFieldInfo(tblId);
			}
			hbTableDao.saveFieldInfos(fieldList);

			if (tblMode != -1) {
				// throw new BusinessException("主动调试异常!");
			}

			if (tblMode == 0) {
				HBaseTableDLLAction.createTable(
						Convert.toString(data.get("HB_TABLE_NAME")),
						timeToLive,
						HBaseDataSourceManager.getInstance().getConfiguration(
								Convert.toString(data.get("DATA_SOURCE_ID"))), newCluName.toArray(new String[0]), data);
			} else if (tblMode == 1) {
				HBaseTableDLLAction.modifyTable(
						Convert.toString(data.get("HB_TABLE_NAME")),
						timeToLive,
						HBaseDataSourceManager.getInstance().getConfiguration(
								Convert.toString(data.get("DATA_SOURCE_ID"))), newCluName.toArray(new String[0]), data);
			}

			BaseDAO.commit();
			List<Map<String, Object>> lstQry = hbTableDao.getQryNameByTblId(tblId);
			String qryNames = "";
			if (lstQry != null) {
				for (Map<String, Object> mapQry : lstQry) {
					qryNames += "<br> " + MapUtils.getString(mapQry, "QRY_RULE_NAME");
				}
			}
			ret.put("flag", 1);
			ret.put("qryNames", qryNames);
		} catch (Exception e) {
			BaseDAO.rollback();
			ret.put("flag", e.getMessage());
			LogUtils.error(null, e);
		}

		// 重新加载查询规则
		Object flag = ret.get("flag");
		if (flag != null && "1".equals(flag.toString())) {
			this.reloadQueryRule(tblId);
		}
		return ret;
	}

	/**
	 * 获取Hbase表信息
	 * 
	 * @param tblId
	 * @return
	 */
	public Map<String, Object> getHbTabInfo(long tblId) {
		Map<String, Object> ret = hbTableDao.getHBTable(tblId);
		try {
			ret.put("BLOCK_SIZE", Convert.toInt(ret.get("BLOCK_SIZE"), 65536) / 1024);
			ret.put("HFILE_MAXVAL", Convert.toLong(ret.get("HFILE_MAXVAL"), 268435456) / (1024 * 1024));
			ret.put("MEMSTORE_FLUSH", Convert.toLong(ret.get("MEMSTORE_FLUSH"), 67108864) / (1024 * 1024));

			List<Map<String, Object>> clusters = hbTableDao.getClusterParamListById(tblId);
			List<List<Object>> fields = new ArrayList<List<Object>>();
			Map<String, Object> hbMap = new HashMap<String, Object>();
			for (Map<String, Object> cluster : clusters) {
				String tm = Convert.toString(cluster.get("HB_CLUSTER_NAME"));
				hbMap.put(tm, 1);
				String tbm = Convert.toString(cluster.get("DEFINE_CLUSTER_NAME"));
				String tms = Convert.toString(cluster.get("DEFINE_CLUSTER_MSG"), "");
				String fm = Convert.toString(cluster.get("HB_COLUMN_NAME"));
				String fbm = Convert.toString(cluster.get("DEFINE_EN_COLUMN_NAME"));
				String fms = Convert.toString(cluster.get("DEFINE_CH_COLUMN_NAME"));
				String cff = Convert.toString(cluster.get("COL_SPLIT"), "");
				if (!"".equals(cff)) {
					String[] fbmArr = fbm.split(",");
					String[] fmsArr = null;
					if (!"".equals(fms)) {
						fmsArr = fms.split(",");
					} else {
						fmsArr = new String[fbmArr.length];
					}
					if (fbmArr.length == fmsArr.length) {
						for (int i = 0; i < fbmArr.length; i++) {
							List<Object> of = new ArrayList<Object>();
							of.add(tm);
							of.add(tbm);
							of.add(tms);
							of.add(fbmArr[i]);
							of.add(Convert.toString(fmsArr[i], ""));
							of.add(fm);
							of.add(cff);
							fields.add(of);
						}
					} else {
						throw new BusinessException("数据错误，字段别名、字段中文名拆分后长度不对应!" + "<br>别名:" + fbm + "<br>中文名:" + fms);
					}
				} else {
					List<Object> of = new ArrayList<Object>();
					of.add(tm);
					of.add(tbm);
					of.add(tms);
					of.add(fbm);
					of.add(fms);
					of.add(fm);
					of.add(cff);
					fields.add(of);
				}
			}

			ret.put("FIELDS", fields);
			ret.put("HB_MAP", hbMap);
		} catch (Exception e) {
			ret.put("err", e.getMessage());
		}
		return ret;
	}

	/**
	 * 保存创建表信息
	 * 
	 * @param data
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> saveManagerTable(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		List<Map<String, Object>> clusterNameIdList = new ArrayList<Map<String, Object>>();
		String managerName = Convert.toString(data.get("managerTableName"), "");
		String msg = Convert.toString(data.get("managerTableMsg"), "");
		int dataSourceId = Convert.toInt(data.get("dataSourceId"), -1);
		List<Map<String, Object>> paramTable1Datas = (List<Map<String, Object>>) data.get("paramTable1Datas");
		List<Map<String, Object>> paramTable2Datas = (List<Map<String, Object>>) data.get("paramTable2Datas");
		Set<String> lstClusterName = new HashSet<String>();
		int regflag = Convert.toInt(data.get("reg"), 0);
		int timeToLive = -1;
		timeToLive = Convert.toInt(data.get("TABLE_TTL"), -1);
		try {
			// 在HBase中创建表
			if (regflag != 1) {
				List<String> tableNames = HBaseTableDLLAction.queryTable(HBaseDataSourceManager.getInstance()
						.getConfiguration(String.valueOf(dataSourceId)));
				for (String tableName : tableNames) {
					if (tableName.equals(managerName)) {
						result.put("flag", 3);
						return result;
					}
				}
			}
			BaseDAO.beginTransaction();
			// 第一步，保存表信息
			long pk = hbTableDao.saveManagerTable(dataSourceId, managerName, msg);

			// 第二步，保存列的分类信息
			String columnName = null;
			for (int i = 0; i < paramTable1Datas.size(); i++) {
				Map<String, Object> clusterInfo = paramTable1Datas.get(i);
				clusterInfo.put("HB_TABLE_ID", pk);
				if (regflag != 1) {
					if (i == 0) {
						columnName = hbTableDao.queryLastClusterName(clusterInfo, "f1");
					} else {
						columnName = hbTableDao.getNextName(columnName, "f1", 0);
					}
				} else {
					columnName = clusterInfo.get("columnName").toString();
				}

				clusterInfo.put("HB_CLUSTER_NAME", columnName);
				lstClusterName.add(columnName);
				Map<String, Object> clusterNameId = hbTableDao.saveCluster(clusterInfo);
				clusterNameIdList.add(clusterNameId);
			}

			// 第三步，保存列信息
			Map<Long, String> mapTmp = new HashMap<Long, String>();
			for (int i = 0; i < paramTable2Datas.size(); i++) {
				Map<String, Object> columnInfo = paramTable2Datas.get(i);
				columnInfo.put("HB_TABLE_ID", pk);
				long clusterId = 0L;
				for (Map<String, Object> map : clusterNameIdList) {
					if (map.get(columnInfo.get("paramColumnNameCL")) == null) {
						continue;
					}
					clusterId = (Long) map.get(columnInfo.get("paramColumnNameCL"));
					if (clusterId != 0L)
						continue;
				}
				columnInfo.put("CLUSTER_ID", clusterId);

				if (regflag != 1) {
					if (mapTmp.get(clusterId) == null) {
						columnName = hbTableDao.queryLastColumnName(columnInfo, "a");
						mapTmp.put(clusterId, columnName);
					} else {
						columnName = hbTableDao.getNextName(mapTmp.get(clusterId), "a", 1);
						mapTmp.put(clusterId, columnName);
					}
				} else {
					columnName = columnInfo.get("paramColumnNameCO").toString();
					mapTmp.put(clusterId, columnName);
				}

				columnInfo.put("HB_COLUMN_NAME", columnName);
				hbTableDao.saveColumn(columnInfo);
			}

			result.put("flag", 1);

			// 在HBase中创建表
			if (regflag != 1) {
				HBaseTableDLLAction.createTable(managerName, timeToLive, HBaseDataSourceManager.getInstance()
						.getConfiguration(String.valueOf(dataSourceId)), lstClusterName);
			} else {
				HBaseTableDLLAction.modifyTable(managerName, timeToLive, HBaseDataSourceManager.getInstance()
						.getConfiguration(String.valueOf(dataSourceId)), lstClusterName);
			}
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error(null, e);
			BaseDAO.rollback();
			result.put("flag", 0);
			return result;
		}

		return result;
	}

	/**
	 * 下载表信息
	 */
	public byte[] downloadCluster(long tableId) {
		if (hbTableDao == null) {
			hbTableDao = new HBTableDao();
		}
		List<Map<String, Object>> map = hbTableDao.getClusterParamListById(tableId);
		StringBuffer sb = new StringBuffer("序号,分类名称,分类别名,列名称,列英文别名,列中文别名\r\n");
		for (Map<String, Object> tmap : map) {
			sb.append((tmap.get("ORDER_ID") == null ? "" : tmap.get("ORDER_ID"))
					+ ","
					+ (tmap.get("HB_CLUSTER_NAME") == null ? "" : tmap.get("HB_CLUSTER_NAME"))
					+ ","
					+ (tmap.get("DEFINE_CLUSTER_NAME") == null ? "" : tmap.get("DEFINE_CLUSTER_NAME"))
					+ ","
					+ (tmap.get("HB_COLUMN_NAME") == null ? "" : tmap.get("HB_COLUMN_NAME"))
					+ ","
					+ (tmap.get("DEFINE_EN_COLUMN_NAME") == null ? "" : tmap.get("DEFINE_EN_COLUMN_NAME").toString()
							.replace(",", ":"))
					+ ","
					+ (tmap.get("DEFINE_CH_COLUMN_NAME") == null ? "" : tmap.get("DEFINE_CH_COLUMN_NAME").toString()
							.replace(",", ":")) + "\r\n");
		}
		return sb.toString().getBytes();
	}

	/**
	 * 删除表信息
	 */
	public Map<String, Object> deleteCluster(long tableId) {
		Map<String, Object> result = new HashMap<String, Object>();
		Map<String, Object> tableInfo = hbTableDao.getHBTable(tableId);
		if (tableId != 0L) {
			try {
				BaseDAO.beginTransaction();
				// 第一步，删除列信息
				hbTableDao.deleteColumn(tableId);

				// 第二步 删除需要的列族信息
				hbTableDao.deleteCluster(tableId);

				// 第三步 删除表信息
				hbTableDao.deleteManagerTable(tableId);

				result.put("flag", 1);

				// 在HBase中删除表
				Object tableName = tableInfo.get("HB_TABLE_NAME");
				Object dataSourceId = tableInfo.get("DATA_SOURCE_ID");
				if (null == tableName || null == dataSourceId) {
					return result;
				}

				HBaseTableDLLAction.deleteTable(tableName.toString(), HBaseDataSourceManager.getInstance()
						.getConfiguration(dataSourceId.toString()));
				BaseDAO.commit();
			} catch (Exception e) {
				LogUtils.error(null, e);
				BaseDAO.rollback();
				result.put("flag", 0);
				return result;
			}
		}

		return result;
	}

	/**
	 * 根据规则ID查询表的信息
	 * 
	 * @param qryId
	 * @return
	 */
	public Map<String, Object> getHBTableInfoByQryId(long qryId) {
		Map<String, Object> map = hbTableDao.getHBTableInfoByQryId(qryId);
		return map;
	}

	/**
	 * 根据资源ID和表ID查询表的信息
	 * 
	 * @param dataSourceId
	 * @param tableId
	 * @return
	 */
	public int getHBTableInfoById(long dataSourceId, long tableId) {
		return hbTableDao.getHBTableInfoById(dataSourceId, tableId);
	}

	/**
	 * 根据表的信息(列簇和列)
	 * 
	 * @param tableId
	 * @return
	 */
	public List<Map<String, Object>> getHBTableInfoById(long tableId) {
		return hbTableDao.getHBTableInfoById(tableId);
	}

	/**
	 * 查询全部规则信息
	 * 
	 * @param
	 * @return Map
	 */
	public Map<String, Object> getColmnsInfo(long tableId) {
		Map<String, Object> clusterInfo = hbTableDao.getHBTable(tableId);
		List<Map<String, Object>> listmap = hbTableDao.getClusterParamListById(tableId);
		List<Map<String, Object>> newListmap = new ArrayList<Map<String, Object>>();
		clusterInfo.put("paramClusterDatas", newListmap);
		Map<String, String> colmns = new LinkedHashMap<String, String>();
		String colmnnames = "'',rowkey";
		String colmnwitdh = "3,20";
		colmns.put("OPP", "{#checkBox}");
		colmns.put("rowkey", "ROWKEY");
		for (Map<String, Object> tmap : listmap) {
			String tmp[] = tmap.get("DEFINE_EN_COLUMN_NAME").toString().split(",");
			for (int i = 0; i < tmp.length; i++) {
				colmns.put(tmp[i], tmp[i]);
				colmnnames += "," + tmp[i];
				colmnwitdh += "," + 10;
			}

			if (tmp.length == 1) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.putAll(tmap);
				newListmap.add(map);
			} else {
				for (int i = 0; i < tmp.length; i++) {
					Map<String, Object> map = new HashMap<String, Object>();
					map.putAll(tmap);
					map.put("DEFINE_EN_COLUMN_NAME", tmp[i]);
					newListmap.add(map);
				}
			}
		}
		clusterInfo.put("columns", colmns);
		clusterInfo.put("columnwitdh", colmnwitdh);
		clusterInfo.put("columnnames", colmnnames);
		return clusterInfo;
	}

	/**
	 * 查询源数据列表
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, String>> queryListMapHBTableData(Map<String, Object> data, String startRowkey, int count) {
		String dataSourceId = data.get("dataSourceId").toString();
		String tableName = data.get("tableName").toString();
		int tableid = MapUtils.getInteger(data, "tableid", -1);

		List<Map<String, String>> list = new ArrayList<Map<String, String>>();
		List<Map<String, Object>> listmap = hbTableDao.getClusterParamListById(tableid);
		Map<String, String[][]> map = new HashMap<String, String[][]>();
		for (Map<String, Object> tmap : listmap) {
			String[][] tmp = new String[2][];
			tmp[0] = tmap.get("COL_SPLIT") == null ? new String[0] : new String[] { tmap.get("COL_SPLIT").toString() };
			tmp[1] = tmap.get("DEFINE_EN_COLUMN_NAME").toString().split(",");
			map.put(tmap.get("HB_CLUSTER_NAME").toString() + "_" + tmap.get("HB_COLUMN_NAME").toString(), tmp);
		}
		try {
			list = HBaseTableDLLAction.queryData(tableName, startRowkey, count, HBaseDataSourceManager.getInstance()
					.getConfiguration(dataSourceId), map);
			// System.out.println(list);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return list;
	}

	/**
	 * 查询源数据列表
	 * 
	 * @param
	 * @return
	 */
	public Map<String, Object> queryHBTableData(String tablename, String startRowkey, String endRowkey, int count,
			int dataSourceId) {
		List<List<String>> lst = new ArrayList<List<String>>();
		if (this.hbTableDao == null) {
			this.hbTableDao = new HBTableDao();
		}

		Configuration conf = HBaseDataSourceManager.getInstance().getConfiguration(String.valueOf(dataSourceId));
		if (null == conf) {
			return null;
		}

		Map<String, Object> resultMap = new HashMap<String, Object>();
		List<Map<String, Object>> map1 = this.hbTableDao.getClusterParamListById(tablename, dataSourceId);
		try {
			String[] columns = new String[map1.size()];
			String[] enFiled = new String[map1.size()];
			String[] chFiled = new String[map1.size()];
			int index = 0;
			for (Map<String, Object> map : map1) {
				columns[index] = map.get("HB_CLUSTER_NAME") + ":" + map.get("HB_COLUMN_NAME");
				enFiled[index] = (String) map.get("DEFINE_EN_COLUMN_NAME");
				chFiled[index] = (String) map.get("DEFINE_CH_COLUMN_NAME");
				index++;
			}

			HBaseTableDLLAction.queryData(lst, tablename, columns, enFiled, chFiled, startRowkey, endRowkey, count,
					conf);
			Map<String, Object> tmpMap = new HashMap<String, Object>();
			resultMap.put(Constant.RESULT_NAME, tmpMap);
			tmpMap.put(Constant.VALUES_NAME, lst);

			List<String> lst1 = new ArrayList<String>();
			tmpMap.put(Constant.ENFIELD_NAME, lst1);
			for (int i = 0; i < enFiled.length; i++) {
				lst1.add(enFiled[i]);
			}
			lst1.add(Constant.ROWKEY_NAME);

			List<String> lst2 = new ArrayList<String>();
			tmpMap.put(Constant.CHFIELD_NAME, lst2);
			for (int i = 0; i < chFiled.length; i++) {
				lst2.add(chFiled[i]);
			}
			lst2.add(Constant.ROWKEY_NAME);
			tmpMap.put(Constant.CURRENTCOUNT_NAME, lst.size());
		} catch (IOException e) {
			e.printStackTrace();
		}
		return resultMap;
	}

	/**
	 * 修改数据列表
	 * 
	 * @param
	 * @return
	 * @throws InterruptedException
	 * @throws IOException
	 */
	public boolean editorHBTableData(String tablename, List<Map<String, Object>> lst, int dataSourceId)
			throws IOException, InterruptedException {
		if (this.hbTableDao == null) {
			this.hbTableDao = new HBTableDao();
		}

		Configuration conf = HBaseDataSourceManager.getInstance().getConfiguration(String.valueOf(dataSourceId));
		if (null == conf) {
			return false;
		}

		List<Map<String, Object>> map1 = this.hbTableDao.getClusterParamListById(tablename, dataSourceId);
		Map<String, Object> fieldMap = new HashMap<String, Object>();
		for (Map<String, Object> map : map1) {
			String name[] = new String[2];
			name[0] = (String) map.get("HB_CLUSTER_NAME");
			name[1] = (String) map.get("HB_COLUMN_NAME");
			fieldMap.put(map.get("DEFINE_EN_COLUMN_NAME").toString(), name);
		}

		HBaseTableDLLAction.putsData(tablename, fieldMap, lst, conf);
		return true;
	}

	/**
	 * 修改数据列表
	 * 
	 * @param
	 * @return
	 * @throws InterruptedException
	 * @throws IOException
	 */
	public boolean deleteHBTableData(String tablename, List<String> lst, int dataSourceId) throws IOException,
			InterruptedException {
		if (this.hbTableDao == null) {
			this.hbTableDao = new HBTableDao();
		}

		Configuration conf = HBaseDataSourceManager.getInstance().getConfiguration(String.valueOf(dataSourceId));
		if (null == conf) {
			return false;
		}

		HBaseTableDLLAction.deleteData(tablename, lst, conf);
		return true;
	}

	public void setHbTableDao(HBTableDao hbTableDao) {
		this.hbTableDao = hbTableDao;
	}

	public String delTableData(Map<String, Object> data) {
		String dataSourceId = data.get("dataSourceId").toString();
		String tableName = data.get("tableName").toString();
		String[] rows = data.get("rowkeys").toString().split(",");
		if (rows.length > 0) {
			try {
				BaseDAO.beginTransaction();
				HBaseTableDLLAction.deleteData(tableName, rows,
						HBaseDataSourceManager.getInstance().getConfiguration(dataSourceId));
				BaseDAO.commit();
			} catch (IOException e) {
				e.printStackTrace();
				BaseDAO.rollback();
				return "0";
			}
		}
		return "1";
	}

	@SuppressWarnings("unchecked")
	public String addTableData(Map<String, Object> data) {
		String dataSourceId = data.get("dataSourceId").toString();
		String tableName = data.get("tableName").toString();
		String rowkey = data.get("rowkey").toString();
		int tableid = MapUtils.getIntValue(data, "tableid", -1);
		if (-1 == tableid) {
			return "0";
		}

		List<Map<String, Object>> listmap = hbTableDao.getClusterParamListById(tableid);
		Map<String, String[][]> tempmap = new HashMap<String, String[][]>();
		for (Map<String, Object> tmap : listmap) {
			String[][] tmp = new String[2][];
			tmp[0] = tmap.get("COL_SPLIT") == null ? new String[0] : new String[] { getUnEscapeSequence(tmap.get(
					"COL_SPLIT").toString()) };
			tmp[1] = tmap.get("DEFINE_EN_COLUMN_NAME").toString().split(",");
			tempmap.put(tmap.get("HB_CLUSTER_NAME").toString() + "_" + tmap.get("HB_COLUMN_NAME").toString(), tmp);
		}

		List<Map<String, Object>> paramTable1Datas = (List<Map<String, Object>>) data.get("datas");
		Map<String, String> mapList = new HashMap<String, String>();
		for (Map<String, Object> map : paramTable1Datas) {
			String columnName = map.get("DEFINE_EN_COLUMN_NAME").toString();
			mapList.put(columnName, map.get("ROW_VALUE").toString());
		}

		List<Put> lstPut = new ArrayList<Put>();
		try {
			for (Map<String, Object> map : paramTable1Datas) {
				String key = map.get("HB_CLUSTER_NAME").toString() + "_" + map.get("HB_COLUMN_NAME").toString();
				String[][] str = tempmap.get(key);
				if (null == str) {
					continue;
				}

				if (str[1].length == 1) {
					HBaseTableDLLAction.addPut(lstPut, rowkey, map.get("HB_CLUSTER_NAME").toString(),
							map.get("HB_COLUMN_NAME").toString(), mapList.get(str[1][0]));
				} else if (str[1].length > 1) {
					String value = "";
					for (int i = 0; i < str[1].length; i++) {
						value += mapList.get(str[1][i]);
						if (str[1].length - 1 != i) {
							value += str[0][0];
						}
					}
					HBaseTableDLLAction.addPut(lstPut, rowkey, map.get("HB_CLUSTER_NAME").toString(),
							map.get("HB_COLUMN_NAME").toString(), value);
				}
			}
			HBaseTableDLLAction.putsData(tableName, lstPut,
					HBaseDataSourceManager.getInstance().getConfiguration(dataSourceId));
		} catch (IOException e) {
			e.printStackTrace();
			return "0";
		} catch (InterruptedException e) {
			e.printStackTrace();
			return "0";
		}

		return "1";
	}

	private static String getUnEscapeSequence(String escape) {
		if (null == escape || escape.trim().length() <= 0) {
			return escape;
		}

		char[] array = escape.toCharArray();
		String temp = "";
		String newValue = "";
		String s = new String("\\");
		for (int i = 0; i < array.length; i++) {
			if (s.equals(String.valueOf(array[i]))) {
				temp += "\\";
				continue;
			}

			if ("\\".equals(temp)) {
				temp = "";
			}

			if ("\\\\".equals(temp)) {
				temp = "\\";
			}

			if (temp.equals(String.valueOf(array[i]))) {
				newValue += temp;
			} else {
				newValue += temp;
				newValue += array[i];
			}
		}

		return newValue;
	}

	public String editTableData(Map<String, Object> data) {

		return "";
	}

	/**
	 * 检查数据表是否被使用
	 * 
	 * @param tableId
	 * @return
	 */
	public int checkCluster(long tableId, int flag) {

		return hbTableDao.checkCluster(tableId, flag);
	}

	/**
	 * 下载建表语句
	 * 
	 * @param tableId
	 * @param tableName
	 * @return
	 * @throws Exception
	 * @throws
	 */
	public byte[] downloadCreateTable(long tableId, String tableName, long dataSourceId) throws Exception {
		if (hbTableDao == null) {
			hbTableDao = new HBTableDao();
		}
		String createTable = "create '" + tableName + "'";
		Configuration conf = HBaseDataSourceManager.getInstance().getConfiguration(String.valueOf(dataSourceId));
		HBaseAdmin admin = new HBaseAdmin(conf);
		HTableDescriptor tableDes = admin.getTableDescriptor(Bytes.toBytes(tableName));
		HColumnDescriptor hColumnDescriptor[] = tableDes.getColumnFamilies();// 得到列簇信息

		for (HColumnDescriptor hcd : hColumnDescriptor) {
			createTable += "," + hcd.toString() + "";
		}
		createTable += "\r\n";

		return createTable.getBytes();
	}

	/**
	 * 验证HBASE表中是否存在该表
	 * 
	 * @param dataSourceId
	 * @param tableName
	 * @return
	 * @throws Exception
	 */
	public int checkHbaseTable(long dataSourceId, String tableName) throws Exception {
		Configuration conf = HBaseDataSourceManager.getInstance().getConfiguration(String.valueOf(dataSourceId));
		HBaseAdmin admin = new HBaseAdmin(conf);
		if (admin.tableExists(tableName)) {
			return 1;
		}
		return 0;
	}
}