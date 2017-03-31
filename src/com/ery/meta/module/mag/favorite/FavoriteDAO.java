package com.ery.meta.module.mag.favorite;

import com.ery.meta.common.Constant;
import com.ery.meta.common.MetaBaseDAO;
import com.ery.meta.common.SqlUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**

 *

 * @description 收藏夹DAO
 * @date 12-3-13
 * -
 * @modify
 * @modifyDate -
 */
public class FavoriteDAO extends MetaBaseDAO {

    public final static int TYPE_MENU = 1;//菜单
    public final static int TYPE_REPORT = 2;//报表
    public final static int TYPE_GDL = 3;//指标
    public final static int TYPE_MODEL = 4;//模型
    public final static int TYPE_OTHER = 5;//其他

    /**
     * 根据用户查询所有收藏夹
     * @param userId
     * @return
     */
    public List<Map<String,Object>> queryAllFavByUserID(int userId){
        String sql = "SELECT A.FAVORITE_ID, A.FAVORITE_NAME, A.USER_ID, A.PARENT_ID, A.FAVORITE_ORDER, A.FAVORITE_TYPE," +
                " DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN " +
                "FROM META_MAG_FAVORITE_DIR A LEFT JOIN (SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_FAVORITE_DIR GROUP BY PARENT_ID) C ON A.FAVORITE_ID=C.PARENT_ID " +
                "WHERE A.FAVORITE_ID IN(SELECT FAVORITE_ID FROM META_MAG_FAVORITE_DIR CONNECT BY PRIOR FAVORITE_ID=PARENT_ID START WITH PARENT_ID=0) " +
                "AND A.USER_ID=? " +
                "ORDER BY A.PARENT_ID,A.FAVORITE_ORDER ASC";
        return getDataAccess().queryForList(sql,userId);
    }

    /**
     * 根据用户和父目录查询子收藏夹
     * @param userId
     * @param parentId
     * @return
     */
    public List<Map<String,Object>> queryFavoritesByUserAndParent(int userId,int parentId){
        String sql = "SELECT A.FAVORITE_ID, A.FAVORITE_NAME, A.USER_ID, A.PARENT_ID, A.FAVORITE_ORDER, " +
                "A.FAVORITE_TYPE,DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_MAG_FAVORITE_DIR A " +
                //左连接查询子节点个数
                "LEFT JOIN (SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_FAVORITE_DIR GROUP BY PARENT_ID) C " +
                "ON A.FAVORITE_ID=C.PARENT_ID ";
        sql += " WHERE A.USER_ID=? AND A.PARENT_ID=?";
        return getDataAccess().queryForList(sql,userId,parentId);
    }

    /**
     * 根据用户和父目录查询子收藏夹
     * @param userId
     * @param parentId
     * @return
     */
    public List<Map<String,Object>> queryFavoritesGdlByUserAndParent(int userId,int parentId){
        String sql = "SELECT A.FAVORITE_ID, A.FAVORITE_NAME, A.USER_ID, A.PARENT_ID, A.FAVORITE_ORDER, " +
                "A.FAVORITE_TYPE,DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_MAG_FAVORITE_DIR A " +
                //左连接查询子节点个数
                "LEFT JOIN (SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_FAVORITE_DIR GROUP BY PARENT_ID) C " +
                "ON A.FAVORITE_ID=C.PARENT_ID ";
        sql += " WHERE A.USER_ID=? AND A.PARENT_ID=? AND A.FAVORITE_TYPE="+TYPE_GDL+" ORDER BY A.FAVORITE_ORDER";
        return getDataAccess().queryForList(sql,userId,parentId);
    }

    /**
     * 查询收藏夹
     * @param favoriteId
     * @return
     */
    public Map<String,Object> queryFavoriteById(int favoriteId){
        String sql = "SELECT A.FAVORITE_ID, A.FAVORITE_NAME, A.USER_ID, A.PARENT_ID, A.FAVORITE_ORDER, " +
                "A.FAVORITE_TYPE,DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_MAG_FAVORITE_DIR A " +
                //左连接查询子节点个数
                "LEFT JOIN (SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_FAVORITE_DIR GROUP BY PARENT_ID) C " +
                "ON A.FAVORITE_ID=C.PARENT_ID ";
        sql += " WHERE A.FAVORITE_ID=?";
        return getDataAccess().queryForMap(sql,favoriteId);
    }

    /**
     * 从beginID向下查，到end结束，如果end不存在或=0，则向下查一级
     * @param beginId
     * @param endId
     * @return
     */
    public List<Map<String,Object>> queryFavByBeginEndPath(int beginId,int endId){
        StringBuffer sql = new StringBuffer("SELECT A.FAVORITE_ID, A.FAVORITE_NAME, A.USER_ID, A.PARENT_ID, A.FAVORITE_ORDER, " +
                "A.FAVORITE_TYPE,DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_MAG_FAVORITE_DIR A " +
                //左连接查询子节点个数
                "LEFT JOIN (SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_FAVORITE_DIR GROUP BY PARENT_ID) C " +
                "ON A.FAVORITE_ID=C.PARENT_ID ");
        //下面的SQL用于当endId存在的时候限制查询的层级，如果endId不存在，只查询到begId下一个层级即可。用不到下面这段逻辑。
        if(endId>0){
            sql.append("WHERE A.FAVORITE_ID IN ");
            sql.append("(SELECT A.FAVORITE_ID FROM META_MAG_FAVORITE_DIR A ");
            sql.append("WHERE  LEVEL<= ");
            sql.append("(SELECT NVL(MAX(L),99999999999999) FROM (SELECT FAVORITE_ID,PARENT_ID, LEVEL L " +
                    "FROM META_MAG_FAVORITE_DIR CONNECT BY PRIOR PARENT_ID=FAVORITE_ID START WITH FAVORITE_ID="+endId+") A " +
                    "WHERE A."+(beginId== Constant.DEFAULT_ROOT_PARENT?"PARENT_ID=":"FAVORITE_ID=")+beginId+ " )"+
                    " CONNECT BY  PRIOR A.FAVORITE_ID=A.PARENT_ID START WITH "+
                    (beginId==Constant.DEFAULT_ROOT_PARENT?"PARENT_ID=":"FAVORITE_ID=")+beginId+") ");
            if(beginId==Constant.DEFAULT_ROOT_PARENT){
                sql.append("OR A.PARENT_ID ="+beginId);
            }
        }else{//如果不存在endId，指定查找其子节点数据
            sql.append("WHERE A.PARENT_ID="+beginId+" OR A.FAVORITE_ID="+beginId);
        }
        return getDataAccess().queryForList(sql.toString());
    }

    /**
     * 查询beginid下所有收藏夹
     * @param beginId
     * @return
     */
    public List<Map<String,Object>> queryAllFavForBegin(int beginId){
        String sql = "SELECT A.FAVORITE_ID, A.FAVORITE_NAME, A.USER_ID, A.PARENT_ID, A.FAVORITE_ORDER, A.FAVORITE_TYPE," +
                " DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN " +
                "FROM META_MAG_FAVORITE_DIR A LEFT JOIN (SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_FAVORITE_DIR GROUP BY PARENT_ID) C ON A.FAVORITE_ID=C.PARENT_ID " +
                "WHERE A.FAVORITE_ID IN(SELECT FAVORITE_ID FROM META_MAG_FAVORITE_DIR CONNECT BY PRIOR FAVORITE_ID=PARENT_ID START WITH PARENT_ID=?) " +
                "ORDER BY A.PARENT_ID,A.FAVORITE_ORDER ASC";
        return getDataAccess().queryForList(sql,beginId);
    }

    /**
     * 插入新收藏夹
     * @param data
     * @return 新收藏夹ID
     */
    public int insertFavorite(Map<String,Object> data){
        String sql = "INSERT INTO META_MAG_FAVORITE_DIR "
                + "(FAVORITE_ID, USER_ID, FAVORITE_NAME, PARENT_ID, FAVORITE_ORDER,FAVORITE_TYPE) "
                + "SELECT ?,?,?,?,NVL(MAX(FAVORITE_ORDER),1)+1,? FROM META_MAG_FAVORITE_DIR";
        List<Object> proParams = new ArrayList<Object>();
        long pk = queryForNextVal("SEQ_MAG_FAVORITE_DIR_ID");
        proParams.add(pk);
        if(data.containsKey("userId")) proParams.add(Integer.parseInt(String.valueOf(data.get("userId"))));
        else proParams.add(0);
        if(data.containsKey("favoriteName")) proParams.add(String.valueOf(data.get("favoriteName")));
        else proParams.add("");
        if(data.containsKey("parentId")) proParams.add(Integer.parseInt(String.valueOf(data.get("parentId"))));
        else proParams.add(0);
        if(data.containsKey("favoriteType")) proParams.add(Integer.parseInt(String.valueOf(data.get("favoriteType"))));
        else proParams.add(0);
        getDataAccess().execUpdate(sql, proParams.toArray());
        return (int)pk;
    }

    /**
     * 检查名称是否重复
     * @param favName
     * @param typeId
     * @param userId
     * @param favId
     * @return
     */
    public int checkFavoriteName(String favName,int typeId,int userId,int favId){
        String sql = "SELECT COUNT(1) FROM META_MAG_FAVORITE_DIR WHERE FAVORITE_NAME=?" +
                " AND FAVORITE_TYPE=? AND USER_ID=? AND FAVORITE_ID!=?";
        return getDataAccess().queryForInt(sql,favName,typeId,userId,favId);
    }

    /**
     * 当没有分类时，插入分类，如果存在则返回已经存在的分类ID
     * @param userId
     * @param favName
     * @param typeId
     * @return
     */
    public int insertRptFavorite(int userId,String favName,int typeId){
        String sql = "SELECT FAVORITE_ID FROM META_MAG_FAVORITE_DIR A WHERE A.USER_ID=? AND A.FAVORITE_NAME=? AND A.FAVORITE_TYPE=? ";
        int id = getDataAccess().queryForIntByNvl(sql,0,userId,favName,typeId);
        if(id==0){
            sql = "INSERT INTO META_MAG_FAVORITE_DIR "
                    + "(FAVORITE_ID, USER_ID, FAVORITE_NAME, PARENT_ID, FAVORITE_ORDER,FAVORITE_TYPE) "
                    + "SELECT ?,?,?,0,NVL(MAX(FAVORITE_ORDER),1)+1,? FROM META_MAG_FAVORITE_DIR";
            id = (int)(queryForNextVal("SEQ_MAG_FAVORITE_DIR_ID"));
            getDataAccess().execUpdate(sql,id,userId,favName,typeId);
        }
        return id;
    }

    /**
     * 修改收藏夹
     * @param data
     * @return 操作条数
     */
    public int updateFavorite(Map<String,Object> data){
        String sql = "UPDATE META_MAG_FAVORITE_DIR SET ";
        List<Object> proParams = new ArrayList<Object>();
        if(data.containsKey("userId")){
            sql += "USER_ID=?,";
            proParams.add(Integer.parseInt(String.valueOf(data.get("userId"))));
        }
        if(data.containsKey("favoriteName")){
            sql += "FAVORITE_NAME=?,";
            proParams.add(String.valueOf(data.get("favoriteName")));
        }
        if(data.containsKey("parentId")){
            int newParentId = Integer.parseInt(String.valueOf(data.get("parentId")));
            int thisId = Integer.parseInt(String.valueOf(data.get("favoriteId"))); 
            //如果涉及到修改父，需要新父是否是原来的子，防止嵌套丢失子数据
            String qsql = "SELECT FAVORITE_ID FROM META_MAG_FAVORITE_DIR CONNECT BY PRIOR FAVORITE_ID=PARENT_ID START WITH PARENT_ID=?";
            int[] subs = getDataAccess().queryForDataTable(qsql,thisId).getColAsInt(0);//查询被修改项的所有子项
            for(Integer subid : subs){
                if(subid==newParentId){
                    //修改目标节点的父，为当前节点的父
                    String updatesql = "UPDATE META_MAG_FAVORITE_DIR A SET A.PARENT_ID=(SELECT PARENT_ID FROM META_MAG_FAVORITE_DIR WHERE FAVORITE_ID=?) WHERE A.FAVORITE_ID=?";
                    getDataAccess().execUpdate(updatesql,thisId, subid);
                    break;
                }
            }
            sql += "PARENT_ID=?,";
            proParams.add(newParentId);
        }
        if(data.containsKey("favoriteOrder")){
            sql += "FAVORITE_ORDER=?,";
            proParams.add(Integer.parseInt(String.valueOf(data.get("favoriteOrder"))));
        }
        if(data.containsKey("favoriteType")){
            sql += "FAVORITE_TYPE=?,";
            proParams.add(Integer.parseInt(String.valueOf(data.get("favoriteType"))));
        }
        sql = sql.substring(0, sql.length() - 1);
        sql += " WHERE FAVORITE_ID=? ";
        proParams.add(Integer.parseInt(String.valueOf(data.get("favoriteId"))));
        return getDataAccess().execUpdate(sql, proParams.toArray());
    }

    /**
     * 删除收藏夹
     * @param ids
     * @return 操作条数
     */
    public int deleteFavorites(int[] ids){
        if (ids != null && ids.length > 0) {
            StringBuffer sql = new StringBuffer(
                    "DELETE FROM META_MAG_FAVORITE_DIR WHERE FAVORITE_ID IN (");
            for (int i = 0; i < ids.length; i++) {
                sql.append(ids[i]);
                if (i != ids.length - 1) {
                    sql.append(",");
                }
            }
            sql.append(")");
            return getDataAccess().execUpdate(sql.toString());
        } else {
            return -1;
        }
    }

    /**
     * 删除目录以及目下所有收藏对
     * @param id 目录ID
     * @param favType 目录类型
     * @param isAll 是否删除所有子目录以及相关收藏
     * @return
     */
    public int deleteFavoriteById(int id,int favType,boolean isAll){
        List<Integer> parIds = new ArrayList<Integer>();
        parIds.add(0,id);//把自己本身也插入，准备删除参数列表
        if(isAll){
            //查询所有子孙目录，删除所有子孙目录下面的收藏对象
            String subSql = "SELECT FAVORITE_ID FROM META_MAG_FAVORITE_DIR CONNECT BY PRIOR FAVORITE_ID=PARENT_ID START WITH PARENT_ID=?";
            parIds.addAll(getDataAccess().queryForPrimitiveList(subSql, Integer.class, id));
            String delSql = "";
            String condition = SqlUtils.inParamDeal(parIds.toArray());
            if(TYPE_MENU==favType){
                delSql = "DELETE FROM META_MAG_MENU_USER_FAVORITE WHERE FAVORITE_ID IN" + condition;
            }else if(TYPE_REPORT==favType){
                delSql = "DELETE FROM META_RPT_USER_FAVORITE WHERE FAVORITE_ID IN" + condition;
            }else if(TYPE_GDL==favType){
                delSql = "DELETE FROM META_GDL_USER_FAVORITE WHERE FAVORITE_ID IN" + condition;
            }else if(TYPE_MODEL==favType){

            }else if(TYPE_OTHER==favType){

            }
            getDataAccess().execUpdate(delSql);
        }
        //删除目录
        String sql = "DELETE FROM META_MAG_FAVORITE_DIR WHERE FAVORITE_ID IN"+SqlUtils.inParamDeal(parIds.toArray());
        return getDataAccess().execUpdate(sql);
    }

    /**
     * 根据条件获取收藏夹数量（应用于验证同名收藏夹等场合）
     * @param data
     * @return
     */
    public int getFavoritesNumByCondition(Map<String,Object> data){
        String sql = "SELECT COUNT(1) CNT FROM META_MAG_FAVORITE_DIR A WHERE 1=1 ";
        List<Object> proParams = new ArrayList<Object>();
        if(data.containsKey("userId")){
            sql += " AND A.USER_ID=? ";
            proParams.add(Integer.parseInt(String.valueOf(data.get("userId"))));
        }
        if(data.containsKey("favoriteName")){
            sql += " AND A.FAVORITE_NAME=? ";
            proParams.add(String.valueOf(data.get("favoriteName")));
        }
        if(data.containsKey("parentId")){
            sql += " AND A.PARENT_ID=? ";
            proParams.add(Integer.parseInt(String.valueOf(data.get("parentId"))));
        }
        if(data.containsKey("favoriteType")){
            sql += " AND A.FAVORITE_TYPE=? ";
            proParams.add(Integer.parseInt(String.valueOf(data.get("favoriteType"))));
        }
        return getDataAccess().queryForInt(sql,proParams.toArray());
    }

    /**
     * 根据条件获取收藏夹列表
     * @param data
     * @return
     */
    public List<Map<String,Object>> queryFavoritesByCondition(Map<String,Object> data){
        if(data==null || data.isEmpty()){
            return null;
        }
        String sql = "SELECT A.FAVORITE_ID, A.FAVORITE_NAME, A.USER_ID, A.PARENT_ID, A.FAVORITE_ORDER, " +
                "A.FAVORITE_TYPE,DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN FROM META_MAG_FAVORITE_DIR A " +
                //左连接查询子节点个数
                "LEFT JOIN (SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_FAVORITE_DIR GROUP BY PARENT_ID) C " +
                "ON A.FAVORITE_ID=C.PARENT_ID ";
        sql += " WHERE 1=1 ";
        List<Object> proParams = new ArrayList<Object>();
        if(data.containsKey("userId")){
            sql += " AND A.USER_ID=? ";
            proParams.add(Integer.parseInt(String.valueOf(data.get("userId"))));
        }
        if(data.containsKey("favoriteName")){
            sql += " AND A.FAVORITE_NAME=? ";
            proParams.add(String.valueOf(data.get("favoriteName")));
        }
        if(data.containsKey("parentId")){
            sql += " AND A.PARENT_ID=? ";
            proParams.add(Integer.parseInt(String.valueOf(data.get("parentId"))));
        }
        if(data.containsKey("favoriteType")){
            sql += " AND A.FAVORITE_TYPE=? ";
            proParams.add(Integer.parseInt(String.valueOf(data.get("favoriteType"))));
        }
        return getDataAccess().queryForList(sql,proParams.toArray());
    }

    /**
     * 根据条件查询 某收藏夹下 所有子收藏夹
     * @param data 条件
     * @return
     */
    public List<Map<String,Object>> queryAllFavByCondition(Map<String,Object> data){
        String sql = "SELECT A.FAVORITE_ID, A.FAVORITE_NAME, A.USER_ID, A.PARENT_ID, A.FAVORITE_ORDER, A.FAVORITE_TYPE," +
                " DECODE(NVL(C.CNT,0),0,0,1) AS CHILDREN " +
                "FROM META_MAG_FAVORITE_DIR A LEFT JOIN (SELECT PARENT_ID,COUNT(1) CNT FROM META_MAG_FAVORITE_DIR GROUP BY PARENT_ID) C ON A.FAVORITE_ID=C.PARENT_ID " +
                "WHERE A.FAVORITE_ID IN(SELECT FAVORITE_ID FROM META_MAG_FAVORITE_DIR CONNECT BY PRIOR FAVORITE_ID=PARENT_ID START WITH PARENT_ID=0) ";
        List<Object> proParams = new ArrayList<Object>();
        if(data.containsKey("userId")){
            sql += " AND A.USER_ID=? ";
            proParams.add(Integer.parseInt(String.valueOf(data.get("userId"))));
        }
        if(data.containsKey("favoriteName")){
            sql += " AND A.FAVORITE_NAME=? ";
            proParams.add(String.valueOf(data.get("favoriteName")));
        }
        if(data.containsKey("parentId")){
            sql += " AND A.PARENT_ID=? ";
            proParams.add(Integer.parseInt(String.valueOf(data.get("parentId"))));
        }
        if(data.containsKey("favoriteType")){
            sql += " AND A.FAVORITE_TYPE=? ";
            proParams.add(Integer.parseInt(String.valueOf(data.get("favoriteType"))));
        }
        sql += "ORDER BY A.PARENT_ID,A.FAVORITE_ORDER ASC";
        return getDataAccess().queryForList(sql,proParams.toArray());
    }

    /**
     * 修改收藏夹的排序值
     * @param id
     * @param ot true升，false降
     * @return
     */
    public int updateFavoriteOrder(int id,int pid,boolean ot){
        String sql = "SELECT A.FAVORITE_ID,A.FAVORITE_ORDER FROM META_MAG_FAVORITE_DIR A WHERE A.FAVORITE_ID=? " +
                "OR (A.PARENT_ID=? AND A.FAVORITE_ORDER=(SELECT "+(ot?"MAX":"MIN")+"(FAVORITE_ORDER) " +
                "FROM META_MAG_FAVORITE_DIR WHERE PARENT_ID=? " +
                "AND FAVORITE_ORDER"+(ot?"<":">")+"(SELECT FAVORITE_ORDER FROM META_MAG_FAVORITE_DIR WHERE FAVORITE_ID=?)))";
        List<Map<String,Object>> datas = getDataAccess().queryForList(sql,id,pid,pid,id);
        String updateSql = "UPDATE META_MAG_FAVORITE_DIR SET FAVORITE_ORDER=? WHERE FAVORITE_ID=?";
        if(datas.size()>1){
            int oid = 0;  //原ID
            int order = 0;//原排序ID
            int _order = 0;//交换排序ID
            List<Integer> _ids = new ArrayList<Integer>();//交换ID集
            for(Map<String,Object> map : datas){
                int mid = Integer.parseInt(String.valueOf(map.get("FAVORITE_ID")));
                int morder = Integer.parseInt(String.valueOf(map.get("FAVORITE_ORDER")));
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

}
