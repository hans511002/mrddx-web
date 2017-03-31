package com.ery.meta.sys.i18n.resource;

import com.ery.meta.common.MetaBaseDAO;



public class ResourceDAO extends MetaBaseDAO{
    /**
     * 获取所以的本地化资源
     * @return
     */
    public ResourcePO[] queryAllResource(){
        String sql = "SELECT B.RESOURCE_ID,B.MENU_ID,B.RESOURCE_NAME, " +
                "B.RESOURCE_PATH,B.RESOUCE_CODE,C.MENU_NAME FROM META_SYS_I18N_RESOURCE B " +
                "LEFT JOIN META_MAG_MENU C ON B.MENU_ID=C.MENU_ID " +
                " ORDER BY B.RESOURCE_ID ASC ,C.ORDER_ID ASC ";
        return getDataAccess().queryForBeanArray(sql,ResourcePO.class);
    }
}
