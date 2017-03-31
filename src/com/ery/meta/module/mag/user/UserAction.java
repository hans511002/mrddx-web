package com.ery.meta.module.mag.user;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import com.ery.meta.common.Common;
import com.ery.meta.common.OprResult;
import com.ery.meta.common.Page;
import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.module.mag.menu.MenuConstant;
import com.ery.meta.module.mag.menu.MenuDAO;
import com.ery.meta.module.mag.role.RoleDAO;
import com.ery.meta.web.session.SessionContext;
import com.ery.meta.web.session.SessionManager;
import com.ery.meta.web.session.User;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**

 * 用户维护模块的Action类 包括但不仅包括用户的申请、审核、查询、修改、删除、关联角色、关联菜单等功能
 * 

 * @date 2011-9-26 ----------------------
 * @modify 熊久亮 添加在线用户信息查询功能
 * @modifyDate 2010-10-26
 */
public class UserAction {

	/**
	 * 数据库操作类
	 */
	private UserDAO userDAO;
	private RoleDAO roleDAO;
	private MenuDAO menuDAO;

	/**
	 * 默认密码从conf取
	 */
	private static final String defaultPassword = SystemVariable.getString("defaultPassword", "123456");

	/**
	 * 根据前台传来的条件显示用户列表
	 * 
	 * @param queryData 查询表单数据
	 * @return ---------------
	 * @modify 杨苏维 当前台表单数据位“所有部门”，“所有岗位”时设置其值为null 对应ID从MAP中删除掉
	 */
	public List<Map<String, Object>> queryUser(Map<String, Object> queryData, Page page) {

		if (page == null) {
			page = new Page(0, 20);
		}
		if (queryData.get("zoneId") == null || queryData.get("zoneId") == "") {
			queryData.put("zoneId", SessionManager.getCurrentUser().get("zoneId"));
		}
		if (!SessionManager.isCurrentUserAdmin()) {
			queryData.put("mguserId", SessionManager.getCurrentUserID());
		}
		return userDAO.queryUserByCondition(queryData, page, null);
	}

	/**
	 * 根据状态查询用户信息（待审核用户）
	 * 
	 * @param queryData
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryUserByState(Map<String, Object> queryData, Page page) {
		if (page == null) {
			page = new Page(0, 20);
		}
		return userDAO.queryUserByState(queryData, page, null);
	}

	/**
	 * 密码修改原密码远程验证
	 * 
	 * @param userId 用户ID
	 * @param password 密码
	 * @return 成功或失败
	 */
	public boolean passwordConfirm(int userId, String password) {
		password = Common.getMD5(password.getBytes());
		Map<String, Object> user = userDAO.queryUserByUserId(userId);
		if (user != null) {
			return user.get("USER_PASS").toString().equals(password);
		}
		return false;
	}

	public Map<String, Object> queryUserByUserIds(int userId) {
		return userDAO.queryUserByUserId(userId);
	}

	public List<Map<String, Object>> querySimpleUserInfo(long[] userIds) {
		return userDAO.querySimpleInfoByIds(userIds);
	}

	/**
	 * 验证用户是否存在
	 * 
	 * @param userEmail
	 * @return
	 */

	public boolean valiHasEmail(String userEmail) {
		boolean flag = false;
		List<Map<String, Object>> mapList = userDAO.queryUserByEmail(userEmail.trim());
		if (mapList.size() == 0) {
			flag = true;

		}
		return flag;
	}

	/**
	 * 用户名重复验证
	 * 
	 * @param userName
	 * @return
	 */
	public boolean valiHasUserName(String userName) {
		boolean flag = false;
		List<Map<String, Object>> mapList = userDAO.queryUserByNamecn(userName.trim());
		if (mapList.size() == 0) {
			flag = true;

		}
		return flag;
	}

	/**
	 * 查询要选择的人员
	 * 
	 * @param queryData { deptId：查询的部门集合 stationId：查询的岗位集合 zoneId：查询的地域集合 }
	 * @param selectUsers 已选择人员ID集合
	 * @return
	 */
	public List<Map<String, Object>> selectUser(Map<String, Object> queryData, String[] selectUsers, Page page) {
		return userDAO.selectUser(queryData, selectUsers, page);
	}

	/**
	 * 修改密码
	 * 
	 * @param userId 用户ID
	 * @param newPassword 新密码
	 * @return 修改结果
	 */
	public OprResult<?, ?> updatePassword(int userId, String newPassword) {
		OprResult<?, ?> result = null;
		try {
			BaseDAO.beginTransaction();
			newPassword = Common.getMD5(newPassword.getBytes());
			userDAO.updateUserPassword(userId, newPassword);
			result = new OprResult<Integer, Object>(userId, userId, OprResult.OprResultType.update);
			// 修改密码成功后，记录密码修改日志
			userDAO.insertUserChangeLog(new int[] { userId }, UserConstant.META_MAG_USER_CHANGE_NAME_MODIFYPAS,
					UserConstant.META_MAG_USER_EDITOR_TYPE_MANUAL, (Integer) SessionManager.getCurrentUserID());
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("修改密码出错", e);
			result = new OprResult<Integer, Object>(userId, userId, OprResult.OprResultType.error);
			BaseDAO.rollback();
		}
		return result;
	}

	/**
	 * 申请用户，用户状态为待审核 email有重复时不能申请
	 * 
	 * @param data 用户表单数据
	 * @return 申请结果
	 */
	public Object applyUser(Map<String, Object> data) {
		OprResult<Integer, Object> result = null;
		// 检查申请的Email是否存在
		List<Map<String, Object>> mapList = userDAO.queryUserByEmail(Convert.toString(data.get("userEmail")).trim());
		if (mapList.size() > 0) {// Email已存在
			result = new OprResult<Integer, Object>();
			result.setSid(-1);
			mapList = null;
			return result;
		}
		mapList = userDAO.queryUserByNamecn(((String) data.get("userNamecn")).trim());
		if (mapList.size() > 0) {// 用户名已存在
			result = new OprResult<Integer, Object>();
			result.setSid(-2);
			mapList = null;
			return result;
		}

		// 获取界面输入框的验证码
		String inputCode = data.get("validateCode") == null ? "" : data.get("validateCode").toString();
		// 获取保存到session中的验证码
		String sessionCode = (String) SessionManager.getAttribute("randomCode");

		if (null == sessionCode) {
			result = new OprResult<Integer, Object>();
			result.setSid(-3);
			mapList = null;
			return result;
		}
		if (!sessionCode.equalsIgnoreCase(inputCode)) { // 验证码比较不区分大小写
			result = new OprResult<Integer, Object>();
			result.setSid(-4);
			mapList = null;
			return result;
		}

		// 设置默认密码
		String pwd = Common.getMD5(defaultPassword.getBytes());

		// 状态2为待审核
		data.put("state", UserConstant.META_MAG_USER_STATE_AUDITING);
		try {
			// 构建输入
			data.put("userPass", pwd);
			result = new OprResult<Integer, Object>(null, userDAO.insertUserByCondition(data),
					OprResult.OprResultType.insert);
			// 查询刚新增的数据
			Map<String, Object> idMapp = new HashMap<String, Object>();
			idMapp.put("userId", Integer.parseInt(result.getTid().toString()));
			// result.setSuccessData(userDAO.queryUserByCondition(idMapp, null,
			// null));
			// 用户申请成功后，保存密码申请和状态申请日志，这个时候保存的
			userDAO.insertUserChangeLog(new int[] { Integer.parseInt(result.getTid().toString()) },
					UserConstant.META_MAG_USER_CHANGE_NAME_ADDPAS, UserConstant.META_MAG_USER_EDITOR_TYPE_APPLY, null);
			userDAO.insertUserChangeLog(new int[] { Integer.parseInt(result.getTid().toString()) },
					UserConstant.META_MAG_USER_CHANGE_NAME_ADDSTATE, UserConstant.META_MAG_USER_EDITOR_TYPE_APPLY, null);
		} catch (Exception e) {
			LogUtils.error("申请用户出错", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 审核用户 其中包括“手动”或“自动”分配权限的方法
	 * 
	 * @param data 表单数据
	 * @return 审核结果
	 */
	public Object auditUser(Map<String, Object> data) {
		OprResult<Integer, Object> result = null;
		Map<String, Object> condition = new HashMap<String, Object>();
		condition.put("userId", data.get("userId"));
		if (Integer.parseInt(data.get("vipFlag").toString()) == 0) {
			data.put("vipFlag", 0);
		}
		List<Map<String, Object>> mapList = userDAO
				.queryUserByOaName((Convert.toString(data.get("oaUserName"))).trim());
		if (mapList.size() > 0) {
			result = new OprResult<Integer, Object>();
			result.setSid(-1);
			mapList = null;
			return result;
		}
		try {
			/**
			 * 是否自动分配权限：1：是，2：否
			 */
			int autoRight = Integer.parseInt(data.get("autoRight").toString());
			int userId = Integer.parseInt(data.get("userId").toString());
			if (autoRight == 1) {
				// 实现自动分配权限
				// 1 批量删除原部门，岗位下角色与该用户的对应关系
				// 2 批量新增新部门，岗位下角色与该用户对应
				// Map<String,Object> oldUserMap =
				// userDAO.queryUserByUserId(Integer.parseInt(data.get("userId").toString()));
				int newStationId = Integer.parseInt(data.get("stationId").toString());
				int newDeptId = Integer.parseInt(data.get("deptId").toString());
				if (newStationId > 0 && newDeptId > 0) {
					// 从META_MAG_ROLE_ORG表中取出与当前stationID、deptID对应的角色ID，存入用户-角色对应关系表
					int newRoleIds[] = roleDAO.queryRoleIdsByStationIdDeptId(newStationId, newDeptId);
					userDAO.insertUserRoleBatch(userId, newRoleIds);
				}
			}
			int number = userDAO.updateUserByUserId(data);
			result = new OprResult<Integer, Object>(userId, null, OprResult.OprResultType.delete);
			userDAO.insertUserChangeLog(new int[] { Integer.parseInt(data.get("userId").toString()) },
					UserConstant.META_MAG_USER_CHANGE_NAME_AUDITSTATEPASS,
					UserConstant.META_MAG_USER_EDITOR_TYPE_MANUAL, SessionManager.getCurrentUserID());
		} catch (Exception e) {
			LogUtils.error("审核用户出错", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 修改用户 其中包括自动或手动分配权限的方法
	 * 
	 * @param data 表单数据
	 * @return 修改结果
	 */
	public Object modifyUser(Map<String, Object> data) {
		OprResult<Integer, Object> result = null;
		Map<String, Object> condition = new HashMap<String, Object>();
		condition.put("userId", data.get("userId"));
		if (Integer.parseInt(data.get("vipFlag").toString()) == 0) {
			data.put("vipFlag", 0);
		}
		// 检查修改的Email是否存在
		List<Map<String, Object>> mapList = userDAO.queryUserByEmailAndId(Convert.toString(data.get("userEmail"))
				.trim(), Integer.parseInt(data.get("userId").toString()));
		if (mapList.size() > 0) {// Email已存在
			result = new OprResult<Integer, Object>();
			result.setSid(-1);
			mapList = null;
			return result;
		}
		// 检查修改的用户名是否存在
		mapList = userDAO.queryUserByNamecnAnduserId(Convert.toString(data.get("userNamecn")).trim(),
				Integer.parseInt(data.get("userId").toString()));
		if (mapList.size() > 0) {// 用户名已存在
			result = new OprResult<Integer, Object>();
			result.setSid(-2);
			mapList = null;
			return result;
		}
		// 检查OA登录名是否重复
		mapList = userDAO.queryUserByOANamecnAnduserId(Convert.toString(data.get("oaUserName")).trim(),
				Integer.parseInt(data.get("userId").toString()));
		if (mapList.size() > 0) {// 用户名已存在
			result = new OprResult<Integer, Object>();
			result.setSid(-3);
			mapList = null;
			return result;
		}
		try {
			/**
			 * 是否自动分配权限：1：是，2：否
			 */
			int autoRight = Integer.parseInt(data.get("autoRight").toString());
			int userId = Integer.parseInt(data.get("userId").toString());
			BaseDAO.beginTransaction();
			if (autoRight == 1) {
				// 实现自动分配权限
				// 1 批量删除原部门，岗位下角色与该用户的对应关系
				// 2 批量新增新部门，岗位下角色与该用户对应
				Map<String, Object> oldUserMap = userDAO.queryUserByUserId(Integer.parseInt(data.get("userId")
						.toString()));
				int newStationId = Integer.parseInt(data.get("stationId").toString());
				int newDeptId = Integer.parseInt(data.get("deptId").toString());
				if (newStationId > 0 && newDeptId > 0) {
					boolean isAdd = false;
					// 1 比较岗位ID看是否变化
					if (newStationId != Integer.parseInt(oldUserMap.get("STATION_ID").toString())) {
						// 删除与stationID相关的角色-用户对应关系信息
						userDAO.deleteUserRoleByStationIdUserId(
								Integer.parseInt(oldUserMap.get("STATION_ID").toString()), userId);
						isAdd = true;
					}
					if (newDeptId != Integer.parseInt(oldUserMap.get("DEPT_ID").toString())) {
						// 删除与deptID相关的角色-用户对应关系信息
						userDAO.deleteUserRoleByDeptIdUserId(Integer.parseInt(oldUserMap.get("DEPT_ID").toString()),
								userId);
						isAdd = true;
					}
					// 需新增
					if (isAdd) {
						// 从META_MAG_ROLE_ORG表中取出与当前stationID、deptID对应的角色ID，存入用户-角色对应关系表
						int newRoleIds[] = roleDAO.queryRoleIdsByStationIdDeptId(newStationId, newDeptId);
						userDAO.insertUserRoleBatch(userId, newRoleIds);
					}
				}
			}
			int number = userDAO.updateUserByUserId(data);
			result = new OprResult<Integer, Object>(null, number, OprResult.OprResultType.update);
			// 查询修改后的数据
			condition.put("zoneId", data.get("zoneId"));
			BaseDAO.commit();
			result.setSuccessData(userDAO.queryUserByCondition(condition, null, null));
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("修改用户出错", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		if ("update".equals(result.getType().name()) && "1".equals(String.valueOf(data.get("myinfo")))) {
			Map<String, Object> formatUser = new HashMap<String, Object>();
			Map<String, Object> userData = userDAO
					.queryUserByUserId(Integer.parseInt(String.valueOf(data.get("userId"))));
			for (Map.Entry<String, Object> entry : userData.entrySet()) {
				formatUser.put(Common.tranColumnToJavaName(entry.getKey()), entry.getValue());
			}
			SessionManager.setAttribute(LoginConstant.SESSION_KEY_USER, formatUser);
		}
		return result;
	}

	/**
	 * 删除用户
	 * 
	 * @param userIdStr 用户ID字符串 以逗号分隔
	 * @return 删除结果
	 */
	public OprResult<?, ?>[] deleteUser(String userIdStr) {
		// 前台传入的ID是字符串形式以逗号隔开
		int userId[] = new int[userIdStr.split(",").length];
		for (int i = 0; i < userId.length; i++) {
			userId[i] = Integer.parseInt(userIdStr.split(",")[i]);
		}
		OprResult<?, ?> result[] = new OprResult[userId.length];
		try {
			BaseDAO.beginTransaction();
			// 删除关联表信息
			userDAO.deleteUserRoleByUserId(userIdStr.split(","), null);
			userDAO.deleteUserMenuByUserId(userId);
			// 删除主表信息
			userDAO.deleteUserByUserId(userId);
			userDAO.insertUserChangeLog(userId, UserConstant.META_MAG_USER_CHANGE_NAME_DELETEPAS,
					UserConstant.META_MAG_USER_EDITOR_TYPE_MANUAL, SessionManager.getCurrentUserID());
			userDAO.insertUserChangeLog(userId, UserConstant.META_MAG_USER_CHANGE_NAME_DELETESTATE,
					UserConstant.META_MAG_USER_EDITOR_TYPE_MANUAL, SessionManager.getCurrentUserID());
			BaseDAO.commit();
			for (int i = 0; i < result.length; i++) {
				result[i] = new OprResult<Integer, Object>(userId[i], null, OprResult.OprResultType.delete);
			}
			return result;
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("删除用户出错", e);
			for (int i = 0; i < result.length; i++) {
				result[i] = new OprResult<Integer, Object>(userId[i], null, OprResult.OprResultType.error);
			}
			return result;
		}
	}

	/**
	 * 禁用用户
	 * 
	 * @param userIdStr 用户ID字符串 以逗号分隔
	 * @return 禁用结果
	 */
	public OprResult<?, ?> disableUser(String userIdStr) {
		// 前台传入的ID是字符串形式以逗号隔开
		int userId[] = new int[userIdStr.split(",").length];
		for (int i = 0; i < userId.length; i++) {
			userId[i] = Integer.parseInt(userIdStr.split(",")[i]);
		}
		OprResult<Integer, Object> result = null;
		try {
			BaseDAO.beginTransaction();
			result = new OprResult<Integer, Object>(null, userDAO.disableUser(userId), OprResult.OprResultType.update);
			userDAO.insertUserChangeLog(userId, UserConstant.META_MAG_USER_CHANGE_NAME_DISABLEUSER,
					UserConstant.META_MAG_USER_EDITOR_TYPE_MANUAL, SessionManager.getCurrentUserID());
			BaseDAO.commit();
			// 查询修改后的数据
			result.setSuccessData(userDAO.queryUserByUserIds(userId));
			return result;
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("禁用用户出错", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
			return result;
		}
	}

	/**
	 * 启用用户
	 * 
	 * @param userIdStr 用户ID字符串
	 * @return 启用结果
	 */
	public OprResult<?, ?> startUser(String userIdStr) {
		// 前台传入的ID是字符串形式以逗号隔开
		int userId[] = new int[userIdStr.split(",").length];
		for (int i = 0; i < userId.length; i++) {
			userId[i] = Integer.parseInt(userIdStr.split(",")[i]);
		}
		OprResult<Integer, Object> result = null;
		try {
			BaseDAO.beginTransaction();
			result = new OprResult<Integer, Object>(null, userDAO.startUser(userId), OprResult.OprResultType.update);
			userDAO.insertUserChangeLog(userId, UserConstant.META_MAG_USER_CHANGE_NAME_STARTUSER,
					UserConstant.META_MAG_USER_EDITOR_TYPE_MANUAL, SessionManager.getCurrentUserID());
			BaseDAO.commit();
			// 查询修改后的数据
			result.setSuccessData(userDAO.queryUserByUserIds(userId));
			return result;
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("启用用户出错", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
			return result;
		}
	}

	/**
	 * 进行用户关联角色、菜单的关联关系设置 用户-角色关联表的mag-flag
	 * grantFlag字段的设置以及用户-菜单关联表的excludeButton的设置
	 * 
	 * @param data 关联关系表单数据
	 * @return 关联成功或失败
	 */
	public boolean reference(Map<String, Object> data) {
		try {
			// 用户ID
			int userId = Integer.parseInt(String.valueOf(data.get("userId")));
			// 被关联的RoleID的字符串，以逗号分隔
			String roleIdStr = String.valueOf(data.get("roleIdStr"));
			// 被关联的MenuID的字符串，以逗号分隔
			String menuIdStr = String.valueOf(data.get("menuIdStr"));

			BaseDAO.beginTransaction();

			// 先删除后增加
			// 删除用户-角色关联
			String roleIds[] = roleIdStr.split(",");
			userDAO.deleteUserRoleByUserId(new String[] { String.valueOf(userId) }, null);
			if (!roleIdStr.equals("null")) {
				// 批量增加用户-角色关联
				for (int i = 0; i < roleIds.length; i++) {
					UserRolePO userRolePO = new UserRolePO();
					userRolePO.setUserId(userId);
					userRolePO.setRoleId(Integer.parseInt(roleIds[i]));
					userRolePO.setGrantFlag(0);
					userRolePO.setMagFlag(0);
					userDAO.insertUserRole(userRolePO);
					userRolePO = null;
				}
			}
			// 删除用户-菜单关联
			userDAO.deleteUserMenuByUserId(new int[] { userId });
			// 批量增加角色-菜单关联
			String menuIds[] = menuIdStr.split(",");
			// 批量增加用户-菜单关联关系
			if (!menuIdStr.equals("null")) {
				for (int i = 0; i < menuIds.length; i++) {
					UserMenuPO userMenuPO = new UserMenuPO();
					userMenuPO.setUserId(userId);
					userMenuPO.setMenuId(Integer.parseInt(menuIds[i]));
					userMenuPO.setExcludeButton("");
					userMenuPO.setFlag(1);
					userDAO.insertUserMenu(userMenuPO);
				}
			}
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("设置关联关系出错", e);
			return false;
		}
		return true;
	}

	/**
	 * 用户与角色关联关系功能中，显示角色列表 过滤掉已经在关联关系中存在的角色信息
	 * 
	 * @param queryData 查询表单数据
	 * @return 角色列表
	 */
	public List<Map<String, Object>> loadRefRole(Map<?, ?> queryData, Page page) {
		if (page == null) {
			page = new Page(0, 10);
		}
		if (queryData == null) {
			queryData = new HashMap<Object, Object>();
		}
		return roleDAO.queryRolesNotInUserRole(queryData, page);
	}

	/**
	 * 根据状态查询角色，只显示状态为有效并过滤已经关联用户的角色
	 * 
	 * @param queryData
	 * @return
	 */
	public List<Map<String, Object>> loadRefRoleByRoleId(Map<?, ?> queryData) {
		// if(page == null){
		// page = new Page(0,10);
		// }
		int mguserId = SessionManager.getCurrentUserID();

		return userDAO.queryRolesMgUserRoleByRoleId(queryData, mguserId, SessionManager.isCurrentUserAdmin());
	}

	/**
	 * 加载menu treeGrid树，在用户菜单关联关系设置中 用AOP的方式实现选中已经关联的菜单
	 * 
	 * @param belongSys 所属系统
	 * @return 树列表
	 */
	public List<Map<String, Object>> queryMenuTreeData(int belongSys, int userId) {
		int mguserId = SessionManager.getCurrentUserID();
		List<Map<String, Object>> menuTree = menuDAO.queryMenuBySystemId(belongSys);
		// List<Map<String,Object>> mgmenuTree = new
		// ArrayList<Map<String,Object>>();
		// 用AOP的方式实现选中已经关联的菜单
		List<Map<String, Object>> mguserMenuList = new ArrayList<Map<String, Object>>();
		if (!SessionManager.isCurrentUserAdmin()) {
			menuTree = userDAO.queryUserMenuByUserBelogSys(mguserId, belongSys);
			mguserMenuList = userDAO.queryUserMenuByUserID(mguserId, belongSys);
		}
		List<Map<String, Object>> userMenuList = userDAO.queryUserMenuByUserID(userId, belongSys);
		// List<Map<String, Object>> mguserMenuList =
		// userDAO.queryUserMenuByUserID(mguserId,belongSys);
		// 将数据分为两块，一块是有用户关联权限获得的菜单集，一块是有用户关联菜单而获取的菜单。
		// 均以MENU_ID作为键值，MENU_ID为唯一。
		// 以ROLE_FLAG区分，ROLE_FLAG=-1代表为用户关联权限获取的数据，ROLE_FLAG>1代表为用户关联菜单获取的数据
		Map<Integer, Map<String, Object>> roleData = new HashMap<Integer, Map<String, Object>>();
		Map<Integer, Map<String, Object>> userMenuData = new HashMap<Integer, Map<String, Object>>();
		Map<Integer, Map<String, Object>> mguserMenuData = new HashMap<Integer, Map<String, Object>>();
		if (mguserMenuList != null && mguserMenuList.size() > 0) {
			for (Map<String, Object> menuData : mguserMenuList) {
				if (menuData.get("EXCLUDE_BUTTON") != null && menuData.get("EXCLUDE_BUTTON").toString() != "") {
					if (mguserMenuData.containsKey(Integer.parseInt(menuData.get("MENU_ID").toString()))) {
						String temp = mguserMenuData.get(Integer.parseInt(menuData.get("MENU_ID").toString()))
								.get("EXCLUDE_BUTTON").toString();
						String temp2 = menuData.get("EXCLUDE_BUTTON").toString();
						menuData.put("EXCLUDE_BUTTON", temp2 + "," + temp);
					}

					mguserMenuData.put(Integer.parseInt(menuData.get("MENU_ID").toString()), menuData);
				}
			}
		}

		if (userMenuList != null && userMenuList.size() > 0) {
			for (Map<String, Object> menuData : userMenuList) {
				if (Integer.parseInt(menuData.get("ROLE_FLAG").toString()) == -1) {
					if (roleData.containsKey(Integer.parseInt(menuData.get("MENU_ID").toString()))) {// 如果存在MENU_ID,以最大的EXCLUDE_BUTTON为准。
						String excludeButton = Convert.toString(menuData.get("EXCLUDE_BUTTON"));
						String orgExcl = Convert.toString((roleData.get(Integer.parseInt(menuData.get("MENU_ID")
								.toString()))).get("EXCLUDE_BUTTON"));
						// if (excludeButton.length() > orgExcl.length()) {
						// roleData.put(
						// Integer.parseInt(menuData.get("MENU_ID")),
						// menuData);
						// }
						if (orgExcl != null && orgExcl != "") {
							if (excludeButton != null && excludeButton != "") {
								menuData.put("EXCLUDE_BUTTON", excludeButton + "," + orgExcl);
								roleData.put(Integer.parseInt(menuData.get("MENU_ID").toString()), menuData);
							} else {
								roleData.put(Integer.parseInt(menuData.get("MENU_ID").toString()), menuData);
							}
						}

					} else {
						roleData.put(Integer.parseInt(menuData.get("MENU_ID").toString()), menuData);
					}
				} else {
					userMenuData.put(Integer.parseInt(menuData.get("MENU_ID").toString()), menuData);
				}
			}
		}

		for (int i = 0; i < menuTree.size(); i++) {// 循环菜单树列表

			Map<String, Object> menuMap = menuTree.get(i);
			int menuId = Integer.valueOf(menuMap.get("MENU_ID").toString());

			// 如果menuId在有权限关联的列表中找到，说明此MENU_ID由权限关联而来，设置键值
			// IS_FROM_ROLE=1 表示权限来源是角色。
			if (roleData.containsKey(menuId)) {
				menuMap.put("IS_ROLE_FROM", 1);
			} else {
				menuMap.put("IS_ROLE_FROM", 0);
			}
			menuMap.put("CHECKED", 0);// 先统一默认其不选中
			// 是否选中逻辑，如果此菜单ID存在于 角色赋予的权限roleData中，且
			// 在用户关联的菜单数据中不存在，或者存在但是其ROLE_FLAG=1
			// 为正向加法。
			if (roleData.containsKey(menuId) || userMenuData.containsKey(menuId)) {
				menuMap.put("CHECKED", 1);
				if (userMenuData.containsKey(menuId)
						&& Integer.parseInt(userMenuData.get(menuId).get("ROLE_FLAG").toString()) == MenuConstant.ROLE_FLAG_DELETE_MENU) {
					menuMap.put("CHECKED", 0);
				}
			}

			// 去除管理员没有的管理按钮
			String hasMeuns[] = null;
			if (menuMap.get("PAGE_BUTTON") != null && menuMap.get("PAGE_BUTTON") != "") {
				hasMeuns = menuMap.get("PAGE_BUTTON").toString().split(",");

				String delMeuns[] = null;
				if (mguserMenuData.containsKey(menuId) && mguserMenuData.get(menuId).get("EXCLUDE_BUTTON") != null
						&& mguserMenuData.get(menuId).get("EXCLUDE_BUTTON").toString() != "") {
					delMeuns = mguserMenuData.get(menuId).get("EXCLUDE_BUTTON").toString().split(",");
					String meunsIs = "";
					String temp = "";
					for (int j = 0; j < hasMeuns.length; j++) {
						int m = 0;
						for (int n = 0; n < delMeuns.length; n++) {

							if (hasMeuns[j].indexOf(delMeuns[n]) < 0) {
							} else {
								m = m + 1;
							}
						}
						if (m == 0) {
							if (meunsIs == "") {
								temp = hasMeuns[j];
							} else {
								temp = hasMeuns[j] + "," + meunsIs;

							}
							meunsIs = temp;
						} else {

						}

					}
					menuMap.put("PAGE_BUTTON", meunsIs);
				}

				if (mguserMenuData.containsKey(menuId) && mguserMenuData.get(menuId).get("EXCLUDE_BUTTON") != null
						&& mguserMenuData.get(menuId).get("EXCLUDE_BUTTON").toString() != "") {
					delMeuns = mguserMenuData.get(menuId).get("EXCLUDE_BUTTON").toString().split(",");
					String meunsIs = "";
					String temp = "";
					for (int j = 0; j < hasMeuns.length; j++) {
						int m = 0;
						for (int n = 0; n < delMeuns.length; n++) {

							if (hasMeuns[j].indexOf(delMeuns[n]) < 0) {
							} else {
								m = m + 1;
							}
						}
						if (m == 0) {
							if (meunsIs == "") {
								temp = hasMeuns[j];
							} else {
								temp = hasMeuns[j] + "," + meunsIs;

							}
							meunsIs = temp;
						} else {

						}

					}
					menuMap.put("PAGE_BUTTON", meunsIs);

				}
			}
			// 排除按钮逻辑，如果此菜单ID存在于用户关联的菜单数据中，且其ROLE_FLAG=1;为正向加法，以userMenuData中EXCLUDE_BUTTON的为准，
			// 其余均以权限关联的菜单排除按钮为准。
			if (roleData.containsKey(menuId) || userMenuData.containsKey(menuId)) {
				menuMap.put("EXCLUDE_BUTTON",
						(roleData.containsKey(menuId) ? roleData.get(menuId) : userMenuData.get(menuId))
								.get("EXCLUDE_BUTTON"));
				if (userMenuData.containsKey(menuId)
						&& Integer.parseInt(userMenuData.get(menuId).get("ROLE_FLAG").toString()) == MenuConstant.ROLE_FLAG_ADD_USER_MENU) {
					menuMap.put("EXCLUDE_BUTTON", userMenuData.get(menuId).get("EXCLUDE_BUTTON"));
				}
			}

		}
		return menuTree;
	}

	/**
	 * 动态加载子菜单，在用户菜单关联关系设置中
	 * 
	 * @param parentId 父菜单ID
	 * @return 子菜单列表
	 */
	// public Object querySubMenu(Integer userId,Integer parentId){
	// List<Map<String,Object>> menuTree = menuDAO.querySubMenu(parentId);
	// List<Map<String,Object>> userMenuList =
	// userDAO.queryUserMenuByUserID(userId);
	// for(int i = 0; i < menuTree.size(); i ++){//循环菜单树列表
	// for(int j=0; j < userMenuList.size(); j ++){//循环
	// Map<String,Object> menuMap = menuTree.get(i);
	// int menuId = Integer.valueOf(menuMap.get("MENU_ID").toString());
	// int refMenuId =
	// Integer.valueOf(userMenuList.get(j).get("MENU_ID").toString());
	// if(refMenuId == menuId){
	// menuMap.put("checked", 1);
	// menuMap.put("excludebutton",
	// Convert.toString(userMenuList.get(j).get("EXCLUDE_BUTTON")));
	// menuMap.put("ROLE_FLAG",userMenuList.get(j).get("ROLE_FLAG")) ;
	// break;
	// }else{
	// menuMap.put("checked", 0);
	// menuMap.put("excludebutton", "");
	// }
	// }
	// }
	// return menuTree;
	// }

	/**
	 * 获取菜单所属系统列表。
	 * 
	 * @return 符合条件的数据
	 */
	public List<Map<String, Object>> queryMenuSystem() {
		return menuDAO.queryMenuSystem();
	}

	/**
	 * 查询符合条件的角色-用户关联关系信息
	 * 
	 * @param condition 查询条件
	 * @return 符合条件的数据
	 */
	public List<Map<String, Object>> queryUserRole(Map<?, ?> condition) {
		int mguserId = SessionManager.getCurrentUserID();

		return roleDAO.queryUserRoleByMgUser(condition, mguserId, SessionManager.isCurrentUserAdmin());
	}

	/**
	 * 删除用户-角色关联关系信息
	 * 
	 * @param data 待删除数据
	 * @return 符合条件的数据
	 */
	public boolean deleteRefRole(Map<String, Object> data) {
		int userId = Integer.parseInt(String.valueOf(data.get("userId")));
		String refRoleIdsstr = String.valueOf(data.get("refRoleIds"));
		String roleIds[] = refRoleIdsstr.split(",");
		try {
			roleDAO.deleteUserRoleByRoleId(roleIds, userId);
			return true;
		} catch (Exception e) {
			LogUtils.error("删除用户-角色关联关系失败", e);
			return false;
		}
	}

	/**
	 * 进行用户-角色关联关系设置
	 * 
	 * @param data 数据格式: { add:[{roleId:,userId:,magFlag:,grandFlag:},{}...],
	 *            del:[{roleIds:"213,232,123,213,...",userId:}]
	 *            update:[{roleId:,userId:,magFlag:,grandFlag:},{}...] }
	 * @return 设置成功或失败
	 */
	public boolean refRole(Map<String, Object> data) {
		List<Map<String, Object>> addObj = null;
		Map<String, Object> delObj = null;
		// 此方法所有类型转换都为类型安全的，为消除警告，加入此注解。
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> updateObj = null;
		if (data.get("add") != null) {
			addObj = (List<Map<String, Object>>) data.get("add");
		}
		if (data.get("del") != null) {
			delObj = (Map<String, Object>) data.get("del");
		}
		if (data.get("update") != null) {
			updateObj = (List<Map<String, Object>>) data.get("update");
		}
		try {
			BaseDAO.beginTransaction();

			if (addObj != null) {// 新增的关联关系不为空，则进行增加操作
				for (int i = 0; i < addObj.size(); i++) {
					UserRolePO userRolePO = new UserRolePO();
					userRolePO.setRoleId(Integer.parseInt(addObj.get(i).get("roleId").toString()));
					userRolePO.setUserId(Integer.parseInt(addObj.get(i).get("userId").toString()));
					userRolePO.setMagFlag(Integer.parseInt(addObj.get(i).get("magFlag").toString()));
					userRolePO.setGrantFlag(Integer
							.parseInt(addObj.get(i).get("grandFlag").toString().equals("1") ? "1" : "0"));
					userDAO.insertUserRole(userRolePO);
					userRolePO = null;
				}
			}
			if (updateObj != null) {// 待修改的关联关系不为空，则进行修改操作
				for (int i = 0; i < updateObj.size(); i++) {
					UserRolePO userRolePO = new UserRolePO();
					userRolePO.setRoleId(Integer.parseInt(updateObj.get(i).get("roleId").toString()));
					userRolePO.setUserId(Integer.parseInt(updateObj.get(i).get("userId").toString()));
					userRolePO.setMagFlag(Integer.parseInt(updateObj.get(i).get("magFlag").toString()));
					userRolePO.setGrantFlag(Integer.parseInt(updateObj.get(i).get("grandFlag").toString()));
					roleDAO.updateUserRole(userRolePO);
					userRolePO = null;
				}
			}
			if (delObj != null) {// 待删除的关联关系不为空，则进行删除
				roleDAO.deleteUserRoleByRoleId(delObj.get("roleIds").toString().split(","),
						Integer.parseInt(delObj.get("userId").toString()));
			}
			BaseDAO.commit();
			return true;
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("设置用户-角色关联关系失败", e);
			return false;
		}
	}

	/**
	 * 设置用户-角色关联关系
	 * 
	 * @param data 前台JS传来的数据
	 * @return 操作成功与否
	 */
	public boolean insertRefRole(Map<String, Object> data) {
		try {
			BaseDAO.beginTransaction();
			int userId = Integer.parseInt(String.valueOf(data.get("userId")));
			// 直接新增 因为备选角色列表中已经不包含已经被关联的角色
			String refRoleIds = String.valueOf(data.get("refRoleIds"));
			String roleIds[] = refRoleIds.split(",");
			for (int i = 0; i < roleIds.length; i++) {
				UserRolePO userRolePO = new UserRolePO();
				userRolePO.setUserId(userId);
				userRolePO.setRoleId(Integer.parseInt(roleIds[i]));
				userRolePO.setGrantFlag(0);
				userRolePO.setMagFlag(0);
				userDAO.insertUserRole(userRolePO);
				userRolePO = null;
			}
			BaseDAO.commit();
			return true;
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("设置角色-用户关联关系失败", e);
			return false;
		}
	}

	/**
	 * 修改用户-角色关联关系 批量修改
	 * 
	 * @param data JS传来的数据
	 * @return 操作成功与否
	 */
	public boolean updateRefRole(Map<String, Object> data[]) {
		try {
			BaseDAO.beginTransaction();
			for (int i = 0; i < data.length; i++) {
				UserRolePO userRolePO = new UserRolePO();
				// 用户ID
				int userId = Integer.parseInt(data[i].get("userId").toString());
				userRolePO.setUserId(userId);
				// 角色ID
				int roleId = Integer.parseInt(data[i].get("roleId").toString());
				userRolePO.setRoleId(roleId);
				// 赋予权限
				boolean isGrantFlag = Boolean.parseBoolean(data[i].get("grantFlag").toString());
				if (isGrantFlag) {
					userRolePO.setGrantFlag(1);
				} else {
					userRolePO.setGrantFlag(0);
				}
				// 管理权限
				boolean isMagFlag = Boolean.parseBoolean(data[i].get("magFlag").toString());
				if (isMagFlag) {
					userRolePO.setMagFlag(1);
				} else {
					userRolePO.setMagFlag(0);
				}
				roleDAO.updateUserRole(userRolePO);
				userRolePO = null;
			}
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("设置用户-角色关联关系失败", e);
			BaseDAO.rollback();
			return false;
		}
		return true;
	}

	/**
	 * 单条修改
	 * 
	 * @param data JS传来的待修改数据
	 * @return 操作成功与否
	 */
	public boolean updateRefRoleOne(Map<String, Object> data) {
		UserRolePO userRolePO = new UserRolePO();
		// 用户ID
		int userId = Integer.parseInt(data.get("userId").toString());
		userRolePO.setUserId(userId);
		// 角色ID
		int roleId = Integer.parseInt(data.get("roleId").toString());
		userRolePO.setRoleId(roleId);
		// 赋予权限
		boolean isGrantFlag = Boolean.parseBoolean(data.get("grantFlag").toString());
		if (isGrantFlag) {
			userRolePO.setGrantFlag(1);
		} else {
			userRolePO.setGrantFlag(0);
		}
		// 管理权限
		boolean isMagFlag = Boolean.parseBoolean(data.get("magFlag").toString());
		if (isMagFlag) {
			userRolePO.setMagFlag(1);
		} else {
			userRolePO.setMagFlag(0);
		}
		try {
			roleDAO.updateUserRole(userRolePO);
		} catch (Exception e) {
			LogUtils.error("修改用户-角色关联关系失败", e);
			return false;
		}
		return true;
	}

	/**
	 * 返回当前系统当前用户列表
	 * 
	 * @param groupId
	 * @return
	 */
	public List<Map<String, Object>> getOnlineUsers(int groupId) {
		List<User> users = SessionManager.getOnlineUsers(groupId);
		List<Map<String, Object>> mapList = new ArrayList<Map<String, Object>>();
		for (User user : users) {
			Map<String, Object> um = new HashMap<String, Object>(user.getUserMap());
			HttpSession us = SessionContext.getSession(user.getSessionID());
			um.put("loginTime", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date(user.getLogInTime())));
			um.put("lastVisitedMenu",
					userDAO.getMenuAllPath(MapUtils.getIntValue(user.getLastVisitedMenu(), "menuId"), "/"));
			Object zoneObj = us.getAttribute(LoginConstant.SESSION_META_ZONE_INFO);
			if (zoneObj != null) {
				um.put("zoneName", ((Map<String, Object>) zoneObj).get("zoneName"));
			}
			Object deptObj = us.getAttribute(LoginConstant.SESSION_META_DEPT_INFO);
			if (deptObj != null) {
				um.put("deptName", ((Map<String, Object>) deptObj).get("deptName"));
			}
			Object stationObj = us.getAttribute(LoginConstant.SESSION_META_STATION_INFO);
			if (stationObj != null) {
				um.put("stationName", ((Map<String, Object>) stationObj).get("stationName"));
			}
			mapList.add(um);
		}
		return mapList;
	}

	/**
	 * 获取当前在线人数
	 * 
	 * @param groupId 系统ID
	 * @return 返回-1时，说明当前session已不在线，用户被挤
	 */
	public int getOnlineNums(int groupId) {
		if (SessionManager.isLogIn()) {
			return SessionManager.getOnlineUserCountByGroupId(groupId);
		} else {
			return -1;
		}
	}

	/**
	 * 用户关联菜单。
	 * 
	 * @param data 
	 *            addRefMenu:[{menuId:1,roleFlag:1。。}..//权限表示，1代表由原关联权限获取到的菜单，0表示完全新增的菜单
	 *            }..],新增关联的菜单 removeRefMenu：[{menuId,roleFlag}..]//删除关联的菜单。
	 *            excludeButtons:[{menuId,excludeButton:}...]//修改的排除菜单权限。
	 *            这里只对已经选中的菜单才能有排除菜单按钮权限的操作。
	 * @param userId
	 * @return
	 */
	public boolean insertRefMenu(Map<String, Object> data, int userId) {
		try {
			BaseDAO.beginTransaction();
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> addRefMenu = (List<Map<String, Object>>) data.get("addRefMenu");
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> removeRefMenu = (List<Map<String, Object>>) data.get("removeRefMenu");
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> excludeButtons = (List<Map<String, Object>>) data.get("excludeButtons");
			// 此次需要新增入库的关联菜单数据。
			List<UserMenuPO> insertRefMenus = new ArrayList<UserMenuPO>();
			// 新增菜单的MENU_ID与List中的index的映射关系
			Map<Integer, Integer> insertRefMenuIdIndexMapping = new HashMap<Integer, Integer>();
			// 此次需要删除的关联菜单ID集合，menuId,UserId
			List<UserMenuPO> deleteRefMenus = new ArrayList<UserMenuPO>();
			// 此次需要update的关联菜单ID集合，menuId,UserId,flag,excludeButton
			List<UserMenuPO> updateRefMenus = new ArrayList<UserMenuPO>();
			// 前台显示新增的关联菜单
			if (addRefMenu != null && addRefMenu.size() > 0) {
				for (Map<String, Object> addMenu : addRefMenu) {
					// roleFlag=1代表此条权限菜单在权限菜单定义中已存在，roleFlag=0代表此权限菜单在权限中未给该用户定义。
					int roleFlag = Integer.parseInt(addMenu.get("roleFlag").toString());
					UserMenuPO userMenuPO = new UserMenuPO();
					userMenuPO.setUserId(userId);
					userMenuPO.setMenuId(Integer.parseInt(addMenu.get("menuId").toString()));
					// 如果 roleFlag=1即此菜单权限中已定义，则在USER_MENU表中移除此菜单数据即具有权限。
					if (roleFlag == 1) {
						deleteRefMenus.add(userMenuPO);
					} else {
						userMenuPO.setFlag(MenuConstant.ROLE_FLAG_ADD_USER_MENU);
						insertRefMenus.add(userMenuPO);
						insertRefMenuIdIndexMapping.put(Integer.parseInt(addMenu.get("menuId").toString()),
								deleteRefMenus.size() - 1);
					}
				}
			}
			// 前台显示需要删除的关联菜单处理
			if (removeRefMenu != null && removeRefMenu.size() > 0) {
				for (Map<String, Object> removeMenu : removeRefMenu) {
					// roleFlag=1代表此条权限菜单在权限菜单定义中已存在，roleFlag=0代表此权限菜单在权限中未给该用户定义。
					int roleFlag = Integer.parseInt(removeMenu.get("roleFlag").toString());
					UserMenuPO userMenuPO = new UserMenuPO();
					userMenuPO.setUserId(userId);
					userMenuPO.setMenuId(Integer.parseInt(removeMenu.get("menuId").toString()));
					// 如果 roleFlag=1即此菜单权限中已定义，要删除此权限需在USER_MENU表中新增一条负向的菜单数据
					if (roleFlag == 1) {
						userMenuPO.setFlag(MenuConstant.ROLE_FLAG_DELETE_MENU);
						insertRefMenus.add(userMenuPO);
						insertRefMenuIdIndexMapping.put(Integer.parseInt(removeMenu.get("menuId").toString()),
								deleteRefMenus.size() - 1);
					} else { // 否则为实际删除关联菜单
						deleteRefMenus.add(userMenuPO);
					}
				}
			}
			// 前台显示已经修改了的排除按钮。
			if (excludeButtons != null && excludeButtons.size() > 0) {
				for (Map<String, Object> exclude : excludeButtons) {
					int menuId = Integer.parseInt(exclude.get("menuId").toString());
					// 如果修改的排除按钮菜单在此次要新增的数据中存在,直接修改数据中的排除按钮数据
					if (insertRefMenuIdIndexMapping.containsKey(menuId)) {
						insertRefMenus.get(insertRefMenuIdIndexMapping.get(menuId)).setExcludeButton(
								Convert.toString(exclude.get("excludeButton")));
					} else {// 如果不存在此数据，则新增一条正向的数据，采用有则新增，无则更新的策略
						UserMenuPO userMenuPO = new UserMenuPO();
						userMenuPO.setUserId(userId);
						userMenuPO.setMenuId(Integer.parseInt(exclude.get("menuId").toString()));
						userMenuPO.setExcludeButton(Convert.toString(exclude.get("excludeButton")));
						userMenuPO.setFlag(MenuConstant.ROLE_FLAG_ADD_USER_MENU);
						updateRefMenus.add(userMenuPO);
					}
				}
			}
			// 实际数据库操作
			userDAO.deleteBatchUserMenu(deleteRefMenus);
			userDAO.insertBatchUserMenu(insertRefMenus);
			userDAO.mergeInto(updateRefMenus);
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("设置用户-菜单关联关系失败", e);
			BaseDAO.rollback();
			return false;
		}
		return true;
	}

	/**
	 * 根据用户ID取得其关联的角色、菜单的字符串，以逗号分隔
	 * 
	 * @param userId 用户ID
	 * @return [0]:角色ID字符串；[1]:菜单ID字符串
	 */
	public String[] getRefRoleNamesAndMenuNames(int userId) {
		String[] returnStr = new String[2];
		returnStr[0] = userDAO.queryRefRoleNamesByUserId(userId);
		returnStr[1] = userDAO.queryRefMenuNamesByUserId(userId);
		return returnStr;
	}

	/**
	 * 组建用户信息，添加当前用户菜单
	 * 
	 * @param userName 用户姓名
	 * @param page
	 * @return 存放用户详细信息包括用户菜单
	 */
	public List<Map<String, Object>> getAllUserList(String userName, Page page) {
		if (!SessionManager.isLogIn()) {
			return null;
		}
		// 存放用户信息
		List<Map<String, Object>> userLists = new ArrayList<Map<String, Object>>();
		if (null == page) {
			page = new Page(0, 10);// 每页10行
		}
		// 如果username不为null时，表单查询功能
		if (null != userName) {
			userLists = getAllUserListByUserName(userName, page);
			return userLists;
		}
		// 保存用户信息及用户菜单MAP
		Map<String, Object> userMaps = null;
		// 获取SESSION中的保存的用户信息，主要拿到用户ID
		Object[] userArrays = SessionManager.getAllOnlineUsers().toArray();
		for (int i = 0; i < userArrays.length; i++) {
			Map<String, Object> map = (Map<String, Object>) userArrays[i];
			// 用户ID
			String userId = map.get("userId").toString();
			HttpSession sessionUser = SessionManager.getSession(Integer.parseInt(userId));
			// 获取用户菜单
			Map<String, Object> menuMap = (Map<String, Object>) sessionUser
					.getAttribute(LoginConstant.SESSION_META_MENU_VISIT_INFO);
			String menuId = menuMap.get("menuId").toString();
			String menuName = userDAO.findMenuNameByMenuId(menuId);
			List<Map<String, Object>> userList = userDAO.queryUserBySession(map, page, userId, null);
			for (int j = 0; j < userList.size(); j++) {
				userMaps = (Map<String, Object>) userList.get(j);
				userMaps.put("CURRMENU_NAME", menuName);
			}
			userLists.add(userMaps);
		}
		return userLists;
	}

	/**
	 * 组建根据用户姓名查询的结果集
	 * 
	 * @param userName
	 * @param page
	 * @return 根据用户姓名查询的结果集
	 */
	public List<Map<String, Object>> getAllUserListByUserName(String userName, Page page) {
		// 保存用户信息集合集
		List<Map<String, Object>> userLists = new ArrayList<Map<String, Object>>();
		Map<String, Object> userMaps = new HashMap<String, Object>();
		// SESSION中获取所有在线用户
		Object[] userArrays = SessionManager.getAllOnlineUsers().toArray();
		for (int i = 0; i < userArrays.length; i++) {
			Map<String, Object> map = (Map<String, Object>) userArrays[i];
			List<Map<String, Object>> list = userDAO.querUserListByUserName(map, page, userName, null);
			for (int j = 0; j < list.size(); j++) {
				userMaps = (Map<String, Object>) list.get(j);
				HttpSession sessionUser = SessionManager.getSession(Integer.parseInt((userMaps.get("USER_ID"))
						.toString()));
				Map<String, Object> menuMap = (Map<String, Object>) sessionUser
						.getAttribute(LoginConstant.SESSION_META_MENU_VISIT_INFO);
				String menuId = menuMap.get("menuId").toString();
				String menuName = userDAO.findMenuNameByMenuId(menuId);
				userMaps.put("CURRMENU_NAME", menuName);
			}
			if (null != userMaps) {
				userLists.add(userMaps);
			}
		}
		return userLists;
	}

	/**
	 * 修改用户 一般用户信息修改
	 * 
	 * @param data 表单数据
	 * @return 修改结果

	 */
	public Object modifyUserInfo(Map<String, Object> data) {
		OprResult<Integer, Object> result = null;
		Map<String, Object> condition = new HashMap<String, Object>();
		condition.put("userId", data.get("userId"));
		try {
			int number = userDAO.updateUserByUserId(data);
			result = new OprResult<Integer, Object>(null, number, OprResult.OprResultType.update);
			// 查询修改后的数据
			result.setSuccessData(userDAO.queryUserByCondition(condition, null, null));
		} catch (Exception e) {
			LogUtils.error("修改用户出错", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 密码重置
	 * 
	 * @param userId
	 * @return 修改结果
	 */
	public String initPassword(int userId) {
		try {
			BaseDAO.beginTransaction();
			String newPassword = Common.getMD5(defaultPassword.getBytes());
			userDAO.initPassWord(userId, newPassword);
			userDAO.insertUserChangeLog(new int[] { userId }, UserConstant.META_MAG_USER_CHANGE_NAME_MODIFYPAS,
					UserConstant.META_MAG_USER_EDITOR_TYPE_MANUAL, SessionManager.getCurrentUserID());
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error("重置密码失败", e);
			BaseDAO.rollback();
			return "";
		}
		return defaultPassword;
	}

	/**
	 * 获取当前SESSION保存的菜单
	 * 
	 * @return
	 */
	public List<Map<String, Object>> getUserMenuList() {
		// 获取当前用户ID
		int userId = SessionManager.getCurrentUserID();
		// 根据用户ID查询其所有菜单
		return userDAO.queryUserMenuByUserId(userId);
	}

	/**
	 * 添加菜单到收藏夹
	 * 
	 * @return
	 */
	public boolean addUserMenuFavorite(int menuId) {
		boolean flag = false;
		int userId = SessionManager.getCurrentUserID();
		// 用户ID
		// 获取用户菜单Id
		try {
			if (userDAO.queryUserMenuFavorite(userId, menuId) == 0) {
				userDAO.addUserMenuFavorite(userId, menuId);
			}
			BaseDAO.commit();
			flag = true;
		} catch (Exception e) {
			BaseDAO.rollback();
			flag = false;
		}
		return flag;
	}

	/**
	 * 根据用户ID和菜单ID删除收藏夹中的菜单
	 * 
	 * @return
	 */
	public boolean deleteUserMenu(int menuId) {
		boolean flag = false;
		int userId = SessionManager.getCurrentUserID();
		try {
			userDAO.deleteUserMenu(userId, menuId);
			BaseDAO.commit();
			flag = true;
		} catch (Exception e) {
			BaseDAO.rollback();
			flag = false;
		}
		return flag;
	}

	/**
	 * 通过渠道取数的userName查询用户id
	 * 
	 * @param cnlUserName
	 * @return
	 */
	public int queryUserIdByCnlUserName(String cnlUserName) {
		return userDAO.queryUserIdByCnlUserName(cnlUserName);
	}

	public void setUserDAO(UserDAO userDAO) {
		this.userDAO = userDAO;
	}

	public void setRoleDAO(RoleDAO roleDAO) {
		this.roleDAO = roleDAO;
	}

	public void setMenuDAO(MenuDAO menuDAO) {
		this.menuDAO = menuDAO;
	}
}
