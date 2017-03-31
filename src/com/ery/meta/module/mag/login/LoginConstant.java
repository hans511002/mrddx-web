package com.ery.meta.module.mag.login;

import com.ery.base.support.sys.SystemVariable;


public class LoginConstant {
	/**
	 * session user信息键值
	 */
	public final static String SESSION_KEY_USER = "user";

	/**
	 * Meta系统当前日志ID信息键值。
	 */
	public final static String SESSION_META_LOGID = "loginlogId";

	// 是否渠道标示
	public final static String IS_CHANNEL = "isChannel";

	/**
	 * Meta系统当前系统信息键值。
	 */
	public final static String SESSION_META_SYSTEM_INFO = "sysInfo";

	/**
	 * 问题收集
	 */
	public final static boolean SHOW_FAQ_FLAG = SystemVariable.getBoolean("show.faq.flag", false);
	public final static String FAQ_PATH = SystemVariable.getString("show.faq.path", "");

	/**
	 * Meta系统当前用户地域信息键值
	 */
	public final static String SESSION_META_ZONE_INFO = "zoneInfo";
	/**
	 * Meta系统当前用部门信息键值
	 */
	public final static String SESSION_META_DEPT_INFO = "deptInfo";
	/**
	 * Meta系统当前用户岗位信息键值
	 */
	public final static String SESSION_META_STATION_INFO = "stationInfo";
	/**
	 * Meta菜单访问日志
	 */
	public final static String SESSION_META_MENU_VISIT_INFO = "menuvisitinfo";

	/**
	 * URL USER宏变量键值
	 */
	public final static String URL_MARCO_USER = "user";

	/**
	 * URL ZONE宏变量键值
	 */
	public final static String URL_MARCO_ZONE = "zone";

	/**
	 * URL DEPT宏变量键值
	 */
	public final static String URL_MARCO_DEPT = "dept";

	/**
	 * URL STATION宏变量键值
	 */
	public final static String URL_MARCO_STATION = "station";

	public final static String LAST_VISIT_URL_KEY = "LAST_VISIT_URL_KEY";
}
