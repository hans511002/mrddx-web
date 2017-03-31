package com.ery.meta.common;

import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.utils.Convert;

public class Constant {

	/**
	 * 角色表META_MAG_ROLE中MENU_DEFAULT为1，表示对新菜单有权限
	 */
	public static final int META_MAG_ROLE_MENU_DEFAULT_ENABLE = 1;
	/**
	 * 角色表META_MAG_ROLE中MENU_DEFAULT为0，表示对新菜单无权限
	 */
	public static final int META_MAG_ROLE_MENU_DEFAULT_DISABLE = 0;
	/**
	 * 角色表META_MAG_ROLE中STATE_ENABLE为1，表示角色有效
	 */
	public static final int META_MAG_ROLE_STATE_ENABLE = 1;
	/**
	 * 角色表META_MAG_ROLE中STATE_ENABLE为0，表示角色无效
	 */
	public static final int META_MAG_ROLE_STATE_DISABLE = 0;
	/**
	 * Role-User关系表META_MAG_USER_ROLE中表示能将此角色授与他人
	 */
	public static final int META_MAG_USER_ROLE_GRANT_FLAG_ENABLE = 1;
	/**
	 * Role-User关系表META_MAG_USER_ROLE中表示不能将此角色授与他人
	 */
	public static final int META_MAG_USER_ROLE_GRANT_FLAG_DISABLE = 0;
	/**
	 * Role-User关系表META_MAG_USER_ROLE中表示对此角色有管理权限，在有角色权限菜单管理权限时有权管理此角色
	 */
	public static final int META_MAG_USER_ROLE_MAG_FLAG_ENABLE = 1;
	/**
	 * Role-User关系表META_MAG_USER_ROLE中表示对此角色无管理权限，在有角色权限菜单管理权限时无权管理此角色
	 */
	public static final int META_MAG_USER_ROLE_MAG_FLAG_DISABLE = 0;
	/**
	 * 默认的所有根节点的父节点。
	 */
	public final static int DEFAULT_ROOT_PARENT = 0;

	public final static int DEFAULT_META_SYSTEM_ID = Convert.toInt(SystemVariable.getString("defaultSystemId", "1"));

	/**
	 * 没有管理权限，
	 */
	public final static int META_MAG_USER_MAG_FLAG_NO_MAG_ROLE = 0;
	/**
	 * 只有子部门管理权限，
	 */
	public final static int META_MAG_USER_MAG_FLAG_CHILD_DEPT = 2;
	/**
	 * 只有本部门管理权限
	 */
	public final static int META_MAG_USER_MAG_FLAG_SELF_DEPT = 1;
	/**
	 * 只有子岗位管理权限
	 */
	public final static int META_MAG_USER_MAG_FLAG_CHILD_STATION = 8;
	/**
	 * 只有本岗位管理权限
	 */
	public final static int META_MAG_USER_MAG_FLAG_SELF_STATION = 4;

	/**
	 * 状态有效
	 */
	public final static int META_ENABLE = 1;

	/**
	 * 状态无效
	 */
	public final static int META_DISABLE = 0;
}
