package com.ery.meta.module.mag.zone;

import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

public class ZoneAction {
    /**
     * 数据库操作类
     */
    private ZoneDAO zoneDAO;
    /**
     * 加载Zone treeGrid树
     * @param queryData
     * @return
     */
    public List<Map<String,Object>> queryZoneTreeData(Map<String,Object> queryData){
        return zoneDAO.queryZone(queryData);
    }
    /**
     * 查询关联用户
     * 选中已有的关联用户
     * @param queryData 查询表单
     * @return 用户列表
     */
    public List<Map<String,Object>> queryRefUser(Map<String,Object> queryData, Page page){
        if(page == null){
            page=new Page(0,10);//每页10行
        }
        return zoneDAO.queryUserByCondition(queryData, page);
    }

    /**
     * 动态加载子菜单
     * @param parentId
     * @return
     */
    public List<Map<String,Object>> querySubZone(int parentId){
        return zoneDAO.querySubZone(parentId);
    }

    public void setZoneDAO(ZoneDAO zoneDAO) {
        this.zoneDAO = zoneDAO;
    }

    /**
     * 根据起始节点到结束节点之间有路径关系节点的所有数据，而不是加载从起始节点到结束节点之间所有的节点数据

     * @param beginId   起始节点
     * @param endId   结束节点
     * @return
     */
    public List<Map<String,Object>> queryZoneByPath(int beginId,int endId){
        return zoneDAO.queryZoneByBeginEndPath(beginId,endId);
    }

    /**
     * 从一个起始节点开始查询。查询出所有子地域
     * @param beginId
     * @return

     */
    public List<Map<String,Object>> queryAllZoneForBegin(int beginId){
        return zoneDAO.queryAllZoneForBegin(beginId);
    }

    /**
     * 查询地域信息
     * @param zoneId
     * @return

     */
    public Map<String,Object> queryZoneInfo(int zoneId){
        return zoneDAO.queryZoneInfo(zoneId);
    }


}
