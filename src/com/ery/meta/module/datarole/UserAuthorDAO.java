package com.ery.meta.module.datarole;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.Page;
import com.ery.meta.common.SqlUtils;
import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.web.session.SessionManager;

/**
 * 
 * 
 * 
 * @description
 * @date 2013-08-13
 */
public class UserAuthorDAO extends MetaBaseDAO {

	/**
	 * 查询所有的业务类型
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryAuthor(Map<String, Object> data, Page page) {

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
			sql = SqlUtils.wrapPagingSql(sql, page);
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
	public Map<String, Object> insertAuthor(Map<String, Object> data) {
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

	public boolean deleteAuthor(long userId) {
		boolean bl = true;
		String sql = "delete META_MR_USERTYPE where type_id = ?";
		bl = bl && getDataAccess().execNoQuerySql(sql, userId);
		sql = "delete META_MR_TYPE where type_id = ?";
		bl = bl && getDataAccess().execNoQuerySql(sql, userId);
		return bl;
	}

	public List<Map<String, Object>> queryUserAuthor(Map<String, Object> data, Page page) {
		String task_type = MapUtils.getString(data, "tasktype");
		String jobId = MapUtils.getString(data, "jobId");
		String sql = "";
		if (jobId != null && !jobId.equals("")) {
			sql = "select t.user_id,t.user_namecn,decode(m.view_action,null,0,m.view_action) \"view\",decode(m.modify_action,null,0,m.modify_action) modi,decode(m.delete_action,null,0,m.delete_action) del from meta_mag_user t left join META_MR_USER_AUTHOR m on m.user_id = t.user_id and m.task_type = " +
					task_type + " and m.task_id= " + jobId + " and t.STATE =1";
		} else {
			sql = "select t.user_id,t.user_namecn,0 \"view\",0 modi,0 del from meta_mag_user t";
		}
		List<Object> param = new ArrayList<Object>();

		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}

		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	public boolean insertUserAuthor(String tasktype, String jobid) {
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		String createUserId = formatUser.get("userId").toString();
		DateFormat F = new SimpleDateFormat("yyyy-MM-dd");
		String d = F.format(new Date());
		String sql = "INSERT INTO META_MR_USER_AUTHOR(USER_ID,TASK_ID,TASK_TYPE,VIEW_ACTION,MODIFY_ACTION,DELETE_ACTION,CREATE_USER_ID,STATUS,CREATE_DATE) VALUES(" +
				createUserId + "," + jobid + "," + tasktype + ",1,1,1," + createUserId + ",1,'" + d + "')";
		return getDataAccess().execNoQuerySql(sql);
	}

	public Map<String, Object> saveUserAuthor(Map<String, Object> data) {
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		String createUserId = formatUser.get("userId").toString();
		String tasktype = data.get("tasktype").toString();
		List<String> jobIds = (List<String>) data.get("jobIds");
		List<Map<String, Object>> userAuthorData = (List<Map<String, Object>>) data.get("userAuthorData");
		DateFormat F = new SimpleDateFormat("yyyy-MM-dd");
		String d = F.format(new Date());
		boolean bl = true;

		for (String jobId : jobIds) {
			for (Map<String, Object> map : userAuthorData) {
				String sql = "insert into META_MR_USER_AUTHOR_BAK " +
						"select t.*,sysdate from META_MR_USER_AUTHOR t where user_id <> " + createUserId +
						" and  user_id = " + map.get("userid") + " and TASK_ID = " + jobId + " and TASK_TYPE = " +
						tasktype;
				bl = bl && getDataAccess().execNoQuerySql(sql);

				sql = "delete META_MR_USER_AUTHOR where user_id <> " + createUserId + " and  user_id = " +
						map.get("userid") + " and TASK_ID = " + jobId + " and TASK_TYPE = " + tasktype;
				bl = bl && getDataAccess().execNoQuerySql(sql);
				if (map.get("view").toString().equals("1") || map.get("modi").toString().equals("1") ||
						map.get("del").toString().equals("1")) {
					if (!map.get("userid").toString().equals(createUserId)) {
						sql = "INSERT INTO META_MR_USER_AUTHOR(USER_ID,TASK_ID,TASK_TYPE,VIEW_ACTION,MODIFY_ACTION,DELETE_ACTION,CREATE_USER_ID,STATUS,CREATE_DATE) VALUES(" +
								map.get("userid") +
								"," +
								jobId +
								"," +
								tasktype +
								"," +
								map.get("view") +
								"," +
								map.get("modi") + "," + map.get("del") + "," + createUserId + ",1,'" + d + "')";
						bl = bl && getDataAccess().execNoQuerySql(sql);
					}
				}
			}
		}

		Map<String, Object> map = new HashMap<String, Object>();
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
		if (data != null && data.containsKey("flag") && data.get("flag").toString().equals("1")) {
			sql += "and t.user_id in (select distinct user_id from META_MR_USER_ADDACTION) order by t.user_id";
		} else {
			sql += "and t.STATE =1 order by t.user_id";
		}
		List<Object> param = new ArrayList<Object>();

		if (page != null) {
			sql = SqlUtils.wrapPagingSql(sql, page);
		}

		List<Map<String, Object>> list = getDataAccess().queryForList(sql, param.toArray());
		return list;
	}

	public Map<String, Object> getJobUser(String taskId, String taskType) {
		String sql = "select * from META_MAG_USER where user_id=" +
				"(select create_user_id from META_MR_USER_AUTHOR where rownum = 1 and create_user_id = user_id and task_id = " +
				taskId + " and task_type = " + taskType + ")";
		return getDataAccess().queryForMap(sql);
	}

	public Map<String, Object> changeCreateUser(Map<String, Object> data) {
		String taskId = data.get("taskId").toString();
		String taskType = data.get("taskType").toString();
		String fromUserId = data.get("fromUserId").toString();
		String toUserId = data.get("toUserId").toString();
		DateFormat F = new SimpleDateFormat("yyyy-MM-dd");
		String d = F.format(new Date());

		Boolean bl = true;
		String sql = " delete META_MR_USER_AUTHOR where TASK_ID = " + taskId + " and TASK_TYPE = " + taskType +
				" and USER_ID=" + toUserId;
		bl = bl && getDataAccess().execNoQuerySql(sql);
		sql = "update META_MR_USER_AUTHOR set CREATE_USER_ID = " + toUserId + " where TASK_ID = " + taskId +
				" and TASK_TYPE = " + taskType + " and USER_ID=" + fromUserId;
		bl = bl && getDataAccess().execNoQuerySql(sql);
		sql = "insert into META_MR_USER_AUTHOR values (" + toUserId + "," + taskId + "," + taskType + ",1,1,1," +
				toUserId + ",1,'" + d + "')";
		bl = bl && getDataAccess().execNoQuerySql(sql);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("RESULT", bl);
		if (bl) {
			map.put("MESSAGE", "保存成功");
		} else {
			map.put("MESSAGE", "保存失败");
		}
		return map;
	}

	public Map<String, Object> changeUserRole(Map<String, Object> data) {
		String fromUserId = data.get("fromUserId").toString();
		String toUserId = data.get("toUserId").toString();
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		String createUserId = formatUser.get("userId").toString();

		DateFormat F = new SimpleDateFormat("yyyy-MM-dd");
		String d = F.format(new Date());

		Boolean bl = true;
		String sql = "";
		//
		sql = " insert into META_MR_USER_ADDACTION select " + toUserId + ",ACTION_TYPE," + createUserId + ",'" + d +
				"' from META_MR_USER_ADDACTION where user_id = " + fromUserId +
				" and ACTION_TYPE not in (select ACTION_TYPE from META_MR_USER_ADDACTION where user_id = " + toUserId +
				")";
		bl = bl && getDataAccess().execNoQuerySql(sql);

		sql = " delete META_MR_USER_ADDACTION where user_id = " + fromUserId;
		bl = bl && getDataAccess().execNoQuerySql(sql);

		// META_MR_USER_AUTHOR 表
		sql = " select t.user_id,t.task_id,t.task_type,t.view_action,t.modify_action,t.delete_action,t.create_user_id from META_MR_USER_AUTHOR t where user_id =" +
				fromUserId +
				" and " +
				toUserId +
				"||'_'||task_id||'_'||task_type in (select user_id||'_'||task_id||'_'||task_type from META_MR_USER_AUTHOR where user_id = " +
				toUserId + ")";
		List<Map<String, Object>> list = getDataAccess().queryForList(sql);
		for (Map<String, Object> map : list) {
			sql = " update META_MR_USER_AUTHOR set USER_ID = " + toUserId;
			if (map.get("VIEW_ACTION").toString().equals("1")) {
				sql += " ,VIEW_ACTION = 1";
			}
			if (map.get("MODIFY_ACTION").toString().equals("1")) {
				sql += " ,MODIFY_ACTION = 1";
			}
			if (map.get("DELETE_ACTION").toString().equals("1")) {
				sql += " ,DELETE_ACTION = 1";
			}
			if (map.get("CREATE_USER_ID").toString().equals(fromUserId)) {
				sql += " ,CREATE_USER_ID = " + toUserId;
			}
			sql += " WHERE USER_ID= " + toUserId + " AND TASK_ID = " + map.get("TASK_ID") + " AND TASK_TYPE = " +
					map.get("TASK_TYPE");
			bl = bl && getDataAccess().execNoQuerySql(sql);
		}

		// 新增
		sql = "insert into META_MR_USER_AUTHOR select " +
				toUserId +
				",t.task_id,t.task_type,t.view_action,t.modify_action,t.delete_action,decode(t.create_user_id," +
				fromUserId +
				"," +
				toUserId +
				",t.create_user_id),1,'" +
				d +
				"' from META_MR_USER_AUTHOR t where user_id =" +
				fromUserId +
				" and " +
				toUserId +
				"||'_'||task_id||'_'||task_type not in (select user_id||'_'||task_id||'_'||task_type from META_MR_USER_AUTHOR where user_id =" +
				toUserId + ")";
		bl = bl && getDataAccess().execNoQuerySql(sql);
		// 删除
		sql = "delete META_MR_USER_AUTHOR where user_id = " + fromUserId;
		bl = bl && getDataAccess().execNoQuerySql(sql);

		Map<String, Object> map = new HashMap<String, Object>();
		map.put("RESULT", bl);
		if (bl) {
			map.put("MESSAGE", "保存成功");
		} else {
			map.put("MESSAGE", "保存失败");
		}
		return map;
	}

	public int delete(long taskId, int taskType) {
		String sql = "delete META_MR_USER_AUTHOR where TASK_TYPE = " + taskType + " and TASK_ID = " + taskId;
		return getDataAccess().execUpdate(sql);
	}
}
