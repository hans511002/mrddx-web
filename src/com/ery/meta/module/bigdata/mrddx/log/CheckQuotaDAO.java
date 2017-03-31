package com.ery.meta.module.bigdata.mrddx.log;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

import com.ery.base.support.utils.MapUtils;


public class CheckQuotaDAO extends MetaBaseDAO {
	/**
	 * 查询HDFS配额表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryQuota(Map<String, Object> data, Page page) {
		String columnSort = MapUtils.getString(data, "_COLUMN_SORT");
		String fileName = MapUtils.getString(data, "FILE_NAME");
		String dateNo = MapUtils.getString(data, "DATE_NO");
		String sql = "SELECT T.FILE_NAME,T.MONTH_NO,T.DATE_NO,TO_DATE(T.CURRENT_DATE, 'YYYY-MM-DD HH24:MI:SS') CURRENT_DATE,T.DIR_COUNT,T.FILE_COUNT,TO_CHAR((T.CONTENT_SIZE/1024/1024/1024/1024)*3,'FM99999990.00') AS CONTENT_SIZE,TO_CHAR((T.SPACE_QUOTA/1024/1024/1024/1024),'FM99999990.00') AS SPACE_QUOTA,TO_CHAR((T.REMAINING_SPACE_QUOTA/1024/1024/1024/1024),'FM99999990.00') AS REMAINING_SPACE_QUOTA,TO_CHAR((((T.SPACE_QUOTA-T.REMAINING_SPACE_QUOTA) / T.SPACE_QUOTA )*100),'FM99999990.00') || '%' AS USE_PERCENTAGE,TO_CHAR(((T.REMAINING_SPACE_QUOTA / T.SPACE_QUOTA )*100),'FM99999990.00') || '%' AS REMAIN_PERCENTAGE  FROM HDFS_QUOTA_TABLE T WHERE 1=1 ";
		if (!fileName.isEmpty()) {
			fileName = fileName.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += " AND T.FILE_NAME LIKE " + "'" + "%" + fileName + "%" + "' ESCAPE '/'";
		}
		if (!dateNo.isEmpty()) {
			dateNo = dateNo.replace("-", "");
			sql += " AND T.DATE_NO LIKE " + "'" + "%" + dateNo + "%" + "'";
		}
		// sql += " ORDER BY T.MONTH_NO ";
		if (columnSort != null && !"".equals(columnSort)) {
			sql += " ORDER BY T." + columnSort;
		} else {
			sql += " ORDER BY T.CURRENT_DATE ";
		}

		List<Object> param = new ArrayList<Object>();
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 通过HDFS目录名查询HDFS配额表
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryQuotaByfileName(Map<String, Object> data) {
		String fileName = MapUtils.getString(data, "FILE_NAME");
		String sql = " SELECT T.FILE_NAME,T.MONTH_NO,T.DATE_NO,TO_DATE(T.CURRENT_DATE, 'YYYY-MM-DD HH24:MI:SS') CURRENT_DATE,T.DIR_COUNT,T.FILE_COUNT,TO_CHAR((T.CONTENT_SIZE/1024/1024/1024/1024)*3,'FM99999990.00') AS CONTENT_SIZE,TO_CHAR((T.SPACE_QUOTA/1024/1024/1024/1024),'FM99999990.00') AS SPACE_QUOTA,TO_CHAR((T.REMAINING_SPACE_QUOTA/1024/1024/1024/1024),'FM99999990.00') AS REMAINING_SPACE_QUOTA,TO_CHAR((((T.SPACE_QUOTA-T.REMAINING_SPACE_QUOTA) / T.SPACE_QUOTA )*100),'FM99999990.00') || '%' AS USE_PERCENTAGE,TO_CHAR(((T.REMAINING_SPACE_QUOTA / T.SPACE_QUOTA )*100),'FM99999990.00') || '%' AS REMAIN_PERCENTAGE  FROM HDFS_QUOTA_TABLE T WHERE 1=1 ";
		if (!fileName.isEmpty()) {
			fileName = fileName.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += " AND T.FILE_NAME LIKE " + "'" + "%" + fileName + "%" + "' ESCAPE '/'";
		}
		sql += " ORDER BY  T.CURRENT_DATE DESC";
		List<Object> param = new ArrayList<Object>();
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}
}
