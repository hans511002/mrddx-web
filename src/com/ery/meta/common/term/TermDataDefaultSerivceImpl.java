package com.ery.meta.common.term;

import java.util.Map;

import com.ery.meta.common.SqlUtils;

import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;


public class TermDataDefaultSerivceImpl extends TermDataService {

	static final String SQLTABLEPRE = "axyz";// 动态拼的SQL 表的别名前缀
	static final String SQLDIMPRE_K = "dim_pre_k";// 程序用

	public Object[][] getData(DataAccess access, Map<String, Object> termControl, TermDataCall call) throws Exception {
		int termType = MapUtils.getInteger(termControl, TermConstant.KEY_termType, -1);
		String dsql = MapUtils.getString(termControl, TermConstant.KEY_dataRule, "").split(";")[0];
		String termName = MapUtils.getString(termControl, TermConstant.KEY_termName);
		String[] value = MapUtils.getString(termControl, TermConstant.KEY_value, "").split(",");

		String execSql = dsql.replaceAll("\\{(?i)" + termName + "\\}", value[0]);// 初始执行sql
		String defValue = MapUtils.getString(termControl, TermConstant.KEY_defaultValue, "");
		int initType = MapUtils.getInteger(termControl, TermConstant.KEY_initType, 0); // 初始类型
		boolean isDynaLoad = MapUtils.getBoolean(termControl, TermConstant.KEY_dynload, false);

		// 取默认值和条件类型，确定是否初始默认值类型
		if (termType == 2 && isDynaLoad && !"".equals(defValue)) {
			boolean pathInited = MapUtils.getBoolean(termControl, TermConstant.KEY_defValPathInited, false);// 是否已初始过
			if (!pathInited) {
				execSql = getQueryDefaultValuePathSql(termControl, access, execSql);// 获取默认值路径
				call.coverTermAttribute(TermConstant.KEY_defValPathInited, true);
				if (termControl.containsKey(TermConstant.KEY_defaultValuePath))
					call.coverTermAttribute(TermConstant.KEY_defaultValuePath,
							termControl.get(TermConstant.KEY_defaultValuePath));
			}
		}
		Object[][] data = queryDataSQL(access, execSql);
		if (initType == 1)
			data = dimFilter(data);
		return data;
	}

	protected Object[][] queryDataSQL(DataAccess access, String execSql) {
		LogUtils.debug("sql=" + execSql);
		return access.queryForDataTable(execSql).rows;
	}

	/**
	 * 维度权限过滤
	 * 
	 * @param dims
	 * @return
	 */
	protected Object[][] dimFilter(Object[][] dims) {
		return dims;
	}

	/**
	 * 根据默认值设置，尝试获取一个初始最终执行sql
	 * 
	 * @param termControl
	 * @param dataAccess
	 * @param execSql 原执行sql（经过一系列计算后，可能会改变此执行sql）
	 * @return
	 */
	private static String getQueryDefaultValuePathSql(Map<String, Object> termControl, DataAccess dataAccess,
			String execSql) throws Exception {
		String defValue = MapUtils.getString(termControl, TermConstant.KEY_defaultValue, "");
		String termName = MapUtils.getString(termControl, TermConstant.KEY_termName);
		String dynLoadSql = MapUtils.getString(termControl, TermConstant.KEY_dataRule).split(";")[1].toUpperCase();// 动态加载SQL;
		if (!"".equals(dynLoadSql) && !"".equals(defValue)) {
			String dsql = dynLoadSql;
			String dv = defValue;
			if (!dv.contains("'"))
				dv = "'" + dv.replaceAll(",", "','") + "'";
			if (dsql.lastIndexOf("ORDER BY") != -1) {
				dsql = dsql.substring(0, dsql.lastIndexOf("ORDER BY"));
			}
			// 取出各字段 把原sql包装成一个子查询，外层用一个递归找父的查询，得到所有默认值的父，并按层级排序
			// 考虑到复杂sql的复杂性，采用去数据查一次的方式获取列名
			// dsql =
			// dsql.replaceAll("(\\w+\\.)?\\w+\\s*=\\s*'?\\{"+termName+"\\}'?"," 1=1 ");
			dsql = SqlUtils.delSQLTermFromKey(dsql, termName);
			Object[] a = dataAccess.queryForArray("select " + SQLTABLEPRE + ".* from (" + dsql + ") " + SQLTABLEPRE
					+ " where rownum=1", true, null)[0];
			dsql = "select distinct " + SQLTABLEPRE + "." + a[2] + ",level from (" + dsql + ") " + SQLTABLEPRE + " "
					+ "connect by prior " + SQLTABLEPRE + "." + a[2] + "=" + SQLTABLEPRE + "." + a[0] + " start with "
					+ "" + SQLTABLEPRE + "." + a[0] + " in(" + dv + ") order by level desc";
			Object[][] devR = dataAccess.queryForArray(dsql, false, null);
			if (devR.length == 0)
				return execSql;

			Object[] dev = new Object[devR.length];
			String[] levelLen = new String[Convert.toInt(devR[0][1])];
			for (int i = 0; i < devR.length; i++) {
				dev[i] = devR[i][0];
				if (levelLen[Convert.toInt(devR[i][1]) - 1] == null)
					levelLen[Convert.toInt(devR[i][1]) - 1] = "";
				levelLen[Convert.toInt(devR[i][1]) - 1] += "'" + devR[i][0] + "',";
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
