package com.ery.meta.module.rule;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.BlobRowListMapper;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;


public class FileImpDao extends MetaBaseDAO {
	/**
	 * 查询动态入库映射列表
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryFileImpList(Map<String, Object> data, Page page) {
		String hbaseName = MapUtils.getString(data, "FILE_TYPE");
		String sql = "SELECT T.FILE_TYPE,T.FILETYPE_IMP_REL_ID,T.IMP_RULE FROM  TB_CDR_FILE_TYPE_IMP_REL T WHERE 1=1 ";
		List<Object> params = new ArrayList<Object>();
		if (null != hbaseName & !"".equals(hbaseName)) {
			hbaseName = hbaseName.replaceAll("/", "//").replaceAll("_", "/_").replaceAll("%", "/%");
			sql += "AND T.FILE_TYPE LIKE ? ESCAPE '/'";
			params.add("%" + hbaseName + "%");
		}
		sql += "ORDER BY T.FILETYPE_IMP_REL_ID DESC";
		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
	}

	/**
	 * 保存动态入库映射
	 * 
	 * @param data
	 */
	public void saveFileImp(Map<String, Object> data) {
		String sql = "";
		long filetypeImpRelId = MapUtils.getIntValue(data, "filetypeImpRelId", -1);
		try {
			// 增加
			if (filetypeImpRelId == -1) {
				sql = "INSERT INTO TB_CDR_FILE_TYPE_IMP_REL(FILETYPE_IMP_REL_ID,IMP_RULE,FILE_TYPE)VALUES(?,?,?)";
				List<Object> params = new ArrayList<Object>();
				filetypeImpRelId = queryForNextVal("SEQ_TB_IMP_REL_ID");
				params.add(filetypeImpRelId);
				params.add(MapUtils.getString(data, "impRule"));
				params.add(MapUtils.getString(data, "fileType"));

				getDataAccess().execNoQuerySql(sql, params.toArray());
			} else {
				// 修改
				sql = "UPDATE TB_CDR_FILE_TYPE_IMP_REL SET IMP_RULE=?, FILE_TYPE=? WHERE FILETYPE_IMP_REL_ID = ?";
				getDataAccess().execUpdate(sql, Convert.toString(data.get("impRule")),
						Convert.toString(data.get("fileType")), filetypeImpRelId);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * 删除动态入库映射
	 * 
	 * @param id 映射ID
	 */
	public void deleteFileImp(String id) {
		String sql = "DELETE FROM TB_CDR_FILE_TYPE_IMP_REL WHERE FILETYPE_IMP_REL_ID=?";
		getDataAccess().execNoQuerySql(sql, Convert.toInt(id));
	}

}
