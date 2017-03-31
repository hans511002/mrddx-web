package com.ery.meta.common.term;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Common;
import com.ery.meta.common.Page;

import com.ery.hadoop.hq.ws.base.SqlUtils;
import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.jdbc.DataTable;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.DataSourceManager;
import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**

 * 

 * @description 条件控件封装
 * @date 12-5-14
 * @modify
 * @modifyDate
 */
public class TermControlAction {
	static String SQLTABLEPRE = "axyz";
	static String metaSourceID = SystemVariable.getString("currentDataSourceId", "config1");

	/**
	 * 查询单个条件
	 * 
	 * @param termControl
	 * @return
	 */
	public Object[] getTermData(Map<String, Object> termControl) {
		return _getTermData(termControl, null);
	}

	/**
	 * 私有方法，打包请求过程中初始单个条件
	 * 
	 * @param termControl
	 * @param access
	 * @return Object[] 可能有2至4个值 Object[0] 执行标识，true或false字符串 Object[1]
	 *         异常信息或具体数据(二维数组) Object[2] Map对象，需要回填改变客户端的属性值 Object[3]
	 *         树动态加载时特有，返回默认值路径集，其值为map，默认值做key，路径做value
	 */
	private Object[] _getTermData(Map<String, Object> termControl, DataAccess access) {
		DataAccess _access = access;
		Connection con = null;
		try {
			int termType = MapUtils.getInteger(termControl, TermConstant.KEY_termType, -1);
			int dataSrcType = MapUtils.getInteger(termControl, TermConstant.KEY_dataSrcType, 0);
			int initType = MapUtils.getInteger(termControl, TermConstant.KEY_initType, 0); // 初始类型
			String dsql = MapUtils.getString(termControl, TermConstant.KEY_dataRule, "").split(";")[0];

			if (termType <= 0 || dataSrcType == 0)
				return null;

			TermDataService termDataService = null;
			// 后台接口数据
			if (dataSrcType == 2) {
				if (initType == 2) {// 码表
					termDataService = new CodeTermDataServiceImpl();
				} else {
					Class<TermDataService> aa = (Class<TermDataService>) Class.forName(dsql);
					termDataService = aa.newInstance();
				}
			} else if (initType == 1 && "".equals(dsql)) {
				termDataService = new DimTermDataServiceImpl();// 实现维度构建
			} else { // 普通sql
				termDataService = new TermDataDefaultSerivceImpl();
			}

			final Map<String, Object> backClientAtt = new HashMap<String, Object>();// 回填覆盖客户端的属性
			final Map<String, Object> appendData = new HashMap<String, Object>();// 附加数据
																					// 此值不参与客户端控件绑定
			String dataSrcId = MapUtils.getString(termControl, TermConstant.KEY_dataSrcId);
			if (_access == null)
				_access = new DataAccess(con = DataSourceManager.getConnection(dataSrcId));

			TermDataCall call = new TermDataCall() {
				public void appendDataToClient(String key, Object value) {
					appendData.put(key, value);
				}

				public void coverTermAttribute(String key, Object value) {
					backClientAtt.put(key, value);
				}
			};
			String parentID = MapUtils.getString(termControl, TermConstant.KEY_parentID, "");
			Object[][] data = null;
			if (!"".equals(parentID)) {
				data = termDataService.getChildData(_access, termControl, parentID, call);
			} else {
				data = termDataService.getData(_access, termControl, call);
			}

			boolean dimAuthFlag = MapUtils.getBoolean(termControl, TermConstant.KEY_dimAuthFlag, false);// 是否过滤权限
			long authTableId = MapUtils.getLong(termControl, TermConstant.KEY_authDimTableId, 0l);// 维度表ID
			int idx = MapUtils.getInteger(termControl, TermConstant.KEY_authCodeIndex, 0);// 权限编码所在列索引

			Object termType_ = backClientAtt.get(TermConstant.KEY_termType); // 先从回填属性区域取值，看是否有回填改变
			Object treeChildFlag_ = backClientAtt.get(TermConstant.KEY_treeChildFlag);
			if (termType_ == null)
				termType_ = termControl.get(TermConstant.KEY_termType);
			if (treeChildFlag_ == null)
				treeChildFlag_ = termControl.get(TermConstant.KEY_treeChildFlag);

			Object[] ret = new Object[4];// 返回数据的中间过渡对象
			ret[0] = "true";// 执行标识，成功
			ret[1] = data;
			ret[2] = backClientAtt;
			ret[3] = appendData;
			return ret;

		} catch (Exception ex) {
			LogUtils.error("请求单个条件数据出错!", ex);
			return new Object[] { "false", ex.getMessage() };
		} finally {
			try {
				if (con != null) {
					List<Connection> conns = new ArrayList<Connection>();
					conns.add(con);
					DataSourceManager.destroy(conns);
				}
			} catch (Exception ex) {
				LogUtils.error("关闭连接出错!", ex);
			}
		}
	}

	// 查询表格数据
	public List<Map<String, Object>> queryTermData(Map<String, Object> termControl, Page page) {
		Connection con = null;
		DataAccess access = new DataAccess(con = DataSourceManager.getConnection(metaSourceID));
		try {
			int termType = MapUtils.getInteger(termControl, TermConstant.KEY_termType, -1);
			int initType = MapUtils.getInteger(termControl, TermConstant.KEY_initType, 0); // 初始类型
			String dsql = MapUtils.getString(termControl, TermConstant.KEY_dataRule, "").split(";")[0];

			if (termType == 4) {
				Class<TermDataService> aa = (Class<TermDataService>) Class.forName(dsql);
				TermDataService termDataService = aa.newInstance();
				String dataSrcId = MapUtils.getString(termControl, TermConstant.KEY_dataSrcId);
				if (access == null)
					access = new DataAccess(con = DataSourceManager.getConnection(dataSrcId));
				return termDataService.queryDataTable(access, termControl, page);
			}
		} catch (Exception ex) {
			LogUtils.error("条件组件查询数据表格出错!", ex);
		} finally {
			try {
				if (con != null)
					con.close();
			} catch (Exception ex) {
			}
			DataSourceManager.destroy();
		}
		return null;
	}

	/**
	 * 打包请求条件
	 * 
	 * @param termControls
	 * @return
	 */
	public Object getTermsData(Map<String, Object>[] termControls) {
		Connection con = null;
		DataAccess access = new DataAccess(con = DataSourceManager.getConnection(metaSourceID));
		try {
			Map<String, Object> result = new HashMap<String, Object>();
			Map<String, Object> map = new HashMap<String, Object>();
			for (Map<String, Object> termControl : termControls) {
				map.put(MapUtils.getString(termControl, TermConstant.KEY_termId), termControl);
			}
			for (Map<String, Object> termCfm : termControls) {
				String parentTermId = MapUtils.getString(termCfm, TermConstant.KEY_parentTerm, "");
				String dataSrcId = MapUtils.getString(termCfm, TermConstant.KEY_dataSrcId);

				if (!parentTermId.equals("") && map.containsKey(parentTermId)) {
					Map<String, Object> parentCfm = (Map<String, Object>) map.get(parentTermId);
					String parentTextName = MapUtils.getString(parentCfm, TermConstant.KEY_textName, "");
					String parTermName = MapUtils.getString(parentCfm, TermConstant.KEY_termName, "");
					String[] parentValue = MapUtils.getString(parentCfm, TermConstant.KEY_value, "").split(",");
					String dsql = MapUtils.getString(termCfm, TermConstant.KEY_dataRule, "");
					dsql = dsql.replaceAll("\\{(?i)" + parTermName + "\\}", parentValue[0]);
					if (!parentTextName.equals("") && parentValue.length > 1)
						dsql = dsql.replaceAll("\\{(?i)" + parentTextName + "\\}", parentValue[1]);

					termCfm.put(TermConstant.KEY_dataRule, dsql);
				}
				Object[] res = _getTermData(termCfm, (metaSourceID.equals(dataSrcId) ? access : null));
				if (res == null)
					continue;
				if (res[0].equals("false")) {
					return res;// 只要有任意一个未执行成功，即返回
				}
				result.put(MapUtils.getString(termCfm, TermConstant.KEY_termId), res);
			}
			return result;
		} catch (Exception ex) {
			LogUtils.error("打包请求数据出错!", ex);
			return new Object[] { "false", ex.getMessage() };
		} finally {
			try {
				if (con != null)
					con.close();
			} catch (Exception ex) {
			}
			DataSourceManager.destroy();
		}
	}

	/**
	 * 构建维度sql
	 * 
	 * @param data
	 * @return
	 */
	private String buildDimDataRule(Map<String, Object> data, long dimTypeId, int dimValueType, String tableName,
			String prefix, DataAccess access) throws Exception {
		String valueCol = dimValueType == 1 ? (prefix + "_ID") : (prefix + "_CODE");
		String textCol = prefix + "_NAME";
		String parCol = dimValueType == 1 ? (prefix + "_PAR_ID") : (prefix + "_PAR_CODE");

		String checkSql = "SELECT COUNT(*) FROM " + tableName + " WHERE STATE=1 AND DIM_TYPE_ID=" + dimTypeId;
		String levels = MapUtils.getString(data, "LEVELS", "");
		if (!"".equals(levels)) {
			checkSql += " AND DIM_LEVEL IN(" + levels + ")";
		}
		int cnt = access.queryForInt(checkSql);
		String[] levelRange = levels.split(",");
		int termType = MapUtils.getInteger(data, "TERM_TYPE", 2);
		String sql = "";
		if (cnt > 200 && termType == 2) { // 如果大于200并且是树，做异步加载
			String childFlag = ",(case when exists (select 1 from " + tableName + " x where x." + prefix + "_PAR_ID=a."
					+ prefix + "_ID AND x.DIM_TYPE_ID=" + dimTypeId + ") then 1 else 0 end) hasChild";
			sql = "SELECT a." + valueCol + ",a." + textCol + ",a." + parCol + childFlag + ",a.DIM_LEVEL "
					+ (dimValueType == 1 ? ("," + prefix + "_CODE ") : "") + "FROM " + tableName
					+ " a WHERE a.STATE=1 AND a.DIM_TYPE_ID=" + dimTypeId;

			sql += " AND a.DIM_LEVEL=1";
			sql += " ORDER BY a.DIM_LEVEL,a.ORDER_ID,a." + valueCol;// 先按层级排序，保证树结构正确构造

			String termName = MapUtils.getString(data, "MACRO_VAL", "PAR_VALUE");
			sql += ";SELECT a." + valueCol + ",a." + textCol + ",a." + parCol + childFlag + ",a.DIM_LEVEL "
					+ (dimValueType == 1 ? ("," + prefix + "_CODE ") : "") + "FROM " + tableName
					+ " a WHERE a.STATE=1 AND a.DIM_TYPE_ID=" + dimTypeId + " AND a." + parCol + "="
					+ (dimValueType == 1 ? "" : "'") + "{" + termName + "}" + (dimValueType == 1 ? "" : "'");
			if (!"".equals(levels)) {
				sql += " AND a.DIM_LEVEL<=" + levelRange[levelRange.length - 1];
			}
			sql += " ORDER BY a.DIM_LEVEL,a.ORDER_ID,a." + valueCol;// 先按层级排序，保证树结构正确构造
		} else {
			sql = "SELECT a." + valueCol + ",a." + textCol + ",a." + parCol + ",a.DIM_LEVEL " + "FROM " + tableName
					+ " a WHERE a.STATE=1 AND a.DIM_TYPE_ID=" + dimTypeId;
			if (!"".equals(levels)) {
				if (termType == 2) {
					sql += " AND a.DIM_LEVEL<=" + levelRange[levelRange.length - 1];
				} else {
					if (levelRange.length > 1)
						sql += " AND a.DIM_LEVEL in (" + Common.join(levelRange) + ")";
					else
						sql += " AND a.DIM_LEVEL=" + levelRange[0];
				}
			}
			sql += " ORDER BY a.DIM_LEVEL,a.ORDER_ID,a." + valueCol;// 先按层级排序，保证树结构正确构造
		}
		return sql;
	}

	/**
	 * 初始默认值路径
	 * 
	 * @param data
	 * @param dataAccess
	 * @param execSql 原执行sql（经过一系列计算后，可能会改变此执行sql）
	 * @return
	 */
	private Object[][] queryDefaultValuePath(Map<String, Object> data, DataAccess dataAccess, String execSql) {
		String defValue = MapUtils.getString(data, "DEFAULT_VALUE", "");
		String termName = MapUtils.getString(data, "MACRO_VAL", "PAR_VALUE");
		String dsql = MapUtils.getString(data, "_EXEC_SQL_").split(";")[1].toUpperCase();
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
	 * @param data
	 * @param dataAccess
	 * @param execSql
	 * @return
	 * @throws Exception
	 */
	private String getDimDefaultValuePathSql(Map<String, Object> data, int dimValueType, String prefix,
			DataAccess dataAccess, String execSql) throws Exception {
		String defValue = MapUtils.getString(data, "DEFAULT_VALUE", "");
		String termName = MapUtils.getString(data, "MACRO_VAL", "PAR_VALUE");
		String dynLoadSql = MapUtils.getString(data, "_EXEC_SQL_").split(";")[1].toUpperCase();
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
			return sql_;
		}
		return execSql;
	}

	public DataTable qryData(String dataSrcName, String dsql) {
		DataAccess access = new DataAccess(DataSourceManager.getConnection(dataSrcName));
		DataTable table = access.queryForDataTable(dsql);
		return table;
	}

	public Map<String, Object> testquery(Map<String, Object> data, Page page) {
		LogUtils.debug("page:" + page.getPosStart() + "->" + page.getCount());
		int ros = 25;
		int cos = 6;
		Object[][] a = new Object[ros][cos];

		for (int i = 1; i <= ros; i++) {
			for (int j = 1; j <= cos; j++) {
				a[i - 1][j - 1] = "行号*列号=" + (i * j);
			}
		}

		Map<String, Object> ret = new HashMap<String, Object>();
		List<Object[]> array = new ArrayList<Object[]>();
		for (int i = 1; i <= page.getCount(); i++) {
			int idx = i + page.getPosStart() - 2;
			if (idx == ros)
				break;
			array.add(a[i + page.getPosStart() - 2]);
		}
		ret.put("total", ros);
		ret.put("list", array);

		return ret;
	}

	/**
	 * 查询弹出选择框数据
	 * 
	 * @param map
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryPopData(Map<String, Object> map, Page page) {
		DataAccess access = new DataAccess(DataSourceManager.getConnection(metaSourceID));
		String className = Convert.toString(map.get("CLASS_NAME"), "com.ery.meta.common.term.PopQueryServiceImpl");
		try {
			TermDataService service = (TermDataService) Class.forName(className).newInstance();
			return service.queryDataTable(access, map, page);
		} catch (Exception e) {
			e.printStackTrace(); // To change body of catch statement use File |
									// Settings | File Templates.
		}
		return null;
	}
}
