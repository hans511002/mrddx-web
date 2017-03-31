package com.ery.meta.module.bigdata.datax;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.web.session.SessionManager;

import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.base.support.jdbc.BinaryStream;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**

 * 

 * @description
 * @date 2013-08-13
 */
public class CollectionDAO extends MetaBaseDAO {

	/**
	 * 查询所有的采集数据信息
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryJob(Map<String, Object> data, Page page) {
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		String userId = formatUser.get("userId").toString();
		String rolesql = "select count(*) from META_MR_USER_ADDACTION where action_type = 5001 and user_id = " + userId;

		String dataTypeId = MapUtils.getString(data, "COL_DATATYPE");
		String col_origin = MapUtils.getString(data, "COL_ORIGIN");
		String collectJobName = MapUtils.getString(data, "COLLECT_JOB_NAME");
		String columnSort = MapUtils.getString(data, "_COLUMN_SORT");

		String sql = "SELECT COL_ID,COL_NAME,COL_ORIGIN,COL_TYPE,COL_DATATYPE,COL_STATUS,COL_DESCRIBE,"
				+ " decode(m.view_action,null,0,m.view_action) \"VIEW\",decode(m.modify_action,null,0,m.modify_action) modi,decode(m.delete_action,null,0,m.delete_action) del,"
				+ " decode(m.create_user_id," + userId + ",1,0) creater" + " FROM MR_FTP_COL_JOB T "
				+ " left join META_MR_USER_AUTHOR m on m.user_id= " + userId
				+ " and m.task_id = T.COL_ID and m.task_type =1" + " WHERE 1 = 1 ";

		if (getDataAccess().queryForInt(rolesql) == 0) {
			sql += " and (COL_ID in (select task_id from META_MR_USER_AUTHOR where task_type=1 and user_id = " + userId
					+ ") or COL_ORIGIN = 1 )";
		}
		rolesql = "select count(*) from META_MR_USER_ADDACTION where action_type = 6001 and user_id = " + userId;
		if (getDataAccess().queryForInt(rolesql) == 0) {
			sql += " and (COL_ID in (select task_id from META_MR_USER_AUTHOR where task_type=1 and user_id = " + userId
					+ ") or COL_ORIGIN = 0 )";
		}
		List<Object> param = new ArrayList<Object>();

		if (!dataTypeId.isEmpty()) {
			sql += " AND  COL_DATATYPE = " + dataTypeId;
		}

		if (!collectJobName.isEmpty()) {
			collectJobName = collectJobName.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += " AND  COL_NAME LIKE " + "'%" + collectJobName + "%' ESCAPE '/'";
		}
		if (!col_origin.isEmpty()) {
			sql += " AND  COL_ORIGIN = " + col_origin;
		}

		if (columnSort != null && !"".equals(columnSort)) {
			sql += " ORDER BY " + columnSort;
		} else {
			sql += " ORDER BY COL_ID ";
		}

		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 根据ID查询数据类型参数表
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryParamById(Map<String, Object> data, Page page) {
		String COL_ID = MapUtils.getString(data, "COL_ID");
		String sql = "SELECT T.*,IDS.DATA_SOURCE_NAME INPUT_DATASOURCE_NAME,"
				+ " IFS.DATA_SOURCE_NAME INPUT_FILELST_DATASOURCE_NAME,"
				+ " ODS.DATA_SOURCE_NAME OUTPUT_DATASOURCE_NAME," + " IDST.SOURCE_NAME INPUT_SOURCE_NAME,"
				+ " IFST.SOURCE_NAME INPUT_FILELST_SOURCE_NAME," + " ODST.SOURCE_NAME OUTPUT_SOURCE_NAME"
				+ " FROM MR_FTP_COL_JOBPARAM T" + " INNER JOIN MR_FTP_COL_JOB J ON J.COL_ID = T.COL_ID"
				+ " LEFT JOIN MR_DATA_SOURCE IDS ON  T.INPUT_DATASOURCE_ID = IDS.DATA_SOURCE_ID"
				+ " LEFT JOIN MR_DATA_SOURCE IFS ON  T.INPUT_FILELST_DATASOURCE_ID = IFS.DATA_SOURCE_ID"
				+ " LEFT JOIN MR_DATA_SOURCE ODS ON  T.OUTPUT_DATASOURCE_ID = ODS.DATA_SOURCE_ID"
				+ " LEFT JOIN MR_SOURCE_TYPE IDST ON IDS.SOURCE_TYPE_ID = IDST.SOURCE_TYPE_ID"
				+ " LEFT JOIN MR_SOURCE_TYPE IFST ON IFS.SOURCE_TYPE_ID = IFST.SOURCE_TYPE_ID"
				+ " LEFT JOIN MR_SOURCE_TYPE ODST ON ODS.SOURCE_TYPE_ID = ODST.SOURCE_TYPE_ID" + " WHERE T.COL_ID = '"
				+ COL_ID + "'";
		List<Object> param = new ArrayList<Object>();

		sql += " ORDER BY ID desc";

		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 新增采集任务表
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> insertJob(Map<String, Object> data) {
		Map<String, Object> map = new HashMap<String, Object>();
		boolean b = true;
		String sql;
		// 插入或修改主表
		long col_id;
		if (data.get("COL_ID") != null && !data.get("COL_ID").equals("")) {
			col_id = Convert.toLong(data.get("COL_ID"));
			Object pluginCode = MapUtils.getString(data, "PLUGIN_CODE", "");
			BinaryStream bs = StringUtil.convertStringtoBinaryStream(pluginCode);
			sql = "UPDATE MR_FTP_COL_JOB set COL_NAME=?,COL_TYPE=?,COL_ORIGIN=?,COL_DATATYPE=?,COL_DESCRIBE=?,COL_TASK_NUMBER=?,COL_TASK_PRIORITY=?,COL_SYS_INPUTPATH=?,COL_RUN_DATASOURCE=?, PLUGIN_CODE=? where COL_ID = ?";
			b = b
					&& getDataAccess().execNoQuerySql(sql, Convert.toString(data.get("COL_NAME")),
							Convert.toString(data.get("COL_TYPE")), Convert.toString(data.get("COL_ORIGIN")),
							Convert.toString(data.get("COL_DATATYPE")), Convert.toString(data.get("COL_DESCRIBE")),
							Convert.toString(data.get("COL_TASK_NUMBER")),
							Convert.toString(data.get("COL_TASK_PRIORITY")),
							Convert.toString(data.get("COL_SYS_INPUTPATH")),
							Convert.toString(data.get("COL_RUN_DATASOURCE")), bs, col_id);
			if (Convert.toString(data.get("COL_ORIGIN")).equals("0")) {
				sql = "UPDATE MR_FTP_COL_JOBPARAM set OUTPUT_DATASOURCE_ID=?,OUTPUT_PATH=? where COL_ID = ?";
				b = b
						&& getDataAccess().execNoQuerySql(sql, Convert.toString(data.get("OUTPUT_DATASOURCE_ID")),
								Convert.toString(data.get("OUTPUT_PATH")), col_id);

			} else {
				sql = "UPDATE MR_FTP_COL_JOBPARAM set INPUT_DATASOURCE_ID=?,INPUT_FILELST_TYPE=?,INPUT_FILELST_DATASOURCE_ID=?,INPUT_QUERY_SQL=?,INPUT_PATH=?,INPUT_FILE_RULE=?,"
						+ "INPUT_DOTYPE=?,INPUT_MOVE_PATH=?,INPUT_RENAME_RULE=? where COL_ID = ?";
				b = b
						&& getDataAccess().execNoQuerySql(sql, Convert.toString(data.get("INPUT_DATASOURCE_ID")),
								Convert.toString(data.get("INPUT_FILELST_TYPE")),
								Convert.toString(data.get("INPUT_FILELST_DATASOURCE_ID")),
								Convert.toString(data.get("INPUT_QUERY_SQL")),
								Convert.toString(data.get("INPUT_PATH")),
								Convert.toString(data.get("INPUT_FILE_RULE")),
								Convert.toString(data.get("INPUT_DOTYPE")),
								Convert.toString(data.get("INPUT_MOVE_PATH")),
								Convert.toString(data.get("INPUT_RENAME_RULE")), col_id);

			}

		} else {
			col_id = super.queryForNextVal("COL_JOB_COL_ID");
			while (super.checkId(col_id, "MR_FTP_COL_JOB", "COL_ID")) {
				col_id = super.queryForNextVal("COL_JOB_COL_ID");
			}
			Object pluginCode = MapUtils.getString(data, "PLUGIN_CODE", "");
			BinaryStream bs = StringUtil.convertStringtoBinaryStream(pluginCode);
			sql = "INSERT INTO MR_FTP_COL_JOB(COL_ID,COL_NAME,COL_TYPE,COL_ORIGIN,COL_DATATYPE,COL_STATUS,COL_DESCRIBE,COL_TASK_NUMBER,COL_TASK_PRIORITY,COL_SYS_INPUTPATH,COL_RUN_DATASOURCE,PLUGIN_CODE)"
					+ "VALUES(?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?)";
			b = b
					&& getDataAccess().execNoQuerySql(sql, col_id, Convert.toString(data.get("COL_NAME")),
							Convert.toString(data.get("COL_TYPE")), Convert.toString(data.get("COL_ORIGIN")),
							Convert.toString(data.get("COL_DATATYPE")), 1, Convert.toString(data.get("COL_DESCRIBE")),
							Convert.toString(data.get("COL_TASK_NUMBER")),
							Convert.toString(data.get("COL_TASK_PRIORITY")),
							Convert.toString(data.get("COL_SYS_INPUTPATH")),
							Convert.toString(data.get("COL_RUN_DATASOURCE")), bs);

		}

		// 插入或修改从表
		if (data.get("COL_PAR_ID") != null && !data.get("COL_PAR_ID").equals("")) {
			long col_par_id = Convert.toLong(data.get("COL_PAR_ID"));
			if (Convert.toString(data.get("COL_ORIGIN")).equals("0")) {
				// 检查下载数据源是否重复
				sql = "SELECT COUNT(*) FROM MR_FTP_COL_JOBPARAM T WHERE COL_ID=? AND ID!=? AND T.INPUT_DATASOURCE_ID=? AND ((T.INPUT_FILELST_TYPE=? AND T.INPUT_PATH=?) or (T.INPUT_FILELST_TYPE=? AND T.INPUT_FILELST_DATASOURCE_ID=? AND upper(replace(T.INPUT_QUERY_SQL,' ',''))=upper(replace(?,' ',''))))";
				if (getDataAccess().queryForInt(sql, col_id, col_par_id,
						Convert.toString(data.get("INPUT_DATASOURCE_ID")),
						Convert.toString(data.get("INPUT_FILELST_TYPE")), Convert.toString(data.get("INPUT_PATH")),
						Convert.toString(data.get("INPUT_FILELST_TYPE")),
						Convert.toString(data.get("INPUT_FILELST_DATASOURCE_ID")),
						Convert.toString(data.get("INPUT_QUERY_SQL"))) > 0) {
					map.put("RESULT", false);
					map.put("COL_ID", col_id);
					map.put("MESSAGE", "相同的输入数据源配置！");
					return map;
				}
			} else {
				// 检查上传数据源是否重复
				sql = "SELECT COUNT(*) FROM MR_FTP_COL_JOBPARAM T WHERE COL_ID=? AND ID!=? AND T.OUTPUT_DATASOURCE_ID=? AND T.OUTPUT_PATH =?";
				if (getDataAccess().queryForInt(sql, col_id, col_par_id,
						Convert.toString(data.get("OUTPUT_DATASOURCE_ID")), Convert.toString(data.get("OUTPUT_PATH"))) > 0) {
					map.put("RESULT", false);
					map.put("COL_ID", col_id);
					map.put("MESSAGE", "相同的输出数据源配置！");
					return map;
				}
			}

			sql = "UPDATE MR_FTP_COL_JOBPARAM set INPUT_DATASOURCE_ID=?,INPUT_FILELST_TYPE=?,INPUT_FILELST_DATASOURCE_ID=?,INPUT_QUERY_SQL=?,INPUT_PATH=?,INPUT_FILE_RULE=?,"
					+ "INPUT_DOTYPE=?,INPUT_MOVE_PATH=?,INPUT_RENAME_RULE=?,NOTE=?,OUTPUT_DATASOURCE_ID=?,OUTPUT_PATH=?,OUTPUT_RENAME_RULE=?,OUTPUT_MOVE_PATH=?,INPUT_RENAME=?,OUTPUT_RENAME=?,IS_COMPRESS=? where ID = ?";
			b = b
					&& getDataAccess().execNoQuerySql(sql, Convert.toString(data.get("INPUT_DATASOURCE_ID")),
							Convert.toString(data.get("INPUT_FILELST_TYPE")),
							Convert.toString(data.get("INPUT_FILELST_DATASOURCE_ID")),
							Convert.toString(data.get("INPUT_QUERY_SQL")), Convert.toString(data.get("INPUT_PATH")),
							Convert.toString(data.get("INPUT_FILE_RULE")), Convert.toString(data.get("INPUT_DOTYPE")),
							Convert.toString(data.get("INPUT_MOVE_PATH")),
							Convert.toString(data.get("INPUT_RENAME_RULE")), Convert.toString(data.get("NOTE")),
							Convert.toString(data.get("OUTPUT_DATASOURCE_ID")),
							Convert.toString(data.get("OUTPUT_PATH")),
							Convert.toString(data.get("OUTPUT_RENAME_RULE")),
							Convert.toString(data.get("OUTPUT_MOVE_PATH")), Convert.toString(data.get("INPUT_RENAME")),
							Convert.toString(data.get("OUTPUT_RENAME")), Convert.toInt(data.get("IS_COMPRESS")),
							col_par_id);
		} else {

			if (Convert.toString(data.get("COL_ORIGIN")).equals("0")) {
				// 检查下载数据源是否重复
				sql = "SELECT COUNT(*) FROM MR_FTP_COL_JOBPARAM T WHERE COL_ID=? AND T.INPUT_DATASOURCE_ID=? AND ((T.INPUT_FILELST_TYPE=? AND T.INPUT_PATH=?) or (T.INPUT_FILELST_TYPE=? AND T.INPUT_FILELST_DATASOURCE_ID=? AND upper(replace(T.INPUT_QUERY_SQL,' ',''))=upper(replace(?,' ',''))))";
				if (getDataAccess().queryForInt(sql, col_id, Convert.toString(data.get("INPUT_DATASOURCE_ID")),
						Convert.toString(data.get("INPUT_FILELST_TYPE")), Convert.toString(data.get("INPUT_PATH")),
						Convert.toString(data.get("INPUT_FILELST_TYPE")),
						Convert.toString(data.get("INPUT_FILELST_DATASOURCE_ID")),
						Convert.toString(data.get("INPUT_QUERY_SQL"))) > 0) {
					map.put("RESULT", false);
					map.put("COL_ID", col_id);
					map.put("MESSAGE", "保存失败，相同的输入数据源配置！");
					return map;
				}
			} else {
				// 检查上传数据源是否重复
				sql = "SELECT COUNT(*) FROM MR_FTP_COL_JOBPARAM T WHERE COL_ID=? AND T.OUTPUT_DATASOURCE_ID=? AND T.OUTPUT_PATH =?";
				if (getDataAccess().queryForInt(sql, col_id, Convert.toString(data.get("OUTPUT_DATASOURCE_ID")),
						Convert.toString(data.get("OUTPUT_PATH"))) > 0) {
					map.put("RESULT", false);
					map.put("COL_ID", col_id);
					map.put("MESSAGE", "保存失败，相同的输出数据源配置！");
					return map;
				}
			}

			long col_par_id = super.queryForNextVal("COL_JOBPARAM_ID");
			while (super.checkId(col_par_id, "MR_FTP_COL_JOBPARAM", "ID")) {
				col_par_id = super.queryForNextVal("COL_JOBPARAM_ID");
			}
			sql = "INSERT INTO MR_FTP_COL_JOBPARAM(ID,COL_ID,INPUT_DATASOURCE_ID,INPUT_FILELST_TYPE,INPUT_FILELST_DATASOURCE_ID,INPUT_QUERY_SQL,INPUT_PATH,INPUT_FILE_RULE,"
					+ "INPUT_DOTYPE,INPUT_MOVE_PATH,INPUT_RENAME_RULE,NOTE,OUTPUT_DATASOURCE_ID,OUTPUT_PATH,OUTPUT_RENAME_RULE,OUTPUT_MOVE_PATH,INPUT_RENAME,OUTPUT_RENAME,IS_COMPRESS)"
					+ "VALUES(?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)";
			b = b
					&& getDataAccess().execNoQuerySql(sql, col_par_id, col_id,
							Convert.toString(data.get("INPUT_DATASOURCE_ID")),
							Convert.toString(data.get("INPUT_FILELST_TYPE")),
							Convert.toString(data.get("INPUT_FILELST_DATASOURCE_ID")),
							Convert.toString(data.get("INPUT_QUERY_SQL")), Convert.toString(data.get("INPUT_PATH")),
							Convert.toString(data.get("INPUT_FILE_RULE")), Convert.toString(data.get("INPUT_DOTYPE")),
							Convert.toString(data.get("INPUT_MOVE_PATH")),
							Convert.toString(data.get("INPUT_RENAME_RULE")), Convert.toString(data.get("NOTE")),
							Convert.toString(data.get("OUTPUT_DATASOURCE_ID")),
							Convert.toString(data.get("OUTPUT_PATH")),
							Convert.toString(data.get("OUTPUT_RENAME_RULE")),
							Convert.toString(data.get("OUTPUT_MOVE_PATH")), Convert.toString(data.get("INPUT_RENAME")),
							Convert.toString(data.get("OUTPUT_RENAME")), Convert.toString(data.get("IS_COMPRESS")));

		}
		map.put("RESULT", b);
		map.put("COL_ID", col_id);
		map.put("MESSAGE", "");
		return map;
	}

	public boolean deleteJob(long collectJobId) {
		boolean bl = true;
		String sql = "DELETE FROM MR_FTP_COL_JOBPARAM WHERE COL_ID =?";
		bl = bl && getDataAccess().execNoQuerySql(sql, collectJobId);
		sql = "DELETE FROM MR_FTP_COL_JOB WHERE COL_ID =?";
		bl = bl && getDataAccess().execNoQuerySql(sql, collectJobId);
		return bl;
	}

	public Map<String, Object> queryJobById(String id) {
		String sql = "SELECT A.COL_NAME,A.COL_ORIGIN,A.COL_TYPE,A.COL_DATATYPE,A.COL_STATUS,A.COL_DESCRIBE,A.COL_TASK_NUMBER,A.COL_TASK_PRIORITY,A.COL_TASK_PRIORITY,A.COL_SYS_INPUTPATH,A.COL_RUN_DATASOURCE,A.PLUGIN_CODE,SDS.DATA_SOURCE_NAME COL_RUN_DATASOURCE_NAME,"
				+ " T.*,IDS.DATA_SOURCE_NAME INPUT_DATASOURCE_NAME,"
				+ " IFS.DATA_SOURCE_NAME INPUT_FILELST_DATASOURCE_NAME,"
				+ " ODS.DATA_SOURCE_NAME OUTPUT_DATASOURCE_NAME,"
				+ " IDST.SOURCE_NAME INPUT_SOURCE_NAME,"
				+ " IFST.SOURCE_NAME INPUT_FILELST_SOURCE_NAME,"
				+ " ODST.SOURCE_NAME OUTPUT_SOURCE_NAME"
				+ " FROM MR_FTP_COL_JOBPARAM T"
				+ " INNER JOIN MR_FTP_COL_JOB A ON A.COL_ID = T.COL_ID"
				+ " LEFT JOIN MR_DATA_SOURCE SDS ON A.COL_RUN_DATASOURCE = SDS.DATA_SOURCE_ID"
				+ " LEFT JOIN MR_DATA_SOURCE IDS ON  T.INPUT_DATASOURCE_ID = IDS.DATA_SOURCE_ID"
				+ " LEFT JOIN MR_DATA_SOURCE IFS ON  T.INPUT_FILELST_DATASOURCE_ID = IFS.DATA_SOURCE_ID"
				+ " LEFT JOIN MR_DATA_SOURCE ODS ON  T.OUTPUT_DATASOURCE_ID = ODS.DATA_SOURCE_ID"
				+ " LEFT JOIN MR_SOURCE_TYPE IDST ON IDS.SOURCE_TYPE_ID = IDST.SOURCE_TYPE_ID"
				+ " LEFT JOIN MR_SOURCE_TYPE IFST ON IFS.SOURCE_TYPE_ID = IFST.SOURCE_TYPE_ID"
				+ " LEFT JOIN MR_SOURCE_TYPE ODST ON ODS.SOURCE_TYPE_ID = ODST.SOURCE_TYPE_ID"
				+ " WHERE A.COL_ID = ? AND ROWNUM = 1";
		return getDataAccess().queryForMap(sql, id);
	}

	public boolean statusJob(long collectJobId, int status) {
		boolean bl = true;
		String sql = "UPDATE MR_FTP_COL_JOB SET COL_STATUS=? WHERE COL_ID =?";
		bl = bl && getDataAccess().execNoQuerySql(sql, status, collectJobId);

		return bl;
	}

	public boolean deletePar(long collectParId) {
		boolean bl = true;
		String sql = "DELETE FROM MR_FTP_COL_JOBPARAM WHERE ID =?";
		bl = bl && getDataAccess().execNoQuerySql(sql, collectParId);
		return bl;
	}

	public int getCountParByParId(long collectParId) {
		String sql = "select count(*) FROM MR_FTP_COL_JOBPARAM WHERE COL_ID = (SELECT COL_ID FROM MR_FTP_COL_JOBPARAM WHERE ID = ?)";
		return getDataAccess().queryForInt(sql, collectParId);
	}
}
