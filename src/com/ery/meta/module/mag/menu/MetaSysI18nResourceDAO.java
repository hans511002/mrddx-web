package com.ery.meta.module.mag.menu;

import com.ery.meta.common.MetaBaseDAO;

import java.util.List;
import java.util.Map;


public class MetaSysI18nResourceDAO extends MetaBaseDAO {

    /**
     * 根据菜单ID查询对应资源
     * @param menuId
     * @return
     */
    public List<Map<String, Object>> queryByMenuId(int menuId){
        String sql = "SELECT RESOURCE_ID, MENU_ID, RESOURCE_NAME, RESOURCE_PATH,RESOUCE_CODE FROM META_SYS_I18N_RESOURCE WHERE MENU_ID="+menuId;
        return getDataAccess().queryForList(sql);
    }

    /**
     * 批量更新
     * @param menuId
     * @param resourceData
     */
    public void updateResourceInfo(int menuId, List<Map<String,String>> resourceData){
        String sql = "UPDATE META_SYS_I18N_RESOURCE SET RESOURCE_PATH=? WHERE MENU_ID=? AND RESOUCE_CODE=? ";
        String[][] para = new String[resourceData.size()][];
        for(int i=0; i < resourceData.size(); i++){
            String[] tmp = {resourceData.get(i).get("itemText"),menuId+"",resourceData.get(i).get("itemCode")};
            para[i] = tmp;
        }
        getDataAccess().execUpdateBatch(sql, para);
    }


}
