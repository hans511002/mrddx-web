package com.ery.meta.common.term;

import java.util.Map;

import com.ery.meta.common.SqlUtils;

import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;


public class DimTermDataServiceImpl extends TermDataDefaultSerivceImpl {

	public Object[][] getData(DataAccess access, Map<String, Object> termControl, TermDataCall call) throws Exception {

		String termName = MapUtils.getString(termControl, TermConstant.KEY_termName);
		int initType = MapUtils.getInteger(termControl, TermConstant.KEY_initType, 0); // 初始类型
		String[] value = MapUtils.getString(termControl, TermConstant.KEY_value, "").split(",");

		buildDimDataRule(termControl, access); // 维度数据查询SQL构造
		String backDimSql = MapUtils.getString(termControl, TermConstant.KEY_dataRule);
		call.coverTermAttribute(TermConstant.KEY_dataRule, backDimSql);
		call.coverTermAttribute(TermConstant.KEY_dynload,
				MapUtils.getBoolean(termControl, TermConstant.KEY_dynload, false));
		call.coverTermAttribute(TermConstant.KEY_treeChildFlag,
				MapUtils.getBoolean(termControl, TermConstant.KEY_treeChildFlag, false));
		String dsql = backDimSql.split(";")[0];

		String execSql = dsql.replaceAll("\\{(?i)" + termName + "\\}", value[0]);// 初始执行sql
		String defValue = MapUtils.getString(termControl, TermConstant.KEY_defaultValue, "");
		int termType = MapUtils.getInteger(termControl, TermConstant.KEY_termType, -1);
		boolean isDynaLoad = MapUtils.getBoolean(termControl, TermConstant.KEY_dynload, false);

		// 取默认值和条件类型，确定是否初始默认值类型
		if (termType == 2 && isDynaLoad && !"".equals(defValue)) {
			boolean pathInited = MapUtils.getBoolean(termControl, TermConstant.KEY_defValPathInited, false);// 是否已初始过
			if (!pathInited) {
				execSql = getDimDefaultValuePathSql(termControl, access, execSql);
				call.coverTermAttribute(TermConstant.KEY_defValPathInited, true);
				if (termControl.containsKey(TermConstant.KEY_defaultValuePath))
					call.coverTermAttribute(TermConstant.KEY_defaultValuePath,
							termControl.get(TermConstant.KEY_defaultValuePath));
			}
		}

		return queryDataSQL(access, execSql);
	}

	/**
	 * 构建维度sql
	 * 
	 * @param termControl
	 * @return
	 */
	private static void buildDimDataRule(Map<String, Object> termControl, DataAccess access) throws Exception {
		int dimTableId = MapUtils.getInteger(termControl, TermConstant.KEY_dimTableId, 0);
		// int dimTypeId =
		// MapUtils.getInteger(termControl,TermConstant.KEY_dimTypeId,0);
		int dimValueType = MapUtils.getIntValue(termControl, TermConstant.KEY_dimValueType, 0);
		String tableInfoSql = "SELECT A.TABLE_NAME,B.TABLE_OWNER,A.TABLE_DIM_PREFIX FROM META_DIM_TABLES A "
				+ "LEFT JOIN META_TABLES B ON A.DIM_TABLE_ID=B.TABLE_ID WHERE B.TABLE_STATE=1 AND A.DIM_TABLE_ID=? ";
		Object[][] infos = access.queryForDataTable(tableInfoSql, dimTableId).rows;
		if (infos == null || infos.length == 0 || infos[0] == null) {
			throw new Exception("没找到相关维度表");
		}
		Object tableName = infos[0][0];
		Object owner = infos[0][1];
		Object prefix = infos[0][2];
		if (tableName == null)
			throw new Exception("维度表名(id:" + dimTableId + ")异常，请检查维度表配置");
		if (owner == null)
			throw new Exception("维度表(id:" + dimTableId + ")所属用户为空，请检查维度配置");
		if (prefix == null)
			throw new Exception("维度表(id:" + dimTableId + ")前缀为空，请检查维度配置");

		tableName = owner + "." + tableName;
		termControl.put(SQLDIMPRE_K, prefix);

		String valueCol = dimValueType == 1 ? (prefix + "_ID") : (prefix + "_CODE");
		String textCol = prefix + "_NAME";
		String parCol = dimValueType == 1 ? (prefix + "_PAR_ID") : (prefix + "_PAR_CODE");

		String checkSql = "SELECT COUNT(*) FROM " + tableName + " WHERE STATE=1 ";
		String levels = MapUtils.getString(termControl, TermConstant.KEY_dimDataLevels, "");
		if (!"".equals(levels)) {
			checkSql += " AND DIM_LEVEL IN(" + levels + ")";
		}
		int cnt = access.queryForInt(checkSql);
		String valueRange = MapUtils.getString(termControl, TermConstant.KEY_dimInitValues, "");
		if (!"".equals(valueRange) && dimValueType == 0 && !valueRange.contains("'")) {
			valueRange = "'" + valueRange.replaceAll(",", "','") + "'";
		}
		String notValueRange = MapUtils.getString(termControl, TermConstant.KEY_excludeValues, "");
		if (!"".equals(notValueRange) && dimValueType == 0 && !notValueRange.contains("'")) {
			notValueRange = "'" + notValueRange.replaceAll(",", "','") + "'";
		}
		String[] levelRange = levels.split(",");
		int termType = MapUtils.getInteger(termControl, TermConstant.KEY_termType, 2);
		if (cnt > 200 && termType == 2) { // 如果大于200并且是树，做异步加载
			String childFlag = ",(case when exists (select 1 from " + tableName + " x where x." + prefix + "_PAR_ID=a."
					+ prefix + "_ID) then 1 else 0 end) hasChild";
			String sql = "SELECT a." + valueCol + ",a." + textCol + ",a." + parCol + childFlag + ",a.DIM_LEVEL "
					+ (dimValueType == 1 ? ("," + prefix + "_CODE") : "") + " FROM " + tableName
					+ " a WHERE a.STATE=1 ";
			if (!"".equals(notValueRange)) {
				sql += " AND a." + valueCol + " NOT IN(" + notValueRange + ")";
			}
			if (!"".equals(valueRange)) {
				sql += " AND a." + valueCol + " IN(" + valueRange + ")";
				if (!"".equals(levels)) {
					sql += " AND a.DIM_LEVEL=" + levelRange[0];
				}
			} else {
				sql += " AND a.DIM_LEVEL=1";
			}
			sql += " ORDER BY a.DIM_LEVEL,a.ORDER_ID,a." + valueCol;// 先按层级排序，保证树结构正确构造

			String termName = MapUtils.getString(termControl, TermConstant.KEY_termName);
			sql += ";SELECT a." + valueCol + ",a." + textCol + ",a." + parCol + childFlag + ",a.DIM_LEVEL "
					+ (dimValueType == 1 ? ("," + prefix + "_CODE") : "") + " FROM " + tableName + " a WHERE a.STATE=1"
					+ " AND a." + parCol + "=" + (dimValueType == 1 ? "" : "'") + "{" + termName + "}"
					+ (dimValueType == 1 ? "" : "'");
			if (!"".equals(levels)) {
				sql += " AND a.DIM_LEVEL<=" + levelRange[levelRange.length - 1];
			}
			sql += " ORDER BY a.DIM_LEVEL,a.ORDER_ID,a." + valueCol;// 先按层级排序，保证树结构正确构造
			termControl.put(TermConstant.KEY_dynload, true);
			termControl.put(TermConstant.KEY_dataRule, sql);
			termControl.put(TermConstant.KEY_treeChildFlag, true);
		} else {
			String sql = "";
			if (termType == 1 || termType == 2) {// combo和tree
				sql = "SELECT a." + valueCol + ",a." + textCol + ",a." + parCol + ",a.DIM_LEVEL " + "FROM " + tableName
						+ " a WHERE a.STATE=1";
				if (!"".equals(valueRange)) {
					sql += " AND a." + valueCol + " IN(" + valueRange + ")";
				}
				if (!"".equals(notValueRange)) {
					sql += " AND a." + valueCol + " NOT IN(" + notValueRange + ")";
				}
				if (!"".equals(levels)) {
					if (termType == 2) {
						sql += " AND a.DIM_LEVEL<=" + levelRange[levelRange.length - 1];
					} else {
						sql += " AND a.DIM_LEVEL<=" + levelRange[0];
					}
				}
				sql += " ORDER BY a.DIM_LEVEL,a.ORDER_ID,a." + valueCol;// 先按层级排序，保证树结构正确构造
			} else if (termType == 3) {// 日历
				sql = "SELECT min(a." + prefix + "_code) ||'-'||max(a." + prefix + "_code) FROM " + tableName
						+ " a WHERE a.STATE=1 AND a.DIM_LEVEL=3 ";
				if (!"".equals(valueRange)) {
					sql += " AND a." + valueCol + " IN(" + valueRange + ")";
				}
				if (!"".equals(notValueRange)) {
					sql += " AND a." + valueCol + " NOT IN(" + notValueRange + ")";
				}
				sql += " ORDER BY a.DIM_LEVEL,a.ORDER_ID,a." + valueCol;// 先按层级排序，保证树结构正确构造
			}
			termControl.put(TermConstant.KEY_dynload, false);
			termControl.put(TermConstant.KEY_dataRule, sql);
		}
	}

	/**
	 * 初始默认值路径
	 * 
	 * @param termControl
	 * @param dataAccess
	 * @param execSql 原执行sql（经过一系列计算后，可能会改变此执行sql）
	 * @return
	 */
	private static Object[][] queryDefaultValuePath(Map<String, Object> termControl, DataAccess dataAccess,
			String execSql) {
		String defValue = MapUtils.getString(termControl, TermConstant.KEY_defaultValue, "");
		String termName = MapUtils.getString(termControl, TermConstant.KEY_termName);
		String dsql = MapUtils.getString(termControl, TermConstant.KEY_dataRule).split(";")[1].toUpperCase();
		if (!"".equals(dsql) && !"".equals(defValue)) {
			String dv = defValue;
			if (!dv.contains("'"))
				dv = dv.replaceAll(",", "','");
			if (dsql.lastIndexOf("ORDER BY") != -1) {
				dsql = dsql.substring(0, dsql.lastIndexOf("ORDER BY"));
			}
			dsql = dsql.replaceAll("(\\w+\\.)?\\w+\\s*=\\s*'?\\{" + termName + "\\}'?", " 1=1 ");
			// 取出各字段 把原sql包装成一个子查询，外层用一个递归找父的查询，得到所有默认值的父，并按层级排序
			// 考虑到复杂sql的复杂性，采用去数据查一次的方式获取列名
			Object[] a = dataAccess.queryForArray("select " + SQLTABLEPRE + ".* from (" + dsql + ") " + SQLTABLEPRE
					+ " where rownum=1", true, null)[0];
			dsql = "select distinct " + SQLTABLEPRE + "." + a[2] + ",level from (" + dsql + ") " + SQLTABLEPRE + " "
					+ "connect by prior " + SQLTABLEPRE + "." + a[2] + "=" + SQLTABLEPRE + "." + a[0] + " start with "
					+ "" + SQLTABLEPRE + "." + a[0] + " in('" + dv + "') order by level desc";
			return dataAccess.queryForArray(dsql, false, null);
		}
		return null;
	}

	/**
	 * 获取维度默认值初始查询sql
	 * 
	 * @param termControl
	 * @param dataAccess
	 * @param execSql
	 * @return
	 * @throws Exception
	 */
	private static String getDimDefaultValuePathSql(Map<String, Object> termControl, DataAccess dataAccess,
			String execSql) throws Exception {
		String defValue = MapUtils.getString(termControl, TermConstant.KEY_defaultValue, "");
		String termName = MapUtils.getString(termControl, TermConstant.KEY_termName);
		String prefix = MapUtils.getString(termControl, SQLDIMPRE_K);
		int dimValueType = MapUtils.getIntValue(termControl, TermConstant.KEY_dimValueType, 0);
		String dynLoadSql = MapUtils.getString(termControl, TermConstant.KEY_dataRule).split(";")[1].toUpperCase();// 动态加载SQL;
		if (prefix != null && !"".equals(defValue)) { // 维度
			String dv = defValue;
			String valueCol = dimValueType == 1 ? (prefix + "_ID") : (prefix + "_CODE");
			String textCol = prefix + "_NAME";
			String parCol = dimValueType == 1 ? (prefix + "_PAR_ID") : (prefix + "_PAR_CODE");
			if (dimValueType == 0 && !dv.contains("'")) {
				dv = "'" + dv.replaceAll(",", "','") + "'";
			}
			String dsql = dynLoadSql.substring(0, dynLoadSql.lastIndexOf("ORDER BY"));
			// dsql =
			// dsql.replaceAll("(\\w+\\.)?\\w+\\s*=\\s*'?\\{"+termName+"\\}'?"," 1=1 ");
			dsql = SqlUtils.delSQLTermFromKey(dsql, termName);
			dsql = "select distinct aaa." + parCol + ",aaa.dim_level from (" + dsql + ") aaa "
					+ "connect by prior aaa." + parCol + "=aaa." + valueCol + " start with " + "aaa." + valueCol
					+ " in(" + dv + ") order by aaa.dim_level ";
			Object[][] devR = dataAccess.queryForArray(dsql, false, null);
			if (devR.length == 0)
				return execSql;

			Object[] dev = new Object[devR.length];
			String[] levelLen = new String[Convert.toInt(devR[devR.length - 1][1])];
			for (int i = 0; i < devR.length; i++) {
				dev[i] = devR[i][0];
				if (levelLen[Convert.toInt(devR[i][1]) - 1] == null)
					levelLen[Convert.toInt(devR[i][1]) - 1] = "";
				levelLen[Convert.toInt(devR[i][1]) - 1] += (dimValueType == 0 ? "'" : "")
						+ Convert.toString(devR[i][0]) + (dimValueType == 0 ? "'" : "") + ",";
			}

			dynLoadSql = dynLoadSql.replaceAll("=\\s*'?\\{" + termName + "\\}'?", " IN#_#@###");
			String sql_ = "select xy.* from(" + execSql + ") xy "; // 准备拼联合查询sql
			for (int i = 0; i < levelLen.length; i++) {
				if (levelLen[i] != null) {
					levelLen[i] = levelLen[i].substring(0, levelLen[i].length() - 1);
					sql_ += " union ";
					sql_ += " select x" + i + ".* from(" + dynLoadSql.replace("#_#@###", "(" + levelLen[i] + ")")
							+ ") x" + i;
				}
			}
			termControl.put(TermConstant.KEY_defaultValuePath, dev);

			return sql_;
		}
		return execSql;
	}

}
