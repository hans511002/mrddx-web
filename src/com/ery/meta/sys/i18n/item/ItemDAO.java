package com.ery.meta.sys.i18n.item;

import com.ery.meta.common.MetaBaseDAO;



public class ItemDAO extends MetaBaseDAO{
    /**
     * 加载所以的本地化文字信息
     */
    public ItemPO[] queryAllItem(){
		String sql = "SELECT A.I18N_ITEM_ID,A.I18N_ITEM_CODE, " +
                "A.MAX_LENGTH,A.VAL_TEXT,A.MENU_ID,B.MENU_NAME FROM META_SYS_I18N_ITEM A LEFT  " +
                "JOIN META_MAG_MENU B ON A.MENU_ID=B.MENU_ID ORDER BY A.I18N_ITEM_ID ASC,B.ORDER_ID ASC ";
		return getDataAccess().queryForBeanArray(sql,ItemPO.class);
	}
}
