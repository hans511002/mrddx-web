package com.ery.meta.module.mag.favorite.menu;

import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.SqlUtils;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**

 *

 * @description 收藏菜单DAO
 * @date 12-3-29
 * -
 * @modify
 * @modifyDate -
 */
public class FavMenuDAO extends MetaBaseDAO{

    /**
     * 根据收藏夹ID查询所有收藏菜单
     * @param favId
     * @return
     */
    public List<Map<String,Object>> queryFavMenuByFavId(int favId){
        String sql = "SELECT A.MENU_FAVORITE_ID,A.MENU_ID,A.FAVORITE_ID,A.USER_ID," +
                "to_char(A.FAVORITE_MENU_TIME,'yyyy-mm-dd hh24:mi:ss') AS FAVORITE_MENU_TIME,A.FAVORITE_MENU_ORDER," +
                "B.MENU_NAME,B.MENU_URL " +
                "FROM META_MAG_MENU_USER_FAVORITE A LEFT JOIN META_MAG_MENU B ON A.MENU_ID=B.MENU_ID WHERE A.FAVORITE_ID=? " +
                "ORDER BY A.FAVORITE_MENU_ORDER ASC";
        return getDataAccess().queryForList(sql,favId);
    }

    /**
     * 根据收藏夹ID查询所有收藏菜单
     * @param favIds
     * @return
     */
    public List<Map<String,Object>> queryFavMenuByFavIds(int[] favIds){
        String sql = "SELECT A.MENU_FAVORITE_ID,A.MENU_ID,A.FAVORITE_ID,A.USER_ID," +
                "to_char(A.FAVORITE_MENU_TIME,'yyyy-mm-dd hh24:mi:ss') AS FAVORITE_MENU_TIME,A.FAVORITE_MENU_ORDER," +
                "B.MENU_NAME,B.MENU_URL " +
                "FROM META_MAG_MENU_USER_FAVORITE A LEFT JOIN META_MAG_MENU B ON A.MENU_ID=B.MENU_ID " +
                "WHERE A.FAVORITE_ID IN" + SqlUtils.inParamDeal(favIds) +
                " ORDER BY A.FAVORITE_MENU_ORDER ASC";
        return getDataAccess().queryForList(sql);
    }

    /**
     * 添加收藏菜单
     * @param data
     * @return
     */
    public int insertFavoriteMenu(Map<String,Object> data){
        String sql = "INSERT INTO META_MAG_MENU_USER_FAVORITE "
                + "(MENU_FAVORITE_ID,MENU_ID,FAVORITE_ID,USER_ID,FAVORITE_MENU_TIME,FAVORITE_MENU_ORDER) "
                + "SELECT ?,?,?,?,TO_DATE(?,'yyyy-MM-dd hh24:mi:ss'),NVL(MAX(FAVORITE_MENU_ORDER),1)+1 FROM META_MAG_MENU_USER_FAVORITE";
        List<Object> proParams = new ArrayList<Object>();
        long pk = queryForNextVal("SEQ_MAG_MENU_FAVORITE_ID");
        proParams.add(pk);
        if(data.containsKey("objId")) proParams.add(Integer.parseInt(String.valueOf(data.get("objId"))));
        else proParams.add(0);
        if(data.containsKey("favoriteType")) proParams.add(Integer.parseInt(String.valueOf(data.get("favoriteType"))));
        else proParams.add(0);
        if(data.containsKey("userId")) proParams.add(Integer.parseInt(String.valueOf(data.get("userId"))));
        else proParams.add(0);
        proParams.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));//时间
        getDataAccess().execUpdate(sql, proParams.toArray());
        return (int)pk;
    }

    /**
     * 修改收藏菜单的分类（主要是收藏分类树 拖动）
     * @param id
     * @param type
     * @return
     */
    public int updateFavoriteMenuType(int id,int type){
        String sql = "UPDATE META_MAG_MENU_USER_FAVORITE SET FAVORITE_ID=? WHERE MENU_FAVORITE_ID=?";
        return getDataAccess().execUpdate(sql,type,id);
    }

    /**
     * 返回某收藏夹某菜单数量。用于验证
     * @param menuId
     * @param userId
     * @return
     */
    public int countFavoriteMenuNum(int menuId,int userId){
        String sql = "SELECT COUNT(1) FROM META_MAG_MENU_USER_FAVORITE WHERE USER_ID=? AND MENU_ID=?";
        return getDataAccess().queryForInt(sql,userId,menuId);
    }

    /**
     * 修改收藏菜单的排序值
     * @param id
     * @param ot true升，false降
     * @return
     */
    public int updateFavoriteMenuOrder(int id,int favId,boolean ot){
        String sql = "SELECT A.MENU_FAVORITE_ID,A.FAVORITE_MENU_ORDER FROM META_MAG_MENU_USER_FAVORITE A WHERE A.MENU_FAVORITE_ID=? " +
                "OR (A.FAVORITE_ID=? AND A.FAVORITE_MENU_ORDER=(SELECT "+(ot?"MAX":"MIN")+"(FAVORITE_MENU_ORDER) " +
                "FROM META_MAG_MENU_USER_FAVORITE WHERE FAVORITE_ID=? " +
                "AND FAVORITE_MENU_ORDER"+(ot?"<":">")+"(SELECT FAVORITE_MENU_ORDER FROM META_MAG_MENU_USER_FAVORITE WHERE MENU_FAVORITE_ID=?)))";
        List<Map<String,Object>> datas = getDataAccess().queryForList(sql,id,favId,favId,id);
        String updateSql = "UPDATE META_MAG_MENU_USER_FAVORITE SET FAVORITE_MENU_ORDER=? WHERE MENU_FAVORITE_ID=?";
        if(datas.size()>1){
            int oid = 0;  //原ID
            int order = 0;//原排序ID
            int _order = 0;//交换排序ID
            List<Integer> _ids = new ArrayList<Integer>();//交换ID集
            for(Map<String,Object> map : datas){
                int mid = Integer.parseInt(String.valueOf(map.get("MENU_FAVORITE_ID")));
                int morder = Integer.parseInt(String.valueOf(map.get("FAVORITE_MENU_ORDER")));
                if(mid==id){
                    oid = mid;
                    _order = morder;
                }else{
                    _ids.add(mid);
                    order = morder;
                }
            }
            Object[][] proParamses=new Object[_ids.size()+1][2];
            proParamses[0][0] = order;
            proParamses[0][1] = oid;
            for(int x=0;x<_ids.size();x++){
                proParamses[x+1][0] = _order;
                proParamses[x+1][1] = _ids.get(x);
            }
            getDataAccess().execUpdateBatch(updateSql, proParamses);
            return 1;
        }
        return 0;
    }

    /**
     * 删除收藏菜单
     * @param id
     * @return
     */
    public int deleteFavoriteMenu(int id){
        String sql = "DELETE FROM META_MAG_MENU_USER_FAVORITE WHERE MENU_FAVORITE_ID=?";
        return getDataAccess().execUpdate(sql,id);
    }

}
