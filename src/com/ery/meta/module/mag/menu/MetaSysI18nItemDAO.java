package com.ery.meta.module.mag.menu;

import java.util.List;
import java.util.Map;

import com.ery.meta.common.MetaBaseDAO;

import com.ery.base.support.utils.Convert;


public class MetaSysI18nItemDAO extends MetaBaseDAO {

	/**
	 * 根据菜单ID查询对应文本
	 * 
	 * @param menuId
	 * @return
	 */
	public List<Map<String, Object>> queryByMenuId(int menuId) {
		String sql = "SELECT I18N_ITEM_ID, I18N_ITEM_CODE, MAX_LENGTH, VAL_TEXT, MENU_ID FROM META_SYS_I18N_ITEM WHERE MENU_ID="
				+ menuId;
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 批量更新
	 * 
	 * @param menuId
	 * @param itemData
	 */
	public void updateItemInfo(int menuId, List<Map<String, String>> itemData) {
		String preSql = "UPDATE META_SYS_I18N_ITEM SET VAL_TEXT=? WHERE MENU_ID=? AND I18N_ITEM_CODE=? ";
		String[][] para = new String[itemData.size()][];
		for (int i = 0; i < itemData.size(); i++) {
			String[] tmp = { itemData.get(i).get("itemText"), menuId + "", itemData.get(i).get("itemCode") };
			para[i] = tmp;
		}
		getDataAccess().execUpdateBatch(preSql, para);
	}

	/**
	 * 判断该菜单编码是否存在数据库中
	 * 
	 * @param code
	 * @param menuId
	 * @return
	 */
	public boolean isExist(String code, int menuId) {
		String sql = "select count(1) from META_SYS_I18N_ITEM where I18N_ITEM_CODE = '" + code + "' and MENU_ID = "
				+ menuId;
		return getDataAccess().queryForIntByNvl(sql, 0) > 0;
	}

	/**
	 * 批量插入本地化编码数据
	 * 
	 * @param localJSP
	 */
	public void insertCode(List<Map<String, Object>> localJSP) {
		String sql = "insert into META_SYS_I18N_ITEM(i18n_item_id, i18n_item_code, max_length, val_text, menu_id) "
				+ " VALUES(SEQ_SYS_I18N_ITEM_ID.NEXTVAL,?,100,?,? )";
		Object[][] para = new Object[localJSP.size()][];
		for (int i = 0; i < localJSP.size(); i++) {
			Object[] tmp = { Convert.toString(localJSP.get(i).get("I18N_ITEM_CODE")),
					Convert.toString(localJSP.get(i).get("VAL_TEXT")), Convert.toInt(localJSP.get(i).get("MENU_ID")) };
			para[i] = tmp;
		}
		getDataAccess().execUpdateBatch(sql, para);
	}

	/**
	 * 删除
	 * 
	 * @param code
	 * @param menuId
	 */
	public void deleteLocal(String code, int menuId) {
		String sql = "delete from META_SYS_I18N_ITEM where i18n_item_code=? and menu_id=" + menuId;
		getDataAccess().execUpdate(sql, code);
	}
}
