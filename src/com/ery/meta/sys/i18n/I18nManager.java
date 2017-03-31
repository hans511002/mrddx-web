package com.ery.meta.sys.i18n;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.StringUtils;
import com.ery.meta.sys.i18n.item.ItemDAO;
import com.ery.meta.sys.i18n.item.ItemPO;
import com.ery.meta.sys.i18n.resource.ResourceDAO;
import com.ery.meta.sys.i18n.resource.ResourcePO;

/**
 * @description 本地化管理类，主要用于系统自动加载本地化数据，本能动态调用。
 * @date: 12-3-31
 * @time: 上午9:42
 */

public class I18nManager {
	/**
	 * 数据库访问操作对象
	 */
	private static ItemDAO itemDAO = new ItemDAO();
	private static ResourceDAO resourceDAO = new ResourceDAO();
	/**
	 * 本地化文字信息上下文容器
	 */
	private static Hashtable<Integer, List<ItemPO>> contextItem = new Hashtable<Integer, List<ItemPO>>();
	/**
	 * 本地化资源信息上下文容器
	 */
	private static Hashtable<Integer, List<ResourcePO>> contextResource = new Hashtable<Integer, List<ResourcePO>>();

	/**
	 * 该类不允许实例化
	 */
	private I18nManager() {
	}

	/**
	 * 重新载入本地网信息,如果在此过程中发生异常,那么自动回滚到重载参数之前,此方法为线程同步。
	 */
	public synchronized static void load() {
		Hashtable<Integer, List<ItemPO>> temp1 = new Hashtable<Integer, List<ItemPO>>(contextItem);
		Hashtable<Integer, List<ResourcePO>> temp2 = new Hashtable<Integer, List<ResourcePO>>(contextResource);
		try {
			contextItem.clear();
			contextResource.clear();
			ItemPO[] itemRows = itemDAO.queryAllItem();
			ResourcePO[] resourceRows = resourceDAO.queryAllResource();
			for (ItemPO itemPO : itemRows) {
				int menuId = itemPO.getMenuId();
				List<ItemPO> itemList = null;
				if (contextItem.containsKey(menuId)) {
					itemList = contextItem.get(menuId);
				} else {
					itemList = new ArrayList<ItemPO>();
				}
				itemList.add(itemPO);
				contextItem.put(menuId, itemList);
			}
			for (ResourcePO resourcePO : resourceRows) {
				int menuId = resourcePO.getMenuId();
				List<ResourcePO> resourceList = null;
				if (contextResource.containsKey(menuId)) {
					resourceList = contextResource.get(menuId);
				} else {
					resourceList = new ArrayList<ResourcePO>();
				}
				resourceList.add(resourcePO);
				contextResource.put(menuId, resourceList);
			}
		} catch (Exception e) {
			LogUtils.error("重新载入系统本地化信息错误,系统将自动回滚!", e);
			contextItem = temp1;
			contextResource = temp2;
		} finally {
			itemDAO.close();
			resourceDAO.close();
		}

	}

	/**
	 * 根据菜单ID,获取一组本地化文字信息，如果不存在此编码类型的值则返回null
	 * 
	 * @param menuId
	 *            系统菜单ID
	 * @return 由ItemPO组成的数组对象
	 */
	public static ItemPO[] getItemByMenuId(int menuId) {
		ItemPO[] items = null;
		if (contextItem.containsKey(menuId)) {
			List<ItemPO> itemList = contextItem.get(menuId);
			items = new ItemPO[] {};
			items = itemList.toArray(items);
		}
		return items;
	}

	/**
	 * 根据菜单ID,获取一组本地化资源信息，如果不存在此编码类型的值则返回null
	 * 
	 * @param menuId
	 *            系统菜单ID
	 * @return 由ResourcePO组成的数组对象
	 */
	public static ResourcePO[] getResourceByMenuId(int menuId) {
		ResourcePO[] resources = null;
		if (contextResource.containsKey(menuId)) {
			List<ResourcePO> resourceList = contextResource.get(menuId);
			resources = new ResourcePO[] {};
			resources = resourceList.toArray(resources);
		}
		return resources;
	}

	/**
	 * 根据菜单ID,获取一组本地化文字信息，如果不存在此编码类型的值则返回null
	 * 
	 * @param menuId
	 *            系统菜单ID
	 * @return 返回所以的list 对象，list中的格式为 {key:I18n_ITEM_CODE,VALUE:VAL_TEXT};
	 */
	public static List<Map<String, String>> getItemList(int menuId) {
		List<Map<String, String>> rtnList = new ArrayList<Map<String, String>>();
		if (contextItem.containsKey(menuId)) {
			List<ItemPO> codeList = contextItem.get(menuId);
			for (ItemPO code : codeList) {
				Map<String, String> map = new HashMap<String, String>();
				map.put("name", code.getI18nItemCode());
				map.put("value", code.getValText());
				rtnList.add(map);
			}
		}
		return rtnList;
	}

	/**
	 * 根据菜单ID,获取一组本地化资源信息，如果不存在此编码类型的值则返回null
	 * 
	 * @param menuId
	 *            系统菜单ID
	 * @return 返回所以的list 对象，list中的格式为 {key:I18n_ITEM_CODE,VALUE:VAL_TEXT};
	 */
	public static List<Map<String, String>> getResourceList(int menuId) {
		List<Map<String, String>> rtnList = new ArrayList<Map<String, String>>();
		if (contextResource.containsKey(menuId)) {
			List<ResourcePO> codeList = contextResource.get(menuId);
			for (ResourcePO code : codeList) {
				Map<String, String> map = new HashMap<String, String>();
				map.put("name", code.getResouceCode());
				map.put("value", code.getResourcePath());
				rtnList.add(map);
			}
		}
		return rtnList;
	}

	/**
	 * 根据菜单ID 和code获取对应的本地化文字资源信息,如果不存在则返回null
	 * 
	 * @param menuId
	 *            菜单ID
	 * @param value
	 *            编码值
	 * @param defaultValue
	 *            默认值
	 * @return 本地化值
	 */
	public static String getItemText(int menuId, String value, String defaultValue) {
		String text = null;
		if (StringUtils.isNotEmpty(value) && contextItem.containsKey(menuId)) {
			List<ItemPO> codeList = contextItem.get(menuId);
			for (ItemPO code : codeList) {
				if (StringUtils.isNotEmpty(code.getValText()) && code.getI18nItemCode().equals(value)) {
					text = code.getValText();
					break;
				}
			}
		}
		text = (text == null) ? defaultValue : text;
		return text;
	}

	/**
	 * 根据菜单ID 和code获取对应的本地化图片资源信息地址,如果不存在则返回null
	 * 
	 * @param menuId
	 *            菜单ID
	 * @param value
	 *            编码值
	 * @param defaultValue
	 *            默认值
	 * @return 本地化值
	 */
	public static String getResourcePath(int menuId, String value, String defaultValue) {
		String path = null;
		if (StringUtils.isNotEmpty(value) && contextResource.containsKey(menuId)) {
			List<ResourcePO> codeList = contextResource.get(menuId);
			for (ResourcePO code : codeList) {
				if (StringUtils.isNotEmpty(code.getResourcePath()) && code.getResouceCode().equals(value)) {
					path = code.getResourcePath();
					break;
				}
			}
		}
		path = (path == null) ? defaultValue : path;
		return path;
	}

	/**
	 * 将所有的本地化信息销毁
	 */
	public static void clear() {
		contextItem.clear();
		contextResource.clear();
	}
}
