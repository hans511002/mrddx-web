package com.ery.meta.module.faq;

import java.io.ByteArrayInputStream;
import java.io.UnsupportedEncodingException;
import java.sql.Blob;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.ery.base.support.jdbc.BinaryStream;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;
import com.ery.meta.common.BlobRowListMapper;
import com.ery.meta.common.DateUtil;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

public class FaqDao extends MetaBaseDAO {

	/**
	 * 添加实施中出现的问题（提问）
	 * 
	 * @param data
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	public boolean saveAskProblem(Map<String, Object> data) throws Exception {
		String sql = "INSERT INTO META_MAG_PROBLEM_DEAL(DEAL_ID, " + " ASK_USER, ASK_AREA, ASK_DATE, PROBLEM_TITLE, "
				+ " PROBLEM_NOTE, PROBLEM_TYPE, FINISH_FLAG )"
				+ " VALUES(SEQ_MAG_PROBLEM_DEAL_ID.NEXTVAL,?,?,?,?,?,?,0)";

		ByteArrayInputStream byteIs = new ByteArrayInputStream(MapUtils.getString(data, "PROBLEM_NOTE").getBytes("GBK"));
		BinaryStream bs = new BinaryStream();
		bs.setInputStream(byteIs);

		List<Object> params = new ArrayList<Object>();
		params.add(MapUtils.getString(data, "ASK_USER"));
		params.add(Integer.parseInt(MapUtils.getString(data, "ASK_AREA")));
		params.add(new Date());
		params.add(MapUtils.getString(data, "PROBLEM_TITLE"));
		params.add(bs);
		params.add(Integer.parseInt(MapUtils.getString(data, "PROBLEM_TYPE")));

		return getDataAccess().execNoQuerySql(sql, params.toArray());
	}

	/**
	 * 根据问题主题查询问题
	 * 
	 * @param title
	 *            问题主题
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryByTitle(String title, Page page) {
		String sql = "SELECT * FROM META_MAG_PROBLEM_DEAL T WHERE 1=1 ";
		List<Object> params = new ArrayList<Object>();

		if (null != title & !"".equals(title)) {
			sql += "AND PROBLEM_TITLE LIKE ? ESCAPE '/'";
			params.add("%" + title + "%");
		}
		sql += " ORDER BY T.DEAL_ID DESC";

		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(getDataAccess(), sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
	}

	/**
	 * 
	 *
	 * 
	 * @description 实施问题处理DAO
	 * @date 13-3-20 -
	 * @modify
	 * @modifyData -
	 */

	/**
	 * 通过实施ID取得数据
	 */
	public Map<String, Object> queryFaqById(int faqId) {
		String sql = "SELECT DEAL_ID,ASK_USER,ASK_AREA,TO_CHAR(ASK_DATE,'YYYY-MM-DD') ASK_DATE,PROBLEM_TITLE,PROBLEM_NOTE,DEAL_USER_ID,DEAL_TIME,to_char(FINISH_DATE,'YYYY-MM-DD') FINISH_DATE,PROBLEM_TYPE,DEAL_NOTE,RETURN_NOTE,NEXT_NOTE,FINISH_FLAG FROM META_MAG_PROBLEM_DEAL WHERE DEAL_ID = ?";
		Map<String, Object> maps = getDataAccess().queryForMap(sql, faqId);
		String result = "";
		String result1 = "";
		if (maps.get("FINISH_FLAG") == null)
			maps.put("FINISH_FLAG", "");
		Blob blob = (Blob) maps.get("PROBLEM_NOTE");
		Blob blob1 = (Blob) maps.get("DEAL_NOTE");
		try {
			if (blob != null)
				result = new String(blob.getBytes((long) 1, (int) blob.length()));
			if (blob1 != null)
				result1 = new String(blob1.getBytes((long) 1, (int) blob1.length()));
		} catch (SQLException e) {
			LogUtils.error("转换BLOB为字符串时出错：" + e.getMessage());
		}
		maps.put("PROBLEM_NOTE", result);
		maps.put("DEAL_NOTE", result1);
		return maps;
	}

	/**
	 * 处理实施问题处理
	 * 
	 * @param data
	 * @return
	 */
	public int updateFaq(Map<String, Object> data) {
		String sql = "UPDATE META_MAG_PROBLEM_DEAL SET DEAL_USER_ID =?,DEAL_TIME=?,FINISH_DATE=?,PROBLEM_TYPE=?,DEAL_NOTE=?,RETURN_NOTE=?,NEXT_NOTE=?,FINISH_FLAG=? WHERE DEAL_ID =? ";
		BinaryStream initDataStm = new BinaryStream();
		try {
			ByteArrayInputStream ics = new ByteArrayInputStream(Convert.toString(data.get("DEAL_NOTE"), "").getBytes(
					"GBK"));
			initDataStm.setInputStream(ics);
			return getDataAccess().execUpdate(sql, Convert.toString(data.get("DEAL_USER_ID")),
					Convert.toString(data.get("DEAL_TIME")),
					DateUtil.getDateTimeByString(Convert.toString(data.get("FINISH_DATE")), "yyyy-mm-dd"),
					Convert.toString(data.get("PROBLEM_TYPE")), initDataStm, Convert.toString(data.get("RETURN_NOTE")),
					Convert.toString(data.get("NEXT_NOTE")), Convert.toString(data.get("FINISH_FLAG")),
					Convert.toInt(data.get("DEAL_ID")));

		} catch (Exception e) {
			LogUtils.error("保存实施处理时出错:" + e.getMessage());
			return 0;
		}

	}

	public List<Map<String, Object>> queryForFaq(Map<String, Object> data, Page page) {

		String sql = "SELECT PROBLEM_TITLE,PROBLEM_TYPE,ASK_USER,ASK_DATE,ASK_AREA,FINISH_FLAG,DEAL_ID FROM META_MAG_PROBLEM_DEAL  WHERE 1=1";
		List<Object> params = new ArrayList<Object>();
		int finish_flag = Convert.toInt(MapUtils.getString(data, "FINISH_FLAG"), -1);
		String title = MapUtils.getString(data, "KEYWORD");
		int ask_area = Convert.toInt(MapUtils.getString(data, "ASK_AREA"), -1);

		if (null != title & !"".equals(title)) {
			sql += "AND PROBLEM_TITLE LIKE ? ESCAPE '/'";
			params.add("%" + title + "%");
		}
		if (finish_flag != -1) {
			sql += "AND FINISH_FLAG = ? ";
			params.add(finish_flag);
		}
		if (ask_area != -1) {
			sql += "AND ASK_AREA = ? ";
			params.add(ask_area);
		}

		sql += " ORDER BY DEAL_ID DESC";

		// 分页包装
		if (page != null) {
			sql = SqlUtils.wrapPagingSql(getDataAccess(), sql, page);
		}
		return getDataAccess().queryByRowMapper(sql, new BlobRowListMapper("GBK"), params.toArray());
	}
}
