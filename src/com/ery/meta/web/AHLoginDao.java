package com.ery.meta.web;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.MetaBaseDAO;

import com.ery.base.support.jdbc.IParamsSetter;

public class AHLoginDao extends MetaBaseDAO {

	/*
	 * 根据用户帐号查该用户在元系统中是否已存在
	 * 
	 * @param username
	 * 
	 * @return int
	 */
	public int isUser_Exist(String userNameCn) {
		String sql = "select count(*) from meta_mag_user where user_namecn=?";
		return getDataAccess().queryForInt(sql, userNameCn);
	}

	/*
	 * 新增用户
	 * 
	 * @param data 用户数据
	 * 
	 * @return 操作条数
	 * 
	 * @throws Exception
	 */
	public int insertUserByCondition(Map<String, Object> data) throws Exception {
		String sql = "INSERT INTO META_MAG_USER " + "(USER_ID, USER_EMAIL, USER_PASS, USER_NAMECN, STATE, "
				+ "USER_MOBILE, STATION_ID, ADMIN_FLAG, HEAD_SHIP, USER_NAMEEN, "
				+ "OA_USER_NAME, DEPT_ID, ZONE_ID, USER_SN, VIP_FLAG, GROUP_ID) " + "VALUES " + "(?,?,?,?, ?, "
				+ "?,?,?,?,?, ?,?,?,?,?, ?)";
		List<Object> proParams = new ArrayList<Object>();
		long pk = queryForNextVal("SEQ_MAG_USER_ID");
		proParams.add(pk);
		if (data.containsKey("mail"))
			proParams.add(data.get("mail"));
		else
			proParams.add("");
		proParams.add("96e79218965eb72c92a549dd5a330112");
		if (data.containsKey("staffAccount"))
			proParams.add(data.get("staffAccount"));
		else
			proParams.add("");
		proParams.add("1");
		if (data.containsKey("moble"))
			proParams.add(data.get("moble"));
		else
			proParams.add("");
		proParams.add("");
		proParams.add(0);
		proParams.add("");
		if (data.containsKey("staffAccount"))
			proParams.add(data.get("staffAccount"));
		else
			proParams.add("");
		proParams.add("");
		proParams.add("");
		if (data.containsKey("zoneId"))
			proParams.add(data.get("zoneId"));
		else
			proParams.add("");
		proParams.add("");
		proParams.add("0");
		proParams.add("1");
		getDataAccess().execUpdate(sql, proParams.toArray());
		return (int) pk;
	}

	/*
	 * 根据用户帐号查该用户信息
	 * 
	 * @param username
	 * 
	 * @return map
	 */
	public Map<String, Object> getUserInfo(String userNameCn) {
		StringBuffer buffer = new StringBuffer();
		buffer.append("SELECT USER_ID, USER_EMAIL, USER_PASS,");
		buffer.append("USER_NAMECN,USER_MOBILE,STATION_ID,");
		buffer.append("ADMIN_FLAG, USER_NAMEEN, STATE,ZONE_ID,");
		buffer.append("USER_SN, VIP_FLAG, GROUP_ID ");
		buffer.append("FROM META_MAG_USER WHERE USER_NAMECN=?");
		return getDataAccess().queryForMap(buffer.toString(), userNameCn);
	}

	/*
	 * 根据用户ID及菜单ID删除菜单信息
	 * 
	 * @param userId 菜单ID
	 * 
	 * @return 执行条数
	 * 
	 * @throws Exception
	 */
	public int deleteMenuId(Map<String, Object> userData) throws Exception {
		String sql = "DELETE FROM META_MAG_USER_MENU WHERE USER_ID=? ";
		return getDataAccess().execUpdate(sql.toString(), userData.get("USER_ID").toString());
	}

	/*
	 * 批量新增一批关联用户数据
	 * 
	 * @param userMenuPOs
	 * 
	 * @return
	 * 
	 * @throws Exception
	 */
	public int[] insertBatchUserMenu(final Map<String, Object> userData, final List menuId) throws Exception {
		String insert = "INSERT INTO META_MAG_USER_MENU(USER_ID,MENU_ID,EXCLUDE_BUTTON,FLAG) VALUES(?,?,?,?)";
		return getDataAccess().execUpdateBatch(insert, new IParamsSetter() {
			public void setValues(PreparedStatement proParams, int i) throws SQLException {
				proParams.setObject(1, userData.get("USER_ID").toString());
				proParams.setObject(2, menuId.get(i));
				proParams.setObject(3, "");
				proParams.setObject(4, "1");
			}

			public int batchSize() {
				return menuId.size();
			}
		});
	}
}
