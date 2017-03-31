package com.ery.meta.module.hBaseQuery;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ery.meta.common.Page;
import com.ery.meta.module.datarole.UserAuthorDAO;

import com.googlecode.aviator.AviatorEvaluator;
import com.ery.hadoop.hq.datasource.DataSourceInit;
import com.ery.hadoop.hq.datasource.HTableScanner;
import com.ery.hadoop.hq.qureyrule.QueryRuleConditionPO;
import com.ery.hadoop.hq.utils.MacroVariable;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**
 * 

 * 

 * @description 查询规则 Action
 * @date 2013-4-29
 */
public class HBQryRuleAction {

	private HBQryRuleDao hbQryRuleDao;

	private UserAuthorDAO userAuthorDAO;

	private static String[][] codeSign = new String[][] { { "'", "&apos;" } };

	/**
	 * 验证逻辑条件是否满足
	 */

	@SuppressWarnings("unchecked")
	public Boolean isLogicCondition(Map<String, Object> data, String conditionExp) {
		Boolean result = false;
		// 获取选中的列名
		List<Map<String, Object>> testParamDatas = (List<Map<String, Object>>) data.get("testParamData");
		for (int i = 0; i < testParamDatas.size(); i++) {
			Map<String, Object> testParamData = testParamDatas.get(i);
			String col = Convert.toString(testParamData.get("TEST_COLUMN_NAME"));
			String val = Convert.toString(testParamData.get("TEST_COLUMN_VALUE"));
		}

		return result;
	}

	/**
	 * 验证列名是否存在
	 * 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Boolean isColumn(Map<String, Object> data, String conditionExp) {
		Boolean result = false;
		String regExp = "[\\{][a-zA-Z0-9_]+[\\}]"; // 正则表达式

		// 匹配字符串
		Pattern pattern = Pattern.compile(regExp, Pattern.CASE_INSENSITIVE);// 忽略大小写
		Matcher matcher = pattern.matcher(conditionExp);

		StringBuffer buf = new StringBuffer();
		// 获取选中的列名
		List<Map<String, Object>> columnNameInfos = (List<Map<String, Object>>) data.get("columnNameInfo");
		for (int i = 0; i < columnNameInfos.size(); i++) {
			Map<String, Object> columnNameInfo = columnNameInfos.get(i);
			String col = Convert.toString(columnNameInfo.get("COLUMN_NAME"));
			buf.append(col);
		}

		while (matcher.find()) {
			// 替换{}符号
			String temp = matcher.group().replaceAll("[\\{\\}]", "").trim();

			if (buf.toString().contains(temp.toUpperCase())) {
				result = true;
			} else {
				result = false;
				break;
			}
		}
		return result;
	}

	/**
	 * 验证正则表达式条件是否满足
	 */
	@SuppressWarnings("unchecked")
	public Boolean isRegularCondition(Map<String, Object> data, String conditionExp) {
		Boolean result = false;
		// 获取选中的列名
		List<Map<String, Object>> testParamDatas = (List<Map<String, Object>>) data.get("testParamData");
		for (int i = 0; i < testParamDatas.size(); i++) {
			Map<String, Object> testParamData = testParamDatas.get(i);
			String col = Convert.toString(testParamData.get("TEST_COLUMN_NAME"));
			String val = Convert.toString(testParamData.get("TEST_COLUMN_VALUE"));
		}

		return result;
	}

	/**
	 * 查询源数据列表
	 * 
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryDataRuleInfo() {
		List<Map<String, Object>> list = this.hbQryRuleDao.queryHBQryRuleInfo();
		return list;
	}

	/**
	 * 查询源数据列表
	 * 
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryQryRuleInfo(Map<String, Object> data, Page page) {
		List<Map<String, Object>> list = this.hbQryRuleDao.queryHBQryRuleInfo(data, page);
		return list;
	}

	/**
	 * 查询列规则列表
	 * 
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryColumnInfo(Map<String, Object> data, String qryRuleId, Page page) {
		List<Map<String, Object>> list = this.hbQryRuleDao.queryColumnInfo(data, qryRuleId, page);
		Map<String, Object> fistRecord = null;
		boolean isFirst = true;
		List<Map<String, Object>> newlist = new ArrayList<Map<String, Object>>();
		int index = 0;
		for (Map<String, Object> map : list) {
			String clusterENName = (String) map.get("DEFINE_EN_COLUMN_NAME");
			String clusterCHName = (String) map.get("DEFINE_CH_COLUMN_NAME");
			String[] encol = clusterENName.split(",");
			int len = encol.length;
			if (len == 1) {
				String staticsMethod = (String) map.get("STATISTICS_METHOD");
				String staticsFlag = (String) map.get("STATISTICS_FLAG");
				String selectColumn = (String) map.get("SELECT_COLUMN_EN");
				newlist.add(map);
				map.put("COLUMN_ID", clusterENName);
				map.put("ORDER_ID", index + 1);
				map.put("STATISTICS_METHOD", staticsMethod == null ? -1 : staticsMethod);
				map.put("STATISTICS_FLAG", staticsFlag == null ? -1 : staticsFlag);
				map.put("SELECT_COLUMN_EN", selectColumn == null ? "" : selectColumn);
				map.put("RN_", index + 1);
				index++;
				if (isFirst) {
					fistRecord = map;
					isFirst = false;
				}
				continue;
			} else {
				String[] chcol = null;
				if (!(clusterCHName == null || clusterCHName.trim().length() <= 0)) {
					chcol = clusterCHName.split(",");
				}
				String staticsMethod = (String) map.get("STATISTICS_METHOD");
				String staticsFlag = (String) map.get("STATISTICS_FLAG");
				String selectColumn = (String) map.get("SELECT_COLUMN_EN");

				String sColumn[] = selectColumn == null ? new String[0] : selectColumn.split(",");
				String sMethod[] = staticsMethod == null ? new String[0] : staticsMethod.split(",");
				String sFlag[] = staticsFlag == null ? new String[0] : staticsFlag.split(",");
				for (int i = 0; i < len; i++) {
					Map<String, Object> tmpmap = new HashMap<String, Object>();
					tmpmap.putAll(map);
					tmpmap.put("DEFINE_EN_COLUMN_NAME", encol[i]);
					tmpmap.put("DEFINE_CH_COLUMN_NAME", chcol == null || chcol.length < i ? "" : chcol[i]);
					tmpmap.put("COLUMN_ID", encol[i]);
					tmpmap.put("ORDER_ID", index + 1);
					boolean isExist = false;
					for (int j = 0; j < sColumn.length; j++) {
						if (sColumn[j].equals(encol[i]) && sMethod.length - 1 >= j) {
							tmpmap.put("STATISTICS_METHOD", sMethod[j]);
							tmpmap.put("SELECT_COLUMN_EN", sColumn[j]);
							tmpmap.put("STATISTICS_FLAG", sFlag[j]);
							isExist = true;
							break;
						}
					}

					if (!isExist) {
						tmpmap.put("STATISTICS_METHOD", "-1");
						tmpmap.put("STATISTICS_FLAG", "-1");
						tmpmap.put("SELECT_COLUMN_EN", "");
					}

					tmpmap.put("RN_", index + 1);
					newlist.add(tmpmap);
					index++;
					if (isFirst) {
						fistRecord = tmpmap;
						isFirst = false;
					}
				}
			}
		}

		fistRecord.put("TOTAL_COUNT_", newlist.size());

		// 排序
		String columnSort = MapUtils.getString(data, "_COLUMN_SORT");
		if (columnSort != null && !"".equals(columnSort)) {
			List<SortBean> lstSortBean = new ArrayList<SortBean>();
			String cs[] = columnSort.split(",");
			for (int i = 0; i < cs.length; i++) {
				String tmp[] = cs[i].split(" ");
				lstSortBean.add(new SortBean(tmp[0].trim(), tmp[1].trim().equals("ASC") ? "0" : "1"));
			}
			SortComparator comp = new SortComparator(lstSortBean);
			Collections.sort(newlist, comp);
		}

		return newlist;
	}

	/**
	 * 查询规则
	 * 
	 * @param id
	 * @return
	 */
	public Map<String, Object> getHBQryRuleById(long id) {
		Map<String, Object> map = this.hbQryRuleDao.queryColumnInfoById(id);
		return map;
	}

	public List<Map<String, Object>> queryColumnInfoByQryId(long qryId) {
		return this.hbQryRuleDao.queryColumnInfosByQryId(qryId);

	}

	/**
	 * 
	 * 通过查询规则ID查询相关列
	 * 
	 * @param qryId
	 * @return
	 */
	public List<String> queryColumnInfoStringByQryId(long qryId) {
		List<Map<String, Object>> list = this.hbQryRuleDao.queryColumnInfoByQryId(qryId);
		List<String> lstLong = new ArrayList<String>();
		for (Map<String, Object> map : list) {
			String clusterENName = (String) map.get("SELECT_COLUMN_EN");
			if (null == clusterENName || clusterENName.trim().length() <= 0) {
				continue;
			}
			String[] encol = clusterENName.split(",");
			for (int i = 0; i < encol.length; i++) {
				lstLong.add(encol[i]);
			}
		}

		return lstLong;
	}

	/**
	 * 
	 * 通过查询规则ID查询逻辑，正则条件
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> getRexByQryId(long qryId) {
		List<Map<String, Object>> list = this.hbQryRuleDao.getRexByQryId(qryId);
		return list;
	}

	/**
	 * 
	 * 通过查询规则ID查询逻辑，正则条件，查看使用
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> getLogicByQryIdShow(long qryId) {
		List<Map<String, Object>> list = this.hbQryRuleDao.getLogicByQryId(qryId);
		return list;
	}

	/**
	 * 
	 * 通过查询规则ID查询逻辑，正则条件，修改使用
	 * 
	 * @param qryId
	 * @return
	 */
	public List<Map<String, Object>> getLogicByQryId(long qryId) {
		List<Map<String, Object>> list = this.hbQryRuleDao.getLogicByQryId(qryId);
		for (Map<String, Object> map : list) {
			Object matchKey = map.get("MATCH_CONDITION");
			Object experKey = map.get("EXPRE_CONDITION");
			for (int i = 0; i < codeSign.length; i++) {
				if (null != matchKey) {
					map.put("MATCH_CONDITION", matchKey.toString().replaceAll(codeSign[i][0], codeSign[i][1]));
				}

				if (null != experKey) {
					map.put("EXPRE_CONDITION", experKey.toString().replaceAll(codeSign[i][0], codeSign[i][1]));
				}
			}
		}
		return list;
	}

	/**
	 * 保存程序实例信息
	 * 
	 * @param data
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> saveQryRuleInfo(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		Map<String, Object> qryRuleInfo = (Map<String, Object>) data.get("qyrRuleInfo");// 规则信息
		List<Map<String, Object>> qryColumnInfos = (List<Map<String, Object>>) data.get("qryColumnInfo");// 需要的列
		List<Map<String, Object>> qryAuthorityInfos = (List<Map<String, Object>>) data.get("qryAuthorityInfo");// 用户访问权限
		List<Map<String, Object>> logicDatas = (List<Map<String, Object>>) data.get("logicDatas");// 逻辑条件
		List<Map<String, Object>> rexDatas = (List<Map<String, Object>>) data.get("rexDatas");// 正则表达式条件
		long qryRuleId = Convert.toLong(data.get("QRY_RULE_ID"), 0L);
		int qryRuleState = MapUtils.getIntValue(qryRuleInfo, "STATE");
		long qryHbTableId = MapUtils.getLongValue(qryRuleInfo, "HB_TABLE_ID");
		List<Map<String, Object>> lstColumnInfo = this.hbQryRuleDao.getQryColumnInfoByTableId(qryHbTableId);
		if (qryRuleState == 0) {
			int flag = this.checkTableState(qryHbTableId);
			if (flag > 0) {
				result.put("flag", 0);
				result.put("msg", "该规则下的Hbase表是无效状态,不能设置该规则为有效！");
				return result;
			}
		}

		if (qryRuleId != 0L) {
			try {
				BaseDAO.beginTransaction();
				// 第一步，更新规则信息
				hbQryRuleDao.updateRuleInfo(qryRuleInfo, qryRuleId);

				// 得到排序列的列ID
				String sortColumn = MapUtils.getString(qryRuleInfo, "DEF_SORT_COLUMN");// 排序列
				List<Map<String, Object>> lstColumnIdMap = new ArrayList<Map<String, Object>>();
				long sortColumnId = -1;
				Map<Long, String> mapSelectColumn = new HashMap<Long, String>();
				Map<Long, String> mapSelectColumnCH = new HashMap<Long, String>();
				Map<Long, String> mapSelectColumnMethod = new HashMap<Long, String>();
				Map<Long, String> mapSelectColumnFlag = new HashMap<Long, String>();
				for (int i = 0; i < qryColumnInfos.size(); i++) {
					Map<String, Object> qryColumnInfo = qryColumnInfos.get(i);
					long columnId = MapUtils.getLongValue(qryColumnInfo, "COLUMN_ID");
					String enColumn = MapUtils.getString(qryColumnInfo, "DEFINE_EN_COLUMN_NAME");
					String chColumn = MapUtils.getString(qryColumnInfo, "DEFINE_CH_COLUMN_NAME");
					String method = MapUtils.getString(qryColumnInfo, "METHOD");
					String stage = MapUtils.getString(qryColumnInfo, "FLAG");

					if (mapSelectColumn.containsKey(columnId)) {
						mapSelectColumn.put(columnId, mapSelectColumn.get(columnId) + "," + enColumn);
						mapSelectColumnCH.put(columnId, mapSelectColumnCH.get(columnId) + "," + chColumn);
						mapSelectColumnMethod.put(columnId, mapSelectColumnMethod.get(columnId) + "," + method);
						mapSelectColumnFlag.put(columnId, mapSelectColumnFlag.get(columnId) + "," + stage);

					} else {
						mapSelectColumn.put(columnId, enColumn);
						mapSelectColumnCH.put(columnId, chColumn);
						mapSelectColumnMethod.put(columnId, method);
						mapSelectColumnFlag.put(columnId, stage);
					}
					Map<String, Object> mapColumnNamColumnId = hbQryRuleDao.getQryColumnById(columnId);
					lstColumnIdMap.add(mapColumnNamColumnId);
				}
				a: for (Map<String, Object> mapTemp : lstColumnIdMap) {
					String[] arrEnName = MapUtils.getString(mapTemp, "DEFINE_EN_COLUMN_NAME").split(",");
					long temColumnId = MapUtils.getLongValue(mapTemp, "COLUMN_ID");
					for (String enName : arrEnName) {
						if (enName.equals(sortColumn)) {
							sortColumnId = temColumnId;
							break a;
						}
					}
				}

				// 处理选择的列的顺序，针对拆分的字段
				this.selectColumnOrder(lstColumnInfo, mapSelectColumn, mapSelectColumnCH, mapSelectColumnMethod,
						mapSelectColumnFlag);

				// 第二步，更新列信息
				hbQryRuleDao.deleteColumn(qryRuleId);
				List<Long> lstSaveColumnId = new ArrayList<Long>();
				for (int i = 0; i < qryColumnInfos.size(); i++) {
					Map<String, Object> qryColumnInfo = qryColumnInfos.get(i);
					qryColumnInfo.put("QRY_RULE_ID", qryRuleId);
					Long columnId = Convert.toLong(qryColumnInfo.get("COLUMN_ID"));
					if (lstSaveColumnId.contains(columnId)) {
						continue;
					}
					lstSaveColumnId.add(columnId);
					String selectEnColumn = mapSelectColumn.get(columnId);
					String selectChColumn = mapSelectColumnCH.get(columnId);
					String selectEnColumnMethod = mapSelectColumnMethod.get(columnId);
					String selectEnColumnFlag = mapSelectColumnFlag.get(columnId);
					hbQryRuleDao.saveColumn(qryColumnInfo, i + 1, sortColumnId, qryRuleInfo, selectEnColumn,
							selectChColumn, selectEnColumnMethod, selectEnColumnFlag);
				}

				// 第三步，更新用户访问权限信息
				hbQryRuleDao.deleteAuthority(qryRuleId);
				for (int i = 0; i < qryAuthorityInfos.size(); i++) {
					Map<String, Object> qryAuthorityInfo = qryAuthorityInfos.get(i);
					qryAuthorityInfo.put("QRY_RULE_ID", qryRuleId);
					hbQryRuleDao.saveAuthority(qryAuthorityInfo);
				}

				// 第四步 更新逻辑条件信息
				hbQryRuleDao.deleteLogic(qryRuleId);
				for (int i = 0; i < logicDatas.size(); i++) {
					Map<String, Object> logicData = logicDatas.get(i);
					logicData.put("QRY_RULE_ID", qryRuleId);
					hbQryRuleDao.saveLogic(logicData);
				}

				// 第五步 更新正则表达式条件信息
				hbQryRuleDao.deleteRex(qryRuleId);
				for (int i = 0; i < rexDatas.size(); i++) {
					Map<String, Object> rexData = rexDatas.get(i);
					rexData.put("QRY_RULE_ID", qryRuleId);
					hbQryRuleDao.saveRex(rexData);
				}

				result.put("flag", 1);
				BaseDAO.commit();
			} catch (Exception e) {
				LogUtils.error(null, e);
				BaseDAO.rollback();
				result.put("flag", 0);
			}
		} else {
			qryRuleId = -1l;
			try {
				BaseDAO.beginTransaction();
				// 第一步 保存规则信息
				qryRuleId = hbQryRuleDao.saveQryRuleInfo(qryRuleInfo);
				userAuthorDAO.insertUserAuthor("3", String.valueOf(qryRuleId));

				// 得到排序列的列ID
				String sortColumn = MapUtils.getString(qryRuleInfo, "DEF_SORT_COLUMN");// 排序列
				List<Map<String, Object>> lstColumnIdMap = new ArrayList<Map<String, Object>>();
				long sortColumnId = -1;
				Map<Long, String> mapSelectColumn = new HashMap<Long, String>();
				Map<Long, String> mapSelectColumnCH = new HashMap<Long, String>();
				Map<Long, String> mapSelectColumnMethod = new HashMap<Long, String>();
				Map<Long, String> mapSelectColumnFlag = new HashMap<Long, String>();
				for (int i = 0; i < qryColumnInfos.size(); i++) {
					Map<String, Object> qryColumnInfo = qryColumnInfos.get(i);
					long columnId = MapUtils.getLongValue(qryColumnInfo, "COLUMN_ID");
					String enColumn = MapUtils.getString(qryColumnInfo, "DEFINE_EN_COLUMN_NAME");
					String chColumn = MapUtils.getString(qryColumnInfo, "DEFINE_CH_COLUMN_NAME");
					String method = MapUtils.getString(qryColumnInfo, "METHOD");
					String stage = MapUtils.getString(qryColumnInfo, "FLAG");
					if (mapSelectColumn.containsKey(columnId)) {
						mapSelectColumn.put(columnId, mapSelectColumn.get(columnId) + "," + enColumn);
						mapSelectColumnCH.put(columnId, mapSelectColumnCH.get(columnId) + "," + chColumn);
						mapSelectColumnMethod.put(columnId, mapSelectColumnMethod.get(columnId) + "," + method);
						mapSelectColumnFlag.put(columnId, mapSelectColumnFlag.get(columnId) + "," + stage);

					} else {
						mapSelectColumn.put(columnId, enColumn);
						mapSelectColumnCH.put(columnId, chColumn);
						mapSelectColumnMethod.put(columnId, method);
						mapSelectColumnFlag.put(columnId, stage);
					}
					Map<String, Object> mapColumnNamColumnId = hbQryRuleDao.getQryColumnById(columnId);
					lstColumnIdMap.add(mapColumnNamColumnId);
				}
				a: for (Map<String, Object> mapTemp : lstColumnIdMap) {
					String[] arrEnName = MapUtils.getString(mapTemp, "DEFINE_EN_COLUMN_NAME").split(",");
					long temColumnId = MapUtils.getLongValue(mapTemp, "COLUMN_ID");
					for (String enName : arrEnName) {
						if (enName.equals(sortColumn)) {
							sortColumnId = temColumnId;
							break a;
						}
					}
				}

				// 处理选择的列的顺序，针对拆分的字段
				this.selectColumnOrder(lstColumnInfo, mapSelectColumn, mapSelectColumnCH, mapSelectColumnMethod,
						mapSelectColumnFlag);

				// 第二步 保存需要的列信息
				List<Long> lstSaveColumnId = new ArrayList<Long>();
				for (int i = 0; i < qryColumnInfos.size(); i++) {
					Map<String, Object> qryColumnInfo = qryColumnInfos.get(i);
					qryColumnInfo.put("QRY_RULE_ID", qryRuleId);
					Long columnId = Convert.toLong(qryColumnInfo.get("COLUMN_ID"));
					if (lstSaveColumnId.contains(columnId)) {
						continue;
					}
					lstSaveColumnId.add(columnId);
					String selectEnColumn = mapSelectColumn.get(columnId);
					String selectChColumn = mapSelectColumnCH.get(columnId);
					String selectEnColumnMethod = mapSelectColumnMethod.get(columnId);
					String selectEnColumnFlag = mapSelectColumnFlag.get(columnId);
					hbQryRuleDao.saveColumn(qryColumnInfo, i + 1, sortColumnId, qryRuleInfo, selectEnColumn,
							selectChColumn, selectEnColumnMethod, selectEnColumnFlag);
				}

				// 第三步 保存用户访问权限信息
				for (int i = 0; i < qryAuthorityInfos.size(); i++) {
					Map<String, Object> qryAuthorityInfo = qryAuthorityInfos.get(i);
					qryAuthorityInfo.put("QRY_RULE_ID", qryRuleId);
					hbQryRuleDao.saveAuthority(qryAuthorityInfo);
				}

				// 第四步 保存逻辑条件信息
				for (int i = 0; i < logicDatas.size(); i++) {
					Map<String, Object> logicData = logicDatas.get(i);
					logicData.put("QRY_RULE_ID", qryRuleId);
					hbQryRuleDao.saveLogic(logicData);
				}

				// 第五步 保存正则表达式条件信息
				for (int i = 0; i < rexDatas.size(); i++) {
					Map<String, Object> rexData = rexDatas.get(i);
					rexData.put("QRY_RULE_ID", qryRuleId);
					hbQryRuleDao.saveRex(rexData);
				}

				result.put("flag", 1);
				BaseDAO.commit();
			} catch (Exception e) {
				LogUtils.error(null, e);
				BaseDAO.rollback();
				result.put("flag", 0);
			}
		}

		Object resobj = result.get("flag");
		if (null != resobj && "1".equals(resobj.toString())) {
			DataSourceInit.reLoadQueryRuleAll(qryRuleId, null);// 重新加载规则ID
			DataSourceInit.loadRuleUserRef(qryRuleId); // 重新加载规则ID与用户的关系
			DataSourceInit.loadHTableRuleList(qryRuleId); // 查询规则信息
			DataSourceInit.loadRuleIdHTableList(qryRuleId); // 查询规则ID与表的对应关系
		}

		return result;
	}

	/**
	 * 删除规则信息
	 * 
	 * @param qryId
	 * @return
	 */
	public Map<String, Object> deleteQryRuleInfo(long qryId) {
		Map<String, Object> result = new HashMap<String, Object>();
		if (qryId != 0L) {
			try {
				BaseDAO.beginTransaction();
				// 第一步，更新用户访问权限信息
				hbQryRuleDao.deleteAuthority(qryId);

				// 第二步 更新逻辑条件信息
				hbQryRuleDao.deleteLogic(qryId);

				// 第三步 更新正则表达式条件信息
				hbQryRuleDao.deleteRex(qryId);

				// 第四步 删除需要的列信息
				hbQryRuleDao.deleteColumn(qryId);

				// 第五步 删除规则信息
				hbQryRuleDao.deleteQryRuleInfo(qryId);
				result.put("flag", 1);
				userAuthorDAO.delete(qryId, 3);
				BaseDAO.commit();
			} catch (Exception e) {
				BaseDAO.rollback();
				LogUtils.error(null, e);
				result.put("flag", 0);
			}

			Object resobj = result.get("flag");
			if (null != resobj && "1".equals(resobj.toString())) {
				DataSourceInit.removeQueryRule(String.valueOf(qryId)); // 删除规则ID
				DataSourceInit.removeRuleIdUserInfo(qryId);
				DataSourceInit.removeHTableRule(qryId); // 删除查询规则信息
				DataSourceInit.removeRuleIdHTable(qryId); // 删除查询规则ID与表的对应关系
			}
		}
		return result;
	}

	/**
	 * 复制规则信息
	 * 
	 * @param dryId
	 * @return
	 */
	public Map<String, Object> copyQryRuleInfo(Map<String, Object> data) {
		Map<String, Object> result = new HashMap<String, Object>();
		long qryId = MapUtils.getLongValue(data, "RULE_ID");
		String ruleName = MapUtils.getString(data, "qryRuleName");
		Map<String, Object> qyrRuleInfo = hbQryRuleDao.getQyrRuleInfo(qryId);// 规则信息
		List<Map<String, Object>> qryColumnInfos = hbQryRuleDao.queryColumnInfosByQryId(qryId);// 需要的列
		List<Map<String, Object>> qryAuthorityInfos = hbQryRuleDao.getAuthorityInfos(qryId);// 用户访问权限
		List<Map<String, Object>> logicDatas = hbQryRuleDao.getLogicByQryId(qryId);// 逻辑条件
		List<Map<String, Object>> rexDatas = hbQryRuleDao.getRexByQryId(qryId);// 正则表达式条件

		long qryRuleId = 0L;
		if (qryId != 0L) {
			try {
				BaseDAO.beginTransaction();
				// 第一步 保存规则信息
				qyrRuleInfo.put("RULE_NAME", ruleName);
				qryRuleId = hbQryRuleDao.saveQryRuleInfo(qyrRuleInfo);
				userAuthorDAO.insertUserAuthor("3", String.valueOf(qryRuleId));

				// 得到排序列的列ID
				String sortColumn = MapUtils.getString(qyrRuleInfo, "DEF_SORT_COLUMN");// 排序列
				List<Map<String, Object>> lstColumnIdMap = new ArrayList<Map<String, Object>>();
				long sortColumnId = -1;
				Map<Long, String> mapSelectColumn = new HashMap<Long, String>();
				Map<Long, String> mapSelectColumnCH = new HashMap<Long, String>();
				Map<Long, String> mapSelectColumnMethod = new HashMap<Long, String>();
				Map<Long, String> mapSelectColumnFlag = new HashMap<Long, String>();
				for (int i = 0; i < qryColumnInfos.size(); i++) {
					Map<String, Object> qryColumnInfo = qryColumnInfos.get(i);
					long columnId = MapUtils.getLongValue(qryColumnInfo, "COLUMN_ID");
					mapSelectColumn.put(columnId, MapUtils.getString(qryColumnInfo, "SELECT_COLUMN_EN"));
					mapSelectColumnCH.put(columnId, MapUtils.getString(qryColumnInfo, "SELECT_COLUMN_CH"));
					mapSelectColumnMethod.put(columnId, MapUtils.getString(qryColumnInfo, "STATISTICS_METHOD"));
					mapSelectColumnFlag.put(columnId, MapUtils.getString(qryColumnInfo, "STATISTICS_FLAG"));

					Map<String, Object> mapColumnNamColumnId = hbQryRuleDao.getQryColumnById(columnId);
					lstColumnIdMap.add(mapColumnNamColumnId);
				}
				a: for (Map<String, Object> mapTemp : lstColumnIdMap) {
					String[] arrEnName = MapUtils.getString(mapTemp, "DEFINE_EN_COLUMN_NAME").split(",");
					long temColumnId = MapUtils.getLongValue(mapTemp, "COLUMN_ID");
					for (String enName : arrEnName) {
						if (enName.equals(sortColumn)) {
							sortColumnId = temColumnId;
							break a;
						}
					}
				}

				// 第二步 保存需要的列信息
				List<Long> lstSaveColumnId = new ArrayList<Long>();
				for (int i = 0; i < qryColumnInfos.size(); i++) {
					Map<String, Object> qryColumnInfo = qryColumnInfos.get(i);
					qryColumnInfo.put("QRY_RULE_ID", qryRuleId);
					Long columnId = Convert.toLong(qryColumnInfo.get("COLUMN_ID"));
					if (lstSaveColumnId.contains(columnId)) {
						continue;
					}
					lstSaveColumnId.add(columnId);
					String selectEnColumn = mapSelectColumn.get(columnId);
					String selectChColumn = mapSelectColumnCH.get(columnId);
					String selectEnColumnMethod = mapSelectColumnMethod.get(columnId);
					String selectEnColumnFlag = mapSelectColumnFlag.get(columnId);
					hbQryRuleDao.saveColumn(qryColumnInfo, i + 1, sortColumnId, qyrRuleInfo, selectEnColumn,
							selectChColumn, selectEnColumnMethod, selectEnColumnFlag);
				}

				// 第三步 保存用户访问权限信息
				for (int i = 0; i < qryAuthorityInfos.size(); i++) {
					Map<String, Object> qryAuthorityInfo = qryAuthorityInfos.get(i);
					qryAuthorityInfo.put("QRY_RULE_ID", qryRuleId);
					hbQryRuleDao.saveAuthority(qryAuthorityInfo);
				}

				// 第四步 保存逻辑条件信息
				for (int i = 0; i < logicDatas.size(); i++) {
					Map<String, Object> logicData = logicDatas.get(i);
					logicData.put("QRY_RULE_ID", qryRuleId);
					hbQryRuleDao.saveLogic(logicData);
				}

				// 第五步 保存正则表达式条件信息
				for (int i = 0; i < rexDatas.size(); i++) {
					Map<String, Object> rexData = rexDatas.get(i);
					rexData.put("QRY_RULE_ID", qryRuleId);
					hbQryRuleDao.saveRex(rexData);
				}
				result.put("flag", 1);
				BaseDAO.commit();
			} catch (Exception e) {
				LogUtils.error(null, e);
				BaseDAO.rollback();
				result.put("flag", 0);
			}

			Object resobj = result.get("flag");
			if (null != resobj && "1".equals(resobj.toString())) {
				DataSourceInit.reLoadQueryRuleAll(qryRuleId, null); // 重新加载规则ID
				DataSourceInit.loadRuleUserRef(qryRuleId); // 重新加载规则ID与用户的关系
				DataSourceInit.loadHTableRuleList(qryRuleId); // 查询规则信息
				DataSourceInit.loadRuleIdHTableList(qryRuleId); // 查询规则ID与表的对应关系
			}
		}

		return result;
	}

	/**
	 * 验证条件表达式
	 * 
	 * @param expreCondition 条件语句
	 * @param data 数据(可以支持宏变量)
	 * @return
	 */
	public String validataConditionPre(String expreCondition, List<Map<String, Object>> data) {

		try {
			boolean res = false;
			Map<String, String> mapTemp = new HashMap<String, String>();
			for (int i = 0; i < data.size(); i++) {
				Map<String, Object> map = data.get(i);
				mapTemp.put((String) map.get("TEST_COLUMN_NAME"), (String) map.get("TEST_COLUMN_VALUE"));
			}
			expreCondition = replaceMacro(expreCondition, mapTemp, null);
			Object obj = AviatorEvaluator.execute(expreCondition);
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
			}

			return String.valueOf(res);
		} catch (Exception e) {
			e.printStackTrace();
		}

		return "false";
	}

	/**
	 * 验证正则表达式
	 * 
	 * @param matchCondition 正则
	 * @param expreCondition 条件语句
	 * @param patternType 匹配类型
	 * @param data 数据(可以支持宏变量)
	 * @return
	 */
	public String validataPatternConditionPre(String matchCondition, String expreCondition, int patternType,
			List<Map<String, Object>> data) {
		try {
			Pattern pattern = Pattern.compile(matchCondition);
			Map<String, String> mapTemp = new HashMap<String, String>();
			for (int i = 0; i < data.size(); i++) {
				Map<String, Object> map = data.get(i);
				mapTemp.put((String) map.get("TEST_COLUMN_NAME"), (String) map.get("TEST_COLUMN_VALUE"));
			}
			replaceMacro(matchCondition, mapTemp, null);
			if (pattern == null) {
				return "正则匹配模式为空：" + matchCondition + "语法错误，当不匹配处理";
			}

			boolean res = false;// 初始
			boolean isMatch = false;
			expreCondition = replaceMacro(expreCondition, mapTemp, null);
			String exp = null;
			if (expreCondition.indexOf('~') > 0) {
				String[] exps = expreCondition.split("~");
				Matcher m = pattern.matcher(exps[0]);
				res = m.find();
				if (res) {// 匹配
					exp = exps[1];
					exp = HTableScanner.ReplaceRegex(m, exp);
					if (exp != null && !exp.trim().equals("")) {
						Object obj = AviatorEvaluator.execute(exp);
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
						}
						if (patternType == QueryRuleConditionPO.PATTERN_TYPE_MATCH) {// 0
																						// 匹配满足条件保留
							isMatch = !res;
						} else if (patternType == QueryRuleConditionPO.PATTERN_TYPE_NOT_MATCH) {// 1
																								// 不匹配不满足条件
																								// 保留,满足过滤掉
							isMatch = res;
						}
						if (isMatch)// 过滤优先
							return "true";
					} else {
						if (patternType == QueryRuleConditionPO.PATTERN_TYPE_NOT_MATCH) {// 1
																							// 不匹配不满足条件
																							// 保留,满足过滤掉
							return "true";// 过滤优先
						}
					}
				} else {
					if (patternType == QueryRuleConditionPO.PATTERN_TYPE_MATCH) {// 0
																					// 匹配满足条件保留
						return "true";// 过滤优先
					}
				}
			} else {
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
					return "true";
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return "false";
	}

	public String replaceMacro(String exp, Map<String, String> row, Map<String, String> macroVariableMap)
			throws IOException {
		// 替换变量
		String res = exp;
		Matcher m = QueryRuleConditionPO.macroPattern.matcher(exp);
		while (m.find()) {
			String name = m.group(1);
			String value = row.get(name);
			if (value == null && null != macroVariableMap) {
				value = macroVariableMap.get(name);
			}

			if (value == null) {
				value = MacroVariable.getVarValue(name);
			}

			if (value == null) {
				value = row.get(name);
			}

			if (value == null) {
				value = "";
				LogUtils.warn("宏变量{" + name + "}未获取到输入值" + exp);
				// throw new IOException("宏变量{" + name + "}未获取到输入值" + exp);
			}
			res = res.replaceAll("\\{" + name + "\\}", value);
			m = QueryRuleConditionPO.macroPattern.matcher(res);
		}
		return res;
	}

	private void selectColumnOrder(List<Map<String, Object>> lstColumnInfo, Map<Long, String> mapSelectColumn,
			Map<Long, String> mapSelectColumnCH, Map<Long, String> mapSelectColumnMethod,
			Map<Long, String> mapSelectColumnFlag) {
		for (Long key : mapSelectColumn.keySet()) {
			String enColumn = mapSelectColumn.get(key);
			String chColumn = mapSelectColumnCH.get(key);
			String method = mapSelectColumnMethod.get(key);
			String stage = mapSelectColumnFlag.get(key);
			String[] clname = this.getColumnNameById(lstColumnInfo, key);
			if (clname == null || clname.length != 2) {
				continue;
			}

			String allENName[] = clname[0].split(",");
			String es[] = enColumn.split(",");
			String cs[] = null == chColumn ? new String[0] : chColumn.split(",");
			String me[] = null == method ? new String[0] : method.split(",");
			String st[] = null == stage ? new String[0] : stage.split(",");
			String newEnSelectName = "";
			String newChSelectName = "";
			String newMethod = "";
			String newFlag = "";
			if (allENName.length == 1) {
				continue;
			}

			for (int i = 0; i < allENName.length; i++) {
				for (int j = 0; j < es.length; j++) {
					if (allENName[i].equals(es[j])) {
						newEnSelectName += es[j];
						newEnSelectName += ",";

						if (cs.length == es.length) {
							newChSelectName += cs[j];
							newChSelectName += ",";
						}

						if (me.length == es.length) {
							newMethod += me[j];
							newMethod += ",";
						}
						if (st.length == es.length) {
							newFlag += st[j];
							newFlag += ",";
						}

						break;
					}
				}
			}
			mapSelectColumn.put(key,
					newEnSelectName.endsWith(",") ? newEnSelectName.substring(0, newEnSelectName.length() - 1)
							: newEnSelectName);
			mapSelectColumnCH.put(key,
					newChSelectName.endsWith(",") ? newChSelectName.substring(0, newChSelectName.length() - 1)
							: newChSelectName);
			mapSelectColumnMethod.put(key, newMethod.endsWith(",") ? newMethod.substring(0, newMethod.length() - 1)
					: newMethod);
			mapSelectColumnFlag.put(key, newFlag.endsWith(",") ? newFlag.substring(0, newFlag.length() - 1) : newFlag);
		}
	}

	private String[] getColumnNameById(List<Map<String, Object>> lstColumnInfo, Long key) {
		for (Map<String, Object> map : lstColumnInfo) {
			long columnId = MapUtils.getLong(map, "COLUMN_ID", -1l);
			if (key.longValue() == columnId) {
				return new String[] { MapUtils.getString(map, "DEFINE_EN_COLUMN_NAME", null),
						MapUtils.getString(map, "DEFINE_CH_COLUMN_NAME", null) };
			}
		}

		return null;
	}

	/**
	 * 查看该规则状态
	 * 
	 * @param tableId
	 * @return
	 */
	public int checkTableState(long tableId) {
		return hbQryRuleDao.checkTableState(tableId);
	}

	public void setHbQryRuleDao(HBQryRuleDao hbQryRuleDao) {
		this.hbQryRuleDao = hbQryRuleDao;
	}

	public void setUserAuthorDAO(UserAuthorDAO userAuthorDAO) {
		this.userAuthorDAO = userAuthorDAO;
	}

}
