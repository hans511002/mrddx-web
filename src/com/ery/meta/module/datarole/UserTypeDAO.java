package com.ery.meta.module.datarole;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;

public class UserTypeDAO extends MetaBaseDAO {

	/**
	 * 查询所有的业务类型
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryType(Map<String, Object> data, Page page) {

		String typeName = MapUtils.getString(data, "TYPE_NAME");
		String columnSort = MapUtils.getString(data, "_COLUMN_SORT");

		String sql = "SELECT TYPE_ID,TYPE_NAME FROM META_MR_TYPE T WHERE 1 = 1 ";
		List<Object> param = new ArrayList<Object>();

		if (typeName != null && !"".equals(typeName)) {
			sql += " AND  TYPE_NAME like '%" + typeName + "%'";
		}

		if (columnSort != null && !"".equals(columnSort)) {
			sql += " ORDER BY " + columnSort;
		} else {
			sql += " ORDER BY TYPE_ID ";
		}

		if (page != null) {
			sql = SqlUtils.wrapPagingSql(getDataAccess(), sql, page);
		}
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	/**
	 * 新增业务类型
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> insertType(Map<String, Object> data) {
		Map<String, Object> map = new HashMap<String, Object>();
		boolean b = true;
		String sql;
		// 插入或修改主表
		long type_id;
		if (data.get("TYPE_ID") != null && !data.get("TYPE_ID").equals("")) {
			type_id = Convert.toLong(data.get("TYPE_ID"));
			sql = "select count(*) from META_MR_TYPE where TYPE_NAME = ? and TYPE_ID <> ?";
			int count = getDataAccess().queryForInt(sql, Convert.toString(data.get("TYPE_NAME")), type_id);
			if (count > 0) {
				map.put("RESULT", false);
				map.put("MESSAGE", "已存在的业务类型");
				return map;
			}

			sql = "UPDATE META_MR_TYPE set TYPE_NAME=? where TYPE_ID = ?";
			b = b && getDataAccess().execNoQuerySql(sql, Convert.toString(data.get("TYPE_NAME")), type_id);

		} else {
			sql = "select count(*) from META_MR_TYPE where TYPE_NAME = ?";
			int count = getDataAccess().queryForInt(sql, Convert.toString(data.get("TYPE_NAME")));
			if (count > 0) {
				map.put("RESULT", false);
				map.put("MESSAGE", "已存在的业务类型");
				return map;
			}

			type_id = super.queryForNextVal("META_MR_TYPE_ID");
			sql = "INSERT INTO META_MR_TYPE(TYPE_ID,TYPE_NAME)" + "VALUES(?, ?)";
			b = b && getDataAccess().execNoQuerySql(sql, type_id, Convert.toString(data.get("TYPE_NAME")));

		}
		map.put("RESULT", b);
		if (b) {
			map.put("MESSAGE", "保存成功");
		} else {
			map.put("MESSAGE", "保存失败");
		}
		return map;
	}

	public boolean deleteType(long userId) {
		boolean bl = true;
		String sql = "delete META_MR_USERTYPE where type_id = ?";
		bl = bl && getDataAccess().execNoQuerySql(sql, userId);
		sql = "delete META_MR_TYPE where type_id = ?";
		bl = bl && getDataAccess().execNoQuerySql(sql, userId);
		return bl;
	}

	public List<Map<String, Object>> queryUserType(Map<String, Object> data, Page page) {
		String typeid = MapUtils.getString(data, "TYPE_ID");

		String sql = "select t.*,decode(m.type_id,null,0,1) flag from meta_mag_user t left join META_MR_USERTYPE m on m.user_id = t.user_id and m.type_id = ?"
				+ " WHERE t.STATE =1";
		List<Object> param = new ArrayList<Object>();

		if (typeid != null && !"".equals(typeid)) {
			param.add(typeid);
		}

		if (page != null) {
			sql = SqlUtils.wrapPagingSql(getDataAccess(), sql, page);
		}

		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	public List<Map<String, Object>> queryTypeByUser(Map<String, Object> data) {
		String userid = MapUtils.getString(data, "USER_ID");
		String sql = "select mt.* from meta_mr_type mt inner join META_MR_USERTYPE mu on mt.type_id = mu.type_id where mu.user_id = '" +
				userid + "'";
		List<Map<String, Object>> list = getDataAccess().queryForList(sql);
		return list;
	}

	public Map<String, Object> saveUserType(Map<String, Object> data) {
		Map<String, Object> map = new HashMap<String, Object>();
		boolean bl = true;
		String sql = "delete META_MR_USERTYPE where type_id = " + data.get("typeId");
		bl = bl && getDataAccess().execNoQuerySql(sql);
		@SuppressWarnings("unchecked")
		List<String> userids = (List<String>) data.get("userIds");
		for (String userid : userids) {
			if (userid.equals("")) {
				break;
			}
			sql = "INSERT INTO META_MR_USERTYPE(TYPE_ID,USER_ID) VALUES(" + data.get("typeId") + "," + userid + ")";
			bl = bl && getDataAccess().execNoQuerySql(sql);
		}
		map.put("RESULT", bl);
		if (bl) {
			map.put("MESSAGE", "保存成功");
		} else {
			map.put("MESSAGE", "保存失败");
		}
		return map;
	}

	public List<Map<String, Object>> queryUser(Map<String, Object> data, Page page) {
		String sql = "select t.* from meta_mag_user t where 1=1 ";
		if (data != null && data.containsKey("S_USER_NAME")) {
			sql += " and t.user_namecn like '%" + data.get("S_USER_NAME") + "%'";
		}
		if (data != null && data.containsKey("SAME_USER_ID")) {
			sql += " and t.user_id in (select distinct user_id from META_MR_USERTYPE where type_id in(select  type_id  from META_MR_USERTYPE where user_id = " +
					data.get("SAME_USER_ID") + "))";
		}
		if (data != null && data.containsKey("flag") && data.get("flag").toString().equals("1")) {
			sql += " and t.user_id in (select distinct user_id from META_MR_USER_ADDACTION) order by t.user_id";
		} else {
			sql += " and t.STATE =1 order by t.user_id";
		}
		List<Object> param = new ArrayList<Object>();

		if (page != null) {
			sql = SqlUtils.wrapPagingSql(getDataAccess(), sql, page);
		}

		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	public Map<String, Object> saveUserAction(Map<String, Object> data) {
		DateFormat F = new SimpleDateFormat("yyyy-MM-dd");
		String d = F.format(new Date());
		Map<String, Object> map = new HashMap<String, Object>();
		boolean bl = true;
		String sql = "insert into META_MR_USER_ADDACTION_BAK " +
				"select t.*,sysdate from META_MR_USER_ADDACTION t where USER_ID = " + data.get("userId");
		bl = bl && getDataAccess().execNoQuerySql(sql);

		sql = "delete META_MR_USER_ADDACTION where USER_ID = " + data.get("userId");
		bl = bl && getDataAccess().execNoQuerySql(sql);
		@SuppressWarnings("unchecked")
		List<String> actionIds = (List<String>) data.get("actionIds");
		for (String actionId : actionIds) {
			if (!actionId.equals("")) {
				sql = "INSERT INTO META_MR_USER_ADDACTION(USER_ID,ACTION_TYPE,CREATE_USER_ID,CREATE_USER_DATE) VALUES(" +
						data.get("userId") + "," + actionId + "," + data.get("createUserDate") + ",'" + d + "')";
				bl = bl && getDataAccess().execNoQuerySql(sql);
			}
		}
		map.put("RESULT", bl);
		if (bl) {
			map.put("MESSAGE", "保存成功");
		} else {
			map.put("MESSAGE", "保存失败");
		}
		return map;
	}

	public List<Map<String, Object>> queryUserAction(String userid) {
		String sql = "select * from META_MR_USER_ADDACTION where user_id=" + userid;
		List<Object> param = new ArrayList<Object>();
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	public boolean deleteUserAction(String userId) {
		boolean bl = true;
		String sql = "delete META_MR_USER_ADDACTION where user_id = ?";
		bl = bl && getDataAccess().execNoQuerySql(sql, userId);
		return bl;
	}
}
