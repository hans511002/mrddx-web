package com.ery.meta.module.mag.menu;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpSession;

import com.ery.meta.common.Common;
import com.ery.meta.module.mag.login.LoginConstant;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.Convert;


public class MenuCommon {

	/**
	 * 过滤菜单，将ROLE_FLAG=0即排除的MENU_ID过滤掉。所以，传入的参数中，必须存在键值 ROLE_FLAG用于权限的过滤
	 * 
	 * @param menus
	 * @return
	 */
	public static List<Map<String, Object>> filterMenu(List<Map<String, Object>> menus) {
		// 已被移除的菜单ID集合
		Map<Integer, Integer> removeMenuIds = new HashMap<Integer, Integer>();
		if (menus != null && menus.size() > 0) {
			for (int i = 0; i < menus.size(); i++) {
				Map<String, Object> menu = menus.get(i);
				if (menu.get("ROLE_FLAG") != null && !menu.get("ROLE_FLAG").equals("")
						&& Integer.parseInt(menu.get("ROLE_FLAG").toString()) == MenuConstant.ROLE_FLAG_DELETE_MENU) {
					Integer menuId = Integer.parseInt(menu.get("MENU_ID").toString());
					removeMenuIds.put(menuId, menuId);
				}
			}
		}
		// 再次遍历列表，删除某些需要删除的MenuId
		if (removeMenuIds.size() > 0) {
			for (int i = 0; i < menus.size(); i++) {
				Map<String, Object> menu = menus.get(i);
				Integer menuId = Integer.parseInt(menu.get("MENU_ID").toString());
				if (removeMenuIds.containsKey(menuId)) {
					menus.remove(i--);
				}
			}
		}
		return menus;
	}

	/**
	 * 替换URL中的宏变量
	 * 
	 * @param url
	 * @param rootPath:根目录
	 * @param session
	 * @return
	 */
	public static String urlMacroDeal(String url, String rootPath, HttpSession session) {
		@SuppressWarnings("unchecked")
		Map<String, Object> user = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		@SuppressWarnings("unchecked")
		Map<String, Object> zone = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_META_ZONE_INFO);
		@SuppressWarnings("unchecked")
		Map<String, Object> dept = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_META_DEPT_INFO);
		@SuppressWarnings("unchecked")
		Map<String, Object> station = (Map<String, Object>) session
				.getAttribute(LoginConstant.SESSION_META_STATION_INFO);
		String winUrl = url;
		// 检测url,如果不是以http开头的，默认是本系统路径
		if (winUrl != null && !winUrl.equals("")) {
			if (!winUrl.toLowerCase().startsWith("http://")) {
				winUrl = rootPath + "/" + winUrl;
			}
			Pattern pattern = Pattern.compile("(\\w+)=\\[(([0-9a-zA-Z]+):)?(\\w+)\\]");
			Matcher matcher = pattern.matcher(winUrl);
			while (matcher.find()) {
				try {
					if (matcher.group(3) == null || matcher.group(3).equalsIgnoreCase(LoginConstant.URL_MARCO_USER)) {
						winUrl = matcher.replaceFirst(matcher.group(1)
								+ "="
								+ URLEncoder.encode(
										Convert.toString(user.get(Common.tranColumnToJavaName(matcher.group(4)))),
										"UTF-8"));
					} else if (matcher.group(3).equalsIgnoreCase(LoginConstant.URL_MARCO_DEPT)) {
						winUrl = matcher.replaceFirst(matcher.group(1)
								+ "="
								+ URLEncoder.encode(
										Convert.toString(dept.get(Common.tranColumnToJavaName(matcher.group(4)))),
										"UTF-8"));
					} else if (matcher.group(3).equalsIgnoreCase(LoginConstant.URL_MARCO_ZONE)) {
						winUrl = matcher.replaceFirst(matcher.group(1)
								+ "="
								+ URLEncoder.encode(
										Convert.toString(zone.get(Common.tranColumnToJavaName(matcher.group(4)))),
										"UTF-8"));
					} else if (matcher.group(3).equalsIgnoreCase(LoginConstant.URL_MARCO_STATION)) {
						winUrl = matcher.replaceFirst(matcher.group(1)
								+ "="
								+ URLEncoder.encode(
										Convert.toString(station.get(Common.tranColumnToJavaName(matcher.group(4)))),
										"UTF-8"));
					}
				} catch (UnsupportedEncodingException e) {
					LogUtils.error(null, e);
				}
				matcher = pattern.matcher(winUrl);
			}
		}
		return winUrl;
	}

}
